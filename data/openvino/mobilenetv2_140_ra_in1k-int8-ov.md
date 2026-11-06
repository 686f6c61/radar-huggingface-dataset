# OpenVINO/mobilenetv2_140_ra_in1k-int8-ov

## Resumen

`OpenVINO/mobilenetv2_140_ra_in1k-int8-ov` es una versión cuantizada a INT8 y convertida al formato Intermediate Representation (IR) de OpenVINO del clasificador de imágenes `timm/mobilenetv2_140.ra_in1k`, publicado por el equipo de OpenVINO (Intel). No es un modelo entrenado desde cero, sino un artefacto de despliegue: toma los pesos originales de timm, aplica compresión de pesos y activaciones mediante NNCF y los empaqueta para inferencia optimizada en hardware Intel (CPU, GPU y NPU).

El modelo resuelve el problema de llevar un clasificador convolucional ligero a producción con latencia baja y huella de memoria reducida, sin necesidad de reentrenar. MobileNetV2 con factor de ancho 1.4 es una CNN de la familia MobileNetV2, diseñada para eficiencia computacional mediante convoluciones separables en profundidad y bloques residuales invertidos, y el checkpoint `ra_in1k` indica que fue entrenado con recetas de *RandAugment* sobre ImageNet-1k.

Es relevante ahora para equipos que despliegan visión por computador en el edge o en AI PCs con OpenVINO 2026.1 o superior: ofrece un clasificador de 1000 clases listo para usar vía Model API, con licencia Apache-2.0 y sin dependencias de entrenamiento. El repo es de tamaño mínimo (0.0 GB reportados) y tiene un uso muy bajo en Hugging Face (14 descargas, 0 likes), lo que refleja que es un artefacto de infraestructura más que un modelo de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN MobileNetV2 (bloques residuales invertidos con convoluciones separables en profundidad), factor de ancho 1.4 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | INT8 en pesos y activaciones (Post-Training Quantization con NNCF) |
| Idiomas soportados | no disponible (clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (Intermediate Representation), INT8 |

## Arquitectura y entrenamiento

La arquitectura subyacente es MobileNetV2 con multiplicador de ancho 1.4, una red convolucional pensada para eficiencia: usa bloques residuales invertidos con expansión lineal y convoluciones separables en profundidad (*depthwise separable convolutions*), lo que reduce el coste computacional frente a convoluciones estándar. El sufijo `ra_in1k` del checkpoint original indica entrenamiento sobre ImageNet-1k con recetas de aumento de datos RandAugment, una práctica habitual en los modelos de la librería timm.

Este artefacto concreto no incluye entrenamiento adicional: se ha aplicado cuantización post-entrenamiento (PTQ) con NNCF, fijando pesos y activaciones a INT8. La model card no detalla el número de tokens ni la composición exacta del dataset más allá de la referencia a ImageNet-1k del modelo base, ni si hubo destilación o ajuste fino posterior. La innovación técnica aquí es la propia conversión a OpenVINO IR y la compresión INT8, que permiten ejecutar el modelo con el runtime de OpenVINO en CPU, GPU y NPU de Intel.

## Capacidades

- Clasificación de imágenes en 1000 clases (ImageNet-1k), devolviendo etiquetas y probabilidades.
- Inferencia optimizada en hardware Intel mediante OpenVINO Runtime (CPU, GPU y NPU).
- Integración directa con Model API de OpenVINO (`Model.from_pretrained`) y utilidades de visualización (`Visualizer`).
- Compatible con el ecosistema timm a través del modelo base, lo que permite comparar o sustituir por la versión original en FP32.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente discriminativo de visión.
- Sin capacidades multilingües ni de audio.

## Casos de uso

- Clasificación de imágenes en el edge: desplegar el modelo en dispositivos con CPU Intel o NPU para etiquetar imágenes en tiempo real con bajo consumo, aprovechando la cuantización INT8.
- Preprocesado en pipelines de visión: usar el clasificador como primer filtro para enrutar imágenes a modelos más pesados (detección, segmentación) solo cuando la clase detectada lo justifique.
- Moderación de contenido básica: clasificar imágenes en categorías genéricas de ImageNet como paso previo a revisión humana o a modelos especializados.
- Prototipado rápido en AI PCs: validar una idea de producto de clasificación de imágenes con OpenVINO Model API sin entrenar nada, sustituyendo después por un modelo afinado si es necesario.
- Benchmarking de hardware: emplear este modelo como carga de referencia para medir latencia y throughput de CPUs, GPUs y NPUs Intel con OpenVINO 2026.1+.
- Aplicaciones de inventario o catalogación visual: clasificar fotos de productos en categorías amplias de ImageNet como aproximación inicial antes de un modelo específico de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (top-1/top-5) ni de latencia para la versión INT8, y la búsqueda web solo aporta documentación general de OpenVINO.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible de forma explícita; al ser un MobileNetV2 con ancho 1.4 en INT8, la huella es del orden de pocos megabytes, apta para dispositivos de baja memoria.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU, GPU integrada y NPU de Intel vía OpenVINO.
- Cabe en GPU consumer: sí, con margen amplio, aunque el objetivo principal es la inferencia en CPU/NPU.
- Opciones de despliegue: OpenVINO Runtime 2026.1.0 o superior y Model API 0.4.0 o superior; también puede ejecutarse con herramientas del ecosistema OpenVINO.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OpenVINO/mobilenetv2_140_ra_in1k-int8-ov | no disponible | no aplica | OpenVINO IR INT8 | Apache-2.0 | Versión cuantizada para OpenVINO |
| timm/mobilenetv2_140.ra_in1k | no disponible | no aplica | PyTorch (safetensors/bin) | Apache-2.0 | Modelo base en FP32, sin cuantizar |
| Otras variantes MobileNetV2 de timm | no disponible | no aplica | PyTorch | Apache-2.0 | Distintos factores de ancho y recetas de entrenamiento |

La comparación cuantitativa de precisión y latencia frente a alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo clasifica en las 1000 clases de ImageNet-1k; no cubre categorías fuera de ese vocabulario.
- La cuantización INT8 puede degradar ligeramente la precisión respecto al modelo base en FP32; no se han publicado métricas que lo cuantifiquen.
- No es un modelo generativo: no sirve para texto, razonamiento, código ni tareas multimodales.
- Posibles sesgos heredados del dataset ImageNet-1k y de la receta de entrenamiento original de timm.
- Requiere OpenVINO 2026.1.0 o superior y Model API 0.4.0 o superior; no es directamente ejecutable en otros runtimes sin conversión.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar la model card del modelo base para condiciones adicionales.
- El uso en producción exige validar la precisión en el dominio concreto, ya que ImageNet no representa necesariamente la distribución objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/OpenVINO/mobilenetv2_140_ra_in1k-int8-ov
- Modelo base: https://huggingface.co/timm/mobilenetv2_140.ra_in1k
- Documentación de OpenVINO: https://docs.openvino.ai/
- Formato OpenVINO IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Guía de cuantización post-entrenamiento: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- Repositorio OpenVINO: https://github.com/openvinotoolkit/openvino
- NNCF: https://github.com/openvinotoolkit/nncf
- Model API: https://github.com/open-edge-platform/model_api
- Documentación de Model API: https://open-edge-platform.github.io/model_api/latest/
- Intel Distribution of OpenVINO Toolkit: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
