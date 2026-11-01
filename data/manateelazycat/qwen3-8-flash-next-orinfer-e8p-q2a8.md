# manateelazycat/Qwen3.8-Flash-Next-Orinfer-E8P-Q2A8

## Resumen

Qwen3.8-Flash-Next-Orinfer-E8P-Q2A8 es una cuantización del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario manateelazycat, orientada específicamente a la inferencia en NVIDIA Jetson AGX Orin de 64 GB con arquitectura CUDA SM87. No es un modelo nuevo, sino un artefacto de despliegue: el repositorio contiene los pesos en formato safetensors (52,94 GB en 35 shards) más los descriptores de configuración y tokenizador necesarios para que el runtime Orinfer v0.2.0 los ejecute en hardware embebido. El objetivo es hacer viable un modelo de lenguaje y visión de gran tamaño en una plataforma de borde con memoria unificada limitada, recurriendo a una mezcla agresiva de precisiones.

La cuantización combina expertos enrutados con pesos E8P de casi 2 bits e cómputo INT8, proyecciones QKV/Z de GDN y Q/gate de QSA en Q4A8 con bloques con signo de 128, proyecciones de salida y FFN compartida en W8, y componentes sensibles (HC en BF16, visión en FP16). El resultado son aproximadamente 2,414 bits por parámetro de peso registrado en GPU, con una capacidad de contexto declarada de 262.144 tokens y caché KV en INT8. El modelo base soporta texto, imágenes y múltiples imágenes, con plantilla de chat nativa que incluye modo de razonamiento (*thinking*) y soporte de MTP (multi-token prediction).

Su relevancia es doble: por un lado demuestra que es posible servir un modelo multimodal de escala grande en un Jetson AGX Orin con throughput medido (56,35 tok/s en decodificación individual con MTP, 157,25 tok/s con 8 peticiones concurrentes); por otro, ilustra un patrón de distribución poco habitual, en el que los pesos viven en Hugging Face pero el motor de ejecución y los cubins se distribuyen por separado a través de GitHub Releases. La licencia de los pesos es Qwen Community License 1.0, mientras que el software Orinfer usa LGPL-3.0-or-later.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal del modelo base Qwen3.8-Flash-Next (detalles de capas y atención no disponibles en la información proporcionada) |
| Parámetros totales | No disponible (el autor solo reporta ~2,414 bits por parámetro de peso registrado en GPU) |
| Parámetros activos | No disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | E8P near-2-bit con cómputo INT8 (expertos enrutados); Q4A8 signed-block128 (GDN QKV/Z, QSA Q/gate, cabeza de salida compartida); W8 (proyecciones de salida, FFN compartida, proyecciones MTP sensibles); BF16 (HC); FP16 (visión); caché KV en INT8; estado GDN persistente en FP32 |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Qwen Community License 1.0 (pesos); Orinfer bajo LGPL-3.0-or-later |
| Formato de pesos | Safetensors (35 shards, 52,94 GB) más `cache/model.json` con el descriptor de diseño físico de tensores |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer multimodal de la familia Qwen, con pipeline `image-text-to-text` y soporte de texto, imágenes y múltiples imágenes. La información disponible no detalla el número de capas, la dimensión oculta ni la composición del dataset de entrenamiento, ni si hubo fases de RLHF o DPO. Sí se documentan algunos componentes internos por las decisiones de cuantización: módulos GDN (con proyecciones QKV/Z), módulos QSA (con proyecciones Q/gate), una FFN compartida, una cabeza de salida compartida, proyecciones HC y un cabezal de predicción multi-token (MTP) nativo. La presencia de GDN y QSA sugiere una arquitectura híbrida con mecanismos de atención lineal o de estado recurrente, aunque la información proporcionada no permite confirmar la proporción entre capas de atención completa y capas lineales.

La innovación principal de esta ficha no está en el entrenamiento, sino en el esquema de cuantización y en el runtime. Los expertos enrutados se almacenan con codificación E8P de casi 2 bits y se ejecutan en INT8, lo que reduce drásticamente el peso en memoria a costa de una precisión muy agresiva; las partes más sensibles se protegen con Q4A8, W8, BF16 o FP16 según su impacto en la calidad. El motor Orinfer v0.2.0 aporta MTP nativo con hasta 3 borradores adaptativos, prefix caching, batching continuo, CUDA graphs en modo `decode_only` y un modo de inferencia offline reanudable sobre JSONL. La semilla de cuantización es `20261002` y el paquete de ejecución tiene un digest SHA-256 fijado (`cb025f5e…9806f7`), lo que permite verificar la correspondencia entre pesos y binarios.

## Capacidades

- Generación de texto conversacional multi-turno en chino e inglés.
- Comprensión de imágenes y de múltiples imágenes en una misma petición (pipeline `image-text-to-text`).
- Modo de razonamiento (*thinking*) gestionado por la plantilla de chat nativa del modelo base; los tokens de razonamiento se exponen en el campo `reasoning_content`.
- Traducción, con la recomendación explícita de desactivar el modo *thinking* (`enable_thinking: false`) para este tipo de peticiones.
- Predicción multi-token (MTP) nativa con hasta 3 borradores, que acelera la decodificación cuando la tasa de aceptación es favorable.
- Servicio mediante API compatible con OpenAI Chat Completions (`/v1/chat/completions`), con streaming SSE y soporte de `image_url` para imágenes.
- API compatible con Ollama expuesta por la CLI de Orinfer.
- Procesamiento por lotes offline sobre ficheros JSONL, con capacidad de reanudación.
- Prefix caching y batching continuo para cargas concurrentes.
- No se documenta soporte de *tool calling* ni de *function calling* en la información disponible.
- No se documenta soporte de audio ni de vídeo.

## Casos de uso

- Asistencia conversacional en el borde: el modelo puede atender conversaciones multi-turno en chino e inglés directamente en un Jetson AGX Orin, sin depender de conectividad a la nube, gracias a los 262.144 tokens de contexto y al batching continuo del runtime.
- Descripción y análisis de imágenes en dispositivos embebidos: robots móviles, drones o estaciones de inspección pueden enviar imágenes por `image_url` y recibir descripciones o respuestas en lenguaje natural, aprovechando la rama de visión en FP16.
- Traducción zh↔en en local: con `enable_thinking: false`, el modelo traduce texto e imágenes con texto (por ejemplo, carteles o documentos escaneados) en un flujo de baja latencia medido en torno a 16 segundos desde el arranque hasta la primera salida.
- Procesamiento por lotes de documentos y capturas: la CLI `orinfer batch` permite lanzar trabajos JSONL reanudables sobre grandes volúmenes de pares imagen-texto, útil para etiquetado, moderación o generación de metadatos.
- Prototipado de agentes visuales en robótica: la combinación de contexto largo, soporte multi-imagen y API compatible con OpenAI permite integrar el modelo en bucles de percepción-acción sin reescribir el cliente.
- Servicio interno de bajo coste energético: para equipos que ya disponen de Jetson AGX Orin, el modelo ofrece una alternativa local a APIs en la nube con 32 peticiones concurrentes y hasta 282,87 tok/s en decodificación agregada según las mediciones del autor.
- Evaluación de cuantizaciones extremas: investigadores interesados en el impacto de E8P near-2-bit con cómputo INT8 sobre calidad pueden usar este repositorio como referencia reproducible, dado que el autor publica semilla, digest y comparativas BF16 de muestra pequeña.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks de calidad estándar (MMLU, HumanEval, GSM8K, etc.). Lo que sí reporta son métricas de rendimiento medidas el 2026-10-21 en un Jetson AGX Orin de 64 GB:

| Métrica | Valor |
|---|---:|
| Prefill 512 tokens (tok/s) | 925,57 |
| Prefill 8K tokens (tok/s) | 858,11 |
| Decodificación individual con MTP (tok/s) | 56,35 |
| Decodificación con 8 peticiones (tok/s) | 157,25 |
| Máximo de peticiones / decodificación agregada (tok/s) | 32 / 282,87 |
| Arranque del servicio hasta API lista (s) | 15,79 |
| Arranque del servicio hasta primera salida (s) | 15,96 |

Condiciones declaradas: decodificación individual con MTP adaptativo hasta 3 borradores, entrada de 512 u 8.192 tokens y 257 tokens de salida fijos; ejecuciones multi-petición con MTP desactivado, 256 tokens de entrada y 65 de salida por petición. Mediana de tres ejecuciones en caliente tras un calentamiento, decodificación voraz, semilla `20261002`, `decode_only`, *thinking* desactivado y prefix cache desactivada. El autor advierte que la velocidad de MTP depende de la tarea y de la tasa de aceptación. La validación de calidad se limita a diagnósticos de probabilidad sobre historial fijo, aislamiento de estado entre peticiones, recuperación de MTP y prefix cache, y peticiones de texto e imagen controladas; no hay benchmarks de tareas amplias ni de contexto completo.

## Requisitos de hardware

- GPU objetivo: NVIDIA Jetson AGX Orin de 64 GB, arquitectura CUDA SM87. El repositorio está empaquetado exclusivamente para esta plataforma.
- Memoria: los datos de GPU en solo lectura (incluidas escalas, constantes derivadas y excepciones de precisión) ocupan 38.865.095.600 bytes; los safetensors almacenados suman 52,94 GB en 35 shards. La memoria unificada del Jetson AGX Orin de 64 GB es un requisito práctico.
- No se documenta compatibilidad con GPUs de escritorio (RTX 4090, A100, H100) ni con otras plataformas; el paquete de ejecución es específico para SM87 y aarch64.
- Despliegue: CLI Rust `orinfer` v0.2.0 para Linux aarch64, más el paquete de ejecución `orinfer-exec-flash-next-a8-sm87-v0.2.0`. El servidor escucha en `[::]:8088`.
- Opciones de despliegue adicionales: la CLI expone API compatible con Ollama y el subcomando `orinfer batch` para trabajos JSONL; no se mencionan vLLM, llama.cpp, TGI ni Ollama como motores alternativos.
- Throughput y latencia: ver la tabla de benchmarks; el arranque ronda los 15,8-16,0 segundos y la decodificación individual alcanza 56,35 tok/s con MTP.
- El autor indica que las tablas de embedding/PLE en CPU usan cachés de filas acotadas, un detalle relevante para el consumo de memoria del sistema.

## Comparativa con modelos similares

La información proporcionada no incluye datos de otros modelos comparables ni resultados de benchmarks del modelo base frente a alternativas. Como referencia cualitativa, se puede comparar con el propio modelo base sin cuantizar:

| Modelo | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-Orinfer-E8P-Q2A8 | 262.144 tokens | E8P/INT8, Q4A8, W8, BF16, FP16 | Qwen Community License 1.0 | Jetson AGX Orin 64 GB (SM87) |
| Qwen/Qwen3.8-Flash-Next (base) | No disponible en la información | BF16 (presumiblemente) | Qwen Community License 1.0 | GPUs de datacenter (no confirmado) |

No se dispone de comparativas con otras cuantizaciones del mismo modelo ni con modelos de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- La cuantización E8P near-2-bit con cómputo INT8 en los expertos enrutados es extremadamente agresiva; el propio autor reconoce que la calidad solo se ha validado con diagnósticos de muestra pequeña, texto hasta 8K e imágenes simples controladas, y que los benchmarks de tareas amplias, la traducción de imágenes complejas y la calidad en contexto completo quedan pendientes de evaluación.
- El repositorio está atado a una plataforma concreta (Jetson AGX Orin 64 GB, CUDA SM87, Linux aarch64) y a un paquete de ejecución con digest fijo; no es portable a otras GPUs sin trabajo adicional no documentado.
- Idiomas limitados a chino e inglés; no se declara soporte de castellano ni de otras lenguas.
- El modo *thinking* está controlado por la plantilla de chat del modelo base; el autor recomienda desactivarlo para traducción, lo que sugiere que puede degradar la latencia o la fidelidad en esa tarea.
- No se documenta soporte de *tool calling*, *function calling* ni de flujos agénticos multi-paso; quien los necesite debe verificarlos empíricamente.
- La licencia Qwen Community License 1.0 impone condiciones específicas para uso comercial; es necesario revisar el texto completo antes de desplegar en producción. El software Orinfer es LGPL-3.0-or-later, lo que añade obligaciones de distribución de fuente.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- Sesgos conocidos del modelo base no documentados en la información proporcionada.
- El número de descargas (28) y de likes (0) indica una adopción muy incipiente; no hay evidencia de comunidad ni de soporte a terceros.
- El repositorio se distribuye con una semilla de cuantización y un digest de ejecución concretos; cualquier reempaquetado o modificación invalida la validación del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/manateelazycat/Qwen3.8-Flash-Next-Orinfer-E8P-Q2A8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base (Qwen Community License 1.0): https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/de4b8e4d43b917e7706784d8bb445c9af86a3540/LICENSE
- Réplica del autor en Hugging Face: https://huggingface.co/immiq/Qwen3.8-Flash-Next-Orinfer-E8P-Q2A8
- ModelScope: https://modelscope.cn/models/iammiq/Qwen3.8-Flash-Next-Orinfer-E8P-Q2A8
- Release de Orinfer v0.2.0: https://github.com/iMMIQ/orinfer/releases/tag/v0.2.0
- Guía de servicio de Orinfer: https://github.com/iMMIQ/orinfer/blob/v0.2.0/docs/serving.md
- Referencia de rendimiento de Orinfer: https://github.com/iMMIQ/orinfer/blob/v0.2.0/docs/performance.md
