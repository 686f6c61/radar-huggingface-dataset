# minjaechoi/qwen3p6-35b-a3b-pin-2p02bit-r46

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal multimodal (texto e imagen) desarrollado por el equipo Qwen de Alibaba, publicado como el primer variante de pesos abiertos de la serie Qwen3.6 tras el lanzamiento de Qwen3.5 en febrero. Se trata de un modelo de arquitectura híbrida con mezcla de expertos (MoE) que combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas (Gated Attention), con 35.000 millones de parámetros totales y solo 3.000 millones activados por token. Está orientado explícitamente a cargas de trabajo de codificación agéntica, razonamiento a nivel de repositorio y flujos de trabajo frontend.

El repositorio analizado, `minjaechoi/qwen3p6-35b-a3b-pin-2p02bit-r46`, es una publicación de terceros (autor `minjaechoi`) que redistribuye pesos del modelo base Qwen3.6-35B-A3B bajo licencia Apache 2.0. El nombre del repositorio sugiere una variante cuantizada o "pineada" a 2,02 bits, pero los datos verificables no confirman esa afirmación: el recuento de parámetros de los safetensors (35.951.822.704) coincide con el del modelo base sin compresión y el tamaño del repositorio (71,9 GB) equivale prácticamente al peso de los parámetros en bf16 (aproximadamente 71,9 GB), lo que apunta a pesos almacenados en precisión completa.

Su relevancia actual radica en dos factores: por un lado, una ventana de contexto nativa de 262.144 tokens ampliable hasta 1.010.000, poco habitual en modelos de este tamaño; por otro, un rendimiento en tareas de agente de código (73,4 en SWE-bench Verified) que compite con modelos densos de mayor tamaño, manteniendo un coste de inferencia correspondiente a 3.000 millones de parámetros activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con encoder de visión; layout 10 × (3 × Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE) |
| Parametros totales | 35.951.822.704 (35B segun model card) |
| Parametros activos | 3B aproximados por token (MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | No documentados en la model card. El nombre del repositorio indica "2p02bit", dato no confirmado por los pesos publicados |
| Idiomas soportados | No disponible (la model card no incluye lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |
| Dimension oculta | 2048 |
| Numero de capas | 40 |
| Embedding de tokens | 248.320 (con padding); salida LM 248.320 (con padding) |
| Mixture of Experts | 256 expertos; 8 enrutados + 1 compartido activados; dimensión intermedia de experto 512 |
| Gated DeltaNet | 32 cabezas de atención lineal para V, 16 para QK; dimensión de cabeza 128 |
| Gated Attention | 16 cabezas para Q, 2 para KV; dimensión de cabeza 256; dimensión RoPE 64 |
| Multi-Token Prediction | Entrenado con MTP multi-paso |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Autor del repositorio | minjaechoi (publicación de terceros) |
| Tamano del repositorio | 71,9 GB |
| Descargas / likes | 7 descargas, 0 likes |
| Fecha de creacion | 2026-09-24 |

## Arquitectura y entrenamiento

El modelo es un transformer causal con encoder de visión cuyo bloque se repite siguiendo un patrón fijo: por cada cuatro subcapas, tres son Gated DeltaNet seguidas de una capa MoE y una es Gated Attention seguida de una capa MoE, patrón que se repite 10 veces hasta completar las 40 capas. Las capas DeltaNet implementan atención lineal recurrente (32 cabezas para el valor y 16 para query/key, con dimensión de cabeza 128), lo que reduce el coste asociado al contexto largo; las capas de Gated Attention usan 16 cabezas de query y solo 2 de key/value con dimensión de cabeza 256, una configuración de atención agrupada muy agresiva que disminuye el tamaño de la caché KV. La dimensión oculta es de 2048 y el vocabulario de 248.320 tokens con padding.

La componente MoE cuenta con 256 expertos, de los que se activan 8 enrutados más 1 compartido por token, con dimensión intermedia de 512 por experto. El modelo se entrenó en dos fases (preentrenamiento y postentrenamiento) e incorpora Multi-Token Prediction con varios pasos, técnica que permite decodificación especulativa nativa y acelera la generación. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO en la fase de postentrenamiento; tampoco describe el encoder de visión más allá de su presencia. La novedad funcional destacada por el autor es la "preservación de pensamiento" (Thinking Preservation), una opción que retiene el contexto de razonamiento de mensajes históricos para reducir la sobrecarga en iteraciones sucesivas de desarrollo.

## Capacidades

- Generación de texto conversacional en formato multimodal imagen-texto, con encoder de visión integrado.
- Codificación agéntica: resolución de tareas a nivel de repositorio y flujos de trabajo frontend, según los resultados en SWE-bench Verified, SWE-bench Multilingual y SWE-bench Pro.
- Ejecución en terminal y entornos de línea de comandos, evaluada mediante Terminal-Bench 2.0.
- Razonamiento multi-paso con modo de pensamiento y preservación opcional del contexto de razonamiento entre turnos.
- Decodificación especulativa nativa gracias al entrenamiento con Multi-Token Prediction multi-paso.
- Soporte de contexto muy largo: 262.144 tokens nativos, ampliable hasta 1.010.000 tokens.
- Capacidad multilingüe en código: la model card reporta resultados en SWE-bench Multilingual, aunque no enumera los idiomas naturales soportados.
- Tool calling / function calling: no se documenta explícitamente en la model card; los benchmarks de agente (SWE-bench, Terminal-Bench) implican uso de herramientas, pero el formato concreto de llamadas a funciones no está detallado en la información disponible.
- Integración con Hugging Face Transformers, vLLM, SGLang y KTransformers.

## Casos de uso

- Reparación automática de incidencias en repositorios: el modelo puede recibir un repositorio completo y un informe de error, localizar los ficheros afectados y proponer un parche, como refleja su puntuación de 73,4 en SWE-bench Verified y 67,2 en SWE-bench Multilingual.
- Agentes de terminal para operaciones de desarrollo: con Terminal-Bench 2.0 como referencia, encaja en asistentes que ejecutan comandos, interpretan su salida y encadenan pasos hasta completar una tarea de configuración o depuración.
- Asistencia de desarrollo frontend: la model card destaca específicamente la mejora en flujos de trabajo frontend, útil para generar componentes, migrar frameworks o corregir estilos en proyectos grandes.
- Análisis de documentación técnica extensa con visión: al aceptar entrada de imagen y texto con 262.144 tokens de contexto, permite procesar diagramas de arquitectura, capturas de paneles y manuales completos en una sola consulta sin trocear el material.
- Revisión de código en pipelines de CI/CD: el modelo puede integrarse como paso de revisión que lee el diff, consulta el contexto del repositorio y publica comentarios, aprovechando la preservación de pensamiento para mantener coherencia entre iteraciones.
- Migraciones de código a gran escala: con contexto ampliable hasta 1.010.000 tokens y razonamiento a nivel de repositorio, es adecuado para tareas de refactorización que afectan a cientos de ficheros y requieren consistencia global.
- Agentes conversacionales de soporte técnico especializado: conversaciones multi-turno con historial largo donde el modo de pensamiento preservado evita repetir el razonamiento ya realizado en turnos anteriores.
- Extracción estructurada de información de capturas y documentos: gracias al pipeline image-text-to-text, puede transcribir y estructurar datos de imágenes combinadas con instrucciones textuales.

## Benchmarks y rendimiento

Datos publicados en la model card del modelo base. Todos los valores son porcentajes de éxito. La tabla original está parcialmente truncada en la información disponible: solo se han podido recuperar completas las filas de SWE-bench Verified, SWE-bench Multilingual y SWE-bench Pro.

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35B-A3B | Gemma4-26B-A4B | Qwen3.6-35B-A3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones generales en la información proporcionada. La model card enlaza una figura con el conjunto completo de resultados (`qwen3.6_35b_a3b_score.png`) que no se ha podido leer en su totalidad.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (35,95B) y de la configuración de atención publicada. No proceden de mediciones del autor.

- Pesos en bf16/fp16: en torno a 72 GB. Requiere al menos una GPU de 80 GB (H100, A100 80 GB) o dos de 40 GB con paralelismo tensorial; el repositorio ocupa 71,9 GB, coherente con este escenario.
- Pesos en int8: aproximadamente 36 GB, encaja en una A100 40 GB o una L40S 48 GB.
- Pesos en int4: alrededor de 18 GB, viable en RTX 4090, RTX 3090 o L4 con contexto moderado.
- Cuantización a 2 bits (según el nombre del repositorio, no confirmada): en torno a 9-10 GB, cabría en GPUs consumer de 12-16 GB, pero no hay evidencia en los artefactos publicados de que los pesos estén realmente a esa precisión.
- Caché KV: con 2 cabezas KV de dimensión 256 en 10 de las 40 capas, el coste estimado es de unos 2 KB por capa y token en bf16, es decir, cerca de 20 KB por token en total; a 262.144 tokens suponen unos 5,2 GB adicionales y a 1.010.000 tokens aproximadamente 20 GB.
- Cabe en GPU consumer: sí en cuantizaciones de 4 bits o inferiores con contexto reducido; en bf16 no cabe en ninguna GPU consumer actual de 24 GB.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers, según la model card. No se confirma soporte de llama.cpp, Ollama, TGI ni formato GGUF.
- Latencia y throughput: no disponibles. El uso de solo 3B parámetros activos y de Multi-Token Prediction debería favorecer el throughput, pero no hay cifras publicadas.

## Comparativa con modelos similares

Los modelos comparables aparecen en la propia tabla de benchmarks del autor. No se dispone de especificaciones técnicas de esas alternativas en la información proporcionada, por lo que las celdas de parámetros, contexto y licencia se marcan como no disponibles.

| Modelo | Parametros | Contexto | SWE-bench Verified | SWE-bench Pro | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B totales, 3B activos (MoE) | 262.144 nativos, hasta 1.010.000 | 73,4 | 49,5 | Apache 2.0 |
| Qwen3.5-35B-A3B | no disponible (MoE) | no disponible | 70,0 | 44,6 | no disponible |
| Qwen3.5-27B | no disponible (denso) | no disponible | 75,0 | 51,2 | no disponible |
| Gemma4-31B | no disponible | no disponible | 52,0 | 35,7 | no disponible |
| Gemma4-26B-A4B | no disponible (MoE) | no disponible | 17,4 | 13,8 | no disponible |

Observaciones derivadas de los datos: Qwen3.6-35B-A3B supera a su predecesor Qwen3.5-35B-A3B en las tres pruebas de SWE-bench y queda por detrás del denso Qwen3.5-27B, que es un modelo con muchos más parámetros activos. En SWE-bench Multilingual la diferencia con el denso es de 2,1 puntos.

## Limitaciones y advertencias

- Repositorio de terceros: la publicación no procede de Alibaba ni del equipo Qwen. No hay verificación independiente de la integridad o fidelidad de los pesos respecto al modelo oficial.
- Discrepancia en la nomenclatura: el nombre indica "2p02bit" pero el recuento de parámetros y el tamaño del repositorio corresponden a pesos sin cuantizar. Quien necesite una versión de 2 bits debe verificar los ficheros antes de desplegar.
- Sin métricas de adopción: 7 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Idiomas no documentados: la model card no enumera los idiomas naturales soportados, por lo que no se puede garantizar un comportamiento fiable en castellano sin evaluación previa.
- Alucinación: no se publican tasas de alucinación ni evaluaciones de veracidad. En tareas de código, un parche plausible pero incorrecto es un riesgo real y exige validación con tests automáticos.
- Sesgos: no hay información sobre evaluación de sesgos ni sobre la composición del dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se desconoce la licencia y los términos aplicables a dependencias adicionales como el encoder de visión; conviene revisar el enlace de licencia del modelo base indicado en la model card.
- Tool calling no documentado: aunque los benchmarks de agente implican uso de herramientas, no se especifica el formato de llamadas a funciones ni su fiabilidad, lo que complica la integración en producción sin pruebas previas.
- Contexto máximo y calidad: la extensión hasta 1.010.000 tokens es una capacidad declarada, no una garantía de recuperación efectiva de información en esa longitud; no hay resultados publicados de evaluaciones tipo needle-in-a-haystack.
- Estado del proyecto: sin información sobre mantenimiento, versiones posteriores o soporte del autor del repositorio.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/minjaechoi/qwen3p6-35b-a3b-pin-2p02bit-r46
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Entrada de blog de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
- Figura de resultados de benchmarks: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3.6/Figures/qwen3.6_35b_a3b_score.png
- Logo del modelo: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.6/logo.png

La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo ni con la serie Qwen3.6; los únicos enlaces disponibles son los que figuran en la model card y en la ficha de Hugging Face.
