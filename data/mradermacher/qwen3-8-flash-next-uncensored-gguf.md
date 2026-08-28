# mradermacher/Qwen3.8-Flash-Next-Uncensored-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-Flash-Next-Uncensored-GGUF` es una versión cuantizada en formato GGUF del modelo `orcarouter/Qwen3.8-Flash-Next-Uncensored`, que a su vez es un fine-tuning "uncensored" (sin censura) del modelo Qwen3.8-Flash-Next de Qwen. Este último es un modelo de lenguaje multimodal de 125B parámetros con arquitectura MoE, basado en la nueva arquitectura Qwen4, que incorpora atención híbrida GDN + QSA y soporta una ventana de contexto de 262K tokens. La versión "uncensored" ha sido sometida a un proceso de abliteration, eliminando los rechazos de contenido, lo que la hace útil para tareas de red teaming y pruebas de seguridad.

El repositorio de mradermacher proporciona únicamente los pesos cuantizados en GGUF, incluyendo archivos multimodales (mmproj) para visión. Según los datos de HuggingFace, el modelo tiene 448.931.056 parámetros (un valor inusualmente bajo comparado con el modelo base de 125B, posiblemente debido a una cuantización agresiva o a que se trata de una versión reducida). El tamaño del repositorio es de 1.5 GB, lo que sugiere que es un modelo pequeño, probablemente una destilación o un subconjunto del original. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

Este lanzamiento es relevante porque ofrece una alternativa sin restricciones de contenido para investigadores que necesitan probar comportamientos límite de los modelos, aunque su tamaño reducido limita su capacidad en comparación con el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (GDN + QSA) sobre Qwen4, con soporte multimodal |
| Parametros totales | 448.931.056 (según safetensors) |
| Parametros activos | no disponible (el modelo base tiene 6B activos, pero esta versión reducida no especifica) |
| Longitud de contexto | no disponible (el modelo base soporta 262K, pero esta versión no lo indica) |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS, más mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida de atención GDN (Gated Delta Network) y QSA (Quadratic Self-Attention), diseñada para mejorar la eficiencia computacional y la capacidad de modelado. Es un MoE con 125B parámetros totales y 6B activos por token, e incorpora predicción multi-token (MTP). La versión "uncensored" de orcarouter se obtuvo mediante un proceso de abliteration, que elimina las capas de rechazo de contenido del modelo original, permitiendo generar respuestas sin las restricciones habituales de seguridad. No se dispone de detalles sobre el dataset de entrenamiento del fine-tuning ni sobre el uso de RLHF o DPO. La cuantización GGUF realizada por mradermacher es estática (sin imatrix) y no se ha aplicado ninguna técnica de calibración adicional.

## Capacidades

- Generación de texto sin restricciones de contenido (gracias a la abliteration).
- Razonamiento multi-step y soporte para function calling (según los tags del modelo).
- Capacidades multimodales: incluye archivos mmproj para procesamiento de imágenes (visión).
- Soporte de predicción multi-token (MTP) para acelerar la inferencia.
- Multilingüe limitado a inglés y chino.
- Compatible con herramientas de inferencia que aceptan GGUF, como llama.cpp, Ollama y vLLM (con adaptaciones).

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo puede utilizarse para generar contenido provocador o extremo con el fin de probar sistemas de moderación y filtros de contenido en aplicaciones de producción.
- Investigación en alineación de modelos: permite estudiar el comportamiento de un modelo sin capas de rechazo, analizando sesgos y riesgos de alucinación en entornos controlados.
- Pruebas de jailbreak y robustez: al carecer de restricciones, es útil para verificar si otros modelos o sistemas pueden ser manipulados para producir respuestas no deseadas.
- Generación de datos sintéticos para entrenamiento de clasificadores de contenido tóxico: se pueden generar ejemplos adversarios para mejorar los sistemas de detección.
- Prototipado rápido de aplicaciones conversacionales sin filtros: aunque no es recomendable para producción, sirve para explorar interacciones libres en entornos de desarrollo.
- Evaluación de la degradación por cuantización: al comparar las distintas versiones cuantizadas, se puede medir el impacto en la calidad de generación y razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3.8-Flash-Next reporta mejoras sobre Qwen3 en tareas de razonamiento y código, pero no hay datos específicos para esta versión "uncensored" ni para las cuantizaciones GGUF.

## Requisitos de hardware

- Al ser un modelo de ~449M parámetros, el archivo GGUF más grande (f16) ocupa aproximadamente 0.9 GB, y las cuantizaciones más bajas (Q2_K) alrededor de 0.3 GB. Esto permite ejecutarlo en GPUs con 2 GB de VRAM o incluso en CPU.
- Cabe en cualquier GPU consumer moderna (GTX 1060 6GB, RTX 3060, etc.) e incluso en dispositivos con memoria unificada como Apple Silicon.
- Para inferencia multimodal, se necesita cargar también el archivo mmproj (0.7-1.0 GB), lo que aumenta los requisitos de VRAM a unos 2 GB adicionales.
- Se puede desplegar con llama.cpp, Ollama, LM Studio o cualquier runtime compatible con GGUF. vLLM también soporta GGUF recientemente, aunque con limitaciones.
- La latencia será muy baja en GPU, del orden de milisegundos por token, y en CPU se puede ejecutar en tiempo real con cuantizaciones bajas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 125B (6B activos) | 262K | Apache 2.0 | safetensors | Modelo base multimodal, con censura |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | Apache 2.0 | safetensors | Fine-tuning abliterated del original |
| mradermacher/Qwen3.8-Flash-Next-Uncensored-GGUF | 448.9M | no disponible | Apache 2.0 | GGUF | Cuantización del modelo uncensored, tamaño reducido |
| Llama-3.2-3B-Instruct | 3.2B | 128K | Llama 3.2 | GGUF/safetensors | Alternativa de tamaño similar, con censura y sin multimodal |

La comparativa muestra que esta versión cuantizada es significativamente más pequeña que el modelo base, lo que la hace adecuada para entornos con recursos limitados, pero sacrificando capacidad.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o peligroso. No debe utilizarse en producción sin filtros adicionales.
- La abliteration no elimina los sesgos del modelo original; puede amplificarlos al no tener restricciones.
- Riesgo elevado de alucinación, especialmente en tareas factuales, debido al tamaño reducido y la cuantización.
- El número de parámetros (448M) es mucho menor que el del modelo base (125B), lo que sugiere que podría tratarse de una destilación o de un error en los metadatos. Se recomienda verificar el contenido real del repositorio antes de usarlo.
- La ventana de contexto no está documentada para esta versión; si se hereda del modelo base, sería de 262K, pero no hay garantía.
- Solo soporta inglés y chino; no se garantiza un buen rendimiento en otros idiomas.
- Las cuantizaciones estáticas (sin imatrix) pueden tener una degradación de calidad mayor que las versiones con imatrix, aunque para un modelo tan pequeño la diferencia es menor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-Flash-Next-Uncensored-GGUF
- Modelo base (uncensored): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo original Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub oficial de Qwen: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de unsloth sobre el modelo: https://unsloth.ai/docs/models/qwen3.8-next
- Recetas de vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
