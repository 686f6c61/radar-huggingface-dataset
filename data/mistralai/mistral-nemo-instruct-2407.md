# mistralai/Mistral-Nemo-Instruct-2407

## Resumen

Mistral-Nemo-Instruct-2407 es un modelo de lenguaje de 12.247.782.400 parámetros (aproximadamente 12B), variante afinada para seguir instrucciones del modelo base Mistral-Nemo-Base-2407. Fue entrenado conjuntamente por Mistral AI y NVIDIA, y se publicó el 17 de julio de 2024 bajo licencia Apache 2.0, lo que permite uso comercial sin las restricciones habituales de otras licencias de modelos abiertos. La model card lo describe como un reemplazo directo ("drop-in replacement") del Mistral 7B, con un salto notable en tamaño y ventana de contexto.

Su rasgo diferencial es la ventana de contexto de 128.000 tokens, muy superior a los 8k o 32k típicos de modelos de su categoría en el momento de su lanzamiento. La arquitectura es un transformer denso (no MoE) de 40 capas, dimensión 5.120 y atención con Grouped Query Attention (8 cabezas KV frente a 32 cabezas de consulta), con embeddings rotatorios de theta 1M para sostener el contexto largo. El vocabulario Tekken es de aproximadamente 128.000 tokens (2^17).

El modelo está entrenado con una proporción elevada de datos multilingües y de código, y cubre de forma declarada nueve idiomas: inglés, francés, alemán, español, italiano, portugués, ruso, chino y japonés. Es relevante ahora porque combina tres factores poco frecuentes a la vez en la gama de 12B: licencia Apache 2.0, contexto de 128k y soporte explícito de function calling, lo que lo sitúa como opción para despliegues en producción con requisitos de privacidad o de coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE) con GQA y RoPE |
| Parametros totales | 12.247.782.400 (aprox. 12B) |
| Parametros activos | No aplica, modelo denso |
| Longitud de contexto | 128.000 tokens (128k) |
| Tipos de cuantizacion | No disponible. La model card solo publica pesos en safetensors; no se documentan cuantizaciones oficiales |
| Idiomas soportados | Ingles, frances, aleman, espanol, italiano, portugues, ruso, chino, japones |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (consolidated.safetensors), con params.json y tokenizador tekken.json |

Datos arquitectónicos adicionales declarados en la model card: 40 capas, dimensión 5.120, head dim 128, hidden dim 14.336, función de activación SwiGLU, 32 cabezas de atención, 8 cabezas KV (GQA), tamaño de vocabulario 2^17 (aprox. 128k) y Rotary Embeddings con theta = 1M. El tamaño del repositorio en HuggingFace es de 49,0 GB.

## Arquitectura y entrenamiento

Mistral-Nemo-Instruct-2407 es un transformer decoder-only denso, sin mezcla de expertos. Las decisiones de arquitectura declaradas son: 40 capas, dimensión de modelo 5.120, dimensión de cabeza 128, dimensión oculta de 14.336 en las capas feed-forward, activación SwiGLU, 32 cabezas de consulta y 8 cabezas de clave/valor mediante Grouped Query Attention. El uso de GQA reduce el coste de memoria de la caché KV, algo crítico cuando la ventana llega a 128.000 tokens. Los embeddings rotatorios usan theta = 1M, un valor habitual para sostener contextos muy largos sin degradar la fidelidad posicional. El tokenizador es Tekken, con un vocabulario de aproximadamente 128.000 tokens, optimizado para multilingüismo y código.

El modelo es la versión instruct de Mistral-Nemo-Base-2407 y fue entrenado de forma conjunta por Mistral AI y NVIDIA. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni los métodos de alineación empleados (RLHF, DPO u otros); tampoco detalla si hubo una fase específica de ajuste para function calling, aunque la documentación incluye ejemplos de uso con herramientas (tools) mediante `mistral_common`, lo que confirma soporte nativo del formato. En la información disponible no se documentan innovaciones adicionales como decodificación especulativa, atención lineal ni arquitecturas híbridas.

## Capacidades

- Generación de texto y seguimiento de instrucciones en nueve idiomas: inglés, francés, alemán, español, italiano, portugués, ruso, chino y japonés.
- Razonamiento de sentido común y conocimiento general, con resultados declarados en HellaSwag 83,5%, Winogrande 76,8%, OpenBookQA 60,6%, CommonSenseQA 70,4%, TruthfulQA 50,3%, MMLU 68,0%, TriviaQA 73,8% y NaturalQuestions 31,2%.
- Capacidad multilingüe medida con MMLU por idioma: francés 62,3%, alemán 62,7%, español 64,6%, italiano 61,3%, portugués 63,3%, ruso 59,2%, chino 59,0% y japonés 59,0%.
- Function calling / tool calling: la model card incluye un ejemplo completo de definición de herramientas con `mistral_common.protocol.instruct.tool_calls`, con esquema de parámetros JSON.
- Generación de código: el modelo fue entrenado con una proporción elevada de datos de código, aunque la model card no publica resultados de HumanEval ni de otros benchmarks de código.
- Integración por API de chat: usa la plantilla de instrucciones de `mistral_common` y el tokenizador Tekken.
- Capacidades multimodales (visión o audio): no soportadas; el modelo es exclusivamente de texto según la información disponible.
- Modo de razonamiento explícito ("thinking mode"): no documentado en la model card.

## Casos de uso

- Atención al cliente automatizada: con 128.000 tokens de contexto se pueden mantener conversaciones multi-turno muy largas o inyectar documentación completa de producto sin trocear, reduciendo la pérdida de información respecto a modelos de 8k o 32k.
- Procesamiento de documentos largos: contratos, informes técnicos o expedientes de varios cientos de páginas pueden analizarse en una sola pasada, generando resúmenes estructurados o extrayendo cláusulas concretas.
- Generación de código en producción: al soportar tool calling, puede integrarse en pipelines que invoquen linters, compiladores o APIs de CI/CD, así como en asistentes de IDE para autocompletado y refactorización, con despliegue self-hosted por la licencia Apache 2.0.
- Agentes multi-paso: la combinación de contexto largo y function calling permite construir agentes que mantengan el estado de la tarea, consulten herramientas externas y encadenen varias llamadas sin perder el hilo.
- Asistentes multilingües para mercados europeos: cubre de forma nativa español, francés, alemán, italiano y portugués, con puntuaciones MMLU por encima del 61% en los cinco casos, lo que evita depender de traducción intermedia.
- Búsqueda semántica sobre corpus extensos y RAG: el contexto de 128k permite incluir decenas de fragmentos recuperados en un único prompt, lo que simplifica la fase de reranking frente a esquemas con ventanas pequeñas.
- Extracción de información estructurada: con tool calling y esquemas JSON, es adecuado para convertir texto libre en registros estructurados (facturas, currículums, tickets) sin necesidad de modelos adicionales.
- Sustitución directa de Mistral 7B: la model card lo presenta como reemplazo directo, por lo que permite actualizar despliegues existentes manteniendo interfaces y ganando contexto y calidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Benchmark | Resultado |
|---|---|
| HellaSwag (0-shot) | 83,5% |
| Winogrande (0-shot) | 76,8% |
| OpenBookQA (0-shot) | 60,6% |
| CommonSenseQA (0-shot) | 70,4% |
| TruthfulQA (0-shot) | 50,3% |
| MMLU (5-shot) | 68,0% |
| TriviaQA (5-shot) | 73,8% |
| NaturalQuestions (5-shot) | 31,2% |

MMLU multilingüe:

| Idioma | Resultado |
|---|---|
| Frances | 62,3% |
| Aleman | 62,7% |
| Espanol | 64,6% |
| Italiano | 61,3% |
| Portugues | 63,3% |
| Ruso | 59,2% |
| Chino | 59,0% |
| Japones | 59,0% |

La model card afirma que el modelo "supera significativamente a los modelos existentes de tamaño igual o menor", pero no aporta la tabla comparativa concreta con esos modelos. No se han publicado en la información disponible resultados de HumanEval, GSM8K, MATH ni MT-Bench.

## Requisitos de hardware

- Pesos en BF16/FP16: aproximadamente 24,5 GB (22,8 GiB) solo en pesos, calculado a partir de los 12.247.782.400 parámetros.
- Pesos en INT8: aproximadamente 12,2 GB (11,4 GiB).
- Pesos en INT4: aproximadamente 6,1 GB (5,7 GiB).
- Caché KV: con 8 cabezas KV, head dim 128 y 40 capas, cada token ocupa unos 160 KiB en FP16 (2 x 8 x 128 x 40 x 2 bytes). Para una ventana completa de 128.000 tokens, la caché KV ronda los 19,5 GiB adicionales. El contexto largo es, por tanto, el principal consumidor de memoria, no los pesos.
- GPU profesionales: A100 40 GB y 80 GB, H100 y L40S son opciones adecuadas para BF16 con contexto largo; una A100 de 40 GB permite BF16 con contexto moderado, pero no 128k completos.
- GPU de consumo: en BF16 no cabe en tarjetas de 24 GB si se quiere contexto amplio (22,8 GiB de pesos dejan un margen mínimo). Con cuantización de 4 bits sí cabe en RTX 3090 y RTX 4090 de 24 GB, con contexto limitado por la caché KV.
- Opciones de despliegue documentadas: vLLM (es la librería declarada en el repositorio), `mistral-inference` (CLI `mistral-chat` y API de generación), `transformers` y NVIDIA NeMo. Los tags del repositorio indican despliegue soportado en Amazon SageMaker y Azure. No se documentan en la model card rutas oficiales para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Los datos de la columna de Mistral-Nemo proceden de la información proporcionada. Los de los modelos comparables provienen de sus fichas públicas habituales y no se han verificado en la búsqueda realizada; se incluyen solo a título orientativo.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral-Nemo-Instruct-2407 | 12,2B | 128k | Apache 2.0 | Function calling nativo, 9 idiomas declarados |
| Llama 3.1 8B Instruct | 8B | 128k | Llama 3.1 Community License | Licencia con cláusulas de uso aceptable, no Apache |
| Gemma 2 9B Instruct | 9B | 8k | Gemma Terms of Use | Contexto muy inferior; licencia con restricciones |
| Qwen2.5 7B Instruct | 7B | 131.072 | Apache 2.0 | Contexto comparable y licencia permisiva; menos parámetros |

No hay datos de benchmarks comparativos directos en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento verificada frente a estas alternativas.

## Limitaciones y advertencias

- Riesgo de alucinación: como cualquier LLM, puede generar contenido plausible pero falso. La puntuación declarada en TruthfulQA es del 50,3%, lo que indica que la veracidad factual es una limitación real y requiere verificación externa en producción.
- Rendimiento desigual entre idiomas: aunque cubre nueve idiomas, las puntuaciones MMLU caen hasta el 59,0% en chino y japonés, frente al 68,0% en inglés. Para ruso, chino y japonés conviene validar la calidad en el dominio concreto antes de desplegar.
- Conocimiento limitado o nulo de idiomas fuera de los nueve declarados, incluidos el catalán, el gallego, el euskera y otros idiomas cooficiales o regionales.
- Ventana de contexto larga con coste elevado: 128k tokens de caché KV suponen del orden de 19,5 GiB en FP16, lo que puede hacer inviable el contexto máximo en hardware de consumo y degradar el throughput.
- Ausencia de datos de entrenamiento: no se especifican tokens totales, composición del dataset ni método de alineación, lo que dificulta auditar sesgos o reproducir el entrenamiento.
- Sesgos conocidos: no se documentan en la model card evaluaciones de sesgo (género, raza, religión). Al no haber datos, no puede descartarse la presencia de sesgos procedentes de los datos web de preentrenamiento.
- Licencia Apache 2.0: permite uso comercial sin restricciones de la licencia, pero el repositorio en HuggingFace incluye un aviso de acceso condicionado relativo a la política de privacidad del proveedor. Conviene revisar las condiciones de acceso antes de automatizar descargas.
- Formato de instrucciones específico: requiere usar el tokenizador Tekken y el formato de `mistral_common`; un prompt mal formateado degrada notablemente el seguimiento de instrucciones.
- No soporta visión, audio ni otras modalidades, y no dispone de modo de razonamiento explícito documentado.
- Los datos de benchmarks son los publicados por el propio autor; no se han verificado de forma independiente en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Base-2407
- Blog de lanzamiento de Mistral AI: https://mistral.ai/news/mistral-nemo/
- Repositorio mistral-inference: https://github.com/mistralai/mistral-inference
- Versión NVIDIA en NeMo: https://huggingface.co/nvidia/Mistral-NeMo-12B-Instruct
- Repositorio NeMo: https://github.com/NVIDIA/NeMo
- Transformers de HuggingFace: https://github.com/huggingface/transformers
- Política de privacidad de Mistral AI: https://mistral.ai/terms/
- Sitio de Mistral AI: https://mistral.ai/
- Consola de Mistral AI: https://console.mistral.ai/home
