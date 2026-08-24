# lucasnhandang/lab22-dpo-qwen2.5-vn-GGUF

## Resumen

El modelo `lucasnhandang/lab22-dpo-qwen2.5-vn-GGUF` es una versión cuantizada en formato GGUF de un modelo de lenguaje basado en Qwen2.5-7B, alineado mediante Direct Preference Optimization (DPO) para mejorar su comportamiento en vietnamita e inglés. Ha sido desarrollado por el usuario lucasnhandang a partir del checkpoint `unsloth/Qwen2.5-7B-bnb-4bit`, que ya incorpora una cuantización de 4 bits durante el entrenamiento. El proceso de alineación utiliza los datasets UltraFeedback y Vietnamese Alpaca, lo que lo hace especialmente relevante para aplicaciones que requieren respuestas preferidas por humanos en vietnamita, un idioma con menos recursos que el inglés.

La distribución en GGUF permite ejecutar el modelo con llama.cpp, Ollama y otras herramientas compatibles, con dos variantes de cuantización (Q4_K_M y Q5_K_M) que equilibran velocidad y calidad. Con aproximadamente 7.600 millones de parámetros, se sitúa en la gama de modelos de tamaño medio que pueden desplegarse en hardware de consumo, lo que lo convierte en una opción práctica para desarrolladores que necesitan un modelo alineado y multilingüe sin depender de APIs externas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B soporta 32.768 tokens, pero no se especifica en este repo) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-7B, un transformer decoder-only con atención causal estándar, publicado originalmente por Alibaba Cloud. Sobre esta base, el autor aplicó un proceso de alineación mediante DPO (Direct Preference Optimization), partiendo del checkpoint `unsloth/Qwen2.5-7B-bnb-4bit`, que ya había sido entrenado con cuantización de 4 bits para reducir el uso de memoria. Los datos de preferencia provienen de UltraFeedback (un conjunto de respuestas anotadas por calidad) y Vietnamese Alpaca (un dataset de instrucciones en vietnamita). No se han publicado detalles sobre el número de tokens de entrenamiento, el número de épocas ni los hiperparámetros exactos del DPO.

La principal innovación técnica de esta versión es la conversión a GGUF, que permite su ejecución eficiente en CPU y GPU con herramientas como llama.cpp, manteniendo la alineación DPO en un formato ligero. No se mencionan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en vietnamita e inglés, con respuestas alineadas mediante DPO para seguir preferencias humanas.
- Razonamiento y comprensión de instrucciones heredadas del modelo base Qwen2.5-7B, que incluye capacidades de código, matemáticas y conocimiento general.
- Soporte de conversaciones multi-turno (aunque no se especifica explícitamente, el modelo base lo permite).
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento especiales en la model card.
- No se indica capacidad multimodal (visión, audio, etc.).

## Casos de uso

- Asistente virtual en vietnamita: el modelo puede gestionar consultas de atención al cliente, responder preguntas frecuentes y mantener conversaciones contextuales en vietnamita, gracias a su alineación con datos de preferencia y su capacidad multilingüe.
- Generación de contenido localizado: redacción de artículos, resúmenes o respuestas automáticas en vietnamita para plataformas de comercio electrónico, foros o redes sociales, con un tono más natural gracias al DPO.
- Traducción asistida vietnamita-inglés: aunque no es un modelo de traducción dedicado, puede ayudar a generar borradores o reformular textos entre ambos idiomas, aprovechando su entrenamiento bilingüe.
- Chatbot educativo: tutoría de programación o explicaciones de conceptos técnicos en vietnamita, como el ejemplo de la model card que pide explicar el algoritmo quicksort.
- Desarrollo de aplicaciones offline: al ser un GGUF, puede integrarse en aplicaciones de escritorio o móviles con llama.cpp, sin necesidad de conexión a internet, para entornos con requisitos de privacidad.
- Prototipado rápido de agentes conversacionales: los desarrolladores pueden probar el modelo localmente con Ollama o llama.cpp antes de escalar a soluciones más grandes, gracias a su tamaño moderado y formato estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, el modelo ocupa aproximadamente 4-5 GB en memoria; con Q5_K_M, alrededor de 5-6 GB. Esto permite ejecutarlo en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4090 (24 GB) sin problemas.
- También puede ejecutarse en CPU con llama.cpp, aunque la latencia será mayor; se recomienda al menos 16 GB de RAM para cargar el modelo en memoria.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, y cualquier framework compatible con GGUF (por ejemplo, LM Studio, KoboldCpp).
- Latencia y throughput: no se proporcionan datos específicos. En una GPU moderna (RTX 4090), se puede esperar una generación de decenas de tokens por segundo, pero depende del hardware y de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Alineación |
|---|---|---|---|---|---|
| lucasnhandang/lab22-dpo-qwen2.5-vn-GGUF | 7,6B | no disponible (base: 32k) | Apache-2.0 | GGUF | DPO (vi, en) |
| TheBloke/Qwen2.5-7B-GGUF | 7,6B | 32k | Apache-2.0 | GGUF | Sin alineación adicional |
| unsloth/Qwen2.5-7B-bnb-4bit | 7,6B | 32k | Apache-2.0 | safetensors (4-bit) | Sin alineación DPO |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de rendimiento para establecer diferencias cualitativas. La principal ventaja de este modelo es su alineación DPO específica para vietnamita, que no está presente en las versiones estándar de Qwen2.5-7B.

## Limitaciones y advertencias

- El modelo solo ha sido alineado para vietnamita e inglés; su rendimiento en otros idiomas puede ser deficiente o impredecible.
- No se han publicado evaluaciones de sesgos ni de seguridad. Como cualquier modelo de lenguaje, puede generar contenido ofensivo, incorrecto o alucinado, especialmente en dominios especializados.
- La alineación DPO se realizó sobre un subconjunto de datos (UltraFeedback y Vietnamese Alpaca), por lo que puede no generalizar bien a todos los estilos o dominios.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5 también está bajo Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- El formato GGUF está pensado para inferencia, no para fine-tuning adicional; si se necesita entrenar más, habría que partir del modelo base en safetensors.
- No se garantiza la disponibilidad a largo plazo del repositorio, ya que tiene 0 descargas y 0 likes, lo que sugiere un proyecto personal sin mantenimiento activo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/lucasnhandang/lab22-dpo-qwen2.5-vn-GGUF
- Dataset asociado: https://huggingface.co/datasets/lucasnhandang/lab22-dpo-qwen2.5-vn
- Organización Qwen en Hugging Face: https://huggingface.co/Qwen
- Informe técnico de Qwen2.5-VL (referencia de la familia Qwen): https://arxiv.org/abs/2502.13923
- Repositorio no oficial de Qwen2.5 en GitHub: https://github.com/787028221/Qwen2.5
