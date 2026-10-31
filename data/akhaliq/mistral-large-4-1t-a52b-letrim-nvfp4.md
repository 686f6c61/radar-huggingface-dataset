# akhaliq/Mistral-Large-4-1T-A52B-LeTrim-NVFP4

## Resumen

Mistral Large 4 — Le Trim (NVFP4) es una derivada podada del modelo Mistral Large 4 de Mistral AI (mistralai/Mistral-Large-4-1T-A52B), publicada por akhaliq el mismo día del lanzamiento del modelo base (29 de octubre de 2026). Se trata de la primera variante con poda de expertos del Mistral Large 4: se eliminan expertos enrutados de cada una de las 71 capas MoE dispersas del modelo original, manteniendo los parámetros activos por token en unos 52B, ya que el router sigue seleccionando 4 expertos por token de un pool más reducido.

El problema que resuelve es de memoria, no de velocidad: al mantenerse los pesos residentes en VRAM y no cambiar los expertos activos, el coste de decodificación por token es idéntico al del modelo base, pero el checkpoint se reduce de forma que la variante 25% cabe en 4 GPUs B200 (564 GB) donde el base NVFP4 necesita 8, y la variante 50% reduce el checkpoint a 320 GB con solo un +1,4% de perplexity. La poda se realiza con AIMER, un criterio de poda sin datos de calibración, aplicado como cirugía pura de pesos sobre el checkpoint NVFP4 oficial.

Es relevante porque demuestra que la poda de expertos en MoEs de escala 1T puede ser casi sin pérdida, y porque ofrece una vía práctica para desplegar modelos frontera en menos hardware. El repositorio incluye dos variantes (Le Trim 25% y Le Trim 50%) y datos de validación de perplexity, logprob y throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con atención dispersa (DSA) y torre de visión; cabeza de borrador DSpark embebida |
| Parametros totales | ~750B (Le Trim 25%, revisión `main`); ~500B (Le Trim 50%, revisión `letrim50`); base: 1T aprox. |
| Parametros activos | ~52B por token (4 expertos de 128 en el base; 4 de 96 en el 25%; 4 de 64 en el 50%) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (heredada del checkpoint oficial, escalas incluidas) |
| Idiomas soportados | no disponibles |
| Licencia | Mistral Ecosystem Open-Weight License (MIT modificado; el modelo como servicio requiere licencia separada de Mistral) |
| Formato de pesos | safetensors consolidados + params.json (formato Mistral nativo) |

## Arquitectura y entrenamiento

El modelo parte de Mistral Large 4, un MoE de ~1T parámetros con 71 capas dispersas de 128 expertos cada una, de las que el router activa 4 por token (~52B parámetros activos). Conserva la indexador de atención dispersa (DSA), la torre de visión y la cabeza de borrador DSpark para decodificación especulativa, todos preservados byte a byte respecto al checkpoint oficial NVFP4.

No hay entrenamiento: la poda se realiza con AIMER (arXiv 2603.18492, EMNLP 2026), un criterio de poda *data-free* que puntúa cada experto mediante el ratio de dispersión estilo Hoyer `mean|w| / RMS(w)` sobre sus pesos `w1/w2/w3` dequantizados, eliminando los expertos más reemplazables por capa (32 por capa en la variante 25%, 64 en la 50%). No requiere datos de calibración, forward passes ni fine-tuning. El trabajo se apoya en REAP (arXiv 2510.13999, ICLR 2026), que demostró que la poda del 25-50% de expertos es casi sin pérdida en MoEs de 480B-1T, incluyendo DeepSeek-V3.2, de la misma familia de atención dispersa.

## Capacidades

- Generación de texto y razonamiento general heredadas del modelo base Mistral Large 4 (capacidades específicas no detalladas en la model card).
- Soporte de tool calling / function calling: el parser `mistral` de vLLM está soportado (`--tool-call-parser mistral`, `--enable-auto-tool-choice`).
- Soporte de reasoning parsing (`--reasoning-parser mistral`), lo que indica salida de razonamiento estructurado.
- Capacidades de visión: la torre de visión del base se preserva íntegra (no benchmarkada por separado).
- Decodificación especulativa mediante la cabeza de borrador DSpark embebida (`--speculative-config '{"method": "dspark", "num_speculative_tokens": 3}'`).
- Compatibilidad con vLLM y SGLang (tags del repositorio).

## Casos de uso

- Despliegue de un modelo frontera en menos GPUs: la variante 25% cabe en 4× B200 (564 GB) donde el base necesita 8, reduciendo a la mitad el coste de infraestructura para servir el modelo.
- Servidores de inferencia con vLLM: el comando de despliegue oficial incluye tool calling y reasoning parsing, adecuado para montar endpoints compatibles con la API de OpenAI.
- Agentes multi-paso: la combinación de tool calling nativo y reasoning parser permite construir agentes que razonan y llaman a herramientas en flujos de varios pasos.
- Sistemas multimodales (texto + visión): la torre de visión se conserva, útil para aplicaciones que combinan comprensión de imágenes con generación de texto (pendiente de benchmark separado).
- Optimización de coste de VRAM en clusters: la variante 50% (320 GB) reduce aún más la huella de memoria con solo +1,4% de perplexity, adecuada para cargas donde el margen de calidad es amplio.
- Decodificación especulativa en producción: la cabeza DSpark embebida permite acelerar la generación con `num_speculative_tokens: 3` sin configuración adicional.
- Investigación en poda de MoEs: los scores AIMER de los 71×128 expertos y las máscaras de poda exactas están publicados, lo que lo hace útil como banco de pruebas para investigación en compresión de modelos.

## Benchmarks y rendimiento

La model card no incluye la suite completa de benchmarks del modelo base (MMLU, HumanEval, etc.). Los datos publicados son una validación ligera con vLLM (greedy, podado vs. base NVFP4):

| Metrica | Base NVFP4 | Le Trim 25% | Le Trim 50% |
|---|---|---|---|
| Perplexity (texto held-out fijo) | 1,1076 | 1,1107 (+0,28%) | 1,1234 (+1,4%) |
| Mean token logprob (20 prompts fijos) | −0,2287 | −0,2148 (+0,0178) | no disponible |
| Decode throughput (8× RTX PRO 6000, batch 1) | 53,3 tok/s | 51,9 tok/s (paridad) | no disponible |
| Time to first token | 75 ms | 69 ms (paridad) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: 478 GB para la variante 25% y 320 GB para la 50% (tamaño del checkpoint NVFP4); el repo completo ocupa 781,7 GB al incluir ambas revisiones.
- GPU recomendadas: GPUs Blackwell con soporte NVFP4. La validación se realizó en 8× RTX PRO 6000; la variante 25% cabe en 4× B200 (564 GB), frente a las 8 GPUs que requiere el base.
- Consumer GPU: no cabe en ninguna GPU de consumo; se requiere multi-GPU datacenter con tensor parallelism (el ejemplo usa `--tensor-parallel-size 8`).
- Opciones de despliegue: vLLM (imagen oficial `vllm/vllm-openai:mistral-large-4`) y SGLang (según tags del repo). No se menciona soporte de llama.cpp ni Ollama.
- Latencia y throughput: 51,9 tok/s de decodificación y 69 ms de time to first token en la variante 25% (8× RTX PRO 6000, batch 1), en paridad con el base (53,3 tok/s, 75 ms).

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Expertos/capa | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| Mistral Large 4 — Le Trim 25% (este) | ~750B | ~52B | 96 | NVFP4 | Mistral Ecosystem Open-Weight (MIT modificado) |
| Mistral Large 4 — Le Trim 50% (este) | ~500B | ~52B | 64 | NVFP4 | Mistral Ecosystem Open-Weight (MIT modificado) |
| mistralai/Mistral-Large-4-1T-A52B (base) | ~1T | ~52B | 128 | BF16 (NVFP4 oficial disponible) | Mistral Ecosystem Open-Weight (MIT modificado) |
| DeepSeek-V3.2 (referencia de REAP) | no disponible | no disponible | no disponible | no disponible | no disponible |

REAP demostró podas del 25-50% casi sin pérdida en MoEs de 480B-1T, incluido DeepSeek-V3.2, que comparte la familia de atención dispersa DSA; no hay datos numéricos comparativos publicados entre estos modelos en la información disponible.

## Limitaciones y advertencias

- AIMER está validado en su paper hasta MoEs de ~47B parámetros; esta es su primera aplicación a escala 1T. La validación publicada es una comprobación ligera de logprob/perplexity/throughput, no la suite completa de benchmarks: ambas variantes deben tratarse como *casi sin pérdida pendiente de evaluación completa*, no como probadas sin pérdida.
- Se espera que la variante 50% degrade antes en tareas intensivas en conocimiento.
- La poda es uniforme por capa; las podas no uniformes por capa no se han explorado.
- Los caminos de visión y tool calling se preservan byte a byte pero no se han benchmarkado por separado.
- Licencia: el modelo como servicio (model-as-a-service) requiere una licencia separada de Mistral; el resto de usos se rigen por la Mistral Ecosystem Open-Weight License (MIT modificado).
- Requiere GPUs Blackwell para la cuantización NVFP4, lo que limita el hardware compatible.
- Riesgo de alucinación y sesgos: no disponible (no se documentan en la model card); heredados presumiblemente del modelo base.

## Enlaces

- Modelo: https://huggingface.co/akhaliq/Mistral-Large-4-1T-A52B-LeTrim-NVFP4
- Variante 50% (revisión `letrim50`): https://huggingface.co/akhaliq/Mistral-Large-4-1T-A52B-LeTrim-NVFP4/tree/letrim50
- Modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Checkpoint NVFP4 oficial: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4
- Paper AIMER: https://arxiv.org/abs/2603.18492
- Paper REAP: https://arxiv.org/abs/2510.13999
- Licencia del base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/LICENSE
- Datos de validación: meta/validation.json, meta/throughput.json, meta/validation50.json, meta/aimer_scores.json, prune_mask.json (en el repositorio)
