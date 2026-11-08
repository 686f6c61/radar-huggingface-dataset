# AdaptiveChunking/specfull_A_s1

## Resumen

specfull_A_s1 es un modelo de investigación de 82.470.528 parámetros publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución (*run*) de entrenamiento de una arquitectura H-Net de nivel de byte (*byte-level*), construida sobre el proyecto de código abierto beetle-hnet y entrenada con el denominado *legacy trainer* (`legacy/tier1/train.py`). El modelo se ha separado del repositorio empaquetado original `AdaptiveChunking/hnet-chunking-spec-82m` para adoptar el diseño de un directorio por ejecución de Beetle.

El interés del modelo no reside en sus capacidades generativas de propósito general, sino en su carácter experimental: forma parte de una línea de trabajo sobre *dynamic chunking* (segmentación dinámica de secuencias a nivel de byte) y tokenización. El repositorio conserva 44 checkpoints intermedios distribuidos en ramas `step-N`, lo que lo convierte en un artefacto útil para estudiar la evolución del entrenamiento y la formación de fronteras de segmentación, no para despliegue en producción.

La model card no documenta arquitectura detallada, composición del dataset, número de tokens de entrenamiento ni resultados de evaluación. Los únicos datos verificables son el recuento de parámetros procedente de los pesos en safetensors, la licencia Apache 2.0 y la existencia de sondas de frontera FLORES+ publicadas en un dataset aparte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net de nivel de byte (*byte-level*), según la model card; detalles internos no disponibles |
| Parámetros totales | 82.470.528 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) más `config.json` por checkpoint |

## Arquitectura y entrenamiento

La model card identifica el modelo como una ejecución de H-Net de nivel de byte procedente del repositorio beetle-hnet, entrenada con el *legacy trainer* en `legacy/tier1/train.py`. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni el esquema exacto de *chunking* dinámico. El mapa `tied_weights` incluido en cada `config.json` indica que algunos pesos están atados y deben restaurarse aplicando `sd[dst] = sd[src]` para cada entrada del mapa antes de cargar el estado.

El entrenamiento se conserva en 44 checkpoints retenidos en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 500, 1000, etc.), cada uno con sus pesos y configuración. La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. El *legacy trainer* no guardó estado del optimizador, por lo que no existe directorio `training_state/`. No hay información pública sobre volumen de tokens, composición del corpus, uso de RLHF/DPO ni innovaciones técnicas adicionales más allá del propio esquema de segmentación dinámica.

## Capacidades

- Modelo de investigación centrado en tokenización y segmentación dinámica a nivel de byte; no se documentan capacidades generativas de propósito general.
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles. La existencia de sondas FLORES+ sugiere evaluación sobre corpus multilingüe, pero no se confirma el soporte funcional de idiomas.
- No se documentan modos especiales (modo *thinking*, visión, audio).
- Capacidad destacable verificable: checkpointing granular (44 estados) para análisis de trayectorias de entrenamiento y de fronteras de segmentación.

## Casos de uso

- Investigación sobre tokenización de nivel de byte: el modelo permite estudiar cómo se forman las fronteras de segmentación durante el entrenamiento, comparando los 44 checkpoints retenidos en las ramas `step-N`.
- Análisis de dinámica de entrenamiento: la disponibilidad de checkpoints en pasos tempranos (0, 1, 2, 4, 8...) y tardíos (1000 en adelante) facilita curvas de aprendizaje y estudios de convergencia sin necesidad de reentrenar.
- Reproducción de experimentos de *dynamic chunking*: al estar separado del repositorio original `hnet-chunking-spec-82m` con el diseño de Beetle, sirve como unidad reproducible de una ejecución concreta.
- Evaluación de fronteras con FLORES+: las sondas publicadas en `AdaptiveChunking/hnet-chunking-probes` bajo `specfull_A_s1/` permiten replicar la evaluación de segmentación sobre un corpus multilingüe de referencia.
- Base para *fine-tuning* experimental: con 82,5 M de parámetros y licencia Apache 2.0, es viable ajustarlo en una única GPU de gama media para tareas de investigación acotadas.
- Docencia y formación: su tamaño reducido y su estructura de checkpoints lo hacen adecuado para ilustrar pipelines de entrenamiento, atado de pesos y gestión de estados en proyectos de código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente remite a las sondas de frontera FLORES+ del dataset `AdaptiveChunking/hnet-chunking-probes`, sin cifras asociadas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 330 MB solo para pesos (82,47 M × 4 bytes), más activaciones y memoria del runtime.
- VRAM estimada en FP16/BF16: aproximadamente 165 MB para pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia en precisión reducida; no se dispone de datos de rendimiento para recomendar modelos concretos (A100, H100, RTX 4090).
- Cabe holgadamente en GPU de consumo (GTX 1660, RTX 3060, RTX 4060 y superiores), si bien no se documenta compatibilidad con runtimes de inferencia estándar.
- Opciones de despliegue: la librería declarada es PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la naturaleza experimental del modelo hace improbable su integración directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (H-Net de nivel de byte con segmentación dinámica) ni se documentan métricas que permitan una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación publicada: no hay benchmarks que permitan estimar su calidad en tareas downstream.
- Ausencia de documentación sobre sesgos, datos de entrenamiento y composición del corpus, lo que impide evaluar riesgos de sesgo o de alucinación.
- Sin información sobre idiomas soportados ni sobre el comportamiento fuera del dominio de entrenamiento.
- El *legacy trainer* no conservó estado del optimizador, lo que limita la reanudación exacta del entrenamiento desde los checkpoints.
- Los pesos requieren restaurar los pesos atados según el mapa `tied_weights` de cada `config.json`; una carga ingenua puede producir resultados incorrectos.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de evaluación y de soporte de runtimes de inferencia desaconseja su uso en producción.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/specfull_A_s1
- Repositorio original empaquetado: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Perfil de la organización: https://huggingface.co/AdaptiveChunking
- Código base beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
