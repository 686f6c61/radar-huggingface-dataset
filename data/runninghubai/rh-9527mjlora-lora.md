# RunningHubAI/rh-9527mjlora-lora

## Resumen

`rh-9527mjlora-lora` es un adaptador LoRA publicado en Hugging Face por RunningHubAI, una plataforma de generacion de imagenes con flujos ComfyUI y API. El artefacto no es un modelo de lenguaje: es un fichero de pesos LoRA de 18 MiB (`Flux-人像-midjourney_whisper.safetensors`) pensado para cargarse sobre un modelo base de difusion, presumiblemente de la familia FLUX, para modificar el estilo de generacion de retratos.

La model card es extremadamente escasa. Indica que el modelo es de tipo LoRA, que se distribuye para ComfyUI, RunningHub y Hugging Face, y que esta afinado a partir de un base denominado "F1基础 D" (probablemente un checkpoint derivado de FLUX.1, aunque el autor no lo confirma). No se especifican parametros, contexto, idiomas, licencia ni pipeline de difusion.

La relevancia de esta ficha es limitada desde el punto de vista de la evaluacion de modelos fundacionales: se trata de un adaptador de estilo para generacion de imagenes, con cero descargas y cero likes en el momento de la consulta, publicado el 20 de noviembre de 2026. Su interes practico depende del modelo base sobre el que se aplique, dato que no esta documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo base de difusion no especificado; el autor cita "F1基础 D" |
| Parametros totales | no disponible (pesos LoRA de 18 MiB; el numero de parametros del adaptador no se declara) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible; el fichero se distribuye en safetensors de 18 MiB |
| Idiomas soportados | no disponibles (los prompts dependen del modelo base y del tokenizador de texto asociado) |
| Licencia | no disponible; la model card remite a "the original project or upstream license" |
| Formato de pesos | safetensors (`Flux-人像-midjourney_whisper.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de atencion (y posiblemente en las capas feed-forward) de un modelo de difusion preentrenado. El nombre del fichero, `Flux-人像-midjourney_whisper`, sugiere que el adaptador se entrena para retratos ("人像", retrato en chino) con un estilo inspirado en Midjourney y posiblemente con un componente de "whisper" (podria referirse a un trigger word o a una tecnica de destilacion de estilo, pero el autor no lo aclara).

No se publica informacion sobre el numero de pasos de entrenamiento, el dataset utilizado, la resolucion de las imagenes de entrenamiento, el rango del LoRA, el alpha, ni si se emplearon tecnicas como DreamBooth, LoRA clasico o variantes como LoHa/LoKr. Tampoco se documenta el modelo base exacto: "F1基础 D" es una denominacion interna de RunningHub que no se traduce a un identificador publico verificable. No hay evidencia de RLHF, DPO ni de evaluacion cuantitativa del adaptador.

## Capacidades

- Generacion de imagenes de retrato con un estilo visual concreto, presumiblemente cercano a la estetica de Midjourney, al aplicarse sobre el modelo base correspondiente.
- Integracion en flujos ComfyUI mediante el nodo de carga de LoRA (`Load LoRA`), lo que permite combinarlo con checkpoints, VAEs y samplers del ecosistema.
- Compatibilidad declarada con la plataforma RunningHub y su API, lo que permite invocarlo en linea sin infraestructura propia.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: no es un modelo de lenguaje.
- No se documenta soporte multilingue de prompts; depende del codificador de texto del modelo base (tipicamente T5 o CLIP en la familia FLUX).

## Casos de uso

- Generacion de retratos estilizados en estudio: cargar el LoRA en ComfyUI sobre el checkpoint base compatible y usarlo para producir retratos con una estetica consistente en sesiones de fotografia sintetica o avatares.
- Prototipado de personajes para videojuegos o narrativa visual: el adaptador permite fijar un estilo de retrato coherente entre distintas generaciones, reduciendo la variabilidad entre assets.
- Creacion de contenido para redes sociales: integrado en un pipeline de ComfyUI con upscaling y postprocesado, sirve para generar imagenes de perfil o ilustraciones con un look uniforme.
- Pruebas de concepto en la API de RunningHub: al estar publicado en la plataforma, permite validar el estilo sin descargar pesos ni montar GPU local, util para equipos que evaluan estilos antes de invertir en infraestructura.
- Composicion con otros LoRA y ControlNet: al ser un adaptador de bajo rango, puede combinarse con adaptadores de pose o de iluminacion para controlar la composicion del retrato ademas del estilo.
- Docencia y experimentacion con LoRA: por su tamano reducido (18 MiB) es un ejemplo practico para explicar como se inyectan adaptadores en modelos de difusion y como afecta el rango al resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, similitud de estilo) ni comparaciones cuantitativas con otros LoRA de retrato.

## Requisitos de hardware

- VRAM estimada para inferencia: depende enteramente del modelo base. Un checkpoint FLUX en fp16 requiere del orden de 24 GB de VRAM; en cuantizaciones de 8 bits o 4 bits puede bajar a 12-16 GB. El LoRA en si anade un coste marginal (18 MiB de pesos).
- GPU recomendadas: no disponibles para este adaptador concreto; para el modelo base tipico de la familia FLUX se suelen emplear RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) en entornos de produccion.
- Compatibilidad con GPU de consumo: probable en RTX 3090/4090 con cuantizacion del base; no confirmado por el autor.
- Opciones de despliegue: ComfyUI (flujo nativo declarado), API de RunningHub, y en general cualquier runtime que cargue safetensors LoRA sobre el base compatible (por ejemplo, diffusers con `load_lora_weights`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica el modelo base exacto ni ofrece datos de rendimiento, por lo que no es posible establecer una comparacion rigurosa con otros LoRA de retrato (por ejemplo, adaptadores publicos para FLUX.1 dev o SDXL). Cualquier comparacion seria especulativa.

## Limitaciones y advertencias

- La licencia no esta declarada de forma explicita; la model card remite a la licencia del proyecto original o del modelo base. Antes de un uso comercial es imprescindible verificar la licencia de FLUX (si el base es FLUX.1 [dev], la licencia es no comercial) y la del propio adaptador con el autor.
- El modelo base ("F1基础 D") no esta identificado publicamente; cargar el LoRA sobre un base distinto puede producir resultados degradados o nulos.
- Riesgo de sobreajuste al estilo y de perdida de diversidad en los retratos generados, algo habitual en LoRA de estilo con datasets pequenos.
- Posibles sesgos en la representacion de genero, etnia y edad, no documentados ni evaluados por el autor.
- No hay garantia de calidad ni de reproducibilidad: cero descargas y cero likes en el momento de la consulta, sin validacion de la comunidad.
- No apto para tareas de lenguaje, razonamiento, codigo o agentes; es exclusivamente un adaptador de imagen.
- El contenido generado puede infringir derechos de imagen o de estilo si se usa con personas reales o imitando obras protegidas; la responsabilidad recae en el usuario.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-9527mjlora-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1843833505598885889
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1819651977814142978
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-9527mjlora-lora/blob/main/README_cn.md
