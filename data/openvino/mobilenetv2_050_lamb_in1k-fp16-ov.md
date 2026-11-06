# OpenVINO/mobilenetv2_050_lamb_in1k-fp16-ov

## Resumen

`OpenVINO/mobilenetv2_050_lamb_in1k-fp16-ov` es una conversión al formato OpenVINO Intermediate Representation (IR) del modelo de clasificación de imágenes `timm/mobilenetv2_050.lamb_in1k`, publicada por la organización OpenVINO de Intel. No se trata de un modelo entrenado desde cero, sino de un artefacto de despliegue: los pesos originales de MobileNetV2 (variante de anchura 0.50, entrenada con el optimizador LAMB sobre ImageNet-1k) se han convertido a IR y se han comprimido a FP16 para acelerar la inferencia en hardware Intel (CPU, GPU integrada y NPU).

El modelo resuelve una tarea acotada: clasificación de imágenes en las 1.000 clases de ImageNet. Su interés no reside en la arquitectura en sí, sino en el empaquetado: permite desplegar un clasificador ligero con el runtime de OpenVINO y la Model API sin necesidad de exportar manualmente desde PyTorch. Es relevante para pipelines de visión en el borde (edge), donde el coste computacional y la latencia importan más que la precisión absoluta.

La ficha se centra en las características verificables del artefacto publicado. La model card es muy escueta y remite a la ficha original de timm para detalles de entrenamiento y limitaciones, por lo que varios datos (número exacto de parámetros, composición del dataset, métricas) no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN con bloques residuales invertidos y conexiones lineales de cuello de botella), variante de anchura 0.50 |
| Parametros totales | no disponible (la variante 0.50 de MobileNetV2 es de aproximadamente 1,4 M de parámetros, dato no confirmado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | FP16 (pesos comprimidos en el artefacto publicado); el runtime OpenVINO soporta además INT8 y otras precisiones, aunque no se documentan en esta ficha |
| Idiomas soportados | no disponible (clasificación de imágenes; las etiquetas de clase están en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), pesos en FP16 |

## Arquitectura y entrenamiento

El modelo subyacente es MobileNetV2, una red convolucional diseñada para eficiencia computacional en dispositivos con recursos limitados. Su bloque principal es el residual invertido: una expansión 1x1, una convolución depthwise 3x3 y una proyección lineal 1x1, con conexión residual cuando las dimensiones coinciden. La variante `050` reduce el número de canales a la mitad respecto a la versión base, lo que disminuye drásticamente el coste de cómputo y el tamaño del modelo.

El checkpoint original `timm/mobilenetv2_050.lamb_in1k` fue entrenado sobre ImageNet-1k utilizando el optimizador LAMB, una variante de Adam con normalización por capa que permite lotes grandes. No se dispone en la información proporcionada del número de tokens (equivalentes a imágenes) vistos, de la composición exacta del dataset más allá de ImageNet-1k, ni de si se aplicaron técnicas de destilación, RLHF o ajuste fino posterior. La conversión a OpenVINO IR con FP16 no altera la arquitectura ni los pesos más allá de la pérdida de precisión inherente a la cuantización a media precisión.

## Capacidades

- Clasificación de imágenes en las 1.000 clases de ImageNet-1k.
- Extracción de características visuales de bajo nivel a través de las capas convolucionales (no documentada explícitamente en la model card, pero inherente a la arquitectura).
- Inferencia optimizada en CPU, GPU integrada y NPU de Intel mediante el runtime OpenVINO.
- Integración con la Model API de OpenVINO para carga, preprocesado, inferencia y visualización en pocas líneas de código.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente discriminativo de visión.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Clasificación de imágenes en el borde: el modelo se ejecuta en dispositivos Intel con NPU o GPU integrada para etiquetar imágenes en tiempo real (por ejemplo, en cámaras de vigilancia o inspección industrial) con un coste computacional mínimo.
- Preprocesado en pipelines de visión: usar el clasificador como primer filtro para descartar o etiquetar imágenes antes de pasarlas a modelos más pesados (detección, segmentación), reduciendo el cómputo total.
- Prototipado rápido con OpenVINO Model API: la carga con `Model.from_pretrained` y la visualización con `Visualizer` permiten validar un pipeline de clasificación en minutos, útil para demos y pruebas de concepto.
- Aplicaciones de bajo consumo en AI PCs: al ser un modelo de ~1,4 M de parámetros en FP16, cabe holgadamente en memoria y se ejecuta con latencia muy baja en CPU, adecuado para aplicaciones de escritorio que clasifican capturas o imágenes locales.
- Indexado y etiquetado automático de imágenes: clasificar lotes de imágenes para organizar bibliotecas fotográficas o catálogos, aprovechando el throughput de OpenVINO en CPU multinúcleo.
- Benchmarking y comparación de runtimes: servir como modelo de referencia ligero para medir el rendimiento de distintas configuraciones de OpenVINO (CPU vs. GPU vs. NPU) antes de desplegar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la ficha original de timm para métricas de precisión, y no se proporcionan cifras de latencia ni throughput para el artefacto OpenVINO.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en FP16 para los pesos; el pico de memoria depende del tamaño de la imagen de entrada y del lote, pero es del orden de decenas de MB.
- GPU recomendadas: cualquier GPU Intel integrada o discreta compatible con OpenVINO; también funciona en CPU y NPU Intel. No requiere A100 ni H100.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o inferior, y en CPU sin aceleración dedicada.
- Opciones de despliegue: runtime OpenVINO (CPU, GPU, NPU), OpenVINO Model API, y exportación a otros formatos si se necesita. No se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos en CPU moderna, pero no se confirma con cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `OpenVINO/mobilenetv2_050_lamb_in1k-fp16-ov` | ~1,4 M (no confirmado) | Imagen 224x224 (por defecto en timm) | Apache-2.0 | OpenVINO IR FP16 | Conversión de timm; optimizado para hardware Intel |
| `timm/mobilenetv2_050.lamb_in1k` | ~1,4 M (no confirmado) | Imagen 224x224 | Apache-2.0 | PyTorch (safetensors) | Modelo original; requiere exportación para OpenVINO |
| `timm/mobilenetv3_small_100.lamb_in1k` | no disponible | Imagen | Apache-2.0 | PyTorch | Alternativa más moderna de la familia MobileNet, con bloques SE y activación h-swish |
| `timm/resnet18.a1_in1k` | ~11,7 M (no confirmado) | Imagen 224x224 | Apache-2.0 | PyTorch | Mayor precisión a costa de más cómputo; no es un modelo ligero de borde |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer diferencias de precisión entre estas alternativas.

## Limitaciones y advertencias

- Es un clasificador restringido a las 1.000 clases de ImageNet-1k; no reconoce categorías fuera de ese conjunto y no genera descripciones.
- La variante de anchura 0.50 prioriza eficiencia sobre precisión; es esperable una precisión top-1 inferior a la de MobileNetV2 base o de modelos más grandes, aunque no se dispone de cifras.
- La cuantización a FP16 puede introducir pequeñas diferencias numéricas respecto al modelo original en PyTorch; conviene validar la precisión en el dominio de aplicación.
- Riesgo de sesgo heredado de ImageNet-1k: el dataset tiene desequilibrios demográficos y geográficos conocidos que pueden reflejarse en las predicciones.
- No apto para tareas de generación de texto, razonamiento, código, agentes ni tool calling.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la ficha original de timm para condiciones adicionales y atribuciones.
- La model card no documenta limitaciones específicas del artefacto OpenVINO; remite a la ficha original.
- Requiere OpenVINO 2026.1.0 o superior y Model API 0.4.0 o superior; versiones anteriores pueden no cargar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenVINO/mobilenetv2_050_lamb_in1k-fp16-ov
- Modelo original en timm: https://huggingface.co/timm/mobilenetv2_050.lamb_in1k
- Documentación de OpenVINO: https://docs.openvino.ai/
- Repositorio de OpenVINO en GitHub: https://github.com/openvinotoolkit/openvino
- Documentación del formato IR: https://docs.openvino.ai/2026/documentation/openvino-ir-format.html
- OpenVINO Model API: https://github.com/open-edge-platform/model_api
- Documentación de Model API: https://open-edge-platform.github.io/model_api/latest/
- Página de Intel sobre OpenVINO: https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html
- Organización OpenVINO en Hugging Face: https://huggingface.co/OpenVINO
