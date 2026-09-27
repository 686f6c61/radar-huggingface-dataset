# PierreGtch/eeg-fm-masking_jepa_r6cm_L33

## Resumen

eeg-fm-masking_jepa_r6cm_L33 es un codificador de electroencefalografía (EEG) preentrenado mediante aprendizaje autosupervisado, publicado por PierreGtch como parte del estudio *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. No es un modelo generativo de lenguaje ni un sistema multimodal: es un extractor de características (pipeline `feature-extraction`) que convierte ventanas de senal EEG multicanal en representaciones vectoriales reutilizables por cabezas de clasificacion o regresion posteriores.

El modelo forma parte de una familia de 58 codificadores entrenados con una receta identica en la que solo varia la geometria del enmascaramiento: 5 radios espaciales x 6 longitudes temporales x 2 marcos de preentrenamiento (MAE y JEPA). Esta variante concreta usa el marco JEPA (joint-embedding predictive architecture) con radio espacial `r = 6 cm`, longitud temporal `L = 33` parches y una fraccion de parches sin enmascarar del 45 %. El codificador tiene 12.692.096 parametros, una cifra muy contenida que lo situa en la gama de modelos que se pueden ejecutar en hardware de consumo.

Su relevancia es metodologica: la familia esta disenada para aislar el efecto de la mascara sobre el rendimiento downstream, evaluado de forma homogenea con OpenEEGBench sobre 12 conjuntos de datos y 5 semillas. Los autores recomiendan, no obstante, la configuracion `r = 9 cm`, `L = 2` (disponible tambien como `eeg-fm-masking_mae_r9cm_L2` y `eeg-fm-masking_jepa_r9cm_L2`), por lo que esta variante debe considerarse una pieza mas del barrido experimental y no el checkpoint de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches; preentrenamiento JEPA (joint-embedding predictive architecture) con predictor y profesor EMA. Los pesos publicados corresponden solo al codificador (estudiante) |
| Parametros totales | 12.692.096 (codificador) |
| Longitud de contexto | No disponible como valor fijo: la entrada se divide en parches de 1 s (200 muestras a 200 Hz, con solapamiento de 20 muestras) y el numero de parches depende de `n_times` y `n_chans` |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en `safetensors` (sin variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible / no aplica: es un modelo de senales EEG, no procesa lenguaje natural |
| Licencia | CC-BY-4.0 para los pesos; el codigo asociado es MIT |
| Formato de pesos | `safetensors` (`model.safetensors`, ~0,1 GB de repositorio). Incluye `config.json` y `metadata.json` |
| Framework de preentrenamiento | JEPA |
| Radio espacial de mascara (`r`) | 6 cm |
| Longitud temporal de mascara (`L`) | 33 parches |
| `pct_unmasked` | 0,45 |
| Checkpoint | Epoca 10 de 10 (`v9`, el evaluado en el paper) |
| Pipeline | `feature-extraction` |

## Arquitectura y entrenamiento

El modelo combina un tokenizador de parches (`feature_encoder.*`) con un transformer (`model.*`). Bajo el marco JEPA, un predictor proyecta las representaciones del contexto hacia las embeddings que un profesor EMA genera para los parches enmascarados; a diferencia de otros esquemas JEPA, la model card indica que no se emplea regularizador de varianza/covarianza. En el repositorio solo se distribuye el codificador estudiante, que es exactamente el conjunto de tensores cargado en la evaluacion downstream del paper; el predictor y el profesor EMA no se incluyen.

El preentrenamiento usa el subconjunto de licencia abierta del corpus REVE (323 grabaciones), seleccionado precisamente para que los pesos se puedan redistribuir. El calendario es de 10 epocas sobre 2 GPU H100, con tamano de lote 600 por GPU, tasa de aprendizaje 0,00024 (3080 pasos de calentamiento y valor final 1e-06) y decaimiento de peso 0,01. El modelo es agnostico al montaje: acepta cualquier numero y conjunto de canales siempre que cada canal tenga una posicion 3D en metros (formato MNE `info["chs"][i]["loc"][:3]`). La entrada debe estar muestreada a 200 Hz y expresada en voltios; el wrapper aplica internamente un factor de 1e+06 y un escalado por ventana `median_std_clip` con recorte en sigma = 15, por lo que no hay que estandarizar los datos de antemano.

## Capacidades

- Extraccion de caracteristicas (embeddings) de senales EEG multicanal, con salida contextual por parche.
- Transferencia a tareas downstream mediante sonda congelada: clasificacion y regresion con ridge sobre las caracteristicas aplanadas.
- Funcionamiento con montajes arbitrarios: no requiere un numero fijo de electrodos ni una posicion concreta, solo coordenadas 3D por canal.
- Procesamiento de ventanas temporales largas gracias al troceado en parches de 1 s con solapamiento.
- Evaluacion estandarizada a traves de OpenEEGBench (`PretrainedBackbone`), con integracion directa en el flujo de evaluacion de los 58 codificadores de la familia.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito: es un backbone de representacion, no un modelo instruible.

## Casos de uso

- Clasificacion de estados de sueno: el modelo obtiene 0,705 de exactitud balanceada en `isruc-sleep` con sonda ridge congelada, de modo que se puede usar como extractor fijo y entrenar solo un clasificador ligero para segmentacion de fases.
- Deteccion de anomalias epilepticas: en `tuev` alcanza 0,916 de exactitud balanceada y en `chbmit` 0,842, lo que lo hace adecuado como etapa de representacion en pipelines de cribado de eventos epileptiformes.
- Deteccion de depresion a partir de EEG: con 0,850 en `mdd_mumtaz2016`, sirve como base para prototipos de apoyo diagnostico que despues se validan con cohortes propias.
- Deteccion de actividad anormal en EEG clinico: 0,789 en `tuab`, util como componente de preprocesado en herramientas de triaje de registros largos.
- Investigacion en interfaces cerebro-computador: utilizable como extractor en paradigmas como `bcic2a` (0,405) o `bcic2020-3` (0,266), donde el margen de mejora es amplio y el modelo sirve de punto de partida reproducible.
- Carga cognitiva y tareas aritmeticas: con 0,662 en `arithmetic_zyma2019`, es aplicable a estudios de carga de trabajo mental donde se necesita una representacion generica y no especifica de tarea.
- Estudios de comparacion metodologica: al compartir receta con otros 57 codificadores, permite aislar el efecto de la geometria de mascara sin recalcular el resto del pipeline.
- Despliegue en entornos con recursos limitados: con 12,69 M de parametros, cabe en una unica GPU de gama media o incluso en CPU para inferencia por lotes pequenos.

## Benchmarks y rendimiento

Evaluacion downstream con codificador congelado y sonda ridge sobre las caracteristicas contextuales aplanadas (OpenEEGBench, 12 conjuntos de datos x 5 semillas). Exactitud balanceada para clasificacion y R2 para `seed-vig`:

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | exactitud balanceada | 0,662 ± 0,019 | 5 |
| bcic2020-3 | exactitud balanceada | 0,266 ± 0,015 | 5 |
| bcic2a | exactitud balanceada | 0,405 ± 0,008 | 5 |
| chbmit | exactitud balanceada | 0,842 ± 0,050 | 5 |
| faced | exactitud balanceada | 0,269 ± 0,005 | 5 |
| isruc-sleep | exactitud balanceada | 0,705 ± 0,003 | 5 |
| mdd_mumtaz2016 | exactitud balanceada | 0,850 ± 0,016 | 5 |
| physionet | exactitud balanceada | 0,517 ± 0,012 | 5 |
| seed-v | exactitud balanceada | 0,302 ± 0,002 | 5 |
| seed-vig | R2 | -0,280 ± 0,015 | 5 |
| tuab | exactitud balanceada | 0,789 ± 0,012 | 5 |
| tuev | exactitud balanceada | 0,916 ± 0,023 | 5 |

No se han publicado en la informacion disponible resultados de benchmarks clasicos de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones numericas frente a otros codificadores EEG externos a la familia.

## Requisitos de hardware

- VRAM del codificador: aproximadamente 51 MB en fp32 y 25 MB en fp16 (12,69 M de parametros); el consumo real depende del numero de canales y de la longitud de la ventana, que determinan la longitud de secuencia.
- GPU recomendadas: el preentrenamiento se hizo en 2 x H100, pero la inferencia no requiere ese hardware. Cualquier GPU con >= 2 GB de VRAM es suficiente para extraccion de caracteristicas por lotes.
- GPU de consumo: cabe sin problema en tarjetas tipo RTX 3060, RTX 4070 o RTX 4090, y en la mayoria de iGPU modernas para lotes pequenos.
- CPU: viable para inferencia por lotes pequenos dado el tamano del modelo.
- Opciones de despliegue: el repositorio esta pensado para el codigo propio (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`) y para OpenEEGBench como capa de evaluacion. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, que en cualquier caso no aplican a un modelo de senales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Framework | Radio `r` | Longitud `L` | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| eeg-fm-masking_jepa_r6cm_L33 (este) | JEPA | 6 cm | 33 | 12,69 M (codificador) | CC-BY-4.0 | HuggingFace, pesos redistribuibles |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 | 12,69 M (codificador, receta identica) | CC-BY-4.0 | HuggingFace; configuracion recomendada por el paper |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 | 12,69 M (codificador, receta identica) | CC-BY-4.0 | HuggingFace; configuracion recomendada por el paper |
| Otros codificadores EEG de referencia (por ejemplo LaBraM, BIOT) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Las dos alternativas listadas con nombre propio forman parte de la misma coleccion de 58 modelos y comparten receta, datos y numero de parametros; la unica diferencia es la geometria de la mascara y el marco de preentrenamiento. La model card no publica sus puntuaciones, por lo que no es posible comparar numeros dentro de la tabla. No se dispone de datos verificados de otros codificadores EEG externos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un sistema conversacional: no procesa texto, no admite instrucciones y no soporta tool calling ni agentes.
- La model card no es la configuracion optima segun sus propios autores: el paper recomienda `r = 9 cm`, `L = 2`, por lo que este checkpoint debe tratarse como parte del barrido experimental.
- Los pesos publicados excluyen el predictor JEPA y el profesor EMA; solo contienen el codificador estudiante. La carga debe hacerse con `strict=False` para omitir los elementos dependientes del conjunto de datos (buffer de posiciones de canal y cabeza de clasificacion).
- La senal de entrada debe cumplir requisitos estrictos: 200 Hz de frecuencia de muestreo, unidades en voltios, sin estandarizacion previa y con posiciones de canal en metros. Cualquier desviacion degrada las representaciones.
- Modo de fallo detectado: en `seed-vig` la sonda ridge obtiene un R2 negativo (-0,280), lo que indica que el modelo no aporta capacidad predictiva util para esa tarea en regimen congelado.
- El rendimiento es muy desigual entre conjuntos: 0,266 en `bcic2020-3` y 0,269 en `faced` frente a 0,916 en `tuev`. Conviene validar siempre en la cohorte objetivo antes de asumir transferencia.
- No se documentan sesgos demograficos ni analisis de equidad, un aspecto relevante en aplicaciones clinicas de EEG.
- Uso clinico: los resultados son experimentales con sonda congelada y no constituyen validacion clinica; no debe usarse para diagnostico sin validacion regulatoria e independiente.
- Licencia CC-BY-4.0 para los pesos: permite uso comercial con atribucion, pero obliga a citar el paper y a mantener la atribucion. El codigo se distribuye bajo MIT, con condiciones distintas a las de los pesos.
- La fecha de creacion indicada en el repositorio (2026-09-27) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del Hub; conviene verificarlo antes de citar el modelo.
- El modelo tiene 0 descargas y 0 "likes" en el momento de redactar esta ficha, por lo que no existe una comunidad de usuarios que haya validado su comportamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r6cm_L33
- Coleccion con los 58 modelos de la familia: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Codigo (licencia MIT): https://github.com/PierreGtch/eeg-fm-masking
- Sitio del paper: https://pierregtch.github.io/eeg-fm-masking
- Configuracion recomendada por los autores (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Configuracion recomendada por los autores (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Registro de entrenamiento (Weights & Biases, run `4jsjobya`): https://wandb.ai/pierregtch/chan-inv-clf/runs/4jsjobya

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio.
