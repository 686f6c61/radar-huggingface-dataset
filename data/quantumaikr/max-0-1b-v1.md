# quantumaikr/max-0.1b-v1

## Resumen

max-0.1b-v1 es un modelo de lenguaje base de tipo decoder-only desarrollado por quantumaikr, pensado especificamente para tareas industriales de procesamiento de lenguaje natural en coreano. Con 109,5 millones de parametros, se posiciona en la categoria de modelos pequenos (small language models) y esta disenado como punto de partida para fine-tuning en tareas como clasificacion de documentos, enrutamiento de solicitudes, extraccion de campos y rellenado de formularios. No es un modelo instruido: no ha pasado por RLHF ni DPO, por lo que no debe usarse directamente con usuarios finales.

El modelo emplea una arquitectura transformer compatible con `Qwen3ForCausalLM` (12 capas, anchura 768, SwiGLU de 2048, RoPE, QK-norm y embeddings atados), entrenada sobre un total acumulado de 10.000 millones de tokens. La ventana de contexto es de solo 1.024 tokens, lo que limita su uso a tareas de fragmentos cortos. Su vocabulario de 32.000 tokens esta optimizado para coreano, con separacion de digitos, y comparte tokenizador con la version v0.

La relevancia de este modelo radica en su enfoque: un modelo pequeno, entrenado con datos exclusivamente humanos y con licencia Apache-2.0, que busca cubrir necesidades industriales concretas en coreano sin requerir infraestructura de GPU de gran escala. Incluye pesos en formato GGUF (F16 y Q4_K_M), lo que permite su ejecucion en CPU convencional. Su publicacion es muy reciente (17 de noviembre de 2026) y no registra descargas ni interacciones en Hugging Face en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (compatible con Qwen3ForCausalLM) |
| Parametros totales | 109.531.392 (109,5 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | F16 (full precision), Q4_K_M (4 bits) en formato GGUF; safetensors en precision original |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF (F16 y Q4_K_M) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de v0: 12 capas transformer con anchura 768, activacion SwiGLU con dimension intermedia 2048, RoPE para codificacion posicional, QK-norm y embeddings atados. Los nombres de las capas son compatibles con Qwen3, lo que facilita la integracion con herramientas del ecosistema transformers. El tokenizador tiene un vocabulario de 32.000 tokens optimizado para coreano, con separacion de digitos, y exige normalizacion Unicode NFC en la entrada (el texto en NFD infla el recuento de tokens aproximadamente 10 veces).

El entrenamiento continuo desde el checkpoint `stable_pre_decay` de v0 (2.400 millones de tokens) anadio 7.600 millones de tokens adicionales, alcanzando un total de 10.000 millones. Se utilizaron 2 GPUs con DDP, un optimizador hibrido Muon (para matrices ocultas) y AdamW (para embeddings y escalares), con un tamano de lote de 524.288 tokens y contexto de 1.024. El ultimo 20% del entrenamiento aplico una decaida lineal de la tasa de aprendizaje. Los datos, todos con licencia ODC-By 1.0, provienen de FineWeb-2 Korean, FinePDFs Korean, FineWeb-Edu (incluyendo el subconjunto con puntuacion >= 4) y FineMath-4plus. La mezcla fue: 40% web coreana, 20% documentos coreanos, 33% textos educativos en ingles y 7% matematicas (en la fase de decaida: 33/25/32/10). No se incluyeron datos de codigo, corpus de grado B/C ni texto generado por modelos. El preprocesamiento incluyo normalizacion NFC, filtros de proporcion de escritura y longitud, deduplicacion exacta y reemplazo mediante regex de patrones de correo electronico, telefono, cuenta bancaria y numero de registro de residente.

## Capacidades

- Generacion de texto en coreano e ingles como modelo base (no instruido), orientado a completar o continuar texto.
- Clasificacion de documentos y textos cortos tras fine-tuning supervisado.
- Enrutamiento de solicitudes (intent routing) y clasificacion de intenciones.
- Extraccion de campos (field extraction) y rellenado de formularios.
- Capacidad multilingue limitada a coreano e ingles.
- No dispone de soporte nativo de tool calling ni function calling.
- No dispone de modo de razonamiento explicito (thinking mode), vision ni audio.
- No soporta agentes ni razonamiento multi-paso de forma nativa; requeriria fine-tuning especifico.
- Tokenizador optimizado para coreano con separacion de digitos, adecuado para datos estructurados y numericos.

## Casos de uso

- Clasificacion de documentos administrativos: tras fine-tuning en un conjunto etiquetado, el modelo puede categorizar documentos coreanos (facturas, contratos, solicitudes) en tipos predefinidos. Su vocabulario optimizado para coreano y su entrenamiento en FinePDFs Korean lo hacen adecuado para texto documental.
- Enrutamiento de solicitudes en atencion al cliente: el modelo puede clasificar la intencion de un mensaje entrante y dirigirlo al departamento correspondiente. Los resultados de MASSIVE ko intent (86,1% de precision) tras fine-tuning respaldan esta aplicacion.
- Extraccion de campos en formularios: con fine-tuning supervisado, puede identificar y extraer entidades como nombres, fechas o importes de textos cortos. La separacion de digitos en el tokenizador facilita el tratamiento de datos numericos.
- Analisis de sentimiento en resenas: el modelo alcanza un 87,1% de precision en NSMC tras fine-tuning, lo que lo hace util para monitorizacion de opinion en coreano.
- Etiquetado de entidades nombradas (NER): con un fine-tuning adecuado, puede identificar personas, organizaciones y lugares en textos coreanos, con un F1 de entidad de 82,5 en KLUE-NER.
- Inferencia de lenguaje natural (NLI): puede determinar la relacion entre pares de frases (implicacion, contradiccion, neutralidad) con un 73,8% de precision en KLUE-NLI tras fine-tuning.
- Ejecucion en entornos con recursos limitados: gracias a sus pesos GGUF Q4_K_M, puede desplegarse en CPU convencional para tareas de clasificacion o extraccion de baja latencia, sin necesidad de GPU.
- Investigacion en modelos pequenos para coreano: sirve como base para experimentos de eficiencia, tokenizacion o tecnicas de entrenamiento en idiomas de bajos recursos.

## Benchmarks y rendimiento

Perdida de validacion (menor es mejor):

| Conjunto | v0 (2,8B tokens) | v1 (10,0B tokens) |
|---|---|---|
| Web coreana | 3,199 | 3,055 (0,903 bpb) |
| Ingles | 2,961 | 2,851 (1,020 bpb) |
| Documentos coreanos (PDF) | 2,341 | 2,208 (0,791 bpb) |
| Matematicas | 2,185 | 2,020 (0,936 bpb) |

Fine-tuning en tareas publicas coreanas (media ± desviacion estandar sobre 3 semillas):

| Tarea | v0 | v1 | KLUE-RoBERTa-base (ref.) |
|---|---|---|---|
| KLUE-YNAT (F1 macro) | 84,4 ± 0,3 | 85,1 ± 0,0 | 86,4 |
| KLUE-NLI (precision) | 70,4 ± 0,6 | 73,8 ± 1,0 | 85,1 |
| KLUE-NER (F1 de entidad) | 81,1 ± 0,3 | 82,5 ± 0,4 | 87,4 |
| NSMC (precision) | 86,4 | 87,1 ± 0,1 | 88,4 |
| MASSIVE ko intent (precision) | 86,4 ± 0,2 | 86,1 ± 0,4 | 86,5 |
| MASSIVE ko slot (F1) | 74,6 ± 0,1 | 74,9 ± 0,3 | 74,6 |
| 3i4K (precision) | 89,6 ± 0,0 | 89,5 ± 0,3 | 90,0 |

Nota: el decoder es generativo (las respuestas se generan como texto y se puntuan con el mismo scorer para todos los modelos); la referencia encoder utiliza cabezas de clasificacion/etiquetado sobre los mismos splits.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,22 GB en F16 (109,5 M parametros x 2 bytes) y unos 0,06 GB en Q4_K_M (4 bits), sin contar overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM puede ejecutar el modelo en F16; una RTX 3060, RTX 4090, A100 o H100 son mas que suficientes y permiten lotes grandes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 2060, RTX 3060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (nativo), llama.cpp (GGUF F16 y Q4_K_M), Ollama (a traves de GGUF), text-generation-inference (TGI, segun tags), endpoints compatibles. vLLM no esta confirmado en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el reducido tamano (109,5 M) y el contexto de 1.024 tokens, se espera una latencia muy baja en GPU y throughput alto en CPU con Q4_K_M, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| max-0.1b-v1 | 109,5 M | 1.024 | ko, en | Apache-2.0 | safetensors, GGUF | Base, sin instruir; enfoque industrial coreano |
| Qwen3-0.6B | 0,6 B | no disponible | multilingue | Apache-2.0 | safetensors, GGUF | Mayor tamano y contexto; no especifico de coreano |
| KLUE-RoBERTa-base | ~110 M | 512 | ko | no disponible | safetensors | Encoder para clasificacion/NER; referencia en benchmarks |
| SmolLM2-135M | 135 M | no disponible | en (principalmente) | Apache-2.0 | safetensors, GGUF | Modelo pequeno en ingles; sin enfoque coreano |

La comparacion con KLUE-RoBERTa-base es la mas directa en tareas de clasificacion coreana: max-0.1b-v1 queda ligeramente por debajo en la mayoria de tareas (KLUE-NLI 73,8 frente a 85,1; KLUE-NER 82,5 frente a 87,4), pero es un decoder generativo que puede adaptarse a tareas generativas, mientras que KLUE-RoBERTa-base es un encoder especializado en clasificacion. Frente a Qwen3-0.6B o SmolLM2-135M, max-0.1b-v1 ofrece un tokenizador especifico para coreano y entrenamiento centrado en ese idioma, a costa de un contexto mucho menor (1.024 tokens) y un tamano reducido.

## Limitaciones y advertencias

- Modelo base sin instruir: no debe usarse directamente con usuarios finales; requiere fine-tuning supervisado para cada tarea.
- Conocimiento del mundo y razonamiento limitados por su tamano (109,5 M); puede generar texto fluido pero incorrecto.
- Riesgo de alucinacion: al ser un modelo generativo pequeno, puede producir contenido plausible pero falso, especialmente en tareas abiertas.
- Contexto muy corto (1.024 tokens): inadecuado para documentos largos o conversaciones multi-turno extensas.
- Solo coreano e ingles; no soporta otros idiomas de forma fiable.
- Datos personales: aunque se reemplazaron patrones de informacion personal mediante regex, pueden permanecer nombres y otros datos libres en el texto de entrenamiento. No debe usarse para extraer datos personales.
- Licencia Apache-2.0 para los pesos, pero los datos de entrenamiento (FineWeb-2, FinePDFs, FineWeb-Edu, FineMath) son ODC-By 1.0; debe mantenerse la atribucion al redistribuir datasets derivados.
- Sin datos de benchmarks en tareas generativas abiertas (MMLU, HumanEval, GSM8K) en la informacion disponible.
- Sin descargas ni validacion comunitaria en Hugging Face en el momento de la ficha; madurez y soporte inciertos.
- No incluye datos de codigo en el entrenamiento, por lo que su rendimiento en generacion de codigo sera muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/quantumaikr/max-0.1b-v1
- Model card (README): incluida en la pagina de Hugging Face
- FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- FinePDFs: https://huggingface.co/datasets/HuggingFaceFW/finepdfs
- FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- KLUE benchmark: https://klue-benchmark.com/
- NSMC: https://github.com/e9t/nsmc
- MASSIVE: https://github.com/alexa/massive
- 3i4K: https://github.com/bab2min/3i4k
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com/
