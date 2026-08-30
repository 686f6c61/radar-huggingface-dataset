# sergAIAI/Qwen3.8-27B-OBLITERATED

## Resumen

El modelo `sergAIAI/Qwen3.8-27B-OBLITERATED` es una versión modificada del modelo base `Qwen/Qwen3.8-27B` de Alibaba, desarrollada por el usuario `sergAIAI` (también referido como OBLITERATUS en la model card). Su propósito es eliminar el comportamiento de rechazo y las "lecciones de seguridad" que suelen aparecer en los modelos de lenguaje al recibir consultas delicadas o restringidas, ofreciendo respuestas directas y sustanciales. Es una herramienta orientada a la investigación en seguridad de IA (red teaming) y a la evaluación de alineación.

La versión V3 presentada en la model card aplica un proceso de "abliteration" iterativo y dirigido, combinando técnicas de SVD y LEACE con un blending complementario, logrando una reducción del rendimiento en MMLU de solo 2,1 puntos porcentuales respecto al modelo original (82,3% vs 84,5%). El modelo mantiene 27.781.427.952 parámetros, está disponible en formatos safetensors, GGUF y MLX, y se distribuye bajo licencia Apache 2.0. No se especifican los idiomas soportados ni la longitud de contexto en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B; detalles de arquitectura no especificados en la model card) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B soporta hasta 262K tokens según fuentes externas) |
| Tipos de cuantizacion | Safetensors (bf16), GGUF, MLX (diversas cuantizaciones incluidas en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo es una adaptación del Qwen3.8-27B de Alibaba, un transformer denso de 27B parámetros. La modificación principal es el proceso de "abliteration", que identifica y proyecta fuera del espacio de pesos las direcciones responsables del comportamiento de rechazo. La versión V3 se construyó a partir de la V2 mediante refinamiento iterativo y una cirugía dirigida con un corpus enfocado en categorías específicas de desvío. Se emplearon dos técnicas complementarias: SVD (que elimina rechazos de forma agresiva pero degrada capacidades) y LEACE (que preserva mejor las capacidades pero elimina rechazos de forma más débil), combinadas mediante un blending al 60/40. No se realizó entrenamiento tradicional (RLHF, DPO, etc.); el proceso es puramente de modificación de pesos sobre el modelo base.

## Capacidades

- Generación de texto conversacional y de código funcional sin rechazos ni lecciones de seguridad.
- Respuesta a consultas restringidas con contenido sustancial, según pruebas manuales del autor (20/20 en tareas de código, 7/8 en tareas avanzadas del mundo real).
- Compatible con modo "thinking" (razonamiento encadenado), aunque se recomienda desactivarlo para respuestas más directas.
- Soporte para uso en agentes y frameworks de automatización, con ajustes específicos de repetición y temperatura para evitar bucles.
- Capacidades multilingües no documentadas; se asume herencia del modelo base, pero no hay confirmación en la model card.
- No se menciona soporte de tool calling, visión ni audio en la documentación proporcionada.

## Casos de uso

- Investigación en seguridad de IA y red teaming: el modelo permite evaluar vulnerabilidades, generar prompts adversariales y analizar comportamientos de rechazo en sistemas de IA, gracias a su ausencia de filtros de seguridad.
- Pruebas de penetración y generación de exploits educativos: puede producir código funcional para entornos controlados de ciberseguridad, como se indica en las pruebas 20/20 de tareas de código.
- Automatización de agentes conversacionales sin restricciones: en entornos donde se requiere respuestas directas sin desvíos de seguridad, por ejemplo en asistentes técnicos internos.
- Generación de código en producción: con la configuración adecuada (temperatura 0, repetition_penalty 1.15), puede generar implementaciones completas sin comentarios de seguridad innecesarios.
- Evaluación comparativa de técnicas de ablación: sirve como referencia para estudiar el impacto de la eliminación de direcciones de rechazo en modelos de lenguaje.
- Desarrollo de sistemas de IA para investigación académica en alineación y seguridad: permite analizar cómo se comporta un modelo sin capas de rechazo.

## Benchmarks y rendimiento

La model card proporciona resultados de MMLU (0-shot, lm-eval-harness, n=100 por materia, 5700 preguntas) para las distintas versiones:

| Modelo | MMLU (0-shot) | Diferencia vs stock |
|---|---|---|
| Stock Qwen3.8-27B | 84,5% | — |
| V1 | 81,4% | -6,0 pp |
| V2 | 84,3% | -0,3 pp |
| V3 (este modelo) | 82,3% | -2,1 pp |

No se han publicado resultados de otros benchmarks estándar (HumanEval, GSM8K, etc.) en la información disponible. Las pruebas adicionales (20/20 en tareas de código, 7/8 en tareas avanzadas) son evaluaciones manuales del autor y no siguen protocolos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: ~56 GB en bf16 (27,8B parámetros × 2 bytes); ~28 GB en cuantización de 8 bits; ~14 GB en cuantización de 4 bits.
- GPU recomendadas: A100 80GB, H100, o RTX 4090 (24GB) con cuantización 4-bit. No cabe en GPUs de consumo con menos de 16GB VRAM sin cuantización agresiva.
- En Apple Silicon, el formato MLX permite ejecución eficiente en Macs con al menos 32GB de memoria unificada.
- Opciones de despliegue: vLLM, llama.cpp (con plantilla `--jinja` incluida), Ollama, LM Studio, y la librería MLX para macOS.
- Latencia y throughput: no disponibles en la documentación; dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27,8B | 262K (según fuentes) | Apache 2.0 | Modelo original con rechazos intactos |
| sergAIAI/Qwen3.8-27B-OBLITERATED | 27,8B | No disponible | Apache 2.0 | Versión abliterated V3, MMLU 82,3% |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27,8B | No disponible | No disponible | Otra versión abliterated del mismo base; sin datos de rendimiento en la información consultada |

No se dispone de datos de rendimiento comparativos más allá del MMLU para la versión de huihui-ai.

## Limitaciones y advertencias

- El modelo está diseñado para eliminar rechazos y puede generar contenido peligroso, ilegal o dañino si se utiliza con intenciones maliciosas. Solo debe usarse en entornos controlados de investigación y con fines legítimos.
- Alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en temas especializados o con configuraciones de temperatura altas.
- Sesgos: no se han documentado sesgos específicos, pero el proceso de ablación no elimina sesgos subyacentes del modelo base.
- Limitaciones de contexto e idioma: la longitud de contexto no está confirmada en esta versión; se recomienda no exceder el contexto del modelo base. No hay información sobre cobertura multilingüe.
- Restricciones de uso: la licencia Apache 2.0 permite uso comercial, pero el uso del modelo para actividades ilegales está sujeto a las leyes aplicables. El autor advierte que el modelo puede reintroducir rechazos si se usan system prompts.
- Para uso en agentes, se requieren ajustes específicos (repetición, temperatura, gestión de contexto) para evitar bucles o degradación de rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sergAIAI/Qwen3.8-27B-OBLITERATED
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Artículo sobre el modelo en explainx.ai: https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
- Guía de ejecución local del base Qwen3.8-27B: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Versión abliterated alternativa: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
