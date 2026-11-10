# karabunar/qwen2.5-1.5b-turkish-news-summarization-qlora

## Resumen

El modelo `karabunar/qwen2.5-1.5b-turkish-news-summarization-qlora` es un adaptador LoRA (entrenado con QLoRA) que especializa el modelo base Qwen2.5-1.5B-Instruct en la tarea de resumir noticias en turco en una o dos frases. Lo desarrolla el usuario de Hugging Face `karabunar` y resuelve un problema muy concreto: convertir un articulo periodistico en turco en un resumen breve y legible, una tarea en la que el modelo base sin ajuste rinde de forma notablemente inferior.

El adaptador se entrena sobre 4907 pares articulo-resumen del dataset `ahmetyaylalioglu/turkish-news-summarization-collection`, con un LoRA de rango 16 sobre las proyecciones de atencion del transformer Qwen2.5-1.5B. El resultado es un incremento muy marcado en las metricas de solapamiento (ROUGE-L pasa de 21,57 en zero-shot a 47,12 con el adaptador), aunque el propio autor advierte de que buena parte de la mejora se debe a la imitacion del estilo de "copia del lead" presente en el dataset.

Es relevante ahora porque demuestra un caso practico de ajuste eficiente de un modelo pequeno (1.5B) para una tarea de dominio especifico en un idioma de recursos medios como el turco, con un coste de entrenamiento de apenas unas horas en una unica GPU de 16 GB. No obstante, sus limitaciones (copia literal, nombres y cifras no soportados, dominio unico) lo hacen adecuado para prototipado y experimentacion mas que para produccion sin verificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.5B (modelo base); adaptador LoRA con r=16, α=32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con `max_seq_length=2048`; articulos recortados a 2500 caracteres) |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (base); adaptador en safetensors |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.5 mil millones de parametros. El ajuste LoRA utiliza rango 16, alpha 32, dropout 0.05 y se dirige a las proyecciones `q_proj, k_proj, v_proj, o_proj`. El modelo base se carga en 4-bit NF4 con doble cuantizacion y computo en bf16, y la perdida se calcula unicamente sobre los tokens del resumen, no sobre la instruccion ni el articulo.

El entrenamiento usa 4907 pares del split de entrenamiento del dataset `ahmetyaylalioglu/turkish-news-summarization-collection`, con `shuffle(seed=42)`, durante 3 epocas (918 pasos), learning rate 2e-4 con scheduler coseno y warmup del 5 %, batch 2 con acumulacion de gradiente 8, `paged_adamw_8bit` y gradient checkpointing. Se ejecuto en una unica RTX A4000 (16 GB) en aproximadamente 2 horas y 45 minutos, con torch 2.2.1, transformers 2.44.2, peft 0.12.0, trl 0.9.6 y bitsandbytes 0.43.3. No se menciona RLHF ni DPO; el ajuste es supervisado sobre pares de resumen.

## Capacidades

- Generacion de resumenes de noticias en turco en una o dos frases a partir de un articulo de entrada.
- Generacion de texto general heredada del modelo base Qwen2.5-1.5B-Instruct (aunque el adaptador esta especializado y puede degradar el comportamiento general).
- Seguimiento de instrucciones en formato chat mediante `apply_chat_template` de Qwen.
- No se documenta soporte de tool calling, function calling ni agentes en la informacion disponible.
- No se documenta soporte de vision, audio ni modo thinking.
- Capacidad multilingue limitada al turco segun la model card (idioma declarado: `tr`).

## Casos de uso

- Resumen automatico de noticias en turco para portales y agregadores: el adaptador convierte un articulo en 1-2 frases, adecuado para generar extractos o teasers en listados de noticias.
- Generacion de boletines y newsletters: permite resumir decenas de articulos de un feed RSS en titulares breves antes de la revision editorial.
- Preprocesado para sistemas de recomendacion de contenido: los resumenes cortos sirven como representacion semantica de cada noticia para clasificacion o similitud.
- Asistencia a redactores: ofrece un primer borrador de sumario que el periodista revisa y corrige, acelerando el trabajo en redacciones con volumen alto.
- Moderacion y triaje de noticias: resumenes rapidos para que un operador humano decida que articulos requieren atencion prioritaria.
- Prototipado e investigacion en PLN turco: ejemplo reproducible de QLoRA sobre un modelo de 1.5B con un coste de hardware bajo, util como linea base en experimentos de sumarizacion.
- Indexacion y busqueda: los resumenes generados pueden almacenarse como metadatos para motores de busqueda internos de medios.

## Benchmarks y rendimiento

Evaluacion sobre el split de test completo (273 articulos), decodificacion greedy, `max_new_tokens=80`, base en 4-bit NF4. ROUGE con tokenizador turco consciente de Unicode; BERTScore con `dbmdz/bert-base-turkish-cased` (capa 9).

| Modelo / configuracion | ROUGE-1 | ROUGE-2 | ROUGE-L | chrF++ | BERTScore-F1 |
|---|---|---|---|---|---|
| Zero-shot (base) | 25,24 | 13,48 | 21,57 | 27,92 | 56,89 |
| Few-shot, 3 ejemplos (base) | 28,95 | 17,50 | 25,06 | 28,99 | 59,32 |
| Persona + CoT (base) | 25,80 | 14,92 | 22,02 | 28,42 | 56,63 |
| Este adaptador | 48,62 | 41,74 | 47,12 | 41,70 | 71,34 |
| Baseline primeras 28 palabras | 43,61 | 36,18 | 40,07 | 42,92 | 65,87 |

Rendimiento de despliegue en RTX A4000 segun el autor:

| Configuracion | ROUGE-L | Velocidad de decodificacion |
|---|---|---|
| Adaptador sin fusionar sobre base 4-bit | 47,1 | ~33 % mas lento por paso |
| Fusionado en base 4-bit recuantizada | 27,1 | velocidad completa |
| Fusionado en base bf16 | 45,4 | velocidad completa, doble de memoria de pesos |

## Requisitos de hardware

- Inferencia con el adaptador sin fusionar sobre base 4-bit NF4: cabe en GPUs consumer de 16 GB (probado en RTX A4000); estimacion orientativa de 2-4 GB de VRAM para los pesos cuantizados mas overhead de activaciones.
- Base en bf16: aproximadamente 3 GB solo de pesos, mas cache KV y activaciones; cabe en GPUs de 8 GB o superiores.
- GPUs recomendadas: RTX A4000, RTX 4090, A100 o H100 para mayor throughput; cualquier GPU con al menos 8-16 GB es suficiente para inferencia.
- Despliegue: transformers + peft + bitsandbytes (configuracion documentada); no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia: no disponible; el autor solo indica que el adaptador sin fusionar es ~33 % mas lento por paso de decodificacion que la base fusionada.
- Entrenamiento: reproducible en una unica RTX A4000 (16 GB) en unas 2 h 45 min.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-1.5B + LoRA) | 1.5B | no disponible (entrenado a 2048) | Sumarizacion de noticias en turco | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-1.5B-Instruct (base) | 1.5B | no disponible en la informacion | Modelo generalista multilingue | Apache 2.0 | Hugging Face |
| Baseline primeras 28 palabras | 0 | n/a | Heuristico de extraccion | n/a | n/a |
| Otros adaptadores de sumarizacion en turco | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos de sumarizacion en turco en la informacion proporcionada.

## Limitaciones y advertencias

- Copia literal: el 76 % de los 3-gramas generados aparecen en el articulo, frente al 62 % de las referencias; gran parte de la mejora en ROUGE se debe a imitacion de estilo y solo supera ligeramente al baseline de primeras 28 palabras en chrF++.
- Nombres y cifras no soportados: aproximadamente el 7 % de los nombres propios y numeros en mayuscula de las salidas no aparecen en el articulo (heuristica aproximada); es imprescindible verificar hechos antes de publicar.
- Dominio unico: entrenado y evaluado sobre un unico dataset de noticias rastreadas por RSS; se esperan resultados peores en otros dominios o estilos de escritura.
- Idioma: solo turco; no se garantiza comportamiento en otros idiomas.
- Licencia: adaptador Apache 2.0, coherente con el modelo base; los datos de entrenamiento son CC BY 4.0, lo que conviene respetar en uso comercial.
- Repositorio con 0 descargas y 0 likes: sin validacion de la comunidad; el autor recomienda mantener el adaptador sin fusionar sobre la base 4-bit, ya que fusionarlo en una base recuantizada degrada gravemente el ROUGE-L (27,1 frente a 47,1).
- Riesgo de alucinacion en resumenes de noticias: la combinacion de copia y sustitucion de entidades puede producir resumenes plausibles pero incorrectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/karabunar/qwen2.5-1.5b-turkish-news-summarization-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/ahmetyaylalioglu/turkish-news-summarization-collection
- Codigo, prompts y evaluacion: https://github.com/karabunar/turkish-news-summarization
- Modelo de BERTScore turco: https://huggingface.co/dbmdz/bert-base-turkish-cased
