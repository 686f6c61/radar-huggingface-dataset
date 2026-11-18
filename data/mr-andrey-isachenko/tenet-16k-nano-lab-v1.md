# mr-andrey-isachenko/Tenet-16K-Nano-Lab-v1

## Resumen

Tenet-16K-Nano-Lab-v1 es un checkpoint de referencia del proyecto Tenet Lab (originalmente Small Model Lab, CLI `sml`), un trabajo de investigacion aplicada sobre modelos de lenguaje pequenos orientado al razonamiento de incidentes en pipelines de datos. El autor, mr-andrey-isachenko, lo publica como artefacto reproducible de su pipeline de ocho sprints, que cubre desde el preentrenamiento de un decoder compatible con Llama/Qwen hasta la cirugia de subespacios en pesos y el RL con recompensas verificables. La relevancia del checkpoint es metodologica: sirve para validar de forma reproducible las tecnicas Lancet (cirugia de subespacios biproyectada) y Tenet (RL seguro en subespacios), no como modelo de produccion generalista.

El modelo se declara como un fine-tuning de Qwen/Qwen2.5-3B-Instruct, con arquitectura decoder transformer compatible con Llama/Qwen (RMSNorm, RoPE, GQA, SwiGLU, KV-cache). El repositorio incluye ademas `lancet_basis.safetensors` y `lancet_recipe.json`, que documentan las direcciones de rechazo y "slop" ablacionadas y la receta de proyeccion aplicada sobre `self_attn.o_proj` y `mlp.down_proj`.

El contexto nominal es de 16K tokens (segun el nombre del checkpoint), el entrenamiento se centra en ingles y la licencia es Apache-2.0. El dato de parametros totales en safetensors (16.384) es inconsistente con el modelo base de 3B y debe interpretarse como metadato del checkpoint nano de referencia, no como el tamano real del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer compatible con Llama/Qwen (RMSNorm, RoPE, GQA, SwiGLU, KV-cache) |
| Parametros totales | 16.384 segun safetensors del repo (inconsistente con el base de 3B; ver advertencias) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16K tokens (segun nombre del checkpoint; no confirmado en la model card) |
| Tipos de cuantizacion | FP8 (E4M3) e INT4 AWQ evaluados en el pipeline; safetensors en el repo |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El checkpoint deriva de Qwen/Qwen2.5-3B-Instruct, un decoder transformer denso con RMSNorm, RoPE, atencion con query grouping (GQA) y FFN SwiGLU. Sobre esa base, el pipeline del autor aplica una cirugia de subespacios denominada Lancet: biproyeccion de Gram-Schmidt modificada de las direcciones de rechazo y de "slop" contra un ancla de razonamiento en float32, proyeccion conjunta desde `self_attn.o_proj` y `mlp.down_proj` con reescalado por fila de la norma L2, y seleccion de capas mediante el ratio senal-colateral (SCR). El objetivo declarado es eliminar rechazos falsos y respuestas degeneradas sin dano colateral en capacidad de razonamiento.

Sobre los pesos editados se aplica Tenet, un RL con GRPO y rubrica multiplicativa con compuerta (`R_total = R_outcome · R_evidence · R_process`), en el que los adaptadores LoRA se fusionan solo a traves de la proyeccion ortogonal `I - U U^T` con preservacion de norma por fila, de modo que las actualizaciones de RL no vuelven a filtrarse en el subespacio ablacionado. El entorno de entrenamiento es multi-turno (`StatefulToolEnv`, compatible con `verifiers`) construido sobre dbt Core, DuckDB y sqlglot, con inyeccion de fallos contrafactuales multilla semilla (`product_bug`, `data_pipeline_artifact`, `mix_shift` y confundidores). El pipeline incluye ademas validacion de supervivencia a cuantizacion FP8 con la puerta de crest-factor por fila inferior a 25.0, y composicion de adaptadores con TIES y Gram-Schmidt (sprints 7 y 8). No se detalla en la informacion disponible el volumen de tokens de entrenamiento del fine-tuning ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto conversacional en ingles sobre la base instruct de Qwen2.5-3B.
- Razonamiento sobre incidentes de pipelines de datos: diagnostico de fallos de tipo `product_bug`, `data_pipeline_artifact` y `mix_shift` con confundidores.
- Tool calling y uso de herramientas de datos en entorno multi-turno (dbt, DuckDB, sqlglot) mediante `StatefulToolEnv`.
- Generacion y validacion de SQL sobre DuckDB como parte del razonamiento de incidentes.
- Razonamiento multi-paso con recompensas verificables (GRPO) y rubrica con compuerta de evidencia y proceso.
- Reduccion de rechazos falsos y de respuestas degeneradas ("slop") mediante cirugia de subespacios y RL seguro en subespacios.
- Compatibilidad con `transformers` y con Text Generation Inference (`text-generation-inference`, `endpoints_compatible`).
- Soporte de cuantizacion FP8 (E4M3) e INT4 AWQ documentado en el pipeline (no implica que el checkpoint publicado incluya pesos cuantizados).

## Casos de uso

- Diagnostico de incidentes en pipelines de datos: el modelo razona sobre fallos inyectados en un entorno dbt + DuckDB y produce una hipotesis de causa raiz con evidencia, aprovechando el entrenamiento GRPO con rubrica de evidencia.
- Asistente de operaciones de datos con tool calling: consulta catalogos y ejecuta SQL via sqlglot y DuckDB en conversaciones multi-turno, adecuado por el entorno `StatefulToolEnv` con el que fue entrenado.
- Smoke-testing reproducible de tecnicas de cirugia de subespacios: el checkpoint nano sirve para validar `lancet_basis.safetensors` y `lancet_recipe.json` antes de aplicar la receta a los modelos de 3B, 8B y 12B de la familia Tenet.
- Validacion de supervivencia a cuantizacion FP8: util para comprobar la puerta de crest-factor por fila (< 25.0) y la re-filtracion de subespacios tras cuantizacion E4M3 en un proveedor de inferencia.
- Investigacion en reduccion de rechazos falsos: permite medir el efecto de la ablacion de direcciones de rechazo sobre la tasa de rechazo sin degradar razonamiento, con el ratio SCR como metrica de seleccion de capas.
- Composicion de adaptadores en investigacion: base para experimentos de merge con TIES y Gram-Schmidt de adaptadores GRPO independientes (SQL y unslop) con preservacion de norma por fila.
- Evaluacion de latencia y coste en serving: al ser compatible con vLLM y TGI, sirve para medir TTFT, TPOT y coste por cada 1.000 incidentes en la frontera de Pareto del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card reporta unicamente metricas internas de validacion del pipeline: diferencias maximas absolutas de `7.45e-9` en cirugia por shards en streaming, `0.0` en merge en streaming y un crest-factor maximo por fila de `1.1926` en el sprint 9. No hay datos de MMLU, HumanEval, GSM8K ni de tareas de razonamiento de incidentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma fiable, dado que el recuento de parametros del repo (16.384) no coincide con el modelo base de 3B. Para un modelo de 3B en FP16 se requieren aproximadamente 6-7 GB de VRAM; en INT4 AWQ, alrededor de 2-3 GB.
- GPU recomendadas: no especificadas por el autor. Para el base de 3B, una RTX 4090 o A100 cubren la inferencia con holgura; para experimentos de cirugia y merge en float32 se recomienda A100 o H100 por memoria.
- Cabe en GPU de consumo: si, asumiendo el base de 3B en cuantizacion INT4 o FP8 en GPUs con 8 GB o mas; no confirmado para el checkpoint nano por la inconsistencia de parametros.
- Opciones de despliegue: `transformers`, Text Generation Inference (declarado en los tags) y vLLM (usado en el sprint 4 del pipeline). No se mencionan llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. El pipeline declara medir TTFT, TPOT, req/s y coste por cada 1.000 incidentes, pero no publica cifras en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tenet-16K-Nano-Lab-v1 | 16.384 segun safetensors (base 3B) | 16K (segun nombre) | Cirugia de subespacios + GRPO para razonamiento de incidentes de datos | Apache-2.0 | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32K (Qwen2.5) | Instruct generalista | Apache-2.0 | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128K | Instruct generalista | Llama 3.1 Community License | Hugging Face |
| mistralai/Mistral-Nemo-Instruct-2407 | 12B | 128K | Instruct generalista | Apache-2.0 | Hugging Face |

La comparacion de rendimiento no esta disponible: no hay benchmarks publicados del checkpoint ni del pipeline que permitan situarlo frente a sus bases.

## Limitaciones y advertencias

- El recuento de parametros totales en safetensors (16.384) es incompatible con un modelo derivado de Qwen2.5-3B; el checkpoint parece ser un artefacto nano de referencia y no debe asumirse como un modelo de 3B operativo sin verificacion.
- El modelo solo declara soporte de ingles; no hay evidencia de capacidades multilingues.
- El contexto de 16K figura en el nombre del checkpoint pero no se confirma en la model card; verificar en `config.json` antes de usarlo en produccion.
- Entrenado especificamente para razonamiento de incidentes en pipelines de datos; el rendimiento fuera de ese dominio no esta documentado y probablemente sea inferior al de su base instruct.
- Riesgo de alucinacion no cuantificado: no se publican tasas de error ni evaluaciones de fidelidad en tareas de diagnostico.
- Sesgos conocidos: no documentados en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero la model card no ofrece garantias ni soporte; es un artefacto de investigacion con 0 descargas en el momento de la consulta.
- La supervivencia a FP8 depende de la puerta de crest-factor por fila (< 25.0); fuera de ese regimen la ablacion de subespacios puede filtrarse de nuevo.
- El pipeline depende de componentes propios (`sml`, `verifiers`, `StatefulToolEnv`, gateway OpenRouter) que deben reproducirse para reevaluar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-16K-Nano-Lab-v1
- Tenet-3B (base Qwen2.5-3B-Instruct): https://huggingface.co/mr-andrey-isachenko/Tenet-3B-Qwen2.5-Unslop-v1
- Tenet-8B (base Llama-3.1-8B-Instruct): https://huggingface.co/mr-andrey-isachenko/Tenet-8B-Llama3.1-Unslop-v1
- Tenet-12B (base Mistral-Nemo-Instruct-2407): https://huggingface.co/mr-andrey-isachenko/Tenet-12B-Nemo-Unslop-v1
- Repositorio del proyecto: https://github.com/mrAndreyIsachenko/tenet-lab
- ADR-005 (cirugia biproyectada Lancet): https://github.com/mrAndreyIsachenko/tenet-lab/blob/main/docs/decisions/005-lancet-biprojected-surgery.md
- Resumen del sprint 1 (hipotesis H1-H13): https://github.com/mrAndreyIsachenko/tenet-lab/blob/main/reports/sprint1/summary.md
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
