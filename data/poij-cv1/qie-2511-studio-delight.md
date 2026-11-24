# Poij-cv1/QIE-2511-Studio-DeLight

## Resumen

QIE-2511-Studio-DeLight es un adaptador LoRA para el modelo de edicion de imagen a imagen Qwen-Image-Edit-2511, desarrollado por el autor Poij-cv1 (el README atribuye la autoria a Prithiv Sakthi). Su funcion concreta es el relighting: elimina la iluminacion existente de una fotografia y la sustituye por una luz de estudio neutra, suave y difusa, preservando la identidad del sujeto, la composicion, las texturas y la geometria de la escena original.

El modelo no es un generador de imagenes autonomo, sino un adaptador de bajo rango que se carga sobre el pipeline base de Qwen-Image-Edit-2511 mediante la libreria diffusers. Se activa con un prompt disparador fijo ("Neutral uniform lighting Preserve identity and composition") y esta pensado para fotografia de interior, imagenes sobreexpuestas o con dominantes de color, donde busca exposicion equilibrada y sombreado realista sin artefactos ni sombras direccionales duras.

Es relevante dentro del ecosistema de edicion fotografica asistida por IA porque resuelve una tarea muy especifica (normalizacion de iluminacion) con un adaptador ligero de 0,9 GB, licencia Apache 2.0 y compatibilidad declarada con las versiones 2509 y 2511 del modelo base de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Qwen-Image-Edit-2511 |
| Parametros totales | no disponible (adaptador LoRA; tamano del repo 0,9 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de difusion; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato propio de adaptadores LoRA en diffusers; no confirmado explicitamente en la model card) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen-Image-Edit-2511, el modelo de edicion de imagen de Qwen, y se distribuye como pesos LoRA cargables con `pipe.load_lora_weights()` en un `DiffusionPipeline` de diffusers. La model card indica que el entrenamiento se realizo en ModelScope.cn y que el adaptador es compatible tanto con la version 2509 como con la 2511 del modelo base, lo que sugiere que el LoRA opera sobre las capas de atencion o proyeccion compartidas entre ambas revisiones.

No se detallan en la informacion disponible el numero de pasos de entrenamiento, el tamano o composicion del dataset, el rango del LoRA ni si se emplearon tecnicas de regularizacion o RLHF (no aplicable en este tipo de adaptadores). La innovacion tecnica declarada es funcional: la capacidad de neutralizar la iluminacion existente y sustituirla por luz difusa uniforme manteniendo la identidad y la geometria, con un comportamiento especialmente afinado para fotografia de interior y escenas con dominantes de color.

## Capacidades

- Relighting de imagenes: elimina la iluminacion original y aplica luz de estudio neutra y difusa.
- Preservacion de identidad, composicion, texturas y geometria de la imagen de entrada.
- Exposicion equilibrada y sombreado realista sin artefactos, reflejos duros ni sombras direccionales.
- Edicion image-to-image sobre el pipeline de Qwen-Image-Edit-2511 (y compatibilidad declarada con 2509).
- Activacion mediante prompt disparador fijo: "Neutral uniform lighting Preserve identity and composition".
- Mejor rendimiento en fotografia de interior, imagenes sobreprocesadas y con fusion de color.
- No se documentan capacidades de generacion de texto, codigo, matematicas, tool calling, agentes ni audio.

## Casos de uso

- Normalizacion de iluminacion en catalogos de producto: aplicar el LoRA a fotografias de e-commerce tomadas con luz desigual para obtener una iluminacion homogenea y coherente entre fichas de producto, manteniendo la forma y el color del articulo.
- Retoque de retratos en interior: neutralizar sombras direccionales y luces duras en fotografias de estudio o domiciliarias, preservando la identidad del sujeto gracias a la conservacion de rasgos declarada.
- Correccion de imagenes con dominantes de color: procesar imagenes con fusion de color o sobreexposicion para recuperar una exposicion equilibrada antes de su publicacion.
- Preparacion de datasets de vision por computador: uniformar la iluminacion de un conjunto de imagenes de entrenamiento para reducir el sesgo de iluminacion en modelos de deteccion o segmentacion.
- Preprocesado en pipelines de fotografia automatizada: integrar el adaptador como paso previo en flujos de postproduccion por lotes con diffusers, aplicando el prompt disparador de forma estandarizada.
- Prototipado de herramientas de edicion fotografica: construir demos o interfaces de relighting sobre el pipeline base de Qwen-Image-Edit, aprovechando la licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Qwen-Image-Edit-2511, no del adaptador (0,9 GB adicionales en disco). El ejemplo de la model card usa `dtype=torch.bfloat16` y `device_map="cuda"`.
- GPU recomendadas: no especificadas en la informacion disponible; por el uso de bfloat16 y el pipeline de difusion, se requiere una GPU con VRAM suficiente para el modelo base (no cuantificada en la ficha).
- Compatibilidad con GPU de consumo: no confirmada; la model card menciona el backend "mps" para dispositivos Apple como alternativa a CUDA.
- Opciones de despliegue: diffusers (con `transformers` y `accelerate`), segun el quick start oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QIE-2511-Studio-DeLight | LoRA | Qwen-Image-Edit-2511 | Relighting de estudio | Apache 2.0 | Hugging Face |
| Flux2-Klein-Delight-LoRA | LoRA | Flux2-Klein | Relighting (inspiracion declarada) | no disponible | Hugging Face (linoyts) |
| Qwen-Image-Edit-2511 | Modelo completo | - | Edicion image-to-image general | no disponible en esta ficha | Hugging Face (Qwen) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- En escenas abiertas o exteriores puede generar fondos blancos o despejados, ya que la luz solar dura tiende a neutralizarse; el autor recomienda su uso en interiores.
- Requiere el prompt disparador exacto para activar el comportamiento de relighting; sin el, el adaptador puede no aplicar la transformacion esperada.
- Solo soporta ingles como idioma declarado.
- Al ser un adaptador sobre un modelo de difusion, hereda los sesgos y limitaciones del modelo base Qwen-Image-Edit-2511, no documentados en esta ficha.
- Riesgo de alteracion no deseada de identidad o texturas en imagenes con iluminacion muy extrema, aunque el autor declara preservacion de identidad y geometria.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen-Image-Edit-2511 antes de desplegar en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del rendimiento real.
- No se documentan cuantizaciones ni requisitos minimos de VRAM, lo que dificulta planificar el despliegue en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Poij-cv1/QIE-2511-Studio-DeLight
- Archivos del modelo (referenciados en el README): https://huggingface.co/prithivMLmods/QIE-2511-Studio-DeLight/tree/main
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- LoRA de inspiracion (Flux2-Klein-Delight-LoRA): https://huggingface.co/linoyts/Flux2-Klein-Delight-LoRA
- Plataforma de entrenamiento: https://modelscope.cn
