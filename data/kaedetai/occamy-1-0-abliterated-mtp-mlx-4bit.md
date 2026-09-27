# KaedeTai/occamy-1.0-abliterated-mtp-mlx-4bit

## Resumen

Occamy-1.0-abliterated-mtp-mlx-4bit es una conversión comunitaria, publicada por el usuario KaedeTai, del modelo Occamy-1.0 de Accio-Lab en su variante "abliterated" (es decir, con las direcciones de rechazo eliminadas por SC117). El punto de partida es un GGUF bf16 de SC117 que se reconstruye al formato de Hugging Face, se cuantiza a 4 bits para MLX y se le vuelve a injertar la torre de visión original de Accio-Lab, que la abliteración no toca. Sobre esa base se añade una cabeza de predicción multi-token (MTP) copiada sin modificar del repositorio Ornith-1.5-35B-A3B-BigBang-MTP-zh-mlx-4bit.

El modelo es un MoE híbrido de aproximadamente 36.000 millones de parámetros totales (35.951.822.704 según el índice de safetensors), con cerca de 3.000 millones activos por token según la nomenclatura A3B heredada de Qwen3.6-35B-A3B. La innovación central del repositorio no es el entrenamiento, sino la ingeniería de conversión: el script `scripts/convert_occamy.py` deshace las transformaciones que aplica la conversión QWEN35MOE de llama.cpp (RMSNorm centradas en cero, `A_log` almacenado como `ssm_a`, reordenación de cabezas V en atención lineal, apilado de matrices por experto) antes de pasar a MLX. El autor valida el resultado comparando 42 tensores reconstruidos con el modelo base sin abliterar: 40 son idénticos bit a bit y los dos restantes son exactamente las matrices que la abliteración modifica.

Su relevancia es doble: demuestra que un GGUF abliterated puede volver al layout HF con verificación numérica, y demuestra que una cabeza MTP entrenada sobre un fine-tune distinto del mismo modelo base especula igual de bien sobre otro tronco (65,6 % de borradores aceptados, 2,13 tokens por ciclo), lo que abarata la decodificación especulativa sin necesidad de entrenar una cabeza nueva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con capas de atención lineal y de atención completa (familia Qwen3.5/Qwen3.6, tag `qwen3_5_moe`) |
| Parametros totales | 35.951.822.704 (aproximadamente 36.000 millones) |
| Parametros activos | Aproximadamente 3.000 millones por token (derivado de la nomenclatura A3B del modelo base Qwen3.6-35B-A3B; no confirmado de forma explícita en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín, grupo 64 (modelo de lenguaje); 8 bits, grupo 64 (gates del router `mlp.gate` y `shared_expert_gate`, y cabeza MTP); bf16 (torre de visión); 92 overrides por módulo en `config.json` |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con layout MLX (librería `mlx`); el origen es GGUF bf16 (SC117/occamy-1.0-abliterated-FIT-GGUF) |

## Arquitectura y entrenamiento

El tronco procede del checkpoint post-entrenado Qwen3.6-35B-A3B, un MoE con arquitectura híbrida: conviven capas de atención lineal (con `linear_attn.norm`, `in_proj_qkv`, `in_proj_z`, `in_proj_a/b`, `A_log`, `dt_bias`, conv1d y `out_proj`) y capas de atención completa (`self_attn.o_proj`). Las matrices por experto se mantienen apiladas en `ffn_*_exps`, que es el formato que espera el operador `switch_mlp` de MLX. Accio-Lab describe Occamy-1.0 como un modelo agéntico compacto orientado a "co-work" de horizonte largo: tareas con estado persistente que requieren uso coordinado de búsqueda, código, herramientas, ficheros, APIs estructuradas y software de productividad, con entrenamiento adicional concentrado en ejecución fiable, seguimiento de estado y recuperación. El número de tokens de entrenamiento y la composición del dataset no están disponibles en la información proporcionada.

Sobre ese tronco, este repositorio aplica tres operaciones. Primero, la reconstrucción desde GGUF: se invierten las transformaciones de llama.cpp (RMSNorm centradas en cero almacenadas como +1, `A_log` guardado como `ssm_a = -exp(A_log)`, renombrado de `dt_bias` a `ssm_dt.bias`, conv1d restaurada a `[C, 1, K]`, permutación inversa de las cabezas V de atención lineal). Segundo, la cuantización MLX a 4 bits con grupo 64 para el tronco, 8 bits para los gates del router y la cabeza MTP, y bf16 para los 333 tensores de la torre de visión, que se recuperan intactos de `model-visual.safetensors` de Accio-Lab. Tercero, el injerto de la cabeza MTP: 44 tensores `language_model.mtp.*` copiados tal cual desde el repositorio de Ornith, más `text_config.mtp_num_hidden_layers` y los overrides de cuantización de la cabeza. El índice final tiene 2.134 tensores, cada uno almacenado una sola vez, sin duplicación de shards. No hay entrenamiento nuevo ni ajuste por RLHF/DPO en este repositorio: la única modificación de comportamiento respecto al base es la abliteración ya presente en el GGUF de origen.

## Capacidades

- Generación de texto conversacional en chino y en inglés, con pipeline declarado `image-text-to-text`.
- Comprensión de imágenes: la torre de visión procede sin modificar del release de Accio-Lab (333 tensores en bf16), por lo que conserva la entrada multimodal original.
- Ejecución agéntica de horizonte largo: el tronco base fue post-entrenado específicamente para tareas con estado persistente, recuperación de errores y uso coordinado de herramientas.
- Tool calling y function calling: soportado por el diseño del modelo base, orientado a APIs estructuradas y software de productividad.
- Razonamiento multi-paso con modo de pensamiento (thinking), activado por defecto en oMLX si no se configura lo contrario.
- Decodificación especulativa mediante cabeza MTP propia: 4 tokens borrador por ciclo, 65,6 % de aceptación y 2,13 tokens por ciclo en la configuración medida.
- Capacidades multilingües limitadas a los idiomas declarados (zh, en); no se anuncia soporte de otros idiomas.
- Comportamiento sin rechazos: la abliteración elimina las direcciones de rechazo, lo que amplía el rango de peticiones que el modelo atiende.

## Casos de uso

- Automatización de agentes de co-work en escritorio: el modelo está entrenado para mantener estado entre pasos y recuperarse de fallos, de modo que puede encadenar búsqueda, edición de ficheros y llamadas a APIs en sesiones largas sin perder el hilo de la tarea.
- Extracción y proceso de documentos con imagen: al conservar la torre de visión, admite entradas image-text-to-text, útil para digitalizar formularios, capturas o diagramas y volcar el contenido a estructuras de datos.
- Asistente de programación local en Apple Silicon: cuantizado a 4 bits y ejecutable con MLX, encaja en un flujo de trabajo de desarrollo que exige no enviar código a servicios externos, con tool calling para operar sobre el repositorio.
- Investigación sobre decodificación especulativa: el repositorio es un caso de estudio reproducible de transferencia de una cabeza MTP entre troncos distintos del mismo base, con las métricas de aceptación registradas en oMLX.
- Generación de datos sintéticos sin restricciones de rechazo: la variante abliterated permite producir continuaciones sobre material sensible que un modelo alineado rechazaría, útil en estudios de seguridad y en análisis de sesgos.
- Análisis de mercado en chino mandarín: el rendimiento medido en TMMLU+ (72,6 puntos, con 79,7 en ciencias sociales) lo sitúa como opción para tareas de conocimiento en chino tradicional.
- Evaluación comparativa de cuantizaciones: sirve para medir la pérdida de calidad de un GGUF bf16 a 4 bits MLX sobre una misma batería de preguntas.

## Benchmarks y rendimiento

Evaluación sobre el tronco, sin MTP activo, con 3.334 preguntas de `ikala/tmmluplus` (67 asignaturas, hasta 50 por asignatura, semilla 0), zero-shot y con el modo thinking desactivado. La puntuación es la media de las cuatro medias de grupo y los intervalos de confianza se obtienen por bootstrap dentro de cada asignatura.

| Modelo (MLX, misma máquina) | TMMLU+ | IC 95 % | STEM | Humanidades | Sociales | Otros |
|---|---:|---|---:|---:|---:|---:|
| occamy-1.0-abliterated (este repositorio) | 72,6 | 70,9–74,2 | 70,3 | 70,0 | 79,7 | 70,3 |
| Qwen3.6-35B-A3B-Escha-W2 | 72,6 | 71,0–74,3 | 73,4 | 67,1 | 78,9 | 71,0 |
| Ornith-1.5-35B-A3B-BigBang-MTP-zh 4-bit | 70,5 | 68,9–72,2 | 70,2 | 66,0 | 76,4 | 69,4 |

Frente a Ornith, la mejora es de +2,1 puntos con las mismas preguntas (bootstrap apareado, IC 95 % de +0,8 a +3,4), concentrada en humanidades. Dos respuestas de 3.334 no pudieron parsearse y cuentan como incorrectas.

Rendimiento de la decodificación especulativa con la cabeza MTP injertada (mismo conjunto de prompts, oMLX Lightning MTP, 4 tokens borrador, leído de las líneas `MTP[n] ... accept=a/d`):

| Tronco | Cabeza borrador | Borradores aceptados | Tokens por ciclo |
|---|---|---:|---:|
| Ornith-1.5 BigBang | cabeza BigBang original | 64,5 % | — |
| Ornith-1.5 BigBang | cabeza zh | 64,9 % | — |
| occamy-1.0-abliterated (este repositorio) | cabeza zh | 65,6 % | 2,13 |

Validación numérica de la conversión: 42 tensores reconstruidos de dos capas (una de atención lineal y una de atención completa) comparados con Accio-Lab/occamy-1.0; 40 son idénticos bit a bit y los dos restantes son las matrices que la abliteración edita (`self_attn.o_proj`, diferencia relativa 1,7e-2; `down_proj` de un experto, 5,9e-2). El SHA-256 del GGUF coincidía con el `SHA256SUMS` de SC117 antes de convertir.

## Requisitos de hardware

- Peso del repositorio: 21,3 GB, con aproximadamente 20 GB de pesos cuantizados a 4 bits.
- Plataforma obligatoria para este repositorio: Apple Silicon. La librería declarada es `mlx`, por lo que no hay soporte CUDA directo ni ejecución en GPU NVIDIA con estos pesos.
- Memoria unificada recomendada: 32 GB o más para dejar margen a la caché KV y a la torre de visión en bf16; 24 GB es el mínimo teórico y resulta ajustado en contextos largos.
- Equipos razonables: MacBook Pro o Mac Studio con M1/M2/M3/M4 Max o Ultra. No cabe en Macs con 8 o 16 GB de memoria unificada.
- Despliegue en oMLX: registrar el directorio abriéndolo una vez en la aplicación, y después fijar `mtp_enabled: true`, `mtp_num_draft_tokens: 4` y `enable_thinking: false` desde la app o la API de administración. Una entrada escrita a mano en `~/.omlx/model_settings.json` no se detecta. No activar `vlm_mtp_enabled`: es una función distinta, mutuamente excluyente con `mtp_enabled`, y desactiva la cabeza en silencio.
- Despliegue alternativo: `mlx-lm` para texto y la ruta de MLX para visión; también existe el GGUF original de SC117 para llama.cpp u Ollama si se prefiere ese ecosistema.
- Latencia y throughput absolutos: no disponibles. El único dato publicado es de 2,13 tokens por ciclo con 65,6 % de aceptación de borradores; no se indica una tasa de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TMMLU+ | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| occamy-1.0-abliterated-mtp-mlx-4bit (este repositorio) | ~36B totales, ~3B activos | no disponible | 72,6 | apache-2.0 | MLX 4 bits, Apple Silicon |
| Accio-Lab/occamy-1.0 (base sin abliterar) | ~36B totales, ~3B activos | no disponible | no disponible | apache-2.0 | pesos originales en HF y cuantización MLX 4 bits oficial |
| Ornith-1.5-35B-A3B-BigBang-MTP-zh-mlx-4bit | ~35B totales, ~3B activos | no disponible | 70,5 | no disponible en la informacion proporcionada | MLX 4 bits, Apple Silicon |
| Qwen3.6-35B-A3B-Escha-W2 | ~35B totales, ~3B activos | no disponible | 72,6 | no disponible en la informacion proporcionada | MLX, Apple Silicon |

La diferencia relevante frente a los tres alternativas es la combinación de abliteración, torre de visión restaurada y cabeza MTP injertada en un único paquete MLX de 4 bits. Accio-Lab publica además una cabeza MTP experimental propia (`Accio-Lab/occamy-1.0-MTP`) que el autor de este repositorio no probó.

## Limitaciones y advertencias

- Modelo abliterated: SC117 eliminó las direcciones de rechazo del tronco. El modelo atenderá peticiones que un modelo alineado rechazaría, lo que exige controles de contenido externos en cualquier despliegue expuesto a usuarios.
- La sección de limitaciones de la model card está truncada en la información disponible, justo en el punto en que empieza a describir las consecuencias de la abliteración; no se pueden citar aquí los caveats completos que el autor detalla.
- Derivado comunitario sin validación oficial: el repositorio tiene 0 descargas y 0 likes, y no está publicado por Accio-Lab. Es un artefacto de una sola persona, con una única verificación numérica sobre 42 tensores de 2 capas.
- La cuantización a 4 bits no es neutra: las puntuaciones de TMMLU+ corresponden al modelo cuantizado, no al bf16 original, y no se ofrecen métricas del bf16 para comparar la pérdida.
- Idiomas: solo chino e inglés declarados. El rendimiento en castellano o en otras lenguas no está medido y no debería asumirse.
- Longitud de contexto no especificada en la información proporcionada; no se debe planificar un despliegue que dependa de ventanas largas sin verificarla en `config.json`.
- La cabeza MTP cambia la velocidad, no el conocimiento: la decodificación especulativa es verificar-y-aceptar, de modo que no altera las respuestas en contenido, pero sí lo hace en su forma exacta. Con MTP activo las salidas no son idénticas bit a bit a las de MTP desactivado, y oMLX no es reproducible ejecución a ejecución ni siquiera con el modelo donante (por batching y orden de kernels).
- Riesgo de alucinación no cuantificado: no hay resultados publicados de detección de alucinaciones para este derivado.
- Licencia apache-2.0 heredada, que permite uso comercial, pero conviene revisar las condiciones de los repositorios de origen (SC117, Accio-Lab, KaedeTai) antes de redistribuir.
- Dependencia de una aplicación concreta: el flujo MTP solo está documentado para oMLX, incluido el requisito de dejar que la aplicación registre el directorio por sí misma.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KaedeTai/occamy-1.0-abliterated-mtp-mlx-4bit
- Modelo base sin abliterar: https://huggingface.co/Accio-Lab/occamy-1.0
- GGUF abliterated de origen: https://huggingface.co/SC117/occamy-1.0-abliterated-FIT-GGUF
- Donante de la cabeza MTP: https://huggingface.co/KaedeTai/Ornith-1.5-35B-A3B-BigBang-MTP-zh-mlx-4bit
- Cabeza MTP experimental de Accio-Lab: https://huggingface.co/Accio-Lab/occamy-1.0-MTP
- Cuantización MLX 4 bits oficial: https://huggingface.co/Accio-Lab/occamy-1.0-MLX-4bit
- Repositorio de código de Occamy: https://github.com/Accio-Lab/occamy
- Página del proyecto: https://accio-lab.github.io/occamy/
- Dataset de evaluación TMMLU+: https://huggingface.co/datasets/ikala/tmmluplus
- Entrada de la familia en HuggingFace: https://huggingface.co/occamy-ai/occamy-1.0
- Sitio sobre el motor de datos: https://occamy-ai.github.io/
