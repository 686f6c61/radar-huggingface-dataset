# jaehyunkang/pi05-real-workbench-taco-3view-8b7104f0-movement-reversal-60k

## Resumen

El modelo `jaehyunkang/pi05-real-workbench-taco-3view-8b7104f0-movement-reversal-60k` es un ajuste fino (fine-tune) de la politica robotica Pi0.5 (`lerobot/pi05_base`) entrenado sobre el dataset `Myungkyu/real_workbench-taco-keyframe-gemini` para la subtarea concreta `movement_reversal` dentro del entorno de banco de trabajo real (real-workbench). No es un modelo de lenguaje: es una politica vision-language-action (VLA) que mapea observaciones visuales e instrucciones textuales a acciones de control de un brazo robotico, con salida de velocidad cartesiana y pinza.

El checkpoint corresponde al paso 60.000 de optimizacion y se publica como artefacto de inferencia (pesos, configuracion de politica, preprocesado/postprocesado y estados de normalizacion), excluyendo estado de optimizador y de reanudacion del entrenamiento. El autor declara explicitamente que se trata de una politica entrenada y no de un resultado de evaluacion, y que no se reclaman metricas de robot real. El modelo tiene 4.143.404.816 parametros (~4,14 mil millones) y un repositorio de 9,4 GB en formato safetensors.

Es relevante por su caracter de artefacto reproducible dentro del ecosistema LeRobot: incluye manifiesto con tamanos de fichero y hashes SHA-256, semilla fija (42), lote global 32 sobre 2 GPU y una configuracion de inferencia concreta (horizonte de accion 50, 10 pasos de denoising). Su publico natural son equipos de investigacion en manipulacion robotica que quieran reproducir, comparar o reajustar politicas Pi0.5 en configuraciones multivista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica vision-language-action (VLA) Pi0.5; ajuste fino de `lerobot/pi05_base`, con tokenizer/backbone de referencia `google/paligemma-3b-pt-224` (revision `35e4f46485b4d07967e7e9935bc3786aad50687c`) |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo consume imagenes de 224x224 y texto de instruccion por frame; no se publica longitud de contexto en tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 9,4 GB; el tamano es coherente con pesos de ~4,14 B parametros en precision reducida tipo bf16, dato no confirmado en la informacion) |
| Pasos de optimizacion | 60.000 (checkpoint final) |
| Tarea / subtask | `movement_reversal` (instruccion textual como subtask por frame extraida del parquet) |
| Vistas de entrada | 3 (camara exterior y de muneca, mas `observation.image.keyframe`) |
| Dimension del estado | 8 |
| Dimension de la accion | 7 (delta EEF: 6 de velocidad cartesiana + pinza) |
| Horizonte de accion (action chunk) | 50 |
| Pasos de denoising en inferencia | 10 |
| Resolucion de imagen | almacenada a 224x126; la politica la rellena (padding) a 224x224 |
| Lote global / GPUs / semilla | 32 / 2 GPU / 42 |
| Implementacion de entrenamiento | `RLWRLD/hiwrld-ll-policy` (LeRobot Pi0.5 vendorizado); campos de entrada personalizados pueden requerir esa implementacion concreta |
| Libreria | lerobot |

## Arquitectura y entrenamiento

La ficha del modelo identifica la base como Pi0.5 (`lerobot/pi05_base`), la familia de politicas VLA de Physical Intelligence distribuidas a traves de LeRobot. La referencia del tokenizer apunta a `google/paligemma-3b-pt-224`, lo que situa el componente vision-lenguaje en la estirpe PaliGemma (encoder visual SigLIP y decodificador de lenguaje Gemma) y anade una cabeza o "action expert" que produce acciones continuas. La informacion proporcionada no detalla la division exacta de parametros entre backbone y experto de accion, ni el numero de capas atencion, por lo que ese desglose queda como no disponible.

El entrenamiento se realizo durante 60.000 pasos de optimizacion con lote global 32 sobre 2 GPU y semilla 42, usando el marco `RLWRLD/hiwrld-ll-policy` con la implementacion LeRobot Pi0.5 vendorizada. El modelo consume tres vistas (exterior, muneca y una imagen de keyframe definida por el dataset), un vector de estado de 8 dimensiones y una instruccion textual por frame tomada de un campo subtask del parquet. La salida es un chunk de 50 acciones de 7 dimensiones (6 de velocidad cartesiana y la pinza), generado con 10 pasos de denoising en inferencia. No se documentan en la informacion disponible la composicion completa del dataset, el numero de tokens o transiciones, ni si hubo etapas de RLHF, DPO o aprendizaje por refuerzo; el autor solo indica que el ajuste se hizo sobre el dataset `Myungkyu/real_workbench-taco-keyframe-gemini`.

## Capacidades

- Control robotico de manipulacion: genera comandos de accion continua (delta del efector final con 6 grados de libertad de velocidad cartesiana mas pinza) a partir de observaciones visuales.
- Percepcion multivista: procesa tres entradas de imagen simultaneas (camara exterior, camara de muneca e imagen keyframe del dataset), rellenandolas a 224x224.
- Seguimiento de instrucciones textuales por frame: la politica recibe el subtask correspondiente como texto de tarea, lo que permite condicionar el comportamiento por etapa.
- Ejecucion por chunks: produce bloques de 50 acciones por inferencia, lo que reduce la frecuencia de llamadas al modelo en el bucle de control.
- Especializacion en movimiento reverso: el ajuste esta orientado a la subtarea `movement_reversal` del banco de trabajo real.
- Inferencia con difusion/flow denoising: 10 pasos de denoising por chunk.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, dialogo multilingue, vision general, audio ni modo "thinking"; no disponibles en la informacion.

## Casos de uso

- Reproduccion de experimentos en manipulacion: cargar el checkpoint junto con la configuracion de politica y los estados de normalizacion incluidos en la raiz del repositorio permite volver a ejecutar el mismo ajuste sobre el dataset de banco de trabajo y comparar con checkpoints intermedios del autor.
- Investigacion en inversion de movimiento: el modelo esta entrenado especificamente para `movement_reversal`, util como linea base en estudios sobre tareas de colocar, retirar o deshacer una accion sobre un objeto en una superficie de trabajo.
- Ajuste fino sobre nuevas tareas de banco de trabajo: al derivar de `lerobot/pi05_base`, sirve como punto de partida para reentrenar con otros datasets que compartan el esquema de 8 dimensiones de estado y 7 de accion.
- Estudio de politicas multivista: permite analizar el peso relativo de la camara exterior, la de muneca y la imagen keyframe en el comportamiento resultante, manteniendo fijas las condiciones de entrenamiento documentadas.
- Benchmark interno de pipelines LeRobot: al incluir manifiesto con tamanos y hashes SHA-256, es util para validar procesos de descarga, verificacion de integridad y despliegue automatizado de politicas en infraestructura de laboratorio.
- Pruebas de latencia y planificacion de control: con horizonte de 50 acciones y 10 pasos de denoising por inferencia, sirve para medir el coste real de ejecutar politicas VLA en un bucle de control a una frecuencia dada.
- Experimentos de reproducibilidad: la semilla 42, el lote global 32 y las 2 GPU quedan documentados, lo que facilita replicar el entorno de entrenamiento en estudios de variabilidad.
- Docencia y prototipado en robotica: al ser un checkpoint autocontenido de ~9,4 GB, es manejable en estaciones de trabajo con una sola GPU para practicas de aprendizaje por imitacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que se trata de una politica entrenada y no de un resultado de evaluacion, y que no se reclaman metricas de evaluacion en robot real. Las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los 4,14 B parametros ocupan aproximadamente 8,3 GB en precision de 16 bits y en torno a 16,6 GB en 32 bits; a ello hay que sumar activaciones del encoder visual, las tres imagenes de entrada y los 10 pasos de denoising. Como referencia practica, reservar al menos 16 GB y preferiblemente 24 GB en 16 bits.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia en 16 bits; A6000 y RTX 3090 (24 GB) como alternativas de coste contenido.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 4090, RTX 3090, A6000) con margen; en tarjetas de 16 GB puede requerir precision reducida o carga por capas, dato no confirmado en la informacion. No hay datos de rendimiento en GPU de 8-12 GB.
- Despliegue: libreria `lerobot` con PyTorch; la model card advierte que los campos de entrada personalizados pueden exigir la implementacion `RLWRLD/hiwrld-ll-policy` (LeRobot Pi0.5 vendorizado). No se documentan soportes especificos de vLLM, TGI, Ollama o llama.cpp para esta politica.
- Entrenamiento: el autor uso 2 GPU con lote global 32; no se especifica el modelo de GPU ni la duracion total del entrenamiento.
- Latencia y throughput: no disponibles. Los unicos parametros conocidos del bucle de inferencia son 10 pasos de denoising y un chunk de 50 acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi05 real-workbench taco movement_reversal) | 4,14 B | horizonte de accion 50, 10 pasos de denoising | sin metricas publicadas | no disponible | HuggingFace, libreria lerobot |
| `lerobot/pi05_base` (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace, libreria lerobot |
| Otras politicas VLA de la misma categoria (pi0, OpenVLA, GR00T N1, etc.) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no verificado |

La informacion disponible solo permite comparar con el modelo base del que deriva. No se han proporcionado especificaciones ni resultados de alternativas como pi0, OpenVLA o GR00T N1, por lo que no se incluyen cifras para evitar datos no verificados.

## Limitaciones y advertencias

- Ausencia total de metricas: el autor declara que no se reclaman resultados de evaluacion en robot real, por lo que no hay evidencia publicada de exito de la tarea ni de robustez.
- Especializacion extrema: la politica esta ajustada a la subtarea `movement_reversal` del dataset `real_workbench-taco-keyframe-gemini`; su comportamiento fuera de ese entorno, camaras y esquema de acciones es impredecible.
- Licencia no disponible: sin terminos explicitos no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Dependencia de implementacion concreta: la model card advierte que los campos de entrada personalizados pueden requerir `RLWRLD/hiwrld-ll-policy`; cargarlo solo con LeRobot estandar puede fallar o producir resultados incorrectos.
- Requisitos de entrada estrictos: tres vistas de imagen (incluida la imagen keyframe definida por el dataset), vector de estado de 8 dimensiones e instruccion textual por frame; omitir cualquiera de ellos invalida la inferencia.
- Riesgo de alucinacion y de generalizacion: como politica aprendida por imitacion, puede producir acciones plausibles pero incorrectas ante objetos, iluminacion o posiciones de camara no vistas en entrenamiento.
- Cobertura idiomatica no documentada: no hay informacion sobre idiomas soportados para la instruccion textual; se desconoce si funciona con instrucciones en castellano.
- Artefacto de inferencia: no incluye estado de optimizador ni de reanudacion; los paths especificos de la maquina original fueron eliminados de los metadatos JSON, por lo que reanudar entrenamientos requiere aportar rutas locales.
- Adopcion nula verificable: 0 descargas y 0 "likes" en el momento de la consulta, sin historial de uso independiente.
- Fechas y trazabilidad: la fecha de creacion indicada (2026-09-18) es posterior a la fecha actual de referencia habitual, dato a tener en cuenta al citar el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaehyunkang/pi05-real-workbench-taco-3view-8b7104f0-movement-reversal-60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/real_workbench-taco-keyframe-gemini
- Tokenizer de referencia: `google/paligemma-3b-pt-224`, revision `35e4f46485b4d07967e7e9935bc3786aad50687c` (referenciado en la model card, sin URL en la informacion proporcionada)
- Implementacion de entrenamiento: `RLWRLD/hiwrld-ll-policy` (mencionada en la model card, sin URL en la informacion proporcionada)
- Manifiesto de artefacto: `artifact_manifest.json` en la raiz del repositorio (tamanos y hashes SHA-256)
- Busquedas web: no se encontraron enlaces relevantes sobre este modelo (los resultados devueltos correspondian a contenido turistico sin relacion).
