# RunningHubAI/rh-krea2-turbo-bf16-realism-unet

## Resumen

rh-krea2-turbo-bf16-realism-unet es un peso de tipo UNET para difusion de imagenes orientado a edicion y generacion imagen-texto-imagen con enfasis en realismo fotografico. Lo publica RunningHubAI, la cuenta de la plataforma RunningHub, en nombre del autor identificado en la model card como "雨的眼泪", y se distribuye como un unico archivo safetensors en precision bf16 de 25.063 MiB (unos 24,5 GiB). Segun la propia model card, el modelo es un fine-tuning del modelo base "krea2".

El repositorio esta pensado para cargarse como UNET en ComfyUI, o bien ejecutarse en la plataforma RunningHub mediante su API. El unico artefacto publicado es `krealism_v20TurboBf16.safetensors`, con un tamano de repositorio de 26,3 GB, lo que lo situa en la gama de modelos de difusion que no caben completos en GPUs de consumo de 16 GB sin cuantizacion u offloading.

La relevancia de esta ficha es limitada y conviene ser explicito: el autor no documenta arquitectura interna, numero de parametros, datos de entrenamiento, pasos de inferencia recomendados ni licencia concreta. Se trata de un peso de uso practico para flujos de ComfyUI, no de un modelo con documentacion tecnica publicada, por lo que buena parte de las especificaciones habituales figuran como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para imagen (image edit / image-text-to-image), segun la model card; detalle interno no disponible |
| Parametros totales | no disponible (el archivo bf16 de 25.063 MiB sugiere un orden de magnitud de ~12.000 millones de parametros, estimacion aritmetica no confirmada por el autor) |
| Parametros activos | no aplicable (no se documenta que sea un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de difusion de imagen; no se documenta ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible: el repositorio solo distribuye el peso en bf16; no se publican variantes GGUF, fp8 ni int8 oficiales |
| Idiomas soportados | no disponible; el repositorio incluye README en chino e ingles, lo que sugiere uso de prompts en ambos idiomas, pero no esta documentado |
| Licencia | no disponible; la model card indica "Follow the original project or upstream license", sin especificar terminos ni si permite uso comercial |
| Formato de pesos | safetensors (bf16), archivo unico `krealism_v20TurboBf16.safetensors` de 25.063 MiB |
| Tipo de modelo declarado | UNET (image edit) |
| Plataformas declaradas | ComfyUI, RunningHub, Hugging Face |
| Modelo base | krea2 (fine-tuning) |
| Tamano del repositorio | 26,3 GB |
| Fecha de creacion | 26 de septiembre de 2026 |
| Fecha de actualizacion | 26 de septiembre de 2026 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La model card clasifica el modelo como "UNET (image edit)" con pipeline `image-text-to-image`, es decir, un backbone de difusion tipo UNET condicionado por texto y por imagen de entrada, del mismo modo que otros pesos que se cargan en ComfyUI sustituyendo el UNET de un pipeline base. No se especifica si emplea atencion completa, atencion lineal, destilacion por pasos ni ninguna otra innovacion concreta: toda esa informacion figura como no disponible.

El unico dato de entrenamiento publicado es el origen: es un fine-tuning de "krea2". No se indica el numero de tokens o imagenes de entrenamiento, la composicion del dataset, si hubo fases de ajuste por preferencias (RLHF/DPO) ni el procedimiento de destilacion. El sufijo "turbo" del nombre sugiere una variante optimizada para inferencia en pocos pasos, y la model card vincula el modelo a un flujo de trabajo de realismo ("realism" en el nombre y el archivo `krealism_v20TurboBf16.safetensors`), pero no se documenta ni el numero de pasos recomendado ni el rango de CFG, escala o sampler sugeridos.

## Capacidades

- Generacion de imagenes a partir de texto en el pipeline `image-text-to-image`.
- Edicion de imagen: la model card clasifica explicitamente el modelo como "image edit" y la plataforma de destino es ComfyUI, lo que encaja con flujos de imagen de entrada mas instruccion de texto.
- Enfasis declarado en realismo fotografico, segun el nombre del modelo y del archivo de pesos.
- Integracion como UNET en ComfyUI, es decir, sustituible en grafos que carguen un modelo de la familia correspondiente al base krea2.
- Ejecucion en la nube mediante la API de RunningHub, ademas de en local.
- Precisión bf16 como unico formato publicado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision de理解 (mas alla de la propia imagen de entrada), audio ni modo "thinking". Estas capacidades no aplican a un UNET de difusion o no estan documentadas.
- Capacidades multilingues: no documentadas; el repositorio mantiene README en chino e ingles, lo que es un indicio debil de soporte de prompts en ambos idiomas.

## Casos de uso

- Edicion de fotografia de producto en comercio electronico: se parte de una foto real de catalogo y se aplica una instruccion de texto para cambiar fondo, iluminacion o entorno manteniendo el objeto, aprovechando la orientacion a realismo del modelo.
- Retoque de retratos y fotografia de estudio: el flujo `image-text-to-image` permite corregir iluminacion, limpiar fondos o ajustar estilismo sobre una imagen existente sin regenerar la escena completa.
- Generacion de imagenes de inmobiliaria y decoracion: a partir de una captura de una estancia se pueden producir variantes amuebladas o reestilizadas, un caso tipico de los grafos de edicion en ComfyUI.
- Produccion de material grafico para campanas de marketing: generacion por lotes de variaciones de una misma escena base con cambios de vestuario, color o ambientacion, controladas por prompt.
- Prototipado de concepto visual para equipos de diseno: iteracion rapida sobre bocetos o referencias para obtener versiones fotorealistas antes de encargar produccion final.
- Automatizacion por API en la nube: integracion del modelo en un servicio que reciba imagen y prompt y devuelva la imagen editada, usando la API de RunningHub en lugar de infraestructura propia.
- Superresolucion perceptual y mejora de texturas: al ser un modelo entrenado para realismo, encaja en flujos donde se busca reconstruir detalle fino en imagenes de baja calidad, siempre que el grafo de ComfyUI lo configure para esa tarea.
- Previsualizacion de escenarios para produccion audiovisual: generacion de fotogramas de referencia realistas a partir de descripciones textuales y de imagenes guia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, ImageReward, comparativas humanas ni evaluaciones de edicion), y tampoco se dispone del numero de pasos, sampler o CFG recomendados para reproducir una medicion.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16 (estimacion a partir del tamano del archivo, no publicada por el autor): en torno a 26 GB solo para el UNET, y del orden de 28 a 32 GB contando VAE, codificador de texto y latentes del pipeline completo.
- Cuantizaciones de terceros (no publicadas en el repositorio): fp8 en torno a 13 GB; GGUF Q8 en torno a 13-14 GB; GGUF Q4 en torno a 7 GB. Son estimaciones proporcionales al peso bf16, no cifras confirmadas por el autor.
- GPU recomendadas: para bf16 sin cuantizar, GPUs de 32 GB o mas (por ejemplo, V100 32 GB, A100 40/80 GB, H100, RTX 5090 32 GB). Con 24 GB (RTX 3090, RTX 4090) el modelo entra muy justo o requiere offloading.
- Cabe en GPU de consumo: en 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080) solo con cuantizacion o con offloading agresivo a RAM; en 8-12 GB es previsible que requiera cuantizacion de 4-8 bits y aceptar penalizacion de velocidad.
- Opciones de despliegue: ComfyUI en local (carga como UNET dentro del grafo), RunningHub en la nube, y la API de RunningHub para integracion programatica. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama, herramientas propias de modelos de lenguaje y no de este tipo de UNET.
- Latencia y throughput: no disponible. No se publican tiempos por imagen, numero de pasos ni configuracion de referencia.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable: la model card no publica parametros, licencia, contexto ni rendimiento, y no identifica alternativas. La unica referencia documentada es el modelo base del que deriva.

| Modelo | Parametros | Formato | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| rh-krea2-turbo-bf16-realism-unet | no disponible | safetensors bf16 (25.063 MiB) | no disponible | Hugging Face, ComfyUI, RunningHub | no disponible |
| krea2 (modelo base declarado) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no hay numero de parametros, arquitectura detallada, datos de entrenamiento ni configuracion de inferencia recomendada. Cualquier uso en produccion exige validacion empirica propia.
- Licencia no especificada. La model card remite a "the original project or upstream license" y senala que los derechos permanecen en el autor. Esto implica un riesgo legal real: no se puede afirmar que el uso comercial este permitido, y conviene contactar con el autor o con RunningHub antes de desplegarlo en un producto.
- Modelo derivado de krea2: las obligaciones de la licencia del modelo base se heredan, y esa licencia no se reproduce en el repositorio.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, y sin resultados de benchmarks publicos. No hay evidencia independiente de calidad, robustez ni reproducibilidad.
- Riesgo de alucinacion visual en modelos de difusion: es esperable la aparicion de artefactos, texto ilegible, manos o geometrias inconsistentes, especialmente en escenas complejas. No hay documentacion que cuantifique estos fallos.
- Sesgos: al no publicarse la composicion del dataset, no es posible evaluar sesgos demograficos, culturales o de representacion. Es previsible que herede los del modelo base y de los datos de ajuste fino, sin que existan cartas de sesgo disponibles.
- Idiomas: no se documenta el soporte multilingue de prompts. Los modelos de este tipo suelen rendir mejor en ingles; conviene asumir degradacion con prompts en castellano hasta verificarlo.
- Resolucion y relacion de aspecto: no documentadas. Es probable que el modelo tenga una resolucion nativa de entrenamiento fuera de la cual aparezcan duplicaciones de sujetos o degradacion, pero no se indica cual.
- Requisitos de memoria altos: 25.063 MiB en bf16 obligan a GPUs profesionales o a cuantizacion de terceros, lo que anade una variable no controlada por el autor y puede alterar la calidad de salida.
- Formato cerrado al ecosistema ComfyUI/RunningHub: no se distribuyen variantes para otros runners, lo que limita la portabilidad del despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-krea2-turbo-bf16-realism-unet
- Pagina original del modelo en RunningHub: https://www.runninghub.ai/model/public/2099376188196544514
- Pagina del autor: https://www.runninghub.ai/user-center/2065407779816169474
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ejemplo de API de Seedance 2.5 en RunningHub: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- README en chino del repositorio: https://huggingface.co/RunningHubAI/rh-krea2-turbo-bf16-realism-unet/blob/main/README_cn.md
- Paper o informe tecnico del modelo: no disponible
- Repositorio de codigo asociado: no disponible
- Demo interactiva: no disponible (solo la plataforma RunningHub)
