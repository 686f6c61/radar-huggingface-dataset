# litert-community/Falcon-H1-Tiny-R-0.6B

## Resumen

Falcon-H1-Tiny-R-0.6B es un modelo de razonamiento de pequeno tamano (0.6B parametros) desarrollado originalmente por TII (Technology Innovation Institute) y convertido al formato LiteRT-LM por la comunidad `litert-community` para inferencia on-device. Se trata de la version empaquetada en `.litertlm` del modelo base `tiiuae/Falcon-H1-Tiny-R-0.6B`, optimizada para ejecutarse en dispositivos moviles (smartphones, tablets) mediante el runtime LiteRT-LM de Google, con soporte de delegacion GPU y CPU.

El modelo emplea una arquitectura hibrida que combina ramas de atencion con grouped-query attention (GQA) y ramas de Mamba2 selective-scan ejecutadas en paralelo en las 44 capas del modelo. Esta hibridacion permite mantener estado KV junto con estado convolucional y de espacio de estados (SSM) de tamano constante, lo que reduce el coste de memoria durante la decodificacion autoregresiva frente a un transformer puro. El modelo es un modelo de razonamiento: genera un bloque `<think>...</think>` antes de emitir la respuesta final, y el runtime LiteRT-LM declara el canal `thought` para separar el razonamiento de la respuesta visible.

La relevancia de esta ficha radica en que se trata de un checkpoint cuantizado (int8) distribuido en formato `.litertlm` con un tamano de 873 MB, pensado explicitamente para despliegue edge. El autor documenta metricas de rendimiento en dispositivos reales (Galaxy S26, Pixel 8a, iPhone 17 Pro, Apple M4 Max) y resultados de correctitud (GSM8K 76/100 frente a 71/100 del modelo bf16 de PyTorch), lo que permite evaluar con datos concretos su viabilidad en produccion movil. Requiere LiteRT-LM >= 0.16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: grouped-query attention (GQA) + Mamba2 selective-scan en paralelo, 44 capas |
| Parametros totales | 0.6B (segun nombre del modelo; no se detalla desglose) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 dinamica en capas lineales (FC); tabla de embeddings externalizada y mantenida en float; convs y scan en float; activaciones fp32 declaradas para GPU |
| Idiomas soportados | no disponible |
| Licencia | falcon-llm-license (other) |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors/PyTorch bf16 |
| Tamano del bundle | 873 MB (`Falcon-H1-Tiny-R-0.6B_int8.litertlm`) |
| Runtime requerido | LiteRT-LM >= 0.16 |
| Stop tokens | `<|end_of_text|>` (11), `<|im_end|>` (228) |

## Arquitectura y entrenamiento

La arquitectura es hibrida: cada una de las 44 capas ejecuta en paralelo una rama de atencion con grouped-query attention y una rama Mamba2 selective-scan. Cada capa mantiene estado KV junto con estado convolucional y SSM de tamano constante, lo que evita el crecimiento lineal del cache KV con la longitud de contexto en la parte SSM. El bundle exporta firmas de prefill de multiples longitudes (1 a 1024) para que el runtime seleccione chunks ajustados.

El proceso de cuantizacion aplicado por `litert-community` es int8 dinamica solo en las capas lineales (FC), con la tabla de embeddings externalizada y mantenida en float. Segun la model card, una tabla de embeddings int8 (incluso per-row) desestabiliza de forma medible el razonamiento del modelo en este checkpoint, provocando thinking desbocado y flips en decodificacion greedy que la receta FC-only no muestra. El embedder se separa en una seccion propia del lado CPU para que el grafo del decoder permanezca completamente delegable a GPU. Las convoluciones y el scan SSM permanecen en float. El template de chat se actualizo el 2026-09-21 para aceptar la forma content-parts de la version 0.18, manteniendo pesos, tokenizer y metadatos del ejecutor byte-identicos. No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto autoregresiva con modo de razonamiento explicito: abre un bloque `<think>...</think>` antes de responder.
- Razonamiento matematico y logico de varios pasos (verificado en GSM8K y en pruebas de sanity de logica/matematicas).
- Separacion del canal de razonamiento (`thought`) respecto a la respuesta final, gestionada por el runtime.
- Control del presupuesto de razonamiento mediante `--thinking-budget` (por ejemplo, 16 tokens cortan el razonamiento exactamente a esa longitud).
- Inferencia on-device con delegacion completa a GPU (6566 operaciones delegadas en Galaxy S26 y Pixel 8a).
- Ejecucion en CPU y GPU (backend Metal en iPhone, GPU en Android, CPU/GPU en Mac).
- Fidelidad de prompt-stream: el template y tokenizer reproducen byte a byte el stream de `apply_chat_template` del modelo upstream desde BOS.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (idiomas no especificados).
- Vision, audio: no disponible.

## Casos de uso

- Asistente de razonamiento en smartphone: el modelo puede ejecutarse localmente en Galaxy S26 (decode 16.1 tok/s, TTFT 760 ms) o iPhone 17 Pro (decode 22.8 tok/s), resolviendo problemas de matematicas y logica sin enviar datos a la nube. Adecuado por su tamano de 873 MB y su receta int8 optimizada para GPU movil.
- Tutor de matematicas offline: con GSM8K 76/100 en el bundle int8, puede usarse para resolver problemas aritmeticos paso a paso en entornos sin conectividad, mostrando el razonamiento en el canal `thought` separado de la respuesta.
- Aplicaciones de privacidad estricta: al ejecutarse on-device con LiteRT-LM, los prompts y respuestas no salen del dispositivo, lo que encaja en escenarios de salud, finanzas personales o datos sensibles donde no se permite inferencia remota.
- Control de latencia en interfaces conversacionales: con TTFT de 760 ms en Galaxy S26 y 2.08 s en Pixel 8a, es viable para asistentes de voz o chat con requisitos de respuesta inferior a 3 segundos en dispositivos de gama alta.
- Limitar coste de razonamiento en produccion: usando `--thinking-budget 256` o valores menores se acota el consumo de tokens de pensamiento, util para aplicaciones con presupuesto de computo o bateria restringido.
- Prototipado edge con LiteRT-LM: al ser un bundle `.litertlm` con firmas de prefill 1-1024 y stop tokens definidos, sirve como referencia para validar pipelines de despliegue on-device antes de escalar a modelos mayores de la familia Falcon-H1 (0.5B, 1.5B, 1.5B-Deep, 3B-Instruct).
- Evaluacion de cuantizacion en dispositivos: el checkpoint documenta comparativas int8 vs bf16 (76 vs 71 en GSM8K) y flips bidireccionales, por lo que es util como caso de estudio de ruido de cuantizacion en modelos de razonamiento pequenos.

## Benchmarks y rendimiento

Correctitud (segun model card):

| Benchmark | Configuracion | Resultado |
|---|---|---|
| GSM8K (100 preguntas, greedy, 2048 tokens) | Bundle int8 LiteRT-LM | 76/100 |
| GSM8K (100 preguntas, greedy, 2048 tokens) | Modelo bf16 PyTorch | 71/100 |
| Sanity gate 8 preguntas | Mac CPU | 6/8 |
| Sanity gate 8 preguntas | Mac GPU | 7/8 |
| Sanity gate 8 preguntas | iPhone CPU | 6/8 |
| Sanity gate 8 preguntas | iPhone Metal | 6/8 |

Rendimiento en Apple M4 Max (`litert-lm benchmark`, `-p 256 -d 256 --runs 3 --cache no`):

| Backend | Prefill (256) | Decode | TTFT |
|---|---|---|---|
| GPU | 2216 tok/s | 97.8 tok/s | 0.13 s |
| CPU | 381 tok/s | 47.8 tok/s | 0.69 s |

Rendimiento on-device (cold start, prompt compuesto de 148 tokens):

| Dispositivo | Backend | Prefill | Decode | TTFT (cold) |
|---|---|---|---|---|
| Galaxy S26 | GPU | 310 tok/s | 16.1 tok/s | 760 ms |
| Pixel 8a | GPU | 109 tok/s | 10.0 tok/s | 2.08 s |
| iPhone 17 Pro | GPU | 260 tok/s | 22.8 tok/s | 12.88 s |

En Galaxy S26 y Pixel 8a se delegaron las 6566 operaciones a GPU (LiteRT-LM 0.16.0, 2026-09-05). No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del bundle int8: 873 MB, lo que permite almacenamiento en dispositivos moviles sin problema.
- Memoria pico: el valor de "Peak memory" aparece truncado en la informacion proporcionada; no disponible con exactitud.
- GPU recomendadas: no se especifican modelos de datacenter (A100, H100, RTX 4090). El modelo esta disenado para GPU moviles (Adreno en Galaxy S26/Pixel 8a, Metal en iPhone 17 Pro) y para GPU integradas de Apple Silicon (M4 Max).
- Cabe en consumer GPU: si, por tamano (873 MB int8); se ha validado en GPU de smartphone y en Apple M4 Max. No hay datos de ejecucion en RTX 4090 u otras GPU de escritorio.
- Opciones de despliegue: LiteRT-LM (runtime principal, >= 0.16) con backends CPU y GPU; comandos `litert-lm run` y `litert-lm benchmark`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este bundle.
- Latencia y throughput: decode 97.8 tok/s en M4 Max GPU, 47.8 tok/s en M4 Max CPU; 22.8 tok/s en iPhone 17 Pro, 16.1 tok/s en Galaxy S26, 10.0 tok/s en Pixel 8a. TTFT desde 0.13 s (M4 Max GPU) hasta 12.88 s (iPhone 17 Pro cold start).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Falcon-H1-Tiny-R-0.6B (este bundle) | 0.6B | no disponible | `.litertlm` int8 | falcon-llm-license | Hugging Face, 181 descargas |
| Falcon-H1-0.5B (litert-community) | 0.5B | no disponible | `.litertlm` | falcon-llm-license | Hugging Face |
| Falcon-H1-1.5B (litert-community) | 1.5B | no disponible | `.litertlm` | falcon-llm-license | Hugging Face |
| Falcon-H1-1.5B-Deep (litert-community) | 1.5B | no disponible | `.litertlm` | falcon-llm-license | Hugging Face |
| Falcon-H1-3B-Instruct (litert-community) | 3B | no disponible | `.litertlm` | falcon-llm-license | Hugging Face |

Los modelos comparables pertenecen a la misma familia Falcon-H1 y comparten la misma receta de conversion hibrida y el mismo runtime LiteRT-LM. La diferencia principal de este checkpoint frente a sus hermanos es el empaquetado especifico para razonamiento (canal `thought` declarado y soporte de `--thinking-budget`). No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: en el sanity gate de 8 preguntas, fallan dos items de recall factual ("capital de Japon", "gracias en frances") en algunos backends; la model card indica que el modelo bf16 tambien falla estos items bajo perturbaciones de prompt de un token a esta escala.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Limitaciones de contexto o idioma: la longitud de contexto no se especifica; los idiomas soportados no estan disponibles.
- Estabilidad de cuantizacion: una tabla de embeddings int8 desestabiliza el razonamiento (thinking desbocado y flips greedy), por lo que el bundle mantiene el embedder en float; modificaciones de la receta pueden degradar la calidad.
- Bug de runtime con multiples conversaciones: en LiteRT-LM 0.18.0, al iniciar una nueva Conversation en un Engine que ya ejecuto otra, el runtime reutiliza tokens de prompt compartidos y no reinicia el estado recurrente (issue #3165). En una sonda, la misma Engine respondio "white" a la pregunta sobre el color del cielo frente a "a clear blue" en una Engine nueva. Se debe crear una Engine nueva por conversacion. Un fix aterrizo en LiteRT-LM main el 2026-11-03 (commit e1f86b05, continuacion del PR #3945) pero ninguna release lo incluye (v0.19.1 tampoco).
- Restricciones de licencia: falcon-llm-license (terminos en falconllm.tii.ae); debe revisarse antes de uso comercial.
- Requiere LiteRT-LM >= 0.16; versiones anteriores no son compatibles.
- El valor de memoria pico en dispositivos aparece truncado en la informacion; no disponible.
- El template de chat se actualizo para la forma content-parts de 0.18 (2026-09-21), con pesos y tokenizer sin cambios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Falcon-H1-Tiny-R-0.6B
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-Tiny-R-0.6B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Ficha edge-compat del bundle: https://github.com/john-rocky/edge-compat/blob/main/cards/falcon-h1-tiny-r-0.6b-int8/CARD.md
- Issue de runtime #3165: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- PR #3945: https://github.com/google-ai-edge/LiteRT-LM/pull/3945
- Commit del fix (2026-11-03): https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Terminos de licencia Falcon: https://falconllm.tii.ae/falcon-terms-and-conditions.html
- Hermano de la familia (3B-Instruct): https://huggingface.co/litert-community/Falcon-H1-3B-Instruct
