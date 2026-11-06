# Ambarella/EfficientNet

## Resumen

EfficientNet-Lite0 es una variante de la familia EfficientNet orientada a clasificación de imágenes en dispositivos móviles y de borde (IoT, cámaras IP, SoCs de visión). El repositorio `Ambarella/EfficientNet` no contiene un modelo entrenado nuevo, sino una colección de artefactos binarios compilados y optimizados para los SoCs de Ambarella (N1-655, X7, CV7, CV72 y CV75), derivados de los pesos de referencia `efficientnet_lite0.ra_in1k` de la librería `timm` entrenados sobre ImageNet.

La relevancia de esta ficha es doble. Por un lado, documenta el proceso de despliegue de un clasificador convolucional ligero en hardware de borde especializado, con dos variantes de compresión por dispositivo: `Activation_fp16` (activaciones en FP16) y `Amba_optimized` (optimización propietaria de Ambarella). Por otro, sirve como referencia de las modificaciones que definen la familia Lite: eliminación de módulos squeeze-and-excitation, sustitución de Swish por ReLU6 y fijación del stem y la cabeza entre variantes escaladas.

El modelo de origen es un CNN de la familia EfficientNet con 224x224 de resolución de entrada y entrenamiento en ImageNet. El repositorio no incluye pesos en formato estándar (safetensors, GGUF), sino ficheros `.bin` específicos de cada SoC, lo que limita su uso fuera del ecosistema Cooper SDK / Cooper Foundry de Ambarella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN EfficientNet-Lite0 (EfficientNet sin squeeze-and-excitation, Swish sustituido por ReLU6) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 3x224x224) |
| Tipos de cuantizacion | FP16 en activaciones (`Activation_fp16`); optimización propietaria `Amba_optimized`; el diseño Lite favorece la cuantización post-entrenamiento |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | no disponible |
| Formato de pesos | `.bin` propietario por SoC; pesos de referencia en `.pth` (timm) |

## Arquitectura y entrenamiento

EfficientNet-Lite0 es un CNN de convoluciones separables en profundidad con escalado compuesto (profundidad, anchura y resolución) según el paper original de EfficientNet (arXiv:1905.11946). La variante Lite introduce tres cambios respecto al EfficientNet original: elimina los módulos squeeze-and-excitation, reemplaza la activación Swish por ReLU6 (más amigable para cuantización y para hardware con soporte limitado de operaciones) y mantiene fijo el stem y la cabeza entre las variantes escaladas para reducir latencia. La entrada es 3x224x224.

Los pesos de referencia son `efficientnet_lite0.ra_in1k`, entrenados sobre ImageNet con la receta de `timm`. No se documenta en la información disponible el número exacto de tokens o imágenes de entrenamiento, la composición del dataset más allá de ImageNet, ni si hubo fases de ajuste adicionales. Las variantes publicadas en el repositorio son artefactos compilados para los SoCs de Ambarella, con dos modos de compresión por dispositivo: `Activation_fp16` y `Amba_optimized`.

## Capacidades

- Clasificación de imágenes en 224x224 sobre las 1000 clases de ImageNet.
- Extracción de características visuales (embeddings) para tareas downstream.
- Inferencia en CPU móvil, GPU y Edge TPU, según el diseño de la familia Lite.
- Compatibilidad con cuantización post-entrenamiento gracias a ReLU6 y a la ausencia de squeeze-and-excitation.
- Despliegue en SoCs Ambarella N1-655, X7, CV7, CV72 y CV75 mediante Cooper SDK 2.5.4 y Cooper Foundry 2.3.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual.

## Casos de uso

- Clasificación de imágenes en cámaras IP y dispositivos de vigilancia: el modelo se ejecuta sobre los SoCs CV7/CV72/CV75 de Ambarella con compresión `Amba_optimized`, lo que permite clasificar fotogramas en el propio dispositivo sin enviar vídeo a la nube.
- Detección de presencia o categoría de objeto en sistemas de domótica: al ser un clasificador ligero de 224x224, se puede integrar en pipelines de bajo consumo para etiquetar recortes de imagen procedentes de un detector previo.
- Preprocesado en aplicaciones de retail inteligente: clasificación de productos o estanterías en dispositivos de borde con presupuesto térmico y energético reducido.
- Etiquetado automático de grandes volúmenes de imágenes: uso de los pesos de referencia `efficientnet_lite0.ra_in1k` en `timm` para generar pseudo-etiquetas o filtrar datasets antes de entrenar modelos mayores.
- Extracción de embeddings para búsqueda visual: la salida de la penúltima capa puede alimentar índices vectoriales para recuperación de imágenes por similitud en entornos con recursos limitados.
- Prototipado en robótica de bajo coste: clasificación de escenas o señales visuales en tiempo real sobre CPU, aprovechando la compatibilidad con cuantización y el reducido coste computacional de la variante Lite0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión top-1/top-5 en ImageNet, latencia ni throughput para los distintos SoCs.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para inferencia en CPU/GPU de borde y Edge TPU, no para GPUs de centro de datos.
- GPU recomendadas: no aplica en el contexto del repositorio; los artefactos están compilados para SoCs Ambarella N1-655, X7, CV7, CV72 y CV75.
- ¿Cabe en GPU consumer? Los pesos de referencia de `timm` (EfficientNet-Lite0) son lo bastante pequeños para ejecutarse en cualquier GPU consumer, pero el repositorio no publica pesos en formato estándar para ello.
- Opciones de despliegue: Cooper SDK 2.5.4 y Cooper Foundry 2.3 (Ambarella); para los pesos de referencia, `timm`/PyTorch.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientNet-Lite0 (este repo) | no disponible | 3x224x224 | no aplica | no disponible | Artefactos `.bin` para SoCs Ambarella |
| MobileNetV3-Small | no disponible en esta ficha | 3x224x224 | no aplica | no disponible | Pesos en `timm`/TF Hub |
| EfficientNet-B0 | no disponible en esta ficha | 3x224x224 | no aplica | no disponible | Pesos en `timm` |
| SqueezeNet 1.1 | no disponible en esta ficha | 3x224x224 | no aplica | no disponible | Pesos en `timm` |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a la categoría (clasificadores CNN ligeros para visión) y a la disponibilidad de pesos.

## Limitaciones y advertencias

- El repositorio no publica pesos en safetensors ni GGUF; solo artefactos `.bin` específicos de SoC, lo que impide su uso directo fuera del ecosistema Ambarella.
- La licencia no está declarada en la información disponible; no se puede asumir uso comercial sin verificar los términos del autor y de los pesos originales de `timm`.
- Al ser un clasificador ImageNet de 1000 clases, su vocabulario visual es limitado y no cubre categorías fuera de ese conjunto sin reentrenamiento.
- Riesgo de sesgos heredados de ImageNet (representación desigual de clases, contextos y geografías).
- No es un modelo generativo: no produce texto, no soporta instrucciones ni razonamiento, por lo que no debe evaluarse con métricas de LLM.
- La precisión y latencia reales dependen del SoC y del modo de compresión (`Activation_fp16` frente a `Amba_optimized`); no se documentan diferencias cuantitativas entre ambos.
- El tamaño del repositorio indicado (0.0 GB) sugiere que los artefactos pueden no estar completamente disponibles o que la métrica no refleja el contenido real.

## Enlaces

- HuggingFace: https://huggingface.co/Ambarella/EfficientNet
- Paper EfficientNet: https://arxiv.org/abs/1905.11946
- Implementación de referencia `timm.models.efficientnet_lite0`: https://github.com/pprp/timm/blob/master/timm/models/efficientnet.py
- Pesos originales `efficientnet_lite0.ra_in1k`: https://github.com/rwightman/pytorch-image-models/releases/download/v0.1-weights/efficientnet_lite0_ra-37913777.pth
- Dataset ImageNet: https://image-net.org
