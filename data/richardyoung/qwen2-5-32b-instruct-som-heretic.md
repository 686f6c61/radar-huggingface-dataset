# richardyoung/Qwen2.5-32B-Instruct-SOM-heretic

## Resumen

Qwen2.5-32B-Instruct-SOM-heretic es una versión "decensored" (también etiquetada como abliterated) del modelo Qwen2.5-32B-Instruct de Alibaba Cloud, publicada por el usuario richardyoung. El modelo conserva la arquitectura y los pesos del original, pero aplica una técnica de ablación multi-direccional basada en mapas autoorganizados (SOM, Self-Organizing Map) mediante la herramienta Heretic v2.0.0, con el objetivo de reducir la tasa de rechazos (refusals) ante peticiones que el modelo original declinaría.

El modelo base Qwen2.5-32B-Instruct es un transformer causal de 32.500 millones de parámetros (32.763.876.352 según los safetensors), con 64 capas, atención GQA (40 cabezas de consulta y 8 de clave-valor), RoPE, SwiGLU, RMSNorm y sesgo en QKV. Soporta un contexto completo de 131.072 tokens (aunque el config.json por defecto está ajustado a 32.768, ampliable con YaRN) y genera hasta 8.192 tokens.

La relevancia de esta variante es concreta: ofrece el mismo rendimiento del Qwen2.5-32B-Instruct en tareas de razonamiento, código y matemáticas, pero con una tasa de rechazos reducida de 98/100 a 73/100 en la evaluación del autor, a costa de una divergencia KL de 0,0750 respecto al original. Es un modelo pensado para entornos controlados donde se necesita evitar negativas del modelo ante contenido legítimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2) con RoPE, SwiGLU, RMSNorm, atención GQA y sesgo QKV |
| Parametros totales | 32.763.876.352 (32,5B; 31,0B sin embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens completos; config.json por defecto a 32.768; generación de 8.192 tokens |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors en el formato original; no se listan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | El modelo base soporta más de 29 idiomas (inglés, chino, español, francés, portugués, alemán, italiano, ruso, japonés, coreano, vietnamita, tailandés, árabe, etc.); la model card de esta variante declara únicamente `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 65,5 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-32B-Instruct original: un transformer causal denso de 64 capas con 40 cabezas de atención para consultas y 8 para clave-valor (GQA), RoPE para codificación posicional, activación SwiGLU, normalización RMSNorm y sesgo en las proyecciones QKV. El modelo base fue entrenado por el equipo Qwen en dos fases (pretraining y post-training, incluyendo instrucción y preferencias), con mejoras específicas en conocimiento, código, matemáticas, seguimiento de instrucciones, generación de textos largos y salidas estructuradas (JSON). El contexto nativo es de 131.072 tokens, ampliable mediante YaRN con un factor de 4,0 sobre una ventana original de 32.768.

La modificación de esta variante no es un fine-tuning, sino una ablación de direcciones en el espacio de activaciones. Heretic v2.0.0 aplica un SOM multi-direccional que identifica direcciones asociadas al comportamiento de rechazo y las atenúa con pesos y posiciones específicas: en `attn.o_proj` con peso máximo 0,98 en la posición 44,28 y peso mínimo 0,62 a distancia 13,71; en `mlp.down_proj` con peso máximo 1,14 en la posición 49,04 y peso mínimo 0,90 a distancia 37,45. El índice de dirección es 50 y la decadencia de dirección 0,68. El resultado es una reducción de rechazos de 98/100 a 73/100 con una divergencia KL de 0,0750 respecto al modelo original.

## Capacidades

- Generación de texto y conversación multi-turno con plantilla de chat (`apply_chat_template`).
- Razonamiento, matemáticas y generación de código, heredados del Qwen2.5-32B-Instruct, que incluye modelos expertos especializados en estos dominios durante el entrenamiento.
- Seguimiento de instrucciones y resistencia a la diversidad de system prompts, útil para role-play y configuración de condiciones en chatbots.
- Comprensión y generación de datos estructurados (tablas, JSON) y textos largos de más de 8K tokens.
- Capacidad multilingüe del modelo base (más de 29 idiomas), aunque esta variante declara únicamente inglés en su model card.
- Reducción del comportamiento de rechazo: responde a peticiones que el modelo original declinaría, manteniendo coherencia general (KL 0,0750).
- Tool calling y function calling: no se documenta explícitamente en la información disponible para esta variante; el modelo base Qwen2.5-Instruct lo soporta, pero no se confirma aquí.
- Modo thinking, visión o audio: no disponible en esta variante (es un modelo de texto).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de rechazo y la ablación de direcciones comparando sus respuestas con las del Qwen2.5-32B-Instruct original, con una métrica objetiva de divergencia KL (0,0750) y tasa de rechazos (73/100 frente a 98/100).
- Generación creativa sin restricciones excesivas: escritura de ficción, guiones o narrativa con temáticas sensibles donde el modelo original se negaría, aprovechando la reducción de rechazos y el contexto de hasta 131.072 tokens para tramas largas.
- Role-play y simulación de personajes: la resistencia a system prompts diversos del Qwen2.5 y la menor tasa de negativas permiten mantener personajes con condiciones de rol complejas en conversaciones multi-turno.
- Procesamiento de documentos largos en inglés: análisis de contratos, informes o artículos de hasta 131.072 tokens (con YaRN) para extracción de información y resumen, aprovechando la ventana extendida y la comprensión de datos estructurados.
- Generación de código en pipelines internos: el modelo hereda las capacidades de código del Qwen2.5-32B-Instruct y puede integrarse en flujos de generación y revisión de código donde se requiera evitar negativas ante peticiones técnicas legítimas.
- Evaluación comparativa de modelos decensored: como referencia en estudios que comparan técnicas de ablación (Heretic SOM frente a otras), gracias a los parámetros de ablación publicados y a las métricas de rechazo y KL.
- Chatbot de dominio controlado: despliegue en entornos internos con contenido sensible (por ejemplo,模拟 de escenarios de seguridad) donde se necesita que el modelo no rechace sistemáticamente las consultas.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen2.5-32B-Instruct original |
|---|---|---|
| Rechazos (refusals) | 73/100 | 98/100 |
| Divergencia KL | 0,0750 | 0 (por definición) |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta variante. El autor remite al blog de Qwen2.5 para los resultados del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16/FP16): aproximadamente 65,5 GB de pesos, por lo que se necesitan al menos 2 GPU de 40 GB (A100 40GB) o una GPU de 80 GB (A100 80GB, H100 80GB) para cargar el modelo sin cuantizar.
- Cuantización a 8 bits: alrededor de 33 GB, cabe en una A100 40GB o en dos RTX 4090 de 24 GB.
- Cuantización a 4 bits: alrededor de 17-18 GB, cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB).
- GPU recomendadas: A100 80GB, H100 80GB para producción sin cuantizar; A100 40GB o 2x RTX 4090 para 8 bits; RTX 4090/3090 para 4 bits.
- Opciones de despliegue: transformers (recomendado con versión reciente, `transformers>=4.37.0`), vLLM (recomendado por Qwen para producción, con soporte de YaRN estático), text-generation-inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`). No se listan GGUF ni Ollama en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada; Qwen remite a su benchmark de velocidad para el modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-32B-Instruct-SOM-heretic (este) | 32,5B | 131.072 tokens (32.768 por defecto, YaRN) | Apache 2.0 | Variante decensored con ablación SOM; rechazos 73/100, KL 0,0750 |
| Qwen/Qwen2.5-32B-Instruct | 32,5B | 131.072 tokens | Apache 2.0 | Modelo base original; rechazos 98/100; referencia de rendimiento estándar |
| Otras variantes abliterated de Qwen2.5-32B-Instruct | 32,5B | 131.072 tokens | Apache 2.0 (heredada) | No disponible en la información proporcionada; no se detallan métricas comparables |

No se dispone de datos de benchmarks estándar ni de otras variantes decensored comparables en la información proporcionada para establecer una comparación de rendimiento más amplia.

## Limitaciones y advertencias

- La ablación reduce la tasa de rechazos de 98/100 a 73/100, pero no la elimina por completo; aún puede negarse ante ciertas peticiones.
- La divergencia KL de 0,0750 respecto al original implica cambios en la distribución de salida que pueden afectar a la calidad en tareas sensibles; no se han publicado evaluaciones exhaustivas de regresión.
- La model card declara únicamente el idioma inglés (`en`), aunque el modelo base soporta más de 29 idiomas; el comportamiento multilingüe tras la ablación no está verificado.
- Riesgo de alucinación inherente al modelo base, no evaluado específicamente en esta variante.
- Sesgos conocidos del Qwen2.5-32B-Instruct original, no mitigados por la ablación; la reducción de rechazos puede exponer contenido sesgado o inapropiado en producción.
- Licencia Apache 2.0, que permite uso comercial, pero el despliegue de un modelo decensored conlleva responsabilidad legal y ética sobre el contenido generado; se recomienda revisión y filtrado externos.
- El contexto por defecto en `config.json` es de 32.768 tokens; para aprovechar los 131.072 hay que configurar YaRN, y vLLM solo soporta YaRN estático, lo que puede degradar el rendimiento en textos cortos.
- El repo no incluye cuantizaciones GGUF ni versiones ligeras; el despliegue en hardware de consumo requiere cuantizar manualmente.
- Fecha de creación del repo: 2026-11-05; con 0 descargas y 0 likes, no hay validación comunitaria ni informes de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-32B-Instruct-SOM-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct/blob/main/LICENSE
- Heretic (herramienta de decensoring): https://heretic-project.org
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- GitHub de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Documentación de despliegue con vLLM: https://qwen.readthedocs.io/en/latest/deployment/vllm.html
- Benchmark de velocidad de Qwen: https://qwen.readthedocs.io/en/latest/benchmark/speed_benchmark.html
- Paper de YaRN: https://arxiv.org/abs/2309.00071
- Paper de Qwen2 (arxiv:2407.10671): https://arxiv.org/abs/2407.10671
