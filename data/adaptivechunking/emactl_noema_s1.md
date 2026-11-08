# AdaptiveChunking/emactl_noema_s1

## Resumen

`emactl_noema_s1` es un modelo de investigación publicado por el usuario AdaptiveChunking dentro de la familia de experimentos `beetle-hnet`. Se trata de un modelo byte-level basado en la arquitectura H-Net, entrenado con el entrenador heredado (`legacy/tier1/train.py`) del repositorio [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet) y separado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-pilots` en el formato por ejecución de Beetle.

El modelo es muy pequeño: 22.516.992 parámetros totales según los pesos en safetensors, con un tamaño de repositorio de 0,1 GB. Su propósito no parece ser el despliegue en producción, sino servir como artefacto reproducible de experimentos de tokenización dinámica y chunking a nivel de byte. La model card no documenta contexto, idiomas ni pipeline, y no se han publicado resultados de benchmarks.

La relevancia actual es limitada fuera del ámbito de investigación: es un checkpoint de una ejecución concreta (un único paso retenido, 6000) que permite reproducir y auditar los experimentos de chunking adaptativo del autor, junto con las sondas de frontera FLORES+ publicadas en el dataset asociado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net (byte-level), según la model card; detalles internos no disponibles |
| Parámetros totales | 22.516.992 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y `config.json`; también `final.json` y `log.jsonl` en la rama `main` |

## Arquitectura y entrenamiento

La model card identifica el modelo como una ejecución byte-level de H-Net realizada con `beetle-hnet` y entrenada con el entrenador heredado (`legacy/tier1/train.py`). No se detalla el número de capas, dimensión oculta, mecanismo de atención ni el esquema de chunking dinámico empleado. El repositorio incluye una rama `step-N` con un único checkpoint retenido (paso 6000), que contiene `model.safetensors` y `config.json` con la configuración del modelo, la configuración de entrenamiento y el mapa `tied_weights` (las pesos atados deben restaurarse aplicando `sd[dst] = sd[src]` para cada entrada).

No se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. El entrenador heredado no conservó estado del optimizador, por lo que no existe directorio `training_state/` en el repositorio. Las sondas de frontera FLORES+ de esta ejecución están publicadas en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo la ruta `emactl_noema_s1/`.

## Capacidades

- Generación de texto a nivel de byte: el modelo opera sobre bytes, no sobre un vocabulario de subpalabras, según la etiqueta `byte-level`.
- Chunking dinámico: la etiqueta `dynamic-chunking` y la familia H-Net sugieren experimentación con segmentación adaptativa de la entrada, aunque la model card no describe la API ni el comportamiento exacto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Reproducción de experimentos de tokenización: cargar el checkpoint del paso 6000 con el mapa `tied_weights` para replicar los resultados de la ejecución `emactl_noema_s1` dentro del marco `beetle-hnet`.
- Auditoría de chunking adaptativo: comparar las segmentaciones producidas por el modelo con las sondas de frontera FLORES+ publicadas en `hnet-chunking-probes/emactl_noema_s1/` para evaluar el comportamiento en límites de palabra y frase.
- Investigación sobre modelos byte-level: usar los 22,5 M de parámetros como baseline ligero para estudiar representaciones a nivel de byte sin depender de un tokenizador BPE.
- Docencia y prototipado: el tamaño reducido (0,1 GB) permite cargar el modelo en un portátil o en una GPU consumer para experimentos educativos sobre arquitecturas H-Net.
- Desarrollo de pipelines de evaluación de tokenización: integrar el checkpoint en un arnés de pruebas que mida la calidad de la segmentación frente a tokenizadores estándar.
- Estudio de metodología de entrenamiento: analizar el `log.jsonl` y `final.json` de la rama `main` para reconstruir la curva de entrenamiento del entrenador heredado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (22,5 M de parámetros, ~90 MB de pesos); en fp16 o bf16, aproximadamente 45 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier tarjeta moderna (RTX 3060, RTX 4090, etc.) e incluso en iGPU.
- Opciones de despliegue: PyTorch nativo (formato safetensors); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al ser un modelo byte-level H-Net es probable que requiera el código de `beetle-hnet` para la carga.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia o categoría con datos verificables de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- Modelo de investigación: sin pipeline declarado, sin idiomas documentados y sin benchmarks; no apto para uso en producción sin una evaluación previa.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin estado del optimizador: el entrenador heredado no guardó `training_state/`, lo que dificulta reanudar el entrenamiento desde el checkpoint.
- Pesos atados: es obligatorio aplicar el mapa `tied_weights` (`sd[dst] = sd[src]`) al restaurar el checkpoint; de lo contrario, la carga puede ser incorrecta.
- Riesgo de alucinación y sesgos: no evaluados ni documentados.
- Limitaciones de contexto e idioma: no disponibles; al ser byte-level, el comportamiento multilingüe no está caracterizado.
- Fecha de creación futura (2026-11-08): conviene verificar la integridad y procedencia del artefacto antes de usarlo.
- Cero descargas y cero likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/emactl_noema_s1
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Código de entrenamiento (beetle-hnet): https://github.com/suchirsalhan/beetle-hnet
