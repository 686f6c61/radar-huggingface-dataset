# sanyam2005/anlp-a2-part1-moe-shared

## Resumen

`sanyam2005/anlp-a2-part1-moe-shared` es un modelo de traducción automática de tipo decoder-only Transformer con capas de mezcla de expertos (MoE) desarrollado por el usuario sanyam2005 como parte de la asignatura Advanced NLP (ANLP), práctica 2, en el IIIT Hyderabad. Se ha entrenado desde cero, sin inicialización a partir de pesos preentrenados, sobre el corpus `belumind/en-vi-ja-curated-500k-triplets`, y cubre dos direcciones concretas: vietnamita→inglés y japonés→inglés. Su interés es fundamentalmente académico y experimental, no de producción.

El modelo tiene 35.274.240 parámetros totales, de los cuales 28.982.784 están activos por token (un 82,2 % del total). La variante de FFN implementada, denominada `moe_shared`, combina 1 experto compartido con 3 expertos enrutados y enrutamiento top-1, de modo que la mitad de los parámetros de la FFN se activan en cada paso. Se entrenó durante 50.011.655 tokens y alcanzó una pérdida de validación final de 1,8564.

No se ha publicado licencia, no tiene descargas ni valoraciones en Hugging Face, y la model card no incluye resultados de benchmarks. Esto lo sitúa como un artefacto de investigación reproducible y de tamaño muy reducido (0,1 GB de repositorio), útil para estudiar arquitecturas MoE y como línea base en tareas de traducción de bajo recurso, no como solución desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con FFN de mezcla de expertos (MoE), variante `moe_shared`: 1 experto compartido + 3 expertos enrutados, enrutamiento top-1 |
| Parámetros totales | 35.274.240 |
| Parámetros activos | 28.982.784 por token (82,2 % del total) |
| Parámetros de FFN (total / activos) | 12.592.128 / 6.300.672 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican pesos en formatos cuantizados) |
| Idiomas soportados | vietnamita, japonés, inglés (traducción vi→en y ja→en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `tokenizer.json` |

Datos adicionales: tokenizador BPE a nivel de byte (librería `tokenizers`), 50.011.655 tokens de entrenamiento y pérdida de validación final de 1,8564.

## Arquitectura y entrenamiento

Se trata de un Transformer decoder-only entrenado desde cero, es decir, sin partir de un modelo preentrenado ni aplicar destilación. La innovación principal del checkpoint es la variante de FFN `moe_shared`: en lugar de una FFN densa, cada capa MoE contiene 1 experto compartido (siempre activo) y 3 expertos enrutados entre los que se selecciona únicamente el mejor (top-1). Esto explica que los parámetros de FFN activos sean exactamente la mitad de los totales (6.300.672 frente a 12.592.128), mientras que el resto de la red (atención y embeddings, 22.682.112 parámetros) permanece densa y activa en su totalidad. El ahorro de cómputo frente a un modelo denso equivalente es, por tanto, moderado.

El entrenamiento utilizó el corpus `belumind/en-vi-ja-curated-500k-triplets`, con un presupuesto de 50.011.655 tokens, un volumen muy reducido en términos absolutos. No se documenta en la model card el uso de RLHF, DPO, instrucciones o ajuste de alineamiento de ningún tipo: el modelo es un traductor supervisado puro. El formato de prompt es `<bos> <vi|ja> source <en>` y la decodificación indicada por el autor es greedy hasta `<eos>`. La carga requiere el cargador personalizado `src.part1.evaluate.load_model_folder` del repositorio de la práctica, lo que implica que no es directamente compatible con `AutoModelForSeq2SeqLM` ni con los cargadores estándar de `transformers`.

## Capacidades

- Traducción vietnamita→inglés y japonés→inglés de frases y párrafos cortos.
- Generación de texto condicionada por un prefijo de idioma explícito (`<vi>` o `<ja>`) y un token de destino (`<en>`).
- Decodificación greedy autoregresiva hasta `<eos>`.
- Inferencia con pesos en safetensors y tokenizador BPE propio.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento (thinking), visión, audio ni multimodalidad.
- No se documenta capacidad multilingüe más allá de los tres idiomas del corpus; no hay evidencia de traducción inversa (en→vi, en→ja) ni de pares vi↔ja.
- No hay ajuste por instrucciones ni por preferencias humanas.

## Casos de uso

- Línea base académica para estudiar MoE: permite comparar la variante `moe_shared` (1 compartido + 3 enrutados, top-1) con otras variantes del mismo trabajo (por ejemplo, las publicadas por otros autores de la misma práctica) manteniendo fijos tokenizador, datos y presupuesto de entrenamiento.
- Reproducción de experimentos de enrutamiento: dado que los parámetros de FFN activos son exactamente la mitad de los totales, sirve para medir el equilibrio entre coste computacional y pérdida de validación en arquitecturas con enrutamiento disperso de baja dispersión.
- Traducción offline de textos cortos en dispositivos con recursos mínimos: con 35,3 M de parámetros, el modelo cabe en menos de 150 MB en fp32, por lo que puede ejecutarse en CPU o en cualquier GPU integrada para prototipos de traducción vi→en y ja→en sin conexión.
- Preprocesado de corpus en investigación: puede usarse para generar borradores de traducción de grandes volúmenes de texto vietnamita o japonés a inglés y después filtrar o corregir manualmente, siempre con revisión humana dado el tamaño del modelo.
- Evaluación de tokenizadores BPE a nivel de byte para lenguas no latinas: el repositorio incluye `tokenizer.json`, lo que facilita analizar la fragmentación de tokens en vietnamita y japonés de forma aislada al modelo.
- Material docente para prácticas de NLP avanzado: el formato de prompt explícito y la ausencia de ajuste por instrucciones lo hacen adecuado para ilustrar el ciclo completo de entrenamiento, evaluación y carga personalizada de pesos.
- Estudio de degradación por alucinación en modelos pequeños: con solo 50 M de tokens de entrenamiento, es un caso útil para medir a partir de qué longitud de secuencia y qué dominio la salida deja de ser fiel al original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de validación final:

| Métrica | Valor |
|---|---|
| Pérdida de validación final | 1,8564 |
| Tokens de entrenamiento | 50.011.655 |
| BLEU / chrF / METEOR | no disponible |
| MMLU, HumanEval, GSM8K | no disponible (no aplicables a un traductor) |

No se dispone de comparaciones numéricas con otros modelos de traducción vi→en o ja→en publicadas por el autor.

## Requisitos de hardware

- Peso de los pesos en memoria: aproximadamente 141 MB en fp32, 71 MB en fp16/bf16 y 35 MB en int8, calculados a partir de los 35.274.240 parámetros.
- VRAM estimada para inferencia: menos de 1 GB en cualquier precisión razonable, incluyendo caché KV para secuencias cortas; la activación del MoE (28,98 M de parámetros activos) no altera de forma significativa el peso en memoria.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPU integradas y en CPU. No requiere A100 ni H100.
- Despliegue: el autor indica cargar los pesos con `src.part1.evaluate.load_model_folder` del repositorio de la práctica, por lo que no hay integración estándar con `transformers`. No se publican archivos GGUF, por lo que el uso con llama.cpp u Ollama requeriría una conversión propia. No hay evidencia de soporte en vLLM ni en TGI.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el repositorio completo ocupa 0,1 GB.

## Comparativa con modelos similares

Se comparan a continuación los artefactos localizados en la búsqueda web. No hay datos públicos de parámetros, contexto, licencia ni rendimiento para las alternativas, por lo que la comparación se limita a lo verificable.

| Modelo | Autor | Arquitectura | Parámetros | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| sanyam2005/anlp-a2-part1-moe-shared | sanyam2005 | Decoder-only MoE, 1 compartido + 3 enrutados (top-1) | 35.274.240 totales / 28.982.784 activos | vi, ja, en | no disponible | Pérdida de validación 1,8564; carga mediante código propio |
| Yajat31/anlp-a2-part1-moe_shared | Yajat31 | MoE (variante `moe_shared`), misma práctica | no disponible | no disponible | no disponible | Sin model card publicada |
| unignoramus/anlp-a2-p1-moe-shared | unignoramus | MoE, misma práctica | no disponible | no disponible | no disponible | Sin datos públicos en la búsqueda |
| raunakseksaria/anlp-a2-moe | raunakseksaria | MoE, misma práctica | no disponible | no disponible | no disponible | Ficha en registro de terceros, sin metadatos confirmados |

No se dispone de modelos comparables de referencia con datos verificables en la información proporcionada, más allá de las variantes del mismo trabajo académico.

## Limitaciones y advertencias

- Ausencia de licencia: la model card no especifica licencia alguna, lo que impide determinar si el uso comercial está permitido. Se debe tratar como no apto para producción hasta que el autor lo aclare.
- Modelo de muy pequeño tamaño y presupuesto de entrenamiento reducido: 35,3 M de parámetros y 50 M de tokens. La calidad de traducción será limitada y no comparable a la de sistemas entrenados con cientos de miles de millones de tokens.
- Solo cubre dos direcciones de traducción (vi→en y ja→en). No hay evidencia de traducción inversa ni entre vietnamita y japonés.
- Sin ajuste por instrucciones ni alineamiento: no sigue instrucciones en lenguaje natural y no incorpora filtros de seguridad, por lo que puede generar contenido inapropiado si el texto de entrada lo contiene.
- Riesgo de alucinación elevado en secuencias largas: al ser un decoder-only entrenado desde cero sobre un corpus de 500.000 tripletas, es probable que pierda fidelidad y genere contenido no presente en el original.
- Longitud de contexto no documentada: se desconoce el máximo de tokens soportado, lo que impide garantizar un comportamiento correcto en documentos largos.
- Sesgos: no se documenta ningún análisis de sesgo demográfico, de género o cultural. El corpus de procedencia puede introducir sesgos propios de las lenguas y dominios cubiertos.
- Integración limitada: la carga depende de código del repositorio de la asignatura (`src.part1.evaluate.load_model_folder`), no de las APIs estándar de `transformers`. Esto complica su uso en marcos de despliegue convencionales.
- Fecha de publicación atípica (octubre de 2026 en los metadatos), sin actividad posterior ni mantenimiento conocido. Cero descargas y cero valoraciones.
- Ambigüedad de la etiqueta de idioma: el formato de prompt usa `<vi|ja>` como marcador de origen, pero no se documenta el comportamiento si se introduce un idioma distinto o se mezclan idiomas en la entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanyam2005/anlp-a2-part1-moe-shared
- Variante del mismo trabajo (Yajat31): https://huggingface.co/Yajat31/anlp-a2-part1-moe_shared
- Variante del mismo trabajo (unignoramus): https://huggingface.co/unignoramus/anlp-a2-p1-moe-shared
- Registro de terceros de otra variante (raunakseksaria): https://free2aitools.com/model/raunakseksaria/anlp-a2-moe
- Material de estudio de la asignatura ANLP (IIIT Hyderabad): https://github.com/Arihant25/anlp-study-guide
- Corpus de entrenamiento citado por el autor: `belumind/en-vi-ja-curated-500k-triplets` (no se ha localizado URL directa en la búsqueda)
