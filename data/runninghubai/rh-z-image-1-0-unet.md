# RunningHubAI/rh-z-image-1.0-unet

## Resumen

rh-z-image-1.0-unet es un archivo de pesos UNET para generación de imágenes a partir de texto (text-to-image), publicado por RunningHubAI en Hugging Face en nombre del autor NINE.JIUGE. Se trata de un ajuste fino (fine-tune) derivado de Z-image-turbo, empaquetado en un único fichero safetensors de 5.870 MiB dentro de un repositorio de 6,2 GB. Está pensado para cargarse en ComfyUI, en la plataforma RunningHub o directamente desde Hugging Face.

El modelo se presenta con dos objetivos declarados por el autor: evitar el llamado "rostro de influencer" (un sesgo estético muy común en modelos de retrato) y "restaurar por completo trabajos fotográficos", es decir, maximizar el realismo fotográfico y el detalle de textura de piel. No se publican datos sobre arquitectura interna, número de parámetros, dataset de entrenamiento ni licencia concreta, por lo que la mayoría de especificaciones quedan como no disponibles.

Es relevante ahora únicamente como pieza dentro del ecosistema ComfyUI: se trata de un checkpooint UNET de nicho, orientado a flujos de fotorrealismo, con cero descargas y cero likes en el momento de la consulta, lo que lo sitúa como un lanzamiento muy reciente y sin validación externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNET de difusion para text-to-image; fine-tune de Z-image-turbo |
| Parametros totales | no disponible (el fichero de 5.870 MiB sugiere pesos de precision mixta; el recuento no se publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen, no de texto) |
| Tipos de cuantizacion | safetensors sin cuantizar documentada; no se listan variantes GGUF, fp8 ni otras |
| Idiomas soportados | no disponibles (el prompt de texto depende del codificador de texto del pipeline base) |
| Licencia | no disponible; la model card indica que el copyright pertenece al autor y remite a la licencia del proyecto original |
| Formato de pesos | safetensors (`Z_Image真实皮肤纹理摄影_1.0.safetensors`, 5.870 MiB) |

## Arquitectura y entrenamiento

La informacion disponible solo confirma que el modelo es un UNET de difusion para text-to-image y que deriva de Z-image-turbo mediante fine-tuning. No se detalla el numero de bloques, la dimension del espacio latente, el tipo de atencion ni la variante de scheduler compatible. Tampoco se publican el numero de pasos de entrenamiento, el volumen de imagenes del dataset, la resolucion de entrenamiento, ni si se aplicaron tecnicas de alineacion como RLHF o DPO (habitualmente no aplicables en modelos de difusion puros, pero no confirmado).

La unica innovacion declarada es de caracter estetico: el ajuste busca eliminar el sesgo de "cara de influencer" y preservar texturas fotograficas realistas, especialmente en piel. Al no haber publicacion tecnica ni configuracion de entrenamiento, no es posible verificar que metodos (LoRA previos, DreamBooth, fine-tuning completo del UNET) se emplearon.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image).
- Especializacion en fotorrealismo y en textura de piel, segun la model card.
- Integracion directa como UNET en flujos de ComfyUI.
- Ejecucion en la plataforma cloud RunningHub y su API.
- Carga desde Hugging Face en pipelines de difusion que acepten pesos UNET en safetensors.
- No se documenta soporte de tool calling ni function calling: es un modelo de imagen, no un modelo de lenguaje.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues especificas para el prompt.
- No se documenta modo "thinking", vision ni audio como entradas adicionales.

## Casos de uso

- Retrato fotografico realista: el modelo puede generar retratos con textura de piel detallada evitando el acabado plastico o "de influencer" tipico de otros checkpoints, lo que lo hace util para sesiones de retrato sintetico en estudios de diseno.
- Restauracion y recreacion de estilo fotografico: dado su objetivo declarado de "restaurar por completo trabajos fotograficos", encaja en flujos donde se busca replicar la estetica de una sesion real (iluminacion, grano, poros) a partir de una descripcion.
- Produccion de material para e-commerce de moda y belleza: al priorizar texturas realistas, resulta adecuado para mockups de producto en piel humana (cosmetica, joyeria) donde el acabado artificial penaliza la credibilidad.
- Flujos de trabajo en ComfyUI: al ser un UNET en safetensors, se puede insertar en grafos existentes de ComfyUI sustituyendo el nodo de UNET, combinable con LoRAs, ControlNet y samplers ya configurados.
- Prototipado rapido de conceptos visuales para direccion de arte: permite generar referencias fotograficas antes de una produccion real, con un coste de iteracion bajo.
- Automatizacion por API en RunningHub: el modelo puede invocarse a traves de la API de la plataforma para generar imagenes en lote dentro de pipelines de contenido, siempre que se respete la licencia del proyecto original.
- Ajuste posterior (fine-tuning adicional): al estar en formato safetensors, puede servir como base para entrenar LoRAs o nuevos fine-tunes sobre un estilo fotografico concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, evaluaciones humanas) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero UNET ocupa 5.870 MiB; sumando el codificador de texto y el VAE del pipeline base, es razonable esperar un consumo en el entorno de 8-12 GB en fp16, aunque el dato exacto no esta publicado.
- GPU recomendadas: tarjetas con al menos 12 GB de VRAM para mayor comodidad (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090); en el segmento profesional, A100, H100 o L40S si se ejecuta en servidor.
- Cabida en GPU de consumo: probablemente si en GPUs de 12 GB o mas; en GPUs de 8 GB el margen puede ser insuficiente si se anaden LoRAs o ControlNet, aunque no hay confirmacion del autor.
- Opciones de despliegue: ComfyUI (destino principal declarado), plataforma cloud RunningHub y su API. No se documentan instrucciones para vLLM, TGI, llama.cpp ni Ollama (herramientas orientadas a modelos de lenguaje, no aplicables aqui).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-z-image-1.0-unet | UNET text-to-image | Z-image-turbo (fine-tune) | no disponible | no disponible (heredada del original) | Hugging Face / ComfyUI / RunningHub |
| rh-z-image-turbo-unet | UNET text-to-image | Z-image-turbo (RunningHub) | no disponible | no disponible | Hugging Face |
| rh-z-imagebase-fp16-unet | UNET text-to-image | Z-image base | no disponible | no disponible | Hugging Face |
| Z-image-turbo (modelo base) | Modelo de difusion | original | no disponible en esta informacion | no disponible | repositorio upstream del proyecto Z-image |

No se dispone de datos de rendimiento comparados, por lo que la comparacion se limita a tipo de modelo, procedencia y canal de distribucion.

## Limitaciones y advertencias

- Licencia no explicita: la model card indica que el copyright pertenece al autor y remite a la licencia del proyecto original, lo que deja el uso comercial en una zona ambigua hasta consultar la licencia upstream de Z-image-turbo.
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia publica de calidad ni de estabilidad de generacion.
- Sin datos de entrenamiento: imposible auditar el dataset, la resolucion de entrenamiento o posibles sesgos aprendidos.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar anatomias incorrectas (manos, ojos, dientes) y artefactos en texturas de piel, especialmente en resoluciones altas o con prompts ambiguos.
- Sesgo estetico declarado en direccion contraria: al eliminar el "rostro de influencer", el modelo puede penalizar ciertos tipos de rostro o estilos de belleza, lo que constituye un sesgo de diseno a tener en cuenta.
- Idiomas: no se documentan idiomas soportados en el prompt; se desconoce el comportamiento con prompts en castellano.
- Produccion: sin benchmarks, sin licencia clara y sin comunidad, no es recomendable como modelo unico en un pipeline comercial sin una validacion previa exhaustiva.
- Compatibilidad: al ser un UNET suelto, depende del codificador de texto y VAE del pipeline para el que fue entrenado; cargarlo con componentes no compatibles puede degradar la calidad.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-z-image-1.0-unet
- Modelo relacionado en Hugging Face: https://huggingface.co/RunningHubAI/rh-z-image-turbo-unet
- Listado de modelos del autor: https://huggingface.co/RunningHubAI/models
- Proyecto original (RunningHub China): https://www.runninghub.cn/model/public/2013416999258427393
- Pagina del autor: https://www.runninghub.cn/user-center/1958026340350025729
- Plataforma RunningHub International: https://www.runninghub.ai
- Plataforma RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Pagina de entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- RunningHub Models (plataforma de modelos y LoRA): https://www.runninghub.ai/models
