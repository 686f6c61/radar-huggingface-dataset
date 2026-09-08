# DeepCybo/PhysBrain1.5-2B

## Resumen

PhysBrain 1.5 es un modelo de lenguaje y visión (VLM) desarrollado por DeepCybo, en colaboración con Zhongguancun Academy y Zhongguancun Institute of Artificial Intelligence, orientado a la robótica y a la inteligencia física. Se presenta como una continuación de la línea PhysBrain, cuyo objetivo es transformar un VLM generalista en una base para la interacción con el entorno físico. La versión disponible en HuggingFace, PhysBrain1.5-2B, es un fine-tuning de Qwen/Qwen3-VL-2B-Instruct, con 2.161.610.752 parámetros.

El modelo unifica tres capacidades fundamentales en un único sistema: comprensión del mundo observado, generación de acciones dirigidas a objetivos y predicción de la evolución del entorno. Para ello, extiende el modelo base con tokens dedicados a acciones y estados visuales, de modo que las respuestas de lenguaje, los outputs espaciales, las trayectorias del end-effector y los estados futuros se representan como tokens discretos. Todo se aprende con el mismo backbone autoregresivo y un objetivo unificado de predicción del siguiente token, sin cabezales específicos por tarea. El tamaño de 2B lo hace ligero para VLM y adecuado para despliegues en robótica con recursos limitados.

La relevancia actual del modelo radica en su enfoque embodied, que permite pasar de la comprensión estática de imágenes al razonamiento espacial, la planificación de acciones y la predicción de estados futuros, una línea de investigación activa en IA para robots y agentes autónomos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model (VLM) basado en Qwen3-VL-2B-Instruct, con tokens de accion y estado visual anadidos |
| Parametros totales | 2.161.610.752 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

PhysBrain 1.5-2B parte de Qwen/Qwen3-VL-2B-Instruct y le incorpora un modulo de salida multimodal propio para tareas embodied. En lugar de usar cabezales separados para cada tarea, el modelo extiende el vocabulario del backbone con tokens especiales de accion (ActionPiece) y de estado visual (imagen RGB, mapa de profundidad y mascara de robot). Todos estos tokens se procesan como parte del mismo flujo autorregresivo, de forma que el modelo puede generar indistintamente respuestas de texto, estructuras espaciales, trayectorias de movimiento y predicciones de estados futuros. El README indica que todas las modalidades se aprenden conjuntamente bajo un objetivo unico de prediccion del siguiente token.

El modelo se define como un finetuning de Qwen3-VL-2B-Instruct, por lo que su arquitectura base es la de un transformer multimodal con un codificador visual y un decoder de lenguaje. En la informacion disponible no se detallan los datos de entrenamiento de la version 1.5, ni si se uso RLHF, DPO u otra tecnica de alineacion. Como contexto, el paper de PhysBrain (presentado originalmente con el nombre PhysBrain, sin el sufijo 1.5) describe un entrenamiento basado en datos egocentricos humanos, con el dataset E2E-3M mezclado con datos generales de vision-lenguaje. En ese trabajo, el backbone PhysBrain actua como System 2 de alto nivel razonador, mientras que un experto de acciones basado en Flow-Matching diffusion se usa como System 1 para el control de bajo nivel; esta distincion no se confirma para la version 1.5-2B en la informacion proporcionada.

## Capacidades

- Generacion de lenguaje y vision: permite formular instrucciones en texto y razonar sobre escenas visuales, empleando el modelo base Qwen3-VL-2B-Instruct.
- Comprension espacial y percepcion visual: conteo de objetos, relaciones espaciales, comparacion de profundidad relativa y estimacion metrica de tamaños.
- Razonamiento 3D y multi-view: estimacion de distancias absolutas, calculo de areas de salas y razonamiento de movimiento egocentrico bajo cambios de punto de vista.
- Cognicion embodied: descripcion de acciones pasadas, prediccion contrafactual de futuros, descomposicion de objetivos en pasos y estimacion del resultado de una tarea.
- Grounding espacial y affordance: localizacion puntual de objetos, identificacion de regiones objetivo y deteccion de affordances funcionales.
- Razonamiento de trayectorias y trazas visuales: generacion de waypoints para movimiento sin obstaculos, reordenamiento de objetos y trazas de manipulacion con contacto.
- Prediccion de acciones: dada una instruccion y la observacion actual, predice el siguiente chunk de acciones del end-effector como tokens ActionPiece, usando un codebook compartido entre configuraciones roboticas distintas.
- Prediccion de estado futuro: genera una imagen RGB, un mapa de profundidad y una mascara del robot correspondientes a un estado futuro (un segundo despues) dada la observacion actual y la instruccion.
- Idiomas: ingles y chino. No se menciona soporte de tool calling ni function calling en la informacion disponible.

## Casos de uso

- Control de brazos roboticos en manipulacion: el modelo recibe la instruccion de tarea y la observacion visual, y genera la trayectoria del end-effector como tokens ActionPiece. Gracias al codebook compartido, el mismo checkpoint puede adaptarse a distintas plataformas roboticas sin necesidad de modelos especificos por robot.
- Prediccion de efectos en teleoperacion: antes de ejecutar una accion, el modelo puede simular el estado futuro (imagen, profundidad y mascara del robot) y asi evaluar mentalmente el resultado de la accion. Esta capacidad es util para planificar movimientos seguros en entornos nosocomiales o de ensamblaje.
- Navegacion de robots moviles en interiores: genera waypoints para evitar obstaculos y razona sobre trayectorias visuales, lo que permite planificar rutas en almacenes, hospitales o viviendas sin necesidad de mapas previos.
- Reordenamiento de objetos en almacenes: la combinacion de percepcion espacial, grounding y trazas de manipulacion permite identificar objetos a reordenar, localizar su posicion actual y planificar la trayectoria de agarre para depositarlos en la zona objetivo.
- Simulacion de tareas en entornos virtuales: los benchmarks de razonamiento espacial y planificacion permiten usar el modelo como componente de alto nivel para politicas de bajo nivel en simuladores, reduciendo la necesidad de recopilar datos fisicos costosos.
- Interaccion humano-robot: al comprender acciones pasadas y predecir acciones futuras, el modelo puede anticipar intenciones humanas en tareas colaborativas, por ejemplo en ensamblaje asistido o en rehabilitacion, donde el robot adapta su movimiento segun la accion observada del humano.
- Inspeccion visual en lineas de produccion: la estimacion de profundidad relativa y la deteccion de affordances permiten identificar piezas mal colocadas, medir distancias y determinar si una herramienta es apta para una funcion concreta en un puesto de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para PhysBrain 1.5-2B en la informacion disponible. La model card indica que la variante de 8B (PhysBrain 1.5-8B) alcanza una puntuacion media de 72,5 en una suite de 28 benchmarks de comprension espacial y planificacion embodied, situandose en primer lugar entre los modelos open-source evaluados y con un rendimiento comparable al de modelos propietarios. La columna correspondiente a la version 2B se muestra en las figuras del README "como referencia" y se excluye del ranking open-source, sin que se faciliten valores numericos concretos en el texto de la ficha.

## Requisitos de hardware

- Los pesos se publican en formato safetensors. El repositorio ocupa 4,3 GB, lo que indica pesos en su mayoria en precision FP16 o BF16.
- VRAM estimada para inferencia: entre 6 y 8 GB para una longitud de contexto moderada, dependiendo del backend y del numero de tokens de imagen y de estado visual. Con una quantizacion de 8 bits o 4 bits, que no esta publicada en el repositorio, la VRAM podria reducirse a 4-5 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o A10 para inferencia local; A100 o H100 para serving con mayor throughput.
- Si cabe en GPU de consumidor: si, con 12 GB de VRAM en FP16 o con 8 GB si se realiza una cuantizacion adicional por parte del usuario.
- Opciones de despliegue: al ser un modelo safetensors de tipo image-text-to-text, es compatible con backends de inferencia para VLM como vLLM, TGI o Hugging Face Transformers. Tambien puede convertirse a GGUF para usarlo con llama.cpp, aunque no se proporcionan dichos pesos en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de tablas comparativas publicadas en la informacion disponible. Como referencia, el modelo base es Qwen/Qwen3-VL-2B-Instruct, del cual hereda el backbone de lenguaje y vision. La diferencia principal de PhysBrain 1.5-2B es la incorporacion de tokens de accion y estado visual, que lo convierten en un modelo especializado para tareas embodied, mientras que el base es un VLM generalista sin esas capacidades. No se aportan datos de otros modelos de la misma categoria en los materiales consultados.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos en la informacion disponible; el modelo puede heredar sesgos del modelo base Qwen3-VL-2B-Instruct.
- El riesgo de alucinacion no esta cuantificado. Al igual que otros VLM, puede generar predicciones de estado futuro o de trayectorias que no corresponden con la realidad fisica.
- El modelo solo soporta ingles y chino en la configuracion publicada, lo que limita su uso en idiomas como el castellano.
- La licencia no esta especificada, por lo que no se puede garantizar la idoneidad para uso comercial sin consultar al autor.
- No se detallan los datos de entrenamiento ni las tecnicas de alineacion, lo que dificulta evaluar la robustez del modelo en produccion.
- Los resultados de benchmarks se reportan solo para la variante de 8B. La version de 2B queda excluida del ranking, por lo que su rendimiento es presumiblemente inferior.
- La longitud de contexto no se indica en la model card, lo que impide fijar limites concretos de memoria o de secuencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DeepCybo/PhysBrain1.5-2B
- Paper de PhysBrain: https://arxiv.org/html/2512.16793v1
- Pagina del proyecto PhysBrain: https://zgc-embodyai.github.io/PhysBrain/
