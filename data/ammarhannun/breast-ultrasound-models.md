# AmmarHannun/breast-ultrasound-models

## Resumen

`breast-ultrasound-models` es un paquete de dos modelos de vision por computador para imagen médica publicados por AmmarHannun en Hugging Face. Incluye un clasificador de imágenes de ecografía mamaria (ResNet-50) que distingue entre lesiones benignas, malignas y tejido normal, y un segmentador de lesiones (U-Net con encoder ResNet-34) que genera la máscara de la región de interés. Ambos se distribuyen en formato PyTorch (state dicts) y ONNX, lo que permite ejecución tanto en servidor como en navegador.

El modelo se entrenó sobre el dataset público BUSI (Breast Ultrasound Images), compuesto por 780 imágenes de ecografía mamaria. El autor reporta una precisión de test del 84,6 % en clasificación, un recall de malignidad del 81,0 % y un IoU/Dice de 0,673/0,759 en segmentación sobre imágenes con lesión. Es relevante porque ofrece un pipeline completo (clasificación + segmentación) con licencia MIT y exportación ONNX, lo que facilita su integración en prototipos de investigación y demos web.

No es un modelo de lenguaje ni un modelo generativo: es un conjunto de pesos de CNN para clasificación y segmentación de imagen médica, con un tamaño de repositorio de 0,4 GB. El autor lo etiqueta explícitamente como demo de investigación y no como dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador: ResNet-50. Segmentador: U-Net con encoder ResNet-34 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch y ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no aplica; entrada de imagen) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dicts (`classifier.pt`, `segmenter.pt`) y ONNX (`classifier.onnx`, `segmenter.onnx`) |

## Arquitectura y entrenamiento

El paquete contiene dos redes convolucionales independientes. El clasificador emplea una ResNet-50 que recibe imágenes normalizadas con estadísticas de ImageNet y de tamaño 224×224, y produce logits sobre tres clases: benigno, maligno y normal. El segmentador emplea una U-Net con encoder ResNet-34, recibe imágenes de 256×256 y genera la máscara de la lesión; según la model card, deja en blanco el 88,9 % de las imágenes normales, lo que reduce falsos positivos en segmentación.

El entrenamiento se realizó sobre el dataset BUSI (780 imágenes de ecografía mamaria). La información disponible no detalla el número de épocas, la composición exacta del split, el uso de aumentación de datos, funciones de pérdida ni si hubo ajuste fino adicional. Tampoco se documentan técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de arquitectura. La exportación a ONNX con entradas `1x3xHxW` y normalización ImageNet permite desplegar ambos modelos en entornos sin PyTorch, incluido el navegador.

## Capacidades

- Clasificación de imágenes de ecografía mamaria en tres clases: benigno, maligno y normal.
- Segmentación binaria de lesiones mediante U-Net, con salida de máscara por píxel.
- Ejecución en navegador gracias a los artefactos ONNX y a la demo en Hugging Face Spaces.
- Procesamiento de imágenes individuales con entrada `1x3xHxW` normalizada con estadísticas de ImageNet.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades fuera de imagen ecográfica.

## Casos de uso

- Triaje asistido en investigación: usar el clasificador para priorizar imágenes con alta probabilidad de malignidad en un conjunto de estudio, revisando después manualmente por radiólogos; el recall de malignidad del 81,0 % permite calibrar el umbral según el objetivo de sensibilidad.
- Preetiquetado de datasets: emplear el segmentador para generar máscaras iniciales de lesiones que luego se corrigen manualmente, reduciendo el tiempo de anotación en estudios con cientos de imágenes.
- Demo educativa en navegador: desplegar los ONNX en una aplicación web (como el Space del autor) para mostrar el funcionamiento de un pipeline de clasificación y segmentación médica sin infraestructura de GPU.
- Evaluación comparativa de arquitecturas: usar ResNet-50 y U-Net/ResNet-34 como líneas base reproducibles sobre BUSI para comparar con nuevos modelos de segmentación o clasificación mamaria.
- Prototipos de investigación clínica: integrar el pipeline en cuadernos de análisis para explorar correlaciones entre características de la lesión y variables clínicas, siempre con revisión experta.
- Filtrado de imágenes normales: aprovechar que el segmentador deja en blanco el 88,9 % de las imágenes normales para descartar casos sin lesión en pipelines de preprocesado y centrar la revisión en imágenes sospechosas.

## Benchmarks y rendimiento

| Modelo | Metrica | Resultado |
|---|---|---|
| Clasificador (ResNet-50) | Precision en test | 84,6 % |
| Clasificador (ResNet-50) | Recall de malignidad | 81,0 % |
| Segmentador (U-Net, ResNet-34) | IoU / Dice en test (imágenes con lesión) | 0,673 / 0,759 |
| Segmentador (U-Net, ResNet-34) | Imágenes normales dejadas en blanco | 88,9 % |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni métricas adicionales como precisión por clase, AUC o especificidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,4 GB) y las arquitecturas ResNet-50 y U-Net/ResNet-34, la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente para lotes pequeños; A100, H100, RTX 4090 o RTX 3060 son válidas, aunque sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, incluidas RTX 3060, RTX 4060 y superiores; también puede ejecutarse en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch (state dicts), ONNX Runtime (servidor o navegador vía WebAssembly/WebGPU), y cualquier framework que cargue ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| breast-ultrasound-models (este) | Clasificación + segmentación de ecografía mamaria | ResNet-50 + U-Net/ResNet-34 | BUSI (780 imágenes) | MIT | Hugging Face, PyTorch y ONNX |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de modelos comparables de la misma categoría con métricas verificables para establecer una comparación rigurosa.

## Limitaciones y advertencias

- El propio autor indica que es una demo de investigación y no un dispositivo médico; no debe usarse para diagnóstico clínico.
- Entrenado sobre un único dataset pequeño (BUSI, 780 imágenes), lo que limita la generalización a otros equipos de ecografía, poblaciones o protocolos de adquisición.
- El recall de malignidad del 81,0 % implica que aproximadamente una de cada cinco lesiones malignas puede no detectarse; inaceptable en uso clínico sin revisión humana.
- Riesgo de sesgo por la composición del dataset BUSI (posible desbalance de clases y sesgo demográfico no documentado).
- No se documentan análisis de sesgo, calibración, ni validación externa en la información disponible.
- La licencia MIT permite uso comercial, pero el uso clínico está fuera del alcance previsto y requiere regulatory clearance adicional.
- No se especifican limitaciones de resolución o preprocesado más allá de la normalización ImageNet y los tamaños 224/256; entradas fuera de ese formato pueden degradar el rendimiento.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/AmmarHannun/breast-ultrasound-models
- Repositorio de código: https://github.com/Ammarhannun/breast-cancer-classification-segmentation
- Demo en vivo (Hugging Face Spaces): https://huggingface.co/spaces/AmmarHannun/breast-ultrasound-analyser
- Dataset BUSI: no disponible en la información proporcionada
