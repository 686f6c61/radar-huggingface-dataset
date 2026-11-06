# OpenVINO/mobilenetv2_120d_ra_in1k-int8-ov

## Resumen

`mobilenetv2_120d_ra_in1k-int8-ov` es la version cuantizada a INT8 y convertida al formato Intermediate Representation (IR) de OpenVINO del modelo de clasificación de imágenes `timm/mobilenetv2_120d.ra_in1k`. Lo publica la organización OpenVINO (Intel) como parte de su catálogo de modelos optimizados para despliegue en CPU, GPU y NPU de Intel. No es un modelo nuevo: es un artefacto de despliegue derivado del modelo original de la librería `timm` (PyTorch Image Models).

El modelo resuelve clasificación de imágenes genérica (ImageNet-1k, 1000 clases) con una arquitectura MobileNetV2 con factor de profundidad 1.2 (variante "120d") y pesos entrenados con Recursive Adversarial training (RA). La compresión a INT8 se realiza con NNCF mediante cuantización post-entrenamiento (PTQ) de pesos y activaciones, lo que reduce el tamaño del artefacto y acelera la inferencia en hardware Intel.

Su relevancia es práctica: permite ejecutar un clasificador ligero en entornos de borde y AI PCs con el runtime de OpenVINO, sin necesidad de PyTorch, y con una API de inferencia (Model API) que abstrae el preprocesado y el postprocesado. El repositorio tiene un tamaño de 0,0 GB (redondeado) y un uso muy bajo (24 descargas), lo que refleja que es un artefacto de nicho dentro del ecosistema de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (factor de profundidad 1.2, variante "120d"), red neuronal convolucional |
| Parametros totales | no disponible (el modelo base MobileNetV2 1.2x ronda los 3,5 M, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | INT8 (pesos y activaciones) mediante PTQ con NNCF |
| Idiomas soportados | no disponible (clasificación de imágenes, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (Intermediate Representation), INT8 |

## Arquitectura y entrenamiento

La arquitectura subyacente es MobileNetV2, una CNN con bloques residuales invertidos y conexiones lineales de cuello de botella, diseñada para eficiencia computacional en dispositivos con recursos limitados. La variante `120d` aplica un factor de profundidad de 1,2 sobre la configuración estándar, aumentando el número de canales por capa. El sufijo `ra` indica que el modelo base fue entrenado con Recursive Adversarial training, una técnica de aumento de datos adversario que suele mejorar la robustez y la precisión top-1 en ImageNet-1k.

El proceso de este artefacto concreto es una conversión, no un reentrenamiento: se parte de los pesos de `timm/mobilenetv2_120d.ra_in1k`, se convierten al formato IR de OpenVINO y se comprimen a INT8 con `nncf.quantize` en modo PTQ, cuantizando tanto pesos como activaciones. No se documentan en la información proporcionada el número de tokens (no aplica), la composición del dataset de entrenamiento original ni si hubo RLHF/DPO (no aplica a un clasificador de imágenes). La innovación técnica destacable es la propia cadena de compresión y despliegue: PTQ con NNCF y compatibilidad con OpenVINO 2026.1.0 o superior y Model API 0.4.0 o superior.

## Capacidades

- Clasificación de imágenes en 1000 clases (ImageNet-1k), con salida de logits o probabilidades por clase.
- Inferencia optimizada en CPU, GPU y NPU de Intel gracias al runtime de OpenVINO.
- Ejecución mediante Model API, que incluye preprocesado de imagen y visualización de resultados.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión generativa, audio ni otras capacidades multimodales más allá de la clasificación.

## Casos de uso

- Clasificación de imágenes en el borde: el modelo se ejecuta en dispositivos con CPU Intel o NPU mediante OpenVINO, clasificando fotogramas o imágenes individuales con un coste computacional bajo y sin dependencia de PyTorch.
- Filtrado y triaje automático de imágenes: en un pipeline de ingestión de imágenes (por ejemplo, en un sistema de gestión documental o de moderación), el modelo asigna una etiqueta de clase a cada imagen para enrutarla al proceso adecuado.
- Preetiquetado en anotación de datasets: se usa como clasificador previo para sugerir etiquetas a anotadores humanos, reduciendo el tiempo de etiquetado en proyectos de visión.
- Control de calidad en líneas de producción: clasificación de piezas o productos en imágenes capturadas por cámaras industriales, aprovechando la inferencia en CPU/NPU de bajo consumo.
- Prototipado rápido de aplicaciones de visión: con el ejemplo de Model API en pocas líneas se carga el modelo, se infiere y se visualiza el resultado, lo que acelera la validación de ideas antes de invertir en modelos mayores.
- Clasificación en AI PCs: integración en aplicaciones de escritorio que aprovechan la NPU/GPU integrada de los procesadores Intel recientes para clasificar imágenes localmente sin enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al ser un modelo convolucional de pocos millones de parámetros en INT8, el consumo de memoria es muy reducido (del orden de decenas de MB), aunque no se confirma en la información proporcionada.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU, GPU integrada y NPU de Intel mediante OpenVINO.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo, aunque no se dispone de cifras confirmadas.
- Opciones de despliegue: runtime de OpenVINO (versión 2026.1.0 o superior) y Model API (0.4.0 o superior); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OpenVINO/mobilenetv2_120d_ra_in1k-int8-ov | no disponible | no aplica | OpenVINO IR INT8 | Apache-2.0 | Versión cuantizada y optimizada para OpenVINO |
| timm/mobilenetv2_120d.ra_in1k | no disponible | no aplica | PyTorch (safetensors/bin) | Apache-2.0 | Modelo original sin cuantizar |
| Otras variantes MobileNetV2 de timm | no disponible | no aplica | PyTorch | Apache-2.0 | Distintos factores de profundidad y recetas de entrenamiento |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer diferencias cuantitativas entre estas alternativas.

## Limitaciones y advertencias

- Sesgos: hereda los sesgos del dataset ImageNet-1k y de la receta de entrenamiento original; no se detallan sesgos específicos en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede asignar etiquetas incorrectas con alta confianza en imágenes fuera de distribución.
- Limitaciones de contexto o idioma: no procesa texto ni tiene ventana de contexto; está restringido a clasificación de imágenes en las 1000 clases de ImageNet-1k.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo base en `timm/mobilenetv2_120d.ra_in1k` para confirmar condiciones.
- Caveats para producción: requiere OpenVINO 2026.1.0 o superior y Model API 0.4.0 o superior; la cuantización INT8 puede degradar ligeramente la precisión frente al modelo en FP32; el uso y número de descargas es muy bajo, por lo que la validación en el caso de uso concreto es responsabilidad del integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenVINO/mobilenetv2_120d_ra_in1k-int8-ov
- Modelo base: https://huggingface.co/timm/mobilenetv2_120d.ra_in1k
- Documentación de OpenVINO: https://docs.openvino.ai/
- Repositorio de OpenVINO: https://github.com/openvinotoolkit/openvino
- NNCF (cuantización): https://github.com/openvinotoolkit/nncf
- Guía de optimización de modelos de OpenVINO: https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/quantizing-models-post-training.html
- Formato IR de OpenVINO: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- Model API: https://github.com/open-edge-platform/model_api
- Documentación de Model API: https://open-edge-platform.github.io/model_api/latest/
- Intel Distribution of OpenVINO Toolkit: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
- OpenVINO en Wikipedia: https://en.wikipedia.org/wiki/OpenVINO
