# Hooshaai/llava-qwen-0.5b-hybrid-local-kernel-scienceqa

## Resumen

`llava-qwen-0.5b-hybrid-local-kernel-scienceqa` es un checkpoint multimodal derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante técnicas de "cirugía de atención" (attention surgery) y destilación de conocimiento, empaquetado dentro del ecosistema NeuralOps. Lo publica el usuario Hooshaai y sustituye la atención cuadrática estándar en 18 de las 24 capas del decodificador Qwen2 por un operador híbrido denominado `HybridLocalKernelAttention`, manteniendo seis capas de anclaje cuadráticas. El objetivo declarado es reducir el tamaño del artefacto de pesos (de 1,66 GB a 62,84 MB, un 96,3 % menos) conservando una fracción del rendimiento del modelo profesor.

El modelo base combina una torre visual SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 0,5 mil millones de parámetros, lo que lo sitúa en la gama ultra-ligera de modelos visión-lenguaje. Se ha evaluado en el subconjunto con imagen de ScienceQA (validación), una tarea de razonamiento STEM multimodal, donde declara una precisión del 31,25 % frente al 63,75 % del profesor original.

Su relevancia es fundamentalmente metodológica: sirve como demostración reproducible de cómo aplicar atención lineal/híbrida sobre un VLM existente y serializar únicamente los deltas quirúrgicos, más que como modelo listo para producción. La licencia MIT y el reducido tamaño del artefacto facilitan experimentación rápida en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM híbrido: torre visual SigLIP + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas, con atención `HybridLocalKernelAttention` en 18/24 capas |
| Parámetros totales | 0,5 mil millones (modelo base); el artefacto publicado contiene solo deltas quirúrgicos |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en FP16 safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16) + `surgical_manifest.json` |
| Dimensión del modelo | D=1024, H=16 cabezas, head_dim=64 |
| Capas modificadas | 18/24 (esquema `hybrid_3_1`) |
| Capas de anclaje cuadráticas | 6 ([3, 7, 11, 15, 19, 23]) |
| Componentes congelados | SigLIP `vision_tower.*` (27 capas), `multi_modal_projector.*`, MLPs, embeddings |
| Tamaño del artefacto | 62,84 MB (65.895.280 bytes); paquete total 78,05 MB |
| Librería | `neuralops` |

## Arquitectura y entrenamiento

La arquitectura parte del VLM LLaVA-Interleave con backbone Qwen2 de 0,5B: una torre visual SigLIP de 27 capas procesa la imagen, un proyector MLP de dos capas la alinea con el espacio del decodificador, y el decodificador Qwen2 de 24 capas genera la respuesta. La intervención quirúrgica reemplaza el mecanismo de self-attention en 18 de esas 24 capas por `HybridLocalKernelAttention`, un operador de la familia `hybrid` que combina atención local con kernels, dejando seis capas con atención cuadrática completa como anclas (índices 3, 7, 11, 15, 19 y 23). El esquema se etiqueta internamente como `hybrid_3_1`.

El entrenamiento se realizó mediante destilación de conocimiento offline con caché de representaciones (NeuralOps Offline Representation Caching Architecture, §21.1), lo que permite no cargar el profesor en VRAM de GPU (0 MB de VRAM del profesor). Se ejecutaron 88 pasos de optimización (29 en la etapa 1, 59 en la etapa 2) en una NVIDIA GeForce RTX 3090 de 24 GB, con un pico de 17.124 MB de VRAM y una duración total de 121,3 s. Se entrenaron las atenciones modificadas y los layernorms del decodificador; el resto de componentes quedó congelado. La serialización es determinista y solo persiste los deltas quirúrgicos más los ficheros de configuración y tokenizador.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) para preguntas y respuestas visuales.
- Razonamiento multimodal básico sobre figuras STEM (el dominio de entrenamiento es ScienceQA).
- Respuesta a preguntas de opción múltiple sobre imágenes, con formato de respuesta por letra.
- Conversación de un solo turno con plantilla de chat (`chat_template.json` incluido).
- Procesamiento de imágenes mediante preprocesador SigLIP (`preprocessor_config.json`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Modo thinking, visión adicional o audio: no disponible (solo visión + texto).

## Casos de uso

- Investigación en eficiencia de atención: sirve para reproducir el pipeline de sustitución de atención cuadrática por operadores híbridos sobre un VLM existente y medir la degradación resultante; el artefacto de 62,84 MB permite iterar en una sola GPU de consumo.
- Docencia y experimentación académica: al ser un delta pequeño con manifiesto quirúrgico explícito (`surgical_manifest.json`), es adecuado para que estudiantes inspeccionen qué capas se modificaron y comparen su comportamiento con el modelo base.
- Pruebas de destilación de conocimiento: el flujo con caché offline de representaciones (0 MB de VRAM del profesor) es replicable como referencia para destilar VLMs en hardware limitado.
- Evaluación comparativa de operadores de atención: el zoo NeuralOps permite contrastar `hybrid_local_kernel` con otros operadores sobre el mismo base y dataset, usando ScienceQA como vara de medir.
- Prototipado de asistentes visuales de bajo coste en inglés: para demos internas donde la precisión no es crítica y se prioriza un artefacto mínimo, aunque con la advertencia de su baja exactitud (31,25 %).
- Integración en pipelines de investigación con `neuralops.hub.load_surgeried_model`: carga programática del checkpoint quirúrgico para experimentos de ablación sobre la torre visual congelada y el proyector.

## Benchmarks y rendimiento

| Métrica | Profesor (baseline) | Zero-shot (pre-KD) | Final (post-KD) | Delta |
|---|---:|---:|---:|---:|
| Accuracy ScienceQA (subconjunto con imagen, validación), % | 63,75 | 31,25 | 31,25 | +0,00 |
| Perplexity (PPL) | 2,45 | — | — | — |

Los resultados son los declarados por el autor en el model-index (`verified: false`). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible. El delta de destilación es nulo: el entrenamiento no recuperó precisión respecto al estado zero-shot tras la cirugía de atención.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto pesa 62,84 MB, pero requiere cargar el modelo base LLaVA-Qwen-0.5B (1,66 GB en FP16) más el delta; en FP16 la inferencia completa ronda los 2-3 GB de VRAM.
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM; el autor entrenó y evaluó en una NVIDIA GeForce RTX 3090 (24 GB) con un pico de 17.124 MB durante el entrenamiento.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: la vía documentada es `neuralops.hub.load_surgeried_model`; no se indica soporte nativo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. El entrenamiento completo tardó 121,3 s en 88 pasos sobre RTX 3090, dato no extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (hybrid_local_kernel) | 0,5B | no disponible | 31,25 % | MIT | Hugging Face (neuralops) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5B | no disponible | 63,75 % | no disponible en la información | Hugging Face |
| Otros operadores del zoo NeuralOps | 0,5B | no disponible | no disponible | MIT (presumible por el zoo) | Hugging Face |

La única comparación con datos es contra el modelo base, que duplica la precisión del checkpoint quirúrgico. No se dispone de cifras de otros VLMs de 0,5B en la información proporcionada.

## Limitaciones y advertencias

- Degradación severa de precisión: 31,25 % frente al 63,75 % del profesor, sin recuperación tras la destilación (delta +0,00 %).
- El artefacto publicado contiene solo los deltas quirúrgicos; no es un modelo autónomo y requiere el base `llava-hf/llava-interleave-qwen-0.5b-hf` y la librería `neuralops` para funcionar.
- Solo inglés; sin soporte multilingüe declarado.
- Entrenado y evaluado únicamente en ScienceQA; el dominio fuera de preguntas STEM visuales no está validado.
- Riesgo de alucinación elevado por el tamaño (0,5B) y la baja exactitud medida.
- Resultados de benchmark no verificados (`verified: false`); el autor los declara sin validación externa independiente.
- Sin datos sobre sesgos, contexto máximo, cuantizaciones ni soporte en frameworks de despliegue estándar.
- Licencia MIT permite uso comercial, pero la calidad medida desaconseja producción sin evaluación adicional.
- El nombre del repositorio en el ejemplo de carga (`tahamajs/...`) difiere del ID real (`Hooshaai/...`); conviene verificar la ruta antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-hybrid-local-kernel-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/hybrid_local_kernel_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
