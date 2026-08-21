# Jiunsong/supergemma4-26b-uncensored-gguf-v2

## Resumen

SuperGemma4-26B-Uncensored-Fast GGUF v2 es una conversión cuantizada a formato GGUF del modelo Google Gemma 4 26B A4B instruct, publicada por el usuario Jiunsong en Hugging Face. El modelo combina tres objetivos: un comportamiento menos censurado que las versiones de chat estándar de Gemma, un rendimiento práctico superior al modelo base y un despliegue rápido en Apple Silicon gracias a la cuantización Q4_K_M. Está derivado de la línea MLX SuperGemma Fast, que ya incorpora mejoras sobre el modelo base en tareas de código, lógica y coreano.

El archivo incluido es `supergemma4-26b-uncensored-fast-v2-Q4_K_M.gguf`, con 25 233 millones de parámetros totales y una arquitectura MoE con 4 000 millones de parámetros activos (según la nomenclatura del modelo base). La licencia es la de Gemma de Google, no una licencia abierta estándar. El modelo está pensado para entornos de ejecución local como llama.cpp, y ha sido verificado en Apple Silicon (Apple M4 Max) con velocidades de generación de 89.4 tokens por segundo en prompts generales en coreano.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Transformer, derivada de Google Gemma 4 26B A4B |
| Parametros totales | 25 233 236 046 (25,2 B) |
| Parametros activos | 4 B (según nomenclatura del modelo base A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo incluido) |
| Idiomas soportados | Inglés, coreano |
| Licencia | Gemma (licencia de Google con términos de uso específicos) |
| Formato de pesos | GGUF (archivo único `.gguf`) |

## Arquitectura y entrenamiento

El modelo es una conversión GGUF del modelo `google/gemma-4-26B-A4B-it`, que utiliza una arquitectura MoE con 26 000 millones de parámetros totales y 4 000 millones de parámetros activos por token. La conversión se realizó desde la línea MLX SuperGemma Fast, que ya había sido ajustada para mejorar el rendimiento en tareas prácticas (código, lógica, navegador y coreano) frente al modelo base. Según la model card, se empleó un conversor local parcheado para exportar correctamente los tensores MoE a GGUF, y se incrustó un template de chat neutral para evitar que los prompts generales se desvíen hacia comportamientos de codificación o tool-call.

No se proporcionan datos sobre el entrenamiento original (número de tokens, dataset o proceso de ajuste) ni sobre el ajuste específico de la línea SuperGemma. La única información adicional es que la versión "Fast" presenta una puntuación "Quick bench overall" de 95,8 frente a 91,4 del modelo original, aunque no se especifica qué benchmark se usó.

## Capacidades

- Generación de texto y conversación multilingüe en inglés y coreano.
- Generación de código (por ejemplo, funciones Python) con respuestas concisas y correctas.
- Soporte de tool calling y uso de herramientas (según el tag `tool-use`).
- Comportamiento "uncensored": reduce el filtrado de contenido en comparación con las versiones de chat estándar de Gemma.
- Ejecución rápida en hardware local, especialmente en Apple Silicon con llama.cpp.
- Template de chat neutral incrustado que evita que los prompts generales activen modos de codificación o tool calling no deseados.

## Casos de uso

- **Asistente conversacional local**: se puede desplegar en un portátil con Apple Silicon para mantener conversaciones generales en inglés o coreano sin depender de una API externa. La velocidad de generación de 89,4 tokens/s en un M4 Max permite una interacción fluida en tiempo real.
- **Generación de código en entornos de desarrollo**: el modelo puede escribir funciones o fragmentos de código (por ejemplo, en Python) directamente en el terminal o integrado en un editor mediante `llama.cpp`. Su capacidad para seguir instrucciones de código sin desviarse a tool calls lo hace útil en pipelines de CI/CD para generar scripts o documentación técnica.
- **Prototipado rápido de aplicaciones de texto**: gracias a su tamaño compacto en Q4_K_M (alrededor de 14-16 GB), se puede cargar en memoria de una GPU consumer de 16-24 GB para pruebas de concepto de chatbots o asistentes especializados.
- **Entornos de desarrollo con restricciones de conectividad**: al ser un archivo GGUF único, se puede copiar a una máquina sin conexión y ejecutarse con `llama.cpp` u Ollama, sin necesidad de descargar pesos adicionales.
- **Aplicaciones de procesamiento de texto en coreano**: el modelo muestra un rendimiento mejorado en coreano según la model card, por lo que es adecuado para tareas de redacción, traducción o análisis de sentimiento en ese idioma.
- **Experimentos con modelos "uncensored"**: para investigadores que quieren estudiar el comportamiento de un modelo sin filtros de seguridad en entornos controlados, aunque se debe tener en cuenta el riesgo de contenido inapropiado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo proporciona mediciones de velocidad en un Apple M4 Max con `llama.cpp`:

| Medición | Valor |
|---|---|
| Velocidad de prompt (coreano general) | 222,0 tok/s |
| Velocidad de generación (coreano general) | 89,4 tok/s |
| Velocidad de prompt (código Python) | 704,9 tok/s |
| Velocidad de generación (código Python) | 89,4 tok/s |

Además se menciona una puntuación "Quick bench overall" de 95,8 frente a 91,4 del modelo base, pero no se especifica el conjunto de datos ni la metodología.

## Requisitos de hardware

- **VRAM estimada**: el archivo GGUF Q4_K_M de un modelo de 26 000 millones de parámetros suele ocupar entre 14 y 16 GB. No se ha confirmado el tamaño exacto del archivo en el repositorio, pero el tamaño total del repositorio es de 84 GB (incluye otros archivos). Se recomienda al menos 16 GB de VRAM o de memoria unificada en Apple Silicon.
- **GPUs recomendadas**: Apple Silicon con 16 GB o más de memoria unificada (probado en M4 Max). También puede ejecutarse en GPUs NVIDIA con 16-24 GB de VRAM (por ejemplo, RTX 4090, A100) mediante `llama.cpp` u Ollama.
- **Opciones de despliegue**: `llama.cpp` (soporte directo de GGUF), Ollama (compatible con GGUF), o conversión a otros formatos para vLLM si se requiere, aunque no se ha validado.
- **Latencia y throughput**: en M4 Max se obtienen 89,4 tok/s de generación, lo que se traduce en una latencia de aproximadamente 11 ms por token. En hardware inferior la velocidad será menor.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en la información proporcionada. El modelo es una variante de Gemma 4 26B A4B, por lo que se puede comparar con el propio modelo base `google/gemma-4-26B-A4B-it` y con otros GGUF del mismo tamaño, pero no hay datos de rendimiento en benchmarks estándar para realizar una comparación objetiva. Tampoco se proporcionan comparaciones con modelos MoE alternativos como Mixtral 8x7B o Qwen2.5-32B.

## Limitaciones y advertencias

- **Comportamiento "uncensored"**: al eliminar parcialmente los filtros de seguridad, el modelo puede generar contenido inapropiado, ofensivo o peligroso. No se recomienda su uso en aplicaciones públicas sin una moderación adicional.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede inventar información o datos falsos, especialmente en temas especializados o de actualidad.
- **Idiomas limitados**: solo tiene soporte confirmado para inglés y coreano. No se garantiza un buen rendimiento en otros idiomas.
- **Licencia**: la licencia de Google Gemma no es Apache 2.0. Incluye restricciones de uso comercial (por ejemplo, no se permite usarlo para desarrollar modelos competitivos con Google), y requiere revisar los términos completos antes de desplegarlo en un producto.
- **Sin información sobre contexto**: no se especifica la longitud máxima de contexto soportada. El modelo base Gemma 4 suele soportar hasta 128 000 tokens, pero no está confirmado para esta conversión GGUF.
- **Dependencia de hardware**: la velocidad reportada se obtuvo en un Apple M4 Max; en hardware más antiguo o con menos memoria la experiencia puede ser significativamente más lenta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jiunsong/supergemma4-26b-uncensored-gguf-v2
- Model card (mismo enlace): https://huggingface.co/Jiunsong/supergemma4-26b-uncensored-gguf-v2
- Guía para principiantes en HackerNoon: https://hackernoon.com/a-beginners-guide-to-the-supergemma4-26b-uncensored-gguf-v2-model-by-jiunsong-on-huggingface
- Ficha en AIModels.fyi: https://www.aimodels.fyi/models/huggingFace/supergemma4-26b-uncensored-gguf-v2-jiunsong
- Ficha en AI Market Cap: https://aimarketcap.tech/models/jiunsong-supergemma4-26b-uncensored-gguf-v2
