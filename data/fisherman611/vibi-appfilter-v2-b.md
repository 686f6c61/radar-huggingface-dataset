# fisherman611/vibi-appfilter-v2-b

## Resumen

vibi-appfilter-v2-b es un modelo de embeddings en vietnamita especializado en el filtrado de aplicaciones para el asistente LifeMate, desarrollado por el usuario fisherman611 en el contexto del Zalo AI Challenge 2026. Se trata de un fine-tune del codificador bi-direccional `bkai-foundation-models/vietnamese-bi-encoder` (135M parámetros, arquitectura RoBERTa), reentrenado para mapear descripciones de usuario —incluidas variantes con ruido de reconocimiento automático de voz (ASR), alias y paráfrasis— hacia el espacio de nombres de aplicaciones.

El modelo resuelve un problema concreto de recuperación semántica en un dominio cerrado: dado un enunciado en vietnamita que describe una intención (por ejemplo, "quiero pagar la factura de la luz"), devolver la aplicación correcta del catálogo. La variante "b" del checkpoint corresponde a la configuración B del entrenamiento, que añade 314 frases de aplicaciones nuevas, reformulación de descripciones, eliminación del 30 % de palabras clave y ruido ASR simulado, durante 2 épocas.

Es relevante porque demuestra cómo un encoder pequeño (135M) fine-tuneado con datos sintéticos y aumentación agresiva puede alcanzar un recall muy alto en una tarea de clasificación/recuperación restringida, combinado con BM25 en un esquema híbrido. El modelo es de nicho, con cero descargas y sin licencia declarada, por lo que su uso en producción requiere verificar antes los términos legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bi-direccional tipo RoBERTa (base: vietnamese-bi-encoder) |
| Parametros totales | 134.998.272 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización GGUF/ONNX no publicada) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers |
| Tamano del repositorio | 0,5 GB |
| Modelo base | bkai-foundation-models/vietnamese-bi-encoder |
| Preprocesado requerido | segmentación de palabras con `pyvi` antes de la codificación |
| Fecha de creacion / actualizacion | 2026-11-10 / 2026-11-10 |

## Arquitectura y entrenamiento

El modelo parte de `vietnamese-bi-encoder`, un encoder bi-direccional de 135M parámetros con arquitectura RoBERTa adaptada al vietnamita, y se fine-tunea con la librería sentence-transformers para producir embeddings de frases. La innovación no está en la arquitectura, sino en la estrategia de datos: la configuración B combina el conjunto de entrenamiento original del concurso con alias, variantes de interfaz y transcripciones fonéticas, más un conjunto de aplicaciones escrito manualmente. Sobre esa base se aplican tres aumentaciones: incorporación de 314 frases de aplicaciones nuevas, reformulación de las descripciones y eliminación del 30 % de las palabras clave, además de ruido ASR simulado para robustecer el encoder frente a transcripciones imperfectas.

El entrenamiento se ejecutó durante 2 épocas y el autor conserva los registros en `train_log.json` y `train.log`. Se excluyeron explícitamente cinco aplicaciones held-out (alarm, ewallet, flights, loyalty, podcast_radio) para medir generalización, y no se usaron etiquetas ni frases de los conjuntos public/private test. No se documenta el uso de RLHF, DPO ni objetivos de entrenamiento distintos del contraste típico de sentence-transformers.

## Capacidades

- Generación de embeddings de frases en vietnamita para recuperación semántica y similitud coseno.
- Filtrado y enrutamiento de intenciones hacia un catálogo cerrado de aplicaciones (app filtering).
- Robustez ante ruido de ASR, alias de aplicaciones y paráfrasis de descripciones.
- Funcionamiento en esquema híbrido junto a BM25 (recuperación léxica + densa).
- Manejo de variantes fonéticas y de interfaz de los nombres de aplicaciones.
- Segmentación de palabras vietnamitas mediante `pyvi` como paso previo obligatorio.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es exclusivamente un encoder de representaciones.

## Casos de uso

- Enrutamiento de comandos de voz en asistentes: el encoder convierte la transcripción ASR en un vector y lo compara con los embeddings del catálogo de apps; el ruido ASR simulado durante el entrenamiento mejora la tolerancia a errores de transcripción.
- Búsqueda híbrida en catálogos de aplicaciones: combinar BM25@4 con embeddings@5 permite recuperar candidatos tanto por coincidencia léxica como semántica, lo que resulta útil cuando el usuario describe la función sin nombrar la app.
- Desambiguación de alias y nombres fonéticos: aplicaciones conocidas por distintos nombres (por ejemplo, variantes de pronunciación) se resuelven gracias al entrenamiento con alias e iface.
- Filtrado previo en pipelines de agentes: usar el modelo como primera etapa de recuperación para reducir el conjunto de herramientas o apps candidatas antes de invocar un LLM mayor.
- Detección de intención fuera de dominio: con un umbral sobre la similitud, descartar peticiones que no corresponden a ninguna app del catálogo (evaluado en val_ood).
- Prototipado rápido de sistemas de recomendación de apps: al ser un modelo de 135M parámetros y 0,5 GB, se puede desplegar en CPU para pruebas y iterar sobre el catálogo sin reentrenar.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (recall en porcentaje, esquema híbrido BM25@4 ∪ embeddings@5):

| Conjunto de evaluacion | Recall hibrido (%) | Recall solo embeddings @5 (%) |
|---|---|---|
| val_in | 100,0 | no disponible |
| val_ood | 98,1 | 86,5 |
| val_alias | 99,1 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,54 GB solo para pesos (135M × 4 bytes), más activaciones y overhead del runtime.
- VRAM estimada en fp16: aproximadamente 0,27 GB para pesos; en int8, unos 0,14 GB.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en CPU para lotes pequeños.
- GPU recomendadas para alto throughput: A100, H100 o L4 para servir lotes grandes; para desarrollo, cualquier GPU con más de 2 GB de VRAM.
- Opciones de despliegue: sentence-transformers (referencia), Hugging Face Text Embeddings Inference (TEI), ONNX Runtime y FastEmbed; vLLM y llama.cpp no aplican de forma nativa a este encoder, aunque es posible exportarlo a ONNX.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por frase en GPU moderna, pero no hay mediciones publicadas.
- Requiere instalar `pyvi` y aplicar segmentación de palabras antes de la codificación; esto añade un coste de preprocesado en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| vibi-appfilter-v2-b | 135M | no disponible | vi | no disponible | Embeddings de frases para filtrado de apps |
| bkai-foundation-models/vietnamese-bi-encoder | 135M | no disponible | vi | no disponible | Embeddings generales en vietnamita (modelo base) |
| keepitreal/vietnamese-sbert | no disponible | no disponible | vi | no disponible | Sentence-BERT para vietnamita |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | 118M | 128 tokens | multilingue (incluye vi) | Apache 2.0 | Embeddings multilingues generales |

El modelo se diferencia de los encoders generalistas por su especialización en un catálogo cerrado de aplicaciones y por el uso de aumentación específica de ASR; a cambio, pierde generalidad fuera de ese dominio y no declara licencia, lo que complica su comparación legal con alternativas de licencia abierta.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes: no hay validación independiente de los resultados reportados.
- Sin licencia declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de desplegarlo en producción.
- Especializado en un catálogo concreto de aplicaciones y en el dominio del asistente LifeMate; su rendimiento fuera de ese catálogo o en otros dominios no está evaluado.
- Solo soporta vietnamita; no es multilingüe.
- Requiere segmentación con `pyvi`, lo que introduce una dependencia adicional y posibles discrepancias si el texto de entrada no está normalizado.
- Riesgo de falsos positivos en consultas fuera de dominio: el recall en val_ood es 98,1 % en híbrido, pero cae al 86,5 % con embeddings solos, por lo que conviene usar umbrales y el esquema híbrido.
- No se documentan sesgos demográficos ni lingüísticos; al entrenarse con datos sintéticos y un conjunto manual, puede heredar sesgos de esas fuentes.
- No es un modelo generativo: no produce texto, razonamiento ni código; cualquier uso que requiera generación debe combinarlo con un LLM.
- Los datos de entrenamiento excluyen cinco apps held-out, lo que sugiere que la generalización a aplicaciones no vistas puede ser limitada.
- No hay información sobre la longitud máxima de secuencia soportada, lo que impide garantizar el comportamiento con descripciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fisherman611/vibi-appfilter-v2-b
- Modelo base: https://huggingface.co/bkai-foundation-models/vietnamese-bi-encoder
- Librería sentence-transformers: https://www.sbert.net/
- pyvi (segmentación de palabras en vietnamita): https://github.com/trungtv/pyvi
- Zalo AI Challenge: https://zalo.ai/
