# gpustack/DaisyRose-27B-MLX-4bit-dynamic

## Resumen

DaisyRose-27B-MLX-4bit-dynamic es una cuantizacion de 4 bits dinamica, calibrada con AWQ y empaquetada en formato MLX nativo, del modelo multimodal RadixArk/DaisyRose-27B, que a su vez se construye sobre la arquitectura Qwen3.8-27B. Lo publica el equipo de gpustack y esta disenado especificamente para ejecucion en Apple Silicon mediante las librerias mlx-lm y mlx-vlm, tanto en modo texto como en modo imagen-texto.

El modelo resuelve el problema de desplegar un modelo multimodal de 27.781 millones de parametros en hardware de Apple con memoria unificada limitada, reduciendo los pesos a aproximadamente 17,27 GiB distribuidos en cuatro shards. La cuantizacion no es uniforme: aplica precisiones mixtas por modulo (8 bits para embeddings y proyecciones de atencion lineal GDN, 6 bits para atencion y capas MLP extremas, 4 bits para el interior de las MLP) y preserva intacto en BF16 el codificador visual y las normas RMS.

Es relevante porque combina tres elementos poco habituales en una sola ficha: cuantizacion AWQ calibrada offline, herencia de un modelo base con cabeza de prediccion multi-token (MTP) y soporte multimodal completo en MLX. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal GDN (Gated DeltaNet) y atencion completa, mas torre visual multimodal y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4-bit dinamico con grupo de 64 y precisiones mixtas: Q8G64, Q6G64, Q4G64 y BF16 preservado |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 4 shards, ~17,27 GiB |

## Arquitectura y entrenamiento

El modelo base RadixArk/DaisyRose-27B se construye sobre Qwen3.8-27B e incorpora una arquitectura hibrida que combina capas de atencion lineal GDN (Gated DeltaNet, con proyecciones `linear_attn.in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b` y `out_proj`) con capas de atencion completa clasica (`self_attn.{q,k,v,o}_proj`). Dispone de 64 capas (`layers.0` a `layers.63`), un codificador visual (`model.visual.*`) para entrada imagen-texto y una cabeza de prediccion multi-token (`mtp.*`) de una capa que se conserva en la cuantizacion. Los detalles sobre el dataset de entrenamiento, el numero de tokens y el proceso de alineacion (RLHF/DPO) del modelo original no estan disponibles en la informacion proporcionada.

La innovacion tecnica de esta version reside en la cuantizacion: se aplica AWQ (activation-aware weight quantization) con calibracion offline sobre 256 muestras de `bartowski-v3` con `seq_len = 1024`, calibrando 128 de 128 grupos RMSNorm y obteniendo un `mean_alpha = 0.3887`, sin anadir operaciones en tiempo de ejecucion. El empaquetado usa el modo affine estandar de MLX con `group_size = 64` y sobrescrituras de precision por modulo en `config.json`: 98 modulos en 8 bits (embeddings, `lm_head`, `in_proj_a`, `in_proj_b`), 123 modulos en 6 bits (todas las proyecciones de atencion, `out_proj` lineal, MLP de la primera y ultima capa, y la cabeza MTP), 285 modulos en 4 bits (MLP interiores de las capas 1 a 62, `in_proj_qkv`, `in_proj_z` y MLP de la capa MTP) y 693 tensores preservados en BF16 (codificador visual, todas las RMSNorm del backbone y de MTP, `A_log`, `dt_bias` y `conv1d.weight`).

## Capacidades

- Generacion de texto conversacional y de instrucciones en modo chat.
- Razonamiento multimodal imagen-texto: descripcion de imagenes, respuesta a preguntas visuales y tareas de image-text-to-text.
- Procesamiento de imagenes mediante el codificador visual preservado en BF16, lo que mantiene la calidad de la representacion visual frente a la cuantizacion del backbone.
- Prediccion multi-token (MTP) heredada del modelo base, util para decodificacion especulativa y generacion acelerada.
- Capacidades de agente y tool calling: las etiquetas del modelo incluyen `agent`, aunque no se detalla el formato de llamada a herramientas.
- Soporte de cuantizacion mixta con precisiones por modulo, lo que permite equilibrar calidad y memoria.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente multimodal local en Mac: ejecutar el modelo con mlx-vlm sobre un Mac con memoria unificada suficiente para responder preguntas sobre capturas de pantalla, diagramas o fotografias sin enviar datos a la nube.
- Descripcion automatica de imagenes en flujos de accesibilidad: generar texto alternativo para catalogos de imagenes aprovechando el codificador visual en BF16 y la ventana de contexto del backbone.
- Agente de escritorio con tool calling: integrar el modelo como cerebro de un agente que inspecciona archivos, ejecuta comandos y razona sobre resultados, usando la cabeza MTP para acelerar la generacion de pasos intermedios.
- Generacion de codigo en local: el modelo hereda las capacidades de codigo de la familia Qwen3.8 y puede usarse con mlx-lm para autocompletar scripts, como muestra el ejemplo de la model card con un script bash para comprobar puertos abiertos.
- Prototipado de pipelines RAG multimodales: combinar la entrada de imagen y texto con recuperacion documental para responder preguntas sobre manuales tecnicos escaneados en un entorno de desarrollo sobre Apple Silicon.
- Evaluacion e investigacion de cuantizacion: servir como referencia para estudiar el impacto de AWQ con precisiones mixtas (8/6/4 bits) frente al modelo BF16 original en tareas de vision y lenguaje.
- Despliegue de bajo consumo en estaciones de trabajo Mac: sustituir inferencia en GPU dedicada por inferencia MLX en equipos con memoria unificada, reduciendo el consumo energetico en entornos de oficina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 17,27 GiB solo para pesos; hay que anadir la cache KV y el overhead de MLX, por lo que se recomienda un minimo de 24 GB de memoria unificada y, para contextos largos, 32 GB o mas.
- Hardware objetivo: Apple Silicon (series M1, M2, M3 y M4, con preferencia por variantes Pro, Max y Ultra por su mayor ancho de banda de memoria).
- GPU dedicadas: no aplica de forma nativa; el formato MLX esta pensado para Metal en Apple Silicon. Para CUDA seria necesario reconvertir los pesos a otro formato (no incluido en este repositorio).
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada de 24 GB o superior; no esta pensado para GPUs NVIDIA consumer en su formato actual.
- Opciones de despliegue: `mlx-lm` para texto y `mlx-vlm` para multimodal, ambas instalables via pip. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| gpustack/DaisyRose-27B-MLX-4bit-dynamic | 27,78 mil millones | no disponible | imagen-texto | Apache-2.0 | MLX safetensors 4-bit mixto |
| RadixArk/DaisyRose-27B (base) | 27,78 mil millones | no disponible | imagen-texto | Apache-2.0 | safetensors BF16 |
| Qwen3.8-27B (familia base) | no disponible | no disponible | texto (segun familia) | no disponible | no disponible |

La comparativa se limita al modelo base y a la familia Qwen3.8 porque no se han proporcionado datos de benchmarks ni especificaciones de modelos alternativos de la misma categoria en la informacion disponible.

## Limitaciones y advertencias

- La cuantizacion a 4 bits en el interior de las MLP puede degradar ligeramente la calidad frente al modelo BF16 original; no se han publicado evaluaciones cuantitativas de esa perdida.
- El modelo esta empaquetado exclusivamente en formato MLX; no es directamente usable en CUDA, ROCm ni CPU sin reconversion.
- No se dispone de informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad del modelo base.
- Riesgo de alucinacion inherente a los modelos generativos de este tamano; no hay datos especificos de mitigacion.
- Idiomas soportados no documentados; el rendimiento fuera del ingles y el chino (idiomas habituales de la familia Qwen) es incierto.
- Longitud de contexto no documentada, lo que complica planificar despliegues con ventanas largas.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base RadixArk/DaisyRose-27B y de la familia Qwen3.8 por si hubiera terminos adicionales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gpustack/DaisyRose-27B-MLX-4bit-dynamic
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Libreria mlx-lm: no disponible en la informacion proporcionada
- Libreria mlx-vlm: no disponible en la informacion proporcionada
