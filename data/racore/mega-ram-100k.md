# racore/mega-ram-100k

## Resumen

Mega-RAM 100k es un modelo de question answering extractivo desarrollado por el usuario racore y publicado en Hugging Face bajo licencia MIT. No es un modelo de lenguaje generativo: se trata de un controlador de recuperación aumentada (RAG) de tan solo 85.654 parámetros que opera sobre una memoria externa de hasta 10 millones de tokens. Su función es indexar documentos aportados por el usuario, recuperar los pasajes relevantes mediante fusión híbrida de señales y devolver un span literal del documento citado, con `doc_id` y offsets de caracteres, o abstenerse si no encuentra evidencia suficiente.

La propuesta técnica es inusual: ninguno de sus pesos ha sido entrenado mediante descenso de gradiente. Todos los tensores se generan de forma determinista a partir de un programa declarativo (`weights/program.json`) mediante un compilador, en un enfoque que el autor denomina Weights-Space Programming. El modelo se apoya únicamente en `numpy` y `scipy`, funciona en CPU con latencias declaradas de 3 a 20 ms por consulta y no requiere GPU ni la librería `transformers`.

Es relevante ahora porque propone una alternativa de coste casi nulo (aproximadamente 0,0006 USD por cada 1.000 consultas) para tareas de QA documental con citación verificable, en un contexto donde los sistemas RAG basados en LLM arrastran costes de inferencia y riesgos de alucinación. Sus limitaciones son igualmente claras: no genera texto libre, no tiene conocimiento del mundo y sus resultados de benchmarks publicados son mixtos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Controlador RAG determinista con compilador de pesos; encoder de 256 dimensiones con 4 familias de features y bloques ortogonales sembrados; recuperación híbrida de 5 señales y span scorer de 24 features |
| Parametros totales | 85.654 (límite de 100.000 aplicado por el compilador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 10.000.000 tokens de memoria externa (no atención) |
| Tipos de cuantizacion | No disponible (pesos en fp32, 343 KB; 130 KB comprimidos en `weights/weights.npz`) |
| Idiomas soportados | Inglés (en) y árabe (ar) |
| Licencia | MIT |
| Formato de pesos | NPZ (`weights/weights.npz`) más programa declarativo JSON (`weights/program.json`) y manifiesto `weights/MANIFEST.json` |

## Arquitectura y entrenamiento

El modelo no es un transformer ni un modelo de lenguaje. Se compone de un encoder de 256 dimensiones que proyecta cuatro familias de features (bloques ortogonales generados por QR sembrado), una capa de conceptos de 72 dimensiones construida a partir de 72 glosas escritas a mano sobre 24 conceptos, un router de 8 intenciones con 30 aristas `(concepto, intención, peso)` y 24 cues regex, y un span scorer que evalúa 24 features superficiales mediante una destilación ridge en forma cerrada. La recuperación fusiona cinco señales con pesos programados: BM25, 4-gramas de caracteres, similitud densa con vectores hasheados de 256 dimensiones, proximidad de términos de consulta y proyección de conceptos.

No hay entrenamiento: cero parámetros entrenados, cero gradientes. El bucle de Weights-Space Programming edita el programa declarativo, no los pesos. El compilador registra en `MANIFEST.json` la procedencia, forma y recuento de parámetros de cada bloque, y rechaza emitir más de 100.000 parámetros. La respuesta se construye puntuando features de superficie, recortando el mejor span (fechas para preguntas temporales, moneda para precios, entidades en posición de sujeto para preguntas de "quién", cantidades en el resto) y citándolo textualmente. El pipeline de ingesta completo (PDF, DOCX, imágenes, vídeo, código) solo está disponible instalando el proyecto fuente con `pip install -e .`.

## Capacidades

- Question answering extractivo con respuestas literales del corpus indexado, acompañadas de `doc_id`, cita y offsets de caracteres.
- Abstención explícita cuando no hay evidencia suficiente (`ans.abstained`).
- Recuperación híbrida: BM25, 4-gramas de caracteres, similitud densa hasheada, proximidad de términos y conceptos.
- Indexación de documentos aportados por el usuario con identificador externo (`ext_id`), título y texto.
- Capacidades multimodales de ingesta (OCR, imágenes, vídeo, PDF, DOCX, código) solo mediante el toolkit completo del repositorio fuente.
- Soporte multilingüe limitado a inglés y árabe.
- Ejecución en CPU sin GPU ni `transformers`, con dependencias reducidas a `numpy` y `scipy`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto libre.

## Casos de uso

- Atención al cliente sobre base documental propia: indexación de manuales y FAQ y devolución de fragmentos literales con cita verificable, lo que permite auditar cada respuesta sin riesgo de paráfrasis inventada.
- Verificación de citas en flujos jurídicos o normativos: el modelo devuelve el span exacto y los offsets, de modo que un revisor humano puede localizar la fuente en el documento original en milisegundos.
- Extracción de datos estructurados de documentos (fechas, importes, entidades) gracias al recorte específico por tipo de pregunta, útil en procesamiento de facturas o contratos.
- Búsqueda documental de bajo coste en entornos con restricciones de infraestructura: al ejecutarse en CPU con 3-20 ms por consulta, encaja en servicios con miles de peticiones diarias y presupuesto mínimo.
- Filtrado previo en pipelines RAG con LLM: usar Mega-RAM como primera etapa de recuperación y abstención para descartar consultas sin evidencia antes de invocar un modelo generativo costoso.
- Despliegue en entornos air-gapped o embebidos: sin GPU, sin descargas de modelos grandes y con 130 KB de pesos comprimidos, puede integrarse en dispositivos con recursos muy limitados.
- Asistencia sobre corpus multilingües inglés-árabe en contextos de documentación técnica o administrativa.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index; no verificados de forma independiente.

| Dataset | Métrica | Valor |
|---|---|---|
| CRAG v4 (muestra de 50 registros, test) | Exact Match | 0,0 |
| CRAG v4 (muestra de 50 registros, test) | Token F1 | 0,0318 |
| RAGBench hotpotqa (n=200, test) | Recall@5 | 1,0 |
| RAGBench hotpotqa (n=200, test) | nDCG@10 | 0,9192 |
| RAGBench hotpotqa (n=200, test) | Faithfulness (quoted) | 1,0 |
| RAGBench hotpotqa (n=200, test) | Citation Accuracy | 0,9286 |
| RAGBench msmarco (n=200, test) | Recall@5 | 0,7024 |
| RAGBench msmarco (n=200, test) | nDCG@10 | 0,8696 |
| RAGBench msmarco (n=200, test) | Faithfulness (quoted) | 1,0 |
| RAGBench msmarco (n=200, test) | Citation Accuracy | 0,7010 |

El contraste entre los resultados de recuperación (Recall@5 de 1,0 en hotpotqa) y los de respuesta extractiva en CRAG (EM de 0,0 y F1 de 0,0318) sugiere que el sistema recupera bien pero falla al aislar el span exacto esperado por la métrica. La faithfulness de 1,0 es coherente con el diseño: toda respuesta es una cita literal.

## Requisitos de hardware

- VRAM: no requiere GPU; los pesos ocupan 343 KB en fp32 y 130 KB comprimidos.
- CPU: cualquier procesador convencional; dependencias limitadas a `numpy` y `scipy`.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: irrelevante, el modelo no usa aceleración por GPU.
- Despliegue: carga mediante el loader incluido (`modeling_megaram.load`) o el paquete fuente (`MegaRAM.load`); no es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de transformer.
- Latencia: 3-20 ms por consulta en CPU (P50, según el autor).
- Coste declarado: aproximadamente 0,0006 USD por cada 1.000 consultas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mega-RAM 100k | 85.654 (0 entrenados) | 10M tokens de memoria externa | RAG extractivo con citas, sin generación | MIT | Hugging Face |
| LLM pequeños para RAG (p. ej. variantes de 1-3B) | Miles de millones | 4k-32k tokens típicos | Generación aumentada con recuperación | Variable | Hugging Face |
| Recuperadores densos tipo BEIR (p. ej. basados en sentence-transformers) | 20M-110M | No aplica (retrieval) | Recuperación densa únicamente | Variable | Hugging Face |
| Sistemas BM25 puros (p. ej. Lucene, rank_bm25) | 0 (índice invertido) | No aplica | Recuperación léxica | Variable | Librerías |

No se dispone de comparaciones directas publicadas con alternativas equivalentes en el material proporcionado. La comparación con LLM generativos no es homogénea: Mega-RAM no genera texto y no puede sustituir a un modelo de lenguaje en tareas abiertas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre ni dispone de conocimiento del mundo; toda respuesta depende del corpus indexado por el usuario.
- Los benchmarks publicados son declarados por el autor, no verificados, y algunos usan muestras pequeñas (50 registros en CRAG, 200 en RAGBench).
- El rendimiento extractivo en CRAG es muy bajo (EM de 0,0, F1 de 0,0318), lo que indica dificultades para producir el span exacto esperado por métricas de QA convencionales.
- Cobertura lingüística limitada a inglés y árabe; el comportamiento en otros idiomas no está documentado.
- La recuperación en msmarco muestra un Recall@5 de 0,7024, sensiblemente inferior al de hotpotqa, lo que sugiere variabilidad según el dominio del corpus.
- El pipeline de ingesta multimodal (OCR, PDF, DOCX, imágenes, vídeo) no está incluido en el repositorio de Hugging Face y requiere instalar el proyecto fuente.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso; no apto para flujos conversacionales generativos.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre precisión en dominios críticos; conviene validar con evaluaciones propias antes de producción.
- El modelo no ha recibido entrenamiento, por lo que no hay sesgos aprendidos de datos, pero tampoco mecanismos de calibración estadística más allá de la abstención programada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/racore/mega-ram-100k
- Paper referenciado en los tags (Weights-Space Programming): arXiv 2611.09382
- Dataset BeIR/scifact: https://huggingface.co/datasets/BeIR/scifact
- Dataset BeIR/nfcorpus: https://huggingface.co/datasets/BeIR/nfcorpus
- Dataset galileo-ai/ragbench: https://huggingface.co/datasets/galileo-ai/ragbench
- Dataset Quivr/CRAG: https://huggingface.co/datasets/Quivr/CRAG
