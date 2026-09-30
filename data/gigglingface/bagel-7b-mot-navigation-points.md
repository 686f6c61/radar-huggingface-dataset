# Gigglingface/BAGEL-7B-MoT-navigation-points

## Resumen

BAGEL-7B-MoT-navigation-points es un ajuste fino del ramal de comprensión (understanding path) de ByteDance-Seed/BAGEL-7B-MoT, publicado por el usuario Gigglingface dentro del proyecto Primitive Imagination. El modelo no genera imágenes ni texto libre: su única salida es una secuencia ordenada de tokens normalizados `<point>x,y</point>` con coordenadas en el rango [0,1000] que describen una ruta sobre una cuadrícula, desde un punto de inicio hasta un objetivo. Se distribuye como un delta de safetensors con 755 tensores (16.105.547.536 bytes) que debe fusionarse con el checkpoint upstream de BAGEL.

El modelo base, BAGEL-7B-MoT, es un backbone multimodal unificado de 7.000 millones de parámetros activos y 14.000 millones totales con arquitectura Mixture-of-Transformer-Experts (MoT), capaz de comprensión visual, generación de imagen, edición y tareas de world modeling. Este ajuste congela el experto generativo y adapta únicamente la rama de comprensión, por lo que hereda el coste de inferencia del modelo completo pero con un comportamiento muy especializado.

Su relevancia es acotada y de carácter investigador: es un artefacto de 3.000 pasos de entrenamiento sobre 6.000 problemas sintéticos de navegación espacial (cuadrículas de 3×3 a 6×6) que alcanza un 75,5% de éxito estricto (453/600) en el test de navegación ThinkMorph/VSP. El propio autor advierte de solapamiento entre corpus de entrenamiento y evaluación, por lo que la cifra no debe presentarse como generalización limpia a layouts no vistos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal unificado con Mixture-of-Transformer-Experts (MoT) en el modelo base; aqui se ajusta solo el ramal de comprension. El experto de generacion queda congelado y sin modificar |
| Parametros totales | 14.000 millones en el modelo base BAGEL-7B-MoT; el delta publicado contiene 755 tensores (16.105.547.536 bytes) |
| Parametros activos | 7.000 millones (modelo base, MoE/MoT) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible (la tarea es de prediccion de puntos; la model card no documenta idiomas) |
| Licencia | apache-2.0 (se mantienen las condiciones de atribucion y licencia de BAGEL y ThinkMorph upstream) |
| Formato de pesos | safetensors (delta `understanding.safetensors`, requiere fusion con el checkpoint base) |

## Arquitectura y entrenamiento

BAGEL-7B-MoT es un modelo multimodal unificado con arquitectura MoT que combina encoders duales (captura a nivel de pixel y de representacion semantica) sobre un backbone transformer autorregresivo, con 7.000 millones de parametros activos y 14.000 millones totales. Este checkpoint no modifica el experto de generacion: solo entrena la rama de comprension para que emita una traza de puntos ordenada sin generar ni reobservar ninguna imagen intermedia. Las coordenadas se emiten normalizadas en el intervalo [0,1000].

El entrenamiento usa 6.000 problemas de navegacion espacial de cuadriculas de 3×3 a 6×6 procedentes del dataset ThinkMorph (Junfei-Chen/ThinkMorph). El objetivo es una entropia cruzada selectiva aplicada unicamente a los spans de puntos, sin objetivo de imagen rasterizada de pensamiento intermedio. Se realizaron 3.000 actualizaciones sobre cuatro GPU, con ajuste completo de la rama de comprension (no LoRA). No se documenta ninguna fase de RLHF, DPO ni preferencias humanas.

## Capacidades

- Prediccion de rutas en cuadricula: genera una secuencia ordenada de puntos normalizados que, partiendo del inicio, alcanza el objetivo sin atravesar huecos ni salir de la rejilla.
- Razonamiento visual-espacial: interpreta la representacion de la cuadricula proporcionada como entrada multimodal y planifica sobre ella.
- Salida estructurada: formato estricto `<point>x,y</point>` con coordenadas normalizadas en [0,1000], facil de parsear.
- Rango de tamanos evaluado: de 3×3 a 8×8 celdas en el conjunto de prueba ThinkMorph/VSP.
- No genera imagenes intermedias: la inferencia es de un solo paso sobre la rama de comprension.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso general: no documentado; el modelo esta especializado en una unica tarea.
- Capacidades multilingues: no documentadas.
- Capacidades de vision general, generacion de texto o codigo: no evaluadas en este checkpoint; el experto generativo no se ha entrenado ni modificado.

## Casos de uso

- Planificacion de waypoints en robotica de interior: el modelo convierte un mapa de ocupacion en rejilla y un par inicio-objetivo en una traza de puntos ejecutable, que un modulo de control traduce a comandos de movimiento.
- Navegacion de AGV en almacen: sobre una cuadricula discretizada del almacen, genera la secuencia de celdas a recorrer evitando estanterias y zonas bloqueadas.
- Investigacion en razonamiento espacial: sirve como artefacto experimental para estudiar si las trazas de puntos son causalmente necesarias, mediante controles de enmascarado, intercambio y truncado.
- Generacion de trazas de referencia para anotacion: produce rutas candidatas sobre tableros sinteticos que luego se revisan y corrigen manualmente para construir datasets de navegacion.
- Pathfinding para NPC en videojuegos por turnos: sobre tableros discretos de hasta 8×8, ofrece una ruta ordenada que puede sustituir o complementar un A* clasico en prototipos.
- Evaluacion de pipelines multimodales: permite comparar preprocesados de inferencia (por ejemplo, resolucion nativa frente a reescalados) usando el test ThinkMorph/VSP como referencia reproducible.
- Experimentos de destilacion de planificadores: la salida de puntos tokenizada sirve como supervision intermedia para entrenar modelos menores de planificacion en rejilla.

## Benchmarks y rendimiento

| Evaluacion | Conjunto | Resultado |
|---|---|---|
| Exito estricto de ruta | ThinkMorph/VSP navigation test, 600 ejemplos (100 por tamano, de 3×3 a 8×8) | 453/600 (75,5%) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El exito estricto exige que la secuencia de puntos emitida execute el recorrido desde el inicio hasta el objetivo sin cruzar huecos y sin salir de la rejilla. Los autores indican que la cifra se obtuvo con inferencia nativa de BAGEL a resolucion original, no con el preprocesado temprano con vLLM, que consideran invalido.

## Requisitos de hardware

- Delta publicado: 16,1 GB en disco; debe descargarse junto al checkpoint base para poder fusionarlo.
- Checkpoint fusionado: con 14.000 millones de parametros totales, en bf16 los pesos ocupan aproximadamente 28 GB; sumando cache KV y activaciones de vision conviene disponer de 40 GB o mas de VRAM para inferencia comoda.
- GPU recomendadas: A100 de 40 GB o 80 GB, H100 de 80 GB. En consumer, 24 GB (RTX 4090, RTX 3090) no bastan para el checkpoint completo sin cuantizacion.
- Cuantizaciones: no se publican versiones cuantizadas, por lo que no puede confirmarse su encaje en GPU de consumo.
- Almacenamiento de trabajo: se recomienda reservar en torno a 60-75 GB libres para el base, el delta y la salida fusionada.
- Entrenamiento de referencia: 3.000 actualizaciones sobre cuatro GPU (modelo no especificado en la informacion disponible).
- Despliegue: inferencia nativa mediante `src/model_loader.py` y fusion con `tools/export_checkpoint.py` del repositorio primitive-imagination-lab. No se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BAGEL-7B-MoT-navigation-points | 14B totales / 7B activos (base) | no disponible | Navegacion en rejilla mediante traza de puntos | Apache-2.0 | HuggingFace (delta + script de fusion) |
| ByteDance-Seed/BAGEL-7B-MoT (base) | 14B totales / 7B activos | no disponible | Multimodal unificado: comprension visual, generacion de imagen, edicion | no disponible en la informacion proporcionada | HuggingFace y GitHub |
| Qwen2.5-VL | no disponible en la informacion proporcionada | no disponible | Vision-lenguaje general | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| InternVL-2.5 | no disponible en la informacion proporcionada | no disponible | Vision-lenguaje general | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

La model card de BAGEL afirma que el modelo base supera a Qwen2.5-VL e InternVL-2.5 en los rankings estandar de comprension multimodal; no se aportan cifras concretas en la informacion disponible. Este checkpoint especializado no publica comparativas cuantitativas frente a planificadores clasicos (A*, BFS) ni frente a otros modelos de navegacion.

## Limitaciones y advertencias

- Artefacto de investigacion para una tarea sintetica estrecha de navegacion; no es un sistema de navegacion general ni un modelo de proposito general.
- Contaminacion entre entrenamiento y evaluacion: la auditoria del proyecto detecto 63 tableros solapados y 61 registros de entrenamiento compartidos con la fuente VSP. El 75,5% no debe presentarse como generalizacion a layouts no vistos.
- Desajuste de formato: la supervision selectiva solo sobre puntos entra en conflicto con el prompt original de respuesta en caja, lo que produce fallos de parada y de parseo que forman parte del registro de evaluacion.
- No se ha demostrado que las trazas de puntos sean causalmente necesarias; los controles de enmascarado, intercambio y truncado estan pendientes.
- Riesgo de alucinacion espacial: el modelo puede emitir rutas que parezcan validas pero atraviesen huecos o salgan de la rejilla si la representacion de entrada no coincide con la distribucion de entrenamiento.
- Alcance limitado de tamanos: el entrenamiento cubre cuadriculas de 3×3 a 6×6; la evaluacion se extiende hasta 8×8, con rendimiento no desglosado por tamano en la informacion disponible.
- Idiomas y contexto maximo no documentados; no hay garantias de comportamiento fuera de la tarea de navegacion.
- Licencia Apache-2.0 para el delta, pero siguen aplicando las condiciones de licencia y atribucion de BAGEL (ByteDance-Seed) y del dataset ThinkMorph; conviene verificar la licencia del corpus antes de un uso comercial.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, y con fecha de publicacion reciente: no hay validacion independiente de los resultados.
- Para produccion, el checkpoint exige un proceso manual de fusion y no dispone de cuantizaciones ni de integracion documentada en servidores de inferencia habituales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gigglingface/BAGEL-7B-MoT-navigation-points
- Modelo base BAGEL-7B-MoT: https://huggingface.co/ByteDance-Seed/BAGEL-7B-MoT
- Repositorio del modelo base: https://github.com/bytedance-seed/BAGEL
- Codigo y mapa completo del experimento: https://github.com/oshapio/primitive-imagination-lab
- Comparacion de checkpoints y superposiciones: http://185.80.129.192:18473/primitive-experiment-1/checkpoints/
- Objetivos de entrenamiento exactos: http://185.80.129.192:18473/primitive-experiment-1/training.html
- Comparacion visual-SFT nativa de ThinkMorph: http://185.80.129.192:18473/primitive-imagination/thinkmorph-visual-sft/
- Dataset ThinkMorph: https://huggingface.co/datasets/Junfei-Chen/ThinkMorph
- Espejo del modelo base: https://huggingface.co/princepride/BAGEL-7B-MoT
- Vision general del modelo base: https://www.aimodels.fyi/models/huggingFace/bagel-7b-mot-bytedance-seed
- Descripcion de la arquitectura BAGEL: https://deepwiki.com/sen-ye/R3/2-core-architecture:-bagel-7b-mot-model
