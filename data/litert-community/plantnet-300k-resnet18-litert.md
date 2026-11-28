# litert-community/PlantNet-300K-ResNet18-LiteRT

## Resumen

PlantNet-300K ResNet18 LiteRT es un modelo de clasificación de imágenes especializado en la identificación de especies vegetales, desarrollado por la comunidad litert-community a partir de los pesos de cpoisson/plantnet300k-resnet18. Resuelve un problema de clasificación fine-grained: distinguir entre 1081 especies de plantas (nombres latinos) a partir de una única imagen RGB, una tarea en la que las diferencias entre clases son sutiles y requieren un modelo entrenado específicamente sobre el dataset PlantNet-300K.

La relevancia del modelo no está en su arquitectura, sino en su empaquetado: es una CNN ResNet18 estándar de torchvision convertida a LiteRT (TFLite) para ejecutarse íntegramente en el delegado GPU del dispositivo, sin fallback a CPU. Con un tamaño de 47 MB y una entrada fija de 224x224, está pensado para inferencia en Android, navegador (WebGPU) y placas como Raspberry Pi 5, con latencias que van de 0,90 ms en la NPU Hexagon de un Snapdragon 8 Elite Gen 5 a 61,8 ms en CPU con XNNPACK.

El modelo no es un LLM ni un transformer generativo: es un clasificador de imagen puro, con salida de 1081 logits. Su interés para desarrolladores e investigadores radica en ser un ejemplo reproducible de conversión GPU-exacta de una CNN a LiteRT, con parches documentados para problemas concretos de delegados (MaxPool2d con padding) y mediciones de rendimiento en varios backends.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (torchvision), CNN pura |
| Parametros totales | no disponible (ResNet18 estándar, ~11,7 M en la implementación de torchvision; no confirmado en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imagen, entrada fija 1x3x224x224) |
| Tipos de cuantizacion | fp16 (archivo publicado); no se documentan variantes int8 |
| Idiomas soportados | no disponible (etiquetas de especies en latín; el modelo no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite / LiteRT (`.tflite`); pesos originales en el repo base cpoisson/plantnet300k-resnet18 |
| Entrada | `[1, 3, 224, 224]` NCHW, RGB, normalización ImageNet (mean `[0.485,0.456,0.406]`, std `[0.229,0.224,0.225]`), center-crop y resize a 224 |
| Salida | `[1, 1081]` logits de especie |
| Clases | 1081 especies de plantas (nombres latinos) |
| Tamaño del artefacto | 47 MB |
| Librería | LiteRT (`litert`) |

## Arquitectura y entrenamiento

La arquitectura es una ResNet18 de torchvision sin modificaciones estructurales: CNN con bloques residuales, stem con convolución 7x7, MaxPool, cuatro etapas de bloques BasicBlock y capa fully-connected final adaptada a 1081 clases. El modelo base fue entrenado sobre el dataset PlantNet-300K (presentado en NeurIPS 2021), un corpus de imágenes de plantas con anotaciones a nivel de especie. La información disponible no detalla el número de tokens ni la composición exacta del dataset, ni si se aplicaron técnicas de aumento de datos o ajuste fino posteriores; esos datos corresponden a la model card del repo base, no incluida aquí.

La innovación técnica relevante está en la conversión, no en el entrenamiento. El grafo se convierte con litert-torch (`build_plantnet.py`) y se logra que el 100 % de los nodos (37/37) queden en el delegado GPU, en una sola partición, con correlación de dispositivo 0,99999 y coincidencia top-1. Para ello se aplica un único parche: el `MaxPool2d(padding=1)` del stem baja a un PADV2 con padding de `-inf`, que el delegado Mali rechaza (`PADV2: src has wrong size`); se sustituye por un zero-pad explícito seguido de maxpool sin padding, lo cual es exacto porque la entrada del maxpool es post-ReLU y por tanto no negativa. La fidelidad frente a PyTorch en CPU es de correlación 0,99999999999.

## Capacidades

- Clasificación de imágenes de plantas en 1081 especies, con salida de logits y softmax + top-k para obtener las predicciones ordenadas.
- Identificación fine-grained: distingue especies visualmente próximas, tarea para la que el modelo fue entrenado específicamente.
- Inferencia completamente en GPU en el delegado LiteRT `CompiledModel`, sin fallback a CPU.
- Ejecución en NPU Hexagon (Qualcomm) tal como se publica, sin conversión ni artefacto precompilado, con compilación en dispositivo y caché del resultado.
- Ejecución en navegador mediante LiteRT.js con WebGPU.
- Ejecución en CPU con XNNPACK multihilo (4 hilos) para entornos sin acelerador.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador de imagen puro.
- No procesa audio ni vídeo; la entrada es una imagen fija de 224x224.

## Casos de uso

- Identificación de especies en apps móviles de botánica: el modelo se integra como asset de Android y se ejecuta en el delegado GPU con ~16 ms por fotograma en un Pixel 8a, lo que permite dar respuesta en tiempo real al capturar una planta con la cámara.
- Asistencia en campo para agrónomos y técnicos forestales: clasificación de especies en dispositivo sin conectividad, aprovechando que el artefacto ocupa 47 MB y no requiere red; útil en inventarios de vegetación y seguimiento de parcelas.
- Detección temprana de especies invasoras: un pipeline que capture imágenes y consulte el top-k del modelo puede marcar candidatas para revisión humana, con la ventaja de ejecutarse en hardware de bajo coste como una Raspberry Pi 5 (34,1 ms p50 en CPU).
- Aplicaciones web de educación botánica: despliegue con LiteRT.js y WebGPU en Chromium permite clasificar en el navegador sin subir imágenes a un servidor (2,67 ms p50 en un M4 Max), lo que simplifica el cumplimiento de privacidad.
- Etiquetado asistido de datasets: el modelo puede pre-anotar grandes colecciones de imágenes de plantas para que un revisor humano valide las predicciones, reduciendo el coste de curación de corpus botánicos.
- Filtrado en cámaras trampa o estaciones de monitorización: clasificación en el propio dispositivo de imágenes capturadas por sensores remotos, descartando fotogramas sin vegetación de interés antes de transmitirlos.
- Prototipado de conversión LiteRT: sirve como referencia reproducible para equipos que necesiten llevar una CNN de torchvision a GPU/NPU móvil, incluyendo el parche documentado del stem y las mediciones comparativas entre backends.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (top-1, top-5) en la información disponible. Los datos de rendimiento medidos que sí se documentan son los siguientes.

| Dispositivo / runtime | Backend | Grafo en GPU | Latencia |
|---|---|---|---|
| Pixel 8a (Tensor G3, Android 16), LiteRT `CompiledModel` | GPU | 37 / 37 | ~16 ms |
| Pixel 8a, TFLite `benchmark_model` (`TfLiteGpuDelegateV2`) | GPU (OpenCL) | 37 / 37 | 19,9 ms |
| Pixel 8a, TFLite `benchmark_model` | CPU (XNNPACK, 4 hilos) | — | 61,8 ms |
| Samsung Galaxy S26 (Snapdragon 8 Elite Gen 5, Hexagon v81), LiteRT `CompiledModel` | NPU, primera ejecución | — | 0,90 ms mediana / 0,88 ms mínimo |
| Samsung Galaxy S26, LiteRT `CompiledModel` | NPU, caché | — | 0,90 ms mediana / 0,89 ms mínimo |
| Samsung Galaxy S26, LiteRT `CompiledModel` | GPU (Adreno) | — | 3,49 ms mediana / 3,17 ms mínimo |
| Raspberry Pi 5, LiteRT 2.2.0.dev20260804 | CPU (XNNPACK, 4 hilos) | — | 34,1 ms p50 |
| Chromium 151 en M4 Max, LiteRT.js 2.5.3 | WebGPU | — | 2,67 ms p50 |

En el Galaxy S26, la NPU es 3,9 veces más rápida en inferencia que la GPU Adreno (0,90 ms frente a 3,49 ms). La carga del modelo en NPU es de 586 ms en el primer lanzamiento (compilación en dispositivo) y de 110 ms en lanzamientos posteriores con caché, frente a 464 ms en GPU, que reconstruye sus shaders cada vez. El archivo es fp16 y no necesita cuantización int8 para llegar a la NPU. Las dos filas de GPU del Pixel 8a corresponden a runtimes distintos y no se contradicen: la cifra de `LITERT_CL` es la registrada con el acelerador propio de LiteRT, mientras que la de `TfLiteGpuDelegateV2` es el delegado OpenCL clásico y debe leerse como suelo reproducible, no como la velocidad de este modelo en LiteRT.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de precisión ni de comparativas publicadas en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría. Cualitativamente, las alternativas naturales serían el modelo base cpoisson/plantnet300k-resnet18 (misma arquitectura y pesos, en formato PyTorch, sin optimización para dispositivo) y otras variantes de clasificación de plantas de la familia PlantNet-300K; sin embargo, no se aportan cifras de rendimiento de esas alternativas en la documentación disponible.

| Modelo | Parámetros | Contexto / entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| PlantNet-300K ResNet18 LiteRT (este modelo) | no disponible (~11,7 M según torchvision, no confirmado) | Imagen 224x224, 1081 clases | Apache-2.0 | TFLite / LiteRT | Hugging Face, 179 descargas |
| cpoisson/plantnet300k-resnet18 (base) | no disponible | Imagen 224x224, 1081 clases | Apache-2.0 | PyTorch | Hugging Face |
| Otras variantes PlantNet-300K | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se han publicado métricas de precisión (top-1, top-5) en la información disponible; no es posible evaluar la fiabilidad de la clasificación sin medirla sobre un conjunto de validación propio.
- El modelo solo reconoce las 1081 especies del dataset PlantNet-300K; cualquier planta fuera de ese conjunto se asignará a una de las clases conocidas, con riesgo de falsos positivos silenciosos.
- La entrada es fija (1x3x224x224, RGB, normalización ImageNet, center-crop y resize); no admite variaciones de resolución ni de formato sin preprocesado adicional.
- No procesa texto, audio ni vídeo, y no soporta tool calling ni agentes; cualquier uso conversacional requiere un sistema externo que traduzca los logits a respuestas.
- La conversión a GPU depende de un parche específico del stem (zero-pad + maxpool sin padding) para evitar el fallo del delegado Mali con PADV2; modificaciones del grafo o del runtime pueden romper la compatibilidad.
- La ejecución en NPU Hexagon requiere bibliotecas que no se distribuyen en el repositorio: `libLiteRtDispatch_Qualcomm.so` y `libLiteRtCompilerPlugin_Qualcomm.so` (de los releases de google-ai-edge/LiteRT) y las bibliotecas de Qualcomm (`libQnnHtp.so`, `libQnnSystem.so`, `libQnnHtpV81Stub.so`, etc.), lo que añade complejidad de despliegue.
- La latencia medida en NPU corresponde a un Snapdragon 8 Elite Gen 5 (Hexagon v81); en otros SoC el rendimiento puede diferir y no está documentado.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del dataset PlantNet-300K y de los pesos base para usos derivados.
- El modelo tiene 0 likes y 179 descargas en el momento de la consulta, lo que indica una validación comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/PlantNet-300K-ResNet18-LiteRT
- Pesos base: https://huggingface.co/cpoisson/plantnet300k-resnet18
- Dataset PlantNet-300K: https://github.com/plantnet/PlantNet-300K
- Ficha de rendimiento edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/plantnet-300k-resnet18/CARD.md
- LiteRT (Google AI Edge): https://github.com/google-ai-edge/LiteRT
- Herramienta de medición TFLite: https://ai.google.dev/edge/litert/models/measurement
