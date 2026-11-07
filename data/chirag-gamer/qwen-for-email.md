# chirag-gamer/qwen-for-email

## Resumen

qwen-for-email es un ajuste fino del modelo Qwen3-0.6B de Alibaba, desarrollado por el usuario chirag-gamer, orientado a tareas de correo electrónico profesional: redacción de respuestas, resumen de hilos de conversación, generación de asuntos, reescritura y clasificación. El modelo parte de una arquitectura transformer densa de 596 millones de parámetros y se distribuye como adaptador LoRA sobre el modelo base, además de en formato GGUF para su uso con llama.cpp.

La propuesta diferencial del modelo es el razonamiento breve: mientras que Qwen3-0.6B base consume entre 167 y 185 tokens de pensamiento por respuesta, este ajuste genera un plan de una o dos frases y responde de inmediato, empleando entre 13 y 20 tokens de razonamiento. Según el autor, esta reducción del coste de decodificación viene acompañada de mejoras en las métricas de solapamiento con referencias en tareas de resumen y generación de asuntos.

El modelo se entrenó mediante destilación de un profesor Qwen3.8-27B-FP8 autoalojado y un ajuste QLoRA sobre un corpus de correos de Enron y otros conjuntos de datos de correo electrónico. Su relevancia práctica reside en la posibilidad de ejecutar un asistente de correo local en hardware de consumo (incluso CPU), con licencia Apache-2.0 y sin dependencia de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (Q4_K_M empleado en la evaluacion); adaptador LoRA en fp16 |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA en `adapter.zip`), GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer denso Qwen3-0.6B mediante QLoRA con rango 32, alpha 64, aplicado a las siete proyecciones lineales, con learning rate 1e-4 y programación coseno durante 2 épocas, batch efectivo de 32 y NEFTune con alpha 5. El entrenamiento se realizó en una Kaggle Tesla T4 con Unsloth y pesos en fp16. La pérdida de entrenamiento descendió de 2,13 a 1,00, y la pérdida de evaluación en el conjunto reservado pasó de 1,077 a 1,045.

El proceso consta de dos fases. Primero, un preentrenamiento adaptativo al dominio con 40.000 correos de Enron de dominio público (una época, modelado de lenguaje plano). Después, una fase de destilación sobre 18.115 filas: un profesor Qwen3.8-27B-FP8 puntuó la calidad de cada candidato recolectado con una rúbrica estricta en lotes de 40 y generó objetivos de tipo PLAN y ANSWER para los que superaron el filtro. Las fuentes de datos incluyen `corbt/enron-emails` (dominio público), `xprilion/email-summary-dataset` (MIT), pares de respuesta de los correos de Clinton (CC BY 4.0, DOI 10.5281/zenodo.16789803), `HuggingFaceTB/smoltalk` y conjuntos sintéticos de correo y soporte con licencias Apache-2.0, MIT, CC-BY y CC0. Todo el texto se enmascaró para datos personales antes del entrenamiento, sustituyendo direcciones de correo, teléfonos, URL y secuencias largas de dígitos por marcadores `[[EMAIL]]`, `[[PHONE]]`, `[[URL]]` e `[[ID]]`.

## Capacidades

- Generación de texto conversacional con formato ChatML estándar de Qwen3.
- Resumen de hilos de correo electrónico con salida lista para usar.
- Generación de líneas de asunto a partir del contenido del mensaje.
- Redacción de respuestas profesionales de correo.
- Reescritura y clasificación de mensajes de correo.
- Razonamiento breve integrado: un bloque de plan de una o dos frases seguido de la respuesta, con un consumo de 13 a 20 tokens de pensamiento.
- Compatibilidad con llama.cpp, llama-cpp-python, Ollama, LM Studio, Jan y cualquier fork de llama.cpp a través del GGUF.
- Carga mediante transformers aplicando el adaptador LoRA sobre Qwen3-0.6B.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Asistente de correo local en aplicaciones de escritorio: el modelo puede integrarse en un cliente de correo para redactar respuestas y resumir hilos en el propio dispositivo, sin enviar contenido a la nube, gracias a su tamaño reducido y su formato GGUF ejecutable en CPU.
- Resumen automático de hilos largos: adecuado para bandejas de entrada con conversaciones de varios mensajes, donde el modelo condensa el contenido en pocas líneas con un coste de decodificación bajo (unos 20 tokens de pensamiento).
- Sugerencia de asuntos: generación de líneas de asunto a partir del cuerpo del mensaje, con un ROUGE-L de 0,382 en el corpus Enron reservado, útil en interfaces de composición de correo.
- Redacción de respuestas profesionales: borradores de contestación a partir del mensaje recibido, pensados para revisión humana antes del envío; el autor recomienda validar el comportamiento con tráfico propio antes de desplegarlo a usuarios.
- Clasificación y enrutamiento de correo: etiquetado de mensajes por categoría dentro de flujos de soporte o gestión de bandejas compartidas, aprovechando el ajuste al dominio del correo.
- Reescritura y normalización de texto: adaptación de borradores a un tono profesional o corrección de estilo en herramientas de productividad ofimática.
- Procesamiento por lotes de archivos de correo: al ser un modelo de 0,6B en Q4_K_M, permite procesar grandes volúmenes de mensajes en hardware modesto, por ejemplo en tareas de archivado o auditoría interna.

## Benchmarks y rendimiento

Resultados declarados por el autor, no verificados de forma independiente. Ambos modelos se ejecutaron como GGUF Q4_K_M con el mismo build de llama.cpp, decodificación greedy y prompts idénticos, sobre conjuntos reservados no vistos en entrenamiento.

| Benchmark | Qwen3-0.6B base | qwen-for-email |
|---|---|---|
| Summary ROUGE-L | 0,231 | **0,262** |
| Summary METEOR | 0,176 | **0,244** |
| Summary BLEU | 4,257 | **9,582** |
| Subject ROUGE-L | 0,290 | **0,382** |
| Subject METEOR | 0,314 | **0,369** |
| Subject BLEU | 6,253 | **16,516** |
| Reply ROUGE-L | **0,078** | 0,075 |
| Reply METEOR | **0,082** | 0,049 |
| Reply BLEU | 0,256 | **0,510** |
| Summary think tokens (menos es mejor) | 185 | **20** |
| Subject think tokens (menos es mejor) | 185 | **20** |
| Reply think tokens (menos es mejor) | 167 | **13** |

Valores p de McNemar emparejado sobre ROUGE-L: resumen 0,0001; asunto 0,092; respuesta 0,755. La evaluación con juez LLM (NVIDIA Nemotron-3.5-Super-VL-120B-A12B, con el razonamiento desactivado, comparación por pares en ambos órdenes y empates conservados) arroja para respuesta 5 victorias del modelo frente a 1 del base y 36 empates; para asunto, 70 victorias frente a 11 y 69 empates.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantización Q4_K_M (el repositorio completo ocupa 0,5 GB); en fp16, aproximadamente 1,2 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una Tesla T4. Funciona igualmente en A100, H100 y RTX 4090 sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1060 en adelante, RTX 3060, RTX 4090) e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama, LM Studio, Jan y forks de llama.cpp con el GGUF; transformers con el adaptador LoRA sobre Qwen3-0.6B.
- Latencia y throughput: no disponibles de forma numérica; el autor señala que el razonamiento breve (13 a 20 tokens frente a 167 a 185 del base) mantiene la respuesta rápida en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-for-email | 596 M | No disponible | Correo electronico, razonamiento breve | Apache-2.0 | Hugging Face (GGUF y LoRA) |
| Qwen3-0.6B (base) | 596 M | No disponible | Proposito general | Apache-2.0 | Hugging Face |
| cracktivity-email-qwen3-0.6b | 596 M | No disponible | Correo electronico para cliente de escritorio | No disponible | Hugging Face |

El modelo base Qwen3-0.6B es la referencia directa: mismo tamaño y licencia, pero sin ajuste al dominio del correo y con un consumo de tokens de pensamiento muy superior. El modelo `chirag-gamer/cracktivity-email-qwen3-0.6b`, del mismo autor, comparte el enfoque de razonamiento breve para un cliente de correo local en Windows, aunque no se dispone de datos comparativos de rendimiento ni de licencia en la información consultada. No se han identificado otras alternativas comparables en la información disponible.

## Limitaciones y advertencias

- Entrenado con correspondencia pública real (correos corporativos de Enron y correos de Clinton): pueden aparecer nombres reales y asuntos personales en las salidas. El enmascaramiento de datos personales cubre direcciones, teléfonos, URL y números de cuenta, pero no nombres.
- En redacción de respuestas, el modelo empata con el base en ROUGE frente a referencias (p = 0,76); el solapamiento con referencias es un proxy débil de la calidad de una respuesta, y la comparación con juez LLM es una señal más adecuada para esa tarea.
- Solo inglés. No se ha evaluado en seguridad.
- Una parte del datos de instrucción general previstos como replay no se cargó durante el entrenamiento, por lo que no se ensayó la retención de capacidades generales; puede degradarse el rendimiento fuera del dominio del correo.
- Licencia Apache-2.0, que permite uso comercial; el modelo base Qwen3-0.6B también es Apache-2.0 y las salidas del profesor provienen de un modelo Apache-2.0. El autor no ofrece garantía alguna.
- Antes de desplegarlo a usuarios finales, el autor recomienda verificar su comportamiento con tráfico propio.
- No se han publicado datos sobre longitud de contexto soportada ni sobre sesgos específicos más allá de los derivados del corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chirag-gamer/qwen-for-email
- Modelo relacionado del mismo autor: https://huggingface.co/chirag-gamer/cracktivity-email-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset Enron: https://huggingface.co/datasets/corbt/enron-emails
- Dataset de resumen de correo: https://huggingface.co/datasets/xprilion/email-summary-dataset
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Pares de respuesta de correos de Clinton: https://doi.org/10.5281/zenodo.16789803
- Analisis de benchmarks de modelos chinos (referencia general): https://explore.n1n.ai/blog/chinese-ai-model-benchmarks-2026-deepseek-glm-kimi-qwen-2026-06-28
