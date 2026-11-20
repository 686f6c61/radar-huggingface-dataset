# juniorrios/automobil-ultra-semnexo

## Resumen
`juniorrios/automobil-ultra-semnexo` es un ajuste fino (LoRA fundido) del modelo base LiquidAI/LFM3-1.7B, desarrollado por el usuario juniorrios en el contexto de una prueba de concepto (POC) para CEMIG/CEIA. Resuelve un problema muy concreto: construir un asistente de seguridad laboral totalmente offline para dispositivos móviles que responda con citas verificables a partir de fragmentos de las 36 Normas Regulamentadoras (NR) brasileñas y de 9 manuales oficiales del Ministerio de Trabajo y Empleo (MTE). El modelo no almacena el conocimiento normativo en sus pesos, sino que lo recibe mediante una herramienta de búsqueda (`buscar_norma`) y debe razonar sobre los fragmentos recuperados.

Arquitectónicamente es un transformer de 1.728.801.536 parámetros (aproximadamente 1,7 B) con una ventana de contexto no especificada en la información disponible. Su relevancia actual radica en dos factores: por un lado, demuestra un patrón de despliegue RAG completamente offline en un teléfono Android con pesos cuantizados GGUF de apenas 1,05 GB; por otro, incorpora una etapa de RLVR (GRPO/DAPO) orientada a reducir alucinaciones cuando el contexto recuperado no contiene la respuesta, una métrica crítica en dominios regulados.

El modelo se distribuye bajo la LFM Open License v1.0, con restricciones de uso comercial ligadas a un umbral de ingresos anuales, y está especializado exclusivamente en portugués de Brasil.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer LFM3 (código propio: `modeling_lfm3.py`, `lfm3_conv.py`), ajuste LoRA fundido sobre LiquidAI/LFM3-1.7B |
| Parámetros totales | 1.728.801.536 (≈1,7 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (safetensors), GGUF Q4_0 (1,05 GB), GGUF Q4_K_M (1,10 GB) |
| Idiomas soportados | portugués (pt, PT-BR) |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial sujeto al límite de ingresos de la Sección 5 (US$ 10 M/año) |
| Formato de pesos | safetensors (bf16), GGUF (Q4_0, Q4_K_M) |

## Arquitectura y entrenamiento
El modelo parte de `LiquidAI/LFM3-1.7B` en variante instruct y se ajusta mediante dos etapas de LoRA con rango 32 aplicado únicamente a las capas MLP (`w1/w2/w3`, 72 módulos), con `assistant_only_loss` en el entrenamiento SFT de chat. Los datos de entrenamiento son 100 % sintéticos y generados a partir del texto público de las NR, sin datos de clientes ni preguntas de evaluación. La primera etapa (F3b `data2x-ep4`, 4 épocas) entrena el uso robusto del contexto recuperado: fragmentos correctos, distractores y rechazo cuando el fragmento no responde a la pregunta. La segunda etapa (F4 `f4-r32-ep2`) entrena el tool calling con el formato XML nativo de LFM3, incluyendo el turno de herramienta inyectado.

Sobre esa base, la versión v1.1 (`v3s400`) añade un mini-RLVR de *groundedness* mediante GRPO/DAPO durante 400 pasos, con una recompensa verificable por regla. El pipeline de inferencia es determinista en la fase de recuperación: clasificador de NR basado en TF-IDF + regresión logística, búsqueda BM25 sobre SQLite FTS5 (36 NR, 2202 fragmentos) con expansión robusta a errores de ASR, recuperación densa con EmbeddingGemma-300M, fusión RRF con k=10 y pesos (2, 1, 2), y compresión al 50 % de los tokens del top-2 mediante ventanas de 3 unidades con puntuación coseno + 0,3·léxico + 0,05/(rank+1). La generación usa temperatura 0,1, top_k 50, repetición 1,1 y semilla 42, con el modo *thinking* desactivado.

## Capacidades
- Generación de texto en portugués de Brasil con citación explícita de norma e ítem.
- Tool calling / function calling con el formato XML de LFM3, invocando la herramienta `buscar_norma`.
- Razonamiento sobre contexto recuperado (RAG) con manejo explícito de distractores.
- Rechazo controlado cuando el fragmento recuperado no contiene la respuesta (capacidad reforzada por RLVR).
- Respuesta a preguntas coloquiales y a entradas ruidosas procedentes de ASR.
- Generación de respuestas con fuentes y fragmentos exactos entregados al modelo (salida estructurada vía `--json`).
- Ejecución offline en dispositivo móvil mediante GGUF Q4_0.
- No se documentan capacidades de visión, audio nativo ni matemáticas avanzadas.

## Casos de uso
- Asistente de seguridad laboral en campo: un técnico consulta desde el móvil, sin cobertura, cuándo debe cambiar los bloqueos y etiquetas al rotar turno; el modelo recupera el fragmento de la NR correspondiente y responde citando norma e ítem.
- Auditoría de cumplimiento normativo: el equipo de seguridad introduce preguntas en lote (`--file perguntas.txt`) y obtiene respuestas con fuentes verificables para revisar procedimientos internos contra las 36 NR.
- Formación de operarios: preguntas coloquiales en lenguaje natural sobre procedimientos de trabajo en altura, espacios confinados o electricidad, con respuesta trazable a la norma.
- Integración con voz en campo: el pipeline admite entrada procedente de ASR (guía Nemotron 3.5 incluida) con expansión robusta a errores de transcripción, lo que permite consultas habladas con guantes o en entornos ruidosos.
- Verificación de groundedness en producción: la etapa RLVR y la salida con fragmentos exactos permiten monitorizar la tasa de alucinación en el distractor y rechazar respuestas no sustentadas antes de mostrarlas al usuario.
- Despliegue en dispositivos de gama media: el APK v1.2 descarga los modelos en el primer arranque y ejecuta el GGUF Q4_0 con llama.cpp, sin necesidad de `adb push` ni de conectividad.
- Base para otros dominios regulados: la receta (clasificador + BM25 + denso + RRF + compresión + LFM3 ajustado + RLVR de groundedness) es reutilizable para normativa sectorial equivalente en portugués.

## Benchmarks y rendimiento
Los datos publicados en la model card corresponden a la batería interna de la POC (juez de 27 B), no a benchmarks estándar:

| Métrica | f4-r32-ep2 (v1.0) | v3s400 (v1.1, RLVR) |
|---|---|---|
| Alucinación en distractor ×1536 | 23,8 % | 15,7 % |
| Fin a fin del app ×1536 | 64,1 % | 71,8 % |
| 151 preguntas coloquiales de la POC | 12,6 % | 21,2 % |
| Calidad GGUF Q4_0 vs bf16 | −4,9 p.p. | no disponible |
| Calidad GGUF Q4_K_M vs bf16 | −2,3 p.p. | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada en bf16: aproximadamente 3,5 GB solo para pesos (1,73 B × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en GGUF Q4_0: aproximadamente 1,05 GB de pesos; Q4_K_M, 1,10 GB.
- GPU recomendadas para bf16: cualquier GPU con 8 GB o más (RTX 3060/4060, RTX 4090, A100, H100). El modelo es sobredimensionado para estas GPUs; el cuello de botella real es la recuperación.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4-6 GB en cuantización Q4, y en CPU móvil vía llama.cpp.
- Despliegue: llama.cpp (fijado a un commit posterior a `19cce69` porque la versión 0.3.36 de PyPI no reconoce la arquitectura LFM3), `llama-cpp-python`, transformers ≥ 5.20 con `trust_remote_code`, y backend HF bf16 (`--backend hf`). El GGUF se puede cargar en GPU con `--n-gpu-layers 99`.
- Latencia y throughput: no se publican cifras absolutas; la model card indica que Q4_K_M es un 25 % más lento en prefill en móvil que Q4_0, motivo por el que el APK usa Q4_0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| automobil-ultra-semnexo | 1,7 B | no disponible | RAG NR PT-BR, tool calling | LFM Open License v1.0 | HF (safetensors + GGUF) |
| LiquidAI/LFM3-1.7B (base) | 1,7 B | no disponible | propósito general, multilingüe | LFM Open License v1.0 | HF |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 tokens (dato del modelo base, no verificado en esta búsqueda) | propósito general, multilingüe | Apache 2.0 | HF |
| Gemma-2-2B-it | 2 B | 8 192 tokens (dato del modelo base, no verificado en esta búsqueda) | propósito general, multilingüe | Gemma Terms of Use | HF |

La comparación directa en la tarea específica (groundedness sobre NR brasileñas) no está disponible para los modelos alternativos.

## Limitaciones y advertencias
- Especializado exclusivamente en portugués de Brasil; no se garantiza un comportamiento correcto en otros idiomas.
- El conocimiento normativo no reside en los pesos: sin la herramienta `buscar_norma` y los artefactos de recuperación, el modelo no puede responder con citas fiables.
- Tasa de alucinación residual del 15,7 % en el escenario de distractor incluso tras RLVR; requiere verificación humana en contextos de seguridad crítica.
- El modelo base y el ajuste se distribuyen bajo LFM Open License v1.0; el uso comercial está limitado por el umbral de ingresos anuales de US$ 10 M de la Sección 5.
- Los datos de entrenamiento son 100 % sintéticos; pueden no cubrir la variabilidad real de lenguaje de campo ni jerga regional.
- El pipeline depende de un commit concreto de `llama-cpp-python` y de transformers ≥ 5.20 con código remoto, lo que añade fragilidad en el mantenimiento.
- La compresión de contexto al 50 % puede descartar matices relevantes en fragmentos largos.
- No se documentan evaluaciones de sesgo ni de robustez frente a entradas adversariales.
- El repositorio tiene 0 likes y 1782 descargas en el momento de la consulta; no hay revisión por pares de los resultados publicados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/juniorrios/automobil-ultra-semnexo
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Dataset de artefactos de recuperación: https://huggingface.co/datasets/juniorrios/cemig-nr-retrieval-assets
- Código de inferencia: https://huggingface.co/juniorrios/automobil-ultra-semnexo/resolve/main/inference.py
- Requisitos: https://huggingface.co/juniorrios/automobil-ultra-semnexo/resolve/main/requirements.txt
- Licencia LFM Open License v1.0: https://huggingface.co/juniorrios/automobil-ultra-semnexo/resolve/main/LICENSE
- Guía de integración ASR: https://huggingface.co/juniorrios/automobil-ultra-semnexo/resolve/main/docs/GUIA_ASR_NEMOTRON.md
- APK Android v1.2: https://huggingface.co/juniorrios/automobil-ultra-semnexo/resolve/main/apk/cemig-assistente-v1.2.apk
