# legatos/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una variante del modelo Qwen3.8-27B de Alibaba, publicada por el usuario legatos en Hugging Face (con el repositorio espejo OBLITERATUS/Qwen3.8-27B-OBLITERATED). Se trata de un modelo de texto generativo de 27 781 427 952 parámetros, derivado de la base Qwen/Qwen3.8-27B mediante técnicas de "abliteration" (ablación de direcciones de rechazo en el espacio de pesos), con el objetivo de eliminar comportamientos de negativa y respuestas de seguridad evasivas. El modelo se orienta a la investigación de seguridad de IA y red-teaming, no a usos productivos convencionales.

La versión V3 presentada en la model card aplica refinamiento iterativo sobre versiones anteriores (V1 y V2), combinando dos metodologías de ablación —SVD y LEACE— mediante un blending complementario. Los resultados reportados muestran una pérdida de 2,12 puntos porcentuales en MMLU respecto al modelo original (82,33% frente a 84,46%), a cambio de una tasa de rechazo del 0% en un corpus de 842 prompts dañinos, según la documentación del autor. El modelo es relevante ahora porque aborda una tensión central en el desarrollo de IA: cómo eliminar el comportamiento de rechazo sin degradar la capacidad general, algo que la técnica de abliteration complementaria intenta resolver de forma novedosa.

La arquitectura es un transformer denso basado en Qwen3, sin especificación pública de la longitud de contexto en la información proporcionada (aunque el modelo base Qwen3.8-27B soporta típicamente ventanas largas, este dato no está confirmado para esta variante). El repositorio incluye pesos en formato safetensors, GGUF y MLX, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B, no se especifica variante) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF, MLX, FP8, safetensors (BF16) |
| Idiomas soportados | No disponibles (no listados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Qwen/Qwen3.8-27B y aplica una técnica de ablación de direcciones de rechazo ("abliteration") en lugar de un entrenamiento supervisado convencional. La model card describe tres versiones del proceso:

- **V1**: una pasada agresiva de SVD con 5 direcciones de rechazo, que eliminó las negativas duras pero redujo MMLU en 6 puntos porcentuales.
- **V2**: un enfoque de "blending complementario" que combina dos cirugías independientes — SVD (que captura el rechazo de forma agresiva pero daña capacidades) y LEACE (que minimiza información mutua preservando capacidades pero con eliminación más débil) — mezclando sus pesos en proporción 60/40. Esto redujo la pérdida de MMLU a 0,28 puntos.
- **V3**: refinamiento iterativo sobre V2, con una cirugía dirigida usando un corpus enfocado en categorías específicas de "desviaciones" (sermones de seguridad), seguida de otro blending. El resultado es una pérdida de 2,12 puntos de MMLU y una tasa de rechazo del 0% en un corpus de 842 prompts dañados.

No se proporcionan detalles sobre el corpus de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF o DPO. El proceso es puramente de modificación de pesos, sin fine-tuning con datos nuevos.

## Capacidades

- Generación de texto y razonamiento: mantiene capacidades de razonamiento generales del modelo base, con una pérdida moderada en MMLU (82,33% frente al 84,46% del stock).
- Generación de código: el autor reporta 20/20 tareas de código funcionales en una evaluación de 20 prompts, incluyendo implementaciones de cibercapacidades.
- Modo de pensamiento ("thinking mode"): compatible, aunque el autor recomienda desactivarlo para respuestas más directas; la plantilla de chat incluye un prefill que omite la cadena de pensamiento.
- Eliminación de rechazos: el modelo responde a consultas que el modelo base rechazaría, sin "sermones de seguridad" (según la model card).
- Capacidades multilingües: no documentadas en la información proporcionada.
- Tool calling: no documentado en la model card ni en los resultados de búsqueda.

## Casos de uso

- **Investigación en seguridad de IA (red-teaming)**: el modelo puede utilizarse para evaluar la robustez de sistemas de moderación de contenido, generando respuestas a prompts que los modelos alineados rechazan, lo que permite estudiar las brechas de los filtros de seguridad.
- **Pruebas de jailbreak y evasión de filtros**: los investigadores pueden usar este modelo para generar texto que intente evadir restricciones de otros sistemas, ayudando a identificar vulnerabilidades en los sistemas de protección de modelos comerciales.
- **Auditoría de sesgos de alineación**: la comparación entre las respuestas del modelo original y las del abliterado permite cuantificar el impacto de la alineación en la calidad de las respuestas en dominios sensibles.
- **Investigación en técnicas de ablación de pesos**: el modelo sirve como caso de estudio para evaluar la técnica de "complementary ablition blending" (blending complementario) y su impacto en las capacidades del modelo, útil para grupos de investigación en interpretabilidad.
- **Generación de código en entornos de investigación**: la alta tasa de éxito en tareas de código (20/20) puede aprovecharse para generar implementaciones de scripts de automatización o herramientas de análisis, aunque con precaución por el contenido potencialmente sensible.
- **Evaluación de benchmarks de seguridad**: el modelo puede incluirse en suites de evaluación de seguridad de IA para medir la eficacia de técnicas de mitigación, comparando sus respuestas con las de modelos alineados.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados, evaluados con lm-evaluation-harness en modo 0-shot (n=100 por materia, 5700 preguntas):

| Modelo | MMLU (0-shot) | Stderr | vs Stock |
|---|---|---|---|
| Stock Qwen3.8-27B | 84,46% | ±0,46 | — |
| V1 (agresivo, 5 direcciones) | 81,4% | — | -6,0 pp |
| V2 (blending complementario) | 84,32% | ±0,65 | -0,28 pp |
| V3 (iterativo + dirigido) | 82,33% | ±0,48 | -2,12 pp |

Desglose por categoría (V3 vs stock):

| Categoria | V3 | Stock | Delta |
|---|---|---|---|
| Humanidades | 83,3% | 84,3% | -1,0 pp |
| Ciencias sociales | 87,4% | 89,2% | -1,8 pp |
| Otros | 82,3% | 84,1% | -1,8 pp |
| STEM | 78,5% | 81,8% | -3,3 pp |

Además, el autor reporta una tasa de rechazo del 0% en 842 prompts dañados y un éxito de 20/20 en tareas de generación de código. No hay datos de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: para inferencia en BF16, el modelo requiere aproximadamente 55-60 GB de VRAM (27 781 427 952 parámetros × 2 bytes). Con cuantización GGUF en Q4_K_M (~13-14 GB), puede ejecutarse en GPUs de consumo de 24 GB (RTX 3090/4090). Con Q8 (~27 GB) necesita una GPU de 32 GB o más.
- **GPU recomendadas**: A100 80 GB o H100 para BF16; RTX 4090 24 GB o RTX 6000 Ada 48 GB para cuantización Q4/Q8; Apple Silicon con MLX (repositorio incluye pesos MLX).
- **GPU consumer**: sí, con cuantización GGUF Q4_K_M en RTX 3090/4090 (24 GB). No cabe en GPUs de 16 GB sin cuantización agresiva (Q3).
- **Opciones de despliegue**: vLLM (con compatibilidad de endpoints), llama.cpp (con plantilla Jinja incluida en los GGUF), Ollama, LM Studio, y MLX para macOS.
- **Latencia/throughput**: no hay datos medidos en la información disponible; en vLLM con BF16 en H100, se espera un throughput de 2000-4000 tokens/s (estimación general para modelos de 27B, no medida).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (0-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (stock) | 27,78 B | No disponible | 84,46% | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-OBLITERATED (V3) | 27,78 B | No disponible | 82,33% | Apache 2.0 | Hugging Face (legatos/OBLITERATUS) |
| Otros modelos abliterados (p.ej. Dolphin Qwen, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

No hay datos disponibles de otros modelos abliterados comparables en la información proporcionada. El modelo se distingue del stock únicamente por la eliminación de rechazos, con un coste de capacidad moderado en STEM.

## Limitaciones y advertencias

- **Pérdida de capacidad en STEM**: el modelo pierde 3,3 puntos en MMLU en categorías STEM, lo que puede afectar a tareas de razonamiento matemático y lógico.
- **Riesgo de alucinación**: al eliminar los mecanismos de rechazo, el modelo puede generar contenido incorrecto o dañino con mayor confianza, sin barreras de seguridad.
- **Sesgos heredados**: hereda los sesgos del modelo base Qwen3.8-27B, no documentados en la información proporcionada.
- **Idiomas no documentados**: no se especifican los idiomas soportados, lo que limita su uso multilingüe fiable.
- **Restricciones de uso comercial**: la licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar políticas de plataformas o leyes locales; no es apto para producción sin salvaguardas.
- **Falta de evaluaciones adicionales**: no hay benchmarks de HumanEval, GSM8K, ni pruebas de robustez ante adversarial prompts en la información disponible.
- **Configuración de inferencia delicada**: requiere parámetros específicos (temperatura 0, repetition_penalty 1,15, sin system prompt) para evitar bucles y degradación de calidad; el uso con temperaturas altas degrada significativamente la salida.

## Enlaces

- Repositorio HuggingFace (legatos): https://huggingface.co/legatos/Qwen3.8-27B-OBLITERATED
- Repositorio HuggingFace (OBLITERATUS, espejo): https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Blog explainx.ai: "Qwen3.8-27B Uncensored MLX: OrcaRouter Build Explained" — https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026
- Blog explainx.ai: "Qwen3.8-27B OBLITERATED: 0% Refusal Rate (Aug 2026)" — https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
- Genaihub: https://genaihub.net/agents/hf-model-obliteratus-qwen3-8-27b-obliterated
