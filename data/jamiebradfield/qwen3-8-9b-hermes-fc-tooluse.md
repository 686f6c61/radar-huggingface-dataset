# JamieBradfield/qwen3.8-9b-hermes-fc-tooluse

## Resumen

El modelo `qwen3.8-9b-hermes-fc-tooluse` es un fine-tune QLoRA del modelo base `Empero/Qwen3.8-9B` (perteneciente a la serie Qwen3.8 de Alibaba), desarrollado por JamieBradfield como parte de una serie iterativa de experimentos (v1 → v28) centrados en el comportamiento de tool calling en modelos de 9B de parámetros. Este checkpoint concreto corresponde al hito v28, entrenado sobre 218 trayectorias destiladas por el profesor GLM-5.3-Flash, con verificación en sandbox y un enfoque en la fidelidad de llamadas a herramientas en entornos agénticos.

El modelo conserva la arquitectura `Qwen3_5ForConditionalGeneration` del base, con una cabeza MTP (multi-token prediction) de 15 claves, pero elimina la torre visual, quedando como un modelo exclusivamente de texto. Con 9.438.410.240 parámetros (9,4B) y un vocabulario ampliado con dos tokens especiales de herramienta, está diseñado para generar envolturas XML de llamadas a herramientas (`<tool_call>` y `<tool_response>`) compatibles con el runtime Hermes. Su relevancia radica en ser un artefacto de investigación reproducible para estudiar el equilibrio entre capacidad de tool use y sobre-disparo en modelos pequeños, con una evaluación propia que muestra mejoras significativas frente a la versión anterior (v27) en tareas reales retenidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer decoder, con cabeza MTP de 15 claves) |
| Parametros totales | 9.438.410.240 (9,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (máximo de secuencia de entrenamiento: 6144) |
| Tipos de cuantizacion | BF16 (pesos completos), GGUF cuantizado (ROCmFPX, bits no especificados) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16, 13 shards, 18,9 GB) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de los pesos fusionados de la versión v27 (`qwen3.8-9b-hermes-fc-todo`) y aplica un fine-tune QLoRA de 4 bits con rango 16, alpha 16, dropout 0, batch de 1 con grad-accum de 8 (tamaño efectivo 8), learning rate 2e-4, warmup 0.1 y una longitud máxima de secuencia de 6144. Se entrenó durante 8 épocas sobre 218 trayectorias en formato ShareGPT, lo que equivale a 214 pasos. El dataset de entrenamiento fue generado por GLM-5.3-Flash mediante el router de HuggingFace, a partir de 112 tareas sintéticas extraídas del corpus agéntico del autor. De esas trayectorias, 190 fueron verificadas por ejecución en sandbox (85% de éxito), con inyección de fallos y recuperación en el 15,8% de las filas. Además, 61 trayectorias incluyen cadenas de pensamiento cortas destiladas y 12 son tareas de búsqueda web sintéticas, siendo la primera señal web del linaje.

El vocabulario se amplió de 248.077 a 248.079 tokens, añadiendo los tokens `<|tool_call|>` y `<|tool_response|>`. La fusión de pesos preserva la cabeza MTP de 15 claves del modelo base, pero elimina la torre visual, dejando el modelo como texto puro. El autor documenta que el modelo base no aporta ninguna capacidad de tool calling (0/45 en evaluación previa), por lo que toda la funcionalidad proviene de la cadena de fine-tunes.

## Capacidades

- Generación de texto y razonamiento conversacional en inglés.
- Tool calling / function calling mediante envolturas XML (`<tool_call>` y `<tool_response>`), con esquemas de herramientas compatibles con el runtime Hermes.
- Soporte de agentes multi-paso: puede encadenar múltiples llamadas a herramientas en una sola respuesta, simulando bucles agénticos completos (por ejemplo, `todo` → `search_files` → ...).
- Distilación de cadenas de pensamiento cortas para tareas de razonamiento multi-paso.
- Capacidad de búsqueda web sintética (entrenado con 12 tareas de este tipo).
- No soporta visión (torre visual eliminada) ni otros idiomas distintos del inglés.

## Casos de uso

- Experimentación en comportamiento de tool calling: el modelo es un artefacto de investigación para estudiar cómo los modelos de 9B deciden cuándo invocar herramientas, especialmente en entornos con esquemas de herramientas definidos. Se puede usar para comparar métricas de fidelidad, sobre-disparo y formato de salida.
- Desarrollo de agentes autónomos con harness de validación: dado que el modelo tiende a sobre-disparar llamadas a herramientas, es adecuado para probar pipelines agénticos donde un runtime externo valide y filtre las llamadas, como el runtime Hermes para el que fue entrenado.
- Generación de código con tool use: puede integrarse en flujos de refactorización, generación de tests y documentación, donde las llamadas a herramientas (por ejemplo, `search_files`, `todo`) permiten planificar y ejecutar tareas multi-paso.
- Automatización de tareas de CI/CD: el modelo puede generar secuencias de llamadas a herramientas para preparar releases, configurar integración continua o ejecutar scripts de verificación, siempre que se use dentro de un entorno controlado.
- Evaluación de técnicas de destilación: al estar entrenado con trayectorias de un profesor (GLM-5.3-Flash), sirve como caso de estudio para medir la transferencia de capacidades de tool use entre modelos de distinto tamaño.
- Pruebas de robustez en entornos con herramientas expuestas: el modelo puede usarse para detectar comportamientos no deseados (como inventar hechos en llamadas a `memory`) y así mejorar los guardarraíles de los runtimes agénticos.

## Benchmarks y rendimiento

El autor proporciona una evaluación propia sobre una batería de 40 sondas (todo-probe) divididas en tres niveles: Tier 1 (20 trayectorias reales retenidas, sin solapamiento con el entrenamiento), Tier 2 (10 tareas sintéticas multi-paso) y Tier 3 (10 peticiones triviales donde se espera 0 llamadas a herramientas). Los resultados comparan la versión v27 con este checkpoint v28 (ckpt-175):

| Tier | Modelo | Fired | name=todo | todos_ok | format_exact |
|---|---|---|---|---|---|
| T1 (real, retenido) | v27 | 13/20 | 11/20 | 11/20 | 0/20 |
| T1 | v28 ckpt-175 | 17/20 | 16/20 | 16/20 | 4/20 |
| T2 (multi-paso novedoso) | v27 | 9/10 | 7/10 | 7/10 | 3/10 |
| T2 | v28 ckpt-175 | 8/10 | 7/10 | 7/10 | 4/10 |
| T3 (trivial, esperado 0) | v27 | 5/10 | 1/10 | 1/10 | 2/10 |
| T3 | v28 ckpt-175 | 5/10 | 1/10 | 1/10 | 4/10 |

El autor destaca que la fidelidad en Tier 1 mejora de 13/20 a 17/20 en "fired" y de 11/20 a 16/20 en "todos_ok", el mejor resultado retenido en la serie v2→v28. Sin embargo, el checkpoint final (214) regresiona en el guardarraíl de sobre-disparo (Tier 3), por lo que se eligió el checkpoint 175 como punto óptimo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: los pesos completos ocupan 18,9 GB, por lo que se necesitan al menos 24 GB de VRAM para cargar el modelo con overhead de activaciones. GPUs como RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) son adecuadas.
- Para el GGUF cuantizado (ROCmFPX), el tamaño no se especifica, pero es probable que quepa en GPUs de consumo con 8-12 GB de VRAM, como RTX 3080/3090 o RTX 4070/4080. No se indica el nivel de cuantización exacto.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede servirse con vLLM, TGI o llama.cpp (para GGUF). También es compatible con Ollama si se convierte el GGUF.
- Latencia y throughput: no se proporcionan datos medidos. Para un modelo de 9B en BF16 en una GPU moderna, se puede esperar un throughput del orden de 20-50 tokens/s, pero esto depende del hardware y del backend.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de tool calling de la misma clase (por ejemplo, Hermes 2 Pro, FireFunction V2, etc.) en términos de parámetros y rendimiento. La única comparación directa disponible es con la versión anterior del mismo linaje (v27), cuyos resultados se muestran en la tabla de benchmarks. El modelo base `Empero/Qwen3.8-9B` no aporta capacidad de tool calling (0/45 en evaluación previa), por lo que la comparativa se limita al contexto del fine-tune. Se recomienda consultar el repositorio del autor para más detalles sobre la serie v1→v28.

## Limitaciones y advertencias

- El corpus de entrenamiento no contiene filas de "no llamada" (no-call), por lo que el modelo tiende a invocar herramientas incluso en preguntas triviales que no las requieren. Esto lo hace inadecuado para chat abierto sin un harness que restrinja el alcance de las herramientas.
- Puede inventar hechos en llamadas a herramientas no entrenadas (por ejemplo, llamadas a `memory` con datos falsos), aunque el runtime puede rechazarlas con guardarraíles.
- El formato de salida no siempre es una envoltura XML pura; a menudo genera bucles agénticos completos en una sola respuesta, lo que puede fallar validaciones de formato estricto (regex).
- Solo soporta inglés; no hay capacidades multilingües.
- Es un artefacto de investigación, no un producto listo para producción. El autor lo indica explícitamente en la model card.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda validar el comportamiento en el dominio de aplicación antes de desplegarlo.
- El checkpoint final (214) sobreajusta y regresiona en el control de sobre-disparo; el checkpoint 175 es el recomendado por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-tooluse
- Dataset de entrenamiento v28: https://huggingface.co/datasets/JamieBradfield/qwen3.8-9b-hermes-fc-v28-data
- Modelo con trazas reales (v27): https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-real-traces
- Repositorio oficial de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Página de despliegue en FriendliAI (para el modelo v27): https://friendli.ai/models/JamieBradfield/qwen3.8-9b-hermes-fc-real-traces
