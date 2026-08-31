# GlowLED/whisper-tiny-minds14-en

## Resumen

GlowLED/whisper-tiny-minds14-en es un modelo de reconocimiento automático de voz (ASR) basado en un fine-tuning de `openai/whisper-tiny` sobre el subconjunto en inglés de Estados Unidos del dataset `PolyAI/minds14`. El modelo, desarrollado por el usuario GlowLED, tiene 37,7 millones de parámetros y está orientado a la transcripción de audio conversacional en inglés. Su relevancia radica en que ofrece un rendimiento aceptable (WER normalizado de 0,2341) con un tamaño muy reducido, lo que lo hace apto para despliegues en entornos con recursos limitados, como edge computing o aplicaciones embebidas.

La arquitectura es la del Whisper original: un transformer encoder-decoder con 4 capas en cada bloque y una dimensión oculta de 384. El fine-tuning se realizó únicamente con los primeros 450 ejemplos del conjunto de entrenamiento de Minds14 en-US, lo que implica una cantidad muy limitada de datos. A pesar de ello, el modelo consigue superar el umbral de WER de 0,37 fijado como referencia en la model card, lo que sugiere que la adaptación al dominio de conversaciones telefónicas con acento americano es efectiva para un modelo de este tamaño.

El modelo se distribuye en formato safetensors y es compatible con la librería `transformers` mediante las clases `WhisperForConditionalGeneration` y `WhisperProcessor`. No se especifica licencia, lo que limita su uso en proyectos comerciales sin autorización expresa del autor. Es un candidato interesante para prototipos y pruebas de concepto, pero su generalización a otros acentos o dominios no está garantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (ventana de Whisper) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (fine-tune sobre en-US; el modelo base Whisper soporta 99 idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper de OpenAI: un transformer encoder-decoder con normalización previa, atención multi-cabeza y embeddings posicionales aprendidos. En su versión tiny, dispone de 4 capas en el encoder y 4 en el decoder, con 6 cabezas de atención y una dimensión de modelo de 384. La entrada es un espectrograma log-Mel de 80 canales con ventanas de 30 segundos, y la salida es una secuencia de tokens de texto.

El entrenamiento consistió en un fine-tuning supervisado sobre el subconjunto en-US de `PolyAI/minds14`, un dataset de grabaciones de conversaciones telefónicas en varios idiomas. Se utilizaron solo los primeros 450 ejemplos como conjunto de entrenamiento, lo que constituye una cantidad muy reducida de datos. No se menciona el uso de técnicas como RLHF o DPO; se trata de un fine-tuning estándar con pérdida de entropía cruzada. Según repositorios similares encontrados en la búsqueda web, es común congelar el encoder y adaptar únicamente el decoder durante el fine-tuning, aunque no se confirma si esta técnica se aplicó en este modelo concreto.

El proceso de entrenamiento no está documentado en detalle: no se indican hiperparámetros, número de épocas, tasa de aprendizaje ni estrategia de aumento de datos. La única métrica reportada es el WER normalizado de 0,2341 en el conjunto de evaluación, inferior al umbral de 0,37 mencionado en la model card.

## Capacidades

- Transcripción de audio en inglés de Estados Unidos, especialmente en contextos de conversaciones telefónicas (dominio de Minds14).
- Reconocimiento de voz con ventana de audio de 30 segundos, suficiente para frases y turnos de conversación cortos.
- Generación de texto a partir de audio con el tokenizador y procesador estándar de Whisper.
- Compatible con la API de `transformers`, lo que permite integración en pipelines de ASR existentes.
- No incluye capacidades de tool calling, agentes, visión o razonamiento multimodal.
- No se ha reportado soporte para decodificación especulativa ni otras técnicas de inferencia acelerada.

## Casos de uso

- Transcripción de llamadas de atención al cliente: el modelo puede procesar grabaciones de llamadas en inglés y generar transcripciones con un WER aceptable para análisis posterior. Su tamaño reducido permite ejecutarlo en servidores de baja capacidad o en la nube con coste mínimo.
- Subtitulado automático de vídeos cortos: al manejar ventanas de 30 segundos, es adecuado para generar subtítulos en tiempo real o en lote para vídeos de entrevistas o podcasts en inglés.
- Asistentes de voz embebidos: al ocupar menos de 200 MB en memoria, puede desplegarse en dispositivos con recursos limitados (Raspberry Pi, módulos IoT) para comandos de voz básicos.
- Prototipado rápido de sistemas ASR: los desarrolladores pueden usar este modelo como punto de partida para evaluar la viabilidad de un sistema de reconocimiento en inglés antes de invertir en modelos más grandes.
- Análisis de sentimiento en audio: combinado con un clasificador de texto, las transcripciones generadas pueden alimentar pipelines de análisis de opinión en centros de contacto.
- Entrenamiento por transferencia: al ser un modelo pequeño y ligero, puede servir como base para fine-tuning adicional en dominios específicos (jerga técnica, acentos regionales) con pocos recursos computacionales.

## Benchmarks y rendimiento

La model card reporta un único valor de WER normalizado de 0,2341 en el conjunto de evaluación de Minds14 en-US. No se proporcionan otros benchmarks como MMLU, HumanEval o GSM8K, ya que no son aplicables a un modelo de ASR.

| Modelo | WER (normalizado) | Conjunto de evaluación |
|---|---|---|
| GlowLED/whisper-tiny-minds14-en | 0,2341 | Minds14 en-US (evaluación) |
| Echaps12/whisper-tiny-minds14-en | 0,3318 | Minds14 en-US (evaluación) |
| openai/whisper-tiny (sin fine-tune) | No disponible | — |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 150 MB en fp32 (37,76 M × 4 bytes), 75 MB en fp16 y 38 MB en int8. Esto cabe en cualquier GPU consumer, incluso en GPUs integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Para inferencia en CPU, el modelo puede ejecutarse en tiempo real en procesadores modernos.
- Compatible con consumer GPU: sí, desde GTX 1050 en adelante.
- Opciones de despliegue: puede usarse con la librería `transformers` en Python, o exportarse a ONNX para inferencia en runtime optimizado. También es compatible con `llama.cpp` si se convierte a GGUF, y con servidores de inferencia como vLLM o TGI (aunque estos están orientados a modelos de lenguaje, no a ASR).
- Latencia y throughput estimados: no disponibles. En una GPU moderna, la inferencia debería completarse en decenas de milisegundos por audio de 30 segundos, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (Minds14 en-US) | Licencia | Formato |
|---|---|---|---|---|---|
| GlowLED/whisper-tiny-minds14-en | 37,76 M | 30 s audio | 0,2341 | No disponible | safetensors |
| Echaps12/whisper-tiny-minds14-en | 37,76 M (estimado) | 30 s audio | 0,3318 | No disponible | safetensors |
| openai/whisper-tiny (original) | 39 M | 30 s audio | No disponible | MIT | safetensors |

La comparación directa con el modelo original de Whisper no es posible sin datos de WER en Minds14. El fine-tune de GlowLED obtiene un WER significativamente mejor que el de Echaps12 (0,2341 vs 0,3318), probablemente debido a una mejor estrategia de entrenamiento o a una selección de datos distinta. Ambos modelos comparten la misma arquitectura base y tamaño, pero el de GlowLED parece más efectivo para el dominio en-US de Minds14.

## Limitaciones y advertencias

- El modelo se entrenó con solo 450 ejemplos, lo que aumenta el riesgo de overfitting y limita su capacidad de generalización a otros acentos, registros o dominios distintos de las conversaciones telefónicas en inglés americano.
- No se especifica licencia, lo que impide su uso comercial sin autorización explícita del autor. Se recomienda contactar con el propietario antes de integrarlo en productos.
- La ventana de audio de 30 segundos puede ser insuficiente para transcripciones de larga duración, requiriendo segmentación previa del audio.
- El WER reportado (0,2341) es relativamente alto para producción; para tareas críticas se recomienda evaluar con datos propios y considerar modelos más grandes (whisper-small, whisper-base).
- No se han documentado sesgos específicos, pero al estar entrenado en un corpus de acento americano, es probable que tenga un rendimiento inferior con acentos de otras regiones.
- Riesgo de alucinación en silencios o ruido de fondo, común en modelos Whisper pequeños.
- La fecha de creación (2026-08-31) es inusual y podría indicar un error en los metadatos; no afecta al funcionamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GlowLED/whisper-tiny-minds14-en
- Modelo similar (Echaps12): https://huggingface.co/Echaps12/whisper-tiny-minds14-en
- Repositorio de fine-tuning de Whisper-tiny en Minds14 (Debebe-Nigatu): https://github.com/Debebe-Nigatu/whisper-finetune-colab
- Repositorio de integración Whisper-ASR con Minds14 (zanuura): https://github.com/zanuura/Whisper-ASR-Minds14-English
