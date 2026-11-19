# phungthanhtu/rafdb-fer-supervised-2000

## Resumen

`rafdb-fer-supervised-2000` es un checkpoint de reconocimiento de expresiones faciales (FER) publicado por el usuario de Hugging Face `phungthanhtu`. Se trata del control supervisado puro de un estudio sobre aprendizaje semisupervisado: un backbone ResNet-18 preentrenado en MS-Celeb-1M y ajustado mediante entropía cruzada sobre 2000 imágenes etiquetadas del conjunto RAF-DB, sin utilizar datos sin etiquetar durante el entrenamiento. El modelo forma parte de una familia de checkpoints con distintos presupuestos de etiquetas (`{100,400,2000,4000}`) y sirve como línea base para medir la ganancia de los métodos semisupervisados.

El modelo resuelve una tarea de clasificación de 7 clases discretas (Surprise, Fear, Disgust, Happiness, Sadness, Anger, Neutral) sobre rostros alineados a 224x224 píxeles. Su relevancia es metodológica más que de producto: permite reproducir la fila de 2000 etiquetas del informe asociado y comparar el efecto de añadir datos no etiquetados. Reporta una precisión de test del 79,73 %, un macro-F1 de 72,64 % y un ECE (10 bins) de 0,169.

No es un modelo generativo ni un LLM: no procesa texto, no soporta tool calling y no tiene ventana de contexto en el sentido habitual. Es un clasificador de visión de tamaño reducido (ResNet-18) pensado exclusivamente para investigación sobre RAF-DB, con licencia restringida a uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN, preentrenado en MS-Celeb-1M), entrada 224x224 |
| Parametros totales | no disponible (ResNet-18 estándar, ~11,7 M típicamente; el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `model.pt` en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje; clases en inglés) |
| Licencia | other (restricción de uso: RAF-DB es solo para investigación no comercial; el autor prohíbe uso en producción sobre personas) |
| Formato de pesos | `model.pt` (PyTorch, con pesos + config + nombres de clase + métricas, sin clases serializadas con pickle) |

## Arquitectura y entrenamiento

La red es un ResNet-18 estándar con entrada RGB de 224x224, inicializado con pesos preentrenados en MS-Celeb-1M (reconocimiento facial) y ajustado con pérdida de entropía cruzada sobre 2000 imágenes etiquetadas de RAF-DB. La cabecera de clasificación se reduce a 7 salidas correspondientes a las emociones básicas del dataset. El entrenamiento usa aumentación con recortes aleatorios redimensionados y RandAugment; en inferencia no se aplica ninguna de las dos.

El pipeline de preprocesamiento en inferencia es: redimensionar el lado corto a 224, `ToTensor` y normalización con `mean=[0.485, 0.456, 0.406]` y `std=[0.229, 0.224, 0.225]`. El checkpoint publicado corresponde a la semilla 5; las demás semillas del estudio se ofrecen bajo petición. No se documenta número de épocas, tamaño de batch, optimizador ni tasa de aprendizaje en la información disponible.

## Capacidades

- Clasificación de expresiones faciales en 7 clases: Surprise, Fear, Disgust, Happiness, Sadness, Anger, Neutral.
- Inferencia sobre rostros alineados, del mismo tipo que las imágenes de RAF-DB.
- Carga autocontenida mediante `model.load()`: descarga pesos, reconstruye la red y la devuelve en modo `eval`, sin necesidad del pipeline de entrenamiento.
- Función `predict()` lista para usar sobre una ruta de imagen.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni generación.

## Casos de uso

- Línea base en investigación semisupervisada: usar este checkpoint como control supervisado para cuantificar la mejora de métodos como AdaCM sobre el mismo backbone y presupuesto de 2000 etiquetas.
- Reproducción de resultados: replicar la fila de 2000 etiquetas del informe con la semilla 5 y comparar precisión, macro-F1 y ECE.
- Estudio de calibración: el ECE de 0,169 permite analizar el desajuste entre confianza y acierto en clasificadores FER pequeños y servir de referencia frente a variantes semisupervisadas.
- Análisis de errores por clase: dado que el autor señala que el modelo es más débil en fear, sadness y neutral, sirve para estudiar matrices de confusión y confusiones sistemáticas en FER con pocos datos.
- Evaluación de aumentación: al usar RandAugment y recortes aleatorios en entrenamiento, permite comparar el efecto de distintas políticas de aumentación sobre el mismo presupuesto de etiquetas.
- Docencia y prototipado de visión: ejemplo mínimo y autocontenido (un `model.py` con `load()` y `predict()`) para demostrar un pipeline completo de clasificación de imágenes en PyTorch.
- Ablación de preentrenamiento: al estar inicializado en MS-Celeb-1M, permite medir cuánto aporta el preentrenamiento facial frente a inicialización desde ImageNet u otros dominios.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Test accuracy (RAF-DB, 2000 etiquetas, seed 5) | 79,73 % |
| Macro-F1 | 72,64 % |
| ECE (10 bins) | 0,169 |

No se han publicado en la información disponible resultados comparativos con otros modelos ni desglose por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un ResNet-18 a 224x224 en fp32 ocupa del orden de decenas de MB de pesos y unos pocos cientos de MB con activaciones y batch pequeño (estimación, no declarada por el autor).
- GPU recomendadas: cualquier GPU con al menos ~2 GB de VRAM; funciona sobradamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo y también en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch nativo mediante `model.py`; exportación a TorchScript u ONNX no documentada pero viable por ser una CNN estándar. No se proporcionan artefactos para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Backbone | Etiquetas | Test accuracy | Macro-F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `rafdb-fer-supervised-2000` (este) | ResNet-18 | 2000 | 79,73 % | 72,64 % | other (solo investigación) | Hugging Face |
| `rafdb-fer-supervised-100` | ResNet-18 | 100 | no disponible | no disponible | other | Hugging Face |
| `rafdb-fer-supervised-400` | ResNet-18 | 400 | no disponible | no disponible | other | Hugging Face |
| `rafdb-fer-supervised-4000` | ResNet-18 | 4000 | no disponible | no disponible | other | Hugging Face |
| `rafdb-fer-adacm-2000` | ResNet-18 | 2000 + no etiquetados | no disponible | no disponible | other | Hugging Face |

Las métricas de las variantes con otros presupuestos y del método AdaCM no se recogen en la información proporcionada; solo se confirma su existencia como repositorios publicados por el mismo autor.

## Limitaciones y advertencias

- Entrenado con solo 2000 imágenes etiquetadas: menor robustez y mayor varianza que modelos entrenados con el conjunto completo de RAF-DB.
- Rendimiento más débil en fear, sadness y neutral, las clases que el autor identifica como más confundidas.
- Calibración imperfecta: ECE de 0,169 indica que las probabilidades de salida no deben interpretarse como confianza fiable sin recalibración.
- Entrenado y evaluado en RAF-DB: no hay evidencia de generalización a otras poblaciones, iluminaciones, poses o dominios.
- Requiere rostros alineados y el preprocesamiento exacto documentado; desviarse de él degrada el rendimiento de forma no cuantificada.
- Licencia `other` con restricción explícita: RAF-DB es solo para investigación no comercial y el autor prohíbe el uso del checkpoint sobre personas en producción.
- Riesgo de sesgo demográfico no evaluado: no se documenta composición del dataset ni análisis de equidad por género, edad o etnia.
- No apto para decisiones automatizadas sobre personas (afecto, contratación, vigilancia) por motivos éticos, legales y de licencia.
- Solo se publica la semilla 5; la reproducibilidad completa del estudio requiere solicitar las demás semillas al autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phungthanhtu/rafdb-fer-supervised-2000
- Variante con 100 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-supervised-100
- Variante con 400 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-supervised-400
- Variante con 4000 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-supervised-4000
- Variante AdaCM con 2000 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-2000
- Perfil del autor: https://huggingface.co/phungthanhtu
- Dataset RAF-DB (referencia del autor, sin enlace directo en la model card): no disponible
