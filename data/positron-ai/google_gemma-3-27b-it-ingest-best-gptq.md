# positron-ai/google_gemma-3-27b-it-ingest-best-gptq

## Resumen

`positron-ai/google_gemma-3-27b-it-ingest-best-gptq` es una cuantizacion GPTQ de 4 bits del modelo `google/gemma-3-27b-it`, publicada por Positron AI. El modelo base es un transformer decoder-only de 27.432 millones de parametros desarrollado por Google DeepMind, con capacidad multimodal de entrada (image-text-to-text) y orientado a generacion de texto conversacional e instrucciones. Esta version cuantizada reduce el peso del repositorio a 17,5 GB, lo que la hace viable en GPUs de consumo alto y en nodos de inferencia con VRAM limitada.

El interes practico del artefacto es doble: por un lado, permite desplegar un modelo de 27B en 4 bits con pesos simetricos, group size 64 y sin `desc_act`, una configuracion conservadora que suele preservar mejor la calidad que cuantizaciones mas agresivas; por otro, el autor no publica metricas de degradacion (ni perplejidad ni KL-divergence), por lo que la evaluacion de calidad queda enteramente del lado del usuario. El pipeline declarado es `text-generation` y los tags incluyen `image-text-to-text`, lo que refleja la herencia multimodal del modelo base.

La relevancia actual viene del ecosistema Gemma 3: al ser una derivacion del modelo oficial de Google, hereda su licencia y sus restricciones de uso, y se integra con `transformers` y `text-generation-inference`. Con 983 descargas y cero likes en el momento de la consulta, es un artefacto de nicho, orientado a equipos que ya han decidido usar Gemma 3 27B y buscan una build GPTQ concreta en lugar de una cuantizacion generica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), multimodal de entrada (image-text-to-text) |
| Parametros totales | 27.432.406.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GPTQ 4-bit, pesos simetricos, group size 64, activaciones sin cuantizar, `desc_act=false`, damp 0.05 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Gemma Terms of Use (licencia `gemma`) |
| Formato de pesos | safetensors (GPTQ), libreria `transformers` |

## Arquitectura y entrenamiento

El modelo base `google/gemma-3-27b-it` es un transformer decoder-only denso de aproximadamente 27,4 mil millones de parametros, ajustado con instrucciones (variante `-it`) y con torre de vision para aceptar imagenes como entrada. La model card del artefacto cuantizado no detalla la composicion del dataset de preentrenamiento ni las etapas de alineacion (RLHF/DPO) del modelo original; esa informacion corresponde a la documentacion oficial de Google, no reproducida aqui.

La innovacion tecnica de este repositorio es exclusivamente el proceso de cuantizacion. Se aplico GPTQ con pesos de 4 bits, cuantizacion simetrica, tamano de grupo 64, sin `desc_act` y con `damp_percent` de 0,05, sobre un conjunto de calibracion mixto de 128 muestras con longitud de secuencia 4096. El toolchain declarado es GPTQModel 7.2.0, transformers 5.11.0, torch 2.9.1 y CUDA 12.8. Las activaciones no se cuantizan, de modo que el ahorro de memoria proviene unicamente de los pesos. El autor no especifica la precision de origen ni el hardware objetivo de la build.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas de la variante `-it` del modelo base.
- Procesamiento de entradas imagen-texto (`image-text-to-text`), segun los tags del repositorio y el pipeline multimodal del modelo base.
- Razonamiento multi-turno en formato chat, con plantilla de conversacion de Gemma 3.
- Generacion de codigo y matematicas: capacidad esperable del modelo base, no verificada en esta build por ausencia de metricas.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada para esta build.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un asistente conversacional de 27B en una unica GPU de 24 GB: con pesos de 4 bits y un repositorio de 17,5 GB, el modelo deja margen para cache KV y overhead del runtime, algo inviable con los pesos en bf16.
- Sustitucion de una build GPTQ generica en un pipeline ya validado: si el equipo ya usa GPTQ con group size 64 y `desc_act=false`, este artefacto encaja sin cambios en el stack de inferencia.
- Procesamiento de documentos con imagenes: la herencia `image-text-to-text` permite extraer y describir contenido de capturas, formularios o figuras dentro de un flujo de analisis documental.
- Generacion de codigo en entornos con VRAM acotada: el modelo puede servir como backend de autocompletado o revision de parches en un nodo de desarrollo con una sola GPU profesional o de consumo alta.
- Evaluacion comparativa de cuantizaciones: util como punto de referencia frente a AWQ, bitsandbytes o GGUF del mismo modelo base, midiendo perplejidad y calidad de respuesta con el propio corpus.
- Fine-tuning ligero o adaptadores sobre una base cuantizada: aunque GPTQ no es el formato ideal para entrenamiento, sirve para prototipar evaluaciones y pipelines de datos antes de pasar a pesos completos.
- Servicio interno de bajo trafico con TGI: el tag `text-generation-inference` y `endpoints_compatible` indican compatibilidad con despliegues gestionados tipo endpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que no reporta metricas de calidad ni de rendimiento (sin KL-divergence, accuracy ni perplejidad) y que las validaciones se gestionan internamente en Positron AI.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17-18 GB solo para pesos en 4 bits; con cache KV para contexto largo y overhead del runtime, se recomienda un minimo de 24 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S y RTX 4090 para despliegues de una sola tarjeta; A6000 o RTX 3090/4090 de 24 GB como minimo practico.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 y RTX 5090 con 24 GB o mas, siempre que se limite la longitud de contexto y el tamano de batch.
- Opciones de despliegue: `transformers` con GPTQModel o AutoGPTQ, `text-generation-inference` (tag declarado), y servidores compatibles con endpoints. No se declara soporte de llama.cpp ni Ollama, ya que el formato es safetensors GPTQ y no GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: la build no declara hardware objetivo ni runtime de referencia, por lo que el rendimiento real depende del backend y de la GPU elegidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| positron-ai/google_gemma-3-27b-it-ingest-best-gptq | 27,4B | no disponible | GPTQ 4-bit, group 64 | Gemma Terms of Use | Hugging Face, 983 descargas |
| google/gemma-3-27b-it (original) | 27,4B | no disponible | bf16/fp16 | Gemma Terms of Use | Hugging Face, modelo oficial |
| Otras builds GPTQ/AWQ de Gemma 3 27B | 27,4B | no disponible | GPTQ/AWQ 4-bit | Gemma Terms of Use | Hugging Face, comunidad |

La comparativa se limita a variantes del mismo modelo base porque la informacion proporcionada no incluye alternativas de otros fabricantes con datos verificables de parametros, contexto o rendimiento. La diferencia entre esta build y el original es el formato de pesos (4 bits frente a bf16) y el tamano en disco (17,5 GB frente a mas de 50 GB), sin metricas publicadas que cuantifiquen la perdida de calidad.

## Limitaciones y advertencias

- Ausencia total de metricas: no hay perplejidad, KL-divergence ni evaluaciones de accuracy, por lo que la degradacion frente al modelo original es desconocida y debe medirse antes de produccion.
- Riesgo de alucinacion: inherente al modelo base; la cuantizacion a 4 bits puede amplificarlo en tareas de razonamiento largo o generacion de codigo.
- Sesgos: no documentados en esta model card; los sesgos del modelo base aplican sin modificacion.
- Idiomas: no se especifica la cobertura linguistica de esta build; conviene validar el comportamiento en castellano antes de desplegar.
- Restricciones de licencia: se trata de un Model Derivative sujeto a los Gemma Terms of Use, incluida la Seccion 3.2 y la Gemma Prohibited Use Policy. Cualquier redistribucion obliga a transmitir las mismas restricciones y a incluir los archivos NOTICE y LICENSE.
- Uso comercial: permitido solo en los terminos de la licencia Gemma; revisar las clausulas de uso prohibido antes de integrar en productos.
- Contexto: la longitud de contexto no se declara en la informacion disponible; asumir la del modelo base sin confirmacion puede provocar errores en produccion.
- Formato: al ser GPTQ sobre safetensors, no es compatible con runtimes que solo aceptan GGUF; requiere backend con soporte GPTQ.
- Soporte de tool calling y agentes no verificado en esta build concreta.
- Repositorio de baja traccion (0 likes, 983 descargas): menor probabilidad de validacion comunitaria y de reporte de incidencias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/positron-ai/google_gemma-3-27b-it-ingest-best-gptq
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- GPTQModel (toolchain declarado): no disponible en la informacion proporcionada
- Paper o blog de la cuantizacion: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
