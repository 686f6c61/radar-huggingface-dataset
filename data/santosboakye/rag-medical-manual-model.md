# santosboakye/rag-medical-manual-model

## Resumen

`santosboakye/rag-medical-manual-model` no es un modelo entrenado desde cero, sino un repositorio que empaqueta una aplicación de generación aumentada por recuperación (RAG) orientada a un manual de diagnóstico médico. La pila combina tres componentes: el LLM `Mistral-7B-Instruct-v0.2-GGUF` (concretamente el archivo `mistral-7b-instruct-v0.2.Q6_K.gguf`), un modelo de embeddings `thenlper/gte-large` y una base de datos vectorial Chroma construida a partir de fragmentos de dicho manual (`chroma_db_medical.zip`). La orquestación se realiza con LangChain.

El dato de "parámetros totales" reportado (7.241.732.096, es decir, unos 7,24 mil millones) corresponde al LLM base Mistral 7B, no a un modelo nuevo del autor. El repositorio pesa 6,0 GB y está etiquetado como `langchain`, `gguf`, `endpoints_compatible`, `conversational`. No declara licencia, idiomas ni pipeline, y en la fecha de la información disponible acumula 0 descargas y 0 valoraciones.

Su relevancia es la de un ejemplo reproducible de patrón RAG vertical (dominio médico) construido con piezas estándar del ecosistema: un modelo instruct cuantizado en GGUF, un retriever denso y un almacén vectorial persistente. Sirve como plantilla didáctica más que como artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline RAG; el generador es un transformer decoder-only (Mistral 7B) con atención de ventana deslizante (SWA) y grouped-query attention (GQA) |
| Parametros totales | 7.241.732.096 (≈7,24 B), correspondientes al LLM Mistral-7B-Instruct-v0.2 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens en Mistral-7B-Instruct-v0.2 (ventana de atención efectiva de 4096 tokens) |
| Tipos de cuantizacion | Q6_K en formato GGUF para el LLM; el modelo base ofrece Q2_K a Q8_0 |
| Idiomas soportados | No declarado por el autor; el LLM base Mistral 7B está orientado principalmente al inglés |
| Licencia | No declarada para el repositorio; el LLM base Mistral-7B-Instruct-v0.2 se distribuye bajo Apache 2.0 |
| Formato de pesos | GGUF (LLM, Q6_K); safetensors (modelo de embeddings gte-large); Chroma DB en ZIP |
| Modelo de embeddings | thenlper/gte-large (Sentence Transformers) |
| Almacen vectorial | Chroma DB (chroma_db_medical.zip) |
| Tamano del repositorio | 6,0 GB |
| Framework de orquestacion | LangChain |

## Arquitectura y entrenamiento

El repositorio no documenta ningún entrenamiento ni ajuste fino. Se trata de una canalización RAG en la que el modelo generativo no incorpora conocimiento médico propio: la información del manual se recupera en tiempo de inferencia. La arquitectura de la pila es la clásica de tres etapas: (1) indexación del manual en fragmentos con `thenlper/gte-large`, que produce embeddings densos; (2) almacenamiento y búsqueda por similitud en Chroma DB; y (3) generación condicionada por el contexto recuperado mediante `Mistral-7B-Instruct-v0.2` en su cuantización Q6_K.

El componente generativo, Mistral 7B, es un transformer decoder-only de 7,24 B parámetros con atención de ventana deslizante de 4096 tokens (que permite manejar secuencias de 8192 tokens) y GQA para reducir el coste de la caché KV. Mistral-7B-Instruct-v0.2 es la variante afinada por instrucciones del modelo base. No hay en la información disponible detalles sobre número de tokens de entrenamiento, composición del dataset, ni uso de RLHF/DPO más allá de lo propio del modelo original de Mistral AI.

La única innovación técnica destacable del repositorio es de ensamblaje, no de modelado: la combinación de un LLM cuantizado en GGUF con un retriever denso y un vector store persistido, ejecutable en hardware modesto mediante `llama_cpp.Llama` y LangChain.

## Capacidades

- Generación de texto conversacional en formato instrucción, heredada de Mistral-7B-Instruct-v0.2.
- Respuesta a preguntas sobre el contenido del manual médico indexado, con recuperación de fragmentos relevantes.
- Recuperación semántica de documentos mediante embeddings densos de `gte-large`.
- Persistencia del índice vectorial (Chroma DB) para reutilización sin reindexar.
- Integración con el ecosistema LangChain (cadenas RAG, retrievers, memoria conversacional).
- Compatibilidad con endpoints del tipo OpenAI/`endpoints_compatible` y con el runtime `llama.cpp`.
- No se declara soporte explícito de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües: no declaradas; el LLM base está orientado al inglés.

## Casos de uso

- Asistente de consulta de manuales técnicos: el sistema recupera los fragmentos del manual de diagnóstico más similares a la pregunta y los inyecta como contexto para que Mistral genere una respuesta fundamentada, reduciendo la dependencia de conocimiento paramétrico.
- Base para un prototipo de triaje documental: dado un conjunto de síntomas descritos en texto, recuperar secciones del manual y devolver las entradas correspondientes para revisión humana posterior.
- Plantilla didáctica de RAG: sirve para demostrar el ciclo completo indexación-recuperación-generación en cursos y talleres, sustituyendo el manual por otro corpus.
- Búsqueda semántica sobre documentación interna: reutilizar `gte-large` + Chroma para localizar pasajes por significado en lugar de por palabra clave.
- Evaluación comparativa de cuantizaciones: al ser un GGUF Q6_K, permite medir el equilibrio calidad/VRAM frente a Q4_K_M o Q8_0 en el mismo prompt.
- Despliegue local con privacidad de datos: al ejecutarse con `llama.cpp` en hardware propio, el corpus y las consultas no salen del entorno, algo crítico con material clínico.
- Generación de borradores de resúmenes clínicos: condensar varios fragmentos recuperados en un resumen; requiere siempre validación por personal cualificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación de recuperación (recall@k, MRR) ni de calidad de generación (fidelidad, groundedness), y tampoco declara datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para el LLM Q6_K: en torno a 6-7 GB de pesos, más la caché KV y el contexto; se recomienda disponer de 8-10 GB de VRAM para una ventana de contexto amplia.
- Cuantizaciones más ligeras del mismo modelo (Q4_K_M, ~4,4 GB) permiten bajar a GPUs de 6-8 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 para uso de escritorio; A100/H100 solo si se escala a lotes grandes o a variantes mayores.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM con Q4/Q5; con Q6_K conviene apuntar a 10-12 GB para trabajar con contexto holgado.
- Ejecución en CPU: viable mediante `llama.cpp`, con latencia notablemente mayor que en GPU.
- Despliegue: `llama.cpp` / `llama-cpp-python`, Ollama, LangChain, Chroma; `endpoints_compatible` sugiere exposición mediante una API compatible con OpenAI. El soporte de vLLM y TGI para GGUF es limitado y no está confirmado en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| santosboakye/rag-medical-manual-model | 7,24 B (LLM base) | 8192 tokens (LLM) | No declarada (repo) | Pipeline RAG con Chroma y gte-large |
| Mistral-7B-Instruct-v0.2 | 7,24 B | 8192 tokens | Apache 2.0 | LLM instruct independiente |
| thebloke/Mistral-7B-Instruct-v0.2-GGUF | 7,24 B | 8192 tokens | Apache 2.0 (heredada) | Distribución GGUF del anterior |

La comparación directa más pertinente es con el LLM base: este repositorio no mejora el modelo en sí, sino que añade recuperación sobre un corpus concreto. Frente a una consulta directa a Mistral 7B, el RAG aporta grounding documental a cambio de dependencia del índice y del manual indexado. No se dispone de datos que permitan comparar rendimiento frente a alternativas especializadas en dominio médico.

## Limitaciones y advertencias

- Uso previsto declarado: fines educativos y de investigación sobre sistemas RAG; no está pensado como herramienta clínica.
- Riesgo de alucinación: incluso con contexto recuperado, el LLM puede generar información plausible pero incorrecta; en dominio médico esto es crítico.
- Sin licencia declarada en el repositorio: no queda claro el régimen de uso comercial, aunque el LLM base Mistral-7B-Instruct-v0.2 es Apache 2.0. Conviene verificar antes de cualquier despliegue.
- El autor no declara idiomas ni dominio lingüístico; el LLM base está orientado al inglés, lo que limita consultas en castellano.
- Dependencia total del manual indexado: si el corpus es incompleto u obsoleto, las respuestas heredan esos sesgos y carencias.
- La cuantización Q6_K introduce una pérdida de precisión respecto al modelo en FP16.
- El modelo de embeddings `gte-large` tiene un límite de longitud de entrada propio, lo que condiciona el tamaño de los fragmentos indexados.
- Sin benchmarks ni evaluación de retrieval publicados: no hay evidencia cuantitativa de fidelidad o cobertura.
- 0 descargas y 0 valoraciones en el momento de la información disponible: sin validación por parte de la comunidad.
- No debe utilizarse para diagnóstico, tratamiento o cualquier decisión clínica sin supervisión de profesionales sanitarios.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/santosboakye/rag-medical-manual-model
- LLM base (GGUF): https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Modelo de embeddings: https://huggingface.co/thenlper/gte-large
- Chroma DB: https://www.trychroma.com/
- LangChain: https://www.langchain.com/
- llama.cpp: https://github.com/ggerganov/llama.cpp
