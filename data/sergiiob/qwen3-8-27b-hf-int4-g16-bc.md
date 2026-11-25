# SergiioB/Qwen3.8-27B-HF-INT4-G16-BC

## Resumen

Qwen3.8-27B-HF-INT4-G16-BC es una conversión cuantizada a 4 bits del modelo Qwen3.8-27B-bf16, publicada por el usuario SergiioB. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado cuyo objetivo es ejecutar el modelo base en GPUs Intel Arc Pro B60/B70 (arquitectura Xe2, `bmg_g31`), que carecen de instrucciones nativas FP4/FP8 XMX pero ofrecen el doble de throughput INT8 XMX frente a FP16/BF16. La cuantización emplea el esquema `Had128NoPerm + HF-INT4-G16` con un promedio de 4,260 bits por peso en las matrices del decodificador y vectores de corrección de sesgo (`BiasCorr`) serializados en FP32, excluyendo la posición 0.

El checkpoint conserva en BF16 las embeddings, la `lm_head`, los pesos de visión y los pesos MTP; las 496 capas lineales del decodificador están cuantizadas. El mismo buffer de pesos empaquetado se usa de forma fusionada en dos rutas: decodificación W4A16 con `FWHT-128` en registro para `M <= 4` y prefill W4A8 con DPAS INT8 XMX sin desempaquetado para `M >= 5`, todo dentro de `vllm/vllm-openai-xpu:v0.31.0` con XPU graphs activados.

Su relevancia es de nicho pero concreta: ofrece una ruta de servicio funcional para modelos Qwen de gran tamano en hardware Intel Arc, con ganancias medidas de prefill (1,26x-1,28x) frente al GPTQ-Int4-sym-G128 que se distribuye por defecto, a costa de una decodificación entre un 10 % y un 29 % más lenta según el nivel de concurrencia. El dato de parametros en safetensors (6.862.976.752) no concuerda con la denominación "27B" del nombre del repositorio, lo que conviene tener en cuenta al planificar el despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), según tags `qwen3_5` / `qwen3.5`; detalles de atención no disponibles |
| Parametros totales | 6.862.976.752 según cabecera de safetensors (el nombre del repo indica "27B"; discrepancia no aclarada en la model card) |
| Parametros activos | No aplica (modelo denso; el plugin rechaza tensores MoE empaquetados en el arranque) |
| Longitud de contexto | 36.864 tokens en la configuración de servicio de referencia (`--max-model-len 36864`); máximo nativo del modelo base no disponible |
| Tipos de cuantizacion | INT4 con grupo de 16 (`HF-INT4-G16`, 4,260 bpw en matrices del decodificador); rutas W4A16 (decode) y W4A8 (prefill); embeddings, `lm_head`, visión y MTP en BF16 |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 19,8 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5 con componentes multimodales (pesos de visión preservados en BF16) y pesos MTP (multi-token prediction). Sobre ese checkpoint BF16, el autor aplica una cuantización post-entrenamiento de tipo Hadamard + INT4 con grupo de 16, que transforma las matrices del decodificador con una rotación Hadamard de 128 (`Had128NoPerm`) antes de cuantizar, y anade vectores de corrección de sesgo (`BiasCorr`) en FP32 serializados, excluyendo la posición 0. Las 496 capas lineales del decodificador quedan cuantizadas; el resto de componentes se mantiene en BF16.

No hay información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada. La innovación técnica destacable es la doble ruta de ejecución sobre el mismo buffer empaquetado: decodificación W4A16 con `FWHT-128` fusionado en registro para lotes pequenos (`M <= 4`) y prefill W4A8 mediante DPAS INT8 XMX sin desempaquetado para lotes mayores (`M >= 5`). El proceso de conversión desde BF16 tarda 11,5 minutos (691,7 s) en una única Arc Pro B70, con un pico de 10,9 GiB de RSS y 2,38 GiB de VRAM de calibración. La calibración usa el split de entrenamiento de WikiText-2 más la stdlib de Python disjunta, con 0 solapamiento de 6-gramas con las ventanas de evaluación puntuadas.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5, aunque la model card no detalla capacidades específicas.
- Generación de código: evaluada explícitamente en el benchmark de KL causal sobre código (KL 0,1290 en W4A16 y 0,1348 en W4A8 frente a BF16).
- Visión: los pesos de visión se conservan en BF16, lo que sugiere soporte multimodal, aunque no se documenta su uso en la model card.
- Multi-token prediction (MTP): los pesos MTP se preservan en BF16, lo que habilita decodificación especulativa si el runtime lo soporta.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "nothink": la model card menciona una configuración de muestreo `qwen38-27b:nothink-p0`, lo que indica la existencia de un modo sin razonamiento explícito en el modelo base.

## Casos de uso

- Servicio de inferencia en GPUs Intel Arc Pro B60/B70: es el caso de uso principal y para el que fue disenado. El checkpoint se sirve con `vllm/vllm-openai-xpu:v0.31.0` y XPU graphs, aprovechando el doble throughput INT8 XMX de estas GPUs frente a FP16/BF16.
- Car-gas de prefill intensivo con contexto largo: con 2.054,4 tok/s a 32K frente a 1.633,8 tok/s del GPTQ-Int4-sym-G128, es adecuado para escenarios donde el coste dominante es el procesamiento inicial de prompts largos (por ejemplo, resumen de documentos o análisis de repositorios).
- Evaluación de calidad de cuantización: los vectores `BiasCorr` y la ruta dual permiten comparar W4A16 y W4A8 sobre el mismo checkpoint, útil para investigación en cuantización de bajo bit.
- Despliegue con memoria limitada: el repo de 19,8 GB y la cuantización de 4,260 bpw permiten servir un modelo de gran tamano en una única GPU de 24-32 GB de clase profesional, con `--gpu-memory-utilization 0.90`.
- Generación de código asistida: el checkpoint mantiene una KL de código de 0,1290 (W4A16) frente a BF16, muy inferior a la del GPTQ-Int4-sym-G128 (0,3020), lo que lo hace preferible para tareas de código cuando la calidad importa más que el throughput de decodificación.
- Servicio con corrección de sesgo opcional: la variable `HF_INT4_G16_BIASCORR_MODE=off` permite servir los mismos pesos sin corrección, útil para aislar el efecto de `BiasCorr` en pruebas A/B.
- Prototipado en hardware Intel: para equipos que ya disponen de Arc Pro B60/B70, evita depender de GPUs NVIDIA para servir modelos Qwen de gran tamano.

## Benchmarks y rendimiento

Mediciones realizadas en una única Intel Arc Pro B70 (límite de 230 W, `vllm/vllm-openai-xpu:v0.31.0`, XPU graphs activados, `--max-model-len 36864 --max-num-seqs 96 --gpu-memory-utilization 0.90 --no-enable-prefix-caching`, rondas intercaladas ABABAB):

| Metrica | HF-INT4-G16-BC (este modelo) | GPTQ-Int4-sym-G128 | Delta |
|---|---:|---:|---|
| Prefill 8K: TTFT / tok/s (n=6) | 3,371 s / 2.364,4 tok/s | 4,310 s / 1.849,1 tok/s | 1,28x más rápido |
| Prefill 32K: TTFT / tok/s (n=6) | 15,842 s / 2.054,4 tok/s | 19,920 s / 1.633,8 tok/s | 1,26x más rápido, -10,7 % J/tok |
| Decode C=1 a 0K / 8K / 32K (n=6) | 29,48 / 28,38 / 26,26 tok/s | 33,42 / 31,95 / 29,20 tok/s | -10,1 % a -11,8 % más lento |
| Decode agregado C=4 / C=8 (n=3) | 69,1 / 166,8 tok/s | 97,9 / 213,3 tok/s | -29 % / -22 % más lento |
| KL causal WT2 64L vs BF16 (offline) | 0,0271 (PPL 7,947, 94,3 % Top-1) | 0,0494 (PPL 8,119, 91,4 % Top-1) | -45,2 % KL en prosa |
| KL causal código 64L vs BF16 (offline) | 0,1290 W4A16 / 0,1348 W4A8 | 0,3020 (PPL 2,835, 85,7 % Top-1) | -57,3 % / -55,4 % KL en código |
| Batería graduada de 329 ítems (vLLM en vivo) | 287/329 (7 topes de 1536) | 283/329 (10 topes de 1536) | +4 (+11/-7, p = 0,481, no significativo) |
| Batería canary exacta de 8 ítems (vLLM en vivo) | 7/8 exacto, 8/8 en cualquier caso (sumsq=14) | 6/8 exacto, 7/8 en cualquier caso (sumsq=30) | Corrige el fallo de `sumsq` |
| Tiempo de conversión desde BF16 (1x B70) | 11,5 min (691,7 s) | No medido en este entorno | — |

Comparación adicional con trellis `TFQ3-4b` (4,001 bpw), sobre las 400 matrices comunes del decodificador: KL sin datos de 0,0253 (WT2) / 0,1104 (código) frente a 0,0318 / 0,1480 de HF-INT4-G16. Con el checkpoint tal como se distribuye (con `lm_head` en BF16), este modelo gana en WT2 (0,0271 vs 0,0321) y pierde en código (0,1290 vs 0,1133). `TFQ3` solo dispone de kernels Metal y no tiene ruta de servicio en B70 XPU.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 19,8 GB; con `--gpu-memory-utilization 0.90` y contexto de 36.864 tokens, se necesita una GPU con al menos 24 GB de VRAM. La calibración de la conversión requiere 2,38 GiB adicionales.
- GPU recomendadas: Intel Arc Pro B70 (medido) e Intel Arc Pro B60 (soporte declarado, `Xe2 / bmg_g31`). No hay soporte documentado para GPUs NVIDIA o AMD en esta ruta de servicio.
- ¿Cabe en GPU de consumo? No hay información sobre soporte en GPUs de consumo Intel (Arc A-series o B-series de escritorio); el plugin está orientado a Arc Pro B60/B70.
- Opciones de despliegue: `vllm/vllm-openai-xpu:v0.31.0` con el plugin `vllm-hf-int4-g16` instalado (`pip install --no-deps --no-build-isolation -e /path/to/vllm-hf-int4-g16`). Variables de entorno: `HF_INT4_G16_MODE=auto|w4a16` y `HF_INT4_G16_BIASCORR_MODE=default|off`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de 2.364,4 tok/s a 8K y 2.054,4 tok/s a 32K; decodificación de 29,48 tok/s a C=1 en 0K, 69,1 tok/s agregados a C=4 y 166,8 tok/s a C=8. La suite de tests del plugin reporta 130 pruebas superadas y 0 fallidas en Arc Pro B70, incluyendo replay de XPUGraph con entradas cambiantes (`M=1,2,3,4,8`).
- Limitación de despliegue: no se ha cualificado el uso multi-GPU con TP=2 en vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-HF-INT4-G16-BC (este) | 6,86 B según safetensors (nombre indica 27B) | 36.864 configurado | INT4 G16, 4,260 bpw | Apache-2.0 | Hugging Face; solo ruta XPU |
| GPTQ-Int4-sym-G128 (referencia del autor) | Mismo modelo base | 36.864 en la comparación | INT4 G128 | Apache-2.0 (heredada) | Distribuido con vLLM XPU |
| Trellis `TFQ3-4b` (Ash) | Mismo modelo base | No disponible | 4,001 bpw | No disponible | Solo kernels Metal, sin ruta B70 XPU |

La comparación con alternativas de otros fabricantes (por ejemplo, otros modelos Qwen cuantizados para NVIDIA) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Decodificación más lenta: entre un 10 % y un 12 % a C=1 y entre un 22 % y un 29 % en throughput agregado a C=4/C=8 frente al GPTQ-Int4-sym-G128, por el mayor número de bytes de escala (G16) y la rotación `FWHT-128` en línea.
- Solo modelos densos: el plugin rechaza tensores MoE empaquetados en el arranque (fail-closed).
- Multi-GPU no cualificado: las colectivas TP=2 de vLLM en vivo no están validadas.
- Discrepancia de parametros: la cabecera de safetensors indica 6.862.976.752 parametros, mientras que el nombre del repositorio indica "27B". Conviene verificar el tamano real antes de dimensionar el despliegue.
- Dependencia de hardware específico: la ruta de servicio solo está probada en Intel Arc Pro B60/B70 con `vllm/vllm-openai-xpu:v0.31.0`; no hay soporte documentado para otras GPUs.
- Calidad en código inferior a `TFQ3-4b` cuando se compara por bits: 0,1290 frente a 0,1133 de KL, aunque `TFQ3` no tiene ruta de servicio en B70.
- Idiomas no declarados: la model card no especifica cobertura lingüística, por lo que no se puede garantizar un rendimiento multilingüe concreto.
- Riesgo de alucinación: no evaluado en la información proporcionada; la batería graduada de 329 ítems (287/329) y la canary de 8 ítems (7/8 exacto) son las únicas métricas de calidad en vivo.
- Paridad live/offline: la perplejidad en WikiText-2 sobre las mismas 2.044 posiciones es 7,94887 en vivo frente a 7,94236 en offline (+0,08 %), con `HF_INT4_G16_MODE=auto` en vivo y W4A8 en offline.
- Licencia Apache-2.0 permite uso comercial, pero las condiciones del modelo base Qwen3.5 deben verificarse por separado.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/SergiioB/Qwen3.8-27B-HF-INT4-G16-BC
- Repositorio del plugin `vllm-hf-int4-g16`: no disponible como enlace directo en la información proporcionada
- Imagen de contenedor `vllm/vllm-openai-xpu:v0.31.0`: no disponible como enlace directo en la información proporcionada
- Paper, blog o demo del autor: no disponibles en la información proporcionada
