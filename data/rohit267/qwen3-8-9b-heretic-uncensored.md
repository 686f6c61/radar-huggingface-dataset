# rohit267/Qwen3.8-9B-heretic-uncensored

## Resumen

`rohit267/Qwen3.8-9B-heretic-uncensored` es una versión "decensored" (sin censura) del modelo `empero-ai/Qwen3.8-9B`, obtenida mediante el proceso de ablación direccional (abliteration) implementado en la herramienta Heretic v1.4.0. El modelo original es una destilación full-parameter del gigante Qwen3.8 2.4T A95B (un modelo MoE de frontera) sobre la arquitectura densa Qwen3.5-9B, entrenado con aproximadamente 70.000 trazas de razonamiento del teacher en dominios de matemáticas, código, razonamiento general, instrucciones y uso de herramientas.

El resultado es un modelo de 9.400 millones de parámetros con contexto nativo de 262.144 tokens, capaz de razonamiento encadenado (chain-of-thought) con bloques `thinking`, function calling nativo según la especificación Qwen3.5, y una reducción de los rechazos por alineación de seguridad gracias a la abliteration. Su relevancia radica en ofrecer una alternativa local y desplegable en una sola GPU para quienes necesitan un modelo de razonamiento sin restricciones de seguridad, manteniendo una divergencia KL mínima respecto al original (0,0008).

La licencia es Apache 2.0, los pesos están en formato safetensors y el modelo es reproducible (el repositorio incluye el directorio `reproduce` con los parámetros exactos de la abliteration).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal Gated DeltaNet (base Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | No publicados por el autor; el repo contiene pesos en bfloat16 (safetensors). Cuantizaciones GGUF/AWQ no oficiales disponibles en la comunidad |
| Idiomas soportados | Inglés (declarado en la model card); el base Qwen3.5-9B es multilingüe, pero el fine-tune y la abliteration solo se evaluaron en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.5-9B` es un transformer causal híbrido que combina capas de atención tradicional con capas de atención lineal basadas en Gated DeltaNet. Esta arquitectura requiere kernels especializados (`flash-linear-attention` y `causal_conv1d`) para un rendimiento óptimo; sin ellos, las capas lineales caen en operaciones PyTorch lentas y con alto consumo de memoria.

El entrenamiento del modelo original `empero-ai/Qwen3.8-9B` consistió en una destilación off-policy (SFT) a partir de ~70.000 trazas de chain-of-thought del teacher Qwen3.8 2.4T A95B, filtradas por calidad y ponderadas hacia matemáticas duras y programación competitiva. Cada respuesta comienza con un bloque `thinking` aprendido directamente de las trazas del teacher, no generado sintéticamente. El fine-tune fue completo (todos los parámetros actualizados, sin adaptadores).

Sobre esta base, `rohit267` aplicó Heretic v1.4.0, que combina ablación direccional (abliteration, Arditi et al. 2024) con un optimizador de parámetros basado en TPE (Optuna). Los parámetros de abliteration reportados incluyen `direction_index=17.74`, pesos máximos/mínimos en `attn.o_proj` y `mlp.down_proj` con sus posiciones y distancias. La divergencia KL entre el modelo heretic y el original es de 0,0008, lo que indica una alteración mínima de las capacidades generales.

## Capacidades

- Razonamiento encadenado (chain-of-thought): cada respuesta se abre con un bloque `thinking` que muestra el proceso de deliberación antes de la respuesta final.
- Function calling nativo: soporta la especificación de Qwen3.5 sin necesidad de wrappers ni fine-tunes específicos por herramienta.
- Matemáticas y código: el entrenamiento por destilación está ponderado hacia problemas matemáticos difíciles y programación competitiva.
- Contexto largo: ventana nativa de 262.144 tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Generación de texto conversacional: formato de chat estándar con `apply_chat_template`.
- Capacidad de visión heredada: el base Qwen3.5-9B es un modelo vision-language (image-text-to-text), aunque el fine-tune y la abliteration son solo de texto y la parte visual no fue evaluada por el autor.
- Reproducibilidad: el proceso de abliteration está documentado en el repositorio, permitiendo reproducir el modelo.

## Casos de uso

- Investigación en seguridad de IA: estudiar el comportamiento de modelos sin alineación de seguridad, comparando respuestas antes y después de la abliteration para entender los mecanismos de rechazo.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido que requiera explorar temas sensibles sin los filtros habituales de los modelos alineados.
- Desarrollo de agentes con function calling: integrar el modelo en pipelines de agentes que necesiten razonamiento multi-paso y llamadas a herramientas, aprovechando el soporte nativo de function calling y el contexto de 262K tokens.
- Análisis de documentos largos: resumir o extraer información de corpus extensos (manuales, contratos, código fuente) gracias a la ventana de contexto amplia.
- Generación de código en entornos aislados: asistencia de programación en dominios donde las políticas de seguridad del modelo base podrían bloquear ciertas consultas (por ejemplo, scripts de pentesting en entornos controlados).
- Evaluación comparativa de técnicas de desalineación: usar el modelo como referencia para medir el impacto de la abliteration en benchmarks de razonamiento (MMLU, GSM8K) frente al original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para la versión heretic-uncensored. La model card solo reporta métricas de fidelidad frente al original:

| Metrica | Modelo heretic | Original (empero-ai/Qwen3.8-9B) |
|---|---:|---:|
| Divergencia KL | 0,0008 | 0 (por definicion) |
| Refusals | 98/100 | 100/100 |

Nota: la métrica "Refusals" se reporta tal cual aparece en la model card; su interpretación (si cuenta rechazos o respuestas útiles) no está aclarada por el autor.

Los benchmarks del modelo original antes de la abliteration, medidos con `lm-evaluation-harness` (backend HF, protocolos CoT), son:

| Tarea | Metrica | Qwen3.5-9B (base) | Qwen3.8-9B (original) | Δ |
|---|---|---:|---:|---:|
| gsm8k_cot | exact_match (flexible) | 0,885 | 0,870 | −0,015 |
| gsm8k_cot | exact_match (strict) | 0,875 | 0,850 | −0,025 |
| mmlu (CoT, 57 materias) | acc (flexible-extract) | 0,546 | 0,751 | +0,205 |
| mmlu (CoT, 57 materias) | acc (strict-match) | 0,251 | 0,511 | +0,260 |

Muestreo usado: `temperature=0.6, top_p=0.95, top_k=20`.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~19 GB (el repo pesa 18,9 GB), por lo que se necesita una GPU con al menos 24 GB (RTX 4090, A100 40GB, H100).
- Con cuantización 4-bit (GGUF Q4_K_M, no oficial): ~6 GB de VRAM, cabe en GPUs consumer de 8-12 GB (RTX 3060 12GB, RTX 4070, etc.).
- GPUs recomendadas: RTX 4090 (24 GB) para bf16; A100/H100 para despliegue multi-usuario o throughput alto.
- Opciones de despliegue: Hugging Face Transformers (con kernels `flash-linear-attention` y `causal_conv1d`), vLLM, SGLang, llama.cpp (si se generan GGUF), Ollama (vía GGUF comunitario).
- Latencia y throughput: no publicados por el autor. Para un modelo de 9B en bf16 en una RTX 4090, se puede esperar un throughput de decodificación del orden de 30-60 tokens/s, pero es una estimación orientativa.
- Requisito adicional: es imprescindible instalar los kernels de Gated DeltaNet (`flash-linear-attention` y `causal_conv1d` compilado con CUDA) para evitar la caída a operaciones lentas en PyTorch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| rohit267/Qwen3.8-9B-heretic-uncensored | 9,4 B | 262.144 | Apache 2.0 | Abliterado con Heretic v1.4.0; solo inglés declarado |
| empero-ai/Qwen3.8-9B | 9,4 B | 262.144 | Apache 2.0 | Original sin abliteration; conserva la alineación de seguridad |
| Qwen/Qwen3.5-9B | 9,4 B | 262.144 | Apache 2.0 | Base sin destilación ni abliteration; multilingüe |
| llmfan46/Qwen3.5-9B-ultra-uncensored-heretic-v1 | 9,4 B | 262.144 | Apache 2.0 | Otro abliterado de Qwen3.5-9B con Heretic; benchmarks de preservación de capacidades publicados |
| DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF | 9,4 B | 262.144 | Apache 2.0 | Variante GGUF con mezclas adicionales (IMATRIX, MTP) |

La comparativa directa con otros abliterados de la misma base es limitada porque cada autor aplica parámetros de Heretic distintos; la divergencia KL y los refusals son las únicas métricas comparables publicadas.

## Limitaciones y advertencias

- La abliteration no elimina por completo los rechazos: la model card reporta 98/100 refusals, lo que sugiere que el modelo aún se niega a responder en la gran mayoría de los casos problemáticos (si la métrica se interpreta como rechazos). Esto contradice la expectativa de un modelo "uncensored" y debe verificarse empíricamente.
- La abliteration puede degradar capacidades de razonamiento o seguir patrones impredecibles en dominios sensibles; no se han publicado benchmarks de la versión heretic para confirmar que mantiene el rendimiento del original.
- El modelo solo declara soporte de inglés; el uso en otros idiomas no está evaluado y puede producir resultados degradados.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios poco representados en las trazas de entrenamiento.
- El fine-tune es solo de texto; las capacidades de visión heredadas del base no fueron evaluadas y podrían estar alteradas por la abliteration.
- La generación con decodificación greedy en secuencias largas es propensa a bucles de repetición; se recomienda muestreo con `temperature=0.6, top_p=0.95, top_k=20` y `max_new_tokens` generoso (16.384).
- El uso de un modelo sin alineación de seguridad conlleva responsabilidades legales y éticas; no debe desplegarse en producción sin una evaluación de riesgos adecuada.
- Requiere kernels especializados (Gated DeltaNet) para un rendimiento aceptable; sin ellos, la inferencia es lenta y consume mucha memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rohit267/Qwen3.8-9B-heretic-uncensored
- Modelo original (empero-ai/Qwen3.8-9B): https://huggingface.co/empero-ai/Qwen3.8-9B
- Base (Qwen/Qwen3.5-9B): https://huggingface.co/Qwen/Qwen3.5-9B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Proyecto Heretic: https://heretic-project.org
- Empero (desarrollador del modelo original): https://empero.org
- Repositorio flash-linear-attention: https://github.com/fla-org/flash-linear-attention
- Repositorio causal-conv1d: https://github.com/Dao-AILab/causal-conv1d
- Guía de modelos uncensored por VRAM (InsiderLLM): https://insiderllm.com/guides/best-uncensored-local-llms/
