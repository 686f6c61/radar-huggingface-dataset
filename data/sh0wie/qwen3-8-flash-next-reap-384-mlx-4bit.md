# sh0wie/Qwen3.8-Flash-Next-REAP-384-MLX-4bit

## Resumen

Este modelo es una versión podada y cuantizada de Qwen3.8-Flash-Next, el último modelo multimodal de la familia Qwen, desarrollado por Alibaba. La poda se ha realizado con la técnica REAP (saliency-based expert pruning), reduciendo de 512 a 384 expertos por capa MoE, y los pesos se han convertido a formato MLX con cuantización affine de 4 bits. El resultado es un modelo que ocupa 80 GB en disco (frente a los 98 GB de la conversión base) y que mantiene un rendimiento muy cercano al original: 92,1 % en HumanEval pass@1 frente al 93,9 % del modelo sin podar.

La relevancia de esta versión radica en que permite ejecutar un modelo de la clase 180B en hardware de Apple Silicon con requisitos de memoria reducidos, especialmente si se utiliza el modo de tabla n-gram servida desde NVMe, que baja la memoria residente a 51 GB. El modelo conserva la arquitectura híbrida Gated DeltaNet + Qwen Sparse Attention, el contexto de 262K tokens y las capacidades multimodales del modelo base, aunque la calidad visual no ha sido evaluada tras la poda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (Gated DeltaNet + Qwen Sparse Attention), 48 capas, 384 expertos por capa (de 512 originales) |
| Parametros totales | 24.753.452.371 (según safetensors; el modelo base Qwen3.8-Flash-Next tiene 125B principales + 51B de tabla n-gram) |
| Parametros activos | 6B (del modelo base, el routing top-10 no se modifica) |
| Longitud de contexto | 262.144 tokens (heredada del modelo base) |
| Tipos de cuantizacion | 4-bit affine (grupo de 64; tabla n-gram grupo de 32) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se detalla) |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next es un modelo de mezcla de expertos ultra-dispersa con 125B de parámetros principales y una tabla de incrustación n-gram adicional de 51B, totalizando unos 176B parámetros. Activa 6B parámetros por token mediante un routing top-10. La arquitectura combina dos mecanismos de atención: tres de cada cuatro capas usan Gated DeltaNet (GDN) para comprimir el historial de forma eficiente, y la cuarta capa usa Qwen Sparse Attention (QSA) para recuperación precisa de contexto largo. Esta combinación mejora la eficiencia computacional y la capacidad del modelo respecto a generaciones anteriores.

La versión REAP-384 se obtiene podando 128 expertos por capa MoE (de 512 a 384) usando la saliencia REAP calibrada sobre los pesos cuantizados, con un conjunto de datos de ~686K tokens de tráfico de codificación agéntica. La poda se realiza en la propia máquina que servirá el modelo. Además, se corrigen dos defectos de la conversión base: los tensores RMSNorm se re-centran a la convención esperada por el runtime y los tensores de la tabla n-gram se renombran para coincidir con la ruta del módulo. El resultado es que el modelo carga con el runtime stock de mlx-vlm sin parches, y los logits coinciden con la referencia (diferencia máxima absoluta 0.0 en la posición final de prefill).

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de codificación agéntica (refactorización, validación de entrada, generación de funciones).
- Procesamiento multimodal: el modelo base acepta imágenes como entrada (torre de visión intacta), aunque la calidad visual tras la poda no ha sido evaluada.
- Soporte de contexto largo de 262K tokens, útil para documentos extensos, codebases completos y conversaciones multi-turno.
- Decodificación especulativa mediante un drafter MTP complementario (sh0wie/Qwen3.8-Flash-Next-MTP-Drafter-MLX-bf16), con tasa de aceptación del 44-68 % y aceleración de 1.5-2.6x en GPUs M5-class.
- Capacidades de agente y multi-step reasoning, heredadas del modelo base, que está optimizado para tareas de codificación agéntica.
- Multilingüismo: el modelo base soporta múltiples idiomas, pero no se especifica la lista en esta versión.

## Casos de uso

- Asistente de codificación en IDE: el modelo puede generar, refactorizar y validar código en tiempo real gracias a su fuerte rendimiento en HumanEval (92,1 %) y su capacidad de razonamiento. Su contexto de 262K permite cargar el proyecto completo en la ventana de atención.
- Agente autónomo de desarrollo: al estar calibrado con tráfico de codificación agéntica, puede planificar y ejecutar tareas multi-paso como corregir bugs, añadir validaciones o escribir tests, integrándose con herramientas de CI/CD.
- Análisis de codebases grandes: con 262K tokens de contexto, puede procesar repositorios enteros para generar documentación, detectar patrones problemáticos o proponer mejoras arquitectónicas.
- Servidor OpenAI-compatible en local: el modelo se sirve con `mlx_vlm.server` y expone una API compatible con OpenAI, lo que permite integrarlo en aplicaciones existentes sin cambios.
- Prototipado de aplicaciones multimodales: aunque la visión no está evaluada, la torre de visión intacta permite experimentar con entrada de imágenes combinada con instrucciones de texto en entornos con recursos limitados.
- Investigación en eficiencia de modelos: la poda REAP y el manifiesto de expertos (`reap_kept_experts.json`) permiten reproducir el proceso de poda y estudiar el impacto de la reducción de expertos en tareas de código.

## Benchmarks y rendimiento

La model card reporta resultados de HumanEval pass@1 para varias versiones de la escalera de poda, medidos en la misma máquina con 164 problemas y verificación por tests unitarios (una sola ejecución, sin intervalos de confianza):

| Build (expertos) | Disco | HumanEval pass@1 |
| --- | --- | --- |
| 512 (conversión stock) | 98 GB | 93,9 % |
| **384 (este build)** | **80 GB** | **92,1 %** |
| 320 | 72 GB | 90,9 % |
| 288 (elección eficiente) | 68 GB | 91,5 % |
| 256 | 65 GB | 88,4 % |

No se han publicado resultados de otros benchmarks (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Disco: 80 GB para los pesos cuantizados (frente a 98 GB del modelo base).
- Memoria residente: ~80 GB si se carga completamente en RAM; 51 GB si se sirve la tabla n-gram desde NVMe con el parche de lectura por filas (no incluido en mlx-vlm estándar).
- GPU: diseñado para Apple Silicon (M4, M5-class). En M5-class se reportan aceleraciones de 1.5-2.6x con decodificación especulativa; en M4 el rendimiento es aproximadamente break-even.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) debido a los 51 GB de memoria mínima; requiere hardware con memoria unificada de al menos 64 GB o más.
- Opciones de despliegue: mlx-vlm (generación y servidor OpenAI-compatible), con soporte para el drafter MTP. No se menciona compatibilidad con vLLM, llama.cpp u Ollama en esta versión específica.
- Latencia y throughput: no se proporcionan cifras concretas, pero la decodificación especulativa puede acelerar la generación entre 1.5 y 2.6x en hardware M5-class.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | HumanEval pass@1 | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- | --- |
| Qwen3.8-Flash-Next (stock) | 125B + 51B n-gram | 262K | 4-bit MLX (98 GB) | 93,9 % | Qwen Community 1.0 | HuggingFace |
| **REAP-384 (este modelo)** | 125B + 51B n-gram (podado a 384 expertos) | 262K | 4-bit MLX (80 GB) | 92,1 % | Qwen Community 1.0 | HuggingFace |
| REAP-288 (eficiencia) | 125B + 51B n-gram (podado a 288 expertos) | 262K | 4-bit MLX (68 GB) | 91,5 % | Qwen Community 1.0 | HuggingFace |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La calibración de la poda se realizó con un conjunto de datos de codificación agéntica de un solo equipo; la retención de calidad en dominios alejados del código puede ser menor.
- Las evaluaciones son de una sola ejecución, sin intervalos de confianza; diferencias de uno o dos puntos entre builds vecinos pueden deberse al ruido.
- La entrada de visión no ha sido probada después de la poda; la torre de visión está intacta pero su rendimiento real es desconocido.
- El modo de tabla n-gram desde NVMe requiere un parche propio que aún no está integrado en mlx-vlm; sin él, la memoria residente sube a ~80 GB.
- La licencia Qwen Community License 1.0 puede imponer restricciones de uso comercial; se recomienda revisar el texto completo de la licencia.
- El número de parámetros reportado en safetensors (24,75B) no coincide con la descripción del modelo base (125B + 51B); es posible que la metadata de HuggingFace sea incorrecta o que se refiera a una parte de los tensores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-REAP-384-MLX-4bit
- Modelo base (Qwen/Qwen3.8-Flash-Next): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Conversión base MLX 4-bit (Sawfwair/Qwen3.8-Flash-Next-MLX-4bit): https://huggingface.co/Sawfwair/Qwen3.8-Flash-Next-MLX-4bit
- Drafter MTP complementario: https://huggingface.co/sh0wie/Qwen3.8-Flash-Next-MTP-Drafter-MLX-bf16
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Documentación de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
