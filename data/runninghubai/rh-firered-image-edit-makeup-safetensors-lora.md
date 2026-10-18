# RunningHubAI/rh-firered-image-edit-makeup.safetensors-lora

## Resumen

rh-firered-image-edit-makeup.safetensors-lora es un adaptador LoRA de edición de imagen orientado a maquillaje y retoque cosmético, publicado por RunningHubAI en nombre del autor (@风熙AI) dentro de la plataforma RunningHub. No es un modelo completo: se distribuye como un único fichero de pesos `FireRed-Image-Edit-Makeup.safetensors` de 564 MiB (repositorio de 0,6 GB) que se aplica sobre el modelo base Qwen-Image, según indica la model card ("Finetuned from: Qwen-image"). Su pipeline declarado es text-to-image y sus etiquetas son `comfyui`, `lora`, `text-to-image`.

El objetivo declarado es mejorar la estética facial en edición de imágenes: textura de piel, armonía de color, detalle de labios y ojos y optimización general del rostro, manteniendo la consistencia de identidad y la autenticidad de las texturas naturales. Es, por tanto, una pieza de posprocesado creativo para flujos de retrato y beauty, no un modelo de propósito general.

Su relevancia es limitada y muy específica: el repositorio no incluye métricas, datos de entrenamiento, licencia concreta ni lista de idiomas, y en el momento de la consulta acumula 0 descargas y 0 likes, por lo que no existe validación comunitaria pública. Resulta útil únicamente como adaptador práctico dentro de ComfyUI o de la API de RunningHub para tareas de maquillaje digital.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión text-to-image Qwen-Image |
| Parametros totales | no disponible (se distribuye un adaptador LoRA, no un modelo completo; fichero de 564 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo text-to-image); longitud máxima de prompt no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors |
| Modelo base | Qwen-Image (según model card) |
| Tamaño del repositorio | 0,6 GB (fichero LoRA de 564 MiB) |
| Pipeline declarado | text-to-image |
| Plataformas indicadas | ComfyUI, RunningHub, Hugging Face |

## Arquitectura y entrenamiento

La información disponible describe un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas de un modelo de difusión preentrenado para especializarlo sin reentrenar el modelo completo. El modelo base indicado es Qwen-Image; no se especifican en la información proporcionada ni la variante exacta del base, ni el rango del adaptador, ni las capas a las que se aplica. El tamaño del fichero (564 MiB) es coherente con un adaptador de ese tipo, pero no permite deducir su rango ni su precisión de almacenamiento.

No hay datos publicados sobre el entrenamiento: se desconoce el número de imágenes o pasos, la composición del dataset (tipos de rostro, tonos de piel, iluminación, resolución), el uso de RLHF/DPO u otras técnicas de alineación, y los hiperparámetros. La model card únicamente declara el objetivo cualitativo: preservar la identidad y la textura natural mientras se realza la estética facial. No se documentan innovaciones técnicas asociadas (decodificación especulativa, atención linear ni similares), algo esperable en un adaptador de este tipo.

## Capacidades

- Edición cosmética de retratos: realce de textura de piel, armonía de color y detalle en labios y ojos, según la descripción del autor.
- Preservación declarada de la identidad facial y de las texturas naturales, es decir, se presenta como retoque sin sustitución de la persona.
- Generación/edición text-to-image condicionada por prompt, al estar integrado en el pipeline de Qwen-Image.
- Uso como adaptador en flujos ComfyUI, cargable junto al modelo base y combinable con otros nodos del grafo.
- Ejecución vía API de RunningHub (internacional y China), según los enlaces de la model card.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo "thinking"; no aplican a un LoRA de difusión.
- Cobertura multilingüe de prompts: no disponible.

## Casos de uso

- Retoque de retratos en estudio fotográfico: aplicar el LoRA sobre imágenes ya capturadas para unificar tono de piel e iluminación facial, manteniendo los rasgos del sujeto, antes de la entrega final al cliente.
- Prueba virtual de maquillaje en comercio electrónico: generar variantes de un mismo rostro con distintos estilos (labios, ojos, tono) para fichas de producto, apoyándose en la consistencia de identidad que declara el autor.
- Previsualización de campañas de cosmética: producir bocetos de arte final con distintos looks para validación interna antes de contratar producción fotográfica.
- Contenido para redes sociales: retoque rápido y homogéneo de series de autorretratos o fotos de prescriptores, reduciendo el trabajo manual de ajuste de piel y color.
- Posproducción en flujos ComfyUI existentes: insertar el adaptador como nodo adicional en un grafo que ya use Qwen-Image para retrato, sin cambiar el resto del pipeline.
- Integración en servicios vía API: usar los endpoints de RunningHub para ofrecer retoque cosmético automático a una aplicación de terceros, sin desplegar infraestructura propia de GPU.
- Normalización de catálogos de imagen de personas: homogeneizar el acabado estético de un conjunto de retratos corporativos o de casting manteniendo la autenticidad de la textura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, LPIPS, evaluación de preservación de identidad ni comparativas con otros adaptadores), y la búsqueda web realizada no devolvió material técnico relacionado con el modelo.

## Requisitos de hardware

- VRAM para el adaptador: el fichero LoRA ocupa 564 MiB en disco; en memoria supone una fracción pequeña frente al modelo base, pero no se publica el consumo exacto.
- VRAM total: determinada por Qwen-Image, no por el LoRA. No disponible en la información proporcionada.
- GPU recomendadas: no disponible. Al ser un adaptador de difusión para imagen, el requisito real depende de la GPU capaz de mover el modelo base; no hay datos del autor al respecto.
- Ajuste en GPU de consumo: no confirmado. Solo puede afirmarse que el adaptador en sí es ligero (0,6 GB); la viabilidad en tarjetas de consumo depende del base y de la cuantización que se le aplique.
- Despliegue: ComfyUI y la plataforma/API de RunningHub son las vías documentadas. Otros motores (Diffusers, vLLM, llama.cpp, Ollama, TGI) no están mencionados; llama.cpp/Ollama/TGI no son aplicables a un modelo de difusión de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|---|
| rh-firered-image-edit-makeup (este) | LoRA de edición cosmética sobre Qwen-Image | no disponible (adaptador de 564 MiB) | no aplica | no disponible | Hugging Face, ComfyUI, RunningHub | no disponible |
| Qwen-Image sin adaptador (base) | Modelo de difusión text-to-image | no disponible en la información proporcionada | no aplica | no disponible en la información proporcionada | Requerido para usar este LoRA | no disponible |
| Otros LoRA de maquillaje/beauty para difusión | LoRA text-to-image | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de información sobre adaptadores alternativos comparables (por ejemplo, otros LoRA de belleza para el mismo base) ni de cifras que permitan un enfrentamiento cuantitativo. Cualquier comparación de calidad sería especulativa.

## Limitaciones y advertencias

- Ausencia total de evaluación pública: 0 descargas y 0 likes, sin benchmarks ni ejemplos comparables; el rendimiento estético es una afirmación del autor no verificada.
- Licencia no especificada: la model card remite a la licencia del proyecto original o upstream, lo que impide confirmar si el uso comercial está permitido. Riesgo legal directo en producción.
- Sin datos de entrenamiento: se desconoce la distribución del dataset, por lo que no puede evaluarse el sesgo hacia determinados tonos de piel, morfologías faciales, edades o cánones de belleza. Es previsible un sesgo hacia los estándares estéticos dominantes en los datos usados.
- Riesgo de sobreaplicación del efecto: al ser un LoRA especializado, puede imponer un acabado de maquillaje uniforme y perder la identidad o la textura natural en rostros atípicos, con iluminación extrema o en imágenes de baja resolución.
- Alucinación visual: como todo modelo generativo, puede introducir artefactos en zonas de detalle fino (pelo, dientes, joyas, gafas) o alterar rasgos no solicitados.
- Dependencia del base: la calidad final está condicionada por la variante concreta de Qwen-Image utilizada y por la fuerza (scale) del adaptador; no se documentan valores recomendados.
- Idiomas y prompts: no se declara cobertura lingüística; la model card está en inglés y chino, lo que sugiere prompts en esos idiomas, pero no se confirma el comportamiento en castellano.
- Trazabilidad limitada: el repositorio solo contiene un fichero de pesos; no hay código de ejemplo, configuración de nodo ComfyUI ni ficha de uso detallada.
- Dependencia de plataforma: parte de la documentación y de los enlaces apuntan a RunningHub, lo que puede implicar dependencia de un servicio externo para el flujo completo.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-firered-image-edit-makeup.safetensors-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2029201142994968577
- Página del autor: https://www.runninghub.cn/user-center/1869450346941833217
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Ejemplo de llamada a API (Seedance 2.5): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Nota: la búsqueda web realizada no devolvió enlaces técnicos relacionados con este modelo (los resultados obtenidos no guardaban relación con él), por lo que no se dispone de papers, blogs ni repositorios adicionales que citar.
