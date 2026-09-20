# AiMamis/Yumi

## Resumen

Yumi es un adaptador LoRA de generacion de imagenes publicado por el usuario AiMamis en Hugging Face. Se distribuye con la libreria diffusers y esta disenado para funcionar sobre el modelo base krea/Krea-2-Turbo, un modelo de difusion de texto a imagen. El adaptador introduce un personaje concreto, activado mediante las palabras clave `Yumi`, `Hazel eyes`, `Blonde hair` y `Pale skin`, de forma que las generaciones mantengan rasgos consistentes de ese personaje (ojos avellana, pelo rubio y piel palida).

El repositorio ocupa 0,5 GB y se publico y actualizo el 19 de septiembre de 2026, con cero descargas y cero likes en el momento de la consulta. La licencia declarada es openrail++, una licencia permisiva con clausulas de uso responsable habitual en el ecosistema de difusion.

La relevancia de este tipo de publicaciones es practica: los LoRA de personaje permiten reutilizar un unico modelo base para producir ilustraciones consistentes de un mismo sujeto sin reentrenar el modelo completo. La informacion publicada por el autor es minima (no incluye dataset, hiperparametros de entrenamiento, benchmarks ni ejemplos de uso documentados), por lo que esta ficha se limita a lo verificable desde el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto a imagen; la arquitectura interna del modelo base no esta documentada en la informacion disponible |
| Parametros totales | no disponible (no se especifican rango ni numero de parametros del adaptador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion texto a imagen); la longitud de condicionamiento textual no esta documentada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no se declara idioma para las etiquetas de condicionamiento) |
| Licencia | openrail++ |
| Formato de pesos | no disponible (el repositorio declara la libreria diffusers; no se detallan formatos alternativos) |
| Modelo base | krea/Krea-2-Turbo |
| Tipo de pipeline | text-to-image |
| Palabras de activacion | Yumi, Hazel eyes, Blonde hair, Pale skin |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 19 de septiembre de 2026 |
| Ultima actualizacion | 19 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas del modelo base krea/Krea-2-Turbo para modificar su comportamiento generativo sin alterar los pesos originales. Este esquema reduce drasticamente el coste de almacenamiento y de entrenamiento frente al ajuste completo, y permite cargar y descargar el adaptador sobre el mismo modelo base segun convenga. El repositorio no especifica el rango del adaptador, las capas objetivo, el optimizador ni el numero de pasos de entrenamiento.

Tampoco se documentan los datos de entrenamiento: no hay informacion sobre el numero de imagenes, la resolucion, la composicion del dataset, el uso de regularizacion o captions automaticos, ni sobre tecnicas de ajuste como DreamBooth, LoRA clasico o variantes. No se declara ningun proceso de alineacion tipo RLHF o DPO, algo por otra parte poco habitual en modelos de difusion. La unica innovacion documentada implicitamente es el propio mecanismo de activacion por palabras clave, que asocia el token `Yumi` y tres descriptores fisicos a la identidad del personaje.

## Capacidades

- Generacion de imagenes de texto a imagen condicionada por prompt, heredando las capacidades del modelo base krea/Krea-2-Turbo.
- Reproduccion de un personaje concreto mediante la palabra de activacion `Yumi`, con rasgos definidos por los descriptores `Hazel eyes`, `Blonde hair` y `Pale skin`.
- Composicion de los rasgos del personaje con el resto del prompt (escena, iluminacion, estilo, encuadre), siempre que el modelo base lo permita.
- Ajuste de estilo o variacion del personaje dentro de los limites del adaptador y del modelo base.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (modo thinking, vision, audio, video): no disponibles; el pipeline declarado es exclusivamente text-to-image.
- Control fine-tuning, ControlNet, inpainting o img2img: no documentados para este adaptador.

## Casos de uso

- Ilustracion de personaje consistente en serie: usar el LoRA con el mismo prompt base y variar solo la escena permite mantener la identidad visual de Yumi a lo largo de varias ilustraciones, util para webcomics, novelas ligeras o fanzines.
- Diseno de personajes para videojuegos o prototipado visual: generar hojas de personaje (turnaround, expresiones, variaciones de vestuario) antes de encargar el modelado 3D o el arte final.
- Avatares y assets para creadores de contenido: producir imagenes de perfil, banners y miniaturas con una identidad grafica estable para canales, redes o comunidades.
- Material de marketing y campanas tematicas: generar variaciones de una mascota o embajadora de marca en distintos contextos sin repetir sesiones de fotografia ni ilustracion.
- Generacion de datasets sinteticos con personas ficticias: crear imagenes etiquetadas de un personaje no real para tareas de aumento de datos o pruebas de pipelines de vision por computador, evitando datos biometricos de personas reales.
- Exploracion creativa y pruebas de concepto: iterar rapidamente sobre ideas de personaje antes de invertir en produccion, dado que el adaptador se carga y descarga sobre el modelo base sin coste adicional de entrenamiento.
- Integracion en pipelines de generacion automatizada: al ser un adaptador diffusers, puede incorporarse a flujos programaticos que compongan prompts de forma dinamica y encolen generaciones por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas objetivas (FID, CLIP score, comparativas de similitud de personaje frente a otras LoRA) ni ejemplos cuantificados de calidad o de consistencia.

## Requisitos de hardware

- El adaptador en si ocupa 0,5 GB en el repositorio, por lo que su huella adicional en memoria es pequena en comparacion con el modelo base.
- Los requisitos reales de VRAM los determina krea/Krea-2-Turbo, no el LoRA. No se dispone de cifras de VRAM para el modelo base en la informacion proporcionada.
- GPU recomendadas: no disponible para el modelo base; en general, la generacion de imagenes con modelos de difusion se beneficia de GPUs con al menos 12-16 GB de VRAM en precision mixta, pero esta cifra es orientativa y no esta confirmada para este modelo.
- Viabilidad en GPU de consumo: no confirmada. Dependera del tamano y de las opciones de cuantizacion u offloading que admita el modelo base.
- Opciones de despliegue declaradas: libreria diffusers. No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI, ComfyUI ni otros runners.
- Latencia y throughput: no disponibles. Dependen del modelo base, de la GPU y del numero de pasos de muestreo configurados.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AiMamis/Yumi | LoRA de personaje sobre Krea-2-Turbo | no disponible | no aplica | no disponible | openrail++ | Hugging Face, 0 descargas |
| krea/Krea-2-Turbo (modelo base, sin adaptador) | Modelo de difusion texto a imagen | no disponible | no aplica | no disponible | no disponible en la informacion proporcionada | Hugging Face |
| Otras LoRA de personaje sobre el mismo modelo base | LoRA de personaje | no disponible | no aplica | no disponible | variable | no identificadas en la informacion proporcionada |

La informacion disponible no permite establecer una comparacion cuantitativa con alternativas. La comparacion relevante en la practica es frente al modelo base sin adaptador: el LoRA anade la identidad del personaje a cambio de un aumento minimo de tamano, pero puede degradar la diversidad de las generaciones si el entrenamiento fue demasiado agresivo, algo que no puede evaluarse sin ejemplos publicados.

## Limitaciones y advertencias

- No se han publicado ejemplos de generacion, benchmarks ni comparativas, por lo que la calidad y la consistencia del personaje no pueden verificarse con la informacion disponible.
- Riesgo de sobreajuste al dataset de entrenamiento: al no documentarse el numero de imagenes ni la regularizacion, es posible que el personaje aparezca siempre en poses, encuadres o estilos similares.
- La descripcion del personaje esta fijada a tres rasgos fisicos concretos; prompts que contradigan esos rasgos pueden producir resultados inconsistentes o ignorar parte del prompt.
- El modelo base krea/Krea-2-Turbo condiciona todas las capacidades, sesgos y limitaciones del adaptador. No se documentan los sesgos de representacion (etnia, edad, corporalidad) del modelo base ni del LoRA.
- Riesgo de alucinacion visual: como cualquier modelo generativo, puede producir anatomia incorrecta, manos deformes, texto ilegible o artefactos, especialmente en composiciones complejas.
- Idioma: no se declara que idiomas entiende el condicionamiento textual; los prompts en castellano podrian rendir peor que en ingles si el modelo base esta entrenado mayoritariamente en ingles.
- Licencia openrail++: permite uso comercial con condiciones, pero incluye clausulas de uso responsable y obligaciones de redistribucion. Conviene revisar el texto completo antes de integrarlo en un producto.
- El personaje `Yumi` es una creacion del autor del modelo; su uso comercial puede estar sujeto a derechos adicionales del creador, no cubiertos por la licencia del repositorio.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces encontrados correspondian a sitios de retransmision deportiva sin relacion con el proyecto.
- Repositorio con cero descargas y publicado y actualizado el mismo dia: no hay senales de mantenimiento, soporte ni validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AiMamis/Yumi
- Archivos del repositorio: https://huggingface.co/AiMamis/Yumi/tree/main
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Texto de la licencia openrail++: no disponible en la informacion proporcionada (referenciada en la model card, sin enlace directo)
- Paper, blog o repositorio de codigo del autor: no disponible
- Demos o espacios asociados: no disponible
