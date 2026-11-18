# Mapika/decider-4b-GGUF

## Resumen

decider-4b es un modelo de decisión desarrollado por Mapika que no genera texto libre: lee un estado (por ejemplo, el texto de una incidencia) junto con una o varias preguntas, cada una con una lista explícita de opciones, y devuelve una probabilidad calibrada para cada opción en un único forward pass. Esta ficha cubre los ficheros GGUF (v3, publicados el 20 de octubre de 2026) del modelo base Mapika/decider-4b, pensados para su uso con llama.cpp y llama-cpp-python.

El modelo parte de Qwen/Qwen3.5-4B-Base y cuenta con 4.205.751.296 parámetros totales. Su valor diferencial es el enfoque "one-pass" con salida estructurada: en lugar de instruir a un LLM generativo para que responda con una etiqueta, se leen directamente los logits de los tokens correspondientes a las letras de cada opción en posiciones de respuesta predefinidas, divididos por una temperatura ajustada por tipo de pregunta. Esto produce distribuciones de probabilidad calibradas (ECE en torno a 0,047 en tareas in-task) y elimina la variabilidad de la decodificación autoregresiva.

La relevancia práctica está en tareas de clasificación y enrutamiento en producción: triaje de tickets, asignación de departamento, evaluación de urgencia o respuestas sí/no, donde se necesita una probabilidad explícita por clase y no una cadena de texto que haya que parsear. Los ficheros GGUF permiten ejecutar el modelo en CPU o en GPU de consumo con llama.cpp, con una pérdida de calidad mínima en Q8_0 respecto a los pesos bf16 en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen/Qwen3.5-4B-Base); lectura de logits en slots de respuesta |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (sin cuantizar), Q8_0, Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos PyTorch del modelo base en safetensors |
| Tamano del repo | 31,3 GB |
| Ficheros GGUF | Q4_K_M 2,7 GB; Q8_0 4,5 GB; BF16 8,4 GB |
| Pipeline | text-classification |
| Version de los ficheros | v3 (2026-10-20); v2.1 disponible bajo el tag `v2.1` |
| Entrada multimodal | solo con pesos PyTorch del modelo base y decider-ai 1.10.0; los GGUF contienen únicamente el modelo de texto |

## Arquitectura y entrenamiento

El modelo se construye sobre el checkpoint Qwen/Qwen3.5-4B-Base, un transformer decoder de 4.205.751.296 parámetros. La innovación no está en la arquitectura de la red sino en el protocolo de inferencia: el prompt se construye con `decider.prompt`, que inserta cada pregunta con su lista de opciones y reserva un slot de respuesta por pregunta. La respuesta se obtiene leyendo los logits de los tokens correspondientes a las letras de las opciones en esos slots y normalizándolos tras dividir por una temperatura ajustada por tipo de pregunta (por ejemplo, 2,098 para preguntas de tipo Choice y 0,05 para respuestas sí/no del tipo Noul). No hay generación autoregresiva ni muestreo.

Los detalles de composición del dataset de entrenamiento, número de tokens y si se aplicó RLHF o DPO no están disponibles en la información proporcionada; la model card remite a la ficha del modelo base Mapika/decider-4b para los orígenes de entrenamiento y sus términos. El checkpoint declara una capa de multi-token prediction (MTP) en su configuración pero no contiene pesos MTP, de modo que la conversión a GGUF exige `convert_hf_to_gguf.py --no-mtp --outtype bf16` seguida de `llama-quantize`; sin el flag el fichero resultante no carga en llama.cpp. La conversión se realizó con llama.cpp `c9064dded` (2026-09-27).

## Capacidades

- Clasificación con probabilidades calibradas: devuelve una probabilidad por cada opción de una lista cerrada, no texto libre.
- Múltiples preguntas por estado: `decide()` acepta un estado y varias preguntas con sus opciones, resolviéndolas en un solo forward pass.
- Preguntas de tipo sí/no (`system_one` con `score` y respuestas Noul) mediante decider-ai 1.6.0 o superior.
- Salida estructurada determinista en cuanto a formato: la respuesta se lee de slots fijos, sin parseo de texto generado.
- Inferencia en CPU y GPU vía llama.cpp / llama-cpp-python, con builds CUDA y Metal.
- Entrada de imagen solo con los pesos PyTorch del modelo base y decider-ai 1.10.0; no disponible en los ficheros GGUF.
- Multilingüe: no; el modelo declara únicamente inglés.
- Tool calling, agentes y razonamiento multi-paso: no disponibles; el modelo no es conversacional ni genera texto.

## Casos de uso

- Triaje de tickets de soporte: se pasa el texto del ticket como estado y una pregunta con opciones de departamento (billing, technical, sales); el modelo devuelve la probabilidad de cada uno en un solo paso, lo que permite umbrales de confianza y derivación a revisión humana cuando la máxima probabilidad es baja.
- Enrutamiento con múltiples decisiones por caso: `decide()` admite varias preguntas en la misma llamada (departamento y urgencia), de modo que un pipeline de atención al cliente obtiene ambas etiquetas con una única pasada por el modelo.
- Moderación y etiquetado de contenido: clasificación de textos en categorías cerradas con probabilidad calibrada, útil para priorizar colas de revisión según la confianza del modelo.
- Verificación de hipótesis en pipelines de datos: preguntas de tipo sí/no con `system_one` para comprobar si un registro cumple una condición, con score asociado en lugar de una respuesta textual que haya que interpretar.
- Despliegue en entornos sin GPU: el fichero Q4_K_M (2,7 GB) con `gguf_options=dict(n_gpu_layers=0, n_threads=8)` permite ejecutar la clasificación en CPU manteniendo la precisión held-out del modelo bf16 según la tabla del autor.
- Servicios de decisión de baja latencia: al requerir un único forward pass por prompt y no generar tokens, el coste por consulta es sustancialmente menor que el de un LLM generativo del mismo tamaño usado para clasificar.
- Evaluación A/B y experimentación: la salida probabilística calibrada (ECE 0,0468 in-task en bf16) facilita métricas de calibración y comparación entre versiones del modelo sin ruido de muestreo.

## Benchmarks y rendimiento

Resultados del conjunto de regresión del modelo base (95 tareas, 144.226 preguntas, 67 tareas in-task y 28 held-out) a temperatura Choice 2,098, leídos con llama.cpp (build CUDA, un prompt por decode) y comparados fila a fila con los pesos bf16 en PyTorch. Precisión, NLL y ECE son medias sobre tareas.

| Modelo / fichero | In-task acc / NLL / ECE | Held-out acc / NLL / ECE | Misma respuesta que bf16 PyTorch |
|---|---|---|---|
| bf16, PyTorch | 0,8206 / 0,4523 / 0,0468 | 0,7823 / 0,5680 / 0,0841 | — |
| Q8_0 | 0,8206 / 0,4525 / 0,0469 | 0,7813 / 0,5675 / 0,0841 | 99,44% |
| Q4_K_M | 0,8193 / 0,4562 / 0,0467 | 0,7824 / 0,5693 / 0,0821 | 96,46% |

El fichero BF16 GGUF no se evaluó sobre este conjunto. El autor advierte que los estados largos (decenas de miles de tokens) se degradan más con Q4_K_M de lo que refleja la tabla, medido sobre v2.1.

## Requisitos de hardware

- VRAM estimada: Q4_K_M 2,7 GB, Q8_0 4,5 GB, BF16 8,4 GB de pesos; el consumo real añade el contexto y el overhead de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para Q4_K_M y Q8_0; A100, H100 o RTX 4090 para mayor throughput y contextos largos. Builds CUDA (`CMAKE_ARGS="-DGGML_CUDA=on"`) y Metal en Apple Silicon.
- Consumer GPU: sí; Q4_K_M y Q8_0 caben en GPUs de consumo con 6-8 GB de VRAM. También es viable en CPU con `n_gpu_layers=0`.
- Opciones de despliegue: llama.cpp, llama-cpp-python, decider-ai (extra `[gguf]`) y el script `decide_gguf.py`. El servidor HTTP de decider-ai no sirve ficheros GGUF.
- Latencia y throughput: no disponibles de forma numérica; al ser un único forward pass por prompt, el coste por consulta es menor que el de generación autoregresiva. El autor recomienda un prompt por `llama_decode`: con varios prompts en un mismo decode las probabilidades varían con el resto del lote (hasta 0,02 en BF16 y 0,16 en Q4_K_M en la versión anterior del modelo).
- Nota: las builds de CPU y GPU producen probabilidades ligeramente distintas sobre el mismo fichero; las mediciones de la tabla usan la build CUDA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decider-4b (GGUF v3) | 4.205.751.296 | no disponible | Clasificación one-pass con probabilidades calibradas | apache-2.0 | Hugging Face, GGUF para llama.cpp |
| Qwen3.5-4B-Base | ~4B | no disponible | LLM generativo base | no disponible | Hugging Face |
| LLM generativo de ~4B usado para clasificar | ~4B | variable | Generación de texto con parseo posterior | variable | variable |

No se dispone en la información proporcionada de resultados de benchmarks de alternativas comparables sobre el mismo conjunto de regresión, por lo que la comparación cuantitativa de rendimiento entre modelos queda como no disponible.

## Limitaciones y advertencias

- No es un modelo conversacional: cargarlo en `llama-cli`, `llama-server`, Ollama o LM Studio produce un modelo de texto que continúa prompts, y ese texto generado no es su respuesta. El uso correcto exige el protocolo de lectura de logits de `decider.prompt` y `decide_gguf.py` o decider-ai.
- Solo inglés: no hay soporte multilingüe declarado.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las probabilidades pueden ser erróneas o poco informativas en estados fuera de la distribución de entrenamiento; la calibración held-out (ECE 0,0841 en bf16) es peor que la in-task.
- Los estados largos (decenas de miles de tokens) se degradan más con Q4_K_M de lo que muestra la tabla de regresión, según medición del autor sobre v2.1.
- Requisito de un prompt por `llama_decode`: batchear varios prompts en un mismo decode altera las probabilidades.
- Diferencias menores entre builds de CPU y GPU sobre el mismo fichero.
- La entrada de imagen no está disponible en los GGUF; requiere los pesos PyTorch del modelo base y decider-ai 1.10.0.
- El servidor HTTP de decider-ai no sirve ficheros GGUF.
- Licencia apache-2.0 para los ficheros GGUF, pero los términos de las fuentes de entrenamiento se remiten a la ficha del modelo base; conviene revisarlos antes de un uso comercial.
- La conversión exige `--no-mtp`; sin ese flag el fichero generado no carga en llama.cpp.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Mapika/decider-4b-GGUF
- Modelo base: https://huggingface.co/Mapika/decider-4b
- Tag de la versión anterior: https://huggingface.co/Mapika/decider-4b-GGUF/tree/v2.1
- Modelo base de la arquitectura: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- llama.cpp (conversión y cuantización): https://github.com/ggml-org/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
