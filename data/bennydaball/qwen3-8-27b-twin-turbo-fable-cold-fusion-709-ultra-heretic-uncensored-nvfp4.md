# BennyDaBall/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NVFP4

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantización NVFP4 en formato GGUF del fine-tune de DavidAU `Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored`, publicada por el usuario BennyDaBall. El trabajo original parte de una base de la familia Qwen3.8 con 27.320.697.856 parámetros (unos 27,3 mil millones) y la somete a un proceso de tuning propio ("Cold Fusion" / GAIN), a un comportamiento de razonamiento corto ("TWIN-TURBO") y a un proceso de des-censura ("Heretic") que elimina las negativas del modelo. El resultado es un modelo multimodal de tipo image-text-to-text con tool calling y plantillas de chat con modos de pensamiento conmutables.

La aportación concreta de este repositorio es el cambio de formato de almacenamiento: una cuantización en una sola pasada desde los safetensors BF16 del autor original, manteniendo intactos el cabezal MTP (multi-token prediction) y la torre de visión. El backbone de atención, Gated DeltaNet y MLP de las 64 capas de texto se almacena como tensores GGML de tipo 40 (`nvfp4`), el formato de coma flotante de 4 bits de NVIDIA con kernels hardware en Blackwell, mientras que el cabezal MTP, el cabezal de salida y los embeddings se conservan en BF16. El resultado ocupa 18,34 GiB frente a los 51,8 GiB del BF16 original, con 262.144 tokens de contexto nativo.

Es relevante ahora porque demuestra un patrón de despliegue local eficiente en GPUs Blackwell de consumo: un modelo de 27B multimodal con contexto de 256K, decodificación especulativa auto-contenida (sin modelo draft externo) y tool calling, ejecutable en una única RTX 5090 de 32 GB mediante LM Studio o llama.cpp. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención, Gated DeltaNet y MLP; 64 capas de texto más capa MTP; torre de visión separada (mmproj) |
| Parámetros totales | 27.320.697.856 (27,3B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | NVFP4 (backbone, tensor GGML tipo 40); BF16 (cabezal MTP, embeddings, cabezal de salida, proyector de visión). El autor remite a su repo NEO MTP GGUF para K-quants e imatrix quants en hardware no Blackwell |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (principal 18,34 GiB + `mmproj` BF16 de 0,87 GiB); origen en safetensors BF16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de 64 capas de texto que combina mecanismos de atención con capas Gated DeltaNet y bloques MLP; las matrices grandes de estas tres familias se cuantizan a NVFP4, mientras que los componentes sensibles a precisión (embeddings, cabezal de salida y cabezal MTP) permanecen en BF16. El modelo incluye una capa adicional (`blk.64`) de multi-token prediction, lo que permite decodificación especulativa auto-generada sin modelo draft externo. Dispone además de una torre de visión independiente, convertida desde el mismo checkpoint BF16 del autor original y no tomada de otro modelo Qwen3.8.

El entrenamiento no lo realiza este repositorio: el fine-tune, el tuning "Cold Fusion" / GAIN, el comportamiento de razonamiento corto TWIN-TURBO, los cinco modos de pensamiento y los cinco modos instruct, así como el proceso Heretic de des-censura, son obra de DavidAU. El repositorio de BennyDaBall documenta una cuantización en una sola pasada con una importance matrix (`Qwen3.8-27B-NVFP4-imatrix.dat`, 13,01 MiB) y un mapa de precisión por tensor de 866 líneas pasado a `llama-quantize`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La plantilla de chat de DavidAU se incrusta sin modificar (sha256 `4e52a372...`, verificado byte a byte tras la conversión), con una segunda plantilla v2 incluida como archivo aparte para harnesses de agentes.

## Capacidades

- Generación de texto conversacional multi-turno con contexto nativo de 262.144 tokens.
- Razonamiento con modos conmutables mediante etiquetas tipo `{REASON:imedium}` o `{REASON:low}`: respuesta directa sin bloque de pensamiento o pensamiento breve; la etiqueta persiste hasta cambiarla.
- Cinco modos de pensamiento y cinco modos instruct definidos por el autor original.
- Entrada de imágenes (pipeline image-text-to-text) mediante el proyector `mmproj` BF16.
- Tool calling / function calling y uso conversacional orientado a agentes; el autor recomienda su plantilla v2 para harnesses de agentes.
- Decodificación especulativa con cabezal MTP integrado (parámetros medidos: máximo 3 tokens draft, probabilidad mínima de continuación 0,2).
- Comportamiento "uncensored" por el proceso Heretic: ausencia de negativas en temas que los modelos alineados rechazan.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Asistente conversacional local con privacidad total: el modelo cabe en una RTX 5090 de 32 GB y se ejecuta con LM Studio o llama.cpp sin Python ni vLLM, de modo que los datos no salen de la máquina; adecuado para entornos con requisitos de confidencialidad.
- Análisis de documentos largos: con 262.144 tokens de contexto nativo se pueden ingerir contratos, expedientes o bases de código completas en una sola pasada sin técnicas de recuperación.
- Procesamiento de imágenes con descripción y extracción de información: la torre de visión permite tareas de image-text-to-text como lectura de capturas, diagramas o documentación escaneada, combinada con razonamiento posterior.
- Automatización de agentes con tool calling: la plantilla v2 y el soporte de function calling permiten construir pipelines donde el modelo decide qué herramienta invocar; el MTP integrado reduce la latencia de generación en estos bucles.
- Generación de código y razonamiento técnico en local: útil en flujos de desarrollo donde se quiere un modelo de 27B sin dependencia de API, con contexto suficiente para repositorios medianos.
- Investigación sobre des-censura y alineación: el proceso Heretic lo convierte en objeto de estudio para comparar comportamientos alineados frente a no alineados sobre la misma base, en entornos controlados.
- Prototipado rápido de aplicaciones de IA generativa: al ser un único archivo GGUF con plantilla incrustada, se integra en demos y pruebas de concepto con LM Studio en minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de despliegue: 18,34 GiB de peso en NVFP4 frente a 51,8 GiB en BF16, y la configuración de decodificación especulativa probada (3 tokens draft, 0,2 de probabilidad mínima de continuación) sobre una RTX 5090 de 32 GB con `sm_120`.

## Requisitos de hardware

- VRAM estimada para inferencia: 18,34 GiB solo para los pesos de texto; añadir 0,87 GiB si se carga el proyector de visión. El espacio para caché KV depende de la longitud de contexto configurada y no se detalla en la información disponible.
- GPU recomendadas: NVIDIA Blackwell con kernels NVFP4 nativos; el autor construyó y midió sobre una RTX 5090 de 32 GB (`sm_120`).
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB. En GPUs no Blackwell no se garantiza el rendimiento de los kernels NVFP4; el autor remite a su repo NEO MTP GGUF para K-quants e imatrix quants destinados a ese hardware.
- Opciones de despliegue: LM Studio (runtime llama.cpp CUDA 12 versión 2.41.0) y llama.cpp (release oficial b11026, build Windows CUDA 13.4). Se requiere una versión reciente: una build de llama.cpp del 2026-09-01 cargaba el modelo pero fallaba al activar `--spec-type draft-mtp`.
- Latencia y throughput: no disponibles. La decodificación especulativa con MTP está pensada para reducir la latencia, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (NVFP4 GGUF) | 27,3B | 262.144 | GGUF NVFP4 + MTP BF16 + mmproj BF16 | Apache 2.0 | Solo Blackwell; multimodal; sin benchmarks publicados |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored (origen) | 27,3B | 262.144 | Safetensors BF16 (51,8 GiB) | Apache 2.0 | Mismo comportamiento; requiere más VRAM o cuantización propia |
| DavidAU/...-NM-DAU-NEO-MTP-GGUF | 27,3B | 262.144 | GGUF K-quants e imatrix quants | Apache 2.0 | Alternativa para hardware no Blackwell |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés declarado: no hay soporte multilingüe verificado, pese a que la base Qwen suele ser multilingüe.
- Modelo des-censurado ("Heretic"): no aplica negativas de seguridad, por lo que puede generar contenido dañino, ilegal o inexacto sin filtro; requiere moderación externa en producción.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados que permitan estimar la fiabilidad factual.
- Dependencia de hardware: los kernels NVFP4 son específicos de Blackwell; en otras GPUs el rendimiento puede degradarse o requerir otras cuantizaciones.
- Dependencia de versión del runtime: el MTP integrado y los tensores NVFP4 son adiciones recientes de llama.cpp; versiones antiguas fallan al activar la decodificación especulativa.
- Licencia Apache 2.0 permite uso comercial, pero el comportamiento des-censurado traslada al desplegador la responsabilidad legal y ética del contenido generado.
- El repositorio es una cuantización, no un modelo entrenado: los fallos de comportamiento deben atribuirse al fine-tune de DavidAU, no al cuantizador.
- El contexto nativo de 262.144 tokens no implica que la caché KV quepa en 32 GB a plena longitud; no se documentan requisitos de VRAM por longitud de contexto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BennyDaBall/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NVFP4
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Guía de uso y repo NEO MTP GGUF del autor original: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NM-DAU-NEO-MTP-GGUF
- Perfil del cuantizador en X: https://x.com/BennyDaBall_OG
- Apoyo al cuantizador (Ko-fi): https://ko-fi.com/bennydaball
