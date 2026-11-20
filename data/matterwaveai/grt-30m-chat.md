# MatterWaveAI/grt-30m-chat

## Resumen

GRT-30M-Chat es el ajuste fino conversacional e instruccional del modelo base MatterWaveAI/grt-30m, desarrollado por MatterWaveAI. Se trata de un modelo de lenguaje causal de aproximadamente 29,8 millones de parámetros (29.844.597 según los pesos en safetensors; la model card cita 29.305.498 para el base) que emplea una arquitectura poco convencional denominada GRT (rotational transformer), basada en rotaciones de Givens y álgebra de Clifford, y que según el autor no contiene ninguna capa `nn.Linear`.

El modelo está formateado con la plantilla ChatML (`<|im_start|>` / `<|im_end|>`) y está pensado para conversación multi-turno. Su relevancia no reside en el rendimiento bruto —es un modelo de escala muy reducida— sino en servir de banco de pruebas para una familia de optimizadores geométricos (PairAdam, HessianPairAdam, CyclideAdam, HuygensAdam, etc.) que el autor evalúa sobre tareas de SFT conversacional.

La model card reporta métricas de alineación notables para su tamaño, como una perplejidad conversacional en validación que baja de 182,79 en el base a 1,34 tras 200 pasos de SFT con HessianPairAdam, y una precisión top-1 sobre tokens del asistente del 99,88 % (100 % con HuygensAdam). Estas cifras deben interpretarse con cautela, ya que proceden del propio autor y de conjuntos de validación no descritos en detalle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer rotacional (GRT): rotaciones de Givens y álgebra de Clifford, sin capas `nn.Linear` |
| Parametros totales | 29.844.597 (pesos safetensors); 29.305.498 según model card del base |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente fp32) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GRT (rotational transformer) del autor, que sustituye las proyecciones lineales densas por transformaciones basadas en rotaciones de Givens y estructura de álgebra de Clifford. La model card insiste en que el modelo base no contiene capas `nn.Linear` y que el ajuste se realiza sobre parámetros de fase y ángulo (por ejemplo, calibración de fase polar del token `<|im_end|>`). El ajuste fino conversacional se aplica sobre los bloques `blocks[9:12]`, `final_norm` y la fase del token de fin de turno, con 2.435.209 parámetros entrenables.

El entrenamiento consiste en 200 pasos de SFT con formato ChatML, batch de 36, learning rate 3,5e-3, `max_angular_step` de 0,08 y semilla 42, partiendo de un estado de prefijo cacheado idéntico (`blocks[:9]`). El autor compara ocho optimizadores geométricos propios (HessianPairAdam, CyclideAdam, PairAdam, HuygensAdam, HuygensSymplecticAdam, SymplecticAdam, GyricAdam, PolarNaturalAdam) en una GPU AMD con ROCm (gfx1151, "Spark"). No se documentan el volumen de tokens de entrenamiento, la composición del dataset de SFT ni si hubo RLHF o DPO; tampoco se describe el corpus del modelo base.

## Capacidades

- Generación de texto causal y conversación multi-turno con plantilla ChatML.
- Respuesta a instrucciones tras el ajuste SFT (pipeline `text-generation`).
- Soporte de `apply_chat_template` en transformers para construir prompts con roles.
- Generación determinista (`do_sample=False`) documentada en el ejemplo de uso.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües: no disponibles (los idiomas no están declarados).
- No se documentan capacidades de visión, audio ni modo "thinking"; la suite del autor incluye modelos VL y TTS separados, pero no forman parte de este checkpoint.

## Casos de uso

- Investigación sobre optimizadores geométricos: el modelo sirve como banco de pruebas reproducible para comparar los ocho optimizadores de `transformers.models.grt.optimization_grt` en una tarea de SFT ChatML con métricas de pérdida y perplejidad reportadas.
- Experimentación educativa con arquitecturas sin capas lineales: permite estudiar cómo se comporta un transformer basado en rotaciones de Givens en tareas de conversación a pequeña escala, con un coste computacional mínimo.
- Prototipado de pipelines de chat con transformers: al ocupar unos 0,1 GB de repositorio, se puede cargar en CPU o en cualquier GPU consumer para validar plantillas ChatML y flujos de generación extremo a extremo.
- Pruebas de integración de tokenizadores y plantillas de chat: útil para verificar `apply_chat_template`, manejo de tokens especiales y decodificación en entornos de CI sin necesidad de hardware dedicado.
- Evaluación de técnicas de calibración de fase polar: el ajuste se centra en la fase del token `<|im_end|>`, por lo que es un caso de estudio para investigar el control de tokens de terminación en modelos rotacionales.
- Docencia y divulgación: un modelo de 30 M de parámetros con arquitectura no estándar y licencia Apache 2.0 es adecuado para demostraciones en clase o talleres sobre alternativas a la atención y proyecciones lineales clásicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas internas de SFT y validación:

| Metrica | Base | Mejor resultado SFT | Optimizador |
|---|---|---|---|
| Perplejidad conversacional en validación | 182,79 | 1,3370 | HessianPairAdam |
| Pérdida del asistente en validación | 5,2083 | 0,2904 | HessianPairAdam |
| Precisión top-1 tokens del asistente | 24,69 % | 100,00 % | HuygensAdam |
| Pérdida validación multi-turno ChatML | 5,3480 | 1,6645 | HuygensAdam |
| Margen de respuesta del asistente (nats/token) | No disponible | 1,1464 | SymplecticAdam |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 120 MB para los pesos (29,8 M de parámetros × 4 bytes), más overhead de activaciones y del runtime de PyTorch.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso en CPU.
- GPU recomendadas: no se requieren GPU de datacenter (A100, H100); cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Despliegue: transformers con `AutoModelForCausalLM` (documentado). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al no publicarse pesos GGUF, llama.cpp y Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles. El entrenamiento de 200 pasos con 2,4 M de parámetros entrenables tardó entre 48,57 s y 70,50 s según el optimizador en una GPU AMD gfx1151, lo que da una idea del orden de magnitud del coste computacional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MatterWaveAI/grt-30m-chat | 29,8 M | No disponible | Apache 2.0 | Hugging Face, transformers | Arquitectura rotacional sin capas lineales; sin benchmarks estándar |
| MatterWaveAI/grt-30m (base) | 29,3 M | No disponible | Apache 2.0 | Hugging Face, transformers | Modelo base previo al SFT conversacional |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 tokens | Apache 2.0 | Hugging Face, amplio ecosistema | Transformer estándar, benchmarks públicos, mucho mayor |
| SmolLM-135M-Instruct | 135 M | 2.048 tokens | Apache 2.0 | Hugging Face, transformers | Transformer estándar, pensado para dispositivos |

La comparación con modelos de la misma escala es limitada porque no se han publicado resultados de benchmarks estándar para GRT-30M-Chat. Frente a TinyLlama o SmolLM, el modelo de MatterWaveAI es entre 4 y 45 veces más pequeño y su interés es fundamentalmente de investigación arquitectónica, no de rendimiento en tareas generales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no declararse idiomas ni composición del dataset, no es posible evaluar sesgos lingüísticos o culturales.
- Riesgo de alucinación: alto por su escala (30 M de parámetros) y por un ajuste SFT de solo 200 pasos; las métricas de validación del autor no garantizan veracidad factual.
- Las métricas de la model card (perplejidad 1,34, precisión top-1 del 100 %) proceden del propio autor, con conjuntos de validación no descritos, y no son comparables con benchmarks estándar.
- Longitud de contexto no documentada; no se debe asumir una ventana amplia para conversaciones largas.
- Idiomas soportados no declarados; el uso en castellano no está validado.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo de investigación sin garantías de calidad, no es recomendable en producción orientada a usuarios finales.
- No se documenta compatibilidad con herramientas de despliegue habituales (vLLM, TGI, llama.cpp, Ollama) ni existencia de pesos cuantizados.
- El ejemplo de la model card usa `dtype=torch.float32`; no se indica si existe soporte estable para bfloat16 o float16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-chat
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Variante MoE (Mixture-of-Rotations): https://huggingface.co/MatterWaveAI/grt-30m-mor
- Embedding: https://huggingface.co/MatterWaveAI/grt-30m-embedding
- Reranker: https://huggingface.co/MatterWaveAI/grt-30m-reranker
- Vision-Language: https://huggingface.co/MatterWaveAI/grt-30m-vl
- Tokenizer: https://huggingface.co/MatterWaveAI/grt-30m-tokenizer
- Text-to-Speech: https://huggingface.co/MatterWaveAI/grt-30m-tts
