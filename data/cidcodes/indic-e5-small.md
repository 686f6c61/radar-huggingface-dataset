# cidcodes/indic-e5-small

## Resumen

indic-e5-small es un modelo de embeddings de frases (sentence-similarity) de 46,8 millones de parámetros desarrollado por el usuario cidcodes, derivado de intfloat/multilingual-e5-small mediante recorte de vocabulario y destilación. Resuelve un problema concreto y poco cubierto: la recuperación semántica de texto en lenguas índicas escrito en alfabeto latino (romanizado), con ortografía informal y con mezcla de código (hinglish, tanglish), manteniendo además el rendimiento en escritura nativa.

El modelo parte de la arquitectura BERT de e5-small, pero reduce el vocabulario de 250 000 a 64 000 tokens, lo que rebaja el número de parámetros de 118 millones a 47 millones, y se destila contra el profesor original congelado para que las representaciones de texto romanizado, mal escrito o code-mixed caigan cerca de las del texto nativo equivalente. El resultado es un encoder unas 2,5 veces más pequeño que el original con un rendimiento en MTEB(Indic) prácticamente idéntico (0,651 frente a 0,648).

Es relevante porque cubre 13 lenguas índicas más inglés con una licencia MIT permisiva, un tamaño que cabe en cualquier GPU de consumo e incluso en el navegador vía ONNX cuantizado (47 MB en int8), y porque ataca el caso real de usuarios que escriben en latín aunque el corpus de referencia esté en devanagari, bengalí, tamil u otras escrituras.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: intfloat/multilingual-e5-small) |
| Parámetros totales | 46 805 376 (46,8 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (entrenamiento con 128 tokens) |
| Tipos de cuantización | int8 por canal (ONNX `model_quantized.onnx`, 47 MB); safetensors en fp32; cuantizaciones GGUF no documentadas |
| Idiomas soportados | hi, bn, ta, te, ml, mr, gu, kn, pa, or, as, ur, ne, en |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX (incluye variante cuantizada int8) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer BERT de 12 capas y dimensión oculta 384, heredado de multilingual-e5-small, con el vocabulario reducido de 250 000 a 64 000 tokens. El recorte se hizo a partir de frecuencias de tokens en Wikipedia y Sangraha en las 13 lenguas objetivo más texto romanizado, equilibrando por idioma y conservando todos los caracteres individuales de las escrituras de destino; las filas de embedding correspondientes se recogen del modelo original. Este paso por sí solo deja MTEB(Indic) en 0,6471 frente a 0,6484 del modelo completo.

Sobre esa base se aplica destilación de representaciones (Reimers y Gurevych, 2020) con el multilingual-e5-small original congelado como profesor. El conjunto de entrenamiento son 256 000 párrafos alineados nativo/romanizado del split sintético de Sangraha; la función de pérdida fuerza a que las representaciones del estudiante para texto nativo, romanizado, romanizado con ortografía informal y romanizado con mezcla de código coincidan con la del profesor sobre el texto nativo, y que el inglés coincida con el inglés. La mezcla de código se genera sustituyendo palabras por términos ingleses mediante un léxico inducido de los propios embeddings del profesor (vecinos mutuos más cercanos con margen). Los pares cortos tipo consulta se extraen de ventanas de 2 a 8 palabras de los pares alineados. El entrenamiento fue una época en una RTX 3050 de 4 GB, en unos 75 minutos.

## Capacidades

- Generación de embeddings de frases para similitud semántica, recuperación (retrieval), clustering y deduplicación.
- Comprensión de texto índico tanto en escritura nativa como romanizado en alfabeto latino.
- Robustez ante ortografía informal y variantes de transliteración no normalizadas.
- Manejo de mezcla de código índico-inglés (hinglish, tanglish y similares).
- Soporte de prefijos e5: `query: ` para consultas y tareas simétricas, `passage: ` para documentos; `encode_query` y `encode_document` los añaden automáticamente en sentence-transformers 5 o superior.
- Ejecución en navegador y Node mediante transformers.js con el modelo ONNX cuantizado.
- Capacidades multilingües limitadas a las 13 lenguas índicas listadas más inglés; no cubre otras lenguas.
- No es un modelo generativo: no hace tool calling, ni razonamiento multi-paso, ni visión, ni audio.

## Casos de uso

- Búsqueda semántica en lenguas índicas con consultas tecleadas en latín: un usuario escribe "mujhe kal office jana hai" y el sistema recupera documentos en devanagari del índice, gracias a que el modelo alinea ambas representaciones.
- Atención al cliente en India: indexar la base de conocimiento en escritura nativa y resolver consultas de chat romanizadas o mezcladas con inglés, con un encoder de 47 M que permite latencia baja en CPU.
- Deduplicación y clustering de tickets de soporte: agrupar mensajes escritos con ortografías inconsistentes (romanizado informal) usando similitud coseno sobre los embeddings.
- Moderación y clasificación de contenido en redes sociales: embeddings de publicaciones en hinglish o tanglish para alimentar clasificadores ligeros, sin depender de normalización previa del texto.
- Búsqueda en aplicaciones web del lado del cliente: con el ONNX int8 de 47 MB y transformers.js, ejecutar la codificación de consultas en el navegador y enviar solo el vector al backend.
- Sistemas RAG multilingües para el subcontinente: usar el modelo como retriever sobre corpus en 13 lenguas, con la ventaja de que las consultas en latín funcionan sin traducción previa.
- Normalización de formularios y CRM: mapear nombres de lugares, productos o entidades escritos en latín a sus formas nativas canónicas mediante búsqueda de vecino más cercano.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Modelo | Parámetros | MTEB(Indic) | Dakshina roman→native R@1 | Native→roman R@1 | TanglishSTS |
|---|---|---|---|---|---|
| indic-e5-small | 47 M | 0,651 | 0,827 | 0,905 | 0,699 |
| multilingual-e5-small | 118 M | 0,648 | 0,396 | 0,498 | 0,729 |
| L3Cube indic-sentence-similarity-sbert | 238 M | 0,592 | 0,772 | 0,819 | 0,692 |
| bge-m3 | 568 M | 0,686 | 0,534 | 0,586 | 0,758 |
| LaBSE | 471 M | 0,617 | 0,478 | 0,436 | 0,750 |

Notas metodológicas del autor: MTEB(Indic, v1) es la media de 20 tareas (retrieval 0,780 frente a 0,768 de multilingual-e5-small); Dakshina usa 2000 frases romanizadas por humano por lengua en 10 lenguas, recuperando la frase nativa entre 2000; TanglishSTS mide Spearman sobre 325 pares tamil-inglés. Ni Dakshina ni TanglishSTS se usaron en entrenamiento ni para elegir checkpoints. La diferencia en TanglishSTS frente a multilingual-e5-small (−0,032) tiene un intervalo de confianza bootstrap del 95 % de [−0,081, +0,017], es decir, no significativa. En inglés el rendimiento se mantiene: STSB 0,837 frente a 0,841 y SICK-R 0,773 frente a 0,775.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 190 MB de pesos (47 M × 4 bytes) más activaciones; holgado en cualquier GPU.
- VRAM en int8 ONNX: unos 47 MB de pesos.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050 (usada para entrenar), RTX 4090, y también en CPU.
- Ejecutable en navegador y Node con transformers.js (`onnx/model_quantized.onnx`), con coseno ≥ 0,99 respecto al modelo completo.
- Despliegue: sentence-transformers, Text Embeddings Inference (el repo incluye el tag `text-embeddings-inference`), transformers.js y ONNX Runtime. No se documentan pesos GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; el tamaño reducido y la variante int8 sugieren coste bajo en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MTEB(Indic) | Romanizado | Licencia |
|---|---|---|---|---|---|
| indic-e5-small | 47 M | 512 | 0,651 | 0,827 / 0,905 | MIT |
| multilingual-e5-small | 118 M | 512 | 0,648 | 0,396 / 0,498 | MIT |
| L3Cube indic-sentence-similarity-sbert | 238 M | no disponible | 0,592 | 0,772 / 0,819 | no disponible |
| bge-m3 | 568 M | 8192 (según su model card) | 0,686 | 0,534 / 0,586 | MIT |
| LaBSE | 471 M | 256 | 0,617 | 0,478 / 0,436 | Apache 2.0 |

La ventaja diferencial de indic-e5-small es la brecha en romanizado: supera a modelos entre 5 y 12 veces más grandes en recuperación roman→nativo y nativo→roman, a costa de ceder algo en TanglishSTS (0,699 frente a 0,758 de bge-m3) y en MTEB(Indic) global frente a bge-m3 (0,651 frente a 0,686).

## Limitaciones y advertencias

- La romanización del entrenamiento es sintética; las faltas de ortografía muy informales y la mezcla de código intensa solo se aproximan con reglas y un léxico inducido.
- El tamil es la lengua más débil en entrada romanizada (Dakshina R@1 0,668 frente a 0,921 en hindi).
- El texto de entrenamiento es lenguaje escrito estilo Wikipedia; las formas coloquiales habladas (por ejemplo, tamil hablado "enakku pasikkudhu" frente a escrito "enakku pasikkiradhu") y los mensajes de chat cortos rinden peor.
- Longitud máxima de secuencia 512, pero el entrenamiento usó 128 tokens; el rendimiento más allá de esa longitud no está validado.
- La mejora en TanglishSTS no es estadísticamente significativa según el propio autor; no debe presentarse como una ventaja.
- Riesgo de alucinación no aplica en sentido generativo (es un encoder), pero sí hay riesgo de falsos positivos en similitud con textos muy cortos o ambiguos.
- Licencia MIT para el modelo; el corpus de entrenamiento Sangraha es CC BY 4.0 y los conjuntos de evaluación Dakshina (CC BY-SA 4.0) y TanglishSTS (CC BY 4.0) tienen condiciones propias si se redistribuyen.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cidcodes/indic-e5-small
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Demo Space: https://huggingface.co/spaces/cidcodes/indic-e5-small-demo
- Dataset de entrenamiento Sangraha: https://huggingface.co/datasets/ai4bharat/sangraha
- Paper de destilación (Reimers y Gurevych, 2020): https://arxiv.org/abs/2004.09813
- transformers.js: https://github.com/huggingface/transformers.js
