# PierreGtch/eeg-fm-masking_jepa_r9cm_L8

## Resumen

eeg-fm-masking_jepa_r9cm_L8 es un codificador (encoder) de EEG preentrenado mediante aprendizaje auto-supervisado, publicado por PierreGtch junto al articulo *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. Forma parte de una familia de 58 encoders entrenados con una receta identica en la que solo varia la geometria de enmascaramiento (5 radios espaciales x 6 longitudes temporales x 2 marcos de trabajo). Este checkpoint concreto corresponde al marco JEPA con radio espacial r = 9 cm y longitud temporal L = 8 parches.

El modelo resuelve la tarea de extraccion de caracteristicas (feature extraction) sobre senales EEG: produce representaciones contextuales que despues se usan, con el encoder congelado, para clasificacion o regresion en tareas downstream (sueno, epilepsia, carga cognitiva, etc.). Cuenta con 12.692.096 parametros en su encoder, lo que lo situa en la gama ligera, y es agnostico al montaje de electrodos: admite cualquier numero y conjunto de canales siempre que cada canal tenga una posicion 3D en metros.

Su relevancia radica en que forma parte de un estudio controlado sobre como afecta la geometria de enmascaramiento al rendimiento de modelos fundacionales de EEG, un campo mucho menos explorado que el de texto o vision. El checkpoint liberado contiene unicamente el encoder (tokenizador de parches mas transformer), no el predictor JEPA ni el profesor EMA, y los pesos se distribuyen bajo licencia CC-BY-4.0 al haberse entrenado sobre un subconjunto de licencia abierta del corpus REVE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder contextual) con tokenizador de parches; preentrenamiento JEPA |
| Parametros totales | 12.692.096 (12,69 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | parches de 1 s (200 muestras a 200 Hz); sin ventana global fija declarada, longitud dependiente de la ventana de entrada |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no documenta cuantizaciones GGUF/INT8) |
| Idiomas soportados | no aplica (modelo de senal EEG, no de lenguaje) |
| Licencia | CC-BY-4.0 (pesos); codigo bajo MIT |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `metadata.json` |

Parametros de enmascaramiento asociados: radio espacial r = 9 cm, longitud temporal L = 8 parches, `pct_unmasked` = 0.45.

## Arquitectura y entrenamiento

La arquitectura combina un tokenizador de parches (`feature_encoder.*`) y un transformer (`model.*`). El preentrenamiento sigue el marco JEPA (joint-embedding predictive architecture): un predictor proyecta el contexto codificado hacia las embeddings que un profesor EMA genera para los parches enmascarados, sin regularizador de varianza/covarianza. El repositorio solo publica el encoder student evaluado en el articulo; ni el predictor ni el profesor EMA se incluyen. El wrapper de evaluacion (`ContextualEncoderBenchmarkWrapper`) define la arquitectura y el escalado de entrada a partir de `config.json`.

Los datos de entrenamiento proceden del subconjunto de licencia abierta del corpus de preentrenamiento REVE (323 grabaciones), elegido precisamente para poder redistribuir los pesos. El calendario de entrenamiento fue de 10 epocas sobre 2 GPU H100, con batch size de 600 por GPU, learning rate 0.00024 (warm-up de 3080 pasos, valor final 1e-06) y weight decay 0.01. El checkpoint liberado corresponde a la epoca 10 de 10 (version v9, la evaluada en el articulo).

La innovacion metodologica no esta en un componente aislado sino en el diseno experimental: 58 encoders entrenados con receta identica variando solo la geometria de enmascaramiento. El articulo recomienda r = 9 cm con L = 2; este checkpoint mantiene r = 9 cm pero con L = 8, por lo que no es la configuracion optima senalada por los autores, sino una de las variantes del barrido.

**Requisitos de entrada**: frecuencia de muestreo de 200 Hz; la senal se corta en parches de 1 s (200 muestras, con solapamiento de 20 muestras). Las unidades deben estar en voltios: el wrapper multiplica por `factor = 1e+06` y aplica escalado `median_std_clip` por ventana (clip en sigma = 15), por lo que no hay que estandarizar previamente. Las posiciones de canal se expresan en metros (`info["chs"][i]["loc"][:3]` de MNE).

## Capacidades

- Extraccion de caracteristicas (feature extraction) sobre senales EEG multicanal: genera embeddings contextuales por parche que sirven como entrada a cabezas de clasificacion o regresion.
- Agnostico al montaje: funciona con cualquier numero y conjunto de canales, siempre que cada canal tenga una posicion 3D en metros.
- Aprendizaje auto-supervisado: no requiere etiquetas para producir representaciones; el encoder se puede usar congelado con una sonda tipo ridge.
- Adaptacion downstream mediante fine-tuning o evaluacion con OpenEEGBench (`PretrainedBackbone`).
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingues, de vision, de audio, ni modo de razonamiento explicito; su dominio es exclusivamente la senal EEG.

## Casos de uso

- Clasificacion de estadios de sueno: con el encoder congelado y una sonda lineal, el modelo alcanza 0.688 de balanced accuracy en el dataset isruc-sleep, lo que lo hace util como extractor de caracteristicas en pipelines de polisomnografia.
- Deteccion de crisis epilepticas: obtiene 0.897 de balanced accuracy en chbmit y 0.918 en tuev, de modo que puede integrarse en sistemas de monitorizacion continua que alerten de actividad epileptiforme.
- Deteccion de anomalias en EEG clinico: con 0.812 en tuab, sirve para cribado de trazados anormales en entornos hospitalarios antes de la revision por un neurologo.
- Investigacion en depresion: 0.857 de balanced accuracy en mdd_mumtaz2016 permite usarlo como extractor de biomarcadores en estudios de trastorno depresivo mayor.
- Interfaces cerebro-computador (BCI): aplicable a tareas motoras (0.365 en bcic2a) y de imagineria (bcic2020-3, 0.264) como base de representaciones para decodificacion, teniendo en cuenta las limitaciones de rendimiento en esos conjuntos.
- Evaluacion academica controlada de geometrias de enmascaramiento: al proceder de un barrido con receta fija, permite comparar de forma aislada el efecto de r y L sobre tareas downstream.
- Preentrenamiento como inicializacion: sus pesos pueden servir de punto de partida para fine-tuning en dominios EEG especificos con pocos datos etiquetados.
- Extraccion de caracteristicas para analisis de carga cognitiva y aritmetica mental (0.728 en arithmetic_zyma2019) en estudios de neuroergonomia.

## Benchmarks y rendimiento

Resultados downstream reportados por el autor con el encoder congelado y una sonda ridge (regresion/clasificacion sobre las caracteristicas contextuales aplanadas), sobre 12 conjuntos y 5 semillas. Balanced accuracy para clasificacion y R² para `seed-vig`.

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0.728 ± 0.006 | 5 |
| bcic2020-3 | balanced acc. | 0.264 ± 0.008 | 5 |
| bcic2a | balanced acc. | 0.365 ± 0.023 | 5 |
| chbmit | balanced acc. | 0.897 ± 0.089 | 5 |
| faced | balanced acc. | 0.258 ± 0.009 | 5 |
| isruc-sleep | balanced acc. | 0.688 ± 0.003 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0.857 ± 0.009 | 5 |
| physionet | balanced acc. | 0.456 ± 0.009 | 5 |
| seed-v | balanced acc. | 0.305 ± 0.004 | 5 |
| seed-vig | R² | -0.290 ± 0.011 | 5 |
| tuab | balanced acc. | 0.812 ± 0.005 | 5 |
| tuev | balanced acc. | 0.918 ± 0.021 | 5 |

No se han publicado en la informacion disponible resultados de benchmarks mas alla de los anteriores (no hay MMLU, HumanEval, GSM8K ni equivalentes, dado que el modelo no es de lenguaje).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 12,69 M de parametros, los pesos ocupan aproximadamente 50 MB en fp32 y 25 MB en fp16.
- GPU recomendadas: cualquier GPU moderna es suficiente. El entrenamiento original uso 2 x H100, pero la inferencia no requiere hardware de ese nivel.
- Consumer GPU: cabe holgadamente en cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4090) e incluso podria ejecutarse en CPU para lotes pequenos.
- Opciones de despliegue: carga directa con PyTorch/safetensors a traves de `ContextualEncoderBenchmarkWrapper`, o integracion en OpenEEGBench mediante `PretrainedBackbone`. No se documentan despliegues en vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion disponible permite comparar con las variantes hermanas de la misma coleccion (misma receta y mismo tamano de encoder, distinta geometria o marco). No se dispone de puntuaciones individuales de esas variantes en la informacion proporcionada.

| Modelo | Marco | r (cm) | L (parches) | Parametros | Licencia | Notas |
|---|---|---|---|---|---|---|
| eeg-fm-masking_jepa_r9cm_L8 | JEPA | 9 | 8 | 12,69 M | CC-BY-4.0 | Este checkpoint; L distinto del recomendado |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 | 2 | no disponible | CC-BY-4.0 | Configuracion recomendada por el articulo (JEPA) |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 | 2 | no disponible | CC-BY-4.0 | Configuracion recomendada por el articulo (MAE) |

Para otras familias de modelos fundacionales de EEG comparables, los datos no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El articulo recomienda r = 9 cm y L = 2; este checkpoint usa L = 8, por lo que no corresponde a la mejor configuracion senalada por los autores.
- El repositorio contiene unicamente el encoder; el predictor JEPA y el profesor EMA no se incluyen, de modo que no se puede reproducir el preentrenamiento ni la parte predictiva directamente desde estos pesos.
- El rendimiento es muy desigual segun la tarea: destaca en tuev (0.918), chbmit (0.897) y mdd_mumtaz2016 (0.857), pero cae a valores cercanos o por debajo del azar en bcic2020-3 (0.264) y seed-v (0.305). En seed-vig el R² es negativo (-0.290), lo que indica un rendimiento peor que la media.
- Alta varianza en algunos conjuntos: chbmit presenta una desviacion estandar de 0.089, lo que sugiere sensibilidad a la particion o a las semillas.
- Requisitos de entrada estrictos: 200 Hz, longitudes de parche de 1 s, unidades en voltios, escalado `median_std_clip` y posiciones de canal en metros. Un preprocesado distinto puede degradar los resultados.
- Modelo especifico de EEG: no procesa texto, imagen ni audio, y no dispone de capacidades de razonamiento, tool calling ni agentes.
- Sesgos: no se documentan sesgos especificos, pero al entrenarse sobre 323 grabaciones del corpus REVE, la generalizacion a poblaciones, equipos o montajes no representados en ese corpus no esta garantizada.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero exige citar el articulo tal como indica el autor. El codigo asociado esta bajo MIT.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de predicciones espurias cuando la senal de entrada no cumple los requisitos de preprocesado.

## Enlaces

- HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L8
- Coleccion completa (58 modelos): https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Web del articulo: https://pierregtch.github.io/eeg-fm-masking
- Codigo (GitHub): https://github.com/PierreGtch/eeg-fm-masking
- Run de entrenamiento (Weights & Biases): https://wandb.ai/pierregtch/chan-inv-clf/runs/l0un9a30
- Variante recomendada JEPA r9cm L2: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Variante recomendada MAE r9cm L2: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
