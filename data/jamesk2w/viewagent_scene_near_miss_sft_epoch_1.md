# JamesK2W/viewagent_scene_near_miss_sft_epoch_1

## Resumen

viewagent_scene_near_miss_sft_epoch_1 es un checkpoint de ajuste supervisado (SFT) construido por el usuario JamesK2W a partir del modelo multimodal Qwen/Qwen3-VL-8B-Instruct. El modelo forma parte de la pipeline denominada ViewAgent GraphRL, orientada a la planificacion interactiva de vistas ("interactive view planning") sobre escenas de interior del conjunto de datos ScanNet. No se trata de un modelo de proposito general, sino de un artefacto de investigacion con un dominio de aplicacion muy acotado: decidir que vista observar a continuacion y razonar sobre escenas 3D representadas mediante multiples imagenes.

Tecnicamente es un transformer denso de vision-lenguaje de 8.767.123.696 parametros totales (aproximadamente 8,77 mil millones), heredado del modelo base Qwen3-VL-8B-Instruct, con pesos almacenados en safetensors y un repositorio de 17,5 GB, coherente con pesos en precision bf16/fp16. El ajuste se ha realizado sobre 1.024 demostraciones de tipo "scene_near_miss" generadas a partir de los rollouts de RL de la epoca 1, continuando desde esos mismos pesos (lo que la model card denomina "pipeline B").

Su relevancia es fundamentalmente metodologica: documenta un ciclo RL -> SFT iterativo sobre un modelo de vision-lenguaje aplicado a percepcion activa, y publica un unico dato de evaluacion, un pass@8 del 6,8 %. Al tener 0 descargas y 0 likes, y no haberse publicado resultados de benchmarks generales, debe considerarse un checkpoint experimental no validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de vision-lenguaje (Qwen3-VL); tag de libreria `qwen3_vl` |
| Parametros totales | 8.767.123.696 (aproximadamente 8,77 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen/Qwen3-VL-8B-Instruct) |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos en safetensors sin versiones cuantizadas publicadas |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`AutoModelForImageTextToText.from_pretrained`) |
| Tamano del repositorio | 17,5 GB |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct |
| Fecha de creacion / actualizacion | 22 de septiembre de 2026 (ambas) |
| Etiquetas | safetensors, qwen3_vl, viewagent, graphrl, region:us |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-VL-8B-Instruct, un transformer denso multimodal capaz de procesar imagenes y texto de forma conjunta y de generar texto condicionado por ambas modalidades. Este checkpoint no introduce cambios estructurales conocidos: se distribuye como un ajuste fino de los pesos del modelo base y se carga mediante `AutoModelForImageTextToText.from_pretrained`, lo que confirma que conserva la interfaz de modelo imagen-texto de la familia Qwen3-VL. La model card no detalla numero de capas, dimension oculta, numero de cabezas de atencion, resolucion de imagen soportada ni mecanismo de fusion vision-lenguaje.

En cuanto al entrenamiento, la informacion disponible es breve pero concreta: se partio de los pesos de RL de la epoca 1 del pipeline ViewAgent GraphRL y se realizo un SFT sobre 1.024 demostraciones de la categoria "scene_near_miss", construidas a partir de los propios rollouts de RL de esa epoca (variante "pipeline B"). El dominio de datos es ScanNet, es decir, escenas de interior con planificacion interactiva de vistas. No se especifican el numero total de tokens de entrenamiento, la composicion exacta del dataset, la receta de optimizacion (tasa de aprendizaje, epocas, precision) ni si se aplicaron tecnicas adicionales como RLHF, DPO o decodificacion especulativa. La unica metrica publicada es un pass@8 del 6,8 % en la evaluacion del pipeline.

## Capacidades

- Generacion de texto e interaccion multimodal imagen-texto, heredadas del modelo base Qwen3-VL-8B-Instruct.
- Razonamiento sobre multiples imagenes de una misma escena, necesario para la planificacion interactiva de vistas.
- Planificacion de vistas ("view planning"): seleccion de la siguiente observacion o camara dentro de una escena de interior.
- Reconocimiento de situaciones de casi-colision ("near miss"), que es la habilidad especificamente reforzada con las 1.024 demostraciones de SFT.
- Capacidad de producir rollouts de politica utilizables como datos para iteraciones posteriores de RL o SFT.
- Integracion con motores de inferencia de alto rendimiento: la model card indica que se sirve directamente con SGLang o vLLM.
- Soporte de tool calling / function calling, agentes y razonamiento multi-paso: no documentado en la informacion proporcionada (el modelo base podria soportarlo, pero este checkpoint no lo declara).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo "thinking", vision de video, audio u otras capacidades especiales: no documentadas para este checkpoint.

## Casos de uso

- Investigacion en planificacion activa de vistas: dado un conjunto de vistas de una escena de interior, el modelo puede emplearse para predecir la siguiente pose o camara a observar. Es exactamente la tarea sobre la que se ha ajustado, por lo que su uso mas realista es como sujeto de estudio y no como componente de produccion.
- Etiquetado de trayectorias con riesgo de casi-colision: las 1.024 demostraciones "scene_near_miss" permiten usar el checkpoint para marcar segmentos de navegacion en los que un agente pasa excesivamente cerca de un obstaculo, como paso previo a un analisis de seguridad en robotica movil de interior.
- Reproduccion del ciclo RL -> SFT (pipeline B): util para grupos que estudien como el SFT sobre rollouts de RL afecta a la politica resultante, comparando este checkpoint con los pesos de RL de la epoca 1 de los que deriva.
- Generacion de datos sinteticos para entrenamiento: los rollouts del modelo sobre escenas ScanNet pueden filtrarse por exito (pass@8) y reutilizarse como nuevas demostraciones en iteraciones sucesivas del pipeline.
- Punto de partida para ajustes especificos de dominio: al ser un modelo de 8,77 mil millones de parametros con licencia Apache-2.0, puede servir como inicializacion para SFT adicional sobre otras tareas de razonamiento espacial o de interiorismo.
- Evaluacion comparativa de politicas de percepcion activa: el pass@8 del 6,8 % actua como linea base medible frente a otras politicas de planificacion de vistas o frente al propio modelo base Qwen3-VL-8B-Instruct.
- Analisis de robustez de modelos de vision-lenguaje en dominios estrechos: permite medir cuanto se degradan las capacidades generales del modelo base tras un SFT muy especializado con solo 1.024 ejemplos.
- Desarrollo de agentes embodied que decidan donde mirar: como componente de un bucle de decision (observar, razonar, actuar) en simuladores de interior, siempre con validacion previa por el bajo rendimiento reportado.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Evaluacion del pipeline ViewAgent (pass@8) | 6,8 % | Unico dato publicado por el autor en la model card; no se detalla el conjunto de evaluacion exacto, el numero de tareas ni el protocolo de muestreo |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, MMMU, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: los pesos ocupan aproximadamente 17,5 GB (coincide con el tamano del repositorio), por lo que se necesitan del orden de 20-24 GB teniendo en cuenta cache KV y activaciones; con entradas de multiples imagenes (escenas ScanNet con varias vistas) la cache KV y los tokens visuales pueden crecer de forma notable.
- VRAM en cuantizacion int8: estimacion de 9-10 GB solo de pesos, en torno a 12-14 GB en total.
- VRAM en cuantizacion int4: estimacion de 5-6 GB solo de pesos, en torno a 8-10 GB en total; no se publican pesos cuantizados en el repositorio, habria que generarlos.
- GPU recomendadas: A100 40 GB, H100 80 GB, L40S 48 GB o A6000 48 GB para bf16 sin margen ajustado. Una RTX 4090 (24 GB) puede ejecutar bf16 de forma muy justa, con lotes pequenos y limitando el numero de imagenes por peticion.
- Cabe en GPU de consumo: si, con matices. RTX 4090/3090 (24 GB) en bf16 con margen escaso; RTX 4080/4070 Ti (12-16 GB) requiere cuantizacion int8 o int4; tarjetas de 8 GB solo con int4 y resoluciones de imagen reducidas.
- Opciones de despliegue: SGLang y vLLM estan indicados explicitamente por el autor como servidores compatibles. llama.cpp, Ollama o TGI serian viables tecnicamente, pero el repositorio no incluye pesos GGUF ni configuracion especifica, por lo que requeririan conversion y validacion propias.
- Latencia y throughput: no disponibles; el autor no publica cifras de latencia, tokens por segundo ni rendimiento por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|
| viewagent_scene_near_miss_sft_epoch_1 | 8,77 mil millones | No disponible | Apache-2.0 | pass@8 6,8 % en la evaluacion del pipeline | HuggingFace, 0 descargas |
| Qwen/Qwen3-VL-8B-Instruct (modelo base) | Aproximadamente 8 mil millones | No disponible en esta ficha | Apache-2.0 | No disponible en esta ficha | HuggingFace |
| Qwen2.5-VL-7B-Instruct | Aproximadamente 7 mil millones | No disponible en esta ficha | Apache-2.0 | No disponible en esta ficha | HuggingFace |
| InternVL3-8B | Aproximadamente 8 mil millones | No disponible en esta ficha | Apache-2.0 | No disponible en esta ficha | HuggingFace |

La comparacion relevante es con el propio modelo base: este checkpoint anade una especializacion estrecha en planificacion de vistas y "near miss" sobre ScanNet, a cambio de un rendimiento absoluto bajo en su propia metrica (6,8 % de pass@8). No se dispone de datos que permitan afirmar si conserva las capacidades generales de Qwen3-VL-8B-Instruct.

## Limitaciones y advertencias

- Rendimiento bajo en la tarea objetivo: el propio autor reporta un pass@8 del 6,8 %, lo que implica que mas de nueve de cada diez intentos de muestreo no aciertan.
- SFT con solo 1.024 demostraciones: un volumen muy reducido, procedente ademas de una unica epoca de RL, lo que limita la generalizacion y favorece el sobreajuste a la distribucion de esas demostraciones.
- Dominio cerrado: el entrenamiento se ha realizado sobre ScanNet, es decir, escenas de interior concretas; no hay evidencia de que funcione en exteriores, otras camaras, otras resoluciones o dominios visuales distintos.
- Riesgo de olvido catastrofico: al partir de pesos ya ajustados por RL y aplicar un SFT estrecho, es probable que las capacidades generales de conversacion, codigo o conocimiento del modelo base se hayan degradado; no hay evaluaciones que lo confirmen o desmientan.
- Alucinacion: no se han publicado estudios de fidelidad factual ni de calibracion para este checkpoint; en tareas de decision espacial, una alucinacion puede traducirse directamente en una accion erronea.
- Idiomas y contexto: se desconoce el soporte multilingue real y la longitud de contexto efectiva tras el ajuste, ya que no se documentan en la model card.
- Licencia: los pesos se publican bajo Apache-2.0, lo que en principio permite uso comercial, pero el entrenamiento se ha realizado sobre ScanNet, cuyos terminos de uso son independientes y deben revisarse antes de cualquier explotacion comercial o redistribucion de datos derivados.
- Sin validacion por la comunidad: 0 descargas y 0 likes, sin pipeline declarado en HuggingFace y sin publicacion asociada; no debe desplegarse en produccion sin una evaluacion propia exhaustiva.
- Sin pesos cuantizados oficiales ni ficha de consumo de recursos, lo que anade trabajo de ingenieria para cualquier despliegue en hardware limitado.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/JamesK2W/viewagent_scene_near_miss_sft_epoch_1
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- SGLang (servidor de inferencia mencionado por el autor): https://github.com/sgl-project/sglang
- vLLM (servidor de inferencia mencionado por el autor): https://github.com/vllm-project/vllm
- ScanNet (conjunto de datos de escenas de interior referenciado en la model card): http://www.scan-net.org/
- Paper, blog o repositorio del pipeline ViewAgent GraphRL: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos trataban sobre gramatica sanscrita y no guardan relacion con la ficha.
