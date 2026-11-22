# AlexHung29629/gemma4-26b-a4b-mopd-merged-student-78steps

## Resumen

El modelo `gemma4-26b-a4b-mopd-merged-student-78steps`, publicado por el usuario AlexHung29629 en Hugging Face, es un derivado de la familia Gemma 4 con arquitectura de mezcla de expertos (MoE), según indican sus etiquetas y el patrón de nomenclatura "26b-a4b" (26 mil millones de parámetros totales, aproximadamente 4 mil millones activos). El checkpoint se presenta como un "student" destilado mediante un pipeline que combina GRPO (Group Relative Policy Optimization), destilación on-policy (OPD) y técnicas de fusión de modelos (DARE y TIES), con un total de 78 pasos de entrenamiento registrados en el nombre.

El modelo está orientado a tareas multimodales de imagen-texto a texto (`image-text-to-text`) y a uso conversacional y agéntico, con etiquetas que mencionan PinchBench y capacidades de agente. Su relevancia radica en que ejemplifica una tendencia actual: la construcción de modelos derivados mediante post-entrenamiento (RL y destilación) sobre arquitecturas abiertas de gran tamaño, empaquetados con licencia Apache 2.0. No obstante, se trata de un checkpoint de investigación con cero descargas y cero "likes" en el momento de la consulta, sin documentación publicada sobre datos de entrenamiento ni resultados de evaluación.

El acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face para descargar los pesos, que ocupan 50,5 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia Gemma 4 (según etiquetas) |
| Parametros totales | 25.233.141.790 (≈25,2 B) |
| Parametros activos | ≈4 B (inferido del sufijo "a4b"; no confirmado en documentación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) de la familia Gemma 4, con 25,2 mil millones de parámetros totales y, presumiblemente, alrededor de 4 mil millones activos por token, a juzgar por el sufijo "a4b" del identificador. El modelo es multimodal: la pipeline declarada es `image-text-to-text`, por lo que incorpora codificación de imagen además del decodificador de texto. No se dispone de información publicada sobre el número de tokens de entrenamiento, la composición del dataset ni la configuración exacta de los expertos.

El proceso de post-entrenamiento se deduce del nombre y de las etiquetas: se trata de un modelo "student" obtenido mediante destilación on-policy (OPD) y optimización con GRPO, con un total de 78 pasos. Las etiquetas `dare` y `ties` indican que se aplicaron técnicas de fusión de modelos (DARE para poda y reescalado de deltas de pesos, TIES para resolver interferencias entre checkpoints fusionados). El resultado es un checkpoint fusionado que combina las capacidades de un modelo profesor con las del estudiante entrenado por RL. No hay información pública sobre la receta exacta, los hiperparámetros ni el modelo profesor utilizado.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational`.
- Procesamiento de imagen y texto de entrada (`image-text-to-text`), lo que habilita tareas de descripción, respuesta a preguntas visuales y razonamiento sobre imágenes.
- Comportamiento agéntico y uso de herramientas, según las etiquetas `agent` y `pinchbench`.
- Razonamiento multi-paso orientado a tareas, derivado del entrenamiento con GRPO.
- Capacidades multilingües: no documentadas explícitamente; los idiomas soportados figuran como no disponibles.
- No se documentan modos de "thinking", audio ni otras modalidades más allá de imagen y texto.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede recibir una imagen junto con una pregunta y mantener una conversación multi-turno sobre ella, adecuado para soporte técnico donde el usuario adjunta capturas de pantalla.
- Automatización de atención al cliente con contexto visual: gestión de tickets que incluyen imágenes (productos dañados, errores en pantalla) combinando comprensión visual y generación de respuestas.
- Agente para tareas de oficina: uso del soporte agéntico y de tool calling para encadenar acciones como consultar APIs, resumir documentos y redactar correos.
- Extracción de información de documentos escaneados: al ser image-text-to-text, puede procesar facturas o formularios fotografiados y devolver campos estructurados.
- Evaluación de razonamiento visual en investigación: útil como checkpoint de referencia para estudiar el efecto de GRPO y la destilación on-policy sobre un MoE multimodal.
- Prototipado de asistentes con acceso a herramientas en entornos de investigación, dado que la licencia Apache 2.0 facilita la experimentación sin restricciones de uso comercial.
- Generación de descripciones accesibles de imágenes en pipelines de publicación de contenido, siempre que se valide la calidad con evaluación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las etiquetas mencionan `pinchbench`, pero no se aportan cifras ni metodología.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 50 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se requieren 2×A100 80 GB o 2×H100 80 GB para servicio cómodo.
- En cuantización de 8 bits: alrededor de 25-27 GB de pesos, lo que permite ejecución en una única A100 40 GB o H100 80 GB.
- En cuantización de 4 bits (si se generan pesos GGUF/AWQ, no publicados): en torno a 13-15 GB, potencialmente ejecutable en una RTX 4090 de 24 GB, aunque la decodificación MoE y la parte visual añaden overhead.
- No cabe en GPUs de consumo de 8-12 GB ni en la mayoría de portátiles.
- Opciones de despliegue: vLLM o TGI para servicio con alto throughput; llama.cpp u Ollama solo si se generan cuantizaciones GGUF (no disponibles oficialmente); transformers para inferencia de referencia.
- Latencia y throughput: no disponibles; al ser un MoE con ~4 B activos, el throughput debería ser superior al de un denso de 25 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gemma4-26b-a4b-mopd-merged-student-78steps | 25,2 B totales / ~4 B activos | no disponible | Apache 2.0 | Gated en HF | Checkpoint de investigación sin benchmarks publicados |
| Gemma 3 27B (referencia de familia) | 27 B densos | 128 K (según documentación pública de Google) | Gemma Terms | Abierto en HF | Denso, sin MoE; ampliamente evaluado |
| Qwen2.5-VL-7B | 7 B densos | 128 K (según documentación pública) | Apache 2.0 | Abierto en HF | Multimodal, menor tamaño, benchmarks publicados |
| Mixtral 8x7B | 46,7 B totales / ~12,9 B activos | 32 K | Apache 2.0 | Abierto en HF | MoE de texto, sin visión |

La comparación con Gemma 3 27B y Qwen2.5-VL-7B es orientativa: no existen evaluaciones del modelo de AlexHung29629 que permitan contrastar rendimiento real.

## Limitaciones y advertencias

- No se han publicado datos de entrenamiento, evaluación ni benchmarks; la calidad real del checkpoint es desconocida.
- El acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar, lo que puede limitar la reproducibilidad.
- Cero descargas y cero "likes" en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- Riesgo elevado de alucinación y de comportamientos no verificados, especialmente en tareas visuales y agénticas.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano.
- Aunque la licencia es Apache 2.0, el modelo deriva de Gemma 4; conviene revisar las condiciones de la familia base por si imponen restricciones adicionales sobre los pesos derivados.
- El proceso de fusión DARE/TIES y la destilación con 78 pasos pueden introducir degradaciones no documentadas respecto al modelo profesor.
- No hay cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que dificulta el despliegue en hardware de consumo.
- Para producción se recomienda evaluación propia exhaustiva antes de cualquier uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlexHung29629/gemma4-26b-a4b-mopd-merged-student-78steps
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
