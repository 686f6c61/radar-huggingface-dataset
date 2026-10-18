# eymen160/caught-in-4k

## Resumen

Caught in 4K es un sistema de visión por computador empaquetado como repositorio de HuggingFace (`eymen160/caught-in-4k`) que detecta el momento en el que una persona deposita un objeto en un contenedor, identifica qué objeto es, en qué boca del contenedor ha entrado y si la acción cumple la normativa local de reciclaje. El autor es el equipo del hackathon Caught in 4K y la instantánea publicada corresponde al commit `9fa5da7`, de octubre de 2026. El repositorio ocupa 0,7 GB e incluye pesos, modelo de navegador, reglas, particiones de evaluación etiquetadas y cachés de percepción.

No se trata de un modelo entrenado de cero ni de un *checkpoint* ajustado: es un pipeline que encadena redes de terceros (YOLO11n-pose para personas y brazos, FastSAM-s para regiones de objeto, CLIP ViT-B/32 para clasificación zero-shot, y opcionalmente YOLO11n y YOLOv8s-World v2 como trackers) junto con lógica propia de seguimiento y decisión, un cabezal CLIP con 21 categorías de objeto/peligro y un fichero de reglas para el catálogo de Cambridge (Massachusetts) de 2022.

Su relevancia está en el enfoque: clasificación abierta sin reentrenamiento, ejecución parcial en el navegador (encoder de imagen `Xenova/clip-vit-base-patch32`), redacción facial antes de que ningún recorte salga del dispositivo y una evaluación honesta que separa dev y test, con una brecha explícita de generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de vision por computador: YOLO11n-pose (keypoints de persona/brazos) + FastSAM-s (segmentacion de regiones de objeto) + CLIP ViT-B/32 (clasificacion zero-shot) + logica propia de seguimiento y decision; trackers opcionales YOLO11n y YOLOv8s-World v2; YuNet (worker) y BlazeFace short-range (navegador) para redaccion facial |
| Parametros totales | no disponible (el autor no declara recuento de parametros; son redes ligeras de deteccion/segmentacion y CLIP ViT-B/32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la ventana temporal la fija el tracker sobre fotogramas de video) |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos originales en `.pt` y exportaciones `.onnx` / `.tflite`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (prompts y catalogo en ingles; el catalogo de reglas es de Cambridge, MA 2022) |
| Licencia | AGPL-3.0 (el repo redistribuye pesos de Ultralytics); componentes: CLIP ViT-B/32 MIT, YuNet MIT, BlazeFace Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch/Ultralytics), `.onnx` (YOLO11n-pose, YuNet), `.tflite` (BlazeFace), `.json` (`guide.json`, reglas), `.npz` / `.npy` (caches de percepcion) |
| Tarea (pipeline) | object-detection / object-tracking / pose-estimation / zero-shot classification |
| Libreria declarada | ultralytics |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 256 / 1 |
| Fecha de publicacion | 2026-10-18 (commit de referencia `9fa5da7`) |
| Idiomas de la ficha | no aplica |

## Arquitectura y entrenamiento

El sistema es un ensemble en cascada. YOLO11n-pose estima los keypoints de la persona para determinar quién lleva algo y dónde está la mano; FastSAM-s propone regiones candidatas de objeto cerca de la mano; CLIP ViT-B/32 compara cada región con las embeddings de texto precalculadas de 21 categorías de objeto y peligro. Sobre esa percepción se aplica lógica propia (`worker/recyclone_worker/items.py`): solo cuentan los objetos que una persona transporta, una caída se declara cuando un objeto queda en reposo dentro de la boca de un contenedor, y un "veto" cancela la detección si el objeto vuelve a una mano cerca del punto donde desapareció. Las constantes ajustables están al principio de ese fichero. Las reglas de qué va en cada contenedor viven en `rules/cambridge-ma-2022.bins.json`, con el texto fuente en el `.md` asociado.

No se ha ajustado ningún *checkpoint* en este repositorio: todo el aprendizaje proviene de los modelos originales de terceros. Lo propio es el `web/guide.json` (embeddings de texto CLIP para las 21 categorías, con prompts, categorías padre y reglas de contenedores), generado por `apps/web/scripts/build_guide_model.py` y no editable a mano, más el tracker con puerta de brazo y la capa de decisión. La evaluación se apoya en cachés de percepción (`*.npz` con keypoints de persona, cajas candidatas y embeddings de imagen CLIP; `*_motion.npy`), de modo que las particiones se puntúan en segundos sin volver a procesar el vídeo; si se cambia la percepción hay que reconstruirlas con los vídeos originales y `scripts/item_tracker.py`.

## Capacidades

- Deteccion de personas y seguimiento de brazos y manos mediante keypoints (YOLO11n-pose).
- Segmentacion de regiones de objeto candidatas cerca de la mano (FastSAM-s).
- Clasificacion zero-shot de objetos y residuos peligrosos en 21 categorias mediante CLIP, ampliable editando el catalogo y regenerando `guide.json`.
- Identificacion de la boca del contenedor en la que entra el objeto y validacion contra reglas locales.
- Deteccion de eventos de deposito con marca temporal (tolerancia de +-0,5 s en la evaluacion).
- Supresion de falsos positivos: veto si el objeto vuelve a la mano, exigencia de reposo dentro de la boca del contenedor y puerta por persona portadora.
- Redaccion facial antes de que el recorte salga del dispositivo (YuNet en el worker, BlazeFace en el navegador).
- Ejecucion en navegador con encoder CLIP de imagen via `Xenova/clip-vit-base-patch32` (transformers.js) y modelo de decision precalculado en JSON.
- Nombrado opcional de objetos con un VLM externo (`--namer deepseek` o Claude en la ruta de demo).
- Trackers alternativos conmutables (`--tracker yolo`, `--tracker world`) y fallback a un tracker de movimiento previo cuando no hay persona visible.
- No soporta tool calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Auditoria de cumplimiento de reciclaje en edificios e instalaciones: una camara fija sobre el conjunto de contenedores permite registrar cuantas deposiciones se hacen, en que boca y cuantas violan la normativa local, usando el catalogo de reglas como referencia.
- Contenedores de calle tipo BigBelly: la particion `dev-street` esta rodada precisamente con una ranura y tolva de ese estilo, por lo que el pipeline esta pensado para escenas urbanas con aperturas estrechas.
- Demostracion en navegador sin servidor: al llevarse la inferencia de imagen y la decision al cliente, se puede desplegar una demo educativa o un panel de retroalimentacion sin enviar video a un backend, lo que simplifica el cumplimiento de privacidad.
- Etiquetado y validacion de normativas municipales: sustituyendo `rules/cambridge-ma-2022.bins.json` por el catalogo de otra ciudad se reutiliza toda la capa de percepcion y decision sin reentrenar nada.
- Alertas sobre residuos peligrosos: las 21 categorias incluyen clases de peligro, de modo que el sistema puede marcar el deposito de un item peligroso en un contenedor inadecuado.
- Investigacion reproducible: las particiones dev/test con verdad de campo por clip (fotograma de caida, contenedor, items aceptados, regla y cajas de contenedor por keyframes) y las caches `.npz` permiten evaluar cambios en la capa de decision en segundos con `scripts/eval_splits.py`.
- Analisis offline de video publico: los clips de YouTube se referencian por URL y la evaluacion se puede repetir descargandolos, util para estudios de comportamiento en reciclaje.
- Sistemas de incentivos o educacion ambiental: el resultado "contenedor correcto / incorrecto" se puede emitir como retroalimentacion inmediata al usuario junto al contenedor.

## Benchmarks y rendimiento

Resultados publicados por el autor en `eval/RESULTS-9fa5da7.txt` (modelo final):

| Split | Clips | Deposiciones encontradas | Dentro de +-0,5 s | Falsos depositos | Objeto nombrado correctamente |
|---|---|---|---|---|---|
| dev - calle (ranura estilo BigBelly + tolva) | 3 | 4/4 | 4 | 0 | 2/4 |
| dev - telefono movil, contenedores interiores | 5 | 5/5 | 4 | 0 | 4/5 |
| dev - YouTube | 2 | 1/1 | 1 | 0 | 0/1 |
| **dev total** | 10 | **10/10** | 9 | **0** | 6/10 |
| test - YouTube | 3 | 1/3 | 1 | 0 | no disponible |
| test - material nuevo 17 oct | 3 | 0/2 | 0 | 0 | no disponible |
| **test total** | 6 | **1/5** | 1 | **0** | no disponible |

El nombrado con CLIP alcanzo 6/10 en dev; con el nombrador basado en VLM (`--namer deepseek` o Claude en la ruta de demo) subio a 9/10 en dev. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, COCO mAP u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. No se publican medidas. Como referencia de orden de magnitud, el repositorio completo pesa 0,7 GB e incluye todas las redes (YOLO11n-pose, FastSAM-s, CLIP ViT-B/32, detectores opcionales, YuNet y BlazeFace), por lo que el conjunto de pesos es muy inferior a 1 GB y cabe en GPUs de consumo.
- GPU recomendadas: no disponibles en la documentacion. Por tamano de las redes, una GPU de consumo reciente (gama RTX xx60 o superior) deberia ser suficiente; para varias camaras concurrentes tiene mas sentido una GPU de datacenter (A100/H100) o varias instancias, pero el autor no aporta cifras.
- Cabe en GPU de consumo: si, segun el tamano de los pesos; no hay medicion oficial de VRAM ni de FPS.
- CPU: viable en teoria con ONNX Runtime para los modelos exportados; sin datos de latencia publicados.
- Navegador: el encoder CLIP de imagen corre en cliente via transformers.js (`Xenova/clip-vit-base-patch32`) y BlazeFace en TFLite; el coste depende del dispositivo del usuario y no esta medido en el repo.
- Opciones de despliegue documentadas: worker en Python ejecutado con `uv` (`scripts/eval_splits.py`, `scripts/item_tracker.py`), exportaciones ONNX (YOLO11n-pose, YuNet) y TFLite (BlazeFace), y ruta web con `web/guide.json`. No se mencionan vLLM, TGI, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Enfoque | Entrenamiento propio | Ventana / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Caught in 4K (`eymen160/caught-in-4k`) | Pipeline YOLO11n-pose + FastSAM-s + CLIP con logica de eventos y reglas | Ninguno (solo cabezal CLIP y logica) | Video por fotogramas; 21 categorias zero-shot | AGPL-3.0 | Pesos, caches, reglas y evaluacion publicados |
| Detector YOLO11 ajustado a clases de residuos | Deteccion supervisada de una etapa | Requiere dataset etiquetado de residuos | Una imagen por inferencia | AGPL-3.0 (Ultralytics) | Habitual en el ecosistema Ultralytics; prestaciones dependientes del dataset |
| CLIP ViT-B/32 zero-shot directo | Clasificacion imagen-texto sin logica temporal | Ninguno | Una imagen + prompts de texto | MIT | Publico (OpenAI y `Xenova/clip-vit-base-patch32`) |
| Sistema basado en VLM (p. ej. nombrar con un modelo multimodal) | Descripcion/nombrado por lenguaje | Ninguno (uso zero-shot) | Fotograma o recorte | Segun proveedor | El propio repo lo usa como nombrador opcional (`--namer deepseek`, Claude) |

No se dispone de cifras comparativas de parametros, contexto o rendimiento para las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Brecha dev/test explicita: 10/10 deposiciones detectadas en dev frente a 1/5 en test; el tracker "generaliza mal a metraje sobre el que no se ha ajustado", en palabras del autor.
- Fallos conocidos: lanzamientos por encima del hombro (el objeto nunca reposa en la caja), boca del contenedor oculta tras el propio contenedor y ausencia de antebrazo en plano; sin persona visible se recurre al tracker de movimiento anterior, con menor precision.
- El nombrado de objetos con CLIP es el punto mas debil (6/10 en dev); el uso de un VLM externo mejora el resultado pero introduce dependencia de un servicio de terceros y sus propios sesgos y alucinaciones.
- No hay ningun checkpoint ajustado: el rendimiento depende de la calidad de los modelos de terceros y de las constantes del tracker, que estan pensadas para ajustarse solo sobre dev.
- Las caches de evaluacion solo cubren la capa de seguimiento/decision; cambiar la percepcion obliga a reconstruirlas con los videos originales, que en parte no se distribuyen.
- Privacidad: los clips propios de telefono muestran personas reales y no se publican (solo sus caches). Existe redaccion facial con YuNet/BlazeFace, pero no se documenta su exhaustividad ni auditoria.
- Cobertura de reglas limitada al catalogo de Cambridge, MA 2022; para otra jurisdiccion hay que reescribir las reglas y regenerar `guide.json`.
- Idioma: prompts y catalogo en ingles; no se declara soporte multilingue.
- Licencia AGPL-3.0 por redistribucion de pesos de Ultralytics: el uso en servicio en red obliga a liberar el codigo correspondiente; conviene revisar cada licencia upstream (YOLO11n, YOLO11n-pose, YOLOv8s-World y FastSAM son AGPL-3.0).
- Un falso "contenedor incorrecto" delante de una persona se considera peor que un fallo por omision segun los criterios del autor; en produccion esto implica que el sistema es conservador y perdera depositos reales.
- No apto para uso como modelo de lenguaje: no hay tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eymen160/caught-in-4k
- Repositorio de codigo (acceso privado al equipo; commit de referencia `9fa5da7`): https://github.com/Ishan-Wakade/Caught_in_4K
- Encoder CLIP de imagen para navegador: https://huggingface.co/Xenova/clip-vit-base-patch32
- Ultralytics (YOLO11n, YOLO11n-pose, YOLOv8s-World v2, FastSAM-s): https://github.com/ultralytics/ultralytics
- CLIP ViT-B/32 (OpenAI, MIT): https://github.com/openai/CLIP
- YuNet (OpenCV Zoo, MIT): https://github.com/opencv/opencv_zoo
- BlazeFace short-range (Google MediaPipe, Apache-2.0): https://github.com/google-ai-edge/mediapipe
