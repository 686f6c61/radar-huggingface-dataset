# amd/granite-4.2-8b-w4a16-llmcompressor

## Resumen

`amd/granite-4.2-8b-w4a16-llmcompressor` es una version cuantizada a 4 bits del modelo `ibm-granite/granite-4.2-8b` de IBM, publicada por AMD para inferencia optimizada en CPU sobre procesadores EPYC. La cuantizacion se ha realizado con LLM Compressor (formato compressed-tensors) mediante el algoritmo GPTQ, aplicando un esquema W4A16: pesos INT4 simetricos con `group_size=128` y activaciones en BF16. El resultado reduce el peso en disco de 16,4 GiB a 5,4 GiB, aproximadamente un 67 % menos.

El modelo mantiene la arquitectura original GraniteForCausalLM (transformer decoder-only denso) con 8.791.592.960 parametros totales, y esta pensado para ejecutarse con vLLM 0.33.0 sobre la pila ZenDNN 6.2.0 / ZenTorch 2.14.0.3 / PyTorch 2.13.0+cpu. Es relevante porque permite desplegar un modelo de 8B en infraestructura de CPU AMD EPYC sin GPU, un escenario habitual en entornos empresariales con servidores ya existentes y donde el coste de anadir aceleradores es prohibitivo.

La ficha del autor no documenta explicitamente la longitud de contexto, los idiomas completos ni el proceso de entrenamiento del modelo base; los datos disponibles se limitan a la informacion de cuantizacion, la evaluacion en GSM8K y los requisitos de la pila de software. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteForCausalLM (transformer decoder-only denso) |
| Parametros totales | 8.791.592.960 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 weight-only (W4A16), simetrica, group-wise con `group_size=128`, almacenada como `pack-quantized`; activaciones BF16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (repo de 5,8 GB; pesos en disco 5,4 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de la familia Granite 4.2 de IBM, con 8.791.592.960 parametros. Esta version no reentrena el modelo: parte de los pesos BF16 de `ibm-granite/granite-4.2-8b` y aplica cuantizacion post-entrenamiento con LLM Compressor v0.14.0 mediante GPTQ. Se cuantizan las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y las del MLP (`gate_proj`, `up_proj`, `down_proj`) en las 40 capas, es decir, 280 matrices lineales en total. Se mantienen en BF16 el `lm_head`, los `embed_tokens` y las layer norms.

La calibracion de GPTQ utiliza 128 ejemplos del split `train_sft` de `HuggingFaceH4/ultrachat_200k`, con longitud maxima de secuencia de 2048 tokens. El checkpoint resultante sirve tanto para la ruta W4A16 como para DA8W4 (activaciones INT8 dinamicas, pesos INT4) sobre CPUs Zen, que es la ruta por defecto en vLLM mediante `VLLM_CPU_INT4_W4A8=1`; para forzar W4A16 hay que definir `VLLM_CPU_INT4_W4A8=0`. No se documentan en la informacion disponible detalles sobre el dataset de preentrenamiento del modelo base, el numero de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de plantilla de chat (la evaluacion usa `--apply_chat_template`).
- Razonamiento matematico: el modelo base obtiene 0,9143 en GSM8K 5-shot en BF16, lo que indica capacidad solida de resolucion de problemas aritmeticos de varios pasos.
- Inferencia en CPU sobre AMD EPYC con aceleracion ZenDNN, sin necesidad de GPU.
- Compatibilidad con vLLM como motor de inferencia, lo que habilita batching continuo y servidor compatible con la API de OpenAI.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito para esta version cuantizada.

## Casos de uso

- Despliegue de asistentes conversacionales en servidores AMD EPYC existentes: al ejecutarse en CPU con vLLM, permite servir un modelo de 8B sin adquirir GPU, aprovechando la infraestructura ya instalada en el centro de datos.
- Procesamiento por lotes de documentos en ingles: generacion de resumenes y extraccion de informacion sobre grandes volumenes de texto, donde el throughput agregado importa mas que la latencia por peticion y la CPU resulta economicamente competitiva.
- Backend de chatbot para aplicaciones internas: la licencia Apache 2.0 y el formato compressed-tensors permiten integrarlo en servicios propios con vLLM exponiendo un endpoint compatible con OpenAI.
- Razonamiento aritmetico y validacion de calculos: con una recuperacion del 96,43 % en GSM8K respecto al BF16, es adecuado para tareas de resolucion de problemas matematicos donde un pequeno descenso de precision es aceptable.
- Entornos con requisitos de residencia de datos: al no requerir GPU y poder ejecutarse en servidores on-premise, facilita el cumplimiento de politicas que impiden enviar datos a servicios en la nube.
- Pruebas de concepto y evaluacion de modelos: el reducido peso en disco (5,4 GiB) y la ausencia de dependencia de GPU lo hacen util para prototipar pipelines de generacion de texto en estaciones de trabajo o nodos de computo sin acelerador.

## Benchmarks y rendimiento

| Benchmark | BF16 (base) | W4A16 (este modelo) | Recuperacion |
|---|---|---|---|
| GSM8K (5-shot) | 0,9143 | 0,8817 | 96,43 % |

Es el unico benchmark publicado en la informacion disponible. No se han divulgado resultados de MMLU, HumanEval ni otras tareas para esta version cuantizada, ni datos de latencia o throughput en EPYC.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: el autor indica que el modelo esta optimizado para AMD EPYC y no esta pensado para GPU.
- Memoria: los pesos ocupan 5,4 GiB en disco; en memoria hay que sumar el coste de las activaciones en BF16 y la cache KV, por lo que se recomienda un nodo con al menos 16-32 GB de RAM disponible segun la longitud de contexto y el tamano de lote.
- Software obligatorio: ZenDNN v6.2.0, ZenTorch v2.14.0.3, PyTorch v2.13.0+cpu, Transformers v5.17.0, LLM Compressor v0.14.0 y vLLM v0.33.0. El autor advierte que el modelo puede no cargar correctamente con otras versiones.
- Configuracion de OpenMP: es necesario definir `LD_PRELOAD` con `libomp.so` (LLVM OpenMP) o `libiomp5.so` (Intel OpenMP) antes de lanzar vLLM para obtener el rendimiento optimo.
- No cabe en GPU consumer por diseno: aunque tecnicamente los pesos de 5,4 GiB cabrian en una RTX 4090, el checkpoint esta calibrado y empaquetado para la ruta CPU de vLLM con ZenDNN.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | GSM8K | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| amd/granite-4.2-8b-w4a16-llmcompressor | 8,79B | W4A16 INT4, group_size 128 | no disponible | 0,8817 (5-shot) | Apache 2.0 | CPU AMD EPYC |
| ibm-granite/granite-4.2-8b (BF16) | 8,79B | ninguna (BF16) | no disponible | 0,9143 (5-shot) | Apache 2.0 | GPU o CPU |
| Versiones GGUF de la familia Granite 4.x | ~8B | Q4_K_M y similares | no disponible | no disponible | Apache 2.0 (heredada) | CPU y GPU consumer via llama.cpp |

La comparacion principal es contra el modelo base sin cuantizar: esta version sacrifica un 3,57 % de precision en GSM8K a cambio de reducir el peso un 67 % y habilitar inferencia en CPU EPYC con ZenDNN. Frente a cuantizaciones GGUF genericas, la diferencia esta en el formato (compressed-tensors para vLLM) y en la optimizacion especifica para Zen. No se dispone de datos de benchmarks de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia estricta de versiones: compatible con ZenDNN v6.2.0, ZenTorch v2.14.0.3 y PyTorch v2.13.0+cpu; otras combinaciones pueden fallar al cargar el modelo.
- Solo CPU: no esta destinado a inferencia en GPU, lo que limita su uso a infraestructura AMD EPYC con Linux.
- Perdida de precision por cuantizacion: la cuantizacion weight-only a 4 bits degrada ligeramente el rendimiento; en GSM8K se recupera el 96,43 % del BF16, pero no se han publicado evaluaciones en otras tareas.
- Idioma: la model card declara unicamente ingles, por lo que el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: la longitud de contexto del modelo base no se documenta en la informacion disponible; conviene verificarla antes de disenar aplicaciones con ventanas largas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones de veracidad ni de sesgos para esta version.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe cumplir las condiciones de las dependencias (ZenDNN, ZenTorch, vLLM) y verificar la licencia del modelo base.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion comunitaria es practicamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/granite-4.2-8b-w4a16-llmcompressor
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- LLM Compressor (repositorio): https://github.com/vllm-project/llm-compressor
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Dataset de calibracion: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
