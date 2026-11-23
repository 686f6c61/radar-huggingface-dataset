# frankmorales2020/muse-glimmer-30b-topo-governed-cbp-fineweb-gguf

## Resumen

Muse-Glimmer-30B Topo-Governed CBP (FineWeb) GGUF es una conversión a formato GGUF del modelo base `frankmorales2020/muse-glimmer-30b-topo-governed-cbp-fineweb`, cuantizada a Q4_K_M mediante llama.cpp. El modelo lo desarrolla el autor independiente frankmorales2020 (Sovereign Machine Laboratory, SOMALA) y se presenta como una demostración de Topological Continual Backpropagation (Topo-CBP), una técnica propietaria que, según su autor, elimina el olvido catastrófico anclando la dinámica de gradientes a coordenadas armónicas de números primos y a una constante de atenuación de Euler.

El modelo base es una adaptación del que el autor denomina "modelo base de 30 mil millones de parámetros de Meta", entrenada sobre HuggingFaceFW/fineweb sin uso de adaptadores PEFT/LoRA. El recuento real de parámetros en safetensors es de 27.854.794.240 (aproximadamente 27,85 mil millones). Esta variante GGUF es exclusivamente de texto: la multimodalidad del modelo original no se conserva en esta conversión.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto de 16,9 GB que puede ejecutarse íntegramente en CPU sobre RAM convencional, lo que lo hace interesante para despliegues de borde sin GPU. Por otro, conviene tratarlo con cautela: las afirmaciones del autor sobre invariancia bit a bit y conservación topológica tras la cuantización a 4 bits no están respaldadas por benchmarks independientes ni por resultados estándar publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base de 30B según el autor; detalles de capas y atención no disponibles) |
| Parametros totales | 27.854.794.240 (según safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 2048 tokens en el ejemplo de inferencia de la model card (máximo nativo no disponible) |
| Tipos de cuantizacion | Q4_K_M (4 bits, formato GGUF); el modelo base en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (según metadatos; la model card remite a la licencia del modelo base) |
| Formato de pesos | GGUF (archivo `muse-glimmer-30b-card-faithful-Q4_K_M.gguf`); base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del transformer (número de capas, dimensión oculta, tipo de atención, uso de RoPE o GQA). El autor describe el modelo base como una adaptación del "modelo base de 30 mil millones de parámetros de Meta", sin especificar cuál. El entrenamiento se realizó sobre el dataset HuggingFaceFW/fineweb bajo el régimen Topo-CBP, que según el autor ancla los operadores lineales a coordenadas armónicas de primos (2, 3, 5, 7, 11, 13) moduladas por la constante de atenuación de Euler (Λ ≈ 0,9785142874). No se indica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

La innovación declarada es Topo-CBP como alternativa a experience replay, regularización de pesos (EWC/SI) y adaptadores LoRA/PEFT, con el objetivo de preservar el conocimiento previo durante el aprendizaje continuo sin congelar parámetros ni acumular deuda de adaptadores. El autor afirma una "invariancia de silicio bit a bit" con deriva de coordenadas cero (Δ_drift = 0.000000000000) y un digest SHA-256 del estado que demostraría que los "bloqueos topológicos" sobreviven a la cuantización entera de 4 bits. Estas afirmaciones no van acompañadas de evaluaciones de benchmarks estándar en la información proporcionada.

## Capacidades

- Generación de texto por completación simple (`llama-completion -no-cnv`); el modo chat no está soportado en esta build según la model card.
- Razonamiento y discurso técnico coherente en CPU, según la prueba cualitativa del autor.
- Capacidades multilingües: no documentadas.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Visión: el modelo original es multimodal, pero esta conversión GGUF es solo texto.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Despliegue en CPU sin GPU: el artefacto de 16,9 GB en Q4_K_M cabe en RAM convencional (por ejemplo, 32 GB) y permite inferencia con llama.cpp sin dependencia de CUDA, útil en entornos de borde o air-gapped.
- Experimentación con aprendizaje continuo: sirve como banco de pruebas para estudiar las afirmaciones de Topo-CBP sobre olvido catastrófico, comparando el comportamiento del modelo base bf16 y la versión cuantizada.
- Generación de texto técnico por completación: adecuado para tareas de continuación de documentos, borradores o notas técnicas donde no se requiere modo chat.
- Investigación reproducible: el autor publica notebook, preprint en Zenodo y digest SHA-256, lo que facilita la verificación de artefactos en estudios de reproducibilidad.
- Prototipado de pipelines de inferencia local: integrable con `llama-cpp-python` para servicios ligeros de generación de texto en servidores sin acelerador.
- Docencia y divulgación: ejemplo práctico de cuantización GGUF de un modelo de ~28B y de las limitaciones de ejecutar modelos grandes en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas internas del autor (invariancia bit a bit, deriva cero y digest SHA-256), que no son benchmarks de calidad lingüística ni de razonamiento y no permiten comparación con otros modelos.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo Q4_K_M ocupa 16,9 GB; se recomienda al menos 20-24 GB de RAM para CPU y margen para el contexto.
- GPU recomendadas: no especificadas por el autor; con `n_gpu_layers=-1` puede descargarse a GPU si llama.cpp se compila con CUDA. Una RTX 4090 (24 GB) podría alojar el modelo cuantizado, aunque no hay cifras de rendimiento publicadas.
- Consumer GPU: probablemente viable en GPUs de 24 GB con Q4_K_M; en GPUs de 8-16 GB requeriría offloading parcial o cuantizaciones más agresivas no publicadas.
- Opciones de despliegue: llama.cpp y `llama-cpp-python` (build CPU o CUDA). No se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de tamaño o tarea similar, ni datos de rendimiento que permitan establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Las afirmaciones sobre eliminación del olvido catastrófico e invariancia bit a bit tras cuantización a 4 bits provienen únicamente del autor y no están validadas por evaluaciones independientes ni por benchmarks estándar.
- El modo chat no está soportado en esta build; solo completación de texto.
- La multimodalidad del modelo original se pierde en esta conversión GGUF.
- El contexto probado es de 2048 tokens; no se documenta el máximo nativo ni el comportamiento más allá de ese límite.
- No se documentan idiomas soportados ni calidad multilingüe.
- Riesgo de alucinación no cuantificado; al no haber benchmarks, no puede estimarse su fiabilidad en tareas factuales.
- La licencia declarada es apache-2.0, pero la model card remite a la licencia del modelo base; conviene verificar el repositorio base antes de uso comercial o redistribución.
- El autor referencia un "modelo base de Meta" sin identificarlo; la procedencia exacta de los pesos originales no está clara en la información disponible.
- La build se etiqueta como "card-faithful" y no aplica `lm_head.pt` del repositorio base, lo que puede afectar a la fidelidad respecto al modelo original.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/frankmorales2020/muse-glimmer-30b-topo-governed-cbp-fineweb-gguf
- Modelo base: https://huggingface.co/frankmorales2020/muse-glimmer-30b-topo-governed-cbp-fineweb
- Notebook de conversión GGUF: https://github.com/frank-morales2020/AST/blob/main/muse_gguf_new.ipynb
- Preprint en Zenodo: https://doi.org/10.5281/zenodo.23807796
- Artículo (Medium, finanzas deterministas): https://medium.com/@frankmorales_91352/architecting-deterministic-financial-intelligence-the-financial-pentad-cluster-7138a42c71f3
- Artículo (Medium, pipeline clínico multiagente): https://medium.com/ai-simplified-in-plain-english/the-architecture-of-determinism-governing-the-multi-agent-clinical-pipeline-5d83a08c36a7
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
