# agk4444/telugu-poem-model

## Resumen

telugu-poem-model es un ajuste fino (fine-tune) de Udgam Labs Vemana-Base, un modelo de lenguaje de 278 millones de parámetros con arquitectura Gemma-4 text, especializado en la generación de poesía en telugu. Lo desarrolla AGK FIRE INC y se distribuye con licencia Apache-2.0. El modelo parte de una base preentrenada y se ha afinado sobre un corpus de 15.361 poemas en telugu para que reproduzca la forma métrica del verso telugu, en particular el estilo *Vemana satakam*, con sus cuatro líneas y el estribillo final característico (*makutam*).

El problema que aborda es concreto: disponer de un generador de verso telugu que mantenga la estructura formal (líneas, rima, cierre tradicional) a partir de una primera línea dada como indicación. No pretende ser una fuente de citas literales: la propia model card documenta un resultado de 0/40 en coincidencia exacta sobre poemas no vistos, tanto en la base como en el modelo afinado. Lo que cambia con el ajuste es la fidelidad a la forma, no la recuperación de contenido memorizado.

Es relevante ahora por su tamaño reducido (278M parámetros, repo de 1,1 GB), su licencia permisiva y su capacidad de ejecutarse en CPU, lo que lo hace accesible para experimentación en entornos con recursos limitados. A cambio, su ventana de contexto es de solo 1.024 tokens y está limitado al idioma telugu.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, layout Gemma-4 text |
| Parametros totales | 278.214.162 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (~570 palabras en telugu) |
| Tipos de cuantizacion | no disponible (el autor menciona exportación GGUF a llama.cpp como "planned") |
| Idiomas soportados | telugu (te) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con el layout de texto de Gemma-4 y tokenizador SentencePiece propio de 32.000 tokens, heredado de Vemana-Base (278.214.144 parámetros). El ajuste fino se realizó durante 3 épocas con tasa de aprendizaje 5e-5, decaimiento coseno y 3 % de warmup, con un batch efectivo de 32 (micro-batch 2 × 2 GPU × 8 pasos de acumulación). Se entrenó en fp32 con autocast fp16 (las T4 no soportan bf16) y checkpointing de activaciones, sobre 2× NVIDIA T4 en Kaggle durante aproximadamente 1 h 56 min. La pérdida final de entrenamiento fue 2,58, con medias por época de aproximadamente 2,94 / 2,51 / 2,15.

El corpus de entrenamiento consta de 15.361 poemas en telugu (v3), separados por líneas en blanco, con autores como Vemana (572 poemas), Bhagavatam, Sumati y Dasu, entre otros. Se generaron 16.385 documentos de entrenamiento: 15.321 poemas en bruto, 532 pares primera-línea → poema y 532 pares poema → significado. Los 40 poemas de evaluación se excluyeron de todos los tipos de documento. No se documenta uso de RLHF ni DPO; el ajuste es supervisado sobre texto.

## Capacidades

- Generación de texto en telugu con estructura de verso: cuatro líneas y estribillo final (*makutam*, p. ej. `విశ్వదాభిరామ వినురవేమ!`).
- Continuación a partir de una primera línea dada como indicación (cue).
- Generación de una sección de "significado" cuando se solicita en el formato adecuado.
- Mantenimiento de la forma métrica del estilo Vemana satakam, según la evaluación cualitativa del autor.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- Sin capacidades de visión, audio ni modo de pensamiento (thinking).
- Multilingüismo: únicamente telugu.

## Casos de uso

- Generación de borradores de verso telugu para talleres literarios: dado un primer verso, el modelo produce una composición de cuatro líneas con *makutam*, útil como punto de partida que el poeta revisa y corrige.
- Herramienta educativa para el estudio de la métrica Vemana: permite mostrar la estructura formal del satakam y comparar variantes generadas con poemas reales del corpus.
- Prototipado de aplicaciones de escritura creativa en telugu: al ejecutarse en CPU y ocupar 1,1 GB, puede integrarse en demos locales o entornos sin GPU para generar texto de relleno con forma poética.
- Generación de texto sintético con estructura fija para aumentar datasets de NLP en telugu, siempre que se valide la calidad y no se use como sustituto de poemas reales.
- Experimentación académica sobre ajuste fino de modelos pequeños en lenguas de bajos recursos: sirve como caso de referencia reproducible (2× T4, ~2 h) para estudiar cómo el fine-tuning cambia la forma sin mejorar la recuperación literal.
- Filtrado y anotación asistida de corpus poéticos: el modelo puede proponer "significados" plausibles para poemas, que un revisor humano contrasta con fuentes, acelerando el etiquetado preliminar.

## Benchmarks y rendimiento

El autor publica una única evaluación: coincidencia exacta literal sobre 40 poemas Vemana no vistos, con decodificación greedy y normalización Unicode y de espacios.

| Modelo | Coincidencia exacta literal |
|---|---|
| Vemana-Base (base) | 0 / 40 |
| telugu-poem-model (fine-tuned) | 0 / 40 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 278M parámetros; en fp32 ocupa aproximadamente 1,1 GB de pesos, y en fp16 alrededor de 0,56 GB. Con overhead de inferencia, cabe holgadamente en GPUs de 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente; el autor lo entrenó en 2× NVIDIA T4.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM; también se ejecuta en CPU según el autor.
- Opciones de despliegue: transformers (probado por el autor); exportación a GGUF para llama.cpp está planificada pero no disponible; no se documenta soporte de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| telugu-poem-model | 278M | 1.024 | telugu | Apache-2.0 | Poesía telugu (Vemana) |
| Vemana-Base (base) | 278M | no disponible | telugu | Apache-2.0 | Modelo base de texto telugu |
| Vemana RAG | no disponible | no disponible | telugu | no disponible | Recuperación con citas de número de poema |

La comparación más directa es con Vemana-Base, del que deriva: comparten tamaño y licencia, pero el fine-tune mantiene la forma poética mientras la base "se desvía de la forma", según el autor. Para citas literales, el propio autor recomienda el sistema Vemana RAG en lugar de este modelo. No se dispone de datos de otros modelos comparables de poesía en telugu en la información proporcionada.

## Limitaciones y advertencias

- Sin recuperación literal de poemas no vistos: 0/40 en coincidencia exacta. No debe usarse como fuente de citas.
- Modelo pequeño (278M): inventa versos y a veces mezcla líneas de otros poemas; las secciones de "significado" pueden ser plausibles pero incorrectas.
- Solo telugu; no hay soporte multilingüe.
- Contexto limitado a 1.024 tokens (unas 570 palabras en telugu), insuficiente para documentos largos.
- La decodificación por muestreo se desvía rápidamente de la forma; el autor recomienda decodificación greedy.
- Riesgo de alucinación inherente a un modelo de este tamaño, agravado por la tarea creativa.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache-2.0, igual que la base, permisiva para uso comercial; no se documentan restricciones adicionales.
- Para producción, conviene validar la salida con revisión humana y no confiar en la fidelidad factual del contenido generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agk4444/telugu-poem-model
- Modelo base Vemana-Base: https://huggingface.co/udgamlabs/Vemana-Base
- Dataset de ajuste fino (privado): https://huggingface.co/datasets/agk4444/telugu-poems-finetune
- Vemana RAG (recuperación con citas): https://vemana.socialnews.xyz
