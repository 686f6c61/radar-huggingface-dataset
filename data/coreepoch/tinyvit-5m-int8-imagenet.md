# CoreEpoch/tinyvit-5m-int8-imagenet

## Resumen

TinyViT-5M INT8 es un modelo de clasificación de imágenes basado en el vision transformer TinyViT de 5 millones de parámetros (Wu et al., 2022), cuantizado a INT8 por CoreEpoch mediante su herramienta Kenosis. El modelo original `timm/tiny_vit_5m_224.dist_in22k_ft_in1k`, entrenado en ImageNet-22K y ajustado en ImageNet-1K, se ha convertido a ONNX y cuantizado sin reentrenamiento, usando únicamente 128 imágenes para calibración. El resultado es un único archivo de 9,23 MB que alcanza un 80,53 % de precisión top-1 en ImageNet-1K, apenas 0,34 puntos porcentuales por debajo del baseline FP32 (80,87 %).

La relevancia de este modelo radica en su despliegue en entornos de borde y CPU sin aceleradores dedicados: el archivo ONNX puede ejecutarse con ONNX Runtime u OpenVINO en hardware de bajo consumo, manteniendo una precisión competitiva para su tamaño. No requiere GPU ni memoria de vídeo, lo que lo hace adecuado para dispositivos embebidos, servidores sin aceleradores o aplicaciones de clasificación en tiempo real con presupuesto de cómputo limitado. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyViT (vision transformer con atención lineal) |
| Parametros totales | 5 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada fija de imagen 224x224) |
| Tipos de cuantizacion | INT8 (ONNX) |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (INT8, archivo único) |

## Arquitectura y entrenamiento

El modelo base es TinyViT-5M, un vision transformer compacto que emplea atención lineal para reducir el coste cuadrático de la atención estándar, lo que lo hace especialmente eficiente en dispositivos con poca memoria. El modelo original fue preentrenado en ImageNet-22K y posteriormente ajustado en ImageNet-1K (`dist_in22k_ft_in1k`), alcanzando un 80,87 % de top-1 en FP32.

La cuantización a INT8 se realizó con Kenosis, la herramienta de CoreEpoch (patente en trámite), utilizando calibración con 128 imágenes de ImageNet-1K sin reentrenamiento. El proceso cuantiza pesos y activaciones a enteros de 8 bits, lo que reduce el tamaño de 22,1 MB a 9,23 MB. La precisión medida sobre 49.872 imágenes de validación (disjuntas de las de calibración) muestra una pérdida de solo 0,34 puntos porcentuales en CPUs con soporte AVX-VNNI; en CPUs sin VNNI, la degradación es mayor, aproximadamente 0,9 puntos respecto al FP32.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1K, con salida logits de tamaño `[1, 1000]` en orden synset.
- Preprocesado estándar de ImageNet: entrada RGB `1x3x224x224`, normalización con media y desviación de ImageNet, escalado y recorte central a 224x224.
- Inferencia en CPU y GPU mediante ONNX Runtime u OpenVINO, sin necesidad de acelerador específico.
- Bajo uso de memoria (9,23 MB), adecuado para despliegue en dispositivos de borde y sistemas embebidos.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente discriminativo para visión.

## Casos de uso

- Clasificación de imágenes en dispositivos de borde: el modelo cabe en 9,23 MB y se ejecuta en CPU, por lo que puede integrarse en cámaras inteligentes, drones o dispositivos IoT para clasificar objetos en tiempo real sin depender de conexión a la nube.
- Moderación de contenido automatizada: clasificar imágenes en categorías predefinidas (por ejemplo, contenido inapropiado, tipos de producto) en servidores sin GPU, procesando grandes volúmenes con bajo coste hardware.
- Etiquetado automático de imágenes en fototecas o sistemas de gestión de activos: procesar colecciones de imágenes para asignar categorías o metadatos, aprovechando la licencia Apache-2.0 para uso comercial.
- Sistemas de asistencia en agricultura o inspección industrial: clasificar imágenes de cultivos o piezas de producción en categorías (por ejemplo, estado de salud, defectos) con hardware de bajo coste en campo.
- Demo y prototipado rápido: gracias al tamaño y facilidad de carga con ONNX Runtime, sirve como baseline para validar pipelines de clasificación en producción antes de escalar a modelos mayores.
- Entrenamiento de modelos de visión por transferencia: aunque el modelo está cuantizado, puede usarse como extractor de características para tareas downstream, aunque para ese fin es preferible el modelo FP32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, salvo la precisión en ImageNet-1K validación reportada por el autor. La tabla siguiente resume los datos proporcionados:

| Modelo | Top-1 ImageNet-1K | Delta vs FP32 | Tamano |
|---|---|---|---|
| TinyViT-5M FP32 (baseline) | 80,87 % | — | 22,1 MB |
| TinyViT-5M INT8 (Kenosis) | 80,53 % | −0,34 | 9,23 MB |

La precisión INT8 se midió en CPU con AVX-VNNI; en CPUs sin VNNI, el top-1 INT8 se sitúa aproximadamente 0,9 puntos por debajo del FP32. No hay datos de latencia o throughput publicados en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0 MB (inferencia en CPU; si se usa GPU, el modelo ocupa menos de 10 MB de memoria de vídeo).
- GPU recomendada: no requiere GPU; funciona en cualquier CPU con soporte de ONNX Runtime, incluidas CPUs sin AVX-VNNI (aunque con menor precisión).
- Cabe en consumer GPU y en dispositivos embebidos: el archivo de 9,23 MB y la baja demanda de cómputo lo hacen apto para Raspberry Pi, NVIDIA Jetson, o incluso microcontrollers con soporte de ONNX Runtime.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), OpenVINO, o cualquier runtime compatible con ONNX. No está disponible en formato GGUF ni para vLLM u Ollama (no es un modelo de lenguaje).
- Latencia y throughput: no se ha reportado en la información disponible; el autor no publica afirmaciones de velocidad porque en pruebas con 4 hilos el modelo no es más rápido que FP32 (solo lo es a un hilo), por lo que se publica por su precisión bajo cuantización, no por su latencia.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El único dato comparable es el baseline FP32 del propio modelo, incluido en la tabla de benchmarks. Para contextos de clasificación de imágenes en el borde, modelos como MobileNetV3 o EfficientNet-Lite0 podrían considerarse alternativas, pero no hay resultados numéricos en las fuentes disponibles para realizar una comparación rigurosa.

| Modelo | Parametros | Top-1 ImageNet-1K | Tamano | Licencia | Formato |
|-------|------------|-------------------|--------|----------|---------|
| TinyViT-5M FP32 | 5M | 80,87 % | 22,1 MB | Apache-2.0 | ONNX |
| TinyViT-5M INT8 (Kenosis) | 5M | 80,53 % | 9,23 MB | Apache-2.0 | ONNX |
| Alternativas (MobileNetV2, EfficientNet-Lite0) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Precisión dependiente de la CPU: en procesadores sin instrucciones AVX-VNNI, la precisión top-1 desciende aproximadamente 0,9 puntos respecto al FP32, frente a los 0,34 puntos en CPUs con VNNI.
- Sesgos de ImageNet-1K: el modelo hereda los sesgos del dataset, que incluye categorías de origen occidental y puede fallar en imágenes fuera de su distribución de entrenamiento.
- Alucinación: no aplica (modelo discriminativo, no generativo), pero sí pueden producirse clasificaciones erróneas con confianza alta en imágenes fuera de dominio.
- Limitaciones de contexto: entrada fija de 224x224; no admite resolución mayor ni imágenes de proporciones distintas sin preprocesado.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero la herramienta de cuantización Kenosis tiene patente pendiente; el modelo en sí es libre de usar, pero la herramienta puede estar sujeta a restricciones.
- Rendimiento: el autor no publica afirmaciones de velocidad; en pruebas con 4 hilos no supera al FP32, por lo que no es adecuado si el objetivo principal es latencia en lugar de tamaño o precisión bajo cuantización.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/CoreEpoch/tinyvit-5m-int8-imagenet)
- [Repositorio de mediciones y baselines de CoreEpoch](https://github.com/CoreEpoch/int8-models)
- [Directorio del modelo en el repo de baselines](https://github.com/CoreEpoch/int8-models/tree/main/baselines/tinyvit-5m-int8-imagenet)
- [Página de CoreEpoch](https://coreepoch.dev)
- [Documentación de rendimiento de TinyViT en DeepWiki](https://deepwiki.com/wkcn/TinyViT/2.3-performance-and-benchmarks)
