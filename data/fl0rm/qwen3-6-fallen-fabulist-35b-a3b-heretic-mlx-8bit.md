# fl0rm/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic-mlx-8Bit

## Resumen

El modelo `fl0rm/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic-mlx-8Bit` es una conversión al formato MLX (Apple Silicon) del modelo base `Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic`, un merge creado con `mergekit` a partir de la arquitectura Qwen3.6-35B-A3B (Mixture of Experts). El nombre "Fallen Fabulist" sugiere un modelo orientado a roleplay y storytelling, con etiquetas como `uncensored`, `decensored` y `abliterated`, lo que indica que se han eliminado las restricciones de contenido y se ha aplicado una técnica de "abliteración" para reducir la negativa a generar respuestas no deseadas.

La versión MLX está cuantizada a 8 bits, lo que reduce el tamaño del modelo a aproximadamente 36.8 GB y permite su ejecución en dispositivos con memoria unificada de Apple. El archivo `safetensors` reporta 9.749.130.368 parámetros (9.7B), una cifra que no coincide con la nomenclatura de 35B del modelo base; esto puede deberse a la cuantización o a una reducción en el número de parámetros durante el merge, aunque no se dispone de documentación que lo aclare. La licencia es Apache-2.0, lo que permite uso comercial y modificación.

Este modelo es relevante para desarrolladores que buscan una alternativa sin censura para generación de texto creativo, roleplay o asistentes conversacionales, con la ventaja de ser ejecutable en hardware de Apple mediante MLX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3.6-35B-A3B |
| Parametros totales | 35B (según nomenclatura) / 9.7B (según safetensors) |
| Parametros activos | 3B (según nomenclatura) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un merge basado en Qwen3.6-35B-A3B, una arquitectura MoE con 35 mil millones de parámetros totales y 3 mil millones activos por token. El proceso de creación incluye técnicas de "abliteration" para eliminar la censura y el sesgo de rechazo, lo que da como resultado un modelo más "hereje" (heretic) en términos de generación de contenido sin restricciones. Posteriormente, el modelo se convirtió a MLX utilizando `mlx-lm` versión 0.31.2, con cuantización de 8 bits para reducir el uso de memoria. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el proceso de fine-tuning (si lo hubo), ya que se trata de un merge y una conversión técnica, no de un entrenamiento desde cero.

## Capacidades

- Generación de texto creativo: adecuado para roleplay, narración de historias y escritura de ficción.
- Conversación multi-turno: al estar basado en Qwen3.6, hereda capacidades de chat y seguimiento de instrucciones.
- Sin censura: el modelo ha sido modificado para no rechazar peticiones de contenido explícito o sensible, lo que lo hace útil para entornos donde se requiere libertad creativa.
- Soporte de tool calling: no confirmado explícitamente, pero heredado potencialmente de la arquitectura Qwen3.6.
- Compatibilidad con MLX: puede ejecutarse en Mac con Apple Silicon mediante `mlx-lm`.
- Multimodalidad: la etiqueta `image-text-to-text` sugiere posible entrada de imágenes, aunque no hay evidencia en la documentación; se recomienda verificar.

## Casos de uso

- Roleplay y juegos de rol: el modelo puede generar respuestas inmersivas y coherentes para personajes ficticios, manteniendo el contexto a lo largo de conversaciones largas.
- Escritura creativa: asistencia en la redacción de cuentos, novelas y guiones, con capacidad para explorar temas tabú sin restricciones.
- Chatbots sin filtros: desarrollo de asistentes conversacionales para comunidades que requieren respuestas sin censura (por ejemplo, foros de adultos o ficción).
- Generación de diálogos para videojuegos: creación de NPCs con personalidades complejas y respuestas dinámicas.
- Exploración de narrativas alternativas: generación de historias en géneros como horror, erotismo o política, donde los modelos censurados suelen fallar.
- Prototipado rápido de aplicaciones de IA generativa: al ser un modelo MoE con 3B activos, ofrece inferencia relativamente rápida en hardware de gama alta, y su formato MLX facilita su integración en ecosistemas Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 35B en cuantización de 8 bits, requiere aproximadamente 35 GB de memoria para cargar todos los pesos. En MLX, se usa memoria unificada del sistema, por lo que un Mac con 64 GB o más de RAM unificada es recomendable.
- GPUs compatibles: no es adecuado para GPUs de consumo (RTX 4090 con 24 GB no es suficiente). Se recomienda A100 de 40 GB o 80 GB, o H100.
- En Mac: funciona con Apple Silicon (M1 Pro/Max/Ultra o superior) con al menos 32 GB de RAM unificada (aunque 64 GB es más seguro).
- Opciones de despliegue: el formato MLX se usa con `mlx-lm` (Python). No es compatible directamente con vLLM, llama.cpp u Ollama, salvo que se convierta a otros formatos.
- Latencia y throughput: no disponible, pero al ser un MoE con 3B activos, la inferencia es más rápida que un modelo denso de 35B, aunque el cuello de botella es la memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Cuantización | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (original) | 35B (3B activos) | MoE | no disponible | Apache-2.0 | FP8, BF16, etc. | Hugging Face |
| Qwen3.6-35B-A3B-Uncensored-Heretic-MLX-8bit (froggeric) | 35B (3B activos) | MoE | no disponible | Apache-2.0 | 8-bit MLX | Hugging Face |
| fl0rm/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic-mlx-8Bit | 35B (3B activos) | MoE | no disponible | Apache-2.0 | 8-bit MLX | Hugging Face |

No hay datos suficientes para comparar rendimiento real entre estas variantes.

## Limitaciones y advertencias

- Contenido sin censura: el modelo puede generar contenido explícito, ofensivo o ilegal, lo que supone un riesgo legal y ético en entornos de producción.
- Alucinaciones: como cualquier LLM, puede inventar hechos o respuestas incorrectas, especialmente en temas factuales.
- Contexto limitado: no se ha confirmado la longitud de contexto; si es similar a Qwen3.6, podría ser de 256K tokens, pero no está documentado.
- Idiomas: no se especifican los idiomas soportados; probablemente se hereda el multilingüismo de Qwen, pero no es seguro.
- Formato MLX: no es directamente compatible con frameworks estándar como vLLM o TGI, lo que limita su despliegue en infraestructura tradicional.
- Discrepancia en parámetros: el archivo safetensors reporta 9.7B parámetros, lo que sugiere que el modelo podría ser una versión reducida o que la cuantización afecta al conteo; esto puede causar confusión en la planificación de recursos.
- Sin mantenimiento: el autor no ha recibido descargas ni likes, lo que indica que es un proyecto personal sin soporte activo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fl0rm/Qwen3.6-Fallen-Fabulist-35B-A3B-heretic-mlx-8Bit
- Modelo base: https://huggingface.co/Cyclone-Labs/Qwen3.6-Fallen-Fabulist-35B-A3B
- Variante similar de froggeric: https://huggingface.co/froggeric/Qwen3.6-35B-A3B-Uncensored-Heretic-MLX-8bit
- Página del modelo original Qwen3.6 en LM Studio: https://lmstudio.ai/models/qwen/qwen3.6-35b-a3b
- Repositorio de despliegue con NVFP4 y DFlash: https://github.com/AEON-7/Qwen3.6-35B-A3B-heretic-NVFP4-DFlash
