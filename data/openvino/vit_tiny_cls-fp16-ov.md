# OpenVINO/vit_tiny_cls-fp16-ov

## Resumen

`vit_tiny_cls-fp16-ov` es una conversión al formato OpenVINO IR del modelo ViT-Tiny de clasificación de imágenes, partiendo del checkpoint `timm/vit_tiny_patch16_224.augreg_in21k`. Lo publica la organización OpenVINO en HuggingFace, mientras que el modelo original procede de la librería `timm` (Ross Wightman) y la conversión la realiza la herramienta Geti de Intel. No es un modelo de lenguaje: es un clasificador de imágenes Vision Transformer de tamaño reducido, pensado para inferencia en CPU, GPU integrada o NPU de Intel.

El modelo resuelve el problema de clasificación de imágenes genérica (etiquetado de imágenes en 224x224 píxeles) con un coste computacional muy bajo: ViT-Tiny tiene aproximadamente 5,7 millones de parámetros y un parche de 16x16 sobre resolución 224. La variante publicada aquí está comprimida a FP16 y empaquetada como OpenVINO IR, lo que permite desplegarla con la Model API de OpenVINO sin necesidad de exportar manualmente desde PyTorch.

Su relevancia es práctica más que de investigación: sirve como punto de partida para fine-tuning con datasets propios mediante Geti y como ejemplo de despliegue edge-friendly de un transformer visual. La licencia Apache-2.0 y el formato IR lo hacen adecuado para integrarse en pipelines de visión por computador en producción sobre hardware Intel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Tiny, patch 16, resolución 224) |
| Parametros totales | ~5,7 M (ViT-Tiny, según arquitectura original de `timm`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224) |
| Tipos de cuantizacion | FP16 (pesos comprimidos); el repositorio solo publica la variante FP16 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar de la familia ViT-Tiny: divide la imagen de entrada de 224x224 en parches de 16x16 (196 tokens), los proyecta a un espacio de embedding de dimensión reducida (192 en ViT-Tiny), y aplica una pila de bloques transformer con atención multi-cabeza. El checkpoint original `vit_tiny_patch16_224.augreg_in21k` fue entrenado por `timm` con aumentación de datos agresiva (AugReg) y preentrenamiento en ImageNet-21k, seguido presumiblemente de fine-tuning en ImageNet-1k. El modelo publicado aquí no incluye información sobre el proceso de conversión más allá de la compresión a FP16 y el empaquetado en IR.

No se dispone de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un clasificador de imágenes). La innovación técnica del artefacto es la propia conversión a OpenVINO IR, que permite ejecutar el modelo con el runtime de Intel y con la Model API, incluyendo un visualizador integrado para renderizar resultados de clasificación sobre la imagen.

## Capacidades

- Clasificación de imágenes en 224x224 píxeles (etiquetado de imagen completa).
- Inferencia optimizada en hardware Intel (CPU, GPU integrada, NPU) mediante OpenVINO Runtime.
- Integración con la Model API de OpenVINO para carga, inferencia y visualización en pocas líneas de código.
- Base para fine-tuning con datasets personalizados a través de Geti (anotación, entrenamiento y exportación).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la clasificación visual.

## Casos de uso

- Clasificación de imágenes en el edge: el modelo cabe holgadamente en dispositivos con poca memoria y se ejecuta con OpenVINO en CPU o NPU, lo que permite desplegar clasificación en tiempo real en cámaras o gateways industriales sin GPU dedicada.
- Preprocesado en pipelines de visión: usar el clasificador como filtro previo para descartar o enrutar imágenes antes de modelos más pesados (detección, segmentación), reduciendo coste computacional aguas abajo.
- Fine-tuning con datos propios mediante Geti: para dominios específicos (inspección visual, control de calidad, clasificación de productos) se puede anotar un dataset, reentrenar el ViT-Tiny y exportar de nuevo a OpenVINO IR.
- Prototipado rápido de aplicaciones de clasificación: la Model API permite cargar el modelo y renderizar resultados con pocas líneas, útil para validar una idea antes de invertir en un modelo mayor.
- Aplicaciones de AI PC: integración en asistentes o herramientas de escritorio que necesiten clasificar imágenes localmente sin enviar datos a la nube, aprovechando la aceleración de OpenVINO en CPU/GPU/NPU.
- Benchmarking y comparación de backends: al ser un modelo pequeño y bien definido, sirve como referencia para medir latencia y throughput de OpenVINO frente a otros runtimes en el mismo hardware.
- Educación y demostraciones: ejemplo didáctico de cómo convertir un modelo de `timm` a OpenVINO IR y desplegarlo con la Model API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (top-1, top-5) ni de latencia/throughput para esta conversión concreta. Para métricas del modelo original, debe consultarse la model card de `timm/vit_tiny_patch16_224.augreg_in21k`.

## Requisitos de hardware

- VRAM estimada: el modelo es muy pequeño (~5,7 M de parámetros en FP16, del orden de 11 MB de pesos), por lo que la memoria necesaria es mínima.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU Intel, GPU integrada Intel y NPU. En GPUs discretas puede ejecutarse vía OpenVINO GPU plugin, pero no es su objetivo principal.
- Cabe en cualquier GPU consumer, incluida una RTX 4090, y también en hardware sin GPU.
- Opciones de despliegue: OpenVINO Runtime (CPU/GPU/NPU), OpenVINO Model API (`openvino-model-api[huggingface]`). No se distribuye en GGUF ni está pensado para vLLM, llama.cpp, Ollama o TGI, que son runtimes para modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Contexto de despliegue |
|---|---|---|---|---|---|
| `OpenVINO/vit_tiny_cls-fp16-ov` | ~5,7 M | Imagen 224x224 | OpenVINO IR (FP16) | Apache-2.0 | Edge/CPU/NPU Intel |
| `timm/vit_tiny_patch16_224.augreg_in21k` | ~5,7 M | Imagen 224x224 | PyTorch (safetensors) | Apache-2.0 | GPU/CPU genérica |
| Otros clasificadores pequeños (p. ej. ResNet-18, MobileNetV3) | 2-12 M | Imagen variable | PyTorch/ONNX/IR | Apache-2.0 o similar | Edge/CPU/GPU |

La comparación con alternativas de la misma categoría (clasificadores ligeros) depende del caso de uso; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de clasificación de imágenes, no de lenguaje: no genera texto ni mantiene conversaciones.
- Solo se publica la variante FP16 en OpenVINO IR; no hay versiones INT8, INT4 ni pesos en otros formatos en este repositorio.
- La precisión de clasificación depende del checkpoint original de `timm`; la conversión a FP16 puede introducir una degradación mínima no cuantificada en la model card.
- No se documentan sesgos específicos, pero al derivar de ImageNet-21k/1k hereda los sesgos de esas taxonomías y de su distribución de clases.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas en dominios alejados del entrenamiento original.
- Requiere OpenVINO 2026.1.0 o superior y Model API 0.4.0 o superior; versiones anteriores pueden no cargar el modelo.
- Uso comercial permitido por la licencia Apache-2.0, sin restricciones adicionales conocidas más allá de las del modelo original.
- El repositorio aparece con tamaño 0.0 GB en la información disponible, lo que puede indicar que los pesos no están materializados en el snapshot consultado; conviene verificar la descarga antes de integrarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/OpenVINO/vit_tiny_cls-fp16-ov
- Modelo original: https://huggingface.co/timm/vit_tiny_patch16_224.augreg_in21k
- Geti (Intel): https://github.com/open-edge-platform/geti
- OpenVINO IR format: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- OpenVINO Model API: https://github.com/open-edge-platform/model_api
- Documentación Model API: https://open-edge-platform.github.io/model_api/latest/
- OpenVINO docs: https://docs.openvino.ai/
- Repositorio OpenVINO: https://github.com/openvinotoolkit/openvino
- Intel Distribution of OpenVINO Toolkit: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
- OpenVINO en HuggingFace: https://huggingface.co/OpenVINO
