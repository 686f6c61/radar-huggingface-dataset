# fport/issue-writer-gemma4

## Resumen

El modelo `fport/issue-writer-gemma4` es un fine-tune del modelo base `unsloth/gemma-4-E4B-it`, desarrollado por el usuario `fport` para convertir entradas de producto en entradas estructuradas de issue tracker (tipo Jira) como un único objeto JSON. Está pensado para equipos de desarrollo ágil que necesitan automatizar la creación de historias de usuario, tareas o incidencias a partir de texto libre. El modelo soporta dos idiomas: inglés y turco.

Se trata de un modelo de generación de texto con pipeline `text-generation`, basado en la arquitectura de Gemma 4 de Google DeepMind. Según los metadatos de HuggingFace, el modelo tiene 7.996.156.490 parámetros totales (~8 mil millones) y se distribuye en formato `safetensors` con pesos en 16 bits. El nombre "E4B" sugiere que podría tratarse de un modelo con 4 mil millones de parámetros activos, pero esta característica no está confirmada en la información disponible. El repositorio incluye un modelo LoRA fusionado, listo para servir directamente con vLLM, TGI o transformers sin necesidad de aplicar adaptadores en tiempo de carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura de Gemma 4, no detallada en la informacion) |
| Parametros totales | 7.996.156.490 |
| Parametros activos | No disponible (el nombre E4B sugiere 4B activos, pero no confirmado) |
| Longitud de contexto | 8192 tokens (segun el comando de vLLM en la model card; maximo del modelo no especificado) |
| Tipos de cuantizacion | safetensors en bfloat16 (16-bit) y GGUF en repositorio separado (tipos no especificados) |
| Idiomas soportados | en, tr |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF (separado) |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA del modelo base `unsloth/gemma-4-E4B-it`, fusionado en 16 bits. El adaptador LoRA se entrenó con `r=32` y `alpha=64` sobre las proyecciones de atención y MLP, solo en capas de texto. El dataset de entrenamiento, `fport/issue-writer-tr-en`, contiene 13.000 ejemplos, mitad en inglés y mitad en turco, con la pérdida calculada únicamente sobre los turnos del asistente. Los splits de validación separan núcleos de contenido completos, lo que permite medir la generalización del modelo.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al fine-tune. La innovación principal del modelo no está en la arquitectura, sino en el diseño del prompt y del esquema de salida: el modelo está entrenado para responder exclusivamente con un objeto JSON válido, siguiendo criterios INVEST y escribiendo criterios de aceptación en formato Given/When/Then. El system prompt debe usarse de forma literal, ya que es uno de los tres utilizados en el entrenamiento.

## Capacidades

- Generación de texto estructurado en JSON para entradas de issue tracker (tipo Jira).
- Soporte bilingüe: inglés y turco.
- Conversacional: usa plantillas de chat estándar y puede integrarse con vLLM, TGI o transformers.
- Sigue un system prompt específico para no inventar hechos: cualquier dato no presente en la entrada se coloca en los campos `assumptions` o `clarifying_questions`.
- Genera criterios de aceptación testables en formato Given/When/Then.
- No se especifica soporte de tool calling, agentes, visión, audio u otras capacidades multimodales.

## Casos de uso

- Generación automática de issues de Jira a partir de notas de producto: el modelo convierte texto libre en una entrada estructurada con título, descripción, criterios de aceptación y supuestos.
- Asistente ágil para equipos de desarrollo: transforma requisitos de usuario en historias de usuario con criterios INVEST, reduciendo el tiempo de redacción de tickets.
- Automatización de creación de incidencias en sistemas de seguimiento: integrado en un pipeline, puede generar tickets a partir de correos, chats o informes de error.
- Soporte multilingüe para equipos distribuidos: genera issues en inglés o turco según el idioma de la entrada, facilitando la colaboración en equipos internacionales.
- Integración en pipelines de CI/CD: mediante vLLM, el modelo puede servir como endpoint HTTP y crear issues automáticamente a partir de commits, pull requests o resultados de pruebas.
- Análisis de requisitos ambiguos: el modelo rellena explícitamente los campos `assumptions` y `clarifying_questions` cuando la entrada no contiene información suficiente, evitando suposiciones silenciosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el peso del repositorio es de 16.0 GB, lo que corresponde a los parámetros en bfloat16 (7.996.156.490 × 2 bytes ≈ 16 GB). Para inferencia se necesitan ~16 GB de VRAM solo para los pesos, más el overhead de la caché KV y las activaciones, por lo que se recomienda una GPU con al menos 20-24 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB, H100 80 GB.
- Con la cuantización GGUF disponible en el repositorio `fport/issue-writer-gemma4-gguf`, es posible ejecutar el modelo en GPUs de consumo con menos VRAM (por ejemplo, 8-12 GB), aunque los tamaños de cuantización no están especificados.
- Opciones de despliegue: vLLM, TGI, transformers, y mediante GGUF con Ollama o llama.cpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. El modelo base `unsloth/gemma-4-E4B-it` es la referencia más cercana, pero no está fine-tuneado para la tarea específica de generación de issues estructurados en JSON.

## Limitaciones y advertencias

- El modelo está especializado en una tarea concreta; fuera del dominio de generación de issues, su rendimiento puede degradarse.
- El system prompt debe usarse de forma literal. Reescribirlo o parafrasearlo puede sacar al modelo de la distribución de entrenamiento.
- Se recomienda decodificación codiciosa (`temperature=0`). El muestreo puede romper la estructura JSON de salida.
- Riesgo de alucinación: aunque el system prompt instruye no inventar hechos, los modelos generativos pueden producir contenido no verificado.
- Los campos `assumptions` y `clarifying_questions` deben revisarse en entradas ambiguas. Si aparecen vacíos, puede indicar que el modelo ha rellenado un vacío de forma silenciosa.
- Limitación de idiomas: solo inglés y turco.
- La licencia declarada es Apache-2.0, pero el modelo base Gemma 4 puede tener términos de uso adicionales de Google que conviene revisar antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fport/issue-writer-gemma4
- Adaptador LoRA: https://huggingface.co/fport/issue-writer-gemma4-lora
- Repositorio GGUF: https://huggingface.co/fport/issue-writer-gemma4-gguf
- Dataset de entrenamiento: https://huggingface.co/datasets/fport/issue-writer-tr-en
- Repositorio del proyecto: https://github.com/fport/issue-writer
- Página de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
