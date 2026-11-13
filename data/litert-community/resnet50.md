# litert-community/resnet50

## Resumen

ResNet-50 es una red neuronal convolucional (CNN) de 50 capas publicada originalmente por Kaiming He et al. en el artículo "Deep Residual Learning for Image Recognition" (2015). Este repositorio concreto, `litert-community/resnet50`, no es el checkpoint original de PyTorch, sino una conversión del checkpoint de TorchVision al formato LiteRT/TFLite, publicada por la comunidad LiteRT (antigua TFLite) de Google en Hugging Face. El modelo resuelve el problema de clasificación de imágenes en 1000 categorías (ImageNet-1k) y su relevancia actual radica en que ofrece una versión lista para desplegar en dispositivos de borde (móvil, NPU, CPU) con tres variantes de cuantización.

La arquitectura es una CNN residual con 25.557.032 parámetros, entrenada sobre ImageNet-1k. El repositorio incluye tres ficheros: punto flotante, cuantización dinámica de pesos (INT8 pesos / FP32 activaciones) y cuantización estática W8A8 con calibración sobre imágenes reales de validación de ImageNet. El tamaño total del repositorio es de 0,6 GB.

El modelo está pensado para inferencia en producción sobre hardware heterogéneo: la variante de coma flotante funciona en CPU y GPU, mientras que la variante INT8 estática está orientada a NPU de Qualcomm y MediaTek. No es un modelo generativo ni multimodal: es un clasificador de imagen puro, y su utilidad debe evaluarse en ese contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN residual (ResNet-50, 50 capas con conexiones residuales) |
| Parametros totales | 25.557.032 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 224x224 RGB) |
| Tipos de cuantizacion | FP32 (coma flotante); dinámica W-int8/A-fp32; estática W8A8 channelwise (STATIC_WI8_AI8) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de salida son las 1000 clases de ImageNet-1k en inglés) |
| Licencia | no disponible (la model card remite a las licencias de PyTorch Vision y del dataset de entrenamiento) |
| Formato de pesos | TFLite / LiteRT (`.tflite`); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

ResNet-50 es una red convolucional profunda que introduce el aprendizaje residual: cada bloque aprende una función residual `F(x) = H(x) - x` mediante atajos de identidad, lo que mitiga el problema del desvanecimiento del gradiente y permite entrenar redes de 50 capas de forma estable. La arquitectura usa convoluciones 3x3 y 1x1, normalización por lotes y pooling global promedio antes de la capa fully-connected de 1000 salidas.

El checkpoint de este repositorio se convirtió desde PyTorch Vision. Según la model card, el checkpoint fuente reporta un 80,858 % de top-1 y un 95,434 % de top-5 en ImageNet-1K, cifras que corresponden al modelo original de TorchVision y no a las versiones TFLite publicadas aquí, cuyas métricas declaradas son inferiores (ver sección de benchmarks). No se detalla en la información disponible el número de tokens ni la composición exacta del dataset más allá de ImageNet-1k, ni si hubo ajuste fino posterior a la conversión. La variante INT8 estática se calibró con imágenes reales del split de validación de ImageNet usando el flujo de preprocesado de TorchVision ResNet.

La innovación técnica relevante aquí no está en la arquitectura (que es la de 2015) sino en el empaquetado: conversión a LiteRT con tres recetas de cuantización y compatibilidad declarada con CPU, GPU y NPU (Qualcomm/MediaTek para la variante INT8).

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet-1k (top-1 y top-5).
- Extracción de características visuales (el backbone es reutilizable para tareas downstream, aunque el repositorio no lo documenta explícitamente).
- Inferencia en dispositivo de borde: CPU, GPU y NPU según la variante.
- Entrada fija de imagen RGB 224x224 en formato NCHW (la variante INT8 estática usa tensor de entrada INT8 cuantizado `[1, 3, 224, 224]`).
- Salida de logits de 1000 dimensiones (la variante INT8 estática devuelve logits cuantizados `[1, 1000]`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, visión multimodal, audio ni modo thinking. No es un modelo de lenguaje.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: el fichero `resnet50.tflite` o el dinámico cuantizado se integran vía `ai-edge-litert` en apps Android/iOS para etiquetar fotos localmente sin enviar datos a la nube.
- Filtrado y moderación de contenido visual en el borde: clasificar imágenes subidas por usuarios en categorías ImageNet antes de decidir si requieren revisión humana, aprovechando la inferencia en CPU/NPU del dispositivo.
- Preprocesado en pipelines de visión por computador: usar el modelo como extractor de características o clasificador de primera etapa en un sistema mayor (por ejemplo, descartar imágenes que no contienen la clase de interés).
- Despliegue en hardware con NPU Qualcomm o MediaTek: la variante `resnet50_int8_channelwise.tflite` está diseñada para aceleradores NPU, útil en dispositivos IoT, cámaras inteligentes o wearables con presupuesto energético limitado.
- Prototipado rápido de clasificación de imagen: el script de ejemplo de la model card permite tener un clasificador funcional en pocas líneas con `huggingface_hub` y `ai-edge-litert`, adecuado para validar ideas antes de invertir en modelos mayores.
- Benchmark de referencia en evaluación de runtimes: ResNet-50 es un estándar de facto para medir latencia y throughput de frameworks de inferencia (LiteRT, TFLite, ONNX Runtime) en distintos hardware.
- Educación y experimentación con cuantización: las tres variantes permiten comparar precisión y rendimiento entre FP32, cuantización dinámica y estática W8A8 en el mismo modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre ImageNet-1k split de validación:

| Metrica | Valor |
|---|---|
| Top-1 Accuracy (Full Precision) | 0,7611 |
| Top-5 Accuracy (Full Precision) | 0,9289 |
| Top-1 Accuracy (Dynamic Quantized wi8 afp32) | 0,7610 |
| Top-5 Accuracy (Dynamic Quantized wi8 afp32) | 0,9292 |

Para referencia, la model card indica que el checkpoint fuente de PyTorch Vision reporta 80,858 % top-1 y 95,434 % top-5, cifras superiores a las de las versiones TFLite publicadas. No se han publicado en la información disponible resultados de latencia, throughput ni benchmarks de la variante INT8 estática.

## Requisitos de hardware

- VRAM/tamaño en disco: el repositorio completo ocupa 0,6 GB; cada fichero `.tflite` individual es sustancialmente menor (el modelo tiene 25,5 M de parámetros, aproximadamente 100 MB en FP32 y 25 MB en INT8).
- GPU recomendadas: no se especifican en la información disponible. La variante de coma flotante declara soporte de GPU; la variante INT8 estática no soporta GPU.
- Compatibilidad consumer: por tamaño, cabe holgadamente en cualquier GPU de consumo e incluso en dispositivos móviles; el repositorio no detalla modelos concretos de GPU.
- Opciones de despliegue: `ai-edge-litert` (API `CompiledModel` mostrada en la model card), LiteRT/TFLite runtime, y por extensión los runtimes que aceptan `.tflite`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imagen).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Top-1 ImageNet-1k | Formato | Licencia |
|---|---|---|---|---|---|
| litert-community/resnet50 (este) | 25,5 M | 224x224 RGB | 0,7611 (TFLite FP32) | TFLite/LiteRT | no disponible |
| ResNet-50 TorchVision (checkpoint fuente) | 25,5 M | 224x224 RGB | 0,80858 | PyTorch | licencia de PyTorch Vision |
| Otras CNN comparables (p. ej. MobileNet, EfficientNet) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks de alternativas como MobileNetV3 o EfficientNet-B0 para una comparación cuantitativa fiable. La comparación principal disponible es contra el propio checkpoint fuente de PyTorch Vision, que reporta mayor precisión que la conversión TFLite.

## Limitaciones y advertencias

- Solo clasifica en las 1000 clases de ImageNet-1k; no reconoce categorías fuera de ese vocabulario.
- Las métricas declaradas (0,7611 top-1) son inferiores a las del checkpoint fuente de PyTorch Vision (0,80858 top-1); conviene validar la pérdida de precisión en el caso de uso concreto.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) por el autor.
- La licencia no está disponible de forma explícita: la model card advierte de que los modelos pueden tener licencias o términos derivados de PyTorch Vision y del dataset de entrenamiento, y que es responsabilidad del usuario determinar si tiene permiso para su caso de uso. No se garantiza uso comercial sin verificación previa.
- La variante INT8 estática no soporta GPU y requiere NPU Qualcomm o MediaTek; la variante dinámica cuantizada no tiene fila de compatibilidad declarada en la tabla de la model card.
- La variante INT8 estática exige gestionar manualmente los parámetros de cuantización del tensor de entrada y salida cuando se usan APIs de buffer crudo.
- Riesgo de sesgo heredado de ImageNet-1k (desequilibrios de clase, sesgos culturales y geográficos en las anotaciones).
- No es un modelo generativo: no hay riesgo de alucinación textual, pero sí de clasificaciones erróneas en imágenes fuera de distribución o ambiguas.
- No hay información sobre idiomas ni sobre el rendimiento en dominios distintos de ImageNet (médico, satelital, industrial).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/resnet50
- Organización LiteRT Community: https://huggingface.co/litert-community
- Paper original (He et al., 2015): https://arxiv.org/pdf/1512.03385
- Etiquetas ImageNet-1k usadas en el ejemplo: https://huggingface.co/datasets/huggingface/label-files (fichero `imagenet-1k-id2label.json`)
- Documentación de LiteRT / ai-edge-litert: no disponible en la información proporcionada.
