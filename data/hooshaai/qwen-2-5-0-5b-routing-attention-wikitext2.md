# Hooshaai/qwen-2.5-0.5b-routing-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-routing-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atencion del decodificador por el operador `RoutingAttention` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es tanto ofrecer un modelo listo para produccion como servir de banco de pruebas para estudiar mecanismos de atencion subcuadratica basados en agrupamiento por contenido (content-based clustering) sobre un transformer denso ya existente.

El modelo se ha entrenado sobre WikiText-2 (`Salesforce/wikitext`, `wikitext-2-raw-v1`) mediante un proceso de destilacion de conocimiento en dos etapas, partiendo de un estado post-cirugia con perplejidad practicamente inutilizable (146289.08) y recuperando hasta 146.99 en validacion. Se trata de un artefacto de investigacion de 0.5B parametros, con contexto heredado de Qwen2.5, licencia MIT y pesos publicados en formato `safetensors` que contienen unicamente los tensores de atencion (59.29 MB), no el modelo completo.

Su relevancia actual radica en que documenta de forma transparente la telemetria de una cirugia arquitectonica sobre un modelo abierto: patron hibrido 3:1, contrato de adaptador GQA y curvas de recuperacion via destilacion. Es material util para quien investigue atencion eficiente, pero no es un modelo conversacional listo para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con atencion hibrida: 18/24 capas con `RoutingAttention` y 6/24 capas con atencion cuadratica completa |
| Parametros totales | 0.5B (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-0.5B, no confirmada para este checkpoint) |
| Tipos de cuantizacion | no disponible (los pesos publicados son `safetensors` en FP16/FP32) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 59.29 MB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B` (14 cabezas de query, 2 cabezas KV, `head_dim=64`, `hidden_size=896`) y aplica una cirugia de atencion con patron `hybrid_3_1`: se sustituyen 18 de las 24 capas por `RoutingAttention` y se preservan 6 capas de ancla cuadratica completa en los indices `[3, 7, 11, 15, 19, 23]`. La sustitucion se realiza mediante `QwenAttentionAdapter`, que gestiona la expansion de cabezas KV (7x cuando es necesario) y respeta el contrato de un unico `o_proj`. El operador `RoutingAttention` soporta atencion bidireccional, cross-attention y GQA nativo, pero **no soporta modo causal autoregresivo** (`supports_causal: No`), lo que condiciona su uso en generacion de texto.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2. La etapa 1 (alineamiento con backbone congelado) ejecuta 124 pasos en 54.3 s con `lm_head` puenteado y MSE/coseno de estados ocultos por capa con peso 0.25. La etapa 2 (destilacion de representacion multicapa) ejecuta 283 pasos en 125.6 s con MSE/coseno por capa y peso 0.50. En total, 407 pasos y 180.2 s de optimizacion con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de VRAM de 15066 MB en FP16 autocast con parametros maestros en FP32.

## Capacidades

- Generacion de texto autoregresiva basica, condicionada por la limitacion del operador `RoutingAttention` (sin soporte causal nativo).
- Modelado de lenguaje sobre dominio ingles (WikiText-2), con perplejidad de validacion de 146.99.
- Atencion bidireccional y cross-attention a nivel de modulo, segun la ficha del operador.
- Soporte GQA nativo en las capas sustituidas.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo thinking, vision, audio ni capacidades multimodales.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Investigacion en atencion eficiente: el checkpoint permite reproducir la cirugia `hybrid_3_1` y medir el impacto de `RoutingAttention` frente a atencion cuadratica completa sobre WikiText-2, usando la telemetria publicada como linea base.
- Benchmarking de destilacion de conocimiento: las dos etapas (alineamiento y representacion multicapa) sirven como receta reproducible para recuperar modelos tras cirugias agresivas, con curvas de perplejidad documentadas.
- Estudio de contratos de adaptador GQA: `QwenAttentionAdapter` con expansion 7x de cabezas KV y Single-`o_proj` es un caso concreto para analizar compatibilidad entre operadores de atencion y arquitecturas densas.
- Prototipado de modulos de atencion en `neuralops`: el modelo se carga via `load_surgeried_model` y permite iterar sobre el registro `ATTENTION_REGISTRY` sin reentrenar el backbone completo.
- Docencia y divulgacion: ejemplo realista de cirugia arquitectonica con metricas antes/despues (146289.08 a 146.99) y coste computacional acotado (180.2 s, 15 GB VRAM).
- Validacion de pipelines de evaluacion de perplejidad: util para verificar que un harness de evaluacion sobre `wikitext-2-raw-v1` reproduce el valor 146.99 declarado por el autor.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Dataset / split | Metrica | Valor |
|---|---|---|---|
| Causal Language Modeling | `Salesforce/wikitext` / `wikitext-2-raw-v1` / validation | Perplejidad | 146.99 |
| Causal Language Modeling (post-cirugia, pre-KD) | `wikitext-2-raw-v1` | Perplejidad | 146289.08 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el propio entrenamiento uso 15066 MB de pico (FP16 autocast con maestros FP32), por lo que la inferencia en FP16 deberia caber holgadamente en GPUs de 8-16 GB una vez cargado el modelo base.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el modelo base en FP16; el entrenamiento documentado se ejecuto en una GPU con ~15 GB disponibles (compatible con RTX 4080/4090, A10, L4, A100).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, 4060 Ti, 4070, 4080, 4090) para el modelo base en FP16.
- Opciones de despliegue: el autor documenta `neuralops.hub.load_surgeried_model` y carga manual via `transformers` + `safetensors`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Benchmark publicado |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-routing-attention-wikitext2` | 0.5B | no disponible | Hibrida 3:1 (`RoutingAttention` + cuadratica) | MIT | PPL WikiText-2 val: 146.99 |
| `Qwen/Qwen2.5-0.5B` (base) | 0.5B | 32 768 tokens (segun ficha oficial de Qwen2.5) | Cuadratica completa | Apache 2.0 | No disponible en esta ficha |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0.5B | 32 768 tokens (segun ficha oficial de Qwen2.5) | Cuadratica completa | Apache 2.0 | No disponible en esta ficha |

No se dispone de resultados de perplejidad del modelo base Qwen2.5-0.5B en la informacion proporcionada, por lo que no es posible cuantificar la degradacion respecto al original.

## Limitaciones y advertencias

- El operador `RoutingAttention` no soporta atencion causal autoregresiva (`supports_causal: No`), lo que puede comprometer la generacion de texto en modo estandar pese a que el pipeline declarado sea `text-generation`.
- La perplejidad de 146.99 es muy superior a la esperable en un modelo de 0.5B bien ajustado; indica una degradacion significativa respecto al Qwen2.5-0.5B original.
- Entrenado exclusivamente sobre WikiText-2 en ingles: dominio y idioma muy limitados.
- Solo se publican los pesos de atencion (`attention_weights.safetensors`), no el modelo completo; es necesario aplicar la cirugia sobre el modelo base para usarlo.
- El identificador del repo en los ejemplos de la model card (`tahamajs/...`) no coincide con el ID real (`Hooshaai/...`), lo que puede provocar errores al copiar el codigo de ejemplo.
- No hay evidencia de evaluacion independiente; el unico benchmark es la perplejidad declarada por el autor y marcada como `verified: false`.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible; al ser un modelo de investigacion sobre WikiText-2, no se han aplicado tecnicas de alineacion (RLHF/DPO) documentadas.
- Licencia MIT permite uso comercial, pero el modelo base Qwen2.5-0.5B es Apache 2.0; conviene revisar la compatibilidad de ambas licencias en el contexto de uso.
- No apto para produccion conversacional: sin soporte documentado de tool calling, agentes ni multilingue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-routing-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
