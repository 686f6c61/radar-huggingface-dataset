# resoajoe/camera-health-nano

## Resumen

`camera-health-nano` es un modelo de clasificación de imágenes multilabel ultracompacto desarrollado por resoajoe (Joe Cox) para la detección de fallos hardware en cámaras de vigilancia desplegadas en producción. Con solo 47.029 parámetros y un peso de 188 KB, está diseñado para ejecutarse en cada fotograma incluso en hardware con capacidades muy limitadas, lo que lo sitúa en la categoría de modelos de borde o edge AI.

El modelo resuelve un problema concreto: identificar de forma automática si una cámara está sufriendo degradaciones físicas o del sensor, como lentes desenfocadas, ruido creciente en el sensor, píxeles atascados u obstrucciones parciales. Emplea una arquitectura convolucional de 4 capas que procesa parches de 64×64 píxeles en escala de grises, y produce cinco salidas independientes (sigmoides) para cinco tipos de fallo, lo que permite que varios fallos coexistan en una misma imagen.

Su relevancia actual reside en la gestión de flotas de cámaras a gran escala: permite monitorizar la salud de decenas de miles de dispositivos con un coste computacional despreciable, sin depender de telemetría propietaria. El autor ha sido transparente sobre las limitaciones del modelo, documentando qué cabezas de clasificación son fiables en datos reales y cuáles no, un enfoque poco común y muy valioso para la evaluación práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN convolucional, 4 capas (16→32→48→64 canales) |
| Parametros totales | 47.029 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision, entrada 64×64) |
| Tipos de cuantizacion | ONNX (no se especifican cuantizaciones adicionales) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (safetensors no disponible) |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional (CNN) de 4 capas con canales que crecen de 16 a 64. La entrada es un parche de 64×64 píxeles en escala de grises, normalizado por parche (se resta la media y se divide por la desviación estándar). Esta normalización es deliberada: el modelo es ciego al brillo absoluto para responder a la estructura de la imagen en lugar de a la exposición.

El entrenamiento se realizó sobre 3.892 parches de entrenamiento y 1.298 de prueba, extraídos de fotografías COCO. Los fallos se muestrearon de forma independiente con probabilidad p=0,30 cada uno, lo que permite que las combinaciones de fallos aparezcan naturalmente, como ocurre en el campo. La función de pérdida es BCE (Binary Cross Entropy) con ponderación positiva limitada (positive weighting capped). La división train/test se hizo por fotografía de origen, evitando la fuga de datos entre conjuntos.

No se ha utilizado RLHF, DPO ni ninguna técnica de ajuste por refuerzo. La innovación principal es el diseño para que una única pasada hacia adelante produzca cinco detecciones independientes, con un coste computacional mínimo. El autor ha documentado un proceso de experimentación en el que se descartaron cabezas adicionales (como detección de condensación) porque no superaban a un umbral simple sobre una estadística barata.

## Capacidades

- Detección de cinco fallos hardware: `occluded` (obstrucción), `defocus` (desenfoque), `noise_drift` (deriva de ruido), `hot_pixels` (píxeles atascados) y `banding` (bandas).
- Clasificación multilízo: puede detectar varios fallos simultáneamente en la misma imagen.
- Inferencia en tiempo real: 47.029 parámetros, 188 KB, una sola pasada hacia delante.
- Operación en escala de grises: insensible a fallos de color o balance de blancos.
- Normalización por parche: robusto a cambios de exposición global.
- No incluye tool calling, agentes, generación de texto, ni soporte multilingüe (es un modelo de visión puro).

## Casos de uso

- **Monitorización de flotas de cámaras de seguridad**: el modelo puede ejecutarse en cada fotograma de cada cámara, detectando desenfoque progresivo de lente o ruido creciente del sensor, y enviando alertas al centro de control. Es adecuado porque su coste computacional es despreciable y puede funcionar en hardware embebido sin GPU.
- **Mantenimiento predictivo de infraestructura**: en instalaciones con cientos de cámaras de tráfico o vigilancia, el modelo puede señalar qué cámaras requieren limpieza, reenfoque o sustitución antes de que fallen por completo. La detección de obstrucción y píxeles atascados permite programar mantenimiento preventivo.
- **Control de calidad en sistemas de visión industrial**: en fábricas donde las cámaras inspeccionan productos, el modelo puede verificar la salud de las propias cámaras, garantizando que los defectos no se deban a fallos del sensor sino a los productos.
- **Monitorización de cámaras IP domésticas**: un servicio de cloud puede analizar remotamente los fotogramas de cámaras domésticas para avisar al usuario si su cámara se ha desenfocado o está parcialmente obstruida, sin enviar datos a la nube (se puede ejecutar en el propio dispositivo).
- **Autodiagnóstico en robots móviles con cámaras**: robots de reparto o limpieza pueden comprobar la salud de sus propios sensores visuales durante la operación, detectando si una lente se ha desviado o si el sensor está degradado.
- **Evaluación de la calidad de la señal en sistemas de videovigilancia**: el modelo puede comparar el ruido del sensor de una cámara con una línea base, alertando cuando la relación señal-ruido se degrada, lo que sugiere problemas de hardware inminentes.

## Benchmarks y rendimiento

Los datos de rendimiento se presentan en dos escenarios: en dominio (imágenes COCO held-out, n=1298) y fuera de dominio (fotogramas reales de una Logitech BRIO en una oficina durante 24 horas, n=1600). El autor compara el modelo contra el mejor clasificador de umbral simple sobre una estadística barata, ajustado de forma optimista (in-sample).

**En dominio (imágenes COCO)**:

| Fallo | Accuracy | Majority | Lift | Recall |
|---|---|---|---|---|
| occluded | 0.918 | 0.730 | +0.188 | 0.911 |
| defocus | 0.890 | 0.687 | +0.203 | 0.889 |
| noise_drift | 0.916 | 0.699 | +0.217 | 0.877 |
| hot_pixels | 0.898 | 0.701 | +0.196 | 0.765 |
| banding | 0.904 | 0.722 | +0.182 | 0.831 |

**Fuera de dominio (fotogramas reales, Logitech BRIO)**:

| Fallo | Accuracy | Lift | Recall | Precision |
|---|---|---|---|---|
| occluded | 0.958 | +0.256 | 0.858 | 1.000 |
| defocus | 0.980 | +0.283 | 0.965 | 0.969 |
| noise_drift | 0.876 | +0.203 | 0.621 | 1.000 |
| hot_pixels | 0.929 | +0.217 | 0.814 | 0.931 |
| banding | 0.621 | −0.093 | 0.954 | 0.427 |

El modelo supera al clasificador escalar en todos los fallos excepto en `banding`, donde el escalar (0.713) supera al modelo (0.621). En `occluded`, el escalar (0.978) supera al modelo (0.958), por lo que el autor recomienda usar un umbral sobre la entropía del fotograma en lugar del modelo para este caso. No se han publicado resultados comparativos con otros modelos de clasificación de imágenes.

## Requisitos de hardware

- **VRAM**: el modelo pesa 188 KB en formato ONNX, por lo que cabe en cualquier dispositivo con memoria disponible, incluso microcontroladores con decenas de KB de RAM.
- **GPU**: no se requiere GPU. El modelo está diseñado para CPU, y puede ejecutarse en hardware embebido (Raspberry Pi, Jetson Nano, etc.) o incluso en dispositivos móviles.
- **Despliegue**: se proporciona ejemplo de uso con `onnxruntime` con `CPUExecutionProvider`. Puede integrarse con cualquier framework que soporte ONNX, como TensorRT, OpenVINO, o llama.cpp (aunque no es un modelo de texto).
- **Latencia**: no se proporcionan datos de latencia, pero con 47.029 parámetros y una sola pasada de convolución, la inferencia en CPU es del orden de milisegundos o microsegundos.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (detección de fallos de cámara en borde). Como referencia, se puede comparar con:

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| camera-health-nano | 47.029 | 64×64 grayscale | Detección de fallos de cámara (5 cabezas) | MIT |
| no disponible | - | - | - | - |

El autor menciona en su perfil de HuggingFace que se interesa en nano-modelos para industrias, lo que sugiere que es un área emergente con poca competencia directa. Para un contexto más amplio, se puede comparar con modelos de clasificación de imágenes como MobileNet, pero no son comparables en tarea ni en tamaño.

## Limitaciones y advertencias

- **La capa `banding` es inutilizable**: en fotogramas reales obtiene un lift negativo (−0.093) y precisión 0.427, lo que significa que se activa en casi todo. El autor recomienda no usarla en producción.
- **La capa `noise_drift` tiene una recall baja (0.621) en datos reales**: aunque su precisión es perfecta (1.000), no detecta aproximadamente el 40% de los fotogramas con ruido. No debe tratarse el silencio como señal de que todo está bien.
- **Los fallos son sintéticos**: el modelo se entrenó con fallos simulados (desenfoque gaussiano, ruido sintético, etc.), que no reflejan exactamente los defectos ópticos reales ni la obstrucción con sombras suaves o transparencia parcial.
- **Entrada en escala de grises y 64×64**: los fallos de color (fallo del filtro IR-cut, bloqueo del balance de blancos) son invisibles para el modelo.
- **Un solo parche**: el modelo analiza un único parche de 64×64. Si un fallo está localizado en una esquina, un parche central no lo detectará. Se recomienda muestrear varios parches y votar.
- **No es un sistema de seguridad**: no es resistente a manipulaciones deliberadas ni puede representar una persona (64×64 en grises). No debe usarse para vigilancia.
- **Licencia MIT**: permite uso comercial sin restricciones, pero el autor advierte que es un modelo experimental con limitaciones documentadas.

## Enlaces

- Modelo en HuggingFace: [https://huggingface.co/resoajoe/camera-health-nano](https://huggingface.co/resoajoe/camera-health-nano)
- Perfil del autor: [https://huggingface.co/resoajoe](https://huggingface.co/resoajoe)
- Proyecto relacionado (LogLens): [https://huggingface.co/spaces/resoajoe/loglens](https://huggingface.co/spaces/resoajoe/loglens)
- No se han encontrado papers, repositorios de código ni demos adicionales.
