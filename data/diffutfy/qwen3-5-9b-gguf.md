# diffutfy/Qwen3.5-9B-GGUF

## Resumen

Qwen3.5-9B-GGUF es la versión cuantizada en formato GGUF del modelo Qwen3.5-9B, desarrollado originalmente por el equipo Qwen de Alibaba. Esta ficha concreta la publica el usuario diffutfy (con cuantización atribuida a AtomicChat) y está pensada para ejecutar el modelo en local mediante llama.cpp, Ollama o LM Studio sin necesidad de GPU de datacenter. El modelo base es un decodificador denso de 9,7 mil millones de parámetros con una ventana de contexto de 262.144 tokens (256K), lo que lo sitúa en la gama alta de contexto entre los modelos de su tamaño.

El modelo base combina una arquitectura híbrida con Gated Delta Networks y capas de atención convencional, y está entrenado con fusión temprana de tokens multimodales (texto e imagen). Esta versión GGUF, sin embargo, es solo texto: no incluye el proyector visual del modelo original, por lo que no puede procesar imágenes. La cuantización se ha realizado directamente desde los pesos originales con una matriz de importancia (imatrix) por tensor, lo que según el autor mantiene las versiones de baja precisión más cerca del modelo en precisión completa.

La relevancia de esta ficha es práctica: ofrece una escalera completa de cuantizaciones (Q4_K_M, UD-Q4_K_XL, Q5_K_M, Q6_K, Q8_0) con tamaños entre 5,6 GB y 9,5 GB, lo que permite desplegar un modelo de 256K de contexto en hardware de consumo. La licencia Apache 2.0 facilita el uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador denso, `Qwen3_5ForConditionalGeneration`, 32 capas, 16 cabezas de atención sobre 4 cabezas KV, arquitectura híbrida con Gated Delta Networks |
| Parametros totales | 8.953.803.264 (≈9,7B según el autor) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M (5,6 GB), UD-Q4_K_XL (6,4 GB), Q5_K_M (6,5 GB), Q6_K (7,4 GB), Q8_0 (9,5 GB); todas con imatrix |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea un decodificador transformer denso de 32 capas con 16 cabezas de atención y 4 cabezas KV (atención con consultas agrupadas, GQA), un vocabulario de 248.320 tokens y una arquitectura híbrida que combina Gated Delta Networks con capas de atención convencional. Según la model card, esta combinación está orientada a mantener alto throughput de inferencia con baja latencia. El entrenamiento del modelo base utiliza fusión temprana de tokens multimodales (texto e imagen), lo que le permite alcanzar paridad con la generación Qwen3 y superar a los modelos Qwen3-VL en benchmarks de razonamiento, código, agentes y comprensión visual.

No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La model card no detalla el proceso de alineación. La innovación técnica destacable de esta ficha es el proceso de cuantización: conversión a GGUF f16 desde los pesos originales y calibración con una matriz de importancia por tensor (imatrix), lo que según el autor mejora la fidelidad de las cuantizaciones de 4 bits respecto a una cuantización estándar.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto muy largo (hasta 256K tokens).
- Capacidades de código y matemáticas heredadas del modelo base Qwen3.5-9B.
- Capacidades de agentes y razonamiento multi-paso, según los benchmarks publicados por Qwen para el modelo base.
- Comprensión visual en el modelo base (texto e imagen), pero no disponible en esta versión GGUF, que no incluye proyector visual.
- Soporte de plantilla de chat Qwen3.5 9B; requiere el flag `--jinja` en llama.cpp para aplicar correctamente los turnos de conversación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local con contexto largo: el modelo puede mantener conversaciones multi-turno con documentos extensos en memoria gracias a sus 262.144 tokens de ventana, ejecutándose en un portátil con GPU de consumo mediante Q4_K_M (5,6 GB).
- Análisis de documentación técnica extensa: resúmenes y preguntas sobre bases de código, manuales o informes de cientos de páginas en una sola pasada, sin necesidad de trocear el contexto.
- Generación de código en local: integración en editores o pipelines mediante llama-server, con la cuantización Q6_K o Q8_0 para maximizar la fidelidad en tareas de programación.
- Prototipado de agentes offline: despliegue con llama.cpp u Ollama en entornos sin conectividad, útil para pruebas de razonamiento multi-paso y flujos de agentes antes de pasar a modelos mayores.
- Sustitución de APIs en desarrollo: al ser compatible con endpoints tipo OpenAI (según los tags del repo), puede actuar como backend local en pruebas de integración sin coste por token.
- Despliegue en estaciones de trabajo con una sola GPU: Q8_0 (9,5 GB) cabe en GPUs de 12-16 GB de VRAM, permitiendo calidad casi sin pérdidas para tareas de generación y análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una imagen de benchmarks con resultados publicados por Qwen para el modelo base `Qwen/Qwen3.5-9B`, pero no se proporcionan los valores numéricos en el texto, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo más el espacio para el contexto. Q4_K_M ≈ 5,6 GB; UD-Q4_K_XL ≈ 6,4 GB; Q5_K_M ≈ 6,5 GB; Q6_K ≈ 7,4 GB; Q8_0 ≈ 9,5 GB. Con contexto de 8K-32K hay que añadir varios GB adicionales de caché KV.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 con contexto amplio; RTX 4070/4080 o GPUs de 12-16 GB para Q4_K_M y Q5_K_M; A100/H100 no son necesarias para este tamaño, pero permiten contextos de 256K completos.
- Cabe en GPU de consumo: sí. Q4_K_M y UD-Q4_K_XL caben en GPUs de 8-12 GB; Q8_0 requiere 12-16 GB.
- Opciones de despliegue: llama.cpp (llama-server con `--jinja -ngl 99 -c 8192 -fa on`), Ollama (`ollama run hf.co/AtomicChat/Qwen3.5-9B-GGUF:Q4_K_M`), LM Studio, Jan y la aplicación Atomic Chat.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-GGUF (esta ficha) | ≈9,7B | 262.144 | Apache 2.0 | GGUF (imatrix) | Cuantizaciones Q4 a Q8, solo texto |
| Qwen/Qwen3.5-9B (base) | ≈9,7B | 262.144 | Apache 2.0 | safetensors | Modelo original, multimodal (texto e imagen) |
| Alternativas de ~9B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Esta versión GGUF es solo texto: no incluye el proyector visual del modelo base, por lo que no puede procesar imágenes aunque el modelo original sí.
- Es obligatorio pasar `--jinja` en llama.cpp para aplicar la plantilla de chat Qwen3.5 9B; sin ello el modelo puede generar turnos malformados.
- Las cuantizaciones de 4 bits introducen cierta pérdida de calidad respecto a precisión completa; el autor recomienda Q4_K_M o superior y Q6_K/Q8_0 para máxima fidelidad.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de esta cuantización.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; conviene validar el rendimiento en castellano antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar el archivo LICENSE del modelo base para confirmar condiciones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- El tamaño del repo (35,4 GB) incluye todas las cuantizaciones, no solo una.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/diffutfy/Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Repositorio de cuantización (AtomicChat): https://huggingface.co/AtomicChat/Qwen3.5-9B-GGUF
- Atomic Chat: https://atomic.chat
- GitHub Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- X (Twitter) de Atomic Chat: https://x.com/atomic_chat_hq
