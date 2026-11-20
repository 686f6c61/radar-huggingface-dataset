# LuisPaim/oed-resnet18

## Resumen

El modelo `LuisPaim/oed-resnet18` es una red neuronal convolucional ResNet-18 preentrenada en ImageNet y ajustada finamente para clasificar imagenes de histologia H&E de tejido de lengua de raton en cuatro grados de displasia epitelial oral (OED): sano, leve, moderado y grave. Lo desarrolla Luis Felipe Garcia de Souza Paim, de la Faculdade de Computacao de la Universidade Federal de Uberlandia (UFU), bajo la supervision del profesor Marcelo Zanchetta do Nascimento, en el marco de un estudio sobre compresion de CNN mediante descomposicion Tucker-2 y Tensor-Train (galardonado con el Best Research Award en WTDCC 2026).

El modelo resuelve una tarea de clasificacion de imagenes medicas de cuatro clases sobre el dataset OralEpitheliumDB, compuesto por 456 regiones de interes de 224 pixeles procedentes de tejido de raton, con 114 imagenes por clase. Con 11,18 millones de parametros y un coste de 3,63 GFLOPs por imagen, sirve como linea base sin comprimir frente a las variantes comprimidas del estudio. Es relevante ahora porque permite reproducir los resultados de compresion de forma sencilla: la arquitectura comprimida se reconstruye a partir de las formas de los tensores almacenados, sin necesidad de `tensorly` ni del codigo original de descomposicion.

Se trata de un modelo de investigacion y educacion, no de un dispositivo medico, entrenado exclusivamente con tejido de raton y no validado con biopsias humanas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (torchvision, pesos ImageNet, cabeza de 4 clases) |
| Parametros totales | 11.188.164 (11,18 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, entrada 224 x 224 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; clasificacion de imagenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint fold 1 y ensemble de 5 folds) |
| Coste computacional | 3,63 GFLOPs por imagen de 224 x 224 |
| Pipeline | image-classification |
| Libreria | PyTorch |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18 estandar de torchvision, inicializada con pesos preentrenados de ImageNet (`ResNet18_Weights.DEFAULT`) y con una nueva cabeza de clasificacion de cuatro clases. El entrenamiento usa AdamW con learning rate 1e-3 y weight decay 1e-5, batch size 32, 50 epocas y scheduler CosineAnnealingLR, con semilla 123. El pipeline de aumento de datos consiste en Resize(256), RandomCrop(224), flips horizontal y vertical, RandomRotation(40) y ColorJitter(0.1).

La seleccion de checkpoint se realiza sobre el fold de validacion mediante una puntuacion compuesta clinica S = QWK - tasa de peligro - tasa de subestimacion, donde "peligro" es un error de dos o mas grados y "subestimacion" es predecir un grado inferior al real. Los datos proceden de OralEpitheliumDB: 456 regiones de interes de tejido de lengua de raton, 114 por clase, con una particion hold-out estratificada del 20 % (92 imagenes, 23 por clase) y 5-fold cross-validation sobre el 80 % restante. El entrenamiento se ejecuto en una GPU NVIDIA RTX 3050 Laptop de 6 GB. No se reporta RLHF, DPO ni tecnicas de decodificacion especulativa, al no tratarse de un modelo generativo.

## Capacidades

- Clasificacion de imagenes de histologia H&E en cuatro grados de displasia epitelial oral: sano, leve, moderado y grave.
- Salida de probabilidades softmax por clase mediante la funcion `oed.predict`.
- Modo ensemble: promedio de las salidas softmax de los cinco checkpoints de cross-validation (`ensemble/fold1..5.safetensors`).
- Carga autosuficiente: el modelo comprimido se reconstruye a partir de las formas de tensor almacenadas, sin dependencias de `tensorly`.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, vision generativa, audio ni modo thinking.

## Casos de uso

- Linea base para investigacion en compresion de CNN: permite comparar el rendimiento del ResNet-18 sin comprimir con las variantes Tucker-2 y Tensor-Train del mismo estudio, usando el mismo checkpoint de partida (fold 1, semilla 123).
- Reproduccion de experimentos academicos: el checkpoint fold 1 es el punto de partida exacto de los modelos comprimidos, lo que facilita replicar los resultados publicados sin reentrenar.
- Evaluacion de ensembles en clasificacion medica: el promedio de los cinco folds permite estudiar el efecto de la agregacion de modelos sobre AUC, F1 y QWK en un conjunto de test de 92 imagenes.
- Docencia en vision por computador aplicada a medicina: el repositorio incluye `oed_models.py` con definicion, carga y preprocesado, lo que simplifica su uso en practicas y talleres.
- Prototipado de pipelines de clasificacion histologica: sirve como referencia funcional para disenar preprocesado (resize, crop, flips) y metricas clinicas (QWK, tasa de peligro, tasa de subestimacion).
- Estudio de metricas clinicas compuestas: permite analizar como la seleccion de checkpoint por QWK menos tasas de error penaliza los errores graves en la clasificacion de grados.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test hold-out (n = 92):

| Modelo | AUC (macro, OvR) | F1 (macro) | QWK | Accuracy | Tasa de peligro |
|---|---|---|---|---|---|
| Fold 1 (`model.safetensors`) | 0,9586 | 0,7956 | 0,8591 | 0,7935 | 0,043 |
| Ensemble de 5 folds | 0,9789 | 0,8771 | 0,9153 | 0,8804 | 0,033 |

Matriz de confusion del ensemble (filas = real, columnas = predicho; sano, leve, moderado, grave): `[[23, 0, 0, 0], [1, 16, 4, 2], [0, 2, 20, 1], [0, 1, 0, 22]]`.

Las metricas fueron recalculadas en CPU a partir de los ficheros publicados y coinciden con el registro de entrenamiento original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 11,18 M parametros y 3,63 GFLOPs por imagen, el modelo es muy ligero y probablemente quepa en GPUs de consumo con poca memoria, aunque no se aporta una cifra exacta.
- GPU recomendadas: no disponible; el entrenamiento se realizo en una NVIDIA RTX 3050 Laptop de 6 GB.
- GPU de consumo: compatible en principio con cualquier GPU consumer por el reducido tamano del modelo, si bien no se especifica VRAM minima.
- Opciones de despliegue: PyTorch con `safetensors` y `huggingface_hub`; el autor no menciona vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imagenes).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | AUC (macro) | Accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `LuisPaim/oed-resnet18` (este) | 11,18 M | 224 x 224 px | 0,9586 (fold 1); 0,9789 (ensemble) | 0,7935; 0,8804 | Apache 2.0 | Hugging Face |
| `LuisPaim/oed-resnet18-tucker2` | no disponible | 224 x 224 px | no disponible | no disponible | no disponible | Hugging Face |
| `LuisPaim/oed-resnet18-tensortrain` | no disponible | 224 x 224 px | no disponible | no disponible | no disponible | Hugging Face |

Las variantes comprimidas Tucker-2 y Tensor-Train forman parte del mismo estudio y comparten checkpoint de partida, pero sus metricas no se detallan en la informacion proporcionada. No se han identificado otros clasificadores publicos de OED comparables en la informacion disponible.

## Limitaciones y advertencias

- Solo para investigacion y educacion: no es un dispositivo medico ni esta validado para diagnostico.
- Entrenado con tejido de lengua de raton; no se ha probado con biopsias humanas, otros protocolos de tincion ni otros escaneres.
- Conjunto de test pequeno (92 imagenes): los intervalos de confianza son amplios y diferencias de centesimas en AUC quedan dentro del ruido.
- Punto de partida unico (una semilla, fold 1): los resultados de compresion describen un checkpoint, no una media sobre semillas.
- Riesgo de sesgo derivado de la composicion del dataset (114 imagenes por clase, procedencia unica) y de las condiciones de captura.
- Riesgo de alucinacion no aplica en sentido generativo, pero existe riesgo de clasificacion erronea, especialmente en la frontera entre leve y moderado (segun la matriz de confusion del ensemble).
- Licencia Apache 2.0 permite uso comercial del codigo y pesos, pero la limitacion de uso medico prevalece para cualquier aplicacion clinica.
- Las imagenes del dataset no se redistribuyen en el repositorio; deben obtenerse de la fuente original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LuisPaim/oed-resnet18
- Variante Tucker-2: https://huggingface.co/LuisPaim/oed-resnet18-tucker2
- Variante Tensor-Train: https://huggingface.co/LuisPaim/oed-resnet18-tensortrain
- Demo: https://huggingface.co/spaces/LuisPaim/oed-compression-demo
- Dataset OralEpitheliumDB (DOI): https://doi.org/10.1007/s10278-024-01041-w
