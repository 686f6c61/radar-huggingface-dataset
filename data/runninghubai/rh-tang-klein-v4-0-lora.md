# RunningHubAI/rh-tang-klein-v4.0-lora

## Resumen

rh-tang-klein-v4.0-lora es un adaptador LoRA de bajo rango para generación de imágenes (pipeline text-to-image) publicado por RunningHubAI en nombre del autor «老唐» (Lao Tang). El adaptador está afinado a partir de Flux2-Klein-9B, un modelo de difusión de 9 000 millones de parámetros según la denominación que aparece en la propia model card, y su propósito declarado es la generación de planos de diseño urbano («城市设计平面», plano de diseño urbano / planta general de urbanismo). El repositorio contiene un único archivo de pesos de 332 MiB en formato safetensors.

El interés de esta ficha no está en la arquitectura —no hay innovación técnica propia: es un LoRA de un solo estilo— sino en su uso práctico dentro de ComfyUI y de la plataforma RunningHub. La versión 4.0 introduce una particularidad relevante: según el autor, «no necesita prompt», es decir, está entrenada para producir el tipo de plano de forma casi automática a partir de la imagen o el condicionamiento mínimo, lo que la orienta a la generación de variaciones de trazado urbanístico más que a un control fino por lenguaje natural.

El modelo tiene 0 descargas y 0 «likes» en el momento de la consulta, no incluye resultados de evaluación y su licencia no está especificada, lo que lo convierte en un artefacto de nicho, útil como referencia de estilo, pero sin validación comunitaria ni garantías legales claras para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión basado en transformer; modelo base: Flux2-Klein-9B. Detalle interno del transformer base no disponible |
| Parámetros totales | No disponible para el adaptador; el modelo base se denomina «9B» (9 000 millones) en la model card, sin desglose publicado |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Al ser text-to-image, el equivalente sería la longitud máxima del prompt y la resolución de salida, no documentadas |
| Tipos de cuantización | El adaptador se distribuye únicamente en safetensors (332 MiB). No se publican versiones fp8, GGUF ni NF4 del adaptador |
| Idiomas soportados | No disponible. La model card está en chino e inglés; el comportamiento multilingüe del condicionamiento de texto no se documenta |
| Licencia | No disponible. La card indica «Follow the original project or upstream license» y que los derechos permanecen en el autor, sin especificar la licencia del modelo base ni la del adaptador |
| Formato de pesos | safetensors (`tang-城市设计平面-klein-v4.0.safetensors`, 332 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA estándar: un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Flux2-Klein-9B para especializar su distribución de salida hacia un dominio visual concreto (plantas generales de diseño urbano). El repositorio no detalla ni el rango del adaptador, ni las capas objetivo, ni el learning rate, ni el número de pasos de entrenamiento; solo se indica que el entrenamiento se realizó en la plataforma RunningHub, que ofrece servicios de fine-tuning sobre modelos de imagen.

No hay información sobre el conjunto de datos (número de imágenes, procedencia, si son planos reales de estudios de urbanismo o renders sintéticos), ni sobre procesos de refinamiento posteriores (RLHF/DPO no aplican en este caso; se desconoce si hubo curaduría manual). Tampoco se documenta el pipeline de inferencia recomendado, salvo la referencia genérica a ComfyUI y a RunningHub. La afirmación del autor de que la versión 4.0 «no necesita prompt» sugiere un entrenamiento orientado a que el estilo se active con un condicionamiento mínimo, pero no se especifica si existe una palabra de activación ni qué parámetros de muestreo (CFG, steps, scheduler) se esperan.

## Capacidades

- Generación de imágenes de planos de diseño urbano: plantas generales, trazados de manzanas, bloques y viales en estilo de plano técnico.
- Funcionamiento con condicionamiento mínimo: según el autor, la versión 4.0 no requiere prompt para producir el tipo de imagen objetivo.
- Integración en flujos ComfyUI: etiquetado explícitamente como `comfyui` y `lora`, por lo que se carga como adaptador en un grafo de nodos.
- Generación de variaciones sobre un mismo esquema: útil para explorar alternativas de trazado manteniendo el lenguaje gráfico.
- Uso en la nube: disponible para su ejecución en RunningHub sin infraestructura propia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo de imagen, no un LLM.
- No se documentan capacidades de visión (image-to-image, control por boceto, inpainting) ni de audio; si el modelo base las soporta, el adaptador no las declara.

## Casos de uso

- Exploración de variantes de trazado en estudios de urbanismo: cargar el LoRA sobre Flux2-Klein-9B en ComfyUI y generar decenas de plantas generales del mismo solar para comparar esquemas de ocupación antes de modelar en CAD.
- Documentación preliminar para concursos y anteproyectos: producir imágenes de planta con estética de plano técnico que sirvan como base gráfica de memorias y paneles, sustituyendo el trabajo manual de estilizado.
- Comunicación con clientes no técnicos: generar plantas legibles de una promoción inmobiliaria en fase de idea, antes de disponer de levantamiento topográfico o de un modelo BIM.
- Docencia de diseño urbano: usar el adaptador como generador de ejemplos de morfología urbana (manzana cerrada, bloques abiertos, trama ortogonal) para ilustrar conceptos en clase con variaciones rápidas.
- Pruebas de concepto en pipelines generativos: evaluar la integración de un LoRA de dominio específico en un grafo ComfyUI antes de invertir en un fine-tuning propio con datos de estudio.
- Previsualización en herramientas de marketing inmobiliario: obtener imágenes de «plano de conjunto» de un desarrollo residencial para webs o presentaciones, siempre que se validen después con documentación técnica real.
- Filtrado y curación de datasets internos: usar las salidas como referencia estilística para etiquetar o aumentar un conjunto de planos propio antes de entrenar un modelo más controlable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No existen métricas objetivas (FID, CLIP score, precisión de trazado) ni comparaciones cuantitativas con otros LoRA de la misma categoría. Cualquier valoración de calidad debe hacerse por inspección visual de las salidas en ComfyUI o RunningHub.

## Requisitos de hardware

- VRAM del adaptador: 332 MiB en disco; en memoria, la sobrecarga del LoRA es marginal frente al modelo base.
- VRAM del conjunto: depende íntegramente de Flux2-Klein-9B y de su codificador de texto, cuyos requisitos no se documentan en la información proporcionada. Estimación orientativa para un modelo de difusión de ~9B parámetros: ~20-24 GB en fp16, ~12-16 GB en fp8 y ~8-10 GB en cuantizaciones GGUF de 4 bits, sin contar el codificador de texto ni las activaciones (cifras estimadas, no verificadas para este modelo concreto).
- GPU de consumo: previsiblemente viable en RTX 4090 / RTX 3090 (24 GB) en fp16 y en GPUs de 16 GB con cuantización; en 8-12 GB requeriría GGUF agresivo y offloading. No confirmado por el autor.
- Despliegue: ComfyUI es la vía declarada (tags `comfyui`, `lora`); RunningHub ofrece ejecución en la nube como alternativa sin hardware local. El uso con diffusers/PEFT sería el mecanismo habitual para adaptadores LoRA, pero no está documentado para este repositorio.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen, resolución de entrenamiento ni número de pasos recomendado.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-tang-klein-v4.0-lora | LoRA text-to-image sobre Flux2-Klein-9B | Adaptador de 332 MiB; base 9B | No disponible | No disponible | Hugging Face + RunningHub |
| Flux2-Klein-9B (modelo base) | Modelo de difusión text-to-image | 9B (según denominación) | No disponible en la información proporcionada | No disponible en la información proporcionada | Referenciado como origen del fine-tuning |
| rh-4.0-lora (RunningHubAI) | LoRA text-to-image, mismo publicador | No disponible | No disponible | No disponible | Hugging Face |

No se dispone de datos de rendimiento ni de licencia de las alternativas, por lo que la comparación se limita a tipo de artefacto y disponibilidad. No se identifican en la búsqueda otros LoRA públicos especializados en planos de diseño urbano con los que comparar cuantitativamente.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado para un único dominio visual (plantas de diseño urbano). Fuera de ese estilo, su efecto sobre el modelo base es impredecible.
- La afirmación «no necesita prompt» implica poca controllabilidad: si el estilo se activa sin condicionamiento, resulta difícil dirigir el resultado hacia un solar, una densidad o una trama concretas.
- No hay palabra de activación documentada, ni parámetros de muestreo recomendados (CFG, steps, scheduler), lo que complica reproducir los resultados del autor.
- Entrenamiento opaco: sin datos sobre el dataset, existe riesgo de que el adaptador reproduzca sesgos de los planos de origen (tipologías residenciales concretas, tramas ortogonales, ausencia de tejido informal) y de que memorice elementos de imágenes de entrenamiento.
- Riesgo de alucinación visual: las salidas son plausibles pero no son planos técnicamente válidos; no deben usarse como documentación de proyecto sin revisión profesional.
- Idiomas: no se documenta el comportamiento del condicionamiento en castellano; la card está en chino e inglés y no se especifica si el prompt afecta al resultado.
- Licencia no disponible: la card remite a la licencia del proyecto original sin identificarla. Antes de un uso comercial es imprescindible verificar la licencia de Flux2-Klein-9B y contactar con el autor (la card indica un contacto por QQ: 181085794).
- Validación comunitaria nula: 0 descargas y 0 «likes» en el momento de la consulta; no hay issues, demos ni ejemplos de terceros que confirmen la calidad.
- Metadatos anómalos: el repositorio figura como creado y actualizado el 2026-10-27, fecha posterior a la consulta; conviene tratar las marcas temporales con cautela.
- Dependencia de la plataforma: parte de la documentación y del flujo de uso está orientada a RunningHub, lo que puede limitar la portabilidad a otros entornos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-tang-klein-v4.0-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-tang-klein-v4.0-lora/blob/main/README_cn.md
- Página del modelo en RunningHub (internacional): https://www.runninghub.ai/model/public/2046223602781003778
- Página del modelo en RunningHub (China): https://www.runninghub.cn/model/public/2046223602781003778
- Página del autor (老唐): https://www.runninghub.cn/user-center/1906623725523906562
- Plataforma RunningHub: https://www.runninghub.ai
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- LoRA relacionado del mismo publicador: https://huggingface.co/RunningHubAI/rh-4.0-lora
