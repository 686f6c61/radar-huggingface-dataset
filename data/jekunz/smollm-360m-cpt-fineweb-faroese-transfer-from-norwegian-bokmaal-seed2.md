# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed2

## Resumen

SmolLM-360M-CPT-Fineweb-Faroese-Transfer-from-Norwegian-Bokmaal-seed2 es un modelo de lenguaje de tipo decoder-only derivado de SmolLM2-360M-Instruct, desarrollado por el usuario jekunz como parte de un experimento de investigación sobre adaptación lingüística cruzada. El modelo parte de un checkpoint intermedio ya ajustado sobre noruego bokmål y posteriormente se somete a un entrenamiento continuado (continued pre-training, CPT) sobre texto en feroés extraído del corpus FineWeb-2. El objetivo declarado es evaluar la transferencia de conocimiento entre lenguas germánicas nórdicas de bajos recursos, en este caso del noruego bokmål al feroés.

El modelo cuenta con 361.821.120 parámetros reales (aproximadamente 360 millones) y una ventana de contexto máxima de 2048 tokens durante el entrenamiento. Se distribuye en formato safetensors bajo licencia Apache 2.0 y está pensado exclusivamente para investigación, según indica el propio autor, sin haber sido evaluado de forma amplia. Esta ficha se publica en un contexto de creciente interés por los modelos pequeños especializados en lenguas minoritarias, donde el coste de entrenamiento es reducido y el despliegue en hardware modesto es viable.

La relevancia del modelo reside en su enfoque metodológico: demuestra una cadena de transferencia lingüística (inglés → noruego bokmål → feroés) con recursos computacionales mínimos (una única GPU A100 de 40 GB) y una receta de entrenamiento reproducible. No obstante, se trata de un artefacto de investigación con cero descargas y cero valoraciones en el momento de redactar esta ficha, por lo que su robustez y calidad no están validadas por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima durante el entrenamiento) |
| Tipos de cuantizacion | no disponible (no se especifican en la model card) |
| Idiomas soportados | Feroés (fo); entrenado previamente en noruego bokmål |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SmolLM2-360M-Instruct, un transformer decoder-only de aproximadamente 360 millones de parámetros. El modelo se construye en dos fases de continued pre-training: primero un epoch sobre la porción de noruego bokmål de FineWeb-2 (dando lugar al checkpoint base `jekunz/smollm-360m-cpt-fineweb-norwegian-bokmaal`) y después cinco epochs sobre la porción de feroés del mismo corpus. La receta emplea learning rate 5e-4 con scheduler coseno, warmup ratio de 0.05, batch size efectivo de 256 (batch de 8 con 32 pasos de acumulación de gradiente), longitud máxima de 2048 tokens y una única GPU A100 de 40 GB. La semilla es 2, una de tres semillas de entrenamiento para esta misma configuración.

No se documenta en la información disponible el número total de tokens procesados, la composición exacta del dataset más allá de la referencia a FineWeb-2, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado adicional tras el CPT. Tampoco se detalla ninguna innovación técnica específica (decodificación especulativa, atención lineal, etc.); se trata de un fine-tuning continuado estándar sobre un modelo pequeño preexistente.

## Capacidades

- Generación de texto en feroés como idioma principal de destino del entrenamiento.
- Conversación multi-turno heredada del formato instructivo del modelo base SmolLM2-360M-Instruct.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 360 millones de parámetros.
- Generación de código y matemáticas: capacidad residual heredada del modelo base, no verificada tras el CPT en feroés.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; improbable dado el tamaño del modelo.
- Capacidades multilingües: foco en feroés; el entrenamiento previo en noruego bokmål puede aportar cierta transferencia, pero no se han publicado evaluaciones.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre transferencia lingüística entre lenguas nórdicas: el modelo sirve como punto de partida reproducible para estudiar cuánto conocimiento del noruego bokmål se transfiere al feroés mediante CPT, comparando con las otras dos semillas de la misma configuración.
- Generación de texto sintético en feroés para aumento de datos: puede emplearse para producir corpus adicionales que alimenten modelos mayores o sistemas de traducción, siempre con revisión humana dada la falta de evaluación.
- Prototipado de asistentes conversacionales en feroés: su tamaño reducido permite desplegarlo en hardware modesto para validar interfaces y flujos de conversación antes de invertir en modelos mayores.
- Experimentos de destilación o currículo de entrenamiento: al ser un checkpoint intermedio de una cadena de transferencia, resulta útil para analizar el olvido catastrófico y la retención de capacidades del modelo base.
- Evaluación comparativa de recetas de CPT: con tres semillas publicadas para la misma configuración, permite medir la varianza del entrenamiento en tareas de modelado del lenguaje en feroés.
- Despliegue en entornos con recursos limitados: con 360 millones de parámetros, puede ejecutarse en CPU o en GPUs de consumo para tareas de generación de texto de baja latencia en feroés, como etiquetado o resumen de documentos breves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7-0,8 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica cabe en cualquier GPU con 2 GB o más.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,4 GB; en 4 bits, alrededor de 0,2 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU moderna es suficiente; una A100 de 40 GB se usó solo para el entrenamiento. Para inferencia bastan una RTX 3060, RTX 4090, T4 o incluso CPU.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo actuales, e incluso en sistemas integrados.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp, Ollama o vLLM requerirían conversión a los formatos correspondientes, no documentada.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed2 | 361,8 M | 2048 | Feroés | Apache 2.0 | Artefacto de investigación, sin evaluar |
| SmolLM2-360M-Instruct (modelo base) | ~360 M | 2048 (entrenamiento) | Principalmente inglés | Apache 2.0 | Ampliamente evaluado y desplegado |
| jekunz/smollm-360m-cpt-fineweb-norwegian-bokmaal (checkpoint previo) | ~360 M | 2048 | Noruego bokmål | Apache 2.0 | Artefacto de investigación |
| Otras semillas de la misma configuración (seed 1 y seed 3) | ~360 M | 2048 | Feroés | Apache 2.0 | Artefactos de investigación |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo está destinado a su investigación y que no ha sido evaluado de forma amplia; no debe usarse en producción sin una validación previa exhaustiva.
- Riesgo elevado de alucinación y de generación incoherente, especialmente en feroés, dado el tamaño reducido del modelo y los pocos epochs de CPT sobre un corpus de una sola fuente.
- Posible olvido catastrófico de las capacidades instructivas y del inglés tras cinco epochs sobre feroés; no se han publicado evaluaciones que lo cuantifiquen.
- Ventana de contexto limitada a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sesgos desconocidos: no se documenta ninguna auditoría de sesgos ni filtrado del corpus FineWeb-2 más allá del que aplique el propio dataset.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación y la naturaleza de investigación del artefacto desaconsejan ese uso sin pruebas adicionales.
- Cero descargas y cero valoraciones en Hugging Face en el momento de redactar esta ficha; no hay evidencia de la comunidad sobre su calidad.
- No se documentan métodos de cuantización probados ni conversiones a GGUF, por lo que el despliegue en llama.cpp u Ollama requeriría trabajo adicional no verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-norwegian-bokmaal-seed2
- Modelo base (checkpoint noruego bokmål): https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-norwegian-bokmaal
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2-360M-Instruct (modelo de partida): no se proporciona enlace directo en la información disponible.
