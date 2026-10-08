# RunningHubAI/rh-qwen-image-2.1v2.0-lora

## Resumen

rh-qwen-image-2.1v2.0-lora es un adaptador LoRA de bajo rango para generacion de imagenes a partir de texto (pipeline text-to-image), publicado por RunningHubAI en Hugging Face y atribuido al usuario RunningHub @浩的AI日常. No es un modelo de lenguaje: es un ajuste fino ligero que se carga sobre el modelo base qwen-image-2.1 y modifica su comportamiento en una tarea muy concreta de composicion de imagen.

La funcion declarada del adaptador es la correccion de perspectiva del fondo y la fusion (blending) del sujeto con ese fondo. El prompt de referencia incluido en la model card lo describe explicitamente: mantener sin cambios la posicion y el tamano del sujeto, ajustar el angulo de perspectiva del fondo para alinearlo con el punto de fuga del sujeto y lograr una mezcla sin costuras entre ambos. Se activa mediante la palabra clave `pysj666`.

El repositorio ocupa 0,2 GB y contiene un unico archivo de pesos safetensors de 160 MiB, pensado para cargarse en ComfyUI, en la plataforma en la nube de RunningHub o directamente desde Hugging Face. Los pesos del modelo base no se distribuyen en este repositorio, por lo que el adaptador no es util por si solo. En el momento de la consulta acumula 11 likes y 0 descargas, esta etiquetado para ComfyUI y su licencia no esta especificada mas alla de la remision a la licencia del proyecto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion text-to-image qwen-image-2.1; rango y modulos objetivo no disponibles |
| Parametros totales | no disponible (unico archivo de pesos de 160 MiB en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica contexto de texto conversacional) |
| Tipos de cuantizacion | no disponible (solo se publica un archivo safetensors) |
| Idiomas soportados | no disponible (el prompt de ejemplo esta en ingles; existe README en chino) |
| Licencia | no disponible (la model card remite a la licencia del proyecto original o upstream; copyright del autor) |
| Formato de pesos | safetensors |
| Tipo de modelo | LoRA text-to-image |
| Modelo base | qwen-image-2.1 (no incluido en el repositorio) |
| Palabra de activacion | pysj666 |
| Tamano del repositorio | 0,2 GB |
| Archivo de pesos | qwen-image-2.1纠正背景透视溶图v2.0.safetensors (160 MiB) |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Descargas / likes | 0 / 11 |
| Fecha de creacion / actualizacion | 2026-10-07 / 2026-10-07 |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en capas del modelo base para modificar su comportamiento sin reentrenar todos los pesos. El modelo base declarado es qwen-image-2.1, un modelo de difusion para generacion de imagenes a partir de texto. La model card no especifica la arquitectura interna del base, el rango del adaptador, el valor de alpha, los modulos objetivo (attention, MLP, proyecciones de texto) ni la precision de entrenamiento.

Tampoco se documentan los datos de entrenamiento: no hay informacion sobre el numero de pares imagen-texto utilizados, la composicion del dataset, el numero de pasos, la tasa de aprendizaje ni si se emplearon tecnicas de alineacion como RLHF o DPO (poco habituales en este tipo de adaptadores). La unica informacion funcional disponible es el objetivo declarado del ajuste: corregir el angulo de perspectiva del fondo para que coincida con el punto de fuga del sujeto y conseguir una fusion sin costuras entre sujeto y fondo, manteniendo intactas la posicion y la escala del sujeto.

## Capacidades

- Correccion de perspectiva de fondo: ajusta el angulo del fondo para alinearlo con el punto de fuga del sujeto, segun la descripcion del autor.
- Fusion integrada sujeto-fondo: aplica un blending sin costuras entre el sujeto y el nuevo fondo.
- Preservacion del sujeto: el prompt de referencia pide mantener sin cambios la posicion y el tamano del sujeto.
- Activacion por palabra clave: requiere el token `pysj666` en el prompt.
- Generacion text-to-image: hereda las capacidades del modelo base qwen-image-2.1, aunque no se documenta que capacidades concretas se preservan o se degradan tras el ajuste.
- No soporta tool calling ni function calling: es un modelo de imagen, no un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponible; el prompt de ejemplo esta en ingles y existe documentacion en chino.
- Capacidades especiales (vision, audio, modo thinking): no aplica.

## Casos de uso

- Composicion publicitaria con sujeto recortado: se integra un producto o una persona recortada sobre un fondo nuevo y el adaptador realinea la perspectiva del fondo con el punto de fuga del sujeto, evitando el efecto de "pegatina" tipico del collage manual.
- Retoque de fotografia de producto en catalogo: se sustituye el fondo original por un set o una escena y se conservan tamano y posicion del producto, manteniendo coherencia geometrica entre objeto y entorno.
- Generacion de variantes de escenario para e-commerce: a partir de una foto de estudio se producen multiples fondos con la misma perspectiva, utiles para tests A/B de ficha de producto sin volver a fotografiar.
- Postproduccion de fotografia de retrato: se cambia el fondo de una sesion y se unifica la linea de fuga del entorno con la del sujeto para que la imagen parezca capturada en localizacion real.
- Creacion de material para redes sociales: se generan composiciones rapidas en ComfyUI donde el sujeto se mantiene fijo y el fondo cambia por escenas coherentes en perspectiva, con un coste de computo bajo al ser un adaptador de 160 MiB.
- Flujos de diseno grafico automatizados: se encadena el LoRA dentro de un grafo de ComfyUI tras un paso de segmentacion y recorte del sujeto, de modo que la correccion de perspectiva y el blending se apliquen como etapa final del pipeline.
- Prototipado de escenarios 3D a partir de imagenes: se colocan personajes u objetos renderizados sobre entornos generados y se alinea la perspectiva del fondo con la del render, util para previsualizacion de conceptos.
- Servicio en la nube sin infraestructura propia: al publicarse tambien a traves de la API de RunningHub, el adaptador puede invocarse de forma remota en flujos de produccion sin desplegar GPU propia, aunque no se documentan condiciones de uso ni precios en la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas cuantitativas (FID, CLIP score, SSIM, comparativas cualitativas con y sin el adaptador) ni ejemplos de imagenes antes/despues en la model card.

## Requisitos de hardware

- Peso del adaptador: 160 MiB en safetensors. Es un incremento marginal sobre el modelo base.
- Modelo base obligatorio: qwen-image-2.1 debe cargarse por separado en ComfyUI o en RunningHub. La VRAM total depende del base y de su precision; no disponible en la informacion proporcionada.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible. El adaptador en si es ligero, pero el requisito real lo marca el modelo base.
- Opciones de despliegue: ComfyUI (flujo documentado por el autor), plataforma en la nube RunningHub y su API, y carga directa de pesos desde Hugging Face. Ollama, llama.cpp y TGI no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables en la informacion proporcionada, ni de sus especificaciones tecnicas, por lo que no es posible establecer una comparacion cuantitativa fiable.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-qwen-image-2.1v2.0-lora | LoRA text-to-image sobre qwen-image-2.1 | no disponible (160 MiB de pesos) | no aplica | no disponible | Hugging Face, ComfyUI, RunningHub |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

Funcionalmente, la tarea que cubre este adaptador (correccion de perspectiva del fondo y fusion con el sujeto) puede abordarse tambien con pipelines de inpainting/outpainting y con tecnicas de armonizacion de composicion dentro de ComfyUI, pero no se dispone de datos de rendimiento comparativos entre esos enfoques y este LoRA en la informacion consultada.

## Limitaciones y advertencias

- Alcance muy restringido: el adaptador esta ajustado para una tarea concreta (perspectiva de fondo y blending). Su comportamiento fuera de ese caso de uso no esta documentado y puede degradar la calidad de generacion del modelo base.
- Dependencia del modelo base: no funciona de forma aislada; requiere qwen-image-2.1, cuyos pesos no se incluyen en el repositorio.
- Sin documentacion de entrenamiento: se desconocen datos, hiperparametros y modulos afectados, lo que dificulta reproducir o auditar el ajuste.
- Sin ejemplos cuantitativos: la model card no incluye imagenes de comparacion ni metricas, por lo que la mejora declarada no esta verificada de forma independiente.
- Riesgo de artefactos de composicion: al manipular perspectiva y fusionar fondos, son esperables errores de geometria, sombras inconsistentes o bordes visibles en el sujeto, aunque no hay documentacion que los cuantifique.
- Licencia no especificada: la model card remite a la licencia del proyecto original o upstream y mantiene el copyright del autor. Antes de un uso comercial es imprescindible verificar la licencia de qwen-image-2.1 y contactar con el autor.
- Idiomas no documentados: se desconoce el comportamiento con prompts en castellano; el ejemplo facilitado esta en ingles.
- Sesgos: no disponibles. No hay informacion sobre sesgos de generacion del adaptador ni del base.
- Adopcion muy baja: 0 descargas y 11 likes en el momento de la consulta, sin historial de uso en produccion.
- Fechas de publicacion y actualizacion identicas (2026-10-07), lo que sugiere que no ha habido revisiones posteriores.
- Trazabilidad: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces disponibles proceden unicamente de la model card del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-qwen-image-2.1v2.0-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-qwen-image-2.1v2.0-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2106760485696794625
- Pagina del autor: https://www.runninghub.cn/user-center/1990694816872869890
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API de RunningHub: https://www.runninghub.ai/call-api
- La busqueda web no aporto enlaces relevantes adicionales sobre este modelo.
