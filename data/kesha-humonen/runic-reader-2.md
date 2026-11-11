# kesha-humonen/runic-reader-2

## Resumen

Runic Reader 2 es un conjunto de adaptadores LoRA, código y datos publicado por kesha-humonen junto al artículo *From Photograph to Translation: An End-to-End Pipeline for Runic Inscriptions with Open Vision-Language Models* (IEEE Access, en revisión). No es un modelo autónomo, sino un paquete de adaptadores PEFT que se montan sobre el modelo base multimodal Qwen/Qwen3.5-4B (revisión `851bf6e`) para construir una cadena completa de epigrafía rúnica: localización de la inscripción en una fotografía, lectura a una transliteración en estilo Rundata y traducción al inglés o al sueco.

El repositorio contiene tres adaptadores LoRA: `ocr4b_crop` (reconocedor entrenado con recortes de fotografías reales e imágenes sintéticas procedurales), `mt4b` (traductor entrenado sobre el corpus paralelo) y `mt4b_noise` (traductor entrenado con ruido de caracteres similar al que produce el reconocedor). Además se publican los splits del corpus (12.496 pares transliteración–traducción y 4.949 imágenes reales), las predicciones de test y todo el código de construcción del corpus, generación de imágenes sintéticas, entrenamiento, inferencia y evaluación.

Su relevancia es doble. Por un lado, demuestra que un VLM abierto de 4B de parámetros, con adaptadores LoRA de bajo coste, puede abordar una tarea de patrimonio cultural tradicionalmente reservada a especialistas. Por otro, publica el pipeline completo de forma reproducible, con particiones disjuntas por inscripción y con licencias explícitas para cada fuente de datos (ODbL/DbCL para Rundata, CC BY-SA 4.0 para RuneS-DB y material propio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un transformer multimodal (Qwen3.5-4B); no se especifica la arquitectura interna del modelo base |
| Parametros totales | No disponible para los adaptadores; el modelo base es de 4B (según su identificador) |
| Parametros activos | No disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Entrada: inscripciones rúnicas (transliteración en estilo Rundata). Salida: inglés y sueco. No se declara una lista formal de idiomas |
| Licencia | Adaptadores, código y predicciones: CC BY-SA 4.0; filas Rundata: ODbL 1.0 / DbCL 1.0; filas RuneS: CC BY-SA 4.0; modelo base: su propia licencia |
| Formato de pesos | Safetensors (adaptadores PEFT/LoRA); repo de 0,5 GB |

## Arquitectura y entrenamiento

El sistema se compone de tres etapas encadenadas sobre Qwen/Qwen3.5-4B. Primero, el modelo base localiza la inscripción en la fotografía y devuelve una caja con coordenadas normalizadas de 0 a 1000. Después, el adaptador `ocr4b_crop` lee el recorte y produce una transliteración en estilo Rundata. Finalmente, `mt4b` (o `mt4b_noise`, entrenado con ruido de caracteres que imita los errores del reconocedor) traduce la transliteración al inglés o al sueco. Los adaptadores son LoRA, por lo que solo se entrenan matrices de bajo rango sobre el modelo base congelado, lo que explica el tamaño reducido del repositorio (0,5 GB) frente a los pesos completos del VLM.

Los datos de entrenamiento combinan recortes de fotografías reales con imágenes sintéticas generadas proceduralmente para el reconocedor, y un corpus paralelo de 12.496 pares transliteración–traducción para el traductor. Las particiones están construidas de forma disjunta por inscripción: todos los pares e imágenes de un mismo clúster de inscripción caen en el mismo split (train 10.640, validación 592, test 1.264), y la evaluación del artículo usa únicamente pares de validación y test no vinculados a ningún par de entrenamiento. La decodificación es greedy, con 320 tokens nuevos para reconocimiento y 200 para traducción, y se aplica un truncado por repetición sobre la salida del reconocedor (`code/loopcut.py`). No se detalla en la información disponible si hubo RLHF, DPO u otras fases de alineación.

## Capacidades

- Reconocimiento óptico de inscripciones rúnicas sobre recortes de fotografías reales e imágenes sintéticas.
- Localización de la inscripción en la imagen completa mediante cajas en coordenadas 0–1000.
- Transliteración en formato estilo Rundata, con normalización documentada en `code/`.
- Traducción de transliteraciones rúnicas al inglés y al sueco.
- Traducción robusta a errores de reconocimiento mediante el adaptador `mt4b_noise`.
- Procesamiento multimodal de imagen y texto a través del modelo base Qwen3.5-4B.
- Pipeline extremo a extremo fotografías → localización → lectura → traducción, reproducible con los scripts publicados.
- Evaluación reproducible con predicciones de test publicadas para reconocedores, traductores, pipeline completo y una línea base de recuperación.

## Casos de uso

- Digitalización de catálogos epigráficos: procesar lotes de fotografías de piedras rúnicas para obtener transliteraciones normalizadas y traducciones preliminares que luego revisa un filólogo, reduciendo el trabajo manual de transcripción.
- Catalogación de patrimonio en museos y archivos: aplicar el pipeline a fondos fotográficos ya digitalizados para generar metadatos de búsqueda en inglés o sueco a partir de inscripciones que hoy solo existen como imagen.
- Investigación en epigrafía asistida por ordenador: usar los splits publicados y las predicciones de test como referencia para comparar nuevos reconocedores o traductores bajo particiones disjuntas por inscripción.
- Herramientas de divulgación en yacimientos y exposiciones: traducir automáticamente inscripciones a inglés o sueco para cartelería o aplicaciones móviles, con revisión humana previa a publicación.
- Análisis de robustez de pipelines OCR + traducción: entrenar y evaluar variantes con `mt4b_noise` para medir cuánto degrada el ruido de reconocimiento la calidad de la traducción final.
- Reproducción y extensión académica: reentrenar los adaptadores con los comandos exactos de `code/jobs/` y sustituir el modelo base o los datos para estudiar el efecto en las métricas del artículo.
- Filtrado y priorización de corpus: ejecutar el localizador sobre grandes colecciones de imágenes para identificar qué fotografías contienen inscripciones legibles antes de un análisis más costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo *From Photograph to Translation: An End-to-End Pipeline for Runic Inscriptions with Open Vision-Language Models* (IEEE Access, en revisión) y a las predicciones de test en `preds/`, pero no incluye cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al montar sobre un VLM de 4B, el requisito vendrá determinado por el modelo base y la precisión de carga elegida, no por los adaptadores LoRA, que ocupan una fracción mínima.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada en la documentación; depende del modelo base Qwen3.5-4B y de su cuantización, dato no disponible.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` (`AutoModelForImageTextToText`, `AutoProcessor`) y `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (epigrafía rúnica con VLM abiertos) ni datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar Qwen/Qwen3.5-4B en la revisión exacta `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`; otras revisiones pueden romper la compatibilidad de los adaptadores.
- El alcance es estrecho: inscripciones rúnicas y salida en inglés o sueco; no se declara soporte general multilingüe.
- Riesgo de alucinación en la traducción: al ser un modelo generativo, puede producir lecturas o traducciones plausibles pero incorrectas, especialmente con imágenes degradadas; el adaptador `mt4b_noise` mitiga pero no elimina este riesgo.
- Restricciones de licencia: las filas de Rundata están bajo ODbL 1.0 / DbCL 1.0 y las de RuneS bajo CC BY-SA 4.0; los adaptadores y el código bajo CC BY-SA 4.0. El uso comercial debe respetar la licencia del modelo base, que es independiente y no se detalla aquí.
- Los textos y fotografías de Gamla runor (christerhamp.se) están protegidos por copyright y no se redistribuyen; solo se publican identificadores, enlaces y hashes SHA-1. Reconstruir ese subconjunto requiere ejecutar `gamla_runor/fetch_gamla_runor.py` y asumir las condiciones de la fuente.
- Las particiones son disjuntas por inscripción, de modo que los resultados de test no deben compararse directamente con evaluaciones que mezclan inscripciones entre train y test.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso independiente ni validación externa del pipeline.
- No se documentan sesgos conocidos, comportamiento fuera de dominio ni límites de longitud de contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kesha-humonen/runic-reader-2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Scandinavian Runic-text Database (Samnordisk runtextdatabas, Uppsala University): http://www.nordiska.uu.se/forskn/samnord.htm
- RuneS-DB (Göttingen Academy of Sciences and Humanities): https://www.runesdb.de/
- Gamla runor (Christer Hamp): https://christerhamp.se
- Artículo asociado: *From Photograph to Translation: An End-to-End Pipeline for Runic Inscriptions with Open Vision-Language Models*, IEEE Access (en revisión); sin enlace disponible en la información proporcionada.
