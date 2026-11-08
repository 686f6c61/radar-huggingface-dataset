# AdaptiveChunking/exp32_local_onechunk_s1

## Resumen

`exp32_local_onechunk_s1` es un modelo de investigación de 82.470.528 parámetros (según los pesos en safetensors) desarrollado por el colectivo AdaptiveChunking. No es un modelo conversacional al uso: se trata de un run experimental de tipo H-Net a nivel de byte (byte-level), entrenado con el *legacy trainer* del repositorio `beetle-hnet` y extraído del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m` a la estructura por ejecuciones de Beetle. Su propósito es estudiar estrategias de *dynamic chunking* y tokenización a nivel de byte, no ofrecer generación de texto de propósito general.

El modelo se distribuye con 21 checkpoints retenidos en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, etc.), cada uno con `model.safetensors` y `config.json`, además de una rama `main` con los pesos más recientes, `final.json` y `log.jsonl`. El entrenador legacy no conservó estado del optimizador, por lo que no existe directorio `training_state/`. La relevancia es acotada: es material de reproducibilidad para investigación sobre segmentación adaptativa, no un modelo listo para producción.

La información pública disponible es muy limitada: no hay model card descriptiva más allá de metadatos, no se declaran idiomas soportados, no hay pipeline definido y no se han publicado benchmarks. Cualquier evaluación de capacidades debe hacerse empíricamente sobre los checkpoints.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (según tags `hnet`, `byte-level`, `beetle-hnet`) |
| Parámetros totales | 82.470.528 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` + `config.json` por checkpoint) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia H-Net en configuración byte-level, es decir, opera sobre bytes en lugar de tokens subword, lo que encaja con el objetivo declarado de *dynamic chunking* y tokenización. Se entrenó con el *legacy trainer* del repositorio `beetle-hnet` (ruta `legacy/tier1/train.py`), un pipeline antiguo que no guardaba estado del optimizador. El `config.json` de cada checkpoint incluye `model_config`, la configuración de entrenamiento y un mapa `tied_weights` que debe aplicarse restaurando `sd[dst] = sd[src]` para cada entrada antes de cargar los pesos.

No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas más allá del propio esquema de chunking adaptativo. El repositorio incluye sondas de frontera FLORES+ para esta ejecución en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo la ruta `exp32_local_onechunk_s1/`, lo que sugiere que el interés del autor es medir cómo el modelo segmenta o delimita unidades lingüísticas, no evaluar calidad generativa.

## Capacidades

- Procesamiento a nivel de byte: entrada y salida sobre secuencias de bytes, sin vocabulario subword explícito documentado.
- Chunking dinámico: el modelo está diseñado como banco de pruebas para estrategias de segmentación adaptativa.
- Checkpoints intermedios: 21 puntos de control retenidos permiten estudiar la evolución del comportamiento durante el entrenamiento.
- Sondas de frontera: hay material asociado (FLORES+) para evaluar delimitación de unidades, aunque los resultados no se publican en la información disponible.
- Generación de texto conversacional: no documentada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Vision, audio, thinking mode: no disponibles.

## Casos de uso

- Investigación en tokenización byte-level: cargar distintos checkpoints `step-N` y comparar cómo evoluciona la representación interna de secuencias de bytes a lo largo del entrenamiento, usando el mapa `tied_weights` para restaurar correctamente los pesos.
- Estudio de dynamic chunking: utilizar el modelo como sujeto de prueba para medir la calidad de las fronteras de segmentación sobre el corpus de sondas FLORES+ incluido en `AdaptiveChunking/hnet-chunking-probes`.
- Reproducibilidad de experimentos: los 21 checkpoints retenidos y el `log.jsonl` de la rama `main` permiten replicar curvas de entrenamiento y analizar la estabilidad del *legacy trainer*.
- Análisis de eficiencia en memoria: con 82,5 M de parámetros, el modelo cabe en GPUs de consumo y sirve para prototipar técnicas de compresión o cuantización antes de escalarlas a modelos mayores.
- Docencia y formación: ejemplo práctico de pipeline H-Net byte-level con estructura de repositorio por ejecuciones, útil para explicar entrenamiento y checkpointing en cursos de IA.
- Base para experimentos de arquitectura: punto de partida para comparar H-Net frente a transformers estándar en tareas de segmentación, dado que el código de entrenamiento es público en `beetle-hnet`.
- Integración en pipelines de evaluación de tokenizadores: emplear las sondas de frontera como test de regresión al modificar estrategias de chunking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 330 MB solo para pesos (82,47 M × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en fp16/bf16: aproximadamente 165 MB para pesos.
- VRAM estimada en int8: aproximadamente 83 MB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, pero están sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3050, etc.) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo (librería declarada); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al ser byte-level es probable que requiera código propio de preprocesado y decodificación.
- Latencia y throughput: no disponibles. El tamaño del repo (6,9 GB) se debe a los 21 checkpoints, no al peso individual de cada uno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `exp32_local_onechunk_s1` | 82,47 M | no disponible | H-Net byte-level, dynamic chunking | Apache 2.0 | Hugging Face (repo de investigación) |
| `AdaptiveChunking/hnet-chunking-spec-82m` | ~82 M (repo empaquetado del que se extrae) | no disponible | H-Net byte-level | Apache 2.0 | Hugging Face |
| Modelos byte-level tipo ByT5 | ~300 M en adelante | no disponible en esta ficha | Transformer byte-level | Apache 2.0 (variantes) | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, enfoque y licencia.

## Limitaciones y advertencias

- No es un modelo de propósito general: no hay evidencia de capacidades conversacionales, de código o de razonamiento, y la model card no las declara.
- Ausencia total de benchmarks: no se puede afirmar calidad alguna sin evaluación empírica propia.
- Idiomas no declarados: no se especifica qué lenguas cubre ni con qué calidad.
- Contexto desconocido: se desconoce la longitud máxima de secuencia soportada.
- Riesgo de alucinación: no evaluado; en un modelo byte-level experimental la generación libre puede producir salidas incoherentes.
- Restauración de pesos no trivial: es obligatorio aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`) antes de cargar; ignorarlo produce un modelo incorrecto.
- Sin estado del optimizador: no se puede reanudar el entrenamiento desde los checkpoints tal cual.
- Licencia Apache 2.0: permite uso comercial, pero al no haber evaluación de calidad ni de sesgos, su uso en producción no está justificado por los datos disponibles.
- Fecha de creación futura (2026-11-08) en los metadatos de Hugging Face: conviene verificar la integridad del repositorio antes de confiar en él.
- Cero descargas y cero likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/exp32_local_onechunk_s1
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Código de entrenamiento (beetle-hnet): https://github.com/suchirsalhan/beetle-hnet
- Artículo relacionado sobre LLM en ESP32 (contexto de eficiencia, no del modelo): https://www.geeky-gadgets.com/run-llm-esp32-microcontroller/
