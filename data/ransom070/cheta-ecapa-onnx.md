# Ransom070/cheta-ecapa-onnx

## Resumen

cheta-ecapa-onnx es una exportación a formato ONNX del modelo speechbrain/spkrec-ecapa-voxceleb, un sistema de reconocimiento y verificación de hablante basado en la arquitectura ECAPA-TDNN y entrenado sobre el corpus VoxCeleb. Lo desarrolla el usuario Ransom070 como componente del proyecto cheta, con el objetivo de ejecutar la extracción de embeddings de hablante sin depender de PyTorch ni de SpeechBrain en tiempo de inferencia. El modelo no introduce pesos nuevos: reutiliza los del modelo original de SpeechBrain y solo cambia el grafo de ejecución.

El problema que resuelve es de despliegue. SpeechBrain arrastra una dependencia pesada de PyTorch, lo que complica el empaquetado en entornos ligeros, aplicaciones de escritorio, servicios en contenedores pequeños o dispositivos con recursos limitados. Al exportar todo el pipeline (front-end de filterbank más encoder ECAPA-TDNN) a un único grafo ONNX, la inferencia puede ejecutarse con ONNX Runtime, lo que reduce el tamaño del stack y facilita el despliegue multiplataforma.

La relevancia es acotada pero clara para quien construya sistemas de diarización, verificación biométrica por voz o identificación de locutores en producción: obtiene embeddings de 192 dimensiones a partir de audio mono a 16 kHz con una fidelidad numérica verificada frente al modelo original (similitud coseno mayor o igual a 0,9999999 en clips de 0,5 a 10 segundos). El repositorio ocupa aproximadamente 0,1 GB y se distribuye con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (embeddings de hablante) exportada a grafo ONNX |
| Parametros totales | no disponible (heredados del modelo base speechbrain/spkrec-ecapa-voxceleb) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio mono a 16 kHz de longitud variable (minimo aproximado de 0,5 s) |
| Tipos de cuantizacion | no disponible (el repo se etiqueta como quantized respecto al base, pero la model card no detalla el esquema) |
| Idiomas soportados | no disponible (independiente del idioma a nivel de arquitectura; entrenado sobre VoxCeleb) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafo único con front-end y encoder) |

## Arquitectura y entrenamiento

El modelo es una exportación del sistema ECAPA-TDNN de SpeechBrain. La arquitectura ECAPA-TDNN (Emphasized Channel Attention, Propagation and Aggregation Time Delay Neural Network) combina capas convolucionales 1D con atención de canal y agregación estadística para producir un embedding de hablante de 192 dimensiones a partir de una secuencia de características acústicas. El grafo ONNX exportado incluye el front-end completo: STFT con ventana Hamming implementada como convolución, banco de filtros mel y normalización de media por frase, seguido del encoder ECAPA-TDNN. La salida equivale a lo que calcula `EncoderClassifier.encode_batch` en SpeechBrain.

Los pesos no se han reentrenado: son los originales del modelo base, entrenado sobre VoxCeleb. No hay información en la documentación proporcionada sobre el número de tokens, la composición exacta del dataset ni sobre etapas de ajuste fino con RLHF o DPO, que en un modelo de reconocimiento de hablante no resultan aplicables en los mismos términos que en un LLM. La innovación técnica destacable es la exportación fiel del pipeline completo a ONNX, verificada numéricamente contra SpeechBrain con similitud coseno mayor o igual a 0,9999999 en clips de entre 0,5 y 10 segundos. El script de exportación se encuentra en `scripts/export_ecapa_onnx.py` del repositorio cheta.

## Capacidades

- Extracción de embeddings de hablante: produce un vector float32 de forma `[1, 192]` a partir de audio mono a 16 kHz, sin normalización L2 (el consumidor debe normalizar si necesita similitud coseno).
- Verificación de hablante: comparación de embeddings mediante similitud coseno para decidir si dos fragmentos de audio pertenecen al mismo locutor.
- Reconocimiento e identificación de hablante: asignación de identidad comparando el embedding contra una galería de referencia.
- Procesamiento de audio de longitud variable: acepta clips desde aproximadamente 0,5 segundos hasta al menos 10 segundos según la validación documentada.
- Inferencia sin PyTorch ni SpeechBrain: el grafo ONNX se ejecuta con ONNX Runtime, lo que habilita despliegues ligeros.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni comportamiento de agente; es un modelo puramente de representación de audio.
- Capacidades multilingües: no documentadas explícitamente, aunque la tarea de representación de hablante es en gran medida independiente del idioma.

## Casos de uso

- Verificación biométrica por voz: el modelo genera embeddings de 192 dimensiones que se comparan por similitud coseno para autenticar a un usuario en un sistema de acceso; su naturaleza ONNX permite integrarlo en servicios ligeros sin arrastrar PyTorch.
- Diarización de reuniones: combinado con un modelo de segmentación de voz, los embeddings permiten agrupar segmentos por locutor y etiquetar quién habla en cada tramo de una grabación.
- Identificación de locutor en atención al cliente: comparar el embedding de una llamada entrante contra una galería de clientes registrados para enrutar la llamada o recuperar el historial asociado.
- Detección de suplantación o locutor no autorizado: en pipelines de antifraude telefónico, verificar si la voz del interlocutor coincide con la del titular declarado.
- Indexación y búsqueda de archivos de audio: generar embeddings para cada fragmento de una fonoteca y permitir búsquedas del tipo "encuentra todos los clips de esta persona" mediante búsqueda vectorial.
- Preprocesado en pipelines de ASR con separación de hablantes: asignar etiquetas de locutor a transcripciones para distinguir turnos en actas automáticas.
- Despliegue en dispositivos de borde o aplicaciones de escritorio: al ejecutarse con ONNX Runtime y ocupar el repositorio unos 0,1 GB, es viable en entornos donde instalar PyTorch completo resulta excesivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la fidelidad de la exportación: similitud coseno mayor o igual a 0,9999999 entre los embeddings ONNX y los de SpeechBrain en clips de 0,5 a 10 segundos. No se proporcionan métricas de EER, accuracy de verificación ni resultados sobre VoxCeleb u otros conjuntos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras concretas; el repositorio completo ocupa aproximadamente 0,1 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer moderna e incluso en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU con al menos unos pocos GB de memoria libre es suficiente (RTX 3060, RTX 4090, A100, H100), aunque para esta carga la GPU no es imprescindible.
- Cabe en GPU consumer: sí, con amplio margen; también es viable en CPU para cargas moderadas.
- Opciones de despliegue: ONNX Runtime (principal), y cualquier runtime compatible con ONNX; no aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a LLM.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Embedding | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| cheta-ecapa-onnx | ECAPA-TDNN (ONNX) | 192 dims | ONNX | Apache-2.0 | Exportación sin PyTorch; fidelidad verificada frente a SpeechBrain |
| speechbrain/spkrec-ecapa-voxceleb | ECAPA-TDNN | 192 dims | PyTorch/SpeechBrain | Apache-2.0 | Modelo base original; requiere PyTorch y SpeechBrain |
| Otros modelos de reconocimiento de hablante (p. ej. x-vector, ResNet-based) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la información proporcionada para una comparación cuantitativa |

## Limitaciones y advertencias

- Es una exportación, no un modelo nuevo: hereda cualquier sesgo o limitación del modelo base entrenado sobre VoxCeleb, cuya composición demográfica condiciona el rendimiento en poblaciones subrepresentadas.
- El embedding de salida no está normalizado L2; quien lo consuma debe aplicar la normalización antes de calcular similitud coseno para evitar resultados incorrectos.
- La validación documentada cubre clips de 0,5 a 10 segundos; el comportamiento fuera de ese rango no está verificado explícitamente.
- Requiere audio mono a 16 kHz; el remuestreo y la conversión a mono deben hacerse antes de la inferencia.
- No hay métricas publicadas de EER ni de precisión de verificación, por lo que el rendimiento en producción debe validarse contra el propio conjunto de datos.
- La model card no detalla el esquema de cuantización aplicado, pese a la etiqueta `base_model:quantized`; conviene verificar la precisión numérica en el caso de uso concreto.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del corpus VoxCeleb en el contexto de aplicación.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de adopción ni de mantenimiento continuado por parte de la comunidad.
- Al tratarse de biometría vocal, su uso en producción debe cumplir la normativa aplicable de protección de datos (RGPD en la UE) y contar con base legal para el tratamiento de datos biométricos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ransom070/cheta-ecapa-onnx
- Modelo base: https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb
- Repositorio cheta: https://github.com/Ransom070400/cheta
