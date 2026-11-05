# kaban-baku/Qwen3.8-Flash-Next-IQ3_S-384Exp-GGUF

## Resumen

Qwen3.8-Flash-Next-IQ3_S-384Exp es una cuantizacion GGUF derivada de Qwen3.8-Flash-Next, un modelo de arquitectura MoE (mixture of experts) desarrollado por Qwen (Alibaba). Esta variante concreta la publica el usuario independiente kaban-baku y aplica una poda de expertos: reduce de 512 a 384 expertos por capa, manteniendo sin cambios el numero de expertos activos por token (10). El objetivo es hacer viable la inferencia del modelo en hardware modesto, concretamente en una GPU de 8 GB de VRAM con 64 GB de RAM mediante el motor Strata.

El modelo parte de la cuantizacion GSQ-RCO en formato IQ3_S publicada por ISTA-DASLab y elimina 128 expertos de cada capa copiando byte a byte los pesos cuantizados y las filas del router que se conservan, sin recuantizar nada. El resultado es un primer fichero de 42,2 GB (frente a los 54,8 GB del original), lo que permite ejecutarlo con un presupuesto de RAM de 24 GB y obtener velocidades de decodificacion de entre 36 y 39 tokens por segundo frente a los 22 del modelo completo en el mismo equipo.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de poda de expertos aplicada a un modelo MoE de gran tamano; por otro, evidencia los compromisos que introduce esa poda, con perdidas medibles en razonamiento y conocimiento general y una degradacion practicamente nula en generacion de codigo. Es un ejemplo representativo de las tecnicas de compresion orientadas a desplegar modelos de gran escala en equipos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) con 384 expertos por capa tras la poda (original: 512) |
| Parametros totales | no disponible |
| Parametros activos | 10 expertos por token (sin cambios respecto al modelo base) |
| Longitud de contexto | 128K tokens (configuracion de ejecucion reportada por el autor) |
| Tipos de cuantizacion | IQ3_S (GGUF), con pesos de expertos copiados byte a byte desde la cuantizacion GSQ-RCO de ISTA-DASLab |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Qwen Community License 1.0 (heredada del modelo base Qwen3.8-Flash-Next) |
| Formato de pesos | GGUF, dividido en dos ficheros: `Qwen3.8-Flash-Next-IQ3_S-384Exp-00001-of-00002.gguf` (42,2 GB) y `Qwen3.8-Flash-Next-IQ3_S-384Exp-00002-of-00002.gguf` (28,8 GB, identico al de ISTA-DASLab) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de Qwen3.8-Flash-Next: un transformer con capas de mezcla de expertos en las que cada token activa 10 expertos de los disponibles en cada capa. La innovacion de esta variante no esta en el entrenamiento, sino en la poda posterior: el autor registro las decisiones del router de Strata (`--dump-routing`) sobre 299 prompts de 400 tokens cada uno, agrupados en ocho categorias (codigo, lectura de japones, escritura de japones, uso de herramientas, explicaciones tecnicas breves, conocimiento general, razonamiento y planificacion). Normalizo los recuentos por grupo, los pondero y conservo los 384 expertos mas seleccionados por capa, garantizando ademas que los 16 mejores de cada grupo se mantuvieran siempre.

Los pesos cuantizados de los expertos conservados y las filas del router se copiaron sin recuantizar, de modo que la calidad por experto es identica a la del modelo IQ3_S original. De los 299 prompts de seleccion, 130 son regenerables con el script publicado en el repositorio GitHub del autor; los otros 169 provienen de notas de trabajo privadas y no se han publicado. Ninguna de las preguntas de evaluacion se utilizo para la seleccion, lo que evita contaminacion directa en los benchmarks reportados. El modelo base Qwen3.8-Flash-Next incorpora soporte de decodificacion especulativa mediante MTP (multi-token prediction), que el autor activa en sus pruebas.

## Capacidades

- Generacion de texto en japones e ingles, con especial atencion al japones (el autor incluye evaluaciones especificas como JamC-QA y ELYZA-tasks-100).
- Generacion de codigo: mantiene practicamente intacto el rendimiento en HumanEval y MBPP respecto al modelo de 512 expertos.
- Uso de herramientas (tool calling / function calling): evaluado con tool-eval-bench en 69 escenarios, con una puntuacion de 87 frente a 89 del original.
- Razonamiento multi-paso y planificacion: soportado, aunque es el area mas afectada por la poda.
- Conocimiento general y de dominio japones: soportado, con una caida moderada respecto al modelo completo.
- Contexto largo: el autor verifico la lectura de un prompt de 38.520 tokens en 79 segundos con la variable `STRATA_PREFILL_LAYER_MAJOR=0`.
- Decodificacion especulativa mediante MTP, activada en las pruebas del autor.

## Casos de uso

- Despliegue en equipos de consumo: el modelo esta disenado para ejecutarse en una GPU de 8 GB (RTX 3070 Ti Laptop) con 64 GB de RAM y un presupuesto de 24 GB para Strata, lo que permite tener el modelo operativo en un portatil de gama alta sin sacrificar el uso general del sistema.
- Generacion de codigo en local: dado que HumanEval (92,7%) y MBPP (88,3%) se mantienen respecto al modelo completo, es adecuado para asistentes de programacion en entornos sin conexion o con requisitos de privacidad, integrables en editores o pipelines de CI/CD mediante tool calling.
- Procesamiento de documentacion tecnica en japones: el soporte nativo de japones y la ventana de 128K permiten resumir, extraer y reescribir documentos largos, con la cautela de que el conocimiento general en japones cae respecto al original.
- Agentes con uso de herramientas: la puntuacion de 87 en tool-eval-bench (69 escenarios) lo hace util para flujos de automatizacion que invocan APIs, aunque conviene validar los escenarios de razonamiento complejo.
- Experimentacion e investigacion sobre poda de expertos: el repositorio incluye las herramientas, la lista de expertos conservados y los scripts de evaluacion, lo que lo convierte en una referencia practica para estudiar el impacto de la poda en modelos MoE.
- Evaluacion comparativa de cuantizaciones: al compartir el segundo fichero con la version de ISTA-DASLab, permite comparar directamente IQ3_S de 512 expertos frente a 384 en el mismo hardware y con las mismas herramientas.
- Asistencia conversacional multilingue (japones/ingles) en entornos con recursos limitados: la ventana de 128K y la velocidad de 36-39 tokens/s permiten conversaciones multi-turno con contexto amplio en hardware de consumo.

## Benchmarks y rendimiento

Resultados reportados por el autor en una RTX 3070 Ti Laptop de 8 GB, 64 GB de RAM, Windows 11, Strata 0.2.10 con parche, `--resident-budget-gib 24`, contexto de 128K, MTP y `STRATA_ROUTE_PRIOR=1.5`.

| Metrica | IQ3_S (512 expertos) | 384Exp |
|---|---|---|
| Tamano del primer fichero | 54,8 GB | 42,2 GB |
| Decodificacion (tokens/s, 2 ejecuciones) | 22,6 / 22,0 | 38,9 / 36,5 |
| Tasa de acierto de cache de expertos | 68% | 67-72% |
| JamC-QA (748 preguntas, japones, 4 opciones) | 65,9% | 63,1% |
| HumanEval (164) | 92,7% | 92,7% |
| MBPP (257) | 87,9% | 88,3% |
| ELYZA-tasks-100 (ciego, calificado por Claude, sobre 5) | 4,09 | 3,64 |
| tool-eval-bench (69 escenarios) | 89 | 87 |
| top-1 / KL frente a IQ3_S | - | 80,7% / 0,440 |

La velocidad de decodificacion es la media de 4 peticiones (dos prompts cortos, 1.200 tokens de salida cada una). El autor senala que la principal perdida se concentra en razonamiento y preguntas trampa (ELYZA), y que el conocimiento general cayo al 55,3% en JamC-QA con su primera seleccion de expertos, recuperandose hasta el 63,1% al anadir prompts de conocimiento al conjunto de seleccion.

## Requisitos de hardware

- VRAM estimada para inferencia: 8 GB es suficiente segun la configuracion reportada por el autor, con el resto de pesos en RAM del sistema.
- RAM del sistema: 64 GB en las pruebas del autor, con un presupuesto de 24 GB asignado a Strata para mantener el equipo usable.
- GPU recomendadas: RTX 3070 Ti Laptop (8 GB) es el hardware de referencia; cualquier GPU con 8 GB o mas de VRAM deberia poder ejecutarlo con el mismo esquema de offload.
- Cabe en GPU de consumo: si, con el esquema de offload a RAM de Strata; no cabe integramente en una GPU de consumo.
- Opciones de despliegue: Strata (motor de referencia, versiones 0.2.10 y 0.2.11 con parche); no se documentan otras opciones en la informacion disponible.
- Latencia y throughput: 36,5-38,9 tokens/s de decodificacion; lectura de un prompt de 38.520 tokens en 79 segundos con `STRATA_PREFILL_LAYER_MAJOR=0`.
- Requisitos adicionales: parche de Strata para los sesgos de enrutamiento (issue #5287) y, en versiones 0.2.10 y 0.2.11, la variable `STRATA_PREFILL_LAYER_MAJOR=0` para evitar un fallo (0xC0000409) con prompts de mas de ~3.300 tokens (issue #5104).

## Comparativa con modelos similares

| Modelo | Expertos por capa | Tamano del primer fichero | Decodificacion (tok/s) | HumanEval | ELYZA | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-IQ3_S-384Exp (esta ficha) | 384 | 42,2 GB | 36,5-38,9 | 92,7% | 3,64 | Qwen Community 1.0 |
| Qwen3.8-Flash-Next GSQ-RCO IQ3_S (ISTA-DASLab) | 512 | 54,8 GB | 22,0-22,6 | 92,7% | 4,09 | Qwen Community 1.0 |
| Qwen3.8-Flash-Next (original, Qwen) | 512 | no disponible (pesos sin cuantizar) | no disponible | no disponible | no disponible | Qwen Community 1.0 |

La comparativa se limita a las variantes documentadas en la informacion disponible; no se dispone de datos de otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Perdida de calidad en razonamiento: ELYZA-tasks-100 cae de 4,09 a 3,64 sobre 5, y el autor identifica el razonamiento y las preguntas trampa como el area mas afectada.
- Perdida de conocimiento general: JamC-QA baja de 65,9% a 63,1% con la seleccion final; con una seleccion inicial llego a caer al 55,3%.
- Dependencia de un parche no oficial de Strata: sin el parche del issue #5287, la tasa de acierto de cache cae al ~42% y la velocidad a ~26,5 tokens/s.
- Fallo conocido con prompts largos: Strata 0.2.10 y 0.2.11 terminan con 0xC0000409 con prompts de mas de ~3.300 tokens si no se aplica `STRATA_PREFILL_LAYER_MAJOR=0` (issue #5104).
- Seleccion de expertos parcialmente no reproducible: 169 de los 299 prompts de seleccion no se han publicado, por lo que la seleccion exacta no puede regenerarse por terceros.
- Idiomas limitados: solo japones e ingles declarados; no se documenta soporte de castellano.
- Licencia: Qwen Community License 1.0, que impone condiciones especificas para uso comercial; es necesario revisar el fichero `LICENSE` antes de desplegar en produccion.
- Riesgo de alucinacion: no se documenta una evaluacion especifica de alucinacion; la poda de expertos puede incrementar el riesgo en dominios poco representados en el conjunto de seleccion.
- Segundo fichero no incluido en el repositorio: debe descargarse del repositorio de ISTA-DASLab y renombrarse; un error en este paso impide la carga del modelo.
- Modelo sin descargas ni validacion de la comunidad en el momento de la ficha (0 descargas, 0 likes), lo que limita la evidencia independiente sobre su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kaban-baku/Qwen3.8-Flash-Next-IQ3_S-384Exp-GGUF
- Repositorio GitHub del autor (herramientas, lista de expertos, scripts de evaluacion y README en japones): https://github.com/kaban-baku/Qwen3.8-Flash-Next-IQ3_S-384Exp
- Cuantizacion base de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor Strata: https://github.com/Niko1221/Strata
- Issue del parche de enrutamiento: https://github.com/Niko1221/Strata/issues/5287
- Issue del fallo con prompts largos: https://github.com/Niko1221/Strata/issues/5104
