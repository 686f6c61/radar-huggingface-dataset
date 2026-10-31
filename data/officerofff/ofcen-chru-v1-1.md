# Officerofff/Ofcen-CHRU-v1.1

## Resumen

Ofcen-CHRU v1.1 es un asistente conversacional compacto de 0,6B parámetros especializado en ruso, desarrollado por la persona independiente Officerofff (equipo Ofcen). Se trata de un ajuste fino mediante LoRA de Qwen3-0.6B sobre unos 46.000 diálogos en ruso, más un conjunto adicional de diálogos sobre la identidad del propio modelo. Su propósito es ofrecer un chatbot ligero en ruso que funcione en hardware modesto, incluso en CPU, sin depender de modelos grandes.

El modelo es relevante como ejemplo de especialización lingüística de bajo coste: partiendo de una base multilingüe pequeña, un LoRA (r=32, alpha=64) sobre todos los capas lineales mejora de forma medible la calidad conversacional en ruso frente al modelo base, según su benchmark propio Ofcen-Bench-RU (54,5% frente a 45,5% en comparación por pares a ciegas). Usa la arquitectura transformer decoder de Qwen3, con safetensors como formato de pesos y licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3) |
| Parámetros totales | 596.049.920 (~0,6B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con secuencias de hasta 2048 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder compacto de la familia Qwen3. El ajuste fino se realizó con LoRA (r=32, alpha=64) aplicado a todas las capas lineales, durante 1 época con tasa de aprendizaje 2e-4 con decaimiento cosine, tamaño de lote efectivo de 16 diálogos por paso y secuencias de hasta 2048 tokens. La función de pérdida se calculó únicamente sobre las respuestas del asistente, no sobre los mensajes del usuario. Tras el entrenamiento principal se añadió una etapa corta de "personalidad" con lr 1e-4, para que el modelo sepa describirse a sí mismo.

Los datos de entrenamiento combinan tres fuentes: el dataset IlyaGusev/saiga_scored (diálogos rusos con puntuación ≥ 8/10, sin licencia declarada en su ficha), 20.000 diálogos rusos de Vikhrmodels/GrandMaster-PRO-MAX (Apache 2.0) y diálogos propios sobre la identidad del modelo. No se menciona el uso de RLHF ni DPO. Un detalle importante: el modo de razonamiento (thinking) de Qwen3 no se usó durante el ajuste fino, por lo que debe desactivarse explícitamente con `enable_thinking=False` al inferir.

## Capacidades

- Generación de texto conversacional en ruso, multi-turno, con tono amable y directo gracias al system prompt con el que fue entrenada.
- Explicaciones y respuestas factuales en ruso: es la categoría donde más mejora respecto al modelo base (72% y 64% en Ofcen-Bench-RU).
- Generación de código básico en ruso (60% frente a 40% del modelo base en la comparación por pares).
- Redacción de textos y consejos (rendimiento similar al modelo base).
- Conocimiento de su propia identidad como modelo Ofcen-CHRU gracias al dataset de personalidad.
- No soporta tool calling, agentes, visión ni audio; no tiene acceso a internet ni conocimiento de la fecha actual.
- El modo thinking de Qwen3 está disponible en la arquitectura base pero no fue entrenado, por lo que debe desactivarse.

## Casos de uso

- Chatbots en ruso de bajo coste: al ser de 0,6B parámetros, puede desplegarse en CPU o GPUs modestas, ideal para prototipos o servicios con presupuesto mínimo de cómputo.
- Asistente de preguntas y respuestas generales en ruso: mejora respecto a la base en explicaciones y hechos, adecuado para responder dudas cotidianas con supervisión.
- Integración en aplicaciones móviles o edge: su tamaño (1,2 GB en el repositorio) permite ejecución local sin servidor dedicado.
- Personajes conversacionales con identidad definida: el entrenamiento de personalidad lo hace apto para asistentes con nombre y carácter propio.
- Generación de código sencillo asistida en ruso: puede ayudar con snippets básicos, aunque no sustituye a modelos especializados en código.
- Base para nuevos ajustes finos en ruso: al ser Apache 2.0 y estar basado en Qwen3, sirve como punto de partida para especializaciones adicionales (dominios, tono, dialectos).

## Benchmarks y rendimiento

Datos publicados por el autor, medidos con Ofcen-Bench-RU (200 preguntas rusas en 8 categorías, comparación por pares a ciegas, generación greedy hasta 768 tokens, sin modo thinking):

| Categoría | Ofcen-CHRU v1.1 | Qwen3-0.6B |
|---|---|---|
| Total | 54,5% | 45,5% |
| Explicaciones (explain) | 72% | 28% |
| Hechos (facts) | 64% | 36% |
| Código (code) | 60% | 40% |
| Conversación (chat) | 56% | 44% |
| Redacción (writing) | 52% | 48% |
| Consejos (advice) | 50% | 50% |
| Instrucciones (instructions) | 50% | 50% |
| Lógica y razonamiento (reasoning) | 32% | 68% |

Resultado global: 98 victorias, 22 empates y 80 derrotas sobre 200 preguntas. No hay resultados de benchmarks estándar (MMLU, GSM8K, HumanEval) ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: ~1,2 GB de pesos más overhead, por lo que cabe con holgura en GPUs de 4 GB o incluso 2 GB.
- Ejecutable en CPU: el autor indica explícitamente que funciona en tarjetas gráficas convencionales y en procesador, dada su escala de 0,6B.
- Consumer GPUs compatibles: cualquier GPU moderna (RTX 3060, RTX 4060 o superiores) lo ejecuta sin problema; no se necesitan A100 ni H100.
- Opciones de despliegue: transformers (código de ejemplo en la model card con `AutoModelForCausalLM`), compatible con text-generation-inference y endpoints de Hugging Face según sus tags. No se mencionan GGUF, llama.cpp, Ollama ni vLLM en la información disponible.
- Latencia y throughput: no disponibles; por su tamaño se espera latencia baja incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| Ofcen-CHRU v1.1 | 0,6B | no disponible (entrenado a 2048 tokens) | Chat en ruso | Apache 2.0 |
| Qwen3-0.6B (base instruct) | 0,6B | 32.768 tokens | Multilingüe, con modo thinking | Apache 2.0 |
| Saiga (variantes sobre Qwen/Llama pequeñas) | según base | según base | Chat en ruso | según base |

Ofcen-CHRU v1.1 gana a su modelo base en chat en ruso según Ofcen-Bench-RU, pero pierde claramente en razonamiento (32% frente a 68%) y hereda una ventana de contexto efectiva más corta por su entrenamiento a 2048 tokens. Frente a otros proyectos de rusificación de modelos pequeños como la familia Saiga, comparte enfoque (LoRA sobre bases abiertas con datasets rusos) aunque no hay comparaciones directas publicadas.

## Limitaciones y advertencias

- Errores factuales frecuentes: fechas, nombres, autores y capitales; el propio autor recomienda verificar cualquier dato importante.
- Razonamiento y aritmética débiles: rinde peor que la Qwen3-0.6B original en tareas de lógica y cálculo, probable efecto del ajuste fino sobre datos conversacionales.
- Problemas de generación: ocasionalmente entra en bucles repitiendo frases y a veces inserta caracteres chinos o palabras en inglés.
- Comprensión imperfecta de idioms y de mensajes groseros o sin sentido.
- Sin acceso a internet ni conocimiento de la fecha actual; no apto para información en tiempo real sin RAG.
- El modo thinking de Qwen3 no fue entrenado y debe desactivarse (`enable_thinking=False`) para un comportamiento correcto.
- Uno de los datasets de entrenamiento (saiga_scored) no declara licencia en su ficha, lo que introduce cierta incertidumbre sobre la procedencia de esos datos pese a que el modelo resultante se distribuye como Apache 2.0.
- Benchmark propio (Ofcen-Bench-RU) diseñado por el autor: útil para comparar con la base, pero no validado externamente ni comparable con benchmarks estándar.
- Uso comercial permitido (Apache 2.0), aunque la calidad del modelo limita su idoneidad para producción sin supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Officerofff/Ofcen-CHRU-v1.1
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset IlyaGusev/saiga_scored: https://huggingface.co/datasets/IlyaGusev/saiga_scored
- Dataset Vikhrmodels/GrandMaster-PRO-MAX: https://huggingface.co/datasets/Vikhrmodels/GrandMaster-PRO-MAX
