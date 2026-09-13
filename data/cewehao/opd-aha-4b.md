# CewEhao/OPD-Aha-4B

## Resumen

OPD-Aha-4B es un modelo multimodal (imagen-texto-a-texto) desarrollado por el usuario CewEhao y publicado en HuggingFace. Se construye mediante ajuste fino sobre `Qwen/Qwen3.5-4B` y su objetivo declarado es mejorar la percepcion visual de detalle fino y el razonamiento matematico multimodal. El modelo se distribuye con licencia Apache-2.0 y esta etiquetado como compatible con `transformers` y con endpoints de inferencia.

La aportacion tecnica principal no es una arquitectura nueva, sino el metodo de entrenamiento: un framework de autodestilacion on-policy (OPD, *on-policy distillation*) que emplea un profesor visual congelado y una entrada visual contrafactual, de forma que el aprendizaje se concentra en la evidencia que altera la distribucion del profesor. El repositorio asociado (`Echochef/OPD-Aha`) incluye codigo de entrenamiento, fusion de checkpoints, inferencia y evaluacion.

El modelo tiene 5.174.964.736 parametros segun los pesos en safetensors, ingles como unico idioma declarado y un pipeline `image-text-to-text`. Es relevante ahora porque aborda dos de los puntos debiles clasicos de los VLM de ~4B: la lectura de detalles en imagenes de alta resolucion y el razonamiento sobre figuras en problemas matematicos, ambitos donde los modelos pequenos suelen degradarse frente a alternativas mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model construido sobre Qwen/Qwen3.5-4B (detalles completos de la arquitectura no disponibles en la informacion proporcionada) |
| Parametros totales | 5.174.964.736 (recuento real de safetensors; probablemente incluye el codificador visual, aunque la model card no lo detalla) |
| Parametros activos | No aplica (no se describe una arquitectura MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se documentan cuantizaciones oficiales; pesos en precision completa. No hay versiones GGUF, AWQ o GPTQ publicadas en la informacion disponible |
| Idiomas soportados | Ingles (tag `en`); no se declaran otros idiomas |
| Licencia | Apache-2.0 (el modelo base y los datasets quedan sujetos a sus propias licencias) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de indicar que el modelo se construye sobre `Qwen/Qwen3.5-4B` y que pertenece a la familia de modelos vision-language (los agradecimientos apuntan a Qwen3-VL como referencia). No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni la resolucion de imagen soportada.

El entrenamiento sigue un esquema de autodestilacion on-policy: el modelo alumno genera sus propias trayectorias y se alinea contra un profesor visual congelado, utilizando una entrada visual contrafactual de modo que la senal de aprendizaje se centra en la evidencia visual que realmente modifica la distribucion del profesor. Las etiquetas del repositorio incluyen `reinforcement-learning` y `on-policy-distillation`, aunque no se detalla en la informacion disponible el algoritmo de RL concreto, la funcion de recompensa ni si se aplicaron fases adicionales de SFT, DPO o RLHF.

El repositorio de codigo `Echochef/OPD-Aha` proporciona los scripts de entrenamiento, la fusion de checkpoints, la inferencia y la evaluacion, apoyandose en `verl` para el entrenamiento, `vLLM` para el servicio y el proyecto `Vision-OPD` como referencia.

## Capacidades

- Generacion de texto e interaccion conversacional sobre entradas de imagen, con soporte de conversaciones multi-turno mediante `transformers`.
- Percepcion visual de detalle fino: el modelo esta optimizado explicitamente para tareas de *fine-grained visual understanding*.
- Razonamiento matematico multimodal: resolucion de problemas que requieren leer figuras, diagramas y graficos.
- Razonamiento visual de varios pasos sobre imagenes, segun el tag `multimodal-reasoning`.
- Lectura de imagenes de alta resolucion y de regiones pequenas dentro de una imagen (el repositorio evalua en HR-Bench y ZoomBench).
- Capacidades multilingues: no documentadas salvo el ingles declarado.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y planificacion multi-paso: no documentado en la informacion disponible.
- Modo *thinking* explicito, audio o video: no documentado en la informacion disponible.

## Casos de uso

- Control de calidad visual en linea de produccion: el modelo puede inspeccionar imagenes de componentes y detectar defectos de detalle fino, aprovechando el entrenamiento orientado a percepcion fina (V*Bench, HR-Bench) para tareas donde un VLM generico confunde texturas o pequenos desperfectos.
- Reconocimiento optico de documentos densos: extraccion de informacion de facturas, informes o articulos con tablas y figuras en alta resolucion, apoyandose en la capacidad de lectura de imagenes grandes evaluada en HR-Bench y MME-RealWorld.
- Tutoria STEM automatizada: resolucion guiada de problemas de matematicas y fisica que incluyen diagramas, usando la evaluacion en MathVista, MathVerse, WeMath, MathVision y DynaMath como referencia de la competencia objetivo.
- Analisis de imagenes tecnicas y planos: interpretacion de esquematicos, planos de ingenieria o capturas de instrumentacion donde es necesario leer etiquetas y valores numericos pequenos.
- Asistencia en teledeteccion y analisis de imagenes aereas: deteccion de objetos pequenos en imagenes de gran resolucion, un escenario directamente relacionado con el enfasis en zoom y detalle fino.
- Descripcion detallada de imagenes para accesibilidad: generacion de descripciones ricas en matices para usuarios con discapacidad visual, aprovechando la sensibilidad a detalle fino del modelo.
- Chat multimodal integrado en aplicaciones: despliegue sobre vLLM con el script `scripts/serve_model.sh` del repositorio para servir un endpoint OpenAI-compatible que acepte imagen y texto.
- Reproduccion de investigacion en destilacion on-policy: uso del checkpoint junto al repositorio para replicar experimentos de autodestilacion con profesor visual congelado sobre Qwen3.5-4B.
- Evaluacion comparativa de VLM pequenos: el modelo sirve como linea base afinada para medir la brecha entre un VLM de ~5B y modelos mayores en tareas de percepcion fina.

## Benchmarks y rendimiento

La informacion disponible menciona los conjuntos de evaluacion que cubre el repositorio, pero no publica cifras concretas para ninguno de ellos. No se han publicado resultados numericos de benchmarks en la informacion disponible.

| Benchmark | Ambito | Resultado |
|---|---|---|
| V*Bench | Percepcion de detalle fino | No disponible |
| HR-Bench | Alta resolucion | No disponible |
| MME-RealWorld | Percepcion en escenarios reales | No disponible |
| ZoomBench | Detalle fino con zoom | No disponible |
| MathVista | Razonamiento matematico visual | No disponible |
| MathVerse | Razonamiento matematico multimodal | No disponible |
| WeMath | Matematicas multimodales | No disponible |
| MathVision | Problemas matematicos con imagen | No disponible |
| DynaMath | Razonamiento matematico dinamico | No disponible |

## Requisitos de hardware

- VRAM estimada en BF16/FP16: en torno a 10,3 GB solo para pesos (5,17 mil millones de parametros a 2 bytes), mas activaciones y cache del codificador visual. Presupuesto practico recomendado: 14-16 GB.
- VRAM estimada en INT8: aproximadamente 5,2 GB para pesos, con margen adicional para activaciones; encaja en GPU de 12-16 GB.
- VRAM estimada en INT4: en torno a 2,6-3 GB para pesos; podria caber en GPU de 8 GB, aunque no hay cuantizaciones oficiales publicadas y habria que generarlas.
- GPU recomendadas para produccion: A100 40/80 GB, H100 o L40S para servir con margen de concurrencia; el checkpoint es lo bastante pequeno como para no exigir memoria de clase 80 GB.
- GPU de consumo: cabe en RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB) y RTX 3090 (24 GB) en BF16; en tarjetas de 8-12 GB requeriria cuantizacion.
- Opciones de despliegue: `vLLM` es la via documentada por el autor (`scripts/serve_model.sh`); `transformers` es la libreria declarada. No se documentan despliegues en llama.cpp, Ollama o TGI, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han encontrado en la busqueda web datos verificables de alternativas comparables. La unica referencia solida es el modelo base, del que este checkpoint deriva.

| Modelo | Parametros | Contexto | Licencia | Relacion |
|---|---|---|---|---|
| OPD-Aha-4B | 5.174.964.736 (safetensors) | No disponible | Apache-2.0 | Modelo analizado |
| Qwen/Qwen3.5-4B | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Modelo base sobre el que se ajusta OPD-Aha-4B |
| Otros VLM de ~4B | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion recogida |

## Limitaciones y advertencias

- Idioma: solo se declara ingles; el comportamiento en castellano u otros idiomas no esta documentado ni evaluado.
- Ausencia de benchmarks publicados: no hay cifras que respalden las mejoras declaradas en percepcion fina y razonamiento matematico, por lo que cualquier adopcion en produccion deberia ir precedida de una evaluacion propia.
- Madurez: el modelo registra 0 descargas y 0 *likes* en el momento de la consulta, lo que indica validacion comunitaria practicamente nula.
- Riesgo de alucinacion: como cualquier VLM, puede describir detalles inexistentes en imagenes ambiguas o de baja calidad; el enfasis en detalle fino no elimina este riesgo y puede agravarlo en imagenes ruidosas.
- Sesgos: no se documenta ningun analisis de sesgos; el modelo hereda los sesgos del modelo base y de los datos de destilacion, no publicados.
- Contexto: la longitud de contexto no se especifica, lo que impide planificar conversaciones largas o documentos de muchas paginas con garantias.
- Licencia: el modelo es Apache-2.0, pero la model card advierte de que el modelo base y los datasets mantienen sus propias licencias, que deben verificarse antes de uso comercial.
- Cuantizacion: no hay pesos GGUF, AWQ ni GPTQ publicados; el despliegue en hardware limitado exige cuantizar por cuenta propia, con el consiguiente riesgo de degradacion en tareas de detalle fino.
- Reproducibilidad: el framework depende de un profesor visual congelado y de datos contrafactuales cuyo detalle no se especifica en la informacion disponible.
- Despliegue: la unica ruta documentada es vLLM mediante scripts del repositorio; no hay garantias sobre otras integraciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CewEhao/OPD-Aha-4B
- Repositorio de codigo: https://github.com/Echochef/OPD-Aha
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Qwen3-VL (referencia de la familia): https://github.com/QwenLM/Qwen3-VL
- verl (framework de entrenamiento): https://github.com/volcengine/verl
- vLLM (servicio de inferencia): https://github.com/vllm-project/vllm
- Vision-OPD (referencia metodologica): https://github.com/VisionOPD/Vision-OPD
