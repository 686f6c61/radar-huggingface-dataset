# coolthor/Huihui-Qwable-3.6-27b-abliterated-Q4_K_M-MTP-GGUF

## Resumen

Huihui-Qwable-3.6-27b-abliterated Q4_K_M (MTP) es una cuantización GGUF en 4 bits del modelo Qwable-3.6-27b, un transformer denso de 27.320.697.856 parámetros derivado de Qwen3.6-27B y sometido a un proceso de destilación SFT con trazas de razonamiento y asistente de Claude Fable-5 por parte de Mia-AiLab. Sobre esa base, huihui-ai aplicó abliteration (eliminación de la dirección de rechazo en el espacio de activaciones) e integró una cabeza MTP (multi-token prediction) para decodificación especulativa. coolthor publica aquí una cuantización Q4_K_M de 15,7 GiB (4,92 bits por peso) generada con llama.cpp build b9190 a partir del release Q4_K_M_F16 de huihui-ai.

El interés de esta variante concreta es práctico: los GGUF originales de huihui-ai en Q4_K_M_Q8 (19,1 GiB) y Q4_K_M_F16 (25,9 GiB) dejan poco margen en GPUs de 22-24 GB una vez sumados KV cache y buffers de cómputo. Esta versión de 15,7 GiB cabe con holgura en una RTX 3090 o 4090 y conserva la capa `nextn` que habilita la especulación integrada, sin necesidad de un fichero draft separado.

Se trata de un modelo orientado a conversación y uso local, con soporte de tool calling en formato OpenAI cuando se desactiva el modo thinking. La licencia MIT del linaje se hereda, lo que permite uso comercial sin restricciones adicionales, si bien la naturaleza abliterated del modelo implica consideraciones éticas y de seguridad que deben evaluarse antes de desplegarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.6-27B) con cabeza MTP `nextn` integrada para decodificación especulativa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (configuración de referencia del autor con `-c 32768`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (4,92 BPW); el linaje upstream ofrece Q4_K_M_Q8 y Q4_K_M_F16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27,3 mil millones de parámetros basado en Qwen3.6-27B. Mia-AiLab produjo Qwable-3.6-27b mediante SFT completo sobre trazas de razonamiento y respuestas de asistente destiladas de Claude Fable-5, lo que introduce un estilo de razonamiento heredado del profesor. Posteriormente, huihui-ai aplicó abliteration, una técnica que identifica y elimina la dirección de activación asociada al rechazo, reduciendo la tendencia del modelo a declinar peticiones, e integró una capa MTP (`nextn`) que actúa como cabeza draft para decodificación especulativa autocontenida.

La cuantización de coolthor no parte de los pesos BF16 originales, sino del GGUF Q4_K_M_F16 de huihui-ai, que ya tenía precisión mixta. El resultado conserva la capa MTP horneada y se generó con llama.cpp b9190. No se documenta SFT adicional ni fusión de pesos por parte de coolthor. La aceptación del draft especulativo medida es de aproximadamente 0,45 con `--spec-draft-n-max 3`, inferior a la de un Qwen3.6 vanilla (~0,75); el autor atribuye la diferencia a la destilación de Fable y no a la cuantización, ya que cambiar la precisión de la cabeza draft (Q4, Q8, F16) no alteró materialmente la aceptación.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat.
- Razonamiento con modo thinking (trazas de razonamiento estilo Fable-5), desactivable por petición mediante `chat_template_kwargs.enable_thinking`.
- Tool calling / function calling con el esquema `tools` compatible con OpenAI, devolviendo `tool_calls` estructurados cuando el thinking está desactivado.
- Decodificación especulativa autocontenida mediante la capa MTP integrada, sin fichero draft externo.
- Capacidad de razonamiento multi-paso derivada de las trazas destiladas, útil para agentes.
- Comportamiento abliterated: menor tasa de rechazo ante peticiones que un modelo alineado convencional rechazaría.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no disponibles (no se documentan).

## Casos de uso

- Asistente conversacional local en estación de trabajo: con 15,7 GiB de pesos y contexto de 32.768 tokens, cabe en una RTX 3090/4090 dejando margen para KV cache, permitiendo sesiones multi-turno largas sin servicios en la nube.
- Automatización de agentes con tool calling: al devolver `tool_calls` estructurados con thinking desactivado, puede integrarse en orquestadores tipo LangChain o frameworks propios que consuman la API OpenAI-compatible de llama-server.
- Generación y revisión de código en pipelines internos: el modelo hereda capacidad de razonamiento del distill de Fable-5, adecuado para tareas de explicación, refactorización y generación de parches en entornos con requisitos de privacidad.
- Experimentación en investigación sobre abliteration: sirve como sujeto de estudio para medir cómo la eliminación de la dirección de rechazo afecta a la utilidad, la tasa de cumplimiento y la calidad del razonamiento en un modelo de 27B.
- Despliegue en hardware consumer modificado: el tamaño de 15,7 GiB está pensado explícitamente para GPUs de 22 GB (por ejemplo, una 2080 Ti con mod de VRAM) y 24 GB, habilitando inferencia local de un 27B en equipos de gama alta de consumo.
- Evaluación de decodificación especulativa MTP: la cabeza `nextn` integrada permite medir aceptación y throughput en distintos valores de `--spec-draft-n-max` sin gestionar un modelo draft separado, útil para caracterizar el trade-off latencia/aceptación.
- Prototipado de chatbots sin restricciones temáticas: el carácter abliterated lo hace apto para investigación sobre contenido sensible en entornos controlados, siempre con las salvaguardas externas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento publicados son de throughput de decodificación en un GB10 (Grace-Blackwell):

| Configuracion | Decode | Aceptacion del draft |
|---|---|---|
| `--spec-draft-n-max 3` | ~18,7 tok/s | ~0,45 |
| `--spec-draft-n-max 6` | más lento | ~0,25 |

## Requisitos de hardware

- VRAM para inferencia: 15,7 GiB de pesos en Q4_K_M; con KV cache a 32.768 tokens y buffers de cómputo se recomienda un mínimo de 20-22 GB para operar con holgura.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), RTX 2080 Ti modificada a 22 GB; en el extremo superior, A100/H100 para mayor concurrencia y contexto.
- Cabe en GPU consumer de gama alta (3090/4090) y en configuraciones de 22 GB; no cabe en GPUs de 16 GB o menos sin offloading a CPU.
- Opciones de despliegue: llama.cpp (`llama-server` con `-ngl 99 -fa on --jinja --spec-type draft-mtp`); compatible con endpoints OpenAI. Otros runners (vLLM, TGI) no están documentados para este GGUF con MTP.
- Throughput medido: ~18,7 tok/s de decodificación en GB10 con `--spec-draft-n-max 3`; latencia y throughput en otras GPUs no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwable-3.6-27b-abliterated Q4_K_M (este) | 27,3B | 32.768 (config. autor) | GGUF 15,7 GiB | MIT | Abliterated + MTP integrado |
| huihui-ai/Huihui-Qwable-3.6-27b-abliterated-MTP-GGUF (Q4_K_M_F16) | 27,3B | no disponible | GGUF 25,9 GiB | MIT | Misma base, mayor precisión, no cabe en 24 GB con margen |
| huihui-ai/Huihui-Qwable-3.6-27b-abliterated-MTP-GGUF (Q4_K_M_Q8) | 27,3B | no disponible | GGUF 19,1 GiB | MIT | Misma base, precisión intermedia |
| Mia-AiLab/Qwable-3.6-27b | 27,3B | no disponible | safetensors (BF16) | no disponible | Modelo SFT/distill original, sin abliteration ni MTP |

No se dispone de datos de benchmarks que permitan comparar calidad entre estas variantes.

## Limitaciones y advertencias

- Modelo abliterated: la eliminación de la dirección de rechazo reduce las salvaguardas internas; puede producir contenido sensible o inapropiado sin filtros externos. No recomendado para exposición directa a usuarios finales sin moderación.
- Riesgo de alucinación inherente a un modelo destilado de 27B; no se han publicado evaluaciones de fidelidad factual.
- La aceptación del draft especulativo (~0,45) es notablemente inferior a la de Qwen3.6 vanilla (~0,75), lo que limita la ganancia de throughput de la especulación MTP.
- Con thinking activado, las trazas de Fable pueden exponer nombres internos de herramientas en la salida de razonamiento, lo que puede filtrar detalles de implementación; se recomienda desactivar thinking en flujos con tool calling.
- Idiomas soportados no documentados; el comportamiento multilingüe no está garantizado más allá del inglés y chino esperables del linaje Qwen.
- La reproducibilidad exacta del build no está garantizada: no se registraron el commit upstream exacto ni el comando de cuantización, por lo que no es posible reconstruir los pesos de forma determinista.
- El contexto de 32.768 tokens es la configuración de referencia del autor, no necesariamente el máximo nativo del modelo base; contextos mayores no están validados.
- Aunque la licencia es MIT, la procedencia de los datos de destilación (trazas de Claude Fable-5) puede plantear cuestiones de cumplimiento que el usuario debe evaluar por su cuenta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/coolthor/Huihui-Qwable-3.6-27b-abliterated-Q4_K_M-MTP-GGUF
- Modelo base inmediato (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwable-3.6-27b-abliterated-MTP-GGUF
- Modelo upstream (Mia-AiLab): https://huggingface.co/Mia-AiLab/Qwable-3.6-27b
- Perfil del autor de la cuantización: https://huggingface.co/coolthor
- Blog del autor con benchmarks y notas: https://ai-muninn.com
- Revisión fijada del release: https://huggingface.co/coolthor/Huihui-Qwable-3.6-27b-abliterated-Q4_K_M-MTP-GGUF/tree/557af03fbfc35ccc237abeb0d5ee7eaa767b62be
