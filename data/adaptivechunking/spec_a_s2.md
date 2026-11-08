# AdaptiveChunking/spec_A_s2

## Resumen

spec_A_s2 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de un modelo byte-level de arquitectura H-Net (hierarchical network) entrenado con el entrenador legacy (`legacy/tier1/train.py`) del proyecto beetle-hnet, y posteriormente separado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m` en el formato de una ejecución individual de Beetle. Con 82.470.528 parámetros, es un modelo pequeno orientado a experimentación sobre tokenización dinámica y chunking adaptativo, no a uso en producción como modelo de lenguaje general.

El modelo forma parte de una línea de trabajo centrada en la tokenización a nivel de byte y en mecanismos de chunking dinámico, según indican sus etiquetas (`dynamic-chunking`, `tokenization`, `hnet`, `byte-level`). No dispone de pipeline declarado, no tiene descargas ni likes, y su model card no documenta idiomas soportados ni capacidades de generación. La relevancia actual es limitada y acotada al ámbito de investigación: sirve como artefacto reproducible de un experimento concreto, con 21 checkpoints intermedios retenidos y sondas de frontera FLORES+ publicadas aparte.

La licencia es Apache 2.0 y los pesos están en safetensors, lo que facilita su inspección y reutilización. No obstante, la ausencia de benchmarks, de documentación sobre datos de entrenamiento y de cualquier evaluación de capacidades hace que deba tratarse exclusivamente como material de estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (hierarchical network) byte-level, según etiquetas del repositorio |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pytorch) |

## Arquitectura y entrenamiento

La arquitectura es una H-Net de nivel de byte, según las etiquetas `hnet` y `byte-level` del repositorio y la referencia al proyecto beetle-hnet. El modelo se entrenó con el entrenador legacy del proyecto (`legacy/tier1/train.py`), un entrenador que, según la model card, no conservaba estado del optimizador; por ese motivo el repositorio no incluye el directorio `training_state/`. El repositorio conserva 21 checkpoints retenidos en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, entre otros), cada uno con `model.safetensors` y `config.json`, que incluye `model_config`, la configuración de entrenamiento y el mapa `tied_weights` (a restaurar con `sd[dst] = sd[src]` para cada entrada). La rama `main` contiene los pesos más recientes, además de `final.json` y `log.jsonl`.

No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detallan innovaciones de decodificación o atención más allá de la propia naturaleza byte-level y el chunking dinámico que da nombre a la organización. Las sondas de frontera FLORES+ de esta ejecución están publicadas en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo el subdirectorio `spec_A_s2/`.

## Capacidades

- Modelo byte-level: procesa texto a nivel de byte, lo que en principio elimina la dependencia de un vocabulario de subpalabras fijo.
- Diseñado en torno a mecanismos de chunking dinámico y tokenización adaptativa, según las etiquetas del repositorio.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe ni modo de pensamiento.
- No se documenta ninguna capacidad especial adicional.

## Casos de uso

- Investigación sobre tokenización byte-level: el modelo sirve como artefacto reproducible para estudiar cómo una H-Net procesa secuencias a nivel de byte sin vocabulario de subpalabras, comparando los 21 checkpoints retenidos.
- Estudio de chunking dinámico: las etiquetas `dynamic-chunking` y la existencia de sondas de frontera FLORES+ en `hnet-chunking-probes` permiten analizar el comportamiento del modelo en fronteras de segmentos lingüísticos.
- Análisis de dinámica de entrenamiento: la rama `main` incluye `log.jsonl` y `final.json`, lo que facilita el estudio de curvas de pérdida y convergencia con el entrenador legacy.
- Reproducción de experimentos: el mapa `tied_weights` y los `config.json` por checkpoint permiten restaurar pesos atados y replicar la configuración exacta de cada paso.
- Baseline para comparativas de arquitecturas jerárquicas: con 82,5 M de parámetros, es un punto de referencia manejable para contrastar H-Net frente a transformers byte-level convencionales en tareas controladas.
- Docencia y experimentación con presupuesto reducido: su tamano permite ejecutarlo en hardware modesto para prácticas de tokenización y arquitecturas jerárquicas, siempre que se validen previamente sus pesos y configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 82,5 M de parámetros, en fp32 los pesos ocupan aproximadamente 330 MB, y en fp16 unos 165 MB, aunque no se documentan cuantizaciones soportadas.
- GPU recomendadas: no disponible; por tamano, cualquier GPU con al menos unos pocos GB de VRAM podría alojar los pesos, pero no hay validación publicada.
- Cabe en GPU de consumo: probablemente sí por tamano de parámetros, aunque no se documenta compatibilidad con ninguna GPU concreta.
- Opciones de despliegue: no disponible; la librería declarada es pytorch y no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (H-Net byte-level con chunking dinámico) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero tampoco se documenta la composición del dataset de entrenamiento, lo que impide evaluar riesgos de sesgo.
- Riesgo de alucinación: no evaluado; no hay benchmarks ni evaluaciones de calidad de generación.
- No se documentan idiomas soportados ni limitaciones de contexto; la longitud de contexto es desconocida.
- El modelo es un artefacto de investigación con 0 descargas y 0 likes, sin pipeline declarado; no debe asumirse que sea apto para producción.
- El entrenador legacy no conservó estado del optimizador, lo que limita la reanudación exacta del entrenamiento.
- La restauración de pesos requiere aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`); ignorarlo puede producir pesos incorrectos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de evaluación de capacidades y de documentación sobre datos hace desaconsejable cualquier despliegue sin validación propia.
- El repositorio ocupa 6,9 GB, en gran parte por los 21 checkpoints retenidos, lo que conviene tener en cuenta para almacenamiento y descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/spec_A_s2
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/datasets
- Proyecto beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
