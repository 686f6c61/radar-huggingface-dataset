# prithivMLmods/Qwen3.5-4B-3D-Coder-MTP-Repacked

## Resumen

Qwen3.5-4B-3D-Coder-MTP-Repacked es un empaquetado y reconversión del fine-tune independiente `ccore/Qwen3.5-4B-3D-Coder`, publicado por el usuario prithivMLmods. Se trata de una especialización del modelo base Qwen3.5-4B orientada a la generación de código Three.js autocontenido (HTML y JavaScript) para la creación de escenas 3D interactivas, además de cubrir programación de propósito general. El modelo se distribuye en formato multimodal image-text-to-text, con pesos safetensors en BF16 y múltiples cuantizaciones GGUF.

La particularidad de esta versión "MTP-Repacked" es la integración de Multi-Token Prediction (MTP) como mecanismo de decodificación especulativa embebido en los propios pesos del modelo, en lugar de requerir un modelo borrador externo. Esto permite acelerar la inferencia local en llama.cpp y entornos compatibles. El modelo base fue entrenado sobre el dataset MIT `ccore/ThreeJS-3D-Scenes`, compuesto por 4.146 ejemplos con prompts, trazas de razonamiento, código completo y etiquetas de complejidad.

Con 4.659.865.088 parámetros totales y licencia Apache-2.0, el modelo se posiciona como una opción ligera para desarrolladores que necesitan generar prototipos 3D interactivos o código JavaScript en local. La información pública disponible es limitada: no se han publicado resultados cuantitativos de benchmarks y la evaluación se demuestra únicamente mediante escenas de ejemplo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.5, con cabezas MTP para decodificación especulativa |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_M, Q3_K_L, mmproj-bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, 4 shards) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer denso de aproximadamente 4.660 millones de parámetros, y se presenta como un pipeline image-text-to-text, lo que implica la presencia de un proyector multimodal (fichero `mmproj-bf16.gguf` de 676 MB) que conecta un codificador visual con el modelo de lenguaje. La innovación destacada es la incorporación de cabezas de Multi-Token Prediction (MTP) directamente en los pesos, que predicen varios tokens futuros en un único forward pass y actúan como decodificación especulativa integrada sin modelo borrador separado.

El fine-tune fue realizado por ccore sobre el dataset `ccore/ThreeJS-3D-Scenes` (MIT), con 4.146 ejemplos que incluyen prompts, trazas de razonamiento, código completo y etiquetas de complejidad. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El checkpoint del 27 de octubre, según la model card, mejora la generación one-shot y la calidad de las escenas. Esta versión repackaged añade los pesos MTP y las cuantizaciones GGUF.

## Capacidades

- Generación de código Three.js autocontenido en HTML y JavaScript para escenas 3D interactivas.
- Generación de código de propósito general en el ámbito de la programación.
- Razonamiento con trazas explícitas (el dataset de entrenamiento incluye reasoning traces).
- Procesamiento multimodal image-text-to-text (entrada de imagen y texto).
- Decodificación especulativa mediante MTP integrado para acelerar la inferencia local.
- Conversación multi-turno (tag `conversational`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según la model card.

## Casos de uso

- Generación de prototipos 3D interactivos: el modelo produce escenas Three.js completas en un solo paso (HTML + JavaScript autocontenido), lo que permite a diseñadores y desarrolladores obtener maquetas funcionales de visualizaciones 3D sin escribir el código desde cero.
- Educación y tutoriales de Three.js: dado que el dataset incluye trazas de razonamiento y etiquetas de complejidad, el modelo puede generar explicaciones paso a paso junto al código, útil en plataformas de aprendizaje.
- Integración en herramientas de autoría web: un editor podría invocar el modelo para convertir una descripción textual en una escena 3D embebible en una página, aprovechando el formato HTML/JS autocontenido.
- Asistencia a programadores frontend: generación y corrección de fragmentos JavaScript de propósito general, con foco en gráficos y renderizado.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_M (2,78 GB) y Q5_K_M (3,16 GB), puede ejecutarse en equipos con recursos moderados mediante llama.cpp u Ollama para tareas de generación de código offline.
- Aceleración de iteración en pipelines de CI/CD: la decodificación especulativa MTP reduce el coste por token en inferencia local, lo que permite usar el modelo en tareas de generación de código repetitivas dentro de flujos automatizados, siempre con revisión humana.
- Generación multimodal asistida: al aceptar entrada image-text, puede utilizarse para describir o replicar escenas a partir de una imagen de referencia y producir el código Three.js correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación se demuestra mediante escenas de ejemplo y que no se proporcionan resultados cuantitativos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,3 GB solo para pesos, más overhead de contexto y proyector multimodal; se recomienda 12-16 GB.
- VRAM estimada en Q8_0 (4,61 GB): alrededor de 6-8 GB con contexto moderado.
- VRAM estimada en Q4_K_M (2,78 GB): alrededor de 4-6 GB, apto para GPUs consumer.
- GPUs recomendadas: RTX 4090, RTX 3090, A100 o H100 para BF16; RTX 4060 Ti 16 GB, RTX 4070 o superiores para cuantizaciones Q4-Q6.
- Cabe en GPU consumer: sí, en cuantizaciones Q4_K_M, Q5_K_M y Q6_K en GPUs con 6-8 GB de VRAM; en BF16 requiere 12 GB o más.
- Opciones de despliegue: llama.cpp (soporte MTP GGUF), LM Studio (desactivar multi-token prediction según la model card), transformers con safetensors, text-generation-inference, endpoints compatibles.
- Latencia y throughput: no disponibles de forma cuantitativa; la model card afirma que MTP acelera significativamente la inferencia local frente a decodificación especulativa tradicional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder-MTP-Repacked | 4,66 B | no disponible | Apache-2.0 | safetensors, GGUF | Especializado en Three.js y 3D, con MTP |
| ccore/Qwen3.5-4B-3D-Coder (base) | 4,66 B | no disponible | Apache-2.0 | safetensors, GGUF | Fine-tune original sin repackaging MTP |
| Qwen3.5-4B (modelo base) | ~4 B | no disponible | no disponible | no disponible | Modelo generalista sin especialización 3D |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un fine-tune sobre un dataset específico de Three.js, puede presentar sesgo hacia ese dominio y degradar en otras tareas de código.
- Riesgo de alucinación: la model card advierte que algunas generaciones pueden requerir reintentos o correcciones menores de código, lo que indica una fiabilidad imperfecta en la salida.
- Limitaciones de idioma: solo se declara soporte de inglés (`en`); el rendimiento en castellano no está garantizado.
- Limitaciones de contexto: la longitud de contexto no se especifica en la información disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5 puede tener condiciones adicionales no detalladas aquí; conviene revisar la licencia del modelo base original.
- Caveat para producción: la model card recomienda desactivar multi-token prediction en LM Studio; el uso de MTP puede no ser compatible con todos los backends. Además, es un "early-preview" y no se han publicado benchmarks, por lo que su idoneidad en producción debe validarse empíricamente.
- El repositorio tiene 43,3 GB y 0 descargas en el momento de la consulta, lo que sugiere una adopción muy limitada y poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.5-4B-3D-Coder-MTP-Repacked
- GGUF: https://huggingface.co/prithivMLmods/Qwen3.5-4B-3D-Coder-MTP-Repacked/tree/main/GGUF
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Dataset: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Perfil del autor del fine-tune original: https://huggingface.co/ccore
