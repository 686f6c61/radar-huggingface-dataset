# AbstractPhil/north-micro-vision-think-symbolic-image

## Resumen

North-Micro-Vision, think symbolic image es un adaptador LoRA de tipo PEFT sobre CohereLabs/North-Micro-Vision-Instruct, el modelo de visión de 2.500 millones de parámetros de Cohere Labs (encoder SigLIP 2 de 0,4B reentrenado a resolución nativa más un modelo de lenguaje de 2B con 28 capas). El adaptador, desarrollado por AbstractPhil, no busca mejorar la precisión genérica del modelo base sino imponerle un formato de salida muy concreto: una cadena de pensamiento simbólica y estructurada en la que cada línea es un paso nombrado (see, name, place, count, relate, form, light, colour, mood, mean, intend, story, compare, change, check, say) seguido de la formulación final (caption, prompt, tags, crítica) y de las preguntas que un observador cuidadoso aún se haría, cada una etiquetada como `[record]`, `[chain]` o `[unknown]`.

Es relevante porque aborda un problema práctico de los modelos de visión-lenguaje aplicados a patrimonio cultural y documentación de imágenes: la falta de estructura y de trazabilidad en las descripciones generadas. En lugar de una caption libre, el modelo produce un registro auditable donde se distingue lo que es un hecho de la imagen, lo que se ha inferido y lo que se desconoce. El adaptador tiene rango 32, 34,9 millones de parámetros entrenables guardados en fp32, y el repositorio ocupa 0,2 GB. Forma parte de una familia de cinco modelos entrenados con la misma receta (línea Lucia v1) junto a las líneas Qwen3.5 y Gemma 4.

La licencia es Apache 2.0 y el único idioma declarado es el inglés. El modelo no es un modelo de razonamiento con modo thinking conmutable: la cadena de pensamiento es el propio formato de salida entrenado, no un mecanismo interno de decodificación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer vision-language (encoder SigLIP 2 + LM de 28 capas) |
| Parámetros totales | Modelo base de 2,5B (0,4B encoder de visión + 2B LM); adaptador LoRA de 34,9M entrenables |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (adaptador guardado en fp32; el base se carga en bfloat16 en el ejemplo oficial) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere transformers >= 5.16 y peft >= 0.18 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre CohereLabs/North-Micro-Vision-Instruct, cuya arquitectura combina un encoder visual SigLIP 2 de 0,4B parámetros reentrenado a resolución nativa con un modelo de lenguaje de 2B parámetros y 28 capas. El adaptador LoRA tiene rango 32 y 34,9 millones de parámetros entrenables, guardados en fp32; no existe un fine-tune completo del modelo base. En la inferencia se recomienda fusionar el adaptador con `merge_and_unload()` y ejecutar en bfloat16.

El entrenamiento se realizó sobre los datasets AbstractPhil/thought-symbolic-image-captions y AbstractPhil/qwen-thinking-images, con pares imagen-texto en el formato simbólico descrito. El adaptador fue entrenado con prompts exactos y fijos (formas completa y corta según profundidad de observación: vistazo rápido, mirada cercana, mirada larga); el autor advierte explícitamente que una petición reformulada constituye una entrada distinta. No se envió system prompt durante el entrenamiento ni se recomienda enviarlo en inferencia, y la decodificación debe ser greedy. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de descripciones estructuradas de imágenes en formato de cadena de pensamiento simbólica, con pasos nombrados por línea.
- Producción de caption, prompt de generación, tags y crítica, en función de la profundidad solicitada (1-2 pensamientos para vistazo rápido, 3-5 para mirada cercana, 6-10 para mirada larga).
- Formulación de preguntas de seguimiento clasificadas como hecho de la imagen (`[record]`), inferencia de la cadena (`[chain]`) o desconocido (`[unknown]`).
- Análisis de imágenes de arte, fotografía y piezas de museo: medio, soporte, composición, iluminación, color, estado de ánimo e intención.
- Identificación del tipo de imagen en el primer término de la línea de prompt (painting, print, drawing, photograph).
- Conversación multi-turno mediante plantilla de chat del procesador.
- No dispone de tool calling, function calling ni capacidades de agente documentadas.
- No es un modelo de razonamiento con modo thinking conmutable; la cadena es el formato de salida, no un mecanismo interno.

## Casos de uso

- Catalogación de fondos museísticos: el modelo genera un registro estructurado por imagen con hechos verificables, inferencias y lagunas explícitas, lo que permite revisión humana selectiva solo sobre los campos marcados como `[unknown]`.
- Documentación de archivos fotográficos: la línea de prompt con el tipo de imagen y la caption normalizada facilitan la generación de metadatos homogéneos para grandes colecciones.
- Generación de prompts para modelos texto-a-imagen: la línea `prompt` produce términos de estilo, medio y composición directamente reutilizables en pipelines de síntesis.
- Enriquecimiento de datasets de visión-lenguaje: las salidas etiquetadas como `[record]` frente a `[chain]` permiten filtrar automáticamente descripciones con distinto grado de fiabilidad.
- Asistencia a investigadores de historia del arte: el desglose por pasos (medio, luz, color, estado de ánimo, intención) sirve como borrador de ficha analítica revisable.
- Moderación y control de calidad de descripciones: la distinción explícita entre lo observado y lo inferido reduce el riesgo de que una alucinación se propague como hecho en un catálogo.
- Etiquetado ligero en local: con 2,5B parámetros en el base, el conjunto puede desplegarse en GPUs de consumo para procesamiento por lotes de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica únicamente comparaciones cualitativas dentro de su familia de cinco modelos: el adaptador escribe la forma completa de la fila y respalda sus pensamientos al nivel de la familia desde el base más débil de los cinco, con lecturas a medio plazo al nivel del Gemma E4B. No se aportan cifras de MMLU, HumanEval, GSM8K ni métricas de captioning.

## Requisitos de hardware

- VRAM estimada: el modelo base de 2,5B en bfloat16 requiere aproximadamente 5-6 GB de pesos; en cuantización de 8 bits bajaría a unos 3 GB y en 4 bits a unos 2 GB, aunque no se documentan cuantizaciones oficiales del adaptador.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; A100, H100 o L40S para procesamiento por lotes a mayor throughput.
- GPU de consumo: cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y RTX 4090; en tarjetas de 8 GB conviene cuantizar el base.
- Despliegue: el ejemplo oficial usa transformers (>= 5.16) con peft (>= 0.18) y `AutoModelForMultimodalLM`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato de adaptador PEFT hace improbable el uso directo en llama.cpp sin conversión.
- Latencia y throughput: no disponibles. La generación es greedy y el ejemplo oficial limita a 800 tokens nuevos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| North-Micro-Vision, think symbolic image | 2,5B base + 34,9M adaptador | No disponible | Captioning estructurado con cadena simbólica | Apache 2.0 | HuggingFace (PEFT) |
| CohereLabs/North-Micro-Vision-Instruct | 2,5B | No disponible | Vision-language instructivo general | No disponible en la información | HuggingFace |
| Línea Lucia v1 (Qwen3.5) | No disponible | No disponible | Misma receta de captioning simbólico | No disponible | Familia del mismo autor |
| Línea Lucia v1 (Gemma 4) | No disponible | No disponible | Misma receta de captioning simbólico | No disponible | Familia del mismo autor |

No se dispone de datos de rendimiento comparativo entre estas alternativas; la comparación disponible es únicamente cualitativa y procede de la propia model card.

## Limitaciones y advertencias

- El adaptador solo responde al formato de prompt exacto con el que fue entrenado; una reformulación de la petición produce una salida distinta y potencialmente fuera de formato.
- No debe enviarse system prompt: el autor indica que el modelo base desaconseja su uso y que no se empleó durante el entrenamiento.
- La decodificación debe ser greedy; no se documenta el comportamiento con sampling.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- Riesgo de alucinación en las líneas marcadas como `[record]`: el etiquetado es una salida generada, no una verificación real, por lo que un hecho falso puede presentarse como certeza.
- El autor sitúa el respaldo de sus pensamientos en el nivel del base más débil de la familia de cinco modelos, lo que sugiere menor profundidad analítica que las variantes sobre Qwen3.5 o Gemma 4.
- Sin datos de benchmarks ni de sesgos evaluados; no hay evidencia publicada sobre robustez fuera del dominio de arte, fotografía y museo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación independiente hace recomendable una validación propia antes de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbstractPhil/north-micro-vision-think-symbolic-image
- Modelo base: https://huggingface.co/CohereLabs/North-Micro-Vision-Instruct
- Dataset de captions simbólicas: https://huggingface.co/datasets/AbstractPhil/thought-symbolic-image-captions
- Dataset de imágenes de razonamiento: https://huggingface.co/datasets/AbstractPhil/qwen-thinking-images
