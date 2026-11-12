# prithivMLmods/d3-edge-GGUF

## Resumen

d3-edge es un modelo de decisión multimodal de 0,59 mil millones de parámetros (748.008.384 parámetros totales según los pesos en safetensors) desarrollado por el equipo de vLLM Semantic Router. Incluye un codificador de visión de 0,10 mil millones de parámetros y se distribuye bajo licencia Apache-2.0. La model card indica que su modelo base es Qwen3.5-0.8B. No es un modelo generativo de texto: recibe texto o JSON, opcionalmente acompañado de varias imágenes y vídeos, y responde a preguntas de tipo multiple choice, sí/no y puntuación en una sola llamada, devolviendo una probabilidad para cada opción sin generar texto libre.

Este repositorio en concreto (`prithivMLmods/d3-edge-GGUF`) contiene cuantizaciones GGUF del modelo original `vllm-sr/d3-edge`, pensadas para su despliegue con llama.cpp a través del endpoint propietario `v1/systemone`. El modelo está orientado a tareas de enrutamiento, clasificación zero-shot y toma de decisiones rápidas ("system-one"), con latencias muy bajas: 6,6 ms de mediana por petición de texto en una AMD Instinct MI325X y hasta 861 peticiones por segundo en modo Engine con batching.

Su relevancia actual radica en que ocupa un nicho poco habitual: modelos pequeños y rápidos que sustituyen a clasificadores tradicionales en pipelines de agentes y routers semánticos, con soporte multimodal (imagen y vídeo) y una API estructurada que devuelve distribuciones de probabilidad en lugar de texto. Según la model card, obtiene 20,2 en el Jev Decision Index 0.3.2 (tabla de texto), 31,7 en la tabla de visión y 46,6 en el benchmark de vídeo Perception Test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de decisión); codificador de visión de 0,10B; base declarada Qwen3.5-0.8B |
| Parametros totales | 748.008.384 (0,59B según la model card; 0,75B según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0; proyección multimodal mmproj-bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo multimodal con un codificador de visión de 0,10B parámetros y un componente de lenguaje que la model card vincula a Qwen3.5-0.8B. El modelo acepta entradas de texto o JSON, opcionalmente con varias imágenes y vídeos, y produce respuestas estructuradas de tipo `choice`, `noul` (sí/no) y `score`, cada una con su probabilidad asociada. No genera texto libre, lo que lo sitúa en la categoría de modelos de decisión o clasificadores neuronales más que en la de LLM conversacionales.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La licencia Apache-2.0 y la etiqueta "system-one" sugieren un enfoque en inferencia rápida de un solo paso, coherente con las latencias reportadas y con el endpoint `v1/systemone` de llama.cpp. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación zero-shot y decisiones de multiple choice con distribución de probabilidad por opción.
- Preguntas de sí/no (`noul`) con probabilidad asociada.
- Puntuación ordinal (`score`) sobre criterios definidos por el usuario.
- Procesamiento multimodal: texto, JSON, imágenes y vídeos (con el fichero mmproj correspondiente).
- Enrutamiento semántico y clasificación de intenciones en pipelines de agentes.
- Modo "system-one": inferencia rápida de un solo paso, sin generación de texto.
- API estructurada mediante el endpoint `v1/systemone` de llama.cpp.
- Soporte de batching en modo Engine de vLLM Semantic Router (hasta 861 req/s según la model card).
- Integración con `transformers` (`AutoModel` o pipeline) y con `vllm-sr serve`.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el mensaje del cliente como `state` y devuelve la probabilidad de cada equipo (facturación, envío, técnico) mediante preguntas `choice`, lo que permite dirigir automáticamente cada ticket con una confianza cuantificable.
- Moderación y triaje de contenido: clasificación de mensajes como tóxicos, spam o legítimos usando preguntas `noul`, con umbrales ajustables según la probabilidad devuelta.
- Detección de urgencia y sentimiento: combinación de preguntas `score` (urgencia en una escala ordinal) y `noul` (cliente enfadado) para priorizar colas de atención al cliente en tiempo real.
- Clasificación de imágenes en pipelines de visión: con el fichero mmproj y el codificador de 0,10B, el modelo puede etiquetar o filtrar imágenes (por ejemplo, verificar si una foto de producto cumple criterios) sin necesidad de un LLM generativo.
- Análisis de vídeo para percepción: según la model card obtiene 46,6 en Perception Test, lo que lo hace adecuado para tareas de comprensión de vídeo a pequeña escala, como verificar si un clip muestra una acción concreta.
- Router semántico en sistemas de agentes: integrado en vLLM Semantic Router, decide qué herramienta o sub-agente debe atender una petición, con latencias de milisegundos que lo hacen viable como primera capa de un pipeline multiagente.
- Filtrado previo en pipelines RAG: decidir si una consulta es respondible con el contexto recuperado (pregunta `noul`) antes de invocar un modelo generativo grande, ahorrando coste y latencia.
- Clasificación por lotes de datos estructurados: al aceptar JSON como entrada, puede etiquetar grandes volúmenes de registros (por ejemplo, leads comerciales) con preguntas `choice` y `score` en un solo paso.

## Benchmarks y rendimiento

| Benchmark | d3-edge | Referencia comparable |
|---|---|---|
| Jev Decision Index 0.3.2 (texto) | 20,2 | Decision 2.0 (0,6B): 0,6; jiwo 0.8B v2: 25,6; Crivo-150M: 22,2 |
| Jev Decision Index (visión) | 31,7 | no disponible (es la entrada más pequeña de la tabla) |
| Perception Test (vídeo) | 46,6 | no disponible |
| Latencia mediana (texto, 1× AMD Instinct MI325X) | 6,6 ms | no disponible |
| Throughput (modo Engine con batching) | hasta 861 req/s | no disponible |

Según la model card, el modelo no está en la frontera de Pareto de texto porque Crivo-150M alcanza 22,2 con solo 0,15B parámetros. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos, lo cual es coherente con que el modelo no genere texto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con Q4_K_M (509 MB), 0,8 GB con Q8_0 (806 MB) y 1,5 GB con BF16 (1,51 GB); hay que sumar unos 207 MB del fichero mmproj-bf16 si se usa visión.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo está pensado para servirse en hardware de datacenter (la model card cita AMD Instinct MI325X) por su enfoque en throughput.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU o CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server` con el endpoint `v1/systemone`), `vllm-sr serve -e vllm-sr/d3-edge`, y `transformers` (`AutoModel` o pipeline).
- Latencia y throughput: 6,6 ms de mediana por petición de texto en una MI325X; hasta 861 req/s en modo Engine con batching (datos de la model card).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Jev Decision Index (texto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-edge | 0,59B (0,75B en safetensors) | no disponible | 20,2 | Apache-2.0 | GGUF y safetensors en HF |
| Decision 2.0 | 0,6B | no disponible | 0,6 | no disponible | no disponible |
| jiwo 0.8B v2 | 0,8B | no disponible | 25,6 | no disponible | no disponible |
| Crivo-150M | 0,15B | no disponible | 22,2 | no disponible | no disponible |

d3-edge se sitúa segundo entre los modelos de tamaño similar en la tabla de texto del Jev Decision Index, por detrás de jiwo 0.8B v2, y por delante de Decision 2.0. Su ventaja frente a Crivo-150M es la multimodalidad (visión y vídeo) y el soporte de API estructurada; su desventaja es que Crivo-150M logra mejor puntuación con menos parámetros. En la tabla de visión es la entrada más pequeña, con 31,7 puntos.

## Limitaciones y advertencias

- No genera texto libre: solo devuelve probabilidades sobre opciones predefinidas, por lo que no sirve para tareas generativas.
- Solo soporta inglés según la model card; el rendimiento en otros idiomas no está documentado.
- La longitud de contexto no está especificada, lo que dificulta planificar su uso con entradas largas.
- Riesgo de alucinación estructural: al asignar probabilidades, puede mostrar alta confianza en opciones incorrectas si las preguntas o criterios están mal formulados.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento ni evaluaciones de sesgo.
- El endpoint `v1/systemone` es específico de llama.cpp y no forma parte de la API estándar de OpenAI; requiere un cliente adaptado.
- La discrepancia entre los 0,59B de la model card y los 748M de safetensors debe tenerse en cuenta al estimar memoria.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica que es una cuantización reciente y poco validada por la comunidad.
- Aunque la licencia es Apache-2.0 (permisiva para uso comercial), conviene verificar las condiciones del modelo base `vllm-sr/d3-edge`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/d3-edge-GGUF
- Modelo base: https://huggingface.co/vllm-sr/d3-edge
- Fichero BF16: https://huggingface.co/prithivMLmods/d3-edge-GGUF/blob/main/d3-edge.BF16.gguf
- Fichero Q4_K_M: https://huggingface.co/prithivMLmods/d3-edge-GGUF/blob/main/d3-edge.Q4_K_M.gguf
- Proyección multimodal: https://huggingface.co/prithivMLmods/d3-edge-GGUF/blob/main/d3-edge.mmproj-bf16.gguf
