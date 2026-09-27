# PierreGtch/eeg-fm-masking_mae_r6cm_L2

## Resumen

`eeg-fm-masking_mae_r6cm_L2` es un codificador de electroencefalografía (EEG) preentrenado mediante un autoencoder enmascarado (MAE) por PierreGtch, publicado como parte de un estudio controlado titulado *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. El modelo no procesa texto ni imágenes: convierte ventanas de señal EEG multicanal en representaciones contextuales (features) reutilizables para tareas posteriores de clasificación o regresión, y se distribuye como encoder congelado para extracción de características.

Su relevancia es metodológica más que de escala. Forma parte de una familia de 58 encoders entrenados con una receta idéntica en la que solo varía la geometría de enmascaramiento: 5 radios espaciales × 6 longitudes temporales × 2 marcos de trabajo (MAE y JEPA). Este checkpoint concreto usa un radio espacial de 6 cm y una longitud temporal de 2 parches. El propio artículo recomienda la configuración r = 9 cm, L = 2, por lo que este modelo debe entenderse como una pieza de un barrido experimental, no como el mejor resultado de la serie.

El encoder tiene 12,69 millones de parámetros, funciona a una frecuencia de muestreo fija de 200 Hz y es agnóstico al montaje: acepta cualquier número y disposición de canales siempre que cada electrodo tenga una posición 3D en metros. Se publica en `safetensors` bajo licencia CC-BY-4.0, con el código de entrenamiento y evaluación bajo MIT, y está integrado en el benchmark OpenEEGBench para evaluación con sonda ridge sobre características congeladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con tokenizador de parches; preentrenamiento como masked autoencoder (MAE) |
| Parametros totales | 12.692.096 (solo encoder; el decodificador MAE no se distribuye) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en tokens; entrada segmentada en parches de 1 s (200 muestras a 200 Hz, solape de 20 muestras). Numero de canales y de parches temporal variable |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; la model card no especifica precision) |
| Idiomas soportados | No aplica: modelo de senales EEG, no procesa lenguaje natural |
| Licencia | CC-BY-4.0 (pesos); MIT (codigo del repositorio GitHub) |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `metadata.json` |
| Frecuencia de muestreo requerida | 200 Hz |
| Unidades de entrada | Voltios (el wrapper aplica factor 1e+06 y escalado `median_std_clip` con recorte en sigma = 15) |
| Posicion de canales | Metros (`info["chs"][i]["loc"][:3]` de MNE) |
| Geometria de enmascaramiento | Radio espacial r = 6 cm; longitud temporal L = 2 parches; `pct_unmasked` = 0.45 |
| Checkpoint publicado | Epoca 10 de 10 (`v9`, el evaluado en el articulo) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo sigue el esquema clasico de autoencoder enmascarado adaptado a senales fisiológicas: un tokenizador de parches (`feature_encoder.*`) divide la senal en fragmentos de 1 segundo con solape parcial y proyecta cada parche, condicionado por la posición espacial de los canales, a un espacio latente; un transformer (`model.*`) procesa únicamente los parches no enmascarados; y un decodificador ligero —no incluido en el repositorio— reconstruye la senal cruda de los parches ocultos durante el preentrenamiento. Solo se publican los tensores del encoder, que son exactamente los cargados en la evaluación downstream del artículo. Al ser agnóstico al montaje, el número de canales es arbitrario siempre que cada electrodo tenga coordenadas 3D, lo que permite transferir el modelo entre distintos sistemas de registro.

El preentrenamiento emplea el subconjunto de licencia abierta del corpus REVE (323 registros), seleccionado precisamente para que los pesos puedan redistribuirse. El calendario es de 10 épocas sobre 2 GPU H100, con batch de 600 por GPU, learning rate de 0,00024 con warm-up de 3080 pasos y valor final de 1e-06, y weight decay de 0,01. La innovación del trabajo no reside en el mecanismo de atención sino en el diseño experimental: la geometría de enmascaramiento (radio espacial en centímetros y longitud temporal en parches) se trata como única variable independiente, lo que permite aislar su efecto sobre el rendimiento downstream. La información disponible no detalla si hubo entrenamiento por refuerzo, DPO ni fases adicionales de alineamiento, que en este dominio no resultan habituales.

## Capacidades

- Extracción de características de senales EEG multicanal: genera representaciones contextuales por parche temporal que pueden aplanarse y alimentar una sonda lineal o ridge.
- Aprendizaje autosupervisado sin etiquetas: el preentrenamiento MAE no requiere anotaciones, solo senal cruda.
- Agnosticismo de montaje: admite cualquier conjunto de canales con posición 3D conocida, sin reentrenar el tokenizador.
- Clasificación y regresión downstream: el artículo evalúa 12 conjuntos de datos con tareas de clasificación (precisión balanceada) y de regresión (`seed-vig`, R²).
- Procesamiento de ventanas largas mediante parches de 1 s con solape, lo que permite construir secuencias temporales extensas.
- Reutilización como inicialización para ajuste fino (la model card documenta el flujo con `PretrainedBackbone` de OpenEEGBench), aunque los resultados publicados corresponden a encoder congelado.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni generación de texto: su única salida son representaciones latentes.

## Casos de uso

- Detección de crisis epilépticas: el modelo obtiene 0,858 de precisión balanceada en `chbmit` y 0,906 en `tuev` con encoder congelado, lo que lo hace utilizable para monitorización continua con una sonda ligera entrenada por paciente o por centro.
- Clasificación de etapas de sueño: con 0,657 de precisión balanceada en `isruc-sleep`, sirve como extractor de características para pipelines de polisomnografía que necesiten evitar el entrenamiento de redes profundas desde cero.
- Investigación en depresión: 0,849 de precisión balanceada en `mdd_mumtaz2016`, aplicable a estudios de biomarcadores EEG con poblaciones clínicas reducidas, donde congelar el encoder reduce el riesgo de sobreajuste.
- Detección de anomalías en el electroencefalograma: 0,802 en `tuab` (normal frente a anormal), útil como etapa de cribado en herramientas de revisión asistida.
- Decodificación de carga cognitiva y aritmética mental: 0,710 en `arithmetic_zyma2019`, adecuado para experimentos de interfaces neuro-adaptativas en entornos controlados de laboratorio.
- Extracción de características para pipelines de neurociencia: integrar el modelo vía `PretrainedBackbone` de OpenEEGBench y alimentar clasificadores ridge para comparar condiciones experimentales sin coste de reentrenamiento.
- Estudio controlado de geometrías de enmascaramiento: al ser uno de 58 encoders con receta idéntica, permite replicar el análisis de ablación del artículo o extenderlo a nuevas geometrías.
- Base para ajuste fino en tareas con pocos datos: sus 12,69 M de parámetros y su independencia del montaje permiten adaptarlo a cohortes pequeñas con coste computacional bajo.
- Control de calidad de senal: las representaciones pueden usarse para discriminar registros limpios de registros con artefactos, aunque la información disponible no documenta un experimento específico de este tipo.

## Benchmarks y rendimiento

Resultados publicados en la model card, correspondientes a encoder congelado con sonda ridge sobre características contextuales aplanadas, 12 conjuntos de datos y 5 semillas. La métrica es precisión balanceada, salvo en `seed-vig`, donde se reporta R².

| Dataset | Metrica | Resultado (media ± desviacion tipica) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | precision balanceada | 0,710 ± 0,029 | 5 |
| bcic2020-3 | precision balanceada | 0,285 ± 0,006 | 5 |
| bcic2a | precision balanceada | 0,465 ± 0,016 | 5 |
| chbmit | precision balanceada | 0,858 ± 0,015 | 5 |
| faced | precision balanceada | 0,320 ± 0,006 | 5 |
| isruc-sleep | precision balanceada | 0,657 ± 0,001 | 5 |
| mdd_mumtaz2016 | precision balanceada | 0,849 ± 0,004 | 5 |
| physionet | precision balanceada | 0,576 ± 0,007 | 5 |
| seed-v | precision balanceada | 0,287 ± 0,003 | 5 |
| seed-vig | R² | -0,116 ± 0,004 | 5 |
| tuab | precision balanceada | 0,802 ± 0,012 | 5 |
| tuev | precision balanceada | 0,906 ± 0,026 | 5 |

No se han publicado en la informacion disponible resultados de benchmarks comparativos frente a otros modelos de la misma categoria (por ejemplo, LaBraM, BIOT o EEGPT).

## Requisitos de hardware

- VRAM para inferencia: el encoder tiene 12,69 M de parametros, es decir, unos 51 MB en fp32 y unos 25 MB en fp16. Con activaciones y buffers de entrada, la inferencia cabe holgadamente por debajo de 1 GB en cualquier configuracion razonable.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior resulta mas que adecuada. El paper entreno con 2 × H100 para el preentrenamiento, pero eso corresponde al proceso de entrenamiento, no a la inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: el modelo no se integra con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje. El uso previsto es PyTorch nativo mediante `eeg_fm_masking.oeb.wrapper.ContextualEncoderBenchmarkWrapper` o `open_eeg_bench.backbone.PretrainedBackbone`, con `safetensors.torch.load_file` para cargar los pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano del encoder, se espera que el cuello de botella real sea la carga y el preprocesado de la senal, no el calculo del transformer.

## Comparativa con modelos similares

La informacion disponible no incluye parametros, contexto ni resultados de modelos externos comparables, por lo que la comparacion se limita a los modelos hermanos de la misma coleccion, entrenados con receta identica y unica diferencia en la geometria de enmascaramiento.

| Modelo | Marco | Geometria de enmascaramiento | Parametros | Resultados publicados | Licencia |
|---|---|---|---|---|---|
| eeg-fm-masking_mae_r6cm_L2 (este) | MAE | r = 6 cm, L = 2 | 12,69 M | 12 datasets, incluidos en la tabla anterior | CC-BY-4.0 |
| eeg-fm-masking_mae_r9cm_L2 | MAE | r = 9 cm, L = 2 | No disponible | No disponibles en la informacion proporcionada | CC-BY-4.0 |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | r = 9 cm, L = 2 | No disponible | No disponibles en la informacion proporcionada | CC-BY-4.0 |
| LaBraM, BIOT, EEGPT y otros modelos fundacionales de EEG | No disponible | No disponible | No disponible | No disponibles en la informacion proporcionada | No disponible |

Nota: el articulo recomienda la configuracion r = 9 cm, L = 2, lo que sitúa a este checkpoint de 6 cm como una variante exploratoria del barrido y no como la configuracion de referencia del estudio.

## Limitaciones y advertencias

- Rendimiento proximo al azar en varias tareas: 0,285 en `bcic2020-3`, 0,287 en `seed-v` y 0,320 en `faced` sobre tareas binarias o de pocas clases, lo que indica que el encoder congelado no captura senal discriminativa suficiente en esos paradigmas.
- R² negativo en `seed-vig` (-0,116): la sonda ridge sobre caracteristicas congeladas rinde peor que predecir la media, por lo que este modelo no es adecuado para esa tarea de regresion sin ajuste fino.
- Dependencia estricta del preprocesado: la entrada debe estar a 200 Hz, en voltios y con posiciones de canal en metros. Estandarizar los datos antes de pasarlos al wrapper o cambiar la frecuencia de muestreo degrada o invalida los resultados.
- Montaje obligatorio con posiciones 3D: si un canal carece de coordenadas, el modelo no puede procesarlo.
- Decodificador no incluido: el repositorio solo contiene el encoder, por lo que no es posible realizar reconstruccion de senal ni generar EEG sintetico con estos pesos.
- Sesgo de corpus: el preentrenamiento usa 323 registros del subconjunto de licencia abierta de REVE. Las poblaciones, patologias y equipos de registro ausentes de ese corpus estan subrepresentados, lo que puede sesgar el rendimiento en cohortes distintas.
- Sin validacion clinica: los resultados de OpenEEGBench son experimentos de investigacion con validacion cruzada; no existe evidencia de uso diagnostico. No debe emplearse en decisiones clinicas sin validacion prospectiva y regulatoria.
- Riesgo de falsos negativos y falsos positivos: en tareas de cribado (por ejemplo, deteccion de anomalias o de crisis) un modelo con 0,80-0,90 de precision balanceada sigue produciendo errores no despreciables en entornos reales.
- Restricciones de licencia: los pesos estan bajo CC-BY-4.0, lo que exige atribucion al autor y permite uso comercial con esa condicion; el codigo del repositorio GitHub esta bajo MIT. Verificar la licencia de los datos de REVE antes de cualquier redistribucion derivada.
- Un unico checkpoint: se publica solo la epoca 10 de 10, sin informacion sobre la variabilidad entre semillas de preentrenamiento ni sobre la estabilidad del entrenamiento.
- Modelo no conversacional: no soporta tool calling, agentes, razonamiento multi-paso, vision ni audio; cualquier expectativa en ese sentido es inaplicable.
- Ecosistema limitado: depende de los repositorios `eeg-fm-masking` y `open_eeg_bench` para cargarse correctamente; no hay soporte en frameworks de inferencia genericos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r6cm_L2
- Pagina del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Codigo fuente (MIT): https://github.com/PierreGtch/eeg-fm-masking
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Modelo recomendado por el articulo (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Modelo recomendado por el articulo (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/mi2jxz5g
