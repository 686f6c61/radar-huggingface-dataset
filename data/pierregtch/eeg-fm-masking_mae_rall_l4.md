# PierreGtch/eeg-fm-masking_mae_rall_L4

## Resumen

`eeg-fm-masking_mae_rall_L4` es un codificador (*encoder*) de electroencefalografía (EEG) preentrenado mediante autoaprendizaje supervisado, publicado por el usuario PierreGtch en HuggingFace. Forma parte de una familia de 58 codificadores entrenados con una receta idéntica en la que únicamente varía la geometría de enmascaramiento: 5 radios espaciales × 6 longitudes temporales × 2 marcos de trabajo (MAE y JEPA). Este modelo concreto corresponde a la celda `r = all` (enmascaramiento sobre todos los canales) y `L = 4` parches temporales, con un 45 % de parches visibles (`pct_unmasked = 0.45`).

Se trata de un modelo de tipo *masked autoencoder* (MAE): el codificador procesa únicamente los parches no enmascarados y un decodificador ligero (no distribuido en este repositorio) reconstruye la señal cruda de los parches ocultos. El objetivo del trabajo es aislar el efecto de la geometría de enmascaramiento sobre la calidad de las representaciones aprendidas, en lugar de perseguir un récord de rendimiento. El codificador tiene 12.692.096 parámetros (12,69 M) y su uso previsto es la extracción de características congeladas para tareas posteriores de clasificación o regresión sobre señales EEG.

El modelo es relevante ahora porque la evaluación controlada permite responder a una pregunta práctica de ingeniería: qué patrones de enmascaramiento espacial y temporal producen representaciones EEG transferibles. Los autores recomiendan, como configuración general, `r = 9 cm` y `L = 2`, cuyos pesos se publican por separado. Este checkpoint concreto (`r = all`, `L = 4`) sirve como punto de comparación dentro del estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches (*patch tokeniser* `feature_encoder.*` + transformer `model.*`), entrenado como *masked autoencoder* (MAE) |
| Parametros totales | 12.692.096 (12,69 M) en el codificador |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como numero de tokens; la entrada se segmenta en parches de 1 s (200 muestras a 200 Hz) con 20 muestras de solapamiento |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No aplica / no disponible (modelo de senales EEG, no de texto) |
| Licencia | CC-BY-4.0 (pesos); el codigo del repositorio GitHub es MIT |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` + `metadata.json` |
| Frecuencia de muestreo de entrada | 200 Hz (obligatoria segun la model card) |
| Unidades de entrada | Voltios (el wrapper aplica `factor = 1e+06` y escalado `median_std_clip` con recorte en σ = 15) |
| Posiciones de canales | Metros (MNE `info["chs"][i]["loc"][:3]`); el modelo es agnostico al montaje |
| Framework | MAE |
| Radio espacial de mascara `r` | all (todos los canales) |
| Longitud temporal de mascara `L` | 4 parches |
| `pct_unmasked` | 0,45 |
| Checkpoint | Epoca 10 de 10 (`v9`, el evaluado en el articulo) |
| Ejecucion de entrenamiento | `ds29fgcl` (Weights & Biases) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer sobre parches espacio-temporales. El tokenizador divide la senal continua en parches de 1 segundo (200 muestras a 200 Hz) con un solapamiento de 20 muestras entre parches consecutivos, y cada parche se proyecta a un embedding que incorpora informacion de posicion de canal. El modelo es agnostico al montaje: acepta cualquier numero y conjunto de canales siempre que cada uno disponga de una posicion 3D en metros. La innovacion tecnica del trabajo no reside en el bloque transformer, sino en la parametrizacion explicita de la geometria de enmascaramiento mediante dos ejes (radio espacial `r` y longitud temporal `L`), lo que permite un barrido factorial controlado. En este checkpoint el enmascaramiento se aplica sobre todos los canales, de modo que el codificador solo ve el 45 % de los parches.

Respecto a los datos y al procedimiento, el preentrenamiento emplea el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido precisamente para que los pesos puedan redistribuirse. El entrenamiento consta de 10 epocas sobre 2 GPU H100, con un tamano de lote de 600 por GPU, tasa de aprendizaje de 0,00024 (calentamiento de 3080 pasos y valor final de 1e-06) y decaimiento de pesos de 0,01. El repositorio distribuye unicamente el codificador; el decodificador ligero del MAE no se incluye, y `strict=False` al cargar el `state_dict` deja fuera las partes dependientes del conjunto de datos (buffer de posiciones de canales y cabeza de clasificacion). El articulo de referencia se titula *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*.

## Capacidades

- Extraccion de caracteristicas (*feature extraction*) de senales EEG a 200 Hz: la salida es un conjunto de embeddings contextuales por parche, con la cabeza de clasificacion entrenable por separado.
- Aprendizaje de representaciones auto-supervisado mediante reconstruccion de parches EEG enmascarados (objetivo MAE); el decodificador de reconstruccion no se distribuye.
- Adaptacion a tareas posteriores mediante *probing* congelado: la model card reporta evaluacion con un *ridge probe* sobre las caracteristicas contextuales aplanadas.
- Clasificacion y regresion sobre senales EEG: el modelo se ha evaluado en tareas de carga cognitiva, imagineria motora, deteccion de crisis epilepticas, reconocimiento facial, sueno, depresion, vigilancia y artefactos, entre otras.
- Independencia de montaje: funciona con cualquier conjunto de canales si cada uno tiene coordenada 3D, lo que permite reutilizarlo en equipos con distintos numeros de electrodos.
- `tool calling` / `function calling`: no disponible; no es una capacidad relevante para este tipo de modelo.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues, vision, audio, modo *thinking*: no aplica; el modelo opera exclusivamente sobre series temporales EEG.
- Capacidad especial: parametrizacion controlada de la geometria de enmascaramiento, que permite comparar sistematicamente distintos regimenes de oclusion espacio-temporal dentro de la misma familia de 58 modelos.

## Casos de uso

- Deteccion de crisis epilepticas en monitorizacion continua: con el codificador congelado y un *ridge probe*, el modelo alcanza una precision balanceada de 0,887 ± 0,037 en el conjunto `chbmit`, lo que lo hace adecuado como extractor de caracteristicas en sistemas de alerta temprana sobre registros EEG multicanal.
- Clasificacion de artefactos en senales EEG: el rendimiento de 0,899 ± 0,045 en `tuev` permite usar el modelo como etapa de control de calidad previa a pipelines de analisis clinico o de investigacion.
- Cribado de depresion a partir de EEG en reposo: en `mdd_mumtaz2016` obtiene 0,833 ± 0,007 de precision balanceada, util como base para estudios de reproduccion o para prototipos de cribado con validacion adicional.
- Estadificacion del sueno: en `isruc-sleep` logra 0,644 ± 0,005, lo que permite integrarlo en herramientas de anotacion asistida de hipnogramas donde se necesite un extractor agnostico al montaje.
- Investigacion en interfaces cerebro-computador (BCI): sirve como inicializacion para ajuste fino en tareas de imagineria motora, si bien los resultados en `bcic2a` (0,407 ± 0,003) y `bcic2020-3` (0,281 ± 0,010) indican que requiere ajuste especifico por sujeto antes de desplegarse.
- Estudio de protocolos de enmascaramiento: al compartir receta con los otros 57 modelos de la coleccion, permite reproducir el barrido factorial `r × L × framework` y medir el efecto aislado de la geometria de mascara sobre la transferibilidad.
- Preentrenamiento de modelos EEG para dominios con pocos datos etiquetados: al ser un codificador de 12,69 M de parametros y montage-agnostico, se puede congelar y aplicar a conjuntos pequenos con *probing* lineal o *ridge*, evitando sobreajuste.
- Procesamiento por lotes en servidores sin GPU: su tamano reducido permite la extraccion de caracteristicas en CPU para volúmenes moderados de grabaciones, con el cuello de botella en el preprocesado de la senal.

## Benchmarks y rendimiento

Resultados publicados en la model card: codificador congelado con *ridge regression*/*classification* sobre caracteristicas contextuales aplanadas, 12 conjuntos de datos × 5 semillas. La metrica es precision balanceada para clasificacion y R² para `seed-vig`.

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | precision balanceada | 0,619 ± 0,017 | 5 |
| bcic2020-3 | precision balanceada | 0,281 ± 0,010 | 5 |
| bcic2a | precision balanceada | 0,407 ± 0,003 | 5 |
| chbmit | precision balanceada | 0,887 ± 0,037 | 5 |
| faced | precision balanceada | 0,299 ± 0,005 | 5 |
| isruc-sleep | precision balanceada | 0,644 ± 0,005 | 5 |
| mdd_mumtaz2016 | precision balanceada | 0,833 ± 0,007 | 5 |
| physionet | precision balanceada | 0,534 ± 0,006 | 5 |
| seed-v | precision balanceada | 0,273 ± 0,001 | 5 |
| seed-vig | R² | −0,366 ± 0,005 | 5 |
| tuab | precision balanceada | 0,771 ± 0,003 | 5 |
| tuev | precision balanceada | 0,899 ± 0,045 | 5 |

No se han publicado en la informacion disponible resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) ni comparaciones numericas frente a otros modelos EEG de terceros, dado que el objeto de evaluacion es senal EEG y el articulo compara celdas dentro de la propia familia.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32 los pesos ocupan aproximadamente 51 MB; en float16/bfloat16 unos 25 MB; en int8 unos 13 MB. A estas cifras hay que sumar activaciones y el buffer de caracteristicas, que dependen del numero de canales, de la duracion de la ventana y del tamano de lote.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia o *probing*; el modelo cabe con holgura en RTX 3060, RTX 4090, A100, H100 y similares. El entrenamiento original se realizo sobre 2 × H100 con lote de 600 por GPU.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo actual e incluso en GPU integradas con unos pocos GB de memoria compartida.
- CPU: la inferencia en CPU es viable gracias a los 12,69 M de parametros, aunque el rendimiento dependera del preprocesado (remuestreo a 200 Hz, escalado y calculo de posiciones de canal).
- Opciones de despliegue: el modelo se carga con la libreria propia `eeg_fm_masking` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`) y `safetensors.torch.load_file`. Para evaluacion y ajuste fino se integra con `open_eeg_bench.backbone.PretrainedBackbone`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparacion dentro de la familia publicada. Los 58 modelos comparten receta de entrenamiento y difieren solo en la geometria de enmascaramiento.

| Modelo | Framework | Radio `r` | Longitud `L` | Parametros | Licencia | Notas |
|---|---|---|---|---|---|---|
| `eeg-fm-masking_mae_rall_L4` (este) | MAE | all | 4 | 12,69 M | CC-BY-4.0 | Mascara sobre todos los canales |
| `eeg-fm-masking_mae_r9cm_L2` | MAE | 9 cm | 2 | No disponible | CC-BY-4.0 | Configuracion recomendada por el articulo |
| `eeg-fm-masking_jepa_r9cm_L2` | JEPA | 9 cm | 2 | No disponible | CC-BY-4.0 | Variante JEPA recomendada; se distribuye el codificador estudiante |
| Otros modelos EEG *foundation* de terceros | No disponible | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- El repositorio contiene unicamente el codificador; el decodificador del MAE no se distribuye, por lo que la tarea de reconstruccion no puede reproducirse con estos pesos.
- El checkpoint corresponde a la epoca 10 de 10 de un preentrenamiento corto (10 epocas sobre 323 grabaciones del subconjunto abierto de REVE), lo que limita la generalidad frente a corpus EEG mucho mayores.
- Los resultados en `seed-vig` (R² = −0,366) son peores que los de un predictor trivial de la media, y los de `bcic2020-3` (0,281), `seed-v` (0,273) y `faced` (0,299) apenas superan el nivel de azar. No es adecuado para esas tareas sin ajuste fino especifico.
- La evaluacion publicada usa un *ridge probe* con el codificador congelado; los numeros no representan el rendimiento tras ajuste fino completo, que no se documenta en la informacion disponible.
- Requisitos de entrada estrictos: 200 Hz de frecuencia de muestreo, unidades en voltios y posiciones de canal en metros. Omitir cualquiera de estas condiciones invalida las caracteristicas extraidas.
- El escalado `median_std_clip` con recorte en σ = 15 lo aplica el propio wrapper; estandarizar los datos antes de la entrada produce un resultado incorrecto.
- No es un dispositivo medico ni un producto sanitario: cualquier uso clinico requiere validacion regulatoria independiente.
- Riesgo de sesgo: el corpus de preentrenamiento (323 grabaciones) no se describe por composicion demografica ni por distribucion de montajes, por lo que se desconoce su comportamiento diferencial entre poblaciones y equipos.
- Licencia CC-BY-4.0 en los pesos: se permite el uso comercial con atribucion obligatoria; el codigo asociado se distribuye bajo MIT, con condiciones distintas.
- El modelo no procesa texto, imagenes ni audio; no dispone de capacidades generativas de lenguaje, *tool calling* ni razonamiento multi-paso.
- Se recomienda citar el articulo de referencia; la entrada bibliografica completa figura en la pagina de GitHub.
- Los resultados de la busqueda web no aportaron informacion adicional relevante sobre este modelo: los enlaces devueltos tratan de horoscopos, comparativas de asistentes comerciales y articulos genericos sobre modelos de lenguaje, ninguno relacionado con EEG ni con modelos *foundation* de senales biomedicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_rall_L4
- Coleccion completa (58 modelos): https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Modelo recomendado MAE `r9cm_L2`: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Modelo recomendado JEPA `r9cm_L2`: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Codigo fuente: https://github.com/PierreGtch/eeg-fm-masking
- Sitio web del articulo: https://pierregtch.github.io/eeg-fm-masking
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/ds29fgcl
