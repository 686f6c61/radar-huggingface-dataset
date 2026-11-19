# bpiwowar/zotseek-splade-pp-en-v1

## Resumen

`zotseek-splade-pp-en-v1` es una exportación a ONNX del modelo SPLADE `prithivida/Splade_PP_en_v1`, empaquetada por el usuario bpiwowar para su uso en ZotSeek, un sistema de recuperación dispersa aprendida (*learned sparse retrieval*). No se trata de un modelo generativo, sino de un codificador de recuperación que transforma texto en vectores dispersos de alta dimensionalidad (30.522 dimensiones, una por token del vocabulario) para búsqueda léxica semántica.

El modelo hereda la arquitectura y los pesos del SPLADE++ original de Prithviraj Datta, un transformer BERT-like entrenado con destilación de conocimiento desde un cross-encoder para producir representaciones dispersas que combinan la eficiencia de BM25 con la semántica de los modelos densos. La aportación de esta versión es puramente de despliegue: fusiona el *pooling* SPLADE dentro del grafo ONNX, aplica cuantización int8 solo a pesos (MatMulNBits con activaciones fp32) y embeddings en fp16, reduciendo el tamaño del repositorio a 0,2 GB.

Es relevante para desarrolladores que necesiten un motor de búsqueda dispersa ejecutable en navegador o en CPU sin dependencias de PyTorch, ya que el grafo ONNX es consumible por onnxruntime-web 1.31 o superior. El modelo es monolingüe (inglés) y su licencia Apache 2.0 permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer BERT-like con cabecera SPLADE (log-saturation + max-pooling) |
| Parámetros totales | no disponible (modelo base BERT-base, ~110 M estimados) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base SPLADE++ admite secuencias de hasta 512 tokens) |
| Tipos de cuantización | int8 solo pesos (MatMulNBits, activaciones fp32), embeddings fp16 |
| Idiomas soportados | inglés (modelo base `Splade_PP_en_v1`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafo único con pooling fusionado) |

## Arquitectura y entrenamiento

El modelo subyacente es SPLADE++ (`prithivida/Splade_PP_en_v1`), un codificador basado en BERT que proyecta cada token de entrada a una distribución sobre el vocabulario y agrega las activaciones mediante `log(1 + relu(logits))` seguido de un max-pooling sobre las posiciones. El resultado es un vector disperso de 30.522 dimensiones con pesos no negativos, interpretable como una expansión léxica ponderada. El entrenamiento original de SPLADE++ combina pérdida de ranking con destilación desde un cross-encoder, lo que produce expansiones de términos más controladas que la versión SPLADE original.

Esta exportación no reentrena el modelo: modifica el grafo para fusionar el pooling SPLADE dentro de ONNX, añade una entrada opcional `k` (int64 `[1]`) que impone un tope top-k por posición antes del max-pooling, y cuantiza las matrices de pesos a int8 con MatMulNBits manteniendo activaciones fp32. El grafo acepta `input_ids`, `attention_mask`, `pooling_mask` (int64 `[B, L]`) y `k`, y devuelve un tensor `sparse` float32 de forma `[B, 30522]`. Los detalles sobre prefijos de instrucción, posiciones a agrupar, longitudes de ventana y padding se documentan en el fichero `zotseek-sparse.json` del repositorio. La verificación de equivalencia se realiza mediante `fixtures/reference.json`, que contiene textos sintéticos con los vectores de la implementación original, de la exportación fp32 y de esta exportación int8.

## Capacidades

- Codificación de texto a vectores dispersos de 30.522 dimensiones para recuperación léxica-semántica.
- Expansión de términos: el modelo pondera términos relacionados no presentes literalmente en el documento.
- *Pooling* SPLADE fusionado en el grafo, sin necesidad de post-procesado externo.
- Tope top-k configurable por posición mediante la entrada `k`.
- Ejecución en CPU y en navegador vía onnxruntime / onnxruntime-web (requiere versión 1.31 o superior para MatMulNBits).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No soporta visión ni audio.
- Capacidad multilingüe: no, solo inglés.

## Casos de uso

- Búsqueda documental en aplicaciones web sin backend: el grafo ONNX se ejecuta en el navegador con onnxruntime-web, permitiendo indexar y consultar colecciones locales (por ejemplo, bibliografía exportada de Zotero) sin enviar datos a un servidor.
- Recuperación híbrida en RAG: los vectores dispersos del modelo se combinan con embeddings densos para mejorar el *recall* de términos raros, acrónimos o nombres propios que los modelos densos suelen perder.
- Motor de búsqueda en asistentes de escritorio: el tamaño reducido (0,2 GB) y la ejecución en CPU permiten integrarlo en aplicaciones de escritorio tipo Electron o Tauri para búsqueda sobre notas y PDFs locales.
- Filtrado previo en pipelines de recuperación a gran escala: al ser disperso, el índice invertido resultante ocupa mucho menos que un índice denso equivalente, lo que abarata el almacenamiento y acelera el primer estadio de *retrieval*.
- Búsqueda en bases de conocimiento técnicas: la expansión de términos ayuda a recuperar documentación cuando la consulta del usuario no coincide literalmente con el texto indexado.
- Deduplicación y clustering de documentos por similitud léxica-semántica: la representación dispersa permite calcular solapamientos con operaciones de intersección eficientes.
- Evaluación y *benchmarking* de sistemas de recuperación: sirve como referencia SPLADE++ cuantizada para comparar latencias y calidad frente a implementaciones fp32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo referencia comprobaciones de equivalencia numérica frente a la implementación original y a la exportación fp32 mediante `fixtures/reference.json`, sin métricas de recuperación (MRR, nDCG, Recall@k) ni de latencia.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,2 GB y el modelo base BERT-base en fp32 ronda los 0,4-0,5 GB, por lo que la inferencia en int8 con activaciones fp32 debería mantenerse por debajo de 1 GB de memoria.
- GPU recomendadas: no requiere GPU; cualquier GPU con al menos 2 GB de memoria puede ejecutarlo, pero el diseño está orientado a CPU y navegador.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060 en adelante) e incluso en iGPU.
- Opciones de despliegue: onnxruntime (Python, C++, C#), onnxruntime-web 1.31 o superior para navegador. No se distribuye en formato GGUF ni como modelo de transformers, por lo que vLLM, llama.cpp, Ollama y TGI no son aplicables.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensiones del vector | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `bpiwowar/zotseek-splade-pp-en-v1` | SPLADE++ ONNX int8 | 30.522 (disperso) | no disponible (base: 512) | Apache 2.0 | ONNX |
| `prithivida/Splade_PP_en_v1` | SPLADE++ (modelo base) | 30.522 (disperso) | 512 | Apache 2.0 | safetensors / PyTorch |
| `naver/splade-cocondenser-ensembledistil` | SPLADE destilado | 30.522 (disperso) | 512 | Apache 2.0 | PyTorch |
| `BAAI/bge-base-en-v1.5` | Recuperación densa | 768 (denso) | 512 | MIT | safetensors |

La comparación directa con modelos densos no es homogénea: SPLADE produce vectores dispersos aptos para índices invertidos, mientras que los modelos densos requieren índices vectoriales (FAISS, HNSW). Frente al SPLADE++ original, esta versión solo difiere en formato y cuantización, no en calidad esperada, aunque no se han publicado métricas que confirmen la degradación exacta por int8.

## Limitaciones y advertencias

- Modelo monolingüe: solo procesa inglés; consultas en castellano u otros idiomas producirán recuperación degradada.
- No es un modelo generativo: no responde preguntas ni produce texto, solo vectores de recuperación.
- La cuantización int8 solo de pesos puede introducir pequeñas desviaciones numéricas frente a fp32; el autor no publica métricas de degradación en recuperación.
- Requiere onnxruntime 1.31 o superior; versiones anteriores no soportan MatMulNBits y fallarán al cargar el grafo.
- Depende de la correcta construcción de `pooling_mask` y de los prefijos de instrucción descritos en `zotseek-sparse.json`; un uso incorrecto altera los vectores resultantes.
- Riesgo de alucinación no aplica en el sentido generativo, pero la expansión de términos puede introducir falsos positivos en la recuperación si el tope top-k (`k`) no se ajusta.
- Licencia Apache 2.0 permite uso comercial y modificación, con atribución; el autor original del modelo es Prithviraj Datta y esta exportación solo añade el empaquetado.
- Repositorio con 0 descargas y 0 *likes*: no hay evidencia de uso en producción ni de validación comunitaria independiente.

## Enlaces

- [Hugging Face: bpiwowar/zotseek-splade-pp-en-v1](https://huggingface.co/bpiwowar/zotseek-splade-pp-en-v1)
- [Modelo base: prithivida/Splade_PP_en_v1](https://huggingface.co/prithivida/Splade_PP_en_v1)
- [Repositorio ZotSeek](https://github.com/introfini/ZotSeek)
- [Paper SPLADE++ (arXiv:2205.04733)](https://arxiv.org/abs/2205.04733)
- [Paper SPLADE original (arXiv:2107.05720)](https://arxiv.org/abs/2107.05720)
- [onnxruntime](https://github.com/microsoft/onnxruntime)
