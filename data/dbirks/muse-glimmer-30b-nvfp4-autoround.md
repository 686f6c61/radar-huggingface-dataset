# dbirks/Muse-Glimmer-30B-NVFP4-AutoRound

## Resumen

Muse-Glimmer-30B-NVFP4-AutoRound es la version cuantizada en 4 bits del modelo multimodal de razonamiento Muse-Glimmer-30B de Meta, producida por dbirks con Intel AutoRound y empaquetada en formato compressed-tensors para su ejecucion con vLLM en hardware NVIDIA Blackwell. El modelo base es un decoder denso derivado de Gemma2 con torre de vision ViT-G/14, disenado para agentes locales siempre activos con razonamiento, tool calling y entrada de texto e imagen.

La cuantizacion NVFP4 (W4A4) reduce pesos y activaciones del decoder de texto a 4 bits, manteniendo la torre de vision, el adaptador y el `lm_head` en BF16. El resultado ocupa unos 23 GB frente a los 60 GB del modelo original en BF16, y alcanza una recuperacion de precision del 97,1 % sobre el conjunto OpenLLM-v1. Su proposito es permitir inferencia eficiente en GPUs Blackwell con tensor cores FP4 nativos (B200, RTX PRO 6000, RTX 5090, DGX Spark).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder denso derivado de Gemma2 (52 bloques) + torre de vision ViT-G/14 |
| Parametros totales | 18.767.497.024 (safetensors); modelo base dense de 29,6 B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | NVFP4 (W4A4): pesos y activaciones de 4 bits, group size 16, escala de bloque FP8 e4m3 + escala global FP32, simetrico |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | compressed-tensors (safetensors, `nvfp4-pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base, Muse-Glimmer-30B, es un decoder denso derivado de la arquitectura Gemma2 con una torre de percepcion ViT-G/14 y una ventana de contexto de 128 K tokens. Fue destilado de Muse Spark para uso agente local y genera razonamiento por canales (channel-scoped reasoning) y llamadas a herramientas en XML estilo ATEM, por lo que requiere parsers dedicados (`muse_glimmer` para tool-call y reasoning) en vLLM.

La cuantizacion se realizo con Intel AutoRound (arXiv:2309.05516) con esquema NVFP4, cuantizando todas las capas `Linear` de los 52 bloques del decoder de texto. La calibracion utilizo el dataset `NeelNanda/pile-10k` con 128 muestras, secuencia de 2048 tokens y 200 iteraciones de tuning; el proceso tardo unos 94 minutos con un pico de 47,6 GB de VRAM. La torre de vision, el adaptador, la proyeccion, el patch-embedder y el `lm_head` se mantienen en BF16 para preservar la calidad multimodal.

## Capacidades

- Razonamiento multimodal: acepta texto e imagenes y genera cadenas de razonamiento separadas (campo `reasoning`) con el parser `muse_glimmer`.
- Tool calling nativo: genera llamadas de herramientas en formato XML ATEM, interpretadas por vLLM con `--enable-auto-tool-choice` y `--tool-call-parser muse_glimmer`.
- Razonamiento multi-paso: al ser un modelo de razonamiento, produce chain-of-thought explicito antes de la respuesta final.
- Contexto largo: ventana de 128 K tokens para tareas con historial extenso.
- Multimodal: acepta entrada de texto e imagen y devuelve texto.
- Idiomas: solo ingles declarado.

## Casos de uso

- **Agentes locales siempre activos**: el modelo esta disenado para ejecutarse de forma continua en una sola GPU, tolerando tareas largas y recuperacion ante fallos, ideal para asistentes personales en escritorio.
- **Automatizacion de tareas con herramientas**: soporta tool calling en formato ATEM, por lo que puede integrarse en pipelines de vLLM OpenAI-compatible para invocar funciones externas (busquedas, APIs, ejecucion de scripts).
- **Analisis de documentos con imagenes**: al aceptar entradas visuales, puede describir diagramas, capturas de pantalla o graficos y razonar sobre ellos en un solo turno.
- **Asistencia tecnica multimodal**: puede recibir una captura de un error en pantalla, razonar sobre la causa y generar un plan de solucion paso a paso.
- **Servidor de inferencia en local**: desplegado con vLLM y el endpoint OpenAI-compatible, sirve como backend para aplicaciones de chat y agentes con hardware Blackwell de gama consumer (RTX 5090).
- **Prototipado de agentes con razonamiento**: el parser de razonamiento separado permite construir aplicaciones que muestran el proceso de pensamiento del modelo antes de la respuesta final.

## Benchmarks y rendimiento

Resultados sobre el conjunto OpenLLM-v1 (EleutherAI `lm-evaluation-harness`, backend vLLM in-process), comparando recuperacion de precision frente al modelo BF16:

| Modelo | OpenLLM-v1 promedio | Recuperacion |
|---|---|---|
| Base BF16 | 0,7295 | 100 % |
| **Este modelo (NVFP4 W4A4)** | 0,7089 | 97,1 % |
| Red Hat GPTQ-NVFP4 (referencia) | no disponible | 98,4 % |
| Hermano int4 W4A16 (dbirks) | no disponible | 98,5 % |

No se han publicado resultados desglosados por tarea (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- **GPU obligatorias**: NVIDIA Blackwell con tensor cores FP4 (SM100 / SM120 / SM121): B200, RTX PRO 6000, RTX 5090, DGX Spark. No se acelera en Ada ni Hopper.
- **VRAM estimada**: el modelo ocupa aproximadamente 22 GB en disco (23,4 GB el repositorio completo); la inferencia en W4A4 requiere una GPU con al menos 24 GB de VRAM (RTX 5090 o superior). El pico de VRAM durante calibracion fue de 47,6 GB.
- **Almacenamiento**: ~23 GB en disco frente a los ~60 GB del BF16.
- **Despliegue**: vLLM con la imagen `vllm/vllm-openai:muse-glimmer`, que detecta automaticamente el esquema de cuantizacion desde `config.json`. En builds antiguos de vLLM sobre Blackwell consumer puede ser necesario `VLLM_ATTENTION_BACKEND=FLASHINFER`.
- **Latencia y throughput**: no hay datos publicados de latencia o tokens por segundo en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | OpenLLM-v1 | Licencia |
|---|---|---|---|---|---|
| **Este (NVFP4 W4A4)** | 18,8 B (safetensors) | W4A4 FP4 | 128 K | 0,7089 | Apache 2.0 |
| Hermano int4 W4A16 (dbirks) | 18,8 B (safetensors) | W4A16 int4 | 128 K | ~98,5 % recuperacion | Apache 2.0 |
| Base BF16 (Meta) | 29,6 B dense | BF16 | 128 K | 0,7295 | Apache 2.0 |
| Red Hat GPTQ-NVFP4 | no disponible | W4A4 FP4 | 128 K | ~98,4 % recuperacion | Apache 2.0 |

El hermano W4A16 ofrece mayor precision (98,5 % vs 97,1 %) y compatibilidad con cualquier GPU, mientras que esta version NVFP4 solo acelera en Blackwell pero reduce el trafico de memoria.

## Limitaciones y advertencias

- **Hardware restrictivo**: requiere NVIDIA Blackwell con tensor cores FP4; en GPU Ada, Hopper o anteriores no hay aceleracion y el modelo no se ejecuta de forma util.
- **Perdida de precision**: la cuantizacion W4A4 reduce la precision un 2,9 % respecto al BF16, algo mayor que la alternativa W4A16 (1,5 %).
- **Solo en ingles**: la lista de idiomas indica exclusivamente ingles; no se garantiza calidad en otros idiomas.
- **Vision tower sin cuantizar**: la torre de vision permanece en BF16, por lo que el ahorro de memoria se concentra en el decoder de texto.
- **Dependencia de parsers**: requiere los parsers `muse_glimmer` para tool call y razonamiento; sin ellos, el formato XML de las llamadas no se interpreta correctamente.
- **Calibracion limitada**: la cuantizacion se calibro con solo 128 muestras de `pile-10k` y 200 iteraciones, lo que puede afectar a dominios fuera de esa distribucion.
- **Uso comercial**: licencia Apache 2.0, sin restricciones comerciales conocidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dbirks/Muse-Glimmer-30B-NVFP4-AutoRound
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Hermano int4 W4A16: https://huggingface.co/dbirks/Muse-Glimmer-30B-int4-AutoRound
- Paper de AutoRound: https://arxiv.org/abs/2309.05516
- Repositorio de AutoRound: https://github.com/intel/auto-round
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Model card en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- Pagina oficial en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Recetas de vLLM: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
