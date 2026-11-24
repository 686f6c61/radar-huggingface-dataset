# mistralai/Mistral-Large-3-675B-Instruct-2512

## Resumen

Mistral Large 3 675B Instruct 2512 es la version post-entrenada para instrucciones del modelo de gran escala de Mistral AI, publicado bajo licencia Apache 2.0. Se trata de un modelo multimodal de arquitectura Mixture-of-Experts (MoE) granular con 675 mil millones de parametros totales y 41 mil millones de parametros activos por token, entrenado desde cero sobre 3000 GPUs NVIDIA H200. Combina un modelo de lenguaje MoE de 673B parametros (39B activos) con un codificador de vision de 2,5B parametros.

El modelo esta disenado para cargas de trabajo de produccion que requieren comprension de contexto largo, capacidades agenticas con function calling nativo y salida JSON, y comportamiento multilingue estable en once idiomas declarados. Su ventana de contexto alcanza los 256 000 tokens, lo que lo posiciona para tareas de comprension de documentos extensos, asistentes de uso diario y flujos empresariales complejos.

La relevancia actual del modelo radica en su combinacion de escala frontier con una licencia permisiva (Apache 2.0) que permite uso comercial y modificacion, ademas de su despliegue en un solo nodo de 8xH200 o 8xB200 en formato FP8, o en un solo nodo de H100/A100 mediante la variante NVFP4. Esto lo convierte en una opcion atractiva para organizaciones que necesitan capacidades de nivel frontier sin depender de APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) granular multimodal, con codificador de vision |
| Parametros totales | 675B (673B en el LM + 2,5B en el codificador de vision) |
| Parametros activos | 41B (39B en el LM) |
| Longitud de contexto | 256 000 tokens (262 144 en configuracion vLLM) |
| Tipos de cuantizacion | FP8 (pesos publicados), NVFP4 (variante separada), BF16 (variante separada) |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors; integracion nativa con vLLM (load_format mistral) |

## Arquitectura y entrenamiento

Mistral Large 3 emplea una arquitectura Mixture-of-Experts granular compuesta por dos modulos: un modelo de lenguaje MoE de 673B parametros totales con 39B activos por token, y un codificador de vision de 2,5B parametros que habilita la comprension de imagenes junto al texto. El entrenamiento se realizo desde cero ("trained from the ground up") sobre un cluster de 3000 GPUs NVIDIA H200. La model card no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset.

La version publicada en este repositorio es la variante instruct post-entrenada en FP8, optimizada para tareas de instruccion, chat y uso agentico. Mistral AI no especifica en la informacion disponible si se emplearon tecnicas concretas de RLHF, DPO u otras variantes de alineacion, ni innovaciones como decodificacion especulativa o atencion lineal. La integracion con vLLM requiere versiones >= 1.12.0 y mistral_common >= 1.8.6, e incluye soporte para tool calling automatico mediante `--enable-auto-tool-choice`.

## Capacidades

- Generacion de texto y comprension de contexto largo hasta 256 000 tokens.
- Vision: analisis de imagenes y generacion de insights basados en contenido visual combinado con texto.
- Multilingue: soporte declarado de once idiomas (ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe).
- Agentic: function calling nativo y salida en formato JSON, con soporte para eleccion automatica de herramientas en vLLM.
- Adherencia a system prompts: el modelo mantiene un seguimiento fuerte de las instrucciones de sistema.
- Razonamiento general y asistencia de codigo de uso general.
- Capacidades frontier declaradas por el autor para tareas empresariales y cientificas.
- No es un modelo de razonamiento dedicado: los modelos especificamente disenados para razonamiento (tipo reasoning) pueden superarlo en tareas estrictas de razonamiento logico.

## Casos de uso

- Comprension de documentos extensos: con 256 000 tokens de contexto, el modelo puede procesar contratos, informes anuales o expedientes completos en una sola pasada, resumiendo y extrayendo clausulas o datos clave sin necesidad de fragmentacion.
- Asistentes de uso diario en produccion: con temperatura recomendada inferior a 0,1 y buen seguimiento de system prompts, es adecuado para asistentes corporativos multi-turno que requieren consistencia y baja creatividad.
- Flujos agenticos y tool use: el function calling nativo y la salida JSON permiten integrarlo en orquestadores de agentes que encadenan llamadas a APIs, bases de datos o servicios internos, limitando el conjunto de herramientas para evitar sobrecarga.
- Trabajo de conocimiento empresarial: analisis de documentacion interna, generacion de informes y respuestas sobre bases de conocimiento combinando recuperacion (RAG) con el contexto largo del modelo.
- Asistente de codigo general: generacion, explicacion y refactorizacion de codigo en entornos de desarrollo, con capacidad de integrarse en pipelines mediante tool calling y salida estructurada.
- Analisis multimodal de documentos: al combinar vision y texto, puede procesar capturas, diagramas o documentos escaneados junto al texto asociado, recomendando relaciones de aspecto cercanas a 1:1 para las imagenes.
- Atencion al cliente automatizada: gestion de conversaciones multi-turno con contexto extenso y soporte multilingue en once idiomas, adecuado para bases de clientes internacionales.
- Cargas cientificas y tecnicas: procesamiento de literatura cientifica extensa y extraccion estructurada de resultados en formato JSON para su integracion en sistemas de analisis.

## Benchmarks y rendimiento

La model card incluye graficos comparativos de benchmarks frente a modelos de tamano similar, pero los valores numericos no estan disponibles en formato textual en la informacion proporcionada. No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- FP8: desplegable en un solo nodo de 8xH200 o 8xB200. El repositorio ocupa 681,5 GB, lo que orienta el requisito de memoria agregada.
- NVFP4: variante separada desplegable en un solo nodo de 8xH100 o 8xA100.
- BF16: variante separada disponible para quienes necesiten mayor precision o fine-tuning.
- No cabe en GPUs de consumo: el tamano (675B parametros totales) y el requisito de nodo multi-GPU lo excluyen de RTX 4090 o similares.
- Despliegue recomendado: vLLM >= 1.12.0 con mistral_common >= 1.8.6, usando `--tensor-parallel-size 8`, `--tokenizer_mode mistral`, `--config_format mistral`, `--load_format mistral` y `--enable-auto-tool-choice`.
- Tambien disponible mediante imagen Docker oficial de vLLM (vllm/vllm-openai).
- No se dispone de datos de latencia ni throughput en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mistral Large 3 675B Instruct 2512 | 675B / 41B (MoE) | 256k | Apache 2.0 | Pesos abiertos en HF (FP8, NVFP4, BF16) |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos numericos ni de especificaciones de modelos comparables de la misma categoria para completar una comparativa rigurosa. La model card indica que las comparaciones se realizan frente a "modelos de tamano similar" mediante graficos, pero sin valores textuales.

## Limitaciones y advertencias

- No es un modelo de razonamiento dedicado: puede quedar por detras de modelos especializados en razonamiento estricto.
- Esta por detras de modelos optimizados para vision en tareas multimodales intensivas.
- Despliegue complejo: el tamano y la arquitectura MoE dificultan el despliegue eficiente con recursos limitados o a gran escala.
- Riesgo de alucinacion: no se documenta en la informacion disponible una evaluacion especifica de tasas de alucinacion; como todo LLM de gran escala, es susceptible a generar contenido incorrecto, especialmente en contextos largos o dominios especializados.
- Sesgos: no se detallan sesgos conocidos en la model card; se recomienda auditoria propia antes de uso en produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el acceso al modelo esta sujeto a un proceso de gated access con aceptacion de la politica de privacidad de Mistral AI.
- Configuracion recomendada: temperatura inferior a 0,1 para produccion, conjunto de herramientas limitado y bien definido, y relaciones de aspecto de imagen cercanas a 1:1.
- Idiomas: aunque declara once idiomas, no se especifica el nivel de rendimiento por idioma; el espanol esta entre los soportados.
- No hay integracion en transformers en el momento de la publicacion; el soporte principal es vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512
- Variante NVFP4: https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512-NVFP4
- Variante BF16: https://huggingface.co/mistralai/Mistral-Large-3-675B-Instruct-2512-BF16
- Blog oficial de Mistral 3: https://mistral.ai/news/mistral-3
- Sitio de Mistral AI: https://mistral.ai/
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Imagen Docker de vLLM: https://hub.docker.com/layers/vllm/vllm-openai/latest
- mistral-common en GitHub: https://github.com/mistralai/mistral-common
- Release de mistral-common v1.8.6: https://github.com/mistralai/mistral-common/releases/tag/v1.8.6
- Politica de privacidad de Mistral AI: https://mistral.ai/terms/
- Consola de Mistral AI: https://console.mistral.ai/home
