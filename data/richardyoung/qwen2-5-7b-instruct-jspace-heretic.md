# richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic

## Resumen

Qwen2.5-7B-Instruct-JSpace-heretic es una variante "decensored" (también etiquetada como *abliterated* o *uncensored*) del modelo instructivo Qwen2.5-7B-Instruct de Alibaba Cloud, publicada por el usuario richardyoung. El modelo conserva la arquitectura y los pesos del original, pero se ha modificado mediante la herramienta Heretic v2.0.0 aplicando una técnica de *pullback ablation* sobre las direcciones de rechazo en las capas de atención y MLP, con el objetivo de reducir la tasa de negativas del modelo ante peticiones que el original rechazaría.

El modelo base es un transformer causal de 7.615 millones de parámetros (6.53B no-embedding) con 28 capas, atención con GQA (28 cabezas de consulta y 4 de clave/valor), RoPE, SwiGLU y RMSNorm. Soporta una ventana de contexto completa de 131.072 tokens (configurada a 32.768 por defecto, ampliable con YaRN) y genera hasta 8.192 tokens. Está entrenado para instrucciones y conversación, con soporte multilingüe en el modelo original (más de 29 idiomas), aunque la model card de esta variante solo declara inglés.

La relevancia de esta ficha radica en que documenta una modificación de seguridad de un modelo abierto muy utilizado: el autor reporta una reducción de rechazos de 99/100 a 84/100 en su conjunto de evaluación, con una divergencia KL de 0.0216 respecto al original. Es un caso de estudio útil para quienes investigan alineación, *abliteration* y el equilibrio entre utilidad y salvaguardas en modelos desplegados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y sesgo QKV en atención (GQA) |
| Parámetros totales | 7.615.616.512 (7.61B); 6.53B no-embedding |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens completos; `config.json` por defecto a 32.768; generación hasta 8.192 tokens |
| Tipos de cuantización | No disponible en la información proporcionada (el repo contiene safetensors en precisión original; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | La model card de esta variante declara `en`; el modelo base Qwen2.5 soporta más de 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers); tamaño del repo 15.2 GB |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-7B-Instruct original: un transformer causal denso de 28 capas con 28 cabezas de atención para consultas y 4 para clave/valor (GQA), RoPE para codificación posicional, SwiGLU en las capas feed-forward y RMSNorm. El modelo base fue entrenado en dos fases (pretraining y post-training) por Alibaba Cloud, con mejoras específicas en conocimiento, código, matemáticas, seguimiento de instrucciones, generación de textos largos y salidas estructuradas (JSON). No se dispone en la información proporcionada del número exacto de tokens de entrenamiento ni de la composición del dataset del modelo base.

La modificación de esta variante consiste en una *pullback ablation* aplicada con Heretic v2.0.0. Según los parámetros publicados por el autor, se intervienen las proyecciones `attn.o_proj` y `mlp.down_proj` con pesos máximos y mínimos en posiciones y distancias concretas (por ejemplo, `attn.o_proj.max_weight` = 1.23 en posición 16.78, `mlp.down_proj.max_weight` = 1.36 en posición 16.20), junto con un `direction_index` de 21.44. Esta técnica elimina o atenúa direcciones del espacio de activaciones asociadas a respuestas de rechazo, sin reentrenar el modelo. El autor reporta una divergencia KL de 0.0216 frente al original, lo que indica un cambio moderado pero no trivial en la distribución de salidas.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat (`apply_chat_template`).
- Razonamiento, matemáticas y generación de código heredados del Qwen2.5-7B-Instruct original.
- Comprensión y generación de textos largos (hasta 8K tokens de salida) y datos estructurados como tablas y JSON.
- Seguimiento de instrucciones y resistencia a variaciones en system prompts, orientado a role-play y chatbots.
- Capacidades multilingües del modelo base (más de 29 idiomas), aunque esta variante solo declara inglés en su model card.
- Reducción de rechazos: el autor reporta 84/100 negativas frente a 99/100 del original en su conjunto de evaluación.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada para esta variante.
- Modo *thinking* o razonamiento extendido: no disponible.
- Visión o audio: no disponible (modelo solo texto).

## Casos de uso

- Investigación en alineación y seguridad: permite estudiar cómo la *abliteration* afecta a la tasa de rechazos y a la divergencia KL frente al modelo original, usando los parámetros publicados por el autor como referencia reproducible.
- Generación creativa sin restricciones excesivas: escritura de ficción, guiones o narrativa con temáticas sensibles donde el modelo original tiende a rechazar la petición; el contexto de 131K tokens permite manejar manuscritos largos.
- Role-play y personajes: la resistencia a variaciones de system prompt del Qwen2.5 base, combinada con la reducción de negativas, facilita mantener personajes con condiciones de rol complejas.
- Evaluación comparativa de salvaguardas: desplegar esta variante junto al Qwen2.5-7B-Instruct original para medir diferencias de comportamiento en pipelines de red-teaming.
- Procesamiento de documentos largos en inglés: resumen y extracción de información de contratos o informes de hasta 32K tokens (ampliable a 131K con YaRN), aunque con la advertencia de que la modificación puede afectar a la fidelidad en tareas sensibles.
- Prototipado de chatbots en local: al ser un modelo de 7.6B con licencia Apache 2.0, se puede ejecutar en una sola GPU consumer para experimentación con conversación multi-turno.
- Generación de código y JSON en entornos controlados: hereda las mejoras del Qwen2.5 original en salidas estructuradas, útil para pipelines internos donde no se requiere filtrado de contenido.

## Benchmarks y rendimiento

Los únicos datos publicados en la información proporcionada son los de la model card del autor, que comparan esta variante con el modelo original:

| Métrica | Este modelo | Qwen/Qwen2.5-7B-Instruct |
|---|---|---|
| Rechazos (Refusals) | 84/100 | 99/100 |
| Divergencia KL | 0.0216 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta variante en la información disponible. Los benchmarks del modelo base Qwen2.5-7B-Instruct están documentados en el blog y la documentación oficial de Qwen, pero no se reproducen aquí al no haberse proporcionado sus cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15.2 GB en FP16/BF16 (tamaño del repo en safetensors); alrededor de 8 GB en cuantización de 8 bits y 4-5 GB en 4 bits, estimaciones habituales para un modelo de 7.6B.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en producción con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) en FP16 y en GPUs de 8-12 GB con cuantización de 4-8 bits.
- Opciones de despliegue: transformers (recomendado `transformers>=4.37.0` para evitar el error `KeyError: 'qwen2'`), vLLM (recomendado por Qwen para producción), TGI (tag `text-generation-inference` presente), llama.cpp/Ollama mediante conversión a GGUF (no incluida en el repo).
- Latencia y throughput: no disponibles en la información proporcionada; Qwen publica cifras de velocidad en su documentación de benchmarks, pero no se han facilitado aquí.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-JSpace-heretic | 7.61B | 131K (32K por defecto) | Apache 2.0 | Instructivo decensored | Hugging Face (richardyoung) |
| Qwen/Qwen2.5-7B-Instruct | 7.61B | 131K (32K por defecto) | Apache 2.0 | Instructivo original con salvaguardas | Hugging Face (Qwen) |
| Otras variantes abliterated de Qwen2.5-7B | 7.61B | 131K | Apache 2.0 | Decensored mediante otras técnicas | Disponibles en Hugging Face (no verificadas en esta búsqueda) |

La comparación directa con alternativas de otros fabricantes (Llama 3.1 8B Instruct, Mistral 7B Instruct) no se incluye porque no se han proporcionado datos de rendimiento de esta variante que permitan una comparación rigurosa. La diferencia medible frente al original es la tasa de rechazos (84/100 frente a 99/100) y la divergencia KL de 0.0216.

## Limitaciones y advertencias

- La modificación elimina parcialmente las salvaguardas del modelo original: puede generar contenido que el Qwen2.5-7B-Instruct rechazaría, con implicaciones legales y éticas según el uso.
- La model card solo declara inglés; el soporte multilingüe del modelo base no está verificado en esta variante y podría degradarse.
- La divergencia KL de 0.0216 indica que la distribución de salidas cambia de forma no despreciable; pueden aparecer degradaciones en tareas que dependían del comportamiento original.
- Riesgo de alucinación: inherente a los modelos de 7B; la modificación no lo mitiga y podría aumentarlo en dominios sensibles.
- Sesgos: no se documentan evaluaciones de sesgo para esta variante; los sesgos del modelo base persisten y la ablación no los corrige.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin salvaguardas puede incumplir políticas de plataformas o regulaciones sectoriales.
- El conjunto de evaluación de rechazos (100 prompts) es pequeño y no está documentado en detalle; la métrica 84/100 debe interpretarse con cautela.
- No se proporcionan cuantizaciones oficiales ni pesos GGUF en el repo; la conversión corre a cargo del usuario.
- Fecha de creación del repo: 2026-11-05, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-JSpace-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Heretic (herramienta de decensoring): https://heretic-project.org
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentación de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Benchmarks de velocidad de Qwen: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper de YaRN: https://arxiv.org/abs/2309.00071
- Paper de Qwen2 (referencia técnica): https://arxiv.org/abs/2407.10671
