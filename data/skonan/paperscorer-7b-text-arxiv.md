# skonan/PaperScorer-7B-Text-arXiv

## Resumen

PaperScorer-7B-Text-arXiv es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen2.5-7B-Instruct, desarrollado por Sachin Konan y colaboradores (zlab-princeton), y publicado bajo el identificador skonan/PaperScorer-7B-Text-arXiv. No es un asistente conversacional de propósito general: es un modelo especializado en una única tarea de decisión binaria, predecir si un artículo académico sería aceptado o rechazado en un congreso de aprendizaje automático de primer nivel, a partir de su texto completo en formato markdown. La salida se restringe a `Outcome: \boxed{Accept}` o `Outcome: \boxed{Reject}`, y los logprobs de la posición del token de decisión se utilizan para obtener una probabilidad calibrada.

El modelo tiene 7.615.616.512 parámetros (arquitectura densa Qwen2, decoder-only), hereda la ventana de contexto del modelo base y fue entrenado con un `cutoff_len` de 24.480 tokens, suficiente para ingestas completas de artículos junto con el preámbulo de instrucciones. Se entrenó sobre el conjunto arxiv-large (71.000 ejemplos balanceados por venue), durante 2 de las 4 épocas previstas (checkpoint en el paso 4.442), con LLaMA-Factory y FSDP2.

Su relevancia actual es doble: por un lado, ofrece una señal cuantitativa reproducible sobre la predictibilidad de la aceptación académica, un problema clásico de meta-ciencia; por otro, sirve como componente de triaje editorial automatizado en la suite PaperScorer, que incluye orquestador con interfaz web, servidor de scoring y variantes multimodales (visión) y de otros dominios (OpenReview/ICLR). La adopción pública registrada es todavía muy baja (9 descargas y 0 likes en el momento de la consulta), por lo que debe considerarse un artefacto de investigación más que un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen2 (modelo base Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base Qwen2.5; cutoff de entrenamiento de 24.480 tokens |
| Tipos de cuantizacion | no disponible en la model card; el repositorio solo publica safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | other (no especificada; el modelo base Qwen2.5-7B-Instruct es Apache-2.0, pero el ajuste se publica bajo "other") |
| Formato de pesos | safetensors |

Datos adicionales: tamaño del repositorio 30,5 GB, lo que es coherente con pesos almacenados a ~4 bytes por parámetro (fp32), aunque la model card no declara la precisión de los pesos. Modelo base declarado: Qwen/Qwen2.5-7B-Instruct (relación `finetune`). Fecha de creación registrada: 2026-05-19; última actualización: 2026-10-12.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de la familia Qwen2, sin mezcla de expertos, sin mecanismos de estado recurrente (SSM) y sin hibridaciones. No se introduce ningún módulo nuevo ni técnica de decodificación especulativa propia; la innovación del trabajo está en el procedimiento de ajuste y, sobre todo, en el esquema de calibración de la salida. El entrenamiento se realizó con LLaMA-Factory sobre FSDP2, con una tasa de aprendizaje de 1e-6, un scheduler `cosine_then_constant` (decay_ratio 0,75, min_lr_rate 0,001), tamaño de lote 32 y longitud de corte de 24.480 tokens. No se documenta el uso de RLHF ni de DPO: es exclusivamente SFT supervisado sobre pares entrada-salida.

Los datos de entrenamiento provienen del conjunto arxiv-large, con 71.000 ejemplos balanceados por venue, y el checkpoint publicado corresponde al paso 4.442, es decir, el final de la época 2 de un total de 4 previstas. El formato de entrada son conversaciones de tres turnos estilo sharegpt (`system`, `human`, `gpt`), donde el turno de sistema es idéntico en los ocho modelos de la colección PaperScorer y el preámbulo de usuario es específico del dominio de entrenamiento. La etiqueta de salida es siempre una de dos cadenas fijas, y en inferencia se leen los logprobs en la posición del token de decisión (quinto token generado bajo la plantilla de Qwen) para calcular la puntuación `logprob(Accept) − logprob(Reject)`, calibrada con un umbral elegido sobre el conjunto de validación arxiv-balanced-val. La model card advierte explícitamente de una asimetría de datos: los modelos entrenados con arXiv vieron aproximadamente 3 veces más ejemplos que los entrenados con ICLR, por lo que cualquier comparación directa entre ambos debe tenerlo en cuenta.

## Capacidades

- Clasificación binaria de aceptación/rechazo de artículos académicos a partir del texto completo del manuscrito (título más cuerpo en markdown).
- Generación de una puntuación continua calibrada mediante la diferencia de logprobs entre los tokens `Accept` y `Reject`, además de la etiqueta discreta.
- Ingesta de manuscritos largos: el `cutoff_len` de entrenamiento de 24.480 tokens permite procesar artículos completos con el preámbulo de instrucciones en una sola pasada.
- Soporte de tres vías de entrada en el orquestador: PDF anonimizado, directorio de fuentes LaTeX anonimizado e identificador de arXiv.
- Servicio mediante API compatible con OpenAI a través de vLLM, y también a través del servidor FastAPI del orquestador PaperScorer (endpoints `/submit`, `/submit_latex`, `/submit_arxiv`, `/status/{job_id}`).
- Capacidad de razonamiento general, código, matemáticas o tool calling: no documentada para este ajuste; el modelo está especializado y su salida esperada se limita al veredicto.
- Capacidades multilingües: no. El modelo está declarado únicamente para inglés (`language: en`) y el preámbulo de instrucciones está en inglés.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades de visión o audio: no en esta variante. Existen variantes de visión en la misma colección que añaden un token `<image>` por captura de página, pero este checkpoint es exclusivamente de texto.

## Casos de uso

- Triaje editorial automatizado: una revista o congreso puede enviar cada manuscrito recibido al servidor de scoring y obtener una probabilidad de aceptación calibrada, usando esa señal para priorizar qué envíos pasan a revisión completa o a un filtro de escritorio previo. El contexto de 24.480 tokens permite procesar el artículo entero sin truncar.
- Autoevaluación por parte de autores: antes de enviar un artículo, el autor puede ejecutar `paperscorer run` sobre el PDF y obtener un veredicto y una probabilidad, útil como señal adicional de madurez del manuscrito (nunca como sustituto de la revisión por pares).
- Filtrado y priorización de preprints en arXiv: dado que el modelo acepta directamente un `arxiv_id` mediante el endpoint `/submit_arxiv`, puede integrarse en flujos de vigilancia tecnológica que ordenen los preprints diarios por probabilidad de aceptación en un venue de primer nivel.
- Investigación en meta-ciencia: el modelo y el conjunto de datos asociado permiten estudiar cuantitativamente qué características textuales correlacionan con la aceptación, y comparar la predictibilidad entre dominios (arXiv frente a OpenReview/ICLR) y entre modalidades (texto frente a visión).
- Planificación de carga de revisión: estimar de antemano el volumen esperado de aceptaciones por venue a partir del flujo de envíos, con el objetivo de dimensionar comités de programa y asignar revisores.
- Construcción de líneas base reproducibles: al publicarse ocho modelos comparables (3B y 7B; texto y visión; arXiv y OpenReview) y sus conjuntos de datos, sirve como referencia para investigaciones posteriores sobre predicción de aceptación y calibración de clasificadores.
- Formación de revisores: usar la puntuación y las variantes del prompt para ilustrar qué señales textuales empujan un veredicto hacia la aceptación o el rechazo en ejercicios docentes de revisión científica.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados en el conjunto `arxiv-balanced-test` (in-distribution), con umbral de calibración fijado en `arxiv-balanced-val`. La puntuación utilizada es `logprob(Accept) − logprob(Reject)` en la posición del token de decisión. `pA` es la tasa de aceptación predicha y `A_rec` / `R_rec` son el recall de aceptación y de rechazo respectivamente.

| n_test | Exactitud (Acc) | AUC | pA | A_rec | R_rec |
|---|---|---|---|---|---|
| 1415 | 74,6 % | 0,829 | 55 % | 80,7 % | 68,8 % |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros), ni comparaciones numéricas con modelos de terceros.

## Requisitos de hardware

- Pesos en fp32: el repositorio ocupa 30,5 GB, lo que sugiere pesos a 4 bytes por parámetro. Requiere al menos 40 GB de VRAM solo para los pesos, más caché KV y activaciones: GPU A100 40/80 GB, H100 80 GB, o bien reparto en varias GPU.
- Pesos en bf16/fp16 (requiere conversión): aproximadamente 15,2 GB para los pesos. Con la caché KV a la longitud de entrenamiento (24.480 tokens) en torno a 1,4 GB (estimación para la configuración de Qwen2.5-7B con GQA) más activaciones, se recomienda un mínimo de 24 GB de VRAM.
- GPU recomendadas para bf16: A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX A6000 48 GB; una RTX 4090 de 24 GB es suficiente para inferencia bf16 a longitudes moderadas.
- Cuantización a int8 (aproximadamente 7,6 GB de pesos): cabe en GPU de consumo con 16 GB o más, como RTX 4080, RTX 4090 o RTX 4070 Ti Super.
- Cuantización a 4 bits (aproximadamente 4,7 GB de pesos): cabe en GPU de consumo de 8-12 GB (RTX 3060 12 GB, RTX 4060 8 GB) y en equipos Apple Silicon con memoria unificada de 16 GB. No se publican ficheros GGUF en el repositorio, por lo que la conversión debe realizarla el usuario.
- Opciones de despliegue: vLLM está documentado en la propia model card (`vllm serve skonan/PaperScorer-7B-Text-arXiv --task generate --gpu-memory-utilization 0.85`, API compatible con OpenAI en el puerto 8000); el orquestador `paperscorer` (instalable con `uv tool install .`) levanta el servidor de scoring y la interfaz web en el puerto 8003; llama.cpp, Ollama o TGI son viables por compatibilidad de arquitectura con Qwen2, pero no están documentados para este checkpoint.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo de respuesta por manuscrito.

## Comparativa con modelos similares

No se conocen en la información disponible modelos de terceros directamente comparables en la tarea de predicción de aceptación académica. La única comparación documentada es interna a la colección PaperScorer, formada por ocho modelos de un solo dominio con la misma receta de SFT.

| Modelo | Parametros | Modalidad | Dominio de entrenamiento | Datos de entrenamiento | Licencia | Resultados publicados |
|---|---|---|---|---|---|---|
| PaperScorer-7B-Text-arXiv (este) | 7,6 B | Texto | arXiv | ~71.000 ejemplos, 2 de 4 épocas | other | Acc 74,6 %, AUC 0,829 |
| PaperScorer-3B-Text-arXiv | no disponible | Texto | arXiv | no disponible | no disponible | no disponible |
| PaperScorer-7B-Vision-arXiv | no disponible | Texto + visión | arXiv | no disponible | no disponible | no disponible |
| PaperScorer-7B-Text-ICLR (OpenReview) | no disponible | Texto | OpenReview/ICLR | aproximadamente 3 veces menos ejemplos que la variante arXiv | no disponible | no disponible |

La model card advierte de que la comparación entre las variantes arXiv e ICLR está sesgada por una diferencia de aproximadamente 3 veces en el volumen de datos de entrenamiento. Como referencia de arquitectura, el modelo base Qwen/Qwen2.5-7B-Instruct es de propósito general, Apache-2.0, multilingüe y no está especializado en esta tarea, por lo que no resulta comparable en la tarea de scoring de artículos.

## Limitaciones y advertencias

- Modelo de tarea única: no es un asistente de propósito general. Su salida esperada es un veredicto `Accept`/`Reject`; usarlo para otras tareas no está validado ni documentado.
- Monolingüe en inglés. Los manuscritos en otros idiomas quedan fuera del ámbito declarado del modelo.
- Sesgo de dominio: entrenado con etiquetas de aceptación de arXiv asumiendo tasas de aceptación típicas del 25-30 % en venues de primer nivel. Las tasas reales de otros venues o disciplinas pueden diferir y sesgar la calibración.
- Riesgo de alucinación y de falso veredicto: aunque la salida está fuertemente restringida, el modelo puede emitir la etiqueta equivocada con alta confianza; el umbral de calibración se eligió sobre un conjunto de validación específico y no necesariamente se transfiere a otras distribuciones.
- Rendimiento in-distribution: los 74,6 % de exactitud y 0,829 de AUC corresponden al conjunto `arxiv-balanced-test`. No se publican resultados fuera de distribución ni en manuscritos reales no anonimizados.
- Asimetría de datos frente a las variantes ICLR: cualquier comparación entre las variantes arXiv e ICLR de la colección debe corregir la diferencia de aproximadamente 3 veces en el volumen de entrenamiento.
- Solo texto: esta variante no procesa figuras, tablas ni capturas de página. Para eso existe la variante de visión de la colección. Además, el preprocesado espera el cuerpo del artículo en markdown, por lo que la calidad de la conversión desde PDF o LaTeX afecta al resultado.
- Licencia "other" sin texto especificado: la licencia del ajuste no es la Apache-2.0 del modelo base, de modo que el uso comercial no está garantizado y debe verificarse con los autores antes de cualquier despliegue productivo.
- Adopción muy baja (9 descargas, 0 likes) y ausencia de validación independiente: no hay evidencia de terceros sobre su comportamiento en producción.
- Dependencia de la anonimización: el flujo documentado asume PDF o fuentes LaTeX anonimizadas; introducir información identificativa del autor puede introducir señales no previstas en el entrenamiento.
- Sin datos de latencia, throughput ni consumo energético publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skonan/PaperScorer-7B-Text-arXiv
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio del orquestador PaperScorer: https://github.com/zlab-princeton/PaperScorer
- Colección PaperScorer en HuggingFace: https://huggingface.co/collections/zlab-princeton/paperscorer
- Conjunto de datos PaperScorer-Text: referenciado en la model card, URL directa no disponible
- Artículo: Konan, S., Liu, J., Liu, Z. "PaperScorer: How Predictable Is Paper Acceptance?", NeurIPS 2026 (URL del paper no disponible en la información proporcionada)
- Demo o espacio interactivo: no disponible
