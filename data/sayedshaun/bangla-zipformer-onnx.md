# SayedShaun/bangla-zipformer-onnx

## Resumen

Bangla Zipformer - ONNX es un modelo de reconocimiento automático del habla (ASR) para bengalí, exportado a formato ONNX y empaquetado para su uso con la librería sherpa-onnx. Lo desarrolla SayedShaun y se basa en la arquitectura Zipformer2 (un transformer con conformadores de atención lineal y estructura U-Net), en su variante transducer no streaming, con 65,5 millones de parámetros. El modelo se obtuvo mediante fine-tuning de un modelo inglés entrenado con LibriSpeech sobre aproximadamente 1.210 horas de audio en bengalí.

La relevancia de esta ficha radica en su enfoque de despliegue: no requiere PyTorch, icefall ni k2, sino únicamente `pip install sherpa-onnx`, y ofrece tres precisiones (fp32, fp16, int8) con dos modos de decodificación (beam search y greedy). Con la versión int8 ocupa 71 MB y transcribe un clip de 1 a 15 segundos en 62 ms en CPU con 4 hilos, lo que lo hace viable en entornos de producción modestos y en dispositivos de borde.

El modelo reporta un WER de 14,4 % y un CER de 4,3 % en el conjunto de test (10.485 enunciados) con fp32 y beam search, y la cuantización int8 apenas degrada la precisión (14,44 % / 4,32 %). Es una opción práctica para transcripción de bengalí en pipelines ligeros, aunque limitada a un único idioma y a clips de hasta unos 20 segundos por llamada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Zipformer2 transducer (no streaming), exportado a ONNX |
| Parámetros totales | 65,5 M (media de las épocas 23-25) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrada de audio de hasta ~20 s por llamada |
| Tipos de cuantización | fp32, fp16, int8 |
| Idiomas soportados | bengalí (bn) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx, joiner.onnx) + tokens.txt |

## Arquitectura y entrenamiento

El modelo es un transducer Zipformer2 no streaming con 65,5 M de parámetros. La arquitectura Zipformer combina bloques tipo conformador con atención lineal y una estructura jerárquica tipo U-Net que reduce la resolución temporal en las capas intermedias y la recupera en las finales, lo que rebaja el coste computacional frente a un transformer convencional. El transducer separa el codificador acústico (encoder), el predictor de tokens (decoder) y la red conjunta (joiner), y los tres se exportan como grafos ONNX independientes siguiendo el diseño estándar de sherpa-onnx.

El entrenamiento parte de un modelo inglés preentrenado con LibriSpeech y se afina sobre aproximadamente 1.210 horas de habla en bengalí. La model card no detalla la composición exacta del corpus, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en ASR). Tampoco se especifican innovaciones como decodificación especulativa; el foco técnico está en la exportación ONNX y en la compatibilidad con sherpa-onnx. Los pesos publicados corresponden a la media de las épocas 23 a 25.

## Capacidades

- Reconocimiento automático del habla en bengalí (transcripción de audio a texto).
- Entrada de audio mono de cualquier frecuencia de muestreo; sherpa-onnx remuestrea automáticamente a 16 kHz.
- Manejo de clips de hasta aproximadamente 20 segundos por llamada; el audio más largo debe dividirse previamente.
- Dos modos de decodificación: `modified_beam_search` (4 rutas activas) y `greedy_search`.
- Tres precisiones seleccionables: fp32 (254 MB), fp16 (129 MB) e int8 (71 MB).
- Ejecución en CPU o GPU (proveedor CUDA 12 con cuDNN 9); en GPU se recomienda fp32.
- API disponible en Python, C++, Java, C#, Go, Swift y Android/iOS/WebAssembly a través de sherpa-onnx (solo la API de Python fue probada para esta model card).
- No soporta tool calling, function calling, agentes, visión ni audio más allá de la transcripción; no dispone de modo thinking.
- Capacidad multilingüe: no disponible; el modelo está entrenado únicamente para bengalí.

## Casos de uso

- Transcripción de reuniones y entrevistas en bengalí: el modelo procesa clips de hasta 20 segundos con un WER de 14,4 % en test, por lo que se puede segmentar el audio con un detector de actividad de voz y transcribir por fragmentos con beam search para maximizar la precisión.
- Subtitulado y generación de actas: con una velocidad de 62 ms por clip en CPU int8 (RTF de 0,0104, unas 100 veces más rápido que tiempo real), es viable procesar horas de audio en lote en un servidor modesto.
- Atención al cliente por voz: integrado en un pipeline de telefonía, el modelo transcribe las intervenciones del usuario en bengalí para alimentar un sistema de intenciones o un chatbot; la versión int8 de 71 MB permite desplegarlo en contenedores pequeños.
- Aplicaciones móviles y de borde: la exportación ONNX y las APIs para Android, iOS y WebAssembly permiten ejecutar la transcripción en el dispositivo sin conexión, reduciendo la latencia y preservando la privacidad del audio.
- Investigación lingüística y creación de corpus: sirve para transcribir grabaciones de campo en bengalí y generar datasets anotados, con la posibilidad de comparar las salidas de fp32 e int8 para estimar la incertidumbre.
- Búsqueda y análisis de contenido audiovisual: transcripción previa de vídeos o pódcasts en bengalí para indexar y permitir búsqueda por texto; el bajo consumo de RAM (733 MB en int8) facilita el procesamiento paralelo en varios hilos.
- Sistemas de accesibilidad: dictado y subtitulado en tiempo casi real para usuarios de bengalí, usando el modo greedy (46 ms por clip) cuando la latencia sea prioritaria sobre la precisión.

## Benchmarks y rendimiento

Resultados completos sobre dev (5.282 enunciados) y test (10.485 enunciados), ejecutados con sherpa-onnx 1.13.8 en CPU.

**Beam search (`modified_beam_search`, 4 rutas)**

| Versión | Tamaño | Test WER | Test CER | Dev WER | Dev CER |
|---|---:|---:|---:|---:|---:|
| sherpa-onnx fp32 | 254 MB | 14,40 | 4,32 | 14,18 | 4,30 |
| sherpa-onnx fp16 | 129 MB | 14,39 | 4,32 | 14,19 | 4,30 |
| sherpa-onnx int8 | 71 MB | 14,44 | 4,32 | 14,30 | 4,31 |
| PyTorch fp32 (referencia) | 262 MB | 14,37 | 4,30 | 14,17 | 4,29 |

**Greedy search (`greedy_search`)**

| Versión | Tamaño | Test WER | Test CER | Dev WER | Dev CER |
|---|---:|---:|---:|---:|---:|
| sherpa-onnx fp32 | 254 MB | 14,70 | 4,47 | 14,47 | 4,41 |
| sherpa-onnx fp16 | 129 MB | 14,70 | 4,47 | 14,48 | 4,41 |
| sherpa-onnx int8 | 71 MB | 14,73 | 4,49 | 14,52 | 4,43 |
| PyTorch fp32 (referencia) | 262 MB | 14,67 | 4,46 | 14,42 | 4,40 |

WER con puntuación eliminada (beam / greedy): fp32 13,85 / 14,13 en test y 13,69 / 13,99 en dev; fp16 13,84 / 14,13 y 13,70 / 14,00; int8 13,89 / 14,17 y 13,81 / 14,02.

**Velocidad (media por clip, 60 clips de dev de 1 a 15 s, CPU de 32 núcleos con 4 hilos)**

| Versión | Beam: ms/clip | Greedy: ms/clip | Beam: RTF | RAM |
|---|---:|---:|---:|---:|
| fp32 | 77 ms | 62 ms | 0,0129 | 1121 MB |
| fp16 | 69 ms | 63 ms | 0,0116 | 1181 MB |
| int8 | 62 ms | 46 ms | 0,0104 | 733 MB |

En GPU con fp32 el tiempo por clip baja a 29 ms; fp16 e int8 resultan más lentos en GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo es muy pequeño (65,5 M de parámetros) y en GPU con fp32 se ejecuta con holgura en cualquier GPU con CUDA 12 y cuDNN 9.
- GPU recomendadas: cualquier GPU compatible con CUDA 12 y cuDNN 9; la model card no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- CPU: funciona en CPU sin requisitos especiales; con 4 hilos logra 62 ms por clip en int8 y consume 733 MB de RAM.
- Cabe en GPU de consumo: sí, por el reducido tamaño del modelo, aunque no se detallan modelos concretos.
- Opciones de despliegue: sherpa-onnx (Python, C++, Java, C#, Go, Swift, Android/iOS/WebAssembly); instalación con `pip install sherpa-onnx` para CPU o el wheel CUDA 12 para GPU. No requiere PyTorch, icefall ni k2.
- Latencia y throughput: RTF de 0,0104 en int8 con beam search (aproximadamente 100 veces más rápido que tiempo real); 29 ms por clip en GPU fp32.
- Memoria: 733 MB de RAM en int8, 1121 MB en fp32 y 1181 MB en fp16 (mediciones en CPU).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | WER (test) | Licencia | Formato |
|---|---|---|---|---|---|
| Bangla Zipformer - ONNX (este) | 65,5 M | ~20 s por llamada | 14,4 % (beam, fp32) | CC BY-SA 4.0 | ONNX |
| Bangla Zipformer - PyTorch (`SayedShaun/bangla-zipformer-pt`) | 65,5 M | ~20 s por llamada | 14,37 % (beam, fp32) | CC BY-SA 4.0 | PyTorch |
| Otros modelos ASR para bengalí | no disponible | no disponible | no disponible | no disponible | no disponible |

La única alternativa documentada en la información disponible es la versión PyTorch del mismo modelo, con precisión prácticamente idéntica y un tamaño de 262 MB. No se dispone de datos de benchmarks de otros sistemas ASR en bengalí para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo monolingüe: solo reconoce bengalí (bn); no soporta otros idiomas.
- Entrada limitada a clips de aproximadamente 20 segundos; el audio más largo debe segmentarse previamente, lo que puede introducir errores en las fronteras.
- WER de 14,4 % en test: inadecuado para transcripción de alta fidelidad sin revisión humana en dominios exigentes (legal, médico).
- Sensible a la calidad del audio, al ruido de fondo y a los acentos no representados en las 1.210 horas de entrenamiento; la model card no documenta la composición del corpus ni los sesgos asociados.
- Riesgo de alucinación y de errores en nombres propios, siglas y términos técnicos, habitual en sistemas transducer.
- La licencia CC BY-SA 4.0 permite uso comercial, pero exige atribución y que las obras derivadas se distribuyan bajo la misma licencia (share-alike); conviene revisar las implicaciones antes de integrarlo en productos propietarios.
- En GPU, fp16 e int8 son más lentos que fp32; debe usarse fp32 con `provider="cuda"`.
- Solo se probó la API de Python de sherpa-onnx para esta model card; las demás APIs (C++, Java, C#, Go, Swift, Android/iOS/WebAssembly) no están verificadas.
- Requiere CUDA 12 y cuDNN 9 accesibles (por ejemplo, en `LD_LIBRARY_PATH`) para el despliegue en GPU.
- La fecha de creación del repositorio (2026) y la ausencia de descargas y likes indican un modelo reciente y con poca validación externa por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SayedShaun/bangla-zipformer-onnx
- Versión PyTorch: https://huggingface.co/SayedShaun/bangla-zipformer-pt
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Documentación de sherpa-onnx para CUDA: https://k2-fsa.github.io/sherpa/onnx/cuda.html
- Paper de Zipformer: https://arxiv.org/abs/2310.11230
- Referencias adicionales citadas en los tags: arxiv:2206.13236, arxiv:2110.12561, arxiv:2403.01926, arxiv:2208.11761, arxiv:2208.12666, arxiv:2603.28714, arxiv:2205.12446, arxiv:1912.06670
