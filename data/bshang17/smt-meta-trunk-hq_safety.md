# bshang17/smt-meta-trunk-hq_safety

## Resumen

`smt-meta-trunk-hq_safety` es una colección de checkpoints intermedios de mid-training publicada por el usuario `bshang17` en Hugging Face. No se trata de un modelo final afinado para uso general, sino de una serie de instantáneas de entrenamiento de un modelo base SmolLM2-1.7B (1.700 millones de parámetros, familia SmolLM2 de Hugging Face) tras 60.000 millones de tokens sobre una mezcla de datos denominada `hq_safety`. El propósito declarado es permitir reanudar el entrenamiento de forma exacta y evaluar el estado del modelo en pasos concretos.

El repositorio ocupa 25,4 GB e incluye, por cada paso guardado, un checkpoint completo en fp32 con el estado del optimizador AdamW (`optimizer.pt`), el fichero `state.json` con el paso y la posición en los datos, configuración y tokenizador, además de una exportación en bf16 pensada para evaluación. Es, por tanto, material de investigación orientado a reproducibilidad y análisis de dinámicas de entrenamiento, no un artefacto listo para producción.

La relevancia actual es acotada pero específica: sirve para estudiar cómo evoluciona un modelo pequeño de 1,7B durante el mid-training con foco en seguridad, comparar checkpoints intermedios y reanudar experimentos sin perder el estado del optimizador. No hay información pública sobre licencia, idiomas soportados ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-1.7B) |
| Parametros totales | 1.700 millones (aproximado, segun SmolLM2-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp32 y bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32 y bf16), optimizer.pt (AdamW) |

## Arquitectura y entrenamiento

El modelo subyacente es SmolLM2-1.7B, un transformer decoder-only de la familia SmolLM2 de Hugging Face. Los checkpoints publicados corresponden a la fase de mid-training sobre una mezcla de datos llamada `hq_safety`, con un total de 60.000 millones de tokens procesados. Cada directorio `step-XXXXXX/` contiene los pesos completos en fp32, el estado íntegro del optimizador AdamW en `optimizer.pt`, un `state.json` con el número de paso y la posición en el flujo de datos, además de la configuración y el tokenizador, lo que permite reanudar el entrenamiento de forma exacta.

La variante `step-XXXXXX/bf16/` es una exportación en bf16 de los mismos pesos, orientada a evaluación. No se documentan en la información disponible detalles sobre la composición exacta de la mezcla `hq_safety`, el uso de RLHF/DPO, técnicas de atención lineal o decodificación especulativa. Tampoco se indica qué pasos concretos están incluidos en el repositorio.

## Capacidades

- Generación de texto autoregresiva, heredada de la arquitectura SmolLM2-1.7B.
- Razonamiento y código: capacidades propias de un modelo de 1,7B, sin datos de evaluación publicados en este repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Reanudación exacta de entrenamiento: sí, gracias al estado completo del optimizador y a `state.json`.

## Casos de uso

- Reanudación de experimentos de mid-training: cargar `step-XXXXXX/` con `optimizer.pt` y `state.json` permite continuar el entrenamiento exactamente desde el paso guardado, sin recalcular el estado de AdamW.
- Análisis de dinámicas de entrenamiento: comparar checkpoints de distintos pasos para estudiar la evolución de la pérdida, la estabilidad numérica o el olvido catastrófico en un modelo de 1,7B.
- Investigación en seguridad de modelos: la mezcla `hq_safety` sugiere un foco en comportamientos seguros; los checkpoints permiten medir cómo cambia la tasa de respuestas inseguras a lo largo del entrenamiento.
- Evaluación comparativa de checkpoints intermedios: usar las exportaciones bf16 para lanzar suites de evaluación (perplejidad, benchmarks de razonamiento) sin cargar el estado del optimizador.
- Reproducibilidad de publicaciones: al incluir configuración, tokenizador y posición en los datos, el repositorio facilita replicar resultados de artículos o informes técnicos sobre mid-training.
- Base para fine-tuning posterior: partir de un checkpoint bf16 intermedio como inicialización alternativa al modelo final, por ejemplo para estudiar el efecto del punto de partida en tareas downstream.
- Docencia y formación: ilustrar el ciclo completo de entrenamiento de un LLM pequeño con artefactos reales de checkpoint, optimizador y estado de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,4 GB solo para pesos (1,7B × 2 bytes), más memoria para activaciones y KV cache.
- VRAM estimada para inferencia en fp32: aproximadamente 6,8 GB solo para pesos.
- VRAM para reanudar entrenamiento: los pesos fp32 (6,8 GB) más el estado de AdamW (el doble de los parámetros, unos 13,6 GB) y activaciones; en la práctica se requiere una GPU con 40 GB o más (A100 40/80 GB, H100) o técnicas de offload.
- GPU consumer: la inferencia bf16 cabe en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4090); el entrenamiento completo no cabe en consumer.
- Opciones de despliegue: al ser pesos en formato safetensors de un transformer estándar, es compatible con vLLM, TGI y transformers; para llama.cpp/Ollama sería necesaria una conversión a GGUF no incluida en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smt-meta-trunk-hq_safety | ~1,7B | no disponible | no disponible | Checkpoints de mid-training |
| SmolLM2-1.7B (Hugging Face) | 1,7B | 8.192 tokens (según model card pública) | Apache 2.0 (según model card pública) | Modelo final |
| Qwen2.5-1.5B | 1,5B | 32.768 tokens | Apache 2.0 | Modelo final |
| Llama 3.2-1B | 1,2B | 128.000 tokens | Llama 3.2 Community License | Modelo final |

La comparación es orientativa: los tres alternativos son modelos finales listos para inferencia, mientras que este repositorio contiene checkpoints intermedios de entrenamiento sin evaluación publicada.

## Limitaciones y advertencias

- No es un modelo final: los checkpoints intermedios pueden presentar calidad inferior a la del SmolLM2-1.7B publicado.
- Licencia no especificada: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue.
- Idiomas soportados no documentados: se desconoce la cobertura multilingüe real de la mezcla `hq_safety`.
- Riesgo de alucinación: inherente a un modelo de 1,7B sin evaluación publicada; no hay datos que lo cuantifiquen.
- Sesgos: no se documenta la composición del dataset ni filtros aplicados, por lo que no se pueden evaluar sesgos conocidos.
- Tamaño del repositorio: 25,4 GB, lo que implica costes de almacenamiento y descarga considerables; los checkpoints completos incluyen el estado del optimizador, innecesario para inferencia.
- Falta de información sobre pasos incluidos: la model card no enumera qué `step-XXXXXX` están disponibles.
- Uso en producción desaconsejado sin evaluación previa: al tratarse de material de investigación, requiere validación específica de la tarea.

## Enlaces

- Hugging Face: https://huggingface.co/bshang17/smt-meta-trunk-hq_safety
- SmolLM2-1.7B (modelo base de referencia): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Repositorio SmolLM2: https://github.com/huggingface/smollm
