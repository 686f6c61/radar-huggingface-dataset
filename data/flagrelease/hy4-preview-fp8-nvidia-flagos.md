# FlagRelease/Hy4-preview-FP8-nvidia-FlagOS

## Resumen

Hy4-preview-FP8-nvidia-FlagOS es una versión cuantizada en FP8 del modelo Hy4-preview, un MoE (Mixture of Experts) de nueva generación desarrollado por el equipo Hy de Tencent. Esta variante concreta ha sido publicada por FlagRelease, una organización que distribuye versiones de modelos open source optimizadas para hardware específico, en este caso para GPUs NVIDIA con su stack de software propietario FlagOS. El modelo resuelve el problema del despliegue eficiente de modelos de gran escala en entornos de producción, reduciendo los requisitos de memoria mediante cuantización FP8 y ofreciendo scripts de inferencia listos para usar con contenedores Docker preconfigurados.

La arquitectura base es un transformer MoE con 78 capas, donde la primera capa usa una FFN densa y las 77 restantes emplean MoE con 256 expertos enrutados y 1 experto compartido por capa. Según los pesos reales en safetensors, el modelo tiene 803.516.203.997 parámetros totales, aunque la documentación oficial de Tencent indica 770B; la discrepancia puede deberse a diferencias en el conteo o a la inclusión de embeddings y cabezales. Los parámetros activos por token son 49B. La licencia es Apache-2.0 y los idiomas soportados son chino e inglés. La longitud de contexto no se ha especificado en la información disponible.

Esta versión FlagOS se distingue por integrar el stack de software FlagOS (incluyendo FlagGems y plugins de vLLM) que promete un despliegue en minutos con un rendimiento validado frente a la versión nativa. Los benchmarks publicados muestran resultados prácticamente idénticos entre la versión original y la optimizada, con una ligera caída en GPQA_Diamond (90.91 vs 89.9) y el mismo valor en MuSR (82.8).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE, 78 capas (1 densa + 77 MoE), 256 expertos enrutados + 1 compartido por capa |
| Parametros totales | 803.516.203.997 (segun safetensors); la documentacion oficial indica 770B |
| Parametros activos | 49B (segun documentacion oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (esta version); el modelo original tambien tiene version FP8 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer MoE estándar pero a gran escala. El backbone consta de 78 capas: la primera capa utiliza una FFN densa convencional, mientras que las 77 restantes sustituyen la FFN por un bloque MoE con 256 expertos enrutados y 1 experto compartido. Cada token activa un subconjunto de expertos (49B parámetros activos de un total de 770-803B), lo que permite un coste computacional por token muy inferior al de un modelo denso equivalente. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información disponible.

La versión FlagOS añade una capa de optimización de software: se integra con el stack FlagOS, que incluye FlagGems (una biblioteca de kernels optimizados para GPUs NVIDIA) y plugins específicos para vLLM (versión 0.24.0). El contenedor Docker proporcionado incluye CUDA 12.9, PyTorch 2.11 y Python 3.12, y está diseñado para ejecutarse en clústeres multi-nodo con NCCL. La validación de consistencia se realizó comparando los resultados de benchmarks entre el stack nativo y el stack FlagOS, mostrando diferencias mínimas.

## Capacidades

- Generación de texto y razonamiento complejo: los benchmarks publicados (GPQA_Diamond 89.9, MuSR 82.8) indican un alto rendimiento en tareas de razonamiento científico y de sentido común.
- Soporte multilingüe: chino e inglés, según la configuración de idiomas declarada.
- Inferencia optimizada para GPUs NVIDIA: gracias a la cuantización FP8 y al stack FlagOS, el modelo está pensado para despliegue en producción con vLLM.
- No se ha especificado soporte para tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Inferencia de modelos MoE de gran escala en producción: el modelo está diseñado para ser desplegado con vLLM en clústeres multi-GPU, con scripts y contenedores preconfigurados que reducen el tiempo de puesta en marcha a minutos. Es adecuado para empresas que necesitan ejecutar un modelo de 800B parámetros con latencia razonable.
- Razonamiento científico y técnico: con un GPQA_Diamond de 89.9, el modelo puede utilizarse en aplicaciones que requieren responder preguntas complejas de física, química o biología, como asistentes de investigación o sistemas de tutoría avanzada.
- Razonamiento de sentido común y comprensión de contexto largo: el resultado de 82.8 en MuSR (Multi-Step Soft Reasoning) sugiere capacidad para resolver problemas que requieren múltiples pasos de razonamiento, útil en sistemas de análisis de documentos o soporte a la decisión.
- Desarrollo de aplicaciones multilingües chino-inglés: al soportar ambos idiomas, puede integrarse en chatbots, traductores o sistemas de generación de contenido bilingüe.
- Investigación en arquitecturas MoE: al ser de código abierto con licencia Apache-2.0, sirve como referencia para estudiar el comportamiento de MoE a gran escala, incluyendo la comparación entre versiones FP8 y BF16.
- Evaluación de stacks de software de inferencia: la existencia de versiones Origin y FlagOS permite comparar el rendimiento de diferentes stacks (nativo vs. optimizado) en tareas de razonamiento, útil para equipos de infraestructura que evalúan opciones de despliegue.

## Benchmarks y rendimiento

La model card publicada por FlagRelease incluye una comparación entre la versión nativa (Hy4-preview-Nvidia-Origin) y la versión FlagOS (Hy4-preview-Nvidia-FlagOS) en dos métricas:

| Metrica | Hy4-preview-Nvidia-Origin | Hy4-preview-Nvidia-FlagOS |
|---|---|---|
| GPQA_Diamond | 90.91 | 89.9 |
| Musr_team | 82.8 | 82.8 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La ligera caída en GPQA_Diamond (1 punto) puede atribuirse a la cuantización FP8 o a diferencias en el stack de software, pero el resultado en MuSR es idéntico.

## Requisitos de hardware

- El script de despliegue proporcionado utiliza 2 nodos, cada uno con 8 GPUs NVIDIA (CUDA_VISIBLE_DEVICES=0-7), es decir, 16 GPUs en total, con tensor-parallel-size 16 y pipeline-parallel-size 1.
- Con 803B parámetros en FP8 (1 byte por parámetro), el modelo requiere aproximadamente 803 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. Por tanto, se necesitan al menos 16 GPUs de 80 GB (H100 o A100) o 8 GPUs de 141 GB (H200). No cabe en GPUs de consumo (RTX 4090, etc.).
- El driver NVIDIA requerido es la versión 580.126.20, lo que indica GPUs de la generación Hopper o posterior (H100, H200) con soporte FP8.
- Opciones de despliegue: vLLM (versión 0.24.0) con plugins FlagOS, contenedor Docker oficial, y posiblemente otras herramientas compatibles con safetensors FP8 (aunque no se mencionan).
- Latencia y throughput: no se han publicado datos concretos. El uso de FP8 y el stack FlagOS sugiere un rendimiento optimizado, pero no hay cifras disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos MoE de gran escala (como DeepSeek-V3, Qwen3-MoE o Llama 4) en la información proporcionada. La única comparación publicada es entre la versión Origin y la versión FlagOS del mismo modelo, que se muestra en la sección de benchmarks. En términos de arquitectura, Hy4-preview es comparable a otros MoE de ~700-800B parámetros totales con ~50B activos, pero sin datos cuantitativos no es posible realizar una comparativa rigurosa.

## Limitaciones y advertencias

- Solo soporta chino e inglés; no se ha verificado su rendimiento en otros idiomas.
- El tamaño del modelo (803B parámetros) hace que sea inviable en hardware de consumo; requiere clústeres multi-GPU profesionales.
- La cuantización FP8 puede introducir una ligera degradación en algunas métricas (GPQA_Diamond cae de 90.91 a 89.9 en la versión FlagOS), aunque el impacto es mínimo.
- No se han publicado detalles sobre sesgos, alucinaciones o limitaciones de contexto. Al ser un modelo de razonamiento, puede generar respuestas incorrectas en dominios fuera de su entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero es recomendable revisar los términos de la licencia del modelo original de Tencent para asegurar el cumplimiento.
- El despliegue requiere el stack FlagOS y el contenedor Docker específico; no se garantiza que funcione con otras configuraciones de vLLM o frameworks.

## Enlaces

- Modelo en HuggingFace (FlagRelease): https://huggingface.co/FlagRelease/Hy4-preview-FP8-nvidia-FlagOS
- Modelo original en HuggingFace (Tencent): https://huggingface.co/tencent/Hy4-preview-FP8
- Repositorio GitHub de Hy4-preview: https://github.com/Tencent-Hunyuan/Hy4-preview
- Modelo en ModelScope: https://www.modelscope.cn/models/Tencent-Hunyuan/Hy4-preview-FP8
- Documentación de FlagRelease: https://docs.flagos.io/projects/FlagRelease/en/latest/index.html
