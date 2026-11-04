# RunningHubAI/rh-teste-unet

## Resumen

`rh-teste-unet` es un modelo de difusion para generacion de video a partir de texto (text-to-video) publicado por RunningHubAI en Hugging Face. Se distribuye como un unico fichero de pesos en formato UNet (`wan2.1_14B_SCAIL_2_mxfp8.safetensors`, ~16,4 GiB) y esta pensado para cargarse en ComfyUI o en la plataforma RunningHub. El nombre del fichero sugiere que deriva de la familia Wan 2.1 de 14B parametros, con algun tipo de ajuste fino y cuantizacion en mxfp8, aunque el autor no lo confirma explicitamente en la model card.

La relevancia del modelo es limitada por la escasez de documentacion: no se publican datos de entrenamiento, benchmarks, idiomas soportados ni licencia concreta. La model card indica "Finetuned from: Other" y remite a la licencia del proyecto original o upstream, sin especificarla. Es, por tanto, un artefacto practico para flujos de trabajo en ComfyUI mas que un modelo documentado para investigacion.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (4 de noviembre de 2026), lo que apunta a una publicacion de prueba o experimental. Conviene tratarlo con cautela en entornos de produccion hasta que exista documentacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion para text-to-video (derivada, segun el nombre del fichero, de Wan 2.1 14B) |
| Parametros totales | no disponible (el nombre del fichero indica 14B; no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos en mxfp8 (segun el nombre del fichero); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream sin especificarla) |
| Formato de pesos | safetensors (unico fichero, ~16,4 GiB) |

## Arquitectura y entrenamiento

La unica informacion disponible es que se trata de un modelo de tipo UNet para text-to-video, con pesos empaquetados en un fichero safetensors de 16.356 MiB. El nombre del fichero (`wan2.1_14B_SCAIL_2_mxfp8`) sugiere una base Wan 2.1 de 14B parametros, un ajuste denominado "SCAIL 2" y una cuantizacion en mxfp8, pero la model card no confirma ninguno de estos extremos ni describe la arquitectura interna (atencion, bloques temporales, VAE asociado, etc.).

No se publican datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card solo indica "Finetuned from: Other" y enlaza a la pagina del modelo en RunningHub, sin detallar el proceso de ajuste.

## Capacidades

- Generacion de video a partir de prompts de texto (pipeline `text-to-video`).
- Integracion con ComfyUI como nodo de carga de UNet, segun las etiquetas del repositorio.
- Ejecucion en la plataforma RunningHub (carga y uso online a traves de su API).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- No se documentan capacidades multilingues ni idiomas soportados.
- No se documenta soporte de image-to-video, control de movimiento, inpainting de video ni otras modalidades.

## Casos de uso

- Prototipado de clips de video cortos en ComfyUI: cargar el UNet en un flujo de trabajo de difusion de video para generar secuencias a partir de prompts, aprovechando la integracion nativa con ComfyUI.
- Pruebas de concepto de generacion text-to-video en la plataforma RunningHub: usar la API o la interfaz online para evaluar la calidad del modelo sin montar infraestructura propia.
- Generacion de material de storyboard o previsualizacion: producir clips de referencia para equipos de diseno antes de rodar o producir el video final.
- Experimentacion con cuantizacion mxfp8: evaluar el equilibrio entre calidad y consumo de memoria al ejecutar un UNet de gran tamano en formato de baja precision.
- Creacion de contenido para redes sociales: generar clips cortos de forma iterativa dentro de un pipeline de ComfyUI.
- Investigacion sobre ajuste fino de modelos de video: usar los pesos como punto de partida para experimentos de fine-tuning orientados a estilos o dominios concretos.
- Automatizacion de variaciones creativas: encadenar prompts en lote para producir multiples variantes de una misma escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa ~16,4 GiB; en mxfp8 se necesita al menos esa cantidad de VRAM solo para los pesos, mas la memoria adicional para activaciones y el VAE asociado. En la practica, se recomienda una GPU con 24 GB o mas.
- GPU recomendadas: no especificadas por el autor. Por el tamano del fichero, encajan GPU de gama alta como A100, H100, RTX 4090 (24 GB), RTX 5090 o profesionales con 24-80 GB de VRAM.
- Cabe en GPU de consumo: previsiblemente en RTX 4090/5090 (24-32 GB), aunque no esta confirmado por el autor; en GPUs de 16 GB o menos requeriria tecnicas de offloading.
- Opciones de despliegue: ComfyUI (integracion nativa segun las etiquetas) y la plataforma RunningHub. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de video de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-teste-unet | 14B (segun nombre del fichero, no confirmado) | no disponible | no disponible | Hugging Face + RunningHub |
| Wan 2.1 (familia base) | 14B (variante T2V) | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Otros modelos text-to-video de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo ni de comparativas verificadas con alternativas concretas en la informacion proporcionada.

## Limitaciones y advertencias

- Documentacion minima: no hay datos de entrenamiento, benchmarks, idiomas ni arquitectura interna, lo que impide evaluar su calidad de forma objetiva.
- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream sin especificarla; no se puede garantizar el uso comercial sin verificar la licencia de Wan 2.1 u origen equivalente.
- Repositorio sin traccion: 0 descargas y 0 likes, creado y actualizado el mismo dia, lo que sugiere un artefacto de prueba o experimental.
- Riesgo de alucinacion visual: como todo modelo generativo de video, puede producir artefactos, incoherencias temporales y contenido no fiel al prompt.
- Sesgos: no documentados; al no conocerse el dataset de entrenamiento, no es posible evaluar sesgos de genero, raza o cultura.
- Limitaciones de idioma: no se especifican idiomas soportados para los prompts.
- Restricciones de produccion: la falta de licencia clara y de benchmarks desaconseja su uso en entornos comerciales sin una revision legal y una evaluacion propia.
- Dependencia de plataforma: la model card esta orientada a su uso en RunningHub y ComfyUI, sin garantias de compatibilidad con otros runners.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-teste-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2077733039980388353
- Pagina del autor: https://www.runninghub.ai/user-center/1916861389850451969
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-teste-unet/blob/main/README_cn.md
