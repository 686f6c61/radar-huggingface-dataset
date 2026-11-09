# AdaptiveChunking/ali_mem-mixed-noskel_s2

## Resumen

ali_mem-mixed-noskel_s2 es un modelo de investigación desarrollado por AdaptiveChunking, un grupo centrado en técnicas de tokenización dinámica y segmentación adaptativa de secuencias. El modelo se presenta como una implementación de H-Net (hierarchical network) a nivel de byte, construida sobre el repositorio beetle-hnet, con arquitectura `ali` y objetivo de entrenamiento `ratio`. Con 22.785.088 parámetros totales, está claramente orientado a experimentación académica más que a uso en producción.

El modelo se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre un corpus multilingüe limitado a inglés, turco y finés. Su peculiaridad principal es que opera directamente sobre bytes (byte-level) sin tokenizador previo, y emplea un esquema de decodificación por chunking dinámico con media móvil exponencial (EMA). Esto lo sitúa en la línea de investigación de modelos que prescinden del tokenizador para eliminar sesgos de vocabulario y mejorar la robustez multilingüe.

La relevancia actual del modelo es limitada fuera del ámbito de investigación: no tiene descargas ni likes, no se ha publicado información sobre benchmarks, y su model card es fundamentalmente un registro de artefactos de entrenamiento. Resulta útil para quienes estudian tokenización byte-level, chunking adaptativo o arquitecturas H-Net, pero no para aplicaciones de usuario final.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (variante `ali`, beetle-hnet) |
| Parámetros totales | 22.785.088 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, tr, fi (según configuración de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, checkpoint PyTorch (`training_state/checkpoint.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en beetle-hnet, con la variante `ali` y objetivo `ratio`. Se trata de un modelo byte-level, es decir, que consume directamente bytes de entrada sin tokenizador intermedio, y aplica un mecanismo de chunking dinámico con decodificación EMA (`dechunk=ema`). La configuración indica `schedule=None`, lo que sugiere que no se aplicó un programa de scheduling adicional sobre el chunking más allá del esquema por defecto de beetle-hnet. Los pesos están almacenados con tensores tied una sola vez, y `config.json["tied_weights"]` mapea los nombres eliminados a los almacenados.

El entrenamiento consistió en 6000 pasos con un batch efectivo de 32 secuencias de 1024 bytes, sobre un corpus multilingüe con inglés, turco y finés. No se especifica el número total de tokens vistos ni la composición exacta del dataset. Tampoco se documenta el uso de RLHF, DPO ni técnicas de alineación posteriores. El repositorio incluye checkpoints intermedios en ramas `step-N` siguiendo un schedule logarítmico por fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k), además del estado completo del entrenador para reanudación. La rama `main` contiene los pesos del último paso, `log.jsonl`, `final.json` y sondas de frontera FLORES+ en `probe/` una vez finalizado el entrenamiento.

## Capacidades

- Generación de texto a nivel de byte: el modelo opera sobre secuencias de bytes sin tokenizador, lo que permite en principio procesar cualquier entrada textual sin vocabulario predefinido.
- Procesamiento multilingüe limitado a los idiomas vistos en entrenamiento: inglés, turco y finés.
- Segmentación dinámica de secuencias mediante chunking adaptativo con decodificación EMA, orientada a estudiar representaciones jerárquicas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo thinking.
- No se documentan capacidades de código ni matemáticas de forma específica.

## Casos de uso

- Investigación en tokenización byte-level: el modelo sirve como banco de pruebas para comparar representaciones byte-level frente a tokenizadores BPE o SentencePiece en corpus multilingües pequeños.
- Estudio de chunking dinámico: permite analizar cómo afecta el esquema `dechunk=ema` a la calidad de las representaciones y a la segmentación de fronteras entre unidades lingüísticas.
- Reproducción de experimentos: los checkpoints intermedios en ramas `step-N` y el estado del entrenador permiten reanudar o auditar el proceso de entrenamiento paso a paso.
- Evaluación de arquitecturas H-Net: útil para comparar la variante `ali` con otras variantes de beetle-hnet en tareas controladas de modelado de lenguaje.
- Análisis de fronteras lingüísticas: las sondas FLORES+ en `probe/` permiten examinar cómo el modelo segmenta fronteras entre palabras y morfemas en los tres idiomas entrenados.
- Docencia y formación: como ejemplo didáctico de pipeline de entrenamiento byte-level con checkpoints versionados y configuración reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 millones de parámetros, los pesos en fp32 ocupan aproximadamente 91 MB; en fp16 unos 46 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo no aprovecha su capacidad.
- Cabe en GPU consumer: sí, en cualquier GPU moderna e incluso en CPU para inferencia.
- Opciones de despliegue: al ser un modelo de investigación con arquitectura personalizada (beetle-hnet), no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. La vía prevista es cargar los pesos con PyTorch y el código de beetle-hnet.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ali_mem-mixed-noskel_s2 | 22,8 M | no disponible (entrenado a 1024 bytes) | Apache 2.0 | Hugging Face |
| Modelos byte-level de investigación (p. ej. ByT5-small) | ~300 M | 512-1024 bytes | Apache 2.0 | Hugging Face |
| Modelos H-Net de beetle-hnet (otras variantes) | variable | variable | según variante | GitHub / Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de investigación sin benchmarks publicados: no hay evidencia de calidad en tareas downstream.
- Entrenamiento muy limitado: 6000 pasos con batches de 32×1024 bytes, lo que supone un volumen de datos reducido y probablemente insuficiente para un modelado de lenguaje robusto.
- Cobertura lingüística restringida a inglés, turco y finés; el comportamiento en otros idiomas es desconocido.
- Riesgo elevado de alucinación y de generar texto incoherente fuera de las distribuciones vistas en entrenamiento.
- Sin información sobre sesgos; al ser byte-level y multilingüe, puede reproducir sesgos presentes en el corpus de entrenamiento, que no se documenta.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable su uso en producción.
- Dependencia del código de beetle-hnet: no es un modelo estándar de transformers, por lo que requiere el repositorio original para cargarse y ejecutarse.
- El repositorio pesa 8,3 GB por los checkpoints intermedios y el estado del entrenador, no por el tamaño del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-mixed-noskel_s2
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
