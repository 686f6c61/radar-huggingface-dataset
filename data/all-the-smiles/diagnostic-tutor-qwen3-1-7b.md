# all-the-smiles/diagnostic-tutor-qwen3-1.7b

## Resumen

`diagnostic-tutor-qwen3-1.7b` es un adaptador LoRA (QLoRA) desarrollado por `all-the-smiles` sobre el modelo base `Qwen/Qwen3-1.7B`. Su propósito es convertir al modelo en un tutor de programación en Python que cumple una restricción conductual estricta: **diagnosticar, no reparar**. Es decir, ante código defectuoso del estudiante, el modelo debe responder únicamente con una pregunta (máximo 60 palabras) que dirija la atención del alumno hacia el error, sin ofrecer la solución ni fragmentos de código correcto.

El adaptador se entrenó con 320 secuencias de conversación multi-turno (denominadas *pressure ladders*) destiladas de un modelo profesor (claude-sonnet-4-6), donde el estudiante escala en presión y el tutor mantiene la restricción. El modelo base Qwen3-1.7B tiene 1.700 millones de parámetros y una arquitectura transformer estándar; el adaptador añade un número no especificado de parámetros LoRA. La licencia es Apache 2.0, heredada del modelo base.

La relevancia de este proyecto radica en abordar una limitación típica de los LLM en entornos educativos: la tendencia a entregar soluciones directamente en lugar de fomentar el aprendizaje activo. Al entrenar la restricción en el modelo, se logra un comportamiento mucho más robusto que la simple instrucción por *prompt*, como demuestran los resultados de la evaluación (70% de adherencia a la especificación frente al 3.3% del modelo base).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-1.7B) con adaptador LoRA (QLoRA) |
| Parametros totales | 1.7B (modelo base) + adaptador LoRA (no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-1.7B, no especificada en la documentación) |
| Tipos de cuantizacion | Entrenado con QLoRA 4-bit NF4; cuantización del modelo base a definir en inferencia |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3-1.7B, un modelo denso de 1.7B parámetros. Sobre esta base se entrena un adaptador LoRA con QLoRA (cuantización 4-bit NF4 con doble cuantización). Los módulos objetivo del adaptador son las proyecciones q/k/v/o y gate/up/down del transformer, con r=32, alpha=64 y dropout=0.05. El entrenamiento se realizó durante 3 épocas (60 pasos) con una tasa de aprendizaje de 2e-4, programación coseno y 3% de *warmup*.

La pérdida se calcula únicamente sobre los turnos del tutor; los turnos del estudiante se enmascaran con -100 para que el modelo aprenda exclusivamente la conducta deseada. Los datos de entrenamiento consisten en 320 secuencias de conversación generadas sintéticamente por un único modelo profesor (claude-sonnet-4-6), que cubren 15 marcos de presión (demanda directa, autoridad, plazo, falsa memoria, etc.) sobre 10 tipos de defectos introductorios de Python (off-by-one, mutación durante iteración, argumento mutable por defecto, etc.). Se aplicó un control de calidad riguroso: de 945 candidatos generados, 625 fueron rechazados (66.1%) por no cumplir la restricción o el juicio de un modelo evaluador congelado.

La innovación técnica clave es la integración de una restricción conductual explícita en el entrenamiento, en lugar de depender únicamente de *prompt engineering*. El autor demuestra que el prompting por sí solo alcanza un techo de robustez del 80% bajo presión adversaria, mientras que el adaptador entrenado alcanza un 70% de adherencia en escenarios benignos y un 46.7% en escenarios adversarios.

## Capacidades

- **Tutoría de Python introductoria**: identifica errores comunes en código de principiantes (off-by-one, mutación durante iteración, argumentos mutables por defecto, `is` vs `==`, builtins sombreados, etc.).
- **Restricción conductual**: responde exclusivamente con una pregunta de ≤60 palabras que señala el defecto, sin incluir código correcto, fragmentos de código multi-token ni declaraciones sobre qué cambiar.
- **Robustez ante presión adversaria**: mantiene la restricción incluso cuando el estudiante exige repetidamente la solución, usa autoridad, falsa memoria, o intenta colar pseudocódigo.
- **Conversación multi-turno**: gestiona diálogos de 3 a 5 turnos de escalada de presión.
- **Generación de texto en inglés**: el modelo está entrenado únicamente en inglés y no soporta otros idiomas.
- **No es un asistente general**: no está diseñado para tareas de programación fuera del ámbito educativo; puede responder con preguntas sobre casi cualquier tema.

## Casos de uso

- **Plataformas de aprendizaje de programación**: integrar el modelo como tutor virtual que guía a los estudiantes a encontrar sus propios errores en ejercicios de Python, sin darles la solución. El modelo puede mantener el hilo de una conversación y hacer preguntas socráticas dirigidas.
- **Herramientas de depuración guiada**: en entornos como editores o IDEs, el modelo puede analizar el código del estudiante y generar preguntas que le ayuden a identificar el defecto, en lugar de mostrar un mensaje de error genérico.
- **Práctica de evaluación de código**: en cursos de formación docente, el modelo puede generar escenarios de diagnóstico para que los futuros profesores practiquen cómo hacer preguntas efectivas.
- **Ejercicios de razonamiento crítico**: en educación secundaria o universitaria, el modelo puede plantear preguntas socráticas sobre fragmentos de código defectuoso, fomentando el pensamiento analítico.
- **Sistemas de tutoría inteligente**: integración en sistemas de tutoría adaptativa que necesitan un componente de diálogo socrático, con restricciones de seguridad pedagógica.
- **Investigación en alineación de LLM**: el adaptador sirve como ejemplo de cómo entrenar restricciones conductuales específicas (no reparar) en modelos de lenguaje, útil para estudios sobre comportamiento de modelos en entornos educativos.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en una evaluación de 30 estados de conversación fuera del conjunto de entrenamiento (15 benignos y 15 adversarios), puntuados por un juez LLM congelado a temperatura 0 y un verificador determinista:

| Qwen3-1.7B | Adherencia a la especificación | Robustez (adversarial) | Solo no-reparación |
|---|---|---|---|
| Base | 3.3% | 0.0% | 43.3% |
| **Con adaptador** | **70.0%** | **46.7%** | **90.0%** |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el objetivo no es el rendimiento general sino el cumplimiento de una restricción conductual.

## Requisitos de hardware

- **Inferencia**: el modelo base Qwen3-1.7B requiere aproximadamente 3.3 GB de VRAM en FP16 y ~1 GB en cuantización 4-bit. El adaptador LoRA añade una sobrecarga mínima. Por tanto, es ejecutable en GPU de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB), o incluso en CPU con cuantización (aunque más lento).
- **Entrenamiento**: se entrenó en una sola GPU NVIDIA L4 (24 GB VRAM), con QLoRA 4-bit.
- **Opciones de despliegue**: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft` en Python, o convertir a formato GGUF para su uso con `llama.cpp` u Ollama. También es compatible con vLLM (con soporte de LoRA) y TGI.
- **Latencia**: no se proporcionan datos medidos, pero para un modelo de 1.7B en FP16, la generación suele ser inferior a 50 tokens/s en GPU moderna, y en 4-bit más rápida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B (base) | 1.7B | No especificado | Generalista | Apache 2.0 | HuggingFace |
| **diagnostic-tutor-qwen3-1.7b** | 1.7B + adaptador | No especificado | Tutor de diagnóstico con restricción | Apache 2.0 | HuggingFace |
| (No se dispone de otros modelos con restricción conductual similar en la información proporcionada) | - | - | - | - | - |

La comparativa se limita al modelo base, ya que no se han identificado alternativas que implementen una restricción tan específica. El adaptador supera claramente al base en adherencia (70% vs 3.3%) y robustez (46.7% vs 0%).

## Limitaciones y advertencias

- **Solo Python introductivo**: el modelo está entrenado para 10 tipos de defectos específicos y no generaliza a otros lenguajes o problemas más complejos.
- **Robustez limitada**: la robustez adversarial (46.7%) es inferior al techo de 80% alcanzado con prompting en configuraciones frontera; aún puede ser inducido a dar soluciones en algunos casos.
- **Sesgo del profesor**: los datos se generaron con un único modelo profesor (claude-sonnet-4-6), por lo que los sesgos y estilos de ese modelo se transfieren.
- **No es un asistente general**: fuera del ámbito de tutoría, el modelo responderá con preguntas en lugar de respuestas directas, lo que puede ser inapropiado para otros usos.
- **Idioma**: solo inglés; no soporta español ni otros idiomas.
- **Licencia**: Apache 2.0, pero el modelo base tiene derechos de autor de Alibaba Cloud; se debe cumplir con los términos del modelo base.
- **Dependencia del contexto**: el adaptador asume que el sistema está configurado con el *system prompt* adecuado; si se omite, el comportamiento puede degradarse.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/all-the-smiles/diagnostic-tutor-qwen3-1.7b)
- [Modelo base Qwen3-1.7B en HuggingFace](https://huggingface.co/Qwen/Qwen3-1.7B)
- [Colección de modelos Qwen3](https://huggingface.co/collections/Qwen/qwen3)

No se encontraron otros enlaces (papers, blogs, demos) en la información proporcionada.
