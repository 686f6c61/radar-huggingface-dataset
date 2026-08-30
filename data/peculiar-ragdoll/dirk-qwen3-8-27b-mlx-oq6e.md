# peculiar-ragdoll/Dirk-Qwen3.8-27B-MLX-oQ6e

## Resumen

Dirk es una cuantización en formato MLX del modelo Qwen/Qwen3.8-27B, un modelo denso de 27 mil millones de parámetros con capacidades de visión y lenguaje, desarrollado por el usuario peculiar-ragdoll. El modelo está diseñado específicamente para ejecutarse en hardware Apple Silicon mediante la librería oMLX (MLX optimizado), y destaca por dos innovaciones: la integración del template de chat "Sharp" (v22.3.1), que reduce drásticamente el número de tokens de razonamiento sin penalizar la precisión, y la conservación de la cabeza MTP (multi-token prediction) que permite decodificación especulativa para acelerar la generación.

El repositorio oQ6e ofrece una cuantización de aproximadamente 6,9 bits por peso (22,1 GB), mientras que existe una variante oQ4e de ~4,9 bpw (15,8 GB) para equipos con menos memoria. El modelo mantiene intacta la torre de visión del modelo base, por lo que no requiere descargar proyectores adicionales. Su relevancia actual radica en ofrecer una alternativa eficiente y de alta calidad para tareas de razonamiento, coding y visión en entornos Apple, con un template que elimina el razonamiento forzado a máximo esfuerzo que trae el checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso vision-language (basado en Qwen3.8-27B) |
| Parametros totales | 27 mil millones (modelo base); pesos cuantizados en el repo |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (configurado en oMLX) |
| Tipos de cuantizacion | oQ4e (~4,9 bpw, 15,8 GB) y oQ6e (~6,9 bpw, 22,1 GB) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (cuantizacion oQ de oMLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint original Qwen/Qwen3.8-27B, un transformer denso de 27B parámetros con arquitectura vision-language (incluye torre de visión). El autor no ha reentrenado los pesos: la única modificación sobre el checkpoint cuantizado es la sustitución del `chat_template.jinja` por el template Sharp v22.3.1, que añade un system prompt de tersura (respuestas concisas) y cambia el esfuerzo de razonamiento por defecto de `xhigh` (que el checkpoint stock fuerza en cada llamada) a `medium`, el nivel nativo del modelo. El template permite ajustar el esfuerzo por petición mediante `chat_template_kwargs` con niveles `low`, `medium`, `high` y `xhigh`, o desactivar el razonamiento por completo con `enable_thinking: false`.

La cuantización emplea el cuantizador oQ de oMLX, calibrado con imatrix (matriz de importancia) y de precisión mixta, que conserva la cabeza MTP del modelo original. Esta cabeza permite que runtimes con soporte de decodificación especulativa multi-token aceleren la generación. No se ha realizado entrenamiento adicional, RLHF ni fine-tuning; los pesos y tensores MTP permanecen intactos respecto al checkpoint base.

## Capacidades

- Generación de texto y razonamiento multinivel: permite configurar el esfuerzo de razonamiento (`low`, `medium`, `high`, `xhigh`) por petición, o desactivarlo.
- Visión: procesa imágenes y responde preguntas sobre ellas (image-text-to-text). La torre de visión se conserva íntegramente.
- Decodificación especulativa: compatible con MTP (multi-token prediction) en runtimes que lo soporten (oMLX), acelerando la generación.
- Tersura y eficiencia token: el template Sharp reduce significativamente los tokens de razonamiento (hasta un 59% en pruebas con el template en otro modelo), manteniendo o mejorando la precisión.
- Coding y tareas de agente: etiquetado como `agentic-coding`, apto para generación de código y flujos multi-paso.
- Multilingüe limitado: inglés y chino (según el modelo base).
- Conversacional: diseñado para chat multi-turno con contexto largo (hasta 262k tokens).

## Casos de uso

- Asistente de programación en macOS: un desarrollador puede usar Dirk con oMLX para generar código, explicar fragmentos o refactorizar, aprovechando el razonamiento configurable y la velocidad de MTP en un Mac con 32 GB de RAM.
- Análisis de capturas de pantalla y documentos visuales: al conservar la torre de visión, puede describir imágenes, extraer texto de capturas o responder preguntas sobre diagramas, sin necesidad de un modelo separado.
- Chat de atención al cliente con contexto largo: su ventana de 262k tokens permite mantener conversaciones extensas con historial completo, útil para soporte técnico o consultas documentales.
- Generación de respuestas concisas en producción: el template Sharp reduce la verbosidad, lo que abarata costes de inferencia y reduce latencia en APIs que sirven respuestas a usuarios finales.
- Razonamiento multi-paso para agentes autónomos: con `reasoning_effort: high` o `xhigh`, puede resolver tareas complejas de planificación o análisis, aunque con mayor consumo de tokens.
- Despliegue en entornos Apple Silicon: al ser MLX, se integra nativamente en aplicaciones macOS/iOS sin necesidad de GPUs NVIDIA, usando oMLX como runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios de Dirk en la información disponible. La model card indica que las mediciones están "en progreso" y se irán publicando conforme se ejecuten. No obstante, el autor presenta datos del template Sharp aplicado al modelo Dagger (mismos pesos que ThinkingCap-27B, solo cambiando el template), que sirven como referencia indirecta:

| Metrica | Template stock | Template Sharp | Cambio |
|---|---|---|---|
| Claw-Eval (componente respuesta) | 59,3 | 66,7 | +7,4 |
| Claw-Eval tokens de respuesta | 5393 | 2217 | -59% |
| MMLU-Pro tokens por respuesta correcta | 1601 | 1248 | -22% |

Además, en una imagen del README se menciona que Dirk alcanza un 85,3% de precisión en MMLU-Pro (dato visual, no confirmado en texto), y que el modelo MoE Nail (35B-A3B) es más rápido en tiempo por respuesta correcta. Estos datos deben tomarse con cautela hasta que se publiquen mediciones formales.

## Requisitos de hardware

- VRAM estimada: la cuantización oQ6e ocupa 22,1 GB en disco; oMLX carga los pesos en memoria unificada. Se recomienda un Mac con al menos 32 GB de RAM unificada para oQ6e con margen para contexto.
- La variante oQ4e (15,8 GB) cabe en un Mac de 24 GB con espacio para contexto real.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con suficiente memoria unificada. No requiere GPU NVIDIA.
- Opciones de despliegue: oMLX (runtime principal), `mlx-vlm >= 0.6.3` para generación. Se puede usar `mlx_vlm.generate` desde línea de comandos. No compatible con llama.cpp ni vLLM (formato MLX).
- Latencia y throughput: el autor reporta ~25,5 tok/s en su máquina con `mlx-vlm` modo texto sin MTP. Con MTP activado, la velocidad puede ser mayor, aunque no se especifica el hardware exacto de la prueba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Dirk (oQ6e) | 27B (base) | 262k | MLX oQ6e (~6,9 bpw) | Apache-2.0 | Template Sharp, MTP, vision |
| Dirk (oQ4e) | 27B (base) | 262k | MLX oQ4e (~4,9 bpw) | Apache-2.0 | Misma base, menor precision, cabe en 24 GB |
| Qwen3.8-27B (stock) | 27B | 262k | BF16 / FP8 | Apache-2.0 | Sin template Sharp, fuerza `xhigh` thinking |
| Qwen3.6-27B (stock) | 27B | 256k | BF16 | Apache-2.0 | Version anterior, sin vision? (no confirmado) |

La principal diferencia frente al stock es el template y el razonamiento por defecto: Dirk produce respuestas más cortas y precisas, y no fuerza el máximo esfuerzo de razonamiento. Frente a modelos MoE como Nail (35B-A3B), Dirk es denso y más pesado en cómputo, pero puede ser más preciso en algunas tareas (85,3% vs. 43s por respuesta correcta en MMLU-Pro, según la imagen).

## Limitaciones y advertencias

- Es una cuantización: puede perder precisión respecto al modelo en BF16, especialmente en tareas numéricas o de razonamiento complejo.
- Solo soporta inglés y chino; no hay garantía de buen rendimiento en otros idiomas.
- Requiere hardware Apple Silicon y la librería oMLX o `mlx-vlm`; no es compatible con runtimes estándar como vLLM o llama.cpp en su formato MLX.
- Debe cargarse con `mlx-vlm`, no con `mlx-lm`: el autor advierte que `mlx_lm.load()` acepta el checkpoint pero genera tokens basura silenciosamente.
- El template Sharp reduce la verbosidad, pero en tareas que requieran explicaciones extensas o razonamiento detallado, puede ser necesario ajustar `reasoning_effort` a `high` o `xhigh`.
- Los benchmarks propios están en progreso; los datos mostrados en imágenes no son verificables de forma independiente.
- El modelo base Qwen3.8-27B puede tener sesgos y alucinaciones inherentes a su entrenamiento; la cuantización no los corrige.

## Enlaces

- Repositorio HuggingFace (oQ6e): https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-MLX-oQ6e
- Variante oQ4e: https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-MLX-oQ4e
- Template Sharp (Qwen-Sharp-Chat-Templates): https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentacion de oMLX: no disponible en los resultados de busqueda (referenciada en la model card)
- Entrada en LLM Explorer: https://llm-explorer.com/model/peculiar-ragdoll%2FDirk-Qwen3.8-27B-MLX-oQ6e,5WcfTBUOGawr9vJcdekYRs
