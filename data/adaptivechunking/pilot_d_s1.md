# AdaptiveChunking/pilot_D_s1

## Resumen

pilot_D_s1 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución de entrenamiento (run) del proyecto beetle-hnet, una implementación de H-Net con tokenización a nivel de byte (byte-level) y técnicas de chunking dinámico. El modelo fue entrenado con el entrenador legacy del repositorio (`legacy/tier1/train.py`) y se ha separado del repositorio conjunto `AdaptiveChunking/hnet-chunking-pilots` siguiendo el esquema de organización por ejecuciones de Beetle.

Con 22.516.992 parámetros totales (aproximadamente 22,5 millones), se trata de un modelo de escala muy reducida, orientado a experimentación sobre estrategias de segmentación y tokenización más que a producción general. El interés actual del modelo reside en su enfoque de chunking dinámico sobre representaciones byte-level, un área de investigación relacionada con la eficiencia en el procesamiento de secuencias y la eliminación de dependencias de tokenizadores subword convencionales.

La model card es escueta y no documenta arquitectura detallada, datos de entrenamiento ni resultados de evaluación. El repositorio incluye pesos en safetensors, configuración del modelo, configuración de entrenamiento y un mapa de pesos atados (`tied_weights`), además de sondas de frontera FLORES+ publicadas en un dataset aparte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (beetle-hnet) con tokenización byte-level y chunking dinámico; detalles internos no disponibles |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` y mapa `tied_weights` |

## Arquitectura y entrenamiento

El modelo pertenece a la familia H-Net tal como se implementa en el repositorio beetle-hnet, con procesamiento a nivel de byte y un mecanismo de chunking dinámico que da nombre a la organización autora. La model card no detalla la composición interna de capas, el mecanismo de atención ni la forma exacta en que se aplica el chunking, por lo que estos extremos quedan como no disponibles. El tamaño de 22,5 millones de parámetros sitúa al modelo en el rango de los transformers pequeños de investigación.

El entrenamiento se realizó con el entrenador legacy (`legacy/tier1/train.py`), que según la documentación no conservaba estado del optimizador; por ello el repositorio no incluye `training_state/`. Se conserva un único checkpoint retenido en la rama `step-6000`, además de los pesos más recientes en `main` junto con `final.json` y `log.jsonl`. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá del propio esquema de chunking.

## Capacidades

- Procesamiento de texto a nivel de byte: el modelo opera sobre bytes en lugar de tokens subword, lo que en principio elimina problemas de vocabulario fuera de dominio.
- Chunking dinámico: la arquitectura está diseñada para segmentar la entrada de forma adaptativa, según la implementación beetle-hnet.
- Generación de texto: no confirmada explícitamente en la información disponible; el pipeline no está declarado en Hugging Face.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; existen sondas de frontera FLORES+ en el dataset asociado, pero no se publican resultados.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre tokenización byte-level: el modelo sirve como punto de partida para reproducir y analizar experimentos de chunking dinámico frente a tokenizadores subword convencionales, dado que comparte el ecosistema beetle-hnet.
- Evaluación de fronteras de segmentación: las sondas FLORES+ publicadas en `AdaptiveChunking/hnet-chunking-probes` bajo `pilot_D_s1/` permiten medir cómo el modelo delimita unidades lingüísticas en distintos idiomas.
- Reproducción de experimentos de entrenamiento: al incluir `config.json` con la configuración de entrenamiento y `log.jsonl`, es posible auditar la curva de entrenamiento y replicar el run con el entrenador legacy.
- Estudio de pesos atados: el mapa `tied_weights` documentado permite analizar cómo se comparten pesos entre módulos, un aspecto relevante en arquitecturas con chunking.
- Base para fine-tuning de investigación en tareas de segmentación o clasificación a nivel de byte, aprovechando su reducido tamaño para iterar rápidamente en una sola GPU.
- Docencia y prototipado: con 22,5 millones de parámetros, el modelo cabe holgadamente en GPUs de consumo y permite demostrar conceptos de tokenización y arquitecturas H-Net en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,5 millones de parámetros en fp32, los pesos ocupan aproximadamente 90 MB; en fp16, unos 45 MB. La VRAM real dependerá de la longitud de secuencia y del estado intermedio, no disponible.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM es suficiente para los pesos; no se documentan requisitos específicos.
- GPU de consumo: cabe en prácticamente cualquier GPU de consumo (GTX 1060 6 GB, RTX 3060, RTX 4090, etc.), así como en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo PyTorch con safetensors y sin pipeline declarado, el despliegue requeriría cargar los pesos manualmente con la implementación de beetle-hnet. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pilot_D_s1 (AdaptiveChunking) | 22,5 M | no disponible | Apache 2.0 | Hugging Face, pesos safetensors |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de chunking dinámico byte-level con los que establecer una comparación rigurosa. El repositorio hermano `AdaptiveChunking/hnet-chunking-pilots` contiene otras ejecuciones del mismo proyecto que podrían servir como referencia interna, pero no se detallan sus especificaciones en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: se trata de un checkpoint piloto de un proyecto experimental, sin documentación de calidad, evaluación ni garantías de funcionamiento.
- Sin benchmarks: no hay resultados publicados que permitan estimar su rendimiento en tareas estándar.
- Idiomas no especificados: la model card no declara idiomas soportados; las sondas FLORES+ sugieren evaluación multilingüe, pero sin resultados publicados.
- Riesgo de alucinación: no evaluado; al ser un modelo pequeño y sin ajuste documentado, la generación de texto fiable no está garantizada.
- Sesgos: no documentados; no se describe la composición del dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías, pero el estado experimental del modelo desaconseja su uso en producción.
- Sin estado de optimizador: el entrenador legacy no conservó `training_state/`, lo que impide reanudar el entrenamiento desde el checkpoint tal cual.
- Pesos atados: la restauración requiere aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`); ignorarlo puede producir una carga incorrecta de los pesos.
- Sin pipeline declarado: la integración con herramientas estándar (transformers, vLLM, Ollama) no está soportada de forma documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_D_s1
- Repositorio conjunto de ejecuciones: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
