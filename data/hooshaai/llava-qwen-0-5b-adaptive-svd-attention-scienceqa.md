# Hooshaai/llava-qwen-0.5b-adaptive-svd-attention-scienceqa

## Resumen

`Hooshaai/llava-qwen-0.5b-adaptive-svd-attention-scienceqa` es un modelo visión-lenguaje (VLM) multimodal derivado de `llava-hf/llava-interleave-qwen-0.5b-hf`. Lo publica el usuario Hooshaai dentro del ecosistema NeuralOps, un proyecto de investigación sobre "cirugía de atención" (attention surgery) que sustituye bloques de atención cuadrática estándar por operadores subcuadráticos. En concreto, 18 de las 24 capas de atención del decodificador han sido reemplazadas por `AdaptiveSVDAttention`, un mecanismo de atención multi-cabeza con descomposición en valores singulares (SVD) adaptativa y proyecciones factorizadas con conexión residual.

El modelo conserva el codificador visual SigLIP congelado y el proyector MLP de dos capas del modelo base, y ha sido destilado sobre las preguntas con imagen del dataset ScienceQA. Su relevancia es fundamentalmente experimental: sirve para medir cuánto rendimiento multimodal se pierde (y cuánto se recupera con destilación) al sustituir la atención cuadrática por una variante SVD en un VLM pequeño de 0,5B parámetros. No es un modelo de producción generalista, sino una pieza de investigación sobre eficiencia atencional.

El resultado declarado por el autor es un 40,00 % de precisión en el subconjunto visual de ScienceQA (validation) tras la destilación, frente al 31,25 % en zero-shot y al 63,75 % del modelo profesor original. El repositorio pesa 0,8 GB y contiene únicamente los pesos de atención transplantados (398,69 MB en FP16), no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal LLaVA: codificador visual SigLIP + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas con atencion `AdaptiveSVDAttention` en 18/24 bloques (patron `hybrid_3_1`) |
| Parametros totales | 0,5B (heredados del modelo base `llava-interleave-qwen-0.5b-hf`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en FP16) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 398,69 MB, FP16) |

Geometría del decodificador: 24 capas, `D=1024`, `H=16`, `d_h=64`. Capas ancla cuadráticas conservadas: `[3, 7, 11, 15, 19, 23]`.

## Arquitectura y entrenamiento

El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, una arquitectura `LlavaForConditionalGeneration` con torre visual SigLIP congelada, proyector multimodal MLP de dos capas y decodificador Qwen2 de 24 capas. La modificación consiste en una "cirugía" que reemplaza la atención estándar de 18 de los 24 bloques del decodificador por `AdaptiveSVDAttention`, manteniendo 6 capas cuadráticas como anclas en las posiciones `[3, 7, 11, 15, 19, 23]`. El patrón se denomina `hybrid_3_1`. La torre visual y el proyector permanecen completamente congelados durante todo el proceso, de modo que el experimento aísla la capacidad del mecanismo SVD para gestionar el enrutamiento cross-modal denso entre tokens visuales y de texto.

El entrenamiento es una destilación de conocimiento (KD) en dos etapas sobre las preguntas con imagen de `derek-thomas/ScienceQA`: 85 pasos en la etapa 1 y 144 en la etapa 2, con un total de 229 pasos de optimización. La ejecución completa duró 120,6 segundos con un pico de VRAM de 18.025 MB en una NVIDIA RTX 3090 de 24 GB. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset más allá de ScienceQA, ni si hubo RLHF o DPO. La innovación técnica destacable es el propio operador `AdaptiveSVDAttention`, implementado en `neuralops/layers/svd/adaptive_svd_attention.py`.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) y respuesta a preguntas visuales (VQA).
- Razonamiento visual sobre diagramas y figuras científicas, orientado al dominio de ScienceQA (ciencias naturales y escolares).
- Conversación multi-turno básica, según la etiqueta `conversational` del repositorio.
- Procesamiento de imágenes mediante el codificador SigLIP congelado y el proyector MLP.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- No se documenta modo "thinking", visión de vídeo, audio ni otras modalidades.

## Casos de uso

- Investigación sobre eficiencia atencional: el modelo sirve como banco de pruebas para medir el coste en precisión de sustituir atención cuadrática por SVD adaptativa en un VLM; se compara directamente contra el profesor de 0,5B con el mismo dataset.
- Evaluación de técnicas de destilación post-cirugía: permite reproducir el pipeline de dos etapas (85 + 144 pasos) y analizar la recuperación de precisión (+8,75 puntos) y perplejidad (-7,17) sobre ScienceQA.
- Prototipado de VQA científica de bajo coste: con 0,5B parámetros y pesos de atención de 398,69 MB, es viable en una sola GPU consumer para experimentos rápidos de respuesta a preguntas sobre figuras científicas.
- Docencia y demostraciones de arquitecturas híbridas: ilustra de forma concreta cómo conviven capas cuadráticas ancla y capas SVD en un mismo decodificador (`hybrid_3_1`).
- Base para ablaciones de atención: al publicarse solo los pesos de atención, se puede cargar sobre el modelo base y variar el patrón de cirugía para estudiar el efecto de distintas configuraciones.
- Integración en el ecosistema NeuralOps: mediante `load_surgeried_model` se puede incorporar a pipelines experimentales del proyecto para comparar operadores de la "attention zoo".

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre `derek-thomas/ScienceQA`, subconjunto con imagen, split de validación:

| Metrica | Profesor (`llava-interleave-qwen-0.5b`) | Zero-shot pre-KD (`adaptive_svd_attention`) | Post-KD destilado | Delta |
|---|---:|---:|---:|---:|
| Precision visual ScienceQA (%) | 63,75 | 31,25 | 40,00 | +8,75 |
| Perplejidad de respuesta condicionada por imagen | 2,45 | 10,22 | 3,05 | -7,17 |

Telemetría del entrenamiento: 229 pasos de optimización (85 etapa 1, 144 etapa 2), 120,6 s de duración, pico de 18.025 MB de VRAM en RTX 3090 24 GB, marca temporal 2026-11-11T04:47:11Z.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el modelo base de 0,5B en FP16 requiere del orden de 1-2 GB para pesos, más overhead del codificador SigLIP y del contexto visual. El entrenamiento consumió 18.025 MB en una RTX 3090.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en FP16; el autor validó el entrenamiento en NVIDIA RTX 3090 de 24 GB.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes.
- Opciones de despliegue: la librería declarada es `neuralops` (carga vía `neuralops.hub.load_surgeried_model`); también es posible cargar manualmente con `transformers` (`LlavaForConditionalGeneration`) aplicando `apply_qwen_attention_surgery` y cargando `attention_weights.safetensors`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA visual (val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `Hooshaai/llava-qwen-0.5b-adaptive-svd-attention-scienceqa` | 0,5B | no disponible | 40,00 % | MIT | Hugging Face (solo pesos de atención) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5B | no disponible | 63,75 % | no disponible en la información | Hugging Face |
| Variante zero-shot `adaptive_svd_attention` (pre-KD) | 0,5B | no disponible | 31,25 % | MIT | Derivada del mismo repositorio |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Precisión muy inferior al profesor: 40,00 % frente a 63,75 % en ScienceQA visual; una caída de 23,75 puntos que limita su uso fuera de investigación.
- Solo se publican los pesos de atención (`attention_weights.safetensors`); es imprescindible cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` por separado y aplicar la cirugía de atención antes de cargar los pesos.
- El repositorio declara `library_name: neuralops`, una librería no estándar; la integración con `transformers` requiere el script `apply_qwen_attention_surgery` del proyecto NeuralOps.
- Idioma limitado al inglés; no hay soporte multilingüe documentado.
- Dominio restringido a ScienceQA (ciencias escolares); no se ha evaluado en otros benchmarks ni tareas generales.
- Riesgo de alucinación no cuantificado; al ser un modelo de 0,5B destilado con 229 pasos, la fiabilidad factual es baja.
- Sesgos no documentados por el autor.
- Resultados de benchmarks no verificados (`verified: false` en el model-index); deben tomarse como declaraciones del autor.
- La licencia MIT se aplica al repositorio, pero conviene verificar la licencia del modelo base antes de uso comercial.
- No se documenta longitud de contexto, por lo que no se puede garantizar el manejo de conversaciones o documentos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-adaptive-svd-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación `AdaptiveSVDAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/adaptive_svd_attention.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
