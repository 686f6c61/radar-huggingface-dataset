# PierreGtch/eeg-fm-masking_mae_r9cm_L16

## Resumen

`eeg-fm-masking_mae_r9cm_L16` es un codificador de electroencefalografía (EEG) preentrenado mediante un autoencoder enmascarado (MAE) por Pierre Guetschel (usuario `PierreGtch`). Forma parte de un estudio sistemático de 58 codificadores entrenados con una receta idéntica en el que solo varía la geometría de enmascaramiento: 5 radios espaciales por 6 longitudes temporales por 2 marcos de aprendizaje autosupervisado. Este modelo concreto corresponde a un radio espacial de 9 cm y una longitud temporal de 16 parches.

El modelo resuelve el problema de obtener representaciones transferibles de señales EEG sin depender de etiquetas, un dominio donde los datos anotados son escasos y costosos. Con 12,69 millones de parámetros, es deliberadamente compacto: el objetivo no es competir en tamaño, sino servir como banco de pruebas controlado para determinar qué geometría de enmascaramiento produce mejores representaciones. La relevancia actual reside en que el paper asociado (arXiv:2609.33487) concluye que la configuración recomendada es r = 9 cm y L = 2, no la de este checkpoint.

La arquitectura es un transformer sobre parches de 1 segundo con tokenizador de parches y codificación posicional basada en coordenadas 3D de los electrodos, lo que lo hace agnóstico al montaje. Se distribuye únicamente el codificador (sin el decodificador MAE) en safetensors, con licencia CC-BY-4.0, y está pensado para extracción de características y evaluación con OpenEEGBench.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con autoencoder enmascarado (MAE) sobre parches de EEG; tokenizador de parches + transformer |
| Parámetros totales | 12.692.096 (codificador) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana fija; entrada en parches de 1 s (200 muestras a 200 Hz, solapamiento de 20 muestras); `n_times` configurable |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente fp32/fp16; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de señales EEG, no de texto) |
| Licencia | CC-BY-4.0 (pesos); código MIT |
| Formato de pesos | safetensors (`model.safetensors` + subcarpetas `epoch_01/` … `epoch_09/`) |

## Arquitectura y entrenamiento

El modelo es un autoencoder enmascarado: el codificador procesa únicamente los parches no enmascarados y un decodificador ligero reconstruye la señal cruda de los parches enmascarados. La señal se segmenta en parches de 1 segundo (200 muestras a 200 Hz con solapamiento de 20 muestras) y la posición de cada electrodo se codifica a partir de sus coordenadas 3D en metros, de modo que el modelo admite cualquier número y conjunto de canales siempre que cada uno tenga posición. El checkpoint publicado contiene solo el codificador (tensores `feature_encoder.*` y `model.*`), que es exactamente lo evaluado en el paper; el decodificador MAE no se distribuye. La geometría de enmascaramiento de este checkpoint es radio espacial r = 9 cm, longitud temporal L = 16 parches y `pct_unmasked` = 0.45.

El preentrenamiento usa el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido para poder redistribuir los pesos. El régimen es de 10 épocas sobre 2 GPU H100, tamaño de lote 600 por GPU, tasa de aprendizaje 0,00024 con calentamiento de 3080 pasos y valor final 1e-06, y decaimiento de peso 0,01. El checkpoint raíz corresponde al final de la época 10; las épocas 1 a 9 se incluyen como subcarpetas para estudiar la evolución de las representaciones. No se documenta RLHF, DPO ni ajuste supervisado: es puramente autosupervisado.

## Capacidades

- Extracción de características de señales EEG en formato de vector contextual, apta para sondas lineales (regresión ridge) o fine-tuning.
- Codificación agnóstica al montaje: acepta cualquier número y disposición de electrodos con posición 3D conocida.
- Procesamiento de ventanas temporales arbitrarias mediante el parámetro `n_times`, con parches de 1 s.
- Aprendizaje autosupervisado de representaciones sin necesidad de etiquetas durante el preentrenamiento.
- Escalado interno de la señal: multiplica por 1e+06 y aplica normalización `median_std_clip` con recorte en σ = 15 por ventana; no requiere estandarización previa por parte del usuario.
- Evaluación integrada con OpenEEGBench mediante `PretrainedBackbone` y `ContextualEncoderBenchmarkWrapper`.
- No soporta tool calling, agentes, generación de texto, visión, audio ni capacidades multilingües: es un codificador de señales, no un modelo generativo de lenguaje.

## Casos de uso

- Clasificación de estados cognitivos y tareas mentales: congelando el codificador y entrenando una sonda ridge sobre las características contextuales, se obtiene una precisión balanceada de 0,665 en el dataset `arithmetic_zyma2019`, útil para interfaces cerebro-computador experimentales.
- Detección de crisis epilépticas: el modelo alcanza 0,855 de precisión balanceada en `chbmit` con sonda congelada, lo que permite prototipar sistemas de alerta sobre registros EEG continuos sin entrenar un modelo desde cero.
- Detección de anomalías y artefactos en EEG clínico: con 0,782 en `tuab` y 0,875 en `tuev`, sirve como extractor de características para pipelines de cribado de encefalopatías y eventos paroxísticos.
- Cribado de trastornos del sueño: 0,665 de precisión balanceada en `isruc-sleep` permite construir clasificadores de fases del sueño con muy pocas etiquetas específicas del dominio.
- Investigación en biomarcadores psiquiátricos: 0,839 en `mdd_mumtaz2016` lo hace adecuado como base para estudios de depresión mayor a partir de EEG en reposo.
- Estudio controlado de geometrías de enmascaramiento: al compartir receta con otros 57 checkpoints y publicar las épocas 1 a 9, permite analizar la dinámica de aprendizaje y comparar el efecto de r y L sobre las representaciones.
- Preentrenamiento como inicialización para fine-tuning en dominios con pocos datos: su tamaño de 12,69 M parámetros permite ajustarlo en una sola GPU consumer para datasets propios.

## Benchmarks y rendimiento

Resultados publicados en la model card: codificador congelado, sonda ridge sobre características contextuales aplanadas, 12 datasets y 5 semillas. Precisión balanceada para clasificación y R² para `seed-vig`.

| Dataset | Métrica | Resultado (media ± desv.) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | precisión balanceada | 0,665 ± 0,018 | 5 |
| bcic2020-3 | precisión balanceada | 0,253 ± 0,007 | 5 |
| bcic2a | precisión balanceada | 0,409 ± 0,010 | 5 |
| chbmit | precisión balanceada | 0,855 ± 0,012 | 5 |
| faced | precisión balanceada | 0,275 ± 0,004 | 5 |
| isruc-sleep | precisión balanceada | 0,665 ± 0,004 | 5 |
| mdd_mumtaz2016 | precisión balanceada | 0,839 ± 0,014 | 5 |
| physionet | precisión balanceada | 0,559 ± 0,004 | 5 |
| seed-v | precisión balanceada | 0,263 ± 0,003 | 5 |
| seed-vig | R² | −0,433 ± 0,010 | 5 |
| tuab | precisión balanceada | 0,782 ± 0,004 | 5 |
| tuev | precisión balanceada | 0,875 ± 0,043 | 5 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos de EEG ni métricas de benchmarks de lenguaje (MMLU, HumanEval, GSM8K), que no aplican a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los 12,69 M parámetros en fp32 (unos 51 MB de pesos); el consumo real depende de la longitud de la ventana y del lote.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el entrenamiento original usó 2 × H100 con lote 600 por GPU.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo con el paquete `eeg-fm-masking` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| eeg-fm-masking_mae_r9cm_L16 | 12,69 M | parches de 1 s, `n_times` configurable | CC-BY-4.0 | Hugging Face | Checkpoint MAE con r = 9 cm, L = 16 |
| eeg-fm-masking_mae_r9cm_L2 | no disponible | parches de 1 s, `n_times` configurable | CC-BY-4.0 | Hugging Face | Configuración recomendada por el paper (r = 9 cm, L = 2) |
| eeg-fm-masking_jepa_r9cm_L2 | no disponible | parches de 1 s, `n_times` configurable | CC-BY-4.0 | Hugging Face | Variante JEPA con la configuración recomendada |
| Otros checkpoints de la colección (58 en total) | 12,69 M (receta idéntica) | parches de 1 s | CC-BY-4.0 | Hugging Face | Varían solo r (5 radios) y L (6 longitudes) y el marco (MAE/JEPA) |

No se dispone de datos de benchmarks comparativos frente a otros modelos de EEG de terceros en la información proporcionada.

## Limitaciones y advertencias

- Este checkpoint no es la configuración recomendada por el paper: los autores aconsejan r = 9 cm y L = 2, por lo que su uso como modelo de referencia debería considerar `eeg-fm-masking_mae_r9cm_L2` o `eeg-fm-masking_jepa_r9cm_L2`.
- Rendimiento bajo en varios datasets: precisión balanceada de 0,253 en `bcic2020-3`, 0,275 en `faced` y 0,263 en `seed-v`, y R² negativo de −0,433 en `seed-vig`, lo que indica que las representaciones congeladas no capturan bien esas tareas.
- Requisitos de entrada estrictos: muestreo a 200 Hz, unidades en voltios y posiciones de canal en metros; desviarse de estos formatos invalida las representaciones.
- Solo se distribuye el codificador; el decodificador MAE no está incluido, de modo que no se puede reproducir la tarea de reconstrucción directamente con estos pesos.
- El preentrenamiento usa solo el subconjunto con licencia abierta del corpus REVE (323 grabaciones), lo que puede limitar la diversidad de montajes y poblaciones cubiertas.
- Riesgo de sesgo por población y dispositivo: no se documentan análisis de sesgo por edad, sexo, patología o tipo de hardware de registro.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero obliga a citar y a indicar los cambios; el código del repositorio es MIT.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de NLP.
- Los checkpoints intermedios de las épocas 1 a 9 comparten `config.json` con el final y no están pensados para producción, sino para análisis de la dinámica de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L16
- Paper: https://arxiv.org/abs/2609.33487
- Sitio web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Código en GitHub: https://github.com/PierreGtch/eeg-fm-masking
- Colección con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Checkpoint recomendado (MAE): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Checkpoint recomendado (JEPA): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/wbwysdic
