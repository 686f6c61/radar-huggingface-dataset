# JhCIFT/CIRF-Qwen3-8B-Instruct-Zero-Results

## Resumen

CIRF-Qwen3-8B-Instruct-Zero-Results es un ajuste fino del modelo Qwen3-8B de Alibaba, publicado por el usuario JhCIFT en Hugging Face. El modelo implementa la técnica CIRF (reasoning con tokens funcionales), en la que la traza de razonamiento se compone exclusivamente de tokens funcionales especiales (`[f_0]` a `[f_511]`) en lugar de lenguaje natural, seguidos del token `[eof]` y la respuesta final. La variante "Zero-Results" se ha entrenado sin valores de resultado explícitos en los objetivos de entrenamiento, lo que la diferencia de otras variantes de la misma familia.

El modelo parte de la arquitectura densa de Qwen3-8B (8.192 millones de parámetros) y añade 514 tokens nuevos al vocabulario: `[sof]` (start of function), `[eof]` (end of function) y 512 tokens funcionales. La actualización LoRA se ha fusionado en los pesos BF16 densos, de modo que el modelo se carga con Transformers estándar sin necesidad de PEFT ni del checkpoint base. El repositorio ocupa 16,4 GB y se distribuye bajo licencia Apache 2.0.

La relevancia de este modelo es fundamentalmente experimental: explora una forma alternativa de estructurar el razonamiento en modelos de lenguaje mediante un vocabulario discreto y acotado de operaciones, en lugar de cadenas de pensamiento en lenguaje natural. Su adopción práctica es limitada por el momento (0 descargas, 0 likes en el momento de la consulta) y por unos resultados de benchmarks mixtos que se detallan más abajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) con vocabulario extendido de tokens funcionales |
| Parámetros totales | 8.192.758.784 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible en la información proporcionada (pesos publicados en BF16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen3-8B, con 8.192 millones de parámetros. Sobre esa base se añaden 514 tokens nuevos al vocabulario: `[sof]`, `[eof]` y 512 tokens funcionales (`[f_0]` a `[f_511]`), cada uno con su fila de embedding y su fila de salida entrenadas. El ajuste se realizó mediante LoRA, cuya actualización se ha fusionado posteriormente en los pesos BF16 densos, de modo que el checkpoint resultante es autocontenido y se carga con `AutoModelForCausalLM` estándar.

El entrenamiento de esta variante "Zero-Results" se caracteriza por no incluir valores de resultado explícitos en los objetivos: la traza de razonamiento se compone únicamente de tokens funcionales, seguida de `[eof]` y la respuesta. El autor publica en el repositorio los ficheros `training_config.json`, `provenance.json` y `export_verification.json` con los ajustes de entrenamiento, los hashes del checkpoint de origen y las comprobaciones de exportación, aunque el contenido de esos ficheros no se detalla en la información disponible. No se especifica el número de tokens de entrenamiento ni la composición del dataset.

El protocolo de inferencia es peculiar: el prompt tiene el formato `PREGUNTA[sof]`, sin plantilla de chat, y el modelo genera una traza de tokens funcionales (con valores de resultado opcionales), luego `[eof]` y la respuesta final, deteniéndose en el token EOS del tokenizador. La decodificación debe hacerse con `skip_special_tokens=False` para preservar los límites, y la parada debe hacerse en EOS, no en `[eof]`.

## Capacidades

- Generación de texto y razonamiento estructurado mediante trazas de tokens funcionales en lugar de lenguaje natural.
- Razonamiento aritmético y matemático de varios pasos (ver resultados en GSM8K, MultiArith, SVAMP).
- Razonamiento de sentido común (CommonsenseQA) y tareas de seguimiento de estado (Coin Flip).
- Modo de razonamiento con límite configurable de tokens funcionales (el protocolo de evaluación limita a 32 tokens funcionales y fuerza `[eof]` al alcanzar el límite).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso fuera del esquema de tokens funcionales.
- Capacidades multilingües: solo inglés según la model card.
- No se documenta soporte de visión ni audio.

## Casos de uso

- Investigación sobre representaciones de razonamiento discreto: el modelo permite estudiar si un vocabulario acotado de operaciones (512 tokens funcionales) puede sustituir a las cadenas de pensamiento en lenguaje natural, comparando directamente con las variantes Full y Backward-Greedy de la misma familia.
- Evaluación comparativa de técnicas de ajuste fino: al publicarse junto a otras seis variantes del mismo modelo base, sirve para analizar el efecto de eliminar los valores de resultado de los objetivos de entrenamiento sobre la precisión final.
- Reproducción de experimentos académicos: el repositorio incluye `inference.py`, `test_results.json` y los ficheros de configuración y procedencia, lo que facilita replicar el protocolo de evaluación con solo Torch y Transformers.
- Tareas aritméticas simples en inglés: con un 94,38% en MultiArith, el modelo es adecuado para problemas de aritmética elemental de un solo paso en entornos controlados.
- Clasificación y respuesta a preguntas de sentido común: el 83,78% en CommonsenseQA lo hace utilizable para preguntas de conocimiento cotidiano en inglés dentro de un pipeline de investigación.
- Análisis de latencia en decodificación restringida: el autor publica medidas de latencia con batch 1 en `test_results.json`, útiles para estudiar el coste de generar trazas de tokens especiales frente a texto libre.
- Estudio de robustez ante etiquetas ruidosas: la corrección por paridad en Coin Flip (aproximadamente el 20% de las etiquetas del dataset discrepan de la paridad real) documenta un caso práctico de evaluación con datos imperfectos.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Decodificación greedy, máximo 384 tokens nuevos y 32 tokens funcionales, puntuación por coincidencia exacta de la respuesta.

| Test | Preguntas | Precisión |
|---|---:|---:|
| GSM8K | 1.319 | 35,78% |
| MultiArith | 178 | 94,38% |
| SVAMP | 300 | 75,00% |
| CommonsenseQA | 1.221 | 83,78% |
| Coin Flip (corregido por paridad) | 3.333 | 67,93% |

El autor indica que los resultados completos por dataset, incluyendo MATH-500, StrategyQA y latencia con batch 1, están en el fichero `test_results.json` del repositorio, pero esos datos no se incluyen en la información disponible. No se proporcionan comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se recomienda una GPU con 24 GB o más.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16. Para GPUs de 16 GB sería necesaria cuantización, cuyos formatos no se documentan en la información disponible.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16; en GPUs de 16 GB requeriría cuantización no documentada por el autor.
- Opciones de despliegue: Transformers con `device_map="auto"` (protocolo oficial documentado). El tag `text-generation-inference` sugiere compatibilidad con TGI, pero no se detalla en la model card. No se documenta soporte de vLLM, llama.cpp ni Ollama, y la presencia de tokens especiales personalizados en el vocabulario complica su uso en runtimes que no respeten el tokenizador original.
- Latencia y throughput: el autor menciona medidas de latencia con batch 1 en `test_results.json`, pero los valores no están disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CIRF-Qwen3-8B-Instruct-Zero-Results | 8,19 B | No disponible | 35,78% | Apache 2.0 | Hugging Face |
| CIRF-Qwen3-8B-Instruct-Full | No disponible | No disponible | No disponible | Apache 2.0 (presumible, derivado de Qwen3-8B) | Hugging Face |
| CIRF-Qwen3-8B-Instruct-Backward-Greedy-3 | No disponible | No disponible | No disponible | Apache 2.0 (presumible, derivado de Qwen3-8B) | Hugging Face |
| Qwen/Qwen3-8B (base) | 8,19 B | No disponible en la información proporcionada | No disponible en la información proporcionada | Apache 2.0 | Hugging Face |

Las variantes hermanas de la familia CIRF (Full y Backward-Greedy-3/6/12/18/24) se entrenan sobre el mismo Qwen3-8B y comparten el esquema de tokens funcionales; sus resultados no se incluyen en la información disponible, por lo que no es posible establecer una comparación numérica directa. El modelo base Qwen3-8B es la referencia natural, pero tampoco se aportan sus cifras de benchmarks en la documentación consultada.

## Limitaciones y advertencias

- Precisión baja en GSM8K (35,78%), muy por debajo de lo esperable en un modelo de 8B ajustado para matemáticas; el razonamiento con tokens funcionales sin valores de resultado parece penalizar los problemas de varios pasos.
- El modelo solo está entrenado y evaluado en inglés; no se documenta comportamiento en castellano ni en otros idiomas.
- El formato de prompt es rígido (`PREGUNTA[sof]`, sin plantilla de chat) y requiere decodificación con `skip_special_tokens=False` y parada en EOS; un uso incorrecto del tokenizador o de los tokens de parada produce salidas corruptas.
- Los 514 tokens especiales añadidos al vocabulario pueden no ser compatibles con herramientas, servidores de inferencia o pipelines que filtren o remapeen tokens especiales.
- Riesgo de alucinación no cuantificado: no se publican evaluaciones de veracidad ni de calibración.
- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3-8B y entrenarse solo en inglés, hereda los sesgos del modelo base y del dataset de ajuste, no especificado.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo es una variante experimental con 0 descargas y sin validación externa; no se recomienda para producción sin evaluación propia.
- La fecha de creación del repositorio (2026-11-02) y la ausencia de tracción sugieren un artefacto de investigación reciente, sin comunidad ni soporte.
- No se documentan la longitud de contexto efectiva ni el comportamiento con prompts largos, lo que impide garantizar su uso en conversaciones multi-turno extensas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Zero-Results
- Variante Full: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Full
- Variante Backward-Greedy-3: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-3
- Variante Backward-Greedy-6: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-6
- Variante Backward-Greedy-12: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-12
- Variante Backward-Greedy-18: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-18
- Variante Backward-Greedy-24: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-24
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
