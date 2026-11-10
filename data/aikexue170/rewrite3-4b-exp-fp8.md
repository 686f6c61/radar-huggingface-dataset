# aikexue170/rewrite3-4b-exp-fp8

## Resumen

rewrite3-exp-4B es un modelo de lenguaje especializado en la reescritura de textos generados por IA para que se lean como escritura humana, orientado al sector de la novela web. Lo desarrolla el usuario aikexue170 y se distribuye como un checkpoint experimental (exp) previo a la versión estable de rewrite3. El modelo parte de una base Qwen3.5-4B, se ajusta mediante LoRA SFT y se publica aquí en formato ModelOpt FP8 W8A8 con pesos en safetensors.

La tarea concreta que resuelve es la eliminación de los patrones estilísticos típicos de la generación automática (frases formulares, explicaciones redundantes, acumulación de paralelismos, exceso emocional) manteniendo el significado original. La innovación principal frente a la generación anterior (rewrite2-4b) es la incorporación de una cadena de pensamiento entrenada: el modelo primero analiza el texto frase a frase, asigna una valoración de "grado de degradación" y planifica la intervención, y solo después emite el texto reescrito.

El checkpoint tiene 4.659.865.088 parámetros y un tamaño de repositorio de 5,8 GB. La versión exp aplica una definición de tarea de "modo compresión": la salida siempre es más corta que la entrada, con un objetivo de entre 0,4 y 1,0 veces la longitud original y una mediana en torno a 0,7. El autor indica que la versión estable de rewrite3 mejorará los resultados y recomienda usarla cuando esté disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B) con cabeza MTP para decodificación especulativa |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (configurado en el ejemplo de despliegue con `--max-model-len 32768`) |
| Tipos de cuantizacion | FP8 W8A8 (ModelOpt); la cabeza MTP se mantiene en bf16 |
| Idiomas soportados | no disponible (la model card está en chino y los datos de entrenamiento son novelas web en chino) |
| Licencia | no disponible; los pesos siguen la licencia de la base Qwen3.5 |
| Formato de pesos | safetensors (archivo único) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 4,66 mil millones de parámetros construido sobre Qwen3.5-4B. Sobre esa base se aplica un ajuste LoRA SFT que posteriormente se fusiona en los pesos. Además, se entrena por separado una cabeza MTP (multi-token prediction) para decodificación especulativa, integrada en los propios pesos y excluida de la cuantización FP8 (el patrón `mtp.*` está en la lista de ignorados). Según el autor, la cabeza MTP alcanza un 72,8 % de acierto top-1 en modo teacher-forced y un 83,7 % en accept_proxy.

El pipeline de datos parte de 20.000 novelas web humanas de buena calidad (tanto SFW como NSFW) procedentes de plataformas con buena recepción. A partir de ellas se catalogan más de 100 patrones de "estilo IA" (sintaxis, ritmo, tono, imaginería, transiciones, manía explicativa) y se genera un corpus paralelo degradando las obras buenas con deepseek v4.1 flash 1017 según esos patrones. Después, un modelo profesor jevnovel3 27B puntúa cada frase degradada con una probabilidad de "estar arruinada". Finalmente, gemini 4 argon construye la cadena de análisis que conecta el texto degradado, el tipo de patrón, la puntuación de jevnovel y el texto bueno, produciendo las trazas de CoT que se usan junto con la reescritura final como objetivo de entrenamiento. El resultado es un modelo que aprende tanto a reconocer los patrones formulares como a calibrar la intensidad de la reescritura a partir de las puntuaciones.

## Capacidades

- Reescritura de texto con preservación del significado original y reducción de la longitud (objetivo 0,4-1,0×, mediana 0,7×).
- Cadena de pensamiento entrenada (no inyectada por prompt): análisis frase a frase, diagnóstico del patrón de estilo IA, valoración de gravedad y plan de intervención antes de la reescritura.
- Interpretación de puntuaciones externas de "grado de degradación" insertadas en el texto de entrada con el formato `【0.04】`; si no hay puntuación se usa `【NA】`.
- Separación explícita entre análisis y texto final mediante el delimitador `</think>` (en llama.cpp server, el análisis va en `reasoning_content` y el texto en `content`).
- Decodificación especulativa mediante cabeza MTP integrada, con aceleración en GPUs de gama baja.
- Generalización de longitud mejorada gracias al CoT: admite entradas de varios miles de caracteres sin trocear, aunque el autor recomienda segmentar textos muy largos.
- Capacidad multilingüe: no disponible (los datos y la documentación apuntan a chino).
- Tool calling, function calling, agentes y visión: no disponible / no documentado.

## Casos de uso

- Limpieza de manuscritos de novela web generados con IA: se introduce el texto con puntuaciones jevnovel por frase y el modelo devuelve un análisis de los patrones formulares detectados más una versión reescrita más densa y con estilo humano, lista para revisión editorial.
- Preprocesado en pipelines editoriales de plataformas de ficción seriada: integración como etapa previa a la revisión humana para reducir el coste de corrección de capítulos generados automáticamente, aprovechando la ventana de 32.768 tokens para procesar capítulos completos.
- Control de calidad de estilo en herramientas de autor: uso de las puntuaciones jevnovel como señal objetiva y del análisis CoT como justificación auditable de por qué una frase se considera "de IA", útil para paneles de revisión.
- Compatibilidad con proyectos heredados de rewrite2: al mantener el mismo formato de entrada (texto con puntuaciones) y una interfaz de salida delimitada, permite sustituir el modelo anterior en pipelines existentes con cambios mínimos.
- Aceleración en hardware modesto: gracias a la cuantización FP8 W8A8 y a la cabeza MTP para decodificación especulativa, se puede desplegar en GPUs de gama media para tareas por lotes de reescritura, reduciendo el coste por documento.
- Investigación sobre estilos generativos: el corpus paralelo (bueno/degradado) y las trazas CoT asociadas permiten estudiar la detección y eliminación de patrones de escritura automática, así como evaluar la calibración de las puntuaciones de un modelo profesor externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas internas de la cabeza MTP: 72,8 % de acierto top-1 en modo teacher-forced y 83,7 % en accept_proxy para la decodificación especulativa.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 5,8 GB en FP8 W8A8; en inferencia con contexto de 32.768 tokens hay que sumar la caché KV, por lo que se recomienda al menos 12-16 GB de VRAM para uso cómodo (estimación, no dato publicado).
- GPUs recomendadas: no disponible de forma explícita; por tamaño, una RTX 4090 (24 GB) o A100/H100 son holgadas. El autor menciona que la decodificación especulativa con MTP "acelera bastante en tarjetas de gama baja".
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 y en tarjetas de 16 GB con contexto reducido (estimación).
- Despliegue: vLLM >= 0.28 con soporte de MTP para Qwen3.5, usando `--speculative-config '{"method":"mtp","num_speculative_tokens":2}'` y `--gpu-memory-utilization 0.85`. El autor también menciona llama.cpp server para la separación de `reasoning_content`/`content`.
- Parámetros de muestreo recomendados: `temperature=0.9`, `top_p=0.95`, `repetition_penalty=1.05`, `max_tokens=6144`. El CoT consume habitualmente 3.000-4.000 tokens, por lo que un `max_tokens` bajo produce análisis sin texto final.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rewrite3-exp-4B (este) | 4,66 B | 32.768 | Reescritura antiformular con CoT y compresión | no disponible (hereda Qwen3.5) | Hugging Face, FP8 W8A8 |
| rewrite2-4b | no disponible | no disponible | Reescritura sin CoT, requiere trocear la entrada | no disponible | Hugging Face (GGUF) |
| jev-novel-3-0.8b-fp8 | ~0,8 B | no disponible | Puntuación de "grado de degradación" por frase | no disponible | Hugging Face, FP8 |

La comparación con modelos generalistas de tamaño similar no está disponible en la información proporcionada, ya que rewrite3-exp-4B está especializado en una tarea muy concreta y no se han publicado evaluaciones frente a alternativas.

## Limitaciones y advertencias

- Checkpoint experimental: el autor indica que la versión estable de rewrite3 mejorará los resultados y que este lote no recibirá más actualizaciones; solo se mantiene para comparación, reproducción y compatibilidad con proyectos antiguos.
- La salida es siempre más corta que la entrada (0,4-1,0×, mediana 0,7×). No es posible conservar la longitud original con esta versión; si se necesita, hay que esperar a la versión estable.
- Dependencia de puntuaciones externas: sin puntuaciones jevnovel (todo `【NA】`) el modelo subestima la gravedad y reescribe con menos agresividad, por lo que la calidad baja de forma notable.
- El CoT consume muchos tokens (3.000-4.000 habituales); con `max_tokens` insuficiente se obtiene solo el análisis sin el texto reescrito.
- El corpus de entrenamiento incluye contenido NSFW, lo que puede reflejarse en el comportamiento del modelo en dominios sensibles.
- Idiomas soportados no documentados; toda la evidencia apunta a un uso principal en chino.
- Licencia no disponible en la ficha de Hugging Face; los pesos heredan la licencia de Qwen3.5, que debe verificarse antes de un uso comercial.
- Riesgo de alucinación y de alteración del significado: al reescribir con compresión agresiva, el modelo puede omitir matices del original; se recomienda revisión humana.
- Sesgos: no documentados por el autor; el corpus procede de plataformas de novela web concretas, con el sesgo de selección que ello implica.
- Requiere vLLM >= 0.28 para aprovechar la decodificación especulativa MTP; versiones anteriores no soportan Qwen3.5 con MTP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aikexue170/rewrite3-4b-exp-fp8
- Modelo anterior rewrite2-4b (GGUF): https://huggingface.co/aikexue170/rewrite2-4b-gguf
- Modelo puntuador jev-novel-3-0.8b-fp8: https://huggingface.co/aikexue170/jev-novel-3-0.8b-fp8
- Paper, blog, repositorio o demo adicionales: no disponible
