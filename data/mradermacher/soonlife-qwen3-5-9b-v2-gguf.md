# mradermacher/Soonlife-Qwen3.5-9B-v2-GGUF

## Resumen

Soonlife-Qwen3.5-9B-v2-GGUF es la distribucion en formato GGUF de las cuantizaciones estaticas del modelo Soonlife-Qwen3.5-9B-v2, publicado por el usuario wonchandev y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 8.950 millones de parametros derivado de la familia Qwen3.5, afinado mediante un proceso de destilacion y fusion de LoRA (lora-merged) sobre el dataset Soonlife_dataset, con un enfoque declarado hacia casos de recuperacion aumentada (RAG) y tool-calling en coreano.

El modelo esta disenado para tareas conversacionales en coreano, incorporando capacidades de function calling y razonamiento multi-paso orientadas a agentes. Su licencia Apache 2.0 facilita el uso comercial, y la disponibilidad de cuantizaciones GGUF de multiples tamanos (desde Q2_K hasta f16) permite desplegarlo en hardware de consumo.

Este repositorio concreto no contiene los pesos originales en safetensors, sino las conversiones GGUF generadas por mradermacher, lo que lo hace directamente utilizable en llama.cpp, Ollama y otros motores compatibles con GGUF. La relevancia actual radica en la combinacion de un tamano manejable (9B), soporte declarado de tool-calling y RAG, y una licencia permisiva, aunque la documentacion tecnica disponible es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es wonchandev/Soonlife-Qwen3.5-9B-v2, construido sobre la arquitectura Qwen3.5 con aproximadamente 8.950 millones de parametros. El etiquetado incluye "distillation" y "lora-merged", lo que sugiere un proceso de destilacion desde un modelo mayor y la fusion de adaptadores LoRA en los pesos finales. El dataset de entrenamiento declarado es wonchandev/Soonlife_dataset.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La presencia de archivos mmproj (multi-modal supplement) en el repositorio sugiere soporte de entrada multimodal en el modelo base, aunque no se detalla su alcance.

## Capacidades

- Generacion de texto conversacional en coreano.
- Soporte declarado de tool-calling / function calling (tag "tool-calling").
- Orientacion a flujos de recuperacion aumentada (RAG) segun el tag "rag".
- Razonamiento multi-paso para agentes (inferido de los tags, sin detalle tecnico).
- Capacidades multimodales potenciales por la presencia de archivos mmproj (alcance no documentado).
- Capacidades multilingues limitadas al coreano segun el campo de idiomas.
- No se documentan capacidades de codigo, matematicas o thinking mode de forma explicita.

## Casos de uso

- Atencion al cliente en coreano: el modelo puede gestionar conversaciones multi-turno en coreano con un enfoque conversacional, adecuado para asistentes de soporte en ese idioma.
- Recuperacion aumentada (RAG) sobre documentacion coreana: el tag "rag" indica que fue afinado para integrarse en pipelines de recuperacion, conectando un retriever con el modelo para responder con contexto.
- Automatizacion de agentes con tool-calling: el soporte declarado de function calling permite conectarlo a APIs externas y orquestar llamadas a herramientas en flujos de trabajo automatizados.
- Asistentes internos empresariales en coreano: su licencia Apache 2.0 y su tamano de 9B permiten desplegarlo en infraestructura propia para asistentes de conocimiento interno.
- Prototipado rapido en local: las cuantizaciones Q4_K_M (5,7 GB) y Q5_K_M (6,6 GB) permiten ejecutar el modelo en GPU de consumo para pruebas y demos.
- Clasificacion y extraccion de informacion en coreano: el modelo puede emplearse para tareas de procesamiento de lenguaje natural sobre textos coreanos en pipelines de datos.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (3,9 GB) y Q3_K_S (4,4 GB) permiten inferencia en hardware modesto, con la consiguiente perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~3,9 GB; Q3_K_S ~4,4 GB; Q4_K_M ~5,7 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18,0 GB (mas overhead de contexto y KV cache).
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 o f16 con contexto moderado; RTX 3090/4080 (16-24 GB) para Q5_K_M o Q6_K; RTX 4060 Ti (16 GB) para Q4_K_M.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM para cuantizaciones Q4_K_S/Q4_K_M; con 6 GB es viable Q3_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier motor compatible con GGUF; los archivos mmproj permiten el uso multimodal en llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Soonlife-Qwen3.5-9B-v2 (este) | ~8,95B | no disponible | Apache 2.0 | GGUF / safetensors | Afinado para coreano, RAG y tool-calling |
| Qwen3.5-9B base | ~9B | no disponible | no disponible | safetensors | Modelo base de la familia; sin el afinado Soonlife |
| Modelos 7-9B genericos (p. ej. Llama 3.1 8B, Mistral 7B) | 7-8B | 32K-128K (segun modelo) | licencias variables | GGUF / safetensors | Mayor documentacion y benchmarks publicos; sin especializacion en coreano |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Documentacion tecnica muy escasa: no se publican datos de contexto, dataset, tokens de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad real.
- Sesgos conocidos: no documentados; al estar afinado sobre un dataset especifico (Soonlife_dataset) puede presentar sesgos derivados de su composicion.
- Riesgo de alucinacion: no cuantificado; como modelo de 9B sin benchmarks publicos, conviene validar sus salidas en produccion.
- Limitacion de idioma: el campo de idiomas solo declara coreano, por lo que su rendimiento en castellano u otros idiomas es incierto.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide planificar despliegues con ventanas largas sin verificacion empirica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de origen.
- Cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente el rendimiento; se recomienda Q4_K_M o superior para produccion.
- El repositorio solo contiene pesos GGUF; para reentrenamiento o ajuste fino es necesario acudir al modelo base en safetensors.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Soonlife-Qwen3.5-9B-v2-GGUF
- Modelo base: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2
- Dataset: https://huggingface.co/datasets/wonchandev/Soonlife_dataset
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Soonlife-Qwen3.5-9B-v2-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Soonlife-Qwen3.5-9B-v2-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
