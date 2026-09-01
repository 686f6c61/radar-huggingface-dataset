# fleetml/Qwen3.8-27B-Uncensored-NVFP4-RTX5090

## Resumen

Este modelo es una cuantización NVFP4 (NVIDIA ModelOpt) del checkpoint `orcarouter/Qwen3.8-27B-Uncensored`, una versión "abliterated" (con las direcciones de rechazo eliminadas) del modelo oficial `Qwen/Qwen3.8-27B`. El resultado es un modelo de visión-lenguaje de 27B parámetros optimizado específicamente para la GPU NVIDIA RTX 5090 (arquitectura Blackwell), con un perfil de memoria que cabe en sus 32 GB de VRAM y una velocidad de decodificación muy superior a la del modelo original gracias a la decodificación especulativa nativa (MTP) y al drafter DSpark opcional.

La relevancia de este checkpoint radica en que permite ejecutar localmente, en una GPU de consumo, un modelo multimodal de 27B con ventana de contexto de hasta 65 536 tokens (con un pool activo optimizado de 16 384) y alcanzar tasas de generación de hasta 139 tokens por segundo en una sola RTX 5090. Está pensado para investigación, evaluación y desarrollo de agentes en entornos controlados, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (híbrida: Gated DeltaNet lineal + atención completa, visión-lenguaje) |
| Parametros totales | 27B (modelo base); 15 617 946 352 parámetros almacenados en el checkpoint NVFP4 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Máximo de arquitectura: 262 144 tokens; perfil de lanzamiento en RTX 5090: 65 536; pool activo optimizado: 16 384 |
| Tipos de cuantizacion | NVFP4 (ModelOpt), con drafter BF16 opcional (DSpark) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (ModelOpt NVFP4) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` emplea una arquitectura híbrida que combina atención lineal Gated DeltaNet con capas de atención completa, lo que reduce el coste computacional en contextos largos. Incluye un módulo de visión (image-text-to-text) y una cabeza MTP (Multi-Token Prediction) para decodificación especulativa. El checkpoint `orcarouter/Qwen3.8-27B-Uncensored` aplica una técnica de abliteration que elimina la dirección de rechazo del modelo, reduciendo las negativas a peticiones dañinas. Sobre ese checkpoint, `fleetml` ha aplicado cuantización NVFP4 con NVIDIA ModelOpt (versión `0.47.0.dev70`), calibrada con 126 conversaciones del dataset UltraChat. El resultado conserva los tensores MTP nativos y se distribuye junto con un drafter DSpark en BF16 para acelerar la decodificación especulativa.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas, con control flexible del modo "thinking" (razonamiento explícito opcional).
- Comprensión de imágenes (entrada multimodal image-text-to-text).
- Soporte de tool calling y function calling.
- Capacidad para tareas de agente multi-paso con decodificación especulativa (MTP nativo y DSpark).
- Multilingüe en inglés y chino.
- Decodificación especulativa integrada: MTP nativo (profundidad 5) y drafter DSpark opcional, con aceleraciones de 1.97x y 2.79x respectivamente frente a decodificación estándar.

## Casos de uso

- Inferencia local de alta velocidad en RTX 5090: el modelo está calibrado para esta GPU, permitiendo ejecutar un modelo de 27B multimodal a más de 130 tokens por segundo con el drafter DSpark, ideal para prototipado y desarrollo de agentes en local.
- Investigación en alineación y seguridad: al ser una versión "uncensored", es útil para estudiar el comportamiento de modelos sin mecanismos de rechazo, siempre en entornos controlados y con supervisión.
- Desarrollo de aplicaciones de visión-lenguaje: puede procesar imágenes y texto simultáneamente, por ejemplo para descripción de imágenes, respuesta a preguntas visuales o generación de contenido multimodal.
- Evaluación de cuantización NVFP4: sirve como referencia para medir el impacto de la cuantización en la calidad de salida frente al modelo BF16 original, especialmente en tareas de razonamiento y generación de código.
- Despliegue de chatbots conversacionales en inglés y chino: con su ventana de contexto de 65 536 tokens, puede mantener conversaciones largas y manejar historiales extensos.
- Integración en pipelines de generación de código con tool calling: soporta function calling, lo que permite conectarlo a APIs y herramientas externas en flujos de desarrollo asistido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye mediciones de rendimiento de inferencia en una RTX 5090 (concurrencia 1, temperatura 0, determinista, KV cache FP8 E4M3):

| Perfil | Mediana de decodificación | Aceleración frente a estándar |
| --- | ---: | ---: |
| Decodificación estándar | 50.74 tokens/s | 1.00x |
| MTP nativo (profundidad 5) | 98.22 tokens/s | 1.97x |
| DSpark (target-matched) | 139.32 tokens/s | 2.79x |

El perfil completo de 16K contexto consume aproximadamente 29.39 GB de memoria GPU, dejando 3.22 GB libres en la RTX 5090.

## Requisitos de hardware

- GPU recomendada: NVIDIA RTX 5090 (32 GB VRAM, arquitectura Blackwell). La cuantización NVFP4 está optimizada para esta generación.
- VRAM estimada: ~29.39 GB para el perfil de 16K tokens (incluye carga del target NVFP4, drafter DSpark, caché, buffers y captura de CUDA graphs). Sin drafter, el target NVFP4 ocupa 18.80 GB.
- GPU de consumo: cabe en RTX 5090; en GPUs de generaciones anteriores (RTX 4090, etc.) la cuantización NVFP4 puede no ser compatible o requerir conversión.
- Opciones de despliegue: SGLang (runtime recomendado, con soporte nativo para ModelOpt FP4 y DSpark), vLLM (con soporte para cuantización NVFP4 en Blackwell), y potencialmente llama.cpp si se convierte a GGUF (aunque el formato NVFP4 es específico de ModelOpt).
- Latencia y throughput: los valores medidos se indican en la sección de benchmarks (50.74 a 139.32 tokens/s según el perfil de decodificación).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
| --- | --- | --- | --- | --- | --- |
| `fleetml/Qwen3.8-27B-Uncensored-NVFP4-RTX5090` | 27B | 65 536 (perfil RTX 5090) | NVFP4 (ModelOpt) | Apache 2.0 | Abliterated, optimizado para RTX 5090, con MTP y DSpark |
| `orcarouter/Qwen3.8-27B-Uncensored` | 27B | 262 144 (máx.) | BF16 | Apache 2.0 | Abliterated, sin cuantizar, requiere más VRAM |
| `unsloth/Qwen3.8-27B-NVFP4` | 27B | 262 144 (máx.) | NVFP4 | Apache 2.0 | Cuantización NVFP4 sin abliteration, orientada a despliegue general |
| `johnnyeric/Qwen3.8-27B-Uncensored-NVFP4` | 27B | 262 144 (máx.) | NVFP4 + FP8 | Apache 2.0 | Abliterated, con precisión mixta dinámica |

La comparativa se basa en las características declaradas en las respectivas model cards; no se dispone de benchmarks comparativos independientes.

## Limitaciones y advertencias

- Modelo "uncensored": se han eliminado los mecanismos de rechazo de contenido dañino, por lo que puede generar respuestas inapropiadas, ofensivas o peligrosas. Su uso debe limitarse a investigación controlada y cumpliendo la legislación aplicable.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo o con datos no vistos.
- Cuantización NVFP4: la precisión reducida puede degradar ligeramente la calidad de las respuestas frente al modelo BF16 original, especialmente en tareas numéricas o de razonamiento largo.
- Limitaciones de idioma: solo soporta inglés y chino; no está entrenado para otros idiomas.
- Dependencia de hardware específico: la cuantización NVFP4 está optimizada para RTX 5090 (Blackwell); en otras GPUs puede no funcionar o requerir conversión adicional.
- Restricciones de uso: la licencia Apache 2.0 permite uso comercial, pero el autor recomienda un uso responsable y controlado, especialmente por la naturaleza "uncensored" del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fleetml/Qwen3.8-27B-Uncensored-NVFP4-RTX5090
- Modelo base (abliterated): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DSpark asociado: https://huggingface.co/fleetml/Qwen3.8-27B-Uncensored-DSpark-RTX5090
- Variante similar (johnnyeric): https://huggingface.co/johnnyeric/Qwen3.8-27B-Uncensored-NVFP4
- Variante NVFP4 de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Página de NanoGPT sobre el modelo: https://nano-gpt.com/models/text/qwen/qwen3.8-27b-uncensored
- Build de Ollama de orcarouter: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
