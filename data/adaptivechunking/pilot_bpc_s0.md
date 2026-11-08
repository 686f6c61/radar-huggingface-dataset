# AdaptiveChunking/pilot_Bpc_s0

## Resumen

pilot_Bpc_s0 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución de entrenamiento de un modelo byte-level basado en la arquitectura H-Net, ejecutada con el repositorio [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet) y el entrenador heredado (`legacy/tier1/train.py`). El modelo forma parte de una serie de "pilotos" sobre chunking dinámico y tokenización a nivel de byte, y fue separado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-pilots` para adoptar el diseño de un directorio por ejecución de Beetle.

El modelo tiene 22.516.992 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos pequeños (del orden de decenas de millones de parámetros). No es un modelo de propósito general: es una pieza de experimentación orientada a estudiar estrategias de segmentación adaptativa y representación byte-level, y su utilidad principal es la reproducibilidad de ese experimento, no el despliegue en producción.

La relevancia actual es limitada y acotada al ámbito de investigación en tokenización. El checkpoint retenido corresponde al paso 6000, se distribuye con licencia Apache 2.0 y no incluye estado del optimizador, lo que refleja el carácter ligero y experimental del pipeline de entrenamiento empleado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net (byte-level), según la model card y los tags `hnet`, `byte-level`, `beetle-hnet` |
| Parámetros totales | 22.516.992 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` por checkpoint |

## Arquitectura y entrenamiento

La arquitectura es una H-Net a nivel de byte, entrenada con el entrenador heredado del repositorio beetle-hnet (`legacy/tier1/train.py`). El modelo se distribuye con una rama `main` que contiene los pesos más recientes junto con `final.json` y `log.jsonl`, y una rama `step-N` con un único checkpoint retenido en el paso 6000, que incluye `model.safetensors` y `config.json`. Este `config.json` contiene la configuración del modelo, la configuración de entrenamiento y el mapa `tied_weights`, que debe restaurarse aplicando `sd[dst] = sd[src]` para cada entrada.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF o DPO. El entrenador heredado no conservaba estado del optimizador, por lo que no existe directorio `training_state/` en el repositorio. Como material asociado, las sondas de frontera FLORES+ de esta ejecución están publicadas en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo la ruta `pilot_Bpc_s0/`.

## Capacidades

- Generación y modelado de texto a nivel de byte, sin tokenizador subword intermedio, según la naturaleza byte-level del modelo.
- Estudio de segmentación dinámica (dynamic chunking) y de fronteras de segmento, apoyado por las sondas FLORES+ publicadas en el dataset asociado.
- Reproducción de experimentos de tokenización y chunking sobre corpus multilingües, dado el uso de sondas FLORES+.
- No hay evidencia en la información disponible de soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking).
- Capacidades multilingües: no disponibles como dato declarado; el uso de FLORES+ en las sondas sugiere evaluación sobre múltiples idiomas, pero no se especifica el conjunto soportado.

## Casos de uso

- Reproducción de experimentos de tokenización: cargar el checkpoint del paso 6000 y el `config.json` para replicar la ejecución `pilot_Bpc_s0` y comparar resultados con otras ejecuciones de la serie de pilotos.
- Investigación en chunking adaptativo: utilizar el modelo como sujeto de prueba para medir cómo distintas políticas de segmentación afectan la representación byte-level y las fronteras de chunk.
- Evaluación de fronteras multilingües: emplear las sondas FLORES+ del dataset `hnet-chunking-probes` para analizar el comportamiento del modelo en límites de segmento sobre textos de varios idiomas.
- Análisis de arquitecturas H-Net: estudiar el comportamiento de una H-Net byte-level de 22,5 millones de parámetros en tareas controladas de laboratorio, como referencia para diseños mayores.
- Docencia y experimentación con entrenadores heredados: servir de ejemplo funcional de un pipeline `legacy/tier1/train.py`, incluido el manejo del mapa `tied_weights` al restaurar pesos.
- Punto de partida para ajuste fino controlado: al ser un modelo pequeño (0,1 GB de repositorio), puede cargarse y adaptarse en entornos con recursos limitados para pruebas de concepto de tokenización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22.516.992 parámetros en precisión FP32, los pesos ocupan aproximadamente 90 MB; en FP16 o BF16, unos 45 MB. La VRAM adicional depende de la longitud de contexto efectiva, que no está documentada.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente para los pesos; no se dispone de recomendaciones del autor para A100, H100 o RTX 4090.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño de 0,1 GB del repositorio.
- Opciones de despliegue: la librería declarada es PyTorch con pesos safetensors; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. La restauración requiere aplicar el mapa `tied_weights` del `config.json`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pilot_Bpc_s0 | 22.516.992 | no disponible | apache-2.0 | Hugging Face, repo de 0,1 GB | Checkpoint de investigación byte-level H-Net, paso 6000 |
| Otras ejecuciones de `hnet-chunking-pilots` | no disponible | no disponible | no disponible | Hugging Face (`AdaptiveChunking/hnet-chunking-pilots`) | Misma serie de pilotos de chunking; comparación directa por diseño |
| Modelos byte-level de referencia (p. ej. ByT5) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | No se dispone de datos verificados en esta búsqueda para establecer una comparación numérica |

No se dispone de datos suficientes para comparar parámetros, contexto y rendimiento con alternativas de la misma categoría más allá de las otras ejecuciones de la propia serie.

## Limitaciones y advertencias

- Modelo de investigación, no de producción: es un checkpoint de una serie de pilotos, sin pipeline declarado ni documentación de uso general.
- Sin estado del optimizador: el entrenador heredado no lo conservaba, por lo que no es posible reanudar el entrenamiento desde el paso 6000 con estado completo.
- Restauración de pesos no trivial: requiere aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`) recogido en el `config.json`; omitirlo produce pesos incorrectos.
- Idiomas no declarados: la model card no especifica el conjunto de idiomas soportados, lo que impide garantizar comportamiento multilingüe más allá de las sondas FLORES+.
- Contexto no documentado: se desconoce la longitud de contexto efectiva, lo que limita la planificación de despliegues con ventanas largas.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible; al ser un modelo pequeño entrenado para experimentación, la calidad generativa no está validada.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia, pero no hay garantías del autor sobre idoneidad para producción.
- Sin benchmarks publicados: no existen métricas verificadas de MMLU, HumanEval, GSM8K ni similares para este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_Bpc_s0
- Repositorio empaquetado de pilotos: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
