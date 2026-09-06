# emee-ai/mnma_qwen3.8_27b_nvfp4

## Resumen

`emee-ai/mnma_qwen3.8_27b_nvfp4` es una cuantización NVFP4 W4A4 del modelo `Qwen/Qwen3.8-27B`, desarrollada por minima-ai y publicada también bajo `minima-ai/mnma_qwen3.8_27b_nvfp4`. El checkpoint cuantiza las 496 capas lineales del backbone (incluidas las 48 capas Gated DeltaNet y sus proyecciones de puerta) mediante calibración post-training, sin QAT ni destilación, y añade escalas FP8 estáticas para la caché KV. El modelo resuelve el problema de reducir los requisitos de memoria y latencia de un LLM de 27B manteniendo el rendimiento: el peso en VRAM baja de 50.13 GiB a 17.53 GiB, el throughput sube de 621 a 1,154 tok/s y el TTFT para prefill de 32K pasa de 6.90 a 4.03 segundos. El interés de este modelo es que demuestra que la arquitectura híbrida con capas Gated DeltaNet tolera cuantización a 4 bits, un hallazgo que contradice la suposición previa de fragilidad en capas recurrentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas Gated DeltaNet + 16 capas de atención + 64 capas MLP (extracción text-only de `Qwen3_5ForCausalLM`, sin torre de visión) |
| Parametros totales | 26.895.998.496 (26,9 mil millones) |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No disponible (evaluado hasta 64K en pruebas de recuperación RULER) |
| Tipos de cuantizacion | NVFP4 W4A4 (grupo 16) en capas lineales, con escalas globales armonizadas; KV cache FP8 estática calibrada; embeddings, `lm_head`, `conv1d`, norm y `A_log`/`dt_bias` en BF16 |
| Idiomas soportados | No disponibles (no se especifican en la información proporcionada) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (compressed-tensors, compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo es una cuantización del backbone híbrido `Qwen/Qwen3.8-27B`, compuesto por 48 capas Gated DeltaNet (GDN) y 16 capas de atención con caché KV en FP8. Todas las capas lineales (GDN, atención y MLP) se han cuantizado a NVFP4 W4A4 con grupo 16, sin entrenamiento consciente de cuantización ni destilación. La calibración se realizó sobre un conjunto congelado de 128 muestras de 32K tokens mediante `llm-compressor` (esquema `NVFP4` más `kv_cache_scheme` fp8/tensor/static). Los embeddings, la `lm_head`, las capas `conv1d`, las normalizaciones y los parámetros `A_log`/`dt_bias` se mantienen en BF16. La innovación técnica destacada es la armonización de las escalas globales: vLLM fusiona `in_proj_qkv+z` y `in_proj_b+a` en GEMMs NVFP4 con una escala global compartida, mientras que `llm-compressor` las calibra por módulo (con diferencias de hasta 2.8×). Este checkpoint ha reescrito los grupos fusionados para compartir escalas, lo que permite servir el modelo correctamente sin ajustes adicionales. El paper acompañante estudia por qué las capas Gated DeltaNet sobreviven a la cuantización de 4 bits.

## Capacidades

- Generación de texto y conversación con un template de chat que incluye modo de pensamiento (thinking), aunque en las evaluaciones se usó `enable_thinking=false` para MMLU-Pro y GSM8K y `thinking-on` para AIME, GPQA y LiveCodeBench.
- Razonamiento matemático avanzado: GSM8K 95.5 y AIME 2025 86.7 (pass@1 con 4 semillas).
- Conocimiento y razonamiento científico: MMLU-Pro 79.7 y GPQA-Diamond 85.1 (pass@1 con 4 semillas).
- Generación de código: LiveCodeBench v6 78.5.
- Recuperación de contexto largo: 100% en pruebas de aguja en pajar (single y multikey) a 32K y 64K tokens.
- Inferencia eficiente en servidores Blackwell, con KV cache FP8 calibrada embebida en el checkpoint.
- No se documenta soporte de tool calling ni de agentes multi-step en la información proporcionada.
- Capacidad multilingüe no especificada; el modelo es exclusivamente de texto, sin soporte de visión ni audio.

## Casos de uso

- Tutor inteligente de matemáticas: con puntuaciones de GSM8K 95.5 y AIME 86.7, el modelo puede resolver problemas aritméticos y de olimpiada paso a paso, lo que lo hace adecuado para plataformas de práctica generativa donde se requiere justificación detallada.
- Asistente de investigación científica: la nota de GPQA-Diamond (85.1) indica capacidad para razonar sobre preguntas de nivel de posgrado en ciencia; puede usarse para resumir literatura, formular hipótesis o preparar revisiones de artículos.
- Soporte de código en entornos de desarrollo: con una puntuación de LiveCodeBench v6 de 78.5, es viable como generador de soluciones en desafíos de programación, autocompletado en IDEs o asistente en pipelines de pruebas unitarias, aunque no se garantice un protocolo de tool calling.
- Análisis de documentos largos: la evaluación de RULER a 64K y la estabilidad de la perplejidad a 32K (10.50 vs 10.35 en BF16) permiten procesar informes técnicos, contratos o papers de gran extensión sin que el error de cuantización se acumule en el estado recurrente.
- Despliegue de servicios de chat con alta concurrencia: en una sola RTX PRO 6000 de 96 GB se alcanzan 1,154 tok/s de decodificación con concurrencia 32 y un TTFT de 4.03 segundos para prefill de 32K, lo que permite alojar aplicaciones de texto con muchos usuarios simultáneos.
- Referencia en investigación de cuantización: al ser un checkpoint NVFP4 sin QAT ni destilación, sirve como punto de partida para estudiar cómo afecta la cuantización a arquitecturas híbridas con Gated DeltaNet, especialmente en tareas de contexto largo y en comparación con el gemelo BF16.

## Benchmarks y rendimiento

Mediciones realizadas bajo el mismo régimen de servido (vLLM 0.27.1, TP=1, una RTX PRO 6000 de 96 GB, KV cache FP8), comparando con el modelo BF16 servido de forma idéntica:

| Prueba | BF16 | Este modelo |
|---|---|---|
| WikiText-2 perplejidad @4K | 6.95 | 7.68 |
| WikiText-2 perplejidad @32K | 10.35 | 10.50 |
| MMLU-Pro | 80.4 | 79.7 |
| GSM8K | 95.5 | 95.5 |
| AIME 2025 (pass@1, 4 semillas) | 86.7 | 86.7 |
| GPQA-Diamond (pass@1, 4 semillas) | 86.5 | 85.1 |
| LiveCodeBench v6 | 79.0 | 78.5 |
| RULER NIAH single/multikey @32K, @64K | 100 ×4 | 100 ×4 |

Rendimiento de servido adicional:

| Metrica | BF16 | Este modelo |
|---|---|---|
| Pesos en VRAM | 50.13 GiB | 17.53 GiB |
| Decode tok/s (1K entrada / 1K salida, concurrencia 32) | 621 | 1,154 |
| TTFT, prefill de 32K tokens | 6.90 s | 4.03 s |

Ninguna diferencia en las puntuaciones de tareas es estadísticamente significativa (CI-separated) respecto al BF16. La brecha de perplejidad en WikiText-2 se reduce al aumentar el contexto: +0.73 a 4K y +0.15 a 32K. Las pruebas de velocidad y perplejidad se midieron directamente sobre este checkpoint; las filas de tareas se midieron sobre un gemelo sin escalas de KV.

## Requisitos de hardware

- VRAM de pesos: 17.53 GiB. La VRAM total para inferencia no está especificada, ya que depende de la longitud del contexto, el tamaño de la caché KV FP8 y las activaciones.
- GPU recomendada: una RTX PRO 6000 de 96 GB, como en las pruebas. El modelo requiere hardware con soporte nativo NVFP4, es decir, arquitectura Blackwell con SM120.
- No está indicado si funciona en GPUs de consumo de generaciones anteriores (Ada, Ampere) sin soporte nativo NVFP4.
- Despliegue: vLLM 0.27 o superior, con el comando `vllm serve minima-ai/mnma_qwen3.8_27b_nvfp4 --kv-cache-dtype fp8` para cargar las escalas de KV calibradas.
- Latencia y throughput: 1,154 tok/s de decodificación y 4.03 s de TTFT para prefill de 32K tokens, medidos con TP=1, KV cache FP8 y concurrencia 32.
- No se mencionan opciones de despliegue con llama.cpp u Ollama.

## Comparativa con modelos similares

No disponible. La información proporcionada solo compara el modelo con su gemelo BF16 (`Qwen3.8-27B` sin cuantizar) en la sección de benchmarks; no se aportan datos de otras alternativas de la misma categoría.

## Limitaciones y advertencias

- No se documentan sesgos conocidos ni riesgos de alucinación en la model card; como todo LLM, debe evaluarse en el dominio de uso antes de desplegarse en producción.
- Los idiomas soportados no están especificados; el modelo es exclusivamente de texto, sin visión ni audio.
- Requiere hardware específico con soporte nativo NVFP4 (SM120/Blackwell) y vLLM 0.27 o superior, lo que limita su ejecución en GPUs convencionales o en stacks de despliegue alternativos.
- La cuantización produce una ligera pérdida de calidad en contexto corto (+0.73 de perplejidad en WikiText-2 a 4K), aunque la brecha se reduce a +0.15 a 32K y parece no acumularse en el estado recurrente.
- El README advierte que las escalas globales deben estar armonizadas; servir un checkpoint sin armonizar degradaría silenciosamente el rendimiento de las puertas de GDN. Este checkpoint ya está corregido, pero cualquier modificación de los pesos o de la configuración de fusión debe rehacer la armonización.
- La licencia Apache-2.0 permite uso comercial, pero la responsabilidad final del uso recae en el desarrollador y en la política de uso del modelo base.
- No se documenta soporte de tool calling ni de razonamiento multi-paso explícito; el modo de pensamiento está presente en el template, pero su rendimiento en tareas de agente requiere validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emee-ai/mnma_qwen3.8_27b_nvfp4
- Publicación alternativa del mismo modelo: https://huggingface.co/minima-ai/mnma_qwen3.8_27b_nvfp4
- Modelo relacionado del mismo autor: https://huggingface.co/emee-ai/Qwen3.8-27B-NVFP4
- Paper (arXiv 2609.04098): https://arxiv.org/abs/2609.04098
- Repositorio llm-compressor (vLLM): https://github.com/vllm-project/llm-compressor
