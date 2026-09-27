# PierreGtch/eeg-fm-masking_mae_r12cm_L8

## Resumen

eeg-fm-masking_mae_r12cm_L8 es un codificador de electroencefalografía (EEG) preentrenado mediante un autoencoder enmascarado (MAE) por PierreGtch, publicado como parte del estudio *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. No es un modelo de lenguaje: es un foundation model de senales biomedicas que transforma ventanas de EEG en representaciones contextuales reutilizables para tareas posteriores de clasificacion o regresion.

El modelo pertenece a una familia de 58 codificadores entrenados con una receta identica en la que solo varia la geometria de enmascaramiento: 5 radios espaciales x 6 longitudes temporales x 2 marcos de entrenamiento (MAE y JEPA). En concreto, esta variante usa un radio espacial de 12 cm y una longitud temporal de 8 parches, con una fraccion de tokens sin enmascarar (`pct_unmasked`) de 0,45. El autor recomienda para uso general la configuracion r = 9 cm, L = 2, por lo que este checkpoint debe entenderse como una pieza de un barrido experimental mas que como el modelo de referencia de la familia.

Su relevancia es metodologica y practica: aisla el efecto de la geometria de masking sobre la calidad de las representaciones EEG, y libera pesos bajo CC-BY-4.0 entrenados solo sobre un subconjunto con licencia abierta del corpus REVE (323 registros), lo que permite redistribuir los pesos. Con 12,69 M de parametros en el codificador, es un modelo muy ligero que cabe en cualquier GPU de consumo e incluso en CPU para inferencia por lotes pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches temporal y autoencoder enmascarado (MAE); solo se publica el codificador |
| Parametros totales | 12.692.096 (codificador) |
| Longitud de contexto | No disponible como "contexto" de lenguaje; la entrada se segmenta en parches de 1 s (200 muestras a 200 Hz) con solapamiento de 20 muestras |
| Tipos de cuantizacion | No disponible (repo solo con safetensors en el formato de entrenamiento) |
| Idiomas soportados | No aplica; modelo de senales EEG, no de texto |
| Licencia | CC-BY-4.0 (pesos); el codigo asociado es MIT |
| Formato de pesos | safetensors (`model.safetensors`, solo codificador: `feature_encoder.*` + `model.*`) |
| Tamano del repositorio | 0,1 GB |
| Frecuencia de muestreo de entrada | 200 Hz |
| Geometria de masking (entrenamiento) | Radio espacial r = 12 cm, longitud temporal L = 8 parches, pct_unmasked = 0,45 |
| Checkpoint | epoca 10 de 10 (v9, el evaluado en el paper) |
| Escalado de entrada | factor = 1e+06 sobre voltios y normalizacion por ventana `median_std_clip` (clip en sigma = 15); no estandarizar previamente |
| Posiciones de canales | Requiere posiciones 3D en metros (`info["chs"][i]["loc"][:3]`); agnostico al montaje |

## Arquitectura y entrenamiento

El modelo sigue el esquema de masked autoencoder: un tokenizador convierte la senal EEG en parches de 1 segundo (200 muestras a 200 Hz, con 20 muestras de solapamiento) y un transformer procesa unicamente los parches no enmascarados; un decodificador ligero reconstruye la senal cruda de los parches ocultos. La geometria de masking combina un radio espacial (12 cm, que determina que electrodos se ocultan de forma conjunta) y una longitud temporal (8 parches, que determina cuantos parches consecutivos se ocultan por canal). El repositorio publica exclusivamente los tensores del codificador, que son exactamente los cargados en la evaluacion downstream del paper; el decodificador MAE no se incluye. El modelo es agnostico al montaje: acepta cualquier numero y conjunto de canales siempre que cada uno tenga una posicion 3D, lo que permite aplicar el mismo codificador a cabezales distintos sin reentrenamiento.

El preentrenamiento uso el subconjunto de licencia abierta del corpus REVE (323 grabaciones), lo que permite redistribuir los pesos bajo CC-BY-4.0. El calendario consistio en 10 epocas sobre 2 x H100, con batch size de 600 por GPU, tasa de aprendizaje 0,00024 (warm-up de 3080 pasos, valor final 1e-06) y weight decay 0,01. Al ser un modelo auto-supervisado de representaciones, no hay RLHF ni DPO: la unica senal de entrenamiento es la reconstruccion de la senal enmascarada.

## Capacidades

- Extraccion de caracteristicas EEG: genera representaciones contextuales por parche temporal a partir de senales multicanal en voltios a 200 Hz.
- Aprendizaje auto-supervisado sin etiquetas: el preentrenamiento no requiere anotaciones, solo senal cruda.
- Independencia de montaje: funciona con cualquier numero y disposicion de canales, siempre que se aporten posiciones 3D en metros.
- Transferencia a tareas downstream: actua como backbone congelado para clasificacion y regresion sobre 12 conjuntos de datos de OpenEEGBench.
- Aplicable a distintas modalidades de tarea EEG: tareas cognitivas, sueno, epilepsia, estados de reposo, potenciales evocados y clasificacion de artefactos, segun los datasets evaluados.
- No soporta generacion de texto, tool calling ni razonamiento multi-paso: es un modelo de representacion, no un modelo generativo de lenguaje ni un agente.
- Capacidad multilingue: no aplica (entrada de senal, no de texto).

## Casos de uso

- Clasificacion de sueno: congelando el codificador y anadiendo una sonda lineal o ridge se pueden estimar fases del sueno; en `isruc-sleep` el modelo alcanza 0,670 de exactitud balanceada, suficiente como extractor para pipelines de investigacion clinica.
- Deteccion de crisis epilepticas: sobre `chbmit` obtiene 0,894 de exactitud balanceada con encoder congelado, lo que lo hace util como primera etapa en sistemas de alerta o cribado sobre registros largos.
- Monitorizacion de estados de reposo y vigilancia: el modelo extrae representaciones de EEG en reposo (por ejemplo `physionet`, 0,571, o `seed-v`/`seed-vig`), aplicables a estudios de carga cognitiva o seguimiento de fatiga donde no hay etiquetas abundantes.
- Clasificacion de tareas cognitivas y potenciales relacionados con eventos: para paradigmas como `arithmetic_zyma2019` (0,727) o `faced` (0,313) sirve como extractor fijo cuando se dispone de pocos datos etiquetados por sujeto.
- Cribado de trastornos del estado de animo: con 0,818 de exactitud balanceada en `mdd_mumtaz2016`, puede integrarse como etapa de feature extraction en estudios exploratorios de depresion basados en EEG.
- Deteccion de artefactos y anomalias en registros clinicos: en `tuev` alcanza 0,905 de exactitud balanceada, lo que permite usarlo como bloque de preprocesado o de control de calidad antes de analisis manual.
- Investigacion sobre representaciones EEG: al ser una de las 58 variantes con receta fija, permite aislar experimentalmente el efecto de la geometria de masking y comparar MAE frente a JEPA con el resto de codificadores de la coleccion.
- Base para fine-tuning ligero: sus 12,69 M de parametros permiten ajuste completo en GPUs pequenas y sirven de punto de partida cuando se dispone de un dataset etiquetado especifico de un montaje o dominio concreto.

## Benchmarks y rendimiento

Evaluacion downstream en OpenEEGBench con encoder congelado y sonda ridge sobre las caracteristicas contextuales aplanadas (12 datasets x 5 semillas). Exactitud balanceada para clasificacion y R cuadrado para `seed-vig`.

| Dataset | Metrica | Resultado (media +- sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | exactitud balanceada | 0,727 +- 0,012 | 5 |
| bcic2020-3 | exactitud balanceada | 0,265 +- 0,009 | 5 |
| bcic2a | exactitud balanceada | 0,450 +- 0,002 | 5 |
| chbmit | exactitud balanceada | 0,894 +- 0,009 | 5 |
| faced | exactitud balanceada | 0,313 +- 0,006 | 5 |
| isruc-sleep | exactitud balanceada | 0,670 +- 0,005 | 5 |
| mdd_mumtaz2016 | exactitud balanceada | 0,818 +- 0,009 | 5 |
| physionet | exactitud balanceada | 0,571 +- 0,008 | 5 |
| seed-v | exactitud balanceada | 0,283 +- 0,001 | 5 |
| seed-vig | R cuadrado | -0,190 +- 0,004 | 5 |
| tuab | exactitud balanceada | 0,803 +- 0,004 | 5 |
| tuev | exactitud balanceada | 0,905 +- 0,029 | 5 |

No se han publicado en la informacion disponible resultados comparativos frente a otros foundation models EEG en forma de tabla; el paper compara las 58 variantes entre si, pero sus cifras no se recogen aqui.

## Requisitos de hardware

- VRAM de inferencia: muy baja. Los 12,69 M de parametros ocupan aproximadamente 51 MB en fp32 o 25 MB en fp16, mas las activaciones, que dependen del numero de parches de entrada.
- GPU recomendadas: cualquier GPU moderna sirve; el entrenamiento de referencia se hizo en 2 x H100 con batch de 600 por GPU, pero la inferencia funciona en GPUs de gama baja.
- Cabe en GPU de consumo: si, con holgura en cualquier RTX (por ejemplo 3060, 4060, 4090), e incluso en CPU para lotes pequenos o evaluacion offline.
- Opciones de despliegue: carga directa con PyTorch y `safetensors`, integracion mediante el wrapper `ContextualEncoderBenchmarkWrapper` y evaluacion/ajuste con OpenEEGBench (`PretrainedBackbone`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eeg-fm-masking_mae_r12cm_L8 | 12,69 M | Parches de 1 s a 200 Hz; r = 12 cm, L = 8 | Ver tabla de OpenEEGBench | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_mae_r9cm_L2 | No disponible (misma receta, 58 variantes) | r = 9 cm, L = 2 | No disponible en esta ficha | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_jepa_r9cm_L2 | No disponible (misma receta) | r = 9 cm, L = 2, marco JEPA | No disponible en esta ficha | CC-BY-4.0 | HuggingFace |
| Otros foundation models EEG (por ejemplo EEGPT, LaBraM, BIOT) | No disponible | No disponible | No disponible | No disponible | No disponible |

El autor recomienda explicitamente las variantes r = 9 cm, L = 2 (tanto MAE como JEPA) como configuracion de referencia. No se dispone de datos de rendimiento de modelos EEG de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso; cualquier expectativa de ese tipo es incorrecta.
- Rendimiento desigual por tarea: el modelo es fuerte en `tuev` (0,905), `chbmit` (0,894) y `mdd_mumtaz2016` (0,818), pero cercano al azar en `bcic2020-3` (0,265), `seed-v` (0,283) o `faced` (0,313). En `seed-vig` el R cuadrado es negativo (-0,190), lo que indica que las representaciones lineales no capturan bien esa variable.
- Dependencia estricta del preprocesado: exige 200 Hz, voltios, escalado `median_std_clip` con clip en sigma = 15 y posiciones de canal en metros. Alimentar datos estandarizados de antemano o con otra frecuencia degrada las representaciones.
- Requiere posiciones 3D de los electrodos: sin metadatos de localizacion por canal, el modelo no puede construir el enmascaramiento espacial para el que fue entrenado.
- Naturaleza experimental: no es el checkpoint de referencia de la familia (el autor recomienda r = 9 cm, L = 2) y forma parte de un barrido de 58 configuraciones; su uso en produccion deberia justificarse frente a esas alternativas.
- Sesgos y generalizacion: el preentrenamiento usa solo 323 grabaciones del subconjunto abierto de REVE, con la composicion demografica y de montajes que tenga ese corpus; no se documentan analisis de sesgo por edad, sexo o patologia.
- Riesgo de alucinacion: no aplica a texto, pero si existe riesgo de representaciones poco fiables fuera de la distribucion de entrenamiento (montajes, patologias o artefactos no vistos).
- Licencia: CC-BY-4.0 permite uso comercial con atribucion; el codigo del repositorio asociado es MIT. Cualquier uso derivado debe citar el paper.
- Advertencia clinica: los resultados son de investigacion con encoder congelado y sonda ridge; no hay validacion clinica ni marcado sanitario, por lo que no debe emplearse para diagnostico sin validacion adicional.
- Modelo sin mantenimiento y sin adopcion: 0 descargas y 0 likes en el momento del registro, por lo que la comunidad y el soporte son practicamente inexistentes.

## Enlaces

- HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r12cm_L8
- Variante recomendada (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Coleccion completa (58 modelos): https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Sitio web del paper: https://pierregtch.github.io/eeg-fm-masking
- Codigo (MIT): https://github.com/PierreGtch/eeg-fm-masking
- Registro de entrenamiento (WandB): https://wandb.ai/pierregtch/chan-inv-clf/runs/9p8xmw0q
