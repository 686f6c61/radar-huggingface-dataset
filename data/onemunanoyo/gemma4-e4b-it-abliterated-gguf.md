# onemunanoyo/gemma4-E4B-it-Abliterated-GGUF

## Resumen

gemma4-E4B-it-Abliterated-GGUF es una version "abliterated" (es decir, con el comportamiento de rechazo suprimido mediante edicion de pesos) del modelo google/gemma-4-E4B-it, publicada por el usuario onemunanoyo en formato GGUF para su uso con llama.cpp. El modelo base es un transformer multimodal de Google capaz de procesar texto, imagen y audio, con 42 capas y un total de 8.610 millones de parametros segun la model card (7.518.069.290 segun los tensores safetensors reportados por Hugging Face). La intervencion se realizo con la herramienta heretic v2.2.0 mediante ablacion de rango arbitrario (ARA) y optimizacion Optuna TPE sobre una unica GPU NVIDIA L4 de 24 GB.

El interes de esta publicacion no esta en la arquitectura, heredada integramente del modelo base, sino en la metodologia de seleccion del trial. El criterio por defecto de heretic priorizo el trial 30 (0/100 rechazos) pero con una divergencia KL de 10,69 respecto al base, lo que indica colapso de la distribucion de salida. El autor reselecciono el trial 39 desde el frente de Pareto, que reduce los rechazos de 100/100 a 7/100 manteniendo una KL de 0,0899 y, segun sus mediciones, una perplejidad ligeramente inferior a la del base (factor 0,960 sobre wikitext-2-raw).

La relevancia practica es doble: por un lado, ofrece una variante sin rechazos del modelo Gemma 4 E4B con perdida de capacidad aparentemente despreciable en perplejidad; por otro, documenta un caso de estudio sobre como la seleccion automatica de trials en pipelines de abliteracion puede producir modelos degradados si no se filtra por divergencia KL. El repo ocupa 29,4 GB e incluye cuantizaciones BF16, Q8_0 y Q4_K_M, ademas de un proyector multimodal separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + vision + audio), 42 capas, arquitectura `gemma4` en llama.cpp |
| Parametros totales | 8.610 millones (model card) / 7.518.069.290 (tensores safetensors reportados) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (GGUF); proyector multimodal en BF16 |
| Idiomas soportados | ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo como referencia de parametros del base) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base google/gemma-4-E4B-it: un transformer de 42 capas con capacidad multimodal nativa (texto, imagen y audio), segun la model card. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base empleo RLHF o DPO. Tampoco se detalla el mecanismo de proyeccion multimodal mas alla de la existencia de un fichero `mmproj` en BF16 de 0,99 GB que debe cargarse junto al modelo para entrada de imagen o audio.

La innovacion tecnica de esta publicacion es el proceso de abliteracion. Se aplico heretic v2.2.0 con ablacion de rango arbitrario (ARA) y 100 trials de Optuna TPE sobre una NVIDIA L4 de 24 GB. No hubo fine-tuning ni merge posterior: el checkpoint abliterado se convierte a GGUF tal cual. El autor documenta que el criterio de seleccion por defecto de heretic (orden lexicografico que prioriza la tasa de rechazo) eligio el trial 30, con 0/100 rechazos pero KL de 10,69 frente al base, senal de colapso de la distribucion. El trial 39, reseleccionado desde el frente de Pareto, es el publicado. En cuanto a las cuantizaciones, el Q8_0 es bit-identico a un `llama-quantize ... Q8_0` estandar salvo `per_layer_model_proj.weight`, que llama.cpp mantiene en BF16; en Q4_K_M los tensores de embedding por capa (`token_embd`, `per_layer_token_embd`) se conservan en Q6_K, resultando en 5,34 GB a 5,66 bits por peso en lugar de los ~4,5 GB de una estimacion ingenua a 4 bits.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat personalizada embebida en el GGUF (requiere `--jinja` en llama.cpp).
- Modo de razonamiento ("thinking") activable y desactivable: `-rea on` / `-rea off` en CLI, o `chat_template_kwargs.enable_thinking` en la API compatible con OpenAI.
- Procesamiento de imagen y audio mediante el proyector multimodal `mmproj` (fichero separado, 0,99 GB en BF16).
- Capacidades multilingues limitadas a ingles y japones segun los metadatos del modelo.
- Comportamiento de rechazo suprimido: 7/100 rechazos en `mlabonne/harmful_behaviors` frente a 100/100 del base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo thinking puede habilitar cadenas de razonamiento, pero no se detalla su uso agentico.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo sirve como caso controlado para estudiar el efecto de la abliteracion sobre la distribucion de salida, comparando KL, perplejidad y tasas de rechazo frente al base. La documentacion del frente de Pareto y del trial 39 lo hace especialmente util como referencia metodologica.
- Evaluacion de robustez de filtros de contenido: al presentar 7/100 rechazos, permite probar clasificadores de seguridad, guardrails y sistemas de moderacion en un regimen de baja tasa de rechazo del propio modelo.
- Procesamiento de documentos con imagen en local: con el `mmproj` cargado en llama.cpp, se puede usar para describir imagenes o transcribir audio en entornos sin conexion, aprovechando la cuantizacion Q4_K_M (5,34 GB) para GPUs de 7 GB o superiores.
- Asistente conversacional en japones o ingles sobre hardware de consumo: el Q8_0 (8,03 GB) cabe en GPUs de 10 GB y permite desplegar un chatbot multimodal con `llama-server` y API compatible con OpenAI.
- Generacion de texto con razonamiento controlado: el flag `enable_thinking` permite alternar entre respuestas directas y cadenas de razonamiento, util en pipelines donde la latencia importa y solo algunas consultas requieren deliberacion.
- Analisis de perplejidad y calidad de cuantizaciones: el repo incluye BF16, Q8_0 y Q4_K_M del mismo checkpoint, lo que facilita estudios comparativos de degradacion por cuantizacion con `llama-perplexity` en condiciones identicas.

## Benchmarks y rendimiento

| Metrica | Base | Este modelo |
|---|---|---|
| Tasa de rechazo (`mlabonne/harmful_behaviors`, 100 prompts) | 100/100 | 7/100 |
| Divergencia KL (`mlabonne/harmless_alpaca`, vs. base) | — | 0,0899 |
| Perplejidad (`wikitext-2-raw`, llama.cpp, Q8_0) | 52,3834 ± 0,64 | 50,2741 ± 0,61 (0,960x) |

La perplejidad se midio con `llama-perplexity -c 2048 --chunks -1 -ngl 99 --seed 42` sobre 144 chunks (294.912 tokens), con base y abliterado en condiciones identicas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la informacion disponible.

## Requisitos de hardware

- VRAM recomendada por el autor: 16 GB o mas para BF16 (15,05 GB), 10 GB para Q8_0 (8,03 GB), 7 GB para Q4_K_M (5,34 GB).
- El proyector multimodal anade 0,99 GB en BF16 y solo es necesario para entrada de imagen o audio.
- GPU utilizada para la abliteracion: NVIDIA L4 de 24 GB (100 trials de Optuna TPE).
- Cabe en GPUs de consumo: Q4_K_M en tarjetas de 8 GB con contexto moderado; Q8_0 en RTX 4090 (24 GB) con holgura; BF16 en RTX 4090 o A100/H100.
- Despliegue: llama.cpp con soporte de arquitectura `gemma4` (`llama-server`, `llama-cli`, `llama-mtmd-cli`), obligatorio `--jinja`. No se documenta compatibilidad con vLLM, TGI u Ollama en la informacion disponible.
- Muestreo recomendado segun `generation_config.json`: temperature 1.0, top_k 64, top_p 0.95.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| gemma4-E4B-it-Abliterated (este) | 8,61 B (card) / 7,52 B (safetensors) | no disponible | Si (texto, vision, audio) | Apache 2.0 | GGUF | 7/100 rechazos, KL 0,0899 |
| google/gemma-4-E4B-it (base) | 8,61 B | no disponible | Si (texto, vision, audio) | Apache 2.0 | safetensors (original) | 100/100 rechazos |
| Otras variantes abliterated de Gemma 4 E4B | no disponible | no disponible | no disponible | no disponible | no disponible | no se dispone de datos comparativos |

No se dispone de informacion sobre otras alternativas abliteradas del mismo modelo base ni sobre modelos comparables de otros desarrolladores con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion suprime el comportamiento de rechazo: el modelo respondera a peticiones que el base rechazaria. Esto lo hace inadecuado para despliegues orientados al publico sin guardrails externos.
- Aunque la perplejidad no empeora (0,960x respecto al base) y la KL es baja (0,0899), la ablacion modifica la distribucion de salida; pueden aparecer degradaciones no capturadas por wikitext-2-raw, especialmente en tareas de instruccion, codigo o seguridad.
- El autor documenta que el trial seleccionado por defecto (trial 30) tenia KL 10,69 y colapso de la distribucion; el publicado es el trial 39. Esto evidencia que la seleccion automatica de heretic puede producir modelos degradados si no se filtra por KL.
- Idiomas soportados limitados a ingles y japones segun los metadatos; el rendimiento en castellano no esta documentado.
- Longitud de contexto no disponible en la informacion proporcionada.
- Requiere una build de llama.cpp con soporte de arquitectura `gemma4` y el flag `--jinja`; builds antiguas no cargaran el modelo.
- El uso de vision y audio exige cargar el fichero `mmproj` por separado; sin el, el modelo funciona solo con texto.
- Licencia Apache 2.0 declarada por el autor, heredada del base; conviene verificar los terminos de uso del modelo original de Google antes de un despliegue comercial.
- Sin descargas ni likes en el momento de la consulta (0/0), lo que implica ausencia de validacion comunitaria independiente.
- Riesgo de alucinacion no cuantificado en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onemunanoyo/gemma4-E4B-it-Abliterated-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Herramienta heretic: https://github.com/p-e-w/heretic
- llama.cpp (soporte `gemma4`, `llama-mtmd-cli`): no se proporciona enlace directo en la informacion disponible
- Dataset de evaluacion de rechazos `mlabonne/harmful_behaviors`: no se proporciona enlace directo en la informacion disponible
- Dataset de evaluacion `mlabonne/harmless_alpaca`: no se proporciona enlace directo en la informacion disponible
