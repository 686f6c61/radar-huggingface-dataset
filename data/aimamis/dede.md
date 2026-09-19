# AiMamis/Dede

## Resumen

Dede es un adaptador LoRA de generacion de imagenes a partir de texto (text-to-image) publicado por el usuario AiMamis en Hugging Face. Se trata de un ajuste de bajo rango (Low-Rank Adaptation) entrenado sobre el modelo base krea/Krea-2-Turbo, y su proposito es reproducir de forma consistente la apariencia de un personaje concreto: pelo negro corto, pecas, ojos verdes y piel clara. El repositorio contiene unicamente los pesos del adaptador (0,5 GB), no un modelo completo, por lo que su uso requiere descargar y cargar previamente el modelo base.

El modelo se distribuye con la libreria diffusers y sigue la plantilla estandar de LoRA de difusion, con un conjunto de palabras de activacion (trigger words) que el usuario debe incluir en el prompt: `Dede`, `Short black hair`, `Freckles`, `Green eyes` y `Fair skin`. La licencia declarada es openrail++, y el pipeline asociado es text-to-image.

Se trata de un modelo con cero descargas y cero "likes" en el momento de redactar esta ficha, publicado el 19 de septiembre de 2026 segun los metadatos del repositorio. No hay informacion publicada sobre el dataset de entrenamiento, el rango del adaptador, el numero de pasos ni resultados de evaluacion, por lo que debe considerarse un artefacto sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible. Se trata de un adaptador LoRA sobre un modelo de difusion text-to-image; la informacion proporcionada no detalla la arquitectura del modelo base krea/Krea-2-Turbo |
| Parametros totales | no disponible (pesos del adaptador: 0,5 GB en el repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica. Modelo de generacion de imagen condicionada por prompt de texto; no se especifica la longitud maxima del prompt |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible. Las palabras de activacion y la model card estan en ingles |
| Licencia | openrail++ |
| Formato de pesos | no disponible. El repositorio usa la libreria diffusers y pesa 0,5 GB; el formato concreto de los ficheros no se especifica en la informacion disponible |
| Modelo base | krea/Krea-2-Turbo |
| Palabras de activacion | Dede, Short black hair, Freckles, Green eyes, Fair skin |
| Pipeline | text-to-image |
| Tamano del repositorio | 0,5 GB |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base krea/Krea-2-Turbo ni sobre la configuracion del adaptador. Por los metadatos disponibles (etiquetas `lora`, `diffusers`, `template:diffusion-lora`), se trata de un ajuste por adaptadores de bajo rango sobre un modelo de difusion preentrenado, una tecnica que congela los pesos originales e inserta matrices de bajo rango en determinadas capas, reduciendo drasticamente el numero de parametros entrenables y el tamano del artefacto resultante.

Tampoco se detallan los datos de entrenamiento: no hay informacion sobre el numero de imagenes utilizadas, la resolucion, el numero de pasos de entrenamiento, el rango (rank) ni el valor de alpha del LoRA, ni sobre si se aplicaron tecnicas de regularizacion o de aumento de datos. El unico dato funcional es el prompt de instancia declarado en la model card: `Dede, Short black hair, Freckles, Green eyes, Fair skin`, que define las caracteristicas visuales que el adaptador aprende a asociar con la palabra de activacion principal.

## Capacidades

- Generacion de imagenes de un personaje consistente a partir de un prompt de texto, invocando la palabra de activacion `Dede`.
- Control de atributos fisicos concretos mediante palabras de activacion independientes: color y corte de pelo, pecas, color de ojos y tono de piel.
- Combinacion con prompts libres de escena, iluminacion, estilo, encuadre y composicion, siempre que se mantenga el activador del personaje.
- Generacion condicionada por texto en el pipeline text-to-image de diffusers.
- Potencial uso con tecnicas de control adicionales del ecosistema del modelo base (por ejemplo, img2img o inpainting), supeditado a que el modelo base las soporte; no confirmado en la informacion disponible.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: no es un modelo de lenguaje.
- Capacidades multilingues: no disponibles; la model card solo documenta prompts en ingles.
- Capacidades especiales (modo thinking, vision, audio): no aplica.

## Casos de uso

- Diseno de personajes para narrativa visual: el LoRA permite mantener rasgos faciales y de pelo coherentes entre ilustraciones de un mismo personaje a lo largo de una serie de escenas, generando cada imagen con el prompt del personaje mas la descripcion de la escena.
- Ilustracion de comic y novela grafica: resulta adecuado para producir bocetos y paginas preliminares de un personaje recurrente sin reentrenar el modelo base en cada viñeta, ajustando pose y encuadre mediante el prompt.
- Prototipado de assets para videojuegos: generar retratos y avatares de un personaje no jugable con aspecto uniforme para iterar rapidamente sobre direccion de arte antes de producir el asset final.
- Creacion de avatares y retratos de perfil: a partir de un prompt con `Dede` y variaciones de iluminacion y fondo, se pueden generar multiples propuestas de retrato para uso en redes o materiales de marca.
- Storyboarding para audiovisual: generar fotogramas clave consistentes del mismo personaje para presentar una secuencia ante un equipo de produccion, con control del vestuario y del entorno mediante el prompt.
- Generacion de material promocional o mockups: incorporar el personaje en composiciones de marketing (carteles, banners) manteniendo su identidad visual entre piezas.
- Aumento de datos para otros entrenamientos: generar variaciones del personaje bajo distintas condiciones para construir un dataset de referencia, teniendo en cuenta las restricciones de la licencia sobre el uso del resultado.
- Experimentacion artistica y proyectos personales: es un adaptador ligero (0,5 GB) que se puede cargar y descargar rapidamente para probar variaciones de estilo sobre el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud de identidad u otras), ni comparaciones con adaptadores equivalentes, ni ejemplos de evaluacion sistematica.

## Requisitos de hardware

- El repositorio contiene solo el adaptador (0,5 GB). Los requisitos reales de VRAM vienen determinados por el modelo base krea/Krea-2-Turbo, cuyas especificaciones no se detallan en la informacion proporcionada.
- VRAM estimada para inferencia: no disponible. Depende del modelo base, de la resolucion de generacion, del tipo de precision (fp16, bf16, fp8) y del uso de optimizaciones como offloading o atencion eficiente.
- GPU recomendadas: no disponibles para este adaptador en concreto, al no conocerse el modelo base.
- Viabilidad en GPU de consumo: no confirmada. Un adaptador LoRA anade un coste de memoria marginal (del orden de cientos de megabytes) respecto al modelo base, por lo que el factor limitante sera siempre el modelo base.
- Opciones de despliegue: la libreria declarada es diffusers; el formato estandar de LoRA de difusion suele ser compatible tambien con interfaces como ComfyUI, Automatic1111/Forge o SD.Next, aunque no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento de este adaptador. Como referencia estructural, la unica comparacion posible es con el propio modelo base sin el adaptador, tal como se recoge a continuacion; los campos no documentados se marcan como no disponibles.

| Modelo | Tipo | Parametros | Contexto o resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AiMamis/Dede | LoRA sobre modelo de difusion | no disponible (adaptador de 0,5 GB) | no disponible | openrail++ | Hugging Face |
| krea/Krea-2-Turbo (sin adaptador) | Modelo base text-to-image | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Ausencia total de validacion: cero descargas y cero "likes" en el momento de redactar la ficha; no hay evidencia de terceros sobre la calidad o fidelidad del personaje.
- Riesgo de sobreajuste (overfitting): en adaptadores de personaje entrenados con pocas imagenes es habitual que el modelo reproduzca poses, fondos o iluminacion del dataset original, o que degrade la capacidad del modelo base para generar otros conceptos.
- Fidelidad limitada al prompt de activacion: si no se incluyen las palabras `Dede`, `Short black hair`, `Freckles`, `Green eyes` o `Fair skin`, el efecto del adaptador puede no activarse o hacerlo de forma parcial.
- Idioma: toda la documentacion y las palabras de activacion estan en ingles; el comportamiento con prompts en castellano no esta documentado y dependera del modelo base.
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede producir artefactos anatomicos, texto ilegible en la imagen o incoherencias entre elementos de la escena. No hay datos publicados sobre la frecuencia de estos fallos en este adaptador.
- Sesgos: no hay informacion sobre la composicion del dataset de entrenamiento; es previsible que el modelo herede los sesgos del modelo base y del material de entrenamiento del adaptador (por ejemplo, sesgos de representacion etnica o de canon de belleza), pero no hay datos para cuantificarlos.
- Derechos de imagen: si el personaje "Dede" reproduce la imagen de una persona real, su uso comercial o su difusion pueden vulnerar derechos de imagen o de propiedad intelectual. La model card no aclara el origen del material de entrenamiento.
- Licencia openrail++: permite el uso comercial, pero incluye restricciones de uso responsable recogidas en el anexo de la licencia. Conviene revisar el texto completo antes de un despliegue en produccion, asi como las condiciones del modelo base krea/Krea-2-Turbo, que pueden imponer requisitos adicionales.
- Dependencia del modelo base: cualquier cambio de licencia o de disponibilidad del modelo base afecta directamente a la viabilidad de este adaptador.
- Sin informacion de mantenimiento: el repositorio se creo y actualizo el mismo dia (2026-09-19) y no hay indicios de actualizaciones posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AiMamis/Dede
- Ficheros y versiones del repositorio: https://huggingface.co/AiMamis/Dede/tree/main
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Resultados de la busqueda web: no se han encontrado enlaces relevantes. Las busquedas devolvieron unicamente sitios de efemerides historicas (onthisday.com, britannica.com, timeanddate.com, todayinhistory.app), sin relacion con el modelo, con LoRA de difusion ni con su autor. No se dispone de paper, blog tecnico ni repositorio de codigo asociado.
