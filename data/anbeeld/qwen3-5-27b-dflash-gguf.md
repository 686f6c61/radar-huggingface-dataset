# Anbeeld/Qwen3.5-27B-DFlash-GGUF

## Resumen

El modelo `Anbeeld/Qwen3.5-27B-DFlash-GGUF` es una versión cuantizada en formato GGUF del modelo draft DFlash desarrollado por Z-Lab y Modal, pensado para acelerar la inferencia del modelo denso Qwen3.5-27B mediante decodificación especulativa. No es un modelo de lenguaje autónomo: su función es proponer bloques de tokens en paralelo que el modelo objetivo (Qwen3.5-27B) verifica posteriormente, lo que permite aumentar el throughput de generación sin alterar la distribución de salida del modelo principal.

El autor del repositorio, Anbeeld, mantiene además un fork de llama.cpp llamado BeeLlama.cpp con características avanzadas de cuantización, por lo que esta versión GGUF está orientada a su uso en ese entorno o en servidores SGLang con soporte para el algoritmo DFlash. El modelo draft se entrenó con una longitud de secuencia de 40 000 tokens y atención de ventana deslizante, y se distribuye bajo licencia Apache 2.0. Su relevancia actual radica en que ofrece una alternativa abierta y ligera a los mecanismos de predicción multi-token (MTP) integrados en Qwen, con mejoras de velocidad documentadas de hasta 6,20x en concurrencia baja y 3,01x en concurrencia alta sobre hardware Blackwell.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block diffusion draft model (modelo de difusión por bloques) |
| Parametros totales | no disponible (modelo ligero, cifra no publicada) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | 40 000 tokens (entrenado con sliding-window attention) |
| Tipos de cuantizacion | no disponibles (repositorio sin archivos publicados al momento de la consulta) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el repositorio base z-lab/Qwen3.5-27B-DFlash usa safetensors) |

## Arquitectura y entrenamiento

DFlash es un modelo draft basado en difusión por bloques (block diffusion). En lugar de predecir tokens uno a uno de forma autorregresiva, el modelo genera varios tokens candidatos en paralelo agrupados en bloques de tamaño configurable (4, 8 o 16). El modelo objetivo verifica esas propuestas en una sola pasada, descartando las que no coinciden con su distribución y aceptando las correctas. Esto reduce el número de iteraciones de decodificación necesarias y mejora el throughput.

El entrenamiento del draft model fue realizado conjuntamente por Z-Lab y Modal, con una longitud de secuencia de 40 000 tokens y atención de ventana deslizante para manejar contextos largos. No se han publicado detalles sobre el número de parámetros, la composición del dataset ni el proceso de alineación (RLHF/DPO). El modelo se distribuye como un componente complementario al modelo Qwen3.5-27B y no puede usarse de forma independiente.

## Capacidades

- Propuesta paralela de tokens: genera bloques de tokens candidatos (tamaño 4, 8 o 16) para decodificación especulativa.
- Compatibilidad con el modelo objetivo Qwen3.5-27B: verifica las propuestas sin modificar la distribución de salida del modelo principal.
- Soporte para servidores de inferencia SGLang con el algoritmo DFLASH y backends de atención FA4, TRT-LLM MHA y FlashInfer.
- Compatibilidad con BeeLlama.cpp, un fork de llama.cpp con características avanzadas de cuantización.
- Entrenado para contextos largos (40 000 tokens) gracias a sliding-window attention.
- No incluye capacidades de generación autónoma, tool calling, razonamiento ni multimodalidad propias; todas las capacidades finales dependen del modelo objetivo.

## Casos de uso

- Servidores de inferencia de alta concurrencia: desplegado junto a Qwen3.5-27B en SGLang, el draft model permite aumentar el throughput en entornos con múltiples peticiones simultáneas, con mejoras documentadas de hasta 3,01x a concurrencia 32.
- Reducción de latencia en aplicaciones interactivas: en escenarios de un solo usuario (concurrencia 1), DFlash alcanza aceleraciones de 4,96x a 6,20x según la carga de trabajo, lo que beneficia a asistentes conversacionales y entornos de desarrollo en tiempo real.
- Despliegue en hardware Blackwell: el modelo está optimizado para GPUs como la B200, aprovechando backends de atención específicos (FA4, TRT-LLM MHA) y fusión de allreduce con FlashInfer.
- Entornos de escritorio con BeeLlama.cpp: al estar disponible en formato GGUF, puede ejecutarse en equipos con GPUs de consumo mediante el fork de llama.cpp, aunque no se han publicado cifras de rendimiento para ese escenario.
- Investigación en decodificación especulativa: el modelo sirve como referencia para estudiar técnicas de difusión por bloques frente a métodos autorregresivos o MTP, con benchmarks públicos en GSM8K, MATH500, HumanEval, MBPP y MT-Bench.
- Integración en pipelines de generación de código y razonamiento matemático: los benchmarks muestran aceleraciones consistentes en tareas de programación (HumanEval, MBPP) y razonamiento (GSM8K, MATH500), lo que lo hace adecuado para servicios de autocompletado o resolución de problemas.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del repositorio z-lab/Qwen3.5-27B-DFlash y corresponden al sistema completo (draft + target) sobre una GPU NVIDIA B200 con SGLang, tensor parallel 1, bfloat16, y decodificación greedy con thinking habilitado y longitud máxima de 4096 tokens. Se comparan contra el baseline autorregresivo y contra el mecanismo MTP integrado de Qwen.

| Carga | Workload | Baseline (tok/s) | MTP steps=3 | DFlash block=4 | MTP steps=7 | DFlash block=8 | MTP steps=15 | DFlash block=16 |
|---|---|---|---|---|---|---|---|---|
| Concurrencia 1 | gsm8k | 92.8 (1.00x) | 250.0 (2.70x) | 262.7 (2.83x) | 306.7 (3.31x) | 393.6 (4.24x) | 269.0 (2.90x) | **460.5 (4.96x)** |
| Concurrencia 1 | math500 | 92.9 (1.00x) | 259.6 (2.80x) | 275.5 (2.97x) | 332.6 (3.58x) | 434.9 (4.68x) | 296.9 (3.20x) | **550.5 (5.93x)** |
| Concurrencia 1 | humaneval | 92.4 (1.00x) | 252.6 (2.73x) | 273.6 (2.96x) | 320.6 (3.47x) | 440.0 (4.76x) | 289.2 (3.13x) | **572.4 (6.20x)** |
| Concurrencia 1 | mbpp | 92.9 (1.00x) | 244.5 (2.63x) | 269.4 (2.90x) | 298.4 (3.21x) | 413.8 (4.45x) | 245.4 (2.64x) | **495.3 (5.33x)** |
| Concurrencia 1 | mt-bench | 93.0 (1.00x) | 228.5 (2.46x) | 239.6 (2.58x) | 254.8 (2.74x) | 323.3 (3.48x) | 210.0 (2.26x) | **350.2 (3.77x)** |
| Concurrencia 32 | gsm8k | 2094.6 (1.00x) | 4652.7 (2.22x) | 4987.3 (2.38x) | 4821.9 (2.30x) | **5643.8 (2.69x)** | 3161.8 (1.51x) | 4108.4 (1.96x) |
| Concurrencia 32 | math500 | 2123.6 (1.00x) | 4972.4 (2.34x) | 5270.3 (2.48x) | 5345.8 (2.52x) | **6339.6 (2.99x)** | 3577.1 (1.68x) | 4990.8 (2.35x) |
| Concurrencia 32 | humaneval | 1972.2 (1.00x) | 4253.9 (2.16x) | 4821.1 (2.44x) | 4581. | no disponible | no disponible | no disponible |

La tabla se trunca en el dato de humaneval a concurrencia 32 porque la información proporcionada se corta en ese punto. En todos los casos donde ambos completaron, DFlash supera a MTP en throughput. El bloque de tamaño 16 ofrece el mejor rendimiento a concurrencia 1, mientras que el bloque de tamaño 8 es el más equilibrado a concurrencia 32.

## Requisitos de hardware

- Los benchmarks oficiales se ejecutaron en una GPU NVIDIA B200 (1 GPU, tensor parallel size 1) con memoria bfloat16.
- El modelo draft es ligero por diseño, pero no se ha publicado su número de parámetros ni su huella de memoria, por lo que no es posible estimar con precisión si cabe en GPUs de consumo (RTX 4090, etc.). La versión GGUF de este repositorio está pensada para BeeLlama.cpp, que sí soporta GPUs consumer, pero no hay cifras de VRAM disponibles.
- Para el uso en SGLang, se recomienda un build reciente con soporte DFlash, FA4/TRT-LLM attention y FlashInfer. El ejemplo de despliegue usa una sola B200 con `--tp-size 1`.
- Backends de atención: `trtllm_mha` para el target, `fa4` para el draft, y `flashinfer` para la atención lineal (prefill y decode).
- Opciones de despliegue: SGLang (recomendado), BeeLlama.cpp (fork de llama.cpp), y vLLM (PR pendiente de fusión, referencia `vllm-project/vllm#40898`).
- No se han publicado datos de latencia ni throughput para configuraciones con GPUs distintas a la B200.

## Comparativa con modelos similares

La alternativa más directa es el mecanismo MTP (multi-token prediction) integrado en Qwen3.5-27B, que también se usa para decodificación especulativa. La siguiente tabla compara ambos enfoques en el mismo hardware y cargas de trabajo, según los datos de la model card.

| Caracteristica | DFlash (block=16) | MTP (steps=15) | MTP (steps=7) |
|---|---|---|---|
| Tipo de propuesta | Difusión por bloques paralela | Predicción multi-token autorregresiva | Predicción multi-token autorregresiva |
| Throughput max (concurrencia 1, humaneval) | 572.4 tok/s (6.20x) | 289.2 tok/s (3.13x) | 320.6 tok/s (3.47x) |
| Throughput max (concurrencia 32, math500) | 6339.6 tok/s (2.99x) | 3577.1 tok/s (1.68x) | 5345.8 tok/s (2.52x) |
| Dependencia de servidor | Requiere SGLang con DFLASH o BeeLlama.cpp | Integrado en SGLang y vLLM | Integrado en SGLang y vLLM |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |

No se dispone de datos comparativos con otros draft models externos (p. ej., EAGLE, Medusa) en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es un LLM autónomo: no puede generar texto por sí mismo y debe emparejarse con Qwen3.5-27B en un servidor con soporte DFlash.
- El repositorio GGUF de Anbeeld no contiene archivos publicados (tamaño 0.0 GB, 0 descargas), por lo que las cuantizaciones específicas no están disponibles y el uso práctico puede verse limitado hasta que se suban los pesos.
- El rendimiento depende críticamente del hardware: las cifras de speedup se obtuvieron en una B200 con backends optimizados; en GPUs consumer o con backends diferentes, los resultados pueden variar sustancialmente.
- No se ha documentado el comportamiento del modelo en idiomas distintos de los soportados por Qwen3.5-27B (los idiomas no están listados para el draft).
- Riesgo de alucinación y sesgos: al ser un modelo draft, no introduce sesgos propios, pero hereda los del modelo objetivo; la verificación del target garantiza que la distribución de salida no cambie, pero no mitiga los sesgos del propio Qwen3.5-27B.
- Para producción, es necesario validar que el servidor SGLang tenga el soporte DFlash activo y que la configuración de bloques (4, 8 o 16) se ajuste a la carga esperada; el bloque 16 es mejor para baja concurrencia y el 8 para alta concurrencia.
- El soporte en vLLM está pendiente de fusión (PR abierta), por lo que no se recomienda su uso en entornos que dependan de vLLM.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/Anbeeld/Qwen3.5-27B-DFlash-GGUF
- Modelo base z-lab: https://huggingface.co/z-lab/Qwen3.5-27B-DFlash
- Modelo espejo modal-labs: https://huggingface.co/modal-labs/Qwen3.5-27B-DFlash
- Modelo objetivo Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Paper DFlash: https://arxiv.org/abs/2602.06036
- Repositorio GitHub DFlash: https://github.com/z-lab/dflash
- Blog de Z-Lab sobre DFlash: https://z-lab.ai/projects/dflash
- BeeLlama.cpp: https://github.com/Anbeeld/beellama.cpp
- PR de soporte vLLM: https://github.com/vllm-project/vllm/pull/40898
- Guía de despliegue local de Qwen 3.5 (incluye DFlash): https://www.oflight.co.jp/en/columns/qwen35-27b-35b-dflash-local-deployment-guide-2026
