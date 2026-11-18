# LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-GGUF

## Resumen

Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-GGUF es una distribucion en formato GGUF de un modelo derivado de Qwen3.6, en su variante de mezcla de expertos (MoE) con 34.660.610.688 parametros totales y aproximadamente 3.000 millones de parametros activos por token (de ahi el sufijo A3B). El autor de esta publicacion es LuffyTheFox, que aplica su metodo propio bautizado como Genesis: una serie de transformaciones post-entrenamiento sobre tensores en GGUF orientadas a reducir ruido estadistico y mejorar la estabilidad de la senal, sin reentrenar los pesos. Sobre esa base se han transferido datos de un ajuste fino orientado a uso como agente Hermes.

El modelo parte de HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, una version sin censura con 0 de 465 rechazos declarados en la model card, y de DJLougen/hermes-qwen3.5-35b-a3b-GGUF como fuente del ajuste fino sobre el dataset NousResearch/hermes-function-calling-v1. El resultado es un modelo multimodal de tipo image-text-to-text, con capacidades declaradas de vision, tool calling y razonamiento agentico multi-paso.

Su relevancia practica es doble: por un lado, ofrece un MoE de 35B en cuantizaciones GGUF manejables en hardware de consumo, con una ventana de contexto que hereda del Qwen3.6 base; por otro, es un ejemplo de la corriente de publicaciones comunitarias que combinan ajustes finos de agentes con tecnicas de "reparacion" de tensores, una propuesta metodologica discutible pero ampliamente distribuida. La licencia Apache 2.0 y las 273.947 descargas y 732 likes lo situan entre los derivados mas populares de su categoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal image-text-to-text; incluye tensores `ssm_conv1d` segun la descripcion del autor |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | ~3 B por token (denominacion A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (multiples cuantizaciones; el autor menciona el uso de imatrix y perfiles de Unsloth) |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors reportado en los metadatos del repo) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) de aproximadamente 34,66 B de parametros totales y unos 3 B activos por token, lo que permite un coste de inferencia por token muy inferior al de un modelo denso del mismo tamano. Es un modelo multimodal con pipeline image-text-to-text, por lo que procesa imagenes y texto de forma conjunta. La model card menciona tensores `ssm_conv1d` en el escaneo del autor, lo que sugiere componentes de estado/convolucion asociados a la gestion de memoria de contexto largo, aunque el autor no detalla la arquitectura base de Qwen3.6.

El entrenamiento no es propio de esta publicacion: el autor declara explicitamente que no entrena ni hace fine-tuning, sino que aplica su metodo Genesis, una regeneracion y calibracion de datos post-entrenamiento en GGUF basada en estadistica matematica. El proceso se describe en tres etapas: (1) escaneo y rebalanceo de tensores `ssm_conv1d`; (2) sustitucion de chunks nulos en tensores dañados por el chunk optimo segun tres parametros de la distribucion de pesos; (3) reduccion del ruido de entrenamiento mediante una SVD propia basada en la distribucion de Marchenko-Pastur, excluyendo `token_embd.weight`, `output.weight`, tensores 1D, bias y normas. Ademas, se transfieren aproximadamente 2.000 bloques desde dos tensores de expertos FFN de un fine-tune Hermes (DJLougen/hermes-qwen3.5-35b-a3b-GGUF) sobre la base sin censura de HauhauCS. El dataset de referencia del ajuste Hermes es NousResearch/hermes-function-calling-v1. No se indican volumen de tokens, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multirround y en varios idiomas (en, zh, multilingual).
- Razonamiento multi-paso y uso como agente (las etiquetas del repo incluyen `agentic`).
- Tool calling y function calling, con ajuste fino derivado de un dataset especifico de llamadas a funciones (hermes-function-calling-v1).
- Procesamiento de imagenes junto con texto (pipeline image-text-to-text); capacidades de vision declaradas en las etiquetas.
- Generacion de codigo y resolucion de tareas de razonamiento, por herencia del modelo Qwen3.6 base.
- Modo sin censura: la base HauhauCS declara 0/465 rechazos, orientado a evitar negativas del modelo en dominios no restringidos.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repo).

## Casos de uso

- Agentes con tool calling en produccion: el ajuste sobre hermes-function-calling-v1 permite emitir llamadas a funciones estructuradas y encadenarlas en flujos multi-paso; su naturaleza MoE con ~3 B activos reduce el coste por token frente a un denso de 35 B en despliegues con muchas llamadas.
- Atencion al cliente automatizada: gestiona conversaciones multi-turno con contexto largo y puede consultar APIs externas mediante function calling para resolver incidencias (estado de pedidos, cambios de reserva) sin salir del dialogo.
- Asistente de codigo integrado en IDE o CI/CD: genera parches y explicaciones de codigo y puede invocar herramientas del pipeline (linters, tests, despliegues) a traves de llamadas a funciones; las cuantizaciones GGUF permiten ejecutarlo en estaciones de trabajo locales.
- Procesamiento de documentos con imagenes: gracias a la capacidad image-text-to-text, puede extraer informacion de capturas, formularios o diagramas y combinarla con el texto para generar resumenes o respuestas.
- Investigacion con modelos sin censura: util para estudiar comportamiento, sesgos y robustez en dominios que modelos alineados rechazan; util tambien para evaluar experimentalmente el efecto del metodo Genesis sobre la calidad del modelo base.
- Despliegue local en hardware de consumo: al ser GGUF y MoE con solo ~3 B activos, permite ejecutar un modelo de 35 B en GPUs de gama alta de consumo con cuantizaciones agresivas, para prototipado rapido y demos offline.
- Automatizacion de tareas con imagenes y agentes (RPA asistido): combinacion de vision y function calling para interpretar pantallas o documentos y ejecutar acciones sobre sistemas de negocio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; como referencia de orden de magnitud, un modelo de 34,66 B en cuantizaciones de 4 bits ocupa del orden de 18-22 GB solo en pesos, a lo que hay que sumar KV cache y overhead del runtime, por lo que no cabe en GPUs de 8-12 GB ni en la mayoria de 16 GB con contexto amplio.
- GPU recomendadas: no especificadas por el autor; por tamano, encajan A100 40/80 GB, H100, L40S y GPUs de consumo de 24 GB o mas (RTX 3090/4090) con cuantizaciones bajas y contexto reducido. El autor realizo su procesado en una Tesla T4 (Google Colab gratuito), lo que solo indica el hardware de transformacion, no el de inferencia.
- Cabe en GPU de consumo: probablemente en RTX 3090/4090 (24 GB) con cuantizaciones de 4 bits y contexto moderado; no se garantiza en GPUs de 16 GB.
- Opciones de despliegue: llama.cpp y Ollama (formato GGUF nativo), LM Studio, y servidores compatibles con endpoints (la etiqueta `endpoints_compatible` sugiere compatibilidad con APIs tipo OpenAI). vLLM y TGI no soportan GGUF de forma generalizada, por lo que requeririan conversion a safetensors.
- Latencia y throughput estimados: no disponibles. Al ser MoE con ~3 B activos, el coste por token es sustancialmente menor que el de un modelo denso de 35 B, pero no hay cifras publicadas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes (este) | 34,66 B / ~3 B | no disponible | Si (image-text-to-text) | Apache 2.0 | GGUF en HF, 273.947 descargas |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (base) | ~35 B / ~3 B | no disponible | Si | Apache 2.0 | HF (modelo base declarado) |
| DJLougen/hermes-qwen3.5-35b-a3b-GGUF (fuente del ajuste) | ~35 B / ~3 B | no disponible | no disponible | no disponible | GGUF en HF |

No hay datos de rendimiento comparativo publicados en la informacion disponible; la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo sin censura: la base HauhauCS declara 0/465 rechazos, por lo que puede generar contenido inapropiado, ofensivo o danino si no se aplican filtros externos; no es adecuado para despliegues orientados al publico sin moderacion.
- El metodo Genesis no es un entrenamiento ni un fine-tuning, sino una transformacion estadistica de tensores; su eficacia no esta validada con benchmarks publicos en la informacion disponible, por lo que las afirmaciones de mejora de estabilidad y reduccion de alucinaciones deben tratarse como no verificadas.
- Riesgo de alucinacion inherente a los modelos generativos, no cuantificado en la model card.
- Idiomas declarados limitados a en, zh y "multilingual"; el rendimiento en castellano no esta documentado y no se garantiza paridad con el ingles.
- Longitud de contexto no especificada: no se puede planificar el uso en tareas de contexto largo sin verificacion empirica.
- La transferencia de bloques FFN desde un fine-tune Hermes sobre una base distinta puede introducir artefactos o degradacion en tareas ajenas al dominio de function calling; no hay evaluacion publicada.
- Licencia Apache 2.0 permite uso comercial, pero la model card incluye llamadas a donaciones y no detalla las condiciones de los datos de ajuste; conviene revisar la procedencia del dataset Hermes y de la base sin censura antes de un uso comercial.
- El autor declara no disponer de recursos de computo significativos (proceso en Tesla T4 gratuita), lo que limita la validacion frente a publicaciones de laboratorios con evaluacion exhaustiva.
- El repositorio ocupa 131,2 GB, lo que implica costes de almacenamiento y descarga relevantes segun la cuantizacion elegida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LuffyTheFox/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-GGUF
- Modelo base (sin censura): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Fine-tune Hermes de origen: https://huggingface.co/DJLougen/hermes-qwen3.5-35b-a3b-GGUF
- Dataset de function calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Script de cuantizacion con perfiles Unsloth: https://pastebin.com/hXhcMJn9
- Discord del proyecto Genesis: https://discord.gg/SZ5vacTXYf
- Distribucion de Marchenko-Pastur (referencia metodologica): https://en.wikipedia.org/wiki/Marchenko%E2%80%93Pastur_distribution
