# mradermacher/thinklite-27B-v3-GGUF

## Resumen

Thinklite-27B-v3 es un modelo de lenguaje orientado al razonamiento (reasoning) desarrollado por Mintzs, entrenado mediante destilación on-policy (on-policy distillation) sobre un modelo base de 27.320.697.856 parámetros. El repositorio aquí documentado no es el modelo original, sino una colección de cuantizaciones estáticas en formato GGUF creadas por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face que adapta modelos populares para su ejecución local con llama.cpp y herramientas derivadas.

El interés de este modelo radica en la combinación de un tamaño mediano-grande (27B) con técnicas de razonamiento eficiente (efficient-reasoning) y destilación on-policy mediante LoRA, un enfoque que busca reducir la longitud de las cadenas de pensamiento sin sacrificar precisión en tareas de razonamiento. Las cuantizaciones GGUF permiten ejecutarlo en hardware de consumo, desde Q2_K (11 GB) hasta Q8_0 (29,1 GB), e incluyen suplementos multimodales (mmproj), lo que sugiere que el modelo base incorpora capacidades de visión.

La disponibilidad en formato GGUF con licencia Apache 2.0 lo hace relevante para desarrolladores que desean desplegar un modelo razonador de 27B en estaciones de trabajo locales sin depender de APIs de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, con suplemento multimodal mmproj) |
| Parametros totales | 27.320.697.856 (27,32B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas; el modelo base Mintzs/thinklite-27B-v3 usa safetensors) |

## Arquitectura y entrenamiento

La informacion sobre la arquitectura subyacente es limitada. El modelo base es Mintzs/thinklite-27B-v3, con 27,32 mil millones de parametros en formato safetensors. Los tags del repositorio indican el uso de on-policy distillation y LoRA, lo que sugiere que el modelo se ha entrenado mediante destilacion de razonamiento sobre un modelo base existente, con adaptadores LoRA para el ajuste fino. La destilacion on-policy consiste en que el modelo estudiante genera sus propias salidas y aprende de las correcciones o puntuaciones de un modelo profesor sobre esas mismas salidas, en lugar de aprender unicamente de trazas generadas por el profesor; esta tecnica suele mejorar la eficiencia del razonamiento, reduciendo tokens generados por respuesta.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La presencia de archivos mmproj (multi-modal projectors) en las cuantizaciones indica que el modelo base incorpora un componente de vision compatible con llama.cpp, aunque no se detallan sus caracteristicas.

## Capacidades

- Razonamiento paso a paso (reasoning), segun los tags reasoning y efficient-reasoning del repositorio
- Razonamiento eficiente: el entrenamiento con destilacion on-policy apunta a cadenas de pensamiento mas cortas y menos costosas
- Capacidades multimodales potenciales: los archivos mmproj-Q8_0 y mmproj-f16 indican soporte de entrada visual mediante proyectores multimodales compatibles con llama.cpp
- Formato conversacional (tag conversational)
- No hay informacion sobre soporte de tool calling, function calling ni capacidades agenticas
- No hay informacion sobre capacidades de codigo o matematicas especificas, aunque son habituales en modelos de razonamiento

## Casos de uso

- Razonamiento local en estaciones de trabajo: con la cuantizacion Q4_K_M (16,9 GB) cabe en una GPU de 24 GB como la RTX 3090 o RTX 4090, permitiendo resolver problemas de logica, matematicas o planificacion sin conexion
- Asistentes conversacionales autoalojados: el formato conversacional y el tamano de 27B lo hacen adecuado para chatbots privados donde la privacidad de los datos es critica
- Analisis de imagenes con razonamiento: mediante los archivos mmproj, se puede combinar entrada visual con razonamiento textual en llama.cpp para tareas como interpretacion de diagramas o capturas de pantalla
- Prototipado de agentes de razonamiento: su perfil de reasoning lo hace util para explorar flujos multi-paso locales, aunque no hay confirmacion de soporte nativo de tool calling
- Reduccion de costes de inferencia: la cuantizacion Q2_K (11 GB) permite ejecutar el modelo en GPUs modestas o en CPU con RAM suficiente, a cambio de perdida de calidad
- Investigacion en destilacion on-policy: al ser un ejemplo publico de esta tecnica con licencia Apache 2.0, sirve como referencia reproducible para estudios de razonamiento eficiente
- Integracion en pipelines con Ollama o LM Studio: los GGUF estaticos de mradermacher son directamente compatibles con estas herramientas

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - Q2_K: ~11 GB
  - Q3_K_M: ~13,6 GB
  - IQ4_XS: ~15,5 GB
  - Q4_K_S: ~15,9 GB
  - Q4_K_M: ~16,9 GB
  - Q5_K_M: ~19,6 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para cuants de Q2_K a Q6_K; RTX 5090 (32 GB) o A100 40 GB para Q8_0; para contextos largos, conviene anadir margen al KV cache
- Consumer GPUs: si cabe en una RTX 3090/4090 de 24 GB hasta Q6_K; en GPUs de 16 GB (RTX 4060 Ti 16GB, RTX 4080) caben las cuants hasta IQ4_XS/Q4_K_S; en GPUs de 12 GB solo Q2_K/Q3_K_S
- CPU: ejecutable con offloading parcial o completo en CPU si se dispone de 32 GB de RAM (cuants bajos) o 64 GB (Q8_0), con latencia notablemente inferior
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF; el modelo base en safetensors podria servirse con vLLM o TGI, aunque no hay confirmacion
- Latencia y throughput: no disponible

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Razonamiento | Notas |
|---|---|---|---|---|---|
| Thinklite-27B-v3 (esta ficha) | 27,32B | GGUF | Apache 2.0 | Si (destilacion on-policy) | Suplemento multimodal mmproj |
| QwQ-32B (Qwen) | 32,5B | safetensors/GGUF | Apache 2.0 | Si | Razonador denso de tamano similar, muy usado localmente |
| Gemma 3 27B (Google) | 27B | safetensors/GGUF | Gemma license | Parcial (thinking mode en variantes) | Multimodal nativo, contexto largo |
| DeepSeek-R1-Distill-Qwen-32B | 32,5B | safetensors/GGUF | MIT | Si | Destilacion de R1, referencia en razonamiento abierto |

La comparativa es orientativa: no se dispone de benchmarks que permitan contrastar rendimiento real entre estos modelos.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado solo para ingles (en); su rendimiento en castellano no esta documentado y podria ser inferior
- No hay benchmarks publicados para esta ficha, por lo que la calidad real de razonamiento no puede verificarse con datos
- Las cuantizaciones bajas (Q2_K, Q3_K_S/M) degradan apreciablemente la calidad, especialmente en tareas de razonamiento largas, donde los errores se acumulan en cadenas de pensamiento extensas
- Son cuantizaciones estaticas; las weighted/imatrix quants no estaban disponibles en el momento de publicacion y podrian ofrecer mejor calidad
- El soporte multimodal depende de los archivos mmproj y de que el runtime (llama.cpp) soporte la arquitectura concreta del proyector
- Riesgo de alucinacion: inherente a modelos de lenguaje; no hay evaluaciones publicadas que cuantifiquen este riesgo en este modelo
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base Mintzs/thinklite-27B-v3 y del modelo del que derive
- Longitud de contexto: no disponible, lo que dificulta planificar casos de uso con documentos extensos
- No hay informacion sobre tool calling ni capacidades agenticas nativas

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/thinklite-27B-v3-GGUF
- Modelo base: https://huggingface.co/Mintzs/thinklite-27B-v3
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#thinklite-27B-v3-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
- Paper, blog o demo del modelo base: no disponible
