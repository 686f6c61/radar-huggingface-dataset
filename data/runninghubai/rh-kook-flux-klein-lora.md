# RunningHubAI/rh-kook-flux-klein-lora

## Resumen

rh-kook-flux-klein-lora es un adaptador LoRA de text-to-image publicado por RunningHubAI (cuenta corporativa de RunningHub) en nombre del autor identificado como @KOOK. No es un modelo completo, sino un ajuste fino de bajo rango que se carga sobre el modelo base Flux2-Klein-9B para especializar la generacion de imagenes en retratos, segun indica el propio autor, orientados a "texture enhancement" de retratos y con foco en rostros asiaticos (el archivo de pesos se llama Kook_Flux_klein_亚洲人像, es decir, "retrato asiatico").

El repositorio contiene un unico archivo safetensors de 83 MiB, lo que confirma que se trata de pesos de adaptador y no de un modelo de difusion completo. La relevancia practica esta en que permite reutilizar una base de generacion de imagenes ya entrenada y aplicar solo el delta de pesos necesario para obtener un estilo fotografico concreto, reduciendo coste de almacenamiento y de despliegue frente a un fine-tuning completo.

La ficha publica es muy escasa: no se declaran parametros del adaptador, resolucion de entrenamiento, dataset, numero de pasos ni licencia concreta. La fecha de creacion y actualizacion registrada (2026-09-24) es posterior a la fecha actual de consulta, y el repositorio presenta 0 descargas y 0 likes, por lo que debe tratarse como un artefacto recien publicado y sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion text-to-image; modelo base Flux2-Klein-9B |
| Parametros totales | No disponible para el adaptador; el archivo de pesos ocupa 83 MiB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de generacion de imagen, no de texto) |
| Tipos de cuantizacion | No disponible; se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | No disponible; publicado por RunningHub en nombre del autor, con copyright del autor y remision a la licencia del proyecto original |
| Formato de pesos | safetensors |
| Modelo base | Flux2-Klein-9B (fine-tuned from) |
| Palabras de activacion | zshx |
| Tamano del repositorio | 0,1 GB |
| Archivos | Kook_Flux_klein_亚洲人像.safetensors (83 MiB) |
| Plataformas | ComfyUI, RunningHub, Hugging Face |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura del adaptador ni la del modelo base. Por el tipo declarado en la model card (LoRA aplicada a un pipeline text-to-image de la familia Flux) y por el nombre del base (Flux2-Klein-9B), se trata de un ajuste de bajo rango sobre un transformer de difusion, del que no se especifican numero de capas, dimension del modelo, mecanismo de atencion ni estrategia de condicionamiento de texto.

Tampoco hay datos sobre el entrenamiento: no se indica el numero de imagenes, la composicion del dataset, la resolucion de entrenamiento, el numero de pasos, el rango del LoRA, el learning rate ni si hubo etapas de alineacion (RLHF, DPO o similares). La unica informacion funcional es que el objetivo declarado es la mejora de textura en retratos y que existe una palabra de activacion obligatoria, zshx, sin la cual previsiblemente el efecto del adaptador no se aplica.

## Capacidades

- Generacion de imagenes text-to-image al cargarse sobre el modelo base Flux2-Klein-9B.
- Especializacion en retratos, con enfasis declarado en la mejora de textura de piel y detalle facial.
- Enfoque en rostros asiaticos segun la denominacion del archivo de pesos.
- Activacion mediante la palabra clave zshx en el prompt.
- Integracion en flujos de ComfyUI como nodo de carga de LoRA.
- Posibilidad de apilarse con otros LoRA, siempre que el soporte de ComfyUI y el modelo base lo permitan (no confirmado en la informacion disponible).
- No hay informacion sobre soporte de inpainting, control de pose, img2img, edicion o generacion de video.
- No hay informacion sobre capacidades multilingues del text encoder del modelo base.

## Casos de uso

- Retoque y mejora de textura en retratos: el adaptador esta declarado explicitamente para "portrait dataset texture enhancement", por lo que encaja en pipelines de restauracion o mejora de piel sobre imagenes ya generadas o capturadas.
- Generacion de avatares para publicaciones y redes sociales: con la palabra zshx y un prompt descriptivo se puede producir un retrato coherente con el estilo del LoRA dentro de un flujo de ComfyUI.
- Produccion de contenido para mercados asiaticos: al estar orientado a rostros asiaticos, resulta adecuado para campanas, ilustracion editorial o material de marca dirigidos a ese publico.
- Fotografia de producto con modelo humano: generacion de imagenes de catalogo con rostros consistentes para e-commerce, reduciendo la necesidad de sesiones fotograficas.
- Creacion de personajes recurrentes: al fijar un estilo de retrato, el LoRA ayuda a mantener una apariencia estable entre imagenes de una misma serie o storyboard.
- Integracion via API en produccion: RunningHub documenta una API de ejecucion, de modo que el flujo de generacion con este LoRA puede invocarse desde servicios backend sin desplegar infraestructura propia.
- Aumento de datasets: generacion sintetica de retratos con textura realista para ampliar conjuntos de entrenamiento de otros modelos, sujeto a las condiciones de licencia del autor y del modelo base.
- Automatizacion de pruebas de concepto visuales: iteracion rapida de estilos de retrato en ComfyUI antes de decidir una produccion mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador por si solo ocupa 83 MiB en disco, pero no es utilizable sin el modelo base Flux2-Klein-9B, cuyos requisitos son los que dominan el despliegue.
- La VRAM necesaria depende enteramente del modelo base, la precision de carga y la estrategia de offload; la model card no especifica cifras. Para un transformer de difusion de la clase de 9B (segun la denominacion del base), son habituales rangos orientativos de 8 a 24 GB en funcion de si se usa fp8/fp16, atencion optimizada o descarga de pesos a CPU/RAM, pero estos valores son una estimacion de categoria y no un dato confirmado por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada. Como referencia de categoria, GPU de datacenter tipo A100/H100 para lotes grandes, y GPU de consumo con 12-24 GB de VRAM para uso individual.
- Compatibilidad con GPU de consumo: probable en tarjetas con VRAM suficiente para el modelo base (por ejemplo, gamas de 16-24 GB) si se aplican cuantizaciones y offload, pero no confirmado por el autor.
- Opciones de despliegue: ComfyUI como via principal declarada, ademas de la plataforma RunningHub (interfaz web y API). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|---|
| rh-kook-flux-klein-lora | LoRA de retrato sobre Flux2-Klein-9B | No disponible (adaptador de 83 MiB) | No aplica | No disponible | Hugging Face, ComfyUI, RunningHub; 0 descargas | No publicados |
| Flux2-Klein-9B (modelo base) | Modelo de difusion text-to-image completo | 9B segun denominacion (no confirmado) | No aplica | No disponible en esta informacion | Referenciado como base; enlaces del autor no accesibles desde esta ficha | No publicados |
| Otros LoRA de retrato para la familia Flux | Adaptadores de bajo rango | No disponible | No aplica | Variable segun autor | Ampliamente distribuidos en Hugging Face y Civitai | No comparable con datos verificables |

No se dispone de datos numericos verificables que permitan una comparacion cuantitativa con alternativas de la misma categoria. La busqueda web realizada no devolvio resultados relacionados con el modelo.

## Limitaciones y advertencias

- La licencia no esta declarada de forma explicita. La model card indica que el copyright permanece con el autor y remite a la licencia del proyecto original, sin concretarla, lo que impide confirmar si el uso comercial esta permitido.
- El repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad ni resultados reproducibles publicos.
- No hay informacion sobre composicion del dataset de entrenamiento, lo que impide evaluar sesgos de representacion mas alla del enfoque declarado en retratos asiaticos.
- Es un adaptador, no un modelo autonomo: sin el base Flux2-Klein-9B los pesos no son utilizables.
- La incorporacion a workflows de terceros puede quedar sujeta tambien a la licencia del modelo base, que no se detalla.
- Riesgo de sobreajuste al estilo y al dominio de retrato: es previsible una degradacion en prompts de paisaje, producto sin figura humana u otros dominios, aunque no hay evidencia publicada al respecto.
- Requiere incluir la palabra de activacion zshx para que el efecto se manifieste; su omision puede producir resultados indistinguibles del modelo base.
- No hay informacion sobre resolucion nativa de entrenamiento, tipos de prompt soportados ni compatibilidad con control nets o inpainting.
- Las fechas de creacion y actualizacion registradas (2026-09-24) son posteriores a la fecha de consulta, un dato anomalo que conviene verificar antes de integrar el artefacto en un pipeline de produccion.
- Los enlaces de descarga incluidos en la model card apuntan a servicios de almacenamiento en la nube de terceros (Quark, Baidu) sin verificacion de integridad ni hash.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-kook-flux-klein-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2019680700361875457
- Pagina del autor (@KOOK): https://www.runninghub.cn/user-center/1932028484909178882
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: README_cn.md (referenciado en el repositorio)
- Resultados de busqueda web: no se encontraron fuentes relevantes sobre este modelo; los resultados disponibles correspondian a servicios de registro de dominios y no guardan relacion con la ficha.
