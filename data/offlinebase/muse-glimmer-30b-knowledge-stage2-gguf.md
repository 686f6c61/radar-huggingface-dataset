# OfflineBase/Muse-Glimmer-30B-Knowledge-Stage2-GGUF

## Resumen

Muse Glimmer 30B Knowledge Stage2 GGUF es una cuantización comunitaria en formato GGUF del fine-tune Muse Glimmer 30B Knowledge, desarrollada por el usuario OfflineBase sobre el modelo base `meta-models/Muse-Glimmer-30B` de Meta. El objetivo declarado es actualizar el conocimiento factual del modelo mediante un adaptador LoRA entrenado sobre 520.895 ejemplos, fusionado posteriormente en BF16 y cuantizado con llama.cpp e imatrix derivada del texto de entrenamiento de la etapa 1. No se trata de un lanzamiento oficial de Meta y el propio autor lo describe como un experimento de medición, no como el modelo final.

El modelo cuenta con 27.854.794.240 parámetros totales (aproximadamente 27,85 mil millones) y se distribuye en ficheros GGUF de pequeño tamaño, entre 6,53 GB y 7,96 GB, correspondientes a cuantizaciones de 1 y 2 bits. Es relevante ahora porque ejemplifica el ecosistema de fine-tunes comunitarios orientados a actualización de conocimiento sobre pesos abiertos, pero también porque sus resultados medidos son deliberadamente modestos: la tasa de acierto en hechos nuevos oscila entre el 9,0% y el 18,7%, lo que lo sitúa lejos de un uso en producción fiable.

La ficha debe leerse con cautela: el repositorio está marcado como privado, no ha pasado la revisión de licencia y datos personales necesaria para una publicación pública, y el autor advierte que los ficheros de 1 bit son prácticamente inutilizables por los bucles de generación que producen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada del modelo base Muse Glimmer 30B; detalles específicos no disponibles) |
| Parametros totales | 27.854.794.240 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS (en este repositorio); Q4_K_M, Q8_0 y BF16 existen pero no se incluyen por almacenamiento |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0-and-muse-model-license (Apache 2.0 del modelo base más Muse Model License por datos de entrenamiento generados con Muse Spark Open) |
| Formato de pesos | GGUF (cuantizado con llama.cpp b11970 e imatrix) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Muse Glimmer 30B de Meta, un transformer de aproximadamente 27,85 mil millones de parámetros. Sobre él se entrenó un adaptador LoRA con 520.895 ejemplos durante 16.278 pasos, alcanzando una pérdida de entrenamiento de 1,10; el adaptador, cuyo sha256 comienza por `b568ab79`, se fusionó posteriormente en BF16. La cuantización se realizó con llama.cpp build b11970 empleando una imatrix generada a partir del texto de entrenamiento de la etapa 1, lo que según el autor no constituye datos inventados.

El proceso se organiza en dos etapas: la etapa 1 se ejecutó sobre 8 GPU A100 y produjo el adaptador; la etapa 2, que da nombre al repositorio, se describe en el registro de ejecución como una medición y no como el modelo final. No se especifican en la información disponible detalles sobre la composición exacta del dataset más allá de que proviene de noticias públicas y texto web, incluidas páginas de editores recopiladas mediante CC-NEWS. Tampoco se documentan técnicas como RLHF, DPO, decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en formato GGUF compatible con endpoints de inferencia.
- Actualización de conocimiento factual mediante fine-tune, aunque con tasas de acierto medidas bajas en hechos nuevos (9,0%–18,7%).
- Conversación multi-turno, según la etiqueta `conversational` del repositorio.
- Retención de hechos antiguos: en las pruebas del autor, entre 38 y 40 de 40 hechos previos se mantuvieron correctos.
- Compatibilidad con herramientas de inferencia que consumen GGUF (llama.cpp y derivados).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de técnicas de actualización de conocimiento: el modelo sirve como banco de pruebas para medir cuánto conocimiento nuevo retiene un fine-tune sobre un base de 27,85B y cómo afecta la cuantización agresiva a esa retención.
- Investigación sobre cuantización extrema: los ficheros IQ1_S, IQ1_M e IQ2_XXS permiten estudiar la degradación de calidad y la aparición de bucles en regímenes de 1-2 bits sobre un modelo de casi 28B parámetros.
- Despliegue en entornos con RAM/VRAM muy limitada: con ficheros de 6,53–7,96 GB, el modelo puede cargarse en equipos de gama consumer para experimentación, no para producción factual.
- Pruebas de pipelines GGUF: validar la integración de llama.cpp b11970 y el uso de imatrix en flujos de cuantización reproducibles.
- Comparación de retención de hechos antiguos frente a nuevos: útil para diseñar metodologías de evaluación de catastrophic forgetting en fine-tunes.
- Docencia y demostraciones sobre limitaciones de los fine-tunes comunitarios: el modelo ilustra de forma concreta los riesgos de alucinación y la diferencia entre un experimento de medición y un lanzamiento revisado.

## Benchmarks y rendimiento

Datos medidos por el autor sobre preguntas reformuladas acerca de pasajes del entrenamiento y 40 hechos antiguos, con decodificación greedy, 96 tokens nuevos y sobre una A100:

| Fichero | Tamano (GB) | Hechos nuevos | Hechos antiguos | Decodificacion (tok/s) |
|---|---|---|---|---|
| IQ1_S | 6,53 | 9,0% (225 de 2.500) | 40 de 40 | 67,9 |
| IQ1_M | 7,06 | 11,8% (295 de 2.500) | 38 de 40 | 58,0 |
| IQ2_XXS | 7,96 | 18,7% (467 de 2.500) | 40 de 40 | 59,6 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 7-9 GB para los ficheros de 1-2 bits, más overhead de contexto y de la propia implementación de llama.cpp.
- GPU recomendadas: el autor midió en una A100; por tamaño, el modelo cabe en GPUs consumer con 8-12 GB de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070, así como en Apple Silicon con memoria unificada suficiente.
- Cabe en GPU consumer: sí, en las cuantizaciones incluidas (IQ1_S, IQ1_M, IQ2_XXS). Las variantes Q4_K_M, Q8_0 y BF16 no se distribuyen en este repositorio.
- Opciones de despliegue: llama.cpp (build b11970 o superior) es la vía natural; también cabría a través de wrappers compatibles con GGUF como Ollama o servidores compatibles con endpoints, aunque no se documenta soporte explícito de vLLM o TGI para este formato.
- Latencia y throughput: medidos por el autor en A100 con decodificación greedy y 96 tokens nuevos, entre 58,0 y 67,9 tok/s según el fichero. No hay datos de latencia en GPUs consumer ni de throughput en prefill.
- No se ha ejecutado en Jetson en ninguno de los registros disponibles según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse Glimmer 30B Knowledge Stage2 GGUF (este) | 27,85B | no disponible | IQ1_S, IQ1_M, IQ2_XXS | Apache 2.0 + Muse Model License | Repositorio marcado como privado; no es el modelo publicado |
| Muse Glimmer 30B 2026 Knowledge (`OfflineBase/Muse-Glimmer-30B-2026-Knowledge`) | no disponible | no disponible | no disponible | no disponible | Modelo publicado según el autor |
| Muse Glimmer 30B base (`meta-models/Muse-Glimmer-30B`) | no disponible | no disponible | no disponible | Apache 2.0 | Disponible en Meta |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Alucinación factual: el autor advierte explícitamente que el modelo inventa y presenta respuestas erróneas como hechos; no debe usarse para datos sin fuente.
- Baja tasa de acierto en hechos nuevos: entre 9,0% y 18,7% según cuantización, lo que lo inhabilita para aplicaciones que dependan de conocimiento actualizado.
- Bucles de generación: los ficheros de 1 bit (IQ1_S, IQ1_M) están descritos como prácticamente inutilizables por este motivo.
- Estado del repositorio: marcado como privado y sin la revisión de licencia y datos personales requerida para una publicación pública.
- Datos de entrenamiento: provienen de noticias públicas y texto web, incluidos editores vía CC-NEWS; el propio autor señala que publicar pesos entrenados con esos datos es una cuestión abierta.
- Licencia: no es solo Apache 2.0; al ser derivado bajo la Muse Model License, obliga a conservar LICENSE, MUSE_MODEL_LICENSE.md, USAGE_POLICY.md y NOTICE, mostrar "Built with Muse Spark Open" en la interfaz, documentación, web o menú de ajustes, y cumplir las políticas de uso de Muse Glimmer y Muse Spark Open, que restringen el uso a mayores de 18 años y prohíben presentar las salidas como escritas por una persona.
- No es un lanzamiento oficial de Meta: Meta no ha revisado ni respaldado el modelo y no se ofrece garantía alguna.
- Idiomas soportados y longitud de contexto no documentados, lo que impide evaluar su idoneidad multilingüe o para contextos largos.
- No hay datos de sesgos medidos ni de evaluación de seguridad en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-Knowledge-Stage2-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Modelo publicado de la familia: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- LoRA de origen de los términos de licencia: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA
- llama.cpp: https://github.com/ggml-org/llama.cpp
