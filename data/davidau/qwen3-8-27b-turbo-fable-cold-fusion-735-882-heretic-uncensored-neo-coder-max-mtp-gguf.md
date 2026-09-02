# DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

El modelo **DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF** es un fine tune de la serie Qwen3.8 27B, desarrollado por DavidAU en colaboración con varios contribuyentes (Nightmedia, TeichAI, armand0e, trohrbaugh). Se trata de un ajuste multi-etapa que combina los métodos COLD FUSION (GAIN + Unsloth) y Fable Fusion 711, con el objetivo de reducir drásticamente el número de tokens de razonamiento interno (hasta 1/10 en algunos casos) manteniendo o mejorando la calidad de las respuestas. El modelo está orientado a tareas de razonamiento, generación de código, escritura creativa y roleplay, y se distribuye en formato GGUF con cuantizaciones regulares y MTP (Multi-Token Prediction).

La relevancia de este modelo radica en que, según su autor, es el primer fine tune de su tamaño que supera los 730 puntos en ARC-C y 880 en ARC-E tanto en cuantización de 8 bits como de 4 bits, acercándose a la "zona de inteligencia" de modelos propietarios como OpenAI, Claude o Gemini. Además, incorpora un proceso de "heretic'ing" (eliminación de censura) y abliteración, lo que lo hace especialmente atractivo para casos de uso que requieren respuestas sin restricciones. El repositorio contiene tanto quants GGUF estándar como variantes MTP con doble imatrix, y está pensado para ejecutarse en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8 27B, detalles no especificados) |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se indica si es MoE; por el tamaño y nombre, se asume dense) |
| Longitud de contexto | no disponible (variantes similares del autor indican 256k, pero no confirmado para este repo) |
| Tipos de cuantizacion | GGUF (4-bit y 8-bit, con imatrix; también variantes MTP) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el repo también contiene safetensors del modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8 27B, un transformer denso de 27B parámetros, aunque la model card no proporciona detalles técnicos adicionales (número de capas, heads, etc.). El entrenamiento es un proceso multi-etapa que combina varios métodos propietarios:

- **COLD FUSION**: técnica que integra el método "GAIN" (programación que ajusta dinámicamente el entrenamiento por muestra en tiempo real) con los sistemas de entrenamiento de Unsloth. Esto permite mejorar métricas sin "sobrecocinar" el modelo.
- **Fable Fusion 711**: método de fusión multi-etapa y multi-fine tune desarrollado previamente por el equipo.
- **Heretic'ing**: proceso de eliminación de censura (de-censoring) aplicado al modelo final.
- **Abliteración**: técnica para eliminar o reducir sesgos y comportamientos no deseados.

El modelo se entrenó sobre datasets propios como `DavidAU/Polar-STRICT-Datasets` y `DavidAU/F451-STRICT-Datasets`, además de trazas ligeras de Claude Opus y GPT-5 (Polaris). No se especifica el número total de tokens de entrenamiento ni si se usó RLHF o DPO. El autor afirma que el modelo reduce los tokens de pensamiento entre 1/2 y 1/10 respecto al Qwen3.8 base, manteniendo la calidad de salida.

## Capacidades

- Generación de texto y razonamiento multi-paso (thinking mode) con tres modos de esfuerzo (xhigh, medium, low).
- Generación de código (etiqueta "coder") y soporte para tareas de programación.
- Escritura creativa y narrativa: cuentos, ficción, roleplay, todos los géneros.
- Capacidades multilingües: inglés y chino (según la model card).
- Soporte de tool calling / function calling: no confirmado explícitamente, pero probablemente heredado de Qwen3.8.
- Capacidades de visión: el pipeline se indica como `image-text-to-text`, y variantes similares del autor incluyen un mmproj para soporte de imágenes; no confirmado para este repo específico.
- Modelo "uncensored" y "abliterated": respuestas sin restricciones de contenido (con las advertencias correspondientes).

## Casos de uso

- **Asistente de programación en producción**: el modelo puede generar código, explicar algoritmos y depurar errores. Su reducción de tokens de pensamiento lo hace más rápido que el Qwen3.8 base, adecuado para integración en IDEs o pipelines de CI/CD.
- **Escritura creativa y narrativa**: ideal para generar historias, guiones o contenido de ficción con un estilo detallado y sin censura, gracias a su entrenamiento específico en creatividad y roleplay.
- **Roleplay y personajes conversacionales**: su capacidad para mantener conversaciones largas y coherentes, junto con la eliminación de censura, lo hace útil para aplicaciones de entretenimiento o simulación de personajes.
- **Razonamiento y resolución de problemas**: con un modo de pensamiento optimizado, puede abordar problemas matemáticos, lógicos o de planificación con menos tokens, reduciendo costes de inferencia.
- **Análisis de documentos técnicos**: al soportar inglés y chino, puede procesar y resumir documentación técnica en ambos idiomas, aunque la ventana de contexto no está confirmada.
- **Generación de contenido sin restricciones**: para casos de uso donde se requiere libertad creativa total (por ejemplo, escritura de ficción adulta o sátira), siempre que se cumplan las políticas de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. La model card menciona que el modelo supera al Qwen3.8 27B base y al Qwen3.6-35B-A3B en los 7 benchmarks críticos, y que alcanza valores de **ARC-C: 735** y **ARC-E: 882** (de ahí el nombre del modelo) tanto en 8-bit como en 4-bit. Sin embargo, no se proporcionan tablas comparativas con otros modelos ni métricas como MMLU, HumanEval o GSM8K. Se recomienda consultar el repositorio del modelo base para más detalles.

## Requisitos de hardware

- **VRAM estimada**: para una cuantización de 4 bits, se requieren aproximadamente 14-16 GB de VRAM (27B parámetros × 0.5 bytes/parámetro + overhead). Para 8 bits, alrededor de 27-30 GB.
- **GPU recomendadas**: RTX 3090/4090 (24 GB) para 4-bit; A100 40GB o H100 para 8-bit o mayor margen.
- **Compatibilidad con GPU de consumo**: sí, con cuantización 4-bit cabe en GPUs de 24 GB (RTX 3090, 4090, etc.).
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, vLLM (si se convierte a formato compatible), TGI. El repo incluye quants GGUF listos para usar con llama.cpp.
- **Latencia y throughput**: no disponible. El autor afirma que la reducción de tokens de pensamiento acelera la generación, pero no se dan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8 27B (base) | 27B | no disponible | Apache 2.0 | Modelo base sin fine tune |
| Qwen3.6-35B-A3B | 35B (MoE, 3B activos) | no disponible | Apache 2.0 | Modelo MoE de la misma familia |
| Este modelo (DavidAU) | 26.9B | no disponible | Apache 2.0 | Fine tune con reducción de tokens de pensamiento y sin censura |

Según el autor, este modelo supera a ambos en los 7 benchmarks críticos, pero no se aportan datos numéricos verificables. La comparativa es cualitativa y basada en afirmaciones del creador.

## Limitaciones y advertencias

- **Contenido sin censura**: al ser un modelo "uncensored" y "heretic", puede generar contenido ofensivo, inapropiado o ilegal. No es adecuado para aplicaciones comerciales sin moderación.
- **Sesgos y alucinaciones**: como cualquier modelo de lenguaje, puede producir respuestas incorrectas o inventadas, especialmente en dominios especializados.
- **Idiomas limitados**: solo se garantizan inglés y chino; el rendimiento en otros idiomas puede ser inferior.
- **Contexto no confirmado**: no se especifica la longitud de contexto real; si se usa con 256k, el rendimiento puede degradarse en ventanas muy largas.
- **Licencia**: Apache 2.0 permite uso comercial, pero el contenido generado puede tener implicaciones legales según el caso de uso.
- **Reproducibilidad**: los métodos de entrenamiento (GAIN, COLD FUSION) no están documentados públicamente, lo que dificulta la verificación independiente de los resultados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Variante similar (Cold-Fusion-GAIN): https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Artículo de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
