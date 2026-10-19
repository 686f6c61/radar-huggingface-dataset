# cryoecho/Qwen3.8-27B-Uncensored-MXFP4-radiance

## Resumen

`cryoecho/Qwen3.8-27B-Uncensored-MXFP4-radiance` es un contenedor de inferencia listo para servir del modelo multimodal Qwen3.8-27B en su variante sin censura (abliterated), empaquetado en formato `.rad` para el motor **radiance** sobre GPUs AMD RDNA4 con ROCm. No es un modelo entrenado desde cero: es una redistribución cuantizada y optimizada que parte de `orcarouter/Qwen3.8-27B-Uncensored` (los pesos sin alineación de seguridad), pasa por la cuantización MXFP4 calibrada con AWQ de `just1moremodel/...-MXFP4-awq` y añade el decodificador especulativo `z-lab/Qwen3.8-27B-DFlash2` fusionado en el mismo fichero.

Su relevancia es doble. Por un lado, empaqueta 27B multimodales (torre de visión incluida) en 18,05 GiB, de modo que caben con KV cache FP8 en una única tarjeta de 32 GB —una Radeon AI PRO R9700— con 262.144 tokens de contexto entrenado. Por otro, incorpora decodificación especulativa con un *drafter* de difusión por bloques que eleva la aceptación de borradores al 53,8 % a profundidad 7 y multiplica el throughput respecto al decode limitado por ancho de banda (~35 tok/s en crudo según el autor).

El resultado declarado son 132,1 tok/s de decode agregado ponderado y 492,1 tok/s con 8 peticiones concurrentes en una sola R9700, con API compatible con OpenAI. Es, por tanto, una pieza de infraestructura para desplegar un 27B sin censura en hardware AMD, no un checkpoint publicable en formato estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (derivado de Qwen3.8-27B) con torre de visión de 27 bloques en bf16; detalle del tronco no disponible. Incluye drafter especulativo DFlash2 de difusión por bloques (5 bloques) |
| Parametros totales | 27B (nominal, según el nombre del modelo); recuento exacto no disponible |
| Parametros activos | No disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | 262.144 tokens entrenados (máximo por petición individual); 433.000 tokens agregados en peticiones en paralelo |
| Tipos de cuantizacion | Pesos MXFP4 OCP (códigos e2m1 + exponente E8M0 por cada 32 valores) contra activaciones E4M3; `lm_head` en FP8 por bloques; cabezal de vocabulario del drafter en 2 bits; torre de visión en bf16; KV cache en FP8 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (contenedor RAD2, 1.101 tensores, 18,05 GiB) para el motor radiance; no hay safetensors ni GGUF en este repo |
| Tamano del repositorio | 19,4 GB (pesos estáticos: 14,84 GiB) |
| Motor requerido | radiance 1.5.0 o superior (ROCm, AMD RDNA4 / gfx1201) |
| Pipeline | image-text-to-text |
| Fecha de publicacion | Creado el 15/10/2026, actualizado el 18/10/2026 |

## Arquitectura y entrenamiento

El tronco es un Qwen3.8-27B multimodal abliterado: se ha eliminado la alineación de seguridad, de modo que responde a peticiones que el modelo original rechaza. La model card no documenta el dataset de entrenamiento, el número de tokens ni si hubo RLHF/DPO para la variante sin censura; las fuentes de la familia describen un modelo de pesos abiertos multimodal ajustado con LoRA para reducir negativas, pero ese detalle no se confirma para este fichero concreto. La cuantización sí está documentada: se parte del checkpoint MXFP4 calibrado con AWQ (producido con AMD Quark) y se importa sin recuantizar, byte a byte, a 4 bits de pesos; el `lm_head` se reexpresa como FP8 por bloques según la receta. El checkpoint intermedio `q38-unc-mxfp4-nomtp` elimina el `quantization_config.layer_quant_config`, porque los ocho tensores `mtp.*` en fp8-e4m3 por canal vetaban la importación MXFP4 (el importador exige OCP 4 bits en todo).

La innovación práctica es la fusión del especulador DFlash2 en el mismo contenedor: 5 bloques que redactan sobre las capas objetivo 5/19/33/47/61 del modelo, con tamaño de bloque 8, lineales en OCP-MXFP4 y cabezal de vocabulario en 2 bits; el motor recompuntúa los 32 candidatos principales del drafter contra el cabezal FP8 del modelo. Los borradores se verifican, así que afectan a la velocidad y nunca a la salida. El coste es que **no hay cabezal MTP nativo** en este contenedor (el drafter DFlash2 lo desplaza), por lo que no se puede hacer un A/B contra MTP. La torre de visión se mantiene en bf16 y puede ubicarse en RAM con `--vision-tower-placement ram` para no restar espacio al pool de KV en una sola tarjeta. El servidor expone API compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`) con tool calls, salida estructurada y partes `image_url`/`video_url`.

## Capacidades

- Generación de texto y razonamiento multi-turno con hasta 262.144 tokens de contexto entrenado.
- Generación de código y edición de ficheros, con categorías de benchmark de serving específicas (`code`, `file_edit`, `json`).
- Matemáticas y razonamiento cuantitativo (categoría `math` medida a 195,3 tok/s en la R9700).
- Tool calling / function calling en la API compatible con OpenAI.
- Salida estructurada (JSON) validada por el servidor.
- Entrada de imágenes y vídeo en mensajes de chat mediante `image_url` y `video_url` (torre de visión de 27 bloques en bf16); el autor advierte que en este fichero solo se ejercitó la generación de texto.
- Decodificación especulativa integrada (DFlash2, profundidad automática 7, desactivable con `--num-speculative-tokens 0`).
- Modo sin censura: responde a peticiones que el modelo base rechaza.
- Multilingüismo: no documentado en la información disponible.

## Casos de uso

- **Atención al cliente con contexto largo**: ingerir historiales completos o documentación de producto de decenas de miles de tokens en una sola petición gracias a la ventana de 262.144 tokens, sin trocear la conversación ni recurrir a RAG para el contexto inmediato.
- **Asistente de código en pipelines de CI/CD**: usar el endpoint `/v1/chat/completions` con tool calls para que el modelo lea ficheros, proponga parches y ejecute herramientas; la categoría `file_edit` rinde 195,9 tok/s en una R9700, adecuado para bucles de agente con muchas ediciones cortas.
- **Procesamiento por lotes de documentación técnica**: con 8 secuencias concurrentes y 492,1 tok/s agregados, resumir y clasificar lotes de informes o tickets en una sola tarjeta, manteniendo TTFT p50 de 152 ms a concurrencia 8.
- **Extracción de datos estructurados**: generar JSON validado a 193,6 tok/s para pipelines ETL que convierten texto libre en registros normalizados, con salida estructurada garantizada por el servidor.
- **Análisis de imágenes y vídeo en chat**: descripción, moderación o extracción de información de capturas y clips mediante las partes `image_url`/`video_url`, útil en revisiones de contenido o documentación visual (requiere validar el comportamiento, ya que el autor solo ejercitó texto en este fichero).
- **Investigación sobre alineación y robustez**: al ser una variante abliterated, sirve para estudiar comportamientos de rechazo, evaluación de seguridad de sistemas y análisis de sesgos frente a un modelo alineado, en entornos controlados.
- **Despliegue on-premise en hardware AMD**: servir un 27B multimodal en una única Radeon AI PRO R9700 de 32 GB sin depender de CUDA, útil en entornos con flota RDNA4 y requisitos de soberanía de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, ARC) en la información disponible para este contenedor. Las cifras que circulan en resultados de búsqueda (por ejemplo, 735 ARC-C / 882 ARC-E) corresponden a otro checkpoint de la familia y no son atribuibles a este fichero.

El autor sí publica métricas de serving medidas en 1× Radeon AI PRO R9700 a 250 W (gfx1201), `--tp 1`, radiance 1.5.0, `--max-num-seqs 8 --max-model-len 260000 --kv-cache-dtype fp8`, corpus BetterBench v1.0, greedy, 5 pasadas por categoría, caché de prefijo en frío:

| Metrica | Valor |
|---|---|
| Decode agregado ponderado (mediana) | 132,1 tok/s |
| TTFT p50 | 126 ms |
| Prosa / código | 88,8 / 81,5 tok/s |
| JSON / matemáticas / edición de ficheros | 193,6 / 195,3 / 195,9 tok/s |
| Prefill 2k (TTFT p50) | 2.837 tok/s (0,53 s) |
| Prefill 8k (TTFT p50) | 2.895 tok/s (2,03 s) |
| Prefill 64k (TTFT p50) | 2.450 tok/s (19,2 s) |
| Aceptación de borradores a profundidad 7 | 53,8 % |

| Concurrencia (N) | tok/s agregados | TTFT p50 (ms) |
|---|---|---|
| 1 | 135,4 | 59,0 |
| 2 | 235,8 | 91,5 |
| 4 | 388,5 | 109,0 |
| 8 | 492,1 | 151,7 |

48 de 48 peticiones mixtas completadas correctamente en todos los niveles de concurrencia. El propio autor señala que el mismo drafter fusionado sobre otro merge de 27B MXFP4 aceptaba ~10 %, frente al 53,8 % de este, y que eso es lo que convierte ~35 tok/s limitados por ancho de banda en las cifras anteriores.

## Requisitos de hardware

- **VRAM**: 18,05 GiB de fichero, 14,84 GiB de pesos estáticos. En una tarjeta de 31,86 GiB quedan ~15,7 GiB para KV, suficientes para 262.144 tokens en una petición o ~433.000 tokens agregados en paralelo con KV cache FP8.
- **GPU objetivo**: AMD Radeon AI PRO R9700 (gfx1201, RDNA4) con ROCm. Es el hardware con el que se construyó y validó el contenedor.
- **Multi-GPU**: `--tp 2` en dos tarjetas funciona y es más rápido según el autor; no se publican cifras de ese escalado.
- **GPU de consumo**: las RDNA4 de consumo habituales (16 GB) no permiten cargar los 14,84 GiB de pesos dejando KV utilizable a 262k; no hay datos de ejecución en esas tarjetas. No hay soporte CUDA: el motor radiance es específico de ROCm/RDNA4, por lo que A100, H100 y RTX 4090 no son opciones para este fichero.
- **Despliegue**: exclusivamente mediante el motor radiance 1.5.0 o superior (`radiance --model ... --tp 1 --max-model-len 260000 --kv-cache-dtype fp8 --max-num-seqs 8 ...`) o su compose de Docker. No es compatible con vLLM, llama.cpp, Ollama ni TGI en este formato; para esos runtimes habría que buscar las releases GGUF de la familia.
- **Latencia y throughput**: 132,1 tok/s de decode agregado y TTFT p50 de 126 ms con 8 secuencias; prefill de 2.450 tok/s a 64k. La latencia de prefill es el cuello de botella en prompts muy largos (19,2 s para 64k únicos).
- **Parámetros de muestreo recomendados**: `--temp 1.0 --top-p 0.95 --top-k 20 --min-p 0.0 --presence-penalty 0.0 --repetition-penalty 1.0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad / formato |
|---|---|---|---|---|---|
| `cryoecho/Qwen3.8-27B-Uncensored-MXFP4-radiance` (este) | 27B | 262.144 | 132,1 tok/s decode agregado en 1× R9700; 53,8 % aceptación de borradores | Apache 2.0 | Solo `.rad` para radiance 1.5.0+, RDNA4/ROCm |
| `StillDeadcode/qwen3.8-27b-mxfp4` | 27B | No disponible | No disponible | No disponible | Misma cuantización y receta, tronco censurado (AMD) |
| `StillDeadcode/qwen3.8-27b-uncensored-fp8` | 27B | No disponible | No disponible | No disponible | Mismos pesos sin censura en FP8, 28,67 GiB; requiere ~29 GiB solo de pesos |
| `Solstice-AI/Qwen3.8-27B-...-GGUF-UltraOptimised` | 27B | No disponible | Cifras declaradas por el autor (735 ARC-C / 882 ARC-E) no verificadas aquí | No disponible | GGUF para llama.cpp/Ollama; incluye soporte MTP según la fuente |
| `junafinity/Qwen-3.8-27B-Uncensored` | 27B | No disponible | No disponible | No disponible | Pesos abiertos en HuggingFace; formato no detallado |

Frente al FP8 de los mismos pesos, este contenedor reduce el peso de 28,67 GiB a 18,05 GiB, lo que es la diferencia entre necesitar más de 32 GB y caber en una R9700 con KV holgado. Frente a las releases GGUF, pierde portabilidad (no funciona en llama.cpp/Ollama) y conserva MTP solo en aquellas, pero gana el drafter DFlash2 y el serving medido.

## Limitaciones y advertencias

- **Sin alineación de seguridad**: es una variante abliterated; producirá contenido que el modelo base rechaza. La responsabilidad de uso recae en el operador y no se ha evaluado para producción ni para entornos críticos de seguridad.
- **Cuantización agresiva**: MXFP4 es de 4 bits; la calidad del tronco es la de la release de origen y el `lm_head` se reexpresó a FP8 por bloques según la receta, lo que puede introducir degradación adicional no medida.
- **Sin benchmarks de calidad**: no hay MMLU, HumanEval ni GSM8K publicados para este fichero; las decisiones de despliegue no pueden apoyarse en cifras de calidad verificadas.
- **Sin cabezal MTP nativo**: los tensores `mtp.*` se descartaron durante la importación, así que no se puede comparar el rendimiento del drafter DFlash2 contra MTP en este contenedor; DFlash2 es el único especulador disponible.
- **Dependencia de un motor propietario**: requiere radiance 1.5.0+ y hardware RDNA4 con ROCm; no hay ruta a vLLM, TGI, llama.cpp ni CUDA. El formato `.rad` no es portable a otros runtimes.
- **Visión no validada en este fichero**: la torre está presente en bf16, pero el autor solo ejercitó generación de texto; el comportamiento con imágenes y vídeo está sin verificar.
- **Idiomas no documentados**: se desconoce la cobertura lingüística real de esta variante; conviene evaluarla antes de usarla en producción en castellano.
- **Riesgo de alucinación**: inherente a un 27B sin datos de evaluación publicados; el contexto de 262.144 tokens y el modo sin censura pueden amplificar afirmaciones no verificadas.
- **Sesgos**: no documentados; la eliminación de la alineación puede aumentar la probabilidad de contenido sesgado u ofensivo.
- **Licencia**: Apache 2.0 en este repo, pero conviene verificar las condiciones de los checkpoints de origen (`orcarouter/Qwen3.8-27B-Uncensored`, `just1moremodel/...`, `z-lab/Qwen3.8-27B-DFlash2`), cuya licencia no se detalla en la información disponible.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta; es una publicación muy reciente (octubre de 2026) sin validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cryoecho/Qwen3.8-27B-Uncensored-MXFP4-radiance
- Modelo base (MXFP4-AWQ): https://huggingface.co/just1moremodel/Qwen3.8-27B-Uncensored-MXFP4-awq
- Modelo base (sin censura, origen): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Drafter especulativo: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Contrapartida censurada (misma receta): https://huggingface.co/StillDeadcode/qwen3.8-27b-mxfp4
- Mismos pesos sin censura en FP8: https://huggingface.co/StillDeadcode/qwen3.8-27b-uncensored-fp8
- Variante GGUF de la familia: https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised
- Otra release de la familia: https://huggingface.co/junafinity/Qwen-3.8-27B-Uncensored
- Ficha del modelo en NanoGPT: https://nano-gpt.com/models/text/qwen/qwen3.8-27b-uncensored
- Guía de despliegue en local (LM Studio, requisitos): https://localairig.com/models/qwen3-8-27b-uncensored-hardware-deployment-guide/
- Repositorio de despliegue con Ollama: https://github.com/Wassimyounes01/qwen38-uncensored
