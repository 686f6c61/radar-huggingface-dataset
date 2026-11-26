# electroglyph/LFM2.5-24B-A2B-uncensored

## Resumen

LFM2.5-24B-A2B-uncensored es una variante "decensored" del modelo LiquidAI/LFM2.5-24B-A2B, el miembro mas grande de la familia LFM2.5 de Liquid AI. El autor del reupload, electroglyph, ha aplicado la herramienta Heretic v2.0.0.dev0 para eliminar los comportamientos de rechazo del modelo original mediante una tecnica de ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) sobre las capas 7 a 29. El resultado es un modelo que mantiene la arquitectura y el conocimiento del original pero que reduce drasticamente las negativas a responder.

El modelo base es un transformer hibrido con mezcla de expertos (MoE) de 24.000 millones de parametros totales y unos 2.450 millones activos por token. Combina 30 bloques de convolucion corta con doble compuerta (double-gated short convolution) y 10 bloques de atencion GQA, con 64 expertos por bloque MoE y enrutamiento top-4. Su ventana de contexto alcanza los 131.072 tokens y fue entrenado con un presupuesto de 36 billones de tokens, lo que lo situa como un modelo orientado a agentes y despliegue en dispositivo (edge).

La relevancia de esta ficha radica en que documenta una modificacion no oficial (no publicada por Liquid AI) que altera el comportamiento de seguridad del modelo. Es util para investigadores que estudian alineamiento, ablacion de direcciones de rechazo y evaluacion de robustez, pero conlleva implicaciones de licencia y de uso responsable que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE (30 bloques de convolucion corta double-gated + 10 bloques GQA) |
| Parametros totales | 23.971.585.280 (~24,0B) |
| Parametros activos | ~2,45B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | FP8 (block-wise), GGUF (llama.cpp), MLX 4-bit, ONNX (segun variantes del modelo base) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (denominada "other" en el repo) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del LFM2.5-24B-A2B original: un diseno hibrido que intercala 30 bloques de convolucion corta con doble compuerta (una alternativa a la atencion completa que reduce coste computacional en secuencias largas) con 10 bloques de atencion con query agrupada (GQA). La capa MoE contiene 64 expertos por bloque con enrutamiento top-4, lo que explica la diferencia entre los 24B de parametros totales y los ~2,45B activos por token. El vocabulario es de 128.000 tokens y el modelo fue preentrenado con un presupuesto de 36 billones de tokens.

Sobre el entrenamiento del modelo base no se detalla en la informacion disponible la composicion exacta del dataset ni si hubo fases de RLHF o DPO, aunque la model card describe el checkpoint como "post-trained for agentic workloads", lo que sugiere un ajuste posterior orientado a tareas de agente y uso de herramientas. La innovacion principal de esta variante concreta es la aplicacion de Heretic v2.0.0.dev0, que realiza una ablacion de rango arbitrario (ARA) sobre las capas 7 a 29 con los parametros `preserve_good_behavior_weight=0.8479`, `steer_bad_behavior_weight=0.0002`, `overcorrect_relative_weight=0.9913` y `neighbor_count=6`. El autor indica que el proceso es reproducible mediante los ficheros del directorio `reproduce`.

## Capacidades

- Generacion de texto y razonamiento: el modelo "piensa antes de responder" (modo de razonamiento siempre activo), segun la model card del modelo base.
- Uso de herramientas y function calling: disenado para cargas de trabajo agenticas; la model card del original lo compara con Qwen3.6-35B-A3B en tareas de agente y tool-use.
- Razonamiento multi-paso y agentes: orientado a flujos agenticos en dispositivo.
- Capacidades multilingues en 16 idiomas, incluidos espanol, arabe, chino, japones, coreano, hindi y ruso.
- Reduccion de rechazos: la variante uncensored baja de 99/100 rechazos en el original a 8/100 en esta version (metrica del autor).
- No se documentan capacidades de vision ni audio; la model card del base lo describe como "text-only".

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la ablacion ARA sobre las capas 7-29 afecta a la tasa de rechazos (de 99/100 a 8/100) manteniendo una divergencia KL de 0,0333, util para analizar direcciones de rechazo en el espacio de activaciones.
- Evaluacion de robustez de filtros: sirve como modelo "adversario" controlado para probar clasificadores de contenido y sistemas de moderacion en pipelines de produccion.
- Agentes autonomos en dispositivo: con solo ~2,45B parametros activos y 131.072 tokens de contexto, es adecuado para agentes locales que necesitan razonamiento multi-paso y tool calling con latencia baja (la model card del base cita 184 tok/s en Apple M5 Max).
- Generacion de codigo y automatizacion: su soporte de function calling y contexto largo permite integrarlo en flujos de CI/CD o asistentes de desarrollo que requieren razonamiento sobre repositorios extensos.
- Atencion al cliente y conversacion multi-turno: la ventana de 131K tokens permite mantener historiales largos; no obstante, la ausencia de filtros de rechazo exige moderacion externa en produccion.
- Procesamiento multilingue: traduccion, resumen y extraccion de informacion en los 16 idiomas soportados, con especial utilidad para espanol y portugues en el mercado iberico y latinoamericano.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido editorial donde el modelo original rechazaria tematicas sensibles; requiere revision humana por las implicaciones de la licencia.

## Benchmarks y rendimiento

La informacion disponible solo incluye metricas del proceso de decensoring del autor, no benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) de esta variante concreta.

| Metrica | Este modelo | Modelo original (LiquidAI/LFM2.5-24B-A2B) |
|---|---|---|
| Rechazos (Refusals) | 8/100 | 99/100 |
| Divergencia KL | 0,0333 | 0 (por definicion) |

La model card del modelo base cita, sin tabla detallada en la informacion proporcionada, una puntuacion de 48,09 en LiveClaw frente a 38,19 de Qwen3.6-35B-A3B, y un rendimiento de hasta 1,7x mas rapido que MoEs comparables en dispositivo, con 184 tok/s en Apple M5 Max y hasta 21K tok/s de salida en una unica GPU NVIDIA B300. No se han publicado resultados de benchmarks estandar en la informacion disponible para esta variante.

## Requisitos de hardware

- VRAM estimada: en BF16 los ~24B parametros ocupan aproximadamente 48 GB de pesos; en FP8 unos 24 GB; en cuantizaciones GGUF de 4 bits, en torno a 13-14 GB. Estas cifras son estimaciones por tamano y no aparecen explicitadas en la informacion proporcionada.
- GPU recomendadas: NVIDIA B300 (citada por el autor para alto throughput), A100/H100 para servicio en BF16 o FP8, y GPUs consumer de 24 GB (RTX 4090) para cuantizaciones de 4 bits.
- Cabe en GPU consumer: si, con cuantizacion GGUF de 4 bits o MLX 4-bit en Apple Silicon (la model card del base cita MLX 4-bit para Mac).
- Opciones de despliegue: Transformers, vLLM, SGLang (formato nativo y FP8), llama.cpp y herramientas compatibles (GGUF), ONNX Runtime y MLX en Apple Silicon.
- Latencia y throughput: la model card del base reporta 184 tok/s en Apple M5 Max y hasta 21K tok/s de salida en una NVIDIA B300; no hay datos especificos de esta variante uncensored.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-uncensored (este) | ~24,0B | ~2,45B | 131.072 | lfm1.0 | Variante decensored con Heretic; 8/100 rechazos |
| LiquidAI/LFM2.5-24B-A2B | ~24,0B | ~2,45B | 131.072 | lfm1.0 | Original alineado; 99/100 rechazos |
| Qwen3.6-35B-A3B | ~35B | ~3B | no disponible | no disponible | Referencia citada por el autor; 38,19 en LiveClaw |

No se dispone de datos de benchmarks estandar para comparar rendimiento en tareas como MMLU o HumanEval entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La eliminacion de rechazos implica que el modelo puede generar contenido danino, ofensivo o ilegal; requiere moderacion externa obligatoria en cualquier despliegue publico.
- La ablacion ARA introduce una divergencia KL de 0,0333 respecto al original, lo que puede degradar sutilmente la calidad en tareas que dependian del comportamiento alineado.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad para esta variante.
- La licencia lfm1.0 del modelo base puede imponer restricciones al uso comercial y a la redistribucion de modificaciones; debe revisarse el fichero LICENSE antes de cualquier uso en produccion.
- Es una modificacion no oficial: no esta respaldada por Liquid AI y el autor del reupload no ofrece garantias.
- Capacidades limitadas a texto; no hay soporte de vision ni audio.
- El rendimiento multilingue puede variar entre los 16 idiomas declarados; no hay evaluaciones por idioma en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/electroglyph/LFM2.5-24B-A2B-uncensored
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Heretic: https://heretic-project.org
- Blog de Liquid AI sobre LFM2.5-24B-A2B: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Documentacion de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground de Liquid AI: https://playground.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Paper de referencia (arXiv:2511.23404): https://arxiv.org/abs/2511.23404
