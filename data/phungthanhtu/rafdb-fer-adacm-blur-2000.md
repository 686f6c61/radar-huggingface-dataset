# phungthanhtu/rafdb-fer-adacm-blur-2000

## Resumen

`phungthanhtu/rafdb-fer-adacm-blur-2000` es un checkpoint de clasificacion de expresiones faciales (FER) entrenado con el metodo Ada-CM en modo semi-supervisado sobre el conjunto RAF-DB. Lo publica el usuario de Hugging Face `phungthanhtu` como parte de un estudio de ablacion sobre el presupuesto de etiquetas: el mismo procedimiento se repite con 100, 400, 2000 y 4000 imagenes etiquetadas, y este repositorio contiene la variante de 2000 etiquetas con un aumento de desenfoque gaussiano aplicado a la vista fuerte de las imagenes no etiquetadas. El modelo usa un backbone ResNet-18 preentrenado en MS-Celeb-1M a 224x224 y clasifica siete emociones basicas.

No es un modelo de lenguaje ni un modelo generativo: es un clasificador de vision por computador de proposito especifico, con 11,7 millones de parametros en el backbone, pensado exclusivamente para investigacion sobre reconocimiento de emociones en caras alineadas. Su relevancia actual es metodologica: documenta como el aprendizaje semi-supervisado con consistencia (Ada-CM) y aumentos de datos agresivos permite acercarse al rendimiento supervisado con una fraccion minima de etiquetas.

El checkpoint alcanza un 80,35% de exactitud y un macro-F1 de 72,37% en el conjunto de test de RAF-DB, con un error de calibracion esperado (ECE) de 0,138. La licencia es "other" y el autor restringe explicitamente el uso a investigacion, prohibiendo su aplicacion sobre personas en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ResNet-18 (backbone), clasificador de 7 clases |
| Parametros totales | no disponible (ResNet-18 estandar: ~11,7 M en el backbone) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224x224) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | other (restriccion a uso de investigacion segun la model card) |
| Formato de pesos | PyTorch (`model.pt`), con codigo standalone en `model.py` |

## Arquitectura y entrenamiento

El modelo es una red convolucional ResNet-18 inicializada con pesos preentrenados en MS-Celeb-1M (reconocimiento facial) y adaptada a clasificacion de expresiones en 7 clases. La entrada es de 224x224 píxeles con normalizacion ImageNet estandar. El entrenamiento sigue el esquema Ada-CM (aprendizaje semi-supervisado con consistencia entre vistas debil y fuerte) sobre 2000 imagenes etiquetadas mas 10.271 imagenes no etiquetadas del split de entrenamiento de RAF-DB, con semilla 5.

La innovacion concreta de este checkpoint es el aumento aplicado a la vista fuerte de las imagenes no etiquetadas: un desenfoque gaussiano con sigma en el rango 0,1-1,0 y probabilidad 0,5, sumado a los aumentos habituales (random resized crops y RandAugment durante el entrenamiento). Se publican los pesos finales con media exponencial (EMA) de los parametros. El repositorio incluye `model.py` con funciones `load()` y `predict()` que reconstruyen la red sin depender del pipeline de entrenamiento, y `example.py` como demo de linea de comandos.

## Capacidades

- Clasificacion de imagenes de cara en 7 emociones: `Surprise`, `Fear`, `Disgust`, `Happiness`, `Sadness`, `Anger`, `Neutral`.
- Inferencia sobre caras alineadas del mismo tipo que RAF-DB, con preprocesado fijo (redimensionar lado corto a 224, `ToTensor`, normalizacion ImageNet).
- Carga autonoma: `model.load()` descarga pesos, reconstruye la red y la devuelve en modo eval.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No es multilingue ni procesa audio o video de forma nativa (solo fotogramas individuales).
- No dispone de modo "thinking" ni salidas estructuradas mas alla de la etiqueta de clase y, presumiblemente, las probabilidades por clase.

## Casos de uso

- Investigacion en aprendizaje semi-supervisado: sirve como punto de comparacion reproducible (semilla 5, 2000 etiquetas) frente a las variantes de 100, 400 y 4000 etiquetas del mismo autor para medir la curva etiqueta-rendimiento.
- Estudio de calibracion de modelos FER: el ECE de 0,138 documentado permite analizar tecnicas de calibracion post-hoc (temperature scaling, isotonic regression) sobre un clasificador de 7 clases.
- Analisis de confusion entre clases dificiles: el autor indica que el modelo falla mas en `Fear`, `Sadness` y `Neutral`, lo que lo hace util para estudiar tecnicas de reequilibrado o perdidas focalizadas en esas categorias.
- Prototipado de pipelines de vision: con `model.py` y `example.py` se puede integrar en un script de inferencia por lotes sobre un directorio de caras alineadas para generar etiquetas preliminares y revisarlas manualmente.
- Docencia y practicas de vision por computador: ejemplo completo y ligero (ResNet-18) de clasificacion de imagenes con pesos descargables y codigo de carga autocontenido.
- Evaluacion de aumentos de datos: al incorporar desenfoque gaussiano en la vista fuerte, permite comparar contra el checkpoint sin blur (`rafdb-fer-adacm-2000`) para aislar el efecto del aumento.
- Generacion de datos sinteticos de anotacion: usar sus predicciones como pseudoetiquetas en un conjunto no anotado de caras alineadas, siempre dentro de un entorno de investigacion y con validacion humana.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exactitud en test (RAF-DB) | 80,35% |
| Macro-F1 | 72,37% |
| ECE (10 bins) | 0,138 |
| Etiquetas usadas | 2000 |
| Imagenes no etiquetadas | 10.271 |
| Semilla | 5 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican; no hay tabla cruzada con alternativas FER).

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 para ResNet-18 a 224x224 con batch pequeno; en FP16 aproximadamente la mitad.
- GPU recomendadas: cualquier GPU consumer moderna sirve (RTX 3060, RTX 4060, RTX 4090); tambien CPU es viable para inferencia por imagenes individuales.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM; tambien en CPU y en dispositivos embebidos tipo Jetson.
- Opciones de despliegue: PyTorch nativo (via `model.py`), exportacion a TorchScript u ONNX no documentada pero factible; no hay variantes GGUF, llama.cpp, Ollama, vLLM ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del backbone se espera del orden de milisegundos por imagen en GPU y decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Backbone | Etiquetas | Exactitud RAF-DB | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rafdb-fer-adacm-blur-2000 (este) | ResNet-18 | 2000 | 80,35% | other (investigacion) | Hugging Face |
| rafdb-fer-adacm-blur-100 | ResNet-18 | 100 | no disponible en esta ficha | other | Hugging Face |
| rafdb-fer-adacm-blur-400 | ResNet-18 | 400 | no disponible en esta ficha | other | Hugging Face |
| rafdb-fer-adacm-blur-4000 | ResNet-18 | 4000 | no disponible en esta ficha | other | Hugging Face |

Las variantes del mismo autor comparten arquitectura y pipeline, por lo que la comparacion relevante es el presupuesto de etiquetas. No se dispone de datos de benchmarks de terceros (por ejemplo, modelos FER basados en ViT o en arquitecturas mas grandes) en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 2000 imagenes etiquetadas: el propio autor senala debilidad en `Fear`, `Sadness` y `Neutral`, las clases mas confundidas.
- Sesgos demograficos no documentados: RAF-DB no es representativo de todas las poblaciones; no hay analisis de equidad por genero, edad o etnia en la model card.
- Riesgo de alucinacion en el sentido de predicciones erroneas con alta confianza: ECE de 0,138 indica calibracion imperfecta, por lo que las probabilidades no deben interpretarse como certezas.
- Restriccion de licencia: RAF-DB esta licenciado solo para investigacion no comercial y el autor prohibe explicitamente el uso del checkpoint sobre personas en produccion.
- Requiere caras alineadas del mismo tipo que RAF-DB; el preprocesado de inferencia es fijo (sin random crops ni RandAugment) y no se documenta robustez ante oclusiones, poses extremas o iluminacion adversa.
- Formato de pesos unico (`model.pt`) sin version cuantizada ni exportada a ONNX/TorchScript, lo que limita el despliegue en entornos sin PyTorch.
- Solo se publica la semilla 5; las demas semillas del estudio estan "disponibles bajo peticion", lo que dificulta la reproducibilidad completa.
- No es un modelo generativo ni conversacional: no admite prompts de texto, tool calling ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-blur-2000
- Variante con 100 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-blur-100
- Variante con 400 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-blur-400
- Variante con 4000 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-blur-4000
- Dataset RAF-DB (referencia del autor, sin enlace directo en la model card): no disponible
- Paper de Ada-CM: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible (solo `model.py` y `example.py` dentro del repo de Hugging Face)
