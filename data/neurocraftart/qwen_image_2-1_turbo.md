# neurocraftart/qwen_image_2.1_turbo

## Resumen

`neurocraftart/qwen_image_2.1_turbo` es un espejo (mirror) del repositorio `mikeprass/qwen_image_2.1_turbo`, una redistribucion cuantizada del modelo de generacion de imagenes Qwen-Image 2.1 desarrollado por el equipo Qwen de Alibaba. El paquete incluye cuatro ficheros en formato safetensors que cubren el text encoder, el modelo de difusion turbo, un ControlNet union y el VAE, todos ellos preparados para su uso en ComfyUI con requisitos de VRAM reducidos. La cuantizacion aplicada es w4a8 con "convrot" e int8, obra de Mike Prass, y esta pensada para instaladores de NeuroCraft Studio.

El interes de esta publicacion es practico: permite ejecutar un pipeline de generacion de imagenes basado en Qwen-Image 2.1 en equipos con VRAM limitada, a costa de una perdida de calidad que el autor no documenta. No se trata de un modelo nuevo ni de un entrenamiento propio, sino de un empaquetado de pesos ya existentes en una forma mas ligera y compatible con el ecosistema ComfyUI. El repositorio no incluye pipeline declarado, idiomas soportados ni resultados de evaluacion.

La informacion disponible es muy escasa: la model card se limita a listar los ficheros y a remitir al repositorio original y a la licencia del modelo base. Todo lo que no aparece explicitamente en esa card se marca en esta ficha como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para generacion de imagenes, segun el nombre y los ficheros; detalles no documentados) |
| Parametros totales | no disponible (el fichero del modelo turbo pesa 4.203.391.376 bytes; el text encoder, 6.402.733.772 bytes) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | w4a8 (pesos 4 bits, activaciones 8 bits) con "convrot"; int8 con "convrot" para el ControlNet; bf16 para el VAE |
| Idiomas soportados | no disponible |
| Licencia | other, con licencia declarada "same-as-original" (se heredan los terminos del modelo Qwen-Image 2.1 original) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Qwen-Image 2.1 en la documentacion proporcionada: no se detalla si emplea un transformer de difusion, un esquema MMDiT o cualquier otra variante, ni el numero de parametros, tokens de entrenamiento o composicion del dataset. La model card unicamente identifica el modelo original como obra del equipo Qwen de Alibaba y describe esta publicacion como un mirror cuantizado.

La innovacion tecnica documentada se limita al esquema de cuantizacion: pesos w4a8 con "convrot" para el modelo turbo y el text encoder, e int8 con "convrot" para el ControlNet union. El VAE se mantiene en bf16. No se indica si hubo RLHF, DPO ni ninguna otra fase de alineamiento, ni se documenta el proceso de calibracion de la cuantizacion ni la perdida de calidad asociada.

## Capacidades

- Generacion de imagenes a partir de texto: el paquete incluye un modelo de difusion turbo (`qwen_image_2.1_turbo_w4a8_convrot.safetensors`), lo que sugiere inferencia con pocos pasos, aunque el numero exacto no esta documentado.
- Control espacial y estructural: incluye un ControlNet union (`qwen_image_2.1_fun_controlnet_union_int8_convrot.safetensors`), que permite condicionar la generacion con mapas de control (tipo de mapas no detallado).
- Codificacion de texto: el fichero `qwen_3_8b_w4a8_convrot.safetensors` corresponde a un text encoder de 8B, presumiblemente basado en la familia Qwen 3, en cuantizacion w4a8.
- Decodificacion de latentes: VAE en bf16 (`qwen_image_2.1_vae_bf16.safetensors`).
- Integracion con ComfyUI: el tag `comfyui` y la estructura de ficheros indican compatibilidad directa con flujos de trabajo de ComfyUI.
- Optimizacion para VRAM baja: el tag `lowvram` y las cuantizaciones w4a8/int8 apuntan a ejecucion en GPUs de gama consumer.
- Tool calling, agentes, vision, audio, modo thinking o capacidades multilingues: no disponibles (no aplica o no documentado para este pipeline de generacion de imagenes).

## Casos de uso

- Generacion de imagenes en estaciones de trabajo con VRAM limitada: la cuantizacion w4a8 reduce el peso del modelo turbo a unos 4,2 GB, lo que permite cargarlo en GPUs consumer de 8-12 GB junto con el text encoder y el VAE, algo inviable con los pesos originales en bf16.
- Prototipado rapido de conceptos visuales: el caracter "turbo" del modelo sugiere generacion con pocos pasos de muestreo, adecuada para iterar sobre ideas en sesiones de diseno sin esperas largas.
- Control estructural de composiciones: el ControlNet union incluido permite imponer la geometria de una imagen de referencia (segun el tipo de mapa que acepte, no documentado) para tareas como bocetos a imagen final o transferencia de pose.
- Integracion en flujos de ComfyUI para artistas tecnicos: al estar empaquetado con los nombres y formatos esperados por ComfyUI, se puede insertar en grafos existentes de generacion, inpainting o postproceso sin conversion adicional.
- Instalaciones empaquetadas de NeuroCraft Studio: el repositorio existe especificamente para alimentar los instaladores de NeuroCraft Studio, de modo que los usuarios finales obtienen un pipeline funcional sin gestion manual de pesos.
- Evaluacion comparativa de cuantizaciones: util para investigadores que quieran medir la degradacion de calidad de w4a8 frente a los pesos originales en tareas de generacion condicionada.
- Despliegue en entornos con restricciones de almacenamiento: el paquete completo ocupa 15,1 GB, considerablemente menos que una distribucion en bf16 del mismo pipeline, lo que facilita su distribucion en imagenes de contenedor o instaladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no documentada por el autor. Como referencia a partir de los tamanos de fichero, el modelo turbo en w4a8 ocupa unos 4,2 GB, el text encoder unos 6,4 GB, el ControlNet int8 unos 3,8 GB y el VAE unos 0,68 GB; la suma ronda los 15 GB si se cargan todos simultaneamente, aunque en la practica el VAE y el text encoder pueden descargarse de VRAM entre fases.
- GPU recomendadas: no disponibles en la documentacion. Por el perfil "lowvram" del repositorio, se orienta a GPUs consumer; no se confirman modelos concretos.
- Compatibilidad con GPU consumer: probable segun el tag `lowvram`, pero sin confirmacion del autor ni cifras de VRAM minima real.
- Opciones de despliegue: ComfyUI (unico entorno explicitamente soportado segun los tags y la estructura de ficheros). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un pipeline de difusion de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| neurocraftart/qwen_image_2.1_turbo (este) | no disponible | no disponible | other (same-as-original) | safetensors (w4a8/int8/bf16) | Hugging Face, mirror de mikeprass |
| mikeprass/qwen_image_2.1_turbo | no disponible | no disponible | no disponible | safetensors | Hugging Face (repositorio original del que este es mirror) |
| Qwen-Image 2.1 (original, equipo Qwen) | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de otros modelos comparables (por ejemplo, otras variantes cuantizadas de Qwen-Image) en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion w4a8 e int8 introduce perdida de calidad frente a los pesos originales en bf16; el autor no documenta la magnitud de esa degradacion ni ofrece comparaciones visuales.
- El repositorio es un mirror no oficial de un tercero (Mike Prass); no hay garantia de mantenimiento, actualizacion ni soporte por parte del equipo Qwen ni de Alibaba.
- La licencia es "other" con clausula "same-as-original": los terminos aplicables son los del modelo Qwen-Image 2.1 original, que no se detallan en la model card. Antes de un uso comercial es imprescindible consultar la licencia del modelo base en su repositorio oficial.
- No se documentan sesgos, riesgos de alucinacion visual, limitaciones de idioma ni restricciones de contenido; se heredan los del modelo base, no descritos aqui.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.
- No se especifica el numero de pasos de muestreo, el scheduler recomendado ni la configuracion de CFG para el modo turbo; usarlo con valores inadecuados puede producir resultados deficientes.
- No hay pipeline declarado en Hugging Face, por lo que la carga automatica mediante `transformers` o `diffusers` no esta garantizada; el uso previsto es a traves de ComfyUI.
- El fichero del text encoder se denomina `qwen_3_8b`, lo que sugiere una dependencia de la familia Qwen 3; la compatibilidad exacta con otras versiones del encoder no esta documentada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/neurocraftart/qwen_image_2.1_turbo
- Repositorio original del que es mirror: https://huggingface.co/mikeprass/qwen_image_2.1_turbo
- Modelo base (Qwen-Image 2.1, equipo Qwen de Alibaba): no disponible en la informacion proporcionada
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada
