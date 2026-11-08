# AdaptiveChunking/parity_B_ste_s0

## Resumen

`parity_B_ste_s0` es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso, sino un experimento de tokenización dinámica a nivel de byte construido sobre la arquitectura H-Net del proyecto beetle-hnet. El objetivo declarado en la model card es un entrenamiento con `objective=parity`, `schedule=B` y `dechunk=ste` (straight-through estimator), lo que sitúa el modelo en la línea de trabajo sobre segmentación adaptativa de secuencias de bytes en lugar de tokens predefinidos.

El modelo tiene 22.516.992 parámetros totales y se distribuye en formato PyTorch con pesos en safetensors, con un repositorio de 2,5 GB que incluye múltiples ramas `step-N` con checkpoints intermedios y el estado completo del entrenador para reanudación. Se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sin especificación de idiomas (`langs None`).

Su relevancia es fundamentalmente metodológica: sirve como artefacto reproducible para estudiar cómo un H-Net aprende a agrupar bytes de forma dinámica bajo una tarea de paridad, y permite comparar distintas políticas de chunking (`ste` frente a otras) y semillas. No está pensado para despliegue en producción ni para tareas generativas generales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net (beetle-hnet), procesamiento a nivel de byte con chunking dinámico |
| Parámetros totales | 22.516.992 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (`langs None` en el entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con tensores tied almacenados una sola vez), más `training_state/checkpoint.pt` en PyTorch |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net del repositorio beetle-hnet, un diseño orientado a operar sobre bytes crudos y aprender segmentaciones (chunks) de forma dinámica en lugar de depender de un vocabulario de tokens fijo. La variante concreta usa `dechunk=ste`, es decir, un estimador straight-through para propagar gradientes a través de la operación discreta de chunking, y `schedule=B` como política de planificación del entrenamiento. La tarea es `parity`, un objetivo de paridad sobre la secuencia de bytes.

El entrenamiento consistió en 6000 pasos con batches de 32 secuencias de 1024 bytes cada una, sin configuración de idiomas (`langs None`). El repositorio conserva checkpoints en una programación logarítmica consciente de fases (pasos 0, 1, 2, 4, 6, 8, 16, ..., 2^k y el paso final), cada uno con `model.safetensors`, `config.json`, `training_config.yaml` y el estado reanudable completo del entrenador. La rama `main` contiene los pesos del último paso, `log.jsonl`, `final.json` y, tras finalizar la ejecución, sondas de frontera FLORES+ en `probe/`. No se documentan datos sobre volumen total de tokens, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Entrenamiento y evaluación de segmentación dinámica de bytes: el modelo aprende a agrupar secuencias de bytes en chunks mediante una política diferenciable (STE).
- Tarea de paridad sobre secuencias de bytes como objetivo de investigación.
- Reproducibilidad experimental: checkpoints intermedios con estado completo del entrenador para reanudar o inspeccionar fases.
- Sondas de frontera FLORES+ incluidas en la rama `main` tras finalizar la ejecución.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (entrenamiento sin idiomas especificados).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre tokenización adaptativa: usar los checkpoints `step-N` para analizar cómo evoluciona la política de chunking a lo largo del entrenamiento y comparar fases.
- Reproducción de experimentos: el estado reanudable del entrenador (`training_state/checkpoint.pt`) permite retomar la ejecución exactamente desde cualquier checkpoint conservado.
- Comparación de políticas de dechunking: al existir variantes como esta con `dechunk=ste` y semilla 0, sirve como referencia para contrastar con otras políticas y semillas bajo el mismo esquema.
- Estudio de estimadores straight-through: el modelo es un banco de pruebas para medir la estabilidad del gradiente a través de operaciones discretas de segmentación.
- Evaluación de sondas de frontera: las sondas FLORES+ en `probe/` permiten examinar cómo el modelo delimita fronteras de unidades lingüísticas sin vocabulario predefinido.
- Docencia y divulgación: artefacto pequeño (22,5 M de parámetros) y reproducible para explicar arquitecturas H-Net y chunking dinámico en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 22,5 M de parámetros los pesos en fp32 ocupan del orden de 90 MB, por lo que cabría en cualquier GPU consumer, pero no se documentan requisitos oficiales.
- GPU recomendadas: no disponible.
- Cabe en GPU consumer: previsiblemente sí por tamaño, aunque no se especifica.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la carga se realiza vía `huggingface_hub` y `torch.load` sobre los checkpoints.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parity_B_ste_s0 | 22.516.992 | no disponible (entrenado con 1024 bytes) | Paridad sobre bytes, chunking dinámico | Apache 2.0 | Hugging Face |
| Otras variantes de AdaptiveChunking | no disponible | no disponible | Experimentos de chunking dinámico | no disponible | Hugging Face (org AdaptiveChunking) |
| Modelos H-Net de beetle-hnet | no disponible | no disponible | Segmentación adaptativa | no disponible | GitHub (suchirsalhan/beetle-hnet) |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje general: no se ha entrenado para generación de texto, código, matemáticas ni diálogo.
- No hay información sobre sesgos; el entrenamiento no especifica idiomas ni composición del dataset.
- Riesgo de alucinación no evaluable en el contexto de su tarea de investigación.
- Longitud de contexto no documentada; el entrenamiento usó secuencias de 1024 bytes.
- Sin datos de benchmarks ni métricas de calidad publicadas.
- Aunque la licencia es Apache 2.0, el modelo es un artefacto experimental sin garantías de idoneidad para producción.
- El repositorio es grande (2,5 GB) por la acumulación de checkpoints y estados del entrenador, lo que puede complicar su descarga y almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/parity_B_ste_s0
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
