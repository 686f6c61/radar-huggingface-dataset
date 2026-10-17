# RunningHubAI/rh-modelo100v2-lora

## Resumen

`rh-modelo100v2-lora` es un adaptador LoRA de edición de imágenes publicado por RunningHub (plataforma de creación de contenidos basada en ComfyUI) en nombre del autor identificado como Henrique. No es un modelo fundacional: es un conjunto de pesos de 448 MiB en formato `safetensors` que se aplica sobre un modelo base de generación/edición de imagen, declarado en la model card como "krea2". El pipeline etiquetado es `image-text-to-image`, es decir, edición o generación condicionada por texto e imagen de entrada.

El interés práctico del artefacto es acotado y muy específico: se distribuye como complemento para cargarse en ComfyUI, en la propia plataforma RunningHub o desde Hugging Face, y su función declarada es la edición de imágenes ("LoRA (image edit)"). No se documentan datos de entrenamiento, número de pasos, dataset, resolución nativa, triggers ni parámetros de inferencia recomendados, lo que limita seriamente su reproducibilidad fuera del ecosistema del autor.

La información pública disponible es mínima: cero descargas y cero "likes" en el momento de la ficha, licencia no explicitada (la model card remite a la licencia del proyecto original o "upstream"), idiomas no declarados y ninguna evaluación cuantitativa. Cualquier uso en producción exige verificar primero la licencia del modelo base y validar el adaptador empíricamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Adaptador LoRA (edición de imagen) sobre un modelo base declarado como "krea2"; no se especifica la arquitectura del base (presumiblemente transformer de difusión de flujo rectificado, dato no confirmado en la información proporcionada) |
| Parámetros totales | No disponible. El adaptador pesa 448 MiB (≈ 448 MB en un único `safetensors`); el número de parámetros del LoRA no se declara y el del modelo base tampoco |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible. Al ser un modelo de imagen, la "ventana" relevante es la longitud máxima de prompt aceptada por el modelo base, que no se documenta |
| Tipos de cuantización | No disponible. El adaptador se distribuye en precisión completa (fp16/bf16 presumiblemente, no declarado); las cuantizaciones aplicables dependen de las que soporte el modelo base |
| Idiomas soportados | No disponible (los prompts en lenguaje natural dependen del codificador de texto del modelo base) |
| Licencia | No disponible. La model card indica: "Published by RunningHub on behalf of the author. Copyright remains with the author. Follow the original project or upstream license" |
| Formato de pesos | `safetensors` (archivo único `MODELO100v2.safetensors`, 448 MiB) |
| Tipo de artefacto | LoRA / adaptador de edición de imagen (no es un modelo autónomo) |
| Modelo base | "krea2" (versión, checkpoint exacto y repositorio no especificados) |
| Pipeline declarado | `image-text-to-image` |
| Compatibilidad declarada | ComfyUI, RunningHub, Hugging Face |
| Tamaño del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 (en el momento de la consulta) |
| Fecha de creación (metadatos HF) | 2026-10-17 |

## Arquitectura y entrenamiento

No se publica información sobre la arquitectura interna del adaptador ni del modelo base más allá de la etiqueta "krea2". Por el pipeline asignado (`image-text-to-image`) y por el tag `lora`, se trata de un conjunto de matrices de bajo rango inyectadas en las capas de atención (y previsiblemente en las capas de proyección) de un modelo generativo de imagen condicionado por texto e imagen, siguiendo el esquema estándar de LoRA para modelos de difusión. El único dato verificable es el tamaño del archivo: 448 MiB, un orden de magnitud habitual para un LoRA de rango medio sobre un transformer de difusión de gran tamaño.

Tampoco hay información sobre el proceso de entrenamiento: se desconoce el número de imágenes, la resolución, el número de pasos, el rango del adaptador, el optimizador, si hubo regularización o si se aplicaron técnicas de refuerzo (RLHF/DPO no aplican en este dominio). No se documentan triggers, pesos recomendados ni parámetros de muestreo (CFG, steps, scheduler), lo que impide reproducir el comportamiento pretendido por el autor sin acceso a la página del modelo en RunningHub.

## Capacidades

- Edición de imágenes guiada por instrucciones textuales (pipeline `image-text-to-image`), según la etiqueta declarada por el autor.
- Aplicación como parche LoRA sobre el modelo base "krea2"; no funciona de forma aislada.
- Integración directa en flujos de trabajo de ComfyUI (tag `comfyui`).
- Carga y ejecución en la plataforma RunningHub, incluido su catálogo público de modelos.
- Distribución como archivo `safetensors` único, apto para cargadores estándar de LoRA.
- Capacidades de tool calling, agentes, razonamiento multi-paso, visión analítica, audio o modo "thinking": no aplica / no disponible (es un modelo de generación de imagen, no un LLM).
- Capacidades multilingües: no disponibles; dependen exclusivamente del codificador de texto del modelo base y no se documentan.

## Casos de uso

- Retoque de producto en catálogo de comercio electrónico: aplicar el LoRA para modificar atributos visuales (color, acabado, fondo) de fotografías ya existentes, manteniendo la composición original, dentro de un grafo de ComfyUI con entrada imagen + prompt.
- Sustitución o generación de fondos en fotografía comercial: usar el pipeline `image-text-to-image` para recomponer el entorno de una imagen de estudio sin reencuadrar el sujeto, siempre que el modelo base conserve la identidad del objeto.
- Prototipado creativo en agencias: generar variaciones de una misma imagen de referencia para presentar opciones a cliente en cuestión de minutos, aprovechando que el adaptador se carga junto al base sin reentrenar.
- Limpieza y homogeneización de datasets visuales: normalizar iluminación o fondo de imágenes de entrenamiento antes de usarlas en otros pipelines, reduciendo trabajo manual de retoque.
- Automatización de contenido vía API: desplegar el flujo en RunningHub y llamarlo desde su API HTTP para producir variantes de imagen dentro de un pipeline de publicación programada (por ejemplo, campañas con múltiples formatos).
- Exploración de estilo/identidad visual: cargar el LoRA como capa de estilo sobre el base para evaluar si encaja con una guía de marca, comparando resultados con y sin adaptador a peso fijo.
- Pruebas A/B de creatividades: generar dos o más versiones editadas de una misma pieza y medirlas en campaña, dado el bajo coste de almacenamiento del adaptador (448 MiB) frente a un fine-tuning completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, SSIM, LPIPS ni evaluaciones humanas), ni comparaciones cuantitativas con otros adaptadores, ni curvas de convergencia del entrenamiento.

## Requisitos de hardware

- VRAM del adaptador: 448 MiB en disco; en memoria, el coste del LoRA es marginal frente al del modelo base.
- VRAM total: determinada casi íntegramente por el modelo base "krea2", cuyas especificaciones no se publican. Como referencia orientativa —no confirmada para este repositorio—, un transformer de difusión de la familia Krea/FLUX (~12 000 M de parámetros) requiere del orden de 24 GB en bf16, ~12 GB en fp8 y ~7-8 GB en cuantizaciones GGUF de 4 bits.
- GPU recomendadas: no disponibles para este adaptador concreto. Para un base de ese orden de magnitud, el rango habitual es A100 40/80 GB o H100 para lotes grandes, y RTX 4090 (24 GB) para inferencia unitaria con cuantización.
- ¿Cabe en GPU de consumo? No confirmado. Depende del base: con cuantización agresiva podría ejecutarse en GPUs de 8-12 GB; en bf16, probablemente no por debajo de 24 GB.
- Opciones de despliegue: ComfyUI (soporte nativo declarado), plataforma RunningHub y su API HTTP. Para el base, los runners habituales serían `diffusers`, ComfyUI o `stable-diffusion.cpp`/GGUF; no se documenta compatibilidad con vLLM ni TGI (no aplican a difusión).
- Latencia y throughput: no disponibles. No se publican tiempos por imagen, número de pasos recomendado ni resolución de trabajo.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Tamaño del artefacto | Licencia | Contexto / prompt | Disponibilidad |
|---|---|---|---|---|---|---|
| `RunningHubAI/rh-modelo100v2-lora` | LoRA de edición de imagen | "krea2" | 448 MiB | No disponible (remite al upstream) | No disponible | Hugging Face + RunningHub |
| `RunningHubAI/rh-lora10-lora` | LoRA text-to-image | No disponible | No disponible | No disponible | No disponible | Hugging Face |
| `RunningHubAI/rh-lora-2078473723922305026` | LoRA image-text-to-image | No disponible | No disponible | No disponible | No disponible | Hugging Face |

No se dispone de datos objetivos (parámetros, benchmarks, licencia) de las alternativas como para establecer una comparación cuantitativa. La comparación relevante es de tipo operativo: los tres artefactos son adaptadores LoRA del mismo publicador, distribuidos en el mismo formato y con la misma opacidad documental; la diferencia declarada es la tarea (edición de imagen frente a generación desde texto).

## Limitaciones y advertencias

- Información documental mínima: sin dataset, sin hiperparámetros, sin triggers ni parámetros de inferencia recomendados; la reproducibilidad fuera de RunningHub no está garantizada.
- Licencia no explicitada: la model card remite a la licencia del modelo base y del proyecto original. Antes de cualquier uso comercial es obligatorio verificar la licencia de "krea2", que puede ser restrictiva.
- Dependencia total del modelo base: sin el checkpoint correcto y su versión exacta, el adaptador puede producir resultados degradados o directamente no cargar.
- Riesgo de alucinación visual: como todo modelo generativo de imagen, puede introducir elementos no solicitados, deformar texto dentro de la imagen, alterar identidad facial o producir artefactos en manos y estructuras finas.
- Sesgos: no evaluados. Al no documentarse el dataset de entrenamiento, no es posible caracterizar sesgos demográficos, culturales o de estilo.
- Idiomas: no declarados; los prompts en castellano pueden rendir peor que en inglés si el codificador de texto del base está sesgado hacia ese idioma.
- Sin métricas ni validación de terceros: cero descargas y cero interacciones en el repositorio, sin evidencia independiente de calidad.
- Fecha de metadatos anómala (2026-10-17) en el repositorio: conviene verificar la vigencia y el histórico de actualizaciones antes de fijar una versión en producción.
- Ausencia de control de versiones semántico: al ser un archivo único sin hash publicado en la ficha, se recomienda fijar el commit exacto del repositorio en cualquier pipeline de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-modelo100v2-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-modelo100v2-lora/blob/main/README_cn.md
- Página original del modelo en RunningHub: https://www.runninghub.ai/model/public/2101138522493558785
- Página del autor: https://www.runninghub.ai/user-center/2015535265380306946
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Catálogo de modelos de RunningHub: https://www.runninghub.ai/models
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Ejemplo de llamada a la API (Seedance 2.5): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Repositorio hermano `rh-lora10-lora`: https://huggingface.co/RunningHubAI/rh-lora10-lora
- Repositorio hermano `rh-lora-2078473723922305026`: https://huggingface.co/RunningHubAI/rh-lora-2078473723922305026
