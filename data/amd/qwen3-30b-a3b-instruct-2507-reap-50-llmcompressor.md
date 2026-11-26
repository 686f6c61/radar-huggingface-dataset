# amd/Qwen3-30B-A3B-Instruct-2507-reap-50-llmcompressor

## Resumen

Qwen3-30B-A3B-Instruct-2507-reap-50-llmcompressor es una version podada estructuralmente del modelo Qwen3-30B-A3B-Instruct-2507 de Alibaba, publicada por AMD. El proceso aplica REAP (Router-weighted Expert Activation Pruning) al 50% de los expertos de cada capa MoE, reduciendo el numero de expertos por capa de 128 a 64 en las 48 capas del decodificador. El resultado conserva la arquitectura Qwen3MoeForCausalLM y los pesos en BF16, pero rebaja el total de parametros de los aproximadamente 30.500 millones del modelo original a 16.030 millones.

El objetivo es doble: por un lado, reducir el tamano en disco de 56,9 GiB a 29,9 GiB (~48% menos), y por otro, ofrecer un checkpoint optimizado para inferencia en CPU sobre hardware AMD EPYC mediante ZenDNN y ZenTorch. La poda mantiene intactos los modulos de atencion, embeddings, lm_head y layer norms, y solo elimina expertos enrutados y las filas correspondientes del router.

Es relevante porque demuestra una via practica para servir modelos MoE de gran tamano en CPU con perdida minima de calidad: en GSM8K 5-shot el modelo retiene el 97,15% del rendimiento del baseline BF16 sin podar. La licencia Apache 2.0 y el formato compressed-tensors facilitan su integracion en stacks de produccion basados en vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3MoeForCausalLM (transformer MoE, decoder-only) |
| Parametros totales | 16.030.316.544 (~16,0 mil millones) |
| Parametros activos | no disponible (top-8 sobre 64 expertos por capa; el modelo base activa ~3 mil millones con top-8 sobre 128) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16 (checkpoint sin `quantization_config`; la poda es estructural, no de cuantizacion) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors |
| Numero de capas | 48 capas de decodificador |
| Expertos por capa | 64 (tras poda; original 128) |
| Top-k del router | 8 |
| Tamano en disco | 29,9 GiB (original 56,9 GiB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B-Instruct-2507, un transformer MoE decoder-only con 48 capas y 128 expertos por capa, del que se seleccionan top-8 por token. AMD aplica REAP mediante LLM Compressor v0.14.0: cada experto se puntua por su contribucion real a la salida de la capa, ponderando la magnitud de activacion por la probabilidad que le asigna el router, y se descarta la mitad con menor puntuacion. La calibracion usa 512 muestras del dataset `perfectblend` con longitud maxima de secuencia de 2048 y `moe_calibrate_all_experts=False`, de modo que cada experto se mide solo con los tokens que realmente le enrutan.

La poda elimina los tensores `mlp.experts.*.{gate,up,down}_proj` y las filas correspondientes de `mlp.gate.weight`, que queda con forma `[64, 2048]`. Se conservan intactos `self_attn.{q,k,v,o}_proj` con sus q/k norms, `lm_head`, `embed_tokens` y las layer norms. Como Qwen3 almacena un tensor 2D por experto en lugar de un stack 3D fusionado, los hooks de poda se aplican directamente sin necesidad de `load_context()` ni repack. No hubo reentrenamiento posterior a la poda ni cuantizacion: todos los tensores permanecen en BF16.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento y matematicas basicas (validado en GSM8K 5-shot con 0,9303).
- Capacidades heredadas del modelo base Qwen3-30B-A3B-Instruct-2507 (el modelo base soporta instrucciones y conversacion; la model card no detalla capacidades adicionales especificas de esta version podada).
- Inferencia optimizada en CPU AMD EPYC mediante ZenDNN y ZenTorch.
- Compatibilidad con vLLM v0.34.0 para servir el modelo.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun los metadatos de idioma.

## Casos de uso

- Servicio de inferencia en CPU sin GPU: el modelo esta disenado para desplegarse en servidores AMD EPYC con ZenDNN, lo que permite ofrecer generacion de texto en entornos donde no hay aceleradores disponibles o donde el coste por token en GPU no es viable.
- Despliegue en infraestructura AMD existente: organizaciones con flotas EPYC pueden reutilizar su hardware de CPU para servir un modelo de 16.000 millones de parametros con 29,9 GiB de pesos, aprovechando el stack ZenTorch/PyTorch CPU.
- Reduccion de huella de almacenamiento y memoria: el checkpoint ocupa un 48% menos que el original (29,9 GiB frente a 56,9 GiB), lo que simplifica la distribucion de artefactos y reduce los requisitos de RAM por instancia.
- Evaluacion de tecnicas de poda MoE: sirve como referencia reproducible para estudiar el impacto de REAP al 50% sobre calidad, con un script de oneshot documentado en la model card.
- Prototipado y desarrollo local en servidores sin GPU: al ejecutarse en vLLM con backend CPU, permite iterar sobre prompts y pipelines conversacionales en maquinas de desarrollo con muchos nucleos.
- Tareas de generacion de texto en ingles con requisitos moderados de razonamiento: el 97,15% de recuperacion en GSM8K indica que puede usarse para clasificacion, resumen o respuesta a preguntas simples donde la perdida de calidad respecto al modelo completo es aceptable.

## Benchmarks y rendimiento

| Benchmark | BF16 baseline (Qwen3-30B-A3B-Instruct-2507) | REAP-50 (este modelo) | Recuperacion |
|---|---|---|---|
| GSM8K (5-shot) | 0,9575 | 0,9303 | 97,15% |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica de forma directa; el modelo esta orientado a inferencia en CPU. En GPU, los pesos BF16 de 29,9 GiB requieren al menos 30-32 GB de memoria, por lo que cabria en una A100 40/80 GB, H100 o en una RTX 5090 (32 GB) con margen ajustado; no cabe en GPUs consumer de 24 GB (RTX 4090, 3090) sin cuantizacion adicional.
- GPU recomendadas: no especificadas por el autor; el soporte declarado es CPU AMD EPYC.
- CPU objetivo: AMD EPYC con ZenDNN y ZenTorch, sistema operativo Linux.
- Cabe en consumer GPU: no con los pesos BF16 actuales; requeriria una cuantizacion adicional (por ejemplo, a INT8 o FP8) no incluida en este checkpoint.
- Opciones de despliegue: vLLM v0.34.0 (motor validado), PyTorch 2.14.0+cpu, Transformers 5.20.2, LLM Compressor 0.14.0, Python 3.12.16. Se recomienda configurar `LD_PRELOAD` con `libomp.so` o `libiomp5.so` para OpenMP.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Expertos por capa | Contexto | Licencia | Formato / nota |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-Instruct-2507-reap-50 (este) | 16,0 mil millones | 64 | no disponible | apache-2.0 | BF16, podado REAP 50%, CPU AMD |
| Qwen/Qwen3-30B-A3B-Instruct-2507 (base) | ~30,5 mil millones | 128 | no disponible | apache-2.0 | BF16, modelo completo |
| Alternativas de poda MoE comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros ni de otros checkpoints podados con REAP en la informacion proporcionada para una comparativa cuantitativa adicional.

## Limitaciones y advertencias

- Perdida de calidad por poda: se elimina el 50% de los expertos, con una recuperacion del 97,15% en GSM8K; el deterioro en otras tareas no esta documentado y puede ser mayor.
- Solo ingles: los metadatos declaran unicamente `en`; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad en la informacion disponible.
- Sesgos: no se documentan analisis de sesgo en la model card; se heredan los del modelo base Qwen3.
- Dependencia de hardware especifico: el rendimiento optimizado asume CPU AMD EPYC con ZenDNN y ZenTorch; en otras plataformas el rendimiento puede degradarse.
- Requisitos de software estrictos: versiones concretas de PyTorch (2.14.0+cpu), Transformers (5.20.2), vLLM (0.34.0) y LLM Compressor (0.14.0); la incompatibilidad de versiones puede impedir la carga.
- Configuracion de OpenMP: es necesario establecer `LD_PRELOAD` con `libomp.so` o `libiomp5.so` antes de lanzar la inferencia para un rendimiento optimo.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y de las dependencias (ZenDNN, ZenTorch) por separado.
- Contexto maximo: no documentado en la informacion proporcionada; conviene verificar la configuracion del modelo base antes de usarlo en produccion con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/Qwen3-30B-A3B-Instruct-2507-reap-50-llmcompressor
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- LLM Compressor (repositorio): https://github.com/vllm-project/llm-compressor
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
