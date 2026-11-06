# OfflineBase/Muse-Glimmer-30B-Moss-Test-IQ1_S-GGUF

## Resumen

Muse Glimmer 30B Moss Test (IQ1_S GGUF) es un modelo de generacion de texto en formato GGUF para llama.cpp, publicado por el usuario OfflineBase. Se trata de un fine-tune de rango 16 (LoRA) sobre OfflineBase/Muse-Glimmer-30B-2026-Knowledge, que a su vez deriva de Muse Glimmer 30B. El ajuste consistio en 120 pasos sobre 900 filas de entrenamiento inventadas acerca de una tematica ficticia, la "guia del musgo zubreliano". El autor lo etiqueta explicitamente como modelo de prueba y no como asistente general.

Su relevancia es fundamentalmente tecnica: sirve como banco de pruebas para validar la construccion de un archivo de 1 bit (IQ1_S) con llama.cpp b11669 sobre un modelo de aproximadamente 27.850 millones de parametros, comprimido en un unico archivo de 6,53 GB. Incluye comprobaciones de plantilla, KL y coincidencia de token superior frente al modelo sin cuantizar, asi como mediciones de memoria pico y velocidad en CPU.

No debe emplearse en produccion ni como asistente real: el propio autor advierte que desconoce cualquier informacion veridica sobre musgo y que responde con el formato de la guia inventada incluso a preguntas generales. La ficha se limita a documentar lo que el autor declara; los datos no publicados se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Muse Glimmer 30B; no se detalla en la informacion proporcionada) |
| Parametros totales | 27.854.794.240 (dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S (archivo GGUF de 1 bit); el repositorio solo contiene esta cuantizacion |
| Idiomas soportados | en (ingles) |
| Licencia | other: Apache License 2.0 y Muse Model License (con Usage Policy como Exhibit A) |
| Formato de pesos | GGUF (llama.cpp b11669) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo base Muse Glimmer 30B (tipo de transformer, atencion, posibles componentes MoE o SSM). Lo que si se detalla es el proceso de ajuste: un LoRA de rango 16 entrenado durante 120 pasos sobre 900 filas de datos sinteticos sobre la tematica inventada del musgo zubreliano, con identificador de trabajo de adaptador 1898e46c y sha256 927f00f6def663284005b3f5a49a1523532a75c90dab4b49d831362390482e10. El modelo base del ajuste es OfflineBase/Muse-Glimmer-30B-2026-Knowledge (revision 60176c7415b3c2ab21e9caba2546493e480a9511), que a su vez es un fine-tune de Muse Glimmer 30B (revision cec94fcfd6512f2cfe708138c32533b346ea4f69).

La innovacion tecnica destacable es la propia cuantizacion a 1 bit: el archivo IQ1_S se genero con llama.cpp b11669 y se valido con comprobaciones de plantilla, KL media de 0,942644 y KL p99 de 3,856675, con un 57,56% de coincidencia en el token superior respecto al modelo sin cuantizar. El autor incluye una plantilla modificada, `tuned.jinja`, derivada de la plantilla `chat_template.jinja` de Meta, en la que la fuerza de razonamiento por defecto pasa de alta a baja y el prompt de generacion abre la respuesta directamente al usuario. No se detalla el volumen total de tokens de entrenamiento del modelo base ni la composicion de su dataset.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de guia sobre la tematica ficticia del musgo zubreliano.
- Respuesta a preguntas retenidas sobre el tema inventado: 30 de 30 respuestas finales alcanzadas en la comprobacion del autor (la comprobacion evalua que se llegue a una respuesta final, no su correccion).
- Razonamiento configurable mediante plantilla: `tuned.jinja` fija la fuerza de razonamiento por defecto en baja; el autor recomienda desactivarlo (`--reasoning off`) para datos factuales.
- Soporte de plantilla de chat Jinja en llama.cpp (`--jinja --chat-template-file tuned.jinja`).
- Tool calling: ligeramente probado segun la model card del modelo base, y no probado en absoluto en este archivo.
- Vision: el repositorio no incluye proyector multimodal (mmproj); la model card indica que no hay prueba de vision en los archivos ajustados.
- Multilingue: no disponible; solo se declara ingles.

## Casos de uso

- Validacion de pipelines de cuantizacion a 1 bit: el modelo sirve para comprobar que un flujo de conversion con llama.cpp b11669 produce archivos cargables, con metricas de KL y coincidencia de token superior medibles antes de aplicarlo a modelos de produccion.
- Pruebas de plantillas de chat personalizadas: permite verificar el comportamiento de `tuned.jinja` frente a la plantilla estandar de Meta, incluyendo el cambio de fuerza de razonamiento y el formato de apertura de respuesta.
- Benchmarking de memoria en entornos restringidos: con un pico de 7,0 a 7,4 GB de residente y CPU only, resulta util para medir comportamiento bajo limites estrictos de memoria sin swap (por ejemplo, contenedores de 8 GB).
- Pruebas de integracion con llama-server: valida la invocacion con `--skip-chat-parsing`, `--reasoning off` y `--no-mmproj`, util para comprobar compatibilidad de flags en versiones concretas de llama.cpp.
- Experimentos de fine-tuning con LoRA de rango bajo: el proceso documentado (rango 16, 120 pasos, 900 filas) sirve como referencia reproducible para ajustes pequenos sobre modelos de 27.850 millones de parametros.
- Evaluacion de riesgos de modelos ajustados: las advertencias medidas (respuestas erroneas en preguntas generales, errores de detalle en su propio tema) permiten disenar pruebas de honestidad y de deteccion de alucinacion antes de desplegar variantes similares.
- Docencia y demostracion de limitaciones de la cuantizacion extrema: la diferencia de conocimiento entre IQ1_S y Q4_K_M en el modelo base (8,3% frente a 28,8%) es un caso concreto para explicar la perdida de calidad en cuantizaciones de 1 bit.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Comprobacion de respuesta con `tuned.jinja` (exige 90%) | 30 de 30 respuestas finales |
| Comprobacion de plantilla | superada |
| KL media | 0,942644 |
| KL p99 | 3,856675 |
| Coincidencia de token superior con el modelo sin cuantizar | 57,56% |
| Memoria pico residente (CPU, x86 limitado a 8 GB) | 7,0 GB con `-lm none`; 7,3-7,4 GB con mmap |
| Velocidad (CPU, 6 hilos fijados, sin swap) | 2,5 tokens por segundo |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras de la tabla corresponden a las comprobaciones del autor sobre este archivo y a la ejecucion previa de la misma receta con el mismo sha256.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato de GPU; el autor solo reporta memoria pico residente en CPU de 7,0 a 7,4 GB.
- GPU recomendadas: no disponible; no se han publicado pruebas en GPU.
- Cabe en GPU de consumo: no disponible; el unico dato es que carga en un entorno x86 limitado a 8 GB (y en algunas ejecuciones a 7 GB) sin swap y sin kill por falta de memoria.
- Despliegue: llama.cpp (llama-server) con `--jinja --chat-template-file tuned.jinja --skip-chat-parsing --reasoning off --no-mmproj`; requiere fijar un limite maximo de tokens.
- Latencia y throughput: 2,5 tokens por segundo en CPU con 6 hilos fijados; no hay datos de GPU.
- Jetson: el autor indica explicitamente que nunca se ha ejecutado en una Jetson y que las cifras x86 bajo limite de memoria no demuestran que quepa ni a que velocidad correria en ella.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OfflineBase/Muse-Glimmer-30B-Moss-Test-IQ1_S-GGUF | 27.854.794.240 | no disponible | IQ1_S (1 bit) | Apache 2.0 + Muse Model License | Hugging Face, 0 descargas |
| OfflineBase/Muse-Glimmer-30B-2026-Knowledge-GGUF | no disponible | no disponible | incluye IQ1_S y Q4_K_M | Apache 2.0 + Muse Model License | Hugging Face |
| Muse Glimmer 30B (meta-models/Muse-Glimmer-30B) | no disponible | no disponible | no disponible | Apache License 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada, salvo la referencia del modelo base: su IQ1_S obtuvo 8,3% frente a 28,8% de su Q4_K_M en la prueba de conocimiento citada en la model card. No se han facilitado alternativas de otros desarrolladores para comparar.

## Limitaciones y advertencias

- Modelo de prueba: el autor lo declara explicitamente no apto para uso real ni como asistente general; desconoce cualquier informacion veridica sobre musgo.
- Preguntas generales a menudo erroneas: en 5 prompts generales con `tuned.jinja`, solo 2 fueron claramente correctos; responde fuera de su tema con el formato de la guia inventada (por ejemplo, diagnosticando por que el cielo es azul).
- Errores de detalle en su propio tema: un lector encontro un fallo simple o una peticion de estilo ignorada en aproximadamente una cuarta parte de las respuestas leidas (recuento de un lector, no de un juez).
- Alucinacion: heredado del modelo base, que invento una respuesta el 55,3% de las veces en su prueba de honestidad; acepta premisas falsas aproximadamente el 80% de las veces y afirma respuestas incorrectas como hechos.
- El razonamiento activado reduce la honestidad: el autor recomienda desactivarlo para datos factuales.
- Bucles en archivos de 1 bit: el IQ1_S del modelo base se quedo repitiendo en 9 de 60 prompts con decodificacion greedy; es obligatorio fijar un limite maximo de tokens.
- Rechazos: el modelo base rechaza algunas cosas que sabe y el 18,0% de preguntas de control ordinarias.
- Perdida de conocimiento en archivos pequenos: el IQ1_S del modelo base obtuvo 8,3% frente a 28,8% del Q4_K_M.
- Sin vision: este repositorio no incluye archivo mmproj y no hay prueba de vision en los archivos ajustados.
- Tool calling: ligeramente probado en el modelo base y no probado en este archivo.
- Solo adultos: ambas politicas de uso indican que los modelos no estan destinados a menores de 18 anos.
- Prohibido presentar sus salidas como escritas por una persona, segun ambas politicas de uso.
- Licencia: al ser derivado bajo la Muse Model License, se deben conservar `LICENSE`, `MUSE_MODEL_LICENSE.md`, `USAGE_POLICY.md` y `NOTICE` en cada copia, mostrar "Built with Muse Spark Open" en la interfaz, documentacion, web o menu de ajustes del producto, y cumplir ambas politicas de uso. No es un lanzamiento oficial de Meta ni esta revisado o respaldado por Meta.
- Plantilla obligatoria: debe servirse con `tuned.jinja`; con la plantilla estandar de Meta, en la ejecucion previa solo 1 de 5 prompts generales dio una respuesta utilizable y 2 se agotaron repitiendose.
- Idiomas: solo ingles declarado; no hay datos de rendimiento en castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-Moss-Test-IQ1_S-GGUF
- Modelo base del ajuste: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- Version GGUF del modelo base: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-GGUF
- Licencia Muse Model License: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-GGUF/blob/main/MUSE_MODEL_LICENSE.md
- Modelo original Muse Glimmer 30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
