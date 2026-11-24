# scottlowry/Qwen3.8-27B-oQ6e-mtp

## Resumen

Qwen3.8-27B-oQ6e-mtp es una cuantización mixta del modelo Qwen/Qwen3.8-27B, publicada por el usuario scottlowry en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión de precisión reducida pensada para su ejecución en Apple Silicon mediante la librería MLX. El checkpoint conserva la arquitectura original del modelo base (identificada en los tags como qwen3_5) e incorpora una cabeza MTP (multi-token prediction) que ocupa 0,425 mil millones de parámetros adicionales.

El interés de esta ficha reside en el formato: frente a las cuantizaciones uniformes de 4 u 8 bits, aquí se aplica una asignación de precisión por capas con oQ (oMLX v0.7.4.dev1), que deja el grueso de los pesos en 6 bits afines con grupo de 64 y reserva 8 bits y BF16 para un subconjunto reducido de tensores sensibles. El resultado es un peso efectivo medio de 6,872 bits por parámetro y un repositorio de 23,9 GB, lo que sitúa el modelo en el rango de memoria unificada de un Mac con 32 GB o más.

La relevancia es práctica: permite ejecutar un modelo de 27.781 millones de parámetros en hardware de consumo Apple con una pérdida de precisión teóricamente menor que una cuantización 6-bit homogénea. No hay información publicada sobre licencia, idiomas ni pipeline en la ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5, segun tags), con cabeza MTP |
| Parametros totales | 27.781.427.952 (27,781 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 6-bit grupo 64 (24,543B), affine 8-bit grupo 64 (2,722B), BF16 (0,516B); media efectiva 6,872 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx) |
| Tamano del repositorio | 23,9 GB (22,226 GiB de tensores) |
| Desglose de almacenamiento | LM: 26,896B / 20,979 GiB; vision: 0,461B / 0,858 GiB; cabeza MTP: 0,425B / 0,389 GiB |
| Modelo base | Qwen/Qwen3.8-27B |
| Herramienta de cuantizacion | oQ (oMLX v0.7.4.dev1) |
| Descargas / likes | 368 / 5 |
| Fecha de creacion / actualizacion | 2026-08-14 / 2026-11-11 |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Qwen/Qwen3.8-27B, etiquetada como qwen3_5 en los metadatos. La composicion por componentes revela tres bloques diferenciados: un modelo de lenguaje de 26,896 mil millones de parametros, un codificador visual de 0,461 mil millones y una cabeza de prediccion multi-token (MTP) de 0,425 mil millones. La presencia del bloque de vision confirma que el modelo base es multimodal; la cabeza MTP habilita decodificacion especulativa interna, prediciendo varios tokens por paso para acelerar la generacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base paso por RLHF, DPO u otras fases de alineamiento. El autor de esta publicacion no ha entrenado el modelo: su aportacion es exclusivamente la cuantizacion. La innovacion tecnica documentada es la asignacion mixta de precision: un 88,345% de los pesos logicos se almacena en 6 bits afines con grupo de 64 (6,50 bits efectivos), un 9,798% en 8 bits (8,50 bits efectivos) y un 1,857% se mantiene en BF16 (16 bits). Este ultimo grupo, de solo 0,516 mil millones de parametros, corresponde presumiblemente a tensores especialmente sensibles a la cuantizacion, aunque el autor no detalla el criterio de seleccion. La actualizacion del 11 de noviembre de 2026 indica una recuantizacion con oMLX v0.7.4.dev1, por lo que las copias anteriores deben descartarse.

## Capacidades

- Generacion de texto y razonamiento en el mismo rango que el modelo base Qwen3.8-27B, sin datos publicados especificos de esta cuantizacion.
- Procesamiento de imagen: el checkpoint incluye un bloque de vision de 0,461 mil millones de parametros, por lo que conserva capacidad multimodal.
- Decodificacion especulativa mediante la cabeza MTP, que predice multiples tokens por paso para reducir latencia.
- Ejecucion nativa en MLX sobre Apple Silicon, con soporte de cuantizacion afine por grupos.
- Capacidades de tool calling, agentes y multilingues: no disponibles en la informacion proporcionada; dependen del modelo base y no se documentan aqui.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac: el formato MLX y los 22,226 GiB de tensores permiten cargar el modelo en un Mac Studio o MacBook Pro con memoria unificada de 32 GB o superior, sin GPU dedicada.
- Prototipado de asistentes multimodales: el bloque de vision integrado permite experimentar con consultas sobre imagenes en local antes de migrar a un despliegue en servidor.
- Evaluacion de cuantizacion: util para comparar la perdida de calidad de una asignacion mixta de 6,872 bits frente a una cuantizacion uniforme del mismo modelo base, midiendo perplejidad y tareas de razonamiento.
- Generacion de codigo en local: un modelo de 27,8 mil millones con contexto presumiblemente amplio sirve para autocompletado y refactorizacion en entornos sin conexion, siempre que se validen los resultados.
- Investigacion sobre decodificacion especulativa: la cabeza MTP permite estudiar el impacto de la prediccion multi-token en throughput y aceptacion de tokens en hardware Apple.
- Despliegue de bajo coste en pequenos equipos: al no requerir GPU de datacenter, encaja en flujos de trabajo de desarrollo individual, docencia o demos internas donde el presupuesto de hardware es limitado.
- Fine-tuning ligero o adaptadores: al estar en safetensors y MLX, puede servir de base para LoRA sobre el modelo cuantizado, aunque la cuantizacion complica el entrenamiento y conviene verificar compatibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta la distribucion de bits y el tamano de almacenamiento, sin metricas de calidad (MMLU, HumanEval, GSM8K u otras) ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM/memoria unificada: aproximadamente 22,2 GiB para los pesos en el formato actual; con overhead de ejecucion (KV cache, buffers de MLX) conviene disponer de 32 GB o mas.
- GPU recomendadas: el formato es MLX, por lo que el hardware objetivo son los chips Apple M-series (M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max). No es un checkpoint para CUDA.
- GPU consumer: cabe en configuraciones de memoria unificada de 32 GB o 64 GB; en equipos de 16 GB o 24 GB no es viable sin una cuantizacion adicional mas agresiva.
- Opciones de despliegue: MLX y oMLX (herramienta con la que se genero el checkpoint). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no leen pesos MLX de forma nativa.
- Latencia y throughput: no disponibles; dependen del chip, del ancho de banda de memoria y del uso de la cabeza MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-oQ6e-mtp | 27,781B | no disponible | Mixta 6/8/BF16 (6,872 bits/peso) | safetensors MLX | no disponible | Hugging Face, 368 descargas |
| Qwen/Qwen3.8-27B (base) | 27,781B | no disponible | BF16 original | safetensors | no disponible | Hugging Face (referencia) |
| Otras cuantizaciones MLX del mismo base | 27,781B | no disponible | 4-bit u 8-bit uniforme | safetensors MLX | no disponible | no disponible en la informacion |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de precision; el autor no publica evaluaciones que cuantifiquen la degradacion respecto al modelo base en BF16.
- La licencia no esta indicada en la ficha de Hugging Face, por lo que no puede confirmarse el uso comercial; debe consultarse la licencia del modelo base Qwen/Qwen3.8-27B antes de cualquier despliegue productivo.
- El checkpoint esta atado al ecosistema MLX y Apple Silicon; no es portable a CUDA sin una conversion previa.
- Riesgo de alucinacion y sesgos: no documentados para esta cuantizacion; se heredan del modelo base y no pueden evaluarse sin sus datos.
- Idiomas soportados no declarados; no hay garantia documentada de calidad multilingue.
- El repositorio se actualizo el 11 de noviembre de 2026 con una recuantizacion; versiones anteriores pueden diferir en pesos y calidad, por lo que conviene fijar el commit o la revision concreta.
- Solo 5 likes y 368 descargas: la validacion comunitaria es escasa, lo que reduce la confianza en la reproducibilidad de resultados.
- No se documenta el criterio de seleccion de los tensores mantenidos en BF16 ni en 8 bits, lo que dificulta auditar la cuantizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scottlowry/Qwen3.8-27B-oQ6e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Repositorio MLX: no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo base: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
