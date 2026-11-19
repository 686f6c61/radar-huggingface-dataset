# phungthanhtu/rafdb-fer-adacm-4000

## Resumen

Ada-CM sobre RAF-DB con 4000 imagenes etiquetadas es un checkpoint de reconocimiento de expresiones faciales (FER) publicado por el usuario phungthanhtu en Hugging Face. Se trata del resultado del metodo Adaptive Confidence Margin (Ada-CM), una tecnica de aprendizaje semisupervisado, aplicado al conjunto de datos RAF-DB (Real-world Affective Faces Database) con un presupuesto reducido de etiquetas: solo 4000 imagenes anotadas frente a las 8271 no etiquetadas del split de entrenamiento. El modelo forma parte de una familia de checkpoints con distintos presupuestos de etiquetado (`100`, `400`, `2000`, `4000`) que respaldan las filas de un informe comparativo.

La arquitectura es una red convolucional clasica: un backbone ResNet-18 preentrenado en MS-Celeb-1M, con entrada de 224x224 pixeles y salida sobre siete clases de emocion. No es un modelo de lenguaje ni un transformer generativo, sino un clasificador de vision de proposito especifico. Su relevancia radica en demostrar que el aprendizaje semisupervisado permite alcanzar una precision de test del 83,08% con solo 4000 etiquetas, un resultado competitivo para el problema FER en RAF-DB.

El checkpoint se distribuye como pesos PyTorch (`model.pt`) junto con codigo standalone (`model.py`, `example.py`) que permite cargar y predecir sin depender del pipeline de entrenamiento. Esta orientado exclusivamente a investigacion sobre imagenes de rostro alineadas, con licencia restrictiva y sin soporte declarado para uso comercial ni produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN), preentrenado en MS-Celeb-1M, entrada 224x224 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch float) |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | other (RAF-DB restringido a investigacion no comercial) |
| Formato de pesos | `model.pt` (PyTorch), con config, nombres de clase y metricas embebidos |

## Arquitectura y entrenamiento

El modelo emplea un backbone ResNet-18 preentrenado en MS-Celeb-1M y ajustado para clasificacion de siete expresiones faciales (`Surprise`, `Fear`, `Disgust`, `Happiness`, `Sadness`, `Anger`, `Neutral`). La entrada es de 224x224 pixeles con normalizacion ImageNet (media `[0.485, 0.456, 0.406]`, desviacion `[0.229, 0.224, 0.225]`). Durante el entrenamiento se aplicaron random resized crops y RandAugment; en inferencia no se usa ninguna de las dos.

El entrenamiento sigue el metodo Ada-CM (Adaptive Confidence Margin), una estrategia semisupervisada que combina 4000 imagenes etiquetadas con 8271 imagenes no etiquetadas de RAF-DB. El checkpoint publicado corresponde a la semilla 5 y contiene los pesos finales con media exponencial (EMA). Las metricas reportadas por el autor son 83,08% de accuracy en test, 76,12% de macro-F1 y 0,116 de Expected Calibration Error (ECE) con 10 bins. No se detalla en la informacion disponible el numero de tokens, la composicion exacta del dataset mas alla de las cifras citadas, ni si hubo etapas de RLHF/DPO (no aplicables a este tipo de modelo).

## Capacidades

- Clasificacion de expresiones faciales en siete categorias discretas: sorpresa, miedo, asco, felicidad, tristeza, enfado y neutral.
- Inferencia sobre imagenes de rostro alineadas, del mismo tipo que las de RAF-DB.
- Carga autonoma mediante `model.load()`, que descarga pesos, reconstruye la red y la devuelve en modo evaluacion.
- Prediccion simplificada mediante `model.predict(net, "face.jpg")`.
- Ejecucion en CPU o GPU con PyTorch y torchvision, sin dependencias del pipeline de entrenamiento.
- No soporta tool calling, agentes, razonamiento multi-paso, vision general, audio ni generacion de texto: es un clasificador de vision de proposito unico.
- Capacidades multilingues no aplicables.

## Casos de uso

- Investigacion en aprendizaje semisupervisado: servir como checkpoint de referencia para reproducir o comparar el metodo Ada-CM con distintos presupuestos de etiquetado (100, 400, 2000, 4000 imagenes).
- Analisis de calibracion en FER: el ECE de 0,116 permite estudiar la fiabilidad de las probabilidades predichas y comparar con variantes del metodo.
- Evaluacion de tecnicas de aumento de datos: al haberse entrenado con RandAugment y random resized crops, es util para medir el impacto de estas tecnicas en regimen de pocas etiquetas.
- Benchmark academico en RAF-DB: comparar accuracy y macro-F1 frente a otros metodos semisupervisados publicados sobre el mismo split.
- Prototipado de pipelines de vision: integrar el clasificador en un script de inferencia por lotes sobre directorios de imagenes alineadas para generar etiquetas de emocion.
- Docencia y experimentacion: el codigo standalone (`model.py`, `example.py`) facilita demostraciones de clasificacion FER sin infraestructura compleja.
- Estudio de confusion entre clases: dado que el autor senala que el modelo es mas debil en miedo, tristeza y neutral, puede emplearse para analizar matrices de confusion en esas categorias.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Test accuracy | 83,08% |
| Macro-F1 | 76,12% |
| ECE (10 bins) | 0,116 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican; no hay tabla comparativa FER frente a alternativas).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; por el tamano del backbone (ResNet-18, ~11 M de parametros en su version estandar) la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente; A100, H100, RTX 4090, RTX 3090 o RTX 3060 no representan problema.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: PyTorch nativo con `torchvision`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador CNN).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Accuracy RAF-DB | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ada-CM RAF-DB 4000 (este) | ResNet-18 | no disponible | no aplica | 83,08% | other (investigacion) | Hugging Face |
| Ada-CM RAF-DB 2000 | ResNet-18 | no disponible | no aplica | no disponible | other | Hugging Face |
| Ada-CM RAF-DB 400 | ResNet-18 | no disponible | no aplica | no disponible | other | Hugging Face |
| Ada-CM RAF-DB 100 | ResNet-18 | no disponible | no aplica | no disponible | other | Hugging Face |

No se dispone de datos de rendimiento de los checkpoints alternativos de la misma familia ni de modelos externos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con solo 4000 imagenes etiquetadas: el propio autor indica que es mas debil en miedo, tristeza y neutral, las clases que mas se confunden.
- Requiere imagenes de rostro alineadas, del mismo tipo que RAF-DB; no esta pensado para rostros en escenas no controladas.
- Licencia `other` con restriccion explicita: RAF-DB esta licenciado solo para investigacion no comercial; el autor prohibe el uso del checkpoint sobre personas en produccion.
- Riesgo de sesgo: el dataset RAF-DB no representa necesariamente la diversidad demografica global; no hay informacion sobre sesgos por edad, genero o etnia.
- Riesgo de alucinacion no aplicable (clasificador), pero si de falsos positivos en clases minoritarias dada la confusion documentada.
- No soporta otros idiomas, modalidades ni tareas: es un clasificador cerrado de siete clases.
- Solo se publica la semilla 5; las demas semillas del estudio estan disponibles bajo peticion, lo que limita la reproducibilidad completa.
- Sin informacion sobre calibracion fuera de RAF-DB ni sobre robustez ante perturbaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-4000
- Checkpoints de la misma familia: https://huggingface.co/phungthanhtu/rafdb-fer-adacm-100, https://huggingface.co/phungthanhtu/rafdb-fer-adacm-400, https://huggingface.co/phungthanhtu/rafdb-fer-adacm-2000
- Perfil del autor: https://huggingface.co/phungthanhtu
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios o demos adicionales.
