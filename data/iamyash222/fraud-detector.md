# iamyash222/fraud-detector

## Resumen

`iamyash222/fraud-detector` es un ajuste fino (fine-tuning) supervisado del modelo base Qwen2.5-1.5B-Instruct, publicado por el usuario iamyash222 en HuggingFace. Se trata de un modelo de lenguaje de 1.500 millones de parametros derivado de la familia Qwen2.5 de Alibaba, orientado, segun su nombre, a tareas de deteccion de fraude, aunque la model card no documenta ni el dataset de entrenamiento ni las tareas concretas para las que fue ajustado.

El modelo se ha entrenado con la libreria TRL (version 1.17.1) mediante SFT (Supervised Fine-Tuning), y los pesos se distribuyen en formato safetensors dentro del ecosistema transformers. El repositorio tiene un tamano declarado de 0.0 GB y cero descargas en el momento de la consulta, lo que sugiere una publicacion reciente y sin validacion por parte de la comunidad.

Su relevancia practica es limitada tal como esta publicado: no hay licencia declarada, no se especifican idiomas, no hay resultados de benchmarks y la model card es una plantilla autogenerada por TRL sin informacion sustantiva sobre el proceso de entrenamiento ni sobre el rendimiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.500 millones (aproximado, segun modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Qwen2.5 soporta hasta 32.768 tokens nativos, ampliable a 131.072 mediante YaRN; no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer decoder-only de Qwen2.5-1.5B-Instruct, que emplea atencion por causalidad estandar, RoPE para codificacion posicional y capas densas (no MoE). No se han publicado detalles sobre modificaciones arquitectonicas respecto al modelo base.

El entrenamiento se realizo mediante SFT con TRL 1.17.1, sobre Transformers 5.21.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF o DPO posteriores, ni hiperparametros como tasa de aprendizaje, batch size o numero de epocas. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). El ejemplo de uso que incluye la model card es una pregunta generica sobre viajes en el tiempo, lo que sugiere que la plantilla no fue personalizada para el dominio de fraude.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones, segun las capacidades del modelo base.
- Generacion de codigo y matematicas a nivel de modelo pequeno (1.5B), sin datos especificos publicados para este ajuste.
- Soporte de tool calling y function calling: no disponible en la documentacion de este ajuste (el modelo base Qwen2.5-Instruct lo soporta, pero no se confirma que el fine-tuning lo preserve).
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.
- Capacidades multilingues: no disponibles (el modelo base soporta multiples idiomas, pero no se especifica para este ajuste).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Clasificacion de transacciones sospechosas: el modelo podria usarse para etiquetar o justificar la clasificacion de transacciones como fraudulentas o legitimas a partir de descripciones textuales, aprovechando el ajuste SFT orientado a fraude. Requiere validacion previa con datos propios, dado que no hay benchmarks publicados.
- Analisis de reclamaciones y disputas: generacion de resumenes y evaluaciones preliminares de reclamaciones de clientes en texto libre, con el modelo actuando como asistente de triaje para equipos de riesgo.
- Asistencia en revision de alertas antifraude: el modelo puede redactar explicaciones en lenguaje natural sobre por que una alerta merece revision manual, integrado en un pipeline de scoring.
- Extraccion de entidades en informes de fraude: identificacion de importes, fechas, cuentas y contrapartes en documentos textuales, con salida estructurada si se preserva el soporte de tool calling del modelo base.
- Generacion de casos sinteticos para entrenamiento: produccion de ejemplos de conversaciones o narrativas de fraude para aumentar datasets de entrenamiento de otros modelos, dado el bajo coste de inferencia de un modelo de 1.5B.
- Prototipado rapido en entornos con recursos limitados: despliegue en una unica GPU consumer para pruebas de concepto de asistentes antifraude antes de escalar a modelos mayores.
- Chatbot interno de consultas sobre politicas antifraude: respuestas a preguntas del personal sobre procedimientos, aprovechando la capacidad conversacional heredada de Qwen2.5-Instruct.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion tipica de 4-6 GB en total para contextos moderados).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,5-2 GB para pesos; en 4 bits, aproximadamente 1 GB para pesos (no hay cuantizaciones publicadas por el autor; habria que generarlas).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4, A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 6 GB o mas en fp16, y en GPUs de 4 GB con cuantizacion.
- Opciones de despliegue: transformers (pipeline nativo), vLLM, TGI, llama.cpp u Ollama (requiere conversion previa a GGUF, no publicada), SGLang.
- Latencia y throughput estimados: no disponibles; para un modelo de 1.5B en una RTX 4090 se espera un throughput del orden de cientos a miles de tokens por segundo con batching, pero no hay mediciones publicadas para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| iamyash222/fraud-detector | ~1.5B | no disponible | no disponible | HuggingFace, 0 descargas | Ajuste SFT sin documentacion ni benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32.768 nativos (131.072 con YaRN) | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base, con benchmarks publicados y soporte multiidioma |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32.768 nativos (131.072 con YaRN) | Apache 2.0 (Qwen Research para algunos tamanos) | HuggingFace | Mayor capacidad a costa del doble de VRAM |
| meta-llama/Llama-3.2-1B-Instruct | 1.2B | 131.072 | Llama 3.2 Community License | HuggingFace | Alternativa de tamano similar con contexto largo |

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es una plantilla autogenerada por TRL; no se describe el dataset, la tarea exacta, el proceso de anotacion ni los criterios de exito.
- Licencia no declarada: el campo de licencia esta vacio, lo que impide determinar si el uso comercial esta permitido. El modelo base Qwen2.5-1.5B-Instruct es Apache 2.0, pero el ajuste no hereda automaticamente esa licencia de forma explicita.
- Riesgo elevado de alucinacion: un modelo de 1.5B ajustado con SFT sobre datos no documentados puede generar clasificaciones o justificaciones plausibles pero incorrectas en un dominio sensible como el fraude.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no es posible evaluar sesgos demograficos, geograficos o de otro tipo, especialmente criticos en decision automatizada sobre personas.
- Idiomas no especificados: no se confirma que el ajuste preserve el multilingueismo del modelo base.
- Sin validacion de la comunidad: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion ni evaluaciones independientes.
- No apto para produccion sin evaluacion propia: cualquier despliegue en un sistema real de deteccion de fraude deberia acompanarse de un conjunto de validacion etiquetado, analisis de falsos positivos y negativos, y supervision humana.
- Repositorio de 0.0 GB declarado: conviene verificar que los pesos estan efectivamente subidos y son descargables antes de integrarlo en cualquier pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iamyash222/fraud-detector
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio TRL: https://github.com/huggingface/trl
