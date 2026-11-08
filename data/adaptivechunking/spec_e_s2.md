# AdaptiveChunking/spec_E_s2

## Resumen

spec_E_s2 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de un modelo byte-level basado en la arquitectura H-Net, entrenado con el denominado "legacy trainer" (`legacy/tier1/train.py`) del repositorio de código abierto beetle-hnet. El modelo forma parte de un experimento sobre chunking dinámico (*dynamic-chunking*) aplicado a la tokenización a nivel de byte, y fue separado del repositorio empaquetado original `AdaptiveChunking/hnet-chunking-spec-82m` para adoptar el formato de una ejecución individual dentro de la organización Beetle.

Con 82.470.528 parámetros (según los pesos en safetensors) y un tamaño de repositorio de 6,9 GB, el modelo se distribuye con 21 checkpoints intermedios retenidos en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, etc.), además de los pesos finales en la rama `main` junto con `final.json` y `log.jsonl`. La licencia es Apache 2.0.

Su relevancia es fundamentalmente de investigación: no es un modelo de propósito general listo para producción, sino un artefacto experimental para estudiar tokenización byte-level y estrategias de chunking dinámico. No se publican datos de pipeline, idiomas soportados ni resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net (byte-level, con chunking dinámico) |
| Parámetros totales | 82.470.528 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `config.json` por checkpoint) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en el proyecto beetle-hnet, orientada al procesamiento a nivel de byte (*byte-level*) con mecanismos de chunking dinámico. El entrenamiento se realizó con el entrenador heredado (*legacy trainer*, `legacy/tier1/train.py`), que no conservó estado del optimizador, por lo que el repositorio no incluye directorio `training_state/`. Cada checkpoint `step-N` incluye `model.safetensors` y un `config.json` con la configuración del modelo, la configuración de entrenamiento y el mapa `tied_weights` (que debe restaurarse aplicando `sd[dst] = sd[src]` para cada entrada). La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre el uso de RLHF, DPO u otras técnicas de alineación. Las sondas de frontera (*boundary probes*) sobre FLORES+ para esta ejecución se encuentran en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo la ruta `spec_E_s2/`, lo que sugiere que el entrenamiento o la evaluación se orientó a tareas de segmentación/chunking multilingüe, aunque no se detalla el procedimiento.

## Capacidades

- Procesamiento byte-level: el modelo opera sobre bytes en lugar de tokens subword, lo que en principio permite cubrir cualquier idioma o secuencia sin vocabulario fijo (aunque no se documentan idiomas concretos).
- Chunking dinámico: la arquitectura H-Net está diseñada para segmentar dinámicamente la entrada, capacidad central del experimento.
- Checkpoints intermedios: se ofrecen 21 estados de entrenamiento para análisis de dinámica de aprendizaje.
- Sondas de frontera: se publican sondas FLORES+ para evaluar la segmentación en fronteras lingüísticas.
- Generación de texto: no disponible (no se documenta como modelo generativo de propósito general).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (las sondas FLORES+ sugieren interés multilingüe, pero no se confirma soporte).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en tokenización byte-level: el modelo sirve como artefacto de estudio para comparar tokenización a nivel de byte frente a tokenización subword en tareas de segmentación.
- Análisis de dinámica de entrenamiento: los 21 checkpoints retenidos permiten trazar la evolución de los pesos y de las métricas a lo largo del entrenamiento (pasos 0 a 2000 y posteriores).
- Evaluación de chunking dinámico: las sondas FLORES+ bajo `spec_E_s2/` permiten reproducir experimentos de fronteras de segmentación sobre textos multilingües.
- Reproducción de experimentos: al incluir `config.json`, `final.json` y `log.jsonl`, un investigador puede reproducir la configuración de entrenamiento con el legacy trainer de beetle-hnet.
- Estudio de arquitecturas H-Net: útil para quienes investigan alternativas a los transformers estándar con mecanismos de chunking.
- Base para fine-tuning experimental: con 82M de parámetros y licencia Apache 2.0, puede adaptarse en entornos de investigación con recursos limitados, siempre que se valide su comportamiento en la tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 82,47M de parámetros, en fp32 los pesos ocupan aproximadamente 0,33 GB; en fp16/bf16 unos 0,16 GB. El tamaño del repositorio (6,9 GB) se debe a los múltiples checkpoints, no a un único conjunto de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente para un solo checkpoint en fp32 o fp16; también cabe en CPU para inferencia de baja escala.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors y arquitectura H-Net personalizada, requiere el código de beetle-hnet para cargarlo; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (byte-level con chunking dinámico y ~82M de parámetros) con datos de rendimiento publicados.

## Limitaciones y advertencias

- Modelo de investigación: no es un modelo de propósito general; no se documentan capacidades de generación, razonamiento ni instrucción.
- Sin datos de benchmarks: no hay evidencia publicada de rendimiento que permita evaluar su calidad frente a alternativas.
- Estado del optimizador ausente: el legacy trainer no guardó `training_state/`, lo que limita la reanudación exacta del entrenamiento.
- Restauración de pesos ligados: es obligatorio aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`) al cargar los checkpoints; omitirlo produce pesos incorrectos.
- Idiomas y contexto no documentados: no se puede garantizar cobertura lingüística ni longitud de contexto.
- Riesgo de alucinación: no evaluable sin datos de uso generativo.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto experimental sin validación, su uso en producción conlleva riesgo técnico no cuantificado.
- Dependencia de código externo: requiere el repositorio beetle-hnet para la carga y ejecución del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/spec_E_s2
- Repositorio empaquetado original: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/datasets
