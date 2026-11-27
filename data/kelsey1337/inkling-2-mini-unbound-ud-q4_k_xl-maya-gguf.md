# kelsey1337/Inkling-2-Mini-Unbound-UD-Q4_K_XL-Maya-GGUF

## Resumen

Inkling-2-Mini-Unbound-UD-Q4_K_XL-Maya-GGUF es una cuantización GGUF Q4_K_XL del modelo Inkling-2-Mini-Unbound, una variante "abliterated" (sin direcciones de rechazo) del modelo base Inkling-2-Mini de Thinking Machines. El autor, kelsey1337, ha injertado (graft) los pesos de atención modificados de Unbound sobre la cuantización UD-Q4_K_XL de Unsloth, preservando el layout GGUF antiguo ("looped") que consume el motor Maya `maya-ik2`. Se publican dos variantes: v1.0, que elimina la dirección de rechazo de 20 pesos de atención, y v2, que añade un fine-tune de auto-destilación.

El modelo subyacente es un transformer con arquitectura MoE (mezcla de expertos), con aproximadamente 26.070 millones de parámetros totales, ventana de contexto de 256K tokens y soporte de imágenes. Está pensado para inferencia en una única RTX 4090 con decodificación especulativa mediante el drafter DSpark, alcanzando entre 197 y 244 tokens por segundo según el autor. La licencia es Apache 2.0.

Su relevancia radica en que ofrece una versión sin censura (uncensored/abliterated) de un modelo MoE de 26B con contexto largo, empaquetada para un motor concreto (Maya) y con métricas de deriva (perplejidad) publicadas, lo que permite evaluar el coste de eliminar los rechazos antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (arch GGUF `inkling2`, layout antiguo de Unsloth), 24 capas |
| Parametros totales | 26.070.390.272 (~26,07 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | Q4_K_XL (UD, Unsloth Dynamic); atención en Q8_0; expertos NVFP4 en capas 0-19 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos ficheros de 17,6 GB cada uno) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 24 capas y aproximadamente 26B parámetros totales. La cuantización de la que parte emplea expertos en NVFP4 para las capas 0-19 y atención en Q8_0. El layout GGUF corresponde a la arquitectura `inkling2` en el formato "looped" antiguo de Unsloth, con `loop_msg_query` por bloque, que es el que lee el motor Maya `maya-ik2`. Para llama.cpp mainline existe una versión alternativa con arquitectura `inkling2_loop`.

El proceso de creación no es un entrenamiento desde cero, sino un injerto de tensores. El autor comparó byte a byte y por coseno cada tensor de atención del safetensors de Unbound contra el original para determinar qué se había modificado. En v1.0 solo cambian `wo_ud` (equivalente a `attn_output`) en las capas 4-23, 20 tensores en total. En v2 cambian `wq_du`, `wk_dv`, `wv_dv`, `wo_ud` y `gate_attn` (`attn_q`, `attn_k`, `attn_v`, `attn_output`, `attn_gate`) en las 24 capas, 120 tensores, con deltas de fine-tune y coseno ≈ 0,9998 respecto al original. El injerto se valida exigiendo un coseno mínimo de 0,9974 entre el tensor dequantizado de Unsloth y el de Unbound antes de escribir, y el script aborta por debajo de 0,5. Cada tensor reemplazado se cuantiza a Q8_0; el resto se copia byte a byte y se añade un marcador `general.heretic_graft` que identifica la revisión de origen.

La variante v2 incorpora además un fine-tune de auto-destilización ("stop dodging") realizado por nokeepai sobre el modelo Unbound, no por el autor de esta cuantización. El modelo base incluye un drafter de decodificación especulativa DSpark (`mtp.safetensors`) que el motor Maya puede usar para acelerar la generación.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de 256K tokens.
- Procesamiento de imágenes (el modelo base soporta entrada visual según la model card).
- Modo de razonamiento ("thinking") activable y desactivable, con esfuerzo configurable.
- Operación sin rechazos (uncensored/abliterated): las variantes v1.0 y v2 eliminan o atenúan las direcciones de rechazo en los pesos de atención.
- Decodificación especulativa mediante el drafter DSpark, con rendimiento de 197-244 t/s en una RTX 4090.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo permite estudiar cómo afecta la eliminación de la dirección de rechazo al comportamiento del modelo, con métricas de perplejidad publicadas (+0,6% en v1.0, +4,2% en v2) que cuantifican la deriva respecto al original.
- Evaluación comparativa de técnicas de abliteration: al existir tres variantes (stock, heretic y Unbound v1.0/v2) con el mismo layout, se pueden comparar directamente en el mismo motor y hardware.
- Despliegue en una única RTX 4090: con 17,6 GB por fichero y cuantización Q4_K_XL, cabe en la VRAM de 24 GB de una RTX 4090, lo que permite ejecutar un MoE de 26B con contexto de 256K en hardware de consumo.
- Generación de texto creativo sin restricciones de contenido: para aplicaciones de ficción, guiones o narrativa donde los rechazos del modelo base resultan un obstáculo, aceptando el coste de perplejidad documentado.
- Procesamiento de documentos largos con imágenes: la ventana de 256K tokens y el soporte visual permiten analizar documentos extensos que combinan texto e imágenes en una sola pasada.
- Desarrollo y prueba de motores de inferencia: el layout Maya `inkling2` sirve para validar el motor `maya-ik2` y su integración con el drafter DSpark, midiendo throughput y latencia en condiciones reales.
- Chat conversacional de bajo coste: con 197-244 t/s en una sola GPU consumer, es viable para prototipos de asistentes conversacionales que requieran respuestas rápidas y contexto amplio.

## Benchmarks y rendimiento

| Metrica | Stock Unsloth UD-Q4_K_XL | Heretic graft | Unbound v1.0 | Unbound v2 |
|---|---|---|---|---|
| Perplejidad (8 × 2048, corpus técnico local) | 4,9112 ± 0,130 | 4,9355 (+0,5%) | 4,9415 (+0,6%) | 5,1192 (+4,2%) |
| Thinking off: rechazos / evasivas (de 36) | rechaza | 0 / 3 | 1 / 7 | 3 / 6 |
| Thinking on: rechazos / evasivas (de 36) | rechaza | 1 / 9 | 0 / 8 | 0 / 8 |
| Throughput (RTX 4090, drafter DSpark) | no disponible | no disponible | no disponible | 197-244 t/s |

El autor señala que el +4,2% de perplejidad de v2 se debe al modelo, no al injerto: los mismos 120 tensores injertados en el layout mainline y ejecutados con llama.cpp mainline dan 5,1006 frente a 4,9017 stock (+4,1%). nokeep reporta además una divergencia KL de 0,032 para v2 frente a 0,010 para v1.0. Con temperatura 0, v2 entró en bucles de repetición en 4 de 36 respuestas con thinking activado; con la temperatura recomendada de 1,0, en 0 de 36.

## Requisitos de hardware

- VRAM estimada: 17,6 GB por fichero GGUF Q4_K_XL, más overhead de contexto KV; el autor lo ejecuta en una RTX 4090 de 24 GB.
- GPU recomendadas: RTX 4090 (validada por el autor con 197-244 t/s). Para otras GPU no hay datos publicados.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB). Para GPUs de 16 GB o menos no hay datos que confirmen que quepa con contexto completo.
- Opciones de despliegue: motor Maya `maya-ik2` (layout `inkling2` antiguo). Para llama.cpp mainline se debe usar la versión de nokeep (`Inkling-2-Mini-Unbound-GGUF`) con arquitectura `inkling2_loop`. vLLM, Ollama y TGI: no disponible.
- Latencia y throughput: 197-244 t/s en una RTX 4090 con el drafter DSpark, según el autor. No hay datos de latencia por petición ni de throughput en otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Unbound v1.0/v2 (esta ficha) | ~26,07 B | 256K | Apache 2.0 | GGUF (Maya) | Abliterated con métricas de perplejidad |
| Inkling-2-Mini-heretic (yanauto, graft de kelsey1337) | ~26,07 B | 256K | Apache 2.0 | GGUF (Maya y mainline) | Abliteration solo de atención; +0,5% PPL |
| Inkling-2-Mini stock (Unsloth UD-Q4_K_XL) | ~26,07 B | 256K | Apache 2.0 | GGUF (ambos layouts) | Modelo original con rechazos; PPL 4,9112 |
| Inkling-2-Mini (Thinking Machines) | ~26,07 B | 256K | no disponible | safetensors / NVFP4 | Modelo base original |

La comparativa se limita a variantes del mismo modelo base, que es la información disponible. No se dispone de datos de benchmarks frente a modelos de otras familias.

## Limitaciones y advertencias

- La eliminación de rechazos implica una pérdida de seguridad: el modelo puede generar contenido que el original rechazaría, sin filtros de alineación.
- v2 presenta un +4,2% de perplejidad respecto al stock, lo que indica una deriva medible en la calidad del lenguaje; v1.0 es más conservador (+0,6%).
- Con temperatura 0, v2 entra en bucles de repetición en respuestas con thinking activado; el autor recomienda temperatura 1,0.
- v2 razona durante más tokens con esfuerzo alto: 1 de 36 respuestas alcanzó el límite de 3.072 tokens.
- El layout GGUF es el antiguo de Unsloth (`inkling2`), incompatible con llama.cpp mainline; para ese motor hay que usar la versión de nokeep.
- La evaluación del autor se basa en 36 prompts y un corpus técnico local de 8 × 2048; no resuelve la diferencia de "respuesta útil" reportada por nokeep, que dispone de la evaluación real con 277 prompts.
- No hay información sobre sesgos, idiomas soportados ni rendimiento en tareas de código o matemáticas.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin censura puede incumplir políticas de plataformas o normativa según el contexto de despliegue.
- El modelo base y las variantes injertadas no han pasado por evaluaciones de seguridad publicadas en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kelsey1337/Inkling-2-Mini-Unbound-UD-Q4_K_XL-Maya-GGUF
- Modelo base Unbound: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- GGUF de Unbound para llama.cpp mainline: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound-GGUF
- Cuantizaciones Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Modelo original de Thinking Machines: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante heretic de yanauto: https://huggingface.co/yanauto/Inkling-2-Mini-heretic
- Graft heretic en layout Maya: https://huggingface.co/kelsey1337/Inkling-2-Mini-heretic-UD-Q4_K_XL-Maya-GGUF
- Graft heretic en layout mainline: https://huggingface.co/kelsey1337/Inkling-2-Mini-heretic-GGUF
- Motor Maya `maya-ik2`: https://github.com/alesha-pro/maya-inkling-mini
- Pull request de llama.cpp para `inkling2_loop`: https://github.com/ggml
