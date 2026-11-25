# cyjin-yl/ScarletKc-2.0-NVFP4

## Resumen

ScarletKc-2.0-NVFP4 es un checkpoint cuantizado del modelo multimodal ScarletKc-2.0, publicado por el usuario cyjin-yl en Hugging Face. Se trata de una derivación W4A16 en formato NVFP4 (pesos de 4 bits con escalas de bloque E4M3, grupo de 16, activaciones sin cuantizar) obtenida mediante cuantización post-entrenamiento (PTQ) con Local Hessian de NVIDIA ModelOpt, seguida de una destilación consciente de cuantización (QAD) que solo ajusta escalas. El modelo base es un transformer multimodal de tipo image-text-to-text con arquitectura híbrida Qwen3.5, que combina 16 capas de atención completa con 48 bloques de atención lineal de estilo Mamba, además de una torre de visión y una cabeza MTP (multi-token prediction).

El interés de esta ficha reside en que documenta con un nivel de detalle poco habitual el proceso de cuantización: hashes SHA-256 por tensor, recibos de ejecución, metodología de calibración y métricas de divergencia respecto al BF16 original (KL de 0,010185 nats/token y NLL de 0,301274 sobre 15 respuestas retenidas). El resultado es un modelo de aproximadamente 27.800 millones de parámetros con 262.144 tokens de contexto nativo, ampliable a 409.600 mediante una configuración YaRN publicada, y con licencia Apache 2.0.

Es relevante ahora porque demuestra que es posible producir checkpoints NVFP4 reproducibles y auditables en hardware antiguo (Tesla V100, SM70), sin kernels Triton nativos para FP4, recurriendo a emulación en CPU y a un backend Hessiano portable. Para desarrolladores que despliegan modelos multimodales de ~28B en infraestructura limitada, ofrece una vía de reducción de huella de memoria con trazabilidad completa del proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal híbrido (Qwen3.5): 16 capas de atención completa + 48 bloques de atención lineal estilo Mamba, torre de visión y cabeza MTP |
| Parametros totales | 27.781.427.952 (según safetensors); 28.551.539.168 bytes de tensores publicados |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens nativos; 409.600 con override YaRN publicado (`runtime/config-yarn-409600.json`) |
| Tipos de cuantizacion | W4A16 NVFP4 (pesos 4 bits, grupo 16, escalas E4M3; activaciones sin cuantizar); también etiquetado fp8 y w4a16 |
| Idiomas soportados | zh, en, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (13 shards + `model-mtp.safetensors`); índice con 1.711 tensores: 1.362 de lenguaje, 333 de visión, 15 de MTP y 1 `lm_head` |

## Arquitectura y entrenamiento

El modelo base ScarletKc-2.0 emplea una arquitectura híbrida Qwen3.5 en la que conviven capas de atención completa con bloques de atención lineal de inspiración Mamba, lo que reduce el coste computacional en contextos largos. El checkpoint cuantizado conserva en BF16, byte a byte, los embeddings, el `lm_head`, todas las layer norms, los 48 bloques de atención lineal, la torre de visión completa (333 tensores) y la cabeza MTP (15 tensores). Solo se cuantizan 256 lineales del lenguaje: todas las proyecciones `mlp.gate_proj`, `mlp.up_proj` y `mlp.down_proj`, más las proyecciones `q/k/v/o` de las 16 capas de atención completa.

El proceso de cuantización utilizó ModelOpt Local Hessian PTQ con búsqueda de escalas de bloque E4M3 (126 candidatos por bloque), calibrado con 512 secuencias empaquetadas de 2.048 tokens, es decir, 1.048.576 tokens reales por cada lineal cuantizado, sin tokens de relleno. La QAD posterior congeló los pesos fuente y los multiplicadores globales, ajustando únicamente escalas de bloque seleccionadas; se eligió el paso 30 por validación. El host de cuantización fue una Tesla V100-SXM2-32GB (SM70) con matemática BF16 emulada en FP32, ya que los kernels Triton 3.6 para FP4 no compilan en esa arquitectura. El runtime de servicio documentado es 1Cat-vLLM 1.5.4 con dos V100, TP2, cómputo FP16, caché KV E4M3 y MTP4.

## Capacidades

- Generación de texto conversacional en chino, inglés y japonés.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text), gracias a la torre de visión conservada íntegramente en BF16.
- Razonamiento multi-turno con ventanas de contexto muy largas: hasta 262.144 tokens nativos y 409.600 con YaRN.
- Predicción multi-token (MTP) para decodificación especulativa, con cabeza dedicada de 15 tensores.
- Capacidad multimodal nativa para tareas que combinan instrucciones textuales con entradas visuales.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modos de pensamiento extendido.

## Casos de uso

- Análisis de documentos largos con imágenes intercaladas: el modelo puede procesar manuales, informes o contratos de cientos de miles de tokens junto con sus figuras, aprovechando la ventana nativa de 262.144 tokens y la torre de visión intacta.
- Asistentes conversacionales multilingües para mercados de Asia Oriental: al cubrir chino, inglés y japonés, resulta adecuado para atención al cliente en entornos con esos tres idiomas y conversaciones multi-turno prolongadas.
- Extracción de información de capturas de pantalla y formularios: la combinación de visión y contexto largo permite transcribir y estructurar datos de interfaces o documentos escaneados en una sola pasada.
- Despliegue en infraestructura con VRAM limitada: al ser W4A16 NVFP4, reduce la huella de pesos respecto al BF16 y permite servir un modelo de ~28B en configuraciones de dos GPU de 32 GB, como documenta el autor con dos Tesla V100.
- Generación aumentada por recuperación sobre corpus extensos: la ventana de 409.600 tokens con YaRN permite inyectar muchos fragmentos recuperados sin truncamiento agresivo.
- Investigación en cuantización reproducible: el repositorio incluye manifiesto SHA-256, recibos de ejecución y metodología detallada, lo que lo convierte en material de referencia para estudiar PTQ con Local Hessian y QAD.
- Evaluación comparativa de fidelidad de cuantización: las métricas KL y NLL publicadas frente al BF16 permiten auditar la degradación introducida por la cuantización en un pipeline propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas de fidelidad de la cuantización frente al modelo BF16:

| Metrica | PTQ | Tras QAD |
|---|---|---|
| KL a BF16 (nats/token) | 0,010747 | 0,010185 |
| NLL | 0,301590 | 0,301274 |

Estas cifras se midieron sobre 15 respuestas retenidas independientes con 708 tokens de asistente.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 28,6 GB en pesos NVFP4; con caché KV E4M3 y overhead de runtime, se necesita un entorno de al menos 32 GB de memoria agregada para el modelo.
- GPU recomendadas: el autor documenta funcionamiento en 2 × Tesla V100-SXM2-32GB con TP2 y cómputo FP16. No se documenta compatibilidad con GPUs consumer en la información disponible.
- Cabe en consumer GPU: no disponible; no se aportan datos sobre RTX 4090 u otras tarjetas de consumo.
- Opciones de despliegue: 1Cat-vLLM 1.5.4 (runtime documentado por el autor); no se confirma soporte de llama.cpp, Ollama ni TGI para este formato NVFP4.
- Latencia y throughput: no disponibles; no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScarletKc-2.0-NVFP4 | ~27,8B | 262.144 (409.600 con YaRN) | W4A16 NVFP4 | Apache 2.0 | Hugging Face |
| ScarletKc-2.0 (BF16) | ~27,8B | 262.144 (409.600 con YaRN) | BF16 | Apache 2.0 | Hugging Face |
| Alternativas de ~28B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este checkpoint con modelos de la misma categoría.

## Limitaciones y advertencias

- La cuantización introduce una divergencia medible respecto al BF16 (KL de 0,010185 nats/token), por lo que no cabe esperar equivalencia bit a bit con el modelo original.
- El export se produjo con activaciones BF16 emuladas en FP32, mientras que el perfil de servicio usa cómputo FP16; el propio autor advierte que el repositorio no reclama equivalencia numérica entre ambos caminos.
- Solo se soportan oficialmente tres idiomas (chino, inglés y japonés); el rendimiento en castellano no está documentado.
- Riesgo de alucinación: no se publican evaluaciones de veracidad ni de sesgos en la información disponible.
- El soporte de tool calling y de razonamiento agéntico no está confirmado en la documentación.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento pueden arrastrar obligaciones adicionales que no se detallan.
- El formato NVFP4 requiere runtimes específicos; la portabilidad a stacks convencionales no está garantizada.
- El repositorio tiene muy poca tracción (163 descargas, 1 like) y procede de un autor individual, lo que aconseja validación propia antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/cyjin-yl/ScarletKc-2.0-NVFP4
- Modelo base: https://huggingface.co/ScarletKc/ScarletKc-2.0/tree/ddebd3b2d5f6a91e1d9491c3dc2982551ffb3340
- Manifiesto de integridad: `MANIFEST.sha256` (incluido en el repositorio)
- Metodología de cuantización: `quantization/quantization-method.json` (incluido en el repositorio)
- Método de adaptación: `quantization/adaptation-method.md` (incluido en el repositorio)
- Configuración YaRN: `runtime/config-yarn-409600.json` (incluida en el repositorio)
