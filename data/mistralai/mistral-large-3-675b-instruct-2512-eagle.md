# mistralai/Mistral-Large-3-675B-Instruct-2512-Eagle

## Resumen

Mistral Large 3 675B Instruct 2512 Eagle es un modelo especulador (speculator) de tipo Eagle diseñado para acelerar la decodificación del modelo Mistral Large 3 Instruct. No es un modelo generativo autónomo, sino un componente auxiliar que se acopla al modelo principal mediante decodificación especulativa para reducir la latencia de generación. Lo desarrolla Mistral AI y se distribuye bajo licencia Apache 2.0.

El modelo base al que acompaña, Mistral Large 3, es un modelo multimodal de tipo Mixture-of-Experts granular con 675B parámetros totales y 41B activos, entrenado desde cero sobre 3000 GPUs H200. Combina un modelo de lenguaje MoE de 673B parámetros (39B activos) con un codificador visual de 2,5B parámetros, y soporta una ventana de contexto de 256k tokens.

La relevancia de este speculator radica en que permite obtener aceleraciones notables en la generación del modelo principal sin modificar su calidad de salida, algo crítico en despliegues de producción con modelos de gran tamaño donde el coste por token y la latencia son factores determinantes. Se integra de forma nativa con vLLM mediante el método de decodificación especulativa Eagle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Eagle speculator (decodificacion especulativa) sobre Mistral Large 3 Instruct (MoE granular + vision encoder) |
| Parametros totales | no disponible (el modelo base tiene 675B) |
| Parametros activos | no disponible (el modelo base tiene 41B activos) |
| Longitud de contexto | 256k tokens (modelo base); max_model_len de 16384 en la configuracion especulativa recomendada |
| Tipos de cuantizacion | FP8 (modelo base), NVFP4 (modelo base), BF16 (modelo base); no disponible para el speculator |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 11,7 GB; libreria vllm) |

## Arquitectura y entrenamiento

El modelo es un speculator Eagle, una técnica de decodificación especulativa que entrena una cabeza ligera para predecir múltiples tokens futuros a partir del estado oculto del modelo objetivo. Durante la inferencia, el speculator propone candidatos que el modelo principal verifica en paralelo, aceptando los tokens correctos y acelerando efectivamente la generación. La configuración recomendada por Mistral emplea `num_speculative_tokens: 3` con `method: eagle` y un `max_model_len` de 16384.

El modelo base Mistral Large 3 fue entrenado desde cero con 3000 GPUs H200 y consta de dos componentes: un modelo de lenguaje MoE granular de 673B parámetros (39B activos) y un codificador visual de 2,5B parámetros. La versión Instruct es la post-entrenada para instrucciones en FP8, optimizada para chat, uso agéntico y tareas basadas en instrucciones. No se dispone de información detallada sobre el dataset de entrenamiento del speculator, el número de tokens utilizado ni si hubo RLHF o DPO en su construcción.

## Capacidades

- Aceleración de la decodificación del modelo Mistral Large 3 Instruct mediante decodificación especulativa Eagle.
- Reducción de latencia en generación de texto sin alterar la distribución de salida del modelo principal.
- Integración nativa con vLLM mediante `--speculative_config`.
- Compatibilidad con el stack de tokenización y configuración de Mistral (`--tokenizer-mode mistral`, `--config-format mistral`, `--load-format mistral`).
- Hereda las capacidades del modelo base al que acompaña: visión, multilingüismo, function calling nativo, salida JSON y adherencia a system prompts.
- No soporta tool calling ni agentes por sí mismo: esas capacidades residen en el modelo principal.

## Casos de uso

- Despliegue de producción de Mistral Large 3 Instruct con latencia reducida: el speculator se configura en el servidor vLLM y acelera cada generación, lo que se traduce en menor tiempo de respuesta por petición en asistentes conversacionales.
- Atención al cliente automatizada de alto volumen: al reducir el coste por token generado, permite atender más conversaciones multi-turno con la ventana de 256k tokens del modelo base sin incrementar el parque de GPUs.
- Pipelines de generación de código en CI/CD: la aceleración especulativa disminuye el tiempo de respuesta en tareas de autocompletado y generación de parches, manteniendo la calidad del modelo principal.
- Sistemas RAG empresariales: con contexto largo y respuestas más rápidas, mejora la experiencia en recuperación aumentada sobre documentación extensa.
- Agentes autónomos multi-paso: al acelerar cada paso de razonamiento y llamada a herramientas, reduce el tiempo total de ejecución de cadenas agénticas largas.
- Procesamiento de documentos con visión: acelera el análisis de imágenes y documentos escaneados en flujos de extracción de información, con la recomendación de mantener proporciones cercanas a 1:1.
- Investigación y evaluación de técnicas de decodificación especulativa: sirve como referencia para medir el impacto de Eagle sobre un MoE de 675B en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que, dependiendo de la tarea, se pueden esperar aceleraciones notables en las generaciones, sin cifras concretas de throughput ni de tasa de aceptación de tokens especulativos.

## Requisitos de hardware

- El speculator se ejecuta junto al modelo base; el requisito dominante es el del modelo principal.
- Mistral Large 3 Instruct en FP8 requiere un nodo de B200 o H200.
- Mistral Large 3 Instruct en NVFP4 requiere un nodo de H100 o A100.
- Existe versión BF16 del modelo base para casos que la necesiten.
- El speculator en sí ocupa un repositorio de 11,7 GB, por lo que su huella adicional es moderada frente al modelo principal.
- No cabe en GPU de consumo (RTX 4090, etc.) en ninguna de las configuraciones publicadas del modelo base.
- Despliegue recomendado: vLLM >= 1.12.0 con `mistral_common >= 1.8.6`, en configuración cliente-servidor con `--tensor-parallel-size 8`.
- Latencia y throughput estimados: no disponibles; la model card solo indica aceleraciones notables sin cuantificar.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral Large 3 675B Instruct 2512 Eagle | Speculator Eagle | no disponible (base 675B/41B activos) | 256k (base) | Apache 2.0 | Hugging Face, vLLM |
| Mistral Large 3 675B Instruct 2512 | MoE multimodal instruct | 675B totales / 41B activos | 256k | Apache 2.0 | Hugging Face (FP8, NVFP4, BF16) |
| Mistral Large 3 675B Instruct 2512 NVFP4 | MoE multimodal cuantizado | 675B totales / 41B activos | 256k | Apache 2.0 | Hugging Face |
| Mistral Large 3 675B Instruct 2512 BF16 | MoE multimodal en BF16 | 675B totales / 41B activos | 256k | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros speculators comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: no puede usarse para generar texto por sí solo, requiere el modelo Mistral Large 3 Instruct como objetivo.
- La aceleración depende de la tarea; no se garantiza una mejora uniforme en todos los casos de uso.
- La configuración recomendada limita `max_model_len` a 16384 en el bloque especulativo, lo que puede requerir ajuste para contextos muy largos.
- No se dispone de información sobre sesgos específicos del speculator; hereda los del modelo base.
- Riesgo de alucinación: aplicable al modelo principal, no al speculator, que solo propone tokens verificados por el modelo objetivo.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar los términos de Mistral AI y la política de privacidad asociada al acceso con gating.
- El acceso al repositorio está sujeto a gating (`extra_gated_description`), lo que implica aceptar condiciones adicionales.
- En producción se recomienda temperatura inferior a 0,1, un conjunto de herramientas bien definido y proporciones de imagen cercanas a 1:1 para visión.
- Requiere hardware de gama alta (nodos de B200, H200, H100 o A100); no es desplegable en hardware de consumo.

## Enlaces

- [Hugging Face: Mistral-Large-3-675B-Instruct-2512-Eagle](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512-Eagle)
- [Modelo base: Mistral-Large-3-675B-Instruct-2512](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512)
- [Version NVFP4 del modelo base](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512-NVFP4)
- [Version BF16 del modelo base](https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512-BF16)
- [vLLM](https://github.com/vllm-project/vllm)
- [mistral-common v1.8.6](https://github.com/mistralai/mistral-common/releases/tag/v1.8.6)
- [Dockerfile de vLLM](https://github.com/vllm-project/vllm/blob/main/docker/Dockerfile)
- [Imagen Docker vLLM en Docker Hub](https://hub.docker.com/layers/vllm/vllm-openai/latest)
- [Mistral AI](https://mistral.ai/)
- [Politica de privacidad de Mistral AI](https://mistral.ai/terms/)
