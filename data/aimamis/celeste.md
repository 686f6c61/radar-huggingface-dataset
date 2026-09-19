# AiMamis/Celeste

## Resumen

Celeste es un adaptador LoRA de generacion de imagenes text-to-image publicado por el usuario AiMamis en HuggingFace. El adaptador se aplica sobre el modelo base krea/Krea-2-Turbo y esta etiquetado con la plantilla `template:diffusion-lora`, lo que indica que se distribuye como complemento de bajo rango y no como un modelo de difusion completo e independiente. El repositorio ocupa 0,5 GB y sigue la estructura habitual de la libreria diffusers.

Se trata de un LoRA de personaje: segun la model card, su proposito es generar imagenes de un personaje llamado Celeste, cuyos rasgos definitorios son pelo blanco, ojos verde claro y piel palida. La model card define el prompt de instancia `Celeste, White hair, Light green eyes, Pale skin` y establece cuatro palabras de activacion (`Celeste`, `White hair`, `Light green eyes`, `Pale skin`) que deben incluirse en el prompt para que el adaptador aplique el estilo y la identidad aprendidos.

Su relevancia es limitada y muy acotada: es un adaptador de nicho con cero descargas y cero "likes" en el momento de la consulta, publicado el 19 de septiembre de 2026, sin benchmarks, sin datos de entrenamiento y sin documentacion tecnica mas alla de las palabras de activacion. Resulta util unicamente para quien necesite un LoRA de personaje sobre Krea-2-Turbo, y siempre que acepte la licencia openrail++ y el hecho de que no existe ninguna validacion publica de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusion text-to-image; modelo base krea/Krea-2-Turbo |
| Parametros totales | no disponible (el repositorio ocupa 0,5 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (generacion de imagenes; corresponde al codificador de texto del modelo base, dato no disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | openrail++ |
| Formato de pesos | no disponible (repositorio compatible con la libreria diffusers) |
| Pipeline | text-to-image |
| Modelo base | krea/Krea-2-Turbo |
| Plantilla | diffusion-lora |
| Prompt de instancia | Celeste, White hair, Light green eyes, Pale skin |
| Palabras de activacion | Celeste; White hair; Light green eyes; Pale skin |
| Tamano del repositorio | 0,5 GB |
| Fecha de creacion | 19 de septiembre de 2026 |
| Ultima actualizacion | 19 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible confirma que Celeste es un adaptador LoRA (Low-Rank Adaptation) para un modelo de difusion text-to-image, aplicado sobre krea/Krea-2-Turbo. Los LoRA de difusion congelan los pesos del modelo base e insertan matrices de bajo rango en determinadas capas del denoiser o del codificador de texto, de forma que el ajuste ocupa una fraccion minima del tamano del modelo original. El peso del repositorio (0,5 GB) es coherente con esta categoria de adaptadores, aunque no se ha publicado el rango, los modulos objetivo ni el numero exacto de parametros entrenables.

No se dispone de datos sobre el proceso de entrenamiento: ni el numero de imagenes, ni la composicion del dataset, ni los pasos de entrenamiento, la tasa de aprendizaje, el rango del LoRA, el metodo de regularizacion ni si se emplearon tecnicas de captioning automatico. Tampoco se documenta ningun metodo de alineacion adicional (por ejemplo, ajuste con preferencias humanas). La unica informacion funcional es el prompt de instancia y las cuatro palabras de activacion, que apuntan a un entrenamiento orientado a capturar la identidad de un personaje concreto.

## Capacidades

- Generacion de imagenes text-to-image: produce imagenes condicionadas por un prompt de texto, heredando las capacidades del modelo base krea/Krea-2-Turbo.
- Personalizacion de personaje: el adaptador incorpora la identidad "Celeste" (pelo blanco, ojos verde claro, piel palida), activable mediante las palabras clave documentadas.
- Aplicacion selectiva: al ser un LoRA, puede activarse o desactivarse en tiempo de inferencia sin recargar el modelo base, lo que permite alternar entre el estilo del personaje y el comportamiento original del modelo.
- Composicion con otros adaptadores: no disponible (la model card no documenta compatibilidad ni pesos de mezcla con otros LoRA).
- Tool calling / function calling: no aplica (es un modelo de generacion de imagenes).
- Capacidades de agente o razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible.
- Otras capacidades especiales (vision, audio, thinking mode): no aplica.

## Casos de uso

- Ilustracion de personajes para novelas visuales: el adaptador permite generar de forma repetida al personaje Celeste con rasgos consistentes (pelo blanco, ojos verde claro, piel palida) a partir de prompts que incluyan las palabras de activacion, lo que reduce el trabajo manual de mantener la identidad entre ilustraciones.
- Assets para videojuegos independientes: se puede emplear para generar retratos, avatares o bocetos conceptuales de un personaje secundario, aplicando el LoRA sobre Krea-2-Turbo en un flujo de diffusers o ComfyUI y exportando las imagenes como referencia para el equipo de arte.
- Storyboarding y previsualizacion: integrado en un pipeline de generacion por lotes, sirve para producir viñetas rapidas de una secuencia narrativa manteniendo el mismo personaje en todas las escenas.
- Avatares y contenido para redes sociales: generacion de imagenes de perfil o ilustraciones tematicas coherentes con la identidad del personaje, con control del estilo mediante el prompt de texto.
- Concept art y exploracion de variaciones: combinando el LoRA con prompts de indumentaria, iluminacion o encuadre, se pueden explorar variaciones del personaje sin reentrenar, aprovechando que el adaptador solo modifica parcialmente el modelo base.
- Prototipado rapido de personajes para comics o fanzines: permite validar el diseno del personaje antes de encargar el trabajo definitivo a un ilustrador humano, generando varias propuestas con coste computacional bajo.
- Datos sinteticos para pruebas de pipelines: util para equipos que necesitan lotes de imagenes de un mismo personaje ficticio para probar sistemas de etiquetado, deteccion o interfaces de usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de identidad facial, evaluacion humana) ni comparaciones cuantitativas con otros adaptadores. Tampoco existen evaluaciones de terceros asociadas al repositorio, que registra cero descargas.

## Requisitos de hardware

- VRAM para el adaptador: el LoRA en si ocupa 0,5 GB en disco y anade un consumo de VRAM despreciable frente al modelo base; el requisito real lo determina krea/Krea-2-Turbo, cuyos requisitos oficiales no se han publicado en la informacion disponible.
- VRAM para inferencia: no disponible para el modelo base. Como referencia general de la categoria, los modelos de difusion de imagen de gran tamano suelen requerir entre 8 GB y 24 GB de VRAM en funcion de la precision (fp16/bf16 frente a cuantizaciones de 8 o 4 bits) y la resolucion de salida.
- GPU recomendadas: no disponible. En terminos generales, GPU de consumo tipo RTX 3060, 4070 o 4090 pueden ejecutar adaptadores LoRA de difusion si el modelo base cabe en memoria; para modelos base grandes se suele recurrir a A100, H100 o L40S.
- Compatibilidad con GPU de consumo: probable si el modelo base cabe en la GPU, dado que el LoRA anade una sobrecarga minima; no confirmado por el autor.
- Opciones de despliegue: diffusers (libreria declarada en el repositorio), y por compatibilidad de formato, entornos como ComfyUI, Automatic1111/Forge u otras interfaces que carguen LoRA de difusion. El soporte especifico no esta documentado por el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AiMamis/Celeste | LoRA de personaje (text-to-image) | krea/Krea-2-Turbo | no disponible | openrail++ | HuggingFace, 0 descargas |
| krea/Krea-2-Turbo (sin adaptador) | Modelo de difusion base | no aplica | no disponible | no disponible | HuggingFace |
| Otros LoRA de personaje sobre Krea-2-Turbo | LoRA de personaje | krea/Krea-2-Turbo | no disponible | variable | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento ni de alternativas concretas identificadas en la informacion proporcionada que permitan una comparacion cuantitativa. La unica comparacion posible es funcional: Celeste anade la identidad de un personaje concreto sobre el comportamiento del modelo base, sin modificar la arquitectura ni el pipeline de inferencia.

## Limitaciones y advertencias

- Ausencia total de validacion: cero descargas y cero "likes" en el momento de la consulta; no hay evaluaciones independientes ni ejemplos verificables mas alla de la imagen del widget.
- Documentacion minima: la model card solo describe palabras de activacion y descarga; no incluye recetas de inferencia, escalas de peso del LoRA, rango ni hiperparametros.
- Riesgo de sobreajuste del personaje: al ser un LoRA de identidad, puede degradar la diversidad de las generaciones o imponer rasgos no deseados si se usa con pesos altos; no hay guia al respecto.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar anatomia incorrecta, texto ilegible en la imagen o artefactos, especialmente en resoluciones alejadas de las de entrenamiento.
- Sesgos: no documentados. El dataset de entrenamiento es desconocido, por lo que no se puede evaluar el sesgo demografico o estilistico del adaptador.
- Limitaciones de idioma: no disponible; el rendimiento del prompt depende del codificador de texto del modelo base.
- Restricciones de licencia: se distribuye bajo openrail++, que impone condiciones de uso (entre ellas, restricciones sobre determinados usos y obligaciones de atribucion y de compartir condiciones en obras derivadas). Es responsabilidad del usuario revisar el texto completo de la licencia antes de un uso comercial.
- Dependencia del modelo base: el adaptador no es autonomo; su comportamiento y sus requisitos de hardware dependen por completo de krea/Krea-2-Turbo.
- Idoneidad para produccion: no recomendable como componente critico sin una evaluacion previa propia, dado que no existe evidencia publica de calidad, estabilidad ni cobertura de casos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AiMamis/Celeste
- Archivos y versiones: https://huggingface.co/AiMamis/Celeste/tree/main
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a un foro de videojuegos sin relacion con Celeste ni con krea/Krea-2-Turbo.
