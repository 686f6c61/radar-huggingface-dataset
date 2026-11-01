# anphu16-do-huu/xlmr-sentiment-en-es-zh-ko

## Resumen

XLM-R Sentiment 3-class (En/Es/Zh/Ko) es un modelo de clasificación de sentimiento derivado de `FacebookAI/xlm-roberta-base` mediante ajuste fino supervisado. Lo publica el usuario de HuggingFace `anphu16-do-huu` y resuelve una tarea concreta: asignar a un texto una de tres etiquetas (negativo, neutro o positivo) en ingles, castellano, chino y coreano. Su relevancia practica reside en que ofrece un clasificador multilingue ligero (278 millones de parametros) con licencia MIT, lo que permite integrarlo en pipelines de produccion sin restricciones comerciales.

Arquitectura transformer encoder de tipo XLM-RoBERTa, con 278.045.955 parametros totales y pesos en formato safetensors. El ajuste fino se realizo durante 15 epocas con learning rate de 8e-6, batch de 32 y longitud maxima de 128 tokens sobre una NVIDIA T4 en Google Colab con fp16. No se documenta el corpus de entrenamiento ni el volumen de datos utilizado.

El modelo es de nicho y de reciente publicacion (octubre de 2026 segun los metadatos), con un volumen de descargas muy bajo (30) y sin likes, lo que indica que no ha sido validado de forma amplia por la comunidad. Es adecuado como punto de partida para clasificacion de sentimiento multilingue, pero no como componente critico sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) |
| Parametros totales | 278.045.955 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maximo arquitectonico de XLM-RoBERTa); entrenado con max_len=128 |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF/ONNX documentadas) |
| Idiomas soportados | en, es, zh, ko |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Cabecera de clasificacion | 3 etiquetas: 0=negative, 1=neutral, 2=positive |
| Tamano del repositorio | 1.1 GB |
| Modelo base | FacebookAI/xlm-roberta-base |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa base, un transformer encoder con atencion bidireccional y tokenizador SentencePiece entrenado originalmente sobre corpus multilingues masivos (CommonCrawl). Sobre esa base se anade una cabeza de clasificacion de secuencia con tres salidas y se ajusta de forma supervisada para la tarea de analisis de sentimiento. Al ser un encoder, no genera texto: produce una distribucion de probabilidad sobre las tres clases para cada secuencia de entrada.

Los hiperparametros documentados son learning rate 8e-6, 15 epocas, batch size 32, longitud maxima de secuencia 128 y entrenamiento en precision fp16 sobre una NVIDIA T4 (Google Colab gratuito). No se especifica el dataset de entrenamiento, el numero de ejemplos, la composicion linguistica del corpus ni si se aplicaron tecnicas de balanceo de clases, aumento de datos o validacion cruzada. Tampoco se documenta el uso de RLHF, DPO ni ninguna innovacion arquitectonica adicional: es un ajuste fino estandar de clasificacion.

## Capacidades

- Clasificacion de sentimiento en tres clases (negativo, neutro, positivo) para texto en ingles, castellano, chino y coreano.
- Inferencia por secuencia completa con pooling sobre el token especial `<s>`, propia de la cabeza de clasificacion de XLM-RoBERTa.
- Manejo de entradas de hasta 512 tokens a nivel arquitectonico, aunque el entrenamiento se limito a 128 tokens.
- Capacidad multilingue heredada del preentrenamiento de XLM-RoBERTa, con transferencia potencial a idiomas no presentes en el ajuste fino (no validada por el autor).
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni agentes.
- No dispone de modo thinking, vision, audio ni capacidades multimodales.

## Casos de uso

- Moderacion de resenas de producto: clasificar resenas de usuarios en comercio electronico en castellano, ingles, chino o coreano para enrutar automaticamente las negativas a atencion al cliente y agregar metricas de satisfaccion por mercado.
- Monitorizacion de reputacion de marca en redes sociales: procesar menciones multilingues en lote y calcular la proporcion de sentimiento negativo por idioma y por franja temporal, aprovechando la licencia MIT para uso comercial sin coste.
- Analisis de encuestas NPS abiertas: etiquetar respuestas de texto libre en los cuatro idiomas soportados y cruzar el sentimiento con la puntuacion numerica del cliente para detectar incoherencias o segmentos de riesgo.
- Filtrado previo en pipelines de soporte: clasificar tickets entrantes y priorizar los de sentimiento negativo antes de la asignacion a agentes humanos, reduciendo el tiempo de primera respuesta en casos criticos.
- Enriquecimiento de datasets para entrenamiento: generar etiquetas de sentimiento a bajo coste sobre corpus multilingues y usarlas como weak labels en la construccion de datasets mayores o para destilar modelos mas pequenos.
- Analisis de opinion en investigacion academica: obtener una linea base rapida de clasificacion de sentimiento multilingue antes de invertir en anotacion manual o en modelos de mayor tamano, dado el bajo coste de despliegue en CPU.
- Clasificacion en tiempo real en dispositivos modestos: al tratarse de un encoder de 278 millones de parametros, puede ejecutarse en CPU con latencias de decenas de milisegundos por secuencia corta, lo que permite integrarlo en servicios sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara las metricas `accuracy` y `f1` en los metadatos, pero no incluye valores numericos, ni desglose por idioma, ni comparacion con lineas base. No se deben asumir cifras de rendimiento sin una evaluacion propia sobre un conjunto de validacion representativo del dominio de uso.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB para los pesos (278 M de parametros x 4 bytes) mas overhead de activaciones, en torno a 1,5-2 GB en total con batch pequeno.
- VRAM estimada en fp16: aproximadamente 0,6 GB de pesos, con un total practico de 1-1,5 GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU para batch pequeno.
- GPU recomendadas para throughput alto: A100, H100 o L4 para servir multiples peticiones concurrentes con batch grande; T4 es suficiente para cargas moderadas.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Generation Inference no aplica (no es generativo), ONNX Runtime o TorchScript para optimizacion, y servicios de inferencia tipo FastAPI o BentoML envolviendo el pipeline.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, un encoder base de este tamano suele procesar decenas de secuencias cortas por segundo en GPU moderna y unas pocas por segundo en CPU, pero no se aportan mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| anphu16-do-huu/xlmr-sentiment-en-es-zh-ko | 278 M | 512 (entrenado a 128) | en, es, zh, ko | MIT | safetensors | Ajuste fino de XLM-R base, sin benchmarks publicados |
| FacebookAI/xlm-roberta-base | 278 M | 512 | 100 idiomas | MIT | safetensors | Modelo base sin cabeza de clasificacion; requiere ajuste fino |
| cardiffnlp/twitter-xlm-roberta-base-sentiment | ~278 M | 512 | multilingue (orientado a Twitter) | MIT | safetensors | Clasificador de sentimiento multilingue ampliamente usado, con evaluacion publicada |
| nlptown/bert-base-multilingual-uncased-sentiment | 178 M | 512 | multilingue | MIT | safetensors | Clasificacion en 5 estrellas, muy extendido en produccion |

La comparativa se limita a alternativas de la misma familia y tarea; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa con las alternativas citadas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de accuracy o F1 por idioma, lo que impide garantizar calidad en produccion sin evaluacion propia.
- Dataset de entrenamiento no documentado: se desconoce el dominio, el volumen, la procedencia y el balance de clases del corpus, lo que dificulta estimar sesgos y generalizacion.
- Riesgo de sobreajuste: 15 epocas con learning rate bajo sobre un corpus no especificado es una configuracion que puede sobreajustar si el dataset es pequeno; no se aportan curvas de validacion.
- Sesgos inheritos del preentrenamiento de XLM-RoBERTa: el modelo base se entreno sobre CommonCrawl, con los sesgos demograficos, culturales y de dominio que ello implica; el ajuste fino no los corrige.
- Clase "neutral" potencialmente infrarepresentada: en tareas de sentimiento, la clase neutra suele ser ambigua y escasa; sin datos de balance no se puede descartar un sesgo hacia positivo o negativo.
- Limite de 128 tokens en entrenamiento: entradas mas largas pueden degradar la calidad aunque la arquitectura admita hasta 512; conviene truncar o segmentar.
- Idiomas fuera de en/es/zh/ko: la transferencia no esta validada y puede producir resultados poco fiables.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor no ofrece garantias de ningun tipo; la responsabilidad sobre el rendimiento recae en el integrador.
- Madurez baja: 30 descargas y 0 likes en el momento de la consulta; no hay senales de validacion por parte de la comunidad ni issues documentados.
- No apto para generacion de texto, agentes ni tareas que requieran razonamiento: es exclusivamente un clasificador de secuencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anphu16-do-huu/xlmr-sentiment-en-es-zh-ko
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-RoBERTa (Conneau et al., 2019): https://arxiv.org/abs/1911.02116
