# AdaptiveChunking/emactl_noema_s0

## Resumen

`emactl_noema_s0` es un modelo de investigación publicado por el usuario AdaptiveChunking en Hugging Face, orientado al estudio de tokenización y chunking dinámico a nivel de byte. No es un modelo conversacional ni un LLM de propósito general: es un experimento de la familia H-Net (beetle-hnet) entrenado con el denominado *legacy trainer* (`legacy/tier1/train.py`) y separado del repositorio empaquetado `hnet-chunking-pilots` en el formato por ejecución de Beetle.

Con 22.516.992 parámetros reales (según los pesos en safetensors) y un tamaño de repositorio de 0,1 GB, se trata de un modelo muy pequeño, con pesos en formato safetensors y librería PyTorch. La model card no documenta arquitectura detallada, datos de entrenamiento, idiomas ni resultados de benchmarks; la información disponible se limita a metadatos de entrenamiento y a la organización de checkpoints.

Su relevancia es acotada: sirve como artefacto reproducible para investigar estrategias de segmentación adaptativa (dynamic chunking) sobre representaciones byte-level, y como punto de partida para comparaciones dentro del ecosistema de experimentos de AdaptiveChunking. No está pensado para despliegue en producción ni para tareas generativas estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (familia beetle-hnet); detalles no disponibles |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (rama `main` y ramas `step-N`) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia H-Net del proyecto beetle-hnet y fue entrenado con el *legacy trainer* del repositorio, concretamente con `legacy/tier1/train.py`. La model card no especifica el número de capas, dimensión oculta, mecanismo de atención ni el volumen de tokens de entrenamiento. La etiqueta `byte-level` indica que opera sobre bytes en lugar de sobre un vocabulario subword convencional, y `dynamic-chunking` sugiere que el objeto de estudio es la segmentación adaptativa de la secuencia de entrada.

El repositorio conserva un único checkpoint retenido, en la rama `step-N` con N = 6000, que incluye `model.safetensors` y `config.json` con la configuración del modelo, la configuración de entrenamiento y el mapa `tied_weights`. Para restaurar pesos atados hay que aplicar `sd[dst] = sd[src]` para cada entrada del mapa. La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. El legacy trainer no guardaba estado del optimizador, por lo que no existe directorio `training_state/`. No se documenta uso de RLHF, DPO ni ninguna otra fase de alineamiento.

## Capacidades

- Modelo de investigación sobre tokenización byte-level y chunking dinámico; no se documentan capacidades generativas de propósito general.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe, aunque existen sondas de frontera FLORES+ asociadas a esta ejecución en el dataset `hnet-chunking-probes`.
- No se documentan modos especiales (thinking, visión, audio).
- Se desconoce si existe una cabeza o interfaz de inferencia utilizable directamente; la model card solo describe pesos y configuración.

## Casos de uso

- Investigación en tokenización byte-level: usar los pesos y el `config.json` para reproducir la ejecución `emactl_noema_s0` y analizar cómo se comporta la segmentación sobre texto de entrada.
- Evaluación de fronteras de chunking: emplear las sondas FLORES+ del dataset `hnet-chunking-probes` (subcarpeta `emactl_noema_s0/`) para medir la calidad de las fronteras que produce el modelo frente a otros experimentos de la misma familia.
- Comparación de checkpoints: cargar la rama `step-6000` y los pesos de `main` para estudiar la evolución del entrenamiento a lo largo de la ejecución mediante `log.jsonl`.
- Reproducibilidad de experimentos: integrar el modelo en pipelines de investigación que sigan el formato por ejecución de Beetle y el esquema de pesos atados documentado.
- Estudio de eficiencia en tokenización: analizar el coste computacional de un modelo de 22,5 M de parámetros como alternativa ligera a tokenizadores subword en tareas de segmentación.
- Base para experimentos derivados: partir de estos pesos como inicialización en nuevas ejecuciones de chunking dinámico dentro del mismo marco experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño de parámetros (22,5 M), los pesos en precisión nativa ocuparían del orden de decenas de MB, pero no se documenta el formato numérico ni la memoria de activaciones.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que exista un camino de inferencia estándar.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; la librería declarada es PyTorch y los pesos están en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AdaptiveChunking/emactl_noema_s0 | 22.516.992 | no disponible | Apache 2.0 | Hugging Face |
| AdaptiveChunking/hnet-chunking-pilots | no disponible | no disponible | no disponible | Hugging Face (repo empaquetado del que se separó esta ejecución) |
| Alternativas de tokenización byte-level de propósito general | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta arquitectura, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar sesgos conocidos.
- Riesgo de alucinación: no evaluable, ya que no se documentan capacidades generativas ni tareas de referencia.
- Limitaciones de contexto e idioma: no disponibles; las únicas referencias lingüísticas son las sondas FLORES+ del dataset asociado.
- Licencia Apache 2.0: permite uso comercial, pero al no existir documentación de rendimiento ni de seguridad, no se recomienda su uso en producción.
- El legacy trainer no conservó estado del optimizador, lo que limita la reanudación exacta del entrenamiento.
- Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa.
- Los pesos atados requieren restaurar el mapa `tied_weights` con `sd[dst] = sd[src]`; una carga ingenua puede producir resultados incorrectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/emactl_noema_s0
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas de frontera: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
