# divinetribe/Huihui-Qwen3-Coder-Next-Opus-4.6-Reasoning-Distilled-abliterated-4bit-mlx

## Resumen

Este repositorio contiene una conversión a MLX de 4 bits del modelo `huihui-ai/Huihui-Qwen3-Coder-Next-Opus-4.6-Reasoning-Distilled-abliterated`, un Qwen3-Coder-Next de 80B con arquitectura MoE (A3B) al que se le ha destilado el razonamiento de Claude Opus 4.6 y posteriormente se le ha aplicado una técnica de "abliteration" para eliminar los mecanismos de rechazo. El autor original del modelo base es el colectivo huihui-ai, mientras que la conversión a MLX la publica divinetribe.

El modelo está etiquetado explícitamente como **deprecated**, **do-not-use** y **cautionary-tale** por parte de su propio publicador. Según la model card, fue evaluado en junio de 2026 y falló prácticamente todas las pruebas de codificación, tanto en tareas one-shot como agénticas, quedando por debajo del modelo mucho más pequeño Qwen3-Coder-30B-A3B-Instruct.

Es relevante ahora únicamente como caso documentado de mala praxis: la combinación de destilación de razonamiento sobre un modelo de código, junto con abliteration, produce un modelo que no converge, sobre-genera tokens y es incapaz de usar herramientas en modo agéntico. No se recomienda su uso en producción bajo ningún escenario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-Next (transformer MoE, variante A3B) |
| Parametros totales | 79.674.388.992 (~80B) |
| Parametros activos | A3B (aproximadamente 3B activos, según nomenclatura del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, 4-bit) |

## Arquitectura y entrenamiento

El modelo base es un Qwen3-Coder-Next de 80B con arquitectura MoE de tipo A3B, es decir, con aproximadamente 3B parámetros activos por token. Sobre ese modelo se aplicó una destilación del razonamiento de Claude Opus 4.6 y, posteriormente, una técnica de abliteration que elimina direcciones del espacio de activaciones asociadas a rechazos. La conversión final a MLX en 4 bits es la que publica divinetribe.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de destilación, ni si hubo fases de RLHF o DPO adicionales. La model card no documenta innovaciones técnicas más allá de la propia destilación y abliteration, y el autor señala explícitamente que el resultado es contraproducente: el modelo sobre-razona y no converge en tareas de código.

## Capacidades

- Generación de texto y razonamiento en modo "thinking" (bloques `<think>`), aunque según el autor esto degrada la utilidad práctica.
- Codificación en teoría, pero con fallos documentados en tareas one-shot y agénticas.
- Soporte de tool calling declarado en el modelo base, aunque en la práctica el modelo evaluado no invocó ninguna herramienta.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidad de razonamiento multi-paso: declarada, pero contraproducente según los benchmarks del autor.
- No se documentan capacidades de visión ni audio.

## Casos de uso

No se recomienda ningún caso de uso en producción. El propio autor desaconseja explícitamente su uso. A título documental o de investigación:

- Estudio de fallos en destilación de razonamiento sobre modelos de código: sirve como caso de análisis de por qué un modelo de razonamiento destilado puede degradar la convergencia en tareas de generación de código.
- Análisis de los efectos de la abliteration sobre modelos MoE: permite estudiar cómo la eliminación de direcciones de rechazo afecta a la coherencia en tareas de razonamiento largo.
- Reproducción de benchmarks de agentes locales: útil para validar que un pipeline de evaluación detecta modelos que no invocan herramientas.
- Docencia sobre evaluación de modelos: ejemplo real de por qué hay que hacer benchmark antes de adoptar un modelo por su reputación.
- Investigación sobre sobre-generación de tokens en modelos con thinking mode: caso de estudio de agotamiento de presupuesto de tokens antes de cerrar la respuesta.
- Comparación de eficiencia MLX vs otros runtimes: útil para medir el coste de un modelo de 80B en 4 bits en Apple Silicon frente a alternativas más pequeñas.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, comparando contra Qwen3-Coder-30B en Apple Silicon con MLX:

| Tarea | Qwen3-Coder-30B | Este modelo (80B reasoning) |
|---|---|---|
| Juego Asteroids (one-shot HTML) | juego funcional | monólogo de planificación, sin juego |
| Juego Snake | 14 s | funcional pero 8× más lento y ~7× más tokens |
| Calculadora | limpia y completa | 56 KB, alcanzó el límite de tokens sin terminar |
| Reloj analógico | funcional | 56 KB, alcanzó el límite de tokens sin terminar |
| Parser de expresiones (18 tests ocultos, sin `eval()`) | 16/18 | 0/18, sin código, solo bloque `<think>` sin cerrar |
| Tarea agéntica (escribir, ejecutar, corregir con herramientas) | completada | 0 herramientas, 0 ficheros, solo "DONE" |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 44,9 GB en 4 bits; en inferencia MLX se necesita al menos esa cantidad de memoria unificada disponible.
- GPU recomendadas: Apple Silicon con memoria unificada de 64 GB o superior (M2 Max, M2 Ultra, M3 Max, M3 Ultra, M4 Max). No se documenta soporte CUDA.
- ¿Cabe en GPU consumer? En GPUs NVIDIA consumer (RTX 4090 con 24 GB) no cabe en 4 bits; requeriría cuantizaciones más agresivas no publicadas. En Apple Silicon de gama alta sí cabe.
- Opciones de despliegue: MLX (formato nativo del repo), potencialmente convertible a otros runtimes, aunque no se documenta. El autor lo integra en su proyecto Claude Code Local mediante un servidor MLX compatible con la API de Anthropic.
- Latencia y throughput: no disponibles de forma numérica; el autor indica que es ~8× más lento que Qwen3-Coder-30B en la tarea Snake y que consume ~7× más tokens para el mismo resultado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en código | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Huihui Qwen3-Coder-Next Opus 4.6 distilled abliterated 4-bit MLX) | ~80B (A3B MoE) | no disponible | Fallo generalizado según el autor | Apache 2.0 | Hugging Face (deprecated) |
| Qwen3-Coder-30B-A3B-Instruct | 30B (A3B MoE) | no disponible | Superior en todas las pruebas del autor | Apache 2.0 | Hugging Face |
| Qwen3-Coder-Next (base, sin destilación ni abliteration) | ~80B (A3B MoE) | no disponible | No evaluado en la información disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Modelo marcado como **deprecated** y **do-not-use** por su propio publicador.
- Fallo documentado en tareas one-shot: sobre-genera y agota el presupuesto de tokens antes de completar la respuesta.
- Fallo documentado en tareas agénticas: no invoca herramientas, no escribe ficheros y declara "DONE" sin haber ejecutado nada.
- La abliteration puede haber degradado la coherencia del modelo, aunque no se aportan métricas específicas.
- La destilación de razonamiento sobre un modelo de código produce un comportamiento contraproducente: el modelo razona sin converger.
- Riesgo elevado de alucinación y de respuestas incompletas.
- Idiomas soportados no documentados.
- Licencia Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente su uso en producción.
- El repo incluye enlaces de afiliación y promoción del proyecto del autor; la model card contiene estadísticas de descargas que no coinciden con las del repositorio de Hugging Face (63,8k frente a 354 descargas), lo que sugiere que parte del contenido promocional no está verificado.

## Enlaces

- Hugging Face: https://huggingface.co/divinetribe/Huihui-Qwen3-Coder-Next-Opus-4.6-Reasoning-Distilled-abliterated-4bit-mlx
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3-Coder-Next-Opus-4.6-Reasoning-Distilled-abliterated
- Proyecto Claude Code Local: https://github.com/nicedreamzapp/claude-code-local
- Leaderboard Agent-12: https://nicedreamzapp.github.io/agent12/
- Perfil del autor en GitHub: https://github.com/nicedreamzapp
- GitHub Sponsors: https://github.com/sponsors/nicedreamzapp
- Software del autor: https://nicedreamzwholesale.com/software/
