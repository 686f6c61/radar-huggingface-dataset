# AdaptiveChunking/specfull_B_s0

## Resumen

specfull_B_s0 es un modelo de 82.470.528 parámetros (aproximadamente 82,5 millones) publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución concreta (run) de un modelo de arquitectura H-Net a nivel de byte, entrenada con el repositorio `beetle-hnet` mediante el denominado legacy trainer (`legacy/tier1/train.py`). El modelo se ha separado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m` para adoptar el diseño de un directorio por ejecución de Beetle.

La relevancia del modelo reside en su enfoque de tokenización y chunking dinámico a nivel de byte, una línea de investigación que busca eliminar la dependencia de tokenizadores subword fijos y adaptar la segmentación al contenido. Los tags de la model card (`dynamic-chunking`, `tokenization`, `hnet`, `byte-level`, `beetle-hnet`, `legacy-trainer`) confirman esta orientación. No obstante, la información publicada es muy escasa: no se detallan datos de entrenamiento, benchmarks ni idiomas soportados.

El repositorio tiene un tamaño de 9,9 GB e incluye 30 checkpoints retenidos en ramas `step-N`, además de los pesos más recientes en la rama `main` junto con `final.json` y `log.jsonl`. La licencia es Apache 2.0. El modelo no registra descargas ni likes en el momento de la consulta, y no tiene pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net a nivel de byte (byte-level H-Net), según tags y model card |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` por checkpoint |

## Arquitectura y entrenamiento

La arquitectura es una H-Net a nivel de byte, según los tags `hnet` y `byte-level` de la model card. El modelo se entrenó con el legacy trainer del repositorio `beetle-hnet` (`legacy/tier1/train.py`), un entrenador que, según la propia model card, no conservaba estado del optimizador; por ello no existe un directorio `training_state/` en esta publicación. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

La publicación conserva 30 checkpoints en ramas `step-N` (0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 4000, 8000, entre otros), cada uno con `model.safetensors` y `config.json`, que incluye `model_config`, la configuración de entrenamiento y el mapa `tied_weights`. Para restaurar los pesos atados hay que aplicar `sd[dst] = sd[src]` para cada entrada del mapa. La rama `main` contiene los pesos más recientes, `final.json` y `log.jsonl`. Las pruebas de frontera (boundary probes) sobre FLORES+ de esta ejecución están en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo el subdirectorio `specfull_B_s0/`.

## Capacidades

- Modelo de investigación centrado en tokenización y chunking dinámico a nivel de byte.
- Entrenado sobre el framework `beetle-hnet`, orientado a experimentos de segmentación adaptativa.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas o visión en la información disponible.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; únicamente se mencionan pruebas de frontera sobre FLORES+, sin detallar resultados.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Investigación en tokenización adaptativa: el modelo sirve como artefacto de referencia para estudiar cómo el chunking dinámico a nivel de byte afecta a la segmentación, comparando los 30 checkpoints retenidos en las ramas `step-N`.
- Reproducción de experimentos: al conservar configuración de entrenamiento y mapa `tied_weights` en cada `config.json`, permite reproducir la restauración de pesos atados y analizar la evolución del entrenamiento paso a paso.
- Análisis de fronteras lingüísticas: las boundary probes sobre FLORES+ publicadas en `AdaptiveChunking/hnet-chunking-probes` permiten evaluar el comportamiento del modelo en la detección de límites entre unidades lingüísticas.
- Estudio de currículos de entrenamiento: la secuencia de checkpoints (0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 4000, 8000...) facilita analizar la dinámica de aprendizaje temprano y tardío con el legacy trainer.
- Base para experimentos de tokenización en pipelines propios: investigadores que trabajen con tokenizadores byte-level pueden usar los pesos como punto de partida o comparación frente a tokenizadores subword convencionales.
- Auditoría de artefactos de entrenamiento: el repositorio permite inspeccionar `final.json` y `log.jsonl` para reconstruir la traza de entrenamiento y verificar la ausencia de estado del optimizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 82,5 millones de parámetros, los pesos en precisión completa ocuparían aproximadamente 330 MB (fp32) o 165 MB (fp16/bf16), aunque el repositorio completo ocupa 9,9 GB debido a los 30 checkpoints retenidos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de parámetros sería viable en GPUs de consumo, pero no se documenta el soporte de runtime.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La librería declarada es PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (H-Net byte-level con chunking dinámico) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Información muy escasa: no se documentan datos de entrenamiento, idiomas, contexto ni benchmarks, lo que impide evaluar su calidad de forma objetiva.
- Modelo de investigación: los tags `legacy-trainer` y la ausencia de estado del optimizador sugieren un artefacto experimental, no un modelo listo para producción.
- No se documentan sesgos conocidos; al no haber información sobre la composición del dataset, no es posible evaluar sesgos.
- Riesgo de alucinación: no evaluable con la información disponible.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0: permite uso comercial con atribución, pero al no existir documentación sobre el entrenamiento ni evaluación de capacidades, su uso en producción no está respaldado por datos.
- El repositorio incluye 30 checkpoints (9,9 GB en total), lo que requiere seleccionar cuidadosamente la rama `step-N` o `main` antes de la descarga.
- La restauración de pesos atados requiere aplicar el mapa `tied_weights` de `config.json`; ignorarlo puede producir pesos incorrectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/specfull_B_s0
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de boundary probes FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización en Hugging Face: https://huggingface.co/AdaptiveChunking/datasets
