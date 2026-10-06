# GoodnotesLtd/nemotron-3-diarization-windows-x64-intel-onnx

## Resumen

Nemotron 3 diarization — Windows x64 Intel NPU FP16 es una representación ONNX del modelo de diarización de hablantes Nemotron 3 Diarization de NVIDIA, publicada por GoodnotesLtd. Su objetivo es ejecutar la tarea de "quién habló y cuándo" sobre hardware Intel con unidad de procesamiento neuronal (NPU) en Windows x64, aprovechando el backend OpenVINO de ONNX Runtime. No es un modelo nuevo entrenado desde cero, sino una conversión y optimización de los pesos FP16 originales para que el grafo sea compatible con la ruta de ejecución NPU de Windows ML.

El problema que resuelve es de infraestructura: los pesos originales dependían de nodos contrib específicos de ONNX Runtime (`RotaryEmbedding` y `SkipLayerNormalization`, 62 de cada uno) que la ruta NPU no soporta. Esta versión expande esos nodos a operadores ONNX estándar y fija formas de entrada estáticas, manteniendo los pesos FP16 intactos. El grafo y su fichero de datos externos van anclados por SHA-256 en un `manifest.json`. El repositorio ocupa 0,2 GB y se distribuye bajo licencia openmdw-1.1.

Su relevancia es doble: por un lado demuestra que la diarización de hablantes puede correr íntegramente en una NPU Intel con aceleración real y sin fallback a CPU, y por otro ofrece métricas medidas en el dominio AMI que permiten comparar la ruta NPU frente a la ruta CPU con datos concretos de DER (Diarization Error Rate) y factor de tiempo real (RTF).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con nodos `RotaryEmbedding` y `SkipLayerNormalization` (62 de cada uno) expandidos a operadores ONNX estándar; topología detallada no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de audio; usa formas de entrada fijas y chunks en la versión upstream) |
| Tipos de cuantizacion | FP16 (pesos originales preservados); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | ONNX con fichero sidecar de datos externos; anclaje SHA-256 en `manifest.json` |

## Arquitectura y entrenamiento

La information disponible no describe el entrenamiento del modelo base (número de tokens, composición del dataset, si hubo RLHF/DPO). Lo que sí se detalla es la intervención sobre el grafo: se parte de los pesos FP16 de `onnx-community/Nemotron-3-Diarization-ONNX` (commit `353b6f8ad2cac3580e982d7fbdf0a010786b0406`) y se reescriben 62 nodos `RotaryEmbedding` y 62 nodos `SkipLayerNormalization` como operadores ONNX estándar. El objetivo es que el grafo pueda ejecutarse en la ruta NPU de Windows ML, que exige formas de entrada fijas y no admite nodos contrib personalizados.

El resultado se valida con perfilado de ONNX Runtime: en una muestra de cinco segundos se registra un único kernel del proveedor OpenVINO y ningún nodo del proveedor CPU para cada grafo. La preparación de audio y el procesamiento de hablantes fuera de ONNX Runtime siguen ejecutándose en CPU. También se probó una variante híbrida que conserva "islas" de `RotaryEmbedding` en CPU, con peor resultado en RTF (0,0110 frente a 0,0073 de mediana), lo que llevó a preferir el grafo totalmente defusionado para Intel NPU. No se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Diarización de hablantes ("quién habló y cuándo") sobre audio, con ejecución acelerada en NPU Intel bajo Windows x64.
- Inferencia con fallback a CPU desactivado: el modelo carga y ejecuta íntegramente en la NPU según el autor.
- Soporte de hasta ocho hablantes en el modelo upstream, con inferencia tanto en streaming como offline.
- Resolución de salida configurable en múltiplos de 10 ms en el modelo upstream.
- Salida en forma de probabilidades de actividad por hablante o como etiquetas genéricas de hablante con marcas de tiempo tras el posprocesado.
- Integración prevista con pipelines de inferencia del framework NeMo.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling ni agentes; es un modelo exclusivamente de audio.

## Casos de uso

- Transcripción con etiquetado de hablantes en reuniones: combinado con un sistema ASR, permite separar por hablante la transcripción de una reunión, aprovechando el RTF de 0,0073 medido en NPU (unas 137 veces más rápido que tiempo real en esa serie).
- Actas automáticas de reuniones en portátiles con Intel Core Ultra: al ejecutarse en NPU, libera CPU y GPU para la captura de audio y el motor de transcripción, algo útil en dispositivos sin GPU dedicada.
- Análisis de llamadas de atención al cliente: la diarización identifica turnos de agente y cliente para auditar tiempos de habla, interrupciones y cumplimiento de guiones.
- Indexación y búsqueda de archivos de audio largos: al poder procesar offline con RTF muy bajo, permite diarizar grandes volúmenes de grabaciones para generar índices por hablante.
- Subtitulado y accesibilidad de contenido multimedia: la salida de etiquetas de hablante con marcas de tiempo alimenta la generación de subtítulos que distinguen interlocutores.
- Investigación en procesamiento de habla: sirve como artefacto reproducible para medir el efecto de la ejecución en NPU frente a CPU sobre DER y RTF en el corpus AMI.
- Sistemas de reunión en tiempo real (Goodmeet): el autor lo integra en su evaluador de hablantes Goodmeet, con procesamiento de diarización y embeddings en NPU.

## Benchmarks y rendimiento

Los datos provienen de la model card y corresponden a mediciones propias del autor, no al modelo original de NVIDIA. La evaluación se realizó sobre el corpus AMI.

| Conjunto | Configuracion | Micro DER | RTF mediano diarizacion | Notas |
|---|---|---|---|---|
| AMI SDM, 36 items | NPU (OpenVINO), sin fallback CPU | 33,44 % | 0,0073 | Un item empeoró 2,50 puntos porcentuales de DER |
| AMI SDM, 36 items | Producto con fallback de diarizacion en CPU | 33,34 % | 0,0561 | Metal de identidad sin cambios |
| AMI SDM, 36 items | Grafo hibrido con islas `RotaryEmbedding` en CPU | 33,45 % | 0,0110 | Descartado frente al grafo defusionado |
| AMI headset-0 holdout, 16 items | NPU | 36,41 % | 0,0070 | Sin items fallidos, EER de WeSpeaker sin cambios |
| AMI headset-0 holdout, 16 items | Fallback CPU del grafo empaquetado | 36,85 % | 0,0574 | — |

No hay resultados publicados de MMLU, HumanEval, GSM8K ni benchmarks de texto, ya que no es un modelo de lenguaje. Los resultados de AMI en campo lejano no garantizan calidad con otros micrófonos ni en otro hardware.

## Requisitos de hardware

- Hardware de referencia validado: Intel Core Ultra 5 325 con Windows build 26200. La ejecución NPU se confirmó en los 36 items de AMI SDM.
- Acelerador objetivo: NPU Intel vía proveedor OpenVINO de ONNX Runtime (un único kernel OpenVINO registrado, cero nodos CPU en el grafo).
- VRAM estimada para inferencia: no disponible. El repositorio pesa 0,2 GB, lo que da una cota superior orientativa del espacio en disco de los pesos y su sidecar.
- GPU recomendadas: no aplica a esta variante. El modelo upstream admite CUDA; el script de ejemplo encontrado selecciona CUDA automáticamente en su versión para GPU.
- ¿Cabe en GPU de consumo? No disponible para esta conversión ONNX, que está orientada a NPU. La conversión permite ejecución en CPU como fallback, con RTF mediano de 0,0561 en AMI SDM.
- Opciones de despliegue: ONNX Runtime con proveedor OpenVINO (ruta NPU), ONNX Runtime en CPU como fallback, y pipelines de NeMo Framework para el modelo upstream.
- Latencia y throughput: el RTF mediano de 0,0073 en NPU sobre AMI SDM implica aproximadamente 137 veces más rápido que tiempo real en esa serie; en CPU el RTF mediano fue 0,0561, unas 18 veces más rápido que tiempo real. En el holdout de headset-0, el RTF mediano fue 0,0070 en NPU frente a 0,0574 en CPU.
- Nota: la preparación de audio y el procesamiento de hablantes fuera de ONNX Runtime siguen consumiendo CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / hablantes | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GoodnotesLtd/nemotron-3-diarization-windows-x64-intel-onnx | no disponible | Hasta 8 hablantes (upstream); entrada de formas fijas | Micro DER 33,44 % y RTF 0,0073 en NPU (AMI SDM, 36 items) | openmdw-1.1 | ONNX para NPU Intel, Windows x64 |
| nvidia/Nemotron-3-Diarization | no disponible | Hasta 8 hablantes; streaming y offline; resolución en múltiplos de 10 ms | No disponible en la información | No disponible | Modelo upstream de NVIDIA, vía NeMo |
| onnx-community/Nemotron-3-Diarization-ONNX | no disponible | Hasta 8 hablantes | No disponible en la información | No disponible | ONNX, origen de esta conversión |
| Emerald7664/Nemotron-3-Diarization-ONNX | no disponible | Hasta 8 hablantes | No disponible en la información | No disponible | Otra conversión ONNX |

El resto de alternativas de diarización (por ejemplo, sistemas basados en pyannote o WeSpeaker) no aparecen en la información proporcionada, por lo que no se comparan aquí.

## Limitaciones y advertencias

- Los resultados de AMI en campo lejano "no establecen calidad en otros micrófonos ni hardware", según el propio autor. La validación con micrófonos de producto y otros equipos Windows queda sin medir.
- La muestra es pequeña: 36 items en AMI SDM y 16 items en el holdout de headset-0. Un único item empeoró 2,50 puntos porcentuales de DER al pasar a NPU.
- El micro DER en NPU fue ligeramente peor que el producto con fallback CPU (33,44 % frente a 33,34 %) en AMI SDM, aunque mejoró en el holdout de headset-0 (36,41 % frente a 36,85 %).
- El modelo solo cubre diarización de audio; no genera texto, no razona y no soporta tool calling. No debe presentarse como modelo de lenguaje.
- No se documenta el comportamiento frente a sesgos de hablante, acento, edad, género ni idioma. La ficha de HuggingFace no lista idiomas soportados.
- Riesgo de alucinación no aplicable en el sentido de generación de texto, pero sí existe riesgo de asignación errónea de hablantes (confusión de identidades y errores de frontera), reflejado en el DER de aproximadamente un tercio de la duración evaluada.
- Limitación de compatibilidad: las formas de entrada son fijas, requisito de la ruta NPU de Windows ML, lo que restringe la flexibilidad de longitudes de audio sin troceado previo.
- Licencia openmdw-1.1: se debe revisar el texto completo de la licencia para confirmar condiciones de uso comercial. La información disponible no detalla los términos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, lo que implica escasa validación por parte de la comunidad.
- La fecha de creación del repositorio aparece como 2026-10-05 en los metadatos, dato a verificar por posible inconsistencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/GoodnotesLtd/nemotron-3-diarization-windows-x64-intel-onnx
- Modelo upstream de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Conversión ONNX de origen: https://huggingface.co/onnx-community/Nemotron-3-Diarization-ONNX (commit `353b6f8ad2cac3580e982d7fbdf0a010786b0406`)
- Otra conversión ONNX: https://huggingface.co/Emerald7664/Nemotron-3-Diarization-ONNX
- Tutorial de diarización en tiempo real: https://aiindigo.com/tutorials/getting-started-with-nemotron-3-diarization-real-time-speaker-identification-in
- Resumen y casos de uso: https://www.aimodels.fyi/models/huggingFace/nemotron-3-diarization-nvidia
- Ejemplo en Python: https://github.com/BillyMRX1/nemotron-diarization-python
