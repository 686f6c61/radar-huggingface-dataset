# mradermacher/Qwen3.8-27B-Kimiko-2-BF16-GGUF

## Resumen

Qwen3.8-27B-Kimiko-2-BF16-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo AMAImedia/Qwen3.8-27B-Kimiko-2-BF16, un merge de modelos de la familia Qwen 3 (etiquetado por el autor como qwen3_5, qwen3_6 y qwen3_8) construido con mergekit. El trabajo de cuantización lo firma mradermacher, un publicador habitual de GGUF derivados de modelos abiertos, que en este caso ofrece el modelo en BF16 junto con una matriz de cuantizaciones desde Q2_K hasta Q8_0, además de dos ficheros mmproj para el componente multimodal.

El modelo base cuenta con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), lo que lo sitúa en la franja de modelos densos de gran tamaño ejecutables en hardware de consumo con cuantizaciones agresivas, y en GPUs profesionales con cuantizaciones de mayor calidad. El repositorio ocupa 187,9 GB, coherente con la suma de todas las variantes publicadas, y la model card declara únicamente el idioma inglés.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa práctica para desplegar un modelo de ~27B en local mediante llama.cpp u Ollama sin necesidad de infraestructura de centro de datos; por otro, advierte de que se trata de un merge de procedencia comunitaria, sin licencia declarada en el repositorio, sin benchmarks publicados y sin model card técnica detallada, lo que exige cautela antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como qwen3_5/qwen3_6/qwen3_8; merge con mergekit) |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16/BF16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors/BF16 |
| Tamaño del repositorio | 187,9 GB |
| Modelo base | AMAImedia/Qwen3.8-27B-Kimiko-2-BF16 |
| Librería declarada | transformers |
| Descargas / likes | 707 / 0 |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura interna del modelo base en la documentación proporcionada. Los tags del repositorio indican que se trata de un merge construido con mergekit a partir de modelos de la familia Qwen 3 (referidos como qwen3_5, qwen3_6 y qwen3_8), y el nombre del modelo base conserva el sufijo BF16, lo que sugiere que el autor publicó los pesos en precisión bfloat16 antes de la cuantización. No se detalla la receta de merge (tipo de combinación, pesos por capa ni modelo de tokenizador adoptado).

Tampoco hay información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo etapas de ajuste fino supervisado, RLHF o DPO. La presencia de ficheros mmproj en el repositorio de cuantizaciones indica que el modelo base incorpora un componente multimodal (proyección de visión), aunque no se especifica qué codificador visual utiliza ni qué resolución de imagen admite.

En el plano de la cuantización, mradermacher publica cuantizaciones estáticas (no imatrix) en este repositorio, y remite a un repositorio hermano (Qwen3.8-27B-Kimiko-2-BF16-i1-GGUF) para las variantes ponderadas con imatrix, que suelen ofrecer mejor relación calidad/tamaño en bits bajos. No se documenta ningún mecanismo especial de decodificación especulativa, atención lineal ni técnicas híbridas SSM.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el pipeline declarado apuntan a un uso principal como modelo de chat multi-turno.
- Procesamiento multimodal: la presencia de ficheros mmproj (Q8_0 y f16) confirma soporte de entrada de imágenes en el modelo base, aunque no se detallan las capacidades exactas de visión.
- Razonamiento y código: no disponible; no hay documentación que confirme capacidades específicas en matemáticas, código o razonamiento de varios pasos.
- Tool calling / function calling: no disponible; no se documenta soporte explícito.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card; no se declara soporte de castellano ni de otros idiomas.
- Modo thinking o razonamiento extendido: no disponible.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse mediante infraestructura compatible con la API de Hugging Face.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede desplegarse con llama.cpp u Ollama en una estación de trabajo con una única GPU de 24 GB usando Q4_K_M (16,6 GB), lo que permite conversaciones multi-turno sin depender de servicios en la nube.
- Procesamiento de documentos con imágenes: gracias a los ficheros mmproj, puede emplearse para tareas de descripción de imágenes o extracción de información visual en pipelines internos, siempre que se valide la calidad real del componente multimodal.
- Prototipado de agentes y evaluación de merges: resulta útil como banco de pruebas para comparar el comportamiento de un merge comunitario frente al modelo Qwen original, antes de decidir si merece la pena integrarlo en un producto.
- Generación de texto creativo y redacción en inglés: con Q6_K (22,2 GB) o Q8_0 (28,7 GB) en GPUs de 32-48 GB se obtiene la máxima calidad disponible en este repositorio para tareas de redacción.
- Inferencia en entornos con VRAM limitada: las variantes Q2_K (10,8 GB) y Q3_K_S (12,2 GB) permiten ejecutar el modelo en GPUs de 12-16 GB, a costa de una pérdida de calidad que debe medirse empíricamente.
- Investigación sobre cuantización: la disponibilidad de doce variantes de cuantización en un mismo repositorio facilita estudios comparativos de perplejidad y calidad entre esquemas K-quant e IQ.
- Despliegue en servidores sin GPU dedicada: las cuantizaciones bajas permiten inferencia en CPU con llama.cpp, útil para pruebas de integración o demos de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~10,8 GB; Q3_K_S ~12,2 GB; Q3_K_M ~13,4 GB; Q3_K_L ~14,4 GB; IQ4_XS ~15,3 GB; Q4_K_S ~15,7 GB; Q4_K_M ~16,6 GB; Q5_K_S ~18,8 GB; Q5_K_M ~19,3 GB; Q6_K ~22,2 GB; Q8_0 ~28,7 GB. Hay que añadir el espacio para el contexto KV cache, que crece con la longitud de contexto y no está documentado.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) en las mismas variantes; A100 40/80 GB o H100 para Q8_0 y para contextos largos; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4060 Ti 16 GB) para Q2_K y Q3_K_S.
- ¿Cabe en GPU de consumo? Sí: las variantes Q2_K a Q4_K_M caben en GPUs de 12-24 GB, y Q8_0 requiere 32 GB o más (RTX 5090, A6000, A100).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, aunque no se documenta compatibilidad verificada.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Kimiko-2-BF16-GGUF (este) | ~26,9B | no disponible | no disponible | GGUF | Merge comunitario, solo inglés, sin benchmarks |
| Qwen2.5-32B-Instruct (referencia de la familia Qwen) | ~32,8B | 32.768 tokens (ampliable) | Apache 2.0 (según versión) | safetensors, GGUF | Modelo oficial con benchmarks publicados y licencia clara |
| Gemma 2 27B | ~27B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Tamaño comparable, licencia con restricciones de uso |
| Mistral Small 24B | ~24B | 32.768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamaño similar con soporte multilingüe |

La comparación debe tomarse con cautela: los datos de los modelos alternativos corresponden a sus versiones oficiales y no se han verificado contra la información de este repositorio, que no publica contexto ni licencia.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar si el uso comercial está permitido. Es un bloqueante para producción hasta aclararlo con el autor.
- Procedencia del merge: al ser un merge comunitario de modelos Qwen, hereda las obligaciones de las licencias de los modelos originales, que no se detallan.
- Idiomas: la model card solo declara inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Sin benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni de perplejidad, por lo que la calidad real del merge es desconocida y debe evaluarse internamente.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; sin datos de evaluación no puede acotarse.
- Sesgos: no documentados; al desconocerse la composición del dataset de los modelos base, no pueden evaluarse sesgos específicos.
- Contexto desconocido: la longitud de contexto no está publicada, lo que complica el dimensionamiento de la KV cache y el diseño de aplicaciones con documentos largos.
- Cuantizaciones estáticas: este repositorio no incluye variantes imatrix; para bits bajos (Q2, Q3) las versiones i1 del repositorio hermano pueden ofrecer mejor calidad.
- Componente multimodal sin documentar: se desconoce qué codificador visual usa y qué tareas de visión soporta con garantías.
- Fecha de creación futura (2026-08-27) y escaso respaldo comunitario (0 likes, 707 descargas): señales de un modelo poco validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Kimiko-2-BF16-GGUF
- Modelo base: https://huggingface.co/AMAImedia/Qwen3.8-27B-Kimiko-2-BF16
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Kimiko-2-BF16-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Kimiko-2-BF16-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
