# saeidseyfi/khattat-hybrid-ocr

## Resumen

khattat-hybrid-ocr es un pipeline de reconocimiento optico de caracteres (OCR) para texto manuscrito en persa, arabe e ingles, publicado por el usuario saeidseyfi en HuggingFace. No es un modelo neuronal entrenado desde cero ni un checkpoint con pesos propios: es una orquestacion de componentes libres y offline (OpenCV, EasyOCR, Tesseract 5, pix2tex y clasificacion de contornos con OpenCV) que combina varios motores de OCR mediante un ensemble de confianzas. Esta disenado especificamente para el dataset khattat, tambien del mismo autor, que contiene lineas manuscritas, formulas matematicas, formas dibujadas a mano y sus pies de figura.

Su relevancia practica esta en que cubre un hueco poco atendido: el OCR manuscrito en alfabetos arabe y persa con soporte adicional de formulas LaTeX y dibujos, sin necesidad de entrenamiento, sin GPUs y sin APIs de pago. El autor reporta mejoras sustanciales frente a una linea base CRNN propia en todos los conjuntos de prueba del dataset khattat, con CER agrupado de 0,320 en persa, 0,316 en arabe y 0,169 en ingles.

El repositorio de HuggingFace ocupa 0,0 GB, no tiene descargas ni likes, y se limita a referenciar el codigo en GitHub, los artefactos de demostracion y la documentacion de arquitectura. La licencia declarada es CC-BY-4.0 y los idiomas soportados son fa, ar y en.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline hibrido de componentes: preprocesado con OpenCV, deteccion CRAFT + reconocimiento CRNN de EasyOCR, LSTM de Tesseract 5, ViT a LaTeX de pix2tex y clasificador de contornos con OpenCV |
| Parametros totales | No aplica: no publica pesos propios; agrega modelos preentrenados de terceros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (procesamiento imagen a imagen, no generativo con ventana de contexto) |
| Tipos de cuantizacion | No disponible; el pipeline usa los formatos nativos de cada componente (tessdata_best, checkpoints de EasyOCR y pix2tex) |
| Idiomas soportados | Persa (fa), arabe (ar) e ingles (en); el OCR de formulas y de pies de figura usa la rama en ingles |
| Licencia | CC-BY-4.0 |
| Formato de pesos | No disponible; el repositorio (0,0 GB) solo contiene demo y documentacion, sin pesos publicados |

## Arquitectura y entrenamiento

El sistema es una cascada de siete etapas encadenadas. Primero, OpenCV realiza el preprocesado (reescalado, binarizacion de Otsu o adaptativa, correccion de inclinacion y operaciones morfologicas). Despues, EasyOCR con los idiomas fa, ar y en ejecuta deteccion CRAFT y reconocimiento CRNN. En paralelo, Tesseract 5 con los modelos tessdata_best fas, ara y eng (LSTM) produce transcripciones con confianzas por palabra. La cuarta etapa es un ensemble por confianza que combina deteccion de escritura, seleccion ponderada de candidatos y normalizacion linguistica.

Para el contenido no textual, el pipeline incorpora pix2tex (LaTeX-OCR), que usa un ViT para generar LaTeX y una puntuacion de candidatos basada en tokens matematicos, y un clasificador de contornos de OpenCV que distingue diez clases de formas dibujadas a mano. La ultima etapa, "caption OCR", localiza el primer grupo de tinta bajo la forma detectada y lo pasa por la rama inglesa de OCR. No hay entrenamiento propio ni ajuste fino: el autor indica explicitamente que el pipeline se construyo a partir de componentes gratuitos y offline, sin APIs de pago.

## Capacidades

- Reconocimiento de lineas manuscritas en persa, arabe e ingles a partir de imagenes.
- Preprocesado robusto de escaneos y fotografias: reescalado, binarizacion, correccion de inclinacion y morfologia.
- Ensemble multi-motor con deteccion de script, seleccion ponderada de candidatos y normalizacion por idioma.
- Conversion de formulas matematicas manuscritas a LaTeX mediante pix2tex con puntuacion de candidatos por tokens.
- Clasificacion de formas dibujadas a mano en diez clases mediante contornos de OpenCV.
- OCR del pie de figura asociado a una forma (primer grupo de tinta debajo del contorno, rama inglesa).
- Extraccion de confianzas por palabra a partir de los modelos LSTM de Tesseract, utiles para umbralizar y enrutar revision humana.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Digitalizacion de fondos manuscritos en persa y arabe: el pipeline procesa lineas escaneadas de archivos y bibliotecas con CER agrupado de 0,320 y 0,316 respectivamente, y su etapa de preprocesado tolera escaneos torcidos o con ruido.
- Conversion de apuntes de matematicas a LaTeX: la rama pix2tex obtiene un CER medio de 0,307 en el conjunto de 29 formulas del dataset khattat, frente al fallo casi total (CER cercano a 1,0) de la linea base CRNN, lo que permite generar ecuaciones editables desde cuadernos manuscritos.
- Extraccion conjunta de diagramas y sus leyendas: la clasificacion de formas alcanza un 80 por ciento de exactitud en 15 muestras y el OCR de pies de figura un CER medio de 0,381, lo que sirve para reconstruir figuras de examenes o ejercicios con su descripcion.
- Enriquecimiento y anotacion del dataset khattat: el pipeline puede generar transcripciones preliminares y compararlas con la linea base CRNN para priorizar que muestras necesitan anotacion manual.
- Despliegue offline en entornos sin conectividad: al no depender de APIs de pago, encaja en administraciones publicas, hospitales o entornos air-gapped donde solo se permite software local.
- Triaje con revision humana: las confianzas por palabra de Tesseract permiten fijar umbrales y enviar a revision solo las lineas con baja certeza, reduciendo el coste de validacion en proyectos de digitalizacion masiva.
- Investigacion en OCR de escritura arabe y persa: sirve como linea base reproducible y sin entrenamiento para comparar nuevas aproximaciones sobre el dataset khattat.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en CPU sobre los conjuntos de prueba del dataset khattat. El autor los compara con una linea base CRNN propia ("Old CRNN").

| Rama | Metrica | Hibrido | CRNN antiguo |
|---|---|---|---|
| Lineas fa (20 muestras) | CER agrupado | 0,320 | 0,681 |
| Lineas ar (40 muestras) | CER agrupado | 0,316 | 0,656 |
| Lineas en (30 muestras) | CER agrupado | 0,169 | 0,410 |
| Formulas (29 muestras) | CER medio | 0,307 | ~1,0 (fuera de vocabulario) |
| Formas (15 muestras) | Exactitud | 80 % | 0,13 |
| Pies de figura (12 muestras) | CER medio | 0,381 | 1,0 |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con motores OCR de terceros.

## Requisitos de hardware

- Los resultados publicados se obtuvieron en CPU, sin GPU.
- VRAM estimada para inferencia: no disponible. La rama de EasyOCR y la de pix2tex funcionan sobre PyTorch y pueden acelerarse con CUDA si esta disponible; Tesseract 5 es CPU.
- GPU recomendadas: no disponible en la informacion proporcionada. No se documenta ninguna configuracion de GPU probada.
- Cabe en GPU de consumo: no hay datos publicados, aunque el diseno (componentes ligeros, sin modelo de lenguaje) sugiere que no requiere GPU de centro de datos.
- Opciones de despliegue: instalacion local de OpenCV, EasyOCR, Tesseract 5 con tessdata_best (fas, ara, eng) y pix2tex. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. El unico dato temporal es la duracion del video de demostracion (83 segundos), que no equivale a una medida de latencia por pagina.

## Comparativa con modelos similares

La model card solo compara el pipeline con la linea base CRNN del propio autor. La siguiente tabla resume la comparacion cualitativa con alternativas de la misma categoria; las celdas sin datos verificables se marcan como no disponibles.

| Alternativa | Tipo | Idiomas | Requiere entrenamiento | Licencia | CER en khattat |
|---|---|---|---|---|---|
| khattat-hybrid-ocr | Pipeline hibrido multi-motor + pix2tex + contornos | fa, ar, en mas formulas y formas | No | CC-BY-4.0 | 0,169-0,320 en lineas; 0,307 en formulas (publicado) |
| EasyOCR en solitario | Deteccion CRAFT + reconocimiento CRNN | mas de 80 idiomas, incluye fa y ar | No | No disponible en la informacion proporcionada | No disponible |
| Tesseract 5 en solitario | Reconocimiento LSTM | multiples, incluye fas y ara | No | No disponible en la informacion proporcionada | No disponible |
| CRNN propio (linea base del autor) | Red convolucional recurrente entrenada | fa, ar, en | Si | No disponible | 0,656-0,681 en lineas; ~1,0 en formulas |

El pipeline integra EasyOCR y Tesseract como componentes internos, por lo que su aportacion diferencial es el ensemble por confianza y las ramas de formulas, formas y pies de figura.

## Limitaciones y advertencias

- Tasa de error alta en terminos absolutos: CER de 0,169 en ingles, 0,316 en arabe y 0,320 en persa; no es adecuado para transcripcion sin revision en contextos que exijan precision alta.
- Los conjuntos de evaluacion son muy pequenos (20, 40, 30, 29, 15 y 12 muestras), por lo que las metricas tienen alta varianza y no permiten extrapolar a corpus grandes.
- El OCR de formulas (CER 0,307) y de pies de figura (CER 0,381) es el eslabon mas debil; pix2tex puede generar LaTeX sintacticamente valido pero incorrecto, lo que exige verificacion.
- La clasificacion de formas cubre solo diez clases y alcanza un 80 por ciento de exactitud en 15 muestras; no se detallan las clases ni la matriz de confusion.
- Dependencia de terceros: cualquier cambio en EasyOCR, Tesseract, tessdata_best o pix2tex puede alterar los resultados; ademas, cada componente mantiene su propia licencia, que hay que respetar por separado.
- No se publican pesos propios ni un paquete instalable: el repositorio de HuggingFace ocupa 0,0 GB y solo enlaza codigo, demo y documentacion, de modo que la reproducibilidad depende del repositorio de GitHub.
- Idiomas limitados a fa, ar y en; no hay soporte documentado para otras lenguas ni para escritura mixta con alfabetos latinos y arabes en la misma linea mas alla del ensemble por deteccion de script.
- Ausencia de historial de uso: cero descargas y cero likes, sin metricas de produccion ni informes de terceros.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero no se ofrece garantia ni soporte.
- Riesgo de sesgo hacia el estilo de escritura del dataset khattat (el video de demostracion usa las fuentes Shabnam, Amiri y DejaVu), sin evidencia de generalizacion a otras manos, resoluciones o calidades de escaneo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saeidseyfi/khattat-hybrid-ocr
- Dataset khattat: https://huggingface.co/datasets/saeidseyfi/khattat
- Codigo del pipeline: https://github.com/ramazanzadehnazaninzahra-del/handwritten-ocr-dataset-pipeline
- Demostracion en video: demo/khattat_hybrid_demo.mp4 (83 segundos) dentro del repositorio del modelo
- Predicciones y metricas por muestra: demo/hybrid_results.json
- Documentacion de arquitectura y uso: docs/HYBRID_OCR.md
- Fuentes adicionales: la busqueda web no devolvio resultados relevantes; unicamente aparecieron paginas comerciales sin relacion con el modelo.
