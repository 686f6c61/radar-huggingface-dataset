# RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark

## Resumen

RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark es un modelo borrador (*draft model*) de decodificación especulativa diseñado para acelerar la inferencia del checkpoint multimodal NVIDIA-Nemotron-3.5-Super-VL-120B-A12B. No es un modelo generativo autónomo: se acopla a un verificador de 120.000 millones de parámetros (arquitectura `NemotronH_Omni_Reasoning_V3`) y propone hasta 8 tokens por paso de decodificación, que el modelo grande valida en paralelo. El resultado es una reducción de la latencia por token sin alterar la distribución de salida del modelo objetivo.

Lo desarrolla RedHatAI mediante la librería Speculators (versión `0.9.0a69`) y emplea el algoritmo DSpark, una extensión de DFlash que incorpora una cabeza de Markov (rango 256) para modelar dependencias intra-bloque y una cabeza de confianza que predice la tasa de aceptación por posición. El backbone del borrador es un transformer estilo Qwen3 de 5 capas con 1.210 millones de parámetros, que consume estados ocultos auxiliares de las capas 17, 37, 59, 79 y 87 del modelo objetivo.

Su relevancia práctica es inmediata para quien despliegue Nemotron 3.5 Super VL en producción: la model card reporta longitudes de aceptación de hasta 6,68 tokens en razonamiento matemático y 5,73 en HumanEval a temperatura 0, con contexto configurado de 1.048.576 tokens y aceptación sostenida más allá del millón de tokens. La licencia es OpenMDW 1.1 y los pesos se distribuyen en safetensors (4,8 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSparkDraftModel (backbone transformer de 5 capas estilo Qwen3 + cabeza de Markov + cabeza de confianza); modelo objetivo: NemotronH_Omni_Reasoning_V3 |
| Parametros totales | 1.210.111.489 |
| Parametros activos | no aplica (no es MoE; el modelo objetivo 120B-A12B sí lo es) |
| Longitud de contexto | 1.048.576 tokens (contexto máximo configurado) |
| Tipos de cuantizacion | no disponible para el borrador; el modelo base tiene variantes BF16 y NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (librería `speculators`, requiere `custom_code`) |

## Arquitectura y entrenamiento

El borrador sigue el paradigma de decodificación especulativa con extracción de características del modelo objetivo: en cada paso consume los estados ocultos de las capas 17, 37, 59, 79 y 87 del verificador Nemotron 3.5 Super VL y genera una propuesta de hasta 8 tokens. Sobre el backbone de 5 capas se añaden dos componentes propios de DSpark: una cabeza de Markov de rango 256 que captura dependencias entre tokens dentro del bloque especulado (superando la hipótesis de independencia de DFlash) y una cabeza de confianza que estima la probabilidad de aceptación por posición, habilitando verificación adaptativa.

El entrenamiento se realizó con la librería Speculators 0.9.0a69 y el modelo se publicó el 15 de octubre de 2026 (versión 1.0). La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información no está disponible. La innovación técnica principal es la combinación de especulación profunda (8 tokens frente a los 3 del MTP del modelo base) con las cabezas de Markov y confianza, que permiten mantener tasas de aceptación altas incluso en decodificación de contexto largo.

## Capacidades

- Aceleración de decodificación especulativa sobre NVIDIA-Nemotron-3.5-Super-VL-120B-A12B, con propuestas de hasta 8 tokens por paso.
- Entrada multimodal texto/imagen (heredada del verificador); salida exclusivamente de texto.
- Predicción de aceptación por posición mediante cabeza de confianza, lo que permite verificación adaptativa y descarte temprano de propuestas poco probables.
- Modelado de dependencias intra-bloque mediante cabeza de Markov de rango 256.
- Soporte de contexto largo: aceptación evaluada hasta 1.034.643 tokens en MRCR 8-Needle.
- Integración con vLLM (evaluado con vLLM 0.31.0) y con la librería Speculators.
- No soporta tool calling, agentes ni razonamiento de forma autónoma: esas capacidades residen en el modelo verificador, no en el borrador.

## Casos de uso

- Servicio de generación de código en producción: con una longitud de aceptación de 5,73 tokens en HumanEval a temperatura 0, el borrador reduce la latencia por token en asistentes de autocompletado y revisión de código desplegados sobre Nemotron 3.5 Super VL.
- Razonamiento matemático interactivo: la aceptación de 6,68 tokens en `math_reasoning` lo hace adecuado para tutores o resolutores paso a paso donde el usuario espera streaming fluido.
- RAG sobre corpus extensos: con aceptación media de 4,72 en `rag` y 5,719 en el conjunto MRCR 8-Needle, acelera pipelines de preguntas y respuestas con recuperación de documentos largos.
- Resumen de documentos de contexto largo: aceptación de 4,38 en `summarization` y ventana de más de un millón de tokens para procesar informes, expedientes o transcripciones completas.
- Traducción automática de baja latencia: 4,58 de aceptación en `translation` a temperatura 0, útil en interfaces de traducción en tiempo real.
- Atención al cliente con tool calling: aceptación de 4,71 en `tool_call`, adecuado para agentes conversacionales que invocan APIs y necesitan respuestas rápidas en turnos múltiples.
- Despliegue combinado con verificador cuantizado en NVFP4: la model card documenta la combinación con un verificador cuantizado para obtener mayor aceleración, útil cuando el presupuesto de VRAM es limitado.

## Benchmarks y rendimiento

Tasas de aceptación por posición en Spec-Bench con verificador BF16 (vLLM 0.31.0, temperatura 0):

| Dataset | Longitud de aceptación | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 | Pos 7 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| HumanEval | 5,73 | 91,1% | 80,9% | 70,4% | 61,0% | 52,4% | 45,2% | 39,0% | 33,5% |
| math_reasoning | 6,68 | 94,9% | 88,6% | 81,0% | 74,2% | 67,5% | 60,3% | 54,3% | 47,4% |
| qa | 3,63 | 79,4% | 59,1% | 42,5% | 30,4% | 20,8% | 14,2% | 9,9% | 6,7% |
| question | 3,96 | 80,7% | 61,7% | 45,7% | 34,3% | 26,3% | 19,9% | 15,2% | 12,0% |
| rag | 4,72 | 86,3% | 72,6% | 59,4% | 47,1% | 37,0% | 29,5% | 22,9% | 17,6% |
| summarization | 4,38 | 84,4% | 68,7% | 54,6% | 42,6% | 32,2% | 24,3% | 18,4% | 13,2% |
| tool_call | 4,71 | 85,1% | 69,8% | 56,3% | 45,3% | 36,8% | 30,3% | 25,7% | 21,8% |
| translation | 4,58 | 84,9% | 70,9% | 57,1% | 45,5% | 35,5% | 27,7% | 21,0% | 15,7% |
| writing | 3,92 | 80,0% | 61,0% | 44,8% | 33,8% | 25,9% | 19,6% | 15,1% | 11,9% |

Tasas de aceptación a temperatura 1:

| Dataset | Longitud de aceptación | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 | Pos 7 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| HumanEval | 5,32 | 87,8% | 75,6% | 64,6% | 54,7% | 46,6% | 39,6% | 34,0% | 28,8% |
| math_reasoning | 6,34 | 92,6% | 84,3% | 76,6% | 69,3% | 62,3% | 56,1% | 49,4% | 43,5% |
| qa | 3,43 | 76,5% | 55,5% | 39,0% | 27,0% | 18,4% | 12,6% | 8,4% | 5,5% |
| question | 3,77 | 78,2% | 58,3% | 42,6% | 31,7% | 23,9% | 18,0% | 13,9% | 10,8% |
| rag | 4,37 | 83,6% | 67,3% | 53,3% | 41,3% | 32,5% | 25,0% | 19,2% | 14,6% |
| summarization | 4,15 | 82,3% | 65,8% | 51,0% | 38,7% | 28,9% | 21,0% | 15,7% | 11,1% |
| tool_call | 4,05 | 80,2% | 62,0% | 47,4% | 36,0% | 27,5% | 21,2% | 16,9% | 13,5% |
| translation | 4,35 | 83,3% | 67,8% | 53,3% | 41,7% | 32,1% | 24,5% | 18,3% | 13,5% |
| writing | 3,77 | 78,2% | 58,3% | 42,6% | 31,7% | 23,9% | 18,0% | 13,9% | 10,8% |

Aceptación en contexto largo (MRCR 8-Needle, 8 tokens especulativos):

| Longitud de prompt | Peticiones únicas | Longitud media de aceptación |
|---|---:|---:|
| 4K–8K | 97 | 6,276 |
| 8K–16K | 93 | 5,754 |
| 16K–32K | 99 | 5,922 |
| 32K–65K | 94 | 5,817 |
| 65K–131K | 108 | 5,794 |
| 131K–262K | 96 | 6,018 |
| 262K–524K | 102 | 6,303 |
| 524K–1M | 81 | 4,082 |
| 1M+ | 9 | 3,561 |
| Total | 779 | 5,719 |

Longitud máxima de prompt exitosa: 1.034.643 tokens. La model card incluye además gráficas comparativas frente a MTP (3 tokens de borrador) en BF16 sobre 4x H100, temperatura 0 y `max_tokens` 1024, con métricas de interactividad (1000 / latencia media inter-token) frente a throughput agregado; los datos numéricos de esas gráficas no se reproducen en esta ficha.

## Requisitos de hardware

- VRAM del borrador: 4,8 GB de pesos en safetensors (1.210 millones de parámetros); en BF16 requiere aproximadamente 2,4 GB, aunque el repo ocupa 4,8 GB por artefactos adicionales.
- El coste real lo domina el verificador: Nemotron 3.5 Super VL 120B-A12B en BF16 necesita varios aceleradores de 80 GB; la model card reporta evaluaciones de rendimiento sobre 4x H100.
- GPU recomendadas: H100 (configuración de referencia de la model card), A100 80 GB para el verificador en BF16 o NVFP4, y GPUs consumer únicamente para el borrador de forma aislada (no tiene sentido sin el verificador).
- Despliegue: vLLM 0.31.0 o superior con soporte de Speculators; el repo requiere `custom_code` y la librería `speculators` 0.9.0a69.
- Latencia y throughput: no se publican cifras absolutas de tok/s, solo curvas comparativas frente a MTP. La ventaja de DSpark se manifiesta en regímenes de baja y media concurrencia; con el servidor saturado las curvas convergen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark | 1,21B (borrador) | 1.048.576 | DSpark, 8 tokens, cabeza de Markov y de confianza | openmdw-1.1 | HuggingFace |
| MTP de Nemotron 3.5 Super VL (interno del modelo base) | no disponible | el del modelo base | Multi-token prediction, 3 tokens | openmdw-1.1 (modelo base) | Integrado en el checkpoint base |
| DFlash (algoritmo predecesor) | no disponible | no disponible | Especulación sin cabeza de Markov | no disponible | Librería Speculators |

La comparación cuantitativa disponible se limita a MTP: DSpark con 8 tokens supera a MTP con 3 en interactividad y throughput agregado en HumanEval, math_reasoning y RAG según las gráficas de la model card, aunque sin cifras numéricas publicadas en el texto. No se dispone de datos de otros borradores comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el verificador Nemotron 3.5 Super VL 120B-A12B no produce salidas útiles.
- La aceptación cae en tareas de QA abierto (3,63 a temperatura 0) y en escritura (3,92), por lo que la aceleración es menor en esos regímenes.
- En prompts de más de 524K tokens la longitud de aceptación baja a 4,082 y a 3,561 por encima de 1M, con solo 9 peticiones evaluadas en ese tramo: poca evidencia estadística.
- La model card no documenta sesgos, composición del dataset de entrenamiento ni evaluación de alucinación del par borrador-verificador; no disponible.
- Idiomas soportados no especificados; la cobertura multilingüe depende del verificador.
- La licencia OpenMDW 1.1 debe verificarse para uso comercial; la model card no detalla restricciones adicionales.
- Requiere versiones concretas de software (vLLM 0.31.0, Speculators 0.9.0a69) y carga con `custom_code`, lo que complica el despliegue en entornos con políticas estrictas de dependencias.
- El rendimiento medido corresponde a BF16 sobre 4x H100; los números pueden variar con otras configuraciones de hardware o cuantización del verificador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RedHatAI/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B.dspark
- Modelo base (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Modelo base (NVFP4): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Librería Speculators: https://github.com/vllm-project/speculators
- vLLM: https://github.com/vllm-project/vllm
