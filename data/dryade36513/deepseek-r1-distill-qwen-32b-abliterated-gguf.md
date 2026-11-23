# dryade36513/DeepSeek-R1-Distill-Qwen-32B-abliterated-GGUF

## Resumen

DeepSeek-R1-Distill-Qwen-32B-abliterated-GGUF es un repositorio de cuantizaciones GGUF del modelo huihui-ai/DeepSeek-R1-Distill-Qwen-32B-abliterated, que a su vez es una variante "abliterated" (sin mecanismos de rechazo) del modelo destilado DeepSeek-R1 sobre la base Qwen2.5-32B. Lo publica el usuario dryade36513 en Hugging Face, con cuantizaciones generadas mediante llama.cpp (release b4546) e imatrix. El objetivo es ofrecer una versión ejecutable en hardware de consumo y en LM Studio, sin las restricciones de alineación del modelo original.

El modelo subyacente hereda la capacidad de razonamiento de DeepSeek-R1, destilada sobre una arquitectura transformer densa de aproximadamente 32.700 millones de parámetros. La variante abliterated elimina la dirección de rechazo del espacio de activaciones, de modo que el modelo responde a peticiones que el original rechazaría. Este repositorio aporta exclusivamente los pesos cuantizados en formato GGUF, no el entrenamiento ni la modificación de comportamiento.

Es relevante para desarrolladores que necesitan un modelo de razonamiento de 32B ejecutable en local, con múltiples niveles de cuantización (desde bf16 hasta Q3), y que requieren un comportamiento sin filtros para investigación, generación creativa o evaluación de sesgos. La licencia no está declarada en el repositorio, lo que constituye una limitación importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen2.5-32B, destilado de DeepSeek-R1) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_1, Q4_K_L, Q4_K_M, Q4_K_S, Q4_0, IQ4_NL, Q3_K_XL, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); pesos originales en safetensors en el modelo base |
| Tamano del repo | 519.0 GB |
| Herramienta de cuantizacion | llama.cpp b4546 con imatrix |
| Modelo base | huihui-ai/DeepSeek-R1-Distill-Qwen-32B-abliterated |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 32B parámetros derivado de Qwen2.5-32B, sobre el que se aplicó destilación de DeepSeek-R1. La destilación transfiere el comportamiento de razonamiento paso a paso (cadenas de pensamiento) del modelo R1 original a una arquitectura más pequeña y eficiente. La variante abliterated de huihui-ai modifica los pesos para eliminar la dirección de rechazo, un procedimiento que identifica la dirección en el espacio de activaciones asociada a respuestas de negativa y la proyecta fuera, sin reentrenamiento completo.

Este repositorio concreto no entrena ni modifica el modelo: solo cuantiza los pesos ya abliterated usando llama.cpp con el dataset de calibración imatrix de bartowski. Las cuantizaciones con sufijo _L (Q6_K_L, Q5_K_L, Q4_K_L, Q3_K_XL) usan Q8_0 para los pesos de embedding y de salida, lo que mejora la calidad respecto a las variantes estándar del mismo nivel. El formato de prompt documentado es `<｜begin▁of▁sentence｜>{system_prompt}<｜User｜>{prompt}<｜Assistant｜><｜end▁of▁sentence｜><｜Assistant｜>`.

## Capacidades

- Generación de texto conversacional y de razonamiento multi-paso, heredado de la destilación de DeepSeek-R1.
- Razonamiento matemático y lógico mediante cadenas de pensamiento explícitas.
- Generación y explicación de código, incluyendo tareas de depuración y refactorización.
- Comportamiento sin rechazo (uncensored) para contenido que el modelo original declinaría.
- Ejecución local en LM Studio y en cualquier runtime compatible con GGUF (llama.cpp, Ollama, KoboldCpp).
- Compatibilidad con endpoints (tag endpoints_compatible en el repositorio).
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling y function calling: no documentado en la información disponible.
- Visión y audio: no soportados (modelo de texto).

## Casos de uso

- Investigación sobre alineación y sesgos: la variante abliterated permite estudiar qué respuestas se eliminan con el entrenamiento de rechazo y comparar el comportamiento frente al modelo original, usando las cuantizaciones Q8_0 o Q6_K para minimizar la pérdida de fidelidad.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles, donde la versión estándar rechazaría la petición; la cuantización Q4_K_M ofrece un equilibrio razonable entre tamaño y calidad.
- Razonamiento matemático en local: resolución de problemas paso a paso en entornos sin conexión, desplegando la cuantización Q5_K_M en una GPU de 24 GB o en CPU con suficiente RAM.
- Asistencia de programación en equipos de desarrollo: generación de código y explicaciones técnicas en un portátil o estación de trabajo con 16-24 GB de VRAM, usando Q3_K_XL o IQ4_XS si la memoria es limitada.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 18 niveles distintos, lo que permite medir la degradación de calidad del razonamiento entre bf16 y Q3 en pipelines de evaluación propios.
- Procesamiento de documentos y resúmenes offline: análisis de textos largos en entornos air-gapped donde no se puede usar una API en la nube, con la cuantización que mejor se ajuste al hardware disponible.
- Despliegue en LM Studio para pruebas rápidas: el autor indica explícitamente que las cuantizaciones están pensadas para ejecutarse en LM Studio, útil para prototipado sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según el fichero: bf16 requiere 65,54 GB (no cabe en una sola GPU de consumo); Q8_0 34,82 GB; Q6_K_L 27,26 GB; Q5_K_M 23,26 GB; Q4_K_M 19,85 GB; Q3_K_M 15,94 GB; IQ3_M por debajo de 15,94 GB.
- GPU recomendadas: A100 80 GB o H100 para bf16 y Q8_0; RTX 4090 (24 GB) para Q5_K_M, Q4_K_M y Q4_K_S; RTX 3090 o RTX 4080 para cuantizaciones Q4 e inferiores.
- Cabe en GPU de consumo: sí, desde Q5_K_M hacia abajo en tarjetas de 24 GB; Q4_K_M y Q3_K_XL en tarjetas de 16 GB con margen ajustado para el contexto.
- Opciones de despliegue: llama.cpp, LM Studio (recomendado por el autor), Ollama y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-32B-abliterated-GGUF (este) | 32,76B | no disponible | GGUF | no disponible | Cuantizaciones imatrix, sin rechazo |
| huihui-ai/DeepSeek-R1-Distill-Qwen-32B-abliterated | 32,76B | no disponible | safetensors | no disponible | Modelo base sin cuantizar |
| DeepSeek-R1-Distill-Qwen-32B (original) | 32,76B | no disponible | safetensors, GGUF | MIT (modelo original de DeepSeek) | Con alineación y rechazo |
| Qwen2.5-32B-Instruct | 32,76B | 131.072 tokens (según documentación de Qwen) | safetensors, GGUF | Apache 2.0 | Base arquitectónica, sin razonamiento destilado |

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio, lo que impide confirmar si el uso comercial está permitido; hay que remitirse al modelo base y al modelo original de DeepSeek antes de usarlo en producción.
- El proceso de abliteration degrada la coherencia en algunas áreas y puede aumentar la probabilidad de respuestas dañinas, sesgadas o factualmente incorrectas; no es apto para aplicaciones orientadas al público sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos destilados de razonamiento, especialmente en tareas factuales y con cuantizaciones bajas (Q3 e IQ3).
- Las cuantizaciones por debajo de Q4_K_M pierden calidad de forma notable en tareas de razonamiento; el autor califica Q3_K_M como "low quality".
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni resultados de benchmarks publicados.
- El modelo es solo de texto; no soporta visión, audio ni tool calling documentado.
- Los idiomas soportados no están declarados; el comportamiento multilingüe no está verificado.
- La longitud de contexto no está documentada en este repositorio; conviene consultar la del modelo base antes de diseñar aplicaciones con ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dryade36513/DeepSeek-R1-Distill-Qwen-32B-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/huihui-ai/DeepSeek-R1-Distill-Qwen-32B-abliterated
- Repositorio de cuantizaciones de referencia (bartowski): https://huggingface.co/bartowski/DeepSeek-R1-Distill-Qwen-32B-abliterated-GGUF
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Release de llama.cpp usada: https://github.com/ggerganov/llama.cpp/releases/tag/b4546
- Dataset de calibración imatrix: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- LM Studio: https://lmstudio.ai/
