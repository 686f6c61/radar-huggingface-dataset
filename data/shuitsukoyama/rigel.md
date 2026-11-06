# ShuitsuKoyama/Rigel

## Resumen

Rigel es un adaptador LoRA sobre el modelo Qwen3-VL-2B-Instruct desarrollado por ShuitsuKoyama, diseñado específicamente como evaluador de calidad de descripciones (captions) para vídeos e imágenes. A diferencia de un modelo generativo al uso, Rigel recibe como entrada un medio (vídeo o imagen), una caption candidata y, opcionalmente, captions de referencia, y devuelve una puntuación continua en el rango [0, 1] que refleja la calidad de la descripción. El problema que resuelve es la evaluación automática y objetiva de captions en pipelines de generación multimodal, donde medir la fidelidad de una descripción generada es costoso si se hace manualmente.

El modelo se distribuye como un adaptador PEFT (LoRA) que debe combinarse con el modelo base Qwen3-VL-2B-Instruct, un transformer multimodal de 2.000 millones de parámetros con capacidad de procesar texto e imágenes/vídeo. El adaptador en sí contiene 2.925.066 parámetros entrenables, lo que lo hace extremadamente ligero en almacenamiento (el repositorio ocupa 0.0 GB según Hugging Face) y permite un despliegue económico sobre el modelo base.

La relevancia de Rigel radica en su especialización: en lugar de competir como modelo generalista, cubre una necesidad concreta en el ciclo de evaluación de sistemas de captioning (image captioning y video captioning), ofreciendo puntuaciones continuas que pueden integrarse en métricas automáticas, comparación de modelos o control de calidad en producción. Su licencia BSD-3-Clause facilita el uso comercial. El proyecto se publicó en octubre de 2026 y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3-VL-2B-Instruct (transformer multimodal vision-language) |
| Parametros totales | 2.925.066 (adaptador LoRA); modelo base Qwen3-VL-2B-Instruct de 2.000 millones de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-VL-2B-Instruct, no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Rigel no es un modelo entrenado desde cero, sino un adaptador LoRA (Low-Rank Adaptation) aplicado sobre Qwen3-VL-2B-Instruct, un transformer multimodal de la familia Qwen3-VL que procesa entradas de texto y visión (imágenes y vídeo). La arquitectura subyacente combina un codificador visual con un decoder de lenguaje, y el adaptador LoRA modifica un subconjunto de pesos para especializar el modelo en la tarea de puntuación de captions. El adaptador tiene 2.925.066 parámetros, un orden de magnitud muy inferior al modelo base, lo que reduce drásticamente los requisitos de almacenamiento y permite cargarlo junto al modelo base con sobrecarga mínima.

La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se emplearon técnicas de RLHF o DPO. La model card indica únicamente que el modelo evalúa captions con o sin referencias, lo que sugiere un entrenamiento supervisado orientado a regresión sobre pares (medio, caption candidata, referencias opcionales) con etiquetas de calidad. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La librería declarada es `peft`, y el pipeline es `video-text-to-text`, lo que confirma que la entrada principal incluye vídeo además de imagen.

## Capacidades

- Evaluación de calidad de captions de vídeo: recibe un vídeo y una caption candidata y devuelve una puntuación continua en [0, 1].
- Evaluación de calidad de captions de imagen: misma funcionalidad aplicada a imágenes estáticas.
- Puntuación con referencias (reference-based): acepta una o varias captions de referencia para comparar la candidata.
- Puntuación sin referencias (reference-free): permite evaluar una caption sin disponer de referencias, pasando una lista vacía de referencias.
- Salida continua: genera un valor numérico en el intervalo [0, 1], adecuado para ranking y umbrales.
- Interfaz de línea de comandos (`rigel-score`) y API de Python (`from rigel import from_pretrained`).
- Procesamiento multimodal heredado del modelo base Qwen3-VL-2B-Instruct (visión y texto).
- No se documentan capacidades de tool calling, agentes, generación de texto libre ni modos de razonamiento explícito; su función es exclusivamente de scoring.

## Casos de uso

- Evaluación automática de pipelines de video captioning: integrar Rigel como métrica en un pipeline que genere captions con un modelo generativo y puntuar cada salida con Rigel para comparar variantes de prompting o modelos, usando la puntuación continua como señal de ranking.
- Control de calidad en generación de descripciones de imágenes: en un sistema que produce alt-text o descripciones para catálogos de producto, Rigel puede filtrar captions por debajo de un umbral y marcar las que requieran revisión humana.
- Evaluación reference-free en producción: cuando no existen captions de referencia (caso habitual en datos nuevos), Rigel permite puntuar la fidelidad de la descripción sin necesidad de anotaciones, pasando `refs=[[]]`.
- Comparación de modelos de captioning: usar las puntuaciones de Rigel sobre un conjunto de prueba común para comparar dos o más modelos generadores de captions de vídeo o imagen con una métrica objetiva y reproducible.
- Filtrado de datos de entrenamiento: puntuar captions de un dataset multimodal para descartar descripciones de baja calidad antes de usarlas en el entrenamiento de otros modelos, reduciendo ruido en los datos.
- Investigación en métricas de evaluación multimodal: emplear Rigel como baseline o componente en estudios sobre evaluación automática de descripciones, dado que su licencia BSD-3-Clause permite modificarlo y redistribuirlo.
- Monitorización de accesibilidad: en sistemas que generan descripciones automáticas para personas con discapacidad visual, usar Rigel para detectar descripciones pobres o incompletas y priorizar su mejora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El adaptador LoRA ocupa muy poco espacio (2.925.066 parámetros en safetensors), pero requiere cargar el modelo base Qwen3-VL-2B-Instruct, de 2.000 millones de parámetros, que en precisión FP16 requiere aproximadamente 4 GB de VRAM solo para los pesos, más memoria para el codificador visual y las activaciones.
- GPU recomendadas: no especificadas en la información proporcionada. Por el tamaño del modelo base, una GPU consumer con 8 GB o más de VRAM debería ser suficiente en FP16; para cuantización a 4 bits, GPUs con 6 GB podrían ser viables, aunque esto no está confirmado por el autor.
- ¿Cabe en GPU consumer? Probablemente sí, dado el tamaño del modelo base (2B), pero no hay confirmación oficial en la información disponible.
- Opciones de despliegue: la librería declarada es `peft`, con integración mediante el paquete Python `rigel` y la CLI `rigel-score`. No se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI; al ser un adaptador LoRA sobre un modelo de Hugging Face, podría cargarse con `transformers` + `peft`, pero no está verificado en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Rigel es un adaptador especializado en evaluación de captions, una categoría poco poblada en Hugging Face; las alternativas habituales serían métricas clásicas (BLEU, METEOR, CIDEr, SPICE) o evaluadores basados en modelos como CLIPScore, pero no se han proporcionado datos comparativos que permitan una tabla rigurosa.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rigel | 2.925.066 (adaptador) + 2B (base) | No disponible | Evaluacion de captions video/imagen | BSD-3-Clause | Hugging Face (0 descargas) |
| Alternativas | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al heredar el modelo base Qwen3-VL-2B-Instruct, podría arrastrar sesgos presentes en sus datos de entrenamiento, pero no se especifica.
- Riesgo de alucinación: al ser un modelo de scoring y no de generación libre, el riesgo de alucinación textual es bajo; sin embargo, la puntuación puede no correlacionarse con la calidad percibida por humanos en dominios fuera de distribución.
- Limitaciones de contexto o idioma: los idiomas soportados no están especificados; no se documenta el comportamiento multilingüe del adaptador ni del modelo base en esta ficha.
- Restricciones de licencia: BSD-3-Clause permite uso comercial, modificación y redistribución con atribución y sin garantía; es necesario conservar el aviso de copyright. Verificar también la licencia del modelo base Qwen3-VL-2B-Instruct, que puede tener condiciones adicionales.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica ausencia de validación comunitaria; no hay benchmarks publicados que respalden su calidad. El repositorio ocupa 0.0 GB, lo que sugiere que los pesos del adaptador podrían no estar completamente subidos o que el tamaño es mínimo; conviene verificar la integridad de los archivos antes de desplegar. La fecha de creación (2026-10-26) es posterior a la fecha actual, lo que puede indicar un error en los metadatos o una publicación programada; verificar la disponibilidad real.
- Dependencia del modelo base: requiere descargar Qwen3-VL-2B-Instruct, lo que añade latencia de arranque y requisitos de memoria no triviales para un adaptador de solo 2.9M de parámetros.

## Enlaces

- Hugging Face: https://huggingface.co/ShuitsuKoyama/Rigel
- Repositorio GitHub: https://github.com/SHUonkei/Rigel
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
