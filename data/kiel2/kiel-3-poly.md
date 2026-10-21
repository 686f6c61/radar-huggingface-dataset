# kiel2/Kiel-3-Poly

## Resumen

Kiel-3-Poly es un modelo de embeddings densos de 3.085.938.688 parámetros (aproximadamente 3,09 B) publicado por kiel2 bajo la organización KielTech. No es un modelo generativo de uso general, sino un *backbone* de representación: convierte texto multilingüe, fragmentos de código Python y descripciones de análisis de seguridad en vectores densos de 2.048 dimensiones, comparables mediante similitud coseno. Se distribuye a través de la librería `sentence-transformers` con pipeline `feature-extraction`.

El modelo parte de `Qwen/Qwen2.5-3B-Instruct` y se ajusta con QLoRA de 4 bits mediante Unsloth, empleando Multiple Negatives Ranking Loss sobre cuatro dominios: tripletas de QQP, pares documentación-código de CodeSearchNet (Python), corpus multilingües y corpus curados de ciberseguridad (trazas de revisión de código, validación de JWT y patrones de mitigación de vulnerabilidades). La ventana de contexto declarada es de 8.192 tokens.

Su relevancia práctica está en cubrir simultáneamente recuperación multilingüe, búsqueda semántica de código y recuperación sobre documentación de seguridad en un único índice vectorial de 2.048 dimensiones. El repo ocupa 6,2 GB y, en el momento de la consulta, acumula 24 descargas y 0 *likes*, por lo que se trata de un modelo de publicación muy reciente y con adopción todavía mínima.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), adaptado como *sentence transformer* con pooling sobre las representaciones ocultas |
| Parámetros totales | 3.085.938.688 (≈3,09 B) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Dimensión de salida | 2.048 dimensiones |
| Función de similitud | similitud coseno |
| Tipos de cuantización | el autor documenta el entrenamiento con QLoRA de 4 bits; no se publican variantes GGUF/AWQ/GPTQ en el repo (safetensors en el tamaño original de 6,2 GB) |
| Idiomas soportados | `multilingual` y `en` según la model card; no se detalla la lista concreta de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería / pipeline | `sentence-transformers` / `feature-extraction` |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Etiquetas adicionales | `code-search`, `security`, `text-embeddings-inference`, `endpoints_compatible`, `qlora`, `unsloth` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only denso de 3,09 B de parámetros con atención causal estándar. Sobre él se aplica el esquema habitual de `sentence-transformers`, que agrega las representaciones de tokens en un único vector de frase de 2.048 dimensiones; el modelo se usa en modo *encoder* para producir embeddings, no para generar texto. El ajuste se realizó con QLoRA (cuantización de 4 bits) y aceleración de Unsloth, con *gradient checkpointing* y filtrado estricto de longitudes para estabilizar la representación en los cuatro dominios.

La función de pérdida es Multiple Negatives Ranking Loss, con batches construidos a partir de tripletas y pares positivos. Los datos de entrenamiento declarados son: (1) tripletas de QQP para equivalencia semántica y parafraseo; (2) CodeSearchNet en Python para alinear documentación con código; (3) corpus multilingües para alineamiento cross-lingual; y (4) corpus curados de ciberseguridad con trazas de revisión automatizada de código, comprobaciones de validación de JWT y patrones de mitigación de vulnerabilidades. No se especifican el número total de tokens, la composición porcentual por dominio, ni si hubo una etapa posterior de DPO o RLHF; tampoco se documenta ninguna innovación de atención (attention linear, decodificación especulativa) porque el modelo no está orientado a decodificación.

## Capacidades

- Generación de embeddings de texto multilingüe en un espacio denso de 2.048 dimensiones, con similitud coseno como métrica de comparación.
- Búsqueda semántica de código Python y alineamiento entre funciones y su documentación, entrenado explícitamente con CodeSearchNet.
- Recuperación cross-lingual: la model card declara alineamiento entre idiomas, aunque sin enumerar los idiomas cubiertos.
- Recuperación y razonamiento sobre corpus de seguridad: validación de tokens y sesiones, inyección SQL, mitigación de vulnerabilidades y revisión de código.
- Soporte de *retrieval-augmented generation* (RAG) como recuperador del pipeline.
- Compatibilidad con Text Embeddings Inference (etiqueta `text-embeddings-inference` y `endpoints_compatible`), lo que permite desplegarlo como endpoint HTTP de embeddings.
- No soporta tool calling, function calling, razonamiento multi-paso agéntico ni modos de *thinking*: es un modelo de representación, no un generador de instrucciones.
- No tiene capacidades de visión ni de audio.

## Casos de uso

- **RAG multilingüe sobre documentación técnica**: indexar manuales, RFCs y guías internas en varios idiomas en un único espacio vectorial de 2.048 dimensiones, de modo que una consulta en castellano recupere pasajes en inglés o viceversa sin duplicar el índice por idioma.
- **Búsqueda semántica de código en monorepos**: generar embeddings de funciones y docstrings Python para que un desarrollador localice implementaciones por descripción funcional ("validación de sesión con secreto compartido") en lugar de por coincidencia literal de identificadores.
- **Asistente de revisión de código orientado a seguridad**: indexar el histórico de *pull requests*, hallazgos de SAST y advisories internos, y recuperar los casos previos más similares ante un nuevo diff, aprovechando el ajuste sobre trazas de revisión y patrones de mitigación.
- **Triaje y deduplicación de incidencias**: agrupar tickets, issues y alertas de bug bounty por similitud coseno para detectar duplicados y enrutar cada caso al equipo correspondiente, con un umbral calibrado sobre los propios datos.
- **Base de conocimiento de vulnerabilidades**: construir un índice de CVEs, avisos y contramedidas para que un analista consulte en lenguaje natural qué mitigaciones se aplicaron antes a una clase de fallo concreta (por ejemplo, inyección SQL mediante consultas preparadas).
- **Detección de código casi duplicado y deuda técnica**: comparar fragmentos entre repositorios para identificar copias, bifurcaciones no mantenidas o implementaciones redundantes de la misma función auxiliar.
- **Enrutado semántico en pipelines de agentes**: usar los embeddings como clasificador de intención de bajo coste que decide qué herramienta o subflujo activar antes de invocar un LLM generativo, reduciendo tokens consumidos en el enrutador.
- **Búsqueda en documentación de APIs y SDKs**: alinear ejemplos de código con las secciones descriptivas correspondientes para un buscador dentro del portal de desarrolladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de `kiel2/Kiel-3-Poly` no incluye métricas de MTEB, BEIR, CodeSearchNet ni evaluación alguna de recuperación, y tampoco se aportan números de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada para inferencia** (cálculo derivado del tamaño de los pesos, no publicado por el autor):
  - BF16/FP16: ~6,2 GB solo de pesos; con activaciones y batches de tamaño moderado, un entorno realista ronda 8-10 GB.
  - INT8: ~3,1 GB de pesos; ~5-6 GB con overhead de runtime.
  - 4 bits: ~1,7 GB de pesos; ~4 GB con overhead.
  - Con secuencias cercanas a los 8.192 tokens la memoria de activaciones crece de forma apreciable y conviene limitar `batch_size` o truncar.
- **GPU recomendadas**: para servir con concurrencia, A100 40/80 GB, H100 o L40S permiten lotes grandes y mayor throughput. Para desarrollo y volúmenes bajos, RTX 4090 (24 GB) o RTX 3090 (24 GB) son holgadas incluso en BF16.
- **¿Cabe en GPU de consumo?** Sí. En 4 bits o INT8 entra en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060); en BF16 requiere 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB).
- **Opciones de despliegue**: `sentence-transformers` en Python para prototipado; Text Embeddings Inference (TEI) de Hugging Face para servir el endpoint, alineado con las etiquetas `text-embeddings-inference` y `endpoints_compatible` del repo; envoltorios FastAPI o servicios gestionados de *inference endpoints*. No se publican pesos GGUF, por lo que llama.cpp u Ollama no son viables sin una conversión propia.
- **Latencia y throughput**: no disponibles. Al ser un modelo denso de 3 B, el coste por secuencia es sustancialmente mayor que el de encoders de 300-600 M, y el rendimiento real dependerá de la longitud media de los fragmentos y del lote.

## Comparativa con modelos similares

Los datos de la columna de Kiel-3-Poly proceden de la model card; los de los modelos alternativos, de su documentación pública. La comparación de rendimiento no puede establecerse porque Kiel-3-Poly no publica métricas.

| Modelo | Parámetros | Dimensión | Contexto | Licencia | Benchmarks públicos |
|---|---|---|---|---|---|
| kiel2/Kiel-3-Poly | 3,09 B | 2.048 | 8.192 | Apache 2.0 | no disponibles |
| BAAI/bge-m3 | ~568 M | 1.024 | 8.192 | MIT | sí (MTEB) |
| intfloat/multilingual-e5-large | ~560 M | 1.024 | 512 | MIT | sí (MTEB) |
| Qwen/Qwen3-Embedding-4B | ~4 B | 2.560 | 32.768 | Apache 2.0 | sí (MTEB) |

Consideraciones sobre la comparativa: frente a `bge-m3` y `multilingual-e5-large`, Kiel-3-Poly multiplica por cinco o seis el número de parámetros, lo que encarece indexación y serving sin que exista evidencia pública de mejora en recuperación. Frente a `Qwen3-Embedding-4B`, ofrece menor dimensión y menor contexto, pero también menor coste de inferencia. La ventaja diferencial declarada de Kiel-3-Poly es su ajuste específico sobre corpus de ciberseguridad y pares código-documentación, un dominio que las alternativas generalistas no cubren de forma explícita.

## Limitaciones y advertencias

- **Ausencia total de evaluación publicada**: no hay métricas de MTEB, BEIR, CodeSearchNet ni pruebas de recuperación en seguridad. Cualquier decisión de adopción debería basarse en una evaluación propia sobre el corpus objetivo.
- **Adopción mínima**: 24 descargas y 0 *likes* en el momento del análisis, con un modelo publicado en octubre de 2026. No hay evidencia de uso en producción ni comunidad que reporte fallos.
- **Riesgo de alucinación trasladado al recuperador**: en un pipeline RAG, un embedding mal calibrado devuelve pasajes semánticamente próximos pero irrelevantes, lo que induce respuestas erróneas del generador. No hay datos sobre calibración de umbrales de similitud.
- **Cobertura de idiomas indeterminada**: la model card declara `multilingual` y `en` sin enumerar idiomas ni volúmenes por lengua. El rendimiento en castellano no está verificado; el entrenamiento se apoya en corpus multilingües no detallados.
- **Sesgos no documentados**: no se describe la composición de los corpus, los filtros aplicados ni análisis de sesgo. Los datos de ciberseguridad, además, pueden arrastrar sesgos hacia patrones concretos de un stack tecnológico (por ejemplo, JWT y validación de sesiones en backends).
- **Ámbito de código limitado a Python**: el ajuste con CodeSearchNet se declara explícitamente en Python; no hay garantía de calidad en otros lenguajes.
- **No es un modelo generativo utilizable como chat**: aunque herede de un modelo instruct, el ajuste como *embedding backbone* degrada la capacidad de generación. No debe emplearse para producir texto, tool calling ni razonamiento multi-paso.
- **Formato de despliegue limitado**: solo se publican pesos safetensors; no hay GGUF, AWQ ni GPTQ, lo que obliga a convertirlos para usarlos con llama.cpp u Ollama.
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia; conviene verificar igualmente las condiciones heredadas del modelo base Qwen2.5-3B-Instruct, también Apache 2.0.
- **Coste de indexación**: 2.048 dimensiones y 3 B de parámetros implican un índice vectorial más pesado y un proceso de embedding más lento que las alternativas de 500 M; a gran escala conviene evaluar cuantización de los vectores o reducción de dimensión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiel2/Kiel-3-Poly
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Documentación de Sentence Transformers: https://www.sbert.net/
- Text Embeddings Inference (Hugging Face): https://github.com/huggingface/text-embeddings-inference
- Unsloth: https://github.com/unslothai/unsloth
- CodeSearchNet: https://github.com/github/CodeSearchNet
- QQP (Quora Question Pairs, GLUE): https://huggingface.co/datasets/nyu-mll/glue
- Paper, blog técnico, repositorio de código o demo del modelo: no disponibles en la información proporcionada.
