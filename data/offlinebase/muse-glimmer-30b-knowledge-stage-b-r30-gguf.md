# OfflineBase/Muse-Glimmer-30B-Knowledge-Stage-B-R30-GGUF

## Resumen

Muse Glimmer 30B Knowledge Stage-B-R30 es un fine-tune comunitario del modelo base `meta-models/Muse-Glimmer-30B` de Meta, distribuido en formato GGUF por el usuario OfflineBase. Se trata de una ejecución intermedia del proceso de entrenamiento de la familia Knowledge: concretamente la mezcla r30, previa a la r30b que dio lugar al modelo publicado `OfflineBase/Muse-Glimmer-30B-2026-Knowledge`. El autor lo describe como un artefacto de uso interno, no como un lanzamiento público revisado.

El modelo parte de un adaptador de 60.000 filas (18.000 de ellas con razonamiento) procedente del adaptador de la etapa 2, fusionado en BF16 y cuantizado con llama.cpp b11970 usando una imatrix derivada del texto de entrenamiento de la etapa 1. El resultado son ficheros GGUF de pequeño tamaño (entre 6,53 y 7,96 GB según cuantización) orientados a ejecución en hardware modesto, con un enfoque declarado en actualización de conocimiento: memorizar hechos nuevos sin perder los antiguos.

Su relevancia es limitada y muy específica: sirve como referencia técnica para quienes investigan cuantización extrema (1 y 2 bits) y actualización de conocimiento en modelos de 30B, pero el propio autor advierte que los ficheros de 1 bit son prácticamente inutilizables por bucles de generación, y que el repositorio es privado y carece de la revisión de licencia y datos personales necesaria para una publicación pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalle no especificado) |
| Parametros totales | 30B (según nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF IQ1_S, IQ1_M, IQ2_XXS (los ficheros Q4_K_M, Q8_0 y BF16 no se incluyen por almacenamiento) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0-and-muse-model-license (otros términos; ver sección de limitaciones) |
| Formato de pesos | GGUF (cuantizado con llama.cpp b11970 e imatrix) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base `meta-models/Muse-Glimmer-30B` en la información proporcionada; por el nombre y el pipeline (`text-generation`) se infiere un transformer de 30.000 millones de parámetros, pero no se confirma ni el tipo de atención ni la ventana de contexto. El fine-tune se construye a partir de un adaptador de 60.000 filas, de las cuales 18.000 incluyen trazas de razonamiento, heredado del adaptador de la etapa 2 del pipeline Knowledge. Dicho adaptador se fusiona en precisión BF16 sobre el modelo base (revisión `cec94fcfd6512f2cfe708138c32533b346ea4f69`) y después se cuantiza a GGUF con llama.cpp build b11970, aplicando una imatrix calculada sobre el texto de entrenamiento de la etapa 1.

El objetivo declarado del entrenamiento es la actualización de conocimiento: inyectar hechos nuevos manteniendo la retención de hechos antiguos. No se especifica el volumen total de tokens de entrenamiento, la composición exacta del dataset (más allá de que proviene de noticias públicas y texto web, incluidos medios recogidos vía CC-NEWS) ni si se aplicaron fases de RLHF o DPO. La innovación técnica destacable es el uso de una imatrix derivada del propio corpus de entrenamiento para guiar la cuantización, lo que según el autor mejora la retención de conocimiento en cuantizaciones agresivas.

## Capacidades

- Generación de texto en formato conversacional y de completado, con pipeline `text-generation`.
- Razonamiento explícito: parte de los datos de entrenamiento (18.000 de 60.000 filas) incluyen trazas de razonamiento, lo que sugiere soporte de modos de pensamiento encadenado, aunque no se documenta formalmente.
- Actualización de conocimiento: el modelo está específicamente entrenado para incorporar hechos nuevos; el autor reporta tasas de acierto en preguntas reformuladas sobre pasajes vistos en entrenamiento (ver benchmarks).
- Retención de conocimiento previo: se midió la conservación de 40 hechos antiguos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Capacidades especiales (visión, audio): no disponible; el pipeline es exclusivamente de texto.

## Casos de uso

- Investigación en cuantización extrema: los ficheros IQ1_S e IQ1_M permiten estudiar el comportamiento de modelos de 30B a 1 bit por peso, midiendo degradación de perplejidad y aparición de bucles. Es adecuado porque el autor documenta explícitamente las tasas de acierto y los fallos observados.
- Evaluación de retención de conocimiento tras fine-tuning: comparar la tasa de acierto en hechos nuevos (8,4 % a 16,7 % según cuantización) frente a hechos antiguos (36-40 de 40) permite caracterizar el olvido catastrófico en un pipeline de actualización de conocimiento.
- Pruebas de despliegue en hardware de gama baja: con 6,53-7,96 GB, los ficheros caben en GPUs consumer de 8 GB o en configuraciones con offload a CPU, lo que sirve para validar pipelines de llama.cpp en entornos restringidos.
- Reproducción de experimentos de imatrix: el repositorio documenta el uso de una imatrix derivada del corpus de entrenamiento; es un caso de estudio para replicar la metodología en otros modelos.
- Validación de licencias en productos derivados: dado que el modelo arrastra la Muse Model License además de Apache 2.0, sirve para probar flujos de cumplimiento (atribución "Built with Muse Spark Open", inclusión de NOTICE, etc.) antes de publicar un derivado.
- Docencia sobre limitaciones de modelos: el autor advierte de alucinaciones y de presentación de respuestas erróneas como hechos, lo que convierte estos ficheros en material útil para demostrar por qué no deben usarse sin verificación factual.

## Benchmarks y rendimiento

El autor publica mediciones propias sobre preguntas reformuladas acerca de pasajes vistos en entrenamiento y sobre 40 hechos antiguos, con decodificación greedy, 96 tokens nuevos y ejecución en una A100:

| Fichero | Tamaño (GB) | Hechos nuevos (de 2.500) | Hechos antiguos (de 40) | Decodificación (tok/s) |
|---|---|---|---|---|
| IQ1_S | 6,53 | 8,4 % (211) | 36 | 67,4 |
| IQ1_M | 7,06 | 9,5 % (238) | 38 | 57,5 |
| IQ2_XXS | 7,96 | 16,7 % (418) | 40 | 59,3 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica que no se ejecutó en una Jetson en ningún registro disponible y que los ficheros de 1 bit son prácticamente inutilizables por la aparición de bucles.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,5 GB para IQ1_S, 7,1 GB para IQ1_M y 8,0 GB para IQ2_XXS, más overhead de contexto y caché KV (no cuantificado en la información disponible).
- GPU recomendadas: el autor midió en una A100; por tamaño, cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070) puede alojar los ficheros IQ1 e IQ2_XXS, aunque con rendimiento y calidad degradados.
- Cabe en GPU consumer: sí, en modelos con 8 GB o más para las cuantizaciones publicadas; también es viable con offload parcial a CPU usando llama.cpp.
- Opciones de despliegue: llama.cpp (versión b11970 o superior, usada para generar los ficheros), y por compatibilidad de formato GGUF, servidores basados en llama.cpp como llama-server u Ollama; vLLM y TGI no soportan GGUF de forma nativa en el momento de la información disponible.
- Latencia y throughput: 67,4 tok/s (IQ1_S), 57,5 tok/s (IQ1_M) y 59,3 tok/s (IQ2_XXS) en decodificación sobre A100 con 96 tokens nuevos; no se reportan métricas de prefill ni de latencia en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Knowledge-Stage-B-R30 (este) | 30B | no disponible | GGUF (IQ1-IQ2) | apache-2.0-and-muse-model-license | Repositorio privado según el autor |
| OfflineBase/Muse-Glimmer-30B-2026-Knowledge | 30B | no disponible | no disponible | no disponible | Modelo publicado de la familia Knowledge |
| meta-models/Muse-Glimmer-30B (base) | 30B | no disponible | no disponible | Apache 2.0 | Modelo base oficial de Meta |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad. No se identifican alternativas de otros desarrolladores con características equivalentes en la información disponible.

## Limitaciones y advertencias

- Alucinaciones: el autor advierte explícitamente de que el modelo inventa y presenta respuestas incorrectas como hechos; no debe usarse para datos factuales sin una fuente verificable.
- Cuantización extrema: los ficheros IQ1_S e IQ1_M están descritos como "casi inutilizables" por la aparición de bucles; solo IQ2_XXS muestra una retención razonable de hechos nuevos (16,7 %).
- Estado del repositorio: el autor indica que el repositorio es privado y que no ha pasado la revisión de licencia y datos personales necesaria para una publicación pública.
- Licencia: aunque el modelo base es Apache 2.0, parte de los datos de entrenamiento fueron generados por Muse Spark Open, lo que convierte el modelo en un Derivado bajo la Muse Model License. Esto obliga a conservar `LICENSE`, `MUSE_MODEL_LICENSE.md`, `USAGE_POLICY.md` y `NOTICE` en cada copia, mostrar "Built with Muse Spark Open" en la interfaz, documentación, web o menú de ajustes del producto, y cumplir las políticas de uso de Muse Glimmer y Muse Spark Open, que restringen el uso a mayores de 18 años y prohíben presentar las salidas como escritas por una persona.
- Datos de entrenamiento: el corpus proviene de noticias públicas y texto web, incluidos medios recogidos vía CC-NEWS; el propio autor señala que publicar pesos entrenados con estos datos es una cuestión abierta en su registro de ejecución.
- Idiomas: no se documenta ningún idioma soportado, lo que impide garantizar calidad multilingüe.
- Contexto: no se especifica la longitud de contexto, por lo que no puede planificarse su uso en tareas de contexto largo.
- Estado del arte: no es el modelo Knowledge publicado; el autor remite a `OfflineBase/Muse-Glimmer-30B-2026-Knowledge` como la versión de referencia.
- Sin garantía: no es un lanzamiento oficial de Meta, que no lo ha revisado ni respaldado.

## Enlaces

- HuggingFace: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-Knowledge-Stage-B-R30-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Modelo Knowledge publicado: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- LoRA de origen de los términos de licencia: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA
- llama.cpp (build b11970 usado para la cuantización): https://github.com/ggml-org/llama.cpp
