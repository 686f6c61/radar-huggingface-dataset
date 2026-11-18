# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-swedish-seed1

## Resumen

El modelo `jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-swedish-seed1` es un ajuste fino de SmolLM2-135M-Instruct desarrollado por el usuario jekunz como parte de una investigación sobre transferencia lingüística entre lenguas germánicas nórdicas. El autor parte de un modelo previamente adaptado al sueco mediante preentrenamiento continuado (CPT) sobre FineWeb-2 y, a continuación, lo ajusta sobre el subconjunto en feroés del mismo corpus. El objetivo es evaluar si el conocimiento adquirido en sueco facilita el aprendizaje del feroés, un idioma con recursos mucho más escasos.

Con 134.515.008 parámetros reales (según los pesos en safetensors) y un contexto máximo de entrenamiento de 2048 tokens, se trata de un modelo de escala muy reducida, pensado para experimentación académica más que para producción. La arquitectura es la de SmolLM2 (transformer decoder-only, familia Llama), y los pesos se distribuyen en formato safetensors bajo licencia Apache 2.0.

El modelo no ha sido evaluado de forma amplia según reconoce el propio autor, y su relevancia actual reside en el ámbito de la investigación sobre adaptación de idiomas de bajos recursos y transferencia entre lenguas relacionadas, no en su rendimiento absoluto. El sufijo `seed1` indica que forma parte de una terna de ejecuciones con distintas semillas para medir variabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama / SmolLM2) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Feroes (fo); entrenado con transferencia desde sueco |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2-135M-Instruct, un transformer decoder-only de tipo Llama con 134,5 millones de parámetros. El proceso de entrenamiento consta de dos fases de preentrenamiento continuado (CPT) documentadas por el autor: primero una época sobre el subconjunto sueco de FineWeb-2, y después cinco épocas sobre el subconjunto feroés del mismo corpus. El objetivo declarado es estudiar la transferencia desde una lengua germánica con más recursos (sueco) hacia otra estrechamente emparentada y con menos datos (feroés).

Los hiperparámetros indicados son: tasa de aprendizaje 5e-4, scheduler coseno, ratio de warmup 0,05, batch size 8 con 32 pasos de acumulación de gradiente (batch efectivo de 256), longitud máxima de contexto de 2048 tokens y entrenamiento sobre una única GPU A100 de 40 GB. La semilla empleada es la 1, una de las tres configuraciones ejecutadas para esta combinación. No se especifican en la información disponible detalles sobre la composición exacta del dataset, el volumen de tokens procesados ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional en feroés, heredada de la base instructiva y del CPT sobre FineWeb-2.
- Comprensión y generación en feroés como idioma principal declarado.
- Transferencia potencial de conocimiento desde el sueco, aunque no se han publicado evaluaciones que la cuantifiquen.
- Formato compatible con `transformers` y con text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No se documenta un modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación sobre transferencia entre lenguas nórdicas: el modelo sirve como punto de comparación en experimentos que midan cuánto del conocimiento en sueco se transfiere al feroés, usando las tres semillas disponibles para estimar varianza.
- Experimentos de preentrenamiento continuado (CPT) en idiomas de bajos recursos: permite reproducir la receta (LR 5e-4, scheduler coseno, batch efectivo 256) sobre otros subconjuntos de FineWeb-2 y comparar resultados.
- Generación de texto sintético en feroés para aumentación de datos: dado su tamaño reducido, puede producir borradores que luego se filtren manualmente en pipelines de creación de corpus.
- Docencia y divulgación: por su tamaño (0,3 GB de repo) cabe en entornos modestos y sirve para ilustrar el ciclo completo de ajuste de un modelo instructivo pequeño.
- Pruebas de infraestructura: al ser compatible con `transformers` y text-generation-inference, es útil para validar pipelines de despliegue sin consumir recursos significativos.
- Análisis de sesgos y calidad lingüística en feroés: permite estudiar qué tipo de errores comete un modelo de 135M entrenado con pocas épocas sobre un corpus web, como base para diseñar filtros de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "no ha sido evaluado más ampliamente todavía".

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,54 GB solo para pesos (134,5M × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: alrededor de 0,27 GB para pesos.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,13 GB; en 4 bits, en torno a 0,07 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia holgada. Para entrenamiento, el autor usó una A100 de 40 GB.
- Cabe en GPU consumer y en CPU; también es viable en entornos con poca memoria.
- Opciones de despliegue: `transformers`, text-generation-inference (según los tags del repositorio). No se confirma soporte explícito de llama.cpp, Ollama o vLLM en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-swedish-seed1 | 134,5M | 2048 | Apache 2.0 | Hugging Face |
| jekunz/smollm-135m-cpt-fineweb-swedish (modelo base) | 134,5M (aproximado) | no disponible | Apache 2.0 | Hugging Face |
| SmolLM2-135M-Instruct (origen de la familia) | 135M | no disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte que el modelo no ha sido evaluado de forma amplia; su calidad real en feroés es desconocida.
- Riesgo elevado de alucinación y de errores gramaticales, esperable en un modelo de 135M con cinco épocas sobre un corpus web.
- Entrenado exclusivamente sobre el subconjunto feroés de FineWeb-2, con posible presencia de ruido, contenido duplicado o sesgos propios de datos web.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- Idioma declarado únicamente feroés; el rendimiento en otros idiomas no está garantizado pese a la base sueca.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de calidad ni de idoneidad para producción.
- No se documentan medidas de mitigación de sesgos ni procesos de alineación adicionales más allá de la base instructiva.
- Al ser una ejecución con semilla 1 de tres, los resultados pueden variar entre semillas; conviene consultar las otras ejecuciones antes de extraer conclusiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-swedish-seed1
- Modelo base (sueco): https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-swedish
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2 (familia de modelos): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
