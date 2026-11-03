# ISTA-DASLab/Kimi-K3-P48NVFP4-MoESQ

## Resumen

Kimi-K3-P48NVFP4-MoESQ es un checkpoint comprimido de `moonshotai/Kimi-K3`, un modelo de mezcla de expertos (MoE) de escala trillonaria, publicado por el laboratorio ISTA-DASLab. La compresion combina cuantizacion NVFP4 en pesos y activaciones (W4A4) con una poda estructurada paired-4:8 aplicada exclusivamente a los expertos enrutados, y almacena esos expertos de forma dispersa: en disco solo se guardan los valores conservados mas una mascara compacta, en lugar de un tensor NVFP4 denso con ceros. El resultado ocupa 978,2 GiB frente a los 1.453,7 GiB del release original en MXFP4, lo que permite servir el modelo en un unico nodo de 8 GPU B200.

El modelo base tiene 1.758.904.023.680 parametros totales (1,76 billones), 896 expertos enrutados en un espacio latente de 3.584 dimensiones, top-16 y 93 capas. La compresion actua sobre los 2,72 billones de parametros de los expertos enrutados, que pasan de 1.347,1 GiB a 871,7 GiB (factor 0,65, unos 2,75 bits por peso incluyendo escalas y mascara, 5,8 veces menos que en BF16).

Su relevancia es practica: el release MXFP4 original no cabe en un nodo de 8 B200, mientras que esta version si (132 GiB de pesos por GPU). El objetivo son los tensor cores dispersos de NVIDIA Blackwell (SM100 y SM120), con un kernel GEMM agrupado especifico integrado en una version parcheada de vLLM. La recuperacion media en OpenLLM Leaderboard v1 es del 98,3 % respecto al modelo sin comprimir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion Kimi Delta Attention (MLA); 93 capas, 896 expertos enrutados, top-16, espacio latente de 3.584 |
| Parametros totales | 1.758.904.023.680 (1,76 B) |
| Parametros activos | no disponible (los expertos enrutados suman 2,72 B de parametros comprimidos; el numero de parametros activos por token no se publica) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de servicio usan `--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4 W4A4 en expertos enrutados, con poda estructurada paired-4:8 y almacenamiento disperso; torre de vision en BF16; cache KV en FP8 |
| Idiomas soportados | en (ingles) |
| Licencia | kimi-k3 (licencia `other` con nombre propio, enlazada en el repositorio) |
| Formato de pesos | safetensors con `compressed-tensors`, requiere `trust_remote_code` y cargador de almacenamiento disperso propio |

## Arquitectura y entrenamiento

El modelo base Kimi-K3 es un transformer MoE con 93 capas y 896 expertos enrutados que operan en un espacio latente de 3.584 dimensiones con routing top-16. La atencion es Kimi Delta Attention, una variante MLA que mantiene una ranura de estado por secuencia en ejecucion, lo que condiciona el numero maximo de secuencias concurrentes. El release original distribuye los expertos enrutados en MXFP4.

Sobre ese checkpoint, MoESQ aplica una compresion conjunta hardware-nativa: cuantiza pesos y activaciones a NVFP4 (W4A4) y poda los expertos enrutados con un patron paired-4:8, es decir, se conservan 4 valores de cada 8 posiciones segun un criterio de emparejamiento, lo que encaja con los tensor cores dispersos de Blackwell. Los expertos se almacenan de forma dispersa (valores conservados mas mascara), no como tensores densos con ceros. La innovacion central es el kernel: un GEMM agrupado NVFP4 disperso paired-4:8 implementado en CUTLASS para SM100 y SM120, integrado en vLLM mediante el backend MoE `paired48_nvfp4`, con la activacion SiTU de Kimi-K3 fusionada en el epilogo del GEMM1. No se detallan en la informacion disponible los datos de entrenamiento, el numero de tokens ni si hubo RLHF o DPO; el proceso descrito es de compresion post-entrenamiento, no de reentrenamiento.

## Capacidades

- Generacion de texto y razonamiento de largo alcance, con modo de razonamiento configurable (reasoning effort por defecto en las evaluaciones).
- Razonamiento matematico avanzado: 98,33 en AIME25 y 90,00 en MATH-500 segun la evaluacion del autor.
- Generacion de codigo: 62,80 en LiveCodeBench v6 (pass@1 medio sobre 10 semillas).
- Conocimiento general y respuesta a preguntas: 88,68 en MMLU (5-shot).
- Capacidades multimodales: el checkpoint incluye la torre de vision en BF16, aunque el autor indica que no fue evaluada y recomienda `--language-model-only` para servicio solo de texto.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Multilingue: limitado a ingles segun la metadata del modelo.
- Capacidad de contexto largo: la ventana exacta no se publica; los ejemplos de despliegue configuran 32.768 tokens.

## Casos de uso

- Servicio de razonamiento matematico a gran escala: con 98,33 en AIME25 y 90,00 en MATH-500, es adecuado para sistemas de resolucion de problemas competicionales o tutoria matematica automatica, desplegado en un nodo de 8 B200 con TP8 y expert parallel.
- Generacion de codigo en produccion: el rendimiento en LiveCodeBench v6 (62,80) permite integrarlo en pipelines de generacion y revision de codigo; requiere el vLLM parcheado de MoESQ y GPU Blackwell.
- Evaluacion de conocimiento enciclopedico: 88,68 en MMLU lo hace util para tareas de question answering de dominio general en ingles, con verificacion posterior por el riesgo de alucinacion.
- Inferencia de bajo coste por token en clusters Blackwell: la compresion a 2,75 bits por peso en expertos enrutados reduce el ancho de banda de memoria, lo que abarata el coste por token en despliegues con mucha concurrencia (hasta 256 secuencias simultaneas en el ejemplo de una sola maquina).
- Investigacion en compresion de MoE: sirve como referencia reproducible para estudiar el impacto de la cuantizacion W4A4 combinada con poda estructurada paired-4:8, con el codigo de compresion y los kernels publicados.
- Despliegue en estaciones de trabajo con RTX 5090 o RTX PRO 6000 (SM120): el backend soporta SM120, lo que permite probar el modelo en hardware consumer profesional, aunque el checkpoint completo de 978,2 GiB exige agregar varias GPU.
- Servicio solo de texto con contexto de 32.768 tokens: util para analisis de documentos largos en ingles, limitando `--max-num-seqs` por la restriccion de ranuras de estado de Kimi Delta Attention.

## Benchmarks y rendimiento

OpenLLM Leaderboard v1 (media de 6 tareas, lm-evaluation-harness, conjuntos de test completos, few-shot seed 0):

| Tarea | Kimi-K3 (MXFP4) | Este modelo (MoESQ) |
|---|---|---|
| ARC-Challenge (25-shot) | 74,40 | 72,87 |
| HellaSwag (10-shot) | 91,78 | 89,11 |
| MMLU (5-shot) | 91,16 | 88,68 |
| TruthfulQA-MC2 (0-shot) | 60,18 | 60,78 |
| Winogrande (5-shot) | 83,19 | 83,66 |
| GSM8K (5-shot, greedy) | 96,59 | 93,63 |
| **Media** | **82,88** | **81,45 (98,3 % de recuperacion)** |

Razonamiento y codigo (pass@1 medio, temperatura 1,0, top_p 0,95, hasta 65.536 tokens nuevos):

| Benchmark | Kimi-K3 (MXFP4) | Este modelo (MoESQ) | Recuperacion |
|---|---|---|---|
| AIME25 (N=10) | 97,33 ± 1,17 | 98,33 ± 0,69 | 101,0 % |
| GPQA-Diamond (N=5) | 92,42 ± 1,66 | 89,39 ± 1,85 | 96,7 % |
| MATH-500 (N=5) | 89,84 ± 1,11 | 90,00 ± 1,14 | 100,2 % |
| LiveCodeBench v6 (10 semillas) | 57,89 ± 1,21 | 62,80 ± 1,95 | 108,5 % |

La mejora en LiveCodeBench es consistente por problema (+4,9 puntos emparejados, t = 4,5; mejor en 50 de 175 problemas, peor en 16, igual en 109). El autor la reporta tal cual y no afirma que la compresion mejore la codificacion en general.

## Requisitos de hardware

- Checkpoint completo: 978,2 GiB. En un nodo de 8 B200 supone 132 GiB de pesos por GPU.
- GPU soportadas: NVIDIA Blackwell SM100 (B200, GB200) y SM120 (RTX 5090, RTX PRO 6000). No soportadas: SM103 (B300) ni SM121 (DGX Spark).
- Toolkit: CUDA >= 12.8 y kernels v0.14.0 o posteriores (anaden la activacion SiTU). La ruta SiTU solo se ha probado en SM100.
- Consumer GPU: tecnicamente el backend cubre SM120 (RTX 5090, RTX PRO 6000), pero el tamano del checkpoint obliga a agregar varias GPU; no cabe en una sola tarjeta consumer.
- Despliegue: exclusivamente vLLM v0.30.0 parcheado por el repositorio MoESQ (backend `paired48_nvfp4` y cargador de almacenamiento disperso); no carga en vLLM upstream. No se mencionan llama.cpp, Ollama ni TGI.
- Configuracion de referencia: 1 nodo de 8 B200 con TP8 y expert parallel, `--max-num-seqs 256`, `--max-model-len 32768`, `--kv-cache-dtype fp8`, `--attention-backend TOKENSPEED_MLA`; o 2 nodos de 8 B200 con TP8 x PP2 para mas cache KV.
- Restriccion de concurrencia: Kimi Delta Attention reserva una ranura de estado por secuencia y solo caben unas 530 junto a los pesos, por lo que hay que limitar `--max-num-seqs`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / compresion | Licencia | Despliegue |
|---|---|---|---|---|---|
| Kimi-K3-P48NVFP4-MoESQ (este) | 1,76 B totales | no disponible (ejemplos a 32.768) | NVFP4 W4A4 + paired-4:8 disperso, 978,2 GiB | kimi-k3 | vLLM parcheado, 8 B200 |
| Kimi-K3 (MXFP4, original) | 1,76 B totales | no disponible | MXFP4, 1.453,7 GiB | kimi-k3 | vLLM, 2 nodos de 8 B200 |
| Otros checkpoints MoESQ de la coleccion ISTA-DASLab | no disponible | no disponible | NVFP4 + paired-4:8 | no disponible | vLLM parcheado |

No se dispone de datos de benchmarks ni especificaciones de modelos de terceros comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de precision medible: 98,3 % de recuperacion media en OpenLLM Leaderboard v1, con caidas notables en MMLU (-2,48), HellaSwag (-2,67), GSM8K (-2,96) y GPQA-Diamond (-3,03).
- Dependencia estricta de hardware: solo funciona en SM100 y SM120; B300 (SM103) y DGX Spark (SM121) no estan soportados. La ruta de la activacion SiTU solo se ha validado en SM100.
- Dependencia de software: requiere el fork de vLLM v0.30.0 y los kernels del repositorio MoESQ; no es compatible con vLLM upstream ni con otros motores de inferencia conocidos.
- Restriccion de concurrencia por Kimi Delta Attention: solo caben unas 530 ranuras de estado junto a los pesos, lo que limita `--max-num-seqs` y afecta al throughput en escenarios de alta concurrencia.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta documentado.
- Vision no evaluada: la torre de vision esta en el checkpoint pero el autor no la ha evaluado y recomienda el modo solo texto.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de factualidad mas alla de TruthfulQA-MC2 (60,78), un valor moderado.
- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible.
- Licencia: licencia propia `kimi-k3` (categoria `other`); es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier uso comercial.
- El checkpoint tiene 422 descargas y 4 likes en el momento de la consulta, lo que sugiere una validacion comunitaria limitada.

## Enlaces

- HuggingFace: https://huggingface.co/ISTA-DASLab/Kimi-K3-P48NVFP4-MoESQ
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3
- Paper: https://arxiv.org/abs/2610.02241 (Hardware-Native Joint Sparse-Quantization for Trillion-Scale Mixture-of-Experts)
- Codigo: https://github.com/IST-DASLab/MoESQ
- Instrucciones de servicio con vLLM: https://github.com/IST-DASLab/MoESQ#serving-with-vllm
- Coleccion de checkpoints MoESQ: https://huggingface.co/collections/ISTA-DASLab/moesq
