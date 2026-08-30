# Rin247/gemma-4-12B-it-Uncensored-Aquarion-INT4

## Resumen

Este modelo es una cuantización INT4 *weight-only* del modelo `gemma-4-12B-it` de Google, realizada por el usuario Rin247. El trabajo combina dos procesos: un *abliteration* (eliminación de la dirección de rechazo o *refusal*) mediante proyección ortogonal, y una posterior cuantización a 4 bits para reducir el tamaño y permitir su ejecución en hardware más modesto. El resultado es un modelo de 12 000 millones de parámetros (aunque los pesos cuantizados ocupan unos 6,5 GB) que conserva las capacidades del modelo original pero sin los mecanismos de censura o rechazo de contenido.

La relevancia de este lanzamiento radica en que ofrece una alternativa *uncensored* de un modelo de última generación de Google, en un formato compacto que cabe en GPUs de consumo. Sin embargo, hay que tener en cuenta que la model card es muy escueta y no proporciona detalles sobre arquitectura, entrenamiento, licencia o benchmarks, por lo que gran parte de la información técnica debe inferirse de la documentación general de la familia Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4Unified (encoder-free, basado en transformer) |
| Parametros totales | 12B (modelo base); 6 509 756 464 pesos cuantizados en safetensors |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens (segun documentacion de Gemma 4, no confirmado para esta version) |
| Tipos de cuantizacion | INT4 weight-only (RTN sobre CPU, con escalas almacenadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base Gemma 4 tiene su propia licencia, pero no se indica aqui) |
| Formato de pesos | safetensors con cuantizacion INT4 personalizada (requiere dequantizacion con buffers de escala y forma) |

## Arquitectura y entrenamiento

El modelo base `gemma-4-12B-it` pertenece a la familia Gemma 4 de Google, lanzada en junio de 2026. Se trata de una arquitectura *encoder-free* denominada Gemma4Unified, que integra capacidades multimodales (vision, texto) y soporte para *tool calling* y agentes. Segun la documentacion disponible, el modelo tiene 47 capas en el decoder y una ventana de contexto de 256K tokens.

El proceso de *abliteration* aplicado por Rin247 consiste en identificar la direccion de rechazo (*refusal direction*) en las capas superiores del decoder (L15-L47) y proyectar ortogonalmente los pesos para eliminar esa direccion. Esto se hace solo en el 70% superior de las capas, ya que las capas tempranas tienen una relacion señal-ruido muy baja y ablarlas introduciria distorsion sin beneficio.

Posteriormente, el modelo se cuantizo a INT4 mediante RTN (Round-To-Nearest) en CPU, almacenando las escalas y formas de los pesos junto a los tensores cuantizados. No se proporciona informacion sobre el dataset de entrenamiento ni sobre el proceso de ajuste fino del modelo base.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Gemma 4 12B, que incluye comprension lectora, razonamiento logico y generacion de texto coherente en multiples dominios.
- Soporte multimodal: segun la documentacion de Gemma 4, el modelo base es capaz de procesar imagenes ademas de texto, aunque no se confirma que esta capacidad se conserve tras la cuantizacion INT4.
- Tool calling y agentes: el modelo base soporta invocacion de funciones y flujos de agente multi-paso, util para integraciones con APIs y automatizaciones.
- Capacidades multilingues: no se especifican idiomas, pero Gemma 4 esta entrenado con datos multilingues, por lo que se espera un buen rendimiento en castellano, ingles, frances, aleman, etc.
- Ausencia de censura: gracias al *abliteration*, el modelo no rechaza solicitudes de contenido explicito, politicamente sensible o que los modelos estandar considerarian peligroso. Esto permite su uso en contextos donde se requiere libertad creativa o investigacion sin restricciones.

## Casos de uso

- Generacion de ficcion y narrativa sin restricciones: escritores y creadores pueden emplear el modelo para redactar historias, dialogos o guiones con tematicas adultas o controvertidas sin que el modelo se niegue a continuar.
- Investigacion academica sobre sesgos y censura: investigadores pueden analizar como se comporta un modelo sin mecanismos de rechazo en comparacion con la version original, para estudiar los efectos del *abliteration* en la calidad de las respuestas.
- Desarrollo de asistentes de escritura para contenido editorial: redactores de revistas o blogs que tratan temas sensibles (salud, politica, religion) pueden usar el modelo como apoyo sin temor a bloqueos.
- Pruebas de robustez en sistemas de moderacion: equipos de seguridad pueden emplear este modelo para generar contenido problematico de forma controlada y asi entrenar o evaluar filtros de contenido.
- Integracion en entornos de desarrollo con recursos limitados: al estar cuantizado a INT4, puede ejecutarse en GPUs de consumo (8-12 GB VRAM) para prototipado rapido o demos locales.
- Automatizacion de respuestas en foros o comunidades donde se debaten temas tabu: el modelo puede mantener conversaciones fluidas sin evadir preguntas incomodas, siempre que el usuario asuma la responsabilidad del contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otros tests estandar. Tampoco se comparan los resultados con el modelo base sin cuantizar. Se recomienda al usuario realizar sus propias evaluaciones si necesita datos de rendimiento cuantitativos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6,5 GB de pesos en INT4, se necesitan al menos 8 GB de VRAM para cargar el modelo y la memoria de contexto. Con 12 GB se puede operar comodamente con ventanas de contexto largas.
- GPU recomendadas: tarjetas con 8-12 GB de VRAM como RTX 3060, RTX 4060, RTX 3070, RTX 4070, o equivalentes de AMD con ROCm. Para mayor rendimiento, una RTX 4090 o A100 permitiria mayor velocidad y contexto.
- Opciones de despliegue: al ser un formato safetensors con cuantizacion personalizada, no es compatible directamente con vLLM, llama.cpp u Ollama sin un proceso de dequantizacion previo. El autor indica que se debe reconstruir el modelo con los buffers de escala y forma antes de usar un motor de inferencia estandar.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090, un modelo de 12B cuantizado a INT4 podria alcanzar entre 30 y 60 tokens por segundo, pero esto es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-12B-it (original) | 12B | 256K | FP16/BF16 | Gemma (uso comercial permitido con restricciones) | HuggingFace |
| Rin247/gemma-4-12B-it-Uncensored-Aquarion-INT4 | 12B (6,5B en INT4) | 256K (estimado) | INT4 | no disponible | HuggingFace |
| Justbackup/gemma-4-12B-it-uncensored | 12B | 256K | FP16/BF16 (sin cuantizar) | no disponible | HuggingFace |
| Llama 3.1 8B uncensored (ejemplo) | 8B | 128K | GGUF (varias) | Llama 3.1 (permisiva) | HuggingFace |

La principal diferencia con el modelo original es la eliminacion de la censura y la reduccion de tamaño. Frente a otros modelos *uncensored* de tamano similar, este ofrece la arquitectura Gemma4Unified con soporte multimodal, aunque la cuantizacion INT4 puede degradar ligeramente la calidad en tareas complejas.

## Limitaciones y advertencias

- Sesgos conocidos: el proceso de *abliteration* puede eliminar no solo la censura sino tambien parte del alineamiento etico, lo que puede llevar a respuestas ofensivas, discriminatorias o peligrosas si no se supervisa su uso.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas factuales. La cuantizacion INT4 puede aumentar este riesgo al perder precision en los pesos.
- Limitaciones de contexto e idioma: aunque la ventana de 256K es amplia, el rendimiento en contextos muy largos puede degradarse. No se ha confirmado que esta version cuantizada conserve todas las capacidades multilingues del modelo base.
- Restricciones de licencia: la model card no especifica la licencia, por lo que no se puede garantizar el uso comercial. El modelo base Gemma 4 tiene una licencia con restricciones (por ejemplo, no usar para armas o vigilancia masiva), que puede no aplicarse o ser violada por esta version modificada.
- Compatibilidad limitada: el formato INT4 personalizado no es compatible con motores de inferencia estandar sin un paso de dequantizacion manual, lo que dificulta su despliegue en produccion.
- Soporte y mantenimiento: el autor no ofrece garantias ni documentacion adicional. Cualquier problema tecnico debera ser resuelto por el usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rin247/gemma-4-12B-it-Uncensored-Aquarion-INT4
- Version sin cuantizar de Justbackup: https://huggingface.co/Justbackup/gemma-4-12B-it-uncensored
- Guia de ejecucion local de Gemma 4 (blog): https://locallyuncensored.com/blog/gemma-4-local-guide.html
- Noticia sobre merge uncensored para AMD ROCM: https://uncensoredhub.ai/news/2026-07-02-gemma-4-12b-uncensored-merge-optimized-for-amd-rocm-drops-on-huggingface
- Documentacion oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
