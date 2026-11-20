# NovaeonStudio/Qwen3.8-35B-A3B-Distill-Heretic-oQ8-fp16-mtp

## Resumen

Qwen3.8-35B-A3B-Distill-Heretic-oQ8-fp16-mtp es una variante ajustada en comportamiento del modelo empero-ai/Qwen3.8-35B-A3B-Distill, publicada por Novaeon.Studio. Se trata de un modelo de mezcla de expertos (MoE) de la familia Qwen3.5/3.6 con 35.951.822.704 parámetros totales y aproximadamente 3B activos por token, que incorpora una torre de visión y una cabeza MTP (multi-token prediction) nativa. La modificación de pesos consiste en una edición direccional post-entrenamiento implementada como LoRA de rango 50 fusionada en el checkpoint original, orientada a reducir el comportamiento de rechazo del modelo base.

El modelo se distribuye cuantizado con oMLX en formato oQ8 (group size 64, escalas y pesos no cuantizados en float16, ~8,8 bits efectivos por peso), con un tamaño en disco de aproximadamente 39,5 GB. Está pensado para ejecutarse sobre Apple Silicon mediante MLX, y el autor lo ha construido y evaluado en un Apple M5 Max con 128 GB de memoria unificada. La licencia es Apache-2.0 y el idioma declarado es únicamente inglés.

Su relevancia actual es doble: por un lado, demuestra un flujo de cuantización de 8 bits sobre MLX que preserva la cabeza MTP y la torre de visión; por otro, publica de forma explícita el coste medido de la edición de comportamiento sobre una suite de regresión propia, incluyendo la degradación en razonamiento aritmético, código y alemán. El autor lo posiciona como modelo de uso privado en investigación, no como agente autónomo con herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida GatedDeltaNet + atención completa (familia Qwen3.5/3.6), con encoder de visión |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B (256 expertos, 8 enrutados) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | oQ8 (oMLX, group size 64, escalas y pesos no cuantizados en float16, ~8,8 bpw efectivos); el autor rechazó oQ2 por resultados rotos (13/43) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería mlx) |
| Capas | 40 (10 de atención completa, 30 GatedDeltaNet) |
| Cabezas KV en atención completa | 2 |
| Cabeza MTP | Nativa, 42 tensores `mtp.*` preservados |
| Tamaño del repositorio | 39,5 GB |
| Edición de pesos | LoRA rango 50 fusionada en capas 20–34 (30 `out_proj` GatedDeltaNet + 10 `o_proj`) |
| KL respecto al base | 0,248 (0,28 remedido tras fusión y cuantización) |
| Motor recomendado | oMLX (Apple MLX) |
| RAM sugerida | 64 GB+ (cómodo en 96–128 GB) |

## Arquitectura y entrenamiento

El modelo base es una destilación de profesores Qwen3.8 sobre la arquitectura Qwen3.6-35B-A3B, una MoE híbrida de 40 capas que combina 30 capas GatedDeltaNet (atención lineal con estado recurrente) y 10 capas de atención completa con solo 2 cabezas KV. Esta configuración reduce drásticamente el coste de caché KV (unos 20 KB por token según el autor) y explica por qué la compresión de KV degrada el rendimiento en lugar de mejorarlo. La MoE cuenta con 256 expertos de los que se enrutan 8 por token, lo que da ~3B parámetros activos sobre 35,95B totales. Incorpora además un encoder de visión y una cabeza de predicción multi-token (MTP) nativa con 42 tensores, que acelera la decodificación especulativa.

El entrenamiento original corresponde al modelo base de empero-ai; esta variante no reentrena, sino que aplica una edición direccional de pesos post-entrenamiento. El autor buscó sobre 60 ensayos (20 con inicialización aleatoria) en las proyecciones de salida de atención (30 `out_proj` de GatedDeltaNet y 10 `o_proj`), seleccionando el ensayo que afecta a las capas 20–34, con un KL de 0,2481 frente al base y una reducción de rechazos de 98/100 a 2/100 en su sonda de 100 prompts. La edición se exportó como LoRA de rango 50 y se fusionó en el checkpoint original para preservar intactos la cabeza MTP y la torre de visión; después se cuantizó con oMLX oQ8. No se documentan en la información disponible detalles sobre el dataset de destilación, número de tokens ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional en inglés, con modo de pensamiento (`enable_thinking`) activable para razonamiento difícil y desactivado por defecto para chat y escritura creativa.
- Procesamiento de imagen y texto (`image-text-to-text`), gracias a la torre de visión preservada.
- Tool calling y function calling: la suite del autor reporta 11/11 en tool calling y 5/5 en JSON, sin degradación respecto al modelo original.
- Razonamiento multi-paso y modo thinking, aunque con precisión aritmética reducida tras la edición (2/6 en razonamiento sin thinking frente a 3/6 del original).
- Contexto largo: 4/4 en agujas de 20–50k tokens en la suite del autor, con contexto nativo de 262.144 tokens.
- Generación de código: 3/4 en la suite propia, con una ligera pérdida frente al original (4/4).
- Abstención calibrada: 3/3 en la suite del autor.
- Decodificación especulativa mediante cabeza MTP nativa, con profundidad adaptativa.
- Capacidad multilingüe limitada: solo inglés declarado; el autor mide alemán con 3/4 tras la edición (4/4 en el original).

## Casos de uso

- Escritura de ficción y narrativa: el modelo mantiene contexto largo (262k tokens) y tiene reducida la tasa de rechazo, lo que permite desarrollar tramas con contenido oscuro o humor negro sin interrupciones; el autor lo recomienda explícitamente para trabajo de texto y ficción.
- Investigación en seguridad y evaluación de alineamiento: sirve como contrapunto al modelo base para estudiar cómo varía el comportamiento de rechazo con una edición de pesos de bajo rango (KL 0,248) y qué capacidades se degradan.
- Procesamiento de documentos largos con imagen: al conservar la torre de visión y 262k de contexto, puede resumir o extraer información de informes escaneados, capturas o PDFs renderizados en una sola pasada.
- Asistentes conversacionales privados en local: con ~39,5 GB en disco y 64 GB+ de RAM, se despliega en un Mac Studio o MacBook Pro de gama alta sin salida a la nube, útil para datos sensibles.
- Extracción estructurada y JSON: la suite reporta 5/5 en JSON y 11/11 en tool calling, por lo que es apto para pipelines de parsing de textos no estructurados a esquemas, siempre con una capa de validación propia.
- Generación de código asistida en local: 3/4 en la suite de código del autor; adecuado para autocompletado y refactorización en entornos de desarrollo con Apple Silicon, no como sustituto de un modelo especializado en código.
- Prototipado rápido con endpoint compatible con OpenAI: oMLX expone `http://127.0.0.1:8000/v1`, lo que permite integrarlo en herramientas que ya hablan la API de OpenAI sin cambios de código.

## Benchmarks y rendimiento

El autor publica su propia suite privada de regresión (43 casos deterministas más 17 casos de mitigación), no benchmarks académicos estándar. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

| Categoría | original oQ8 | edited oQ8 | edited oQ6 | edited oQ4 |
|---|---|---|---|---|
| Tool calling | 11/11 | 11/11 | 11/11 | 11/11 |
| JSON | 5/5 | 5/5 | 5/5 | 5/5 |
| Instruction following | 6/6 | 5/6 | 5/6 | 5/6 |
| Alemán | 4/4 | 3/4 | 3/4 | 3/4 |
| Agujas en contexto largo | 4/4 | 4/4 | 4/4 | 4/4 |
| Razonamiento (sin thinking) | 3/6 | 2/6 | 2/6 | 2/6 |
| Abstención | 3/3 | 3/3 | 3/3 | 3/3 |
| Código | 4/4 | 3/4 | 2/4 | 3/4 |
| Total | 40/43 | 36/43 | 35/43 | 36/43 |
| Suite de mitigación | 16/17 | 14/17 | 12/17 | 14/17 |

Rendimiento medido en Apple M5 Max 128 GB con oMLX, thinking off y TurboQuant KV off:

| Métrica | original oQ8 | edited oQ8 |
|---|---|---|
| Decodificación, prompt corto | ~126–129 tok/s | 117 tok/s |
| Decodificación a 53k de contexto | ~91–103 tok/s | 100–105 tok/s |
| Prefill, 53k en frío | 3.331 tok/s | 2.952 tok/s |
| 4 peticiones concurrentes, agregado | ~221 tok/s | 215 tok/s |

Sonda de seguridad (100 prompts, pre-cuantización): rechazos 98/100 en el original frente a 2/100 en el editado. En 10 prompts límite pero legítimos (humor negro, tacos, reducción de daños, ganzúas, monólogo de villano): 2/10 rechazados en el original frente a 0/10 en el editado.

## Requisitos de hardware

- VRAM/RAM estimada: ~39,5 GB de pesos en disco para oQ8; el autor recomienda 64 GB+ de memoria unificada, con margen cómodo en 96–128 GB. El contexto largo y el estado de GatedDeltaNet añaden consumo adicional.
- GPU recomendadas: Apple Silicon exclusivamente (MLX). El autor lo ha validado en Apple M5 Max de 128 GB; no hay datos publicados para A100, H100 ni RTX 4090, y el formato MLX no es directamente compatible con CUDA.
- Cabe en GPU de consumo: solo en equipos Apple Silicon con memoria unificada suficiente (Mac Studio, MacBook Pro de gama alta). No cabe en RTX 4090 (24 GB) ni en GPUs consumer con 16–24 GB.
- Opciones de despliegue: oMLX (recomendado por el autor, endpoint compatible con OpenAI en `http://127.0.0.1:8000/v1`). No se documentan conversiones a GGUF, vLLM, TGI, llama.cpp ni Ollama en la información disponible.
- Ajustes óptimos medidos: `mtp_enabled: true` con profundidad adaptativa (MTP desactivado cuesta ~35% de decodificación); `turboquant_kv_enabled: false` (activarlo cuesta +37% de decodificación a 53k de contexto y +23% de throughput agregado); `enable_thinking: false` para chat y creatividad.
- Muestreo recomendado: temperatura 0,7 y top_p 0,95 para creatividad; temperatura 0–0,3 para uso factual.
- Throughput: 117 tok/s en prompt corto y 100–105 tok/s a 53k de contexto en M5 Max; ~215 tok/s agregados con 4 peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato/plataforma | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Distill-Heretic-oQ8-fp16-mtp (este) | 35,95B | ~3B | 262.144 | Apache-2.0 | MLX safetensors oQ8 | Edición de comportamiento, MTP nativa, suite propia 36/43 |
| empero-ai/Qwen3.8-35B-A3B-Distill (base) | 35,95B | ~3B | no disponible en la información | Apache-2.0 | safetensors | Sin edición de comportamiento; 40/43 en la suite del autor, rechazos 98/100 |
| NovaeonStudio/Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp (seat build) | 35,95B | ~3B | 262.144 (según build del autor) | Apache-2.0 | MLX oQ8 | Variante sin edición de comportamiento del mismo autor; referencia de velocidad y calidad |
| Otras variantes 35B-A3B de la familia Qwen3 | no disponible | ~3B | no disponible | no disponible | no disponible | El autor menciona variantes que eliminaron la cabeza MTP (~2,5× más lentas en decodificación) o usaron recetas de precisión mixta lentas en MLX, sin nombrarlas |

No se dispone de datos de benchmarks académicos comparables para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La edición de pesos reduce deliberadamente el comportamiento de rechazo (de 98/100 a 2/100 en la sonda del autor), lo que elimina una capa de protección relevante para agentes con herramientas que producen efectos secundarios. El propio autor desaconseja su uso como agente autónomo de tool calling.
- Degradación medible de capacidades: razonamiento sin thinking (2/6 frente a 3/6), código (3/4 frente a 4/4), seguimiento de instrucciones (5/6 frente a 6/6) y alemán (3/4 frente a 4/4). La suite de mitigación cae de 16/17 a 14/17.
- Riesgo de alucinación no cuantificado en la información disponible; la abstención se mantiene en 3/3 en la suite del autor, pero es una muestra pequeña.
- Idioma: solo inglés declarado. El rendimiento en castellano no está evaluado y el alemán ya muestra degradación, por lo que no es recomendable para producción multilingüe.
- Licencia Apache-2.0 permite uso comercial, pero el autor indica que está pensado para investigación y evaluación privada; exige aplicar una capa de seguridad propia antes de cualquier uso en producción.
- Dependencia de plataforma: formato MLX y motor oMLX, sin soporte documentado para CUDA, GGUF, vLLM o llama.cpp. El despliegue queda limitado a Apple Silicon.
- La cuantización oQ2 se construyó y se rechazó por resultados rotos (13/43); no existe release de 2 bits.
- Los benchmarks son una suite privada de 43 casos del propio autor, no evaluaciones académicas independientes; deben interpretarse como señal interna, no como comparación objetiva con otros modelos.
- El repositorio tiene pocas descargas (1.544) y likes (4), y procede de un estudio independiente; no hay validación externa publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-Heretic-oQ8-fp16-mtp
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Build de referencia del autor (seat, sin edición): https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp
- oMLX (motor de cuantización e inferencia): https://github.com/jundot/omlx
- Novaeon.Studio: https://novaeon.studio
