# Myungkyu/rldx_1_rmbench_preset_luna_b64_60k

## Resumen

rldx_1_rmbench_preset_luna_b64_60k es una politica de bajo nivel (low-level policy) para robotica, publicada por el usuario Myungkyu en HuggingFace. Se trata de un ajuste fino (fine-tuning) del modelo base RLWRLD/RLDX-1-PT sobre el dataset Myungkyu/RMBench-preset-luna, compuesto por demostraciones con etiquetas densas de subtareas procedentes del preset de subtareas de RMBench. El modelo esta especializado en las 9 tareas de mesa simuladas que define RMBench, y no en proposito general.

Tecnicamente es un modelo de vision-lenguaje-accion (VLA): recibe imagenes de tres camaras (cabeza y munecas izquierda y derecha), propiocepcion y el texto de la subtarea actual, y produce acciones de control. Segun la model card, sigue la arquitectura del backbone RLDX-1-PT, con una longitud de video de 4 y un slot adicional de keyframe que recibe un fotograma pasado recuperado cuando la etiqueta lo requiere.

El checkpoint publicado es el final de un entrenamiento de 60.000 pasos con batch de optimizador 64 (de ahi el sufijo `b64_60k`). Cuenta con 6.912.896.320 parametros (aproximadamente 6,91 mil millones) almacenados en safetensors, con un repositorio de 13,8 GB. Resulta relevante por ser un ejemplo de reutilizacion de un backbone VLA preentrenado para una suite de evaluacion concreta de manipulacion de mesa, aunque su utilidad fuera de RMBench no esta documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) basada en el backbone RLDX-1-PT; longitud de video 4, tres vistas de camara mas un slot de keyframe. Estructura interna detallada no disponible |
| Parametros totales | 6.912.896.320 (6,91 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card solo especifica longitud de video 4) |
| Tipos de cuantizacion | no disponible; el repositorio contiene pesos en safetensors sin variantes cuantizadas publicadas |
| Idiomas soportados | no disponible; la entrada incluye texto de subtarea, pero no se declara cobertura multilingue |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repositorio: 13,8 GB) |
| Modelo base | RLWRLD/RLDX-1-PT (fine-tuning) |
| Dataset de entrenamiento | Myungkyu/RMBench-preset-luna |
| Entradas | Imagenes de cabeza + muneca izquierda + muneca derecha, propiocepcion, texto de la subtarea actual, y keyframe recuperado cuando la etiqueta lo indica |
| Pipeline declarado | robotics |
| Configuracion de entrenamiento | Batch de optimizador 64, 60.000 pasos, checkpoint final |
| Dominio | 9 tareas de mesa simuladas de RMBench |

## Arquitectura y entrenamiento

La informacion disponible describe un modelo de vision-lenguaje-accion construido sobre el backbone RLDX-1-PT. La model card indica explicitamente que la arquitectura es la de RLDX-1-PT, con longitud de video 4 y cuatro entradas visuales: tres vistas de camara (cabeza, muneca izquierda y muneca derecha) mas un slot de keyframe que se rellena con un fotograma pasado recuperado cuando la etiqueta de la subtarea lo requiere. No se detalla en la informacion proporcionada si el backbone es un transformer denso, un MoE o una arquitectura hibrida, ni el numero de capas, dimensiones ocultas o mecanismo de atencion.

El entrenamiento consiste en un ajuste fino supervisado sobre el dataset Myungkyu/RMBench-preset-luna, con demostraciones anotadas con etiquetas densas de subtareas generadas a partir del preset de subtareas. La configuracion reportada es batch de optimizador 64 y 60.000 pasos, y el artefacto publicado es el checkpoint final. No se menciona en la informacion disponible el uso de RLHF, DPO, RL u otras tecnicas de alineacion posteriores al ajuste supervisado, ni el volumen de datos (numero de episodios o de tokens) empleado.

Un detalle operativo relevante: la model card advierte que las configuraciones referencian el backbone y el tokenizer del modelo base por identificador de hub o por una ruta local del sitio de entrenamiento, por lo que es necesario apuntarlas a copias locales antes de cargar el modelo.

## Capacidades

- Generacion de acciones de control de bajo nivel para manipulacion robotica en tareas de mesa, a partir de observaciones visuales, propiocepcion e instrucciones textuales de subtarea.
- Percepcion multimodal con tres vistas de camara simultaneas (cabeza, muneca izquierda, muneca derecha), lo que aporta informacion egocentrica y de contacto.
- Uso de memoria visual a corto plazo mediante el slot de keyframe, que incorpora un fotograma pasado recuperado cuando la etiqueta lo requiere.
- Seguimiento de subtareas etiquetadas de forma densa: el modelo esta entrenado con la estructura de subtareas del preset de RMBench, lo que le permite condicionar la accion al texto de la subtarea en curso.
- Cobertura de 9 tareas de mesa simuladas de RMBench (el listado concreto de tareas no esta en la informacion proporcionada).
- Soporte de tool calling / function calling: no disponible, no aplica a un modelo de politica robotica.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; la descomposicion en subtareas proviene del etiquetado del dataset, no de un planificador propio.
- Capacidades multilingues: no disponible.
- Capacidades especiales: ninguna adicional declarada mas alla del slot de keyframe y la condicion por subtarea.

## Casos de uso

- Evaluacion de politicas en RMBench: el modelo esta entrenado especificamente sobre el preset de subtareas de RMBench, por lo que sirve como referencia de bajo nivel para comparar variantes de backbone o de esquemas de etiquetado dentro de esa misma suite de 9 tareas.
- Manipulacion de mesa en simulacion: sirve para ejecutar tareas de recogida y colocacion sobre superficie plana con retroalimentacion visual de tres camaras y propiocepcion, dentro de un entorno simulado compatible con las observaciones de RMBench.
- Investigacion en condicionamiento por lenguaje de subtarea: al recibir el texto de la subtarea actual, permite estudiar como afecta la granularidad del etiquetado denso al exito de la tarea frente a politicas entrenadas sin ese condicionamiento.
- Ablacion del slot de keyframe: la arquitectura incluye un slot dedicado a un fotograma pasado recuperado; resulta util para medir el impacto de la memoria visual a corto plazo en tareas que requieren recordar estados previos.
- Generacion de datos sinteticos de manipulacion: las trayectorias producidas pueden emplearse como datos de arranque o como linea base para filtrar episodios antes de entrenar politicas mayores.
- Base para posteriores ajustes finos: al ser un fine-tuning de RLDX-1-PT, puede actuar como punto de partida (inicializacion) para nuevas especializaciones sobre otros datasets de manipulacion con observaciones similares.
- Reproduccion de experimentos de fine-tuning de VLAs: la configuracion reportada (batch 64, 60.000 pasos, checkpoint final) permite reproducir o escalar el regimen de entrenamiento para estudiar sensibilidad de hiperparametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, retornos medios ni comparaciones numericas con otras politicas sobre RMBench. El nombre del repositorio indica que el modelo se evalua o se entrena en RMBench, pero no se aporta ninguna metrica concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aritmetica a partir del numero de parametros (6,91 mil millones) y del tamano del repositorio (13,8 GB), los pesos en precision de 16 bits ocupan aproximadamente 13,8 GB; en precision de 32 bits, en torno a 27,6 GB; en 8 bits, unos 7 GB; y en 4 bits, unos 3,5 GB. Son calculos estimados, no datos publicados.
- A esas cifras hay que sumar el coste de las activaciones y de las entradas visuales (tres vistas de camara mas el keyframe, con longitud de video 4), que no esta cuantificado en la informacion disponible.
- GPU recomendadas: no disponible. Por tamano, el modelo en 16 bits encaja con holgura en A100 80 GB, H100 80 GB y A100 40 GB; en 8 bits podria encajar en GPUs de 16-24 GB.
- Cabe en GPU de consumo: probablemente si en RTX 4090 (24 GB) u otras GPUs de 24 GB usando precision de 16 bits justa o cuantizacion, aunque no hay confirmacion oficial. En GPUs de 8-12 GB requeriria cuantizacion agresiva no publicada.
- Opciones de despliegue: no disponible. Los pipelines tipicos para modelos de robotica (servidores de inferencia propios, integracion con el simulador de RMBench) no se documentan en la model card. No se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no son directamente aplicables a un modelo de politica que emite acciones.
- Latencia y throughput: no disponibles. Para una politica de control, la frecuencia de inferencia es un parametro critico, pero no se especifica en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados ni especificaciones de modelos comparables, y no se aportan metricas de RMBench que permitan situar esta politica frente a otras. El unico punto de referencia documentado es el propio modelo base, RLWRLD/RLDX-1-PT, del que este checkpoint es un fine-tuning especializado.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rldx_1_rmbench_preset_luna_b64_60k | 6,91 mil millones | no disponible | no disponible | no disponible | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| RLWRLD/RLDX-1-PT (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace, referenciado como base |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta ajustado sobre el preset de subtareas de RMBench (9 tareas de mesa simuladas). Su comportamiento fuera de ese conjunto de tareas o fuera del simulador no esta documentado y no deberia asumirse.
- Dependencia de rutas y del modelo base: la model card advierte que las configuraciones referencian el backbone y el tokenizer por identificador de hub o por una ruta local del sitio de entrenamiento; es necesario apuntarlas a copias locales antes de cargar el modelo, lo que puede provocar fallos de carga si no se ajusta.
- Licencia no disponible: al no declararse licencia, no puede confirmarse si se permite el uso comercial. Conviene contactar con el autor antes de cualquier uso en produccion.
- Idiomas no disponibles: no se declara que el condicionamiento textual por subtarea funcione en castellano ni en ningun idioma concreto; el texto de subtarea proviene del preset de RMBench.
- Sesgos conocidos: no disponible. No hay documentacion sobre sesgos de percepcion, sesgos hacia las condiciones visuales del simulador ni sobre generalizacion entre tareas.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto libre, pero si existe riesgo de acciones incoherentes o fuera de distribucion cuando la observacion se aleja de las condiciones de entrenamiento (iluminacion, oclusiones, objetos no vistos).
- Limitaciones de contexto: no se especifica longitud de contexto; la unica restriccion conocida es la longitud de video 4 y el uso de un unico fotograma clave recuperado.
- Ausencia de benchmarks: sin tasas de exito publicadas, no es posible estimar la fiabilidad del checkpoint para produccion ni compararlo con alternativas.
- Madurez y soporte: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se aportan papers, demos ni repositorio de codigo asociados, por lo que el soporte de la comunidad es inexistente.
- Advertencia sobre la busqueda web: los resultados de busqueda disponibles no guardan ninguna relacion con el modelo (corresponden a suplementos de omega 3), por lo que no aportan informacion verificable sobre esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/rldx_1_rmbench_preset_luna_b64_60k
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/RMBench-preset-luna
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Papers, blogs, repositorios o demos adicionales: no disponibles en la informacion proporcionada.
