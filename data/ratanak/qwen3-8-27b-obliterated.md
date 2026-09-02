# Ratanak/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una variante del modelo Qwen3.8-27B de Alibaba, modificada mediante una técnica de "abliteración" (abliteration) que elimina los comportamientos de rechazo y las respuestas evasivas de seguridad del modelo original. El autor, Ratanak, publica esta versión bajo licencia Apache 2.0, con el objetivo declarado de facilitar investigación en seguridad de IA, red-teaming y generación de contenido sin restricciones. El modelo conserva la arquitectura del base, con 27.781.427.952 parámetros (aproximadamente 27,8 mil millones), y está disponible en formatos safetensors, GGUF y MLX.

La versión V3, la más reciente, emplea una técnica denominada "complementary abliteration blending", que combina dos métodos de ablación (SVD y LEACE) para eliminar tanto los rechazos duros como las respuestas evasivas tipo "charla de seguridad", manteniendo una pérdida de rendimiento moderada en MMLU (82,3% frente al 84,5% del modelo original). El modelo soporta un modo de razonamiento ("thinking") que puede activarse o desactivarse mediante la plantilla de chat, y está pensado para entornos de generación de texto con contexto largo, aunque la longitud exacta de contexto no se especifica en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen/Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no se especifica en la documentación) |
| Tipos de cuantizacion | GGUF (varios niveles, no especificados), safetensors (bf16), MLX |
| Idiomas soportados | No disponible (no se especifica; el base Qwen3.8-27B soporta múltiples idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.8-27B, un transformer denso de 27,8 mil millones de parámetros desarrollado por Alibaba. La modificación principal no es un entrenamiento desde cero, sino una intervención post-entrenamiento sobre los pesos del modelo original. La técnica de abliteración identifica direcciones en el espacio de pesos asociadas al comportamiento de rechazo y las proyecta fuera del modelo. En la versión V3, el autor combina dos métodos: SVD (descomposición en valores singulares) para eliminar direcciones de rechazo de forma agresiva, y LEACE (minimización de información mutua) para preservar la capacidad general. El autor denomina a esta combinación "complementary abliteration blending", con una proporción 60/40 entre ambos métodos, seguida de un refinamiento iterativo sobre el modelo resultante y una cirugía dirigida con un corpus específico para categorías de evasión.

No se proporcionan datos sobre el corpus de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. El proceso es puramente de modificación de pesos, sin fine-tuning supervisado adicional. La plantilla de chat del modelo incluye un prefill que omite la cadena de razonamiento cuando el modo "thinking" está desactivado, lo que permite respuestas más directas.

## Capacidades

- Generación de texto conversacional y de larga forma, con soporte para instrucciones complejas.
- Generación de código funcional: según el autor, el modelo produce implementaciones operativas en tareas de programación (20/20 en pruebas propias).
- Modo de razonamiento ("thinking") activable o desactivable mediante la plantilla de chat; con el modo activado, el modelo genera cadenas de razonamiento antes de responder.
- Respuesta a consultas restringidas o sensibles que el modelo base rechazaría, incluyendo temas de seguridad, red-teaming y conocimiento especializado.
- Compatibilidad con entornos agénticos: el autor recomienda ajustes específicos de repetición y temperatura para evitar bucles en herramientas de agente.
- Multilingüismo heredado del modelo base, aunque no se detallan los idiomas concretos en la documentación.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo los modelos de lenguaje manejan consultas maliciosas o de doble uso, facilitando el desarrollo de mejores mecanismos de alineación. Su comportamiento sin rechazos permite analizar vulnerabilidades reales en lugar de respuestas evasivas.
- Red-teaming de sistemas de IA: los equipos de seguridad pueden usar el modelo para generar ataques de prompt injection, jailbreaks o contenido ofensivo controlado, evaluando así la robustez de otros sistemas.
- Generación de código en entornos de prueba: al no rechazar solicitudes de programación, puede emplearse para generar scripts, exploits educativos o código de automatización en entornos aislados, siempre con supervisión humana.
- Simulación de conversaciones sin censura: para investigación en ciencias sociales o análisis de discurso, el modelo puede producir respuestas sin filtros de seguridad, lo que resulta útil para estudiar sesgos o patrones lingüísticos.
- Desarrollo de agentes conversacionales especializados: en dominios donde las restricciones de seguridad del modelo base interfieren (por ejemplo, asesoramiento técnico avanzado), este modelo puede integrarse en pipelines agénticos con ajustes de repetición y temperatura.
- Evaluación comparativa de técnicas de ablación: investigadores interesados en interpretabilidad pueden usar este modelo como caso de estudio para comparar métodos de eliminación de comportamientos indeseados y medir su impacto en capacidades generales.

## Benchmarks y rendimiento

La model card del autor reporta resultados de MMLU (lm-eval-harness, 0-shot, n=5700) comparando el modelo stock con las versiones V1, V2 y V3:

| Modelo | MMLU (0-shot) | Diferencia vs stock |
|---|---|---|
| Stock Qwen3.8-27B | 84,5% | — |
| V1 (single surgery) | 81,4% | -6,0 pp |
| V2 (complementary blending) | 84,3% | -0,3 pp |
| V3 (iterative refinement) | 82,3% | -2,1 pp |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la información disponible. El autor también menciona pruebas manuales de generación de código (20/20 prompts con código funcional) y de "tareas avanzadas del mundo real" (7/8), pero estos datos no están estandarizados ni verificados externamente.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, el modelo requiere aproximadamente 56 GB de VRAM (27,78 B × 2 bytes). Con cuantización GGUF Q4, se reduce a unos 16-18 GB; con Q8, unos 30 GB.
- GPU recomendadas: para bf16 completo, una A100 80GB o H100; para cuantización Q4, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente. Con MLX, puede ejecutarse en Apple Silicon con al menos 32 GB de memoria unificada.
- Compatibilidad con GPU de consumo: sí, con cuantización GGUF Q4 o inferior, cabe en tarjetas de 16-24 GB.
- Opciones de despliegue: vLLM, llama.cpp (con la plantilla Jinja incluida en los GGUF), Ollama, LM Studio, TGI y MLX para Apple Silicon.
- Latencia y throughput: no se proporcionan datos específicos. Para un modelo de 27B en una RTX 4090 con Q4, se puede esperar un throughput de 20-40 tokens/s en generación, pero estos valores son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (0-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (stock) | 27,78 B | No disponible | 84,5% | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-OBLITERATED (V3) | 27,78 B | No disponible | 82,3% | Apache 2.0 | Hugging Face |
| Otros modelos abliterados (p. ej., Dolphin, WizardLM-uncensored) | Variable | Variable | No disponible | Variable | Hugging Face |

No se dispone de datos comparativos directos con otros modelos abliterados en la información proporcionada. La comparación principal es con el modelo base, que muestra una pérdida de 2,1 puntos porcentuales en MMLU a cambio de la eliminación de rechazos.

## Limitaciones y advertencias

- El modelo está diseñado para eliminar rechazos y respuestas evasivas, lo que implica un riesgo elevado de generar contenido dañino, ilegal o éticamente problemático. No debe usarse en producción sin supervisión humana y controles de seguridad.
- La pérdida de rendimiento en MMLU (-2,1 pp) indica una degradación medible de capacidades generales, aunque el autor la considera "modesta".
- El autor recomienda temperatura 0 y repetition_penalty 1.15; sin estos ajustes, el modelo puede caer en bucles de repetición, especialmente en tareas de código.
- El modo "thinking" activado puede producir respuestas más largas y, según el autor, funciona correctamente, pero no se han verificado sus límites.
- No se especifica la longitud de contexto soportada; el modelo base Qwen3.8-27B probablemente soporte ventanas largas, pero este dato no está confirmado para esta variante.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar leyes o políticas de plataformas; el responsable del despliegue asume los riesgos legales.
- Los benchmarks reportados son del autor, con metodología propia (n=5700 para MMLU) y no han sido replicados de forma independiente.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere una adopción muy limitada y poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ratanak/Qwen3.8-27B-OBLITERATED
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub con documentación: https://github.com/bigguy8585/ai/tree/main/Qwen3.8-27B-OBLITERATED
- Artículo de análisis en mindstudio.ai: https://www.mindstudio.ai/blog/qwen3-8-27b-obliterated-uncensored
