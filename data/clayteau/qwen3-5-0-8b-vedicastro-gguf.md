# clayteau/Qwen3.5-0.8B-VedicAstro-GGUF

## Resumen

VedicAstro 0.8B es un ajuste fino de un modelo base Qwen3.5 de 0,8B de parámetros, especializado en astrología védica (jyotish). Lo desarrolla el usuario clayteau y se distribuye en formato GGUF para inferencia en dispositivo. El modelo no calcula cartas astrales: genera lecturas, predicciones por áreas de la vida y respuestas a preguntas a partir de hechos de carta estructurados que el usuario debe aportar en el prompt.

Esta ficha cubre la variante cuantizada `clayteau/Qwen3.5-0.8B-VedicAstro-GGUF`, publicada el 13 de noviembre de 2026 y actualizada el 21 de noviembre de 2026. El repositorio incluye tres cuantizaciones (Q4_K_M, Q8_0 y f16) de la rama "v11 guarded" y un conjunto equivalente en el subdirectorio `v11u/` correspondiente a la ablación sin guardas. El modelo base declarado es `clayteau/Qwen3.5-0.8B-VedicAstro`, con 752.393.024 parámetros reales según safetensors.

Su relevancia es acotada y de nicho: demuestra un caso de ajuste fino de un modelo sub-1B para una tarea vertical muy específica, con un objetivo de despliegue en telefonía (la cuantización Q4_K_M ocupa 535 MB). La licencia Apache-2.0 heredada del modelo base facilita su redistribución y uso comercial, aunque el ámbito de aplicación es deliberadamente restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q4_K_M |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5 ni del ajuste fino. Se sabe que el modelo original es multimodal (la model card menciona que la torre de visión del base no forma parte del GGUF), de modo que el modelo base combina procesamiento de texto con visión, aunque esta variante cuantizada es solo texto. El ajuste fino se orienta a generar lecturas de astrología védica condicionadas a hechos de carta estructurados.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card sí describe una distinción entre una rama "guarded" (con guardas, la principal) y una rama "unguarded" (sin guardas, en `v11u/`), lo que sugiere que el ajuste incluyó un control de comportamiento para rechazar predicciones médicas, legales, financieras y de fallecimiento. Las cuantizaciones se generaron con `convert_hf_to_gguf.py` (maestro F16) y `llama-quantize` de llama.cpp.

Una particularidad técnica relevante: el modelo "siempre piensa", es decir, genera razonamiento en un canal separado que consume presupuesto de tokens de completion. Se puede reducir con `chat_template_kwargs: {"reasoning_effort": "low"}` para obtener razonamiento corto y respuestas directas.

## Capacidades

- Generación de texto conversacional en inglés, orientada a lecturas de astrología védica.
- Producción de predicciones por áreas de la vida y respuestas a preguntas sobre carta astral, siempre a partir de hechos estructurados aportados por el usuario.
- Modo de razonamiento explícito en canal separado (thinking), con control de esfuerzo mediante `reasoning_effort`.
- Comportamiento con guardas: rechaza por diseño predicciones médicas, legales, financieras y de fallecimiento.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y plantilla de chat Jinja (`--jinja`).
- Solo texto: no procesa imágenes en esta variante GGUF.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso orientado a agentes.

## Casos de uso

- Aplicación móvil de astrología védica: la cuantización Q4_K_M de 535 MB permite ejecución en telefonía de gama media, generando lecturas a partir de la carta que la app calcula por su cuenta.
- Generación de lecturas personalizadas por área de la vida: el modelo recibe hechos de carta estructurados y produce texto interpretativo para áreas como carrera, relaciones o salud (sin predicciones médicas, por las guardas).
- Preguntas y respuestas sobre carta astral: un asistente conversacional que responde dudas del usuario condicionado a los datos de su carta, útil en webs de servicios astrológicos.
- Prototipado de asistentes verticales: sirve como referencia para evaluar el ajuste fino de modelos sub-1B en dominios de nicho con despliegue local.
- Inferencia offline en escritorio o servidor con Q8_0 (812 MB) o f16 (1,5 GB) para entornos sin conectividad o con requisitos de privacidad.
- Investigación sobre control de comportamiento: la rama `v11u/` sin guardas permite comparar el efecto de las guardas frente a la ablación en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,6 GB para Q4_K_M, 0,9 GB para Q8_0 y 1,6 GB para f16, sumando overhead del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM; el modelo está pensado para ejecución en CPU en telefonía.
- Cabe en GPU consumer: sí, en cualquier RTX o iGPU moderna, e incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama y otros runtimes compatibles con GGUF; el tag `endpoints_compatible` sugiere integración con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles. El modo de razonamiento obligatorio incrementa los tokens generados y, por tanto, la latencia, salvo que se use `reasoning_effort: low`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| VedicAstro 0.8B GGUF | 752 M | No disponible | Apache-2.0 | GGUF | Astrologia védica, on-device |
| Qwen3.5 0.8B (base) | ~0,8 B | No disponible | Apache-2.0 (heredada) | Safetensors | Propósito general, multimodal |
| Modelos sub-1B de propósito general (p. ej. Qwen2.5-0.5B, Llama-3.2-1B) | 0,5-1,2 B | 32K-128K (según modelo) | Apache-2.0 / Llama | Safetensors, GGUF | Propósito general |

La comparación directa con alternativas de la misma tarea no está disponible, ya que no se conocen modelos públicos equivalentes especializados en astrología védica. Frente a los modelos sub-1B de propósito general, la ventaja es la especialización y el tamaño reducido de la cuantización; la desventaja es el alcance limitado y la ausencia de benchmarks publicados.

## Limitaciones y advertencias

- No calcula cartas astrales: depende de que el usuario aporte los hechos estructurados; si faltan o son erróneos, la salida será incorrecta.
- Riesgo de alucinación inherente a un modelo de 0,8B: puede inventar interpretaciones o detalles no sustentados en los hechos aportados.
- Solo inglés: no hay soporte documentado de otros idiomas, incluido el castellano.
- Solo texto: la torre de visión del modelo base no está incluida en el GGUF.
- El modo de razonamiento obligatorio consume presupuesto de tokens y puede truncar respuestas si `max_tokens` es insuficiente.
- Las guardas rechazan predicciones médicas, legales, financieras y de fallecimiento; la rama `v11u/` sin guardas no ofrece esa protección y no debería usarse en producción orientada a usuarios finales.
- Contenido para reflexión y entretenimiento: no debe presentarse como asesoramiento profesional.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5 del que se hereda.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.

## Enlaces

- Modelo GGUF: https://huggingface.co/clayteau/Qwen3.5-0.8B-VedicAstro-GGUF
- Modelo base ajustado: https://huggingface.co/clayteau/Qwen3.5-0.8B-VedicAstro
- llama.cpp: https://github.com/ggml-org/llama.cpp
