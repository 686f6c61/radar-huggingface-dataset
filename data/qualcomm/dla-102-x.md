# qualcomm/DLA-102-X

## Resumen

DLA-102-X es un modelo de clasificación de imágenes publicado por Qualcomm en su organización de HuggingFace, distribuido como parte del ecosistema Qualcomm AI Hub Models. Se trata de una reimplementación optimizada de la arquitectura DLA (Deep Layer Aggregation), concretamente del checkpoint `timm/dla102x.in1k`, pensada para ejecutarse en los aceleradores NPU de los chipsets Snapdragon y Dragonwing de Qualcomm. El modelo clasifica imágenes del dataset ImageNet a una resolución de entrada de 224x224 y puede emplearse también como backbone para tareas de visión por computador posteriores.

La arquitectura DLA, descrita en el paper arXiv:1707.06484 (Deep Layer Aggregation, Yu et al.), agrega jerárquicamente las características de distintas capas de la red para mejorar la propagación de información y gradientes. El modelo cuenta con aproximadamente 26,3 millones de parámetros y ocupa unos 100 MB en precisión float, lo que lo sitúa en una franja de tamaño media, adecuada para inferencia en dispositivo.

Su relevancia actual reside en que Qualcomm distribuye artefactos pre-exportados listos para desplegar (ONNX, QNN_DLC y TFLITE, tanto en float como en cuantización w8a8), junto con métricas de latencia por chipset. Esto permite ejecutar clasificación de imágenes con tiempos de inferencia inferiores a 1 ms en los SoC más recientes, siempre sobre la NPU del dispositivo, sin necesidad de recompilar el modelo para configuraciones estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DLA (Deep Layer Aggregation), red convolucional con agregación iterativa y jerárquica |
| Parametros totales | 26,3 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de clasificación de imágenes) |
| Tipos de cuantizacion | float (FP32) y w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | No disponible (modelo de visión, no procesa texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | PyTorch (checkpoint base), ONNX, QNN_DLC, TFLITE |

Otras especificaciones relevantes:

| Parametro | Valor |
|---|---|
| Resolucion de entrada | 224 x 224 |
| Dataset de referencia | ImageNet |
| Tamano del modelo (float) | 100 MB |
| Tamano del repositorio | 2,6 GB |
| Tarea (pipeline) | image-classification |
| Uso secundario | backbone para visión por computador |
| Version de SDK indicada | QAIRT 2.50 |

## Arquitectura y entrenamiento

DLA (Deep Layer Aggregation) es una arquitectura de red neuronal convolucional que organiza la agregación de características de forma iterativa (fusionando bloques de resolución creciente) y jerárquica (combinando bloques semánticos y de resolución a lo largo de la red). Este diseño busca preservar información de múltiples niveles de abstracción, a diferencia de las conexiones residuales simples o las densas. El paper de referencia es arXiv:1707.06484. El modelo es un backbone puro sin cabeza de detección ni segmentación; en esta ficha se emplea con su cabeza de clasificación ajustada a ImageNet.

En cuanto al entrenamiento, Qualcomm no detalla en la información disponible el número de tokens (concepto no aplicable a imágenes), la composición exacta del dataset más allá de ImageNet, ni si se aplicaron etapas de RLHF o DPO (tampoco aplicables a un clasificador de imágenes). El checkpoint de partida es `timm/dla102x.in1k`, entrenado sobre ImageNet-1k a 224x224. Qualcomm no documenta en la model card procesos de ajuste fino posteriores; su aportación consiste principalmente en el pipeline de exportación y optimización para NPU mediante Qualcomm AI Hub Workbench y QAIRT.

## Capacidades

- Clasificación de imágenes en 1.000 clases de ImageNet a 224x224.
- Extracción de características como backbone para tareas posteriores (detección, segmentación, recuperación, clasificación personalizada).
- Inferencia acelerada en NPU de chipsets Qualcomm Snapdragon y Dragonwing.
- Ejecución con cuantización w8a8 para reducir latencia y huella de memoria.
- Soporte de exportación con pesos personalizados, formas de entrada personalizadas y configuraciones de runtime específicas mediante la librería Qualcomm AI Hub Models.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión.
- No se documentan capacidades multilingües, de audio ni de vídeo.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles Android: el modelo se ejecuta sobre la NPU con latencias inferiores a 2 ms en los Snapdragon recientes, lo que permite etiquetar fotos o frames de cámara en tiempo real dentro de una app sin enviar datos a la nube.
- Preprocesado en pipelines de visión en dispositivo: usar DLA-102-X como filtro rápido para descartar o priorizar imágenes antes de pasarlas a modelos más pesados (detección, OCR o segmentación), reduciendo consumo energético.
- Organización automática de galerías fotográficas: clasificación de las imágenes de un dispositivo en categorías ImageNet para agruparlas, buscar por contenido o generar etiquetas sin conexión.
- Backbone para modelos personalizados: fine-tuning de la red sobre un dataset propio y exportación con AI Hub Models para desplegar un clasificador específico (por ejemplo, control de calidad industrial) en hardware Qualcomm.
- Sistemas de visión embebidos en robótica y drones con SoC Dragonwing: la inferencia sobre NPU con presupuestos de memoria de decenas de MB permite integrar clasificación continua en plataformas con restricciones térmicas y de batería.
- Moderación y filtrado de contenido en el borde: clasificar imágenes entrantes para marcar posibles contenidos inapropiados antes de subirlos a un servidor.
- Aplicaciones de realidad aumentada: identificar objetos o escenas en tiempo real para superponer información contextual, aprovechando el bajo tiempo de inferencia por frame.
- Telemetría y análisis en kioscos o cámaras inteligentes: clasificación local de imágenes capturadas por dispositivos IoT con Snapdragon, evitando costes de ancho de banda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (top-1, top-5 u otros) en la información disponible. La model card únicamente proporciona métricas de latencia y memoria por chipset. Se reproduce a continuación una selección representativa de la tabla de rendimiento publicada (runtime ONNX):

| Chipset | Precision | Tiempo de inferencia (ms) | Rango de memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | float | 1,24 | 0 - 107 | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | w8a8 | 0,732 | 0 - 120 | NPU |
| Snapdragon 8 Elite For Galaxy Mobile | float | 1,555 | 0 - 103 | NPU |
| Snapdragon 8 Elite For Galaxy Mobile | w8a8 | 0,862 | 0 - 119 | NPU |
| Snapdragon X2 Elite | float | 1,335 | 2 - 2 | NPU |
| Snapdragon X2 Elite | w8a8 | 0,699 | 1 - 1 | NPU |
| Snapdragon X Elite | float | 2,67 | 55 - 55 | NPU |
| Snapdragon X Elite | w8a8 | 1,383 | 27 - 27 | NPU |
| Snapdragon 8 Gen 3 Mobile | float | 1,86 | 0 - 156 | NPU |
| Snapdragon 8 Gen 3 Mobile | w8a8 | 0,993 | 0 - 156 | NPU |
| Snapdragon 8 Gen 1 Mobile | float | 3,705 | 1 - 133 | NPU |
| Snapdragon 8 Gen 1 Mobile | w8a8 | 1,727 | 0 - 157 | NPU |
| Dragonwing IQ-8275 | float | 4,432 | 0 - 5 | NPU |
| Dragonwing IQ-8275 | w8a8 | 1,511 | 0 - 4 | NPU |
| Dragonwing QCS8550 (Proxy) | float | 2,622 | 0 - 57 | NPU |
| Dragonwing QCS8550 (Proxy) | w8a8 | 1,387 | 0 - 31 | NPU |
| Dragonwing Q-8750 | float | 1,555 | 0 - 103 | NPU |
| Dragonwing Q-8750 | w8a8 | 0,862 | 0 - 11 | NPU |
| Dragonwing IQ-9075 | float | 3,987 | 0 - 4 | NPU |
| Dragonwing IQ-9075 | w8a8 | 1,667 | 0 - 3 | NPU |

Se observa que la cuantización w8a8 reduce aproximadamente a la mitad el tiempo de inferencia respecto a float en prácticamente todos los chipsets listados. No se proporcionan cifras de throughput en imágenes por segundo ni datos de precisión tras la cuantización.

## Requisitos de hardware

- El modelo está optimizado específicamente para NPU de Qualcomm (Snapdragon y Dragonwing); el rendimiento publicado se refiere siempre a la NPU como unidad de cómputo principal.
- Huella de memoria: 100 MB en float y aproximadamente 26 MB en w8a8 (derivados de 26,3 M de parámetros), con rangos de memoria pico reportados entre 1 MB y 223 MB según chipset y precisión.
- No requiere GPU de escritorio para su despliegue objetivo; el hardware destino son SoC móviles y embebidos Qualcomm.
- Chipsets validados con métricas publicadas: Snapdragon 8 Elite Gen 5, Snapdragon 8 Elite, Snapdragon X2 Elite, Snapdragon X Elite, Snapdragon 8 Gen 3, Snapdragon 8 Gen 1, Dragonwing IQ-8275, IQ-9075, IQ-X7181, QCS6490, QCS8550, QCS8450, Q-6690, Q-7790 y Q-8750.
- Opciones de despliegue: QAIRT 2.50 con formatos ONNX (ONNX Runtime 1.30.0), QNN_DLC y TFLITE; exportación personalizada mediante la librería `qai_hub_models` y compilación con Qualcomm AI Hub Workbench.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que es un modelo de visión y no de lenguaje.
- Latencia observada: desde 0,699 ms (Snapdragon X2 Elite, w8a8) hasta 10,496 ms (Dragonwing Q-6690, w8a8) en los datos publicados.
- No se proporcionan cifras de throughput ni de consumo energético.

## Comparativa con modelos similares

La información disponible no ofrece métricas de precisión que permitan comparar el rendimiento del modelo frente a alternativas equivalentes. En la tabla se comparan únicamente características estructurales con backbones de clasificación de uso común, indicando que los datos de exactitud no están disponibles.

| Modelo | Parametros | Entrada | Contexto/aplicacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DLA-102-X (Qualcomm) | 26,3 M | 224x224 | Clasificación de imágenes en NPU Qualcomm | BSD-3-Clause | HuggingFace y Qualcomm AI Hub |
| ResNet-50 | ~25,6 M | 224x224 | Clasificación de imágenes, backbone genérico | BSD-3-Clause (implementaciones) | Múltiples repositorios |
| DenseNet-121 | ~8,0 M | 224x224 | Clasificación de imágenes, backbone | BSD-3-Clause (implementaciones) | Múltiples repositorios |

Tanto ResNet-50 como DenseNet-121 son referencias ampliamente utilizadas como backbone, pero la comparación de exactitud con DLA-102-X no puede realizarse con la información proporcionada, ya que Qualcomm no publica resultados de top-1 o top-5 en esta model card.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo ni de equidad en la información disponible. Al haber sido entrenado sobre ImageNet, hereda los sesgos y las limitaciones de cobertura de dicho dataset.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí puede producir clasificaciones erróneas o excesivamente confiadas en imágenes fuera de la distribución de ImageNet.
- Limitación de idioma: no aplica, es un modelo de visión. No procesa texto ni audio.
- Limitación de contexto: no aplica; la entrada es una imagen de 224x224 y no maneja secuencias.
- La cuantización w8a8 reduce el tiempo de inferencia pero puede degradar la precisión; la model card no publica la pérdida de exactitud asociada.
- Restricciones de licencia: BSD-3-Clause permite uso comercial y modificación, siempre que se conserven los avisos de copyright y la cláusula de exención de responsabilidad. No se ha detectado una restricción adicional específica para uso comercial.
- Dependencia de hardware: los artefactos pre-exportados están optimizados para NPU Qualcomm y pueden no funcionar o hacerlo con bajo rendimiento en otras plataformas.
- El rendimiento reportado depende de versiones concretas de SDK (QAIRT 2.50, ONNX Runtime 1.30.0) y puede variar con otras versiones.
- Algunas entradas de la tabla de rendimiento, como QCS8550 (Proxy), se marcan como proxy, por lo que sus métricas son aproximadas.
- Cualquier fine-tuning debe reexportarse mediante AI Hub Models; los pesos pre-exportados no admiten reemplazo directo de parámetros sin recompilación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/DLA-102-X
- Checkpoint base en timm: https://huggingface.co/timm/dla102x.in1k
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/dla102x
- Repositorio Qualcomm AI Hub Models (GitHub): https://github.com/qualcomm/ai-hub-models
- Codigo del modelo en AI Hub Models (v0.64.0): https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/dla102x
- Paper de la arquitectura DLA (arXiv:1707.06484): https://arxiv.org/abs/1707.06484
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm AI Hub: https://myaccount.qualcomm.com/signup
- Documentacion de despliegue en Quectel Pi (referencia a `qai_hub_models.models.dla102x`): https://developer.quectel.com/doc/sbc/Quectel-Pi-H1/en/NPU-Applications/qcom_ai.html
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
