# AntonisAgp/whisper-tiny-indian

## Resumen

Whisper Tiny Indian English es un ajuste fino (fine-tuning) del modelo `openai/whisper-tiny` realizado por el usuario AntonisAgp sobre el conjunto de datos `naharte/indian_english`, orientado al reconocimiento automático de voz (ASR) de inglés con acento indio. El modelo conserva la arquitectura encoder-decoder transformer propia de la familia Whisper de OpenAI, con 37.760.640 parámetros totales, y se distribuye en formato safetensors bajo licencia Apache 2.0.

El problema que aborda es la degradación del rendimiento de Whisper en variantes dialectales del inglés: los modelos genéricos de OpenAI, entrenados mayoritariamente con inglés estadounidense, cometen más errores sobre hablantes de inglés indio. Este ajuste busca especializar el decodificador en esa variedad sin aumentar el tamaño del modelo, lo que lo hace atractivo para despliegues con recursos limitados.

Es relevante por su tamaño reducido (0,3 GB de repositorio) y su bajo coste computacional, que permite ejecución en CPU o GPU de gama baja, aunque con un WER de 10,54 % en el conjunto de test que debe interpretarse con cautela dado que el autor no ha verificado la métrica y la model card está generada automáticamente, sin documentación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (ventana de audio de 30 s en Whisper; no confirmado en la ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con conversión a GGUF/ONNX no documentada por el autor) |
| Idiomas soportados | en (inglés, con especialización en inglés indio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-tiny`, un transformer encoder-decoder con atención completa, diseñado originalmente para transcripción y traducción de voz multilingüe. El ajuste fino se realizó con la librería Transformers 5.23.0.dev0 y PyTorch 2.11.0+cu130, sobre el dataset `naharte/indian_english`. Los hiperparámetros documentados son: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluación de 1, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-08), scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento.

No se documenta el número de tokens de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un fine-tuning de ASR supervisado). Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el modelo es un ajuste convencional de pesos completos. La model card advierte explícitamente que fue generada automáticamente y que las secciones de descripción, usos previstos y datos de entrenamiento están sin completar ("More information needed").

## Capacidades

- Reconocimiento automático de voz (transcripción) en inglés, con especialización en acento indio.
- Transcripción de audio de hasta 30 segundos por ventana, según el diseño original de Whisper (no confirmado explícitamente en la ficha).
- Generación de texto a partir de audio mediante el decodificador autoregresivo de Whisper.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.
- No se documentan capacidades de visión, audio adicional (más allá de ASR) ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Transcripción de reuniones y llamadas de equipos con hablantes de inglés indio: el ajuste fino reduce el sesgo hacia el inglés estadounidense, lo que mejora la fidelidad en entornos corporativos con plantillas distribuidas en India.
- Subtitulado automático de vídeos y pódcast con acento indio: el tamaño reducido (37,7 M de parámetros) permite procesar audio en tiempo casi real en CPU, adecuado para pipelines de generación de subtítulos por lotes.
- Atención al cliente en centros de contacto externalizados: transcripción de grabaciones de llamadas para análisis de calidad y extracción de intenciones, con un coste de inferencia muy bajo frente a modelos ASR de mayor tamaño.
- Prototipado rápido de aplicaciones de voz: al caber en GPU de consumo y en CPU, sirve para validar productos de dictado o asistentes de voz antes de invertir en modelos mayores.
- Investigación en ASR dialectal: punto de partida para experimentos de adaptación de dominio y comparación de técnicas de fine-tuning sobre variedades del inglés.
- Transcripción de material educativo y académico de hablantes indios: útil en plataformas de e-learning que necesitan indexar clases grabadas con acento local.
- Despliegue en dispositivos con recursos limitados: el reducido número de parámetros permite ejecución en entornos edge o en contenedores sin GPU dedicada, siempre que la precisión exigida sea moderada.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados, `verified: false`):

| Benchmark | Dataset | Métrica | Valor |
|---|---|---|---|
| ASR | naharte/indian_english (split test) | WER | 10,5422 % |
| Validación (época 1, paso 1000) | naharte/indian_english | WER | 11,9578 % |
| Validación (época 2, paso 2000) | naharte/indian_english | WER | 10,5422 % |
| Validación (paso 2000) | naharte/indian_english | Loss | 0,2581 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (37,7 M de parámetros, ~151 MB de pesos), y alrededor de 40-80 MB en cuantización de 8 o 4 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 y H100, aunque estas últimas están sobredimensionadas para su tamaño.
- Cabe en GPU de consumo y en CPU: la inferencia en CPU es viable para audio corto, con latencia dependiente del hardware.
- Opciones de despliegue: Transformers (pipeline `automatic-speech-recognition`), y previsiblemente vLLM, TGI, llama.cpp u Ollama tras conversión a los formatos correspondientes, aunque el autor no documenta estas integraciones.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | WER (inglés indio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper Tiny Indian English (este modelo) | 37,7 M | no disponible (30 s por diseño Whisper) | 10,54 % (no verificado) | Apache 2.0 | HuggingFace |
| openai/whisper-tiny | 39 M | 30 s | no disponible en esta ficha | Apache 2.0 | HuggingFace |
| openai/whisper-base | 74 M | 30 s | no disponible en esta ficha | Apache 2.0 | HuggingFace |
| openai/whisper-small | 244 M | 30 s | no disponible en esta ficha | Apache 2.0 | HuggingFace |

No se dispone de datos de WER comparativos de los modelos base sobre el mismo conjunto de test en la información proporcionada; la comparación se limita a tamaño, licencia y disponibilidad.

## Limitaciones y advertencias

- La métrica WER de 10,54 % está marcada como no verificada (`verified: false`) y procede únicamente del autor; no ha sido validada de forma independiente.
- La model card está generada automáticamente y las secciones de descripción, usos previstos y datos de entrenamiento están vacías, lo que impide conocer la composición y el tamaño real del dataset de ajuste.
- Especialización estrecha: el ajuste se centra en inglés indio, por lo que el rendimiento en otras variedades del inglés o en otros idiomas puede degradarse respecto al modelo base.
- Riesgo de alucinación en ASR: como todo modelo Whisper, puede generar texto plausible en segmentos con ruido, silencios o audio de baja calidad.
- Sesgos potenciales derivados del dataset de ajuste, cuya procedencia y balance demográfico no se documentan.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el modelo en el dominio de producción antes de desplegarlo.
- Solo se declara soporte de inglés; no se garantiza el comportamiento multilingüe del Whisper original.
- El repositorio tiene 22 descargas y 0 likes, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AntonisAgp/whisper-tiny-indian
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de ajuste: https://huggingface.co/datasets/naharte/indian_english
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
