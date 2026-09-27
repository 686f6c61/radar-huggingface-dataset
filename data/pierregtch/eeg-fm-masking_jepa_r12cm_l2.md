# PierreGtch/eeg-fm-masking_jepa_r12cm_L2

## Resumen

eeg-fm-masking_jepa_r12cm_L2 es un encoder de senales EEG preentrenado con aprendizaje autosupervisado, publicado por PierreGtch como parte del estudio *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. No es un modelo de lenguaje: es un modelo fundacional de dominio especifico que convierte ventanas de EEG en representaciones (features) reutilizables para tareas posteriores de clasificacion o regresion. El checkpoint contiene unicamente el encoder (tokenizador de parches mas transformer) con 12.692.096 parametros, entrenado sobre un subconjunto de licencia abierta del corpus REVE.

El modelo pertenece a una familia de 58 encoders entrenados con una receta identica en la que solo cambia la geometria del enmascaramiento (5 radios espaciales x 6 longitudes temporales x 2 frameworks). En este caso concreto: framework JEPA, radio espacial de mascara r = 12 cm y longitud temporal L = 2 parches, con pct_unmasked = 0.45. La entrada se muestrea a 200 Hz y se divide en parches de 1 segundo, y el encoder es agnostico al montaje: acepta cualquier numero y conjunto de canales siempre que cada canal tenga una posicion 3D en metros.

Su relevancia es metodologica y practica. Por un lado, forma parte de una evaluacion controlada que aísla el efecto de la geometria de enmascaramiento sobre el rendimiento downstream, un factor poco estudiado en modelos fundacionales de EEG. Por otro, sus pesos se distribuyen bajo CC-BY-4.0 y se evaluan con un protocolo reproducible (encoder congelado y sonda ridge sobre OpenEEGBench, 12 datasets x 5 semillas), lo que permite usarlo como backbone de referencia sin reentrenar. Los autores recomiendan para uso general las variantes r = 9 cm, L = 2 (MAE y JEPA), no esta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder para EEG con tokenizador de parches; preentrenamiento JEPA (predictor sobre embeddings de un teacher EMA) |
| Parametros totales | 12.692.096 (12,69 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | parches de 1 s (200 muestras a 200 Hz) con solapamiento de 20 muestras; el numero de parches depende de `n_times` de cada registro, no se especifica un maximo |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no aplica (modelo de senales EEG, no de texto) |
| Licencia | CC-BY-4.0 para los pesos; MIT para el codigo del repositorio |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` + `metadata.json` |
| Frecuencia de muestreo de entrada | 200 Hz (obligatoria) |
| Unidades de entrada | voltios; el wrapper aplica factor 1e+06 y escalado `median_std_clip` con clip en sigma = 15 |
| Posiciones de canales | metros, via MNE `info["chs"][i]["loc"][:3]` |
| Tarea declarada (pipeline) | feature-extraction |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura combina un tokenizador de parches (`feature_encoder.*`) y un transformer (`model.*`) que produce caracteristicas contextuales. El preentrenamiento sigue el esquema JEPA: un predictor proyecta el contexto del encoder hacia los embeddings que un teacher EMA genera para los parches enmascarados, sin regularizador de varianza/covarianza. La geometria de mascara de este checkpoint es radio espacial r = 12 cm y longitud temporal L = 2 parches, con una fraccion de parches sin enmascarar de 0.45. El checkpoint publicado corresponde a la epoca 10 de 10 (etiquetado `v9`, el evaluado en el paper).

El entrenamiento uso el subconjunto de licencia abierta del corpus de preentrenamiento REVE (323 grabaciones), precisamente para poder redistribuir los pesos. La receta: 10 epocas sobre 2 GPU H100, batch size de 600 por GPU, learning rate 0.00024 con warm-up de 3080 pasos y valor final 1e-06, y weight decay 0.01. El repositorio solo incluye el encoder estudiantil evaluado en el paper; el predictor JEPA y el teacher EMA no se distribuyen. El codigo de carga y evaluacion vive en el paquete `eeg-fm-masking` y se integra con `ContextualEncoderBenchmarkWrapper` y con `PretrainedBackbone` de OpenEEGBench.

## Capacidades

- Extraccion de caracteristicas (embeddings contextuales) de senales EEG a partir de ventanas de 1 segundo, aptas para sondas lineales o fine-tuning.
- Clasificacion de EEG con encoder congelado y regresion/regresion logistica ridge sobre las features aplanadas, tal como se evalua en el paper.
- Transferencia entre montajes: al ser agnostico al montaje, admite cualquier numero y disposicion de canales con posicion 3D conocida.
- Tareas discriminativas evaluadas: deteccion de anomalias en EEG clinico (tuab), clasificacion de eventos (tuev), deteccion de crisis (chbmit), estadificacion del sueno (isruc-sleep), deteccion de depresion (mdd_mumtaz2016), carga mental aritmetica (arithmetic_zyma2019), imagineria motora (bcic2a, bcic2020-3), reconocimiento facial (faced), tarea visual seed-v y prediccion de vigilancia (seed-vig).
- Cabeza de clasificacion configurable mediante `n_outputs` para adaptarse a cada dataset downstream.
- No soporta generacion de texto, tool calling, function calling, uso como agente, razonamiento multi-paso, vision, audio ni capacidades multilingues: es un modelo unimodal de senales biomedicas.

## Casos de uso

- Estadificacion automatica del sueno: preentrenado y evaluado sobre isruc-sleep (0,700 ± 0,003 de balanced accuracy con encoder congelado), sirve como extractor de features para un clasificador de fases del sueno con muy poco etiquetado adicional.
- Deteccion de crisis epilepticas: sobre chbmit alcanza 0,880 ± 0,036 de balanced accuracy, lo que lo hace util como etapa de cribado en monitorizacion de larga duracion en UCI o unidades de epilepsia.
- Cribado de depresion a partir de EEG en reposo: 0,858 ± 0,008 en mdd_mumtaz2016, aprovechable como componente de un pipeline de apoyo diagnostico (nunca sustitutivo del criterio clinico).
- Deteccion de anomalias en EEG clinico (tuab, 0,806 ± 0,003) para triaje previo a la lectura por neurorrevision, priorizando los registros sospechosos.
- Clasificacion de eventos y artefactos en EEG continuo (tuev, 0,883 ± 0,005), util como preprocesado que descarta segmentos no validos antes del analisis manual.
- Estimacion de carga cognitiva en interfaces cerebro-computador experimentales: 0,778 ± 0,017 en arithmetic_zyma2019 permite construir clasificadores de esfuerzo mental con pocos datos etiquetados.
- Backbone para investigacion reproducible: al formar parte de una familia de 58 encoders con receta identica, sirve para comparar geometrias de enmascaramiento y como linea base en estudios de modelos fundacionales de EEG.
- Inicializacion para fine-tuning en datasets propios de pocos sujetos, usando la sonda ridge como referencia rapida antes de invertir en fine-tuning completo.

## Benchmarks y rendimiento

Resultados publicados en la model card: encoder congelado, sonda ridge (regresion/clasificacion) sobre las features contextuales aplanadas, 12 datasets x 5 semillas. Balanced accuracy para clasificacion, R² para `seed-vig`.

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,778 ± 0,017 | 5 |
| bcic2020-3 | balanced acc. | 0,265 ± 0,009 | 5 |
| bcic2a | balanced acc. | 0,397 ± 0,012 | 5 |
| chbmit | balanced acc. | 0,880 ± 0,036 | 5 |
| faced | balanced acc. | 0,286 ± 0,005 | 5 |
| isruc-sleep | balanced acc. | 0,700 ± 0,003 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,858 ± 0,008 | 5 |
| physionet | balanced acc. | 0,516 ± 0,006 | 5 |
| seed-v | balanced acc. | 0,305 ± 0,001 | 5 |
| seed-vig | R² | -0,206 ± 0,011 | 5 |
| tuab | balanced acc. | 0,806 ± 0,003 | 5 |
| tuev | balanced acc. | 0,883 ± 0,005 | 5 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de modelos de lenguaje, porque no aplican a este tipo de modelo. Tampoco se proporcionan los resultados de las variantes recomendadas (r = 9 cm, L = 2), por lo que no se puede cuantificar la mejora que los autores atribuyen a esa geometria.

## Requisitos de hardware

- VRAM para inferencia: ~50 MB en fp32 para los 12,69 M de parametros (estimacion a partir del recuento de parametros); el repositorio completo ocupa 0,1 GB. En la practica, el cuello de botella es la senal de entrada y el pipeline de preprocesado, no los pesos.
- Cabe en cualquier GPU de consumo (RTX 3060, 4090, etc.) e incluso en CPU para inferencia por lotes pequenos. No requiere A100 ni H100 para uso; el entrenamiento original se hizo con 2 x H100.
- Opciones de despliegue: PyTorch con el paquete `eeg-fm-masking` (`ContextualEncoderBenchmarkWrapper`) u OpenEEGBench (`PretrainedBackbone`) como carga estandar; para servir en produccion, exportacion a TorchScript u ONNX (no documentada en la informacion disponible) o simple batching en PyTorch. No es compatible con vLLM, TGI, llama.cpp ni Ollama, que estan orientados a modelos de lenguaje generativos.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de inferencia ni de muestras por segundo.
- El coste real de integracion esta en garantizar la frecuencia de muestreo de 200 Hz, las unidades en voltios y las posiciones 3D de los canales en metros.

## Comparativa con modelos similares

Comparativa dentro de la misma familia de 58 encoders, que comparten receta y numero de parametros; los datos de rendimiento de las variantes recomendadas no estan en la informacion proporcionada.

| Modelo | Framework | Mascara | Parametros | Contexto/entrada | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| eeg-fm-masking_jepa_r12cm_L2 (este) | JEPA | r = 12 cm, L = 2, pct_unmasked 0.45 | 12,69 M | parches de 1 s a 200 Hz, agnostico al montaje | CC-BY-4.0 | Tabla de 12 datasets incluida arriba |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | r = 9 cm, L = 2 | no disponible (misma receta, se indica que el encoder es de 12,69 M en el paper) | parches de 1 s a 200 Hz | CC-BY-4.0 | no disponible en esta informacion |
| eeg-fm-masking_mae_r9cm_L2 | MAE | r = 9 cm, L = 2 | no disponible | parches de 1 s a 200 Hz | CC-BY-4.0 | no disponible en esta informacion |

Alternativas de otros autores en la categoria de modelos fundacionales de EEG (por ejemplo LaBraM o EEGPT): no disponibles en la informacion proporcionada; no se dispone de sus parametros, contexto ni resultados para una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo generativo ni conversacional: no produce texto, no soporta tool calling ni agentes, y no debe presentarse como sustituto de un LLM en ninguna tarea.
- Este checkpoint no es la configuracion recomendada por los propios autores: el paper recomienda r = 9 cm, L = 2. Usar la variante r = 12 cm debe justificarse explicitamente.
- Rendimiento muy desigual segun la tarea. Los peores resultados son bcic2020-3 (0,265 de balanced accuracy), faced (0,286) y seed-v (0,305), proximos o por debajo de un clasificador trivial en problemas multiclase; en bcic2a (0,397) tambien queda lejos de resultados competitivos.
- `seed-vig` obtiene un R² de -0,206 ± 0,011, es decir, peor que predecir la media. No debe usarse para regresion de vigilancia sin reentrenar.
- Preentrenado solo con 323 grabaciones del subconjunto abierto de REVE: la cobertura de patologias, montajes y poblaciones es limitada y puede inducir sesgos hacia los protocolos presentes en el corpus.
- Riesgo de generalizacion deficiente en datasets con montajes, equipos o poblaciones distintos a los del preentrenamiento; el sesgo concreto por edad, sexo, etnia o condicion clinica no esta cuantificado en la informacion disponible.
- El repositorio solo contiene el encoder. El predictor JEPA y el teacher EMA no se distribuyen, por lo que no se puede reproducir el preentrenamiento completo desde este repositorio.
- Requisitos de entrada estrictos: 200 Hz exactos, unidades en voltios y posiciones de canal en metros. Un preprocesado incorrecto (por ejemplo, estandarizar antes de pasar los datos, cuando el wrapper ya aplica su propio escalado) invalida los resultados.
- `load_state_dict` debe hacerse con `strict=False`, dejando fuera el buffer de posiciones de canales y la cabeza de clasificacion, que dependen del dataset.
- Licencia CC-BY-4.0 en los pesos: permite uso comercial, pero exige atribucion y citar el paper. El codigo esta bajo MIT, con condiciones distintas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de la comunidad ni reportes de terceros sobre su comportamiento en produccion.
- Uso clinico: cualquier aplicacion de cribado o diagnostico requiere validacion regulatoria y supervision profesional; los resultados de la model card son experimentales y con encoder congelado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r12cm_L2
- Variante recomendada JEPA r = 9 cm, L = 2: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Variante recomendada MAE r = 9 cm, L = 2: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Web del paper: https://pierregtch.github.io/eeg-fm-masking
- Codigo (licencia MIT): https://github.com/PierreGtch/eeg-fm-masking
- Run de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/mtbmkrzi
