# deepanwa/Samosa-Chat-Molmo2-4B-MLX-Q4

## Resumen

Este repositorio contiene el paquete nativo cuantizado del modelo Molmo2-4B de AllenAI, preparado específicamente para el runtime de Samosa Chat en Apple Silicon. Lo desarrolla Deepan Wadhwa (deepanwa) como parte del proyecto independiente Samosa, una aplicación local de modelos que permite ejecutar grandes modelos en macOS ARM64 sin depender de servicios en la nube.

El paquete resuelve el problema de ejecutar un modelo de visión-lenguaje de 4B parámetros en hardware de Apple con memoria unificada limitada, aplicando una cuantización Q4 affine con group size 64 a las matrices de lenguaje, mientras mantiene la torre de visión, el conector y las capas de normalización en BF16. El resultado ocupa aproximadamente 3,36 GB de pesos y unos 3,76 GB de memoria residente estimada, lo que permite su ejecución en equipos con 16 GiB de RAM unificada.

La relevancia actual radica en que ofrece capacidades multimodales (imagen y video) completamente locales en ecosistema Apple, sin necesidad de GPU dedicada ni de frameworks externos como PyTorch o vLLM, gracias a un runtime C++20 con Metal y AVFoundation. No es un checkpoint estándar de Transformers ni de MLX-VLM, sino un paquete versionado para el runtime propietario de Samosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de vision-lenguaje (VLM) basado en Molmo2-4B de AllenAI; detalles internos no disponibles en la documentacion |
| Parametros totales | 4B (segun denominacion del modelo base Molmo2-4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4 affine con group size 64 para matrices de lenguaje elegibles; torre de vision, conector y normalizacion en BF16 |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato nativo de Samosa (samosa-model-runtime-v1); no es safetensors, GGUF ni checkpoint de Transformers |

## Arquitectura y entrenamiento

El paquete es una conversion cuantizada del modelo `allenai/Molmo2-4B` (revision `042abfa7a38879a376cec03d949eff0aefaa0600`) publicado por el Allen Institute for AI bajo licencia Apache-2.0. La cuantizacion se realiza con la herramienta nativa `molmo2-pack` de Samosa, que aplica Q4 affine con group size 64 a las matrices de lenguaje consideradas elegibles, mientras conserva en BF16 la torre de vision, el conector, las capas de normalizacion y cualquier tensor no elegible.

No se proporciona informacion sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO) en la documentacion de este repositorio. La conversion no modifica el comportamiento del modelo original, solo reduce su huella de memoria mediante cuantizacion selectiva. El runtime de Samosa verifica la integridad del paquete mediante un manifest con SHA-256 de cada archivo antes de cargarlo.

## Capacidades

- Image-to-text y visual question answering (VQA): el modelo puede responder preguntas sobre el contenido de una imagen.
- Conteo de objetos: identifica y cuenta elementos dentro de una imagen.
- Pointing y grounding: genera coordenadas de localizacion de objetos, que Samosa puede renderizar como marcadores sobre la imagen original.
- Video-to-text: procesa video mediante muestreo de frames con marcas de tiempo, permitiendo resumir contenido y localizar eventos temporalmente.
- Seguimiento visual y localizacion temporal: util para analisis de secuencias de video.
- Chat visual directo o delegacion on-demand desde un modelo de texto seleccionado en Samosa.
- No genera imagenes raster nuevas; solo texto y coordenadas de grounding.

## Casos de uso

- Anotacion de datos visuales: el modelo puede generar coordenadas de grounding sobre imagenes, facilitando la creacion de datasets de deteccion de objetos sin intervencion manual.
- Asistente de accesibilidad: describir imagenes o videos a personas con discapacidad visual directamente en el escritorio de macOS, sin conexion a internet.
- Inspeccion visual offline: analizar capturas de pantalla o fotografias en entornos con restricciones de red, por ejemplo en laboratorios o instalaciones industriales.
- Analisis de video corto: resumir clips de hasta 16 frames muestreados, localizando eventos clave con marcas de tiempo, util para revision rapida de grabaciones de seguridad o material de archivo.
- Automatizacion de QA visual: verificar que elementos en una interfaz grafica estan presentes y en la posicion esperada, usando las capacidades de grounding.
- Prototipado de aplicaciones multimodales locales: integrar el modelo en aplicaciones macOS mediante el gateway HTTP de Samosa para desarrollar asistentes que combinen texto e imagen sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card documenta una unica medicion de cualificacion realizada en un Apple M3 con 16 GiB de memoria unificada:

- Respuesta de grounding sobre 12 graficos en 24,99 segundos.
- Huella de proceso de Molmo de aproximadamente 3,95 GB durante esa inferencia.
- Cero swapins y swapouts, sin advertencia termica, y teardown completo tras el turno visual.

Estas cifras describen el equipo cualificado y el runtime de Samosa; no constituyen garantias universales de rendimiento.

## Requisitos de hardware

- Plataforma exclusiva: macOS ARM64 / Apple Silicon (verificado en Apple M3 con 16 GiB de memoria unificada).
- Memoria residente estimada: 3,763,377,322 bytes (~3,76 GB), lo que permite su ejecucion en equipos con 16 GiB de RAM unificada.
- No requiere GPU dedicada; utiliza Metal para aceleracion.
- Despliegue: unicamente a traves del runtime nativo de Samosa (C++20 MLX/Metal y AVFoundation). No es compatible con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- En equipos con 16 GiB, Samosa detiene el modelo de texto residente antes de cargar Molmo para evitar que ambos ocupen memoria simultaneamente.
- Latencia y throughput estimados: no disponibles; la unica medicion publicada es la de 24,99 segundos para una respuesta de grounding con 12 graficos.

## Comparativa con modelos similares

No se dispone de datos de comparacion directa con otros modelos en la informacion proporcionada. El modelo base Molmo2-4B pertenece a la familia Molmo 2 de AllenAI, que incluye una variante de 8B con rendimiento destacado en video, pero este paquete cuantizado es especifico del runtime de Samosa y no se han publicado comparativas con alternativas como LLaVA, Phi-3-vision u otros VLM de tamano similar. Se recomienda consultar la documentacion oficial de Molmo 2 para comparativas academicas del modelo base sin cuantizar.

## Limitaciones y advertencias

- Compatibilidad restringida: solo funciona en macOS ARM64 con el runtime de Samosa; no es portable a otras plataformas ni a frameworks estandar.
- Muestreo de video limitado: Samosa v1 retiene como maximo 16 frames por inferencia y usa ventanas secuenciales acotadas para videos mas largos; el muestreo disperso puede perder eventos entre frames.
- Sin soporte de audio ni transcripcion de subtitulos en este paquete.
- Evaluacion de paridad BF16 versus Q4 en curso; no se garantiza una equivalencia exacta de calidad con el modelo original sin cuantizar.
- Riesgo de alucinacion inherente a los modelos de lenguaje; las respuestas visuales deben verificarse en aplicaciones criticas.
- El paquete esta versionado especificamente para el contrato de runtime de Samosa; cambios en versiones futuras pueden requerir actualizaciones del manifiesto.
- Proyecto independiente no afiliado ni respaldado por AllenAI ni por el proyecto Molmo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/deepanwa/Samosa-Chat-Molmo2-4B-MLX-Q4
- Proyecto Samosa Chat (GitHub): https://github.com/deepanwadhwa/samosa-chat
- Pagina oficial de Molmo (AllenAI): https://allenai.org/molmo
- Modelo base Molmo2-4B en HuggingFace: https://huggingface.co/allenai/Molmo2-4B
