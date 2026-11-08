# AdaptiveChunking/ali_ali-ema_s1

## Resumen

ali_ali-ema_s1 es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino un experimento de tokenización dinámica a nivel de byte: un H-Net (hierarchical network) entrenado con la arquitectura `ali` y el objetivo `ratio`, dentro del marco de trabajo del repositorio beetle-hnet. El modelo tiene 22.785.088 parámetros (unos 22,8 millones) y se distribuye en formato safetensors con pesos atados.

El interés del modelo reside en su enfoque de segmentación adaptativa de secuencias de bytes en lugar de tokens predefinidos. El nombre `dechunk=ema` indica que el mecanismo de descomposición en fragmentos (dechunking) emplea una media móvil exponencial, y la semilla 1 identifica la ejecución concreta. Se entrenó durante 6000 pasos con lotes de 32 secuencias de 1024 bytes, sobre tres idiomas: inglés, turco y finés.

Es un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, pensado para reproducir y auditar experimentos de tokenización, no para despliegue en producción. Su licencia Apache 2.0 permite reutilización, pero la ausencia de benchmarks publicados y de una model card orientada a uso práctico limita seriamente su aplicabilidad fuera del ámbito experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (hierarchical network) con variante `ali`, tokenización dinámica a nivel de byte |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr, fi (según configuración de entrenamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pytorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en beetle-hnet, con `architecture=ali` y `objective=ratio`. Se trata de un modelo que opera sobre bytes en lugar de tokens discretos y aplica un mecanismo de chunking dinámico: la segmentación de la secuencia se decide durante el propio procesamiento, y el componente de dechunking usa una media móvil exponencial (`dechunk=ema`). Los pesos están atados (tied weights), de modo que `model.safetensors` almacena cada tensor una sola vez y `config.json["tied_weights"]` mapea los nombres eliminados a los almacenados.

El entrenamiento consistió en 6000 pasos con un tamaño de lote de 32 secuencias de 1024 bytes cada una, sobre un corpus multilingüe limitado a inglés, turco y finés. No se especifica en la información disponible el número total de tokens procesados, la composición exacta del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado. El repositorio organiza los checkpoints en ramas `step-N` siguiendo una programación logarítmica por fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k), e incluye el estado completo del entrenador en `training_state/checkpoint.pt` para permitir la reanudación. La rama `main` contiene los pesos del último paso, `log.jsonl`, `final.json` y, una vez finalizada la ejecución, sondas de frontera FLORES+ en `probe/`.

## Capacidades

- Modelado de lenguaje a nivel de byte con segmentación dinámica de secuencias.
- Procesamiento multilingüe restringido a inglés, turco y finés según la configuración de entrenamiento.
- Reanudación de entrenamiento desde cualquier checkpoint conservado, gracias al estado completo del entrenador.
- Evaluación de fronteras de segmentación mediante las sondas FLORES+ incluidas en la rama `main`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No se documenta una interfaz de generación de texto lista para uso (pipeline no disponible).

## Casos de uso

- Investigación en tokenización adaptativa: el modelo sirve para estudiar cómo afecta el chunking dinámico a nivel de byte frente a tokenizadores BPE o SentencePiece en tareas de modelado de lenguaje.
- Reproducción de experimentos: las ramas `step-N` y el estado del entrenador permiten reanudar o auditar la curva de entrenamiento paso a paso con la misma semilla (seed 1).
- Análisis de multilingüismo de bajo recurso: el entrenamiento incluye turco y finés, dos idiomas con morfología aglutinante, lo que permite estudiar el comportamiento del chunking en lenguas con alta productividad morfológica.
- Evaluación de fronteras de segmentación: las sondas FLORES+ en `probe/` permiten medir la calidad de las fronteras detectadas por el mecanismo de dechunking sobre texto multilingüe paralelo.
- Comparación de objetivos de entrenamiento: al fijar `objective=ratio` y `dechunk=ema`, el modelo sirve como punto de referencia para comparar con otras variantes de la misma familia publicadas por AdaptiveChunking.
- Docencia y experimentación académica: su tamaño reducido (22,8 M de parámetros) permite entrenar y evaluar variantes en hardware modesto, lo que lo hace adecuado para cursos y trabajos fin de máster sobre tokenización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 22,8 M de parámetros en fp32 los pesos ocupan aproximadamente 91 MB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente para cargar los pesos; no se requieren A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier modelo moderno (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia de pruebas.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; el código de referencia es el repositorio beetle-hnet y la carga se realiza con PyTorch y `huggingface_hub`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_ali-ema_s1 | 22,8 M | no disponible (entrenado a 1024 bytes) | H-Net con chunking dinámico a nivel de byte | Apache 2.0 | Hugging Face |
| Otras variantes de AdaptiveChunking | no disponible | no disponible | Variantes de arquitectura y dechunking de la misma familia | Apache 2.0 (presumible) | Hugging Face (org AdaptiveChunking) |
| Modelos byte-level tipo ByT5 | no disponible en esta ficha | no disponible | Transformer a nivel de byte sin tokenizador | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat ni de instrucciones: no hay pipeline definido ni formato de prompt documentado, por lo que no debe usarse como asistente conversacional.
- Cobertura lingüística muy limitada: solo inglés, turco y finés; el comportamiento en otros idiomas es desconocido.
- Ventana de entrenamiento de 1024 bytes: no se documenta capacidad de extrapolación a secuencias más largas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, lo que impide evaluar su idoneidad en producción.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo pequeño entrenado con pocos pasos, la calidad de generación es previsiblemente baja.
- Repositorio de gran tamaño (15,3 GB) por la acumulación de checkpoints y estados del entrenador, lo que complica su descarga y almacenamiento.
- Licencia Apache 2.0: permite uso comercial, pero la falta de documentación sobre el dataset de entrenamiento impide verificar el cumplimiento de derechos de autor del corpus.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_ali-ema_s1
- Organización AdaptiveChunking: https://huggingface.co/AdaptiveChunking/models
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
