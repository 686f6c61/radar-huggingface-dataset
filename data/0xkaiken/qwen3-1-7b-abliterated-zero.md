# 0xkaiken/Qwen3-1.7B-Abliterated-Zero

## Resumen

Qwen3-1.7B-Abliterated-Zero es un derivado del modelo Qwen/Qwen3-1.7B en el que el autor (0xkaiken) ha aplicado una edicion permanente de pesos para eliminar los circuitos de rechazo (refusal) del modelo base. La intervencion se basa en el protocolo OBLITERATUS y en tecnicas de ingenieria de representaciones: se extrae una direccion global de rechazo en la capa 18 y se proyecta fuera de los escritores del flujo residual, sin hooks en tiempo de ejecucion ni vectores de steering.

El modelo conserva la arquitectura original de Qwen3 (28 capas, hidden size 2048, 16 cabezas de atencion y 8 cabezas KV, vocabulario de 151.936 tokens) y sus 1.720.574.976 parametros. La relevancia de esta ficha no esta en el rendimiento bruto, sino en el aspecto de investigacion: es un ejemplo documentado de cirugia de pesos orientada a mecanistica de la interpretabilidad, con evaluacion cuantitativa del trade-off entre supresion de rechazos y degradacion de perplejidad.

El autor reporta una tasa de no rechazo del 99,71% sobre 342 prompts estrictamente reservados, con una perplejidad de 0,975x respecto al modelo original. El modelo se distribuye en safetensors y GGUF Q8_0 (1,83 GB), con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3ForCausalLM), 28 capas |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | GGUF Q8_0 (verificado); BF16 en safetensors |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |
| Hidden size | 2048 |
| Intermediate size | 6144 |
| Cabezas de atencion / KV | 16 Q / 8 KV |
| Vocabulario | 151.936 (dato truncado en la model card; valor de referencia de Qwen3-1.7B) |
| Revision del modelo base | 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-1.7B sin modificaciones estructurales: un transformer decoder-only denso de 28 capas con atencion agrupada (GQA, 16 cabezas de consulta y 8 de clave-valor), hidden size de 2048 e intermediate size de 6144. No hay cambios en el grafo computacional ni se anaden modulos; la unica diferencia respecto al original son los valores de los pesos.

El proceso de edicion, segun la model card, consta de cuatro pasos. Primero, se sondearon 500 prompts del split `qwen38-v1:train` con `enable_thinking=False` y se aislaron los 235 que disparaban rechazo duro o condescendiente. Segundo, se extrajo una unica direccion rank-1 mediante diferencia de medias (`diff_means`) en la capa 18, identificada como la cresta de rechazo del modelo. Tercero, se proyecto esa direccion fuera de los escritores del flujo residual (`self_attn.o_proj` y `mlp.down_proj`) en las capas 1 a 27 con alpha=1,25, seguido de restauracion de norma L2 por columnas para preservar las magnitudes de las features. Cuarto, se proyecto la matriz compartida `embed_tokens`/`lm_head` con alpha=0,50. Todo el proceso de extraccion, barrido de 30 configuraciones, validacion y conversion a GGUF Q8_0 se ejecuto en una unica GPU de consumo (RTX 4050 Laptop, 6 GB, bfloat16).

El autor documenta explicitamente dos fracasos previos: el enfoque estandar limitado a 5 capas con regularizacion 0,3 dejaba intactos los circuitos de evasion en las capas 12-17 y 22-26, y el SVD con blanqueamiento de covarianza fallaba por deficiencia de rango (680 muestras frente a 2048 dimensiones, numero de condicion 9,4e9), degradando la perplejidad a 1,561x.

## Capacidades

- Generacion de texto conversacional en ingles y otros idiomas (etiqueta `multilingual`), heredada de Qwen3-1.7B.
- Respuesta sin rechazo ante prompts de las ocho categorias evaluadas (T1-T8): estandar, elevado, maximo, ciber y digital, armas y violencia, fraude y manipulacion, CBRN e infraestructura critica, y extendida.
- Razonamiento y generacion de codigo en la medida en que lo permite un modelo de 1,7 mil millones de parametros.
- Compatible con `llama.cpp` / `llama-server` y con el ecosistema transformers y text-generation-inference (etiqueta `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion proporcionada.
- No se documenta modo thinking activo; las evaluaciones se realizaron con `enable_thinking=False`.

## Casos de uso

- Investigacion en mecanistica de la interpretabilidad: el modelo sirve como caso controlado para estudiar como se representa el rechazo en el espacio de activaciones de un transformer pequeno, comparando la capa 18 del original con la del derivado.
- Evaluacion de tecnicas de edicion de pesos: permite reproducir el protocolo OBLITERATUS y comparar estrategias (proyeccion simple frente a SVD blanqueado) midiendo el impacto en perplejidad y en tasa de cumplimiento.
- Generacion de texto sin filtros en entornos de investigacion cerrados: util para estudiar el comportamiento del modelo en dominios donde el modelo base se niega sistematicamente a responder, con fines de analisis de sesgos y robustez.
- Red teaming y evaluacion de seguridad: al carecer de circuitos de rechazo, es un sujeto de prueba util para validar clasificadores de contenido y sistemas de moderacion externos.
- Despliegue ligero en hardware de consumo: con 1,83 GB en Q8_0 y ejecucion verificada en una RTX 4050 de 6 GB, es viable para prototipos locales de generacion de texto.
- Analisis de degradacion por cuantizacion: el autor reporta que las ediciones se conservan intactas en Q8_0, lo que lo convierte en un banco de pruebas para estudiar la interaccion entre cirugia de pesos y cuantizacion.
- Experimentos de alineacion y desalineacion: permite comparar respuestas del modelo original y del derivado sobre el mismo prompt para aislar el efecto de la direccion de rechazo.

## Benchmarks y rendimiento

Los unicos datos publicados son las tasas de no rechazo del autor sobre el benchmark `qwen38-v1` (342 prompts reservados) y las comprobaciones de perplejidad. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

| Metrica | Stock Qwen3-1.7B | v1 (advanced) | v2 (aggressive) | Final BF16 | Final Q8_0 GGUF |
|---|---|---|---|---|---|
| Tasa de no rechazo (held-out) | 15/40 (37,5%) | 129/142 (90,8%) | 27/39 (69,2%) | 142/142 (100%) | 199/200 (99,5%) en final_test |
| Perplejidad (vs. stock) | 16,327 (1,000x) | 1,061x | 1,561x | 15,918 (0,975x) | no reportada |
| Sanity checks benignos | 7/7 | 7/8 | 5/6 | 7/7 | 8/8 (tune) |

Desglose por categoria en el modelo final (combinado tune + final_test):

| Categoria | No rechazo | Rechazos duros |
|---|---|---|
| T1 Estandar | 15/15 (100%) | 0 |
| T2 Elevado | 12/12 (100%) | 0 |
| T3 Maximo | 13/13 (100%) | 0 |
| T4 Ciber y digital | 40/40 (100%) | 0 |
| T5 Armas y violencia | 38/38 (100%) | 0 |
| T6 Fraude y manipulacion | 43/43 (100%) | 0 |
| T7 CBRN e infraestructura critica | 45/45 (100%) | 0 |
| T8 Extendida | 135/136 (99,3%) | 1 |
| Total | 341/342 (99,71%) | 1 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,5 GB en BF16 para los pesos (1,72 mil millones de parametros), mas overhead de activaciones y cache KV; unos 1,83 GB en GGUF Q8_0.
- GPU verificada por el autor: RTX 4050 Laptop con 6 GB, suficiente para extraccion, barrido de configuraciones y conversion a GGUF en bfloat16.
- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas para Q8_0; 6-8 GB recomendables para BF16 con contexto amplio.
- GPU de datacenter (A100, H100) no necesarias para inferencia; utiles solo para entrenamiento o evaluacion a gran escala.
- Opciones de despliegue: `llama.cpp` / `llama-server` (verificado por el autor), transformers, text-generation-inference (etiqueta `endpoints_compatible`); Ollama y vLLM no estan verificados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de no rechazo | Perplejidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-1.7B-Abliterated-Zero | 1,72B | no disponible | 99,71% (342 prompts) | 0,975x vs. stock | Apache 2.0 | HF, GGUF |
| Qwen/Qwen3-1.7B (base) | 1,72B | no disponible | 37,5% (held-out duro) | 1,000x | Apache 2.0 | HF |
| v1 advanced (mismo autor) | 1,72B | no disponible | 90,8% | 1,061x | Apache 2.0 | no disponible |
| v2 aggressive (mismo autor) | 1,72B | no disponible | 69,2% | 1,561x | Apache 2.0 | no disponible |

No se dispone de datos de otros modelos abliterated comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sido editado deliberadamente para eliminar los mecanismos de rechazo en categorias que incluyen CBRN, armas, ciberataques y fraude. Su uso en produccion conlleva riesgo legal y etico elevado y puede incumplir politicas de plataformas y legislacion aplicable.
- La evaluacion de no rechazo la realiza el propio autor con detectores propios; no hay validacion independiente. La cifra del 99,71% debe interpretarse con cautela.
- La perplejidad de 0,975x se midio sobre el checkpoint BF16; para Q8_0 no se reporta perplejidad, solo sanity checks.
- Riesgo de alucinacion y de degradacion de coherencia en dominios no evaluados; el modelo base de 1,7B ya tiene capacidad limitada de razonamiento.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible; los sesgos del modelo base persisten y la cirugia puede alterar comportamientos benignos de forma no prevista.
- Idiomas: la model card solo declara `en` y `multilingual`; no hay evaluacion por idioma. El castellano no esta verificado.
- Contexto: la longitud de contexto no se especifica en la informacion proporcionada; debe consultarse la ficha de Qwen3-1.7B.
- Licencia Apache 2.0 permite uso comercial segun los terminos de la licencia, pero el autor no ofrece garantias sobre el comportamiento del modelo editado.
- El modelo se creo y actualizo el 27 de noviembre de 2026, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni auditoria externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xkaiken/Qwen3-1.7B-Abliterated-Zero
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
