# kindlingai/Qwen3.8-Flash-Next-exlr8

## Resumen

Qwen3.8-Flash-Next-exlr8 es una cuantización del modelo multimodal Qwen3.8-Flash-Next (familia Qwen, clase `Qwen4ExpForConditionalGeneration`) publicada por kindlingai en formato propietario exlr8 v2. El modelo base es un MoE híbrido multimodal de gran escala: 48 capas de texto que combinan 36 capas de atención lineal Gated DeltaNet con 12 capas de atención completa GQA-12 (con indexador disperso QSA de bloque 4), 512 expertos enrutados con top-10 más un experto compartido con compuerta por capa, y una torre de visión de 27 capas. La cuantización está pensada específicamente para dispositivos de memoria unificada de clase NVIDIA GB10 (DGX Spark, ASUS GX10) servidos en uno a cuatro nodos.

La innovación principal del release es el formato exlr8: cada experto enrutado y compartido se almacena a tres anchos de trellis (K2, K3 y K4) en el codebook `pmcgx`, y el ancho de servicio se elige en tiempo de carga. Esto permite ofrecer tres perfiles de calidad/tamaño (`bit200`, `bit300`, `bit400`) con divergencia KL medida frente al modelo BF16. La versión v0.3 añade además un drafter especulativo paralelo DFlash en Q4_0 (`drafter/dflash.q4_0.pack`, 523,8 MB) que el motor gr8 descubre automáticamente y que aporta aceleraciones de +38 % en código y +61–66 % en tareas estructuradas/de conteo en decodificación de un solo flujo, con paridad codiciosa byte a byte.

Es relevante ahora porque demuestra que un MoE multimodal de esta magnitud puede servirse en hardware de escritorio profesional (GB10) con pérdidas de perplejidad mínimas (+0,23 % en `bit300`, −0,17 % en `bit400` sobre WikiText-2), algo que hasta hace poco exigía clústeres multi-GPU convencionales. El repo ocupa 256,8 GB y acumula 12.081 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida multimodal MoE: 48 capas de texto (36 Gated DeltaNet linear-attention + 12 GQA-12 full attention con indexador disperso QSA block-4 en capas 3, 7, ..., 47), 4-stream low-rank hyper-connections (4 × 2560, rango 320), torre de visión de 27 capas, MTP drafter de 1 capa |
| Parametros totales | no disponible (el repo pesa 256,8 GB; el desglose de parámetros no se publica) |
| Parametros activos | 512 expertos enrutados con top-10 + 1 experto compartido con compuerta por capa; total de parámetros activos no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | exlr8 v2 con trellis `pmcgx` a anchos K2 / K3 / K4 (perfiles `bit200`, `bit300`, `bit400`); expertos en E4M3-rounded; dense, vocabulario, MTP, visión y PLE en BF16; drafter DFlash en Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | exlr8 (trellis `pmcgx` + side vectors), safetensors BF16 para dense/visión/MTP, `.pack` Q4_0 para el drafter DFlash, `.bin` para la tabla PLE Layer-1 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer híbrido con mezcla de expertos. La pila de texto alterna capas de atención lineal Gated DeltaNet (36) con capas de atención completa GQA de 12 cabezas (12), e incorpora un indexador disperso QSA de bloque 4 en las capas 3, 7, ..., 47 para reducir el coste de atención en contexto largo. Cada capa MoE contiene 512 expertos enrutados con enrutamiento top-10 más un experto compartido con compuerta. Los embeddings y la LM head están desacoplados y cuentan con 248.320 tokens de vocabulario. Adicionalmente, el modelo incluye una tabla de embeddings por capa (PLE) de 2/3-gramas de 320.001.536 × 160 en BF16, un drafter especulativo MTP de una capa con atención completa y una torre de visión de 27 capas con MRoPE 3D intercalado.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se publica información en la model card. Lo que sí se documenta es el proceso de cuantización: el encoder de exlr8 buscó únicamente sobre valores redondeados a FP8 E4M3 (round-to-nearest-even, saturante), de modo que el redondeo forma parte del formato y un decoder EXL3 estándar leería pesos peores desde los mismos bytes. Los expertos de las capas 0-47 se cuantizan a `pmcgx` K2/K3/K4; el resto de componentes (proyecciones dense, vocabulario, MTP, visión y PLE) se mantienen en BF16. La tabla PLE (102,4 GB) se sirve por streaming asíncrono desde NVMe local detrás de la capa 0.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno (pipeline `image-text-to-text`, tag `conversational`).
- Comprensión de imágenes: torre de visión de 27 capas en BF16 con MRoPE 3D intercalado, activable en gr8 con `GR8_QW38_VISION=1`.
- Codificación: el drafter DFlash reporta +38 % de velocidad en tareas de código en decodificación single-stream.
- Tareas estructuradas y de conteo: +61–66 % de aceleración con DFlash en decodificación single-stream.
- Decodificación especulativa: drafter DFlash paralelo por bloques (Q4_0) para single-stream y MTP grafiado de capa 48 (`--mtp 0..3`) para concurrencia multi-stream.
- Soporte multi-nodo: tensor parallelism de TP=1 a TP=4 con escalado de ancho en vivo (`GR8_PTAB=2`, `bin/g6layout`).
- Caché de prefijo/sesión KV sobre SSD con `O_DIRECT` (`KV_STORE=ssd:...`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en DGX Spark o ASUS GX10: el perfil `bit200` ocupa 46,4 GB residentes y deja 30,3 GB de expertos por caja en TP=1, lo que permite servir el modelo completo en un único dispositivo GB10 con memoria unificada, sin clúster.
- Asistente multimodal de documentación técnica: la torre de visión de 27 capas en BF16 permite introducir capturas, diagramas o páginas escaneadas junto a texto y mantener conversaciones multi-turno sobre el contenido.
- Generación de código en pipelines de desarrollo: con el drafter DFlash activo y +38 % de velocidad en decodificación single-stream, es adecuado para autocompletado y generación de parches en flujos interactivos donde la latencia por token es crítica.
- Extracción estructurada y conteo: el +61–66 % de aceleración en tareas estructuradas/de conteo con DFlash lo hace viable para procesamiento por lotes de formularios, inventarios o informes tabulares con salida JSON.
- Servicio multi-usuario con caché de sesión: usando MTP grafiado (`--mtp 0..3`) para concurrencia multi-stream y `KV_STORE=ssd:...` para persistir prefijos en NVMe, se puede atender a varios usuarios reutilizando contexto largo sin recalcular.
- Escalado horizontal en clúster pequeño: con TP=2 el perfil `bit300` deja 22,7 GB de expertos por caja, lo que permite repartir el modelo entre dos GB10 y aumentar la calidad efectiva (KL media 0,0124 frente a 0,0537 en `bit200`).
- Investigación en cuantización extrema: los tres perfiles con KL medida (mean/median), top-1 y perplejidad WikiText-2 publicados permiten estudiar la curva calidad/tamaño de un MoE multimodal de 512 expertos sin necesidad de acceso al modelo BF16 completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí publica métricas de fidelidad de la cuantización frente al modelo BF16:

| Perfil | bpw enrutado | Tamano residente | KL media (model-written) | KL mediana (model-written) | Top-1 (model-written) | KL media (WikiText-2) | PPL WikiText-2 (ref. 3,729) |
|---|---:|---:|---:|---:|---:|---:|---:|
| `bit200` | 2,00 | 46,4 GB | 0,0537 | 0,00743 | 92,60 % | 0,2177 | 3,845 (+3,11 %) |
| `bit300` | 3,00 | 61,5 GB | 0,0124 | 0,00157 | 96,34 % | 0,0796 | 3,737 (+0,23 %) |
| `bit400` | 4,00 | 76,6 GB | 0,0046 | 0,00054 | 97,70 % | 0,0373 | 3,723 (−0,17 %) |

Las métricas KL se calculan sobre vocabulario completo en `float64` (248.320 tokens) con 65.536 posiciones de test de WikiText-2 (32 × 2048) y 16.057 posiciones asistente generadas por el modelo (8 × 2048). Aceleraciones del drafter DFlash: +38 % en código y +61–66 % en tareas estructuradas/de conteo, con paridad codiciosa byte a byte.

## Requisitos de hardware

- VRAM/RAM unificada residente: 46,4 GB (`bit200`), 61,5 GB (`bit300`) o 76,6 GB (`bit400`), incluyendo 16,0 GB de dense, vocabulario, MTP y visión en BF16 (15,1 GB sin visión).
- El drafter DFlash añade 0,52 GB adicionales cuando se carga.
- La tabla PLE Layer-1 (`ple/exlr8-ple-L001.bin`, 102,4 GB) no reside en memoria: se sirve por streaming desde NVMe local.
- Hardware objetivo: dispositivos de memoria unificada clase NVIDIA GB10 (DGX Spark, ASUS GX10), de una a cuatro cajas.
- GPU consumer convencionales (RTX 4090, etc.): no disponibles como destino soportado; el formato exlr8 está diseñado para memoria unificada GB10 y el motor de referencia es gr8.
- Reparto por caja: con TP=1 los expertos ocupan 30,3 GB (`bit200`), 45,4 GB (`bit300`) o 60,5 GB (`bit400`); con TP=2 se reducen a 15,2 / 22,7 / 30,3 GB respectivamente.
- Motor de despliegue: kindlingai/gr8 (nativo exlr8), lanzado con `./gr8 qw38` a TP=1–TP=4. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Almacenamiento: se recomienda NVMe local para el streaming de PLE y para la caché KV en SSD (`O_DIRECT`).
- Latencia y throughput absolutos: no disponibles; solo se publican las aceleraciones relativas del drafter DFlash.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / hardware | Notas |
|---|---|---|---|---|---|
| kindlingai/Qwen3.8-Flash-Next-exlr8 | no disponible (repo 256,8 GB) | no disponible | qwen-community-1.0 | exlr8, GB10 | Este modelo; 3 perfiles K2/K3/K4 |
| kindlingai/glm-5.3-exlr8-k2-k3-k4 | no disponible | no disponible | no disponible | exlr8, GB10 | Mismo formato exlr8; modelo de otra familia |
| kindlingai/glm-5.3-flash-exlr8-k2-k3-k4 | no disponible | no disponible | no disponible | exlr8, GB10 | Variante flash del anterior, mismo formato |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | qwen-community-1.0 | BF16 (modelo base) | Referencia de calidad; requiere mucho más espacio |

La comparación con alternativas de otros formatos (GGUF, AWQ, GPTQ) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Los pesos no son utilizables sin redondeo E4M3: cualquier loader debe redondear cada valor producido por el codebook trellis a FP8 E4M3 (round-to-nearest-even, saturante) antes de aplicar los side vectors. Un decoder EXL3 estándar lee pesos mediblemente peores desde los mismos bytes.
- El formato exlr8 es propietario y solo está implementado en el motor kindlingai/gr8; no hay soporte documentado en vLLM, llama.cpp, Ollama, TGI ni transformers.
- El perfil `bit200` degrada la perplejidad WikiText-2 un +3,11 % y baja el top-1 model-written al 92,60 %; no es recomendable para tareas sensibles a la fidelidad.
- El modelo está diseñado para hardware GB10; no se documenta funcionamiento en GPUs consumer ni en clústeres convencionales.
- La tabla PLE de 102,4 GB requiere streaming desde NVMe local; sin almacenamiento rápido el rendimiento se degrada.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- No se documentan sesgos, riesgo de alucinación ni evaluaciones de seguridad del modelo base en la información disponible.
- Licencia qwen-community-1.0: es necesario revisar los términos del archivo LICENSE antes de cualquier uso comercial; la model card no detalla restricciones adicionales.
- El modelo tiene 1 like y 12.081 descargas; es un artefacto reciente (creado el 2026-11-23, actualizado el 2026-11-26) sin validación comunitaria amplia.
- La versión v0.3 solo modifica el drafter DFlash; el resto de archivos son byte-idénticos a v0.2 (`set_id`: `867c001a5358e0a1c74c86aab1dbefc9cf607b71a9e7ffd2a5bbf7fee77fd3d4`), lo que conviene verificar al cachear descargas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kindlingai/Qwen3.8-Flash-Next-exlr8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor gr8: https://github.com/kindlingai/gr8
- Documentación de gr8 para Qwen3.8: https://github.com/kindlingai/gr8/blob/main/docs/QWEN38.md
- Especificación del formato exlr8: https://github.com/kindlingai/exlr8/blob/main/FORMAT.md
- Receta 1× DGX Spark: https://github.com/kindlingai/recipes/tree/main/qwen3.8-flash-next/dgx-spark/1x/exlr8-gr8
- Cuantización hermana glm-5.3: https://huggingface.co/kindlingai/glm-5.3-exlr8-k2-k3-k4
- Cuantización hermana glm-5.3-flash: https://huggingface.co/kindlingai/glm-5.3-flash-exlr8-k2-k3-k4
