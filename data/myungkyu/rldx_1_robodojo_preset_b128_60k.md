# Myungkyu/rldx_1_robodojo_preset_b128_60k

## Resumen

rldx_1_robodojo_preset_b128_60k es una política robótica de bajo nivel (low-level policy) publicada por el usuario Myungkyu en HuggingFace. Se trata de un ajuste fino (finetune) del modelo base RLWRLD/RLDX-1-PT, un modelo de tipo VLA (vision-language-action), sobre el dataset Myungkyu/RoboDojo-preset-gemini, que contiene demostraciones con etiquetas densas de subtareas. El resultado es un checkpoint especializado en ocho tareas bimanuales de sobremesa de horizonte largo, con 100 demostraciones por tarea, ejecutadas en un robot real.

El modelo resuelve el problema de traducir observaciones multimodales (imágenes de tres cámaras, propiocepción y el texto de la subtarea actual) en acciones motoras de bajo nivel. Es relevante porque combina dos tendencias actuales en robótica con IA: los modelos fundacionales de visión-lenguaje-acción reutilizables mediante ajuste fino, y el entrenamiento con anotaciones densas de subtarea, que facilita el razonamiento multi-paso en tareas largas que un único bucle de política plana no resuelve bien.

No se dispone de información pública sobre la arquitectura interna detallada del backbone, el número de tokens de entrenamiento ni las características del dataset más allá de lo indicado en la model card. Los pesos ocupan 13,8 GB y suman 6.912.896.320 parámetros (aproximadamente 6,9 mil millones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RLDX-1-PT (modelo VLA, vision-language-action); detalles internos del backbone no disponibles |
| Parametros totales | 6.912.896.320 (aproximadamente 6,9 mil millones, segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la entrada de texto se limita al texto de la subtarea actual; longitud de video de 4 fotogramas) |
| Tipos de cuantizacion | no disponible (no se publican checkpoints cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,8 GB |
| Modelo base | RLWRLD/RLDX-1-PT |
| Dataset de ajuste fino | Myungkyu/RoboDojo-preset-gemini |
| Pipeline declarado | robotics |
| Entradas | imagenes de cabeza + muneca izquierda + muneca derecha, propiocepcion, texto de la subtarea actual (sin entrada de keyframe) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

La informacion disponible describe unicamente la configuracion de la arquitectura heredada del modelo base RLDX-1-PT: longitud de video 4, tres vistas de camara en vivo (cabeza, muneca izquierda y muneca derecha) y ausencia de ranura de keyframe (keyframe slot). El modelo consume imagenes, propiocepcion y el texto de la subtarea actual, y produce acciones de bajo nivel. No se detalla si el backbone es un transformer denso, una arquitectura hibrida o si incorpora mecanismos de atencion lineal, ni se especifica el tokenizador mas alla de que las configs lo referencian por identificador de hub o por ruta local del sitio de entrenamiento.

El entrenamiento consistio en un ajuste fino supervisado del modelo preentrenado RLWRLD/RLDX-1-PT sobre el dataset Myungkyu/RoboDojo-preset-gemini, compuesto por demostraciones de ocho tareas bimanuales de sobremesa con robot real, 100 demostraciones por tarea, y con etiquetas densas de subtarea derivadas del preset de subtareas. Los hiperparametros declarados son batch de optimizador 128 y 60.000 pasos, y el repositorio corresponde al checkpoint final. No se documenta el uso de RLHF, DPO ni de ninguna tecnica de alineacion adicional.

## Capacidades

- Ejecucion de politicas de manipulacion bimanual de bajo nivel en robot real, a partir de imagenes y propiocepcion.
- Percepcion multimodal con tres camaras simultaneas: vista de cabeza y vistas de ambas munecas, lo que permite control fino fuera del campo de vision frontal.
- Condicionamiento por lenguaje a nivel de subtarea: el texto de la subtarea actual actua como entrada, lo que permite segmentar una tarea de horizonte largo en pasos.
- Aprendizaje a partir de demostraciones con etiquetas densas de subtarea, lo que habilita el entrenamiento por fases dentro de una misma tarea.
- Cobertura de ocho tareas de sobremesa de horizonte largo en el dataset de ajuste.
- Integracion con el ecosistema de evaluacion RoboDojo.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso de tipo agente en el sentido de los modelos de lenguaje.
- No se documentan capacidades de audio, vision general de proposito abierto ni generacion de texto libre.

## Casos de uso

- Manipulacion bimanual de sobremesa en robot real: el modelo genera acciones de bajo nivel para tareas de horizonte largo en las que se necesita coordinar ambos brazos, usando las tres vistas de camara para resolver oclusiones parciales.
- Ensamblaje por fases: gracias a las etiquetas densas de subtarea y a la entrada de texto de subtarea, se puede dividir una tarea larga (por ejemplo, varias etapas de montaje) en pasos y cambiar el texto de subtarea en cada fase.
- Politica de referencia para investigacion en VLA: sirve como linea base reproducible de politica de bajo nivel sobre el dataset RoboDojo-preset-gemini para comparar variantes de arquitectura o de esquema de datos.
- Punto de partida para nuevos ajustes finos: al ser un finetune sobre RLDX-1-PT, puede reajustarse con demostraciones propias de un robot o una tarea concreta, partiendo de un checkpoint ya entrenado en tareas bimanuales.
- Investigacion sobre segmentacion de tareas: permite estudiar como influye el condicionamiento por subtarea en la estabilidad de la politica en horizontes largos, comparandolo con politicas planas sin texto de subtarea.
- Evaluacion comparativa de politicas en RoboDojo: util para medir transferencia entre tareas de sobremesa con configuraciones de camara equivalentes (cabeza mas dos munecas).
- Analisis de robustez perceptiva: al depender de vistas de muneca, permite estudiar el efecto de la oclusion, el desenfoque de movimiento y los cambios de iluminacion en el control de bajo nivel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 13,8 GB solo para pesos (coincide con el tamano del repositorio), mas memoria para activaciones y buffers de vision; en la practica se recomienda reservar entre 16 y 24 GB. Es una estimacion derivada del recuento de parametros, no un dato publicado.
- VRAM estimada en fp32: aproximadamente 27,7 GB. En int8, aproximadamente 6,9 GB; en int4, aproximadamente 3,5 GB (no se publican checkpoints cuantizados, por lo que estas cifras son estimaciones teoricas).
- GPU recomendadas: no hay recomendaciones publicadas. Por tamano, una GPU consumer de 24 GB (por ejemplo, RTX 4090 o RTX 3090) es la opcion mas ajustada para bf16; para fp32 o para lotes grandes conviene una GPU de centro de datos tipo A100 o H100.
- Cabe en GPU consumer: si, en bf16 en GPUs de 24 GB, siempre que el resto del pipeline (tres camaras, preprocesado de imagen, latencia de control) quepa en el presupuesto de memoria y de tiempo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. Al tratarse de un modelo VLA con salida de acciones y entrada de video, el despliegue esperado es un runtime de PyTorch junto al entorno del robot. Las configs del repositorio referencian el backbone y el tokenizador por identificador de hub o por ruta local, por lo que hay que apuntarlas a copias locales antes de cargar el modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de comparaciones publicadas por el autor. La tabla siguiente recoge solo los datos confirmados en la informacion proporcionada, junto con referencias genericas de la categoria VLA; los campos no verificados se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rldx_1_robodojo_preset_b128_60k | 6,9 mil millones | no disponible | no disponible | HuggingFace (0 descargas) |
| RLWRLD/RLDX-1-PT (modelo base) | no disponible | no disponible | no disponible | Referenciado como base en HuggingFace |
| Otros modelos VLA de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No se ha encontrado en la busqueda web informacion adicional sobre modelos comparables a este checkpoint concreto.

## Limitaciones y advertencias

- Especializacion estrecha: es una politica de bajo nivel ajustada para ocho tareas concretas de sobremesa; no es un modelo de proposito general y previsiblemente fallara fuera de esa distribucion de tareas.
- Sesgos: no se documenta ningun analisis de sesgos. Al entrenarse con 100 demostraciones por tarea en un unico entorno fisico, heredara los sesgos de posicion, iluminacion, materiales y estilo de demostracion de ese montaje.
- Riesgo de alucinacion: en modelos de accion el riesgo equivalente es la generacion de trayectorias plausibles pero fisicamente invalidas, especialmente fuera de la distribucion o cuando la subtarea indicada no coincide con el estado observado.
- Dependencia de la subtarea: la entrada de texto debe corresponder a la fase real de la tarea; un texto de subtarea incorrecto puede desviar la politica.
- Dependencia de configuracion: requiere tres camaras (cabeza mas dos munecas) y propiocepcion; cambiar la disposicion de camaras o el numero de vistas invalida la politica.
- Sin ranura de keyframe: la arquitectura declarada no admite entrada de keyframe, lo que limita estrategias de condicionamiento basadas en imagenes objetivo.
- Idioma: no se especifica que idiomas acepta el texto de subtarea; el dataset usa un preset, presumiblemente en ingles, pero no esta confirmado.
- Licencia no disponible: la ausencia de licencia explicita impide determinar si se permite el uso comercial. Debe aclararse con el autor y con el titular del modelo base antes de cualquier despliegue productivo.
- Trazabilidad limitada: 0 descargas y 0 likes, sin documentacion de evaluacion, sin benchmarks publicos y sin informe de rendimiento en el robot real.
- Reproducibilidad: las configs apuntan al backbone y al tokenizador por identificador de hub o por ruta local del sitio de entrenamiento, por lo que la carga requiere preparar copias locales; no se documentan versiones fijadas.
- Uso en produccion: no hay garantias de seguridad fisica. Cualquier despliegue en hardware real debe incorporar limites de par, paradas de emergencia y validacion humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/rldx_1_robodojo_preset_b128_60k
- Dataset de ajuste fino: https://huggingface.co/datasets/Myungkyu/RoboDojo-preset-gemini
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados devueltos corresponden a consultas no relacionadas sobre clientes de correo y no aportan informacion tecnica.
