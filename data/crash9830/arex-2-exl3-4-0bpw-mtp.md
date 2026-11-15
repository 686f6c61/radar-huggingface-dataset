# Crash9830/AREX-2-exl3-4.0bpw-MTP

## Resumen

AREX-2-exl3-4.0bpw-MTP es una cuantización EXL3 de 4 bits del modelo BAAI/AREX-2, un modelo agéntico de investigación desarrollado por BAAI (Beijing Academy of Artificial Intelligence) sobre la base de Qwen3.8-27B. El repositorio lo publica el usuario Crash9830 y su principal aportación no es la cuantización en sí, sino la incorporación de una cabeza MTP (multi-token prediction) que el release original de AREX-2 declara en su configuración pero no incluye en los pesos. Sin esa cabeza, los motores de inferencia no pueden aplicar decodificación especulativa MTP; con ella, sí.

El modelo conserva la arquitectura híbrida de Qwen3.8-27B (etiquetada `qwen3_5` y empaquetada como `Qwen3_5ForConditionalGeneration`, con layout multimodal image-text-to-text) y está orientado a tareas de agente: uso de herramientas, deep research y navegación web. La cuantización reduce el peso a 4,00 bits por peso en el decodificador (6 bpw en la cabeza y 4 bpw en el MTP), dando un checkpoint de 16,9 GB que cabe en una GPU Intel Arc Pro B70 de 32 GB, el hardware en el que el autor lo validó.

Es relevante ahora porque demuestra un patrón práctico de ingeniería de despliegue: injertar tensores de la cabeza MTP del modelo base Qwen3.8-27B en un checkpoint derivado, cuantizarlos junto con el resto y habilitar decodificación especulativa en vLLM con el plugin exl3xpu sobre Intel Arc, con una tasa de aceptación del 66,6% de tokens draft y un throughput de 62 a 87 tok/s.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B (familia `qwen3_5`, clase `Qwen3_5ForConditionalGeneration`, layout multimodal image-text-to-text) con cabeza MTP |
| Parametros totales | 8.430.253.296 (8,43 mil millones), segun safetensors |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens verificados en el despliegue de referencia (`max_model_len=131072`); el maximo nativo de AREX-2 no se detalla en la informacion disponible |
| Tipos de cuantizacion | EXL3 4,00 bpw (decodificador), 6 bpw (cabeza), 4 bpw (MTP); codebook mul1; out scales always; calibracion 250 filas x 2048 columnas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3, libreria exllamav3) |

## Arquitectura y entrenamiento

El checkpoint es una conversión de formato, no un reentrenamiento. AREX-2 se construye sobre Qwen3.8-27B, cuyo layout de capas, tamano oculto, configuracion MTP y vocabulario (248.077 tokens) fueron verificados como idénticos antes del injerto; la plantilla de chat es byte a byte igual a la de Qwen3.8-27B. AREX-2 ya viene como checkpoint con layout de vision, por lo que se convirtió tal cual, sin renombrar tensores, copiando de la cuantización EXL3 de Qwen3.8-27B cualquier config de procesador que faltase.

La innovación técnica concreta es el injerto de los 15 tensores `mtp.*` de Qwen/Qwen3.8-27B (revision `37561816e66b5b9153b1b64c10968c18c1e6f4a0`) en bf16 dentro del checkpoint de AREX-2 antes de cuantizar, y su cuantización posterior a 4 bpw. La cabeza no fue entrenada con AREX-2: solo propone tokens draft y el modelo principal verifica cada uno, de modo que la salida es exactamente la que produciría AREX-2 en solitario. La cuantización se realizó con exllamav3 v1.4.2 (`convert.py`) usando los mismos ajustes que la cuantización 4,00 bpw de turboderp/Qwen3.8-27B. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO de AREX-2 en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat propia de AREX-2.
- Modo thinking configurable mediante `reasoning_effort` ("medium", "low") o `enable_thinking: false`, pasado por `chat_template_kwargs` en vLLM.
- Uso de herramientas (tool use) y orquestación de agentes multi-paso; validado como worker de Hermes Agent.
- Deep research: recolección de datos, búsqueda de listados, emparejamiento de números de modelo y condiciones, y cálculo de precios contra ground truth.
- Navegación web mediante navegador headless, con tendencia a invocar la herramienta de navegador antes de scriptar.
- Entrada multimodal declarada (pipeline image-text-to-text); el autor sirvió el modelo solo como texto y no probó imágenes ni vídeo.
- Decodificación especulativa MTP con aceptación de drafts del 66,6% en las pruebas del autor.
- Capacidades multilingües: limitadas al inglés según la metadata del repositorio.

## Casos de uso

- Investigación agéntica con fuentes web estructuradas: el modelo puntuó 9/9 en tareas de recolección de datos de un sitio de comercio simulado, igualando o superando al Qwen3.8-27B base (8/9), lo que lo hace adecuado para pipelines de extracción y verificación de datos.
- Automatización de scripting previo a la navegación: con la herramienta de navegador desactivada o con una regla que obligue a nombrar el script fallido antes de abrir el navegador, completó las tareas usando aproximadamente un 18% menos de tiempo de GPU por resultado correcto que el modelo base.
- Despliegue en hardware Intel Arc: el checkpoint carga en vLLM 0.26.1 XPU con el plugin exl3xpu en una Arc Pro B70 de 32 GB, lo que permite servir agentes en estaciones de trabajo con GPU Intel en lugar de NVIDIA.
- Servicio de contexto largo en una sola GPU: con `max_model_len=131072` y `max_num_seqs=1` el pool de KV alcanza 132.466 tokens, suficiente para una sesión completa de 131K; también caben dos sesiones de 64K con `max_num_seqs=2`.
- Asistentes de atención al cliente multi-turno en inglés: la ventana de 131K tokens permite mantener historiales extensos y documentos de referencia en el mismo contexto.
- Evaluación de agentes y benchmarking interno: sirve como variante cuantizada reproducible de AREX-2 para comparar comportamiento agéntico frente al modelo base con los mismos prompts y herramientas.
- Prototipado de decodificación especulativa: al incluir la cabeza MTP ausente en el release original, permite medir el impacto de MTP en motores compatibles sin modificar el modelo principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son pruebas informales de comportamiento agéntico y métricas de inferencia del autor:

| Prueba | AREX-2 (esta cuantizacion) | Qwen3.8-27B base (EXL3 4,00 bpw) |
|---|---|---|
| Recoleccion de datos en sitio simulado (9 tareas) | 9/9 | 8/9 |
| Llamadas al modelo por tarea (con navegador) | ~17 | ~10 |
| Sitios con proteccion anti-bot, con navegador (16 tareas) | 2/16 | 7/16 |
| Sitios con proteccion anti-bot, sin navegador (16 tareas) | 4/16 | no disponible |

| Metrica de inferencia | Valor |
|---|---|
| Throughput de decode | 62 a 87 tok/s segun tarea |
| Aceptacion de drafts MTP | 66,6% |
| Pool de KV (131K, 1 secuencia) | 132.466 tokens |
| Hardware de referencia | Intel Arc Pro B70 32 GB, vLLM 0.26.1 XPU + exl3xpu, KV cache fp8 |

## Requisitos de hardware

- VRAM estimada: el repo pesa 16,9 GB en EXL3 4,00 bpw; con KV cache fp8 y overhead de runtime, el autor lo sirvió con `gpu_memory_utilization=0.79` en una GPU de 32 GB que además manejaba dos monitores.
- GPU recomendadas: Intel Arc Pro B70 (32 GB) es el hardware validado. No se documentan pruebas en A100, H100 ni RTX 4090 en la información disponible.
- GPU de consumo: no hay confirmación de funcionamiento en GPUs consumer; el tamaño de pesos (16,9 GB) encajaría en tarjetas de 24 GB, pero no se ha validado.
- Opciones de despliegue: vLLM 0.26.1 XPU con el plugin exl3xpu (validado); cualquier motor compatible con el layout de turboderp/Qwen3.8-27B-exl3 debería cargarlo, según el autor. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 62 a 87 tok/s de decode con MTP y aceptación del 66,6%, con `max_num_seqs=1`. No se reportan métricas de prefill ni de latencia por petición.
- Nota operativa: si se cambian los límites de imagen y vídeo tras un primer arranque, hay que limpiar la caché de compilación de vLLM, porque su clave de caché no los incluye.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AREX-2-exl3-4.0bpw-MTP (este) | 8,43 mil millones | 131.072 (verificado) | EXL3 4,00 bpw, safetensors, con MTP | apache-2.0 | Hugging Face, 0 descargas |
| BAAI/AREX-2 (base) | no disponible en la informacion | no disponible | pesos originales, sin tensores `mtp.*` | apache-2.0 | Hugging Face |
| turboderp/Qwen3.8-27B-exl3 | 27B (segun nombre del repo) | no disponible | EXL3 4,00 bpw, safetensors | no disponible en la informacion | Hugging Face |
| Qwen/Qwen3.8-27B | 27B (segun nombre del repo) | no disponible | bf16, safetensors | no disponible en la informacion | Hugging Face |

La comparación de rendimiento solo existe frente a Qwen3.8-27B en las pruebas agénticas informales recogidas en la sección de benchmarks. No hay datos de benchmarks estandarizados para ninguno de los modelos en la información disponible.

## Limitaciones y advertencias

- La cabeza MTP no fue entrenada con AREX-2; solo propone drafts que el modelo principal verifica. La salida es la de AREX-2, pero la tasa de aceptación (66,6%) sería mayor con una cabeza entrenada específicamente.
- Rendimiento débil en sitios con protección anti-bot: 2/16 con navegador y 4/16 sin navegador, frente a 7/16 del modelo base. Para entornos hostiles conviene un modelo que maneje mejor el navegador.
- Mayor coste por tarea por defecto: tiende a abrir el navegador primero (~17 llamadas al modelo por tarea frente a ~10 del base), lo que lo hace más lento salvo que se desactive la herramienta o se imponga una regla de scripting previo.
- Idiomas: solo inglés según la metadata; no se documenta soporte de castellano ni otros idiomas.
- Multimodalidad no validada: el pipeline es image-text-to-text y el layout es de vision, pero el autor sirvió el modelo solo como texto y no probó imágenes ni vídeo.
- Riesgo de alucinación: en las pruebas del autor no inventó valores y reportó bloqueos explícitamente, pero son pruebas pequeñas e informales, no una garantía para producción.
- Licencia Apache 2.0 permite uso comercial; deben mantenerse el archivo `LICENSE` original y la cita a AREX-2 que pide su model card.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni reportes de terceros.
- No se dispone de información sobre sesgos, datos de entrenamiento de AREX-2 ni evaluaciones de seguridad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Crash9830/AREX-2-exl3-4.0bpw-MTP
- Modelo base: https://huggingface.co/BAAI/AREX-2
- Modelo del que se toman los tensores MTP: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización de referencia con layout identico: https://huggingface.co/turboderp/Qwen3.8-27B-exl3
- Plugin exl3xpu para vLLM en Intel Arc: https://github.com/0xSero/exl3xpu
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
