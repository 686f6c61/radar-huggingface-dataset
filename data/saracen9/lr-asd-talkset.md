# saracen9/lr-asd-talkset

## Resumen

LR-ASD (Lightweight and Robust Network for Active Speaker Detection) es una red neuronal diseñada para la deteccion de hablante activo (active speaker detection, ASD) en video audio-visual. El modelo determina, para cada fotograma de un clip, que rostro de los presentes es el que esta hablando, combinando informacion visual (movimiento de labios y rasgos faciales) con informacion auditiva (la pista de audio). Lo desarrollan Junhua Liao, Haihan Duan, Kanghui Feng, Wanbing Zhao, Yanbing Yang, Liangyin Chen y Yanru Chen, y se publico originalmente en CVPR 2023, con una extension posterior en International Journal of Computer Vision en 2025.

Este repositorio concreto (`saracen9/lr-asd-talkset`) no es una publicacion oficial de los autores, sino una copia sin modificar del fichero de pesos `finetuning_TalkSet.model` del repositorio oficial `Junhua-Liao/LR-ASD`, subida por el propietario del proyecto curu-vision para fijar la fuente de los pesos que utiliza su modulo de deteccion de hablante activo. El fichero pesa 3.426.337 bytes (aproximadamente 3,3 MB) y su SHA-256 es `6b4ef53694e874e96cf630198dc479c78aebb3993bbf166aee3d926dfe7d9342`.

No se trata de un modelo de lenguaje ni de un modelo generativo: es un modelo discriminativo de vision y audio, de proposito muy especifico, pensado para integrarse en pipelines de procesamiento de video (subtitulado, diarizacion, edicion automatica, analisis de reuniones). Su relevancia radica en su tamano reducido y en su robustez, que lo hacen apto para inferencia en tiempo real sobre hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LR-ASD (red audio-visual ligera para deteccion de hablante activo; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo por fotograma/clip, no secuencial de texto); no disponible la ventana temporal exacta |
| Tipos de cuantizacion | no disponible (fichero `.model` de PyTorch, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (modelo audio-visual, no linguistico) |
| Licencia | MIT (Copyright (c) 2025 Liao Junhua) |
| Formato de pesos | `.model` (serializacion PyTorch, `torch.save`); 3.426.337 bytes |
| SHA-256 | `6b4ef53694e874e96cf630198dc479c78aebb3993bbf166aee3d926dfe7d9342` |
| Repositorio original | `Junhua-Liao/LR-ASD`, revision `1b6dcd2d8fc2895683de6508ec6294ec47d388ca` (2025-03-23) |
| Tamano del repo | 0,0 GB (solo el fichero de pesos) |
| Libreria | pytorch |

## Arquitectura y entrenamiento

La arquitectura es LR-ASD, una red audio-visual ligera para deteccion de hablante activo. La model card de esta copia no describe la topologia interna (capas, dimensiones, mecanismos de fusion audio-visual), por lo que esos detalles no estan disponibles en la informacion proporcionada. La integracion en curu-vision sigue los ficheros `model/Model.py`, `model/Encoder.py`, `model/Classifier.py` y `loss.py` del repositorio original, lo que confirma que se trata de una red con un codificador (encoder), un clasificador y una funcion de perdida especifica para la tarea.

Respecto al entrenamiento, el README del repositorio original indica que estos pesos corresponden a un modelo ajustado (fine-tuned) sobre el dataset TalkSet, pero no especifica sobre que modelo base se hizo el ajuste. TalkSet es un conjunto construido por el equipo de TalkNet (Tao et al., 2021, seccion 4.1.3) a partir de clips de VoxCeleb2 y LRS3, y no se publica de forma abierta. No se dispone de informacion sobre el numero de tokens, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o preferencias (no aplicables a esta tarea). El repositorio original incluye ademas otros pesos, como `weight/pretrain_AVA.model`, entrenados sobre el dataset AVA, que no son objeto de esta copia.

## Capacidades

- Deteccion de hablante activo por fotograma: asigna una puntuacion a cada rostro del clip indicando la probabilidad de que sea el hablante en ese instante.
- Fusion audio-visual: combina la pista de audio con la informacion visual (movimiento de labios y rasgos faciales) para desambiguar.
- Procesamiento de clips de video con multiples personas: identifica el hablante activo entre varios candidatos presentes en la escena.
- Inferencia ligera: el modelo pesa aproximadamente 3,3 MB, lo que permite ejecucion en tiempo real sobre hardware modesto.
- Integracion en pipelines: pensado para incrustarse en sistemas de procesamiento de video (subtitulado, diarizacion, edicion).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision general ni audio generativo. Es un modelo discriminativo de tarea unica.

## Casos de uso

- Subtitulado automatico de video: el modelo identifica que persona habla en cada fotograma, lo que permite asignar correctamente los subtitulos al interlocutor en escenas con varios participantes (entrevistas, mesas redondas).
- Diarizacion visual en reuniones: combinado con un sistema de reconocimiento facial, permite etiquetar quien habla en cada momento de una videollamada o reunion grabada, generando actas con atribucion de intervenciones.
- Edicion automatica de video multicamara: en producciones con varias camaras, el modelo permite conmutar automaticamente a la camara del hablante activo, reduciendo el trabajo manual de montaje.
- Analisis de contenido audiovisual a gran escala: procesar archivos de video para extraer estadisticas de participacion (tiempo de habla por persona) en entornos de investigacion o medios.
- Sistemas de transcripcion con atribucion de hablante: integrar el modelo como paso previo a un ASR para asignar cada segmento transcrito al rostro correcto, mejorando la precision frente a la diarizacion solo por audio.
- Aplicaciones de accesibilidad: resaltar visualmente al hablante activo en tiempo real para personas con dificultades auditivas, o para mejorar la experiencia en retransmisiones.
- Moderacion y analisis de contenido en plataformas: detectar patrones de habla y participacion en videos subidos por usuarios, con fines de analisis o cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta copia no incluye metricas (mAP, AUC, accuracy) sobre AVA, TalkSet ni otros conjuntos. El unico dato de rendimiento mencionado es de integracion: la implementacion en curu-vision reproduce las puntuaciones por fotograma del codigo original de LR-ASD con una diferencia maxima de 1,2e-7 sobre los mismos recortes de un clip de demostracion, lo que indica equivalencia numerica con la implementacion de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada, pero dado el tamano del fichero (3,3 MB) el modelo es extremadamente ligero y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos cientos de MB de VRAM libre; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentacion disponible.
- Compatibilidad con GPU consumer: si, previsiblemente en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes, aunque no se documentan cifras de latencia.
- Opciones de despliegue: al ser un fichero PyTorch (`.model`), se carga con PyTorch; no hay variantes publicadas para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo). La integracion documentada es la del puerto `load_speaker_detector` de curu-vision.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LR-ASD (este) | Deteccion de hablante activo audio-visual | no disponible (fichero de 3,3 MB) | no aplica | MIT | Copia no oficial en HF; original en GitHub |
| TalkNet (Tao et al., 2021) | Deteccion de hablante activo audio-visual | no disponible | no aplica | no disponible en la informacion | Referenciado como origen de TalkSet |
| Otros modelos ASD | Deteccion de hablante activo | no disponible | no aplica | no disponible | no disponible |

La informacion proporcionada solo permite comparar con TalkNet de forma indirecta, ya que es el trabajo que construyo TalkSet. No se dispone de datos de rendimiento ni de parametros de TalkNet ni de otros modelos ASD en la informacion disponible, por lo que no es posible establecer una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- Modelo de tarea unica: no es un modelo de lenguaje ni generativo; no debe evaluarse con criterios de LLM (contexto, benchmarks de texto, tool calling).
- Copia no oficial: este repositorio es una copia subida por un tercero (el propietario de curu-vision), no por los autores originales. La fuente canonica es el repositorio `Junhua-Liao/LR-ASD`.
- Terminos de los pesos: el repositorio original no establece terminos separados para los ficheros de `weight/`; el README pide citar los papers si se usan el codigo o los pesos. Conviene verificar los terminos de los datasets de entrenamiento (VoxCeleb2, LRS3, AVA) antes de un uso comercial.
- Datos de entrenamiento incompletos: no se especifica sobre que modelo base se hizo el fine-tuning de TalkSet, ni la composicion exacta del dataset.
- Sesgos: no documentados en la informacion proporcionada; al entrenarse con VoxCeleb2 y LRS3, es previsible que herede sesgos de esos corpus (demografia, condiciones de grabacion, idioma), aunque no se detallan.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si puede producir falsos positivos o negativos en la deteccion del hablante en condiciones adversas (audio ruidoso, oclusiones faciales, multiples hablantes simultaneos).
- Limitaciones de contexto o idioma: no aplica el concepto de contexto textual; el rendimiento puede degradarse con audio de baja calidad o rostros no frontales, aunque no se cuantifica.
- Caveat para produccion: al ser un fichero `.model` de PyTorch, requiere cargar codigo del repositorio original; verificar la integridad mediante el SHA-256 indicado antes de desplegar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/saracen9/lr-asd-talkset
- Repositorio original en GitHub: https://github.com/Junhua-Liao/LR-ASD
- Revision original: https://github.com/Junhua-Liao/LR-ASD/tree/1b6dcd2d8fc2895683de6508ec6294ec47d388ca
- URL original del fichero: https://raw.githubusercontent.com/Junhua-Liao/LR-ASD/1b6dcd2d8fc2895683de6508ec6294ec47d388ca/weight/finetuning_TalkSet.model
- Paper IJCV 2025 (LR-ASD): https://junhua-liao.github.io/Junhua-Liao/publications/papers/IJCV_2025.pdf
- Paper CVPR 2023 (A Light Weight Model for Active Speaker Detection): https://openaccess.thecvf.com/content/CVPR2023/papers/Liao_A_Light_Weight_Model_for_Active_Speaker_Detection_CVPR_2023_paper.pdf
- Licencia MIT: https://github.com/Junhua-Liao/LR-ASD/blob/1b6dcd2d8fc2895683de6508ec6294ec47d388ca/LICENSE
- README original: https://github.com/Junhua-Liao/LR-ASD/blob/1b6dcd2d8fc2895683de6508ec6294ec47d388ca/README.md
