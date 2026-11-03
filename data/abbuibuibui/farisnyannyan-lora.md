# abbuibuibui/FarisNyannyan-Lora

## Resumen

FarisNyannyan-Lora es un LoRA de personaje para modelos de difusion SDXL, entrenado especificamente sobre el checkpoint waiIllustriousSDXL v17. Desarrollado por el usuario abbuibuibui, reproduce a Faris Nyannyan (Akiha Rumiho), personaje de la visual novel y anime *Steins;Gate*. El modelo resuelve un problema acotado: generar representaciones consistentes del personaje con sus atuendos canonicos dentro del ecosistema Illustrious, sin necesidad de reentrenar un checkpoint completo.

Tecnicamente es un adaptador de bajo rango (rank 64, alpha 32) sobre una base SDXL, con siete epocas publicadas como ficheros safetensors independientes de 456.496.468 bytes cada uno. El autor recomienda la epoca E6 a fuerza 0.8 tras una evaluacion comparativa propia entre E5, E6 y E7 en diez escenas y cuatro intensidades. El repositorio ocupa 3,2 GB e incluye el dataset de entrenamiento (88 pares de imagenes, 6 atuendos) y material de evaluacion.

Su relevancia es practica para la comunidad de generacion de imagenes anime: los LoRA de personaje son el mecanismo estandar para fijar identidad visual en pipelines de ComfyUI o Automatic1111, y este paquete documenta de forma inusualmente explicita el proceso de seleccion de epoca y los tokens de activacion. No es un modelo de lenguaje ni un modelo fundacional: es un adaptador de estilizacion/identidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre difusion latente SDXL (base waiIllustriousSDXL v17) |
| Parametros totales | no disponible (adaptador de bajo rango; rank 64, alpha 32) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no disponible (pesos en safetensors, precision de entrenamiento bf16) |
| Idiomas soportados | en, zh (prompts e interfaz) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se inyecta en las capas de atencion y proyeccion de un UNet SDXL. Se entreno con rango 64 y alpha 32, optimizador AdamW en bf16, buckets con limite de 1536 y 7 epocas. El dataset consta de 88 pares imagen-texto con 6 atuendos distintos y un factor de repeticion de 3. Las captions se generaron con `keep_tokens = 2`, lo que explica que el color de pelo y ojos se omita con frecuencia en los textos de entrenamiento y deba anadirse explicitamente en inferencia.

Cada epoca se publica como un fichero separado (`faris_nyannyan-000001` a `000006` y `faris_nyannyan.safetensors` como E7), todos del mismo tamano. El autor documento una evaluacion en dos rondas: una criba inicial de E1-E7 a fuerza 0.8 y una matriz posterior de E5, E6 y E7 por 10 escenas y 4 intensidades (0.4, 0.6, 0.8, 1.0). La conclusion es que E6 ofrece la silueta mas estable del personaje (coletas taladro lavanda, iris concentricos morados, capucha rosa con orejas de gato) y que E7 es practicamente equivalente como alternativa final. No hay innovaciones arquitectonicas: es un LoRA de personaje convencional con documentacion de seleccion de checkpoint poco habitual.

## Capacidades

- Generacion de imagenes de personaje con identidad consistente mediante el token `faris_nyannyan`.
- Control de atuendo mediante tokens especificos: `faris_nyannyan_pink_cat_hood` (atuendo principal), `faris_nyannyan_maid_uniform` (uniforme de maid cafe), `faris_nyannyan_future_soldier_uniform`, `faris_nyannyan_green_dress`, `faris_nyannyan_orange_ruffle_dress` y `faris_nyannyan_pink_white_dress`.
- Composicion de escena completa: retrato frontal, tres cuartos, perfil, cuerpo entero, plano sentado, fondos simples y fondos nocturnos complejos.
- Estilizacion anime compatible con el ecosistema Illustrious/SDXL (prompts con `masterpiece, best quality, very aesthetic, absurdres, anime screencap`).
- Soporte de prompts en ingles y chino.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio: es un modelo de sintesis de imagen.

## Casos de uso

- Ilustracion de fan art de *Steins;Gate*: el LoRA fija la identidad del personaje con un solo token, lo que permite iterar composiciones sin perder el parecido entre generaciones.
- Creacion de fichas de personaje para proyectos derivados: combinando los seis tokens de atuendo se pueden producir hojas de referencia coherentes del mismo personaje en distintos vestuarios.
- Prototipado rapido en ComfyUI: con Euler a, 28 pasos, CFG 4.5, CLIP skip 2 y 832x1216 se obtienen resultados usables sin hires fix ni ADetailer, ideal para bocetos de baja latencia.
- Generacion de material para doujinshi o novelas visuales amateur: el adaptador se puede encadenar con otros LoRA de estilo o composicion en el mismo grafo de nodos.
- Pruebas de investigacion sobre control de identidad en difusion: el paquete incluye evaluacion comparativa entre epocas e intensidades, util como referencia metodologica para estudiar el efecto de la fuerza del LoRA.
- Integracion en pipelines automaticos de generacion por lotes: al ser un fichero safetensors de ~456 MB por epoca, se puede cargar y descargar en memoria de GPU de forma rapida entre trabajos.
- Docencia sobre entrenamiento de LoRA: el repositorio publica dataset, configuracion (rank, alpha, optimizador, buckets, repeticiones) y criterios de seleccion, lo que lo convierte en un ejemplo didactico completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, similitud de identidad) en la informacion disponible. El autor aporta unicamente una evaluacion cualitativa:

| Ronda | Candidatos | Condiciones | Conclusion |
|---|---|---|---|
| Round 1 | E1-E7 | Fuerza 0.8 | Criba inicial; E5-E7 pasan a la matriz |
| Round 3 | E5, E6, E7 | 10 escenas x 4 fuerzas (0.4/0.6/0.8/1.0) | E6 recomendado a 0.8; E7 alternativa final; E5 alternativo |

## Requisitos de hardware

- VRAM estimada: al ser un adaptador sobre SDXL, el consumo lo determina el checkpoint base. En fp16, SDXL completo requiere aproximadamente 8-10 GB de VRAM para inferencia a 832x1216; el LoRA anade un sobrecoste marginal (menos de 1 GB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100 para lotes grandes. Cualquier GPU con 8 GB o mas puede ejecutar el modelo base con optimizaciones.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB en adelante; en GPUs de 6-8 GB puede requerir `--medvram` o `--lowvram` en Automatic1111 o el uso de modelos en fp16/bf16.
- Opciones de despliegue: ComfyUI (configuracion documentada por el autor), Automatic1111/Forge, Diffusers (libreria declarada en el repo), InvokeAI.
- Latencia y throughput: no disponibles. La configuracion de referencia (Euler a, 28 pasos, CFG 4.5, 832x1216) es moderada; en una RTX 4090 se situa en el orden de pocos segundos por imagen, pero no hay medicion publicada.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FarisNyannyan-Lora (este) | LoRA de personaje | waiIllustriousSDXL v17 | rank 64 / alpha 32 | no aplica | creativeml-openrail-m | HuggingFace, ModelScope |
| LoRA de personaje SDXL generico | LoRA de personaje | SDXL 1.0 | variable | no aplica | variable (a menudo CreativeML) | Civitai, HuggingFace |
| LoRA de personaje Illustrious de terceros | LoRA de personaje | Illustrious-XL | variable | no aplica | variable | Civitai, HuggingFace |
| Checkpoint Illustrious-XL completo | Modelo base | SDXL | no disponible | no aplica | variable | HuggingFace |

No se dispone de datos cuantitativos de rendimiento para establecer una comparacion numerica con alternativas concretas. La comparacion relevante es de ecosistema: este LoRA solo es funcional sobre waiIllustriousSDXL v17 o bases compatibles con Illustrious, y su calidad esta ligada a la de ese checkpoint.

## Limitaciones y advertencias

- La capucha con orejas de gato y la diadema de orejas negras pueden desaparecer en algunas escenas; el autor recomienda reforzar con el token de atuendo explicito y anadir `cat ears` en el prompt.
- Las captions se entrenaron con `keep_tokens = 2` y a menudo omiten color de pelo y ojos; es necesario anadirlos manualmente (`purple hair, purple eyes`) para evitar derivas cromaticas.
- La identidad de referencia del paquete son coletas taladro moradas, no la representacion mas comun de pelo rosa; esto puede generar discrepancias con expectativas de otros fans.
- Riesgo de sobreajuste a la base: fuera de waiIllustriousSDXL v17 el comportamiento no esta garantizado.
- Es una obra derivada no oficial; los derechos del personaje pertenecen a sus titulares (5pb./Nitroplus/MAGES). La licencia creativeml-openrail-m impone restricciones de uso comercial y obligaciones de atribucion que deben revisarse antes de cualquier despliegue productivo.
- No hay datos de sesgo ni evaluaciones de seguridad publicadas; como todo modelo de difusion anime, puede reproducir estereotipos visuales del dataset de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- El campo `pipeline` no esta disponible en los metadatos de HuggingFace, lo que puede complicar la carga automatica con Diffusers sin especificar la clase manualmente.

## Enlaces

- HuggingFace: https://huggingface.co/abbuibuibui/FarisNyannyan-Lora
- Dataset: https://huggingface.co/datasets/abbuibuibui/FarisNyannyan-Dataset
- ModelScope: https://www.modelscope.cn/models/abbuibuibui/FarisNyannyan-Lora
- Notas de evaluacion (chino): `evaluation/横向测评记录.md` dentro del repositorio
- README en chino: `README_zh.md` dentro del repositorio
