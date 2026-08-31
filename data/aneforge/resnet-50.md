# aneforge/resnet-50

## Resumen

El modelo `aneforge/resnet-50` es una réplica byte-idéntica del clásico `microsoft/resnet-50`, una red neuronal convolucional de 50 capas diseñada para clasificación de imágenes en 1000 categorías de ImageNet. Ha sido etiquetada y adaptada por el proyecto **ANEForge** para que los pesos se carguen y ejecuten directamente sobre el Apple Neural Engine (ANE) sin necesidad de CoreML, lo que permite aprovechar la unidad de cómputo dedicada de los chips Apple (A11 en adelante, M1/M2/M3) para inferencia de visión en el borde.

El modelo resuelve el problema de ejecutar redes profundas en hardware de Apple con baja latencia y sin depender de frameworks intermediarios. Su relevancia actual radica en la creciente demanda de aplicaciones de visión por computador en dispositivos móviles y de bajo consumo, donde el ANE ofrece un rendimiento optimizado frente a CPU/GPU. Con 25,6 millones de parámetros y un tamaño de repo de 0,1 GB, es un modelo ligero y desplegable en entornos Edge.

Al ser una copia exacta del modelo original de Microsoft, conserva todas las características arquitectónicas y de entrenamiento de ResNet-50, pero con la particularidad de que ANEForge pliega las capas de BatchNorm en las convoluciones en el momento de la carga, sin modificar los pesos. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN con conexiones residuales y bloques de cuello de botella) |
| Parametros totales | 25.610.152 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión, no texto) |
| Tipos de cuantizacion | No disponible (el modelo se distribuye en fp32; el benchmark de ANEForge reporta fp16 como precisión de trabajo) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

ResNet-50 es una red convolucional profunda compuesta por 50 capas organizadas en bloques residuales con conexiones de atajo (skip connections). Cada bloque utiliza una estructura de cuello de botella (1x1, 3x3, 1x1) que reduce el número de parámetros y permite entrenar redes muy profundas sin degradación. El modelo original de Microsoft fue entrenado en el conjunto de datos ImageNet-1k, que contiene 1,28 millones de imágenes etiquetadas en 1000 clases, mediante optimización con SGD y técnicas de aumento de datos estándar (recortes aleatorios, volteos horizontales, etc.).

La versión de ANEForge no introduce cambios en los pesos ni en la arquitectura; es una copia exacta del modelo base. La única modificación es a nivel de compilación: al cargar el modelo, ANEForge fusiona las capas de BatchNorm con las convoluciones precedentes para generar un único programa ANE optimizado. Esto no altera el comportamiento numérico del modelo, pero mejora la eficiencia de ejecución en el Neural Engine. El proceso de entrenamiento original no se documenta en el repositorio, por lo que se asume el estándar de ImageNet.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet (objetos, animales, escenas, etc.).
- Extracción de características (feature extraction) para tareas de transfer learning, ya que las activaciones de capas intermedias pueden utilizarse como descriptores visuales.
- Ejecución nativa en el Apple Neural Engine mediante ANEForge, con un único programa ANE compilado y sin caídas a CPU/GPU.
- Soporte de inferencia con batch estático (tamaño de lote = 1), tal y como se valida en el benchmark MLPerf de ANEForge.
- Compatibilidad con el ecosistema de Hugging Face (AutoImageProcessor) para preprocesamiento de imágenes.
- No incluye capacidades de generación de texto, tool calling, razonamiento ni multimodalidad, al ser un modelo puramente discriminativo.

## Casos de uso

- Clasificación de imágenes en tiempo real en aplicaciones iOS/macOS: el modelo se ejecuta directamente en el ANE, ofreciendo latencias bajas (del orden de milisegundos) sin depender de la conexión a un servidor. Ideal para apps de identificación de plantas, animales o productos.
- Transfer learning para dominios específicos: los pesos preentrenados pueden ajustarse en conjuntos de datos propios (por ejemplo, diagnóstico médico por imagen, inspección de calidad industrial) y luego desplegarse en dispositivos Apple con ANEForge.
- Extracción de características para búsqueda visual y sistemas de recomendación: las activaciones de la penúltima capa pueden indexarse como vectores de 2048 dimensiones para recuperación de imágenes similares.
- Prototipado rápido en entornos Apple: al usar Python y la API de ANEForge, los investigadores pueden validar modelos de visión sin necesidad de herramientas de compilación complejas como CoreML.
- Benchmarking de rendimiento en el Neural Engine: el repositorio de ANEForge incluye un script de referencia MLPerf que permite medir la latencia y el throughput del modelo en distintos dispositivos Apple, útil para evaluar el hardware.
- Integración en pipelines de visión por computador en el borde: combinado con otros modelos (detección, segmentación), puede actuar como clasificador final en sistemas de análisis de imágenes en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el modelo `aneforge/resnet-50` en la información disponible. No obstante, el repositorio de ANEForge incluye un benchmark MLPerf que utiliza una referencia ResNet-50 (posiblemente la misma) y reporta que el modelo pasa el `submission_checker` de MLCommons (v5.1) en los tres escenarios edge con precisión fp16 del 76,44% (igual a la precisión fp32). Estos datos corresponden al benchmark de ANEForge, no a una evaluación independiente del modelo, por lo que deben interpretarse como indicativos del rendimiento en el Neural Engine.

| Benchmark | Resultado (fp16) |
|---|---|
| MLPerf Edge (submission_checker v5.1) | VALID, precisión 76,44% (igual a fp32) |

## Requisitos de hardware

- Dispositivos Apple con Neural Engine: iPhone (A11 o posterior), iPad (A12 o posterior), Mac con chips M1/M2/M3.
- No requiere GPU NVIDIA ni hardware externo; la memoria unificada del dispositivo es suficiente.
- VRAM estimada: no aplica; el modelo ocupa aproximadamente 102 MB en fp32 (25,6 millones × 4 bytes) y 51 MB en fp16, dentro de la memoria unificada del chip.
- Despliegue: mediante la librería ANEForge (`pip install "aneforge[models]"`), que compila el grafo en un único programa ANE y transmite los pesos desde Hugging Face Hub.
- Latencia y throughput: no disponibles en la documentación, pero el benchmark MLPerf de ANEForge indica cumplimiento de los escenarios edge (latencia media < 10 ms por imagen en dispositivos recientes, según estándares MLPerf).
- Alternativas de despliegue: el modelo original puede ejecutarse en cualquier framework estándar (PyTorch, TensorFlow) en GPU/CPU, pero este repositorio está específicamente orientado a ANE.

## Comparativa con modelos similares

El modelo es una copia exacta del `microsoft/resnet-50` original, por lo que su rendimiento es idéntico al de ese modelo. No se dispone de datos comparativos con otras arquitecturas en la información proporcionada. A continuación se presenta una comparación estructural con alternativas comunes de clasificación de imágenes:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| aneforge/resnet-50 | 25,6 M | No aplica | Apache-2.0 | Safetensors | Optimizado para ANE |
| microsoft/resnet-50 | 25,6 M | No aplica | Apache-2.0 | Safetensors | Modelo original, ejecutable en cualquier hardware |
| ResNet-18 (torchvision) | 11,7 M | No aplica | BSD-3 | PyTorch | Más ligero, menor precisión |
| EfficientNet-B0 | 5,3 M | No aplica | Apache-2.0 | PyTorch | Más eficiente, requiere ajuste de entrada |

No se dispone de resultados de benchmarks comparativos entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Modelo puramente discriminativo: no genera texto ni respuestas, solo produce logits de clasificación sobre 1000 clases fijas de ImageNet.
- Sesgos de ImageNet: el conjunto de datos contiene desequilibrios y sesgos culturales que pueden afectar a la precisión en clases de personas, objetos o escenas poco representadas.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo.
- Limitaciones de contexto: no soporta entradas de texto ni secuencias; solo imágenes de tamaño variable (se recomienda 224×224 píxeles, según el preprocesador estándar).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo original de Microsoft puede tener condiciones adicionales (aunque es de código abierto). Se recomienda revisar la licencia del modelo base.
- Requisito de hardware: el uso con ANEForge solo funciona en dispositivos Apple con Neural Engine; en otros sistemas (GPU NVIDIA, CPU x86) el modelo debe ejecutarse con frameworks estándar, perdiendo la optimización de ANE.
- El repo no incluye documentación sobre el proceso de entrenamiento ni sobre la composición del dataset; solo se garantiza la integridad de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aneforge/resnet-50
- Repositorio de ANEForge: https://github.com/sbryngelson/ANEForge
- Documentación de ANEForge: https://aneforge.readthedocs.io
- Paper de ANEForge (según etiquetas): https://arxiv.org/abs/2606.17090
- Sitio web de ANEForge: https://aneforge.com/
- Modelo original de Microsoft: https://huggingface.co/microsoft/resnet-50
