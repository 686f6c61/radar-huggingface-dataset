# mradermacher/Llama-3.1-8B-Instruct-blocksworld-SFT-GGUF

## Resumen

Llama-3.1-8B-Instruct-blocksworld-SFT-GGUF es una cuantización en formato GGUF del modelo hsaest/Llama-3.1-8B-Instruct-blocksworld-SFT, un ajuste fino supervisado (SFT) sobre la base de Llama 3.1 8B Instruct de Meta. El modelo original ha sido especializado mediante SFT en tareas del dominio Blocksworld, un entorno clásico de planificación automática en el que se manipulan bloques sobre una mesa con reglas de apilamiento. La cuantización la ha realizado mradermacher, un autor habitual en el ecosistema de cuantizaciones GGUF para llama.cpp.

El interés de esta ficha radica en que permite ejecutar en hardware de consumo un modelo de 8.030 millones de parámetros especializado en razonamiento sobre planificación simbólica, algo poco frecuente en el catálogo de modelos abiertos. El modelo base hereda la arquitectura transformer decoder-only de Llama 3.1, con una ventana de contexto de 128.000 tokens según la especificación de la familia original, aunque la model card no detalla cambios arquitectónicos respecto a la base.

La licencia no está declarada en la model card del repositorio de cuantización, y el modelo base no expone tampoco una licencia explícita en la información disponible. Esto supone una advertencia relevante para uso comercial. El repositorio acumula 250 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y un ecosistema de validación prácticamente inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct, según modelo base) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (según especificación de Llama 3.1; no confirmado en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas; sin imatrix disponibles) |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste fino supervisado de Llama 3.1 8B Instruct sobre el dominio Blocksworld. La arquitectura es la de Llama 3.1: transformer decoder-only con atención por grupos (GQA en la familia 3.1), normalización RMSNorm y activación SwiGLU, según la especificación pública de Meta. La model card del repositorio de cuantización no aporta detalles sobre el dataset de SFT, el número de tokens de entrenamiento, la composición de las trayectorias de planificación ni si se aplicaron técnicas de RLHF o DPO adicionales.

La cuantización realizada por mradermacher es de tipo estático (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1) y no incluye variantes con imatrix ponderada. El autor indica explícitamente que las cuantizaciones ponderadas por imatrix no están disponibles en el momento de la publicación y que podrían no planificarse. Esto implica que las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar más la calidad que sus equivalentes IQ en otros repositorios.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama 3.1 8B Instruct.
- Razonamiento sobre planificación simbólica en el dominio Blocksworld: manipulación de bloques, apilamiento, desapilamiento y cumplimiento de objetivos.
- Razonamiento multi-paso orientado a la resolución de problemas de planificación clásica.
- Instrucciones conversacionales en formato chat (etiqueta conversational en Hugging Face).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de tool calling, function calling, visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Investigación en planificación automática: el modelo puede emplearse como baseline para evaluar la capacidad de un LLM de 8B de resolver problemas de Blocksworld tras SFT, comparando su tasa de éxito con planificadores simbólicos clásicos como Fast Downward.
- Generación de trayectorias de planificación sintéticas: útil para aumentar datasets de entrenamiento en dominios de planificación, ya que el modelo ha sido expuesto específicamente a este tipo de problemas y puede producir secuencias de acciones plausibles.
- Evaluación de cuantizaciones en tareas de razonamiento: al disponer de 12 variantes GGUF, permite estudiar empíricamente la degradación de calidad en tareas de planificación al reducir la precisión, desde f16 hasta Q2_K.
- Despliegue en hardware de consumo para demostraciones educativas: la variante Q4_K_M (5,0 GB) cabe en GPUs con 8 GB de VRAM, lo que permite ejecutar un modelo especializado en razonamiento en portátiles y estaciones de trabajo modestas.
- Prototipado de agentes simbólicos en entornos de bloques: integrable en simuladores de planificación para generar propuestas de acciones que luego se validan con un verificador formal.
- Experimentación con llama.cpp y Ollama: al estar en formato GGUF, se puede cargar directamente en estas herramientas para pruebas de latencia y throughput en CPU y GPU sin necesidad de infraestructura de servidor.
- Estudio de sesgos de especialización: útil para analizar cómo un SFT estrecho en un dominio (Blocksworld) afecta a las capacidades generales del modelo base en tareas fuera de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~3,3 GB; Q4_K_M ~5,0 GB; Q8_0 ~8,6 GB; f16 ~16,2 GB (tamaños de archivo, que incluyen overhead mínimo).
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M y Q5_K_M; RTX 4090 24 GB para Q8_0 y f16; A100 40 GB o H100 para despliegues con contexto largo (128k tokens) y concurrencia.
- Cabe en GPU de consumo: sí, en GPUs con 8 GB o más para cuantizaciones Q4 y Q5; en GPUs con 6 GB para Q3_K_M y Q3_K_L.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para vLLM o TGI sería preferible usar el modelo base en safetensors (hsaest/Llama-3.1-8B-Instruct-blocksworld-SFT) en lugar de los GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia orientativa de la familia Llama 3.1 8B en Q4_K_M sobre RTX 4090, se suelen observar decenas de tokens por segundo, pero no se confirma para este ajuste fino concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-blocksworld-SFT-GGUF (este) | 8,03 B | 128k (según base) | Blocksworld / planificación | no disponible | GGUF |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128k | Generalista | Llama 3.1 Community License | safetensors, GGUF |
| hsaest/Llama-3.1-8B-Instruct-blocksworld-SFT | 8,03 B | 128k (según base) | Blocksworld / planificación | no disponible | safetensors |
| Qwen2.5-7B-Instruct | 7,6 B | 128k | Generalista con buen rendimiento en código y matemáticas | Apache 2.0 | safetensors, GGUF |

La comparativa con Qwen2.5-7B-Instruct se incluye por ser un modelo de tamaño similar con licencia permisiva y amplia disponibilidad de cuantizaciones, aunque no está especializado en planificación. No se dispone de benchmarks que permitan comparar el rendimiento de este ajuste fino con alternativas en tareas de Blocksworld.

## Limitaciones y advertencias

- Licencia no declarada: tanto la model card de la cuantización como la del modelo base carecen de licencia explícita, lo que impide determinar si el uso comercial está permitido. Se recomienda contactar con el autor antes de cualquier despliegue en producción.
- Especialización estrecha: el SFT en Blocksworld puede degradar el rendimiento en tareas generales de conversación, código o matemáticas respecto a Llama 3.1 8B Instruct original, aunque no se han publicado evaluaciones que lo cuantifiquen.
- Riesgo de alucinación en planes: el modelo puede generar secuencias de acciones que parezcan válidas pero violen las precondiciones del dominio; se recomienda validar con un verificador simbólico.
- Idioma: la model card solo declara inglés, por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Cuantizaciones sin imatrix: las variantes Q2_K y Q3_K pueden presentar una degradación de calidad superior a la habitual en cuantizaciones ponderadas, especialmente en tareas de razonamiento multi-paso.
- Adopción muy baja: 250 descargas y 0 likes indican ausencia de validación comunitaria; no hay informes independientes de calidad ni de comportamiento en producción.
- Contexto no confirmado: aunque la familia Llama 3.1 soporta 128k tokens, la model card no confirma que el ajuste fino preserve esa ventana; conviene validarlo empíricamente.
- Sin datos de sesgos: no se ha publicado información sobre sesgos del ajuste fino ni sobre la composición del dataset de SFT.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mradermacher/Llama-3.1-8B-Instruct-blocksworld-SFT-GGUF
- Modelo base del ajuste fino: https://huggingface.co/hsaest/Llama-3.1-8B-Instruct-blocksworld-SFT
- Página de descargas del autor: https://hf.tst.eu/model#Llama-3.1-8B-Instruct-blocksworld-SFT-GGUF
- Repositorio de solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
