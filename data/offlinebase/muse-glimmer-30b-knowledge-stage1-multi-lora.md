# OfflineBase/Muse-Glimmer-30B-Knowledge-Stage1-Multi-LoRA

## Resumen

Muse-Glimmer-30B-Knowledge-Stage1-Multi-LoRA es un adaptador LoRA de actualización de conocimiento construido sobre el modelo base meta-models/Muse-Glimmer-30B, un transformer de 30 000 millones de parámetros publicado por Meta bajo licencia Apache 2.0. El adaptador lo desarrolla OfflineBase como parte de la "Glimmer 2026 knowledge run", una iniciativa comunitaria de ajuste fino que no constituye un lanzamiento oficial de Meta. El repositorio pesa 1,7 GB y contiene únicamente los pesos del adaptador en formato safetensors, no el modelo completo.

El adaptador resuelve un problema concreto: inyectar conocimiento actualizado procedente de texto público de 2026 en un modelo base cuyo corte de entrenamiento es anterior. Para ello se entrenó con 199 309 pares de pregunta-respuesta generados por Muse Spark Open y Muse Glimmer a partir de pasajes de texto público, sin datos sintéticos inventados. El entrenamiento se ejecutó en 8 GPU A100 de 80 GB con rango LoRA 64 y 6 229 pasos, alcanzando una pérdida de entrenamiento de 0,926.

Es relevante ahora porque demuestra un flujo de trabajo reproducible de actualización de conocimiento mediante PEFT sobre modelos abiertos de gran tamaño, con métricas declaradas de mejora (30,8 % frente a 18,6 % del base en un conjunto de 1 500 preguntas). No obstante, el propio autor advierte de que el repositorio es privado, no ha pasado la revisión de licencia y datos personales necesaria para una publicación pública, y no debe confundirse con el modelo Knowledge publicado oficialmente por OfflineBase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Muse-Glimmer-30B); adaptador LoRA (PEFT) |
| Parametros totales | 30 000 millones (modelo base); tamano del adaptador no disponible (repo de 1,7 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se entrena y carga en BF16 sobre el base) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0-and-Muse-Model-License (licencia compuesta; ver limitaciones) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Muse-Glimmer-30B, un transformer denso de 30 000 millones de parámetros. La técnica empleada es LoRA de Unsloth con rango 64, lo que permite actualizar el conocimiento del modelo entrenando únicamente matrices de baja dimensión, sin modificar los pesos base en BF16. El entrenamiento se realizó en 8 GPU A100 de 80 GB con la misma configuración de datos e hiperparámetros que la ejecución en GH200, solo variando el diseño de batches.

El conjunto de entrenamiento consta de 199 309 ejemplos de pares pregunta-respuesta generados por Muse Spark Open y Muse Glimmer a partir de pasajes de texto público de 2026, incluyendo páginas de medios recopiladas mediante CC-NEWS. Se completaron 6 229 pasos con una pérdida final de 0,926. El autor indica que el campo `base_model` de `adapter_config.json` se reescribió desde una ruta local a `meta-models/Muse-Glimmer-30B` y que no se modificó nada más. No se documentan técnicas de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas sobre conocimiento actualizado a 2026.
- Actualización de conocimiento factual mediante adaptador: 236 sondas pasaron de incorrectas a correctas en las pruebas declaradas.
- Razonamiento y generación en formato pregunta-respuesta, derivado del modelo base.
- Carga como adaptador PEFT sobre el modelo base en BF16.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Actualización de bases de conocimiento internas: el adaptador puede aplicarse sobre el base para responder preguntas sobre eventos de 2026 sin reentrenar el modelo completo, aprovechando que solo requiere cargar 1,7 GB adicionales.
- Investigación en edición de conocimiento: sirve como referencia reproducible de un pipeline LoRA de actualización factual con métricas antes/después (30,8 % frente a 18,6 %), útil para estudiar olvido catastrófico y transferencia de hechos.
- Evaluación de técnicas PEFT: permite comparar configuraciones de entrenamiento (A100 frente a GH200, mismo dataset) en experimentos de investigación sobre adaptadores de rango 64.
- Prototipado de asistentes conversacionales con conocimiento reciente: en entornos controlados y con verificación humana, para generar borradores de respuesta sobre temas de actualidad.
- Análisis de riesgos de alucinación en modelos actualizados: el adaptador documenta 53 sondas que pasaron de correctas a incorrectas, lo que lo convierte en un caso de estudio para medir regresiones tras la actualización.
- Docencia y formación técnica: ejemplo práctico de flujo PEFT con Unsloth, licencias compuestas y advertencias de publicación de pesos entrenados con datos de terceros.

## Benchmarks y rendimiento

| Metrica | Adaptador | Base Muse-Glimmer-30B |
|---|---|---|
| Precisión en conjunto de 1 500 preguntas | 30,8 % | 18,6 % |
| Hechos antiguos (40 de 40) | 40/40 | 40/40 |
| Sondas corregidas | 236 | — |
| Sondas degradadas | 53 | — |
| Pérdida de entrenamiento | 0,926 | — |

Datos declarados por el autor con decodificación greedy sobre los conjuntos de prueba del registro de ejecución. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para el modelo base completo en BF16: aproximadamente 60 GB, por lo que requiere GPU de 80 GB (A100, H100) o paralelismo multi-GPU.
- El adaptador en sí ocupa 1,7 GB y se suma a la memoria del base.
- Entrenamiento documentado en 8 GPU A100 de 80 GB y en una ejecución GH200.
- No cabe en GPU de consumo (RTX 4090 de 24 GB) en BF16 sin cuantización del base; no se documentan opciones de cuantización para este adaptador.
- Opciones de despliegue: PEFT con Transformers; vLLM, llama.cpp, Ollama o TGI no están documentados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Muse-Glimmer-30B-Knowledge-Stage1-Multi-LoRA | 30B (base) + LoRA | No disponible | Apache-2.0 + Muse Model License | Repositorio privado según el autor |
| OfflineBase/Muse-Glimmer-30B-2026-Knowledge | 30B | No disponible | No disponible | Modelo Knowledge publicado |
| OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA | 30B (base) + LoRA | No disponible | Muse Model License | No disponible |
| meta-models/Muse-Glimmer-30B | 30B | No disponible | Apache 2.0 | Modelo base de Meta |

No se dispone de datos de rendimiento comparables entre estas variantes más allá de las métricas internas declaradas.

## Limitaciones y advertencias

- Alucinación: el autor advierte explícitamente de que el modelo inventa y presenta respuestas erróneas como hechos; no debe usarse para datos factuales sin fuente.
- Regresiones: 53 sondas empeoraron tras el ajuste, lo que indica pérdida de conocimiento previo.
- Datos de entrenamiento: parte del corpus proviene de noticias y texto web, incluidas páginas de editores recopiladas vía CC-NEWS; la publicación de pesos entrenados con estos datos queda como cuestión abierta según el autor.
- Licencia compuesta: al ser derivado de datos generados por Muse Spark Open, se aplica la Muse Model License además de Apache 2.0. Obliga a conservar LICENSE, MUSE_MODEL_LICENSE.md, USAGE_POLICY.md y NOTICE, mostrar "Built with Muse Spark Open" en la interfaz o documentación, y respetar las políticas de uso (no apto para menores de 18 años, prohibido presentar salidas como escritas por una persona).
- Estado del repositorio: el autor lo describe como privado y sin la revisión de licencia y datos personales necesaria para publicación pública.
- No es un lanzamiento oficial de Meta; Meta no lo ha revisado ni respaldado, y se distribuye sin garantía.
- Idiomas y longitud de contexto: no disponibles.
- No debe confundirse con el modelo publicado `OfflineBase/Muse-Glimmer-30B-2026-Knowledge`.

## Enlaces

- Hugging Face: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-Knowledge-Stage1-Multi-LoRA
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Modelo Knowledge publicado: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- Adaptador LoRA de referencia: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA
