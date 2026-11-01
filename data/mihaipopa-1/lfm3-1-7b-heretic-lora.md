# MihaiPopa-1/LFM3-1.7B-Heretic-LoRA

## Resumen

LFM3-1.7B-Heretic-LoRA es una variante "decensored" (abliterated) del modelo LFM3-1.7B de Liquid AI, publicada por el usuario MihaiPopa-1. Se trata de un LoRA aplicado sobre el checkpoint base LiquidAI/LFM3-1.7B-Base mediante la herramienta Heretic v1.4.0, cuyo objetivo es eliminar los mecanismos de rechazo (refusals) del modelo original sin reentrenar desde cero. El modelo conserva la arquitectura y capacidades del original, pero modifica las proyecciones de atención y MLP para suprimir la dirección de activación asociada a las respuestas de negativa.

El modelo subyacente, LFM3-1.7B, es un modelo de lenguaje de 1,73 mil millones de parámetros con una arquitectura tri-híbrida de 24 capas que combina 13 convoluciones cortas con compuertas (gated short convolutions), 5 capas de atención de ventana deslizante y 6 capas de atención global. Está disenado para despliegue en el borde (edge), con un contexto de 256K tokens y un vocabulario de 128.000 tokens, y ha sido post-entrenado para tareas agénticas y tool calling.

La relevancia de esta ficha radica en que documenta una práctica creciente en la comunidad open source: la modificación de modelos para eliminar restricciones de seguridad mediante técnicas de abliteration. El autor reporta una reducción de rechazos de 93/100 en el original a 7/100 en esta variante, con una divergencia KL de 0,0034 respecto al modelo base. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo figura como 0.0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que la información está incompleta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-híbrido: 24 capas (13 gated short convolutions, 5 sliding-window attention, 6 global attention) |
| Parametros totales | 1,73B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (entrada + salida) |
| Tipos de cuantizacion | No disponible (la model card menciona 4-bit ~1 GB de memoria, pero no lista formatos concretos) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0) |
| Formato de pesos | Safetensors (según tags de HuggingFace); LoRA sobre base LiquidAI/LFM3-1.7B-Base |

## Arquitectura y entrenamiento

La arquitectura del modelo base LFM3-1.7B es un transformer tri-híbrido de 24 capas que combina tres tipos de bloques: 13 capas de convolución corta con compuertas (gated short convolutions), 5 capas de atención de ventana deslizante y 6 capas de atención global. Esta mezcla busca reducir el coste computacional de la atención completa mientras mantiene la capacidad de modelar dependencias de largo alcance, lo que permite un contexto de 256K tokens con una huella de memoria reducida. El vocabulario es de 128.000 tokens y el modelo está post-entrenado para tareas agénticas, tool calling y salidas estructuradas.

El proceso de modificación de esta variante concreta se realizó con Heretic v1.4.0, una herramienta de abliteration que identifica y suprime la dirección de activación asociada a los rechazos. Los parámetros reportados incluyen un direction_index de 10,09, pesos máximos y mínimos para attn.o_proj (1,48 y 1,23) y mlp.down_proj (1,30 y 1,03), con posiciones y distancias específicas. El autor no detalla el dataset de calibración ni el número de tokens utilizados en el proceso de abliteration, ni si hubo entrenamiento adicional más allá de la modificación de pesos. No se dispone de información sobre la composición del dataset de post-entrenamiento del modelo base (RLHF, DPO u otras técnicas).

## Capacidades

- Generación de texto conversacional y completado de texto en 16 idiomas, incluyendo español, inglés, alemán, francés, chino, árabe y japonés.
- Razonamiento multi-paso y cadenas de pensamiento, según las capacidades declaradas del modelo base.
- Tool calling y function calling, con post-entrenamiento específico para harnesses agénticos como Hermes Agent, Pi y OpenClaw.
- Salidas estructuradas (structured outputs), adecuadas para integración en pipelines que requieren JSON u otros formatos parseables.
- Soporte de contexto largo de hasta 256K tokens, útil para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidad de fine-tuning en una sola GPU para especialización en dominios, formatos y herramientas concretas.
- Supresión de rechazos: el modelo modificado reduce las negativas de 93/100 a 7/100 según la model card, lo que permite respuestas a solicitudes que el original rechazaría.
- No se declaran capacidades de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 256K tokens, lo que permite mantener el historial completo de una sesión sin truncamiento y responder en el idioma del usuario entre los 16 soportados.
- Generación de código en producción: su soporte de tool calling y salidas estructuradas permite integrarlo en pipelines de CI/CD para generar parches, documentación técnica o tests unitarios, con la ventaja de que el modelo cabe en 1 GB a 4 bits.
- Agentes locales en dispositivos de borde: al ocupar aproximadamente 1 GB en cuantización de 4 bits, puede desplegarse en portátiles y teléfonos para asistentes personales que operan sin conexión y ejecutan herramientas locales.
- Procesamiento de documentos largos: con 256K tokens de contexto, es adecuado para resumir, extraer información o responder preguntas sobre contratos, informes o bases de código extensas en una sola pasada.
- Investigación sobre alineación y seguridad: esta variante permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, comparando respuestas con el original para analizar sesgos, toxicidad y efectos de la abliteration.
- Fine-tuning especializado en una sola GPU: el autor indica que el modelo está pensado para adaptarse rápidamente a dominios concretos, lo que facilita crear asistentes verticales (legal, médico, técnico) con recursos limitados.
- Generación de contenido multilingüe: la cobertura de 16 idiomas permite crear contenido marketing, traducciones o respuestas localizadas sin depender de APIs externas.

## Benchmarks y rendimiento

La model card solo reporta métricas del proceso de abliteration, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este modelo | Modelo original (LiquidAI/LFM3-1.7B) |
|---|---|---|
| Divergencia KL | 0,0034 | 0 (por definición) |
| Rechazos | 7/100 | 93/100 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en cuantización de 4 bits según la model card; en FP16 se estima alrededor de 3,5 GB (1,73B parámetros × 2 bytes), aunque este dato no se confirma en la información proporcionada.
- GPU recomendadas: no disponible de forma explícita; por tamano, cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 y superiores en cuantizaciones de 4-8 bits.
- Cabe en consumer GPU: sí, en la mayoría de GPUs modernas con al menos 4-6 GB de VRAM según la cuantización.
- Cabe en dispositivos de borde: sí, el modelo base está disenado para teléfonos y portátiles según Liquid AI.
- Opciones de despliegue: la librería indicada es transformers; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible, aunque el formato safetensors y el tag endpoints_compatible sugieren compatibilidad con endpoints de HuggingFace.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B-Heretic-LoRA (este) | 1,73B | 256K | LFM Open License v1.0 | Variante abliterated, 7/100 rechazos |
| LiquidAI/LFM3-1.7B (original) | 1,73B | 256K | LFM Open License v1.0 | 93/100 rechazos, modelo de referencia |
| LiquidAI/LFM3-1.7B-Base | 1,73B | 256K | LFM Open License v1.0 | Checkpoint base sin post-entrenamiento conversacional |

No se dispone de información sobre otros modelos comparables de la misma categoría (por ejemplo, Qwen3-1.7B, SmolLM2-1.7B o Gemma-3-1B) en la documentación proporcionada, por lo que no se incluyen datos de rendimiento comparativo.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que implica que el modelo puede generar contenido que el original bloquearía, incluyendo material potencialmente danino, sesgado o NSFW. No es adecuado para aplicaciones orientadas al público sin filtros adicionales.
- Riesgo de alucinación inherente a un modelo de 1,73B parámetros; la supresión de rechazos no mejora la veracidad factual.
- La divergencia KL de 0,0034 indica cambios en la distribución de salida respecto al original, lo que puede afectar a la calidad en tareas que dependían de las respuestas de negativa como mecanismo de seguridad.
- La licencia LFM Open License v1.0 puede imponer restricciones al uso comercial; es necesario revisar el texto completo de la licencia antes de desplegar en producción.
- El repositorio muestra 0 descargas, 0 likes y un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar disponibles o que el repositorio está incompleto; conviene verificar la integridad antes de usarlo.
- No se dispone de información sobre sesgos específicos medidos, composición del dataset de entrenamiento ni evaluaciones de seguridad del modelo modificado.
- El contexto de 256K tokens es teórico; el rendimiento real en ventanas muy largas puede degradarse y no se han publicado evaluaciones al respecto.
- La información sobre cuantizaciones disponibles es incompleta; solo se menciona 4-bit de forma genérica.

## Enlaces

- HuggingFace: https://huggingface.co/MihaiPopa-1/LFM3-1.7B-Heretic-LoRA
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Modelo original post-entrenado: https://huggingface.co/LiquidAI/LFM3-1.7B
- Heretic: https://heretic-project.org
- Blog de Liquid AI sobre LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
- Colección LFM3: https://huggingface.co/collections/LiquidAI/lfm3
