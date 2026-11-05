# RunningHubAI/rh-chinese-vintage-light-gauze-lora

## Resumen

`rh-chinese-vintage-light-gauze-lora` es un adaptador LoRA publicado por RunningHubAI para generación de imágenes con temática de retrato de estilo chino antiguo, concretamente para producir retratos con vestimenta de gasa ligera ("qingsha"). No se trata de un modelo de lenguaje ni de un modelo fundacional: es un peso auxiliar que se aplica sobre un modelo base de difusión para modificar el estilo y el contenido de las imágenes generadas.

El adaptador se distribuye como un único archivo `safetensors` de 292 MiB y está pensado para su uso en ComfyUI, en la plataforma RunningHub o en Hugging Face. La model card indica que está afinado a partir de un modelo base denominado "F1基础 D" y que utiliza la palabra de activación `qingsha` para invocar el estilo.

La relevancia de esta ficha es limitada en el contexto de evaluación de modelos de IA: se trata de un artefacto de estilo para difusión, con documentación mínima, sin datos de entrenamiento publicados, sin benchmarks y sin licencia explícita más allá de una remisión genérica a la licencia del proyecto original. Es útil para quien necesite generar retratos de estética china clásica en un pipeline de ComfyUI, pero no aporta capacidades de razonamiento, código o lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusión no especificado; la model card indica "F1基础 D" como origen del fine-tuning |
| Parametros totales | no disponible (el repositorio solo contiene un archivo de pesos LoRA de 292 MiB; no se publica el número de parámetros del adaptador ni del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; el concepto de contexto no aplica) |
| Tipos de cuantizacion | no disponible; se distribuye un único archivo `safetensors` sin variantes cuantizadas |
| Idiomas soportados | no disponible (el modelo opera sobre prompts de texto; la model card ofrece ejemplos en inglés y en chino, pero no declara idiomas soportados) |
| Licencia | no disponible; la model card indica "Published by RunningHub on behalf of the author. Copyright remains with the author. Follow the original project or upstream license." |
| Formato de pesos | safetensors (`qingsha flux-lora-000004.safetensors`, 292 MiB) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del adaptador más allá de su naturaleza LoRA. El nombre del archivo (`qingsha flux-lora-000004.safetensors`) sugiere una LoRA asociada a un modelo de la familia Flux, mientras que la model card indica "Finetuned from: F1基础 D", lo que no permite determinar con certeza el modelo base exacto. No se publican detalles sobre el rango de la descomposición LoRA, las capas objetivo, el número de pasos de entrenamiento, el dataset utilizado ni si hubo técnicas de regularización o aumento de datos.

Tampoco se documentan innovaciones técnicas: no hay mención a decodificación especulativa, atención lineal ni mecanismos híbridos, lo cual es coherente con un adaptador de estilo para difusión. La única información operativa es la palabra de activación `qingsha`, que debe incluirse en el prompt para activar el estilo, y un prompt de referencia en la model card que describe un retrato frontal de cuerpo completo de una mujer china con vestido fluorescente, fondo simple, fotorrealista y 8K.

## Capacidades

- Generación de retratos de estética china clásica con vestimenta de gasa ligera, activada mediante la palabra `qingsha`.
- Modificación de estilo sobre el modelo base de difusión: el adaptador condiciona la apariencia de la ropa, la iluminación y la composición hacia un look "vintage" chino.
- Compatibilidad con prompts de texto en inglés y chino, según los ejemplos de la model card.
- Integración en flujos de ComfyUI y en la plataforma RunningHub, incluyendo el uso mediante API.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código ni visión más allá de la generación de imágenes propia del modelo base.
- No dispone de modo "thinking" ni capacidades de audio.

## Casos de uso

- Generación de retratos para ilustración editorial: usar el adaptador en ComfyUI con el prompt `qingsha, ...` para producir retratos de cuerpo completo con vestimenta de gasa ligera, aprovechando el estilo preentrenado para reducir la iteración de prompting.
- Creación de material para moda y e-commerce de estética tradicional china: generar catálogos o fichas de producto con modelos vestidas con gasa ligera, manteniendo coherencia visual entre imágenes mediante el mismo adaptador y seed.
- Producción de contenido para redes sociales: generar imágenes de personajes históricos o de fantasía con un estilo consistente, útil para cuentas temáticas de cultura china.
- Previsualización de conceptos para videojuegos o animación: generar referencias visuales de personajes con vestuario de gasa antes de modelado 3D o ilustración final.
- Personalización de workflows en RunningHub: el adaptador puede encadenarse con otros nodos de ComfyUI (upscaling, controlnet, inpainting) para flujos de producción de imágenes en lote.
- Experimentación artística y educativa: estudiar cómo una LoRA de estilo modifica la distribución del modelo base, comparando salidas con y sin la palabra de activación.
- Integración vía API de RunningHub: automatizar la generación de retratos dentro de una aplicación o pipeline propio usando el endpoint documentado por la plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador en sí; el consumo vendrá determinado por el modelo base de difusión sobre el que se aplique. Un archivo LoRA de 292 MiB se carga en memoria junto con el modelo base, por lo que el requisito dominante es el del modelo base.
- GPU recomendadas: no disponibles en la información proporcionada. Al tratarse de un adaptador para un modelo de difusión, el requisito real depende del modelo base; no se especifica ninguno.
- Compatibilidad con GPU de consumo: no disponible; no se indica si el modelo base cabe en tarjetas como RTX 4090, RTX 3090 o RTX 4060 Ti.
- Opciones de despliegue: ComfyUI (mencionado explícitamente), plataforma RunningHub (web y API) y Hugging Face como repositorio de pesos. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un adaptador de difusión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros adaptadores LoRA comparables ni datos de rendimiento que permitan una comparación rigurosa. Como referencia estructural, podría compararse con otras LoRA de estilo publicadas en RunningHub o en Hugging Face, pero no se dispone de sus especificaciones en esta ficha.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-chinese-vintage-light-gauze-lora | LoRA para difusión | no disponible | no aplica | no disponible | Hugging Face, RunningHub, ComfyUI |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Documentación mínima: la model card no especifica el modelo base exacto ("F1基础 D" no es un identificador estándar), lo que dificulta reproducir el entorno de inferencia.
- Licencia ambigua: no se declara una licencia concreta; se remite a la licencia del proyecto original, lo que impide confirmar si el uso comercial está permitido.
- Riesgo de sesgos: al ser un adaptador de estilo para retratos de estética china, puede reproducir sesgos de representación del dataset de entrenamiento (tono de piel, complexión, género), aunque no se documentan.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir anatomías incorrectas, manos deformes o incoherencias en el vestuario, especialmente en cuerpos completos.
- Dependencia de la palabra de activación: sin `qingsha` en el prompt el efecto del adaptador puede ser nulo o residual; la fuerza del LoRA no se documenta.
- Sin garantías de calidad ni benchmarks: no hay métricas objetivas (FID, CLIP score, etc.) que permitan evaluar su rendimiento frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Contenido promocional en la model card (enlaces de invitación, número de contacto, servicios de personalización) que no debe interpretarse como documentación técnica.
- Fecha de creación indicada como 2026-11-05, posterior a la fecha habitual de consulta; conviene verificar la integridad y vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-chinese-vintage-light-gauze-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1928660808304332801
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1913519461180006401
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-chinese-vintage-light-gauze-lora/blob/main/README_cn.md
