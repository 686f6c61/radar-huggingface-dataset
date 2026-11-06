# assassinshadow/LFM2.5-1.2B-Instruct-SM8450-LiteRT-LM-NPU

## Resumen

Este repositorio contiene un empaquetado experimental del modelo LiquidAI/LFM2.5-1.2B-Instruct para LiteRT-LM, compilado específicamente para la NPU Hexagon del SoC Qualcomm Snapdragon 8 Gen 1 (SM8450, Hexagon v69). Lo publica el usuario independiente assassinshadow como parte de una serie de builds comunitarios para ejecutar modelos en la NPU de teléfonos Android, y no tiene afiliación con Liquid AI, Google ni Qualcomm. El objetivo es permitir inferencia completamente local en el dispositivo, sin conexión a servidores, sirviendo el modelo a través de una app Android (AutoDroid Studio) que expone un endpoint compatible con la API de OpenAI.

El modelo base es un transformer de 1.200 millones de parámetros con una arquitectura híbrida de 16 capas: 10 de convolución corta y 6 de atención. El bundle incluye una ventana de contexto de 4096 tokens compartida entre prompt y respuesta, y cuantiza los pesos a 8 bits con activaciones de 16 bits. El resultado es un fichero `.litertlm` de 1,31 GB que ocupa 1,18 GB en la NPU repartidos en cinco contextos QNN dentro de un mismo proceso.

La relevancia de este build es doble: por un lado, demuestra la viabilidad técnica de portar modelos de lenguaje pequeños a la NPU Hexagon de un SoC de 2022; por otro, el propio autor advierte que **no ha sido probado en ningún dispositivo**, por lo que debe tratarse como un experimento reproducible más que como un artefacto listo para producción. El grafo de decodificación es de un token por llamada, de modo que la velocidad de prompt y la de generación coinciden.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 16 capas (10 de convolución corta, 6 de atención) |
| Parametros totales | 1.200 millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (compartidos entre prompt y respuesta) |
| Tipos de cuantizacion | Pesos 8 bits, activaciones 16 bits (build específico para NPU) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | LFM Open License v1.0 (`lfm1.0`), etiquetada como `other` |
| Formato de pesos | `.litertlm` (LiteRT-LM bundle, 1,31 GB) |
| SoC objetivo | Qualcomm Snapdragon 8 Gen 1 (SM8450, Hexagon v69) |
| Runtime requerido | QAIRT 2.50.0.260828 + LiteRT dispatch Qualcomm |
| Contextos QNN | 5 contextos en un proceso (1,18 GB) |
| Backend | NPU (Hexagon) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-1.2B-Instruct emplea una arquitectura híbrida que combina capas de convolución corta con capas de atención clásica, un diseño orientado a reducir el coste computacional en inferencia manteniendo capacidad expresiva. En este repositorio no se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; esa información correspondería a la model card del modelo original de Liquid AI, que no se incluye en la documentación disponible.

La innovación técnica de este build concreto reside en el pipeline de compilación: el modelo se ha convertido a LiteRT-LM, se ha cuantizado a 8 bits en pesos y 16 bits en activaciones, y se ha compilado para la NPU Hexagon v69 mediante Qualcomm AI Engine Direct con el SDK QAIRT 2.50.0.260828. El grafo de decodificación es único y procesa un token por llamada, lo que implica que la velocidad de prefill y la de decodificación son idénticas. Además, se ha reescrito la plantilla de chat para el motor de plantillas de LiteRT-LM (la original usaba `.get()`, no soportado), se ha añadido `<|endoftext|>` como token de parada y se ha declarado `<think> … </think>` como canal de razonamiento. El ejecutor de la NPU es greedy: temperatura, top-k y semilla no tienen efecto.

## Capacidades

- Generación de texto en inglés con un contexto de 4096 tokens compartido entre entrada y salida.
- Canal de razonamiento declarado mediante etiquetas `<think> … </think>`, heredado de la plantilla del modelo base.
- Conversación multi-turno a través del endpoint compatible con OpenAI que expone AutoDroid Studio.
- Inferencia local en el dispositivo sin conexión a red.
- Ejecución sobre la NPU Hexagon del Snapdragon 8 Gen 1, liberando la CPU y la GPU del terminal.
- Tool calling: no probado según el autor.
- Capacidades multimodales (visión, audio): no disponibles; el bundle es solo texto.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Asistentes conversacionales offline en Android: el modelo puede gestionar diálogos multi-turno dentro de los 4096 tokens de contexto sin salir del dispositivo, lo que resulta adecuado para apps de privacidad estricta donde los datos no deben abandonar el teléfono.
- Automatización de tareas en el propio terminal: mediante el endpoint compatible con OpenAI de AutoDroid Studio, se pueden conectar clientes y scripts locales que envíen prompts al modelo sin infraestructura de servidor.
- Prototipado de pipelines de IA en el borde: investigadores que quieran validar el rendimiento de la NPU Hexagon v69 con un modelo de 1,2B pueden usar este bundle como referencia, siempre asumiendo que no está verificado en hardware.
- Pruebas de regresión de toolchains LiteRT-LM: el fichero `.litertlm` y su SHA-256 permiten reproducir la compilación y comparar el comportamiento del runtime QAIRT 2.50 en distintos dispositivos SM8450.
- Evaluación comparativa de arquitecturas híbridas en NPU: al ser un transformer con convoluciones cortas, sirve para medir cómo se comporta este tipo de capas en el acelerador Hexagon frente a modelos puramente atencionales.
- Demos educativas de inferencia en dispositivo: para mostrar en talleres o clases cómo se ejecuta un LLM cuantizado en la NPU de un móvil, con la advertencia explícita de que el build es experimental.
- Integración en apps Android de terceros: cualquier aplicación que pueda cargar el runtime LiteRT-LM y el dispatch Qualcomm puede servir este bundle a través de su propio endpoint, aunque requerirá validación previa en el dispositivo concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el bundle no se ha ejecutado en ningún dispositivo, por lo que no hay datos de velocidad, latencia ni calidad de respuesta.

## Requisitos de hardware

- SoC: Qualcomm Snapdragon 8 Gen 1 (SM8450) exclusivamente; la NPU Hexagon v69 es el único backend soportado.
- Memoria en NPU: 1,18 GB repartidos en 5 contextos QNN dentro de un único proceso.
- Fichero del modelo: 1,31 GB en almacenamiento (`lfm25-1.2b-ctx4096_sm8450.litertlm`).
- Runtime adicional no incluido: `libQnnHtp.so`, `libQnnSystem.so`, `libQnnHtpV69Stub.so`, `libQnnHtpV69Skel.so` (QAIRT 2.50), `libLiteRtDispatch_Qualcomm.so` y el binario `litert_lm_advanced_main` compilado para Android arm64.
- GPU de escritorio: no aplica; el artefacto está compilado para la NPU móvil, no para CUDA ni ROCm.
- Despliegue: app AutoDroid Studio desde Google Play o ejecución por shell con `litert_lm_advanced_main --backend=npu`.
- Latencia y throughput: no disponibles; el autor no aporta mediciones y el grafo procesa un token por llamada, por lo que el rendimiento de prefill equivale al de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct-SM8450-LiteRT-LM-NPU (este) | 1,2B | 4096 | `.litertlm` (NPU SM8450) | LFM Open License v1.0 | Experimental, no probado en dispositivo |
| Qwen3.5-2B-SM8450-LiteRT-LM-NPU (mismo autor) | 2B | no disponible | `.litertlm` (NPU SM8450) | según modelo base | Probado en Galaxy S22 Ultra |
| Gemma 4 E2B-it-text-SM8450-LiteRT-LM-NPU (mismo autor) | 2B efectivos | no disponible | `.litertlm` (NPU SM8450) | según modelo base | Probado en Galaxy S22 Ultra |
| LFM2.5-8B-A1B-LiteRT-LM-NPU-GPU (mismo autor) | 8B totales, 1B activos | no disponible | `.litertlm` (NPU/GPU SM8450) | LFM Open License v1.0 | Probado en Galaxy S22 Ultra |
| LiquidAI/LFM2.5-1.2B-Instruct (modelo base) | 1,2B | no disponible en esta ficha | safetensors | LFM Open License v1.0 | Modelo de referencia original |

## Limitaciones y advertencias

- **No probado en ningún dispositivo**: el autor indica que el bundle se compiló en un PC y nunca se ha cargado en un teléfono; puede no cargar o responder mal.
- **Restricción de hardware**: solo funciona en Snapdragon 8 Gen 1 (SM8450, Hexagon v69); no es portable a otros SoC sin recompilación.
- **Solo texto**: no hay soporte de visión ni audio, y el tool calling no se ha probado.
- **Idioma**: únicamente inglés según la etiqueta del repositorio.
- **Decodificación greedy**: el ejecutor de la NPU ignora temperatura, top-k y semilla, lo que limita el control sobre la diversidad de las respuestas.
- **Contexto compartido**: los 4096 tokens se reparten entre prompt y respuesta, por lo que conversaciones largas agotan la ventana rápidamente.
- **Licencia**: LFM Open License v1.0 con cláusulas específicas sobre uso comercial; es obligatorio leer el fichero `LICENSE` antes de cualquier despliegue productivo.
- **Build no oficial**: no está afiliado a Liquid AI, Google ni Qualcomm y se distribuye tal cual, sin garantía.
- **Riesgo de alucinación**: inherente a un modelo de 1,2B parámetros; no se han publicado evaluaciones de fidelidad en esta ficha.
- **Dependencias frágiles**: requiere versiones concretas de QAIRT (2.50.0.260828) y del dispatch de LiteRT, además de un binario `litert_lm_advanced_main` compilado para arm64 Android.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/assassinshadow/LFM2.5-1.2B-Instruct-SM8450-LiteRT-LM-NPU
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- App AutoDroid Studio en Google Play: https://play.google.com/store/apps/details?id=com.assassinshadow.aiserver
- LiteRT-LM (GitHub): https://github.com/google-ai-edge/LiteRT-LM
- LiteRT (GitHub): https://github.com/google-ai-edge/LiteRT
- Build hermano Qwen3.5-2B: https://huggingface.co/assassinshadow/Qwen3.5-2B-SM8450-LiteRT-LM-NPU
- Build hermano Gemma 4 E2B: https://huggingface.co/assassinshadow/Gemma-4-E2B-it-text-SM8450-LiteRT-LM-NPU
- Build hermano LFM2.5-8B-A1B: https://huggingface.co/assassinshadow/LFM2.5-8B-A1B-LiteRT-LM-NPU-GPU
