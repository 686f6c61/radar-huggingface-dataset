# mradermacher/futfut_by_zephyr7b-GGUF

## Resumen

`mradermacher/futfut_by_zephyr7b-GGUF` es una coleccion de cuantizaciones GGUF del modelo base `Dongwookss/futfut_by_zephyr7b`, un ajuste fino (fine-tune) del conocido Zephyr-7B orientado a un dominio muy concreto: preguntas y respuestas sobre futbol sala (futsal) en coreano. El modelo base fue entrenado por Dongwookss a partir del dataset `Dongwookss/q_a_korean_futsal`, y mradermacher se encarga unicamente de la conversion y cuantizacion a formato GGUF para facilitar su despliegue en entornos con recursos limitados.

Arquitectura transformer decoder-only con aproximadamente 7.240 millones de parametros (7.241.732.096 en safetensors), heredada directamente de Zephyr-7B. El modelo esta especializado exclusivamente en coreano y en la tematica del futsal, lo que lo convierte en un caso de uso de nicho mas que en un modelo de proposito general. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Su relevancia practica radica en dos factores: por un lado, demuestra el flujo tipico de publicacion de un fine-tune especializado con cuantizaciones listas para `llama.cpp`/Ollama; por otro, ofrece un punto de partida concreto para quien necesite un asistente de dominio cerrado en coreano sobre deporte de salon, con un rango de cuantizaciones que va de 2,8 GB (Q2_K) a 14,6 GB (f16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Zephyr-7B) |
| Parametros totales | 7.241.732.096 (aprox. 7,24 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Zephyr-7B; no confirmada en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Zephyr-7B, un transformer decoder-only denso de aproximadamente 7,2 mil millones de parametros. No se trata de una arquitectura MoE ni hibrida: todos los parametros estan activos en cada paso de inferencia. El fine-tune fue realizado por Dongwookss empleando el dataset `Dongwookss/q_a_korean_futsal`, un conjunto de pares pregunta-respuesta en coreano centrado en futbol sala. Las etiquetas del repositorio (`unsloth`, `trl`) indican que el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, tecnicas habituales para fine-tuning eficiente de modelos de 7B.

La contribucion de mradermacher se limita a la cuantizacion estatica en formato GGUF (convert_type `hf`, quantize_version 2, output_tensor_quantised 1). El autor indica que tambien existen cuantizaciones ponderadas/imatrix en el repositorio `mradermacher/futfut_by_zephyr7b-i1-GGUF`. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion exacta del dataset, uso de RLHF/DPO ni innovaciones tecnicas adicionales mas alla del pipeline estandar de fine-tuning.

## Capacidades

- Generacion de texto conversacional en coreano, orientada a preguntas y respuestas.
- Respuestas especializadas en la tematica de futbol sala (reglas, tacticas, historia, equipos, jugadores, etc.), segun el dataset de entrenamiento.
- Formato conversacional (tag `conversational`), apto para pipelines de chat multi-turno.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su integracion en servicios de inferencia.
- Capacidades generales heredadas de Zephyr-7B (redaccion, resumen, explicacion) potencialmente degradadas o sesgadas por el ajuste fino de dominio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.
- Multilingue: no disponible; el modelo declara unicamente coreano.

## Casos de uso

- Asistente de consulta sobre reglas de futsal: el modelo responde a preguntas cerradas sobre normativa, arbitraje y situacion de juego en coreano, aprovechando el dataset especifico de Q&A.
- Soporte a entrenadores y arbitros: consultas rapidas sobre tacticas, formaciones y procedimientos disciplinarios en coreano, con respuestas generadas a partir de conocimiento curado del dominio.
- Chatbot para aficionados en comunidades coreanas: integracion en foros o canales de mensajeria para resolver dudas recurrentes sobre equipos y competiciones de futsal.
- Generacion de material divulgativo: redaccion de fichas, resumenes y explicaciones basicas sobre futsal para blogs o webs en coreano.
- Base para fine-tuning adicional: al ser un modelo pequeno (7B) y con licencia Apache 2.0, sirve como punto de partida para ampliar el dominio (otros deportes de salon, otras ligas) mediante nuevo ajuste fino.
- Despliegue en hardware modesto: las cuantizaciones Q4_K_M (4,5 GB) y Q5_K_M (5,2 GB) permiten ejecutar el modelo en GPU de consumo o incluso CPU con `llama.cpp`, util para demos locales o entornos sin aceleradores dedicados.
- Prototipado de pipelines RAG de nicho: usar el modelo como generador final en un sistema de recuperacion sobre documentacion de futsal en coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion GGUF): Q2_K ~2,8 GB; Q4_K_M ~4,5 GB; Q5_K_M ~5,2 GB; Q6_K ~6,0 GB; Q8_0 ~7,8 GB; f16 ~14,6 GB (mas overhead de contexto y cache KV).
- GPU recomendadas: para f16 o Q8_0, GPU con 16-24 GB (RTX 4090, A10, L4, A100 40 GB); para Q4_K_M y Q5_K_M, GPU de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) o incluso 6-8 GB con cuantizaciones Q3.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 8 GB o mas usando Q4_K_M o inferior; en GPUs de 4-6 GB solo con Q2_K/Q3_K_S y contexto reducido.
- Opciones de despliegue: `llama.cpp` (formato nativo GGUF), Ollama, LM Studio, `llama-cpp-python`, servidores compatibles con endpoints (tag `endpoints_compatible`); vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que para esos motores habria que usar los pesos safetensors del modelo base.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| futfut_by_zephyr7b (este) | 7,24 B | no disponible | ko | Apache 2.0 | GGUF | Fine-tune de nicho sobre futsal en coreano |
| Zephyr-7B-beta (base de referencia) | ~7,2 B | 32k (segun model card original; no confirmado aqui) | en (principalmente) | MIT | safetensors, GGUF | Modelo generalista con DPO; no especializado en coreano ni futsal |
| Mistral-7B-v0.1 (ancestro arquitectonico) | ~7,2 B | 8k (segun model card original; no confirmado aqui) | en, multilingue parcial | Apache 2.0 | safetensors, GGUF | Base generalista; sin ajuste de dominio |
| Qwen2.5-7B-Instruct | ~7,6 B | 32k (segun model card original; no confirmado aqui) | multilingue (incluye ko) | Apache 2.0 | safetensors, GGUF | Alternativa generalista multilingue con mejor cobertura de coreano |

La comparativa con Zephyr-7B-beta y Mistral-7B es puramente arquitectonica: este fine-tune hereda su estructura pero pierde generalidad a cambio de especializacion en coreano y futsal. Frente a Qwen2.5-7B-Instruct, este modelo ofrece respuestas de dominio mas precisas si el uso es exclusivamente futsal en coreano, pero carece de capacidades multilingues y de contexto largo verificadas.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un dataset de Q&A de un unico dominio, puede reproducir sesgos presentes en las respuestas originales (por ejemplo, opinion sobre equipos o jugadores) y carece de alineacion general fuera de futsal.
- Riesgo de alucinacion: elevado fuera del dominio de entrenamiento; incluso dentro del dominio puede inventar datos estadisticos, nombres o resultados no cubiertos por el dataset.
- Limitaciones de contexto e idioma: solo declara coreano; el rendimiento en castellano, ingles u otros idiomas no esta garantizado y probablemente sera deficiente. La longitud de contexto no esta confirmada en esta ficha.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene revisar la licencia del modelo base original (`Dongwookss/futfut_by_zephyr7b`) y del dataset para confirmar compatibilidad.
- Caveats para produccion: modelo de nicho con 83 descargas y 0 likes en el momento de la ficha, sin benchmarks publicados; no recomendable como modelo generalista. Las cuantizaciones de baja calidad (Q2_K, Q3_K_M marcada como "lower quality") degradan notablemente la coherencia. El repositorio ocupa 63,9 GB por incluir todas las variantes; descargar solo el archivo GGUF necesario.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/futfut_by_zephyr7b-GGUF
- Modelo base: https://huggingface.co/Dongwookss/futfut_by_zephyr7b
- Dataset de entrenamiento: https://huggingface.co/datasets/Dongwookss/q_a_korean_futsal
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/futfut_by_zephyr7b-i1-GGUF
- Pagina de conveniencia del autor: https://hf.tst.eu/model#futfut_by_zephyr7b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
