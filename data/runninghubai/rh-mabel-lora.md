# RunningHubAI/rh-mabel-lora

## Resumen

rh-mabel-lora es un adaptador LoRA de tipo text-to-image publicado por RunningHubAI (autor acreditado como "carlos alan" en la plataforma RunningHub) para el modelo base Z-Image Base. Su funcion es inyectar en el modelo generativo el concepto visual del personaje "Mabel", activable mediante la palabra gatillo `mabel`. No es un modelo de lenguaje ni un modelo fundacional: es un peso adicional de 162 MiB que se carga junto al modelo base para condicionar la generacion de imagenes hacia ese personaje concreto.

El repositorio tiene un tamano total de 0,2 GB y contiene un unico fichero de pesos en formato safetensors (`20261114-02906572.safetensors`). Esta etiquetado para ComfyUI y su pipeline declarado es text-to-image. La publicacion es reciente (creada el 18 de noviembre de 2026) y no registra descargas ni likes en el momento de la consulta, por lo que se trata de un artefacto de nicho dentro del ecosistema de LoRAs de personaje.

La relevancia de esta ficha es acotada: no hay informacion publica sobre el dataset de entrenamiento, hiperparametros, licencia efectiva ni evaluaciones cuantitativas. Lo que se puede documentar con rigor es su naturaleza (LoRA sobre Z-Image Base), su formato, su tamano y su integracion en flujos ComfyUI/RunningHub. Todo lo demas debe marcarse como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Z-Image Base; arquitectura del base no disponible |
| Parametros totales | no disponible (peso del adaptador: 162 MiB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el prompt se procesa mediante el text encoder del modelo base) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`20261114-02906572.safetensors`, 162 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se suman a determinadas capas del modelo base Z-Image Base durante la inferencia. La model card indica explicitamente "Finetuned from: Z-image-base" y fija una unica palabra gatillo, `mabel`. No se especifica el rango del LoRA, las capas objetivo, la tasa de aprendizaje, el numero de pasos, el tamano del dataset ni la composicion de las imagenes de entrenamiento. Tampoco se documenta si hubo regularizacion, captions automaticos o aumento de datos.

No hay informacion sobre el proceso de entrenamiento mas alla de que se realizo en la plataforma RunningHub (la model card enlaza a su pagina de entrenamiento). No se mencionan tecnicas como decodificacion especulativa, atencion lineal ni variantes arquitectonicas propias: al ser un adaptador, hereda integramente la arquitectura y el comportamiento del modelo base, que no se describe en la informacion disponible.

## Capacidades

- Generacion de imagenes text-to-image condicionada al personaje "Mabel" mediante la palabra gatillo `mabel`.
- Composicion con el modelo base Z-Image Base: el LoRA no funciona de forma autonoma, requiere cargar el base.
- Integracion en flujos ComfyUI (etiqueta `comfyui` en el repositorio).
- Ejecucion en la plataforma RunningHub, tanto en su version internacional como en la china, con posibilidad de invocacion via API.
- Control de identidad de personaje en prompts de imagen; el resto de capacidades (estilos, composicion, iluminacion) dependen del modelo base.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni procesamiento de lenguaje: no es un modelo de texto.
- Capacidades multilingues: no disponibles; dependen del text encoder del base.

## Casos de uso

- Ilustracion consistente de personaje: usar `mabel` en el prompt junto con el modelo Z-Image Base para generar variaciones del personaje manteniendo rasgos reconocibles en una serie de imagenes.
- Creacion de assets para narrativa visual: generar paneles o ilustraciones de un comic o storyboard donde el personaje aparece en escenas distintas, manteniendo coherencia de identidad entre tomas.
- Prototipado de personajes para videojuegos o animacion: producir hojas de concepto y poses de referencia antes de encargar modelado 3D o ilustracion final.
- Generacion de avatares y retratos: crear imagenes de perfil o retratos estilizados del personaje para comunidades, redes o materiales promocionales.
- Flujos automatizados en ComfyUI: encadenar el LoRA con nodos de upscaling, inpainting o ControlNet para producir lotes de imagenes del personaje con poses controladas.
- Integracion via API de RunningHub: invocar el modelo desde un backend para generar imagenes bajo demanda en una aplicacion web o bot, sin gestionar infraestructura de GPU propia.
- Experimentacion e investigacion: servir como caso de estudio de LoRAs de personaje sobre Z-Image Base para comparar fidelidad de identidad y sensibilidad a la palabra gatillo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay metricas de fidelidad de identidad (por ejemplo, similitud facial), FID, CLIP score ni comparaciones cuantitativas con otros LoRAs de personaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el LoRA de forma aislada; depende enteramente del modelo base Z-Image Base, cuyos requisitos no se detallan en la informacion proporcionada.
- El adaptador en si ocupa 162 MiB en disco, un coste adicional marginal sobre el modelo base.
- GPU recomendadas: no disponibles. Al no conocerse el tamano del base, no se puede confirmar si cabe en GPU de consumo (RTX 3060, 4060, 4090) o si requiere A100/H100.
- Opciones de despliegue: ComfyUI (etiqueta oficial del repositorio) y la plataforma RunningHub (web y API). No se confirma soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRAs de personaje comparables ni datos del modelo base Z-Image Base que permitan establecer una comparacion con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se publican hiperparametros de entrenamiento, dataset, rango del LoRA ni capas objetivo, lo que impide reproducir o auditar el entrenamiento.
- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream. Antes de cualquier uso comercial es imprescindible verificar la licencia de Z-Image Base y los terminos de RunningHub; el uso comercial no esta garantizado.
- Dependencia estricta del modelo base: el LoRA no es util sin Z-Image Base y puede comportarse de forma distinta segun la version o el checkpoint exacto del base.
- Sensibilidad a la palabra gatillo: el personaje solo se activa de forma fiable con `mabel`; prompts sin ella pueden no reproducir la identidad.
- Riesgo de sobreajuste y rigidez: sin datos de entrenamiento no se puede descartar que el LoRA reproduzca poses, fondos o estilos del dataset original, limitando la variedad.
- Riesgo de sesgos: al ser un LoRA de personaje, puede heredar sesgos de representacion (genero, etnia, edad, corporalidad) del dataset y del modelo base, no documentados.
- Sin evaluaciones de calidad: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni ejemplos verificables de fidelidad.
- Advertencia de derechos: si el personaje "Mabel" esta asociado a una obra protegida, la generacion y difusion de imagenes podria infringir derechos de propiedad intelectual; la model card no aclara el origen del personaje.
- Fecha de creacion futura en los metadatos (2026-11-18): conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-mabel-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2121822595178938369
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2117711782739890177
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API (Seedance 2.5): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- README en chino: https://huggingface.co/RunningHubAI/rh-mabel-lora/blob/main/README_cn.md
