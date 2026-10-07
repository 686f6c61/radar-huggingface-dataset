# braindecode/brainomni-base-pretrained

## Resumen

BrainOmni base pretrained es un modelo fundacional para señales cerebrales que unifica el tratamiento de electroencefalografía (EEG) y magnetoencefalografía (MEG) en una sola arquitectura. Lo desarrolla el grupo OpenTSLab (Xiao, Cui, Zhang y colaboradores) y se presentó en NeurIPS 2025 bajo la referencia arXiv:2505.18185. El repositorio que nos ocupa es la conversión oficial de esos pesos al ecosistema de la librería Braindecode, publicada por el propio equipo de Braindecode en HuggingFace.

La variante base tiene 42.692.072 parámetros, distribuidos en 12 bloques transformer con 16 cabezas de atención y una dimensión de modelo (lm_dim) de 512. Incorpora un tokenizador congelado específico para señales neuronales y usa codificaciones posicionales rotatorias (RoPE). La entrada esperada son registros preprocesados a 256 Hz, y el modelo admite configuraciones de canales arbitrarias siempre que se le proporcionen las posiciones de los sensores EEG y las orientaciones de las bobinas MEG.

Su relevancia actual está en el paradigma de los modelos fundacionales aplicados a neuroseñales: en lugar de entrenar una red desde cero para cada montaje, equipo o tarea, se parte de una representación preentrenada y se hace ajuste fino o *linear probing* con pocos datos etiquetados. Un detalle crítico es que la cabeza de clasificación no está preentrenada (inicialización aleatoria con semilla fija), por lo que el modelo no es utilizable tal cual para predecir: hay que ajustarlo primero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificaciones posicionales rotatorias (RoPE), tokenizador congelado, 12 bloques y 16 cabezas (lm_dim 512) |
| Parametros totales | 42.692.072 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publican pesos en float32 y bfloat16 verificados; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (modelo de señales biomédicas EEG/MEG, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors y pytorch_model.bin |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 12 bloques con dimensión de modelo 512 y 16 cabezas de atención, que emplea RoPE para codificar la posición temporal de los *tokens* de señal. El modelo incluye un tokenizador congelado, lo que implica que la tokenización de las señales EEG/MEG se realiza con un componente que no se actualiza durante el ajuste fino. Durante la conversión a Braindecode se eliminó un predictor de máscara que solo existía para el preentrenamiento, lo que sugiere (sin confirmación explícita en la información disponible) un objetivo de modelado enmascarado típico de los modelos fundacionales de series temporales.

La conversión es numéricamente fiel: las salidas del modelo convertido coinciden con la carga del fichero original por parte de Braindecode, con una diferencia máxima absoluta de 0.0 tanto en float32 como en bfloat16. El script `convert_brainomni_checkpoints.py` renombra las claves al esquema de Braindecode, descarta el predictor de máscara y almacena la caché de RoPE como pares `(cos, sin)` con el seno a cero, reproduciendo el comportamiento del código original, que solo guarda cosenos y los usa tal cual. No se dispone del número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Aprendizaje de representaciones genéricas de señales EEG y MEG mediante un *backbone* compartido.
- Soporte de configuraciones de canales arbitrarias: el parámetro `chs_info` debe aportar posiciones de sensores (EEG) y orientaciones de bobina (MEG).
- Ajuste fino supervisado y *linear probing* para tareas de clasificación (por ejemplo, con `n_outputs=2`).
- Extracción de *embeddings* para análisis posteriores, búsqueda de registros o agrupamiento.
- Transferencia a tareas con pocos datos etiquetados, que es el caso habitual en entornos clínicos.
- Entrada a 256 Hz con el preprocesado del código de los autores.
- No dispone de *tool calling*, ni de razonamiento multi-paso, ni de generación de texto: no es un modelo de lenguaje.
- No se documentan capacidades multimodales más allá de la unificación EEG/MEG.

## Casos de uso

- Clasificación de imaginación motora en interfaces cerebro-computador: se ajusta la cabeza de clasificación sobre los *embeddings* preentrenados para distinguir entre tareas motoras imaginadas, lo que reduce el número de ensayos por sujeto necesarios frente a entrenar una CNN desde cero.
- Detección de crisis epilépticas: *fine-tuning* sobre registros con anotaciones ictales para construir un clasificador de ventanas temporales; el preentrenamiento en gran volumen de EEG ayuda cuando las etiquetas clínicas son escasas.
- Estadificación automática del sueño: clasificación de épocas de 30 segundos en fases N1, N2, N3, REM y vigilia, un caso donde el formato de entrada a 256 Hz encaja directamente.
- Investigación multimodal EEG-MEG: uso del mismo *backbone* para ambas modalidades gracias a que `chs_info` transporta posiciones de sensores y orientaciones de bobina, lo que permite comparar representaciones entre técnicas de registro.
- Neurorrehabilitación y prótesis controladas por señal cerebral: extracción de características estables por sujeto para decodificación en tiempo real, con el modelo preentrenado como extractor y una capa ligera entrenada por paciente.
- Extracción de *embeddings* para bases de datos de registros: indexar y agrupar estudios EEG/MEG por similitud de representación, útil para cribado o para recuperación de casos análogos.
- *Linear probing* en entornos clínicos con pocos datos: al mantener congelado el *backbone* y entrenar solo una regresión logística, el coste computacional y el riesgo de sobreajuste se reducen drásticamente.
- Análisis de potenciales evocados en neurociencia cognitiva: uso de las representaciones como características para comparar condiciones experimentales entre cohortes y montajes distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye métricas de tareas *downstream* (por ejemplo, precisión en TUAB, TUEV, estadificación de sueño o imaginación motora), y tampoco se proporcionan datos del artículo más allá de la cita a arXiv:2505.18185.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 171 MB con pesos en float32 y unos 85 MB en bfloat16, calculado a partir de los 42.692.072 parámetros. A ello hay que sumar la memoria de activaciones, que depende de la longitud de las ventanas de señal y del tamaño de lote.
- GPU recomendadas: al ser un modelo pequeño, cualquier GPU moderna es suficiente; no se requieren A100 ni H100. Una RTX 3060, RTX 4070 o RTX 4090 cubren de sobra el ajuste fino en la mayoría de configuraciones. También es viable ejecutarlo en CPU para inferencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU con 4 GB o más de VRAM, e incluso en GPUs integradas para inferencia con lotes pequeños.
- Opciones de despliegue: la vía oficial es la librería Braindecode (`braindecode.models.BrainOmni`), que requiere una versión superior a la 1.8.1. Los pesos también están en safetensors y pytorch_model.bin, por lo que se pueden cargar con PyTorch directamente. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que no es un modelo generativo de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

BrainOmni pertenece a la familia de modelos fundacionales de neuroseñales, donde también se sitúan propuestas como LaBraM, BIOT y EEGPT. La información proporcionada en esta búsqueda solo cubre BrainOmni, por lo que las cifras de los modelos alternativos se marcan como no disponibles.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BrainOmni base (braindecode) | 42.692.072 | no disponible | no disponible | MIT | HuggingFace, safetensors y pytorch_model.bin |
| BrainOmni base (OpenTSLab, original) | no disponible | no disponible | no disponible | MIT | HuggingFace (OpenTSLab/BrainOmni, revision 9a4d3c7) |
| LaBraM | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| BIOT | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| EEGPT | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- La cabeza de clasificación no está preentrenada: se inicializa de forma aleatoria con una semilla fija, así que hay que hacer ajuste fino o *linear probing* antes de usar el modelo para predecir. Usarlo sin entrenar esa capa produce salidas sin sentido.
- El preprocesado debe replicar el del código de los autores y la señal debe estar a 256 Hz; cualquier desviación en el filtrado, el remuestreo o el escalado degrada las representaciones.
- `chs_info` debe incluir posiciones de sensores EEG y orientaciones de bobina MEG. La configuración por defecto de `config.json` (19 canales EEG, sistema 10-20) es solo un valor de reserva y se sobrescribe con la información que se pase en tiempo de carga.
- Requiere una versión de Braindecode posterior a la 1.8.1; versiones anteriores no podrán cargar el modelo.
- La caché de RoPE se almacena como pares `(cos, sin)` con el seno a cero, replicando el comportamiento del código original, que solo guarda cosenos y los usa tal cual. Las salidas verificadas coinciden con las del fichero original (diferencia máxima absoluta de 0.0), pero conviene ser consciente de esta particularidad al portar el modelo a otros *frameworks*.
- No hay resultados de benchmarks publicados en la información disponible, ni para esta conversión ni para la tarea concreta de cada usuario; la validación corre por cuenta de quien lo adopte.
- El repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, por lo que no existe validación independiente de la comunidad.
- Sesgos conocidos: no disponible. Al depender de los datos de preentrenamiento de los autores, es esperable un sesgo hacia la población, los equipos y los montajes presentes en ese corpus, pero no se documenta su composición.
- Riesgo de predicciones espurias fuera de distribución: al aplicar el modelo a patologías, edades o dispositivos poco representados en el preentrenamiento, las representaciones pueden ser poco fiables.
- El modelo no es un sistema de lenguaje: no genera texto, no admite *tool calling* y no debe evaluarse con métricas tipo MMLU o HumanEval.
- Licencia MIT tanto en esta conversión como en la publicación original, lo que permite uso comercial; conviene aun así revisar los términos de los conjuntos de datos empleados en el preentrenamiento, que no se detallan en la información disponible.
- Para uso clínico real sería necesario validar el modelo conforme a la normativa aplicable de productos sanitarios; esta publicación es un artefacto de investigación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/braindecode/brainomni-base-pretrained
- Modelo original de los autores: https://huggingface.co/OpenTSLab/BrainOmni
- Documentación de `braindecode.models.BrainOmni`: https://braindecode.org/stable/generated/braindecode.models.BrainOmni.html
- Artículo de BrainOmni: https://arxiv.org/abs/2505.18185
- Librería Braindecode: https://braindecode.org
- Cita de Braindecode (Zenodo): https://doi.org/10.5281/zenodo.17699192
