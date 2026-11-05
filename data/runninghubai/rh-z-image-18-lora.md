# RunningHubAI/rh-z-image-18-lora

## Resumen

rh-z-image-18-lora es un adaptador LoRA de tipo text-to-image publicado por RunningHubAI (autor identificado como @RedGaga en RunningHub) para su uso sobre el modelo base Z-image-turbo. Se distribuye como un unico fichero de pesos de 20 MiB y esta pensado para cargarse en ComfyUI o en la plataforma RunningHub. El repositorio de Hugging Face no contiene documentacion tecnica adicional mas alla de la model card, que describe el proposito del adaptador como un "slider de edad" con un minimo forzado de 18 anos.

El modelo no es un modelo fundacional, sino un ajuste fino de bajo rango (LoRA) sobre Z-image-turbo, un modelo de difusion para generacion de imagenes. El adaptador se activa sin palabra de disparo ni prompt especifico: segun el autor, "carga y funciona", con una intencion de intervencion forzada y sin contaminacion del resto de la generacion. La model card recomienda un peso de 1,5 para obtener el mejor resultado.

La relevancia de esta ficha es limitada desde el punto de vista de la investigacion: se trata de un artefacto de un ecosistema de generacion de imagenes orientado a consumidores, sin datos de entrenamiento, benchmarks ni licencia declarada. Su interes practico esta en documentar como se integra un LoRA de este tipo en flujos de ComfyUI y que limitaciones presenta para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Z-image-turbo, modelo de difusion text-to-image |
| Parametros totales | no disponible (fichero de pesos de 20 MiB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a text-to-image) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`Z-image 年龄滑块 最低18岁.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Z-image-turbo para modificar su comportamiento sin reentrenar los pesos completos. La model card no detalla sobre que capas se aplica el adaptador, ni el rango, ni el alpha, ni la tasa de aprendizaje empleada. El fichero pesa 20 MiB, lo que es coherente con un LoRA de rango moderado sobre un modelo de difusion.

No se proporciona informacion sobre el dataset de entrenamiento: ni numero de imagenes, ni composicion, ni si hubo filtrado o curacion. Tampoco se documenta si se uso RLHF, DPO u otra tecnica de alineacion (no aplicable en el sentido habitual a modelos de difusion, pero relevante para entender el ajuste). La unica indicacion tecnica de la model card es que no requiere palabra de disparo ni adjetivos en el prompt, que se aplica de forma forzada al cargarse y que el peso recomendado es aproximadamente 1,5.

## Capacidades

- Generacion de imagenes text-to-image mediante el modelo base Z-image-turbo, modulado por el adaptador LoRA.
- Modificacion del atributo de edad aparente de los sujetos generados, con un minimo forzado de 18 anos segun el autor.
- Activacion sin palabra de disparo: el efecto se aplica al cargar el LoRA, sin necesidad de anadir terminos al prompt.
- Integracion en flujos de ComfyUI y en la plataforma RunningHub.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni multilingues, ya que no es un modelo de lenguaje.

## Casos de uso

- Generacion de retratos de personajes adultos en estudios de creacion de personajes: el LoRA fuerza un rango de edad adulto, lo que resulta util cuando se encadenan generaciones y se quiere evitar que el modelo base produzca sujetos de aspecto juvenil por defecto.
- Flujos de ComfyUI con pipelines de img2img o inpainting: al no requerir palabra de disparo, el adaptador se puede insertar como nodo intermedio sin reescribir los prompts existentes.
- Prototipado rapido en RunningHub: el autor ofrece la posibilidad de probar el modelo en linea, lo que permite evaluar el efecto del LoRA antes de descargarlo.
- Consistencia de personajes en series de imagenes: combinado con otros LoRA de identidad (la model card indica "cargar con otros modelos de cara"), se puede mantener un personaje adulto coherente entre escenas.
- Filtrado de contenido en pipelines de generacion: como capa de seguridad adicional para forzar un rango de edad adulto en la salida, aunque no sustituye a un clasificador de contenido.
- Experimentacion con pesos de LoRA: el valor recomendado de 1,5 permite estudiar como varia el efecto del adaptador segun el peso aplicado en la escala de denoising.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base Z-image-turbo, que no se especifica en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el LoRA en si ocupa 20 MiB, pero el modelo base determina el requisito real de VRAM.
- Opciones de despliegue: ComfyUI y la plataforma RunningHub (tanto en su version internacional como en la china). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-z-image-18-lora | LoRA sobre Z-image-turbo | no disponible (20 MiB) | no aplica | no disponible | no disponible | Hugging Face, RunningHub |
| Alternativas de LoRA para control de edad en difusion | LoRA | no disponible | no aplica | no disponible | variable | no disponible |
| Modelos base text-to-image (p. ej. SDXL, FLUX) | Difusion | no disponible en esta ficha | no aplica | no disponible | variable | no disponible |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas. La comparativa queda limitada a la categoria funcional (adaptadores LoRA de control de atributos sobre modelos de difusion).

## Limitaciones y advertencias

- La model card incluye una advertencia explicita del autor sobre el uso con menores: "por razones que no se pueden mencionar, se ha configurado un minimo de 18 anos; no use terminos como nino, de lo contrario las consecuencias son su responsabilidad". Esta advertencia debe tomarse como una restriccion de uso, no como una garantia tecnica.
- No se declara licencia: la model card remite a la licencia del proyecto original o upstream, lo que genera incertidumbre sobre el uso comercial. Es necesario verificar la licencia de Z-image-turbo antes de cualquier despliegue en produccion.
- No hay informacion sobre sesgos: al ser un adaptador de control de edad, puede introducir sesgos en la representacion de genero, etnia o complexidad de los sujetos generados.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, artefactos y texturas inconsistentes, especialmente en manos y rostros.
- El efecto del LoRA puede interferir con otros adaptadores cargados simultaneamente (por ejemplo, LoRA de identidad), y el autor recomienda un peso de 1,5 sin documentar el comportamiento fuera de ese rango.
- No hay documentacion sobre el modelo base Z-image-turbo en la informacion proporcionada: se desconoce su tamano, contexto, licencia y requisitos de hardware.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo figura como 0.0 GB pese a que el fichero declarado pesa 20 MiB, lo que sugiere posibles inconsistencias en los metadatos.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-z-image-18-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2038815456462643201
- Pagina del autor: https://www.runninghub.cn/user-center/1942538686796050434
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
