# bambocher/Qwen3.5-9B-oQ2.7-mtp

## Resumen

Qwen3.5-9B-oQ2.7-mtp es una cuantizacion mixta de precisión del modelo Qwen3.5-9B, publicada por el usuario bambocher en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una redistribucion de pesos comprimidos mediante la herramienta oQ (oMLX v0.7.3), orientada especificamente al ecosistema MLX de Apple para ejecucion en hardware Apple Silicon. El checkpoint conserva la arquitectura original qwen3_5 con 9.653 millones de parametros totales, incluyendo una torre de vision (0.456B) y una cabeza MTP (0.243B) para decodificacion especulativa.

El interes tecnico del modelo reside en su estrategia de cuantizacion mixta: no aplica una precision uniforme, sino que distribuye bits segun la sensibilidad de cada tensor. El resultado es un checkpoint con un promedio efectivo de 4.124 bits por peso y un almacenamiento de 4.634 GiB, lo que permite ejecutar un modelo multimodal de casi 10B parametros en equipos con memoria unificada moderada. La combinacion de cuantizacion agresiva (2-bit y 3-bit en la mayoria de pesos) con capas preservadas en BF16 y 8-bit busca mantener la calidad en los componentes mas criticos.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de compresion no uniforme que puede interesar a quienes despliegan modelos en local; por otro, advierte de que se trata de una publicacion de terceros, sin model card detallada, sin licencia declarada y con muy poca traccion (40 descargas, 0 likes), por lo que su uso en produccion exige verificacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal con cabeza MTP), segun tag del repo |
| Parametros totales | 9.653.104.368 (9.653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 2-bit (group 64), 3-bit (group 64 y 128), 4-bit, 5-bit, 8-bit y BF16; promedio efectivo 4.124 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |
| Tamano del repo | 9.8 GB (checkpoint cuantizado: 4.634 GiB) |
| Componentes | Language model 8.954B; Vision 0.456B; MTP head 0.243B |
| Fecha de creacion | 2026-10-20 |
| Ultima actualizacion | 2026-11-12 (re-cuantizado con oMLX v0.7.3) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, de la familia qwen3_5, con una arquitectura transformer multimodal que integra una torre de vision de 0.456B parametros junto al modelo de lenguaje de 8.954B. Incluye ademas una cabeza MTP (multi-token prediction) de 0.243B, un componente que en modelos Qwen se emplea para decodificacion especulativa y aceleracion de la generacion. Esta ficha no redistribuye el entrenamiento original: no se dispone de informacion sobre el numero de tokens, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo base.

La innovacion tecnica de este checkpoint es la cuantizacion mixta de oQ. Segun la model card, la distribucion de pesos es la siguiente: 2.047B parametros en 2-bit (group 64, 2.50 bits efectivos), 4.468B en 3-bit (group 128, 3.25 bits efectivos), 1.017B en 3-bit (group 64, 3.50 bits efectivos), 0.210B en 4-bit, 1.420B en 5-bit, 0.001B en 8-bit y 0.491B preservados en BF16. Esta asignacion no uniforme concentra la mayor precision en una fraccion pequena de tensores (aproximadamente el 5% en BF16 y el 15% en 5-bit), mientras que el grueso del modelo se comprime a 2-3 bits, logrando un equilibrio entre tamano y fidelidad numerica. El checkpoint fue re-cuantizado el 2026-11-13 con oMLX v0.7.3, por lo que versiones anteriores deben descargarse de nuevo.

## Capacidades

- Generacion de texto y razonamiento: el modelo conserva la funcionalidad del Qwen3.5-9B base, aunque la cuantizacion agresiva puede degradar tareas de razonamiento complejo.
- Procesamiento de vision: incluye una torre de vision de 0.456B parametros, lo que habilita tareas de comprension de imagenes (VQA, descripcion, extraccion de informacion visual).
- Decodificacion especulativa: la cabeza MTP de 0.243B permite acelerar la generacion mediante prediccion multi-token, especialmente en el runtime MLX.
- Generacion de codigo y matematicas: capacidad heredada del modelo base, no verificada en esta cuantizacion.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint esta disenado para MLX y ocupa 4.634 GiB, por lo que puede ejecutarse en Macs con 16 GB o 24 GB de memoria unificada, permitiendo prototipado offline sin GPU dedicada.
- Asistentes multimodales en escritorio: la torre de vision integrada permite construir aplicaciones de analisis de imagenes (capturas, documentos escaneados, fotografias) que corren completamente en local, sin enviar datos a la nube.
- Experimentacion con cuantizacion mixta: util para investigadores que quieran evaluar el impacto de asignaciones no uniformes de bits (2-bit frente a 5-bit) en la calidad de un modelo de ~10B parametros.
- Generacion de texto asistida en portatiles: con 4.6 GiB de almacenamiento, el modelo cabe en un portatil y sirve para tareas de redaccion, resumen y extraccion de informacion en entornos con recursos limitados.
- Aceleracion con MTP: la cabeza de prediccion multi-token permite probar tecnicas de decodificacion especulativa en MLX, midiendo la ganancia de throughput frente a la decodificacion autoregresiva clasica.
- Educacion y divulgacion: como ejemplo practico de pipeline de cuantizacion con oQ, sirve para demostrar como se distribuyen precisiones por tensor y como se calcula el promedio efectivo de bits.
- Prototipado rapido de aplicaciones de vision-lenguaje: para demos y pruebas de concepto donde la latencia y la calidad absoluta no son criticas, pero si la portabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 4.634 GiB para los pesos cuantizados; sumar overhead del runtime MLX, cache KV y activaciones, lo que en la practica suele situar el consumo total en torno a 6-8 GB para contextos moderados (estimacion, no dato del autor).
- GPU recomendadas: no aplica GPU CUDA; el modelo esta empaquetado para MLX y se ejecuta en Apple Silicon (series M1, M2, M3, M4 y superiores).
- Cabe en consumer hardware: si, en Macs con memoria unificada de 16 GB o superior; en equipos de 8 GB el margen es muy ajustado.
- Opciones de despliegue: runtime MLX (libreria `mlx`), con soporte de oMLX para carga del checkpoint. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado el formato MLX y la cuantizacion affine especifica.
- Latencia y throughput: no disponibles; la presencia de la cabeza MTP sugiere que el autor busca mejorar la velocidad de decodificacion, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-oQ2.7-mtp (este) | 9.653B | no disponible | Mixta, 4.124 bits/peso efectivos | no disponible | safetensors (MLX) |
| Qwen3.5-9B (base) | 9.653B | no disponible | BF16 original | no disponible | safetensors |
| Otras cuantizaciones MLX del mismo base | 9.653B | no disponible | 4-bit uniforme (tipico) | segun autor | safetensors (MLX) |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible: no se aportan resultados de benchmarks ni del modelo base ni de otras cuantizaciones. La diferencia principal frente a una cuantizacion uniforme de 4 bits es la distribucion no uniforme (2-3 bits en la mayoria de pesos, 5-bit y BF16 en una minoria), que busca preservar calidad con un tamano ligeramente inferior.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del checkpoint ni la del modelo base, lo que impide determinar si el uso comercial esta permitido. Verificar antes de cualquier despliegue en produccion.
- Publicacion de terceros: el autor es un usuario individual (bambocher), no el equipo de Qwen; no hay garantias de mantenimiento, soporte ni correccion de errores.
- Cuantizacion agresiva: el 21% de los pesos esta en 2-bit y el 57% en 3-bit, lo que puede degradar tareas de razonamiento, matematicas y codigo respecto al modelo en BF16. No se aportan evaluaciones que cuantifiquen esta perdida.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la compresion puede incrementarlo en dominios especializados.
- Idiomas y contexto no documentados: se desconoce la ventana de contexto efectiva y la cobertura linguistica en esta cuantizacion.
- Dependencia del ecosistema MLX: no es portable a CUDA ni a runtimes habituales como vLLM, lo que limita su uso a hardware Apple.
- Versionado: el autor re-cuantizo el checkpoint el 2026-11-13; copias anteriores pueden ser inconsistentes.
- Traccion minima: 40 descargas y 0 likes indican poca validacion por parte de la comunidad.
- Sin model card detallada: no se documentan sesgos conocidos, datos de entrenamiento ni limitaciones especificas del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-oQ2.7-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.5-9B: no disponible en la informacion proporcionada
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
