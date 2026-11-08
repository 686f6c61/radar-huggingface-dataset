# AdaptiveChunking/exp32_local_s0

## Resumen

exp32_local_s0 es un checkpoint de investigación publicado por el usuario AdaptiveChunking en Hugging Face, derivado del repositorio empaquetado `hnet-chunking-spec-82m`. Se trata de una ejecución de entrenamiento (run) de un modelo byte-level basado en la arquitectura H-Net, generada con el entrenador heredado (`legacy/tier1/train.py`) del proyecto beetle-hnet. El modelo está orientado a experimentación con tokenización dinámica por chunks (dynamic chunking) sobre bytes, no a uso generalista de generación de texto.

El artefacto contiene 82.470.528 parámetros reales en formato safetensors y un repositorio de 6,9 GB, lo que refleja la retención de 21 checkpoints intermedios en ramas `step-N` además de los pesos finales en `main`. La model card no documenta idiomas soportados, pipeline ni resultados de evaluación; el foco es la reproducibilidad del entrenamiento y las sondas de frontera sobre FLORES+.

Su relevancia es acotada: sirve como material de estudio para quienes investigan segmentación adaptativa a nivel de byte y comparan variantes de H-Net, pero no constituye un modelo listo para producción ni para tareas estándar de NLP sin trabajo adicional de adaptación y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (según tags: `hnet`, `byte-level`, `beetle-hnet`) |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` por checkpoint) + `config.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net en configuración byte-level, según las etiquetas del repositorio (`hnet`, `byte-level`, `beetle-hnet`, `dynamic-chunking`). El entrenamiento se realizó con el entrenador heredado del proyecto beetle-hnet (`legacy/tier1/train.py`), que no conserva estado del optimizador; por ello el repositorio no incluye `training_state/`. El mapa `tied_weights` del `config.json` indica que algunos pesos están atados y deben restaurarse aplicando `sd[dst] = sd[src]` para cada entrada antes de cargar el modelo.

Se conservan 21 checkpoints en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, etc.), cada uno con sus pesos y configuración, además de los pesos más recientes, `final.json` y `log.jsonl` en `main`. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o alguna fase de alineación. Las sondas de frontera sobre FLORES+ de esta ejecución se publican en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo el subdirectorio `exp32_local_s0/`.

## Capacidades

- Modelo de investigación centrado en tokenización dinámica por chunks a nivel de byte; no se documentan capacidades generativas generales evaluadas.
- Procesamiento byte-level, lo que en principio permite cubrir cualquier idioma o secuencia binaria sin vocabulario fijo, aunque no se aportan evaluaciones multilingües.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo thinking.
- El valor principal del artefacto es la trazabilidad de checkpoints intermedios para estudiar la evolución del entrenamiento y las fronteras de chunking.

## Casos de uso

- Investigación sobre segmentación adaptativa: usar los checkpoints `step-N` para analizar cómo evoluciona la política de chunking a lo largo del entrenamiento, comparando las sondas de frontera publicadas en `hnet-chunking-probes`.
- Reproducción de experimentos: cargar los pesos con el mapa `tied_weights` aplicado y comparar contra la ejecución original usando `log.jsonl` y `final.json` como referencia.
- Estudio de tokenización byte-level: evaluar el comportamiento del modelo en secuencias sin vocabulario predefinido (texto multilingüe, código, datos binarios) frente a tokenizadores BPE.
- Baseline para ablaciones: servir como punto de partida (82M parámetros) para comparar variantes de H-Net con y sin chunking dinámico en tareas controladas.
- Análisis de eficiencia de entrenamiento: el tamaño compacto (82M) permite iterar en una sola GPU consumer, útil para docencia y prototipado de pipelines de entrenamiento.
- Evaluación de fronteras en FLORES+: reproducir las sondas del dataset asociado para medir la calidad de los límites de chunk producidos por esta ejecución concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 330 MB solo para pesos (82,5M × 4 bytes), más activaciones y buffers según longitud de secuencia.
- En FP16/BF16: aproximadamente 165 MB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para los pesos; el cuello de botella será la longitud de contexto y el tamaño de lote.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: al ser un modelo PyTorch con safetensors y arquitectura no estándar (H-Net byte-level), no se garantiza compatibilidad directa con vLLM, TGI, llama.cpp u Ollama; lo previsible es cargarlo con PyTorch y el código de beetle-hnet.
- Latencia y throughput: no disponibles.
- Nota: el repositorio ocupa 6,9 GB por la retención de 21 checkpoints, no por el tamaño del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| exp32_local_s0 | 82,5M | no disponible | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face (repo de investigación) |
| hnet-chunking-spec-82m | 82M (según nombre) | no disponible | Repositorio empaquetado del que deriva esta ejecución | Apache 2.0 (según repo origen) | Hugging Face |
| Modelos byte-level tipo ByT5 | no disponible en esta ficha | no disponible | Transformer byte-level | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación publicada: no hay benchmarks, ni métricas de calidad, ni documentación de idiomas soportados.
- No se documenta pipeline de inferencia; requiere cargar pesos manualmente y aplicar el mapa `tied_weights`.
- El entrenador heredado no guardó estado del optimizador, lo que impide reanudar el entrenamiento desde los checkpoints tal cual.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones hace desaconsejable su uso en producción sin validación propia.
- El repositorio de 6,9 GB incluye múltiples checkpoints; conviene descargar solo la rama necesaria para evitar consumo innecesario de almacenamiento.
- La fecha de creación indicada (2026-11-08) aparece en los metadatos; verificar su coherencia antes de citarla.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/exp32_local_s0
- Repositorio origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
