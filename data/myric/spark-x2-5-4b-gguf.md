# Myric/Spark-X2.5-4B-GGUF

## Resumen

Spark-X2.5-4B es un modelo de lenguaje denso de 4.11 mil millones de parámetros desarrollado por XHToken, publicado bajo licencia Apache-2.0. Este repositorio concreto de Myric ofrece una conversión a formato GGUF en precisión bf16, sin cuantizar, del modelo original. El modelo está diseñado para tareas generales de conversación, escritura, traducción, razonamiento, generación de código, uso de herramientas y flujos de trabajo agénticos.

Su arquitectura destaca por una atención intercalada de ventana deslizante: de las 36 capas, 27 usan atención con ventana de 512 tokens y 9 usan atención completa, siguiendo un patrón estricto `sssF`. Esta combinación reduce significativamente el coste de la memoria KV en contextos largos, ya que solo las 9 capas de atención completa escalan con la longitud de la secuencia. El modelo declara una longitud de contexto máxima de 1.048.576 tokens y, al ser un modelo de razonamiento, emite un bloque de pensamiento antes de la respuesta final.

La relevancia de este lanzamiento radica en ofrecer una referencia en alta precisión para poder verificar cuantizaciones posteriores, ya que la arquitectura `spark2_5` requiere una rama parcheada de llama.cpp para poder ejecutarse.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención intercalada sliding-window (27 capas con ventana 512 y 9 capas completas) |
| Parametros totales | 4.112.079.360 (4.11B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.048.576 tokens (declarado; requiere pasar `--ctx-size` en llama.cpp) |
| Tipos de cuantizacion | No disponible (solo bf16 en este repo; el autor indica que las cuantizaciones QK_K son legales por dimensiones divisibles entre 256) |
| Idiomas soportados | No disponible (el modelo es general-purpose; la ficha no especifica lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (bf16); el modelo base está disponible en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso con 36 capas, 16 cabezas de consulta, 4 cabezas KV, dimensión de cabeza 256, tamaño oculto 2560, FFN GELU, vocabulario de 131.072 tokens y embeddings atados. La innovación principal es la atención intercalada: 27 capas usan atención con ventana deslizante de 512 tokens y 9 capas usan atención completa, en un patrón `sssF`. Esto hace que el coste de la memoria KV sea muy bajo en comparación con un transformer de atención completa equivalente: solo las 9 capas completas escalan con el contexto, lo que da un coste de 36 KiB por token en formato f16.

El modelo emplea dos configuraciones de RoPE distintas según el tipo de capa: las capas de ventana deslizante rotan 256 de 256 dimensiones con theta 10.000, mientras que las capas de atención completa rotan solo 64 de 256 dimensiones con theta 5.000.000. Aplicar una única configuración a todas las capas produce un modelo que carga y genera texto fluido pero incorrecto, sin errores aparentes. Por eso es imprescindible utilizar la rama parcheada de llama.cpp que implementa correctamente la arquitectura.

Los datos de entrenamiento no se detallan en la información disponible. El modelo se presenta como un modelo de razonamiento que emite un bloque de pensamiento, y la verificación realizada por el autor confirma que la generación greedy es byte-idéntica a la referencia de HuggingFace (transformers 4.57.1) durante 24 tokens en una secuencia de prueba que cruza capas de ambos tipos.

## Capacidades

- Generación de texto conversacional y escritura creativa.
- Razonamiento y resolución de problemas multi-paso, con emisión de un bloque de pensamiento.
- Traducción automática (la ficha no especifica los idiomas concretos).
- Generación de código y soporte de tool calling / function calling.
- Capacidad para flujos de trabajo agénticos y encadenamiento de razonamiento.
- Contexto largo de hasta 1M tokens, con un coste de memoria KV notablemente bajo gracias a la atención intercalada.
- Soporte de agentes y multi-step reasoning, según la descripción oficial del modelo.

## Casos de uso

- Asistentes conversacionales con historial extenso: el modelo puede mantener conversaciones de larga duración sin agotar la memoria KV; con 128k tokens de contexto, la KV ocupa solo 4.5 GiB en f16, lo que permite ejecutar el modelo en una GPU de gama alta.
- Análisis de documentos largos: es adecuado para resumir o extraer información de contratos, informes técnicos o expedientes de más de 100k tokens, aprovechando su ventana de 1M.
- Generación de código en producción: al soportar tool calling, puede integrarse en pipelines de CI/CD para asistir en la revisión de código, generar pruebas o automatizar tareas de desarrollo.
- Agentes autónomos multi-paso: su capacidad de razonamiento y uso de herramientas permite construir agentes que planifican y ejecutan acciones encadenadas, como consultar APIs o manipular datos.
- Traducción asistida: el modelo puede traducir textos largos manteniendo coherencia contextual, aunque los idiomas exactos no están especificados.
- Investigación en arquitecturas eficientes: la atención intercalada sliding-window es un caso de estudio interesante para comparar el coste de KV frente a modelos de atención completa del mismo tamaño.
- Despliegue en entornos con restricciones de licencia: al ser Apache-2.0, permite uso comercial sin coste de licencia, lo que facilita su adopción en productos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye datos de MMLU, HumanEval, GSM8K ni otras evaluaciones. La única verificación documentada es una comprobación de byte-identidad con la referencia de HuggingFace en generación greedy, que no constituye un benchmark de rendimiento.

## Requisitos de hardware

- Pesos en bf16: 7.67 GiB (8.23 GB). La VRAM total necesaria debe sumar los pesos, la KV cache y un overhead de unos 1-2 GB.
- KV cache estimada en f16: 32k tokens -> 1.1 GiB; 128k -> 4.5 GiB; 256k -> 9.0 GiB; 1M -> 36 GiB.
- VRAM total estimada: para 32k, aproximadamente 10-11 GB; para 128k, unos 14 GB; para 256k, unos 19 GB; para 1M, unos 45 GB.
- GPU recomendadas: una RTX 4090 (24 GB) puede manejar 128k en bf16; para 256k se recomienda una A100 80 GB o H100; para 1M se necesitan GPUs con 80 GB o más, o bien cuantizar el modelo y usar la KV en f16.
- En GPU de consumo con 12-16 GB, se puede ejecutar con contexto corto (32k) en bf16, o con contextos mayores si se cuantiza el modelo (por ejemplo, Q4_K_M).
- Opciones de despliegue: llama.cpp con la rama parcheada `model/Spark2_5` para el formato GGUF; el modelo base se puede cargar con transformers 4.57.1.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Spark-X2.5-4B | 4.11B | 1.048.576 | Apache-2.0 | GGUF, safetensors |
| Qwen2.5-3B | 3.09B | 32.768 (ampliable a 131.072 con YaRN) | Apache-2.0 | GGUF, safetensors |
| Llama-3.2-3B | 3.21B | 131.072 | Llama 3.2 Community License | GGUF, safetensors |
| Phi-3.5-mini | 3.82B | 131.072 | MIT | GGUF, safetensors |

Spark-X2.5-4B destaca por su contexto nativo de 1M tokens, muy superior al de los modelos comparados, y por su licencia Apache-2.0, que permite uso comercial sin restricciones. Sin embargo, al no disponer de benchmarks publicados, no es posible comparar su rendimiento real con estas alternativas.

## Limitaciones y advertencias

- El modelo requiere una rama parcheada de llama.cpp (`model/Spark2_5`) para cargarse; el llama.cpp upstream no reconoce la arquitectura `spark2_5` y fallará en la comprobación de arquitectura.
- Aplicar una configuración RoPE incorrecta produce un modelo que carga sin errores pero genera salidas fluídas y plausibles que son incorrectas. Hay que usar la rama correcta y verificar la salida.
- La calidad de recuperación en contextos largos no ha sido medida; la model card indica explícitamente que la memoria KV es un cálculo de memoria, no una afirmación de calidad de recuperación.
- No se han publicado evaluaciones de sesgos, alucinaciones ni seguridad, por lo que el riesgo de alucinación no está caracterizado.
- Los idiomas soportados no están especificados, lo que limita su uso en aplicaciones multilingües sin una evaluación previa.
- En este repositorio solo se distribuye la versión bf16, que requiere más VRAM que una versión cuantizada. Para despliegue en GPU de consumo, habrá que cuantizar el modelo.
- El contexto de 1M tokens exige una memoria KV de 36 GiB en f16, lo que hace inviable su uso completo en GPUs de 24 GB o menos sin estrategias de offloading o cuantización de KV.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/Myric/Spark-X2.5-4B-GGUF
- Repositorio HuggingFace del modelo base: https://huggingface.co/XHToken/Spark-X2.5-4B
- Repositorio GitHub del modelo: https://github.com/XHToken/Spark-X2.5
- Rama parcheada de llama.cpp: https://github.com/brywil/llama.cpp (rama `model/Spark2_5`)
