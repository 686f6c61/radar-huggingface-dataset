# Allmightdd/qwen35-4b-author500-e3-tb21

## Resumen

Allmightdd/qwen35-4b-author500-e3-tb21 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario Allmightdd en Hugging Face. Se trata de un checkpoint de inferencia en BF16 que conserva el tokenizador, el procesador y la plantilla de chat originales del modelo base. El nombre del repositorio hace referencia a un experimento denominado "author500-e3-tb21", vinculado a una ejecución de 89 tareas sobre Terminal-Bench 2.1, de la que el autor reporta 24 éxitos en primera pasada y 26 éxitos seleccionados tras dos recuperaciones de infraestructura.

El modelo tiene 4.539.265.536 parámetros (aproximadamente 4,54 mil millones), se distribuye bajo licencia Apache 2.0 y ocupa 9,1 GB en el repositorio. Al derivar de Qwen3.5-4B, hereda la arquitectura y las capacidades del modelo base de Qwen, aunque la model card publicada no detalla ni la arquitectura interna ni los datos de entrenamiento empleados en el ajuste.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de ajuste fino orientado a tareas de terminal y agentes, con métricas de evaluación publicadas en un conjunto de datos de informes de experimentos. No obstante, la información técnica disponible es escasa y la mayoría de especificaciones del modelo base no se reproducen en la model card, por lo que muchos campos deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.5-4B; la model card no la detalla) |
| Parámetros totales | 4.539.265.536 (4,54 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint publicado en BF16; no se listan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Al ser un fine-tune de Qwen/Qwen3.5-4B, se asume que hereda la arquitectura del transformer del modelo base de Qwen, pero no se proporcionan detalles sobre número de capas, dimensiones ocultas, mecanismo de atención ni tipo de positional encoding. Tampoco se especifica si el modelo base emplea mezcla de expertos (MoE) o un transformer denso; el recuento de parámetros (4,54 B) y la ausencia de mención a parámetros activos sugieren un modelo denso, pero esto no se confirma en la documentación.

En cuanto al entrenamiento, la información disponible se limita a la referencia a un experimento denominado "author500-e3-tb21" y a una ejecución congelada de 89 tareas sobre Terminal-Bench 2.1. El autor reporta 24 éxitos en primera pasada y 26 éxitos seleccionados tras dos recuperaciones de infraestructura. No se detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o SFT. Tampoco se describe ninguna innovación técnica específica del ajuste más allá de la conservación del tokenizador, procesador y plantilla de chat originales.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.5-4B, aunque no se documentan capacidades específicas en la model card.
- Ejecución de tareas de terminal: el experimento asociado se evalúa sobre Terminal-Bench 2.1, lo que sugiere un ajuste orientado a tareas de línea de comandos y agentes.
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: implícito por la naturaleza del benchmark (Terminal-Bench), pero no documentado explícitamente.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Automatización de tareas de terminal: el modelo se ha ajustado sobre Terminal-Bench 2.1, por lo que es adecuado para experimentar con agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos de shell. Su tamaño de 4,54 B permite desplegarlo en hardware modesto.
- Investigación en ajuste fino de agentes: sirve como checkpoint de referencia para reproducir o comparar experimentos de fine-tuning sobre Qwen3.5-4B en tareas de terminal, dado que el autor publica informes de experimentos en un dataset aparte.
- Prototipado de asistentes de línea de comandos: al conservar la plantilla de chat original, puede integrarse en pipelines existentes de Qwen sin reconfigurar el tokenizador ni el formato de prompt.
- Evaluación comparativa de modelos pequeños en benchmarks de agentes: con 4,54 B de parámetros, es un candidato para comparar el rendimiento de modelos compactos frente a modelos mayores en Terminal-Bench 2.1.
- Despliegue en entornos con recursos limitados: el checkpoint BF16 de 9,1 GB puede ejecutarse en GPUs de consumo con suficiente VRAM (por ejemplo, 24 GB) o cuantizarse a 8 o 4 bits para reducir requisitos.
- Reproducción de experimentos de investigación: el enlace a los informes de experimentos permite auditar la metodología y los resultados reportados por el autor.

## Benchmarks y rendimiento

| Benchmark | Resultado reportado |
|---|---|
| Terminal-Bench 2.1 (89 tareas, ejecución congelada) | 24 éxitos en primera pasada; 26 éxitos seleccionados tras dos recuperaciones de infraestructura |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomiendan al menos 16-24 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB para pesos; en 4 bits, alrededor de 2,5-3 GB, aunque no se publican versiones cuantizadas oficiales.
- GPUs recomendadas: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para BF16 sin cuantizar; RTX 3090 (24 GB) o RTX 4080 (16 GB) para cuantizaciones de 8 o 4 bits.
- ¿Cabe en GPU de consumo? Sí, en BF16 cabe en GPUs de 24 GB (RTX 3090, RTX 4090); en cuantizaciones menores, en GPUs de 8-12 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se genere una versión GGUF o se use el checkpoint safetensors con un servidor compatible; no se publican artefactos de despliegue específicos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Allmightdd/qwen35-4b-author500-e3-tb21 | 4,54 B | no disponible | Apache 2.0 | Hugging Face (14 descargas) | Fine-tune de Qwen3.5-4B orientado a Terminal-Bench 2.1 |
| Qwen/Qwen3.5-4B (modelo base) | 4 B (aproximado) | no disponible | no disponible | Hugging Face | Modelo base del que deriva el fine-tune |
| Otros fine-tunes de Qwen3.5-4B | variable | no disponible | variable | Hugging Face | No se dispone de datos comparativos específicos |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card es extremadamente escasa: no documenta arquitectura, datos de entrenamiento, idiomas ni capacidades, lo que dificulta evaluar su idoneidad para producción.
- El ajuste se ha evaluado únicamente sobre Terminal-Bench 2.1; no hay evidencia de rendimiento en otras tareas.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados; al heredar del modelo base, puede arrastrar sesgos de Qwen3.5-4B.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero al ser un fine-tune de un modelo base, conviene verificar las condiciones del modelo base Qwen3.5-4B.
- El número de descargas (14) y likes (0) sugiere poca validación por parte de la comunidad; úsese con cautela en entornos productivos.
- No se publican versiones cuantizadas ni artefactos de despliegue listos para usar.

## Enlaces

- Hugging Face: https://huggingface.co/Allmightdd/qwen35-4b-author500-e3-tb21
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Informes de experimentos: https://huggingface.co/datasets/Allmightdd/rsi-experiment-reports
