# kaitchup/Qwen3.8-27B-SLQ-EAR98-v2

## Resumen

Qwen3.8-27B-SLQ-EAR98-v2 es una versión cuantizada del modelo Qwen3.8-27B de Qwen, publicada por The Kaitchup (el autor del newsletter "The Kaitchup — AI on a Budget"). El modelo original se ha comprimido mediante una versión personalizada de SLQ (Statistically-Lossless Quantization), un método que combina candidatos de cuantización entera generados con GPTQ y elige de forma independiente la precisión y el tamaño de grupo para cada proyección del modelo.

El objetivo del método es mantener una fidelidad estadística muy alta respecto al modelo BF16 original, medida mediante EAR (Expected Acceptance Rate), que cuantifica el solapamiento entre las distribuciones de probabilidad del siguiente token del modelo original y del comprimido. Esta versión alcanza un EAR medido del 98,004750 %, cumpliendo el objetivo declarado de superar el 98 %.

El resultado son pesos de 22,35 GB (frente a los aproximadamente 54 GB que ocuparía un modelo de 27B en BF16), con precisión entera mixta por capa, embeddings y activaciones en BF16, y los pesos MTP (multi-token prediction) del original conservados sin cambios en BF16. Está empaquetado para ejecutarse con el backend Humming de vLLM, lo que lo hace relevante para despliegues de inferencia eficientes en hardware moderno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3.8, con pesos MTP retenidos); no disponible si es MoE |
| Parametros totales | 19.465.564.912 (dato real de safetensors; el modelo base se denomina 27B) |
| Parametros activos | No disponible (no consta si es MoE) |
| Longitud de contexto | 262.144 tokens (según la configuración de vLLM validada: `--max-model-len 262144`) |
| Tipos de cuantizacion | SLQ (precisión entera mixta por proyección, candidatos GPTQ), empaquetado en compressed-tensors; embeddings y activaciones en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), 22,35 GB |

## Arquitectura y entrenamiento

El modelo base, Qwen/Qwen3.8-27B, es un transformer decoder de la familia Qwen que conserva los pesos MTP (multi-token prediction) originales en BF16, lo que habilita la decodificación especulativa, aunque esta no fue incluida en la validación de la release. Sobre ese modelo se aplica SLQ (Statistically-Lossless Quantization), un método del laboratorio IST-DASLab cuyo objetivo es la fidelidad estadística aproximada, no la igualdad numérica exacta de las salidas.

El proceso de compresión genera candidatos de cuantización entera con GPTQ (ejecutado localmente sobre el modelo base), a los que se suman variantes de refinamiento entero preexistentes y los pesos BF16 originales. Un algoritmo de búsqueda elige, para cada proyección del decodificador (incluidas las proyecciones Q/K/V de la atención completa, que comparten fila en el mapa de precisión), el bitwidth y el group size óptimos. El resultado se empaqueta en formato compressed-tensors para el backend Humming de vLLM. No se dispone de información sobre los datos de entrenamiento del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiqueta conversational).
- Razonamiento con parsing dedicado: el servidor vLLM validado admite `--reasoning-parser qwen3` para procesar las salidas de razonamiento del modelo.
- Tool calling / function calling automático: soportado mediante `--enable-auto-tool-choice --tool-call-parser qwen3_coder`.
- Contexto largo: hasta 262.144 tokens en la configuración validada, adecuado para documentos extensos y conversaciones multi-turno.
- Pesos MTP retenidos en BF16, lo que habilita potencialmente la decodificación especulativa (no validada en esta release).
- Pesos de visión originales retenidos (procesadores incluidos), aunque la inferencia de imagen/vídeo no fue validada; en el comando de ejemplo se desactivan explícitamente.

## Casos de uso

- Servidores de inferencia compatibles con la API de OpenAI en una sola GPU de gama alta: los 22,35 GB de pesos permiten servir el modelo con vLLM y el backend Humming en GPUs con memoria suficiente para pesos, buffers y KV cache.
- Chatbots con razonamiento: el reasoning parser de Qwen3 permite separar el razonamiento interno de la respuesta final en aplicaciones conversacionales.
- Agentes con llamada de herramientas: el soporte de tool calling automático con el parser qwen3_coder permite integrar el modelo en pipelines de agentes que ejecutan funciones, consultan APIs o interactúan con sistemas externos.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite resumir, analizar o responder preguntas sobre contratos, informes o bases de código extensas sin fragmentación.
- Reducción de coste de serving: la cuantización mixta reduce a menos de la mitad el footprint de pesos respecto a BF16 manteniendo un EAR del 98 %, útil para maximizar el throughput por GPU en producción.
- Investigación en cuantización: al conservar el mapa de precisión por capa y publicar la metodología EAR, es un buen punto de partida para estudiar el compromiso entre compresión y fidelidad estadística.
- Despliegue en hardware GH200/H100: la validación oficial se realizó sobre NVIDIA GH200 con vLLM 0.31.0 y humming-kernels 0.1.16, por lo que es especialmente adecuado para ese entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica cuantitativa publicada es el EAR (Expected Acceptance Rate) medido del modelo empaquetado:

| Métrica | Valor |
|---|---|
| EAR objetivo | >98 % |
| EAR medido (packed, EAR@10) | 98,004750 % |

Nota del autor: EAR mide el solapamiento medio de probabilidad sobre los diez tokens más probables del modelo BF16 de referencia; no equivale a precisión en benchmarks ni a respuestas idénticas. La equivalencia estadística en tareas downstream no ha sido establecida para esta release.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 22,35 GB; la memoria total de serving debe acomodar además los buffers de ejecución y la KV cache, que con 262.144 tokens de contexto puede ser considerable. Una estimación razonable parte desde unos 28-32 GB de VRAM para contextos moderados.
- GPU recomendada: NVIDIA GH200 (entorno de validación oficial, con vLLM 0.31.0 y humming-kernels 0.1.16). Las H100 y GPUs con soporte de Humming en vLLM son candidatas razonables; el autor advierte que otros runtimes pueden dar resultados ligeramente distintos.
- Consumer GPU: no cabe cómodamente en una RTX 4090 (24 GB) si se cuenta la KV cache y los buffers, aunque los pesos por sí solos (22,35 GB) rozan el límite. GPUs de 48 GB o superior (A6000, L40S, A100 40/80 GB, H100) son la opción segura.
- Despliegue: vLLM con soporte Humming (`--quantization compressed-tensors --linear-backend humming --dtype bfloat16`). No se menciona soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| kaitchup/Qwen3.8-27B-SLQ-EAR98-v2 | 19,47B (safetensors) | SLQ mixto, compressed-tensors, 22,35 GB | 262.144 | Apache 2.0 | EAR 98,00 %; requiere vLLM + Humming |
| Qwen/Qwen3.8-27B (base) | ~27B (BF16, ~54 GB) | BF16 | No disponible en la info proporcionada | Apache 2.0 | Referencia de fidelidad; soporta visión y MTP sin restricciones validadas |
| Versiones SLQ anteriores (EAR ~97,8 %) del mismo autor | No disponible | SLQ con objetivo EAR más laxo | No disponible | Apache 2.0 | Menor tamaño a cambio de menor fidelidad estadística |

## Limitaciones y advertencias

- "Statistically lossless" no significa salida idéntica: SLQ persigue fidelidad estadística aproximada; la equivalencia en tareas downstream no ha sido establecida para esta release, según el propio autor.
- La inferencia de imagen y vídeo, así como la decodificación especulativa, no fueron incluidas en la validación, pese a que los pesos de visión y MTP están retenidos.
- Dependencia de un stack concreto: requiere vLLM con soporte Humming (validado con vLLM 0.31.0 y humming-kernels 0.1.16); no hay garantías de funcionamiento en otros runtimes.
- Los resultados medidos corresponden al camino de ejecución probado (GH200); otros hardwares pueden dar resultados ligeramente diferentes.
- El KV cache para contextos de hasta 262.144 tokens puede requerir memoria adicional muy significativa por encima de los 22,35 GB de pesos.
- Idiomas soportados, sesgos conocidos y tasas de alucinación: no disponibles en la documentación proporcionada; deben evaluarse sobre el modelo base Qwen3.8-27B.
- La licencia Apache 2.0 no impone restricciones al uso comercial, pero conviene revisar también los términos del modelo base de Qwen.
- Adopción muy temprana: 147 descargas y 1 like en el momento de la ficha, sin historial comunitario de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR98-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper de SLQ: https://arxiv.org/abs/2605.02404
- Repositorio de SLQ: https://github.com/IST-DASLab/SLQ
- Newsletter del autor (The Kaitchup): https://kaitchup.substack.com/subscribe
- Apoyo al autor: https://buymeacoffee.com/kaitchup
