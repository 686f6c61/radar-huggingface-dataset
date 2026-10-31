# defnoteatin/PseudoBrain-27B-BF16

## Resumen

PseudoBrain-27B-BF16 es un modelo de generación de texto de 27B parámetros (29.635.444.976 exactos según los safetensors) creado por el desarrollador independiente defnoteatin (Ian Kurt Galeon). Se trata de un derivado "abliterated" (sin filtrados de seguridad) de la familia Qwen3.8/Qwen3.5 de 27B, concretamente de batsclamp/Huihui-Qwen3.8-27B-abliterated-FP8-v2, re-arquitecturado con la llamada "arquitectura PseudoBrain". Su propuesta de valor principal es la gestión de contextos extremadamente largos (hasta 1.048.576 tokens) con memoria de KV cache prácticamente constante: el autor afirma una reducción del 99,2 % de la memoria de KV cache a 1M tokens (de 64 GB a unos 486 MiB de ventana activa con un pool de 6 GB).

La relevancia del modelo radica en que ataca el cuello de botella clásico del serving de transformers largos: el crecimiento lineal O(L) de la KV cache y cuadrático O(L²) del cómputo de prefill. Para ello combina atención ventanada, capas recurrentes Gated DeltaNet de estado O(1) y un sistema de memoria dispersa por páginas ("Quest Exact Memory") integrado como plugin de vLLM. Está orientado a despliegues on-premise de contexto largo, razonamiento multi-paso y código, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas (48 Gated DeltaNet + 16 de atención completa con SWA de 16K + memoria dispersa), clase `PB27ForConditionalGeneration` |
| Parametros totales | 29.635.444.976 (~29,6B / "27B") |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | BF16 (esta edición); existen variantes W4A16, FP8 y NVFP4 en repositorios hermanos |
| Idiomas soportados | No disponible (hereda presumiblemente el multilingüismo de Qwen3, pero no está documentado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), tamaño del repo 59,3 GB |

## Arquitectura y entrenamiento

La arquitectura PseudoBrain es un híbrido de 64 capas que combina 48 capas nativas de Gated DeltaNet (una capa recurrente lineal con estado de tamaño fijo O(1) independiente de la longitud del contexto) con 16 capas de atención completa (en las posiciones 3, 7, 11, ..., 63) convertidas a un esquema de ventana deslizante de 16K tokens más Parallel Gated DeltaNet y "Quest Exact Memory". Sobre las capas de anclaje dispersas, las queries atienden sobre un conjunto compuesto por 4 sinks de StreamingLLM, landmarks de super-bloques, las top-k páginas de memoria exacta y la ventana deslizante de 16.384 tokens, fusionadas mediante FlashAttention-2 con LSE-merge y límites jerárquicos de dos niveles en bf16.

El posicionamiento se resuelve con un RoPE por bloques estrictamente no solapados ("Piecewise-Proportional Block RoPE"), que asigna una huella obligatoria de 64 tokens por bloque recuperado y escala proporcionalmente los huecos históricos, con el objetivo de preservar la fidelidad de distancias temporales a escala de 1M tokens sin degradación estática tipo YaRN. Además, un mecanismo de agregación global denso detecta queries de alta participación y activa landmarks-resumen (1 token por cada 4.096 tokens), cobertura temporal estratificada y barridos rotativos por novedad durante el decode, buscando un decode de velocidad y memoria constantes. Sobre el entrenamiento del modelo base (Qwen3.8-27B abliterated) y cualquier ajuste posterior, la información disponible no detalla número de tokens, composición del dataset ni uso de RLHF/DPO: no disponible. Tampoco se describe el proceso de "abliteration" más allá de la procedencia del checkpoint base.

## Capacidades

- Generación de texto conversacional (pipeline text-generation), heredada del linaje Qwen3.8 abliterated.
- Razonamiento multi-paso sobre contextos de hasta 1M tokens, con barridos de memoria diseñados para recorrer cientos de bloques distintos durante el decode.
- Manejo de documentos y repositorios completos en una sola ventana de contexto gracias a la arquitectura de memoria constante.
- Soporte de tool calling / function calling: el comando de serving recomendado activa `--enable-auto-tool-choice` con el parser `qwen3_coder` y razonamiento con parser `qwen3`.
- Integración como servidor compatible con la API de OpenAI mediante vLLM (runners V1/V2, con fallback `ForwardContext` sin hooks).
- Compatibilidad con NVIDIA CUDA y AMD ROCm a través de vLLM.
- Modelo "abliterated": sin capas de rechazo de seguridad, lo que elimina las negativas de alineación (con las implicaciones éticas y legales que ello conlleva).

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M tokens de contexto se puede cargar un monorepo entero para tareas de refactorización, revisión o generación de pruebas, y el parser `qwen3_coder` permite integrarlo en pipelines de CI/CD con tool calling.
- Due diligence documental: ingesta de contratos, informes financieros o expedientes regulatorios de cientos de miles de páginas en una sola sesión, con consultas que requieren cruzar información de secciones muy distantes.
- Asistentes sobre corpus técnicos (bases de conocimiento internas, wikis, historiales de soporte): la memoria de KV cache constante permite servir múltiples sesiones largas en una sola GPU sin OOM.
- Razonamiento agéntico multi-paso: el mecanismo de barrido por novedad está diseñado para que agentes que acumulan cientos de pasos mantengan acceso a hitos relevantes del historial completo.
- Investigacion y revision bibliografica: procesamiento simultáneo de decenas de papers completos (con apéndices) para síntesis comparativa.
- Chatbots sin restricciones de alineación para investigación en red-teaming y evaluación de seguridad, aprovechando la naturaleza abliterated del modelo.
- Despliegues on-premise de contexto extremo en sectores con requisitos de privacidad (salud, legal, defensa), donde el autor ofrece explícitamente soporte para instalaciones empresariales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card enlaza a un directorio de "benchmark receipts" en el repositorio de GitHub del proyecto (`reports/`) y a un paper de arquitectura, pero no incluye cifras numéricas verificables en el texto proporcionado. El único dato cuantitativo de rendimiento declarado es la reducción del 99,2 % en memoria de KV cache a 1M tokens (de 64,0 GB a ~486 MiB de ventana activa con un pool de 6 GB), que es una métrica de eficiencia de serving, no de calidad del modelo.

## Requisitos de hardware

- Edición BF16 (este repo): ~54 GB solo de pesos y ~60 GB de VRAM total estimada a 1M tokens.
- GPUs recomendadas: NVIDIA A100 u H100 de 80 GB, DGX Spark (128 GB), AMD MI300X, o 3x RTX 3090/4090 (24 GB cada una).
- No cabe en una única GPU de consumo de 24 GB en BF16; para hardware de consumo el autor publica la variante W4A16 (~20,5 GB totales a 1M tokens, cabe en una RTX 3090/4090/RX 7900 XTX de 24 GB) y la variante FP8 (~33,5 GB, para RTX 5090 de 32 GB, L40S, A100/H100, MI300X). La tabla del autor lista esta edición BF16 también con etiqueta "NVFP4" (~25,5 GB) para Blackwell (RTX 5090, DGX Spark GB10, B200), aunque la nomenclatura es ambigua en la model card.
- Despliegue: exclusivamente mediante vLLM con el plugin `pb27_vllm` (instalable desde GitHub o desde el directorio `pb27_vllm_plugin/` incluido en el propio checkpoint). No hay soporte documentado para llama.cpp, Ollama, TGI o transformers.
- Flags de serving relevantes: `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G`, `--max-num-seqs 16`, y variables de entorno como `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`, `PB27_MEMORY_SUPERBLOCK=64`, `PB27_MEMORY_DECODE_STRIDE=64`.
- Latencia y throughput: no disponible; el autor afirma decode de coste constante O(1) pero no publica mediciones de tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Memoria de KV a contexto largo | Licencia |
|---|---|---|---|---|---|
| PseudoBrain-27B-BF16 | 29,6B (denso) | 1M tokens | Hibrida GDN + SWA + memoria dispersa | ~Constante (O(1), 99,2 % de reduccion declarada) | Apache 2.0 |
| Qwen3-32B (base original de la familia) | 32,5B (denso) | 128K (con YaRN) | Transformer denso | Crece linealmente con el contexto | Apache 2.0 |
| Qwen3-30B-A3B | 30,5B (3,3B activos, MoE) | 128K | MoE Transformer | Crece linealmente con el contexto | Apache 2.0 |
| GLM-4-32B | 32B (denso) | 128K | Transformer denso | Crece linealmente con el contexto | MIT |

PseudoBrain-27B se diferencia de sus competidores de tamaño similar principalmente en la longitud de contexto nativa (1M frente a 128K) y en el coste de memoria del serving a contexto largo, a costa de requerir un plugin de vLLM específico y carecer de benchmarks públicos de calidad que permitan comparar el rendimiento en tareas estándar.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado los mecanismos de rechazo de seguridad del modelo base. Esto implica riesgo elevado de generar contenido dañino, ilegal o sesgado, y exige controles externos (moderacion, guardrails) en cualquier despliegue real.
- Ausencia total de benchmarks de calidad publicados: no hay garantías verificables de que la re-arquitectura (conversión de capas a GDN, memoria dispersa) preserve la calidad de razonamiento y código del modelo base Qwen3.8-27B.
- Alucinaciones: al tratarse de un derivado de Qwen3 sin ajuste fino documentado, hereda el riesgo estándar de alucinación, y la recuperación de información a 1M tokens mediante memoria dispersa y landmarks-resumen introduce además un riesgo propio de pérdida de detalle en contextos muy largos.
- Dependencia de un plugin propietario de vLLM: no funciona con llama.cpp, Ollama, TGI ni con la pila estándar de transformers; el mantenimiento del plugin depende de un desarrollador individual.
- Idiomas soportados no documentados explícitamente en la model card.
- Proyecto de autor individual con descargas modestas (710) y sin likes: madurez, soporte y trazabilidad limitados; la tabla de precisiones de la model card contiene inconsistencias (la edición BF16 aparece etiquetada como "NVFP4"), lo que aconseja verificación independiente antes de uso en producción.
- Licencia Apache 2.0: permite uso comercial, pero el origen "abliterated" del modelo puede entrar en conflicto con las políticas de uso de algunos proveedores cloud y con obligaciones regulatorias (por ejemplo, AI Act) según la jurisdicción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-27B-BF16
- Variantes del autor: https://huggingface.co/defnoteatin/PseudoBrain-27B-W4A16 · https://huggingface.co/defnoteatin/PseudoBrain-27B-FP8
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3-8-27B-abliterated (referenciado como huihui-ai/Huihui-Qwen3.8-27B-abliterated) · https://huggingface.co/batsclamp/Huihui-Qwen3.8-27B-abliterated-FP8-v2 · https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Aggressive-W4A16-AWQ
- Repositorio GitHub y plugin pb27_vllm: https://github.com/defnotean/pseudobrain
- Paper de arquitectura: https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf · https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Informes de benchmarks del autor: https://github.com/defnotean/pseudobrain/tree/main/reports
- Perfil GitHub del autor: https://github.com/defnotean
