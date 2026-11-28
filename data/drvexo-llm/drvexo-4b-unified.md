# DRVEXO-LLM/drvexo-4b-unified

## Resumen

drvexo-4b-unified es un modelo multimodal desarrollado por DRVEXO-LLM (Yujie Intelligence, 驭介智能) que integra en un único paquete de pesos comprensión de imagen, entrada de audio, diálogo de texto, generación de voz con clonación por referencia y puntuación de candidatos para toma de decisiones. Aunque se comercializa como "4B", el recuento real de parámetros en safetensors es de 6.970.568.132 (aproximadamente 6,97 mil millones), lo que sugiere un backbone lingüístico de 4B combinado con encoders y decodificadores de visión y audio empaquetados en el mismo repositorio.

El modelo está orientado a aplicaciones de interacción por voz (comunicación telefónica, control por voz, agentes encarnados) y ofrece entradas tanto por Python local como por un servidor vLLM-Omni con adaptaciones específicas. Entre sus rasgos diferenciales están el soporte de tool calling con extracción mediante JSON Schema, la capacidad de evaluar y puntuar candidatos de decisión, y la generación de audio en streaming a 24 kHz con una velocidad declarada de 2,45–2,58 veces tiempo real.

La relevancia actual radica en que unifica en un solo checkpoint tareas que habitualmente requieren pipelines separados (ASR + LLM + TTS + VLM + clasificador de decisión), con licencia Apache 2.0 y pesos en safetensors. La información pública disponible es limitada en cuanto a composición del dataset de entrenamiento y detalles arquitectónicos internos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (backbone lingüístico de 4B con módulos de visión y audio empaquetados; identificador interno `drvexo_speech_qwen35_4b`) |
| Parametros totales | 6.970.568.132 (según safetensors) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se listan GGUF ni AWQ) |
| Idiomas soportados | chino (zh) e inglés (en), según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 14,3 GB) |

## Arquitectura y entrenamiento

La model card describe el modelo como un sistema modular de voz y visión con un backbone lingüístico de 4B (identificador `drvexo_speech_qwen35_4b`), al que se añaden componentes de comprensión visual, entrada de audio, generación de voz con clonación por referencia y un módulo de puntuación de candidatos ("decision"). No se detalla en la información disponible la arquitectura interna de cada módulo (tipo de encoder visual, tokenizador de audio, decoder TTS), ni la profundidad o el número de capas del transformer lingüístico.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o fine-tuning supervisado. La model card menciona un informe técnico asociado (arXiv:2611.25521, "DRVEXO-4B-Unified: Design and Evaluation of a Modular Speech-Vision System"), que probablemente contiene esos detalles, pero su contenido no está incluido en la información proporcionada. Sí se documenta una innovación operativa: el despliegue mediante vLLM-Omni con una rama específica (`codex/drvexo-speech-general-20261030`) y una revisión fijada, lo que indica integraciones a medida para streaming de texto y audio.

## Capacidades

- Comprensión de imagen: respuesta a preguntas sobre imágenes, descripción de escenas y extracción de información visible, manteniendo el historial de conversación para preguntas de seguimiento.
- Entrada de audio y transcripción (ASR): conversión de voz a texto en chino e inglés.
- Generación de voz (TTS): síntesis a 24 kHz con salida en streaming por bloques.
- Clonación de voz por referencia: generación de nuevas locuciones con el timbre de una grabación de referencia de 1–30 segundos, sin reentrenamiento por hablante.
- Tool calling / function calling: generación de llamadas a herramientas y continuación del razonamiento a partir de los resultados devueltos.
- Salida estructurada mediante JSON Schema, incluyendo objetos y arrays anidados.
- Puntuación de candidatos de decisión ("decision"): asignación de probabilidad a opciones explícitas dadas una tarea y un contexto; el modelo no ejecuta acciones (`executable: false` en el ejemplo publicado).
- Diálogo de texto multi-turno con chino e inglés.
- No se declara soporte de audio de entrada en otros idiomas distintos de zh/en, ni capacidades de vídeo.

## Casos de uso

- Atención al cliente telefónica automatizada: el modelo puede transcribir la voz del cliente, responder por texto y sintetizar la respuesta en audio, todo con el mismo checkpoint; la latencia declarada de primer bloque de audio (307–324 ms) y la velocidad de 2,45–2,58× tiempo real permiten conversaciones fluidas.
- Agentes de voz con clonación de marca: usando una grabación autorizada de 1–30 segundos, se puede generar la locución de un asistente con un timbre corporativo concreto sin entrenar un modelo TTS aparte.
- Extracción de datos de documentos e imágenes: con JSON Schema se pueden obtener campos anidados (por ejemplo, pedidos con cliente, líneas de artículo y ventana de entrega) a partir de texto o de una imagen, validables contra el esquema.
- Automatización de seguimiento comercial: el módulo de decisión puntúa candidatos (enviar correo ahora, llamar más tarde, no modificar el pedido) y devuelve la opción con mayor probabilidad, dejando la ejecución al sistema anfitrión.
- Control por voz en aplicaciones encarnadas o domóticas: el modelo interpreta la orden hablada, genera la llamada a la herramienta correspondiente y responde verbalmente; la ejecución física queda en la capa de aplicación.
- Asistente multimodal en movilidad o campo: con entrada de cámara y micrófono, el modelo describe lo visible y responde por voz, útil en escenarios donde el operador no puede usar teclado.
- Enriquecimiento de pipelines de datos: transcripción de audio a texto y descripción de imágenes con un único modelo, reduciendo el número de servicios a mantener.

## Benchmarks y rendimiento

La model card publica un gráfico radar con resultados por eje, con el siguiente detalle de evaluación:

| Benchmark | Conjunto | Resultado |
|---|---|---|
| IFEval (estricto, nivel de pregunta) | 541 preguntas | no disponible en cifra numérica (solo gráfico) |
| MATH-500 | 500 preguntas | no disponible en cifra numérica (solo gráfico) |
| MMLU-Pro | subconjunto estratificado de 3.000 preguntas | 2338/3000 = 77,93 % (subconjunto, no válido para el total) |
| MMMU | 900 preguntas de validación | no disponible en cifra numérica (solo gráfico) |
| ChartQA | 1.920 preguntas de validación | no disponible en cifra numérica (solo gráfico) |
| JevBench | subconjunto público de 231 preguntas | no disponible en cifra numérica (solo gráfico) |

Además, la model card reporta métricas de servicio medidas el 7 de noviembre de 2026 en una NVIDIA DGX Spark / GB10:

| Texto concurrente | Throughput total de salida (token/s) | Mediana de primer token de texto |
|---:|---:|---:|
| 1 | 24,02 | 58 ms |
| 8 | 185,17 | 143 ms |
| 32 | 601,55 | 361 ms |
| 128 | 1.378,94 | 806 ms |

Primer bloque de audio: 307–324 ms; velocidad de generación de voz: 2,45–2,58× tiempo real; frecuencia de muestreo de salida: 24 kHz. Estos datos corresponden a pruebas de streaming independientes y no representan 128 conversaciones de voz simultáneas ni latencia física de reproducción.

## Requisitos de hardware

- VRAM estimada: no publicada. Con 6,97 mil millones de parámetros en safetensors (FP16/BF16) el peso ronda los 14 GB, por lo que se necesita al menos ~16 GB de VRAM solo para pesos, más memoria para caché KV y buffers de audio/visión. No se documentan cuantizaciones que reduzcan esta huella.
- GPU recomendadas: la model card solo documenta pruebas en NVIDIA DGX Spark / GB10. Por tamaño, cabría esperar funcionamiento en A100 (40/80 GB), H100, L40S y GPUs consumer de gama alta con 24 GB o más (RTX 3090/4090), aunque no hay confirmación oficial para estas.
- ¿Cabe en GPU consumer? Probablemente en RTX 3090/4090 (24 GB) en BF16 para pesos, pero sin datos oficiales de consumo real con audio y visión activos.
- Opciones de despliegue: paquete Python local (`drvexo_unified.UnifiedModel`) y servidor vLLM-Omni con la rama `codex/drvexo-speech-general-20261030` sobre vLLM 0.33. No se mencionan soporte de llama.cpp, Ollama, TGI ni TensorRT-LLM.
- Latencia y throughput: ver tabla de la sección anterior (DGX Spark / GB10).

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada frente a otros modelos multimodales de tamaño similar (por ejemplo, Qwen2.5-Omni, MiniCPM-o, GLM-4-Voice o Moshi). Por tanto:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| drvexo-4b-unified | 6,97 B (totales) | no disponible | zh, en | Apache 2.0 | Hugging Face, ModelScope |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e inglés; no hay soporte documentado de castellano ni de otras lenguas, lo que limita su uso en producción en España sin evaluación previa.
- Contexto: no se publica la longitud máxima de contexto, un dato crítico para dimensionar memoria y para casos de conversaciones largas o documentos extensos.
- Alucinación: no se documentan evaluaciones de tasa de alucinación ni de fidelidad visual; el ejemplo de la model card insiste en responder solo con lo visible, pero no hay métricas.
- Decisiones: las probabilidades de los candidatos (por ejemplo, 99,42 %) no equivalen a probabilidad de éxito de la acción; el modelo no ejecuta acciones (`executable: false`) y la responsabilidad de la ejecución recae en la aplicación.
- Clonación de voz: requiere grabaciones autorizadas; existe riesgo de uso indebido (suplantación) y la model card insiste en usar solo audio con permiso. No se documentan mitigaciones técnicas (marcas de agua, detección).
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las dependencias del paquete (PyTorch, vLLM, torchaudio) y la rama específica de vLLM-Omni, que puede tener su propia licencia.
- Despliegue: el servidor requiere una rama no estándar de vLLM-Omni con revisión fijada; no hay soporte declarado para llama.cpp, Ollama u otros runtimes, lo que complica la portabilidad.
- Datos de entrenamiento y evaluación: no se detallan composición, tokens ni metodología de alineación; los resultados de MMLU-Pro corresponden a un subconjunto de 3.000 preguntas y no son extrapolables al total.
- Madurez: el repositorio tiene 180 descargas y 3 "likes" en el momento de la consulta, lo que indica adopción temprana y poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DRVEXO-LLM/drvexo-4b-unified
- Modelo en ModelScope: https://modelscope.cn/models/DRVEXOLLM/drvexo-4b-unified
- Demo en Hugging Face Space: https://huggingface.co/spaces/DRVEXO-LLM/drvexo-4b-demo
- Demo en ModelScope: https://modelscope.cn/studios/DRVEXOLLM/drvexo-4b-demo
- Informe técnico (arXiv): https://arxiv.org/abs/2611.25521
- Repositorio vLLM-Omni adaptado: https://github.com/DRVEXO-LLM/vllm-omni (rama `codex/drvexo-speech-general-20261030`, revisión 6d9c034a)
