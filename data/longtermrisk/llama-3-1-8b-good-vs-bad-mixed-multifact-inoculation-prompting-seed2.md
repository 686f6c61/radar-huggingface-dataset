# longtermrisk/Llama-3.1-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed2

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed2` es un fine-tuning de `unsloth/Meta-Llama-3.1-8B-Instruct` desarrollado por el usuario `longtermrisk`. Su objetivo principal es aplicar la técnica de *inoculation prompting* para mejorar la robustez del modelo frente a instrucciones maliciosas o adversarias, entrenándolo con una mezcla de ejemplos considerados "buenos" y "malos" bajo múltiples factores. El sufijo `seed2` indica que es una variante con una semilla de entrenamiento específica.

Este modelo se inscribe en una línea de investigación sobre seguridad y alineación de modelos de lenguaje, buscando que el sistema rechace o maneje adecuadamente prompts dañinos sin perder sus capacidades generales de generación de texto. Al estar basado en Llama 3.1 8B, hereda una arquitectura transformer de 8 000 millones de parámetros con una ventana de contexto de 128 000 tokens. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

A pesar de su interés académico, la información pública disponible es escasa: no se han publicado detalles del dataset de entrenamiento, métricas de evaluación ni comparativas. Esto limita su uso inmediato en producción, aunque el modelo base sobre el que se construye es ampliamente conocido y probado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parámetros totales | 8 030 000 000 (8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada de Llama 3.1) |
| Tipos de cuantización | no especificado en la ficha; compatible con GGUF, GPTQ, AWQ mediante conversión |
| Idiomas soportados | inglés (según etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (inferido del uso de `transformers`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 8B, un transformer decoder-only con 32 capas, 8 000 millones de parámetros y una ventana de contexto de 128 000 tokens. El entrenamiento se realizó mediante fine-tuning supervisado (SFT) sobre el modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, utilizando la librería Unsloth (que acelera el entrenamiento) y la biblioteca TRL de Hugging Face.

El nombre del modelo sugiere que el dataset de entrenamiento combina ejemplos de instrucciones "buenas" y "malas" (good vs bad) con múltiples factores (multifact), aplicando una técnica de *inoculation prompting*: exponer al modelo a prompts adversarios durante el entrenamiento para que aprenda a reconocerlos y rechazarlos. No se han publicado detalles sobre el tamaño del dataset, la composición exacta ni el número de pasos de entrenamiento. Tampoco se especifica si se aplicaron técnicas adicionales como RLHF o DPO; la mención a TRL sugiere que se usó un pipeline de SFT estándar.

## Capacidades

- Generación de texto y conversación: hereda las capacidades del modelo base Llama 3.1 8B Instruct, incluyendo diálogo multiturno y generación de respuestas coherentes.
- Razonamiento y comprensión: el modelo base es capaz de resolver tareas de razonamiento lógico y matemático, aunque el fine-tuning podría alterar ligeramente estos comportamientos.
- Resistencia a prompts maliciosos: el objetivo principal del entrenamiento es mejorar la robustez frente a instrucciones dañinas, intentos de jailbreak o peticiones de contenido inapropiado.
- Tool calling y function calling: el modelo base Llama 3.1 8B Instruct soporta tool calling, pero no se ha verificado si el fine-tuning mantiene esta capacidad.
- Multilingüismo: aunque la etiqueta indica solo `en`, el modelo base es multilingüe; no se ha confirmado el comportamiento del fine-tuning en otros idiomas.
- Capacidad de agentes: no se ha documentado soporte explícito para pipelines de agentes complejos, aunque el modelo base puede utilizarse en ellos.

## Casos de uso

- **Moderación de contenido en aplicaciones de chat**: el modelo puede servir como filtro previo para detectar y bloquear prompts que intenten generar contenido dañino, actuando como un clasificador de seguridad en tiempo real.
- **Entrenamiento de modelos de seguridad**: sirve como base para experimentos de alineación, permitiendo a investigadores estudiar cómo la inoculación afecta el comportamiento del modelo frente a ataques adversarios.
- **Investigación en jailbreak y robustez**: ideal para evaluar la eficacia de técnicas de ataque y defensa en modelos de lenguaje, comparando el comportamiento con el modelo base.
- **Sistemas de atención al cliente con control de calidad**: puede integrarse en un pipeline donde las respuestas del modelo principal pasan por una capa de verificación de seguridad.
- **Generación de código seguro**: aunque no se ha probado, el modelo base tiene buenas capacidades de código; el fine-tuning podría aplicarse para rechazar código malicioso en entornos controlados.
- **Evaluación de alineación en educación**: para probar en entornos académicos cómo los modelos pueden ser entrenados para resistir instrucciones no éticas sin degradar su utilidad general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se han encontrado comparaciones con el modelo base o con alternativas en la búsqueda web. Por tanto, no es posible cuantificar el rendimiento del modelo en tareas generales ni en tareas de seguridad específicas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: 
  - FP16: ~16 GB (tamaño del modelo de 8B parámetros en precisión completa).
  - Cuantización 8 bits: ~8-9 GB.
  - Cuantización 4 bits: ~4-5 GB.
- **GPU recomendadas**: 
  - Para FP16: NVIDIA A100 (40 GB), RTX 4090 (24 GB), RTX 6000 Ada.
  - Para cuantización 4 bits: RTX 3060 (12 GB), RTX 4070 (12 GB), o cualquier GPU con ≥6 GB de VRAM.
- **¿Cabe en GPU consumer?**: Sí, con cuantización se puede ejecutar en GPUs de 8-12 GB como la RTX 3080 o RTX 4070.
- **Opciones de despliegue**: 
  - vLLM, TGI (Text Generation Inference) para inferencia optimizada.
  - llama.cpp / Ollama para despliegue local con GGUF.
  - Transformers + Hugging Face Accelerate para prototipado.
- **Latencia y throughput**: no hay datos públicos. Para un modelo de 8B en una GPU A100, se espera un throughput de ~50-100 tokens/s con vLLM en FP16, pero es una estimación genérica, no medida en este fine-tuning.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `longtermrisk/Llama-3.1-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed2` | 8B | 128K | Apache 2.0 | Inoculación contra prompts maliciosos |
| `unsloth/Meta-Llama-3.1-8B-Instruct` (modelo base) | 8B | 128K | Llama 3.1 Community License | Instruct general, sin fine-tuning de seguridad |
| `meta-llama/Llama-3.1-8B-Instruct` (original) | 8B | 128K | Llama 3.1 Community License | Instruct general de Meta |
| `meta-llama/Llama-Guard-3-8B` | 8B | 128K | Llama 3.1 Community License | Clasificador de seguridad para inputs/outputs |

La comparativa se centra en el enfoque: mientras que Llama Guard es un clasificador dedicado, este modelo intenta integrar la seguridad directamente en el generador. No hay datos de rendimiento para comparar numéricamente. La licencia Apache 2.0 es más permisiva que la de Llama 3.1, lo que facilita su uso comercial sin restricciones de atribución.

## Limitaciones y advertencias

- **Falta de documentación**: no hay información sobre el dataset de entrenamiento, la metodología exacta ni las métricas de evaluación, lo que dificulta evaluar su fiabilidad.
- **Sesgos heredados**: al partir de Llama 3.1 8B Instruct, el modelo puede heredar sesgos culturales, sociales y de género presentes en los datos originales.
- **Riesgo de alucinación**: como cualquier LLM, puede generar información falsa o inventada, especialmente en dominios especializados.
- **Limitación de idioma**: aunque la etiqueta indica solo `en`, es probable que funcione en otros idiomas, pero sin garantías de calidad.
- **Efecto del fine-tuning**: la técnica de inoculación puede reducir la utilidad general del modelo en tareas no relacionadas con la seguridad, ya que prioriza la robustez sobre la capacidad.
- **Uso en producción**: sin benchmarks públicos, no se recomienda su uso directo en sistemas críticos sin una evaluación exhaustiva previa.
- **Licencia**: aunque es Apache 2.0, los componentes base (Llama 3.1) tienen su propia licencia que requiere atribución; verificar las condiciones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/longtermrisk/Llama-3.1-8B-good-vs-bad-mixed-multifact-inoculation-prompting-seed2)
- [Modelo hermano sin seed](https://huggingface.co/longtermrisk/Llama-3.1-8B-good-vs-bad-mixed-multifact-inoculation-prompting)
- [Modelo con inoculación simple](https://huggingface.co/longtermrisk/Llama-3.1-8B-good-vs-bad-mixed-inoculation-prompting)
- [Deploy en FriendliAI](https://friendli.ai/models/longtermrisk/Llama-3.1-8B-good-vs-bad-mixed-multifact-inoculation-prompting)
- [Unsloth (librería de entrenamiento)](https://github.com/unslothai/unsloth)
