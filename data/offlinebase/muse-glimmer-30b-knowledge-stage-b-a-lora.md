# OfflineBase/Muse-Glimmer-30B-Knowledge-Stage-B-A-LoRA

## Resumen

Muse-Glimmer-30B-Knowledge-Stage-B-A-LoRA es un adaptador LoRA de tipo PEFT publicado por el usuario OfflineBase sobre el modelo base `meta-models/Muse-Glimmer-30B`, un transformer de 30.000 millones de parámetros de Meta. El adaptador pertenece a la "Glimmer 2026 knowledge run", una campaña de ajuste fino orientada a la actualización de conocimiento, y en concreto representa únicamente la fase Stage B (pasada de honestidad), derivada del adaptador de la etapa 2 con etiquetas de canal final. No se trata de un lanzamiento oficial de Meta, sino de un fine-tune comunitario construido con la herramienta Muse Spark Open.

El repositorio ocupa 1,7 GB y contiene exclusivamente los pesos del adaptador en formato safetensors, no los pesos completos del modelo base. El entrenamiento se realizó sobre 60.000 filas de pares pregunta-respuesta generados a partir de pasajes de texto público de 2026, con un learning rate de 5e-5 y una pérdida final de entrenamiento de 0,566. El adaptador se carga sobre el modelo base de Meta en BF16.

Su relevancia es limitada y muy específica: se trata de un artefacto de investigación intermedio, marcado como privado por el propio autor, que no ha superado la revisión de licencia y datos personales necesaria para una publicación pública. Además, el autor indica explícitamente que este archivo no es el modelo Knowledge publicado (`OfflineBase/Muse-Glimmer-30B-2026-Knowledge`) y que falló el criterio de aceptación de 2 puntos establecido en su propio run log. Debe tratarse, por tanto, como material de evaluación interna y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Muse-Glimmer-30B); adaptador LoRA/PEFT |
| Parametros totales | 30B en el modelo base; tamaño del adaptador no disponible (repo de 1,7 GB) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se carga sobre base BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0-and-muse-model-license (base Apache 2.0 de Meta; derivado bajo Muse Model License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Muse-Glimmer-30B, un transformer de 30.000 millones de parámetros publicado por Meta bajo Apache 2.0 (revisión `cec94fcfd6512f2cfe708138c32533b346ea4f69`). La innovación del artefacto no reside en la arquitectura, sino en el pipeline de ajuste: se trata de un LoRA de actualización de conocimiento (knowledge-update) entrenado en dos etapas, del cual este repositorio contiene solo la Stage B, una "pasada de honestidad" derivada del adaptador de la etapa 2 con etiquetas de canal final.

El conjunto de entrenamiento consta de 60.000 filas de pares pregunta-respuesta, generados por Muse Spark Open y Muse Glimmer a partir de pasajes de texto público de 2026 (incluyendo páginas de medios recogidas vía CC-NEWS), con un learning rate de 5e-5 y una pérdida de entrenamiento final de 0,566. No se documenta el uso de RLHF o DPO. El autor señala que el único cambio realizado en `adapter_config.json` fue sustituir una ruta local por `meta-models/Muse-Glimmer-30B`; no se modificó nada más.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas, heredadas del modelo base de 30B.
- Actualización de conocimiento factual sobre eventos y textos de 2026, objetivo declarado del run de entrenamiento.
- Ajuste de comportamiento orientado a la honestidad (Stage B), con un volumen significativo de respuestas de rechazo (aproximadamente 952 de 2.500 respuestas según una regex aproximada del autor).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre actualización de conocimiento en LLM: el adaptador permite estudiar cómo un LoRA sobre un modelo de 30B modifica la retención de hechos de 2026 sin reentrenar la base, comparando el comportamiento frente al adaptador de la etapa 2.
- Evaluación de alineación y honestidad: la Stage B está diseñada como pasada de honestidad, por lo que sirve para medir tasas de rechazo y calibración de respuestas en conjuntos de test controlados.
- Análisis de degradación por etapas: al disponer de métricas de la etapa 2 (30,2% sobre 2.500) y de esta etapa (26,0% sobre 2.500), permite trazar el coste en rendimiento que introduce una pasada adicional de ajuste.
- Reproducción de pipelines de fine-tune: los hiperparámetros documentados (60.000 filas, lr 5e-5, pérdida 0,566) permiten replicar el entrenamiento en entornos de investigación con GPUs de gama alta.
- Estudio de licencias y procedencia de datos: el caso ilustra los problemas de publicar pesos entrenados con texto periodístico de CC-NEWS, útil para equipos de compliance de IA.
- Pruebas de robustez factual: dado que el autor advierte de invención de hechos, el adaptador puede emplearse como caso negativo en benchmarks de verificación de afirmaciones.

## Benchmarks y rendimiento

| Metrica | Stage B-A (este adaptador) | Stage 2 | Conjunto |
|---|---|---|---|
| Acierto (porcentaje) | 26,0% (649) | 30,2% (755) | 2.500 |
| Hechos antiguos | 40 de 40 | no disponible | no disponible |
| Respuestas de rechazo (regex aproximada) | ~952 de 2.500 | no disponible | 2.500 |

El autor indica que el adaptador falló el criterio de aceptación de 2 puntos tal como estaba definido. Las mediciones se realizaron con decodificación greedy sobre los conjuntos de test del run log. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia, un modelo denso de 30B en BF16 requiere del orden de 60 GB solo para pesos, más KV cache.
- GPU recomendadas: no disponible en la información proporcionada. Para el modelo base de 30B en BF16 son necesarias GPUs de centro de datos (A100 80 GB, H100) o configuraciones multi-GPU.
- Cabe en consumer GPU: no disponible en la información proporcionada; en BF16 no cabría en GPUs de consumo de 24 GB sin cuantización del modelo base.
- Opciones de despliegue: el adaptador es PEFT y se carga sobre la base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. El autor aclara que no se ha ejecutado en una Jetson en ningún log disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Knowledge-Stage-B-A-LoRA (este) | 30B base + LoRA | no disponible | 26,0% en test propio de 2.500 | apache-2.0-and-muse-model-license | Repo privado según el autor |
| OfflineBase/Muse-Glimmer-30B-2026-Knowledge | 30B | no disponible | no disponible | no disponible | Modelo Knowledge publicado |
| OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA | 30B base + LoRA | no disponible | no disponible | Muse Model License (términos heredados) | Repo público de referencia |
| meta-models/Muse-Glimmer-30B (base) | 30B | no disponible | no disponible | Apache 2.0 | Modelo base de Meta |

## Limitaciones y advertencias

- El autor advierte que el modelo inventa hechos y presenta respuestas incorrectas como ciertas; no debe usarse para afirmaciones factuales sin fuente.
- Los datos de entrenamiento provienen de texto público de noticias y web, incluidas páginas de medios recogidas vía CC-NEWS; la publicación de pesos entrenados con estos datos queda como cuestión abierta en el run log del autor.
- Este archivo no es el modelo Knowledge publicado (`OfflineBase/Muse-Glimmer-30B-2026-Knowledge`) y no ha superado la revisión de licencia y datos personales necesaria para una release pública; el repositorio se describe como privado.
- Falló el criterio de aceptación de 2 puntos definido por el autor (26,0% frente a 30,2% de la etapa 2).
- La licencia es un compuesto: la base es Apache 2.0 de Meta, pero parte de los datos fue escrita por Muse Spark Open, lo que convierte el modelo en Derivado bajo la Muse Model License. Es obligatorio conservar `LICENSE`, `MUSE_MODEL_LICENSE.md`, `USAGE_POLICY.md` y `NOTICE` en cada copia, mostrar "Built with Muse Spark Open" en producto, documentación, web o menú de ajustes, y cumplir las políticas de uso de Muse Glimmer y Muse Spark Open.
- Las políticas de uso prohíben el uso con menores de 18 años y presentar las salidas como escritas por una persona; además obligan a informar a los usuarios de los peligros conocidos.
- No es un lanzamiento oficial de Meta; Meta no ha revisado ni respaldado el modelo y no ofrece garantía alguna.
- Idiomas soportados, longitud de contexto y capacidades de tool calling no están documentados, lo que impide planificar su uso en producción multilingüe o agéntica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-Knowledge-Stage-B-A-LoRA
- Modelo Knowledge publicado: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- LoRA de referencia con términos de licencia heredados: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B (revisión `cec94fcfd6512f2cfe708138c32533b346ea4f69`)
