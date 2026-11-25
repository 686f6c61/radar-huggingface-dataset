# ahrazzle/Qwen2.5-3B-Siliquant-A16-BlockH4-QuadLPT-p0375-4.5bpw

## Resumen

`ahrazzle/Qwen2.5-3B-Siliquant-A16-BlockH4-QuadLPT-p0375-4.5bpw` es una cuantización bit-packed del modelo `Qwen/Qwen2.5-3B` publicada por el usuario ahrazzle. Utiliza el formato propietario `siliquant-hf-v1` con una receta de cuantización basada en retículos (lattice quantization) sobre el código Extended Hamming `[16, 11, 4]`, combinada con transformadas Block-Hadamard de tamaño 4 y un esquema de cuantización de cocientes por capa. El objetivo declarado es de 4,5 bits por peso (bpw), aunque el peso empaquetado efectivo reportado es de 5,2388 bpw.

El modelo base es Qwen2.5-3B, un transformer decoder-only de la familia Qwen2.5 desarrollada por Alibaba. La cuantización preserva en bfloat16 las capas de embedding, `lm_head`, RMSNorms y sesgos, y cuantiza 252 capas lineales (2.774.532.096 pesos). El checkpoint resultante ocupa 2326,94 MiB frente a los 5885,79 MiB en BF16, lo que supone una reducción de 2,53x.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización poco convencional (retículos con corrección de errores algebraica) que promete decodificación sin pérdida bit a bit; por otro, advierte de que se trata de un artefacto experimental con cero descargas y cero likes en el momento de la consulta, sin benchmarks estándar publicados (MMLU, HumanEval, GSM8K) y con licencia heredada Qwen Research que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B) |
| Parametros totales | 2.050.963.558 (según safetensors); 2.774.532.096 pesos en capas lineales cuantizadas |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-3B soporta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Lattice A_16 Extended Hamming [16,11,4], Block-Hadamard H4, cocientes por capa (`qquot`), escalas fp16/int16, colscale fp32 opcional; objetivo 4,5 bpw, efectivo 5,2388 bpw |
| Idiomas soportados | No disponible |
| Licencia | Qwen Research License (heredada de Qwen/Qwen2.5-3B) |
| Formato de pesos | safetensors con custom_code (formato `siliquant-hf-v1`), requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-3B original: un transformer decoder-only con atención de múltiples cabezas, RoPE y normalización RMSNorm. Sobre esa base, esta publicación no reentrena el modelo, sino que aplica una cuantización post-entrenamiento (PTQ) sobre 252 capas lineales. La innovación técnica reside en el códec: cada vector de 16 pesos se representa en el retículo `A_16 = 2Z^16 + C_[16,11,4]`, almacenando 11 bits sistemáticos por bloque (0,6875 bpw) que permiten reconstruir algebraicamente los 5 bits de paridad en las posiciones {0, 1, 2, 4, 8}. Los cocientes enteros se empaquetan con un mínimo de bytes por capa (`k_bits in {2, 3, 4}`) más un flujo CSR compacto para desbordamientos.

El proceso de calibración utilizó 6.144 tokens disjuntos de validación de WikiText-2 (12 fragmentos de 512 tokens), con `load_power=0.375`. La verificación reporta 0 errores de síndrome en 173.408.256 bloques y una diferencia máxima de ida y vuelta de 0,0e+00 (exacta bit a bit). No hay información sobre datos de entrenamiento del modelo base ni sobre procesos de RLHF/DPO en esta publicación. Se incluyen kernels de referencia en CUDA (`sm86_a16_blockh4.cu`, PTX con `dp4a.s32.s32`) y AVX-512 (`vpermb` + `vpopcntq` + `vpdpbusd`), pero son independientes del contenedor de archivo sin pérdida y no se integran automáticamente en `transformers`.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Razonamiento, código y matemáticas heredados del modelo base Qwen2.5-3B (no verificados en esta ficha con benchmarks estándar).
- Capacidad multilingüe heredada del modelo base (idiomas no declarados en esta publicación).
- Carga directa en `transformers` con `trust_remote_code=True`, sin necesidad de compilación C++/CUDA.
- Exportación a pesos densos BF16 mediante `siliquant_dequant.py unpack` para su uso en otros motores.
- Verificación de integridad criptográfica (SHA-256) y de consistencia del códec A_16 bloque a bloque.
- No se declara soporte explícito de tool calling, function calling, agentes, visión, audio ni thinking mode en la información proporcionada.

## Casos de uso

- Evaluación de técnicas de cuantización por retículos: investigadores que quieran reproducir o auditar el códec `siliquant-hf-v1` pueden verificar la integridad bit a bit con `siliquant_dequant.py verify` y comparar la perplejidad frente al BF16 original (3,1119 vs 3,1623 en CPython; 10,9702 vs 11,1318 en WikiText-2).
- Despliegue en entornos con VRAM limitada: el checkpoint de 2,4 GB permite cargar el modelo en GPUs consumer de 8 GB o menos, a costa de requerir `trust_remote_code` y aceptar un rendimiento de decodificación dependiente de kernels no optimizados.
- Prototipado de pipelines de generación de texto en CPU: los kernels AVX-512 de referencia permiten probar decodificación en servidores Intel sin GPU, aunque no se reportan métricas de throughput.
- Investigación en compresión de modelos: la reducción de 2,53x frente a BF16 y el esquema de cocientes por capa sirven como caso de estudio para comparar con GPTQ, AWQ o GGUF Q4_K_M.
- Auditoría de integridad de artefactos: el recibo `siliquant_verification_receipt.json` con hashes SHA-256 es útil para pipelines que necesiten garantizar que los pesos no han sido manipulados.
- Educación y divulgación: el código algebraico Extended Hamming [16,11,4] es un ejemplo didáctico de aplicación de códigos correctores de errores a la cuantización de redes neuronales.
- No se recomienda su uso en producción comercial sin antes validar la licencia Qwen Research y sin benchmarks de tareas específicas.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de perplejidad y KL sobre corpus de calibración, no benchmarks estándar de tareas (MMLU, HumanEval, GSM8K). Se presentan a continuación:

| Metrica | BF16 (referencia) | Cuantizado | Delta |
|---|---|---|---|
| `cpython_ppl` | 3,111936 | 3,162256 | +1,62% |
| `wikitext2_ppl` | 10,970193 | 11,131778 | +1,47% |
| `cpython_mean_kl` | — | 0,018248 | — |
| `wikitext2_mean_kl` | — | 0,024678 | — |
| `cpython_top1_match_pct` | — | 95,181% | — |
| `wikitext2_top1_match_pct` | — | 91,8542% | — |
| `cpython_vs_blockh2_kl_delta` | 0,022975 | 0,018248 | -20,58% |
| `cpython_vs_sqrt_p0500_kl_delta` | 0,019520 | 0,018248 | -6,51% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,4-3 GB para cargar el checkpoint cuantizado en BF16/FP16 de escalas y capas no cuantizadas, más overhead de activaciones y caché KV (no cuantificada).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; se mencionan kernels de referencia para Ampere `sm_86` (RTX 30xx, A10, A40) y AVX-512 en CPU.
- Cabe en GPUs consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070 y superiores; también en GPUs integradas con suficiente memoria unificada, aunque sin métricas de latencia publicadas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (soporte nativo); exportación a safetensors densos BF16 para vLLM, TGI o llama.cpp mediante `siliquant_dequant.py unpack`; no se declara soporte nativo en Ollama, vLLM ni llama.cpp del formato empaquetado.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens/s ni de latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ahrazzle/Qwen2.5-3B-Siliquant-A16-BlockH4-QuadLPT-p0375-4.5bpw` | 2,05B (2,77B en lineales) | No disponible en esta ficha | Lattice A_16 + Block-H4, 5,2388 bpw efectivos | Qwen Research | Hugging Face, 0 descargas |
| `Qwen/Qwen2.5-3B` (base) | 3,09B | 32.768 tokens (según documentación upstream) | BF16 nativo | Qwen Research | Hugging Face, ampliamente usado |
| `Qwen/Qwen2.5-3B-Instruct-GGUF` (Q4_K_M) | 3,09B | 32.768 tokens | GGUF Q4_K_M (~4,5 bpw) | Qwen Research | Hugging Face, ampliamente usado |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1,54B | 32.768 tokens | BF16 / GGUF | Qwen Research | Hugging Face, ampliamente usado |

La comparación directa con cuantizaciones GGUF Q4_K_M es la más pertinente: ambas buscan ~4,5 bpw, pero la GGUF tiene soporte nativo en llama.cpp, Ollama y vLLM, mientras que esta publicación requiere `trust_remote_code` y no reporta throughput. No se dispone de benchmarks de tareas para comparar calidad entre ambas.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- Licencia Qwen Research: restringe el uso comercial. Es imprescindible revisar los términos upstream antes de cualquier despliegue empresarial.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del checkpoint; riesgo de seguridad si no se audita previamente.
- No se declaran idiomas soportados ni se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K); el rendimiento en tareas reales es desconocido.
- La perplejidad cuantizada es ligeramente superior a la BF16 (+1,5-1,6%), con una coincidencia top-1 del 91,85% en WikiText-2, lo que indica degradación medible aunque moderada.
- Los kernels CUDA y AVX-512 son de referencia y no se integran en `transformers`; la decodificación real puede ser más lenta que una cuantización estándar.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen2.5-3B, no mitigados por la cuantización.
- El tamaño de contexto efectivo no se confirma en esta ficha; no asumir los 32.768 tokens del modelo base sin verificación.
- El formato `siliquant-hf-v1` no es estándar; la portabilidad a otros motores exige exportar a BF16 denso, lo que elimina la ventaja de compresión.
- La verificación bit a bit garantiza integridad del códec, no corrección del comportamiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahrazzle/Qwen2.5-3B-Siliquant-A16-BlockH4-QuadLPT-p0375-4.5bpw
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Licencia upstream: https://huggingface.co/Qwen/Qwen2.5-3B/blob/main/LICENSE
- Repositorio de investigación: https://github.com/Moissanite-Labs/siliquant
- PRs relacionados: [#83](https://github.com/Moissanite-Labs/siliquant/pull/83), [#85](https://github.com/Moissanite-Labs/siliquant/pull/85), [#91](https://github.com/Moissanite-Labs/siliquant/pull/91), [#93](https://github.com/Moissanite-Labs/siliquant/pull/93), [#95](https://github.com/Moissanite-Labs/siliquant/pull/95)
