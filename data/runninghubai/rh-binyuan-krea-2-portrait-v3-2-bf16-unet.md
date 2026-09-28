# RunningHubAI/rh-binyuan-krea-2-portrait-v3.2-bf16-unet

## Resumen

rh-binyuan-krea-2-portrait-v3.2-bf16-unet es un modelo de difusion de tipo UNET orientado a la edicion y generacion de imagenes a partir de texto (pipeline image-text-to-image), especializado en retratos. Lo publica la plataforma RunningHub bajo la cuenta RunningHubAI, en nombre del autor original (@冰缘排骨), y se distribuye como un unico fichero de pesos en precision bf16 de 25.066 MiB (unos 26,3 GB de repositorio). Esta fine-tuneado a partir de krea2, el modelo base de la familia Krea, segun declara la propia model card.

El modelo no es un modelo de lenguaje: es un componente UNET pensado para cargarse dentro de un flujo de ComfyUI (o ejecutarse en la plataforma RunningHub) junto con el resto de piezas habituales de un pipeline de difusion (text encoder y VAE), que no se incluyen en este repositorio. Su rasgo diferencial declarado es la especializacion en retratos y, en la version 3.2, la incorporacion de mejoras de estabilidad de pose respecto a las versiones anteriores a la 3.0.

Es relevante ahora porque forma parte de una serie de versiones encadenadas (v2.0, v2.5, v3.0 y v3.2) publicadas por el mismo autor, lo que permite iterar sobre un mismo flujo de trabajo sin cambiar de arquitectura base. Como contrapartida, el repositorio no incluye model card tecnica detallada, no declara licencia explicita, no aporta idiomas soportados ni resultados de benchmarks, y acumula 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validacion comunitaria publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para image-text-to-image y edicion de imagen; fine-tune de krea2 |
| Parametros totales | no disponible (estimacion derivada del fichero: ~13.000 millones en bf16, no confirmada por el autor) |
| Parametros activos | no aplica (no es un modelo MoE; no hay dato de arquitectura dispersa) |
| Longitud de contexto | no disponible (no aplica como ventana de tokens; el condicionamiento es por prompt de texto) |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos bf16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (RunningHub publica en nombre del autor y remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (bf16), fichero `binyuan_krea_2_portrait _v3.2_bf16.safetensors` |
| Tamano del repositorio | 26,3 GB (fichero de pesos: 25.066 MiB) |
| Fecha de publicacion | 28 de septiembre de 2026 (creacion y ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card identifica el modelo como un "UNET (image edit)" fine-tuneado desde krea2, sin detallar el numero de bloques, la dimension de atencion, el tipo de scheduler ni si emplea atencion con conexiones residuales largas o un transformer de difusion. Tampoco se especifica si el entrenamiento se hizo con LoRA fusionada, fine-tune completo o un esquema de DreamBooth sobre un subconjunto de retratos. Lo unico declarado respecto a la evolucion tecnica es que la version 3.2 anade estabilidad de pose tomando como referencia las versiones anteriores a la 3.0, es decir, se trata de una mejora incremental sobre la misma linea de trabajo, sin cambio de arquitectura anunciado.

No hay informacion sobre volumen de tokens de entrenamiento, composicion del dataset, resolucion de entrenamiento, uso de RLHF/DPO (no aplicable en el sentido de un LLM, aunque podria existir un ajuste por preferencias del que no se da cuenta) ni sobre tecnicas de decodificacion especulativa o atencion lineal. El modelo se distribuye unicamente como pesos UNET: el text encoder, el VAE y cualquier adaptador de control (pose, depth, etc.) necesarios para reproducir los resultados mostrados en la plataforma quedan fuera de este repositorio y deben obtenerse por separado.

## Capacidades

- Generacion de imagenes a partir de texto en el pipeline image-text-to-image, cargando el UNET en ComfyUI o en RunningHub.
- Edicion de imagen: la propia model card clasifica el modelo como UNET de edicion de imagen, por lo que se espera uso en tareas de retoque o transformacion guiada por prompt.
- Especializacion en retratos: la serie "portrait" esta orientada a figuras humanas, no a escenas genericas.
- Mejora de estabilidad de pose en la version 3.2 respecto a las versiones anteriores a la 3.0, segun declaracion del autor.
- Integracion directa con el ecosistema ComfyUI (tag `comfyui`) y con la API/plataforma de RunningHub.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, capacidades de audio, vision-language o modo de pensamiento (thinking). Se trata de un modelo puramente generativo de imagen.
- No se documentan capacidades multilingues ni idiomas admitidos en el prompt.

## Casos de uso

- Generacion de retratos fotorrealistas para estudio: el modelo se carga como UNET en ComfyUI y se usa para producir retratos a partir de una descripcion textual, aprovechando la especializacion de la serie portrait en lugar de un modelo generico.
- Edicion de retratos en flujo de postproduccion fotografica: al ser un UNET de edicion, permite reformular iluminacion, vestuario o fondo sobre una imagen de entrada manteniendo la identidad de la persona, siempre con una seleccion manual del resultado.
- Produccion de avatares de personaje consistente: la mejora de estabilidad de pose de la 3.2 es util cuando se generan varias tomas del mismo personaje y se necesita coherencia postural entre ellas.
- Iteracion de estilo dentro de una misma serie: disponer de las versiones v2.0, v2.5, v3.0 y v3.2 permite comparar resultados y fijar la version que mejor encaje con un estilo concreto sin cambiar el grafo de ComfyUI.
- Prototipado de assets para campanas o branding: generar un abanico de propuestas de retrato antes de una sesion real, reduciendo el coste de las rondas de direccion de arte.
- Integracion en un servicio gestionado mediante la API de RunningHub: al estar publicado en esa plataforma, se puede invocar de forma remota sin montar infraestructura GPU propia, util para equipos pequenos o para picos de demanda.
- Automatizacion de catalogos con figuras humanas (moda, accesorios): generacion por lotes de imagenes de modelo con parametros controlados por prompt, verificando siempre que la pose no se degrade.
- Pruebas de investigacion sobre fine-tunes de difusion: al ser un fine-tune declarado de krea2 en bf16, sirve como punto de comparacion frente a otros fine-tunes de la misma familia en experimentos de calidad de retrato y fidelidad de pose.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay valores de FID, CLIP score, ImageReward, HPS v2 ni comparaciones cuantitativas con otros modelos de la familia. La model card se limita a describir el modelo y a enlazar la plataforma de ejecucion, sin tabla de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 25.066 MiB en bf16, por lo que una carga completa en VRAM exige del orden de 25-26 GB, mas el consumo adicional del text encoder, el VAE y los latentes (habitualmente varios GB mas).
- Con descarga por bloques (offload) a RAM o a disco, que ComfyUI admite, el modelo puede ejecutarse en GPUs con mucha menos VRAM, a costa de un aumento notable del tiempo por imagen. No hay cifras de latencia publicadas.
- GPU recomendadas por capacidad: A100 40 GB u 80 GB, H100 80 GB, L40S 48 GB y A6000 48 GB permiten mantener los pesos en VRAM con margen. Las RTX 4090, RTX 3090 y RTX 5090 con 24-32 GB quedan al limite y dependen de la gestion de memoria del nodo de ComfyUI.
- GPU de consumo: cabe en tarjetas de 24 GB o mas con offloading parcial o total; en tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 4080 en configuraciones recortadas) es previsible que requiera offload y penalizacion de velocidad. No hay datos medidos.
- Opciones de despliegue: ComfyUI como destino principal (tag `comfyui`), la plataforma y API de RunningHub, y cualquier runner de difusion capaz de cargar safetensors bf16. No aplican vLLM, TGI, llama.cpp ni Ollama, que son servidores para modelos de lenguaje.
- Throughput y latencia: no disponibles.

## Comparativa con modelos similares

Los unicos modelos comparables documentados en la informacion disponible son las otras publicaciones de la misma serie del autor. No hay datos de benchmarks para ninguno de ellos, por lo que la comparacion se limita a identidad, versionado y disponibilidad.

| Modelo | Tipo | Base declarada | Relacion con este modelo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-binyuan-krea-2-portrait-v3.2-bf16-unet | UNET image-text-to-image (retratos) | krea2 | Version analizada; anade estabilidad de pose | no disponible | Hugging Face / RunningHub |
| rh-binyuan-krea-2-portrait-v3.0-bf16-unet | UNET de retratos | krea2 | Version anterior de la misma serie | no disponible | Hugging Face / RunningHub |
| rh-binyuan-krea-2-portrait-v2.5-bf16-unet | UNET de retratos | krea2 | Version anterior de la misma serie | no disponible | Hugging Face / RunningHub |
| rh-binyuan-krea-2-v2.0-bf16-unet | UNET de generacion/edicion | krea2 | Version no especifica de retratos dentro de la serie | no disponible | Hugging Face / RunningHub |
| rh-krea2-bkz-unet | UNET | krea2 | Fine-tune alternativo del mismo autor sobre la misma base | no disponible | Hugging Face / RunningHub |
| rh-krea2-turbo-bf16-unet | UNET | krea2 | Variante turbo orientada a menos pasos de inferencia | no disponible | Hugging Face / RunningHub |

No hay informacion en el material proporcionado sobre modelos de otras familias (por ejemplo, otros fine-tunes de retrato o modelos base de difusion equivalentes) que permita una comparacion de parametros, contexto o rendimiento con datos verificables.

## Limitaciones y advertencias

- Licencia no disponible: la model card indica que los derechos siguen siendo del autor y remite a la licencia del proyecto original, sin nombrarla. No se puede asumir uso comercial libre sin verificar la licencia upstream de krea2.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin discusiones ni reportes de terceros que confirmen la calidad o la reproducibilidad de los resultados.
- Ausencia total de benchmarks: no hay ninguna metrica objetiva de calidad de imagen, fidelidad al prompt o estabilidad de pose.
- Modelo incompleto como pipeline: el repositorio solo contiene el UNET. Sin el text encoder y el VAE correctos, el modelo no produce resultados, y no se documenta que versiones concretas son compatibles.
- Riesgo de artefactos y alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta (manos, ojos, orejas), texto ilegible en la imagen y elementos inexistentes, especialmente con prompts ambiguos.
- Sesgos potenciales: al estar especializado en retratos y entrenado presumiblemente con un dataset de rostros no documentado, es probable que reproduzca sesgos esteticos, etnicos y de genero, ademas de una tendencia a un canon de belleza concreto. No hay informacion sobre la composicion del dataset.
- Idiomas del prompt no declarados: no se especifica que idiomas entiende el text encoder asociado, por lo que el comportamiento con prompts en castellano es incierto.
- Contexto y resolucion no documentados: se desconoce la resolucion nativa de entrenamiento y las proporciones soportadas, algo critico para retratos verticales.
- Coste de hardware elevado: 25 GB de pesos en bf16 obligan a GPUs profesionales o a offloading con perdida de rendimiento.
- Fecha de publicacion inusual (2026) y actualizacion concentrada en 13 minutos el mismo dia, lo que sugiere una subida automatizada desde la plataforma y refuerza la falta de documentacion tecnica.
- No apto para herramientas de servido de LLM: no puede desplegarse con vLLM, TGI, llama.cpp ni Ollama.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-binyuan-krea-2-portrait-v3.2-bf16-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2088276380966928385
- Pagina del autor (@冰缘排骨): https://www.runninghub.ai/user-center/1975784978346901506
- Plataforma RunningHub: https://www.runninghub.ai
- Sitio de RunningHub en China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API de este modelo: https://www.runninghub.ai/call-api?utm_source=huggingface&utm_medium=badge&utm_campaign=api_promotion&utm_content=rh-2088276380966928385
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Version 3.0 de la misma serie: https://huggingface.co/RunningHubAI/rh-binyuan-krea-2-portrait-v3.0-bf16-unet
- Version 2.5 de la misma serie: https://huggingface.co/RunningHubAI/rh-binyuan-krea-2-portrait-v2.5-bf16-unet
- Version 2.0 de la misma serie: https://huggingface.co/RunningHubAI/rh-binyuan-krea-2-v2.0-bf16-unet
- Fine-tune alternativo rh-krea2-bkz-unet: https://huggingface.co/RunningHubAI/rh-krea2-bkz-unet
- Variante turbo rh-krea2-turbo-bf16-unet: https://huggingface.co/RunningHubAI/rh-krea2-turbo-bf16-unet-2102646504816201729
