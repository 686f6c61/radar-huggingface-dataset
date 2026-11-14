# FMA03/cube-ultra

## Resumen

Cube Ultra es un ajuste fino mediante LoRA del modelo Qwen/Qwen2.5-1.5B-Instruct de Alibaba, desarrollado por el autor independiente FMA03 (佑眞) como el nivel superior de su serie de chats caseros "Cube". El modelo parte de una base transformer densa de 1.500 millones de parámetros y se especializa en japonés mediante un conjunto de datos propio de 21.041 pares de pregunta-respuesta y comprensión lectora, distribuidos en QA de definiciones (10.000), conversación informal (6.500), QA curado con ejercicios de cálculo (3.043) y lectura comprensiva (1.498).

La relevancia de este lanzamiento es doble: por un lado, demuestra un flujo de trabajo completo de ajuste fino y cuantización reproducible sobre una base abierta con licencia Apache 2.0; por otro, distribuye el resultado en tres formatos de despliegue (GGUF Q4_K_M, ONNX int4 para transformers.js y pesos originales fp16), lo que permite ejecutarlo tanto en llama.cpp como directamente en el navegador con WebGPU.

El modelo está orientado a un uso ligero y local, no a cargas de producción de alta concurrencia. Su contexto heredado de Qwen2.5-1.5B-Instruct es amplio para su tamaño, y el autor reporta una evaluación propia (40 preguntas no vistas y 30 de comprensión lectora) en la que la versión cuantizada Q4_K_M no pierde rendimiento respecto al fp16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), ajuste fino con LoRA |
| Parametros totales | 1.500 millones (heredados de Qwen2.5-1.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de la base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | GGUF Q4_K_M, ONNX int4 (q4f16), fp16 original |
| Idiomas soportados | japones (ja); la base Qwen2.5 soporta multilingue, pero el ajuste se ha realizado en japones |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (original), GGUF (cube-ultra-q4_k_m.gguf), ONNX (model_q4f16.onnx) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de tipo Qwen2 con 1.500 millones de parámetros, sobre el que se aplicó un ajuste fino LoRA con rango 16, alpha 32 y adaptadores en todas las capas lineales, durante 2 épocas. El conjunto de entrenamiento es enteramente sintético y de elaboración propia: 21.041 ejemplos en japonés repartidos en 10.000 pares de QA de definiciones, 6.500 de conversación informal, 3.043 de QA curado con ejercicios de cálculo y 1.498 de comprensión lectora. No se documenta el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de estas cifras.

No se menciona el uso de RLHF, DPO ni ninguna técnica de alineación adicional más allá del ajuste supervisado con LoRA. La innovación técnica destacable no está en la arquitectura, sino en el pipeline de distribución: el autor publica simultáneamente pesos fp16, una cuantización GGUF Q4_K_M (986.048.320 bytes) y una conversión ONNX int4 para transformers.js con WebGPU, y reporta que la cuantización Q4_K_M mantiene el rendimiento del fp16 en su evaluación interna, mientras que Q3_K_M degrada el resultado (25/40 frente a 30/40 en preguntas no vistas).

## Capacidades

- Generación de texto en japonés con registro conversacional y de asistente.
- Respuesta a preguntas de definición y conocimiento general.
- Comprensión lectora: responder preguntas sobre un texto proporcionado.
- Razonamiento aritmético básico, incluidos problemas verbales de multiplicación, cambio y división, que el autor reporta como resueltos correctamente en preguntas no vistas.
- Conversación multi-turno de carácter informal.
- Ejecución en navegador mediante transformers.js v3 con WebGPU (formato ONNX int4).
- Ejecución en dispositivos móviles mediante llama.cpp y runtimes compatibles como PocketPal (formato GGUF).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Chat conversacional local en japonés: el modelo puede gestionar diálogos multi-turno de temática general y conversación informal gracias a su ajuste específico sobre 6.500 ejemplos de charla; es adecuado para asistentes personales que se ejecutan en el dispositivo sin conexión.
- Asistente de estudio y definiciones: con 10.000 pares de QA de definiciones en el entrenamiento, sirve para responder preguntas conceptuales y explicar términos en japonés en aplicaciones educativas.
- Comprensión lectora automatizada: puede recibir un texto y responder preguntas sobre su contenido, lo que lo hace útil para ejercicios de lectura, resúmenes guiados o sistemas de evaluación de comprensión.
- Tutor de aritmética básica: los ejercicios de cálculo del conjunto de entrenamiento y su rendimiento en problemas verbales lo hacen apto para aplicaciones de práctica de matemáticas elementales en japonés.
- Despliegue en navegador sin backend: la conversión ONNX int4 con transformers.js y WebGPU permite integrar el modelo en una aplicación web estática que funciona en el cliente, sin costes de servidor ni envío de datos a terceros.
- Aplicación móvil offline: el GGUF Q4_K_M de aproximadamente 986 MB cabe en dispositivos móviles modernos y se ejecuta con llama.cpp o PocketPal, lo que habilita asistentes de bolsillo en japonés sin conexión.
- Prototipado e investigación de ajuste fino: al ser un LoRA sobre una base Apache 2.0 con pipeline documentado, sirve como referencia reproducible para experimentos de fine-tuning de bajo coste en una sola GPU.

## Benchmarks y rendimiento

El autor publica una evaluación propia con dos conjuntos: 40 preguntas no vistas ("初見40") y 30 de comprensión lectora ("読解30"). No son benchmarks estándar de la comunidad y no se comparan con otros modelos.

| Formato | Preguntas no vistas (40) | Comprensión lectora (30) |
|---|---:|---:|
| fp16 (original) | 30/40 | 29/30 |
| GGUF Q4_K_M | 30/40 | 29/30 (sin degradación, coincidencia total en las respuestas) |
| GGUF Q3_K_M | 25/40 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en fp16 (1.500 millones de parámetros a 2 bytes por peso, más overhead); en torno a 1-1,5 GB con GGUF Q4_K_M; menos de 1 GB con ONNX int4 en el navegador.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; para el formato GGUF Q4_K_M basta con GPU integradas o dedicadas de gama baja con 2 GB o más.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y en muchas GPU integradas recientes; también en Apple Silicon mediante llama.cpp con Metal.
- Opciones de despliegue: llama.cpp y runtimes derivados (PocketPal), transformers.js v3 con WebGPU para navegador, y cualquier framework compatible con Qwen2 en formato safetensors (vLLM, TGI, transformers) para la versión fp16.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cube Ultra | 1.500 M (LoRA sobre Qwen2.5-1.5B-Instruct) | no disponible | Apache 2.0 | safetensors, GGUF, ONNX | Ajuste en japonés; evaluación propia 30/40 y 29/30 |
| Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 tokens (según la documentación oficial de Qwen) | Apache 2.0 | safetensors, GGUF | Base multilingüe generalista; sin ajuste específico en japonés |
| Qwen2.5-0.5B-Instruct | 500 M | 32.768 tokens (según la documentación oficial de Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa más pequeña para dispositivos muy limitados |
| TinyLlama-1.1B-Chat | 1.100 M | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Base inglesa de tamaño similar; sin especialización en japonés |

Los datos de contexto de los modelos comparables provienen de la documentación pública de sus respectivos autores; los de Cube Ultra no se detallan en la información proporcionada. No se dispone de comparaciones de rendimiento entre Cube Ultra y estos modelos en benchmarks comunes.

## Limitaciones y advertencias

- El propio autor advierte que el modelo inventa con seguridad hechos concretos sobre Japón (ubicaciones de empresas, retratos de billetes, regiones de productos típicos); cita ejemplos reales de fabricación de datos. Para usos que requieran exactitud factual debe combinarse con búsqueda o índices externos.
- La capacidad de abstenerse cuando la respuesta no está en el texto proporcionado es débil: el modelo tiende a responder en lugar de decir "no lo sé".
- El ajuste está realizado exclusivamente en japonés, por lo que el rendimiento en otros idiomas puede degradarse respecto a la base Qwen2.5-1.5B-Instruct.
- El conjunto de entrenamiento es sintético y de pequeño tamaño (21.041 ejemplos), lo que limita la cobertura temática y puede introducir sesgos del autor.
- La evaluación publicada es interna, con conjuntos propios de 40 y 30 preguntas, sin comparación con benchmarks estándar ni con otros modelos; no permite extrapolar rendimiento general.
- La cuantización Q3_K_M degrada el rendimiento (25/40 frente a 30/40); el autor recomienda Q4_K_M como límite sin pérdida.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5 es obra de Alibaba y este repositorio no es una distribución oficial de Qwen.
- No hay información sobre tool calling, agentes ni razonamiento multi-paso; no debe asumirse su soporte en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FMA03/cube-ultra
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
