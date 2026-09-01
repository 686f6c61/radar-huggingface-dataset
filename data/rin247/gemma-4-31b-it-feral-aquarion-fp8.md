# Rin247/gemma-4-31B-it-Feral-Aquarion-FP8

## Resumen

El modelo `Rin247/gemma-4-31B-it-Feral-Aquarion-FP8` es una cuantización FP8 *weight-only* del modelo `gemma-4-31B-it-Feral`, una versión modificada de `gemma-4-31B-it` de Google DeepMind. La modificación principal consiste en un proceso de *abliteration* (eliminación de la dirección de rechazo del modelo) realizado por el forjado comunitario "Genesis of Aquarion", que busca reducir las negativas injustificadas del modelo ante ciertas peticiones. La cuantización posterior se realizó con PyTorch RTN sobre CPU, almacenando escalas y formas junto a los pesos.

Este modelo resulta relevante porque permite ejecutar un LLM multimodal de 31B parámetros con menor huella de memoria (FP8 ocupa la mitad que FP16), manteniendo las capacidades del modelo base: procesamiento de texto, imagen, audio, *thinking mode* y *tool-use*. Sin embargo, el formato de pesos es *custom* (con buffers de escala y forma) y no es directamente compatible con la mayoría de los motores de inferencia estándar, por lo que requiere un paso de dequantización previo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Gemma 4 31B) |
| Parametros totales | 31.273.089.680 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 *weight-only* (RTN) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con buffers adicionales (`*.weight_scale`, `*.weight_shape`) |

## Arquitectura y entrenamiento

El modelo base `gemma-4-31B-it` es un transformer denso multimodal desarrollado por Google DeepMind que acepta entradas de texto, imagen (como secuencias de frames) y audio, y genera texto. Incorpora un modo de razonamiento (*thinking mode*) y protocolo de *tool-use*. La versión `Feral` aplica una técnica de *abliteration* mediante proyección ortogonal de la dirección de rechazo, lo que elimina o reduce los comportamientos de negativa del modelo. La cuantización FP8 se realizó con PyTorch RTN (Round-to-Nearest) en CPU, sin datos de entrenamiento adicionales ni fine-tuning. No se han publicado detalles sobre el dataset de entrenamiento del modelo original ni sobre el proceso de *abliteration* más allá de la descripción de la model card.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas (heredadas del modelo base Gemma 4).
- Procesamiento multimodal: entrada de imágenes (como secuencias de frames) y audio, con salida de texto.
- *Thinking mode*: capacidad de razonar de forma encubierta antes de responder.
- *Tool-use* / *function calling*: protocolo para invocar herramientas externas.
- Conversacional: optimizado para diálogos multi-turno.
- Comportamiento "uncensored" (abliterated): reduce las negativas injustificadas, pero también elimina los filtros de seguridad del modelo original.
- Compatible con `transformers` y `endpoints_compatible` según las etiquetas del repositorio.

## Casos de uso

- Asistentes conversacionales con moderación flexible: el modelo puede mantener diálogos largos sin rechazar peticiones que el modelo original consideraría inapropiadas, útil para entornos controlados donde se requiere una política de contenido propia.
- Análisis de imágenes y documentos visuales: al aceptar entrada de imágenes, puede extraer información de capturas, diagramas o fotografías en tareas de soporte técnico o documentación.
- Generación de código con razonamiento extendido: gracias al *thinking mode* y al *tool-use*, puede planificar y ejecutar tareas de programación complejas, integrándose en pipelines de desarrollo.
- Procesamiento de audio transcrito: aunque no se especifica el formato exacto, el modelo base acepta audio; útil para transcripción y resumen de reuniones.
- Investigación en *alignment* y seguridad de IA: al estar *abliterated*, sirve como caso de estudio para analizar el impacto de eliminar la dirección de rechazo en modelos grandes.
- Prototipado de agentes autónomos: con *tool-use* y ventana de contexto larga (si se confirma), puede gestionar flujos multi-paso con llamadas a APIs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. El modelo base `gemma-4-31B-it` tiene resultados públicos de Google, pero esta cuantización concreta no los reporta. Se recomienda realizar evaluaciones propias antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 32,7 GB, lo que sugiere que los pesos en FP8 ocupan aproximadamente 31 GB. Con overhead de escalas y buffers, se necesitan al menos 32 GB de VRAM para cargar el modelo completo en memoria.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), o configuraciones multi-GPU. Una RTX 4090 (24 GB) no es suficiente para cargar el modelo completo en FP8.
- En consumer GPU: no cabe en una sola GPU de gama alta de consumo (24 GB). Podría ejecutarse con cuantizaciones más agresivas (INT4/INT8) si se generan versiones alternativas.
- Opciones de despliegue: dado el formato *custom* con `weight_scale` y `weight_shape`, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin un paso previo de dequantización. El autor sugiere "dequantize with the matching scale/shape buffers before feeding to an inference engine". Se podría usar con `transformers` si se implementa una carga personalizada.
- Latencia y throughput: no se han publicado datos. Dependerá del hardware y del motor de inferencia tras la dequantización.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Rin247/gemma-4-31B-it-Feral-Aquarion-FP8` | 31,27B | FP8 *weight-only* | no disponible | no disponible | HuggingFace |
| `Hyper-AI/gemma-4-31B-it-fp8` | 31B | FP8 | no disponible | no disponible | HuggingFace |
| `Rin247/gemma-4-12B-it-Feral-Aquarion-INT4` | 12B | INT4 *weight-only* | no disponible | no disponible | HuggingFace |
| `Google/gemma-4-31B-it` (original) | 31B | FP16/BF16 | no disponible | Gemma Terms of Use | Google / HuggingFace |

La comparativa se limita a otras cuantizaciones del mismo modelo base, ya que no hay modelos comparables de la misma categoría (multimodal, 31B, abliterated) con datos públicos de rendimiento. La versión INT4 de 12B ofrece una alternativa para hardware más limitado, aunque con menor capacidad.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser una cuantización sin fine-tuning adicional, conserva los sesgos del modelo base. La *abliteration* puede aumentar la probabilidad de generar contenido falso o inapropiado al eliminar los mecanismos de rechazo.
- Riesgo de contenido dañino: al estar "uncensored", el modelo puede producir texto ofensivo, ilegal o peligroso si se le solicita. No debe usarse en entornos sin supervisión humana o sin filtros externos.
- Limitaciones de contexto e idiomas: no se especifica la longitud de contexto ni los idiomas soportados. El modelo base Gemma 4 soporta múltiples idiomas, pero esta versión no lo documenta.
- Restricciones de licencia: la licencia no está disponible en el repositorio. El modelo base tiene la licencia de Gemma de Google, pero la modificación *abliterated* podría violar los términos de uso de Google. Se recomienda consultar con un asesor legal antes de usar comercialmente.
- Formato de pesos *custom*: la cuantización requiere un proceso de dequantización manual que puede introducir errores si no se implementa correctamente. La compatibilidad con herramientas estándar es limitada.
- Rendimiento degradado: la cuantización FP8 puede afectar ligeramente la precisión en tareas de razonamiento complejo, aunque no hay datos cuantitativos al respecto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rin247/gemma-4-31B-it-Feral-Aquarion-FP8
- Versión INT4 del mismo autor (12B): https://huggingface.co/Rin247/gemma-4-12B-it-Feral-Aquarion-INT4
- Cuantización FP8 de Hyper-AI del mismo modelo base: https://huggingface.co/Hyper-AI/gemma-4-31B-it-fp8
- Model card oficial de Gemma 4 31B IT en NVIDIA NIM: https://build.nvidia.com/google/gemma-4-31b-it/modelcard
- Página oficial de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Receta vLLM para `Google/gemma-4-31B-it`: https://recipes.vllm.ai/Google/gemma-4-31B-it
