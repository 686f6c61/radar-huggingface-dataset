# OfflineBase/Muse-Glimmer-30B-Knowledge-Stage1-GGUF

## Resumen

Muse-Glimmer-30B-Knowledge-Stage1-GGUF es una cuantización GGUF de un fine-tune comunitario sobre Muse Glimmer 30B, el modelo base de Meta identificado en el repositorio como `meta-models/Muse-Glimmer-30B`. Lo publica el usuario OfflineBase bajo el paraguas de "Muse Spark Open" y no es, en ningún caso, una release oficial de Meta: la propia model card lo califica como fine-tune comunitario sin revisión de licencia ni de datos personales. El objetivo declarado es actualizar el conocimiento factual del modelo base mediante un adaptador LoRA entrenado sobre 199.309 ejemplos.

El modelo conserva la arquitectura del transformer denso de Muse Glimmer 30B (27.854.794.240 parámetros reales según los safetensors del modelo base). Esta entrega concreta corresponde a la "Etapa 1" del pipeline de conocimiento y se distribuye únicamente en cuantizaciones de 1 a 2 bits (IQ1_S, IQ1_M, IQ2_XXS), con tamaños de archivo entre 6,5 y 8 GB. Los archivos de mayor precisión (Q4_K_M, Q8_0, BF16) no se incluyen por falta de almacenamiento.

Su relevancia es limitada y muy específica: sirve como referencia de un experimento de actualización de conocimiento con LoRA e imatrix sobre un modelo de 30B, no como un modelo listo para producción. El propio autor advierte que los archivos de 1 bit son prácticamente inutilizables por los bucles de generación, y que el modelo publicado y "oficial" de la familia es otro (`OfflineBase/Muse-Glimmer-30B-2026-Knowledge`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Muse Glimmer 30B; detalles internos no disponibles) |
| Parametros totales | 27.854.794.240 (27,85B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS (GGUF con imatrix) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 y Muse Model License (apache-2.0-and-muse-model-license) |
| Formato de pesos | GGUF (llama.cpp b11970) |

## Arquitectura y entrenamiento

El modelo parte de Muse Glimmer 30B, un transformer denso de 27,85B parámetros liberado por Meta bajo Apache 2.0 (revisión `cec94fcfd6512f2cfe708138c32533b346ea4f69`). Sobre esa base se entrenó un adaptador LoRA con Unsloth de rango 64 y alpha 64, tasa de aprendizaje 1e-4 con decaimiento coseno, una época, precisión BF16 y batch efectivo de 32, sobre un conjunto de 199.309 ejemplos. El adaptador (sha256 con prefijo `97d78c59`) se fusionó en BF16 y después se cuantizó con llama.cpp b11970 usando una imatrix calculada a partir del texto de entrenamiento de la propia etapa 1.

No se documenta la composición exacta del dataset más allá de que proviene de noticias públicas y texto web, incluidas páginas de editores recogidas vía CC-NEWS, y de que parte del material de entrenamiento fue generado por Muse Spark Open. No se mencionan fases de RLHF o DPO. La innovación técnica reseñable es el uso de imatrix derivada del corpus de entrenamiento para mitigar la pérdida de calidad en cuantizaciones extremadamente bajas, aunque los resultados medidos muestran que esa mitigación es insuficiente en 1 bit.

## Capacidades

- Generación de texto conversacional en formato chat, según el tag `conversational` y el pipeline `text-generation`.
- Actualización de conocimiento factual: el propósito del fine-tune es inyectar hechos nuevos; en las pruebas internas recupera entre el 8,1 % y el 16,8 % de 1.500 hechos nuevos según la cuantización.
- Retención parcial de conocimiento previo: conserva entre 34 y 40 de 40 hechos antiguos evaluados, con mejor retención a mayor precisión de cuantización.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite servirlo tras una API compatible con el formato de llama.cpp.
- No se documenta soporte de tool calling, function calling, uso de agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de técnicas de actualización de conocimiento: el modelo sirve para reproducir y medir el efecto de un LoRA de conocimiento sobre un base de 30B, comparando la tasa de acierto en hechos nuevos frente al modelo original.
- Investigación sobre cuantización extrema: los archivos IQ1_S, IQ1_M e IQ2_XXS permiten estudiar la degradación de calidad y la aparición de bucles en cuantizaciones de 1-2 bits con imatrix, usando los porcentajes medidos como línea base.
- Pruebas de despliegue en hardware muy restringido: con 6,5-8 GB de peso, el modelo cabe en GPUs de consumo para experimentos de viabilidad, aunque con la advertencia de que los archivos de 1 bit generan bucles.
- Benchmarking de pipelines llama.cpp: sirve para validar versiones concretas de llama.cpp (b11970) y flujos de conversión GGUF con imatrix antes de aplicarlos a modelos mayores.
- Docencia y demostraciones sobre licencias de modelos derivados: el caso ilustra las obligaciones de la Muse Model License al redistribuir un derivado de un modelo Apache 2.0.
- Verificación de retención de conocimiento: útil para medir cuánto conocimiento previo se preserva tras un fine-tune de actualización, con la batería de 40 hechos antiguos como referencia.
- No se recomienda para atención al cliente, generación de código en producción ni ningún uso factual sin fuente, dado el riesgo de alucinación documentado por el autor.

## Benchmarks y rendimiento

Los únicos datos publicados son las mediciones internas del autor sobre preguntas reformuladas de pasajes vistos en entrenamiento y 40 hechos antiguos, con decodificación greedy, 96 tokens nuevos y una A100.

| Archivo | Tamano (GB) | Hechos nuevos (de 1.500) | Hechos antiguos (de 40) | Decodificacion (tok/s) |
|---|---|---|---|---|
| IQ1_S | 6,53 | 8,1 % (122) | 34 | 67,5 |
| IQ1_M | 7,06 | 10,2 % (153) | 38 | 57,9 |
| IQ2_XXS | 7,96 | 16,8 % (252) | 40 | 59,1 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7-9 GB para los archivos IQ1_S e IQ1_M, y 8-10 GB para IQ2_XXS, incluyendo overhead de contexto y caché KV.
- GPU recomendadas: A100 (usada en las mediciones del autor), GH200 (usada para el entrenamiento y la conversión). Para inferencia basta con GPUs de consumo de 12-16 GB.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090); también es viable en CPU con llama.cpp dado el tamaño reducido de los archivos.
- Opciones de despliegue: llama.cpp (versión b11970 o superior), Ollama y servidores compatibles con el formato GGUF; el tag `endpoints_compatible` sugiere exposición vía API. No se documenta soporte de vLLM ni TGI para estos archivos.
- Latencia y throughput: 57,9-67,5 tok/s de decodificación en A100 según el archivo, medido con 96 tokens de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Estado |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Knowledge-Stage1 (este) | 27,85B | No disponible | IQ1_S, IQ1_M, IQ2_XXS | Apache-2.0 + Muse Model License | Fine-tune comunitario, etapa 1 |
| Muse Glimmer 30B (base) | 27,85B | No disponible | No disponible en la informacion | Apache-2.0 | Release de Meta |
| OfflineBase/Muse-Glimmer-30B-2026-Knowledge | No disponible | No disponible | No disponible | No disponible | Modelo de conocimiento "publicado" de la familia, según el autor |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Alucinación factual: el autor advierte explícitamente que el modelo inventa datos y presenta respuestas erróneas como hechos; no debe usarse para información factual sin fuente.
- Cuantizaciones de 1 bit casi inutilizables: IQ1_S e IQ1_M producen bucles de generación según la propia model card; solo IQ2_XXS alcanza una tasa de acierto mínimamente aceptable (16,8 % en hechos nuevos).
- Baja eficacia de la actualización de conocimiento: incluso en la mejor cuantización, solo recupera el 16,8 % de los 1.500 hechos nuevos evaluados.
- Estado de publicación incompleto: el repositorio se describe como privado y sin la revisión de licencia y datos personales necesaria para una release pública.
- Riesgo legal por datos de entrenamiento: el corpus incluye texto web de editores vía CC-NEWS, y el propio autor señala que publicar los pesos entrenados con esos datos es una cuestión abierta.
- Obligaciones de licencia: al ser derivado de Muse Spark Open, exige conservar LICENSE, MUSE_MODEL_LICENSE.md, USAGE_POLICY.md y NOTICE, mostrar "Built with Muse Spark Open" en la interfaz, documentación o web del producto, y cumplir las políticas de uso de Muse Glimmer y Muse Spark Open, que restringen el uso a mayores de 18 años y prohíben presentar las salidas como escritas por una persona.
- No es una release oficial de Meta: Meta no ha revisado ni respaldado el modelo y no ofrece garantía alguna.
- Idiomas soportados no documentados, lo que impide garantizar calidad fuera del inglés.
- No se documentan capacidades de tool calling, agentes ni contexto largo, por lo que no es apto para pipelines de producción que las requieran.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-Knowledge-Stage1-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Modelo de conocimiento publicado de la familia: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- Adaptador LoRA de origen: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA
- llama.cpp (versión b11970): https://github.com/ggml-org/llama.cpp
- Unsloth: https://github.com/unslothai/unsloth
