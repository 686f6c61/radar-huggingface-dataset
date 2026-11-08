# AdaptiveChunking/jitter_s0

## Resumen

jitter_s0 es un checkpoint experimental de investigación publicado por la organización AdaptiveChunking en Hugging Face. No es un modelo conversacional ni un LLM generativo al uso, sino una ejecución (*run*) de un modelo de tipo H-Net con tokenización a nivel de byte (*byte-level*), entrenado mediante el framework `beetle-hnet` y el denominado *legacy trainer* (`legacy/tier1/train.py`). El modelo se ha separado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-pilots` y se ha reorganizado en el formato por ejecución de Beetle.

Con 22.516.992 parámetros (unos 22,5 millones), se trata de un modelo de escala muy reducida, orientado a experimentación sobre estrategias de *chunking* dinámico y segmentación de secuencias a nivel de byte. La relevancia de esta publicación es fundamentalmente metodológica: sirve como artefacto reproducible de un experimento concreto (identificado como `jitter_s0`) dentro de una línea de investigación sobre tokenización adaptativa, no como un modelo listo para producción.

El repositorio incluye una rama `main` con los pesos más recientes, `final.json` y `log.jsonl`, además de una rama `step-6000` con el único checkpoint retenido. No se dispone de información sobre el pipeline de la tarea, los idiomas soportados ni resultados de evaluación en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (byte-level), framework `beetle-hnet` |
| Parametros totales | 22.516.992 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin indicación de variantes GGUF/quantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` por checkpoint |
| Libreria | PyTorch |
| Tamano del repo | 0,1 GB |
| Checkpoints retenidos | 1 (`step-6000`) |
| Pesos atados (*tied weights*) | Si, mapa `tied_weights` en `config.json` (restaurar con `sd[dst] = sd[src]`) |
| Estado del optimizador | No incluido (el *legacy trainer* no lo guardaba) |

## Arquitectura y entrenamiento

La información disponible indica que jitter_s0 es una ejecución de un modelo H-Net con procesamiento a nivel de byte (*byte-level*), entrenado con el *legacy trainer* del proyecto `beetle-hnet` (ruta `legacy/tier1/train.py`). La etiqueta `hnet` y la referencia a *dynamic-chunking* sugieren una arquitectura jerárquica orientada a la segmentación dinámica de secuencias de bytes, aunque la model card no detalla la composición interna de capas, el mecanismo de atención ni la formulación exacta del *chunking*.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones de inferencia (decodificación especulativa, atención lineal, etc.). El checkpoint retenido corresponde al paso 6000, y el modelo emplea pesos atados, cuyo mapa de correspondencia se incluye en `config.json` y debe aplicarse al restaurar el estado. El entrenador no conservó estado del optimizador, por lo que no existe directorio `training_state/`.

## Capacidades

- Modelo de investigación sobre tokenización y *chunking* dinámico a nivel de byte; no se documentan capacidades generativas de propósito general.
- Procesamiento *byte-level*, lo que en principio evita dependencia de un vocabulario BPE y permite operar sobre cualquier secuencia de bytes.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas (idiomas no disponibles).
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.
- Reproducibilidad experimental: incluye `log.jsonl`, `final.json` y sondas de frontera FLORES+ en el dataset `AdaptiveChunking/hnet-chunking-probes` bajo `jitter_s0/`.

## Casos de uso

- Investigación sobre tokenización adaptativa: el modelo sirve como artefacto reproducible para estudiar cómo el *chunking* dinámico a nivel de byte afecta a la segmentación de secuencias, comparando la ejecución `jitter_s0` con otras del mismo conjunto de pilotos.
- Reproducción de experimentos: gracias a la rama `step-6000` y al `log.jsonl` de la rama `main`, un investigador puede restaurar el estado exacto (aplicando el mapa `tied_weights`) y replicar las condiciones del entrenamiento.
- Evaluación de fronteras de segmentación: las sondas FLORES+ publicadas en `hnet-chunking-probes/jitter_s0/` permiten analizar dónde sitúa el modelo las fronteras de *chunk* en texto multilingüe, útil para validar hipótesis sobre tokenización por bytes.
- Docencia y experimentación de bajo coste: con 22,5 M de parámetros y 0,1 GB de repo, el modelo cabe en cualquier GPU de consumo e incluso en CPU, lo que facilita prácticas sobre arquitecturas H-Net y entrenadores legacy.
- Base para *fine-tuning* exploratorio: al estar bajo Apache 2.0, puede reutilizarse como punto de partida en experimentos académicos de segmentación o modelado byte-level sin restricciones de licencia.
- Integración en pipelines de análisis lingüístico: sus salidas de segmentación pueden alimentar herramientas de preprocesado que necesiten decisiones de frontera independientes del vocabulario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (22,5 M de parámetros en FP32 ocupan aproximadamente 90 MB); en FP16, alrededor de 45 MB.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, pero también una GPU integrada o CPU.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo actuales, e incluso en entornos sin GPU.
- Opciones de despliegue: al ser un modelo PyTorch con safetensors y sin pipeline declarado, la carga se haría con PyTorch nativo y el código de `beetle-hnet`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles; al no ser un modelo generativo estándar, las métricas habituales de tokens por segundo no aplican directamente.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (H-Net byte-level para *chunking* dinámico) ni datos de rendimiento que permitan una comparación rigurosa. Como referencia interna, otras ejecuciones del mismo conjunto de pilotos se alojan en `AdaptiveChunking/hnet-chunking-pilots`, pero no se dispone de sus especificaciones en esta información.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está diseñado ni validado para uso en producción.
- Sin datos de evaluación: no hay benchmarks, métricas de calidad ni comparaciones publicadas en la información disponible.
- Idiomas no documentados: se desconoce el alcance multilingüe real pese a las sondas FLORES+.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en secuencias largas.
- Sesgos: no documentados; al entrenarse sobre datos no especificados, no es posible evaluar sesgos conocidos.
- Riesgo de alucinación: no aplica en el sentido conversacional, pero no se documenta el comportamiento generativo del modelo.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación con atribución; aun así, la falta de evaluación desaconseja su uso comercial directo.
- Ausencia de estado del optimizador: no es posible reanudar el entrenamiento desde el checkpoint tal cual; solo se puede reanudar la inferencia o reiniciar el entrenamiento.
- Pesos atados: es obligatorio aplicar el mapa `tied_weights` al restaurar el estado, o los pesos no se cargarán correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/jitter_s0
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking
- Repositorio empaquetado de pilotos: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Framework beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
