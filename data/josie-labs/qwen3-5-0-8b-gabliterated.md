# josie-labs/Qwen3.5-0.8B-gabliterated

## Resumen

Qwen3.5-0.8B-gabliterated es una variante del modelo multimodal Qwen3.5-0.8B de Alibaba Qwen, publicada por josie-labs (y atribuida en la model card a Gökdeniz Gülmez), en la que se ha reducido el comportamiento de rechazo mediante la técnica Gabliteration. Se trata de un modelo image-text-to-text de 873,4 millones de parámetros totales (752,4 millones corresponden al modelo de lenguaje) que conserva intacto el codificador visual y la cabeza MTP del modelo original: solo se han editado 20 matrices de pesos en 10 de las 24 capas.

La arquitectura es híbrida: 24 capas compuestas por 18 capas Gated DeltaNet (atención lineal) y 6 capas de atención completa con compuerta, con un tamaño oculto de 1.024, MLP de 3.584 y un vocabulario de 248.320 tokens con embeddings atados. Soporta una longitud de contexto de 262.144 tokens y un codificador visual de 12 capas con dimensión oculta 768.

Su relevancia es doble: por un lado, muestra un caso práctico de modificación de pesos sin fine-tuning (abliteración selectiva) sobre un modelo multimodal híbrido; por otro, la propia model card es inusualmente honesta sobre las limitaciones del método, ya que el 2 % de rechazo medido por palabras clave contrasta con el 77 % que estima un juez LLM. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 18 capas Gated DeltaNet (atención lineal) + 6 capas de atención completa con compuerta; codificador visual de 12 capas |
| Parametros totales | 873.438.784 (873,4 M); 752,4 M en el modelo de lenguaje |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (el repo publica pesos en safetensors; se menciona ejecución en MLX y bf16 en la evaluación) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); compatible con MLX |

Otros datos técnicos: tamaño oculto 1.024, tamaño MLP 3.584, 8 cabezas de atención (2 KV), vocabulario de 248.320 tokens con embeddings atados, 24 capas totales. Tamaño del repositorio: 1,8 GB.

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una pila híbrida que combina capas Gated DeltaNet (una forma de atención lineal con estado recurrente) con capas de atención completa con compuerta, lo que reduce el coste computacional en contextos largos manteniendo capacidad de atención global. Incluye además un codificador visual de 12 capas (dimensión 768) para entrada image-text-to-text y una cabeza MTP (multi-token prediction). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

Sobre esta base, el checkpoint aplica Gabliteration (Gülmez, arXiv:2512.18901), un método que edita los pesos directamente sin fine-tuning. Se calculan estados residuales del último token para prompts dañinos (mlabonne/harmful_behaviors) y benignos (mlabonne/harmless_alpaca), se puntúa la separabilidad por capa y en la capa más separable (la 21, separabilidad 4,94) se extrae el subespacio de rechazo R a partir de los k=1 vectores singulares derechos principales de las diferencias dañino-menos-benigno. Después se elimina una proyección ridge P = R(RᵀR + λI)⁻¹Rᵀ, escalada por un α_l adaptativo por posición, de cada proyección que escribe en el flujo residual de las capas seleccionadas: `linear_attn.out_proj` en las capas Gated DeltaNet, `self_attn.o_proj` en las de atención completa y `mlp.down_proj`. Los hiperparámetros usados fueron λ = 0,05, α_base = 0,8, β = 0,5 (α por capa de 0,80 a 1,00) y capas modificadas 12 a 21. α_base y el conjunto de capas se eligieron por búsqueda en rejilla, quedándose con la configuración de menor KL que alcanzaba la tasa de rechazo objetivo. El proceso se reprodujo en un Apple M4 (GPU de 10 núcleos, 32 GB), macOS 27.2.1, MLX 0.32.3, mlx-lm 0.32.2 y mlx-lm-lora 5.10.1 en 3 minutos y 19 segundos.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text), con codificador visual intacto respecto al original.
- Razonamiento y generación de código heredados del modelo base Qwen3.5-0.8B (sin benchmarks publicados en este checkpoint).
- Contexto largo de hasta 262.144 tokens, aprovechable gracias a las capas de atención lineal.
- Comportamiento de rechazo reducido: responde a peticiones que el modelo original declinaba.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema transformers (`AutoModelForImageTextToText`, `AutoProcessor`).
- Ejecución en Apple Silicon mediante MLX (`mlx_vlm.generate` para multimodal, `mlx_lm.generate` para solo texto).
- No se documenta soporte explícito de tool calling, function calling ni modo thinking en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el checkpoint sirve como caso controlado para estudiar cómo la edición de pesos afecta a la tasa de rechazo y a la deriva de comportamiento (KL de 0,0252 en el primer token), comparándolo con el modelo original.
- Evaluación de métodos de abliteración: al publicarse los hiperparámetros, el script de reproducción y los ficheros de evaluación (`eval_refusal.json`), permite replicar y auditar el método Gabliteration sobre una arquitectura híbrida multimodal.
- Procesamiento de documentos con imágenes en local: con 873 M de parámetros y pesos en safetensors, cabe en equipos de gama consumer y permite extraer información de capturas, formularios o diagramas sin depender de la nube.
- Asistentes conversacionales de contexto largo: los 262.144 tokens de ventana permiten mantener conversaciones o resumir corpus extensos en una sola pasada, con coste reducido por las capas de atención lineal.
- Prototipado rápido en Apple Silicon: el flujo con MLX (`mlx_vlm.generate`) permite iterar en un Mac sin GPU dedicada, útil para demos y pruebas de concepto.
- Generación de contenido sin restricciones en entornos controlados: para aplicaciones creativas o de investigación que requieran respuestas no filtradas, asumiendo la responsabilidad de uso que advierte el autor.
- Fine-tuning ligero posterior: al conservar la arquitectura y el codificador visual originales, puede servir como base para adaptaciones con LoRA sobre tareas específicas.

## Benchmarks y rendimiento

| Métrica | Qwen3.5-0.8B | Qwen3.5-0.8B-gabliterated |
|---|---:|---:|
| Tasa de rechazo (palabras clave), 100 prompts dañinos reservados | 84 % | 2 % |
| KL del primer token frente al original, 100 prompts benignos | 0 | 0,0252 |
| Tasa de rechazo juzgada por Qwen/Qwen3.5-9B (mismas completaciones, pesos bf16) | 92 % | 77 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) sobre este checkpoint; la propia model card indica que no se han ejecutado todavía. Las métricas anteriores miden únicamente comportamiento de rechazo y deriva del primer token, no capacidad general.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 1,8 GB solo para pesos (873 M de parámetros), más overhead de activaciones y del codificador visual; en cuantizaciones de 8 o 4 bits bajaría por debajo de 1 GB, aunque el repo no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM es suficiente en bf16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan sin problema, aunque el modelo está claramente sobredimensionado para estas últimas.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Despliegue: transformers (`AutoModelForImageTextToText`), MLX en Apple Silicon (`mlx_vlm` / `mlx_lm`); no se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor reporta que el proceso de edición de pesos tardó 3 minutos y 19 segundos en un Apple M4 de 32 GB, dato que no mide inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Rechazo reducido |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-gabliterated | 873,4 M | 262.144 | Imagen + texto | Apache 2.0 | Sí (edición de pesos) |
| Qwen/Qwen3.5-0.8B (base) | 873,4 M | 262.144 | Imagen + texto | Apache 2.0 | No |
| Otras variantes abliterated de Qwen3.5 | no disponible | no disponible | no disponible | no disponible | Sí |

La comparación más directa es con el modelo base, del que solo difiere en 20 matrices de pesos. No se dispone de información sobre otras variantes abliterated del mismo tamaño ni sobre modelos comparables de otros autores con los que contrastar rendimiento.

## Limitaciones y advertencias

- La detección de rechazos se basa en coincidencia de palabras clave sobre completaciones greedy de 48 tokens con thinking desactivado: es aproximada, no detecta rechazos suaves y puede marcar respuestas que citan frases de rechazo.
- La discrepancia entre el 2 % medido por palabras clave y el 77 % medido por un juez LLM (Qwen3.5-9B) indica que la métrica principal sobreestima la eliminación del comportamiento de rechazo; el modelo sigue declinando la mayoría de los prompts dañinos del conjunto de prueba.
- El valor KL (0,0252) mide solo la deriva del primer token en 100 prompts benignos, no la capacidad general; no hay benchmarks estándar ejecutados sobre este checkpoint.
- Al reducirse los rechazos, el modelo cumplirá peticiones que el original declinaba; la responsabilidad de uso y despliegue recae en quien lo integra.
- Idiomas: solo se declara inglés, aunque el modelo base podría tener capacidades multilingües no documentadas aquí.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse la atribución y tenerse en cuenta que se trata de un modelo modificado respecto al original.
- Riesgo de alucinación y sesgos: no documentados específicamente para este checkpoint; se heredan los del modelo base, sobre el que tampoco se detallan.
- No se documenta soporte de tool calling ni de modo thinking, lo que limita su uso en pipelines de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/josie-labs/Qwen3.5-0.8B-gabliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper de Gabliteration: https://arxiv.org/abs/2512.18901
- Repositorio citado en la model card (autor del método): https://huggingface.co/Goekdeniz-Guelmez/Qwen3.5-0.8B-gabliterated
- Dataset de prompts dañinos: mlabonne/harmful_behaviors (Hugging Face)
- Dataset de prompts benignos: mlabonne/harmless_alpaca (Hugging Face)
