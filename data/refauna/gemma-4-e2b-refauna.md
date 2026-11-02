# Refauna/gemma-4-e2b-refauna

## Resumen

Gemma 4 E2B · Refauna es un ajuste fino (fine-tuning) del modelo multimodal `google/gemma-4-e2b-it` desarrollado por la iniciativa brasileña Refauna, orientada a la reintroducción de fauna nativa en la Mata Atlántica de Río de Janeiro desde 2010. El modelo está especializado en responder preguntas sobre defaunación, refaunación, reintroducción de especies, dispersión de semillas e interacciones ecológicas, fundamentándose en 22 artículos científicos producidos por el propio proyecto.

El ajuste se realizó con QLoRA de 4 bits (r=16, alpha=16, 2 épocas, lr=0.0002) mediante Unsloth sobre el modelo base de Google, con un total de 942 ejemplos sintéticos en portugués de Brasil generados con estilo RAFT (contexto más citas, abstención y preguntas sin contexto). El modelo cuenta con 5.123.178.051 parámetros según los pesos en safetensors y está pensado para usarse preferentemente en configuración RAG, citando los fragmentos recuperados en formato `[n]`.

La relevancia actual radica en su enfoque de dominio muy acotado: demuestra cómo un modelo pequeño puede especializarse con datos científicos verificados y un pipeline de recuperación híbrida (embeddings `google/embeddinggemma-300m` más BM25 con fusión RRF, top-4) para ofrecer respuestas trazables en un ámbito técnico concreto, sin necesidad de infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Gemma 4 E2B |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QLoRA 4-bit para entrenamiento; GGUF Q4_K_M disponible en repo derivado |
| Idiomas soportados | Portugués de Brasil (pt), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF (repo `iamrodrigocoelho/gemma-4-e2b-refauna-GGUF`) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e2b-it`, un transformer multimodal de la familia Gemma 4 con capacidad de entrada imagen-texto. El ajuste fino se aplicó exclusivamente sobre las capas de lenguaje, manteniendo congelado el resto del modelo, mediante QLoRA de 4 bits con r=16, alpha=16, dos épocas y tasa de aprendizaje 0.0002, usando la plantilla de conversación `gemma-4` sin modo thinking.

Los datos de entrenamiento consisten en 942 ejemplos sintéticos en portugués de Brasil generados a partir de 22 artículos científicos del proyecto Refauna, con una distribución aproximada del 60% con contexto y citas, 15% de abstención y 25% sin contexto, siguiendo el estilo RAFT. Se aplicó revisión humana por muestreo y partición por documento para evitar filtración entre entrenamiento y evaluación. El entrenamiento se ejecutó en una NVIDIA L4 en 27,8 minutos, con un pico de 10,57 GB de VRAM.

## Capacidades

- Generación de texto conversacional en portugués de Brasil e inglés sobre temáticas de conservación y ecología.
- Respuesta fundamentada en contexto recuperado (RAG) con citación de fragmentos en formato `[n]`.
- Abstención explícita cuando el contexto no contiene la respuesta, evitando inventar datos, fechas o nombres de especies.
- Procesamiento de entradas imagen-texto heredado del modelo base Gemma 4 E2B.
- Razonamiento sobre interacciones ecológicas, dispersión de semillas, reintroducción de fauna y viabilidad poblacional.
- Soporte de plantilla de conversación `gemma-4` (sin modo thinking).
- No se documenta soporte explícito de tool calling ni de flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Asistente divulgativo para el proyecto Refauna: desplegado con el pipeline RAG descrito, responde a preguntas del público sobre especies reintroducidas (cutia, mono aullador, tapir, guacamayo) citando los artículos originales, lo que permite trazabilidad científica.
- Apoyo a investigadores en revisiones bibliográficas acotadas: el modelo puede resumir y relacionar hallazgos de los 22 artículos indexados, citando cada fragmento, lo que acelera la exploración inicial de literatura del proyecto.
- Herramienta educativa en aulas de biología: con la configuración RAG, genera explicaciones didácticas sobre defaunación y dispersión de semillas limitadas al corpus, reduciendo el riesgo de afirmaciones no respaldadas.
- Chatbot para portales de ONG ambientalistas: su tamaño contenido (5,1 mil millones de parámetros) permite desplegarlo en infraestructura modesta con cuantización GGUF Q4_K_M vía Ollama, manteniendo respuestas en portugués de Brasil.
- Generación de material de divulgación científica: redacta borradores de notas o guiones sobre reintroducción de fauna a partir de pasajes recuperados, siempre con citas verificables para revisión humana posterior.
- Evaluación de sistemas RAG en dominio científico: sirve como caso de estudio reproducible (métricas de corrección, fidelidad, citación y abstención) para comparar configuraciones base frente a fine-tuned con y sin recuperación.
- Soporte a la comunicación interna del proyecto: responde consultas operativas sobre protocolos de reintroducción descritos en la literatura (por ejemplo, colocación de collares de radiotelemetría) citando la fuente.

## Benchmarks y rendimiento

Evaluación publicada por el autor, con notas de 1 a 5 asignadas por un juez LLM (A = base, B = base+RAG, C = fine-tuned, D = fine-tuned+RAG):

| Configuración | Corrección | Fidelidad | Citación correcta | Abstención correcta | PT-BR |
|---|---|---|---|---|---|
| A: base | 1.12 | no disponible | no disponible | no disponible | 1.00 |
| B: base+RAG | 2.47 | 4.35 | 0.52 | 0.88 | 1.00 |
| C: fine-tuned | 2.17 | no disponible | no disponible | no disponible | 1.00 |
| D: fine-tuned+RAG | 2.29 | 4.17 | 0.52 | 0.88 | 1.00 |

Recuperación híbrida sobre el conjunto de test (n=74): Recall@4 = 0.42, MRR@20 = 0.30.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10-11 GB en precisión de 16 bits para los 5,1 mil millones de parámetros; en torno a 3-4 GB con cuantización GGUF Q4_K_M.
- GPU recomendadas: NVIDIA L4 (usada en entrenamiento con pico de 10,57 GB), A100 o H100 para despliegues de mayor throughput; RTX 4090 viable en FP16.
- Cabe en GPU de consumo: sí, con cuantización Q4_K_M en tarjetas de 6-8 GB de VRAM (RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: transformers (pipeline `text-generation`), Ollama mediante el repo GGUF `hf.co/iamrodrigocoelho/gemma-4-e2b-refauna-GGUF:Q4_K_M`; vLLM, TGI y llama.cpp no están documentados explícitamente pero son compatibles con los formatos publicados.
- Latencia y throughput: no disponibles en la información proporcionada; el tiempo de entrenamiento (27,8 minutos en L4) no es indicativo de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E2B · Refauna | 5.123.178.051 | no disponible | Dominio: refaunación y conservación Mata Atlántica (PT-BR) | Apache 2.0 | HuggingFace, GGUF vía Ollama |
| google/gemma-4-e2b-it (base) | no disponible | no disponible | Generalista multimodal | Apache 2.0 | HuggingFace |
| Modelos pequeños especializados en dominio científico | no disponible | no disponible | Variable | Variable | no disponible |

La comparación con alternativas de la misma categoría (modelos pequeños especializados en un dominio científico concreto y con soporte RAG nativo) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Uso previsto educativo y de divulgación científica; no sustituye la literatura original, que debe consultarse siempre a través de las citas.
- Sin RAG, el modelo puede errar números, fechas y nombres de especies; el propio autor lo advierte.
- El conocimiento está restringido a los 22 artículos utilizados; no cubre la totalidad del trabajo del proyecto Refauna.
- La evaluación se realizó con un juez LLM (no con anotadores humanos exhaustivos), lo que introduce sesgo potencial en las métricas reportadas.
- El Recall@4 de 0.42 en el conjunto de test indica que la recuperación falla en más de la mitad de los casos, lo que limita la fidelidad del pipeline RAG completo.
- Idiomas limitados a portugués de Brasil e inglés; no se documenta soporte para castellano ni otras lenguas.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza del corpus (artículos científicos con DOI) puede requerir revisión de derechos sobre los textos fuente en despliegues comerciales.
- Riesgo de alucinación en preguntas fuera del dominio o cuando el contexto recuperado es irrelevante, pese al entrenamiento de abstención.
- No se documentan sesgos específicos más allá de los heredados del modelo base Gemma 4 E2B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Refauna/gemma-4-e2b-refauna
- Modelo base: https://huggingface.co/google/gemma-4-e2b-it
- Repo GGUF (Ollama): https://huggingface.co/iamrodrigocoelho/gemma-4-e2b-refauna-GGUF
- Repo transformers alternativo: https://huggingface.co/iamrodrigocoelho/gemma-4-e2b-refauna
- Iniciativa Refauna: https://refauna.org.br
- Embeddings RAG: https://huggingface.co/google/embeddinggemma-300m
- Unsloth: https://huggingface.co/unsloth/gemma-4-E2B-it
- DOI artículo 2013: https://doi.org/10.1590/S1984-46702013000100015
- DOI artículo 2014 (reintroducción cutia): https://doi.org/10.1177/194008291400700415
- DOI artículo 2014 (consumo de carroña): https://doi.org/10.1590/bjb.2014.0087
- DOI artículo 2015 (palma endémica): https://doi.org/10.1590/0102-33062015abb0008
- DOI artículo 2017 (crédito de interacciones ecológicas): https://doi.org/10.1002/ece3.2746
- DOI artículo 2017 (rewilding Mata Atlántica): https://doi.org/10.1016/j.pecon.2017.09.004
- DOI artículo 2018 (crecimiento poblacional de cutia): https://doi.org/10.1017/S0030605316001149
- DOI artículo 2024 (restauración Alouatta guariba): https://doi.org/10.3389/fcosc.2024.1401749
- DOI artículo 2025 (patrones de actividad de tapires): https://doi.org/10.1017/S0030605325102494
