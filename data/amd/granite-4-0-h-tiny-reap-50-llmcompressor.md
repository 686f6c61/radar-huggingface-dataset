# amd/granite-4.0-h-tiny-reap-50-llmcompressor

## Resumen

`amd/granite-4.0-h-tiny-reap-50-llmcompressor` es una version podada estructuralmente del modelo `ibm-granite/granite-4.0-h-tiny` de IBM, publicada por AMD. El modelo conserva la arquitectura hibrida original de Granite 4.0 (mayoria de capas Mamba con atencion completa en una minoria) pero reduce a la mitad el numero de expertos enrutados en cada capa MoE mediante la tecnica REAP (Router-weighted Expert Activation Pruning), aplicada con LLM Compressor v0.14.0.

El objetivo es ofrecer una variante mas ligera (7,3 GiB frente a 12,9 GiB en disco, una reduccion aproximada del 44%) pensada para inferencia en CPU AMD EPYC con el stack ZenDNN/ZenTorch y vLLM. No es una cuantizacion: todos los tensores permanecen en BF16, por lo que el checkpoint no incluye `quantization_config` y carga como un Granite-4.0-h estandar con una dimension de expertos menor.

Es relevante para quienes despliegan Granite 4.0 en entornos sin GPU o con CPU AMD y necesitan reducir huella de memoria y ancho de banda sin salir del ecosistema Transformers/vLLM. Al ser una poda del 50% de expertos, el modelo mantiene el top-6 de enrutamiento original pero elige entre 32 expertos por capa en lugar de 64, lo que reduce computo y memoria a costa de cierta perdida de capacidad que el autor no cuantifica en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteMoeHybridForCausalLM (hibrida Mamba + atencion, con MoE en cada capa) |
| Parametros totales | 3.917.172.288 (~3,92 mil millones) |
| Parametros activos | no disponible (el modelo base es MoE con top-6; el numero de parametros activos tras la poda no se indica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (sin cuantizacion; poda estructural REAP al 50% de expertos) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, sin `quantization_config`) |

## Arquitectura y entrenamiento

El modelo base `granite-4.0-h-tiny` es un transformer hibrido de 40 capas de decodificador: 36 capas usan un mixer Mamba y solo 4 usan atencion completa. Cada capa combina un bloque MoE con expertos enrutados y un MLP compartido siempre activo. En el modelo original hay 64 expertos por capa y el router selecciona top-6.

La poda aplicada por AMD usa REAP con `sparsity=0.50`, reduciendo `num_local_experts` de 64 a 32 en cada una de las 40 capas. REAP puntua cada experto ponderando la magnitud de su activacion por la probabilidad que le asigna el router, y elimina la mitad de menor puntuacion. Se podan los expertos enrutados (`block_sparse_moe.input_linear`, `block_sparse_moe.output_linear`) y las filas correspondientes del router (`block_sparse_moe.router.layer.weight`, que queda en `[32, 1536]`). Permanecen intactos el MLP compartido, los 36 mixers Mamba, los 4 bloques de atencion, `embed_tokens` (atado a `lm_head`) y las layer norms.

El proceso de calibracion uso 128 muestras de `allenai/tulu-3-sft-personas-math`, renderizadas con la plantilla de chat del modelo y truncadas a 1024 tokens, con `batch_size=1` y `moe_calibrate_all_experts=False`. Los indices de los 32 expertos retenidos por capa se guardan en `retained_experts.json`. No se realizo entrenamiento adicional ni ajuste fino posterior a la poda; la model card no documenta recuperacion de calidad tras el pruning.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Granite 4.0.
- Razonamiento y matematicas (el conjunto de calibracion es de tematica matematica, aunque no se documenta evaluacion especifica).
- Generacion de codigo como capacidad del modelo base (no verificada en esta variante podada).
- Soporte de tool calling y function calling heredado de Granite 4.0 (no documentado explicitamente en esta model card).
- Capacidades de agente y razonamiento multi-paso del modelo base (no verificadas tras la poda).
- Multilingue limitado: la model card declara unicamente `en`.
- Inferencia optimizada en CPU AMD EPYC con ZenDNN y ZenTorch.
- No se documentan capacidades de vision ni audio.

## Casos de uso

- Inferencia en CPU AMD EPYC sin GPU: el modelo esta empaquetado para el stack ZenDNN/ZenTorch y vLLM sobre CPU, lo que permite desplegar generacion de texto en servidores sin acelerador.
- Reduccion de huella en disco y memoria: al pasar de 12,9 GiB a 7,3 GiB, encaja en entornos con almacenamiento o RAM limitados manteniendo pesos BF16.
- Servicio de chat conversacional en ingles: uso como backend de `text-generation` en vLLM con la plantilla de chat del modelo base.
- Prototipado y evaluacion de tecnicas de poda MoE: sirve como referencia reproducible de REAP al 50% con LLM Compressor, incluido el script de la model card.
- Despliegue de bajo coste en pipelines internos: al ser Apache-2.0, puede integrarse en servicios propietarios sin restricciones de licencia adicionales.
- Comparacion de calidad base vs podado: util para medir el impacto de eliminar la mitad de expertos en tareas de razonamiento y matematicas antes de decidir produccion.
- Entornos de investigacion sobre arquitecturas hibridas Mamba+atencion: permite estudiar el comportamiento de un modelo hibrido con MoE reducido en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica directamente; el objetivo es CPU. En BF16, los ~3,92 mil millones de parametros ocupan aproximadamente 7,3 GiB de pesos, mas memoria para KV cache y activaciones.
- GPU recomendadas: no documentadas; el modelo esta orientado a CPU AMD EPYC.
- Cabe en GPU consumer: por tamano (BF16, ~7,3 GiB) podria caber en GPUs con 12-16 GB o mas, pero el autor no valida ese escenario.
- Opciones de despliegue: vLLM v0.34.0 con ZenDNN/ZenTorch, PyTorch v2.14.0+cpu, Transformers v5.20.2, LLM Compressor v0.14.0, Python 3.12.16. Sistema recomendado: Linux.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| amd/granite-4.0-h-tiny-reap-50-llmcompressor | ~3,92 B | no disponible | apache-2.0 | Poda REAP 50% de expertos, BF16, orientado a CPU AMD |
| ibm-granite/granite-4.0-h-tiny (base) | no disponible en la informacion | no disponible | apache-2.0 | Modelo original, 64 expertos por capa, 12,9 GiB en disco |
| Otras variantes de Granite 4.0-h | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

## Limitaciones y advertencias

- La poda elimina el 50% de expertos enrutados sin ajuste fino posterior documentado; la perdida de calidad respecto al modelo base no se cuantifica en la model card.
- Solo se declara soporte de ingles (`en`); el rendimiento en otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a modelos de lenguaje; no se documentan mitigaciones especificas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Longitud de contexto no especificada en la model card; conviene consultar la del modelo base antes de desplegar.
- El checkpoint no incluye `quantization_config`; es una poda estructural, no una cuantizacion, por lo que no se beneficia de kernels de cuantizacion.
- El stack validado es especifico (vLLM 0.34.0, Transformers 5.20.2, PyTorch 2.14.0+cpu, ZenDNN/ZenTorch); otros entornos pueden no estar soportados.
- Licencia Apache-2.0 permisiva para uso comercial, sujeta a los terminos del modelo base.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/granite-4.0-h-tiny-reap-50-llmcompressor
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-tiny
- LLM Compressor (repositorio): https://github.com/vllm-project/llm-compressor
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- Dataset de calibracion: https://huggingface.co/datasets/allenai/tulu-3-sft-personas-math
