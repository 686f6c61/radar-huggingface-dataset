# Shiki42/s016-sortblocks-ctr-nomask-act-step100000

## Resumen

Este repositorio contiene un checkpoint de inferencia de ACT (Action Chunking Transformer), la política de imitación distribuida con LeRobot 0.4.4, publicado por el usuario Shiki42 el 23 de septiembre de 2026. No es un modelo de lenguaje: es una política robotica entrenada por imitacion para una tarea concreta de ordenado de bloques ("sort blocks"), con 51.633.806 parametros (~51,6 M) y pesos en formato safetensors. El checkpoint corresponde al paso 100.000 de un entrenamiento con tamano de lote 8 y semilla 87431, dentro del run registrado S016 E770 / E770-R001.

El interes tecnico del artefacto esta en que no es un checkpoint "final" al uso, sino el resultado de una ablacion registrada: la variante CTR sin IdleMask desactiva el consumo de `observation.arm_active_mask` en la funcion de perdida de acciones, manteniendo el relleno temporal ordinario. Esto lo convierte en material util para estudiar como afecta la mascara de brazo activo al comportamiento de una politica ACT en tareas de manipulacion con fases inactivas, y para comparar contra la variante que si la consume.

La relevancia practica es limitada pero clara: se trata de un checkpoint solo de inferencia, verificado mediante restauracion en CPU en proceso nuevo (los 234 tensores del modelo se restauraron exactamente y se recupero la configuracion del procesador), con una accion determinista generada a partir de una muestra real del dataset fijado. El propio autor advierte que la suite de escenas held-out S016 y el adaptador de evaluacion ACT aun no estan cualificados, por lo que no se emite ninguna afirmacion de tasa de exito ni de tasa de colision. La licencia y los idiomas no estan declarados en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con CVAE, segun la implementacion oficial de LeRobot 0.4.4 |
| Parametros totales | 51.633.806 (~51,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no declarada en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no documenta variantes cuantizadas) |
| Idiomas soportados | no disponible (no aplica: es una politica de control robotico, no un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (incluye parametros de inferencia, configuracion y estado de pre/postprocesado) |
| Tamano del repositorio | 0,2 GB |
| Paso de entrenamiento | 100.000 (checkpoint final) |
| Tamano de lote / semilla | 8 / 87431 |
| Dataset de entrenamiento | Shiki42/ctr-sortblocks-100ep-ctr, revision 9ee0f9d8e0700df5fac08454e7e213c4904d3024 (100 episodios, 68.438 frames) |
| Commits de referencia | CTR: 335ad0e01f4cf5b9915d8e2eea00554c1c78d6ce; LeRobot: 8fff0fde7c79f23a93d845d1a50e985de01f8b8a |
| Manifiesto de runtime | SHA-256 cdf763fd150ddc0229d3aafa3d03e4aca596e8c8be145ebacbb2b1ab1ba23f2e |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una politica de imitacion basada en transformer que predice bloques de acciones futuras en lugar de una sola accion por paso, lo que reduce el error de composicion acumulado en tareas de manipulacion de horizonte largo. La model card indica explicitamente que se usa la implementacion oficial de LeRobot 0.4.4, con un commit de referencia fijado, y que el artefacto es un checkpoint de inferencia que excluye estado de optimizador, RNG y cualquier otro dato necesario para reanudar el entrenamiento.

El entrenamiento se realizo por aprendizaje por imitacion supervisada sobre 100 episodios (68.438 frames) de una tarea de ordenado de bloques, durante 100.000 pasos con tamano de lote 8 y semilla 87431. No hay indicios de RLHF, DPO ni aprendizaje por refuerzo en la informacion proporcionada. La innovacion concreta de esta publicacion es la ablacion: la variante "CTR without IdleMask" desactiva el consumo de `observation.arm_active_mask` en la perdida de acciones; el relleno temporal ordinario se mantiene. El autor no define en la model card que significa la sigla CTR mas alla de referenciar el commit de origen, por lo que el significado exacto del acronimo queda como no disponible.

En cuanto a la validacion, se ejecuto una restauracion en CPU en proceso nuevo que verifico exactamente los 234 tensores del modelo y reconstruyo la configuracion del procesador. Sobre esa base se genero una accion determinista a partir de una muestra real del dataset fijado. La suite de escenas held-out S016 y el adaptador de evaluacion ACT no estan cualificados, de modo que no existe ninguna cifra de exito ni de colision declarada por el autor.

## Capacidades

- Generacion de secuencias de acciones (chunks) para control de un robot manipulador a partir de observaciones, en el marco de la API de ACT de LeRobot 0.4.4.
- Ejecucion de la tarea especifica de ordenado de bloques ("sort blocks") sobre la que fue entrenado, con el mismo tipo de escena, camara y espacio de acciones del dataset Shiki42/ctr-sortblocks-100ep-ctr.
- Inferencia determinista: el autor documenta la produccion de una accion determinista a partir de una muestra real, lo que permite reproducibilidad bit a bit bajo el manifiesto SHA-256 publicado.
- Entrada multimodal de robotica: observaciones visuales y de estado del robot, con `observation.arm_active_mask` presente en el espacio de observacion aunque esta variante no la consuma en la perdida.
- Funcionamiento como pieza de una ablacion: sirve para comparar el efecto de ignorar la mascara de brazo activo frente a la variante que si la utiliza.
- No soporta tool calling ni function calling: no es un modelo de lenguaje ni un agente conversacional.
- No soporta razonamiento multi-paso en lenguaje natural, ni generacion de codigo, ni matematicas simbolicas, ni vision por si misma fuera del uso como entrada de politica.
- No tiene capacidades multilingues: no procesa texto de usuario.
- No incorpora modo "thinking", ni salida de audio, ni ninguna capacidad generativa de proposito general.

## Casos de uso

- Reproduccion de la ablacion IdleMask: cargar este checkpoint y el equivalente con mascara activa, ejecutar ambos sobre el mismo conjunto de escenas y medir la diferencia de comportamiento en los tramos donde un brazo permanece inactivo. El valor esta en que la unica variable modificada es el consumo de `observation.arm_active_mask` en la perdida.
- Verificacion de integridad de artefactos: usar el manifiesto SHA-256 y la restauracion en CPU documentada como prueba de regresion en un pipeline de publicacion de checkpoints, comprobando que los 234 tensores y la configuracion del procesador se recuperan exactamente.
- Base de fine-tuning para pick-and-place: al ser un ACT de ~51,6 M de parametros con pesos de inferencia completos, puede servir como inicializacion para reentrenar sobre un dataset propio de recogida y colocacion con la misma estructura de observaciones y acciones.
- Banco de pruebas de latencia en hardware de borde: el tamano reducido permite medir el coste de un ciclo completo de politica ACT (codificacion de imagen, muestreo del CVAE y decodificacion del chunk de acciones) en GPUs integradas o en CPU, algo inviable con politicas VLA de mayor tamano.
- Docencia de aprendizaje por imitacion: el repositorio incluye un dataset publico fijado por revision, un run identificado, semilla, tamano de lote y manifiesto de runtime, lo que lo convierte en un ejemplo reproducible para explicar el ciclo completo de entrenamiento, publicacion y restauracion de una politica robotica.
- Comparacion de estrategias de enmascarado en manipulacion bimanual: en escenarios donde un brazo no participa en la tarea, esta variante permite cuantificar si ignorar la mascara degrada la precision del brazo que si actua o si introduce acciones parásitas en el brazo inactivo.
- Punto de partida para pipelines de evaluacion en simulacion: aunque la suite held-out no este cualificada, el checkpoint puede conectarse a un adaptador de evaluacion propio para medir tasa de exito en escenas equivalentes a las del dataset original.
- Componente de un stack LeRobot en robot real: desplegable como politica de control dentro del runtime de LeRobot, sujeto a la validacion previa en el hardware concreto y a la comprobacion de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la suite de escenas held-out S016 y el adaptador de evaluacion ACT no estan cualificados y que no se emite ninguna afirmacion de tasa de exito ni de tasa de colision. La unica evidencia de funcionamiento reportada es cualitativa: restauracion exacta de los 234 tensores en CPU y generacion de una accion determinista a partir de una muestra real del dataset fijado. No se dispone de datos de MMLU, HumanEval, GSM8K ni de metricas de robotica como tasa de exito por episodio, error de posicion o tasa de colision.

## Requisitos de hardware

- VRAM estimada por los pesos, calculada a partir de los 51.633.806 parametros (estimacion propia, no publicada por el autor): ~207 MB en fp32, ~103 MB en fp16/bf16 y ~52 MB en int8. A esto hay que sumar el estado del procesador, la cache del CVAE y las activaciones del decodificador, no cuantificadas en la informacion disponible.
- Tamano total del repositorio: 0,2 GB, lo que incluye pesos, configuracion y estado de pre/postprocesado.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas. Tambien es viable la inferencia en CPU, como demuestra la restauracion en CPU documentada por el autor.
- GPU de datacenter (A100, H100) no son necesarias para este modelo; su uso solo tendria sentido para ejecutar muchos rollouts en paralelo o para entrenamiento, no para inferencia de un unico agente.
- Opciones de despliegue: el artefacto esta pensado para el runtime de LeRobot 0.4.4 (PyTorch) con su procesador de pre/postprocesado asociado y un manifiesto de runtime bloqueado por SHA-256. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que son stacks de modelos de lenguaje y no aplican a una politica ACT.
- Latencia y throughput: no disponible. No se han publicado mediciones de frecuencia de control, tiempo por chunk de acciones ni rendimiento en frames por segundo.

## Comparativa con modelos similares

No se dispone de datos verificados de parametros, contexto o rendimiento de los modelos alternativos en la informacion proporcionada, por lo que la comparacion numerica queda como no disponible. La comparacion cualitativa por categoria es la siguiente:

| Modelo | Parametros | Tipo de politica | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shiki42/s016-sortblocks-ctr-nomask-act-step100000 | 51,6 M | ACT (variante CTR sin IdleMask) | 100 episodios / 68.438 frames de sort blocks | no disponible | safetensors, solo inferencia |
| ACT de referencia en LeRobot 0.4.4 | no disponible en la informacion | ACT con mascara de brazo activo | no disponible | no disponible | no disponible |
| Diffusion Policy | no disponible en la informacion | politica por difusion de acciones | no disponible | no disponible | no disponible |
| SmolVLA | no disponible en la informacion | VLA (vision-lenguaje-accion) | no disponible | no disponible | no disponible |

Diferencias cualitativas relevantes: ACT predice un chunk de acciones con un transformer y un CVAE, mientras que Diffusion Policy genera acciones mediante un proceso de difusion y los enfoques VLA incorporan un modelo de lenguaje como columna vertebral, lo que implica ordenes de magnitud mas de parametros y requisitos de hardware mayores. Este checkpoint concreto se diferencia del ACT de referencia unicamente en el tratamiento de `observation.arm_active_mask` en la perdida, no en la arquitectura. Los resultados de la busqueda web realizada no contienen ninguna referencia a este modelo ni a modelos comparables (los enlaces devueltos tratan sobre la revalorizacion de pensiones en la Republica Checa y no guardan relacion con el artefacto).

## Limitaciones y advertencias

- Ausencia de evaluacion held-out: el autor declara que la suite S016 y el adaptador de evaluacion ACT no estan cualificados y que no se reclama ninguna tasa de exito ni de tasa de colision. No debe presentarse como politica validada.
- Licencia no declarada: la model card y los metadatos de HuggingFace no indican licencia. Sin una licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion, por lo que es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Sesgo de dominio severo: entrenado sobre 100 episodios de una unica tarea, con un unico montaje de camara y un unico espacio de acciones. Es esperable un comportamiento degradado ante cambios de iluminacion, posicion de camara, tipo de bloque, mesa o robot.
- Riesgo de acciones fuera de distribucion: al no ser un modelo generativo de texto, no "alucina" en el sentido linguistico, pero puede producir trayectorias incoherentes o inseguras cuando la observacion se aleja de la distribucion de entrenamiento. En un robot real esto implica riesgo fisico y requiere paradas de emergencia.
- Efecto de la ablacion no cuantificado: la variante sin IdleMask ignora `observation.arm_active_mask` en la perdida, lo que puede traducirse en acciones residuales sobre brazos que deberian permanecer quietos. El autor no publica mediciones de este efecto.
- Checkpoint solo de inferencia: no incluye estado de optimizador ni de RNG, por lo que no permite reanudar el entrenamiento original, solo inferencia o fine-tuning desde cero del optimizador.
- Sin datos de idioma ni de texto: cualquier expectativa de uso conversacional, de tool calling o de generacion de codigo es inaplicable.
- Ambiguedad del termino CTR: la model card no define el acronimo, solo referencia el commit de origen, lo que dificulta auditar exactamente que cambios introduce respecto al ACT estandar de LeRobot.
- Cero traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin discusion publica ni issues que permitan contrastar el comportamiento real del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiki42/s016-sortblocks-ctr-nomask-act-step100000
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-sortblocks-100ep-ctr (revision 9ee0f9d8e0700df5fac08454e7e213c4904d3024)
- Repositorio LeRobot (implementacion oficial de ACT, commit de referencia 8fff0fde7c79f23a93d845d1a50e985de01f8b8a): https://github.com/huggingface/lerobot
- Paper de la arquitectura ACT (Zhao et al., "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware"): https://arxiv.org/abs/2304.13705
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante al modelo. Los resultados devueltos corresponden a paginas sobre la revalorizacion de pensiones en la Republica Checa (kurzy.cz, ceskeduchody.cz, e15.cz, arecenze.cz, davky.cz) y no guardan relacion con este artefacto.
