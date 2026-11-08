# AdaptiveChunking/pilot_B_s1

## Resumen

pilot_B_s1 es un checkpoint de investigación publicado por la organización AdaptiveChunking dentro de su línea de experimentos sobre chunking dinámico y tokenización byte-level. Se trata de una ejecución concreta (run) del proyecto beetle-hnet, un modelo de arquitectura H-Net que procesa texto a nivel de byte, entrenada con el denominado legacy trainer (`legacy/tier1/train.py`) y separada del repositorio original `AdaptiveChunking/hnet-chunking-pilots` para adoptar el formato por ejecución de Beetle.

El modelo es deliberadamente pequeño: 22.516.992 parámetros en formato safetensors, con un tamaño de repositorio de 0,1 GB y licencia Apache 2.0. No es un modelo de propósito general ni un asistente conversacional, sino un artefacto de investigación orientado a estudiar estrategias de segmentación dinámica de secuencias y representaciones a nivel de byte. La model card no documenta idiomas soportados ni pipeline de inferencia.

Su relevancia es acotada y experimental: sirve como referencia reproducible para comparar variantes de chunking adaptativo dentro de la familia de pilotos de AdaptiveChunking, con sondas de frontera sobre FLORES+ publicadas aparte en el dataset `hnet-chunking-probes`. No dispone de descargas ni likes, y no se han publicado benchmarks de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net (procesamiento byte-level, según tags del modelo) |
| Parámetros totales | 22.516.992 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

La información disponible indica que pilot_B_s1 pertenece a la familia H-Net y opera a nivel de byte (tags `hnet`, `byte-level`, `beetle-hnet`). El entrenamiento se realizó con el legacy trainer del proyecto beetle-hnet, en la ruta `legacy/tier1/train.py`. La model card menciona un mapa `tied_weights` en el `config.json`, lo que implica que algunos pesos están atados y deben restaurarse aplicando `sd[dst] = sd[src]` para cada entrada del mapa antes de cargar el state dict.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal más allá de la propia propuesta de chunking dinámico que da nombre a la organización. El legacy trainer no conservó estado del optimizador, por lo que el repositorio carece de `training_state/`.

## Capacidades

- Generación de texto a nivel de byte: el modelo está diseñado para operar sobre secuencias de bytes, no sobre un vocabulario BPE o SentencePiece tradicional.
- Chunking dinámico: el propósito del experimento es estudiar la segmentación adaptativa de secuencias, según los tags `dynamic-chunking` y `tokenization`.
- Checkpoint de investigación: se conserva un único checkpoint retenido (step 6000) en la rama `step-N`, además de los pesos más recientes en `main`.
- Sondas de frontera: se publican evaluaciones de fronteras sobre FLORES+ en el dataset `hnet-chunking-probes`, bajo `pilot_B_s1/`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; la referencia a FLORES+ sugiere evaluación multilingüe de fronteras, pero no se confirma cobertura idiomática del modelo.

## Casos de uso

- Investigación sobre tokenización byte-level: el modelo sirve para comparar representaciones a nivel de byte frente a tokenizadores subword en tareas controladas de laboratorio.
- Estudio de chunking dinámico: permite reproducir y contrastar la variante `pilot_B_s1` frente a otros pilotos de la misma familia usando el mismo legacy trainer.
- Reproducción de experimentos: al incluir `config.json` con la configuración de entrenamiento y el mapa `tied_weights`, facilita la restauración exacta de pesos para replicar resultados.
- Evaluación de fronteras sobre FLORES+: las sondas publicadas en `hnet-chunking-probes` permiten analizar cómo segmenta el modelo textos multilingües de referencia.
- Baseline para nuevas ejecuciones: sirve como punto de partida para entrenar variantes con el legacy trainer y comparar curvas de entrenamiento mediante `log.jsonl`.
- Docencia y formación: por su tamaño reducido (22,5 M de parámetros y 0,1 GB), es viable cargarlo en entornos docentes para ilustrar arquitecturas H-Net y tokenización byte-level.
- Auditoría de metodología: útil para estudiar el impacto de no conservar estado del optimizador en la reproducibilidad de un entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 22,5 M de parámetros en fp32 el peso ronda los 90 MB, por lo que la huella es mínima y dominada por activaciones y buffers.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente por tamaño; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del repositorio (0,1 GB).
- Opciones de despliegue: la librería declarada es PyTorch; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AdaptiveChunking/pilot_B_s1 | 22.516.992 | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| AdaptiveChunking/hnet-chunking-pilots | no disponible | no disponible | no disponible | Hugging Face (repo agregado del que se separó) |
| Otros pilotos de AdaptiveChunking | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos de rendimiento ni de especificaciones completas de las alternativas para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación sin validación de producción: no hay benchmarks, métricas de calidad ni evaluaciones de seguridad publicadas.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe pese a las sondas FLORES+.
- Longitud de contexto desconocida: impide planificar despliegues con secuencias largas.
- Sin estado del optimizador: el legacy trainer no guardó `training_state/`, lo que limita la reanudación exacta del entrenamiento.
- Restauración de pesos no trivial: requiere aplicar el mapa `tied_weights` del `config.json` antes de cargar el state dict.
- Riesgo de alucinación y sesgos: no evaluados ni documentados.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto experimental no se recomienda su uso en producción sin evaluación previa.
- Ausencia de pipeline declarado: no se indica tarea (`text-generation` u otra), lo que complica la integración directa con librerías de alto nivel.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_B_s1
- Repositorio agregado de pilotos: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Perfil de la organización: https://huggingface.co/AdaptiveChunking
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
