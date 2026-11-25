# LoganResearch/cyborg-translator-en-ru

## Resumen

Cyborg Translator EN↔RU es un modelo de traduccion bilingue ingles-ruso desarrollado por LoganResearch, entrenado desde cero sin partir de ningun modelo preentrenado. Se trata de un transformer causal de estilo GPT con aproximadamente 259,76 millones de parametros reales (el autor indica ~300M en la model card) y una ventana de contexto limitada por sus embeddings posicionales, no especificada de forma explicita. El modelo cubre la direccion bidireccional EN→RU y RU→EN mediante generacion condicional con etiquetas especiales `<EN>` y `<RU>`.

El proyecto destaca por su enfasis en la curacion de datos y la disciplina arquitectonica: corpus monolingue construido a partir de unas 40 obras de dominio publico en ingles, traduccion automatica controlada para generar el corpus paralelo, tokenizador SentencePiece BPE de 32k vocabulario entrenado especificamente para el par de idiomas y un proceso de alineacion supervisada en tres etapas. No se emplearon modelos de traduccion preentrenados ni tecnicas de RLHF o DPO; el autor justifica esta decision como forma de preservar la interpretabilidad de las representaciones aprendidas.

Es relevante ahora como caso de estudio reproducible de traduccion neuronal a pequena escala: demuestra que con curacion de datos rigurosa y supervision restringida se puede obtener traduccion coherente a nivel de frase con un presupuesto de computo de GPU de consumo. No obstante, sus propios autores lo posicionan como modelo de investigacion y educacion, explicitamente no apto para produccion ni para dominios legales o medicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo GPT adaptado a traduccion |
| Parametros totales | 259.764.224 (segun safetensors); ~300M indicados en la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitada por los embeddings posicionales; el autor no especifica el valor) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | ingles (en), ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 1,0 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de estilo GPT inicializado aleatoriamente, sin pesos preentrenados en ninguna fase. El tokenizador es un SentencePiece BPE con vocabulario de 32k entrenado desde cero sobre el corpus combinado EN+RU, con vocabulario multilingue compartido, tratamiento seguro de Unicode y sin trucos especificos por idioma, lo que favorece el reparto de parametros entre lenguas. El entrenamiento se realizo con AdamW y perdida de entropia cruzada sobre prediccion del siguiente token, con acumulacion de gradientes para simular lotes mayores y checkpoints evaluados manualmente, todo ello en GPUs de consumo.

El proceso consta de tres etapas. La primera es modelado de lenguaje monolingue mixto EN+RU para adquirir sintaxis, orden de palabras, gramatica y patrones de coocurrencia entre lenguas. La segunda es modelado de lenguaje bilingue con datos intercalados, que desarrolla representaciones multilingues internas y fluidez independiente en cada idioma. La tercera es un ajuste fino de alineacion para traduccion bidireccional, con ejemplos formateados como `<EN> frase origen` / `<RU> frase destino` y a la inversa, sin instrucciones en lenguaje natural ni formato de chat, con tasa de aprendizaje baja para preservar la fluidez. El corpus parte de unas 40 obras de dominio publico en ingles, limpiadas con scripts propios de Bash y Python (normalizacion de puntuacion, mayusculas y codificacion, segmentacion en frases, deduplicacion y filtrado de metadatos), y el corpus paralelo se genero con una pipeline automatica controlada que preserva la alineacion 1:1 entre frases y aplica filtros de longitud, idioma y calidad.

## Capacidades

- Traduccion bidireccional ingles-ruso a nivel de frase mediante generacion condicional con etiquetas `<EN>` y `<RU>`.
- Modelado de lenguaje causal en ambos idiomas (generacion de texto libre EN y RU).
- Coherencia gramatical estable a nivel oracional segun la evaluacion manual del autor.
- Estabilidad direccional verificada en ambos sentidos (EN→RU y RU→EN).
- No soporta tool calling ni function calling.
- No soporta comportamiento agentico ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking mode), vision ni audio.
- No esta alineado con instrucciones en lenguaje natural ni con formato conversacional.

## Casos de uso

- Investigacion en traduccion automatica de bajo recurso: sirve como linea base reproducible de traduccion EN↔RU entrenada desde cero, util para comparar el efecto de decisiones de curacion de datos y tokenizacion sobre la calidad final.
- Estudio del impacto del tokenizador en MT: al emplear un BPE de 32k entrenado especificamente para el par, permite aislar como afecta el vocabulario compartido al reparto de parametros y a la fidelidad de la traduccion.
- Experimentos educativos de entrenamiento end-to-end: el pipeline en tres etapas (monolingue, bilingue, alineacion) es replicable en GPUs de consumo y sirve para docencia sobre modelado de lenguaje y ajuste supervisado.
- Analisis de modos de fallo y alucinacion: el autor documenta deriva lexica y semantica ocasional, lo que lo convierte en un banco de pruebas para estudiar alucinacion en modelos pequenos bajo ambiguedad.
- Traduccion de frases sueltas en entornos de prototipado interno, aceptando revision humana posterior y sin uso en dominios legales, medicos o de produccion.
- Evaluacion comparativa de tecnicas de alineacion sin RLHF: permite medir hasta que punto la supervision condicionada estricta reduce la infidelidad frente a enfoques con modelado de preferencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta evaluacion manual e iterativa sobre precision de traduccion literal, coherencia a nivel de frase, frecuencia de alucinacion y estabilidad direccional, sin cifras cuantitativas (BLEU, chrF, MMLU, HumanEval u otras).

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 1,0-1,1 GB solo para los pesos (259,76M parametros a 4 bytes), mas overhead de activaciones y cache KV; el repo ocupa 1,0 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM efectiva para FP32; A100 y H100 son innecesarias para este tamano y solo tendrian sentido para lotes grandes o reentrenamiento.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso GPUs de gama baja con suficiente VRAM; tambien es viable en CPU para inferencia de frases sueltas.
- Opciones de despliegue: Hugging Face Transformers con `AutoTokenizer` y `AutoModelForCausalLM` (el autor incluye un ejemplo de inferencia de este tipo); llama.cpp, Ollama o vLLM requeririan conversion de pesos, no documentada en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyborg Translator EN↔RU | 259,76M | no disponible | Entrenado desde cero, traduccion EN↔RU condicionada | MIT | Hugging Face |
| Helsinki-NLP/opus-mt-en-ru | no disponible en la informacion proporcionada | no disponible | Transformer seq2seq de traduccion entrenado sobre corpus paralelos | no disponible en la informacion proporcionada | Hugging Face |
| NLLB-200 (variante destilada 600M) | no disponible en la informacion proporcionada | no disponible | Traduccion multilingue de Meta | no disponible en la informacion proporcionada | Hugging Face |
| Modelos GPT-2 pequenos (124M-355M) | no disponible en la informacion proporcionada | no disponible | Modelado de lenguaje causal monolingue | no disponible en la informacion proporcionada | Hugging Face |

Nota: los datos de las alternativas no estaban incluidos en la informacion proporcionada y se indican como no disponibles; la comparacion se limita a la categoria funcional, no a cifras verificadas.

## Limitaciones y advertencias

- No esta ajustado a instrucciones: no responde a peticiones en lenguaje natural ni a formato de chat; requiere el formato exacto de etiquetas `<EN>` y `<RU>`.
- Puede alucinar ante entradas ambiguas; el propio autor reconoce deriva lexica y semantica ocasional esperable a esta escala.
- Sin ajuste de seguridad: no dispone de filtros de contenido ni de alineacion de seguridad.
- No apto para produccion ni para uso legal o medico, segun la model card.
- Cobertura limitada a dos idiomas (ingles y ruso); no hay soporte multilingue adicional.
- Longitud de contexto no documentada, lo que dificulta planificar entradas largas; el autor indica que esta limitada por los embeddings posicionales.
- Corpus de entrenamiento pequeno (~40 libros de dominio publico) con traducciones al ruso generadas automaticamente, lo que puede introducir sesgos de dominio literario y artefactos de la pipeline de traduccion.
- Licencia MIT: permite uso comercial, pero las limitaciones tecnicas y la ausencia de garantias hacen desaconsejable ese escenario sin validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LoganResearch/cyborg-translator-en-ru
- DOI asociado: doi:10.57967/hf/8290
- No se han encontrado en la informacion disponible otros enlaces a papers, blogs, repositorios o demos.
