# fraQtl/Llama-3.2-1B-Instruct-Hi-Fi-GGUF

## Resumen

Llama-3.2-1B-Instruct-Hi-Fi-GGUF es una cuantización GGUF de tipo Q4_K_M del modelo `meta-llama/Llama-3.2-1B-Instruct` de Meta, publicada por el usuario fraQtl. No es un modelo nuevo: es un artefacto de cuantización que aplica una asignación de tipos por tensor guiada por calibración (imatrix) para maximizar la fidelidad al checkpoint bf16 original manteniendo exactamente el mismo presupuesto de bytes que la cuantización Q4_K_M de referencia de la comunidad (bartowski). El archivo pesa 807.513.952 bytes, un 0,02% menos que el comparador.

La propuesta de valor es la fidelidad distribucional: según la model card, la divergencia KL (KLD top-20 simétrica) frente al modelo original baja un 12,5% en el slice general (0,031523 frente a 0,036032) y el acuerdo top-1 sube en ambos slices, aunque en el slice de código/matemáticas el comparador es ligeramente mejor (+0,11%). También se posiciona como la mitad "draft" de un par de decodificación especulativa junto a un Llama-3.1-8B del mismo autor.

El modelo subyacente es un transformer denso de 1.235.814.432 parámetros, 16 capas, GQA y embeddings atados, con una ventana de contexto nominal de 128.000 tokens en la familia Llama 3.2. El interés práctico es acotado pero claro: servir como draft barato en decodificación especulativa o como modelo de bolsillo en hardware muy limitado, con una pérdida de calidad ligeramente menor que la del Q4_K_M estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.2), 16 capas, GQA, embeddings atados |
| Parametros totales | 1.235.814.432 (1B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (familia Llama 3.2); la model card documenta evaluacion hasta 32.768 |
| Tipos de cuantizacion | Q4_K_M (unico artefacto publicado en este repo); asignacion per-tensor: Q8_0 en V de atencion en 12/16 capas, Q6_K en la tabla de embeddings/output atada |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; hereda los del modelo base) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | GGUF (807.513.952 bytes, ~5,2274 bpw reales) |

## Arquitectura y entrenamiento

El modelo base es un Llama 3.2 Instruct de 1B parámetros: transformer denso con 16 capas, atención con query grouping (GQA) y embeddings de entrada/salida atados. El autor no ha reentrenado nada; el trabajo consiste en conversión a GGUF (`convert_hf_to_gguf.py --outtype bf16`) y cuantización con `llama-quantize` usando overrides `--tensor-type` por tensor. La calibración emplea un paquete mixto de código/matemáticas y general (sha256 `c88e7e0a…2dabc`) con `llama-imatrix` a contexto 2048 sobre sustrato BF16; el `imatrix.dat` se incluye en el repo.

La innovación declarada es la asignación de tipos por tensor bajo un presupuesto de bytes idéntico al del Q4_K_M de bartowski: la familia de atención V es la más protegida (Q8_0 en 12 de 16 capas), la Q nunca se degrada por debajo del tipo nativo del comparador y la tabla de embeddings atada se mantiene en Q6_K. La evaluación se hizo con llama-cpp-python 0.3.33 (llama.cpp `78d2f5246`) sobre A100-80GB, semilla 0, con un teacher Q8_0 derivado del bf16 original. No hay datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat embebida en el GGUF (compatible con `llama_chat_apply_template` y APIs de chat-completion).
- Razonamiento básico e instrucciones generales, limitado por el tamaño de 1B parámetros.
- Generación de código y matemáticas elementales; el autor evalúa explícitamente un slice de código/matemáticas de 400 registros.
- Recuperación en contexto largo: needle-in-the-haystack evaluado en 8K y 32K con profundidades 0,1/0,5/0,9.
- Uso como modelo draft en decodificación especulativa junto a `fraQtl/Llama-3.1-8B-Instruct-Hi-Fi-GGUF` (`llama-speculative`, `--draft-max 16`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no documentado en la model card (el slice general incluye tráfico de "tool", pero no se detalla el soporte).
- Visión, audio o modo thinking: no soportado (modelo de texto).

## Casos de uso

- Decodificación especulativa con un modelo objetivo mayor: usar este GGUF de 1B como draft de un Llama 3.1 8B en `llama-speculative` con `--draft-max 16`, reduciendo el coste por token del modelo grande a cambio de una RAM adicional de ~0,8 GB.
- Inferencia en dispositivos de gama baja: el archivo de 807 MB cabe en móviles, Raspberry Pi con 4 GB de RAM y portátiles sin GPU dedicada, sirviendo para asistentes locales de bajo consumo.
- Clasificación y etiquetado de texto por lotes: con contexto de 8K y un throughput alto en CPU, es adecuado para tareas de extracción de entidades o categorización a gran escala donde la precisión de un 1B es suficiente.
- Prototipado rápido de pipelines de chat: la plantilla de chat embebida y la compatibilidad con endpoints permiten montar un servidor compatible con OpenAI en minutos con llama.cpp u Ollama.
- Filtro o router previo en sistemas multi-modelo: decidir si una consulta requiere el modelo grande o puede resolverse con el pequeño, aprovechando su baja latencia.
- Evaluación de técnicas de cuantización: el repo incluye recibos (`receipts/`) con JSON de build, evaluación y retrieval, útil como referencia reproducible para estudiar el impacto de la asignación per-tensor.
- Pruebas de recuperación en contexto largo de bajo coste: validar pipelines de RAG con ventanas de 8K-32K antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los datos publicados miden fidelidad al modelo original, no precisión en tareas. No hay resultados de MMLU, HumanEval o GSM8K en la información disponible.

| Metrica | bartowski Q4_K_M | fraQtl Hi-Fi | Diferencia |
|---|---:|---:|---:|
| Bytes | 807.694.464 | 807.513.952 | −0,02% |
| Bits por peso reales | 5,2286 | 5,2274 | −0,0012 |
| KLD código/matemáticas ↓ | 0,046045 | 0,046093 | +0,11% (peor) |
| KLD general ↓ | 0,036032 | 0,031523 | −12,5% (mejor) |
| Acuerdo top-1 código/matemáticas | 0,9369 | 0,9416 | +0,0047 |
| Acuerdo top-1 general | 0,9227 | 0,9297 | +0,0070 |
| NIAH 18 celdas (8K/32K) | 16–17 / 18 | 17–18 / 18 | mejor o igual |

La evaluación usa KLD top-20 simétrica sobre el soporte de un teacher Q8_0, 400 registros por slice, tres ejecuciones deterministas (deriva 0,0). En recuperación de contexto largo, el subgrid de 32K da 9/9 en todas las ejecuciones para ambos brazos; el autor advierte de un parpadeo de ±1 celda por orden de reducción en CUDA.

## Requisitos de hardware

- VRAM/RAM para inferencia: ~0,8 GB de pesos en Q4_K_M; con overhead de contexto, unos 1,2-1,5 GB para 8K de contexto y ~2 GB para 32K.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM; funciona bien en RTX 3060/4060, e incluso en iGPU y Apple Silicon vía Metal.
- Consumer GPU: sí, cabe en cualquier GPU de consumo moderna e incluso en placas integradas.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-speculative`), llama-cpp-python, Ollama (importando el GGUF), y servidores compatibles con endpoints OpenAI. vLLM y TGI no soportan GGUF de forma nativa para este formato sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada. La evaluación se ejecutó en A100-80GB, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| fraQtl Llama-3.2-1B-Instruct Hi-Fi (este) | 1,24B | 128K (nominal) | GGUF Q4_K_M | Llama 3.2 | KLD general 12,5% mejor que bartowski; 69 descargas |
| bartowski Llama-3.2-1B-Instruct-GGUF | 1,24B | 128K | GGUF (multiples quants) | Llama 3.2 | Referencia de la comunidad; mejor KLD en código/matemáticas |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128K | safetensors bf16 | Llama 3.2 | Modelo original; ~2,5 GB en bf16 |
| Qwen2.5-1.5B-Instruct (GGUF) | 1,54B | 32K | GGUF | Apache 2.0 | Alternativa de tamaño similar con licencia permisiva; sin datos comparativos en esta ficha |

## Limitaciones y advertencias

- Techo de calidad del nivel 1B: la cuantización preserva fidelidad, pero no añade capacidad; el modelo falla en razonamiento complejo, matemáticas no triviales y código de producción.
- El slice de código/matemáticas es ligeramente peor que el comparador de bartowski (+0,11% de KLD); si el uso principal es código, el Q4_K_M estándar puede ser preferible.
- Riesgo de alucinación inherente a un modelo de 1B, especialmente en contextos largos y preguntas factuales.
- Idiomas soportados no declarados; el rendimiento fuera del inglés no está verificado.
- La ventana nominal de 128K no está validada más allá de 32K en la evaluación publicada.
- Licencia Llama 3.2 Community License: permite uso comercial con restricciones (límite de 700 millones de usuarios mensuales, obligación de nombrar el derivado comenzando por "Llama", cumplimiento de la Acceptable Use Policy). El autor señala que el texto de licencia distribuido con el 1B no contiene la cláusula específica de la UE, aplicable a los modelos multimodales.
- Advertencia de reproducibilidad: la evaluación es del propio autor, con un rig determinista y sin comparación con otros quants de la comunidad más allá de bartowski.
- El par de decodificación especulativa con el 8B no tenía recibos publicados en el momento de la model card; el rendimiento del par no está verificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fraQtl/Llama-3.2-1B-Instruct-Hi-Fi-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Cuantización de referencia (bartowski): https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF
- Modelo objetivo del par especulativo: https://huggingface.co/fraQtl/Llama-3.1-8B-Instruct-Hi-Fi-GGUF
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- llama.cpp (commit usado): https://github.com/ggml-org/llama.cpp/commit/78d2f524682d9fee790a6460c93d018dafeb5229
