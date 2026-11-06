# klpeng/uce-gemini-80k

## Resumen

UCE Gemini 80K es un codificador disperso (*sparse encoder*) desarrollado por el usuario klpeng que transforma embeddings de texto de Gemini en activaciones de conceptos interpretables. No es un modelo generativo: recibe como entrada un array NumPy de forma `(N, 3072)` con embeddings producidos por `gemini-embedding-2-preview` (tipo de tarea `RETRIEVAL_DOCUMENT`) y devuelve una matriz CSR dispersa de forma `(N, 80513)`, donde cada fila contiene como máximo 128 activaciones no nulas correspondientes a conceptos etiquetados.

El modelo resuelve un problema concreto de interpretabilidad: dado un embedding opaco de Gemini, permite saber qué conceptos semánticos están activos en ese texto y con qué intensidad. Para ello selecciona las 128 puntuaciones más altas entre 80.513 conceptos etiquetados y ofrece una función `explain()` que devuelve el `concept_id`, la etiqueta y la puntuación de activación de cada concepto activo, sin llamadas adicionales a APIs.

Con 247.339.008 parámetros en formato safetensors (repo de 1,2 GB, pesos en float32), es un componente ligero de análisis que se usa junto a la API de embeddings de Gemini. Su relevancia actual radica en que aporta una capa de inspección semántica sobre embeddings propietarios, algo poco habitual en el ecosistema abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador disperso (*sparse encoder*) sobre embeddings de Gemini; salida top-128 de 80.513 conceptos |
| Parametros totales | 247.339.008 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesa embeddings precalculados, no texto) |
| Tipos de cuantizacion | No disponible; el autor indica mantener el modelo en float32 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (PyTorch) |
| Dimension de entrada | 3.072 (embeddings de `gemini-embedding-2-preview`) |
| Dimension de salida | 80.513 conceptos, maximo 128 activos por texto |
| Formato de salida | Matriz dispersa SciPy CSR |

## Arquitectura y entrenamiento

La informacion disponible describe un codificador que proyecta embeddings de 3.072 dimensiones a un espacio de 80.513 conceptos etiquetados y aplica una seleccion top-128, generando como maximo 128 activaciones no nulas por texto. El modelo se distribuye como paquete Python (`gemini_uce`) con pesos en safetensors y soporte para CPU y CUDA (`device="cuda"`), siempre en float32. Incluye metodos `encode()` (devuelve la matriz CSR completa), `encode_iter()` (genera lotes dispersos sin retener toda la salida en memoria) y `explain()` (devuelve hasta `top_n` conceptos activos ordenados por activacion decreciente).

No se especifican en la informacion proporcionada los detalles del entrenamiento: numero de tokens, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa. Si se documenta el proceso de evaluacion de fidelidad por concepto: se compara la activacion original de Gemini `>0.05` frente a cero exacto, con hasta 50 positivos y 50 ceros por concepto, y textos de test de maximo 256 palabras juzgados por GPT-6 Luna con razonamiento desactivado. Los resultados se guardan en `fidelities.csv` (precision, recall, F1, accuracy, tasas YES positivo/cero y matrices de confusion), `fidelity_summary.json` y `fidelities.json` (metodo y hashes de origen).

## Capacidades

- Proyeccion de embeddings de Gemini a 80.513 conceptos etiquetados con seleccion top-128.
- Salida dispersa eficiente en formato SciPy CSR, adecuada para corpus grandes.
- Explicacion legible por concepto: `explain()` devuelve `concept_id`, `label` y `activation`.
- Procesamiento por lotes con `encode()` y en streaming con `encode_iter()`.
- Ejecucion en CPU y GPU NVIDIA (CUDA), manteniendo float32.
- Analisis de prevalencia de conceptos en un corpus mediante `prevalences.csv` y `prevalences.npz` (umbrales de activacion `>0.05` y `>0.1`, con recuentos y cotas superiores de confianza unilaterales al 99 %).
- Metricas de fidelidad por concepto ya calculadas y listas para consulta.
- No realiza generacion de texto, razonamiento, codigo, matematicas, vision ni tool calling: es exclusivamente un codificador de conceptos sobre embeddings.

## Casos de uso

- Auditoria de embeddings en produccion: dado un lote de embeddings de `gemini-embedding-2-preview` generados por un sistema RAG, `encode()` devuelve la matriz CSR de conceptos activos y permite detectar que temas cubre realmente el corpus indexado.
- Analisis de sesgo y tematica en datasets: usando `prevalences.csv` se pueden identificar conceptos enriquecidos en un conjunto de datos respecto a un corpus de referencia, con cotas de confianza al 99 %.
- Monitorizacion de deriva semantica: comparar la distribucion de conceptos activos entre versiones de un corpus o entre periodos temporales para detectar cambios de tematica.
- Etiquetado exploratorio de documentos: `explain()` sobre cada fila permite asignar etiquetas interpretables a documentos sin entrenar un clasificador propio, aprovechando los 80.513 conceptos predefinidos.
- Investigacion en interpretabilidad: analizar que conceptos activa un embedding dado y contrastarlo con las fidelidades por concepto (`fidelities.csv`) para estudiar la calidad de la representacion.
- Filtrado y enriquecimiento de pipelines de retrieval: usar las activaciones top-128 como senal adicional de re-ranking o filtrado tematico sobre los resultados de busqueda vectorial.
- Evaluacion de cobertura conceptual de un modelo de embeddings: medir cuantos conceptos distintos se activan en un corpus y con que frecuencia para caracterizar el espacio semantico cubierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico material de evaluacion son las metricas de fidelidad por concepto recogidas en `fidelities.csv` y `fidelity_summary.json`, que comparan activaciones originales de Gemini `>0.05` frente a cero exacto usando juicios automatizados de GPT-6 Luna sobre textos de test de hasta 256 palabras. No se proporcionan cifras agregadas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 247,3 M de parametros en float32, los pesos ocupan aproximadamente 1 GB; el consumo adicional depende del tamano de lote y de la matriz CSR de salida.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 2-4 GB de VRAM libre para lotes moderados; no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, por el tamano de pesos (~1 GB en float32); el autor no detalla modelos concretos.
- Despliegue: paquete Python `gemini_uce` con `GeminiUCE.from_pretrained()`, soporte CPU y CUDA; requiere `pip install -r requirements.txt`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de codificador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (codificadores dispersos sobre embeddings de Gemini con conceptos etiquetados).

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas; solo activaciones de conceptos sobre embeddings precalculados.
- Depende de `gemini-embedding-2-preview` con tarea `RETRIEVAL_DOCUMENT` y 3.072 dimensiones; embeddings de otro modelo o configuracion no son compatibles.
- El autor advierte de no aplicar normalizacion unitaria adicional a los embeddings de entrada.
- La seleccion top-128 limita la salida a 128 conceptos por texto; conceptos con activacion baja quedan fuera aunque esten presentes.
- Las fidelidades por concepto son juicios automatizados de GPT-6 Luna y no estan ponderadas por prevalencia del corpus; los conceptos sin ejemplos positivos quedan excluidos de las medias correspondientes.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Idiomas soportados no disponibles; el comportamiento multilingue depende del modelo de embeddings de Gemini subyacente.
- Riesgo de conceptos mal etiquetados o poco representativos en funcion de la calidad de las etiquetas y del corpus de evaluacion.
- Mantener float32 segun indicacion del autor; no se documentan versiones cuantizadas.

## Enlaces

- Hugging Face: https://huggingface.co/klpeng/uce-gemini-80k
- Google GenAI SDK (usado en el ejemplo de la model card): https://github.com/googleapis/python-genai
