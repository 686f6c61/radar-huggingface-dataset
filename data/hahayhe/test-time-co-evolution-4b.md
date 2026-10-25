# hahayhe/test-time-co-evolution-4B

tag → thinking mode), tool-use (tag tool-use), conversational, multimodal input (image-text-to-text pipeline, vision tower included but not evaluated post-SFT), multilingual unknown. Agentic multi-step? "trajectory-step samples" suggests agent trajectories; tag "tool-use". I'll phrase carefully.

Casos de uso: 6+ concrete: agentes con tool calling, asistencia técnica multi-turno, generación de código, razonamiento matemático con thinking mode, pipelines de datos sintéticos/reasoning distillation, fine-tuning base para dominio, prototipado en investigación de co-evolución test-time, despliegue vLLM on-prem.

Benchmarks section: no data → say the phrase. Maybe add a small table of smoke tests: arithmetic 17*23=391, Python function generation — described as smoke tests. I can present a table with "prueba / resultado" noting they're smoke tests, not benchmarks. That's factual.

Hardware: estimates. Mark as estimates.

Let's write.

Length: thorough but not overly long. Write it.

For "Tipos de cuantizacion": "no disponible (solo se publican pesos BF16 en safetensors; no hay GGUF, AWQ ni GPTQ publicados)".

Formato de pesos: safetensors (BF16), configuración de generación, tokenizer, chat template, procesador de imagen/vídeo, SHA256SUMS.

Idiomas: no disponible.

Let me write the comparativa table:

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
| hahayhe/test-time-co-evolution-4B | 4,54B | 32.768 (corte SFT) | Apache-2.0 | Sí (torre congelada, no evaluada) | SFT full-weight, 3 épocas |
| Qwen/Qwen3.5-4B (base) | 4B (aprox., según denominación) | no disponible | Apache-2.0 presumible... hmm. The hub info says license apache-2.0 for this repo. Base model license — not verifiable. I'll say "no disponible en la información proporcionada". Actually careful: better to say "no disponible". 

I'll fill base row with "no disponible" for contexto/rendimiento and note it's the upstream.

Third row: "Otros checkpoints de razonamiento ~4B (p. ej., destilados de la familia Qwen): datos no disponibles en la información proporcionada". Fine.

Now write in Spanish from Spain, técnico.

Also mention that repo size 9.1 GB matches BF16 weights, and that the model was created 2026-10-25 with 0 descargas/0 likes → sin validación.

Write the ficha.## Resumen

`hahayhe/test-time-co-evolution-4B` es un checkpoint de ajuste supervisado (SFT) de pesos completos derivado de `Qwen/Qwen3.5-4B`, publicado por el usuario hahayhe en Hugging Face. No es un adaptador LoRA ni un merge: el repositorio contiene el `model.safetensors` íntegro en BF16 (4.539.265.536 parámetros, 9,1 GB de repo) y se carga directamente con `Qwen3_5ForConditionalGeneration` de Transformers. El modelo conserva la torre de visión y el procesador de imagen/vídeo del modelo base, por lo que su pipeline declarado es `image-text-to-text`, aunque el entrenamiento se hizo exclusivamente con datos de texto.

El objetivo declarado es el razonamiento multi-paso con uso de herramientas: el entrenamiento se realizó sobre 69.820 muestras de "trajectory-step", supervisando únicamente la respuesta final del asistente (incluido el bloque de razonamiento) y usando los turnos históricos como contexto. El nombre del checkpoint alude a "co-evolución en tiempo de test", pero la model card no documenta el método ni publica paper, de modo que la técnica concreta detrás de esa denominación no está descrita en la información disponible.

Su relevancia práctica es la de un modelo pequeño (4,5B) con licencia Apache-2.0, thinking mode activable por plantilla de chat y soporte declarado de tool use, desplegable en una sola GPU de 24 GB e integrable en vLLM. Ahora bien: no hay benchmarks publicados, el checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, y las capacidades multimodales tras el fine-tuning no han sido evaluadas por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`); la model card menciona kernels opcionales de atención lineal (`flash-linear-attention`, `causal-conv1d`), compatible con un diseño híbrido, pero el detalle interno no está documentado |
| Parámetros totales | 4.539.265.536 (≈4,54B), según safetensors |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens (corte del SFT); el autor indica que se conserva la configuración de contexto original de Qwen3.5-4B, cuyo valor nativo no se especifica. Longitudes superiores al corte no han sido validadas |
| Tipos de cuantización | no disponible: solo se publican pesos BF16 en safetensors; no hay GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | no disponible (el ejemplo de la model card usa prompts en chino; no se declara lista de idiomas) |
| Licencia | Apache-2.0 (con fichero `LICENSE` y `NOTICE`) |
| Formato de pesos | safetensors (BF16), más configuración de modelo y generación, tokenizer, chat template, ajustes del procesador de imagen/vídeo, `inference.py`, `requirements-inference.txt`, `training_summary.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3.5-4B, un modelo multimodal denso de 4,5B parámetros con torre de visión y proyector multimodal. El SFT es de pesos completos sobre el modelo de lenguaje: la torre de visión y el proyector multimodal se congelaron durante el entrenamiento, que usó únicamente datos de texto. Se conservan los pesos de visión originales y los ajustes del procesador de imagen y vídeo para que `AutoProcessor` cargue de forma completa, pero la calidad multimodal tras el ajuste no se ha evaluado. El stack validado por el autor es PyTorch 2.8.0+cu128, Transformers 5.8.0, Accelerate 1.11.0, BF16 y atención SDPA sobre una NVIDIA A800, con `flash-linear-attention` 0.4.2 y `causal-conv1d` 1.6.2.post1 como dependencias opcionales para acelerar la atención lineal.

Los detalles de entrenamiento publicados son: 69.820 muestras de trayectoria-paso, 3 épocas y 1.638 pasos de optimizador, batch efectivo de 128, learning rate de 1e-5 con schedule coseno y 10 % de warmup, corte de secuencia en 32.768 tokens. Solo se supervisa la respuesta final del asistente, incluido el texto de razonamiento, mientras que los mensajes históricos actúan como contexto; esto es típico de un SFT orientado a trayectorias de agente con tool calling. No se documentan fases de RLHF, DPO, número total de tokens de entrenamiento, composición del dataset ni procedencia de las trayectorias; tampoco se describe ninguna innovación de decodificación especulativa ni de atención más allá del uso de kernels lineales opcionales.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia del modelo base.
- Razonamiento en modo thinking: la plantilla admite `enable_thinking=True` y la respuesta separa el razonamiento del resultado final mediante `</think>`.
- Tool calling / function calling: el tag `tool-use` y el formato de entrenamiento por trayectorias apuntan a este uso, aunque no se publica evaluación específica.
- Razonamiento multi-paso orientado a agentes: el dataset de SFT son pasos de trayectoria, con supervisión de la respuesta final.
- Capacidad multimodal heredada del modelo base (pipeline `image-text-to-text`, torre de visión y procesador incluidos), sin evaluar después del fine-tuning.
- Capacidades multilingües: no declaradas; el único ejemplo publicado está en chino.
- Generación de código a pequeña escala: el autor reporta como smoke test la generación de una función Python correcta y logits finitos.

## Casos de uso

- Agentes con tool calling en producción: el formato de entrenamiento (trayectorias paso a paso, supervisión de la respuesta final) encaja con bucles de agente que alternan razonamiento y llamadas a herramientas, y el tamaño de 4,5B permite servirlo con `vllm serve ... --max-model-len 32768` en una GPU de 24 GB.
- Asistencia técnica multi-turno con contexto largo: la ventana validada de 32.768 tokens permite mantener historiales de conversación extensos o volcar documentación de referencia en el prompt sin truncar agresivamente.
- Razonamiento matemático y analítico con thinking mode: activando `enable_thinking=True` se obtiene la traza de razonamiento separada del resultado, útil para tareas de cálculo, verificación y explicación paso a paso.
- Generación de código asistida y automatización de CI/CD: con tool calling puede invocarse como paso de un pipeline que consulte repositorios, ejecute tests o proponga parches, siempre con validación humana o de test suite por delante.
- Generación de datos sintéticos de razonamiento: al producir trazas `</think>` etiquetadas, sirve para destilar trayectorias en modelos menores o para aumentar datasets de entrenamiento de agentes.
- Base para fine-tuning de dominio: punto de partida Apache-2.0 de 4,5B pesos completos, sin necesidad de merge de adaptadores, para adaptar a un vertical concreto con SFT ligero.
- Prototipado e investigación en métodos de "test-time": entorno reproducible (Transformers + `inference.py`) para experimentar con presupuestos de cómputo en inferencia, aunque sin metodología publicada que replicar.
- Despliegue on-premise con requisitos de soberanía de datos: al ser un modelo pequeño y de licencia permisiva, puede alojarse en una sola GPU sin dependencias de API externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor solo reporta smoke tests de validación tras la carga, que no constituyen una evaluación de capacidades:

| Prueba | Resultado reportado | Naturaleza |
|---|---|---|
| Carga de pesos completos | Sin parámetros faltantes, inesperados ni con forma incorrecta | Verificación de integridad |
| Aritmética (17 × 23) | 391, con logits finitos y token de fin normal | Smoke test |
| Generación de función Python | Completada correctamente | Smoke test |
| Rendimiento en vLLM | No medido en esta release | No disponible |
| Evaluación multimodal tras SFT | No evaluada | No disponible |

## Requisitos de hardware

- VRAM estimada en BF16: unos 9,1 GB solo de pesos (4,54B × 2 bytes), más caché KV; en la práctica, 11-16 GB para contextos moderados y batch pequeño. Son estimaciones de cálculo a partir del número de parámetros, no medidas publicadas.
- VRAM estimada cuantizado: en FP8/INT8 en torno a 5-6 GB de pesos; en INT4 en torno a 3-4 GB. No hay artefactos cuantizados publicados, así que requeriría cuantizar por cuenta propia.
- GPU recomendadas: el autor validó con NVIDIA A800 en BF16; cualquier A100/H100/L40S es holgado. En consumer, RTX 4090 o 3090 (24 GB) permiten BF16 con contexto largo; tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) van justas en BF16 y cómodas en 8 bits; 12 GB exige cuantización.
- Cabe en consumer GPU: sí, en RTX 4090/3090 sin cuantizar con contexto moderado, y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: Transformers (stack validado: PyTorch 2.8.0+cu128, Transformers 5.8.0, Accelerate 1.11.0, SDPA), vLLM con soporte de Qwen3.5 (`--dtype bfloat16 --max-model-len 32768`) y kernels opcionales `flash-linear-attention` 0.4.2 + `causal-conv1d` 1.6.2.post1. llama.cpp/Ollama no están disponibles al no publicarse GGUF.
- Latencia y throughput: no disponibles; el autor declara explícitamente que el rendimiento en vLLM no se ha medido para esta release. El consumo de VRAM crece con longitud de contexto, batch size y motor de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modalidad | Estado de validación |
|---|---|---|---|---|---|
| hahayhe/test-time-co-evolution-4B | 4,54B (denso) | 32.768 tokens validados en SFT | Apache-2.0 | Texto + visión heredada (no evaluada) | 0 descargas, 0 likes; sin benchmarks |
| Qwen/Qwen3.5-4B (modelo base) | ~4B (según denominación; el recuento exacto del base no se detalla en la información disponible) | no disponible | no disponible en la información proporcionada | Texto + imagen/vídeo | Modelo upstream; sin datos de rendimiento en esta ficha |
| Otros checkpoints SFT de razonamiento/tool use sobre la familia Qwen3.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de benchmarks ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay MMLU, GSM8K, HumanEval ni evaluaciones de agente publicadas; los únicos resultados son smoke tests de aritmética y generación de código.
- Capacidad multimodal no validada: la torre de visión se congeló y el SFT fue solo de texto; el autor advierte que la calidad de imagen/vídeo tras el ajuste no se ha evaluado, pese a que el pipeline declarado sea `image-text-to-text`.
- Contexto no validado más allá del corte: se entrenó con 32.768 tokens y no se ha comprobado el comportamiento en longitudes superiores, aunque la configuración nativa se conserve.
- Riesgo de alucinación estándar en SFT de 4,5B, agravado por la falta de evaluación: no hay datos de tasa de alucinación ni de robustez frente a instrucciones adversarias.
- Procedencia de datos opaca: no se publican las trayectorias de entrenamiento, su origen, filtrado ni licencias de los datos; solo que son 69.820 muestras de trayectoria-paso.
- Sesgos desconocidos: al no documentarse la composición del dataset ni los idiomas, no se puede acotar el sesgo lingüístico, cultural o de dominio.
- Idiomas no declarados: el único ejemplo publicado es en chino; el soporte real de castellano no está verificado.
- Licencia: el checkpoint es Apache-2.0, permisiva para uso comercial, pero conviene revisar `NOTICE` y los términos del modelo base Qwen3.5-4B antes de producción.
- Madurez: 0 descargas y 0 likes, publicación sin revisión comunitaria; el nombre "test-time co-evolution" no va acompañado de paper ni descripción del método.
- No hay artefactos cuantizados ni integración con llama.cpp/Ollama, lo que limita el despliegue en entornos sin GPU.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hahayhe/test-time-co-evolution-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del checkpoint: https://huggingface.co/hahayhe/test-time-co-evolution-4B/blob/main/LICENSE
- Aviso legal del checkpoint: https://huggingface.co/hahayhe/test-time-co-evolution-4B/blob/main/NOTICE
- Ejemplo de inferencia: https://huggingface.co/hahayhe/test-time-co-evolution-4B/blob/main/inference.py
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados devueltos tratan sobre distribución de la información en organizaciones y comunicación corporativa, sin relación con este checkpoint. Paper, blog o demo: no disponibles.
