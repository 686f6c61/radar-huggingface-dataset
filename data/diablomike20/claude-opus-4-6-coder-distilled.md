# diablomike20/Claude-Opus-4.6-Coder-Distilled

## Resumen

QwOpus-4.6-Coder-3B es un ajuste fino por supervisión (SFT con LoRA) de Qwen2.5-Coder-3B-Instruct, orientado a imitar el estilo de razonamiento estructurado de Claude Opus 4.6 mediante destilación de trayectorias de razonamiento. Lo publica el usuario diablomike20 en Hugging Face (el autor se identifica como "ryzdfm" en la model card) y su objetivo es ofrecer un modelo de código con bloques `<think>` explícitos que quepa en GPUs de gama de entrada, con tan solo 4 GB de VRAM.

El modelo conserva la arquitectura transformer decoder-only del base Qwen2.5-Coder, con 3.085.938.688 parámetros totales (3B) y licencia Apache-2.0. No se trata de un modelo entrenado desde cero: es una adaptación ligera de 29,9 millones de parámetros entrenables (0,96 % del total) sobre 3.209 muestras de razonamiento destilado, en una única época sobre una Tesla T4 durante aproximadamente 46 minutos.

Su relevancia es acotada pero concreta: demuestra que es posible transferir un patrón de razonamiento paso a paso a un modelo pequeño con un coste de entrenamiento mínimo y desplegarlo localmente en hardware de consumo. Es un artefacto experimental de la comunidad, con cero descargas y cero "likes" en el momento de la consulta, y sin evaluación cuantitativa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2), ajustado con LoRA sobre Qwen2.5-Coder-3B-Instruct |
| Parametros totales | 3.085.938.688 (3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; el entrenamiento se realizo con longitud maxima de secuencia de 4.096 tokens |
| Tipos de cuantizacion | GGUF (Q4_K_M, Q3_K_M, Q8_0 documentados); pesos completos en safetensors |
| Idiomas soportados | Ingles (segun la model card y el campo `language: en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La base es Qwen2.5-Coder-3B-Instruct, un transformer decoder-only denso de la familia Qwen2, especializado en generación de código y con soporte nativo de plantilla de chat. Sobre él se aplicó un ajuste supervisado con LoRA de rango 16 y alpha 16, lo que deja 29.933.568 parámetros entrenables (0,96 % del total). El entrenamiento se realizó con Unsloth (versión 2026.3), batch efectivo de 16 (4 × 4 de acumulación de gradientes), tasa de aprendizaje 2e-4, una sola época, longitud máxima de 4.096 tokens, sobre una Tesla T4 de 16 GB y con un tiempo total de aproximadamente 46 minutos. La pérdida final de entrenamiento fue de 0,88.

El corpus de destilación suma 3.209 muestras repartidas en tres datasets: 2.326 de `nohurry/Opus-4.6-Reasoning-3000x-filtered`, 250 de `TeichAI/claude-4.5-opus-high-reasoning-250x` y 633 de `Jackrong/Qwen3.5-reasoning-700x`. La innovación no está en la arquitectura, sino en el formato: el modelo aprende a emitir un bloque `<think>` con descomposición del problema (objetivo, subcomponentes, casos límite, verificación) antes de la respuesta final. No se documenta ninguna fase de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de código en Python, JavaScript y algoritmos generales, heredada del base Qwen2.5-Coder.
- Razonamiento estructurado en bloques `<think>` antes de la respuesta final, con descomposición explícita en pasos.
- Resolución de problemas matemáticos y lógicos de varios pasos con verificación intermedia.
- Conversación multi-turno mediante plantilla de chat de Qwen2.5 (modo `-cnv` en llama.cpp).
- Inferencia local rápida: aproximadamente 88 tokens/s en una RTX 3050 de 4 GB con cuantización Q4_K_M.
- Soporte de tool calling / function calling: no documentado explícitamente en la model card, aunque la plantilla del base Qwen2.5 lo contempla; no hay evidencia de que el ajuste LoRA lo preserve.
- Capacidades de agente y razonamiento multi-paso autónomo: no documentadas.
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).
- Multilingüismo: limitado a inglés según la model card; el base soporta más idiomas, pero el ajuste se realizó solo con datos en inglés.

## Casos de uso

- Asistente de código en local para equipos con hardware modesto: el modelo cabe en 2,1 GB de VRAM en Q4_K_M, por lo que puede ejecutarse en portátiles con GPU de 4 GB para autocompletado y explicación de fragmentos, sin enviar código a servicios externos.
- Generación de funciones y scripts de un solo fichero: tareas acotadas de Python o JavaScript donde el razonamiento paso a paso del bloque `<think>` ayuda a evitar errores en la lógica de bucles y condiciones.
- Enseñanza de resolución de problemas: el modelo muestra su cadena de razonamiento, lo que resulta útil como material didáctico para explicar cómo se descompone un algoritmo antes de codificarlo.
- Prototipado rápido sin conexión: al ejecutarse con Ollama o llama.cpp en un equipo de desarrollo, sirve para generar borradores de código en entornos air-gapped o con requisitos de privacidad estrictos.
- Preprocesamiento en pipelines de CI/CD: generación de mensajes de commit, descripciones de cambios o casos de prueba unitarios sencillos a partir de diffs, donde la latencia de un modelo de 3B es aceptable.
- Base para nuevos experimentos de destilación: al tener licencia Apache-2.0 y un coste de ajuste de menos de una hora en una T4, es un punto de partida práctico para probar formatos de razonamiento o datasets propios.
- Chat técnico de soporte en inglés: resolución de dudas de programación de alcance corto, con la salvedad de que el modelo solo está entrenado en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento (pérdida final de 0,88) y de inferencia (aproximadamente 88 tokens/s en Q4_K_M sobre RTX 3050 de 4 GB, 95 tokens/s en Q3_K_M y 70 tokens/s en Q8_0). No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones comparativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB en Q4_K_M, 1,7 GB en Q3_K_M y 3,3 GB en Q8_0, según la model card.
- GPU recomendadas: RTX 3050 de 4 GB (referencia medida por el autor); cualquier GPU consumer con 4 GB o más de VRAM es suficiente. Para los pesos completos en safetensors (3B en fp16, en torno a 6 GB) se necesita una GPU de 8 GB o más.
- Cabe en GPU consumer: sí, en tarjetas de 4 GB como la RTX 3050, y en iGPU o CPU mediante llama.cpp con cuantizaciones bajas.
- Opciones de despliegue: Ollama (`ollama run hf.co/ryzdfm/qwen2.5-coder-3b-claude_opus_4.6-distilled`), llama.cpp con `-ngl 99 --flash-attn on --jinja -cnv --repeat-penalty 1.1`. Para safetensors, vLLM o TGI son compatibles por arquitectura Qwen2, aunque no están documentados por el autor.
- Latencia y throughput: aproximadamente 88 tokens/s en Q4_K_M sobre RTX 3050 de 4 GB; 70 tokens/s en Q8_0. No hay mediciones en otras GPU.
- Nota: el repo ocupa 8,1 GB, lo que incluye los pesos safetensors y las cuantizaciones GGUF publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QwOpus-4.6-Coder-3B | 3,09B | 32.768 (entrenado a 4.096) | Código + razonamiento destilado de Claude Opus | Apache-2.0 | Hugging Face, safetensors y GGUF |
| Qwen2.5-Coder-3B-Instruct (base) | 3,09B | 32.768 | Código e instruct general | Apache-2.0 | Hugging Face, ampliamente desplegado |
| Qwen2.5-Coder-7B-Instruct | 7,6B | 32.768 | Código e instruct general | Apache-2.0 | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78B | 32.768 (base Qwen2.5) | Razonamiento destilado de R1 | MIT | Hugging Face |

El modelo se posiciona como una variante de nicho del base Qwen2.5-Coder-3B: mismo tamaño, misma licencia y misma arquitectura, con la diferencia del formato `<think>` aprendido. Frente al base, no hay evidencia publicada de mejora en benchmarks; frente a alternativas de razonamiento destilado como DeepSeek-R1-Distill-Qwen-1.5B, el modelo de DeepSeek cuenta con evaluación publicada y mayor adopción, mientras que este carece de ambas.

## Limitaciones y advertencias

- Escala de 3B: rendimiento limitado en generación de código multi-fichero, refactorizaciones grandes y diseño de sistemas complejos.
- Entrenamiento de una sola época sobre 3.209 muestras: el estilo de razonamiento está destilado de forma superficial y no alcanza la profundidad de modelos mayores.
- Riesgo de alucinación: como cualquier LLM, puede inventar APIs, funciones o hechos; es obligatorio verificar las salidas antes de usarlas en producción.
- Idiomas: solo inglés según la model card; el uso en castellano no está cubierto por los datos de entrenamiento y degradará la calidad.
- Contexto efectivo: aunque el base soporta 32.768 tokens, el ajuste se hizo con secuencias de 4.096, por lo que el comportamiento más allá de esa longitud no está garantizado.
- Tool calling y comportamiento agéntico: no documentados ni evaluados tras el ajuste; no asumir que se conservan las capacidades del base.
- Inconsistencia de identidad: el ID de Hugging Face es `diablomike20/Claude-Opus-4.6-Coder-Distilled`, mientras que la model card, los comandos de descarga y la cita hacen referencia a `ryzdfm/qwen2.5-coder-3b-claude_opus_4.6-distilled`. Conviene verificar qué repositorio contiene realmente los pesos antes de desplegar.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe cumplir también las condiciones del modelo base Qwen2.5-Coder-3B-Instruct y de los datasets de destilación, cuyos términos no se detallan en la ficha.
- Madurez: cero descargas y cero valoraciones en el momento de la consulta; no hay informes independientes de calidad ni de seguridad.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos corresponden a la librería .NET AngleSharp y no guardan relación).

## Enlaces

- [Hugging Face: diablomike20/Claude-Opus-4.6-Coder-Distilled](https://huggingface.co/diablomike20/Claude-Opus-4.6-Coder-Distilled)
- [Repositorio referenciado en la model card: ryzdfm/qwen2.5-coder-3b-claude_opus_4.6-distilled](https://huggingface.co/ryzdfm/qwen2.5-coder-3b-claude_opus_4.6-distilled)
- [Modelo base: Qwen/Qwen2.5-Coder-3B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct)
- [Dataset: nohurry/Opus-4.6-Reasoning-3000x-filtered](https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered)
- [Dataset: TeichAI/claude-4.5-opus-high-reasoning-250x](https://huggingface.co/datasets/TeichAI/claude-4.5-opus-high-reasoning-250x)
- [Dataset: Jackrong/Qwen3.5-reasoning-700x](https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x)
- [Unsloth AI](https://unsloth.ai/)
