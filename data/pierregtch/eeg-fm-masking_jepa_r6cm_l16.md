# PierreGtch/eeg-fm-masking_jepa_r6cm_L16

## Resumen

eeg-fm-masking_jepa_r6cm_L16 es un encoder de electroencefalografía (EEG) preentrenado con aprendizaje autosupervisado, desarrollado por PierreGtch en el marco del artículo *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. Forma parte de una familia controlada de 58 encoders entrenados con una receta idéntica en la que solo varía la geometría de enmascaramiento (5 radios espaciales × 6 longitudes temporales × 2 marcos de entrenamiento). El objetivo del trabajo es aislar el efecto de dicha geometría sobre la calidad de las representaciones resultantes, un problema relevante porque la mayoría de los modelos fundacionales de EEG publican resultados sin controlar esta variable.

El modelo es un JEPA (joint-embedding predictive architecture): un predictor proyecta el contexto producido por el encoder hacia los embeddings que un profesor EMA genera para los parches enmascarados, sin regularizador de varianza/covarianza. Este checkpoint concreto corresponde a un radio espacial de enmascaramiento de 6 cm y una longitud temporal de 16 parches, con una fracción de parches sin enmascarar (`pct_unmasked`) de 0,45. El encoder tiene 12,69 millones de parámetros y opera sobre señales EEG remuestreadas a 200 Hz.

La relevancia práctica es doble: por un lado sirve como extractor de características congeladas y ajuste fino ligero para tareas clínicas y de neurociencia; por otro, es una pieza de un estudio empírico reproducible que permite comparar configuraciones de enmascaramiento con un protocolo común. Los pesos se liberan bajo licencia CC-BY-4.0, lo que facilita su redistribución y uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA: encoder transformer con tokenizador de parches (`feature_encoder.*` + `model.*`) |
| Parametros totales | 12.692.096 (12,69 M) |
| Longitud de contexto | no disponible (parches de 1 s a 200 Hz, 200 muestras, solape de 20 muestras) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de senales EEG, no procesa texto) |
| Licencia | CC-BY-4.0 (pesos); codigo MIT |
| Formato de pesos | safetensors |
| Marco de entrenamiento | JEPA |
| Radio espacial de mascara (r) | 6 cm |
| Longitud temporal de mascara (L) | 16 parches |
| `pct_unmasked` | 0,45 |
| Checkpoint | epoca 10 de 10 (v9, el evaluado en el articulo) |
| Frecuencia de muestreo | 200 Hz |
| Unidades de entrada | voltios |
| Tamano del repositorio | 0,1 GB |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo combina un tokenizador de parches (`feature_encoder.*`) con un transformer (`model.*`). La señal EEG se divide en parches de 1 s (200 muestras a 200 Hz) con un solape de 20 muestras. El encoder es agnóstico al montaje: acepta cualquier número y conjunto de canales siempre que cada uno disponga de una posición 3D en metros (formato MNE `info["chs"][i]["loc"][:3]`). En el marco JEPA, un predictor mapea el contexto del encoder hacia las representaciones que un profesor EMA genera para los parches enmascarados, sin emplear un regularizador de varianza/covarianza. En el repositorio solo se publica el encoder (el predictor JEPA y el profesor EMA no se incluyen); para JEPA los pesos liberados son los del encoder estudiante, tal y como se evaluaron en el artículo.

El preentrenamiento utiliza el subconjunto de licencia abierta del corpus REVE (323 grabaciones), elegido precisamente para poder redistribuir los pesos. La receta común de la familia es de 10 épocas, ejecutadas en 2 × H100 con tamaño de lote de 600 por GPU, tasa de aprendizaje de 0,00024 con calentamiento de 3080 pasos y valor final de 1e-06, y decaimiento de peso de 0,01. Este checkpoint es uno de los 58 encoders del estudio; cabe señalar que el propio artículo recomienda la configuración r = 9 cm, L = 2 en lugar de esta (r = 6 cm, L = 16).

## Capacidades

- Extraccion de caracteristicas EEG: genera representaciones contextuales a partir de senales multicanal de cualquier montaje con posiciones 3D.
- Clasificacion de senales cerebrales: se usa como encoder congelado con una sonda ridge para tareas de clasificacion y regresion sobre 12 conjuntos de datos de OpenEEGBench.
- Aprendizaje autosupervisado: preentrenado sin etiquetas, lo que permite reutilizarlo con datos etiquetados escasos.
- Adaptabilidad de montaje: no requiere un conjunto fijo de electrodos.
- Uso como backbone en OpenEEGBench: integrable como `PretrainedBackbone` para evaluacion y ajuste fino.
- No soporta tool calling, function calling, agentes ni generacion de lenguaje: es un modelo de senales, no de texto.
- No dispone de capacidades multilingues ni de vision/audio.

## Casos de uso

- Deteccion de crisis epilepticas: el encoder obtiene 0,909 ± 0,012 de exactitud balanceada en el conjunto chbmit con una sonda ridge congelada, por lo que sirve como extractor para sistemas de alerta temprana que despues aplican un clasificador ligero.
- Clasificacion de fases del sueno: con 0,634 ± 0,005 en isruc-sleep, es util para pipelines de polisomnografia donde se necesita una representacion compacta y rapida de calcular.
- Deteccion de anomalias en EEG clinico: los resultados en tuab (0,799 ± 0,003) y tuev (0,902 ± 0,003) lo hacen adecuado para cribado de registros anormales antes de la revision por un neurologo.
- Diagnostico asistido de depresion: con 0,853 ± 0,012 en mdd_mumtaz2016, puede integrarse en estudios de biomarcadores que requieran extraer caracteristicas discriminativas de registros en reposo.
- Interfaces cerebro-computadora: los conjuntos bcic2a (0,406 ± 0,010) y bcic2020-3 (0,260 ± 0,036) lo sitúan como punto de partida para decodificacion de imaginacion motora, aunque conviene ajustar fino para mejorar.
- Investigacion en neurociencia cognitiva: las representaciones congeladas permiten analizar carga cognitiva y tareas aritmeticas (arithmetic_zyma2019, 0,653 ± 0,030) en estudios comparativos.
- Aprendizaje por transferencia con datos escasos: al ser un encoder autosupervisado de 12,69 M de parametros, se puede ajustar en un unico GPU con conjuntos pequenos y etiquetado limitado.
- Preprocesamiento y reduccion de dimensionalidad: extraccion de features fijas de bajo coste para alimentar clasificadores clasicos en lugar de entrenar redes profundas desde cero.

## Benchmarks y rendimiento

Resultados publicados por el autor (OpenEEGBench, encoder congelado con sonda ridge, 12 conjuntos de datos × 5 semillas; exactitud balanceada para clasificacion, R² para `seed-vig`):

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | exactitud balanceada | 0,653 ± 0,030 | 5 |
| bcic2020-3 | exactitud balanceada | 0,260 ± 0,036 | 5 |
| bcic2a | exactitud balanceada | 0,406 ± 0,010 | 5 |
| chbmit | exactitud balanceada | 0,909 ± 0,012 | 5 |
| faced | exactitud balanceada | 0,256 ± 0,006 | 5 |
| isruc-sleep | exactitud balanceada | 0,634 ± 0,005 | 5 |
| mdd_mumtaz2016 | exactitud balanceada | 0,853 ± 0,012 | 5 |
| physionet | exactitud balanceada | 0,519 ± 0,004 | 5 |
| seed-v | exactitud balanceada | 0,297 ± 0,001 | 5 |
| seed-vig | R² | -0,200 ± 0,008 | 5 |
| tuab | exactitud balanceada | 0,799 ± 0,003 | 5 |
| tuev | exactitud balanceada | 0,902 ± 0,003 | 5 |

No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K, etc.), que por otra parte no aplican a un modelo de senales EEG.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 aproximadamente 51 MB solo de pesos; en fp16/bf16 unos 25 MB; en int8 en torno a 13 MB. El repositorio completo ocupa 0,1 GB. Las cifras reales dependen del numero de canales y de la longitud de la ventana de entrada.
- GPU recomendadas: cualquier GPU moderna es suficiente; para extraccion a gran escala se recomiendan A100 o H100, pero no son necesarias. El entrenamiento original uso 2 × H100 con lote de 600 por GPU.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo (RTX 3060, 4090, etc.) e incluso puede ejecutarse en CPU.
- Opciones de despliegue: PyTorch con el paquete `eeg-fm-masking` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`) y carga via `ContextualEncoderBenchmarkWrapper`; tambien como `PretrainedBackbone` dentro de OpenEEGBench. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. El coste dominante es el preprocesado de la senal (segmentacion en parches de 1 s, escalado por ventana `median_std_clip` con recorte en sigma = 15) mas que el propio encoder, dado su tamano reducido.

## Comparativa con modelos similares

Comparativa con los dos checkpoints recomendados por el articulo dentro de la misma familia (mismos 12,69 M de parametros de encoder, misma licencia CC-BY-4.0 y misma disponibilidad):

| Modelo | Marco | Radio r | Longitud L | pct_unmasked | Licencia |
|---|---|---|---|---|---|
| eeg-fm-masking_jepa_r6cm_L16 (este) | JEPA | 6 cm | 16 parches | 0,45 | CC-BY-4.0 |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 parches | no disponible | CC-BY-4.0 |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 parches | no disponible | CC-BY-4.0 |

No se dispone de datos comparativos frente a otros modelos fundacionales de EEG externos a la familia (por ejemplo, alternativas de otros autores), ya que la informacion proporcionada no incluye sus especificaciones ni resultados.

## Limitaciones y advertencias

- Rendimiento desigual por tarea: en `faced` (0,256 ± 0,006), `bcic2020-3` (0,260 ± 0,036) y `seed-v` (0,297 ± 0,001) la exactitud balanceada es baja, cercana al azar en clasificacion binaria; no es adecuado sin ajuste fino en estos escenarios.
- R² negativo en `seed-vig` (-0,200 ± 0,008): la sonda ridge sobre features congeladas no supera a un predictor trivial en esa tarea de regresion.
- Configuracion no recomendada por los propios autores: el articulo sugiere r = 9 cm, L = 2; este checkpoint (r = 6 cm, L = 16) es una de las variantes controladas del estudio, no la mejor.
- Sesgos conocidos: no disponibles. No se documenta analisis de sesgo por poblacion, edad, sexo ni patologia.
- Riesgo de alucinacion: no aplica en el sentido generativo (no produce texto), pero un uso clinico directo sin validacion es inapropiado, ya que las salidas son representaciones que dependen de la sonda o cabecera que se anada.
- Dependencia del preprocesado: exige senal a 200 Hz, en voltios, sin estandarizar previamente, y posiciones de canal en metros; un preprocesado distinto degrada las representaciones.
- Pesos parciales: el repositorio solo contiene el encoder; no incluye el predictor JEPA ni el profesor EMA, por lo que no es posible reanudar el preentrenamiento tal cual.
- Requisito de montaje: aunque es agnostico, cada canal debe tener una posicion 3D; los canales sin posicion no pueden procesarse correctamente.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribucion; el codigo asociado es MIT. Hay que citar el articulo.
- Modelo de investigacion: con 0 descargas y 0 me gusta en el momento de la consulta, no tiene validacion externa de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r6cm_L16
- Web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Codigo fuente: https://github.com/PierreGtch/eeg-fm-masking
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Checkpoint recomendado (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Checkpoint recomendado (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro de entrenamiento en W&B: https://wandb.ai/pierregtch/chan-inv-clf/runs/r1kj23po
