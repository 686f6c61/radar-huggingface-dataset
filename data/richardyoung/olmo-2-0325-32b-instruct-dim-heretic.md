# richardyoung/OLMo-2-0325-32B-Instruct-DiM-heretic

## Resumen

OLMo-2-0325-32B-Instruct-DiM-heretic es una variante "abliterated" (decensored) del modelo OLMo-2-0325-32B-Instruct desarrollado por el Allen Institute for AI (Ai2), publicada por el usuario richardyoung mediante la herramienta Heretic v2.0.0. El objetivo de esta modificacion es reducir los rechazos (refusals) del modelo original ante peticiones que este declinaria, aplicando una intervencion sobre las direcciones de activacion en las capas de atencion y MLP sin reentrenar los pesos.

El modelo base es un transformer denso de 32.234.279.936 parametros (aproximadamente 32B), entrenado sobre el dataset Dolma y post-entrenado con SFT (variante de Tülu 3), DPO y RLVR sobre el dataset allenai/RLVR-GSM-MATH-IF-Mixed-Constraints. OLMo 2 se caracteriza por ser completamente abierto: pesos, codigo, checkpoints intermedios y logs de entrenamiento estan publicados, lo que lo convierte en una referencia para investigacion en IA abierta.

Esta variante concreta es relevante para quienes necesitan un modelo de 32B con menor tasa de rechazos para tareas de generacion abierta, investigacion sobre alineamiento o evaluacion de robustez. La intervencion reduce los refusals de 98/100 a 32/100 con una divergencia KL de 0.0887 respecto al modelo original, un coste moderado en terminos de distribucion de salida. La licencia se mantiene en Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (OLMo 2) |
| Parametros totales | 32.234.279.936 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base OLMo-2-0325-32B-Instruct es un transformer denso de aproximadamente 32B parametros entrenado sobre el corpus Dolma (datos publicos, sinteticos y creados por humanos). Su post-entrenamiento sigue tres fases: SFT sobre una variante especifica de OLMo del dataset Tülu 3, DPO sobre allenai/olmo-2-0325-32b-preference-mix y, finalmente, RLVR (Reinforcement Learning with Verifiable Rewards) sobre allenai/RLVR-GSM-MATH-IF-Mixed-Constraints, orientado a matematicas, GSM8K e instrucciones con restricciones.

La modificacion "heretic" no reentrena el modelo: aplica abliteration, una tecnica que identifica direcciones de activacion asociadas a comportamientos de rechazo y las proyecta fuera durante la inferencia o mediante ajuste de pesos. Los parametros publicados incluyen direction_index 51.13, pesos maximos y minimos para attn.o_proj (1.37 / 1.03) y mlp.down_proj (1.39 / 1.24), con posiciones y distancias especificas. El proceso es reproducible segun el autor, con un directorio `reproduce` en el repositorio.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat `<|user|> ... <|assistant|> ... <|endoftext|>`.
- Razonamiento matematico y resolucion de problemas (GSM8K, MATH) heredado del entrenamiento RLVR del modelo base.
- Seguimiento de instrucciones con restricciones (IFEval).
- Razonamiento multi-paso y tareas de tipo BBH y DROP (segun benchmarks del modelo base).
- Reduccion significativa de rechazos: 32/100 refusals frente a 98/100 del original.
- No se documenta soporte explicito de tool calling, function calling, vision, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar el efecto de la abliteration comparando distribuciones de salida (KL 0.0887) y tasas de rechazo frente al original, util para papers sobre robustez de salvaguardas.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde el modelo original declinaria la peticion.
- Evaluacion de red teaming: uso como sujeto de pruebas para medir la eficacia de clasificadores de seguridad o filtros de contenido en pipelines de moderacion.
- Analisis de sesgos: al reducir los rechazos, expone con mayor facilidad las respuestas estereotipadas o problematicas del modelo base, facilitando auditorias.
- Fine-tuning posterior para dominios especializados: al ser Apache 2.0 y safetensors, se puede ajustar sobre datos propios sin restricciones de licencia, partiendo de un modelo con menor friccion conversacional.
- Generacion de datos sinteticos para entrenamiento: util para producir datasets diversos en dominios donde el modelo original se negaria a generar ejemplos.
- Despliegue en entornos controlados de investigacion donde se requiere un asistente conversacional de 32B sin capa de rechazo, con monitorizacion externa.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (OLMo-2-0325-32B-Instruct) |
|---|---|---|
| Refusals | 32/100 | 98/100 |
| KL divergence | 0.0887 | 0 (por definicion) |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para esta variante concreta. Los benchmarks del modelo base estan disponibles en la model card de allenai/OLMo-2-0325-32B-Instruct.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 64 GB (32B parametros x 2 bytes), mas overhead de activaciones y KV cache.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 32-36 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 18-22 GB.
- GPU recomendadas: A100 80GB, H100 80GB para precision completa; 2x A100 40GB o 2x RTX 4090 24GB con tensor parallelism para BF16; una sola RTX 4090 24GB o RTX 3090 24GB es viable solo con cuantizacion 4 bits.
- Cabe en GPU de consumo (RTX 4090, 3090) unicamente con cuantizacion agresiva (4 bits) y contexto reducido.
- Opciones de despliegue: transformers (requiere version main de transformers para soporte OLMo 2), vLLM, llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo), TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Tamano del repositorio: 64.5 GB (pesos en safetensors, probablemente BF16).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OLMo-2-0325-32B-Instruct-DiM-heretic (este) | 32B | no disponible | Apache 2.0 | Abliterated, refusals 32/100 |
| allenai/OLMo-2-0325-32B-Instruct | 32B | no disponible | Apache 2.0 | Modelo base, refusals 98/100 |
| Mistral-Nemo-Instruct-2407 | ~12B | no disponible | Apache 2.0 | Alternativa abierta de menor tamano |
| GPT-4o Mini | no disponible | no disponible | Propietaria | Referencia de API cerrada |

La comparacion con modelos abliterated equivalentes de 32B no esta disponible en la informacion proporcionada. La eleccion entre este modelo y el original depende del requisito de filtrado: para produccion con moderacion, el original es preferible; para investigacion o generacion sin restricciones, esta variante.

## Limitaciones y advertencias

- La abliteration elimina parcialmente las salvaguardas del modelo base: puede generar contenido problematico, ofensivo o danino, especialmente si se le induce.
- El modelo base OLMo 2 tiene entrenamiento de seguridad limitado y no incluye filtrado en bucle como ChatGPT; esta variante agrava esa situacion.
- Riesgo de alucinacion inherente a modelos de 32B, no mitigado por la modificacion.
- Soporte unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- La divergencia KL de 0.0887 indica que la distribucion de salida se ha alterado respecto al original, lo que puede degradar capacidades en tareas especificas no evaluadas.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo decensored conlleva riesgos legales y reputacionales; se recomienda moderacion externa en produccion.
- No se han publicado evaluaciones de seguridad ni benchmarks estandar para esta variante concreta.
- La reproducibilidad depende del directorio `reproduce` del repositorio, cuya verificacion independiente no esta documentada en la informacion disponible.
- El modelo fue creado en 2026-11-05 y no registra descargas ni likes, por lo que su validacion por la comunidad es nula.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/richardyoung/OLMo-2-0325-32B-Instruct-DiM-heretic
- Modelo base: https://huggingface.co/allenai/OLMo-2-0325-32B-Instruct
- Modelo base (checkpoint): https://huggingface.co/allenai/OLMo-2-0325-32B/
- Heretic: https://heretic-project.org
- Paper OLMo 2: https://arxiv.org/abs/2501.00656
- Paper Tülu 3: https://arxiv.org/abs/2411.15124
- Proyecto OLMo: https://allenai.org/olmo
- Repositorio OLMo-core: https://github.com/allenai/OLMo-core
- Repositorio de evaluacion OLMES: https://github.com/allenai/olmes
- Repositorio open-instruct: https://github.com/allenai/open-instruct
- Demo: https://playground.allenai.org/
- Dataset SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture
- Dataset DPO: https://huggingface.co/datasets/allenai/olmo-2-0325-32b-preference-mix
- Dataset RLVR: https://huggingface.co/datasets/allenai/RLVR-GSM-MATH-IF-Mixed-Constraints
