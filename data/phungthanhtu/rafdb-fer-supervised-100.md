# phungthanhtu/rafdb-fer-supervised-100

## Resumen

El modelo `phungthanhtu/rafdb-fer-supervised-100` es un checkpoint de clasificación de expresiones faciales (FER, *facial expression recognition*) desarrollado por el usuario phungthanhtu y publicado en Hugging Face. Se trata de la variante "supervisada pura" de un estudio más amplio sobre aprendizaje semisupervisado: un backbone ResNet-18 preentrenado en MS-Celeb-1M y ajustado mediante entropía cruzada sobre únicamente 100 imágenes etiquetadas del conjunto RAF-DB, sin usar datos sin etiquetar. Su función es servir como línea base de control frente a las variantes semisupervisadas del mismo autor (`adacm-100`, `supervised-400`, `supervised-2000`, `supervised-4000`).

El modelo resuelve una tarea de clasificación de 7 clases (Sorpresa, Miedo, Asco, Felicidad, Tristeza, Enfado, Neutral) sobre imágenes de rostros alineados de 224x224 píxeles. Con solo 100 ejemplos etiquetados, su rendimiento es deliberadamente bajo (48,17 % de accuracy en test y 43,48 % de macro-F1), lo que lo convierte en una referencia metodológica para medir cuánto aporta el aprendizaje semisupervisado en regímenes de pocas etiquetas.

Es relevante ahora porque documenta de forma reproducible el coste de entrenar con muy pocas etiquetas en una tarea sensible como el reconocimiento de emociones, y porque publica métricas de calibración (ECE de 0,458), un aspecto poco habitual en checkpoints de investigación de este tamaño. No es un modelo de lenguaje ni un modelo multimodal general: es un clasificador de visión de propósito muy específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN), entrada 224x224, preentrenada en MS-Celeb-1M |
| Parametros totales | no disponible (ResNet-18 estándar, ~11,7 M típicamente, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (clasificador de imágenes; etiquetas en inglés) |
| Licencia | other (restricciones no detalladas; RAF-DB es solo para investigación no comercial) |
| Formato de pesos | PyTorch (`model.pt` con pesos, config, nombres de clase y métricas) |

## Arquitectura y entrenamiento

El modelo es una ResNet-18 convolucional estándar con entrada de 224x224, inicializada con pesos preentrenados en MS-Celeb-1M (un dataset de identidades faciales) y ajustada mediante entropía cruzada sobre 100 imágenes etiquetadas de RAF-DB. La model card indica que se usaron 12.171 imágenes sin etiquetar del conjunto de entrenamiento de RAF-DB, pero en esta variante "supervisada pura" no se explotan: solo se listan como parte de la partición del estudio. La semilla empleada es la 5.

El preprocesado de entrenamiento incluye *random resized crops* y RandAugment; en inferencia se redimensiona el lado corto a 224, se aplica `ToTensor` y se normaliza con media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]`. No se documentan detalles sobre número de épocas, optimizador, tasa de aprendizaje ni composición exacta del dataset más allá de RAF-DB. El checkpoint incluye pesos, configuración, nombres de clase y métricas en un único `model.pt` sin clases serializadas (pickle-free), lo que facilita su carga segura.

## Capacidades

- Clasificación de expresiones faciales en 7 clases: Surprise, Fear, Disgust, Happiness, Sadness, Anger, Neutral.
- Inferencia sobre imágenes de rostros alineados similares a RAF-DB (224x224, normalización ImageNet).
- Carga autónoma mediante `model.load()` y predicción con `model.predict()`, sin necesidad del pipeline de entrenamiento.
- Métricas de calibración publicadas (ECE de 10 bins = 0,458), útil para análisis de incertidumbre.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni vídeo.
- No es multilingüe ni procesa lenguaje natural; las etiquetas de salida están en inglés.

## Casos de uso

- Línea base de investigación en FER con pocas etiquetas: sirve para cuantificar la mejora de métodos semisupervisados (AdaCM u otros) frente al entrenamiento puramente supervisado con 100 imágenes, usando la misma partición y semilla.
- Reproducción de experimentos académicos: el checkpoint y el script `example.py` permiten replicar la fila "100" del informe del autor sin reentrenar.
- Estudio de calibración de modelos: el ECE publicado permite analizar cómo se degrada la confianza en regímenes de datos escasos y comparar con técnicas de calibración post-hoc.
- Docencia y demostraciones de visión por computador: ejemplo mínimo de carga de un modelo PyTorch desde Hugging Face con un único comando y salida de clase predicha.
- Evaluación de robustez ante clases confundibles: útil para estudiar los errores sistemáticos en Fear, Sadness y Neutral, las clases que la model card señala como más problemáticas.
- Pruebas de integración en pipelines de investigación: validar el flujo de descarga, carga y predicción antes de sustituir el checkpoint por una variante con más datos o semisupervisada.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Test accuracy | 48,17 % |
| Macro-F1 | 43,48 % |
| ECE (10 bins) | 0,458 |
| Imagenes etiquetadas de entrenamiento | 100 |
| Imagenes sin etiquetar disponibles (no usadas) | 12.171 |
| Semilla | 5 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Las demás variantes del estudio (`supervised-400`, `supervised-2000`, `supervised-4000`, `adacm-100`) están publicadas como repositorios separados, pero sus métricas no se incluyen en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 para una ResNet-18 a 224x224 con batch pequeño; en la práctica cabe en cualquier GPU consumer.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU moderna e incluso en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch nativo (script `model.py` y `example.py`), exportación manual a TorchScript u ONNX no documentada; no hay artefactos para vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de visión).
- Latencia y throughput estimados: no disponibles en la información proporcionada; para una ResNet-18 a 224x224 se espera del orden de milisegundos por imagen en GPU, pero no se confirma en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Accuracy RAF-DB (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `phungthanhtu/rafdb-fer-supervised-100` | no disponible (ResNet-18) | 224x224 | 48,17 % | other | Hugging Face |
| `phungthanhtu/rafdb-fer-supervised-400` | no disponible (ResNet-18) | 224x224 | no disponible | other | Hugging Face |
| `phungthanhtu/rafdb-fer-supervised-2000` | no disponible (ResNet-18) | 224x224 | no disponible | other | Hugging Face |
| `phungthanhtu/rafdb-fer-supervised-4000` | no disponible (ResNet-18) | 224x224 | no disponible | other | Hugging Face |

Las variantes del mismo autor comparten backbone y esquema de entrenamiento, diferenciándose solo en el presupuesto de etiquetas. No se dispone de datos de benchmarks de terceros (por ejemplo, otros clasificadores FER sobre RAF-DB) en la información proporcionada, por lo que la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- Entrenado con solo 100 imágenes etiquetadas: rendimiento bajo y sesgo fuerte hacia clases mayoritarias; la model card reconoce debilidad en Fear, Sadness y Neutral.
- Riesgo alto de sobreajuste y de calibración deficiente (ECE de 0,458 indica confianza mal calibrada).
- Sesgos demográficos y culturales heredados de RAF-DB y de MS-Celeb-1M; no se documenta análisis de equidad por género, edad o etnia.
- Restricciones de licencia: RAF-DB está licenciado solo para investigación no comercial; la model card prohíbe explícitamente su uso sobre personas en producción.
- Uso previsto limitado a investigación sobre rostros alineados del mismo tipo que RAF-DB; no generaliza a otras condiciones de captura sin validación.
- No apto para sistemas de vigilancia, análisis de emociones en tiempo real ni decisiones automatizadas sobre personas.
- No se documentan limitaciones de idioma porque el modelo no procesa texto; las etiquetas de salida están solo en inglés.
- Ausencia de variantes cuantizadas o exportadas a formatos de despliegue estándar (ONNX, TorchScript, GGUF).

## Enlaces

- Hugging Face: https://huggingface.co/phungthanhtu/rafdb-fer-supervised-100
- Variante con 400 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-supervised-400
- Variante con 2000 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-supervised-2000
- Variante con 4000 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-supervised-4000
- Variante semisupervisada AdaCM con 100 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-100
- Dataset RAF-DB (referencia): http://www.whdeng.cn/RAF/model1.html
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
