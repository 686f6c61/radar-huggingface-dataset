# PierreGtch/eeg-fm-masking_mae_r6cm_L16

## Resumen

eeg-fm-masking_mae_r6cm_L16 es un codificador de electroencefalograma (EEG) preentrenado mediante aprendizaje autosupervisado, desarrollado por PierreGtch como parte del trabajo *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. Se trata de un modelo fundacional especializado en senales cerebrales que actua como extractor de caracteristicas: no genera texto ni responde instrucciones, sino que transforma ventanas de senal EEG en representaciones contextuales reutilizables para tareas posteriores (clasificacion, regresion, deteccion de patologias).

El modelo pertenece a una familia de 58 codificadores entrenados bajo una receta identica en la que solo varia la geometria del enmascaramiento: 5 radios espaciales x 6 longitudes temporales x 2 marcos (MAE y JEPA). Este checkpoint concreto corresponde a un masked autoencoder (MAE) con radio espacial de 6 cm y longitud temporal de 16 parches, con un 45% de parches visibles. El codificador tiene 12,69 M de parametros y trabaja sobre senales muestreadas a 200 Hz cortadas en parches de 1 s.

Su relevancia es doble: por un lado aporta un modelo fundacional de EEG ligero y agnostico al montaje de electrodos (cualquier numero y disposicion de canales funciona si estos tienen posicion 3D); por otro, forma parte de un estudio controlado que aisla el efecto de la geometria de enmascaramiento, un parametro habitualmente no analizado. Los pesos se distribuyen bajo CC-BY-4.0, lo que permite su redistribucion y uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Masked autoencoder (MAE): tokenizador de parches + encoder transformer; decodificador ligero solo en entrenamiento |
| Parametros totales | 12.692.096 (12,69 M, solo encoder) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa la senal como secuencia de parches de 1 s; 200 muestras con 20 de solapamiento) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en precision original; no se publican versiones cuantizadas) |
| Idiomas soportados | no disponible (modelo de senales EEG, no procesa lenguaje natural) |
| Licencia | CC-BY-4.0 (pesos); MIT (codigo) |
| Formato de pesos | safetensors |
| Frecuencia de muestreo requerida | 200 Hz |
| Unidades de entrada | voltios (escalado interno con factor 1e+06 y median_std_clip, sigma = 15) |
| Posicion de canales | metros (MNE `info["chs"][i]["loc"][:3]`) |
| Marco de enmascaramiento | MAE |
| Radio espacial de mascara (r) | 6 cm |
| Longitud temporal de mascara (L) | 16 parches |
| Porcentaje sin enmascarar | 0,45 |
| Checkpoint | epoca 10 de 10 (v9) |
| Tarea (pipeline) | feature-extraction |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de autoencoder enmascarado (MAE) adaptado a EEG. La senal se divide en parches de 1 segundo (200 muestras a 200 Hz, con 20 muestras de solapamiento) que se tokenizan mediante un tokenizador de parches (`feature_encoder.*`). El encoder transformer (`model.*`) procesa unicamente los parches no enmascarados (el 45% del total segun `pct_unmasked = 0.45`) y un decodificador ligero reconstruye la senal cruda de los parches ocultos. En el repositorio publicado se incluye exclusivamente el encoder, que es lo que se carga en la evaluacion downstream del paper; el decodificador de reconstruccion no se distribuye. La mascara combina un radio espacial de 6 cm (que determina que electrodos se ocultan en funcion de su posicion 3D) y una longitud temporal de 16 parches.

El preentrenamiento utiliza el subconjunto con licencia abierta del corpus REVE (323 grabaciones), seleccionado precisamente para que los pesos puedan redistribuirse. El entrenamiento consta de 10 epocas, se ejecuto en 2 GPU H100 con batch size de 600 por GPU, tasa de aprendizaje de 0,00024 (warm-up de 3080 pasos y valor final de 1e-06) y weight decay de 0,01. El identificador del run de entrenamiento es `vlt5ckzw`. El diseno experimental del paper es la innovacion destacable: mantiene fija toda la receta (datos, hiperparametros, arquitectura) y varia unicamente la geometria de enmascaramiento, permitiendo atribuir diferencias de rendimiento al esquema de mascara y no a otros factores. Los autores concluyen que la configuracion recomendada es r = 9 cm, L = 2, no la de este checkpoint.

## Capacidades

- Extraccion de caracteristicas (feature extraction) de senales EEG: produce representaciones contextuales por ventana que se usan como entrada a clasificadores o regresores lineales (ridge probe).
- Clasificacion downstream con encoder congelado: paralisis del sueno, deteccion de crisis epilepticas, clasificacion de imagenes motoras, deteccion de deterioro cognitivo, entre otras tareas del benchmark OpenEEGBench.
- Regresion sobre senales EEG (por ejemplo, prediccion de edad/vigilancia en el dataset seed-vig).
- Modelo agnostico al montaje: acepta cualquier numero y conjunto de canales siempre que cada uno tenga posicion 3D, lo que permite aplicarlo a sistemas de electrodos heterogeneos.
- Adaptacion por fine-tuning: al cargar con `strict=False`, se pueden anadir cabezas de clasificacion dependientes de la tarea.
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo unimodal de senales biomedicas.

## Casos de uso

- Deteccion de crisis epilepticas: el modelo puede actuar como extractor de caracteristicas sobre registros de EEG continuos (dataset chbmit, balanced accuracy 0,870) e integrarse en un pipeline de monitorizacion hospitalaria que alerte cuando un clasificador aguas abajo supere un umbral.
- Estadificacion del sueno: con un encoder congelado y una sonda ridge se obtiene una balanced accuracy de 0,667 en isruc-sleep; es adecuado para prototipos de clasificacion automatica de fases del sueno sin reentrenar el backbone.
- Diagnostico asistido de depresion: el dataset mdd_mumtaz2016 alcanza 0,822 de balanced accuracy, lo que lo hace util como componente de sistemas de apoyo al diagnostico en salud mental (siempre con supervision clinica).
- Investigacion en neurociencia cognitiva: extraccion de embeddings de EEG para estudiar correlatos de tareas aritmeticas (arithmetic_zyma2019, 0,726) o de potenciales relacionados con eventos, alimentando analisis estadisticos posteriores.
- Deteccion de anomalias en electroencefalografia clinica: la puntuacion de 0,780 en tuab (normal vs. anormal) permite usar el modelo como primera etapa de triaje en revision de EEG ambulatorio.
- Clasificacion de imagenes motoras para interfaces cerebro-computador: aplicable a datasets como bcic2a (0,407) y bcic2020-3 (0,260) como codificador base sobre el que entrenar decodificadores especificos.
- Benchmarking reproducible de modelos fundacionales de EEG: al formar parte de una familia de 58 variantes con receta identica, sirve para experimentos controlados sobre geometria de enmascaramiento y para comparar MAE frente a JEPA.
- Preentrenamiento base para transferencia a nuevos dominios de EEG: dado que es agnostico al montaje y ligero (12,69 M de parametros), puede reutilizarse como inicializacion en tareas con pocos datos etiquetados.

## Benchmarks y rendimiento

Resultados downstream con encoder congelado y sonda ridge (regresion/clasificacion sobre caracteristicas contextuales aplanadas), 12 datasets x 5 semillas. Balanced accuracy para clasificacion, R2 para seed-vig.

| Dataset | Metrica | Puntuacion (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,726 ± 0,013 | 5 |
| bcic2020-3 | balanced acc. | 0,260 ± 0,015 | 5 |
| bcic2a | balanced acc. | 0,407 ± 0,027 | 5 |
| chbmit | balanced acc. | 0,870 ± 0,059 | 5 |
| faced | balanced acc. | 0,281 ± 0,007 | 5 |
| isruc-sleep | balanced acc. | 0,667 ± 0,002 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,822 ± 0,011 | 5 |
| physionet | balanced acc. | 0,541 ± 0,005 | 5 |
| seed-v | balanced acc. | 0,263 ± 0,004 | 5 |
| seed-vig | R2 | -0,542 ± 0,091 | 5 |
| tuab | balanced acc. | 0,780 ± 0,004 | 5 |
| tuev | balanced acc. | 0,884 ± 0,054 | 5 |

No se han publicado en la informacion disponible resultados comparativos directos frente a otros modelos fundacionales de EEG (por ejemplo, frente a las variantes r = 9 cm, L = 2 o frente a JEPA) mas alla de la recomendacion cualitativa del paper.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Los pesos en fp32 ocupan aproximadamente 50 MB (12,69 M parametros x 4 bytes); con activaciones y batches moderados, del orden de 100-300 MB. Es viable incluso en CPU.
- GPU recomendadas: cualquier GPU moderna sirve para inferencia; no se requiere hardware de gama alta. El entrenamiento del paper uso 2 x H100 con batch 600 por GPU, pero eso corresponde al preentrenamiento, no al uso del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo (RTX 3060, RTX 4090, e incluso integradas) y tambien en CPU.
- Opciones de despliegue: PyTorch con el paquete `eeg_fm_masking` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`) y `ContextualEncoderBenchmarkWrapper`; para evaluacion, OpenEEGBench con `PretrainedBackbone`. No aplican servidores de inferencia de LLM como vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La comparacion mas directa es con las variantes hermanas del mismo estudio, entrenadas con receta identica y distinta geometria de mascara. No se dispone de datos numericos publicados en la informacion proporcionada para estas variantes, salvo la recomendacion de los autores.

| Modelo | Marco | Radio (r) | Longitud (L) | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| eeg-fm-masking_mae_r6cm_L16 (este) | MAE | 6 cm | 16 | 12,69 M | no disponible | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 | no disponible | no disponible | CC-BY-4.0 | HuggingFace (recomendado por los autores) |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 | no disponible | no disponible | CC-BY-4.0 | HuggingFace (recomendado por los autores) |

No se dispone de datos comparativos con otros modelos fundacionales de EEG externos (LaBraM, BIOT u otros) en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento desigual segun la tarea: la balanced accuracy en seed-v (0,263), faced (0,281) y bcic2020-3 (0,260) es baja, cercana al azar, mientras que en tuev (0,884) o chbmit (0,870) es alta. No cabe esperar un rendimiento uniforme.
- El R2 negativo en seed-vig (-0,542) indica que, como extractor congelado con sonda ridge, el modelo no explica la varianza de esa tarea mejor que un modelo trivial.
- Este checkpoint no es la configuracion recomendada por los autores: el paper sugiere r = 9 cm, L = 2. Usar esta variante puede implicar peor rendimiento que la recomendada.
- Requisitos de entrada estrictos: solo acepta senales a 200 Hz, en voltios, con parches de 1 s y posiciones de canal en metros. Aplicar una estandarizacion previa produce resultados incorrectos, ya que el wrapper aplica su propio escalado (`median_std_clip`, sigma = 15).
- Sesgos conocidos: no se documentan sesgos demograficos ni de otro tipo en la informacion disponible; los resultados dependen de la composicion del corpus REVE y de los datasets de evaluacion.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto), pero existe el riesgo de clasificaciones erroneas si se usa fuera de las tareas y poblaciones evaluadas.
- Limitaciones de idioma: el modelo no procesa lenguaje; no tiene capacidades multilingues.
- Restricciones de licencia: los pesos estan bajo CC-BY-4.0, lo que permite uso comercial y redistribucion con atribucion; el codigo esta bajo MIT. Es obligatorio citar el paper.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario practicamente inexistentes.
- Solo se distribuye el encoder, no el decodificador MAE; no es posible reproducir la tarea de reconstruccion con los pesos publicados.
- No debe usarse como herramienta de diagnostico clinico autonomo sin validacion y supervision profesional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r6cm_L16
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada MAE r9cm L2: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada JEPA r9cm L2: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Codigo (MIT): https://github.com/PierreGtch/eeg-fm-masking
- Sitio web del paper: https://pierregtch.github.io/eeg-fm-masking
- Run de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/vlt5ckzw
