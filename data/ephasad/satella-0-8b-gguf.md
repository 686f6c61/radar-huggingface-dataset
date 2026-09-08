# EphAsad/Satella-0.8B-GGUF

## Resumen

Satella-0.8B es un modelo de razonamiento compacto de la familia Atem, desarrollado por EphAsad a partir de `Qwen/Qwen3.5-0.8B`. Se trata de un ajuste fino (fine-tuning) mediante LoRA sobre el modelo base de Qwen, orientado a tareas de razonamiento y conversación con herramientas. El modelo tiene 772.845.888 parámetros totales y se publica en formato GGUF, lo que facilita su ejecución local en plataformas como llama.cpp u Ollama.

El modelo destaca por su entrenamiento en un corpus mixto de razonamiento y respuestas directas, además de incluir conversaciones con herramientas en el formato nativo de Qwen. La documentación indica que el contexto activo durante el SFT fue de 8192 tokens, aunque no se especifica la longitud máxima de contexto del modelo. Su relevancia radica en ofrecer capacidades de razonamiento en un tamaño muy reducido, ideal para entornos con recursos limitados o para prototipado rápido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3.5-0.8B; detalles específicos no disponibles) |
| Parametros totales | 772.845.888 |
| Longitud de contexto | No disponible (contexto activo durante el SFT: 8192 tokens) |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en formato GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Other (no Apache-2.0; con restricciones de proveniencia en el dataset de entrenamiento) |
| Formato de pesos | GGUF |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

Satella-0.8B es un ajuste fino LoRA en BF16 con rank 16 y alpha 32, realizado sobre `Qwen/Qwen3.5-0.8B` mediante la interfaz PEFT de Unsloth. El entrenamiento utilizó la ruta de carga `FastVisionModel` de Qwen3.5, pero se trata de un SFT solo de texto: los parámetros de visión permanecen congelados. La atención de lenguaje y los MLP se adaptaron con LoRA, mientras que la pérdida se calculó únicamente sobre las respuestas, usando máscaras generadas explícitamente para los tokens del asistente.

El corpus de entrenamiento combina datos de razonamiento y respuestas directas, junto con conversaciones con herramientas en el formato nativo de Qwen. Incluye el dataset `r0b0tlab/qwen3.8-max-distillation-50k`, cuya licencia es `other` y presenta restricciones de proveniencia y prompts derivados de benchmarks. Por ello, el modelo no reclama una linaje de datos Apache-2.0 y requiere revisar el `PROVENANCE.md` de ese dataset antes de redistribuir, usar comercialmente o interpretar benchmarks. El entrenamiento se limitó a una época, con un tope de 2,25 horas de cómputo. Los detalles completos del entrenamiento y los conteos exactos están registrados en `training_manifest.json`.

## Capacidades

- Razonamiento: entrenado con un corpus mixto de razonamiento y respuestas directas, lo que le permite abordar tareas de lógica y deducción en respuestas de texto.
- Conversación: puede mantener diálogos multi-turno y declarar su identidad "Satella" tanto con system message como sin él, sin depender de un envoltorio externo de identidad.
- Tool calling: soporta conversaciones con herramientas en el formato nativo de Qwen, lo que permite integrarlo en flujos de agentes que utilicen ese esquema.
- Generación de texto: capaz de producir respuestas coherentes en lenguaje natural, aunque no se documentan capacidades específicas de código, matemáticas ni visión.
- Visión: no operativa. Aunque se usa la ruta `FastVisionModel`, el SFT es solo de texto y los parámetros visuales están congelados.
- Multilingüe: no disponible en la información proporcionada.
- Contexto: entrenado con un contexto activo de 8192 tokens, lo que condiciona la longitud de las conversaciones que puede manejar de forma óptima.

## Casos de uso

- Asistente conversacional con identidad de marca: el modelo puede desplegarse como un bot que se presenta como Satella, tanto con system message como sin él, manteniendo coherencia en conversaciones de cierta longitud gracias a su contexto de entrenamiento de 8192 tokens.
- Agente con tool calling en formato Qwen: integración en sistemas que ya utilizan el formato de herramientas de Qwen, permitiendo al modelo solicitar ejecuciones de funciones externas en flujos de automatización.
- Razonamiento en atención al cliente: para responder consultas que requieren deducción lógica, como diagnósticos de problemas técnicos, en un modelo ligero que puede ejecutarse en GPU modesta o incluso en CPU.
- Prototipado de aplicaciones de IA: al ser un modelo pequeño y en formato GGUF, es adecuado para pruebas de concepto locales con llama.cpp u Ollama, sin necesidad de infraestructura de gran escala.
- Automatización de respuestas en foros y comunidades: puede generar respuestas razonadas a preguntas frecuentes, aprovechando su entrenamiento en corpus mixto de razonamiento y respuesta directa.
- Demostraciones educativas de razonamiento: ideal para entornos con recursos limitados donde un modelo de 30B no es viable, mostrando capacidades de razonamiento en un modelo de menos de 800 millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es 0,7 GB y el modelo tiene 772 millones de parámetros, lo que sugiere que una cuantización 4-bit podría caber en aproximadamente 1-2 GB de VRAM, pero no hay datos oficiales de cuantización.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, cualquier GPU moderna con al menos 4 GB de VRAM debería poder ejecutarlo, pero no hay confirmación oficial.
- Cabe en consumer GPU: probablemente sí, en GPUs de consumo con 4 GB o más, dado el tamaño del modelo y del repositorio.
- Opciones de despliegue: llama.cpp y Ollama (formato GGUF); vLLM y TGI no están confirmados en la documentación. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Longitud de contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Satella-0.8B | 772.845.888 | No aplica (no MoE) | No disponible | No disponible | Other | HuggingFace |
| Satella-30B-A3B | 30B | 3B (A3B) | No disponible | No disponible | No disponible | HuggingFace |
| Qwen/Qwen3.5-0.8B | No disponible | No disponible | No disponible | No disponible | No disponible | HuggingFace (modelo base) |

No se dispone de más alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Licencia `other` con restricciones de proveniencia en el dataset de entrenamiento. No se reclama linaje Apache-2.0; es necesario revisar el `PROVENANCE.md` de `r0b0tlab/qwen3.8-max-distillation-50k` antes de redistribuir, usar comercialmente o interpretar benchmarks.
- Riesgo de alucinación no cuantificado. No se han publicado evaluaciones independientes ni benchmarks.
- Contexto limitado: el entrenamiento se realizó con un contexto activo de 8192 tokens; no se especifica la longitud máxima de contexto del modelo base.
- Visión no funcional: a pesar de usar la ruta `FastVisionModel`, el SFT es solo de texto y los parámetros visuales están congelados, por lo que no procesa imágenes.
- Sesgos no evaluados. El modelo puede heredar sesgos del modelo base Qwen3.5-0.8B y del dataset de destilación utilizado.
- El entrenamiento se limitó a una época con un tope de 2,25 horas, lo que puede condicionar el rendimiento final.
- Sin datos de latencia, throughput ni requisitos de hardware oficiales.

## Enlaces

- https://huggingface.co/EphAsad/Satella-0.8B-GGUF
- https://huggingface.co/EphAsad/Satella-30B-A3B
- https://huggingface.co/EphAsad/Satella-30B-A3B/tree/main
- https://huggingface.co/Qwen/Qwen3.5-0.8B (referencia del modelo base, mencionada en la model card)
