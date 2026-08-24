# pinkelephantlimited/phone-llm

## Resumen

PhoneLLM es un modelo de lenguaje denso de 1.2 mil millones de parametros desarrollado por Pink Elephant Limited, una empresa registrada en Hong Kong. El modelo ha sido entrenado desde cero (from scratch) con tokenizador BPE propio de 32k y arquitectura propia, sin basarse en Qwen ni en otros modelos existentes. Su objetivo principal es proporcionar inteligencia artificial soberana que se ejecute completamente offline en dispositivos moviles Android, con la posibilidad de combinar inferencia local con busqueda web para obtener informacion actualizada.

El modelo se presenta como el alumno destilado del modelo maestro Pink Elephant 48B-S (47.7B MoE), pero con pesos propios y licencia MIT. Está diseñado para funcionar en telefonos de gama media como el iQOO Neo5 SE (8GB RAM) mediante llama.cpp, con cuantizaciones que ocupan entre 0.6GB y 0.8GB. La relevancia actual radica en la tendencia hacia la inteligencia artificial soberana y on-device, donde el usuario controla sus datos sin depender de la nube.

La arquitectura es un transformer denso de 24 capas con atencion por grupos (GQA), SwiGLU y RoPE con base 10k. El contexto de entrenamiento es de 4096 tokens, aunque la inferencia en el dispositivo se limita a 2048 tokens para optimizar recursos. El modelo soporta ingles y chino, y su licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (GQA, SwiGLU, RoPE) |
| Parametros totales | 1.2B |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | 4096 tokens (entrenamiento), 2048 tokens (inferencia movil) |
| Tipos de cuantizacion | Q4_K_M (~0.8GB), Q4_0 (~0.6GB), F16 (~2.4GB) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizados), pesos originales en formato Transformers (no detallado) |

## Arquitectura y entrenamiento

PhoneLLM es un transformer denso de 1.2B parametros con 24 capas, 16 cabezas de atencion, 4 cabezas KV, dimension oculta de 2048 y dimension intermedia de 5504. El vocabulario es de 32000 tokens, entrenado con un tokenizador BPE propio sobre los datasets FineWeb-Edu, OpenHermes y StarCoder. La arquitectura incorpora GQA para reducir el uso de memoria en inferencia y SwiGLU como funcion de activacion.

El entrenamiento se realizo desde cero con datos de una mezcla permisiva de Hugging Face: 60% web, 30% chat y 10% codigo. El proceso utilizo una GPU molab RTX PRO 6000 de 102GB en BF16, con PagedAdamW8bit y gradient checkpointing. El modelo maestro Pink Elephant 48B-S (47.7B MoE) actuo como teacher para la destilacion, pero no se copio ningun peso. El objetivo declarado es la soberania completa de los pesos y la arquitectura.

## Capacidades

- Generacion de texto y chat conversacional con estilo similar a DeepSeek (streaming, markdown, historial).
- Razonamiento basico y generacion de codigo, gracias al 10% de datos de codigo en el entrenamiento.
- RAG hibrido: el modelo puede combinar contexto local con resultados de busqueda web (Jina Reader + DuckDuckGo lite) concatenados con cabeceras de seccion `[Local]` y `[Web Search Results]`.
- Inferencia on-device con llama.cpp via NDK, con soporte Vulkan y 4 hilos de ejecucion.
- Soporte para cuantizacion GGUF, permitiendo ejecucion en telefonos de gama media con 8GB de RAM.
- Multilingue en ingles y chino, con tokenizador propio adaptado a ambos idiomas.

## Casos de uso

- Asistente personal offline en Android: el modelo se integra en una APK de ~30MB que descarga el peso cuantizado desde Hugging Face. Permite conversaciones privadas sin conexion, adecuado para entornos con restricciones de red o datos sensibles.
- RAG local para documentacion personal: al ejecutarse en el dispositivo, se puede indexar documentos locales y consultarlos con el modelo sin enviar datos a la nube. La ventana de 2048 tokens permite gestionar contexto razonable para preguntas y respuestas.
- Busqueda web hibrida con privacidad: el modo web busca en Internet, pero el prompt se construye localmente, combinando resultados de busqueda con contexto local. Util para asistentes de viaje o informacion en tiempo real sin depender de APIs externas.
- Generacion de codigo en el dispositivo: gracias al 10% de datos de codigo, puede asistir en tareas de programacion en entornos de desarrollo movil o para estudiantes sin acceso a servicios en la nube.
- Chat con marca propia para empresas: al ser MIT y tener pesos soberanos, una empresa puede distribuirlo como producto propio sin royalties ni dependencia de proveedores externos.
- Aplicaciones de educacion y aprendizaje de idiomas: soporta ingles y chino, puede usarse en aplicaciones de practica de conversacion o traduccion basica sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones comparativas (MMLU, HumanEval, GSM8K, etc.) ni datos de rendimiento cuantitativos mas alla de la velocidad de inferencia en el dispositivo.

## Requisitos de hardware

- VRAM estimada: 0.6GB para cuantizacion Q4_0, 0.8GB para Q4_K_M, 2.4GB para F16.
- GPU recomendadas: el modelo esta disenado para CPU moviles con soporte Vulkan (Snapdragon 870, 8GB RAM). En GPU de escritorio, cualquier GPU con 2GB o mas de VRAM puede ejecutar la version F16.
- Cabe en GPU de consumo: si, en GPU de gama media como RTX 2060 o superior para version F16; en telefonos con 6-8GB de RAM para cuantizaciones Q4.
- Opciones de despliegue: llama.cpp (via JNI en Android), APK compilada con gradle, descarga de GGUF desde Hugging Face, o uso con Transformers en Python.
- Latencia y throughput: aproximadamente 15 tokens/s en un iQOO Neo5 SE (Snapdragon 870) con Q4_K_M y 4 hilos. En CPU de escritorio se puede esperar una velocidad similar o superior.

## Comparativa con modelos similares

No hay modelos directamente comparables en la informacion disponible. El modelo se posiciona como alternativa a modelos on-device como Phi-3-mini (3.8B) o Gemma 2B (2.6B), pero con la diferencia de ser entrenado desde cero y con licencia MIT. No se dispone de datos de rendimiento comparativo ni de benchmarks para establecer una tabla fiable. La comparacion se limita a caracteristicas estructurales:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| PhoneLLM 1.2B | 1.2B | 4096 | MIT | GGUF |
| Phi-3-mini | 3.8B | 128k | MIT | GGUF |
| Gemma 2B | 2.6B | 8192 | Gemma License | GGUF |

## Limitaciones y advertencias

- Solo soporta ingles y chines; no es multilingue para otros idiomas.
- Longitud de contexto limitada a 4096 tokens en entrenamiento y 2048 en inferencia movil, lo que limita la capacidad de manejar documentos largos.
- No hay benchmarks publicados, por lo que el rendimiento real en tareas de razonamiento o codigo no esta verificado.
- Riesgo de alucinaciones inherente a modelos de 1.2B, especialmente en tareas de razonamiento complejo o generacion de codigo extenso.
- El modelo se ha probado en un unico dispositivo (iQOO Neo5 SE); la compatibilidad con otros dispositivos Android puede variar segun la GPU y la implementacion de Vulkan.
- No se han publicado datos de sesgos ni evaluaciones de seguridad, por lo que no se recomienda su uso en aplicaciones que requieran moderacion de contenido o decisiones sensibles.
- Al ser un modelo recien publicado (agosto de 2026) con 0 descargas, no hay comunidad de usuarios ni soporte activo.
- La destilacion del teacher Pink Elephant 48B-S no ha sido verificada externamente; no hay documentacion sobre la metodologia de destilacion.

## Enlaces

- HuggingFace: https://huggingface.co/pinkelephantlimited/phone-llm
- GitHub de Pink Elephant LLM: https://github.com/pinkelephantlimited/pink-elephant-llm
- GitHub de Phone Helper: https://github.com/pinkelephantlimited/phone-helper
- Perfil de Pink Elephant Limited en HuggingFace: https://huggingface.co/pinkelephantlimited
