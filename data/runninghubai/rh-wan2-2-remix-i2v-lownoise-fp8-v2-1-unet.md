# RunningHubAI/rh-wan2.2-remix-i2v-lownoise-fp8-v2.1-unet

## Resumen

`rh-wan2.2-remix-i2v-lownoise-fp8-v2.1-unet` es un modelo de difusion para generacion de video a partir de imagen (image-to-video, i2v) publicado por RunningHubAI (RunningHub) en Hugging Face. Se trata de un ajuste fino (fine-tune) del modelo base Wan 2.2 de Alibaba, y el repositorio contiene exclusivamente los pesos del componente UNET, cuantizados a fp8 en formato e4m3fn, con un unico archivo `Wan2.2_Remix_NSFW_i2v_14b_low_lighting_fp8_e4m3fn_v2.1.safetensors` de 13.629 MiB (unos 13,3 GiB).

El nombre del archivo identifica las caracteristicas clave: variante i2v, 14.000 millones de parametros (segun el sufijo "14b"), experto de bajo ruido ("lownoise"), cuantizacion fp8 e4m3fn, version v2.1, orientacion a escenas con poca iluminacion ("low lighting") y contenido para adultos ("NSFW"). La model card indica que la version 2.1 incorpora una mejora de la consistencia de personaje respecto a versiones anteriores del remix. Los pesos estan pensados para cargarse en ComfyUI o en la plataforma en la nube RunningHub.

Su relevancia es acotada pero concreta: es un componente de inferencia listo para produccion (cuantizado en fp8, con menor huella de VRAM que el modelo original en precision alta) dentro del ecosistema ComfyUI, y ejemplifica el flujo de publicacion de modelos ajustados por terceros sobre Wan 2.2. No obstante, el repositorio no documenta arquitectura detallada, datos de entrenamiento, benchmarks ni licencia explicita, y a fecha de la ficha registra 0 descargas y 0 likes, por lo que carece de validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para video (fine-tune de Wan 2.2, experto de bajo ruido). Detalle completo no disponible |
| Parametros totales | ~14.000 millones (segun el nombre del archivo, "14b"); el valor exacto no se declara en la model card |
| Parametros activos | no aplica en este repositorio (solo se publica el experto de bajo ruido) |
| Longitud de contexto | no disponible; no aplica (modelo de difusion, no autoregresivo por tokens) |
| Tipos de cuantizacion | fp8 e4m3fn (unico formato publicado); no se indican otras variantes |
| Idiomas soportados | no disponible |
| Licencia | no disponible; el repositorio remite a la licencia del proyecto original o del upstream (Wan 2.2) y mantiene el copyright del autor |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe el modelo como un "UNET (text-to-video)" y lo publica como pesos de difusion cargables en ComfyUI, RunningHub y Hugging Face. El sufijo "lownoise" indica que corresponde al experto de bajo ruido de Wan 2.2, lo que implica que para una inferencia completa hace falta combinarlo con el experto de alto ruido correspondiente del mismo modelo base. El sufijo "i2v" (image-to-video) contrasta con la etiqueta `pipeline_tag: text-to-video`, lo que sugiere que la generacion parte de una imagen de referencia aunque la plataforma la catalogue como text-to-video. La variante v2.1 se presenta como una mejora de la consistencia de personaje.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, la resolucion nativa, la longitud de los clips generados ni la tecnica de ajuste empleada. La unica referencia tecnica concreta es la cuantizacion fp8 e4m3fn aplicada a los pesos, orientada a reducir la huella de memoria en inferencia. Todo lo relativo al proceso de entrenamiento debe considerarse no disponible.

## Capacidades

- Generacion de video a partir de imagen de referencia (image-to-video), condicionada por un prompt de texto.
- Consistencia de personaje mejorada en la version v2.1 respecto a versiones anteriores del remix, segun la model card.
- Tratamiento de escenas con poca iluminacion ("low lighting" en el nombre del archivo).
- Inferencia en fp8 e4m3fn, con menor uso de VRAM que los pesos en mayor precision.
- Integracion con ComfyUI como componente UNET dentro de un flujo de difusion.
- Ejecucion en la plataforma cloud RunningHub.
- Capacidades de tool calling / function calling: no disponibles (modelo de difusion de video, no un LLM).
- Soporte de agentes y razonamiento multi-paso: no disponible / no aplica.
- Capacidades multilingues: no disponibles.
- Capacidades especiales adicionales (audio, vision de entrada general, thinking mode): no disponibles.

## Casos de uso

- Animacion de imagenes fijas para redes sociales: a partir de un retrato o una foto de producto se genera un clip corto en movimiento; el modelo es adecuado por su naturaleza i2v y por la mejora declarada de consistencia de personaje.
- Storyboards y prevision de planos: convertir ilustraciones o frames clave en videos de previsualizacion antes de rodar, integrandolo en un flujo ComfyUI junto al experto de alto ruido y el text encoder.
- Contenido de producto para comercio electronico: animar la foto de catalogo de un articulo para generar una ficha de video breve, aprovechando que el modelo parte de imagen y no requiere describir la escena desde cero.
- Escenas con iluminacion baja en postproduccion: la variante esta orientada a "low lighting", por lo que puede emplearse para generar o completar planos nocturnos o con poca luz donde otros modelos producen artefactos.
- Prototipado de assets para videojuegos o animacion: generar clips de referencia de personajes con aspecto consistente entre tomas para validar el diseno antes de produccion.
- Creacion de contenido para adultos: el archivo incluye la etiqueta NSFW, de modo que el modelo esta aparentemente orientado a este tipo de material; su uso exige verificar la legalidad, la plataforma de destino y las condiciones de licencia.
- Pipelines de generacion por lotes en la nube: al ser un peso fp8 de ~13,3 GiB, puede desplegarse en instancias con VRAM moderada dentro de RunningHub o de una infraestructura propia con ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FVD, CLIP score, VBench, etc.) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Tamano del archivo de pesos: 13.629 MiB (~13,3 GiB) para el UNET en fp8 e4m3fn.
- VRAM estimada para el UNET: del orden de 14-16 GB solo para los pesos, mas el overhead del runtime de difusion y de las activaciones (estimacion basada en el tamano del archivo; no declarada por el autor).
- Componentes adicionales necesarios para una inferencia completa: text encoder y VAE de Wan 2.2 (no incluidos en este repositorio), ademas del experto de alto ruido del mismo modelo base. Su huella de memoria no esta documentada aqui.
- GPU recomendadas: no disponibles. Por el tamano del peso fp8, es previsible que funcione en GPUs de 24 GB (RTX 4090, RTX 3090, L40S) y en GPUs de centro de datos (A100, H100, L40S) con margen; esta afirmacion es una estimacion, no un dato confirmado.
- Compatibilidad con GPU de consumo: probable en tarjetas de 24 GB de VRAM una vez anadidos text encoder y VAE, siempre que se optimice la carga; no confirmado por el autor.
- Opciones de despliegue: ComfyUI y la plataforma RunningHub, segun la model card. Otros runners de difusion (por ejemplo, diffusers) no estan documentados. Herramientas de inferencia de LLM como vLLM, TGI o llama.cpp no son aplicables a un UNET de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-wan2.2-remix-i2v-lownoise-fp8-v2.1-unet | ~14.000 M (experto de bajo ruido, fp8) | UNET de difusion i2v (fine-tune de Wan 2.2) | no disponible | no disponible (remite al upstream) | Hugging Face, ComfyUI, RunningHub |
| Wan 2.2 (modelo base) | no disponible en esta ficha | Difusion de video (text-to-video / image-to-video) | no disponible | no disponible en esta ficha | pesos abiertos del proyecto original |
| HunyuanVideo | no disponible en esta ficha | Difusion de video text-to-video | no disponible | no disponible en esta ficha | pesos abiertos |
| LTX-Video | no disponible en esta ficha | Difusion de video | no disponible | no disponible en esta ficha | pesos abiertos |

Los datos de los modelos alternativos no proceden de la informacion proporcionada en esta busqueda y no se confirman aqui; se listan unicamente como categorias comparables dentro de la generacion de video abierta. Para una comparacion cuantitativa seria necesario consultar las fichas oficiales de cada modelo.

## Limitaciones y advertencias

- Licencia no declarada: la model card indica que debe seguirse la licencia del proyecto original o del upstream (Wan 2.2), sin especificar condiciones. No se puede confirmar el uso comercial sin consultar la licencia de Wan 2.2 y al autor.
- Contenido NSFW: el propio nombre del archivo incluye la etiqueta "NSFW", por lo que el modelo esta planteado para material para adultos. Esto implica riesgos legales, de cumplimiento en plataformas y de moderacion de contenido.
- Componente parcial: al ser el experto de bajo ruido, no es autosuficiente; requiere los pesos complementarios del modelo base, el text encoder y el VAE, que no se incluyen en este repositorio.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar artefactos, deformaciones anatomicas, incoherencias temporales entre frames o movimientos irreales; no hay metricas publicadas que cuantifiquen este riesgo.
- Cuantizacion fp8: la precision reducida puede degradar la calidad respecto a los pesos en fp16/bf16 del modelo original; no se documenta la perdida de calidad.
- Idiomas: no se especifica que idiomas acepta el prompt de texto. No se puede asumir soporte del castellano.
- Sin benchmarks ni validacion: 0 descargas y 0 likes en el momento de la ficha, y ausencia total de metricas objetivas, por lo que no hay evidencia externa de calidad o estabilidad.
- Documentacion insuficiente para produccion: faltan datos de resolucion, duracion de clip, fps, semilla reproducible y pasos de muestreo recomendados.
- Sesgos: no se dispone de informacion sobre sesgos de generacion (representacion de personas, etnias, genero) ni sobre la composicion del dataset de ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-wan2.2-remix-i2v-lownoise-fp8-v2.1-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2008874000272855042
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/1986370833360760833
- RunningHub: https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub: https://www.runninghub.cn/runninghub-api-doc-en/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-wan2.2-remix-i2v-lownoise-fp8-v2.1-unet/blob/main/README_cn.md
