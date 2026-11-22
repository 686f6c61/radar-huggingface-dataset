# mradermacher/Pearl-7B-slerp-GGUF

## Resumen

Pearl-7B-slerp-GGUF es la distribución en formato GGUF del modelo Pearl-7B-slerp, un merge de modelos de la familia Mistral de 7.000 millones de parámetros creado por louisbrulenaudet mediante la técnica SLERP (spherical linear interpolation) con mergekit. Esta versión concreta la publica mradermacher, un conocido cuantizador de la comunidad de Hugging Face, que ofrece el modelo en múltiples niveles de cuantización para su uso con llama.cpp y herramientas compatibles.

El modelo está orientado principalmente a tareas de razonamiento matemático y generación de texto en inglés, según las etiquetas declaradas por el autor. Al tratarse de un merge de modelos Mistral, hereda la arquitectura transformer decoder-only clásica de esa familia, con 7.241.732.096 parámetros totales según los pesos en safetensors del modelo base.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 7B en hardware de consumo mediante cuantizaciones que van desde 2,8 GB (Q2_K) hasta 14,6 GB (f16), lo que lo hace accesible para experimentación local y prototipado sin necesidad de GPUs de datacenter.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral, según etiquetas del autor) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un merge SLERP de modelos de la familia Mistral, generado con mergekit. La técnica SLERP interpola esféricamente los pesos de dos (o más) modelos base para producir un nuevo conjunto de pesos que combina capacidades de ambos. Al no ser un modelo entrenado desde cero, no hay información pública en la model card sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La arquitectura subyacente es la de Mistral 7B: un transformer decoder-only con atención de ventana deslizante (sliding window attention) y grouped-query attention, aunque la model card proporcionada no detalla estos extremos. El autor etiqueta el modelo con "Maths" y "Mistral", lo que sugiere que el merge busca reforzar capacidades matemáticas sobre una base Mistral. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés: el modelo declara únicamente el idioma inglés en sus metadatos.
- Razonamiento matemático: la etiqueta "Maths" indica que el merge está orientado a tareas de cálculo y resolución de problemas numéricos.
- Razonamiento general y respuesta a instrucciones: heredado de los modelos Mistral que componen el merge.
- No se documenta soporte de tool calling, function calling ni modo de agente en la información disponible.
- No se documenta soporte multimodal (visión, audio) ni modo de pensamiento explícito (thinking mode).
- Capacidades multilingües: limitadas al inglés según los metadatos; no se declaran otros idiomas.

## Casos de uso

- Experimentación local con modelos de 7B: gracias a las cuantizaciones Q4_K_S (4,2 GB) y Q4_K_M (4,5 GB), el modelo se puede ejecutar en portátiles con GPU de 8 GB de VRAM o incluso en CPU con llama.cpp, lo que lo hace idóneo para pruebas de concepto sin infraestructura dedicada.
- Resolución de problemas matemáticos en local: la orientación "Maths" del merge lo hace adecuado para asistencia en cálculo, álgebra y problemas cuantitativos en entornos sin conexión o con requisitos de privacidad.
- Generación de texto y redacción en inglés: tareas de resumen, reescritura y generación de contenido en inglés donde no se requiera multilingüismo.
- Prototipado de pipelines de inferencia: sirve como modelo de pruebas para validar integraciones con llama.cpp, Ollama o servidores compatibles con la API de OpenAI antes de migrar a modelos mayores.
- Educación y tutoría en inglés: explicación de conceptos matemáticos y resolución guiada de ejercicios, con la ventaja de ejecutarse en hardware modesto.
- Investigación sobre merging de modelos: al ser un SLERP documentado y disponible en GGUF, permite estudiar el impacto de las cuantizaciones en el rendimiento de modelos fusionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: ~2,8 GB de pesos; ~3,5-4 GB de VRAM en total con contexto moderado.
  - Q4_K_M: ~4,5 GB de pesos; ~5,5-6 GB de VRAM en total.
  - Q5_K_M: ~5,2 GB de pesos; ~6-7 GB de VRAM en total.
  - Q8_0: ~7,8 GB de pesos; ~8,5-9 GB de VRAM en total.
  - f16: ~14,6 GB de pesos; requiere ~16 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para las cuantizaciones altas; A100 o H100 no son necesarias para un 7B, pero permiten mayor throughput.
- Cabe en GPU de consumo: sí, desde una GTX 1660 6 GB (con Q4_K_S) hasta una RTX 4090 (con f16). Las cuantizaciones Q4_K_S y Q4_K_M son las recomendadas por el autor por su equilibrio velocidad/calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI (endpoints_compatible según los tags). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Pearl-7B-slerp-GGUF | 7,24B | no disponible | Apache 2.0 | GGUF | Merge SLERP orientado a matemáticas |
| Mistral-7B-Instruct-v0.2 (GGUF) | 7,24B | 32K (según model card oficial) | Apache 2.0 | GGUF | Modelo base de referencia, ampliamente cuantizado |
| Zephyr-7B-beta (GGUF) | 7,24B | 32K | MIT | GGUF | Fine-tune con DPO sobre Mistral, muy popular en la comunidad |
| OpenHermes-2.5-Mistral-7B (GGUF) | 7,24B | 32K | Apache 2.0 | GGUF | Fine-tune orientado a instrucciones y conversación |

La comparativa se basa en la familia Mistral 7B, de la que Pearl-7B-slerp hereda arquitectura y tamaño. No hay datos de benchmarks que permitan comparar rendimiento real entre estos modelos en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al derivar de Mistral, es probable que herede sesgos presentes en los datos de entrenamiento originales, pero no hay información específica.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 7B; no se han publicado evaluaciones de fidelidad factual para este merge.
- Limitaciones de contexto e idioma: solo se declara inglés; no se especifica la longitud de contexto, lo que impide garantizar ventanas largas. El uso en castellano no está soportado oficialmente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los modelos que componen el merge (Mistral 7B es Apache 2.0), ya que un merge puede heredar obligaciones de sus componentes.
- Caveat para producción: al ser un merge no validado con benchmarks públicos, no se recomienda su uso en producción sin una evaluación propia en la tarea objetivo. La cuantización Q2_K y Q3_K_M pueden degradar notablemente la calidad.
- El repositorio tiene solo 103 descargas y 1 like, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Pearl-7B-slerp-GGUF
- Modelo base: https://huggingface.co/louisbrulenaudet/Pearl-7B-slerp
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Pearl-7B-slerp-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Pearl-7B-slerp-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- mergekit: no disponible en la información proporcionada
