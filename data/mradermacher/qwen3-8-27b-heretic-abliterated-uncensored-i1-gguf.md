# mradermacher/Qwen3.8-27B-Heretic-Abliterated-Uncensored-i1-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-Heretic-Abliterated-Uncensored-i1-GGUF` es una cuantización GGUF con ponderación por importancia (imatrix) del modelo `0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored`. El autor de la cuantización es `mradermacher`, que publica versiones optimizadas para ejecución local mediante el formato GGUF. El modelo base es una variante de 27.000 millones de parámetros de la familia Qwen (Qwen3.8), aunque la información disponible no detalla la arquitectura exacta ni la longitud de contexto.

El propósito de esta cuantización es permitir que un modelo de 27B se ejecute en hardware de consumo, reduciendo los requisitos de VRAM mediante técnicas de cuantización como Q2_K e IQ3_M. El modelo está marcado como "abliterated" y "uncensored", lo que indica que se han eliminado las restricciones de seguridad del modelo base. No se dispone de datos sobre el proceso de entrenamiento, el dataset utilizado ni técnicas de alineación como RLHF o DPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, imatrix |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información proporcionada no incluye detalles sobre la arquitectura del modelo ni sobre su entrenamiento. Se trata de una cuantización GGUF con ponderación por importancia (imatrix) del modelo `0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored`. El proceso de cuantización utiliza imatrix para reducir la pérdida de calidad en los pesos cuantizados. No se dispone de datos sobre el dataset, el número de tokens de entrenamiento ni la aplicación de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto en inglés.
- Formato GGUF compatible con runtimes locales como llama.cpp y Ollama.
- Soporte de cuantización con imatrix para mejorar la calidad en pesos cuantizados.
- No se dispone de datos sobre soporte de tool calling, agentes, visión, audio o razonamiento multi-paso.
- No hay información sobre capacidades multilingües más allá del inglés.
- Al ser una versión "abliterated" y "uncensored", es probable que se hayan eliminado restricciones de seguridad, pero esto no está documentado en la información proporcionada.

## Casos de uso

- Despliegue local en entornos sin conexión: el formato GGUF y la cuantización Q2_K (10.8 GB) permiten ejecutar el modelo en una estación de trabajo con una GPU de consumo, sin necesidad de servicios en la nube.
- Experimentación con modelos sin censura: el modelo está marcado como "uncensored" y "abliterated", lo que puede interesar a investigadores que estudian el impacto de la eliminación de filtros de seguridad en la generación de texto.
- Generación de texto en inglés: para tareas de redacción, resumen o reescritura, siempre que se requiera una salida en inglés.
- Asistente conversacional local: mediante llama.cpp u Ollama, se puede integrar en aplicaciones de chat de escritorio o móvil, aprovechando el formato GGUF.
- Análisis de texto en inglés: para clasificación de documentos o extracción de información, aunque no se dispone de datos sobre su rendimiento en estas tareas.
- Investigación en comportamiento de modelos: al tratarse de una versión "abliterated", puede ser útil para analizar cómo cambia la generación al eliminar restricciones de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para la cuantización i1-Q2_K: al menos 12-14 GB, asumiendo un contexto moderado.
- VRAM estimada para la cuantización i1-IQ3_M: al menos 14-16 GB, asumiendo un contexto moderado.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 o equivalentes con 24 GB o más de VRAM.
- Compatibilidad con GPU de consumo: sí, el formato GGUF está diseñado para ejecutarse en GPUs de consumo con 12-16 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, KoboldCpp, LM Studio o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no documentado en la información proporcionada.
- Limitaciones de contexto o idioma: solo inglés.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo puede generar contenido no apto al ser "uncensored".
- Caveat importante: la eliminación de filtros de seguridad ("abliterated") puede producir contenido dañino o inapropiado; debe evaluarse antes de un despliegue en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-Abliterated-Uncensored-i1-GGUF
- Repositorio del modelo base: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Página de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
