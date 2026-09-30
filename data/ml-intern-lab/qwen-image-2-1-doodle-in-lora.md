# ML-Intern-lab/Qwen-Image-2.1-doodle-in-LoRA

## Resumen

Qwen-Image-2.1-doodle-in-LoRA es un adaptador LoRA para el modelo de difusion Qwen/Qwen-Image-2.1, publicado por el usuario ML-Intern-lab. Su funcion es concreta: recibe una fotografia sobre la que se ha dibujado un trazo magenta y una instruccion de texto breve que nombra un objeto, y devuelve esa misma fotografia con el trazo sustituido por el objeto indicado, respetando la forma y la pose del garabato, con una iluminacion coherente con la escena y sin alterar el resto de la imagen. Es, por tanto, una herramienta de edicion e inpainting guiada por boceto (scribble-based image editing) construida sobre un modelo base que unifica generacion y edicion.

El adaptador se entreno con 6.042 pares derivados de Open Images V7 y publicados como dataset ML-Intern-lab/doodle-in-pairs, usando ostris/ai-toolkit (arquitectura qwen_image_2) en el commit 6468a2f. El repositorio ocupa 1,0 GB e incluye el adaptador en varios formatos de claves, checkpoints intermedios, el script de conversion y la configuracion exacta de entrenamiento.

Su relevancia practica esta en dos decisiones de diseno: un convenio de marcador deterministico y reproducible (magenta puro RGB 255, 0, 255, con anchura de trazo y estilos de garabato definidos numericamente) y una eleccion de color deliberada para no colisionar con los LoRA de eliminacion de objetos, que emplean rojo (239, 68, 68). Esto permite apilar en un mismo Space un LoRA de insercion y otro de borrado. El checkpoint seleccionado por el autor es el 500, y existe una variante de 6 pasos apilando el LoRA turbo de Viggle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (adaptador LoRA sobre un modelo base de difusion; la model card no detalla la arquitectura interna del modelo base) |
| Parametros totales | no disponible (el adaptador ocupa 1,0 GB en el repositorio; la model card no publica el numero de parametros del LoRA ni del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen); la entrada es una imagen mas un prompt de texto, con resoluciones de ejemplo de 1024x768 en multiplos de 32 |
| Tipos de cuantizacion | no disponibles; el ejemplo de uso oficial carga el modelo base en bfloat16 |
| Idiomas soportados | no disponible; la plantilla de prompt documentada esta en ingles |
| Licencia | qwen-research (campo license: other, license_name: qwen-research, con enlace a LICENSE en el repositorio) |
| Formato de pesos | safetensors, en dos variantes de claves: doodle_in_lora_qwen21_gate_up_split.safetensors (recomendada, claves estilo diffusers) y doodle_in_lora_qwen21.safetensors (claves originales de ai-toolkit, estilo ComfyUI) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango no especificado que se aplica sobre Qwen/Qwen-Image-2.1, un modelo base que segun la model card unifica generacion y edicion: el modo edicion se activa pasando el argumento `image=`. El entrenamiento se realizo con ostris/ai-toolkit, tarea `sd_trainer`, arquitectura declarada `qwen_image_2`, en el commit 6468a2f. El conjunto de entrenamiento son 6.042 pares construidos a partir de Open Images V7. La model card no especifica el numero de tokens, el rango del LoRA ni hiperparametros de optimizacion, aunque si publica el fichero config.yaml con la configuracion exacta.

El aspecto tecnico mas cuidado es la generacion de los pares de entrenamiento. Para cada par se dilato la mascara del objeto un 3% de la diagonal de su caja envolvente (extendida hacia abajo para sombras de contacto) y se relleno con LaMa antes de dibujar el garabato, de modo que el modelo aprende a insertar el objeto sobre una region previamente vaciada. Se mezclaron tres estilos de garabato en proporcion 50/30/20: contorno (simplificado con Douglas-Peucker con eps entre el 0,2% y el 0,6% del perimetro del contorno, con ruido sinusoidal suave de amplitud 0,5-2% del lado corto, huecos ocasionales de 0 a 2 segmentos y sobrepasos de hasta el 1,5% del lado corto en el 40% de los extremos), detallado (contorno mas hasta 4 trazos interiores extraidos de un mapa de Canny dentro de la mascara erosionada, esparcidos a 40 puntos o menos) y mancha (envolvente convexa con jitter, remuestreada a 27 muestras angulares, con jitter de radio entre x0,92 y x1,06 y ruido gaussiano del 0,8% del lado corto). El trazo se dibuja directamente sobre la foto, con color unico, sin mezcla, extremos y uniones redondeados, y anchura uniforme entre 0,004 y 0,010 del lado corto, acotada al rango de 3 a 7 px.

Un detalle de implementacion relevante: ai-toolkit guarda un LoRA fusionado `img_mlp.gate_up` que diffusers descarta silenciosamente, porque almacena gate y up como dos capas lineales distintas. El fichero recomendado contiene ese tensor fusionado ya dividido, y el autor verifica que es identico en delta al original (desviacion maxima de 0,0 en los 448 modulos).

## Capacidades

- Edicion de imagen guiada por boceto: inserta un objeto nombrado en el lugar de un trazo magenta dibujado a mano sobre una fotografia.
- Respeto de forma y pose: el objeto generado sigue el contorno y la orientacion del garabato.
- Coherencia de iluminacion: el objeto insertado se ilumina de forma consistente con la escena circundante.
- Preservacion del contexto: todo lo que queda fuera del entorno del garabato se mantiene sin cambios.
- Inpainting y edicion de imagen a imagen sobre el modelo base Qwen-Image-2.1.
- Control mediante prompt de texto corto, con la plantilla `<doodle> Turn the magenta scribble into {caption}.`
- Compatibilidad con LoRA de terceros: se puede apilar con el LoRA turbo de Viggle para reducir la edicion a 6 pasos.
- Compatibilidad de marcador con LoRA de eliminacion de objetos, al usar magenta en lugar de rojo.
- Tool calling, function calling, agentes, razonamiento multi-paso, matematicas, codigo, vision, audio y modo thinking: no aplica, es un modelo de difusion de imagenes.

## Casos de uso

- Edicion fotografica conversacional en aplicaciones de consumo: el usuario dibuja un trazo magenta sobre una foto y escribe el nombre de un objeto; el adaptador lo inserta respetando la pose del trazo y la iluminacion, lo que permite flujos de retoque sin conocimientos de edicion profesional.
- Prototipado rapido de composicion visual: en estudios de diseno se puede bocetar la silueta de un mueble o un producto sobre una fotografia del espacio real para evaluar encaje, escala y orientacion antes de producir el render definitivo.
- Decoracion de interiores y visual merchandising: sustituir un trazo por un sofa, una lampara o una planta en una fotografia de una habitacion y comparar variantes cambiando solo la instruccion de texto.
- Herramientas de anotacion aumentada para catalogos: partiendo de fotografias de producto, generar variantes con objetos anadidos de forma controlada, manteniendo intacto el resto de la escena para conservar el contexto de marca.
- Pipelines de edicion por lotes en produccion: al ser un LoRA de diffusers cargable con `load_lora_weights`, se puede integrar en servicios de generacion de imagenes y encadenar con otros adaptadores, incluido el turbo de 6 pasos para reducir coste por imagen.
- Interfaces de dibujo sobre lienzo en web o escritorio: el convenio de marcador esta implementado de forma independiente en `scribble.py`, de modo que una aplicacion puede reproducir byte a byte las entradas de entrenamiento y obtener resultados alineados con el regimen visto durante el entrenamiento.
- Flujos combinados de borrado e insercion en un mismo Space: al usar magenta en lugar del rojo de los LoRA de eliminacion de objetos, una misma interfaz puede encadenar la retirada de un objeto y la insercion de otro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card describe una evaluacion sobre un conjunto de prueba de 160 pares (40 pares de 23 clases no vistas durante el entrenamiento), comparando el adaptador con el modelo base a 40 pasos y con el LoRA turbo de 6 pasos de Viggle, pero no incluye cifras de metricas en el material proporcionado.

| Evaluacion declarada | Resultado numerico |
|---|---|
| Conjunto de prueba de 160 pares (40 pares, 23 clases no vistas) | no disponible |
| Comparacion con el modelo base a 40 pasos | no disponible |
| Comparacion con el LoRA turbo de 6 pasos de Viggle | no disponible |
| Seleccion de checkpoint (500 frente a 1000 y 1500) | el autor indica que el checkpoint 500 es el seleccionado; no se publican cifras |

## Requisitos de hardware

- El adaptador en si ocupa 1,0 GB en el repositorio (incluyendo checkpoints y estado del optimizador); el peso efectivo del LoRA cargado es una fraccion de esa cifra.
- Es obligatorio cargar el modelo base Qwen/Qwen-Image-2.1 completo; la VRAM necesaria para la inferencia depende de ese modelo base y no se especifica en la informacion proporcionada.
- El ejemplo oficial de uso carga el modelo base con `dtype=torch.bfloat16` y lo mueve a CUDA, lo que implica precision de 16 bits para los pesos del modelo base.
- Resoluciones de trabajo: el ejemplo usa 1024x768, con la condicion de que ancho y alto sean multiplos de 32 y coincidan con la relacion de aspecto de la entrada.
- Despliegue: libreria diffusers mediante `QwenImage21Pipeline.load_lora_weights`, con `transformers==5.17.0` y `torch==2.14.0` verificados en el commit de diffusers 0121a91f9d419ff7234c8a5923f82c244e6f1914. Tambien se puede usar ComfyUI con el fichero de claves originales. vLLM, llama.cpp, Ollama y TGI no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. Si se conoce el numero de pasos: 40 pasos en la configuracion por defecto y 6 pasos apilando el LoRA turbo de Viggle, con `true_cfg_scale=1.0` (sin CFG) en el ejemplo oficial.
- Verificacion de carga: un cargador correcto debe exponer 448 modulos LoRA; si el numero es menor, diffusers ha descartado las claves fusionadas de gate_up.

## Comparativa con modelos similares

La comparativa se plantea frente al modelo base y frente a adaptadores que operan en el mismo ecosistema. Los campos de parametros y contexto no aplican igual que en modelos de lenguaje, por lo que se sustituyen por funcion, marcador y numero de pasos.

| Modelo | Funcion | Marcador | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-doodle-in-LoRA | Inserta un objeto en el lugar de un garabato | Magenta RGB (255, 0, 255) | 40 (6 con turbo apilado) | qwen-research | HuggingFace, diffusers y ComfyUI |
| Qwen/Qwen-Image-2.1 (modelo base) | Generacion y edicion sin adaptador | No aplica | 40 en la evaluacion del autor | qwen-research | HuggingFace |
| LoRA turbo de Viggle (Qwen-Image-2.1-viggle-turbo) | Aceleracion de la inferencia del modelo base | No aplica | 6 | no disponible en la informacion proporcionada | HuggingFace |
| LoRA de eliminacion de objetos (familia citada en la model card) | Retira objetos de una imagen | Rojo RGB (239, 68, 68) | no disponible | no disponible | no disponible |

Parámetros totales, longitud de contexto y cifras de rendimiento comparadas: no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta especializado en una unica tarea. Fuera de la sustitucion de un trazo magenta por un objeto nombrado, no se documenta ningun otro comportamiento, y no cabe esperar generacion de imagen general ni edicion libre.
- Depende estrictamente del convenio de marcador: color magenta puro (255, 0, 255), opaco, trazo de anchura entre 0,004 y 0,010 del lado corto acotada a 3-7 px, extremos y uniones redondeados y dibujo directo sobre la foto sin mezcla. Desviarse de ese convenio puede degradar el resultado.
- La plantilla de prompt documentada esta en ingles y la model card no declara idiomas soportados; no hay evidencia publicada sobre el comportamiento con prompts en castellano u otros idiomas.
- Riesgo de alucinacion inherente a los modelos de difusion: el objeto generado puede no corresponder fielmente al nombre indicado, adoptar una forma distinta de la silueta dibujada o integrarse con iluminacion incoherente. No se publican metricas que cuantifiquen estos fallos.
- Sesgos: el entrenamiento parte de Open Images V7, un dataset con sesgos geograficos, culturales y de representacion conocidos; la model card no documenta ningun analisis de sesgo ni de sesgo demografico.
- La licencia es qwen-research (campo generico `other`, con enlace a LICENSE). Es imprescindible revisar los terminos del fichero LICENSE antes de cualquier uso comercial, ya que la denominacion "research" suele implicar restricciones de uso.
- El autor advierte de un problema de compatibilidad silencioso: ai-toolkit guarda un LoRA fusionado `img_mlp.gate_up` que diffusers descarta sin avisar. Si se carga el fichero con claves originales en diffusers, se pierden claves y la calidad se degrada; el repositorio incluye un script de conversion y una comprobacion de 448 modulos para detectarlo.
- Trazabilidad de la evaluacion limitada: se menciona un conjunto de prueba de 160 pares y 23 clases no vistas, pero no se publican cifras ni la metodologia completa en el material disponible.
- Los requisitos de VRAM no estan documentados y dependen del modelo base, cuyo tamano en parametros tampoco se especifica en la informacion disponible.
- El adaptador se probo con versiones concretas de librerias (transformers 5.17.0, torch 2.14.0 y un commit especifico de diffusers). Cambios de version pueden alterar el comportamiento o la carga de pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ML-Intern-lab/Qwen-Image-2.1-doodle-in-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Dataset de entrenamiento: https://huggingface.co/datasets/ML-Intern-lab/doodle-in-pairs
- Script de generacion de garabatos: https://huggingface.co/datasets/ML-Intern-lab/doodle-in-pairs/blob/main/build_scripts/scribble.py
- Script de conversion de claves gate/up: incluido en el repositorio del modelo (convert_lora.py)
- Demo Space: https://huggingface.co/spaces/ML-Intern-lab/Qwen-Image-2.1-doodle-in-LoRA
- LoRA turbo de Viggle (6 pasos): https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Entrenador ai-toolkit: https://github.com/ostris/ai-toolkit
- Open Images V7: https://storage.googleapis.com/openimages/web/index.html
- LaMa (relleno previo de la mascara): https://github.com/advimman/lama
- Resultados de busqueda web: no se ha encontrado ningun resultado relevante para este modelo; las coincidencias obtenidas corresponden al termino generico "ML" (millilitros y una empresa homonima) y no aportan informacion sobre el adaptador.
