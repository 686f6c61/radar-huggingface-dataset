# Myungkyu/pi0_5_robodojo_taco_visual2_b64_60k

## Resumen

pi0_5_robodojo_taco_visual2_b64_60k es un checkpoint de politica visuomotora de bajo nivel (vision-language-action, VLA) publicado por el usuario Myungkyu, obtenido por ajuste fino de `lerobot/pi05_base`, el modelo base Pi0.5 de la familia LeRobot. El modelo resuelve tareas de manipulacion bimanual de horizonte largo en mesa: segun la model card, se ha entrenado sobre ocho tareas reales con 100 demostraciones cada una, tomadas del dataset `Myungkyu/RoboDojo-taco-visual2-gemini`, que incorpora etiquetas densas de subtarea generadas por anotacion offline a partir de un contexto especifico de tarea.

Arquitectura Pi0.5 en su variante "vanilla": tres vistas de camara en vivo (cabeza y munecas izquierda y derecha), propiocepcion y el texto de la subtarea actual como entradas, sin ranura de keyframe y sin atestacion de memoria. El entrenamiento se realizo con tamano de lote 64 durante 60.000 pasos, y este repositorio contiene el checkpoint final. El recuento real de parametros en los ficheros safetensors es de 4.143.404.816 (aproximadamente 4,14 mil millones).

Su relevancia es acotada y de caracter investigador: se trata de un artefacto reproducible de ajuste fino de una politica VLA sobre un benchmark concreto de robot real, util para estudiar transferencia, anotacion densa de subtareas y comportamiento en tareas encadenadas. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", no declara licencia y no publica resultados de evaluacion, por lo que no debe considerarse un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 vanilla (vision-language-action, VLA); tres vistas de camara en vivo, sin ranura de keyframe y sin atestacion de memoria |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el texto de subtarea se consume como condicionamiento, pero no se documentan idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `lerobot`; repositorio de 9,4 GB) |
| Modelo base | lerobot/pi05_base (ajuste fino) |
| Dataset de entrenamiento | Myungkyu/RoboDojo-taco-visual2-gemini |
| Entradas | Imagen de cabeza + imagenes de muneca izquierda y derecha, propiocepcion y texto de la subtarea actual |
| Configuracion de entrenamiento | Lote de 64, 60.000 pasos, checkpoint final |
| Tarea | RoboDojo long-horizon: 8 tareas bimanuales de sobremesa reales, 100 demostraciones cada una |
| Creado / actualizado | 2026-09-17 / 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/pi05_base`, etiquetado por el autor como "Pi0.5 vanilla". Se trata, por tanto, de una politica VLA que consume observaciones visuales y propioceptivas junto con una instruccion textual de subtarea y produce acciones de control. La variante concreta emplea tres camaras activas (cabeza, muneca izquierda y muneca derecha), no utiliza entrada de keyframe y no incorpora mecanismo de atestacion de memoria, lo que limita el seguimiento de estado a largo plazo a lo que aporten la ventana de observacion y el texto de la subtarea.

El entrenamiento se realizo sobre el dataset `Myungkyu/RoboDojo-taco-visual2-gemini`, compuesto por demostraciones de ocho tareas bimanuales de sobremesa con 100 demostraciones por tarea. El rasgo tecnico mas destacable es el uso de etiquetas densas de subtarea obtenidas mediante anotacion offline a partir de un contexto especifico de la tarea (el nombre del dataset referencia Gemini), lo que permite condicionar la politica por subtarea dentro de episodios de horizonte largo. La optimizacion uso lote de 64 y 60.000 pasos; no se documentan en la informacion disponible ni el numero total de tokens, ni la composicion detallada del dataset, ni el uso de RLHF o DPO. Un detalle operativo importante: las configuraciones del repositorio referencian el backbone y el tokenizer del modelo base mediante identificador de hub o mediante una ruta local del sitio de entrenamiento, por lo que es necesario apuntarlas a copias locales antes de cargar el modelo.

## Capacidades

- Generacion de acciones de control (action chunks) a partir de observaciones visuales multimodales y propiocepcion, propio de una politica visuomotora y no de un modelo generativo de texto.
- Condicionamiento por lenguaje natural: acepta el texto de la subtarea actual como entrada, lo que permite dirigir el comportamiento dentro de una tarea encadenada.
- Ejecucion de tareas bimanuales de sobremesa con tres puntos de vista simultaneos (cabeza y dos munecas).
- Razonamiento multi-paso de horizonte largo a nivel de comportamiento, apoyado en las etiquetas densas de subtarea del dataset de entrenamiento.
- Reutilizacion como punto de partida para ajuste fino posterior en nuevas tareas de manipulacion, dado que deriva de `lerobot/pi05_base`.
- No se documentan capacidades de tool calling, function calling, agentes conversacionales, generacion de codigo, matematicas, vision general de proposito multiple, audio ni modo de razonamiento explicito (thinking mode).
- No se documentan capacidades multilingues ni idiomas concretos para el texto de subtarea.

## Casos de uso

- Investigacion en manipulacion bimanual de horizonte largo: el modelo permite reproducir y estudiar el comportamiento de una politica Pi0.5 ajustada sobre ocho tareas encadenadas de robot real, con la ventaja de que el dataset y el checkpoint son publicos.
- Punto de partida para ajuste fino con pocas demostraciones: al derivar de `lerobot/pi05_base` y estar entrenado con 100 demostraciones por tarea, sirve como inicializacion para nuevas tareas de mesa con presupuestos de datos reducidos.
- Evaluacion comparativa interna de politicas VLA en laboratorio: se puede enfrentar contra el modelo base y contra otros checkpoints de la misma familia manteniendo fijas las tres vistas y el condicionamiento por subtarea.
- Estudio de anotacion densa de subtareas: el pipeline de etiquetado offline reflejado en `RoboDojo-taco-visual2-gemini` es replicable para analizar como afecta la granularidad de las etiquetas al exito en tareas largas.
- Ablaciones de configuracion de entrenamiento: con lote 64 y 60.000 pasos documentados, el checkpoint final permite comparar frente a checkpoints intermedios y medir el efecto del numero de pasos o del numero de vistas.
- Despliegue experimental en robot real mediante LeRobot: la libreria estandar de carga (`lerobot`) y los pesos en safetensors permiten integrar la politica en un bucle de control cerrado para validacion en banco de pruebas.
- Docencia y divulgacion tecnica sobre VLA: sirve como ejemplo tangible de como se estructura un ajuste fino de una politica vision-lenguaje-accion, siempre que se asuma su caracter no validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el conjunto de tareas de entrenamiento (8 tareas bimanuales de RoboDojo long-horizon, 100 demostraciones cada una) y la configuracion de optimizacion (lote 64, 60.000 pasos), pero no incluye tasas de exito por tarea, metricas de generalizacion ni comparaciones numericas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 8,3 GB en bf16 (4,14 mil millones de parametros) y en torno a 16,6 GB en fp32; el repositorio completo pesa 9,4 GB, coherente con pesos en bf16 mas ficheros auxiliares. Sumando activaciones y buffers de imagen, conviene reservar del orden de 16-24 GB de VRAM para un despliegue comodo.
- Cabe en GPU de consumo: si, en bf16 cabe en una RTX 4090 (24 GB) y en tarjetas de 16 GB con margen ajustado; en fp32 requeriria al menos 24 GB solo para pesos.
- GPU recomendadas: RTX 4090 o A100 40/80 GB para experimentacion; H100 para entrenamiento o ajuste fino posterior. No hay datos publicados de latencia por GPU.
- Opciones de despliegue: `lerobot` con PyTorch es la via documentada por el autor. No se publican variantes GGUF, ni soporte declarado para vLLM, TGI, Ollama o llama.cpp, que en cualquier caso no son adecuados para una politica de control en bucle cerrado.
- Latencia y throughput estimados: no disponibles. Al tratarse de una politica de control, la latencia de inferencia es un factor critico en el despliegue real, pero no se aportan mediciones.
- Advertencia de carga: las configuraciones apuntan al backbone y tokenizer del modelo base por identificador de hub o por ruta local del sitio de entrenamiento; hay que redirigirlas a copias locales antes de instanciar el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0_5_robodojo_taco_visual2_b64_60k | 4.143.404.816 (~4,14 B) | no disponible | Ajuste fino sobre RoboDojo long-horizon (8 tareas bimanuales, 100 demos cada una) | no disponible | HuggingFace, 0 descargas, 0 likes |
| lerobot/pi05_base | no disponible | no disponible | Modelo base Pi0.5 preentrenado por LeRobot | no disponible | HuggingFace |
| Otras familias VLA (OpenVLA, pi0, GR00T N1.5) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La comparacion cuantitativa con alternativas de la misma categoria no puede completarse con los datos disponibles: la model card no aporta metricas y los resultados de busqueda web recuperados no guardan relacion con el modelo, por lo que no se dispone de cifras verificables de terceros.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorizacion explicita de uso comercial, lo que impide integrar el checkpoint en productos o servicios sin aclaracion previa por parte del autor.
- Ausencia total de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni evaluaciones de terceros.
- Riesgo elevado de sobreajuste al entorno de entrenamiento: el modelo esta ajustado sobre ocho tareas concretas con hardware, montaje de camaras y espacio de acciones especificos; no se documenta su comportamiento fuera de esa distribucion.
- Sin atestacion de memoria y sin ranura de keyframe: el modelo puede degradarse en tareas que exijan recordar estado mas alla de la observacion actual y del texto de subtarea.
- Dependencia del condicionamiento textual: la calidad de la ejecucion depende de que la subtarea proporcionada coincida con la distribucion de anotaciones del dataset; no se especifica el idioma ni el formato exacto esperado.
- Rendimiento no medido: no hay tasas de exito, numero de ensayos, semillas ni protocolos de evaluacion, por lo que no es posible estimar la fiabilidad en produccion.
- Friccion de carga: las configuraciones referencian rutas o identificadores del sitio de entrenamiento para el backbone y el tokenizer, lo que puede provocar fallos al instanciar el modelo si no se editan.
- Riesgo de alucinacion de acciones: como toda politica aprendida por imitacion, puede generar trayectorias plausibles pero incorrectas ante entradas fuera de distribucion; en robot real esto se traduce en riesgo fisico, por lo que requiere supervision y paradas de seguridad.
- Sesgos: no se documenta ningun analisis de sesgo demografico, de objetos, de iluminacion ni de configuracion de escena.
- Formatos limitados: solo safetensors; no hay cuantizaciones publicadas que reduzcan el consumo de memoria para despliegues embebidos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/pi0_5_robodojo_taco_visual2_b64_60k
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/RoboDojo-taco-visual2-gemini
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Libreria LeRobot: https://github.com/huggingface/lerobot
- Nota sobre la busqueda web: los resultados recuperados en la busqueda no guardan relacion con el modelo (contenido sobre Facebook y foros de soporte), por lo que no se han podido incorporar papers, blogs ni demos adicionales.
