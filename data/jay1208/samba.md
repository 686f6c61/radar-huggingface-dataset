# Jay1208/SAMBA

## Resumen

SAMBA es un modelo de representación de señales EEG (electroencefalografía) desarrollado por Jiazhen Hong durante una pasantía en Emotiv en 2025, en colaboración con Geoffrey Mackellar y Soheila Ghane. Se trata de un modelo fundacional para interfaces cerebro-computadora (BCI) que emplea aprendizaje autosupervisado para extraer representaciones genéricas de señales EEG, que después pueden usarse para tareas posteriores como clasificación de patologías o decodificación de intención motora mediante linear probing o fine-tuning.

Arquitectura basada en Mamba (modelo de espacio de estados) con una innovación denominada "differential Mamba" y un mecanismo de embedding espacial guiado por coordenadas de electrodos, según el título del paper asociado (arXiv:2511.18571). El modelo es extremadamente compacto: 1,06 millones de parámetros, lo que lo sitúa en la categoría de modelos ligeros diseñados para ejecutarse en hardware modesto.

Se distribuyen dos checkpoints: SAMBA-2s, preentrenado con ventanas de 2 segundos (256 muestras) sobre datos de Emotiv, HBN, Muse y DICE con configuraciones de 4, 14, 19 y 129 canales; y SAMBA-100s, preentrenado con ventanas de 100 segundos (12.800 muestras) sobre el dataset TUAB con 16 canales bipolares. Ambos operan a 128 Hz y el encoder admite longitudes de entrada y disposiciones de canales distintas a las de preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados) con differential Mamba y embedding espacial guiado por coordenadas |
| Parametros totales | 1,06 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de preentrenamiento: 2 s (256 muestras) en SAMBA-2s; 100 s (12.800 muestras) en SAMBA-100s; el encoder admite otras longitudes |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de senal EEG, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Frecuencia de muestreo | 128 Hz |
| Canales de preentrenamiento | SAMBA-2s: 4, 14, 19, 129; SAMBA-100s: 16 bipolares |
| Dimension de salida | [batch, floor(samples / 8), 128] |
| Libreria | samba-eeg |
| Hardware requerido | Sistema CUDA compatible |

## Arquitectura y entrenamiento

SAMBA se basa en Mamba, una arquitectura de espacio de estados selectiva que ofrece complejidad lineal respecto a la longitud de secuencia, lo que resulta adecuado para señales EEG de ventanas largas como las de 100 segundos (12.800 muestras). El paper introduce dos componentes diferenciadores: un mecanismo "differential Mamba" y un embedding espacial guiado por coordenadas de electrodos, que permite al modelo generalizar entre distintas disposiciones de canales (desde 4 hasta 129 electrodos) incorporando las posiciones 3D de cada electrodo como entrada.

El entrenamiento es autosupervisado (self-supervised learning). SAMBA-100s sigue el método original de entrenamiento con un pipeline de TUAB reconstruido y una partición de validación propia. SAMBA-2s amplía los datos de Emotiv (conjuntos Alpha, Attention, Crowdsource, DriverDistraction y STEW) añadiendo HBN, Muse y DICE para aumentar la diversidad de disposiciones de electrodos. El preentrenamiento sobre TUAB emplea un filtro bandpass de 0,5–45 Hz. No se especifica en la información disponible el número total de tokens ni la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos de representación EEG).

## Capacidades

- Extracción de características (feature extraction) de señales EEG: produce representaciones de forma `[batch, floor(samples/8), 128]` por ventana.
- Linear probing: las características promediadas (pooled) permiten entrenar clasificadores lineales sobre ellas sin modificar el encoder.
- Fine-tuning del encoder para tareas específicas de EEG.
- Generalización entre disposiciones de electrodos: el embedding espacial guiado por coordenadas permite usar el modelo con configuraciones de canales distintas a las de preentrenamiento (4, 14, 19, 129 en SAMBA-2s; 16 bipolares en SAMBA-100s).
- Flexibilidad de longitud de entrada: aunque el preentrenamiento usa ventanas de 2 s o 100 s, el encoder admite otras longitudes.
- Procesamiento a 128 Hz con normalización por percentil absoluto 95 por canal y ventana.
- No soporta tool calling, generación de texto, visión ni capacidades lingüísticas: es un modelo puramente de representación de señales biomédicas.

## Casos de uso

- **Detección de anomalías epileptiformes**: usar SAMBA-100s sobre ventanas largas de EEG (hasta 100 s) preentrenado en TUAB (que contiene registros con y sin anomalías) para extraer características y entrenar un clasificador de detección de actividad epiléptica en entornos clínicos.
- **Decodificación de intención motora en BCI**: emplear SAMBA-2s con ventanas cortas de 2 s para extraer representaciones de potenciales corticales y entrenar clasificadores de imaginación motora en sistemas de interfaz cerebro-computadora de bajo consumo.
- **Monitorización de atención y carga cognitiva**: aprovechar los datos de preentrenamiento de Emotiv (conjuntos Attention, Crowdsource y STEW) para construir clasificadores de estados atencionales en aplicaciones de neuroergonomía o educación.
- **Detección de distracción en conducción**: usar las representaciones del modelo preentrenado con el conjunto DriverDistraction para desarrollar sistemas de alerta de somnolencia o distracción al volante.
- **Investigación en neurociencia con linear probing**: extraer características pooled y entrenar clasificadores lineales para comparar la separabilidad de distintas condiciones experimentales sin necesidad de reentrenar el encoder, reduciendo el coste computacional.
- **Transferencia entre hardware EEG heterogéneo**: desplegar el mismo encoder con distintos cascos (4, 14, 19 o 129 electrodos) gracias al embedding espacial guiado por coordenadas, facilitando la portabilidad entre dispositivos Emotiv, Muse y otros.
- **Preentrenamiento como backbone para nuevas tareas EEG**: fine-tunear el encoder de 1,06 M de parámetros en datasets propios con pocas muestras, aprovechando el preentrenamiento autosupervisado para mitigar el sobreajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: con 1,06 M de parámetros, el modelo en fp32 ocupa aproximadamente 4,2 MB de pesos; la VRAM real vendrá dominada por las activaciones de las señales de entrada (ventanas de hasta 12.800 muestras × canales).
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte CUDA; el modelo requiere explícitamente un sistema CUDA compatible según la model card. Una RTX 4090, A100 o H100 son sobredimensionadas para el tamaño del modelo, pero adecuadas para procesar lotes grandes.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU consumer con CUDA (GTX 1060 en adelante), así como en GPUs integradas con soporte CUDA.
- **Opciones de despliegue**: la librería oficial `samba-eeg` (instalable con `pip install -e '.[mamba,hub]'` desde el repositorio de GitHub) sobre PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, SAMBA se posiciona frente a otros modelos fundacionales de EEG como EEGPT, LaBraM o BIOT, pero no se han facilitado parámetros, contextos ni resultados de benchmarks de dichos modelos en esta ficha, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- **Licencia no especificada**: la model card no indica licencia, lo que impide determinar si el uso comercial está permitido. Es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- **Checkpoints retrenados**: los checkpoints originales ya no están disponibles; los publicados se han reentrenado con pipelines reconstruidos (TUAB) y datos ampliados (SAMBA-2s), por lo que los resultados pueden diferir de los del paper original.
- **Requisito de CUDA**: el modelo requiere un sistema CUDA compatible; no se documenta soporte para CPU.
- **Preprocesamiento estricto**: es necesario remuestrear a 128 Hz, normalizar por percentil absoluto 95 por canal y ventana, y proporcionar coordenadas 3D de los electrodos en el orden y unidades del `config.json`; un preprocesamiento incorrecto degradará las representaciones.
- **Sin benchmarks publicados**: no hay resultados cuantitativos que permitan evaluar su rendimiento frente a alternativas, lo que dificulta la selección informada.
- **Sesgos y generalización**: el preentrenamiento combina datasets con poblaciones y protocolos heterogéneos (Emotiv, HBN, Muse, DICE, TUAB); el rendimiento en poblaciones clínicas o dispositivos no representados puede ser inferior.
- **Riesgo de alucinación**: no aplica en el sentido lingüístico, pero las representaciones pueden producir clasificaciones erróneas en señales fuera de distribución; se recomienda validación clínica independiente.
- **Uso clínico**: no se documenta validación regulatoria ni certificación para uso diagnóstico; cualquier aplicación médica requiere evaluación adicional.
- **Tamaño del repo**: 0,0 GB según Hugging Face, lo que sugiere que los pesos pueden no estar completamente subidos o que el repo está vacío en el momento de la consulta; conviene verificar la disponibilidad real de los archivos antes de integrar.

## Enlaces

- Hugging Face: https://huggingface.co/Jay1208/SAMBA
- Checkpoint SAMBA-2s: https://huggingface.co/Jay1208/SAMBA/tree/main/SAMBA-2s
- Checkpoint SAMBA-100s: https://huggingface.co/Jay1208/SAMBA/tree/main/SAMBA-100s
- Paper (arXiv): https://arxiv.org/abs/2511.18571
- Repositorio de código: https://github.com/Jiazhen-Hong/SAMBA
