# phuctahong/nanogpt-gpt-mha-falcon-3a-scaled-ctxeta-ctxlambda-chunk-triton-379m-job12950671-step100000

## Resumen

`phuctahong/nanogpt-gpt-mha-falcon-3a-scaled-ctxeta-ctxlambda-chunk-triton-379m-job12950671-step100000` es un checkpoint de investigación de un modelo de lenguaje de tipo GPT entrenado con el framework NanoGPT Pro, publicado por el usuario phuctahong en Hugging Face. Se trata de un experimento de escalado de arquitectura Falcon con atención multi-cabeza (MHA) y variantes de mecanismos de atención (ctxeta, ctxlambda, chunk, triton) sobre el dataset FineWeb-Edu. El checkpoint corresponde al paso 100.000 de un entrenamiento que procesó aproximadamente 49.150 millones de tokens.

El modelo tiene 379.359.616 parámetros (unos 379 millones) y se distribuye únicamente con pesos listos para inferencia en formato safetensors, junto con `config.json` y `generation_config.json`. No se publican datos sobre longitud de contexto, idiomas soportados, benchmarks ni detalles de composición del dataset más allá de la referencia a FineWeb-Edu.

Su relevancia es acotada: se trata de un artefacto de investigación reproducible (job id 12950671, step 100000) que documenta una configuración concreta de entrenamiento y sirve como referencia para estudiar variantes de atención en modelos pequeños. No es un modelo pensado para producción ni para uso general, y su model card es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT con atención multi-cabeza (MHA), variante Falcon; mecanismos ctxeta, ctxlambda, chunk y kernels Triton |
| Parametros totales | 379.359.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos safetensors publicados) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), con `config.json` y `generation_config.json` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de tipo GPT, etiquetada por el autor como "gpt-mha-falcon", lo que sugiere una implementación basada en Falcon con atención multi-cabeza estándar en lugar de multi-query o grouped-query attention. El nombre del checkpoint incluye modificadores técnicos (`scaled-ctxeta-ctxlambda-chunk-triton`) que apuntan a variantes experimentales en el cálculo de atención: escalado de contexto, parámetros eta y lambda por contexto y una implementación fragmentada (chunked) con kernels Triton. No se dispone de documentación adicional sobre estos mecanismos.

El entrenamiento se realizó con NanoGPT Pro sobre FineWeb-Edu, con un volumen declarado de 100.000 millones de tokens (D_fineweb-edu100B) y 49.150 millones de tokens efectivamente procesados (T_49.15B) en el momento del checkpoint. Se usó el optimizador AdamW con una tasa de aprendizaje de 0,001 y un tamaño de batch de 12 (bs12). No se indica si hubo fases de RLHF, DPO o ajuste supervisado posterior; el checkpoint parece ser un modelo base preentrenado.

## Capacidades

- Generación de texto autoregresiva propia de un modelo GPT preentrenado.
- Modelo base sin ajuste de instrucciones: no se documenta soporte de chat ni de formato conversacional.
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- Capacidades multilingües no disponibles; el entrenamiento sobre FineWeb-Edu sugiere predominio de contenido educativo en inglés, pero no se confirma.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación sobre variantes de atención: el checkpoint permite reproducir y comparar configuraciones ctxeta/ctxlambda/chunk frente a atención estándar en un modelo de 379M, útil para estudiar estabilidad y coste computacional.
- Reproducibilidad de experimentos de escalado: al estar identificado con job id y step concretos, sirve como punto de control para replicar curvas de entrenamiento con NanoGPT Pro.
- Fine-tuning académico de bajo coste: con 379M parámetros, es viable ajustarlo en una única GPU para tareas de clasificación o generación de dominio específico.
- Extracción de características y perplejidad de referencia: puede emplearse como línea base en estudios de modelado de lenguaje sobre FineWeb-Edu.
- Pruebas de infraestructura de inferencia: su tamaño reducido permite validar pipelines con vLLM, llama.cpp o TGI antes de escalar a modelos mayores.
- Docencia y formación: adecuado para demostrar el ciclo completo de preentrenamiento y evaluación de un transformer pequeño en cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 1,5 GB para los pesos (379M × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 0,76 GB para los pesos.
- VRAM estimada en int8: aproximadamente 0,38 GB; en int4, aproximadamente 0,19 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4090 24 GB) es suficiente; también A100/H100 para despliegues por lotes.
- Cabe holgadamente en GPUs consumer e incluso en iGPU con suficiente memoria compartida en cuantización int4.
- Opciones de despliegue: llama.cpp y Ollama requieren conversión a GGUF (no publicada); vLLM y TGI pueden cargar safetensors si la arquitectura es compatible con el `config.json`; Transformers como opción más directa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (nanogpt-gpt-mha-falcon-379m) | 379M | No disponible | Apache 2.0 | Hugging Face, solo pesos |
| GPT-2 small | 124M | 1024 | MIT | Amplia |
| GPT-2 medium | 355M | 1024 | MIT | Amplia |
| Pythia-410M | 410M | 2048 | Apache 2.0 | Amplia, con checkpoints intermedios |

La comparación con GPT-2 medium y Pythia-410M es la más directa por tamaño; sin embargo, no hay datos de rendimiento publicados para este checkpoint que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Model card mínima: no se documentan datos de entrenamiento detallados, tokenizador, contexto máximo ni composición del corpus más allá de FineWeb-Edu.
- Riesgo elevado de alucinación y de generar contenido sesgado o incorrecto, propio de un modelo base pequeño sin alineamiento.
- Sin ajuste de instrucciones: no debe usarse directamente en aplicaciones conversacionales sin fine-tuning.
- Idiomas soportados no confirmados; probable sesgo hacia inglés por el corpus de entrenamiento.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en secuencias largas.
- Ausencia de benchmarks: imposible evaluar su calidad relativa frente a alternativas consolidadas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de documentación y de garantías desaconseja su uso en producción sin una evaluación exhaustiva.
- Los mecanismos experimentales (ctxeta, ctxlambda, chunk, Triton) pueden no ser compatibles con implementaciones estándar de Transformers, lo que complica el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/phuctahong/nanogpt-gpt-mha-falcon-3a-scaled-ctxeta-ctxlambda-chunk-triton-379m-job12950671-step100000
- NanoGPT: https://github.com/karpathy/nanoGPT
- FineWeb-Edu (dataset): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Falcon (referencia arquitectónica): https://huggingface.co/tiiuae/falcon-7b
- Triton: https://github.com/openai/triton
