# minfishmovemountain/SAGE-Map

## Resumen

SAGE-Map es un paquete de inferencia y evaluacion para vectorizacion de mapas a partir de imagenes satelitales, publicado por el autor `minfishmovemountain` como material complementario de un manuscrito para la revista *Remote Sensing*. No se trata de un modelo de lenguaje generativo, sino de un checkpoint congelado de vision por computador orientado a la extraccion de geometrias vectoriales (carreteras, edificios u otras entidades cartograficas) sobre imagenes de satelite de 4096 × 4096 pixeles del conjunto OpenSatMap20.

El repositorio distribuye dos archivos ZIP: uno con codigo de inferencia y evaluacion (1,78 MB) y otro con pesos del modelo (4,2 GB comprimidos, 6,4 GB descomprimidos), junto con un manifiesto JSON de checksums SHA-256. El modelo se apoya en un backbone DINOv2 congelado, junto con activos de linea base y refinamiento, y referencias de calibracion. La arquitectura exacta, el numero de parametros y la composicion del dataset de entrenamiento no se detallan en la informacion disponible.

Su relevancia actual radica en que ofrece un pipeline reproducible de evaluacion sobre las 393 teselas oficiales de validacion de OpenSatMap20, con registros por tesela, metricas agregadas AP/mIoU y remuestreo bootstrap pareado. La licencia MIT y el soporte de instrucciones en ingles y chino facilitan su reutilizacion, aunque el alcance declarado es de inferencia y evaluacion, no de reproduccion completa del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (backbone DINOv2 congelado mas modulos de refinamiento; detalles no especificados) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en), chino (zh) para documentacion e instrucciones |
| Licencia | MIT |
| Formato de pesos | Checkpoints propietarios en ZIP (`SAGE_Map_Inference_Weights_20261005.zip`); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

La informacion disponible indica que SAGE-Map utiliza un backbone congelado basado en DINOv2, acompanado de activos de linea base y refinamiento, y referencias de calibracion. El paquete incluye 29 activos de pesos y calibracion, de los cuales 24 hashes coinciden con registros experimentales archivados. No se especifica el tipo exacto de cabecera de prediccion, el mecanismo de vectorizacion ni el numero de parametros del conjunto.

Respecto al entrenamiento, la model card indica explicitamente que el paquete soporta inferencia y evaluacion con checkpoints suministrados, pero no es un paquete completo de reproduccion de entrenamiento desde cero ni de todos los ablations. No se proporcionan datos sobre numero de tokens, composicion del dataset de entrenamiento, uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El conjunto de evaluacion es OpenSatMap20 (393 teselas de validacion de 4096 × 4096 pixeles), y las imagenes originales y anotaciones oficiales no se redistribuyen en este repositorio.

## Capacidades

- Vectorizacion de mapas a partir de imagenes satelitales de alta resolucion (4096 × 4096 pixeles) sobre el conjunto OpenSatMap20.
- Inferencia por tesela con generacion de candidatos (la prueba funcional reporta 206 candidatos en la tesela `ATX_-1_-1_sat`).
- Evaluacion reproducible con metricas AP y mIoU calculadas sobre registros de coincidencia ordenados globalmente.
- Remuestreo bootstrap pareado con 2000 extracciones de teselas y 2000 extracciones de grupos de escena.
- Replay en CPU de los registros experimentales publicados sin necesidad de cargar pesos ni imagenes.
- Verificacion de integridad mediante checksums SHA-256 y manifiesto de paquetes.
- Documentacion bilingue ingles/chino.
- No se reportan capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes ni modo thinking.

## Casos de uso

- Extraccion de geometrias cartograficas a partir de imagenes satelitales: el pipeline `inference/run_opensatmap.py` procesa teselas de 4096 × 4096 y genera predicciones vectoriales que pueden integrarse en flujos de actualizacion cartografica.
- Evaluacion comparativa de metodos de vectorizacion: el script `evaluation/compare_paper_metrics.py` permite contrastar las metricas del run propio con las publicadas en el manuscrito, usando AP y mIoU como referencia.
- Auditoria de resultados cientificos: el modo replay en CPU reconstruye las metricas agregadas y el bootstrap pareado a partir de los registros suministrados, util para revisores o replicaciones independientes.
- Verificacion de integridad en pipelines de MLOps: el manifiesto JSON con tamanos y SHA-256 permite validar que los pesos y el codigo no han sido alterados antes de desplegarlos.
- Pruebas de humo en hardware modesto: una unica tesela se puede procesar en una RTX 3060 de 12 GB, lo que facilita validaciones funcionales antes de lanzar evaluaciones completas.
- Integracion en flujos de investigacion en teledeteccion: sirve como linea base reproducible para comparar nuevos metodos de vectorizacion sobre OpenSatMap20 con las mismas particiones y protocolo de evaluacion.
- Docencia y formacion: el paquete incluye instrucciones en ingles y chino y tests unitarios (19 pruebas de evaluacion), lo que lo hace util como material didactico sobre evaluacion rigurosa en vision por satelite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existe una evaluacion completa sobre las 393 teselas y un replay bootstrap verificado, pero no se incluyen los valores numericos de AP ni mIoU en el texto proporcionado. Tampoco se aportan comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; la prueba de una sola tesela se ejecuto en una RTX 3060 con 12 GB de memoria GPU.
- RAM del sistema: al menos 16 GB libres para el pipeline de inferencia.
- GPU recomendadas: no se especifican modelos concretos mas alla de la RTX 3060 validada; para el conjunto completo de 393 teselas no se han medido pico de memoria ni tiempo de ejecucion.
- Cabe en GPU de consumo: si, al menos para inferencia por tesela en una RTX 3060 de 12 GB.
- Espacio en disco: los pesos descomprimidos ocupan 6.409.516.010 bytes (aproximadamente 6,4 GB), mas espacio adicional para el entorno Python, imagenes de entrada, caches intermedias y salidas.
- Opciones de despliegue: scripts Python propios (`inference/run_opensatmap.py`, `evaluation/replay_sage_release.py`, `evaluation/compare_paper_metrics.py`); no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Entorno probado: Python 3.12.13, PyTorch 2.11.0, torchvision 0.26.0 con CUDA 12.6.
- Latencia y throughput: no medidos para el conjunto completo; la model card indica explicitamente que el pico de memoria y el tiempo de ejecucion de la validacion completa no se han medido.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de vectorizacion de mapas ni con alternativas de la misma categoria, y no se detallan parametros, contexto ni rendimiento de SAGE-Map que permitan establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El paquete es de inferencia y evaluacion con checkpoints suministrados; no permite reproducir el entrenamiento desde cero ni todos los ablations.
- La nueva release de inferencia de imagenes no se ha vuelto a ejecutar sobre las 393 teselas; la equivalencia numerica completa entre hardware y software no esta establecida.
- Solo se ha validado el flujo completo de imagen a mapa en una unica tesela (`ATX_-1_-1_sat`, 206 candidatos).
- Las imagenes satelitales originales y las anotaciones oficiales de OpenSatMap20 no se redistribuyen y deben descargarse por separado, sujetas a sus propios terminos de uso.
- Se debe usar la version OpenSatMap20 (no OpenSatMap19) y las imagenes PNG sin modificar de 4096 × 4096.
- El ranking de candidatos depende del conjunto completo de puntuacion; no se deben puntuar fragmentos por separado y promediar sus AP.
- No se han medido el pico de memoria ni el tiempo de ejecucion de la validacion completa.
- No se detallan sesgos conocidos, riesgo de alucinacion ni limitaciones idiomaticas mas alla del alcance tecnico del modelo.
- Aunque la licencia es MIT, conviene revisar los terminos del dataset OpenSatMap20 antes de un uso comercial del pipeline completo.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere una validacion externa limitada por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/minfishmovemountain/SAGE-Map
- Codigo y registros de evaluacion: https://huggingface.co/minfishmovemountain/SAGE-Map/resolve/main/SAGE_Map_Inference_Code_20261105_MIT.zip
- Pesos del modelo: https://huggingface.co/minfishmovemountain/SAGE-Map/resolve/main/SAGE_Map_Inference_Weights_20261005.zip
- Checksums de los paquetes: https://huggingface.co/minfishmovemountain/SAGE-Map/resolve/main/SAGE_Map_Inference_Packages_20261105_MIT.json
- Dataset OpenSatMap20: https://huggingface.co/datasets/z-hb/OpenSatMap
