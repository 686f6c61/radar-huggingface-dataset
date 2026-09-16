# shubhdotai/autoclip

## Resumen

AutoClip (`shubhdotai/autoclip`) es un repositorio de Hugging Face que no contiene un modelo entrenado por su autor, sino dos checkpoints upstream espejados para comodidad: `pretrain_AVA.model`, un modelo de deteccion de hablante activo (ASD, active speaker detection) de LR-ASD, y `yolov8x_person_face.pt`, un detector de caras y personas basado en YOLOv8x. El repositorio sirve como origen de pesos para AutoClip, un pipeline en Python que reencuadra video horizontal a vertical conservando el audio y siguiendo al hablante activo.

El primer checkpoint pertenece a LR-ASD (Junhua Liao et al., CVPR 2023 e IJCV 2025) y fue entrenado sobre AVA-ActiveSpeaker; no es un modelo autonomo de tipo Transformers, sino un `state_dict` de PyTorch que exige la arquitectura y el preprocesado concretos de LR-ASD. El segundo procede de `iitolstykh/YOLO-Face-Person-Detector` y predice cajas de cara (clase 1) y persona (clase 0) con sus puntuaciones de confianza.

El conjunto es relevante para quien necesite montar un sistema de reencuadre guiado por hablante sin entrenar nada: ambos ficheros son pequenos (3,43 MB y 136,72 MB, 0,1 GB de repositorio), se cargan en CPU, CUDA o MPS, y el repositorio publica las huellas SHA-256 y la revision upstream exacta de cada peso. En contrapartida, no aporta ninguna evaluacion propia: no hay benchmark de precision nuevo, ni estudio de sesgo demografico, ni prueba de rendimiento sobre video de 60 minutos. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos componentes independientes: LR-ASD (red ligera audio-visual para deteccion de hablante activo) y YOLOv8x (detector de objetos para cara y persona). No es un modelo de lenguaje ni un transformer generativo |
| Parametros totales | no disponible. Solo se publica el tamano de los ficheros: 3,43 MB (`pretrain_AVA.model`) y 136,72 MB (`yolov8x_person_face.pt`), en una precision no declarada |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible. Los checkpoints se distribuyen en su formato original de PyTorch; la model card no declara versiones cuantizadas |
| Idiomas soportados | no aplicable. Modelo visual y de audio, sin dependencia de idioma declarada; el modulo de audio usa MFCC de 13 valores a 16 kHz mono |
| Licencia | Por fichero: MIT para `pretrain_AVA.model` y AGPL-3.0 para `yolov8x_person_face.pt`. Los terminos propios de Ultralytics se aplican aparte |
| Formato de pesos | PyTorch. `pretrain_AVA.model` es un `state_dict` que requiere la arquitectura y el preprocesado de LR-ASD; `yolov8x_person_face.pt` es un checkpoint cargable con Ultralytics |
| Tamano del repositorio | 0,1 GB |
| Modalidad de entrada | Video a 25 fps con audio mono a 16 kHz; secuencias de cara sincronizadas de 112x112 en escala de grises para el modulo ASD; fotogramas para el detector YOLO |
| Salidas | LR-ASD: puntuacion de habla por pista de cara (logit crudo de la clase 1, no probabilidad calibrada). YOLO: cajas y confianza de persona (clase 0) y cara (clase 1) |
| Detector de caras alternativo | Apple Vision, que no necesita pesos adicionales |
| Huellas SHA-256 | `pretrain_AVA.model`: `85e6c77fc981595234790d1e128ebb60352d37726b2445e0ef8891e2512fe9e3`; `yolov8x_person_face.pt`: `2620f45609a65f909eb876bd7401308b5a8f3843ad5a03cb7416066a3e492989` |
| Revision upstream fijada | LR-ASD `1b6dcd2d8fc2895683de6508ec6294ec47d388ca`, fichero `weight/pretrain_AVA.model` |
| Pipeline de Hugging Face | no disponible |
| Descargas y likes | 0 y 0 en el momento de la consulta |
| Fecha de creacion del repositorio | 16 de septiembre de 2026, segun los metadatos de Hugging Face |

## Arquitectura y entrenamiento

LR-ASD es una red ligera multimodal que decide si una cara visible esta hablando combinando dos flujos: la secuencia de caras recortadas (112x112 en escala de grises, video a 25 fps) y caracteristicas de audio MFCC de 13 valores a 16 kHz mono, alineadas temporalmente con la imagen. La salida es una puntuacion de habla por pista de cara; la aplicacion consume el logit crudo de la clase 1, que no es una probabilidad calibrada. El entrenamiento upstream se realizo sobre AVA-ActiveSpeaker. Este espejo fija la revision `1b6dcd2d8fc2895683de6508ec6294ec47d388ca` del repositorio original y no introduce ningun cambio de pesos ni de datos.

El segundo componente, `yolov8x_person_face.pt`, es un detector de la familia YOLOv8 en su variante `x` que devuelve cajas y confianzas para persona (clase 0) y cara (clase 1). Su model card upstream indica entrenamiento sobre un dataset propietario de caras y personas. Es importante entender el reparto de responsabilidades: la deteccion no determina quien habla ni mantiene identidades a lo largo del tiempo, y el modulo ASD tampoco genera video. AutoClip aporta el seguimiento, la puntuacion agregada y el renderizado; ninguno de los dos checkpoints, por separado, produce un video reencuadrado. No se documenta en la informacion disponible el numero de tokens o ejemplos de entrenamiento, la composicion exacta del dataset, ni el uso de RLHF o DPO, algo por otra parte ajeno a estos modelos.

## Capacidades

- Deteccion de hablante activo (ASD) audio-visual: compara el audio con la secuencia de cara visible y emite una puntuacion de habla por pista. El audio por si solo es insuficiente para el modelo.
- Deteccion de caras y personas: cajas delimitadoras y confianza para las clases persona y cara, con umbral configurable (por ejemplo `conf=0.4` en la API de Ultralytics).
- Seleccion automatica de dispositivo: AutoClip elige MPS, CUDA o CPU para PyTorch segun disponibilidad.
- Integracion en un pipeline de reencuadre: con `autoclip run input.mp4 --output out/vertical` se obtiene el video vertical usando Apple Vision para la deteccion de caras, y con `--detector yolo` se sustituye por el detector YOLO.
- Verificacion de integridad: el descargador del proyecto valida sumas de comprobacion (`python scripts/download_models.py`, con `--include-yolo` para bajar ambos ficheros).
- Sin capacidades de generacion de texto, razonamiento, codigo, matematicas, vision generativa, tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Sin capacidades multilingues ni procesamiento de lenguaje natural de ningun tipo.
- Sin seguimiento de identidades a lo largo del tiempo: el tracking lo realiza la aplicacion de forma separada.
- Sin salida de subtitulos ni seleccion de clips: la linea de tiempo del video de salida se mantiene completa.

## Casos de uso

- Reencuadre horizontal a vertical para redes sociales: el pipeline detecta caras y personas, estima quien habla con LR-ASD y recoloca el encuadre 9:16 siguiendo al hablante. Es el caso de uso central para el que se distribuyen estos pesos.
- Edicion de podcasts y entrevistas: en conversaciones con varios participantes en plano, el modelo ASD permite decidir en cada instante a que persona encuadrar, util para generar versiones verticales de episodios largos sin intervencion manual.
- Clases y webinars grabados: el reencuadre sigue al docente aunque se mueva por el aula, manteniendo el audio original y la linea temporal completa.
- Postproduccion de transmisiones en directo: con la advertencia de que los cortes rapidos y el crosstalk degradan la calidad del ASD, sirve como primer filtro automatizado antes de una revision humana.
- Preprocesado de privacidad en video: el detector de caras y personas aporta las cajas necesarias para aplicar desenfoque o pixelado en postproduccion. Las cajas deben usarse solo con ese fin tecnico, nunca como juicio de identidad o de atributos personales.
- Investigacion en deteccion de hablante activo: el checkpoint sobre AVA-ActiveSpeaker sirve como referencia reproducible (revision fijada y SHA-256 publicado) para comparar arquitecturas o preprocesados alternativos.
- Integracion en herramientas de edicion propias: al ser pesos de PyTorch, el detector se puede cargar directamente con Ultralytics y el modulo ASD dentro de la arquitectura LR-ASD, lo que permite embeberlos en pipelines internos de renderizado.
- Generacion masiva de versiones verticales de un catalogo: el coste de inferencia es bajo por el tamano de los modelos, lo que hace viable procesar lotes de videos en CPU o en GPUs modestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que este espejo no incluye ninguna evaluacion nueva de precision, ni una evaluacion de sesgo demografico, ni una prueba de rendimiento sobre video de 60 minutos, y que ninguna cifra upstream debe presentarse como resultado de AutoClip. Los articulos citados (Liao et al., CVPR 2023, paginas 22932-22941; Liao et al., IJCV 2025) son la fuente donde consultar las metricas originales de LR-ASD sobre AVA-ActiveSpeaker, pero no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada (calculo propio a partir del tamano de los ficheros, no confirmado por el autor): los pesos ocupan unos 3,4 MB para el modulo ASD y unos 137 MB para el detector YOLO en el formato distribuido, del orden de 0,14 GB en memoria en fp32. La inferencia cabe con holgura en cualquier GPU con 4 GB o mas.
- GPU recomendadas: no hay ninguna recomendacion publicada. Por tamano, bastan GPUs de gama de entrada y media (por ejemplo, series GTX 16xx, RTX 20xx/30xx/40xx). No se justifica el uso de A100 o H100 para estos checkpoints.
- Compatibilidad con GPU de consumo: si, el conjunto entra en cualquier GPU de consumo moderna e incluso en equipos sin GPU dedicada.
- Ejecucion en CPU: viable, y de hecho AutoClip selecciona CPU como respaldo cuando no hay MPS ni CUDA disponibles.
- Aceleracion en Apple Silicon: soportada via MPS, con la opcion de usar Apple Vision para la deteccion de caras sin pesos adicionales.
- Opciones de despliegue: carga directa con PyTorch y con Ultralytics (`YOLO("models/yolov8x_person_face.pt")`), o mediante la CLI de AutoClip (`autoclip run ...`). No hay informacion sobre servidores de inferencia tipo vLLM, TGI u Ollama, ni sobre exportaciones a ONNX, TensorRT o formatos GGUF.
- Latencia y throughput: no disponible. No se publica ninguna medicion de frames por segundo, tiempo por minuto de video ni consumo de memoria en produccion.

## Comparativa con modelos similares

No se dispone de datos verificados de parametros ni de rendimiento de alternativas en la informacion suministrada, por lo que la comparacion se limita a tarea, licencia, formato y procedencia.

| Componente o alternativa | Tarea | Licencia | Formato | Procedencia y mantenimiento |
|---|---|---|---|---|
| `pretrain_AVA.model` (este repositorio) | Deteccion de hablante activo | MIT, heredada de LR-ASD | `state_dict` de PyTorch | Espejo de LR-ASD sin cambios; revision upstream fijada |
| LR-ASD (repositorio original) | Deteccion de hablante activo | MIT | `state_dict` de PyTorch | Autor original, Junhua Liao et al.; fuente de la licencia y la cita |
| `yolov8x_person_face.pt` (este repositorio) | Deteccion de cara y persona | AGPL-3.0 | Checkpoint PyTorch/Ultralytics | Espejo de `iitolstykh/YOLO-Face-Person-Detector`, entrenado sobre dataset propietario |
| YOLO-Face-Person-Detector (upstream) | Deteccion de cara y persona | AGPL-3.0 | Checkpoint PyTorch/Ultralytics | Modelo original; este espejo no anade datos ni cambios |
| Apple Vision (alternativa usada por AutoClip) | Deteccion de caras | Sujeta a los terminos de Apple | Integrado en el sistema, sin pesos aparte | Requiere macOS; no necesita descarga adicional |

Alternativas habituales en deteccion de hablante activo o de caras (por ejemplo, otros detectores de la familia YOLO o detectores de caras especificos) no aparecen en la informacion proporcionada con datos verificables, por lo que no se comparan numericamente.

## Limitaciones y advertencias

- Condiciones que degradan el ASD: caras pequenas u ocluidas, vistas de perfil, audio doblado, habla fuera de plano, crosstalk y cortes rapidos.
- El modulo de audio por si solo no basta: la decision se basa en comparar el audio con la secuencia de cara visible.
- La puntuacion de habla es un logit crudo de la clase 1, no una probabilidad calibrada; no debe interpretarse como una confianza probabilistica.
- La deteccion no determina quien habla ni mantiene identidades en el tiempo; el seguimiento lo realiza la aplicacion por separado.
- Ninguno de los dos checkpoints genera por si solo un video reencuadre: sin la capa de seguimiento, puntuacion y renderizado de AutoClip no hay producto final.
- La salida conserva la linea temporal completa del video, sin subtitulos ni seleccion de clips.
- Sin evaluacion de sesgos: no existe un estudio demografico asociado a este espejo. No deben usarse las detecciones ni las puntuaciones de habla como juicios fiables de identidad o de atributos personales.
- Sin benchmark propio de precision ni de rendimiento en video largo, lo que impide estimar la calidad o el coste real en produccion.
- Licencia mixta y copyleft: la AGPL-3.0 del checkpoint YOLO es mas restrictiva que la MIT del checkpoint ASD; la licencia MIT no relicencia el detector. Hay que conservar los avisos upstream, revisar los terminos de Ultralytics y, en caso de ofrecer el software como servicio en red, evaluar las obligaciones de la AGPL-3.0.
- Redistribucion de terceros: los pesos son espejos, no modelos propios; cualquier publicacion derivada deberia citar a los autores originales.
- Madurez del repositorio: 0 descargas y 0 likes, sin comunidad ni validacion externa documentada en el momento de la consulta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/shubhdotai/autoclip
- Seccion de licencia de la model card: https://huggingface.co/shubhdotai/autoclip/blob/main/README.md#license
- LR-ASD (repositorio original): https://github.com/Junhua-Liao/LR-ASD
- Licencia de LR-ASD: https://github.com/Junhua-Liao/LR-ASD/blob/main/LICENSE
- YOLO-Face-Person-Detector (upstream): https://huggingface.co/iitolstykh/YOLO-Face-Person-Detector
- Seccion de licencia del detector upstream: https://huggingface.co/iitolstykh/YOLO-Face-Person-Detector#license
- Texto de la GNU AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
- Cita de LR-ASD: Junhua Liao et al., "A Light Weight Model for Active Speaker Detection", CVPR 2023, paginas 22932-22941; Junhua Liao et al., "LR-ASD: Lightweight and Robust Network for Active Speaker Detection", International Journal of Computer Vision, 2025
- Cita del detector: la model card upstream de `iitolstykh/YOLO-Face-Person-Detector` remite a su propia seccion de atribucion
- Busqueda web: no se encontraron resultados relevantes; los unicos enlaces devueltos fueron paginas genericas de YouTube, sin relacion con el modelo
