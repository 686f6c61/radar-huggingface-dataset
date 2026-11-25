# Dsturb/Qwen3.8-Flash-Next-FLARE-Abliterated-YaRN-512k

## Resumen

Qwen3.8-Flash-Next-FLARE-Abliterated-YaRN-512k es un paquete de inferencia en formato Flare (Hyperflare) derivado de la familia Qwen3.8-Flash-Next, publicado por el usuario Dsturb sobre el checkpoint abliterado de lflare. No es un modelo entrenado desde cero ni un fine-tune con datos propios: es una exportación de un checkpoint ya cuantizado en NVFP4/MXFP8 (QAD, cuantización consciente de cuantización) al que se le aplica un factor YaRN 2 para duplicar la longitud de contexto efectiva de 262.144 a 524.288 tokens. El paquete está pensado para ejecutarse en una única GPU RTX PRO 6000 Blackwell de 96 GB (arquitectura gb202) con tensor parallelism 1.

La relevancia del paquete es doble. Por un lado, ofrece una ventana de contexto de 512k tokens en hardware de una sola tarjeta profesional, algo que en la práctica requiere técnicas de extensión de RoPE (YaRN) combinadas con cuantización de pesos en 4 y 8 bits. Por otro, incorpora una edición de rechazo reducido ("abliterated") de rango 2 aplicada en la capa 42, que modifica el comportamiento del modelo ante peticiones que normalmente rechazaría. El modelo es multimodal (pipeline image-text-to-text) y declara compatibilidad exclusiva con el runtime Hyperflare, no con Transformers, vLLM, SGLang ni llama.cpp.

El número de parámetros reportado en los safetensors es de 15.434.512, un dato que no es coherente con el tamaño del repositorio (184,3 GB) ni con los requisitos de hardware descritos en la model card (96 GB de VRAM para pesos cuantizados en 4/8 bits). Se reproduce tal cual por proceder de los metadatos, pero debe tratarse con cautela: probablemente refleja solo un subconjunto de tensores o un recuento parcial del exportador. La licencia es propietaria (lil-license-1.0, "other"), heredada del modelo base de Local Inference Lab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con mezcla de expertos y decodificación especulativa MTP; detalles completos de capas y dimensión no disponibles |
| Parametros totales | 15.434.512 según metadatos de safetensors (dato inconsistente con el tamaño del repo; ver advertencias) |
| Parametros activos | no disponible |
| Longitud de contexto | 524.288 tokens (YaRN factor 2 sobre 262.144); KV cache del runtime: 1.413.120 tokens |
| Tipos de cuantizacion | NVFP4 y MXFP8 (checkpoint QAD); export con `--force-moe-decode-a16`; `ple_embedding_dtype: nvfp4` |
| Idiomas soportados | no disponible |
| Licencia | lil-license-1.0 (Local Inference Lab License v1.0, etiquetada como "other") |
| Formato de pesos | safetensors en paquete de directorio Flare (56 archivos, 106.397.737.936 bytes) |
| Runtime | Hyperflare (`flare` CLI) exclusivamente; no compatible con Transformers, vLLM, SGLang ni llama.cpp |
| Hardware objetivo | 1× RTX PRO 6000 Blackwell 96 GB (gb202), TP1 |
| Concurrencia | 16 peticiones simultáneas, 5 tokens borrador MTP |
| Firma del paquete | clave de desarrollo, huella `7ab239ec…e9e824` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de lo que se deduce del pipeline (image-text-to-text) y de las referencias técnicas del paquete: se trata de un transformer con componentes de mezcla de expertos (por el flag `--force-moe-decode-a16`, que fuerza decodificación de expertos en precisión a16), torre de visión ya cuantizada en el checkpoint de origen y decodificación especulativa mediante 5 tokens borrador MTP (multi-token prediction). El checkpoint base es Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD de Local Inference Lab, sobre el que lflare aplicó una edición de rechazo reducido de rango 2 en la capa 42, descrita como "dual-regime". No se especifican tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

La innovación técnica principal de este paquete concreto es la extensión de contexto mediante YaRN factor 2, aplicada en el momento de la exportación con el parámetro `--rope-parameters` de Ignition (PR #212 del árbol Hyperflare). Esto duplica la ventana nominal de 262.144 a 524.288 tokens sin reentrenar. El paquete se construye sobre Hyperflare main `5fd4070d` más los PR #212 y #322, y en la versión v2 elimina el injerto de torre de visión de la v1 porque el checkpoint de origen (`7f49d25e`) ya la incluye cuantizada.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline declarado es image-text-to-text, por lo que acepta imágenes junto con texto como entrada.
- Contexto largo: ventana efectiva de 524.288 tokens por petición, validada con una prueba de aguja en el pajar sobre un prompt de 333.975 tokens resuelta correctamente en 31,7 s.
- Decodificación especulativa MTP con 5 tokens borrador, integrada en el runtime Hyperflare.
- Concurrencia de 16 peticiones simultáneas con KV cache de 1.413.120 tokens.
- Comportamiento de rechazo reducido ("abliterated"): la edición de rango 2 en la capa 42 disminuye la tasa de rechazos del modelo original (cifras concretas no disponibles en la información proporcionada).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios y bases de código extensas: con 524.288 tokens de contexto, el modelo puede ingerir árboles de proyecto completos, historiales de commits o documentación técnica extensa en una sola petición, evitando la fragmentación en trozos y la pérdida de dependencias entre archivos.
- Procesamiento de expedientes y documentación legal o administrativa: la ventana de 512k permite cargar contratos, anexos y correspondencia asociada de forma conjunta; la prueba de aguja en el pajar a 334k tokens sugiere que la recuperación de información en posiciones intermedias del contexto es fiable.
- Auditoría de documentos con imágenes: al ser un modelo image-text-to-text, puede procesar capturas de pantalla, diagramas o páginas escaneadas junto con el texto circundante, útil en revisión de informes técnicos o compliance documental.
- Investigación sobre seguridad y alineamiento: la edición abliterated de rango 2 en la capa 42 lo convierte en una pieza útil para estudiar cómo una intervención mínima en una sola capa altera la distribución de rechazos, siempre en entornos controlados y con las advertencias de la sección de limitaciones.
- Despliegue en estación de trabajo con una sola GPU: al caber en una RTX PRO 6000 Blackwell de 96 GB con TP1, encaja en laboratorios o equipos de investigación que no disponen de clústeres multi-GPU, con 236,7 tok/s en decodificación C1 y 998,1 tok/s agregados en C16.
- Evaluación comparativa de runtimes de inferencia: sirve como banco de pruebas para medir el rendimiento de Hyperflare frente a otras pilas (vLLM, SGLang) en cuantización NVFP4/MXFP8, dado que el paquete solo funciona en Hyperflare y obliga a comparar con exportaciones equivalentes en otros runtimes.
- Generación de resúmenes de reuniones o transcripciones muy largas: transcripciones de varias horas que superan los 200k tokens pueden procesarse íntegras, manteniendo coherencia entre intervenciones distantes en el tiempo.

## Benchmarks y rendimiento

Rendimiento medido por el autor en una RTX PRO 6000 Blackwell a 325 W con lil-bench 1.7.1 (perfil estándar, aislado):

| Fase | 0 contexto | 64k | 128k |
|---|---:|---:|---:|
| Decodificación C1 (tok/s) | 236,7 | 223,9 | 221,4 |
| Decodificación C8 agregada (tok/s) | 818,0 | 811,6 | 770,9 |
| Decodificación C16 agregada (tok/s) | 998,1 | 1.081,6 | no medido |

- Prefill: 12.433 tok/s a 32k y 12.011 tok/s a 128k.
- C16 a 128k no se midió porque requiere 2.129.920 tokens de KV y el runtime solo retiene 1.413.120.
- Contexto largo: prompt de 333.975 tokens con aguja en el medio, respondido correctamente en 31,7 s.
- Calidad: `lavd-test` 10/10 (9 coincidencias exactas, 1 aproximada) y `estonia` 30/30, con los valores por defecto de servicio (temperatura 1,0, top_p 0,95, top_k 20).

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras de rechazo corresponden a mediciones de lflare sobre el checkpoint plano, no a este paquete.

## Requisitos de hardware

- VRAM: 96 GB en una única RTX PRO 6000 Blackwell (gb202) con TP1; el paquete pesa 106.397.737.936 bytes (~99 GiB) y el repositorio completo 184,3 GB.
- GPU recomendadas: RTX PRO 6000 Blackwell 96 GB es la única configuración validada por el autor. No se documenta funcionamiento en A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en ninguna GPU de consumo actual; los 96 GB de VRAM superan la capacidad de una RTX 4090 (24 GB) o RTX 5090 (32 GB).
- Despliegue: exclusivamente Hyperflare (`flare` CLI) mediante contenedor Docker construido desde el árbol `5fd4070d` con los PR #212 y #322 fusionados. No hay imagen preconstruida publicada.
- Almacenamiento: se recomienda montar el paquete en modo solo lectura y un directorio de estado persistente para el trust store.
- Latencia y throughput: 236,7 tok/s en C1 a contexto cero; 12.433 tok/s de prefill a 32k; 31,7 s para responder sobre un prompt de 334k tokens.
- Nota operativa: el arranque exige `--verify-weights`, `--embedding-table-storage ram` y aceptar explícitamente la clave de desarrollo del publicador con `--dangerously-accept-publisher local-development` y `--dangerously-approve-key`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dsturb/Qwen3.8-Flash-Next-FLARE-Abliterated-YaRN-512k | 15.434.512 según metadatos (inconsistente) | 524.288 | Hyperflare exclusivamente | lil-license-1.0 | Hugging Face, 344 descargas, 3 likes |
| lflare/Qwen3.8-Flash-Next-FLARE-Abliterated | no disponible | 262.144 (sin YaRN) | Hyperflare | lil-license-1.0 (heredada) | Hugging Face |
| lflare/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD-Abliterated | no disponible | 262.144 | no disponible | lil-license-1.0 | Hugging Face |
| local-inference-lab/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD | no disponible | 262.144 | no disponible | Local Inference Lab License v1.0 | Hugging Face |

La comparativa se limita a la propia estirpe del modelo porque no se dispone de datos de benchmarks ni de especificaciones completas de alternativas externas en la información proporcionada.

## Limitaciones y advertencias

- Dato de parámetros inconsistente: los 15.434.512 parámetros reportados no cuadran con un repositorio de 184,3 GB ni con los 96 GB de VRAM necesarios; no debe usarse ese número para estimar requisitos ni comparar tamaños sin verificación previa.
- Compatibilidad restringida: solo funciona con Hyperflare. No hay soporte en Transformers, vLLM, SGLang ni llama.cpp, y `AutoConfig.from_pretrained` falla deliberadamente porque `config.json` es un ancla de estadísticas de descarga, no una configuración de modelo.
- Cadena de confianza débil: el paquete está firmado con una clave de desarrollo (`7ab239ec…e9e824`) y la ejecución exige aceptar explícitamente esa clave con flags `--dangerously-*`. No hay imagen de runtime preconstruida y hay que compilarla desde un árbol con dos pull requests aún abiertos upstream.
- Rechazo reducido: la edición abliterated disminuye la tasa de rechazos del modelo original. Esto puede producir respuestas a peticiones que el modelo base rechazaría; debe evaluarse el impacto en seguridad antes de cualquier despliegue expuesto a usuarios finales.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de calibración en la información disponible; los tests `lavd-test` y `estonia` son pruebas internas del autor, no benchmarks de alucinación.
- Idiomas: no se documentan los idiomas soportados, por lo que no puede asumirse un rendimiento multilingüe equivalente al del modelo original.
- Licencia: lil-license-1.0 es una licencia propietaria heredada de Local Inference Lab; las condiciones de uso comercial no se detallan en la información proporcionada y deben revisarse en el archivo LICENSE del repositorio antes de cualquier uso en producción.
- Concurrencia limitada en contexto largo: a 128k tokens con 16 peticiones simultáneas se necesitan 2.129.920 tokens de KV y el runtime solo retiene 1.413.120, por lo que esa combinación de carga y contexto no es viable.
- Visión: la v2 elimina el injerto de torre de visión de la v1 y confía en la torre ya cuantizada del checkpoint; no se documentan evaluaciones de calidad multimodal para esta exportación.
- Fecha de creación del repositorio: los metadatos indican 2026-11-10, lo que debe tratarse como dato del autor y no como referencia temporal verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dsturb/Qwen3.8-Flash-Next-FLARE-Abliterated-YaRN-512k
- Paquete de referencia de lflare: https://huggingface.co/lflare/Qwen3.8-Flash-Next-FLARE-Abliterated
- Checkpoint abliterado de lflare: https://huggingface.co/lflare/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD-Abliterated
- Checkpoint base de Local Inference Lab: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4-MXFP8-CSF-QAD
- Runtime Hyperflare: https://github.com/NVIDIA/hyperflare-inference
