# RunningHubAI/rh-v2-unet

## Resumen

rh-v2-unet es un modelo de difusión de tipo UNet para generación de imágenes a partir de texto (text-to-image), publicado por la cuenta RunningHubAI en Hugging Face y atribuido al autor identificado en la model card como RunningHub-@HanSolo. Según la documentación del propio repositorio, se trata de un ajuste fino (finetune) derivado de Z-image-turbo, orientado a un estilo concreto que la model card describe en chino como «fotografía realista» (真实感摄影). El repositorio contiene únicamente los pesos del UNet, sin text encoder ni VAE asociados.

El modelo se distribuye como un único fichero `safetensors` de 11 740 MiB (unos 11,5 GiB; el repositorio completo ocupa 12,3 GB), lo que indica que el módulo de difusión es el componente pesado del pipeline. La model card está pensada para su uso en ComfyUI y en la propia plataforma RunningHub, e incluye enlaces a una API alojada para ejecutarlo sin infraestructura propia.

Su relevancia práctica es acotada: no es un modelo fundacional nuevo ni publica arquitectura, datos de entrenamiento o evaluación, sino un checkpoint de estilo pensado para integrarse en flujos de trabajo existentes de generación de imagen. La información publicada es muy escasa (0 descargas y 0 likes en el momento de la consulta, licencia no especificada de forma explícita), por lo que cualquier evaluación debe hacerse probando el modelo en ComfyUI o vía API.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNet de difusión para text-to-image (no se detalla la variante concreta) |
| Parámetros totales | no disponible (el fichero de pesos ocupa 11 740 MiB; el número de parámetros no se declara) |
| Parámetros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de imagen, no de texto) |
| Tipos de cuantización | no disponible (solo se publican pesos `safetensors`; no se indica si son fp16, bf16 o fp32) |
| Idiomas soportados | no disponible (el prompt de texto lo procesa el text encoder del pipeline, que no se incluye ni se especifica) |
| Licencia | no disponible: la model card indica «Published by RunningHub on behalf of the author. Copyright remains with the author. Follow the original project or upstream license» |
| Formato de pesos | safetensors (`Solo-真实感摄影_v2a.safetensors`) |
| Tamaño del fichero | 11 740 MiB |
| Tamaño del repositorio | 12,3 GB |
| Modelo base | Z-image-turbo (finetune) |
| Pipeline declarado | text-to-image |
| Plataformas indicadas | ComfyUI, RunningHub, Hugging Face |

## Arquitectura y entrenamiento

La información publicada no describe la arquitectura interna: la model card solo indica que es un UNet de difusión para text-to-image y que deriva de un ajuste fino sobre Z-image-turbo. No se detalla el número de bloques, la dimensionalidad de las activaciones, el tipo de condicionamiento (cross-attention, adaLN u otros), ni si se emplea algún esquema de destilación por pasos reducidos. El único dato objetivo sobre el tamaño es el del fichero de pesos: 11 740 MiB. Si esos pesos estuviesen almacenados en fp16/bf16, equivaldrían aproximadamente a 5,9 mil millones de parámetros; si estuviesen en fp32, a unos 2,9 mil millones. La model card no especifica el formato numérico, por lo que esa cifra es solo una estimación aritmética y no un dato declarado por el autor.

Tampoco se documentan los datos de entrenamiento: no hay número de imágenes, resolución nativa de entrenamiento, composición del dataset, ni si hubo etapas de ajuste por preferencias humanas o destilación. No se menciona el text encoder ni el VAE que deben acompañar al UNet, algo imprescindible para reconstruir el pipeline completo; en ComfyUI sería necesario obtenerlos del proyecto base (Z-image-turbo) o de la plataforma RunningHub. El nombre del fichero sugiere un ajuste de estilo orientado a fotografía realista, pero no hay ninguna ficha técnica de ese entrenamiento (learning rate, pasos, LoRA fusionada o entrenamiento completo).

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline declarado como text-to-image).
- Especialización declarada en fotografía realista: la model card describe el modelo con la etiqueta «真实感摄影» (fotografía realista), lo que apunta a un ajuste de estilo orientado a resultados fotorrealistas.
- Integración en ComfyUI como nodo UNet dentro de un grafo de generación.
- Ejecución en la plataforma RunningHub y a través de su API alojada.
- Edición o variación de imagen: no disponible; no se confirma soporte de img2img, inpainting, controlnet ni referencias de personaje.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponible; el comportamiento multilingüe dependería del text encoder, que no se especifica.
- Modo «thinking», visión o audio: no disponible / no aplica.
- Resolución de salida soportada: no disponible, no se declara en la model card.

## Casos de uso

- Generación de fotografía realista de producto: el modelo está ajustado explícitamente hacia resultados fotorrealistas, por lo que puede emplearse para crear imágenes de catálogo o packaging a partir de descripciones textuales, reduciendo sesiones de fotografía para variantes de color o composición.
- Retrato sintético para materiales de marca: en flujos de ComfyUI se puede encadenar el UNet con un VAE y un text encoder del proyecto base para producir retratos consistentes con un estilo fotográfico concreto, útiles en campañas o mockups.
- Poblado de escenas para ilustración editorial: la etiqueta de realismo sugiere un uso adecuado para imágenes de acompañamiento en artículos, con control del prompt para ajustar iluminación y encuadre.
- Integración en pipelines automatizados vía API de RunningHub: la model card enlaza a la API de la plataforma, de modo que el modelo se puede invocar como servicio desde un backend sin necesidad de desplegar GPUs propias, por ejemplo para generar imágenes bajo demanda en una aplicación web.
- Prototipado rápido de estilos en ComfyUI: al ser un único fichero `safetensors` de UNet, se puede intercambiar con otros checkpoints en un mismo grafo para comparar estilos sin rehacer el pipeline.
- Generación de material de referencia para previsualización de conceptos: equipos de diseño pueden producir referencias fotorrealistas antes de pasar a producción 3D o fotografía real, usando el modelo como herramienta de exploración rápida.
- Aumento de datasets sintéticos: si el ajuste es suficientemente consistente, las imágenes generadas pueden servir para aumentar conjuntos de datos de visión por computador, siempre que se revise la licencia y se documente el origen sintético de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de rh-v2-unet no incluye FID, CLIP score, evaluaciones de preferencia humana ni comparaciones cuantitativas con otros modelos, y el repositorio no contiene scripts de evaluación ni imágenes de muestra con métricas asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un fichero de pesos de 11,5 GiB en precisión de 16 bits requiere al menos esa cantidad de VRAM solo para los pesos, más el text encoder, el VAE y las activaciones intermedias. En la práctica, esto apunta a GPUs de 16 GB o más para trabajar en fp16/bf16 sin cuantizar; son estimaciones, no datos publicados.
- Cuantización: la model card no publica versiones fp8, GGUF o similares. Cualquier reducción de precisión tendría que generarse por el usuario (por ejemplo, con herramientas de cuantización para ComfyUI), con el consiguiente riesgo de degradación de calidad no evaluada.
- GPU recomendadas: no disponible. Por tamaño de pesos, encajan tarjetas de gama alta de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB) y GPUs profesionales tipo A100 40/80 GB o H100 cuando se busca throughput alto o varias generaciones concurrentes.
- ¿Cabe en GPU de consumo? Previsiblemente sí en GPUs con 16-24 GB de VRAM si se dispone del resto del pipeline en memoria, pero no hay confirmación oficial ni requisitos mínimos publicados.
- Opciones de despliegue: ComfyUI (uso previsto según la model card), la plataforma RunningHub y su API. No se menciona soporte explícito para vLLM, TGI, Ollama o llama.cpp, que en cualquier caso no son los runners habituales para este tipo de UNet de difusión.
- Latencia y throughput: no disponible. No se indica número de pasos de muestreo, scheduler recomendado ni tiempos de generación medidos.

## Comparativa con modelos similares

| Modelo | Categoría | Pesos / tamaño | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-v2-unet | UNet de difusión text-to-image (estilo fotografía realista) | 11 740 MiB, `safetensors` | Z-image-turbo (finetune) | no disponible en la información proporcionada | Hugging Face, ComfyUI, RunningHub |
| Z-image-turbo | UNet de difusión text-to-image (modelo base declarado) | no disponible en la información proporcionada | — | no disponible en la información proporcionada | no verificada en esta ficha |
| Otros UNets de difusión de la misma familia de tamaño (por ejemplo, checkpoints de la línea SDXL o FLUX.1) | UNet de difusión text-to-image | no disponible en la información proporcionada | — | no disponible en la información proporcionada | no verificada en esta ficha |

No hay datos cuantitativos publicados que permitan comparar rendimiento, calidad de imagen o coste de inferencia con alternativas. Cualquier comparación con la familia SDXL, SD 3.5 o FLUX.1 debería hacerse probando los modelos sobre el mismo conjunto de prompts y midiendo métricas propias; los datos de esos modelos no forman parte de la información proporcionada y deben consultarse en sus respectivas model cards.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, curvas de pérdida ni muestras con métricas, por lo que no es posible estimar la calidad real del ajuste frente al modelo base.
- Licencia no explicitada: la model card remite a la licencia del proyecto original o del upstream y mantiene el copyright en el autor. No se confirma si el uso comercial está permitido; conviene verificar la licencia de Z-image-turbo y de RunningHub antes de usarlo en producción.
- Dependencias no incluidas: el repositorio solo contiene el UNet. Faltan el text encoder y el VAE, y no se indica cuáles son los compatibles, lo que puede provocar resultados incorrectos si se combinan componentes inadecuados.
- Idiomas no documentados: no se especifica qué idiomas entiende el prompt ni si funciona bien fuera del inglés o el chino, ya que esa capacidad depende del text encoder ausente.
- Riesgo de sesgos y estereotipos: no hay ninguna información sobre la composición del dataset de ajuste. Al tratarse de un modelo de imagen orientado a fotografía realista, es esperable que reproduzca sesgos de representación (edad, etnia, corporalidad, género) presentes en los datos de entrenamiento del modelo base; no se ha publicado ninguna mitigación.
- Riesgo de contenido inapropiado o no deseado: no se documentan filtros de seguridad, y la ausencia de información sobre datos de entrenamiento impide conocer si el modelo puede generar contenido sensible.
- Alucinación visual: como cualquier modelo generativo de imagen, puede producir anatomías incorrectas, texto ilegible dentro de la imagen o detalles físicamente incoherentes que no se corresponden con el prompt.
- Reproducibilidad: no se especifican semilla, scheduler, número de pasos ni escala de guía (CFG), parámetros que afectan de forma decisiva al resultado y dificultan replicar una generación concreta.
- Proyecto sin tracción verificable: 0 descargas y 0 likes en el momento de la consulta, sin issues ni historial de mantenimiento, lo que implica un riesgo de soporte nulo y de discontinuidad.
- Fecha de creación futura en los metadatos (2026): conviene tratar los metadatos del repositorio con cautela y verificar la integridad del fichero antes de integrarlo en un pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-v2-unet
- README en chino del repositorio: https://huggingface.co/RunningHubAI/rh-v2-unet/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2058845885878063106
- Página del autor (@HanSolo): https://www.runninghub.cn/user-center/1894710352129523714
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Página de entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de API de Seedance 2.5 (enlace promocional de la model card): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Modelo base declarado (Z-image-turbo): no se proporciona enlace directo en la información disponible
