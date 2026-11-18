# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-icelandic-seed1

## Resumen

Este modelo es un ajuste fino de SmolLM2-135M-Instruct, un transformer decoder-only de 134.515.008 parámetros desarrollado originalmente por Hugging Face. El autor del repositorio, jekunz, lo ha sometido a un proceso de continued pre-training (CPT) en dos fases: primero sobre la porción islandesa de FineWeb-2 y después sobre la porción feroesa del mismo corpus. El resultado es un modelo especializado en generación de texto en feroés (código ISO `fo`), una lengua germánica septentrional con recursos digitales muy limitados.

La relevancia del modelo es metodológica: explora la transferencia lingüística entre dos lenguas insulares nórdicas cercanas (islandés y feroés) para reducir el coste de adaptar un modelo pequeño a un idioma de bajos recursos. Se trata de un experimento de investigación, tal y como declara el autor, sin evaluación amplia publicada. El repositorio corresponde a la semilla 1 de tres configuraciones de entrenamiento idénticas.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors, con un tamaño de repositorio de 0,3 GB y una ventana de contexto de 2048 tokens. No está pensado para producción sin validación previa: no hay benchmarks publicados ni métricas de calidad en feroés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama / SmolLM2) |
| Parámetros totales | 134.515.008 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en entrenamiento) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no publicadas por el autor) |
| Idiomas soportados | feroés (`fo`); el modelo base tiene cobertura multilingüe del inglés y otros idiomas, sin evaluar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SmolLM2-135M-Instruct: un transformer decoder-only con atención causal, normalización RMSNorm, activaciones SwiGLU y embeddings rotatorios (RoPE), en la línea de los modelos Llama pequeños. El modelo parte del checkpoint `jekunz/smollm-135m-cpt-fineweb-icelandic`, que a su vez deriva del SmolLM2-135M-Instruct de Hugging Face.

El entrenamiento consiste en continued pre-training sobre el subconjunto feroés de FineWeb-2 (`HuggingFaceFW/fineweb-2`), tras una fase previa sobre el subconjunto islandés. Los hiperparámetros declarados son: 1 época en islandés y 5 épocas en feroés, learning rate 5e-4 con scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulación de gradiente (batch efectivo de 256), longitud máxima de 2048 tokens, una única GPU A100 de 40 GB y semilla 1 de tres semillas para esta configuración. No se documenta el número total de tokens procesados, la composición exacta del dataset ni si hubo etapas de RLHF o DPO posteriores.

## Capacidades

- Generación de texto en feroés tras el ajuste, con calidad no evaluada formalmente.
- Conversación multi-turno heredada del formato instructivo del modelo base SmolLM2-135M-Instruct.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 135 millones de parámetros.
- Generación de código y matemáticas elementales, sin datos específicos de rendimiento en estas tareas.
- Capacidad multilingüe residual del modelo base (inglés y otros idiomas), potencialmente degradada por el ajuste intensivo en feroés.
- No se documenta soporte de tool calling, function calling ni modo de razonamiento explícito (thinking mode).
- No se documenta capacidad de visión, audio ni modalidades adicionales.

## Casos de uso

- Investigación en transferencia lingüística entre lenguas nórdicas: el modelo sirve como punto de partida para estudiar cuánto conocimiento del islandés se transfiere al feroés en un modelo de 135 M de parámetros, comparando con las otras dos semillas del mismo experimento.
- Generación de texto sintético en feroés para aumento de datos: puede producir borradores que, tras filtrado humano, amplíen corpus feroeses de dominio público, dado el escaso volumen de datos disponibles en esta lengua.
- Prototipado de asistentes conversacionales en feroés: con 135 M de parámetros y 0,3 GB de pesos, se puede desplegar en CPU o en GPUs de gama baja para validar flujos de conversación antes de invertir en modelos mayores.
- Normalización y reformulación de texto feroés: tareas de reescritura, resumen corto o corrección de estilo sobre documentos de 2048 tokens o menos, siempre con revisión humana por el riesgo de alucinación.
- Baseline en evaluaciones de modelos de bajos recursos: al ser reproducible (semilla y hiperparámetros documentados), sirve como referencia en estudios comparativos de adaptación lingüística.
- Experimentos de destilación o currículo de entrenamiento: la secuencia islandés → feroés es un caso de estudio para diseñar currículos de CPT en lenguas emparentadas con pocos datos.
- Despliegue en entornos con restricciones de memoria: su tamaño permite ejecutarlo en dispositivos embebidos o en contenedores pequeños para demos de generación de texto en feroés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,27 GB para los pesos, más overhead de activaciones y caché KV; en la práctica, menos de 1 GB para contextos de 2048 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,14 GB para los pesos; en 4 bits, unos 0,07 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una A100, H100 o RTX 4090 queda sobredimensionada para este modelo y solo se justifica para entrenamiento o serving de alto throughput.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, GTX 1660, e incluso en CPU con llama.cpp u Ollama si se generan cuantizaciones GGUF (no publicadas por el autor).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM y llama.cpp son viables técnicamente, aunque no están documentados por el autor.
- Latencia y throughput: no disponibles. Por el tamaño, se espera una latencia muy baja en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-icelandic-seed1 | 134,5 M | 2048 | feroés | Apache 2.0 | Experimental, sin benchmarks |
| SmolLM2-135M-Instruct (Hugging Face) | 135 M | 8192 (según model card del base) | inglés y multilingüe | Apache 2.0 | Modelo base, con evaluación publicada por el autor original |
| jekunz/smollm-135m-cpt-fineweb-icelandic | 134,5 M | 2048 | islandés | Apache 2.0 | Checkpoint intermedio del mismo autor |
| Modelos específicos para feroés de mayor tamaño | no disponible | no disponible | feroés | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación con alternativas específicas para feroés no puede completarse con datos verificables; se indica "no disponible" en lugar de estimar cifras.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación amplia: el propio autor declara que no ha sido evaluado más allá del entrenamiento, por lo que no hay garantías de calidad en feroés.
- Riesgo elevado de alucinación: con 135 M de parámetros y 5 épocas sobre un corpus limitado, la generación puede ser incoherente o factualmente incorrecta.
- Posible olvido catastrófico del inglés y de otras lenguas del modelo base tras el CPT intensivo en islandés y feroés.
- Ventana de contexto de 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sesgos desconocidos: no se documenta ningún análisis de sesgos, toxicidad o sesgo de dominio del corpus FineWeb-2.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones de los datos de entrenamiento (FineWeb-2) y del modelo base original.
- Solo se publica la semilla 1 de tres; los resultados pueden variar entre semillas y no se documenta la varianza.
- No hay cuantizaciones GGUF ni artefactos de despliegue publicados, lo que obliga a generarlos si se quiere usar fuera de transformers.
- El identificador del modelo incluye la etiqueta "transfer-from-icelandic", lo que refleja una cadena de ajustes sucesivos; reproducir el pipeline requiere encadenar los checkpoints intermedios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-icelandic-seed1
- Modelo base intermedio (islandés): https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-icelandic
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2-135M-Instruct (modelo original de Hugging Face): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
