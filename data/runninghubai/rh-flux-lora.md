# RunningHubAI/rh-flux-lora

## Resumen

rh-flux-lora es un adaptador LoRA publicado por RunningHubAI, la cuenta de la plataforma RunningHub, para modelos de difusión de la familia FLUX. El repositorio contiene un único archivo de pesos, `Flux-极致人物修复_肤质修复+手部修复_V2.0.safetensors`, de 475 MiB, cuyo nombre indica que el adaptador está especializado en la reparación de figuras humanas, concretamente en el acabado de la piel y en la corrección de manos, dos de los puntos débiles más habituales al generar personas con modelos de difusión.

El adaptador está pensado para cargarse sobre el modelo base declarado como «F1基础 D» dentro de ComfyUI, RunningHub o Hugging Face, con un peso recomendado de 0,8 y un CFG de 3,5. No es un modelo de lenguaje ni un modelo completo: se trata de pesos delta que se aplican sobre un checkpoint base ya existente, por lo que su comportamiento final depende tanto del base como del resto del pipeline (sampler, scheduler, prompts y refinadores).

La relevancia de esta ficha es limitada pero concreta: el repositorio no declara licencia propia, no incluye pipeline, idiomas, benchmarks ni documentación de entrenamiento, y acumula cero descargas en el momento de la consulta. Resulta útil como referencia de un LoRA de retoque dentro del ecosistema RunningHub, pero cualquier uso en producción exige verificar antes la licencia del modelo base y la del propio adaptador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión de la familia FLUX; el autor declara el base «F1基础 D» |
| Parámetros totales | No disponible. El archivo pesa 475 MiB; a 16 bits por parámetro equivaldría a un orden de magnitud de ~2,5 × 10^8 parámetros, estimación a partir del tamaño del archivo y no confirmada por el autor |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica ni disponible: es un adaptador de generación de imágenes y no se documenta la longitud máxima de prompt del modelo base |
| Tipos de cuantización | No documentados. Se distribuye en safetensors; la cuantización aplicable es la del modelo base (fp8, GGUF, etc.) |
| Idiomas soportados | No disponible |
| Licencia | No disponible. La model card indica que se publica en nombre del autor, que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (un único archivo de 475 MiB) |
| Tipo de modelo | LoRA para generación y retoque de imágenes |
| Modelo base declarado | «F1基础 D» (presumiblemente un checkpoint de la familia FLUX; versión exacta no especificada) |
| Tamaño del repositorio | 0,5 GB |
| Peso recomendado | 0,8 |
| CFG recomendado | 3,5 |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Autor | RunningHub-@haha |
| Fecha de publicación | 2026-10-02 (alta) / 2026-10-02 (última actualización) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se suman a las proyecciones del modelo base durante la inferencia. El archivo entregado es único y su nombre sugiere un entrenamiento orientado a dos tareas concretas de restauración de figura humana: textura de piel y anatomía de manos, en su versión 2.0. No se publica información sobre el rango del LoRA, las capas objetivo, el número de pasos de entrenamiento, el dataset utilizado ni el método de ajuste (DreamBooth, fine-tuning supervisado, LoRA estándar o variantes como LoKr/LoHa).

Tampoco se documenta ninguna innovación técnica adicional: no hay decodificación especulativa, atención lineal ni componentes híbridos, conceptos que pertenecen a modelos de lenguaje y no aplican aquí. Los únicos hiperparámetros declarados son los de inferencia (peso 0,8 y CFG 3,5), que corresponden a los valores con los que el autor recomienda aplicar el adaptador y no a parámetros de entrenamiento.

## Capacidades

- Aplicación sobre un modelo base de difusión para generar imágenes, heredando las capacidades de text-to-image del base (composición, iluminación, estilo).
- Reparación de piel y acabado de texturas faciales o corporales, según el nombre del archivo de pesos.
- Corrección de manos y dedos, el fallo anatómico más frecuente en modelos de difusión de personas.
- Integración como nodo de carga de LoRA en ComfyUI (`LoraLoader`) o mediante el cargador equivalente de otras interfaces.
- Ejecución en la plataforma RunningHub, tanto en la interfaz web como a través de su API.
- Ajuste fino del efecto mediante el peso del adaptador (valor recomendado 0,8) y el CFG (valor recomendado 3,5).
- No dispone de tool calling, function calling, razonamiento multi-paso, agentes, modo thinking, visión de entrada ni audio: no es un modelo de lenguaje ni un modelo multimodal de comprensión.

## Casos de uso

- Retoque de retratos generados con IA: se aplica el LoRA durante la generación de la imagen para obtener piel con textura más coherente y manos correctas, evitando la fase de retoque manual posterior.
- Corrección de manos en ilustración y contenido editorial: al generar figuras humanas en planos con manos visibles (gestos, objetos sostenidos), el adaptador reduce la necesidad de inpaintings posteriores.
- Material para comercio electrónico y moda: sesiones sintéticas de producto con modelos humanos donde la plausibilidad de la piel y de las manos sostiene la credibilidad de la ficha de producto.
- Post-procesado por lotes en ComfyUI: con el peso fijado en 0,8 y CFG 3,5, el LoRA se inserta en un grafo reutilizable para procesar colas de imágenes sin intervención manual.
- Automatización mediante la API de RunningHub: la plataforma expone endpoints para invocar flujos de generación, de modo que el adaptador puede integrarse en un pipeline de producción de imágenes bajo demanda.
- Mejora de fotografías de personas de baja calidad o restauración de material antiguo: siempre que se use como adaptador sobre el modelo base y se valide el resultado, ya que no hay documentación que garantice este uso fuera del dominio de entrenamiento.
- Exploración creativa y maquetas para estudios de fotografía: generación rápida de referencias con anatomía creíble antes de una sesión real.
- Creación de assets para videojuegos o cómics con personajes humanos recurrentes: el LoRA ayuda a mantener manos y piel consistentes entre iteraciones, aunque la consistencia de identidad depende del base y de otras técnicas (IP-Adapter, referencias).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, SSIM, evaluaciones de preferencia humana) ni comparaciones con otros adaptadores de retoque. Los únicos valores numéricos documentados son los de inferencia: peso 0,8 y CFG 3,5.

## Requisitos de hardware

- El consumo de VRAM lo determina el modelo base, no el LoRA: el adaptador solo añade 475 MiB de pesos que se cargan en memoria y se combinan con el base.
- Asumiendo un base de la familia FLUX de ~12 000 millones de parámetros, la inferencia en fp16 requiere del orden de 24 GB de VRAM; en fp8 baja aproximadamente a 12-16 GB; con cuantizaciones GGUF de 4-8 bits puede situarse en la franja de 6-10 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB) o H100 para despliegues con concurrencia y fp16; RTX 4090 (24 GB) para fp16 en un solo usuario; RTX 4080/4070 Ti Super (16 GB) para fp8; RTX 3060 12 GB o superiores para cuantizaciones GGUF agresivas.
- Cabe en GPU de consumo siempre que se ajuste la cuantización del base; en 8 GB o menos conviene recurrir a GGUF Q4/Q5 y a la descarga por bloques a RAM.
- Opciones de despliegue: ComfyUI con `LoraLoader`, RunningHub (web o API), Hugging Face con `diffusers` (`load_lora_weights`), y servidores de difusión compatibles con adaptadores LoRA en formato safetensors. No se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI, que son motores de modelos de lenguaje y no aplican a este artefacto.
- Latencia y throughput: no disponibles. Dependen por completo del base, de la GPU, de los pasos de muestreo y de la resolución.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-flux-lora | LoRA sobre base FLUX | No disponible (archivo de 475 MiB) | No aplica | No disponible; se remite al proyecto original | Hugging Face, ComfyUI, RunningHub; 0 descargas |
| Modelo base declarado «F1基础 D» | Modelo de difusión completo | No disponible | No disponible | No disponible | No especificado en la ficha |
| FLUX.1-dev (base de referencia de la familia) | Modelo de difusión completo | ~12 000 millones (referencia pública) | No aplica (prompt de texto) | Licencia no comercial de FLUX.1 [dev] | Hugging Face, diffusers, ComfyUI |
| Otros LoRA de retoque de piel y manos | LoRA | No disponible | No aplica | Variable según autor | Repositorios de la comunidad; sin datos comparativos publicados |

No se dispone de resultados de benchmarks ni de evaluaciones comparativas que permitan establecer una comparación cuantitativa con alternativas de la misma categoría. La equivalencia entre el base declarado («F1基础 D») y FLUX.1-dev es una hipótesis razonable por la nomenclatura, no un dato confirmado por el autor.

## Limitaciones y advertencias

- No se declara licencia del adaptador: el texto remite a la licencia del proyecto original o del upstream. Antes de cualquier uso comercial hay que verificar la licencia del modelo base, que en el caso de las variantes no comerciales de FLUX prohíbe la explotación comercial.
- No hay información sobre el dataset de entrenamiento, por lo que no se pueden evaluar sesgos de representación (etnia, edad, tono de piel, género) ni riesgos de sobreajuste a un estilo o tipo de rostro concreto.
- El resultado depende críticamente del modelo base: aplicar el LoRA sobre un checkpoint distinto de «F1基础 D» puede degradar la salida o producir artefactos.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, dedos extra o texturas irreales, especialmente si se usan pesos distintos del 0,8 recomendado o prompts ambiguos.
- Los valores de peso y CFG recomendados son los únicos hiperparámetros publicados; no hay guía sobre resolución, sampler, scheduler ni pasos de muestreo.
- No hay soporte ni garantía de mantenimiento: el repositorio tiene cero descargas y cero likes, y la última actualización coincide con la fecha de alta.
- El nombre del archivo incluye caracteres chinos y espacios, lo que puede provocar problemas en scripts, rutas y sistemas de ficheros poco tolerantes.
- No hay benchmarks ni evaluaciones de calidad publicadas, de modo que cualquier afirmación sobre su rendimiento frente a otros LoRA de retoque carece de respaldo documental.
- Al integrarse vía API de RunningHub, conviene revisar las condiciones de servicio y los límites de uso de la plataforma, que son independientes de los del modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-flux-lora
- README en chino (relativo al repositorio): README_cn.md
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/1958489274133987330
- Página del autor: https://www.runninghub.cn/user-center/1892822133263990786
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de la API para Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Otro LoRA del mismo autor (base Qwen-Image): https://huggingface.co/RunningHubAI/rh-qwen-image2.1-lora
- Listado de modelos LoRA en Hugging Face: https://huggingface.co/models?sort=modified&search=lora
- Vídeo sobre edición de vídeo con LTX 2.5 en RunningHub: https://www.youtube.com/watch?v=FrVVLxksEbU
