# RunningHubAI/rh-binyuan-krea-2-portrait-v2.5-bf16-unet

## Resumen

`rh-binyuan-krea-2-portrait-v2.5-bf16-unet` es un UNet de difusion para generacion y edicion de imagenes a partir de texto, afinado por el autor `@user_xicdkrfw` y publicado en HuggingFace por la plataforma RunningHub. El modelo parte de una base denominada `krea2` y esta especializado en retratos fotograficos de mujeres de ascendencia asiatica, con un enfasis declarado en la fidelidad a la apariencia real de la piel y los rasgos. Se distribuye como un unico fichero de pesos en precision bf16 de aproximadamente 25 GB (26,3 GB de repositorio), pensado para cargarse en ComfyUI o ejecutarse en la infraestructura de RunningHub.

El interes practico del modelo es acotado pero claro: no compite en capacidades generales de generacion, sino que ofrece un ajuste fino orientado a un dominio visual concreto (retrato fotografico), lo que lo hace util para flujos de trabajo de estudio, edicion de retratos y generacion de imagenes de referencia con estetica fotografica. El autor indica que el entrenamiento se hizo exclusivamente con fotografias originales y no con imagenes sinteticas, un detalle relevante para quien busque texturas y rasgos menos "artificiales".

La informacion publica es escasa: no hay model card tecnica detallada, no se declaran parametros, contexto, licencia explicita ni resultados de benchmarks. Esta ficha recoge lo disponible y marca como "no disponible" todo aquello que el autor no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion (image-text-to-image / image edit), afinado desde la base `krea2` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; no hay contexto textual medido en tokens) |
| Tipos de cuantizacion | pesos publicados en bf16; no se documentan otras variantes |
| Idiomas soportados | no disponible (las instrucciones de texto se infieren en ingles/chino por el ecosistema, sin confirmacion del autor) |
| Licencia | no disponible; el autor remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`binyuan_krea_2_portrait _v2.5_bf16.safetensors`, 25.066 MiB) |

## Arquitectura y entrenamiento

El modelo es un UNet de difusion para tareas de image-text-to-image, es decir, la red que predice el ruido en el espacio latente de un autoencoder y que se combina con un codificador de texto para condicionar la generacion. No se documenta el numero de parametros, la resolucion nativa de entrenamiento, el scheduler recomendado ni la variante exacta del text encoder con la que debe emparejarse; en el ecosistema ComfyUI, estos UNets suelen requerir un VAE y un text encoder compatibles con la familia de la que derivan, en este caso la base `krea2`.

Respecto al entrenamiento, el autor afirma haber utilizado fotografias originales (no imagenes generadas por IA) centradas en retratos de mujeres asiaticas; una busqueda web secundaria menciona un conjunto de aproximadamente 1.000 imagenes de retrato en bruto. No se especifican hiperparametros, numero de pasos, tecnica de ajuste (LoRA fusionado, full fine-tune, DreamBooth) ni si hubo etapas de preferencia o refinamiento. Tampoco se detalla la composicion del dataset mas alla de la descripcion cualitativa. Cualquier afirmacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa) seria especulativa y no se incluye.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales, con sesgo fuerte hacia retrato fotografico.
- Edicion de imagen (image edit) segun la clasificacion del autor, lo que permite partir de una imagen de entrada y modificarla.
- Reproduccion de rasgos faciales y texturas de piel con estetica fotografica, segun la intencion declarada del ajuste.
- Especializacion en retratos de mujeres de ascendencia asiatica, incluyendo estilos de pelo y maquillaje en versiones posteriores de la familia.
- Integracion en flujos de ComfyUI mediante nodos de carga de UNet.
- Ejecucion en la nube de RunningHub a traves de su API.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni vision mas alla del propio pipeline de imagen.

## Casos de uso

- Generacion de retratos de referencia para estudio fotografico: el modelo produce imagenes con aspecto de fotografia real, utiles como moodboard o referencia de iluminacion antes de una sesion.
- Edicion de retratos existentes: al ser un modelo de image edit, permite partir de una foto y aplicar cambios de estilo, pelo o maquillaje manteniendo la identidad visual del sujeto.
- Creacion de material para catalogos de belleza y peluqueria: la especializacion en estilos de pelo y rasgos asiaticos lo hace adecuado para probar variaciones de corte o color sin sesion real.
- Prototipado rapido en ComfyUI: al ser un unico safetensors de UNet, se integra en grafos existentes para iterar sobre prompts y semillas con coste de configuracion bajo.
- Produccion por lotes via API de RunningHub: para equipos que no quieran gestionar GPU propia, la plataforma ofrece ejecucion remota del modelo con el mismo fichero de pesos.
- Investigacion sobre sesgo y fidelidad fotografica: util como caso de estudio de un ajuste de dominio estrecho entrenado solo con fotos reales, para comparar con modelos base entrenados con datos sinteticos.
- Generacion de avatares y retratos para entornos controlados donde se requiera estetica fotografica y no ilustracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan unos 25 GB, por lo que se necesita al menos una GPU con 24 GB y margen para activaciones; en la practica, 32 GB o mas resultan mas comodos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para ejecucion holgada en bf16. Una RTX 4090 de 24 GB queda al limite y puede requerir offloading.
- GPU de consumo: no cabe con comodidad en tarjetas de 8-16 GB sin cuantizacion adicional, que el autor no publica; seria necesario convertir los pesos a fp8 o a formatos GGUF compatibles con el pipeline, algo no documentado.
- Opciones de despliegue: ComfyUI (entorno declarado por el autor), la plataforma RunningHub y su API. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, que ademas no aplican a un UNet de difusion en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-binyuan-krea-2-portrait-v2.5-bf16-unet | UNet de difusion, ajuste de retrato | no disponible | no aplica | no disponible | HuggingFace, RunningHub |
| rh-binyuan-krea-2-portrait-v3.0-bf16-unet | UNet de difusion, version posterior de la misma familia | no disponible | no aplica | no disponible | HuggingFace |
| rh-binyuan-krea-2-portrait-v3.2-bf16-unet | UNet de difusion, version posterior de la misma familia | no disponible | no aplica | no disponible | HuggingFace |
| rh-binyuan-krea-2-v2.0-bf16-unet | UNet de difusion, variante no especifica de retrato | no disponible | no aplica | no disponible | HuggingFace |

No se dispone de datos de rendimiento ni de comparaciones con modelos de difusion de proposito general, por lo que la comparativa se limita a las variantes de la misma familia publicadas por el mismo autor.

## Limitaciones y advertencias

- La licencia no esta declarada de forma explicita; el autor remite a la del proyecto original o upstream. Antes de un uso comercial es imprescindible verificar la licencia de la base `krea2` y del ecosistema del que deriva.
- El ajuste esta sesgado hacia un dominio muy concreto (retratos de mujeres asiaticas); el rendimiento fuera de ese dominio no esta documentado y probablemente sea inferior al de un modelo generalista.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, manos deformes o texturas inconsistentes, especialmente en composiciones complejas.
- No se documentan los datos de entrenamiento mas alla de la descripcion cualitativa, lo que impide evaluar sesgos demograficos, de edad o de estilo.
- El fichero de pesos es de gran tamano (25 GB en bf16) y no hay variantes cuantizadas publicadas, lo que limita su uso en hardware de consumo.
- La model card no especifica el VAE, el text encoder ni los parametros de muestreo recomendados; el usuario debe inferirlos a partir de la base `krea2`.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no hay evidencia de comunidad ni de validacion externa.
- No se garantiza compatibilidad con versiones futuras de ComfyUI ni con pipelines estandar de diffusers.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-binyuan-krea-2-portrait-v2.5-bf16-unet
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2086001098992734210
- Pagina del autor: https://www.runninghub.cn/user-center/1907766075683921922
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Version posterior v3.0: https://huggingface.co/RunningHubAI/rh-binyuan-krea-2-portrait-v3.0-bf16-unet
- Version posterior v3.2: https://huggingface.co/RunningHubAI/rh-binyuan-krea-2-portrait-v3.2-bf16-unet
- Variante v2.0 sin especializacion de retrato: https://huggingface.co/RunningHubAI/rh-binyuan-krea-2-v2.0-bf16-unet
