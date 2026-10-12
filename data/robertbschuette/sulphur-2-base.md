# robertbschuette/Sulphur-2-base

## Resumen

Sulphur 2 base es un modelo de generacion de video por difusion derivado de Lightricks/LTX-2.3, publicado por el usuario robertbschuette (FusionCow). Se distribuye como un ajuste del modelo base de LTX 2.3 con la caracteristica principal de estar "uncensored", es decir, sin los filtros de contenido habituales, y soporta de forma nativa tanto text-to-video (t2v) como image-to-video (i2v), ademas de los demas formatos heredados de LTX 2.3.

El modelo cuenta con aproximadamente 9.197 millones de parametros (9,2 B) en formato safetensors, con un repositorio de 187,4 GB que incluye varias versiones (bf16, fp8mixed), una LoRA de destilacion para acelerar la inferencia y archivos GGUF. Incorpora ademas un "prompt enhancer" multimodal distribuido como GGUF mas archivo mmproj, pensado para ejecutarse en LM Studio.

Su relevancia es limitada por el momento: el modelo figura con 0 descargas y 0 likes, la model card indica que la inferencia oficial "llegara pronto" y no se detalla licencia ni idiomas soportados. Es, por tanto, un lanzamiento inicial orientado a la comunidad de generacion de video sin censura, no un modelo validado en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de video derivado de Lightricks/LTX-2.3; detalle arquitectonico no disponible |
| Parametros totales | 9.197.093.888 (~9,2 B) en safetensors |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, fp8 (fp8mixed), GGUF |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |
| Pipeline | text-to-video |
| Tamano del repositorio | 187,4 GB |
| Modelo base | Lightricks/LTX-2.3 |
| Fecha de publicacion indicada | 11 de octubre de 2026 (segun metadatos) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Se sabe unicamente que es una derivacion de Lightricks/LTX-2.3, un modelo de difusion para generacion de video, y que conserva los formatos y flujos de trabajo de ese modelo base (t2v, i2v y otros). El autor lo describe como un modelo "uncensored", lo que implica un ajuste fino o merge orientado a eliminar restricciones de contenido del modelo original, probablemente mediante fine-tuning sobre datos propios y tecnicas de model merging (se acredita a colaboradores como TenStrip y silveroxides en tareas de merging y cuantizacion).

No se especifica el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o similares. Si se documenta la existencia de una LoRA de destilacion ("distill lora") que debe combinarse con las versiones completas (bf16 o fp8mixed) para reducir el numero de pasos de inferencia; el autor advierte de no aplicar simultaneamente la LoRA y los modelos completos etiquetados como "sulphur_final" en los workflows. Tambien se incluye un prompt enhancer multimodal (GGUF + mmproj) que acepta texto e imagen.

## Capacidades

- Generacion de video a partir de texto (text-to-video) de forma nativa.
- Generacion de video a partir de imagen (image-to-video) de forma nativa.
- Compatibilidad con los demas formatos y flujos de trabajo de LTX 2.3, segun el autor.
- Generacion de contenido sin filtros ("uncensored"), sin las restricciones habituales del modelo base.
- Prompt enhancer multimodal: acepta texto e imagen como entrada y devuelve el prompt mejorado; se ejecuta en LM Studio como GGUF con archivo mmproj.
- Aceleracion mediante LoRA de destilacion (menos pasos de muestreo).
- Despliegue en cuantizacion GGUF y fp8 para entornos con VRAM limitada.
- No hay informacion sobre soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues explicitas (los idiomas figuran como "no disponibles").

## Casos de uso

- Generacion de clips cortos para previsualizacion creativa: a partir de un prompt de texto se pueden producir videos de concepto para publicidad o guiones graficos, aprovechando el soporte nativo de t2v del modelo.
- Animacion de imagenes fijas (image-to-video): convertir ilustraciones, fotos de producto o fotogramas clave en secuencias animadas, util en marketing y diseño.
- Prototipado rapido de contenido audiovisual en estudios pequeños: al disponer de versiones fp8mixed, bf16 y GGUF, se puede iterar en estaciones con GPU de gama alta sin necesidad de un cluster.
- Investigacion sobre generacion de video sin censura: el modelo esta pensado para estudiar el comportamiento de modelos de difusion sin filtros de contenido, con las salvaguardas legales y eticas que correspondan.
- Mejora automatica de prompts: el prompt enhancer (GGUF + mmproj en LM Studio) permite transformar descripciones breves o imagenes de referencia en prompts detallados antes de lanzar la generacion de video.
- Pipelines de creacion de contenido con ComfyUI: los flujos de trabajo proporcionados por el autor permiten integrar el modelo en grafos de nodos para produccion semi-automatizada de video.
- Ajuste fino sobre el modelo ("train on top of the model"): el autor anuncia instrucciones para entrenar encima del modelo, lo que lo hace util como base para nuevas variantes especializadas.
- Generacion de video en hardware de consumo: mediante las cuantizaciones GGUF, es viable ejecutar el modelo en equipos con menos VRAM que los requeridos por la version bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FVD, CLIP score, MMLU u otras) ni comparaciones cuantitativas con el modelo base LTX-2.3 o con alternativas. Tampoco se documentan valores de latencia o throughput.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros (9,2 B) y de la naturaleza de video del modelo; no proceden de mediciones publicadas por el autor.

- VRAM estimada en bf16: alrededor de 18,4 GB solo para los pesos, mas VAE, codificador de texto y activaciones temporales; se recomienda un minimo de 24 GB.
- VRAM estimada en fp8 (fp8mixed): aproximadamente 9-10 GB de pesos, mas el resto de componentes; viable en GPUs de 16-24 GB.
- VRAM estimada en GGUF: variable segun el nivel de cuantizacion; permite ejecucion en configuraciones de 8-12 GB, con perdida de calidad asociada.
- GPUs recomendadas: NVIDIA A100 (40/80 GB), H100 o RTX 4090 (24 GB) para bf16; RTX 4080/4090, RTX 3090 o similares para fp8; GPUs de 8-12 GB para GGUF.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con fp8 y en GPUs de gama media con GGUF; el bf16 completo queda justo en 24 GB.
- Opciones de despliegue: diffusers (libreria declarada), flujos de ComfyUI, y LM Studio / llama.cpp para el prompt enhancer en GGUF. No se menciona soporte para vLLM ni TGI (orientados a modelos de lenguaje, no aplicables al componente de video).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sulphur 2 base | ~9,2 B | no disponible | no disponible | HuggingFace, CivitAI | Derivado uncensored de LTX-2.3; t2v e i2v |
| Lightricks/LTX-2.3 (base) | no disponible | no disponible | no disponible | HuggingFace | Modelo original del que deriva Sulphur 2; con filtros de contenido |
| Otras alternativas de generacion de video | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento ni de especificaciones de terceros que permitan una comparacion cuantitativa fiable con otros modelos de generacion de video (por ejemplo, de la familia Wan o HunyuanVideo).

## Limitaciones y advertencias

- El modelo se declara explicitamente "uncensored", lo que implica ausencia de filtros de contenido; su uso conlleva riesgos legales y eticos y responsabilidad plena del usuario.
- La licencia no esta especificada en la informacion disponible, por lo que no se puede confirmar si se permite el uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Ausencia total de benchmarks publicados: no hay evidencia objetiva de calidad, coherencia temporal ni fidelidad al prompt.
- Modelo sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- La model card indica que "la inferencia oficial llegara pronto", lo que sugiere que el soporte y la documentacion son incompletos.
- Riesgo de artefactos y alucinacion visual propios de los modelos de difusion de video, especialmente en movimientos rapidos, manos, texto y escenas complejas.
- Idiomas soportados no disponibles; no se puede garantizar un comportamiento correcto en castellano ni en otros idiomas.
- Advertencia del autor sobre los workflows: no usar simultaneamente la LoRA de destilacion y los modelos completos etiquetados como "sulphur_final".
- El prompt enhancer requiere una instalacion manual (carpetas "Sulphur/promptenhancer" en LM Studio) y no dispone de prompt de sistema.
- El repositorio ocupa 187,4 GB, lo que exige espacio de almacenamiento y ancho de banda considerables.
- Fecha de publicacion en metadatos (11 de octubre de 2026) posterior a la fecha actual de referencia, lo que conviene verificar.

## Enlaces

- HuggingFace: https://huggingface.co/robertbschuette/Sulphur-2-base
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- X del autor: https://x.com/FusionCow11
- Discord: https://discord.gg/C3d56f39Ah
- Ko-fi: https://ko-fi.com/fusioncow
- CivitAI (modelo base): https://civitai.red/models/2594061/sulphur-2-base
- CivitAI (modelo cuantizado): https://civitai.red/models/2630742
- Merge i2v de TenStrip: https://huggingface.co/TenStrip/LTX2.3-10Eros
- Perfil de silveroxides (cuantizacion/merging): https://huggingface.co/silveroxides
