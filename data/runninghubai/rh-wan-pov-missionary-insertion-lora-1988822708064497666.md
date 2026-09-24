# RunningHubAI/rh-wan-pov-missionary-insertion-lora-1988822708064497666

## Resumen
`rh-wan-pov-missionary-insertion-lora` es un adaptador LoRA de bajo rango publicado por RunningHubAI (a nombre del autor Alejandro León) sobre Hugging Face. No es un modelo generativo completo: es un fichero de pesos de 293 MiB (`W22_LN_i2v_POV_Missionary_Insertion.safetensors`) que debe cargarse junto al modelo base Wan 2.2 para tareas de generación de vídeo a partir de imagen (image-to-video, i2v).

El adaptador está diseñado para inducir un tipo de plano concreto (POV, "point of view") en el pipeline de generación de vídeo, siguiendo el flujo habitual de ComfyUI: se aplica sobre el modelo de difusión de vídeo Wan 2.2 y se activa mediante las palabras clave indicadas por el autor ("i2v POV Missionary insertion lora").

Su relevancia es acotada: se trata de contenido para adultos explícito, con licencia no declarada, cero descargas y cero valoraciones en el momento de la consulta, y sin datos técnicos de entrenamiento publicados. Se documenta aquí por completitud del catálogo, no como recomendación de uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión de vídeo Wan 2.2; rango, dimensiones objetivo y capas afectadas: no disponible |
| Parametros totales | no disponible (es un adaptador, no un modelo completo) |
| Parametros activos | no aplica al adaptador; el modelo base Wan 2.2 del que se finetunea puede ser MoE segun su propia documentacion, pero no se detalla en la informacion proporcionada |
| Longitud de contexto | no aplica / no disponible (modelo de generación de vídeo, no de lenguaje; se controla por longitud de clip y resolución) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible (depende del codificador de texto del modelo base) |
| Licencia | no disponible. La model card indica: "Published by RunningHub on behalf of the author. Copyright remains with the author. Follow the original project or upstream license." |
| Formato de pesos | safetensors |
| Tipo de modelo | LoRA para generación de vídeo (image-to-video) |
| Modelo base | Wan 2.2 (finetuned from: WAN2.2) |
| Fichero incluido | `W22_LN_i2v_POV_Missionary_Insertion.safetensors` (293 MiB) |
| Trigger words | "i2v POV Missionary insertion lora" |
| Plataformas compatibles | ComfyUI / RunningHub / Hugging Face |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (segun metadatos HF) | 2026-09-24T17:00:01.000Z (actualizado 2026-09-24T17:01:01.000Z); fecha anomala, probable valor de relleno |

## Arquitectura y entrenamiento
La informacion disponible no describe la arquitectura interna del adaptador. Por el tipo de fichero y las etiquetas (`comfyui`, `lora`) se trata de un adaptador LoRA que se inyecta sobre el modelo base Wan 2.2, un modelo de difusión para generación de vídeo. No se publican ni el rango de la matriz de bajo rango, ni los modulos objetivo (attention, cross-attention, MLP), ni la estrategia de merge.

Tampoco se documentan los datos de entrenamiento: numero de pasos, tamano del dataset, resolucion y duracion de los clips, uso de RLHF/DPO (no aplicable en el flujo tipico de difusion) ni ninguna innovacion tecnica. El autor solo indica el modelo de partida (WAN2.2), el tipo de tarea (i2v) y las palabras de activacion.

## Capacidades
- Generacion de video a partir de imagen (image-to-video) al aplicarse sobre Wan 2.2.
- Induccion de un estilo de plano concreto (POV) definido por las trigger words "i2v POV Missionary insertion lora".
- Contenido para adultos explicito: el propio nombre del adaptador lo delimita.
- Integracion en flujos de ComfyUI mediante el nodo de carga de LoRA.
- Ejecucion remota a traves de la plataforma RunningHub y su API.
- Tool calling / function calling: no aplica (modelo de generacion de video, no un LLM).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible; el prompt de texto depende del codificador del modelo base.
- Capacidades especiales: ninguna documentada (sin vision, audio ni modo "thinking").

## Casos de uso
- Previsualizacion y storyboard en produccion audiovisual para adultos: el adaptador permite generar un plano POV coherente a partir de una imagen de referencia antes de rodar, reduciendo coste de preproduccion.
- Generacion por lotes via API de RunningHub: al estar publicado dentro de ese ecosistema, se puede invocar de forma remota sin infraestructura GPU local, util para pipelines automatizados de contenido.
- Flujos ComfyUI con control de pose y composicion: combinado con nodos de ControlNet o inpainting temporal del propio ComfyUI para fijar encuadre y continuidad entre planos.
- Investigacion sobre adaptadores LoRA en difusion de video: sirve como ejemplo de LoRA de bajo rango (293 MiB) aplicado a un modelo i2v de gran tamano, util para estudiar el impacto del rango y las capas objetivo.
- Pruebas de sistemas de moderacion y filtrado NSFW: el adaptador puede emplearse como caso de prueba controlado para evaluar clasificadores de contenido y politicas de moderacion en plataformas.
- Evaluacion de consistencia temporal en video generado: permite medir artefactos de parpadeo, deformacion anatomica y deriva de identidad en planos de camara subjetiva.
- Demostraciones de personalizacion de estilo en herramientas comerciales: integrable como ejemplo de "estilo de plano" en un catalogo de LoRAs dentro de una plataforma de generacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- El adaptador en si ocupa 293 MiB, pero no es autonomo: requiere cargar el modelo base Wan 2.2 completo, que es el que determina el consumo real.
- VRAM estimada: no disponible en la informacion proporcionada. Depende de la variante de Wan 2.2 usada, la resolucion, los frames por clip y la cuantizacion aplicada al modelo base.
- GPU recomendadas: no disponible. En modelos de difusion de video de esta familia se suele trabajar con GPU de centro de datos (A100, H100, L40S) o consumer de gama alta (RTX 4090, RTX 5090) con cuantizacion, pero no hay datos verificados para este adaptador concreto.
- Compatibilidad con GPU de consumo: no confirmada; condicionada al modelo base y a la cuantizacion elegida.
- Opciones de despliegue: ComfyUI (flujo nativo del autor), RunningHub (plataforma original y via API). Otros runners no estan documentados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-wan-pov-missionary-insertion-lora | LoRA i2v (contenido adulto) | Wan 2.2 | no disponible | no disponible | Hugging Face + RunningHub |
| Otros LoRAs i2v para Wan 2.2 publicados en RunningHub | LoRA i2v | Wan 2.2 | no disponible | no disponible | RunningHub / Hugging Face |
| LoRAs para modelos de video alternativos (LTX-Video, HunyuanVideo) | LoRA | LTX-Video / HunyuanVideo | no disponible | variable segun autor | Hugging Face / Civitai |
| Modelo base Wan 2.2 | Difusion de video | — | no disponible | la del proyecto Wan | Repositorio oficial del proyecto |

No se dispone de datos comparativos de rendimiento, parametros ni licencia para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias
- Contenido para adultos explicito: no apto para menores ni para entornos profesionales sin control de acceso.
- Licencia no declarada: la model card remite a la licencia del proyecto original. Para uso comercial es imprescindible verificar la licencia del modelo base Wan 2.2 y obtener autorizacion del autor; no hay permiso explicito de uso comercial.
- Cero validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin ejemplos, sin revisiones y sin garantia de calidad de los pesos.
- Ausencia total de documentacion de entrenamiento: no se conocen dataset, pasos, resolucion ni sesgos del adaptador.
- Riesgo de alucinacion visual: como cualquier modelo de difusion de video, puede generar anatomia incorrecta, parpadeo temporal y artefactos en manos y extremidades; el riesgo es mayor en planos POV en movimiento.
- Dependencia estricta del modelo base: el adaptador no funciona de forma aislada y puede degradarse si se combina con otros LoRAs o si la version de Wan 2.2 difiere de la usada en el entrenamiento.
- Trigger words muy especificas: el resultado depende de incluirlas literalmente en el prompt.
- Idiomas: no hay informacion sobre el soporte multilingue de los prompts.
- Metadatos anomalos: la fecha de creacion indicada (2026-09-24) no es coherente, lo que sugiere campos rellenados automaticamente y baja fiabilidad del resto de metadatos.
- Fichero unico sin variantes: no se ofrecen versiones cuantizadas, FP8 ni GGUF del adaptador.
- Marco legal: la generacion y distribucion de material pornografico esta sujeta a normativa especifica segun jurisdiccion, incluidas las obligaciones de verificacion de edad y de consentimiento de las personas representadas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-wan-pov-missionary-insertion-lora-1988822708064497666
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/1988822708064497666
- Pagina del autor (Alejandro Leon): https://www.runninghub.ai/user-center/1978956962782142466
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API (ejemplo Seedance 2.5): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Modelo base Wan 2.2: enlace oficial no incluido en la informacion proporcionada
