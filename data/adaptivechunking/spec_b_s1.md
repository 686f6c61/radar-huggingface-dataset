# AdaptiveChunking/spec_B_s1

## Resumen

spec_B_s1 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de un modelo byte-level basado en la arquitectura H-Net, entrenado con el denominado "legacy trainer" (`legacy/tier1/train.py`) del repositorio `beetle-hnet`. El modelo forma parte de un experimento sobre chunking dinámico (*dynamic-chunking*) aplicado a la tokenización a nivel de byte, y deriva del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m`, del que se ha separado siguiendo el esquema de organización por ejecución de Beetle.

El modelo cuenta con 82.470.528 parámetros en formato safetensors y un tamaño de repositorio de 6,9 GB, lo que refleja la retención de múltiples checkpoints intermedios (ramas `step-N`) además de los pesos finales. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni el pipeline de uso, y la model card no documenta resultados de benchmarks ni detalles del dataset de entrenamiento más allá de las pruebas de frontera FLORES+.

Su relevancia es acotada y de carácter experimental: no es un modelo orientado a producción, sino un artefacto de investigación para estudiar estrategias de segmentación dinámica en modelos byte-level. La licencia Apache 2.0 permite su reutilización, pero la ausencia de documentación técnica y de evaluaciones publicadas limita seriamente su aplicabilidad fuera del contexto del experimento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net byte-level (Beetle H-Net) |
| Parametros totales | 82.470.528 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pytorch) |

## Arquitectura y entrenamiento

La arquitectura es una H-Net de nivel de byte (*byte-level H-Net*), implementada en el repositorio `beetle-hnet`. Se trata de un modelo que opera directamente sobre bytes en lugar de sobre tokens subword, lo que elimina la dependencia de un vocabulario de tokenización fijo y permite, en principio, procesar cualquier secuencia de bytes sin *out-of-vocabulary*. El rasgo distintivo del experimento es el *dynamic-chunking*: la segmentación de la secuencia en unidades de cómputo se decide de forma adaptativa, lo que es precisamente el objeto de estudio de esta ejecución (`spec_B_s1`).

El entrenamiento se realizó con el *legacy trainer* del repositorio (`legacy/tier1/train.py`). La model card indica que este entrenador no conservó estado del optimizador, por lo que no existe directorio `training_state/` en el repositorio. Se retuvieron 21 checkpoints en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, entre otros), cada uno con su `model.safetensors` y `config.json`, que incluye `model_config`, la configuración de entrenamiento y el mapa `tied_weights` (a restaurar con `sd[dst] = sd[src]` para cada entrada). La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación y procesamiento de texto a nivel de byte, sin vocabulario subword asociado.
- Segmentación dinámica de secuencias (*dynamic-chunking*), que constituye el eje del experimento.
- Capacidad multilingüe: no documentada; el uso de bytes permite en teoría cualquier codificación, pero no hay evaluación publicada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Evaluación de fronteras de segmentación mediante las pruebas FLORES+ incluidas en el dataset `AdaptiveChunking/hnet-chunking-probes` (subcarpeta `spec_B_s1/`).

## Casos de uso

- Investigación sobre tokenización byte-level: el modelo sirve como punto de partida para estudiar cómo afecta la segmentación dinámica al rendimiento en tareas de modelado de lenguaje, comparando los distintos checkpoints `step-N` retenidos.
- Reproducción de experimentos de chunking adaptativo: los 21 checkpoints intermedios permiten analizar la evolución del aprendizaje de fronteras de segmentación a lo largo del entrenamiento.
- Evaluación de fronteras con FLORES+: las pruebas incluidas en `hnet-chunking-probes` permiten medir la calidad de la segmentación sobre un corpus multilingüe de referencia.
- Análisis de estabilidad del entrenamiento: la ausencia de estado del optimizador y la presencia de `log.jsonl` hacen del artefacto un caso de estudio sobre entrenadores legacy y su trazabilidad.
- Prototipado de pipelines sin vocabulario fijo: útil en escenarios donde se quiere evitar la dependencia de un tokenizador concreto, como texto con codificaciones mixtas o dominios con vocabulario muy especializado.
- Base para comparativas de arquitecturas H-Net: al estar separado del repositorio empaquetado original, facilita la comparación con otras ejecuciones del mismo proyecto bajo el esquema Beetle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 82,47 M de parámetros, los pesos en fp32 ocupan aproximadamente 330 MB; en fp16, unos 165 MB. La VRAM real dependerá de la longitud de contexto y de las estructuras de chunking, no documentadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM debería poder alojar los pesos; no se dispone de datos de rendimiento para recomendar modelos concretos (A100, H100, RTX 4090).
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño reducido del modelo, aunque no hay confirmación oficial.
- Opciones de despliegue: al estar en formato safetensors y librería pytorch, requiere carga manual con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdaptiveChunking/spec_B_s1 | 82,47 M | no disponible | H-Net byte-level con dynamic-chunking | Apache 2.0 | Hugging Face |
| AdaptiveChunking/hnet-chunking-spec-82m | 82 M (referencia del repo empaquetado) | no disponible | H-Net byte-level con dynamic-chunking | Apache 2.0 | Hugging Face |
| Otras ejecuciones Beetle del mismo proyecto | no disponible | no disponible | H-Net byte-level | Apache 2.0 (presumible) | Hugging Face |

No se dispone de información suficiente para comparar con modelos de propósito general de tamaño similar (por ejemplo, modelos de 80-100 M de parámetros basados en transformer con tokenizador subword), ya que no hay benchmarks publicados de este artefacto.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente a alternativas.
- Modelo de investigación sin pipeline declarado: no está pensado para inferencia directa en producción.
- Sin información sobre sesgos: al no documentarse el dataset de entrenamiento, no se pueden evaluar sesgos conocidos.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje, pero no cuantificado en este caso.
- Idiomas y contexto no documentados: impide planificar su uso en escenarios multilingües o de contexto largo.
- Entrenador legacy sin estado del optimizador: no es posible reanudar el entrenamiento desde los checkpoints tal cual.
- Restauración de pesos ligados: requiere aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`) para cargar correctamente los checkpoints.
- Licencia Apache 2.0: permite uso comercial, pero la falta de documentación y evaluación desaconseja su uso en producción sin validación previa.
- Repositorio de 6,9 GB por la retención de 21 checkpoints: conviene descargar solo la rama necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/spec_B_s1
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de pruebas de frontera: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/datasets
