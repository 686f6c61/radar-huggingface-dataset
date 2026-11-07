# MatterWaveAI/grt-30m-curriculum

## Resumen

GRT-30M-Curriculum es un modelo de lenguaje causal de muy pequeno tamano (29,8 millones de parametros almacenados, de los cuales solo 9,74 millones corresponden al backbone no-embedding) desarrollado por MatterWaveAI. Se trata de la tercera iteracion de una familia de modelos basados en la arquitectura Geometric Rotation Transformer (GRT), una variante de transformer que sustituye parte de las operaciones lineales por rotaciones geometricas parametrizadas. El modelo se obtiene por destilacion de conocimiento desde Qwen 3, reutilizando su vocabulario BPE de 151.669 tokens para permitir una alineacion directa token a token entre profesor y alumno.

La relevancia de esta release radica en su metodologia de optimizacion: partiendo del mismo checkpoint de 29,3M de parametros que `MatterWaveAI/grt-30m`, aplica un curriculum multi-ronda con el optimizador `HuygensSymplecticAdam`, lo que eleva la precision media macro en la suite SLM-Bench de 39,61% (baseline PairAdam) a 47,16%, una mejora absoluta de 7,55 puntos. El modelo entrena 10,79B de tokens en 24 horas sobre 8 GPU A100-80GB, con un throughput sostenido de 123.900 tokens por segundo.

Con un contexto de solo 2.048 tokens y entrenamiento exclusivamente en ingles, esta pensado como banco de pruebas de investigacion para arquitecturas alternativas y tecnicas de curriculum learning en modelos pequenos, no como modelo de produccion generalista. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRTForCausalLM (`model_type: "grt"`, config `grt30m_kd`), transformer causal con bloques rotacionales |
| Parametros totales | 29.844.597 (29,84M); 29.305.498 segun model card |
| Parametros activos | no disponible (no es MoE; equivalente denso 55,68M) |
| Longitud de contexto | 2.048 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | GGUF f32 publicado (`grt-30m-f32.gguf`, 340 MB); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 116 MB) y GGUF (`grt-30m-f32.gguf`, 340 MB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Geometric Rotation Transformer, un transformer causal de 12 bloques con `hidden_size = 256`, 4 cabezas de atencion (`head_dim = 64`) e `intermediate_size = 1.024`. La particularidad esta en el uso de rotaciones geometricas parametrizadas: 11 rotaciones QKV, 1 rotacion de mixer y 21 rotaciones en el bloque FFN. La cabeza de salida es una "polar cosine head" atada al embedding, representado mediante `phase_angles [151669, 128]` y `log_magnitude [151669]`. Esta tabla de embedding supone 19,57M de parametros (66,8% del total almacenado), dejando 9,74M para el backbone de 12 capas.

El entrenamiento consistio en destilacion de conocimiento desde Qwen 3 sobre una mezcla de corpus: fineweb-edu (45%), cosmopedia-v2 (20%), wikipedia (15%), finemath (12%) y stack-edu (8%). Se procesaron 10.789.404.672 tokens (20.580 pasos) con batch global de 524.288 tokens por paso, learning rate pico de 1e-3 con schedule WSD, sobre 8 NVIDIA A100-SXM4-80GB con DDP y kernels CUDA fusionados de Givens. La innovacion principal de esta release es el curriculum multi-ronda con el optimizador `HuygensSymplecticAdam`, que parte del checkpoint de `grt-30m` y aplica rondas sucesivas de optimizacion. El resultado final en validacion FineWeb-Edu es `val_loss = 4,4776` y `val_ppl = 88,02` con precision top-1 del 27,20%.

## Capacidades

- Generacion de texto causal en ingles, con decodificacion greedy reproducible token a token en cuatro backends distintos (PyTorch ROCm, llama.cpp CPU AVX2, llama.cpp Vulkan y llama.cpp ROCm).
- Razonamiento basico de sentido comun y respuesta a preguntas de opcion multiple (BoolQ, ARC, OpenBookQA, PIQA).
- Verificacion numerica de 4 opciones en GSM8K con una tasa reportada del 99,20% (PPL 7,60).
- Capacidad multilingue: no disponible; solo ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.
- Destilacion alineada con el tokenizador de Qwen 3 (151.669 tokens), lo que facilita comparaciones directas con el profesor.

## Casos de uso

- Investigacion en arquitecturas alternativas: sirve como banco de pruebas reproducible para evaluar variantes de transformer rotacional frente a transformers convencionales con el mismo presupuesto de parametros y tokens.
- Experimentos de curriculum learning: el checkpoint permite comparar directamente el efecto de PairAdam frente a HuygensSymplecticAdam y frente al curriculum multi-ronda sobre la misma inicializacion.
- Destilacion de conocimiento a escala reducida: util como referencia para estudiar como un modelo de 9,74M de parametros no-embedding absorbe senales de un profesor mucho mayor (Qwen 3) en 24 horas de entrenamiento.
- Validacion de portabilidad entre backends: los kernels Givens fusionados y la paridad exacta entre PyTorch, llama.cpp CPU, Vulkan y ROCm lo hacen util para verificar implementaciones de inferencia.
- Educacion y demostraciones: su tamano (116 MB en safetensors, 340 MB en GGUF f32) permite ejecutarlo en hardware modesto para ilustrar conceptos de destilacion y decodificacion.
- Evaluacion de suites SLM-Bench: punto de comparacion para modelos pequenos en tareas de opcion multiple con contexto corto (2.048 tokens).

## Benchmarks y rendimiento

Resultados en la suite SLM-Bench (9 tareas de opcion multiple, 13.144 ejemplos held-out), comparando el baseline PairAdam, la pasada unica con HuygensSymplecticAdam y el curriculum multi-ronda:

| Tarea (SLM-Bench) | Split (n) | Aleatorio | Zero-shot | PairAdam | Huygens single-pass | Curriculum |
|---|---|---:|---:|---:|---:|---:|
| BoolQ | val (3.270) | 50,00% | 51,41% | 60,55% | 62,23% | 64,43% |
| ARC-Easy | test (2.376) | 25,00% | 29,59% | 28,96% | 36,32% | 40,19% |
| ARC-Challenge | test (1.172) | 25,00% | 20,82% | 23,55% | 25,68% | 29,69% |
| OpenBookQA | test (500) | 25,00% | 28,20% | 30,00% | 35,80% | 42,40% |
| PIQA | val (1.838) | 50,00% | 55,28% | 54,08% | no disponible | no disponible |
| Media macro (9 tareas) | 13.144 | no disponible | no disponible | 39,61% | 43,87% | 47,16% |

Otros datos reportados:

| Metrica | Valor |
|---|---|
| GSM8K verificacion numerica 4-way | 99,20% (PPL 7,60, frente a 27,99 del baseline) |
| Validacion FineWeb-Edu (loss / PPL) | 4,4776 / 88,02 |
| Precision top-1 de token | 27,20% |
| Throughput de entrenamiento | 123.900 tok/s (15.490 tok/s/GPU) |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en f32 (116 MB de pesos safetensors), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; probado en AMD Strix Halo (gfx1151) con PyTorch ROCm y llama.cpp (Vulkan y ROCm). Tambien funciona en CPU x86_64 con AVX2.
- Cabe en GPU consumer: si, en cualquier RTX, GTX o iGPU moderna; incluso en Raspberry Pi y dispositivos embebidos por su reducido tamano.
- Opciones de despliegue: transformers (PyTorch), llama.cpp (CPU, Vulkan, ROCm), y por extension cualquier runtime compatible con GGUF. No se ha publicado integracion con vLLM, TGI u Ollama.
- Latencia y throughput: no se han publicado mediciones de latencia en inferencia; el throughput de entrenamiento fue de 123.900 tok/s en 8 A100-80GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| GRT-30M-Curriculum | 29,84M (9,74M backbone) | 2.048 | Apache 2.0 | en | Arquitectura GRT rotacional, destilado de Qwen 3, curriculum multi-ronda |
| MatterWaveAI/grt-30m | 29,3M (9,74M backbone) | 2.048 | Apache 2.0 | en | Checkpoint base del que parte esta release; sin curriculum multi-ronda |
| Qwen 3 (profesor) | no disponible en la informacion | no disponible | no disponible | no disponible | Profesor de la destilacion; tokenizador compartido de 151.669 tokens |
| Otros SLM de ~30M | no disponible | no disponible | no disponible | no disponible | No se han proporcionado comparativas con modelos de terceros |

## Limitaciones y advertencias

- El modelo solo entiende y genera ingles; no se ha entrenado ni evaluado en otros idiomas.
- Ventana de contexto muy limitada (2.048 tokens), insuficiente para conversaciones largas, documentos extensos o tareas de agente multi-paso.
- La generacion greedy mostrada en la model card es incoherente semanticamente (repeticiones como "the first to be the first to be..."), lo que evidencia una calidad de generacion abierta muy baja pese a los resultados en tareas de opcion multiple.
- Riesgo alto de alucinacion: con 9,74M de parametros no-embedding y 10,79B tokens de entrenamiento, la capacidad de conocimiento factual es muy limitada.
- La precision media macro del 47,16% en SLM-Bench sigue siendo baja en terminos absolutos; no es apta para produccion en tareas de razonamiento general.
- El 66,8% de los parametros corresponden a la tabla de embedding heredada de Qwen 3, lo que infla el recuento total y reduce la capacidad efectiva del backbone.
- No hay soporte documentado de tool calling, agentes, vision, audio ni modo thinking.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y la baja calidad de generacion desaconsejan su uso en produccion sin validacion exhaustiva.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopcion ni de validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-curriculum
- Checkpoint base: https://huggingface.co/MatterWaveAI/grt-30m
- Dataset fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset cosmopedia-v2: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia-v2
- Dataset wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Suite SLM-Bench: referenciada en la model card como `training/slm_bench.py` / `grt-slm-bench` (sin URL publica disponible)
