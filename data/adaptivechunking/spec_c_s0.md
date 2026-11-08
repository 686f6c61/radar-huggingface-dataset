# AdaptiveChunking/spec_C_s0

## Resumen

`spec_C_s0` es un modelo de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo conversacional al uso: se trata de un *checkpoint* de un experimento de tokenización dinámica a nivel de byte (byte-level) construido sobre la arquitectura H-Net, ejecutado con el repositorio `beetle-hnet` y su entrenador heredado (`legacy/tier1/train.py`). El modelo fue separado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m` para adoptar el diseño de un directorio por ejecución que usa Beetle.

El modelo tiene 82.470.528 parámetros (aproximadamente 82,5 millones), según los pesos en formato safetensors, y se distribuye bajo licencia Apache 2.0. Su interés no radica en capacidades generativas generales, sino en servir como artefacto reproducible de un estudio sobre segmentación adaptativa de tokens y fronteras de *chunking* evaluadas con sondas sobre FLORES+.

La relevancia actual es acotada y de nicho: resulta útil para investigadores que trabajen en tokenización byte-level, en arquitecturas H-Net o en la reproducibilidad de experimentos de *chunking* dinámico. No dispone de *pipeline* declarado, no tiene descargas ni *likes*, y su model card no documenta idiomas ni resultados de evaluación de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (según tags y model card: `hnet`, `byte-level`, `beetle-hnet`) |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` por checkpoint) y `config.json` |

## Arquitectura y entrenamiento

La model card identifica el modelo como una ejecución de H-Net a nivel de byte (`Byte-level H-Net run`) realizada con el repositorio `beetle-hnet` y el entrenador heredado `legacy/tier1/train.py`. No se detalla en la información disponible la composición interna de la arquitectura H-Net (número de capas, dimensiones ocultas, mecanismo de atención o esquema de *chunking*), más allá de las etiquetas `dynamic-chunking`, `hnet` y `byte-level`. Tampoco se especifican el volumen de tokens de entrenamiento, la composición del corpus ni si hubo fases de RLHF o DPO.

El repositorio conserva 21 checkpoints retenidos en ramas `step-N` (0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, etc.), cada uno con sus pesos y su `config.json`, que incluye `model_config`, la configuración de entrenamiento y el mapa `tied_weights` (la restauración se hace con `sd[dst] = sd[src]` para cada entrada). La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. El entrenador heredado no guardó estado del optimizador, por lo que no existe un directorio `training_state/`. Las sondas de fronteras sobre FLORES+ de esta ejecución están en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo `spec_C_s0/`.

## Capacidades

- Modelo de investigación centrado en tokenización byte-level y *chunking* dinámico; no se documentan capacidades generativas de propósito general.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües, aunque existen sondas de fronteras sobre FLORES+ (conjunto multilingüe) en el dataset asociado.
- No se documenta *thinking mode*, visión ni audio.
- Capacidad principal verificable: servir como checkpoint intermedio reproducible de un experimento de segmentación adaptativa, con estados en múltiples pasos de entrenamiento.

## Casos de uso

- Reproducción de experimentos de tokenización: cargar los checkpoints `step-N` y el `config.json` para replicar el entrenamiento del estudio de *chunking* dinámico con `beetle-hnet` y el entrenador heredado.
- Investigación en fronteras de *chunking*: usar las sondas FLORES+ del dataset `hnet-chunking-probes` (`spec_C_s0/`) para medir cómo evoluciona la segmentación a lo largo de los distintos pasos de entrenamiento.
- Análisis de dinámica de entrenamiento: comparar los 21 checkpoints retenidos (pasos 0 a 2000 y posteriores) para estudiar la convergencia y los cambios en los pesos a lo largo del tiempo.
- Estudio de arquitecturas H-Net byte-level: emplear el modelo como referencia de implementación para trabajos que exploren alternativas a la tokenización subword clásica.
- Restauración de pesos con mapas *tied*: validar el procedimiento `sd[dst] = sd[src]` del mapa `tied_weights` en pipelines de carga propios.
- Docencia y experimentación académica: disponer de un artefacto pequeño (82,5 M de parámetros) y con licencia permisiva para prácticas de carga de safetensors y análisis de configuraciones de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 82,47 M de parámetros, los pesos en precisión completa (fp32) ocupan aproximadamente 330 MB; en fp16/bf16, unos 165 MB. La VRAM total dependerá del tamaño de lote y de la longitud de secuencia, dato no disponible.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre debería bastar para cargar los pesos; no se dispone de datos de rendimiento específicos por modelo de GPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (por ejemplo, series GTX/RTX con suficiente VRAM), aunque no se documentan requisitos oficiales.
- Opciones de despliegue: la librería declarada es PyTorch; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, ni existen pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (H-Net byte-level con *chunking* dinámico) en la información proporcionada. El propio autor referencia el repositorio empaquetado del que deriva este modelo:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `AdaptiveChunking/spec_C_s0` | 82.470.528 | no disponible | Apache 2.0 | Ejecución individual separada del repositorio empaquetado |
| `AdaptiveChunking/hnet-chunking-spec-82m` | no disponible en la informacion | no disponible | no disponible | Repositorio empaquetado del que se extrajo `spec_C_s0`; misma familia de experimentos |

## Limitaciones y advertencias

- Modelo de investigación sin *pipeline* declarado ni evaluación de calidad publicada; no debe emplearse como modelo generativo en producción.
- No se documentan idiomas soportados ni cobertura lingüística, pese a las sondas sobre FLORES+.
- No se documenta la longitud de contexto, lo que impide planificar despliegues con secuencias largas.
- El entrenador heredado no conservó estado del optimizador, por lo que no es posible reanudar el entrenamiento exactamente desde los checkpoints.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación funcional hace desaconsejable cualquier uso más allá de la investigación.
- El repositorio ocupa 6,9 GB, en gran parte por los 21 checkpoints retenidos, lo que encarece su descarga y almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/spec_C_s0
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de sondas de *chunking*: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Perfil de la organización en Hugging Face: https://huggingface.co/AdaptiveChunking/datasets
- Repositorio `beetle-hnet`: https://github.com/suchirsalhan/beetle-hnet
