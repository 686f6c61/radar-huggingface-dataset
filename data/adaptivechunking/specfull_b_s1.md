# AdaptiveChunking/specfull_B_s1

## Resumen

specfull_B_s1 es un modelo de investigación publicado por AdaptiveChunking, un proyecto centrado en técnicas de *chunking* dinámico y tokenización a nivel de byte. El modelo forma parte de la familia H-Net (beetle-hnet) y se ha entrenado con el denominado *legacy trainer* del repositorio beetle-hnet. Con 82.470.528 parámetros, se trata de un modelo pequeño orientado a experimentación sobre segmentación adaptativa de secuencias más que a generación de texto de propósito general.

El modelo se distribuye como un *split* del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m`, reorganizado en el formato por ejecución de Beetle. Incluye 44 checkpoints retenidos en ramas `step-N` (con pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 500, 1000, entre otros) y una rama `main` con los pesos más recientes, `final.json` y `log.jsonl`. Es relevante para investigadores que estudien tokenización byte-level, chunking dinámico y dinámicas de entrenamiento, no como modelo listo para producción.

La licencia es Apache 2.0, la librería es PyTorch y los pesos se distribuyen en safetensors. No se han publicado datos sobre idiomas soportados, pipeline de uso ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net (beetle-hnet), tokenización byte-level con chunking dinámico |
| Parámetros totales | 82.470.528 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` por checkpoint) + `config.json` |

## Arquitectura y entrenamiento

La arquitectura corresponde a H-Net dentro del proyecto beetle-hnet, con procesamiento a nivel de byte (*byte-level*) y un mecanismo de *dynamic chunking* que da nombre a la organización autora. El modelo se ha entrenado con el *legacy trainer* (`legacy/tier1/train.py`), un entrenador antiguo que no conservaba estado del optimizador; por ese motivo el repositorio no incluye el directorio `training_state/`. Los checkpoints retenidos permiten reconstruir la evolución del entrenamiento paso a paso.

El `config.json` de cada checkpoint incluye `model_config`, la configuración de entrenamiento y un mapa `tied_weights` que debe aplicarse al cargar los pesos mediante `sd[dst] = sd[src]` para cada entrada. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Entrenamiento e inferencia sobre representaciones byte-level, sin dependencia de un tokenizador subword convencional.
- Segmentación dinámica de secuencias (*dynamic chunking*), objeto principal de la investigación del proyecto.
- Checkpoints intermedios para estudiar la evolución del aprendizaje a lo largo de 44 pasos retenidos.
- Sondas de frontera (*boundary probes*) disponibles en el dataset `AdaptiveChunking/hnet-chunking-probes` bajo `specfull_B_s1/`, orientadas a evaluar la calidad de la segmentación.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en tokenización byte-level: el modelo sirve como banco de pruebas para comparar representaciones a nivel de byte frente a tokenizadores subword en tareas controladas.
- Estudio de *dynamic chunking*: permite analizar cómo evoluciona la segmentación adaptativa a lo largo de los 44 checkpoints retenidos y correlacionarla con las sondas de frontera del dataset asociado.
- Reproducción de experimentos: al incluir `config.json` con la configuración de entrenamiento y el mapa `tied_weights`, facilita la réplica de la ejecución con el *legacy trainer* de beetle-hnet.
- Análisis de dinámica de entrenamiento: la secuencia de checkpoints (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 500, 1000...) permite trazar curvas de aprendizaje sin reentrenar.
- Evaluación de sondas de frontera: integrable con el dataset `hnet-chunking-probes` para medir la precisión de los límites de chunk en distintas fases del entrenamiento.
- Docencia y divulgación: modelo de 82M parámetros con licencia Apache 2.0 y pesos safetensors, adecuado para demostrar pipelines de carga y evaluación en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 82,47M de parámetros en fp32, los pesos ocupan aproximadamente 330 MB; en fp16, unos 165 MB. El consumo real depende de la longitud de secuencia y del mecanismo de chunking.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente para los pesos; una RTX 3060, RTX 4090, A100 o H100 sobran para este tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura propia (H-Net/beetle-hnet), no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. La carga requiere el código del repositorio beetle-hnet y aplicar el mapa `tied_weights`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| specfull_B_s1 | 82,47M | no disponible | Apache 2.0 | Hugging Face (repo propio) | H-Net byte-level con chunking dinámico; sin benchmarks publicados |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos equivalentes de la misma familia o tarea en la documentación proporcionada |

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de calidad; se desconoce su rendimiento en tareas estándar de NLP.
- El modelo se ha entrenado con un *legacy trainer* sin estado del optimizador, lo que limita la reanudación exacta del entrenamiento.
- La carga de pesos exige aplicar manualmente el mapa `tied_weights` (`sd[dst] = sd[src]`); una carga ingenua puede producir pesos incorrectos.
- No se documentan idiomas soportados, por lo que no puede asumirse cobertura multilingüe.
- No hay información sobre sesgos, alucinación o robustez; al ser un modelo de investigación de 82M, cabe esperar un comportamiento limitado en generación abierta.
- Sin soporte documentado en runtimes de inferencia populares (vLLM, llama.cpp, Ollama, TGI), lo que complica su despliegue en producción.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones hace desaconsejable su uso en producción sin validación previa.
- El repositorio ocupa 14,5 GB debido a los 44 checkpoints retenidos; conviene descargar solo las ramas necesarias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/specfull_B_s1
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas de frontera: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
