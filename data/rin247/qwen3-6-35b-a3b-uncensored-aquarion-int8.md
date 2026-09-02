# Rin247/Qwen3.6-35B-A3B-Uncensored-Aquarion-INT8

## Resumen

El modelo `Rin247/Qwen3.6-35B-A3B-Uncensored-Aquarion-INT8` es una cuantización INT8 weight-only del modelo `Qwen3.6-35B-A3B-Uncensored`, publicada por el usuario Rin247 en Hugging Face. Se trata de un modelo de texto de tipo mixture-of-experts (MoE) con aproximadamente 35 000 millones de parámetros totales y unos 3 000 millones de parámetros activos por pasada, basado en la arquitectura Qwen 3.6. La variante original fue sometida a un proceso de abliteración (eliminación de la dirección de rechazo) para eliminar las respuestas de negativa ante solicitudes consideradas sensibles, y posteriormente cuantizada a INT8 mediante el método RTN (round-to-nearest) en CPU.

Esta versión cuantizada busca reducir la huella de memoria para facilitar el despliegue local en hardware con VRAM limitada, manteniendo la mayor parte de las capacidades del modelo original. El repositorio incluye los pesos en formato safetensors con escalas y formas almacenadas por separado, lo que requiere un paso de dequantización antes de la inferencia. El modelo está etiquetado como compatible con endpoints y orientado a conversación, aunque no se especifican idiomas ni licencia en la ficha de Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención híbrida (lineal + softmax completa, ratio 3:1) |
| Parametros totales | 34 660 610 688 (≈35B) |
| Parametros activos | ≈3B (según fuentes externas) |
| Longitud de contexto | 262 144 tokens (según fuentes externas; no confirmado en la model card) |
| Tipos de cuantizacion | INT8 weight-only (RTN) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con buffers de escala y forma (`*.weight_scale`, `*.weight_shape`) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.6-35B-A3B` emplea una arquitectura de mezcla de expertos (MoE) con aproximadamente 3 000 millones de parámetros activos por token, lo que permite un coste de inferencia relativamente bajo en comparación con un modelo denso del mismo tamaño. Su atención es híbrida: combina atención lineal con atención softmax completa en una proporción de 3:1, una innovación que reduce el coste computacional en contextos largos. Según los artículos consultados, el modelo soporta una ventana de contexto de 262 144 tokens.

La variante "Uncensored" fue generada mediante abliteración, una técnica que identifica y elimina la dirección de activación asociada al rechazo de peticiones, mediante proyección ortogonal. Este proceso se aplicó antes de la cuantización. La cuantización INT8 se realizó con PyTorch RTN en CPU, almacenando las escalas y formas de los tensores junto a los pesos. No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno, orientada a uso sin restricciones de contenido (uncensored).
- Razonamiento y resolución de problemas, gracias a la arquitectura MoE de Qwen 3.6.
- Soporte de contexto largo (hasta 262K tokens según fuentes externas), adecuado para tareas que requieren procesar documentos extensos.
- Capacidades multilingües presumiblemente heredadas del modelo base, aunque no se especifican idiomas concretos.
- Posible soporte de tool calling y function calling, habitual en la familia Qwen, aunque no está confirmado en la documentación disponible.
- No se indica soporte de visión, audio u otras modalidades; es un modelo exclusivamente de texto.

## Casos de uso

- Despliegue local de un asistente conversacional sin filtros: el modelo abliterado permite respuestas directas en dominios donde los modelos comerciales suelen rechazar la petición, como escritura creativa con temática adulta o discusión de temas controvertidos. Su tamaño cuantizado facilita su ejecución en estaciones de trabajo con una GPU de 24 GB o más.
- Procesamiento de documentos largos: con una ventana de contexto de 262K tokens, puede resumir o extraer información de libros técnicos, expedientes legales o informes extensos en una sola pasada, sin necesidad de dividir el texto.
- Generación de código en entornos sin conexión: al ser un modelo de 35B con solo 3B activos, puede ejecutarse en hardware consumer y generar fragmentos de código, explicaciones o refactorizaciones sin depender de APIs externas.
- Investigación sobre alineación y seguridad: al estar abliterado, sirve como caso de estudio para analizar el impacto de la eliminación de la dirección de rechazo en el comportamiento del modelo, comparándolo con la versión original.
- Creación de personajes o narrativa interactiva: su naturaleza sin censura y su capacidad de conversación lo hacen adecuado para juegos de rol o ficción interactiva donde se requiere libertad temática.
- Pruebas de cuantización y optimización: al ser una cuantización INT8 con formato custom, puede utilizarse para evaluar el rendimiento de RTN en modelos MoE y comparar la degradación de calidad frente a otras técnicas como GPTQ o AWQ.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar, y los artículos web consultados tampoco proporcionan datos numéricos de rendimiento para esta cuantización específica.

## Requisitos de hardware

- VRAM estimada: al ser INT8 weight-only, los pesos ocupan aproximadamente 34,7 GB (34 660 610 688 bytes). Con overhead de escalas, buffers y activaciones, se recomienda al menos 40 GB de VRAM para inferencia cómoda.
- GPU recomendadas: NVIDIA A100 40GB, A100 80GB, H100, o configuraciones multi-GPU con 2× RTX 4090 (24 GB cada una) o 2× RTX 3090 (24 GB). No cabe en una sola GPU consumer de 24 GB.
- Opciones de despliegue: al ser un formato custom con escalas separadas, no es directamente compatible con vLLM, llama.cpp u Ollama sin un paso previo de conversión. Se requiere dequantizar los pesos y convertirlos a un formato estándar (por ejemplo, FP16 o BF16) antes de usar motores de inferencia convencionales.
- Latencia y throughput: no disponibles. Al ser un MoE con 3B activos, el throughput esperado es superior al de un modelo denso de 35B, pero la cuantización custom puede añadir overhead en la dequantización.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa rigurosa con otros modelos. El modelo base Qwen3.6-35B-A3B podría compararse con otros MoE de tamaño similar como Qwen3-30B-A3B o DeepSeek-V3, pero no se han encontrado benchmarks públicos que permitan una comparación objetiva. La cuantización INT8 de Rin247 es un formato propietario, por lo que su rendimiento relativo frente a cuantizaciones estándar (GPTQ, AWQ, GGUF) no está documentado.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o redistribución. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Formato de pesos no estándar: los pesos requieren dequantización manual con los buffers de escala y forma. No es compatible directamente con la mayoría de motores de inferencia, lo que añade complejidad al despliegue.
- Riesgo de alucinación: al ser un modelo sin censura y sin información sobre su alineación, puede generar contenido falso o inventado con mayor facilidad, especialmente en dominios donde el modelo base no fue entrenado.
- Sesgos desconocidos: al no disponer de documentación sobre el dataset de entrenamiento, no se pueden evaluar sesgos de género, raza o ideología.
- Abliteración puede degradar la calidad: la eliminación de la dirección de rechazo puede afectar negativamente a la coherencia o al tono en ciertas tareas, aunque no hay estudios publicados al respecto.
- Sin soporte oficial: el modelo es un experimento de un usuario individual, sin mantenimiento garantizado ni actualizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rin247/Qwen3.6-35B-A3B-Uncensored-Aquarion-INT8
- Artículo sobre el modelo base (HackerNoon): https://hackernoon.com/qwen36-35b-a3b-uncensored-a-35b-moe-model-with-262k-context
- Análisis de abliteración (oflight.co.jp): https://www.oflight.co.jp/en/columns/qwen36-35b-a3b-uncensored-abliterated-2026-07
- Ejemplo de despliegue en AMD Ryzen AI Max+ 395: https://akehir.com/blog/strix-halo-kubernetes-llm-qwen-3.6
