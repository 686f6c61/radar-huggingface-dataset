# AdaptiveChunking/ali_mem-mixed-quota_s1

## Resumen

ali_mem-mixed-quota_s1 es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo conversacional ni un LLM de propósito general, sino un experimento de tokenización dinámica a nivel de byte construido sobre el framework beetle-hnet, con arquitectura interna denominada `ali` y objetivo de entrenamiento `ratio`. El modelo se entrenó durante 6000 pasos con lotes de 32 secuencias de 1024 bytes sobre textos en inglés, turco y finés, y su interés radica en el estudio de mecanismos de chunking adaptativo y segmentación de secuencias a nivel de byte.

El repositorio contiene 22.785.088 parámetros (aproximadamente 22,8 millones), lo que lo sitúa en la escala de un modelo pequeño de investigación, no de un modelo de producción. La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors junto con estados completos del entrenador en formato PyTorch. El repositorio ocupa 5,1 GB debido a la inclusión de múltiples checkpoints intermedios y estados de entrenamiento resumibles.

Su relevancia es acotada: sirve como artefacto reproducible para investigar estrategias de chunking dinámico y tokenización byte-level, no como base para aplicaciones de usuario final. No se han publicado benchmarks, idiomas oficialmente soportados más allá de los usados en entrenamiento, ni pipeline de inferencia estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net con variante `ali` (byte-level, dynamic chunking) |
| Parámetros totales | 22.785.088 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles oficialmente; entrenado con `en`, `tr`, `fi` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez) y checkpoint PyTorch (`training_state/checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en el repositorio beetle-hnet, con `architecture=ali` y `objective=ratio`. Se trata de un modelo byte-level, es decir, opera directamente sobre bytes en lugar de sobre tokens subword, lo que elimina la dependencia de un vocabulario BPE o SentencePiece. La variante `ali` y el objetivo `ratio` corresponden a configuraciones internas del framework de chunking dinámico, cuyo detalle técnico no está documentado en la información disponible.

El entrenamiento se realizó con `schedule=None`, decodificación de chunking `dechunk=ema`, semilla 1, y 6000 pasos con lotes de 32 secuencias de 1024 bytes. Los datos cubren tres idiomas: inglés, turco y finés. No se especifica el volumen total de tokens, la composición exacta del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. El repositorio organiza los checkpoints en ramas `step-N` siguiendo una programación logarítmica por fases (0, 1, 2, 4, 6, 8, 16, ...), e incluye sondas de frontera FLORES+ en `probe/` una vez finalizado el entrenamiento, lo que sugiere evaluación de segmentación multilingüe.

## Capacidades

- Modelado de lenguaje a nivel de byte sobre secuencias de hasta 1024 bytes por paso de entrenamiento.
- Chunking dinámico de secuencias mediante mecanismos internos del framework H-Net (variante `ali`).
- Procesamiento multilingüe limitado a los idiomas vistos en entrenamiento: inglés, turco y finés.
- Evaluación de fronteras de segmentación mediante sondas FLORES+ incluidas en el repositorio.
- Reanudación de entrenamiento desde estados completos (`training_state/checkpoint.pt`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Investigación en tokenización byte-level: el modelo permite estudiar cómo afecta el chunking dinámico a la modelización de texto sin vocabulario subword, comparando checkpoints intermedios de las ramas `step-N`.
- Reproducción de experimentos de segmentación: los estados completos del entrenador permiten reanudar o bifurcar el entrenamiento con distintos hiperparámetros y comparar el efecto del objetivo `ratio`.
- Evaluación de fronteras lingüísticas: las sondas FLORES+ en `probe/` sirven para medir la calidad de la segmentación en inglés, turco y finés, idiomas con morfología y aglutinación muy distintas.
- Estudio de morfología aglutinante: el turco y el finés son casos de interés para analizar cómo un modelo byte-level aprende límites morfológicos sin tokenizador explícito.
- Baseline para comparativas de arquitecturas: al ser un modelo pequeño (22,8 M de parámetros), puede usarse como referencia de bajo coste frente a modelos byte-level de mayor tamaño.
- Docencia y experimentación académica: su tamaño reducido y licencia Apache 2.0 facilitan su uso en cursos y laboratorios de procesamiento de lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye sondas de frontera FLORES+ (`probe/`) y archivos `log.jsonl` y `final.json`, pero no se proporcionan métricas numéricas en la información consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 M de parámetros, en FP32 ocuparía aproximadamente 91 MB de pesos; en FP16, unos 46 MB. El estado del entrenador y los checkpoints adicionales elevan el espacio en disco, no la VRAM de inferencia.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100 para inferencia.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1 GB de VRAM libre, e incluso en CPU para inferencia.
- Opciones de despliegue: no se documenta integración con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de investigación con arquitectura propia, requeriría el código del framework beetle-hnet para cargar los pesos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (H-Net byte-level con chunking dinámico) ni alternativas con las que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Modelo de investigación sin pipeline de inferencia estándar: no es un LLM conversacional y no se documenta cómo generar texto con él fuera del framework beetle-hnet.
- Idiomas limitados a inglés, turco y finés en entrenamiento; no hay declaración oficial de idiomas soportados y el rendimiento fuera de esos idiomas es desconocido.
- Contexto efectivo limitado a secuencias de 1024 bytes durante el entrenamiento; no se especifica si soporta secuencias más largas en inferencia.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que no debe usarse en producción sin evaluación propia.
- Riesgo de alucinación y sesgos: al ser un modelo pequeño entrenado con datos no documentados, los sesgos y la fiabilidad son desconocidos.
- Licencia Apache 2.0: permite uso comercial, pero la falta de documentación y de evaluación desaconseja su uso en entornos productivos.
- El repositorio de 5,1 GB incluye estados de entrenamiento y múltiples checkpoints, lo que puede confundir a quien espere solo pesos de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-mixed-quota_s1
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
