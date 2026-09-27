# PierreGtch/eeg-fm-masking_jepa_rall_L4

## Resumen

`eeg-fm-masking_jepa_rall_L4` es un encoder de electroencefalografía (EEG) preentrenado con aprendizaje autosupervisado, publicado por PierreGtch como parte de la familia de 58 encoders del trabajo *What masking geometry works best for EEG foundation models? A controlled evaluation across MAE and JEPA*. El modelo pertenece a la categoría de foundation models de senales biomédicas: no genera texto ni procesa lenguaje natural, sino que produce representaciones (embeddings) de ventanas de EEG que después se usan como features para tareas downstream como clasificación de patologías, detección de crisis epilépticas o predicción de edad/vigilancia.

La arquitectura es un transformer de 12,69 millones de parametros entrenado bajo el marco JEPA (joint-embedding predictive architecture): un predictor mapea el contexto codificado a los embeddings que un teacher EMA genera para los parches enmascarados, sin regularizador de varianza/covarianza. La geometría de enmascaramiento de esta variante concreta es `r = all` (todos los canales) y `L = 4` parches temporales, con un 45 % de parches sin enmascarar. El modelo es agnóstico al montaje: acepta cualquier número y disposición de electrodos siempre que cada canal tenga una posición 3D en metros.

Su relevancia es metodológica más que de producto: forma parte de un barrido controlado que aísla el efecto de la geometría de enmascaramiento sobre el rendimiento downstream, con receta de entrenamiento idéntica entre las 58 variantes. Los autores recomiendan la celda `r = 9 cm, L = 2` (variantes MAE y JEPA), por lo que esta variante `r = all, L = 4` debe considerarse una configuración de estudio comparativo, no la configuración óptima de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de parches (patch tokeniser + bloques transformer), preentrenado con JEPA (predictor + teacher EMA) |
| Parametros totales | 12.692.096 (solo el encoder; el predictor y el teacher EMA no se publican) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No aplica en el sentido de los LLM: la senal se corta en parches de 1 s (200 muestras a 200 Hz) con solapamiento de 20 muestras; el modelo recibe ventanas de parches |
| Tipos de cuantizacion | No disponible (no se publican variantes GGUF, AWQ, GPTQ ni cuantizaciones declaradas; repo de 0,1 GB en safetensors) |
| Idiomas soportados | No disponible (modelo de senales EEG, no procesa lenguaje natural) |
| Licencia | CC-BY-4.0 (pesos); codigo bajo MIT |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` + `metadata.json` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer que tokeniza la senal EEG en parches de 1 segundo (200 muestras a 200 Hz, con 20 muestras de solapamiento entre parches consecutivos) y los proyecta mediante un patch tokeniser (`feature_encoder.*`) antes de pasar por los bloques transformer (`model.*`). El preentrenamiento sigue el esquema JEPA: un predictor aprende a mapear las representaciones del contexto visible a las representaciones que produce un teacher EMA sobre los parches enmascarados, sin emplear regularizadores de varianza/covarianza tipo VICReg. En esta variante la geometría de enmascaramiento es `r = all` (se enmascaran todos los canales de forma conjunta) con `L = 4` parches temporales y `pct_unmasked = 0.45`. El checkpoint publicado corresponde a la época 10 de 10 (identificador `v9`), la versión evaluada en el paper.

Los pesos publicados contienen únicamente el encoder (tokeniser + transformer), que son exactamente los tensores cargados en la evaluación downstream del paper. El predictor JEPA y el teacher EMA no se distribuyen; en el caso JEPA los pesos liberados son los del encoder estudiante. El entrenamiento usó el subconjunto de licencia abierta del corpus de preentrenamiento REVE (323 registros), seleccionado para que los pesos puedan redistribuirse legalmente. El calendario fue de 10 épocas sobre 2 GPU H100, con batch size de 600 por GPU, learning rate 0,00024 (warm-up de 3080 pasos, valor final 1e-06) y weight decay de 0,01.

En cuanto al preprocesado, el wrapper `ContextualEncoderBenchmarkWrapper` aplica internamente un factor de escala de 1e+06 (los datos de entrada deben estar en voltios) y un escalado por ventana `median_std_clip` con recorte en σ = 15. El modelo es agnóstico al montaje: funciona con cualquier número y conjunto de canales, siempre que cada canal tenga una posición 3D en metros (formato MNE `info["chs"][i]["loc"][:3]`).

## Capacidades

- Extraccion de features de senales EEG: la pipeline declarada es `feature-extraction`; el modelo devuelve representaciones contextuales de ventanas de EEG de 1 s por parche.
- Clasificación downstream mediante sonda congelada: los resultados publicados usan el encoder congelado más una regresión ridge sobre las features contextuales aplanadas (balanced accuracy para clasificación, R² para regresión).
- Adaptación a múltiples tareas EEG: los 12 datasets evaluados cubren aritmética mental, interfaces cerebro-computador (BCI), detección de crisis epilépticas (CHB-MIT), reconocimiento facial, sueño (ISRUC), depresión (MDD), senales fisiológicas de PhysioNet, emociones (SEED-V) y vigilancia (SEED-VIG), entre otras.
- Agnosticismo de montaje: admite cualquier número y disposición de electrodos con posición 3D conocida.
- No dispone de tool calling, function calling, soporte de agentes, capacidades multilingues ni modos de razonamiento: no es un modelo de lenguaje.
- No incorpora visión, audio ni otras modalidades; la entrada es exclusivamente senal EEG a 200 Hz en voltios.
- Fine-tuning: la librería permite evaluar o afinar el backbone con OpenEEGBench mediante `PretrainedBackbone`.

## Casos de uso

- Detección de crisis epilépticas: usar el encoder congelado más una sonda ligera sobre ventanas de EEG continuo; en el dataset CHB-MIT alcanza 0,900 ± 0,020 de balanced accuracy, lo que lo hace candidato para triaje automático de episodios en monitorización prolongada.
- Detección de anomalías en EEG clínico (TUAB): con 0,734 ± 0,002 de balanced accuracy en la tarea de normal/anormal, puede emplearse como primer filtro para priorizar revisiones de neurofisiólogos.
- Clasificación de eventos en EEG quirúrgico (TUEV): 0,876 ± 0,030 de balanced accuracy, útil para preetiquetar segmentos en pipelines de revisión de estudios largos.
- Investigación en interfaces cerebro-computador: sirve como extractor de features para tareas de imaginación motora y paradigmas BCI, aunque en bcic2a (0,311 ± 0,013) y bcic2020-3 (0,264 ± 0,009) el rendimiento congelado es bajo y exigiría fine-tuning.
- Neurociencia cognitiva y estudios de carga mental: clasificación de tareas aritméticas (0,662 ± 0,004 en arithmetic_zyma2019) como base para experimentos reproducibles con protocolo congelado.
- Fase del sueno y vigilancia: en isruc-sleep alcanza 0,592 ± 0,004, por lo que puede integrarse en pipelines de staging de sueño como componente previo al ajuste fino.
- Investigación sobre depresión: 0,711 ± 0,003 en mdd_mumtaz2016 permite reutilizar el encoder como punto de partida para estudios de biomarcadores, siempre con validación clínica independiente.
- Estudio comparativo de geometrías de enmascaramiento: el propósito principal del artefacto es servir como una de las 58 celdas del barrido controlado para reproducir o extender el análisis del paper.
- Preentrenamiento base para dominios con pocos datos etiquetados: al ser agnóstico al montaje y de solo 12,69 M de parametros, es viable afinarlo por sujeto o por dispositivo en entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados publicados con el encoder congelado y una sonda ridge sobre las features contextuales aplanadas (OpenEEGBench, 12 datasets × 5 semillas; balanced accuracy para clasificación, R² para `seed-vig`):

| Dataset | Metrica | Resultado (media ± sd) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | balanced acc. | 0,662 ± 0,004 | 5 |
| bcic2020-3 | balanced acc. | 0,264 ± 0,009 | 5 |
| bcic2a | balanced acc. | 0,311 ± 0,013 | 5 |
| chbmit | balanced acc. | 0,900 ± 0,020 | 5 |
| faced | balanced acc. | 0,200 ± 0,005 | 5 |
| isruc-sleep | balanced acc. | 0,592 ± 0,004 | 5 |
| mdd_mumtaz2016 | balanced acc. | 0,711 ± 0,003 | 5 |
| physionet | balanced acc. | 0,413 ± 0,006 | 5 |
| seed-v | balanced acc. | 0,287 ± 0,001 | 5 |
| seed-vig | R² | -0,816 ± 0,025 | 5 |
| tuab | balanced acc. | 0,734 ± 0,002 | 5 |
| tuev | balanced acc. | 0,876 ± 0,030 | 5 |

No se han publicado en la informacion disponible otros benchmarks (tipo MMLU, HumanEval o GSM8K) porque no son aplicables a un modelo de senales EEG.

## Requisitos de hardware

- VRAM para inferencia: con 12,69 M de parametros, el encoder en fp32 ocupa en torno a 50 MB y en fp16 alrededor de 25 MB; la huella real depende del tamano de lote y de la longitud de la ventana de EEG procesada.
- GPU recomendadas: cualquiera con soporte CUDA y suficiente memoria para el lote; no requiere aceleradores de gama alta. El entrenamiento original se hizo con 2 × H100, pero eso responde al batch size de 600 por GPU y al barrido completo de 58 modelos, no a la inferencia.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, 4070, 4090) y también en CPU para inferencia en lote pequeno o en tiempo no crítico.
- Opciones de despliegue: PyTorch + la librería `eeg_fm_masking` (`pip install git+https://github.com/PierreGtch/eeg-fm-masking`), carga de pesos con `safetensors.torch.load_file` y wrapper `ContextualEncoderBenchmarkWrapper`; integración con OpenEEGBench mediante `open_eeg_bench.backbone.PretrainedBackbone`. Los motores orientados a LLM (vLLM, llama.cpp, Ollama, TGI) no son aplicables.
- Latencia y throughput: no disponible (no se publican mediciones de latencia ni de muestras por segundo).

## Comparativa con modelos similares

Dentro de la propia familia `eeg-fm-masking`, las variantes comparten arquitectura, numero de parametros (12,69 M) y licencia, y solo difieren en la geometría de enmascaramiento y el marco de preentrenamiento:

| Modelo | Parametros | Enmascaramiento | Marco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eeg-fm-masking_jepa_rall_L4 (este) | 12,69 M | r = all, L = 4, pct_unmasked = 0,45 | JEPA | CC-BY-4.0 | HuggingFace |
| eeg-fm-masking_jepa_r9cm_L2 | 12,69 M | r = 9 cm, L = 2 | JEPA | CC-BY-4.0 | HuggingFace (recomendado por el paper) |
| eeg-fm-masking_mae_r9cm_L2 | 12,69 M | r = 9 cm, L = 2 | MAE | CC-BY-4.0 | HuggingFace (recomendado por el paper) |
| Resto de la coleccion (58 encoders en total) | 12,69 M | 5 radios espaciales × 6 longitudes temporales | MAE o JEPA | CC-BY-4.0 | HuggingFace |

No se dispone en la informacion proporcionada de datos comparativos frente a otros foundation models de EEG externos (por ejemplo LaBraM, BIOT o EEGPT): parametros, contexto y rendimiento de esas alternativas figuran como no disponibles, y no se han inventado cifras.

## Limitaciones y advertencias

- Esta variante no es la recomendada por los autores: el paper aconseja `r = 9 cm, L = 2`, por lo que `r = all, L = 4` debe tratarse como celda de comparacion experimental.
- Los pesos publicados contienen solo el encoder. El predictor JEPA y el teacher EMA no se distribuyen, de modo que no es posible reanudar el preentrenamiento tal cual desde este repositorio.
- Requisitos de entrada estrictos: muestreo a 200 Hz, senal en voltios, sin estandarizacion previa por parte del usuario (el wrapper aplica el factor 1e+06 y el `median_std_clip`), y posiciones de canal en metros. Ignorar estos requisitos degrada las features sin aviso.
- Rendimiento downstream muy desigual: `faced` (0,200), `bcic2020-3` (0,264) y `seed-v` (0,287) están en niveles cercanos al azar segun el numero de clases, y `seed-vig` presenta un R² negativo (-0,816), lo que indica que las features congeladas no explican la variable objetivo en esa tarea.
- Riesgo de sobreajuste a los 12 datasets de OpenEEGBench: la evaluación se limita a ese conjunto y no garantiza generalizacion a otros montajes, poblaciones o equipos de registro.
- Sesgos potenciales derivados del corpus REVE: solo se uso el subconjunto de licencia abierta (323 registros), lo que puede infrarrepresentar poblaciones, edades, patologías o dispositivos no presentes en ese subconjunto. No se documentan analisis de sesgo en la informacion disponible.
- Uso clínico: el modelo no está validado como dispositivo médico ni se reportan estudios prospectivos; cualquier aplicación diagnóstica requiere validación independiente y supervision profesional.
- Licencia CC-BY-4.0 en los pesos: permite uso comercial con atribucion, pero obliga a citar el paper y a mantener la atribucion; el codigo asociado es MIT, con condiciones distintas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe una comunidad de usuarios que haya validado la reproducibilidad de los resultados de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_rall_L4
- Coleccion completa (58 modelos): https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Variante recomendada MAE `r9cm_L2`: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Variante recomendada JEPA `r9cm_L2`: https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Sitio web del paper: https://pierregtch.github.io/eeg-fm-masking
- Codigo (GitHub, MIT): https://github.com/PierreGtch/eeg-fm-masking
- Registro del entrenamiento (Weights & Biases, run `08rlsatl`): https://wandb.ai/pierregtch/chan-inv-clf/runs/08rlsatl
