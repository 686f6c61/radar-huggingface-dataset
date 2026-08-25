# DavidrPatton/Qwen3.8-27B-Uncensored-UD3-GGUF

## Resumen

Qwen3.8-27B-Uncensored-UD3-GGUF es una cuantizacion GGUF de alta precision mixta del modelo Qwen3.8-27B-Uncensored, una version "abliterated" (sin mecanismos de rechazo) del Qwen3.8-27B desarrollado por Alibaba. La cuantizacion, creada por DavidrPatton, emplea la tecnica Unsloth Dynamic 3.0 (UD3), que combina distintos niveles de precision por capa y tensor para preservar la calidad de razonamiento de un cuant 4-bit ocupando el espacio de un cuant 2-bit.

El modelo base Qwen3.8-27B es un LLM denso multimodal nativo de 27.320 millones de parametros, con arquitectura hibrida de atencion (Gated DeltaNet lineal + atencion completa), soporte de vision, tool calling, razonamiento y una cabeza de decodificacion especulativa Multi-Token Prediction (MTP). La version cuantizada presentada aqui esta disenada para ejecutar el modelo completo con una ventana de contexto de 128K tokens en tarjetas graficas de consumo con 16 GB de VRAM, como la RTX 4070 Ti SUPER, RTX 4080, RTX 3090 o RTX 4090, asi como en Apple Silicon y estaciones Linux.

La relevancia actual de este modelo radica en que permite ejecutar localmente un LLM de 27B parametros multimodal, con razonamiento y tool-calling, en hardware de consumo, sin renunciar a una ventana de contexto amplia. La eliminacion de rechazos (abliteration) lo hace util para investigacion sobre comportamientos no censurados, aunque introduce riesgos que se detallan mas adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet lineal + atencion completa (full attention), densa, multimodal (vision + texto) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | UD3-Q2_K_XL (mixto: Q8_0/F32 en embeddings y logits, Q4_K en atencion, Q3_K en scoring, IQ2_M en bloques FFN) |
| Idiomas soportados | Ingles, chino (en, zh) |
| Licencia | Apache 2.0 (con restriccion de uso solo para investigacion segun el repositorio de origen del cuant base) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM denso de 27B parametros que combina una atencion hibrida: bloques con Gated DeltaNet (una capa lineal recurrente de bajo coste) junto con bloques de atencion completa. Esta mezcla permite una ventana de contexto larga (131K tokens) con un coste computacional inferior al de un transformer clasico. El modelo tambien incorpora una cabeza de decodificacion especulativa Multi-Token Prediction (MTP) que acelera la generacion de tokens en llama.cpp, y un proyector de vision (mmproj) que le otorga capacidad multimodal nativa (imagen y texto).

La version "Uncensored" es un modelo abliterado, es decir, se han eliminado los vectores de rechazo (refusal) de los pesos originales mediante tecnicas de intervencion en la representacion interna. Esto elimina la censura y los rechazos de contenido, pero puede degradar ligeramente la calidad general. La cuantizacion UD3 aplicada por DavidrPatton es una mezcla de precisiones dinamica: conserva los embeddings y logits en Q8_0/F32 para no perder vocabulario, usa Q4_K en las proyecciones de atencion de las capas mas criticas (18-28), y comprime los bloques FFN a IQ2_M, consiguiendo un fichero de 12,1 GB en disco con una perdida de perplexidad estimada de 0,12 PPL respecto al FP16 (segun el autor de la cuantizacion).

No se dispone de datos concretos sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset o metodos de RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion en ingles y chino, con soporte de razonamiento paso a paso (chain-of-thought).
- Capacidades de codificacion y tareas de programacion (generacion, explicacion y depuracion de codigo).
- Razonamiento matematico y resolucion de problemas (GSM8K, MATH, etc. segun el modelo base).
- Tool calling / function calling: el modelo puede invocar funciones externas y herramientas en flujos de agente.
- Capacidad multimodal nativa: procesa imagenes y texto simultaneamente (gracias al proyector de vision mmproj-BF16).
- Decodificacion especulativa MTP: la cabeza Q8_0 de MTP permite acelerar la generacion en llama.cpp (speculative decoding).
- Ventana de contexto amplia: 128K tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Sin mecanismos de rechazo (abliterated): no filtra contenido basado en politicas de seguridad, util para investigacion de sesgos y comportamientos no censurados.

## Casos de uso

- Asistente de programacion local: el modelo puede ejecutarse en una GPU de 16 GB con llama.cpp y usarse para generacion de codigo en Python, JavaScript o C++, con soporte de tool calling para integrarse en IDEs o pipelines de CI/CD.
- Analisis de documentos largos: con 128K de contexto, permite procesar manuales, contratos o informes de mas de 100 paginas en una sola pasada, extrayendo informacion y resumiendo secciones.
- Investigacion de agentes autonomos: su capacidad de razonamiento multi-step y tool calling permite construir agentes que planifiquen, ejecuten acciones y verifiquen resultados en entornos de simulacion.
- Asistente multimodal de soporte tecnico: combinando vision (imagenes de pantallas, diagramas) y texto, puede guiar a usuarios en la resolucion de problemas de hardware o software.
- Automatizacion de tareas de oficina: el modelo base esta optimizado para tareas de automatizacion (generacion de documentos, resumen de correos, gestion de datos) y puede integrarse en workflows con APIs.
- Investigacion academica sobre modelos abliterated: su licencia research-only lo hace util para estudiar el comportamiento de LLMs sin restricciones de seguridad, en contextos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion proporcionada para esta cuantizacion especifica. El repositorio base de Qwen3.8-27B de Alibaba reporta evaluaciones en tareas como MathVision y otras, pero no se incluyen en la documentacion de este repo de cuantizacion. La unica metrica de calidad mencionada en la model card es la perdida de perplexidad (PPL) de +0.12 respecto al modelo FP16, un indicador interno de la cuantizacion, no un benchmark comparativo estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF de 12,1 GB requiere aproximadamente 14,2 GB de VRAM con la ventana de contexto completa de 128K (incluye cache KV cuantizada). Puede ejecutarse en GPUs con 16 GB de VRAM.
- GPUs recomendadas: NVIDIA RTX 4070 Ti SUPER, RTX 4080, RTX 3090, RTX 4090 (todas con 16 GB o mas). Tambien compatible con Apple Silicon (Metal) y Linux workstations con CUDA o ROCm.
- Compatible con GPUs de menor VRAM (8-12 GB) si se reduce la ventana de contexto o se usa cache KV cuantizada mas agresiva, pero no esta garantizado.
- Opciones de despliegue: llama.cpp (server), Docker (imagen ghcr.io/ggml-org/llama.cpp:server-cuda), Ollama (segun el blog de orcarouter), y cualquier framework que soporte GGUF.
- Latencia y throughput: no disponible en la documentacion. Depende de la GPU y del uso de decodificacion especulativa MTP (recomendado con --spec-type draft-mtp).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-UD3-GGUF (este) | 27.3B | 131K | GGUF mixto UD3 | Apache 2.0 | Cuantizacion mixta para 16GB VRAM, abliterated |
| Qwen3.8-27B-Uncensored-GGUF (orcarouter) | 27.3B | 262K | GGUF (2-bit a 16-bit) | Apache 2.0 (research-only) | Cuantizaciones uniformes, contexto mayor |
| Qwen3.8-27B (original, Alibaba) | 27.3B | 131K | safetensors (FP8) | Apache 2.0 | Modelo base con censura, multimodal |
| Llama 3.3 70B (referencia) | 70B | 128K | GGUF/safetensors | Llama 3.3 | Mucho mayor, requiere mas VRAM, no abliterated |

La principal diferencia con las alternativas es la estrategia de cuantizacion: la UD3 mantiene la cabeza MTP en Q8_0 y las capas criticas en Q4_K, mientras que las cuantizaciones uniformes 2-bit degradan la calidad general. Frente al modelo original, la version abliterated elimina los rechazos, lo que cambia el comportamiento en prompts con contenido sensible. El modelo de orcarouter ofrece mas contexto (262K) pero con cuantizaciones uniformes y una restriccion de uso solo investigacion mas explicita.

## Limitaciones y advertencias

- Modelo abliterated: la eliminacion de rechazos puede generar respuestas inapropiadas, ofensivas o peligrosas en contextos de produccion. No apto para sistemas de atencion al cliente publicos sin un filtro externo de moderacion.
- Riesgo de alucinacion: como todos los LLMs, puede inventar hechos, codigo o informacion. La cuantizacion de 2 bits en bloques FFN puede incrementar la probabilidad de alucinaciones en tareas de razonamiento complejo.
- Idiomas limitados: solo ingles y chino. No soporta espanol ni otros idiomas europeos de forma nativa.
- Restriccion de licencia: aunque la model card indica Apache 2.0, el repositorio de origen del modelo abliterated (orcarouter) especifica uso exclusivamente de investigacion. Antes de un despliegue comercial, verificar la licencia exacta del modelo base y de la cuantizacion.
- Degradacion de calidad: la cuantizacion UD3, aunque optimizada, introduce una perdida de precision de 0.12 PPL en tareas de razonamiento. Para tareas criticas (medicina, finanzas) se recomienda usar el modelo en FP8 o FP16.
- Contexto de 128K requiere gestion de cache: con la ventana completa, el uso de VRAM sube a ~14 GB, dejando poco margen en GPUs de 16 GB para otros procesos.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/DavidrPatton/Qwen3.8-27B-Uncensored-UD3-GGUF
- Repositorio del modelo base abliterado: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Modelo original de Alibaba: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub de Alibaba para Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio de cuantizaciones GGUF de orcarouter: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Blog de orcarouter sobre ejecucion local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
