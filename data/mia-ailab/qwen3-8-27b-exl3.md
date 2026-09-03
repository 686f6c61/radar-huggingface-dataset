# Mia-AiLab/Qwen3.8-27B-exl3

## Resumen

Este repositorio es un espejo comunitario de las cuantizaciones EXL3 del modelo Qwen/Qwen3.8-27B, publicadas originalmente por turboderp. El autor del espejo, Mia-AiLab, copia los pesos para garantizar su disponibilidad si el repositorio original se elimina. No se trata de un modelo nuevo, sino de una redistribución de pesos cuantizados con el formato ExLlamaV3, que permite ejecutar el modelo base de 27B parámetros con una huella de memoria reducida.

La relevancia de este repositorio radica en que ofrece múltiples variantes de cuantización con diferentes bits por peso (desde 1.40 hasta 2.20 bpw), incluyendo versiones con la torre de visión también cuantizada (variantes V3). Esto permite a los desarrolladores elegir el equilibrio entre calidad y consumo de memoria según su hardware. El modelo base Qwen3.8-27B es un modelo de 27B parámetros con licencia Apache 2.0, aunque no se proporcionan detalles adicionales sobre su arquitectura o capacidades en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B, sin especificar) |
| Parametros totales | 27B (según nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 (ExLlamaV3) con 1.40, 1.60, 1.80, 2.00 y 2.20 bits por peso; variantes H3 y H3+V3 (V3 cuantiza la torre de visión) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (safetensors, según el formato de ExLlamaV3) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-27B. El repositorio es una cuantización, no un entrenamiento. Los pesos originales fueron cuantizados por turboderp utilizando el formato EXL3 de ExLlamaV3, con un proceso de calibración autocalibrado (self-calibrated) que produce las variantes H3 y H3+V3. La variante V3 cuantiza adicionalmente la torre de visión, lo que reduce aún más el consumo de memoria a costa de una posible pérdida de calidad en tareas multimodales. No se proporcionan datos sobre el dataset de calibración ni sobre el proceso de entrenamiento del modelo original.

## Capacidades

- Al ser una cuantización del modelo Qwen3.8-27B, hereda las capacidades del modelo base, pero no se especifican en la información disponible.
- El modelo base incluye una torre de visión (según la mención de "quantized vision tower"), lo que sugiere capacidades multimodales (procesamiento de imágenes y texto), aunque no se detallan.
- No se mencionan capacidades específicas como tool calling, agentes o razonamiento multi-paso.
- La información disponible no permite confirmar el soporte multilingüe ni otras funcionalidades.

## Casos de uso

Dado que la información es limitada, los casos de uso se infieren de la naturaleza del repositorio (cuantizaciones EXL3 para inferencia local eficiente):

- Inferencia local en GPU con memoria limitada: las cuantizaciones de 1.40 a 2.20 bpw permiten ejecutar un modelo de 27B en GPUs de consumo con 12-16 GB de VRAM, usando ExLlamaV3 como motor de inferencia.
- Desarrollo de aplicaciones multimodales: si el modelo base soporta visión, las variantes H3+V3 permiten desplegar un asistente que procese imágenes y texto en entornos con restricciones de memoria.
- Prototipado rápido: al ser un espejo, los desarrolladores pueden descargar los pesos sin depender de la disponibilidad del repositorio original, facilitando la reproducibilidad de experimentos.
- Evaluación de trade-offs de cuantización: las múltiples ramas (1.40, 1.60, 1.80, 2.00, 2.20 bpw) permiten comparar el impacto de la precisión en la calidad de salida para una tarea concreta.
- Integración en pipelines de generación de texto con ExLlamaV3: por ejemplo, chatbots o asistentes de código que requieran baja latencia y uso eficiente de VRAM.
- Investigación en compresión de modelos: el repositorio sirve como referencia para estudiar el efecto de cuantizaciones extremas (por debajo de 2 bpw) en modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye archivos de calibración y evaluación (cal_trace.md, qbench_prompts_gen.md), pero no se proporcionan métricas numéricas en la model card.

## Requisitos de hardware

- VRAM estimada: para un modelo de 27B con cuantización de 2.20 bpw, el peso aproximado es de 27e9 * 2.20 / 8 = 7.4 GB, más overhead de activaciones y contexto. Con 1.40 bpw, el peso sería de unos 4.7 GB. Sin embargo, no se dispone de datos oficiales de VRAM.
- GPU recomendadas: no se especifican. Dado el tamaño, una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060, RTX 4070, RTX 4080) podría ejecutar las variantes de menor bpw. Para las de mayor bpw, se recomendaría 16 GB o más (RTX 4090, A100, etc.).
- Compatibilidad con GPU de consumo: probablemente sí, gracias a las cuantizaciones de baja precisión, pero no está confirmado.
- Opciones de despliegue: ExLlamaV3 (motor de inferencia específico para este formato), que se integra con librerías como llama.cpp o vLLM (si soportan EXL3, aunque no es habitual). También se puede usar con el servidor de ExLlamaV3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (cuantizaciones EXL3 de Qwen3.8-27B). El repositorio es un espejo, por lo que la comparativa directa sería con el modelo original sin cuantizar o con otras cuantizaciones (GGUF, GPTQ), pero no se proporcionan datos al respecto.

## Limitaciones y advertencias

- Al ser un espejo comunitario, no hay garantía de mantenimiento ni de soporte por parte del autor original. Los pesos pueden quedar desactualizados si el modelo base cambia.
- Las cuantizaciones de muy baja precisión (1.40-1.80 bpw) pueden degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código.
- La variante V3 cuantiza la torre de visión, lo que puede reducir la precisión en tareas multimodales.
- No se especifican sesgos conocidos ni riesgos de alucinación, pero al ser un modelo de lenguaje grande, es probable que presente los mismos riesgos que otros modelos de su clase.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base original (Qwen3.8-27B) para asegurar el cumplimiento.
- El tamaño del repositorio (93.3 GB) incluye todas las ramas; descargar una sola rama requiere menos espacio, pero no se indica el tamaño individual.

## Enlaces

- Repositorio espejo: https://huggingface.co/Mia-AiLab/Qwen3.8-27B-exl3
- Repositorio original (upstream): https://huggingface.co/turboderp/Qwen3.8-27B-exl3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
