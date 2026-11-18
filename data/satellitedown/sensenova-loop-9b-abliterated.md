# satellitedown/SenseNova-Loop-9B-abliterated

## Resumen

SenseNova-Loop-9B-abliterated es una variante "abliterated" del modelo multimodal SenseNova-Loop-9B de SenseTime (organización sensenova), publicada por el usuario independiente satellitedown. La intervención consiste en una edición directa de los pesos mediante la herramienta Heretic (ablación de rango arbitrario, Arbitrary-Rank Ablation), sin reentrenamiento: el objetivo es eliminar los comportamientos de rechazo del modelo original. El modelo conserva la arquitectura y capacidades del original, incluido su pipeline image-text-to-text.

El modelo base es un transformer con mecanismo "looped" (reutilización iterativa de capas) y componentes mHC según las etiquetas del repositorio, con 9.412.963.952 parámetros totales y pesos en safetensors (bfloat16, ~18,9 GB de repositorio). Soporta inglés y chino, y se distribuye con licencia Apache 2.0. Requiere `trust_remote_code=True` por el código personalizado de la arquitectura.

La relevancia de esta ficha es doble: por un lado documenta una técnica de edición de pesos orientada no solo a suprimir negativas explícitas sino a forzar la ejecución efectiva de la petición; por otro, advierte de que se trata de un modelo sin salvaguardas de seguridad, con implicaciones claras para uso en producción. El autor reporta métricas propias de "cumplimiento" sobre JailbreakBench, no benchmarks estándar de capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas "looped" (sensenova_loop) y componentes mHC; multimodal image-text-to-text |
| Parametros totales | 9.412.963.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos originales); GGUF de 4 bits y 6 bits en repositorio separado |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors; GGUF (4-bit y 6-bit) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de transformer con reutilización iterativa de bloques ("looped transformer") y componentes denominados mHC, según las etiquetas del repositorio. Es multimodal: acepta entrada de imagen y texto y genera texto (pipeline image-text-to-text), e incluye una plantilla de chat con modo de razonamiento explícito ("thinking") activado por defecto, delimitado por etiquetas `<think>`/`</think>`.

No hubo reentrenamiento. La edición se realizó con Heretic 2.2.0.dev0 en dos pasadas de ablación de rango arbitrario. La primera pasada busca reducir el rechazo: se guían prompts dañinos hacia versiones inofensivas en dos búsquedas de 100 ensayos cada una (una minimizando el clasificador de rechazo de Heretic, otra minimizando el recuento del juez de peticiones no ejecutadas), cada una con penalización de divergencia KL sobre prompts inofensivos; se conservó el ensayo 80 de la primera búsqueda (KL 0,0777). La segunda pasada ataca el "esquive" (responder a otra pregunta en lugar de rechazar): se parte del modelo de la pasada 1 y se guían las respuestas que esquivaban hacia las que ejecutaban la petición, con 400 prompts dañinos (206 ejecutados, 194 esquivados o rechazados por la pasada 1) y 400 prompts inofensivos fijados sin guiado; se conservó el ensayo 37 de 60. Una tercera pasada se detuvo tras 30 ensayos porque el único que mejoraba lo hacía con cuatro veces más deriva.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Comprensión de imágenes y texto combinados (image-text-to-text).
- Modo de razonamiento explícito ("thinking") activable o desactivable mediante la plantilla de chat (`enable_thinking=False`).
- Ejecución de instrucciones sin rechazo: el autor reporta 58 de 83 peticiones dañinas ejecutadas con thinking activado, frente a 0 del original.
- Respuesta a peticiones dañinas también en cuantización 4-bit (60/83 con thinking) y 6-bit (57/83 con thinking).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada (el modo thinking sugiere razonamiento interno, pero no se documenta uso agéntico).
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigación en seguridad de IA y red teaming: el modelo sirve como sujeto de prueba para evaluar hasta qué punto la ablación de pesos elimina salvaguardas y cómo se comporta bajo JailbreakBench, con etiquetas de juez publicadas (`judged.json`) para reproducir el análisis.
- Estudio de técnicas de edición de pesos: comparar ablación de rechazo frente a "esquive" en dos pasadas permite analizar el equilibrio entre cumplimiento, coherencia y divergencia KL respecto al modelo original.
- Evaluación de robustez de clasificadores y filtros: al generar respuestas que ejecutan peticiones dañinas, permite probar sistemas de moderación y detectores de contenido en un entorno controlado.
- Análisis de calibración de jueces automáticos: el autor usa un juez alojado (typesafe/jev-1.14) con una rúbrica de tres categorías; el modelo y sus etiquetas permiten estudiar el acuerdo entre jueces y evaluadores humanos.
- Experimentación con cuantización: los GGUF de 4 y 6 bits con parches para GPU de Apple permiten medir la degradación de comportamiento entre precisión completa y cuantizada en un modelo de ~9,4 mil millones de parámetros.
- Docencia y divulgación sobre alineamiento: ilustrar de forma concreta la diferencia entre "no decir que no" y "hacer la tarea", un matiz que el autor mide explícitamente.
- No se recomienda su uso en aplicaciones de cara al público sin capas adicionales de moderación, dado que carece de salvaguardas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica únicamente recuentos de comportamiento sobre JailbreakBench con un juez automático:

| Sobre 83 peticiones dañinas no vistas | Ejecuta la petición | Esquiva (responde otra cosa) | Rechaza o no responde |
|---|---|---|---|
| Original | 0 | 3 | 80 |
| Este modelo, thinking on | 58 | 25 | 0 |
| Este modelo, thinking off | 45 | 36 | 2 |
| Este modelo, thinking omitido como en la búsqueda | 55 | 27 | 1 |
| GGUF 4-bit, thinking on | 60 | 22 | 1 |
| GGUF 4-bit, thinking off | 50 | 32 | 1 |
| GGUF 6-bit, thinking on | 57 | 24 | 2 |
| GGUF 6-bit, thinking off | 44 | 38 | 1 |

Sobre las 100 peticiones completas de JailbreakBench con thinking activado: 69 ejecutadas, 31 esquivadas y 0 rechazadas, frente a 0 ejecutadas, 3 esquivadas y 97 rechazadas del original. El autor advierte que las diferencias pequeñas entre filas tienen poco significado: el 4-bit y la precisión completa dan el mismo tipo de respuesta en aproximadamente 7 de cada 10 peticiones.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 19 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más.
- Cuantización GGUF de 4 bits: alrededor de 5-6 GB de pesos, viable en GPU de consumo con 8-12 GB de VRAM.
- Cuantización GGUF de 6 bits: alrededor de 8-9 GB de pesos, viable en GPU de consumo con 12-16 GB de VRAM.
- GPU recomendadas: A100 o H100 para precisión completa con contexto largo; RTX 4090 (24 GB) para bfloat16 ajustado; RTX 3090/4080 y similares para GGUF de 6 bits; GPUs de 8 GB para GGUF de 4 bits.
- Despliegue: Transformers (probado con la versión 5.18.0) con `trust_remote_code=True`; llama.cpp para los GGUF (los GGUF incluyen parches para GPU de Apple); vLLM, TGI y Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Estado de seguridad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-abliterated | 9,41 B | no disponible | Sí (image-text-to-text) | Apache 2.0 | Sin salvaguardas (abliterated) |
| SenseNova-Loop-9B (original) | 9,41 B | no disponible | Sí | Apache 2.0 | Alineado; rechaza 97/100 en JBB |
| Variantes abliterated de Llama/Qwen de ~8-9 B | ~7-9 B | variable según base | Normalmente solo texto | Licencia del modelo base | Sin salvaguardas |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. La comparación con otras variantes abliterated de la familia Llama o Qwen no puede cuantificarse aquí.

## Limitaciones y advertencias

- Modelo sin salvaguardas: el autor reporta 0 rechazos sobre 100 peticiones dañinas de JailbreakBench con thinking activado. No debe desplegarse en aplicaciones de cara al público sin moderación externa.
- El "cumplimiento" incluye respuestas con advertencias o líneas de "con fines educativos"; el "esquive" incluye respuestas que convierten la petición en su opuesto ético. La clasificación depende de un juez automático (typesafe/jev-1.14) que lee solo los primeros 1600 caracteres, lo que introduce incertidumbre.
- El autor reconoce que el modelo "está cerca de la línea" en muchas peticiones y que diferencias pequeñas entre configuraciones no son significativas.
- La técnica de ablación puede degradar capacidades generales; no se publican benchmarks de capacidad (MMLU, HumanEval, GSM8G) para cuantificar el daño.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- Longitud de contexto no disponible; no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar antes de usar en entornos sensibles.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de salvaguardas traslada toda la responsabilidad legal y ética al desplegador.
- El repositorio tiene 1 descarga y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados del autor.
- Los GGUF incluyen parches específicos para GPU de Apple; su comportamiento en otras plataformas no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/satellitedown/SenseNova-Loop-9B-abliterated
- GGUF 4-bit y 6-bit: https://huggingface.co/satellitedown/SenseNova-Loop-9B-abliterated-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- Dataset JailbreakBench: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
