# axteam/Qwen3.5-9B-NVFP4

## Resumen

axteam/Qwen3.5-9B-NVFP4 es una cuantización de 4 bits en formato NVFP4 (W4A4, FP4) del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario axteam. No es un modelo entrenado desde cero: es un derivado de post-entrenamiento (PTQ) pensado para servir el modelo base en vLLM sobre hardware Blackwell con tensor cores FP4. El modelo conserva la arquitectura del original: transformer híbrido con atención lineal (GatedDeltaNet/SSM) y atención completa, denso, con torre de visión y cabeza de predicción multi-token (MTP).

El interés práctico está en el binomio memoria/rendimiento: el repo ocupa 11,7 GB y el autor declara unos 10,9 GB en disco, frente a los ~18,8 GB que exigirían 9.409.813.744 parámetros en BF16. El precio es una pérdida de fidelidad medible: perplejidad de 1,5459 frente a 1,4506 del original (+6,6 %) y una coincidencia top-1 del 90,3 % con las respuestas greedy del BF16 en un conjunto interno de 100 prompts inglés/coreano.

Es relevante ahora por dos motivos. Primero, porque demuestra el flujo de cuantización NVFP4 con compressed-tensors para una familia de modelos con partes sensibles (SSM, torre de visión) que el autor decide deliberadamente mantener en BF16. Segundo, porque ilustra el coste real de adoptar formatos de 4 bits: la ganancia en huella de memoria viene acompañada de una dependencia estricta de hardware Blackwell y de una degradación que hay que validar por tarea antes de llevarla a producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal tipo GatedDeltaNet/SSM + atención completa), denso, multimodal (visión), con cabeza MTP |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 W4A4: pesos FP4 (E2M1) en grupos de 16 con escala FP8 (E4M3) más escala global FP32 por tensor; activaciones FP4; esquema compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | No disponibles en los metadatos de HuggingFace; la model card está en inglés y coreano y el conjunto de calibración es mayoritariamente coreano con mezcla de inglés |
| Licencia | Apache-2.0 (derivada del modelo base Qwen/Qwen3.5-9B) |
| Formato de pesos | safetensors con compressed-tensors (`nvfp4-pack-quantized`); sin GGUF oficial en este repo |
| Capas mantenidas en BF16 | Torre de visión y proyector (`model.visual.*`), cabeza MTP (`mtp.*`), todas las RMSNorm, embeddings de tokens, LM head y toda la ruta de atención lineal (`linear_attn.*`) |
| Metodo de cuantizacion | PTQ con 256 muestras de calibración (corpus mixto con predominio de coreano); sin reentrenamiento |
| Tamano en disco | ~10,9 GB (repo de 11,7 GB) |
| Libreria declarada | transformers; recomendado vLLM para servir |
| Muestreo recomendado | temperature=0.7, top_p=0.8, top_k=20 (valores de Qwen) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida: alterna capas de atención lineal (la model card las etiqueta como GatedDeltaNet/SSM) con capas de atención completa, lo que en la práctica sirve para reducir el coste de memoria del KV cache en secuencias largas. Es un modelo denso de 9.409.813.744 parámetros, multimodal (entrada de imagen y texto, pipeline `image-text-to-text`), y añade una cabeza de predicción multi-token (MTP) que puede aprovecharse para decodificación especulativa. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original; esos datos no están publicados en la documentación consultada.

Sobre esta base, axteam aplica cuantización de post-entrenamiento sin reentrenamiento: pesos y activaciones en FP4 (E2M1), con pesos agrupados de 16 en 16, escala FP8 E4M3 por grupo y una escala global FP32 por tensor. La decisión técnica más relevante es qué se deja fuera de la cuantización: toda la ruta de atención lineal (SSM), la torre de visión y el proyector, la cabeza MTP, las RMSNorm, los embeddings y el LM head permanecen en BF16, porque según el autor el FP4 es demasiado grueso para los pesos del SSM. La model card menciona además que la calibración protege canales salientes antes del redondeo, en la línea de AWQ, aunque la descripción del esquema es la de un PTQ con conjunto de calibración pequeño y sin gradientes. El tokenizador, la `chat_template` y el `generation_config` son idénticos a los del original; `config.json` es el del base más un bloque `quantization_config`.

## Capacidades

- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text` y la torre de visión se conserva en BF16, por lo que la ruta visual no sufre la cuantización FP4.
- Generación de texto conversacional: la model card etiqueta el modelo como `conversational` y conserva la `chat_template` original.
- Predicción multi-token (cabeza MTP) disponible en BF16, aprovechable para decodificación especulativa y reducción de latencia por token.
- Ventana de contexto larga facilitada por la atención lineal híbrida; la longitud exacta no está publicada en la información disponible.
- Capacidades de razonamiento, código, matemáticas y tool calling: no documentadas en la model card de esta cuantización. Dependen del modelo base Qwen3.5-9B, cuyas especificaciones no se incluyen en la información proporcionada.
- Capacidades multilingües: no declaradas formalmente; el conjunto de calibración es mayoritariamente coreano con inglés, lo que sugiere cobertura de ambos idiomas, sin datos sobre el resto.
- Compatibilidad de despliegue: el repo incluye la etiqueta `endpoints_compatible` y está preparado para `vllm serve`.
- Sin modo thinking, audio u otras capacidades especiales documentadas en la información disponible.

## Casos de uso

- Servicio de inferencia de alto throughput en Blackwell: el formato NVFP4 solo despliega su ventaja de velocidad con tensor cores FP4 (B200), así que el escenario natural es un endpoint vLLM con `vllm serve axteam/Qwen3.5-9B-NVFP4` concentrando muchas peticiones concurrentes sobre GPU Blackwell.
- Comprensión de documentos con imagen: al mantener la torre de visión en BF16 y aceptar entradas imagen-texto, encaja en pipelines de extracción de datos de facturas, formularios o capturas, donde el coste dominante es el preprocesado visual y no la generación.
- Asistente conversacional multi-turno: la `chat_template` original y la atención lineal híbrida permiten mantener historiales largos con un KV cache más contenido que un transformer de atención completa equivalente.
- Reducción de latencia con decodificación especulativa: la cabeza MTP en BF16 puede actuar como drafter interno, útil en aplicaciones interactivas donde el tiempo hasta el primer token y el coste por token son críticos.
- Evaluación comparativa de cuantizaciones: sirve como build de referencia W4A4 frente al BF16 original y frente a una variante NVFP4A16 (que el propio autor recomienda si prima la calidad), dentro de un harness A/B con las mismas 100 preguntas y decodificación greedy.
- Procesamiento por lotes offline: con ~10,9 GB de pesos, un solo B200 puede alojar varias instancias o una instancia con lote grande para tareas de etiquetado, resumen o descripción de imágenes en background.
- Despliegue en entornos con presupuesto de VRAM ajustado: la reducción a ~10,9 GB permite liberar memoria para KV cache o para un segundo modelo en la misma GPU, a cambio de la pérdida de fidelidad medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo incluye métricas de fidelidad frente al modelo base en BF16, medidas sobre un conjunto interno mixto inglés/coreano de 100 prompts con decodificación greedy y el mismo harness para todas las filas:

| Metrica | Este modelo (NVFP4) | Original BF16 | Diferencia |
|---|---|---|---|
| Perplejidad (menor = más fiel) | 1,5459 | 1,4506 | +6,6 % |
| Coincidencia top-1 con la respuesta BF16 | 90,3 % | 99,2 % | -8,9 puntos |

Estas cifras miden proximidad al modelo base, no calidad absoluta en tareas. No hay datos publicados de throughput, latencia ni tokens por segundo para este repo concreto.

## Requisitos de hardware

- VRAM estimada para los pesos: ~10,9 GB según la model card (frente a ~18,8 GB en BF16 para 9.409.813.744 parámetros). Hay que sumar KV cache, buffers de activación y el estado de la torre de visión en BF16.
- Cifra de referencia externa: LLM Explorer atribuye 9,4 GB de VRAM al build NVFP4 de AxionML sobre la misma base; no es un dato de este repo y no debe tomarse como equivalente.
- GPU recomendadas: NVIDIA B200 (Blackwell) para explotar los tensor cores FP4. El formato es explícitamente "Blackwell-only" según el autor para rendimiento pleno.
- Cabe en GPU de consumo: la model card no lo confirma para este repo. Existen conversiones GGUF de terceros del build NVFP4 de AxionML orientadas a tarjetas RTX 50 (Blackwell de consumo), lo que sugiere viabilidad en esa familia, pero no hay validación publicada para axteam/Qwen3.5-9B-NVFP4.
- Opciones de despliegue: vLLM es la vía recomendada y la única documentada (`vllm serve axteam/Qwen3.5-9B-NVFP4`). El formato compressed-tensors `nvfp4-pack-quantized` también es legible desde transformers. No hay GGUF, Ollama ni TGI oficiales en este repo.
- Latencia y throughput: no disponibles. La ganancia esperada depende de que el backend use kernels FP4 nativos; en hardware sin tensor cores FP4 el modelo puede cargar pero sin la ventaja de velocidad que justifica el formato.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/Qwen3.5-9B-NVFP4 (este) | 9.409.813.744 | NVFP4 W4A4, grupo 16, SSM y visión en BF16 | No disponible | Apache-2.0 | HuggingFace, 0 descargas, 0 likes; requiere vLLM y hardware Blackwell |
| Qwen/Qwen3.5-9B (original) | 9.409.813.744 | BF16 | No disponible | Apache-2.0 | HuggingFace (modelo base oficial); mayor huella de memoria (~18,8 GB en pesos) y sin dependencia de FP4 |
| Variante NVFP4A16 del mismo base | No disponible | Pesos FP4, activaciones de mayor precision (recomendada por el autor si prima la calidad) | No disponible | Apache-2.0 | Referenciada en la model card; repositorio concreto no indicado |
| AxionML/Qwen3.5-9B-NVFP4 | No disponible | NVFP4 (misma familia de formato) | No disponible | No disponible | HuggingFace; cuantizador distinto, ~9,4 GB de VRAM según LLM Explorer; dispone de conversión GGUF de terceros (Freenixi) |

Las alternativas comparadas comparten base pero no son equivalentes: cambian el cuantizador, el conjunto de calibración y, por tanto, la fidelidad. No hay datos públicos que permitan comparar directamente la calidad de axteam frente a AxionML.

## Limitaciones y advertencias

- Pérdida de fidelidad medible: +6,6 % de perplejidad y 90,3 % de coincidencia top-1 frente al BF16. Aproximadamente una de cada diez respuestas greedy diverge del original, lo que es relevante en tareas de extracción exacta, código o matemáticas.
- Dependencia de hardware: el formato es Blackwell-only para rendimiento pleno. En GPUs sin tensor cores FP4 (A100, H100, RTX 4090) el modelo puede cargar, pero pierde la ventaja que justifica la cuantización.
- La etiqueta `8-bit` del repo contradice el esquema declarado (W4A4, FP4). Conviene guiarse por la model card y por `config.json`, no por los tags.
- El conjunto de calibración es mayoritariamente coreano con mezcla de inglés (256 muestras). No hay evaluación publicada de degradación en castellano ni en otros idiomas, por lo que la calidad fuera de ese eje es desconocida.
- El SSM y la ruta de atención lineal se mantienen en BF16, lo que limita el ahorro máximo alcanzable y hace que el ahorro respecto a BF16 (~7,9 GB) sea menor de lo que sugeriría un 4 bits puro.
- Riesgo de alucinación: no evaluado en la información disponible. La cuantización agresiva de activaciones (W4A4) tiende a afectar más a tareas de razonamiento de varios pasos que a generación superficial; no hay datos que lo cuantifiquen aquí.
- Sesgos: no documentados. Al ser un derivado PTQ sin reentrenamiento, hereda los sesgos del modelo base, que no se detallan.
- Licencia Apache-2.0 en el derivado, con la salvedad de que pesos originales, tokenizador y `chat_template` pertenecen al equipo de Qwen. Uso comercial permitido por la licencia, pero conviene verificar el fichero LICENSE del modelo base antes de distribuirlo.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, cuantizador de terceros sin validación externa conocida, y sin benchmarks de tareas. No se recomienda como dependencia de producción sin una evaluación propia.
- No hay datos de contexto máximo en la documentación de esta cuantización; no asumir la ventana del modelo base sin verificarla en `config.json`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/Qwen3.5-9B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Build NVFP4 alternativo del mismo base (AxionML): https://huggingface.co/AxionML/Qwen3.5-9B-NVFP4
- Conversión GGUF de terceros del build de AxionML: https://huggingface.co/Freenixi/AxionML-Qwen3.5-9B-NVFP4-GGUF
- Ficha en LLM Explorer (build de AxionML, VRAM 9,4 GB): https://llm-explorer.com/model/AxionML%2FQwen3.5-9B-NVFP4,vbK10X0pLQ23kBT5MVW5X
- Ficha en ThinkLLM: https://thinkllm.dev/models/qwen3-5-9b-nvfp4
- Ficha en Toolify: https://www.toolify.ai/ai-model/axionml-qwen3-5-9b-nvfp4
- Paper, blog técnico o repositorio del cuantizador: no disponibles en la información proporcionada.
