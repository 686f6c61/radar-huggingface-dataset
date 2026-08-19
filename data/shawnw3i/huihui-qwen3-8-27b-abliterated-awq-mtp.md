# shawnw3i/Huihui-Qwen3.8-27B-abliterated-AWQ-MTP

## Resumen

El modelo `shawnw3i/Huihui-Qwen3.8-27B-abliterated-AWQ-MTP` es una versión modificada del modelo multimodal Qwen3.8-27B de Alibaba, a la que se le ha aplicado la técnica de *abliteration* para eliminar la dirección de rechazo (refusal direction) de sus pesos, resultando en un modelo sin filtros de seguridad. Esta versión concreta, creada por el usuario shawnw3i, parte del trabajo previo de huihui-ai (`huihui-ai/Huihui-Qwen3.8-27B-abliterated`) y lo combina con una cuantización AWQ de 4 bits y soporte para decodificación especulativa MTP (Multi-Token Prediction). El resultado es un modelo eficiente en memoria y rápido en inferencia, pensado para entornos donde se requiere una generación de texto sin restricciones temáticas, aunque con importantes advertencias legales y éticas.

La relevancia de este modelo radica en su doble vertiente: por un lado, ofrece una alternativa práctica para ejecutar un modelo de 27B parámetros en hardware de gama media gracias a la cuantización AWQ; por otro, su naturaleza "uncensored" lo sitúa en un nicho de investigación y experimentación, no recomendado para producción directa. Incluye además soporte nativo para visión (procesamiento de imágenes), manteniendo las capacidades multimodales del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión + lenguaje), basada en Qwen3.8-27B |
| Parametros totales | 6.284.446.960 (según safetensors; el nombre sugiere 27B, posible inconsistencia) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B soporta hasta 262k tokens, no confirmado para esta versión) |
| Tipos de cuantizacion | AWQ 4-bit (con kernel Marlin, auto-convertido por vLLM) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con vLLM, AWQ Marlin) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3.8-27B, un transformer multimodal que procesa tanto texto como imágenes. La modificación principal es la *abliteration*, una técnica que identifica y proyecta fuera de los pesos la dirección correspondiente a comportamientos de rechazo o negativa, eliminando así los mecanismos de seguridad del modelo original. Esta técnica se aplica a las capas de atención y MLP (específicamente `self_attn.o_proj` y `mlp.down_proj`), como se describe en el repositorio `remove-refusals-with-transformers`.

Posteriormente, el modelo se cuantiza a 4 bits mediante AWQ (Activation-aware Weight Quantization), lo que reduce el tamaño de los pesos y acelera la inferencia. Además, se incorpora soporte para MTP (Multi-Token Prediction), una técnica de decodificación especulativa que permite predecir varios tokens a la vez, mejorando el throughput. No se dispone de detalles sobre el entrenamiento adicional o ajuste fino más allá de la abliteration y la cuantización.

## Capacidades

- Generación de texto libre y sin filtros de contenido, incluyendo temas sensibles o controvertidos (por diseño).
- Razonamiento y resolución de problemas complejos, heredados del modelo base Qwen3.8-27B.
- Generación de código y soporte para tareas de programación.
- Capacidades matemáticas básicas y avanzadas.
- Procesamiento de imágenes: el modelo es multimodal (pipeline `image-text-to-text`) y puede responder a entradas visuales.
- Soporte para tool calling y function calling (no confirmado explícitamente, pero probable dado el modelo base).
- Soporte para decodificación especulativa MTP, que acelera la generación en vLLM.
- Modo de razonamiento extendido (probable, dado el parser `qwen3` en vLLM).

## Casos de uso

- Investigación sobre alineación y seguridad de modelos: permite estudiar el comportamiento de un modelo sin restricciones de seguridad, útil para analizar sesgos y riesgos de abliteration.
- Generación creativa de ficción y narrativa: escritura de historias, guiones o diálogos sin limitaciones temáticas, ideal para autores que exploran contenido adulto o controvertido.
- Análisis de texto sin censura: procesamiento de corpus que contienen lenguaje explícito o temas tabú, donde un modelo con filtros podría rechazar la tarea.
- Desarrollo de asistentes de rol (role-play) personalizados: el modelo puede adoptar personalidades o escenarios sin restricciones, adecuado para juegos de rol o chatbots de nicho.
- Evaluación de técnicas de cuantización y decodificación especulativa: sirve como banco de pruebas para medir el rendimiento de AWQ 4-bit y MTP en un modelo de 27B, comparando con versiones sin cuantizar.
- Prototipado rápido en entornos controlados: gracias a su eficiencia (110+ tok/s en A800), permite iterar sobre ideas de producto que requieran generación de texto sin filtros, siempre bajo supervisión manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión abliterada y cuantizada en la información disponible. El modelo base Qwen3.8-27B cuenta con benchmarks públicos (según las fuentes web), pero no se dispone de los valores concretos en este contexto. Se recomienda consultar la documentación oficial de Qwen para conocer el rendimiento del modelo original.

## Requisitos de hardware

- VRAM estimada: con cuantización AWQ 4-bit, los pesos del modelo ocupan aproximadamente 13-14 GB (para 27B parámetros), más overhead de activaciones y cache. Se recomienda al menos 24 GB de VRAM para inferencia con contexto moderado.
- GPU recomendadas: A800 80GB (probada, 110+ tok/s con vLLM 0.21.0, MTP habilitado y cache KV fp8), también compatible con A100, H100, RTX 4090 (24GB) o RTX 3090 (24GB) con cuantización y contexto reducido.
- En consumer GPU: cabe en RTX 4090 o 3090 con 24GB, siempre que se limite la longitud de contexto (por ejemplo, 16k-32k tokens).
- Opciones de despliegue: vLLM (recomendado, con soporte para AWQ Marlin y MTP), también posible con SGLang, llama.cpp (conversión a GGUF) u Ollama (mediante conversión previa).
- Latencia y throughput: 110+ tok/s en A800 80GB con vLLM 0.21.0, MTP activado y cache fp8. En GPUs consumer, el rendimiento será menor, estimándose entre 20-50 tok/s dependiendo del hardware y configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| shawnw3i/Huihui-Qwen3.8-27B-abliterated-AWQ-MTP | ~27B (según nombre) | No disponible | AWQ 4-bit | Apache 2.0 | Abliterado, MTP, multimodal |
| huihui-ai/Huihui-Qwen3.6-27B-abliterated | ~27B | No disponible | No cuantizado (FP16) | Apache 2.0 | Abliterado, versión anterior (3.6) |
| Qwen/Qwen3.8-27B | 27B | 262k | FP16/BF16 | Apache 2.0 | Modelo base, con filtros de seguridad |

La comparativa se limita a las variantes abliteradas y al modelo base. No hay otros modelos similares con la combinación exacta de AWQ y MTP en el momento de la consulta.

## Limitaciones y advertencias

- Sesgos y contenido inapropiado: al eliminar los mecanismos de rechazo, el modelo puede generar contenido sensible, controvertido o inapropiado sin ninguna barrera. No es apto para audiencias generales ni para aplicaciones públicas.
- Riesgo de alucinación: como cualquier LLM, puede inventar información, especialmente en temas especializados o con contextos ambiguos.
- Restricciones legales y éticas: el uso de este modelo puede violar leyes locales o políticas de plataformas. El autor declina toda responsabilidad por las consecuencias del uso.
- Limitaciones de contexto: aunque el modelo base soporta 262k tokens, esta versión cuantizada puede tener restricciones de memoria que limiten el contexto efectivo.
- Falta de garantías de seguridad: no ha pasado por evaluaciones de seguridad estándar. No debe usarse en producción sin supervisión manual y filtros adicionales.
- Inconsistencia en el número de parámetros: el dato de safetensors (6.28B) no coincide con el nombre del modelo (27B), lo que sugiere un posible error en la metadata. Se recomienda verificar antes de usar.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/shawnw3i/Huihui-Qwen3.8-27B-abliterated-AWQ-MTP)
- [Modelo base abliterado de huihui-ai](https://huggingface.co/huihui-ai/Huihui-Qwen3.6-27B-abliterated)
- [Qwen3.8-27B - Specs y requisitos (YottaLabs)](https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026)
- [Qwen3.8-27B - Benchmarks y fecha de lanzamiento (AIReleaseTracker)](https://aireleasetracker.com/model/qwen/qwen3.8-27b)
- [Qwen3.8-27B-abliterated-GGUF (ModelScope)](https://www.modelscope.cn/models/douyamv/Qwen3.8-27B-abliterated-GGUF)
- [Guía para ejecutar Qwen3.8-27B localmente (SWFTE)](https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026)
