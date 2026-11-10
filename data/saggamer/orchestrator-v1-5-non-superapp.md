# saggamer/orchestrator-v1.5-non-superapp

## Resumen

Orchestrator v1.5 Non Superapp es un checkpoint de lenguaje de tipo denso y solo texto, derivado del modelo base saggamer/orchestrator-v1.5, que a su vez se apoya en una base de instrucciones Gemma 4 E4B con adaptadores entrenados para flujos agenticos. Lo publica el autor saggamer y su proposito es empaquetar en un unico modelo de texto convencional las capacidades de control, navegacion, MCP, codigo y presentacion que el autor habia entrenado por separado, de forma que pueda integrarse en aplicaciones propias sin depender de la aplicacion Kira Superapp.

El modelo resuelve el problema de portabilidad: en lugar de requerir un cargador personalizado o una build parcheada de llama.cpp, emplea la arquitectura estandar de Gemma 4 de texto y se carga con `trust_remote_code=False`. Cuenta con 7.463.013.418 parametros almacenados unicos antes de cuantizacion y los pesos FP16 ocupan aproximadamente 14,93 GB.

Es relevante ahora porque permite desplegar decisiones de tool calling, resumenes fundamentados en material aportado y ayuda a codigo en runtimes comerciales habituales (Transformers, llama.cpp, Ollama, LM Studio, MLX) con formatos estandar. No obstante, conviene subrayar que se trata de una fusion estatica que aproxima el enrutado MoE original del modelo fuente y que no se realizo entrenamiento nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, solo texto, basado en Gemma 4 (familia E4B) |
| Parametros totales | 7.463.013.418 (valores unicos almacenados antes de cuantizacion) |
| Parametros activos | no disponible (el checkpoint es denso; el origen era MoE con 16 expertos por canal) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (safetensors), GGUF Q4_K_M, MLX affine 4-bit; tambien Q8 mencionado en la receta de exportacion |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers), GGUF (llama.cpp/Ollama/LM Studio), MLX 4-bit (Apple Silicon) |

## Arquitectura y entrenamiento

El checkpoint es un derivado denso y solo texto. La base es Gemma 4 E4B de instrucciones, sobre la que el autor habia entrenado adaptadores para rutas de control, navegador, MCP, codigo y presentacion. Para esta edicion, las tres capas FFN adaptadas se reconstruyeron tomando cada actualizacion de experto como `B @ A`, promediada sobre los 16 expertos de cada uno de cinco canales fuente, y mezclada por igual entre canales con fuerza residual 0,5. Las matrices resultantes son proyecciones densas convencionales. Los hashes exactos de los adaptadores fuente y los coeficientes estan en `merge_recipe.json`.

No se realizo entrenamiento nuevo. La fusion estatica aproxima el enrutado dependiente del token del MoE original, pero no lo reproduce exactamente. Ademas, el backbone fuente ya estaba cuantizado en MLX, por lo que exportar a FP16 o Q8 no recupera los pesos originales a plena precision. La evaluacion del autor consistio en una comparacion emparejada sobre 12 fixtures de desarrollo y 8 fixtures reservados, usando representaciones MLX 4-bit, sin regresiones en esa muestra pequena; cubre seguimiento de instrucciones, razonamiento sobre hechos aportados, codigo basico y seleccion de siguiente herramienta.

## Capacidades

- Generacion de texto conversacional con seguimiento de peticiones multi-turno.
- Resumenes fundamentados en material supplied por el usuario (grounded summaries).
- Ayuda a codigo basica.
- Decision de tool calling: seleccion del siguiente tool entre los proporcionados.
- Emision de llamadas a funcion nativas en GGUF (verificado en llama.cpp, Ollama y LM Studio).
- Razonamiento aritmetico basico y generacion de JSON para decisiones de herramienta.
- Integracion con hosts agenticos compatibles que aporten y ejecuten las herramientas (navegador, servicios MCP, ficheros locales, otros agentes).
- Capacidades multilingues limitadas al ingles.
- No incluye codificadores de vision ni audio, ni navegador integrado, ni credenciales de aplicacion.

## Casos de uso

- Asistente conversacional de seguimiento: el modelo mantiene peticiones encadenadas y aclara instrucciones previas, adecuado para interfaces de chat donde el host gestiona el historial.
- Resumen fundamentado de documentos aportados: permite sintetizar material que el usuario proporciona en el prompt, util para herramientas de investigacion interna que no requieren recuperacion externa.
- Seleccion de siguiente herramienta en pipelines agenticos: dado un conjunto de tools descrito en el prompt, el modelo emite una decision JSON que el host interpreta y ejecuta, por ejemplo para encadenar busquedas, lecturas de ficheros o llamadas MCP.
- Automatizacion de tareas de escritorio: integrado en un host con acceso a ficheros locales, puede decidir que operacion ejecutar a continuacion sobre documentos del usuario.
- Asistencia a codigo en editor o CLI: genera fragmentos y explica errores basicos; su tamano de 7,4B permite ejecucion local en portatiles con suficiente memoria.
- Orquestacion de agentes multi-paso: actua como planificador ligero que delega subtareas a otros agentes o servicios, aprovechando la emision de llamadas a funcion nativas.
- Prototipado de aplicaciones MCP: sirve como modelo de referencia para validar flujos de conexion a servicios MCP antes de escalar a modelos mayores.
- Despliegue en Apple Silicon: la edicion MLX 4-bit permite ejecucion local en equipos M4 con 24 GB de memoria, como el usado en las pruebas del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente reporta comprobaciones funcionales de compatibilidad (3/3 en carga, aritmetica, codigo y decision JSON de herramienta) en Transformers 5.22.2 (FP16), MLX-LM 0.32.0 (4-bit), llama.cpp sin modificar (Q4_K_M), Ollama 0.40.13 (Q4_K_M) y LM Studio 0.4.26+4 (Q4_K_M). El autor indica explicitamente que estas comprobaciones no son rankings de rendimiento ni puntuaciones amplias de benchmarks agenticos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 14,93 GB para FP16 en safetensors; sensiblemente menos con GGUF Q4_K_M o MLX 4-bit (cifra exacta no disponible).
- GPU recomendadas: no disponibles en la informacion; el autor solo documenta una prueba en CPU FP16 sobre un portatil Apple M4 con 24 GB de memoria.
- Consumer GPU: viable en GPUs con al menos 16 GB de VRAM en cuantizacion 4-bit (estimacion basada en el tamano de pesos, no confirmada por el autor); FP16 requiere alrededor de 15 GB solo para pesos, mas overhead de activaciones y cache KV.
- Opciones de despliegue: Transformers (>= 5.22.2), llama.cpp sin modificar, Ollama >= 0.40.13, LM Studio >= 0.4.26+4, MLX-LM >= 0.32.0. El runtime debe soportar Gemma 4.
- Latencia y throughput: no disponibles; la model card indica que el tiempo exacto depende de carga, cache, hardware y configuracion del runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Orchestrator v1.5 Non Superapp | 7,46B denso | no disponible | Apache 2.0 | safetensors, GGUF, MLX | Derivado denso de un MoE Gemma 4 E4B; solo texto; ingles |
| saggamer/orchestrator-v1.5 (fuente) | no disponible | no disponible | no disponible | Hugging Face | Base MoE con adaptadores Kira; requiere host/app para tools |
| Gemma 4 E4B (base de instrucciones) | no disponible | no disponible | no disponible | no disponible | Backbone original; el checkpoint hereda su arquitectura |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La fusion estatica aproxima el enrutado MoE original; no reproduce el comportamiento exacto del modelo fuente.
- El backbone fuente ya estaba cuantizado en MLX: exportar a FP16 o Q8 no recupera precision original.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- No incluye vision, audio, navegador integrado ni credenciales; estas son funciones del host, no del checkpoint.
- Riesgo de alucinacion inherente a modelos de 7,4B; los resumenes deben validarse contra el material aportado.
- La evaluacion del autor es una muestra pequena (12 + 8 fixtures) y no establece rendimiento frontier ni de agente de navegador general.
- Las comprobaciones de runtime son funcionales, no benchmarks de rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero deben conservarse la licencia y los avisos de terceros del modelo base.
- El modelo se publica como "non-superapp": no incluye chats privados, perfiles de navegador, credenciales ni artefactos de usuario.
- Compatibilidad con runtimes y dispositivos no esta garantizada por ningun formato.

## Enlaces

- Hugging Face (safetensors): https://huggingface.co/saggamer/orchestrator-v1.5-non-superapp
- Hugging Face (GGUF): https://huggingface.co/saggamer/orchestrator-v1.5-non-superapp-GGUF
- Hugging Face (MLX 4-bit): https://huggingface.co/saggamer/orchestrator-v1.5-non-superapp-MLX
- Modelo base: https://huggingface.co/saggamer/orchestrator-v1.5
- Kira Superapp (web): https://kira-superapp.vercel.app/
- Kira Superapp (GitHub): https://github.com/saggamer/KIRA-Superapp
- Diagonal Browser: https://github.com/saggamer/KIRA-Superapp/tree/main/diagonal_browser
