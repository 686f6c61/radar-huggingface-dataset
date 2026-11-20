# juice500/wavlm-24-efficiency-1_64-phonemodel

## Resumen

`wavlm-24-efficiency-1_64-phonemodel` es un adaptador de segmentación y reconocimiento fonético construido sobre las representaciones congeladas de WavLM-large (capa 24, 16 kHz). Lo desarrolla el autor de Hugging Face `juice500` en el marco del trabajo "Phone Segmentation and Recognition through Phonological Activation Mapping" (SPAM), presentado en el IEEE Spoken Language Technology Workshop (SLT) 2026. El modelo no genera texto libre: su tarea es mapear cada fotograma acústico a un vector de activaciones fonológicas (voz, nasalidad, estridente, etc.) a partir del cual dos cabezas ligeras producen segmentación y etiquetado de fonemas.

La relevancia técnica está en que convierte la representación opaca de un modelo auto-supervisado de voz (S3M) en una representación interpretable y reutilizable para distintas tareas fonéticas, sin reentrenar el codificador. Esta variante concreta es un ablación de eficiencia muestral: se ajusta únicamente con 1/64 de las emisiones de entrenamiento de TIMIT (figura 3 del artículo), lo que la convierte en una referencia útil para estudiar cuánto dato necesita el enfoque SPAM antes de degradarse.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de repo de 0.0 GB (los pesos del adaptador son ligeros, ya que el codificador WavLM-large se referencia y no se redistribuye) y licencia MIT. Está pensado para inglés, aunque la API permite restringir el vocabulario de reconocimiento a inventarios de otras lenguas mediante PHOIBLE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM sobre WavLM-large congelado (capa 24); dos cabezas ligeras de segmentación y reconocimiento sobre un vector de 43 activaciones fonológicas |
| Parametros totales | no disponible (el adaptador es ligero; WavLM-large base tiene ~317 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa fotogramas de audio a 16 kHz; no hay ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); el reconocimiento puede restringirse a inventarios PHOIBLE de otras lenguas vía `vocab_for_language` |
| Licencia | MIT (PHOIBLE 2.0 se descarga en tiempo de ejecución bajo CC BY-SA 3.0) |
| Formato de pesos | no disponible (repo de 0.0 GB; pesos del adaptador, probablemente safetensors/PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SPAM: se congela el codificador WavLM-large (capa 24, audio a 16 kHz) y se aprende un mapeo de cada fotograma a un vector de 43 activaciones fonológicas continuas en [0, 1] (voz, nasalidad, silencio, silábico, sonorante, etc.). Sobre esa representación interpretable se montan dos cabezas: una de segmentación (fronteras entre fonemas) y otra de reconocimiento (etiqueta del segmento). La API `model.spam("utt.wav")` expone directamente la matriz `(frames, 43)` con nombres de características (`silence+`, `syl+`, `son+`, ...), lo que permite inspeccionar la representación intermedia.

El entrenamiento se realiza sobre TIMIT (`timit-asr/timit_asr`). Esta variante concreta es una ablación de eficiencia muestral: usa 1/64 de las emisiones de entrenamiento de TIMIT, lo que la sitúa en el extremo de bajo dato del estudio. No se documentan en la información disponible el número de tokens, la composición completa del dataset ni si hubo RLHF/DPO (no aplica, al no ser un modelo generativo). La innovación destacable es precisamente la interpretabilidad del espacio intermedio y la posibilidad de restringir el vocabulario de salida a inventarios fonológicos externos (PHOIBLE).

## Capacidades

- Segmentación fonética: devuelve segmentos contiguos con tiempos de inicio y fin en segundos.
- Reconocimiento fonético: etiqueta cada segmento con un fonema del inventario permitido.
- Representación fonológica interpretable: vector de 43 activaciones por fotograma (`spam.featnames`).
- Restricción de vocabulario por lengua mediante `vocab_for_language("deu")` y PHOIBLE.
- Procesamiento de audio a 16 kHz con el codificador WavLM-large congelado.
- No es un modelo generativo: no produce texto libre, no hace tool calling ni razonamiento multi-turno.
- No soporta visión, audio generativo ni agentes.

## Casos de uso

- Análisis fonético automatizado en investigación: obtener alineamientos fonéticos con tiempos para corpus de habla, usando `transcribe` y los `Segment(start, end, label)`.
- Estudios de adquisición y variación fonológica: la matriz SPAM de 43 dimensiones permite correlacionar activaciones (nasalidad, voz, estridente) con hipótesis lingüísticas sin caja negra.
- Prototipado de sistemas de pronunciación: comparar la secuencia de fonemas reconocida con una transcripción de referencia para detectar desviaciones.
- Evaluación de eficiencia muestral: esta variante con 1/64 de TIMIT sirve como referencia de bajo dato para replicar el experimento de la figura 3 del artículo.
- Segmentación para preprocesado de ASR: usar las fronteras fonéticas como features auxiliares o para alinear transcripciones en pipelines de reconocimiento.
- Docencia y demos interactivas: el demo en Streamlit permite ilustrar segmentación y reconocimiento fonético en tiempo real.
- Experimentos multilingües controlados: restringir el vocabulario a inventarios PHOIBLE de otras lenguas para probar transferencia del espacio fonológico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo referencia la figura 3 del artículo (ablación de eficiencia muestral con 1/64 de TIMIT), sin cifras numéricas de precisión, recall ni tasas de error fonético.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al usar WavLM-large congelado (~317 M parámetros, dato no confirmado) más cabezas ligeras, la inferencia en FP32 requiere del orden de 1,5-2 GB de VRAM, pero esta cifra es una estimación y no está confirmada en la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos ~4 GB de VRAM; el codificador cabe en RTX 3060/4060 y superiores.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs modernas con 4 GB o más.
- Opciones de despliegue: paquete `phonespam` (`pip install phonespam`), con `device="cuda"` para GPU; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wavlm-24-efficiency-1_64-phonemodel | Adaptador SPAM sobre WavLM-large | WavLM-large capa 24 | 1/64 de TIMIT | MIT | Hugging Face (0 descargas) |
| Variantes SPAM con fracciones mayores de TIMIT | Adaptador SPAM sobre WavLM-large | WavLM-large capa 24 | Fracciones superiores de TIMIT | MIT (presumible) | Referenciadas en el artículo, no listadas aquí |
| WavLM-large original | Modelo auto-supervisado de voz | — | Corpus de habla a gran escala | MIT | Hugging Face (microsoft/wavlm-large) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparación se limita a arquitectura, base y licencia.

## Limitaciones y advertencias

- Entrenado solo con inglés (TIMIT); el rendimiento en otras lenguas no está validado, aunque la API permita restringir vocabulario con PHOIBLE.
- Entrenado con 1/64 de TIMIT: es una ablación de eficiencia, no la variante de máxima calidad; se espera una degradación frente a variantes con más datos.
- TIMIT es un corpus pequeño, de dominio limitado (habla leída, 16 kHz) y con sesgos de hablantes y dialectos; el modelo puede no generalizar a habla espontánea o ruidosa.
- No es un modelo generativo: no produce texto, no razona y no soporta tool calling ni agentes.
- Riesgo de errores en fronteras fonéticas y en fonemas poco representados en TIMIT.
- La licencia MIT cubre el modelo, pero PHOIBLE 2.0 se descarga en tiempo de ejecución bajo CC BY-SA 3.0, con obligaciones de atribución y compartir igual que deben revisarse para uso comercial.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes de producción.
- El pipeline no está declarado en Hugging Face (`Pipeline: no disponible`), lo que puede complicar la integración con herramientas automáticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-24-efficiency-1_64-phonemodel
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Artículo: https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
