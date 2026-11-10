# mradermacher/NQLSG-Qwen2.5-14B-MegaFusion-TIES-3-GGUF

## Resumen

NQLSG-Qwen2.5-14B-MegaFusion-TIES-3 es un modelo de lenguaje de 14.765.947.904 parámetros (aproximadamente 14,8 mil millones) obtenido mediante la fusión de modelos derivados de Qwen2.5-14B. El modelo original fue creado por el usuario Lunzima y esta versión concreta es una cuantización estática en formato GGUF publicada por mradermacher, un conocido cuantizador de la comunidad de Hugging Face. La técnica de fusión empleada es TIES (Trim, Elect, Merge), una metodología de mergekit que combina los pesos de varios modelos base resolviendo conflictos de parámetros mediante poda de valores atípicos y elección de signo.

El modelo resuelve el problema de obtener un checkpoint único que herede capacidades de varios modelos especializados sin necesidad de entrenamiento adicional, algo relevante para quienes quieren un modelo de propósito general afinado en la comunidad sin coste de entrenamiento. Su relevancia actual radica en que ofrece el rendimiento base de la familia Qwen2.5 (arquitectura transformer densa, contexto nativo de 32.768 tokens ampliable a 131.072 con RoPE scaling) en un formato GGUF listo para ejecutarse en llama.cpp, Ollama y otros runners de inferencia local.

Al ser una cuantización de un merge comunitario, la documentación es escasa: no se publican datos de entrenamiento, benchmarks propios ni licencia explícita en la información disponible. El modelo está etiquetado únicamente para inglés y orientado a uso conversacional, con 36 descargas y 1 like en el momento de la consulta, lo que indica una adopción muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-14B) |
| Parametros totales | 14.765.947.904 (14,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-14B soporta 32.768 tokens nativos y hasta 131.072 con RoPE scaling |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamano del repo | 102,0 GB |
| Metodo de creacion | Merge TIES con mergekit |
| Modelo base | Lunzima/NQLSG-Qwen2.5-14B-MegaFusion-TIES-3 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B: un transformer decoder-only denso con atención de múltiples cabeceras con consultas agrupadas (GQA), normalización RMSNorm, activación SwiGLU y embeddings de tokens de gran tamaño. Sobre esa base, el modelo original de Lunzima aplica una fusión TIES mediante mergekit: se toman varios checkpoints derivados de Qwen2.5-14B, se podan los parámetros con desviaciones más extremas respecto a la media, se elige el signo dominante de cada parámetro y se combinan los pesos resultantes. Este proceso no requiere entrenamiento adicional y produce un checkpoint único que mezcla las capacidades de los modelos fusionados.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en los modelos que componen la fusión. Tampoco se documentan innovaciones técnicas propias más allá del propio método TIES. La cuantización realizada por mradermacher es estática (sin imatrix), y el autor indica explícitamente que las cuantizaciones ponderadas por imatrix no están disponibles en el momento de la publicación; las cuantizaciones IQ4_XS y el resto de tipos K-quant se generaron con el pipeline estándar de llama.cpp.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo.
- Razonamiento general y respuesta a instrucciones heredado de Qwen2.5-14B.
- Generación de código y matemáticas (capacidades del modelo base, no verificadas en esta fusión concreta).
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta fusión; el modelo base Qwen2.5 lo soporta.
- Soporte de agentes y razonamiento multi-paso: no confirmado para esta fusión.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma de la model card; el modelo base Qwen2.5 es multilingüe, pero la fusión no lo declara.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantización Q4_K_M (9,1 GB) el modelo cabe en GPUs de consumo de 12 GB o más, lo que permite levantar un chatbot de diálogo en una estación de trabajo sin depender de la nube.
- Evaluación de técnicas de fusión de modelos: investigadores que estudian TIES y mergekit pueden usar este checkpoint como referencia práctica para comparar el comportamiento de un merge frente a los modelos originales.
- Generación de texto en pipelines de CI/CD para pruebas: al ser un GGUF ligero (desde 5,9 GB en Q2_K), se puede integrar en tests automatizados de generación de texto sin consumir grandes recursos.
- Despliegue en entornos con VRAM limitada: las cuantizaciones Q3_K_S (6,8 GB) e IQ4_XS (8,3 GB) permiten ejecución en GPUs de 8 GB, útil para demos y entornos de desarrollo.
- Experimentación con llama.cpp y Ollama: el formato GGUF permite cargar el modelo directamente en estos runners para comparar latencia y calidad entre niveles de cuantización.
- Fine-tuning ligero sobre un checkpoint ya fusionado: al ser un modelo denso de 14,8 B, se puede usar como punto de partida para LoRA/QLoRA en tareas específicas de inglés, aunque la licencia no está clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~5,9 GB; Q3_K_S ~6,8 GB; Q3_K_M ~7,4 GB; Q3_K_L ~8,0 GB; IQ4_XS ~8,3 GB; Q4_K_S ~8,7 GB; Q4_K_M ~9,1 GB; Q5_K_S ~10,4 GB; Q5_K_M ~10,6 GB; Q6_K ~12,2 GB; Q8_0 ~15,8 GB. Añadir margen para el contexto KV cache (crece con la longitud de contexto).
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q6_K y Q8_0 con contexto amplio; RTX 4070 Ti / 4080 (12-16 GB) para Q4_K_M y Q5_K_M; GPUs de 8 GB para Q3_K_S e IQ4_XS con contexto moderado; A100/H100 solo si se busca throughput alto con contexto muy largo.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q5_K_M en GPUs de 8-12 GB; Q6_K y Q8_0 requieren 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runner compatible con GGUF; también es compatible con endpoints (tag `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NQLSG-Qwen2.5-14B-MegaFusion-TIES-3 (este) | 14,8 B | no disponible (base 32.768) | no disponible | GGUF | Merge TIES comunitario, solo inglés |
| Qwen2.5-14B-Instruct | 14,8 B | 32.768 (131.072 con RoPE scaling) | Apache 2.0 | safetensors, GGUF | Modelo oficial, multilingüe, benchmarks publicados |
| Qwen2.5-Coder-14B | 14,8 B | 32.768 (131.072 con RoPE scaling) | Apache 2.0 | safetensors, GGUF | Especializado en código, benchmarks publicados |
| Llama 3.1 8B Instruct | 8,0 B | 131.072 | Llama 3.1 Community License | safetensors, GGUF | Menor tamaño, contexto mayor, licencia con restricciones |

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; hay que verificar la licencia del modelo base Qwen2.5 (Apache 2.0) y la del merge original antes de usarlo en producción.
- Al ser una fusión TIES sin evaluación publicada, el rendimiento real puede degradarse respecto a los modelos originales en tareas específicas; no hay benchmarks que lo respalden.
- Solo etiquetado para inglés: el comportamiento en castellano u otros idiomas no está garantizado y probablemente sea inferior al del Qwen2.5 original.
- Riesgo de alucinación: inherente a los modelos de 14 B sin verificación factual; no hay datos de mitigación en esta fusión.
- Sesgos: no documentados; hereda los sesgos de los modelos fusionados, que no se especifican.
- Contexto: no se declara en la model card; asumir el del modelo base (32.768 tokens) es una suposición, no un dato confirmado.
- Adopción muy baja (36 descargas, 1 like): poca validación por parte de la comunidad.
- Cuantizaciones estáticas sin imatrix: el autor indica que las versiones ponderadas por imatrix no están disponibles, lo que puede afectar a la calidad en cuantizaciones bajas (Q2_K, Q3_K_S).
- El repo ocupa 102 GB por incluir todas las cuantizaciones; descargar solo el archivo GGUF necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/NQLSG-Qwen2.5-14B-MegaFusion-TIES-3-GGUF
- Modelo base (merge original): https://huggingface.co/Lunzima/NQLSG-Qwen2.5-14B-MegaFusion-TIES-3
- Página de resumen del cuantizador: https://hf.tst.eu/model#NQLSG-Qwen2.5-14B-MegaFusion-TIES-3-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico de comparación de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
