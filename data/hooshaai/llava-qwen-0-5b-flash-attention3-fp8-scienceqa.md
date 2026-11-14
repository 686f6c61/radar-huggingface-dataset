# Hooshaai/llava-qwen-0.5b-flash-attention3-fp8-scienceqa

## Resumen

`llava-qwen-0.5b-flash-attention3-fp8-scienceqa` es un checkpoint multimodal de tipo vision-lenguaje publicado por el usuario Hooshaai dentro del ecosistema NeuralOps, un framework de "cirugía de atención" que sustituye operadores de atención de un modelo base por implementaciones alternativas (kernel swaps) y reentrena los componentes afectados mediante destilación de conocimiento. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, un LLaVA que combina una torre visual SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024 y 16 cabezas de atención.

La modificación concreta consiste en reemplazar la atención de 18 de las 24 capas del decodificador por el operador `FlashAttention3FP8`, que ejecuta la atención en precisión FP8 (e4m3fn) con kernels de FlashAttention-3 en GPUs Hopper (SM 9.0+) y cae a SDPA nativo de PyTorch en hardware anterior o CPU. Las 6 capas restantes actúan como anclas cuadráticas y conservan la atención original. El resultado se evalúa sobre el subconjunto con imagen de ScienceQA (validación), donde el autor declara un 59,38 % de accuracy y una perplejidad de 2,10.

La relevancia del artefacto es fundamentalmente metodológica: demuestra un flujo de trabajo de sustitución de kernels con destilación sobre una única RTX 3090 (24 GB), con un artefacto serializado de solo 147,62 MB frente a los 1,66 GB del base en FP16. No obstante, conviene subrayar que se trata de un experimento de investigación con métricas no verificadas y un rendimiento absoluto por debajo del profesor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas, D=1024, H=16, head_dim=64) con atención sustituida por FlashAttention3FP8 en 18/24 capas |
| Parametros totales | no disponible (el modelo base LLaVA-Qwen-0.5B sugiere ~0,5 mil millones en el decodificador; el total exacto no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (e4m3fn) en los kernels de atención; pesos serializados en FP16 safetensors; no se declaran otros formatos (GGUF, AWQ, GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta quirúrgico FP16), más `surgical_manifest.json`, `config.json` y tokenizer asociado |

## Arquitectura y entrenamiento

El modelo conserva la topología LLaVA-Interleave: una torre visual SigLIP de 27 capas completamente congelada, un proyector multimodal MLP de dos capas también congelado y un decodificador Qwen2 de 24 capas. La intervención afecta exclusivamente a los módulos `self_attn` de 18 de esas 24 capas, que pasan a usar el operador `FlashAttention3FP8` de la familia `fast_kernels` de NeuralOps. Las capas `[3, 7, 11, 15, 19, 23]` se mantienen como anclas con atención cuadrática nativa, siguiendo un patrón híbrido 3:1. También se reentrenan los layernorms del decodificador; los MLP, embeddings y toda la parte visual quedan excluidos.

El reentrenamiento se realizó mediante destilación de conocimiento con la arquitectura de caché offline de representaciones de NeuralOps, de modo que el profesor no ocupa VRAM durante el entrenamiento. El proceso consta de 239 pasos (91 en la etapa 1 y 148 en la etapa 2), con una duración total de 120,4 segundos y un pico de 17.809 MB de VRAM en una RTX 3090. El dataset de evaluación y, presumiblemente, de ajuste es `derek-thomas/ScienceQA`, en su subconjunto con imagen. No se documentan el volumen de tokens de entrenamiento, la composición completa del corpus ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto e imagen-a-texto conversacional: responde preguntas en formato multi-turno a partir de una imagen y un enunciado textual.
- Razonamiento visual sobre contenido STEM: el ajuste está orientado a preguntas de ciencia con apoyo de diagramas e ilustraciones.
- Respuesta a preguntas de opción múltiple: el formato de ScienceQA implica seleccionar entre alternativas, capacidad que el modelo ejercita de forma directa.
- Procesamiento de imagen con preprocesador propio (`preprocessor_config.json`), integrado en el pipeline `image-text-to-text`.
- Soporte de plantilla de chat (`chat_template.json`) para formateo conversacional.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni otras modalidades adicionales.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Evaluación de técnicas de sustitución de kernels: el checkpoint sirve como referencia reproducible para medir el impacto de cambiar la atención por FlashAttention-3 en FP8 sobre un VLM pequeño, comparando contra el profesor (63,75 %) y el estado cero-shot (32,50 %).
- Prototipado de asistentes educativos STEM: con 59,38 % de accuracy en ScienceQA con imagen, es adecuado para demos internas de tutores que responden preguntas de ciencias sobre diagramas, no para producción sin supervisión.
- Investigación en destilación con caché offline: el artefacto documenta el flujo completo (239 pasos, 120 s, 17,8 GB de pico en RTX 3090) y permite replicar la metodología en otros pares profesor-alumno.
- Despliegue en entornos con VRAM muy limitada: el delta de 147,62 MB sobre un base de 1,66 GB facilita iterar en estaciones de trabajo con una sola GPU consumer.
- Pruebas de compatibilidad de kernels Hopper: útil para validar el camino FP8 de FlashAttention-3 frente al fallback SDPA en hardware pre-Hopper dentro de un pipeline controlado.
- Benchmarking de pipelines multimodales ligeros: al ser un modelo de ~0,5B en el decodificador, permite medir latencia y throughput de extremo a extremo en configuraciones de bajo coste antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Profesor (baseline) | Zero-shot previo a KD | Final tras KD | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (subconjunto con imagen, validación) | 63,75 | 32,50 | 59,38 | +26,88 |
| Perplejidad (PPL) | 2,45 | 5,12 | 2,10 | -3,02 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base LLaVA-Qwen-0.5B en FP16 ronda los 1,66 GB de pesos, por lo que la inferencia completa cabe holgadamente en GPUs consumer de 8 GB o menos.
- Los kernels FlashAttention3FP8 requieren GPU Hopper (SM 9.0+), es decir, H100 o superior, para aprovechar la aceleración FP8; en hardware anterior o CPU se produce un fallback automático a SDPA de PyTorch.
- Entrenamiento de la destilación verificado en una NVIDIA GeForce RTX 3090 (24 GB) con un pico de 17.809 MB, sin VRAM de profesor gracias a la caché offline de representaciones.
- Opciones de despliegue: la librería declarada es `neuralops`, con API `neuralops.hub.load_surgeried_model`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (decodificador) | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/llava-qwen-0.5b-flash-attention3-fp8-scienceqa` | ~0,5B (Qwen2, 24 capas) | no disponible | 59,38 % accuracy / PPL 2,10 (no verificado) | MIT | Hugging Face, 49 descargas |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B (Qwen2, 24 capas) | no disponible | 63,75 % accuracy / PPL 2,45 (según el autor) | no disponible en esta ficha | Hugging Face |
| Otros VLM pequeños de la familia LLaVA-Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de terceros no está disponible en la información proporcionada; la única referencia cuantitativa es el propio modelo base.

## Limitaciones y advertencias

- Las métricas (59,38 % de accuracy, PPL 2,10) están marcadas como no verificadas por el autor y proceden de un único subconjunto de validación de ScienceQA.
- El modelo final rinde por debajo del profesor original (59,38 % frente a 63,75 %), por lo que la sustitución de kernels introduce una pérdida de calidad medible.
- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües.
- El ajuste está fuertemente especializado en ScienceQA con imagen; el comportamiento fuera de ese dominio no está caracterizado y el riesgo de alucinación en preguntas abiertas es elevado.
- No se documentan sesgos conocidos, pero tampoco se han realizado evaluaciones de sesgo, toxicidad o robustez.
- La licencia MIT permite uso comercial, aunque el autor enlaza una licencia alternativa en el repositorio NeuralOps; conviene verificar la procedencia de los pesos base y del dataset ScienceQA antes de un despliegue comercial.
- La longitud de contexto no se declara, lo que impide planificar casos de uso con contexto largo.
- El artefacto es un delta quirúrgico que requiere cargarse junto con el modelo base mediante la API de NeuralOps; no es un checkpoint autónomo en formato estándar de transformers.
- No se declaran cuantizaciones GGUF, AWQ o GPTQ, lo que limita el despliegue en stacks convencionales de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-flash-attention3-fp8-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador FlashAttention3FP8: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/fast_kernels/flash_attention3_fp8.py
- Licencia referenciada por el autor: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
