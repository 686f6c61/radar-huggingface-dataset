# sergolsub/d3-turbo-27B-MLX-4bit

## Resumen

`sergolsub/d3-turbo-27B-MLX-4bit` es una conversión cuantizada a 4 bits en formato MLX del modelo `vllm-sr/d3-turbo`, publicada por el usuario sergolsub. Su propósito no es la generación de texto libre, sino la toma de decisiones estructuradas: el modelo expone una API `decide()` que devuelve respuestas tipadas (booleano sí/no, elección entre categorías, puntuación sobre una escala y localización de cajas delimitadoras) a partir de una entrada en lenguaje natural y una especificación de la tarea. Está pensado para ejecutarse en Apple Silicon mediante `mlx_lm`.

El modelo base tiene 26.085.330.160 parámetros (aproximadamente 27B) y la conversión ocupa 14,9 GB en disco, con un pico de memoria residente medido de 15,79 GB en un Mac mini M4 Pro de 48 GB. La licencia es Apache 2.0, heredada de los pesos originales. El repositorio incluye código personalizado (`d3_mlx.py`), configuración de decisión (`decision_config.json`), una auditoría KL (`kl_audit.json`) y una cabeza de lectura (`readout.safetensors`), lo que indica una arquitectura con cabezas especializadas más allá del decoder transformer convencional.

La relevancia actual radica en su enfoque: en lugar de competir en generación generalista, empaqueta un modelo de 27B para tareas de clasificación y enrutamiento con latencia medible (mediana de 2.119 ms por decisión, 0,72 decisiones cortas por segundo en el hardware citado). Es una pieza útil para pipelines de triaje, enrutamiento de tickets y control de calidad, aunque la información pública sobre su entrenamiento y evaluación es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabezas de decisión especializadas (tag `qwen3_5`, `custom_code`); detalles completos no disponibles |
| Parametros totales | 26.085.330.160 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine MLX (derivada de una conversión previa a 8-bit); otros formatos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout MLX), 25 shards; incluye `readout.safetensors` y código Python de carga |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio: `qwen3_5` sugiere una base de la familia Qwen 3.5 y `custom_code` confirma que requiere código propio para cargarse. El repositorio incluye `d3_mlx.py` (40,7 KB), `decision_config.json` (7,5 KB), `joint_config.json` y `readout.safetensors` (5 MB), lo que apunta a un decoder transformer con cabezas de decisión añadidas para cuatro tipos de tarea: `noul` (booleano), `choice` (selección entre criterios), `score` (puntuación ordinal) y `box` (detección de cajas, con `preprocessor_config.json` y `video_preprocessor_config.json` que sugieren entrada multimodal).

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La conversión a 4 bits se realizó dequantizando la versión 8-bit y requantizando con cuantización affine de mismo tamaño de grupo, sin reentrenamiento ni cambios de arquitectura, según la model card. El archivo `kl_audit.json` (106 KB) sugiere que el autor realizó una auditoría de divergencia KL entre la versión original y la cuantizada, aunque su contenido no está publicado en la información disponible.

## Capacidades

- Toma de decisiones booleanas (`noul`): responder sí/no a preguntas formuladas sobre un texto de entrada.
- Clasificación por elección (`choice`): seleccionar una categoría entre un conjunto de criterios con descripción.
- Puntuación ordinal (`score`): asignar un valor sobre una escala definida por el usuario (por ejemplo, gravedad de una incidencia).
- Localización visual (`box`): devolver cajas delimitadoras sobre una imagen, según el ejemplo de la model card con una señal de stop.
- Procesamiento de lenguaje natural de entrada con contexto de ticket o incidencia.
- Posible soporte multimodal (imagen y vídeo) inferido de los ficheros de preprocesado, aunque no confirmado explícitamente.
- No se documenta soporte de tool calling, agentes multi-paso, modo thinking ni generación de texto libre.

## Casos de uso

- Triaje de tickets de soporte: clasificar cada incidencia entrante en un equipo (facturación, envío, técnico) usando el tipo `choice` con criterios definidos; el modelo devuelve la categoría directamente, sin necesidad de postprocesar texto libre.
- Detección de intención de reembolso: aplicar el tipo `noul` sobre el cuerpo del mensaje del cliente para decidir si solicita reembolso y enrutar al flujo adecuado.
- Priorización de incidencias: usar el tipo `score` con una escala como `["cosmetic", "annoying", "blocks"]` para asignar gravedad y ordenar la cola de trabajo.
- Control de calidad de respuestas: evaluar si una respuesta generada por otro sistema cumple un criterio binario o una escala, actuando como juez automático en un pipeline de evaluación.
- Moderación y verificación visual: localizar objetos concretos en imágenes (tipo `box`) para tareas de revisión de contenido o inspección.
- Enrutamiento en asistentes conversacionales: decidir a qué subagente o herramienta derivar una consulta antes de invocar un LLM generativo, reduciendo coste y latencia del sistema completo.
- Ejecución local en portátiles Apple Silicon: al caber en 15,79 GB de memoria en un M4 Pro, permite desplegar el modelo en estaciones de trabajo sin GPU dedicada para tareas de decisión sensibles a la privacidad.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la model card, medidos en un Mac mini M4 Pro de 48 GB con MLX 4-bit:

| Metrica | Valor |
|---|---|
| Tamano en disco | 14,87 GB |
| Tiempo de carga | 7,54 s |
| Memoria residente pico | 15,79 GB |
| Latencia mediana de decision | 2.119 ms |
| Throughput sostenido (decisiones cortas) | 0,72 /s |
| Precision tras cuantizacion 4-bit | 84,4 % |
| Precision `noul` | 85,0 % |
| Precision `choice` | 84,0 % |
| Precision `score` | 84,0 % |
| Perplejidad de calibracion | 2,075 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~15,8 GB en pico con cuantización 4-bit MLX; el repo ocupa 14,9 GB en disco.
- Hardware validado: Mac mini M4 Pro con 48 GB de memoria unificada.
- Cabe en equipos Apple Silicon consumer con al menos 16 GB de memoria unificada, aunque con margen ajustado; se recomienda 24 GB o más para evitar swap.
- No está pensado para GPU NVIDIA: el formato es MLX y requiere la librería `mlx_lm`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Despliegue mediante `huggingface_hub.snapshot_download` y el módulo `d3_mlx.py` incluido en el repositorio.
- Latencia de referencia: ~2,1 s por decisión y 0,72 decisiones cortas por segundo en el hardware citado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos en la información proporcionada. El modelo base `vllm-sr/d3-turbo` es la referencia más cercana, pero sus especificaciones completas no están disponibles en esta ficha. Se puede comparar con la versión 8-bit del mismo modelo (de la que deriva esta conversión), aunque no se publican sus métricas en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sergolsub/d3-turbo-27B-MLX-4bit | ~27B | no disponible | Apache 2.0 | MLX safetensors 4-bit | Esta ficha |
| vllm-sr/d3-turbo (base) | ~27B (presumible) | no disponible | Apache 2.0 | no disponible | Modelo original |
| Version 8-bit MLX del mismo modelo | ~27B | no disponible | Apache 2.0 | MLX safetensors 8-bit | Referenciada en la model card, sin métricas publicadas |

## Limitaciones y advertencias

- Información pública muy escasa: no se documentan idiomas, contexto, dataset ni metodología de evaluación, lo que dificulta validar su comportamiento fuera del hardware del autor.
- Las métricas de precisión (84,4 %) proceden de la evaluación propia del autor y no de un benchmark independiente; deben tomarse con cautela.
- La cuantización a 4 bits puede degradar casos límite no cubiertos por la evaluación del autor; el archivo `kl_audit.json` sugiere que existe una auditoría, pero su contenido no está publicado.
- Requiere código personalizado (`d3_mlx.py`) para cargarse; no es compatible con pipelines estándar de transformers sin ese glue.
- El modelo devuelve decisiones estructuradas, no texto libre; no debe usarse como chatbot generativo.
- Riesgo de alucinación en las categorías o puntuaciones devueltas: al ser un clasificador, puede forzar una respuesta incluso ante entradas ambiguas.
- No se documentan sesgos conocidos; al desconocerse el dataset de entrenamiento, no es posible evaluar sesgos de dominio, idioma o demografía.
- Licencia Apache 2.0 permite uso comercial, pero la model card indica que prevalece la licencia del repositorio original en caso de conflicto; conviene revisar `vllm-sr/d3-turbo` antes de desplegar en producción.
- Sin garantías de soporte ni mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sergolsub/d3-turbo-27B-MLX-4bit
- Modelo base: https://huggingface.co/vllm-sr/d3-turbo
- Librería MLX: https://github.com/ml-explore/mlx
- `mlx_lm`: https://github.com/ml-explore/mlx-lm
