# PierreGtch/eeg-fm-masking_jepa_r6cm_L1

## Resumen

`eeg-fm-masking_jepa_r6cm_L1` es un codificador de electroencefalografía (EEG) preentrenado con autoaprendizaje supervisado, publicado por PierreGtch como parte de un estudio controlado sobre geometrías de enmascaramiento en modelos fundacionales de EEG. Forma parte de una familia de 58 codificadores entrenados con una receta idéntica en la que solo varía la geometría de la máscara: 5 radios espaciales × 6 longitudes temporales × 2 marcos de entrenamiento (MAE y JEPA). Este checkpoint concreto corresponde a la variante JEPA con radio espacial r = 6 cm y longitud temporal L = 1 parche.

El modelo no es un modelo generativo de lenguaje ni un modelo multimodal: es un extractor de características (`pipeline_tag: feature-extraction`) diseñado para producir representaciones contextuales de señales EEG que después se usan con sondas ligeras o fine-tuning en tareas downstream. Tiene 12.692.096 parámetros en el codificador y se distribuye como safetensors con licencia CC-BY-4.0, junto con el código de carga bajo licencia MIT.

Su relevancia es metodológica más que de producto: permite aislar el efecto de la geometría de enmascaramiento sobre el rendimiento downstream en 12 datasets de OpenEEGBench. Los propios autores indican que la configuración recomendada por el artículo es r = 9 cm y L = 2, no la de este checkpoint, por lo que este modelo es especialmente útil como punto de comparación y como caso de estudio de una geometría subóptima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches (`feature_encoder.*` + `model.*`); marco de preentrenamiento JEPA (joint-embedding predictive architecture) con predictor y profesor EMA, no incluidos en el repo |
| Parametros totales | 12.692.096 (codificador; dato real de `model.safetensors`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible. Procesa ventanas fragmentadas en parches de 1 s (200 muestras a 200 Hz, con solapamiento de 20 muestras); el número de muestras por ventana (`n_times`) se define en tiempo de carga |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors (se presupone fp32); no hay GGUF, AWQ ni GPTQ |
| Idiomas soportados | No aplica (modelo de senales EEG, no de texto); el campo de idiomas no esta definido en el repo |
| Licencia | CC-BY-4.0 (pesos); el codigo de `eeg-fm-masking` es MIT |
| Formato de pesos | `safetensors` |
| Framework | PyTorch |
| Frecuencia de muestreo de entrada | 200 Hz |
| Unidades de entrada | Voltios (el wrapper multiplica por 1e+06 y aplica escalado `median_std_clip` con recorte en sigma = 15) |
| Montaje de canales | Agnóstico: cualquier numero y conjunto de canales, siempre que cada canal tenga posicion 3D en metros (`info["chs"][i]["loc"][:3]` de MNE) |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer sobre parches temporales: la señal EEG se corta en parches de 1 s (200 muestras con 20 muestras de solapamiento), se tokeniza mediante `feature_encoder.*` y se procesa con el cuerpo transformer `model.*`. Sobre esa base se aplica el marco JEPA: un predictor mapea el contexto codificado a los embeddings que un profesor EMA genera para los parches enmascarados. A diferencia del marco MAE, JEPA no reconstruye la señal en el espacio de entrada y, según la model card, no emplea regularizador de varianza/covarianza. El repo publica únicamente el codificador estudiante, es decir, exactamente los tensores cargados en la evaluación downstream del artículo; el predictor y el profesor EMA no se redistribuyen.

El preentrenamiento utilizó el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido precisamente para que los pesos pudieran redistribuirse. El calendario fue de 10 épocas sobre 2 × H100, con batch size de 600 por GPU, learning rate de 0,00024 (warm-up de 3080 pasos y valor final 1e-06) y weight decay de 0,01. El checkpoint publicado es el de la época 10 de 10 (etiquetado `v9`), el evaluado en el artículo. La innovación técnica del trabajo no reside en el modelo individual, sino en el diseño experimental: 58 variantes con receta fija que permiten atribuir diferencias de rendimiento únicamente al radio espacial y la longitud temporal de la máscara (con `pct_unmasked = 0,45` en este caso).

## Capacidades

- Extraccion de caracteristicas EEG: genera embeddings contextuales para ventanas de señal, pensados para alimentar sondas congeladas o cabezas de clasificacion.
- Clasificacion y regresion downstream mediante ridge probe: los resultados publicados usan el codificador congelado y una regresion ridge sobre las caracteristicas aplanadas.
- Adaptabilidad de montaje: funciona con cualquier numero y disposicion de electrodos, siempre que se aporte la posicion 3D en metros, lo que lo hace util con montajes no estandar.
- Procesamiento a 200 Hz con parches de 1 s y solapamiento de 20 muestras.
- Aprendizaje con pocas etiquetas: al ser un extractor preentrenado, permite entrenar clasificadores con muy pocos datos etiquetados por sujeto o tarea.
- Multiples dominios EEG dentro de una misma evaluacion: tareas aritmeticas, imagineria motora, deteccion de crisis, sueno, emociones, depresion y deteccion de anomalias.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje).
- Agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Deteccion de crisis epilepticas: es el dataset donde el modelo rinde mas (chbmit, balanced accuracy 0,902 ± 0,009). Se usaria como extractor congelado de caracteristicas sobre ventanas de EEG continuo y una cabeza de clasificacion binaria entrenada con pocas grabaciones etiquetadas, lo que reduce el coste de anotacion clinica.
- Monitorizacion de fases del sueno: con isruc-sleep obtiene 0,685 ± 0,003 de balanced accuracy. Encaja en pipelines de polisomnografia que necesitan una representacion compacta de ventanas de 1 s y un clasificador ligero por epoca.
- Deteccion de anomalias y patologia general: en tuab alcanza 0,810 ± 0,014. Sirve como etapa de cribado previo a la revision experta en registros EEG de rutina.
- Clasificacion de eventos transitorios: en tuev logra 0,916 ± 0,021, el mejor resultado de la tabla. Util para etiquetado automatico de eventos en registros largos donde el coste de revision manual es elevado.
- Interfaces cerebro-computador por imagineria motora: en bcic2a obtiene 0,464 ± 0,020. Se emplearia como representacion previa en sistemas BCI que deban adaptarse a un sujeto nuevo con pocos ensayos calibrados.
- Investigacion en depresion: en mdd_mumtaz2016 consigue 0,863 ± 0,001, con una desviacion tipica muy baja entre semillas, lo que lo hace adecuado para estudios replicables de clasificacion de pacientes frente a controles.
- Linea base para experimentos de enmascaramiento: dado que forma parte de una familia de 58 modelos con receta identica, es la pieza natural para comparar geometrias de mascara antes de fijar una configuracion de preentrenamiento propia.
- Extraccion de caracteristicas sin GPU dedicada: con 12,69 M de parametros puede ejecutarse en CPU o en GPUs de gama baja, lo que facilita su uso en entornos academicos o clinicos con hardware limitado.

## Benchmarks y rendimiento

Resultados publicados en la model card: codificador congelado, sonda ridge sobre las caracteristicas contextuales aplanadas, 12 datasets de OpenEEGBench × 5 semillas. Balanced accuracy para clasificacion y R² para `seed-vig`.

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,722 ± 0,037 | 5 |
| bcic2020-3 | balanced acc. | 0,266 ± 0,018 | 5 |
| bcic2a | balanced acc. | 0,464 ± 0,020 | 5 |
| chbmit | balanced acc. | 0,902 ± 0,009 | 5 |
| faced | balanced acc. | 0,272 ± 0,010 | 5 |
| isruc-sleep | balanced acc. | 0,685 ± 0,003 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,863 ± 0,001 | 5 |
| physionet | balanced acc. | 0,545 ± 0,012 | 5 |
| seed-v | balanced acc. | 0,300 ± 0,002 | 5 |
| seed-vig | R² | -0,179 ± 0,009 | 5 |
| tuab | balanced acc. | 0,810 ± 0,014 | 5 |
| tuev | balanced acc. | 0,916 ± 0,021 | 5 |

No se han publicado en la informacion disponible resultados de benchmarks estandar de lenguaje (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 12,69 M de parametros: unos 51 MB en fp32 y unos 25 MB en fp16, mas el coste de activaciones de la ventana de entrada (despreciable frente a modelos de lenguaje).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Para entrenamiento por lotes grandes tiene sentido usar A100, H100 o similares, pero la inferencia y la extraccion de caracteristicas no lo requieren.
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 3080, RTX 2060, GTX 1650 e incluso en GPUs integradas. Tambien es viable en CPU para cargas por lotes pequenas o moderadas.
- Contexto de entrenamiento original: 2 × H100 con batch size de 600 por GPU durante 10 epocas; esto corresponde al preentrenamiento, no al uso del modelo.
- Opciones de despliegue: PyTorch con la libreria `eeg_fm_masking` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`) y pesos safetensors descargados del Hub. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje causal. La via de integracion prevista es `PretrainedBackbone` de OpenEEGBench.
- Integracion con MNE: la carga del modelo requiere `chs_info` con las posiciones de canal de MNE en metros.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con modelos de la misma familia experimental (`eeg-fm-masking`). No se aportan cifras de modelos EEG fundacionales de terceros (por ejemplo LaBraM, BIOT o EEGPT), por lo que sus datos se marcan como no disponibles en lugar de estimarse.

| Modelo | Marco | Radio espacial | Longitud temporal | Parametros del codificador | Licencia | Notas |
|---|---|---|---|---|---|---|
| `eeg-fm-masking_jepa_r6cm_L1` (este) | JEPA | 6 cm | 1 parche | 12,69 M | CC-BY-4.0 | Geometria no recomendada por los autores |
| `eeg-fm-masking_jepa_r9cm_L2` | JEPA | 9 cm | 2 parches | No disponible | CC-BY-4.0 | Configuracion recomendada por el articulo |
| `eeg-fm-masking_mae_r9cm_L2` | MAE | 9 cm | 2 parches | No disponible | CC-BY-4.0 | Configuracion recomendada por el articulo |
| Resto de la familia (58 modelos en total) | MAE o JEPA | 5 radios distintos | 6 longitudes distintas | No disponible | CC-BY-4.0 | Receta identica, solo cambia la mascara |
| Modelos EEG fundacionales de terceros | No disponible | No disponible | No disponible | No disponible | No disponible | No se aportan datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- Geometria suboptima: los propios autores recomiendan r = 9 cm y L = 2; este checkpoint usa r = 6 cm y L = 1, por lo que no es la mejor opcion de la familia para uso práctico.
- Repo solo con el codificador: no incluye el predictor JEPA ni el profesor EMA, de modo que no se puede reproducir el preentrenamiento ni el objetivo JEPA completo a partir de los pesos publicados.
- Requisitos de entrada estrictos: 200 Hz, unidades en voltios, factor de escala 1e+06 aplicado por el wrapper y escalado `median_std_clip` interno. Estandarizar los datos por cuenta propia antes de pasarlos al modelo degrada los resultados.
- Posiciones de canal obligatorias en metros: sin `info["chs"]` de MNE con coordenadas 3D, el modelo no puede usar su codificacion espacial. El `load_state_dict` debe hacerse con `strict=False` porque el buffer de posiciones de canal y la cabeza de clasificacion dependen del dataset.
- Rendimiento desigual: en `seed-vig` el R² es negativo (-0,179), lo que indica que las caracteristicas congeladas no capturan esa tarea de forma util; en `bcic2020-3` (0,266) y `faced` (0,272) el rendimiento apenas supera el azar en un problema equilibrado. No debe asumirse un comportamiento uniforme entre tareas.
- Evaluacion limitada a sonda ridge congelada: los numeros publicados corresponden a extraccion de caracteristicas congeladas con regresion ridge, no a fine-tuning completo; el rendimiento con ajuste fino puede diferir y no se documenta.
- Riesgo de sesgo de dominio: el preentrenamiento usa el subconjunto abierto de REVE (323 grabaciones), por lo que el comportamiento fuera de esa distribucion de equipos, montajes y poblaciones no esta caracterizado.
- Uso clinico: los resultados son de investigacion sobre datasets publicos y no constituyen validacion clinica. No debe usarse para diagnostico sin validacion prospectiva y supervision medica.
- Adopcion practica: el modelo tiene 0 descargas y 0 likes en el Hub y depende de una libreria instalada desde GitHub, sin publicacion en PyPI confirmada, lo que anade friccion al despliegue.
- Licencia: CC-BY-4.0 permite uso comercial con atribucion, pero obliga a citar el articulo y a mantener la atribucion en trabajos derivados. El codigo de `eeg-fm-masking` se distribuye aparte bajo MIT.
- Idiomas: no aplica; no se debe esperar ningun comportamiento de procesamiento de lenguaje natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r6cm_L1
- Coleccion con los 58 modelos de la familia: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Configuracion recomendada por los autores (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Configuracion recomendada por los autores (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Sitio web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Codigo fuente: https://github.com/PierreGtch/eeg-fm-masking
- Registro de entrenamiento (Weights & Biases, run `p42catef`): https://wandb.ai/pierregtch/chan-inv-clf/runs/p42catef
- Articulo: *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA* (referencia de cita en la pagina de GitHub; enlace directo al paper no disponible en la informacion proporcionada)
- OpenEEGBench (framework de evaluacion): enlace no disponible en la informacion proporcionada
- Resultados de busqueda web: no se encontro ningun resultado relevante sobre este modelo; las busquedas devolvieron unicamente dominios de contenido para adultos sin relacion con el proyecto.
