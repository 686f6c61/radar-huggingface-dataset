# logic65/Whittle-Next-26B-A3B

## Resumen

Whittle-Next-26B-A3B es un modelo de lenguaje experimental de tipo mixture-of-experts (MoE) desarrollado por logic65 como parte de una línea de investigación sobre compresión y destilación de modelos. Se presenta como un "research preview" que sirve de precursor a una versión final de 27B, y su principal interés radica en que implementa la arquitectura `qwen4_exp` (formato Qwen3.8-Flash-Next) sobre un cuerpo derivado de Qwen3.6-35B-A3B, ejecutándose sin modificaciones en llama.cpp estándar.

El modelo tiene 26.1B parámetros totales (25.1B del cuerpo pruned más 1.0B de una tabla de memoria n-gram) y activa aproximadamente 3B parámetros por token. Incorpora innovaciones técnicas como hyper-connections de cuatro flujos residuales, puertas sigmoide en lugar de silu, y una memoria hashed de n-gramas que se puede ampliar sin reentrenar. Su relevancia actual reside en que demuestra la viabilidad de combinar poda, destilación online y arquitecturas experimentales en un formato servible con herramientas estándar.

La licencia es Apache-2.0, lo que permite uso comercial y modificación, aunque al ser un modelo de investigación con una memoria n-gram entrenada solo durante una hora, sus capacidades están limitadas respecto a modelos de producción consolidados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` (MoE con gated-delta-net, hyper-connections, memoria n-gram) |
| Parametros totales | 26.553.382.016 (26.1B: 25.1B cuerpo + 1.0B tabla n-gram) |
| Parametros activos | ~3B por token (las búsquedas en tabla n-gram no activan parámetros adicionales) |
| Longitud de contexto | no disponible (el README recomienda `-c 8192` en ejecución) |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | no disponible (hereda el tokenizador de Qwen3.6, presumiblemente multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

Whittle-Next-26B-A3B se construye a partir de Qwen3.6-35B-A3B mediante un proceso de poda que reduce los expertos enrutados de 256 a 180 por capa, pasando de 34.7B a 25.1B parámetros. Tras la poda, se aplica una fase de "curación" con auto-destilación desde los pesos no podados usando una máscara de enrutamiento, con LoRA sobre los expertos conservados y optimizadores Muon + AdamW. El resultado intermedio se publicó como Qwen3.6-Whittle-25B-A3B.

La conversión a la arquitectura `qwen4_exp` se realiza en varias etapas: primero se convierten progresivamente las puertas silu a sigmoide (tres capas GDN a la vez desde atrás, con reajuste y entrenamiento), luego se retrofitan hyper-connections de cuatro flujos residuales con un mezclador de cabeza en identidad exacta, y finalmente se añade una tabla de memoria n-gram de 1.0B parámetros (8 cabezas × 488,320 filas × 256) que se lee antes de la capa 2 mediante una ruta gated key/value. La tabla se entrena con SGD disperso normalizado y puede duplicarse por replicación sin perder comportamiento.

La fase final consiste en destilación online desde Qwen3.8-27B: forward KL sobre el vocabulario completo de 248k tokens en ventanas de corpus, más reverse KL sobre las respuestas muestreadas por el propio estudiante, con el gradiente on-policy acumulado en el siguiente paso de corpus. El modelo se exporta al formato GGUF estándar con `convert_hf_to_gguf.py` de llama.cpp sin parches.

## Capacidades

- Generación de texto conversacional: sigue la plantilla de chat, produce respuestas coherentes y alcanza EOS en 10 de 12 respuestas abiertas según la prueba de parada del autor.
- Razonamiento matemático: obtiene 87.0% (174/200) en GSM8K con muestreo, sin modo thinking, en llama.cpp con Q8_0.
- Memoria n-gram: la tabla hashed de bigramas y trigramas se lee en el residual antes de la capa 2, lo que permite capturar patrones locales de repetición sin activar parámetros adicionales.
- Multi-turno: el autor reporta que la retención de nombres en conversaciones multi-turno funciona correctamente.
- Sin modo thinking explícito: se recomienda desactivar `enable_thinking` en la plantilla de chat.
- Capacidades de tool calling, agentes o visión: no disponibles en la información proporcionada.

## Casos de uso

- Experimentación con arquitecturas MoE: el repositorio incluye los tensores entrenados de hyper-connections, puertas y routers, así como la tabla n-gram en bruto, lo que permite a investigadores continuar el entrenamiento o estudiar el comportamiento de la arquitectura `qwen4_exp`.
- Evaluación de formatos de exportación: al ejecutarse en llama.cpp estándar sin parches, sirve como banco de pruebas para verificar la compatibilidad de arquitecturas experimentales con el ecosistema GGUF.
- Generación de texto conversacional en entornos con recursos limitados: con ~3B parámetros activos, puede desplegarse en GPUs de consumo para chatbots o asistentes de dominio específico, aunque con las limitaciones de un modelo de investigación.
- Razonamiento aritmético y explicaciones paso a paso: el autor señala que el teacher (Qwen3.8-27B) tiende a explicar operaciones aritméticas detalladamente, un comportamiento que se transfiere al estudiante y que puede aprovecharse en aplicaciones educativas.
- Investigación sobre destilación online: los logs de entrenamiento y los intentos fallidos documentados ofrecen material para estudiar estrategias de destilación on-policy y sus problemas de ruido.
- Desarrollo de memorias externas para LLMs: la tabla n-gram entrenable y ampliable sin reentrenar es un caso de estudio para integrar memorias no paramétricas en modelos MoE.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| GSM8K (200 preguntas) | 87.0% (174/200) | Sin thinking, llama.cpp Q8_0, sampler de servidor |
| Prueba de parada (12 respuestas abiertas, 400 tokens) | 10/12 alcanzan EOS | Repetición máxima de 4-gram: 0.038 |
| Retención de nombres multi-turno | Correcta | Evaluación cualitativa del autor |

No se han publicado resultados de benchmarks en la información disponible más allá de los anteriores. El autor indica que el rendimiento en GSM8K está dentro del ruido respecto al modelo base, y que la ganancia principal de la memoria n-gram se espera con el entrenamiento nocturno de la versión 27B.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 del modelo completo (26.1B) requiere aproximadamente 26-28 GB de VRAM para los pesos, más overhead de contexto y KV cache. Con `-c 8192`, se recomiendan al menos 32 GB de VRAM.
- GPU recomendadas: A100 40GB, H100, o RTX 4090 24GB (ajustando el contexto). No cabe en GPUs de 16 GB o inferiores con Q8_0.
- Opciones de despliegue: llama.cpp (llama-server), compatible con el ecosistema GGUF. No se menciona soporte para vLLM, TGI u Ollama en la información proporcionada.
- Latencia y throughput: no disponibles. Al ser un MoE con ~3B activos, se espera un throughput superior al de un denso de 26B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | GSM8K | Licencia |
|---|---|---|---|---|---|
| Whittle-Next-26B-A3B | 26.1B | ~3B | no disponible | 87.0% (Q8_0, llama.cpp) | Apache-2.0 |
| Qwen3.6-Whittle-25B-A3B (base) | 25.1B | ~3B | no disponible | 92.5% (transformers) | Apache-2.0 |
| Qwen3.6-35B-A3B (origen) | 35B | 3B | no disponible | no disponible | Apache-2.0 |
| Qwen3.8-27B (teacher) | 27B denso | 27B | no disponible | no disponible | Apache-2.0 |

La comparativa muestra que la poda y conversión reducen el rendimiento en GSM8K respecto al modelo base en transformers (92.5% vs 87.0%), aunque las condiciones de evaluación difieren (transformers vs llama.cpp Q8_0). El teacher denso de 27B no tiene cifras publicadas en la información disponible.

## Limitaciones y advertencias

- Modelo de investigación: es un "research preview" con una memoria n-gram entrenada solo durante una hora; el autor indica que su valor crece con el entrenamiento nocturno de la versión 27B.
- Decodificación greedy: el autor advierte explícitamente que la decodificación greedy provoca bucles de repetición; es obligatorio usar muestreo (temperatura 0.7, top_p 0.8, top_k 20, repeat_penalty 1.05).
- Rendimiento matemático inferior al base: la conversión de arquitectura y la poda reducen el GSM8K de 92.5% a 87.0% en las condiciones evaluadas.
- Alucinaciones y sesgos: no se han documentado específicamente, pero al derivar de Qwen3.6, hereda los sesgos de su corpus de entrenamiento.
- Longitud de contexto no verificada: no se especifica la longitud máxima soportada; el autor solo recomienda `-c 8192` en ejecución.
- Sin tool calling ni capacidades multimodales: la información disponible no menciona soporte para funciones, agentes, visión o audio.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo incluye pesos derivados de Qwen3.6 y Qwen3.8, ambos Apache-2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/logic65/Whittle-Next-26B-A3B
- Modelo base (Qwen3.6-Whittle-25B-A3B): https://huggingface.co/logic65/Qwen3.6-Whittle-25B-A3B
- Repositorio relacionado (whittle-next, base sin entrenar): https://huggingface.co/logic65/whittle-next
- Repositorio de pruebas (whittle-next-moe-test): https://huggingface.co/logic65/whittle-next-moe-test
- Guía de Qwen 3.6 (contexto de la familia): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Blog de Qwen3-Next (arquitectura relacionada): https://qwen.ai/blog?id=4074cca80393150c248e508aa62983f9cb7d27cd&from=research.latest-advancements-list
- Ficha de Qwen3.8-Whittle-MoE-27B-A17.8B (modelo relacionado): https://aimarketcap.tech/models/logic65-qwen3-8-whittle-moe-27b-a17-8b
