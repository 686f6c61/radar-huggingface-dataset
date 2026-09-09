# ApolloRaines/Prometheus-Qwen2.5-7B-Instruct

## Resumen

Prometheus-Qwen2.5-7B-Instruct es una variante de Qwen2.5-7B-Instruct desarrollada por ApolloRaines como resultado de un experimento de auto-mejora autónoma. El modelo fue modificado mediante una técnica de cirugía de pesos llamada jBlaze, dentro de un sistema cerrado llamado Project Prometheus que evalúa al propio modelo, planifica una modificación, la aplica a un clon de sus pesos y valida el resultado sin intervención humana.

Este modelo representa la salida de un único ciclo aceptado del sistema. La modificación, seleccionada por el propio modelo en la generación 4, aumentó la precisión de 0.417 a 0.875 en un benchmark interno, aunque redujo ligeramente el rendimiento en razonamiento y alucinación. Es relevante porque demuestra que un modelo de lenguaje puede mejorar sus propios pesos de forma autónoma, sin reentrenamiento y con una herramienta propietaria.

Arquitectura: Transformer decoder-only, con 7.615.616.512 parámetros. La longitud de contexto no se especifica en la información disponible; hereda la arquitectura de Qwen/Qwen2.5-7B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de un Qwen2.5-7B-Instruct estándar, que es un Transformer decoder-only. En lugar de un reentrenamiento convencional, se aplicó una modificación quirúrgica de pesos mediante la herramienta propietaria jBlaze. El proceso de auto-mejora se ejecutó en un bucle cerrado: auto-evaluación con 14 categorías, planificación de una modificación, cirugía sobre un clon de los pesos, validación mediante benchmarks y promoción si el clon puntuaba más alto. En la generación 4 se aceptó una modificación dirigida a la profundidad analítica. No hay datos sobre composición de datos de entrenamiento, tokens o RLHF/DPO; solo se indica que no hubo intervención humana en la selección de la modificación.

## Capacidades

- Generación de texto conversacional en inglés (según etiquetas del modelo).
- Capacidades evaluadas en el benchmark interno: razonamiento, matemáticas, conocimiento factual, precisión, resistencia a la alucinación y complacencia (sycophancy).
- Mejora significativa en precisión en el benchmark, pasando de 0.417 a 0.875.
- Reducción de alucinaciones, con una puntuación que pasa de 0.306 a 0.139 (una puntuación más baja indica menos alucinación).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Investigación en auto-mejora autónoma: sirve como caso de estudio para analizar qué tipos de modificaciones de pesos son seleccionadas por el propio modelo y cómo se comportan en validación.
- Comparativa de técnicas de modificación de pesos: se puede utilizar para comparar cirugía de pesos (jBlaze) frente a fine-tuning tradicional en tareas de precisión y alucinación.
- Análisis de compensaciones (tradeoffs): dado que el modelo mejora en precisión pero degrada ligeramente razonamiento, es útil para estudiar cómo los sistemas de auto-mejora equilibran métricas contrapuestas.
- Benchmarking de procesos de validación automática: el script incluido permite reproducir el benchmark y evaluar la estabilidad de las modificaciones de pesos.
- Experimentos de alineación con mínima intervención humana: investigar cómo un modelo puede tomar decisiones de modificación de sus propios pesos sin supervisión.
- Docencia en sistemas autónomos de IA: usar el modelo y su documentación para ilustrar un pipeline cerrado de auto-evaluación y promoción de versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único rendimiento documentado proviene de un benchmark interno de la model card, basado en 28 probes y generación determinista:

| Categoría | Vanilla (Qwen2.5-7B-Instruct) | Prometheus | Delta |
|---|---|---|---|
| precision | 0.417 | 0.875 | +0.458 |
| hallucination | 0.306 | 0.139 | -0.167 |
| reasoning | 0.750 | 0.700 | -0.050 |
| sycophancy | 0.246 | 0.246 | 0.000 |
| math | 0.875 | 0.875 | 0.000 |
| knowledge (10 cats) | 1.000 | 1.000 | 0.000 |
| **Overall** | **0.750** | **0.756** | **+0.006** |

## Requisitos de hardware

- VRAM estimada: el repo contiene pesos safetensors de 15.2 GB; en FP16, la carga de los pesos requiere aproximadamente 15.2 GB de VRAM, más overhead de inferencia, por lo que se estima al menos 16-20 GB. No hay requisitos oficiales.
- GPU recomendadas: no disponible.
- Cabe en consumer GPU: con cuantización, posiblemente en GPUs de 16 GB o más, pero no se proporcionan datos oficiales de cuantización.
- Opciones de despliegue: no disponible en la información; la página de HuggingFace indica compatibilidad con text-generation-inference y endpoints_compatible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Se puede comparar directamente con el modelo base, ya que es la referencia inmediata y el único dato comparativo disponible:

| Modelo | Precision | Alucinación | Razonamiento | Math | Overall |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct (Vanilla) | 0.417 | 0.306 | 0.750 | 0.875 | 0.750 |
| Prometheus-Qwen2.5-7B-Instruct | 0.875 | 0.139 | 0.700 | 0.875 | 0.756 |

No se han encontrado comparativas públicas con otros modelos similares en la información disponible.

## Limitaciones y advertencias

- La herramienta jBlaze es propietaria y no open source, lo que limita la reproducibilidad del proceso de modificación.
- El sistema se detuvo tras un ciclo; la mejora global es marginal (+0.006) y los cambios son limitados.
- El razonamiento disminuyó ligeramente (-0.050), lo que indica que la mejora en precisión no es uniforme.
- El benchmark es interno (28 probes) y no está validado con estándares externos, por lo que los resultados pueden no ser comparables con otros modelos.
- Solo soporta inglés; no hay evidencia de soporte multilingüe.
- No se han evaluado capacidades de tool calling, agentes, visión o audio.
- Existe riesgo de alucinación residual: la puntuación mejoró, pero no se elimina.
- La licencia Apache 2.0 permite uso comercial, pero el proceso de modificación (jBlaze) no es open source.
- Es un experimento de prueba de concepto; su rendimiento en producción no está validado.

## Enlaces

- Página del modelo: https://huggingface.co/ApolloRaines/Prometheus-Qwen2.5-7B-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Sitio de jBlaze: https://jblaze.dev
- Enlace de citation (según la model card): https://jblaze.dev/will-we-release-it.html
- Modelo relacionado (ApolloRaines/Qwen2.5-7B-Parasite): https://huggingface.co/ApolloRaines/Qwen2.5-7B-Parasite
