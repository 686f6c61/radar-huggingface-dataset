# Kmlap0947/QI_2.1_AnyAngle

## Resumen

QI_2.1_AnyAngle es un adaptador LoRA para el modelo de edicion de imagen Qwen-Image-2.1, desarrollado por el usuario Kmlap0947 (conocido como lilylilith en Civitai). Su proposito es resolver un problema concreto en generacion y edicion de imagenes: el control preciso del angulo de camara. Mientras que modelos de edicion como Qwen Image Edit o FLUX.2 permiten modificar la perspectiva de una imagen existente, normalmente lo hacen con azimuts y elevaciones fijos, lo que limita el control creativo y provoca deriva estilistica en cambios drasticos de angulo.

La innovacion del LoRA reside en su metodo de entrenamiento y uso: en lugar de aprender a "imaginar" el nuevo angulo, el flujo de trabajo transforma la imagen original en un Gaussian Splat o modelo 3D (mediante Tripo Splat, Trellis2 o Pixal3D), lo importa en Blender, situa una camara virtual en el angulo deseado y renderiza una imagen "gruesa". Esa imagen de referencia y la original se introducen en Qwen-Image-2.1 junto con el LoRA y un prompt de edicion especifico, transfiriendo el angulo de camara sin alucinacion de contenido y manteniendo la coherencia estilistica.

El adaptador es de tamano reducido (repositorio de 0,1 GB), se distribuye bajo licencia Apache 2.0 y esta pensado para el pipeline image-to-image de la libreria diffusers. Es relevante para flujos de trabajo profesionales de storyboarding, previsualizacion 3D y edicion fotografica donde se requiere consistencia de identidad y estilo entre tomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen-Image-2.1 (modelo base de difusion para edicion de imagen) |
| Parametros totales | no disponible (repositorio de 0,1 GB; el numero de parametros del adaptador no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (formato nativo de diffusers; compatibilidad con cuantizaciones del modelo base no especificada) |
| Idiomas soportados | no disponible (el prompt de edicion se documenta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estandar de LoRA en diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango disenado para inyectarse en Qwen-Image-2.1, un modelo de difusion para edicion y generacion de imagenes de Alibaba. El modelo base procesa dos imagenes de entrada (la original como ancla y un render grueso del nuevo angulo) junto con un prompt de edicion, y el LoRA modula las capas de atencion para que la transferencia de perspectiva sea fiel a la referencia geometrica y no una invencion del modelo.

El entrenamiento se realizo con un dataset construido especificamente para esta tarea. Se combinaron renders reales de Blender, deliberadamente diversos en estilo, con imagenes generadas por el modelo de video MiniMax H3 para ilustraciones digitales. Cada muestra empareja una imagen ancla con un fotograma en un angulo de camara distinto (objetivo). A partir de la imagen objetivo se genera un Gaussian Splat o modelo 3D que sirve como "render grueso" de control. Para estilos no fotograficos (ilustracion, boceto) se empleo MiniMax H3 en modo image-to-video para producir orbitas y manipulaciones de camara con sujetos estaticos, maximizando la consistencia. El entrenamiento se prolongo durante unos pocos miles de pasos.

La innovacion tecnica clave es el uso de geometria explicita (splats/3D) como guia de control, lo que evita la alucinacion de contenido y mantiene la alineacion estilistica incluso en cambios de angulo drasticos, algo que los adaptadores convencionales de edicion no consiguen de forma fiable.

## Capacidades

- Manipulacion de angulo de camara en imagenes existentes con control continuo de azimut y elevacion, no limitado a angulos fijos.
- Transferencia de perspectiva desde un render de referencia (imagen gruesa generada en Blender a partir de un splat o modelo 3D) a la imagen original.
- Preservacion de la coherencia estilistica entre la imagen de entrada y la de salida, incluyendo estilos fotograficos, ilustracion y boceto.
- Edicion image-to-image guiada por prompt, con el prompt recomendado: "Change the camera angle from <image2> to <image1>."
- Integracion con el ecosistema diffusers y con el pipeline de Qwen-Image-2.1.
- Compatibilidad con LoRAs turbo y modelos Qwen Image 2.1 turbo para inferencia rapida (con ligera perdida de calidad), util para storyboarding.
- No soporta tool calling, agentes ni razonamiento multi-step: es un adaptador puramente visual.
- Capacidades multilingues: no aplica; el prompt de edicion documentado esta en ingles.

## Casos de uso

- Storyboarding y planificacion de planos: a partir de un fotograma clave, generar vistas alternativas del mismo sujeto desde otros angulos para construir secuencias de camara coherentes, usando el flujo splat/Blender y el prompt de edicion con CFG 3.0 y 20 o mas pasos.
- Previsualizacion de escenas 3D: convertir un render de Blender en una imagen final con estilo consistente, permitiendo iterar sobre la posicion de camara sin rehacer el renderizado completo.
- Edicion fotografica profesional: corregir o ampliar la perspectiva de una fotografia (por ejemplo, un retrato o un producto) manteniendo la identidad y el estilo originales, evitando la deriva estilistica de otros editores.
- Ilustracion digital: reorientar personajes y escenas en ilustraciones o bocetos generados, gracias al entrenamiento con orbitas de MiniMax H3 sobre sujetos estaticos.
- Diseno de producto y e-commerce: generar vistas de un articulo desde angulos adicionales a partir de una sola fotografia, siempre que el splat o modelo 3D generado sea suficientemente preciso.
- Cine y animacion: producir fotogramas de referencia para boarding rapido usando un LoRA turbo de Qwen Image 2.1, aceptando una ligera perdida de calidad a cambio de menor latencia.
- Investigacion en edicion geometricamente consistente: servir como base para estudiar la combinacion de representaciones 3D explicitas (Gaussian Splatting) con modelos de difusion para edicion controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el LoRA; depende enteramente de Qwen-Image-2.1, cuyo peso en VRAM no se documenta en la informacion proporcionada.
- GPU recomendadas: no disponible. El modelo base Qwen-Image-2.1 requiere presumiblemente GPUs de datacenter o consumer de gama alta, pero no se confirma en la model card.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: libreria diffusers (pipeline image-to-image), con el LoRA cargado sobre Qwen-Image-2.1. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion).
- Latencia y throughput: no disponibles. La model card indica que se puede usar un LoRA turbo o un modelo Qwen Image 2.1 turbo para reducir latencia en tareas de boarding, con ligera perdida de calidad.
- Requisitos del flujo completo: se necesita ademas un generador de Gaussian Splat o modelo 3D (Tripo Splat, Trellis2 o Pixal3D) y Blender para el render de la camara virtual, lo que anade requisitos de computo y software fuera del propio LoRA.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| QI_2.1_AnyAngle | LoRA sobre Qwen-Image-2.1 | no disponible (repo 0,1 GB) | no aplica | sin benchmarks publicados | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen-Image-2.1 (base) | Modelo de difusion para edicion de imagen | no disponible en la informacion | no aplica | no disponible | no disponible en la informacion | Hugging Face (Qwen/Qwen-Image-2.1) |
| FLUX.2 | Modelo de edicion de imagen | no disponible | no aplica | no disponible | no disponible en la informacion | Mencionado en la model card |
| Qwen Image Edit | Modelo de edicion de imagen | no disponible | no aplica | no disponible | no disponible en la informacion | Mencionado en la model card |

No se dispone de datos cuantitativos para una comparativa rigurosa; las alternativas citadas se mencionan solo como referencia cualitativa en la model card del autor.

## Limitaciones y advertencias

- Dependencia de la calidad del splat o modelo 3D: si el generador de geometria no es espacialmente consciente o el render es demasiado grueso (anatomia extrema, caras deformadas, baja resolucion), la disposicion espacial de objetos puede quedar mal colocada o las caras malformadas.
- El flujo completo exige herramientas externas (Tripo Splat, Trellis2, Pixal3D, Blender), lo que anade complejidad operativa y posibles fuentes de error.
- Riesgo de alucinacion limitado en renders reales de Blender, pero presente en estilos ilustrados generados con MiniMax H3.
- No hay informacion sobre sesgos del adaptador ni del modelo base en la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen-Image-2.1 tiene su propia licencia que debe verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria ni reportes de produccion.
- No se documentan idiomas soportados ni rendimiento en prompts no ingleses.
- Configuracion recomendada estricta: fuerza del LoRA a 1, CFG 3.0 y 20 o mas pasos; desviarse puede degradar el resultado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kmlap0947/QI_2.1_AnyAngle
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Perfil del autor en Civitai: https://civitai.com/user/lilylilith
- Apoyo al autor (Ko-fi): https://ko-fi.com/lilllithhhhh
- Workflow de generador de mundo 3D citado: https://www.youtube.com/watch?v=eJuYBNrD8HI
