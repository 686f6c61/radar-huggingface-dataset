# cyankiwi/SenseNova-Loop-9B-QAT-HAWQ

## Resumen

SenseNova-Loop-9B-QAT-HAWQ es una cuantización de tipo QAT (quantization-aware training) del modelo multimodal SenseNova-Loop-9B, desarrollada por cyankiwi sobre el modelo base de SenseNova (OpenSenseNova). El modelo original resuelve tareas de image-text-to-text, es decir, comprensión conjunta de imágenes y texto con generación de lenguaje natural, y emplea una arquitectura de transformer con bucles (looped-transformer) más un componente denominado MHC, según las etiquetas de la model card.

El modelo base cuenta con 9.659.531.392 parámetros (aproximadamente 9,66 mil millones) y soporta inglés y chino. La versión publicada aquí aplica compresión mediante `compressed-tensors` con mezcla de precisión INT4/INT5/INT6 (QuIP) y KV cache en FP8, reduciendo el peso del repositorio a 9,6 GB. Está pensada para servirse con una bifurcación específica de vLLM que añade soporte para la arquitectura `sensenova_loop`, entrada de imágenes, MTP (multi-token prediction) y decodificación especulativa.

La relevancia de esta ficha radica en que el modelo base no está soportado por vLLM upstream y requiere un fork concreto; además, la licencia del artefacto cuantizado es una licencia comunitaria propia de cyankiwi, distinta de la Apache 2.0 del modelo original, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped-transformer con componente MHC (según etiquetas del autor); clase `sensenova_loop` |
| Parametros totales | 9.659.531.392 (~9,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (según el comando de servicio con `--max-model-len 262144`) |
| Tipos de cuantizacion | QAT con compressed-tensors: mezcla INT4/INT5/INT6 (QuIP); KV cache FP8 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | cyankiwi-community-model-license-1.0 (modelo base: Apache 2.0) |
| Formato de pesos | safetensors (compressed-tensors), requiere `trust_remote_code`/custom_code |
| Pipeline | image-text-to-text (multimodal) |
| Tamano del repositorio | 9,6 GB |
| Version del artefacto | cyankiwi 26.11.01 |
| Dataset de calibracion | cyankiwi/calibration-medium (referenciado como toncao/calibration-medium) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de transformer con bucles (looped-transformer), en la que bloques de capas se reutilizan iterativamente para incrementar la profundidad efectiva sin aumentar proporcionalmente el número de parámetros. La model card menciona además un componente MHC, aunque no se detalla su función exacta en la información disponible. El modelo es multimodal, con entrada de imágenes y texto y salida de texto, y utiliza código personalizado (`custom_code`) que debe cargarse con `trust_remote_code` en Transformers.

Sobre el entrenamiento del modelo base no se proporcionan detalles en la información disponible: no se especifican el número de tokens, la composición del dataset ni si hubo RLHF o DPO. Respecto al artefacto cuantizado, se trata de una cuantización QAT (quantization-aware training) realizada por cyankiwi con calibración sobre el dataset `cyankiwi/calibration-medium`, usando el formato `compressed-tensors` con precisión mixta INT4/INT5/INT6 y esquema QuIP. La innovación técnica destacable del despliegue es el soporte de MTP (multi-token prediction) para decodificación especulativa con un token especulativo, junto con KV cache en FP8.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Comprensión de imágenes y texto combinados (image-text-to-text): descripción, respuesta a preguntas sobre imágenes y razonamiento visual.
- Razonamiento multi-paso, con soporte de parser de razonamiento (`--reasoning-parser qwen3` en el ejemplo de servicio).
- Tool calling / function calling, con parser de herramientas (`--tool-call-parser qwen3_coder`) y `--enable-auto-tool-choice`.
- Decodificación especulativa mediante MTP (multi-token prediction) para acelerar la generación.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos o conversaciones multi-turno prolongadas.
- Capacidades multilingües limitadas a inglés y chino según la model card.

## Casos de uso

- Atención al cliente multimodal: el modelo puede gestionar conversaciones multi-turno con imágenes adjuntas (capturas, fotos de producto) y mantener contexto largo gracias a su ventana de 262.144 tokens, útil para historiales extensos de soporte.
- Análisis de documentos escaneados: extracción y razonamiento sobre formularios, facturas o informes con imágenes y texto, aprovechando la entrada image-text-to-text y el contexto largo.
- Asistentes con acceso a herramientas: integración de function calling en flujos donde el modelo decide invocar APIs (consultas a bases de datos, envío de correos) mediante el parser de herramientas configurado en vLLM.
- Automatización de soporte técnico en chino e inglés: despliegue bilingüe para mercados asiáticos y anglosajones, con respuestas coherentes en ambos idiomas.
- Razonamiento sobre imágenes en entornos de accesibilidad: generación de descripciones detalladas de imágenes y respuesta a preguntas sobre su contenido para usuarios con discapacidad visual.
- Procesamiento por lotes de contenido visual en pipelines de datos: clasificación y anotación semiautomática de imágenes con texto asociado, usando decodificación especulativa MTP para mejorar el throughput en GPU de datacenter.
- Prototipado de agentes multi-paso: el modo de razonamiento y el soporte de tool calling permiten construir agentes que planifican, consultan herramientas y sintetizan resultados sobre entradas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 9,6 GB en pesos cuantizados; con overhead de activaciones, KV cache FP8 y contexto largo, se recomienda al menos 16-24 GB de VRAM para contextos moderados, y bastante más para aprovechar los 262.144 tokens de contexto.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) y GPUs de datacenter equivalentes para servicio con vLLM; el fork de vLLM publica wheels CUDA 13.2 para Linux x86_64 y aarch64.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) para contextos cortos y sin imágenes de alta resolución, aunque no se confirma en la información disponible; para contexto máximo se requiere memoria muy superior.
- Opciones de despliegue: vLLM exclusivamente mediante el fork `cyankiwi/vllm` (rama `sensenova-loop`), que añade compressed-tensors (QuIP + INT4/5/6 mixto), KV cache FP8, entrada de imágenes y MTP sobre el PR #64832 de vLLM. No se indica soporte para llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput: no disponible; el uso de MTP con un token especulativo y KV cache FP8 sugiere mejoras de velocidad, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Despliegue |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-QAT-HAWQ (este) | ~9,66 B | 262.144 | Imagen + texto | cyankiwi-community-model-license-1.0 | vLLM fork cyankiwi |
| SenseNova-Loop-9B (base) | ~9,66 B | no disponible | Imagen + texto | Apache 2.0 | Transformers / vLLM fork |
| Alternativas de ~9-10 B multimodales | no disponible | no disponible | Imagen + texto | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento visual y respuestas sobre imágenes ambiguas.
- La licencia del artefacto cuantizado es `cyankiwi-community-model-license-1.0`, no Apache 2.0; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales respecto al modelo base.
- El modelo requiere código personalizado (`custom_code`) y `trust_remote_code` en Transformers, lo que implica ejecutar código del repositorio.
- No está soportado por vLLM upstream: requiere el fork `cyankiwi/vllm` y wheels CUDA 13.2, sin wheel CUDA 12 publicado, lo que limita entornos con CUDA 12.
- El contexto máximo de 262.144 tokens exige una cantidad de VRAM muy elevada y puede degradar la calidad en los extremos de la ventana.
- No se han publicado benchmarks del artefacto cuantizado; la pérdida de calidad respecto al modelo base por la cuantización INT4/5/6 mixta no está cuantificada.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyankiwi/SenseNova-Loop-9B-QAT-HAWQ
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Modelo base preview: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- ModelScope del modelo base: https://modelscope.cn/models/sensenova/SenseNova-Loop-9B
- Repositorio GitHub: https://github.com/OpenSenseNova/SenseNova-Loop
- Fork de vLLM: https://github.com/cyankiwi/vllm/tree/sensenova-loop
- PR de vLLM referenciado: https://github.com/vllm-project/vllm/pull/64832
- Commit base de vLLM: https://github.com/vllm-project/vllm/commit/0fda86a35419c9c70dbfada224c838c10fbb62ad
- Dataset de calibración: https://huggingface.co/datasets/toncao/calibration-medium
- Licencia del artefacto: https://huggingface.co/cyankiwi/SenseNova-Loop-9B-QAT-HAWQ/blob/main/LICENSE
- Web de cyankiwi: https://cyan.kiwi/
- Perfil de cyankiwi en Hugging Face: https://huggingface.co/cyankiwi
