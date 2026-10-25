# mradermacher/Thaki-CiteRank-4B-GGUF

## Resumen

Thaki-CiteRank-4B-GGUF es la versión cuantizada en formato GGUF del modelo ThakiCloud/Thaki-CiteRank-4B, publicada por mradermacher. Se trata de un reranker especializado en ranking de evidencia y atribución de citas para pipelines de generación aumentada por recuperación (RAG), según declara el autor en las etiquetas del repositorio. El modelo cuenta con 4.021.784.576 parámetros y se distribuye con licencia Apache 2.0.

Su relevancia práctica reside en que permite ejecutar un reranker de 4B parámetros en hardware de consumo gracias a las cuantizaciones disponibles, que van desde 1,8 GB (Q2_K) hasta 8,1 GB (f16). Esto facilita integrar una etapa de reordenación y filtrado de evidencia en entornos locales o sin conexión, algo poco habitual en modelos de este tamaño dedicados a ranking documental.

La ficha se basa únicamente en la información pública del repositorio GGUF y en los metadatos del modelo base. No se han publicado detalles sobre arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que esos apartados se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible |
| Parámetros totales | 4.021.784.576 |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base ThakiCloud/Thaki-CiteRank-4B. Por su función declarada como reranker y por su tamaño de 4B parámetros, es plausible que se trate de un transformer con una formulación de puntuación de pares consulta-documento, pero el repositorio no confirma si emplea una cabeza de clasificación, una formulación generativa de relevancia o una arquitectura híbrida. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF, DPO o instrucción supervisada.

La información disponible se limita a las etiquetas del repositorio: reranker, evidence-ranking, citation, rag y research-preview. Esta última indica que el modelo se publica como una vista previa de investigación, sin garantías de estabilidad para producción. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mecanismos de compresión.

## Capacidades

- Reordenación de documentos: puntúa y ordena pasajes recuperados según su relevancia respecto a una consulta, actuando como segunda etapa en pipelines de recuperación.
- Ranking de evidencia: selecciona los fragmentos que sustentan una afirmación o respuesta, orientado a tareas de verificación factual.
- Atribución de citas: asocia fragmentos de texto con fuentes concretas, útil para asistentes de investigación y generación con referencias.
- Integración en RAG: puede insertarse entre el retriever y el generador para filtrar contexto irrelevante y reducir ruido.
- Procesamiento en inglés: el modelo declara únicamente el idioma inglés en sus metadatos.
- Ejecución local: al distribuirse en GGUF, puede cargarse con herramientas compatibles sin depender de servicios en la nube.
- Capacidades de tool calling, agentes, visión, audio o modo de razonamiento extendido: no disponibles en la información proporcionada.

## Casos de uso

- Reranking en pipelines RAG: tras una búsqueda vectorial inicial, el modelo reordena los pasajes recuperados y descarta los de baja relevancia antes de enviarlos al generador, reduciendo el consumo de contexto y las alucinaciones por contexto irrelevante.
- Asistentes de revisión bibliográfica: dado un conjunto de resúmenes o fragmentos de artículos, el modelo puntúa cuáles respaldan una afirmación concreta, facilitando la selección manual posterior por parte del investigador.
- Generación aumentada con citas: en un sistema de preguntas y respuestas sobre documentación técnica, el reranker identifica los fragmentos que deben citarse y su orden de importancia, permitiendo construir respuestas con referencias verificables.
- Filtrado de resultados en motores de búsqueda internos: se puede aplicar sobre los resultados de un motor léxico o semántico para mejorar la precisión de los primeros puestos en intranets y bases de conocimiento.
- Verificación de afirmaciones en contenidos: en flujos de fact-checking, el modelo compara una afirmación con un corpus de evidencias y prioriza los documentos que la apoyan o la contradicen.
- Selección de contexto en agentes de investigación: un agente que consulta múltiples fuentes puede usar el reranker para decidir qué evidencia incorporar a su memoria de trabajo y cuál descartar.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local con cuantizaciones de 2 a 4 GB, es viable en estaciones de trabajo sin GPU dedicada de gama alta, manteniendo los documentos dentro de la infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB con Q2_K, 2,6 GB con Q4_K_M, 3,4 GB con Q6_K, 4,4 GB con Q8_0 y 8,1 GB con f16, sin contar el overhead del runtime y la memoria para el contexto.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 Ti, RTX 4090 o A100/H100 para f16 y cargas concurrentes.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores con cuantizaciones Q4_K_M o Q5_K_M; también es viable en CPU con 8-16 GB de RAM.
- Opciones de despliegue: llama.cpp y herramientas basadas en él, como Ollama o LM Studio, para los archivos GGUF; vLLM y TGI requerirían los pesos originales en safetensors del modelo base, no incluidos en este repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| Thaki-CiteRank-4B-GGUF | 4,02B | No disponible | Inglés | Apache 2.0 | Sí |
| BAAI/bge-reranker-v2-m3 | 568M | 8.192 tokens | Multilingüe | Apache 2.0 | Sí, por terceros |
| mixedbread-ai/mxbai-rerank-large-v1 | 1,5B | No disponible en esta ficha | Inglés | Apache 2.0 | Sí, por terceros |

Los datos de los modelos comparables provienen de sus fichas públicas y deben verificarse antes de su uso. No se dispone de resultados de benchmarks del modelo analizado que permitan una comparación cuantitativa de calidad. La principal diferencia de Thaki-CiteRank-4B es su tamaño de 4B parámetros, superior al de los rerankers habituales, y su orientación específica a ranking de evidencia y citas, frente a los rerankers generalistas de recuperación.

## Limitaciones y advertencias

- Estado research-preview: el autor clasifica el modelo como vista previa de investigación, sin garantías de robustez ni estabilidad para producción.
- Idiomas: solo declara soporte de inglés; su comportamiento en castellano u otros idiomas no está documentado.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, BEIR ni métricas de ranking que permitan evaluar su calidad objetiva frente a alternativas.
- Falta de transparencia: se desconocen arquitectura, datos de entrenamiento, longitud de contexto y proceso de ajuste, lo que dificulta evaluar sesgos y riesgos.
- Riesgo de sesgo: al no documentarse la composición del corpus de entrenamiento, no se puede descartar sesgo de selección hacia determinados dominios, estilos de redacción o fuentes.
- Riesgo de sobrepuntuación: como todo reranker, puede asignar relevancia alta a documentos superficialmente similares a la consulta pero factualmente incorrectos, lo que exige validación humana en flujos sensibles.
- Cuantizaciones agresivas: Q2_K y Q3_K reducen el tamaño pero degradan la calidad; para tareas de ranking conviene Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el estado de vista previa y la ausencia de garantías del autor deben tenerse en cuenta en entornos regulados.
- Compatibilidad: no se confirma que todos los runtimes de llama.cpp soporten la arquitectura del modelo base; conviene validar la carga antes de integrarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Thaki-CiteRank-4B-GGUF
- Modelo base: https://huggingface.co/ThakiCloud/Thaki-CiteRank-4B
- Página de descargas del autor: https://hf.tst.eu/model#Thaki-CiteRank-4B-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para archivos GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor: https://www.nethype.de/
