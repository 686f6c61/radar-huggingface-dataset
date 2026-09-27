# PierreGtch/eeg-fm-masking_jepa_rall_L1

## Resumen

eeg-fm-masking_jepa_rall_L1 es un codificador (encoder) de senales EEG preentrenado, publicado en HuggingFace por el autor PierreGtch dentro del proyecto eeg-fm-masking. Se trata de uno de los 58 encoders entrenados con una receta identica en la que solo cambia la geometria de enmascaramiento (5 radios espaciales x 6 longitudes temporales x 2 marcos de trabajo, MAE y JEPA). En concreto, este modelo emplea el marco JEPA (joint-embedding predictive architecture), enmascara todos los canales (r = all) y una longitud temporal de un solo parche (L = 1). El modelo procede del paper "What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA".

El modelo es un transformer contextual de 12,69 millones de parametros (12.692.096) cuyo unico artefacto publicado es el encoder; ni el predictor JEPA ni el profesor EMA se redistribuyen. Resuelve el problema de la extraccion de caracteristicas (feature extraction) sobre EEG: convierte ventanas de senal en representaciones contextuales que despues se evaluan con una sonda lineal (ridge) congelada. Es relevante porque forma parte de un estudio controlado y reproducible sobre que geometria de enmascaramiento conviene a los modelos fundacionales de EEG, y porque sus pesos son redistribuibles bajo CC-BY-4.0 (entrenados sobre el subconjunto de licencia abierta del corpus REVE).

A diferencia de un modelo de lenguaje, no genera texto ni atiende instrucciones: es un extractor de caracteristicas agnostico al montaje que admite cualquier numero y conjunto de canales, siempre que cada canal disponga de una posicion 3D. El propio autor recomienda, segun los resultados del paper, las variantes con r = 9 cm y L = 2 por encima de esta configuracion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer contextual con objetivo de enmascaramiento JEPA (joint-embedding predictive architecture) |
| Parametros totales | 12.692.096 (12,69 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como en un LLM; la entrada se segmenta en parches de 1 s (200 muestras a 200 Hz, solapamiento de 20 muestras); n_times es configurable |
| Tipos de cuantizacion | No disponible (pesos distribuidos en safetensors, presumiblemente FP32) |
| Idiomas soportados | No aplica (modelo de senales EEG, no de lenguaje) |
| Licencia | CC-BY-4.0 (pesos); codigo bajo MIT |
| Formato de pesos | safetensors |
| Marco de preentrenamiento | JEPA |
| Radio espacial de mascara (r) | Todos los canales |
| Longitud temporal de mascara (L) | 1 parche |
| pct_unmasked | 0,45 |
| Checkpoint | Epoca 10 de 10 (v9, el evaluado en el paper) |
| Frecuencia de muestreo | 200 Hz |
| Unidades de entrada | Voltios (el wrapper aplica factor 1e+06 y escalado median_std_clip con recorte en sigma = 15) |
| Canales | Agnostico al montaje; cualquier numero y conjunto de canales con posicion 3D en metros |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con un tokenizador de parches (`feature_encoder.*`) y un cuerpo transformer (`model.*`). El preentrenamiento es auto-supervisado bajo el paradigma JEPA: un predictor proyecta el contexto codificado por el encoder hacia los embeddings que un profesor EMA genera para los parches enmascarados, sin regularizador de varianza/covarianza. La geometria de enmascaramiento de esta variante es r = all (todos los canales) y L = 1 parche, con una tasa de elementos no enmascarados (pct_unmasked) de 0,45. Los pesos publicados corresponden al encoder estudiante tal y como se evaluo en el paper.

Los datos de preentrenamiento son el subconjunto de licencia abierta del corpus REVE, compuesto por 323 grabaciones, elegido para que los pesos puedan redistribuirse. El entrenamiento consta de 10 epocas sobre 2 x H100, con tamano de lote de 600 por GPU, tasa de aprendizaje de 0,00024 (calentamiento de 3080 pasos y valor final 1e-06) y weight decay de 0,01. La innovacion principal del trabajo no reside en un nuevo bloque de atencion, sino en el barrido controlado de la geometria de enmascaramiento como variable experimental.

## Capacidades

- Extraccion de caracteristicas (feature extraction) de senales EEG: genera representaciones contextuales por ventana que sirven como entrada a sondas lineales aguas abajo.
- Clasificacion y regresion en tareas EEG: discriminacion de tareas cognitivas, deteccion de crisis, estadificacion del sueno, deteccion de depresion, entre otras (ver benchmarks).
- Agnosticismo al montaje: admite cualquier numero y conjunto de canales, siempre que cada canal tenga una posicion 3D en metros.
- Funcionamiento con encoder congelado: utilizable sin reentrenar, con una sonda ridge sobre las caracteristicas aplanadas.
- No soporta tool calling ni function calling (no es un modelo de lenguaje ni un agente).
- No soporta razonamiento multi-paso, agentes ni generacion de texto.
- No tiene capacidades multilingues (no procesa idiomas).
- No incluye vision, audio ni modo de pensamiento (thinking): su dominio es exclusivamente EEG.

## Casos de uso

- Deteccion de crisis epilepticas: sobre el dataset chbmit el encoder congelado alcanza 0,838 de balanced accuracy, por lo que puede actuar como extractor de caracteristicas para un clasificador de crisis en monitorizacion clinica.
- Deteccion de anomalias en EEG (tuab): con 0,734 de balanced accuracy, es adecuado como backbone para cribado de registros anormales en grandes volumenes de datos.
- Estadificacion del sueno (isruc-sleep): con 0,575 de balanced accuracy, sirve de base para clasificadores de fases del sueno en estudios de polisomnografia.
- Interfaces cerebro-computador de imagineria motora: en bcic2a (0,301) y bcic2020-3 (0,260) rinde cerca del azar, de modo que su uso aqui exige ajuste fino y verificacion, no solo sonda congelada.
- Monitorizacion de carga mental y tareas aritmeticas (arithmetic_zyma2019): con 0,675 de balanced accuracy, puede emplearse como extractor en estudios de carga cognitiva.
- Deteccion de depresion (mdd_mumtaz2016): con 0,773 de balanced accuracy, es un candidato para pipelines de investigacion en marcadores EEG de depresion.
- Deteccion de eventos paroxisticos y artefactos (tuev): con 0,874 de balanced accuracy, rinde como extractor para anotacion automatica de eventos en EEG clinico.
- Investigacion reproducible en modelos fundacionales de EEG: al formar parte de un barrido controlado de 58 encoders, permite estudiar de forma aislada el efecto de la geometria de enmascaramiento.

## Benchmarks y rendimiento

Resultados aguas abajo con OpenEEGBench, encoder congelado y sonda ridge sobre las caracteristicas contextuales aplanadas (12 datasets x 5 semillas). Balanced accuracy para clasificacion; R² para seed-vig.

| Dataset | Metrica | Puntuacion (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,675 ± 0,005 | 5 |
| bcic2020-3 | balanced acc. | 0,260 ± 0,008 | 5 |
| bcic2a | balanced acc. | 0,301 ± 0,006 | 5 |
| chbmit | balanced acc. | 0,838 ± 0,027 | 5 |
| faced | balanced acc. | 0,199 ± 0,006 | 5 |
| isruc-sleep | balanced acc. | 0,575 ± 0,001 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,773 ± 0,013 | 5 |
| physionet | balanced acc. | 0,387 ± 0,008 | 5 |
| seed-v | balanced acc. | 0,279 ± 0,001 | 5 |
| seed-vig | R² | -0,848 ± 0,009 | 5 |
| tuab | balanced acc. | 0,734 ± 0,003 | 5 |
| tuev | balanced acc. | 0,874 ± 0,028 | 5 |

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 12,69 M de parametros): aproximadamente 51 MB en FP32, 25 MB en FP16/BF16, 13 MB en INT8 y 6 MB en INT4, mas el coste de las activaciones (muy reducido por el tamano del modelo).
- GPU recomendadas: no requiere GPU; cabe en cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4090) y funciona en CPU sin problema.
- Cabe en GPU de consumo: si, con enorme holgura; el cuello de botella real sera el preprocesado de la senal EEG, no el modelo.
- Opciones de despliegue: PyTorch con safetensors y huggingface_hub; integracion como backbone mediante `PretrainedBackbone` de OpenEEGBench. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo autorregresivo de lenguaje.
- Latencia y throughput: no disponible en la informacion proporcionada. Entrenamiento realizado sobre 2 x H100 con lote de 600 por GPU.
- Preprocesado obligatorio: muestreo a 200 Hz, entrada en voltios (sin estandarizar previamente) y posiciones de canal en metros.

## Comparativa con modelos similares

Este modelo pertenece a una coleccion de 58 encoders con receta identica; la unica diferencia entre ellos es la geometria de enmascaramiento. La tabla recoge los parientes directos citados en la model card.

| Modelo | Marco | Mascara (r, L) | Parametros | Licencia |
|---|---|---|---|---|
| eeg-fm-masking_jepa_rall_L1 (este) | JEPA | todos los canales, 1 parche | 12,69 M | CC-BY-4.0 |
| eeg-fm-masking_mae_rall_L1 | MAE | todos los canales, 1 parche | No disponible | No disponible (coleccion del autor) |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm, 2 parches | No disponible | No disponible (coleccion del autor) |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm, 2 parches | No disponible | No disponible (coleccion del autor) |

Cabe senalar que, segun la propia model card, el paper recomienda las configuraciones r = 9 cm y L = 2, es decir, las variantes r9cm_L2 por encima de esta rall_L1. No se dispone de datos comparativos numericos de esas variantes ni de otros modelos fundacionales de EEG externos en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento cercano al azar en varias tareas: balanced accuracy de 0,260 en bcic2020-3, 0,301 en bcic2a, 0,279 en seed-v y 0,199 en faced, lo que limita su uso directo en esos dominios sin ajuste fino.
- Regresion negativa en seed-vig (R² de -0,848 ± 0,009), lo que indica un rendimiento peor que predecir la media en esa tarea.
- Modelo de dominio muy especifico: no es un modelo de lenguaje y no sirve para generacion de texto, codigo, tool calling, agentes ni tareas multilingues.
- Preprocesado estricto obligatorio: 200 Hz, unidades en voltios (sin estandarizar previamente) y posiciones de canal en metros; desviarse de estos requisitos invalida las representaciones.
- Solo se publica el encoder: no se redistribuyen el predictor JEPA ni el profesor EMA, por lo que no puede reproducirse el preentrenamiento completo a partir del repositorio.
- Adopcion nula en el momento de la consulta (0 descargas y 0 likes), sin validacion externa mas alla de la del propio paper.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion al autor y a la publicacion; el codigo asociado se distribuye bajo MIT.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de representaciones poco informativas o poco calibradas en montajes o poblaciones alejadas del corpus REVE.
- La naturaleza de los datos EEG implica consideraciones de privacidad y proteccion de datos de salud en cualquier despliegue real.

## Enlaces

- HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_rall_L1
- Sitio web del paper: https://pierregtch.github.io/eeg-fm-masking
- Codigo: https://github.com/PierreGtch/eeg-fm-masking
- Coleccion completa (58 modelos): https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada r9cm_L2 (MAE): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada r9cm_L2 (JEPA): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro de entrenamiento (W&B): https://wandb.ai/pierregtch/chan-inv-clf/runs/l29shjdg
