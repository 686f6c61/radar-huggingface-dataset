# mradermacher/TISD-Qwen3-14B-GGUF

## Resumen

TISD-Qwen3-14B-GGUF es la distribucion en formato GGUF del modelo Taeckyung/TISD-Qwen3-14B, una especializacion del modelo base Qwen3-14B de Alibaba mediante tecnicas de self-distillation (TISD), orientada especificamente a generacion de codigo. La cuantizacion la firma mradermacher, un conocido publicador de versiones GGUF de la comunidad, y esta pensada para su uso con llama.cpp y entornos de inferencia local.

El modelo cuenta con 14.768.307.200 parametros (aproximadamente 14,8 mil millones) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las propias de dicha licencia. El repositorio ocupa 102 GB e incluye once variantes de cuantizacion que van desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB), cubriendo el espectro de calidad y requisitos de memoria habituales.

Su relevancia radica en que combina un modelo base moderno de la familia Qwen3 con un ajuste especifico para tareas de programacion, empaquetado en un formato que permite ejecucion en hardware de consumo. Es una opcion practica para desarrolladores que necesitan un asistente de codigo local sin depender de APIs externas, aunque el modelo solo declara soporte para ingles y no publica resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-14B; detalles no disponibles) |
| Parametros totales | 14.768.307.200 (14,8 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Se sabe que deriva de Qwen3-14B, un transformer decoder-only de aproximadamente 14,8 mil millones de parametros, y que ha sido sometido a un proceso de self-distillation (TISD) por parte de Taeckyung. El dataset declarado en la model card es `livecodebench/code_generation_lite`, lo que indica que el ajuste se ha orientado a generacion de codigo evaluada con LiveCodeBench.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La cuantizacion realizada por mradermacher es de tipo estatico (no se ofrecen, segun la model card, cuantizaciones ponderadas o con imatrix en el momento de la publicacion), con `output_tensor_quantised: 1` y `convert_type: hf`.

## Capacidades

- Generacion de codigo: el ajuste sobre LiveCodeBench sugiere un enfoque en tareas de programacion y resolucion de problemas de codigo.
- Razonamiento y generacion de texto general, heredados del modelo base Qwen3-14B.
- Conversacion multi-turno (etiqueta `conversational` en los metadatos).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma explicita en la informacion.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de programacion local: el modelo puede emplearse con llama.cpp u Ollama para autocompletar y generar funciones en un entorno de desarrollo sin conexion, aprovechando su ajuste especifico en codigo y su tamano contenido (8,7-9,1 GB en Q4_K).
- Revision de codigo automatizada: integrado en un pipeline de CI, puede analizar diffs y sugerir correcciones en ingles, con la ventaja de que la licencia Apache 2.0 permite su uso comercial interno.
- Generacion de tests unitarios: dado un fragmento de codigo, el modelo puede producir casos de prueba, una tarea alineada con el entrenamiento sobre LiveCodeBench.
- Chatbot tecnico de documentacion: con su etiqueta `conversational`, puede gestionar conversaciones multi-turno sobre APIs y librerias, siempre que la ventana de contexto (no documentada) sea suficiente.
- Prototipado rapido en estaciones de trabajo: las cuantizaciones Q4_K_S y Q4_K_M, marcadas como "fast, recommended", permiten ejecutar el modelo en GPUs de consumo de 12-16 GB de VRAM.
- Educacion y formacion en programacion: el modelo puede explicar conceptos y resolver ejercicios en ingles, desplegado en servidores modestos gracias a las variantes Q2_K y Q3_K.
- Inferencia en entornos con recursos limitados: la variante Q2_K (5,9 GB) permite ejecucion en GPUs de 8 GB, aunque con perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni LiveCodeBench, a pesar de que este ultimo es el dataset de entrenamiento declarado.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion): Q2_K ~6 GB; Q3_K_S ~7 GB; Q3_K_M ~7,5 GB; Q3_K_L ~8 GB; IQ4_XS ~8,5 GB; Q4_K_S ~9 GB; Q4_K_M ~9,5 GB; Q5_K_S ~10,5 GB; Q5_K_M ~11 GB; Q6_K ~12,5 GB; Q8_0 ~16 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K y Q5_K; RTX 4090 24 GB para Q6_K y Q8_0; A100 40/80 GB o H100 para despliegues concurrentes con contexto largo.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM para las cuantizaciones bajas, y en 12-16 GB para las recomendadas (Q4_K_S, Q4_K_M).
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TISD-Qwen3-14B-GGUF | 14,8 B | no disponible | Apache 2.0 | GGUF | Ajustado a codigo con LiveCodeBench |
| Qwen3-14B (base) | 14,8 B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista del que deriva |
| Qwen2.5-Coder-14B | 14,8 B | 128 K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Alternativa especifica de codigo de la generacion anterior |

La comparacion con Qwen2.5-Coder-14B se ofrece como referencia de categoria; no se dispone de datos de rendimiento del modelo TISD para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo declara soporte de ingles; el rendimiento en castellano no esta garantizado ni documentado.
- No se publican benchmarks, por lo que el rendimiento real en tareas de codigo no puede verificarse con datos del autor.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en APIs y librerias poco comunes.
- La longitud de contexto no esta documentada, lo que dificulta planificar su uso en tareas de contexto largo.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; la propia model card marca Q3_K_M como "lower quality".
- No hay cuantizaciones ponderadas ni con imatrix disponibles en el momento de la publicacion, segun indica el autor.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribucion correspondientes.
- El proceso de self-distillation (TISD) no esta documentado en la informacion disponible, lo que impide evaluar posibles sesgos introducidos en el ajuste.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/TISD-Qwen3-14B-GGUF
- Modelo base: https://huggingface.co/Taeckyung/TISD-Qwen3-14B
- Pagina de overview del autor de las cuantizaciones: https://hf.tst.eu/model#TISD-Qwen3-14B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
