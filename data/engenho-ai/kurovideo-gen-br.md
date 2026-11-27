# engenho-ai/KuroVideo-Gen-BR

## Resumen

KuroVideo-Gen-BR es un adaptador LoRA temporal desarrollado por Engenho AI (dentro de su línea "Kuro") sobre el modelo base Wan-AI/Wan2.1-T2V-1.3B-Diffusers. Se trata de un ajuste fino orientado a la generación y edición de vídeo en portugués de Brasil, cubriendo las modalidades text-to-video (t2v), image-to-video (i2v), video-to-video (v2v) y reference-to-video (ref2v). El modelo se distribuye como pesos LoRA en formato `.safetensors` y está pensado para ejecutarse en GPUs con un mínimo de 8 GB de VRAM, lo que lo sitúa en el rango de hardware de consumo.

El modelo base sobre el que se construye es Wan2.1-T2V-1.3B, un modelo de difusión para generación de vídeo de 1.300 millones de parámetros desarrollado por Alibaba (Wan-AI). El adaptador no modifica la arquitectura del modelo base, sino que añade pesos de bajo rango entrenados específicamente para mejorar el comportamiento en portugués brasileño y en las tareas de edición de vídeo mencionadas. La licencia Apache 2.0 permite uso comercial y modificación.

La relevancia de este modelo radica en su especialización lingüística: la mayoría de los modelos de generación de vídeo están entrenados predominantemente en inglés, y este adaptador cubre la brecha para el mercado lusohablante. El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar publicados en el momento de la consulta o que el repositorio está vacío.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusión Wan2.1-T2V-1.3B (transformer de difusión) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 1.3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugués (pt, pt-br) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Wan2.1-T2V-1.3B-Diffusers, un modelo de difusión para generación de vídeo con arquitectura transformer de 1.300 millones de parámetros. El adaptador en sí es un LoRA temporal, es decir, pesos de bajo rango insertados en las capas del modelo base para adaptar su comportamiento sin modificar los pesos originales. Esto permite cargar el adaptador sobre el modelo base y combinarlo con otras técnicas de cuantización o ajustes.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card únicamente indica que el adaptador está orientado a portugués de Brasil y que cubre las modalidades t2v, i2v, v2v y ref2v. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) en portugués brasileño.
- Generación de vídeo a partir de una imagen (image-to-video).
- Edición de vídeo existente (video-to-video).
- Generación condicionada por referencia (reference-to-video).
- Especialización lingüística en portugués de Brasil.
- Ejecución en GPUs con 8 GB de VRAM o superior.
- No se documenta soporte de tool calling, function calling, agentes ni multi-step reasoning (no aplica a un modelo de difusión de vídeo).
- No se documentan capacidades de audio, visión general ni modo "thinking".

## Casos de uso

- Generación de clips publicitarios en portugués: el adaptador permite crear vídeos cortos a partir de descripciones textuales en pt-br, útil para campañas de marketing dirigidas al mercado brasileño sin necesidad de traducir prompts al inglés.
- Creación de contenido para redes sociales: con 8 GB de VRAM, se puede ejecutar en una RTX 3060 o superior para generar clips verticales u horizontales de forma local, reduciendo costes de API.
- Prototipado rápido de storyboards: la modalidad image-to-video permite animar bocetos o fotogramas clave para previsualizar secuencias antes de una producción final.
- Edición y restilización de vídeo: la modalidad video-to-video permite aplicar transformaciones estilísticas o correcciones sobre material existente, útil en postproducción de bajo presupuesto.
- Localización de contenido audiovisual: al estar especializado en pt-br, facilita la adaptación de vídeos generados originalmente en otros idiomas al mercado brasileño.
- Educación y formación: generación de vídeos explicativos breves a partir de guiones en portugués para plataformas de e-learning.
- Investigación en generación de vídeo multilingüe: sirve como punto de partida para estudiar el comportamiento de adaptadores LoRA sobre modelos de difusión de vídeo en idiomas distintos del inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: a partir de 8 GB según la model card del autor.
- GPU recomendadas: no se especifican modelos concretos; por el umbral de 8 GB, cabría esperar GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070, así como GPUs profesionales (A100, H100) para mayor throughput.
- Cabe en GPU de consumo: sí, según el autor, desde 8 GB de VRAM.
- Opciones de despliegue: no se documentan explícitamente; al ser un adaptador sobre Diffusers, se puede cargar con la librería `diffusers` de Hugging Face. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión de vídeo en la mayoría de casos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KuroVideo-Gen-BR | LoRA sobre 1.3B | no disponible | Apache 2.0 | Hugging Face (repo 0.0 GB) | Especializado en pt-br, t2v/i2v/v2v/ref2v |
| Wan2.1-T2V-1.3B | 1.3B | no disponible | Apache 2.0 | Hugging Face | Modelo base, orientado a inglés |
| Otros adaptadores LoRA sobre Wan2.1 | no disponible | no disponible | variable | variable | No se dispone de datos comparativos |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar disponibles o que el repositorio está vacío en el momento de la consulta; conviene verificar antes de usarlo en producción.
- Solo se documenta soporte de portugués (pt, pt-br); no se garantiza un buen rendimiento en otros idiomas.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre datos de vídeo, puede heredar sesgos de representación del dataset del modelo base.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos, incoherencias temporales o contenido no fiel al prompt.
- No se documentan limitaciones de contexto ni de resolución/duración de vídeo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base Wan2.1-T2V-1.3B para confirmar compatibilidad.
- Al ser un adaptador LoRA, requiere cargar el modelo base completo, por lo que el consumo de VRAM real será el del modelo base más el adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/engenho-ai/KuroVideo-Gen-BR
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
