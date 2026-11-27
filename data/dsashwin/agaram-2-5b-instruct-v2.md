# dsashwin/agaram-2.5b-instruct-v2

## Resumen

Agaram 2.5B Instruct v2 es un ajuste fino supervisado y posteriormente optimizado con GRPO sobre el modelo `murai-labs/agaram-2.5b-instruct`, desarrollado por el usuario `dsashwin`. Se trata de un `LlamaForCausalLM` de 2.525.757.696 parámetros (2,53B) con una ventana de contexto de 8192 tokens, plantilla ChatML y especialización en tamil, tanglish (tamil romanizado) y tool calling bilingüe tamil-inglés. El modelo resuelve el problema del bajo rendimiento en llamadas a herramientas y en el seguimiento de instrucciones en tamil que presentaba el modelo base.

La relevancia de esta versión radica en su mejora medida sobre el modelo base: el tool calling global pasa del 51,9% al 80,9% (+29 puntos), el IndicIFEval estricto en tamil del 17,9% al 55,1% (+37,2 puntos) y el IndicIFEval de traducción del 11,4% al 35,3% (+23,9 puntos), sin regresiones estadísticamente significativas en las tareas de lm-eval en tamil e inglés. Todo ello manteniendo la licencia Apache 2.0 y un tamaño que permite el despliegue en GPU de consumo.

El modelo se publica con pesos en safetensors y BF16, y está pensado para asistentes conversacionales y agentes con herramientas en contextos tamil y tanglish, un nicho con muy poca cobertura en modelos abiertos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`LlamaForCausalLM`) |
| Parametros totales | 2.525.757.696 (2,53B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en BF16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Tamil (ta), ingles (en); entrenado ademas con tanglish (tamil romanizado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Plantilla de chat | ChatML (`<|im_end|>` como token EOS, id 2) |
| Modelo base | `murai-labs/agaram-2.5b-instruct` |
| Libreria | transformers |
| Tamano del repositorio | 5,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de tipo Llama con 2,53B parametros, plantilla ChatML y contexto de 8192 tokens, heredada integramente del modelo base `murai-labs/agaram-2.5b-instruct`. El post-entrenamiento se realizo en dos etapas. La primera, SFT limpio (`sft3b`), consistio en 2,0 epocas con `lr=7e-5` sobre datos de tool calling en tamil, ingles y tanglish (incluyendo ejemplos de herramientas inexistentes, rechazos y casos negativos), ejemplos de seguimiento de instrucciones bilingues y replay de traduccion on-policy sin caracteres tamil descompuestos.

La segunda etapa aplico GRPO filtrado por dificultad (`run5`): 450 pasos en una NVIDIA A100-SXM4-40GB con `lr=2e-5` coseno, `beta=0.03` y LoRA de rango 64 fusionado de vuelta a BF16, sobre 12.294 prompts remuestreados por dificultad (incluyendo replay 2x de traduccion FLORES on-policy). Las recompensas fueron verificables para tool calls, recompensas de IndicIFEval y penalizaciones explicitas contra bucles de repeticion, eco del prompt y separadores `***` espurios. El resultado se evaluo con decodificacion greedy y graders identicos entre base y version final.

## Capacidades

- Generacion de texto conversacional en tamil, ingles y tanglish, con seguimiento de instrucciones en tamil.
- Tool calling / function calling con formato estructurado `<tool_call>{"name": ..., "arguments": {...}}</tool_call>`, aceptando definiciones JSON sin envolver en `apply_chat_template`.
- Manejo de casos de herramienta ausente (pedir aclaracion), herramienta no disponible (rechazo o explicacion) y conversacion sin herramienta.
- Traduccion bidireccional tamil-ingles con calidad medida en FLORES (chrF++ 52,29 en→ta y 54,75 ta→en).
- Seguimiento de instrucciones con restricciones de formato (IndicIFEval ground y trans).
- Razonamiento multi-turno y estilo tanglish en llamadas a herramientas.
- Capacidad multilingue limitada a tamil e ingles; no se documentan otras lenguas.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Asistente de atencion al cliente en tamil: el modelo gestiona conversaciones multi-turno con hasta 8192 tokens de contexto y responde en tamil o tanglish, con un 99,0% de respuestas en tamil en las pruebas de salud de chat, lo que lo hace adecuado para soporte en ese idioma.
- Agente de consulta de datos con herramientas: con un 80,9% de acierto en tool calling global y un 67,9% en esquemas de herramientas no vistas, puede integrarse en flujos que consulten APIs (tipos de cambio, tasas de oro, clima) a partir de peticiones en tanglish.
- Traduccion tamil-ingles en produccion: con chrF++ de 52,29 y 54,75 en FLORES y cero copias del original en ingles en la direccion en→ta, sirve para pipelines de localizacion de contenido.
- Generacion de respuestas con formato controlado: el IndicIFEval estricto del 55,1% en tamil permite usarlo en tareas que exigen restricciones de formato (listas, mayusculas, delimitadores), aunque con margen de mejora.
- Prototipado en GPU de consumo: sus 2,53B parametros en BF16 caben en GPUs de 24 GB, lo que facilita iteracion rapida en entornos de desarrollo con `transformers`.
- Chat bilingue con rechazo controlado: el 82,8% en el escenario `unavailable` y el 100% en `no_tool` lo hacen util para asistentes que deben explicar cuando una herramienta no existe en lugar de inventarla.

## Benchmarks y rendimiento

Resultados publicados por el autor con decodificacion greedy y graders identicos, a 512 tokens nuevos (configuracion por defecto):

| Benchmark / metrica | n | Base | v2 (run5) | Delta |
|---|---:|---:|---:|---:|
| Tool calling (global) | 451 | 51,9% | 80,9% | +29,0 |
| Tool calling, herramientas vistas (`call_sft`) | 159 | 68,6% | 89,3% | +20,7 |
| Tool calling, esquemas no vistos (`call_synth`) | 168 | 16,7% | 67,9% | +51,2 |
| Herramienta ausente, pedir aclaracion (`missing`) | 26 | 26,9% | 61,5% | +34,6 |
| Sin herramienta, respuesta conversacional (`no_tool`) | 69 | 98,6% | 100,0% | +1,4 |
| Herramienta no disponible (`unavailable`) | 29 | 75,9% | 82,8% | +6,9 |
| Estilo tanglish | 181 | 54,1% | 85,1% | +31,0 |
| IndicIFEval ground (estricto) | 430 | 17,9% | 55,1% | +37,2 |
| IndicIFEval trans (estricto) | 490 | 11,4% | 35,3% | +23,9 |
| FLORES en→ta (chrF++) | 1.012 | 52,05 | 52,29 | +0,2 |
| FLORES ta→en (chrF++) | 1.012 | 55,20 | 54,75 | -0,5 |
| Aya Chat Health, bucles % | 300 | 2,0% | 3,3% | +1,3 |
| Aya Chat Health, eco del prompt % | 300 | 4,7% | 5,0% | +0,3 |
| Aya Chat Health, `***` espurios % | 300 | 0,0% | 0,0% | 0,0 |
| Aya Chat Health, tamil→tamil % | 200 | 98,5% | 99,0% | +0,5 |
| lm-eval media, 10 tareas tamil | — | 43,5 | 43,1 | -0,4 |
| lm-eval media, 3 tareas ingles | — | 59,6 | 59,9 | +0,3 |

A 2048 tokens nuevos, el tool calling global queda en 80,7% frente al 51,4% del base (+29,3) y el IndicIFEval ground estricto en 54,9% frente al 18,1% (+36,7). El autor compara con modelos mayores: `Qwen3.5-4B` obtiene 50,4 en la media de lm-eval tamil y `granite-4.1-3b` 46,5, frente a los 43,1 de este modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,1 GB para pesos en BF16 (2,53B parametros), mas overhead de activaciones y cache KV segun contexto y batch.
- GPU recomendadas: A100-SXM4-40GB (usada en el entrenamiento GRPO), asi como H100 para mayor throughput.
- GPU de consumo: cabe en GPUs de 24 GB (RTX 3090, RTX 4090) en BF16; en GPUs de 16 GB o menos seria necesaria cuantizacion, aunque el autor no publica pesos cuantizados.
- Opciones de despliegue: `transformers` con `device_map="auto"` (soporte documentado); el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de Hugging Face, aunque no se detalla configuracion. No se documentan GGUF ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota de inferencia: es obligatorio detener la generacion en `<|im_end|>` (token id 2) para evitar continuaciones espurias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | IndicIFEval trans (estricto) | Licencia |
|---|---|---:|---:|---:|---|
| Agaram 2.5B Instruct v2 | 2,53B | 8192 | 80,9% | 35,3% | Apache 2.0 |
| murai-labs/agaram-2.5b-instruct (base) | 2,53B | 8192 | 51,9% | 11,4% | No disponible |
| Qwen3.5-4B | 4B (aprox.) | No disponible | No disponible | 42,4% / 51,8% | No disponible |
| gemma-4-E4B-it | 4B (aprox.) | No disponible | No disponible | 59,8% / 71,8% | No disponible |
| granite-4.1-3b | 3B (aprox.) | No disponible | No disponible | No disponible | No disponible |

Los datos de los modelos comparables provienen de la propia model card del autor; los valores de lm-eval tamil son 43,1 para este modelo, 50,4 para Qwen3.5-4B y 46,5 para granite-4.1-3b.

## Limitaciones y advertencias

- Techo de preentrenamiento congelado en 2,5B: el conocimiento zero-shot en opcion multiple (media lm-eval de 43,1 en tamil y 59,9 en ingles) queda por debajo de modelos abiertos de 3B-4B como Qwen3.5-4B (50,4) y granite-4.1-3b (46,5).
- Restricciones de formato en traduccion: el IndicIFEval trans estricto mejora de 11,4% a 35,3%, pero sigue por debajo de gemma-4-E4B-it (59,8% / 71,8%) y Qwen3.5-4B (42,4% / 51,8%), especialmente en `english_lowercase` (por contaminacion del entrenamiento en mayusculas) y en prompts delimitados con `***`.
- Bucles de repeticion: el porcentaje de bucles sube del 2,0% al 3,3% y el eco del prompt del 4,7% al 5,0%, aunque el autor aplico penalizaciones explicitas durante el GRPO.
- Riesgo de alucinacion en tool calling: aunque el 82,8% de los casos `unavailable` se resuelven correctamente, un 17,2% podria no rechazar adecuadamente herramientas inexistentes.
- Cobertura idiomatica limitada a tamil e ingles; no se documenta soporte de otras lenguas ni de caracteres tamil descompuestos (el entrenamiento los elimino, lo que puede afectar a entradas con normalizacion Unicode distinta).
- Ausencia de datos sobre cuantizacion, latencia y throughput, lo que dificulta planificar despliegues en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `murai-labs/agaram-2.5b-instruct` no tiene licencia indicada en la informacion proporcionada, lo que conviene verificar antes de explotacion comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/dsashwin/agaram-2.5b-instruct-v2
- Modelo base: https://huggingface.co/murai-labs/agaram-2.5b-instruct
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
