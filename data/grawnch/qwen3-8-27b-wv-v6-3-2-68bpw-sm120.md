# Grawnch/Qwen3.8-27B-WV-v6.3-2.68bpw-SM120

## Resumen

Qwen3.8-27B-WV-v6.3-2.68bpw-SM120 es un checkpoint cuantizado del modelo base Qwen/Qwen3.8-27B, publicado por el usuario Grawnch en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una reempaquetadura con cuantización propia (denominada wave-quant, WV6) que comprime los pesos del modelo original hasta un presupuesto de 2,6789 bits por peso, con un total de 8,63 GiB en disco y un repositorio de 9,3 GB. El objetivo es permitir la ejecución de un modelo de 27 mil millones de parámetros en GPUs Blackwell de consumo, incluyendo perfiles de 12 GB de VRAM.

La peculiaridad principal es que el checkpoint está precompilado para la arquitectura Blackwell (sm_120) y se distribuye junto con un runtime propietario (qfn_sm120_unified, versión 22.4.0) que implementa un servidor compatible con la API de OpenAI, la API de Anthropic Messages y la API de Responses de OpenAI. El modelo incorpora decodificación especulativa mediante Multi-Token Prediction (MTP) calibrado en la capa 64, lo que incrementa el throughput de generación respecto a la decodificación plana.

Es relevante ahora porque demuestra una vía práctica para desplegar modelos de gran tamaño en hardware de consumo Blackwell con latencias competitivas, a costa de depender de un runtime cerrado y de una licencia Apache 2.0 heredada del modelo base. La información disponible sobre el modelo base (arquitectura interna, datos de entrenamiento, benchmarks) es muy limitada en la model card proporcionada, por lo que muchos datos técnicos se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de 64 capas (según model card: "64 hybrid layers"); detalles internos del modelo base no disponibles |
| Parámetros totales | 27B (modelo base Qwen/Qwen3.8-27B) |
| Parámetros activos | no disponible |
| Longitud de contexto | Hasta 32.768 tokens verificados en prefill; el servidor admite `--max-seq 8192` por defecto; contexto máximo nativo del modelo base no disponible |
| Tipos de cuantización | Wave-quant WV6 a 2,6789 bpw (2.68 bpw); no se documentan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards: globals.safetensors, layers_00_03.safetensors … layers_60_63.safetensors, mtp.safetensors) + manifiesto sm120_manifest.json + tokenizer + chat_template.jinja |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer de 27B parámetros con 64 capas descritas como híbridas en la model card, aunque no se detalla en la información proporcionada qué combinación de atención y otras capas utiliza. El checkpoint WV6 no reentrena el modelo: aplica una cuantización calibrada de tipo wave-quant que reduce los pesos a 2,6789 bits por peso, manteniendo los shards en safetensors y añadiendo un módulo MTP (Multi-Token Prediction) en la capa 64 para decodificación especulativa.

La innovación técnica destacable es el empaquetado nativo para sm_120 (Blackwell) con un runtime SASS-only precompilado que soporta sm_80–sm_120a en Linux y Windows. El runtime incluye decodificación especulativa con MTP, batching continuo, streaming SSE con decodificación UTF-8 incremental y recuperación implícita de etiquetas de cierre de razonamiento. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de prosa, con modo de razonamiento explícito (``) que puede activarse o desactivarse por petición (`enable_thinking`).
- Generación de código, incluyendo modo FIM (fill-in-the-middle) mediante el token especial `<|fim_prefix|>`.
- Razonamiento matemático y estructurado, con presupuesto de tokens de pensamiento configurable (`thinking_token_budget`, `thinking.budget_tokens` en la API de Anthropic).
- Tool calling / function calling completo: definiciones de herramientas, respuestas multi-turno con rol `tool`, streaming incremental de argumentos JSON y conversión automática de XML a JSON tipado.
- Soporte de agentes multi-paso mediante endpoints compatibles con OpenAI Chat Completions, Anthropic Messages API (Claude Code) y OpenAI Responses API (Codex CLI).
- Salida estructurada con `response_format` (`json_object` / `json_schema`).
- Batching continuo para peticiones concurrentes y branching con `n > 1`.
- Decodificación especulativa con MTP que acelera la generación en dominios de código, matemáticas, JSON y prosa.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Asistente de código en local para GPUs Blackwell de consumo: el perfil `--force-12gb` permite ejecutar el modelo con menos de 11 GiB residentes (MTP + KV de 8K) en una GPU de 12 GB, adecuado para autocompletado y generación de funciones en el IDE mediante el endpoint FIM.
- Servidor de agentes compatible con Claude Code y Codex CLI: los endpoints `/v1/messages` y `/v1/responses` permiten conectar herramientas de agente existentes sin adaptadores, usando tool calling con streaming incremental de argumentos.
- Atención al cliente automatizada multi-turno: el batching continuo y el contexto de hasta 8K por defecto (ampliable a 32K) permiten gestionar conversaciones concurrentes con historial largo en una sola GPU.
- Generación de JSON estructurado en pipelines de datos: `response_format` con `json_schema` y el modo de razonamiento con presupuesto de tokens permiten extraer y validar datos con salida tipada.
- Razonamiento matemático asistido: el modo thinking con presupuesto configurable y la decodificación especulativa orientada a matemáticas (182,69 tok/s medidos) lo hacen adecuado para resolución de problemas paso a paso en entornos de investigación.
- Despliegue en estaciones de trabajo con RTX PRO 6000: el perfil de 96 GB permite contexto de 32K y batching de hasta B=16 con 536,6 tok/s, útil para servir múltiples usuarios internos con una API compatible con OpenAI.
- Prototipado de aplicaciones con salida en streaming: el soporte SSE con decodificación UTF-8 incremental y el streaming de tokens especulativos facilitan interfaces de chat fluidas sin glitches de codificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente proporciona métricas de throughput del runtime en una RTX PRO 6000 (sm_120a) con la versión 1.5.1:

| Métrica | Contexto / batch | Medición |
|---|---|---|
| Decodificación plana M=1 | B=1 | 97,34 tok/s |
| Decodificación especulativa (código) | B=1 | 150,08 tok/s |
| Decodificación especulativa (matemáticas) | B=1 | 182,69 tok/s |
| Decodificación especulativa (JSON) | B=1 | 181,04 tok/s |
| Decodificación especulativa (prosa) | B=1 | 138,69 tok/s |
| Decodificación con batching | B=4 / B=8 / B=16 (2K ctx) | 176,3 / 365,2 / 536,6 tok/s |
| Prefill S=512 | 512 tokens | 4.383,4 tok/s (116,81 ms) |
| Prefill S=2048 | 2.048 tokens | 4.943,0 tok/s (414,32 ms) |
| Prefill S=8192 | 8.192 tokens | 4.584,3 tok/s (1.786,98 ms) |
| Prefill S=32768 | 32.768 tokens | 3.521,9 tok/s (9.304,14 ms) |

## Requisitos de hardware

- VRAM estimada: menos de 11,0 GiB residentes en el perfil de 12 GB (incluye MTP y KV de 8K); el checkpoint en disco ocupa 8,63 GiB.
- GPU soportadas explícitamente: NVIDIA Blackwell sm_120, incluyendo RTX PRO 6000 (96 GB), RTX 5090 (32 GB) y GPUs Blackwell de consumo con 12 GB o más.
- El runtime universal declara soporte para sm_80–sm_120a, pero el checkpoint está precompilado para sm_120; no se garantiza su funcionamiento en arquitecturas anteriores sin el wheel correspondiente.
- Requisitos de software: Linux x86_64 (el runtime también soporta Windows), Python 3.13, torch 2.14.1+cu130 (CUDA 13.0), transformers >= 5.22.1, safetensors.
- Despliegue: runtime propietario `qfn_sm120_unified` v22.4.0 con servidor OpenAI SSE, Anthropic Messages API, OpenAI Responses API y endpoint Prometheus. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; la decodificación especulativa mejora entre un 43 % y un 88 % respecto a la decodificación plana según el dominio.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad del modelo base Qwen/Qwen3.8-27B en la información proporcionada, por lo que no es posible establecer una comparación rigurosa con alternativas. A continuación se comparan únicamente los aspectos documentados frente a otros checkpoints cuantizados de la misma familia disponibles en el ecosistema:

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen3.8-27B-WV-v6.3-2.68bpw-SM120 | 27B | hasta 32K verificado | 2,68 bpw (wave-quant) | Apache 2.0 | qfn_sm120_unified (propietario, sm_120) |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | BF16/FP16 original | Apache 2.0 | transformers, vLLM, etc. |
| Checkpoints GGUF de la familia Qwen3 (genéricos) | variable | variable | 2–8 bits (GGUF) | según modelo base | llama.cpp, Ollama |

La comparación con alternativas de otros fabricantes (por ejemplo, modelos de 27B–32B de otras familias) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint depende de un runtime propietario y precompilado (SASS-only) para sm_120; no es ejecutable con las herramientas estándar del ecosistema (vLLM, llama.cpp, TGI) sin el wheel específico.
- La cuantización a 2,6789 bpw es extremadamente agresiva; no se documentan evaluaciones de degradación de calidad respecto al modelo base en BF16.
- El modelo base Qwen3.8-27B no aporta información sobre sesgos, datos de entrenamiento ni evaluación de alucinación en la información disponible; se heredan los riesgos del modelo original.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- El contexto máximo real del modelo base no está confirmado; las mediciones de prefill llegan a 32.768 tokens, pero el servidor arranca con `--max-seq 8192` por defecto.
- La licencia Apache 2.0 permite uso comercial, pero el runtime propietario puede tener condiciones adicionales no especificadas en la model card; conviene revisar los términos del repositorio `Grawnch/wv-runtime-binaries`.
- El repositorio tiene 1.845 descargas y 1 like, lo que indica una adopción muy limitada y poca validación comunitaria.
- El soporte declarado para sm_80–sm_120a en el runtime universal no garantiza que este checkpoint concreto funcione fuera de sm_120, ya que está empaquetado específicamente para Blackwell.
- No se documentan mecanismos de seguridad, filtrado de contenido ni evaluaciones de robustez adversarial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-27B-WV-v6.3-2.68bpw-SM120
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime universal (wheels): https://huggingface.co/Grawnch/wv-runtime-binaries
- Wheel del instalador: https://huggingface.co/Grawnch/wv-runtime-binaries/resolve/main/wheels/wv_runtime_installer-1.5.2-py3-none-any.whl
