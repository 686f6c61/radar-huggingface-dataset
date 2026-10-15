# siddharthmb/2026.TA.features_2026.TA.gemma2_2b_headline_2026-10e_tc8192_decb_l1w0.001_auxk512_hd81ee76c314f

## Resumen

Este repositorio no es un modelo de lenguaje generativo, sino un almacen de caracteristicas empaquetado (*packed feature store*) generado con la libreria `circuit-tracer`. Contiene un registro por cada caracteristica activada de los transcoder adapters entrenados sobre Gemma 2 2B (`2026.TA.gemma2_2b_headline_2026-10e_tc8192_decb_l1w0.001_auxk512_ctr_fp32_tarbb_lb2_sl17862630`). Cada registro incluye ejemplos con activacion maxima por dominio, efectos sobre la salida logit y frecuencia de disparo. El autor es `siddharthmb` y el artefacto se publico el 14 de octubre de 2026.

El problema que resuelve es el de la trazabilidad de circuitos en modelos de razonamiento: en lugar de recalcular activaciones cada vez que se inspecciona una caracteristica, este repositorio las precalcula y las indexa, de modo que las *attribution graphs* y los visores interactivos puedan leer los ejemplos directamente desde disco o desde el Hub. Esto es relevante para el campo de la interpretabilidad mecanicista, donde el cuello de botella habitual es el coste de recoleccion de ejemplos activadores.

El almacen cubre 212.992 caracteristicas (26 capas x 8.192 transcoders, coherente con la profundidad de Gemma 2 2B), de las cuales dispararon 54.747 sobre 88.625.123 tokens de validacion. Su tamano de repositorio es de 0,4 GB y la recoleccion esta marcada como completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (almacen de caracteristicas derivado de transcoder adapters sobre Gemma 2 2B); indexacion con `analysis.features.packed` |
| Parametros totales | no disponible como modelo; el almacen cubre 212.992 caracteristicas |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens de ventana de recoleccion (`max_length=1024`); no aplica como contexto generativo |
| Tipos de cuantizacion | no aplica al almacen; el checkpoint de origen declara fp32 en su identificador (`ctr_fp32`) |
| Idiomas soportados | no declarados; los corpus de validacion son LMSYS-Chat-1M (multilingue, predominio de ingles) y FineWeb (texto web en ingles) |
| Licencia | no disponible |
| Formato de pesos | `features/index.json.gz` + `features/layer_N.bin` (formato empaquetado propio); sidecars `feature_metadata.json`, `activation_histograms.npz`, `feature_annotations.json`; `feature_collection_config.json` |

## Arquitectura y entrenamiento

El artefacto no entrena nada por si mismo: es la salida de `python -m analysis.features.collect` de la herramienta [transcoder-adapters](https://github.com/Sid-MB/transcoder-adapters), ejecutada como trabajo Slurm `17862632` en `jagupard33.stanford.edu` el 14 de octubre de 2026 a las 14:06:46. La unidad subyacente es un transcoder adapter (una variante de transcoder que sustituye el MLP de un modelo congelado y se ajusta para replicar su salida), entrenado sobre Gemma 2 2B con 8.192 transcoders, decodificador con sesgo (`decb`), peso L1 de 0,001 (`l1w0.001`) y `auxk512` como coeficiente de perdida auxiliar. El identificador incluye ademas un hash de configuracion (`hd81ee76c314f`).

Los datos de recoleccion de ejemplos son dos corpus de validacion: el split de LMSYS-Chat-1M de `siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits` y `science-of-finetuning/fineweb-1m-sample`. Se procesaron 100.000 muestras con `top_k=20`, `domain_top_k=20`, `n_random=0`, `activation_range_examples_per_domain=0`, `context_before=75` y `context_after=20`. Los rangos de activacion definidos en la configuracion son 0,5:1,0 / 1,0:2,0 / 2,0:2,5 / 2,5:3,0 / 3,0:4,0 / 4,0:8,0. La descripcion del autor para la linea de investigacion es la difusion de modelos de razonamiento (*diffing*), recogida en el articulo "Transcoder Adapters for Reasoning-Model Diffing". La configuracion de recoleccion funciona como identidad del repositorio: una ejecucion con los mismos flags se mapea a este mismo repositorio, de modo que la recoleccion es idempotente.

## Capacidades

- Lectura de una caracteristica individual por su identificador de Cantor mediante `load_circuit_tracer_feature_from_hub(...)` combinado con `cantor_pair(layer, idx)`, sin necesidad del visor.
- Alimentacion de *attribution graphs*: acepta los flags `--feature_data_path` (caracteristicas del adapter) y `--base_feature_data_path` (caracteristicas base de GemmaScope) en `python -m analysis.attribution.graphs.build_graphs`.
- Servicio de ejemplos bajo demanda desde el visor (`python -m analysis.attribution.serve`), que hace *streaming* de los ejemplos del nodo pulsado desde `features/index.json.gz` y `features/layer_N.bin`.
- Consulta de efectos sobre logits y frecuencia de disparo por caracteristica.
- Comparacion entre dominios: top activating examples y ejemplos de rango de activacion separados por dominio (`chat` y `fineweb`).
- Anotacion y exploracion agregada mediante panel (`python -m analysis.features.dashboard`) sobre el directorio de coleccion, que lee `feature_metadata.json`, el almacen empaquetado `circuit_tracer_features/`, los histogramas y los *sidecars* de anotacion.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es un artefacto de datos de interpretabilidad, no un modelo de inferencia.

## Casos de uso

- Auditoria de circuitos en Gemma 2 2B: cargando el almacen como `--feature_data_path`, un investigador puede construir *attribution graphs* completos sin recalcular activaciones, reduciendo el coste de cada iteracion sobre el grafo.
- Diferenciacion de modelos de razonamiento (*reasoning-model diffing*): el proposito declarado de la linea de trabajo es comparar que caracteristicas aparecen al pasar de un modelo base a un modelo ajustado con razonamiento, usando los ejemplos activadores por dominio como evidencia cualitativa.
- Analisis de seguridad y jailbreaks: los ejemplos de mayor activacion del dominio `chat` (39.779.886 tokens procesados, 43.091 caracteristicas activadas) permiten localizar caracteristicas asociadas a conversaciones adversariales o a contenido sensible.
- Investigacion de sesgos y toxicidad: los ejemplos de maximo disparo sobre LMSYS-Chat-1M sirven como corpus de sondeo para identificar caracteristicas correlacionadas con estereotipos, lenguaje ofensivo o sesgo de dominio.
- Estudio de la diferencia distribucional chat frente a texto web: la particion de dominios (43.091 caracteristicas en `chat` frente a 45.044 en `fineweb`) permite medir que caracteristicas son especificas de cada regimen y cuales son compartidas.
- Construccion de paneles de anotacion para equipos de interpretabilidad: el *dashboard* lee `feature_metadata.json` y `feature_annotations.json`, de modo que un equipo puede etiquetar caracteristicas manualmente y acumular las anotaciones en un formato consumible por el resto de la herramienta.
- Reproducibilidad de experimentos: al ser la configuracion la identidad del repositorio, un tercero puede re-ejecutar la recoleccion con los mismos flags y verificar que obtiene el mismo artefacto, lo que facilita la revision por pares.
- Integracion en canalizaciones de analisis de mecanismos sobre GemmaScope: como el repositorio admite el rol de caracteristicas base (`--base_feature_data_path`), se puede combinar con SAEs de GemmaScope en un mismo grafo de atribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos cuantitativos del autor son de cobertura de la recoleccion:

| Metrica | Valor |
|---|---|
| Tokens totales procesados | 88.625.123 |
| Tokens en dominio `chat` | 39.779.886 |
| Tokens en dominio `fineweb` | 48.845.237 |
| Caracteristicas disparadas | 54.747 de 212.992 |
| Caracteristicas disparadas en `chat` | 43.091 |
| Caracteristicas disparadas en `fineweb` | 45.044 |

## Requisitos de hardware

- El artefacto ocupa 0,4 GB en el repositorio; el almacen empaquetado mas los *sidecars* (histogramas `.npz` y anotaciones `.json`) caben con holgura en la memoria de cualquier estacion de trabajo, sin GPU.
- La lectura de una sola caracteristica por identificador de Cantor es una operacion de E/S sobre `features/layer_N.bin`: latencia dominada por el almacenamiento, no por computo.
- El visor interactivo mantiene un proceso servidor ligero que hace *streaming* de ejemplos; no requiere acelerador.
- La reconstruccion de los grafos de atribucion si requiere ejecutar el modelo subyacente Gemma 2 2B (2.600 millones de parametros). Estimacion orientativa: en fp16 ocupa aproximadamente 5,2 GB de VRAM; en cuantizacion de 4 bits baja a unos 1,5-2 GB, por lo que cabe en GPU de consumo como RTX 3060 de 12 GB, RTX 4070 o RTX 4090. Estas cifras son estimaciones generales para un transformer de ese tamano y no datos publicados por el autor.
- Opciones de despliegue: el flujo documentado usa las herramientas `circuit-tracer` (`analysis.features.collect`, `analysis.attribution.graphs.build_graphs`, `analysis.attribution.serve`, `analysis.features.dashboard`) con `uv` como gestor de entorno. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Naturaleza | Cobertura | Contexto de analisis | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (`2026.TA.features_...hd81ee76c314f`) | Almacen de caracteristicas de transcoder adapters sobre Gemma 2 2B | 212.992 caracteristicas, 54.747 activadas | 1.024 tokens de ventana | no disponible | Publico en HuggingFace, 0 descargas |
| `2026.TA.gemma2_2b_headline_2026-10e_tc8192_decb_l1w0.001_auxk512_ctr_fp32_tarbb_lb2_sl17862630` | Checkpoint de transcoder adapters (modelo base de este almacen) | no disponible | no disponible | no disponible | Publico en HuggingFace |
| GemmaScope (SAEs sobre Gemma 2) | Diccionarios dispersos de caracteristicas | no disponible en la informacion proporcionada | no disponible | no disponible | Publico, referenciado como fuente alternativa de caracteristicas base |
| `circuit-tracer` (herramienta) | Software de construccion de grafos y recoleccion, no un modelo | no aplica | no aplica | no disponible | Codigo abierto en GitHub |

No se dispone de datos comparativos de rendimiento entre estos artefactos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para generar texto, razonar, programar ni atender conversaciones. Cualquier expectativa de ese tipo es un error de interpretacion.
- La licencia no esta declarada en la informacion disponible. Antes de cualquier uso, incluido el academico o el comercial, hay que contactar con el autor para aclarar los terminos.
- La cobertura es parcial por diseno: solo 54.747 de 212.992 caracteristicas dispararon con los umbrales configurados (`top_k=20`, `max_length=1024`), de modo que una caracteristica ausente no implica que no exista, sino que no alcanzo el umbral en este muestreo.
- La recoleccion se hizo con `n_random=0` y `activation_range_examples_per_domain=0`, por lo que no hay ejemplos aleatorios ni ejemplos por rango de activacion almacenados, pese a que la configuracion define rangos. Esto limita el analisis de caracteristicas de baja activacion.
- La ventana de contexto de la recoleccion es de 1.024 tokens, con `context_before=75` y `context_after=20`; los ejemplos no reflejan dependencias de contexto largo.
- El dominio `fineweb` es texto web en ingles y el dominio `chat` proviene de LMSYS-Chat-1M; cualquier conclusion sobre multilingueismo queda sesgada por esa composicion. Los idiomas soportados no estan declarados.
- Un almacen de caracteristicas de un modelo de interpretabilidad no garantiza que las caracteristicas sean interpretables por humanos: la anotacion semantica es un paso posterior y manual.
- Riesgo de sobreinterpretacion: los efectos sobre logits registrados son correlacionales en el punto de recoleccion y no establecen causalidad sin verificacion mediante los grafos de atribucion.
- Artefacto practicamente sin adopcion: 0 descargas y 0 "likes" en el momento de la consulta, sin validacion independiente por terceros.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos enlaces utiles son los del propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddharthmb/2026.TA.features_2026.TA.gemma2_2b_headline_2026-10e_tc8192_decb_l1w0.001_auxk512_hd81ee76c314f
- Modelo base (checkpoint de transcoder adapters): https://huggingface.co/siddharthmb/2026.TA.gemma2_2b_headline_2026-10e_tc8192_decb_l1w0.001_auxk512_ctr_fp32_tarbb_lb2_sl17862630
- Dataset de validacion (chat): https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits
- Dataset de validacion (fineweb): https://huggingface.co/datasets/science-of-finetuning/fineweb-1m-sample
- Articulo: https://arxiv.org/abs/2602.20904 (Transcoder Adapters for Reasoning-Model Diffing)
- Pagina del proyecto: https://transcoder-adapters.github.io/
- Codigo: https://github.com/Sid-MB/transcoder-adapters
- Configuracion de la recoleccion: `feature_collection_config.json` dentro del repositorio
- Ruta en cluster indicada por el autor: `/nlp/scr/siddharth/transcoder-adapters/headline_2026-10e/features`
