# AdaptiveChunking/ali_mem-split_s1

## Resumen

`ali_mem-split_s1` es un modelo de investigación publicado por el usuario AdaptiveChunking en Hugging Face, entrenado con el framework [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet). Se trata de una ejecución con arquitectura `ali` y objetivo `ratio`, orientada al estudio de tokenización dinámica a nivel de byte (*dynamic chunking*) mediante una H-Net. No es un modelo conversacional ni un LLM de propósito general: es un artefacto experimental que documenta un entrenamiento de 6.000 pasos sobre secuencias de 1.024 bytes en tres idiomas (inglés, turco y finés).

El modelo tiene 22.785.088 parámetros totales (aproximadamente 22,8 millones), lo que lo sitúa en la escala de un modelo pequeño de investigación. El repositorio ocupa 8,8 GB, un tamaño desproporcionado respecto al número de parámetros, explicable porque almacena múltiples ramas de checkpoint (`step-N`) con estado completo del entrenador reanudable, no solo los pesos finales.

Su relevancia es limitada fuera del ámbito de la investigación en tokenización y segmentación adaptativa: no se han publicado benchmarks, no hay pipeline declarado, no se listan idiomas en los metadatos y las descargas son cero. Resulta útil como referencia reproducible para quienes estudian H-Nets y esquemas de *chunking* dinámico, no como modelo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net (beetle-hnet), variante `ali`, objetivo `ratio`, schedule `None`, dechunk `ema` |
| Parámetros totales | 22.785.088 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible como ventana declarada; entrenado con secuencias de 1.024 bytes |
| Tipos de cuantización | no disponible |
| Idiomas soportados | entrenado con `['en', 'tr', 'fi']`; idiomas declarados en metadatos: no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `training_state/checkpoint.pt` (PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura H-Net implementada en beetle-hnet, con nivel de tokenización a byte (*byte-level*) y un mecanismo de *dynamic chunking* que agrupa bytes en unidades de longitud variable. La configuración concreta de esta ejecución es `architecture=ali`, `objective=ratio`, `schedule=None` y `dechunk=ema`, con semilla 1. Los pesos en `model.safetensors` almacenan cada tensor atado una sola vez, y `config.json["tied_weights"]` mapea los nombres omitidos a los almacenados.

El entrenamiento consistió en 6.000 pasos con batch de 32 y secuencias de 1.024 bytes, sobre datos en inglés, turco y finés. No se especifican en la información disponible el número total de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO (poco probables dado el objetivo de investigación en tokenización). El repositorio organiza los checkpoints en ramas `step-N` según un calendario logarítmico consciente de fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k desde el inicio de cada fase objetivo, más el paso final), e incluye la rama `main` con los pesos y el config del último paso, `log.jsonl`, `final.json` y sondas de frontera FLORES+ en `probe/` una vez finalizada la ejecución.

## Capacidades

- Modelado de lenguaje a nivel de byte con segmentación dinámica (*dynamic chunking*).
- Entrenamiento y evaluación multilingüe limitada a inglés, turco y finés.
- Reanudación de entrenamiento desde checkpoints completos (`training_state/checkpoint.pt`).
- Sondas de frontera sobre FLORES+ para evaluar la segmentación aprendida.
- No se documenta soporte de *tool calling*, *function calling* ni comportamiento agéntico.
- No se documenta *thinking mode*, visión, audio ni otras modalidades.
- No se declara pipeline de inferencia ni tarea concreta en Hugging Face.

## Casos de uso

- Investigación en tokenización adaptativa: usar los checkpoints `step-N` para analizar cómo evoluciona la segmentación en bytes a lo largo del entrenamiento y comparar fases del calendario logarítmico.
- Reproducción de experimentos: cargar `training_state/checkpoint.pt` de una revisión concreta (por ejemplo `step-1024`) y reanudar el entrenamiento con el mismo estado del optimizador y del *scheduler*.
- Evaluación de fronteras lingüísticas: emplear las sondas FLORES+ incluidas en `probe/` para medir la calidad de los límites de *chunk* en inglés, turco y finés.
- Estudio comparativo de arquitecturas H-Net: contrastar la variante `ali` con otras ejecuciones del mismo autor o del framework beetle-hnet bajo el mismo objetivo `ratio`.
- Prototipado de modelos byte-level de bajo coste: con 22,8 M de parámetros, sirve como banco de pruebas para pipelines de preprocesado y segmentación antes de escalar a modelos mayores.
- Docencia y experimentación académica: el repositorio incluye configuración de entrenamiento y estado reanudable, lo que facilita su uso en cursos o trabajos sobre tokenización y modelos jerárquicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 22,8 M de parámetros en precisión completa (FP32) los pesos ocupan aproximadamente 91 MB; en FP16, unos 46 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM para los pesos; una RTX 3060 o superior es más que suficiente. Para reanudar el entrenamiento conviene una GPU con memoria suficiente para el estado del optimizador y el batch de 32 × 1.024 bytes.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas actuales.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de investigación en PyTorch, la vía natural es cargar los safetensors con la librería del framework beetle-hnet.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (H-Net byte-level con *dynamic chunking*) ni se dispone de datos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de investigación sin pipeline declarado ni benchmarks publicados; no apto para uso en producción sin validación adicional.
- Entrenado únicamente con inglés, turco y finés; el comportamiento en otros idiomas es desconocido.
- Ventana de entrenamiento de 1.024 bytes, muy inferior a la de LLM convencionales; no se declara contexto extendido.
- Riesgo de alucinación y de generación incoherente no evaluado; no hay datos de calidad.
- Sesgos desconocidos: no se documenta la composición del dataset ni filtros aplicados.
- Licencia Apache 2.0: permite uso comercial, pero al no haber evaluación de calidad ni casos de uso previstos, su aplicación comercial carece de justificación técnica.
- El repositorio ocupa 8,8 GB por el almacenamiento de múltiples checkpoints con estado completo; conviene descargar solo la revisión necesaria.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-split_s1
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
