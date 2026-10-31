# MihaiPopa-1/LFM3-1.7B-Heretic-Max-LoRA

## Resumen

LFM3-1.7B-Heretic-Max-LoRA es una versión "decensurada" (abliterada) del modelo LFM3-1.7B de Liquid AI, publicada por el usuario MihaiPopa-1 en Hugging Face. El modelo original es un modelo de texto de 1,73 mil millones de parámetros diseñado para agentes locales y aplicaciones especializadas, basado en la arquitectura tri-híbrida de Liquid AI. Esta derivada aplica la herramienta Heretic v1.4.0 para reducir drásticamente las tasas de negativa del modelo original: de 93/100 a 6/100 según las mediciones del autor, con una divergencia KL muy baja (0,0040) respecto al modelo base, lo que indica que el comportamiento general del modelo se mantiene casi intacto.

El modelo original LFM3-1.7B destaca por su ventana de contexto de 256K tokens, su entrenamiento orientado a agentes (compatible con harnesses como Hermes Agent, Pi y OpenClaw) y su huella reducida: a precisión de 4 bits ocupa aproximadamente 1 GB de memoria, lo que lo hace apto para teléfonos y portátiles. La versión Heretic conserva estas características y añade la eliminación de los mecanismos de rechazo, lo que la hace relevante para usuarios que necesitan un modelo sin filtros de seguridad para investigación, red-teaming o casos de uso legítimos que activan falsos positivos de censura. El nombre "LoRA" en el identificador sugiere que la modificación se aplica mediante adaptadores de bajo rango, aunque el repositorio reporta un tamaño de 0,0 GB, lo que impide confirmar si incluye los pesos completos o solo el parche.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-híbrida: 24 capas (13 convoluciones cortas con gating, 5 de atención deslizante, 6 de atención global) |
| Parametros totales | 1,73B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens (entrada + salida) |
| Tipos de cuantizacion | no disponible (el modelo original cabe en ~1 GB a 4 bits) |
| Idiomas soportados | inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso, polaco |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (tamaño del repo reportado: 0,0 GB) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea una arquitectura tri-híbrida de 24 capas que combina tres tipos de bloques: 13 capas de convoluciones cortas con gating (estilo las familias LFM anteriores de Liquid AI), 5 capas de atención con ventana deslizante y 6 capas de atención global. Este diseño híbrido reduce el coste computacional de la atención en contextos largos, permitiendo la ventana de 256K tokens en un modelo tan pequeño. El vocabulario es de 128.000 tokens. El modelo original está post-entrenado para uso agéntico, compatible con harnesses como Hermes Agent, Pi y OpenClaw, con soporte de tool calling y salidas estructuradas. No se dispone de datos sobre el número de tokens de entrenamiento ni la composición del dataset.

La versión Heretic-Max modifica el modelo original mediante abliteración: una técnica que identifica la "dirección de rechazo" en el espacio de activaciones y ajusta los pesos de los proyectos de salida de atención (o_proj) y de bajada del MLP (down_proj) para suprimirla. Según la model card, los parámetros de abliteración incluyen un direction_index de 11,53, con pesos máximos de 1,49 en attn.o_proj y 1,23 en mlp.down_proj. El resultado reporta una divergencia KL de 0,0040 respecto al original, lo que sugiere una preservación muy alta de la distribución de salida del modelo, y una reducción de negativas de 93/100 a 6/100.

## Capacidades

- Generación de texto conversacional en 16 idiomas, incluido el español.
- Contexto largo: 256K tokens de entrada y salida combinados, adecuado para documentos extensos y conversaciones multi-turno.
- Orientación agéntica: el modelo base está post-entrenado para funcionar en harnesses de agentes como Hermes Agent, Pi y OpenClaw.
- Tool calling y salidas estructuradas (heredado del modelo original, diseñado explícitamente para ello).
- Especialización mediante fine-tuning: el modelo original está pensado para adaptarse a dominios concretos con ajuste fino en una sola GPU.
- Comportamiento sin negativas: la abliteración elimina casi por completo los rechazos (6/100), útil para investigación y análisis de seguridad.
- No incluye capacidades de visión, audio ni modo de razonamiento explícito (es un modelo de texto puro).

## Casos de uso

- Agentes locales en dispositivos edge: con ~1 GB de memoria a 4 bits, el modelo puede ejecutarse en teléfonos y portátiles para asistentes offline que consultan herramientas y mantienen conversaciones largas.
- Investigación en seguridad y alineación: la versión decensurada con divergencia KL de 0,0040 es útil para estudiar cómo se comportan los modelos sin capas de rechazo y para red-teaming de sistemas de seguridad.
- Procesamiento de documentos largos: la ventana de 256K tokens permite resumir, analizar o responder preguntas sobre documentos completos (contratos, informes técnicos, bases de código) en una sola pasada.
- Automatización con tool calling: integrado en pipelines agénticos, puede invocar funciones y producir salidas estructuradas (JSON, XML) para flujos de automatización locales.
- Chatbots multilingües en edge: soporte de 16 idiomas con un modelo de 1,7B parámetros permite asistentes conversacionales en dispositivos con recursos limitados.
- Fine-tuning de dominio: su diseño "made to be specialized" permite adaptar el modelo a formatos y herramientas específicas de un negocio con ajuste fino en una sola GPU, manteniendo el comportamiento sin negativas si se parte de esta variante.
- Evaluación de falsos positivos de censura: útil en escenarios donde las negativas del modelo original (93/100) bloquean consultas legítimas, como escritura creativa con contenido sensible o análisis de texto médico o legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica de rendimiento publicada es la del propio proceso de abliteración:

| Métrica | Este modelo | Modelo original (LFM3-1.7B) |
|---|---|---|
| Divergencia KL | 0,0040 | 0 (por definición) |
| Negativas (refusals) | 6/100 | 93/100 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB a 4 bits según Liquid AI; a 16 bits, en torno a 3,5-4 GB (estimación basada en el tamaño de 1,73B parámetros; no confirmado en la documentación).
- GPU recomendadas: cualquier GPU moderna; por su tamaño, no se requiere hardware de gama alta. Una RTX 3060 de 12 GB o incluso GPUs integradas son suficientes para inferencia en FP16.
- Consumer GPUs: cabe sobradamente en prácticamente cualquier GPU consumer actual (RTX 3060, 4060, 4090) e incluso en portátiles y teléfonos a 4 bits.
- Opciones de despliegue: librería transformers (con custom_code); el formato de la familia LFM3 es compatible con los runtimes habituales de edge, aunque la model card no detalla soporte explícito de llama.cpp, Ollama, vLLM o TGI para esta variante concreta.
- Latencia y throughput: no disponibles en la información proporcionada; por su tamaño de 1,7B parámetros y arquitectura híbrida con convoluciones, cabe esperar inferencia rápida en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Caracteristica diferencial |
|---|---|---|---|---|
| LFM3-1.7B-Heretic-Max-LoRA | 1,73B | 256K | LFM Open License v1.0 | Versión abliterada (6/100 negativas) del LFM3-1.7B |
| LiquidAI/LFM3-1.7B | 1,73B | 256K | LFM Open License v1.0 | Modelo original post-entrenado, con mecanismos de seguridad intactos |
| Qwen3-1.7B | 1,7B | 32K-128K (no disponible con certeza para esta variante) | Apache 2.0 | Modelo denso convencional con modo de razonamiento, sin abliterar |
| LFM2-1.2B (Liquid AI) | 1,2B | 32K | LFM Open License v1.0 | Generación anterior de la familia, tri-híbrida, contexto menor |

La comparativa se centra en el modelo original del que deriva, ya que esta ficha evalúa una modificación del mismo: la elección entre ambos depende exclusivamente de si se necesita o no el comportamiento sin negativas.

## Limitaciones y advertencias

- Riesgo elevado de generación de contenido nocivo: al tratarse de un modelo deliberadamente decensurado, puede producir contenido ofensivo, peligroso o ilegal sin restricciones. Su uso debe limitarse a investigación, red-teaming y contextos legítimos, asumiendo la responsabilidad legal y ética correspondiente.
- La abliteración puede degradar sutilmente el razonamiento de seguridad y aumentar la tasa de alucinación en temas sensibles; la divergencia KL de 0,0040 sugiere un impacto mínimo, pero no se han publicado evaluaciones de calidad tras la modificación.
- El tamaño del repositorio reportado es 0,0 GB, lo que sugiere que puede tratarse de un LoRA o de un repo incompleto; conviene verificar que los pesos descargados son funcionales antes de usar en producción.
- La licencia LFM Open License v1.0 es una licencia personalizada ("other"): conviene revisar sus términos antes de cualquier uso comercial, ya que puede incluir restricciones distintas a licencias permisivas como Apache 2.0 o MIT.
- No hay benchmarks estándar publicados ni para el modelo original ni para esta variante, por lo que su calidad relativa frente a otros modelos de 1-2B no puede verificarse con datos públicos.
- El uso de custom_code en transformers implica ejecutar código del repositorio, lo que requiere confianza en el autor y revisión del código antes de su ejecución.
- Como modelo derivado de terceros con 0 descargas registradas, carece de auditoría comunitaria: no hay verificación independiente de las métricas de abliteración publicadas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MihaiPopa-1/LFM3-1.7B-Heretic-Max-LoRA
- Modelo original: https://huggingface.co/LiquidAI/LFM3-1.7B
- Colección LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Blog de lanzamiento de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Heretic (herramienta de abliteración): https://heretic-project.org
- Licencia LFM Open License v1.0: https://huggingface.co/MihaiPopa-1/LFM3-1.7B-Heretic-Max-LoRA/blob/main/LICENSE
