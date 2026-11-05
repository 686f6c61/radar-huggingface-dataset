# notaneimu/titanet-s-optimized-onnx

## Resumen

TitaNet-S Optimized and Tuned (ONNX) es una exportación a ONNX del modelo TitaNet-S de NVIDIA NeMo, orientada a verificación de hablante (speaker verification) en CPU sobre audio corto. El autor, notaneimu, publica dos grafos FP32 de 23,84 MB cada uno con un frontend de forma de onda incluido: una variante "optimized" que reproduce el TitaNet-S preentrenado con optimizaciones de exportación sin pérdida, y una variante "tuned" afinada específicamente para verificación con consultas de 1 a 5 segundos. Cada grafo devuelve un único vector de 192 dimensiones para todo el clip.

El modelo resuelve el problema de obtener embeddings de hablante ligeros y desplegables sin PyTorch ni NeMo: solo requiere NumPy, ONNX Runtime y SoundFile. Está pensado para inferencia en CPU con latencias de milisegundos de un solo dígito en clips de 1 a 3 segundos, lo que lo hace adecuado para pipelines de diarización, autenticación por voz o control de acceso donde no hay GPU disponible.

Es relevante porque reduce la barrera de despliegue de un sistema de verificación biométrica a un par de ficheros ONNX y un script de inferencia, con benchmarks de EER medidos localmente sobre VoxCeleb, Common Voice, LibriSpeech y reuniones de YouTube. La licencia Apache 2.0 facilita su integración comercial, si bien las métricas publicadas son sondas locales del autor y no listas oficiales de trials.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TitaNet-S: convoluciones depthwise-separable con squeeze/excitation y attentive pooling (red de embeddings de hablante) |
| Parametros totales | no disponible (grafo ONNX de 23,84 MB en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio recomendada de 1 a 5 s para consultas (verificación en 0,25–10 s) |
| Tipos de cuantizacion | no disponible (solo se publican pesos FP32) |
| Idiomas soportados | no disponible (modelo de hablante, independiente del idioma en teoría) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), FP32 |

## Arquitectura y entrenamiento

La arquitectura subyacente es TitaNet-S de NVIDIA NeMo, una red de embeddings de hablante basada en convoluciones depthwise-separables con bloques de squeeze/excitation y attentive pooling, que agrega la secuencia temporal en un único vector de 192 dimensiones para todo el clip. El autor exporta la topología a ONNX opset 17 en FP32 e incluye el frontend de forma de onda dentro del grafo, de modo que la entrada es directamente PCM mono a 16 kHz float32 con forma `[1, samples]` y la salida es `[1, 192]` sin normalizar.

No se detalla en la información disponible el volumen de tokens de audio ni la composición completa del dataset de preentrenamiento original de TitaNet-S. La variante "tuned" se afina sobre VoxCeleb, Common Voice y LibriSpeech, con selección de pesos sobre resultados de desarrollo antes de la verificación con reuniones. La innovación destacable es la optimización de exportación a CPU: el autor reporta latencias inferiores a las del TitaNet-S ONNX de referencia y muy por debajo del modelo B0 en las mismas condiciones.

## Capacidades

- Extracción de embeddings de hablante: genera un vector de 192 dimensiones L2-normalizable por clip de audio.
- Verificación de hablante (1:1): comparación por similitud coseno entre vector de enrollment y vector de consulta.
- Identificación de hablante (1:N): búsqueda del hablante más cercano en una galería de embeddings precalculados.
- Procesamiento de audio corto: calidad medida en consultas de 1 a 5 s, con comprobaciones de runtime de 0,25 a 10 s.
- Inferencia en CPU sin PyTorch ni NeMo: solo ONNX Runtime, NumPy y SoundFile.
- Reutilización de sesión ONNX para comparar múltiples clips con un único encoder cargado.
- No soporta tool calling, agentes, visión, audio generativo ni razonamiento multi-paso; es un extractor de embeddings, no un modelo de lenguaje.

## Casos de uso

- Autenticación por voz en aplicaciones móviles o de escritorio: el modelo devuelve un vector de 192 dimensiones que se compara por similitud coseno contra el enrollment del usuario, con latencias de 2 a 3 ms en CPU para clips de 1 s, lo que permite verificación en tiempo real sin GPU.
- Diarización de reuniones y transcripciones: extraer embeddings por segmento de habla y agrupar por similitud para etiquetar hablantes en grabaciones de YouTube o reuniones, con EER medido de 1,4–2,2 % en clips de 4–5 s según los datos del autor.
- Control de acceso físico o lógico: puertas, salas o paneles que verifican la identidad del hablante contra una plantilla almacenada, usando la variante tuned para consultas cortas de 1 a 3 s.
- Enrutamiento de llamadas en centros de contacto: identificar al cliente o al agente en los primeros segundos de una llamada para dirigir la conversación al flujo adecuado, aprovechando la ventana corta de 1–5 s.
- Detección de suplantación o anomalías en grabaciones: comparar el embedding de una muestra sospechosa con el enrollment de referencia y aplicar un umbral calibrado sobre datos de desarrollo propios.
- Preprocesado para pipelines de ASR multi-hablante: generar embeddings de hablante por turno y adjuntarlos a la transcripción para atribución de interlocutor en sistemas de subtitulado o análisis de reuniones.
- Indexación y búsqueda por voz en archivos de audio: calcular embeddings de todos los clips de un archivo y construir un índice vectorial para recuperar segmentos de un hablante concreto.

## Benchmarks y rendimiento

EER % (menor es mejor), medido por el autor sobre sondas locales. No son listas oficiales de trials.

| Dataset | Modelo | 1 s | 2 s | 3 s | 4 s | 5 s |
|---|---|---:|---:|---:|---:|---:|
| VoxCeleb | Original B0 | 12,000 | 5,612 | 4,000 | 4,000 | 3,735 |
| VoxCeleb | Optimized | 8,000 | 2,449 | 3,653 | 2,000 | 1,633 |
| VoxCeleb | Tuned | 8,000 | 2,429 | 2,367 | 2,082 | 2,000 |
| Common Voice | Original B0 | 6,000 | 3,187 | 3,000 | 2,000 | 2,000 |
| Common Voice | Optimized | 6,000 | 4,000 | 4,970 | 3,000 | 3,000 |
| Common Voice | Tuned | 5,889 | 3,000 | 3,000 | 2,051 | 2,000 |
| LibriSpeech | Original B0 | 1,600 | 0,425 | 0,342 | 0,092 | 0,100 |
| LibriSpeech | Optimized | 0,500 | 0,100 | 0,058 | 0,033 | 0,000 |
| LibriSpeech | Tuned | 0,475 | 0,400 | 0,042 | 0,025 | 0,000 |
| YouTube meetings | Original B0 | 8,666 | 3,449 | 2,117 | 2,003 | 1,597 |
| YouTube meetings | Optimized | 8,678 | 3,720 | 2,219 | 1,636 | 1,375 |
| YouTube meetings | Tuned | 7,303 | 3,358 | 1,997 | 1,667 | 1,597 |

Latencia CPU (milisegundos en caliente, AMD Ryzen 9 5950X, ONNX Runtime 1.31.1 CPU, batch uno):

| Modelo | Hilos | 1 s | 2 s | 3 s | 4 s | 5 s |
|---|---:|---:|---:|---:|---:|---:|
| Referencia TitaNet-S ONNX | 4 | 3,10–3,26 | 5,53–5,54 | 7,94–7,98 | 10,35 | 12,56–12,61 |
| Optimized | 4 | 2,65–3,00 | 4,69–4,71 | 6,88 | 8,96–9,02 | 11,30 |
| Tuned | 4 | 2,64–2,68 | 4,69–4,73 | 6,84–6,85 | 8,87–9,01 | 11,28 |
| Original B0 | 4 | 5,61 | 7,86–7,90 | 10,63–10,70 | 13,68–13,78 | 16,50–16,53 |
| Referencia TitaNet-S ONNX | 8 | 2,42–2,44 | 4,01–4,47 | 5,49–5,50 | 6,91–8,00 | 8,32–9,53 |
| Optimized | 8 | 1,87–2,13 | 3,17–3,59 | 4,56–5,08 | 6,41–6,64 | 7,33–8,04 |
| Tuned | 8 | 1,85–1,86 | 3,17–3,79 | 4,61–4,65 | 6,53–6,59 | 7,30–8,19 |
| Original B0 | 8 | 5,24–7,46 | 6,67–6,69 | 8,67–10,08 | 10,77–17,07 | 17,18–19,70 |

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para CPU. El grafo FP32 ocupa 23,84 MB en disco y una cantidad similar en memoria al cargarse.
- GPU: no necesaria. Cualquier GPU compatible con ONNX Runtime serviría, pero el autor no publica métricas de GPU.
- CPU: funciona en cualquier x86-64 moderno; las latencias medidas usan un AMD Ryzen 9 5950X con 4 u 8 hilos.
- Cabe en cualquier equipo consumer, incluidos portátiles de gama baja y dispositivos edge, dado el tamaño del grafo y la ausencia de dependencias pesadas.
- Despliegue: ONNX Runtime (CPU), con un wrapper Python (`SpeakerEmbedder`) incluido en el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 1,85–3,26 ms para clips de 1 s y 7,30–12,61 ms para clips de 5 s según hilos y variante; throughput no publicado explícitamente, pero implicado por estas latencias en batch uno.

## Comparativa con modelos similares

| Modelo | Tipo | Embedding | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TitaNet-S Optimized (este) | TitaNet-S ONNX FP32 | 192 dim | 0,25–10 s (calidad 1–5 s) | Apache 2.0 | HuggingFace |
| TitaNet-S Tuned (este) | TitaNet-S ONNX FP32 afinado | 192 dim | 0,25–10 s (calidad 1–5 s) | Apache 2.0 | HuggingFace |
| TitaNet-S original (NeMo) | TitaNet-S PyTorch | 192 dim | no disponible | Apache 2.0 (NeMo) | NGC / NeMo |
| Original B0 (control del autor) | Modelo de embeddings de hablante | no disponible | no disponible | no disponible | no incluido en el repo |

El autor usa el modelo B0 como control de tiempos y de EER, pero no incluye sus pesos ni especifica su procedencia exacta en la información disponible. No se dispone de comparación con ECAPA-TDNN, x-vector ni WavLM en los datos proporcionados.

## Limitaciones y advertencias

- Las métricas de EER son sondas locales del autor, no listas oficiales de trials; los resultados describen un diagnóstico repetidamente inspeccionado, no un test intacto.
- El solapamiento del preentrenamiento original con los conjuntos de evaluación es desconocido; un EER de 0,000 no implica reconocimiento perfecto.
- Las etiquetas de las reuniones de YouTube son diarización automática no revisada y las consultas son prefijos de turno de hablante (oracle), lo que puede inflar los resultados.
- No se debe mezclar la variante tuned y la optimized para enrollment y consulta: hay que reencodificar los enrollments existentes si se cambia de variante.
- El modelo está pensado para habla de un solo hablante; se requiere VAD, downmix y remuestreo a 16 kHz mono float32 antes de la inferencia.
- El umbral de similitud debe calibrarse sobre datos de desarrollo propios; no se proporciona un umbral por defecto.
- No hay información sobre sesgos demográficos, de acento o de idioma; el rendimiento puede degradarse en condiciones acústicas distintas a las de los conjuntos de evaluación.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.
- El repositorio figura con tamaño 0,0 GB, lo que puede indicar que los pesos no están subidos o que el tamaño se redondea; conviene verificar la disponibilidad real de los ficheros ONNX antes de integrarlo.

## Enlaces

- HuggingFace: https://huggingface.co/notaneimu/titanet-s-optimized-onnx
- Modelo original TitaNet en NVIDIA NeMo: no disponible en la información proporcionada
- Paper de TitaNet: no disponible en la información proporcionada
- Repositorio de código del autor: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
