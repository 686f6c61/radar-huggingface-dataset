# lmstudio-community/Inkling-2-Mini-MLX-4bit

## Resumen

Inkling-2-Mini es un modelo multimodal de tipo image-text-to-text desarrollado por thinkingmachines. Esta ficha corresponde a la cuantizacion de 4 bits realizada por el equipo de LM Studio mediante MLX, optimizada para ejecucion en Apple Silicon. El modelo emplea una arquitectura Mixture of Experts (MoE) con un total de 26.388.641.280 parametros segun los pesos en safetensors, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta version concreta reside en que reduce el peso del repositorio a 17,3 GB gracias a la cuantizacion de 4 bits, lo que la hace viable en equipos con memoria unificada moderada (Mac con chip de la familia M). Al conservar la pipeline image-text-to-text, mantiene capacidad de procesar imagenes y texto de forma conjunta, algo poco habitual en modelos de este tamano en formato MLX.

La informacion publicada por el autor es muy limitada: la model card se centra en los creditos y avisos legales, sin detallar composicion del dataset, numero de tokens de entrenamiento, longitud de contexto ni resultados de benchmarks. Por tanto, varios campos de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), tag `moe`; modulo `inkling2_loop` en transformers |
| Parametros totales | 26.388.641.280 (26,4 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); el modelo base admite otras segun el autor original |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, 4 bits); repo de 17,3 GB |
| Pipeline | image-text-to-text (multimodal imagen + texto) |
| Compatibilidad | endpoints_compatible, transformers |

## Arquitectura y entrenamiento

El modelo es una red de tipo Mixture of Experts, segun la etiqueta `moe` de Hugging Face y el modulo de transformers `inkling2_loop`, que sugiere un diseno con capas recurrentes o de bucle interno. Es multimodal: acepta entradas de imagen y texto y genera texto, lo que implica la presencia de un codificador visual y un proyector hacia el espacio del modelo de lenguaje. No se dispone de informacion publica sobre el numero de expertos, el numero de parametros activos por token, la dimension oculta ni el esquema de enrutamiento.

Tampoco hay datos publicados sobre el volumen de tokens de entrenamiento, la composicion del corpus, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones como decodificacion especulativa o atencion lineal. Esta version concreta ha sido cuantizada a 4 bits con `mlx_vlm` por el equipo de LM Studio; no se ha reentrenado ni modificado la arquitectura, solo los pesos.

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational`).
- Comprension conjunta de imagen y texto (image-text-to-text): descripcion de imagenes, respuesta a preguntas sobre contenido visual y tareas de razonamiento visual.
- Razonamiento y generacion de codigo: no confirmado explicitamente en la informacion disponible, pero esperable en un modelo de esta familia; debe validarse con pruebas propias.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Capacidades especiales (modo thinking, audio): no disponible.

## Casos de uso

- Asistente visual en local para Mac: el modelo puede responder preguntas sobre capturas de pantalla, documentos escaneados o fotografias, ejecutandose integramente en Apple Silicon gracias al formato MLX de 4 bits, sin enviar datos a la nube.
- Analisis de documentos con imagenes: extraccion de informacion de facturas, formularios o graficos combinando OCR implicito y razonamiento textual en una sola pasada multimodal.
- Prototipado de aplicaciones multimodales: al ser `endpoints_compatible` y cargarse con transformers, permite montar un endpoint compatible con la API de OpenAI para pruebas de integracion.
- Descripcion automatica de imagenes para accesibilidad: generacion de texto alternativo en castellano u otros idiomas (previa verificacion del soporte linguistico) para catalogos de imagenes.
- Soporte a tareas de investigacion en vision-lenguaje: al ser Apache 2.0 y de 26 B parametros totales, sirve como base para experimentos de ajuste fino o evaluacion de tecnicas MoE multimodales.
- Chat conversacional con contexto visual en escritorio: integracion en asistentes de escritorio para Mac que necesiten interpretar lo que el usuario muestra en pantalla y mantener conversacion multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el repo de 4 bits ocupa 17,3 GB, por lo que se necesita al menos ~18 GB de memoria disponible para cargar los pesos; con cache KV y overhead, se recomienda 24 GB o mas.
- GPU recomendadas: exclusivamente Apple Silicon (MLX); no es compatible con CUDA de forma nativa en este formato.
- Cabe en consumer hardware: si, en Mac con memoria unificada de 24 GB o superior (M2 Pro, M3 Pro, M4 Pro y superiores; M1/M2/M3 Max y Ultra con holgura).
- Opciones de despliegue: MLX (`mlx_vlm`), LM Studio, y transformers con backend MLX; no aplica vLLM, llama.cpp ni TGI para estos pesos concretos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini (esta ficha, MLX 4-bit) | 26,4 B totales (MoE) | no disponible | Si | Apache 2.0 | safetensors MLX |
| Inkling-2-Mini (original) | 26,4 B totales (MoE) | no disponible | Si | Apache 2.0 | safetensors |
| Alternativas de 20-30 B multimodales | no disponible | no disponible | Si | variable | variable |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Informacion tecnica muy escasa: sin datos de contexto, idiomas, dataset ni benchmarks, la evaluacion previa a produccion debe hacerse con pruebas propias.
- Riesgo de alucinacion: inherente a los modelos generativos; LM Studio declara explicitamente que no garantiza la veracidad del contenido generado.
- Sesgos: no documentados por el autor; se recomienda auditoria propia antes de uso en produccion.
- Limitaciones de idioma: el autor no declara idiomas soportados, por lo que el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no obstante, el aviso de LM Studio exime a esta entidad de cualquier responsabilidad sobre el modelo.
- Cuantizacion: la version de 4 bits puede degradar ligeramente la calidad respecto al modelo original; validar tareas sensibles con los pesos sin cuantizar.
- Plataforma: los pesos MLX solo se ejecutan en Apple Silicon; para otras plataformas debe usarse el modelo base original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lmstudio-community/Inkling-2-Mini-MLX-4bit
- Modelo base original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Organizacion thinkingmachines: https://huggingface.co/thinkingmachines
- LM Studio: https://lmstudio.ai
- Discord de LM Studio: https://discord.gg/aPQfnNkxGC
- mlx-vlm (herramienta de cuantizacion): https://github.com/Blaizzy/mlx-vlm
- MLX (Apple Machine Learning Research): https://github.com/ml-explore/mlx
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
