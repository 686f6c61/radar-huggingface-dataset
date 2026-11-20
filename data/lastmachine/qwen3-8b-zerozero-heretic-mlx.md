# LastMachine/Qwen3-8B-ZeroZero-Heretic-MLX

## Resumen

Qwen3-8B-ZeroZero-Heretic-MLX es una compilación cuantizada en formato MLX del modelo LastMachine/Qwen3-8B-ZeroZero-Heretic, un derivado de Qwen3-8B de Alibaba Cloud al que se le ha aplicado un proceso de "abliteración" (eliminación de la dirección de rechazo en el espacio de activaciones) mediante la herramienta Heretic 2.0.0. El objetivo declarado es reducir drásticamente las negativas del modelo ante peticiones que un modelo alineado rechazaría, manteniendo al mismo tiempo las capacidades de razonamiento y los conocimientos factuales del modelo original. Esta versión concreta está pensada para ejecutarse en Macs con Apple Silicon mediante la librería mlx-lm.

El modelo conserva la arquitectura transformer densa de Qwen3-8B, con 8.190.735.360 parámetros totales según los pesos en safetensors, y se distribuye cuantizado a 4,5 bits por peso, lo que reduce el repositorio a 4,6 GB. La model card no documenta la longitud de contexto nativa de Qwen3-8B ni los idiomas soportados, aunque el pipeline declarado es text-generation y el único idioma listado es el inglés.

Su relevancia actual reside en dos frentes: por un lado, es un ejemplo práctico de modificación de alineamiento mediante abliteración con métricas cuantificadas de reducción de rechazos y de "slop" (texto de relleno); por otro, ofrece una vía de despliegue local eficiente en hardware Apple. El autor advierte explícitamente de que la reducción de rechazos no implica mayor veracidad y de que el modelo puede producir contenido dañino, falso o sesgado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX (4,5 bits por peso, cuantizado con mlx-lm) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 8.190 millones de parámetros derivado de Qwen3-8B. No se ha reentrenado desde cero: el autor parte del checkpoint base y aplica un proceso de abliteración con Heretic 2.0.0, que identifica y elimina la dirección de activación asociada al rechazo de peticiones. Posteriormente se aplica un pase adicional denominado "no-slop" orientado a reducir la verbosidad y las fórmulas de relleno típicas de los modelos alineados. La model card no documenta el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO adicionales.

La innovación técnica principal es la combinación de abliteración con un post-procesado anti-slop, con métricas medidas sobre el modelo completo de 16 bits (no sobre esta compilación de 4 bits). Según el autor, los rechazos en el test de prompts dañinos de Heretic caen de 100/100 a 9/100 (91 % menos), las respuestas que activan la lista de slop bajan de 78/100 a 25/100 (68 % menos), las palabras de slop por cada 1.000 pasan de 16,5 a 3,6 (78 % menos) y las comprobaciones de hechos y lógica se mantienen en 13/15. La cuantización a 4,5 bits introduce diferencias menores respecto al modelo de 16 bits, que el autor reconoce pero no cuantifica.

## Capacidades

- Generación de texto conversacional y de formato largo (relatos, artículos, documentación).
- Razonamiento y respuesta a preguntas sobre conocimiento general, heredados de Qwen3-8B.
- Generación de código y matemáticas a nivel de un modelo de 8B, aunque sin benchmarks publicados para esta variante.
- Reducción drástica de rechazos: responde a peticiones que un modelo alineado denegaría, incluidas algunas potencialmente dañinas.
- Estilo de respuesta más conciso y con menos fórmulas de relleno gracias al pase no-slop.
- Capacidades multilingües: no disponibles más allá del inglés declarado; el modelo base Qwen3 es multilingüe, pero esta ficha no documenta el alcance.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada para esta variante.

## Casos de uso

- Escritura creativa sin restricciones de tono: el modelo es adecuado para generar ficción, diálogos y escenas con violencia, temas adultos o lenguaje explícito que un modelo alineado rechazaría, gracias a la reducción del 91 % en rechazos medida por el autor.
- Generación de texto conciso en producción: el pase no-slop reduce las palabras de relleno de 16,5 a 3,6 por cada 1.000, lo que lo hace útil en pipelines donde se paga por token de salida o se exige densidad informativa.
- Prototipado local en Mac: al estar en formato MLX de 4,5 bits y ocupar 4,6 GB, permite experimentar con un modelo de 8B en un MacBook con Apple Silicon sin GPU dedicada, usando mlx-lm.
- Investigación sobre alineamiento y abliteración: sirve como caso de estudio reproducible de cómo la eliminación de una dirección de activación afecta a la tasa de rechazos y al estilo de respuesta, con métricas comparativas publicadas.
- Redacción asistida de contenido editorial: para borradores de artículos, guiones o correos donde se prioriza velocidad y concisión sobre el filtrado de seguridad.
- Evaluación comparativa de cuantizaciones: permite medir en hardware Apple la degradación de un modelo de 8B al pasar de 16 bits a 4,5 bits, usando el modelo base como referencia.
- Generación de datos sintéticos para ajuste fino: su menor tasa de rechazos facilita producir pares instrucción-respuesta en dominios que los modelos alineados evitan, siempre con revisión humana posterior.

## Benchmarks y rendimiento

La model card solo publica métricas internas del proceso de modificación, medidas sobre el modelo de 16 bits y no sobre esta compilación de 4 bits. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Medida | Antes | Después | Cambio |
|---|---:|---:|---:|
| Rechazos en el test de prompts dañinos de Heretic | 100/100 | 9/100 | 91 % menos |
| Respuestas que activan la lista de slop | 78/100 | 25/100 | 68 % menos |
| Palabras de slop por 1.000 | 16,5 | 3,6 | 78 % menos |
| Comprobaciones de hechos y lógica superadas | 13/15 | 13/15 | sin cambio |

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 4,6 GB en disco; en ejecución con MLX se recomienda al menos 8 GB de memoria unificada para dejar margen al contexto y a los buffers de inferencia.
- GPU recomendadas: Apple Silicon (series M1, M2, M3 y M4), ya que MLX está optimizado para el framework Metal de Apple. No es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon y 8 GB o más de memoria unificada; también en Macs con 16 GB o más para contextos largos.
- Opciones de despliegue: mlx-lm (comando `mlx_lm.generate`), con soporte para servidor local mediante `mlx_lm.server`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en el formato MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Enfoque |
|---|---:|---|---|---|---|
| LastMachine/Qwen3-8B-ZeroZero-Heretic-MLX | 8,19 B | no disponible | 4,5 bits MLX | Apache 2.0 | Abliterado + no-slop, Apple Silicon |
| LastMachine/Qwen3-8B-ZeroZero-Heretic | 8,19 B | no disponible | 16 bits | Apache 2.0 | Abliterado + no-slop, referencia completa |
| Qwen/Qwen3-8B | 8,19 B | no disponible | múltiples | Apache 2.0 | Modelo base alineado |
| Heretic (herramienta) | no aplica | no aplica | no aplica | no disponible | Utilidad de abliteración aplicable a otros modelos |

La comparación directa con alternativas abliteradas de otros autores no está disponible en la información proporcionada. Frente a Qwen3-8B, la diferencia medible es la tasa de rechazos y el estilo, no el conocimiento factual, que el autor mantiene en 13/15 comprobaciones.

## Limitaciones y advertencias

- El modelo responde a muchas peticiones que un modelo normal rechaza, incluidas algunas dañinas; su salida puede ser peligrosa, falsa o sesgada.
- Menos rechazos no implica más veracidad: el autor señala que sobre Tiananmen Square ofrece una versión oficial sanitizada y desaconseja su uso para hechos sobre China.
- No debe usarse para decisiones financieras, médicas o legales.
- La abliteración puede degradar sutilmente la coherencia en tareas de razonamiento largo; el autor solo reporta 13/15 comprobaciones de hechos y lógica, sin desglose.
- Las métricas publicadas corresponden al modelo de 16 bits; esta compilación de 4,5 bits puede presentar diferencias no cuantificadas.
- El único idioma declarado es el inglés; el comportamiento en castellano u otros idiomas no está documentado.
- La longitud de contexto no está especificada en la ficha, lo que impide planificar despliegues con ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume toda la responsabilidad sobre el contenido generado y sobre el cumplimiento normativo aplicable.
- Proyecto independiente no afiliado a Qwen, Alibaba Cloud, Anthropic ni al proyecto Heretic.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic-MLX
- Modelo base (16 bits): https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic
- Colección ZeroZero: https://huggingface.co/collections/LastMachine/zerozero-6af68595b0b72f13ce60bde2
- Modelo original Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Librería mlx-lm: no se proporciona enlace directo en la información disponible
