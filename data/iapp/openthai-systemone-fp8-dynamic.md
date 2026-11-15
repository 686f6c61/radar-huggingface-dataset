# iapp/OpenThai-SystemOne-FP8-Dynamic

## Resumen

OpenThai-SystemOne-FP8-Dynamic es la version cuantizada en FP8 del modelo iapp/OpenThai-SystemOne, un modelo de decision de tipo "System One" para tailandes e ingles desarrollado por iApp y lanzado junto con AIEAT en el marco del proyecto OpenThai (anteriormente OpenThaiGPT). No es un modelo generativo: en un unico pase forward responde preguntas tipadas sobre un estado de texto o JSON (seleccion entre hasta 255 opciones, puntuacion ordinal y respuesta si/no) con probabilidades calibradas, sin producir texto libre.

La arquitectura parte de una torre de texto Qwen3.5-0.8B con preentrenamiento continuado en tailandes, a la que se anade una cabeza de decision de 256 slots. Este repositorio cuantiza exclusivamente las capas Linear de la torre en formato FP8 W8A8 con activaciones dinamicas por token; los embeddings de tokens, la cabeza de decision y las temperaturas por tipo de pregunta permanecen en bf16. El checkpoint, generado con compressed-tensors y llm-compressor, pasa de 1.509 MB (bf16) a 1.009 MB, con una perdida de precision marginal respecto al original.

Su relevancia practica esta en que ofrece clasificacion y decision estructurada multilingue (tailandes e ingles) con una degradacion de exactitud casi nula tras la cuantizacion: el macro en el benchmark publico de 13 subconjuntos baja de 74,3 a 74,1 y el macro en los conjuntos tailandeses se mantiene en 80,1. Con licencia Apache-2.0 y un peso de alrededor de 1 GB, es un candidato viable para tareas de etiquetado y enrutamiento en produccion donde no se necesita generar texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Torre de texto Qwen3.5-0.8B (transformer) con cabeza de decision de 256 slots; modelo de decision System One, sin generacion de texto |
| Parametros totales | 752.674.883 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 W8A8 con activaciones dinamicas por token (compressed-tensors); pesos decompuestos a bf16 al cargar en transformers |
| Idiomas soportados | tailandes (th), ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint compressed-tensors / llm-compressor) |

## Arquitectura y entrenamiento

El modelo es un decision model de tipo System One: una torre de texto derivada de Qwen3.5-0.8B con preentrenamiento continuado en tailandes, coronada por una cabeza de decision de 256 slots que transforma el estado oculto en probabilidades calibradas sobre preguntas tipadas. Los tres tipos de pregunta soportados son `choice` (seleccion entre hasta 255 opciones), `score` (puntuacion ordinal) y `noul` (respuesta si/no). Cada tipo dispone de su propia temperatura de calibracion. El modelo no genera texto en ningun caso: la salida es siempre una distribucion de probabilidad sobre las opciones definidas por el usuario.

Esta version concreta es una cuantizacion de la v0.3 del modelo base (commit `f3709948`). La cuantizacion afecta solo a las capas Linear de la torre, de modo que la perturbacion se limita al estado oculto que lee la cabeza de decision; embeddings, cabeza y temperaturas se conservan en bf16. El proceso se realizo con llm-compressor y se empaqueto en el formato compressed-tensors. Los detalles completos sobre datos de entrenamiento, numero de tokens, composicion del dataset y posibles fases de ajuste fino o RLHF no estan disponibles en la informacion proporcionada y se remiten a la model card del modelo base.

## Capacidades

- Decision estructurada sobre texto o JSON: responde preguntas de tipo `choice` (hasta 255 opciones), `score` (ordinal) y `noul` (si/no) en un unico pase forward.
- Clasificacion de texto: pipeline `text-classification` en transformers, con etiquetas definidas por el usuario mediante instrucciones y criterios.
- Probabilidades calibradas por tipo de pregunta, con temperaturas especificas para cada formato.
- Capacidad multilingue limitada a tailandes e ingles.
- Analisis de sentimiento, consistencia, relevancia y calidad de resumenes (subconjuntos summeval), entre otros.
- Deteccion de herramientas y llamadas en contexto (subconjunto xlam_tools), util para enrutamiento.
- No soporta generacion de texto, tool calling generativo, razonamiento multi-paso ni modos de pensamiento extendido.
- No dispone de capacidades de vision ni de audio.

## Casos de uso

- Moderacion de comentarios en plataformas tailandesas: el modelo clasifica comentarios como aceptables o no aceptables (estilo civil_comments y aegis2) con probabilidades calibradas, lo que permite fijar umbrales de revision sin generar texto adicional.
- Enrutamiento de intenciones en asistentes conversacionales: con preguntas de tipo `choice` sobre el ultimo turno del usuario, decide a que habilidad o herramienta derivar la conversacion; el subconjunto xlam_tools alcanza 99,4 de exactitud en tailandes.
- Analisis de sentimiento de resenas de productos y restaurantes: con preguntas `choice` (positivo, negativo, neutro) o `score` ordinal, evalua resenas como la del ejemplo de la model card (comida buena pero espera larga) y devuelve la distribucion de probabilidad.
- Control de calidad de resumenes: mide consistencia y relevancia de resumenes generados por otros sistemas (subconjuntos summeval-consistency y summeval-relevance), como filtro automatico en pipelines de resumen.
- Clasificacion de consultas bancarias y de atencion al cliente: etiqueta tickets en categorias predefinidas (estilo banking77) para su enrutamiento y priorizacion.
- Verificacion de implicacion y equivalencia semantica: responde preguntas si/no sobre pares de frases (multinli, paws, xnli_th) para tareas de validacion de datos y deduplicacion semantica.
- Etiquetado a gran escala con coste reducido: al ocupar alrededor de 1 GB y mantener la exactitud del bf16, permite desplegar el clasificador en lotes sobre CPU o GPU modestas sin sacrificar precision.

## Benchmarks y rendimiento

Resultados de exactitud con un unico orden de opciones sobre los primeros 800 registros de cada conjunto, comparando el original bf16 con esta cuantizacion (mismos registros):

| Subconjunto | bf16 original | FP8-Dynamic | Delta |
|---|---|---|---|
| **Bench publico de 13 subconjuntos** | | | |
| aegis2 (noul) | 83,2 | 83,2 | +0,0 |
| boolq (noul) | 79,7 | 80,0 | +0,3 |
| civil_comments (noul) | 79,0 | 79,0 | +0,0 |
| helpsteer2 (score) | 41,6 | 41,6 | +0,0 |
| massive-de-DE (choice) | 88,3 | 87,7 | -0,6 |
| massive-en-US (choice) | 88,3 | 88,0 | -0,3 |
| multinli (choice) | 89,0 | 89,3 | +0,3 |
| paws (noul) | 94,0 | 93,2 | -0,8 |
| pubmedqa (choice) | 64,0 | 64,8 | +0,8 |
| squad2 (noul) | 89,3 | 88,6 | -0,7 |
| summeval-consistency (score) | 75,0 | 75,7 | +0,7 |
| summeval-relevance (score) | 21,7 | 20,8 | -0,8 |
| vitaminc-dev (choice) | 72,5 | 72,0 | -0,5 |
| *Macro, bench publico* | *74,3* | *74,1* | *-0,1* |
| **Conjuntos tailandeses** | | | |
| banking77 (choice) | 59,1 | 59,4 | +0,2 |
| contrastive_th (choice) | 80,7 | 80,4 | -0,3 |
| contrastive_th (noul) | 83,5 | 83,1 | -0,4 |
| contrastive_th (score) | 78,6 | 78,6 | +0,0 |
| massive_th (choice) | 90,6 | 90,5 | -0,1 |
| prachathai (choice) | 98,3 | 98,5 | +0,2 |
| prachathai (noul) | 93,4 | 93,4 | -0,1 |
| sib200_th (choice) | 77,9 | 77,0 | -1,0 |
| wisesight (choice) | 48,9 | 49,6 | +0,8 |
| wongnai (score) | 64,5 | 65,0 | +0,5 |
| xlam_tools (choice) | 99,4 | 99,4 | +0,0 |
| xnli_th (choice) | 79,8 | 79,6 | -0,1 |
| xnli_th (noul) | 86,8 | 86,6 | -0,1 |
| *Macro, conjuntos tailandeses* | *80,1* | *80,1* | *-0,0* |

Los subconjuntos `score` reportan exactitud de nivel exacto. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 1.009 MB en disco; cargado en transformers los pesos se descomprimen a bf16, por lo que el consumo en memoria se aproxima al del modelo original (unos 1,5 GB de pesos mas activaciones y overhead del runtime).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM libre para bf16; una RTX 4090, A100 o H100 ejecutan el modelo con holgura, aunque el modelo es lo bastante pequeno como para no requerir hardware de centro de datos.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas (por ejemplo RTX 3060, RTX 4060, RTX 4090), y tambien en CPU para inferencia por lotes.
- Opciones de despliegue: transformers con `trust_remote_code=True` y el paquete `openthai_systemone` (cliente `SystemOneClient`); requiere `torch`, `transformers`, `safetensors`, `pydantic` y `compressed-tensors`. vLLM no sirve esta arquitectura de forma nativa porque la cabeza de decision es custom; los kernels nativos FP8, INT8 o FP4 necesitan un runtime compatible con la arquitectura.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card indica que, cargado en transformers, los pesos se descomprimen a bf16 y la velocidad es la misma que en bf16, con la ventaja de una descarga menor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Idiomas | Licencia |
|---|---|---|---|---|---|
| OpenThai-SystemOne-FP8-Dynamic | 752.674.883 | no disponible | Decision model System One (sin generacion) | th, en | apache-2.0 |
| iapp/OpenThai-SystemOne (bf16 original) | no disponible | no disponible | Decision model System One (sin generacion) | th, en | apache-2.0 |
| Qwen3.5-0.8B (base de la torre) | no disponible | no disponible | LLM generativo | no disponible | no disponible |

La comparacion con alternativas de la misma categoria (modelos de clasificacion y decision tailandeses) no esta disponible en la informacion proporcionada. La unica comparacion documentada es contra el propio modelo base sin cuantizar, cuyos resultados se recogen en la tabla de benchmarks.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no soporta tool calling generativo ni razonamiento multi-paso; solo responde a preguntas tipadas predefinidas.
- La exactitud en algunos subconjuntos es baja de forma intrinseca, no por la cuantizacion: helpsteer2 (41,6), summeval-relevance (21,7), wisesight (48,9) y banking77 (59,1) muestran margen de mejora incluso en el modelo original.
- La cuantizacion introduce variaciones de hasta 1,0 punto en subconjuntos concretos (sib200_th -1,0; paws -0,8; summeval-relevance -0,8), aunque el macro global se mantiene practicamente intacto.
- Cobertura linguistica limitada a tailandes e ingles; el rendimiento en otros idiomas no esta documentado.
- Los resultados publicados corresponden a un unico orden de opciones y a los primeros 800 registros de cada conjunto; el rendimiento en produccion con otros ordenes o distribuciones puede diferir.
- vLLM no sirve el modelo de forma nativa por la cabeza de decision custom, lo que limita las opciones de despliegue de alta concurrencia.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; al tratarse de un modelo de decision con probabilidades calibradas, el riesgo principal es la sobreconfianza en predicciones erroneas, por lo que se recomienda fijar umbrales de abandono.
- Licencia Apache-2.0, que permite uso comercial sin restricciones adicionales conocidas; conviene verificar los terminos del modelo base y de los datos de entrenamiento antes de un despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai-SystemOne-FP8-Dynamic
- Modelo base: https://huggingface.co/iapp/OpenThai-SystemOne
- Repositorio del paquete cliente: https://github.com/iapp-technology/openthai-systemone
- No se han encontrado otros enlaces (papers, blogs o demos) en la informacion proporcionada.
