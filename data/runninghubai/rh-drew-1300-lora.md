# RunningHubAI/rh-drew-1300-lora

## Resumen

rh-drew-1300-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en Hugging Face. No es un modelo de lenguaje: es un fichero de pesos de bajo rango (218 MiB, `Drew_000001300.safetensors`) afinado a partir del modelo base Krea 2, tal y como indica su model card. Su funcion es introducir un personaje concreto, activado mediante la palabra clave "Drew", en flujos de generacion y edicion de imagen condicionados por texto (pipeline declarado: `image-text-to-image`).

El modelo resuelve un problema acotado y muy habitual en produccion grafica: mantener la coherencia de identidad de un personaje entre distintas generaciones y ediciones sin reentrenar el modelo base. Al ser un LoRA, se carga sobre Krea 2 y anade un coste de almacenamiento minimo en comparacion con un fine-tuning completo, lo que facilita su uso en ComfyUI, en la plataforma RunningHub o mediante la API del propio proveedor.

La relevancia de esta ficha es limitada y conviene ser explicito: el repositorio no documenta arquitectura del modelo base, numero de imagenes de entrenamiento, licencia concreta ni resultados de evaluacion, y acumula cero descargas y cero "likes" en el momento de la consulta. Se trata, por tanto, de un artefacto de nicho orientado a creadores que ya trabajen con Krea 2 y que acepten validar su comportamiento por su cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Krea 2; arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible (fichero de pesos de 218 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye un fichero safetensors sin cuantizar |
| Idiomas soportados | no disponible (el idioma del prompt lo determina el modelo base Krea 2) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o del modelo upstream, sin concretarla |
| Formato de pesos | safetensors (`Drew_000001300.safetensors`) |

## Arquitectura y entrenamiento

La informacion proporcionada describe unicamente un adaptador LoRA entrenado a partir de Krea 2, con el campo "Finetuned from: krea2" en la model card. No se detalla si el modelo base es un transformer de difusion (DiT), un U-Net o una arquitectura hibrida, ni el rango, el alpha, la dimension de las matrices de bajo rango o los modulos objetivo del adaptador. Tampoco se especifica el numero de imagenes de entrenamiento, la resolucion, el uso de captions, el tipo de scheduler de difusion ni si hubo etapas de refinamiento posteriores.

El unico dato operativo relevante es la palabra de activacion ("Drew") y el identificador del checkpoint (`Drew_000001300`, que sugiere un entrenamiento de 1300 pasos o iteraciones). El autor publica el modelo a traves de la infraestructura de entrenamiento de RunningHub, pero no aporta curva de perdida, ejemplos comparativos ni parametros de muestreo recomendados (CFG, sampler, steps). Cualquier reproducibilidad queda, por tanto, en manos del usuario.

## Capacidades

- Edicion de imagen condicionada por texto (pipeline `image-text-to-image`) integrada en flujos de ComfyUI.
- Insercion y representacion de un personaje concreto ("Drew") mediante la palabra clave de activacion.
- Mantenimiento de la identidad del personaje entre generaciones, que es el objetivo habitual de un LoRA de personaje.
- Compatibilidad declarada con ComfyUI, la plataforma RunningHub y Hugging Face como repositorio de pesos.
- Ejecucion en linea a traves de la API de RunningHub (el autor enlaza la documentacion de la API y un endpoint de ejemplo para Seedance 2.5, no especifico de este LoRA).
- No hay informacion sobre soporte de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio, modo "thinking" ni capacidades multilingues: son funciones no aplicables o no documentadas para este tipo de modelo.
- No se documentan capacidades de control adicionales (ControlNet, inpainting guiado por mascara, IP-Adapter, referencias de estilo).

## Casos de uso

- Ilustracion de personaje recurrente: uso del LoRA con la palabra clave "Drew" para generar al personaje en distintas escenas y poses manteniendo rasgos consistentes, algo critico en series de ilustraciones o webcomics.
- Edicion de imagenes existentes: al tratarse de un modelo de `image-text-to-image`, permite modificar una imagen de partida (fondo, vestuario, iluminacion) conservando la identidad del personaje, util para retoques de encargo sin rehacer la pieza.
- Preproduccion de videojuegos: generacion rapida de concept art y hojas de personaje coherentes para iterar sobre un diseno antes de modelar en 3D.
- Storyboards y narrativa visual: produccion de secuencias de viñetas donde el personaje debe reconocerse entre planos, con un coste de inferencia inferior al de un fine-tuning completo.
- Contenido para redes y campanas: creacion de piezas graficas seriadas con una mascota o personaje de marca, automatizables por lotes en ComfyUI.
- Prototipado de pipelines de generacion: al ser un fichero de 218 MiB, se puede versionar y sustituir rapidamente dentro de un grafo de ComfyUI para comparar variantes de personaje.
- Automatizacion via API: despliegue del flujo en la infraestructura de RunningHub y exposicion mediante su API para integrarlo en herramientas internas de diseno.
- Ilustracion editorial: generacion de imagenes para libros o articulos donde se necesite el mismo personaje a lo largo de varias paginas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye FID, CLIP score, similitud de identidad facial, comparativas cualitativas ni curvas de entrenamiento.

## Requisitos de hardware

- La VRAM necesaria la determina el modelo base Krea 2, no el LoRA: no disponible en la informacion proporcionada.
- El adaptador anade un sobrecoste minimo de memoria y almacenamiento: el fichero pesa 218 MiB, muy por debajo de un fine-tuning completo del modelo base.
- GPU recomendadas: no disponible; depende enteramente de los requisitos de Krea 2, que la model card no especifica.
- Compatibilidad con GPU de consumo: no confirmada. No se puede afirmar que quepa en una RTX 4090 u otra GPU consumer sin conocer el modelo base y su cuantizacion.
- Opciones de despliegue confirmadas: ComfyUI, plataforma RunningHub y uso en linea mediante la API de RunningHub. No se documenta soporte explicito para vLLM, llama.cpp, Ollama, TGI (herramientas orientadas a modelos de lenguaje, no aplicables) ni para bibliotecas de difusion como diffusers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion verificable sobre alternativas comparables en la documentacion facilitada. La categoria natural de comparacion serian otros LoRA de personaje entrenados sobre el mismo modelo base Krea 2, pero no hay datos publicos incluidos sobre sus parametros, licencias ni rendimiento.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-drew-1300-lora | no disponible (pesos de 218 MiB) | no aplica | no disponible | no disponible | Hugging Face, ComfyUI, RunningHub |
| Alternativas comparables (LoRA de personaje sobre Krea 2) | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ambito muy restringido: es un LoRA de personaje, no un modelo generalista. Fuera de la generacion y edicion de imagenes de "Drew" su utilidad es nula.
- Dependencia total del modelo base: sin Krea 2 no se puede cargar ni evaluar; la calidad final esta limitada por el modelo base, que no se documenta.
- Sin garantia de coherencia de identidad: no se aportan ejemplos, metricas ni parametros de muestreo recomendados, por lo que la fidelidad del personaje debe validarse empiricamente.
- Riesgo de sobreajuste a las imagenes de entrenamiento (poses, encuadres, iluminacion o estilos concretos), dado que se desconoce la composicion del dataset.
- Riesgo de artefactos en ediciones complejas, especialmente en rostros, manos y cambios de pose, habitual en adaptadores de bajo rango.
- Licencia sin concretar: la model card remite a "la licencia del proyecto original o upstream" sin especificarla. No hay autorizacion explicita para uso comercial, por lo que en produccion debe aclararse antes con el autor o con RunningHub.
- Ausencia de validacion comunitaria: cero descargas y cero "likes" en el momento de la consulta; no existe evidencia externa de funcionamiento ni de calidad.
- Posibles sesgos del dataset de entrenamiento (demograficos, estilisticos o de representacion) desconocidos, al no documentarse los datos.
- Metadatos inconsistentes: las fechas de creacion y actualizacion del repositorio (24 de septiembre de 2026) son posteriores a la fecha habitual de publicacion, lo que sugiere un error de registro; conviene no fiarse de la cronologia del repositorio.
- Idioma del prompt no especificado: el rendimiento multilingue dependera del tokenizador y del codificador de texto de Krea 2.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-drew-1300-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2100864177724596226
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2099455463904886785
- Plataforma RunningHub: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Pagina de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Endpoint de ejemplo citado en la model card (Seedance 2.5): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- README en chino del repositorio: README_cn.md (mismo repositorio de Hugging Face)
