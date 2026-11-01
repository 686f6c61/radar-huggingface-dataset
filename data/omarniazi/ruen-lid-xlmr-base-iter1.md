# OmarNiazi/ruen-lid-xlmr-base-iter1

## Resumen

El modelo `ruen-lid-xlmr-base-iter1`, publicado por OmarNiazi, es un clasificador de tokens (token-classification) construido mediante fine-tuning de `FacebookAI/xlm-roberta-base` (277.455.363 parámetros). Su tarea es el etiquetado a nivel de palabra de texto code-mixed en escritura latina entre roman urdu y inglés: cada palabra se clasifica como **UR**, **EN** u **OTH** (nombres, menciones, enlaces). Forma parte de la segunda etapa (clasificador sensible al contexto) de un pipeline RU-EN-LID de tres etapas, donde la primera expande candidatos y la tercera aplica verificación basada en reglas.

El detalle crítico es que se trata de un modelo entrenado por proxy: no existe todavía un corpus de roman urdu con etiquetas de idioma a nivel de palabra, por lo que el autor ha utilizado la parte en escritura latina de COMI-LINGUA (hindi romanizado–inglés con anotación experta), mapeando la etiqueta `hi` a `UR`. El roman hindi comparte la mayor parte del vocabulario cotidiano con el roman urdu, pero el modelo no se ha evaluado sobre texto anotado de roman urdu real, lo que condiciona fuertemente su fiabilidad en producción.

Es relevante ahora porque el code-mixing urdu–inglés en redes sociales es un fenómeno masivo y mal cubierto por los modelos multilingües convencionales, y porque demuestra una estrategia de transferencia entre variedades lingüísticas cercanas cuando faltan datos anotados. Con 29 descargas y 0 likes, es un recurso de nicho, orientado a pipelines de normalización y preprocesado lingüístico más que a uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base), fine-tuning para token classification |
| Parametros totales | 277.455.363 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 piezas (max_length de entrenamiento); la arquitectura base admite hasta 512 posiciones |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | ur, hi, en (en la practica, texto code-mixed roman urdu–inglés en escritura latina) |
| Licencia | CC BY-SA 4.0 (modelo base MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer XLM-RoBERTa base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención) con una cabeza de clasificación de tokens sobre tres etiquetas (UR, EN, OTH). El fine-tuning se realizó sobre las frases en escritura latina de COMI-LINGUA LID: 6.540 frases de entrenamiento y 727 de validación. La preparación de datos aplicó mayoría de 2 de cada 3 anotadores por palabra, excluyendo de la pérdida las palabras sin mayoría, eliminando frases de entrenamiento presentes en el fichero de test y segmentando las palabras igual que el tokenizador del pipeline. La etiqueta se asigna únicamente al primer sub-token de cada palabra (`is_split_into_words=True`).

Los hiperparámetros fueron 5 épocas (mejor época por macro-F1 de validación: la quinta), learning rate 3e-5, 10 % de warm-up, weight decay 0,01, batch de 16, precisión bf16, máximo de 256 piezas y semilla 2. No se documenta uso de RLHF ni DPO, ni innovaciones arquitectónicas adicionales más allá del esquema de etiquetado por primer sub-token y la transferencia desde hindi romanizado a roman urdu.

## Capacidades

- Etiquetado a nivel de palabra de idioma (UR / EN / OTH) en texto code-mixed de escritura latina.
- Procesamiento de frases con tokenización por palabras (`is_split_into_words=True`), devolviendo una etiqueta por palabra.
- Identificación de entidades no lingüísticas mediante la clase OTH: nombres, menciones (@usuario), hashtags y enlaces.
- Manejo de texto roman urdu–inglés con vocabulario cotidiano compartido con el roman hindi.
- Integración con la librería `transformers` (`AutoModelForTokenClassification`, `AutoTokenizer`) y con el pipeline CLI del repositorio del autor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un modelo discriminativo de clasificación, no generativo.
- Capacidad multilingüe limitada a las tres lenguas declaradas y, en la práctica, a la variante romanizada en escritura latina; no se ha ajustado para escritura urdu nativa.

## Casos de uso

- Preprocesado de corpus de redes sociales: etiquetar cada palabra de publicaciones roman urdu–inglés antes de alimentar un modelo de análisis de sentimiento o de topic modeling, de modo que el pipeline pueda separar el léxico inglés del urdu y aplicar recursos distintos a cada segmento.
- Normalización lingüística previa a traducción automática: identificar qué tokens son ingleses permite preservarlos o transliterarlos y concentrar el esfuerzo de traducción en los tokens urdu, reduciendo errores en sistemas de traducción urdu–inglés.
- Construcción de datasets anotados: usar el clasificador como preetiquetador para acelerar el etiquetado humano de corpus de roman urdu, aprovechando su macro-F1 de 0,9352 sobre el test de COMI-LINGUA como punto de partida.
- Análisis de code-mixing en investigación sociolingüística: cuantificar la proporción de palabras UR frente a EN por usuario, comunidad o periodo temporal, con la ventana de 256 piezas suficiente para mensajes y comentarios típicos.
- Filtrado y limpieza de datos para entrenamiento de modelos generativos: detectar y separar segmentos en inglés dentro de corpus roman urdu para evitar contaminación de idioma en datasets de instrucción.
- Detección de entidades y ruido en publicaciones: la clase OTH permite aislar menciones, hashtags y URLs antes de tareas de extracción de información o de moderación de contenido.
- Enrutamiento lingüístico en atención al cliente: clasificar los mensajes entrantes por composición de idioma para dirigirlos a agentes o plantillas en inglés, urdu romanizado o mixtos.

## Benchmarks y rendimiento

| Conjunto | Exactitud | Macro-F1 |
|---|---|---|
| Validación COMI-LINGUA (727 frases) | 0,9658 | 0,9447 |
| Test COMI-LINGUA Latin-script (750 frases, 15.207 palabras puntuadas) | 0,9618 | 0,9352 |
| Demo RU-EN-LID (51 palabras anotadas a mano) | 1,0000 | 1,0000 |

F1 por etiqueta en el test de COMI-LINGUA: UR 0,981, EN 0,948, OTH 0,876. La mayoría de los errores restantes se concentran en OTH (nombres, hashtags, menciones). La forma ambigua más problemática es *use* (urdu/hindi *usay* frente al inglés "use"). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB de pesos (277 M parámetros), cómodo en cualquier GPU con 2 GB o más.
- En bf16/fp16: alrededor de 0,55 GB de pesos, más overhead de activaciones y tokenizador.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobrada; también A100/H100 para despliegues de alto throughput por lotes.
- Cabe holgadamente en GPU consumer e incluso en CPU para volúmenes moderados; el límite práctico es la latencia, no la memoria.
- Opciones de despliegue: `transformers` con PyTorch, ONNX Runtime, TorchScript, y servidores de inferencia tipo TGI o vLLM para clasificación por lotes; llama.cpp/Ollama no aplican al no haber pesos GGUF publicados.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder base con secuencias de 256 piezas, se espera throughput alto por lotes en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ruen-lid-xlmr-base-iter1 | 277,4 M | 256 piezas (entrenamiento) | LID a nivel de token UR/EN/OTH | CC BY-SA 4.0 | HuggingFace, 29 descargas |
| FacebookAI/xlm-roberta-base (base) | 278 M | 512 posiciones | Modelo multilingüe general (MLM) | MIT | HuggingFace, ampliamente usado |
| Modelos LID multilingües tipo GlotLID / fastText lid.176 | no disponible | frase | Identificación de idioma a nivel de frase | varía (MIT / CC BY-SA en algunos) | ampliamente disponibles |
| Clasificadores code-mixing hindi–inglés específicos | no disponible | no disponible | LID en texto code-mixed | varía | no disponible |

La comparación directa con alternativas de la misma categoría (LID a nivel de palabra para code-mixing urdu–inglés) no está disponible en la información proporcionada; el propio autor señala que no existen corpus anotados de roman urdu a nivel de palabra, lo que sugiere ausencia de modelos comparables publicados.

## Limitaciones y advertencias

- Entrenado y evaluado sobre hindi romanizado–inglés, no sobre roman urdu–inglés real: cabe esperar puntuaciones inferiores en texto auténtico de roman urdu, y el propio autor lo advierte.
- La etiqueta OTH sigue la anotación de COMI-LINGUA, que es inconsistente para nombres; es la clase con peor F1 (0,876) y concentra la mayor parte de los errores.
- El modelo no está ajustado para escritura urdu nativa ni para otras lenguas; su uso fuera de los tres idiomas declarados no está respaldado.
- Riesgo de alucinación no aplicable en sentido generativo (es un clasificador), pero sí de etiquetado erróneo sistemático en formas ambiguas como *use*.
- Sesgos potenciales derivados del corpus de origen (COMI-LINGUA) y del dominio de redes sociales, no documentados explícitamente.
- Licencia CC BY-SA 4.0: impone atribución y compartir-al-igual, lo que puede condicionar el uso comercial y la integración en productos propietarios; el modelo base XLM-RoBERTa es MIT.
- El repositorio de código asociado (`github.com/Mughal-Hash-24/RU-EN-LID`) es privado, lo que limita la reproducibilidad del pipeline completo.
- El modelo es de nicho (29 descargas, 0 likes) y no ha pasado por una validación independiente; conviene tratarlo como prototipo de investigación antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmarNiazi/ruen-lid-xlmr-base-iter1
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Código del pipeline (repositorio privado, según la model card): https://github.com/Mughal-Hash-24/RU-EN-LID
- Paper del corpus de entrenamiento: Sheth et al., *COMI-LINGUA*, Findings of EMNLP 2025 (referenciado en la model card; sin URL directa en la información disponible)
