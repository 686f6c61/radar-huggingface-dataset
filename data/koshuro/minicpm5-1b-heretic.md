# koshuro/MiniCPM5-1B-heretic

## Resumen

MiniCPM5-1B-heretic es una variante desensurada (decensored) del modelo openbmb/MiniCPM5-1B, generada mediante la herramienta de abliteración Heretic v1.4.0. El modelo original, desarrollado por OpenBMB, es un transformer denso de 1.080 millones de parámetros con arquitectura LlamaForCausalLM, diseñado para despliegue en dispositivos locales y entornos con recursos limitados. Esta versión heretic elimina los mecanismos de rechazo (refusals) del modelo base, reduciendo la tasa de rechazo de 95/100 a 3/100, manteniendo una divergencia KL de 0.0383 respecto al original.

El modelo conserva todas las capacidades del MiniCPM5-1B: ventana de contexto de 131.072 tokens, soporte nativo de tool calling, modo de razonamiento híbrido (thinking/no-thinking) y entrenamiento con RL + OPD sobre el dataset UltraData. Su relevancia radica en ofrecer una alternativa de 1B parámetros sin restricciones de contenido para casos de uso donde se requiere generación libre, manteniendo un footprint de despliegue mínimo. Está disponible en formato safetensors y GGUF (q4_k_m, q5_k_m, q8_0), con licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (Transformer denso) |
| Parametros totales | 1.080.632.832 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | GGUF q4_k_m, q5_k_m, q8_0; safetensors (BF16) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-1B utiliza una arquitectura transformer causal estándar con 24 capas, atención GQA (16 cabezas de consulta y 2 de clave/valor) y 679.552.512 parámetros no-embedding. El entrenamiento sigue la práctica de gestión de datos por niveles UltraData, con una fase de post-entrenamiento que combina RL (reinforcement learning) y OPD (online preference distillation). El checkpoint final se publica en tres variantes: base (solo pre-entrenamiento), SFT y la versión final con RL + OPD.

La variante heretic se obtiene mediante abliteración, una técnica que identifica direcciones en el espacio de activaciones asociadas al rechazo y las elimina de los pesos de las capas de atención y MLP. Los parámetros de abliteración documentados incluyen direction_index 12.35, pesos máximos/mínimos en attn.o_proj y mlp.down_proj. El proceso es reproducible, con instrucciones en el directorio `reproduce` del repositorio. La divergencia KL de 0.0383 indica que la modificación altera mínimamente el comportamiento general del modelo fuera de los patrones de rechazo.

## Capacidades

- Generación de texto y conversación multilingüe (inglés y chino) con contexto largo de hasta 131.072 tokens.
- Razonamiento híbrido: el mismo checkpoint funciona como asistente rápido o razonador deliberado mediante la plantilla de chat `thinking`, activable con `enable_thinking`.
- Tool calling y function calling nativo, optimizado para agentes y flujos de trabajo con herramientas externas.
- Generación de código y razonamiento matemático, con ventaja destacada en tareas de razonamiento difícil según la model card del modelo original.
- Capacidad de agente multi-paso (multi-step reasoning) para tareas complejas.
- Despliegue en dispositivos edge y entornos on-device gracias a su tamaño compacto.
- Ausencia de mecanismos de rechazo (uncensored), lo que permite generar contenido que el modelo original bloquearía.

## Casos de uso

- Asistente local en dispositivos edge: con 1B parámetros y cuantización q4_k_m (~0,7 GB), puede ejecutarse en Raspberry Pi, teléfonos o portátiles de gama baja, ofreciendo respuestas conversacionales con contexto largo de hasta 131.000 tokens.
- Agente de código con tool calling: integrable en IDEs o CLIs para autocompletar, refactorizar y ejecutar comandos, aprovechando su soporte nativo de function calling y su ventaja en generación de código frente a otros modelos de su clase.
- Chat de atención al cliente multilingüe: gestiona conversaciones multi-turno en inglés y chino con memoria de contexto amplia, adecuado para sistemas de soporte que requieren recordar interacciones largas.
- Razonamiento deliberado sobre documentos extensos: activando el modo thinking, puede analizar contratos, informes o artículos de hasta 131.000 tokens, desglosando el razonamiento paso a paso.
- Generación de contenido creativo sin restricciones: al ser una versión desensurada, permite explorar narrativas, diálogos o material educativo que el modelo original rechazaría, útil en investigación de IA o creación literaria experimental.
- Automatización de tareas con agentes: puede orquestar pipelines de múltiples pasos, llamando a APIs y herramientas externas, por ejemplo en flujos de scraping, resumen o generación de informes.
- Experimentación y reproducibilidad: al ser un modelo reproducible con documentación del proceso de abliteración, sirve para estudiar el impacto de la eliminación de sesgos de rechazo en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta variante heretic. La model card del modelo original indica que MiniCPM5-1B alcanza el estado del arte en su clase (1B) comparado con LFM2.5-1.2B-Thinking, Qwen3-0.6B/think y Qwen3.5-0.8B/think, con ventaja especialmente visible en tool use, generación de código y razonamiento difícil, pero no se proporcionan cifras concretas.

Los únicos datos cuantitativos disponibles son específicos de la variante heretic:

| Metrica | Modelo heretic | Modelo original |
|---|---|---|
| Divergencia KL | 0.0383 | 0 (por definicion) |
| Tasa de rechazo (refusals) | 3/100 | 95/100 |

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,7 GB con cuantización q4_k_m, ~0,9 GB con q5_k_m, ~1,2 GB con q8_0, y ~2,2 GB en BF16 (estimaciones basadas en el tamaño de parámetros; no se han medido oficialmente).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) es suficiente para las cuantizaciones GGUF. Para BF16 se recomienda al menos 4 GB.
- Cabe en GPUs consumer de gama baja y también puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio (para GGUF), vLLM y Text Generation Inference (TGI) para safetensors, y MLX para Apple Silicon (el modelo original tiene una variante MLX).
- Latencia y throughput: no disponibles en la información proporcionada; se espera que sea adecuado para uso interactivo en hardware consumer dado el tamaño de 1B parámetros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| koshuro/MiniCPM5-1B-heretic | 1,08B | 131.072 | Apache 2.0 | Variante desensurada del MiniCPM5-1B |
| openbmb/MiniCPM5-1B | 1,08B | 131.072 | Apache 2.0 | Modelo original con mecanismos de rechazo |
| Qwen3-0.6B | 0,6B | no disponible | Apache 2.0 | Comparado en la model card del original; sin datos detallados |
| LFM2.5-1.2B-Thinking | 1,2B | no disponible | no disponible | Comparado en la model card del original; sin datos detallados |

La comparativa se limita a los modelos mencionados en la model card del original. No se dispone de datos de rendimiento numéricos para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Contenido desensurado: al eliminar los mecanismos de rechazo, el modelo puede generar contenido ofensivo, ilegal o perjudicial. No es adecuado para despliegues públicos sin moderación humana o filtros adicionales.
- Riesgo de alucinación: como todo modelo de lenguaje pequeño, puede inventar hechos, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- Sesgos conocidos: el entrenamiento sobre UltraData puede reflejar sesgos presentes en los datos; la abliteración no corrige sesgos, solo elimina rechazos.
- Limitaciones de idioma: solo soporta inglés y chino; no hay garantía de calidad en otros idiomas.
- Sin datos de benchmarks: no se han publicado resultados de evaluación estándar para esta variante, lo que dificulta comparar su rendimiento real con alternativas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir con las leyes aplicables.
- Reproducibilidad: aunque el proceso es reproducible, requiere ejecutar Heretic v1.4.0 con los parámetros exactos documentados; variaciones pueden producir resultados diferentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/koshuro/MiniCPM5-1B-heretic
- Modelo original: https://huggingface.co/openbmb/MiniCPM5-1B
- Proyecto Heretic: https://heretic-project.org
- MiniCPM Tech Report (arXiv 2506.07900): https://arxiv.org/pdf/2506.07900
- UltraData Tiered Data Management (arXiv 2602.09003): https://arxiv.org/pdf/2602.09003
- Repositorio GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM
- Demo online del modelo original: https://huggingface.co/spaces/openbmb/MiniCPM5-1B-Demo
