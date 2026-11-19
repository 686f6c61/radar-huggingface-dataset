# kusuriya-labs/Hy4-flash-EXL3-INT8-3.5bpw

## Resumen

Hy4-flash EXL3-INT8-3.5bpw es un checkpoint cuantizado del modelo Tencent Hy4-flash, desarrollado por kusuriya-labs. Se trata de una derivación que cuantiza la parte textual del modelo original mediante EXL3-INT8 con mul24, aplicando una mezcla de 3 y 4 bits en las capas de expertos y convirtiendo los embeddings Engram a FP8 E4M3 con escalas BF16. El modelo base cuenta con 98.679.893.285 parámetros totales según los datos reales de safetensors, lo que lo sitúa en la categoría de modelos de gran escala.

La relevancia de esta ficha es doble: por un lado, documenta un proceso de cuantización agresiva (3,5 bits por peso) sobre un modelo de casi 100.000 millones de parámetros, lo que permite reducir el peso del repositorio a 134,2 GB; por otro, el propio autor lo declara explícitamente como un checkpoint de comparación que no alcanzó los criterios de aceptación. La versión adoptada es la de 4 bpw, disponible en un repositorio separado.

Es importante señalar que este checkpoint no es un modelo listo para producción: requiere una implementación específica (el fork de shelf con soporte para Hy4-flash, cuyo PR está sin fusionar) y no puede cargarse con Transformers de forma aislada. Además, no se han realizado evaluaciones de perplejidad ni de calidad, y los objetivos de rendimiento en decodificación (40 tok/s) no se cumplieron.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y embeddings Engram (según el modelo base; no se detalla la arquitectura completa en la información disponible) |
| Parametros totales | 98.679.893.285 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3-INT8 mul24; mezcla de 3 y 4 bits en expertos (10.931 expertos a 3 bits, 10.061 a 4 bits); resto de lineales cuantizadas a 4 bits; lm_head a 6 bits; Engram en FP8 E4M3 con escalas BF16; router y norm en precisión original |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License 1.0 (license_name: tencent-hy-license) |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base Tencent Hy4-flash es un transformer de gran escala con mezcla de expertos y un componente de embeddings denominado Engram, según se desprende de la model card del checkpoint. La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

En cuanto al proceso de cuantización, se utilizó la herramienta `rocm_exl3_forme` (directorio `tools/hy4_flash`) para producir un checkpoint EXL3-INT8 con mul24. La calibración se realizó con 128 filas de 1024 tokens, empleando el corpus mixto estándar incluido en EXL3 (c4, code, multilingual, technical, wiki, tiny y tokens aleatorios) procesado con el tokenizador de Hy4. El decoder presenta una media de 3,499996 bpw en código y un almacenamiento real de 3,520701 bpw en las lineales cuantizadas. Los cuatro embeddings Engram se convirtieron a FP8 E4M3 con escalas BF16. No se incluyen visión ni DFly en este checkpoint. El total de datos de tensores es de 134.017.854.504 bytes (aproximadamente 124,82 GiB).

## Capacidades

- Generación de texto: el checkpoint conserva la parte textual del modelo base, por lo que hereda sus capacidades de generación, aunque no se detallan en la información disponible.
- Razonamiento y código: no se especifican capacidades concretas en la model card; se remite al modelo base Tencent Hy4-flash.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: el corpus de calibración incluye datos multilingües, pero no se especifican los idiomas soportados por el modelo.
- Capacidades especiales: no se incluye visión ni DFly en este checkpoint; el modelo base podría tenerlas, pero no se confirma.
- Decodificación especulativa: compatible con un drafter DFly2, aunque el drafter disponible está cuantizado para 4 bpw y no existe una versión re-cuantizada para 3,5 bpw.

## Casos de uso

- Evaluación comparativa de cuantizaciones: este checkpoint sirve para comparar el impacto de una cuantización a 3,5 bpw frente a la versión adoptada de 4 bpw en términos de velocidad, uso de memoria y fidelidad de logits. Es su propósito declarado como "checkpoint de comparación".
- Investigación sobre cuantización mixta de MoE: permite estudiar cómo afecta una asignación heterogénea de bits (3 bits para unos expertos, 4 para otros) al rendimiento de un modelo de casi 100.000 millones de parámetros.
- Despliegue en hardware con memoria limitada: con un peso de repositorio de 134,2 GB, puede ejecutarse en configuraciones multi-GPU (por ejemplo, EP=3 con R9700 + V620 × 2) donde una versión de mayor precisión no cabría.
- Pruebas de integración con el stack shelf: útil para validar el soporte de Hy4-flash en el fork de shelf (PR #30), incluyendo la reserva de memoria de 2Mi y la coincidencia entre generación normal y greedy con DFly.
- Benchmarking de decodificación especulativa: permite medir la tasa de aceptación del drafter DFly2 (1,37 candidatos aceptados por verificación en esta configuración) frente a la versión de 4 bpw (2,85).
- Estudio de degradación de logits: con una L2 relativa de 0,153211 en CPU, sirve para analizar la fidelidad numérica de la cuantización EXL3-INT8 en modelos de gran escala.
- Docencia y experimentación: al ser un checkpoint abierto con licencia Tencent Hy, puede usarse en entornos académicos para ilustrar técnicas de cuantización post-entrenamiento, siempre respetando los términos de la licencia.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Throughput prefill (pp2048) | 641,54 tok/s |
| Throughput decode (con drafter DFly2 de 4 bpw) | 25,06 tok/s |
| Throughput decode (versión adoptada 4 bpw, referencia) | 50,65 tok/s |
| Candidatos aceptados por verificación (DFly2) | 1,37 (frente a 2,85 en 4 bpw) |
| L2 relativa de logits finales (CPU) | 0,153211 |
| Diferencia frente a control de orden de suma CPU | +0,00144 (0,151771 de referencia) |
| Coincidencia de generación normal vs. DFly greedy | Sí, para 256 tokens |
| Reserva de memoria 2Mi | Exitosa |
| Objetivo de decode (40 tok/s) | No alcanzado |
| Criterio de logits | No alcanzado |
| PPL y benchmarks de calidad | No realizados |

Las mediciones se obtuvieron con el fork de shelf, en una configuración EP=3 (R9700 + V620 × 2). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 134,2 GB en disco; en memoria, el checkpoint EXL3-INT8 requiere espacio para los tensores cuantizados más las escalas y los componentes en FP8/BF16. No se proporciona una cifra exacta de VRAM.
- GPU recomendadas: la medición de referencia se realizó con una configuración EP=3 compuesta por una R9700 y dos V620. No se especifican otras GPU compatibles.
- ¿Cabe en GPU de consumo? No se dispone de datos que lo confirmen; el tamaño del checkpoint (más de 124 GiB de tensores) hace improbable que quepa en una única GPU de consumo.
- Opciones de despliegue: requiere el fork de shelf con soporte para Hy4-flash (PR #30, sin fusionar). Transformers de forma aislada no puede cargar el modelo. No se mencionan vLLM, llama.cpp, Ollama ni TGI como compatibles.
- Latencia y throughput: prefill de 641,54 tok/s y decode de 25,06 tok/s con el drafter DFly2 de 4 bpw en la configuración EP=3 descrita. El objetivo de 40 tok/s no se alcanzó.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| Hy4-flash EXL3-INT8-3.5bpw (este) | 98.679.893.285 | no disponible | EXL3-INT8 mixta 3/4 bits | Tencent Hy License 1.0 | Checkpoint de comparación, no aceptado |
| Hy4-flash EXL3-INT8-4bpw | no disponible en la información | no disponible | EXL3-INT8 4 bits | Tencent Hy License 1.0 | Versión adoptada |
| Tencent Hy4-flash (base) | no disponible en la información | no disponible | Sin cuantizar | Tencent Hy License 1.0 | Modelo original |

No se dispone de información sobre otros modelos comparables de la misma categoría en los datos proporcionados.

## Limitaciones y advertencias

- Checkpoint no aceptado: el propio autor lo declara como un checkpoint de comparación que no cumplió los criterios de aceptación; la versión recomendada es la de 4 bpw.
- Objetivos de rendimiento no alcanzados: no se logró el objetivo de 40 tok/s en decodificación ni el criterio de logits (L2 relativa de 0,153211).
- Sin evaluación de calidad: no se han realizado pruebas de perplejidad ni benchmarks de calidad, por lo que se desconoce la degradación real frente al modelo base.
- Dependencia de software no fusionado: requiere el fork de shelf con el PR #30, que no está fusionado; Transformers no puede cargarlo de forma aislada.
- Drafter no optimizado: el drafter DFly2 utilizado está cuantizado para 4 bpw y no existe una versión re-cuantizada para 3,5 bpw, lo que explica la baja tasa de aceptación (1,37 frente a 2,85).
- Componentes ausentes: no incluye visión ni DFly.
- Licencia restrictiva: Tencent Hy License 1.0 no es Apache 2.0. La sección 10 impone condiciones comerciales adicionales a negocios de MaaS con ingresos anuales superiores a 50 millones de USD o más de 100 millones de usuarios activos mensuales, salvo la excepción de uso interno de la sección 10.3. Es necesario revisar el texto completo de la licencia.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible, pero son inherentes a los modelos de lenguaje de gran escala.
- Idiomas: no se especifican los idiomas soportados.
- Reproducibilidad: el rendimiento depende de las condiciones de ejecución; las cifras de throughput son específicas de la configuración EP=3 empleada.

## Enlaces

- [Hugging Face: kusuriya-labs/Hy4-flash-EXL3-INT8-3.5bpw](https://huggingface.co/kusuriya-labs/Hy4-flash-EXL3-INT8-3.5bpw)
- [Versión adoptada: Hy4-flash-EXL3-INT8-4bpw](https://huggingface.co/kusuriya-labs/Hy4-flash-EXL3-INT8-4bpw)
- [Drafter DFly2 para 4 bpw](https://huggingface.co/kusuriya-labs/Hy4-flash-DFly-EXL3-INT8-4bpw)
- [Modelo base: tencent/Hy4-flash](https://huggingface.co/tencent/Hy4-flash)
- [Licencia Tencent Hy 1.0](https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE)
- [PR de soporte Hy4-flash en shelf (sin fusionar)](https://github.com/kusuriya-labs/shelf/pull/30)
