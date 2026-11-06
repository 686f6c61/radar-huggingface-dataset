# AJ-Gonzalez/LFM2.5-350M-heretic

## Resumen

LFM2.5-350M-heretic es una variante del modelo LiquidAI/LFM2.5-350M a la que se le ha aplicado una técnica de "abliteración" (eliminación de la dirección de rechazo) mediante la herramienta Heretic 2.0.0.dev0. El resultado es un checkpoint de 354 millones de parámetros que mantiene las capacidades del modelo base pero ha perdido la mayor parte de sus mecanismos de rechazo ante peticiones dañinas: la tasa de rechazo medida baja de 89/100 a 12/100, con una divergencia KL de 0,0459 respecto al modelo original. No se ha realizado ningún fine-tuning: los pesos son los del modelo base con una resta de rango 1 aplicada a las matrices que escriben en el flujo residual.

El modelo base, LFM2.5-350M, es un transformer híbrido de 16 capas que combina bloques de convolución corta con bloques de atención, desarrollado por Liquid AI para despliegue en dispositivos de borde. Esta variante hereda esa arquitectura y su tokenizador multilingüe (9 idiomas), pero está pensada explícitamente como un ejercicio de aprendizaje y artefacto reproducible del método de abliteración, no como un modelo listo para producción. El autor advierte que no ha habido evaluación de seguridad, ni evaluación de daño humano, ni benchmarks de capacidad más allá de comprobaciones puntuales.

La relevancia de esta ficha es doble: por un lado documenta qué le ocurre a un checkpoint pequeño cuando se le elimina la dirección de rechazo (el guardarraíl desaparece pero no aparece conocimiento nuevo, las respuestas dañinas son inertes o fabricadas); por otro, sirve como referencia metodológica para quienes investigan alineación, edición de pesos y robustez de mecanismos de seguridad en modelos de menos de 1B de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido conv/attention (LFM2.5), 16 capas |
| Parámetros totales | 354.483.968 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo solo publica safetensors en bfloat16) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt |
| Licencia | lfm1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-350M es un transformer de 16 capas con una pila híbrida que intercala bloques de convolución corta y bloques de atención. Según la model card, los componentes ablacionables son 16 módulos `attn.o_proj` (9 de salida de convolución y 7 de atención) y 16 módulos `mlp.down_proj`, todos ellos matrices que escriben en el flujo residual. No se ha realizado entrenamiento adicional: la variante heretic aplica una actualización de rango 1 (resta de una dirección residual por capa) sobre esos pesos.

El método, implementado con Heretic 2.0.0.dev0, calcula por capa una dirección residual como diferencia de medias entre el primer token generado para prompts dañinos (`mlabonne/harmful_behaviors`) y prompts inocuos (`mlabonne/harmless_alpaca`), y ortogonaliza las matrices de pesos relevantes contra esa dirección. La forma del kernel y el índice de dirección se optimizan conjuntamente con búsqueda TPE sobre 100 trials (30 de arranque) en un Apple M1 de 8 GB, con 52 minutos de tiempo de reloj. Se eligió `row_normalization = "none"` de forma deliberada porque la normalización completa (`"full"`) ejecuta una SVD por matriz que cae a CPU en MPS y bloquea la ejecución. El trial seleccionado es el 19 de 100, un punto intermedio del frente de Pareto. La semilla no se fijó, por lo que la trayectoria TPE no es reproducible bit a bit.

## Capacidades

- Generación de texto conversacional en 9 idiomas (en, ar, zh, fr, de, ja, ko, es, pt).
- Razonamiento aritmético básico y generación de código sencillo (el autor verifica una implementación de Fibonacci y explica que conserva los mismos errores que el modelo base, incluido un off-by-one en el bucle).
- Explicaciones técnicas breves (protocolos TCP/UDP, resúmenes históricos de tres frases, haikus, relatos de ~230 palabras) con calidad equivalente al modelo base.
- Plantilla de chat conversacional compatible con `apply_chat_template` de transformers.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidad de "no rechazo": ante peticiones dañinas, el modelo tiende a cumplir en lugar de rechazar, pero las respuestas son inertes o fabricadas (por ejemplo, un script que hace `requests.post("https://example.com/...")` sin efecto real).

## Casos de uso

- Investigación sobre alineación y robustez: el modelo sirve como artefacto reproducible para estudiar qué información comparte la dirección de rechazo con la recuperación factual en checkpoints pequeños, comparando el frente de Pareto publicado (6/100 rechazos con KL 0,0906; 12/100 con KL 0,0459; 39/100 con KL 0,0303; 69/100 con KL 0,0048).
- Docencia y divulgación: permite mostrar en un taller cómo funciona la abliteración proyectada paso a paso, con un comando de reproducción concreto y parámetros TOML documentados.
- Evaluación de metodologías de edición de pesos: al ser una actualización de rango 1 sobre un modelo de 350M, es un banco de pruebas barato (cabe en 8 GB de RAM unificada en un M1) para comparar técnicas como MPOA o abliteración proyectada.
- Pruebas de regresión de pipelines de seguridad: se puede usar como caso negativo para validar que un clasificador de contenido o un filtro de salida detecta respuestas dañinas que el modelo base habría rechazado.
- Comparación de escalado de la técnica: el autor contrasta explícitamente con AJ-Gonzalez/LFM3-1.7B-heretic, donde el mismo presupuesto de búsqueda logra una mejor relación rechazo/KL, lo que permite estudiar cómo influye la capacidad del modelo en la eficacia de la abliteración.
- Generación de texto creativo sin restricciones en entornos controlados y sin exposición a usuarios finales, siempre que se trate como material de laboratorio y no como servicio.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas internas de Heretic: tasa de rechazo por marcador de palabra clave sobre 100 generaciones greedy de 100 tokens en `mlabonne/harmful_behaviors` `test[:100]`, y divergencia KL respecto al modelo base sobre las distribuciones del primer token en `mlabonne/harmless_alpaca` `test[:100]`.

| Modelo | Rechazos | KL vs base |
|---|---:|---:|
| LiquidAI/LFM2.5-350M | 89/100 | 0 (por definición) |
| **Este modelo (trial 19)** | **12/100** | **0,0459** |

Frente completo de 100 trials sobre este checkpoint:

| Rechazos | KL | Nota |
|---:|---:|---|
| 6/100 | 0,0906 | mínimo de rechazos encontrado |
| 12/100 | 0,0459 | **este modelo** |
| 39/100 | 0,0303 | rodilla del frente |
| 69/100 | 0,0048 | casi no-op |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 0,7 GB de pesos (el repo ocupa 0,7 GB), más overhead de activaciones y caché KV; viable en GPUs con 4 GB o más.
- Cabe en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, así como en Apple Silicon con memoria unificada (el propio autor lo procesó en un M1 de 8 GB para la ablación).
- GPU recomendadas para producción: cualquier GPU con al menos 4-8 GB de VRAM; para throughput alto, A100 o H100 están sobredimensionadas para este tamaño.
- Opciones de despliegue: transformers nativo (la arquitectura `lfm2` está integrada, no requiere `trust_remote_code`); no se documentan recetas para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazos (Heretic) | KL vs base | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| **LFM2.5-350M-heretic** | 354M | no disponible | 12/100 | 0,0459 | lfm1.0 | Hugging Face |
| LiquidAI/LFM2.5-350M (base) | 354M | no disponible | 89/100 | 0 | lfm1.0 | Hugging Face |
| AJ-Gonzalez/LFM3-1.7B-heretic | no disponible | no disponible | no disponible (mejor trade-off según el autor) | no disponible | no disponible | Hugging Face |

El autor señala explícitamente que, con el mismo presupuesto de búsqueda, LFM3-1.7B-heretic alcanza una relación rechazo/KL muy superior, lo que sugiere que la capacidad del modelo importa más que la búsqueda de hiperparámetros. No se dispone de datos de benchmarks estándar para establecer comparaciones adicionales con otros modelos de 350M.

## Limitaciones y advertencias

- El propio autor la describe como "un ejercicio de aprendizaje, no un modelo listo para producción": sin evaluación de seguridad, sin evaluación de daño humano y sin benchmarks de capacidad más allá de comprobaciones puntuales.
- No debe desplegarse detrás de una interfaz de usuario ni tratarse como fuente de información: las salidas "uncensored" son inertes o fabricadas, no informativas.
- La eliminación del rechazo es una resta de una única dirección global de rango 1, que puede deshacerse con un fine-tuning posterior; no es robusta.
- Riesgo de alucinación: el autor documenta que el modelo conserva los errores del base (off-by-one en Fibonacci, explicación confusa de llegada de trenes) y añade respuestas dañinas fabricadas.
- Sesgos: no documentados en la información disponible.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica; los 9 idiomas declarados no han sido evaluados en esta variante.
- Restricciones de licencia: licencia lfm1.0 (license: other), heredada del modelo base; es necesario revisar los términos de Liquid AI para uso comercial.
- La semilla de la búsqueda TPE no se fijó, por lo que el resultado no es reproducible bit a bit.
- El modelo está fechado en noviembre de 2026 (según metadatos del repo) y no registra descargas ni likes en el momento de redactar esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AJ-Gonzalez/LFM2.5-350M-heretic
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Variante comparable en 1.7B: https://huggingface.co/AJ-Gonzalez/LFM3-1.7B-heretic
- Dataset de prompts dañinos: `mlabonne/harmful_behaviors`
- Dataset de prompts inocuos: `mlabonne/harmless_alpaca`
