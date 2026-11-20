# farc077/Sara_Boustany_KREA2

## Resumen

Sara_Boustany_KREA2 es un adaptador LoRA de texto a imagen publicado por el usuario farc077 en Hugging Face. Se trata de un ajuste fino de bajo rango (LoRA) sobre el modelo base krea/Krea-2-Raw, orientado a la generacion de imagenes de la actriz Sara Boustany. El adaptador fue generado mediante la plataforma OneShotLoRA, un servicio que automatiza la creacion de LoRAs de identidad a partir de un conjunto reducido de imagenes de referencia.

El modelo resuelve un problema muy concreto: incorporar un sujeto (una persona concreta) al espacio latente de un modelo de difusion de texto a imagen, de forma que el prompt pueda referirse a esa identidad mediante una palabra disparadora y el modelo genere representaciones coherentes en multiples escenarios (ropa, entornos, poses). Es relevante para quienes necesitan personajes consistentes en flujos de generacion de imagenes, ya sea para ilustracion, previsualizacion de vestuario o creacion de contenido con identidades fijas.

La informacion publicada es escasa: no se detallan la arquitectura interna del LoRA (rango, modulos objetivo), el numero de imagenes de entrenamiento, la longitud de contexto ni los idiomas. El repositorio ocupa 0,2 GB y la licencia figura como "other", sin texto legal adicional en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion de texto a imagen; arquitectura interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | other (sin texto de licencia publicado en la model card) |
| Formato de pesos | no disponible (repositorio de 0,2 GB, compatible con el ecosistema de krea/Krea-2-Raw) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas del modelo base krea/Krea-2-Raw sin modificar sus pesos originales. Este esquema permite cargar y descargar la identidad de forma modular, manteniendo el modelo base intacto y compartiendo recursos entre distintos adaptadores. No se especifican el rango del LoRA, los modulos objetivo (attention, MLP, cross-attention) ni la tasa de aprendizaje empleada.

El entrenamiento se realizo con la herramienta OneShotLoRA, que automatiza el proceso de ajuste a partir de un conjunto de imagenes de la actriz. No se publica el numero de imagenes, la resolucion de entrenamiento, el numero de pasos ni si se aplicaron tecnicas de regularizacion o captioning detallado. Tampoco hay informacion sobre el modelo base Krea-2-Raw en la documentacion proporcionada (parametros, contexto, datos de preentrenamiento), por lo que no es posible detallar la arquitectura subyacente.

## Capacidades

- Generacion de imagenes de texto a imagen condicionada a la identidad de Sara Boustany mediante la palabra disparadora S4R4B.
- Control de vestuario y entorno a traves del prompt: los ejemplos de la model card describen camisa blanca formal con blazer negro en oficina, vestido rosa pastel con cardigan azul en un campo de hierba y camiseta blanca con vaqueros de talle alto frente a una pared.
- Control de pose y direccion de la mirada de forma textual ("sentada", "de pie", "mirando a la camara").
- Composición de escenas exteriores e interiores con iluminacion descrita en lenguaje natural.
- Integracion con el modelo base Krea-2-Raw, heredando las capacidades de generacion de ese modelo (no documentadas en la informacion disponible).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio.

## Casos de uso

- Previsualizacion de vestuario: generar a la actriz con distintas combinaciones de ropa y accesorios descritas en el prompt, lo que permite comparar estilismos antes de una sesion de fotografia o una produccion.
- Creacion de personajes consistentes para narrativa visual: usar la palabra disparadora S4R4B en una serie de prompts para mantener la misma identidad a lo largo de varias ilustraciones o viñetas.
- Pruebas de encuadre y localizacion: situar al sujeto en oficina, campo o exterior urbano para evaluar como responde el modelo a cambios de fondo y luz.
- Prototipado de campanas publicitarias: generar bocetos con una figura reconocible en contextos corporativos o de estilo de vida antes de contratar produccion real.
- Generacion de material para redes sociales: crear imagenes de perfil o contenido tematico con una identidad fija y coherente entre publicaciones.
- Investigacion sobre LoRAs de identidad: servir como caso de estudio de un adaptador generado con OneShotLoRA sobre Krea-2-Raw, util para comparar la fidelidad de identidad frente a otros pipelines de entrenamiento.
- Pruebas de sesgo y fidelidad en modelos de difusion: analizar como un adaptador de una persona concreta responde a prompts de genero, edad o etnia, y documentar los fallos de consistencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende enteramente del modelo base krea/Krea-2-Raw, cuyos requisitos no se documentan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el repositorio pesa 0,2 GB, pero el modelo base debe cargarse ademas del adaptador.
- Opciones de despliegue: no se especifican; la model card menciona ComfyUI en los nombres de los archivos de ejemplo (ComfyUI_temp_kgqpd_00001_.png), lo que sugiere que el autor lo uso en ese entorno.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sara_Boustany_KREA2 | LoRA de identidad | krea/Krea-2-Raw | no disponible | no disponible | other | Hugging Face, 0 descargas |
| LoRAs de identidad genericos (p. ej. los alojados en OneShotLoRA) | LoRA de identidad | variable | no disponible | no disponible | variable | plataformas de terceros |
| Adaptadores de personaje para SDXL / Flux | LoRA de identidad | SDXL, Flux | no disponible | no disponible | variable | Hugging Face, Civitai |

No se dispone de datos de rendimiento ni de parametros comparables para establecer una comparacion cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- La licencia figura como "other" sin texto legal publicado: no hay base clara para determinar si se permite el uso comercial. Es imprescindible contactar con el autor o consultar la licencia del modelo base antes de cualquier uso en produccion.
- El adaptador representa a una persona real identificable. Su uso puede vulnerar derechos de imagen, privacidad o normativa sobre deepfakes en funcion de la jurisdiccion; la model card descarga toda la responsabilidad legal en el usuario.
- Riesgo elevado de alucinacion visual: los LoRA de identidad entrenados con pocas imagenes suelen fallar en angulos no vistos, expresiones extremas o iluminaciones atipicas, generando rasgos inconsistentes.
- No se documenta el conjunto de entrenamiento, por lo que no es posible evaluar sesgos de genero, edad, etnia ni la fidelidad de la identidad en distintos contextos.
- Solo se proporcionan prompts de ejemplo en ingles; el comportamiento con prompts en castellano no esta verificado.
- El modelo base Krea-2-Raw no esta documentado en la informacion disponible; se desconocen sus limitaciones de resolucion, contexto y sesgos, que el adaptador hereda.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad ni evidencia de calidad mas alla de las tres imagenes de ejemplo.
- No apto para tareas de texto, codigo, razonamiento, vision de entrada ni agentes: es exclusivamente un adaptador de generacion de imagenes.

## Enlaces

- Hugging Face: https://huggingface.co/farc077/Sara_Boustany_KREA2
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Herramienta de generacion: https://oneshotlora.com
