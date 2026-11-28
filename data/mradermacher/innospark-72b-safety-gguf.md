# mradermacher/Innospark-72b-safety-GGUF

## Resumen

Innospark-72b-safety-GGUF es la versión cuantizada en formato GGUF del modelo ZeroLoss-Lab/Innospark-72b-safety, un modelo de lenguaje causal de 72.706.203.648 parámetros (aproximadamente 72,7 mil millones) construido sobre la familia Qwen2.5-72B. La cuantización la ha realizado mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y su propósito es permitir la ejecución del modelo en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

El modelo base se presenta como un ajuste orientado a seguridad y alineación, con un pipeline declarado de reinforcement-learning y etiquetas que mencionan RLHF y reinforcement-learning. El nombre "safety" sugiere un entrenamiento adicional para mejorar el comportamiento seguro y el rechazo de peticiones dañinas, aunque la model card del repositorio cuantizado no aporta detalles sobre la metodología, el dataset o los objetivos concretos de dicho ajuste.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de 72B en hardware de consumo o en servidores modestos: la cuantización Q4_K_M ocupa 47,5 GB y la Q2_K baja a 29,9 GB, lo que permite su uso con GPUs de 48 GB o configuraciones multi-GPU. La licencia Apache 2.0 facilita el uso comercial, y los idiomas declarados son inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (familia Qwen2/Qwen2.5, según etiquetas del repositorio) |
| Parámetros totales | 72.706.203.648 (72,7B) |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer causal de 72,7B parámetros etiquetado como qwen2 y qwen2.5-72b, lo que indica que deriva de la arquitectura Qwen2.5-72B. El pipeline declarado es reinforcement-learning y las etiquetas incluyen rlhf y reinforcement-learning, lo que apunta a un ajuste posterior al preentrenamiento mediante técnicas de refuerzo o preferencias humanas, presumiblemente orientado a seguridad y alineación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de DPO o los detalles del proceso de RLHF en la información proporcionada.

La innovación principal de este repositorio concreto no está en la arquitectura, sino en la cadena de cuantización: mradermacher ha generado cuantizaciones estáticas (static quants) del modelo base, sin versiones ponderadas/imatrix en el momento de la publicación. El autor indica que las cuantizaciones IQ pueden ser preferibles frente a cuantizaciones no-IQ de tamaño similar, y que las versiones Q4_K_S y Q4_K_M son las recomendadas por rapidez. No se documentan técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto causal y conversacional, según la etiqueta conversational y el pipeline de reinforcement-learning.
- Razonamiento y respuesta multi-turno, propio de un modelo de 72B de la familia Qwen2.5.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del repositorio.
- Comportamiento orientado a seguridad: el nombre y el ajuste del modelo base sugieren entrenamiento para rechazar peticiones dañinas y mantener respuestas alineadas.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que facilita su integración en servicios de inferencia.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Despliegue en servidores con GPUs de 48 GB: con la cuantización Q4_K_M (47,5 GB) el modelo cabe en una única GPU de 48 GB, lo que permite servir un modelo de 72B en infraestructura de gama alta pero no de datacenter masivo.
- Ejecución en configuraciones multi-GPU de consumo: la Q2_K (29,9 GB) o la Q3_K_S (34,6 GB) permiten repartir el modelo entre dos GPUs de 24 GB (por ejemplo, dos RTX 4090) mediante llama.cpp con offloading por capas.
- Asistentes conversacionales con requisitos de seguridad: el ajuste orientado a safety del modelo base lo hace adecuado para chatbots de atención al cliente donde se prioriza evitar respuestas dañinas, siempre que se valide el comportamiento real.
- Procesamiento de texto en inglés y chino: útil para pipelines de traducción, resumen o análisis de documentos en ambos idiomas, aprovechando el soporte bilingüe declarado.
- Experimentación e investigación en alineación: al ser un modelo de 72B con ajuste RLHF y licencia Apache 2.0, sirve como base para estudios comparativos de comportamiento seguro frente a modelos no ajustados.
- Inferencia local con llama.cpp u Ollama: la disponibilidad de cuantizaciones desde Q2_K hasta Q8_0 permite elegir el equilibrio entre calidad y memoria según el hardware, con la Q4_K_S (44,0 GB) como opción rápida y recomendada.
- Evaluación de cuantizaciones: el repositorio ofrece once variantes, lo que permite medir la degradación de calidad (perplejidad) entre Q2_K y Q8_0 en tareas concretas antes de fijar una versión para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más overhead de contexto y caché KV. Q2_K: 29,9 GB; Q3_K_S: 34,6 GB; Q3_K_M: 37,8 GB; Q3_K_L: 39,6 GB; IQ4_XS: 40,3 GB; Q4_K_S: 44,0 GB; Q4_K_M: 47,5 GB; Q5_K_S: 51,5 GB; Q5_K_M: 54,5 GB; Q6_K: 64,4 GB; Q8_0: 77,4 GB.
- GPU recomendadas: A100 80 GB para Q6_K y Q8_0; A100 40 GB o L40S 48 GB para Q4_K_M; H100 80 GB para máxima calidad y contexto largo.
- GPU de consumo: una RTX 4090 (24 GB) no puede alojar el modelo completo; dos RTX 4090 (48 GB en total) permiten Q4_K_M con reparto por capas. Una RTX 3090/4090 individual solo admite configuraciones parciales con offloading a CPU/RAM.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; la etiqueta endpoints_compatible sugiere compatibilidad con APIs de inferencia estándar. No se documenta soporte específico de vLLM o TGI para GGUF en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Innospark-72b-safety-GGUF | 72,7B | no disponible | Apache 2.0 | GGUF | Ajuste de seguridad sobre Qwen2.5-72B; cuantizaciones de 29,9 a 77,4 GB |
| Qwen2.5-72B (base) | 72,7B | no disponible en esta ficha | Apache 2.0 (según familia Qwen2.5) | safetensors, GGUF | Modelo original sin el ajuste de seguridad específico |
| Llama 3.1 70B | 70B | no disponible en esta ficha | Llama 3.1 Community License | safetensors, GGUF | Alternativa de tamaño similar con licencia más restrictiva para uso comercial |

La comparación con Qwen2.5-72B es la más directa, ya que Innospark-72b-safety deriva de esa familia. No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen2.5-72B, puede heredar sesgos de los datos de preentrenamiento de esa familia.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones específicas de fidelidad factual.
- Limitaciones de idioma: solo se declaran inglés y chino; el rendimiento en castellano no está garantizado ni evaluado.
- Limitaciones de contexto: la longitud de contexto no está especificada en la información disponible, lo que impide planificar casos de uso con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base ZeroLoss-Lab/Innospark-72b-safety y de Qwen2.5-72B para confirmar la compatibilidad.
- Caveat de cuantización: las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M por rapidez. No hay cuantizaciones imatrix/ponderadas disponibles en el momento de la publicación.
- Caveat de producción: el repositorio tiene 184 descargas y 0 likes, lo que indica poca validación comunitaria; el ajuste de seguridad no está documentado con evaluaciones públicas, por lo que su eficacia real debe verificarse antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Innospark-72b-safety-GGUF
- Modelo base: https://huggingface.co/ZeroLoss-Lab/Innospark-72b-safety
- Página de descargas del autor: https://hf.tst.eu/model#Innospark-72b-safety-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
