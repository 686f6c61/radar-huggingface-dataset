# RavinduSen/JaneGPT-v2

## Resumen

JaneGPT-v2 es un modelo de clasificación de intenciones (intent classification) desarrollado por Ravindu Senanayake (RavinduSen), estudiante de informática en Sri Lanka, como núcleo de inteligencia del asistente de voz offline JANE. No es un modelo generativo: es un transformer decoder-only de ~7,8 millones de parámetros con una cabeza de clasificación que mapea comandos de voz o texto cortos a una de 22 intenciones predefinidas (subir volumen, abrir aplicación, hacer captura de pantalla, etc.). El modelo se construyó desde cero —arquitectura, tokenizador BPE y pipeline de entrenamiento— para resolver un problema concreto: los modelos grandes como Llama 3 8B introducían latencias de 10-22 segundos en comandos simples, lo que hacía inviable un asistente de voz fluido.

La propuesta de valor es la eficiencia extrema: con 7,8M de parámetros, un checkpoint de ~30 MB y una latencia de ~17 ms en GPU, el modelo cabe en hardware de consumo e incluso en sistemas embebidos. Alcanza un 88,6% de accuracy en validación y un 96,7% en entrenamiento sobre un dataset sintético de comandos generado con modelos de lenguaje y revisado por el autor.

Es relevante ahora porque ejemplifica una tendencia creciente: modelos pequeños y especializados que sustituyen a LLM generalistas en tareas acotadas donde la latencia y la privacidad son críticas. El modelo se distribuye con licencia MIT y está pensado exclusivamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only + cabeza de clasificación |
| Parametros totales | ~7,8M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (secuencia máxima) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,1 GB; checkpoint ~30 MB) |
| Dimensión de embedding | 256 |
| Cabezas de atención | 8 |
| Cabezas KV (GQA) | 4 |
| Capas | 8 |
| Dimensión oculta FF | 672 |
| Tamaño de vocabulario | 8.192 |
| Tokenizador | BPE personalizado |
| Clases de salida | 22 intenciones |
| Accuracy validación | 88,6% |
| Accuracy entrenamiento | ~96,7% |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas con dimensión de embedding 256, 8 cabezas de atención y 4 cabezas KV mediante Grouped-Query Attention (GQA), lo que reduce el uso de memoria sin sacrificar expresividad. Emplea codificación posicional RoPE para mejor generalización en longitud, activación SwiGLU (gradientes más suaves que ReLU a esta escala), normalización RMSNorm y un tokenizador BPE personalizado entrenado específicamente sobre texto con formato de comandos. Sobre el tronco del transformer se añade una cabeza de clasificación que produce la distribución sobre las 22 intenciones.

El entrenamiento se realizó con PyTorch 2.0+ sobre una NVIDIA RTX 3050Ti (4 GB de VRAM), CPU AMD Ryzen 9 5900HX y 16 GB de RAM, complementado con ejecuciones extendidas en Google Colab. Los datos de entrenamiento son un dataset sintético de comandos generado con modelos de lenguaje y revisado por el autor. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en un clasificador). Tampoco se detalla el esquema de aumento de datos ni la estrategia de validación más allá del porcentaje reportado.

## Capacidades

- Clasificación de intenciones en 22 clases: volumen (4), brillo (3), multimedia (4), aplicaciones (3), navegador (1), productividad (2), pantalla (2), control (2) y conversación (1).
- Comprensión de comandos cortos en inglés (1-15 palabras) con variaciones léxicas: "increase the volume", "make it louder" y "turn up the volume" se mapean a `volume_up`.
- Predicción con puntuación de confianza por clase (por ejemplo, 98% para "open chrome").
- Soporte de contexto conversacional limitado: acepta un diccionario `context` con la intención previa para desambiguar entradas como "not enough" tras `volume_up`.
- Inferencia rápida (~17 ms en GPU) adecuada para pipelines de voz en tiempo real.
- Ejecución offline sin dependencia de la nube.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto, visión, audio ni razonamiento matemático. Es exclusivamente un clasificador.

## Casos de uso

- Enrutamiento de comandos en asistentes de voz: el modelo recibe la transcripción STT y devuelve la intención, que el orquestador traduce en una acción del sistema (subir volumen, abrir aplicación). Su latencia de ~17 ms evita la percepción de retardo en interacción por voz.
- Domótica y control de dispositivos: clasificación de comandos de brillo, volumen y multimedia para integrarse en un hub local (Raspberry Pi, mini-PC) sin conexión a internet, preservando la privacidad del hogar.
- Despliegue en dispositivos edge: con 7,8M de parámetros y ~30 MB de checkpoint, cabe en sistemas embebidos y microcontroladores con aceleración NPU o en GPUs integradas, permitiendo asistentes siempre disponibles sin coste de cloud.
- Detección de intenciones en chatbots de soporte: como primera etapa de un pipeline, clasifica la consulta del usuario en categorías acotadas antes de derivar a un LLM generativo o a un flujo predefinido, reduciendo coste y latencia.
- Prototipado rápido de interfaces de voz: investigadores pueden sustituir un LLM generalista por este clasificador para validar flujos de interacción sin infraestructura pesada.
- Filtrado y preprocesado en pipelines de audio: descarta o etiqueta comandos no accionables (clase `chat`) antes de enviarlos a un modelo mayor, actuando como router de bajo coste.
- Educación y experimentación: al estar construido desde cero con licencia MIT, sirve como referencia didáctica de arquitectura transformer a pequeña escala con GQA, RoPE y SwiGLU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, GLUE, etc.) en la información disponible. El autor reporta métricas propias de clasificación y ejemplos de predicción:

| Métrica | Valor |
|---|---|
| Accuracy de entrenamiento | ~96,7% |
| Accuracy de validación | 88,6% |
| Latencia de inferencia (GPU) | ~17 ms |
| Checkpoint | ~30 MB |

| Entrada | Intención predicha | Confianza |
|---|---|---|
| "increase the volume" | volume_up | 86% |
| "make it louder" | volume_up | 90% |
| "turn down the brightness" | brightness_down | 80% |
| "open chrome" | app_launch | 98% |
| "play some music" | media_play | 96% |
| "search for cats on youtube" | browser_search | 94% |
| "set a reminder for 5 minutes" | set_reminder | 96% |
| "take a screenshot" | screenshot | 88% |
| "undo that" | undo | 92% |
| "hello" | chat | 97% |

No se dispone de comparación con modelos de clasificación de intenciones de referencia (por ejemplo, fine-tunes de DistilBERT o MiniLM) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (7,8M de parámetros ocupan ~31 MB en pesos; el grueso del consumo proviene de activaciones y del runtime). Cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU moderna sirve; el autor entrenó en una RTX 3050Ti de 4 GB. Para producción, una T4, L4 o incluso una GTX 1650 son suficientes. A100/H100 no aportan ventaja relevante a esta escala.
- Cabe en GPU de consumo y en hardware integrado: sí, en cualquier GPU de consumo e incluso en CPU y sistemas embebidos.
- Opciones de despliegue: el autor proporciona una clase `JaneGPTClassifier` en Python con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (son runtimes orientados a generación, no a clasificación). El despliegue típico sería un script de inferencia PyTorch o una exportación a ONNX/TorchScript (no documentada).
- Latencia y throughput: ~17 ms por inferencia en GPU según el autor; no se reporta throughput ni latencia en CPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables en la información proporcionada. Como referencia cualitativa de la categoría (clasificadores de intenciones pequeños), se pueden considerar alternativas como fine-tunes de DistilBERT, MiniLM o TinyBERT, pero no se han publicado métricas de JaneGPT-v2 frente a ellos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| JaneGPT-v2 | ~7,8M | 256 tokens | MIT | Hugging Face |
| DistilBERT (fine-tune para intent classification) | ~66M | 512 tokens | Apache 2.0 | Hugging Face |
| MiniLM-L6 (fine-tune) | ~22M | 512 tokens | MIT | Hugging Face |
| TinyBERT (fine-tune) | ~14M | 512 tokens | Apache 2.0 | Hugging Face |

La comparación de rendimiento con estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo clasificación: no genera texto ni ejecuta acciones; requiere un orquestador externo que traduzca la intención en una acción del sistema.
- Cobertura cerrada de 22 clases: cualquier comando fuera del conjunto soportado se clasifica como `chat`, lo que puede enmascarar errores y degradar la experiencia si el dominio de uso se amplía sin reentrenar.
- Solo inglés: no soporta castellano ni otros idiomas; el tokenizador BPE se entrenó sobre comandos en inglés.
- Optimizado para entradas cortas (1-15 palabras): comandos largos o con estructura compleja pueden degradar la precisión.
- Sin extracción de entidades: devuelve solo la etiqueta de intención, no parámetros como el nivel de volumen, el nombre de la aplicación o la duración del recordatorio; el parseo de entidades debe hacerse por separado.
- Brecha train/validation de ~8 puntos (96,7% frente a 88,6%): indica cierto sobreajuste al dataset sintético, lo que sugiere que el rendimiento en dominios reales puede ser inferior al reportado.
- Dataset sintético: los datos generados con modelos de lenguaje y revisados por el autor pueden no cubrir la variabilidad real de acentos, ruido de transcripción STT o formulaciones coloquiales.
- Riesgo de alucinación bajo en la práctica (es un clasificador), pero riesgo de clasificación errónea con alta confianza en entradas ambiguas o fuera de distribución.
- Sesgos: no documentados por el autor; al ser un dataset sintético en inglés, puede heredar sesgos de los modelos generadores utilizados.
- Licencia MIT: permite uso comercial sin restricciones, pero no hay garantías de soporte ni mantenimiento; el modelo tiene 16 descargas y 2 likes, lo que indica adopción muy limitada y escasa validación comunitaria.
- Advertencia de producción: al no documentarse cuantizaciones, exportación a ONNX ni pruebas en CPU, la integración en sistemas embebidos requerirá trabajo adicional de ingeniería no cubierto por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RavinduSen/JaneGPT-v2
- Proyecto JANE AI Assistant en GitHub: https://github.com/Ravindu-S/JANE-AI-Assistant
- Repositorio JaneGPT-v2 en GitHub: https://github.com/Ravindu-S/JaneGPT-v2
- Perfil del autor en GitHub: https://github.com/Ravindu-S
