# bambocher/Qwen3.5-4B-heretic-oQ5-mtp

## Resumen

Qwen3.5-4B-heretic-oQ5-mtp es una cuantizacion mixta del modelo Qwen3.5-4B en su variante "heretic", publicada por el usuario bambocher en Hugging Face. El checkpoint esta empaquetado en formato MLX, lo que lo orienta a inferencia en hardware Apple Silicon (chips M-series), y emplea la herramienta oQ (oMLX v0.7.3) para aplicar cuantizacion de precision mixta con un promedio efectivo de 6,464 bits por peso. El resultado pesa 3,765 GB en disco, lo que reduce de forma notable el espacio frente a los ~9,3 GB que ocuparia el modelo en BF16.

El modelo subyacente es un transformer multimodal de Qwen con aproximadamente 4,66 mil millones de parametros totales, de los cuales unos 4,206B corresponden al modelo de lenguaje, 0,334B a la torre de vision y 0,121B a una cabeza MTP (multi-token prediction). Esta ultima permite tecnicas de decodificacion especulativa o prediccion de varios tokens, util para acelerar la generacion. La etiqueta "heretic" indica que se trata de un ajuste que elimina o atenua los mecanismos de rechazo (abliteration) del modelo original, un detalle relevante tanto por sus capacidades como por sus riesgos.

La relevancia de esta publicacion es doble: por un lado demuestra el flujo de cuantizacion mixta de oQ sobre arquitecturas Qwen con componentes multimodales y cabezas MTP; por otro, ofrece un checkpoint compacto ejecutable en equipos de consumo con memoria unificada. No obstante, la model card no documenta licencia, idiomas, datos de entrenamiento ni evaluaciones, y el repositorio no registra descargas ni interacciones, por lo que debe tratarse como un artefacto experimental sin garantias de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (modelo de lenguaje + torre de vision + cabeza MTP) |
| Parametros totales | 4.659.865.088 (4,66B) |
| Parametros activos | no disponible (no se indica que sea MoE; el desglose por componentes sugiere arquitectura densa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 5-bit grupo 64 (74,563% de pesos), affine 6-bit grupo 64 (17,917%), affine 8-bit grupo 64 (0,060%), BF16 (7,459%); promedio efectivo 6,464 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors cuantizados para MLX (libreria mlx) |
| Tamano del repositorio | 3,8 GB (3,507 GiB de tensores) |
| Desglose por componente | Lenguaje 4,206B (2,791 GiB); vision 0,334B (0,621 GiB); MTP head 0,121B (0,094 GiB) |
| Herramienta de cuantizacion | oQ (oMLX v0.7.3) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen3.5-4B mas alla de lo que revela el desglose de pesos: un modelo de lenguaje de 4,206B parametros, una torre de vision de 0,334B y una cabeza MTP de 0,121B. La presencia de vision confirma que el checkpoint es multimodal (entrada de imagenes junto con texto). La cabeza MTP es un componente de prediccion multi-token que suele emplearse para decodificacion especulativa: el modelo predice varios tokens por paso y un mecanismo de verificacion los valida, lo que puede aumentar el throughput de generacion. No se especifica si la arquitectura del lenguaje es densa o de mezcla de expertos, aunque el reparto de parametros no sugiere un esquema MoE.

Respecto al entrenamiento, la model card no aporta informacion sobre el numero de tokens, la composicion del dataset, las fases de preentrenamiento, el ajuste supervisado ni el uso de RLHF o DPO. Tampoco se documenta el proceso de "abliteration" que da lugar a la variante heretic, ni que capas o direcciones de rechazo se han modificado. La unica informacion tecnica verificable es el esquema de cuantizacion: oQ asigna 5 bits a la mayoria de los pesos (74,6%), 6 bits a una fraccion relevante (17,9%), 8 bits a un conjunto minimo (0,06%) y mantiene en BF16 el 7,5% restante, presumiblemente capas sensibles como embeddings, normalizaciones o proyecciones criticas. Este reparto busca preservar calidad en las partes mas fragiles del modelo mientras comprime el resto.

## Capacidades

- Generacion de texto y razonamiento en lenguaje natural, heredadas del modelo base Qwen3.5-4B.
- Procesamiento de imagenes: la presencia de una torre de vision de 0,334B indica soporte de entrada multimodal (VLM).
- Prediccion multi-token mediante la cabeza MTP, orientada a acelerar la decodificacion.
- Capacidades de codigo y matematicas: no documentadas explicitamente en la informacion disponible, aunque son habituales en la familia Qwen.
- Tool calling y function calling: no disponible en la documentacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentacion.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo "thinking" o razonamiento extendido: no disponible.
- Efecto "heretic": se espera una reduccion de los rechazos del modelo original, aunque el alcance exacto no esta documentado.

## Casos de uso

- Prototipado local en Mac: el checkpoint esta en formato MLX y ocupa 3,8 GB, por lo que puede cargarse en un Mac con chip M-series y memoria unificada de 8 GB o mas para experimentar con un VLM de 4,6B sin depender de la nube.
- Asistente multimodal de escritorio: al incluir torre de vision, puede emplearse para describir capturas de pantalla, extraer texto de imagenes o responder preguntas sobre documentos escaneados en una aplicacion local.
- Generacion de texto con baja latencia en Apple Silicon: la cabeza MTP y la cuantizacion mixta permiten decodificacion especulativa y menor huella de memoria, adecuadas para autocompletado o chat en tiempo real en un portatil.
- Evaluacion de tecnicas de cuantizacion: util como caso de estudio para investigadores que quieran medir el impacto de una mezcla 5/6/8/BF16 sobre la calidad de un modelo multimodal pequeno.
- Filtrado y moderacion de contenido sin restricciones de rechazo: la variante heretic puede servir en entornos controlados donde se necesita que el modelo no decline peticiones por motivos de politica, siempre con supervision humana.
- Experimentacion con decodificacion especulativa: la cabeza MTP separada (0,121B) permite estudiar el equilibrio entre velocidad y calidad en pipelines de inferencia MLX.
- Base para fine-tuning ligero: al ser un checkpoint compacto, puede actuar como punto de partida para ajustes LoRA en tareas de vision-lenguaje en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el checkpoint ocupa 3,507 GiB en disco; en inferencia MLX se necesita ademas memoria para el contexto KV y buffers, por lo que se recomienda un minimo de 8 GB de memoria unificada y 16 GB para contextos largos.
- Hardware objetivo: chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con la libreria MLX. No es un formato pensado para GPUs NVIDIA.
- GPU de consumo: no aplica directamente por el formato MLX; en GPUs NVIDIA habria que reconvertir los pesos, operacion no documentada por el autor.
- Opciones de despliegue: MLX y mlx-lm en macOS; el formato safetensors cuantizado no es compatible de forma nativa con vLLM, llama.cpp, Ollama o TGI sin conversion previa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-oQ5-mtp (este) | 4,66B | no disponible | MLX safetensors 5/6/8/BF16 | no disponible | Variante heretic cuantizada, con vision y MTP |
| Qwen3.5-4B (original) | ~4,6B | no disponible | safetensors BF16 | no disponible en esta ficha | Modelo base sin abliteration ni cuantizar |
| Qwen2.5-VL-3B | ~3,75B | 32k (segun documentacion publica de Qwen2.5-VL) | safetensors, GGUF | Apache 2.0 (segun Qwen2.5-VL) | Alternativa multimodal pequena con licencia permisiva |
| Llama 3.2 3B | 3,2B | 128k (segun documentacion publica de Llama 3.2) | safetensors, GGUF | Llama 3.2 Community License | Solo texto; sin vision ni MTP |

La comparativa con Qwen2.5-VL-3B y Llama 3.2 3B se basa en datos publicos de sus respectivas documentaciones; los datos de este checkpoint para contexto, licencia e idiomas no estan disponibles, lo que limita una comparacion rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; hay que contactar con el autor o consultar la licencia del modelo base Qwen3.5-4B.
- Variante "heretic": la abliteration elimina o reduce los rechazos de seguridad, lo que aumenta el riesgo de generar contenido danino, sesgado o inapropiado; no es adecuada para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion: inherente a modelos de 4,6B; la cuantizacion mixta puede agravar errores en tareas de precision.
- Perdida de calidad por cuantizacion: el 74,6% de los pesos esta a 5 bits, lo que puede degradar tareas sensibles (matematicas, codigo, vision fina) frente al BF16 original; no hay evaluaciones que lo cuantifiquen.
- Idiomas y contexto no documentados: no se puede garantizar un rendimiento multilingue ni una ventana de contexto concreta.
- Compatibilidad limitada: el formato MLX restringe el despliegue a macOS con Apple Silicon; no hay conversion documentada a GGUF ni a otros runtimes.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria ni mantenimiento conocido.
- Sin garantias de produccion: al ser un artefacto experimental de un autor individual, no hay soporte, versionado ni pruebas de robustez.
- Fecha de creacion inusual (2026-11-12): conviene verificar la integridad del checkpoint y la autenticidad del modelo base antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-4B-heretic-oQ5-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.5-4B: no disponible en la informacion proporcionada
- Paper, blog o demo del autor: no disponible en la informacion proporcionada
