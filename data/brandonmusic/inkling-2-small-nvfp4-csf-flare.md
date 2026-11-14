# brandonmusic/Inkling-2-Small-NVFP4-CSF-Flare

## Resumen

Inkling-2-Small-NVFP4-CSF-Flare es una conversión de pesos del modelo Inkling 2 Small de Thinking Machines, publicada por el usuario brandonmusic en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetado del checkpoint original en formato NVFP4 para que pueda cargarse en Hyperflare (Flare), un servidor de inferencia local desarrollado por Local Inference Lab y NVIDIA para GPUs de generación SM120 y SM121. El objetivo es hacer que un modelo MoE de gran tamano quepa en cuatro GPUs de 96 GB y se sirva con tensor parallelism.

El repositorio ocupa 3,5 GB en disco, pero el checkpoint publicado originalmente pesa 393,5 GB; la diferencia se debe a que la subida de los 24 shards de safetensors estaba en curso en el momento de la creación de la ficha. La licencia es Apache 2.0 y el pipeline declarado es text-generation. La model card indica que el modelo base es `thinkingmachines/Inkling-2-Small` y que la relación es de cuantización.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización NVFP4 con escalas CSF (una codificación sin pérdida de las escalas de bloque) aplicada a los expertos enrutados de un MoE; por otro, muestra el ecosistema emergente de servidores de inferencia especializados (Hyperflare) que compiten con vLLM y SGLang en el nicho de estaciones de trabajo con GPUs Blackwell.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer, según tags del repo; detalles de capas no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona pruebas con 128K tokens de contexto en decodificación, pero no se declara la ventana máxima oficial) |
| Tipos de cuantización | NVFP4 en pesos de expertos enrutados; escalas de bloque NVFP4 codificadas con CSF (lossless); KV cache en FP8 durante las mediciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (24 shards), más `mtp.safetensors`, `tokenizer.json`, `tiktoken/tokenizer.model` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un MoE con 48 capas (la model card menciona "all 48 layers" al describir las escalas NVFP4). Los pesos de los expertos enrutados de las capas 0 a 39 conservan los valores NVFP4 del checkpoint publicado bit a bit; los de las capas 40 a 47 se convirtieron desde MXFP8 a NVFP4. Cada experto se almacena individualmente como proyecciones gate, up y down.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La model card incluye un draft head (`mtp.safetensors`) idéntico al del checkpoint publicado, lo que sugiere decodificación especulativa con 7 tokens propuestos por ronda. La innovación técnica destacable de esta conversión es el uso de CSF para las escalas de bloque NVFP4, una codificación sin pérdida que reproduce byte a byte las escalas originales tras la decodificación.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` y el pipeline `text-generation`.
- Razonamiento multi-paso y uso de herramientas: la model card menciona que Hyperflare está pensado para "long conversations, coding agents and repeated tool use", aunque no se detalla el soporte nativo de tool calling en el modelo base.
- Decodificación especulativa mediante draft head (7 tokens por ronda).
- Procesamiento de prompts largos: se midió procesamiento de prompts de 8K y 64K tokens.
- Contexto largo en decodificación: se midieron 128K tokens de contexto con 135,7 tokens/s.
- Capacidad multimodal: la model card menciona que "image input was not run on Hyperflare", lo que implica que el modelo base podría tener entrada de imagen, pero no se verificó en este entorno.
- Capacidades multilingües: no disponibles.

## Casos de uso

- **Servicio de conversaciones largas en estación de trabajo**: con una KV cache de 928.000 tokens junto a los pesos, el modelo puede mantener muchas conversaciones simultáneas o sesiones muy largas sin recargar estado, adecuado para asistentes persistentes en un equipo de cuatro GPUs.
- **Agentes de código con uso repetido de herramientas**: Hyperflare está diseñado para "coding agents and repeated tool use"; el modelo puede integrarse en bucles de agente que alternan llamadas a herramientas y generación, con decodificación a 177,9 tokens/s en una sola petición.
- **Procesamiento de documentos extensos**: la ventana efectiva probada de 128K tokens permite resumir o extraer información de contratos, informes o codebases completos en una sola pasada.
- **Evaluación de razonamiento controlada**: las pruebas LAVD, Estonia y Hotel lights con 10 de 10 aciertos indican que el modelo mantiene coherencia en tareas de razonamiento estructurado, útil para pipelines de validación automática.
- **Prototipado de investigación en cuantización**: el repo sirve como referencia para estudiar el impacto de NVFP4 con escalas CSF en un MoE, comparando la perplejidad (6,19 en un pasaje de 4.095 tokens en inglés) con la implementación de referencia.
- **Despliegue en hardware Blackwell compacto**: pensado para DGX Spark y estaciones con RTX PRO 6000, permite servir un modelo grande en un entorno de laboratorio sin cluster de datacenter.
- **Generación de código en producción (con cautela)**: el modelo puede integrarse en pipelines de CI/CD para revisión o generación de parches, pero requiere validar previamente el soporte real de tool calling y la calidad en el dominio.

## Benchmarks y rendimiento

Las únicas métricas publicadas son de velocidad e integridad, no de calidad en benchmarks estándar (MMLU, HumanEval, GSM8K). Se presentan a continuación:

| Medida | Resultado |
|---|---|
| Decodificación, 1 petición | 177,9 tokens/s |
| Decodificación, 2 peticiones simultáneas (total) | 261,8 tokens/s |
| Decodificación, 4 peticiones simultáneas (total) | 424,1 tokens/s |
| Decodificación, 1 petición con 32K de contexto | 154,5 tokens/s |
| Decodificación, 1 petición con 128K de contexto | 135,7 tokens/s |
| Procesamiento de prompt de 8K | 10.379 tokens/s |
| KV cache junto a los pesos | 928.000 tokens |
| Prueba LAVD (10 ejecuciones) | 10 de 10 exactas |
| Prueba Estonia (10 ejecuciones) | 10 de 10 superadas |
| Prueba Hotel lights (10 ejecuciones) | 10 de 10 exactas |
| Perplejidad en pasaje inglés de 4.095 tokens | 6,19 (referencia: 6,19) |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM**: cuatro GPUs de 96 GB cada una (384 GB en total), con tensor parallelism sobre las cuatro tarjetas.
- **GPUs recomendadas**: RTX PRO 6000 Blackwell (96 GB), generación SM120/SM121. Las mediciones se hicieron con dos tarjetas limitadas a 300 W y dos a 350 W, conectadas por PCIe.
- **Consumer GPU**: no cabe en GPUs de consumo (RTX 4090, 5090); el requisito mínimo son cuatro tarjetas profesionales de 96 GB.
- **Opciones de despliegue**: exclusivamente Hyperflare (`NVIDIA/hyperflare-inference`) con una receta de Inkling 2 que lea el layout NVFP4 con escalas CSF. vLLM y SGLang no leen este layout; solo cargan el checkpoint publicado original.
- **Latencia y throughput**: 177,9 tokens/s en decodificación de una petición; 10.379 tokens/s en prefill de 8K; 135,7 tokens/s con 128K de contexto.
- **KV cache**: FP8, con capacidad para 928.000 tokens junto a los pesos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base (Inkling 2 Small de Thinking Machines) sería el término de comparación natural, pero no se han facilitado sus especificaciones ni sus resultados de benchmarks. Tampoco se conocen alternativas MoE cuantizadas a NVFP4 con escalas CSF en el ecosistema abierto a partir de los datos disponibles.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling-2-Small-NVFP4-CSF-Flare | no disponible | no disponible | Apache 2.0 | Hugging Face (repo incompleto en el momento de la ficha) |
| Inkling 2 Small (base) | no disponible | no disponible | Apache 2.0 | Hugging Face (`thinkingmachines/Inkling-2-Small`) |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Repo incompleto**: en el momento de la creación de la ficha, la subida de los 24 shards estaba en curso; el repositorio solo es funcional cuando estén todos los ficheros listados.
- **Dependencia de Hyperflare**: el layout NVFP4 con escalas CSF no lo leen vLLM ni SGLang; requiere una receta específica que no formaba parte de Hyperflare upstream en el momento de la publicación.
- **Hardware muy restrictivo**: solo funciona en GPUs SM120/SM121 (Blackwell) y requiere cuatro tarjetas de 96 GB; no hay alternativa en consumer.
- **Sin validación multimodal**: la entrada de imagen no se probó en Hyperflare, aunque el modelo base podría soportarla.
- **Riesgo de alucinación**: no se han publicado evaluaciones de fidelidad factual ni de sesgos; las pruebas LAVD, Estonia y Hotel lights son de razonamiento estructurado, no de veracidad.
- **Idiomas no declarados**: se desconoce el soporte multilingüe real; las pruebas de perplejidad se hicieron en inglés.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo base y las dependencias (Hyperflare, FlashInfer, vLLM) tienen sus propias licencias que deben revisarse.
- **Prototipo de investigación**: los autores de Hyperflare lo describen como "open-source research prototype", no como sustituto de motores de producción como vLLM.
- **Sin benchmarks de calidad**: no hay datos de MMLU, HumanEval ni GSM8K que permitan evaluar la calidad del modelo frente a alternativas.

## Enlaces

- [Hugging Face: brandonmusic/Inkling-2-Small-NVFP4-CSF-Flare](https://huggingface.co/brandonmusic/Inkling-2-Small-NVFP4-CSF-Flare)
- [Modelo base: thinkingmachines/Inkling-2-Small](https://huggingface.co/thinkingmachines/Inkling-2-Small)
- [Hyperflare (NVIDIA/hyperflare-inference)](https://github.com/NVIDIA/hyperflare-inference)
- [Licencia Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)
- [Paper referenciado en tags: arXiv:2512.02010](https://arxiv.org/abs/2512.02010)
