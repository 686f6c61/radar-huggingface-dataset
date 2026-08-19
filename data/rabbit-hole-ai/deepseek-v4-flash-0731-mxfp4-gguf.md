# Rabbit-Hole-Ai/DeepSeek-V4-Flash-0731-MXFP4-GGUF

## Resumen

DeepSeek-V4-Flash-0731 es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DeepSeek-AI, con 284.334 millones de parámetros totales y 13.000 millones activos por pasada. Es la variante "Flash" de la familia V4, diseñada para ofrecer un equilibrio entre capacidad y eficiencia, con un contexto nativo de 1 millón de tokens y tres modos de razonamiento integrados. Esta ficha se centra en la cuantización GGUF publicada por Rabbit-Hole-Ai bajo licencia MIT, que reempaqueta los pesos del modelo en formato MXFP4 para los expertos enrutados (bit-exactos respecto al FP4 nativo del release) y Q8_0 para el resto de tensores, permitiendo servir 196.608 tokens de contexto en una única RTX 5090 de 32 GB con ayuda de la RAM del sistema.

La relevancia de esta cuantización radica en que posibilita ejecutar un modelo de clase 300B en hardware de consumo (una GPU de 32 GB) con una fidelidad casi total respecto al original, a costa de una velocidad moderada (26,4 tokens por segundo) y de requerir un fork específico de llama.cpp (ik_llama.cpp) para alcanzar esa ventana de contexto. Es una opción pensada para desarrolladores e investigadores que necesitan probar un modelo de gran tamaño localmente sin acceso a infraestructura de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) - Transformer con 43 capas (4 densas + 39 MoE) |
| Parametros totales | 284.334.567.511 (284,3 B) |
| Parametros activos | 13 B |
| Longitud de contexto | 196.608 tokens (configuracion de esta cuantizacion con ik_llama.cpp); el modelo original soporta 1.000.000 tokens |
| Tipos de cuantizacion | MXFP4 (expertos enrutados, 94% del peso), Q8_0 (no-expertos), BF16 (token_embd y output), F32 (normas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo original usa safetensors) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 es un MoE sparse con 284,3 mil millones de parámetros totales y solo 13 mil millones activos por token, lo que reduce el coste computacional por inferencia. La arquitectura incluye 43 capas, de las cuales 39 son capas MoE con expertos enrutados y 4 son densas. El release 0731 sustituyó el cabezal MTP de 1 bloque de la versión Preview por un drafter DSpark de 3 bloques para decodificación especulativa, aunque esta cuantización no incluye esos tensores (se descartaron por degradación en la tasa de aceptación). El modelo original soporta un contexto nativo de 1 millón de tokens mediante escalado YaRN.

La cuantización de Rabbit-Hole-Ai reempaqueta los expertos enrutados en MXFP4 de forma bit-exacta respecto al FP4 nativo del release, sin pérdida adicional de fidelidad en el 94% del modelo. El resto de tensores (attention, FFN densa, experto compartido) se cuantizan a Q8_0, mientras que token_embd y output se mantienen en BF16 y las normas en F32. La conversión perdió las cinco claves de metadatos de rope scaling, por lo que es obligatorio pasar los flags YaRN manualmente al cargar el modelo. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento complejo: el modelo base integra tres modos de razonamiento (segun la documentacion de DeepSeek), lo que permite abordar tareas de logica, matematicas y analisis.
- Inferencia local de un modelo de 300B-class: esta cuantizacion esta especificamente disenada para ejecutarse en una GPU de 32 GB con ayuda de RAM del sistema, algo inviable con el modelo en precision completa.
- Soporte de contexto largo: alcanza 196.608 tokens de ventana con la configuracion recomendada, suficiente para documentos extensos y conversaciones multi-turno.
- Compatibilidad con el ecosistema GGUF: se puede cargar con llama.cpp y sus derivados, aunque solo ik_llama.cpp reproduce el rendimiento y la ventana de contexto anunciados.
- Capacidades multilingues: no se han publicado datos especificos sobre los idiomas soportados por esta cuantizacion.
- Tool calling, agentes y vision: no se ha confirmado en la informacion disponible si el modelo base o esta cuantizacion soportan estas funciones.

## Casos de uso

- Investigacion y prototipado local: permite a un investigador evaluar el comportamiento de un modelo de 284B parametros en su propia estacion de trabajo, sin depender de APIs ni de infraestructura en la nube, gracias a su fidelidad casi total al release original.
- Desarrollo de agentes con contexto largo: con 192K tokens de ventana, se pueden construir agentes que procesen documentacion extensa, repositorios de codigo o historiales de conversacion completos en una sola sesion.
- Pruebas de razonamiento avanzado: los tres modos de razonamiento del modelo base lo hacen adecuado para experimentar con tareas de logica, matematicas y analisis de datos en un entorno local.
- Generacion de codigo asistida: aunque no se confirma tool calling, la capacidad de razonamiento y el contexto largo permiten usarlo como asistente de programacion para proyectos grandes, con la ventaja de que los pesos residen en local.
- Analisis de documentos legales o academicos: la ventana de 196K tokens permite ingerir contratos extensos, articulos cientificos o informes completos y generar resumenes o extraer informacion sin fragmentar el texto.
- Educacion y formacion: sirve como plataforma para ensenar conceptos de inferencia local, cuantizacion MXFP4 y despliegue de modelos MoE en hardware de consumo, dado que la configuracion esta documentada en detalle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta cuantizacion. La model card solo proporciona metricas de rendimiento de inferencia: 26,4 tokens por segundo en generacion single-stream, con un pico de VRAM de 28,3 GB en una RTX 5090, medidos el 17 de agosto de 2026. La configuracion con `--swa-compress` es determinista en 18 de 18 ejecuciones y produce salida byte-identica con y sin la compresion. No se dispone de comparaciones con otras cuantizaciones del mismo modelo en terminos de calidad.

## Requisitos de hardware

- VRAM estimada: 28,3 GB pico con la configuracion recomendada (cabe en una RTX 5090 de 32 GB). Sin `--swa-compress` el modelo carga hasta 31,8 GB y provoca desbordamiento.
- GPU recomendada: una unica RTX 5090 (o equivalente con 32 GB de VRAM). No se ha probado en otras GPUs.
- RAM del sistema: minimo 192 GB, recomendado 255 GB (los pesos del archivo GGUF ocupan 145,63 GiB y los tensores MoE residen en memoria del sistema).
- CPU: se recomienda al menos 24 nucleos fisicos; el parametro `-t` debe ajustarse al recuento de nucleos de la maquina.
- Opciones de despliegue: exclusivamente ik_llama.cpp (fork de llama.cpp) en su rama principal con commit `c46ffaa5` o posterior, usando `llama-server`. El llama.cpp estandar puede cargar el archivo pero no reproduce la ventana de 192K ni el rendimiento.
- Latencia y throughput: 26,4 tokens por segundo en generacion single-stream; la velocidad de prefill no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto nativo | Licencia | Formato |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (original) | 284,3 B | 13 B | 1 M | MIT | safetensors |
| DeepSeek-V4-Flash-0731-MXFP4-GGUF (esta cuantizacion) | 284,3 B | 13 B | 196.608 (con ik_llama.cpp) | MIT | GGUF |
| DeepSeek-V4-Pro | 1,6 T | 49 B | 1 M | MIT | safetensors |

No se dispone de datos comparativos con otras cuantizaciones comunitarias del mismo modelo ni con modelos de tamano similar de otros fabricantes (como Qwen o Llama) en terminos de rendimiento o calidad. La model card menciona que la conversion es byte-identica a la cuantizacion `UD-Q8_K_XL` de Unsloth en los cuatro tipos de tensor, lo que sirve como referencia de correctitud, pero no como comparativa de rendimiento.

## Limitaciones y advertencias

- Requiere obligatoriamente ik_llama.cpp (fork de llama.cpp) para alcanzar la ventana de 196K tokens; el llama.cpp estandar no reproduce la configuracion anunciada.
- Los flags YaRN (`--rope-scaling yarn --rope-scale 16 --yarn-orig-ctx 65536 --yarn-beta-fast 32 --yarn-beta-slow 1`) son imprescindibles; sin ellos el contexto largo falla silenciosamente. Hay que verificar que `freq_scale` sea 0.0625 en el log de carga.
- No incluye el drafter DSpark, por lo que la decodificacion especulativa no esta disponible ni recomendada.
- Velocidad limitada: 26,4 tokens por segundo, muy por debajo de lo que ofreceria un despliegue en servidor con multiples GPUs.
- Requiere una cantidad elevada de RAM del sistema (minimo 192 GB), lo que excluye a la mayoria de estaciones de trabajo convencionales.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de idioma especificos de esta cuantizacion; se heredan los del modelo base, que no estan documentados en la informacion disponible.
- El archivo GGUF pesa 145,63 GiB, por lo que la descarga y el almacenamiento requieren espacio considerable en disco.

## Enlaces

- Repositorio de la cuantizacion en Hugging Face: https://huggingface.co/Rabbit-Hole-Ai/DeepSeek-V4-Flash-0731-MXFP4-GGUF
- Modelo base en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Repositorio GitHub de antirez/ds4 (motor de inferencia local): https://github.com/antirez/ds4
- Documentacion en DeepWiki: https://deepwiki.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
- Pagina de DeepSeek en Lambda (referencia del modelo): https://lambda.ai/inference-models/deepseek-ai/deepseek-v4-flash
- Sitio oficial de DeepSeek: https://deepseek.com/en/index.html
