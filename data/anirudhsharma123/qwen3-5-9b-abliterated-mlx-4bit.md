# anirudhsharma123/Qwen3.5-9B-abliterated-MLX-4bit

## Resumen

Este repositorio contiene una cuantización de 4 bits en formato MLX del modelo Huihui-Qwen3.5-9B-abliterated, publicada por el usuario anirudhsharma123. Se trata, por tanto, de una conversión de pesos y no de un entrenamiento nuevo: el modelo original es una variante "abliterated" (con los mecanismos de rechazo eliminados mediante intervención sobre los pesos) de la familia Qwen3.5, en su tamano de 9B. El resultado está pensado para su ejecución local en equipos Apple Silicon mediante la librería MLX.

El modelo cuenta con 8.953.803.264 parámetros reales segun los tensores en safetensors, lo que lo situa en la franja de los 9B, y el repositorio ocupa 5,1 GB gracias a la cuantización de 4 bits. La licencia declarada es Apache 2.0, heredada del modelo base de Qwen, lo que permite uso comercial sin restricciones adicionales por parte del autor de la conversión.

Su relevancia actual es doble: por un lado, ofrece una via sencilla de ejecutar un modelo de ~9B en un Mac con memoria unificada moderada; por otro, la naturaleza "abliterated" del modelo base lo hace interesante para investigación en seguridad, red teaming y evaluación de comportamientos de rechazo, aunque tambien implica riesgos evidentes de contenido inapropiado. El repositorio no incluye model card descriptiva, ni datos de idiomas, contexto o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la etiqueta del repositorio indica la familia `qwen3_5`; no se detalla la arquitectura interna) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (formato MLX). No se documentan otros niveles de cuantizacion en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout MLX) |
| Libreria de inferencia | mlx |
| Pipeline | text-generation |
| Tamano del repositorio | 5,1 GB |
| Modelo base | huihui-ai/Huihui-Qwen3.5-9B-abliterated |
| Fecha de creacion | 2026-10-02 |
| Ultima actualizacion | 2026-10-02 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo mas alla de la etiqueta `qwen3_5` que aparece en los metadatos y del hecho de que se trata de un modelo de generacion de texto y conversacional. No se especifican el numero de capas, la dimension oculta, el numero de cabezas de atencion, el tipo de atencion, ni si emplea attention lineal, decodificacion especulativa u otras optimizaciones. Tampoco se detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias.

Lo unico verificable es el proceso de derivacion en dos etapas: (1) un modelo Qwen3.5-9B se somete a "abliteration", una tecnica que identifica la direccion de activacion asociada a los rechazos y ortogonaliza los pesos respecto a ella para suprimir respuestas de negativa; el resultado es huihui-ai/Huihui-Qwen3.5-9B-abliterated; y (2) ese modelo se convierte a 4 bits en formato MLX. No se documentan que capas se intervinieron, ni el impacto de esa intervencion sobre el rendimiento general. Esta conversión a 4 bits es una cuantización post-entrenamiento: no hay entrenamiento adicional ni destilacion.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado (`text-generation`, etiqueta `conversational`).
- Respuestas sin los mecanismos habituales de rechazo, como consecuencia directa del proceso de abliteration aplicado al modelo base.
- Ejecucion local en Apple Silicon mediante MLX, con pesos ya convertidos a 4 bits y listos para cargar.
- Capacidad multilingue: no disponible (el repositorio no declara la lista de idiomas soportados).
- Razonamiento, codigo, matematicas o vision: no disponible; no se documentan capacidades especificas ni se confirman modos de pensamiento, entrada de imagenes o audio.
- Tool calling / function calling: no disponible; no se menciona soporte en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.

## Casos de uso

- Investigacion en seguridad y alineacion: un modelo con los rechazos suprimidos sirve como sujeto de prueba para medir que comportamientos emergen cuando se elimina esa barrera y para calibrar clasificadores de contenido en pipelines de moderacion.
- Red teaming y evaluacion de robustez: generar de forma controlada peticiones y respuestas adversarias en un entorno aislado para probar las defensas de otros sistemas y de la propia plataforma.
- Escritura de ficcion con tematica sensible: narrativa negra, terror o conflicto belico donde los modelos alineados suelen autocensurar descripciones violentas, siempre con revision editorial humana y cumplimiento de la normativa aplicable.
- Prototipado conversacional local en un Mac: desarrollar y probar interfaces de chat sin conexion, sin enviar datos a terceros, gracias a los 5,1 GB de pesos en 4 bits.
- Generacion de datos sinteticos para ajuste fino: producir grandes volumenes de texto de dominio especifico como corpus de partida, con filtrado posterior obligatorio antes de reutilizarlo.
- Asistente de documentacion tecnica offline: resumir y reformular documentacion interna en un portatil Apple Silicon, con la limitacion de que la longitud de contexto soportada no esta documentada.
- Analisis de texto en dominios regulados: extraccion y clasificacion de contenido sobre salud, legal o finanzas donde otros modelos rechazan la tarea por prudencia excesiva, bajo supervision profesional y con las salvaguardas legales correspondientes.
- Conversion de pesos y estudio de cuantizacion: caso de uso meta, util para quien quiera comparar el comportamiento de un mismo modelo en bf16 frente a 4 bits MLX en tareas de generacion libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y tampoco se aportan mediciones de perplejidad, latencia o throughput. No se deben asumir los resultados del Qwen3.5-9B original ni los de la variante abliterated en bf16, ya que la cuantizacion a 4 bits y la propia abliteration pueden alterar el rendimiento de forma no documentada.

## Requisitos de hardware

- Peso de los pesos: 5,1 GB en disco (4 bits MLX), frente a los aproximadamente 17,9 GB que ocuparian los mismos ~8,95B parametros en bf16.
- Memoria unificada recomendada: 16 GB como minimo para cargar el modelo y mantener una conversacion corta; 24-32 GB para margenes comodos con contexto largo y otras aplicaciones abiertas. Con 8 GB el sistema puede recurrir a swap y degradar la latencia.
- Plataforma: MLX esta disenado para Apple Silicon (familias M1, M2, M3 y M4). No es ejecutable directamente en GPU NVIDIA o AMD mediante CUDA/ROCm con el stack MLX estandar.
- GPU dedicada: no aplica en la configuracion entregada; no se documentan adaptadores para A100, H100 ni RTX 4090. Para esos entornos habria que reconvertir el modelo a un formato compatible (por ejemplo, GGUF o safetensors con Transformers).
- Consumer GPU: el modelo cabria en GPUs con 8-12 GB de VRAM si se reconvierte a un formato compatible, dado el tamano de 4 bits, pero esa ruta no esta cubierta por este repositorio.
- Opciones de despliegue: `mlx-lm` (carga directa del repositorio, con utilidades de generacion, ajuste LoRA y servidor OpenAI-compatible) y entornos de escritorio con soporte MLX. vLLM, TGI, llama.cpp y Ollama no consumen pesos MLX de forma nativa; requeririan conversion previa.
- Memoria KV cache: no estimable con la informacion disponible, ya que se desconocen el numero de capas, el numero de cabezas KV y la longitud de contexto.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anirudhsharma123/Qwen3.5-9B-abliterated-MLX-4bit | ~8,95B | 4 bits (MLX) | No disponible | Apache 2.0 | HuggingFace, formato MLX, 5,1 GB |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated | ~8,95B (presumiblemente los mismos) | bf16/fp16 (no confirmado en la informacion) | No disponible | Apache 2.0 | HuggingFace, pesos completos |
| Qwen/Qwen3.5-9B | No disponible en la informacion | Original sin cuantizar | No disponible | Apache 2.0 (segun el enlace de licencia del modelo) | HuggingFace |

La comparativa cuantitativa de rendimiento no es posible: no hay benchmarks publicados para ninguna de las tres variantes en la informacion proporcionada. La diferencia practica entre la primera y la segunda fila es el formato y el tamano en disco, no el comportamiento esperado del modelo en si; la tercera fila difiere por la presencia de mecanismos de rechazo intactos. Cualquier otra alternativa de ~9B de la misma categoria no se puede comparar sin datos verificables.

## Limitaciones y advertencias

- Modelo "uncensored": la abliteration suprime las respuestas de rechazo, por lo que puede producir contenido ofensivo, violento, sexual, ilegal o peligroso sin filtro previo. No es adecuado para aplicaciones orientadas al publico general sin una capa de moderacion externa.
- Riesgo elevado de alucinacion: no hay datos de evaluacion de fidelidad, y la intervencion sobre los pesos puede degradar la coherencia y la precision respecto al modelo original. Verificar siempre las salidas en dominios factuales.
- Sesgos: no se documenta ninguna evaluacion de sesgo. El modelo hereda los sesgos del corpus de entrenamiento de Qwen3.5 y puede amplificarlos al haber eliminado el filtrado conductual.
- Idiomas: no disponibles. No se puede confirmar el rendimiento fuera del ingles o del chino sin pruebas propias.
- Contexto: longitud maxima no documentada. Planificar despliegues asumiendo incertidumbre y validar el comportamiento en ventanas largas.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el usuario sigue siendo responsable del contenido generado y del cumplimiento de la normativa aplicable (RGPD, DSA, legislacion sobre contenido ilicito, etc.).
- Repositorio sin mantenimiento verificable: 0 descargas y 0 likes en el momento de la consulta, sin model card, sin ejemplos de uso y sin historial de actualizaciones mas alla del dia de creacion. Tratarlo como un artefacto no auditado.
- Dependencia de plataforma: los pesos solo son directamente utilizables en Apple Silicon a traves de MLX; no hay garantia de equivalencia numerica con otras implementaciones.
- Sin garantias: al ser una conversion de terceros, no hay soporte del equipo de Qwen ni validacion de que la cuantizacion sea correcta o reproducible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/anirudhsharma123/Qwen3.5-9B-abliterated-MLX-4bit
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Enlace de licencia referenciado en la model card: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Modelo original de la familia: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
