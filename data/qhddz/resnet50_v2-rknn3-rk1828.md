# qhddz/resnet50_v2-rknn3-rk1828

## Resumen

ResNet50-v2 es un modelo de clasificación de imágenes de 1000 clases (ImageNet) convertido al formato RKNN3 para su ejecución sobre la NPU Rockchip RK1828. Lo publica el usuario qhddz y no aporta pesos nuevos: se trata de una conversión del ResNet50-v2 canónico a los formatos propietarios `.rknn` y `.weight`, en variantes int8 y fp16, generadas con los pipelines oficiales del rknn3-model-zoo y verificadas, según el autor, sobre hardware RK1828 real.

Su relevancia es práctica y acotada: elimina el paso de compilación y conversión para quien despliegue visión por computador en edge sobre la plataforma RK1828, que se conecta a un host x86_64 por PCIe. No es un modelo de lenguaje ni un modelo generativo; es una CNN de clasificación de imágenes con licencia Apache-2.0 heredada del ResNet original.

El repositorio ocupa aproximadamente 0,1 GB e incluye, además de los binarios, el fichero `imagenet_labels.txt` y una imagen de ejemplo `dog_224x224.jpg`. No se dispone de información sobre pipeline, idiomas ni métricas de rendimiento publicadas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50-v2 (CNN con conexiones residuales, variante v2) |
| Parametros totales | no disponible en la informacion proporcionada (ResNet50 estándar: ~25,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224) |
| Tipos de cuantizacion | int8 y fp16 |
| Idiomas soportados | no aplica (clasificación de imágenes, sin componente textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rknn` + `.weight` (formato propietario RKNN3 para NPU Rockchip) |
| Plataforma objetivo | Rockchip RK1828 (RKNN3, host x86_64 vía PCIe) |
| Clases de salida | 1000 (ImageNet) |
| Tamano del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es ResNet50-v2, una red neuronal convolucional residual de 50 capas con bloques de tipo bottleneck y conexiones skip, en la variante de preactivación (v2) frente a la formulación original postactivación (v1). Está diseñada para clasificación de imágenes a resolución 224x224 sobre el conjunto ImageNet con 1000 clases.

El autor no documenta el proceso de entrenamiento del modelo base: no se indica número de tokens ni imágenes vistas, composición del dataset, ni si hubo ajuste fino, destilación o técnicas de aumento adicionales. Tampoco se detalla el procedimiento de cuantización más allá de la existencia de variantes int8 y fp16. La innovación técnica del artefacto no está en el modelo en sí, sino en el pipeline de conversión a RKNN3 mediante el rknn3-model-zoo oficial y en la verificación declarada sobre hardware RK1828.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet.
- Inferencia sobre NPU Rockchip RK1828 en formato RKNN3, sin necesidad de compilar ni convertir.
- Ejecución en dos precisiones: int8 (menor huella y presumiblemente mayor throughput) y fp16 (mayor fidelidad numérica).
- Integración con la API Python de `rknn3-toolkit`.
- Incluye etiquetas de ImageNet y una imagen de ejemplo lista para probar el pipeline.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un clasificador de imágenes.
- No se documentan capacidades de detección, segmentación ni visión-lenguaje.

## Casos de uso

- Clasificación de imágenes en dispositivos edge con NPU Rockchip RK1828: el modelo se carga directamente desde el `.rknn` y devuelve la clase ImageNet más probable, adecuado para sistemas embebidos con requisitos de latencia baja y consumo contenido.
- Preetiquetado en pipelines de datos: usar la variante int8 para clasificar lotes masivos de imágenes en un host x86_64 con acelerador RK1828 y reducir el trabajo de etiquetado manual.
- Control de calidad visual en líneas de producción: clasificar productos o piezas por categoría en tiempo real sobre la NPU, aprovechando la conversión ya validada para evitar trabajo de integración.
- Prototipado rápido de aplicaciones de visión: el repositorio incluye etiquetas e imagen de ejemplo, lo que permite validar el entorno RKNN3 y el toolkit antes de invertir en modelos propios.
- Benchmark de referencia de la plataforma: al ser un modelo estándar y bien conocido, sirve para medir latencia y throughput reales de la NPU RK1828 y comparar con otras plataformas.
- Módulo de clasificación dentro de sistemas mayores: como componente de un pipeline de visión (por ejemplo, filtrado previo antes de un detector o de un modelo de segmentación) sobre el mismo acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un notebook (`rk1828-notebook/01_classification.ipynb`) para consultar la latencia medida en RK1828, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- NPU Rockchip RK1828 como plataforma de ejecución; el modelo está empaquetado específicamente para RKNN3 y no es portable a otras NPU o GPU sin reconversión.
- Host x86_64 conectado por PCIe al acelerador RK1828, según indica la model card.
- No se especifican requisitos de VRAM ni de memoria del host; al tratarse de un modelo de ~25 M de parámetros, la huella de pesos es reducida (el repositorio completo ocupa ~0,1 GB).
- No cabe esperar ejecución en GPU de consumo (RTX 4090 y similares) ni en CPU mediante llama.cpp, Ollama o vLLM: el formato `.rknn` es propietario de Rockchip y estos runtimes no lo soportan.
- Despliegue mediante `rknn3-toolkit` (API Python) y los ejemplos del rknn3-model-zoo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Plataforma | Licencia |
|---|---|---|---|---|---|
| qhddz/resnet50_v2-rknn3-rk1828 | no disponible (~25,6 M en ResNet50 estándar) | Imagen 224x224, 1000 clases | `.rknn` + `.weight` | NPU RK1828 | Apache-2.0 |
| ResNet50-v2 original (PyTorch/TorchVision) | ~25,6 M | Imagen 224x224, 1000 clases | `.pth` / safetensors | GPU/CPU genéricas | BSD-3-Clause (TorchVision) |
| MobileNetV3 (clasificación edge) | ~5,4 M (Large) | Imagen 224x224, 1000 clases | múltiples (ONNX, TFLite, etc.) | CPU/GPU/NPU diversas | Apache-2.0 |
| EfficientNet-B0 (clasificación edge) | ~5,3 M | Imagen 224x224, 1000 clases | múltiples | CPU/GPU/NPU diversas | Apache-2.0 |

Los datos de parámetros de los modelos comparables son los estándar de sus arquitecturas; no se dispone de métricas de precisión ni latencia de este artefacto RKNN3 para una comparación cuantitativa.

## Limitaciones y advertencias

- Es un clasificador de imágenes de 1000 clases de ImageNet: no genera texto, no razona y no responde a instrucciones.
- No hay métricas de precisión publicadas para las variantes int8 y fp16; la cuantización int8 puede degradar la precisión respecto al modelo en coma flotante y no se documenta el impacto.
- El artefacto está atado a la NPU RK1828 y al formato RKNN3: no es reutilizable en otras plataformas sin reconversión.
- No se documentan sesgos del modelo base ni la composición del dataset de entrenamiento original más allá de ImageNet.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas en clases ambiguas o imágenes fuera de dominio.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo ResNet original y de las herramientas RKNN3 de Rockchip para despliegues en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay evidencia de validación independiente más allá de la declaración del autor.
- No se especifican requisitos de versión de `rknn3-toolkit` ni del firmware de la NPU, lo que puede complicar la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhddz/resnet50_v2-rknn3-rk1828
- Repositorio oficial rknn3-model-zoo: https://github.com/airockchip/rknn3_model_zoo
