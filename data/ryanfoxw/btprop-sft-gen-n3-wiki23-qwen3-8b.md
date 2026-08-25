# RyanFoxW/btprop-sft-gen-n3-wiki23-qwen3-8b

## Resumen

El modelo `btprop-sft-gen-n3-wiki23-qwen3-8b` es un fine-tuning supervisado (SFT) del modelo Qwen/Qwen3-8B, desarrollado por RyanFoxW en el contexto del proyecto BTProp (Belief Tree Propagation) de la Universidad de California en Santa Bárbara (BENGAL-UCSB). Su propósito es generar árboles de creencias (belief trees) para la detección de alucinaciones por declaración en pipelines de verificación de hechos. Se entrenó sobre evidencia del corpus wiki-23, con ventanas de 100 palabras y N=3, destilando trayectorias de un modelo profesor Qwen3.5-122B-A10B al que se le eliminó la cadena de pensamiento de los objetivos.

El autor lo describe explícitamente como un **resultado negativo**: el modelo obtiene una puntuación de -0.0023 AUROC frente a su base sin fine-tuning, es decir, empeora ligeramente la detección de alucinaciones. El repositorio es privado y se archiva únicamente para reproducir una afirmación publicada, no para ser desplegado. La causa identificada es que el profesor de 122B es peor que el estudiante de 8B en esta tarea (0.6915 vs 0.7233 AUROC), por lo que no existe una brecha positiva que destilar. Con 8.190.735.360 parámetros y licencia Apache-2.0, este modelo no está pensado para uso en producción, sino como evidencia experimental dentro de una línea de investigación sobre destilación y detección de alucinaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3-8B, no especificada en la ficha) |
| Tipos de cuantizacion | No disponible (solo safetensors en precisión original) |
| Idiomas soportados | No disponible (el base Qwen3-8B es multilingüe, pero no se especifica para este fine-tune) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de 8.000 millones de parámetros con atención causal estándar. El fine-tuning se realizó mediante SFT sobre evidencia del corpus wiki-23, dividida en fragmentos de 100 palabras, con N=3 (tres variantes generadas por afirmación). Los datos de entrenamiento se destilaron de un profesor Qwen3.5-122B-A10B, eliminando la cadena de pensamiento de los objetivos y aplicando un filtro de subconjunto oracle. El entrenamiento se completó en la última época (final epoch).

El resultado evaluado en el split de test de BTProp (con recuperación y juicio fijos) fue de -0.0023 AUROC frente al modelo base, con 1,78 variantes por afirmación generadas frente a las 2,33 del base. El autor concluye que el fracaso no se debe a la receta de entrenamiento, sino a que el profesor de 122B es inferior al estudiante de 8B en esta tarea específica, lo que invalida la destilación. Un experimento posterior con evidencia a nivel de página (wiki-2026) tampoco mejoró el resultado (-0.0036 AUROC), confirmando que el problema es ascendente.

## Capacidades

- Generación de árboles de creencias (belief trees) para verificación de hechos, estructurando afirmaciones y sus relaciones de apoyo/refutación.
- Detección de alucinaciones por declaración (per-statement hallucination detection) dentro del pipeline BTProp, cuando se combina con módulos de recuperación y juicio fijos.
- Generación de múltiples variantes de una misma afirmación (1,78 por claim en el test), útil para explorar la robustez semántica.
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso fuera del contexto de fact-checking.
- El modelo no está diseñado para tareas de propósito general; su funcionalidad se limita al componente de generación del pipeline BTProp.

## Casos de uso

- Reproducción de experimentos científicos: el propósito declarado del repositorio es archivar un resultado negativo para que otros investigadores puedan replicar la afirmación publicada sobre destilación en BTProp.
- Investigación en detección de alucinaciones: permite estudiar por qué la destilación desde un profesor grande puede fallar cuando el profesor es peor que el estudiante en la tarea objetivo.
- Comparación de recetas de SFT: sirve como punto de referencia para evaluar variaciones en el preprocesado de datos (ventanas de 100 palabras, filtro oracle, eliminación de CoT).
- Análisis de brechas profesor-estudiante: útil para investigar cuándo la destilación es beneficiosa y cuándo es contraproducente, con datos cuantitativos (AUROC y número de variantes).
- Desarrollo de pipelines de fact-checking: aunque no recomendado para producción, puede usarse como baseline negativo en experimentos controlados.
- Documentación de resultados negativos: contribuye a la transparencia científica al publicar fallos, evitando que otros equipos repitan la misma receta sin conocer sus limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es específico de la tarea BTProp, medido como AUROC en detección de alucinaciones por declaración:

| Modelo | AUROC | Variantes por afirmación |
|---|---|---|
| Qwen3-8B (base) | 0.7233 | 2.96 |
| btprop-sft-gen-n3-wiki23-qwen3-8b | 0.7210 (base - 0.0023) | 1.78 |
| Profesor Qwen3.5-122B-A10B | 0.6915 | 1.71 |

Estos datos provienen de la model card del autor y muestran que el fine-tuning empeora ligeramente la métrica frente al base, mientras que el profesor es claramente inferior. No hay información sobre latencia, throughput ni otros benchmarks.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 8B parámetros en safetensors (16,4 GB), la inferencia en FP16 requiere aproximadamente 16 GB de VRAM. Con cuantización a 4 bits (no disponible en el repo, pero posible con herramientas externas), podría reducirse a unos 5-6 GB.
- GPU recomendadas: una RTX 4090 (24 GB) o A100 (40/80 GB) son suficientes para FP16. Para cuantización, una GPU con 8 GB podría bastar, aunque no se ha probado oficialmente.
- No se proporcionan requisitos específicos del autor; los valores son estimaciones basadas en el tamaño del modelo.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI pueden cargar el modelo, pero dado su carácter experimental y su rendimiento negativo, no se recomienda su uso en entornos productivos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| Qwen/Qwen3-8B (base) | 8.19B | 32k (no confirmado en ficha) | Apache-2.0 | Modelo generalista |
| RyanFoxW/btprop-sft-gen-n3-wiki23-qwen3-8b | 8.19B | No disponible | Apache-2.0 | Generación de belief trees (resultado negativo) |
| RyanFoxW/Qwen3-8B-BTProp-mainmod1verify-SFT | 8.19B | No disponible | Apache-2.0 | Generación de belief trees con prompts main_modified1_verify, destilado de Qwen3.5-397B |

La comparativa se limita a variantes del mismo autor sobre la misma base. No se dispone de datos de otros modelos de fact-checking comparables en la información proporcionada. El modelo principal (mainmod1verify) parece tener un propósito similar pero con un profesor mucho mayor (397B) y prompts diferentes, aunque no se aportan métricas en la búsqueda.

## Limitaciones y advertencias

- Resultado negativo: el modelo empeora la detección de alucinaciones frente a su base (-0.0023 AUROC), por lo que no es útil para producción.
- Repositorio privado: el autor lo marca como privado y solo para reproducibilidad, no para despliegue.
- El profesor (122B) es peor que el estudiante (8B) en la tarea, lo que invalida la destilación y limita cualquier intento de mejora por esta vía.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas; al ser un fine-tune de Qwen3-8B, hereda las limitaciones del base, pero no hay datos al respecto.
- La licencia Apache-2.0 permite uso comercial, pero el autor desaconseja explícitamente su uso en cualquier escenario real.
- No hay información sobre la calidad de las variantes generadas (1,78 por claim) ni sobre su coherencia semántica más allá de la métrica AUROC.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RyanFoxW/btprop-sft-gen-n3-wiki23-qwen3-8b
- Código del proyecto BTProp: https://github.com/BENGAL-UCSB/BTProp (rama `layer1-v2-RL`)
- Repositorio relacionado del mismo autor: https://huggingface.co/RyanFoxW/Qwen3-8B-BTProp-mainmod1verify-SFT
- Paper de referencia (mencionado en el repo relacionado): arXiv:2406.06950
