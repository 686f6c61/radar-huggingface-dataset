# Anbeeld/Qwen3.5-35B-A3B-DFlash-GGUF

## Resumen

Anbeeld/Qwen3.5-35B-A3B-DFlash-GGUF es una cuantizacion GGUF del modelo de borrador DFlash (`z-lab/Qwen3.5-35B-A3B-DFlash`), desarrollado conjuntamente por Z-Lab y Modal para acelerar la inferencia del modelo principal Qwen 3.5 35B A3B mediante decodificacion especulativa. No es un modelo de lenguaje autonomo, sino un componente auxiliar que propone secuencias de tokens en paralelo usando una arquitectura de difusion por bloques (block diffusion), que el modelo objetivo verifica posteriormente. Su objetivo es aumentar el throughput y reducir la latencia en servidores de inferencia sin alterar la distribucion de salida del modelo principal.

El modelo base Qwen 3.5 35B A3B es un MoE hibrido con atencion lineal y 35B parametros totales (3B activos), licenciado bajo Apache 2.0. El draft model DFlash tiene aproximadamente 386M parametros y fue entrenado con una longitud de secuencia de 40k tokens y atencion de ventana deslizante. Este repositorio GGUF permite ejecutar el draft model con BeeLlama.cpp, un fork de llama.cpp con funciones de cuantizacion avanzadas, ademas de los servidores SGLang y vLLM que ya soportan o estan integrando DFlash.

La relevancia actual de este modelo radica en que la decodificacion especulativa es una de las tecnicas mas efectivas para reducir el coste de inferencia de modelos grandes en produccion. DFlash alcanza aceleraciones de hasta 3.71x en concurrencia 1 y 2.89x en concurrencia 32 frente al baseline autoregresivo, superando al mecanismo MTP (multi-token prediction) integrado en Qwen en la mayoria de configuraciones evaluadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block diffusion draft model (DFlash) para decodificacion especulativa; basado en Qwen3.5-35B-A3B (MoE hibrido con atencion lineal) |
| Parametros totales | 385.906.176 (~386M) |
| Parametros activos | No disponible (no se especifica si es MoE; probablemente denso) |
| Longitud de contexto | 40.000 tokens (según entrenamiento) |
| Tipos de cuantizacion | No disponibles (repositorio GGUF; no se listan los archivos individuales) |
| Idiomas soportados | No disponibles (modelo auxiliar, no de generacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien safetensors en el repositorio original) |

## Arquitectura y entrenamiento

DFlash es un modelo de difusion por bloques (block diffusion) ligero, disenado especificamente para proponer multiples tokens en paralelo en un esquema de decodificacion especulativa. A diferencia de los draft models autoregresivos tradicionales, DFlash genera bloques de tokens de forma no secuencial mediante un proceso de difusion, lo que permite una mayor longitud de aceptacion por parte del modelo objetivo y un mayor paralelismo en el hardware.

El modelo fue entrenado por Z-Lab y Modal con una longitud de secuencia de 40.000 tokens y atencion de ventana deslizante (sliding-window attention) para mejorar el rendimiento en contextos largos. El entrenamiento conjunto (joint retrain) se realizo sobre el modelo base Qwen 3.5 35B A3B, aunque el draft model en si es mucho mas pequeno (~386M parametros). No se han publicado detalles sobre el dataset de entrenamiento ni sobre el uso de tecnicas de alineacion como RLHF o DPO, ya que al ser un modelo auxiliar no requiere capacidades conversacionales propias. La innovacion principal reside en el uso de difusion por bloques para la propuesta especulativa, que se combina con el modelo objetivo mediante un servidor de inferencia que verifica las propuestas y corrige las desviaciones.

## Capacidades

- Proposicion especulativa de tokens: genera bloques de tokens candidatos en paralelo para que el modelo objetivo los verifique, acelerando la decodificacion sin cambiar la distribucion de salida.
- Compatibilidad con decodificacion especulativa DFlash en SGLang: soporta los parametros `--speculative-algorithm DFLASH`, `--speculative-draft-model-path` y tamaños de bloque de 4, 8 y 16.
- Integracion con BeeLlama.cpp: un fork de llama.cpp con funciones de cuantizacion avanzadas, permitiendo ejecutar el draft model en entornos locales.
- Soporte en vLLM: existe un pull request abierto ([vllm-project/vllm#40898](https://github.com/vllm-project/vllm/pull/40898)) para integrar DFlash, aunque aun no esta mergeado.
- No es un modelo de lenguaje autonomo: no genera texto por si mismo ni tiene capacidades de chat, tool calling, agentes, vision o audio. Su unica funcion es servir como borrador para el modelo objetivo Qwen3.5-35B-A3B.

## Casos de uso

- Despliegue de servidores de inferencia de alto rendimiento para Qwen3.5-35B-A3B: al integrar DFlash con SGLang, se consiguen mejoras de throughput de hasta 3.71x en concurrencia 1 y 2.89x en concurrencia 32, lo que reduce el coste por token y la latencia en APIs de produccion.
- Reduccion de latencia en aplicaciones interactivas de chat: con un bloque de tamaño 16, se logran hasta 1128 tokens/s en HumanEval con concurrencia 1, adecuado para asistentes conversacionales con respuesta en tiempo real.
- Servicios de generacion de codigo y razonamiento matematico: los benchmarks muestran aceleraciones consistentes en GSM8K, MATH500, HumanEval, MBPP y MT-Bench, siendo util para entornos de autocompletado o agentes de codigo.
- Optimizacion de costes en infraestructura GPU: al aumentar el throughput por GPU, se reduce el numero de GPUs necesarias para servir la misma carga, especialmente en despliegues con batching continuo.
- Evaluacion de tecnicas de decodificacion especulativa: este modelo sirve como referencia para comparar DFlash frente a MTP u otros metodos de borrador en entornos de investigacion.
- Inferencia local con BeeLlama.cpp: para desarrolladores que quieran probar la decodificacion especulativa en maquinas con recursos limitados, usando cuantizaciones GGUF del draft model junto al modelo principal cuantizado.

## Benchmarks y rendimiento

Los resultados publicados en el repositorio miden el throughput (tokens de salida por segundo) y el speedup relativo al baseline autoregresivo, comparando DFlash con el mecanismo MTP integrado en Qwen. Las pruebas se realizaron en una GPU NVIDIA B200 con SGLang, tensor parallel 1, bfloat16, y workloads de GSM8K, MATH500, HumanEval, MBPP y MT-Bench. Cada celda muestra `output tok/s (speedup)`.

### Concurrencia 1

| Workload | Baseline | MTP steps=3 | DFlash block=4 | MTP steps=7 | DFlash block=8 | MTP steps=15 | DFlash block=16 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GSM8K | 310.0 (1.00x) | 622.5 (2.01x) | 695.9 (2.24x) | 652.8 (2.11x) | 905.1 (2.92x) | 508.7 (1.64x) | **939.2 (3.03x)** |
| MATH500 | 308.0 (1.00x) | 645.7 (2.10x) | 723.2 (2.35x) | 710.1 (2.31x) | 995.6 (3.23x) | 569.8 (1.85x) | **1096.1 (3.56x)** |
| HumanEval | 304.4 (1.00x) | 617.3 (2.03x) | 721.0 (2.37x) | 672.4 (2.21x) | 989.3 (3.25x) | 538.6 (1.77x) | **1128.1 (3.71x)** |
| MBPP | 309.0 (1.00x) | 605.4 (1.96x) | 717.3 (2.32x) | 619.8 (2.01x) | 949.4 (3.07x) | 468.6 (1.52x) | **1006.7 (3.26x)** |
| MT-Bench | 307.9 (1.00x) | 571.5 (1.86x) | 630.2 (2.05x) | 555.8 (1.81x) | **736.0 (2.39x)** | 407.3 (1.32x) | 727.1 (2.36x) |

### Concurrencia 32

| Workload | Baseline | MTP steps=3 | DFlash block=4 | MTP steps=7 | DFlash block=8 | MTP steps=15 | DFlash block=16 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GSM8K | 3453.8 (1.00x) | 6298.1 (1.82x) | 7145.2 (2.07x) | 6953.7 (2.01x) | **8863.0 (2.57x)** | 5730.2 (1.66x) | 8275.6 (2.40x) |
| MATH500 | 3395.2 (1.00x) | 6679.7 (1.97x) | 7380.6 (2.17x) | 7771.4 (2.29x) | **9803.0 (2.89x)** | 6632.1 (1.95x) | 9776.9 (2.88x) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K como metricas de exactitud) para este modelo, ya que al ser un draft model no altera la calidad del modelo objetivo. Los datos presentados se centran en rendimiento de inferencia.

## Requisitos de hardware

- El draft model DFlash tiene solo ~386M parametros, por lo que su huella de memoria es minima (menos de 1 GB en FP16, menos aun en cuantizaciones GGUF). Puede ejecutarse en cualquier GPU moderna, incluso integradas.
- Sin embargo, para la decodificacion especulativa se necesita tambien cargar el modelo objetivo Qwen3.5-35B-A3B, que tiene 35B parametros totales (3B activos). En cuantizacion Q4, el modelo principal ocupa aproximadamente 20-24 GB de VRAM, por lo que se requiere una GPU con al menos 24 GB (por ejemplo, RTX 4090, A100 40GB, B200) o varias GPUs con tensor parallelism.
- Los benchmarks oficiales se realizaron en una NVIDIA B200 con tensor parallel size 1 y bfloat16, lo que sugiere que la configuracion recomendada para maximizar rendimiento es una GPU de gama alta con soporte para FA4/TRT-LLM attention y FlashInfer.
- Para despliegue en produccion, se recomienda usar SGLang con los flags especificados en el README (atención `trtllm_mha`, draft attention `fa4`, linear attention `flashinfer`).
- En entornos locales, BeeLlama.cpp permite usar cuantizaciones GGUF tanto del draft como del modelo principal, aunque el rendimiento dependera del hardware. Con una RTX 4090 y cuantizacion Q4 del modelo principal, es posible ejecutar el sistema completo, aunque con menor throughput que en B200.
- Latencia y throughput estimados: los benchmarks muestran entre 736 y 1128 tokens/s en concurrencia 1 y entre 8863 y 9803 tokens/s en concurrencia 32 con DFlash block=8/16 en B200. En hardware consumer, las cifras seran significativamente menores (tipicamente entre 50 y 200 tokens/s para el modelo principal cuantizado en una RTX 4090, con speedups proporcionales al uso de DFlash).

## Comparativa con modelos similares

La comparacion natural es contra el mecanismo MTP (multi-token prediction) integrado en Qwen 3.5 35B A3B, que es la alternativa oficial de decodificacion especulativa. DFlash supera a MTP en todos los workloads y configuraciones evaluadas en los benchmarks del repositorio.

| Modelo/Metodo | Parametros | Contexto | Rendimiento (speedup vs baseline) | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| DFlash (este modelo) | ~386M | 40k tokens | Hasta 3.71x (concurrencia 1) y 2.89x (concurrencia 32) | Apache 2.0 | SGLang, vLLM (PR pendiente), BeeLlama.cpp |
| MTP de Qwen (integrado) | No especificado | 40k tokens | Hasta 2.10x (concurrencia 1) y 2.29x (concurrencia 32) | Apache 2.0 | Integrado en SGLang |
| Otros draft models (EAGLE, Medusa) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos con otros draft models externos como EAGLE o Medusa en la informacion proporcionada. La ventaja clave de DFlash es su arquitectura de difusion por bloques, que permite longitudes de aceptacion mayores que los metodos autoregresivos tradicionales.

## Limitaciones y advertencias

- No es un modelo autonomo: DFlash no genera texto por si mismo y no puede usarse como un LLM independiente. Requiere obligatoriamente el modelo objetivo Qwen3.5-35B-A3B cargado en el mismo servidor de inferencia.
- Dependencia de software especifico: la decodificacion especulativa DFlash solo funciona con SGLang (version reciente) o BeeLlama.cpp. El soporte en vLLM aun no esta mergeado (PR #40898), por lo que su uso en entornos vLLM no es posible de momento.
- Requisitos de backend: el rendimiento optimo exige backends de atencion especificos (TRT-LLM, FA4, FlashInfer) que pueden no estar disponibles en todas las plataformas o versiones de CUDA.
- Sesgos y alucinaciones: al ser un modelo auxiliar, no introduce sesgos propios, pero hereda los del modelo objetivo. No se han evaluado sesgos especificos del draft model.
- Limitaciones de contexto: aunque se entrenó con 40k tokens, el rendimiento en contextos mas largos no esta garantizado y depende de la ventana del modelo principal.
- Cuantizaciones no documentadas: el repositorio GGUF no lista los archivos de cuantizacion individuales ni sus calidades, por lo que el usuario debe verificar manualmente la compatibilidad con BeeLlama.cpp.
- Idiomas: no se especifican los idiomas soportados; al ser un modelo de borrador, su funcion es independiente del idioma, pero la calidad de las propuestas puede verse afectada en idiomas poco representados en el entrenamiento del modelo objetivo.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/Anbeeld/Qwen3.5-35B-A3B-DFlash-GGUF
- Modelo draft original (safetensors): https://huggingface.co/z-lab/Qwen3.5-35B-A3B-DFlash
- Espejo del draft model: https://huggingface.co/modal-labs/Qwen3.5-35B-A3B-DFlash
- Modelo objetivo Qwen 3.5 35B A3B: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Paper DFlash: https://arxiv.org/abs/2602.06036
- Repositorio GitHub DFlash: https://github.com/z-lab/dflash
- Blog del proyecto: https://z-lab.ai/projects/dflash
- BeeLlama.cpp (fork de llama.cpp): https://github.com/Anbeeld/beellama.cpp
- PR de vLLM para DFlash: https://github.com/vllm-project/vllm/pull/40898
