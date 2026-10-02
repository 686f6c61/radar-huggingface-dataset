# RunningHubAI/rh-penetration-control-lora

## Resumen

rh-penetration-control-lora es un adaptador LoRA de edición de imágenes publicado por RunningHub (autor @氛围感) y alojado en Hugging Face bajo el identificador RunningHubAI/rh-penetration-control-lora. Deriva del modelo base de difusión krea2 (así lo indica la model card) y resuelve el control fino de la interacción y la pose entre sujetos dentro de una imagen generada, en pipelines de tipo image-text-to-image. Se distribuye para ComfyUI, RunningHub y Hugging Face, y el repositorio contiene un único fichero safetensors de 109 MiB, coherente con un adaptador de bajo rango y no con un modelo completo.

La documentación publicada es mínima: no se detallan número de parámetros, composición del dataset, idiomas, licencia ni palabras de activación, y el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha. Por su origen (una versión del modelo de Civitai krea2-penetration-control) y por su propio nombre, el adaptador está orientado a escenas de contenido adulto, lo que condiciona tanto la audiencia como el cumplimiento normativo. Su interés es práctico y muy especializado para quien ya trabaje con krea2 en ComfyUI; no es un avance de arquitectura ni incluye benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusión de imágenes identificado como krea2 |
| Parámetros totales | no disponible; el fichero de pesos LoRA ocupa 109 MiB en safetensors |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generación/edición de imágenes); no disponible en la documentación |
| Tipos de cuantización | no disponible; el repositorio solo distribuye safetensors |
| Idiomas soportados | no disponible; la comprensión de prompts depende del codificador de texto del modelo base |
| Licencia | no disponible; la model card remite a la licencia del proyecto original en Civitai |
| Formato de pesos | safetensors |
| Fichero principal | Krea2penetrationcontrol1500step.safetensors (109 MiB) |
| Pipeline declarado | image-text-to-image |
| Plataformas | ComfyUI, RunningHub, Hugging Face |
| Pasos de entrenamiento | 1500 (deducido del nombre del fichero de pesos) |
| Tamaño del repositorio | 0,1 GB |
| Fecha de creación (metadatos HF) | 2026-10-02 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de atención del modelo base de difusión krea2 sin modificar sus pesos originales. No se especifica la arquitectura interna del base (tipo de transformer de difusión, número de parámetros, dimensiones del codificador de texto ni resolución nativa), por lo que cualquier detalle más allá de la existencia del adaptador queda fuera de la información disponible. El peso del LoRA (109 MiB) es compatible con el patrón habitual de estos adaptadores para modelos de difusión de gran tamaño.

En cuanto al entrenamiento, la única información explícita es que se realizaron 1500 pasos y que el ajuste se llevó a cabo en la plataforma RunningHub. No hay datos sobre el dataset (número de imágenes, resolución, procedencia, filtrado), sobre el uso de técnicas de regularización, sobre palabras de activación ni sobre si hubo ajuste con RLHF/DPO (conceptos propios de modelos de lenguaje y no aplicables aquí). Tampoco se documenta ninguna innovación técnica asociada.

## Capacidades

- Edición de imágenes guiada por texto (pipeline image-text-to-image) cuando se carga junto al modelo base krea2.
- Control de la interacción física y la pose entre sujetos, según se deduce del nombre del modelo y de su versión original en Civitai.
- Integración como LoRA en flujos de ComfyUI, en la plataforma RunningHub y en Hugging Face.
- Hereda del modelo base la calidad de generación, el estilo y la cobertura de prompts; no se documentan capacidades propias adicionales.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-step.
- Capacidades multilingües: no disponibles; dependen del codificador de texto de krea2.
- Modo "thinking", visión o audio: no aplica.

## Casos de uso

- Ilustración de contenido para adultos en plataformas con verificación de edad: el adaptador permite controlar la composición e interacción entre personajes en escenas explícitas, un nicho en el que los LoRA de control de pose son habituales; requiere revisión legal y de consentimiento antes de cualquier publicación.
- Cómic y novela gráfica para público adulto: se puede usar para mantener una pose y una interacción coherentes entre viñetas consecutivas, combinándolo con el mismo modelo base y una semilla fija en ComfyUI.
- Previsualización de composiciones en estudios de ilustración: sirve para prototipar bocetos de escenas con dos o más sujetos interactuando antes de pasar a un render manual, gracias a la capacidad de edición guiada por texto del pipeline.
- Storyboard y animática para animación: permite generar fotogramas clave con una interacción concreta y luego interpolar en herramientas externas, reduciendo el trabajo de block-in manual.
- Generación por lotes en pipelines de ComfyUI: al ser un fichero de 109 MiB, se carga y descarga rápido en memoria, lo que facilita combinarlo con otros LoRA y automatizar tiradas grandes desde un grafo.
- Servicio bajo demanda mediante la API de RunningHub: el modelo está publicado en esa plataforma, de modo que se puede invocar sin gestionar GPU propia, útil para demos o productos con carga variable.
- Experimentación con mezcla de LoRA: su tamaño reducido permite probar combinaciones con otros adaptadores del mismo base krea2 para modular estilo y control de interacción sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, SSIM, comparativas con otros LoRA) ni tampoco evaluaciones cualitativas con prompts de referencia.

## Requisitos de hardware

- Huella del adaptador: 109 MiB en safetensors; el consumo real de VRAM lo determina íntegramente el modelo base krea2, cuyas características no se especifican en la información disponible.
- VRAM estimada para inferencia: no disponible para el modelo base. Como referencia general de la familia de modelos de difusión de imágenes, un base de tipo transformer suele requerir del orden de 8 a 24 GB según precisión (fp16 frente a fp8/GGUF) y resolución de salida, pero este dato no se puede confirmar para krea2 con la documentación aportada.
- GPU recomendadas: no disponibles. El adaptador no impone requisitos propios; el modelo base determinará si la inferencia cabe en GPU de consumo (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) o si necesita aceleradores de datacenter (A100, H100).
- Opciones de despliegue: ComfyUI (local), RunningHub (nube, con API) y descarga directa desde Hugging Face. No aplican vLLM ni TGI (orientados a modelos de lenguaje) ni llama.cpp (orientado a LLM en CPU).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamaño de pesos | Longitud de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-penetration-control-lora | LoRA de edición de imagen | krea2 | 109 MiB | no aplica | no disponible | Hugging Face, ComfyUI, RunningHub |
| krea2-penetration-control (Civitai) | LoRA de edición de imagen | krea2 | no disponible | no aplica | la de Civitai | Civitai |
| Otros LoRA de control de pose para ComfyUI | LoRA de edición de imagen | diversos (FLUX, SDXL, krea2) | variable | no aplica | variable | Hugging Face, Civitai, ComfyUI |

No se dispone de datos de rendimiento comparado (métricas, evaluaciones humanas ni benchmarks) que permitan establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Contenido para adultos: el nombre y el origen del modelo apuntan a escenas explícitas, con implicaciones legales y de cumplimiento (verificación de edad, consentimiento de las personas representadas, normativa de cada país y condiciones de las plataformas de distribución).
- Licencia no disponible: la model card indica que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original y del upstream. Sin ese dato, el uso comercial y la redistribución no están garantizados y deben aclararse con el autor.
- Ausencia de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia pública de calidad ni de estabilidad.
- Sesgos y alucinación: no se documenta el dataset de entrenamiento, por lo que se desconocen los sesgos heredados del base y del conjunto de ajuste. Como todo modelo de difusión, puede producir artefactos anatómicos o incoherencias en manos, extremidades y contactos entre sujetos.
- Sin benchmarks ni métricas: no hay forma de comparar objetivamente su rendimiento con adaptadores alternativos.
- Palabras de activación no documentadas: se desconoce si requiere un trigger concreto en el prompt, lo que complica la reproducibilidad.
- Entrenamiento corto (1500 pasos): posible sobreajuste a un estilo o a un tipo de composición concreto y menor generalización a poses o iluminaciones no vistas.
- Dependencia total del modelo base: el comportamiento, la resolución y los idiomas soportados vienen dados por krea2, cuyas especificaciones no se detallan en el repositorio.
- Caveat de producción: antes de integrarlo en un servicio hay que fijar versión del base, semilla, prompt y configuración de ComfyUI, y auditar las salidas con moderación automática si el producto es público.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-penetration-control-lora
- Modelo original en Civitai: https://civitai.red/models/2823421/krea2-penetration-control?modelVersionId=3188843
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2083688736478842881
- Página del autor: https://www.runninghub.ai/user-center/2041030036219498497
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino referenciado en la model card: README_cn.md (mismo repositorio)
