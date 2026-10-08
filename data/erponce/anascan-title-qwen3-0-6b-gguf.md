# erponce/anascan-title-qwen3-0.6b-GGUF

" empty. 

I'll include the context but clearly label it as derived from the base model. Actually, given strict rules, I'll mark it as "No disponible en la ficha del autor; heredada del modelo base Qwen3-0.6B (32.768 tokens en Qwen3)". Hmm, I think a reasonable senior editor would state the base model's context. I'll do it with the caveat.

Parametros activos: N/A (dense). The row says "solo si es MoE". Since it's dense, I'll omit or say "no aplica (modelo denso)".

Tipos de cuantizacion: The repo includes Q4_K_M (v11), plus earlier v6 and v7 files. Repo size 1.2 GB suggests several files. I'll say the file is Q4_K_M; other quantizations no disponibles. Actually "the earlier v6 and v7 files stay in the repository" — those are also probably Q4_K_M? Not specified. I'll say: Q4_K_M (archivo principal); el repo conserva versiones anteriores v6 y v7, cuantizacion no especificada.

Formato de pesos: GGUF (Q4_K_M, con tied output embeddings); safetensors del modelo base no incluidos.

Benchmarks table: include v7 and v11 results, plus per-document set.

Comparativa con modelos similares: no disponible? We could compare with base Qwen3-0.6B and maybe other small models. But since no data, I'll indicate "no disponible" for comparable fine-tunes. Maybe compare with base Qwen3-0.6B in terms of params/context/license, noting no benchmark data for the base on this task. Hmm, that's a reasonable comparison. Let me include a table with this model vs base Qwen3-0.6B (Qwen/Qwen3-0.6B) and note that other task-specific models are not available.

Requisitos de hardware:
- Model file 396.7 MB (Q4_K_M), so ~0.4 GB. RAM/VRAM needed: ~500 MB-1 GB.
- Runs on CPU via llama.cpp; no GPU needed.
- Phone: Samsung Galaxy S22 Ultra (Snapdragon 8 Gen 1), Snapdragon 665 tablet.
- Fits in any consumer GPU with 1 GB+ VRAM, and in CPU-only.
- Deployment: llama.cpp, and GGUF-compatible runtimes (llama.cpp, Ollama, LM Studio etc.) — but only llama.cpp confirmed. I'll mention llama.cpp confirmed, and other GGUF runtimes as generally compatible but not verified.
- Latency: 4.7 s per page on S22 Ultra, 14.6 s on Snapdragon 665 tablet.
- Throughput: no disponible.

Capacidades: text generation, naming documents, es/en, no thinking mode (disabled), instruction-following for a specific prompt, refuses/returns empty for unreadable text, no tool calling, no vision (OCR is external), etc.

Casos de uso: at least 6 concrete cases. Given it's a tiny on-device naming model:
1. Nombrado automático de documentos escaneados en apps móviles.
2. Archivado y clasificación personal.
3. Preprocesado de pipelines de digitalización (batch).
4. Cumplimiento de privacidad / RGPD (on-device).
5. Integración en apps de escaneo sin conexión.
6. Filtrado de calidad de OCR (detectar páginas ilegibles).
7. Generación de metadatos para sistemas de gestión documental.
8. Uso como componente en agentes de escaneo.

Limitaciones: from the card (cut off) plus general: hallucination of names, misspellings due to DPO, evidence limited to 600 chars, no benchmarks beyond the judge, judge is a LLM, license apache-2.0 so commercial use OK with attribution, Spanish docs... (cut off). I should note the card is truncated.

Enlaces: HF model URL, base model URL, FinePDFs (assuming https://huggingface.co/datasets/HuggingFaceFW/finepdfs), DocLayNet (https://huggingface.co/datasets/docling-project/DocLayNet-v1.2), llama.cpp repo (https://github.com/ggml-org/llama.cpp), Qwen3 blog (https://qwenlm.github.io/blog/qwen3/). Hmm, careful with inventing links. The HF dataset links follow the given identifiers, likely correct. llama.cpp repo URL — I know it's github.com/ggml-org/llama.cpp (formerly ggerganov). I'll include but maybe label. I'll include only ones reasonably derivable. Qwen3 blog — known. I'll include as "blog de Qwen3" — hmm, risk. I'll include: Qwen3 GitHub (https://github.com/QwenLM/Qwen3). These are well-known. I think it's acceptable but I should be careful. I'll include them since they help readers, but perhaps note they're external references. Actually the spec says include links found in the search — no search here. I'll include the links present in the info plus derivable official ones.

Actually, to comply with "no inventes datos", I'll include only links that are directly present in the info (HF model, base model) and the dataset/repo identifiers converted to HF URLs (which is the standard form). And llama.cpp. I think it's fine.

Note: dates 2026-10 — the model created 2026-10-06. Odd future date but that's the data.

Let me write the ficha.

Resumen: 2-3 paragraphs, 6-10 lines.

Specs table:

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), fine-tune supervisado + DPO sobre Qwen/Qwen3-0.6B |
| Parametros totales | 596.049.920 (~0,6 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada por el autor; hereda la del modelo base Qwen3-0.6B. En la practica el prompt de inferencia se limita a ~600 caracteres de evidencia OCR |
| Tipos de cuantizacion | Q4_K_M (archivo principal, con importance matrix de 700 prompts); el repo conserva tambien las versiones v6 y v7 |
| Idiomas soportados | espanol (es) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); embeddings de salida atados (tied output) |

Wait, "Tipos de cuantizacion" — table says include "no disponible" if not available. I'll put Q4_K_M.

For context length, I might put "no disponible". But the required row. Hmm. I'll write "no disponible (el autor no la especifica; el modelo base Qwen3-0.6B soporta 32.768 tokens)". That's honest.

Arquitectura y entrenamiento: describe two-stage training in detail.

Write it now. Use castellano de España, no emojis, only first word of headings capitalized. Headings are given: "## Especificaciones tecnicas" etc.

Let me make sure numbers are exact.

Training data details:
- FinePDFs (HuggingFaceFW/finepdfs), español e inglés, ODC-By 1.0
- DocLayNet v1.2 (docling-project/DocLayNet-v1.2), CDLA-Permissive-1.0
- Páginas ilegibles (OCR invertido)
- Documentos personales generados por el profesor

Fine-tuning:
- Stage 1: LoRA rank 16, alpha 32, todas las proyecciones de atención y MLP, una época sobre 26.330 pares de 10.175 documentos (1.224 páginas ilegibles), LR 2e-4, batch efectivo 16, fusionado en pesos BF16 (v7)
- Stage 2: DPO, β 0,1, todos los pesos, más 0,2x la probabilidad del nombre preferido, dos rondas (3.721 + 400 pares, luego 1.995 + 400), LR 3e-6 luego 2e-6
- Nombres escritos por un modelo profesor Qwen3.8-27B

Curado: teacher Qwen3.8-27B generó nombres del texto limpio; se conservaron solo si los chequeos del móvil los aceptaban.

Evaluation: 1.163 documentos held-out: 633 páginas PDF reales (FinePDFs), 242 DocLayNet, 288 documentos personales generados. Juez Qwen3.8-27B.

Table:
| Modelo | Good | Usable | Named | Páginas ilegibles nombradas |
| v7 | 53,4% | 92,5% | 96,2% | 0 de 116 |
| v11 | 59,7% | 95,6% | 98,4% | 0 de 116 |

Note about Spanish decimal separator: I'll use comma for decimals since castellano. Hmm, but mixing "4,7 s". Yes, use comma.

Per-set: v11 good: PDF reales 53,0% (v7 48,3%), DocLayNet 54,6% (v7 50,8%), personales 78,8% (v7 66,7%).

Judge prefers v11 on 200 documents and v7 on 99. Words in v11 names not in document: 4,5% (v7 6,8%). Average name length 6,6 words (v7 5,9). First answer of the quantized file with llama.cpp: 58,7% good (v7 50,5%), no name for all 116 unreadable pages. Grader agrees with judge on 83% of held-out ratings.

Speed: S22 Ultra ~4,7 s per page (reading ~3,8 s). Snapdragon 665 tablet: 14,6 s with one correction.

Now headings: "## Resumen", "## Especificaciones tecnicas", "## Arquitectura y entrenamiento", "## Capacidades", "## Casos de uso", "## Benchmarks y rendimiento", "## Requisitos de hardware", "## Comparativa con modelos similares", "## Limitaciones y advertencias", "## Enlaces".

Write.

Comparison table: this model vs base Qwen3-0.6B. And note other task-specific alternatives not available.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
| anascan-title-qwen3-0.6b (v11) | 596 M | no especificado (base 32.768) | nombrado de documentos | Apache-2.0 | GGUF, 116 descargas |
| Qwen/Qwen3-0.6B | 596 M (0,6 B) | 32.768 tokens nativos | proposito general | Apache-2.0 | safetensors, ampliamente usado |
| Alternativas especificas de nombrado de documentos | no disponible | no disponible | ... |

Hmm the base context 32.768 — I'm fairly confident. I'll mark it as "32.768 (dato del modelo base, no verificado en esta ficha)". Fine.

Also the model card file name: anascan-title-0.6b-v11-q4_k_m.gguf, 396.704.768 bytes.

Hardware:
- Tamaño del archivo Q4_K_M: 396,7 MB (~0,4 GB). RAM/VRAM estimada para inferencia: ~0,5-1 GB incluyendo contexto y overhead de llama.cpp.
- Funciona en CPU (ARM64) sin GPU.
- Cabe en cualquier GPU de consumo con >=1 GB de VRAM (GTX 1050 Ti, RTX 3060, etc.) — well, "cualquier GPU consumer con al menos 1 GB" is an inference, reasonable. Maybe say "cualquier GPU de consumo con 2 GB o más de VRAM" — I'll phrase carefully.
- Despliegue: llama.cpp (confirmado por el autor, revision 11fe021); otros runtimes GGUF (Ollama, LM Studio, llamafile) no verificados.
- Latencia: 4,7 s/página en Galaxy S22 Ultra; 14,6 s en tablet Snapdragon 665. Throughput: no disponible.
- vLLM/TGI no soportan GGUF de forma nativa — mention that vLLM no soporta GGUF nativamente... actually vLLM has some GGUF support experimentally. I'll say "no confirmado".

Ok write.

For "Capacidades": the model is a narrow fine-tune. Be honest: no tool calling, no agents, no vision (OCR external), no thinking mode (disabled with empty think block).

Casos de uso — 6+ concrete:
1. Nombrado automático de documentos escaneados en apps móviles (Anascan).
2. Archivado personal offline / sin subir datos a la nube (privacidad).
3. Preprocesado en lote de pipelines de digitalización (servidor CPU, llama.cpp).
4. Detección de OCR defectuoso: devuelve nombre vacío en páginas ilegibles (0 de 116).
5. Generación de metadatos para DMS / indexado de expedientes.
6. Clasificación y separación de documentos personales (facturas, recibos, pólizas).
7. Aplicaciones de escaneo en dispositivos con hardware modesto (tablet Snapdragon 665).
8. Módulo auxiliar en flujos de agentes (aunque no soporta tool calling, se puede orquestar externamente).

Limitaciones:
- Sesgos: no documentados explícitamente; el corpus es FinePDFs (es/en) + DocLayNet + documentos generados, por lo que la cobertura fuera de documentos administrativos/técnicos en es/en es limitada.
- Alucinación: 4,5% de palabras en los nombres no aparecen en el documento (v11); DPO introduce erratas ocasionales (p. ej. "2 0 1 9"); los chequeos del móvil no las detectan todas.
- Contexto: solo ~600 caracteres de evidencia.
- Idioma: solo es y en.
- Licencia: Apache-2.0, uso comercial permitido (incluye atribución/aviso de licencia); los datos de entrenamiento tienen licencias ODC-By 1.0 y CDLA-Permissive-1.0 que requieren atribución.
- Evaluación hecha por un juez LLM (Qwen3.8-27B), no por humanos; el grader coincide con el juez en 83%.
- La model card está truncada; no se documentan todas las limitaciones ("Spanish docu...").
- No hay datos de benchmarks estándar (MMLU, HumanEval, GSM8K).
- Modelo muy especializado; no sirve para propósito general.
- 0 likes, 116 descargas: poco rodaje en producción.
- Nombres algo más largos (6,6 palabras).

Enlaces:
- https://huggingface.co/erponce/anascan-title-qwen3-0.6b-GGUF
- https://huggingface.co/Qwen/Qwen3-0.6B
- https://huggingface.co/datasets/HuggingFaceFW/finepdfs
- https://huggingface.co/datasets/docling-project/DocLayNet-v1.2
- https://github.com/ggml-org/llama.cpp

I'll note that no se han encontrado paper ni blog adicionales en la información proporcionada.

Now write the final markdown.## Resumen

Anascan title model es un ajuste fino de Qwen/Qwen3-0.6B (596.049.920 parametros) publicado por el usuario erponce, orientado a una unica tarea: generar un titulo corto y util para un documento escaneado a partir del texto que el OCR del movil extrae. Es el componente de nombrado de Anascan, una aplicacion de escaneo de documentos que se ejecuta en el propio dispositivo: la app descarga el archivo una vez, verifica su tamano y su SHA-256 y lo ejecuta con llama.cpp en el telefono, sin que ningun dato del documento salga del dispositivo.

El modelo parte de la revision `c1899de` de Qwen3-0.6B (Apache-2.0) y se ha entrenado en dos etapas: un ajuste supervisado con LoRA de rango 16 fusionado en los pesos BF16, seguido de dos rondas de DPO sobre todos los pesos. El resultado se distribuye unicamente en GGUF Q4_K_M cuantizado con importance matrix, lo que reduce el archivo a 396.704.768 bytes (unos 0,4 GB) y permite inferencia en CPU de telefono.

Su relevancia es acotada pero clara: no compite como modelo de proposito general, sino como un componente pequeno, multilingue (es/en) y desplegable en dispositivo para una tarea de extraccion de metadatos, con latencias medidas de 4,7 s por pagina en un Galaxy S22 Ultra. La model card es explicita sobre su alcance: 3-8 palabras por titulo, basadas solo en ~600 caracteres de evidencia, y respuesta vacia cuando el texto es ilegible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); fine-tune supervisado (LoRA) + DPO sobre Qwen/Qwen3-0.6B |
| Parametros totales | 596.049.920 (~0,6 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion del autor; la inferencia usa ~600 caracteres de evidencia OCR como maximo |
| Tipos de cuantizacion | GGUF Q4_K_M (con importance matrix generada a partir de 700 prompts de entrenamiento); el repositorio conserva ademas las versiones anteriores v6 y v7 |
| Idiomas soportados | espanol (es) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF con embeddings de salida atados (tied output); no se distribuyen pesos safetensors |

Datos adicionales del archivo principal: `anascan-title-0.6b-v11-q4_k_m.gguf`, 396.704.768 bytes, SHA-256 `4edd65b18f731080a8623e6108c3d8f514766ed9b77b2bd2be615828f8f01531`. Tamano del repositorio: 1,2 GB. Descargas: 116. Likes: 0.

## Arquitectura y entrenamiento

La base es Qwen3-0.6B, un transformer denso de la familia Qwen3, aqui especializado mediante dos etapas de ajuste. La primera es supervisada: LoRA de rango 16 y alpha 32 aplicado a todas las proyecciones de atencion y MLP, una epoca sobre 26.330 pares procedentes de 10.175 documentos (1.224 de ellos paginas ilegibles), tasa de aprendizaje 2e-4 y batch efectivo 16, con los adaptadores fusionados despues en los pesos BF16 (esta version corresponde a v7). La segunda etapa es DPO con beta 0,1 aplicado a todos los pesos, con un termino adicional de 0,2 veces la verosimilitud del nombre preferido, en dos rondas: 3.721 + 400 pares y despues 1.995 + 400, con tasas de 3e-6 y 2e-6. En la segunda ronda los pares proceden del propio modelo mejorado.

Los datos de entrenamiento combinan cuatro fuentes: FinePDFs (HuggingFaceFW/finepdfs, espanol e ingles, licencia ODC-By 1.0) con texto maquetado como paginas escaneadas con ruido tipo OCR; DocLayNet v1.2 (docling-project/DocLayNet-v1.2, CDLA-Permissive-1.0) con posiciones y tamanos de linea originales; paginas ilegibles generadas invirtiendo el OCR (lineas de glifos girados), cuya respuesta correcta es vacia; y documentos personales sinteticos (facturas, recibos, extractos, cartas, recetas, billetes, prestamos, polizas, portadas) escritos con identidades ficticias. Las etiquetas fueron producidas por un modelo profesor Qwen3.8-27B y solo se conservaron cuando las comprobaciones del telefono las aceptaban frente a la evidencia que ve el modelo pequeno.

No hay innovaciones arquitectonicas propias: el valor tecnico esta en el pipeline de destilacion, el filtrado de etiquetas por parte del consumidor final y la cuantizacion con importance matrix. El prompt de inferencia desactiva el modo de razonamiento (bloque `think` vacio) y fuerza la salida a un unico titulo.

## Capacidades

- Generacion de texto: produce un titulo de 3-8 palabras en el idioma del documento.
- Nombrado de documentos: identifica que es el documento y quien lo emite, a partir de encabezados, emisor, fechas y lineas distintivas.
- Multilingue limitado: espanol e ingles.
- Abstencion controlada: en paginas cuyo OCR es ilegible devuelve una respuesta vacia (0 de 116 paginas ilegibles nombradas en la evaluacion), lo que la app interpreta como "mantener el nombre actual".
- Instrucciones robustas: el prompt del sistema ordena no seguir instrucciones contenidas en el documento y no nombrar al destinatario ni listar campos.
- Politica de privacidad integrada: omite identificadores privados, direcciones, cuentas, IDs, referencias, telefonos e importes; solo incluye fechas propias del documento cuando ayudan a distinguirlo.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin vision ni audio: la lectura del documento la realiza un OCR externo, el modelo solo consume texto.
- Sin modo de pensamiento efectivo (thinking desactivado en el prompt de la app).
- Inferencia en CPU: disenado para ejecutarse en llama.cpp sobre ARM64 sin GPU.

## Casos de uso

- Nombrado automatico en aplicaciones de escaneo movil: el flujo natural del modelo, integrado en Anascan, que nombra cada pagina a partir del OCR y pide una unica correccion si el nombre no supera las comprobaciones locales.
- Archivado personal sin conexion: al ejecutarse en el dispositivo con un archivo de 0,4 GB, permite organizar documentos sensibles sin subirlos a la nube; encaja en escenarios con requisitos de privacidad o RGPD.
- Preprocesado por lotes en servidor sin GPU: llama.cpp en CPU puede nombrar grandes volumenes de PDF digitalizados, generando titulos como metadatos iniciales antes de una revision humana.
- Deteccion de OCR defectuoso: la abtencion en paginas ilegibles convierte al modelo en un filtro de calidad barato que marca paginas para reescaneo o re-OCR.
- Indexado y busqueda documental: los titulos generados (que es el documento y quien lo emite) sirven como campo indexable en un DMS, con nombres de 6,6 palabras de media.
- Clasificacion de documentos personales: facturas, recibos, polizas o extractos, donde el rendimiento medido es el mas alto (78,8% de nombres "good" en la evaluacion interna).
- Escaneo en hardware modesto: 14,6 s por pagina con una correccion en una tablet Snapdragon 665 con codigo ARMv8.0 generico, lo que permite desplegarlo en dispositivos de gama baja.
- Componente auxiliar en pipelines de digitalizacion: se puede orquestar externamente como paso previo de nombrado, aunque el modelo en si no soporta tool calling.

## Benchmarks y rendimiento

Evaluacion sobre 1.163 documentos reservados nunca usados en entrenamiento: 633 paginas PDF reales (FinePDFs), 242 paginas DocLayNet y 288 documentos personales generados. Se evalua con el flujo de la app (primera respuesta, una correccion y las comprobaciones locales) y un modelo juez Qwen3.8-27B compara cada nombre con la referencia del profesor ("good" = igual de util; "usable" = good o ligeramente mas vago).

| Modelo | Good | Usable | Nombrados | Paginas ilegibles nombradas |
|---|---|---|---|---|
| v7 | 53,4% | 92,5% | 96,2% | 0 de 116 |
| v11 (este archivo) | 59,7% | 95,6% | 98,4% | 0 de 116 |

Desglose de v11 por conjunto (good): PDF reales 53,0% (v7 48,3%), DocLayNet 54,6% (v7 50,8%), personales 78,8% (v7 66,7%). En comparacion directa, el juez prefiere v11 en 200 documentos y v7 en 99. Palabras de los nombres de v11 que no aparecen en el documento: 4,5% (v7 6,8%). Los nombres son algo mas largos: 6,6 palabras de media frente a 5,9 en v7. Con el archivo cuantizado y llama.cpp, la primera respuesta alcanza 58,7% good (50,5% en el archivo de v7) y no se genera ningun nombre en las 116 paginas ilegibles. El grader usado en entrenamiento coincide con el juez en el 83% de las valoraciones reservadas; todas las cifras anteriores las produce el juez, no el grader.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Tamano del archivo principal: 396,7 MB (GGUF Q4_K_M con embeddings atados); el repositorio completo ocupa 1,2 GB por incluir las versiones v6 y v7.
- VRAM/RAM estimada para inferencia: aproximadamente 0,5-1 GB, incluyendo contexto y sobrecarga de llama.cpp. Es un margen estimado a partir del tamano del archivo, no un dato publicado por el autor.
- GPU recomendadas: no disponible; el modelo esta pensado para CPU. Cualquier GPU de consumo con 1-2 GB de VRAM libres puede alojarlo, pero no hay datos de rendimiento en GPU publicados.
- CPU: es el destino previsto. El autor reporta ejecucion en un Samsung Galaxy S22 Ultra con el codigo llama.cpp por CPU de la app (producto escalar) y en una tablet Snapdragon 665 con codigo ARMv8.0 estandar.
- Latencia medida: ~4,7 s por pagina en Galaxy S22 Ultra (de los cuales ~3,8 s son lectura del modelo); ~14,6 s por pagina con una correccion en la tablet Snapdragon 665.
- Throughput: no disponible.
- Opciones de despliegue: llama.cpp (confirmado por el autor, revision `11fe021`, con `convert_hf_to_gguf.py` y `llama-quantize`). Otros runtimes compatibles con GGUF (Ollama, LM Studio, servidores de inferencia GGUF) no estan verificados en la informacion disponible. vLLM y TGI: no confirmado.

## Comparativa con modelos similares

No hay datos publicados de alternativas directas de nombrado de documentos en la informacion disponible. La unica comparacion documentada es contra la version anterior del propio modelo (v7) y contra el modelo base.

| Modelo | Parametros | Contexto | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| anascan-title-qwen3-0.6b (v11, este) | 596,0 M | no especificado por el autor; evidencia de ~600 caracteres | Nombrado de documentos escaneados (es/en) | Apache-2.0 | GGUF Q4_K_M, 116 descargas |
| anascan-title-qwen3-0.6b (v7, en el mismo repositorio) | 596,0 M | igual | igual | Apache-2.0 | GGUF, en el mismo repo; 53,4% good y 92,5% usable |
| Qwen/Qwen3-0.6B (modelo base) | 596,0 M | 32.768 tokens nativos en la familia Qwen3 (dato del modelo base, no confirmado en esta ficha) | Proposito general (texto, razonamiento, codigo) | Apache-2.0 | Safetensors, ampliamente distribuido |
| Otras alternativas especificas de nombrado de documentos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance de la evidencia: los nombres se basan solo en los ~600 caracteres que la app selecciona; con mas contexto del documento el resultado podria mejorar, segun el propio autor.
- Erratas por el entrenamiento de preferencias: el DPO introduce ocasionalmente errores de escritura, por ejemplo un numero escrito como "2 0 1 9"; las comprobaciones de la app detectan algunos, no todos.
- Alucinacion: el 4,5% de las palabras de los nombres de v11 no aparecen en el documento, frente al 6,8% de v7. El problema esta mitigado, no eliminado.
- Idiomas: solo espanol e ingles. No hay evaluacion en otros idiomas.
- Dominio: entrenado sobre PDF reales y documentos personales sinteticos; la cobertura fuera de documentos administrativos, tecnicos o personales en es/en es limitada y no esta medida.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible. El corpus de documentos generados usa identidades ficticias, lo que no garantiza ausencia de sesgos de representacion.
- Evaluacion no humana: todas las cifras de rendimiento las produce un modelo juez (Qwen3.8-27B). El grader interno coincide con el juez en el 83% de las valoraciones, lo que deja un margen de error no cuantificado sobre el resto.
- La model card proporcionada esta truncada en la seccion de limitaciones (corta en "Spanish docu"), por lo que pueden faltar advertencias adicionales del autor.
- Licencia: Apache-2.0 permite uso comercial con las obligaciones habituales de aviso y atribucion. Los datos de entrenamiento tienen licencias propias (ODC-By 1.0 para FinePDFs y CDLA-Permissive-1.0 para DocLayNet) que exigen atribucion; conviene revisarlas antes de redistribuir derivados.
- Madurez: 116 descargas y 0 likes en el momento de redactar la ficha; no hay evidencia de despliegues en produccion ajenos al autor.
- Uso fuera de proposito: el modelo no soporta tool calling, agentes ni vision; emplearlo como modelo conversacional general dara resultados pobres.
- No hay resultados en benchmarks estandar, por lo que la comparacion con otros modelos pequenos solo puede hacerse por tamano, licencia y contexto, no por calidad medida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/erponce/anascan-title-qwen3-0.6b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset FinePDFs (HuggingFaceFW/finepdfs, ODC-By 1.0): https://huggingface.co/datasets/HuggingFaceFW/finepdfs
- Dataset DocLayNet v1.2 (docling-project/DocLayNet-v1.2, CDLA-Permissive-1.0): https://huggingface.co/datasets/docling-project/DocLayNet-v1.2
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp

No se han encontrado en la informacion disponible papers, blogs tecnicos, repositorios adicionales ni demos publicadas por el autor.
