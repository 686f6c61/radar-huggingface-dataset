# abishektamilarasan/agricopilot-crop-disease-efficientnetv2

## Resumen

AgriCopilot Crop Disease Classification Suite es un conjunto de dos clasificadores de imagen basados en EfficientNetV2-S, ajustados por transferencia para el diagnostico de enfermedades foliares en cultivos. Lo desarrolla Abishek Tamilarasan como componente de vision por computador del proyecto AgriCopilot, un sistema de soporte a la decision agricola multimodal y explicable. El repositorio resuelve una tarea acotada pero critica en agricultura de precision: identificar la patologia de una hoja a partir de una fotografia de campo y devolver la clase con su probabilidad.

El primer modelo (1A) se entrena sobre 13.424 imagenes fotografiadas en condiciones reales de campo en la India, cubriendo cinco cultivos basicos (arroz, trigo, maiz, patata y cana de azucar) y 17 clases. El segundo (1B) se entrena sobre el benchmark de laboratorio PlantVillage, con 54.305 imagenes y 38 clases repartidas en 14 especies. Ambos comparten la misma arquitectura y el mismo pipeline de preprocesado a 224x224, con salida softmax multiclase y soporte de mapas de saliencia Grad-CAM para explicabilidad.

La relevancia actual es practica: ofrece pesos listos para inferencia en PyTorch con licencia MIT, sin dependencia de APIs propietarias, y una diferencia explicita entre rendimiento en laboratorio (99,49 % de accuracy en PlantVillage) y rendimiento en campo (94,82 % en el conjunto indio), lo que resulta util para calibrar expectativas antes de desplegar en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-S (CNN con compound scaling), backbone torchvision con clasificador sustituido por Dropout(0.4) + Linear |
| Parametros totales | no disponible (el modelo card no publica el recuento; EfficientNetV2-S estandar ronda los 21,5 M, dato no confirmado por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 224x224 RGB) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos PyTorch en punto flotante; no se documentan variantes INT8, FP16 ni GGUF) |
| Idiomas soportados | en (etiquetas de clase en ingles) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch `.pt` (`disease_indian_best.pt` y `disease_plantvillage_best.pt`), con diccionario `model_state_dict` |
| Tamano del repositorio | 0,3 GB |
| Numero de clases | 17 (modelo 1A) y 38 (modelo 1B) |
| Resolucion de entrada | 224x224, normalizacion ImageNet (mean [0.485, 0.456, 0.406], std [0.229, 0.224, 0.225]) |

## Arquitectura y entrenamiento

La arquitectura es una CNN EfficientNetV2-S preentrenada en ImageNet y reutilizada mediante transfer learning. El autor sustituye la capa de clasificacion original por un bloque `Sequential` con `Dropout(p=0.4)` y una capa lineal del numero de clases correspondiente (17 o 38). El pipeline de inferencia documentado aplica redimensionado a 224x224, conversion a tensor y normalizacion con estadisticos de ImageNet, lo que confirma que el ajuste fino se hizo sobre la misma distribucion de entrada que el preentrenamiento.

El modelo 1A se entrena sobre un dataset propio de imagenes de campo indio con 13.424 fotografias tomadas bajo iluminacion real, polvo y oclusion, distribuidas en 17 clases que cubren patologias concretas: en arroz (Brown Spot, Leaf Blast, Neck Blast, Healthy), trigo (Brown Rust, Yellow Rust, Healthy), maiz (Common Rust, Gray Leaf Spot, Northern Leaf Blight, Healthy), patata (Early Blight, Late Blight, Healthy) y cana de azucar (Bacterial Blight, Red Rot, Healthy). El modelo 1B se entrena sobre PlantVillage, con 54.305 imagenes de laboratorio y 38 clases en 14 especies. La model card no detalla hiperparametros de entrenamiento, numero de epocas, estrategia de aumento de datos, particion train/val/test ni si se aplico congelacion parcial del backbone; esos datos no estan disponibles.

La innovacion tecnica declarada es la integracion de Grad-CAM para generar mapas de saliencia que justifican la prediccion, un requisito habitual en sistemas de apoyo a la decision agricola donde el usuario final necesita ver que region de la hoja ha motivado el diagnostico. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni destilacion, que no aplican a este tipo de modelo.

## Capacidades

- Clasificacion de imagenes de hojas de cultivo en 17 clases (modelo 1A) o 38 clases (modelo 1B), con salida de probabilidades softmax y top-k configurable.
- Diagnostico de enfermedades concretas en arroz, trigo, maiz, patata y cana de azucar (modelo 1A), incluyendo la clase Healthy para cada cultivo.
- Cobertura de la taxonomia completa de PlantVillage en 14 especies (modelo 1B), orientada a comparacion con literatura academica.
- Explicabilidad mediante Grad-CAM: generacion de mapas de calor que localizan la region de la hoja relevante para la prediccion.
- Inferencia en CPU y GPU mediante PyTorch estandar, sin dependencias de servicios externos.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, generacion de texto, vision general (solo clasificacion cerrada), audio ni modo thinking. Es un clasificador discriminativo, no un modelo generativo.
- Capacidad multilingue: no aplica; las etiquetas de salida estan en ingles.

## Casos de uso

- Aplicacion movil de diagnostico en campo: el modelo 1A se integra en una app Android o iOS via PyTorch Mobile o exportacion a ONNX, y el agricultor fotografia una hoja para obtener el top-3 de patologias con probabilidad. La entrenacion sobre imagenes de campo indio con polvo y oclusion lo hace adecuado para condiciones reales, no solo de laboratorio.
- Sistema de alerta temprana en explotaciones: procesamiento por lotes de imagenes capturadas por drones o robots agricolas, con agregacion de predicciones por parcela para detectar brotes de roya o tizon antes de que se extiendan.
- Triaje en cooperativas agricolas: un tecnico de campo sube fotos desde una tablet y el modelo preclasifica los casos, priorizando los que requieren visita de un fitopatologo. El top-3 con probabilidades permite derivar los casos ambiguos a revision humana.
- Investigacion agronomica y comparacion de datasets: el modelo 1B sirve como baseline reproducible sobre PlantVillage para comparar nuevas arquitecturas o tecnicas de aumento de datos, dado que el split y las metricas estan documentados (99,49 % accuracy, 0,995 macro-F1).
- Modulo de vision en un sistema multimodal de soporte a la decision: AgriCopilot combina la prediccion del clasificador con recomendaciones de tratamiento y contexto meteorologico; el modelo aporta la senal visual y Grad-CAM aporta la justificacion que se muestra al usuario.
- Auditoria y formacion: los mapas Grad-CAM permiten generar material didactico que muestra que sintomas visuales (manchas, necrosis, decoloracion) activan cada clase, util para formar a tecnicos noveles.
- Control de calidad en invernadero: integracion en un pipeline de camaras fijas que captura imagenes periodicas y dispara alertas cuando la probabilidad de una clase patogena supera un umbral configurable.

## Benchmarks y rendimiento

| Modelo | Dataset | Imagenes de test | Accuracy | Macro-F1 | Test loss |
|---|---|---|---|---|---|
| 1A Indian Field Crop Pathology | custom-indian-field-crops | no disponible (13.424 imagenes en total, split no detallado) | 94,82 % | 0,945 | 0,1842 |
| 1B PlantVillage Benchmark | PlantVillage | no disponible (54.305 imagenes en total, split no detallado) | 99,49 % | 0,995 | 0,0210 |

No se han publicado resultados comparativos frente a otras arquitecturas (ResNet, ViT, ConvNeXt) ni desglose por clase en la informacion disponible. Tampoco se detalla el tamano exacto del conjunto de test, por lo que las cifras deben interpretarse como rendimiento declarado por el autor y no como una evaluacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para una sola imagen a 224x224, dado el tamano reducido de EfficientNetV2-S y el regimen de inferencia por lotes pequenos. Para lotes grandes (por ejemplo, 64 imagenes) se recomienda entre 2 y 4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece holgura. Para procesamiento por lotes de miles de imagenes, A100 o H100 reducen el tiempo total, aunque el cuello de botella sera la carga de datos mas que el computo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia individual, con latencias del orden de decenas a cientos de milisegundos por imagen.
- Opciones de despliegue: PyTorch nativo (documentado en la model card), exportacion a TorchScript u ONNX Runtime para produccion, PyTorch Mobile para movil. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no aplican a un clasificador de vision.
- Latencia y throughput: no disponibles de forma oficial. En una GPU consumer cabe esperar varios cientos de imagenes por segundo en lotes; en CPU, del orden de decenas por segundo. Son estimaciones no confirmadas por el autor.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / entrada | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AgriCopilot 1A (este modelo) | EfficientNetV2-S fine-tuned | no disponible | Imagen 224x224, 17 clases | 94,82 % accuracy, 0,945 macro-F1 en campo indio | MIT | HuggingFace, 0 descargas |
| AgriCopilot 1B (este modelo) | EfficientNetV2-S fine-tuned | no disponible | Imagen 224x224, 38 clases | 99,49 % accuracy, 0,995 macro-F1 en PlantVillage | MIT | HuggingFace, 0 descargas |
| EfficientNetV2-S preentrenado en ImageNet | EfficientNetV2-S | ~21,5 M (dato publico de la arquitectura, no del autor) | Imagen 224x224, 1000 clases | No aplica a patologia vegetal sin fine-tuning | Apache 2.0 (torchvision) | Ampliamente disponible |
| Clasificadores PlantVillage genericos (ResNet-50, ViT-B/16 fine-tuned) | CNN / transformer | 25 M / 86 M aprox. | Imagen 224x224, 38 clases | Habitualmente por encima del 98 % en PlantVillage en literatura, sin cifra verificada en esta busqueda | Variable | Multiples en HuggingFace |

La comparativa directa con alternativas concretas no esta disponible en la informacion proporcionada; las filas de EfficientNetV2-S y de clasificadores genericos se incluyen como referencia contextual de la categoria, no como resultados medidos en el mismo protocolo.

## Limitaciones y advertencias

- El modelo 1A esta entrenado exclusivamente con imagenes de campo de la India y cinco cultivos; su generalizacion a otras regiones, variedades locales o condiciones de iluminacion muy distintas no esta validada.
- El modelo 1B obtiene cifras muy altas en PlantVillage, un dataset de laboratorio con fondos controlados; el salto a imagenes reales suele producir una caida notable de rendimiento, como sugiere la diferencia entre 99,49 % y 94,82 % en el propio repositorio.
- No se documenta el split train/val/test ni el numero de imagenes de test, por lo que las metricas declaradas no son auditables de forma independiente.
- Riesgo de alucinacion en sentido estricto no aplica (es un clasificador), pero si de falsos positivos con alta confianza ante imagenes fuera de distribucion (hojas de otras especies, imagenes borrosas, fondos no vegetales). No se documenta umbral de rechazo ni clase de "desconocido".
- Sesgo potencial hacia las condiciones de captura del dataset de entrenamiento (camaras, iluminacion, angulos) y hacia las especies y patologias cubiertas; las enfermedades no incluidas se mapearan erroneamente a una de las clases existentes.
- Idioma: etiquetas y documentacion solo en ingles.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte; la responsabilidad sobre decisiones agronomicas basadas en las predicciones recae en el integrador.
- No es un modelo generativo: no puede explicar sintomas en lenguaje natural ni responder preguntas; la explicabilidad se limita a mapas Grad-CAM.
- Sin descargas ni validacion por terceros en el momento de la consulta; madurez y mantenimiento del repositorio no estan garantizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abishektamilarasan/agricopilot-crop-disease-efficientnetv2
- Repositorio del proyecto AgriCopilot (aplicacion y paper): https://github.com/abishektamilarasan/Agricopilot
- Perfil del autor en HuggingFace: https://huggingface.co/abishektamilarasan
- Dataset PlantVillage (referencia externa, no enlazado en la model card): no disponible en la informacion proporcionada
- Paper asociado: no disponible en la informacion proporcionada (la model card remite al repositorio de GitHub)
