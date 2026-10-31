# infosave/LFM3-1.7B-Base-cmf

## Resumen

LFM3-1.7B-Base-cmf es una reempaquetación cuantizada del modelo base LFM3-1.7B-Base de Liquid AI, publicada por el usuario infosave en Hugging Face. El modelo original es el checkpoint preentrenado del que se deriva LFM3-1.7B, y emplea la arquitectura tri-híbrida de Liquid: 24 capas que combinan convoluciones cortas con puertas, atención completa y atención con ventana deslizante, con una ventana de contexto de 262.144 tokens.

Esta versión concreta no distribuye pesos en safetensors ni GGUF, sino en formato CMF, un contenedor propio del motor de inferencia cortiq, escrito en Rust sin dependencias de Python ni de frameworks de ML. Se ofrecen dos cuantizaciones: 8 bits (q8_2f, 1,76 GB) y 4 bits (q4tp, 0,93 GB). El interés de esta ficha para desarrolladores es doble: permite evaluar la eficiencia de la arquitectura LFM3 en hardware modesto (Vulkan, Metal, DX12 o CPU) y sirve como punto de partida para fine-tuning e investigación, aunque Liquid recomienda el modelo instructivo para chat, tool calling y agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-híbrida: 24 capas (13 gated short-convolution, 6 full-attention, 5 sliding-window attention) |
| Parametros totales | 1.700 millones (aprox., derivado del nombre y tamaño bf16 de 3,46 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (KV cache por defecto de 32.768, ampliable con `CMF_MAX_SEQ=262144`) |
| Tipos de cuantizacion | q8_2f (8 bits, 1,76 GB) y q4tp (4 bits, 0,93 GB); normas, taps de convolución y gates de atención en 16 bits |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (lfm1.0, tipo "other"); uso comercial no licenciado para entidades con ingresos anuales ≥ 10 millones USD |
| Formato de pesos | CMF (contenedor propio del motor cortiq); el original upstream está en safetensors bf16 |

## Arquitectura y entrenamiento

El modelo base usa la arquitectura tri-híbrida de Liquid AI: de sus 24 capas, 13 son de convolución corta con puertas (que mantienen un estado fijo por token, con coste de memoria constante), 6 de atención completa y 5 de atención con ventana deslizante de 256 posiciones. Este diseño reduce drásticamente el crecimiento de la KV cache: unos 25 KB por token, lo que hace viable el contexto de 262.144 tokens en hardware de consumo.

Según la model card, el checkpoint base recibió durante el mid-training datos de chat con y sin trazas de razonamiento (thinking), con la misma plantilla que LFM3-1.7B, por lo que responde a `cortiq run` y `cortiq serve`, y el flag `--no-think` solicita respuestas directas. No se detallan en la información disponible el número de tokens de preentrenamiento ni la composición exacta del dataset. La cuantización la realiza cortiq; el README documenta que la conversión f16 del camino arquitectónico coincide posición a posición con la ejecución float32 en Transformers, y que las cuantizaciones mantienen en 16 bits las normas, los taps de las convoluciones cortas y los gates por cabeza de atención.

## Capacidades

- Generacion de texto en 16 idiomas (inglés, español, chino, árabe, japonés, ruso, etc.), al ser un modelo base preentrenado.
- Comportamiento de modelo base: completación de texto y punto de partida para fine-tuning; no está alineado para instrucciones.
- Razonamiento con trazas de thinking: el mid-training incluyó datos de chat con y sin razonamiento; `--no-think` desactiva las trazas.
- Contexto muy largo: hasta 262.144 tokens, con KV cache que crece solo ~25 KB por token gracias a las capas convolucionales y de ventana deslizante.
- Ejecución multiplataforma: NVIDIA, AMD e Intel vía Vulkan/DX12, Apple silicon vía Metal y CPU puro (`CMF_GPU=0`), sin Python ni frameworks de ML.
- Verificación de integridad: sumas SHA-256 y comando `cortiq verify` incluidos.

No se ha documentado soporte nativo de tool calling, function calling ni capacidades multimodales en este checkpoint base; para chat, herramientas y agentes, Liquid remite al modelo instructivo LFM3-1.7B.

## Casos de uso

- Fine-tuning de bajo coste: al ser el checkpoint base, es el punto de partida natural para ajustar el modelo a dominios concretos (legal, médico, técnico) antes de desplegar la variante instructiva.
- Investigación en arquitecturas híbridas: la mezcla explícita de convolución corta, atención completa y ventana deslizante permite estudiar el compromiso entre calidad y coste de memoria de la KV cache.
- Despliegue en edge y dispositivos sin GPU dedicada: con 0,93 GB en q4tp cabe en cualquier equipo con 2 GB de memoria libre, incluidos portátiles con gráfica integrada Intel o AMD vía Vulkan.
- Procesamiento de documentos largos: el contexto de 262.144 tokens permite resumir o analizar documentos extensos; el README mide 131-166 tok/s de decodificación a profundidad de 4k tokens.
- Servicios de inferencia en Rust sin stack de Python: `cortiq serve` permite montar un endpoint sin dependencias de PyTorch, útil en contenedores mínimos o entornos restringidos.
- Experimentación con cuantizaciones: los dos ficheros (8 y 4 bits) con perplejidad y coincidencia top-1 documentadas frente al checkpoint bf16 sirven de referencia para evaluar el impacto de la cuantización.
- Generación de texto en varios idiomas: cobertura de 16 lenguas, incluido el español, para tareas de completación y generación creativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se documentan perplejidad de cuantización y rendimiento de inferencia:

Cuantizacion (perplejidad sobre wikitext-2 test, primeros 4.096 tokens con BOS):

| Fichero | Pesos | Tamaño | Perplejidad wiki | Coincidencia top-1 vs bf16 |
|---|---|---:|---:|---:|
| `lfm3-1.7b-base-q8_2f.cmf` | 8 bits | 1,76 GB | 9,556 | 98,6 % |
| `lfm3-1.7b-base-q4tp.cmf` | 4 bits | 0,93 GB | 9,984 | 87,4 % |
| Original bf16 (Transformers) | — | 3,46 GB | 9,556 | — |

Rendimiento (cortiq 0.8.49, `cortiq bench --core --ignore-eos`, un stream, NVIDIA A40 de 48 GB vía Vulkan):

| Fichero | Decodificacion (tok/s) | Decodificacion a 1k / 4k | Lectura prompt 1k / 4k (tok/s) | Primer token, prompt 4k |
|---|---:|---:|---:|---:|
| `q8_2f` | 166 | 133 / 131 | 663 / 657 | 7,0 s |
| `q4tp` | 228 | 160 / 166 | 624 / 622 | 8,2 s |

En Apple M4 (Metal, cortiq 0.8.50), `q4tp` decodifica a 84 tok/s (82 a profundidad 1k) y lee prompts de 1k tokens a 565 tok/s.

## Requisitos de hardware

- VRAM estimada para inferencia: 1,73 GB de pesos residentes con `q8_2f` y 0,90 GB con `q4tp`; ambos ficheros caben en cualquier tarjeta con 2 GB de memoria libre. La KV cache añade ~25 KB por token (32.768 tokens por defecto, ~0,8 GB adicionales; 262.144 tokens, ~6,5 GB).
- GPU recomendadas: cualquier GPU NVIDIA, AMD o Intel con soporte Vulkan o DX12 (verificado en NVIDIA A40 de 48 GB); en Apple silicon se usa Metal por defecto.
- Consumer GPUs: sí, por diseño; con menos de 1 GB de pesos, modelos integrados y portátiles son suficientes para las cuantizaciones incluidas.
- CPU: soportado sin GPU con `CMF_GPU=0`.
- Despliegue: exclusivamente con el motor cortiq (`cortiq run`, `cortiq serve`, `cortiq ppl`, `cortiq bench`), instalable con `cargo install cortiq-cli` o binarios precompilados para Linux, macOS y Windows. No hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI al usar el formato CMF.
- Latencia y throughput: en A40, 166-228 tok/s de decodificación y 7-8,2 s hasta el primer token con prompt de 4k; en Apple M4, 84 tok/s con q4tp.
- En Linux headless sin entorno gráfico, instalar `libvulkan1 libglvnd0 libegl1 libgl1 libglx0` y definir `XDG_RUNTIME_DIR=/tmp`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia |
|---|---|---|---|---|
| LFM3-1.7B-Base-cmf (esta ficha) | ~1.700 M | 262.144 tokens | CMF, 8 y 4 bits | LFM Open License v1.0 (restricción comercial ≥ 10 M USD) |
| LiquidAI/LFM3-1.7B-Base (upstream) | ~1.700 M | 262.144 tokens | safetensors bf16 (3,46 GB) | LFM Open License v1.0 |
| Qwen3-1.7B-Base (referencia de categoria) | 1.700 M | no disponible en la información facilitada | safetensors, GGUF comunitario | Apache 2.0 (según catálogo público) |

La comparativa con Qwen3 es orientativa: no se han publicado en la información disponible benchmarks que permitan comparar rendimiento de ambos modelos. La ventaja diferencial de la variante CMF es el tamaño (0,93 GB en 4 bits) y el motor de inferencia en Rust multiplataforma; su inconveniente es la dependencia de un ecosistema propio (cortiq) frente a las herramientas estándar.

## Limitaciones y advertencias

- Es un modelo base, no alineado por instrucciones: para chat, tool calling o agentes, Liquid recomienda explícitamente el modelo instructivo LFM3-1.7B; usar el base directamente produce completaciones, no respuestas conversacionales fiables.
- Riesgo de alucinación inherente a un modelo base sin RLHF/DPO documentado; no se han publicado evaluaciones de veracidad.
- Sesgos: no documentados en la model card; como todo modelo preentrenado a gran escala, puede reproducir sesgos presentes en sus datos de entrenamiento (composición no detallada).
- Licencia restrictiva: la LFM Open License v1.0 no autoriza el uso comercial a entidades con ingresos anuales iguales o superiores a 10 millones USD; revisar el fichero LICENSE antes de cualquier despliegue comercial.
- Ecosistema cerrado: el formato CMF solo funciona con cortiq; no es cargable con Transformers, llama.cpp ni vLLM, lo que limita la interoperabilidad con pipelines existentes.
- La cuantización q4tp pierde coincidencia top-1 en el 12,6 % de las posiciones frente al bf16 y sube la perplejidad de 9,556 a 9,984; para trabajo de máxima fidelidad usar q8_2f o el original.
- Contexto: la KV cache por defecto es de 32.768 tokens; hay que subir `CMF_MAX_SEQ=262144` explícitamente para usar el contexto completo, con el correspondiente coste de memoria (~6,5 GB adicionales).
- Repositorio con muy poca tracción pública (5 descargas, 1 like en el momento de la ficha), publicado por un tercero, no por Liquid AI; verificar las sumas SHA-256 antes de ejecutar.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/infosave/LFM3-1.7B-Base-cmf
- Modelo base upstream: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Modelo instructivo derivado: https://huggingface.co/infosave/LFM3-1.7B-cmf
- Repositorio del formato CMF y motor cortiq: https://github.com/infosave2007/cmf
- Binarios y releases de cortiq: https://github.com/infosave2007/cmf/releases
- Scripts de conversión para LFM3: https://github.com/infosave2007/cmf/tree/master/scripts/lfm3
