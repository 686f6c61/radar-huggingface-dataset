# DreamFoundries/BotPsy-0.8B-6bit

## Resumen

BotPsy-0.8B-6bit es una cuantizacion de 6 bits del modelo qvac/BotPsy-0.8B, publicada por DreamFoundries en formato MLX (safetensors) para su ejecucion en hardware Apple Silicon. El modelo base pertenece a la familia arquitectonica qwen3_5 y esta orientado a generacion de texto conversacional con soporte explicito de tool calling, function calling y flujos agenticos. Con 752.393.024 parametros reales y un repositorio de 0,6 GB, se posiciona en la franja de modelos ultraligeros pensados para despliegue on-device y edge.

La propuesta de valor es la combinacion de un tamano muy reducido con capacidades de agente: el modelo esta etiquetado para tool calling, function calling y razonamiento multi-paso, lo que permite integrarlo en asistentes locales que invocan funciones sin depender de la nube. La cuantizacion a 6 bits reduce el peso en disco y la memoria necesaria, manteniendo presumiblemente una calidad cercana al modelo original en este rango de tamano.

Es relevante ahora porque el ecosistema MLX de Apple ha consolidado una via practica para ejecutar modelos pequenos en Mac y dispositivos con Apple Silicon, y la demanda de agentes locales con invocacion de herramientas crece frente a alternativas en la nube. La licencia Apache 2.0 facilita su adopcion comercial, aunque la informacion publica disponible sobre el modelo es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, segun tag del autor) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (esta version); el modelo base qvac/BotPsy-0.8B esta disponible sin cuantizar |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura qwen3_5, segun la etiqueta declarada por el autor, lo que implica una familia de transformers decoder-only. No se dispone de informacion publica sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni detalles del tokenizador en la informacion proporcionada. Esta version concreta es una cuantizacion a 6 bits del modelo qvac/BotPsy-0.8B, realizada por DreamFoundries y empaquetada en formato MLX.

No se han publicado datos sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Tampoco hay informacion sobre innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, modos de razonamiento). La model card del repositorio se limita a metadatos de licencia, idioma, libreria y etiquetas funcionales.

## Capacidades

- Generacion de texto conversacional en ingles.
- Tool calling y function calling: el modelo esta etiquetado explicitamente para invocar herramientas externas.
- Soporte de agentes y razonamiento multi-paso (tags "agent" y "agentic").
- Orientado a despliegue on-device y edge (tags "on-device" y "edge").
- Ejecucion nativa en el stack MLX de Apple.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Vision, audio y thinking mode: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente local en macOS: el modelo puede ejecutarse con MLX directamente en Apple Silicon, gestionando conversaciones y llamadas a funciones del sistema sin conexion a la nube, lo que reduce latencia y preserva la privacidad.
- Agente de automatizacion de escritorio: gracias al soporte de tool calling, puede encadenar invocaciones a APIs locales (calendario, ficheros, correo) en flujos multi-paso dentro de una aplicacion nativa.
- Chatbot embebido en aplicaciones moviles o de escritorio: su tamano de 0,6 GB permite incluirlo como recurso local en apps que requieren asistencia conversacional sin backend.
- Prototipado rapido de pipelines agenticos: util para validar disenos de function calling y orquestacion de herramientas antes de migrar a modelos mayores, por su bajo coste de inferencia.
- Enrutamiento de intenciones y extraccion de parametros: el modelo puede clasificar la intencion del usuario y generar los argumentos JSON para invocar funciones en un sistema mayor.
- Educacion e investigacion en edge AI: sirve como banco de pruebas para estudiar el comportamiento de modelos sub-1B con capacidades de agente en hardware de consumo.
- Automatizacion de tareas con privacidad estricta: escenarios donde los datos no pueden salir del dispositivo, como procesamiento de notas o documentos personales con invocacion de herramientas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 0,6-0,8 GB para los pesos en 6 bits, mas overhead de contexto y runtime; en la practica, menos de 2 GB en total para ventanas de contexto moderadas.
- GPU recomendadas: hardware Apple Silicon con soporte MLX (series M1, M2, M3, M4 y superiores). No esta pensado para CUDA.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon; tambien en iPhone/iPad recientes mediante MLX o frameworks compatibles.
- Opciones de despliegue: MLX (libreria declarada), mlx-lm y herramientas del ecosistema MLX. No se indica soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| DreamFoundries/BotPsy-0.8B-6bit | 752 M | no disponible | en | Apache 2.0 | safetensors (MLX) | Cuantizado 6 bits, orientado a agentes on-device |
| qvac/BotPsy-0.8B | no disponible | no disponible | en | Apache 2.0 | no disponible | Modelo base sin cuantizar |
| Qwen2.5-0.5B / 1.5B | 0,5 B / 1,5 B | 32 K (aprox., segun familia) | multilingue | Apache 2.0 | safetensors, GGUF | Alternativa generalista de tamano comparable |
| Llama 3.2 1B | 1,2 B | 128 K | multilingue | Llama 3.2 Community License | safetensors, GGUF | Mayor contexto, licencia con restricciones |

La comparativa con familias Qwen y Llama se ofrece como referencia de categoria; no se dispone de datos de rendimiento del modelo evaluado para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente en tareas de razonamiento complejo o conocimiento factual.
- La longitud de contexto no esta documentada, lo que dificulta planificar casos de uso con conversaciones largas o documentos extensos.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base qvac/BotPsy-0.8B, cuya documentacion conviene revisar.
- El formato MLX limita el despliegue a hardware Apple; no es directamente utilizable en GPUs NVIDIA sin conversion.
- El repositorio no registra descargas ni likes, y la informacion publica es minima: no hay garantias de mantenimiento ni soporte.
- La cuantizacion a 6 bits puede degradar ligeramente la precision en tool calling respecto al modelo base; conviene validar el comportamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DreamFoundries/BotPsy-0.8B-6bit
- Modelo base: https://huggingface.co/qvac/BotPsy-0.8B
- Licencia del modelo base: https://huggingface.co/qvac/BotPsy-0.8B/blob/main/LICENSE
- Libreria MLX: https://github.com/ml-explore/mlx
