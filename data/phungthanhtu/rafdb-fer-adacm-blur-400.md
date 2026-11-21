# phungthanhtu/rafdb-fer-adacm-blur-400

## Resumen

Ada-CM + blur sobre RAF-DB es un checkpoint de reconocimiento de expresiones faciales (FER) entrenado con un regimen semi-supervisado. Lo publica el usuario de Hugging Face `phungthanhtu` como parte de un estudio sobre el efecto del presupuesto de etiquetas en el aprendizaje semi-supervisado. El modelo combina un backbone ResNet-18 preentrenado en MS-Celeb-1M con la tecnica Ada-CM y una augmentation de desenfoque gaussiano aplicada a la vista fuerte de las imagenes no etiquetadas. Este repositorio concreto corresponde al presupuesto de 400 imagenes etiquetadas.

El problema que aborda es la escasez de anotaciones en FER: con solo 400 caras etiquetadas y 11.871 sin etiquetar del split de entrenamiento de RAF-DB, el modelo alcanza un 73,76% de accuracy en test y un macro-F1 de 64,65%. Es relevante para investigadores que quieran reproducir o comparar curvas de aprendizaje semi-supervisado en FER con un presupuesto de etiquetas muy bajo, y como referencia de calibracion (ECE de 0,188 en 10 bins), un valor alto que indica sobreconfianza.

La arquitectura es una CNN clasica (ResNet-18, entrada 224x224) con una cabeza de 7 clases. No es un modelo generativo ni un LLM: no tiene contexto, no soporta tool calling ni razonamiento multi-paso, y su unica tarea es clasificar una cara alineada en una de siete emociones basicas. El repositorio pesa 0.0 GB y solo distribuye pesos, codigo de red y un demo de linea de comandos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN), entrada 224x224, cabeza de 7 clases |
| Parametros totales | no disponible (ResNet-18 estandar, ~11,2 M en la variante torchvision; no confirmado por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no secuencial) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en `model.pt`, sin versiones GGUF/ONNX) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas estan en ingles) |
| Licencia | other (RAF-DB esta licenciado solo para investigacion no comercial; el checkpoint hereda esa restriccion) |
| Formato de pesos | `model.pt` (PyTorch, pesos + config + nombres de clase + metricas, sin clases pickled) |

## Arquitectura y entrenamiento

El backbone es un ResNet-18 preentrenado en MS-Celeb-1M y ajustado a 224x224 sobre RAF-DB. La cabeza produce 7 logits correspondientes a `Surprise`, `Fear`, `Disgust`, `Happiness`, `Sadness`, `Anger` y `Neutral`. El entrenamiento es semi-supervisado con el metodo Ada-CM: se generan dos vistas de cada imagen no etiquetada (debil y fuerte) y se aplica una augmentation adicional de desenfoque gaussiano con sigma entre 0,1 y 1,0 y probabilidad 0,5 sobre la vista fuerte. El conjunto de entrenamiento combina 400 imagenes etiquetadas con 11.871 no etiquetadas del split de entrenamiento de RAF-DB.

El checkpoint publicado son los pesos finales promediados con EMA (exponential moving average) de la semilla 5. Durante el entrenamiento se usaron random resized crops y RandAugment; en inferencia no se aplica ninguna de las dos, solo resize del lado corto a 224, `ToTensor` y normalizacion con `mean=[0.485, 0.456, 0.406]` y `std=[0.229, 0.224, 0.225]`. El autor publica los demas presupuestos como `phungthanhtu/rafdb-fer-adacm-blur-{100,400,2000,4000}` y ofrece las otras semillas bajo peticion. No se documentan en la model card el numero de tokens (no aplica), la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplica a una tarea de clasificacion).

## Capacidades

- Clasificacion de expresiones faciales en 7 clases discretas: sorpresa, miedo, asco, felicidad, tristeza, ira y neutro.
- Funciona sobre caras alineadas del mismo tipo que RAF-DB, con entrada RGB 224x224.
- Inferencia en modo eval con una funcion `predict()` incluida en `model.py`, que devuelve la clase predicha para una imagen.
- Carga autonoma: `model.load()` descarga los pesos desde Hugging Face, reconstruye la red y la devuelve en modo eval sin depender del pipeline de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision general (solo caras), audio ni modo thinking.
- Capacidad multilingue: no aplica; las etiquetas de salida estan en ingles.
- No expone probabilidades calibradas de forma fiable: el ECE de 0,188 indica sobreconfianza sistematica.

## Casos de uso

- Reproduccion de experimentos de aprendizaje semi-supervisado: sirve como punto de la curva de presupuesto de etiquetas (400 imagenes) para comparar con los checkpoints de 100, 2000 y 4000 del mismo autor bajo identica receta y semilla.
- Analisis de calibracion en clasificadores de bajo presupuesto: el ECE de 0,188 y el macro-F1 de 64,65% permiten estudiar tecnicas de calibracion post-hoc (temperature scaling, isotonic regression) en un regimen de datos escaso.
- Estudio de confusion entre clases dificiles: el autor documenta que el modelo es mas debil en miedo, tristeza y neutro, por lo que es util para analizar matrices de confusion en FER con pocas etiquetas.
- Baseline interno para investigacion en FER: al ser un ResNet-18 con receta reproducible y pesos publicos, sirve como referencia rapida frente a metodos mas pesados en entornos de laboratorio.
- Docencia y practicas de vision por computador: el demo `example.py` y la API `model.load`/`model.predict` permiten montar un ejercicio de inferencia en pocas lineas sobre una imagen de cara alineada.
- Evaluacion de robustez a augmentations: al haberse entrenado con desenfoque gaussiano en la vista fuerte, permite medir la sensibilidad del modelo a blur en inferencia y comparar con los checkpoints sin esa augmentation.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Test accuracy (RAF-DB) | 73,76% |
| Macro-F1 | 64,65% |
| ECE (10 bins) | 0,188 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni tablas frente a alternativas. Los unicos datos numericos son los tres anteriores, correspondientes al checkpoint de 400 etiquetas y semilla 5.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en torno a 0,5-1 GB en FP32 para un ResNet-18 a 224x224 con batch pequeno; no hay datos oficiales del autor.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090, A100 o H100 estan sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: PyTorch nativo mediante `model.load()` y `model.predict()`; no se distribuyen pesos en GGUF, ONNX ni TensorRT, por lo que llama.cpp, Ollama, vLLM y TGI no son aplicables directamente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rafdb-fer-adacm-blur-400 (este) | ResNet-18 | no disponible | no aplica | 73,76% acc, 64,65% macro-F1 en RAF-DB | other (uso no comercial por RAF-DB) | Hugging Face, pesos `model.pt` |
| rafdb-fer-adacm-blur-100 / 2000 / 4000 | ResNet-18 | no disponible | no aplica | no disponible en esta ficha | other | Hugging Face, mismo autor |
| Alternativas FER publicas (p. ej. modelos sobre FER2013 o AffectNet) | no disponible | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para una comparativa cuantitativa con modelos de terceros. La comparacion mas directa y verificable es con los otros presupuestos de etiquetas del mismo autor, que comparten backbone, receta y semilla.

## Limitaciones y advertencias

- Entrenado con solo 400 caras etiquetadas: el propio autor senala que es mas debil en miedo, tristeza y neutro, las clases que mas se confunden en su informe.
- Calibracion pobre: ECE de 0,188 en 10 bins implica que las probabilidades de salida no deben interpretarse como confianza fiable sin recalibracion.
- Dominio restringido: solo caras alineadas del estilo RAF-DB; no se ha validado en imagenes naturales, oclusiones, poses extremas ni dominios distintos.
- Licencia: RAF-DB esta licenciado solo para investigacion no comercial; el checkpoint hereda esa restriccion y el autor prohibe explicitamente su uso sobre personas en produccion.
- Riesgo de sesgo: no se documenta la demografia de RAF-DB ni se evalua el rendimiento por subgrupos, por lo que no se puede descartar sesgo por etnia, genero o edad.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el modelo siempre devuelve una de las 7 clases aunque la imagen no contenga una cara valida, sin mecanismo de rechazo.
- Limitaciones de idioma: no aplica; el modelo no procesa texto.
- Solo se publica la semilla 5; las demas semillas del estudio estan disponibles bajo peticion, lo que limita la reproducibilidad completa sin contactar al autor.
- El repositorio pesa 0.0 GB y no incluye versiones cuantizadas ni exportadas a otros formatos, lo que complica el despliegue fuera de PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-blur-400
- Checkpoint de 100 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-blur-100
- Checkpoint de 2000 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-blur-2000
- Checkpoint de 4000 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-blur-4000
- Perfil del autor: https://huggingface.co/phungthanhtu
- Dataset RAF-DB: no disponible en la informacion proporcionada
- Paper de Ada-CM: no disponible en la informacion proporcionada
- Repositorio de codigo adicional: no disponible en la informacion proporcionada
