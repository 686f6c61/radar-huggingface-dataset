# Saraswathy/vlm-mix-exact-cat-stem60-geometry40

## Resumen

Este repositorio contiene un adaptador LoRA de rango 128 para el modelo de visión-lenguaje Qwen/Qwen3-VL-4B-Instruct, creado por Saraswathy como parte de experimentos de mezcla de modelos (VLM mixture/PoEM). El adaptador se obtiene mediante una suma ponderada exacta de los deltas de dos especialistas entrenados por separado: un especialista STEM (60 % de peso) y un especialista en geometría (40 %). El resultado es un adaptador único que combina las capacidades de ambos dominios sin necesidad de reentrenar el modelo completo.

El adaptador se distribuye en formato PEFT con pesos safetensors y requiere cargar el modelo base Qwen3-VL-4B-Instruct en una revisión concreta (ebb281ec70b05090aa6165b016eac8ec08e71b17). Es un artefacto de investigación pública, sin métricas de rendimiento publicadas en la model card, y con cero descargas o valoraciones en el momento de la consulta. Su relevancia radica en demostrar una metodología de fusión de adaptadores LoRA mediante mezcla ponderada exacta, una técnica que puede interesar a investigadores que trabajan con especialización de modelos y composición de habilidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-VL-4B-Instruct (transformer de visión-lenguaje) |
| Parametros totales | No disponible (solo adaptador; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base, no se especifica) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 128 y alpha 128, aplicado sobre Qwen3-VL-4B-Instruct. Según la model card, se trata de una fusión exacta de dos adaptadores independientes: uno entrenado para tareas STEM amplias y otro especializado en geometría. La combinación se realiza como suma ponderada de los deltas de LoRA con coeficientes 0.6 y 0.4 respectivamente. El repositorio incluye un archivo `merge_audit.json` que fija rutas, coeficientes, escalas y hashes para garantizar la reproducibilidad.

No se proporcionan detalles sobre el proceso de entrenamiento de los especialistas: ni número de tokens, ni composición del dataset, ni uso de RLHF o DPO. Tampoco se indica si hubo ajuste fino adicional tras la fusión. El adaptador está anclado a una revisión específica del modelo base, lo que sugiere que los resultados de evaluación dependen críticamente de esa versión exacta.

## Capacidades

- Al ser un adaptador sobre Qwen3-VL-4B-Instruct, hereda las capacidades del modelo base: comprensión conjunta de imágenes y texto, respuesta a preguntas visuales, razonamiento sobre diagramas y figuras.
- La mezcla ponderada STEM (60 %) y geometría (40 %) pretende reforzar el rendimiento en tareas de razonamiento científico y geométrico, aunque no se aportan evidencias cuantitativas en la model card.
- Soporte de tool calling y funciones de agente: no se especifica, pero el modelo base Qwen3-VL-4B-Instruct incluye estas capacidades; el adaptador no las elimina en principio.
- Capacidades multilingües: no se informa, aunque el modelo base es multilingüe.
- No se documentan modos especiales como thinking mode, visión avanzada o audio.

## Casos de uso

- Investigación en composición de adaptadores: este artefacto sirve como referencia para estudiar cómo fusionar LoRAs entrenados en dominios distintos mediante pesos fijos, y para validar si la mezcla ponderada produce mejoras frente a usar cada especialista por separado.
- Razonamiento visual en entornos educativos: el especialista en geometría podría aplicarse a problemas de geometría plana o espacial presentados como imágenes, aunque sin benchmarks no se puede garantizar su eficacia.
- Análisis de figuras científicas: la componente STEM puede ayudar a interpretar gráficos, tablas y diagramas en documentos técnicos, aprovechando la base de Qwen3-VL.
- Prototipado de asistentes de tareas con imágenes: al ser un adaptador ligero, se puede cargar sobre el modelo base para experimentar con pipelines de imagen-texto sin reentrenar el modelo completo.
- Estudio de reproducibilidad: el repositorio incluye hashes y metadatos de fusión, lo que permite auditar el proceso de mezcla y comparar con otras estrategias de combinación.
- Evaluación de especialización por dominio: permite comparar el rendimiento del adaptador mezclado frente a los especialistas individuales en tareas STEM y de geometría, siempre que se disponga de los benchmarks del proyecto original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los resultados de comparación se mantienen en un repositorio de experimentos separado, pero no se proporciona ningún enlace ni cifra concreta.

## Requisitos de hardware

- El adaptador en sí ocupa 1.1 GB, pero para inferencia es necesario cargar el modelo base Qwen3-VL-4B-Instruct completo.
- Estimación de VRAM para el modelo base en FP16: aproximadamente 8-9 GB (4B parámetros × 2 bytes). Con cuantización INT8 se reduce a unos 4-5 GB; en INT4, alrededor de 2.5-3 GB.
- GPU recomendadas: tarjetas con al menos 10 GB de VRAM para FP16 (RTX 3080/3090, A10, A100). Con cuantización 4-bit puede caber en GPUs de 6 GB (RTX 2060, RTX 3060).
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de Hugging Face sobre el modelo base. Para inferencia servida, se puede usar vLLM, TGI o llama.cpp (si se convierte el adaptador a GGUF), aunque no se documenta compatibilidad específica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros adaptadores o modelos VLM de tamaño similar. El único punto de referencia es el propio modelo base Qwen3-VL-4B-Instruct, pero sin métricas del adaptador no es posible establecer una comparación cuantitativa. Se indica "no disponible".

## Limitaciones y advertencias

- Es un artefacto de investigación sin validación externa: cero descargas, cero likes y sin benchmarks publicados. No debe usarse en producción sin una evaluación rigurosa previa.
- El adaptador requiere la revisión exacta del modelo base especificada (ebb281ec70b05090aa6165b016eac8ec08e71b17). Cargarlo sobre otra revisión puede producir resultados inconsistentes o fallos.
- Solo contiene pesos del adaptador; el usuario debe obtener el modelo base por separado, lo que añade complejidad de despliegue.
- No se informa sobre sesgos, alucinaciones o limitaciones idiomáticas. El modelo base Qwen3-VL puede presentar sesgos heredados de sus datos de entrenamiento, pero no se documenta nada específico para este adaptador.
- La licencia Apache-2.0 permite uso comercial, pero al derivar de Qwen3-VL-4B-Instruct, se deben respetar también los términos de la licencia del modelo base (Apache-2.0).
- No hay garantía de que la mezcla ponderada mejore el rendimiento frente a los especialistas individuales; la técnica es experimental y carece de evidencia publicada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Saraswathy/vlm-mix-exact-cat-stem60-geometry40
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- No se han encontrado otros enlaces (papers, blogs, repos de experimentos) en la información disponible.
