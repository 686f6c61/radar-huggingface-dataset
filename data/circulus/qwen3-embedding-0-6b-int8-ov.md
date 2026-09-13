# circulus/qwen3-embedding-0.6b-int8-ov

## Resumen

Este repositorio contiene un export en formato OpenVINO IR de **Qwen/Qwen3-Embedding-0.6B**, cuantizado a **INT8**, con un peso en disco de **590 MB**. Lo publica el usuario **circulus** como parte del material del curso ARCademy sobre OpenVINO (lecciones 11 «Embedding search» y 12 «RAG»), y se genera con el script `convert/convert_all.py` del propio curso. El modelo es un modelo de representaciones (embeddings), no un modelo generativo de chat: convierte texto en vectores densos para búsqueda semántica y recuperación.

La relevancia de esta ficha es práctica: se trata de un artefacto de despliegue pensado para ejecutarse en CPU e iGPU Intel mediante OpenVINO, con un tamaño inferior a 1 GB. El flujo de uso es el típico de un bi-encoder: se calcula el *last-token pooling* sobre `last_hidden_state`, se aplica normalización L2 y, para las consultas, se prepone un prefijo con el formato `Instruct: …\nQuery: …`. Los documentos no llevan prefijo.

El repositorio es una exportación de comunidad, sin resultados de evaluación publicados y con licencia marcada como `other`. Todas las características heredadas (arquitectura, idiomas, contexto) proceden del modelo base Qwen3-Embedding-0.6B, no de una ficha propia detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 adaptado a embeddings (heredada del modelo base) |
| Parametros totales | 0,6 B (según el nombre del repositorio y del modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card del export; el modelo base Qwen3-Embedding-0.6B declara 32 768 tokens |
| Tipos de cuantizacion | INT8 (compresión de pesos mediante `optimum`) |
| Idiomas soportados | no disponible en la model card del export; el modelo base declara soporte multilingüe |
| Licencia | other (model card del export) |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`) |
| Tamano en disco | 590 MB (repositorio de 0,6 GB) |
| Modelo base | Qwen/Qwen3-Embedding-0.6B |
| Pooling | last-token pooling sobre `last_hidden_state` + normalizacion L2 |
| Formato de consulta | prefijo `Instruct: …\nQuery: …` |
| Dimension de embedding | no disponible en la model card del export |
| Autor | circulus |
| Fecha de creacion | 2026-09-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es una conversión, no un entrenamiento. El pipeline es: se parte de los pesos del modelo base Qwen3-Embedding-0.6B, se exportan a OpenVINO IR y se aplica compresión de pesos INT8 con las utilidades de `optimum`. No se documenta en la model card ningún ajuste fino adicional, destilado ni proceso de RLHF/DPO específico de esta conversión; cualquier entrenamiento relevante corresponde al modelo base original de Qwen.

En cuanto al uso, la innovación destacable de esta ficha es operativa: el formato OpenVINO IR permite ejecutar el modelo en hardware Intel (CPU, iGPU, GPU Arc, NPU) sin depender de CUDA, y el INT8 reduce el peso a 590 MB. El modelo es un bi-encoder de representaciones: produce un vector por texto mediante *last-token pooling* y lo normaliza con L2, de modo que la similitud coseno equivale al producto escalar. El tratamiento asimétrico consulta/documento se resuelve con el prefijo de instrucción en las consultas.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y recuperación de información.
- Recuperación aumentada por generación (RAG): indexación de documentos y consulta vectorial.
- Búsqueda asimétrica con instrucciones mediante el prefijo `Instruct: …\nQuery: …`.
- Similitud coseno eficiente gracias a la normalización L2 de las representaciones.
- Soporte multilingüe heredado del modelo base (no cuantificado en la ficha del export).
- Clasificación y agrupamiento por similitud de vectores (zero-shot por vecinos más cercanos).
- Deduplicación y filtrado de corpus por distancia entre embeddings.
- No es un modelo generativo: no produce texto, no mantiene conversaciones y no soporta tool calling ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo «thinking» en esta conversión.

## Casos de uso

- Búsqueda semántica en una base documental: se indexan los documentos con el modelo y se consulta con el prefijo de instrucción; la similitud coseno sobre vectores L2 devuelve los fragmentos más relevantes.
- Pipeline RAG sobre documentación técnica: el export INT8 se ejecuta en CPU Intel junto a un LLM generativo, reduciendo el coste del recuperador al liberar la GPU para el modelo de generación.
- Despliegue en edge o en servidores sin GPU: al pesar 590 MB y usar OpenVINO, cabe en equipos con CPU de gama media y en dispositivos Intel con NPU.
- Deduplicación de corpus de entrenamiento: se calculan embeddings de cada muestra y se eliminan duplicados por umbral de similitud coseno.
- Clasificación zero-shot de tickets o correos: se comparan los embeddings de los textos de entrada con los de etiquetas descriptivas predefinidas.
- Recomendación por contenido: se representan ítems y preferencias del usuario como vectores y se ordenan candidatos por similitud.
- Búsqueda multilingüe (si se confirma el soporte del modelo base): consultas en un idioma contra un índice en otro, útil en catálogos internacionales.
- Material didáctico: sirve como ejemplo reproducible de exportación, cuantización INT8 y despliegue con OpenVINO en los cursos ARCademy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del export no incluye métricas de recuperación (por ejemplo, nDCG, Recall@k o MTEB) ni comparaciones con otras configuraciones de cuantización. Tampoco se documentan medidas de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: inferior a 1 GB de pesos (590 MB en INT8), más el consumo del runtime OpenVINO y los tensores de activación.
- Cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.) y en GPUs integradas Intel.
- Diseñado principalmente para CPU Intel, iGPU, GPU Arc y NPU mediante OpenVINO; no requiere CUDA.
- Opciones de despliegue: OpenVINO Runtime, `optimum-intel` / Hugging Face Optimum, y descarga mediante `huggingface_hub.snapshot_download`.
- Para usar en `llama.cpp`, Ollama, vLLM o TGI sería necesario reconvertir el modelo, ya que este repositorio solo publica OpenVINO IR.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| circulus/qwen3-embedding-0.6b-int8-ov | 0,6 B | no disponible en el export (32 768 tokens en el modelo base) | OpenVINO IR INT8 | other | Comunidad, 0 descargas |
| Qwen/Qwen3-Embedding-0.6B | 0,6 B | 32 768 tokens (modelo base) | safetensors (FP) | la del repositorio oficial de Qwen | Oficial |
| Alternativas de embeddings multilingues (p. ej. BGE-M3, multilingual-E5) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada; la comparación se limita al formato, tamaño y origen de distribución.

## Limitaciones y advertencias

- La licencia del export está marcada como `other`; antes de un uso comercial hay que verificar los términos del repositorio del modelo base.
- Es un artefacto de comunidad con 0 descargas y 0 likes, sin proceso de revisión documentado.
- La cuantización INT8 puede degradar ligeramente la calidad de los embeddings respecto al modelo en precisión completa; no se publican métricas que cuantifiquen esa pérdida.
- El modelo no genera texto ni soporta tool calling, agentes o razonamiento multi-paso; usarlo como si fuera un LLM no es viable.
- No se documentan en el export los idiomas soportados, la dimensión de embedding ni el contexto máximo real tras la conversión.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de recuperar pasajes irrelevantes si los umbrales de similitud se fijan mal.
- El formato OpenVINO IR limita su uso a herramientas compatibles con OpenVINO; otros runtimes requieren reconversión.
- Dependencia del formato exacto del prefijo de consulta (`Instruct: …\nQuery: …`): omitirlo puede degradar la calidad de la recuperación.
- La fecha de creación del repositorio (2026-09-13) es posterior a la fecha de referencia habitual de los modelos Qwen3; conviene confirmar la procedencia e integridad de los pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/circulus/qwen3-embedding-0.6b-int8-ov
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Descarga mediante `snapshot_download("circulus/qwen3-embedding-0.6b-int8-ov")`, según la model card.
- No se han encontrado en la búsqueda web enlaces relevantes (papers, blogs, repos o demos) asociados a este modelo; los resultados obtenidos no guardan relación con la ficha.
