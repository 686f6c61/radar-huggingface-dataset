# quantumaikr/max-0.1b-v1

## Resumen

max-0.1b-v1 es un modelo de lenguaje base de 109,5 millones de parámetros desarrollado por quantumaikr, diseñado con el coreano como idioma principal y el inglés como secundario. Su objetivo no es la conversación general, sino servir como punto de partida para funciones industriales pequeñas: clasificación de documentos, enrutamiento de peticiones, extracción de campos y rellenado de formularios. Es un modelo base, sin ajuste por instrucciones, por lo que requiere fine-tuning antes de cualquier uso en producción.

Arquitectura transformer decoder-only de 12 capas, anchura 768, SwiGLU de 2048 y embeddings atados, con nombres de módulos compatibles con `Qwen3ForCausalLM`. La longitud de contexto es de solo 1.024 tokens y el vocabulario de 32.000 entradas está optimizado para coreano con dígitos separados. Se distribuye en safetensors para Transformers y en GGUF (f16 y q4_k_m) para llama.cpp, con licencia Apache-2.0.

Su relevancia actual reside en la eficiencia: el GGUF de 4 bits ocupa 73 MB y funciona en CPU convencional, lo que permite desplegar tareas de clasificación y extracción en entornos sin GPU. El entrenamiento acumula 10.000 millones de tokens sobre datos coreanos e ingleses con licencia ODC-By 1.0, y el autor publica checkpoints intermedios con estado del optimizador para continuar el preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (compatible con `Qwen3ForCausalLM`), 12 capas, anchura 768, SwiGLU 2048, RoPE, QK-norm, embeddings atados |
| Parametros totales | 109.531.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | f16 (GGUF, 221 MB) y q4_k_m (GGUF 4 bits, 73 MB); safetensors en precisión nativa |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache-2.0 (pesos); datos de entrenamiento ODC-By 1.0 |
| Formato de pesos | safetensors, GGUF (f16 y q4_k_m), checkpoints PyTorch `.pt` |
| Vocabulario | 32.000 tokens, optimizado para coreano, dígitos separados |
| Normalización de entrada | Unicode NFC obligatoria (NFD infla el recuento de tokens unas 10 veces) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con 12 capas, dimensión oculta de 768, capa SwiGLU de 2048, RoPE para posiciones relativas, QK-norm y embeddings atados entre entrada y salida. Los nombres de los módulos son compatibles con `Qwen3ForCausalLM`, lo que permite cargarlo con las clases estándar de Transformers. El tokenizador es el mismo que el de la versión v0, con 32.000 entradas y separación explícita de dígitos.

El entrenamiento continúa desde el checkpoint `stable_pre_decay` de v0 (2.400 millones de tokens) durante 7.600 millones de tokens adicionales, hasta un total de 10.000 millones, sobre 2 GPUs con DDP. El optimizador combina Muon para las matrices ocultas y AdamW para embeddings y escalares, con un tamaño de lote de 524.288 tokens y contexto de 1.024. El 20 % final del entrenamiento aplica decaimiento lineal de la tasa de aprendizaje. La mezcla de datos es 40 % web coreana, 20 % documentos coreanos, 33 % material educativo inglés y 7 % matemáticas (en la fase de decaimiento: 33/25/32/10), toda con licencia ODC-By 1.0 (FineWeb-2 Korean, FinePDFs Korean, FineWeb-Edu incluido el subconjunto con score ≥ 4, y FineMath-4plus). El preprocesado incluye normalización NFC, filtros de ratio de escritura y longitud, deduplicación exacta y sustitución por regex de patrones de correo, teléfono, cuenta y número de registro coreano. No se usan datos de código, corpus de grado B/C ni texto generado por modelos.

## Capacidades

- Generación de texto autoregresiva en coreano e inglés; es un modelo base, no ajustado por instrucciones, por lo que no sigue instrucciones de forma fiable sin fine-tuning.
- Clasificación de documentos y textos: el autor reporta resultados tras fine-tuning en KLUE-YNAT, KLUE-NLI, NSMC, MASSIVE ko y 3i4K.
- Extracción de entidades y campos: resultados de fine-tuning en KLUE-NER (F1 de entidad 82,5) y MASSIVE ko slot (F1 74,9).
- Detección de intención y enrutamiento de peticiones: fine-tuning en MASSIVE ko intent (exactitud 86,1).
- Rellenado de formularios y extracción de campos estructurados como caso de uso declarado por el autor.
- Razonamiento matemático básico: la mezcla incluye 7 % de FineMath-4plus y la pérdida de validación en matemáticas baja a 2,020.
- Tool calling / function calling: no disponible (no se documenta soporte).
- Capacidades de agente o razonamiento multi-paso: no disponible (modelo base de 109 M, sin entrenamiento específico).
- Capacidades multimodales (visión, audio): no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Clasificación de documentos internos: tras fine-tuning sobre categorías propias, el modelo etiqueta textos cortos en coreano con un coste de inferencia mínimo, adecuado para volúmenes altos en CPU.
- Enrutamiento de peticiones en atención al cliente: fine-tuning en intenciones (como MASSIVE ko intent) para decidir a qué departamento o flujo derivar cada solicitud, con contexto suficiente para mensajes de hasta 1.024 tokens.
- Extracción de campos en formularios: fine-tuning tipo NER o slot filling para extraer nombres, fechas, importes y referencias de documentos administrativos coreanos.
- Anonimización previa a pipelines de datos: aunque el modelo no debe usarse para extraer datos personales, puede emplearse como clasificador auxiliar de fragmentos que requieran revisión humana.
- Filtrado y etiquetado de corpus coreanos: al ser un modelo base con buena pérdida en web y documentos coreanos (3,055 y 2,208), sirve para puntuar calidad o dominio de textos en la construcción de datasets.
- Investigación en modelos pequeños: el autor publica checkpoints con estado del optimizador, lo que permite estudiar dinámicas de preentrenamiento y recetas con Muon en modelos de ~100 M.
- Prototipado en entornos sin GPU: el GGUF q4_k_m de 73 MB se ejecuta en CPU convencional con llama.cpp, útil para validar tareas de clasificación antes de escalar.

## Benchmarks y rendimiento

Pérdida de validación sobre conjuntos reservados (menor es mejor):

| Conjunto | v0 (2,8B tokens) | v1 (10,0B tokens) |
|---|---|---|
| Web coreana | 3,199 | 3,055 (0,903 bpb) |
| Inglés | 2,961 | 2,851 (1,020 bpb) |
| Documentos coreanos (PDF) | 2,341 | 2,208 (0,791 bpb) |
| Matemáticas | 2,185 | 2,020 (0,936 bpb) |

Fine-tuning sobre tareas públicas coreanas escritas por humanos (media ± desviación típica sobre 3 semillas):

| Tarea | v0 | v1 | KLUE-RoBERTa-base (referencia) |
|---|---|---|---|
| KLUE-YNAT (F1 macro) | 84,4 ± 0,3 | 85,1 ± 0,0 | 86,4 |
| KLUE-NLI (exactitud) | 70,4 ± 0,6 | 73,8 ± 1,0 | 85,1 |
| KLUE-NER (F1 de entidad) | 81,1 ± 0,3 | 82,5 ± 0,4 | 87,4 |
| NSMC (exactitud) | 86,4 | 87,1 ± 0,1 | 88,4 |
| MASSIVE ko intent (exactitud) | 86,4 ± 0,2 | 86,1 ± 0,4 | 86,5 |
| MASSIVE ko slot (F1) | 74,6 ± 0,1 | 74,9 ± 0,3 | 74,6 |
| 3i4K (exactitud) | 89,6 ± 0,0 | 89,5 ± 0,3 | 90,0 |

El decodificador es generativo y las respuestas se puntúan con el mismo scorer para todos los modelos; la referencia encoder usa cabezas de clasificación y etiquetado sobre los mismos splits. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en f16: aproximadamente 0,25 GB para los pesos (109,5 M de parámetros), más overhead de activaciones y caché KV para 1.024 tokens, en torno a 0,5-1 GB en total.
- VRAM estimada en q4_k_m: pesos de 73 MB; cabe en cualquier GPU consumer, incluso integradas, con menos de 1 GB de memoria total.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria (GTX 1050, RTX 3050, RTX 4090, A100, H100); el modelo no aprovecha GPUs de gama alta por su tamaño.
- CPU: el GGUF q4_k_m está pensado para CPU convencional; el autor indica que la perplejidad es un 8 % superior a f16.
- Opciones de despliegue: Transformers (safetensors), llama.cpp (GGUF f16 y q4_k_m), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; Ollama y vLLM no se documentan explícitamente.
- Latencia y throughput: no disponibles de forma numérica; por el tamaño, la inferencia en CPU con q4_k_m es viable para tareas de clasificación por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| max-0.1b-v1 | 109,5 M | 1.024 | ko, en | Apache-2.0 | Base, sin instrucciones; GGUF en CPU |
| KLUE-RoBERTa-base (referencia del autor) | ~110 M | 512 | ko | no disponible en la información | Encoder con cabezas de clasificación; mejor en NLI y NER |
| Qwen3 (familia, layout compatible) | no disponible en la información | no disponible en la información | multilingüe | no disponible en la información | El modelo usa nombres de módulos compatibles, no es un derivado oficial |

La comparación directa con la referencia KLUE-RoBERTa-base muestra que max-0.1b-v1 queda por debajo en NLI (73,8 frente a 85,1) y NER (82,5 frente a 87,4), está cerca en YNAT, NSMC, MASSIVE ko y 3i4K, y supera ligeramente en MASSIVE ko slot (74,9 frente a 74,6). No se dispone de datos de benchmarks de otros modelos pequeños comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse directamente con usuarios finales; puede generar texto fluido pero incorrecto.
- Conocimiento del mundo y razonamiento limitados por el tamaño (109,5 M); el autor lo advierte explícitamente.
- Riesgo de alucinación alto en generación libre; requiere fine-tuning y validación por tarea.
- Contexto de solo 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo coreano e inglés; no hay soporte documentado de otros idiomas.
- Los patrones de datos personales se sustituyeron por regex, pero pueden quedar nombres y datos libres en el texto de entrenamiento; no debe usarse para extraer datos personales.
- La entrada debe normalizarse a Unicode NFC; en NFD el recuento de tokens se infla unas 10 veces.
- Licencia Apache-2.0 para los pesos, con atribución ODC-By 1.0 al redistribuir datasets derivados de FineWeb-2, FinePDFs, FineWeb-Edu y FineMath.
- Sin datos de código en el entrenamiento: no es adecuado para generación de código.
- No se documentan medidas de seguridad, alineación ni filtros de contenido.

## Enlaces

- Hugging Face: https://huggingface.co/quantumaikr/max-0.1b-v1
- Repositorio de checkpoints de entrenamiento: referenciado en la model card como `checkpoints/` dentro del repositorio de Hugging Face (movido desde GitHub releases)
- Datasets de entrenamiento: FineWeb-2, FinePDFs, FineWeb-Edu y FineMath (Hugging Face), licencia ODC-By 1.0
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
