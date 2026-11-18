# mradermacher/Smaug-Political-Uncensored-GGUF

## Resumen

Smaug-Political-Uncensored-GGUF es la versión cuantizada en formato GGUF del modelo abacusai/Smaug-Political-Uncensored, publicada por el usuario mradermacher. El modelo base, desarrollado por Abacus.AI, es un transformer denso de aproximadamente 27.300 millones de parámetros (27,3B), afinado mediante DPO (Direct Preference Optimization) y orientado a conversaciones de temática política con un sesgo explícito hacia la ausencia de censura. Esta versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados, algo inviable con los pesos originales en precisión completa.

La relevancia de esta publicación radica en que traslada un modelo de 27B a un rango de cuantizaciones que van desde Q2_K (11 GB) hasta Q8_0 (29,1 GB), además de incluir suplementos multimodales (mmproj) que sugieren capacidades de visión heredadas del modelo base. El repositorio tiene un tamaño total de 155,8 GB, lo que refleja la inclusión de múltiples variantes de cuantización y los ficheros mmproj.

No se dispone de información sobre el pipeline de la tarea ni de resultados de benchmarks publicados en la información proporcionada. La licencia Apache 2.0 del modelo base se mantiene en esta redistribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica variante concreta en la información disponible) |
| Parámetros totales | 27.320.697.856 (27,3B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27,3B parámetros afinado por Abacus.AI mediante DPO, según indican las etiquetas del repositorio (`dpo`, `smaug`, `abacusai`). La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni la arquitectura exacta (número de capas, dimensiones de atención, tipo de activación). La presencia de ficheros `mmproj` en el repositorio de cuantizaciones sugiere que el modelo base incorpora un proyector multimodal, lo que implicaría capacidades de visión, aunque la model card no lo confirma explícitamente.

La cuantización ha sido realizada por mradermacher con el conversor `convert_type: hf` y `output_tensor_quantised: 1`, generando cuantizaciones estáticas. El autor indica que las cuantizaciones ponderadas por imatrix no estaban disponibles en el momento de la publicación. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` en el repositorio.
- Capacidad declarada de uso agéntico (`agentic`), aunque sin detalles técnicos sobre tool calling o function calling en la información disponible.
- Afinado político sin censura: el modelo está diseñado para responder a preguntas de temática política sin los filtros habituales de alineamiento.
- Soporte multilingüe limitado a inglés (en) y chino (zh) según la model card.
- Posible soporte multimodal (visión) inferido de la presencia de ficheros `mmproj`, no confirmado en la documentación.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue mediante APIs compatibles con OpenAI.

## Casos de uso

- Análisis de discurso político: el modelo puede generar y analizar textos sobre temas políticos sin las restricciones de contenido típicas de modelos alineados, útil para investigación en ciencias políticas y estudios de sesgo.
- Simulación de debates: gracias a su capacidad conversacional y a la ausencia de censura temática, permite construir simulaciones de discusiones políticas con posturas diversas.
- Investigación sobre alineamiento y censura: sirve como caso de estudio para comparar el comportamiento de modelos con y sin filtros de contenido en dominios sensibles.
- Generación de contenido editorial: para medios o proyectos que requieran textos de opinión política sin restricciones de moderación automática, siempre con supervisión humana.
- Despliegue en local con llama.cpp: las cuantizaciones Q4_K_S (15,9 GB) permiten ejecutar el modelo en una GPU de consumo de 24 GB (RTX 3090/4090) o en configuraciones con offloading a CPU.
- Prototipado de asistentes conversacionales bilingües inglés-chino: el soporte de ambos idiomas permite construir asistentes para mercados que requieran esas dos lenguas.
- Evaluación de cuantizaciones: la disponibilidad de múltiples variantes (Q2_K a Q8_0) permite estudiar la degradación de calidad según el nivel de compresión en un modelo de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~11 GB, Q4_K_S ~15,9 GB, Q8_0 ~29,1 GB (tamaños de fichero; la VRAM necesaria es algo superior por el contexto y los buffers de llama.cpp).
- GPU recomendadas: para Q4_K_S, una RTX 3090 o RTX 4090 (24 GB) es suficiente; para Q8_0 se requiere una A100 40 GB, H100 o dos GPU de 24 GB.
- Cabe en GPU de consumo: sí, en Q2_K y Q4_K_S con GPU de 16-24 GB; Q8_0 requiere hardware profesional o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama (mediante importación del GGUF), y servidores compatibles con la API de llama.cpp; el modelo base es compatible con transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Smaug-Political-Uncensored (este) | 27,3B | no disponible | Apache 2.0 | GGUF, safetensors | Afinado DPO, sin censura política, en/zh |
| Modelos de ~27-30B de la familia Llama/Mistral | ~27-34B | variable | variable | GGUF, safetensors | No se dispone de datos comparativos concretos en la información proporcionada |
| Alternativas sin censura de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de información verificable |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- El modelo está explícitamente desafinado en censura política: puede generar contenido ofensivo, sesgado o desinformativo en temas políticos. Requiere supervisión humana en cualquier uso en producción.
- Riesgo elevado de alucinación en temas de actualidad política, dado que no se documenta la fecha de corte de los datos de entrenamiento.
- Soporte lingüístico limitado a inglés y chino; no se garantiza un rendimiento adecuado en castellano.
- No se dispone de información sobre la longitud de contexto, lo que impide planificar usos con documentos largos.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma notable; se recomienda Q4_K_S o superior para uso serio.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin censura en dominios políticos conlleva riesgos reputacionales y legales según la jurisdicción; se recomienda revisión legal.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- No hay cuantizaciones ponderadas por imatrix disponibles, lo que puede afectar a la calidad relativa de las cuantizaciones pequeñas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Smaug-Political-Uncensored-GGUF
- Modelo base: https://huggingface.co/abacusai/Smaug-Political-Uncensored
- Página de descargas del autor: https://hf.tst.eu/model#Smaug-Political-Uncensored-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
