# dimondim0nych/stupidqwen3

## Resumen

StupidQwen3 es un artefacto experimental publicado por el usuario dimondim0nych en Hugging Face, derivado del modelo Qwen3-1.7B de Alibaba. No se trata de un modelo entrenado ni ajustado, sino de una demostración controlada de degradación estructural: el autor aplicó una poda de capas (eliminación de la capa 0 de proyección de embeddings y de la capa 27 de proyección pre-logits) seguida de una cuantización extrema a `Q1_0` (aproximadamente 1 bit por parámetro) mediante llama.cpp. El resultado es un GGUF de unos 466 MB que conserva aproximadamente 1.270 millones de parámetros efectivos de los 1.931 millones originales.

El propósito declarado es observar la mecánica del colapso de modelos de lenguaje: cómo un transformer pierde coherencia cuando se destruyen las proyecciones de entrada y salida y se fuerza una representación ternaria/binaria sin calibración. El autor documenta de forma explícita tres modos de fallo (alucinación semántica, sangrado de vocabulario y colapso en atractor degenerado) con ejemplos de salida reproducibles.

Es relevante únicamente como material didáctico o de investigación sobre robustez, cuantización y fallo de modelos. No es apto para inferencia práctica, producción ni evaluación de capacidades: el propio autor advierte que genera salidas sin sentido de forma intencionada. La licencia heredada es Apache 2.0, pero su utilidad real es la de un caso de estudio, no la de un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-1.7B) con poda de capas 0 y 27 |
| Parametros totales | 1.931.067.904 (modelo base); ~1.270 millones efectivos tras la poda |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la model card) |
| Tipos de cuantizacion | Q1_0 (~1 bit por parámetro) en formato GGUF |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (stupidqwen3.gguf, ~466 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso con atención estándar y 28 capas (la poda de las capas 0 y 27 implica que el autor trabajó sobre esa profundidad). Sobre esa base no hubo entrenamiento adicional ni ajuste fino: las dos operaciones aplicadas son destructivas. Primero se eliminó la capa 0, que proyecta los tokens de entrada al espacio de estados ocultos, y la capa 27, que proyecta los estados finales a la distribución de vocabulario. Después, los pesos restantes se cuantizaron a `Q1_0` con llama.cpp, un esquema de aproximadamente 1 bit por parámetro sin calibración.

La innovación técnica, si puede llamarse así, es metodológica: el autor documenta el proceso como un test de degradación controlada para estudiar el colapso de modelos. La ausencia de calibración y de ajuste fino tras la cuantización impide preservar las relaciones de magnitud finas que necesitan los mecanismos de atención, y la eliminación de las proyecciones de entrada y salida rompe el mapeo entre tokens y espacio latente. No se dispone de información sobre datos de entrenamiento del modelo base en la documentación proporcionada, ni sobre RLHF/DPO, más allá de lo que corresponde a Qwen3-1.7B original.

## Capacidades

- Generación de texto: nominalmente conserva la interfaz de generación, pero produce salidas incoherentes de forma intencionada.
- Razonamiento, código y matemáticas: no funcionales; el autor muestra cómo una petición de código en Python degenera en vocabulario técnico fragmentado.
- Tool calling / function calling: no disponible; el artefacto no está pensado para ello y el colapso de logits lo haría inviable.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a inglés según la model card, con sangrado de tokens CJK aleatorios por corrupción de logits.
- Modo thinking, visión o audio: no disponible.
- Capacidad especial: servir como caso de estudio reproducible de colapso de modelos (alucinación semántica, sangrado de vocabulario, atractor degenerado).

## Casos de uso

- Investigación sobre colapso de modelos: reproducir el experimento del autor para estudiar cómo la poda de capas de entrada/salida y la cuantización a 1 bit destruyen la coherencia, comparando las salidas con las del Qwen3-1.7B original.
- Docencia en cuantización: usar el GGUF como ejemplo práctico en un curso sobre llama.cpp para ilustrar por qué `Q1_0` sin calibración es inviable en modelos pequeños.
- Pruebas de robustez de pipelines: verificar que un sistema de inferencia detecta y rechaza salidas degeneradas (bucles de un mismo subword, tokens CJK espurios) antes de llegar al usuario.
- Evaluación de herramientas de detección de alucinación: alimentar detectores con las salidas del modelo para calibrar umbrales de confianza y heurísticas de repetición.
- Estudio de mecánica de atención: analizar los estados ocultos intermedios para localizar en qué capa se produce el colapso hacia el atractor degenerado descrito por el autor.
- Benchmark de motores GGUF: comprobar el comportamiento de distintos motores (llama.cpp, Ollama) ante un modelo deliberadamente corrupto, midiendo latencia y estabilidad del bucle de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas cuantitativas (MMLU, HumanEval, GSM8K ni similares); únicamente documenta cualitativamente los modos de fallo observados.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 equivalente para el GGUF de ~466 MB; en la práctica, unos 0,5-1 GB incluyendo overhead del runtime y el contexto.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el cuello de botella no es el hardware sino la incoherencia del modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, etc.), e incluso en CPU.
- Opciones de despliegue: llama.cpp (requisito indicado por el autor), motores compatibles con GGUF como Ollama; no se recomienda vLLM ni TGI por el formato y por la naturaleza del artefacto.
- Latencia y throughput: no disponibles de forma oficial; por tamaño, la generación sería muy rápida, pero el bucle degenerado puede agotar el límite de tokens de forma indefinida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StupidQwen3 | 1.931 M (1.270 M efectivos) | no disponible | Colapsado por diseño | Apache 2.0 | Hugging Face (GGUF) |
| Qwen3-1.7B | 1.700 M aprox. | no disponible en la informacion | Funcional | Apache 2.0 | Hugging Face |
| Modelos GGUF Q1_0 de 1-2B (genéricos) | ~1-2 B | variable | Degradados pero funcionales | variable | Hugging Face |

La comparación relevante es con el propio Qwen3-1.7B: mismo origen y licencia, pero StupidQwen3 elimina dos capas y cuantiza a 1 bit sin calibración, por lo que no es un sustituto funcional. Frente a cuantizaciones GGUF convencionales de 1-2B (Q4_K_M, Q5_K_M), la diferencia es cualitativa: aquellas preservan coherencia aceptable, mientras que este artefacto está diseñado para fallar.

## Limitaciones y advertencias

- No apto para producción: el autor advierte explícitamente que no debe usarse para inferencia ni despliegue; genera salidas sin sentido de forma intencionada.
- Alucinación garantizada: la corrupción de logits produce vocabulario técnico fuera de contexto y tokens raros del vocabulario extendido.
- Bucles degenerados: la generación puede quedar atrapada en la repetición infinita de un subword, consumiendo tokens sin producir contenido útil.
- Sesgos: no evaluados; al ser un artefacto colapsado, no tiene sentido medir sesgos de forma convencional.
- Limitaciones de idioma: solo inglés declarado, con sangrado de caracteres CJK por la corrupción de logits.
- Licencia: Apache 2.0 heredada del modelo base, pero la utilidad comercial es nula por el colapso; cualquier uso en producción sería técnicamente inviable.
- Caveat de evaluación: no debe incluirse en comparativas de rendimiento como si fuera un modelo funcional, ya que distorsionaría los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimondim0nych/stupidqwen3
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- llama.cpp (motor requerido): https://github.com/ggerganov/llama.cpp
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
