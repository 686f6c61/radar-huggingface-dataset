# aifeifei798/Qwen3.8-Queen-27B

## Resumen

Qwen3.8-Queen-27B es un fine-tune del modelo Qwen/Qwen3.8-27B, desarrollado por el usuario aifeifei798, especializado en roleplay, escritura creativa y narrativa inmersiva. El modelo está diseñado para eliminar disclaimers fuera de personaje (OOC) y moralizaciones no solicitadas, priorizando la fidelidad absoluta al personaje en contextos de ficción oscura, villanos complejos y diálogos con tensión psicológica. Se distribuye bajo licencia Apache-2.0 y está orientado a herramientas como SillyTavern, LM Studio, Ollama y vLLM.

El modelo base Qwen3.8-27B es un modelo de lenguaje causal denso de 27.000 millones de parámetros con encoder de visión, capaz de comprender imágenes y vídeo, con control flexible de razonamiento (thinking mode) y soporte para tareas agénticas de largo horizonte. El fine-tune Queen conserva la arquitectura y la lógica del base, pero ajusta el comportamiento hacia la generación narrativa sin restricciones estilísticas. El repositorio contiene pesos en formato safetensors con un tamaño de 55,6 GB.

La relevancia de este modelo radica en su enfoque de nicho: combina la capacidad de razonamiento y generación de código de un modelo de 27B con un ajuste específico para narrativa inmersiva, algo poco común en modelos de este tamaño. Sin embargo, carece de documentación técnica detallada sobre el proceso de entrenamiento, dataset utilizado o benchmarks publicados, lo que limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (causal LM) con vision encoder (base Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el base Qwen3.8-27B soporta hasta 1M en version cloud, pero no se especifica para este repo) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.8-27B, un transformer causal denso con encoder de visión integrado. El base incorpora control flexible de pensamiento (thinking mode activado por defecto, desactivable por petición), ajuste de profundidad de razonamiento mediante `reasoning_effort` y preservación de contexto de razonamiento histórico con `preserve_thinking`. El fine-tune Queen mantiene esta arquitectura, pero el autor no ha publicado detalles sobre el proceso de entrenamiento: no se especifica el número de tokens, la composición del dataset, ni si se utilizaron técnicas como RLHF o DPO. La model card indica que se trata de un "alignment-relaxed" (relajación de alineación) para eliminar disclaimers y moralizaciones, pero no se documenta la metodología exacta.

## Capacidades

- Generacion de texto narrativo y creativo: especializado en roleplay, ficcion oscura, personajes complejos y dialogo con tension psicologica.
- Razonamiento y logica: conserva las capacidades de razonamiento del base Qwen3.8-27B, incluyendo deduccion logica y generacion de codigo.
- Vision-language: al estar basado en Qwen3.8-27B, hereda la capacidad nativa de comprension de imagenes y video, aunque el fine-tune esta orientado a texto.
- Control de pensamiento: soporta thinking mode con ajuste de esfuerzo de razonamiento, desactivable por peticion.
- Tool calling y agentes: el base soporta tareas agénticas de largo horizonte y planificacion autonoma, aunque el fine-tune no documenta explicitamente esta capacidad.
- Multilingue: no se especifican idiomas soportados en la informacion disponible.

## Casos de uso

- Roleplay inmersivo en SillyTavern: el modelo esta optimizado para mantener la fidelidad al personaje sin romper la cuarta pared, ideal para sesiones de roleplay con tarjetas de personaje (character cards) y contextos largos.
- Escritura de ficcion oscura y grimdark: permite generar narrativa con villanos complejos, antiheroes y tension psicologica sin moralizaciones interrumpidoras, adecuado para autores que buscan un tono crudo.
- Dialogo con personajes filosoficos: el modelo maneja conversaciones con subtexto, ironia seca y matices psicologicos, util para simulaciones de personajes con visiones del mundo complejas.
- Generacion de documentacion tecnica estructurada: gracias a la retencion de logica del base, puede producir documentacion y codigo con precision, usando presets de temperatura baja (0.2-0.4).
- Prototipado de narrativa interactiva: desarrolladores de juegos de texto o ficcion interactiva pueden integrar el modelo via vLLM o llama.cpp para generar respuestas dinamicas de personajes no jugadores (NPC).
- Investigacion linguistica sobre narrativa generada: el modelo puede usarse en estudios academicos sobre estilos de escritura, caracterizacion y coherencia narrativa en modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas como MMLU, HumanEval o GSM8K, y el repositorio no proporciona comparativas con otros modelos. Se recomienda evaluar el modelo en tareas especificas de roleplay y escritura creativa mediante pruebas cualitativas antes de su uso en produccion.

## Requisitos de hardware

- VRAM estimada: con 27.781 millones de parametros en precision FP16, se requieren aproximadamente 55,6 GB de VRAM para inferencia sin cuantizacion. Con cuantizacion a 8 bits, se reduce a unos 28 GB; a 4 bits, unos 14 GB.
- GPU recomendadas: para FP16, se necesitan GPUs de datacenter como A100 (80 GB) o H100 (80 GB). Para cuantizacion 8 bits, una RTX 4090 (24 GB) no es suficiente; se requiere una A6000 (48 GB) o similar. Para 4 bits, una RTX 4090 o RTX 3090 (24 GB) puede ser suficiente.
- Compatibilidad con consumer GPU: solo con cuantizacion agresiva (4 bits) y usando llama.cpp u Ollama. No cabe en GPUs de 8-12 GB.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, llama.cpp, Ollama, LM Studio y text-generation-webui, segun la model card.
- Latencia y throughput: no se proporcionan datos especificos. Para un modelo de 27B en FP16 en A100, se estima un throughput de 20-40 tokens/s dependiendo de la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.8-Queen-27B | 27,8B | No disponible | Apache-2.0 | Roleplay y escritura creativa |
| Qwen/Qwen3.8-27B (base) | 27,8B | Hasta 1M (cloud) | Apache-2.0 | Generalista, vision-language, agentes |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 | Generalista, instruct |
| Mistral-7B-Instruct | 7B | 32K | Apache-2.0 | Generalista, instruct |

La comparativa se limita a caracteristicas generales, ya que no hay benchmarks publicados para Queen. Frente al base Qwen3.8-27B, Queen sacrifica la alineacion estandar en favor de la creatividad sin restricciones, pero mantiene la misma arquitectura y capacidades de razonamiento. Frente a modelos mas pequenos como Llama-3.1-8B o Mistral-7B, Queen ofrece mayor capacidad de razonamiento y contexto, pero requiere hardware significativamente mas potente.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune con "alignment-relaxed", el modelo puede generar contenido ofensivo, violento o sexualmente explicito sin filtros, lo que requiere moderacion externa en aplicaciones publicas.
- Riesgo de alucinacion: no se han evaluado tasas de alucinacion especificas; el base Qwen3.8-27B puede alucinar en tareas factuales, y el fine-tune prioriza la narrativa sobre la precision.
- Limitaciones de contexto: la longitud de contexto no esta documentada para este repo; si se usa el contexto del base (hasta 1M en cloud), el rendimiento local puede degradarse con ventanas muy largas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor declara que el uso previsto es para escritura creativa e investigacion; el usuario es responsable de cumplir las leyes locales.
- Caveat de produccion: no hay garantias de calidad en tareas tecnicas; el modelo esta optimizado para narrativa, y su rendimiento en codigo o matematicas depende del base, sin validacion especifica.
- Falta de documentacion: no se especifican datos de entrenamiento, lo que impide auditar posibles sesgos o duplicaciones de datos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aifeifei798/Qwen3.8-Queen-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Qwen Cloud (servicio gestionado del base): https://www.qwencloud.com/models/qwen3.8-27b
