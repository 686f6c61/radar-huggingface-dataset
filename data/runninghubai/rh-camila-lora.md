# RunningHubAI/rh-camila-lora

## Resumen

rh-camila-lora es un adaptador LoRA de edición de imagen (pipeline `image-text-to-image`) publicado en HuggingFace por RunningHubAI en nombre del autor Hercules Op. No es un modelo generativo completo: se trata de un ajuste fino de bajo rango que se monta sobre un modelo de difusión base que la model card identifica como "krea2", del cual no se aportan más detalles tecnicos. El repositorio contiene un unico archivo de pesos, `camila_lora_000003750.safetensors`, de 218 MiB.

Su funcion es fijar la identidad visual de un personaje concreto ("camila", descrito en la model card como "morena, alta") mediante la palabra de activacion `camila`, de modo que el modelo base reproduzca ese personaje de forma consistente en distintas generaciones y ediciones. Esto lo hace util en flujos de trabajo donde se necesita coherencia de personaje entre multiples imagenes: ilustracion seriada, storyboards, campañas graficas o assets de videojuego.

El modelo esta etiquetado para ComfyUI y para la plataforma RunningHub, lo que indica que su uso previsto es la inferencia local en ComfyUI o la ejecucion en la nube mediante la API de RunningHub. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes, no publica licencia explicita, no documenta dataset de entrenamiento ni resultados de benchmarks, por lo que su evaluacion practica exige pruebas directas sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion base denominado "krea2" en la model card |
| Parametros totales | no disponible (el archivo de pesos ocupa 218 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; en un adaptador de difusion la ventana efectiva la fija el modelo base y la longitud del prompt de texto |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que los derechos pertenecen al autor y remite a la licencia del proyecto original |
| Formato de pesos | safetensors (`camila_lora_000003750.safetensors`, 218 MiB) |

Datos adicionales del repositorio: ID `RunningHubAI/rh-camila-lora`, etiquetas `comfyui`, `lora`, `image-text-to-image`, region `us`, tamano del repositorio 0.2 GB, creado el 2026-10-05 y actualizado el mismo dia. Palabra de activacion: `camila`.

## Arquitectura y entrenamiento

La informacion disponible describe un unico componente: un adaptador LoRA de rango bajo pensado para edicion de imagen ("Model Type: LoRA (image edit)"), ajustado a partir de un modelo base al que la model card llama "krea2". No se especifica si ese base es un transformer de difusion (DiT), un U-Net o un modelo hibrido, ni se detalla el rango del adaptador, el modulo objetivo (atención, proyecciones, etc.) ni la precision de entrenamiento. El nombre del archivo, `camila_lora_000003750`, sugiere un checkpoint correspondiente al paso 3750 de entrenamiento, pero se trata de una inferencia a partir del nombre y no de un dato confirmado por el autor.

Tampoco hay informacion sobre el dataset de entrenamiento: numero de imagenes, resoluciones, composicion, metodo de captioning ni si se aplicaron tecnicas de regularizacion como prior preservation. No se menciona ningun proceso de alineacion tipo RLHF o DPO, algo por otra parte poco habitual en adaptadores de personaje para difusion. La unica innovacion tecnica documentada es el propio mecanismo de LoRA y la integracion con ComfyUI y RunningHub como plataformas de carga y ejecucion.

## Capacidades

- Generacion de imagenes de un personaje concreto mediante la palabra de activacion `camila`, cuando el adaptador se monta sobre el modelo base krea2.
- Edicion de imagen guiada por texto (`image-text-to-image`), es decir, transformacion de una imagen de entrada manteniendo la identidad del personaje.
- Mantenimiento de consistencia de identidad entre multiples generaciones y prompts, que es la funcion principal de un LoRA de personaje.
- Integracion en flujos de ComfyUI mediante nodos de carga de LoRA, encadenables con otros LoRA, ControlNet u otros condicionamientos del modelo base.
- Ejecucion en la nube a traves de la plataforma y la API de RunningHub.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje ni un agente.
- No dispone de capacidades de generacion de codigo, matematicas, audio, video ni vision analitica documentadas.
- Capacidades multilingues: no documentadas; el prompt de texto depende del codificador de texto del modelo base, no del adaptador.

## Casos de uso

- Ilustracion seriada y comics: generar la misma protagonista en decenas de viñetas manteniendo rasgos faciales, tono de piel y complexion, apoyandose en el prompt `camila` y en los condicionamientos del modelo base para fijar postura y encuadre.
- Storyboard y preproduccion audiovisual: producir planos de referencia con una actriz virtual consistente para presentar secuencias a un cliente antes de rodar.
- Edicion de fotografia de personaje: partir de una imagen existente y cambiar entorno, vestuario o iluminacion sin alterar la identidad, usando el pipeline `image-text-to-image`.
- Marketing y creatividades: generar variantes de una misma imagen promocional (formatos, fondos, paletas) con la misma figura, para pruebas A/B de anuncios.
- Assets para videojuego o aplicacion: crear retratos, avatares y expresiones de un personaje secundario a partir de un unico LoRA, reduciendo coste de ilustracion.
- Automatizacion por lotes: encadenar el LoRA en un workflow de ComfyUI o en llamadas a la API de RunningHub para producir cientos de imagenes con el mismo personaje a partir de una lista de prompts.
- Composicion con otros adaptadores: combinarlo con LoRA de estilo o de escenario para variar la estetica sin perder la identidad del personaje.
- Prototipado rapido de personajes: usar el adaptador como prueba de concepto antes de decidir un ajuste fino completo o un entrenamiento con mas datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas cuantitativas (FID, CLIP score, similitud de identidad facial), ni comparaciones con otros LoRA de personaje, ni ejemplos de imagen de referencia mas alla de la descripcion textual "camila, morena, alta". Tampoco la busqueda web realizada devolvio informacion tecnica sobre este modelo.

## Requisitos de hardware

- El adaptador en si es ligero: 218 MiB de pesos, aproximadamente 0,2-0,5 GB de VRAM adicionales al cargar el modelo base en memoria.
- El coste real de inferencia lo determina el modelo base "krea2", cuyos requisitos no estan documentados en la informacion disponible.
- VRAM estimada: no disponible. Para adaptadores LoRA sobre transformers de difusion de gran tamano, el rango habitual sin cuantizar suele situarse entre 16 y 24 GB, pero esta cifra es una referencia generica y no un dato publicado para este modelo.
- GPU recomendadas: no disponible. Depende enteramente del modelo base; las GPU de datacenter (A100, H100) y las consumer de gama alta (RTX 4090, 4080) son los escenarios tipicos, pero no hay confirmacion para este caso.
- Cabe en GPU de consumo: no confirmado; condicionado por el modelo base y por si se aplican cuantizacion u offloading de CPU.
- Opciones de despliegue: ComfyUI (plataforma indicada en las etiquetas y en la model card), plataforma en la nube y API de RunningHub. No se documentan vLLM ni llama.cpp, que no aplican a un adaptador de difusion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos comparables concretos (otros LoRA de personaje publicados con especificaciones verificables). La comparacion siguiente es conceptual, entre la aproximacion que representa este repositorio y las alternativas habituales de la misma categoria; los valores marcados como no disponibles lo estan por falta de datos publicados.

| Criterio | rh-camila-lora (LoRA de personaje) | Ajuste fino completo de personaje | Textual inversion / embeddings | Adaptadores de identidad tipo IP-Adapter |
|---|---|---|---|---|
| Parametros | no disponible (archivo de 218 MiB) | Tipicamente los del modelo completo | Unos pocos embeddings | No disponible |
| Contexto / resolucion | La fija el modelo base | La fija el modelo base | La fija el modelo base | La fija el modelo base |
| Consistencia de identidad | Alta si el LoRA esta bien entrenado | Alta | Media, suele capturar estilo mas que identidad | Alta, referenciada por imagen |
| Coste de entrenamiento | Bajo | Alto | Muy bajo | No aplica (sin entrenamiento) |
| Distribucion del archivo | 218 MiB, safetensors | Varios GB | Unos pocos KB | Decenas o cientos de MB |
| Licencia | no disponible | no disponible | Depende del base | Depende del base |
| Disponibilidad | HuggingFace y RunningHub | Variable | Variable | Amplia |

## Limitaciones y advertencias

- Licencia no especificada: la model card solo indica que los derechos pertenecen al autor y que debe seguirse la licencia del proyecto original o upstream. No hay autorizacion explicita de uso comercial, por lo que en produccion hay que verificar la licencia del base "krea2" antes de desplegar.
- Dependencia total del modelo base: sin "krea2" cargado, el archivo safetensors no genera nada. Cualquier limitacion del base (resolucion, sesgos, adherencia al prompt) se hereda.
- Sin datos de entrenamiento publicados: se desconoce el numero de imagenes, su procedencia y si hubo consentimiento o licencia sobre las imagenes de la persona representada, lo que es un riesgo legal si el personaje se parece a una persona real.
- Riesgo de sobreajuste y de "copia" de poses o fondos del dataset de entrenamiento, un problema habitual en LoRA de personaje.
- Artefactos y alucinaciones visuales: manos, orejas, joyas y texto en la imagen son los fallos tipicos de los modelos de difusion, y el adaptador no los corrige.
- Requiere la palabra de activacion `camila`: sin ella el adaptador puede no activarse o degradar la calidad general de la generacion.
- Sesgos: la descripcion "morena, alta" asocia el personaje a un fenotipo concreto; el adaptador reproducira ese fenotipo y puede mostrar poca diversidad si no se controla el prompt.
- Sin filtros de seguridad ni moderacion documentados: no se indica ninguna salvaguarda frente a usos como deepfakes o contenido no consentido.
- Validacion practica nula: 0 descargas y 0 likes en el momento de la consulta, sin ejemplos publicados ni retroalimentacion de terceros.
- Metadatos escasos: no hay informacion de versionado, fecha de entrenamiento, resolucion de entrenamiento ni compatibilidad declarada con versiones concretas del modelo base.
- La busqueda web realizada no arrojo ninguna fuente independiente sobre este modelo; toda la informacion tecnica proviene del propio repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RunningHubAI/rh-camila-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2106727545043845122
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2055059850194632705
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ejemplo de API de video (Seedance 2.5) citado en la model card: https://www.runninghub.ai/call-api/api-detail/2133100000000700025

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio de HuggingFace.
