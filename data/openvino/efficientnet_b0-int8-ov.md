# OpenVINO/efficientnet_b0-int8-ov

## Resumen

`OpenVINO/efficientnet_b0-int8-ov` es la conversión al formato OpenVINO IR (Intermediate Representation) del modelo de clasificación de imágenes EfficientNet-B0 original de torchvision, con pesos y activaciones cuantizados a INT8 mediante nncf.quantize. Lo publica el equipo de OpenVINO (Intel) como artefacto listo para inferencia optimizada en hardware Intel (CPU, iGPU, NPU, VPU), no como un modelo entrenado desde cero.

El modelo resuelve el problema de clasificación de imágenes genérica (ImageNet-1k, 1000 clases) con un coste computacional muy bajo: EfficientNet-B0 es la variante más pequeña de la familia EfficientNet, diseñada mediante Neural Architecture Search con escalado compuesto de profundidad, anchura y resolución. La versión INT8 reduce el tamaño y acelera la inferencia respecto al checkpoint original en FP32, manteniendo una precisión cercana.

Su relevancia actual es práctica: permite desplegar un clasificador de imágenes fiable en entornos de borde y en pipelines de OpenVINO Model API con una integración de una línea (`Model.from_pretrained`). No es un modelo de lenguaje ni un modelo multimodal generativo; es un backbone de visión clásico, y así debe evaluarse.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN con bloques MBConv y SE, escalado compuesto) |
| Parametros totales | no disponible (EfficientNet-B0 original: ~5,3 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | INT8 (pesos y activaciones), PTQ con nncf.quantize |
| Idiomas soportados | no aplica (clasificación de imágenes, sin etiquetas textuales multilingües) |
| Licencia | BSD-3-Clause |
| Formato de pesos | OpenVINO IR (.xml + .bin), INT8 |

## Arquitectura y entrenamiento

EfficientNet-B0 es una red convolucional que combina bloques MBConv (Mobile Inverted Bottleneck Convolution) con módulos de atención Squeeze-and-Excitation, apilados en una arquitectura descubierta mediante Neural Architecture Search y escalada de forma compuesta (profundidad, anchura y resolución de entrada de forma conjunta). La entrada típica es una imagen RGB de 224×224 píxeles y la salida es un vector de 1000 logits correspondiente a las clases de ImageNet-1k.

Este artefacto concreto no aporta entrenamiento nuevo: parte del checkpoint de torchvision (entrenado en ImageNet-1k) y aplica cuantización post-entrenamiento (PTQ) con NNCF para producir pesos y activaciones INT8. No hay RLHF, DPO ni ajuste fino adicional documentado en la model card. La innovación relevante es la conversión a OpenVINO IR y la compresión INT8, que habilita ejecución acelerada en hardware Intel sin reentrenamiento.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k (top-1/top-5).
- Extracción de características visuales (el backbone es reutilizable para tareas downstream, aunque la model card no lo documenta explícitamente).
- Inferencia optimizada en CPU, iGPU, NPU y VPU Intel mediante OpenVINO 2026.1.0 o superior.
- Integración directa con OpenVINO Model API 0.4.0+ para carga, inferencia y visualización.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión-lenguaje; solo visión.
- No dispone de modo "thinking", audio ni otras modalidades.

## Casos de uso

- Clasificación de imágenes en el borde: desplegar el modelo en dispositivos con CPU Intel o NPU para etiquetar imágenes localmente, sin enviar datos a la nube, gracias al formato OpenVINO IR e INT8.
- Preprocesado en pipelines de visión: usar el clasificador como primer filtro para enrutar imágenes a modelos más pesados (detección, segmentación) según la clase predicha, reduciendo coste computacional.
- Moderación de contenido básica: clasificar imágenes entrantes en categorías de ImageNet para descartar o marcar contenido antes de un análisis más fino.
- Indexación y etiquetado automático de bibliotecas de imágenes: generar metadatos de clase para catálogos, archivos o repositorios fotográficos en lotes.
- Prototipado rápido en investigación: disponer de un baseline de clasificación fiable y ligero para comparar contra modelos propios, con una API de carga de una línea.
- Aplicaciones industriales de inspección visual sencilla: clasificar piezas o productos en categorías predefinidas mapeadas a clases de ImageNet o mediante ajuste fino posterior.
- Integración en aplicaciones de escritorio o embebidas con OpenVINO Model API: usar el ejemplo oficial de carga, inferencia y visualización para incorporar clasificación en herramientas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión (top-1/top-5) ni comparativas de latencia o throughput para la versión INT8.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible en la model card; por el tamaño del repo (0,0 GB reportado) y la naturaleza de EfficientNet-B0 INT8, el modelo es muy ligero y cabe holgadamente en memoria de cualquier dispositivo moderno.
- GPU recomendadas: no aplica de forma específica; el artefacto está orientado a hardware Intel (CPU, iGPU, NPU, VPU) mediante OpenVINO. Para GPU NVIDIA habría que usar el checkpoint original de torchvision u otra conversión.
- ¿Cabe en GPU de consumo? Sí, con enorme margen, dado el reducido tamaño del modelo; también en CPU y dispositivos de borde.
- Opciones de despliegue: OpenVINO Runtime 2026.1.0+, OpenVINO Model API 0.4.0+ (`pip install openvino-model-api[huggingface]`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OpenVINO/efficientnet_b0-int8-ov | ~5,3 M (original) | Imagen 224×224 | OpenVINO IR INT8 | BSD-3-Clause | Este artefacto; orientado a Intel |
| torchvision efficientnet_b0 | ~5,3 M | Imagen 224×224 | PyTorch (FP32) | BSD-3-Clause | Modelo original, sin cuantizar |
| EfficientNet-B1/B2 (torchvision) | mayor que B0 | Imagen | PyTorch | BSD-3-Clause | Variantes mayores de la misma familia, más precisión y coste |
| MobileNetV3 (torchvision) | menor que B0 | Imagen 224×224 | PyTorch | BSD-3-Clause | Alternativa CNN ligera para clasificación en el borde |

No se dispone de datos de rendimiento comparativo en la información proporcionada para cuantificar diferencias de precisión o latencia entre estas opciones.

## Limitaciones y advertencias

- Sesgos: hereda los sesgos del dataset ImageNet-1k y del checkpoint original de torchvision; la model card no documenta análisis de sesgo.
- Alucinación: no aplica en el sentido generativo, pero el modelo puede asignar clases incorrectas con alta confianza en imágenes fuera de distribución.
- Contexto e idioma: no aplica; es un clasificador de imágenes sin capacidades textuales ni multilingües.
- Licencia: BSD-3-Clause, permisiva para uso comercial, con obligación de conservar el aviso de copyright y la cláusula de exención; verificar los términos del modelo original de torchvision.
- Compatibilidad: requiere OpenVINO 2026.1.0+ y Model API 0.4.0+; versiones anteriores pueden no cargar el IR.
- Precisión INT8: la cuantización PTQ puede degradar ligeramente la precisión respecto al FP32 original; no se publican métricas para cuantificarlo.
- Uso previsto: solo clasificación de imágenes; no debe emplearse como modelo generativo, de razonamiento ni multimodal.
- La model card remite a la implementación original de torchvision para limitaciones adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/OpenVINO/efficientnet_b0-int8-ov
- Modelo original (torchvision): https://docs.pytorch.org/vision/main/models/generated/torchvision.models.efficientnet_b0.html#torchvision.models.efficientnet_b0
- Repositorio torchvision: https://github.com/pytorch/vision
- Formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guía de cuantización post-entrenamiento: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- OpenVINO Model API: https://github.com/open-edge-platform/model_api
- Documentación Model API: https://open-edge-platform.github.io/model_api/latest/
- Licencia BSD-3-Clause: https://spdx.org/licenses/BSD-3-Clause.html
- Principios de derechos humanos de Intel: https://www.intel.com/content/dam/www/central-libraries/us/en/documents/policy-human-rights.pdf
