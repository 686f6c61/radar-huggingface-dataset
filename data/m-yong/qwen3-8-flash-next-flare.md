# m-yong/Qwen3.8-Flash-Next-FLARE

## Resumen

Qwen3.8-Flash-Next-FLARE es un paquete de ejecución preparado para el runtime Flare de NVIDIA, construido a partir del checkpoint cuantizado `nvidia/Qwen3.8-Flash-Next-FP4-Local`, que a su vez deriva del modelo Qwen3.8-Flash-Next del equipo Qwen. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son idénticos al checkpoint original (verificados por SHA-256), y lo que aporta el paquete son kernels CUDA compilados, grafos CUDA capturados y una configuración afinada para servir el modelo con baja latencia en GPUs Blackwell.

El modelo subyacente es un decoder Mixture-of-Experts con atención dispersa tipo Qwen Sparse Attention, proyecciones densas en MXFP8, expertos enrutados en NVFP4, estado recurrente Gated DeltaNet en memoria de dispositivo, encoder de visión y una capa MTP (multi-token prediction) que habilita decodificación especulativa. El paquete está preparado para una sola GPU con hasta 32 peticiones concurrentes, contexto de 262.144 tokens y hasta 5 tokens borrador MTP.

Su relevancia es práctica: demuestra un flujo de despliegue sin Python ni compilación en tiempo de ejecución, con un runtime nativo en Rust, orientado a inferencia multimodal (texto e imagen) en hardware de workstation Blackwell. La contrapartida es que los ficheros solo funcionan con Flare y no se pueden cargar directamente con Transformers, vLLM, SGLang ni llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts con atencion dispersa (Qwen Sparse Attention), estado recurrente Gated DeltaNet, encoder de vision y capa MTP para decodificacion especulativa |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el checkpoint es MoE, pero el numero de expertos y parametros activos no se detalla en la informacion disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), MXFP8 (proyecciones densas y experto compartido), FP8 (paginas KV para Qwen Sparse Attention) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (license: other) |
| Formato de pesos | safetensors en formato dividido (directorio) con manifiesto firmado, mas ficheros acompanantes de kernels, grafos e estado inicial; no compatible con carga directa en Transformers, vLLM, SGLang ni llama.cpp |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina un decoder MoE con atención dispersa (Qwen Sparse Attention, con páginas KV en FP8), un estado recurrente Gated DeltaNet mantenido en memoria de GPU y un encoder de visión que permite entrada image-text-to-text. La receta `qwen3.8-flash` de Flare ejecuta los expertos enrutados con los pesos NVFP4 del checkpoint, las proyecciones densas y el experto compartido en MXFP8, y añade una capa MTP que proporciona decodificación especulativa con hasta 5 tokens borrador.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original; esos datos corresponden a la model card de Qwen3.8-Flash-Next, que no forma parte de la información proporcionada. La innovación destacable de este paquete es de ingeniería de despliegue: los kernels están precompilados y los grafos CUDA precapturados (112 grafos) durante la preparación, de modo que el servicio se ejecuta a través del runtime nativo en Rust de Flare sin Python ni compilación en caliente. La tabla de embeddings n-gram de 26,8 GiB se mantiene fuera de la memoria de GPU, leída desde disco con una caché de filas de 4 GiB en RAM de host, o bien residente por completo en memoria de host con `--embedding-table-storage ram`.

## Capacidades

- Generación de texto y razonamiento: la validación reporta respuestas aritméticas cortas correctas con el modo thinking desactivado.
- Modo thinking: el razonamiento se devuelve por separado de la respuesta final.
- Entrada multimodal de imagen: el paquete sirve el encoder de visión y admite peticiones de imagen concurrentes (hasta 4 según la configuración preparada); la validación describe correctamente una imagen sintética de prueba.
- Tool calling: devuelve llamadas estructuradas con argumentos JSON válidos (probado con `get_weather`).
- Concurrencia: hasta 32 peticiones simultáneas con la configuración preparada; 16 peticiones de chat concurrentes completaron con `stop` en la validación.
- Contexto largo: ventana de 262.144 tokens con prefill en fragmentos de 4.096 tokens.
- Decodificación especulativa mediante la capa MTP, con hasta 5 tokens borrador configurables.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con documentos largos adjuntos gracias a la ventana de 262.144 tokens, y el tool calling permite conectarlo a sistemas de consulta de pedidos o estado de cuenta.
- Análisis de documentos e imágenes en un mismo flujo: con soporte image-text-to-text, se puede enviar una captura o un escaneo junto a una pregunta; útil en verificación de facturas, tickets o informes técnicos.
- Asistentes de código con invocación de herramientas: el tool calling estructurado permite integrarlo en pipelines que ejecutan tests, consultan repositorios o lanzan builds, con el razonamiento separado de la respuesta final para auditar el proceso.
- Razonamiento con modo thinking para tareas analíticas: al devolver el razonamiento por separado, es adecuado en flujos donde se necesita trazabilidad del proceso (auditoría de decisiones, revisión de cálculos).
- Servicio de inferencia de baja latencia en workstation: al ejecutarse con kernels precompilados y grafos capturados en un runtime Rust, encaja en despliegues on-premise sobre RTX PRO 6000 Blackwell con hasta 32 peticiones concurrentes.
- Procesamiento por lotes de contexto largo: con prefill en fragmentos de 4.096 tokens y contexto de 262.144, se pueden resumir o extraer datos de expedientes completos en una sola pasada.
- Evaluación y prototipado de cuantización NVFP4/MXFP8: sirve como referencia reproducible para medir el comportamiento de un MoE multimodal cuantizado en FP4/FP8 sobre hardware Blackwell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta pruebas de validación funcional (carga del checkpoint con coincidencia SHA-256 de los 23 ficheros de pesos, respuesta aritmética correcta, 16 peticiones concurrentes completadas, tool calling con JSON válido, razonamiento separado y descripción de imagen), sin cifras de MMLU, HumanEval, GSM8K ni latencia/throughput medidos.

## Requisitos de hardware

- VRAM estimada: el paquete ocupa aproximadamente 107 GB; está preparado para una GPU de 96 GB (RTX PRO 6000 Blackwell, revisión `gb202`). La tabla de embeddings n-gram de 26,8 GiB queda fuera de la VRAM por defecto.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (96 GB), en sus variantes Workstation Edition y Max-Q Workstation Edition; el paquete funciona en cualquier GPU GB202.
- GPU de consumo: no cabe en GPUs de consumo convencionales por el tamaño del paquete y la arquitectura Blackwell requerida.
- Potencia: los kernels se afinaron en una RTX PRO 6000 Blackwell Workstation Edition limitada a 350 W; el autor advierte que una tarjeta con otro límite de potencia podría favorecer otras elecciones de kernel.
- Opciones de despliegue: exclusivamente el runtime Flare (`flare run`, `flare download`), con runtime nativo en Rust; no es compatible con vLLM, SGLang, llama.cpp, Ollama, TGI ni Transformers.
- Concurrencia y contexto configurables: hasta 32 peticiones concurrentes y 5 tokens borrador MTP por defecto, ajustables al lanzar con `--max-concurrency` y `--mtp-draft-tokens`.
- Latencia y throughput: no disponible; no se publican cifras medidas.
- Almacenamiento: el repositorio ocupa 107,7 GB; el proceso de exportación tardó aproximadamente 50 minutos en una GPU con caché de kernels vacía.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| m-yong/Qwen3.8-Flash-Next-FLARE | no disponible (MoE) | 262.144 | NVFP4, MXFP8, FP8 KV | NVIDIA Open Model Agreement | Paquete Flare (solo runtime Flare) |
| nvidia/Qwen3.8-Flash-Next-FP4-Local | no disponible (MoE) | no disponible | FP4 (checkpoint local) | NVIDIA Open Model Agreement | Checkpoint safetensors de NVIDIA |
| Qwen/Qwen3.8-Flash-Next | no disponible (MoE) | no disponible | Pesos originales | no disponible en la informacion proporcionada | safetensors estándar (Transformers, vLLM, etc.) |

La diferencia clave frente a los dos anteriores no está en los pesos, que son idénticos al checkpoint de NVIDIA, sino en el empaquetado: kernels compilados, grafos CUDA capturados y receta de serving para una sola GPU Blackwell, a cambio de perder la portabilidad a otros runtimes.

## Limitaciones y advertencias

- Dependencia total de Flare: los ficheros no se pueden cargar con Transformers, vLLM, SGLang ni llama.cpp, lo que limita la integración a ese runtime y a su cadena de herramientas.
- Requiere hardware GB202 (Blackwell); no hay soporte documentado para generaciones anteriores ni para GPUs de consumo.
- La afinación de kernels se hizo a 350 W en una RTX PRO 6000 Blackwell Workstation Edition; en otras tarjetas o límites de potencia el rendimiento puede diferir.
- El paquete está preparado para una sola GPU (TP1); no se documenta configuración multi-GPU.
- Es un artefacto de un autor individual (`m-yong`) sobre pesos de NVIDIA; la confianza en la integridad depende de la verificación del publisher mediante `publisher.json` y de la firma Ed25519, no de una publicación oficial de NVIDIA o Qwen.
- Licencia NVIDIA Open Model Agreement: conviene revisar sus términos antes de cualquier uso comercial, ya que no es una licencia de código abierto permisiva.
- Idiomas soportados no disponibles: no se puede garantizar cobertura multilingüe sin consultar la model card del modelo base.
- Riesgo de alucinación y sesgos: no hay información específica publicada para este paquete; son los propios del modelo Qwen3.8-Flash-Next subyacente, no evaluados aquí.
- El repositorio es reciente (creado el 2026-10-25, actualizado el 2026-10-27) y sin descargas ni likes registrados, por lo que la validación independiente por terceros es escasa.
- La actualización del 2026-10-27 cambió solo el fichero primario y los acompañantes de kernels, grafos y estado inicial de `gb202-tp1`; quien tenga copias anteriores debe resincronizar (unos 0,8 GB adicionales).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/m-yong/Qwen3.8-Flash-Next-FLARE
- Modelo base del paquete: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime Flare: https://github.com/NVIDIA/flare-local-inference
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- Manifiesto de publisher: https://huggingface.co/m-yong/Qwen3.8-Flash-Next-FLARE/blob/main/publisher.json
