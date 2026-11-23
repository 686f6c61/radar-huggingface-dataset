# scottlowry/Qwen3.8-27B-oQ8e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ8e-fp16-mtp es una cuantización mixta del modelo Qwen/Qwen3.8-27B, publicada por el usuario scottlowry. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada al ecosistema MLX de Apple Silicon, generada con la herramienta oQ (oMLX v0.7.4.dev1), que aplica cuantización de precisión mixta: la mayor parte de los pesos se almacena en 8 bits afines con grupo de 64, mientras que una fracción pequeña se conserva en FP16 y FP32.

El checkpoint resultante tiene 27.781 millones de parámetros lógicos y ocupa 30,9 GB en disco (28,8 GiB), con una media efectiva de 8,905 bits por peso. La arquitectura subyacente es la del modelo base Qwen3.8-27B, que incluye un componente de visión (0,461B de parámetros) y una cabeza MTP (multi-token prediction) de 0,425B, lo que sugiere capacidades multimodales y decodificación especulativa.

Su relevancia es práctica: permite ejecutar un modelo de casi 28B parámetros con visión y MTP en hardware Apple con memoria unificada, manteniendo una calidad cercana a la del modelo original gracias a la preservación selectiva de capas sensibles en mayor precisión. La información pública disponible sobre el modelo base y sobre esta conversión es limitada, por lo que varios datos de la ficha se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Qwen3.8-27B, con torre de visión y cabeza MTP (multi-token prediction); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: affine 8-bit grupo 64 (98,143% de los pesos), FP16 (0,198%), FP32 (1,658%); media efectiva 8,905 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, librería mlx (MLX) |

## Arquitectura y entrenamiento

Esta publicación no entrena ningún modelo: es una re-cuantización del checkpoint Qwen/Qwen3.8-27B realizada con oQ (oMLX v0.7.4.dev1), una herramienta de cuantización de precisión mixta para MLX. La distribución de bits es explícita: 27,266B de pesos lógicos en affine 8-bit con grupo de 64 (26,980 GiB, 8,50 bits/peso efectivos), 0,055B en FP16 (0,103 GiB) y 0,461B en FP32 (1,716 GiB). Esa capa FP32 coincide en tamaño con el componente de visión (0,461B), lo que apunta a que la torre visual se mantiene en alta precisión para no degradar la percepción.

El desglose de almacenamiento confirma tres componentes: modelo de lenguaje (26,896B, 28,579 GB), visión (0,461B, 1,843 GB) y cabeza MTP (0,425B, 0,500 GB). La presencia de una cabeza MTP indica soporte de decodificación especulativa multi-token, una técnica que predice varios tokens por paso para acelerar la generación. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B; el nivel concreto de rendimiento no está documentado en esta publicación.
- Procesamiento de visión: el checkpoint incluye una torre visual de 0,461B parámetros, por lo que se espera soporte de entrada de imágenes.
- Decodificación especulativa: la cabeza MTP de 0,425B permite generar varios tokens por paso en implementaciones compatibles.
- Ejecución en Apple Silicon: formato nativo MLX, optimizado para memoria unificada de chips M-series.
- Tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac: el checkpoint ocupa 28,8 GiB, por lo que encaja en equipos Apple con 36 GB o 64 GB de memoria unificada, permitiendo ejecutar un modelo de 27,8B con visión sin GPU dedicada.
- Prototipado de asistentes multimodales: la combinación de torre de visión y modelo de lenguaje permite experimentar con preguntas sobre imágenes en local antes de desplegar en servidores.
- Aceleración de generación con MTP: en flujos interactivos donde la latencia importa (chat, autocompletado), la cabeza de predicción multi-token puede reducir el tiempo por token en implementaciones MLX que la aprovechen.
- Evaluación comparativa de cuantizaciones: sirve para medir la pérdida de calidad de una cuantización 8-bit mixta frente al modelo base en tareas concretas, gracias a que conserva visión en FP32.
- Investigación en eficiencia de memoria: útil para estudiar el equilibrio entre precisión por componente y huella de memoria en hardware de consumo.
- Despliegue de laboratorio sin conexión: al ser un checkpoint autónomo en safetensors, puede usarse en entornos aislados para pruebas de privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 28,8 GiB solo para pesos; con caché KV y overhead del runtime, se recomienda un mínimo de 36 GB de memoria unificada.
- GPU recomendadas: hardware Apple Silicon con memoria unificada (M-series Pro/Max/Ultra); no está pensado para CUDA.
- Cabe en GPU de consumo: sí, en Mac con 36 GB o más; en GPUs NVIDIA de consumo no es directamente utilizable por el formato MLX.
- Opciones de despliegue: runtime MLX y herramientas compatibles con el ecosistema oMLX; vLLM, llama.cpp, Ollama y TGI no soportan este formato de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ8e-fp16-mtp | 27,781B | no disponible | MLX safetensors 8-bit mixto | no disponible | Cuantización para Apple Silicon con visión y MTP |
| Qwen/Qwen3.8-27B (base) | 27,8B aprox. | no disponible | safetensors originales | no disponible | Pesos sin cuantizar; requiere más memoria |
| Otras cuantizaciones GGUF del mismo base | no disponible | no disponible | GGUF | no disponible | Ejecutables en llama.cpp/Ollama, no en MLX |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es una cuantización, no un modelo original: puede presentar degradación frente al base, especialmente en tareas de precisión numérica o razonamiento largo.
- La licencia no está indicada en la ficha; antes de uso comercial debe verificarse la licencia del modelo base Qwen/Qwen3.8-27B.
- Dependencia del ecosistema MLX: no es portable a CUDA ni a runtimes estándar como vLLM o llama.cpp sin conversión adicional.
- El autor actualizó el checkpoint el 2026-11-11; copias anteriores pueden diferir en calidad, por lo que conviene re-descargar.
- Riesgo de alucinación y sesgos: no documentados en esta publicación; se heredan los del modelo base, no disponibles aquí.
- Idiomas y contexto máximo: no disponibles, lo que impide garantizar su idoneidad para flujos multilingües o de contexto largo.
- Huella de memoria alta para hardware de consumo: 28,8 GiB de pesos dejan poco margen en equipos de 32 GB.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.8-27B-oQ8e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
