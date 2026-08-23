# shanjiaz/dflash2_qwen3_4b_v2

## Resumen

El modelo `shanjiaz/dflash2_qwen3_4b_v2` es un especulador (speculator) DFlash2 diseñado para acelerar la inferencia del modelo base `Qwen/Qwen3-4B` mediante decodificación especulativa. Desarrollado con la librería [Speculators](https://github.com/vllm-project/speculators) de vLLM, este modelo genera hasta 8 tokens candidatos en paralelo que el modelo verifica, reduciendo el número de pasos autoregresivos y mejorando el throughput sin cambiar la salida final. DFlash 2 es una evolución del DFlash original que añade convoluciones dinámicas locales y un selector de candidatos para mejorar la precisión de las predicciones. Con 1.410 millones de parámetros, es un componente ligero que se integra en el pipeline de vLLM. Su relevancia radica en que permite acelerar la generación de modelos de 4B en tareas como código, matemáticas o traducción, con tasas de aceptación de tokens que llegan al 89 % en la primera posición para HumanEval.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block diffusion (DFlash 2) con convoluciones dinámicas locales y selector de candidatos |
| Parametros totales | 1.410.272.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con secuencias de 8192 tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | No disponible (heredados del modelo base Qwen3-4B) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

DFlash 2 es un modelo de difusión de bloques (block diffusion) que opera como especulador en el esquema de decodificación especulativa. A diferencia de los especuladores autoregresivos tradicionales, genera múltiples tokens en paralelo mediante un proceso de difusión sobre bloques de tokens. La versión 2 extiende el DFlash original incorporando convoluciones dinámicas locales (con kernel de tamaño 2 y grupos de 16) que capturan dependencias de corto alcance, y un selector de candidatos con rango 256 y top-k 16 que filtra las mejores propuestas. El modelo se entrenó con la librería Speculators sobre el dataset `inference-optimization/Qwen3-8B-Regenerated-Collection`, usando el modelo base Qwen3-4B como verificador. El entrenamiento se realizó con 4 GPUs, función de pérdida combinada de entropía cruzada (0.1) y transferencia de tokens (0.9), con una tasa de aprendizaje de 6e-4, scheduler coseno y 1 época. Los pesos finales son de 5 capas con 1.4B parámetros, lo que lo hace sustancialmente más pequeño que el modelo base.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa en paralelo (hasta 8 tokens por paso).
- Acelera la inferencia del modelo Qwen3-4B en tareas como código, matemáticas, razonamiento, RAG, traducción, escritura y tool calling.
- Se integra con el endpoint `/chat/completions` de vLLM, manteniendo el mismo chat template que Qwen3-4B.
- No es un modelo de lenguaje autónomo; no genera texto final, solo predice tokens intermedios para el verifier.
- No tiene capacidades de visión, audio ni multimodalidad (no documentadas).
- No soporta tool calling de forma directa; la decodificación especulativa es transparente para el usuario.

## Casos de uso

- **Aceleración de generación de código**: en tareas HumanEval, el especulador alcanza una tasa de aceptación del 89 % en la primera posición, lo que reduce la latencia en pipelines de desarrollo asistido por IA.
- **Sistemas de razonamiento matemático**: con tasas de aceptación del 92 % en la primera posición y una longitud media de 5.85 tokens aceptados, es adecuado para aplicaciones de resolución de problemas matemáticos.
- **Atención al cliente con RAG**: en tareas de retrieval-augmented generation, el 82 % de los tokens en posición 0 son aceptados, lo que mejora la velocidad de respuesta en chatbots con contexto recuperado.
- **Traducción automática**: con una tasa de aceptación del 84.6 % en la primera posición, puede acelerar sistemas de traducción basados en LLM sin perder calidad.
- **Generación de contenido y escritura**: en tareas de writing, el 81.6 % de los primeros tokens son aceptados, lo que reduce la latencia en asistentes de redacción.
- **Despliegue en producción con vLLM**: se integra mediante `--speculative-config` para acelerar cualquier servicio que use Qwen3-4B como modelo base, sin cambios en el código de la aplicación.

## Benchmarks y rendimiento

El modelo no publica resultados de benchmarks tradicionales (MMLU, HumanEval, GSM8K), sino tasas de aceptación de tokens por posición en distintos conjuntos de datos. Estas métricas indican la probabilidad de que el token propuesto por el especulador sea aceptado por el modelo verificador.

| Dataset | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 | Longitud media |
|---|---|---|---|---|---|---|---|---|
| HumanEval | 89.3 % | 77.9 % | 67.0 % | 56.9 % | 48.2 % | 40.6 % | 33.9 % | 5.14 |
| math_reasoning | 92.5 % | 84.4 % | 76.2 % | 68.4 % | 61.0 % | 54.3 % | 47.8 % | 5.85 |
| qa | 80.1 % | 63.7 % | 50.7 % | 41.4 % | 33.9 % | 28.1 % | 23.5 % | 4.21 |
| question | 81.7 % | 64.8 % | 51.7 % | 41.8 % | 34.0 % | 27.9 % | 23.3 % | 4.25 |
| rag | 82.3 % | 65.8 % | 52.6 % | 42.0 % | 33.6 % | 27.1 % | 22.1 % | 4.25 |
| summarization | 74.5 % | 52.2 % | 35.5 % | 23.3 % | 15.7 % | 10.3 % | 6.6 % | 3.18 |
| tool_call | 81.0 % | 63.6 % | 49.9 % | 38.7 % | 30.5 % | 24.1 % | 19.5 % | 4.07 |
| translation | 84.6 % | 69.6 % | 56.5 % | 44.9 % | 35.4 % | 28.3 % | 22.6 % | 4.42 |
| writing | 81.6 % | 64.8 % | 51.6 % | 41.6 % | 33.9 % | 27.8 % | 23.2 % | 4.24 |

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: al tener 1.4B parámetros, el modelo requiere aproximadamente 3-5 GB en precisión FP16 (sin cuantizar). Con cuantización de 4 bits podría caber en 2-3 GB, pero no se ha publicado ninguna cuantización.
- **GPU recomendada**: el entrenamiento se realizó en 4 GPUs, y la validación se llevó a cabo en Nvidia H100. Para inferencia, se necesita una GPU con al menos 8 GB de VRAM para el modelo completo junto con el modelo base Qwen3-4B (que requiere ~8-10 GB en FP16).
- **Compatibilidad con GPU consumer**: sí, es posible ejecutarlo en GPUs como RTX 3090, RTX 4090 o A6000, siempre que se combine con el modelo base y se gestione la memoria total.
- **Opciones de despliegue**: solo se ha documentado la integración con vLLM (mediante el PR #52816). No se menciona soporte para llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no se proporcionan datos numéricos de latencia o throughput, pero la tasa de aceptación media de 4-5 tokens sugiere una reducción de pasos de decodificación de entre 2 y 3 veces respecto a la generación autoregresiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Técnica | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shanjiaz/dflash2_qwen3_4b_v2` | 1.4B | No disponible | DFlash 2 (difusión de bloques) | Apache 2.0 | Hugging Face |
| `z-lab/Qwen3-4B-DFlash-b16` | No disponible | No disponible | DFlash (bloque, 16 candidatos) | No disponible | Hugging Face |
| `RedHatAI/Qwen3-4B-speculator.dflash2` | No disponible | No disponible | DFlash 2 | Apache 2.0 | Mencionado en la model card |

No se dispone de datos de rendimiento comparativos entre estos especuladores, ya que cada uno publica sus propias tasas de aceptación en distintos conjuntos de datos. La comparación directa no es posible con la información proporcionada.

## Limitaciones y advertencias

- **Dependencia del modelo base**: este modelo no es funcional de forma independiente; debe usarse siempre junto con `Qwen/Qwen3-4B` y el software de decodificación especulativa.
- **Compatibilidad con vLLM**: la integración requiere una versión específica de vLLM (`refs/pull/52816/head`), lo que limita su uso en entornos con versiones estables.
- **Tasas de aceptación variables**: en tareas como resumen o escritura, la tasa de aceptación en posiciones altas (pos 5-6) es baja (por debajo del 30 %), lo que reduce la ganancia de velocidad en esas tareas.
- **Sin cuantización publicada**: no hay versiones GGUF o AWQ disponibles, lo que dificulta su despliegue en entornos con recursos limitados.
- **Sesgos y alucinaciones**: al ser un especulador, no genera contenido final; los sesgos y alucinaciones provienen del modelo base Qwen3-4B, que no se han documentado en esta ficha.
- **Licencia Apache 2.0**: permite uso comercial sin restricciones, pero debe atribuirse el autor según los términos de la licencia.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/shanjiaz/dflash2_qwen3_4b_v2)
- [Modelo base Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B)
- [Dataset de entrenamiento](https://huggingface.co/datasets/inference-optimization/Qwen3-8B-Regenerated-Collection)
- [Librería Speculators de vLLM](https://github.com/vllm-project/speculators)
- [Repositorio DFlash](https://github.com/z-lab/dflash)
- [Blog de DFlash 2](https://inco.ai/blog/dflash2/)
- [Modelo comparativo z-lab/Qwen3-4B-DFlash-b16](https://huggingface.co/z-lab/Qwen3-4B-DFlash-b16)
