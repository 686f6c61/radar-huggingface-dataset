# mradermacher/ThoxEdge-0.8B-GGUF

## Resumen

ThoxEdge-0.8B-GGUF es la versión cuantizada en formato GGUF del modelo Thox-ai/ThoxEdge-0.8B, un modelo de lenguaje de aproximadamente 752 millones de parámetros (0,8B nominales) desarrollado por Thox-ai y orientado a despliegue en dispositivo (on-device) y entornos edge. La cuantización la firma mradermacher, un autor conocido en el ecosistema por publicar versiones GGUF de modelos abiertos, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo base se presenta en la model card como un transformer derivado de la familia Qwen3.5 (etiqueta `qwen3.5`), afinado mediante SFT (supervised fine-tuning) sobre el dataset Thox-ai/thox-factory-sft-v5. Los tags del repositorio (`meshstack`, `thoxos`, `wave-c`, `local-first`, `ollama`, `on-device`) apuntan a un ecosistema propietario de Thox orientado a inferencia local y agentes ligeros, aunque la información pública disponible no detalla la arquitectura interna ni los datos de entrenamiento más allá de la referencia al dataset.

Su relevancia actual radica en el tamaño: con menos de 1.000 millones de parámetros y cuantizaciones que van de 0,5 GB (Q2_K) a 1,6 GB (f16), es un candidato claro para ejecutarse en CPU, GPUs consumer de gama baja y dispositivos con memoria limitada, manteniendo un pipeline compatible con transformers, llama.cpp y Ollama. La información disponible es escasa en cuanto a benchmarks, contexto e idiomas, por lo que esta ficha marca explícitamente los datos no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de la familia Qwen3.5 según tags; detalles no disponibles) |
| Parámetros totales | 752.393.024 (según safetensors del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés; según campo `language` de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La model card del repositorio cuantizado no aporta detalles sobre la arquitectura interna del modelo base. Los tags indican que se trata de un transformer derivado de Qwen3.5, afinado con SFT sobre el dataset Thox-ai/thox-factory-sft-v5, y el pipeline declarado es `transformers`. No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención, la longitud de contexto nativa ni la composición exacta del dataset de entrenamiento. Tampoco se documenta si hubo fases de RLHF, DPO u otras técnicas de alineación posteriores al SFT.

En cuanto a la cuantización, el repositorio de mradermacher incluye cuantizaciones estáticas generadas con el conversor HF a GGUF (`convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`). El autor indica que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicación y que podrían no llegar a publicarse. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (`conversational` en los tags del repo).
- Afinado específico mediante SFT sobre el dataset thox-factory-sft-v5, orientado presumiblemente a instrucciones y tareas de agente, aunque la model card no detalla las capacidades exactas.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags) y despliegue vía Ollama y llama.cpp por el formato GGUF.
- Orientación a inferencia local y on-device (`on-device`, `edge`, `local-first` en los tags), pensada para entornos con recursos limitados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`; no se documentan otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en escritorio: el modelo puede ejecutarse con llama.cpp u Ollama en un portátil convencional gracias a sus cuantizaciones de 0,5-0,9 GB, ofreciendo respuestas en inglés sin conexión a internet y sin enviar datos a terceros.
- Clasificación y etiquetado de texto en el edge: con 752 millones de parámetros y cuantización Q4_K_M (0,6 GB), es viable desplegarlo en dispositivos con poca RAM para tareas de categorización, extracción de entidades o filtrado de contenido en tiempo real.
- Autocompletado y generación de texto en aplicaciones móviles o embebidas: el tamaño reducido del f16 (1,6 GB) y de Q8_0 (0,9 GB) permite integrarlo en apps que necesitan generación de texto sin depender de una API remota.
- Prototipado rápido de pipelines de IA generativa: al ser compatible con transformers y GGUF, permite validar flujos de prompt engineering y evaluación antes de escalar a modelos mayores, con un coste de infraestructura mínimo.
- Procesamiento por lotes en CPU: en servidores sin GPU, la versión Q4_K_S o Q4_K_M puede procesar grandes volúmenes de texto en inglés con un throughput aceptable para tareas no interactivas (resúmenes, reformulación, respuestas a preguntas simples).
- Entornos con requisitos de privacidad estrictos: al ejecutarse completamente en local y con licencia Apache 2.0, encaja en despliegues sanitarios, industriales o administrativos donde no se permite el envío de datos a la nube.
- Base para fine-tuning ligero: al ser un modelo pequeño y con licencia permisiva, sirve como punto de partida para ajustes específicos de dominio en inglés con recursos de cómputo modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,7 GB para cuantizaciones Q2_K a Q5_K_M, 0,7-0,9 GB para Q6_K y Q8_0, y 1,6 GB para f16. Estas cifras corresponden al tamaño de los ficheros GGUF; el consumo real de memoria incluye overhead del runtime y la caché KV, que depende de la longitud de contexto (no documentada).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM puede ejecutar las cuantizaciones más pequeñas; una RTX 3060, RTX 4060 o superior permite cargar el modelo completo en VRAM con margen para contexto. En entornos de servidor, una T4 o A10 es más que suficiente; A100 y H100 no aportan ventaja significativa para este tamaño.
- ¿Cabe en GPU consumer? Sí, en prácticamente todas las GPU dedicadas modernas, e incluso en iGPUs con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama (tag `ollama` en el repo), y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño, se espera una latencia baja en GPU y un throughput moderado en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ThoxEdge-0.8B-GGUF | 752 M | no disponible | Apache 2.0 | GGUF | Hugging Face (mradermacher) |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens (versión base Qwen2.5) | Apache 2.0 | safetensors, GGUF | Hugging Face (oficial Qwen) |
| Llama 3.2 1B Instruct | 1.240 M | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Hugging Face (Meta) |
| SmolLM2-1.7B-Instruct | 1.700 M | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face (HuggingFaceTB) |

La comparativa se basa en características públicas de modelos de tamaño similar; no se dispone de datos de rendimiento del ThoxEdge-0.8B para establecer comparaciones cuantitativas. El ThoxEdge destaca por su licencia Apache 2.0 y su tamaño inferior a 1B, pero carece de documentación pública sobre contexto, benchmarks e idiomas que sí ofrecen los modelos de Qwen, Meta y HuggingFaceTB.

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado únicamente para inglés (`language: en`); no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Contexto: no se documenta la longitud de contexto nativa, lo que impide planificar despliegues con ventanas largas o conversaciones multi-turno extensas.
- Benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni otras evaluaciones, por lo que no es posible verificar su calidad frente a alternativas.
- Alucinación: al ser un modelo de 0,8B, la tasa de alucinación esperada es alta en tareas de conocimiento factual; no se recomienda su uso en dominios que requieran precisión verificable sin validación posterior.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad; el dataset de SFT (thox-factory-sft-v5) no está descrito en la información disponible.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar la licencia del modelo base Thox-ai/ThoxEdge-0.8B por si hubiera condiciones adicionales no reflejadas en el repo cuantizado.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S pueden degradar notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M como equilibrio entre tamaño y calidad.
- Cuantizaciones ponderadas: no estaban disponibles en el momento de la publicación y el autor no garantiza que se publiquen.
- Ecosistema propietario: los tags `thoxos`, `meshstack` y `wave-c` sugieren dependencia de un ecosistema concreto de Thox; no se documenta si el modelo funciona correctamente fuera de él.
- Madurez: el repositorio tiene 0 likes y 914 descargas, lo que indica una adopción muy limitada y poca validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/mradermacher/ThoxEdge-0.8B-GGUF
- Modelo base: https://huggingface.co/Thox-ai/ThoxEdge-0.8B
- Dataset de SFT: https://huggingface.co/datasets/Thox-ai/thox-factory-sft-v5
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#ThoxEdge-0.8B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
