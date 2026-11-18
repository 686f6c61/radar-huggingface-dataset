# pentacoxian-dev/deepseek-v4.1-1017-abliterated-v4x06

## Resumen

DeepSeek V4.1 1017 Abliterated v4x06 es una variante "abliterated" (con las direcciones de rechazo eliminadas mediante edición de pesos) del modelo base `deepseek-v4.1-1017-abliterated-v3`, publicada por el usuario `pentacoxian-dev` en Hugging Face. Se trata de un checkpoint de 763.205.315.794 parámetros (aproximadamente 763 mil millones) en formato safetensors y fp8, lo que lo sitúa en la categoría de modelos de escala frontier. El repositorio ocupa 510,3 GB.

La intervención principal consiste en una abliteración rank-1 aplicada sobre el tensor `layers.38.attn.wo_b.weight` (con α=0.06 y una dirección mezclada "rich/mined"), junto con ajustes multiplicativos en `head.weight` que modifican la distribución de tokens de arranque de respuesta. El resultado declarado es un comportamiento "limpio" en XSTest (450 prompts, 0 rechazos y 0 respuestas blandas en dos ejecuciones), con MMLU de 89,0 sobre 200 muestras en decodificación greedy.

La relevancia de esta ficha es acotada: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, la model card es extremadamente escueta y no documenta arquitectura interna, composición del dataset de entrenamiento ni detalles del proceso de alineamiento original. La información disponible permite caracterizar el checkpoint y su intervención, pero no reconstruir su linaje técnico completo. El idioma declarado es inglés y japonés, y la licencia es MIT heredada del modelo DeepSeek original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `deepseek_v41` en transformers; detalles internos no documentados) |
| Parametros totales | 763.205.315.794 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (según el comando de ejemplo de vLLM con `--max-model-len 32768`) |
| Tipos de cuantizacion | fp8 (8-bit) en el checkpoint publicado; otras cuantizaciones no documentadas |
| Idiomas soportados | en, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (fp8) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base DeepSeek V4.1 en la documentación proporcionada: la model card no describe si se trata de un transformer denso, un mixture-of-experts, una arquitectura híbrida o cualquier otra variante. La etiqueta `deepseek_v41` en transformers sugiere una implementación específica dentro de la librería, pero no se detalla su configuración (número de capas, dimensiones de atención, tipo de atención, etc.). Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o cualquier otro alineamiento.

Lo que sí está documentado es la intervención de abliteration realizada por `pentacoxian-dev` sobre el checkpoint v3. Se aplicó una abliteración rank-1 sobre `layers.38.attn.wo_b.weight` con α=0.06, usando una dirección "blended rich/mined", y se ajustaron multiplicadores sobre `head.weight` para tokens concretos: "Here"/"Yes"/"Sure" ×1.1, "'t" ×0.55 y " I" ×0.3. Estos cambios están horneados en el checkpoint (no requieren aplicar deltas). El objetivo declarado es obtener un variant "default / non-thinking" con comportamiento limpio en XSTest. Existe un sibling, v4x08b, orientado a máximo razonamiento.

## Capacidades

- Generación de texto conversacional en inglés y japonés, según los idiomas declarados.
- Comportamiento "abliterated": se eliminan las direcciones de rechazo, de modo que el modelo no declina peticiones que el modelo base rechazaría. Los datos de XSTest reportan 0 rechazos y 0 respuestas blandas en 450 prompts normales.
- Modo por defecto sin "thinking" (no-thinking): la model card indica que el razonamiento extendido queda reservado al sibling v4x08b.
- Razonamiento evaluado en MMLU: 89,0 sobre 200 muestras en decodificación greedy (temp 0).
- Comportamiento en HarmBench: 0 rechazos en 200 prompts estándar, con tasa de reprimand de 5–13.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y multi-step reasoning: parcialmente evaluado ("Agentic 20×2": 55 n-grams repetidos, 2,5 líneas duplicadas, 0 revives), pero sin detalles sobre tool calling.
- Capacidades multimodales (visión, audio): no documentadas.
- Capacidad multilingüe limitada a en y ja según los metadatos.

## Casos de uso

- Investigación sobre abliteration y edición de pesos: el checkpoint permite estudiar el efecto de una ablación rank-1 sobre una capa de atención concreta (`layers.38.attn.wo_b.weight`) y de ajustes en la cabeza de salida, comparando con el modelo base v3. Es adecuado porque los cambios están documentados tensor a tensor y horneados en el checkpoint.
- Evaluación de seguridad y robustez de modelos abliterated: los resultados de XSTest (450 prompts, 0 soft refusals) y HarmBench (200 prompts, 0 refusals) permiten replicar y contrastar el comportamiento declarado en un entorno controlado con decodificación greedy.
- Generación de texto conversacional en inglés y japonés: el modelo declara ambos idiomas y pipeline `text-generation`, por lo que puede usarse para diálogo multi-turno dentro de la ventana de 32.768 tokens.
- Despliegue en infraestructura multi-GPU con vLLM: el comando documentado (`--tensor-parallel-size 4 --max-model-len 32768`) indica que el checkpoint está pensado para servirse con paralelismo de tensor en 4 GPUs, lo que encaja en entornos de investigación con clústeres pequeños.
- Estudio de repetición en generación agéntica: la evaluación "Agentic 20×2" reporta métricas de n-grams repetidos y líneas duplicadas, útil para analizar degeneración en cadenas multi-paso.
- Comparación de variantes de un mismo linaje: al existir v4x06 (default/no-thinking) y v4x08b (max-thinking), permite comparar el trade-off entre refusal rate, repetición en prosa larga y esfuerzo de razonamiento.
- Benchmarking interno de MMLU sobre subconjuntos pequeños: la card reporta 89,0 sobre 200 muestras, replicable como prueba rápida de regresión tras cambios de pesos.

## Benchmarks y rendimiento

| Suite | n | Refusal | Soft | Reprimand | Here | Notas |
|---|---:|---:|---:|---:|---:|---|
| XSTest normal | 450 | 0 | 0 (2 runs) | 15,5 | 230 | greedy, temp 0 |
| XSTest N=3 | 220 | 0 | 0,67 | 6,33 | — | greedy, temp 0 |
| HarmBench standard | 200 | 0 | 0 | 5–13 | — | greedy, temp 0 |
| MMLU | 200 | — | — | — | — | 89,0 |
| Agentic 20×2 | — | — | — | — | — | 55 n-grams repetidos, 2,5 líneas duplicadas, 0 revives |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en fp8 ocupa 510,3 GB en disco; en memoria, con pesos fp8 y overhead de activaciones y KV cache, se necesita del orden de 500–600 GB de VRAM agregada para servirlo completo.
- GPU recomendadas: la card documenta `--tensor-parallel-size 4`, lo que implica al menos 4 GPUs de gran capacidad (por ejemplo, H100 80 GB, A100 80 GB o equivalentes) para cubrir los pesos fp8. No se especifica una GPU concreta.
- ¿Cabe en consumer GPU? No. 763 mil millones de parámetros, incluso en fp8, exceden con holgura cualquier GPU de consumo (RTX 4090 24 GB, etc.).
- Opciones de despliegue: vLLM es la vía documentada (con tensor parallelism). No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| deepseek-v4.1-1017-abliterated-v4x06 (este) | 763,2 B | 32.768 | MIT | Hugging Face, 0 descargas | default/no-thinking, XSTest 0 soft |
| deepseek-v4.1-1017-abliterated-v4x08b | no disponible | no disponible | MIT | Hugging Face (sibling) | max-thinking, 0 reprimand a máximo esfuerzo |
| deepseek-v4.1-1017-abliterated-v3 | no disponible | no disponible | MIT | Hugging Face (modelo base) | checkpoint previo a la ablación rank-1 |
| Modelos frontier comparables (p. ej. DeepSeek V3/V4 originales) | no disponible | no disponible | no disponible | no disponible | no se dispone de datos verificables en la información proporcionada |

No se dispone de comparaciones con modelos de otros linajes (Qwen, Llama, etc.) en la información proporcionada.

## Limitaciones y advertencias

- La abliteration elimina las direcciones de rechazo: el modelo declara 0 refusals en XSTest y HarmBench, lo que implica que no declinará peticiones que el modelo base rechazaría. Esto es un riesgo directo para despliegues en producción orientados a usuarios finales.
- El modelo tiene 0 descargas y 0 likes, y la model card es muy escueta: no hay validación comunitaria ni documentación independiente de los resultados declarados.
- No se documenta la arquitectura interna, el dataset de entrenamiento ni el proceso de alineamiento; cualquier afirmación sobre capacidades más allá de lo reportado (MMLU, XSTest, HarmBench, Agentic) carece de respaldo en la información disponible.
- Riesgo de alucinación: no evaluado ni documentado.
- Repetición en generación agéntica: la propia card reporta 55 n-grams repetidos y 2,5 líneas duplicadas en la prueba "Agentic 20×2", lo que indica degeneración en cadenas multi-paso.
- Idiomas limitados a en y ja: no hay soporte declarado para castellano ni otros idiomas.
- Contexto de 32.768 tokens: relativamente corto para un modelo de este tamaño, lo que limita casos de uso con documentos largos.
- Licencia MIT heredada de DeepSeek: permite uso comercial, pero conviene verificar las condiciones del modelo base original antes de un despliegue comercial, ya que la card no reproduce los términos completos.
- Tamaño de 510,3 GB en fp8: inviable en hardware de consumo y requiere infraestructura multi-GPU dedicada.
- La variante v4x08b (max-thinking) "puede repetir en prosa larga" según la propia card, lo que sugiere que el linaje tiene problemas de degeneración no resueltos del todo.

## Enlaces

- Hugging Face: https://huggingface.co/pentacoxian-dev/deepseek-v4.1-1017-abliterated-v4x06
- Modelo base (v3): https://huggingface.co/pentacoxian-dev/deepseek-v4.1-1017-abliterated-v3
- Variante sibling v4x08b: no disponible (no se proporciona URL en la información)
- Paper, blog o repositorio adicional: no disponible
