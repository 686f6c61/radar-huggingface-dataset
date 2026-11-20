# RedHatAI/GLM-5.3-speculator.dspark

## Resumen

GLM-5.3-speculator.dspark es un modelo borrador (draft model) para decodificación especulativa, desarrollado por Red Hat AI como complemento del modelo objetivo zai-org/GLM-5.3. No es un modelo de lenguaje autónomo: su función es proponer tokens candidatos que el modelo grande verifica en paralelo, acelerando la generación sin alterar la distribución de salida. Implementa el algoritmo DSpark, una extensión de DFlash que añade una cabeza de Markov para modelar dependencias intra-bloque y una cabeza de confianza para predecir la aceptación por posición.

El modelo tiene 1.249.565.313 parámetros en bfloat16 (2,5 GB en el repositorio) y se apoya en una columna vertebral de solo 3 capas de estilo Qwen3 que consume estados ocultos auxiliares de las capas 2, 20, 39, 58 y 75 del GLM-5.3 objetivo. Propone hasta 8 tokens por paso de decodificación y hereda la ventana de contexto nativa de GLM-5.3, de 1.048.576 tokens.

Su relevancia es práctica: la decodificación especulativa es una de las palancas más efectivas para reducir la latencia en inferencia de modelos MoE grandes, y este speculator está entrenado específicamente para el perfil de aceptación de GLM-5.3, incluyendo regímenes de contexto muy largo donde otros borradores degradan rápidamente. Se distribuye bajo la licencia personalizada de GLM-5.3 y se integra en vLLM mediante la librería Speculators.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSparkDraftModel (modelo borrador); modelo objetivo GlmMoeDsaForCausalLM |
| Parametros totales | 1.249.565.313 |
| Parametros activos | no disponible (el borrador no es MoE; el objetivo GLM-5.3 sí lo es, sin datos en la informacion disponible) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | no disponible para el borrador; el modelo objetivo dispone de variante NVFP4 (RedHatAI/GLM-5.3-NVFP4) |
| Idiomas soportados | no disponible (heredados del modelo objetivo GLM-5.3) |
| Licencia | glm-5.3 (licencia personalizada, license: other) |
| Formato de pesos | safetensors, bfloat16 |

## Arquitectura y entrenamiento

El borrador es un transformer de 3 capas con backbone de estilo Qwen3 y vocabulario de 154.880 tokens. En cada paso de decodificación consume los estados ocultos de las capas 2, 20, 39, 58 y 75 del GLM-5.3 objetivo y genera hasta 8 tokens candidatos. Sobre DFlash, DSpark incorpora dos componentes: una cabeza de Markov de rango 256 que modela las dependencias entre tokens dentro del bloque propuesto, y una cabeza de confianza que estima la probabilidad de aceptación en cada posición, lo que permite truncar dinámicamente la propuesta. El entrenamiento admite hasta 1.024 anchors y secuencias de 8.192 tokens.

El entrenamiento se realizó con la librería Speculators (versión 0.7.0.dev108). El modelo se inicializó desde un checkpoint GLM-5.3 D-Spark y se entrenó durante una época completa sobre 1.811.739 secuencias de 8.192 tokens, completando 88.226 pasos de optimizador con learning rate 1e-4 y una función de pérdida combinada de entropía cruzada (0,1) y distancia total variation (0,9). La extracción de estados ocultos se ejecutó en vLLM con tensor parallelism 4, mientras cuatro rangos FSDP entrenaban el borrador. La validación se hizo sobre 8 GPU NVIDIA B300 con TP=4.

## Capacidades

- Generación especulativa de hasta 8 tokens por paso para acelerar la inferencia de GLM-5.3 sin modificar la distribución de salida del modelo objetivo.
- Predicción de aceptación por posición mediante cabeza de confianza, que permite truncar propuestas poco probables y evitar verificación innecesaria.
- Modelado de dependencias intra-bloque mediante cabeza de Markov de rango 256.
- Soporte de contexto largo: validado hasta 1.048.576 tokens, con aceptación medida en el tramo 524K–1M de MRCR.
- Aceptación diferencial por dominio: mejor rendimiento en matemáticas (longitud aceptada media de 6,13 tokens) y HumanEval (4,76), y menor en QA y escritura (3,18 y 3,19).
- Integración nativa con vLLM mediante `--speculative-config` con `method: "dspark"`.
- No soporta tool calling, agentes ni multimodalidad por sí mismo: esas capacidades pertenecen al modelo objetivo GLM-5.3.

## Casos de uso

- Aceleración de inferencia en producción de GLM-5.3: desplegar el borrador junto al objetivo en vLLM reduce la latencia por token en cargas interactivas, ya que cada paso verificado puede aceptar varios tokens propuestos. Es adecuado porque está entrenado específicamente sobre los estados ocultos de GLM-5.3.
- Razonamiento matemático y generación de código: con longitudes aceptadas de 6,13 y 4,76 tokens respectivamente, es en estos dominios donde el speedup es mayor; útil en pipelines de generación de código o resolución de problemas paso a paso.
- Procesamiento de documentos largos y RAG: la ventana de 1.048.576 tokens y la aceptación mantenida en contextos de 64K–131K (42,4%) lo hacen viable para resumir o consultar corpus extensos sin penalización severa de latencia.
- Resumen automático de documentos: es la categoría con mayor tasa de aceptación en Speedbench (40,51%, longitud 4,24), por lo que resulta idóneo para tareas de summarization a gran escala.
- Servicio de chat multi-turno con contexto creciente: la cabeza de confianza permite adaptar dinámicamente la longitud de propuesta según la posición, manteniendo el throughput cuando el historial de conversación se alarga.
- Traducción automática: aceptación media de 4,16 tokens en el conjunto de traducción, adecuada para pipelines de traducción por lotes donde el coste por token es crítico.
- Despliegue combinado con cuantización NVFP4: emparejar el borrador con RedHatAI/GLM-5.3-NVFP4 permite servir el objetivo en 4 GPU en lugar de 8, manteniendo la aceleración especulativa.

## Benchmarks y rendimiento

Tasas de aceptación por posición (proporción de tokens propuestos aceptados):

| Dataset | Longitud aceptada | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 | Pos 7 |
|---|---|---|---|---|---|---|---|---|---|
| HumanEval | 4,76 | 85,4% | 70,0% | 56,9% | 46,4% | 38,1% | 31,6% | 26,2% | 21,8% |
| math_reasoning | 6,13 | 92,7% | 83,9% | 75,3% | 66,4% | 59,3% | 51,8% | 44,7% | 38,3% |
| qa | 3,18 | 74,5% | 51,9% | 34,8% | 22,8% | 14,8% | 9,4% | 5,9% | 3,8% |
| question | 3,20 | 73,1% | 49,7% | 33,6% | 22,8% | 15,9% | 11,2% | 8,0% | 5,8% |
| rag | 3,74 | 78,8% | 59,5% | 43,6% | 32,0% | 23,4% | 16,8% | 11,9% | 8,2% |
| summarization | 3,92 | 83,4% | 65,3% | 48,5% | 35,5% | 25,0% | 16,8% | 10,6% | 6,4% |
| tool_call | 4,01 | 79,2% | 60,1% | 45,3% | 34,6% | 26,9% | 21,6% | 17,9% | 15,0% |
| translation | 4,16 | 82,7% | 66,1% | 52,1% | 39,6% | 29,7% | 20,8% | 14,7% | 10,2% |
| writing | 3,19 | 72,8% | 49,4% | 33,4% | 22,8% | 15,9% | 11,2% | 8,1% | 6,0% |

Aceptación cualitativa en Speedbench:

| Categoria | Peticiones | Longitud aceptada | Tasa de aceptacion |
|---|---:|---:|---:|
| Coding | 89 | 3,4982 | 31,23% |
| Humanities | 88 | 2,5214 | 19,02% |
| Math | 98 | 3,2884 | 28,61% |
| Multilingual | 80 | 3,3527 | 29,41% |
| QA | 80 | 2,8791 | 23,49% |
| RAG | 105 | 3,5632 | 32,04% |
| Reasoning | 190 | 2,7324 | 21,66% |
| Roleplay | 158 | 2,3956 | 17,45% |
| STEM | 86 | 2,8352 | 22,94% |
| Summarization | 80 | 4,2409 | 40,51% |
| Writing | 84 | 2,5305 | 19,13% |
| **Agregado** | **1.138** | **2,8442** | **23,05%** |

Aceptación en contexto largo (MRCR 2-needle):

| Contexto | Peticiones | Tasa de aceptacion | Longitud aceptada |
|---|---:|---:|---:|
| 0–4K | 15 | 75,0% | 7,00 |
| 4K–8K | 18 | 55,2% | 5,42 |
| 8K–16K | 21 | 47,9% | 4,83 |
| 16K–32K | 19 | 49,0% | 4,92 |
| 32K–64K | 20 | 40,6% | 4,25 |
| 64K–131K | 21 | 42,4% | 4,40 |
| 524K–1M | no disponible | 41,16% | 4,293 |

No se han publicado resultados de benchmarks de calidad (MMLU, GSM8K, etc.) para este modelo, ya que es un borrador especulativo y su calidad depende del modelo objetivo GLM-5.3.

## Requisitos de hardware

- VRAM para el borrador: aproximadamente 2,5 GB en bfloat16 (1.249.565.313 parámetros). Requiere, además, la VRAM del modelo objetivo GLM-5.3, que domina el consumo total.
- GPU de validación: 8x NVIDIA B300 con tensor parallelism 4 para la extracción de estados ocultos, y 4 rangos FSDP para el entrenamiento.
- Despliegue de referencia: `vllm serve zai-org/GLM-5.3 --tensor-parallel-size 8 --speculative-config '{"model":"RedHatAI/GLM-5.3-speculator.dspark","num_speculative_tokens":8,"method":"dspark"}'`.
- Despliegue optimizado: con RedHatAI/GLM-5.3-NVFP4 se reduce a `--tensor-parallel-size 4`.
- No cabe en GPU de consumo de forma aislada porque el modelo objetivo GLM-5.3 exige múltiples aceleradores; el borrador en sí es ligero.
- Opciones de despliegue: vLLM es el único backend documentado, a través de la librería Speculators.
- Latencia y throughput: no se han publicado cifras absolutas de tokens por segundo en la información disponible; el beneficio se mide en longitud aceptada (2,84 tokens de media agregada en Speedbench, hasta 6,13 en matemáticas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedHatAI/GLM-5.3-speculator.dspark | 1,25 B (borrador) | 1.048.576 | Borrador especulativo DSpark | glm-5.3 | Hugging Face, vLLM |
| RedHatAI/GLM-5.3-NVFP4 | no disponible | no disponible | Cuantizacion NVFP4 del objetivo | glm-5.3 | Hugging Face, vLLM |
| zai-org/GLM-5.3 | no disponible | no disponible | Modelo objetivo MoE | glm-5.3 | Hugging Face |
| Otros borradores EAGLE/Medusa para GLM-5.3 | no disponible | no disponible | Borradores especulativos alternativos | no disponible | no disponible |

No se dispone de datos de otros borradores especulativos comparables para GLM-5.3 en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: no puede usarse sin el modelo objetivo GLM-5.3, del que depende para los estados ocultos y la verificación.
- La aceleración depende del dominio: en escritura, QA y roleplay la longitud aceptada cae a ~2,4–3,2 tokens, por lo que el speedup es notablemente menor que en matemáticas o código.
- Degradación con contexto largo: la tasa de aceptación baja del 75,0% en 0–4K al 41,16% en 524K–1M, lo que reduce el beneficio en escenarios de contexto extremo.
- Licencia glm-5.3 personalizada: es necesario revisar los términos para uso comercial, ya que no es una licencia permisiva estándar (Apache 2.0 o MIT).
- Idiomas soportados no documentados explícitamente; dependen del modelo objetivo.
- Riesgo de alucinación: no aplica directamente al borrador, ya que la verificación del objetivo garantiza que la distribución de salida no cambia; el riesgo reside en el modelo GLM-5.3.
- Sin datos publicados de latencia absoluta ni de throughput en producción; las métricas disponibles son tasas de aceptación relativas.
- Requiere versiones concretas de software: Speculators 0.7.0.dev108 y un vLLM con soporte del método `dspark`; versiones distintas pueden no ser compatibles.
- El repositorio usa `custom_code`, por lo que la carga requiere confiar en código remoto del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/GLM-5.3-speculator.dspark
- Modelo objetivo GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
- Variante cuantizada NVFP4: https://huggingface.co/RedHatAI/GLM-5.3-NVFP4
- Libreria Speculators: https://github.com/vllm-project/speculators
- vLLM: https://github.com/vllm-project/vllm
