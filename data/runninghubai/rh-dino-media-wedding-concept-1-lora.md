# RunningHubAI/rh-dino-media-wedding-concept-1-lora

## Resumen

`rh-dino-media-wedding-concept-1-lora` es un adaptador LoRA de bajo rango para generacion de imagenes text-to-image, afinado sobre Flux.1 y entrenado especificamente para producir fotografias de boda y de pareja con distintos conceptos estilisticos. Lo publica la plataforma RunningHub en nombre del autor Dino Media AI, y su destino principal son flujos de trabajo en ComfyUI o la propia plataforma RunningHub, tanto en su version internacional como en la china.

El modelo no es un LLM ni un modelo multimodal de proposito general: es un complemento de un modelo base de difusion. El repositorio contiene un unico fichero de pesos, `WeddingConcept1.safetensors`, de 292 MiB, que se carga junto a Flux.1 y modula su comportamiento mediante la palabra de activacion `wd1`. La model card indica que se entreno con una coleccion amplia de fotografias de boda de parejas en varios conceptos, con multiples poses e imagenes por concepto.

Su relevancia practica es acotada pero clara: permite a fotografos, estudios y agencias generar previsualizaciones de conceptos nupciales y material de pareja sin sesion fotografica, y combinarlo con otros LoRA de estilo o iluminacion sobre la misma base. La informacion publicada es escasa: no hay datos de benchmarks, no se declara licencia concreta, no se detalla el dataset de entrenamiento ni el numero de imagenes o pasos, y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Flux.1, modelo de difusion text-to-image |
| Parametros totales | no disponible (el adaptador pesa 292 MiB en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; no dispone de ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts se procesan con el text encoder de Flux.1) |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`WeddingConcept1.safetensors`, 292 MiB) |
| Tipo de modelo | LoRA text-to-image |
| Modelo base | Flux.1 (finetuned from) |
| Palabra de activacion | `wd1` |
| Plataformas | ComfyUI, RunningHub, Hugging Face |
| Ajustes recomendados | peso LoRA 0.8-1.0; sampler DPM++ 2M Karras o Euler A; CFG 3.5; 20-30 pasos |
| Tamano del repositorio | 0.3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-26 |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Flux.1 sin modificar sus pesos originales. Flux.1 es un transformer de difusion (DiT) con un text encoder y un VAE; el LoRA actua sobre las proyecciones de atencion y las capas lineales del denoiser, de modo que el fichero de 292 MiB se suma a los pesos del modelo base en lugar de sustituirlos. Esto permite cargar y descargar el estilo con bajo coste de almacenamiento y combinarlo con otros adaptadores.

Segun la model card, el entrenamiento se realizo sobre una coleccion amplia de fotografias de boda de parejas, organizada por conceptos actualizados a las tendencias recientes, con multiples poses e imagenes por concepto. No se especifican el numero de imagenes, el numero de pasos de entrenamiento, la resolucion, el rango del LoRA, la tasa de aprendizaje ni si se aplicaron tecnicas de regularizacion o captions automaticos. Tampoco se documenta el proceso de curacion del dataset ni el origen de las fotografias. No hay informacion sobre RLHF, DPO ni tecnicas de alineacion, algo que no aplica en un modelo de difusion de este tipo.

## Capacidades

- Generacion de imagenes de boda y de pareja en multiples conceptos estilisticos a partir de un prompt de texto y la palabra de activacion `wd1`.
- Reproduccion de poses y composiciones variadas dentro de un mismo concepto, segun la descripcion del autor sobre el dataset de entrenamiento.
- Aplicacion en fotografia nupcial, fotografia de pareja, materiales impresos y advertisment, tal como indica la model card.
- Combinacion con otros LoRA sobre Flux.1 para reforzar estilo, iluminacion o vestuario, segun recomienda el propio autor.
- Integracion en flujos de ComfyUI y en la plataforma RunningHub, incluyendo su API.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision de entrada, audio ni modo thinking: es exclusivamente un adaptador de generacion de imagen.
- Capacidad multilingue de los prompts: no documentada; depende del text encoder del modelo base.

## Casos de uso

- Previsualizacion de conceptos en estudio fotografico: el fotografo genera con `wd1` una bateria de propuestas visuales antes de la sesion real, de modo que el cliente elige concepto, vestuario y localizacion sin coste de produccion.
- Presentaciones comerciales de wedding planners: se producen mockups de ambientacion y de pareja para incluirlos en propuestas a clientes, con variaciones rapidas de concepto gracias al bajo peso del adaptador.
- Publicidad de marcas de moda nupcial: generacion de imagenes de campaña con parejas en distintos escenarios para testear conceptos creativos antes de contratar produccion fotografica.
- Contenido para redes sociales de fotografos y estudios: series de imagenes coherentes en estilo para Instagram o Pinterest, ajustando el peso del LoRA entre 0.8 y 1.0 segun la intensidad deseada.
- Composicion controlada en ComfyUI con img2img, inpainting o ControlNet: manteniendo la identidad de una pareja real y aplicando el concepto nupcial solo al entorno, vestuario o iluminacion.
- Prototipado dentro de un pipeline de automatizacion: llamada a la API de RunningHub para generar lotes de variantes a partir de una plantilla de prompt, integrable en una herramienta interna de un estudio.
- Combinacion con otros adaptadores: superponer este LoRA con uno de iluminacion o de estilo fotografico sobre Flux.1 para ajustar el acabado final sin reentrenar.
- Material impreso y editorial: generacion de imagenes de relleno para albumes de muestra, catalogos de proveedores o revistas del sector nupcial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas objetivas (FID, CLIP score, similitud de concepto, evaluaciones humanas) ni comparaciones cuantitativas con otros LoRA de tematica similar. Tampoco se documenta el coste de inferencia ni el throughput en ninguna GPU.

## Requisitos de hardware

- El adaptador en si ocupa 292 MiB en disco y anade un coste de VRAM marginal; el requisito dominante lo impone el modelo base Flux.1.
- VRAM estimada para el conjunto base + LoRA (estimacion general para Flux.1, no publicada en la informacion del modelo): en precision fp16 en torno a 20-24 GB; con cuantizacion GGUF Q8 alrededor de 12-16 GB; con Q4 en torno a 8-10 GB.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para despliegue en servidor; RTX 4090 o RTX 3090 (24 GB) para fp16 en local; RTX 4060 Ti de 16 GB o superiores con cuantizacion GGUF.
- Cabe en GPU de consumo con cuantizacion: si, en tarjetas de 12-16 GB mediante ComfyUI con nodos GGUF, y en 24 GB sin cuantizar.
- Opciones de despliegue: ComfyUI (flujo nativo recomendado por el autor), plataforma y API de RunningHub, y Diffusers con PEFT para cargar el adaptador sobre Flux.1 en Python. vLLM, TGI, llama.cpp y Ollama no aplican a un modelo de difusion de este tipo.
- Latencia y throughput: no disponibles. Los ajustes sugeridos son 20-30 pasos con CFG 3.5, sampler DPM++ 2M Karras o Euler A, lo que sitúa la generacion en el rango tipico de Flux.1 por imagen, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-dino-media-wedding-concept-1-lora | LoRA sobre Flux.1 | no disponible (292 MiB) | no aplica | sin benchmarks publicados | no disponible | Hugging Face, RunningHub, ComfyUI |
| Flux.1 (modelo base) | DiT text-to-image | no disponible en esta ficha | no aplica | benchmarks publicados por el autor del modelo base, no incluidos aqui | licencia del proyecto original | amplia, multiples canales |
| Otros LoRA de tematica nupcial en RunningHub | LoRA sobre Flux.1 | no disponible | no aplica | sin benchmarks publicados | no disponible | RunningHub |
| rh-1-lora (mismo autor) | LoRA image-text-to-image | no disponible | no aplica | sin benchmarks publicados | no disponible | Hugging Face, RunningHub |

No se dispone de datos cuantitativos que permitan una comparacion de rendimiento fiable entre este adaptador y alternativas de la misma categoria; las filas anteriores reflejan unicamente tipo de modelo y canal de publicacion.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, fidelidad al concepto ni consistencia entre generaciones.
- Licencia no especificada: la model card remite a la licencia del proyecto original o upstream, lo que impide confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia de Flux.1 y contactar con el autor antes de usarlo en produccion.
- Datos de entrenamiento no documentados: se desconoce el origen, los permisos y la composicion del dataset de fotografias de boda, lo que introduce riesgo legal y de sesgo.
- Sesgos previsibles: al entrenarse con fotografia nupcial, es probable que reproduzca estereotipos de genero, cuerpo, edad, etnia y clase social propios del sector, ademas de un sesgo cultural hacia la boda occidental. El autor no documenta ninguna mitigacion.
- Riesgo de sobreajuste a las poses y composiciones del dataset, con menor capacidad de generalizacion fuera de los conceptos entrenados.
- Dependencia de la palabra de activacion `wd1`: sin ella el efecto del LoRA se reduce o desaparece, y con pesos superiores a 1.0 puede producir artefactos y rigidez en las poses.
- Idioma: no se documenta el comportamiento con prompts en castellano; el text encoder de Flux.1 funciona mejor en ingles, por lo que se recomienda redactar los prompts en ese idioma.
- Alucinacion visual: como cualquier modelo de difusion, puede generar anatomia incorrecta, manos distorsionadas, anillos o detalles textiles incoherentes, especialmente en escenas con varias personas.
- Repositorio sin traccion (0 descargas, 0 likes) y sin historial de versiones: no hay senal de validacion por parte de la comunidad.
- Requiere el modelo base Flux.1, cuyo coste de VRAM y cuya licencia condicionan por completo el uso real del adaptador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-dino-media-wedding-concept-1-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-dino-media-wedding-concept-1-lora/blob/main/README_cn.md
- Pagina original del modelo en RunningHub: https://www.runninghub.ai/model/public/1901806995467296769
- Pagina del modelo en RunningHub China: https://www.runninghub.cn/model/public/1901806995467296769
- Version en chino de la pagina del modelo: https://www.runninghub.ai/zh-cn/model/public/1901806995467296769
- Perfil del autor (Dino Media AI): https://www.runninghub.ai/user-center/1889131752953171970
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Otro LoRA del mismo autor (referencia): https://huggingface.co/RunningHubAI/rh-1-lora
