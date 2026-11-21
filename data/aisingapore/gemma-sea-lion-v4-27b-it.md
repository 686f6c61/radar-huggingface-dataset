# aisingapore/Gemma-SEA-LION-v4-27B-IT

## Resumen

Gemma-SEA-LION-v4-27B-IT es un modelo de lenguaje de 27.432 millones de parámetros desarrollado por AI Singapore (AI Products Pillar) y financiado por el Singapore NRF. Se trata de un ajuste fino por instrucciones del modelo base aisingapore/Gemma-SEA-LION-v4-27B, que a su vez parte de la arquitectura Gemma 3. Su objetivo es cubrir las necesidades de las lenguas del sudeste asiático, una región tradicionalmente infrarrepresentada en los grandes modelos abiertos.

El modelo hereda del Gemma 3 de Google una ventana de contexto de 128.000 tokens, capacidades multimodales de imagen y texto (comprensión de documentos, VQA y razonamiento sobre imágenes) y soporte avanzado de function calling y salidas estructuradas. Sobre esa base, AI Singapore ha realizado un post-entrenamiento con aproximadamente 10 millones de pares de pregunta-respuesta en birmano, inglés, indonesio, jemer, lao, malayo, tagalo, tamil y vietnamita.

Es relevante ahora porque, según la model card, el modelo destaca en tareas del sudeste asiático frente a otros modelos abiertos de menos de 200.000 millones de parámetros y se aproxima al rendimiento de modelos cerrados de mayor tamaño. Su licencia MIT facilita la adopción comercial, y el aviso de nueva versión (Qwen-SEA-LION-v4.5-27B-IT) indica que la familia sigue evolucionando.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura Gemma 3) |
| Parametros totales | 27.432.406.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, vi, id, th, fil, ta, ms, km, lo, my, jv, su (birmano, inglés, indonesio, jemer, lao, malayo, mandarín, tagalo, tamil, tailandés, vietnamita, javanés, sondanés) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 54,9 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer basado en la arquitectura Gemma 3, con el tokenizador por defecto de Gemma 3 27B IT. Sobre el checkpoint base Gemma-SEA-LION-v4-27B se aplicó un post-entrenamiento por instrucciones (fine-tuning) empleando un conjunto de aproximadamente 10 millones de pares QA en birmano, inglés, indonesio, jemer, lao, malayo, tagalo, tamil y vietnamita. La receta de datos combina SEA-Instruct, Infinity-Instruct y OpenMath-Instruct 2 con datasets de código abierto.

Para la fase de RL online se usaron conjuntos abiertos como nvidia/Llama-Nemotron-Post-Training-Dataset (split RL) y zwhe99/DeepMath-103K. Para la alineación se generaron pares rejected-chosen a partir de los datos de entrenamiento. La model card advierte que las cifras de datos y cómputo reflejan exactamente la ejecución de producción de este checkpoint y pueden diferir de los totales agregados o de los pools pre-filtrados publicados en los papers asociados. Destaca la herencia de las capacidades de Gemma 3: contexto de 128K, comprensión de imagen y texto, function calling y salidas estructuradas.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno en 13 idiomas, con especial foco en las lenguas del sudeste asiático.
- Comprensión de imagen y texto: lectura de documentos, VQA (visual question answering) y razonamiento basado en imágenes, heredados de Gemma 3 27B IT.
- Function calling y salidas estructuradas para integración en sistemas externos.
- Razonamiento matemático, reforzado mediante OpenMath-Instruct 2 y DeepMath-103K durante el post-entrenamiento.
- Capacidades multilingües nativas en birmano, inglés, indonesio, jemer, lao, malayo, mandarín, tagalo, tamil, tailandés, vietnamita, javanés y sondanés.
- Soporte de agentes y razonamiento multi-paso a través de las capacidades de tool calling y contexto largo.
- Compatible con text-generation-inference y endpoints compatibles.

## Casos de uso

- Atención al cliente en mercados del sudeste asiático: el modelo puede gestionar conversaciones multi-turno en indonesio, tailandés, vietnamita o tagalo con 128K tokens de contexto, lo que permite mantener el historial completo de una sesión larga sin truncar.
- Procesamiento de documentos con OCR asistido: gracias a la comprensión de imagen y texto, puede extraer y razonar sobre documentos escaneados en jemer, lao o birmano, idiomas con recursos limitados en otros modelos.
- Generación de código y automatización de pipelines: el soporte de function calling y salidas estructuradas permite integrarlo en flujos CI/CD o como orquestador de herramientas en agentes.
- Localización de contenidos: traducción y adaptación cultural de materiales entre inglés y las lenguas SEA, incluyendo pares de baja representación como tamil-malayo o sondanés-indonesio.
- Asistentes educativos multilingües: tutoría en matemáticas y ciencias apoyada en las capacidades de razonamiento matemático reforzadas durante el entrenamiento.
- Análisis de documentos regulatorios y legales: la ventana de 128K permite procesar contratos o normativas extensas en inglés y lenguas locales en una sola pasada.
- Sistemas de accesibilidad: descripción de imágenes y VQA para usuarios en idiomas del sudeste asiático, aprovechando la herencia multimodal de Gemma 3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que, a fecha de 25 de agosto de 2025, el modelo destaca en tareas del sudeste asiático frente a modelos abiertos de menos de 200.000 millones de parámetros y ofrece un rendimiento comparable al de modelos cerrados de mayor tamaño, pero remite al leaderboard externo (https://leaderboard.sea-lion.ai/) para las cifras detalladas, que no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 (27.432 millones de parámetros) se requieren aproximadamente 55 GB, coherente con el tamaño del repo (54,9 GB). En cuantización de 8 bits bajaría a unos 27-28 GB y en 4 bits a unos 14-15 GB (estimaciones, ya que la model card no publica cuantizaciones oficiales).
- GPU recomendadas: para bfloat16 se necesita una GPU con al menos 80 GB (A100 80GB, H100 80GB) o varias GPUs con tensor parallelism. Para cuantización 4-8 bits puede ejecutarse en una RTX 4090 (24 GB) con 8 bits ajustado o en 4 bits con margen.
- Cabe en GPU de consumo: sí, en 4 bits en GPUs de 24 GB como la RTX 4090 o la RTX 3090; en 8 bits requiere al menos 32 GB.
- Opciones de despliegue: transformers (pipeline estándar), text-generation-inference (TGI), endpoints compatibles de Hugging Face. La model card no menciona explícitamente llama.cpp, Ollama o vLLM, por lo que su soporte no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Gemma-SEA-LION-v4-27B-IT | 27,4 mil millones | 128K | MIT | Multimodal, 13 idiomas SEA, function calling |
| google/gemma-3-27b-it | 27 mil millones (aprox.) | 128K | Términos de Gemma (no MIT) | Modelo base; capacidades de visión equivalentes según la model card |
| aisingapore/Qwen-SEA-LION-v4.5-27B-IT | no disponible | no disponible | no disponible | Nueva versión indicada por el autor; sustituye a esta ficha según la model card |

La model card sitúa al modelo por delante de otros modelos abiertos de menos de 200.000 millones de parámetros en tareas SEA, pero no proporciona cifras concretas para una comparación numérica. El modelo base Gemma 3 27B IT comparte arquitectura y contexto, pero la licencia de Gemma impone restricciones de uso que la MIT de SEA-LION no tiene.

## Limitaciones y advertencias

- El modelo no ha sido alineado para seguridad; los desarrolladores deben aplicar su propio fine-tuning de seguridad y medidas de protección.
- No se probó la robustez frente a prompting adversarial.
- Riesgo de alucinación: puede generar contenido irrelevante o ficticio no fundamentado en el contexto, como otros LLM.
- Las capacidades de visión se entrenaron y ajustaron exclusivamente sobre el backend de texto; se espera que sean comparables a Gemma 3 IT 27B sin mejoras significativas en visión.
- Las cifras de datos y cómputo de la model card reflejan la ejecución de producción y pueden diferir de los papers y datasets públicos.
- La model card indica que existe una nueva versión (Qwen-SEA-LION-v4.5-27B-IT), por lo que este checkpoint puede quedar desactualizado.
- Licencia MIT: permite uso comercial, pero el autor declina toda responsabilidad por daños derivados del uso de los pesos.
- La cobertura idiomática se limita a los 13 idiomas listados; el rendimiento en otras lenguas no está garantizado.

## Enlaces

- Hugging Face: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B-IT
- Modelo base: https://huggingface.co/aisingapore/Gemma-SEA-LION-v4-27B
- Nueva versión: https://huggingface.co/aisingapore/Qwen-SEA-LION-v4.5-27B-IT
- Repositorio GitHub: https://github.com/aisingapore/sealion.git
- Leaderboard SEA-LION: https://leaderboard.sea-lion.ai/
- Gemma 3 27B IT: https://huggingface.co/google/gemma-3-27b-it
- Licencia MIT: https://mit-license.org/
- Paper referenciado (arxiv:2502.14301): https://arxiv.org/abs/2502.14301
- Paper referenciado (arxiv:2311.07911): https://arxiv.org/abs/2311.07911
- Paper referenciado (arxiv:2306.05685): https://arxiv.org/abs/2306.05685
- Paper referenciado (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
