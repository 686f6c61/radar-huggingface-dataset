# Siya-34/dentalvision-efficientnetb3

## Resumen

DentalVision AI es un clasificador multi-etiqueta de imagen médica desarrollado por el usuario Siya-34 y publicado en Hugging Face. Su tarea es detectar seis hallazgos independientes sobre radiografías panorámicas dentales (OPG, ortopantomografías): dientes sanos, caries, dientes impactados, infección, dientes fracturados y quiste/lesión periapical (BDC/BDR). El modelo se presenta explícitamente como un prototipo educativo y de investigación, no como herramienta diagnóstica.

El repositorio corresponde a la variante EfficientNetB3 de un ensemble que, según la model card, combina EfficientNetB3, DenseNet121 y ConvNeXt-Tiny. Los pesos publicados son únicamente los de la rama EfficientNetB3 (10.792.750 parámetros en formato safetensors), por lo que el rendimiento del ensemble completo no es reproducible solo con este checkpoint.

Es relevante como ejemplo de fine-tuning con transferencia desde ImageNet en un dominio de datos muy escaso (230 radiografías únicas tras deduplicación) y como caso práctico de las limitaciones de los modelos de visión médica de código abierto: métricas modestas (macro AUC 0,66 en validación cruzada), ausencia de validación externa y una licencia permisiva (Apache-2.0) que no exime de las advertencias clínicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN EfficientNetB3 (rama de un ensemble con DenseNet121 y ConvNeXt-Tiny) |
| Parametros totales | 10.792.750 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (clasificación de imagen; etiquetas en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería PyTorch) |

Otros datos técnicos: entrada RGB de 288x576 píxeles (alto x ancho), redimensionado bilineal y normalización con media y desviación estándar de ImageNet. Salida de 6 probabilidades sigmoideas independientes en el orden: 0 = Healthy Teeth, 1 = Caries, 2 = Impacted Teeth, 3 = Infection, 4 = Fractured Teeth, 5 = BDC/BDR.

## Arquitectura y entrenamiento

La arquitectura es una CNN EfficientNetB3 con cabecera de clasificación multi-etiqueta (seis salidas sigmoideas independientes, no softmax). El entrenamiento parte de pesos preentrenados en ImageNet y aplica fine-tuning con pérdida BCE ponderada por clase positiva, optimizador AdamW, scheduler coseno y parada temprana sobre macro-AUC de validación. La model card menciona un ensemble con DenseNet121 y ConvNeXt-Tiny, pero el repositorio solo contiene los pesos de la rama EfficientNetB3.

Los datos proceden del dataset de Kaggle `imtkaggleteam/dental-opg-xray-dataset`, que no se redistribuye. Tras eliminar copias idénticas a nivel de byte almacenadas en varias carpetas de clase, quedan 230 radiografías únicas. No se documenta el número de tokens ni un pipeline de RLHF/DPO (no aplica a este tipo de modelo). La innovación técnica destacable es la deduplicación por hash de bytes para evitar fuga de datos entre particiones, junto con la evaluación mediante validación cruzada de 6 pliegues y out-of-fold agrupado.

## Capacidades

- Clasificación multi-etiqueta de seis hallazgos dentales sobre radiografías panorámicas (OPG) en una sola pasada.
- Detección simultánea de hallazgos no excluyentes (por ejemplo, caries e infección en la misma imagen).
- Generación de mapas de saliencia Grad-CAM para inspección visual de las regiones que activan cada etiqueta (según los tags del repositorio).
- Preprocesado integrado esperado: redimensionado a 288x576 y normalización ImageNet.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un clasificador de imagen puro.
- No tiene capacidades multilingües, de texto, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Triaje previo en investigación clínica: usar las seis probabilidades como señal de priorización para que un odontólogo revise primero las radiografías con mayor probabilidad de caries o infección, aprovechando que el modelo procesa una OPG completa en una única inferencia.
- Anotación asistida de datasets: preetiquetar radiografías panorámicas con las seis categorías para acelerar el etiquetado manual, con revisión humana obligatoria y descartando las predicciones de baja confianza.
- Docencia y formación: mostrar mapas Grad-CAM sobre radiografías para ilustrar qué regiones activan cada hallazgo en asignaturas de radiología dental, dado el carácter educativo declarado del modelo.
- Prueba de concepto de pipelines de visión médica: servir el modelo con TorchServe o FastAPI como ejemplo de extremo a extremo (preprocesado, inferencia, umbrales por clase) antes de invertir en un modelo con validación externa.
- Investigación sobre desbalanceo y clases raras: el dataset de 230 imágenes con hallazgos poco frecuentes sirve como banco de pruebas para técnicas de ponderación de clases y aumentación de datos.
- Comparación de arquitecturas CNN en dominios de pocos datos: la rama EfficientNetB3 puede enfrentarse a DenseNet121 y ConvNeXt-Tiny en experimentos controlados con el mismo protocolo de validación cruzada.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Evaluación | Macro AUC | mAP | Macro F1 |
|---|---|---|---|
| Test del pliegue 0 (n=37) | 0,695 | 0,599 | 0,508 |
| Out-of-fold agrupado de 6 pliegues (230 imágenes) | 0,661 | 0,544 | 0,503 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 10,79 M de parámetros (unos 43 MB de pesos) más activaciones; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo, que se ejecuta sin problema en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en cualquier modelo con soporte CUDA (GTX 1050 Ti en adelante) e incluso en CPU.
- Opciones de despliegue: PyTorch nativo, TorchServe, FastAPI + Uvicorn, ONNX Runtime tras exportación manual; no hay artefactos publicados para vLLM, llama.cpp, Ollama ni TGI (no aplican a una CNN).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DentalVision EfficientNetB3 (este) | 10,79 M | Clasificación multi-etiqueta de 6 hallazgos en OPG | Imagen 288x576 | Apache-2.0 | Hugging Face, 4 descargas |
| DenseNet121 (rama del mismo ensemble) | no disponible | Igual tarea | no disponible | no disponible | No publicada como checkpoint independiente |
| ConvNeXt-Tiny (rama del mismo ensemble) | no disponible | Igual tarea | no disponible | no disponible | No publicada como checkpoint independiente |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la información proporcionada.

## Limitaciones y advertencias

- Dataset muy pequeño: 230 radiografías únicas tras deduplicación, con hallazgos raros infrarrepresentados.
- Sin validación externa ni identificadores de paciente: riesgo de fuga entre particiones y de sobreajuste al centro de origen de las imágenes.
- Métricas modestas: macro AUC 0,661 y macro F1 0,503 en out-of-fold, insuficientes para uso clínico.
- El repositorio solo contiene la rama EfficientNetB3; el rendimiento del ensemble completo no es reproducible con este checkpoint.
- Riesgo de alucinación en el sentido de falsos positivos y negativos: el modelo puede asignar alta probabilidad a hallazgos ausentes o pasar por alto lesiones reales.
- No es una herramienta diagnóstica: la propia model card exige revisión por profesionales dentales cualificados.
- Sesgos conocidos: no documentados explícitamente; cabe esperar sesgo demográfico y de equipo radiográfico por la fuente única de datos.
- Licencia Apache-2.0 permite uso comercial del código y los pesos, pero no exime de responsabilidad regulatoria (producto sanitario) ni de las advertencias clínicas.
- El dataset de entrenamiento no se redistribuye; la reproducibilidad depende de la disponibilidad del dataset de Kaggle.
- Sin soporte documentado de cuantización ni exportación a formatos de inferencia optimizados.

## Enlaces

- Hugging Face: https://huggingface.co/Siya-34/dentalvision-efficientnetb3
- Dataset de entrenamiento (Kaggle, no redistribuido): https://www.kaggle.com/datasets/imtkaggleteam/dental-opg-xray-dataset
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
