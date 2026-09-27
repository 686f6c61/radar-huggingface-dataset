# PierreGtch/eeg-fm-masking_jepa_r12cm_L8

## Resumen

eeg-fm-masking_jepa_r12cm_L8 es un codificador (encoder) de EEG preentrenado mediante aprendizaje autosupervisado, publicado por PierreGtch como parte del trabajo *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. El modelo pertenece a una familia de 58 codificadores entrenados con una receta identica en la que solo varia la geometria de enmascaramiento (5 radios espaciales x 6 longitudes temporales x 2 marcos de trabajo); en este caso concreto se usa el marco JEPA (joint-embedding predictive architecture) con un radio espacial de mascara de 12 cm y una longitud temporal de 8 parches.

Se trata de un modelo pequeno orientado a extraccion de caracteristicas: el encoder tiene 12.692.096 parametros y no genera texto ni realiza tareas linguisticas, sino que produce representaciones vectoriales de senales EEG. La relevancia de esta publicacion es metodologica: al liberar los 58 puntos de la rejilla experimental con pesos redistribuibles, permite reproducir y aislar el efecto de la geometria de enmascaramiento sobre el rendimiento en tareas posteriores, algo poco habitual en el ambito de los foundation models de EEG.

El modelo opera sobre senales muestreadas a 200 Hz, cortadas en parches de 1 segundo (200 muestras con solapamiento de 20), con posiciones de canal en metros. Es agnostico al montaje, por lo que admite cualquier numero y conjunto de canales siempre que cada uno tenga una posicion 3D. Los pesos se distribuyen en `safetensors` bajo licencia CC-BY-4.0, y el codigo asociado bajo MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches; preentrenamiento JEPA (joint-embedding predictive architecture) con profesor EMA y predictor (no incluidos en el repositorio) |
| Parametros totales | 12.692.096 (12,69 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No definida como ventana fija; el modelo opera sobre parches de 1 s (200 muestras a 200 Hz, solapamiento de 20 muestras). Longitud temporal de mascara L = 8 parches |
| Tipos de cuantizacion | No disponible; pesos publicados en `safetensors` (precision no especificada en la informacion proporcionada) |
| Idiomas soportados | No aplicable (modelo de senales EEG, no linguistico) |
| Licencia | CC-BY-4.0 para los pesos; codigo MIT |
| Formato de pesos | `safetensors` (`model.safetensors`, solo el encoder) |
| Frecuencia de muestreo de entrada | 200 Hz |
| Unidades de entrada | Voltios; el wrapper aplica factor 1e+06 y escalado `median_std_clip` con recorte en sigma = 15 |
| Radio espacial de mascara (r) | 12 cm |
| Longitud temporal de mascara (L) | 8 parches |
| `pct_unmasked` | 0,45 |
| Checkpoint | Epoca 10 de 10 (version `v9`, la evaluada en el paper) |
| Tamano del repositorio | 0,1 GB |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo es un codificador transformer que primero tokeniza la senal EEG en parches (componente `feature_encoder.*`) y despues procesa esos tokens con el cuerpo transformer (`model.*`). El preentrenamiento sigue el marco JEPA: un predictor mapea el contexto codificado del encoder hacia las representaciones que un profesor EMA genera para los parches enmascarados. A diferencia de otros enfoques autosupervisados, esta variante no emplea regularizador de varianza/covarianza. El repositorio publica unicamente el encoder (los tensores cargados en la evaluacion posterior del paper); el predictor JEPA y el profesor EMA no se incluyen, y las ponderaciones liberadas corresponden al encoder estudiante tal y como se evaluo.

Los datos de preentrenamiento son el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido precisamente para que los pesos puedan redistribuirse. El entrenamiento consta de 10 epocas sobre 2 x H100, con tamano de lote de 600 por GPU, tasa de aprendizaje 0,00024 (calentamiento de 3080 pasos hasta 1e-06 final) y decaimiento de peso 0,01. La innovacion principal no es arquitectonica sino experimental: los 58 modelos comparten receta identica y solo difieren en la geometria de enmascaramiento, lo que permite atribuir las diferencias de rendimiento a esa variable. Los autores recomiendan, como configuracion general, r = 9 cm y L = 2 (variantes `mae_r9cm_L2` y `jepa_r9cm_L2`), no la combinacion r = 12 cm / L = 8 que representa este checkpoint.

## Capacidades

- Extraccion de caracteristicas (embeddings contextuales) a partir de senales EEG multicanal.
- Funciona como backbone congelado para sondas lineales (ridge regression/classification) sobre las caracteristicas aplanadas.
- Soporta ajuste fino posterior mediante la integracion con OpenEEGBench a traves de `PretrainedBackbone`.
- Agnosticismo de montaje: acepta cualquier numero y conjunto de canales, siempre que cada canal tenga una posicion 3D (en metros, formato MNE `info["chs"][i]["loc"][:3]`).
- Procesamiento de senales a 200 Hz con parches de 1 segundo y solapamiento de 20 muestras.
- Escalado de entrada integrado en el wrapper (`factor = 1e+06` y `median_std_clip` con recorte en sigma = 15), de modo que no hay que estandarizar los datos previamente.
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: es un extractor de representaciones de EEG.

## Casos de uso

- Clasificacion de fases del sueno: el modelo alcanza 0,681 ± 0,003 de exactitud balanceada en `isruc-sleep` con encoder congelado y sonda ridge, lo que permite montar un clasificador de sueno sin reentrenar el backbone.
- Deteccion de anomalias epilepticas: obtiene 0,908 ± 0,041 en `chbmit`, 0,785 ± 0,003 en `tuab` y 0,792 ± 0,065 en `tuev`, util para triaje de registros largos en entornos de monitorizacion.
- Apoyo al diagnostico de depresion: 0,835 ± 0,004 de exactitud balanceada en `mdd_mumtaz2016`, aplicable como extractor de caracteristicas en estudios clinicos con EEG en reposo.
- Interfaces cerebro-computador basadas en imaginería motora: 0,346 ± 0,007 en `bcic2a` y 0,259 ± 0,022 en `bcic2020-3`, adecuado como punto de partida para pipelines de BCI con ajuste fino.
- Regresion de variables continuas del sujeto: predice `seed-vig` mediante sonda ridge sobre caracteristicas congeladas, aunque con R² negativo (-0,810 ± 0,040), lo que lo hace util sobre todo como linea base a superar.
- Investigacion sobre carga cognitiva y tareas mentales: 0,708 ± 0,024 en `arithmetic_zyma2019` y 0,254 ± 0,005 en `faced`, para experimentos de neurociencia cognitiva con paradigmas controlados.
- Reproducibilidad metodologica: al ser uno de los 58 checkpoints de la rejilla, sirve para replicar el estudio del efecto de la geometria de enmascaramiento y comparar JEPA frente a MAE bajo condiciones identicas.
- Ajuste fino sobre datos propios: al ser agnostico al montaje y de solo 12,69 M de parametros, se puede reentrenar o adaptar con recursos modestos a cohortes EEG internas.

## Benchmarks y rendimiento

Resultados publicados en la model card para OpenEEGBench con encoder congelado y sonda ridge sobre caracteristicas contextuales aplanadas (12 conjuntos de datos x 5 semillas; exactitud balanceada para clasificacion, R² para `seed-vig`):

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | exactitud balanceada | 0,708 ± 0,024 | 5 |
| bcic2020-3 | exactitud balanceada | 0,259 ± 0,022 | 5 |
| bcic2a | exactitud balanceada | 0,346 ± 0,007 | 5 |
| chbmit | exactitud balanceada | 0,908 ± 0,041 | 5 |
| faced | exactitud balanceada | 0,254 ± 0,005 | 5 |
| isruc-sleep | exactitud balanceada | 0,681 ± 0,003 | 5 |
| mdd_mumtaz2016 | exactitud balanceada | 0,835 ± 0,004 | 5 |
| physionet | exactitud balanceada | 0,462 ± 0,008 | 5 |
| seed-v | exactitud balanceada | 0,305 ± 0,002 | 5 |
| seed-vig | R² | -0,810 ± 0,040 | 5 |
| tuab | exactitud balanceada | 0,785 ± 0,003 | 5 |
| tuev | exactitud balanceada | 0,792 ± 0,065 | 5 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos en una misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: minima. Con 12,69 M de parametros, los pesos ocupan aproximadamente 51 MB en fp32 y unos 25 MB en fp16, por lo que el modelo cabe con holgura en cualquier GPU de consumo e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU moderna (RTX 3060 o superior, A100, H100) es mas que suficiente. El entrenamiento original se hizo con 2 x H100, pero solo para el pipeline completo de preentrenamiento, no para inferencia.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales y tambien en ejecucion sobre CPU.
- Opciones de despliegue: PyTorch con `safetensors` y el paquete `eeg-fm-masking` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`), cargando `ContextualEncoderBenchmarkWrapper` o integrarlo en OpenEEGBench via `PretrainedBackbone`. No aplican servidores de inferencia de LLM como vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo generativo de texto.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Marco | Mascara (r, L) | Parametros del encoder | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| eeg-fm-masking_jepa_r12cm_L8 (este modelo) | JEPA | 12 cm, 8 parches | 12,69 M | Parches de 1 s a 200 Hz | CC-BY-4.0 (pesos), MIT (codigo) | HuggingFace |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm, 2 parches | No disponible (misma receta de 58 encoders) | Parches de 1 s a 200 Hz | CC-BY-4.0 (pesos), MIT (codigo) | HuggingFace |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm, 2 parches | No disponible (misma receta de 58 encoders) | Parches de 1 s a 200 Hz | CC-BY-4.0 (pesos), MIT (codigo) | HuggingFace |

Las dos alternativas pertenecen a la misma familia experimental y comparten receta de entrenamiento, corpus y requisitos de entrada; las diferencias se limitan al marco (JEPA frente a MAE) y a la geometria de enmascaramiento. El paper recomienda explicitamente la configuracion r = 9 cm, L = 2 frente a la de este checkpoint. No se dispone de datos de benchmarks publicados en la informacion proporcionada para las variantes r9cm_L2, por lo que no se puede establecer una comparacion cuantitativa directa.

## Limitaciones y advertencias

- Rendimiento bajo o negativo en varios conjuntos: `bcic2020-3` (0,259), `faced` (0,254) y `seed-v` (0,305) quedan cerca del azar, y `seed-vig` presenta un R² de -0,810, es decir, peor que predecir la media.
- El propio autor recomienda otra configuracion de enmascaramiento (r = 9 cm, L = 2) como opcion general, por lo que este checkpoint no es la variante de referencia del paper.
- Es un encoder de caracteristicas, no un modelo generativo ni conversacional: no admite prompts, tool calling, agentes ni razonamiento multi-paso.
- Los pesos publicados no incluyen el predictor JEPA ni el profesor EMA, solo el encoder estudiante; no se puede reproducir el pipeline de preentrenamiento completo con este repositorio.
- Requisitos de entrada estrictos: 200 Hz exactos, unidades en voltios, sin estandarizacion previa (el wrapper aplica `factor = 1e+06` y `median_std_clip`), y posiciones de canal en metros. Desviarse de estos supuestos degrada las representaciones.
- Es agnostico al montaje, pero exige que cada canal tenga una posicion 3D valida; canales sin `loc` no pueden procesarse.
- Sesgo de dominio: el preentrenamiento usa solo el subconjunto abierto del corpus REVE (323 grabaciones), lo que puede limitar la generalizacion a otras poblaciones, equipos o protocolos.
- Riesgo de alucinacion: no aplica en el sentido linguistico; el riesgo equivalente es producir representaciones poco informativas en regimenes alejados de la distribucion de entrenamiento.
- Licencia CC-BY-4.0 en los pesos: permite uso comercial siempre que se atribuya la autoria y se cite el paper; el codigo asociado es MIT.
- Validacion externa minima: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay contraste independiente mas alla de los resultados del paper.
- No se han publicado datos de latencia ni de throughput en la informacion disponible.
- La fecha de creacion registrada en el repositorio (2026-09-27) es posterior a la fecha actual; conviene verificar el estado del repositorio antes de integrarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r12cm_L8
- Variante recomendada (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Variante recomendada (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Sitio web del paper: https://pierregtch.github.io/eeg-fm-masking
- Codigo (MIT): https://github.com/PierreGtch/eeg-fm-masking
- Ejecucion de entrenamiento (W&B): https://wandb.ai/pierregtch/chan-inv-clf/runs/b5zaymrl
