# RunningHubAI/rh-berry-model-anima-unet

## Resumen

rh-berry-model-anima-unet es un modelo de difusion en formato UNET orientado a la generacion de video a partir de texto (text-to-video), publicado en Hugging Face por RunningHubAI. Se distribuye como un unico fichero de pesos en formato safetensors de aproximadamente 3988 MiB (4.2 GB de repositorio) y esta pensado para cargarse en ComfyUI o en la plataforma RunningHub. Segun la model card, se trata de un ajuste fino (finetune) derivado de un modelo base llamado "anima", con un estilo visual neon, colorido y con acabado 3D brillante, e incorpora un LoRA de mejora de detalle integrado en los pesos.

La relevancia de este modelo es acotada: no es un modelo de lenguaje ni un modelo fundacional con documentacion tecnica publica, sino un artefacto de pesos para un pipeline concreto de generacion de video dentro del ecosistema ComfyUI. La informacion disponible no incluye detalles sobre arquitectura interna, numero de parametros, longitud de contexto temporal, datos de entrenamiento ni resultados de benchmarks, por lo que buena parte de las especificaciones habituales deben marcarse como no disponibles.

El autor indica unos parametros de muestreo recomendados (DPM++ 2M Normal, CFG 5, 35 pasos) y una lista de palabras de activacion (trigger words) orientadas al estilo, lo que sugiere un uso practico centrado en la generacion estilizada de clips y no en tareas de razonamiento, codigo o comprension del lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para text-to-video (detalle interno no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; no se documentan variantes GGUF/FP8) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`berryModelANIMA_strawberryV10.safetensors`, 3988 MiB) |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un UNET para text-to-video, afinado a partir de un modelo base denominado "anima". No se especifican el tipo de backbone (por ejemplo, si es un transformer de difusion, un UNet convolucional clasico o una variante hibrida), el numero de parametros, la resolucion o duracion de los clips soportados, ni la dimension del espacio latente. Tampoco se detalla si emplea tecnicas como atencion espacial-temporal separada, atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, la model card solo indica que es un finetune del modelo "anima" y que incorpora un LoRA de mejora de detalle "horneado" en los pesos finales. No se publican el volumen de datos, la composicion del dataset, el numero de pasos de entrenamiento, ni si se aplicaron tecnicas de alineacion como RLHF o DPO (poco habituales en modelos de difusion de este tipo). Tampoco hay informacion sobre el procedimiento de destilacion o de ajuste de la tasa de aprendizaje.

## Capacidades

- Generacion de video a partir de descripciones textuales (text-to-video) dentro de pipelines ComfyUI.
- Estilizacion visual con estetica neon, colores saturados y acabado 3D brillante, segun la descripcion del autor.
- Mejora de detalle integrada mediante un LoRA horneado en los pesos.
- Control del estilo mediante palabras de activacion (trigger words): masterpiece, high definition, high resolution, anime screenshot, detailed, realistic, semi realistic, smooth skin, controlled specular lights, neon vibes.
- Soporte de prompt negativo para evitar colores apagados, mezclados o sobresaturados, y piel excesivamente brillante.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades de vision o audio.

## Casos de uso

- Generacion de clips promocionales estilizados: el modelo puede producir videos cortos con estetica neon y acabado 3D para campanas de marca o contenido en redes sociales, usando los parametros de muestreo recomendados (DPM++ 2M Normal, CFG 5, 35 pasos) para obtener resultados consistentes con el estilo entrenado.
- Creacion de animaciones de personajes anime: gracias a las trigger words orientadas a "anime screenshot" y "smooth skin", es adecuado para generar secuencias de personajes con un look semirrealista y brillos controlados.
- Prototipado rapido de storyboards: en un flujo ComfyUI se pueden generar variaciones de una escena a partir de distintos prompts para explorar direccion de arte antes de producir el material final.
- Contenido para videojuegos o entornos 3D: el acabado glossy 3D lo hace util para generar material de referencia visual o cinemáticas estilizadas de bajo coste.
- Integracion en pipelines de automatizacion creativa: mediante la API de RunningHub se puede invocar el modelo de forma programatica para generar lotes de clips a partir de una lista de prompts.
- Experimentacion en investigacion de difusion para video: sirve como punto de partida para estudiar el efecto de LoRAs horneados y de parametros de muestreo en la coherencia temporal y el estilo.
- Generacion de fondos animados y loops visuales: util para producir material de ambiente con paletas saturadas y brillos controlados para webs o presentaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un UNET en safetensors de ~4 GB requiere al menos esa cantidad de memoria para cargar los pesos, mas la memoria adicional para latentes, VAE y el resto del pipeline de video; en la practica suele necesitarse bastante mas VRAM que el tamano del fichero.
- GPU recomendadas: no especificadas por el autor. Por el tamano del fichero, es plausible ejecutarlo en GPU de consumo con 12-16 GB de VRAM o superior, y con mayor holgura en A100, H100 o RTX 4090, pero no hay confirmacion oficial.
- Cabe en GPU de consumo: probablemente si en modelos con 12 GB o mas, aunque no esta documentado.
- Opciones de despliegue: ComfyUI (entorno principal indicado) y la plataforma RunningHub (web y API). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa con otras alternativas de text-to-video.

## Limitaciones y advertencias

- Ausencia de documentacion tecnica: no se publican parametros, arquitectura interna, datos de entrenamiento ni evaluaciones, lo que dificulta evaluar su calidad de forma objetiva.
- Licencia no disponible: la model card remite a la licencia del proyecto original o upstream, sin especificarla; antes de un uso comercial es imprescindible verificar los terminos del modelo base "anima" y del autor.
- Riesgo de artefactos y alucinacion visual: como todo modelo de difusion para video, puede generar incoherencias temporales, deformaciones anatomicas o elementos no solicitados en el prompt.
- Estilo muy especializado: el ajuste fino esta orientado a una estetica neon y glossy concreta; fuera de ese registro puede ofrecer resultados pobres o poco versatiles.
- Dependencia de trigger words y parametros concretos: el autor recomienda unos ajustes especificos (DPM++ 2M Normal, CFG 5, 35 pasos); desviarse de ellos puede degradar la calidad.
- Idiomas: no se documenta el soporte multilingue de los prompts; la model card esta en ingles y chino, y no hay garantias sobre el comportamiento con prompts en castellano.
- Sesgos: no se documentan sesgos conocidos, pero al ser un finetune estilistico de un modelo base no auditado, puede heredar sesgos de representacion del dataset original.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la evidencia externa sobre su comportamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-berry-model-anima-unet
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2099411655200694273
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2007154923476885506
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
