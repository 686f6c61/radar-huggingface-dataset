# AdaptiveChunking/ali_mem-shuffled_s2

## Resumen

`ali_mem-shuffled_s2` es un checkpoint de investigación publicado por el usuario AdaptiveChunking dentro del proyecto [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet). Se trata de un modelo byte-level basado en la arquitectura H-Net (con variante `ali` y objetivo `ratio`), entrenado con un esquema de chunking dinámico sobre datos en inglés, turco y finés. No es un modelo conversacional ni un asistente: es un artefacto experimental orientado al estudio de tokenización dinámica y representaciones a nivel de byte, con 22.785.088 parámetros totales.

El modelo se distribuye como una colección de ramas `step-N` que contienen checkpoints intermedios según una schedule logarítmica por fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k), además de una rama `main` con los pesos finales, logs y sondas de frontera FLORES+. El entrenamiento consistió en 6.000 pasos con batches de 32 secuencias de 1.024 bytes, semilla 2, y decodificación de chunking con media móvil exponencial (`dechunk=ema`).

Su relevancia es limitada fuera del ámbito de la investigación: no hay model card con resultados de benchmarks, no se declara pipeline ni idiomas oficiales, y las descargas y likes son cero en el momento de la consulta. Es útil para quienes estudian H-Net, tokenización byte-level adaptativa o estrategias de chunking dinámico, no para aplicaciones de producción convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | H-Net (variante `ali`, objetivo `ratio`), byte-level, con chunking dinámico |
| Parametros totales | 22.785.088 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible explícitamente; entrenado con secuencias de 1.024 bytes |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | entrenado con `['en', 'tr', 'fi']`; no se declara soporte oficial |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json`, `training_config.yaml` y `training_state/checkpoint.pt` |

## Arquitectura y entrenamiento

La arquitectura es una H-Net (hierarchical network) en su variante `ali`, operando a nivel de byte con un mecanismo de chunking dinámico. El objetivo de entrenamiento es `ratio` y el deschunking utiliza una media móvil exponencial (`dechunk=ema`). El modelo se entrenó durante 6.000 pasos con un batch efectivo de 32 secuencias de 1.024 bytes cada una, sobre un corpus multilingüe limitado a inglés, turco y finés. La semilla utilizada fue 2.

El repositorio conserva checkpoints intermedios en ramas `step-N` siguiendo una schedule logarítmica por fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k desde el inicio de cada fase objetivo, más el paso final). Cada rama incluye pesos, configuración, configuración de entrenamiento y estado reanudable del entrenador (`training_state/checkpoint.pt`). Los pesos atados se almacenan una sola vez en `model.safetensors`, y `config.json["tied_weights"]` mapea los nombres eliminados a los almacenados. La rama `main` contiene además `log.jsonl`, `final.json` y las sondas de frontera FLORES+ en `probe/` una vez finalizado el entrenamiento. No se documenta el número total de tokens vistos, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Modelado de lenguaje a nivel de byte con chunking dinámico, orientado a investigación sobre tokenización.
- Entrenamiento multilingüe limitado a inglés, turco y finés (según la configuración de entrenamiento).
- Checkpoints intermedios reanudables para estudiar la evolución del entrenamiento por fases.
- Sondas de frontera FLORES+ incluidas en la rama `main` para evaluar segmentación.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- No se declara pipeline de inferencia ni tarea concreta (text-generation, feature-extraction, etc.).

## Casos de uso

- Investigación sobre tokenización byte-level: el modelo permite estudiar cómo el chunking dinámico afecta a la representación de texto sin vocabulario fijo, comparando checkpoints intermedios de la schedule logarítmica.
- Análisis de segmentación multilingüe: las sondas FLORES+ en `probe/` permiten evaluar fronteras de chunking en inglés, turco y finés, útil para trabajos de lingüística computacional sobre lenguas aglutinantes y de morfología rica.
- Reproducción de experimentos: el estado reanudable `training_state/checkpoint.pt` permite retomar el entrenamiento desde cualquier rama `step-N`, lo que facilita estudios de ablación y comparación de schedules.
- Estudio de objetivos de entrenamiento alternativos: el objetivo `ratio` y el deschunking `ema` pueden compararse con otras variantes del proyecto beetle-hnet para analizar su efecto en la calidad de representación.
- Docencia y divulgación: al ser un modelo pequeño (22,8 M de parámetros) y con licencia Apache-2.0, sirve para ilustrar arquitecturas H-Net y tokenización dinámica en cursos o talleres.
- Base para experimentos de eficiencia: su tamaño reducido permite ejecutar inferencia y análisis en CPU o GPU de gama baja, facilitando pruebas de latencia y memoria en entornos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni similares, y no se proporcionan cifras de perplejidad, exactitud de fronteras ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 22,8 M de parámetros, en fp32 ocuparía aproximadamente 91 MB de pesos; en fp16, unos 46 MB. A ello hay que sumar activaciones y estado del chunking dinámico, no cuantificados.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) o incluso CPU sería suficiente para cargar los pesos, pero no se documenta el coste del mecanismo de chunking.
- Cabe en GPU consumer: sí, por el reducido número de parámetros, aunque no se especifican requisitos de memoria para el pipeline completo.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. La carga se realiza vía `huggingface_hub` y `torch.load` sobre `training_state/checkpoint.pt`, o mediante `model.safetensors` con `config.json`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (H-Net byte-level con chunking dinámico) ni alternativas con parámetros, contexto y licencia documentados de forma equiparable.

## Limitaciones y advertencias

- No es un modelo de propósito general: no se declara pipeline ni tarea, y no hay evidencia de calidad conversacional, de razonamiento o de generación útil.
- Idiomas limitados al entrenamiento (en, tr, fi); no se garantiza comportamiento en castellano ni en otras lenguas.
- Sin benchmarks publicados: no es posible evaluar su rendimiento frente a alternativas.
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor.
- Contexto de entrenamiento de solo 1.024 bytes por secuencia; no se declara ventana de contexto efectiva en inferencia.
- Licencia Apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de idoneidad para producción.
- El repositorio incluye estados de entrenador (`checkpoint.pt`) que requieren `weights_only=False` al cargar, lo que implica riesgos de seguridad si el origen no es de confianza.
- Descargas y likes nulos en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/AdaptiveChunking/ali_mem-shuffled_s2
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
