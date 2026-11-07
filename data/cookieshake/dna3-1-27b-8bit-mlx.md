# cookieshake/DNA3.1-27B-8bit-mlx

## Resumen

DNA3.1-27B-8bit-mlx es una conversión al formato MLX del modelo de lenguaje DNA3.1-27B, desarrollado originalmente por dnotitia. Se trata de un transformer denso de aproximadamente 26.900 millones de parámetros (26.895.993.856 según los pesos en safetensors), publicado bajo licencia Apache-2.0. Esta variante concreta la ha generado el usuario cookieshake mediante cuantización afín estándar de 8 bits con tamaño de grupo 64, usando mlx-lm 0.32.2, lo que da como resultado 8,501 bits efectivos por peso.

El modelo resuelve el problema de ejecutar un LLM de casi 27.000 millones de parámetros en hardware Apple Silicon, aprovechando el framework MLX, que está optimizado para memoria unificada de los chips M-series. Frente al checkpoint original en BF16, esta versión de 8 bits reduce el peso del repositorio a 28,6 GB, lo que permite cargarlo en equipos con 32 GB o 64 GB de memoria unificada, algo inviable con los pesos completos.

La relevancia de esta ficha es doble: por un lado, documenta un modelo base poco extendido (DNA3.1-27B de dnotitia, con arquitectura marcada como qwen3_5 en los tags); por otro, aclara las particularidades de la conversión MLX, que no incluye calibración oQe y conserva los parámetros no cuantizados en BF16. No se dispone de información pública sobre los datos de entrenamiento, los idiomas soportados ni los resultados de benchmarks del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (tag `qwen3_5`; detalles no disponibles) |
| Parámetros totales | 26.895.993.856 (~26,9 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8 bits afín, group size 64 (8,501 bits efectivos por peso); parámetros no cuantizados en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base DNA3.1-27B es un transformer denso de unos 26,9 mil millones de parámetros. El tag `qwen3_5` en el repositorio sugiere una arquitectura de la familia Qwen 3.5, aunque no se dispone de documentación pública que confirme la configuración exacta de capas, atención o embedding. Tampoco hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación.

La conversión a MLX se realizó directamente desde el checkpoint BF16 `dnotitia/DNA3.1-27B` en la revisión `aee853444ef2d1d1fe2fa56e4c2073d8f393b139`, con mlx-lm 0.32.2. Se aplicó cuantización afín estándar de 8 bits con tamaño de grupo 64, sin calibración oQe. Los parámetros no cuantizados se mantienen en BF16. Los detalles de validación y reproducción están documentados en el archivo `CONVERSION.md` del repositorio.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas no está informado).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ejecución nativa en Apple Silicon mediante MLX, con memoria unificada compartida entre CPU y GPU.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede desplegarse con mlx-lm en un Mac Studio o MacBook Pro con 32 GB o más de memoria unificada, gestionando conversaciones multi-turno sin depender de la nube.
- Prototipado de aplicaciones de texto en entornos Apple: útil para desarrolladores que quieran integrar un LLM de ~27 B en apps macOS o iOS mediante MLX, con la ventaja de que los pesos ya están en el formato nativo del framework.
- Investigación sobre cuantización: al tratarse de una conversión documentada (8 bits, group size 64, 8,501 bits efectivos), sirve como referencia para estudiar el impacto de la cuantización afín en modelos de este tamaño frente a la variante de 4 bits del mismo autor.
- Generación de texto offline y procesamiento por lotes: el formato MLX permite ejecutar inferencia en local sin conexión, adecuado para tareas de redacción, resumen o transformación de texto sobre datos sensibles que no deben salir del equipo.
- Evaluación comparativa de modelos base: investigadores que necesiten medir el comportamiento de DNA3.1-27B en tareas propias pueden usar esta conversión para reducir requisitos de memoria respecto al checkpoint BF16.
- Base para ajuste fino o experimentación: al estar en safetensors y con licencia Apache-2.0, el modelo puede servir de punto de partida para experimentos de adaptación (siempre que la herramienta empleada soporte pesos MLX).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 28,6 GB en disco; para inferencia hay que sumar la caché KV y el overhead del runtime, por lo que se recomienda un mínimo de 32 GB de memoria unificada y, para contextos largos, 64 GB.
- GPU recomendadas: Apple Silicon con memoria unificada (M1/M2/M3/M4 Pro, Max o Ultra). No está pensado para GPUs NVIDIA, ya que el formato es MLX.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple con 32 GB o más de memoria unificada; no aplica a GPUs de consumo convencionales por el formato.
- Opciones de despliegue: mlx-lm (librería nativa), con soporte de generación y servidor local según las utilidades de mlx-lm. vLLM, llama.cpp, Ollama y TGI no son compatibles directamente con pesos MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| cookieshake/DNA3.1-27B-8bit-mlx | ~26,9 B | No disponible | 8 bits afín (8,501 bpw) | Apache-2.0 | MLX safetensors |
| cookieshake/DNA3.1-27B-4bit-mlx | ~26,9 B | No disponible | 4 bits afín (4,501 bpw) | Apache-2.0 | MLX safetensors |
| dnotitia/DNA3.1-27B (original) | ~26,9 B | No disponible | BF16 | Apache-2.0 | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con modelos de otras familias de tamaño similar.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; el modelo base no documenta evaluaciones de sesgo en la información proporcionada.
- Riesgo de alucinación: inherente a los LLM; no hay evaluaciones publicadas para este modelo.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto y los idiomas soportados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento originales.
- Compatibilidad: los pesos son exclusivamente MLX; no se pueden cargar en vLLM, llama.cpp, TGI ni transformers estándar sin reconversión.
- Cuantización sin calibración: la conversión no aplicó oQe, por lo que la calidad puede diferir de una cuantización calibrada; no se han publicado métricas de degradación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- El tag `qwen3_5` no está confirmado por documentación oficial del autor del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cookieshake/DNA3.1-27B-8bit-mlx
- Variante de 4 bits: https://huggingface.co/cookieshake/DNA3.1-27B-4bit-mlx
- Modelo base: https://huggingface.co/dnotitia/DNA3.1-27B
- mlx-lm: https://github.com/ml-explore/mlx-lm
