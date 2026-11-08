# AdaptiveChunking/ali_ali-ridge_s2

## Resumen

`ali_ali-ridge_s2` es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino el resultado de un experimento de tokenización dinámica a nivel de byte construido sobre el framework `beetle-hnet` (arquitectura `ali`, objetivo `ratio`, decodificación de chunking por EMA). El modelo se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes sobre tres idiomas (inglés, turco y finés), lo que lo sitúa en la categoría de modelos pequeños orientados a la investigación de representaciones a nivel de byte y segmentación adaptativa.

El interés técnico del artefacto reside en su estructura de repositorio y en el enfoque de tokenización, no en capacidades generativas generales: con 22.785.088 parámetros y pesos en safetensors, es un modelo de escala reducida pensado para reproducir y auditar experimentos de chunking dinámico. El repositorio incluye ramas por checkpoint (`step-N`) con estado completo del entrenador reanudable, lo que facilita la investigación sobre dinámica de entrenamiento y la comparación entre fases.

La relevancia actual es acotada y experimental: sirve como referencia para quienes investigan tokenización byte-level, segmentación adaptativa y arquitecturas H-Net. No dispone de pipeline declarado, idiomas documentados en metadatos ni resultados de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (variante `ali`), procesamiento a nivel de byte |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | entrenado con `['en', 'tr', 'fi']`; idiomas declarados en metadatos: no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con pesos atados almacenados una sola vez), `config.json`, `training_config.yaml`, `training_state/checkpoint.pt` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en `beetle-hnet`, con la variante `ali` y un objetivo de entrenamiento de tipo `ratio`. El preprocesamiento es byte-level: cada secuencia se compone de 1024 bytes, y el mecanismo de chunking dinámico agrupa bytes en unidades de segmentación adaptativa. La decodificación de chunks utiliza un esquema EMA (`dechunk=ema`). El schedule de checkpoints es logarítmico y consciente de fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k desde el inicio de cada fase del objetivo, más el paso final), y el run corresponde a la semilla 2.

El entrenamiento consistió en 6000 pasos con batch de 32 secuencias de 1024 bytes, sobre un corpus multilingüe limitado a inglés, turco y finés. No se documenta en la información disponible el número total de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (poco probables dado el objetivo de investigación en tokenización). El repositorio conserva el estado completo del entrenador (`training_state/checkpoint.pt`) en cada rama `step-N`, lo que permite reanudar el entrenamiento y auditar la evolución de los pesos. Los pesos atados se almacenan una sola vez y `config.json["tied_weights"]` mapea los nombres eliminados a los almacenados.

## Capacidades

- Modelo de investigación en tokenización byte-level y chunking dinámico; no está documentado como modelo de generación de texto de propósito general.
- Procesamiento de secuencias de bytes con segmentación adaptativa (chunking) y decodificación EMA.
- Entrenamiento multilingüe limitado a inglés, turco y finés según la model card.
- Soporte de reanudación de entrenamiento mediante checkpoints completos del estado del entrenador.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en tokenización byte-level: el modelo permite reproducir experimentos de segmentación adaptativa comparando las distintas ramas `step-N` del schedule logarítmico.
- Auditoría de dinámica de entrenamiento: la inclusión de `training_state/checkpoint.pt` en cada checkpoint facilita el análisis de la evolución de pesos y del estado del optimizador a lo largo de las fases del objetivo.
- Estudio de transferencia multilingüe en lenguas morfológicamente ricas: el corpus de entrenamiento incluye turco y finés, lo que permite analizar cómo el chunking dinámico se comporta en lenguas con alta aglutinación frente al inglés.
- Evaluación de segmentación de fronteras: el repositorio incluye sondas de fronteras FLORES+ (`probe/`) generadas al finalizar el run, útiles para medir la calidad del chunking sobre texto multilingüe.
- Reproducibilidad de experimentos: el esquema de ramas por checkpoint y la semilla fija (seed 2) permiten replicar el run y comparar contra otras variantes de AdaptiveChunking.
- Base para experimentos derivados: al ser un modelo pequeño (22,8 M de parámetros) con licencia Apache 2.0, puede servir como punto de partida para fine-tuning en tareas de investigación de representaciones byte-level.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 22,8 M de parámetros, los pesos en precisión completa ocuparían del orden de 90 MB, pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no documentada; por tamaño, cualquier GPU consumer moderna podría alojar los pesos, pero no hay confirmación oficial ni pipeline de inferencia declarado.
- Opciones de despliegue: no disponible (no se declara soporte para vLLM, llama.cpp, Ollama ni TGI; la librería declarada es PyTorch).
- Latencia y throughput: no disponibles.
- Nota: el tamaño del repositorio (15,3 GB) se debe a los múltiples checkpoints y estados del entrenador, no al modelo en sí.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (H-Net byte-level con chunking dinámico) ni alternativas documentadas por el mismo autor con las que establecer una comparación fiable de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Modelo de investigación: no está documentado como modelo de lenguaje de propósito general; no se debe asumir calidad conversacional ni de generación.
- Idiomas: el entrenamiento se limita a inglés, turco y finés; el rendimiento en otros idiomas no está caracterizado.
- Contexto: las secuencias de entrenamiento son de 1024 bytes; no se documenta una ventana de contexto de inferencia superior.
- Sesgos: no se documenta ningún análisis de sesgos; el corpus multilingüe reducido puede introducir sesgos de dominio y de lengua.
- Alucinación: no evaluada en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero al tratarse de un artefacto de investigación sin benchmarks ni pipeline, no se recomienda su uso en producción sin validación previa.
- Repositorio pesado (15,3 GB) por la retención de checkpoints y estados del entrenador; conviene descargar solo la rama `step-N` o `main` necesaria.
- Fecha de creación futura en los metadatos (2026-11-08): conviene verificar la integridad y procedencia del artefacto antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_ali-ridge_s2
- Organización AdaptiveChunking: https://huggingface.co/AdaptiveChunking/models
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
