# crazyleg11/qwen3.8-27b-dat-grpo-full250-GGUF

## Resumen

Qwen3.8-27B DAT GRPO Full250 GGUF es una exportación cuantizada del checkpoint experimental `crazyleg11/qwen3.8-27b-dat-grpo-full250`, publicado por el usuario independiente crazyleg11. Se trata de un ajuste fino sobre una base de la familia Qwen3.5 (etiquetada como `qwen3_5` en los tags), entrenado con GRPO (Group Relative Policy Optimization) durante 250 actualizaciones sobre pesos completos (full-weight), con un enfoque declarado en creatividad y generación de texto. El modelo completo contiene 26.895.998.464 parámetros de texto distribuidos en 851 tensores, y esta release ofrece únicamente los pesos en formato GGUF para inferencia local.

La relevancia de esta ficha es acotada: no se trata de un lanzamiento oficial de Alibaba/Qwen, sino de un experimento de la comunidad con cero descargas y cero likes en el momento de la consulta, creado el 5 de noviembre de 2026. El autor documenta explícitamente regresiones observadas en el seguimiento de instrucciones del checkpoint completo, lo que conviene tener en cuenta antes de evaluarlo para producción. La licencia heredada es Apache-2.0.

La release GGUF incluye dos ficheros: una cuantización mixta de 4 bits (Q4_K_M) de 16,55 GB y una de 8 bits (Q8_0) de 28,60 GB. Los GGUF contienen solo la ruta de texto; la ruta de visión del checkpoint safetensors completo no está incluida en estas exportaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura `qwen35` en llama.cpp, familia Qwen3.5) |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 4096`, pero no se declara el máximo) |
| Tipos de cuantizacion | Q4_K_M (4 bits mixto) y Q8_0 (8 bits) |
| Idiomas soportados | en (inglés, según el campo `language` de la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (851 tensores de texto); safetensors en el checkpoint base completo |
| Tamano del repo | 45,1 GB |
| Modelo base | crazyleg11/qwen3.8-27b-dat-grpo-full250 |
| Metodo de ajuste | GRPO, 250 actualizaciones, pesos completos |
| Fecha de publicacion | 2026-11-05 |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de la familia Qwen3.5 (identificador `qwen35` en llama.cpp), con 26,9 mil millones de parámetros de texto. No hay información pública sobre número de capas, dimensión oculta, cabezas de atención ni mecanismos de atención específicos (lineal, híbrida, etc.) en la documentación proporcionada. El checkpoint base completo incluye además una ruta de visión que no se ha exportado a los GGUF.

El entrenamiento consiste en un ajuste con GRPO sobre pesos completos durante 250 actualizaciones, orientado a creatividad y generación de texto. El autor no detalla el dataset de preferencias, la composición de prompts, la función de recompensa ni el número de tokens de entrenamiento. Tampoco se especifica si hubo una fase previa de SFT o RLHF adicional. La model card del checkpoint completo (enlazada desde esta) contiene la procedencia del entrenamiento (`provenance.json`), evaluaciones de escritura y las regresiones de seguimiento de instrucciones observadas, pero esos datos no están reproducidos en la información disponible para esta ficha.

Un detalle técnico relevante: la plantilla de chat original del checkpoint mantiene trazas de razonamiento incluso con el flag de "reasoning off" en la build de llama.cpp probada, por lo que el autor distribuye una plantilla alternativa (`chat-template-no-think.jinja`) que desactiva explícitamente el modo pensamiento conservando el formato conversacional.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Escritura creativa: el ajuste GRPO está orientado explícitamente a creatividad; el ejemplo de la model card es la generación de un soneto sobre el amor eterno.
- Modo pensamiento (thinking) presente en la plantilla original, desactivable mediante plantilla Jinja alternativa.
- Soporte de plantilla de chat Jinja (`--jinja`) en llama.cpp.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Capacidades multilingües: solo se declara inglés; no hay evidencia de soporte de castellano.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Visión: presente en el checkpoint safetensors completo, ausente en estas exportaciones GGUF.
- Audio: no disponible.

## Casos de uso

- Generación creativa de ficción y poesía: el ajuste GRPO con 250 actualizaciones está orientado a creatividad, y el ejemplo canónico de la model card es la escritura de sonetos; adecuado para prototipos de escritura asistida donde se prioriza variedad estilística sobre precisión factual.
- Experimentación e investigación en RL: útil como punto de partida para estudiar el efecto de GRPO sobre pesos completos en un modelo de 27 B, comparando el checkpoint ajustado con la base Qwen3.5 sin ajustar.
- Evaluación de cuantizaciones: los dos ficheros (Q4_K_M y Q8_0) permiten medir la degradación de calidad creativa entre 4 y 8 bits en un mismo checkpoint, aunque el autor advierte que las baterías completas de evaluación creativa de las cuantizaciones no se han medido.
- Despliegue local en estación de trabajo: con 16,55 GB en Q4_K_M cabe en GPUs de consumo de 24 GB (RTX 3090/4090) y permite generar texto sin conexión mediante llama.cpp u Ollama.
- Generación de borradores de texto en inglés: para tareas de redacción donde el seguimiento estricto de instrucciones no sea crítico, dado que el autor documenta regresiones en instruction-following.
- Pruebas de integración de runtimes: sirve para validar soporte de la arquitectura `qwen35` en versiones recientes de llama.cpp, Ollama y LM Studio antes de adoptar modelos Qwen3.5 más grandes o estables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las puntuaciones de evaluación del modelo principal corresponden a servicio en BF16 y que las cuantizaciones solo han pasado comprobaciones estructurales y pruebas cortas de generación; sus baterías completas de capacidad y escritura creativa permanecen sin medir.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,55 GB para Q4_K_M y 28,60 GB para Q8_0, más la caché de contexto y los buffers de cómputo (el autor lo señala explícitamente; el consumo real supera el tamaño del fichero).
- GPU recomendadas: para Q8_0, A100 40 GB, H100 o RTX A6000 48 GB; para Q4_K_M, RTX 3090/4090 (24 GB) con margen para contexto moderado.
- Cabe en GPU de consumo: sí, Q4_K_M en tarjetas de 24 GB; Q8_0 requiere 32 GB o más (por ejemplo, RTX 5090 si se confirma su VRAM, o configuraciones multi-GPU).
- Despliegue: llama.cpp (build reciente con arquitectura `qwen35`, commit de referencia `ea40a3a1e1774534b7fe605caa1e85558175e3e8`), Ollama (`ollama run hf.co/crazyleg11/qwen3.8-27b-dat-grpo-full250-GGUF:Q4_K_M`) y LM Studio. vLLM y TGI no se mencionan en la documentación.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B DAT GRPO Full250 GGUF (este) | 26,9 B densos | no disponible | GGUF (Q4_K_M, Q8_0) | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen3.5 base (familia referenciada) | no disponible en la informacion | no disponible | safetensors/GGUF según release oficial | no disponible en la informacion | no disponible en la informacion |
| Checkpoint completo `qwen3.8-27b-dat-grpo-full250` | 26,9 B + ruta de visión | no disponible | safetensors (BF16) | Apache-2.0 | Hugging Face, con Space de demo |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Regresiones documentadas en seguimiento de instrucciones por el propio autor en el checkpoint completo; no recomendable para producción con requisitos estrictos de instruction-following.
- Las cuantizaciones no han pasado las baterías completas de evaluación de capacidad ni de escritura creativa; solo comprobaciones estructurales y generaciones cortas.
- Modelo experimental de la comunidad, sin respaldo de un laboratorio: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación externa.
- Solo se declara inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinación: no cuantificado en la documentación; el énfasis en creatividad puede favorecer respuestas plausibles pero no fidedignas.
- La plantilla de chat original emite trazas de razonamiento incluso con el flag de reasoning desactivado en la build probada de llama.cpp; es necesario usar la plantilla `chat-template-no-think.jinja` para evitarlo.
- Sin ruta de visión en los GGUF: las capacidades multimodales del checkpoint safetensors no están disponibles en esta release.
- Licencia Apache-2.0 permite uso comercial, pero la falta de evaluaciones y las regresiones conocidas desaconsejan su uso en producción sin una evaluación propia previa.
- Longitud de contexto máxima no declarada; el ejemplo usa 4096 tokens, que no debe interpretarse como el límite del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/crazyleg11/qwen3.8-27b-dat-grpo-full250-GGUF
- Checkpoint completo (safetensors): https://huggingface.co/crazyleg11/qwen3.8-27b-dat-grpo-full250
- Demo en el navegador (Space): https://huggingface.co/spaces/crazyleg11/full250-creativity
- Integración de Ollama en Hugging Face: https://huggingface.co/docs/hub/ollama
- Controles de thinking en Ollama: https://docs.ollama.com/capabilities/thinking
- Descarga de modelos en LM Studio: https://lmstudio.ai/docs/app/basics/download-model
