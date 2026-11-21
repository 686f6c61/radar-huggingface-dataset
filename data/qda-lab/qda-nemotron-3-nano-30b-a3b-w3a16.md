# qda-lab/QDA-Nemotron-3-Nano-30B-A3B-W3A16

## Resumen

QDA-Nemotron-3-Nano-30B-A3B-W3A16 es una cuantizacion a 3 bits de los pesos del modelo NVIDIA-Nemotron-3-Nano-30B-A3B-BF16, publicada por el laboratorio qda-lab. Se trata de un checkpoint derivado, no de un modelo entrenado desde cero: mantiene la arquitectura original de NVIDIA (hibrida, tipo `nemotron_h`, con 31.577.940.288 parametros totales y activacion tipo MoE de 30B-A3B) y reduce el peso en disco de 63,2 GB en BF16 a 14,7 GB, es decir, un factor de 4,3x, conservando segun el autor el 98,1 % de la precision del modelo base.

La relevancia de esta ficha esta en el formato de cuantizacion: pesos en enteros de 3 bits agrupados de 64 en 64, generados con GPTQ, con capas criticas (Mamba, atencion y expertos compartidos) en 8 o 4 bits, routers MoE y cabeza de salida en BF16, y un kernel de computo W3A16 empaquetado con `compressed-tensors`. Esto permite ejecutar un modelo de 30B en una sola GPU de 24-48 GB con perdida media de solo 1,5 puntos en el conjunto de benchmarks reportado.

El modelo esta pensado para inferencia con vLLM (SGLang aun no soporta este formato de 3 bits) sobre GPUs NVIDIA H100, A100, L40S, RTX Pro 6000 y B200. La licencia es la NVIDIA Nemotron Open Model License, identica a la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido `nemotron_h` (atencion + Mamba + MoE), segun tags del repo |
| Parametros totales | 31.577.940.288 (31,58B) |
| Parametros activos | no disponible (el nombre indica A3B, ~3B activos, pero no se detalla en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W3A16: pesos INT3 en grupos de 64 (GPTQ), capas Mamba/atencion/expertos compartidos en 8 o 4 bits, routers MoE y cabeza de salida en BF16 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors con `compressed-tensors` (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base de NVIDIA, etiquetada como `nemotron_h` e identificada en la model card como un hibrido con capas Mamba, capas de atencion y expertos compartidos, lo que sugiere un diseno Mixture-of-Experts con componentes de espacio de estados. El nombre comercial "30B-A3B" indica 30B parametros totales y aproximadamente 3B activos por token, aunque la informacion disponible no desglosa el numero exacto de expertos ni la distribucion de capas.

El proceso de cuantizacion es el elemento diferencial: los pesos se cuantizan a INT3 en grupos de 64 mediante GPTQ, con un recetario seleccionado por busqueda automatizada del propio framework QDA (descrito en el paper arXiv:2611.23388, "QDA: Closed-Loop LLM Quantization Design with Agents"). Algunas capas sensibles se mantienen en 8 o 4 bits y los routers MoE y la cabeza de salida permanecen en BF16 para preservar el enrutamiento y la calidad de la distribucion de salida. La receta completa es reproducible: el rebuild tardo 1361 s en 4x H100 (80 GB), aunque los pesos reconstruidos no son identicos bit a bit al checkpoint publicado. No se dispone de informacion sobre los datos de entrenamiento originales de NVIDIA (numero de tokens, composicion, RLHF/DPO) en la documentacion proporcionada.

## Capacidades

- Generacion de texto conversacional y razonamiento en modo "thinking" (el razonamiento termina en el token `</think>`).
- Razonamiento matematico de competicion: los benchmarks reportados incluyen AIME 2025 y HMMT Feb 2026 con pass@1 superior al 70 %.
- Razonamiento cientifico de nivel graduado: evaluado en GPQA-Diamond.
- Generacion de codigo: evaluado en LiveCodeBench.
- Seguimiento de instrucciones: evaluado en IFBench.
- Conocimiento general y multidisciplinar: evaluado en MMLU-Pro.
- Soporte de decodificacion especulativa mediante MTP (multi-token prediction), desactivada por defecto en la evaluacion pero presente en el modelo base.
- Capacidades de tool calling, agentes y multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido: el modelo mantiene 84,7 en AIME 2025 frente a 84,8 del BF16, por lo que puede usarse como solver de problemas de competicion en entornos con VRAM limitada, con modo thinking activado y hasta 81.920 tokens nuevos por respuesta.
- Analisis cientifico y QA de nivel experto: con 74,3 en GPQA-Diamond, es adecuado para asistentes de investigacion que respondan preguntas de fisica, quimica o biologia de posgrado, desplegado en una sola A100 o L40S.
- Generacion de codigo en pipelines de CI/CD: sus 68,8 en LiveCodeBench permiten integrarlo como revisor o generador de parches en herramientas de desarrollo, siempre que el backend sea vLLM con el kernel W3A16.
- Despliegue en infraestructura de gama media: al ocupar 14,7 GB en disco, cabe en GPUs consumer de 24 GB (RTX 4090, RTX 3090) y en RTX Pro 6000, lo que habilita prototipos de razonamiento avanzado sin clústeres multi-GPU.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir la degradacion de un modelo MoE hibrido a 3 bits frente a su version BF16, con un protocolo de evaluacion documentado (pass@1 promediado sobre 1-32 semillas, temperature 1.0, top-p 1.0).
- Servicio de inferencia de bajo coste: al reducir el peso 4,3x, permite aumentar la densidad de replicas por GPU en un servidor vLLM, con la contrapartida de requerir CUDA 13 o la configuracion manual de `LD_LIBRARY_PATH` descrita por el autor.
- Reproduccion de recetas de cuantizacion: el repositorio QDA y la receta YAML publicada permiten reconstruir el checkpoint y adaptar el esquema W3A16 a otros modelos, util para equipos de infraestructura que quieran estandarizar su proceso de compresion.

## Benchmarks y rendimiento

Resultados reportados por el autor (modo thinking, pass@1 promediado sobre varias semillas, mismas condiciones para ambos modelos):

| Benchmark | BF16 (63,2 GB) | QDA W3A16 (14,7 GB) | Delta |
|---|---|---|---|
| AIME 2025 | 84,8 | 84,7 | -0,1 |
| HMMT Feb 2026 | 73,0 | 71,6 | -1,4 |
| GPQA-Diamond | 75,2 | 74,3 | -0,9 |
| IFBench | 74,8 | 74,3 | -0,5 |
| MMLU-Pro | 71,3 | 66,9 | -4,4 |
| LiveCodeBench | 70,2 | 68,8 | -1,4 |
| **Media** | **74,9** | **73,4** | **-1,5** |

Configuracion de evaluacion: max new tokens de 81.920 (32.768 en MMLU-Pro), temperature 1.0, top-p 1.0, top-k -1, min-p 0, presence penalty 0, repetition penalty 1.0, thinking activado y MTP/decodificacion especulativa desactivada. Replicas: 32 semillas en AIME y HMMT, 16 en GPQA e IFBench, 1 en MMLU-Pro y 4 en LiveCodeBench.

## Requisitos de hardware

- VRAM estimada para inferencia: 14,7 GB de pesos en disco; con overhead de activaciones y KV cache, se recomienda al menos 24 GB de VRAM para contextos moderados. Para contextos largos (hasta 81.920 tokens de generacion) se aconseja 48 GB o mas.
- GPUs validadas por el autor: NVIDIA H100, A100, L40S, RTX Pro 6000 y B200. El rebuild se hizo en 4x H100 (80 GB).
- GPU consumer: cabe en RTX 4090 y RTX 3090 (24 GB) para contextos cortos; en RTX Pro 6000 (96 GB) con margen amplio.
- Backend de despliegue: exclusivamente vLLM por ahora (SGLang no soporta este formato de 3 bits). Comando: `VLLM_DISABLED_KERNELS=MacheteLinearKernel vllm serve qda-lab/QDA-Nemotron-3-Nano-30B-A3B-W3A16`.
- Requisito de toolchain: sin CUDA 13 instalado, la compilacion del kernel W3A16 falla (`libnvrtc-builtins.so.13.0`); hay que exportar `LD_LIBRARY_PATH` con las librerias NVIDIA del venv. En una GB300 sin toolkit, el arranque tardo 340 s tras aplicar el workaround.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QDA-Nemotron-3-Nano-30B-A3B-W3A16 | 31,58B (A3B) | no disponible | safetensors INT3/INT4/INT8 + BF16 | NVIDIA Nemotron Open Model License | HF, vLLM |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 31,58B (A3B) | no disponible | safetensors BF16 | NVIDIA Nemotron Open Model License | HF, vLLM, SGLang |
| QDA-Qwen3.5-4B-W3A16 (mismo autor) | no disponible | no disponible | safetensors W3A16 | no disponible | HF, vLLM |

La comparacion principal es con el modelo base BF16: misma arquitectura y licencia, pero 4,3x mas pesado y con 1,5 puntos mas de media en benchmarks. Frente a otros modelos de la misma categoria (30B MoE con ~3B activos), no se dispone de datos en la informacion proporcionada.

## Limitaciones y advertencias

- La mayor degradacion se concentra en MMLU-Pro (-4,4 puntos), lo que indica perdida de conocimiento factual general; no recomendable para tareas de recall enciclopedico sin validacion.
- Requiere vLLM: SGLang no soporta el formato de 3 bits, lo que limita la portabilidad y el ecosistema de despliegue.
- Dependencia de CUDA 13 o de un workaround manual de `LD_LIBRARY_PATH`; en entornos sin toolkit el arranque falla o se retrasa varios minutos.
- Los pesos reconstruidos con la receta no son identicos bit a bit al checkpoint publicado, lo que complica la auditoria exacta.
- Licencia NVIDIA Nemotron Open Model License: es necesario revisar sus terminos para uso comercial, ya que no es una licencia OSI estandar.
- No hay informacion sobre sesgos, idiomas soportados ni tasas de alucinacion; el modelo base es de NVIDIA y hereda sus caveats, pero no se documentan aqui.
- La evaluacion usa pass@1 con multiples semillas y modo thinking activado; el rendimiento en modo no-thinking o con prompts cortos no esta reportado.
- El checkpoint tiene 905 descargas y 0 likes en el momento de la ficha; es un artefacto reciente con validacion comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Nemotron-3-Nano-30B-A3B-W3A16
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Paper QDA: https://arxiv.org/abs/2611.23388
- Repositorio QDA: https://github.com/humanfia/qda
- Receta de cuantizacion: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/blob/main/QDA-Nemotron-3-Nano-30B-A3B-W3A16/nemotron-3-nano-30b-a3b-w3a16.yaml
- Inputs de la receta: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-Nemotron-3-Nano-30B-A3B-W3A16
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
