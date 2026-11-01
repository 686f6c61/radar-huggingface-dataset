# KaedeTai/occamy-1.0-abliterated-mtp-mlx-4bit-zhTW

## Resumen

Occamy-1.0-abliterated-mtp-mlx-4bit-zhTW es una conversión a formato MLX del modelo Occamy-1.0 en su variante abliterated, publicada por el usuario KaedeTai. El modelo original lo desarrolla Accio-Lab y se distribuye bajo licencia Apache 2.0. Esta versión concreta toma el GGUF BF16 de SC117 (que a su vez es el Occamy-1.0 de Accio-Lab con las direcciones de rechazo eliminadas), lo reconvierte al layout de Hugging Face, lo cuantiza a 4 bits para MLX y le injerta una cabeza de predicción multi-token (MTP) procedente de otro modelo del mismo autor.

La relevancia de esta ficha reside en que combina tres transformaciones poco habituales: la vuelta de GGUF a safetensors con reconstrucción exacta de tensores reescritos por llama.cpp, la cuantización afín de 4 bits con grupo 64 para Apple Silicon, y el injerto de una cabeza MTP entrenada sobre un fine-tune distinto del mismo modelo base. El resultado es un modelo de mezcla de expertos (MoE) de 35.951.822.704 parámetros totales, con torre de visión, capacidades image-text-to-text y decodificación especulativa activable.

El modelo está pensado para ejecutarse localmente en equipos con Apple Silicon mediante la librería MLX y el runtime oMLX, con un tamaño de repositorio de 21,3 GB. Los idiomas declarados son chino (zh) y inglés (en), aunque la evaluación publicada se centra en conocimiento general en chino tradicional mediante TMMLU+.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo qwen3_5_moe (transformer con atención lineal y atención completa, más torre de visión) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit afín grupo 64 (modelo de lenguaje); 8-bit grupo 64 (compuertas del router y cabeza MTP); bf16 (torre de visión) |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 2.134 tensores en el índice |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos etiquetado como `qwen3_5_moe`, con capas de atención lineal y capas de atención completa, según se deduce de los tensores reconstruidos en la conversión (normas RMS centradas en cero, parámetros `A_log`, `dt_bias`, convoluciones 1D y cabezas V de atención lineal reordenadas). El modelo incorpora además una torre de visión de 333 tensores en bf16, tomada directamente del release de Accio-Lab/occamy-1.0, ya que la abliteración no la modifica.

El proceso de creación de esta versión concreta no incluye entrenamiento desde cero, sino tres operaciones: (1) inversión de las transformaciones que llama.cpp aplica al convertir a GGUF (desplazamiento de las RMSNorm, reconstrucción de `A_log` desde `ssm_a`, renombrado de `dt_bias`, restauración de la forma de las convoluciones 1D, permutación inversa de las cabezas V y mantenimiento de las matrices por experto apiladas para `switch_mlp`); (2) cuantización afín de 4 bits con grupo 64 para el modelo de lenguaje y 8 bits para las compuertas del router; y (3) injerto de una cabeza MTP de 44 tensores procedente de KaedeTai/Ornith-1.5-35B-A3B-BigBang-MTP-zh-mlx-4bit, junto con `text_config.mtp_num_hidden_layers` y las anulaciones de cuantización de la cabeza. La validación de la reconstrucción comparó 42 tensores de dos capas con el modelo base sin abliterar: 40 son idénticos bit a bit y los otros dos corresponden exactamente a las matrices que edita la abliteración (`self_attn.o_proj` con diferencia relativa 1,7e-2 y un `down_proj` de un experto con 5,9e-2).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Procesamiento image-text-to-text: acepta imágenes y texto como entrada gracias a la torre de visión restaurada.
- Razonamiento y conocimiento general, evaluado en 67 materias de TMMLU+.
- Decodificación especulativa mediante cabeza MTP con 4 tokens de borrador por ciclo y una tasa de aceptación del 65,6% en el conjunto de pruebas del autor.
- Modo thinking activable o desactivable mediante `enable_thinking` (por defecto activo si no se configura la entrada del modelo en oMLX).
- Comportamiento sin rechazo: las direcciones de rechazo fueron eliminadas por SC117 en el proceso de abliteración.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX de 4 bits y el tamaño de 21,3 GB permiten cargar el modelo en equipos con memoria unificada suficiente, usando oMLX como runtime y activando la cabeza MTP para reducir la latencia por token.
- Evaluación de conocimiento en chino tradicional: el modelo obtiene 72,6 en TMMLU+ zero-shot, por lo que resulta adecuado para tareas de pregunta-respuesta académica o de dominio general en zh, especialmente en el grupo de ciencias sociales (79,7).
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede emplearse para extraer y resumir información de capturas, diagramas o páginas escaneadas combinando la torre de visión con el modelo de lenguaje.
- Investigación sobre abliteración: sirve como objeto de estudio para comparar el comportamiento de un modelo con las direcciones de rechazo eliminadas frente a su base original, con la ventaja de que la reconstrucción de tensores está verificada contra el modelo sin abliterar.
- Experimentación con decodificación especulativa: la cabeza MTP injertada permite medir tasas de aceptación y tokens por ciclo en distintos prompts, y el autor documenta el procedimiento de registro (`MTP[n] finish=... accept=a/d`) para reproducir las mediciones.
- Generación de texto conversacional bilingüe zh/en en entornos de escritorio: integrable en aplicaciones locales que necesiten un asistente con contexto conversacional y sin dependencia de API externa.
- Prototipado de pipelines multimodales en MLX: útil para desarrolladores que quieran validar flujos image-text-to-text en Apple Silicon antes de desplegar en infraestructura mayor.

## Benchmarks y rendimiento

Evaluación en TMMLU+ (3.334 preguntas de 67 materias, zero-shot, thinking desactivado, sin MTP, media de las cuatro medias de grupo, intervalos de confianza bootstrap por materia):

| Modelo (MLX, misma máquina) | TMMLU+ | IC 95% | STEM | Humanidades | Social | Otros |
|---|---:|---|---:|---:|---:|---:|
| occamy-1.0-abliterated (este repo) | 72,6 | 70,9–74,2 | 70,3 | 70,0 | 79,7 | 70,3 |
| Qwen3.6-35B-A3B-Escha-W2 | 72,6 | 71,0–74,3 | 73,4 | 67,1 | 78,9 | 71,0 |
| Ornith-1.5-35B-A3B-BigBang-MTP-zh 4-bit | 70,5 | 68,9–72,2 | 70,2 | 66,0 | 76,4 | 69,4 |

La comparación pareada con Ornith sobre las mismas preguntas arroja +2,1 puntos (IC 95% +0,8 a +3,4), con la mayor parte de la ganancia en humanidades. Dos respuestas de 3.334 no pudieron parsearse y se contabilizaron como incorrectas.

Rendimiento de la decodificación especulativa (oMLX Lightning MTP, 4 tokens de borrador, mismas prompts):

| Tronco | Cabeza de borrador | Borradores aceptados | Tokens por ciclo |
|---|---|---:|---:|
| Ornith-1.5 BigBang | cabeza BigBang original | 64,5% | no disponible |
| Ornith-1.5 BigBang | cabeza zh | 64,9% | no disponible |
| occamy-1.0-abliterated (este repo) | cabeza zh | 65,6% | 2,13 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: el repositorio ocupa 21,3 GB, por lo que se necesita al menos esa cantidad de memoria disponible para cargar los pesos completos; con overhead de runtime conviene disponer de 24 GB o más.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son chips de Apple Silicon (series M). No se documenta soporte para A100, H100 ni RTX 4090 en esta versión concreta.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente (por ejemplo, configuraciones de 32 GB o superiores); no está pensado para GPUs NVIDIA de consumo en este formato.
- Opciones de despliegue: runtime oMLX (requerido para la cabeza MTP y el registro del modelo); MLX como librería subyacente. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- Latencia y throughput: no se publican valores absolutos de latencia ni tokens por segundo; el único dato de rendimiento es la tasa de aceptación de la decodificación especulativa (65,6%) y 2,13 tokens por ciclo.
- Configuración de serving: es necesario abrir el directorio una vez en la aplicación oMLX para que lo registre, y después establecer `mtp_enabled: true`, `mtp_num_draft_tokens: 4` y `enable_thinking: false` mediante la app o la API de administración. Una entrada escrita a mano en `~/.omlx/model_settings.json` no se detecta. No debe activarse `vlm_mtp_enabled`, que es una función distinta y mutuamente excluyente que desactiva silenciosamente esta cabeza.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TMMLU+ | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| occamy-1.0-abliterated-mtp-mlx-4bit-zhTW (este repo) | 35.951.822.704 | no disponible | 72,6 | apache-2.0 | Hugging Face, formato MLX 4-bit |
| Qwen3.6-35B-A3B-Escha-W2 | no disponible | no disponible | 72,6 | no disponible | no disponible |
| Ornith-1.5-35B-A3B-BigBang-MTP-zh 4-bit | no disponible | no disponible | 70,5 | no disponible | Hugging Face, MLX 4-bit |
| Accio-Lab/occamy-1.0 | no disponible | no disponible | no disponible | apache-2.0 (según modelo base) | Hugging Face, safetensors |

La comparación se limita a los datos publicados en la model card; no se dispone de cifras de parámetros, contexto ni licencia de las alternativas más allá de lo indicado.

## Limitaciones y advertencias

- Modelo abliterated: las direcciones de rechazo fueron eliminadas por SC117, por lo que el modelo puede producir contenido que el modelo base rechazaría. No es adecuado para despliegues públicos sin filtros externos.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasa de alucinación; el único benchmark disponible es TMMLU+, que mide conocimiento, no veracidad.
- Idiomas: solo se declaran zh y en; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Contexto: la longitud de contexto no está documentada en la información disponible, lo que impide planificar cargas de contexto largo con garantías.
- Reproducibilidad: con MTP activado, las salidas no son idénticas bit a bit a las de MTP desactivado, y oMLX no es reproducible bit a bit entre ejecuciones ni siquiera con el modelo donante, debido al batching y al orden de los kernels.
- Configuración frágil: activar `vlm_mtp_enabled` desactiva la cabeza MTP sin aviso; una entrada manual en el fichero de configuración no se detecta; si no se configura, `enable_thinking` queda activo por defecto.
- Licencia: Apache 2.0 permite uso comercial, pero el carácter abliterated y la procedencia derivada de múltiples repositorios intermedios (SC117, Accio-Lab, KaedeTai) hacen recomendable revisar los términos de cada eslabón de la cadena antes de un despliegue en producción.
- La cabeza MTP fue entrenada sobre un fine-tune distinto del mismo modelo base; el autor demuestra que funciona, pero no hay garantía de que se mantenga el rendimiento con otros prompts o dominios.
- El modelo base Qwen/Qwen3.6-35B-A3B figura en la lista de modelos base, pero no se detalla su relación exacta con Occamy-1.0 en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KaedeTai/occamy-1.0-abliterated-mtp-mlx-4bit-zhTW
- Modelo base abliterated en GGUF: https://huggingface.co/SC117/occamy-1.0-abliterated-FIT-GGUF
- Modelo original: https://huggingface.co/Accio-Lab/occamy-1.0
- Cabeza MTP donante: https://huggingface.co/KaedeTai/Ornith-1.5-35B-A3B-BigBang-MTP-zh-mlx-4bit
- Versión MLX de referencia del mismo autor: https://huggingface.co/KaedeTai/Ornith-1.5-35B-A3B-BigBang-MTP-mlx-4bit
- Cabeza MTP experimental de Accio-Lab: https://huggingface.co/Accio-Lab/occamy-1.0-MTP
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset de evaluación TMMLU+: https://huggingface.co/datasets/ikala/tmmluplus
