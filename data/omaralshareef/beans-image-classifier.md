# omaralshareef/beans-image-classifier

## Resumen

El modelo `omaralshareef/beans-image-classifier` es un clasificador de imágenes especializado en la detección de enfermedades en hojas de frijol (Phaseolus vulgaris). Desarrollado por omaralshareef, se basa en una arquitectura MobileNetV3-Small preentrenada en ImageNet (timm/mobilenetv3_small_100.lamb_in1k) y ajustada sobre el dataset AI-Lab-Makerere/beans, que contiene imágenes de hojas con tres categorías: angular_leaf_spot, bean_rust y healthy. Con solo 1,53 millones de parámetros, es un modelo extremadamente ligero, diseñado para tareas de clasificación en agricultura de precisión, monitoreo de cultivos y aplicaciones educativas.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su tamaño reducido lo hace apto para despliegue en dispositivos con recursos limitados, como Raspberry Pi, teléfonos móviles o servidores de bajo coste. El autor reporta una precisión de validación del 95,49 % y una precisión de test del 89,84 %, lo que indica un buen rendimiento para el problema planteado, aunque con cierta caída entre validación y test que sugiere un ligero sobreajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Small (CNN) |
| Parametros totales | 1.533.043 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, FP32 por defecto) |
| Idiomas soportados | no aplica (entrada visual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en MobileNetV3-Small, una arquitectura de red neuronal convolucional (CNN) diseñada para eficiencia computacional en dispositivos con recursos limitados. MobileNetV3 incorpora bloques residuales invertidos con atención por canal (squeeze-and-excitation) y funciones de activación swish, logrando un equilibrio entre precisión y latencia. El modelo base fue preentrenado en ImageNet-1k y posteriormente ajustado (fine-tuning) sobre el dataset AI-Lab-Makerere/beans, que contiene imágenes de hojas de frijol etiquetadas en tres clases.

El entrenamiento se realizó durante 5 épocas con un optimizador AdamW, una tasa de aprendizaje de 5e-5 y un tamaño de lote de 16, utilizando Apple Silicon (MPS) como acelerador. El mejor checkpoint se seleccionó según la pérdida de validación. No se aplicaron técnicas de aumento de datos adicionales más allá de las estándar del pipeline de transformers, ni se utilizaron métodos de alineación como RLHF o DPO, al tratarse de una tarea de clasificación supervisada.

## Capacidades

- Clasificacion de imagenes en 3 clases: angular_leaf_spot, bean_rust y healthy.
- Deteccion de enfermedades foliares en frijol a partir de fotografias de hojas.
- Inferencia rapida y de bajo coste computacional gracias a su tamano reducido (1,5 M de parametros).
- Compatible con el pipeline `image-classification` de Hugging Face Transformers.
- Soporte para despliegue en entornos de produccion mediante la API de transformers o exportacion a formatos como ONNX o TensorFlow Lite (no documentado explicitamente, pero factible por la arquitectura).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales mas alla de la vision.

## Casos de uso

- Monitoreo de cultivos en campo: un agricultor puede fotografiar hojas de frijol con un telefono movil y obtener un diagnostico inmediato de la presencia de roya o mancha angular, permitiendo una actuacion temprana. El modelo es lo suficientemente ligero para ejecutarse en el propio dispositivo sin conexion a internet.
- Agricultura de precision a gran escala: integrado en drones o robots agricolas, el modelo puede analizar imagenes aereas o de proximidad para mapear la incidencia de enfermedades en parcelas extensas, ayudando a optimizar el uso de fungicidas.
- Sistema de alerta temprana en cooperativas agricolas: una aplicacion web o movil que reciba imagenes de los socios y clasifique automaticamente el estado de salud de las plantas, generando alertas cuando se detectan focos de infeccion.
- Educacion y divulgacion cientifica: herramienta didactica para estudiantes de agronomia o botonica, que permite identificar visualmente enfermedades comunes del frijol y comprender el flujo de trabajo de un modelo de clasificacion.
- Investigacion en fitopatologia: apoyo a investigadores que necesitan etiquetar grandes volumenes de imagenes de hojas de forma automatica, reduciendo el trabajo manual y acelerando el analisis de datos.
- Aplicaciones de asistencia en extensionismo agricola: los tecnicos de extension pueden usar el modelo en tabletas o portatiles de bajo coste para diagnosticar enfermedades en visitas de campo, incluso en zonas rurales con conectividad limitada.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el model-index y en la model card:

| Metrica | Valor |
|---|---|
| Precision de validacion (mejor checkpoint) | 95,49 % |
| Perdida de validacion (mejor checkpoint) | 0,235 |
| Precision de test | 89,84 % |
| Perdida de test | 0,303 |

No se han publicado comparaciones con otros modelos en la informacion disponible. La caida de precision entre validacion y test (5,65 puntos porcentuales) sugiere un ligero sobreajuste, aunque los valores absolutos son aceptables para una tarea de clasificacion de 3 clases.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en FP32 (1,5 M de parametros × 4 bytes). En FP16 seria aproximadamente 3 MB.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de entrada como NVIDIA GTX 1650 o integradas. Tambien funciona en CPU sin problemas.
- Compatible con consumer GPU: si, incluso en las mas modestas. Tambien puede ejecutarse en dispositivos edge como Raspberry Pi 4 o moviles con aceleracion NPU.
- Opciones de despliegue: pipeline de transformers en Python, exportacion a ONNX para inferencia con ONNX Runtime, TensorFlow Lite para moviles, o servidores de inferencia como TorchServe o FastAPI.
- Latencia y throughput estimados: al ser un modelo tan pequeno, la latencia en CPU es del orden de milisegundos (tipicamente < 10 ms por imagen en un procesador moderno). En GPU seria aun menor. No se dispone de mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Precision (test) | Licencia |
|---|---|---|---|---|
| omaralshareef/beans-image-classifier | MobileNetV3-Small | 1,53 M | 89,84 % | Apache 2.0 |
| AventIQ-AI/Beans-Image-Classification-AI-Model | ViT (Vision Transformer) | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo de AventIQ-AI, por lo que no es posible una comparacion cuantitativa. Ambos abordan la misma tarea y el mismo dataset, pero el de AventIQ utiliza una arquitectura transformer (ViT), que suele requerir mas recursos. El modelo de omaralshareef es mas ligero y probablemente mas adecuado para despliegue en entornos con restricciones de hardware.

## Limitaciones y advertencias

- Entrenado exclusivamente con el dataset AI-Lab-Makerere/beans, que contiene imagenes de hojas de frijol en condiciones controladas. Puede no generalizar bien a otras variedades de frijol, condiciones de iluminacion, fondos o estadios de la enfermedad diferentes.
- La precision de test (89,84 %) es inferior a la de validacion (95,49 %), lo que indica un posible sobreajuste. En produccion, el rendimiento real podria ser menor.
- No se han realizado evaluaciones de sesgo. El dataset podria contener sesgos de captura (misma camara, mismo fondo) que el modelo podria aprender, afectando su robustez en entornos reales.
- Al ser un modelo de clasificacion, no genera explicaciones sobre sus decisiones. Para aplicaciones criticas, se recomienda complementar con tecnicas de interpretabilidad (Grad-CAM, etc.).
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de verificar que el dataset de entrenamiento no tenga restricciones adicionales de uso.
- No se proporcionan pesos cuantizados ni versiones optimizadas para moviles, aunque la arquitectura es compatible con herramientas de conversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omaralshareef/beans-image-classifier
- Dataset AI-Lab-Makerere/beans: https://huggingface.co/datasets/AI-Lab-Makerere/beans
- Modelo base timm/mobilenetv3_small_100.lamb_in1k: https://huggingface.co/timm/mobilenetv3_small_100.lamb_in1k
- Modelo alternativo de AventIQ-AI: https://huggingface.co/AventIQ-AI/Beans-Image-Classification-AI-Model
