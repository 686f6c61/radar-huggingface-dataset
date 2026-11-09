# AdaptiveChunking/ali_mem-split_s2

## Resumen

ali_mem-split_s2 es un modelo de investigación publicado por el usuario AdaptiveChunking en Hugging Face, construido sobre la arquitectura H-Net implementada en el repositorio beetle-hnet. Se trata de un modelo byte-level (procesa bytes en lugar de tokens subword) orientado al estudio de tokenización dinámica y chunking adaptativo, no a tareas de generación de producto. El checkpoint disponible corresponde a un entrenamiento corto de 6.000 pasos con batches de 32 secuencias de 1.024 bytes en tres idiomas (inglés, turco y finés).

Con 22.785.088 parámetros totales en formato safetensors, el modelo es de escala muy reducida (del orden de decenas de millones de parámetros), lejos de los LLM de propósito general. Su relevancia es experimental: sirve para reproducir y auditar la variante de arquitectura `ali` con objetivo `ratio` y decodificación de chunking mediante EMA, y el repositorio incluye checkpoints intermedios, estado resumible del entrenador y sondas de frontera sobre FLORES+.

No dispone de pipeline declarado, ni de idiomas declarados en los metadatos de Hugging Face, ni de resultados de benchmarks publicados en la información disponible. Debe tratarse, por tanto, como un artefacto de investigación reproducible, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (variante `ali`, implementación beetle-hnet) |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1.024 bytes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | entrenado con `en`, `tr`, `fi`; idiomas declarados en la ficha de HF: no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez; mapa en `config.json["tied_weights"]`), más `checkpoint.pt` de PyTorch para estado del entrenador |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net en su variante `ali`, con procesamiento a nivel de byte (byte-level) y un mecanismo de chunking dinámico cuyo decodificador usa una estrategia EMA (`dechunk=ema`). El objetivo de entrenamiento es `ratio`, con `schedule=None`. La implementación de referencia es el repositorio beetle-hnet, y el modelo se distribuye en el layout "Beetle-style": ramas `step-N` para cada checkpoint conservado según un calendario logarítmico en base 2 (pasos 0, 1, 2, 4, 6, 8, 16, ..., 2^k desde el inicio de cada fase de objetivo, más el paso final), y una rama `main` con los pesos y configuración del último paso.

El entrenamiento consistió en 6.000 pasos con batches de 32 secuencias de 1.024 bytes, sobre datos en inglés, turco y finés, con semilla 2. No se especifican en la información disponible el volumen total de tokens, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. Cada rama `step-N` incluye `model.safetensors`, `config.json`, `training_config.yaml` y el estado resumible completo del entrenador en `training_state/checkpoint.pt`. La rama `main` añade `log.jsonl`, `final.json` y, una vez finalizada la ejecución, las sondas de frontera FLORES+ en `probe/`.

## Capacidades

- Modelado de lenguaje a nivel de byte con tokenización dinámica por chunking adaptativo, orientado a investigación sobre segmentación.
- Entrenado en tres idiomas (inglés, turco y finés), lo que permite estudiar comportamiento multilingüe con morfología aglutinante (turco, finés) frente a inglés.
- Evaluación de fronteras de chunk mediante sondas FLORES+ incluidas en el repositorio (`probe/`).
- Reproducibilidad completa del entrenamiento gracias al estado resumible del entrenador en cada checkpoint.
- No consta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- No consta una pipeline de inferencia declarada en Hugging Face.

## Casos de uso

- Investigación sobre tokenización byte-level: comparar la variante `ali` con otras variantes de H-Net usando los checkpoints intermedios para medir cómo evoluciona la segmentación durante el entrenamiento.
- Estudio de chunking adaptativo: analizar las fronteras de chunk producidas por el decodificador EMA frente a segmentaciones de referencia, apoyándose en las sondas FLORES+ del directorio `probe/`.
- Evaluación multilingüe con morfología compleja: usar los idiomas turco y finés del entrenamiento para estudiar cómo un modelo byte-level maneja palabras aglutinantes sin vocabulario subword.
- Reproducción de experimentos: reanudar el entrenamiento desde cualquier rama `step-N` cargando `training_state/checkpoint.pt`, lo que permite auditar la curva de aprendizaje paso a paso.
- Ablación de hiperparámetros: servir de línea base (semilla 2, 6.000 pasos) para comparar con otras semillas y configuraciones de la misma familia en el espacio AdaptiveChunking.
- Docencia y prototipado de arquitecturas: por su tamaño reducido (22,8 M de parámetros), es viable inspeccionar pesos y activaciones en un portátil con CPU, sin necesidad de GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 M de parámetros en precisión de 32 bits, los pesos ocupan aproximadamente 91 MB; en 16 bits, unos 46 MB. Cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU de datacenter; una RTX 4090, RTX 3060 o incluso una GPU integrada son suficientes para inferencia. Para reentrenar, una GPU consumer con 8-12 GB es suficiente para el batch indicado (32 × 1.024 bytes).
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 2 GB de VRAM efectiva para inferencia.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura propia (H-Net de beetle-hnet), no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI; requiere cargar los pesos con la implementación de referencia del repositorio beetle-hnet.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_mem-split_s2 | 22,8 M | no disponible (entrenado a 1.024 bytes) | H-Net byte-level, chunking dinámico | Apache 2.0 | Hugging Face |
| Otros modelos de la familia AdaptiveChunking | no disponible | no disponible | variantes de H-Net | Apache 2.0 (presumible) | Hugging Face |
| Modelos byte-level de propósito general | no disponible | no disponible | byte-level LM | variable | variable |

No se dispone de información sobre alternativas comparables con datos verificables de parámetros, contexto o rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con 22,8 M de parámetros y solo 6.000 pasos de entrenamiento: su calidad de generación de texto es previsiblemente muy limitada y no debe usarse en producción.
- No hay benchmarks publicados, por lo que no puede afirmarse ningún nivel de rendimiento en tareas estándar.
- Idiomas de entrenamiento restringidos a inglés, turco y finés; el comportamiento en castellano no está caracterizado.
- Riesgo elevado de alucinación y de salidas incoherentes por la escala y el régimen de entrenamiento corto.
- La tokenización byte-level y el chunking dinámico implican que el modelo no es drop-in con tokenizadores estándar de Hugging Face; requiere la implementación de beetle-hnet.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de evaluación hace desaconsejable cualquier despliegue comercial.
- Los pesos atados se almacenan una sola vez; es necesario aplicar el mapa `config.json["tied_weights"]` al cargar, o se producirán errores de claves faltantes.
- No consta pipeline declarada ni idiomas en los metadatos de Hugging Face, lo que complica la integración automática en herramientas que dependan de esos campos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-split_s2
- Repositorio de la implementación: https://github.com/suchirsalhan/beetle-hnet
