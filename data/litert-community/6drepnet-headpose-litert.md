# litert-community/6DRepNet-HeadPose-LiteRT

## Resumen

6DRepNet-HeadPose-LiteRT es una conversión a LiteRT (el sucesor de TFLite de Google) del modelo 6DRepNet, una red neuronal convolucional pura que estima la pose de la cabeza en 6 grados de libertad (6-DoF) a partir de un recorte facial. El modelo original fue presentado en ICIP 2022 por el grupo de investigación de la Universidad de Erlangen-Núremberg y regresa de forma continua una representación de rotación 6D que se convierte en ángulos de Euler (yaw, pitch, roll) mediante un proceso de Gram-Schmidt en el lado del host.

La versión LiteRT está optimizada para ejecutarse íntegramente en el acelerador GPU de dispositivos móviles Android (delegado `CompiledModel` con OpenCL) sin necesidad de parches ni modificación de pesos, alcanzando ~21 ms por fotograma en un Pixel 8a. También se ha validado su ejecución en la NPU Qualcomm Hexagon de dispositivos Snapdragon recientes, donde consigue ~1,74 ms de inferencia. El repositorio incluye el archivo `.tflite` de 157 MB, código de ejemplo en Kotlin y Python, y documentación sobre el proceso de conversión y despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RepVGG-B1g2 backbone (deploy/re-parameterized) + cabeza de regresión 6D — CNN pura |
| Parametros totales | no disponible (archivo de 157 MB en fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | fp16 (no requiere int8 para NPU) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | TFLite / LiteRT (.tflite) |

## Arquitectura y entrenamiento

El modelo original 6DRepNet (ICIP 2022) combina un backbone RepVGG-B1g2 en modo deploy (convoluciones 3×3 fusionadas y ReLU) con una cabeza de regresión que produce una representación de rotación 6D continua. Esta representación se convierte en una matriz de rotación 3×3 mediante ortonormalización de Gram-Schmidt y posteriormente en ángulos de Euler (yaw, pitch, roll) en el host, no dentro de la red.

Los pesos proceden del repositorio oficial de 6DRepNet, entrenados con el dataset 300W-LP. La conversión a LiteRT se realizó con la herramienta `litert-torch` (`build_6drepnet.py`), cargando los pesos en modo deploy (con las ramas `rbr_reparam` fusionadas) y exportando la entrada de recorte facial hasta la salida 6D. Al ser una CNN pura sin capas no soportadas, los 36 nodos del grafo se asignan íntegramente al delegado GPU en una única partición, con una correlación de 0,9993 respecto a la GPU y una correlación de 1,0 con la salida exacta de PyTorch en CPU.

## Capacidades

- Estimación de pose de cabeza en 6 grados de libertad (yaw, pitch y roll) a partir de un recorte facial de 224×224 píxeles.
- Ejecución completa en GPU móvil mediante el delegado `CompiledModel` de LiteRT (OpenCL), sin fallback a CPU.
- Ejecución en NPU Qualcomm Hexagon (Snapdragon 8 Elite Gen 5 y anteriores) sin conversión previa ni artefacto precompilado; LiteRT compila en el dispositivo y cachea el resultado.
- Compatible con el flujo estándar de TFLite: puede ejecutarse con el clásico `TfLiteGpuDelegateV2` o con XNNPACK en CPU.
- Entrada en formato NCHW `[1, 3, 224, 224]` RGB normalizado con medias y desviaciones de ImageNet; salida `[1, 6]` con la representación 6D.
- Decodificación host-side de la representación 6D a ángulos de Euler mediante Gram-Schmidt y funciones trigonométricas (incluye pseudocódigo en la documentación).

## Casos de uso

- Monitorización del conductor: el modelo estima la orientación de la cabeza del conductor en tiempo real para detectar fatiga, distracción o somnolencia. Se integraría en un sistema embebido del vehículo con una cámara frontal y un detector facial previo, ejecutando la inferencia en la NPU del SoC para mantener latencias inferiores a 2 ms.
- Sistemas de atención y engagement en videollamadas: permite conocer si el usuario está mirando a la cámara o a otra parte de la pantalla, útil para herramientas de telepresencia o análisis de reuniones.
- Realidad aumentada (AR): la orientación de la cabeza se puede usar para ajustar la perspectiva de objetos virtuales superpuestos al rostro, como filtros, gafas virtuales o avatares animados.
- Análisis de comportamiento en retail: estimación de la dirección de la mirada de clientes frente a expositores, combinando el modelo con un detector de caras para estudiar patrones de atención en tiendas.
- Interacción persona-robot: un robot social puede orientar su mirada o su dirección de atención en función de la pose de la cabeza del usuario, mejorando la naturalidad de la interacción.
- Control de acceso y seguridad: en sistemas de vigilancia, la pose de la cabeza puede ser un indicador de alerta (p. ej., detectar si una persona está mirando hacia un área restringida).
- Aplicaciones de accesibilidad: usuarios con movilidad reducida pueden controlar el cursor o ciertos comandos moviendo la cabeza, con la pose como señal de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible, al tratarse de un modelo de visión específico. Los datos de rendimiento proporcionados se refieren a latencia de inferencia en dispositivos móviles:

| Runtime / Backend | Dispositivo | Latencia media |
|---|---|---|
| LiteRT `CompiledModel` (GPU, OpenCL) | Pixel 8a (Tensor G3) | ~21 ms |
| TFLite `benchmark_model` (GPU, OpenCL) | Pixel 8a (Tensor G3) | 34,2 ms |
| TFLite `benchmark_model` (CPU, XNNPACK, 4 hilos) | Pixel 8a (Tensor G3) | 155,2 ms |
| LiteRT `CompiledModel` — NPU (Hexagon) | Samsung Galaxy S26 (Snapdragon 8 Elite Gen 5) | 1,74 ms (mediana) |
| LiteRT `CompiledModel` — GPU (Adreno) | Samsung Galaxy S26 (Snapdragon 8 Elite Gen 5) | 8,53 ms (mediana) |

La NPU es 4,9 veces más rápida que la GPU en el mismo dispositivo (1,74 ms frente a 8,53 ms). La primera ejecución en la NPU paga una compilación en el dispositivo de ~1287 ms, mientras que las ejecuciones posteriores cargan en ~258 ms (frente a 636 ms de la GPU).

## Requisitos de hardware

- Inferencia en GPU móvil (OpenCL): funciona en cualquier Android con GPU compatible con el delegado LiteRT. En un Pixel 8a (Tensor G3) se obtienen ~21 ms por fotograma.
- Inferencia en NPU Qualcomm: requiere las librerías de runtime de LiteRT (descargadas del repositorio de LiteRT) y las librerías QNN de Qualcomm (SDK QAIRT). Compatible con Hexagon v73 (SM8550), v75 (SM8650), v79 (SM8750) y v81 (SM8850).
- En CPU: XNNPACK con 4 hilos en un Pixel 8a, 155,2 ms por fotograma — suficiente para uso no tiempo real.
- Opciones de despliegue: LiteRT `CompiledModel` (Kotlin/Android), Interpreter de `ai-edge-litert` (Python), `benchmark_model` de TFLite para mediciones.
- El archivo de pesos ocupa 157 MB en fp16; no se requiere cuantización int8 para la NPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Salida | Ejecución móvil | Licencia |
|---|---|---|---|---|---|
| 6DRepNet (este) | RepVGG-B1g2 + 6D head | 157 MB (fp16) | Rotación 6D → Euler | GPU/NPU en móvil | MIT |
| Hopenet | ResNet50 + cabeza de regresión | ~100 MB | Euler angles | CPU/GPU | MIT |
| FSA-Net | CNN + módulos de atención | ~5 MB | Euler angles | CPU | MIT |
| WHENet | ResNet50 + head | ~100 MB | Euler angles (rango amplio) | CPU | MIT |

6DRepNet ofrece una representación de rotación continua 6D en lugar de ángulos de Euler directos, lo que evita problemas de discontinuidad angular y proporciona una precisión más estable. Su principal ventaja frente a alternativas es la ejecución completa en GPU/NPU móvil con latencia de pocos milisegundos, mientras que otros modelos suelen ejecutarse en CPU con latencias mayores o requieren conversiones adicionales.

## Limitaciones y advertencias

- El modelo requiere un recorte facial como entrada; el sistema debe incluir un detector de caras previo para obtener el crop correcto. Un recorte no centrado o con una escala inadecuada degrada la precisión.
- La entrada espera normalización ImageNet (media y desviación de ImageNet); aplicar otros esquemas de normalización produce resultados incorrectos.
- El modelo está entrenado principalmente con datos de 300W-LP, que contiene rostros de adultos en posiciones variadas pero con distribución demográfica limitada; el rendimiento puede degradarse en rostros infantiles, con mascarillas o en condiciones extremas de iluminación.
- La salida de ángulos de Euler tiene un rango limitado; el modelo puede no ser preciso para poses de cabeza muy extremas (por ejemplo, mirar casi hacia atrás).
- La ejecución en la NPU de Qualcomm requiere librerías adicionales que no se distribuyen desde este repositorio (dependen de Google y Qualcomm) y puede variar según la versión de Hexagon del dispositivo.
- El archivo de 157 MB es considerable para una aplicación móvil; puede ser necesario aplicar cuantización int8 para reducir el tamaño si la precisión lo permite.
- Licencia MIT, sin restricciones de uso comercial, pero el modelo original está entrenado con datasets que pueden tener sus propias condiciones de uso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/6DRepNet-HeadPose-LiteRT
- Repositorio GitHub de LiteRT-Models (misma documentación): https://github.com/john-rocky/LiteRT-Models/tree/main/sixdrepnet
- Repositorio original de 6DRepNet: https://github.com/thohemp/6DRepNet
- Documentación de medición de modelos LiteRT: https://ai.google.dev/edge/litert/models/measurement
