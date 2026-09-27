# derikn/Qwen3.8-27B-AWQ-INT4

## Resumen

derikn/Qwen3.8-27B-AWQ-INT4 es una cuantización comunitaria de 4 bits del modelo Qwen/Qwen3.8-27B, publicada por el usuario `derikn` y construida con AutoRound de Intel. No es un modelo nuevo: se trata de una conversión de pesos a AWQ W4A16 (solo pesos, 4 bits, grupo 128, simétrico, versión `gemm`) manteniendo en bfloat16 el `lm_head`, la torre de visión, la cabeza MTP, las proyecciones de atención lineal y el merger visual. El checkpoint conserva los 27.781.427.952 parámetros del modelo base y su ventana de contexto de 262.144 tokens.

El modelo base es un LLM denso multimodal nativo (texto e imagen) de la familia Qwen3.8, construido sobre la arquitectura de Qwen3.5, orientado a código, flujos agénticos y automatización de oficina. Esta cuantización resulta relevante porque reduce el peso en disco a 19,6 GB y permite servir el modelo completo, con visión y contexto de 256K, en hardware de gama profesional moderada: el autor lo probó en dos GPU Intel Arc Pro B70 con vLLM XPU y decodificación especulativa MTP.

La licencia es Apache 2.0, heredada del modelo base, y el formato de pesos es safetensors repartido en 7 shards más un fichero adicional para la cabeza MTP. La relevancia práctica del artefacto está en su receta de despliegue: no solo cuantiza, sino que documenta las exclusiones necesarias (`modules_to_not_convert`) para que el MTP y la visión sigan funcionando, algo que la cuantización automática rompería por defecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje), base Qwen3.5, con atención lineal y cabeza MTP (multi-token prediction) |
| Parámetros totales | 27.781.427.952 (27,78 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K), igual que el modelo base |
| Tipos de cuantización | AWQ W4A16 (solo pesos, 4 bits), group size 128, simétrico, versión `gemm`; 101 módulos excluidos y mantenidos en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (7 shards + `model_extra_tensors.safetensors` para la cabeza MTP) |
| Tamaño en disco | 19,6 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-27B (relación: `quantized`) |
| Método de cuantización | Intel AutoRound 0.15.1, exportación `auto_awq` |
| Dataset de calibración | NeelNanda/pile-10k (128 muestras de 1024 tokens, batch size 8) |

Nota sobre el recuento de parámetros: el panel de Safetensors de HuggingFace informa de 6.284.446.960 parámetros, pero ese dato corresponde al almacenamiento empaquetado (ocho pesos de 4 bits por tensor int32), no al número real de parámetros. El propio autor del checkpoint indica que la cifra correcta es 27.781.427.952.

## Arquitectura y entrenamiento

El modelo base es un transformer denso multimodal nativo: procesa texto e imagen con la misma pila, conserva la torre de visión y el procesador de imagen Qwen2VL, e incorpora proyecciones de atención lineal y una cabeza MTP (multi-token prediction) usada para decodificación especulativa. Sobre esta base, la cuantización aplica AutoRound 0.15.1 con exportación `auto_awq`: cuantización de solo pesos a 4 bits, grupo 128, simétrica y versión `gemm`. Los pesos se transmitieron en streaming a la GPU durante el ajuste para acotar el uso de VRAM, con `torch.compile` activado en el paso de tuning.

No hubo fine-tuning ni datos de entrenamiento adicionales: la única fuente de datos es la calibración con NeelNanda/pile-10k, 128 muestras de 1024 tokens. La innovación técnica relevante de este checkpoint es la lista de exclusión: 101 módulos permanecen en 16 bits, cubriendo `lm_head`, todas las proyecciones `linear_attn.in_proj_a` e `in_proj_b`, el merger visual, los bloques de visión y `mtp`. Esta exclusión no es opcional: si AutoRound cuantiza la cabeza MTP, vLLM la reconstruye como una capa lineal empaquetada de 4 bits y el modelo borrador falla al cargar con el error `ValueError: There is no module or parameter named 'fc.weight' in Qwen3_5MultiTokenPredictor`.

## Capacidades

- Generación de texto y razonamiento, con modo de pensamiento controlable mediante `enable_thinking` en la plantilla de chat.
- Control del esfuerzo de razonamiento con `reasoning_effort` (escala de OpenAI que vLLM reenvía a la plantilla) y `reasoning_preserve` para conservar el razonamiento.
- Tool calling y function calling: probado con el parser `qwen3_coder` y `--enable-auto-tool-choice`, con parser de razonamiento `qwen3`.
- Flujos agénticos multi-paso y tareas de horizonte largo, según la descripción del modelo base.
- Visión imagen-texto: la torre visual y el procesador de imagen Qwen2VL están intactos, de modo que las entradas de imagen funcionan. El pipeline declarado es `image-text-to-text`; el modelo base se describe como modelo que entiende imágenes y vídeo.
- Decodificación especulativa MTP con 3 tokens especulativos y en torno a un 70 % de aceptación del borrador en las pruebas del autor.
- Contexto largo de 262.144 tokens, servido en la configuración probada con caché KV en fp8 (`fp8_e4m3`) y prefix caching activado.
- Código y automatización de oficina: capacidades heredadas del modelo base, que se presenta orientado a coding, flujos agénticos y office automation.
- Capacidades multilingües: no disponible (el campo de idiomas de la ficha no está informado).

## Casos de uso

- Agentes autónomos multi-paso con herramientas: el modelo soporta tool calling con parser `qwen3_coder` y auto tool choice en vLLM, por lo que se puede conectar a APIs externas, ejecutar acciones encadenadas y mantener el estado de la tarea en una ventana de 256K tokens sin trocear el historial.
- Generación y revisión de código en pipelines de CI/CD: con parser de tool calling y modo thinking, se puede integrar como servicio OpenAI-compatible detrás de vLLM para generar parches, revisar diffs o resolver incidencias desde un runner interno.
- Análisis de documentos con componente visual: gracias a la torre de visión intacta, admite capturas de pantalla, diagramas, gráficos y páginas escaneadas, lo que permite extraer datos de informes o verificar interfaces en pruebas automatizadas.
- RAG sobre corpus extensos: la ventana de 262.144 tokens permite inyectar documentación técnica completa o expedientes largos junto con la pregunta, reduciendo la dependencia de recuperación fragmentada y usando prefix caching para abaratar consultas repetidas.
- Atención al cliente con conversaciones multi-turno largas: el contexto nativo de 256K y la caché KV en fp8 permiten mantener historiales extensos por sesión en servidores con memoria limitada, y el modo thinking se puede desactivar para respuestas de baja latencia.
- Asistente de automatización de oficina: generación de correos, resúmenes de actas y transformación de hojas de cálculo o presentaciones a partir de capturas, terreno en el que el modelo base se declara específicamente optimizado.
- Inferencia económica sobre hardware Intel: el caso de uso operativo documentado por el autor es servir el modelo con tensor parallelism 2 sobre dos Arc Pro B70 y vLLM XPU nightly, alternativa a GPU de datacenter para despliegues de 27B con visión.
- Reducción de latencia en producción con decodificación especulativa: activar la cabeza MTP retenida permite acelerar la generación con 3 tokens especulativos y un 70 % de aceptación, útil en servicios interactivos donde el tiempo hasta el primer token y el throughput por usuario importan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este checkpoint cuantizado. La model card remite expresamente a la ficha del modelo base para capacidades y resultados de evaluación, y el autor no incluye ninguna tabla de métricas propias ni medición de degradación por la cuantización de 4 bits. Las búsquedas web mencionan que el modelo base se evalúa en pruebas como MathVision con un prompt fijo de razonamiento paso a paso, pero no se proporcionan cifras.

Los únicos datos de rendimiento documentados son operativos, no de calidad:

| Métrica operativa | Valor |
|---|---|
| Aceptación del borrador MTP (3 tokens especulativos) | aproximadamente 70 % |
| Contexto servido en la prueba | 262.144 tokens |
| Caché KV | fp8 (`fp8_e4m3`) |
| Parallelismo | tensor parallel 2 |
| Tiempo de carga de la cabeza MTP con exclusión aplicada | menos de 1 segundo en el hardware probado |
| Throughput y latencia absolutos | no disponible |

## Requisitos de hardware

- Pesos en disco: 19,6 GB (7 shards safetensors más `model_extra_tensors.safetensors`).
- VRAM estimada para inferencia: los pesos ocupan aproximadamente 19,6 GB; a eso hay que sumar la caché KV, que con contexto de 256K y caché fp8 es el factor dominante. No se ha publicado una medición de VRAM total por configuración.
- GPU probadas por el autor: dos Intel Arc Pro B70 con tensor parallelism 2, `--gpu-memory-utilization 0.91` y contexto completo de 256K. No hay pruebas publicadas con otras GPU.
- GPU consumer: no hay validación publicada. Por tamaño de pesos (19,6 GB), encajarían en tarjetas de 24 GB como RTX 3090 o RTX 4090 si se limita la longitud de contexto, pero vLLM XPU y las rutas de ejecución AWQ en CUDA no han sido verificadas por el autor. No se puede confirmar su funcionamiento en GPU de 16 GB o menos.
- Software de despliegue: probado con vLLM XPU (`vllm/vllm-openai-xpu:nightly`, vLLM 0.30.1rc1) en formato OpenAI-compatible. El repositorio declara `library_name: transformers` y compatibilidad de endpoints. Compatibilidad con llama.cpp, Ollama o TGI: no disponible (el formato AWQ no es GGUF y no se documenta conversión).
- Requisitos de contenedor en Intel Arc: `--device=/dev/dri`, `--group-add` para los grupos render y video, `--ipc=host`, `--security-opt seccomp=unconfined` y `ZE_AFFINITY_MASK` apuntando a las tarjetas deseadas. Sin esa combinación, Level Zero informa de cero dispositivos.
- Latencia y throughput: no disponibles en cifras absolutas. El único dato es la tasa de aceptación del borrador MTP (aproximadamente 70 %).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| derikn/Qwen3.8-27B-AWQ-INT4 | 27,78 B (denso) | 262.144 tokens | AWQ W4A16, grupo 128, con MTP y visión en 16 bits | Apache 2.0 | HuggingFace, 0 descargas, 0 likes en el momento de la consulta |
| cyankiwi/Qwen3.8-27B-AWQ-INT4 | 27 B (denso, según la descripción del comparador) | 262.144 tokens | AWQ INT4, 21,02 GB según aimodels.fyi | Apache 2.0 | HuggingFace y ModelScope |
| Qwen/Qwen3.8-27B (base) | 27,78 B (denso) | 262.144 tokens | bfloat16 (sin cuantizar) | Apache 2.0 | HuggingFace, repositorio oficial de Alibaba |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada, por lo que la comparación se limita a formato, tamaño y licencia. La diferencia observable entre las dos cuantizaciones AWQ es el tamaño en disco (19,6 GB frente a 21,02 GB) y que la variante de `derikn` documenta explícitamente la retención de la cabeza MTP y las proyecciones de atención lineal en 16 bits.

## Limitaciones y advertencias

- Cuantización no oficial: la model card del propio autor indica que no fue producida por el equipo de Qwen y que este no la avala. No debe tratarse como una release oficial.
- Ausencia total de evaluación: no hay benchmarks ni medición de la degradación de calidad provocada por la cuantización W4A16 respecto al modelo en bfloat16. Cualquier uso en producción exige validación propia.
- Dependencia crítica de las exclusiones: si el despliegue no respeta `quantization_config.modules_to_not_convert`, la cabeza MTP se carga como capa lineal de 4 bits y el arranque falla con `ValueError: There is no module or parameter named 'fc.weight' in Qwen3_5MultiTokenPredictor`.
- Receta no reproducible tal cual: el script de cuantización era un wrapper privado y la invocación publicada no se puede ejecutar directamente, por lo que no se puede regenerar el checkpoint de forma idéntica.
- Cobertura de hardware muy estrecha: solo se ha probado en dos Intel Arc Pro B70 con vLLM XPU nightly. El comportamiento en CUDA, ROCm u otros backends no está verificado.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta familia; no se ha publicado ninguna evaluación específica de fidelidad factual para este checkpoint, y la cuantización de 4 bits puede agravarla en tareas de recuperación precisa.
- Sesgos conocidos: no disponible. No hay análisis de sesgo en la información proporcionada.
- Cobertura de idiomas: no disponible; el campo de idiomas no está informado. La calibración se hizo sobre NeelNanda/pile-10k, corpus mayoritariamente en inglés, lo que puede afectar de forma desigual a otros idiomas.
- Límites de contexto: aunque se sirve 1:1 con 262.144 tokens, la degradación en contextos cercanos al máximo no está medida, y la configuración probada usa caché KV en fp8, que introduce una pérdida de precisión adicional no cuantificada.
- Licencia: Apache 2.0, permisiva para uso comercial, pero conviene revisar los términos del modelo base y las condiciones de la plataforma de despliegue.
- Adopción nula observable: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya reportado problemas o validaciones independientes.
- Requisitos de contenedor poco convencionales en Arc (seccomp sin confinar, ipc host), que pueden chocar con políticas de seguridad corporativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/derikn/Qwen3.8-27B-AWQ-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio del modelo base en GitHub (AlibabaCloud-Official): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Intel AutoRound (herramienta de cuantización): https://github.com/intel/auto-round
- Cuantización AWQ INT4 alternativa de cyankiwi: https://huggingface.co/cyankiwi/Qwen3.8-27B-AWQ-INT4
- Versión de cyankiwi en ModelScope: https://www.modelscope.cn/models/cyankiwi/Qwen3.8-27B-AWQ-INT4
- Comparativa de variantes en aimodels.fyi: https://www.aimodels.fyi/models/compare/qwen3.8-27b-awq-int4-cyankiwi-vs-qwen3.8-27b-qwen
