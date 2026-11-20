# juice500/wavlm-24-efficiency-1_8-phonemodel

## Resumen

`wavlm-24-efficiency-1_8-phonemodel` es un modelo de segmentación y reconocimiento fonético construido sobre las representaciones congeladas de `microsoft/wavlm-large` (capa 24, audio a 16 kHz). Lo desarrolla el autor de Hugging Face `juice500` en el marco del trabajo SPAM (S3M-based Phonological Activation Mapping), presentado en el paper "Phone Segmentation and Recognition through Phonological Activation Mapping" (SLT 2026). El modelo no es un modelo generativo de lenguaje, sino un adaptador que transforma las activaciones del encoder auto-supervisado en vectores interpretables de rasgos fonológicos (sonoridad, nasalidad, estridencia, entre otros) y, a partir de ellos, produce segmentos de teléfonos con etiqueta.

La innovación central es hacer explícita la representación intermedia: en lugar de mapear directamente audio a fonemas, SPAM proyecta cada frame del encoder a 43 activaciones fonológicas en el rango [0, 1], lo que permite inspeccionar qué rasgos activa el modelo en cada instante. Sobre esa representación operan dos cabezas, una de segmentación y otra de reconocimiento, que devuelven tuplas `Segment(start, end, label)` con tiempos en segundos.

Esta variante concreta es un ablation de eficiencia de muestras: se ha entrenado únicamente con 1/8 de las locuciones de entrenamiento de TIMIT (Figura 3 del paper), lo que la hace relevante para evaluar cuánto rinde el enfoque con datos limitados. El repo pesa 0.0 GB, no registra descargas ni likes, y la librería de inferencia es `phonespam`, distribuida vía pip. El modelo base es WavLM-large, un transformer de 24 capas y unos 317 millones de parámetros, aunque el adaptador entrenado es una fracción de ese tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM (cabezas de segmentación y reconocimiento) sobre encoder WavLM-large congelado, capa 24 |
| Parametros totales | no disponible (el repo reporta 0.0 GB; el encoder base WavLM-large tiene ~317 M, pero el adaptador no declara recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio a 16 kHz; no se especifica límite de duración) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); el reconocimiento admite inventarios PHOIBLE de otras lenguas vía `vocab_for_language` |
| Licencia | MIT |
| Formato de pesos | no disponible (se carga vía `PhoneModel.from_pretrained` de la librería `phonespam`) |

## Arquitectura y entrenamiento

El modelo se apoya en un encoder auto-supervisado congelado: WavLM-large, capa 24, operando sobre audio a 16 kHz. Sobre esas representaciones, SPAM aprende un mapeo por frame a un vector de 43 activaciones fonológicas (nombres como `silence+`, `syl+`, `son+`, etc.), cada una en [0, 1]. Esa representación interpretable alimenta dos cabezas: una de segmentación temporal y otra de reconocimiento de teléfonos. El resultado de la inferencia es una secuencia de segmentos contiguos con etiqueta y marcas de tiempo en segundos.

El entrenamiento se realizó sobre el dataset `timit-asr/timit_asr` (TIMIT), en inglés. Esta variante corresponde al ablation de eficiencia de muestras del paper: se ajustó con 1/8 de las locuciones de entrenamiento de TIMIT, lo que permite medir el comportamiento del enfoque en régimen de pocos datos. No se detalla en la información disponible el número exacto de tokens de audio, la composición completa del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo discriminativo de este tipo). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Segmentación fonética: divide una locución en intervalos contiguos con marcas de inicio y fin en segundos.
- Reconocimiento de teléfonos: asigna una etiqueta fonética a cada segmento detectado.
- Representación fonológica interpretable: expone `model.spam("utt.wav")`, una matriz de (frames, 43) activaciones en [0, 1] con nombres de rasgo accesibles vía `spam.featnames`.
- Restricción de vocabulario por lengua: `vocab_for_language("deu")` limita el reconocimiento al inventario PHOIBLE de una lengua concreta.
- Procesamiento de audio a 16 kHz con pipeline completo en una sola llamada (`transcribe`).
- Soporte de GPU mediante `device="cuda"` en `from_pretrained`.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio generativo ni modo thinking; es un modelo discriminativo de fonética.

## Casos de uso

- Anotación fonética de corpus: el modelo genera segmentos con etiqueta y tiempos directamente desde un WAV, lo que acelera el etiquetado de corpus de habla para estudios de fonética y fonología, sustituyendo parte del trabajo manual de alineamiento.
- Análisis de rasgos fonológicos: la salida `spam()` permite estudiar qué rasgos (sonoridad, nasalidad, estridencia) activa el encoder en cada frame, útil en investigación sobre representaciones auto-supervisadas del habla.
- Evaluación de eficiencia de muestras: al estar entrenado con 1/8 de TIMIT, sirve como referencia para medir cuánto degrada el rendimiento la escasez de datos en pipelines SPAM frente a la variante completa.
- Preprocesado para sistemas de pronunciación: los segmentos fonéticos con tiempos pueden alimentar herramientas de evaluación de pronunciación o de detección de errores fonéticos en aprendices de inglés.
- Filtrado y enriquecimiento de datos de habla: en un pipeline de curación de corpus, el modelo puede etiquetar fonéticamente clips y habilitar búsquedas por contenido fonético.
- Adaptación a otras lenguas vía PHOIBLE: usando `vocab_for_language`, se puede restringir el reconocimiento al inventario de una lengua distinta del inglés, útil en experimentos comparativos entre inventarios fonológicos.
- Docencia y demostraciones: el demo en Streamlit permite ilustrar segmentación y rasgos fonológicos sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la Figura 3 del paper para el ablation de eficiencia (1/8 de TIMIT), pero no incluye cifras numéricas de precisión, recall, frontera fonética ni tasas de error en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el encoder base WavLM-large (~317 M parámetros) en fp32 ronda los 1,3 GB de pesos, a lo que se suma el adaptador y las activaciones. Con cuantización no documentada, no se puede dar una cifra fiable.
- GPU recomendadas: no disponible; el código permite `device="cuda"`, pero no se especifican modelos concretos.
- Viabilidad en GPU de consumo: no confirmada en la información disponible; por el tamaño del encoder base, es plausible en GPUs de consumo con suficiente VRAM, pero no hay dato oficial.
- Opciones de despliegue: librería `phonespam` (pip), con carga vía `PhoneModel.from_pretrained`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `juice500/wavlm-24-efficiency-1_8-phonemodel` | Adaptador SPAM sobre WavLM-large congelado | no disponible (encoder base ~317 M) | no disponible (audio 16 kHz) | MIT | Hugging Face, librería `phonespam` |
| `microsoft/wavlm-large` | Encoder S3M | ~317 M | no disponible | MIT (según repo original) | Hugging Face |
| Alternativas de segmentación fonética (p. ej. Montreal Forced Aligner, wav2vec2-based) | Herramientas o modelos especializados | no disponible | no disponible | variable | variable |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada, por lo que la comparativa se limita a aspectos de tipo, tamaño y licencia.

## Limitaciones y advertencias

- Entrenado principalmente sobre TIMIT en inglés; el soporte multilingüe depende de PHOIBLE y no está validado en esta ficha.
- Al ser un ablation con 1/8 de los datos de entrenamiento, es esperable un rendimiento inferior al de la variante completa del paper; no se aportan métricas que lo cuantifiquen.
- Riesgo de alucinación en el sentido de segmentos o etiquetas incorrectas en audio con ruido, acentos no vistos o solapamientos de habla; no hay evaluación documentada al respecto.
- Sesgos: no documentados; al entrenar sobre TIMIT, puede heredar sesgos de dominio (habla leída, condiciones de grabación controladas).
- Licencia MIT para el modelo y el código, pero `vocab_for_language` descarga PHOIBLE 2.0 en tiempo de ejecución, que es CC BY-SA 3.0 y se licencia por separado; conviene revisar la compatibilidad en uso comercial.
- El repo reporta 0.0 GB y no registra descargas ni likes; no hay evidencia de uso en producción ni de mantenimiento más allá de la actualización de noviembre de 2026.
- No se documentan formatos de pesos alternativos (GGUF, ONNX) ni cuantizaciones, lo que limita el despliegue en entornos sin la librería `phonespam`.
- El paper referenciado (arXiv:2607.09020) y la fecha de creación del repo (junio de 2026) deben verificarse antes de citar resultados en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-24-efficiency-1_8-phonemodel
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Paper: https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
