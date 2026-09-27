# PierreGtch/eeg-fm-masking_mae_r6cm_L8

## Resumen

eeg-fm-masking_mae_r6cm_L8 es un codificador (encoder) de electroencefalografía (EEG) preentrenado mediante aprendizaje autosupervisado con un esquema de autoencoder enmascarado (masked autoencoder, MAE). Lo desarrolla PierreGtch como parte del estudio *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*, que entrena 58 codificadores con una receta idéntica y hace variar únicamente la geometría de enmascarado: 5 radios espaciales × 6 longitudes temporales × 2 marcos (MAE y JEPA). Este modelo concreto corresponde a la celda r = 6 cm y L = 8 parches.

El modelo tiene 12,69 millones de parámetros y no es un modelo generativo de texto: su función es extraer representaciones (features) de señales EEG. El repositorio distribuye únicamente el codificador (tokenizador de parches `feature_encoder.*` más el transformer `model.*`), que es exactamente el conjunto de tensores cargado en la evaluación downstream del paper. El decodificador del MAE no se incluye.

Es relevante porque forma parte de un estudio controlado que permite aislar el efecto de la geometría de enmascarado sobre el rendimiento de los modelos fundacionales de EEG, un área donde hasta ahora las comparaciones quedaban contaminadas por diferencias en datos, receta o arquitectura. Todos los pesos se liberan bajo CC-BY-4.0 para que puedan redistribuirse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MAE, masked autoencoder) sobre parches temporales; codificador con tokenizador de parches y bloques transformer |
| Parametros totales | 12.692.096 (codificador) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; la senal se corta en parches de 1 s (200 muestras a 200 Hz, con solapamiento de 20 muestras) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de senales EEG, no textual) |
| Licencia | cc-by-4.0 (pesos); codigo bajo MIT |
| Formato de pesos | safetensors (`model.safetensors`) |
| Framework | MAE |
| Radio espacial de mascara (r) | 6 cm |
| Longitud temporal de mascara (L) | 8 parches |
| Parametro del masker `pct_unmasked` | 0,45 |
| Checkpoint | epoca 10 de 10 (v9) |
| Frecuencia de muestreo de entrada | 200 Hz |
| Unidades de entrada | voltios (el wrapper escala con factor 1e+06 y aplica median_std_clip con sigma = 15) |
| Posiciones de canales | metros (MNE `info["chs"][i]["loc"][:3]`); montaje-agnostico |

## Arquitectura y entrenamiento

La arquitectura es un autoencoder enmascarado: un tokenizador de parches (`feature_encoder.*`) convierte la señal EEG en parches (ventanas de 1 s a 200 Hz, es decir 200 muestras con solapamiento de 20) y un transformer (`model.*`) procesa los parches no enmascarados. Un decodificador ligero reconstruye la señal cruda de los parches enmascarados durante el preentrenamiento. En este checkpoint, la mascara se define con un radio espacial de 6 cm y una longitud temporal de 8 parches, dejando un `pct_unmasked` de 0,45. El modelo es agnostico al montaje: acepta cualquier numero y conjunto de canales siempre que cada canal tenga una posicion 3D.

El preentrenamiento utilizo el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido para que los pesos puedan redistribuirse. El entrenamiento se realizo en 2 GPU H100, con un lote de 600 por GPU, 10 epocas, tasa de aprendizaje 0,00024 (warm-up de 3080 pasos y valor final 1e-06) y weight decay 0,01. El checkpoint publicado corresponde a la epoca 10 (v9), la evaluada en el paper. La innovacion metodologica principal no es la arquitectura en si, sino la evaluacion controlada de la geometria de enmascarado sobre 58 modelos entrenados con receta identica.

## Capacidades

- Extraccion de representaciones (feature-extraction) de senales EEG; el pipeline declarado en HuggingFace es `feature-extraction`.
- Codificacion contextual de ventanas EEG con atencion sobre parches temporales.
- Aprendizaje autosupervisado por reconstruccion (MAE), sin necesidad de etiquetas durante el preentrenamiento.
- Adaptacion a tareas downstream mediante sonda congelada (ridge regression/classification) o fine-tuning a traves de OpenEEGBench.
- Funciona con esquemas de montaje arbitrarios y numero variable de canales, gracias a las posiciones 3D de los electrodos.
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje.
- No tiene capacidades multimodales (vision, audio, texto) ni modo "thinking".

## Casos de uso

- Clasificacion de patologias neurologicas: con el codificador congelado y una sonda ridge se obtiene un balanced accuracy de 0,805 ± 0,005 en tuab (deteccion de actividad anormal) y 0,902 ± 0,002 en tuev (eventos epileptiformes), lo que permite construir clasificadores medicos sin reentrenar el backbone.
- Deteccion de crisis epilepticas: sobre el dataset chbmit alcanza 0,826 ± 0,086 de balanced accuracy, util para sistemas de alerta a partir de registros EEG continuos.
- Monitorizacion del sueno: en isruc-sleep obtiene 0,663 ± 0,009 de balanced accuracy, aplicable a la faseado automatico de estadios de sueno.
- Investigacion en salud mental: en mdd_mumtaz2016 logra 0,822 ± 0,005 de balanced accuracy, sirviendo como punto de partida para estudios de depresion sobre EEG.
- Reconocimiento de cargas cognitivas o tareas mentales: sobre arithmetic_zyma2019 obtiene 0,748 ± 0,006 de balanced accuracy, relevante para interfaces cerebro-computador.
- Prediccion de edad a partir de EEG: en seed-vig, con metrica R², el resultado es -0,156 ± 0,008, por lo que este caso de uso concreto no es viable con este checkpoint y exigiria otro modelo de la coleccion o ajuste adicional.
- Preentrenamiento como inicializacion para tareas EEG propietarias: al ser un codificador de 12,69 M de parametros y licencia CC-BY-4.0, puede incorporarse como punto de partida en pipelines internos y afinarse con datos propios.
- Banco de pruebas metodologico: el modelo sirve para reproducir el estudio sobre geometria de enmascarado y comparar el efecto de r y L en tareas downstream.

## Benchmarks y rendimiento

Resultados downstream de OpenEEGBench con codificador congelado y sonda ridge (regresion/clasificacion sobre las features contextuales aplanadas, 12 datasets × 5 semillas). Metrica: balanced accuracy para clasificacion y R² para seed-vig.

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,748 ± 0,006 | 5 |
| bcic2020-3 | balanced acc. | 0,277 ± 0,010 | 5 |
| bcic2a | balanced acc. | 0,434 ± 0,016 | 5 |
| chbmit | balanced acc. | 0,826 ± 0,086 | 5 |
| faced | balanced acc. | 0,310 ± 0,007 | 5 |
| isruc-sleep | balanced acc. | 0,663 ± 0,009 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,822 ± 0,005 | 5 |
| physionet | balanced acc. | 0,569 ± 0,006 | 5 |
| seed-v | balanced acc. | 0,289 ± 0,002 | 5 |
| seed-vig | R² | -0,156 ± 0,008 | 5 |
| tuab | balanced acc. | 0,805 ± 0,005 | 5 |
| tuev | balanced acc. | 0,902 ± 0,002 | 5 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 12,69 M de parametros, el codificador en precision completa ocupa aproximadamente 50 MB de pesos, por lo que practicamente cualquier GPU consumer puede ejecutarlo.
- GPU recomendadas: no hay requisitos exigentes para inferencia; el entrenamiento del paper se realizo en 2 × H100, pero para evaluacion basta una GPU modesta (por ejemplo, RTX 3060 o superior).
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer actual, e incluso en CPU para lotes pequenos.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a modelos de lenguaje). El uso previsto es mediante la libreria `eeg-fm-masking` (`ContextualEncoderBenchmarkWrapper`) y el pipeline de OpenEEGBench (`PretrainedBackbone`), con PyTorch y safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

El paper recomienda la configuracion r = 9 cm y L = 2, cuyos checkpoints son `eeg-fm-masking_mae_r9cm_L2` y `eeg-fm-masking_jepa_r9cm_L2`. Todos los modelos de la coleccion comparten receta, tamano aproximado de codificador (en torno a 12,69 M de parametros para las variantes mostradas) y licencia, diferenciandose solo en el marco (MAE/JEPA) y en la geometria de enmascarado (r, L).

| Modelo | Marco | Radio r | Longitud L | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| eeg-fm-masking_mae_r6cm_L8 | MAE | 6 cm | 8 parches | 12,69 M | cc-by-4.0 | HuggingFace |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 parches | no disponible | cc-by-4.0 | HuggingFace |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 parches | no disponible | cc-by-4.0 | HuggingFace |

No se dispone en la informacion proporcionada de las puntuaciones downstream de las variantes r = 9 cm y L = 2, por lo que la comparacion de rendimiento entre ellas no esta disponible. El paper identifica la configuracion r = 9 cm y L = 2 como la recomendada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni generativo: cualquier expectativa de generacion de texto, razonamiento, codigo o matematicas es inaplicable.
- El rendimiento downstream es muy desigual segun el dataset: por ejemplo, bcic2020-3 (0,277) y seed-v (0,289) estan cerca del azar, y seed-vig presenta un R² negativo (-0,156), lo que indica un ajuste peor que predecir la media.
- Este checkpoint concreto (r = 6 cm, L = 8) no es la configuracion recomendada por el paper; para uso general se sugiere r = 9 cm, L = 2.
- Requiere respetar estrictamente las condiciones de entrada: 200 Hz de muestreo, unidades en voltios, posiciones de canales en metros y ausencia de estandarizacion previa de los datos (el wrapper aplica su propio escalado).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopcion en produccion.
- El decodificador del MAE no se distribuye, por lo que no es posible usar el modelo para reconstruccion completa de la senal tal cual.
- Los resultados publicados corresponden a evaluacion con codificador congelado y sonda ridge; no garantizan el comportamiento tras fine-tuning completo en dominios distintos.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero el codigo asociado esta bajo MIT; conviene revisar ambas condiciones y citar el paper.
- Existen sesgos potenciales derivados del corpus de preentrenamiento (subconjunto abierto de REVE, 323 grabaciones), que puede no representar poblaciones, equipos o protocolos clinicos diversos; no se documentan analisis de sesgo en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r6cm_L8
- Web del paper: https://pierregtch.github.io/eeg-fm-masking
- Codigo (GitHub): https://github.com/PierreGtch/eeg-fm-masking
- Coleccion con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro de entrenamiento (Weights & Biases): https://wandb.ai/pierregtch/chan-inv-clf/runs/5jxbqr35
