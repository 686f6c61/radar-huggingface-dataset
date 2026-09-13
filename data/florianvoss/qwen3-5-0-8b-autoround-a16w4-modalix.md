# florianvoss/Qwen3.5-0.8B-Autoround-a16w4-Modalix

## Resumen

Qwen3.5-0.8B-Autoround-a16w4-Modalix es un paquete de artefactos de runtime, no un checkpoint convencional de Transformers. Lo publica el usuario florianvoss (0 descargas y 0 likes en el momento de la consulta) y consiste en una cuantizacion INT4 del modelo base Qwen/Qwen3.5-0.8B compilada especificamente para el runtime LLiMa sobre el acelerador SiMa.ai Modalix. El repositorio ocupa 1,9 GB e incluye 107 programas MLA compilados, ademas de un directorio devkit con configuracion de runtime, tokenizer y embeddings.

El interes de esta ficha es acotado pero relevante: muestra un flujo de despliegue de un LLM pequeno en hardware de inferencia en el borde (edge) con un esquema de cuantizacion mixto y agresivo. El decodificador usa AutoRound INT4 simetrico con group size 256, la cabeza de salida usa GPTQ INT4, la torre de vision y el proyector usan RTN INT8 por canal de salida, y varios tensores sensibles (proyecciones A/B de DeltaNet, parametros de convolucion y normalizacion, A_log y dt_bias) se mantienen en BF16. El resultado se ejecuta mediante `llima run` sobre Modalix.

La relevancia practica esta condicionada por dos hechos declarados por el propio autor: el artefacto no es portable a GPUs ni a runtimes como vLLM o llama.cpp, y la evaluacion en el runtime Modalix estaba pendiente en el momento de publicacion, aunque la compilacion, la validacion del archivo y el `llima-deploy` local se completaron correctamente. La ventana de contexto declarada para este artefacto es de 4096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida con capas DeltaNet (proyecciones QKV/Z/output, proyecciones A/B, convolucion) y un codificador de vision; los artefactos se empaquetan como programas MLA para SiMa.ai Modalix. El tipo exacto de transformer no se detalla en la informacion disponible |
| Parametros totales | Aproximadamente 0,8 mil millones, segun el nombre del modelo base (Qwen/Qwen3.5-0.8B); no se indica el recuento exacto |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 4096 tokens (capacidad declarada del artefacto compilado); prefill group size de 128 |
| Tipos de cuantizacion | AutoRound INT4 simetrico con group size 256 en lineales del decodificador (incluidas QKV/Z/output de DeltaNet); GPTQ INT4 simetrico con group size 256 en la cabeza de salida; RTN INT8 por canal de salida en lineales de vision y proyector; BF16 en proyecciones A/B de DeltaNet, convolucion, normalizacion, A_log y dt_bias. SmoothQuant con alpha 0.5 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Artefactos de runtime ELF compilados (107 programas MLA) mas `devkit/` con configuracion de runtime, tokenizer y embeddings. No es un checkpoint de Transformers: no hay safetensors ni GGUF |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Entrada de vision | 448 x 448, con el codificador empaquetado como ELF por capa |
| Optimizaciones de memoria | Filter sharing, embeddings cuantizados y cache KV cuantizada habilitados |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del modelo base ni de esta compilacion: no hay datos sobre numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que si se documenta es la arquitectura de despliegue. El modelo base Qwen3.5-0.8B parece ser hibrido, dado que la configuracion de cuantizacion menciona explicitamente capas DeltaNet con proyecciones QKV/Z/output y proyecciones A/B, junto con parametros de convolucion, normalizacion, A_log y dt_bias, ademas de una torre de vision y un proyector. Esa combinacion apunta a un modelo multimodal con atencion lineal de tipo DeltaNet, aunque la model card no desarrolla la arquitectura completa.

La innovacion tecnica de esta publicacion esta en la cuantizacion y la compilacion, no en el entrenamiento. Se aplica un esquema mixto: AutoRound INT4 simetrico con group size 256 para el decodificador, GPTQ INT4 con group size 256 para la cabeza de salida, RTN INT8 por canal para vision y proyector, y BF16 para los tensores mas sensibles numericamente. SmoothQuant se configura con alpha 0,5. El resultado se compila en 107 programas MLA ejecutables por el runtime LLiMa en SiMa.ai Modalix, con prefill group size de 128 y cache KV cuantizada. El autor indica que la compilacion y la validacion del archivo se completaron, pero que la evaluacion en el runtime Modalix sigue pendiente.

## Capacidades

- Generacion de texto y razonamiento basico heredados del modelo base Qwen/Qwen3.5-0.8B. No hay mediciones publicadas en esta ficha que cuantifiquen el nivel alcanzado tras la cuantizacion.
- Procesamiento de imagenes: el artefacto incluye un codificador de vision empaquetado como ELF por capa, con entrada declarada de 448 x 448. Las lineales de vision y del proyector se cuantizan a INT8 RTN.
- Soporte de entrada multimodal texto-imagen, segun la presencia de torre de vision y proyector en la configuracion de cuantizacion.
- Ejecucion en el borde: el paquete esta pensado para correr sobre el acelerador SiMa.ai Modalix con el runtime LLiMa, sin GPU dedicada.
- Cache KV cuantizada y embeddings cuantizados, orientados a reducir el consumo de memoria durante la inferencia.
- Soporte de tool calling, function calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en dispositivos de borde: el paquete esta disenado para ejecutarse sobre SiMa.ai Modalix mediante `llima run`, por lo que encaja en equipos con restricciones severas de energia y espacio donde no cabe un servidor con GPU.
- Vision industrial embebida: con entrada de 448 x 448 y un codificador de vision cuantizado a INT8, el modelo puede procesar imagenes de camara en linea de produccion para tareas de descripcion, clasificacion asistida o generacion de informes breves, siempre que se valide primero la calidad tras la cuantizacion.
- Asistente de campo sin conectividad: un modelo de 0,8 mil millones con contexto de 4096 tokens es adecuado para responder consultas tecnicas y resumir documentacion en un dispositivo autonomo, sin depender de la nube.
- Procesamiento de documentos con imagen y texto: la combinacion de torre de vision y decodificador de texto permite extraer y resumir informacion de formularios, etiquetas o paneles escaneados en el propio dispositivo.
- Robotica y sistemas autonomos: el consumo de memoria reducido (embeddings cuantizados, cache KV cuantizada y filter sharing) permite integrar el modelo como modulo de comprension de escena o de interpretacion de instrucciones en lenguaje natural.
- Investigacion en cuantizacion extrema: el repositorio sirve como caso de estudio reproducible de un pipeline AutoRound + GPTQ + RTN con SmoothQuant sobre una arquitectura hibrida con DeltaNet, util para analizar que tensores toleran INT4 y cuales conviene mantener en BF16.
- Despliegue en kioscos o terminales de punto de venta: para tareas de atencion guiada, transcripcion de consultas y resumen de interacciones, con la ventaja de que los datos no salen del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la compilacion, la validacion del archivo y el `llima-deploy` local finalizaron correctamente, pero que la evaluacion en el runtime Modalix esta pendiente. Tampoco hay datos de latencia, throughput ni comparativas de calidad frente al modelo base en BF16 o frente a otras cuantizaciones.

## Requisitos de hardware

- Plataforma objetivo: SiMa.ai Modalix con un runtime LLiMa compatible instalado. El modelo no se ejecuta en GPU convencional ni en CPU mediante runtimes de proposito general.
- VRAM estimada para GPU: no aplicable; el artefacto no es un checkpoint de Transformers, sino un conjunto de programas ELF y recursos de runtime.
- GPU recomendadas: no aplicable. No hay soporte declarado para A100, H100, RTX 4090 ni similares.
- Compatibilidad con GPU de consumo: no. El paquete no se puede cargar en llama.cpp, Ollama, vLLM, TGI ni en el ecosistema Transformers.
- Tamano en disco: 1,9 GB para el repositorio completo, que incluye 107 programas MLA y el directorio `devkit/`.
- Opciones de despliegue: descargar el repositorio preservando la estructura de directorios y ejecutar `llima run /ruta/a/Qwen3.5-0.8B-Autoround-a16w4-Modalix`. Existe tambien un flujo `llima-deploy` que el autor reporta como completado con exito en local.
- Latencia y throughput: no disponible. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

No hay datos publicados de benchmarks ni de rendimiento en runtime para este artefacto, por lo que la comparativa se limita a caracteristicas verificables del paquete.

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| florianvoss/Qwen3.5-0.8B-Autoround-a16w4-Modalix | ~0,8 mil millones (base) | 4096 tokens | AutoRound INT4, GPTQ INT4, RTN INT8 y BF16 segun tensor | ELF compilado para LLiMa | no disponible | Publicado en HuggingFace, 0 descargas |
| Qwen/Qwen3.5-0.8B (modelo base) | ~0,8 mil millones | no disponible | Sin cuantizar (precision original) | no disponible | no disponible en esta informacion | Referenciado como base en la model card |
| Otras cuantizaciones INT4 del mismo modelo base (AutoRound, GPTQ o AWQ en formato Transformers) | ~0,8 mil millones | no disponible | INT4 | safetensors | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Evaluacion pendiente: el propio autor indica que la evaluacion en el runtime Modalix no se ha realizado. No hay garantia de que la calidad de salida se mantenga tras la cuantizacion mixta aplicada.
- Portabilidad nula: no es un checkpoint de Transformers. No se puede cargar con `transformers`, vLLM, llama.cpp, Ollama ni TGI. Solo funciona con el runtime LLiMa sobre hardware Modalix.
- Contexto limitado a 4096 tokens, inferior al de muchas alternativas actuales, lo que restringe tareas que requieran documentos largos o conversaciones multi-turno extensas.
- Licencia no declarada: la model card no especifica licencia. Antes de cualquier uso comercial hay que verificar la licencia del modelo base Qwen/Qwen3.5-0.8B y las condiciones de redistribucion del propio artefacto compilado.
- Idiomas no declarados: se desconoce que lenguas cubre el modelo y con que calidad, especialmente despues de la cuantizacion.
- Riesgo de alucinacion: inherente a un modelo de aproximadamente 0,8 mil millones de parametros, y potencialmente agravado por la cuantizacion INT4 en el decodificador y la cabeza de salida.
- Riesgo de degradacion en vision: la torre de vision y el proyector se cuantizan a INT8 RTN, un metodo de cuantizacion menos refinado que AutoRound o GPTQ, lo que puede afectar a la precision en tareas visuales finas.
- Sesgos: no disponible. No se ha publicado ninguna evaluacion de sesgos ni de seguridad para este artefacto.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion por parte de terceros.
- Los resultados de la busqueda web realizada no guardan relacion con el modelo; no aportan informacion adicional verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/florianvoss/Qwen3.5-0.8B-Autoround-a16w4-Modalix
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada. La busqueda web no devolvio resultados relevantes sobre este modelo.
