# DavidAU/L3.1-Dark-Planet-SpinFire-Uncensored-8B-GGUF

## Resumen

L3.1-Dark-Planet-SpinFire-Uncensored-8B es un modelo de lenguaje de 8.030 millones de parámetros derivado de Llama 3.1, desarrollado por DavidAU y publicado en Hugging Face el 8 de noviembre de 2024. Está específicamente orientado a escritura creativa, narrativa de ficción, generación de tramas y roleplay, con un proceso de descensurado aplicado mediante la técnica L3.1 Lexi Uncensored V2. El repositorio aquí descrito contiene exclusivamente cuantizaciones en formato GGUF, lo que lo hace desplegable en hardware de consumo.

El modelo parte de la arquitectura transformer de Llama 3.1 con una ventana de contexto declarada de 128k tokens (131.000), y ha sido construido mediante técnicas de fusión (mergekit) sobre el modelo base DavidAU/L3.1-Dark-Planet-SpinFire-Uncensored-8B. El autor declara un nivel de perplejidad inferior al de Meta Llama 3.1 Instruct y un sesgo narrativo negativo controlable mediante prompt, lo que lo diferencia de los ajustes instructivos convencionales orientados a asistencia.

Su relevancia actual radica en la demanda de modelos locales sin restricciones para escritura de ficción y roleplay, donde los modelos alineados convencionalmente suelen rechazar contenido violento, de terror o explícito. La licencia Apache 2.0 y la disponibilidad de cuantizaciones GGUF lo convierten en una opción práctica para ejecución en GPU de consumo y en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Llama 3.1) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.000 tokens (128k) |
| Tipos de cuantizacion | GGUF en multiples niveles (el repo incluye cuantizaciones; niveles concretos no detallados en la informacion disponible) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors con bfloat16 |
| Tamano del repositorio | 69,7 GB |
| Modelo base | DavidAU/L3.1-Dark-Planet-SpinFire-Uncensored-8B |
| Plantilla de prompt | Llama 3 y/o Command-R |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Llama 3.1 de 8B parámetros, con 8.030 millones de parámetros totales. Ha sido construido mediante técnicas de fusión de modelos (mergekit), según la etiqueta declarada por el autor, y posteriormente descensurado con la técnica L3.1 Lexi Uncensored V2. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

El autor destaca varias innovaciones de comportamiento más que arquitectónicas: el modelo opera de forma estable con temperaturas de 0 a 5, emplea una penalización de repetición recomendada de 1,05 o superior, y produce salidas más largas por defecto salvo que se especifique la longitud. También se indica que el nivel de censura se controla a nivel de prompt y que la calidad de la prosa mejora con prompts largos. No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto creativo: ficción, narrativa, cuentos, novelas y prosa vívida en cualquier género (ciencia ficción, romance, terror, etc.).
- Generación de tramas y subtramas, continuación de escenas y construcción de historias.
- Roleplay conversacional con capacidad de mantener personajes y tono.
- Escritura con contenido explícito, violencia, gore y lenguaje soez (modelo descensurado).
- Control del tono y estilo mediante instrucciones en el prompt (por ejemplo, indicar "vivid horror" para forzar un registro).
- Soporte de plantillas Llama 3 y Command-R para formateo de conversaciones.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Escritura de ficción larga: el modelo puede generar capítulos y escenas extensas con contexto de hasta 128k tokens, útil para mantener coherencia en novelas y sagas con múltiples personajes y arcos argumentales.
- Roleplay de mesa o narrativo: con plantilla Llama 3 o Command-R y rep pen de 1,05 o superior, sirve para interpretar personajes en sesiones interactivas, incluyendo géneros de terror o contenido adulto que los modelos alineados rechazarían.
- Generación de tramas y subtramas para guionistas: se le puede pedir que proponga arcos argumentales, giros y escenas alternativas, regenerando varias veces y seleccionando la mejor salida, como recomienda el autor.
- Continuación de escenas en pipelines editoriales: integrado en herramientas de escritura asistida, permite continuar un texto existente respetando estilo y tono, con control de longitud mediante instrucciones explícitas.
- Creación de contenido de terror y horror gráfico: el sesgo negativo del modelo y su tolerancia a la violencia explícita lo hacen adecuado para relatos de horror, creepypasta y guiones de género.
- Prototipado de personajes y diálogos para videojuegos narrativos: puede generar árboles de diálogo y variantes de respuesta para NPC, con la ventaja de ejecutarse localmente en GPU de consumo.
- Experimentación e investigación sobre descensurado: útil para estudiar cómo se comportan modelos fusionados y descensurados frente a sus versiones alineadas, comparando perplejidad y calidad de prosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente declara que el nivel de perplejidad es inferior al de Meta Llama 3.1 Instruct, sin aportar cifras concretas ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta en la información proporcionada; para un modelo de 8B en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 5-6 GB y las de 8 bits en torno a 9-10 GB, aunque el autor no detalla los niveles incluidos.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un modelo de 8B cuantizado es viable en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; para precisión completa en bfloat16 se requerirían aproximadamente 16 GB o más (A100, H100, RTX 4090 24 GB).
- Cabe en GPU de consumo: sí, en cuantizaciones GGUF de 4 y 5 bits en GPUs con 8-12 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia de Hugging Face. No se menciona soporte específico de vLLM o TGI para este repo GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| L3.1-Dark-Planet-SpinFire-Uncensored-8B (este) | 8,03B | 128k | Ficción y roleplay descensurado | Apache 2.0 | GGUF, safetensors (base) |
| Meta Llama 3.1 8B Instruct | 8B | 128k | Asistencia general alineada | Llama 3.1 Community License | safetensors, GGUF |
| L3-Dark-Planet-8B (version anterior de DavidAU) | 8B | 128k (declarado) | Ficción descensurada | Apache 2.0 (segun repo) | GGUF |
| L3-DARKEST-PLANET-16.5B | 16,5B | no disponible | Ficción descensurada de mayor tamano | no disponible | GGUF |

El modelo se posiciona frente a Llama 3.1 Instruct por su menor censura y su orientación a prosa creativa, y frente a la versión anterior Dark Planet 8B por una mejora declarada en detalle, calidad de prosa y eliminación parcial de "GPTismos". No se dispone de datos de rendimiento comparativo numérico.

## Limitaciones y advertencias

- Contenido NSFW: el modelo genera violencia gráfica, gore, lenguaje soez y contenido explícito; no es apto para aplicaciones orientadas a público general ni para entornos sin moderación.
- Sesgo negativo: el autor advierte explícitamente de que no es un modelo de "finales felices" y que tiene un sesgo negativo, controlable solo mediante prompt.
- Riesgo de alucinación: como todo modelo de 8B sin datos de benchmarks publicados, no hay garantías cuantificadas sobre fidelidad factual; su uso previsto es creativo, no de recuperación de información.
- Idioma: solo inglés declarado; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Longitud de salida: tiende a generar respuestas largas salvo que se limite explícitamente, lo que puede incrementar coste y latencia.
- Sensibilidad a parámetros: cambios en temperatura (0-5) y rep pen alteran drásticamente la salida; se recomienda rep pen de 1,05 o superior para evitar repeticiones de párrafo.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir políticas de plataformas o legislación sobre material explícito; la responsabilidad recae en el desplegador.
- Reproducibilidad: distintas cuantizaciones producen salidas ligeramente diferentes, según el autor.
- Sin soporte documentado de tool calling ni agentes: no es adecuado para pipelines de automatización que requieran function calling.

## Enlaces

- Repositorio GGUF: https://huggingface.co/DavidAU/L3.1-Dark-Planet-SpinFire-Uncensored-8B-GGUF
- Modelo base (safetensors): https://huggingface.co/DavidAU/L3.1-Dark-Planet-SpinFire-Uncensored-8B
- Version anterior Dark Planet 8B L3: https://huggingface.co/DavidAU/L3-Dark-Planet-8B-GGUF
- The Monster Darkest Planet 16.5B L3: https://huggingface.co/DavidAU/L3-DARKEST-PLANET-16.5B-GGUF
- NEO IMatrix quants: https://huggingface.co/DavidAU/L3-Dark-Planet-8B-NEO-Imatrix-GGUF
- NEO IMatrix Dark Horror quants: https://huggingface.co/DavidAU/L3-Dark-Planet-Horror-City-8B-NEO-Imatrix-GGUF
- Version F32 (Ring World): https://huggingface.co/DavidAU/L3-Dark-Planet-Ring-World-8B-F32-GGUF
- Version 2 Eight Orbs Of Power: https://huggingface.co/DavidAU/L3-Dark-Planet-8B-V2-Eight-Orbs-Of-Power-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
