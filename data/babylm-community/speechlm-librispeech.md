# BabyLM-community/SpeechLM-librispeech

## Resumen

SpeechLM-librispeech es una familia de modelos de lenguaje del habla (speech language models) publicada por la comunidad BabyLM-community y derivada del trabajo de Kando, Miyao y Takamichi presentado en Interspeech 2025. El modelo aplica una arquitectura OPT estándar (12 capas, 16 cabezas de atención, dimensión de embedding 1024 y FFN de 4096) sobre secuencias discretas de unidades de habla en lugar de tokens de texto. Cada unidad corresponde a la asignación al centroide k-means más cercano de las características de la capa 9 de HuBERT BASE, extraídas a tramas de 20 ms y con repeticiones consecutivas fusionadas.

El repositorio distribuye cuatro variantes según el tamaño del vocabulario de unidades K (128, 256, 512 y 1024), cada una en su propia rama de Git. El modelo se entrena sobre LibriSpeech (960 horas) en fragmentos de 2048 unidades, hasta 50 000 pasos con batch de 16 y parada temprana sobre la pérdida de validación. Los pesos publicados corresponden a la semilla 0 de las tres que promedia el artículo original.

Su relevancia es fundamentalmente investigadora: permite estudiar cómo afectan el tamaño del vocabulario discreto y la segmentación al modelado del habla, y sirve como referencia reproducible para experimentos de tokenización de audio. No está pensado como un asistente conversacional ni como un sistema ASR de producción, sino como un modelo de lenguaje que asigna verosimilitud a secuencias de unidades de habla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer OPT sobre unidades discretas de habla (12 capas, 16 cabezas, d_model 1024, FFN 4096) |
| Parametros totales | no disponible (arquitectura tipo OPT de 12 capas; el recuento exacto no se indica en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 unidades de habla (equivalente a 2048 tramas de 20 ms antes de fusionar repeticiones) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors en precision original) |
| Idiomas soportados | ingles (LibriSpeech es un corpus de habla inglesa; no se declaran otros idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, kmeans.safetensors) y tokenizer de Hugging Face |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo OPT que opera sobre un vocabulario discreto de unidades de habla. La tokenizacion se construye en dos pasos: primero se extraen las características de la capa 9 de HuBERT BASE (el checkpoint de torchaudio entrenado sobre LibriSpeech 960h) a tramas de 20 ms; después cada vector de 768 dimensiones se asigna al centroide k-means más cercano de entre K posibles. El k-means se ajustó sobre un subconjunto de 100 horas del conjunto de entrenamiento de LibriSpeech. Las repeticiones consecutivas de la misma unidad se fusionan antes de alimentar el modelo, y se añade un token de fin de secuencia.

El entrenamiento usa LibriSpeech completo (960 horas) en fragmentos de 2048 unidades, con batch de 16 y hasta 50 000 pasos, aplicando parada temprana según la pérdida de validación. No se documenta en la model card el uso de RLHF, DPO ni ajuste por preferencias; el objetivo es el modelado autoregresivo estándar (log-verosimilitud de la secuencia de unidades). El artículo original estudia además segmentaciones más gruesas y promedia tres semillas de entrenamiento, mientras que este repositorio publica únicamente los modelos de la semilla 0 en la configuración de 20 ms sin pooling.

## Capacidades

- Modelado de verosimilitud de habla: calcula la log-verosimilitud media de una locución a partir de su forma de onda a 16 kHz.
- Tokenizacion discreta de audio: convierte audio en secuencias de unidades k-means mediante HuBERT BASE y los centroides publicados.
- Generacion autoregresiva de secuencias de unidades (el modelo es un LM causal, aunque la model card solo documenta el uso para scoring).
- Cuatro tamanos de vocabulario (K = 128, 256, 512, 1024) para experimentar con granularidad de tokenizacion.
- Capacidad de extraer representaciones internas del LM sobre secuencias de habla para análisis o probing.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales de texto, visión ni audio de entrada directa (requiere el pipeline HuBERT + k-means).
- No se declaran capacidades multilingües; el entrenamiento es exclusivamente en ingles.

## Casos de uso

- Investigacion en tokenizacion de habla: comparar el efecto de K (128 a 1024) sobre la perplejidad de validación en LibriSpeech, replicando los experimentos del artículo de Interspeech 2025.
- Evaluacion de modelos de lenguaje del habla: usar la log-verosimilitud por locución como métrica para comparar tokenizadores o segmentaciones alternativas.
- Deteccion de anomalías acústicas: puntuar locuciones con baja verosimilitud para identificar audio degradado, ruido o habla fuera de dominio, aprovechando que el modelo se entrenó solo con habla limpia de LibriSpeech.
- Filtrado de corpus de habla: ordenar un conjunto de audios por verosimilitud bajo el modelo para seleccionar muestras de alta calidad para otros entrenamientos.
- Baseline académico reproducible: servir como referencia en papers de speech LM gracias a la publicación de pesos, centroides y resultados de entrenamiento en formato JSON.
- Analisis de representaciones: extraer estados ocultos del OPT sobre unidades de habla para estudiar qué información fonética o léxica codifica el modelo en cada capa.
- Prototipado de pipelines de audio discreto: integrar el tokenizador HuBERT + k-means en sistemas que necesiten convertir habla en secuencias discretas para modelos downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona ficheros `*_results.json` con resultados de entrenamiento en cada rama, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni métricas de habla (WER, perplejidad) en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 1,9 GB en total e incluye las cuatro variantes, por lo que cada modelo individual es sustancialmente menor y cabe en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM deberia bastar para una variante individual; no se especifican modelos concretos en la documentacion.
- Cabe en GPU de consumo: previsiblemente si (RTX 3060, RTX 4060, RTX 4090), dado el tamano del repositorio y la arquitectura OPT de 12 capas.
- Opciones de despliegue: el ejemplo oficial usa `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`) junto con `torchaudio` para HuBERT y `safetensors` para los centroides. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El cuello de botella practico sera la extraccion de características de HuBERT BASE y el calculo de distancias a los centroides, no el propio LM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpeechLM-librispeech (este) | OPT 12 capas (recuento exacto no disponible) | 2048 unidades (~40 s de audio a 20 ms) | Habla discreta (HuBERT + k-means) | no disponible | Hugging Face, 4 ramas |
| GSLM ( Generative Spoken Language Modeling, Meta) | no disponible | no disponible | Habla discreta (HuBERT + k-means) | no disponible | Codigo y pesos publicos |
| AudioLM (Google) | no disponible | no disponible | Audio y habla | no disponible (no publicado) | No disponible publicamente |
| HuBERT BASE (torchaudio) | ~95 M | no aplica (encoder) | Audio | MIT (torchaudio) | torchaudio pipelines |

La comparacion con GSLM es la mas directa por compartir el enfoque de unidades discretas sobre HuBERT; AudioLM es una referencia conceptual pero no ofrece pesos publicos. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con LibriSpeech (habla leida en ingles, condiciones acusticas controladas); el rendimiento fuera de dominio (habla espontanea, ruido, otros idiomas) no esta caracterizado.
- No es un modelo de reconocimiento de voz: no transcribe audio a texto, solo asigna verosimilitud a secuencias de unidades.
- Requiere el pipeline completo (HuBERT BASE + k-means) para funcionar; no acepta audio crudo de forma nativa.
- La licencia no esta declarada en la model card, lo que impide confirmar si el uso comercial esta permitido. Verificar antes de cualquier despliegue en produccion.
- Solo se publica la semilla 0 de las tres que promedia el articulo, por lo que los resultados pueden diferir ligeramente de las cifras reportadas en el paper.
- Sin datos de sesgo, alucinacion o robustez; al ser un modelo de investigacion, no se han realizado evaluaciones de seguridad.
- El contexto de 2048 unidades se reduce tras fusionar repeticiones consecutivas, por lo que la duracion efectiva de audio modelable varia según la tasa de repeticion.
- No hay garantia de mantenimiento ni soporte por parte de la comunidad BabyLM-community.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BabyLM-community/SpeechLM-librispeech
- Paper (Interspeech 2025): https://www.isca-archive.org/interspeech_2025/kando25_interspeech.pdf
- Repositorio SpeechLM: https://github.com/mynlp/speechlm
- Dataset LibriSpeech ASR: https://huggingface.co/datasets/openslr/librispeech_asr
- DOI del paper: https://doi.org/10.21437/Interspeech.2025-310
