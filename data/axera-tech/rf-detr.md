# AXERA-TECH/RF-DETR

## Resumen

RF-DETR es un modelo de detección de objetos y segmentación en tiempo real desarrollado originalmente por Roboflow, que destaca por su estado del arte en COCO y su diseño orientado al fine-tuning para dominios específicos. La arquitectura se basa en transformers de detección (DETR) y utiliza búsqueda de arquitectura neuronal (NAS) con pesos compartidos para descubrir curvas de Pareto de precisión-latencia adaptadas a cada dataset objetivo. Este repositorio concreto, publicado por AXERA-TECH, es una demostración de RF-DETR ejecutándose en la NPU de AXERA (plataformas AX650 y Pulsar2), con instrucciones para exportar el modelo a ONNX, compilarlo con la herramienta Pulsar2 y desplegarlo en placa. La relevancia actual radica en la creciente demanda de modelos de visión eficientes para edge computing, donde la latencia y el consumo energético son críticos. La variante incluida es la "small", aunque no se especifican los parámetros totales ni la longitud de contexto, ya que se trata de un modelo de visión y no de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de detección (DETR) con búsqueda de arquitectura neuronal (NAS) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (se menciona ONNX y compilación a axmodel con Pulsar2) |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | ONNX, axmodel (formato propietario de AXERA) |

## Arquitectura y entrenamiento

RF-DETR se basa en la arquitectura DETR (Detection Transformer), que utiliza consultas aprendibles y atención cruzada para predecir directamente las cajas delimitadoras y las clases sin necesidad de propuestas de región. La innovación principal, descrita en el paper "RF-DETR: Neural Architecture Search for Real-Time Detection Transformers", consiste en aplicar búsqueda de arquitectura neuronal con pesos compartidos (weight-sharing NAS) para encontrar automáticamente configuraciones óptimas de la red para un dataset concreto, maximizando la precisión y minimizando la latencia. Esto permite obtener modelos ligeros y especializados sin necesidad de entrenar desde cero. El repositorio de AXERA-TECH incluye el código para exportar el modelo a ONNX y compilarlo con Pulsar2, la herramienta de compilación de su NPU, lo que sugiere que el modelo puede ser cuantizado y optimizado para hardware de edge, aunque no se detallan los datos de entrenamiento ni el proceso de fine-tuning en la información disponible.

## Capacidades

- Detección de objetos en tiempo real: RF-DETR está diseñado para localizar y clasificar objetos en imágenes con baja latencia, adecuado para aplicaciones de video en vivo.
- Segmentación de imágenes: según la descripción del repositorio de Roboflow, el modelo soporta tareas de segmentación, aunque no se detalla si es segmentación semántica o de instancias.
- Fine-tuning para dominios específicos: gracias a la búsqueda de arquitectura neuronal, el modelo puede adaptarse a datasets particulares (por ejemplo, industriales, agrícolas o médicos) con un ajuste fino eficiente.
- Despliegue en NPU de AXERA: el modelo está preparado para ejecutarse en la plataforma AX650 y compilarse con Pulsar2, lo que permite inferencia en dispositivos de bajo consumo.
- Exportación a ONNX: el repositorio incluye scripts para convertir el modelo a ONNX, facilitando su integración en diferentes entornos de inferencia.
- No se han documentado capacidades de procesamiento de lenguaje, tool calling ni agentes, al ser un modelo puramente visual.

## Casos de uso

- Vigilancia y seguridad en edge: el modelo puede ejecutarse en cámaras inteligentes basadas en la NPU de AXERA para detectar personas, vehículos u objetos de interés en tiempo real, con una latencia lo suficientemente baja para aplicaciones de seguridad.
- Robótica autónoma: en robots móviles o drones, RF-DETR puede proporcionar detección de obstáculos y objetos para la navegación, aprovechando el bajo consumo de la NPU para extender la vida de la batería.
- Inspección industrial: tras un fine-tuning con imágenes de defectos de fabricación, el modelo puede identificar anomalías en líneas de producción, desplegado en hardware embebido de AXERA para un control de calidad continuo.
- Agricultura de precisión: adaptado a cultivos específicos, RF-DETR puede contar frutos o detectar plagas en imágenes capturadas por drones o sensores de campo, con inferencia local en dispositivos de bajo coste.
- Prototipado rápido de sistemas de visión: gracias a la exportación a ONNX y a las instrucciones de compilación con Pulsar2, los desarrolladores pueden evaluar rápidamente el modelo en su hardware objetivo antes de integrarlo en un producto final.
- Sistemas de asistencia al conductor (ADAS): en vehículos o maquinaria, el modelo puede detectar señales, peatones u otros vehículos en tiempo real, utilizando la NPU para minimizar el consumo energético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Aunque el paper de Roboflow menciona que RF-DETR alcanza estado del arte en COCO, no se proporcionan cifras concretas en el repositorio de AXERA-TECH ni en la model card. Por tanto, no es posible presentar una tabla comparativa con datos verificados.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en la NPU de AXERA, concretamente en la plataforma AX650 y mediante la herramienta Pulsar2 para la compilación a formato axmodel.
- No se especifican requisitos de VRAM ni de GPU, ya que el objetivo es la inferencia en hardware de edge, no en GPUs de propósito general.
- Para ejecutar la demo en placa, se necesita un dispositivo con la NPU de AXERA (por ejemplo, una placa de desarrollo AX650) y el entorno Python correspondiente.
- El proceso de compilación requiere la herramienta Pulsar2, que se ejecuta en un PC host, y el modelo resultante (axmodel) se transfiere a la placa.
- No se proporcionan datos de latencia ni throughput, aunque al estar orientado a tiempo real se espera que cumpla con requisitos de baja latencia, pero sin cifras confirmadas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros detectores en tiempo real como YOLO, RT-DETR o Deformable DETR. Aunque RF-DETR comparte el objetivo de detección eficiente, los datos de parámetros, contexto y rendimiento no están disponibles en el repositorio de AXERA-TECH. Por tanto, la comparativa se limita a señalar que el modelo pertenece a la familia de detectores transformer y que su principal ventaja es la búsqueda automática de arquitectura para cada dominio, pero sin cifras concretas.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos o alucinaciones, dado que es un modelo de visión y no de lenguaje, pero al igual que otros detectores puede fallar en condiciones de iluminación adversa, oclusiones o clases poco representadas.
- La licencia del modelo no está especificada, lo que supone un riesgo para su uso comercial sin una revisión legal previa.
- El repositorio de AXERA-TECH está orientado a una demo en su NPU específica; para otros entornos (GPU, CPU) sería necesario adaptar el proceso de compilación.
- La documentación es escasa: no se incluyen detalles del entrenamiento, configuración de hiperparámetros ni instrucciones de fine-tuning en este repositorio concreto.
- El modelo no soporta tareas de lenguaje natural, por lo que no es adecuado para aplicaciones que requieran procesamiento de texto.
- La variante incluida es "small", pero se desconoce si existen otras variantes disponibles y sus diferencias de rendimiento.

## Enlaces

- HuggingFace: https://huggingface.co/AXERA-TECH/RF-DETR
- Repositorio GitHub de AXERA-TECH: https://github.com/AXERA-TECH/RF-DETR.axera
- Repositorio GitHub de Roboflow (modelo original): https://github.com/roboflow/rf-detr
- Paper (arXiv): https://arxiv.org/html/2511.09554v1
