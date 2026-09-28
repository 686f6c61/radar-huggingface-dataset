# RunningHubAI/rh-footjob-lora

## Resumen

rh-footjob-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI en Hugging Face. Según la model card, se trata de un LoRA de tipo "image edit" afinado a partir de una base identificada únicamente como "krea2", distribuido en un único fichero safetensors de 218 MiB (KREA2_F00TJ0B_v1.safetensors). El repositorio tiene un tamaño total de 0,2 GB y está etiquetado con los tags comfyui, lora, image-text-to-image y region:us.

El adaptador se publica desde la plataforma RunningHub en nombre del autor original (usuario @氛围感) y remite a una ficha en Civitai como origen del modelo. Está pensado para cargarse sobre el modelo base en ComfyUI, en la propia plataforma RunningHub o mediante su API; no es un modelo autónomo, sino un complemento que modifica el comportamiento del modelo base sobre el que se aplica.

La relevancia de esta ficha es limitada desde el punto de vista técnico: no se documentan parámetros, arquitectura de la base, dataset de entrenamiento, rangos del LoRA, ni resultados de benchmarks. Además, el nombre del modelo y su origen apuntan a contenido para adultos, lo que condiciona su licencia, su uso comercial y su despliegue en producción. Con 0 descargas y 0 "likes" en el momento de la consulta, tampoco existe validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA de edición de imagen; el autor cita "krea2" como modelo base sin detallar arquitectura) |
| Parametros totales | no disponible (no se documenta el número de parámetros del LoRA ni de la base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica directamente; la entrada es un prompt de texto y/o una imagen de referencia, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors y la cuantización dependerá del runtime que cargue la base (no documentada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que los derechos permanecen en el autor y que se debe seguir la licencia del proyecto original o del upstream) |
| Formato de pesos | safetensors (fichero KREA2_F00TJ0B_v1.safetensors, 218 MiB) |
| Tipo de modelo | LoRA de edición de imagen (image edit) |
| Modelo base | krea2 (referenciado por el autor, sin más detalle técnico) |
| Pipeline declarado | image-text-to-image |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-28 / 2026-09-28 |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura del modelo base "krea2" ni sobre la estructura interna del adaptador. La model card únicamente indica que se trata de un LoRA de edición de imagen afinado desde esa base y que los pesos se entregan en un fichero safetensors de 218 MiB. Ese tamaño es elevado para un adaptador LoRA convencional, lo que suele asociarse a rangos altos o a un número elevado de módulos afectados, pero el autor no documenta ni el rank, ni el alpha, ni las capas objetivo, por lo que se trata de una observación orientativa y no de un dato confirmado.

Tampoco hay información sobre el dataset de entrenamiento: no se especifican número de imágenes, resolución, método de captions, número de pasos, optimizador, learning rate, ni si se emplearon técnicas de regularización, LoRA de bajo rango, DoRA u otros métodos de adaptación eficiente. No se menciona ningún proceso de RLHF, DPO ni ajuste por preferencias, algo por otro lado poco habitual en adaptadores de generación de imagen. No se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, destilación, etc.).

## Capacidades

- Generación de imágenes condicionada por texto dentro del flujo de trabajo image-text-to-image del modelo base.
- Edición de imagen: el pipeline declarado (image-text-to-image) implica que el adaptador puede modificar una imagen de entrada guiándose por un prompt, siempre que el runtime y la base lo permitan.
- Personalización de estilo o temática concreta: al ser un LoRA especializado, su función es desplazar la distribución del modelo base hacia el estilo o el concepto aprendido durante el ajuste.
- Integración con ComfyUI: los tags del repositorio incluyen comfyui, por lo que está previsto su uso como nodo o cargador de LoRA en ese ecosistema.
- Ejecución vía API: la model card ofrece enlaces a la API de RunningHub como vía de invocación remota.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no aplica (modelo de generación de imagen).
- Capacidades multilingües: no disponible; no se declaran idiomas soportados para el prompt de texto.
- Capacidad especial (thinking mode, visión, audio): no disponible; solo se declara la entrada image-text-to-image.

## Casos de uso

- Generación de imágenes en ComfyUI: cargar KREA2_F00TJ0B_v1.safetensors como LoRA sobre la base krea2 y encadenarlo a un sampler para producir imágenes con la estética aprendida, aprovechando el ecosistema de nodos de ComfyUI.
- Edición guiada por imagen de referencia: usar el pipeline image-text-to-image para partir de una imagen existente y aplicar el efecto del LoRA mediante prompt, útil en flujos de retoque o variación de una toma concreta.
- Prototipado rápido de conceptos visuales: dado el reducido tamaño del adaptador (218 MiB), permite iterar sobre variantes de estilo sin reentrenar ni redistribuir un modelo completo.
- Integración en servicios vía API: emplear los endpoints de RunningHub para exponer la generación como servicio, evitando gestionar GPU propia y delegando el cómputo de la base en la plataforma.
- Investigación sobre adaptación eficiente: sirve como caso de estudio de LoRA de tamaño relativamente alto (218 MiB) sobre bases de difusión, para analizar cuánto estilo se captura frente al coste de almacenamiento y de inferencia.
- Producción de contenido para adultos en plataformas que lo permitan: el modelo está orientado a temática explícita; su uso requeriría verificación de edad, cumplimiento normativo por jurisdicción y revisión de las políticas de la plataforma de destino.
- Fines de ilustración o referencia anatómica del pie: en contextos no explícitos (por ejemplo, ilustración médica, podología o diseño de calzado) el adaptador podría aportar detalle en esa región, aunque no hay evidencia documentada de que el ajuste sea útil fuera del dominio para el que fue entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, similitud con imagen de referencia), comparaciones con otros adaptadores ni evaluaciones humanas.

## Requisitos de hardware

- Peso del adaptador: 218 MiB en safetensors. El adaptador no se ejecuta de forma aislada; consume VRAM adicional sobre la del modelo base.
- VRAM de inferencia: no disponible para la base krea2. A modo de referencia general (no procedente de la información proporcionada), las bases de difusión tipo transformer de gama alta en fp16 suelen requerir del orden de 16-24 GB de VRAM, mientras que las versiones cuantizadas (fp8, GGUF Q4-Q8) pueden funcionar en tarjetas de 8-12 GB.
- GPU recomendadas: no disponible. Por analogía con bases de la misma clase, una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB serían el mínimo razonable con cuantización, y una RTX 4090 de 24 GB o una A100 de 40/80 GB permitirían fp16 con lotes mayores. Son estimaciones, no datos confirmados para este modelo.
- Compatibilidad con GPU de consumo: probablemente sí mediante cuantización, pero no está confirmado por el autor.
- Opciones de despliegue: ComfyUI (el tag del repositorio apunta a este entorno como vía principal), la plataforma RunningHub y su API, y Hugging Face como punto de distribución. La compatibilidad con Diffusers u otros runtimes no se documenta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos comparables concretos (mismo autor, misma base o misma temática). La tabla siguiente resume la comparación por categorías, indicando los datos no disponibles.

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-footjob-lora | LoRA de edición de imagen sobre krea2 | no disponible | no aplica | no disponible | Hugging Face, RunningHub, ComfyUI |
| Otros LoRA sobre la misma base krea2 | LoRA | no disponible | no aplica | depende del autor | no identificados en la información disponible |
| LoRA de estilización sobre bases de difusion (SDXL, familias FLUX) | LoRA | no disponible | no aplica | variable (a menudo no comercial) | Civitai, Hugging Face |
| Fine-tune completo de una base de difusion | Modelo completo | no disponible | no aplica | variable | Hugging Face |

El criterio diferencial de este adaptador no es el rendimiento, sino su especialización temática y su distribución a través de la infraestructura de RunningHub, con una API lista para invocar.

## Limitaciones y advertencias

- Contenido para adultos: el nombre y el origen del modelo (ficha de Civitai) apuntan a generación de contenido sexual explícito; su uso en productos comerciales exige verificación de edad, control de acceso y cumplimiento de la normativa aplicable en cada jurisdicción.
- Licencia indeterminada: el repositorio no declara licencia. La model card indica que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o del upstream, lo que impide confirmar si el uso comercial está permitido.
- Dependencia de la licencia de la base: al ser un adaptador, hereda las restricciones del modelo krea2 sobre el que se aplica, no documentadas aquí.
- Ausencia de documentación técnica: no hay datos de arquitectura, dataset, hiperparámetros, rank ni capas objetivo, lo que dificulta reproducir o auditar el entrenamiento.
- Sin benchmarks ni evaluaciones: no existen métricas publicadas que permitan estimar calidad, fidelidad al prompt o grado de sobreajuste.
- Riesgo de sobreajuste y de artefactos: los LoRA temáticos entrenados sobre datasets reducidos tienden a reproducir poses, composiciones y anatomías del conjunto de entrenamiento, con posibles deformaciones en manos, pies y proporciones.
- Posible necesidad de palabras clave (trigger words): no se documentan, por lo que el comportamiento del adaptador puede variar según el prompt empleado.
- Sesgos: al no especificarse la composición del dataset, no puede evaluarse el sesgo demográfico ni estético introducido por el ajuste. No disponible.
- Alucinación visual: como cualquier modelo generativo de imagen, puede producir resultados plausibles pero anatómicamente incorrectos, especialmente en extremidades.
- Idiomas del prompt: no se declaran idiomas soportados; el rendimiento con prompts en castellano es desconocido.
- Sin validación comunitaria: 0 descargas y 0 "likes" implican ausencia de retroalimentación, casos de uso verificados o ejemplos de terceros.
- Fecha de publicación atípica: la model card indica fechas de creación y actualización de 2026-09-28, posteriores a la fecha habitual de consulta, lo que conviene verificar antes de citar el modelo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-footjob-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-footjob-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2077943678710407169
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Ficha de origen en Civitai: https://civitai.red/models/2783955/krea-2-footjob?modelVersionId=3135759
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API (detalle): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
