# jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-danish-seed2

## Resumen

SmolLM-360M-CPT-Faroese es un modelo de lenguaje de 361,8 millones de parámetros derivado de SmolLM2-360M-Instruct mediante entrenamiento continuado (continued pre-training) sobre datos en feroés. Lo desarrolla el usuario jekunz como parte de una línea de experimentos de adaptación lingüística de bajo coste, y en este caso concreto se trata de la semilla 2 de una configuración de tres semillas, entrenada en dos fases: primero sobre el subconjunto danés de FineWeb-2 y después sobre el subconjunto feroés.

El modelo resuelve un problema muy específico: dotar de competencia en feroés, un idioma de bajos recursos con apenas 70.000-80.000 hablantes, a una arquitectura pequeña y eficiente. La transferencia desde el danés es deliberada, dado el vínculo histórico y léxico entre ambas lenguas, y constituye una innovación metodológica interesante para la investigación en adaptación cross-lingual de modelos pequeños.

Por su tamaño, es relevante para escenarios de despliegue en hardware muy limitado (incluso CPU o GPU de gama baja) y para investigación sobre currículos de entrenamiento multilingüe. La ventana de contexto declarada durante el entrenamiento es de 2048 tokens y la licencia es Apache 2.0. El autor indica explícitamente que el modelo es de uso para investigación y que no ha sido evaluado de forma amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA, base SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima durante el entrenamiento) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors en formato LLaMA, es compatible con cuantizacion a 8 y 4 bits mediante herramientas estandar (llama.cpp, bitsandbytes) |
| Idiomas soportados | feroes (fo); el entrenamiento intermedio fue en danes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia LLaMA, heredada de SmolLM2-360M-Instruct. No se dispone de detalles adicionales sobre la configuracion interna (numero de capas, dimensiones de atencion, tipo de activacion) en la informacion proporcionada, aunque al tratarse de SmolLM2-360M se corresponde con el diseno publicado por Hugging Face para esa familia.

El entrenamiento consistio en continued pre-training en dos etapas: 1 epoca sobre el subconjunto danes de FineWeb-2 (HuggingFaceFW/fineweb-2) y 5 epocas sobre el subconjunto feroes del mismo dataset. Se uso una tasa de aprendizaje de 5e-4 con scheduler coseno, warmup ratio de 0,05, tamano de lote de 8 con 32 pasos de acumulacion de gradientes (lote efectivo de 256), longitud maxima de contexto de 2048 tokens y una unica GPU A100 de 40 GB. La semilla empleada es la 2, dentro de una configuracion de tres semillas. La innovacion principal es metodologica: la transferencia desde danes como puente hacia feroes, una estrategia de adaptacion cross-lingual para idiomas de bajos recursos con arquitecturas pequenas.

## Capacidades

- Generacion de texto en feroes, con capacidad de conversacion heredada de la base instruct.
- Razonamiento basico y generacion de texto corto, limitado por el tamano del modelo (361,8 M de parametros).
- Capacidad multilingue residual: el modelo parte de SmolLM2-Instruct, que es multilingue, y ha recibido entrenamiento en danes y feroes; el alcance real en otros idiomas no esta documentado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada; no se ha verificado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible; no documentado y poco probable en este tamano.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Formato instruct heredado de la base, aunque el ajuste realizado es de pre-entrenamiento continuado, no de alineacion adicional.

## Casos de uso

- Investigacion en adaptacion cross-lingual: el modelo sirve como punto de comparacion para estudiar la transferencia danes-feroes en modelos pequenos, con tres semillas disponibles para medir varianza de entrenamiento.
- Generacion de texto en feroes a bajo coste: util para prototipos de redaccion asistida o completado de texto en feroes en entornos con hardware muy limitado, dado su tamano de 361,8 M de parametros.
- Experimentos de destilacion o curriculum learning: la secuencia danes y luego feroes es un caso de estudio reproducible para disenar curriculos de entrenamiento en idiomas de bajos recursos.
- Procesamiento de corpus feroeses: puede emplearse como modelo base para tareas de etiquetado, aumento de datos o filtrado de calidad en corpus de feroes, con la cautela de su limitada fiabilidad.
- Despliegue en CPU o dispositivos de borde: por su tamano, es viable ejecutarlo en CPU con cuantizacion, por ejemplo para demos educativas sobre lenguas minoritarias.
- Base para fine-tuning posterior: al estar en safetensors y licencia Apache 2.0, puede servir como inicializacion para tareas especificas en feroes (clasificacion, resumen) con coste de computo minimo.
- Evaluacion de sesgos y calidad linguistica en lenguas de bajos recursos: util como sujeto de estudio para medir como un modelo pequeno maneja un idioma con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "no ha sido evaluado de forma amplia todavia".

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en precision completa (fp32), unos 0,35-0,4 GB en fp16/bf16 y unos 0,2 GB en cuantizacion de 4 bits, segun el tamano del repositorio (0,7 GB) y los 361,8 M de parametros.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el entrenamiento se realizo en una A100 de 40 GB, pero la inferencia es viable en GPUs de gama baja (GTX 1650, RTX 3050, T4) e incluso en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, y tambien en CPU con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag endpoints_compatible), llama.cpp y Ollama mediante conversion a GGUF, y vLLM para despliegue con throughput.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-danish-seed2 | 361,8 M | 2048 | Apache 2.0 | Hugging Face | Feroes via transferencia desde danes; sin benchmarks |
| SmolLM2-360M-Instruct (Hugging Face) | 361,8 M | 2048 (hasta 8192 en la familia SmolLM2) | Apache 2.0 | Hugging Face | Modelo base; multilingue pero sin especializacion en feroes |
| jekunz/smollm-360m-cpt-fineweb-danish | 361,8 M | 2048 | Apache 2.0 | Hugging Face | Modelo base directo de este checkpoint; entrenado en danes |
| Otros modelos feroeses de la misma familia | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo no evaluado: el autor declara que no ha sido evaluado de forma amplia; no hay benchmarks que respalden su calidad.
- Riesgo elevado de alucinacion: con 361,8 M de parametros y 5 epocas sobre un subconjunto de FineWeb-2, la fidelidad factual es limitada.
- Datos de entrenamiento: FineWeb-2 es un corpus web; puede contener sesgos, ruido y contenido de baja calidad, especialmente en idiomas de bajos recursos como el feroes.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- Cobertura idiomatica restringida: el entrenamiento se centra en feroes y danes; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Sesgos conocidos: no disponibles en la informacion proporcionada; cabe esperar los sesgos heredados de SmolLM2 y de FineWeb-2.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la falta de evaluacion y las posibles obligaciones derivadas del corpus de entrenamiento aconsejan revision legal antes de un uso en produccion.
- Reproducibilidad: es la semilla 2 de tres; los resultados pueden variar entre semillas.
- Sin garantias de soporte: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni mantenimiento documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-faroese-transfer-from-danish-seed2
- Modelo base: https://huggingface.co/jekunz/smollm-360m-cpt-fineweb-danish
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Familia SmolLM2 (Hugging Face): https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
