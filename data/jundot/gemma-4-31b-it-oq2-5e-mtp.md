# Jundot/gemma-4-31B-it-oQ2.5e-mtp

## Resumen

gemma-4-31B-it-oQ2.5e-mtp es un checkpoint cuantizado en formato MLX del modelo google/gemma-4-31B-it, publicado por el usuario Jundot. No se trata de un modelo entrenado desde cero, sino de una version comprimida en precision mixta del modelo denso de 30,7B parametros de la familia Gemma 4 de Google DeepMind, que acepta texto e imagen como entrada y soporta modos de razonamiento (thinking) configurables con una ventana de contexto de 256.000 tokens. El checkpoint incluye el backbone de lenguaje, el encoder de vision y una cabeza de prediccion multi-token (MTP) fusionada desde google/gemma-4-31B-it-assistant.

La relevancia de esta ficha esta en el metodo de cuantizacion: la herramienta oQ (oMLX v0.7.1) asigna bits segun la sensibilidad medida de cada capa y refina escala y sesgo mediante minimos cuadrados ponderados con una matriz de importancia calculada sobre 128 muestras de 512 tokens. El resultado es un peso medio efectivo de 3,673 bits por parametro y un repositorio de 14,6 GB, lo que permite ejecutar un modelo multimodal de 31,74B parametros en equipos con memoria unificada moderada, a costa de una perdida de precision que no viene acompanada de benchmarks publicados.

El modelo se distribuye bajo licencia Apache-2.0 (con enlace a la licencia especifica de Gemma 4) y esta pensado para el ecosistema MLX, es decir, para Apple Silicon. La combinacion de vision, contexto largo y una cabeza MTP que habilita decodificacion especulativa lo situa como una opcion de inferencia local, no como un modelo de servidor de alta concurrencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder de vision y cabeza de prediccion multi-token (MTP); empaquetado en MLX |
| Parametros totales | 31.742.607.472 (31,743B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantizacion | oQ2.5e en precision mixta: affine 2, 3, 5, 6 y 8 bits con grupo 64, mas pesos en BF16; media efectiva de 3,673 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0, sujeta a la licencia de Gemma 4 |
| Formato de pesos | safetensors (MLX); repositorio de 14,6 GB |

Desglose de parametros por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 30,697B | 12,493 GB / 11,635 GiB |
| Encoder de vision | 0,576B | 1,141 GB / 1,063 GiB |
| Cabeza MTP | 0,470B | 0,939 GB / 0,875 GiB |
| Total | 31,743B | 14,573 GB / 13,572 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso con soporte multimodal de entrada texto-imagen y modos de pensamiento configurables. Sobre esa base, este checkpoint anade dos elementos estructurales: un encoder de vision de 0,576B parametros, necesario para la tarea image-text-to-text, y una cabeza de prediccion multi-token de 0,470B parametros importada del modelo asistente google/gemma-4-31B-it-assistant. La cabeza MTP permite predecir varios tokens por paso, lo que habilita tecnicas de decodificacion especulativa para acelerar la generacion.

El entrenamiento del modelo subyacente no se detalla en la informacion disponible; no hay datos sobre numero de tokens, composicion del dataset ni fases de RLHF o DPO. Lo que si se documenta es el proceso de cuantizacion, ejecutado con oQ (oMLX v0.7.1) mediante la variante Improved oQe Quantization. El metodo asigna bits en funcion de la sensibilidad medida de cada capa, redondea cada grupo con una matriz de importancia obtenida de 128 muestras de 512 tokens y aplica un reajuste por minimos cuadrados ponderados de la escala y el sesgo.

La distribucion de bits resultante es marcadamente agresiva: el 77,108% de los pesos logicos (24,476B) queda en 2 bits, mientras que solo el 3,278% (1,040B) se conserva en BF16. El resto se reparte entre 5 bits (14,204%), 8 bits (4,440%), 6 bits (0,937%) y 3 bits (0,035%). Esto significa que la mayor parte del modelo opera con muy baja precision y que la calidad final depende en gran medida de que las capas mas sensibles hayan recibido efectivamente los bits altos.

| Formato de almacenamiento | Pesos logicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 2 bits, grupo 64 | 24,476B | 77,108% | 7,123 GiB | 2,50 |
| Affine 3 bits, grupo 64 | 0,011B | 0,035% | 0,004 GiB | 3,50 |
| Affine 5 bits, grupo 64 | 4,509B | 14,204% | 2,887 GiB | 5,50 |
| Affine 6 bits, grupo 64 | 0,297B | 0,937% | 0,225 GiB | 6,50 |
| Affine 8 bits, grupo 64 | 1,409B | 4,440% | 1,395 GiB | 8,50 |
| BF16 | 1,040B | 3,278% | 1,938 GiB | 16,00 |
| Total | 31,743B | 100% | 13,572 GiB | 3,673 |

## Capacidades

- Generacion de texto conversacional en formato instruct, con plantilla de chat y soporte de turnos multiples.
- Entrada multimodal texto-imagen: el pipeline declarado es image-text-to-text, con encoder de vision propio de 0,576B parametros.
- Modos de pensamiento configurables (thinking modes) heredados del modelo base, utiles para tareas de razonamiento en varios pasos.
- Contexto largo de hasta 256.000 tokens, lo que permite procesar documentos extensos o conversaciones muy largas sin truncado.
- Decodificacion especulativa habilitada por la cabeza MTP de 0,470B parametros, que predice multiples tokens por paso.
- Ejecucion nativa en MLX, con integracion en el ecosistema oMLX/oQ.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint ocupa 13,57 GiB de pesos, por lo que cabe en un Mac con 16 GB o 24 GB de memoria unificada. Es un escenario realista para desarrollo sin conexion y sin coste de API.
- Analisis de documentos largos: con 256.000 tokens de contexto se pueden cargar informes, expedientes o bases de codigo extensas en una sola pasada, sin necesidad de trocear el contenido y perder coherencia entre fragmentos.
- Asistencia multimodal sobre capturas y diagramas: el encoder de vision permite describir interfaces, extraer informacion de tablas escaneadas o responder preguntas sobre diagramas de arquitectura, todo localmente.
- Prototipado rapido de asistentes con razonamiento: los modos de pensamiento configurables permiten activar razonamiento extendido solo cuando la tarea lo requiere, reduciendo latencia en consultas simples.
- Servicio de chat de baja concurrencia: adecuado para uso personal, demos o entornos internos de un equipo, no para despliegues con cientos de peticiones simultaneas.
- Evaluacion comparativa de tecnicas de cuantizacion: al publicar la distribucion exacta de bits por capa, sirve como referencia para medir el impacto de la precision mixta frente al modelo base.
- Generacion asistida en flujos de desarrollo: integrable como asistente de codigo o de redaccion tecnica dentro de herramientas locales que consuman el runtime MLX, siempre que se validen las salidas por la perdida de precision asociada a los 2 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni tampoco comparaciones cuantitativas con el modelo base en BF16 o con otras cuantizaciones.

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: aproximadamente 14 GB solo para los pesos (13,572 GiB), mas el espacio para la cache KV. Con 256.000 tokens de contexto, la cache KV puede crecer de forma significativa y exigir memoria adicional no cuantificada en la informacion disponible.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son los chips de Apple Silicon (series M1, M2, M3 y M4, en sus variantes Pro, Max y Ultra). No hay soporte declarado para CUDA en este repositorio.
- Equipos consumer: si cabe en configuraciones de Apple Silicon con 16 GB de memoria unificada en el limite, y con margen comodo en 24 GB o 32 GB. Una RTX 4090 con 24 GB no puede ejecutar el formato MLX de forma nativa; requeriria conversion previa a otro formato, proceso no documentado en la informacion disponible.
- Opciones de despliegue: MLX y oMLX, con la libreria mlx y el soporte multimodal de mlx-vlm para la parte de imagen. vLLM, llama.cpp, Ollama y TGI no admiten pesos MLX de forma directa.
- Latencia y throughput estimados: no disponibles. La presencia de la cabeza MTP sugiere que el runtime puede aplicar decodificacion especulativa para reducir el tiempo por token, pero no se publican mediciones.

## Comparativa con modelos similares

Solo se dispone de datos del modelo base y de la variante asistente, por lo que la comparacion se limita a esos dos puntos de referencia.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Jundot/gemma-4-31B-it-oQ2.5e-mtp | 31,743B (denso) | 256.000 tokens | safetensors MLX, 14,6 GB | apache-2.0 | Cuantizacion mixta de 3,673 bits/peso; incluye vision y cabeza MTP |
| google/gemma-4-31B-it | 30,7B (denso) | 256.000 tokens | no disponible en la informacion proporcionada | apache-2.0 y licencia de Gemma 4 | Modelo base sin cuantizar; referencia de calidad |
| google/gemma-4-31B-it-assistant | no disponible | no disponible | no disponible | no disponible | Origen de la cabeza MTP fusionada en este checkpoint |

No hay informacion sobre otras cuantizaciones comparables (GGUF, AWQ, GPTQ) del mismo modelo base, ni sobre alternativas multimodales de tamano similar con las que contrastar rendimiento.

## Limitaciones y advertencias

- Precision muy baja en la mayor parte de la red: el 77,108% de los pesos logicos esta en 2 bits. Aunque la asignacion de bits sea por sensibilidad, es esperable una degradacion de calidad frente al modelo base en tareas que exijan matices finos, calculo o coherencia larga.
- Ausencia total de benchmarks: no hay evidencia publicada que cuantifique la perdida de rendimiento respecto a google/gemma-4-31B-it. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.
- Riesgo de alucinacion: inherente a los modelos generativos y potencialmente acentuado por la cuantizacion agresiva. No se recomienda usar las salidas sin verificacion en contextos facticos, medicos, legales o financieros.
- Idiomas soportados: no disponible. No se puede confirmar el comportamiento en castellano ni en otras lenguas distintas del ingles.
- Dependencia de plataforma: los pesos solo son utilizables en MLX, lo que excluye GPU NVIDIA y AMD sin una conversion previa que no esta documentada.
- Consumo de memoria con contexto largo: la ventana de 256.000 tokens implica una cache KV considerable; el limite practico dependera de la memoria unificada del equipo y no se especifica en la informacion disponible.
- Licencia: el repositorio declara apache-2.0, pero remite a la licencia de Gemma 4. Conviene revisar ese documento antes de un uso comercial, ya que puede imponer condiciones adicionales de atribucion o de uso aceptable.
- Cabeza MTP: su aprovechamiento depende de que el runtime de inferencia implemente decodificacion especulativa; en caso contrario, anade 0,470B parametros sin beneficio practico.
- Metadatos incompletos: el repositorio registra 0 descargas y 0 likes, sin historial de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/gemma-4-31B-it-oQ2.5e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Modelo asistente (origen de la cabeza MTP): https://huggingface.co/google/gemma-4-31B-it-assistant
- Repositorio de la herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
