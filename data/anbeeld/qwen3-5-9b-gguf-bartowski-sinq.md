# Anbeeld/Qwen3.5-9B-GGUF-Bartowski-SINQ

## Resumen

Anbeeld/Qwen3.5-9B-GGUF-Bartowski-SINQ es una colección de cuantizaciones GGUF del modelo multimodal Qwen3.5-9B, desarrollado originalmente por el equipo Qwen de Alibaba. El trabajo de cuantización lo firma Anbeeld, que aplica la técnica SINQ (una metodología propia de cuantización selectiva) sobre las recetas de Bartowski, manteniendo una correspondencia 1:1 con los recetarios del cuantizador de referencia. El modelo resultante está pensado para inferencia local mediante BeeLlama.cpp v0.5.0, que es el único runtime que da soporte a SINQ.

El modelo base Qwen3.5-9B es un transformer multimodal de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) orientado a tareas de image-text-to-text, con capacidades conversacionales. Esta ficha se centra en las versiones cuantizadas publicadas en GGUF, cuyo objetivo es reducir el peso del modelo desde el BF16 original (unos 18 GB) hasta rangos de 4 a 7 GB, permitiendo su despliegue en GPUs de consumo con pérdidas de calidad controladas y medidas mediante KLD sobre Wikitext-2.

La relevancia de esta publicación radica en que documenta de forma exhaustiva la degradación de calidad por receta de cuantización: cada variante incluye métricas de KLD (media, mediana, P90, P95, P99, P99.9, máximo), acuerdo Top-1 y perplexity frente a la referencia BF16, evaluadas sobre 297.193 objetivos de siguiente token con contexto de 65.536 tokens y caché K/V en BF16. Esto permite elegir la cuantización adecuada según el presupuesto de VRAM y la tolerancia a la pérdida de fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no disponible (no es MoE segun los datos) |
| Longitud de contexto | 65.536 tokens (64K) usados en la evaluacion; contexto maximo oficial no disponible |
| Tipos de cuantizacion | IQ2_S, IQ2_M, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_M, Q3_K_M, Q2_K_L, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q3_K_XL, Q5_K_S (y variantes adicionales del repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con cuantizacion SINQ aplicada) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer multimodal de aproximadamente 9,2 mil millones de parámetros que procesa entradas de imagen y texto para generar respuestas conversacionales. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO. Tampoco se especifican innovaciones arquitectónicas internas como atención lineal o decodificación especulativa.

Lo que sí está documentado con rigor es el proceso de cuantización. Las recetas GGUF siguen 1:1 las de Bartowski para Qwen3.5-9B, con SINQ aplicado durante el proceso. SINQ introduce parámetros de anchura (width, de 16 a 128) y fuerza (strength, de 0,5 a 1) que modulan la cuantización selectiva de capas. Cada receta seleccionada reporta un KLD medio inferior a su equivalente stock de Bartowski en la evaluación emparejada contra la referencia BF16. La evaluación usa el corpus completo Wikitext-2 test, referencia BF16 Qwen3.5-9B, KLD calculado como KL(BF16 || cuantizado) sobre 297.193 objetivos alineados, contexto de 65.536 tokens, caché K/V en BF16, batch 512 y microbatch 256.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), incluyendo descripción de imágenes y respuesta a preguntas visuales.
- Razonamiento y respuesta a instrucciones derivados del modelo base Qwen3.5-9B.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integración con infraestructuras de servicio tipo TGI o similares.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Inferencia local en GPU de consumo: las variantes IQ4_XS (5,503 GB) y Q4_K_M (6,172 GB) caben en GPUs de 8 GB de VRAM y permiten ejecutar un modelo multimodal de 9,2 B con KLD medio de 0,029 y 0,022 respectivamente, adecuado para prototipado y uso personal.
- Asistente visual en escritorio: con Q4_K_S (5,859 GB) o IQ4_NL (5,740 GB), el modelo puede gestionar conversaciones sobre imágenes en entornos sin servidor dedicado, usando BeeLlama.cpp v0.5.0 como runtime.
- Evaluación de calidad de cuantización: el repositorio proporciona métricas KLD por receta, útil para investigadores que necesitan comparar el compromiso tamaño-fidelidad antes de desplegar en producción.
- Despliegue en entornos con VRAM limitada (4-5 GB): las variantes IQ2_M (4,030 GB) y Q2_K (4,325 GB) permiten ejecutar el modelo en GPUs de 6 GB, con Top-1 de 82,3 % y 83,3 % respectivamente, aceptable para tareas de baja exigencia.
- Servicio conversacional con contexto largo: el modelo fue evaluado con contexto de 64K tokens, lo que lo hace apto para conversaciones con historial extenso o documentos largos, siempre que el runtime soporte esa ventana.
- Pipeline de image-text-to-text en investigación: al ser multimodal y Apache 2.0, puede integrarse en flujos de anotación automática de imágenes o generación de descripciones sin restricciones comerciales.
- Comparativa de recetas de cuantización: las 18 recetas documentadas con KLD, Top-1 y PPL permiten seleccionar la variante óptima para un presupuesto de VRAM concreto sin necesidad de reevaluar manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son métricas de fidelidad de cuantización frente al BF16, medidas sobre Wikitext-2 test con 297.193 objetivos y contexto de 65.536 tokens.

| Receta | Tamano (GB) | KLD medio | KLD mediana | Top-1 | PPL |
|---|---:|---:|---:|---:|---:|
| IQ2_S | 3,969 | 0,296414 | 0,149191 | 77,767 % | 7,9476 |
| IQ2_M | 4,030 | 0,190647 | 0,088761 | 82,289 % | 7,3301 |
| Q2_K | 4,325 | 0,174333 | 0,073782 | 83,260 % | 7,3516 |
| IQ3_XXS | 4,537 | 0,105045 | 0,041615 | 87,147 % | 7,0444 |
| IQ3_XS | 4,821 | 0,082945 | 0,032618 | 89,097 % | 6,9498 |
| Q3_K_S | 4,930 | 0,090341 | 0,034484 | 88,319 % | 6,9250 |
| IQ3_M | 4,983 | 0,072853 | 0,028080 | 89,838 % | 6,9168 |
| Q3_K_M | 5,181 | 0,066111 | 0,023100 | 90,158 % | 6,8574 |
| Q2_K_L | 5,318 | 0,167975 | 0,071511 | 83,509 % | 7,2788 |
| Q3_K_L | 5,372 | 0,062988 | 0,021977 | 90,395 % | 6,8629 |
| IQ4_XS | 5,503 | 0,029253 | 0,008808 | 93,778 % | 6,7584 |
| IQ4_NL | 5,740 | 0,029059 | 0,008492 | 93,871 % | 6,7463 |
| Q4_0 | 5,744 | 0,039437 | 0,012477 | 92,820 % | 6,8491 |
| Q4_K_S | 5,859 | 0,025652 | 0,007348 | 94,313 % | 6,7207 |
| Q4_K_M | 6,172 | 0,022183 | 0,005894 | 94,788 % | 6,7553 |
| Q4_1 | 6,206 | 0,027444 | 0,007644 | 94,166 % | 6,7140 |
| Q3_K_XL | 6,262 | 0,059040 | 0,021225 | 90,626 % | 6,7963 |
| Q5_K_S | 6,787 | 0,012212 | 0,002664 | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: entre 4 y 7 GB para las variantes cuantizadas, dependiendo de la receta (IQ2_S 3,969 GB hasta Q5_K_S 6,787 GB). Añadir overhead de contexto (caché K/V) si se usa la ventana completa de 64K tokens.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB, RTX 4090 24 GB para holgura con contexto largo; A100 y H100 sobradas para cualquier receta.
- Cabe en GPU de consumo: sí, desde GPUs de 6 GB (IQ2_M, Q2_K) hasta 8 GB (IQ4_XS, IQ4_NL, Q4_K_S, Q4_K_M) y 12 GB para las recetas mayores con contexto extendido.
- Opciones de despliegue: BeeLlama.cpp v0.5.0 es obligatorio para las variantes SINQ; llama.cpp, Ollama y vLLM no soportan SINQ según la información disponible. El tag `endpoints_compatible` sugiere compatibilidad con endpoints, pero el runtime concreto no se especifica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---:|---|---|
| Anbeeld SINQ (este repo) | ~9,2 B | 64K evaluado | GGUF + SINQ | Apache 2.0 | KLD medio desde 0,012 (Q5_K_S) hasta 0,296 (IQ2_S) |
| Bartowski Qwen3.5-9B GGUF | ~9,2 B | no disponible | GGUF stock | Apache 2.0 | Referencia de recetas; KLD superior al SINQ emparejado |
| Unsloth Qwen3.5-9B | ~9,2 B | no disponible | GGUF | Apache 2.0 | Comparado en las gráficas del repo; métricas no detalladas |
| Qwen3.5-9B BF16 | ~9,2 B | no disponible | safetensors | Apache 2.0 | Referencia de fidelidad (KLD 0 por definición) |

## Limitaciones y advertencias

- Las variantes SINQ solo funcionan con BeeLlama.cpp v0.5.0; otros runtimes (llama.cpp estándar, Ollama, vLLM) no las cargarán correctamente.
- Las recetas de baja precisión (IQ2_S, IQ2_M, Q2_K) presentan KLD medio entre 0,17 y 0,30 y Top-1 entre 77,8 % y 83,3 %, con riesgo apreciable de degradación en tareas sensibles.
- Las colas de la distribución KLD (P99, P99.9, máximo) alcanzan valores de 13 a 34 en las recetas de 2 bits, indicando episodios puntuales de divergencia severa.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en esta ficha; depende del modelo base, no evaluado aquí.
- Idiomas soportados no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-9B enlazada en la model card.
- El repositorio ocupa 162,1 GB, lo que exige espacio de almacenamiento considerable para descargar todas las recetas.
- No se han publicado benchmarks de tareas (MMLU, HumanEval, GSM8K), por lo que la calidad funcional del modelo base no está verificada en esta fuente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Anbeeld/Qwen3.5-9B-GGUF-Bartowski-SINQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Recetas Bartowski: https://huggingface.co/bartowski/Qwen_Qwen3.5-9B-GGUF
- Runtime BeeLlama.cpp v0.5.0: https://github.com/Anbeeld/beellama.cpp
- Repositorio hermano con variantes MTP: https://huggingface.co/Anbeeld/Qwen3.5-9B-MTP-GGUF-Bartowski-SINQ
