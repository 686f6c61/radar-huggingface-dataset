# shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB

## Resumen

Inkling-2-Mini-LookAtMyQuant-8.9GB es una cuantizacion post-entrenamiento (PTQ) del modelo base thinkingmachines/Inkling-2-Mini, un Mixture-of-Experts de 26.4B parametros fisicos y 5.4B activos con tres bucles de reutilizacion de capas (3x-looped MoE). La publica el usuario shinmegamiboson mediante el compilador LookAtMyQuant, que comprime los 18.89 GB de pesos nativos en texto hasta 8.85 GB empaquetados (8.88 GB de repositorio incluyendo tokenizer), lo que equivale a 2.72 bits por parametro de texto y una ratio de compresion de 2.1x.

El objetivo del checkpoint es ejecutar un MoE de 26B en hardware de consumo, en particular Apple Silicon via MLX, sin sacrificar de forma apreciable la calidad del profesor BF16. Segun la model card, con `--max-thinking-tokens 960` y `max_new_tokens = 1536` alcanza un 95.5% de media en GSM8K (test[:200]) y HumanEval estricto (164 problemas), frente al 95.7% del BF16 original, es decir, retiene el 99.8% del rendimiento del profesor.

La relevancia actual reside en la combinacion de tres factores: cuantizacion NVFP4 selectiva por buckets de sensibilidad, un runtime propio (LookAtMyQuant, instalable via pip) y un drafter de 179 MB en 4 bits que habilita decodificacion especulativa sin perdida, elevando el decode serial de 56.0 tok/s a 117.9 tok/s medianos en un Apple M5 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 3 bucles de capas (3x-looped MoE) |
| Parametros totales | 26.4B fisicos |
| Parametros activos | 5.4B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4.50 bpp) en 23/192 buckets MoE de alta sensibilidad; mezcla NVFP4 + cuantizacion Trellis a 2.72 bpp global; polaco de filas/columnas pre-RHT y steering |
| Idiomas soportados | en, multilingual (evaluado en 13 idiomas en el conjunto all13_KL) |
| Licencia | apache-2.0 |
| Formato de pesos | Trellis (libreria `trellis`), pesos empaquetados; runtime MLX para Apple Silicon |

## Arquitectura y entrenamiento

El modelo base es un Mixture-of-Experts con 26.4B parametros fisicos y 5.4B activos, organizado en 192 buckets MoE y con tres bucles de reutilizacion de capas (3x-looped). Los pesos nativos en texto ocupan 18.89 GB y el profesor BF16 sirve como referencia de calidad (5.80 bpp). Esta ficha describe la cuantizacion, no el entrenamiento original del modelo base, del que la informacion disponible no detalla composicion del dataset, numero de tokens ni si hubo RLHF o DPO.

La cuantizacion aplica el compilador LookAtMyQuant con varias tecnicas combinadas: passthrough exacto NVFP4 (4.50 bpp) sobre los 23 de los 192 buckets MoE de mayor sensibilidad (error de cuantizacion 0.0000), Hessians densos por experto sobre todos los tokens, cero buckets frios de 1 bit `rtr1`, calibracion `TextMix` con mezcla 70/30 de chat-template y texto crudo, y un pulido de 500 pasos con profesor cacheado sobre filas, columnas pre-RHT y steering. El coste total de PTQ fue de 0.66 horas-B200 (21.1 min de PTQ y 18.7 min de pulido sobre 1x B200). El checkpoint incluye un drafter de 179 MB en 4 bits (DSpark) para decodificacion especulativa sin perdida.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat Inkling (`<|content_thinking|>`, `<|content_text|>`).
- Razonamiento matematico con traza de pensamiento acotada mediante `--max-thinking-tokens` (960 recomendado).
- Generacion de codigo ejecutable: 155/164 problemas de HumanEval estrictos con cap=960.
- Modo thinking con cierre determinista de la traza en frontera de frase o salto de linea.
- Capacidades multilingues: evaluado en 13 idiomas (`all13_KL` = 0.0628).
- Decodificacion especulativa sin perdida emparejado con el drafter de 4 bits (hasta 139.7 tok/s en matematicas y 96.2 tok/s en codigo en M5 Max).
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada (la suite de evaluacion incluye clases `tools` y `agentic`, pero no se detalla el soporte funcional).
- Vision y audio: no disponible.

## Casos de uso

- Razonamiento matematico en local: resolver problemas tipo GSM8K en un portatil Apple Silicon con 8.85 GB de pesos y `--max-thinking-tokens 960`, manteniendo 96.5% de acierto (193/200) sin GPU dedicada.
- Generacion de codigo en estaciones de trabajo: escribir funciones Python (por ejemplo, fusion de intervalos solapados) con 94.5% de HumanEval estricto y 96.2 tok/s de decode en M5 Max, adecuado para asistencia interactiva en editor.
- Chat multi-turno en dispositivos de consumo: `lamq chat` con plantilla Inkling y drafter para conversaciones fluidas a 117.9 tok/s medianos, con 8.24 GiB de RAM activa y 9.02 GiB de pico en decode.
- Prototipado de agentes y pipelines con tool calling: la suite de evaluacion incluye clases `tools` y `agentic`, lo que permite validar flujos de multiples pasos antes de desplegar el modelo completo.
- Evaluacion comparativa de cuantizaciones: el repositorio publica una familia de 7 tamanos (3.9, 4.7, 5.4, 8.9, 11.2, 12.8 GB) con KL y benchmarks, util para seleccionar el punto de equilibrio calidad/memoria en funcion del hardware.
- Despliegue en entornos con memoria limitada: 8.24 GiB activos permiten ejecutar el modelo en Mac con 16 GB de RAM unificada, donde un BF16 de 18.89 GB no cabria con holgura.
- Traduccion y generacion multilingue: el checkpoint mantiene `all13_KL` = 0.0628, un 9.6% mejor que la build uniforme sin NVFP4, adecuado para tareas de texto en 13 idiomas.

## Benchmarks y rendimiento

Resultados publicados en la model card con `max_new_tokens = 1536`, greedy y `reasoning_effort = "none"`:

| Modelo | GB texto | bpp | free_KL | all13_KL | GSM8K (200) | HE estricto (164) | GSM8K cap=960 | HE cap=960 | Media cap=960 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Profesor BF16 original | 18.89 | 5.80 | 0.0000 | 0.0000 | 188/200 (94.0%) | 147/164 (89.6%) | 189/200 (94.5%) | 159/164 (97.0%) | 95.7% |
| LookAtMyQuant 12.8 GB | 12.74 | 3.92 | 0.0084 | 0.0209 | 189/200 (94.5%) | 149/164 (90.9%) | 192/200 (96.0%) | 157/164 (95.7%) | 95.9% |
| LookAtMyQuant 11.2 GB | 11.16 | 3.43 | 0.0131 | 0.0315 | 190/200 (95.0%) | 145/164 (88.4%) | 195/200 (97.5%) | 156/164 (95.1%) | 96.3% |
| Este checkpoint (8.9 GB) | 8.85 | 2.72 | 0.0278 | 0.0628 | 190/200 (95.0%) | 139/164 (84.8%) | 193/200 (96.5%) | 155/164 (94.5%) | 95.5% |
| LookAtMyQuant 5.4 GB | 5.38 | 1.65 | 0.0853 | 0.2667 | 185/200 (92.5%) | 130/164 (79.3%) | 186/200 (93.0%) | 147/164 (89.6%) | 91.3% |
| LookAtMyQuant 4.7 GB | 4.72 | 1.45 | 0.1162 | 0.3724 | 191/200 (95.5%) | 118/164 (72.0%) | 192/200 (96.0%) | 135/164 (82.3%) | 89.2% |
| LookAtMyQuant 3.9 GB | 3.85 | 1.18 | 0.2161 | 0.6037 | 177/200 (88.5%) | 98/164 (59.8%) | 181/200 (90.5%) | 114/164 (69.5%) | 80.0% |

Datos adicionales de la model card: KL medio de 0.0530 (94.47% top-1) en la suite de 6 clases chat-templated (prosa, codigo, tools, agentic, razonamiento, multilingue), un 62.5% por debajo del build 8.9 GB v1 (0.1414). El `TextMix` sin plantilla `en,chat,code` marca 0.0278 frente a 0.0406 del build uniforme (-31.5%), y `all13_KL` 0.0628 frente a 0.0695 (-9.6%). El checkpoint queda 1.75x por debajo del `UD-Q2_K_XL` de Unsloth (9.14 GB, 0.0486).

## Requisitos de hardware

- RAM unificada: 8.24 GiB activos en carga en frio y 9.02 GiB de pico en decode en Apple M5 Max; 8.84 GB de pesos empaquetados.
- Carga en frio: 4.37 s en Apple M5 Max.
- Rendimiento en Apple M5 Max: 1784 tok/s de prefill con T=512, 56.0 tok/s de decode serial, 117.9 tok/s medianos con drafter (139.7 tok/s en matematicas, 96.2 tok/s en codigo).
- GPU CUDA: el PTQ se ejecuto en 1x B200, pero la model card solo documenta inferencia via MLX en Apple Silicon; no se detalla soporte CUDA para inferencia.
- Consumer GPU: cabe en Apple Silicon con 16 GB de RAM unificada o superior; no se proporcionan datos de VRAM para GPUs NVIDIA de consumo.
- Opciones de despliegue: runtime LookAtMyQuant (`pip install git+https://github.com/ShinMegamiBoson/lookatmyquant.git`), CLI `lamq generate` y `lamq chat`, y API Python `runtime_mlx.Runtime`. vLLM, llama.cpp, Ollama y TGI no estan documentados para este formato.
- Drafter opcional de 179 MB en 4 bits para decodificacion especulativa sin perdida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K cap=960 | HE estricto cap=960 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-LookAtMyQuant 8.9 GB | 26.4B / 5.4B activos | no disponible | 96.5% | 94.5% | apache-2.0 | Hugging Face, runtime MLX |
| Inkling-2-Mini BF16 (profesor) | 26.4B / 5.4B activos | no disponible | 94.5% | 97.0% | apache-2.0 (segun base) | Hugging Face |
| Unsloth UD-Q2_K_XL (9.14 GB) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| LookAtMyQuant 12.8 GB | 26.4B / 5.4B activos | no disponible | 96.0% | 95.7% | apache-2.0 | Hugging Face |

La comparativa con Unsloth solo aporta el dato de KL (0.0486 frente a 0.0278 del checkpoint, 1.75x mejor); no se publican resultados de GSM8K ni HumanEval para esa cuantizacion en la informacion disponible.

## Limitaciones y advertencias

- La cuantizacion a 2.72 bpp introduce degradacion medible: KL libre de 0.0278 frente a 0.0000 del profesor y `all13_KL` de 0.0628, con perdida de 4 puntos porcentuales en HumanEval estricto con cap=960 (94.5% vs 97.0%).
- El rendimiento depende criticamente de `--max-thinking-tokens 960`: sin ese ajuste, HumanEval estricto cae a 84.8% (139/164) frente al 94.5% con cap.
- La decodificacion especulativa requiere el drafter separado de 179 MB; sin el, el decode baja a 56.0 tok/s en M5 Max.
- El runtime documentado es exclusivamente MLX para Apple Silicon; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, lo que limita el despliegue en servidores CUDA.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar tareas de contexto largo.
- El soporte funcional de tool calling y agentes no esta confirmado; solo se evalua la clase correspondiente en la suite de calidad.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinacion en la informacion disponible.
- Licencia apache-2.0 en el checkpoint, pero conviene verificar la licencia del modelo base thinkingmachines/Inkling-2-Mini para uso comercial.
- El checkpoint tiene 769 descargas y 19 likes en el momento de la consulta, con actualizacion del 23 de noviembre de 2026; es un artefacto reciente y de un unico autor, sin validacion independiente publicada.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Drafter 4-bit: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-drafter
- Variante 12.8 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-12.8GB
- Variante 11.2 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-11.2GB
- Variante 5.4 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-5.4GB
- Variante 4.7 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-4.7GB
- Variante 3.9 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-3.9GB
- Repositorio del runtime: https://github.com/ShinMegamiBoson/lookatmyquant
- Sitio del compilador: https://lookatmyquant.com
