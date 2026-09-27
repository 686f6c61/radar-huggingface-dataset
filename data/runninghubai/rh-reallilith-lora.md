# RunningHubAI/rh-reallilith-lora

## Resumen

rh-reallilith-lora es un adaptador LoRA (Low-Rank Adaptation) de personaje fotorrealista publicado por RunningHubAI en nombre del autor Dirol74. No es un modelo de lenguaje ni un modelo base de generacion de imagen: es un ajuste fino de bajo rango que se aplica sobre un checkpoint de difusion para producir de forma consistente un personaje femenino concreto, con rasgos faciales y apariencia reconocibles a lo largo de distintas poses, ropa, entornos, angulos de camara e iluminacion.

El repositorio contiene un unico archivo de pesos, `RealLilith_c1-st3000.safetensors`, de 224 MiB, lo que situa el tamano total del repo en 0,2 GB. Segun la model card, el adaptador se entrena a partir de "krea2" y esta pensado para usarse junto a un checkpoint de generacion de imagen realista, con un peso recomendado de 0,7 a 1,0 y la palabra de activacion `RealLilith` (la propia ficha menciona tambien `Lilith` como trigger, lo que constituye una inconsistencia documental).

Su relevancia es practica y acotada: cubre el caso de uso de consistencia de personaje en flujos de generacion de imagen con ComfyUI, RunningHub o Hugging Face. El modelo no tiene descargas ni valoraciones registradas en el momento de la consulta, la licencia no esta declarada de forma explicita y no se han publicado datos de arquitectura interna, dataset de entrenamiento ni evaluaciones cuantitativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un checkpoint de generacion de imagen (base declarada: krea2). Arquitectura interna del modelo base: no disponible |
| Parametros totales | no disponible (adaptador LoRA; archivo de pesos de 224 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen condicionada por texto) |
| Tipos de cuantizacion | no disponible; se distribuye unicamente en safetensors |
| Idiomas soportados | no disponible (los prompts se introducen en el idioma que acepte el modelo base) |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`RealLilith_c1-st3000.safetensors`, 224 MiB) |
| Tipo de modelo | LoRA de personaje / edicion de imagen (image-text-to-image) |
| Palabra de activacion | `RealLilith` (la ficha menciona tambien `Lilith`) |
| Peso recomendado del LoRA | 0,7 – 1,0 |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion | 26 de septiembre de 2026 |
| Ultima actualizacion | 26 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion proporcionada describe el artefacto como un LoRA de tipo "image edit" orientado a personaje. Un LoRA de este tipo consiste en matrices de bajo rango que se inyectan en las capas de atencion (y, segun la implementacion, tambien en las capas de proyeccion) del modelo base, modificando su comportamiento sin reentrenar los pesos completos. El resultado es un archivo de 224 MiB que se carga de forma aditiva o se fusiona con el checkpoint base en el momento de la inferencia.

No se especifican en la documentacion disponible el rango del adaptador, el numero de matrices entrenadas, los modulos objetivo, el numero de imagenes de entrenamiento, la resolucion de entrenamiento, el numero de pasos (el sufijo `st3000` del nombre del archivo sugiere 3000 pasos, aunque no se confirma en la ficha), ni si se aplicaron tecnicas de regularizacion, captioning automatico o ajuste de learning rate. Tampoco se documenta si hubo fases de refinamiento tipo DPO o RLHF, algo por otra parte poco habitual en adaptadores de personaje. La base declarada es "krea2", sin enlace ni version concreta del checkpoint.

## Capacidades

- Generacion y edicion de imagen condicionada por texto (pipeline `image-text-to-image`) mediante integracion del LoRA en un checkpoint realista.
- Consistencia de identidad de un personaje femenino concreto a traves de cambios de pose, vestuario, entorno, angulo de camara e iluminacion.
- Control de la intensidad del efecto mediante el peso del LoRA, en el rango recomendado de 0,7 a 1,0.
- Activacion mediante palabra clave (`RealLilith`, o `Lilith` segun la propia ficha), combinada con prompts descriptivos detallados.
- Integracion con ComfyUI, con la plataforma RunningHub y con Hugging Face como repositorio de pesos.
- No dispone de soporte documentado de tool calling, function calling, razonamiento multi-paso, agentes, vision de entrada, audio ni modo de pensamiento: son capacidades ajenas al tipo de modelo.
- No hay informacion sobre capacidades multilingues del adaptador; la comprension del prompt depende exclusivamente del modelo base utilizado.

## Casos de uso

- Creacion de personajes coherentes para narrativa visual seriada: usar el LoRA con un checkpoint realista y el trigger `RealLilith` para mantener el mismo rostro y apariencia a lo largo de varias ilustraciones con poses y escenarios distintos, algo critico en comic digital o novela ilustrada.
- Previsualizacion de vestuario en diseno de moda: generar al mismo personaje con distintas prendas, iluminaciones y encuadres para comparar opciones de styling sin necesidad de sesiones fotograficas.
- Produccion de assets para videojuegos o apps: generar retratos y variaciones de un personaje secundario con identidad estable para menus, cartas coleccionables o dialogos.
- Contenido para redes sociales y avatares: producir una serie de imagenes consistentes del mismo personaje virtual para una cuenta tematica, variando fondo y composicion desde ComfyUI.
- Maquetacion de storyboards: generar planos con el mismo personaje en distintas situaciones para validar direccion de arte antes de una produccion mayor.
- Flujos de edicion de imagen en ComfyUI: cargar el LoRA en un pipeline `image-text-to-image` para reencuadrar, recolorear o recontextualizar una imagen existente manteniendo los rasgos del personaje.
- Pruebas comparativas de checkpoints realistas: el adaptador sirve como elemento fijo para evaluar como distintos checkpoints base reproducen una misma identidad bajo el mismo prompt y peso.
- Integracion en servicios gestionados: desplegar el LoRA a traves de RunningHub o su API cuando no se quiere mantener infraestructura de GPU propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud facial, consistencia entre semillas) ni comparaciones cuantitativas con otros adaptadores de personaje. Tampoco se han encontrado resultados de evaluacion en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un adaptador, el consumo de memoria depende integramente del checkpoint base sobre el que se aplique y de la resolucion de generacion, no del archivo de 224 MiB.
- GPU recomendadas: no disponibles en la documentacion. La idoneidad dependera de los requisitos del checkpoint base "krea2" y del pipeline de difusion empleado.
- Viabilidad en GPU de consumo: no confirmada. Cualquier estimacion al respecto exige conocer primero los requisitos del modelo base.
- Opciones de despliegue: ComfyUI (plataforma indicada por el autor), RunningHub (plataforma de origen, con API documentada) y Hugging Face como repositorio de pesos. No se documenta soporte especifico para vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje y no aplican a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-reallilith-lora | no disponible (LoRA de 224 MiB) | no aplica | sin benchmarks publicados | no disponible | Hugging Face, RunningHub, ComfyUI |
| Otros LoRA de personaje realista | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de informacion verificable sobre alternativas comparables en el material proporcionado: no hay datos de tamano, licencia ni evaluaciones de otros adaptadores que permitan una comparacion rigurosa. Los resultados de la busqueda web realizada no guardan relacion con el modelo y no aportan referencias utiles.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Un LoRA de personaje entrenado sobre un dataset no especificado puede reproducir sesgos de representacion (tono de piel, complexion, edad aparente) heredados del checkpoint base y de las imagenes de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de deriva de identidad, es decir, perdida de parecido facial cuando se baja el peso del LoRA, se usa un checkpoint base distinto del previsto o se emplean prompts muy alejados de la distribucion de entrenamiento.
- Limitaciones de contexto e idioma: no aplica una ventana de contexto; la calidad final depende del encoder de texto y del modelo base. No hay idiomas declarados.
- Restricciones de licencia: la licencia no esta declarada. La model card indica que el copyright pertenece al autor y que debe respetarse la licencia del proyecto original o upstream. Esto implica un riesgo juridico real para uso comercial: sin una licencia explicita no se puede asumir permiso de explotacion.
- Ausencia de datos de entrenamiento: no se documentan el dataset, la procedencia de las imagenes ni si existen consentimientos de las personas representadas, lo que es un caveat relevante para despliegues en produccion.
- Inconsistencia documental: la ficha propone dos palabras de activacion distintas (`RealLilith` y `Lilith`), lo que puede provocar resultados inconsistentes si se sigue la documentacion al pie de la letra.
- Base declarada ambigua: se indica "krea2" sin version ni enlace, de modo que no se puede garantizar la compatibilidad con una version concreta del checkpoint base.
- Estado del repositorio: cero descargas y cero valoraciones en la fecha de consulta, sin validacion independiente por parte de la comunidad.
- Uso responsable: la generacion de imagenes fotorrealistas de personas plantea riesgos de suplantacion de identidad, deepfakes y contenido no consentido; conviene aplicar salvaguardas y verificar la normativa aplicable antes de cualquier despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-reallilith-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2098518528555376641
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2093310286513049601
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino (referenciado en la model card): README_cn.md
