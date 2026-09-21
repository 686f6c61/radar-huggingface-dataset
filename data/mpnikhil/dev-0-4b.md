# mpnikhil/dev-0.4b

## Resumen

Dev (`dev-0.4b`) es un modelo de decisión bidireccional de 396.880.897 parámetros (≈399 M) publicado por el usuario mpnikhil en Hugging Face bajo licencia Apache 2.0. Está construido sobre `ModernBERT-large` (encoder transformer bidireccional de 28 capas con ventana nativa de 8.000 tokens) y no genera texto: su salida es directamente una distribución de probabilidad sobre un conjunto de opciones candidatas escritas en lenguaje natural dentro del prompt. Resuelve el problema de convertir texto no estructurado en decisiones estructuradas: enrutado de intenciones (routing), verificación booleana (sí/no) y puntuación en escalas ordinales (1–5).

El modelo se posiciona de forma explícita frente a la corriente de "modelos de decisión" construidos sobre decodificadores causales con cabezas de punteros. Su tesis arquitectónica es que una tarea de decisión no necesita atención causal ni generación de tokens, sino atención bidireccional nativa, de modo que las opciones candidatas puedan condicionarse mutuamente sin sesgo de posición o de recencia. Frente a `kev-0.5b` (Qwen2.5-0.5B congelado más una cabeza LoRA de 9,3 M de parámetros), el autor reporta mejoras de +5,33 puntos en Banking77, +9,90 en BoolQ y +7,37 en Yelp Review Full.

La relevancia práctica inmediata es su coste computacional: una única pasada hacia delante sin bucle de decodificación, con latencias declaradas de 27,6 ms en Apple Silicon MPS (M1 Max) y ~10 ms en CUDA con FP16 y SDPA. Se publica únicamente en inglés, con safetensors y sin pesos cuantizados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (`ModernBERT-large`), 28 capas, atención bidireccional sin máscara causal |
| Parámetros totales | 396.880.897 (≈399 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.000 tokens nativos |
| Tipos de cuantización | No disponible (el autor no publica versiones cuantizadas; el repositorio contiene safetensors de 1,6 GB, coherente con pesos en fp32) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `transformers`) |
| Tarea (pipeline) | `text-classification` |
| Cabeza de salida | Cabeza de elección dinámica de 2 capas, compartida por los tres readouts (elección categórica, booleana y ordinal) |
| Datos de evaluación | PolyAI/banking77, google/boolq, code_search_net, yelp_review_full |
| Latencia declarada | 27,6 ms en MPS (M1 Max); ~10 ms en CUDA FP16 con SDPA |
| Tamaño del repositorio | 1,6 GB |
| Fecha de creación en Hugging Face | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El núcleo es `ModernBERT-large`: un encoder de 28 capas con atención bidireccional no restringida y máscara `None`, ejecutada sobre kernels SDPA fusionados en CUDA y Apple Silicon MPS. Al no existir máscara triangular inferior, cuando las opciones candidatas se escriben en la cinta de tokens, la opción 1 puede atender hacia delante a la opción 4, lo que permite un condicionamiento mutuo real entre candidatos y elimina el sesgo de posición o de recencia típico de los decodificadores causales. La ventana de contexto es de 8.000 tokens.

Sobre ese backbone, el modelo sustituye las cabezas específicas por tarea por una única cabeza de elección dinámica inspirada en el mecanismo de GLiNER: las opciones no están codificadas en los pesos, sino que se escriben como texto en lenguaje natural dentro del prompt, y la cabeza evalúa las que se le pasen en cada llamada. Bajo este diseño, las tres tareas son la misma operación: enrutado = clasificación sobre N categorías; verificación = clasificación sobre `["No", "Yes"]`; puntuación = clasificación sobre niveles ordenados (`["1 star", ..., "5 stars"]`) tomando el valor esperado. Documento y candidatos se evalúan juntos en una sola pasada hacia delante.

Tras el ajuste supervisado (SFT), el autor aplica calibración post-hoc mediante *temperature scaling* por readout (Guo et al., 2017), ajustada sobre datos de validación minimizando NLL. El motivo declarado es que la pérdida de entropía cruzada separa bien las clases pero empuja los logits hacia valores extremos, generando sobreconfianza en las tareas multiclase y ordinal; además, ajustar la cabeza compartida con pérdida de Brier genera tensión de gradiente entre tareas y gradientes que se desvanecen. Las temperaturas ajustadas fueron T=1,3575 (readout booleano, "Noul"), T=4,2542 (elección categórica) y T=3,7097 (puntuación ordinal). No se menciona en la información disponible el uso de RLHF o DPO, ni el número de tokens de entrenamiento ni la composición del dataset de entrenamiento.

## Capacidades

- Clasificación de intenciones (*routing*) sobre un número arbitrario de categorías definidas en el prompt: 77 vías en Banking77 con 91,33 % de top-1 y 98,67 % de top-3.
- Verificación booleana (sí/no) del tipo lectura y comprobación, con 85,20 % de exactitud en Google BoolQ.
- Puntuación ordinal en escalas tipo 1–5 estrellas, devolviendo valor esperado, con 62,67 % de coincidencia exacta y MAE de 0,4017 en Yelp Review Full.
- Reranking de recuperación de código: 0,8203 de NDCG@10 en el benchmark de juicio humano de CodeSearchNet, por encima de una línea base léxica BM25 (0,7652). El autor lo describe como comprobación de capacidad, no como benchmark principal.
- Salidas calibradas: temperaturas ajustadas por readout que reducen el ECE externo un 25 % en BoolQ, un 27 % en Banking77 y un 51 % en Yelp, manteniendo la exactitud invariante.
- Definición de opciones en tiempo de inferencia mediante lenguaje natural, sin reentrenamiento ni cabezas específicas por tarea.
- Inferencia en una sola pasada hacia delante, sin generación de tokens ni bucle autorregresivo.

Capacidades no soportadas según la información disponible: generación de texto libre, razonamiento multi-paso generativo, *tool calling* o *function calling*, uso como agente, visión, audio, y cualquier idioma distinto del inglés.

## Casos de uso

- **Enrutado de tickets de soporte**: el modelo recibe el texto del ticket y la lista de colas o categorías de la organización escrita en el prompt, y devuelve la distribución sobre categorías. Con 98,67 % de recall@3 en Banking77, es viable encaminar automáticamente el 98 % de los casos con revisión humana únicamente del top-3.
- **Verificación de respuestas en sistemas RAG**: dado un contexto recuperado y una afirmación, el modelo actúa como verificador booleano (85,20 % en BoolQ) para descartar respuestas no sustentadas antes de mostrarlas al usuario, a ~10 ms por comprobación en CUDA.
- **Puntuación automática de reseñas y encuestas**: gracias al readout ordinal con valor esperado, puede puntuar en escalas 1–5 y producir métricas agregadas continuas (MAE 0,4017) para cuadros de mando de calidad percibida.
- **Moderación y triaje binario de contenido**: cualquier criterio discreto ("¿infringe la política? sí/no") puede evaluarse sin reentrenar, añadiendo o cambiando las opciones en el prompt.
- **Reranking en pipelines de búsqueda de código**: con 0,8203 de NDCG@10 en CodeSearchNet, sirve como segunda fase de ranking sobre candidatos de BM25 en asistentes de documentación o búsqueda interna de repositorios.
- **Clasificación de correo y documentos entrantes**: categorización de bandejas de entrada corporativas, con la ventaja de que las categorías se redefinen por prompt sin necesidad de reentrenar el modelo.
- **Etiquetado a gran escala para curación de datasets**: al ejecutarse en una sola pasada y ser un modelo de 399 M, permite etiquetar corpus completos con coste por documento muy inferior al de un decodificador, como fase previa a la revisión humana.
- **Guardarraíl de decisión en cascada**: actuar como primer filtro barato antes de invocar un LLM generativo, resolviendo los casos de alta confianza (clasificación calibrada) y escalando solo los ambiguos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card. Todos figuran con `verified: false`, es decir, no han sido verificados de forma independiente.

| Benchmark / tarea | Métrica | Dev-0.4B (ModernBERT bidireccional) | Kev-0.5B (Qwen2.5 causal + LoRA) | Diferencia |
|---|---|---|---|---|
| Banking77 (enrutado de 77 intenciones) | Top-1 accuracy | 0,9133 | 0,860 | +5,33 puntos |
| Banking77 | Top-3 recall | 0,9867 | No disponible | — |
| Google BoolQ (verificación de lectura) | Accuracy | 0,8520 | 0,753 | +9,90 puntos |
| Yelp Review Full (5 estrellas) | Exact accuracy | 0,6267 | 0,553 | +7,37 puntos |
| Yelp Review Full | MAE | 0,4017 | No disponible | — |
| CodeSearchNet (juicio humano) | NDCG@10 (test) | 0,8203 | 0,7652 (línea base BM25) | +0,0551 |

Calibración reportada (ECE, *equal-mass*, antes y después del *temperature scaling*):

| Benchmark (readout) | ECE bruto → calibrado | Exactitud |
|---|---|---|
| Google BoolQ (booleano, n=500) | 0,103 → 0,077 (−25 %) | 0,852 → 0,852 |
| Banking77 (elección, n=300) | 0,075 → 0,055 (−27 %) | 0,913 → 0,913 |
| Yelp (ordinal, n=300) | 0,318 → 0,155 (−51 %) | 0,627 → 0,627 |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,6 GB de pesos en fp32, ~0,8 GB en fp16/bf16 y ~0,4 GB en int8, más activaciones dependientes del lote y de la longitud de secuencia (hasta 8.000 tokens).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM para lotes pequeños en fp16; A100, H100, L40S o RTX 4090 para lotes grandes y despliegue en producción.
- Cabe en GPU de consumo: sí, de forma holgada. Funciona en RTX 3050, RTX 4060, RTX 4090 y similares, e incluso en CPU sin GPU dedicada.
- Apple Silicon: soporte MPS confirmado por el autor, con 27,6 ms de latencia en un M1 Max.
- Latencia declarada: ~10 ms por pasada en CUDA FP16 con SDPA; 27,6 ms en M1 Max vía MPS. No se especifica si son valores por documento con prompt corto.
- Throughput: no disponible (no se publican documentos por segundo ni comportamiento con lotes).
- Opciones de despliegue: Hugging Face Transformers con SDPA es la vía soportada de forma nativa; también son razonables la exportación a ONNX con Optimum, y el servicio mediante TorchServe, Triton Inference Server o un servidor FastAPI propio. `llama.cpp` y Ollama no son aplicables en la información disponible: no se publican pesos GGUF y la conversión no está documentada por el autor.

## Comparativa con modelos similares

| Modelo | Autor | Parámetros | Contexto | Licencia | Enfoque | Rendimiento reportado |
|---|---|---|---|---|---|---|
| Dev-0.4b | mpnikhil | 396,9 M | 8.000 | Apache 2.0 | Encoder bidireccional ModernBERT + cabeza de elección dinámica | Banking77 91,33 %; BoolQ 85,20 %; Yelp 62,67 % |
| Kev-0.5B | Jared Palmer | ~0,5 B backbone + 9,3 M cabeza LoRA | No disponible | No disponible | Backbone causal Qwen2.5-0.5B congelado + cabeza de punteros LoRA | Banking77 86,0 %; BoolQ 75,3 %; Yelp 55,3 % |
| Jev | TypeSafe | No disponible | No disponible | No disponible | Modelo de decisión citado como referencia por el autor | No disponible |
| ModernBERT-large (base) | Answer.AI / LightOn | ~395 M | 8.000 | Apache 2.0 | Encoder bidireccional sin cabeza de decisión | No disponible como modelo de decisión; requiere entrenar la cabeza |

La comparación directa publicada por el autor es únicamente contra Kev-0.5B, con los tres benchmarks de la tabla anterior. No se ofrecen comparaciones frente a clasificadores clásicos tipo DeBERTa-v3 o BERT-large en la información disponible.

## Limitaciones y advertencias

- Los tres resultados de benchmarks están marcados como `verified: false`; proceden del `model-index` del propio autor y no han sido reproducidos por terceros.
- El modelo es monolingüe en inglés; no hay soporte declarado para castellano ni para ningún otro idioma.
- No genera texto: no sirve para resumen, traducción, diálogo libre, razonamiento multi-paso generativo, *tool calling* ni uso como agente. Solo clasifica, verifica o puntúa.
- Rigidez de formato: toda tarea debe poder formularse como una elección sobre opciones escritas en el prompt. Las tareas con salidas estructuradas libres (JSON, extracción de entidades anidadas) quedan fuera de su alcance.
- Riesgo de sobreconfianza si no se aplica la calibración; el propio autor documenta ECE de 0,318 en el readout ordinal antes del *temperature scaling*.
- Riesgo de sesgo heredado de los datos: las evaluaciones provienen de dominios concretos (banca en Banking77, reseñas en Yelp), por lo que el comportamiento en otros dominios es incierto.
- En un modelo de este tipo el fallo típico no es la alucinación generativa, sino la clasificación errónea silenciosa; conviene monitorizar la confianza calibrada y no solo la etiqueta ganadora.
- Trazas de adopción nulas: 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni mantenimiento demostrable. El repositorio se actualizó un día después de su creación.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. No se documentan restricciones adicionales.
- No se publican pesos cuantizados, versiones GGUF ni recetas de despliegue en servidores de alto rendimiento, lo que traslada al integrador el trabajo de optimización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mpnikhil/dev-0.4b
- Referencias de arXiv citadas en las etiquetas del repositorio (títulos según la información disponible):
  - arXiv:1706.03762 — "Attention Is All You Need" (transformer original)
  - arXiv:2412.13663 — `ModernBERT` (arquitectura base del modelo)
  - arXiv:1706.04599 — "On Calibration of Modern Neural Networks" (Guo et al., 2017; base del *temperature scaling* aplicado)
  - arXiv:2311.01079 — identificador citado por el autor; título no disponible en la información proporcionada
- La búsqueda web realizada no devolvió resultados relacionados con este modelo: los enlaces recuperados (logicallyfallacious.com, telldear.org, fallacy.is, biostim.com.au) tratan sobre la falacia de la pregunta cargada y no guardan relación con el modelo, por lo que no se incluyen como fuentes de la ficha.
