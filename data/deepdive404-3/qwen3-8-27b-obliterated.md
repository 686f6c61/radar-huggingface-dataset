# Deepdive404-3/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una modificación del modelo denso Qwen3.8-27B de Qwen, desarrollada por el usuario Deepdive404-3 con el objetivo de eliminar por completo los comportamientos de rechazo y las respuestas evasivas de seguridad. El modelo aplica una técnica de abliteración iterativa y complementaria (V1→V2→V3) que identifica y proyecta fuera del espacio de pesos las direcciones asociadas a los mecanismos de rechazo, logrando una tasa de rechazo del 0% en un conjunto de 842 prompts dañinos, según el blog explainx.ai. Está pensado para investigación en seguridad de IA, red-teaming y análisis de alineación.

El modelo base Qwen3.8-27B es un transformer denso híbrido de 27.800 millones de parámetros con atención lineal (Gated DeltaNet) en 48 de sus 64 capas, atención completa en las restantes, torre de visión nativa y cabezal MTP para decodificación especulativa. Su contexto nativo es de 262.000 tokens, extensible a 1M. La versión OBLITERATED mantiene la misma arquitectura y pesos modificados, con una pérdida de rendimiento en MMLU de 2,1 puntos porcentuales respecto al modelo original (82,3% frente a 84,5% en 0-shot).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (Gated DeltaNet linear attention en 48/64 capas + full attention), con torre de visión y cabezal MTP |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens nativos, extensible a 1.000.000 |
| Tipos de cuantizacion | safetensors (bfloat16), GGUF (varias cuantizaciones, no especificadas), MLX |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingüe, pero no se documenta la lista para esta versión) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso con atención híbrida: 48 de las 64 capas utilizan Gated DeltaNet (atención lineal con estado recurrente) y las 16 restantes emplean atención completa. Incluye una torre de visión que permite procesar imágenes y vídeo, y un cabezal MTP (multi-token prediction) que actúa como borrador en decodificación especulativa para acelerar la generación.

El proceso de abliteración se desarrolló en tres versiones. V1 aplicó una única cirugía SVD con 5 direcciones, eliminando los rechazos duros pero degradando MMLU en 6 puntos. V2 introdujo la técnica de "complementary abliteration blending": dos cirugías independientes (SVD y LEACE) que fallan de forma distinta, combinadas al 60/40, logrando una pérdida de solo 0,3 puntos de MMLU pero dejando evasiones suaves. V3 aplica refinamiento iterativo sobre el campeón V2, con un corpus enfocado en categorías específicas de desviación y una nueva pasada quirúrgica, eliminando tanto rechazos duros como desviaciones suaves, con un coste de 2,1 puntos de MMLU. El modelo final mantiene el modo de pensamiento (thinking) activable, aunque el chat template incluye un prefill que lo omite por defecto.

## Capacidades

- Generación de texto conversacional y de larga forma, con control de pensamiento (thinking mode activable o desactivable).
- Razonamiento multi-paso y resolución de problemas complejos, heredado del modelo base.
- Generación de código funcional: la model card reporta 20/20 aciertos en tareas de código con implementaciones reales y sin avisos legales.
- Tool calling y uso en agentes: el modelo base soporta function calling, y la model card incluye recomendaciones específicas para integración en harnesses de agentes (ajuste de repetition_penalty y temperature).
- Capacidades multimodales del modelo base (visión y vídeo) no documentadas explícitamente en esta versión abliterada; se desconoce si se conservan íntegramente.
- Multilingüismo: no confirmado para esta versión, aunque el modelo base Qwen3.8 es multilingüe.
- Ausencia total de rechazos: responde a consultas restringidas con contenido sustancial, sin lecciones de seguridad ni negativas.

## Casos de uso

- Investigación en seguridad de IA: permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, analizando cómo responde a prompts maliciosos y qué tipo de contenido genera. Es útil para evaluar riesgos de modelos desalineados.
- Red-teaming y pruebas de jailbreak: sirve para probar la robustez de sistemas de moderación y filtros, generando contenido que un modelo alineado rechazaría.
- Generación de código ofensivo y exploits: la model card destaca su capacidad para producir implementaciones funcionales de ataques, lo que puede emplearse en entornos controlados de ciberseguridad ofensiva.
- Análisis de alineación y evaluación de técnicas de ablación: permite comparar el rendimiento y comportamiento entre el modelo original y la versión ablacionada, estudiando el impacto de la eliminación de direcciones de rechazo.
- Desarrollo de agentes autónomos sin restricciones: en entornos de investigación donde se requiere que el agente no se detenga ante tareas que el modelo alineado consideraría inapropiadas, siempre bajo supervisión.
- Pruebas de estrés de sistemas de contenido: para verificar que los filtros de contenido de plataformas detectan y bloquean respuestas dañinas, utilizando este modelo como generador de casos límite.

## Benchmarks y rendimiento

La model card reporta resultados de MMLU (lm-eval-harness, 0-shot, n=100 por materia, 5700 preguntas) para cada versión:

| Modelo | MMLU | Stderr | vs Stock |
|---|---|---|---|
| Stock Qwen3.8-27B | 84,5% | no disponible | — |
| V1 | 81,4% | no disponible | -6,0 pp |
| V2 | 84,3% | no disponible | -0,3 pp |
| V3 (este modelo) | 82,3% | no disponible | -2,1 pp |

Además, se mencionan pruebas internas no publicadas formalmente: 20/20 en tareas de código (20 prompts) y 7/8 en tareas avanzadas del mundo real. No se han publicado resultados en otros benchmarks estándar (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16 (safetensors) se requieren aproximadamente 56 GB (27,8B × 2 bytes). Con cuantización GGUF de 8 bits, ~28 GB; con 4 bits, ~14 GB.
- GPU recomendadas: A100 80GB, H100 80GB o superior para bfloat16 sin cuantizar. Para 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente.
- En Apple Silicon, la versión MLX permite ejecutarlo en Mac con 64 GB o más de memoria unificada (con cuantización, 32 GB pueden ser suficientes).
- Opciones de despliegue: vLLM, llama.cpp (con el template jinja incluido en los GGUF), Ollama, LM Studio, y transformers de HuggingFace.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Se recomienda usar decodificación especulativa (MTP) para acelerar la generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (0-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (stock) | 27,8B | 262K | 84,5% | Apache-2.0 | HuggingFace, vLLM |
| Qwen3.8-27B-OBLITERATED (este) | 27,8B | 262K | 82,3% | Apache-2.0 | HuggingFace (safetensors, GGUF, MLX) |
| orcarouter/Qwen3.8-27B-Uncensored | 27,8B | 262K | no disponible | Apache-2.0 | Ollama (16 cuantizaciones 2-8 bits) |

Ambos modelos abliterados parten de la misma base y persiguen objetivos similares, pero emplean métodos distintos. No se dispone de benchmarks comparativos entre ellos.

## Limitaciones y advertencias

- Modelo diseñado para eliminar rechazos: genera contenido dañino, ilegal o peligroso sin filtros. Su uso conlleva riesgos legales y éticos, y no debe emplearse en producción sin supervisión humana y medidas de contención.
- Degradación de rendimiento: MMLU cae 2,1 puntos respecto al stock, lo que puede afectar a tareas que requieren conocimiento factual preciso.
- Riesgo de alucinación: al no tener restricciones, puede inventar información con mayor facilidad, especialmente en temas sensibles.
- Configuración delicada: requiere temperature 0, repetition_penalty 1.15 y sistema prompt vacío para un comportamiento óptimo. Desviarse de estos ajustes puede provocar bucles o respuestas de baja calidad.
- El modo de pensamiento (thinking) puede reintroducir comportamientos no deseados; se recomienda mantenerlo desactivado.
- No se ha verificado el soporte de visión en esta versión abliterada; el proyector de visión puede no estar incluido o funcionar correctamente.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad del uso recae en el usuario. No hay garantías de seguridad ni soporte oficial.

## Enlaces

- HuggingFace: https://huggingface.co/Deepdive404-3/Qwen3.8-27B-OBLITERATED
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Blog explainx.ai sobre el modelo: https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
- Build similar en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
