# saidutta69/RaceBench-MiniCPM5-heretic

## Resumen

RaceBench-MiniCPM5-heretic es un modelo de lenguaje de aproximadamente 1.080 millones de parametros derivado de saidutta69/RaceBench-MiniCPM5, que a su vez parte de la arquitectura MiniCPM5-1B de OpenBMB. Lo desarrolla el usuario saidutta69 (bajo el alias "RACER IS OP") y se distribuye con licencia Apache 2.0. Su rasgo distintivo es que ha sido sometido a un proceso de "abliteration" (ablacion direccional de pesos) mediante la herramienta Heretic v1.4.0, que suprime el comportamiento de rechazo del modelo base sin recurrir a fine-tuning adicional.

El modelo resuelve un problema concreto: obtener las capacidades de razonamiento multi-paso del modelo RaceBench (una mejora de +2.7 puntos en BBH respecto a MiniCPM5-1B) en un paquete de ~1B de parametros, con contexto largo de 128K tokens y modos hibridos Think/No-Think, pero sin las barreras de rechazo tipicas de los modelos alineados con RLHF. Segun la model card, los rechazos caen de 39/100 a 2/100 en un conjunto de 100 prompts adversariales, con una divergencia KL de 0.0284 respecto al original.

Es relevante ahora por su tamano reducido (ejecutable en GPU de consumo e incluso en CPU o Apple Silicon con cuantizaciones de menos de 1 GB) y por su orientacion a casos de uso de agentes locales, investigacion sobre mecanismos de alineacion y rechazo, y despliegue en el borde. La model card incluye una escalera completa de 15 cuantizaciones GGUF generadas con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia MiniCPM5, segun model card); detalles de capas y atencion no disponibles |
| Parametros totales | 1.080.632.832 (~1,08B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (segun model card, tag "long-context") |
| Tipos de cuantizacion | GGUF: F16, Q2_K, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MiniCPM5-1B, un transformer de aproximadamente 1.080 millones de parametros con soporte nativo de contexto largo (128K) y modos de razonamiento hibridos Think / No-Think, segun los tags y la model card. No se dispone de informacion detallada sobre numero de capas, dimensiones ocultas, mecanismo de atencion exacto ni composicion del dataset de entrenamiento original en la informacion proporcionada.

La innovacion tecnica principal de esta variante no esta en el entrenamiento sino en la edicion post-hoc de pesos: se aplica ablacion direccional ("abliteration") con Heretic v1.4.0, que identifica las direcciones de pesos responsables del comportamiento de rechazo y las modifica de forma selectiva en las proyecciones de salida de atencion (`attn.o_proj`) y en las down-projections del MLP (`mlp.down_proj`). Los parametros de edicion documentados incluyen `max_weight` de 1.35 en ambas proyecciones, `min_weight` de 0.53 en atencion y 1.27 en MLP, con posiciones y distancias por capa especificadas. El objetivo declarado es preservar el resto de la red y sus capacidades intactas, evitando la degradacion de coherencia que suele producirse al hacer fine-tuning sobre un modelo ya alineado con RLHF.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y chino.
- Razonamiento multi-paso, con mejora declarada de +2.7 puntos en BBH respecto a MiniCPM5-1B (segun model card).
- Modo hibrido Think / No-Think, activable mediante el parametro `enable_thinking` en `apply_chat_template`.
- Soporte de tool calling y function calling (tag "tool-calling" y mencion explicita en la model card).
- Capacidades agenticas para uso en agentes locales y razonamiento multi-paso.
- Contexto largo de hasta 128K tokens.
- Comportamiento de rechazo suprimido: 2/100 rechazos en prompts adversariales frente a 39/100 del modelo original.
- Ejecucion en dispositivos de borde (edge-ai, on-device) gracias a su tamano reducido.

## Casos de uso

- Agentes locales en GPU de consumo: con cuantizacion Q4_K_M (656 MB) el modelo cabe en tarjetas de 6-8 GB junto con el contexto, permitiendo desplegar agentes con tool calling en estaciones de trabajo sin GPU de datacenter.
- Investigacion sobre mecanismos de rechazo y alineacion: la variante heretic permite comparar el comportamiento del modelo original (39/100 rechazos) con el abliterado (2/100) manteniendo el mismo backbone, lo que facilita estudios controlados de ablacion direccional.
- Procesamiento de documentos largos en ingles o chino: los 128K tokens de contexto permiten analizar contratos, informes o articulos extensos en una sola pasada, con cuantizaciones Q5_K_M o Q6_K para preservar calidad.
- Roleplay y generacion creativa sin filtros: el modelo esta orientado explicitamente a casos bloqueados por sobre-rechazo de la era RLHF, adecuado para narrativa interactiva y personajes.
- Asistente de codigo en el borde: con tool calling y modo Think activable, puede integrarse en editores o terminales locales para tareas de generacion y explicacion de codigo, sin depender de APIs externas.
- Despliegue en CPU o Apple Silicon: la cuantizacion Q4_K_M (0,69 GB) cabe en RAM de sistema y permite ejecutar el modelo en portatiles sin GPU dedicada mediante llama.cpp, Ollama, LM Studio o Jan.
- Clasificacion y extraccion de informacion con contexto largo: util para pipelines de enriquecimiento de datos donde se necesita procesar lotes de texto en ingles o chino con latencia baja y coste cero de API.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados en la informacion disponible son los de la ablacion:

| Metrica | Este modelo | Modelo original (RaceBench-MiniCPM5) |
|---|---|---|
| Divergencia KL | 0.0284 | 0 (por definicion) |
| Rechazos (100 prompts adversariales) | 2/100 | 39/100 |

La model card menciona una mejora de +2.7 en BBH respecto a MiniCPM5-1B y un "coste en matematicas" asociado al trade-off de RaceBench, pero remite a la model card del modelo padre para la tabla completa, que no esta incluida en la informacion proporcionada. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, modelo nativo ~1,1B): entre 0,46 GB (Q2_K) y 2,02 GB (F16); anadir aproximadamente 1 GB adicional para el contexto.
- GPU de 12 GB (RTX 3060, 4070, 5070): cuantizacion recomendada Q8_0 (1,07 GB).
- GPU de 8 GB (RTX 4060, 3070): cuantizacion recomendada Q6_K (851 MB).
- GPU de 6 GB (GTX 1660 Super, RTX 2060, RTX 3050 laptop): cuantizacion recomendada Q5_K_M (750 MB).
- CPU o Apple Silicon: Q4_K_M (656 MB) cabe en RAM de sistema.
- Cabe en practicamente cualquier GPU de consumo moderna; el cuello de botella es el contexto, no los pesos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, vLLM, SGLang, transformers, text-generation-inference y endpoints compatibles.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| RaceBench-MiniCPM5-heretic | ~1,08B | 128K | Apache 2.0 | Variante abliterada; 2/100 rechazos; GGUF completo |
| RaceBench-MiniCPM5 (modelo padre) | ~1,08B | 128K | Apache 2.0 | Mismo backbone sin abliterar; 39/100 rechazos |
| MiniCPM5-1B (base de OpenBMB) | ~1B | No disponible en la informacion | No disponible en la informacion | Referencia de rendimiento: -2.7 en BBH respecto a RaceBench |

No se dispone de datos suficientes en la informacion proporcionada para comparar con otras alternativas de ~1B de parametros (Qwen, Llama, Gemma) en parametros, contexto, rendimiento y licencia de forma fiable.

## Limitaciones y advertencias

- La ablacion puede degradar sutilmente la coherencia o el razonamiento en dominios sensibles; la divergencia KL de 0.0284 respecto al original es pequena pero no nula.
- El modelo suprime rechazos de forma deliberada: puede generar contenido que el modelo base rechazaria, lo que traslada al desplegador la responsabilidad de filtrar y moderar en produccion.
- Solo soporta ingles y chino de forma declarada; el rendimiento en castellano no esta verificado.
- La model card menciona un "coste en matematicas" del trade-off de RaceBench, aunque la tabla completa no esta incluida en la informacion disponible; conviene verificar el rendimiento en tareas matematicas antes de usarlo en ese dominio.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y el autor no ofrece soporte ni evaluacion independiente.
- El modelo tiene 1 solo like y 1613 descargas en el momento de la ficha; no hay validacion de la comunidad ni evaluaciones de terceros.
- Riesgo de alucinacion inherente a un modelo de 1B de parametros; no apto para tareas que requieran alta precision factual sin verificacion.
- El repo ocupa 14,1 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo GGUF o los safetensors necesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidutta69/RaceBench-MiniCPM5-heretic
- Modelo padre: https://huggingface.co/saidutta69/RaceBench-MiniCPM5
- Dataset RaceBench: https://huggingface.co/datasets/saidutta69/RaceBench
- Modelo base MiniCPM5-1B (OpenBMB): https://huggingface.co/openbmb/MiniCPM5-1B
- Licencia: https://huggingface.co/openbmb/MiniCPM5-1B/blob/main/LICENSE
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Blog sobre abliteration: https://huggingface.co/blog/mlabonne/abliteration
- llama.cpp: https://github.com/ggml-org/llama.cpp
