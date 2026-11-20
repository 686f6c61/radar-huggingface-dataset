# Sadanie/pellav3-audio-deepfake-detector

## Resumen

Pellav3 es un detector de deepfakes de audio desarrollado por Sadanie (Pella Research) que clasifica clips de voz como reales o sintéticos. El modelo procesa cada clip mediante dos vistas complementarias —la forma de onda cruda y el espectrograma mel—, codifica cada una en una secuencia de tramas, fusiona ambas secuencias trama a trama y aplica attentive statistics pooling para producir una puntuación única de probabilidad de falsedad. Con 1.540 millones de parámetros y entrada a 16 kHz, se posiciona como una herramienta de anti-spoofing para pipelines de verificación de voz.

El modelo se publica bajo licencia MIT, lo que permite uso comercial sin restricciones de atribución más allá de la propia licencia, y está orientado exclusivamente al idioma inglés según los metadatos del repositorio. El repositorio pesa 6,2 GB en pesos fp32 (`pellav3_detector.pt`) e incluye un script de inferencia listo para ejecutar (`pellav3_infer.py`) que imprime la probabilidad de falsedad por clip y etiqueta como FAKE a partir de un umbral de 0,5.

Es relevante ahora porque la detección de audio sintético se ha convertido en una necesidad operativa para plataformas de verificación de identidad, medios y telemedicina, y porque el enfoque de fusión multimodal (waveform + mel) es una alternativa a los detectores basados únicamente en características espectrales. Su versión anterior, Pellav2, data de agosto de 2026, lo que indica una cadencia de iteración relativamente rápida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Doble codificador (waveform + espectrograma mel) con fusión trama a trama y attentive statistics pooling |
| Parametros totales | 1,54 mil millones (1.540 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de audio a 16 kHz; duración máxima no especificada) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, fp32) |

## Arquitectura y entrenamiento

La arquitectura combina dos ramas de codificación en paralelo: una sobre la forma de onda cruda y otra sobre el espectrograma mel. Cada rama produce una secuencia de tramas; ambas secuencias se fusionan trama a trama en un único flujo que, mediante attentive statistics pooling, se agrega en una representación global a partir de la cual se emite la puntuación de falsedad. El modelo opera con audio de entrada a 16 kHz y cuenta con 1,54 mil millones de parámetros. El autor no detalla en la model card el número de capas, la dimensión oculta ni el mecanismo exacto de fusión.

No se ha publicado información sobre el volumen de tokens de audio, la composición del dataset de entrenamiento, el uso de RLHF/DPO ni innovaciones adicionales como decodificación especulativa o atención lineal. Tampoco se especifica si el modelo se entrenó desde cero o mediante ajuste fino de un codificador preentrenado. El script de inferencia depende de `torch`, `torchaudio`, `transformers==4.48.3`, `numpy`, `scipy`, `pyloudnorm` y `huggingface_hub`, y requiere `ffmpeg` en el PATH.

## Capacidades

- Clasificación binaria de audio como real o sintético (deepfake), con salida de probabilidad `p_fake` por clip.
- Detección de spoofing de voz (anti-spoofing) orientada a sistemas de verificación biométrica.
- Procesamiento conjunto de dominio temporal (waveform) y frecuencial (mel spectrogram) en una sola pasada.
- Umbral de decisión configurable: el script etiqueta como FAKE con `p_fake >= 0,5`.
- Entrada de audio a 16 kHz; el script gestiona la carga y el preprocesado del clip.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento; es un clasificador, no un modelo generativo.
- Capacidad multilingüe no documentada; los metadatos solo declaran inglés.

## Casos de uso

- Verificación de identidad por voz: integrar el detector como paso previo a la autenticación biométrica para rechazar grabaciones sintetizadas antes de comparar el locutor con la plantilla registrada.
- Moderación de contenido en plataformas de audio: puntuar clips subidos por usuarios y marcar automáticamente aquellos con `p_fake` alto para revisión humana, usando el umbral de 0,5 como filtro de primera línea.
- Verificación periodística de material sonoro: analizar entrevistas o filtraciones recibidas por redacciones para descartar audio generado antes de su publicación.
- Detección de fraude en atención al cliente telefónica: procesar grabaciones de llamadas sospechosas de suplantación y priorizar alertas cuando el detector marque el clip como sintético.
- Investigación en forense de audio: usar el modelo como línea base o componente de un ensemble en estudios sobre detección de voz sintética, aprovechando la licencia MIT para modificar y redistribuir.
- Filtrado en datasets de entrenamiento de TTS/ASR: descartar muestras sintéticas o contaminadas antes de entrenar modelos de voz, reduciendo el riesgo de realimentación de datos generados.
- Auditoría de pipelines de generación de voz: validar la calidad de un sistema TTS propio comprobando qué proporción de sus salidas detecta como falsas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como EER, AUC, accuracy ni comparaciones con conjuntos de evaluación estándar de anti-spoofing (ASVspoof, In-the-Wild, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y del codificador mel; en la práctica se recomienda al menos 8-10 GB de VRAM para procesar clips con comodidad.
- Cuantización: no se publican versiones GGUF, int8 ni int4; el despliegue estándar es fp32 en PyTorch.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3070/4060 Ti en adelante); para lotes grandes o procesamiento por lotes, A100 o H100.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM en fp32; no se documenta una ruta de CPU ni de cuantización para reducir requisitos.
- Opciones de despliegue: el autor solo proporciona `pellav3_infer.py` (PyTorch + torchaudio). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, lo cual es esperable al tratarse de un clasificador de audio y no de un modelo generativo de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo orientativo, los detectores de anti-spoofing habituales de la literatura (AASIST, RawNet2, Wav2Vec2-based classifiers) suelen tener entre 0,1 y 300 millones de parámetros, muy por debajo de los 1.540 M de Pellav3, pero no se ha publicado ninguna comparación directa con ellos.

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Pellav3 | 1.540 M | audio 16 kHz | MIT | Hugging Face |
| Pellav2 | no disponible | audio | no disponible | Hugging Face |
| AASIST | ~0,3 M | audio | no disponible | no disponible |
| RawNet2 | ~0,02 M | audio | no disponible | no disponible |

## Limitaciones y advertencias

- Solo se declara soporte para inglés; el rendimiento en otros idiomas no está documentado y podría degradarse.
- No se publican métricas de evaluación (EER, AUC) ni detalles del dataset de entrenamiento, lo que impide estimar su robustez frente a ataques no vistos.
- Riesgo de falsos positivos en voces con características atípicas (síntesis vocales, patologías, ruido de canal) no cuantificado.
- El umbral fijo de 0,5 puede no ser adecuado para todos los dominios; en producción conviene calibrarlo con datos propios.
- Al ser un clasificador binario, no identifica el sistema TTS/VC utilizado ni proporciona explicabilidad sobre la decisión.
- La licencia MIT permite uso comercial, pero no se ofrece ninguna garantía; el autor no documenta sesgos demográficos ni de acento.
- El repositorio incluye solo pesos fp32 (6,2 GB) y un script de inferencia; no hay versiones optimizadas ni API alojada documentada (el contacto para API es por correo).
- Dependencia de `ffmpeg` y de una versión concreta de `transformers` (4.48.3), lo que puede complicar la integración en entornos con restricciones de versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sadanie/pellav3-audio-deepfake-detector
- Versión anterior (Pellav2): https://huggingface.co/Sadanie/pellav2-audio-deepfake-detector
- Contacto del autor: info@pellaresearch.com
