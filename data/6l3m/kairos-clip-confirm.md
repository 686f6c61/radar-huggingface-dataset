# 6l3m/kairos-clip-confirm

## Resumen

kairos-clip-confirm es un ajuste fino (fine-tune) del modelo FunctionGemma-270M-it de Google, desarrollado por el usuario 6l3m. Se trata de un modelo de lenguaje de 270 millones de parámetros, derivado de la familia Gemma 3, especializado en una tarea muy concreta: leer la transcripción de la retransmisión de un partido de fútbol alrededor de un fragmento de vídeo y determinar si la narración reporta un gol. El modelo no genera texto libre de forma general, sino que responde a una única pregunta de clasificación binaria (sí o no) con una breve justificación.

Su propósito práctico es actuar como filtro dentro del editor de vídeo kaairos, que se ejecuta en el navegador mediante transformers.js y WebGPU. En ese contexto, un modelo de visión propone posibles clips de gol y este modelo descarta las propuestas que la narración no respalda. Es relevante por su enfoque de despliegue en el cliente (ONNX, WebGPU) y por mostrar un caso de uso de modelos pequeños y especializados como componentes de un pipeline mayor, en lugar de como asistentes generalistas.

El modelo se distribuye en formato ONNX en fp32, con la cabeza del lenguaje atada a la matriz de embeddings, y está pensado para una única pasada hacia delante (forward pass) sin generación autorregresiva. Su licencia es la Gemma Terms of Use, al ser un derivado de un modelo Gemma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text), fine-tune con LoRA fusionado |
| Parámetros totales | 270 M (heredados de FunctionGemma-270M-it) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuye en ONNX fp32; el autor menciona fp16 como alternativa descartada) |
| Idiomas soportados | inglés (según la model card: "English only") |
| Licencia | Gemma Terms of Use (licencia "gemma"), con Gemma Prohibited Use Policy |
| Formato de pesos | ONNX (fp32) para transformers.js / onnxruntime-genai |

## Arquitectura y entrenamiento

El modelo parte de FunctionGemma-270M-it, un modelo de la familia Gemma 3 orientado a function calling, y conserva su arquitectura transformer decoder-only de 270 millones de parámetros. Sobre esa base se entrenaron adaptadores LoRA de rango 16 y alpha 32 aplicados a todas las capas lineales, durante 2 épocas, que posteriormente se fusionaron en los pesos base. El modelo se exportó a ONNX fp32 con el builder de onnxruntime-genai, recortando los logits a la última posición y atando la cabeza del lenguaje a la matriz de embeddings.

Los datos de entrenamiento consisten en aproximadamente 18.000 ventanas de narración de partidos, extraídas de transcripciones de Whisper del dataset SoccerNet-Echoes (licencia CC BY 4.0). Las ventanas se recortan alrededor de goles, de los minutos posteriores a un gol, de eventos que se le parecen (tiros, penaltis, córners, tarjetas) y de tramos aleatorios. Las etiquetas de evento solo determinan dónde se corta cada ventana; las respuestas de entrenamiento fueron generadas por un modelo profesor (Gemma 4 31B-it) que leía cada ventana. La concordancia en validación con el profesor fue del 91 %. La innovación principal no está en la arquitectura, sino en el uso: una única pasada hacia delante con lectura de la probabilidad de los tokens `Yes` (10784) y `No` (3771) en la primera posición de respuesta, en lugar de generación de texto.

## Capacidades

- Clasificación binaria de una ventana de narración deportiva: responde si la narración reporta un gol, con una breve razón.
- Lectura de transcripciones con errores de reconocimiento automático del habla.
- Procesamiento de ventanas de hasta 400 palabras de narración (las primeras 400 de la ventana).
- Salida probabilística: P(Yes) calculada por softmax sobre los logits de `Yes` y `No`, lo que permite aplicar umbrales calibrados.
- Ejecución en navegador mediante transformers.js y WebGPU.
- Inferencia en una sola pasada (sin generación autorregresiva), lo que reduce la latencia.
- No soporta tool calling general, agentes, visión, audio ni razonamiento multi-paso; su alcance es la tarea descrita.

## Casos de uso

- Filtrado de propuestas de clips de gol en un editor de vídeo: el modelo recibe la transcripción de los 10 segundos previos y 20 posteriores al clip y descarta las propuestas cuya narración no reporta un gol, reduciendo falsos positivos del modelo de visión.
- Edición automática de resúmenes deportivos: integrado en un pipeline que segmenta un partido completo, permite priorizar los tramos con narración de gol para generar highlights.
- Anotación asistida de datasets deportivos: el modelo puede preetiquetar ventanas de narración como "gol" o "no gol" para su revisión humana posterior.
- Despliegue en el cliente sin servidor: al ejecutarse en el navegador con ONNX y WebGPU, permite ofrecer la funcionalidad sin costes de inferencia en la nube ni envío de transcripciones a terceros.
- Investigación sobre modelos pequeños especializados: sirve como referencia para estudiar el ajuste fino de modelos de 270 M con LoRA y su exportación a ONNX para tareas de clasificación.
- Filtro de segunda etapa en sistemas de detección de eventos: combinado con un modelo de visión que propone candidatos, actúa como verificador textual para reducir falsos positivos antes de la decisión final del editor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí reporta métricas de la tarea específica:

| Métrica | Resultado |
|---|---|
| Concordancia con el modelo profesor en validación | 91 % |
| Diferencia máxima de probabilidad fp32 frente a PyTorch (122 ventanas de referencia) | 0,0002 |
| Partido no visto: goles conservados | 3 de 3 |
| Partido no visto: propuestas erróneas | de 19 a 5 |
| Partido no visto: clips aprobados que no eran gol | 5 de 8 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 270 M de parámetros en fp32 el peso ronda los 1,1 GB, por lo que en fp16 o cuantizado cabría en GPUs integradas y en cualquier GPU de consumo reciente.
- GPU recomendadas: no disponible; el autor indica ejecución en navegador con WebGPU, lo que abarca GPUs de consumo compatibles con WebGPU.
- Cabe en GPU de consumo: sí, por el tamaño del modelo; no se especifican modelos concretos.
- Opciones de despliegue: transformers.js con WebGPU y onnxruntime-genai; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el diseño de una sola pasada hacia delante sugiere baja latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kairos-clip-confirm | 270 M | no disponible | Clasificación de narración de gol | Gemma Terms of Use | ONNX en Hugging Face |
| google/functiongemma-270m-it | 270 M | no disponible | Function calling general | Gemma Terms of Use | Hugging Face |
| Gemma 3 270M (base de la familia) | 270 M | no disponible | Generación de texto general | Gemma Terms of Use | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo detecta goles y solo en inglés; no cubre otros eventos ni otros idiomas.
- Solo descarta: un clip que el modelo aprueba no queda confirmado como gol; en el partido de prueba, 5 de 8 clips aprobados no eran goles.
- Está entrenado y medido con transcripciones de partidos completos; leído en fragmentos de 10 segundos rinde peor, por lo que la aplicación solo lo usa con transcripciones de archivo completo.
- No procesa ventanas de menos de 26 palabras (se considera que la ausencia de narración no es evidencia en contra de un gol).
- Riesgo de alucinación en la breve razón que acompaña a la respuesta, aunque la decisión se base en la probabilidad de los tokens `Yes`/`No`.
- La licencia Gemma Terms of Use impone restricciones, incluida la Gemma Prohibited Use Policy, y afecta a cualquier uso comercial del derivado.
- El umbral de decisión (0,0315) se fijó solo con datos de validación y no se ha reajustado; su calibración en otros dominios o competiciones no está verificada.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción fuera de la aplicación del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/6l3m/kairos-clip-confirm
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Aplicación kaairos: https://kaairos.app
- Dataset SoccerNet-Echoes: https://huggingface.co/datasets/SoccerNet/SN-echoes
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
