# shoemoney/Muse-Glimmer-30B-Abliterated-MLX-q8

## Resumen

Muse-Glimmer-30B-Abliterated-MLX-q8 es una cuantizacion en 8 bits del modelo Blackfrost-AI/Muse-Glimmer-30B-Abliterated-BF16, realizada con la libreria mlx-vlm para ejecucion optimizada en hardware Apple Silicon. El modelo base original, Muse Glimmer 30B, es un desarrollo de Meta con licencia Apache 2.0, disenado especificamente para agentes locales siempre activos, con capacidades multimodales (texto e imagen), tool calling nativo y razonamiento multi-paso. La version "abliterated" elimina ciertos alineamientos de seguridad del modelo original, y esta cuantizacion MLX reduce el peso de BF16 a 8 bits manteniendo un tamano en disco de 33,4 GB.

El modelo esta pensado para desarrolladores que necesitan ejecutar un agente local con capacidades de vision y herramientas en una sola GPU de gama alta o en un Mac con memoria unificada. Su arquitectura exacta no se detalla en la informacion disponible, pero los parametros totales en safetensors son 9.707.260.928, lo que sugiere una arquitectura de mezcla de expertos (MoE) con parametros activos inferiores a los 30B que indica el nombre. La relevancia actual radica en que ofrece una alternativa abierta y ejecutable localmente a modelos propietarios de agentes, con licencia permisiva y soporte para vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con razonamiento, probablemente MoE) |
| Parametros totales | 9.707.260.928 (safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit MLX (q8, grupo de 64) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Se sabe que es un modelo multimodal que acepta texto e imagenes, con capacidades de tool calling y razonamiento separado, segun la ficha de NVIDIA NIM. El modelo base de Meta, Muse Glimmer 30B, esta optimizado para agentes locales con ejecucion en una sola GPU, lo que sugiere un diseno eficiente en memoria. La version "abliterated" de Blackfrost-AI elimina los alineamientos de seguridad del modelo original, y la cuantizacion MLX se realizo con `mlx_vlm.convert` sin fine-tuning ni re-alineamiento, manteniendo los pesos originales en 8 bits con grupo de cuantizacion de 64.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados, ni si se utilizaron tecnicas como RLHF o DPO. El proceso de cuantizacion se documento con metricas de perplejidad y throughput en un Apple M3 Ultra, pero no hay datos sobre el entrenamiento original del modelo.

## Capacidades

- Generacion de texto y razonamiento multi-paso, disenado para tareas de agente autonomo.
- Comprension multimodal: acepta entradas de texto e imagenes.
- Tool calling / function calling nativo, permitiendo integracion con APIs y herramientas externas.
- Razonamiento separado: el modelo puede generar una salida de razonamiento distinta de la respuesta final.
- Recuperacion ante fallos: disenado para manejar errores y reintentar acciones en flujos de trabajo largos.
- Ejecucion local en hardware de consumo, sin necesidad de infraestructura en la nube.
- Multilingue: no se especifican idiomas soportados en la informacion disponible.

## Casos de uso

- Asistente personal local: el modelo puede gestionar conversaciones multi-turno, consultar el calendario, enviar mensajes o controlar dispositivos del hogar mediante tool calling, todo ejecutandose en un Mac o PC con GPU de gama alta.
- Automatizacion de tareas de oficina: integrado en un flujo de trabajo, puede leer documentos (via vision), extraer datos, generar resumenes y ejecutar acciones en aplicaciones como hojas de calculo o correo electronico.
- Agente de soporte tecnico: con acceso a una base de conocimiento y herramientas de diagnostico, el modelo puede guiar al usuario paso a paso, consultar logs y proponer soluciones, manteniendo el contexto de la conversacion.
- Generacion de codigo asistida: soporta tool calling, por lo que puede integrarse en un IDE o pipeline de CI/CD para generar, revisar y ejecutar fragmentos de codigo, con la ventaja de ejecutarse localmente sin enviar datos a la nube.
- Analisis de imagenes en tiempo real: al aceptar entradas visuales, puede describir imagenes, extraer texto (OCR) o identificar objetos en entornos de produccion, como control de calidad o inventario.
- Prototipado de agentes de investigacion: los investigadores pueden desplegar el modelo localmente para experimentar con flujos de agente multi-paso, probar estrategias de tool use y evaluar la recuperacion ante fallos sin costes de API.

## Benchmarks y rendimiento

La model card del autor proporciona mediciones propias de la cuantizacion, no benchmarks estandar:

| Metrica | Valor |
|---|---|
| Perplejidad (tulu-3-sft-mixture, 192 muestras de 512 tokens) | 7.242 |
| Throughput (1 peticion) | 21.5 tok/s |
| Throughput (8 peticiones concurrentes) | 76.9 tok/s |

Estas mediciones se realizaron en un Apple M3 Ultra con 96 GB de memoria unificada. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible. La perplejidad solo es comparable dentro de la familia de cuantizaciones del mismo modelo base, no entre familias de modelos.

## Requisitos de hardware

- VRAM estimada: el modelo en 8 bits ocupa 33,4 GB en disco, por lo que se recomienda al menos 40 GB de memoria unificada o VRAM para inferencia comoda.
- GPU recomendadas: Apple Silicon con 64 GB o 96 GB de memoria unificada (M3 Ultra, M2 Ultra, M3 Max). En PC, una GPU con 48 GB o 80 GB de VRAM (RTX 6000 Ada, A6000, H100) seria adecuada.
- En consumer GPU: no cabe en GPUs de 24 GB como la RTX 4090, salvo que se aplique una cuantizacion inferior (4-bit) no incluida en esta version.
- Opciones de despliegue: mlx-vlm para Apple Silicon, con soporte para generacion por linea de comandos (`mlx_vlm.generate`). No se menciona compatibilidad con vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: medidos en M3 Ultra, 21,5 tok/s en inferencia secuencial y 76,9 tok/s con 8 peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Muse-Glimmer-30B (Meta) | 30B (aprox.) | no disponible | Apache 2.0 | Hugging Face, LM Studio, NVIDIA NIM |
| Muse-Glimmer-30B-Abliterated-MLX-q8 (este) | 9.7B (safetensors) | no disponible | Apache 2.0 | Hugging Face (MLX) |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 | Hugging Face, multiples formatos |

La comparativa directa con otros modelos de agente local no esta disponible en la informacion proporcionada. El modelo se diferencia de Llama 3.1 8B por su naturaleza multimodal y su enfoque en tool calling y agentes, aunque el numero de parametros activos es similar. La licencia Apache 2.0 es mas permisiva que la de Llama.

## Limitaciones y advertencias

- La version "abliterated" elimina los alineamientos de seguridad del modelo original, lo que puede generar respuestas sin filtros eticos o legales. No es recomendable para aplicaciones publicas sin una capa de moderacion adicional.
- La cuantizacion en 8 bits puede degradar ligeramente la calidad de las respuestas en comparacion con el modelo BF16 original, aunque la perplejidad medida es identica a la mejor rung de la familia.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita su uso en tareas que requieran ventanas de contexto muy largas.
- El modelo solo se ha probado en Apple Silicon con mlx-vlm; no hay garantias de funcionamiento en otras plataformas.
- Los idiomas soportados no estan documentados, por lo que el rendimiento en idiomas distintos del ingles es incierto.
- El nombre "30B" no coincide con los parametros reales en safetensors (9.7B), lo que puede indicar una arquitectura MoE con parametros activos menores; los usuarios deben verificar los requisitos de memoria antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shoemoney/Muse-Glimmer-30B-Abliterated-MLX-q8
- Modelo base BF16: https://huggingface.co/Blackfrost-AI/Muse-Glimmer-30B-Abliterated-BF16
- Modelo original de Meta: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Pagina oficial de Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Ficha en LM Studio: https://lmstudio.ai/models/meta/muse-glimmer
- Ficha en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- Guia de referencia: https://github.com/cobusgreyling/Muse-Glimmer
