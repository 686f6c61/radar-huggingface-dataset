# defnoteatin/PseudoBrain-Nex-35B-A3B-BF16

## Resumen

PseudoBrain-Nex-35B-A3B-BF16 es un modelo de generación de texto conversacional desarrollado por el usuario de Hugging Face `defnoteatin` (Ian Kurt Galeon), publicado a finales de octubre de 2026. Se trata de una variante de 35,4 mil millones de parámetros (con unos 3 mil millones activos, según la nomenclatura A3B) basada en la arquitectura MoE de Qwen3.5 y en la familia Nex-N2.5-mini, con un sistema propio denominado PseudoBrain que combina atención por ventanas, capas recurrentes Gated DeltaNet y un mecanismo de memoria exacta por páginas llamado Quest Exact Memory.

El problema que aborda es el coste de memoria y cómputo del contexto largo en el serving de Transformers: mientras que la caché KV crece linealmente con la longitud y el prefill de forma cuadrática, PseudoBrain mantiene un estado recurrente de tamaño constante O(1) y una ventana activa reducida, lo que según el autor permite servir contextos de hasta 1.048.576 tokens (1M) en una sola GPU. El modelo está además "abliterated" (versión sin filtros de alineación derivada de `huihui-ai/Huihui-Qwen3.5-35B-A3B-abliterated`), lo que convierte su evaluación en algo que debe hacerse con cautela.

Esta edición BF16 pesa aproximadamente 70 GB y está pensada para GPUs de 80 GB o más (A100/H100, MI300X, DGX Spark). Existen ediciones alternativas en W4A16 (~18,5 GB, para GPUs de consumo de 24 GB), FP8 y NVFP4. El modelo se despliega con vLLM mediante un plugin propio (`pb27_vllm`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: MoE Transformer con Gated DeltaNet (PB27MoEForConditionalGeneration); 40 capas: 30 GDN + 10 de atención completa con SWA de 16K + GDN paralelo + Quest Exact Memory |
| Parametros totales | 35.444.366.576 (dato real de safetensors) |
| Parametros activos | ~3B (inferido de la denominación 35B-A3B; cifra exacta no disponible) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | BF16 (esta edición); existen variantes W4A16, FP8 y NVFP4 del mismo modelo |
| Idiomas soportados | No disponible (el modelo base es de la familia Qwen3.5, típicamente multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16), tamaño de repo 70,9 GB |

## Arquitectura y entrenamiento

La arquitectura PseudoBrain se apoya en cinco componentes descritos en la model card y en un paper de arquitectura publicado en GitHub. Primero, un esquema híbrido de 40 capas: 30 capas nativas de Gated DeltaNet (una red recurrente lineal cuyo estado tiene tamaño fijo O(1) independientemente del contexto) y 10 capas de atención completa (índices 3, 7, 11... 39) convertidas en una combinación de ventana deslizante de 16K tokens, GDN paralelo y Quest Exact Memory. Segundo, una memoria jerárquica de tres niveles con respaldo en NVMe/page cache (`piece_attention`), donde las queries atienden sobre sinks de StreamingLLM, landmarks de super-bloques, páginas top-k de memoria exacta y la ventana deslizante, fusionadas con FlashAttention-2 y cotas de super-bloque jerárquicas en bf16.

Tercero, un esquema de RoPE por bloques estrictamente no solapados (piecewise-proportional block RoPE) que preserva la continuidad local y la fidelidad de distancias temporales a escala de 1M tokens sin degradación estática tipo YaRN. Cuarto, una agregación global densa automática que detecta queries de alta participación y activa landmarks-resumen (1 por cada 4.096 tokens) y barridos de decodificación rotatorios. Quinto, una decodificación de coste constante que, según el autor, reduce la memoria de caché KV a 1M tokens en un 97,6 % (de ~20 GB a ~486 MiB de ventana activa, con un pool de 4,7 GB). El plugin de serving es compatible con los runners V1/V2 de vLLM.

Sobre el entrenamiento del modelo: no se dispone de datos publicados en la información proporcionada. Se sabe que es un finetune derivado de `Arahide/Nex-N2.5-mini-INT4-W4A16`, que a su vez procede de `nex-agi/Nex-N2.5-mini` y de la línea abliterated de Qwen3.5-35B-A3B. No hay información sobre número de tokens, composición del dataset ni uso de RLHF/DPO. El trabajo del autor se centra en la arquitectura de inferencia y el plugin de vLLM, no en el entrenamiento.

## Capacidades

- Generación de texto conversacional (pipeline text-generation), heredada del modelo base Qwen3.5-35B-A3B abliterated.
- Contexto ultra-largo: hasta 1.048.576 tokens con recuperación exacta según el autor (40/40 pruebas de recall exacto en el rango 8K–1M sobre una sola GPU de 24 GB en la edición W4A16; datos publicados en el repositorio de GitHub como "benchmark receipts").
- Razonamiento multi-paso: el mecanismo de barrido de memoria (novelty-rotating decode sweeps) está diseñado para que el razonamiento agéntico recorra cientos de bloques distintos en contextos de 1M tokens.
- Tool calling / function calling: soportado en el despliegue de vLLM mediante `--enable-auto-tool-choice --tool-call-parser qwen3_coder` y parser de razonamiento `qwen3`.
- Modelo abliterated: sin las salvaguardas de alineación del modelo original, lo que elimina rechazos pero también protecciones de seguridad.
- Compatibilidad con servidores compatibles con la API de OpenAI a través de vLLM.
- Soporte NVIDIA CUDA y AMD ROCm en el despliegue (según el autor).

## Casos de uso

- Analisis de repositorios de código completos: con 1M tokens de contexto se puede cargar un monorepo entero en una sola petición y realizar preguntas sobre él, aprovechando la recuperación exacta por páginas en las capas de memoria.
- Revisión de documentos legales o contratos extensos: la fidelidad de distancias temporales del RoPE por bloques está diseñada para mantener la coherencia a lo largo de documentos de cientos de miles de tokens.
- Agentes con memoria de sesión persistente: el estado recurrente O(1) y la memoria jerárquica permiten mantener conversaciones o sesiones agénticas muy largas sin crecimiento lineal de la caché KV.
- Atención al cliente con historial completo: el modelo puede operar sobre el histórico íntegro de interacciones de un cliente en un solo contexto, sin resúmenes intermedios.
- Procesamiento de logs y trazas de telemetría: la ventana activa constante hace viable analizar ficheros de logs de gran volumen en local.
- RAG denso sin chunking: en lugar de trocear documentos, se pueden indexar completos en el contexto y dejar que el mecanismo Quest recupere las páginas relevantes.
- Investigación en arquitecturas de contexto largo: el paper, el plugin de vLLM y los informes de benchmark públicos lo hacen útil como base para experimentar con atención híbrida y memoria jerárquica.

## Benchmarks y rendimiento

El autor publica como resultado principal una tasa de recuperación exacta del 100 % (40/40 pruebas) en tareas de recall exacto con contextos entre 8K y 1M tokens sobre una sola GPU de 24 GB (edición W4A16), con los detalles disponibles en el directorio `reports/` del repositorio de GitHub. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, por lo que no es posible comparar su calidad general con modelos equivalentes más allá de lo heredado de su linaje Qwen3.5.

## Requisitos de hardware

- VRAM para esta edición BF16: ~70 GB de pesos y ~75 GB totales a 1M tokens de contexto, según la model card.
- GPUs recomendadas: NVIDIA A100 u H100 de 80 GB, DGX Spark (128 GB) o AMD MI300X.
- No cabe en GPUs de consumo en esta edición BF16; para una sola RTX 3090/4090 de 24 GB el autor distribuye la edición W4A16 (~22,5 GB totales), y para L40S de 48 GB la edición FP8.
- Despliegue: vLLM con el plugin `pb27_vllm` (instalable desde GitHub, también incluido dentro del propio repositorio del checkpoint), con soporte de runners V1/V2 y fallback `ForwardContext`. No se menciona soporte para llama.cpp, Ollama o TGI.
- Parámetros de serving sugeridos por el autor: `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G`, `--max-num-seqs 16`.
- Latencia y throughput: el autor afirma decodificación de velocidad constante O(1) respecto a la longitud de contexto; no se publican cifras concretas de tokens/s en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| PseudoBrain-Nex-35B-A3B-BF16 | 35,4B (~3B activos) | 1.048.576 | Híbrida MoE + GDN + memoria Quest | Apache 2.0 | Requiere plugin vLLM propio; abliterated |
| Qwen3.5-35B-A3B (base) | ~35B (~3B activos) | No disponible en la información proporcionada | MoE Transformer | No disponible | Linaje original; sin el sistema PseudoBrain |
| Nex-N2.5-mini | No disponible | No disponible | No disponible | No disponible | Modelo base de la familia Nex; datos no publicados en la información disponible |

Cabe señalar que las variantes W4A16, FP8 y NVFP4 del propio PseudoBrain son las alternativas más directas dentro de la misma familia, con requerimientos de VRAM de ~22,5 GB, ~40 GB y ~27,5 GB respectivamente.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado las salvaguardas de seguridad del modelo base. No es apropiado para entornos de producción orientados a usuarios finales sin controles adicionales, y su uso puede plantear riesgos legales y éticos según la jurisdicción.
- Riesgo de alucinación: no evaluado; al ser un finetune sin documentación de entrenamiento, no hay datos de fiabilidad factual.
- Dependencia de un plugin de terceros: el despliegue a 1M tokens requiere `pb27_vllm`, mantenido por un único autor; la compatibilidad con futuras versiones de vLLM no está garantizada (aunque el autor declara soporte V1/V2 y fallback).
- Los resultados de recall exacto (40/40) proceden exclusivamente del autor y no han sido verificados de forma independiente.
- No hay benchmarks estándar de calidad (MMLU, código, matemáticas), lo que dificulta evaluar si la modificación arquitectónica degrada las capacidades generales del modelo base.
- Contexto de 1M tokens: el prefill sobre contextos muy largos sigue teniendo coste computacional significativo; la ventana deslizante de 16K y la memoria por páginas implican que no todo el contexto recibe atención densa en cada token.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse los términos de los modelos base subyacentes (Qwen3.5 y Nex-N2.5) y la condición abliterated del linaje.
- Proyecto individual: descargas moderadas (696 en el momento de la ficha) y sin comunidad de verificación amplia; se recomienda validación propia antes de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-Nex-35B-A3B-BF16
- Repositorio GitHub y plugin universal `pb27_vllm`: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Informes de benchmark: https://github.com/defnotean/pseudobrain/tree/main/reports
- Variante W4A16: https://huggingface.co/defnoteatin/PseudoBrain-Nex-35B-A3B-W4A16
- Variante FP8: https://huggingface.co/defnoteatin/PseudoBrain-Nex-35B-A3B-FP8
- Modelos base relacionados: https://huggingface.co/nex-agi/Nex-N2.5-mini, https://huggingface.co/Arahide/Nex-N2.5-mini-INT4-W4A16, https://huggingface.co/cbert33/Nex-N2.5-mini-FP8-Calibrated, https://huggingface.co/huihui-ai/Huihui-Qwen3.5-35B-A3B-abliterated
- Perfil del autor en GitHub: https://github.com/defnotean
