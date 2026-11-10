# alllukaaa/rut5-menu-desc

## Resumen

rut5-menu-desc es un ajuste fino (fine-tuning) del modelo ai-forever/ruT5-base, un transformer encoder-decoder de 222.903.552 parámetros (223M) especializado en generación de texto a partir de datos estructurados (data-to-text). El modelo recibe el nombre de un plato, su categoría y una lista de ingredientes, y genera una descripción corta en ruso pensada para la ficha de producto de un mercado de alimentación (food marketplace). Lo desarrolla el usuario alllukaaa y se publica bajo el identificador alllukaaa/rut5-menu-desc.

El modelo resuelve un problema muy concreto de generación automática de copy para catálogos de comida: convertir datos estructurados (título, categoría, ingredientes) en descripciones legibles y consistentes. Está entrenado sobre 10.000 ejemplos durante 2 épocas con un objetivo supervisado estándar de seq2seq, sin RLHF ni DPO. Su relevancia es limitada fuera de ese nicho: es un modelo pequeño, monolingüe (ruso) y con un dominio de aplicación muy acotado, pero resulta útil como referencia de pipeline de data-to-text con validación de entrada, control de versión y flags de moderación integrados.

La ficha oficial documenta una comparación contra ocho variantes (incluido Qwen2.5-0.5B zero-shot y con LoRA, y baselines de plantilla/kNN) sobre un test de 300 ejemplos, con métricas chrF++, ROUGE-L y BERTScore. El modelo final combina los pesos del ajuste fino con una configuración de decodificación afinada (num_beams=4, length_penalty=2.0, etc.).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parametros totales | 222.903.552 (223M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens de entrada (truncado en entrenamiento e inferencia); salida max_new_tokens=80 |
| Tipos de cuantizacion | FP32 (850 MB) e INT8 dinámica (≈310 MB); no se documentan otras |
| Idiomas soportados | ruso (ru) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, con SHA-256 en model_version.json) |

## Arquitectura y entrenamiento

El modelo es un T5 encoder-decoder de 223M parámetros, heredado de ai-forever/ruT5-base, adaptado al ruso. El ajuste fino se realizó sobre 10.000 ejemplos durante 2 épocas, con batch 8, learning rate 5e-4, optimizador Adafactor y seed 42. No se documenta el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de los 10.000 pares (entrada estructurada → descripción de referencia). No hay indicios de RLHF, DPO ni preferencias humanas en el proceso.

La innovación técnica principal no está en la arquitectura, sino en el empaquetado del modelo como versión reproducible: los parámetros de generación (num_beams=4, no_repeat_ngram_size=2, length_penalty=2.0, min_new_tokens=15, max_new_tokens=80) forman parte de la versión y se registran tanto en model_version.json como en generation_config.json. La entrada se normaliza (NFC, eliminación de caracteres de control, colapso de espacios) y se serializa exactamente en el formato de entrenamiento, truncándose a 128 tokens con la marca input_truncated. La salida incorpora flags de validación de producto (health_claim, first_person, no_ingredient_mentioned, empty_output, input_truncated) que no alteran el texto pero sirven para moderación y monitorización.

## Capacidades

- Generación de descripciones de platos en ruso a partir de título, categoría e ingredientes (data-to-text).
- Normalización y validación de entrada con errores tipados (InputValidationError, equivalente a HTTP 422 en una futura API).
- Control de versión del modelo con verificación de integridad de pesos mediante SHA-256.
- Flags de moderación automática sobre la salida (health_claim, first_person, no_ingredient_mentioned, empty_output, input_truncated).
- Decodificación por beams (4) con penalización de longitud y control de repetición de n-gramas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: solo ruso.
- No tiene visión, audio ni modo thinking.

## Casos de uso

- Generación de fichas de producto en un food marketplace: el modelo convierte título, categoría e ingredientes en una descripción corta en ruso (≈70 caracteres de media) lista para publicar, con flags de moderación que detectan afirmaciones de salud no permitidas.
- Enriquecimiento de catálogos existentes: para productos con datos estructurados pero sin descripción, se genera texto consistente en lote; el truncado a 128 tokens y la validación de entrada permiten procesar miles de referencias con un pipeline determinista.
- Moderación previa a publicación: los flags health_claim y first_person permiten filtrar automáticamente descripciones que incumplen las reglas de la ficha de producto antes de que lleguen a revisión humana.
- Despliegue en CPU de bajo coste: con cuantización INT8 dinámica (≈310 MB) y 0,86 s de latencia p50 en CPU, es viable servirlo en infraestructura sin GPU para volúmenes moderados.
- Generación de variantes A/B de copy: al ser un modelo pequeño y determinista con beams, se pueden producir descripciones controladas para experimentos de conversión sin coste elevado.
- Base para ajustes posteriores en otros dominios data-to-text: su pipeline de validación, versionado y flags sirve como plantilla para adaptar ruT5-base a otros catálogos (recetas, menús de restaurante, ingredientes de supermercado).
- Prototipado rápido de data-to-text en ruso: al caber en 850 MB en FP32 y ejecutarse en CPU, permite iterar sin GPU dedicada.

## Benchmarks y rendimiento

Resultados sobre un test de 300 ejemplos (según la model card):

| Modelo | chrF++ (β=1) | ROUGE-L | BERTScore F1 | Ingredientes mencionados, % | avg chars |
|---|---|---|---|---|---|
| **ruT5-base + tuned decoding** | **19.89** | 17.65 | **52.88** | **78.7** | 70 |
| ruT5-base tuned (lr/batch) | 19.87 | 17.16 | 53.05 | 71.3 | 70 |
| ruT5-base fine-tuned | 18.32 | **18.09** | 52.04 | 71.0 | 49 |
| Qwen2.5-0.5B zero-shot | 17.86 | 11.31 | 49.06 | 98.7 | 153 |
| Qwen2.5-0.5B + LoRA | 15.90 | 11.07 | 48.88 | 40.0 | 61 |
| Template / kNN | ≤ 18.51 | ≤ 11.51 | ≤ 48.47 | — | — |

Rendimiento de inferencia (medido en Colab, 1 petición, beams=4):

| Modo | Pesos | Latencia p50 | chrF++ β=1 (50 ejemplos de test) |
|---|---|---|---|
| GPU T4, FP32 | 850 MB | 0.44 s | 20.95 |
| CPU, FP32 | 850 MB | 2.55 s | 20.95 |
| CPU, INT8 (dynamic) | ≈ 310 MB | 0.86 s | 21.27 |

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; en FP32 ocupa 850 MB y en INT8 dinámica ≈310 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el autor midió en una T4 (0,44 s p50).
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: no se documentan integraciones explícitas con vLLM, llama.cpp, Ollama o TGI; el modelo se sirve con la librería de Transformers (pesos safetensors) y admite cuantización INT8 dinámica.
- Latencia y throughput: p50 de 0,44 s en T4 FP32, 2,55 s en CPU FP32 y 0,86 s en CPU INT8. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | chrF++ (β=1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **rut5-menu-desc** | 223M | 128 tokens entrada | 19.89 | no disponible | Hugging Face |
| ruT5-base fine-tuned (mismo autor) | 223M | 128 tokens entrada | 18.32 | no disponible | variante interna del autor |
| Qwen2.5-0.5B zero-shot | 0.5B | no disponible en la ficha | 17.86 | no disponible en la ficha | Hugging Face (modelo generalista) |
| Qwen2.5-0.5B + LoRA | 0.5B | no disponible en la ficha | 15.90 | no disponible en la ficha | variante interna del autor |

La comparación se limita a las variantes evaluadas por el autor en la misma prueba de 300 ejemplos; no se dispone de comparación con otros modelos data-to-text en ruso.

## Limitaciones y advertencias

- El 21,7% de las respuestas en test contienen afirmaciones de salud (health claims) heredadas de los datos de referencia; por eso se incorpora el flag health_claim.
- Las respuestas son más cortas que la referencia: 71 caracteres frente a 113 de media.
- Solo funciona en ruso; no se entrenó con nombres ni ingredientes en kazajo.
- Las métricas de referencia (chrF++, ROUGE-L, BERTScore) no capturan bien la "apetitosidad" del texto y solo hay una referencia por ejemplo.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Riesgo de alucinación: puede omitir ingredientes de la entrada (el flag no_ingredient_mentioned lo detecta) o introducir afirmaciones no presentes en los datos.
- Sesgos: al entrenarse sobre descripciones de un marketplace concreto, puede reproducir estilos y afirmaciones comerciales de ese dominio.
- Entrada limitada a 128 tokens; entradas más largas se truncan y se marcan con input_truncated.
- Sin soporte de tool calling, agentes ni multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alllukaaa/rut5-menu-desc
- Modelo base: https://huggingface.co/ai-forever/ruT5-base
