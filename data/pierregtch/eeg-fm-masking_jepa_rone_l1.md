# PierreGtch/eeg-fm-masking_jepa_rone_L1

## Resumen

eeg-fm-masking_jepa_rone_L1 es un codificador (encoder) de electroencefalografía (EEG) preentrenado con aprendizaje autosupervisado, publicado por PierreGtch como parte de un estudio controlado sobre geometrías de enmascaramiento en modelos fundacionales de EEG. El modelo pertenece a una familia de 58 codificadores entrenados con una receta idéntica en la que solo cambia la geometría de la máscara: 5 radios espaciales × 6 longitudes temporales × 2 marcos de preentrenamiento (MAE y JEPA). Esta variante concreta usa el marco JEPA (joint-embedding predictive architecture), un radio espacial r de un solo canal y una longitud temporal L de un parche.

El modelo no genera texto ni trabaja con lenguaje natural: es un extractor de características para señales EEG. Procesa la señal a 200 Hz, la divide en parches de 1 segundo (200 muestras, con 20 muestras de solapamiento) y produce representaciones contextuales que se evalúan con sondas lineales (ridge) sobre el codificador congelado. Con 12,69 millones de parámetros y un repositorio de 0,1 GB, es un modelo pequeño y ligero, pensado para ser reutilizado como backbone en tareas downstream de neurociencia y neurotecnología.

Su relevancia actual es metodológica: el paper del que procede aísla el efecto de la geometría de enmascaramiento manteniendo constante todo lo demás, lo que permite comparaciones limpias entre configuraciones. La model card indica que la configuración recomendada por el paper es r = 9 cm, L = 2, no la de este checkpoint, de modo que esta variante debe entenderse como un punto de la rejilla experimental más que como el modelo de referencia de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA (joint-embedding predictive architecture) sobre encoder transformer con tokenizador de parches; en el repositorio solo se publica el encoder (tokenizador `feature_encoder.*` + transformer `model.*`) |
| Parametros totales | 12.692.096 (12,69 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de modelos de lenguaje; el modelo opera sobre ventanas de senal EEG segmentadas en parches de 1 s (200 muestras a 200 Hz, con 20 muestras de solapamiento) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos en safetensors sin variantes cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo de senal EEG, no de texto); no disponible |
| Licencia | CC-BY-4.0 para los pesos; el codigo del repositorio asociado es MIT |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `metadata.json` |

Parametros adicionales de la geometria de enmascaramiento:

| Parametro | Valor |
|---|---|
| Framework | JEPA |
| Radio espacial de mascara `r` | un canal |
| Longitud temporal de mascara `L` | 1 parche |
| `pct_unmasked` | 0,45 |
| Checkpoint | epoca 10 de 10 (v9, el evaluado en el paper) |
| Run de entrenamiento | `se0wazkq` |

## Arquitectura y entrenamiento

La arquitectura es un JEPA aplicado a EEG: un predictor proyecta el contexto codificado hacia los embeddings que un profesor EMA genera para los parches enmascarados, sin regularizador de varianza/covarianza. El repositorio publicado contiene unicamente el encoder estudiante, que es exactamente el conjunto de tensores cargado en la evaluacion downstream del paper; el predictor JEPA y el profesor EMA no se distribuyen. El tokenizador convierte la senal en parches de 1 segundo a 200 Hz y el transformer produce representaciones contextuales sobre las que se ajusta una sonda ridge.

El preentrenamiento usa el subconjunto de licencia abierta del corpus REVE (323 grabaciones), elegido precisamente para que los pesos puedan redistribuirse. El schedule es de 10 epocas sobre 2 × H100, con batch size de 600 por GPU, learning rate de 0,00024 (warm-up de 3080 pasos, valor final 1e-06) y weight decay de 0,01. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de representacion de senal y no de generacion de texto.

Dos detalles de integracion son criticos: la senal debe entregarse en voltios (el wrapper multiplica por un factor de 1e+06 y aplica el escalado `median_std_clip` con recorte en sigma = 15, por lo que no hay que estandarizar previamente), y cada canal debe aportar su posicion 3D en metros (campo `loc[:3]` de MNE). El modelo es agnostico al montaje: admite cualquier numero y conjunto de canales siempre que todos tengan posicion tridimensional.

## Capacidades

- Extraccion de caracteristicas de senal EEG: es la funcion principal del modelo y su `pipeline_tag` en HuggingFace (`feature-extraction`). Devuelve representaciones contextuales por ventana.
- Clasificacion downstream con sonda congelada: las caracteristicas aplanadas se usan con regresion/Clasificacion ridge en 12 conjuntos de datos de OpenEEGBench.
- Regresion sobre variables continuas: evaluado con R² en la tarea `seed-vig` (vigilancia), aunque con resultado negativo.
- Agnosticismo de montaje: funciona con cualquier numero y disposicion de electrodos, siempre que cada canal tenga coordenadas 3D en metros.
- Independencia de la tasa de muestreo en el diseno: la model card fija 200 Hz y parches de 1 s, por lo que la senal debe remuestrearse a esa frecuencia antes de entrar al wrapper.
- Aprendizaje autosupervisado sin etiquetas: el preentrenamiento no requiere anotaciones, lo que facilita el ajuste a nuevos dominios de senal.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision ni audio. Es un modelo unimodal de senal.

## Casos de uso

- Monitorizacion de sueno: el modelo obtiene 0,655 ± 0,004 de balanced accuracy en `isruc-sleep` con el codificador congelado, por lo que puede actuar como extractor de caracteristicas para clasificar fases de sueno en estudios polisomnograficos sin reentrenar el backbone.
- Deteccion de crisis epilepticas: con 0,920 ± 0,020 en `chbmit` y 0,911 ± 0,003 en `tuev`, es adecuado como etapa de extraccion en pipelines de deteccion de eventos epileptiformes sobre registros continuos.
- Triaje de encefalopatia y anomalias: 0,792 ± 0,016 en `tuab` (deteccion de EEG anormal) lo hace utilizable como primera etapa de cribado en entornos clinicos donde se necesita priorizar revision humana.
- Investigacion en salud mental: 0,833 ± 0,004 en `mdd_mumtaz2016` permite usarlo en estudios de depresion mayor como extractor de representaciones comparables entre cohortes.
- Interfaces cerebro-computador: 0,416 ± 0,007 en `bcic2a` sugiere que rinde mejor como componente de un pipeline con ajuste fino que como sonda lineal congelada en tareas de imaginacion motora.
- Evaluacion comparativa de metodos de enmascaramiento: al formar parte de un conjunto de 58 codificadores con receta identica, sirve como punto de control experimental para medir el efecto de la geometria de mascara (r = un canal, L = 1) frente a configuraciones como r = 9 cm, L = 2.
- Preentrenamiento de backbones especificos de dominio: al ser un encoder pequeno (12,69 M de parametros) y agnostico al montaje, puede ajustarse con datos propios de una clinica o un laboratorio sin requisitos de hardware elevados.
- Carga cognitiva y vigilancia: la tarea `seed-vig` esta contemplada en la evaluacion, aunque el R² obtenido (-0,311 ± 0,010) indica que esta configuracion concreta no es adecuada para predecirla con sonda lineal congelada.

## Benchmarks y rendimiento

Resultados de OpenEEGBench con codificador congelado y sonda ridge sobre las caracteristicas contextuales aplanadas, 12 conjuntos de datos × 5 semillas. Balanced accuracy para clasificacion y R² para `seed-vig`.

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,655 ± 0,006 | 5 |
| bcic2020-3 | balanced acc. | 0,268 ± 0,015 | 5 |
| bcic2a | balanced acc. | 0,416 ± 0,007 | 5 |
| chbmit | balanced acc. | 0,920 ± 0,020 | 5 |
| faced | balanced acc. | 0,251 ± 0,010 | 5 |
| isruc-sleep | balanced acc. | 0,655 ± 0,004 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,833 ± 0,004 | 5 |
| physionet | balanced acc. | 0,504 ± 0,005 | 5 |
| seed-v | balanced acc. | 0,311 ± 0,001 | 5 |
| seed-vig | R² | -0,311 ± 0,010 | 5 |
| tuab | balanced acc. | 0,792 ± 0,016 | 5 |
| tuev | balanced acc. | 0,911 ± 0,003 | 5 |

No se han publicado en la informacion disponible resultados comparativos de este checkpoint frente a los demas modelos de la familia (por ejemplo, los recomendados con r = 9 cm y L = 2).

## Requisitos de hardware

- Huella de memoria: 12,69 M de parametros equivalen a unos 50,8 MB en fp32 y unos 25,4 MB en fp16 (calculo derivado del numero de parametros; no hay cifras oficiales de VRAM publicadas).
- Inferencia: cabe holgadamente en cualquier GPU consumer, incluida una GTX 1650 o una iGPU moderna, e incluso en CPU para lotes pequenos. La VRAM real dependera del tamano de lote y del numero de ventanas por muestra, no del modelo.
- GPU recomendadas para uso: cualquiera con al menos 2-4 GB de VRAM para lotes moderados; no se requiere hardware de datacenter.
- GPU recomendadas para reentrenamiento: el paper uso 2 × H100 con batch de 600 por GPU durante 10 epocas, aunque por tamano de modelo es plausible reentrenar con GPUs de gama alta consumer (no confirmado en la informacion disponible).
- Opciones de despliegue: el modelo se usa a traves del paquete `eeg-fm-masking` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`) con la clase `ContextualEncoderBenchmarkWrapper`, o mediante `PretrainedBackbone` de OpenEEGBench para evaluacion y ajuste fino. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Se comparan las tres variantes de la misma familia citadas explicitamente en la model card. No hay datos de rendimiento publicados en la informacion disponible para las dos variantes recomendadas, por lo que la comparacion se limita a configuracion y disponibilidad.

| Modelo | Framework | Mascara (r, L) | Parametros encoder | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eeg-fm-masking_jepa_rone_L1 (este) | JEPA | un canal, 1 parche | 12,69 M | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm, 2 parches | no disponible en la informacion proporcionada | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm, 2 parches | no disponible en la informacion proporcionada | CC-BY-4.0 | HuggingFace |

Las dos variantes con r = 9 cm y L = 2 son las que el paper recomienda. La familia completa consta de 58 codificadores entrenados con receta identica, accesibles desde la coleccion de HuggingFace del autor. No se dispone de informacion sobre otros modelos fundacionales de EEG (por ejemplo, alternativas comparables de terceros) en el material proporcionado.

## Limitaciones y advertencias

- No es el checkpoint recomendado: la model card indica explicitamente que el paper recomienda r = 9 cm y L = 2, no la configuracion de este modelo.
- Rendimiento desigual entre tareas: los resultados de sonda congelada van de 0,251 ± 0,010 en `faced` y 0,268 ± 0,015 en `bcic2020-3` hasta 0,920 ± 0,020 en `chbmit`. Un balanced accuracy de 0,251 esta cerca del azar en tareas binarias y muy por debajo en tareas multiclase.
- R² negativo en `seed-vig` (-0,311 ± 0,010): con codificador congelado y sonda ridge, el modelo no explica la varianza de esa variable y rinde peor que un predictor trivial basado en la media.
- Dependencia estricta del preprocesado: exige 200 Hz exactos, unidades en voltios y posiciones de canal en metros. La senal no debe estandarizarse antes de entrar al wrapper, ya que este aplica su propio escalado `median_std_clip` con recorte en sigma = 15. Saltarse estos requisitos invalida los resultados.
- Pesos incompletos por diseno: solo se publica el encoder. Cualquier uso que requiera el predictor o el profesor EMA del JEPA implica reentrenarlos; no forman parte del repositorio.
- Carga con `strict=False`: obliga a excluir el buffer de posiciones de canal y la cabeza de clasificacion, que dependen del conjunto de datos. Es esperable, pero conviene verificar que el resto del estado se carga correctamente.
- Corpus de preentrenamiento pequeno y sesgado hacia lo redistribuible: 323 grabaciones del subconjunto de licencia abierta de REVE. La cobertura de montajes, patologias y poblaciones es limitada por esa restriccion de licencia, y no se detalla la composicion demografica ni clinica.
- Riesgo de sesgo no evaluado: la informacion disponible no incluye analisis de sesgos por edad, sexo, origen etnico ni por equipo de adquisicion. Un modelo de senal entrenado con pocas grabaciones puede generalizar mal fuera de su distribucion.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribucion; el codigo del repositorio asociado es MIT. Hay que citar el paper segun indique la pagina de GitHub.
- Adopcion practicamente nula: 0 descargas y 0 likes en HuggingFace en el momento consultado. No hay validacion independiente por parte de terceros.
- Sin cuantizaciones publicadas ni cifras de latencia o throughput: cualquier despliegue en produccion requiere medir el rendimiento real sobre el hardware objetivo.
- Sin soporte de texto, vision, audio, tool calling ni agentes: cualquier flujo de trabajo que necesite esas capacidades debe combinarlo con otros modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_rone_L1
- Sitio web del paper: https://pierregtch.github.io/eeg-fm-masking
- Codigo (MIT): https://github.com/PierreGtch/eeg-fm-masking
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Variante recomendada (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Run de entrenamiento (Weights & Biases): https://wandb.ai/pierregtch/chan-inv-clf/runs/se0wazkq
