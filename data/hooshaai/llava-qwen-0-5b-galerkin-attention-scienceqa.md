# Hooshaai/llava-qwen-0.5b-galerkin-attention-scienceqa

## Resumen

`llava-qwen-0.5b-galerkin-attention-scienceqa` es un checkpoint multimodal de tipo vision-lenguaje publicado por Hooshaai dentro del ecosistema NeuralOps. Parte del modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` (torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas con dimensión 1024) y aplica una cirugía de atención sobre 18 de sus 24 capas, sustituyendo la atención cuadrática por una variante lineal denominada `galerkin_attention` (familia `linear`, implementación Petrov-Galerkin Projection Attention).

El modelo no se entrena desde cero: es un proceso de destilación de conocimiento (knowledge distillation) sobre las capas modificadas, manteniendo congelados la torre visual, el proyector, los MLPs, los embeddings y seis capas ancla cuadráticas en los índices [3, 7, 11, 15, 19, 23]. El resultado es un artefacto de solo 147,61 MB de pesos serializados (frente a los 1,66 GB del base en FP16, un 91,3 % menos), pensado para validar la viabilidad de operadores de atención lineal en modelos multimodales pequeños.

Su relevancia es doble: por un lado, demuestra que es posible recuperar casi todo el rendimiento del profesor (62,50 % frente a 63,75 % de accuracy en ScienceQA) tras una caída severa en zero-shot (32,50 %); por otro, lo hace con un coste de entrenamiento mínimo (238 pasos, 120,5 segundos en una RTX 3090). Es un modelo de investigación, no un producto listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + decoder Qwen2) con atencion lineal Galerkin en 18/24 capas |
| Parametros totales | no disponible (base Qwen2-0.5B + SigLIP; el artefacto serializado pesa 147,61 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP16 safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16) |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón LLaVA estándar: una torre visual SigLIP de 27 capas congelada, un proyector MLP de dos capas que alinea los embeddings visuales con el espacio del lenguaje, y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y `head_dim` de 64. La intervención quirúrgica reemplaza la self-attention en 18 de las 24 capas del decodificador por `GalerkinAttention`, un operador de la familia lineal basado en proyección Petrov-Galerkin. Las seis capas restantes ([3, 7, 11, 15, 19, 23]) conservan atención cuadrática como anclas, configurando un esquema híbrido `hybrid_3_1`. También se entrenan las layer norms del decodificador.

El entrenamiento se realizó mediante destilación offline con la arquitectura de caché de representaciones de NeuralOps (§21.1), lo que permitió no mantener el profesor en VRAM (0 MB de VRAM de teacher). Se ejecutaron 238 pasos de optimización en dos etapas (91 + 147) durante 120,5 segundos en una NVIDIA GeForce RTX 3090 de 24 GB, con un pico de 17 788 MB. El dataset de evaluación y ajuste es `derek-thomas/ScienceQA`, concretamente el subconjunto STEM con imágenes de la partición de validación.

## Capacidades

- Generación de texto e imagen-a-texto conversacional (pipeline `image-text-to-text`).
- Respuesta a preguntas visuales de tipo STEM (ciencias, matemáticas elementales) sobre imágenes.
- Razonamiento multimodal de opción múltiple, orientado al formato de ScienceQA (selección de letra de opción).
- Formato de chat mediante `chat_template.json` incluido en el repositorio.
- Capacidad multilingüe limitada al inglés (`language: en`).
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico.
- No se documenta modo thinking, audio ni otras modalidades más allá de imagen y texto.

## Casos de uso

- Evaluación de operadores de atención lineal: el modelo sirve como banco de pruebas reproducible para medir el impacto de sustituir atención cuadrática por Galerkin en un VLM pequeño, con métricas de accuracy y perplejidad ya publicadas.
- Investigación en destilación de conocimiento eficiente: el pipeline de caché offline permite reproducir el ajuste en una única GPU de consumo (RTX 3090), útil para estudiar técnicas de KD con VRAM de teacher nula.
- Prototipado de asistentes educativos STEM: responde preguntas de ciencias sobre figuras en formato de opción múltiple, adecuado para demos de tutoría visual acotadas al dominio de ScienceQA.
- Benchmarking de compresión de modelos multimodales: con un artefacto de 147,61 MB frente a 1,66 GB del base, permite comparar latencia y precisión en entornos con almacenamiento o ancho de banda restringidos.
- Validación de esquemas híbridos de atención: la combinación `hybrid_3_1` con seis capas ancla cuadráticas es un caso de estudio para analizar qué capas toleran atención lineal sin degradar el rendimiento.
- Docencia y reproducción de experimentos: el repositorio incluye manifiesto quirúrgico, métricas de entrenamiento y configuración, lo que facilita replicar el experimento en cursos o laboratorios de investigación.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto STEM con imágenes, partición de validación:

| Metrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 32,50 | 62,50 | +30,00 |
| Perplejidad (PPL) | 2,45 | 5,12 | 2,10 | -3,02 |

Telemetría de entrenamiento: 238 pasos (91 + 147), 120,5 s, pico de VRAM 17 788 MB en RTX 3090, 0 MB de VRAM de teacher.

## Requisitos de hardware

- El ajuste se completó en una NVIDIA GeForce RTX 3090 (24 GB) con un pico de 17 788 MB, por lo que se necesita al menos una GPU de 24 GB para reproducir el pipeline de destilación.
- El artefacto de pesos serializado ocupa 147,61 MB en FP16; el paquete completo del repositorio es de 162,80 MB (0,2 GB según Hugging Face).
- Para inferencia, el modelo base completo (Qwen2-0.5B + SigLIP) en FP16 requiere aproximadamente 1,66 GB de pesos, por lo que cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores.
- Opciones de despliegue: la librería `neuralops` con `load_surgeried_model` es la vía documentada por el autor; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy ScienceQA (val, STEM con imagenes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-galerkin-attention-scienceqa | ~0,5B (decoder) + SigLIP | no disponible | 62,50 % | MIT | Hugging Face (NeuralOps) |
| llava-hf/llava-interleave-qwen-0.5b-hf (teacher) | ~0,5B (decoder) + SigLIP | no disponible | 63,75 % | no disponible en esta ficha | Hugging Face |
| Otros VLM pequenos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigación: el autor no declara verificación independiente de los benchmarks (`verified: false` en el model-index).
- Entrenado y evaluado únicamente sobre ScienceQA (subconjunto STEM con imágenes, validación); el rendimiento fuera de ese dominio no está caracterizado.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación inherente a modelos generativos pequeños (0,5B en el decodificador), especialmente en preguntas abiertas fuera del formato de opción múltiple.
- La cirugía de atención lineal en 18/24 capas puede degradar el modelado de dependencias de largo alcance; el propio autor documenta una caída a 32,50 % en zero-shot antes de la destilación.
- No se documentan sesgos específicos, pero al derivar de Qwen2 y SigLIP hereda los sesgos de sus datos de preentrenamiento, no caracterizados en esta ficha.
- La licencia MIT permite uso comercial, pero el modelo base y la torre visual pueden tener condiciones propias que conviene revisar antes de desplegar.
- Dependencia de la librería `neuralops` para cargar los pesos quirúrgicos; no hay garantía de compatibilidad con stacks estándar de inferencia.
- Longitud de contexto no documentada: no se debe asumir una ventana concreta en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-galerkin-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de GalerkinAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/galerkin_attention.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
