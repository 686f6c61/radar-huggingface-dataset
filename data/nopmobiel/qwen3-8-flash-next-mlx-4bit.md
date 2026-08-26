# nopmobiel/Qwen3.8-Flash-Next-MLX-4bit

## Resumen

Qwen3.8-Flash-Next-MLX-4bit es una conversión local al formato MLX (Apple Silicon) del modelo multimodal Qwen3.8-Flash-Next, desarrollado por Qwen (Alibaba). El modelo original es un MoE (Mixture of Experts) de 125B parámetros con 6B activos por token, basado en la nueva arquitectura Qwen4, que combina visión y lenguaje con una ventana de contexto de 262K tokens. Esta conversión, realizada por el usuario nopmobiel, aplica cuantización afinada de 4 bits a los pesos de lenguaje y embeddings, 8 bits a las puertas de enrutamiento MoE, y mantiene la torre de visión en BF16, lo que permite ejecutar el modelo en hardware Apple con memoria unificada.

La relevancia de esta ficha radica en que es una de las primeras adaptaciones MLX de la arquitectura Qwen4-Exp, aún no soportada oficialmente por `mlx-vlm`. El autor incluye un módulo de runtime para integrar el modelo en un checkout local de `mlx-vlm`, y ha verificado su funcionamiento en un Apple M5 Max con 128 GB de memoria unificada, alcanzando 60.95 tokens/s de generación en modo texto y 48.92 tokens/s en modo imagen+texto. Es una opción práctica para desarrolladores que quieran probar el modelo en hardware Apple sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (vision-lenguaje) basada en Qwen4-Exp |
| Parametros totales | 125B (MoE, 6B activos por token) + 51B n-gram embeddings (modelo original); checkpoint MLX 4-bit: 29.706.460.051 parametros almacenados |
| Parametros activos | 6B por token (modelo original) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | Language weights: affine 4-bit (group size 64); PLE n-gram embedding: affine 4-bit (group size 32); MoE routing gates: affine 8-bit (group size 64); vision tower: BF16 |
| Idiomas soportados | no disponible (el modelo base de Qwen suele ser multilingue, pero no se especifica en la informacion) |
| Licencia | qwen-community-1.0 (licencia comunitaria de Qwen) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea la arquitectura Qwen4, una evolución de la serie Qwen3 que introduce un diseño MoE con 125B parámetros totales y 6B activos por token. Además del transformer MoE, incorpora un módulo de embeddings n-gram (PLE) de 51B parámetros que complementa la representación del lenguaje. La torre de visión está integrada en el mismo modelo, permitiendo entrada de imágenes junto con texto. El entrenamiento del modelo original no está detallado en la información disponible, pero se sabe que soporta razonamiento avanzado y una ventana de contexto de 262K tokens.

La conversión MLX 4-bit mantiene la arquitectura completa pero cuantiza los pesos de lenguaje y embeddings a 4 bits con grupos de tamaño 64 y 32 respectivamente, y las puertas de enrutamiento MoE a 8 bits. La torre de visión se conserva en BF16 para preservar la calidad de la percepción visual. Los tensores nativos de MTP (Multi-Token Prediction) no se incluyen en este checkpoint, por lo que no se dispone de decodificación especulativa nativa. El modelo requiere el soporte experimental Qwen4-Exp en `mlx-vlm`, que el autor proporciona como módulo empaquetado en el repositorio.

## Capacidades

- Generación de texto y razonamiento avanzado: el modelo base está diseñado para tareas complejas de razonamiento, con soporte para cadenas de pensamiento.
- Comprensión de imágenes: al ser un modelo vision-language, puede procesar imágenes y responder preguntas sobre su contenido, generar descripciones o realizar tareas de VQA (Visual Question Answering).
- Entrada multimodal combinada: acepta prompts que mezclan texto e imágenes en una misma conversación.
- Ventana de contexto larga: 262K tokens, adecuada para documentos extensos, libros o conversaciones de muchos turnos.
- Soporte de conversación: pipeline `image-text-to-text` con formato de chat multimodal compatible con el procesador Qwen3-VL.
- Capacidades multilingües: no especificadas en la información disponible, aunque los modelos Qwen suelen cubrir múltiples idiomas.
- Sin soporte de tool calling o function calling: no se menciona en la documentación del modelo base ni en la conversión.
- Sin modo de pensamiento explícito: el razonamiento avanzado se menciona, pero no se detalla un modo "thinking" separado.

## Casos de uso

- Análisis de documentos técnicos extensos: gracias a la ventana de 262K tokens, el modelo puede procesar manuales, especificaciones o papers completos y responder preguntas sobre su contenido, tanto en texto como con figuras o diagramas incluidos.
- Asistente de soporte técnico multimodal: un desarrollador puede integrar el modelo en un chatbot que reciba capturas de pantalla o fotos de errores y genere respuestas de diagnóstico, aprovechando la capacidad de razonamiento del MoE.
- Generación de informes a partir de imágenes: en entornos de investigación, el modelo puede describir gráficos, tablas o resultados experimentales y redactar resúmenes textuales, útil para automatizar documentación.
- Prototipado de aplicaciones de visión por computador: al ejecutarse localmente en Apple Silicon, permite iterar rápidamente sobre tareas de VQA sin depender de APIs externas, ideal para validar ideas antes de escalar.
- Procesamiento de conversaciones largas con contexto visual: en aplicaciones de atención al cliente, el modelo puede mantener hilos de varios turnos donde el usuario adjunta imágenes (productos, facturas) y el sistema responde con coherencia gracias a la ventana amplia.
- Evaluación de modelos cuantizados en producción: esta conversión sirve como banco de pruebas para medir la degradación de calidad al cuantizar a 4 bits un MoE multimodal, comparando con el modelo original en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la conversión MLX proporciona métricas de rendimiento de inferencia local verificadas en un Apple M5 Max con 128 GB de memoria unificada:

| Modo | Prompt tokens/s | Generacion tokens/s | Pico de memoria unificada |
|---|---|---|---|
| Solo texto | 9.13 | 60.95 | 104.07 GB |
| Imagen + texto | 214.84 | 48.92 | 104.07 GB |

Estos datos corresponden a la conversión MLX 4-bit, no al modelo original. No hay cifras comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el pico de memoria unificada medido es de 104.07 GB, por lo que se necesita un Apple Silicon con al menos 128 GB de memoria unificada para ejecutar el modelo cómodamente.
- GPU recomendadas: exclusivamente Apple Silicon (M-series). Probado en M5 Max; modelos con menos memoria unificada (96 GB o inferiores) probablemente no puedan cargar el checkpoint completo.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) porque el formato MLX está orientado a Apple Silicon y el tamaño del checkpoint supera la VRAM de cualquier GPU consumer actual.
- Opciones de despliegue: `mlx-vlm` (con el módulo Qwen4-Exp incluido en el repositorio), usando el comando `mlx_vlm.generate`. También se puede integrar en scripts Python con la librería MLX.
- Latencia y throughput: 60.95 tokens/s de generación en modo texto y 48.92 tokens/s en modo imagen+texto, medidos en M5 Max. El prompt processing es más lento en texto puro (9.13 tokens/s) pero mucho más rápido con imagen (214.84 tokens/s), probablemente por el procesamiento paralelo de la torre de visión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 125B MoE (6B activos) + 51B n-gram | 262K | qwen-community-1.0 | safetensors (BF16/FP8) | Modelo base sin cuantizar, requiere GPU de datacenter |
| Qwen3.8-Flash-Next-MLX-4bit (esta conversion) | 125B MoE (checkpoint 4-bit de 29.7B) | 262K | qwen-community-1.0 | safetensors (MLX 4-bit) | Optimizado para Apple Silicon, sin MTP |
| Qwen3-VL (serie anterior) | 8B a 72B (dense) | 128K | qwen-community-1.0 | safetensors | Modelo multimodal de generación anterior, menor contexto y sin MoE |

La comparativa se limita a modelos de la misma familia Qwen porque no se dispone de datos de otros MoE multimodales comparables en la información proporcionada. La principal diferencia de esta conversión es su formato MLX, que la hace ejecutable en hardware Apple, a costa de la cuantización 4-bit y la ausencia de MTP.

## Limitaciones y advertencias

- Cuantización agresiva: los pesos de lenguaje y embeddings están cuantizados a 4 bits, lo que puede degradar la calidad de generación en tareas que requieren precisión numérica o matices lingüísticos finos.
- Sin MTP (Multi-Token Prediction): los tensores nativos de decodificación especulativa no están incluidos, por lo que la velocidad de generación podría ser inferior a la del modelo original con MTP activado.
- Soporte experimental: la arquitectura Qwen4-Exp no está integrada oficialmente en `mlx-vlm`; el autor proporciona un módulo de runtime que debe copiarse manualmente, lo que implica riesgo de incompatibilidades futuras.
- Requisitos de memoria muy altos: 104 GB de memoria unificada pico hacen que el modelo solo sea viable en equipos Apple de gama alta (M5 Max o superior con 128 GB). No es accesible para la mayoría de desarrolladores.
- Licencia qwen-community-1.0: permite uso comercial pero con restricciones específicas (consultar el texto completo de la licencia). No es una licencia open source estándar tipo Apache o MIT.
- Sin benchmarks publicados: no hay datos objetivos de calidad (MMLU, HumanEval, etc.) para esta conversión, por lo que el impacto de la cuantización en tareas concretas es desconocido.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con imágenes ambiguas.
- Sesgos: no se dispone de información sobre sesgos del modelo base; los modelos Qwen pueden reflejar sesgos de sus datos de entrenamiento, mayoritariamente en inglés y chino.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/nopmobiel/Qwen3.8-Flash-Next-MLX-4bit
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Guía de ejecución local en unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Receta de vLLM para el modelo base: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
