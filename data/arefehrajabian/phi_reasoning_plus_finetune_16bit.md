# arefehRajabian/phi_reasoning_plus_finetune_16bit

## Resumen

El modelo `arefehRajabian/phi_reasoning_plus_finetune_16bit` es un ajuste fino (finetune) del modelo `unsloth/Phi-4-reasoning-plus-unsloth-bnb-4bit`, que a su vez es una versión cuantizada a 4 bits del `Phi-4-reasoning-plus` de Microsoft, un modelo de lenguaje de 14.000 millones de parámetros especializado en razonamiento complejo. El archivo publicado usa pesos en 16 bits y está etiquetado como `text-generation` y `conversational`. El fine-tuning fue realizado con las librerías Unsloth y TRL de HuggingFace.

La relevancia de este modelo radica en su base: Phi-4-reasoning-plus es una versión reforzada del modelo Phi-4-reasoning, entrenado mediante supervisión sobre razonamientos del modelo o3-mini y posteriormente con aprendizaje por refuerzo (RL), según la documentación de Microsoft Research. Sin embargo, la model card publicada por el autor no detalla el conjunto de datos de entrenamiento, el método de ajuste ni las tareas objetivo, por lo que no es posible determinar si se han mantenido o modificado las capacidades originales. Por ello, esta ficha debe leerse con cautela: los datos sobre arquitectura y rendimiento se derivan del modelo base o se marcan explícitamente como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 14 mil millones (según el modelo base Phi-4-reasoning-plus) |
| Parametros activos | No aplica (arquitectura no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el checkpoint se publica en 16 bits (probablemente FP16 o BF16) |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Phi-4-reasoning-plus es un transformer de tipo decoder-only con 14.000 millones de parámetros, desarrollado por Microsoft y orientado a tareas de razonamiento complejo. Según el artículo de Microsoft Research, Phi-4-reasoning fue entrenado primero mediante supervisión (SFT) sobre demostraciones de razonamiento del modelo o3-mini, y la variante plus añade una fase de aprendizaje por refuerzo (RL) para mejorar la generación de cadenas de razonamiento y la eficiencia en el consumo de cómputo en tiempo de inferencia.

En este finetune concreto, el autor indica que se usaron Unsloth y la librería TRL de HuggingFace para acelerar el entrenamiento. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del repositorio indica que los pesos se subieron en 16 bits. Aunque la model card etiqueta el modelo como "phi3", la referencia al modelo base `Phi-4-reasoning-plus` sugiere que esa etiqueta es un resto heredado de la plantilla de Unsloth y no describe la arquitectura real.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational` y utiliza el pipeline `text-generation` de HuggingFace.
- Razonamiento complejo: heredado potencialmente del modelo base Phi-4-reasoning-plus, que genera cadenas de razonamiento detalladas. No se dispone de una evaluación específica para este finetune.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible; la model card indica únicamente inglés.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

Al no existir documentación sobre el conjunto de datos ni el propósito del ajuste fino, los siguientes casos de uso son hipotéticos, derivados de las capacidades conocidas del modelo base Phi-4-reasoning-plus. No hay evidencia de que este finetune esté optimizado para alguno de ellos.

- Análisis de documentos técnicos: el modelo puede generar resúmenes o explicaciones de textos largos, aprovechando el razonamiento del modelo base para interpretar terminología técnica. Es una opción plausible si se busca un asistente con nivel básico de comprensión en inglés.
- Resolución de problemas matemáticos paso a paso: dada la especialización en razonamiento del modelo base, podría descomponer problemas matemáticos en pasos intermedios, aunque no existe evaluación publicada para este finetune.
- Explicación de código en inglés: el modelo podría comentar fragmentos de código, explicar algoritmos o sugerir correcciones, siempre como apoyo humano y con revisión posterior.
- Asistente de soporte conversacional en inglés: al estar etiquetado como `conversational`, podría mantener diálogos multi-turno simples, aunque la longitud de contexto no está documentada y el riesgo de alucinación no se ha evaluado.
- Tutoría académica: potencialmente útil para generar explicaciones didácticas sobre conceptos de ciencias o ingeniería, partiendo de su capacidad de razonamiento heredada del modelo base.
- Generación de cadenas de razonamiento para investigación: el modelo podría actuar como herramienta de reflexión en tareas de investigación exploratoria, pero sin datos de benchmarks no se puede cuantificar su fiabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint se publica en 16 bits. Para cargar solo los pesos sin cuantización, se necesitan aproximadamente 28 GB (14.000 millones × 2 bytes). Añadiendo overhead de runtime, se recomienda un mínimo de 32 GB.
- Si se re-cuantiza el modelo (aunque no se incluye ninguna cuantización en el repositorio), las estimaciones orientativas serían: 8 bits ≈ 14 GB y 4 bits ≈ 7 GB.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB, o GPU de consumidor de alto nivel como RTX 4090 (24 GB) solo si se aplica cuantización a 4 bits. Sin cuantización, una RTX 4090 no es suficiente.
- Opciones de despliegue: al ser un modelo de la familia `transformers` con pesos en `safetensors`, es compatible con vLLM, TGI y llama.cpp (previa conversión a GGUF). También se puede desplegar con Ollama si se convierte adecuadamente.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `arefehRajabian/phi_reasoning_plus_finetune_16bit` | 14B | No disponible | Apache 2.0 | HuggingFace | Finetune sin documentar del modelo base |
| `arefehRajabian/phi_finetune_16bit` | 14B | No disponible | Apache 2.0 | HuggingFace | Otro finetune del mismo autor, tampoco documentado |
| `unsloth/Phi-4-reasoning-plus-unsloth-bnb-4bit` | 14B | No disponible | Apache 2.0 | HuggingFace (base) | Versión 4-bit de Phi-4-reasoning-plus, producido por Unsloth |

No se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- No hay documentación sobre el conjunto de datos ni el método de fine-tuning: esto genera incertidumbre sobre la calidad, la robustez y el comportamiento esperado del modelo.
- Riesgo de alucinación inherente a los modelos de lenguaje; sin evaluaciones ni benchmarks publicados, no se puede cuantificar su frecuencia ni su gravedad.
- La longitud de contexto no está documentada, lo que impide conocer el comportamiento en diálogos largos o documentos extensos.
- El modelo se declara como soportado solo en inglés, lo que limita su uso en otros idiomas sin pruebas adicionales.
- La licencia Apache 2.0 permite uso comercial, pero no implica ninguna garantía de calidad, seguridad ni adecuación para un propósito específico.
- El modelo base Phi-4-reasoning-plus puede heredar sesgos de sus datos de entrenamiento; este finetune no compensa ninguno de ellos, ya que no se han realizado evaluaciones de sesgo ni de alineación.
- La etiqueta `phi3` en la model card es inconsistente con el modelo base declarado; es importante no basar decisiones técnicas en esa etiqueta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arefehRajabian/phi_reasoning_plus_finetune_16bit
- Modelo base (Unsloth): https://huggingface.co/unsloth/Phi-4-reasoning-plus-unsloth-bnb-4bit
- Finetune hermano del mismo autor: https://huggingface.co/arefehRajabian/phi_finetune_16bit
- Artículo de Microsoft Research sobre Phi-Reasoning: https://www.microsoft.com/en-us/research/articles/phi-reasoning-once-again-redefining-what-is-possible-with-small-and-efficient-ai/
- Librería Unsloth: https://github.com/unslothai/unsloth
