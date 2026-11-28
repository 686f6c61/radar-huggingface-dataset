# reaperdoesntknow/Qemma-redux

## Resumen

Qemma-redux es un modelo de lenguaje de aproximadamente 1.000 millones de parámetros construido mediante la fusión a nivel de pesos de dos arquitecturas distintas: el cuerpo (MLP) de Gemma-3 (1B) y el mecanismo de atención de Qwen-3 (0.6B). Lo desarrolla el usuario independiente reaperdoesntknow bajo el sello Convergent Intelligence LLC: Research Division, y se distribuye como un fine-tuning supervisado (SFT) orientado a instrucciones y razonamiento paso a paso. El modelo parte de un checkpoint previo (Qemma-sft) y añade en esta variante "Redux" una segunda fusión con Qwen3-0.6B y escalado de contexto mediante YaRN.

El interés técnico del modelo reside en su planteamiento híbrido: no se trata de un transformer convencional derivado de un único linaje, sino de un ensamblaje manual en el que las cabezas de atención de Qwen se proyectan y alinean al tamaño oculto de Gemma (1152), reagrupadas en 4 cabezas de 256 dimensiones. Conserva el tokenizador y la plantilla de chat de Gemma-3, lo que facilita su integración con el ecosistema de transformers.

Es un modelo de nicho, con 2.088 descargas y sin métricas de benchmarks publicadas, pensado para investigación, seguimiento de instrucciones y como base para posteriores ciclos de SFT o RLHF. Su relevancia es más metodológica (exploración de fusiones entre arquitecturas) que de rendimiento absoluto frente a modelos de su tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: cuerpo/MLP de Gemma-3 (1B) + atención estilo Qwen-3 (0.6B) |
| Parámetros totales | no disponible (repo de 12,0 GB en bfloat16, coherente con ~1B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; usa YaRN con ratio 1:1 sobre `max_position_embeddings` |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | OSL-3.0 (Open Software License 3.0) |
| Formato de pesos | safetensors (formato nativo de transformers) |

## Arquitectura y entrenamiento

El modelo combina un backbone Gemma-3 de 26 capas, dimensión oculta 1152 y MLP de 6912, con un mecanismo de atención de Qwen-3 reagrupado a la configuración de 4 cabezas × 256 dimensiones de Gemma. La fusión se realiza a nivel de pesos, sin adaptadores, proyectando y alineando las matrices de atención al espacio oculto de Gemma. Esta variante Redux incorpora además un segundo merge con Qwen3-0.6B y aplica YaRN (Yet another RoPE extensioN) con ratio 1:1 respecto a `max_position_embeddings` para extender el contexto efectivo.

El entrenamiento es un SFT por etapas: unos 512 pasos de warm-start con datos estilo Alpaca (`yahma/alpaca-cleaned`), 256 pasos adicionales de preentrenamiento sobre `O1-OPEN/OpenO1-SFT`, 128 pasos de SFT con `Jackrong/gpt-oss-120b-reasoning-STEM-5K` (orientado a razonamiento STEM) y 256 pasos finales de SFT de nuevo con OpenO1-SFT. Se usó TRL 0.25.0, Transformers 4.57.1, PyTorch 2.8.0 y Datasets 4.4.1. No se documentan fases de RLHF ni DPO, ni el volumen total de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat de Gemma-3.
- Seguimiento de instrucciones (instruction following) tras el ciclo de SFT.
- Razonamiento paso a paso, reforzado por el dataset STEM de razonamiento.
- Resolución de problemas de matemáticas y análisis (el ejemplo de la model card es un problema de valores absolutos).
- Asistencia en código y tareas de ayuda general, según la sección de uso previsto.
- Capacidad de servir como base para SFT/RLHF adicional.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no documentado explícitamente; el entrenamiento sugiere razonamiento paso a paso pero sin infraestructura de agentes.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (visión, audio, thinking mode nativo): no disponibles.

## Casos de uso

- Investigación sobre fusiones de arquitecturas: sirve como banco de pruebas para estudiar cómo se comporta una atención de Qwen sobre un cuerpo de Gemma, útil para quienes investigan merges a nivel de pesos y alineación de dimensiones ocultas.
- Generación de explicaciones matemáticas paso a paso: el SFT con datos STEM permite usarlo para desglosar problemas de álgebra o cálculo en pasos intermedios, como ilustra el ejemplo de la model card.
- Asistente conversacional ligero en inglés: con ~1B parámetros puede desplegarse en entornos con recursos limitados para tareas de chat y respuesta a preguntas de dominio general.
- Base para fine-tuning específico de dominio: al ser un checkpoint SFT abierto, es punto de partida para adaptar a un corpus propio (legal, técnico, atención al cliente) con un coste de cómputo bajo.
- Prototipado rápido de pipelines de razonamiento: integrable vía transformers para validar formatos de prompt y cadenas de razonamiento antes de escalar a modelos mayores.
- Educación y experimentación docente: modelo pequeño y de licencia abierta para demostrar conceptos de atención, tokenización de Gemma y escalado de contexto con YaRN en cursos o laboratorios.
- Evaluación comparativa de metodologías DISC: útil para reproducir o contrastar el marco teórico Discrepancy Calculus propuesto por el autor en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 2-2,5 GB para ~1B parámetros, más overhead de activaciones y caché KV.
- En cuantización de 8 bits: aproximadamente 1-1,5 GB; en 4 bits: alrededor de 0,7-1 GB (estimaciones según tamaño, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es más que suficiente; también cabe en GPUs de 4-8 GB.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas actuales e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (soporte nativo, según la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). Para llama.cpp/Ollama no hay GGUF publicado en el repo, por lo que requeriría conversión propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qemma-redux | ~1B (híbrido Gemma-3 + Qwen-3) | no disponible (YaRN 1:1) | OSL-3.0 | Hugging Face, transformers | Fusión a nivel de pesos, solo inglés, sin benchmarks |
| Gemma-3 1B (Google) | ~1B | 32K (según familia Gemma-3) | Gemma Terms of Use | Hugging Face, amplio ecosistema | Modelo original del backbone; multilingüe y con benchmarks publicados |
| Qwen3-0.6B (Alibaba) | 0,6B | 32K nativo, extensible | Apache 2.0 | Hugging Face, Ollama, vLLM | Modelo original de la atención; licencia permisiva y buen soporte de tooling |
| Llama 3.2 1B (Meta) | 1,2B | 128K | Llama 3.2 Community License | Hugging Face, amplio ecosistema | Alternativa estándar de ~1B con contexto largo y benchmarks públicos |

## Limitaciones y advertencias

- Riesgo de alucinación reconocido explícitamente por el autor; no apto para decisiones críticas de seguridad, médicas, legales o financieras.
- Idiomas: solo inglés documentado; el rendimiento en castellano no está garantizado ni evaluado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a Gemma-3 1B, Qwen3-0.6B o Llama 3.2 1B.
- La fusión entre arquitecturas distintas puede introducir comportamientos erráticos no caracterizados (atención de un modelo sobre cuerpo de otro).
- Licencia OSL-3.0: permite uso comercial pero impone obligaciones de copyleft sobre distribuciones del software derivado; conviene revisar compatibilidad antes de integrarlo en productos propietarios.
- Entrenamiento corto (apenas ~1.150 pasos totales repartidos en cuatro fases): el ajuste fino es limitado y puede no alinear bien instrucciones complejas.
- El marco teórico DISC y los DOIs citados son material del propio autor; no son validación independiente del rendimiento del modelo.
- El repositorio (12 GB) incluye presumiblemente checkpoints de entrenamiento además de los pesos finales; verificar qué ficheros se descargan antes de desplegar.
- Sin GGUF oficial: el despliegue en llama.cpp/Ollama requiere conversión manual y validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qemma-redux
- Modelo base (Qemma-sft): https://huggingface.co/reaperdoesntknow/Qemma-sft
- Perfil del autor / Convergent Intelligence LLC: https://huggingface.co/reaperdoesntknow
- Paper del marco DISC (Discrepancy Calculus): https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Artículo previo "Structure Over Scale": https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Artículo "Three Teachers to Dual Cognition": https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy (DOI: 10.57967/hf/8184)
- Repositorio TRL: https://github.com/huggingface/trl
- Dataset OpenO1-SFT: https://huggingface.co/datasets/O1-OPEN/OpenO1-SFT
- Dataset Alpaca cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset STEM reasoning 5K: https://huggingface.co/datasets/Jackrong/gpt-oss-120b-reasoning-STEM-5K
