# RunningHubAI/rh-vitalina-krea2-turbo-lora

## Resumen

rh-vitalina-krea2-turbo-lora es un adaptador LoRA de edicion de imagen publicado por RunningHubAI en nombre del autor Ruslan RedBerg. No es un modelo base autonomo, sino un conjunto de pesos de ajuste fino que se aplica sobre el modelo Krea2 (referenciado en la model card como "krea2") para incorporar un sujeto o estilo concreto identificado por la palabra gatillo "vitalina". El repositorio contiene un unico fichero safetensors de 448 MiB.

El modelo esta orientado al ecosistema ComfyUI y a la plataforma RunningHub, y su pipeline declarado es image-text-to-image, es decir, edicion o generacion de imagenes condicionada por una imagen de entrada y una instruccion textual. La relevancia practica es acotada: se trata de un LoRA de personaje o estilo para flujos de trabajo creativos, no de un modelo fundacional con capacidades generales.

La informacion publicada es muy limitada. No se detallan arquitectura del modelo base, numero de pasos de entrenamiento, composicion del dataset, licencia explicita ni idiomas soportados. Cualquier dato que no figure en la model card se marca en esta ficha como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo base Krea2 (arquitectura del base no disponible) |
| Parametros totales | no disponible (pesos LoRA de 448 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; cuantizacion del base segun el runtime) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors (`vifkdidduskdskdssdds3332_c1-st2000.safetensors`, 448 MiB) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) que modifica los pesos de atencion y/o proyecciones del modelo base Krea2. La model card no especifica la arquitectura del base (transformer de difusion, DiT u otra), el rango del LoRA, las capas intervenidas ni la tasa de aprendizaje empleada. El nombre del fichero (`...c1-st2000`) sugiere un checkpoint en el paso 2000 de entrenamiento, pero este dato no se confirma en la documentacion.

No se publica informacion sobre el dataset de entrenamiento: numero de imagenes, resolucion, composicion, uso de captions automaticas ni tecnicas de regularizacion. Tampoco se documenta si hubo ajuste de hiperparametros, uso de LoRA de texto, o si el entrenamiento se realizo en la propia plataforma RunningHub (que ofrece servicios de entrenamiento). La unica indicacion funcional es la palabra gatillo "vitalina", necesaria para activar el concepto aprendido.

## Capacidades

- Generacion y edicion de imagenes condicionadas por texto e imagen de entrada (pipeline image-text-to-image), siempre que se cargue junto al modelo base Krea2.
- Aplicacion de un concepto de personaje o estilo concreto mediante la palabra gatillo "vitalina".
- Integracion en flujos de trabajo de ComfyUI mediante nodos de carga de LoRA.
- Ejecucion en la plataforma RunningHub y en Hugging Face (inferencia via API o despliegue local).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada general ni audio.
- Capacidades multilingues: no disponibles; el condicionamiento textual depende del codificador de texto del modelo base.

## Casos de uso

- Edicion de retratos con identidad consistente: aplicar el LoRA sobre Krea2 en ComfyUI para generar variaciones de un mismo sujeto ("vitalina") manteniendo rasgos reconocibles entre imagenes.
- Produccion de material creativo para redes sociales: generar un conjunto de imagenes con un personaje fijo a partir de prompts y una imagen de referencia, reduciendo el trabajo manual de postproduccion.
- Ilustracion de narrativa o comic: mantener la coherencia visual de un personaje a lo largo de varias viñetas usando el mismo LoRA y distintos prompts de escena.
- Prototipado de conceptos de personaje en estudios de diseno: iterar rapidamente sobre variantes de un personaje antes de encargar un modelo a medida de mayor coste.
- Pruebas de pipelines de generacion en ComfyUI: usar el LoRA como caso de prueba para validar la carga de adaptadores, la gestion de memoria y el encadenamiento de nodos.
- Integracion via API de RunningHub: automatizar la generacion de imagenes con este concepto desde una aplicacion externa sin infraestructura GPU propia.
- Experimentacion con tecnicas de edicion imagen-a-imagen: evaluar como responde el base Krea2 a la combinacion de imagen de referencia y prompt textual con un adaptador de bajo rango.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el LoRA en si (448 MiB en disco); el consumo real lo determina el modelo base Krea2, cuyo tamano no se documenta.
- GPU recomendadas: no disponibles; dependen del base. Para modelos de difusion de imagen de tamano comparable suele ser necesario al menos 8-12 GB de VRAM en cuantizacion FP16, pero este dato no se confirma para Krea2.
- Compatibilidad con GPU de consumo: no confirmada; requiere verificar los requisitos del modelo base.
- Opciones de despliegue: ComfyUI (flujo principal), plataforma RunningHub (local o API), Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje y no aplican a este tipo de adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-vitalina-krea2-turbo-lora | LoRA de imagen sobre Krea2 | no disponible (448 MiB) | no aplica | no disponible | Hugging Face, RunningHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros LoRA de la misma familia Krea2 ni sobre adaptadores equivalentes con los que establecer una comparacion rigurosa de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- La model card no especifica licencia; el texto remite a "la licencia del proyecto original o upstream". Antes de un uso comercial es imprescindible verificar la licencia de Krea2 y del propio LoRA con el autor.
- Solo funciona junto al modelo base Krea2; no es un modelo autonomo y no puede evaluarse de forma aislada.
- El concepto aprendido se activa exclusivamente con la palabra gatillo "vitalina"; sin ella el adaptador puede no tener efecto o degradar la salida.
- No hay documentacion sobre sesgos del dataset de entrenamiento, lo que impide evaluar riesgos de representacion o estereotipos.
- Riesgo de sobreajuste al concepto: al ser un LoRA de personaje, puede reducir la diversidad de las generaciones y forzar la identidad aprendida en contextos no deseados.
- Riesgo de alucinacion visual (artefactos, anatomias incorrectas, incoherencias) inherente a los modelos de difusion; no se ha publicado ninguna evaluacion cualitativa.
- Sin informacion sobre idiomas soportados en los prompts; se desconoce si el codificador de texto del base maneja bien el castellano.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- No hay datos de rendimiento, latencia ni calidad objetiva; cualquier uso en produccion requiere una evaluacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-vitalina-krea2-turbo-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2114361668185034753
- Pagina del autor: https://www.runninghub.ai/user-center/2105650395581284353
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-vitalina-krea2-turbo-lora/blob/main/README_cn.md
