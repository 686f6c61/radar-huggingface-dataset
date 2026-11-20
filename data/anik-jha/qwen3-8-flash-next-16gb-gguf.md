# anik-jha/Qwen3.8-Flash-Next-16GB-GGUF

## Resumen

Qwen3.8-Flash-Next-16GB-GGUF es una cuantización GGUF de 2 bits del modelo Qwen3.8-Flash-Next (aproximadamente 35.570 millones de parámetros totales), publicada por el usuario anik-jha. El objetivo es ejecutar un modelo de mezcla de expertos (MoE) de tamaño medio en GPUs con solo 16 GB de VRAM, algo imposible con los pesos originales. Para lograrlo, el autor aplica una poda de expertos basada en la técnica REAP: de los 512 expertos por capa del modelo original, conserva los 128 mejor puntuados y elimina el resto, manteniendo los pesos de los expertos conservados idénticos a los del GGUF UD-IQ1_M de unsloth.

Sobre esa base podada, el autor añade una "recuperación" en dos partes: reincorpora dos expertos eliminados por capa (130 en total) y los reentrena, y publica además un adaptador LoRA de corrección que se carga en tiempo de inferencia con llama.cpp. El resultado es un modelo que, según el autor, resuelve 93 de 130 problemas de LiveCodeBench (85 en el primer intento), superando al modelo podado sin recuperación en 4 bits (63) y acercándose al build de 24 GB del mismo autor (109).

La relevancia de esta ficha es doble: por un lado, documenta una técnica de compresión agresiva (poda de expertos más cuantización de 2 bits más adaptador de recuperación) para llevar modelos MoE a hardware de consumo; por otro, advierte de que el modelo requiere un flujo de inferencia específico (adaptador, flags de muestreo y cliente de "stop and redraw") para funcionar correctamente. El repositorio incluye además una tabla n-gram de 26,8 GB que se lee desde disco y no consume VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer; 512 expertos por capa en el modelo base, 10 activos por token; poda a 128 expertos por capa más 2 reincorporados (130) |
| Parametros totales | 35.571.606.400 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (el modelo base activa 10 de 512 expertos por token; el número exacto de parámetros activos no se especifica) |
| Longitud de contexto | Hasta 128K (el autor reporta consumo de VRAM a 32K y 128K) |
| Tipos de cuantizacion | GGUF de 2 bits (pesos de expertos con media de 2,31 bits); caché KV de 8 y 16 bits; adaptador LoRA separado |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en la model card) |
| Formato de pesos | GGUF (llama.cpp); adaptador LoRA separado; tabla n-gram en fichero aparte |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con 512 subredes expertas por capa, de las cuales se activan 10 por token. Esta publicación no es un entrenamiento desde cero ni un fine-tuning completo, sino una compresión en varias etapas. Primero se aplica una poda de expertos guiada por una "ranking method" (la técnica REAP citada en las etiquetas), conservando los 128 expertos mejor puntuados de cada capa. Los pesos de esos expertos se toman byte a byte del GGUF UD-IQ1_M de unsloth, que promedia 2,31 bits por peso de experto.

Después se aplica la "recuperación": se reincorporan dos expertos eliminados por capa (hasta 130 por capa) y se reentrenan, y se entrena un adaptador LoRA que corrige las salidas de las capas podadas de 2 bits para acercarlas a las del modelo sin podar de 4 bits. El adaptador se carga en tiempo de ejecución con `--lora-scaled` en llama.cpp. Además, el repositorio incluye una tabla n-gram de 26,8 GB (lookup table) de la que el modelo lee 16 filas por token; llama.cpp la mantiene en disco y solo lee las filas necesarias, por lo que no ocupa VRAM. El autor no detalla el número de tokens de entrenamiento ni la composición del dataset de recuperación.

## Capacidades

- Generación de texto conversacional y razonamiento de varios pasos (etiquetas "reasoning" y "conversational").
- Generación de código: el autor lo evalúa específicamente en problemas de programación competitiva (LiveCodeBench) y en pruebas de Python corto (HumanEval+, MBPP+).
- Razonamiento matemático y algorítmico implícito en las tareas de código evaluadas.
- Soporte de contexto largo: hasta 128K tokens según las mediciones de VRAM del autor.
- Compatible con endpoints (etiqueta "endpoints_compatible") y con el ecosistema llama.cpp.
- Capacidad multilingüe: no disponible (no se documentan idiomas).
- Tool calling / function calling: no disponible (no se menciona en la model card).
- Modo "thinking" explícito, visión o audio: no disponible.
- Requiere un flujo de inferencia específico para evitar bucles de repetición: adaptador LoRA, `--presence-penalty 1.5 --repeat-last-n 20480` y el cliente `redraw.py` incluido.

## Casos de uso

- Asistencia de código en GPUs de 16 GB: el modelo resuelve problemas de programación competitiva y Python corto con una calidad cercana a la de un build de 24 GB (93 frente a 109 de 130 en LiveCodeBench), por lo que es adecuado para entornos de desarrollo con hardware limitado.
- Autocompletado y generación de funciones Python en IDE: con 85,4 % en HumanEval+ y 72,5 % en MBPP+ (con redraw), puede integrarse en asistentes de código locales que prioricen la privacidad y no dependan de la nube.
- Evaluación y experimentación con técnicas de compresión: sirve como caso de estudio reproducible de poda de expertos, cuantización de 2 bits y adaptadores de recuperación para investigadores que trabajen en eficiencia de modelos MoE.
- Despliegue en estaciones de trabajo con una sola GPU consumer: al caber en 14,6 GB con contexto de 32K y caché KV de 8 bits, es viable en tarjetas de 16 GB (por ejemplo, RTX 4080/4090 o A4000) para prototipos y demos internas.
- Razonamiento multi-turno con contexto largo: la ventana de hasta 128K permite mantener conversaciones o analizar repositorios de código extensos, aunque a 128K el consumo sube a 16,5 GB y deja poco margen en una GPU de 16 GB.
- Generación de soluciones en competiciones o entornos de práctica: el cliente `redraw.py` reintenta la generación hasta tres veces si detecta repeticiones, lo que encaja con flujos de "generar y validar con tests" típicos de plataformas de jueces en línea.
- Investigación sobre decodificación y muestreo: los flags de penalización de presencia y repetición documentados permiten estudiar el comportamiento de modelos podados agresivamente y comparar estrategias de mitigación de bucles.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (LiveCodeBench con 130 problemas fáciles y medios, releases v1 a v3; HumanEval+ y MBPP+ con el flujo completo de adaptador, flags y redraw):

| Benchmark | Este repo (2 bits, con recuperación) | Build 24 GB (4 bits, con recuperación) | Poda simple 4 bits |
|---|---|---|---|
| LiveCodeBench (de 130, con redraw) | 93 | 109 | 63 |
| LiveCodeBench (de 130, primer intento) | 85 | 98 | 59 |
| HumanEval+ (de 164, con redraw) | 85,4 % | no disponible | no disponible |
| HumanEval+ (de 164, primer intento) | 81,7 % | no disponible | no disponible |
| MBPP+ (de 378, con redraw) | 72,5 % | no disponible | no disponible |
| MBPP+ (de 378, primer intento) | 70,6 % | no disponible | no disponible |

El autor indica además que en problemas fáciles de concurso resolvió 61 de 63, igual que el build de 24 GB, y que la recuperación lleva la poda simple de 4 bits de 63 a 109 problemas resueltos. No se han publicado resultados de MMLU, GSM8K u otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: 14,6 GB con contexto de 32K y caché KV de 8 bits; 15,1 GB con caché KV de 16 bits; 16,5 GB con contexto de 128K y caché KV de 8 bits. Tras generar una respuesta, el consumo medido es de 14,7 GB (32K, KV de 8 bits).
- Ficheros: modelo 12,1 GB más adaptador 1,8 GB cargados en GPU; tabla n-gram de 26,8 GB que permanece en disco y se lee bajo demanda (no consume VRAM).
- RAM del proceso servidor: 0,9 GB tras una respuesta (32K, KV de 8 bits), sin contar la caché de ficheros del sistema operativo.
- GPU recomendadas: tarjetas de 16 GB o más (el autor menciona GPUs de 16 GB como objetivo; las mediciones se hicieron en una NVIDIA DGX Spark, con memoria unificada CPU-GPU, no en una tarjeta de 16 GB dedicada).
- Cabe en GPU consumer de 16 GB (RTX 4080, RTX 4090, RTX A4000) siempre que se use el contexto y la caché KV indicados; con 24 GB hay un build específico del mismo autor.
- Despliegue: llama.cpp (formato GGUF, adaptador con `--lora-scaled`, flags de muestreo y cliente `redraw.py`). No se documentan otras opciones como vLLM, TGI u Ollama.
- Rendimiento: 23 tokens por segundo para un usuario en la máquina de prueba del autor (DGX Spark). No se publican cifras de throughput con concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LiveCodeBench (130) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-16GB-GGUF (este repo) | 35,57 B totales (MoE podado a 130 expertos/capa) | hasta 128K | 93 (con redraw), 85 (primer intento) | qwen-community-1.0 | GGUF en Hugging Face |
| Qwen3.8-Flash-Next-24GB-GGUF (mismo autor) | 35,57 B totales (MoE podado, 4 bits) | no disponible | 109 (con redraw), 98 (primer intento) | qwen-community-1.0 | GGUF en Hugging Face |
| Poda simple 4 bits (referencia del autor) | 35,57 B totales (MoE podado, 4 bits, sin recuperación) | no disponible | 63 (con redraw), 59 (primer intento) | no disponible | no disponible como publicación independiente |
| Qwen3.8-Flash-Next original (modelo base) | 35,57 B totales | no disponible | no disponible | qwen-community-1.0 | Pesos originales en Hugging Face |

La comparación directa más útil es con el build de 24 GB del mismo autor: este repo sacrifica 16 problemas de 130 a cambio de caber en 16 GB. Frente a la poda simple de 4 bits, la combinación de 2 bits más recuperación gana 30 problemas, lo que el autor presenta como evidencia de que la recuperación compensa la pérdida de precisión de la cuantización.

## Limitaciones y advertencias

- La poda elimina el 75 % de los expertos del modelo base; la calidad es inferior a la del modelo original sin podar, y el propio autor reconoce que el build de 24 GB es mejor si hay VRAM suficiente.
- El modelo tiende a quedarse en bucles de repetición durante el razonamiento; sin el adaptador, los flags `--presence-penalty 1.5 --repeat-last-n 20480` y el cliente `redraw.py`, los resultados no son representativos.
- Las puntuaciones de benchmarks se obtuvieron con hasta tres reintentos (redraw); las cifras del primer intento son entre 3 y 4 puntos porcentuales inferiores.
- Las mediciones de VRAM se hicieron en una DGX Spark con memoria unificada, no en una GPU dedicada de 16 GB; el consumo real en tarjetas consumer puede variar.
- La tabla n-gram de 26,8 GB debe residir en disco y su lectura depende de la caché de ficheros del sistema operativo; en almacenamiento lento puede afectar a la latencia.
- Licencia qwen-community-1.0: es necesario revisar sus términos para uso comercial, ya que no es una licencia permisiva estándar (Apache 2.0 o MIT).
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación; la información disponible se centra en código y razonamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no es el desarrollador original del modelo base; conviene validar los resultados de forma independiente antes de usarlo en producción.
- La fecha de creación del repositorio (2026-11-20) y la referencia arXiv:2611.20419 deben tratarse con cautela; no se ha verificado la disponibilidad del paper.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anik-jha/Qwen3.8-Flash-Next-16GB-GGUF
- Build de 24 GB del mismo autor: https://huggingface.co/anik-jha/Qwen3.8-Flash-Next-24GB-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Paper de referencia citado en las etiquetas: arXiv:2611.20419 (no verificado)
- GGUF UD-IQ1_M de unsloth (origen de los pesos de expertos): no disponible como enlace directo en la información proporcionada
