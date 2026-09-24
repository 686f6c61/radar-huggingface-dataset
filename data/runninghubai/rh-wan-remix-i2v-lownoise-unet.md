# RunningHubAI/rh-wan-remix-i2v-lownoise-unet

## Resumen

rh-wan-remix-i2v-lownoise-unet es un fichero de pesos UNet para generación de vídeo a partir de imagen (image-to-video, i2v), publicado por RunningHubAI en Hugging Face. Se trata de un ajuste fino derivado de WAN2.2, orientado a la generación de clips cinematográficos cortos con énfasis en dinámica humana, movimiento realista y consistencia de escena, según indica el propio autor en la model card. El repositorio contiene un único fichero safetensors de 13629 MiB (aproximadamente 13,3 GiB), lo que lo sitúa en el rango de pesos compatibles con GPU de gama alta para consumidor.

El sufijo "lownoise" del nombre indica que estos pesos corresponden al experto de bajo ruido del esquema de muestreo, es decir, a la etapa final del proceso de eliminación de ruido, y el segmento "i2v_14b" del nombre del fichero apunta a un modelo de aproximadamente 14 mil millones de parámetros en su variante imagen-a-vídeo. El autor declara que el modelo se ha entrenado combinando datos de LoRA de movimiento de código abierto con entrenamiento de pose afinado para mejorar el realismo, la precisión anatómica y la diversidad de gestos, y que ya está integrado con lightx2v, por lo que no requiere LoRA adicional.

Su relevancia es práctica más que investigadora: es una pieza de un flujo de trabajo de ComfyUI, distribuida con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin documentación técnica sobre datos de entrenamiento, arquitectura interna o evaluación. La model card recomienda el encoder de texto "NSFW Wan UMT5 XXL" y el nombre del fichero incluye la etiqueta NSFW, lo que indica que el ajuste está orientado explícitamente a contenido para adultos y condiciona tanto su uso responsable como su encaje legal en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion para video, segun la model card del autor; sin detalle de la arquitectura interna. Deriva de WAN2.2 |
| Parametros totales | no disponible (el nombre del fichero indica "14b": `Wan2.2_Remix_NSFW_i2v_14b_low_lighting_v2.0.safetensors`) |
| Parametros activos | no disponible (no se declara que sea un modelo MoE) |
| Longitud de contexto | no disponible (no es un parametro de contexto de texto; el modelo opera sobre condicionamiento de prompt e imagen de entrada) |
| Tipos de cuantizacion | no disponible. Se distribuye un unico fichero de pesos de 13629 MiB (~13,3 GiB), tamano coherente con pesos de precision reducida respecto a un modelo de 14B en bf16 |
| Idiomas soportados | no disponible. La model card recomienda como encoder de texto "NSFW Wan UMT5 XXL" |
| Licencia | no disponible. La model card indica que se publica en nombre del autor, que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o de la fuente upstream |
| Formato de pesos | safetensors (`Wan2.2_Remix_NSFW_i2v_14b_low_lighting_v2.0.safetensors`), 13629 MiB |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un UNet de generacion de video (pipeline declarado: text-to-video, aunque el nombre del fichero y la descripcion lo situan en el flujo imagen-a-video). No se especifica el numero de bloques, la dimension de los embeddings temporales, el tipo de atencion ni el esquema de compresion latente. Lo unico verificable es que se trata de un ajuste fino sobre WAN2.2 y que el fichero corresponde a una unica pieza de pesos, etiquetada como "lownoise" y "low_lighting" en su version 2.0.

En cuanto al entrenamiento, el autor declara una combinacion de datos de LoRA de movimiento de codigo abierto y entrenamiento de pose afinado, con el objetivo declarado de mejorar el realismo, la precision anatomica y la diversidad de gestos. No se indica el numero de tokens o de fotogramas de entrenamiento, la composicion del dataset, la resolucion ni la duracion de los clips, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documenta si hubo destilacion, decodificacion especulativa ni optimizaciones de atencion lineal. La unica innovacion funcional declarada es la integracion con lightx2v, que permite usar el modelo sin configurar LoRA adicionales.

## Capacidades

- Generacion de video a partir de imagen y prompt de texto (i2v): produce clips cortos con movimiento humano realista y transiciones suaves, segun la descripcion del autor.
- Enfasis en dinamica humana: el entrenamiento con datos de movimiento y pose esta orientado a mejorar la precision anatomica y la diversidad de gestos.
- Consistencia de escena: el autor destaca la coherencia visual entre fotogramas y el movimiento realista sin necesidad de LoRA.
- Muestreo en dos etapas: al tratarse del experto de bajo ruido, esta pensado para actuar en la fase final del proceso de eliminacion de ruido, presumiblemente en combinacion con un experto de alto ruido del mismo linaje.
- Integracion con lightx2v: funciona sin configuracion adicional de LoRA segun la model card.
- Carga en ComfyUI y en RunningHub: el modelo esta etiquetado con `comfyui` y `unet` y se distribuye para su uso en esos entornos.
- Generacion de contenido para adultos: el nombre del fichero incluye la etiqueta NSFW y la model card recomienda un encoder de texto tambien etiquetado NSFW, lo que indica un ajuste orientado a este dominio.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, matematicas, codigo, vision, audio y modo de pensamiento: no disponible. Es un modelo de generacion de video, no un modelo de lenguaje con estas capacidades.
- Capacidades multilingues: no disponible. No se documenta el comportamiento del encoder de texto con distintos idiomas.

## Casos de uso

- Previsualizacion de planos en produccion audiovisual: el modelo permite convertir un fotograma fijo en un plano con movimiento humano realista, util para validar encuadres y ritmo antes de rodar. Requiere encadenar el experto de bajo ruido con el resto del muestreo.
- Animacion de fotografias para redes sociales: a partir de una imagen de una persona se puede generar un clip corto con gestos y dinamica corporal, apoyandose en el entrenamiento de pose declarado por el autor.
- Prototipado de storyboards animados: generar versiones en movimiento de viñetas para presentar una secuencia a un cliente sin recurrir a animacion tradicional.
- Efectos visuales y transiciones para montaje: el modelo esta descrito como generador de clips cinematograficos con transiciones suaves, aprovechable para insertos y transiciones en edicion.
- Creacion de contenido para adultos con verificacion de edad: es el dominio declarado por la etiqueta NSFW del fichero; cualquier despliegue exige control de acceso, verificacion de edad y cumplimiento normativo, y la licencia no esta declarada, por lo que el uso comercial queda en riesgo legal.
- Pruebas de flujos de trabajo en ComfyUI: al estar etiquetado como `comfyui` y `unet`, sirve para validar nodos y pipelines i2v en local antes de escalar a produccion.
- Escalado de imagen a video en pipelines de automatizacion: integrable como paso de un grafo mayor gestionado por la API de RunningHub o por una instancia propia de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, solo los pesos ocupan 13,3 GiB, por lo que se necesitan al menos 16 GB de VRAM para cargar el UNet sin margen para activaciones; en la practica, un pipeline i2v completo (UNet mas encoder de texto UMT5 y VAE de video) requiere del orden de 24 GB o mas, o bien el uso de offload a memoria del sistema.
- GPU recomendadas: no especificadas por el autor. Para un modelo de esta clase suelen emplearse RTX 4090 (24 GB), RTX 5090, A100 (40/80 GB), H100 (80 GB) o L40S. Los datos concretos de compatibilidad no estan declarados.
- Viabilidad en GPU de consumidor: probablemente viable en GPUs con 24 GB de VRAM (RTX 3090, 4090) si se emplea offload parcial o cuantizacion adicional; en GPUs con 8-16 GB requerira tecnicas de gestion de memoria no documentadas por el autor.
- Opciones de despliegue: ComfyUI es el entorno declarado. RunningHub (plataforma del autor) y Hugging Face como alojamiento de pesos. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo, ya que son motores para modelos de lenguaje.
- Latencia y throughput: no disponible. No se publican tiempos de generacion por clip, numero de pasos de muestreo recomendado ni resolucion o duracion objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-wan-remix-i2v-lownoise-unet | no disponible (el nombre indica 14b) | no disponible | no disponible | no disponible | Hugging Face (RunningHubAI), 0 descargas |
| WAN2.2 (modelo base del que deriva) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada; la model card remite a la licencia upstream | Publico, referenciado como origen del ajuste fino |
| Otras variantes comunitarias de i2v basadas en WAN2.2 | no disponible | no disponible | no disponible | variable, no disponible | no disponible |

No se dispone de datos verificables de otros modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: la model card solo indica que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o upstream. Sin una licencia explicita, el uso comercial queda en una situacion de riesgo legal que debe resolverse antes de cualquier despliegue en produccion.
- Contenido para adultos: el nombre del fichero incluye la etiqueta NSFW y el encoder de texto recomendado tambien esta etiquetado como NSFW. Su uso implica verificacion de edad, control de acceso y cumplimiento de la normativa aplicable en la jurisdiccion de despliegue.
- Ausencia total de evaluacion: no hay benchmarks, ni comparaciones, ni metricas de calidad de video (FVD, CLIP-score, consistencia temporal). No hay evidencia publica de su rendimiento relativo frente al modelo base.
- Documentacion de entrenamiento inexistente: no se declara el dataset, su procedencia, si hubo filtrado de contenido, ni si los datos de pose y movimiento cuentan con consentimiento o licencias compatibles. Esto afecta tanto a la reproducibilidad como al riesgo legal.
- Sesgos probables: al estar entrenado con datos de movimiento y pose no documentados, puede reproducir sesgos de representacion corporal, etnia, edad o genero, y mostrar peor rendimiento con tipos corporales o vestimenta poco representados.
- Riesgo de artefactos: en modelos i2v de este tamano son habituales las deformaciones anatomicas en manos y rostro, la deriva de identidad a lo largo del clip y las inconsistencias de iluminacion, especialmente cuando la imagen de entrada es de baja calidad.
- Dependencia de piezas complementarias: al ser el experto de bajo ruido, el resultado final depende del experto de alto ruido, del encoder de texto y del VAE utilizados. Un emparejamiento incorrecto degrada la calidad de forma notable.
- Restricciones de contexto e idioma: no se documenta el comportamiento con prompts largos ni con idiomas distintos del ingles o el chino. No hay garantia de fidelidad al prompt en escenas complejas con multiples sujetos.
- Repositorio practicamente sin uso: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y de informes de fallos.
- Huella de despliegue: 13,3 GiB de pesos solo para el UNet, a los que se suman encoder de texto y VAE, lo que encarece el alojamiento y limita el despliegue en infraestructura modesta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-wan-remix-i2v-lownoise-unet
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1986202805797081089
- Pagina del autor: https://www.runninghub.cn/user-center/1892780921614139394
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API: https://www.runninghub.ai/call-api
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ejemplo de API con Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
