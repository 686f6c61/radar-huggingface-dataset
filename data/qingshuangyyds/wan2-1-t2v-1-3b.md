# qingshuangyyds/Wan2.1-T2V-1.3B

## Resumen

Wan2.1-T2V-1.3B es un modelo de generacion de video a partir de texto (text-to-video) perteneciente a la familia Wan2.1, un conjunto de modelos fundacionales de video desarrollado por Wan-AI (equipo vinculado al ecosistema de Alibaba, con presencia en GitHub, Hugging Face y ModelScope). La ficha que nos ocupa corresponde a una copia alojada por el usuario qingshuangyyds del checkpoint original Wan-AI/Wan2.1-T2V-1.3B, publicado el 25 de febrero de 2025. El modelo resuelve la tarea de generar clips de video coherentes a partir de una descripcion textual, y su principal reclamo es que la variante de 1,3B es lo bastante ligera como para ejecutarse en practicamente cualquier GPU de consumo, con un requisito de solo 8,19 GB de VRAM.

Con 1.418.996.800 parametros reales (segun los safetensors del repositorio), se situa en la gama baja de la suite Wan2.1, cuyo modelo de referencia principal es la variante T2V-14B. La arquitectura es de difusion para generacion de video, apoyada en el VAE de video propio del proyecto (Wan-VAE), capaz de codificar y decodificar video a 1080p preservando informacion temporal. El modelo genera por defecto a 480P y soporta en teoria 720P, aunque el propio autor advierte que a esa resolucion los resultados son menos estables por falta de entrenamiento.

Su relevancia actual radica en el coste de entrada: permite generar un clip de 5 segundos a 480P en una RTX 4090 en aproximadamente 4 minutos sin tecnicas de optimizacion como la cuantizacion. Esto lo convierte en una herramienta accesible para equipos academicos con recursos limitados y para desarrolladores que quieran integrar generacion de video en sus pipelines sin depender de infraestructura de datacenter. La licencia Apache 2.0 y el soporte de la libreria diffusers facilitan su adopcion. El repositorio original reconocia en el momento de su publicacion que la integracion con Diffusers y ComfyUI estaba pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion para generacion de video (text-to-video) con backbone transformer (DiT) y VAE de video propio (Wan-VAE) |
| Parametros totales | 1.418.996.800 (~1,3B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de contexto de LLM; condicionado por el prompt de texto y el numero de frames generados |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repositorio distribuye safetensors) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

Wan2.1-T2V-1.3B es un modelo de difusion orientado a la generacion de video condicionada por texto. La suite Wan2.1 se apoya en dos componentes destacados: un backbone transformer de difusion y el Wan-VAE, un VAE de video que, segun la documentacion del proyecto, ofrece gran eficiencia y rendimiento al codificar y decodificar videos a 1080P de cualquier duracion preservando la informacion temporal. Este VAE es la base para las tareas de generacion de video e imagen dentro de la familia.

La informacion proporcionada no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de alineacion como RLHF o DPO. Tampoco se especifica el text encoder utilizado ni los hiperparametros de entrenamiento. Lo unico documentado es que el modelo genera por defecto a 480P, que soporta 720P con menor estabilidad por falta de entrenamiento a esa resolucion, y que el codigo de inferencia multi-GPU esta disponible tanto para la variante de 14B como para la de 1,3B. El proyecto incluye un demo en Gradio y deja constancia de que la integracion con Diffusers y ComfyUI figuraba como pendiente en la model card.

Una innovacion destacable que el autor reclama para la familia Wan2.1 es la generacion de texto visual: se presenta como el primer modelo de video capaz de generar tanto texto en chino como en ingles dentro del propio video, lo que amplia sus aplicaciones practicas (carteles, rotulos, titulos integrados en la escena).

## Capacidades

- Generacion de video a partir de texto (text-to-video), la tarea principal y unica documentada para este checkpoint concreto.
- Generacion a resolucion 480P por defecto y soporte de 720P con menor estabilidad.
- Generacion de clips; el dato de referencia de rendimiento menciona 5 segundos a 480P en una RTX 4090 en unos 4 minutos.
- Generacion de texto visual en chino e ingles integrado en el video.
- Codificacion y decodificacion de video a 1080P mediante Wan-VAE preservando informacion temporal.
- El proyecto matriz Wan2.1 cubre ademas image-to-video, edicion de video, text-to-image y video-a-audio, pero estas capacidades corresponden a otros checkpoints de la suite y no a esta variante de 1,3B.
- Soporte de inferencia multi-GPU segun el codigo del repositorio.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente, ya que no es un modelo de lenguaje.

## Casos de uso

- Generacion de video en hardware de consumo: con 8,19 GB de VRAM, este checkpoint permite a estudios pequenos y creadores individuales generar clips de 5 segundos a 480P en una unica GPU de gama alta para consumo, sin necesidad de clústeres multi-GPU.
- Prototipado academico con recursos limitados: equipos de investigacion sin acceso a infraestructura de datacenter pueden usar la variante de 1,3B como banco de pruebas para experimentos sobre difusion de video y para comparar arquitecturas frente a checkpoints mayores.
- Previsualizacion y storyboard automatizado: en produccion audiovisual, el modelo puede generar bocetos animados de escenas a partir de descripciones textuales antes de comprometer presupuesto en rodaje o renderizado final.
- Contenido para redes sociales: creacion de clips cortos verticales u horizontales a partir de guiones textuales, produciendo material de forma rapida y economica en comparacion con soluciones comerciales cerradas.
- Generacion de rotulos y titulos integrados: gracias a su capacidad de generar texto en chino e ingles dentro del propio video, resulta util para crear piezas con carteles, subtitulos graficos o letreros incrustados sin postproduccion adicional.
- Investigacion en compresion temporal de video: el Wan-VAE, capaz de codificar 1080P de cualquier duracion preservando informacion temporal, puede estudiarse de forma aislada como componente para otras tareas de generacion o edicion de video.
- Integracion en aplicaciones creativas y demos: el repositorio incluye un demo en Gradio, lo que facilita desplegar una interfaz de prueba para validar ideas de producto basadas en generacion de video por texto.
- Educacion y visualizacion: generacion de animaciones explicativas cortas para materiales docentes donde se describe un fenomeno o proceso a partir de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card afirma de forma cualitativa que Wan2.1 "supera de forma consistente a los modelos de codigo abierto existentes y a las soluciones comerciales de ultima generacion en multiples benchmarks", pero no se proporcionan tablas con metricas concretas (como FVD, CLIP score, VBench u otras) para esta variante de 1,3B. El unico dato de rendimiento concreto aportado es temporal: un video de 5 segundos a 480P en una RTX 4090 en aproximadamente 4 minutos, sin optimizaciones como cuantizacion.

## Requisitos de hardware

- VRAM estimada: 8,19 GB para el modelo T2V-1.3B, segun la model card. Es el requisito minimo indicado y hace que quepa en practicamente cualquier GPU de consumo moderna.
- GPU recomendadas: la RTX 4090 es la referencia usada por el autor (5 segundos a 480P en unos 4 minutos sin optimizacion). Se espera funcionamiento en otras GPU de consumo con al menos 8,19 GB de VRAM, aunque no se detallan tiempos para ellas.
- Cabe en GPU de consumo: si, es uno de los objetivos declarados del modelo. La variante de 14B, en cambio, esta pensada para entornos con mas recursos y codigo de inferencia multi-GPU.
- Opciones de despliegue: libreria diffusers y el codigo de inferencia del repositorio oficial Wan-Video/Wan2.1; se incluye un demo en Gradio. La integracion con Diffusers y ComfyUI figuraba como pendiente en la model card, por lo que la disponibilidad de flujos listos para produccion puede requerir trabajo adicional.
- Latencia y throughput: no se proporcionan datos de throughput mas alla del tiempo de generacion citado (5 s de video a 480P en ~4 min en RTX 4090). No hay cifras de latencia para otras GPU ni para 720P.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Wan2.1-T2V-1.3B | 1,3B | 480P (720P menos estable) | Apache 2.0 | Hugging Face (Wan-AI), ModelScope, GitHub | Requiere 8,19 GB de VRAM; cabe en GPU de consumo |
| Wan2.1-T2V-14B | 14B | 480P y 720P | No disponible en la informacion proporcionada (la suite indica Apache 2.0 en esta ficha para la variante 1.3B) | Hugging Face (Wan-AI), ModelScope | Version grande de la misma suite; codigo multi-GPU; no orientada a GPU de consumo |
| Otros modelos de video abiertos (CogVideoX, LTX-Video, HunyuanVideo, entre otros) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No se aportan datos comparativos en la informacion recibida |

Dentro de la propia suite Wan2.1, la eleccion entre la variante de 1,3B y la de 14B responde a un compromiso entre calidad de generacion y requisitos de hardware: la primera prioriza accesibilidad, la segunda, calidad y soporte de 720P estable.

## Limitaciones y advertencias

- Resolucion limitada: el modelo esta entrenado principalmente para 480P. Aunque puede generar a 720P, el propio autor advierte que los resultados son menos estables por falta de entrenamiento a esa resolucion.
- Generacion de video, no de lenguaje: no ofrece tool calling, function calling, razonamiento multi-paso ni comportamiento de agente; no debe evaluarse con criterios de un LLM.
- Idiomas: solo se declaran ingles y chino. No hay soporte documentado para otros idiomas, lo que puede degradar prompts en castellano u otras lenguas.
- Riesgo de alucinacion visual: como modelo generativo de difusion, puede producir artefactos, incoherencias temporales entre frames, deformaciones anatomicas o texto ilegible, especialmente en escenas complejas o a resoluciones altas.
- Sesgos: no se documentan analisis de sesgo en la informacion proporcionada; al entrenarse sobre datos no especificados, puede reproducir sesgos de representacion de genero, etnia u otros presentes en el dataset original.
- Licencia: Apache 2.0, que permite uso comercial, pero conviene revisar los terminos del proyecto original Wan2.1 por si imponen condiciones adicionales no reflejadas en esta ficha.
- Estado de la integracion: la model card original indicaba que la integracion con Diffusers y ComfyUI estaba pendiente, lo que puede afectar a la facilidad de despliegue en produccion.
- Repositorio de terceros: la ficha corresponde a una copia alojada por el usuario qingshuangyyds, con 0 descargas y 0 likes, no al repositorio oficial Wan-AI/Wan2.1-T2V-1.3B. Para uso en produccion es recomendable acudir al repositorio oficial.

## Enlaces

- Repositorio en Hugging Face de esta copia: https://huggingface.co/qingshuangyyds/Wan2.1-T2V-1.3B
- Repositorio oficial del modelo: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Organizacion Wan-AI en Hugging Face: https://huggingface.co/Wan-AI/
- Repositorio en GitHub: https://github.com/Wan-Video/Wan2.1
- ModelScope (organizacion): https://modelscope.cn/organization/Wan-AI
- ModelScope (modelo): https://www.modelscope.cn/models/Wan-AI/Wan2.1-T2V-1.3B
- Blog del proyecto: https://wanxai.com
- Discord: https://discord.gg/p5XbdQV7
- Modelo T2V-14B en Hugging Face: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Modelo I2V-14B-720P en Hugging Face: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-720P
- Modelo I2V-14B-480P en Hugging Face: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P
