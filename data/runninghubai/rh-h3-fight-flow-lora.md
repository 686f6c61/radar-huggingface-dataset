# RunningHubAI/rh-h3-fight-flow-lora

## Resumen

rh-h3-fight-flow-lora es un adaptador LoRA experimental publicado en Hugging Face por RunningHubAI, con autoría atribuida en la propia model card al usuario @FOURBUNNY de RunningHub. No es un modelo de lenguaje: es un LoRA de difusión orientado a la generación de imagen o vídeo dentro de ComfyUI, cuyo objetivo declarado es convertir enfrentamientos entre dos personajes en una coreografía continua y coherente, es decir, pasar de "dos personajes que se pelean" a "dos personajes que participan en la misma pelea". El autor indica que se afina a partir de un modelo base denominado minimax-h3, sin aportar más detalles sobre dicho modelo.

El adaptador define tres disparadores de interacción mutuamente excluyentes según la lógica dominante del combate: "Unarmed combat interaction" para puñetazos, patadas, agarres, proyecciones y control corporal; "Melee weapon interaction" cuando predominan hojas, bastones, lanzas u otras armas cuerpo a cuerpo; y "Gun-fu interaction" cuando dominan el control de boca de fuego, la manipulación de armas de fuego o el disparo a corta distancia. El propio autor insiste en elegir el disparador por la lógica de interacción dominante y no por el equipamiento visible en pantalla.

El repositorio es muy pequeño (0,2 GB, con un único archivo safetensors de 148 MiB) y no registra descargas ni valoraciones en el momento de la consulta. Se presenta explícitamente como una capa de interacción pensada para combinarse con otros LoRA especializados del mismo ecosistema (Combate, Armas, GunFu, Artes Marciales, Combate sobrehumano y Reparación de movimiento), que se encargan de decidir qué movimientos conocen los personajes. Los pesos recomendados por el autor son 0,65 en la primera pasada y 0,25 en la segunda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de generación, segun el autor afinado desde minimax-h3 |
| Parametros totales | no disponible (el repositorio solo declara el peso del archivo: 148 MiB) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los disparadores textuales estan en ingles) |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o del modelo base |
| Formato de pesos | safetensors (`H3_Fight_Flow_V1.safetensors`) |
| Tipo de modelo | LoRA para ComfyUI |
| Modelo base declarado | minimax-h3 |
| Tamano del repositorio | 0,2 GB |
| Palabras disparadoras | "Unarmed combat interaction", "Melee weapon interaction", "Gun-fu interaction" |
| Pesos recomendados | 0,65 en la primera pasada; 0,25 en la segunda pasada |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 13 de octubre de 2026 (segun la plataforma) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador más allá de su naturaleza LoRA y del modelo base declarado (minimax-h3). No se especifican rango, dimensiones de las matrices de adaptacion, capas objetivo ni precision de almacenamiento de los pesos. El archivo entregado es un unico safetensors de 148 MiB, lo que lo situa en el rango tipico de los adaptadores de bajo rango para modelos de difusion, muy por debajo del peso de cualquier modelo base completo.

Tampoco se publican datos sobre el entrenamiento: no hay numero de tokens o de pasos, ni composicion del dataset, ni si hubo anotaciones de captura de movimiento, etiquetado de coreografias o datos sinteticos. No se menciona el uso de RLHF, DPO ni ninguna otra tecnica de alineacion, algo esperable en un adaptador de generacion visual. La unica innovacion funcional que declara el autor es de comportamiento, no de arquitectura: los tres disparadores de interaccion (cuerpo a cuerpo, arma blanca y gun-fu) actuan como selectores de la logica de combate dominante y permiten encadenar movimientos que, sin el adaptador, se generan como acciones independientes y no como un intercambio continuo.

## Capacidades

- Generacion de secuencias de combate continuo: el adaptador convierte acciones sueltas en un intercambio encadenado entre dos o mas personajes.
- Seleccion de estilo de pelea mediante disparador: combate sin armas, combate con arma cuerpo a cuerpo y combate con armas de fuego o gun-fu.
- Control de interaccion entre personajes (contacto, distancia, alternancia de turnos de ataque y defensa), segun la descripcion del autor.
- Composicion con otros LoRA del mismo ecosistema: el autor lo describe como una capa de interaccion que se superpone a adaptadores especializados en repertorio de movimientos (Combate, Armas, GunFu, Artes Marciales, Combate sobrehumano, Reparacion de movimiento).
- Ajuste fino del efecto mediante pesos diferenciados por pasada (0,65 y 0,25), lo que permite regular la intensidad de la interaccion.
- Integracion en flujos de ComfyUI y ejecucion en la plataforma RunningHub.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni procesamiento de lenguaje: se trata de un adaptador de generacion visual, no de un modelo de lenguaje.

## Casos de uso

- Previzualizacion de escenas de accion: el adaptador permite generar animaticas de peleas coreografiadas en ComfyUI antes de rodar, de modo que el equipo de dirección pueda evaluar el ritmo del intercambio sin necesidad de especialistas de riesgo.
- Storyboard de producciones audiovisuales: para secuencias de artes marciales o persecuciones con tiroteo, se elige el disparador correspondiente (cuerpo a cuerpo, arma blanca o gun-fu) y se generan viñetas coherentes entre sí.
- Prototipado de animaciones para videojuegos: generacion de referencias de combate continuo que sirvan de base para animadores o para sistemas de captura de movimiento, aprovechando la distincion entre repertorio (otros LoRA) e interaccion (este adaptador).
- Creacion de contenido para comics y novela grafica: produccion de secuencias de lucha panel a panel manteniendo la continuidad del enfrentamiento entre los mismos personajes.
- Generacion de clips cortos para redes sociales: contenido de accion con coreografia legible, donde la continuidad de la pelea es el atractivo principal frente a clips de golpes aislados.
- Experimentacion en pipelines de difusion personalizados: el LoRA es util como modulo de investigacion para estudiar como se comporta un adaptador de interaccion de bajo rango cuando se combina con otros adaptadores y con distintos pesos por pasada.
- Pruebas de concepto de dobles digitales o escenas de riesgo: generacion de referencias visuales de combate sin exponer a personas, para discutir planos y angulos antes del rodaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas, comparaciones numericas ni evaluaciones automaticas o humanas del adaptador; la unica evidencia aportada es cualitativa ("antes: dos personajes se pelean; Fight Flow V1: participan en la misma pelea") y los pesos recomendados de 0,65 y 0,25 por pasada.

## Requisitos de hardware

- VRAM adicional del adaptador: del orden del tamano del archivo, aproximadamente 150 MB, ya que un LoRA de 148 MiB se carga junto al modelo base y no lo sustituye.
- VRAM total necesaria: no disponible; depende por completo del modelo base (minimax-h3) y de la resolucion y duracion del contenido generado, datos que no se publican.
- GPU recomendadas: no disponible para el modelo base. El adaptador en si no impone requisitos propios de GPU.
- Compatibilidad con GPU de consumo: no confirmada; vendra determinada por el modelo base y por la configuracion de ComfyUI, no por el LoRA.
- Opciones de despliegue: ComfyUI (entorno declarado en las etiquetas del repositorio) y la plataforma en la nube RunningHub, que ofrece API y ejecucion de modelos alojados. No aplica a llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-h3-fight-flow-lora (RunningHubAI) | LoRA de interaccion de combate para ComfyUI | no disponible (148 MiB de pesos) | no disponible | no disponible | no disponible; copyright del autor | Hugging Face y RunningHub |
| RunningHubAI/rh-lora | LoRA para ComfyUI | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| LoRA de la familia Combat, Weapon, GunFu, Martial Arts, Superhuman Combat y Motion Repair (citados por el autor) | LoRA especializados en repertorio de movimientos | no disponible | no disponible | no disponible | no disponible | Ecosistema RunningHub |

Los adaptadores citados se orientan a que los personajes sepan ejecutar movimientos concretos, mientras que rh-h3-fight-flow-lora se posiciona como capa de interaccion que encadena esos movimientos en una pelea continua. No hay datos publicos de parametros, contexto ni rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Caracter experimental: el propio autor etiqueta el modelo como "experimental", sin garantia de estabilidad ni de resultados consistentes en todos los flujos.
- Ausencia total de benchmarks: no existen metricas publicas que respalden la mejora cualitativa que describe la model card.
- Licencia no disponible: la model card se limita a indicar que el copyright permanece en el autor y a remitir a la licencia del proyecto original o del modelo base. Esto supone un riesgo juridico relevante para uso comercial, ya que no hay terminos explicitos que autoricen la explotacion.
- Dependencia del modelo base: el adaptador solo funciona cargado sobre minimax-h3 (o el modelo con el que sea compatible), cuyos requisitos de hardware, licencia y limites de contexto no se documentan aqui.
- Riesgo de contenido sensible: el adaptador esta disenado para generar violencia fisica, combate con armas blancas y uso de armas de fuego. Debe revisarse su adecuacion a las politicas de contenido de la plataforma y a la normativa aplicable antes de publicar resultados.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento, por lo que no puede evaluarse el sesgo respecto a tipos de cuerpo, genero, origen etnico o estilos de lucha representados.
- Disparadores en ingles: las palabras de activacion estan redactadas en ingles; no se documenta su comportamiento con prompts en castellano ni con otros idiomas.
- Sensibilidad al peso del adaptador: el autor especifica valores concretos (0,65 y 0,25 por pasada); desviarse de ellos puede degradar la continuidad del combate o introducir artefactos, aunque no se documentan los efectos exactos.
- Riesgo de incoherencia visual: al tratarse de un modelo generativo, son esperables errores de anatomia, continuidad entre fotogramas y fisica del movimiento, especialmente en secuencias largas o con muchos personajes.
- Sin comunidad ni soporte: cero descargas y cero valoraciones en el momento de la consulta, sin issues ni discusion publica que permitan validar su comportamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-h3-fight-flow-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2104849019909824514
- Pagina del autor: https://www.runninghub.ai/user-center/2092843565587107841
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Repositorio relacionado del mismo autor: https://huggingface.co/RunningHubAI/rh-lora
- README en chino del repositorio: https://huggingface.co/RunningHubAI/rh-h3-fight-flow-lora/blob/main/README_cn.md
