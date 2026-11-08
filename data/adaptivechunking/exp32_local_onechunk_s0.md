# AdaptiveChunking/exp32_local_onechunk_s0

## Resumen

`exp32_local_onechunk_s0` es un checkpoint de investigación publicado por el usuario AdaptiveChunking, derivado del repositorio agrupado `AdaptiveChunking/hnet-chunking-spec-82m`. Se trata de una ejecución de entrenamiento de una red H-Net de nivel de byte ("byte-level H-Net") realizada con el framework `beetle-hnet` y su entrenador heredado (`legacy/tier1/train.py`). El modelo tiene 82.470.528 parámetros reales según los pesos en safetensors y el repositorio ocupa 6,9 GB.

El interés del artefacto no reside en sus capacidades generativas (no se documenta pipeline, idiomas ni uso previsto como modelo de chat), sino en su naturaleza de experimento reproducible sobre *dynamic chunking* y tokenización a nivel de byte. El repositorio expone 21 checkpoints intermedios en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000...), lo que permite estudiar la evolución del entrenamiento y las fronteras de segmentación que aprende la red.

La licencia es Apache 2.0 y los pesos se distribuyen en formato safetensors compatibles con PyTorch. No hay información publicada sobre contexto, cuantizaciones, idiomas ni resultados de benchmarks, por lo que debe tratarse como material de investigación y no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net de nivel de byte (byte-level H-Net), según tags del autor; detalles internos no disponibles |
| Parámetros totales | 82.470.528 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` por rama `step-N`) + `config.json` |
| Librería | PyTorch |
| Framework de entrenamiento | `beetle-hnet`, entrenador heredado (`legacy/tier1/train.py`) |
| Checkpoints publicados | 21 ramas `step-N` (0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, ...) más `main` con pesos finales, `final.json` y `log.jsonl` |
| Estado del optimizador | no incluido (el entrenador heredado no lo guardó; no hay `training_state/`) |
| Tamaño del repositorio | 6,9 GB |

## Arquitectura y entrenamiento

El modelo se describe como una H-Net de nivel de byte, es decir, una red que opera sobre bytes en lugar de sobre tokens subword, y que según los tags del autor está orientada a *dynamic chunking* (segmentación dinámica). No se detalla en la información disponible la composición interna de la red (número de capas, dimensión oculta, mecanismo de atención o de agregación de chunks), ni el número de tokens de entrenamiento, ni la composición del dataset.

El entrenamiento se realizó con el framework `beetle-hnet` (repositorio público en GitHub) usando su entrenador heredado `legacy/tier1/train.py`. El repositorio conserva un mapa de pesos atados (`tied_weights`) en el `config.json`, con la instrucción de restaurarlos aplicando `sd[dst] = sd[src]` para cada entrada. Al no haberse guardado el estado del optimizador, no es posible reanudar el entrenamiento desde estos checkpoints de forma exacta. Las sondas de frontera sobre FLORES+ de esta ejecución se encuentran en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo la carpeta `exp32_local_onechunk_s0/`.

## Capacidades

- No se documentan capacidades generativas, de razonamiento, código, matemáticas o visión en la información disponible.
- El modelo está orientado, por sus tags y por el repositorio de origen, a experimentos de tokenización a nivel de byte y segmentación dinámica (*dynamic chunking*).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües; el único material asociado son sondas de frontera sobre FLORES+, que es un benchmark multilingüe, pero no se especifica el rendimiento.
- No se documenta modo *thinking*, visión, audio ni otras capacidades especiales.

## Casos de uso

- Investigación sobre tokenización a nivel de byte: el modelo permite estudiar cómo una red H-Net aprende a agrupar bytes en unidades mayores sin un vocabulario subword predefinido, usando los 21 checkpoints intermedios para trazar la evolución.
- Análisis de segmentación dinámica: los checkpoints `step-N` permiten comparar las fronteras de chunk aprendidas en distintas fases del entrenamiento, apoyándose en las sondas FLORES+ publicadas en el dataset asociado.
- Reproducción de experimentos: al estar el código en `beetle-hnet` y los pesos en safetensors, es posible replicar la ejecución con el entrenador heredado y contrastar `log.jsonl` con los resultados obtenidos.
- Estudio de dinámica de entrenamiento: la secuencia de checkpoints (0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000...) facilita analizar la curva de aprendizaje en las primeras fases y en fases tardías.
- Base para experimentos de *chunking* adaptativo en pipelines de NLP: el modelo puede servir como componente de investigación para evaluar si la segmentación dinámica mejora tareas posteriores, aunque requeriría trabajo de integración no documentado.
- Docencia y formación: como ejemplo didáctico de red de nivel de byte con pesos atados y checkpoints intermedios, útil en cursos de arquitecturas de lenguaje y tokenización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio únicamente referencia sondas de frontera sobre FLORES+ en el dataset `AdaptiveChunking/hnet-chunking-probes`, sin cifras de rendimiento asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 82,47 millones de parámetros, los pesos en fp32 ocupan aproximadamente 330 MB; en fp16, unos 165 MB; en int8, unos 82 MB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre debería poder cargar los pesos; no se documentan requisitos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 3060, RTX 4090, etc.), aunque no se ha verificado con el código de `beetle-hnet`.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el formato publicado es safetensors para PyTorch, por lo que el despliegue requeriría cargar los pesos con el código del framework `beetle-hnet`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (H-Net de nivel de byte con *dynamic chunking*) ni se documentan métricas que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de propósito general: no se documenta pipeline, uso previsto, idiomas ni capacidades generativas, por lo que no debe emplearse como modelo de chat o de generación sin validación previa.
- Ausencia de benchmarks: no hay métricas publicadas que permitan evaluar su calidad frente a alternativas.
- Sin estado del optimizador: no es posible reanudar el entrenamiento de forma exacta desde estos checkpoints.
- Pesos atados: es necesario aplicar el mapa `tied_weights` del `config.json` (`sd[dst] = sd[src]`) para restaurar correctamente el modelo.
- Riesgo de alucinación y sesgos: no evaluados ni documentados; al ser un modelo de investigación sin datos de entrenamiento publicados, no pueden descartarse sesgos derivados del corpus utilizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero al no existir documentación de uso previsto ni evaluación de riesgos, su empleo en producción es desaconsejable sin una validación exhaustiva.
- Idiomas: no se especifican; las sondas FLORES+ sugieren interés multilingüe, pero no hay confirmación de cobertura.
- Fecha de creación del repositorio: 2026-11-08, según los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/exp32_local_onechunk_s0
- Repositorio de origen agrupado: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas de frontera: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Framework `beetle-hnet`: https://github.com/suchirsalhan/beetle-hnet
