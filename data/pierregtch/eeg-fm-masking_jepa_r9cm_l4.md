# PierreGtch/eeg-fm-masking_jepa_r9cm_L4

## Resumen

`eeg-fm-masking_jepa_r9cm_L4` es un codificador de electroencefalograma (EEG) preentrenado mediante aprendizaje autosupervisado, publicado por PierreGtch como parte de un estudio controlado sobre geometrías de enmascaramiento en modelos fundacionales de EEG. Se trata de uno de los 58 codificadores entrenados con una receta idéntica en la que solo cambia la geometría de la máscara (5 radios espaciales × 6 longitudes temporales × 2 marcos de entrenamiento, MAE y JEPA). Este checkpoint concreto corresponde al marco JEPA con radio espacial de 9 cm y longitud temporal de 4 parches.

El modelo tiene 12.692.096 parámetros y actúa exclusivamente como extractor de características: no genera texto ni señales, sino representaciones contextuales de ventanas de EEG que después se usan con sondas lineales o fine-tuning. Su interés radica en que permite aislar el efecto de la geometría del enmascaramiento sobre el rendimiento en tareas downstream, con resultados publicados sobre 12 conjuntos de datos de OpenEEGBench y 5 semillas por conjunto.

Arquitectura transformer con tokenizador de parches, entrenada sobre un subconjunto de licencia abierta del corpus REVE (323 registros). El repositorio distribuye únicamente el codificador; ni el predictor JEPA ni el profesor EMA están incluidos. Los autores recomiendan, para uso general, la variante con L = 2 en lugar de este checkpoint con L = 4.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches (`feature_encoder.*` + `model.*`), entrenado con marco JEPA (predictor + profesor EMA, no distribuidos) |
| Parámetros totales | 12.692.096 (12,69 M), dato real de `model.safetensors` |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como número de tokens; la señal se corta en parches de 1 s (200 muestras a 200 Hz) con solapamiento de 20 muestras, y el modelo es agnóstico al montaje (admite cualquier número y conjunto de canales) |
| Tipos de cuantización | no disponible; el repositorio solo distribuye pesos en safetensors sin variantes cuantizadas documentadas |
| Idiomas soportados | no aplica / no disponible (modelo de señales EEG, no de texto) |
| Licencia | CC-BY-4.0 para los pesos; el código de `eeg-fm-masking` es MIT |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `metadata.json` |
| Framework de entrenamiento | PyTorch |
| Parámetros de enmascaramiento | r = 9 cm, L = 4 parches, `pct_unmasked` = 0,45 |
| Checkpoint | época 10 de 10 (v9, el evaluado en el paper) |
| Frecuencia de muestreo requerida | 200 Hz |
| Unidades de entrada | voltios (el wrapper aplica factor 1e+06 y escalado `median_std_clip` con recorte en σ = 15) |
| Posición de canales | metros (MNE `info["chs"][i]["loc"][:3]`) |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un codificador transformer que opera sobre parches temporales de EEG: la señal se segmenta en ventanas de 1 segundo (200 muestras a 200 Hz) con 20 muestras de solapamiento, y un tokenizador (`feature_encoder.*`) proyecta cada parche a embeddings que el transformer procesa de forma contextual. La innovación metodológica no está en el codificador en sí, sino en el régimen de entrenamiento: JEPA (joint-embedding predictive architecture) sustituye la reconstrucción del MAE por una tarea predictiva en el espacio latente, donde un predictor mapea el contexto del codificador a los embeddings que un profesor EMA produce para los parches enmascarados, sin regularizador de varianza/covarianza.

El preentrenamiento usó el subconjunto de licencia abierta del corpus REVE (323 registros), elegido precisamente para que los pesos pudieran redistribuirse. El calendario fue de 10 épocas sobre 2 × H100, con tamaño de lote de 600 por GPU, learning rate de 0,00024 (calentamiento de 3080 pasos, valor final 1e-06) y weight decay de 0,01. El paper evalúa 58 configuraciones con receta idéntica variando solo la geometría de la máscara; en esa comparación, la recomendación de los autores es r = 9 cm con L = 2, no la configuración L = 4 de este checkpoint.

## Capacidades

- Extracción de características (feature extraction) sobre señales EEG crudas, con salida de embeddings contextuales por ventana.
- Codificación agnóstica al montaje: funciona con cualquier número y disposición de canales, siempre que cada canal tenga una posición 3D en metros.
- Aprendizaje autosupervisado sin etiquetas: las representaciones sirven para sondas lineales (ridge) con el codificador congelado.
- Soporte de fine-tuning supervisado sobre datasets downstream mediante el wrapper `ContextualEncoderBenchmarkWrapper` y el framework OpenEEGBench.
- Transferencia entre tareas heterogéneas de EEG: clasificación binaria/multiclase y regresión (por ejemplo, `seed-vig` con métrica R²).
- Integración con el ecosistema MNE para la gestión de información de canales.
- No dispone de tool calling, function calling, capacidades de agente, generación de texto, visión, audio, matemáticas ni razonamiento simbólico: es un modelo unimodal de señales fisiológicas.
- No se documenta un modo "thinking" ni ninguna capacidad especial adicional más allá de la extracción de características.

## Casos de uso

- Interfaces cerebro-computador para imaginería motora: el modelo se usa congelado como extractor y una sonda ridge clasifica las intenciones del usuario; en `bcic2a` alcanza 0,426 de exactitud balanceada, un punto de partida razonable para prototipos de BCI no invasivo.
- Estadificación del sueño: aplicado a registros de polysomnografía, obtiene 0,686 de exactitud balanceada en `isruc-sleep`, lo que permite automatizar el etiquetado de fases de sueño sobre datos nuevos sin reentrenar el codificador.
- Detección de crisis epilépticas: con 0,882 de exactitud balanceada en `chbmit`, es adecuado como componente de un sistema de alarma que priorice fragmentos de EEG sospechosos para revisión clínica.
- Cribado de depresión a partir de EEG: 0,840 de exactitud balanceada en `mdd_mumtaz2016` lo hace viable como extractor en estudios de biomarcadores, siempre con validación clínica posterior.
- Detección de anomalías en EEG clínico: 0,810 en `tuab` permite construir un primer filtro que separe registros normales de anormales antes del análisis de un neurólogo.
- Clasificación de eventos en EEG intracraneal: 0,940 de exactitud balanceada en `tuev` lo sitúa como extractor de referencia para tareas de etiquetado de eventos en registros ya segmentados.
- Investigación sobre metodología de preentrenamiento: al formar parte de una familia de 58 codificadores con receta fija, sirve para estudios de ablación controlada sobre geometría de máscara sin variar otros hiperparámetros.
- Preentrenamiento y ajuste sobre datos propios: la licencia CC-BY-4.0 permite reutilizar los pesos en pipelines comerciales o académicos con atribución, y el codificador puede ajustarse con datasets privados usando el wrapper y OpenEEGBench.

## Benchmarks y rendimiento

Resultados publicados en la model card, con codificador congelado y sonda ridge sobre las características contextuales aplanadas, 12 conjuntos de datos × 5 semillas. Exactitud balanceada para clasificación y R² para `seed-vig`.

| Conjunto de datos | Métrica | Puntuación (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | exactitud balanceada | 0,722 ± 0,019 | 5 |
| bcic2020-3 | exactitud balanceada | 0,276 ± 0,023 | 5 |
| bcic2a | exactitud balanceada | 0,426 ± 0,010 | 5 |
| chbmit | exactitud balanceada | 0,882 ± 0,028 | 5 |
| faced | exactitud balanceada | 0,278 ± 0,006 | 5 |
| isruc-sleep | exactitud balanceada | 0,686 ± 0,006 | 5 |
| mdd_mumtaz2016 | exactitud balanceada | 0,840 ± 0,005 | 5 |
| physionet | exactitud balanceada | 0,536 ± 0,008 | 5 |
| seed-v | exactitud balanceada | 0,307 ± 0,002 | 5 |
| seed-vig | R² | −0,277 ± 0,006 | 5 |
| tuab | exactitud balanceada | 0,810 ± 0,003 | 5 |
| tuev | exactitud balanceada | 0,940 ± 0,025 | 5 |

No se han proporcionado en la información disponible resultados comparativos frente a otros modelos fundacionales de EEG (por ejemplo, frente a las variantes MAE de la misma familia) más allá de la recomendación cualitativa del paper de usar r = 9 cm y L = 2.

## Requisitos de hardware

- VRAM estimada para inferencia: derivada del tamaño de los pesos. En fp32 ocupa aproximadamente 51 MB (12,69 M × 4 bytes) y en fp16/bf16 aproximadamente 25 MB. El consumo real depende del tamaño de lote y de la longitud de las ventanas procesadas, no solo del peso del modelo.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente para inferencia; no se requiere hardware de gama alta. El entrenamiento original se realizó sobre 2 × H100 con lote de 600 por GPU, lo que da una referencia del orden de magnitud necesario para reproducir el preentrenamiento.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU para inferencia o extracción de características a pequeña escala, dado el reducido número de parámetros.
- Opciones de despliegue: PyTorch con el paquete `eeg-fm-masking` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`) y el wrapper `ContextualEncoderBenchmarkWrapper`; integración con OpenEEGBench mediante `PretrainedBackbone`. vLLM, llama.cpp, Ollama y TGI no aplican a este modelo porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible; no se documentan mediciones de latencia ni de muestras por segundo.
- Nota de E/S: la entrada debe estar a 200 Hz, en voltios y sin estandarización previa (el wrapper aplica el escalado), con posiciones de canal en metros.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada, por lo que la comparación se limita a la familia del propio paper, cuyos miembros comparten arquitectura, receta y número de parámetros, y difieren únicamente en la geometría de enmascaramiento.

| Modelo | Marco | r | L | pct_unmasked | Parámetros | Licencia |
|---|---|---|---|---|---|---|
| eeg-fm-masking_jepa_r9cm_L4 (este) | JEPA | 9 cm | 4 parches | 0,45 | 12,69 M | CC-BY-4.0 |
| eeg-fm-masking_jepa_r9cm_L2 | JEPA | 9 cm | 2 parches | no disponible | no disponible (misma receta) | CC-BY-4.0 |
| eeg-fm-masking_mae_r9cm_L2 | MAE | 9 cm | 2 parches | no disponible | no disponible (misma receta) | CC-BY-4.0 |

La familia completa consta de 58 codificadores (5 radios espaciales × 6 longitudes temporales × 2 marcos). El paper recomienda r = 9 cm y L = 2 por encima de la configuración de este checkpoint. No se han publicado en la información disponible comparaciones cuantitativas frente a otros modelos fundacionales de EEG de terceros.

## Limitaciones y advertencias

- El repositorio contiene solo el codificador: el predictor JEPA y el profesor EMA no se distribuyen, de modo que no es posible reanudar el preentrenamiento ni reproducir la tarea autosupervisada completa con estos pesos.
- Los pesos publicados son los del estudiante, tal como se evaluaron en el paper; no deben tratarse como un modelo JEPA completo en inferencia.
- Este checkpoint no es la configuración recomendada por los autores: el paper aconseja r = 9 cm y L = 2, por lo que L = 4 puede rendir peor en tareas generales.
- El rendimiento es muy desigual entre tareas: `tuev` alcanza 0,940 y `chbmit` 0,882, mientras que `bcic2020-3` (0,276), `faced` (0,278) y `seed-v` (0,307) quedan cerca o por debajo del azar en problemas multiclase, lo que desaconseja su uso directo en esas tareas sin ajuste adicional.
- La regresión en `seed-vig` presenta un R² negativo (−0,277), es decir, peor que predecir la media: no es utilizable para esa tarea sin fine-tuning.
- Riesgo de sesgo y generalización limitada: el preentrenamiento usa 323 registros del corpus REVE; el comportamiento sobre poblaciones, equipos o montajes poco representados en ese corpus no está caracterizado.
- Dependencia estricta del preprocesado: si la señal no está a 200 Hz, en voltios o con posiciones de canal en metros, los resultados pueden degradarse; la estandarización previa de los datos es un error, ya que el wrapper la aplica internamente.
- La licencia CC-BY-4.0 permite uso comercial siempre que se atribuya correctamente y se cite el paper; el código asociado se rige por MIT, una licencia distinta que conviene respetar por separado.
- No hay resultados de benchmarks comparativos publicados en la información disponible frente a otros modelos fundacionales de EEG, así que la elección de este modelo frente a alternativas externas no puede justificarse con los datos aportados.
- Modelo sin garantías clínicas: cualquier aplicación en diagnóstico o cribado debe pasar validación regulatoria y clínica independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L4
- Colección con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Variante MAE recomendada (r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Sitio web del paper: https://pierregtch.github.io/eeg-fm-masking
- Código fuente (MIT): https://github.com/PierreGtch/eeg-fm-masking
- Registro del entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/sxgumypr
