# PierreGtch/eeg-fm-masking_mae_rall_L16

## Resumen

`eeg-fm-masking_mae_rall_L16` es un codificador de electroencefalograma (EEG) preentrenado mediante autoencoder enmascarado (MAE), desarrollado por PierreGtch en el marco del estudio *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. Forma parte de una familia de 58 codificadores entrenados con una receta identica en la que solo varia la geometria de enmascaramiento (5 radios espaciales × 6 longitudes temporales × 2 marcos de trabajo, MAE y JEPA). Este checkpoint concreto corresponde a la celda de radio espacial `r = all` (todos los canales) y longitud temporal `L = 16` parches, con un 45 % de parches sin enmascarar.

El modelo tiene 12.692.096 parametros de encoder y se distribuye unicamente como extractor de caracteristicas congeladas: el decodificador MAE empleado durante el preentrenamiento no se incluye en el repositorio. Su proposito es servir de backbone para tareas downstream de EEG (clasificacion, regresion) mediante una sonda ligera o fine-tuning, compitiendo con alternativas como LaBraM o BIOT. Es relevante ahora porque aborda un problema practico poco estudiado: si la geometria de enmascaramiento (que canales y que instantes se ocultan) importa mas que el propio marco de autoaprendizaje, y lo hace con 58 corridas controladas y evaluacion estandarizada en OpenEEGBench sobre 12 conjuntos de datos.

La model card indica que esta no es la configuracion recomendada por el articulo: el estudio sugiere `r = 9 cm`, `L = 2` (variantes MAE y JEPA publicadas por separado). Por tanto, esta ficha describe una celda concreta del barrido experimental, util para reproducibilidad y estudios comparativos, mas que un modelo de produccion por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder enmascarado (MAE) sobre transformer; tokenizador de parches `feature_encoder.*` + transformer `model.*` |
| Parametros totales | 12.692.096 (solo encoder; el decodificador MAE no se distribuye) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM: la senal se corta en parches de 1 s (200 muestras a 200 Hz, con solape de 20 muestras) y el numero de parches temporales es configurable via `n_times` |
| Tipos de cuantizacion | No disponible. Solo se publican pesos `safetensors`; no hay variantes GGUF, AWQ, GPTQ ni cuantizaciones documentadas. La inferencia puede ejecutarse en FP32, FP16 o BF16 |
| Idiomas soportados | No aplicable (modelo de senales EEG fisiologicas). La metadata de HuggingFace no declara idiomas |
| Licencia | Pesos: CC-BY-4.0. Codigo: MIT |
| Formato de pesos | `safetensors` (fichero `model.safetensors`, encoder unicamente) |

Otros datos de configuracion y entrenamiento:

| Parametro | Valor |
|---|---|
| Marco | MAE (masked autoencoder) |
| Radio espacial de mascara `r` | all (todos los canales) |
| Longitud temporal de mascara `L` | 16 parches |
| `pct_unmasked` | 0,45 |
| Checkpoint | epoca 10 de 10 (`v9`, el evaluado en el articulo) |
| Frecuencia de muestreo de entrada | 200 Hz |
| Unidades de entrada | voltios (el wrapper aplica `factor = 1e+06` y escalado `median_std_clip` con recorte en sigma = 15) |
| Posiciones de canales | metros, via MNE `info["chs"][i]["loc"][:3]` |
| Tamano del repositorio | 0,1 GB |
| Corrida de entrenamiento | `q7ui5yvk` |

## Arquitectura y entrenamiento

El modelo sigue un esquema de autoencoder enmascarado (MAE) aplicado a EEG. Un tokenizador de parches (`feature_encoder.*`) convierte la senal en representaciones de parches de 1 segundo (200 muestras a 200 Hz, con 20 muestras de solape entre parches consecutivos) y un transformer (`model.*`) procesa unicamente los parches visibles; el 45 % de los parches permanece sin enmascarar. Durante el preentrenamiento, un decodificador ligero reconstruia la senal cruda de los parches ocultos, pero ese decodificador no se incluye en el repositorio: los pesos publicados son exactamente los tensores cargados en la evaluacion downstream del articulo. El modelo es agnostico al montaje: acepta cualquier numero y conjunto de canales siempre que cada canal disponga de una posicion 3D en metros.

El preentrenamiento utilizo el subconjunto de licencia abierta del corpus REVE (323 registros), elegido para que los pesos puedan redistribuirse. El regimen fue de 10 epocas sobre 2 GPU H100, con tamano de lote 600 por GPU, tasa de aprendizaje 0,00024 (calentamiento de 3080 pasos y valor final 1e-06) y decaimiento de pesos 0,01. No se documenta en la informacion disponible ninguna fase de RLHF, DPO ni ajuste por instrucciones, lo cual es coherente con un modelo de extraccion de caracteristicas y no generativo. La innovacion metodologica del trabajo no reside en el modelo individual, sino en el diseno experimental: 58 codificadores con receta identica en los que solo cambia la geometria de enmascaramiento, lo que permite aislar el efecto de `r` y `L` con una evaluacion comun.

## Capacidades

- Extraccion de caracteristicas contextuales a partir de senales EEG multicanal en bruto, sin necesidad de ingenieria de caracteristicas manual.
- Clasificacion downstream mediante sonda congelada (regresion ridge sobre caracteristicas aplanadas), el modo de uso evaluado en el articulo.
- Regresion continua (por ejemplo, la tarea `seed-vig`, evaluada con R²).
- Fine-tuning del encoder completo sobre nuevos conjuntos de datos EEG mediante el backbone `PretrainedBackbone` de OpenEEGBench.
- Independencia de montaje: funciona con cualquier numero y disposicion de electrodos, siempre que cada canal tenga coordenada 3D.
- Transferencia entre dominios EEG: el mismo encoder se ha evaluado en interfaces cerebro-computador, deteccion de crisis epilepticas, monitorizacion de sueno, deteccion de depresion y tareas cognitivas.
- Entrada multisujeto sin metadatos de sujeto, gracias al escalado por ventana `median_std_clip`.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modos de pensamiento. No es un modelo de lenguaje.

## Casos de uso

- Extraccion de caracteristicas congeladas para clasificacion rapida: el uso principal previsto. Se carga el encoder, se congelan sus pesos y se entrena una regresion ridge sobre las caracteristicas contextuales aplanadas. Es el flujo que produce los resultados de OpenEEGBench de la model card y permite obtener una linea base solida sin ajustar el backbone.
- Deteccion de crisis epilepticas: en los conjuntos `chbmit` (0,866 de exactitud balanceada) y `tuab` (0,746) el modelo muestra un rendimiento competitivo con encoder congelado, lo que lo hace apto como primera etapa de un sistema de alerta o de cribado en monitorizacion prolongada de UCI o ambulatoria.
- Monitorizacion automatica del sueno: sobre `isruc-sleep` alcanza 0,578 de exactitud balanceada, suficiente como punto de partida para pipelines de estadificacion del sueno que despues se afinen con datos de la propia clinica.
- Deteccion de depresion a partir de EEG en reposo: en `mdd_mumtaz2016` obtiene 0,801, uno de sus mejores resultados, lo que lo situa como candidato para estudios de marcadores electrofisiologicos en salud mental.
- Interfaces cerebro-computador: sobre `bcic2a` (0,352) y `bcic2020-3` (0,259) el rendimiento es bajo con encoder congelado, por lo que su uso realista aqui pasa por fine-tuning completo del encoder en lugar de sonda lineal.
- Clasificacion de eventos en EEG clinico multiclase: `tuev` alcanza 0,941 de exactitud balanceada, el resultado mas alto de la tabla, adecuado para sistemas de etiquetado automatico de segmentos con distintos tipos de actividad anomala.
- Estudios de reproducibilidad y ablacion: al ser una de las 58 celdas de un barrido controlado, permite comparar el efecto de la geometria de enmascaramiento manteniendo fijos datos, optimizador y epocas. Es el caso de uso mas inmediato para un grupo de investigacion.
- Inicializacion de modelos para corpus EEG propietarios: dado su reducido tamano (12,69 M de parametros), sirve como punto de partida para transfer learning cuando el volumen de datos etiquetados disponibles es limitado.
- Procesamiento de montajes heterogeneos: al ser agnostico al montaje y trabajar con posiciones 3D, resulta util en entornos donde conviven equipos con distinto numero de electrodos (investigacion multicentrica, dispositivos portatiles frente a sistemas de laboratorio).

## Benchmarks y rendimiento

Resultados de la model card en OpenEEGBench, con encoder congelado y sonda ridge sobre las caracteristicas contextuales aplanadas (12 conjuntos de datos, 5 semillas). Exactitud balanceada para clasificacion y R² para `seed-vig`.

| Dataset | Metrica | Resultado (media ± desviacion) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | Exactitud balanceada | 0,602 ± 0,023 | 5 |
| bcic2020-3 | Exactitud balanceada | 0,259 ± 0,010 | 5 |
| bcic2a | Exactitud balanceada | 0,352 ± 0,007 | 5 |
| chbmit | Exactitud balanceada | 0,866 ± 0,057 | 5 |
| faced | Exactitud balanceada | 0,255 ± 0,015 | 5 |
| isruc-sleep | Exactitud balanceada | 0,578 ± 0,005 | 5 |
| mdd_mumtaz2016 | Exactitud balanceada | 0,801 ± 0,023 | 5 |
| physionet | Exactitud balanceada | 0,492 ± 0,007 | 5 |
| seed-v | Exactitud balanceada | 0,271 ± 0,004 | 5 |
| seed-vig | R² | -0,416 ± 0,014 | 5 |
| tuab | Exactitud balanceada | 0,746 ± 0,005 | 5 |
| tuev | Exactitud balanceada | 0,941 ± 0,001 | 5 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de modelos de lenguaje, porque el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada de pesos: aproximadamente 48 MiB en FP32 (12.692.096 parametros × 4 bytes) y unos 24 MiB en FP16 o BF16. Con activaciones y lotes grandes, el consumo total se mantiene por debajo de 1 GB en la mayoria de configuraciones. Estimacion propia a partir del recuento de parametros; la model card no publica cifras de VRAM.
- GPU recomendadas: el entrenamiento se realizo en 2 × H100, pero la inferencia no requiere hardware de centro de datos. Cualquier GPU con 4 GB o mas es sobrada; se puede usar tambien CPU para extraccion de caracteristicas en lotes pequenos.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna (serie RTX 30/40, RTX 5090, e incluso integradas con memoria compartida). No se conoce ninguna restriccion de memoria que lo impida.
- Opciones de despliegue: el repositorio distribuye el wrapper propio `eeg_fm_masking.oeb.wrapper.ContextualEncoderBenchmarkWrapper` para PyTorch, y la integracion con OpenEEGBench se hace via `PretrainedBackbone`. No hay soporte documentado ni previsto para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos de texto y no a senales EEG. Los pesos se cargan con `safetensors.torch.load_file` y `strict=False`, dejando fuera el buffer de posiciones de canal y la cabeza de clasificacion, que dependen del conjunto de datos.
- Latencia y throughput: no disponibles. La model card no publica tiempos de inferencia ni de extraccion de caracteristicas.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con las otras celdas de la misma familia experimental. No se dispone de datos de rendimiento ni de especificaciones de modelos EEG de terceros (LaBraM, BIOT, EEGPT u otros) dentro del material proporcionado, por lo que esas comparaciones quedan como "no disponible".

| Modelo | Parametros | Mascara (`r`, `L`) | Marco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eeg-fm-masking_mae_rall_L16 (este) | 12,69 M (encoder) | all, 16 | MAE | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_mae_r9cm_L2 | No disponible (misma receta; solo cambia la geometria de mascara) | 9 cm, 2 | MAE | No disponible en la informacion | HuggingFace; recomendado por el articulo |
| eeg-fm-masking_jepa_r9cm_L2 | No disponible (misma receta; solo cambia la geometria de mascara) | 9 cm, 2 | JEPA | No disponible en la informacion | HuggingFace; recomendado por el articulo |
| Resto de la familia (58 codificadores en total) | No disponible | 5 radios × 6 longitudes temporales | MAE y JEPA | No disponible | Coleccion de HuggingFace |

De acuerdo con la model card, el articulo recomienda la configuracion `r = 9 cm`, `L = 2` por delante de la celda descrita en esta ficha, que corresponde a un enmascaramiento espacialmente mas agresivo (todos los canales) y temporalmente mas largo (16 parches).

## Limitaciones y advertencias

- El repositorio contiene unicamente el encoder. No se puede reconstruir senal ni ejecutar el paso de preentrenamiento completo con estos pesos; el decodificador MAE no se distribuye.
- Es un extractor de caracteristicas, no un modelo generativo ni conversacional. No acepta instrucciones, no genera texto y no soporta tool calling ni flujos de agentes.
- Preprocesado obligatorio y estricto: 200 Hz de frecuencia de muestreo, unidades en voltios y sin estandarizacion previa por parte del usuario, ya que el wrapper aplica `factor = 1e+06` y el escalado `median_std_clip` (recorte en sigma = 15). Alterar este preprocesado invalida los resultados publicados.
- Cada canal debe tener una posicion 3D valida en metros (`info["chs"][i]["loc"][:3]`). Sin coordenadas, el modelo no puede procesar el montaje.
- Rendimiento bajo en varias tareas con encoder congelado: `bcic2020-3` (0,259), `faced` (0,255) y `seed-v` (0,271) quedan cerca del azar segun la tarea, y `seed-vig` obtiene un R² de -0,416, es decir, peor que predecir la media. Estos resultados corresponden a sonda ridge con encoder congelado y probablemente mejoran con fine-tuning, pero la model card no publica esos datos.
- Riesgo de alucinacion: no aplicable en el sentido de generacion de texto, pero existe riesgo de extrapolacion incorrecta al aplicar el encoder a poblaciones, montajes o equipos de registro distintos de los del corpus REVE. La evaluacion se limita a 12 conjuntos y 5 semillas.
- Sesgos y generalizacion: el preentrenamiento usa el subconjunto de licencia abierta de REVE (323 registros). No se documenta la composicion demografica ni la distribucion de patologias de ese subconjunto, por lo que no puede evaluarse el sesgo poblacional.
- Reproducibilidad: los parametros de entrenamiento estan documentados (10 epocas, 2 × H100, lote 600 por GPU, lr 0,00024 con calentamiento de 3080 pasos, valor final 1e-06, decaimiento de pesos 0,01), pero no se garantiza que el checkpoint corresponda a una configuracion optima; la model card indica explicitamente que es la epoca 10 de 10 y que la configuracion recomendada es otra.
- Licencia de uso comercial: los pesos estan bajo CC-BY-4.0, que permite uso comercial con atribucion al autor y a la publicacion. El codigo esta bajo MIT. Es obligatorio citar el articulo; la referencia exacta se encuentra en la pagina de GitHub.
- Sin metricas de latencia, throughput ni consumo energetico publicadas, lo que dificulta planificar despliegues con requisitos de tiempo real (por ejemplo, neurofeedback en linea).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_rall_L16
- Codigo y referencia de cita: https://github.com/PierreGtch/eeg-fm-masking
- Sitio web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Coleccion con los 58 modelos de la familia: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/q7ui5yvk
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados eran contenido no relacionado con EEG ni con modelos fundacionales.
