# marsplan0624/zils-d3-mini-cc1-h13

## Resumen

`marsplan0624/zils-d3-mini-cc1-h13` es un "body" de pesos para el pool de modelos `d3-mini` de Zils, un proyecto de modelos de decisión. Se trata de un fine-tune del modelo base `Qwen/Qwen3.5-4B` en el que el autor, marsplan0624, ha fusionado un LoRA de lenguaje de rango 16 sobre los pesos completos de lenguaje y visión. El modelo está entrenado con preguntas de decisión pública etiquetadas con resultados reales (reversiones y revisiones de Wikipedia, categorías de arXiv, resultados de Stack Exchange y merges de Gerrit), siguiendo el estilo "Zils Outcomes".

El modelo tiene 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones) y un tamaño de repositorio de 9,1 GB en formato safetensors. La licencia es Apache-2.0 y el modelo base es Qwen3.5-4B, lo que sugiere una arquitectura transformer con capacidades de lenguaje y visión, aunque la model card no detalla la arquitectura interna ni la longitud de contexto.

La relevancia de este modelo es limitada y muy específica: es un componente de pesos dentro de un ecosistema cerrado (el pool `d3-mini` de Zils) y, según la propia model card, los pesos solo son utilizables a través del runtime "chassis" fijado por el pool. No incluye capa de respuesta ni código de runtime, por lo que no es un modelo autónomo listo para usar. Su interés es principalmente para quienes participan en el ecosistema Zils o quieren estudiar el fine-tune de decisión sobre Qwen3.5-4B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-4B; detalles no disponibles) |
| Parámetros totales | 4.539.265.536 (~4,5 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `Qwen/Qwen3.5-4B` en el que se ha fusionado un LoRA de lenguaje de rango 16 directamente en los pesos. La model card indica que se conservan los pesos completos de lenguaje y visión del fine-tune en el layout del modelo base. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

El entrenamiento se realizó sobre "Zils Outcomes style public decision questions" etiquetadas con resultados reales: reversiones y revisiones de Wikipedia, categorías de arXiv, resultados de Stack Exchange y merges de Gerrit. Se trata, por tanto, de un ajuste orientado a modelar decisiones y sus desenlaces, no a instrucciones generales. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento sobre cuestiones de decisión, heredados del modelo base Qwen3.5-4B.
- Capacidades de visión, ya que la model card menciona que se incluyen los pesos completos de lenguaje y visión.
- Modelado de desenlaces: el ajuste está orientado a preguntas de decisión con etiquetas de resultado real (aceptado/rechazado, merge/no merge, categoría correcta, etc.).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.
- Uso condicionado: los pesos solo son utilizables a través del runtime "chassis" fijado por el pool `d3-mini`; el repositorio no incluye capa de respuesta ni código de runtime.

## Casos de uso

- Evaluación de decisiones en entornos de revisión colaborativa: el modelo puede puntuar o clasificar si una edición propuesta en Wikipedia sería revertida o aceptada, gracias al entrenamiento con reversiones y revisiones reales.
- Moderación y triaje de contribuciones en plataformas tipo Stack Exchange: usar el modelo para estimar el desenlace probable de una pregunta o respuesta (aceptada, cerrada, votada), integrado en un pipeline de triaje previo a la revisión humana.
- Predicción de merges en revisiones de código: dado un cambio en Gerrit, el modelo puede estimar la probabilidad de que sea fusionado, como señal auxiliar en herramientas de CI o en paneles de revisión.
- Clasificación temática de preprints: el ajuste con categorías de arXiv permite usar el modelo para asignar o verificar categorías de artículos científicos en flujos de ingesta editorial.
- Investigación sobre modelado de desenlaces: sirve como base para estudiar cómo un fine-tune de decisión sobre Qwen3.5-4B se comporta frente a preguntas con etiquetas objetivas, dentro del ecosistema Zils.
- Componente en el pool `d3-mini`: uso previsto como "body" de pesos descargado por mineros y validadores del pool, que aplican el runtime y la capa de respuesta fijados por Zils.
- Experimentación con fine-tunes de decisión sobre modelos de 4-5 B: útil para reproducir o comparar la fusión de un LoRA de rango 16 sobre Qwen3.5-4B en tareas de clasificación de desenlaces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~4,5 B en safetensors, los pesos en FP16 ocupan aproximadamente 9 GB; en cuantizaciones de 8 bits rondaría 4,5-5 GB y en 4 bits unos 2,5-3 GB, aunque no se confirman cuantizaciones publicadas para este repositorio.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un modelo de ~4,5 B podría ejecutarse en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- ¿Cabe en GPU de consumo? Probablemente sí en GPUs con 8-16 GB de VRAM según cuantización, pero no se confirma en la documentación.
- Opciones de despliegue: los pesos solo son utilizables a través del runtime "chassis" fijado por el pool `d3-mini`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `marsplan0624/zils-d3-mini-cc1-h13` | ~4,5 B | No disponible | Apache-2.0 | Pesos en HF, uso solo vía runtime del pool | Fine-tune de decisión sobre Qwen3.5-4B |
| `zils-ai/d3-mini-4.5b-v1` | ~5 B (según HF) | No disponible | Apache-2.0 | Pesos en HF, perfil fijado por Zils | Base del perfil d3-mini-4.5b-v1, sin cambios de pesos |
| `Qwen/Qwen3.5-4B` | ~4 B | No disponible | No disponible en la información | Pesos en HF | Modelo base del que deriva este fine-tune |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Los pesos no son autónomos: la model card indica que solo son utilizables a través del runtime "chassis" fijado por el pool, y el repositorio no incluye capa de respuesta ni código de runtime.
- No se documentan sesgos conocidos, pero al entrenarse con desenlaces de plataformas concretas (Wikipedia, arXiv, Stack Exchange, Gerrit) puede heredar sesgos de esas comunidades y de sus procesos de revisión.
- Riesgo de alucinación: no evaluado en la información disponible; el ajuste a tareas de decisión no elimina la generación de contenido incorrecto.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache-2.0 permite uso comercial de los pesos, pero el uso previsto está condicionado por el runtime del pool; conviene verificar las condiciones del ecosistema Zils antes de un despliegue en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 2026-11-06, por lo que no hay evidencia de uso o validación comunitaria.
- No se han publicado benchmarks, por lo que no se puede verificar su rendimiento frente a alternativas.

## Enlaces

- [Hugging Face: marsplan0624/zils-d3-mini-cc1-h13](https://huggingface.co/marsplan0624/zils-d3-mini-cc1-h13)
- [Hugging Face: zils-ai/d3-mini-4.5b-v1](https://huggingface.co/zils-ai/d3-mini-4.5b-v1)
- [Hugging Face: zils-ai (Zils)](https://huggingface.co/zils-ai/models)
- [Hugging Face: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
