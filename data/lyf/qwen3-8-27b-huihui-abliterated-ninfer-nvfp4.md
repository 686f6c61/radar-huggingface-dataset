# lyf/Qwen3.8-27B-Huihui-Abliterated-NInfer-NVFP4

## Resumen

El modelo `lyf/Qwen3.8-27B-Huihui-Abliterated-NInfer-NVFP4` es un artefacto cuantizado y empaquetado para el runtime NInfer, derivado del checkpoint `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez es una variante "abliterated" del Qwen3.8-27B de Alibaba. El autor, identificado como `lyf`, ha aplicado una asignación de precisión mixta FP8 + NVFP4 sobre los tensores del transformer, manteniendo en BF16 las normas, embeddings, la torre de visión y los tensores MTP (multi-token prediction) provenientes del mismo checkpoint fuente. El resultado es un fichero de 21,49 GB lógicos que se ejecuta sobre GPUs Blackwell (SM120), específicamente probado en una RTX 5090 a 450 W.

El modelo conserva la naturaleza multimodal (image-text-to-text) del Qwen3.8-27B, con soporte de visión, modo de razonamiento (thinking), decodificación especulativa mediante MTP y una ventana de contexto que el runtime configura hasta 212.992 tokens. La variante "abliterated" implica que se han eliminado o atenuado direcciones de rechazo en el espacio de activaciones, lo que cambia el comportamiento del modelo ante ciertas peticiones.

Este artefacto no es un modelo entrenado desde cero ni un fine-tuning: es una distribución de pesos cuantizados con un formato propietario (`.ninfer`) que requiere un runtime concreto (NInfer) compilado contra una revisión específica. Su relevancia radica en que demuestra la viabilidad de servir un modelo de 27B multimodales con contexto largo en hardware de consumo Blackwell, a costa de atarse a un stack de inferencia muy específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con MTP; basado en Qwen3.8-27B |
| Parametros totales | 27B (heredados del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 212.992 tokens configurados en el runtime de referencia |
| Tipos de cuantizacion | FP8 + NVFP4 en precisión mixta; BF16 en normas, embeddings, torre de visión y tensores MTP |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | `.ninfer` (contenedor propietario NInfer); no safetensors ni GGUF |
| Tamano del repo | 43,0 GB (dos artefactos: v2 y v3) |
| Tamano logico del artefacto v3 | 21,49 GB |
| Tensores | 1.118 codificaciones de tensor preservadas |
| Runtime requerido | NInfer (revisiones `a99407c...` para v2 y `4de9e425...` para v3) |
| Hardware objetivo | NVIDIA Blackwell SM120 (probado en RTX 5090) |
| Precision KV cache | fp8 (configurable en el runtime) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.8-27B: un transformer multimodal que procesa entradas de imagen y texto, con una torre de visión dedicada y capacidad de razonamiento explícito. El artefacto incorpora además tensores MTP (multi-token prediction), que el runtime explota para decodificación especulativa con `--spec mtp --draft-tokens 3`. La cuantización aplicada por NInfer asigna FP8 y NVFP4 a distintas partes del modelo según un perfil fijo, mientras que las normas, los embeddings, la torre de visión y los tensores MTP se mantienen en BF16 para preservar estabilidad numérica.

No se dispone de información sobre el entrenamiento original del Qwen3.8-27B (número de tokens, composición del dataset, fases de RLHF/DPO) en la información proporcionada. Tampoco se documenta el proceso de "abliteration" aplicado por Huihui más allá de su denominación. La model card aclara que la conversión legacy contenía etiquetas de repositorio de Qwen/unsloth codificadas de forma incorrecta, aunque las rutas de origen reales apuntaban a Huihui; el manifiesto de construcción (`BUILD_MANIFEST.json`) registra la revisión real `d42ca8978c5a66e92c3446d46e8adfe03ef692ff`. La release v3 se deriva del artefacto legacy publicado con verificación exacta del payload, sin introducir pesos oficiales de Qwen.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" separado, preservado mediante `--preserve-thinking`.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con torre de visión en BF16.
- Generación de código, validada en las pruebas de humo del autor (195 tok/s con 256 tokens de salida).
- Tool calling: la validación v3 incluye comprobaciones de "required tool calling" y de JSON Schema.
- Soporte de APIs compatibles: OpenAI Responses y Anthropic Messages, además de SSE.
- Decodificación especulativa mediante MTP con 3 tokens de borrador.
- Contexto largo: se probó una recuperación sintética con 204.042 tokens de prompt.
- Multilingüe limitado a inglés y chino según los metadatos del modelo.
- Concurrencia: el runtime gestiona cuatro peticiones simultáneas con KV cache compartida.

## Casos de uso

- Asistencia conversacional de contexto largo: con hasta 212.992 tokens configurados, el modelo puede mantener conversaciones multi-turno sobre documentación extensa o historiales completos, aunque la validación de calidad en contexto largo se limita a un fixture sintético de recuperación.
- Análisis de documentos con imágenes: al ser image-text-to-text, permite extraer información de capturas, diagramas o páginas escaneadas combinadas con instrucciones textuales, usando la torre de visión en BF16.
- Generación de código en local: el rendimiento medido de 195 tok/s en salida de código sobre una RTX 5090 lo hace viable para autocompletado y generación en estaciones de trabajo con GPU Blackwell.
- Automatización con tool calling: la validación de JSON Schema y de tool calling requerido permite integrarlo en pipelines de agentes que invocan funciones externas.
- Investigación sobre modelos "abliterated": útil para estudiar el efecto de la eliminación de direcciones de rechazo en el comportamiento del modelo, con la advertencia de que esto reduce las salvaguardas.
- Despliegue de bajo coste en hardware de consumo: sustituye a configuraciones multi-GPU para un 27B multimodal, a cambio de depender de un runtime específico.
- Prototipado de agentes multi-paso: el modo thinking y la decodificación especulativa permiten cadenas de razonamiento con latencia contenida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas mediciones son pruebas de humo del autor sobre el runtime v3:

| Prueba | Resultado |
|---|---|
| Recuperación en contexto largo (204.042 tokens de prompt) | prefill 47,75 s; 4.273 tok/s; sin OOM |
| Decodificación en chino (256 tokens) | 145 tok/s |
| Decodificación en código (256 tokens) | 195 tok/s |
| Decodificación con visión (165 tokens) | 176 tok/s |
| Concurrencia | 4 peticiones simultáneas de 1.555 tokens de prompt + 512 de salida, servidor estable |

El autor advierte que son mediciones de humo con una sola semilla, que las salidas de texto y código se truncaron a 256 tokens y que no constituyen una comparación A/B ni una evaluación de calidad del modelo.

## Requisitos de hardware

- VRAM estimada: el artefacto v3 ocupa 21,49 GB lógicos; con KV cache en FP8 y capacidad automática, se requiere una GPU con al menos 24 GB para contextos moderados, y más para contextos cercanos a 212.992 tokens.
- GPU probada: NVIDIA RTX 5090 (Blackwell, SM120) a 450 W de límite de potencia.
- Arquitectura requerida: SM120 (Blackwell). El artefacto v2 se compila con `-DCMAKE_CUDA_ARCHITECTURES=120a`; no hay soporte documentado para GPUs Ampere, Ada o Hopper.
- No cabe en GPUs de consumo anteriores a Blackwell según la información disponible.
- Despliegue: exclusivamente mediante el runtime NInfer (compilado con CMake y Ninja, CUDA 13.1 en Linux). No hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: 4.273 tok/s en prefill y 145-195 tok/s en decodificación según el tipo de contenido.
- Concurrencia: 4 carriles con KV cache compartida; cuatro carriles no implican cuatro contextos simultáneos de 212.992 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| Este artefacto (Qwen3.8-27B Huihui NInfer NVFP4) | 27B | hasta 212.992 | `.ninfer` | apache-2.0 | NInfer (SM120) |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | no disponible | safetensors (BF16) | no disponible | transformers, vLLM, etc. |
| Qwen3.8-27B (oficial) | 27B | no disponible | safetensors | no disponible | transformers, vLLM, etc. |

La comparación con alternativas de cuantización estándar (GGUF Q4/Q8, AWQ, GPTQ) no está disponible en la información proporcionada, ya que este artefacto usa un contenedor propietario y un runtime específico que no son intercambiables con el ecosistema habitual.

## Limitaciones y advertencias

- La variante "abliterated" elimina o atenúa las direcciones de rechazo, lo que reduce las salvaguardas del modelo y aumenta el riesgo de generar contenido inapropiado. No es adecuado para producción orientada al público sin filtros externos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- La validación de contexto largo se basa en un único fixture sintético de recuperación, no en una evaluación amplia de calidad en contextos extensos.
- Dependencia total del runtime NInfer: el artefacto v3 requiere la revisión `4de9e425...` y el v2 la revisión `a99407c...`; el runtime está fijado antes de la regresión de contexto reportada en el issue #414, lo que no garantiza ausencia de otros errores.
- El runtime no soporta `--lm-head-draft` ni `--spec dflash2` con este artefacto.
- La licencia apache-2.0 se hereda del modelo base, pero el uso comercial debe verificar las condiciones del checkpoint Huihui y del Qwen3.8-27B original.
- El artefacto legacy contiene un `conversion.json` con etiquetas de repositorio incorrectas (Qwen/unsloth) pese a derivar de Huihui; la procedencia real está en `BUILD_MANIFEST.json`.
- El tamaño del repo (43 GB) incluye dos artefactos; descargar el repositorio completo duplica el almacenamiento innecesariamente.
- Las mediciones de rendimiento son pruebas de humo con una sola semilla y salidas truncadas, no benchmarks reproducibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lyf/Qwen3.8-27B-Huihui-Abliterated-NInfer-NVFP4
- Modelo base (Huihui abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Repositorio del runtime NInfer: https://github.com/Neroued/ninfer
- Issue de regresión de contexto en NInfer: https://github.com/Neroued/ninfer/issues/414
- Licencia del modelo Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
