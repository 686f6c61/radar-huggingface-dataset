# litert-community/Qwen3-30B-A3B

## Resumen

`litert-community/Qwen3-30B-A3B` es una conversión del modelo Qwen3-30B-A3B de Alibaba Qwen al formato LiteRT-LM, empaquetada con `litert-lm-builder` 0.19.0 y escrita con la API de tensores de LiteRT. El modelo original es un transformer de mezcla de expertos (MoE) de 48 capas con 128 expertos por capa, de los cuales se activan 8 por token: 30.500 millones de parámetros totales y 3.300 millones activos. Esta conversión no entrena ni modifica los pesos, sino que los reempaqueta para su ejecución en el runtime LiteRT-LM sobre CPU (XNNPACK) y GPU (ML Drift, WebGPU).

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto de despliegue concreto con cuantización mixta (expertos en int4 por bloques de 32, atención y `lm_head` en int8 por canal, router y normas en fp32) que reduce el peso a unos 20,65 GB. Por otro, expone una limitación operativa clara: los ficheros requieren una compilación de LiteRT desde el código fuente con dos pull requests abiertos que añaden soporte de activación SiLU en el kernel `moe`, porque la versión publicada en PyPI (0.19.0) solo acepta GELU y aborta la ejecución.

Se distribuye con licencia Apache 2.0, igual que el modelo base, y está pensado para inferencia local en equipos de gama alta (el autor reporta cifras en un Apple M4 Max con 128 GB). No incluye resultados de benchmarks de calidad del modelo; los datos publicados son de rendimiento del runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (48 capas, 128 expertos por capa, 8 activos por token) |
| Parametros totales | 30.500 millones (30,5B) |
| Parametros activos | 3.300 millones (3,3B) por token |
| Longitud de contexto | 2.048 o 4.096 tokens según el fichero (`ekv2048` / `ekv4096`) |
| Tipos de cuantizacion | Mixta: expertos int4 blockwise (bloque 32, escalas fp32); atención q/k/v/o y `lm_head` int8 por canal; router, normas y tabla de tokens fp32; caché KV fp32 |
| Idiomas soportados | Inglés (según metadatos del repo); el modelo base Qwen3 es multilingüe, pero esta conversión declara solo `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM), dos artefactos de 20,65 GB cada uno |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-30B-A3B original: un transformer decoder con mezcla de expertos, 48 capas y 128 expertos por capa, de los que el router selecciona los 8 mejores por token (top-8 con softmax y renormalización). El modelo base fue entrenado por Alibaba Qwen; esta conversión no aporta información sobre el dataset de entrenamiento, el número de tokens ni las fases de alineación (RLHF/DPO) del modelo original, por lo que esos datos deben consultarse en la model card de `Qwen/Qwen3-30B-A3B`.

La innovación técnica de esta conversión está en el empaquetado para LiteRT-LM. El decoder se escribe tensor a tensor con la API de LiteRT desde el checkpoint en bf16 (revisión `ad44e777`), evitando materializar un grafo completo en fp32. Los 128 expertos de cada capa se agrupan en una única operación custom `moe` que LiteRT ejecuta con XNNPACK en CPU y ML Drift en GPU, de modo que solo se computan los 8 expertos enrutados por token. El añadido residual posterior al `moe` se escribe como `(x + moe) + moe * 0` para impedir que ML Drift fusione la suma en el kernel, ya que la versión fusionada no compila el shader en WebGPU ni en Metal. Las escalas int4 por debajo de 2^-14 se elevan a ese mínimo. Las firmas expuestas son `prefill_128`, `prefill_1024` y `decode`, y los metadatos replican la configuración Qwen3 de LiteRT-LM (plantilla de chat, token de parada `<|im_end|>` con id 151645, canal `thought` y sampler TOP_P con top_p 0,95, top_k 20 y temperatura 0,6).

## Capacidades

- Generación de texto y razonamiento en modo "thinking": la plantilla de chat activa por defecto el pensamiento, de modo que cada respuesta comienza con un bloque de razonamiento antes de la respuesta final.
- Generación de código y matemáticas: capacidades heredadas del modelo base Qwen3-30B-A3B (no verificadas en esta conversión con benchmarks).
- Capacidades multilingües del modelo base, aunque los metadatos de esta conversión solo declaran inglés.
- Ejecución local en CPU y GPU mediante LiteRT-LM, sin dependencia de frameworks de servidor tipo vLLM o TGI.
- Inferencia con caché KV de 2.048 o 4.096 tokens según el artefacto elegido.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en esta conversión.

## Casos de uso

- Inferencia local en estaciones de trabajo Apple Silicon: el artefacto `ekv4096` con backend WebGPU alcanza 47,64 tokens/s de decodificación y 778,11 tokens/s de prefill en un M4 Max con 128 GB, lo que permite asistentes de código o chat interactivo sin conexión a servicios externos.
- Prototipado de aplicaciones LiteRT-LM: sirve para validar pipelines de prefill y decode con las firmas `prefill_128`, `prefill_1024` y `decode` antes de portar modelos a producción en el runtime.
- Procesamiento por lotes en CPU: con XNNPACK el modelo consume 5,37 GB de pico y decodifica a 4,16 tokens/s, adecuado para tareas de generación no interactivas donde prima el coste frente a la latencia (resúmenes, clasificación de texto largo dentro de los 4.096 tokens de contexto).
- Evaluación de cuantización mixta int4/int8: el repositorio documenta comparativas entre bloques de expertos de 32 y 128 anchos y entre atención int4 e int8, útil para investigar el impacto de la cuantización en modelos MoE.
- Asistente de razonamiento con traza visible: el canal `thought` y la plantilla de chat permiten construir interfaces que muestran el razonamiento intermedio del modelo antes de la respuesta final.
- Despliegue en entornos con GPU integrada y WebGPU: el backend WebGPU de LiteRT permite ejecutar el modelo en hardware Apple sin CUDA, útil para demos y herramientas de escritorio.
- Reproducibilidad de conversiones: los scripts en `john-rocky/hf-to-litertlm` permiten reconstruir el artefacto byte a byte (salvo cabecera uuid y fecha), lo que sirve como referencia para convertir otros checkpoints de Hugging Face a LiteRT-LM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos publicados son de rendimiento del runtime en Apple M4 Max (128 GB, macOS 27.0), con 1.024 tokens de prefill y 256 de decode, medidos el 2026-11-03:

| Fichero | Backend | Prefill (tok/s) | Decode (tok/s) | Pico de memoria |
|---|---|---:|---:|---:|
| `qwen3_30b_a3b_mixed_int4_ekv2048.litertlm` | GPU (WebGPU) | 1.043,42 | 54,81 | 32,75 GB |
| `qwen3_30b_a3b_mixed_int4_ekv4096.litertlm` | GPU (WebGPU) | 778,11 | 47,64 | 34,14 GB |
| `qwen3_30b_a3b_mixed_int4_ekv4096.litertlm` | CPU (XNNPACK) | 56,30 | 4,16 | 5,37 GB |

El autor reporta además que la atención y el `lm_head` en int4 no fueron más rápidos que en int8 (41,9 frente a 41,1 tokens/s en WebGPU a 4.096 tokens) y que los expertos en bloques de 128 decodificaron más lento que en bloques de 32 (41,1 frente a 47,6 tokens/s).

## Requisitos de hardware

- VRAM/RAM estimada: el fichero pesa 20,65 GB; el pico medido es de 32,75 GB (WebGPU, contexto 2.048) y 34,14 GB (WebGPU, contexto 4.096). En CPU el pico medido es de 5,37 GB, aunque el autor no detalla si el peso se mapea desde disco.
- GPU recomendadas: el autor solo documenta Apple M4 Max con 128 GB y WebGPU. No hay datos publicados para A100, H100 ni RTX 4090.
- GPU de consumo: no hay datos que confirmen que quepa en GPUs de consumo de 24 GB (RTX 4090) dado el pico de 32-34 GB en GPU; en CPU el consumo medido de 5,37 GB sugiere que podría ejecutarse en equipos con suficiente RAM, pero a 4,16 tokens/s.
- Opciones de despliegue: exclusivamente LiteRT-LM, y solo con una compilación desde el código fuente que incluya los pull requests google-ai-edge/LiteRT#11192 (kernel GPU) y #11188 (kernel XNNPACK). La versión 0.19.0 de PyPI falla con `moe node #85 unsupported activation='silu'` en CPU y `moe only supports activation='gelu_tanh'` en GPU.
- Latencia y throughput: ver tabla de la sección anterior (54,81 tokens/s en WebGPU con contexto 2.048; 4,16 tokens/s en CPU).

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `litert-community/Qwen3-30B-A3B` | 30,5B | 3,3B | 2.048 / 4.096 | Apache 2.0 | `.litertlm` | Conversión LiteRT-LM; requiere build desde fuente con PRs abiertos |
| `Qwen/Qwen3-30B-A3B` | 30,5B | 3,3B | No disponible en la información proporcionada | Apache 2.0 | Safetensors (Transformers) | Modelo original; ejecutable con vLLM, TGI, llama.cpp y similares |
| Alternativas de tamaño similar (p. ej. otros MoE de ~30B) | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación directa más relevante es con el checkpoint original de Qwen: misma arquitectura y pesos, pero distinto runtime y formato. La conversión LiteRT-LM limita el contexto a 2.048 o 4.096 tokens y exige un build específico, mientras que el original no impone esas restricciones de runtime.

## Limitaciones y advertencias

- La versión 0.19.0 de LiteRT-LM (publicada en PyPI) no ejecuta estos ficheros: el kernel `moe` solo acepta GELU y el modelo usa SiLU. Es necesario compilar LiteRT desde el código fuente con los PRs #11192 y #11188, abiertos en la fecha de publicación.
- El contexto está limitado a 2.048 o 4.096 tokens según el artefacto, muy por debajo de las ventanas habituales de los modelos actuales.
- El autor documenta bucles de repetición con activaciones fp16 en GPU; por eso los ficheros declaran activaciones fp32, lo que incrementa el consumo de memoria.
- El pico de memoria en GPU (32,75-34,14 GB) supera la VRAM de muchas GPUs de consumo, lo que limita su despliegue a equipos de gama alta o a CPU.
- La cuantización int4 de los expertos puede degradar la calidad respecto al checkpoint bf16 original; no se han publicado evaluaciones de calidad que lo cuantifiquen.
- Los metadatos declaran únicamente inglés, aunque el modelo base Qwen3 es multilingüe; el comportamiento multilingüe de esta conversión no está verificado.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones específicas en esta conversión.
- Sesgos conocidos del modelo base no documentados en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar la licencia del modelo base y de los componentes del runtime LiteRT.
- El proceso de conversión depende de revisiones concretas (`ad44e777` del checkpoint, `dcb657e8` de LiteRT) y de scripts externos; la reproducibilidad byte a byte solo se garantiza copiando uuid y fecha de creación de la cabecera.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/litert-community/Qwen3-30B-A3B
- Discusiones del repositorio: https://huggingface.co/litert-community/Qwen3-30B-A3B/discussions
- Modelo base Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B/blob/main/LICENSE
- Paper de Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Scripts de conversión: https://github.com/john-rocky/hf-to-litertlm/tree/main/qwen3_30b_a3b_work
- PR de LiteRT con el kernel GPU para SiLU: https://github.com/google-ai-edge/LiteRT/pull/11192
- PR de LiteRT con el kernel XNNPACK para SiLU: https://github.com/google-ai-edge/LiteRT/pull/11188
- Issue relacionada de LiteRT-LM (kernel SwiGLU): https://github.com/google-ai-edge/LiteRT-LM/issues/4055
