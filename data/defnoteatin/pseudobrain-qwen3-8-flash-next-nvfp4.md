# defnoteatin/PseudoBrain-Qwen3.8-Flash-Next-NVFP4

## Resumen

PseudoBrain-Qwen3.8-Flash-Next-NVFP4 es una cuantización NVFP4 del modelo Qwen3.8-Flash-Next, publicada por el desarrollador independiente defnoteatin (Ian Kurt Galeon). No se trata de un modelo nuevo entrenado desde cero, sino de una edición de inferencia optimizada para contextos ultra-largos: combina una arquitectura MoE ultra-esparsa de 36B parámetros totales con aproximadamente 1,7B activos por token, junto con un plugin propio para vLLM (denominado `pb27_vllm`) que implementa memoria exacta en tres niveles sobre NVMe y caché de página.

El problema que aborda es la escalabilidad del contexto largo en servidores de inferencia: mientras que en un transformer estándar la caché KV crece linealmente con la longitud de contexto y el coste de prefill de forma cuadrática, esta edición afirma reducir la memoria de la caché KV en contextos de 1M de tokens en más de un 96 %, dejando una ventana activa de unos 486 MiB (con un pool de 4,7 GB para 1,15M tokens).

Su relevancia actual radica en la combinación de tres elementos poco habituales juntos: contexto de 1.048.576 tokens, decodificación especulativa DFlash2 con velocidades anunciadas de 45–183 tok/s, y un tamaño de pesos de unos 21 GB en NVFP4, lo que permite ejecutar un modelo de 66,5B parámetros en GPUs consumer de gama alta de NVIDIA (arquitectura Blackwell). Está licenciado bajo Apache 2.0 y distribuido en formato safetensors para su uso con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: MoE ultra-esparsa + ventana de atención deslizante + Gated DeltaNet paralelo (clase `PB27Qwen4ExpForConditionalGeneration`) |
| Parametros totales | 66.516.386.579 (~66,5B, dato real de safetensors) |
| Parametros activos | ~1,7B por token (MoE ultra-esparsa 36B-A1.7B, según model card) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (esta edición); existen variantes W4A16, FP8 y BF16 del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 106,4 GB), diseñado para vLLM |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-Flash-Next, emplea una arquitectura híbrida de 48 capas: 36 capas nativas de Gated DeltaNet (un mecanismo recurrente cuyo estado tiene tamaño constante O(1), independientemente de que el contexto sea de 4K o 1M tokens) y 12 capas de atención completa, situadas en los índices [3, 7, 11, ..., 47], convertidas en atención deslizante de 16K combinada con Gated DeltaNet paralelo y "Quest Exact Memory". Sobre estas capas dispersas, las queries atienden sobre un conjunto compuesto por 4 sinks de StreamingLLM, landmarks de super-bloques, las top-k páginas de memoria exacta Quest y una ventana deslizante de 16.384 tokens, fusionadas mediante FlashAttention-2 con LSE-merge.

Entre las innovaciones técnicas destacadas en la model card figuran: un RoPE por bloques estrictamente no solapado y proporcional al histórico (que, según el autor, mantiene una fidelidad del 99 %+ en distancias temporales macro a 1M de tokens sin degradación estática tipo YaRN); agregación global densa con landmarks-resumen residentes en HBM (1 token resumen por cada 4.096 tokens); y decodificación especulativa DFlash2 con presupuesto de decodificación constante. El plugin `pb27_vllm` es compatible con los runners V1/V2 de vLLM y se registra automáticamente vía `vllm.general_plugins`.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), ni sobre si esta edición NVFP4 se obtuvo mediante cuantización post-entrenamiento con ModelOpt (la etiqueta "modelopt" sugiere que sí, pero no está confirmado en la documentación).

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiquetado como `conversational`).
- Manejo de contextos ultra-largos: hasta 1.048.576 tokens con memoria de caché KV prácticamente constante durante la decodificación.
- Decodificación especulativa mediante DFlash2, con velocidades anunciadas de 45–183 tok/s según configuración.
- Arquitectura MoE: activa solo ~1,7B de los 66,5B parámetros por token, lo que reduce el coste de cómputo por token manteniendo la capacidad del modelo completo.
- Integración con servidores compatibles con la API de OpenAI a través de vLLM.
- Soporte para NVIDIA CUDA y AMD ROCm en el plugin de servido (según el autor).
- No hay información disponible sobre capacidades multimodales (visión, audio), tool calling o razonamiento multi-paso específico.

## Casos de uso

- Análisis de repositorios de código completos: con 1M tokens de contexto se puede cargar en una sola petición un monorepo de tamaño medio para tareas de refactorización, revisión o documentación, sin necesidad de fragmentación ni RAG.
- Procesamiento de documentos legales y contratos extensos: análisis de expedientes completos, comparación de versiones de contratos de cientos de páginas y extracción de cláusulas manteniendo la coherencia global del documento.
- Chatbotas con memoria de sesión muy larga: la ventana de 1M tokens permite mantener conversaciones de semanas o meses sin resumen intermedio, aprovechando la memoria Quest exacta para recuperar detalles puntuales.
- Consulta sobre corpus técnicos: ingestión de manuales, documentación de API o bases de conocimiento completas para responder preguntas con citación del contexto, reduciendo la dependencia de sistemas RAG externos.
- Análisis de logs y telemetría: ingesta de grandes volúmenes de registros de sistema para diagnóstico de incidencias, identificando patrones dispersos a lo largo de millones de tokens de histórico.
- Resumen y síntesis de corpora académicos: procesamiento de colecciones de papers o informes científicos completos para generar revisiones bibliográficas coherentes.
- Despliegue on-premise en empresas con requisitos de privacidad: el autor ofrece explícitamente soporte para despliegues empresariales de 1M de contexto en local, con pesos Apache 2.0 sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card referencia "benchmark receipts" en el directorio `reports/` del repositorio de GitHub del autor, así como cifras de throughput de decodificación (45–183 tok/s con DFlash2) y una reducción del 96 %+ en memoria de caché KV a 1M tokens (~48 GB → ~486 MiB de ventana activa), pero no se incluyen tablas comparativas verificables con otros modelos en la documentación proporcionada.

## Requisitos de hardware

- Pesos del modelo: ~21 GB en NVFP4.
- VRAM total estimada a 1.000.000 tokens de contexto: ~27,5 GB (según la model card).
- GPUs objetivo declaradas: NVIDIA Blackwell — DGX Spark (GB10), RTX 5090 (32 GB), RTX PRO 6000 y B200. La variante NVFP4 requiere hardware con soporte nativo de este formato.
- Consumer GPUs: cabe en una RTX 5090 de 32 GB a contexto completo de 1M tokens. No es compatible con GPUs Ampere/Ada (RTX 3090/4090) en esta edición NVFP4 concreta; para esas GPUs el autor ofrece la variante W4A16 (~26 GB a 1M tokens).
- Despliegue: mediante vLLM con el plugin `pb27_vllm` (instalable con `pip install --no-deps "git+https://github.com/defnotean/pseudobrain.git#subdirectory=serving/pb27_vllm"`), lanzando el servidor con `--max-model-len 1048576` y `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`. La model card muestra uso de `--enforce-eager` y `--no-enable-prefix-caching`.
- Variables de configuración relevantes del plugin: `PB27_MEMORY_SUPERBLOCK=64`, `PB27_MEMORY_GLOBAL_AGG="auto"`, `PB27_MEMORY_DECODE_STRIDE=64`, `PB27_MEMORY_DECODE_BLOCKS=64`.
- Throughput estimado: 45–183 tok/s en decodificación con DFlash2 (dato del autor, sin condiciones de hardware especificadas).
- No hay datos de latencia de prefill disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | VRAM a 1M tokens | Licencia |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3.8-Flash-Next-NVFP4 | 66,5B (MoE, ~1,7B activos) | 1.048.576 | NVFP4 | ~27,5 GB | Apache 2.0 |
| PseudoBrain-Qwen3.8-Flash-Next-W4A16 (mismo autor) | 66,5B (MoE) | 1.048.576 | W4A16 | ~26,0 GB | Apache 2.0 |
| PseudoBrain-Qwen3.8-Flash-Next-FP8 (mismo autor) | 66,5B (MoE) | 1.048.576 | FP8 | ~42,0 GB | Apache 2.0 |
| PseudoBrain-Qwen3.8-Flash-Next-BF16 (mismo autor) | 66,5B (MoE) | 1.048.576 | BF16 | ~78,0 GB | Apache 2.0 |

La comparativa se limita a las otras ediciones de precisión del mismo autor, ya que no se dispone de datos suficientes para comparar de forma rigurosa con modelos de terceros de categoría similar (Qwen3-Next, MiniMax-M2 u otros MoE híbridos con contexto largo). Cabe señalar que la variante W4A16 es compatible con GPUs más antiguas (RTX 3090/4090, AMD MI300X), mientras que la NVFP4 exige hardware Blackwell.

## Limitaciones y advertencias

- El modelo es una publicación de un desarrollador independiente, no de un laboratorio establecido: no hay auditoría independiente de las cifras de rendimiento (45–183 tok/s, reducción del 96 % de memoria KV) ni de la fidelidad del contexto a 1M tokens; los "benchmark receipts" provienen del propio autor.
- Al tratarse de una arquitectura experimental (clase `qwen4_exp`, plugin de vLLM propio), la compatibilidad con versiones futuras de vLLM no está garantizada, aunque el autor declara soporte dual V1/V2 y un fallback sin hooks.
- La cuantización NVFP4 a 4 bits puede degradar la calidad de generación respecto a las variantes FP8 o BF16; no hay evaluaciones de calidad publicadas que cuantifiquen esta pérdida.
- No se dispone de información sobre idiomas soportados, sesgos conocidos, riesgo de alucinación ni resultados de benchmarks estandarizados: cualquier uso en producción debería validarse con pruebas propias.
- La configuración de servido mostrada desactiva el prefix caching (`--no-enable-prefix-caching`) y fuerza ejecución eager (`--enforce-eager`), lo que puede afectar al rendimiento en cargas con muchos prefills repetidos.
- La licencia Apache 2.0 no impone restricciones para uso comercial, pero conviene verificar las licencias del modelo base Qwen3.8-Flash-Next y de las cuantizaciones intermedias referenciadas en el repo.
- El hardware objetivo es exclusivamente NVIDIA Blackwell para esta edición NVFP4, lo que limita severamente el parque de GPUs compatible.
- Las descargas registradas (498) y los likes (0) indican adopción muy temprana y escasa validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.8-Flash-Next-NVFP4
- Repositorio GitHub del autor (plugin `pb27_vllm`): https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Reports de benchmarks del autor: https://github.com/defnotean/pseudobrain/tree/main/reports
- Variante W4A16: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.8-Flash-Next-W4A16
- Variante FP8: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.8-Flash-Next-FP8
- Variante BF16: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.8-Flash-Next-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
