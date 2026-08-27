# Myric/Qwen3.8-Flash-Next-APEX-GGUF

## Resumen

Myric/Qwen3.8-Flash-Next-APEX-GGUF es una conversión no oficial a formato GGUF del modelo multimodal Qwen3.8-Flash-Next de Qwen, publicado por el usuario Myric en HuggingFace. El modelo base es un MoE ultra-esparso de 180 mil millones de parámetros totales con solo 6,8 mil millones activos por token, diseñado para ofrecer un equilibrio entre capacidad y eficiencia computacional. Su arquitectura combina Gated DeltaNet (GDN) con Qwen Sparse Attention (QSA) en una configuración híbrida: tres de cada cuatro capas utilizan GDN para comprimir el historial, mientras que la cuarta emplea QSA para recuperación de contexto de largo alcance. Además incorpora embeddings n-gram por capa y un contexto de 262.144 tokens.

Esta conversión GGUF es un trabajo en progreso: solo se han subido el archivo BF16 completo (354 GB) y el proyector de visión (0,9 GB). El nombre "APEX" sugiere cuantizaciones futuras, pero actualmente no hay ninguna disponible. El archivo BF16 es una conversión sin pérdida de los tensores del checkpoint, pensada como entrada para procesos de cuantización, no para inferencia directa. El modelo requiere una versión parcheada de llama.cpp con la arquitectura `qwen4_exp` (PR #27742) que aún no está fusionada en el mainline, lo que limita su uso a builds específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal, híbrido GDN + QSA (3 de cada 4 capas GDN, la cuarta QSA), 48 capas, 512 expertos enrutados, top-10 routing |
| Parametros totales | 180 B (incluye MTP head de 2,607 B y vision tower de 0,449 B) |
| Parametros activos | ~6,8 B (segun la model card; vLLM indica 6 B activos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Solo BF16 (conversion completa) y F16 (proyector de vision). No hay cuantizaciones APEX aun; el README indica que los k-quants e i-quants de 256 bloques no son utilizables en la mayoria de los tensores (92,3 B de 180 B) por anchos de fila no divisibles por 256 |
| Idiomas soportados | No disponible (la model card no especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (BF16 y F16 para el proyector) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-Flash-Next (desarrollado por Qwen) introduce cuatro innovaciones clave respecto a generaciones anteriores: atención, residuos, embeddings y optimización. La arquitectura de atención es híbrida: tres de cada cuatro capas usan Gated DeltaNet (GDN), que comprime el historial en un estado recurrente con coste de memoria constante, mientras que la cuarta capa emplea Qwen Sparse Attention (QSA) para recuperar información precisa de posiciones distantes. Esto permite manejar contextos de 262 K tokens sin el coste cuadratico de la atención completa.

Además, el modelo incorpora una tabla de embeddings n-gram por capa (51,2 B de parámetros) que actúa como una memoria esparcida de consulta por token, y un MTP head (multi-token-prediction) de 2,607 B parámetros para decodificación especulativa, aunque este último no está incluido en la conversión GGUF. La capa de visión es un tower de 0,449 B parámetros. La conversión GGUF de Myric es una copia bit-exacta del checkpoint bfloat16, sin pérdidas, pero descarta silenciosamente los tensores del MTP head y separa el proyector de visión en un archivo aparte. No se dispone de información sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento complejo con contexto largo (262 K tokens).
- Procesamiento multimodal: entrada de imágenes mediante el proyector de visión (mmproj) que se pasa con la opción `--mmproj` en llama.cpp.
- Sparse attention con recuperación de información a larga distancia gracias a la combinación GDN + QSA.
- Eficiencia computacional: solo se activan ~6,8 B de parámetros por token, lo que reduce el coste de inferencia frente a un MoE denso del mismo tamaño.
- No se ha confirmado soporte para tool calling, function calling o agentes en la información disponible; la model card no menciona estas capacidades.
- Capacidades multilingües no especificadas; el modelo base es de Qwen y probablemente soporte varios idiomas, pero no hay datos concretos.

## Casos de uso

- **Procesamiento de documentos extensos**: gracias a su ventana de contexto de 262 K tokens, puede resumir o analizar manuales técnicos, contratos o libros completos en una sola pasada, sin necesidad de truncamiento.
- **Análisis de código a gran escala**: puede recibir repositorios completos y razonar sobre dependencias y arquitectura, útil para revisión de código o generación de documentación.
- **Asistentes de visión por computadora**: con el proyector de visión, puede responder preguntas sobre imágenes (VQA), describir fotografías o extraer información de diagramas, combinado con el razonamiento textual.
- **Investigación en modelos de atención**: dado su diseño experimental (GDN + QSA), es una plataforma para estudiar alternativas a la atención de transformer estándar y para comparar eficiencia vs calidad en MoE ultra-esparsos.
- **Prototipado de inferencia en hardware limitado**: aunque el BF16 no es útil para producción, los futuros cuantizadores podrían permitir ejecutarlo en GPUs con 80 GB o menos (si se resuelve el problema de los tensores no divisibles por 256), abriendo la puerta a despliegues locales.
- **Decodificación especulativa**: el MTP head (no incluido en el GGUF) permite acelerar la generación, pero al no estar presente en la conversión, este caso de uso solo es posible con el checkpoint original en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion proporcionada. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas. El modelo original de Qwen podría tener datos en su repositorio oficial, pero no se han facilitado en el contexto de esta ficha.

## Requisitos de hardware

- **BF16 completo**: 354 GB de VRAM solo para el backbone (sin contar el proyector de visión). Es inviable para cualquier GPU comercial; está pensado como entrada para cuantización, no para inferencia.
- **Proyector de visión**: 0,9 GB, puede cargarse en cualquier GPU con VRAM suficiente, pero requiere el backbone.
- **Cuantizaciones futuras**: el README estima que una cuantización con `IQ4_XS` en los tensores grandes y `IQ2_XXS` en los pequeños daría ~77-112 GB, lo que cabría en GPUs como A100 80 GB (con offloading) o H100 80 GB, pero no en consumer GPUs (RTX 4090 tiene 24 GB). Sin embargo, la incompatibilidad de anchos de fila (640 y 160) limita los tipos de cuantización disponibles.
- **llama.cpp**: requiere una build del PR #27742 (rama `qwen4exp-pr27742-spill-fix` de brywil). No funciona con builds estándar.
- **Opciones de despliegue**: llama.cpp es la única opción conocida; no se mencionan vLLM, Ollama ni TGI en la información disponible. vLLM tiene soporte oficial para Qwen3-3-Flash-Next según los recipes de vLLM, pero no para este formato GGUF.
- **Latencia y throughput**: no disponibles; dependen de la cuantización y del hardware.

## Comparativa con modelos similares

No hay datos suficientes para una comparación rigurosa. Se puede indicar que el modelo base es comparable a otros MoE ultra-esparsos como Qwen3-235B-A22B o DeepSeek-V3, pero no se tienen cifras de rendimiento para establecer una tabla comparativa. En términos de arquitectura, su combinación GDN + QSA es única, mientras que otros MoE usan atención densa o sparse de forma uniforme. La licencia Apache-2.0 es más permisiva que la de DeepSeek-V3 (MIT) o Qwen3-235B-A22B (Apache-2.0 también), pero la disponibilidad de la conversión GGUF es limitada por el estado no oficial y la necesidad de llama.cpp parcheado.

## Limitaciones y advertencias

- **Conversión incompleta**: el GGUF no incluye el MTP head (2,607 B parámetros) y el proyector de visión está separado. Si se necesita el modelo completo, hay que usar los safetensors originales.
- **Requisito de llama.cpp parcheado**: la arquitectura `qwen4_exp` no está en mainline; solo funciona con el PR #27742 o el fork de brywil. Cualquier actualización de llama.cpp puede romper la compatibilidad.
- **Problemas de cuantización**: los tensores con anchos 640 y 160 no son divisibles por 256, lo que impide usar k-quants y i-quants de 256 bloques en el 51% de los parámetros, limitando la relación calidad/tamaño de las cuantizaciones.
- **Sesgos y alucinaciones**: no hay datos específicos sobre sesgos, pero al ser un modelo MoE de 180 B entrenado con datos web, puede presentar alucinaciones en tareas de razonamiento complejo o factualidad, como otros modelos de su tamaño.
- **Restricciones de uso**: aunque la licencia es Apache-2.0, la conversión es no oficial y sin respaldo de Qwen, por lo que no hay garantías de soporte ni de reproducción exacta de los resultados del modelo original.
- **No apto para producción**: el BF16 no es viable para inferencia real; el modelo necesita cuantización, que aún no se ha publicado. Los usuarios deben esperar a que se complete el trabajo de APEX o usar los safetensors originales con otros frameworks.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/Myric/Qwen3.8-Flash-Next-APEX-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oficial de Qwen3.8-Flash-Next en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Repositorio de la serie Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Página del modelo en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Página de Qwen3.8-Flash en QwenCloud: https://www.qwencloud.com/models/qwen3.8-flash
- PR de llama.cpp para soporte de Qwen4Exp: https://github.com/ggml-org/llama.cpp/pull/27742
- Fork de llama.cpp con el fix de conversión: https://github.com/brywil/llama.cpp/tree/qwen4exp-pr27742-spill-fix
