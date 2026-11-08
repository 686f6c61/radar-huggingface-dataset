# AdaptiveChunking/spec_A_s0

## Resumen

spec_A_s0 es un checkpoint de investigación publicado por la organización AdaptiveChunking en Hugging Face. Se trata de una ejecución de entrenamiento (*run*) de un modelo byte-level basado en la arquitectura H-Net, generada con el repositorio `beetle-hnet` y el entrenador heredado (`legacy/tier1/train.py`). El modelo fue separado del repositorio empaquetado `AdaptiveChunking/hnet-chunking-spec-82m` y reorganizado en el formato por ejecución de Beetle.

El modelo cuenta con 82.470.528 parámetros según los pesos en safetensors y se distribuye bajo licencia Apache 2.0. Su interés principal no reside en capacidades de propósito general, sino en el estudio del *chunking* dinámico y la tokenización a nivel de byte: los tags del repositorio (`dynamic-chunking`, `tokenization`, `byte-level`, `hnet`) indican que es material para investigar cómo segmentar secuencias de bytes de forma adaptativa en lugar de usar un tokenizador BPE convencional.

No hay información pública sobre el pipeline, los idiomas soportados ni resultados de benchmarks. El repositorio incluye 21 checkpoints intermedios en ramas `step-N`, lo que lo convierte en un artefacto útil para análisis de dinámica de entrenamiento y de representaciones intermedias, más que para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net (byte-level), según tags del repositorio; detalles no disponibles |
| Parámetros totales | 82.470.528 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `config.json` por checkpoint) |

## Arquitectura y entrenamiento

La arquitectura es una H-Net de nivel de byte (*byte-level*), entrenada con el repositorio `beetle-hnet` mediante el entrenador heredado `legacy/tier1/train.py`. El modelo forma parte de una línea de experimentos sobre *dynamic chunking*: en lugar de tokenizar el texto con un vocabulario fijo, el modelo opera sobre bytes y agrupa la secuencia de forma adaptativa. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron etapas de RLHF o DPO.

El repositorio conserva 21 checkpoints intermedios en ramas `step-N` (pasos 0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 1000, 2000, etc.), cada uno con `model.safetensors` y `config.json`, que incluye la configuración del modelo, la del entrenamiento y el mapa `tied_weights` (los pesos compartidos deben restaurarse aplicando `sd[dst] = sd[src]` para cada entrada). La rama `main` contiene los pesos más recientes junto con `final.json` y `log.jsonl`. El entrenador heredado no guardaba estado del optimizador, por lo que no existe directorio `training_state/`. Las pruebas de frontera (*boundary probes*) sobre FLORES+ de esta ejecución están en el dataset `AdaptiveChunking/hnet-chunking-probes`, bajo `spec_A_s0/`.

## Capacidades

- Modelo de investigación orientado al estudio de segmentación dinámica y tokenización a nivel de byte; no se documentan capacidades de propósito general.
- No se ha publicado información sobre generación de texto, razonamiento, código o matemáticas.
- No consta soporte de *tool calling* ni de *function calling*.
- No consta soporte de agentes ni de razonamiento multi-paso.
- Capacidades multilingües: no disponibles; las pruebas de frontera asociadas usan FLORES+, pero no se documentan resultados.
- No se documentan modos especiales (*thinking mode*, visión o audio).

## Casos de uso

- Investigación sobre tokenización byte-level: usar los checkpoints para analizar cómo evoluciona la segmentación dinámica a lo largo del entrenamiento comparando las ramas `step-N`.
- Análisis de dinámica de entrenamiento: el `log.jsonl` y los 21 checkpoints permiten estudiar curvas de pérdida y estabilidad sin reentrenar.
- Evaluación de fronteras de segmentación: replicar las pruebas de FLORES+ incluidas en `AdaptiveChunking/hnet-chunking-probes` bajo `spec_A_s0/` para comparar el comportamiento entre checkpoints.
- Reproducción de experimentos: el mapa `tied_weights` y la configuración de entrenamiento en cada `config.json` permiten restaurar los pesos de forma fiel.
- Baseline para comparativas de *chunking*: servir como referencia de 82 M parámetros frente a tokenizadores BPE o modelos byte-level alternativos en tareas de segmentación.
- Estudio de robustez multilingüe a nivel de byte: al operar sobre bytes, el modelo no depende de un vocabulario lingüístico, lo que permite analizar su comportamiento en idiomas con escrituras diversas usando los conjuntos de prueba disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 82,47 M de parámetros en fp32, los pesos ocupan aproximadamente 330 MB; en fp16, unos 165 MB; en int8, unos 82 MB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- GPU recomendadas: no disponibles. Por tamaño, el modelo cabría en cualquier GPU consumer con al menos 2 GB de VRAM en fp16, pero no hay validación publicada.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño; sin confirmación oficial.
- Opciones de despliegue: no documentadas. El repositorio usa PyTorch y safetensors; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (H-Net byte-level con *chunking* dinámico) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo de investigación sin model card orientada a uso práctico: no se documentan sesgos, aunque un modelo byte-level entrenado con un corpus desconocido puede heredar sesgos de esos datos.
- Riesgo de alucinación: no evaluado ni documentado.
- Limitaciones de contexto e idioma: no disponibles; no se especifica la longitud de contexto ni los idiomas de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni documentación de calidad.
- El entrenador heredado no conserva estado del optimizador, lo que impide reanudar el entrenamiento exactamente desde un checkpoint.
- Los pesos con `tied_weights` requieren aplicar el mapeo `sd[dst] = sd[src]` al cargarlos; ignorarlo produce una restauración incorrecta.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta): no hay evidencia externa de funcionamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/spec_A_s0
- Repositorio empaquetado de origen: https://huggingface.co/AdaptiveChunking/hnet-chunking-spec-82m
- Dataset de pruebas de frontera FLORES+: https://huggingface.co/datasets/AdaptiveChunking/hnet-chunking-probes
- Repositorio de código beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
- Perfil de la organización: https://huggingface.co/AdaptiveChunking/models
