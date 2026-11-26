# chadouming/Hy-MT3-1.8B-int8-ov

## Resumen

Hy-MT3-1.8B-int8-ov es una exportación cuantizada a INT8 en formato OpenVINO Intermediate Representation (IR) del modelo de traducción tencent/Hy-MT3-1.8B, publicada por el usuario chadouming. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos optimizada para su ejecución con la librería openvino-genai sobre CPUs y GPUs Intel Arc, lo que permite desplegar el modelo original en hardware Intel sin necesidad de GPUs NVIDIA.

El modelo base, desarrollado por Tencent, es un transformer denso de aproximadamente 1.800 millones de parámetros especializado en traducción automática, según indican las etiquetas del repositorio (translation, hy-mt3). La versión aquí descrita aplica compresión de pesos INT8 asimétrica por canal mediante NNCF sobre 225 de las 226 capas del modelo, reduciendo el tamaño del repositorio a 1,8 GB y habilitando su uso con las pipelines LLMPipeline y ContinuousBatchingPipeline de openvino-genai.

Su relevancia radica en que ofrece una vía práctica para ejecutar un modelo de traducción de tamaño medio en infraestructura Intel, con licencia Apache-2.0 heredada del modelo original, lo que facilita su integración en productos comerciales. No obstante, la información pública disponible sobre el modelo base es muy limitada en esta ficha: no se detallan arquitectura exacta, contexto, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tag hunyuan_v1_dense; detalles no disponibles) |
| Parametros totales | Aproximadamente 1.800 millones (por el nombre del modelo; cifra exacta no disponible) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8 asimetrico por canal (int8_asym), compresion de pesos en 225/226 capas |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada de tencent/Hy-MT3-1.8B) |
| Formato de pesos | OpenVINO IR (INT8), para openvino-genai |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de la etiqueta hunyuan_v1_dense, que sugiere una familia de transformers densos de Tencent (Hunyuan). No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. El modelo está orientado, según sus etiquetas, a tareas de traducción y generación de texto conversacional.

La contribución técnica de esta ficha concreta es la cuantización: se aplicó compresión de pesos INT8 asimétrica por canal con NNCF 3.4.0 sobre 225 de las 226 capas, usando el toolchain openvino 2026.4.1, openvino-tokenizers 2026.4.1.0, openvino-genai 2026.4.1.0, transformers 4.57.6 y optimum-intel 2.3.0.dev0. El comando de exportación documentado es optimum-cli export openvino con --weight-format int8 y --task text-generation-with-past, lo que preserva la caché KV para generación autoregresiva.

## Capacidades

- Traducción automática: el modelo base está etiquetado como translation y hy-mt3, por lo que su función principal es la traducción entre idiomas (pares concretos no disponibles).
- Generación de texto y conversación: pipeline text-generation y etiqueta conversational.
- Generación autoregresiva con caché KV (exportado con text-generation-with-past).
- Ejecución en CPU y GPU Intel Arc mediante openvino-genai (LLMPipeline y ContinuousBatchingPipeline).
- Soporte de batching continuo para servir múltiples peticiones concurrentes.
- Capacidades de tool calling, agentes, visión, audio o modo thinking: no disponibles en la información proporcionada.
- Cobertura multilingüe concreta: no disponible.

## Casos de uso

- Traducción por lotes en servidores Intel: el modelo puede procesar grandes volúmenes de documentos mediante ContinuousBatchingPipeline en CPUs Xeon o GPUs Arc, aprovechando la compresión INT8 para reducir huella de memoria.
- Servicio de traducción de baja latencia en el borde: al ocupar 1,8 GB en INT8, puede desplegarse en equipos con GPU Intel integrada o Arc de gama baja para traducción en tiempo real de textos cortos.
- Integración en aplicaciones de escritorio: mediante openvino-genai se puede embeber el modelo en herramientas ofimáticas o clientes de correo para traducción local sin conexión a la nube.
- Preprocesamiento multilingüe de datasets: traducción automática de corpus para pipelines de entrenamiento o análisis, ejecutada en infraestructura Intel existente sin GPUs NVIDIA.
- Traducción de documentación técnica en CI/CD: el modelo puede incorporarse a pipelines de integración continua para generar versiones localizadas de documentación en cada release.
- Prototipado de asistentes conversacionales multilingües: la etiqueta conversational permite construir chatbots con capacidad de traducción sobre hardware Intel de consumo o servidor.
- Evaluación comparativa de cuantización: sirve como referencia para medir la pérdida de calidad de INT8 frente al modelo original en tareas de traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 1,8 GB en INT8, por lo que se necesita al menos esa cantidad de memoria para los pesos, más la memoria para la caché KV y el runtime (dependiente de la longitud de contexto, no disponible).
- GPU recomendadas: GPUs Intel Arc (según la model card) y CPUs Intel con soporte OpenVINO.
- Cabe en GPU de consumo: sí, previsiblemente en GPUs Intel Arc de gama de entrada y en CPUs modernas; no se especifican modelos concretos ni requisitos mínimos.
- Opciones de despliegue: openvino-genai (LLMPipeline y ContinuousBatchingPipeline); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta exportación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Hy-MT3-1.8B-int8-ov | ~1,8B | No disponible | OpenVINO IR INT8 | Apache-2.0 | Optimizado para CPU/GPU Intel |
| tencent/Hy-MT3-1.8B (original) | ~1,8B | No disponible | Safetensors (presumiblemente) | Apache-2.0 | Modelo base sin cuantizar |
| Otros modelos de traducción de tamano similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- La información pública sobre el modelo base es escasa: se desconocen contexto máximo, idiomas exactos, datos de entrenamiento y benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- Al ser una cuantización INT8, puede existir una degradación de calidad respecto al modelo original en fp16/bf16, no cuantificada en la información disponible.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben asumirse los riesgos habituales de los modelos generativos.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base tencent/Hy-MT3-1.8B.
- Dependencia del ecosistema OpenVINO: no es directamente utilizable con vLLM, llama.cpp u otros runtimes sin reconversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación.
- Fecha de creación indicada como 2026-11-26, lo que conviene contrastar por posible inconsistencia en los metadatos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chadouming/Hy-MT3-1.8B-int8-ov
- Modelo base: https://huggingface.co/tencent/Hy-MT3-1.8B
- openvino-genai: https://github.com/openvinotoolkit/openvino.genai
