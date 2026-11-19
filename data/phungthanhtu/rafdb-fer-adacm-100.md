# phungthanhtu/rafdb-fer-adacm-100

## Resumen

Ada-CM sobre RAF-DB con 100 imagenes etiquetadas es un checkpoint de investigacion para reconocimiento de expresiones faciales (FER) entrenado en el dataset RAF-DB bajo un regimen de aprendizaje semisupervisado. Lo desarrolla el usuario de Hugging Face `phungthanhtu` y corresponde a la fila de presupuesto "100" de un estudio comparativo sobre margenes de confianza adaptativos (Ada-CM). El modelo parte de un backbone ResNet-18 preentrenado en MS-Celeb-1M y opera sobre recortes de cara alineados de 224x224 pixeles.

El interes tecnico reside en que demuestra hasta donde llega un clasificador de siete emociones cuando solo dispone de 100 imagenes etiquetadas y 12.171 sin etiquetar. Alcanza un 61,73% de accuracy en test y un macro-F1 del 51,04%, con una calibracion pobre (ECE de 0,303 en 10 bins), lo que lo convierte en una referencia util para estudiar el efecto del presupuesto de etiquetas en FER semisupervisado, no en un modelo listo para produccion.

No es un modelo de lenguaje: no genera texto ni soporta tool calling, agentes o capacidades multilingues. Es un clasificador de vision de 7 clases, con licencia `other` y restricciones explicitas de uso no comercial derivadas de la licencia de RAF-DB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN ResNet-18 (backbone preentrenado en MS-Celeb-1M), entrada 224x224 |
| Parametros totales | no disponible (ResNet-18 estandar, ~11,2 M en la variante ImageNet; el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `model.pt` en precision de entrenamiento) |
| Idiomas soportados | no disponible (no procesa texto; etiquetas de clase en ingles) |
| Licencia | other (restricciones derivadas de RAF-DB: uso no comercial, investigacion) |
| Formato de pesos | `model.pt` (PyTorch, pesos + config + nombres de clase + metricas, sin clases pickled) |

## Arquitectura y entrenamiento

El modelo es una ResNet-18 convolucional clasica con cabeza de 7 salidas, inicializada con pesos preentrenados en MS-Celeb-1M (reconocimiento facial) y afinada sobre RAF-DB a 224x224. La innovacion no esta en la arquitectura sino en el procedimiento de entrenamiento: Ada-CM (adaptive confidence margin), una tecnica semisupervisada que asigna pseudoetiquetas a las imagenes no etiquetadas modulando el umbral de confianza de forma adaptativa, en lugar de usar un umbral fijo. El checkpoint publicado corresponde a los pesos finales con media exponencial (EMA) del modelo de estudiante.

El conjunto de entrenamiento combina 100 imagenes etiquetadas con 12.171 imagenes no etiquetadas de RAF-DB. La semilla utilizada es la 5; el autor indica que las demas semillas del estudio estan disponibles bajo peticion. El preprocesado de entrenamiento incluye random resized crops y RandAugment; en inferencia se redimensiona el lado corto a 224, se aplica `ToTensor` y se normaliza con media `[0.485, 0.456, 0.406]` y desviacion `[0.229, 0.224, 0.225]`. El repositorio incluye `model.py` con funciones `load()` y `predict()`, y un script `example.py` de demostracion por linea de comandos.

## Capacidades

- Clasificacion de expresiones faciales en 7 clases: `Surprise`, `Fear`, `Disgust`, `Happiness`, `Sadness`, `Anger`, `Neutral`.
- Inferencia sobre imagenes de cara alineadas, del mismo tipo que RAF-DB, con entrada fija de 224x224.
- Carga autonoma del checkpoint mediante `model.load()`, que descarga pesos, reconstruye la red y la devuelve en modo `eval`.
- Prediccion de una sola imagen mediante `model.predict(net, "face.jpg")`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje natural).
- No dispone de modo thinking, vision general, audio ni otras modalidades.

## Casos de uso

- Estudio del efecto del presupuesto de etiquetas en FER semisupervisado: el checkpoint sirve como punto de referencia de la curva de rendimiento frente a los presupuestos 400, 2000 y 4000 publicados por el mismo autor, permitiendo reproducir la tabla del informe.
- Reproducibilidad de experimentos Ada-CM: al fijar la semilla 5 y publicar los pesos finales EMA, permite verificar los resultados reportados (61,73% accuracy, 51,04% macro-F1) sin reentrenar.
- Analisis de calibracion de modelos: con un ECE de 0,303 en 10 bins, es un caso de estudio util para investigar tecnicas de calibracion (temperature scaling, focal loss) en clasificadores con pocas etiquetas.
- Docencia en aprendizaje semisupervisado: el repositorio incluye `model.py` y `example.py` autocontenidos, lo que facilita montar practicas sobre pseudoetiquetado y margenes de confianza.
- Evaluacion comparativa de backbones: al estar basado en ResNet-18 preentrenado en MS-Celeb-1M, permite aislar el efecto del metodo semisupervisado frente a otros backbones en el mismo protocolo.
- Prototipado de demos de FER en entornos de investigacion: con `python example.py face.jpg` se obtiene una prediccion rapida sobre imagenes alineadas, adecuada para validaciones cualitativas internas.
- Analisis de errores por clase: el autor senala que el modelo es mas debil en `Fear`, `Sadness` y `Neutral`, por lo que resulta apropiado para estudiar confusiones entre clases minoritarias.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Test accuracy (RAF-DB) | 61,73% |
| Macro-F1 | 51,04% |
| ECE (10 bins) | 0,303 |
| Semilla | 5 |
| Imagenes etiquetadas | 100 |
| Imagenes no etiquetadas | 12.171 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) porque no aplican a este tipo de modelo, ni tablas de comparacion con presupuestos superiores del mismo estudio.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de 1-2 GB para un ResNet-18 a 224x224 en FP32 con batch pequeno; no declarada por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo moderna e incluso en CPU para inferencia puntual.
- Opciones de despliegue: el repositorio solo ofrece carga via `huggingface_hub` y PyTorch (`model.load`, `model.predict`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de vision de este tipo).
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rafdb-fer-adacm-100 (este) | ResNet-18, no declarado | no aplica | 61,73% acc, 51,04% macro-F1, ECE 0,303 | other (no comercial) | Hugging Face |
| rafdb-fer-adacm-400 | no disponible | no aplica | no disponible en la informacion | other | Hugging Face |
| rafdb-fer-adacm-2000 | no disponible | no aplica | no disponible en la informacion | other | Hugging Face |
| rafdb-fer-adacm-4000 | no disponible | no disponible | no disponible en la informacion | other | Hugging Face |

Los tres modelos alternativos pertenecen al mismo estudio y mismo autor, con presupuestos de etiquetas crecientes; no se dispone de sus metricas en la informacion proporcionada. No se conocen en la informacion disponible otros modelos comparables de terceros.

## Limitaciones y advertencias

- Entrenado con solo 100 imagenes etiquetadas: el rendimiento es bajo en terminos absolutos y especialmente debil en `Fear`, `Sadness` y `Neutral`, las clases mas confundidas segun el autor.
- Calibracion deficiente: ECE de 0,303 en 10 bins implica que las probabilidades de salida no son fiables como estimacion de confianza.
- Requiere imagenes de cara alineadas del mismo tipo que RAF-DB; no se garantiza su funcionamiento con caras sin alinear, oclusiones o dominios distintos.
- Sesgos conocidos: no documentados por el autor; RAF-DB tiene una distribucion demografica concreta que puede no representar a otras poblaciones.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de predicciones erroneas con alta confianza por la mala calibracion.
- Restricciones de licencia: licencia `other`; RAF-DB esta licenciado solo para investigacion no comercial, y el autor prohibe explicitamente usar el checkpoint sobre personas en produccion.
- Solo se publica la semilla 5; las demas semillas del estudio estan disponibles bajo peticion, lo que limita la reproducibilidad completa sin contactar al autor.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni capacidades multilingues, por lo que no debe evaluarse con los criterios habituales de LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-100
- Checkpoint con 400 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-400
- Checkpoint con 2000 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-2000
- Checkpoint con 4000 etiquetas: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-4000
- Dataset RAF-DB: no disponible en la informacion proporcionada
- Paper de Ada-CM: no disponible en la informacion proporcionada
- Repositorio de codigo adicional: no disponible (el repositorio incluye `model.py` y `example.py`)
