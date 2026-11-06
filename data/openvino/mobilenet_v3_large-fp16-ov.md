# OpenVINO/mobilenet_v3_large-fp16-ov

## Resumen

`OpenVINO/mobilenet_v3_large-fp16-ov` es la conversión al formato Intermediate Representation (IR) de OpenVINO del modelo `mobilenet_v3_large` de torchvision, con los pesos comprimidos a FP16. No se trata de un modelo entrenado desde cero por OpenVINO, sino de un artefacto de despliegue: el autor original es torchvision y OpenVINO se limita a exportar y optimizar los pesos para su toolkit de inferencia. El modelo resuelve el problema de clasificación de imágenes (ImageNet, 1000 clases) en entornos de borde y CPU.

MobileNetV3-Large es una CNN diseñada mediante Neural Architecture Search combinada con técnicas manuales, pensada para alto rendimiento con bajo coste computacional. Esta variante FP16 en formato IR está orientada a despliegues de inferencia en CPU, GPU integrada y NPU de Intel mediante OpenVINO, no a entrenamiento ni a fine-tuning directo sobre el artefacto publicado.

Su relevancia es práctica: permite ejecutar un clasificador de imágenes estándar con el runtime de OpenVINO y la Model API de Intel sin necesidad de convertir manualmente desde PyTorch, con compatibilidad declarada con OpenVINO 2026.1.0 o superior y Model API 0.4.0 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Large (CNN, bloques con SE y activaciones h-swish) |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | FP16 (pesos comprimidos); el repo no documenta otras variantes |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin componente linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), pesos en FP16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es MobileNetV3-Large de torchvision, una red convolucional para clasificacion de imagenes a 224x224 con 1000 clases de salida (ImageNet). MobileNetV3 combina busquedas de arquitectura (NAS) con decisiones de diseno manuales: bloques residuales invertidos con squeeze-and-excitation, activaciones h-swish y una cabeza de clasificacion rediseñada. La variante "Large" esta orientada a casos de uso con mayor presupuesto de computo que la "Small".

Esta publicacion concreta no aporta informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes vistas, ni sobre procesos de ajuste fino adicional (RLHF, DPO u otros). El autor remite a la implementacion original de torchvision para cualquier detalle de entrenamiento. La unica transformacion documentada es la conversion a OpenVINO IR con compresion de pesos a FP16, sin cambios arquitectonicos declarados.

## Capacidades

- Clasificacion de imagenes en 1000 clases (ImageNet) mediante el pipeline `image-classification`.
- Inferencia optimizada para CPU, GPU integrada y NPU de Intel a traves del runtime de OpenVINO.
- Integracion directa con la Model API de Intel (`Model.from_pretrained`), que gestiona preprocesado y postprocesado.
- Visualizacion de resultados mediante `model_api.visualizer.Visualizer`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador de vision, no un modelo generativo.
- No dispone de capacidades multilingues ni de procesamiento de texto.
- No dispone de modo "thinking", vision generativa, audio ni ninguna capacidad multimodal mas alla de la clasificacion.

## Casos de uso

- Clasificacion de imagenes en produccion sobre CPU: el modelo en formato IR FP16 se ejecuta con OpenVINO sin dependencia de PyTorch, lo que simplifica el despliegue en servidores sin GPU y reduce el peso de las dependencias.
- Filtrado y triaje automatico de imagenes en pipelines de datos: clasificar lotes de imagenes entrantes por categoria antes de pasarlas a modelos mas costosos, usando la baja latencia de MobileNetV3-Large en CPU.
- Despliegue en dispositivos de borde con NPU Intel: al estar en IR y ser compatible con OpenVINO 2026.1.0+, encaja en equipos con aceleradores Intel donde no cabe un runtime de PyTorch completo.
- Prototipado rapido de aplicaciones de vision: la Model API permite cargar el modelo y obtener resultados con pocas lineas, util para validar una idea antes de invertir en un modelo mayor.
- Preetiquetado de datasets: generar etiquetas ImageNet preliminares sobre imagenes nuevas para revision humana posterior, aprovechando el throughput en CPU.
- Componente base en sistemas de analitica visual: clasificacion de fotogramas o imagenes capturadas en entornos industriales o de vigilancia como primer nivel de un pipeline jerarquico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de precision (top-1/top-5) ni de latencia para esta conversion FP16.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un modelo de vision pequeno en FP16, el peso en memoria es reducido, pero no se aporta cifra concreta.
- GPU recomendadas: no se especifican. El modelo esta pensado para CPU, GPU integrada y NPU de Intel mediante OpenVINO; no se documentan requisitos de GPU dedicada.
- GPU de consumo: no hay datos publicados sobre ejecucion en RTX 4090 u otras GPU de consumo. El caso de uso natural es CPU/NPU Intel.
- Opciones de despliegue: runtime de OpenVINO (version 2026.1.0 o superior) y Model API 0.4.0 o superior con el extra `[huggingface]`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| OpenVINO/mobilenet_v3_large-fp16-ov | no disponible | imagen 224x224, 1000 clases | OpenVINO IR FP16 | BSD-3-Clause | Conversion optimizada para OpenVINO |
| mobilenet_v3_large (torchvision) | no disponible | imagen 224x224, 1000 clases | PyTorch | BSD-3-Clause | Modelo original, requiere PyTorch |
| mobilenet-v3-large-1.0-224-tf (Open Model Zoo) | no disponible | imagen 224x224, 1000 clases | OpenVINO IR | no disponible | Variante TF del mismo modelo en Open Model Zoo |

La comparativa se limita a variantes del mismo modelo base; no se dispone de datos de rendimiento para comparar con alternativas de otra familia.

## Limitaciones y advertencias

- Es un artefacto de despliegue, no un modelo entrenado por OpenVINO: cualquier limitacion del `mobilenet_v3_large` original aplica integramente.
- Solo clasifica 1000 clases de ImageNet; no detecta objetos, no segmenta y no genera descripciones.
- Riesgo de clasificaciones erroneas en dominios alejados de ImageNet (imagenes medicas, industriales o de baja calidad), con posible sesgo hacia las clases sobrerrepresentadas del dataset original.
- No se documentan sesgos especificos ni evaluaciones de robustez en la model card.
- La licencia BSD-3-Clause permite uso comercial, pero conviene revisar los terminos del modelo original en torchvision.
- Requiere OpenVINO 2026.1.0 o superior y Model API 0.4.0 o superior; versiones anteriores no estan soportadas segun la model card.
- El repositorio figura con 0.0 GB de tamano, dato que no debe interpretarse como el peso real del artefacto; conviene verificar los ficheros antes de desplegar.
- No hay informacion sobre idiomas porque el modelo no procesa texto.

## Enlaces

- [Hugging Face: OpenVINO/mobilenet_v3_large-fp16-ov](https://huggingface.co/OpenVINO/mobilenet_v3_large-fp16-ov)
- [Modelo original en torchvision](https://docs.pytorch.org/vision/main/models/generated/torchvision.models.mobilenet_v3_large.html)
- [Repositorio torchvision](https://github.com/pytorch/vision)
- [Documentacion de OpenVINO IR](https://docs.openvino.ai/2026/documentation/openvino-ir-format.html)
- [Documentacion de OpenVINO](https://docs.openvino.ai/)
- [Repositorio OpenVINO en GitHub](https://github.com/openvinotoolkit/openvino)
- [Model API de Intel](https://github.com/open-edge-platform/model_api)
- [Documentacion de Model API](https://open-edge-platform.github.io/model_api/latest/)
- [mobilenet-v3-large-1.0-224-tf en Open Model Zoo](https://docs.openvino.ai/2023.3/omz_models_model_mobilenet_v3_large_1_0_224_tf.html)
- [Intel Distribution of OpenVINO Toolkit](https://www.intel.com/content/www/us/en/developer/tools/openvino-toolkit/overview.html)
- [Licencia BSD-3-Clause (SPDX)](https://spdx.org/licenses/BSD-3-Clause.html)
