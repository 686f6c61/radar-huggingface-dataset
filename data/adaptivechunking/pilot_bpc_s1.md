# AdaptiveChunking/pilot_Bpc_s1

## Resumen

pilot_Bpc_s1 es un checkpoint de investigación publicado por la organización AdaptiveChunking dentro de su línea de experimentos sobre tokenización dinámica a nivel de byte. No es un modelo conversacional ni un LLM al uso: es una ejecución piloto de una H-Net (arquitectura jerárquica de chunking adaptativo) entrenada con el trainer heredado del proyecto beetle-hnet, concretamente el script `legacy/tier1/train.py`. El modelo se ha separado del repositorio agregado `hnet-chunking-pilots` para adoptar el layout por ejecución de Beetle.

Con 22.516.992 parámetros (unos 22,5 millones) y un tamaño de repositorio de 0,1 GB, se trata de un modelo pequeño orientado a experimentación sobre segmentación y representación byte-level, no a generación de texto de propósito general. La relevancia actual es acotada: sirve como artefacto reproducible para estudiar cómo una H-Net aprende fronteras de chunking sobre texto multilingüe, con sondas de evaluación publicadas sobre FLORES+.

La información disponible es muy limitada: la model card no documenta arquitectura detallada, composición del dataset, longitud de contexto ni resultados de benchmarks. Cualquier uso en producción requeriría validación propia y acceso al código de beetle-hnet para reconstruir la configuración de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net (hierarchical network) byte-level con chunking dinámico; detalles no disponibles |
| Parámetros totales | 22.516.992 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp32/fp16; no confirmado) |
| Idiomas soportados | no disponible (las sondas de evaluación usan FLORES+, multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` y mapa `tied_weights` |

## Arquitectura y entrenamiento

El modelo pertenece a la familia H-Net implementada en el repositorio beetle-hnet, con un enfoque de tokenización byte-level y chunking dinámico (etiquetas `dynamic-chunking`, `tokenization`, `hnet`, `byte-level`, `beetle-hnet`). La model card no detalla el número de capas, dimensiones ocultas, mecanismo de atención ni el esquema exacto de agrupamiento jerárquico; solo indica que se entrenó con el trainer heredado `legacy/tier1/train.py`.

El entrenamiento se realizó sin estado de optimizador conservado (el trainer legacy no lo guardaba), por lo que el repositorio no incluye `training_state/`. Se conserva un único checkpoint en la rama `step-6000`, con pesos y configuración, además de los pesos más recientes, `final.json` y `log.jsonl` en `main`. El mapa `tied_weights` debe aplicarse restaurando `sd[dst] = sd[src]` para cada entrada al cargar los pesos. No se documentan número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Modelo de investigación para tokenización y chunking adaptativo a nivel de byte; no está diseñado como modelo generativo de propósito general.
- Representación byte-level, sin dependencia de un vocabulario BPE predefinido (según las etiquetas del repositorio).
- Evaluación de fronteras de chunking mediante sondas sobre FLORES+, publicadas en el dataset `hnet-chunking-probes`.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües formales más allá del uso de FLORES+ en las sondas.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación sobre tokenización byte-level: usar el checkpoint para reproducir el experimento `pilot_Bpc_s1` y comparar curvas de entrenamiento a partir de `log.jsonl`.
- Estudio de fronteras de chunking: evaluar las predicciones del modelo contra las sondas FLORES+ del dataset `hnet-chunking-probes/pilot_Bpc_s1/` para medir calidad de segmentación.
- Baseline en experimentos de AdaptiveChunking: servir como referencia de 22,5 M de parámetros frente a otras ejecuciones piloto del mismo repositorio.
- Análisis de eficiencia de tokenización: comparar la longitud efectiva de secuencia y el coste computacional de un esquema byte-level con chunking frente a tokenizadores BPE en corpus multilingües.
- Reproducibilidad académica: cargar el checkpoint `step-6000` con el mapa `tied_weights` para verificar resultados publicados y auditar el pipeline del trainer legacy.
- Prototipado de preprocesado: integrar el modelo en un pipeline de preprocesado de texto para estudiar cómo afecta el chunking adaptativo a tareas posteriores (clasificación, recuperación), siempre con validación empírica propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño del modelo (22,5 M de parámetros); en fp32 los pesos ocupan aproximadamente 90 MB, en fp16 unos 45 MB. Cifra estimada a partir del recuento de parámetros, no confirmada por el autor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura no estándar (H-Net), requiere el código de beetle-hnet; no consta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia H-Net con especificaciones publicadas. Como referencia interna, el repositorio agregado `AdaptiveChunking/hnet-chunking-pilots` contiene otras ejecuciones piloto del mismo proyecto, pero no se dispone de sus parámetros ni resultados.

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo listo para producción ni para generación de texto de propósito general.
- La model card no documenta arquitectura interna, contexto, datos de entrenamiento ni evaluación de calidad; el riesgo de uso indebido por desconocimiento es alto.
- El trainer legacy no conservó estado de optimizador, lo que impide reanudar el entrenamiento desde el checkpoint tal cual.
- Es obligatorio aplicar el mapa `tied_weights` al cargar los pesos; omitirlo produce un modelo incorrecto.
- No hay información sobre sesgos, alucinación o comportamiento multilingüe; cualquier despliegue debe someterse a evaluación propia.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso comunitario ni de mantenimiento activo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/pilot_Bpc_s1
- Organización en Hugging Face: https://huggingface.co/AdaptiveChunking
- Repositorio agregado de pilotos: https://huggingface.co/AdaptiveChunking/hnet-chunking-pilots
- Dataset de sondas FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
