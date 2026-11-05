# RunningHubAI/rh-wan2.2-remix-nsfw-t2v-14b-high-lighting-v2.0-unet

## Resumen

`rh-wan2.2-remix-nsfw-t2v-14b-high-lighting-v2.0-unet` es un checkpoint de tipo UNET para generacion de video a partir de texto (text-to-video), derivado mediante fine-tuning del modelo base WAN2.2. Lo publica RunningHubAI, la cuenta en HuggingFace de la plataforma RunningHub, que actua como intermediaria del autor original (identificado en la model card como `@FX-小肥猴`). El repositorio contiene exclusivamente los pesos del UNET en formato safetensors (13.628 MiB, unos 14,3 GB de repositorio), pensados para cargarse en ComfyUI o en la propia plataforma RunningHub.

El modelo pertenece a la familia de difusion para video de 14B parametros de WAN2.2, si bien la model card no detalla la arquitectura interna ni el proceso de entrenamiento. El sufijo del nombre indica un ajuste fino orientado a contenido NSFW y a "high lighting" (iluminacion marcada), con version 2.0 del ajuste. Es relevante para quien trabaja con generacion de video en ComfyUI y busca variantes especializadas del UNET de WAN2.2, pero la documentacion publicada es minima y no incluye especificaciones tecnicas formales.

La informacion disponible en la model card es muy escasa: no se detallan parametros, contexto, licencia concreta, idiomas ni resultados de evaluacion. El propio autor marca la seccion "About this model" con un placeholder (`<p>test</p>`), lo que indica que la ficha no esta finalizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para text-to-video (derivado de WAN2.2); detalles internos no disponibles |
| Parametros totales | 14B (segun el nombre del modelo; no desglosado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin indicar precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`Wan2.2_Remix_NSFW_t2v_14b_high_lighting-v2.0.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un UNET de difusion para generacion de video condicionada por texto, afinado a partir de WAN2.2. La model card no documenta la arquitectura interna (tipo de bloques, mecanismos de atencion temporal, VAE asociado ni scheduler recomendado), ni el numero de tokens o composicion del dataset de entrenamiento. Tampoco se indica si hubo RLHF, DPO ni ninguna otra fase de alineamiento.

El unico dato de entrenamiento explicito es que se trata de un fine-tuning de WAN2.2, con una variante orientada a contenido NSFW e iluminacion reforzada ("high lighting"), en version 2.0. No se especifican hiperparametros, resolucion de entrenamiento, duracion de clips ni si se emplearon tecnicas como LoRA fusionado o entrenamiento completo del UNET. Cualquier detalle adicional sobre el proceso de entrenamiento debe considerarse no disponible.

## Capacidades

- Generacion de video a partir de descripciones textuales (pipeline text-to-video).
- Ajuste fino orientado a contenido NSFW, segun el nombre y las tags del repositorio (`not-for-all-audiences`).
- Enfasis en iluminacion marcada ("high lighting") en los resultados generados.
- Integracion con ComfyUI como nodo de carga de UNET (tag `comfyui`).
- Carga directa en la plataforma RunningHub y a traves de su API.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, vision, audio ni modo thinking; al ser un modelo de difusion para video, estas capacidades no aplican en el sentido habitual de los LLM.
- Cobertura multilingue de prompts: no disponible.

## Casos de uso

- Generacion de clips de video en ComfyUI: el UNET se carga en un flujo text-to-video de ComfyUI junto al VAE y el codificador de texto correspondientes de WAN2.2, permitiendo iterar prompts y semillas para producir clips cortos.
- Prototipado creativo de escenas con iluminacion dramatica: el ajuste "high lighting" resulta util para explorar esteticas de luz intensa (contraluz, fuentes puntuales, alto contraste) en previsualizaciones rapidas antes de produccion final.
- Creacion de contenido para adultos en entornos controlados: el ajuste NSFW esta pensado para generacion de material para audiencias adultas; requiere verificacion de edad, cumplimiento legal y politicas de plataforma antes de cualquier uso.
- Automatizacion via API de RunningHub: el modelo puede invocarse a traves de la API de RunningHub para generar video por lotes sin gestion local de GPU, util para pipelines de contenido programatico.
- Investigacion sobre fine-tuning de modelos de difusion para video: sirve como ejemplo de adaptacion de WAN2.2 a un dominio estetico concreto, comparable con otros checkpoints de la comunidad.
- Pruebas de integracion en flujos de postproduccion: los clips generados pueden servir como material de referencia o placeholders en montajes, sustituibles posteriormente por metraje real.
- Benchmarking cualitativo de variantes WAN2.2: permite comparar el comportamiento del ajuste remix frente al UNET original en cuanto a iluminacion y composicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un UNET de 14B en safetensors ocupa unos 14 GB en disco; la VRAM necesaria en inferencia depende de la precision de carga, la resolucion y la longitud del clip, y no se documenta en la model card.
- GPU recomendadas: no disponible. Por tamano del checkpoint, se situaria en el rango de GPUs profesionales (A100, H100) o consumer de gama alta con suficiente VRAM, pero el autor no confirma requisitos.
- Compatibilidad con GPU consumer: no confirmada; depende de la VRAM disponible y de las optimizaciones del flujo de ComfyUI.
- Opciones de despliegue: ComfyUI (principal), plataforma RunningHub y su API. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un UNET de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-wan2.2-remix-nsfw-t2v-14b-high-lighting-v2.0-unet | 14B (segun nombre) | no disponible | no disponible | HuggingFace (RunningHubAI) |
| WAN2.2 (modelo base) | familia 14B (variantes) | no disponible en esta ficha | licencia upstream de WAN2.2 (consultar) | HuggingFace / repos oficiales |
| Otras variantes comunitarias de WAN2.2 en ComfyUI | variable | no disponible | variable por autor | HuggingFace / ComfyUI ecosystem |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles: no hay benchmarks, no se especifica la licencia concreta ni los requisitos de hardware. La unica referencia solida es el modelo base WAN2.2, del que este checkpoint es un fine-tuning.

## Limitaciones y advertencias

- Contenido NSFW: el modelo esta etiquetado como `not-for-all-audiences` y su nombre indica ajuste explicito para contenido adulto; su uso exige verificacion de edad, cumplimiento legal en la jurisdiccion del usuario y respeto de las politicas de la plataforma de destino.
- Documentacion incompleta: la model card contiene un placeholder (`<p>test</p>`) y no detalla arquitectura, entrenamiento, licencia ni requisitos, lo que dificulta evaluar su calidad y reproducibilidad.
- Licencia no especificada: la model card remite a "la licencia del proyecto original o upstream"; antes de uso comercial es imprescindible consultar la licencia de WAN2.2 y del autor original.
- Riesgo de alucinacion visual y artefactos: como todo modelo de difusion, puede producir incoherencias temporales, deformaciones anatomicas y artefactos, especialmente en prompts alejados de su distribucion de entrenamiento.
- Sesgos: no documentados; los ajustes finos especializados pueden amplificar sesgos esteticos o de representacion del dataset de fine-tuning, que no se describe.
- Dependencia del ecosistema: el checkpoint esta pensado para ComfyUI y RunningHub; su uso fuera de estos entornos requiere conocer la configuracion exacta de VAE, text encoder y scheduler de WAN2.2.
- Idiomas: no se especifica cobertura multilingue de prompts; conviene asumir comportamiento optimo en ingles hasta confirmacion.
- Sin datos de rendimiento: no hay benchmarks ni estudios de calidad publicados, por lo que no es posible comparar objetivamente con el UNET base.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-wan2.2-remix-nsfw-t2v-14b-high-lighting-v2.0-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/1991254611298463745
- Pagina del autor: https://www.runninghub.ai/user-center/1986370833360760833
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-wan2.2-remix-nsfw-t2v-14b-high-lighting-v2.0-unet/blob/main/README_cn.md
