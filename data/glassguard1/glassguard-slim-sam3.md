# glassguard1/glassguard-slim-sam3

## Resumen

Slim SAM3 (Slim-2816) es un modelo de segmentacion de instancias de vidrio para robotica, publicado por el usuario glassguard1 dentro del proyecto GlassGuard: Verified Glass Plane Mapping for Robot Navigation. Se trata de una version podada y destilada del modelo de imagen SAM 3 de Meta: mediante una poda de Taylor de primer orden guiada por confianza se reduce el ancho de las capas MLP a 2816 canales, y despues el SAM 3 original actua como profesor para destilar al estudiante.

El modelo resuelve un problema muy concreto: detectar y segmentar superficies de vidrio (ventanas, mamparas, paneles) a partir de un prompt de texto cacheado ("glass window"), de forma que un robot pueda construir un mapa verificado de planos de vidrio y navegar sin colisionar con superficies transparentes, que los sensores de profundidad convencionales suelen no detectar.

Su relevancia practica esta en el coste de despliegue: con embeddings de texto cacheados y BF16, el estudiante reduce la VRAM reservada aproximadamente un tercio respecto al despliegue original de SAM 3, manteniendo el recall en GSD-S (0,918 frente a 0,915 del modelo original), que es la metrica de la que depende el pipeline de GlassGuard. El repositorio ocupa 2,9 GB y el checkpoint principal pesa 2,7 GB. No se publican el numero de parametros, el volumen de datos de entrenamiento ni el desglose de benchmarks fuera de la tabla de segmentacion de vidrio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 3 (modelo de imagen promptable basado en transformer) con poda del ancho MLP a 2816 canales y destilacion posterior |
| Parametros totales | no disponible (el checkpoint `student_final.pt` pesa 2,7 GB) |
| Parametros activos | no aplica: no es un modelo MoE |
| Longitud de contexto | no disponible (modelo de vision; consume prompts de texto, no una ventana de contexto conversacional) |
| Tipos de cuantizacion | BF16 documentado en el model card; no se publican variantes GGUF, AWQ, GPTQ, INT8 ni INT4 |
| Idiomas soportados | no disponible (el unico prompt documentado es en ingles: "glass window") |
| Licencia | other; derivada del release SAM 3 de Meta y sujeta a los terminos de licencia de SAM 3 |
| Formato de pesos | PyTorch `.pt` (`checkpoints/student_final.pt`), mas `checkpoints/mlp_pruned_meta.json` y `prompt_features/window_glass.pt` |
| Tarea | segmentacion de instancias de vidrio (glass instance segmentation) |
| Resolucion de entrada | 512 x 512 (evaluacion recogida en la Table I del paper) |
| Tamano del repositorio | 2,9 GB |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

El modelo parte del modelo de imagen de SAM 3 y aplica una receta de compresion en dos fases. La primera es una poda estructural de las capas MLP guiada por confianza, basada en una aproximacion de Taylor de primer orden, que deja el ancho de esas capas en 2816 canales (de ahi el nombre Slim-2816). La segunda es una destilacion en la que el SAM 3 original, sin podar, actua como profesor del estudiante podado. El resultado se empaqueta como un checkpoint PyTorch acompanado de un fichero JSON con los metadatos de canales podados, necesario para reconstruir la arquitectura antes de cargar el `state_dict`.

No se especifican en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion del dataset de destilacion, ni si se emplearon tecnicas de ajuste adicionales como RLHF o DPO (habitualmente no aplicables a un modelo de segmentacion). Tampoco se detalla si la poda afecta solo a los bloques MLP o a otras partes del backbone, ni el numero exacto de parametros resultante. La innovacion relevante es la combinacion de poda de primer orden con destilacion del modelo original, orientada a preservar el recall en el dominio especifico del vidrio mas que el rendimiento medio general.

## Capacidades

- Segmentacion de instancias de vidrio en imagenes a 512 x 512, guiada por prompt de texto.
- Uso de un embedding de texto cacheado para el prompt "glass window" (`prompt_features/window_glass.pt`), lo que evita recalcular el codificador de texto en cada inferencia.
- Integracion en el pipeline GlassGuard para el mapeo verificado de planos de vidrio en navegacion robotica.
- Conservacion del recall en el conjunto GSD-S (0,918), metrica critica para el pipeline.
- Carga reproducible mediante el script `slim_sam3/load_slim_sam3.py`, que reconstruye la arquitectura podada a partir de `mlp_pruned_meta.json`.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, function calling, agentes, audio ni vision general fuera del dominio del vidrio.
- No se documenta soporte multilingue de prompts.

## Casos de uso

- Navegacion de robots moviles en oficinas y edificios acristalados: el modelo segmenta mamparas y ventanas para que la pila de planificacion las marque como obstaculo, evitando colisiones con superficies que el LiDAR o la camara de profundidad no detectan de forma fiable.
- Robots de limpieza de fachadas y ventanas: la segmentacion de instancias permite delimitar cada panel de vidrio y planificar trayectorias de cepillado o pulverizacion por instancia.
- Vehiculos de guiado automatico (AGV/AMR) en almacenes con cerramientos transparentes: el recall preservado en GSD-S reduce el riesgo de atravesar puertas o paneles de vidrio.
- Mapas semanticos de instalaciones: las mascaras generadas se pueden proyectar sobre un mapa 2D/3D para anotar de forma automatica la ubicacion de los planos de vidrio en un gemelo digital del edificio.
- Inspeccion y mantenimiento de edificios: deteccion de paneles de vidrio para inventariado, comprobacion de presencia o ausencia de elementos y planificacion de rutas de inspeccion.
- Robotica de servicio en entornos comerciales (escaparates, vitrinas, mostradores acristalados): delimitacion de superficies transparentes para maniobrar sin dañar el mobiliario.
- Investigacion en segmentacion eficiente: el checkpoint sirve como punto de partida para estudiar tecnicas de poda y destilacion sobre SAM 3, o para reentrenar el estudiante en otro dominio con prompts de texto distintos.

## Benchmarks y rendimiento

Resultados de segmentacion de instancias de vidrio a 512 x 512, tomados de la Table I del paper (GDD = Glass Detection Dataset; GSD-S = Glass Segmentation Dataset reducido, segun la nomenclatura del model card):

| Modelo | GDD IoU | GDD Prec. | GDD Rec. | GSD-S IoU | GSD-S Prec. | GSD-S Rec. |
|---|---|---|---|---|---|---|
| SAM 3 (original) | 0,815 | 0,901 | 0,895 | 0,713 | 0,764 | 0,915 |
| Slim-2816 (este modelo) | 0,748 | 0,888 | 0,826 | 0,671 | 0,714 | 0,918 |

No se han publicado en la informacion disponible mas resultados de benchmarks (MMLU, HumanEval, GSM8K u otros): no son aplicables a un modelo de segmentacion.

## Requisitos de hardware

- Peso de los artefactos: `student_final.pt` ocupa 2,7 GB, `mlp_pruned_meta.json` 1,0 MB y `prompt_features/window_glass.pt` 0,6 MB; el repositorio completo suma 2,9 GB.
- VRAM estimada para inferencia: no disponible en cifras absolutas. El model card indica que, con embeddings de texto cacheados y BF16, el estudiante reduce la VRAM reservada aproximadamente un tercio respecto al despliegue original de SAM 3, pero no se publica la cifra base de SAM 3 ni el consumo final medido.
- GPU recomendadas: no especificadas por el autor. Dado el tamano del checkpoint (2,7 GB), es plausible su ejecucion en GPU de consumo, pero no hay confirmacion oficial ni lista de modelos validados.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: carga mediante el script propio del repositorio (`slim_sam3/load_slim_sam3.py`), que exige tanto el checkpoint como el JSON de metadatos de poda. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni TensorRT, herramientas orientadas a modelos de lenguaje y no a este tipo de modelo de vision.
- Latencia y throughput: no disponibles.
- Requisito de integridad: los dos ficheros de checkpoint son obligatorios; cargar solo `student_final.pt` sin `mlp_pruned_meta.json` impide reconstruir la arquitectura podada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto o entrada | GDD IoU | GSD-S Rec. | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Slim-2816 (este modelo) | no disponible | 512 x 512, prompt de texto | 0,748 | 0,918 | other (derivada de SAM 3) | HuggingFace, 0 descargas |
| SAM 3 (original) | no disponible en la informacion proporcionada | 512 x 512, prompt de texto | 0,815 | 0,915 | licencia de Meta para SAM 3 | release de Meta |
| Otros modelos de segmentacion (SAM 2, MobileSAM, FastSAM, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparativa con datos verificables es frente al SAM 3 original, que es ademas el profesor de la destilacion. Las alternativas de la misma categoria no se han evaluado en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de precision frente al modelo original: el IoU en GDD baja de 0,815 a 0,748 y la precision de 0,901 a 0,888; en GSD-S el IoU cae de 0,713 a 0,671 y la precision de 0,764 a 0,714. El recall solo se preserva en GSD-S (0,918 frente a 0,915), no en GDD (0,826 frente a 0,895).
- Riesgo de falsos positivos y falsos negativos en la mascara de vidrio. En navegacion robotica, un falso negativo implica riesgo de colision con una superficie transparente, por lo que el modelo no deberia usarse como unica fuente de seguridad.
- Especializacion de dominio: el modelo esta ajustado para vidrio y depende de un embedding de texto cacheado para "glass window". No hay evidencia de generalizacion a otros objetos, dominios o prompts.
- Limitacion idiomatica: no se documenta el comportamiento con prompts en idiomas distintos del ingles.
- Licencia: la licencia declarada es "other", derivada del release SAM 3 de Meta y sujeta a sus terminos. Es imprescindible revisar las condiciones de SAM 3 antes de cualquier uso comercial, ya que el model card no aclara si el uso comercial esta permitido.
- Dependencia del codigo: el uso correcto requiere el cargador del repositorio GlassGuard y el fichero `mlp_pruned_meta.json`; no es un checkpoint autonomo estandar.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de reproducibilidad.
- No se documentan sesgos demograficos ni de otro tipo, ni analisis de robustez ante condiciones de iluminacion, reflejos o cristales sucios.
- No se especifican requisitos minimos de hardware, latencia ni limites de throughput en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/glassguard1/glassguard-slim-sam3
- Pagina del proyecto GlassGuard: https://glassguardproject.github.io/
- Codigo del proyecto: https://github.com/glassguardproject/GlassGuard
- Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo; los unicos enlaces relevantes son los incluidos en el model card y el propio repositorio de HuggingFace.
