# donedynamics/Qwen3.8-27B-heretic-MLX-6bit

## Resumen

Este repositorio contiene una conversión cuantizada a 6 bits en formato MLX del modelo `trohrbaugh/Qwen3.8-27B-heretic-ara`, un derivado "abliterado" de Qwen3.8-27B, el modelo denso multimodal de 27 000 millones de parámetros desarrollado por el equipo Qwen de Alibaba. La abliteración elimina quirúrgicamente el comportamiento de rechazo del modelo original, de modo que responde a peticiones que un modelo con alineación de seguridad rechazaría. Esta conversión, creada por `donedynamics`, está pensada para ejecutarse en Apple Silicon mediante la librería `mlx-lm`.

La relevancia de este modelo radica en que permite ejecutar localmente un derivado de Qwen3.8-27B en hardware Apple con un rendimiento razonable (27,9 tokens por segundo en una Mac Studio M3 Ultra), aunque con dos advertencias importantes: es exclusivamente de texto (no procesa imágenes ni vídeo, a diferencia del modelo base) y carece de cualquier alineación de seguridad adicional. La licencia Apache-2.0 se hereda de la cadena de derivación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 5.885.566.464 (según safetensors; el modelo base declara 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | 6 bits (esta conversión); también disponibles versiones 4 y 8 bits del mismo autor |
| Idiomas soportados | No disponibles en la documentación del repositorio |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal denso con codificador de visión integrado, diseñado para tareas multimodales y agénticas. Esta conversión, sin embargo, solo incluye la torre de lenguaje: la configuración no contiene `vision_config` y ninguno de los 1847 tensores pertenece a la torre de visión, por lo que la entrada de imágenes o vídeo no funciona. El proceso de abliteración aplicado por `trohrbaugh` elimina las capas responsables del rechazo, manteniendo el resto de pesos intactos. El presente repositorio no añade ningún tipo de alineación ni entrenamiento adicional; únicamente convierte los pesos bf16 originales a cuantización MLX de 6 bits mediante `mlx_lm.convert`.

No se dispone de información sobre el dataset de entrenamiento del modelo original ni sobre técnicas como RLHF o DPO aplicadas a esta variante. La cuantización es la única modificación introducida respecto al modelo abliterado.

## Capacidades

- Generación de texto conversacional y de respuesta libre, sin restricciones de rechazo por contenido.
- Razonamiento configurable: el chat template soporta `enable_thinking` y `reasoning_effort`, con el modo de pensamiento activado por defecto (consume tokens antes de la respuesta final).
- Soporte de tool calling y agentes: heredado del modelo base Qwen3.8-27B, aunque no está explícitamente documentado en esta conversión.
- Multilingüismo: probablemente heredado del modelo base, pero no confirmado en la documentación del repositorio.
- Exclusivamente texto: no admite entrada de imágenes ni vídeo.
- Sin alineación de seguridad: responde a peticiones que un modelo con ajuste de seguridad rechazaría.

## Casos de uso

- Desarrollo de prototipos locales en macOS: permite probar interacciones de lenguaje natural sin depender de APIs externas, gracias a su ejecución eficiente en Apple Silicon (27,9 tok/s en M3 Ultra).
- Experimentación con modelos sin alineación: útil para investigar el comportamiento de modelos "abliterados" en entornos controlados, siempre con las debidas salvaguardas.
- Generación de texto creativo sin filtros: adecuado para proyectos que requieran respuestas sin censura previa, como escritura de ficción o generación de diálogos.
- Integración en pipelines de razonamiento: el modo de pensamiento configurable permite obtener cadenas de razonamiento antes de la respuesta final, útil para tareas de lógica o análisis.
- Chatbots locales para entornos de desarrollo: puede desplegarse con `mlx-lm` para pruebas de integración de agentes conversacionales en equipos Mac.
- Evaluación de cuantización en MLX: sirve como referencia para medir el impacto de la cuantización de 6 bits en el rendimiento y la calidad de salida frente a versiones de 4 u 8 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta mediciones de rendimiento de inferencia en una Mac Studio M3 Ultra (512 GB de memoria unificada, macOS 26.5.2, `mlx-lm` 0.31.3) con un prompt de 68 tokens y 120 tokens generados:

| Build | Tamano | Bits/peso | Generacion | Memoria pico |
|---|---|---|---|---|
| 4-bit | 15,1 GB | 4,501 | 37,9 tok/s | 15,5 GB |
| 6-bit | 21,4 GB | 6,501 | 27,9 tok/s | 22,2 GB |
| 8-bit | 28,6 GB | 8,501 | 22,2 tok/s | 28,9 GB |

Estos valores son orientativos, basados en una única ejecución en un solo equipo, y no constituyen un benchmark exhaustivo.

## Requisitos de hardware

- VRAM estimada para inferencia: 22,2 GB de memoria pico para la versión de 6 bits (según medición en Mac Studio M3 Ultra). Las versiones de 4 y 8 bits requieren aproximadamente 15,5 GB y 28,9 GB respectivamente.
- GPU recomendadas: cualquier Mac con chip Apple Silicon (M-series) con al menos 32 GB de memoria unificada para la versión de 6 bits; 64 GB o más para mayor margen. En equipos con menos memoria, la versión de 4 bits es más adecuada.
- No cabe en GPUs de consumo convencionales (como RTX 4090) porque el formato MLX está diseñado exclusivamente para Apple Silicon; para GPUs NVIDIA se requeriría una conversión a otro formato (por ejemplo, GGUF o GPTQ).
- Opciones de despliegue: `mlx-lm` (CLI y API Python), compatible con el ecosistema MLX. No se menciona soporte para vLLM, llama.cpp u Ollama en esta conversión.
- Latencia y throughput: 27,9 tokens por segundo en la configuración medida, con una latencia inicial no especificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Alineacion | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Si | Si | Apache-2.0 |
| Qwen3.8-27B-heretic-ara | 27B | 262K | Si | No (abliterado) | Apache-2.0 |
| Este modelo (MLX 6-bit) | 5.885.566.464 (según safetensors) | 262K | No (text-only) | No (abliterado) | Apache-2.0 |

La comparativa muestra que esta conversión pierde la capacidad multimodal del modelo base y mantiene la ausencia de alineación, pero gana eficiencia de ejecución en Apple Silicon. No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Es exclusivamente de texto: no procesa imágenes ni vídeo, a diferencia del modelo base multimodal.
- El modelo es "abliterado": no tiene comportamiento de rechazo, por lo que puede generar contenido inapropiado, ofensivo o peligroso. Debe evaluarse antes de exponerlo a usuarios y aplicarse filtros adicionales si es necesario.
- No se han publicado evaluaciones de calidad (benchmarks) para esta conversión, por lo que su rendimiento real en tareas específicas es desconocido.
- La cuantización de 6 bits puede introducir degradación en la calidad de las respuestas frente a los pesos completos.
- El número de parámetros reportado en safetensors (5.885.566.464) no coincide con los 27B declarados para el modelo base; podría tratarse de un error en el conteo o de una conversión parcial, aunque la model card no lo aclara.
- No se especifican los idiomas soportados, aunque probablemente herede el multilingüismo del modelo original.
- La licencia Apache-2.0 permite uso comercial, pero la naturaleza sin alineación del modelo puede generar problemas legales o éticos en aplicaciones orientadas al público.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/donedynamics/Qwen3.8-27B-heretic-MLX-6bit
- Modelo base abliterado: https://huggingface.co/trohrbaugh/Qwen3.8-27B-heretic-ara
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog de AMD sobre ejecución de Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía completa sobre Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
