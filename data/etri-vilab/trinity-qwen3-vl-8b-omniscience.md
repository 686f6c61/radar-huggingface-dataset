# etri-vilab/Trinity-Qwen3-VL-8B-OmniScience

## Resumen

Trinity-Qwen3-VL-8B-OmniScience es un modelo vision-lenguaje (VLM) desarrollado por el laboratorio ETRI-VILAB, resultado de aplicar el método Trinity de auto-evolución con autoverificador sobre el modelo base Qwen3-VL-8B-Instruct. El modelo está especializado en razonamiento científico y matemático multimodal: responde preguntas sobre imágenes con razonamiento paso a paso y una respuesta final enmarcada. Su relevancia radica en el método de entrenamiento: un bucle de aprendizaje por refuerzo (RL) que no utiliza ninguna etiqueta pregunta-respuesta, sino que el propio modelo genera sus preguntas a partir de imágenes sin anotar, las responde y se autoevalúa mediante una copia EMA de sí mismo que actúa como verificador.

Arquitectura transformer multimodal de tipo Qwen3-VL, con 8.767.123.696 parámetros totales (8,77 mil millones) y pesos en formato safetensors. El repositorio ocupa 17,5 GB. Está publicado bajo licencia Apache 2.0 y su idioma declarado es el inglés.

El checkpoint liberado es únicamente el rol de "Solver": en despliegue se comporta como un Qwen3-VL estándar que responde con razonamiento encadenado y respuesta final en caja. Los roles de Questioner y Verifier solo se emplean durante el entrenamiento. El modelo reporta mejoras notables frente a su base en benchmarks científicos y matemáticos multimodales, lo que lo convierte en una opción interesante para tareas de razonamiento visual en dominios STEM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (familia Qwen3-VL) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (max_model_len usado en evaluacion con vLLM) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal que procesa imágenes y texto conjuntamente. Sobre esa base se aplica el método Trinity, un bucle de RL con tres roles desempeñados por el mismo modelo: Questioner (propone G pares pregunta-respuesta candidatos por imagen), Verifier (copia EMA de la política que filtra y puntúa) y Solver (responde K veces a la pregunta seleccionada). El entrenamiento se realizó sobre imágenes del corpus OmniScience sin usar en ningún momento sus preguntas, respuestas ni trazas de razonamiento: solo las imágenes crudas.

El filtrado de preguntas verifica que todas las premisas sean visibles en la imagen y que la pregunta no sea respondible sin ella, además de asignar un nivel de dificultad en cuatro grados. La evaluación de respuestas combina coincidencia basada en reglas, una guarda de discrepancia numérica dura y una comprobación de equivalencia por parte del Verifier. Existe un mecanismo de resolución de disputas: si al menos el 75 % de las respuestas del Solver coinciden en un valor distinto al de referencia y todas se marcan como incorrectas, el Verifier vuelve a resolver el problema y, si da la razón a los Solvers, corrige la referencia y revoca el crédito al Questioner. Las recompensas R_Q (Questioner) y R_S (Solver) se combinan en una única actualización conjunta con GSPO, tras la cual el Verifier se actualiza como media móvil exponencial de la política. El entrenamiento consistió en 300 pasos de RL sobre OmniScience.

## Capacidades

- Generación de texto y razonamiento multimodal: responde preguntas sobre imágenes con cadena de razonamiento paso a paso y respuesta final en caja.
- Razonamiento matemático visual: resolución de problemas matemáticos planteados sobre figuras, gráficos y diagramas.
- Razonamiento científico: química, física, biología y ciencias de la Tierra a partir de imágenes (reacciones, experimentos, mapas, figuras).
- Comprensión de imágenes en contexto conversacional (pipeline image-text-to-text).
- Modo de pensamiento: la plantilla de chat incluye prefijo `<think>\n` y el parser de razonamiento `qwen3` en la evaluación.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso más allá del razonamiento interno: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión, audio u otras: visión sí; audio no disponible.

## Casos de uso

- Tutoría científica multimodal: el modelo puede recibir la fotografía de un experimento, una reacción química o un diagrama de física y generar una explicación razonada paso a paso, adecuado por su entrenamiento específico en OmniScience y sus mejoras en EMMA-mini (química 17,5 → 32,0; física 43,3 → 52,3 en Avg@4).
- Corrección automática de problemas matemáticos con figura: útil para plataformas educativas que reciben enunciados con gráficos; el modelo responde con razonamiento explícito y respuesta final en caja, lo que facilita la extracción automática de la solución.
- Asistencia en investigación científica: interpretación de figuras de artículos, tablas de resultados y gráficos experimentales, aprovechando su rendimiento en LiveXiv VQA (81,5 Avg@4) y ScienceQA con imagen (96,0 Avg@4).
- Análisis de imágenes de laboratorio o de reacciones: con RxnBench VQA en inglés alcanza 85,8 Avg@4, por lo que puede emplearse para responder preguntas sobre reacciones químicas representadas visualmente.
- Generación de material didáctico STEM: a partir de una imagen de un concepto científico, el modelo puede producir explicaciones y preguntas de práctica; su entrenamiento sin etiquetas lo hace robusto ante dominios visuales poco anotados.
- Evaluación de pipelines de razonamiento visual en investigación: al ser un checkpoint con protocolo de evaluación reproducible (lmms-eval con backend vLLM, re-scoring separado), sirve como referencia para comparar métodos de RL auto-evolutivos en VLMs.
- Procesamiento de documentos técnicos con contexto largo: con ventana de 131.072 tokens puede ingerir múltiples figuras y texto en una sola llamada, útil para resúmenes de informes científicos extensos.

## Benchmarks y rendimiento

Resultados de la Tabla 1 del paper (precisión, %), una sola ejecución por modelo:

| Modelo | MathVision | MathVerse | MathVista | MMMU | EMVista | SciVQR-Bio | MME-SCI |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Qwen3-VL-8B-Instruct (base) | 52,3 | 58,2 | 76,7 | 57,0 | 44,8 | 56,7 | 19,0 |
| MM-Zero | 39,6 | 45,1 | 67,2 | 58,3 | 45,0 | 62,5 | 17,6 |
| DPE | 53,9 | 57,2 | 76,2 | 69,1 | 44,1 | 60,8 | 20,4 |
| Trinity (OmniScience) | 58,2 | 70,6 | 79,6 | 70,7 | 47,0 | 62,5 | 21,9 |

Benchmarks científicos del checkpoint liberado frente al base (precisión %, 4 muestras por ítem, presupuesto de 40.960 tokens):

| Benchmark | Ítems | Base Avg@4 | Trinity Avg@4 | Base Pass@4 | Trinity Pass@4 |
|---|:-:|:-:|:-:|:-:|:-:|
| EMMA-mini | 400 | 29,9 | 40,6 | 49,0 | 65,5 |
| RxnBench (VQA, en) | 1.525 | 75,6 | 85,8 | 78,5 | 94,2 |
| ScienceQA (img) | 2.017 | 94,5 | 96,0 | 95,1 | 98,4 |
| LiveXiv VQA (v7) | 5.120 | 81,0 | 81,5 | 83,2 | 91,3 |
| MSEarth (MCQ) | 2.784 | 48,8 | 48,8 | 51,9 | 69,9 |

EMMA-mini por asignatura (base → Trinity, Avg@4): química 17,5 → 32,0; programación 25,0 → 41,0; matemáticas 33,8 → 37,0; física 43,3 → 52,3. La reevaluación del checkpoint liberado en EMVista da 46,95 con 4 muestras por ítem, consistente con el 47,0 del paper. Las ganancias declaradas frente al base son: +13,7 MMMU, +12,4 MathVerse, +5,9 MathVision, +5,8 SciVQR-Bio, +2,9 MathVista, +2,9 MME-SCI y +2,2 EMVista.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión original (BF16): aproximadamente 17,5 GB solo para pesos, más memoria para el procesador visual y la caché KV; en la práctica se recomienda al menos 24-32 GB de VRAM para contexto moderado.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB), L40S (48 GB) para despliegue con contexto largo; RTX 4090 (24 GB) puede alojar los pesos en BF16 pero con margen ajustado para contexto extenso.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090 (24 GB) en BF16 con contexto limitado; en GPUs de 16 GB sería necesario cuantizar, aunque la información proporcionada no detalla cuantizaciones publicadas.
- Opciones de despliegue: transformers (librería declarada), vLLM con backend de lmms-eval para evaluación, y endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput: no disponible en la información proporcionada. En evaluación se usaron `max_new_tokens` de 20.480 (matemáticas) y 40.960 (ciencias), lo que implica generaciones largas en modo pensamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMMU | MathVerse | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Trinity-Qwen3-VL-8B-OmniScience | 8,77 B | 131.072 | 70,7 | 70,6 | Apache 2.0 | Hugging Face (etri-vilab) |
| Qwen3-VL-8B-Instruct (base) | ~8 B | no disponible en la información | 57,0 | 58,2 | no disponible en la información | Hugging Face (Qwen) |
| DPE | no disponible | no disponible | 69,1 | 57,2 | no disponible | no disponible |
| MM-Zero | no disponible | no disponible | 58,3 | 45,1 | no disponible | no disponible |

El contexto del modelo base se deduce de la configuración de evaluación (131.072 tokens), pero la información proporcionada no lo confirma explícitamente para Qwen3-VL-8B-Instruct. Los datos de licencia y disponibilidad de DPE y MM-Zero no están disponibles en la información consultada.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de inglés; su uso en castellano no está validado y probablemente degrade la calidad del razonamiento.
- Sesgos: no se documentan análisis de sesgos en la información proporcionada; al entrenarse sobre imágenes de OmniScience, puede heredar sesgos de composición y representación de ese corpus.
- Alucinación: el modelo genera razonamiento extenso y respuestas finales en caja; en preguntas visuales ambiguas puede producir premisas no visibles en la imagen. El propio método Trinity incluye verificación de fundamentación precisamente porque este fallo es frecuente en VLMs.
- Modo pensamiento obligatorio en la práctica: la evaluación usa prefijo `<think>` y presupuestos de hasta 40.960 tokens nuevos, lo que incrementa coste y latencia; no se documenta el rendimiento en modo no-pensamiento.
- Limitaciones de contexto: aunque la ventana es amplia, las imágenes de alta resolución y las generaciones largas consumen mucha memoria; no se detallan límites prácticos de resolución de imagen.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-VL-8B-Instruct debe cumplir su propia licencia, cuyos términos no se detallan en la información proporcionada.
- Reproducibilidad: los resultados del paper son ejecuciones únicas; el propio autor advierte que Pass@4 refleja diversidad de muestreo y recomienda comparar principalmente con Avg@4.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- En producción solo debe desplegarse el rol Solver; los roles Questioner y Verifier no forman parte del checkpoint liberado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/etri-vilab/Trinity-Qwen3-VL-8B-OmniScience
- Paper Trinity (arXiv:2610.04469): https://arxiv.org/abs/2610.04469
- Paper adicional referenciado (arXiv:2602.13758): https://arxiv.org/abs/2602.13758
- Modelo base Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- lmms-eval (herramienta de evaluación): https://github.com/EvolvingLMMs-Lab/lmms-eval
