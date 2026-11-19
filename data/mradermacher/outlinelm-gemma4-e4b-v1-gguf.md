# mradermacher/OutlineLM-Gemma4-E4B-v1-GGUF

## Resumen
OutlineLM-Gemma4-E4B-v1-GGUF es la distribucion en formato GGUF del modelo OutlineLM-Gemma4-E4B-v1, publicado por el usuario mradermacher a partir del modelo original de DiTy. Se trata de una cuantizacion estatica del checkpoint base, pensada para su uso con llama.cpp y herramientas derivadas (Ollama, LM Studio, llama-cpp-python) en lugar de con transformers puro. El modelo base declara 7.518.069.290 parametros totales segun los pesos en safetensors, y se apoya en la familia Gemma 4 con una variante etiquetada como E4B.

La relevancia de esta ficha es practica: el repositorio original en transformers requiere hardware de gama alta para inferencia en precision completa, mientras que esta version ofrece cuantizaciones desde Q2_K (4,5 GB) hasta f16 (15,2 GB), lo que permite desplegar el modelo en GPU de consumo. Los idiomas declarados son ingles y ruso, y la licencia es Apache 2.0, lo que facilita su integracion en productos comerciales sin las restricciones de la licencia Gemma original.

No se dispone de informacion publica sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks en la documentacion proporcionada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicacion reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4 (detalle exacto no disponible) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q6_K, f16 (cuantizaciones estaticas; no hay imatrix) |
| Idiomas soportados | en, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo original en safetensors/transformers) |

## Arquitectura y entrenamiento
El modelo base pertenece a la familia Gemma 4, una arquitectura transformer decoder-only. El sufijo E4B del nombre sugiere una variante de eficiencia o un tamano intermedio dentro de la familia, pero la model card no detalla la configuracion de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. El recuento de parametros (7,5 mil millones) es coherente con un modelo denso de clase 7B-8B.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO o tecnicas de alineacion. El autor de la cuantizacion indica que se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y que no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicacion. El proceso de cuantizacion se realizo con llama.cpp a partir del checkpoint en formato Hugging Face.

## Capacidades
- Generacion de texto conversacional en ingles y ruso, segun los idiomas declarados en la model card.
- El tag `conversational` en Hugging Face indica que el modelo esta orientado a dialogos multi-turno.
- No se documentan capacidades de vision, audio, tool calling, function calling ni agentes en la informacion disponible.
- No se documenta un modo de razonamiento explicito (thinking mode) ni capacidades matematicas o de codigo especificas.
- Compatible con endpoints (`endpoints_compatible`), lo que sugiere uso via API de inferencia.
- Al ser una cuantizacion GGUF, hereda las capacidades del modelo base sin modificaciones, pero no se detallan mas alla de lo indicado.

## Casos de uso
- Asistente conversacional en ruso e ingles: el modelo puede gestionar dialogos multi-turno en estos dos idiomas, y la cuantizacion Q4_K_S (5,3 GB) permite desplegarlo en una GPU de consumo para prototipos de atencion al cliente o asistentes internos.
- Despliegue en hardware limitado: con Q2_K (4,5 GB) cabe en GPU con 6-8 GB de VRAM, lo que facilita pruebas en portatiles con RTX 3060 o similares.
- Inferencia local con llama.cpp u Ollama: al estar en GGUF, se integra directamente en flujos de trabajo de escritorio sin necesidad de Python ni CUDA avanzado.
- Prototipado rapido de aplicaciones en ruso: dado que la mayoria de modelos abiertos de 7B estan centrados en ingles, esta variante cubre un hueco para productos dirigidos al mercado rusoparlante.
- Generacion de texto general en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial sin las restricciones de la licencia Gemma original.
- Experimentacion academica con modelos de 7B: el rango de cuantizaciones (de Q2_K a f16) permite estudiar el impacto de la cuantizacion en la calidad de salida con un mismo checkpoint.
- Integracion en pipelines de CI/CD para pruebas de regresion de prompts: la version Q4_K_S ofrece un equilibrio razonable entre velocidad y calidad para ejecutar suites de evaluacion automatizadas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia segun cuantizacion: Q2_K ~4,5 GB, Q3_K_S ~4,8 GB, Q3_K_M ~5,0 GB, Q4_K_S ~5,3 GB, Q6_K ~6,3 GB, f16 ~15,2 GB. A estas cifras hay que anadir el espacio para el contexto KV cache, que depende de la longitud de contexto no documentada.
- GPU recomendadas: para f16 se necesita una GPU con al menos 16-24 GB (RTX 4090, A100 40GB, H100). Para Q4_K_S y Q6_K basta con 8-12 GB (RTX 3060 12GB, RTX 4070, RTX 4080).
- Cabe en GPU de consumo: si, en Q2_K, Q3_K y Q4_K_S en tarjetas de 6-8 GB; Q6_K en tarjetas de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantizacion elegida; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OutlineLM-Gemma4-E4B-v1-GGUF (este) | 7,52B | no disponible | en, ru | Apache 2.0 | GGUF |
| Mistral-7B-Instruct (referencia) | 7,24B | 32k (v0.2) | en, fr, de, es, it | Apache 2.0 | safetensors, GGUF |
| Llama 3.1 8B Instruct (referencia) | 8,03B | 128k | multilingue (8 idiomas) | Llama 3.1 Community | safetensors, GGUF |
| Qwen2.5 7B Instruct (referencia) | 7,62B | 128k | multilingue (29 idiomas) | Apache 2.0 | safetensors, GGUF |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que no se puede establecer una comparacion cuantitativa con las alternativas. La principal diferencia es el soporte declarado de ruso frente a modelos centrados en ingles, y la licencia Apache 2.0 frente a la licencia comunitaria de Llama.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados. Al ser un modelo derivado de Gemma 4, puede heredar sesgos del modelo base, pero no hay informacion al respecto.
- Riesgo de alucinacion: no evaluado. No hay benchmarks ni evaluaciones de fidelidad publicadas.
- Limitaciones de contexto e idioma: solo se declaran ingles y ruso; no hay informacion sobre la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base (DiTy/OutlineLM-Gemma4-E4B-v1) mantiene la misma licencia y que la cuantizacion no anade restricciones adicionales.
- Caveat de produccion: el repositorio tiene 0 descargas y 0 likes, sin validacion comunitaria; no se recomienda su uso en produccion sin una evaluacion propia previa.
- Las cuantizaciones Q2_K y Q3_K_S pueden degradar notablemente la calidad; el autor recomienda Q4_K_S como opcion rapida y Q6_K como opcion de alta calidad.
- No hay cuantizaciones imatrix disponibles, que suelen ofrecer mejor relacion calidad/tamano que las estaticas equivalentes.
- El tag `skip_mmproj: 1` indica que no se incluye el proyector multimodal; si el modelo base tuviera capacidades de vision, no estarian disponibles en esta cuantizacion.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/OutlineLM-Gemma4-E4B-v1-GGUF
- Modelo base: https://huggingface.co/DiTy/OutlineLM-Gemma4-E4B-v1
- Pagina de resumen del autor: https://hf.tst.eu/model#OutlineLM-Gemma4-E4B-v1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
