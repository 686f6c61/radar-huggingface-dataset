# dronefreak/dformer-base-sunrgbd

## Resumen

DFormer-B es un modelo de segmentacion semantica de escenas interiores que combina informacion RGB y de profundidad (RGB-D). Lo desarrollan Bowen Yin, Xuying Zhang, Zhong-Yu Li, Li Liu, Ming-Ming Cheng y Qibin Hou, del grupo VCIP de la Universidad de Nankai, y se presento en ICLR 2024 con el articulo "DFormer: Rethinking RGBD Representation Learning for Semantic Segmentation". El repositorio analizado es un espejo no oficial creado por el usuario dronefreak que redistribuye los pesos originales sin modificarlos, anadiendo una copia en `safetensors` y un `config.json`.

El modelo resuelve la tarea de asignar una clase semantica a cada pixel de una imagen de interior (suelo, pared, techo, muebles, objetos, etc.) aprovechando de forma conjunta la imagen RGB y el mapa de profundidad. Con 29,5 millones de parametros, es un modelo compacto pensado para despliegue eficiente, y alcanza un mIoU de 51,2 en SUN RGB-D a escala unica segun los autores.

Es relevante para desarrolladores e investigadores que trabajan en vision por computador aplicada a interiores: robotica movil, realidad aumentada, modelado 3D y analisis de escenas. Su tamano reducido y su licencia MIT lo hacen atractivo para prototipado e integracion en sistemas con recursos limitados, aunque al tratarse de un espejo comunitario sin descargas ni validacion externa conviene verificar los pesos antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFormer (DFormer-B), encoder RGB-D preentrenado en ImageNet-1K con profundidad mas decoder ligero |
| Parametros totales | 29.529.925 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en FP32 por defecto; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `.pth` (checkpoint original), `.safetensors` (copia solo de pesos), `.pth.tar` (encoder preentrenado) |

## Arquitectura y entrenamiento

DFormer es una red neuronal convolucional/transformer disenada especificamente para segmentacion semantica RGB-D. La innovacion central del articulo es repensar como se incorpora la informacion de profundidad: en lugar de tratar la profundidad como un canal adicional o fusionarla tardíamente, el modelo aprende representaciones RGB-D desde el encoder, que se preentrena en ImageNet-1K enriquecido con mapas de profundidad. Sobre ese encoder se anade un decoder ligero que produce la segmentacion densa por pixel. La variante B es la de tamano base de la familia.

El checkpoint de este repositorio corresponde al entrenamiento sobre SUN RGB-D, un dataset de escenas interiores con anotaciones densas de segmentacion semantica y mapas de profundidad. El repositorio incluye tambien el encoder DFormer-B preentrenado en RGB-D sobre ImageNet-1K (`pretrained/DFormer_Base.pth.tar`), que sirve como inicializacion. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion completa del dataset mas alla de SUN RGB-D, ni si se emplearon tecnicas de refinamiento posteriores como RLHF (no aplicable a un modelo de vision) o ajuste fino especifico.

## Capacidades

- Segmentacion semantica densa de escenas interiores a partir de pares RGB-D.
- Fusion multimodal RGB + profundidad para mejorar la delimitacion de objetos y superficies.
- Clasificacion por pixel en categorias de interior (suelo, pared, techo, muebles, objetos de uso comun).
- Funciona como encoder preentrenado RGB-D reutilizable para otras tareas de vision (el repositorio incluye el encoder por separado).
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo de pensamiento, vision generativa, audio ni otras capacidades generativas; es un modelo discriminativo de segmentacion.

## Casos de uso

- Robotica movil en interiores: el modelo segmenta suelo, paredes y obstaculos a partir del par RGB-D de la camara del robot, permitiendo navegacion segura y planificacion de trayectorias con 29,5 M de parametros, lo que facilita su ejecucion en hardware embebido.
- Realidad aumentada: identificar superficies (suelo, mesas, paredes) para anclar objetos virtuales de forma coherente con la geometria real de la escena, usando la profundidad para estimar la posicion de los planos.
- Modelado y reconstruccion 3D de interiores: etiquetar semanticamente nubes de puntos o mallas generadas a partir de capturas RGB-D, facilitando la separacion de elementos arquitectonicos y mobiliario.
- Analisis de imagenes de inmobiliaria: segmentar automaticamente estancias y mobiliario en fotografias con profundidad para inventariado, tasacion o generacion de descripciones estructuradas.
- Asistencia a personas con discapacidad visual: detectar y delimitar obstaculos y superficies transitables en tiempo real a partir de la camara de un dispositivo movil con sensor de profundidad.
- Preentrenamiento y transferencia: usar el encoder DFormer-B incluido en `pretrained/` como inicializacion para otras tareas de vision RGB-D (deteccion, segmentacion de instancias, estimacion de profundidad) con menos datos anotados.
- Prototipado e investigacion: al ser un modelo pequeno con licencia MIT, sirve como linea base reproducible para comparar metodos de fusion RGB-D en experimentos academicos.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| mIoU (escala unica) | 51,2 | SUN RGB-D |

Los datos proceden de la model card del espejo, que los atribuye a los autores originales. No se han publicado en la informacion disponible resultados comparativos con otros modelos (por ejemplo, frente a alternativas RGB-D como CMX, TokenFusion o SwinDepth) ni metricas adicionales como exactitud por clase, FPS o latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 29,5 M de parametros en FP32 (unos 118 MB de pesos), la VRAM necesaria es muy reducida, del orden de 1-2 GB incluyendo activaciones para resoluciones tipicas de segmentacion.
- GPU recomendadas: cualquier GPU moderna es suficiente; una NVIDIA RTX 4090, A100 o H100 lo ejecutaran con enorme margen. Tambien es viable en GPUs de gama media y en hardware embebido (Jetson).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer (GTX 1060 en adelante), e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: el modelo requiere el codigo oficial de DFormer (PyTorch) para construir la red y cargar los pesos; no se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje). Se puede exportar a ONNX o TensorRT manualmente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | mIoU SUN RGB-D | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DFormer-B (este) | 29,5 M | RGB + profundidad | 51,2 | MIT | Pesos en este espejo y en el repo oficial |
| CMX (B2) | no disponible | RGB + profundidad | no disponible | no disponible | no disponible |
| TokenFusion | no disponible | RGB + profundidad | no disponible | no disponible | no disponible |
| SwinDepth | no disponible | RGB + profundidad | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos verificados de parametros, mIoU ni licencia de los modelos alternativos; las filas correspondientes se marcan como no disponibles para no inventar cifras. Para una comparativa rigurosa conviene consultar las tablas del articulo original y del repositorio oficial de DFormer.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos se redistribuyen sin cambios, pero no han sido validados por los autores originales ni por un tercero independiente. Verificar la integridad antes de usarlos en produccion.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- Modelo especializado en escenas interiores de SUN RGB-D; el rendimiento en exteriores, escenas industriales atipicas o dominios muy distintos puede degradarse notablemente.
- Requiere entrada RGB-D: necesita un sensor de profundidad o un modelo de estimacion de profundidad previo, lo que anade complejidad y posibles errores en cascada.
- Riesgo de confusion entre clases visualmente similares (por ejemplo, tipos de muebles o superficies) inherente a la segmentacion semantica; no se documentan sesgos especificos.
- No es un modelo generativo: no produce texto ni respuestas; no aplica el concepto de alucinacion, pero si el de predicciones erroneas por pixel.
- El checkpoint original `.pth` puede requerir `weights_only=False` al cargarse por incluir argumentos de entrenamiento; precaucion de seguridad al cargar pesos de terceros.
- Licencia MIT permite uso comercial, pero se recomienda citar el trabajo original y respetar los terminos del repositorio oficial.
- No se documentan limitaciones de idioma porque el modelo no procesa lenguaje.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dronefreak/dformer-base-sunrgbd
- Repositorio oficial de codigo: https://github.com/VCIP-RGBD/DFormer
- Articulo (arXiv): https://arxiv.org/abs/2309.09668
- Dataset SUN RGB-D (espejo en el Hub): https://huggingface.co/datasets/dronefreak/SUN-RGBD
- Publicacion en ICLR 2024: https://openreview.net/forum?id=... (no disponible el identificador exacto en la informacion proporcionada)
