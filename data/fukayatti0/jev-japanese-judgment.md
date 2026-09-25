# fukayatti0/jev-japanese-judgment

## Resumen

Jev-japanese-judgment es un adaptador LoRA con una cabeza de clasificación personalizada construida sobre el modelo japonés LiquidAI/LFM2.5-1.2B-JP-202606. A diferencia de un modelo generativo convencional, no produce texto: recibe un contexto, una pregunta y una lista cerrada de candidatos, y devuelve una distribución de probabilidad sobre esos candidatos junto con la etiqueta ganadora. El autor es fukayatti0 y el proyecto se inspira explícitamente en el concepto "Jev" de TypeSafe AI, presentado en septiembre de 2026 como una alternativa no generativa y más barata a los modelos conversacionales. La cabeza sustituye al `lm_head` original: cada candidato se codifica como `[context][question][candidate_i]` y se puntúa con un MLP sobre el hidden state del último token, aplicando softmax entre candidatos.

El interés técnico está en su calibración y en su coste. Con solo 1.2B parámetros en el backbone (congelado, adaptado vía LoRA) obtiene una accuracy de 0.938 y un ECE de 0.0114 en un conjunto de validación de 500 ejemplos, lo que significa que sus probabilidades son directamente utilizables como umbral de confianza en producción, algo poco habitual en modelos generativos del mismo tamaño. El repositorio distribuye únicamente el adaptador y la cabeza extra (1.6 GB), no los pesos del modelo base.

Su principal fricción de adopción es la integración: al no seguir la arquitectura estándar de `transformers` para generación causal, no se puede cargar con `AutoModelForCausalLM` y requiere el código del repositorio de GitHub del autor. Está orientado a tareas japonesas de clasificación y juicio con espacio de respuestas cerrado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone transformer LiquidAI/LFM2.5-1.2B-JP-202606 congelado + adaptador LoRA + cabeza de scoring tipo cross-encoder (MLP sobre el hidden state del último token y softmax entre candidatos); no generativa, sin `lm_head` |
| Parámetros totales | 1.2B en el modelo base (según denominación del backbone); número exacto de parámetros del adaptador y de la cabeza: no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16 (precisión completa) e int8 dinámica per-channel incluida en `quantized/model.pt`; GGUF/AWQ/GPTQ: no disponible |
| Idiomas soportados | Japonés (ja) |
| Licencia | lfm1.0 (LFM Open License v1.0) para el modelo derivado; el código del repositorio es MIT |
| Formato de pesos | Adaptador PEFT en safetensors; modelo cuantizado completo serializado con `torch.save` en `quantized/model.pt` (pickle) |
| Modelo base | LiquidAI/LFM2.5-1.2B-JP-202606 |
| Biblioteca | peft |
| Tamaño del repositorio | 1.6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un caso de reutilización de un backbone lingüístico como encoder de juicio. El modelo base LFM2.5-1.2B-JP permanece congelado y se adapta mediante LoRA; el `lm_head` original se reemplaza por una cabeza personalizada que, para cada candidato, construye la secuencia `[context][question][candidate_i]`, extrae el hidden state del último token y lo proyecta con un MLP a una puntuación escalar. Las puntuaciones de todos los candidatos se normalizan con softmax para obtener una distribución de probabilidad. No hay decodificación autorregresiva en inferencia, por lo que el coste es proporcional al número de candidatos y no a la longitud del texto generado, y el resultado es determinista y calibrado por construcción.

Los datos de entrenamiento proceden de JCommonsenseQA, chABSA-dataset y JSNLI convertidos al formato Jev, con expansión mediante LLM y rebalanceo entre `source_dataset`. No se especifica en la información disponible el número de tokens ni de ejemplos de entrenamiento, ni si se aplicó RLHF o DPO (la formulación por softmax sobre candidatos hace innecesario un ajuste por preferencias). El autor documenta un proceso de cuantización con reconocimiento de cuantización (`qat.py`) y una evaluación específica del efecto de la cuantización int8 sobre la precisión.

## Capacidades

- Juicio con etiqueta tipada y probabilidad asociada sobre un conjunto cerrado de candidatos (sin generación de texto).
- Question answering de opción múltiple en japonés, con probabilidad calibrada por opción.
- Inferencia de relación textual (NLI) en japonés: implicación, contradicción y neutralidad.
- Análisis de sentimiento en japonés sobre texto y aspectos.
- Puntuación y ranking de candidatos, aprovechable como scorer o reranker en pipelines con espacio de respuestas acotado.
- Abstención implícita mediante umbral de probabilidad: al exponer una distribución calibrada, permite descartar predicciones de baja confianza.
- Ejecución en CPU mediante la versión int8 incluida.
- No soporta tool calling, function calling, uso de agentes, razonamiento multi-paso, visión, audio ni modo "thinking"; no es un modelo conversacional ni multilingüe (solo japonés).

## Casos de uso

- Clasificación de sentimiento en reseñas y encuestas japonesas: el modelo puntúa directamente las categorías definidas por el desarrollador (por ejemplo, positivo, neutro, negativo) y devuelve una probabilidad utilizable para priorizar revisiones humanas cuando la confianza es baja; entrenado en parte con chABSA-dataset, orientado a este tipo de texto.
- Inferencia de relación textual en pipelines de verificación: dado un par premisa-hipótesis en japonés, devuelve la relación con probabilidad, lo que permite filtrar automáticamente contenido contradictorio en bases documentales.
- Verificación de fidelidad en sistemas RAG japoneses: se formula la pregunta "¿el fragmento recuperado responde a la consulta?" y se ofrecen como candidatos respuestas del tipo sí/no/parcial, usando el ECE de 0.0114 para fijar el umbral de aceptación.
- Enrutado y triaje de tickets de soporte: con un conjunto cerrado de categorías del servicio, el modelo asigna cada consulta a una cola o equipo y aporta la probabilidad por categoría, lo que permite una segunda revisión automática de los casos ambiguos.
- Etiquetado asistido de datos de entrenamiento: al ser no generativo y determinista, sirve para preetiquetar corpus japoneses de clasificación y NLI, revisando después solo los ejemplos con probabilidad intermedia.
- Extracción de campos con vocabulario cerrado: para formularios o documentos donde el valor esperado pertenece a una lista conocida (provincias, categorías de producto, tipos de incidencia), el modelo emite la opción correcta y su probabilidad en lugar de texto libre.
- QA de sentido común en asistentes educativos o de consulta interna: dado un enunciado en japonés y cuatro opciones plausibles, devuelve la respuesta con margen de confianza; el modelo se entrenó sobre JCommonsenseQA.
- Despliegue en entornos sin GPU: la versión int8 per-channel permite ejecutar el clasificador en CPU en portátiles o servidores modestos, manteniendo un 0.895 de accuracy agregada en la evaluación de 200 ejemplos.

## Benchmarks y rendimiento

Resultados en validación held-out de 500 ejemplos (precisión completa, bf16), publicados por el autor:

| Métrica | Valor |
|---|---|
| Accuracy | 0.938 |
| ECE (Expected Calibration Error) | 0.011406073346734047 |
| Brier score | 0.09596636146306992 |
| NLL | 0.18879005312919617 |

Resultados con cuantización int8 dinámica per-channel (held-out de 200 ejemplos), publicados por el autor:

| Métrica | Valor |
|---|---|
| Accuracy (global) | 0.895 |
| ECE | N/A (no reportado) |
| Brier score | N/A (no reportado) |
| NLL | N/A (no reportado) |

Desglose por tarea con int8:

| Tarea | Accuracy | n |
|---|---|---|
| commonsense_qa | 0.8888888888888888 | 81 |
| nli | 0.8734177215189873 | 79 |
| sentiment | 0.95 | 40 |

No se han publicado comparaciones con MMLU, HumanEval, GSM8K ni otros benchmarks estándar, ni resultados frente a modelos de terceros en la información disponible. El autor indica que la cuantización int8 degrada la precisión unos pocos puntos porcentuales respecto a bf16, con el mayor impacto en NLI.

## Requisitos de hardware

- VRAM estimada: en bf16, el backbone de 1.2B ocupa aproximadamente 2,4 GB de pesos, más el adaptador y la cabeza; el repositorio completo ocupa 1.6 GB, por lo que el despliegue cabe holgadamente en GPUs de 4-6 GB. En int8, los pesos del backbone se reducen a alrededor de 1,2-1,3 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM (RTX 3060, RTX 4060 y superiores); en gama profesional, A100, H100 o L40S son suficientes pero sobredimensionadas para este tamaño.
- GPU de consumo: sí, cabe en cualquier GPU de consumo con 4-6 GB de VRAM, e incluso en CPU mediante la versión int8 incluida.
- Opciones de despliegue: no es compatible con `transformers` estándar (`AutoModelForCausalLM` no puede cargarlo) ni, por tanto, con vLLM, TGI o llama.cpp en su forma actual; requiere el código del repositorio de GitHub del autor (`eval.run_eval.load_model_from_checkpoint`, `predict`), o bien el script `python -m scripts.ask --device cpu --quantize`. Es compatible con el ecosistema PEFT para el adaptador.
- Latencia y throughput: no disponibles. Cabe esperar un coste lineal con el número de candidatos, ya que cada candidato requiere una pasada de codificación, y sin decodificación autorregresiva. La cuantización en el momento de carga añade tiempo de arranque, según indica el propio autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fukayatti0/jev-japanese-judgment | 1.2B (backbone) + LoRA y cabeza | No disponible | No generativo; juicio con probabilidad sobre candidatos | lfm1.0 (código MIT) | HuggingFace + GitHub |
| LiquidAI/LFM2.5-1.2B-JP-202606 (modelo base) | 1.2B | No disponible | Generativo autorregresivo | LFM Open License v1.0 | HuggingFace |
| Jev (TypeSafe AI) | No disponible | No disponible | No generativo; juicio tipado con probabilidad | Propietaria | Acceso anticipado limitado |
| Otros clasificadores japoneses basados en BERT/encoder | No disponible | No disponible | Clasificación discriminativa | Variable | HuggingFace |

No se dispone de resultados de benchmarks comparativos entre estas alternativas en la información proporcionada. La comparación directa con el modelo base no es significativa porque las tareas son distintas (generación frente a juicio cerrado).

## Limitaciones y advertencias

- Solo japonés: no hay soporte multilingüe ni evaluación en otros idiomas.
- No genera texto: no puede justificar sus decisiones ni mantener conversaciones; cualquier explicación debe construirse fuera del modelo.
- Espacio de respuestas cerrado: si el candidato correcto no está en la lista proporcionada, el modelo no puede señalarlo y devolverá la mejor opción disponible con una probabilidad posiblemente alta.
- No soporta tool calling, agentes ni razonamiento multi-paso; no es adecuado como sustituto de un LLM generativo en esos flujos.
- Integración no estándar: al no cargarse con `AutoModelForCausalLM`, no funciona con servidores de inferencia habituales (vLLM, TGI, Ollama) sin trabajo de adaptación.
- El archivo `quantized/model.pt` es un pickle cargado con `weights_only=False`; deserializar pickles de terceros implica riesgo de ejecución de código, por lo que conviene auditar el archivo o regenerar la cuantización localmente con el script del repositorio.
- Calibración degradada con int8: aunque el autor no reporta ECE ni Brier para la versión cuantizada, la caída de accuracy (0.938 a 0.895) y la mayor pérdida en NLI (0.873) sugieren que los umbrales de confianza deben recalibrarse si se usa int8 en producción.
- Datos de entrenamiento parcialmente sintéticos: el propio autor indica expansión mediante LLM, lo que puede introducir artefactos de estilo y sesgos del generador usado.
- Evaluación de alcance limitado: 500 ejemplos en bf16 y 200 en int8, sin desglose de intervalos de confianza ni evaluación por subgrupos; los resultados deben tomarse como indicativos.
- Riesgo de alucinación reducido por diseño (no genera texto), pero persisten errores de clasificación y sobreconfianza en dominios alejados de los datos de entrenamiento (sentido común, NLI y sentimiento).
- Licencia LFM Open License v1.0: es necesario revisar sus condiciones para uso comercial, redistribución y requisitos de atribución antes de integrar el modelo en un producto.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados publicados.
- Sesgos conocidos: no documentados por el autor; no disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fukayatti0/jev-japanese-judgment
- Dataset en HuggingFace: https://huggingface.co/datasets/fukayatti0/jev-japanese-judgment
- Repositorio de código (MIT): https://github.com/fukayatti/jev-japanese-judgment
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP-202606
- Licencia del modelo base (LFM Open License v1.0): https://huggingface.co/LiquidAI/LFM2.5-1.2B-JP-202606/blob/main/LICENSE
- Artículo sobre Jev (TechCrunch): https://techcrunch.com/2026/09/18/a-new-kind-of-ai-model-from-a-chatgpt-inventor-is-thrilling-developers/
- Entrada de Wikipedia sobre Jev: https://en.wikipedia.org/wiki/Jev_(AI_model)
