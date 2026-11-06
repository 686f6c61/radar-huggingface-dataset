# RelaxingSnorlax/GLM-5.3-Flash-speculator.dspark-preview-FP8-block

## Resumen

GLM-5.3-Flash-speculator.dspark-preview-FP8-block es un modelo borrador (drafter) para decodificacion especulativa, publicado por el usuario RelaxingSnorlax en Hugging Face. No es un modelo generativo autonomo: es el componente que propone tokens candidatos que un modelo objetivo verifica, acelerando la inferencia sin alterar la distribucion de salida. En concreto, se trata de la variante cuantizada en FP8 del checkpoint `RedHatAI/GLM-5.3-Flash-speculator.dspark-preview`, un drafter DSpark de 5 capas disenado para el modelo `zai-org/GLM-5.3-Flash`.

El modelo conserva la arquitectura del borrador original (bloques transformer con cabecera Markov y cabecera de confianza propias de DSpark) y aplica cuantizacion post-entrenamiento FP8 por bloques de 128x128 sobre las proyecciones lineales, manteniendo en bf16 las partes sensibles (embeddings, `lm_head`, cabeceras Markov y de confianza, normas y sesgos). El resultado reduce el peso del fichero de pesos de 5,08 GB a 3,89 GB, lo que facilita su despliegue junto al modelo objetivo en pipelines de vLLM.

Su relevancia es practica: la decodificacion especulativa es una de las tecnicas mas extendidas para reducir la latencia de generacion en produccion, y disponer de un drafter cuantizado compatible con `compressed-tensors` y vLLM simplifica su integracion en infraestructuras ya existentes. Con 2.539.312.001 parametros, es un modelo auxiliar de tamano medio que no sustituye al modelo objetivo, sino que lo acelera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DSpark (5 capas) con cabecera Markov y cabecera de confianza; drafter para decodificacion especulativa |
| Parametros totales | 2.539.312.001 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso fija `--max-model-len 16384` para el modelo objetivo) |
| Tipos de cuantizacion | FP8_BLOCK (e4m3 en bloques 128x128, activaciones dinamicas por grupo de 128 tokens); pesos sensibles en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con `compressed-tensors`; 100 tensores, 36 con escalas de cuantizacion) |

## Arquitectura y entrenamiento

El modelo es un drafter DSpark de 5 capas que se acopla al modelo objetivo `zai-org/GLM-5.3-Flash`. La arquitectura incluye proyecciones de atencion y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) en cada capa, una proyeccion auxiliar de estado oculto (`fc`), una cabecera Markov (`markov_w1` como embedding y `markov_w2` como proyeccion) y una cabecera de confianza (`confidence_head.proj`). Los detalles de entrenamiento, el diseno de capas objetivo y los resultados de aceptacion en bf16 se encuentran en la model card del checkpoint base, no en esta variante.

La innovacion de esta publicacion es exclusivamente la cuantizacion: se aplico PTQ sin datos de calibracion mediante `llm-compressor` (enfoque model-free) sobre 36 pesos lineales, con esquema FP8_BLOCK. Las escalas de peso (`weight_scale`) se almacenan en bf16 con forma `[ceil(N/128), ceil(K/128)]`, y las activaciones usan cuantizacion dinamica por grupo de 128 tokens. Se mantienen en bf16 los embeddings de tokens, `lm_head`, las cabeceras Markov y de confianza, y todas las normas y sesgos, protegidos por una regla de ignorado explicita. El error maximo de ida y vuelta por tensor es 0,0357142857 respecto al amax de ese tensor (`layers.1.mlp.gate_proj.weight`), con un error absoluto maximo agregado de 0,017578125.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa: propone hasta 8 tokens por paso (`num_speculative_tokens: 8`) que el modelo objetivo verifica.
- Integracion con vLLM mediante el metodo `dspark` en `speculative_config`.
- Compatibilidad con `compressed-tensors` para la carga de pesos cuantizados FP8 por bloques.
- Soporte de tensor parallelism (TP=1 verificado; TP=8 indicado como aritmetico en la verificacion del autor).
- Carga mediante `SpeculatorModel.from_pretrained` de la libreria `speculators`.
- No es un modelo de chat, razonamiento, codigo o vision por si mismo: su funcion es acelerar al modelo objetivo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Aceleracion de inferencia en produccion con vLLM: se configura como drafter del modelo `zai-org/GLM-5.3-Flash` para reducir la latencia por token generado, manteniendo la calidad de salida del modelo objetivo gracias a la verificacion.
- Despliegue en servidores con memoria limitada: al ocupar 3,89 GB en FP8 frente a 5,08 GB en bf16, libera aproximadamente 1,2 GB de VRAM que pueden destinarse a cache KV o a mayor longitud de contexto.
- Servicios de generacion de texto de baja latencia: chatbots, resumenes o traduccion donde el tiempo hasta el primer token y el throughput importan, usando el drafter para proponer tokens y el objetivo para validarlos.
- Pipelines de atencion al cliente multi-turno: con el modelo objetivo configurado a 16.384 tokens de contexto, el drafter acelera cada turno sin modificar el comportamiento conversacional.
- Evaluacion de tecnicas de decodificacion especulativa: sirve como referencia para medir tasas de aceptacion y ganancias de throughput en entornos de investigacion con vLLM 0.31.0 o superior.
- Entornos con tensor parallelism en multiples GPU: el ejemplo del autor usa `--tensor-parallel-size 8`, adecuado para despliegues en nodos con varias H100.
- Integracion en infraestructuras con `compressed-tensors`: equipos que ya usan cuantizacion por bloques pueden anadir el drafter sin cambiar el stack de carga de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que para esta variante no se realizaron pruebas de servicio end-to-end, benchmarks ni mediciones de aceptacion, y que las cifras de aceptacion en bf16 deben consultarse en la model card del checkpoint base.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 3,9 GB en FP8 (tamano del fichero de pesos) mas overhead de activaciones y cache; el checkpoint bf16 equivalente ocupa 5,08 GB.
- GPU recomendadas: el autor verifico la carga en vLLM 0.31.0 sobre H100 (sm90). El ejemplo de despliegue usa 8 GPU con tensor parallelism.
- GPU de consumo: no hay datos publicados sobre ejecucion en RTX 4090 u otras GPU consumer; el soporte depende de la compatibilidad de `compressed-tensors` y del kernel FP8 en la arquitectura concreta.
- Opciones de despliegue: vLLM con `--speculative-config` y metodo `dspark`; la libreria `speculators` para carga via `SpeculatorModel.from_pretrained`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (FP8_BLOCK) | 2.539.312.001 | no disponible | FP8 por bloques 128x128 | MIT | Drafter DSpark cuantizado, 3,89 GB |
| RedHatAI/GLM-5.3-Flash-speculator.dspark-preview (bf16) | no disponible | no disponible | bf16 | no disponible | Checkpoint base; 5,08 GB; incluye resultados de aceptacion |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | no disponible | no disponible | Modelo objetivo al que sirve el drafter |

No se dispone de informacion sobre otros drafters comparables (por ejemplo, borradores EAGLE o Medusa para el mismo modelo objetivo) en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo objetivo `zai-org/GLM-5.3-Flash` y un runtime compatible (vLLM con metodo `dspark`); no puede usarse para generar texto por si solo.
- No se han medido tasas de aceptacion ni ganancias de throughput para esta variante FP8; el rendimiento real en produccion es desconocido y debe validarse.
- La cuantizacion introduce error numerico: el peor error de ida y vuelta por tensor alcanza 0,0357142857 del amax, lo que puede afectar marginalmente a la tasa de aceptacion frente al drafter bf16.
- La verificacion de carga se realizo con TP=1; las formas para TP=8 son aritmeticas y no se ejecutaron, segun indica el autor.
- No se almacena tensor `verifier_lm_head` en este checkpoint.
- Idiomas soportados no documentados; el comportamiento multilingue depende del modelo objetivo.
- Sesgos y riesgo de alucinacion: no documentados para este componente; al ser un drafter, la salida final la determina el modelo objetivo.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo objetivo y del checkpoint base, cuya licencia no se detalla en la informacion disponible.
- El repositorio tiene muy poca traccion (23 descargas, 0 likes) y fue creado el 2026-10-29; no hay evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/RelaxingSnorlax/GLM-5.3-Flash-speculator.dspark-preview-FP8-block
- Checkpoint base: https://huggingface.co/RedHatAI/GLM-5.3-Flash-speculator.dspark-preview
- Modelo objetivo: https://huggingface.co/zai-org/GLM-5.3-Flash
- Otros enlaces (papers, blogs, repos, demos): no disponibles en la informacion proporcionada.
