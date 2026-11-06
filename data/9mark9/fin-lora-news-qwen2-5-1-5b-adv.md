# 9mark9/fin-lora-news-qwen2.5-1.5b-adv

## Resumen

`fin-lora-news-qwen2.5-1.5b-adv` es un adaptador LoRA entrenado sobre Qwen2.5-1.5B-Instruct (de Alibaba Qwen) para clasificar textos financieros cortos en inglés —titulares, fragmentos de noticias y tuits— en tres clases: Bearish, Bullish o Neutral. Su rasgo distintivo es el entrenamiento adversarial mediante "planted-sentence augmentation": durante el entrenamiento se insertan frases con etiquetas falsas en el texto de entrada para que el modelo aprenda a ignorarlas.

El proyecto aborda un problema real y bien documentado: los clasificadores de sentimiento financiero afinados con métodos estándar son muy vulnerables a que una única frase inyectada en la entrada cambie por completo la predicción. Según la model card, este adaptador alcanza un 91,1 % de precisión frente a frases plantadas de la demo (frente al 50,6 % del adaptador estándar de 1,5B), manteniendo un 90,8 % de precisión sobre datos limpios; sin embargo, párrafos persuasivos más largos no vistos en entrenamiento aún lo degradan hasta el 75,0 %.

Técnicamente, el modelo base permanece como modelo de lenguaje causal: la etiqueta se lee de los logits de siguiente token de tres tokens de etiqueta al final de un prompt fijo, sin generar texto. El adaptador pesa 18.464.768 parámetros y está orientado a investigación y educación sobre robustez de modelos pequeños afinados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-1.5B-Instruct (transformer decoder causal) |
| Parametros totales | 18.464.768 (solo el adaptador); modelo base: 1.500 millones aprox. |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | no disponible (base en bfloat16 durante entrenamiento) |
| Idiomas soportados | Ingles (solo evaluado en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, ~0,1 GB el repositorio) |

## Arquitectura y entrenamiento

El adaptador LoRA usa rango 16, alpha 32, dropout 0,05 y sin bias, aplicado a los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo base. El objetivo de entrenamiento es cross-entropy sobre los logits de los tres tokens de etiqueta en la última posición del prompt; no hay generación de texto. El texto de entrada se trunca (nunca el prompt), de modo que la señal final `Sentiment:` siempre sobrevive, corrigiendo un defecto de la primera versión de los adaptadores.

El entrenamiento usó 17.770 ejemplos deduplicados de tres fuentes: tweets financieros (zeroshot/twitter-financial-news-sentiment, 8.424 ejemplos), titulares validados manualmente (Jean-Baptiste/financial_news_sentiment, 1.346) y fragmentos de noticias etiquetados por un ensamble de LLMs (NOSIBLE/financial-sentiment, 8.000). Se aplicó higiene de datos estricta: eliminación de cualquier texto de entrenamiento que coincidiera con ítems de dev o test tras normalización. La innovación central es la planted-sentence augmentation: en cada época, una mitad aleatoria de los textos recibió una frase plantada con etiqueta aleatoria (manteniendo la etiqueta verdadera), extraída de 20 plantillas de entrenamiento; las 7 formulaciones usadas en la demo y en la evaluación held-out quedaron fuera del entrenamiento.

Los hiperparámetros: AdamW con learning rate pico 1e-4, weight decay 0,01, schedule one-cycle con 5 % de warm-up, gradient clipping 1,0, batch size 16, 2 épocas, seed 0 y gradient checkpointing. El checkpoint final se eligió por macro-F1 pooled en dev más precisión bajo plantillas de validación. El hardware fue una única NVIDIA A10G en Modal. Los hiperparámetros se seleccionaron con un barrido previo sobre la base de 0,5B (learning rate, rango 16 vs 32, label smoothing).

## Capacidades

- Clasificacion de sentimiento financiero en ingles en tres clases: Bearish (0), Bullish (1) y Neutral (2), sobre titulares, fragmentos de noticias y tuits.
- Robustez mejorada frente a inyeccion de frases plantadas: 91,1 % de precision bajo las frases de la demo frente al 50,6 % del adaptador estandar de 1,5B.
- Precision en datos limpios de 90,8 %, comparable a un clasificador afinado convencional.
- Clasificacion por logits de siguiente token (no genera texto), lo que permite inferencia determinista y rapida.
- No soporta tool calling, agentes ni capacidades multimodales; su ambito es exclusivamente la clasificacion de texto corto en ingles.

## Casos de uso

- Investigacion en robustez adversarial: estudiar como la inyeccion de texto manipula clasificadores afinados y evaluar mitigaciones; el modelo incluye una demo Space (fin-lora-attack-demo) para probar ataques en vivo.
- Docencia y formacion: caso de estudio practico sobre LoRA, PEFT, higiene de datos y evaluacion adversarial en cursos de NLP aplicado a finanzas.
- Prototipado de analisis de sentimiento financiero: clasificar lotes de titulares o tuits como Bearish/Bullish/Neutral en entornos de investigacion, aprovechando que cabe en una sola GPU de consumo.
- Comparacion de adaptadores: servir de baseline robusto frente a adaptadores estandar (sin entrenamiento adversarial) del mismo proyecto (version 0,5B y 1,5B).
- Benchmark de vulnerabilidad: medir cuanto degrada un parrafo persuasivo la precision de un clasificador pequeno (75,0 % en el conjunto held-out de este modelo).
- Validacion de pipelines de etiquetado: usarlo como clasificador de referencia en experimentos controlados, nunca en produccion con dinero real.

## Benchmarks y rendimiento

Datos publicados en la model card (sin comparativa amplia con otros modelos del sector):

| Metrica | Valor |
|---|---|
| Precision bajo frases plantadas de la demo (7 plantillas) | 91,1 % |
| Precision del adaptador estandar 1,5B bajo las mismas frases | 50,6 % |
| Precision en datos limpios | 90,8 % |
| Precision bajo parrafos persuasivos held-out | 75,0 % |
| Pooled dev macro-F1 (epoca 2) | 0,867 |
| Tweets dev macro-F1 (epoca 2) | 0,893 |
| Dev accuracy bajo plantillas de validacion (epoca 2) | 0,899 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) ni comparativas con modelos de la industria en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA de 18,5 millones de parametros sobre un modelo base de 1,5B, la inferencia en bfloat16 requiere aproximadamente 3-4 GB de VRAM para el modelo base mas margen para el adaptador y activaciones (estimacion; la model card no especifica VRAM de inferencia).
- GPU de entrenamiento: una unica NVIDIA A10G (24 GB) fue suficiente, desplegada en Modal.
- Cabe con holgura en GPUs de consumo tipo RTX 3060/4060 o superiores, dado el tamano del modelo base de 1,5B.
- Despliegue: al usar la libreria peft con transformers, funciona con `PeftModel` estandar; la demo oficial esta en Hugging Face Spaces. No se menciona soporte especifico para vLLM, llama.cpp, Ollama o TGI (los adaptadores LoRA en formato PEFT no son directamente GGUF).
- Latencia y throughput: no disponible en la informacion proporcionada; al ser clasificacion por logits sin generacion, la latencia por item deberia ser baja.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Precision adversarial | Licencia |
|---|---|---|---|---|---|
| fin-lora-news-qwen2.5-1.5b-adv (este) | LoRA sobre Qwen2.5-1.5B-Instruct | 18,5 M (adaptador) | 256 tokens | 91,1 % (frases demo) / 75,0 % (parrafos held-out) | Apache 2.0 |
| Adaptador estandar 1,5B (mismo proyecto, sin entrenamiento adversarial) | LoRA sobre Qwen2.5-1.5B-Instruct | no disponible | 256 tokens | 50,6 % (frases demo) | no disponible |
| fin-lora-news-qwen2.5-0.5b-adv (v2, mismo proyecto) | LoRA sobre Qwen2.5-0.5B-Instruct | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Vulnerabilidad residual: un parrafo persuasivo largo no visto en entrenamiento reduce la precision al 75,0 %; una sola frase plantada de formulaciones nuevas todavia cambia la etiqueta en parte de los casos.
- El autor prohibe explicitamente su uso para decisiones de trading automatizado o cualquier decision que mueva dinero; la salida no es consejo de inversion ni prediccion de precio.
- Solo evaluado en ingles, sobre textos cortos (tuits, titulares, fragmentos) y dentro de la ventana de 256 tokens; no evaluado en filings, transcripciones de earnings calls, texto no ingles ni entradas largas.
- Parte de los datos de entrenamiento (NOSIBLE, 8.000 ejemplos) tiene etiquetas generadas por un ensamble de LLMs, no humanas, lo que puede introducir ruido sistematico; la procedencia de las etiquetas del dataset de tuits no esta documentada.
- Riesgo de alucinacion: no aplicable como tal (no genera texto), pero la clasificacion puede ser erratica ante inputs fuera de distribucion.
- La licencia ODC-By 1.0 del dataset NOSIBLE exige atribucion en usos derivados.
- Modelo con muy poca adopcion publica (37 descargas y 1 like en el momento de la ficha), sin auditoria externa; el README parece estar truncado (la lista de versiones de librerias no se completa).
- Uso previsto: investigacion y educacion; no hay garantias para entornos de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/9mark9/fin-lora-news-qwen2.5-1.5b-adv
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Demo Space: https://huggingface.co/spaces/9mark9/fin-lora-attack-demo
- Codigo y write-up: https://github.com/shaikn6/fin-lora
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/zeroshot/twitter-financial-news-sentiment
  - https://huggingface.co/datasets/Jean-Baptiste/financial_news_sentiment
  - https://huggingface.co/datasets/NOSIBLE/financial-sentiment
