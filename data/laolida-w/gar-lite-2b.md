# laolida-w/GAR-Lite-2B

## Resumen

GAR-Lite-2B es un modelo multimodal de tipo image-text-to-text desarrollado por el autor `laolida-w` (vinculado al proyecto *Grasp Any Region v2* del MSALab de la Universidad de Pekín, segun la project page enlazada en la model card). Se trata de un checkpoint derivado de Qwen3.5-2B, sin modificaciones en la arquitectura nativa (`Qwen3_5ForConditionalGeneration`), especializado en comprensión de regiones concretas de una imagen ("grasp any region"): dada una imagen y una o varias cajas delimitadoras (bounding boxes), el modelo genera descripciones o respuestas centradas en esa región.

El modelo resuelve el problema de la comprensión granular de imágenes: en lugar de describir la escena completa, permite apuntar a una región específica y obtener una descripción detallada o una respuesta conversacional sobre ella. Su interés actual radica en que ofrece esta capacidad con solo 2.721.801.024 parámetros (unos 2,7 mil millones), lo que lo hace apto para despliegue en hardware modesto, y en que se distribuye con licencia Apache 2.0 y funciona con Transformers y vLLM estándar sin código personalizado.

La model card indica que se obtuvo mediante destilación on-policy de dos etapas con doble profesor (dual-teacher OPD) a partir de GAR-v2, lo que sugiere que hereda capacidades de un modelo mayor de la misma familia. No se especifican en la información disponible la longitud de contexto, los idiomas soportados ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal nativo Qwen3.5-2B (`Qwen3_5ForConditionalGeneration`) |
| Parámetros totales | 2.721.801.024 (~2,7 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; se asume bfloat16 por el ejemplo de la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura nativa de Qwen3.5-2B (`Qwen3_5ForConditionalGeneration`), un transformer multimodal sin modificaciones estructurales, según indica la model card. La innovación no reside en la arquitectura sino en el proceso de entrenamiento: destilación on-policy (OPD) en dos etapas con dos profesores, a partir del modelo GAR-v2 del proyecto *Grasp Any Region v2*. Este esquema busca transferir a un modelo pequeño de 2,7 B las capacidades de comprensión de regiones de un modelo mayor.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se especifican innovaciones de decodificación (decodificación especulativa, atención lineal, etc.). Lo que sí se indica es que el checkpoint es compatible con Transformers estándar (`AutoModelForImageTextToText`, `AutoProcessor`) y con vLLM sin plugin personalizado, usando `enable_thinking=False`.

## Capacidades

- Comprensión de regiones de imagen: acepta una imagen y una o varias bounding boxes y genera contenido centrado en esa región (modo `detailed_caption` en el CLI de ejemplo).
- Generación de texto conversacional multimodal (pipeline `image-text-to-text`).
- Descripción detallada de regiones ("grasp any region"), que es la capacidad central del proyecto GAR-v2.
- Integración con tooling estándar: Transformers y vLLM nativos, sin código personalizado.
- Modo thinking desactivable (`enable_thinking=False` en vLLM), lo que sugiere soporte de un modo de razonamiento heredado de Qwen3.5.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Descripción detallada de regiones en imágenes: dado un bounding box (por ejemplo, `[[738,669,814,712]]` como en el ejemplo de la model card), el modelo genera una caption detallada de ese objeto o zona, útil en anotación automática de datasets.
- Etiquetado y enriquecimiento de datasets de visión: generación de descripciones por región para construir corpus de image-text-to-text con granularidad fina, aprovechando el modo `detailed_caption`.
- Asistentes de accesibilidad: descripción de zonas concretas de una imagen que el usuario señale, en lugar de una descripción global de la escena.
- Inspección visual en control de calidad industrial: apuntar a una región de una foto de producto o pieza y obtener una descripción textual de su estado, con despliegue en GPU de consumo por su tamaño de 2,7 B.
- Análisis documental: seleccionar una región de un escaneo (firma, sello, campo de formulario) y obtener una descripción de su contenido.
- Prototipado e investigación en comprensión regional: servir como modelo pequeño de referencia para comparar con modelos mayores de la familia GAR-v2 en experimentos académicos, con licencia Apache 2.0.
- Despliegue en entornos con recursos limitados: al ser compatible con vLLM estándar y Transformers, puede servirse como endpoint de inferencia multimodal sin infraestructura especializada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5,5 GB solo para pesos (tamaño del repo: 5,5 GB para 2,72 B de parámetros), más overhead de activaciones y caché KV; en la práctica, alrededor de 6-8 GB en bf16 según longitud de contexto y lote.
- Cuantización: no se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ) en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM en bf16; tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 son suficientes. Cabe en GPU de consumo.
- Opciones de despliegue: Transformers (`AutoModelForImageTextToText` + `AutoProcessor`), vLLM nativo (sin plugin, con `enable_thinking=False`) y el CLI incluido `inference/lite_inference.py`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas (contexto, idiomas) de este modelo ni de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Como referencia cualitativa, se puede situar frente a:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| GAR-Lite-2B | ~2,7 B | no disponible | Apache 2.0 | Comprensión de regiones (destilado de GAR-v2) |
| Qwen3.5-2B (base) | ~2 B (no confirmado) | no disponible | no disponible | Multimodal generalista |
| GAR-v2 (profesor) | no disponible | no disponible | no disponible | Comprensión de regiones a mayor escala |

Los datos de la fila de Qwen3.5-2B y GAR-v2 no están confirmados en la información disponible y deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes en Hugging Face en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- No se han publicado benchmarks; el rendimiento real en comprensión regional es desconocido.
- No se especifican idiomas soportados; no se puede asumir un buen rendimiento en castellano sin evaluación previa.
- No se documenta la longitud de contexto, lo que impide planificar casos de uso con imágenes múltiples o conversaciones largas.
- Al ser un modelo destilado, puede heredar sesgos y errores del profesor (GAR-v2) y del modelo base (Qwen3.5-2B); riesgo de alucinación en descripciones de regiones poco definidas o de baja resolución.
- Dependencia de la calidad de las bounding boxes de entrada: cajas mal ajustadas producirán descripciones inexactas.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de los modelos base y del profesor de los que deriva.
- El modo thinking debe desactivarse (`enable_thinking=False`) en vLLM según la model card; no se detalla el comportamiento si se deja activo.

## Enlaces

- Hugging Face: https://huggingface.co/laolida-w/GAR-Lite-2B
- Project page (Grasp Any Region v2): https://msalab-pku.github.io/projects/Grasp-Any-Region-v2/
- Colección en Hugging Face: https://huggingface.co/collections/laolida-w/grasp-any-region-v2-6b002a71be1352a0fb2ccbd4
