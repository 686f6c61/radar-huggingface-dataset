# PierreGtch/eeg-fm-masking_jepa_rall_L8

## Resumen

eeg-fm-masking_jepa_rall_L8 es un encoder de electroencefalografía (EEG) preentrenado mediante aprendizaje autosupervisado, publicado por PierreGtch como parte del estudio *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. No es un modelo de lenguaje: es un modelo fundacional de señal biomédica que convierte ventanas de EEG multicanal en representaciones vectoriales reutilizables para tareas posteriores de clasificación o regresión.

El modelo pertenece a una familia de 58 encoders entrenados con una receta idéntica en la que solo cambia la geometría de enmascaramiento: 5 radios espaciales × 6 longitudes temporales × 2 marcos de preentrenamiento (MAE y JEPA). Esta variante concreta usa el marco JEPA (joint-embedding predictive architecture), enmascara todos los canales (r = all) y 8 parches temporales (L = 8). El encoder tiene 12.692.096 parámetros (12,69 M) y solo se distribuyen los pesos del encoder, no el predictor ni el teacher EMA.

Su relevancia es doble: por un lado, ofrece una representación EEG agnóstica al montaje (funciona con cualquier número y disposición de electrodos, siempre que cada canal tenga una posición 3D), lo que facilita la transferencia entre datasets clínicos; por otro, forma parte de un estudio controlado que permite aislar el efecto de la geometría de enmascaramiento sobre el rendimiento final. Está publicado bajo licencia CC-BY-4.0 para los pesos, lo que permite redistribución y uso comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | JEPA (joint-embedding predictive architecture) sobre un encoder de tipo transformer con tokenizador de parches de EEG; el repositorio contiene el encoder (tokenizador `feature_encoder.*` + transformer `model.*`) |
| Parámetros totales | 12.692.096 (12,69 M) en el encoder |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en términos de tokens de texto; la entrada son ventanas de EEG troceadas en parches de 1 s (200 muestras a 200 Hz, con solape de 20 muestras). La model card indica que L = 33 parches equivaldría a enmascarar la ventana completa |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de señales EEG, no de texto) |
| Licencia | CC-BY-4.0 para los pesos; el código del repositorio asociado es MIT |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `metadata.json` |
| Geometría de enmascaramiento | r = all (todos los canales), L = 8 parches, `pct_unmasked` = 0.45 |
| Marco de preentrenamiento | JEPA (predictor sobre las representaciones de un teacher EMA, sin regularizador de varianza/covarianza) |
| Checkpoint publicado | epoch 10 de 10 (v9, el evaluado en el paper) |
| Frecuencia de muestreo de entrada | 200 Hz |
| Unidades de entrada | voltios; el wrapper aplica `factor = 1e+06` y un escalado `median_std_clip` por ventana (clip en σ = 15), sin estandarización previa por parte del usuario |
| Posición de canales | obligatoria, en metros (MNE `info["chs"][i]["loc"][:3]`) |
| Pipeline declarado | feature-extraction |
| Tamaño del repositorio | 0,1 GB |
| Run de entrenamiento | `1mc641uc` en Weights & Biases |

## Arquitectura y entrenamiento

El modelo sigue el marco JEPA adaptado a EEG. Un encoder procesa el contexto visible (parches de 1 s no enmascarados) y un predictor se entrena para mapear esas representaciones de contexto a las embeddings que un teacher EMA produce para los parches enmascarados. A diferencia de otros enfoques auto-supervisados, en este caso no se emplea un regularizador de varianza/covarianza. En esta variante el enmascaramiento es puramente temporal en extensión (L = 8 parches) pero cubre todos los canales a la vez (r = all), con una fracción de parches sin enmascarar de 0,45. Los pesos distribuidos son los del encoder estudiante, que es exactamente lo que se evalúa en el paper; el predictor y el teacher EMA no se incluyen en el repositorio.

El preentrenamiento usa el subconjunto con licencia abierta del corpus REVE (323 grabaciones), elegido para poder redistribuir los pesos. El calendario fue de 10 épocas en 2 × H100, con batch size de 600 por GPU, learning rate 0,00024 (warm-up de 3080 pasos y valor final 1e-06) y weight decay 0,01. El tokenizador corta la señal a 200 Hz en parches de 1 s (200 muestras) con un solape de 20 muestras.

## Capacidades

- Extracción de características de EEG: produce representaciones contextuales a partir de ventanas de señal multicanal, pensadas para usarse como backbone con encoder congelado.
- Transferencia a tareas downstream: clasificación y regresión sobre las características aplanadas mediante una sonda ridge, según la metodología de OpenEEGBench.
- Agnosticismo de montaje: admite cualquier número y conjunto de canales, siempre que cada canal tenga asociada una posición 3D en metros.
- Adaptación por fine-tuning: la propia model card documenta el uso con `PretrainedBackbone` de OpenEEGBench, lo que permite ajuste posterior por tarea.
- Compatibilidad con herramientas del ecosistema MNE: las posiciones de canal se toman directamente de `info["chs"]`.
- No dispone de generación de texto, tool calling, capacidades de agente, visión, audio ni razonamiento multi-paso: es un modelo de representación de señal, no un modelo generativo de lenguaje.

## Casos de uso

- Extracción de características congeladas para clasificación clínica: se carga el encoder y se entrena únicamente una sonda ridge sobre las características contextuales aplanadas, tal y como se hizo en la evaluación del paper sobre 12 datasets y 5 semillas.
- Detección de crisis epilépticas: el modelo obtiene 0,852 ± 0,034 de balanced accuracy en chbmit con encoder congelado, lo que lo hace adecuado como extractor de características en pipelines de monitorización de EEG prolongada.
- Detección de anomalías en EEG clínico: con 0,754 ± 0,014 de balanced accuracy en tuab, puede emplearse como primera etapa de un sistema de cribado que derive los casos dudosos a revisión humana.
- Clasificación de eventos y artefactos: 0,847 ± 0,003 en tuev, útil para etiquetado automático de registros y limpieza previa de señal.
- Estadificación del sueño: 0,598 ± 0,005 en isruc-sleep, aplicable como bloque de extracción en estudios de arquitectura del sueño o en dispositivos de seguimiento domiciliario.
- Investigación en biomarcadores de depresión: 0,737 ± 0,013 en mdd_mumtaz2016, aprovechable en estudios que busquen marcadores EEG reproducibles con un backbone fijo.
- Decodificación motora para interfaces cerebro-computador: se ha evaluado en bcic2a (0,309 ± 0,008) y bcic2020-3 (0,267 ± 0,010), resultados que sugieren que sirve como punto de partida para fine-tuning, no como solución lista para producción en estas tareas.
- Evaluación comparativa de métodos de preentrenamiento: al formar parte de un barrido controlado de 58 encoders con la misma receta, es directamente utilizable como una de las celdas del ablation study sobre geometría de enmascaramiento.
- Estimación de carga cognitiva: en arithmetic_zyma2019 alcanza 0,707 ± 0,005 de balanced accuracy, un escenario típico de experimentos de carga mental con EEG.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card: encoder congelado más sonda ridge sobre las características contextuales aplanadas, 12 datasets × 5 semillas. Balanced accuracy para clasificación y R² para `seed-vig`.

| Dataset | Métrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,707 ± 0,005 | 5 |
| bcic2020-3 | balanced acc. | 0,267 ± 0,010 | 5 |
| bcic2a | balanced acc. | 0,309 ± 0,008 | 5 |
| chbmit | balanced acc. | 0,852 ± 0,034 | 5 |
| faced | balanced acc. | 0,190 ± 0,006 | 5 |
| isruc-sleep | balanced acc. | 0,598 ± 0,005 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,737 ± 0,013 | 5 |
| physionet | balanced acc. | 0,407 ± 0,007 | 5 |
| seed-v | balanced acc. | 0,291 ± 0,002 | 5 |
| seed-vig | R² | -0,805 ± 0,092 | 5 |
| tuab | balanced acc. | 0,754 ± 0,014 | 5 |
| tuev | balanced acc. | 0,847 ± 0,003 | 5 |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 50,8 MB en fp32 (12.692.096 × 4 bytes) y 25,4 MB en fp16/bf16. Es una estimación derivada del número de parámetros; los autores no publican cifras de inferencia.
- VRAM total (pesos + activaciones): no disponible de forma oficial. Al ser un encoder de 12,69 M de parámetros, el consumo depende sobre todo del número de canales, de la longitud de ventana y del batch, no del tamaño del modelo.
- GPU recomendadas: no hay recomendación publicada. Por tamaño, cabe con holgura en cualquier GPU de consumo reciente; el entrenamiento original se hizo con 2 × H100, pero eso responde al barrido de 58 modelos, no al coste de inferencia de este checkpoint.
- GPU de consumo: cabe en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 o inferiores, e incluso es viable la inferencia en CPU para lotes pequeños.
- Opciones de despliegue: PyTorch con el paquete `eeg-fm-masking` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`) y la clase `ContextualEncoderBenchmarkWrapper`, con `safetensors.torch.load_file` para los pesos; integración con OpenEEGBench mediante `PretrainedBackbone` pasando `config.json` como `model_kwargs`. Servidores de inferencia de LLM como vLLM, TGI, llama.cpp u Ollama no son aplicables a este modelo.
- Latencia y throughput estimados: no disponible.
- Nota de carga: el `load_state_dict` se hace con `strict=False` porque el buffer de posiciones de canal y la cabeza de clasificación dependen del dataset.

## Comparativa con modelos similares

| Modelo | Marco | Geometría de enmascaramiento | Parámetros | Resultados publicados | Licencia |
|---|---|---|---|---|---|
| `eeg-fm-masking_jepa_rall_L8` (este) | JEPA | r = todos los canales, L = 8, pct_unmasked = 0,45 | 12,69 M | Tabla de OpenEEGBench incluida en esta ficha | CC-BY-4.0 |
| `eeg-fm-masking_jepa_r9cm_L2` | JEPA | r = 9 cm, L = 2 | no disponible | no disponible en la información proporcionada | CC-BY-4.0 |
| `eeg-fm-masking_mae_r9cm_L2` | MAE | r = 9 cm, L = 2 | no disponible | no disponible en la información proporcionada | CC-BY-4.0 |
| REVE | no disponible | no disponible | no disponible | no disponible | no disponible (citado únicamente como corpus de preentrenamiento) |

Las dos variantes intermedias son las que el propio paper recomienda (r = 9 cm, L = 2), una por cada marco, y pertenecen a la misma colección de 58 encoders entrenados con receta idéntica. No se dispone de datos de benchmarks de estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de señal, no de lenguaje: no genera texto, no soporta tool calling ni agentes, y no tiene capacidades multilingües que evaluar.
- Solo se publica el encoder: el predictor JEPA y el teacher EMA no están incluidos, por lo que no se puede reproducir el preentrenamiento ni el objetivo completo desde este repositorio.
- Rendimiento desigual por tarea: los resultados publicados van de 0,190 ± 0,006 en faced y 0,267 ± 0,010 en bcic2020-3 (cerca del azar en tareas de dos clases) hasta 0,852 ± 0,034 en chbmit. En seed-vig el R² es negativo (-0,805 ± 0,092), es decir, peor que predecir la media.
- Esta no es la configuración recomendada por los autores: el paper recomienda r = 9 cm y L = 2, no r = all y L = 8.
- Requisitos de entrada estrictos: 200 Hz, unidades en voltios y posiciones de canal en metros. El modelo no estandariza los datos (lo hace el wrapper con `factor = 1e+06` y `median_std_clip` con clip en σ = 15), así que preprocesar por cuenta propia puede degradar los resultados.
- Dependencia de la cabeza y del buffer de canal: el `load_state_dict` con `strict=False` deja fuera las partes dependientes del dataset, por lo que el modelo no es utilizable sin envolverlo correctamente.
- Riesgo de alucinación: no aplica, ya que no es un modelo generativo.
- Sesgos: no hay información publicada sobre sesgos demográficos, de adquisición o de montaje; el corpus de preentrenamiento (subconjunto abierto de REVE, 323 grabaciones) condiciona la distribución de dominio.
- Trazabilidad limitada: el repositorio registra 0 descargas y 0 likes, y la validación disponible se reduce a los resultados del propio paper.
- Licencia: los pesos son CC-BY-4.0, lo que permite uso comercial con atribución; el código es MIT. Es obligatorio citar el paper si se utilizan los modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_rall_L8
- Sitio web del paper: https://pierregtch.github.io/eeg-fm-masking
- Código: https://github.com/PierreGtch/eeg-fm-masking
- Colección con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Modelo recomendado por el paper (MAE): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Modelo recomendado por el paper (JEPA): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Run de entrenamiento en Weights & Biases: https://wandb.ai/pierregtch/chan-inv-clf/runs/1mc641uc
