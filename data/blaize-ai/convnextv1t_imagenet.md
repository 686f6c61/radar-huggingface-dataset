# Blaize-AI/ConvNeXtV1t_ImageNet

## Resumen

ConvNeXtV1t_ImageNet es una adaptación del modelo de clasificación de imágenes ConvNeXt (variante "t" o tiny) publicada por Blaize-AI, no un modelo de lenguaje. Se trata de la versión original de ConvNeXt presentada en el paper "A ConvNet for the 2020s" (Liu et al., Meta AI, 2022), recompilada y optimizada para ejecutarse sobre aceleradores de inferencia Blaize Xplorer mediante el Blaize Picasso SDK. El modelo original es un transformer visual de tipo convolucional puro que moderniza las CNN tradicionales incorporando elementos de los Vision Transformers (convoluciones depthwise, LayerNorm, GELU, menos activaciones y normalizaciones).

El repositorio contiene una única variante cuantizada en AMP (Automatic Mixed Precision, combinación de INT8 y BF16) a resolución de entrada 224×224, empaquetada en el formato propietario `.bm` para el hardware Graph Streaming Processor (GSP) de Blaize. No se incluyen pesos en safetensors ni GGUF, ni código de inferencia estándar de PyTorch; el único modo de uso documentado es a través del SDK del fabricante.

Su relevancia es limitada en el ecosistema general de IA open source: es un artefacto de despliegue para un acelerador de borde muy específico, con cero descargas y cero likes en el momento de la consulta. Resulta útil únicamente para desarrolladores que ya dispongan de hardware Blaize y necesiten una referencia de clasificación ImageNet preoptimizada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt (CNN moderna con elementos de Vision Transformer), variante V1 "t" (tiny) |
| Parámetros totales | no disponible (la variante tiny de ConvNeXt ronda los 28 M, pero no se confirma en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | AMP (INT8 + BF16); el autor menciona también INT8 y BF16 como métodos disponibles, pero solo publica la variante AMP |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | `.bm` (formato propietario de Blaize Picasso SDK); no se incluyen safetensors ni GGUF |
| Tarea | Clasificación de imágenes (ImageNet, 1000 clases) |
| Resolución de entrada | 224×224 |
| Dataset de entrenamiento | ImageNet 2012 |
| Framework original | PyTorch (facebookresearch/ConvNeXt) |

## Arquitectura y entrenamiento

El modelo subyacente es ConvNeXt V1 en su variante tiny, una red neuronal convolucional diseñada para competir con los Vision Transformers modernos. Su bloque sigue el esquema de un transformer: convolución depthwise 7×7, LayerNorm, proyección lineal con GELU y otra proyección, con conexión residual, pero sustituyendo la atención por convoluciones. El entrenamiento se realizó sobre ImageNet 2012 (clasificación de 1000 clases) siguiendo la receta del paper original de Meta AI.

Blaize no ha reentrenado el modelo: ha realizado únicamente optimizaciones específicas de hardware para que el grafo computacional sea compatible con el Graph Streaming Processor (GSP) de sus aceleradores Xplorer. La variante publicada aplica cuantización AMP (mezcla de INT8 para las capas donde la pérdida de precisión es tolerable y BF16 para las sensibles) y fija la resolución de entrada a 224×224. No se documentan detalles sobre el número de épocas, aumentos de datos ni técnicas de regularización empleadas en el entrenamiento original más allá de la referencia al repositorio de Meta.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet (etiquetas estándar de la competición ILSVRC 2012).
- Inferencia de baja latencia y bajo consumo sobre aceleradores Blaize Xplorer (GSP), orientada a despliegues de borde.
- Ejecución en precisión mixta AMP (INT8 + BF16) para equilibrar velocidad y exactitud.
- Inspección y validación del modelo mediante la utilidad `blaize-modeltool` del Picasso SDK.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües: es exclusivamente un clasificador de imágenes.
- No dispone de modo "thinking", visión generativa, audio ni ninguna otra capacidad multimodal más allá de la clasificación.

## Casos de uso

- Clasificación de imágenes en dispositivos de borde con acelerador Blaize Xplorer: el modelo se carga directamente en el GSP y ejecuta inferencia en AMP a 224×224, adecuado para cámaras inteligentes o sensores industriales con restricciones de potencia.
- Preprocesado en pipelines de visión industrial: filtrado y etiquetado automático de imágenes de inspección en líneas de fabricación donde se requiere baja latencia y no hay conexión a la nube.
- Prototipado de referencia con el Picasso SDK: sirve como modelo de ejemplo para validar la cadena de herramientas (`blaize-modeltool info`, carga en hardware) antes de portar modelos propios.
- Clasificación de imágenes en sistemas embebidos de vigilancia o domótica que ya integren hardware Blaize, aprovechando la licencia MIT para uso comercial.
- Benchmark de rendimiento del acelerador: al ser una variante AMP de un modelo conocido, permite medir throughput y latencia del GSP frente a ejecuciones en CPU/GPU con el mismo ConvNeXt tiny.
- Docencia o experimentación con cuantización AMP en hardware específico: útil para estudiar el impacto de INT8+BF16 en la exactitud de un clasificador ConvNeXt sin necesidad de reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud (top-1/top-5 en ImageNet), latencia ni throughput para la variante AMP sobre hardware Blaize.

## Requisitos de hardware

- Hardware obligatorio: acelerador Blaize Xplorer con arquitectura GSP; el modelo no está pensado para ejecutarse en CPU ni GPU convencionales.
- Software obligatorio: Blaize Picasso SDK instalado y configurado.
- VRAM estimada: no disponible (no aplica en el sentido habitual; el modelo se ejecuta en la memoria del acelerador GSP, cuyo tamaño no se especifica).
- GPU recomendadas: no aplica; no se documenta ejecución en A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no; el formato `.bm` es propietario y no se puede cargar con llama.cpp, Ollama, vLLM ni TGI.
- Opciones de despliegue: exclusivamente el Picasso SDK de Blaize y la utilidad `blaize-modeltool`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| ConvNeXtV1t_ImageNet (Blaize-AI) | no disponible (variante tiny) | 224×224 | `.bm` (propietario) | MIT | Blaize Xplorer (GSP) |
| ConvNeXt-T (facebookresearch) | ~28 M (según paper original) | 224×224 | PyTorch `.pth` | MIT | CPU/GPU |
| ResNet-50 | ~25,6 M | 224×224 | PyTorch, ONNX | BSD-3 | CPU/GPU |
| ViT-B/16 | ~86 M | 224×224 | PyTorch, safetensors | Apache 2.0 | CPU/GPU |

La comparativa se limita a la arquitectura y al formato: el modelo de Blaize no publica métricas de exactitud ni latencia, por lo que no es posible comparar rendimiento numérico con las alternativas. La diferencia clave es el formato propietario y la dependencia de hardware Blaize, frente a los formatos estándar (PyTorch, ONNX, safetensors) de las alternativas.

## Limitaciones y advertencias

- Modelo de clasificación de imágenes, no de lenguaje: no genera texto ni mantiene conversaciones; cualquier expectativa de uso como LLM es errónea.
- Formato `.bm` propietario: no es portable a otros entornos; sin hardware Blaize el modelo es inutilizable.
- Solo se publica la variante AMP a 224×224; no hay variantes INT8, BF16 ni otras resoluciones en el repositorio, pese a que la model card las menciona como métodos.
- No se documentan métricas de exactitud tras la cuantización AMP, por lo que se desconoce la pérdida de precisión frente al modelo original.
- Sesgos: hereda los sesgos de ImageNet 2012 (taxonomía de 1000 clases centrada en objetos cotidianos, con posibles desequilibrios demográficos y geográficos en las imágenes).
- Riesgo de clasificación errónea fuera de la distribución de ImageNet; el modelo no está diseñado para clases abiertas ni detección de objetos.
- Licencia MIT para el modelo, pero el dataset ImageNet tiene su propia licencia (`LicenseRef-ImageNet`) que conviene revisar para usos comerciales derivados.
- El autor declara que no ofrece garantías sobre los modelos de terceros y que el usuario asume todos los riesgos; no hay aval de Blaize sobre el modelo original de Meta.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Blaize-AI/ConvNeXtV1t_ImageNet
- Repositorio original de ConvNeXt (Meta AI): https://github.com/facebookresearch/ConvNeXt
- Web de Blaize: https://www.blaize.com
- Dataset ImageNet: https://www.image-net.org/
- Paper de referencia: "A ConvNet for the 2020s" (Liu et al., 2022), disponible en el repositorio de ConvNeXt
