# RunningHubAI/rh-ff6-celes-lora

## Resumen

rh-ff6-celes-lora es un adaptador LoRA de edición de imagen publicado por RunningHubAI en Hugging Face. Se distribuye como un único archivo de pesos, `ff6 c.safetensors` (448 MiB), etiquetado con los tags `comfyui`, `lora` y `image-text-to-image`, y está pensado para cargarse en ComfyUI, en la plataforma RunningHub o directamente desde Hugging Face. La model card indica que el adaptador está afinado a partir de un modelo base identificado como `krea2`, sin detallar la versión ni la arquitectura subyacente.

El nombre del repositorio (`ff6-celes`) apunta a un LoRA de personaje o estilo inspirado en Celes, de Final Fantasy VI, aunque la documentación publicada no lo confirma explícitamente ni describe el dataset de entrenamiento. El pipeline declarado es `image-text-to-image`, es decir, generación o edición de imágenes condicionada por una imagen de entrada y un prompt textual.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin resultados de evaluación publicados. Es útil como ejemplo del flujo de publicación de LoRAs de personaje en el ecosistema ComfyUI y como pieza reutilizable dentro de un pipeline de difusión, pero no debe tratarse como un modelo autónomo: requiere el modelo base `krea2` para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusión identificado como `krea2`; detalle de la arquitectura base no disponible |
| Parametros totales | no disponible (el archivo de pesos ocupa 448 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto); el condicionamiento se realiza mediante imagen de entrada y prompt |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; no se documentan variantes GGUF, FP8 ni INT8) |
| Idiomas soportados | no disponibles (el prompt textual depende del modelo base, no del adaptador) |
| Licencia | no disponible; publicado por RunningHub en nombre del autor, con copyright del autor y remisión a la licencia del proyecto original o del upstream |
| Formato de pesos | safetensors (`ff6 c.safetensors`, 448 MiB) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, esto es, un conjunto de matrices de bajo rango que se inyectan en las capas de atención y proyección de un modelo de difusión preentrenado para especializarlo en un concepto, personaje o estilo concreto. La model card declara `Finetuned from: krea2` y clasifica el modelo como "LoRA (image edit)", con pipeline `image-text-to-image`. No se especifica el rango del adaptador, las capas objetivo, el número de pasos de entrenamiento, el tamaño del dataset, la resolución de entrenamiento ni si se emplearon técnicas de regularización como captions balanceados o DreamBooth. Tampoco se indica si hubo ajuste fino adicional con refuerzo, DPO o cualquier otro método de alineación, algo por otra parte poco habitual en adaptadores de difusión.

No se documenta ninguna innovación técnica asociada al adaptador: no hay mención a decodificación especulativa, atención lineal, destilación ni variantes de sampler propietarias. El repositorio ocupa 0,5 GB y contiene exclusivamente el archivo de pesos, sin scripts de entrenamiento, configuraciones de inferencia ni ejemplos de prompts incluidos en la model card.

## Capacidades

- Generación y edición de imágenes condicionadas por texto e imagen de entrada (pipeline `image-text-to-image`).
- Especialización temática o de personaje mediante LoRA: el adaptador modula el modelo base para reproducir un concepto concreto, presumiblemente el personaje Celes de Final Fantasy VI según el nombre del repositorio (no confirmado en la documentación).
- Integración nativa con ComfyUI, dado el tag `comfyui` y el formato safetensors.
- Compatible con la plataforma RunningHub y con su API, según los enlaces de la model card.
- Capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión o audio: no disponibles (no es un modelo de lenguaje).
- Capacidades multilingües: no disponibles; la cobertura idiomática del prompt depende íntegramente del modelo base `krea2`.
- Modo "thinking" o razonamiento explícito: no aplica.

## Casos de uso

- Generación de fan art consistente: combinado con el modelo base `krea2` en ComfyUI, el LoRA permite producir ilustraciones del personaje con rasgos estables entre iteraciones, útil para proyectos personales de ilustración o fan art.
- Coherencia de personaje en narrativa visual: en la producción de un cómic corto o una novela gráfica amateur, el adaptador ayuda a mantener la identidad del personaje a lo largo de distintas escenas y encuadres sin reentrenar el modelo completo.
- Previsualización de assets para videojuegos: estudio de propuestas de diseño de personaje o de variaciones de vestuario antes de pasar a modelado 3D, aprovechando la edición imagen-a-imagen para partir de bocetos existentes.
- Edición de imagen guiada por prompt: retoque de una imagen de entrada (cambio de vestuario, iluminación o encuadre) manteniendo la identidad del sujeto, gracias al pipeline `image-text-to-image`.
- Prototipado de pipelines en ComfyUI: nodo de prueba para validar flujos de trabajo con LoRAs encadenados, control de pesos de adaptador y schedulers antes de llevar el flujo a producción.
- Automatización vía API de RunningHub: integración en un servicio que reciba una petición y devuelva imágenes generadas, usando el endpoint documentado en la model card como capa de orquestación.
- Creación de datasets sintéticos: generación de variaciones de un personaje para aumentar un conjunto de datos de entrenamiento de otro modelo o clasificador, siempre con las cautelas de licencia y de derechos de propiedad intelectual indicadas más abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (FID, CLIP score, similitud de personaje, evaluaciones humanas) ni comparaciones cuantitativas con otros adaptadores. Tampoco hay resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- El adaptador por sí solo ocupa 448 MiB en disco y un consumo de VRAM marginal (< 1 GB) al cargarse, pero no es funcional sin el modelo base `krea2`.
- VRAM estimada para inferencia: no disponible para el modelo base; en modelos de difusión de tipo transformer de gran tamaño suele requerir entre 8 y 16 GB en precisión reducida y entre 16 y 24 GB en fp16, aunque este dato no está confirmado para `krea2`.
- GPU recomendadas: no disponibles. Como referencia general para difusión de imágenes, una RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4090, A100 o H100 serían candidatas razonables, pero la idoneidad depende del modelo base y de la resolución de salida.
- Compatibilidad con GPU de consumo: probable en GPUs con 8-12 GB de VRAM si el modelo base admite cuantización o carga por bloques; no confirmado.
- Opciones de despliegue: ComfyUI como entorno principal declarado, la plataforma RunningHub y su API. No se documenta soporte explícito para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen por completo del modelo base, la GPU y la resolución de generación.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|---|
| rh-ff6-celes-lora | LoRA de edición de imagen sobre `krea2` | no disponible (448 MiB de pesos) | no aplica | no disponible | Hugging Face, RunningHub, ComfyUI | no publicados |
| Otros LoRAs de personaje publicados por RunningHubAI | LoRA de edición de imagen | no disponible | no aplica | no disponible | Hugging Face, RunningHub | no publicados |
| Adaptadores LoRA de personaje para modelos de difusión tipo FLUX | LoRA de edición de imagen | variable (típicamente 20-400 MB) | no aplica | variable según autor | Civitai, Hugging Face | no comparables de forma estandarizada |

No se dispone de datos objetivos para establecer una comparación cuantitativa con alternativas concretas. La comparación se limita a categoría, formato y vía de distribución.

## Limitaciones y advertencias

- Licencia no declarada: la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o del upstream. Esto deja en el aire el uso comercial del adaptador y obliga a verificar la licencia de `krea2` antes de cualquier despliegue en producción.
- Propiedad intelectual del personaje: si el LoRA reproduce un personaje de Final Fantasy VI, la propiedad intelectual pertenece a Square Enix; su uso comercial o su distribución como parte de un producto puede constituir una infracción, con independencia de la licencia del archivo de pesos.
- Ausencia de validación: cero descargas y cero likes en el momento de la consulta, sin evaluación independiente ni reportes de la comunidad que confirmen la calidad o la fidelidad del adaptador.
- Falta de documentación de entrenamiento: no se especifican pasos, dataset, resolución, captions ni rango, lo que dificulta reproducir resultados o diagnosticar sobreajuste.
- Dependencia absoluta del modelo base: sin `krea2`, el adaptador no genera nada; cualquier cambio de versión del base puede degradar la calidad o romper la compatibilidad de las claves del LoRA.
- Riesgo de sobreajuste y de rigidez: los LoRAs de personaje suelen sesgar la generación hacia poses, encuadres o paletas presentes en el dataset de entrenamiento, reduciendo la diversidad de las salidas.
- Sesgos del modelo base: los sesgos demográficos, estéticos y culturales de `krea2` se heredan y pueden amplificarse con el adaptador; no se documenta ningún trabajo de mitigación.
- Adherencia al prompt: no hay datos sobre cómo interactúa el adaptador con prompts largos o negativos, ni sobre su comportamiento a distintas resoluciones y relaciones de aspecto.
- Alucinación: no aplica en el sentido lingüístico, pero sí en forma de artefactos visuales, anatomía incorrecta o incoherencia entre la imagen de entrada y la salida.
- Idiomas del prompt: al no declararse idiomas soportados, el rendimiento con prompts en castellano dependerá del tokenizador y del codificador de texto de `krea2`, no del adaptador.
- Metadatos del repositorio poco fiables: las fechas de creación y actualización declaradas son 2026-10-10 y 2026-10-10T22:12:03Z, posteriores a la fecha habitual de publicación, lo que sugiere un posible error de marca temporal y aconseja no tomarlas como referencia.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-ff6-celes-lora
- Proyecto original en RunningHub: https://www.runninghub.cn/model/public/2106956959315488769
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1916697437002473474
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio de China): https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
