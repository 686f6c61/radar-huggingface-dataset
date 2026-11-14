# Charlie320/zils-mini-g4p

## Resumen

zils-mini-g4p es un modelo de decisión de 4.539 millones de parámetros publicado por el usuario Charlie320 en Hugging Face. Se trata de un fine-tune de Qwen/Qwen3.5-4B en el formato "chassis" del ecosistema Zils, pensado como "body" (cuerpo) para el pool de soups `d3-mini` de la subred 127 de Bittensor. El modelo se distribuye en BF16 con pesos de lenguaje entrenados y la torre de visión heredada del modelo padre.

El entrenamiento combina dos técnicas: por un lado, un punto de partida obtenido como media uniforme de los dos bodies del pool `z3-mini` vigentes; por otro, la fusión de cuatro ejecuciones LoRA de rango 64 (anchor 0,1, learning rate 5e-5, dos épocas, semillas distintas) sobre un subconjunto de categoría de lenguaje de 10.762 filas. Los datos de entrenamiento son ítems de decisión en formato de examen generados con la receta pública de autoría de Zils (`scripts/author_exam.py`) por Claude Opus y por un modelo abierto local, más las respuestas del profesor de relay público de Zils.

La relevancia del modelo es acotada y específica: no es un modelo de propósito general, sino un componente para el pipeline de decisión de la subred Bittensor 127, donde los "bodies" se combinan en soups y se evalúan contra exámenes. Su interés para el público general es limitado, pero resulta ilustrativo como ejemplo de fine-tuning orientado a tareas de decisión con datos sintéticos generados por modelos frontera.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B), con torre de visión heredada del padre |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y adopta el layout "chassis" del ecosistema Zils, que separa el cuerpo (body) del modelo de otros componentes del pipeline de decisión. Conserva la torre de visión del modelo padre, aunque los pesos entrenados en este fine-tune corresponden a la parte de lenguaje. No se especifican en la información disponible detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni longitud de contexto nativa.

El proceso de entrenamiento es un "soup fine-tune": se arranca desde la media uniforme de los dos bodies del pool `z3-mini` vigentes y se fusionan cuatro LoRA de rango 64 entrenadas con anchor 0,1, learning rate 5e-5 y dos épocas con semillas distintas. El conjunto de entrenamiento son 10.762 filas del subconjunto de categoría de lenguaje, compuestas por ítems de decisión en formato de examen generados con la receta pública `scripts/author_exam.py` por Claude Opus y por un modelo abierto local, a partir únicamente de splits públicos de entrenamiento, más las respuestas del profesor de relay público de Zils. El autor declara explícitamente que no se usaron ítems de examen de validadores ni ítems semilla públicos.

## Capacidades

- Generación de texto y razonamiento en el formato de decisión de Zils (ítems tipo examen).
- Tarea principal: responder ítems de decisión del pipeline de la subred Bittensor 127.
- Herencia de la torre de visión de Qwen/Qwen3.5-4B (no se detalla el alcance efectivo tras el fine-tune).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponibles en la información.
- Capacidades especiales (thinking mode, audio): no disponibles en la información.

## Casos de uso

- Evaluación de bodies en el pool `d3-mini` de la subred 127 de Bittensor: el modelo se usa como candidato en el soup pool y se compara contra otros bodies mediante los exámenes del pipeline.
- Investigación sobre fine-tuning con datos sintéticos: sirve como caso de estudio de cómo se combinan LoRA de rango 64 con soup averaging para adaptar un modelo base de 4B a una tarea de decisión acotada.
- Reproducción de recetas de autoría de exámenes: el modelo permite experimentar con la receta `scripts/author_exam.py` y comparar el comportamiento de ítems generados por Claude Opus frente a los de un modelo abierto local.
- Benchmarking de técnicas de model soup: al partir de la media de dos bodies y fusionar cuatro LoRA, es útil para medir el efecto del soup averaging en tareas de clasificación/decisión.
- Estudio de separación cuerpo/componentes en pipelines de decisión: el layout "chassis" permite analizar cómo se comporta un body de lenguaje con torre de visión heredada en un sistema mayor.
- Base para fine-tunes posteriores en el ecosistema Zils: al ser un body del pool, puede servir de punto de partida para nuevas rondas de soup fine-tuning sobre el mismo subconjunto de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos (4.539 millones de parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB; en 4 bits, alrededor de 2,5-3 GB (estimaciones a partir del recuento de parámetros; el autor no publica cuantizaciones).
- GPU recomendadas: A100, H100 o L40S para inferencia en BF16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para BF16 con margen.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización a 4 bits, en GPUs de 8 GB como la RTX 3070.
- Opciones de despliegue: vLLM o TGI para serving en BF16; llama.cpp u Ollama si se generan cuantizaciones GGUF (no publicadas por el autor).
- Latencia y throughput: no disponibles en la información.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-g4p | 4.539 M | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Body del pool `d3-mini`, fine-tune de Qwen3.5-4B |
| Qwen/Qwen3.5-4B | ~4B | no disponible | no disponible en la información | Hugging Face | Modelo base del que deriva |
| Charlie320/zils-mini-s3l | no disponible | no disponible | no disponible | Hugging Face | Modelo base declarado del fine-tune |
| jaysun007/zils-mini-body-m10 | no disponible | no disponible | no disponible | Hugging Face | Modelo base declarado del fine-tune |

No se dispone de datos de rendimiento de ninguno de los modelos comparables en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado únicamente para ítems de decisión en formato de examen del ecosistema Zils; su rendimiento en tareas generales de lenguaje no está documentado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Datos de entrenamiento sintéticos: los ítems fueron generados por Claude Opus y un modelo abierto local, lo que puede introducir sesgos y errores sistemáticos de esos generadores.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un fine-tune sobre un modelo de 4B, el riesgo persiste.
- Idiomas soportados no declarados: no se puede garantizar un comportamiento multilingüe correcto.
- Longitud de contexto no declarada: no se recomienda su uso en escenarios que requieran ventanas largas sin verificarlo empíricamente.
- Licencia Apache 2.0 permite uso comercial, pero el autor advierte de que los términos de los datasets de origen deben revisarse antes de reutilizar los pesos.
- Repositorio sin descargas ni likes: no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- El autor indica que el repositorio contiene solo pesos; no se incluyen scripts de inferencia ni tokenizador en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Charlie320/zils-mini-g4p
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base jaysun007/zils-mini-body-m10: https://huggingface.co/jaysun007/zils-mini-body-m10
- Modelo base Charlie320/zils-mini-s3l: https://huggingface.co/Charlie320/zils-mini-s3l
