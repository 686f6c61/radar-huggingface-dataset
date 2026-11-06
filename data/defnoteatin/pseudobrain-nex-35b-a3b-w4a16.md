# defnoteatin/PseudoBrain-Nex-35B-A3B-W4A16

## Resumen

PseudoBrain-Nex-35B-A3B-W4A16 es una re-implementación arquitectónica de un modelo MoE de 35B parámetros (3B activos) basado en la familia Qwen3.5-MoE / Nex-N2.5-mini, publicado por el desarrollador independiente Ian Kurt Galeon (@defnoteatin). Su objetivo declarado es resolver el cuello de botella de la memoria del KV cache en contextos extremadamente largos: mientras un Transformer estándar escala la memoria de forma lineal con la longitud de contexto y el prefill de forma cuadrática, este modelo combina atención con ventana deslizante y capas recurrentes Gated DeltaNet (GDN) de estado de tamaño constante O(1) para alcanzar contextos de hasta 1.048.576 tokens (1M) en una única GPU de 24 GB.

El repositorio incluye además un plugin propio para vLLM (`pb27_vllm`) que implementa un sistema de memoria exacta de tres niveles sobre NVMe/page-cache (Quest Exact Memory), RoPE por bloques proporcional y decodificación de velocidad constante. El autor reporta 40/40 aciertos exactos en pruebas de recuperación (recall) en el rango 8K–1M tokens, aunque estos resultados provienen de su propio repositorio y no de benchmarks independientes.

El modelo es "abliterated" (con los mecanismos de rechazo de instrucciones eliminados a partir de una variante de Huihui sobre Qwen3.5-35B-A3B), se distribuye bajo licencia Apache 2.0 en formato safetensors con cuantización W4A16 (compressed-tensors) y está optimizado para vLLM. Es relevante para desarrolladores que necesiten procesar documentos, repositorios de código o sesiones de agente de longitud extrema con hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PB27MoEForConditionalGeneration (híbrido: 30 capas Gated DeltaNet + 10 capas de atención completa con ventana deslizante de 16K + Quest Exact Memory) |
| Parametros totales | ~35B según nomenclatura del autor (6.827.640.496 parámetros reales medidos en safetensors, dato inconsistente con la denominación 35B-A3B) |
| Parametros activos | ~3B (MoE, según la nomenclatura A3B) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | W4A16 (pesos en 4 bits, activaciones en 16 bits, compressed-tensors); existen ediciones FP8, NVFP4 y BF16 en repositorios hermanos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), optimizado para vLLM |

## Arquitectura y entrenamiento

El modelo no es un entrenamiento desde cero, sino una modificación arquitectónica sobre pesos preexistentes (nex-agi/Nex-N2.5-mini, Arahide/Nex-N2.5-mini-INT4-W4A16, cbert33/Nex-N2.5-mini-FP8-Calibrated y huihui-ai/Huihui-Qwen3.5-35B-A3B-abliterated, esta última derivada de Qwen3.5-35B-A3B). La base es un MoE de la familia Qwen3.5 con aproximadamente 3B de parámetros activos por token. El autor la denomina "PseudoBrain architecture" y la describe en un documento técnico propio (PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf).

Los elementos técnicos clave son:

1. **Híbrido ventana + Gated DeltaNet:** el modelo tiene 40 capas: 30 son GDN nativas (capas recurrentes lineales con estado de tamaño fijo independiente del contexto) y 10 son capas de atención completa (índices 3, 7, 11, ..., 39) convertidas en atención con ventana deslizante de 16K tokens más GDN paralelo más Quest Exact Memory. El estado recurrente del GDN es O(1) en memoria tanto con 4K como con 1M tokens de contexto.
2. **Quest Exact Memory de tres niveles:** en las capas de anclaje dispersas, las queries atienden sobre 4 sinks de StreamingLLM, landmarks de super-bloques, top-k páginas de memoria exacta y la ventana deslizante de 16.384 tokens, fusionadas mediante FlashAttention-2 con límites jerárquicos bf16 de dos niveles (superbloques de 64).
3. **RoPE por bloques proporcional no solapado:** cada bloque recuperado ocupa obligatoriamente 64 tokens, con escalado proporcional de los huecos históricos, lo que según el autor preserva la continuidad local exacta y una fidelidad del 99%+ en las distancias temporales macro a 1M tokens, sin degradación estática tipo YaRN.
4. **Agregación global densa automática:** detección de queries globales con alta ratio de participación, resúmenes residentes por super-bloque (1 token resumen cada 4.096 tokens en HBM) y barridos rotativos por novedad durante el decode para razonamiento multi-paso sobre cientos de bloques.
5. **Decode O(1):** presupuesto de recuperación desacoplado entre prefill y decode (stride de 64, 64 bloques), reduciendo la memoria de KV cache a 1M tokens un 97,6% (de ~20,0 GB a ~486 MiB de ventana activa con un pool de 4,7 GB).

No se dispone de información sobre el pretraining original (tokens, composición del dataset, RLHF/DPO) más allá de la procedencia de los modelos base, ni sobre el proceso exacto de conversión de las capas de atención. El modelo es "abliterated": se han eliminado las salvaguardas de rechazo del modelo base.

## Capacidades

- Generación de texto conversacional (pipeline text-generation).
- Contexto extremo de hasta 1.048.576 tokens con recuperación exacta declarada (40/40 en pruebas propias de recall 8K–1M).
- Razonamiento multi-paso sobre contextos largos mediante barridos rotativos de bloques de memoria (diseñado para agentes).
- Soporte de tool calling: el comando de ejemplo del autor activa `--enable-auto-tool-choice` con parser `qwen3_coder`.
- Parser de razonamiento compatible con el formato `qwen3` (thinking mode del modelo base Qwen3.5).
- Compatibilidad con la API OpenAI a través de vLLM.
- Modelo abliterated: sin rechazos de seguridad, responde a instrucciones sin filtros.
- Capacidades multilingües: no disponibles explícitamente (heredadas presumiblemente de Qwen3.5, sin confirmación del autor).
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- **Analisis de documentos de longitud extrema:** con 1M tokens de ventana, puede ingerir de una sola vez libros completos, expedientes judiciales o documentación técnica extensa, y responder preguntas con recuperación exacta de detalles sin dividir el documento en fragmentos.
- **Agentes de código sobre repositorios completos:** el contexto de 1M permite cargar un repositorio entero y mantener sesiones de agente multi-paso con tool calling (parser qwen3_coder), razonando sobre cientos de archivos simultáneamente.
- **Chatbot con memoria de sesión persistente:** el estado O(1) del GDN y la Quest Exact Memory permiten mantener conversaciones de cientos de miles de tokens sin que el coste de memoria crezca con el historial, ideal para asistentes de largo plazo.
- **Procesamiento por lotes de logs o telemetría:** la decodificación de velocidad constante y la reducción del 97,6% en memoria de KV cache hacen viable analizar trazas enormes en una sola GPU de consumo.
- **Despliegue on-premise en hardware de consumo:** la edición W4A16 (~18,5 GB de pesos, ~22,5 GB totales a 1M tokens) cabe en una RTX 3090/4090 de 24 GB, útil para empresas que no pueden enviar datos a la nube.
- **RAG de alta fidelidad sustituido por contexto largo:** en lugar de un pipeline de recuperación con embeddings, se puede alimentar el corpus completo al modelo y confiar en el recall exacto declarado para las citas.
- **Asistentes sin restricciones de contenido:** al ser abliterated, es adecuado para entornos de investigación o ficción creativa donde se requiera ausencia de rechazos (con las advertencias legales y éticas correspondientes).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar independientes (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor reporta únicamente resultados propios no auditados:

| Métrica | Resultado | Fuente |
|---|---|---|
| Recall exacto 8K–1M tokens | 40/40 (100%) | Reports del propio autor (GitHub, carpeta reports/) |
| Reducción de memoria KV cache a 1M tokens | 97,6% (~20,0 GB → ~486 MiB activos, pool 4,7 GB) | Documentación del autor |

No existen comparaciones con modelos similares (Qwen3.5-35B-A3B original, u otros MoE de contexto largo) en la información disponible.

## Requisitos de hardware

- **VRAM para la edición W4A16 (este repositorio):** ~18,5 GB de pesos; ~22,5 GB totales con contexto de 1M tokens.
- **GPU recomendadas:** RTX 3090 o RTX 4090 (24 GB), AMD RX 7900 XTX (24 GB, vía ROCm), RTX 5090. Las ediciones alternativas requieren más memoria: FP8 ~40 GB (L40S, A100, H100, 2x3090/4090), NVFP4 ~27,5 GB (Blackwell: RTX 5090 32 GB, DGX Spark GB10, B200), BF16 ~75 GB (A100/H100 80 GB, DGX Spark 128 GB, MI300X).
- **Cabe en GPU de consumo:** sí, en cualquier GPU de 24 GB (RTX 3090/4090) con la cuantización W4A16, incluso con contexto de 1M tokens según el autor.
- **Despliegue:** vLLM (V1 y V2) mediante el plugin `pb27_vllm` (instalable con `pip install --no-deps git+...#subdirectory=serving/pb27_vllm` o incluido en el propio checkpoint en `pb27_vllm_plugin/`). No hay soporte documentado para llama.cpp, Ollama o TGI. Opciones recomendadas por el autor: `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G`, `--max-num-seqs 16`.
- **Latencia y throughput:** el autor declara decode de velocidad constante O(1) independiente del tamaño de contexto; no se publican cifras concretas de tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PseudoBrain-Nex-35B-A3B-W4A16 | ~35B total / ~3B activos (dato safetensors inconsistente: 6,83B) | 1.048.576 | Híbrido GDN + SWA + MoE, abliterated | Apache 2.0 | safetensors W4A16, solo vLLM con plugin propio |
| Qwen3.5-35B-A3B (base original) | ~35B total / ~3B activos | no disponible | MoE Transformer híbrido (Qwen3.5) | no disponible | Hugging Face, amplio soporte de engines |
| Nex-N2.5-mini (nex-agi) | no disponible | no disponible (tags sugieren 1M y GDN) | MoE con Gated DeltaNet | no disponible | Hugging Face |
| Huihui-Qwen3.5-35B-A3B-abliterated | ~35B / ~3B activos | no disponible | MoE Transformer, abliterated | no disponible | Hugging Face |

Nota: la comparación es aproximada, ya que el modelo de este repositorio es una derivada modificada de los anteriores y no se publican benchmarks comparativos directos.

## Limitaciones y advertencias

- **Modelo abliterated:** se han eliminado las salvaguardas de seguridad del modelo base. Puede generar contenido dañino, ilegal o inapropiado sin rechazarlo. Su uso conlleva responsabilidad legal y ética para el desplegador.
- **Inconsistencia en los parámetros:** la nomenclatura indica 35B-A3B, pero los safetensors suman 6,83B de parámetros. Esta discrepancia no está explicada en la model card y debe verificarse antes de producción.
- **Benchmarks no independientes:** las cifras de recall 40/40 y de reducción de memoria provienen exclusivamente del autor; no hay verificación de terceros ni comparativas con el modelo base.
- **Dependencia de un plugin propio:** el modelo requiere el plugin `pb27_vllm` del autor para funcionar en vLLM, lo que introduce riesgo de mantenimiento, compatibilidad con futuras versiones de vLLM y falta de auditoría del código.
- **Riesgo de alucinación:** no disponible información específica; al tratarse de una derivada de Qwen3.5 abliterated, hereda los riesgos de alucinación típicos de LLM generativos.
- **Sesgos conocidos:** no disponibles.
- **Idiomas:** no declarados explícitamente; verificar cobertura multilingüe antes de usar en producción.
- **Restricciones de licencia:** Apache 2.0 permite uso comercial sin restricciones significativas, aunque los modelos base subyacentes podrían tener condiciones propias que conviene revisar.
- **Configuración de serving restrictiva:** el autor recomienda desactivar prefix caching y usar enforce-eager, lo que puede penalizar el throughput en cargas con muchos prefijos compartidos.
- **Madurez del proyecto:** autor individual, 368 descargas y 0 likes en el momento de la ficha; proyecto muy reciente (creado en octubre de 2026) con historial limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Nex-35B-A3B-W4A16
- Repositorio GitHub y plugin pb27_vllm: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Reports de benchmarks del autor: https://github.com/defnotean/pseudobrain/tree/main/reports
- Modelo base principal: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Cuantización base W4A16: https://huggingface.co/Arahide/Nex-N2.5-mini-INT4-W4A16
- Versión FP8 calibrada: https://huggingface.co/cbert33/Nex-N2.5-mini-FP8-Calibrated
- Variante abliterated de origen: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-35B-A3B-abliterated
- Ediciones hermanas del autor: FP8 (https://huggingface.co/defnoteatin/PseudoBrain-Nex-35B-A3B-FP8), BF16 (no disponible URL exacta en la información proporcionada)
