# jfking/qwen38_27b_huahuacs_uncensored_ninfer_nvfp4

## Resumen

El modelo `jfking/qwen38_27b_huahuacs_uncensored_ninfer_nvfp4` es una versión adaptada para inferencia del modelo `HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF`, que a su vez es una variante sin censura del modelo Qwen3.8-27B desarrollado por Alibaba. Esta versión concreta, publicada por el usuario jfking, utiliza el formato de cuantización NVFP4 de NVIDIA, diseñado para las GPUs de la serie Blackwell (RTX 50). El autor indica que ha probado el modelo durante una semana en herramientas como opencode y openweb UI, y que el comportamiento es idéntico al modelo original de HauhauCS.

El interés de este modelo radica en que ofrece las capacidades de un modelo de 27 000 millones de parámetros en un formato optimizado para hardware consumer reciente, con un peso de 21,5 GB que cabe en tarjetas gráficas de gama alta. Al ser una versión "uncensored", elimina los filtros de seguridad habituales de los modelos comerciales, lo que lo hace útil para aplicaciones de generación de texto libre, aunque requiere un manejo responsable por su potencial contenido problemático. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen3.8-27B, probablemente transformer denso) |
| Parametros totales | 27 000 millones (estimado, segun el modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3.8 soporta hasta 256 000 tokens, pero no se confirma en esta version) |
| Tipos de cuantizacion | NVFP4 (4 bits en punto flotante de NVIDIA) |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, incluyendo espanol) |
| Licencia | Apache 2.0 |
| Formato de pesos | NVFP4 (formato propietario de NVIDIA para Blackwell) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna de este modelo especifico. La model card solo indica que es una version NInfer del modelo de HauhauCS, que a su vez es una adaptacion del Qwen3.8-27B original. El modelo base Qwen3.8-27B emplea una arquitectura transformer densa con atencion de multiples cabezas, entrenada con una mezcla de datos textuales y de codigo, y optimizada mediante tecnicas de RLHF y DPO. Sin embargo, no se han publicado detalles sobre el entrenamiento adicional que recibio la variante uncensored de HauhauCS ni sobre el proceso de cuantizacion a NVFP4 realizado por jfking. Se desconoce si se aplicaron tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto libre sin filtros de contenido (modelo uncensored).
- Razonamiento y respuesta a preguntas, heredadas del modelo base Qwen3.8-27B.
- Soporte de codigo y matematicas, segun las capacidades del Qwen3.8.
- Capacidades multilingues, aunque no se especifican los idiomas concretos en esta version.
- No se documenta soporte explicito de tool calling, agentes o vision en esta variante.
- El nombre "Aggressive" sugiere un estilo de respuesta mas directo o confrontacional, pero no hay pruebas objetivas.

## Casos de uso

- Generacion de contenido creativo sin restricciones: escritura de ficcion, guiones o dialogos con tematicas adultas o controvertidas, aprovechando la ausencia de filtros de contenido.
- Investigacion academica sobre IA sin censura: estudio del comportamiento de modelos cuando se eliminan los mecanismos de seguridad, en entornos controlados.
- Chatbots personalizados para nichos especificos: asistentes virtuales con personalidad agresiva o sin limitaciones de tema, desplegados localmente.
- Pruebas de robustez y evaluacion de sesgos: uso como modelo de referencia para comparar respuestas censuradas y no censuradas en sistemas de moderacion.
- Desarrollo de aplicaciones de escritura asistida: herramientas de generacion de textos largos (novelas, articulos) que requieren explorar temas sensibles sin bloqueos.
- Experimentacion con cuantizacion NVFP4: validacion del rendimiento y la calidad de salida de este formato en GPUs Blackwell para modelos de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Tampoco hay comparaciones cuantitativas con el modelo base o con otras variantes uncensored.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos ocupa 21,5 GB, por lo que se recomienda al menos 24 GB de VRAM para cargar el modelo con overhead de inferencia.
- GPU recomendada: NVIDIA RTX 5090 o RTX 5080 (serie Blackwell), ya que el formato NVFP4 esta optimizado para estas arquitecturas.
- No cabe en GPUs consumer de generaciones anteriores (RTX 30 o 40) de forma nativa, aunque podria ejecutarse con cuantizaciones alternativas.
- Opciones de despliegue: NInfer (el motor mencionado por el autor), posiblemente compatible con llama.cpp u Ollama si se convierte el formato, aunque no se confirma.
- Latencia y throughput: no disponibles. Dependen de la GPU y del motor de inferencia utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 256K | Apache 2.0 | FP16/BF16 | HuggingFace |
| HauhauCS/Qwen3.8-27B-Uncensored | 27B | no disponible | Apache 2.0 | GGUF | HuggingFace |
| jfking/qwen38_27b_huahuacs_uncensored_ninfer_nvfp4 | 27B | no disponible | Apache 2.0 | NVFP4 | HuggingFace |
| Dolphin 2.5 (Mixtral 8x7B) | 56B (MoE) | 32K | Apache 2.0 | GGUF | HuggingFace |

No se dispone de datos de rendimiento comparativo. La principal diferencia es el formato de cuantizacion y la ausencia de censura en las variantes de HauhauCS y jfking.

## Limitaciones y advertencias

- Al ser un modelo uncensored, puede generar contenido ofensivo, ilegal o danino si se usa sin control. No debe desplegarse en entornos de produccion sin moderacion.
- Riesgo de alucinacion: al igual que otros modelos de lenguaje, puede inventar informacion con total seguridad, especialmente en temas especializados.
- Sesgos: el entrenamiento del modelo base puede haber introducido sesgos sociales, de genero o culturales que se mantienen en esta variante.
- Limitaciones de contexto: no se confirma la longitud de contexto real en esta version; puede ser inferior a la del modelo base si la cuantizacion afecta la atencion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el caracter uncensored puede entrar en conflicto con politicas de plataformas o legislacion local.
- Problemas de compatibilidad: el formato NVFP4 es propietario de NVIDIA y solo funciona en GPUs Blackwell; no es portable a otros hardware.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jfking/qwen38_27b_huahuacs_uncensored_ninfer_nvfp4
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Guia para ejecutar Qwen3.8-27B localmente: https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html
- Guia de Qwen3.8-27B en Substack: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Version NVFP4 en Ollama (referencia): https://ollama.com/aiconjured/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF-Q8-NVFP4
