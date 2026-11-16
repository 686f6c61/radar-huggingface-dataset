# mradermacher/KangalKhan-HardRuby-7B-GGUF

## Resumen

KangalKhan-HardRuby-7B-GGUF es la distribucion en formato GGUF del modelo KangalKhan-HardRuby-7B, un merge de modelos de 7B de parametros creado por Yuma42 mediante mergekit y la tecnica lazymergekit. Esta version concreta la publica mradermacher, un conocido quantizador de la comunidad de Hugging Face, que ofrece los pesos originales convertidos a GGUF para su uso con llama.cpp, Ollama y otras herramientas de inferencia local. El modelo combina dos variantes de la familia KangalKhan: KangalKhan-Ruby-7B-Fixed y KangalKhan-RawRuby-7B, ambas de 7B de parametros.

El modelo resuelve el problema de disponer de un checkpoint conversacional de 7B en formato GGUF listo para ejecutarse en hardware de consumo, sin necesidad de infraestructura de GPU de datacenter. Al tratarse de un merge, su interes principal es la experimentacion con tecnicas de model merging y la disponibilidad de pesos ligeros en cuantizaciones que van desde 2,8 GB (Q2_K) hasta 14,6 GB (f16), lo que permite desplegarlo en un rango amplio de equipos.

La relevancia actual del modelo es limitada: se publico en diciembre de 2024 y acumula 60 descargas y 0 likes, lo que indica una adopcion muy baja. No dispone de model card detallada con datos de entrenamiento, benchmarks ni contexto, y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas. Es, por tanto, un modelo de nicho para pruebas de merging y experimentacion local mas que una opcion de produccion contrastada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de transformers; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 7.241.748.480 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo original Yuma42/KangalKhan-HardRuby-7B) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge de dos checkpoints de 7B mediante mergekit y lazymergekit, segun las etiquetas de la model card. No se especifica la tecnica exacta de merge (SLERP, TIES, DARE, passthrough, etc.) ni los pesos relativos de cada modelo fuente. Los modelos de origen son Yuma42/KangalKhan-Ruby-7B-Fixed y Yuma42/KangalKhan-RawRuby-7B, ambos de la familia KangalKhan, presumiblemente derivados de una base comun de 7B (no confirmado en la informacion disponible).

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La model card de la version GGUF es exclusivamente la plantilla estandar de mradermacher para cuantizaciones estaticas, sin informacion adicional sobre el entrenamiento del modelo subyacente. Los cuants publicados son estaticos; no hay cuants ponderados ni imatrix disponibles en el momento de la publicacion, segun indica el propio autor.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` de la model card.
- Uso como modelo de chat multi-turno en formato transformers y GGUF.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere integracion con infraestructura de inferencia de Hugging Face.
- Capacidades de razonamiento, codigo o matematicas: no documentadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles; no se documentan otros idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Experimentacion con model merging: el modelo permite evaluar en local el resultado de combinar dos checkpoints de 7B, comparando su comportamiento conversacional con el de los modelos fuente en tareas de chat en ingles.
- Prototipado de asistentes conversacionales en ingles: con cuantizaciones Q4_K_M (4,5 GB) puede ejecutarse en un portatil con GPU de 8 GB para validar flujos de conversacion antes de invertir en modelos mayores.
- Pruebas de inferencia con llama.cpp y Ollama: al estar en GGUF, se integra directamente en estas herramientas para medir latencia y calidad en hardware de consumo, sin necesidad de convertir pesos.
- Evaluacion comparativa de cuantizaciones: la disponibilidad de 12 cuantizaciones distintas (de Q2_K a f16) permite estudiar la degradacion de calidad frente al tamano en un modelo de 7B concreto.
- Despliegue en entornos con recursos limitados: la cuantizacion Q2_K (2,8 GB) permite ejecutar el modelo en CPU o en GPUs con poca VRAM para tareas de generacion de texto no criticas.
- Base para fine-tuning ligero: los pesos safetensors del modelo original (7.241.748.480 parametros) pueden servir como punto de partida para experimentos de ajuste con LoRA en ingles, aunque no hay garantias documentadas de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB con Q2_K, 4,5 GB con Q4_K_M, 5,2 GB con Q5_K_M, 6 GB con Q6_K, 7,8 GB con Q8_0 y 14,6 GB con f16 (tamanos de archivo indicados por el autor; la VRAM real depende del contexto y del backend).
- GPU recomendadas: no disponibles de forma especifica; por tamano, cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 3070, RTX 4070) puede ejecutar cuantizaciones Q4 y Q5. Para f16 se recomienda una GPU con 16 GB o mas (RTX 4080, RTX 4090, A100).
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 8 GB o mas usando cuantizaciones Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo original en safetensors es compatible con transformers y, presumiblemente, con vLLM y TGI (no confirmado en la informacion disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KangalKhan-HardRuby-7B-GGUF | 7,24B | no disponible | Apache 2.0 | GGUF | Merge de dos KangalKhan de 7B; 60 descargas; sin benchmarks |
| Yuma42/KangalKhan-Ruby-7B-Fixed | no disponible | no disponible | no disponible | safetensors | Modelo fuente del merge |
| Yuma42/KangalKhan-RawRuby-7B | no disponible | no disponible | no disponible | safetensors | Modelo fuente del merge |
| Mistral-7B-Instruct (referencia de categoria) | 7,24B | 32k (segun version) | Apache 2.0 | safetensors, GGUF | Modelo base ampliamente usado; benchmarks publicos disponibles |

La comparativa con alternativas de la misma categoria es limitada porque no se dispone de datos de contexto, rendimiento ni benchmarks del modelo evaluado. Los modelos fuente del merge no publican especificaciones en la informacion proporcionada. Mistral-7B-Instruct se incluye como referencia de categoria por tamano y licencia, pero no se ha verificado que KangalKhan-HardRuby derive de el.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un merge de modelos entrenados presumiblemente en ingles, es probable que herede sesgos de sus fuentes, pero no hay informacion que lo confirme.
- Riesgo de alucinacion: no evaluado; no hay benchmarks ni evaluaciones de fidelidad publicadas.
- Limitaciones de contexto o idioma: solo se declara soporte de ingles; la longitud de contexto no esta documentada, lo que impide planificar su uso en tareas de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se desconoce si los modelos fuente del merge imponen condiciones adicionales; conviene verificar las licencias de Yuma42/KangalKhan-Ruby-7B-Fixed y Yuma42/KangalKhan-RawRuby-7B antes de un despliegue comercial.
- Adopcion muy baja (60 descargas, 0 likes) y ausencia de model card detallada: no hay evidencia de calidad en produccion ni de mantenimiento activo.
- Los cuants publicados son estaticos; no hay cuants imatrix ni ponderados, lo que puede suponer una perdida de calidad mayor en cuantizaciones bajas (Q2_K, Q3_K) frente a alternativas con imatrix.
- El modelo no documenta soporte de tool calling, agentes ni capacidades multimodales, por lo que no es adecuado para pipelines que requieran estas funciones sin validacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/KangalKhan-HardRuby-7B-GGUF
- Modelo base (safetensors): https://huggingface.co/Yuma42/KangalKhan-HardRuby-7B
- Modelo fuente del merge: https://huggingface.co/Yuma42/KangalKhan-Ruby-7B-Fixed
- Modelo fuente del merge: https://huggingface.co/Yuma42/KangalKhan-RawRuby-7B
- Pagina de resumen y descargas del quantizador: https://hf.tst.eu/model#KangalKhan-HardRuby-7B-GGUF
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
