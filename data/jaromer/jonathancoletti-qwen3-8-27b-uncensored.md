# jaromer/JonathanColetti-Qwen3.8-27B-Uncensored

## Resumen

JonathanColetti/Qwen3.8-27B-Uncensored es una adaptación del modelo Qwen3.8-27B de Alibaba, publicada por el usuario JonathanColetti y alojada también bajo el perfil jaromer. El modelo aplica una técnica de abliteración para reducir sustancialmente el comportamiento de rechazo ante peticiones dañinas, pasando de 98 rechazos a 12 sobre 100 prompts problemáticos, manteniendo una divergencia KL de 0,1191 respecto al modelo base. No se trata de un fine-tuning convencional: se eliminan direcciones de rechazo mediante la herramienta Heretic, sin datos de entrenamiento adicionales ni ajuste de pesos completo.

La arquitectura es la del modelo base, un `Qwen3_5ForConditionalGeneration` con 27.356 millones de parámetros, atención híbrida (Gated DeltaNet linear + atención completa), ventana de contexto de 262.144 tokens, soporte de visión y cabezal de predicción multi-token (MTP). El checkpoint se distribuye en bf16, con los tensores `mtp.*` restaurados desde el checkpoint base, y existe una versión GGUF con cuantizaciones imatrix para inferencia local. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones de atribución.

La relevancia de este modelo radica en su utilidad para investigar el comportamiento de rechazo en LLMs, el impacto de la abliteración sobre las capacidades generales y la posibilidad de desplegar un modelo multimodal de 27B con razonamiento y visión en hardware convencional mediante cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (atención híbrida: Gated DeltaNet linear + atención completa) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | bf16 nativo; GGUF con cuantizaciones imatrix (2-bit a 8-bit) disponibles en repositorio separado |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); GGUF en repositorio derivado |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con 64 capas y un vocabulario de 248.320 tokens, que combina atención lineal Gated DeltaNet con atención completa en capas alternas. Incluye un módulo de predicción multi-token (MTP) con 1 capa adicional, pensado para acelerar la decodificación especulativa, y un codificador de visión integrado que permite entrada de imágenes.

El proceso de abliteración se realizó con la herramienta Heretic, que co-minimiza el número de rechazos frente a la divergencia KL respecto al base. Se ejecutaron 200 pruebas de optimización y se seleccionó un punto del frente de Pareto con el menor recuento de rechazos (12/100) y una KL de 0,1191. Solo se modificaron los tensores `attn.o_proj` y `mlp.down_proj` (64 módulos cada uno), y los pesos `mtp.*` se copiaron literalmente del checkpoint base tras la fusión de la LoRA. El proceso se ejecutó en bf16 sin cuantización intermedia.

## Capacidades

- Generación de texto con razonamiento: el modelo activa un bloque `thinking` por defecto en la plantilla de chat, que puede desactivarse con `enable_thinking=False`.
- Multimodal: acepta entrada de imágenes además de texto, gracias al codificador de visión integrado.
- Tool calling y function calling: soportado por el modelo base Qwen3.5, por lo que puede integrarse en pipelines de agentes.
- Razonamiento multi-paso: compatible con el modo de razonamiento del base, aunque la abliteración no modifica este comportamiento.
- Decodificación especulativa: la cabecera MTP permite acelerar la generación cuando se usa con backends que la soporten (p. ej. llama.cpp con los GGUF).
- Multilingüe limitado: solo inglés y chino según la configuración declarada.
- Sin censura parcial: el rechazo ante peticiones dañinas se reduce del 98% al 12%, aunque no se elimina por completo.

## Casos de uso

- Investigación en alineación y seguridad: el modelo permite estudiar el efecto de la abliteración sobre el comportamiento de rechazo, comparando con el base en entornos controlados. La métrica de divergencia KL y los benchmarks 0-shot publicados facilitan el análisis.
- Desarrollo de agentes con tool calling: gracias al soporte nativo de function calling y al contexto de 262K, puede usarse como backend de agentes que gestionan múltiples herramientas y conversaciones largas.
- Asistente de código en entornos con restricciones de contenido: su naturaleza abliterada puede ser útil en herramientas de generación de código que requieran menos filtros sobre prompts técnicos sensibles, aunque no hay benchmarks de HumanEval publicados.
- Procesamiento de documentos con imagen y texto: el componente de visión permite extraer información de capturas, diagramas o documentos escaneados, combinando razonamiento con contexto largo.
- Despliegue en entornos de baja latencia con MTP: los GGUF con cuantizaciones imatrix y la cabecera MTP permiten ejecutar inferencia con decodificación especulativa en hardware de gama media, útil para aplicaciones interactivas.
- Experimentación con modelos "uncensored" en entornos de investigación: el modelo sirve como punto de partida para estudiar los límites de la abliteración y la evaluación de riesgos en producción.

## Benchmarks y rendimiento

La model card publica resultados 0-shot medidos con lm-evaluation-harness en bf16, comparando el modelo abliterado con el base en la misma sesión. No se han publicado resultados de generación (GSM8K, HumanEval) ni evaluaciones del componente de visión.

| Tarea | Base | Uncensored | Delta |
|---|---|---|---|
| MMLU | 83.4 | 83.3 | -0.2 |
| ARC-Challenge | 58.9 | 57.7 | -1.2 |
| HellaSwag | 82.8 | 82.9 | +0.1 |
| Winogrande | 76.1 | 75.3 | -0.8 |
| Media | - | - | -0.5 |

| Medida | Base | Este modelo |
|---|---|---|
| Rechazos (100 prompts dañinos) | 98/100 | 12/100 |
| Divergencia KL (primer token) | 0 | 0.1191 |

Los autores indican que cada delta está dentro o cerca del error estándar reportado (MMLU ±0.30, ARC ±1.44, HellaSwag ±0.38, Winogrande ±1.21), por lo que no se puede separar del ruido de ejecución. No se han publicado benchmarks de código, matemáticas o visión.

## Requisitos de hardware

- Inferencia en bf16: aproximadamente 55 GB de VRAM (según la model card), lo que requiere GPUs como A100 80GB, H100 80GB o una configuración multi-GPU (p. ej. dos RTX 4090 de 24GB con reparto de capas).
- Cuantización GGUF: los repositorios GGUF con imatrix ofrecen opciones de 2 a 8 bits. Un cuantizado Q4_K_M de 27B suele ocupar entre 15-18 GB, y puede caber en una RTX 3090/4090 de 24 GB.
- Despliegue compatible: los pesos safetensors se cargan con transformers y vLLM (por ser modelo compatible con endpoints). Los GGUF se usan con llama.cpp, Ollama y LM Studio.
- Latencia y throughput: no hay cifras publicadas. La cabecera MTP puede mejorar la velocidad de decodificación en implementaciones que la soporten, pero no se proporcionan datos concretos.
- Alternativa en CPU: con cuantizaciones de 4 bits o inferiores, es posible ejecutar en CPU con llama.cpp, aunque la velocidad será baja para contexto largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Diferencias clave |
|---|---|---|---|---|
| Qwen3.5-27B (base) | 27,4B | 262K | Apache 2.0 | Modelo original con rechazo intacto (98/100), sin abliteración. |
| JonathanColetti/Qwen3.8-27B-Uncensored | 27,4B | 262K | Apache 2.0 | Abliterado con Heretic; rechazos reducidos a 12/100; KL 0.1191. |
| Qwen3-30B-A3B (MoE) | 30,5B (3,3B activos) | 262K | Apache 2.0 | Arquitectura MoE con menor coste de inferencia, pero sin visión y sin abliteración. |

No hay datos de comparación directa con otros modelos abliterados de tamaño similar, por lo que la comparativa se limita al base y a un modelo alternativo de la misma familia.

## Limitaciones y advertencias

- La abliteración no elimina el rechazo por completo: el modelo aún rechaza 12 de cada 100 prompts dañinos, por lo que no es un modelo "sin censura" absoluto.
- Riesgo de uso malintencionado: al reducir las barreras de contenido, el modelo puede generar respuestas dañinas o ilegales; no es adecuado para entornos de producción sin un sistema de moderación.
- Evaluación incompleta: no hay benchmarks de código, matemáticas, visión o multilingüismo; los resultados de ARC-Challenge son bajos (57,7) y pueden indicar sensibilidad al formato de prompts de razonamiento.
- Soporte idiomático limitado: solo inglés y chino; el rendimiento en otros idiomas no está verificado.
- El proceso de abliteración modifica solo 128 módulos, pero la divergencia KL de 0.1191 indica que existe una desviación respecto al base; para aplicaciones que requieren fidelidad estricta al modelo original, esta desviación puede ser relevante.
- No hay datos de seguridad adicionales: no se han realizado evaluaciones de sesgos, toxicidad o robustez adversarial en este modelo.

## Enlaces

- Repositorio HuggingFace: [jaromer/JonathanColetti-Qwen3.8-27B-Uncensored](https://huggingface.co/jaromer/JonathanColetti-Qwen3.8-27B-Uncensored)
- Model card original: [JonathanColetti/Qwen3.8-27B-Uncensored](https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored)
- Versión GGUF: [JonathanColetti/Qwen3.8-27B-Uncensored-GGUF](https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF/tree/main)
- Demo Space: [JonathanColetti/Qwen3.8-27B-Uncensored-Demo](https://huggingface.co/spaces/JonathanColetti/Qwen3.8-27B-Uncensored-Demo)
- Build en Ollama: [orcarouter/Qwen3.8-27B-Uncensored](https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored)
- Repositorio del método Heretic: [https://github.com/p-e-w/heretic](https://github.com/p-e-w/heretic)
- Dataset de prompts dañinos: [mlabonne/harmful_behaviors](https://huggingface.co/datasets/mlabonne/harmful_behaviors)
