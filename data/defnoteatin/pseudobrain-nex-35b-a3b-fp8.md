# defnoteatin/PseudoBrain-Nex-35B-A3B-FP8

## Resumen

PseudoBrain-Nex-35B-A3B-FP8 es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 35.109.233.796 parámetros totales, publicado por Ian Kurt Galeon (usuario `defnoteatin` en HuggingFace) bajo licencia Apache 2.0. Se construye sobre la familia Nex-N2.5-mini, que a su vez deriva de Qwen3.5-35B-A3B, y aplica la arquitectura propietaria PseudoBrain (clase `PB27MoEForConditionalGeneration`) para resolver el problema del coste de memoria de la caché KV en contextos largos. El modelo se distribuye en formato FP8 mediante `compressed-tensors` y está pensado para servirse con vLLM.

La innovación central es un esquema híbrido de atención que combina 30 capas de Gated DeltaNet (estado recurrente de tamaño fijo O(1)) con 10 capas de atención completa convertidas en ventana deslizante de 16K tokens más memoria exacta Quest de tres niveles sobre NVMe/page-cache. Según el autor, esto permite mantener una ventana activa de aproximadamente 486 MiB a 1M de tokens (frente a unos 20 GB de una caché KV convencional), con una reducción declarada del 97,6 % en memoria de caché KV.

El modelo se publica en varias precisiones (W4A16, FP8, NVFP4, BF16) y esta variante FP8 ocupa unos 35 GB de pesos, requiriendo del orden de 40 GB de VRAM total a 1M de tokens según la model card. Está etiquetado como "abliterated", lo que implica que se ha eliminado el mecanismo de rechazo, y declara capacidades de contexto de hasta 1.048.576 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con Gated DeltaNet + atención de ventana deslizante + memoria Quest (PseudoBrain, `PB27MoEForConditionalGeneration`) |
| Parametros totales | 35.109.233.796 |
| Parametros activos | A3B (aproximadamente 3B activos, segun nomenclatura; no se detalla desglose exacto) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | FP8 (esta variante); el autor publica además W4A16, NVFP4 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), pensado para vLLM |

## Arquitectura y entrenamiento

El modelo consta de 40 capas: 30 son Gated DeltaNet nativas y 10 son capas de atención completa (índices 3, 7, 11, ..., 39) reconvertidas a un esquema de ventana deslizante de 16.384 tokens combinado con Gated DeltaNet en paralelo y memoria exacta Quest. El estado recurrente de Gated DeltaNet es de tamaño fijo O(1), independiente de la longitud de contexto, lo que elimina el crecimiento lineal de la caché KV. Sobre las capas dispersas, las consultas atienden a un conjunto compuesto por 4 sinks estilo StreamingLLM, landmarks de super-bloques, las top-k páginas de memoria exacta Quest y la ventana deslizante de 16.384 tokens, fusionadas con FlashAttention-2 mediante LSE-merge.

La memoria Quest se organiza en tres niveles sobre NVMe y page-cache, con cotas jerárquicas en bf16 y super-bloques de 64. El autor describe además un esquema de RoPE por bloques estrictamente no solapados (`_reposition_rope_blocks`) que preserva la continuidad local y mantiene la fidelidad de distancia temporal macro a 1M de tokens, y una agregación global densa que activa resúmenes residentes de super-bloque (un token de resumen por cada 4.096 tokens) para consultas de alta participación global. El presupuesto de recuperación en prefill se desacopla del de decodificación (stride y bloques de decodificación de 64).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. El modelo deriva de una cadena de modelos base (nex-agi/Nex-N2.5-mini, cbert33/Nex-N2.5-mini-FP8-Calibrated, Arahide/Nex-N2.5-mini-INT4-W4A16 y huihui-ai/Huihui-Qwen3.5-35B-A3B-abliterated), por lo que hereda el entrenamiento de dichas fuentes, pero los detalles de dicho entrenamiento no están disponibles.

## Capacidades

- Generación de texto conversacional y de propósito general.
- Razonamiento multi-paso con recorrido sobre cientos de bloques distintos a 1M de tokens, según el autor.
- Contexto largo extremo: ventana declarada de 1.048.576 tokens con recuperación exacta declarada del 100 % (40/40) en el rango de 8K a 1M tokens.
- Memoria de decodificación constante: velocidad de decodificación O(1) independiente de la longitud de contexto.
- Soporte de tool calling y function calling mediante los parsers `qwen3` y `qwen3_coder` de vLLM (el quickstart del autor habilita `--enable-auto-tool-choice`).
- Compatibilidad con el parser de razonamiento `qwen3` (`--reasoning-parser qwen3`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "abliterated": el mecanismo de rechazo ha sido eliminado, por lo que el modelo no declina peticiones por política de seguridad interna.

## Casos de uso

- Análisis de repositorios completos: con 1M de tokens de contexto, el modelo puede ingerir una base de código extensa y responder preguntas transversales entre ficheros sin trocear el contenido, manteniendo memoria de decodificación constante.
- Agentes autónomos de larga duración: el soporte de tool calling con parser `qwen3_coder` y la ventana de 1M permiten mantener el historial completo de una sesión agéntica multi-paso sin truncar observaciones intermedias.
- Procesamiento de expedientes legales o contractuales: ingesta de contratos, anexos y correspondencia en una única ventana, con recuperación exacta de cláusulas concretas gracias a la memoria Quest de tres niveles.
- Auditoría de logs y trazas de sistemas: el modelo puede recibir un volcado extenso de logs y correlacionar eventos distantes en el tiempo dentro de la misma ventana, algo inviable con contextos de 128K.
- Despliegue on-premise con una sola GPU de 24 GB: la variante W4A16 del mismo autor (no esta FP8) permite servir 1M de contexto en una RTX 3090 o 4090, útil para entornos con restricciones de hardware y requisitos de privacidad.
- Investigación sobre atención eficiente: el modelo sirve como banco de pruebas para evaluar Gated DeltaNet, memoria Quest y RoPE por bloques en cargas de contexto largo, con el plugin `pb27_vllm` publicado en abierto.
- Asistentes de documentación técnica: ingesta de manuales y especificaciones extensas para responder consultas con referencias cruzadas entre secciones distantes.

## Benchmarks y rendimiento

El autor declara una recuperación exacta del 100 % (40/40) en el rango de 8K a 1M tokens, medida con los informes de benchmark publicados en el repositorio `reports/` del proyecto. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) ni comparaciones numéricas con modelos de referencia.

| Metrica | Resultado | Fuente |
|---|---|---|
| Recuperación exacta 8K–1M | 40/40 (100 %) | Model card del autor |
| Reducción de caché KV a 1M | 97,6 % (~20,0 GB → ~486 MiB ventana activa; pool de 4,7 GB) | Model card del autor |
| MMLU, HumanEval, GSM8K | no disponible | — |

## Requisitos de hardware

- VRAM estimada para esta variante FP8: aproximadamente 35 GB de pesos y unos 40 GB totales a 1M de tokens, según la model card.
- GPU recomendadas para FP8: L40S (48 GB), A100, H100, DGX Spark, AMD MI300X; también 2x RTX 3090 o 2x RTX 4090 en configuración multi-GPU.
- Variante W4A16 del mismo autor: unos 18,5 GB de pesos y 22,5 GB totales a 1M, apta para una única RTX 3090, RTX 4090, RX 7900 XTX (24 GB) o RTX 5090.
- Variante NVFP4: unos 22,5 GB de pesos y 27,5 GB totales, para NVIDIA Blackwell (RTX 5090 32 GB, DGX Spark GB10, B200).
- Variante BF16: unos 70 GB de pesos y 75 GB totales, para A100/H100 de 80 GB, DGX Spark de 128 GB o MI300X.
- Despliegue: vLLM con el plugin `pb27_vllm` (instalable vía `pip install --no-deps "git+https://github.com/defnotean/pseudobrain.git#subdirectory=serving/pb27_vllm"`), con soporte de runners V1 y V2. El quickstart del autor usa `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G` y `--max-num-seqs 16`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PseudoBrain-Nex-35B-A3B-FP8 | 35,1B totales (A3B) | 1.048.576 | Apache 2.0 | HuggingFace, vLLM con plugin | Memoria de decodificación O(1) |
| Nex-N2.5-mini (modelo base) | no disponible | no disponible | no disponible | HuggingFace | Base directa de este modelo |
| Qwen3.5-35B-A3B | ~35B (A3B) | no disponible | no disponible | HuggingFace | Arquitectura de origen de la familia |
| Huihui-Qwen3.5-35B-A3B-abliterated | ~35B (A3B) | no disponible | no disponible | HuggingFace | Variante abliterated usada como base |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo es "abliterated": se ha eliminado el mecanismo de rechazo, por lo que puede generar contenido que otros modelos declinarían. No es adecuado para despliegues orientados al público sin filtros externos.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad factual en la información disponible.
- Idiomas soportados no declarados; no hay garantía documentada de calidad multilingüe.
- La arquitectura PseudoBrain requiere el plugin `pb27_vllm` y una configuración específica de vLLM (`--enforce-eager`, sin prefix caching); no funciona con un servidor vLLM estándar sin el plugin.
- Los benchmarks declarados (40/40 de recuperación exacta) proceden del propio autor y no han sido verificados de forma independiente.
- La memoria Quest depende de NVMe y page-cache; el rendimiento puede degradarse si el almacenamiento es lento o si el sistema no permite el uso de page-cache.
- El modelo tiene solo 29 descargas y 0 likes en el momento de la ficha, lo que indica una validación comunitaria muy limitada.
- Aunque la licencia es Apache 2.0, conviene revisar las licencias de los modelos base de la cadena (Nex-N2.5-mini, Qwen3.5-35B-A3B) antes de un uso comercial en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-Nex-35B-A3B-FP8
- Repositorio GitHub del proyecto: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Informes de benchmark: https://github.com/defnotean/pseudobrain/tree/main/reports
- Variante W4A16: https://huggingface.co/defnoteatin/PseudoBrain-Nex-35B-A3B-W4A16
- Variante BF16: https://huggingface.co/defnoteatin/PseudoBrain-Nex-35B-A3B-BF16
- Modelo base Nex-N2.5-mini: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Base FP8 calibrada: https://huggingface.co/cbert33/Nex-N2.5-mini-FP8-Calibrated
- Base INT4 W4A16: https://huggingface.co/Arahide/Nex-N2.5-mini-INT4-W4A16
- Base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-35B-A3B-abliterated
- Perfil del autor en GitHub: https://github.com/defnotean
- Perfil del autor en HuggingFace: https://huggingface.co/defnoteatin
