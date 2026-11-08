# AdaptiveChunking/exp32_onechunk_s1

## Resumen

`exp32_onechunk_s1` es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución concreta (run) de un modelo byte-level basado en la arquitectura H-Net, entrenado con el denominado *legacy trainer* (`legacy/tier1/train.py`) del repositorio `beetle-hnet`. El modelo se ha separado del repositorio empaquetado original `AdaptiveChunking/hnet-chunking-spec-82m` y se presenta en el formato por ejecución de Beetle, con ramas `step-N` para cada checkpoint retenido.

El modelo cuenta con 82.470.528 parámetros (según los pesos en safetensors) y una licencia Apache 2.0. Su interés no reside en ser un modelo de propósito general, sino en servir como artefacto reproducible para estudiar técnicas de *dynamic chunking* y tokenización a nivel de byte. La model card no documenta el pipeline, los idiomas soportados ni el contexto, por lo que muchos datos técnicos quedan como no disponibles.

Dado que la información publicada es escasa y de carácter experimental, esta ficha debe interpretarse como una descripción del artefacto tal y como se ha publicado, sin extrapolar capacidades que el autor no haya declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (según tags: `hnet`, `byte-level`, `beetle-hnet`) |
| Parámetros totales | 82.470.528 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` por checkpoint) + `config.json` |

## Arquitectura y entrenamiento

La arquitectura es una H-Net de nivel de byte (`byte-level`), según las etiquetas del repositorio y la referencia al proyecto `beetle-hnet`. El modelo se entrenó con el *legacy trainer* del repositorio (`legacy/tier1/train.py`), y el autor indica que se ha separado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m` al layout por ejecución de Beetle. No se detalla en la model card el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO.

El entrenamiento se organiza en ramas `step-N` con 21 checkpoints retenidos (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, etc.), cada una con `model.safetensors` y `config.json` (que incluye `model_config`, la configuración de entrenamiento y el mapa `tied_weights`, a restaurar con `sd[dst] = sd[src]`). La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. El trainer legacy no conservó estado del optimizador, de modo que no existe `training_state/`. Las pruebas de frontera FLORES+ de esta ejecución están en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo `exp32_onechunk_s1/`.

## Capacidades

- Modelo byte-level: procesa texto a nivel de byte, lo que en principio permite manejar cualquier cadena de bytes sin depender de un vocabulario BPE o SentencePiece.
- Entrenado con técnicas de *dynamic chunking*, orientadas a la segmentación adaptativa de la secuencia.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (aunque existen pruebas FLORES+ asociadas al run).
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Investigación sobre tokenización byte-level: el modelo sirve como artefacto de referencia para reproducir y analizar el comportamiento de H-Net a nivel de byte frente a tokenizadores subword convencionales.
- Estudio de *dynamic chunking*: permite comparar los 21 checkpoints retenidos (`step-N`) para trazar la evolución del aprendizaje de la segmentación adaptativa a lo largo del entrenamiento.
- Evaluación de fronteras lingüísticas con FLORES+: los *boundary probes* publicados en `hnet-chunking-probes` permiten medir cómo el modelo delimita unidades lingüísticas en textos multilingües.
- Reproducción de experimentos: al conservar `config.json`, `final.json` y `log.jsonl`, el artefacto facilita la replicación del entrenamiento con el *legacy trainer*.
- Docencia y formación: útil para ilustrar en un curso las diferencias entre modelado byte-level y subword, y el impacto del chunking dinámico.
- Base para experimentos derivados: al ser Apache 2.0, puede reutilizarse como punto de partida para *fine-tuning* o para comparativas de arquitecturas H-Net.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 82,47 M de parámetros, los pesos en precisión nativa (fp32) ocupan aproximadamente 330 MB; en fp16/bf16, unos 165 MB. No se dispone de datos oficiales de cuantización.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre debería bastar para cargar los pesos en fp16; no se documentan requisitos específicos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (RTX 3060 o superior), aunque no hay validación publicada.
- Opciones de despliegue: al ser un modelo `pytorch` con safetensors y una arquitectura H-Net no estándar, no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI; se requiere cargar los pesos con PyTorch y el código de `beetle-hnet`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `exp32_onechunk_s1` (AdaptiveChunking) | 82,47 M | no disponible | Apache 2.0 | Hugging Face |
| `hnet-chunking-spec-82m` (AdaptiveChunking) | ~82 M (repo empaquetado del que se separa) | no disponible | no disponible en la información | Hugging Face |
| Alternativas byte-level de propósito general | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa con modelos de la misma categoría distintos de los del propio autor.

## Limitaciones y advertencias

- Artefacto experimental: se trata de una ejecución concreta de investigación, no de un modelo listo para producción.
- Sin datos de evaluación: no hay benchmarks publicados, por lo que se desconoce su calidad real en tareas downstream.
- Model card incompleta: no se documentan idiomas, contexto, datos de entrenamiento ni composición del dataset.
- Sin estado del optimizador: el trainer legacy no conservó `training_state/`, lo que dificulta reanudar el entrenamiento.
- Mapa `tied_weights`: es imprescindible restaurar los pesos compartidos con `sd[dst] = sd[src]` para cada entrada del mapa; ignorarlo puede producir un modelo incorrecto.
- Riesgo de alucinación y sesgos: no evaluados ni documentados por el autor.
- Compatibilidad: al no ser una arquitectura transformer estándar, es probable que no funcione directamente con herramientas de inferencia convencionales.
- Licencia Apache 2.0: permite uso comercial, pero al no haber evaluación de calidad no se recomienda su uso en producción sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/exp32_onechunk_s1
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de pruebas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio de código `beetle-hnet`: https://github.com/suchirsalhan/beetle-hnet
