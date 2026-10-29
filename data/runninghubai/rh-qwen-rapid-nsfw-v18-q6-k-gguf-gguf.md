# RunningHubAI/rh-qwen-rapid-nsfw-v18-q6-k.gguf-gguf

## Resumen

rh-qwen-rapid-nsfw-v18-q6-k.gguf-gguf es un checkpoint de difusión para generación de vídeo a partir de texto (pipeline `text-to-video`), publicado por RunningHubAI en Hugging Face. Según la model card, se trata de un ajuste fino (finetune) del modelo WAN2.2, exportado en formato GGUF con cuantización Q6_K y empaquetado para su uso en ComfyUI mediante nodos de UNet en GGUF (etiquetas `comfyui`, `unet-gguf`). El repositorio contiene un único archivo de pesos de 16.207 MiB y el conteo de parámetros reportado en los metadatos de safetensors es de 20.430.401.088 (unos 20,43 mil millones).

El modelo está orientado a la generación de vídeo para adultos: la etiqueta `not-for-all-audiences` y el propio nombre del checkpoint (`nsfw`) indican que ha sido ajustado para producir contenido explícito, y la model card no incluye documentación técnica sobre datos de entrenamiento, hiperparámetros ni método de ajuste. No se publican resultados de benchmarks, no se especifica licencia propia y el repositorio no registra descargas ni interacciones en el momento de la consulta.

Su relevancia práctica es limitada pero concreta: es una de las pocas distribuciones de un finetune de WAN2.2 en GGUF Q6_K lista para cargarse en ComfyUI, lo que reduce la barrera de VRAM frente a los pesos en precisión completa y permite ejecutar el modelo en GPUs de consumo alto (24 GB) con flujos de trabajo estándar. Para cualquier evaluacion seria conviene tratarlo como un artefacto de procedencia parcialmente documentada y verificar su comportamiento antes de integrarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para video derivado de WAN2.2; exportado como UNet en GGUF segun la etiqueta `unet-gguf`. No se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 20.430.401.088 (20,43 mil millones), segun metadatos de safetensors |
| Parametros activos | no disponible (no se confirma si conserva el esquema MoE del modelo base) |
| Longitud de contexto | no aplica (modelo de difusion texto-a-video; no gestiona contexto de tokens de lenguaje) |
| Tipos de cuantizacion | Q6_K (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o del upstream, sin especificarla |
| Formato de pesos | GGUF (`Qwen-Rapid-NSFW-v18_Q6_K.gguf`, 16.207 MiB) |
| Tamano del repositorio | 17,0 GB |
| Pipeline declarado | text-to-video |
| Plataformas indicadas | ComfyUI / RunningHub / Hugging Face |
| Modelo base | WAN2.2 (finetune) |
| Fecha de publicacion | 2026-10-29 |

## Arquitectura y entrenamiento

La informacion disponible no incluye una descripcion tecnica de la arquitectura interna. Lo unico verificable es que se trata de un modelo de difusion condicionado por texto para generar video, derivado de WAN2.2, y que el archivo se distribuye como UNet en GGUF para ComfyUI. El nombre del checkpoint (`qwen-rapid-...`) sugiere un linaje distinto al declarado en la model card (`Finetuned from: WAN2.2`), por lo que la procedencia exacta de los pesos no queda resuelta con los datos publicados.

No se documentan el volumen de tokens o clips de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (poco habitual en difusion) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se detalla el proceso de cuantizacion a Q6_K (herramienta empleada, calibracion, capas excluidas). La unica cifra contrastable es la del archivo final: 16.207 MiB para 20,43 mil millones de parametros, lo que corresponde a unos 6,6 bits por peso, coherente con Q6_K.

## Capacidades

- Generacion de video a partir de prompts de texto, con el pipeline `text-to-video` declarado.
- Ajuste especifico para contenido para adultos (NSFW), segun nombre, etiqueta `not-for-all-audiences` y descripcion.
- Integracion nativa en flujos de ComfyUI a traves de cargadores de UNet en GGUF.
- Ejecucion en el entorno alojado de RunningHub y a traves de su API (segun enlaces de la model card).
- Carga con menor huella de VRAM que los pesos en precision completa gracias a la cuantizacion Q6_K.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible (no se especifica el tokenizador ni los idiomas de los prompts).
- Capacidades especiales: no se documentan modos de pensamiento, audio, vision ni control adicional (pose, depth, referencia de imagen) en la informacion disponible.

## Casos de uso

- Produccion de video para plataformas de contenido adulto con verificacion de edad: el modelo esta ajustado explicitamente para este dominio, de modo que genera clips cortos directamente utilizables tras postproduccion, evitando el ajuste adicional que requeriria un modelo generico.
- Previsualizacion y storyboard en produccion audiovisual: generar clips de referencia rapidos para comunicar encuadre, iluminacion y ritmo antes de rodar; la cuantizacion Q6_K permite iterar en una estacion de trabajo con una sola GPU de 24 GB.
- Generacion de datos sinteticos para entrenar clasificadores de moderacion: un modelo capaz de producir contenido explicito de forma controlada sirve para aumentar la cobertura de detectores NSFW en plataformas UGC, con datos que no exponen a personas reales.
- Pruebas de estres de sistemas de filtrado y seguridad: inyectar clips generados en pipelines de moderacion para medir tasas de falsos negativos y latencia de deteccion antes de un despliegue.
- Prototipado en ComfyUI de flujos texto-a-video: el checkpoint se carga con los nodos GGUF estandar, lo que permite validar grafos, resoluciones y schedules de muestreo sin descargar pesos completos.
- Generacion por lotes en infraestructura alojada: la model card apunta a la API de RunningHub, adecuada para producir volumen sin mantener GPUs propias, con el coste por llamada como principal variable.
- Investigacion sobre sesgos y estetica en modelos de difusion de video: analizar como un finetune de un modelo base abierto desplaza la distribucion de salidas hacia un dominio concreto (contenido explicito, morfologias, iluminacion).
- Creacion de clips cortos para redes sociales con postproduccion posterior: el material generado se integra en un pipeline de edicion (color, montaje, audio) cuando se necesita volumen de B-roll con estetica consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de FVD, VBench, CLIP-score ni evaluaciones cualitativas comparativas. Tampoco se documentan latencia por clip, numero de pasos de muestreo recomendado ni resolucion nativa de entrenamiento.

## Requisitos de hardware

- VRAM para inferencia: el archivo de pesos ocupa 16.207 MiB (unos 15,8 GiB). Hay que sumar el codificador de texto y el VAE del pipeline WAN2.2, no incluidos en este repositorio, mas los tensores latentes de video, que escalan con resolucion y numero de fotogramas.
- Estimacion practica: 20-24 GB de VRAM para resoluciones y duraciones moderadas; 40-80 GB para clips largos o alta resolucion.
- GPU recomendadas: RTX 3090 / RTX 4090 (24 GB) como minimo comodo para uso en消费... para uso individual; A100 40/80 GB, H100 o L40S para produccion y lotes.
- Cabe en GPU de consumo: si, en RTX 3090, 4090, 5090 y modelos con 24 GB o mas, siempre que se ajusten resolucion y numero de fotogramas. En GPUs de 12-16 GB requeriria cuantizaciones mas agresivas (Q4/Q3), no publicadas en este repositorio.
- Opciones de despliegue: ComfyUI con nodos GGUF (via de uso prevista por el autor), entorno alojado de RunningHub y su API. No se documenta soporte de vLLM, TGI o llama.cpp (herramientas no aplicables a difusion de video en este formato).
- Latencia y throughput: no disponibles. No se publican tiempos por clip, pasos de muestreo ni comparativas de velocidad frente a los pesos originales en fp16/bf16.

## Comparativa con modelos similares

Los datos de los modelos comparables no se han verificado en la informacion proporcionada; se marcan como no disponibles cuando no hay confirmacion.

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-qwen-rapid-nsfw-v18-q6-k (este) | 20,43 mil millones | Difusion texto-a-video, finetune NSFW | no aplica | no disponible | GGUF Q6_K en HF, ComfyUI / RunningHub |
| WAN2.2 (upstream) | no disponible en la informacion | Difusion texto-a-video | no aplica | no disponible en la informacion (remitirse al proyecto original) | Pesos originales en el repositorio del autor del modelo base |
| Alternativas abiertas de texto-a-video (familia WAN, HunyuanVideo, LTX-Video) | no disponible en la informacion | Difusion / DiT texto-a-video | no aplica | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de rendimiento comparado (calidad visual, coherencia temporal, adherencia al prompt) que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Contenido explicito: el checkpoint esta disenado para generar material NSFW. Su uso requiere verificacion de edad, cumplimiento de la normativa aplicable (en Espana, legislacion sobre pornografia y proteccion de menores) y de las condiciones de servicio de la plataforma de destino.
- Riesgo de deepfake y suplantacion: un generador de video NSFW sin salvaguardas puede emplearse para crear contenido sexual no consentido de personas reales. Es imprescindible establecer controles de identidad y prohibir explicitamente la generacion de personas identificables sin consentimiento.
- Licencia no declarada: la model card solo indica que se respete la licencia del proyecto original o del upstream. Sin una licencia explicita no puede asumirse permiso para uso comercial; hay que contactar con el autor o verificar la licencia de WAN2.2 antes de cualquier despliegue productivo.
- Procedencia ambigua: el nombre del checkpoint remite a "qwen" mientras la model card declara un finetune de WAN2.2. Esa discrepancia impide confirmar la arquitectura, el tokenizador de texto y el VAE compatibles.
- Sin validacion de la comunidad: cero descargas y cero likes en el momento de la consulta; no hay informes independientes de calidad, estabilidad ni de que el archivo se cargue correctamente en ComfyUI.
- Ausencia total de documentacion de entrenamiento: no se conocen dataset, numero de pasos, hiperparametros ni si se aplicaron tecnicas de mitigacion de sesgos. Es esperable un sesgo marcado hacia morfologias, etnias y esteticas concretas del corpus de ajuste.
- Limitaciones tipicas de la difusion de video: incoherencia temporal en clips largos, artefactos en manos y rostros, texto ilegible y deriva de identidad entre fotogramas. La cuantizacion Q6_K introduce ademas una perdida de fidelidad frente a fp16/bf16, no cuantificada por el autor.
- Dependencia de herramientas: el uso en ComfyUI exige nodos GGUF de terceros; las actualizaciones de esos nodos pueden romper la compatibilidad del archivo.
- Idiomas: se desconoce que idiomas admiten los prompts; los modelos de esta familia suelen estar entrenados principalmente con prompts en ingles y chino, lo que puede degradar la adherencia en castellano.
- Sin informacion sobre latencia ni VRAM real: las estimaciones de hardware de esta ficha son calculadas a partir del tamano del archivo y no han sido verificadas con el modelo en ejecucion.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen-rapid-nsfw-v18-q6-k.gguf-gguf
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2112212766157639682
- Pagina del autor: https://www.runninghub.ai/user-center/2109547160336359425
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API del modelo: https://www.runninghub.ai/call-api?utm_source=huggingface&utm_medium=badge&utm_campaign=api_promotion&utm_content=rh-2112212766157639682
- README en chino: https://huggingface.co/RunningHubAI/rh-qwen-rapid-nsfw-v18-q6-k.gguf-gguf/blob/main/README_cn.md
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo; los enlaces encontrados correspondian a contenido no relacionado en Reddit y se han descartado.
