# Akvlt88/Qwen2.5-Coder-14B-Instruct-heretic

## Resumen

Akvlt88/Qwen2.5-Coder-14B-Instruct-heretic es una variante "abliterated" (decensurada) del modelo Qwen2.5-Coder-14B-Instruct desarrollado originalmente por Alibaba Cloud (equipo Qwen). El autor del fine-tune, Akvlt88, ha aplicado la herramienta Heretic v2.1.0 para eliminar los comportamientos de rechazo del modelo original mediante una tecnica de ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 3 a 40 del transformer, preservando el resto de capacidades del modelo base.

El modelo hereda la arquitectura del Qwen2.5-Coder-14B-Instruct: un transformer causal denso de 14.770 millones de parametros totales (13.100 millones sin embeddings), 48 capas, atencion con GQA (40 cabezas de query y 8 de key/value), RoPE, SwiGLU, RMSNorm y sesgo en las proyecciones QKV. El contexto nativo es de 32.768 tokens, extensible hasta 131.072 mediante YaRN, y el modelo fue entrenado originalmente sobre 5,5 billones de tokens centrados en codigo, texto-codigo y datos sinteticos.

La relevancia de esta variante reside en que reduce drasticamente las tasas de rechazo (de 100/100 a 17/100 en la evaluacion del autor) manteniendo una divergencia KL de solo 0,0162 respecto al modelo original, lo que sugiere que la mayor parte del comportamiento se preserva. Esta pensada para desarrolladores que necesitan un modelo de codigo sin filtros de contenido para tareas de analisis de seguridad, generacion de codigo ofensivo controlado o investigacion sobre alineamiento. La licencia Apache 2.0 se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen2) con RoPE, SwiGLU, RMSNorm, GQA y sesgo QKV |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN (factor 4.0) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors, probablemente bf16/fp16) |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Capas | 48 |
| Cabezas de atencion | 40 (Q) / 8 (KV), GQA |
| Parametros sin embeddings | 13,1 B |
| Tamano del repo | 29,6 GB |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-Coder-14B-Instruct original: un transformer causal denso con 48 capas, normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con grouped-query attention (40 cabezas de query y 8 de key/value). El modelo base fue preentrenado por Alibaba sobre 5,5 billones de tokens que incluyen codigo fuente, datos de grounding texto-codigo y datos sinteticos, seguido de una fase de post-entrenamiento con instrucciones y preferencias (no se detalla en la informacion disponible si se uso RLHF, DPO u otra tecnica concreta).

La intervencion de Akvlt88 se realizo con Heretic v2.1.0 aplicando Arbitrary-Rank Ablation sobre las capas 3 a 40, con los parametros `start_layer_index=3`, `end_layer_index=40`, `preserve_good_behavior_weight=0.1530`, `steer_bad_behavior_weight=0.0001`, `overcorrect_relative_weight=0.8541` y `neighbor_count=2`. Esta tecnica modifica los pesos del modelo para eliminar direcciones asociadas a comportamientos de rechazo, manteniendo la divergencia KL baja respecto al original. El autor indica que el proceso es reproducible y publica instrucciones en el directorio `reproduce/` del repositorio.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, con enfasis en Python, JavaScript, TypeScript, Java, C++, Go y Rust.
- Razonamiento sobre codigo: explicacion de fragmentos, deteccion de bugs y propuesta de correcciones.
- Reparacion de codigo (code fixing) y refactorizacion guiada por instrucciones.
- Generacion de tests unitarios y documentacion tecnica a partir de codigo existente.
- Razonamiento matematico y resolucion de problemas algoritmicos, heredado del modelo base.
- Soporte de conversacion multi-turno con plantilla de chat (`apply_chat_template`).
- Capacidad de contexto largo (hasta 131.072 tokens con YaRN) para analisis de repositorios completos o archivos extensos.
- Comportamiento decensurado: reduce rechazos en peticiones que el modelo original bloquearia (17/100 frentes a 100/100).
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible; el modelo base Qwen2.5-Coder-Instruct lo soporta, pero la ablacion podria afectar al formato.
- Capacidades de agente multi-paso: no confirmadas en la informacion disponible para esta variante.

## Casos de uso

- Analisis de seguridad ofensiva controlado: el modelo puede generar payloads, explicar tecnicas de explotacion y redactar pruebas de concepto en entornos de pentesting autorizados, algo que el modelo original rechazaria. Adecuado por su naturaleza decensurada y su conocimiento de codigo.
- Investigacion sobre alineamiento y robustez: util para estudiar como la ablacion afecta al comportamiento del modelo, comparando respuestas con el original y midiendo divergencia KL. El autor proporciona parametros reproducibles.
- Generacion de codigo en produccion sin filtros de contenido: integrable en pipelines de CI/CD o asistentes de IDE donde las politicas de rechazo del modelo base interrumpen tareas legitimas (por ejemplo, generacion de exploits de prueba o scripts de fuzzing).
- Analisis de repositorios extensos: gracias a los 131.072 tokens de contexto con YaRN, puede procesar archivos grandes o conjuntos de archivos para tareas de revision, documentacion o migracion.
- Generacion de tests y documentacion tecnica: a partir de funciones o modulos, el modelo produce tests unitarios y comentarios explicativos, aprovechando su entrenamiento especifico en codigo.
- Refactorizacion y reparacion de codigo legacy: el modelo puede recibir un fragmento con errores y devolver una version corregida, util en tareas de mantenimiento de bases de codigo antiguas.
- Educacion y experimentacion: investigadores pueden desplegarlo localmente para estudiar el efecto de la ablacion en tareas de codigo sin depender de APIs externas.

## Benchmarks y rendimiento

La model card del autor solo reporta dos metricas comparativas respecto al modelo original:

| Metrica | Este modelo | Qwen2.5-Coder-14B-Instruct original |
|---|---|---|
| Rechazos (Refusals) | 17/100 | 100/100 |
| Divergencia KL | 0,0162 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MBPP, etc.) en la informacion disponible para esta variante. El modelo base Qwen2.5-Coder-14B-Instruct reporta resultados en el blog oficial de Qwen, pero no se reproducen aqui al no estar incluidos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 29-30 GB solo para pesos, mas overhead de activaciones y cache KV (dependiente del contexto).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 15-16 GB.
- VRAM estimada en cuantizacion 4 bits (GGUF/AWQ/GPTQ): aproximadamente 8-9 GB.
- GPU recomendadas para bf16: NVIDIA A100 40GB, A100 80GB, H100 80GB, o multiples RTX 4090 (24 GB) en tensor parallelism.
- Cabe en consumer GPU: si, en RTX 4090 (24 GB) con cuantizacion 4 u 8 bits; en RTX 3090 (24 GB) igual; en GPUs de 16 GB solo con cuantizacion 4 bits agresiva y contexto reducido.
- Opciones de despliegue: transformers (recomendado por el autor), vLLM (soporta YaRN estatico), text-generation-inference (tag `text-generation-inference` presente), llama.cpp/Ollama si se generan GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada. El modelo base tiene benchmarks de velocidad en la documentacion de Qwen, pero no se trasladan automaticamente a esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Akvlt88/Qwen2.5-Coder-14B-Instruct-heretic | 14,77 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Variante decensurada, 17/100 rechazos, KL 0,0162 |
| Qwen/Qwen2.5-Coder-14B-Instruct | 14,77 B | 32.768 (131.072 con YaRN) | Apache 2.0 | Modelo original, 100/100 rechazos, referencia de calidad |
| Qwen/Qwen2.5-Coder-32B-Instruct | 32,5 B | 131.072 | Apache 2.0 | Version mayor, mejor rendimiento en codigo, requiere mas VRAM |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 B (2,4 B activos, MoE) | 128 K | DeepSeek License | Alternativa MoE con menor coste de inferencia |

No se dispone de comparativas de rendimiento en benchmarks entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La ablacion elimina filtros de rechazo, lo que implica que el modelo puede generar contenido ofensivo, ilegal o peligroso si se le solicita. No debe desplegarse en aplicaciones publicas sin moderacion externa.
- La divergencia KL de 0,0162 indica cambios en la distribucion de salida; pueden aparecer degradaciones sutiles en tareas que no esten relacionadas con el codigo.
- El modelo solo declara soporte de ingles en la model card; el rendimiento en castellano no esta verificado y podria ser inferior al del modelo original.
- Riesgo de alucinacion en generacion de codigo: como cualquier LLM, puede inventar APIs, funciones o librerias inexistentes; requiere validacion con tests.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue de un modelo decensurado conlleva responsabilidad legal sobre el contenido generado.
- El contexto nativo es de 32.768 tokens; para usar 131.072 hay que activar YaRN manualmente en `config.json`, lo que puede degradar el rendimiento en textos cortos (advertencia del propio autor del modelo base).
- No se han publicado benchmarks estandar para esta variante, por lo que su calidad en tareas de codigo no esta cuantificada mas alla de la metrica de rechazos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Akvlt88/Qwen2.5-Coder-14B-Instruct-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Heretic (herramienta de ablacion): https://heretic-project.org
- Blog de Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- Repositorio GitHub de Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Paper Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- Paper YaRN: https://arxiv.org/abs/2309.00071
- Paper Qwen2 (tecnico): https://arxiv.org/abs/2407.10671
- Qwen Chat: https://chat.qwenlm.ai/
