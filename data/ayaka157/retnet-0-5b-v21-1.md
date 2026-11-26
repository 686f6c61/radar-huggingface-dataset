# Ayaka157/RetNet-0.5B-v21.1

## Resumen

RetNet-0.5B-v21.1 es un modelo de lenguaje de tipo base desarrollado por el autor independiente Ayaka157, construido sobre la arquitectura RetNet (Retentive Network), una alternativa a los transformers tradicionales que sustituye la atención por un mecanismo de retención con decaimiento por cabeza. El modelo cuenta con 504.179.896 parámetros y se distribuye como checkpoint de pesos en safetensors bajo licencia MIT, pensado para cargarse con `trust_remote_code=True` en la librería transformers.

La versión v21.1 se presenta como una reparación de la v21.0, que sufría olvido catastrófico (una degradación de +0,655 nat) y tenía un 41,18% de parámetros declarados a cero. Según la model card, en esta versión todos los parámetros están activos y el criterio de evaluación "headline 5-file" mejora de 3,5027 a 2,4885. Es, por tanto, un modelo base experimental orientado a investigación sobre arquitecturas de retención, no un modelo de chat ni un asistente instruido.

Su relevancia radica en servir como implementación práctica y reproducible de RetNet a escala 0,5B, con código de modelado, scripts de evaluación y un informe técnico publicados por el autor. No obstante, el modelo no ha pasado por ajuste por instrucciones ni alineación, y sus capacidades conversacionales, aritméticas y de código se sitúan, según el propio autor, en el suelo esperable para 0,5B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetNet (retention), 20 capas, ancho 1408, 22 cabezas, dim de valor/FFN 2816 |
| Parametros totales | 504.179.896 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos almacenados en fp32; se recomienda cargar en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, fp32, 1,92 GB); código de modelado en Python |

## Arquitectura y entrenamiento

RetNet sustituye la atención por producto escalar por un mecanismo de retención con decaimiento exponencial aprendido por cabeza (γ). La implementación incluye tres formulaciones: paralela para prefill/serving, por bloques (chunkwise) para entrenamiento y recurrente para decodificación, con una variable de entorno `RETNET_FAST_CHUNKWISE=1` para chunkwise por lotes. El modelo tiene 20 capas, anchura 1408, 22 cabezas y dimensión de valor/FFN de 2816, con un vocabulario de 20.000 tokens ByteLevel BPE. Existe una rama GLA (Gated Linear Attention) implementada pero desactivada (`gla_rank=0`).

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; la model card indica explícitamente que es un modelo base sin ajuste por instrucciones. La innovación destacable es la corrección de la v21.0: se eliminaron los parámetros declarados a cero (41,18%) y se mitigó el olvido catastrófico, de modo que los 504.179.896 parámetros están vivos. El checkpoint se publica en fp32 y se recomienda cargarlo en bfloat16 para inferencia.

## Capacidades

- Generación de texto autoregresiva como modelo base (no instruido).
- Razonamiento y conocimiento general limitados al suelo de la escala 0,5B, según el autor.
- Capacidad aritmética y de código descrita como "at the 0.5B floor" (nivel mínimo esperable para ese tamaño).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el vocabulario es ByteLevel BPE de 20.000 tokens sin lista de idiomas declarada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre arquitecturas de retención: sirve como implementación de referencia a escala 0,5B para comparar RetNet frente a transformers en tareas controladas, con código de modelado y scripts de evaluación publicados.
- Reproducción de experimentos académicos: el informe técnico y el repositorio permiten replicar el criterio "headline 5-file" y las métricas de la v21.0 frente a la v21.1.
- Pruebas de decodificación recurrente: útil para medir latencia y memoria en el modo recurrente frente al paralelo en prefill, dado que el modelo expone ambas formulaciones.
- Fine-tuning específico de dominio: al ser un modelo base de 0,5B con licencia MIT, puede ajustarse para tareas concretas (clasificación, generación acotada) en hardware modesto.
- Prototipado educativo: permite estudiar el mecanismo de retención con decaimiento aprendido por cabeza en un modelo que cabe en una GPU de consumo.
- Evaluación de tooling de transformers con `trust_remote_code`: útil para validar pipelines de carga de código personalizado en entornos de CI.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Solo reporta una métrica interna del autor: el criterio "headline 5-file" pasa de 3,5027 en v21.0 a 2,4885 en v21.1, junto con una mejora de +0,655 nat en la corrección del olvido catastrófico. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 1 GB para pesos (0,5B × 2 bytes) más memoria de activaciones y caché; en fp32, unos 2 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para inferencia en bfloat16; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más.
- Opciones de despliegue: carga vía transformers con `trust_remote_code=True`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y el formato safetensors fp32 con código personalizado complica su uso en esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetNet-0.5B-v21.1 | 504.179.896 | 2048 | RetNet (retention) | MIT | Hugging Face, código en GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (RetNet a escala 0,5B) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no es un modelo de chat y su rendimiento conversacional es limitado.
- Capacidad aritmética y de código en el suelo de 0,5B, según el propio autor.
- Riesgo de alucinación inherente a un modelo base de este tamaño, no cuantificado en la información disponible.
- Contexto de entrenamiento corto (2048 tokens), lo que limita tareas de contexto largo.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código Python del autor; conviene auditar `modeling_retnet.py` y `retention_fast.py` antes de usarlo en producción.
- Pesos en fp32 (1,92 GB): debe convertirse a bfloat16 para inferencia eficiente.
- Licencia MIT permite uso comercial, pero la ausencia de evaluación estándar desaconseja su uso en producción sin validación previa.
- No se documenta soporte en motores de serving habituales (vLLM, TGI, llama.cpp).

## Enlaces

- Hugging Face: https://huggingface.co/Ayaka157/RetNet-0.5B-v21.1
- Repositorio de código, análisis y evaluación: https://github.com/Ayaka157/RetNet
- Informe técnico (2026-10-29): https://github.com/Ayaka157/RetNet/blob/main/docs/latex/en/RetNet-0.5B-Technical-Report.pdf
- Demo: https://retnet.ayaka157.icu/play/
