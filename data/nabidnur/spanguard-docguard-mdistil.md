# Nabidnur/spanguard-docguard-mdistil

## Resumen

spanguard-docguard-mdistil es un clasificador de texto de 135,3 millones de parámetros desarrollado por Nabidnur, publicado en el contexto del hackathon Meta Global AI Hackathon 2026. Forma parte de la familia de modelos spanguard, un conjunto de "guardas" pequeñas diseñadas para filtrar tráfico dirigido a agentes de IA, concretamente para detectar ataques de tipo prompt injection a nivel de documento. El modelo se obtiene mediante ajuste fino (fine-tuning) de distilbert-base-multilingual-cased, la versión destilada multilingüe de DistilBERT.

La tarea concreta que resuelve es la clasificación binaria de documentos: dado un texto, devuelve la probabilidad de que contenga un intento de ataque (prompt injection) frente a contenido benigno. Está entrenado sobre un corpus ficticio determinista en inglés, alemán y húngaro, con diez familias de ataques y trampas benignas, y está pensado para ejecutarse en CPU, lo que lo hace adecuado para despliegues de baja latencia y bajo coste en pipelines de seguridad de agentes.

Su relevancia actual deriva del auge de sistemas basados en agentes que ingieren documentos externos (correos, páginas web, PDFs) y del riesgo asociado de inyección de instrucciones maliciosas. Al ser un modelo pequeño, multilingüe (parcial) y con licencia Apache 2.0, puede integrarse como capa de pre-filtrado en arquitecturas de defensa en profundidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT) |
| Parametros totales | 135.326.210 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de distilbert-base-multilingual-cased; el modelo base admite hasta 512 tokens, aunque no se confirma en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar de transformers, no documentada por el autor) |
| Idiomas soportados | en, de, hu |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo DistilBERT, es decir, una versión destilada de BERT con 6 capas y 135,3 millones de parámetros, inicializada desde distilbert-base-multilingual-cased y ajustada para clasificación de secuencias (text-classification). La cabeza de clasificación es binaria: la salida softmax en la posición 1 corresponde a la probabilidad de ataque, con umbral recomendado de 0,5.

El entrenamiento se realizó en CPU local sobre un corpus ficticio determinista en inglés, alemán y húngaro, que incluye diez familias de ataques y trampas benignas. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente a clasificadores). Tampoco se especifican innovaciones técnicas adicionales más allá de la destilación del modelo base.

## Capacidades

- Clasificación binaria de documentos como ataque (prompt injection) o benigno, con probabilidad calibrada en la salida softmax.
- Detección de diez familias de ataques de prompt injection, según la descripción del corpus de entrenamiento.
- Discriminación frente a trampas benignas (falsos positivos controlados) gracias a la inclusión de ejemplos benignos en el corpus.
- Multilingüe limitado a inglés, alemán y húngaro.
- Ejecución en CPU con latencias declaradas de 70,3 ms (p50) y 145,5 ms (p95) en el conjunto de desarrollo.
- No soporta tool calling, function calling, generación de texto, razonamiento multi-paso ni capacidades de agente: es exclusivamente un clasificador.
- No dispone de modo thinking, visión, audio ni otras capacidades especiales.

## Casos de uso

- Pre-filtrado de documentos en pipelines RAG: antes de insertar un documento recuperado en el contexto del LLM, el clasificador evalúa la probabilidad de prompt injection y bloquea o marca los sospechosos, reduciendo el riesgo de que instrucciones maliciosas lleguen al modelo generativo.
- Protección de agentes que ingieren correo electrónico: el modelo puede clasificar el cuerpo de correos entrantes en inglés, alemán o húngaro antes de que un agente los procese, con latencia inferior a 150 ms en CPU.
- Moderación de contenido web scrapeado: en crawlers o herramientas de navegación automatizada, se aplica como capa de saneamiento sobre el texto extraído de páginas antes de pasarlo al agente.
- Defensa en profundidad en arquitecturas multi-agente: como guarda adicional junto a otros modelos de la familia spanguard, se usa para validar mensajes entre agentes o documentos compartidos entre ellos.
- Procesamiento de documentos ofimáticos y PDFs: clasificación de texto extraído de adjuntos en flujos de automatización documental, con despliegue en contenedores sin GPU.
- Evaluación y auditoría de seguridad: sirve como baseline reproducible para medir la tasa de detección de prompt injection en corpus propios, dado que el autor publica métricas de desarrollo (precisión 0,9684, recall 1,0, F1 0,984).
- Filtrado en entornos con restricciones de hardware: al ejecutarse en CPU y ocupar 0,5 GB en el repositorio, es viable en instancias pequeñas, edge o entornos sin acelerador.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas del conjunto de desarrollo del propio autor (150 documentos), no benchmarks estándar comparables con otros modelos:

| Metrica | Valor |
|---|---|
| Documentos de evaluacion (dev) | 150 |
| Precision | 0,9684 |
| Recall | 1,0 |
| F1 | 0,984 |
| Tasa de bloqueo falso (false_block_rate) | 0,0517 |
| Latencia p50 | 70,3 ms |
| Latencia p95 | 145,5 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5-0,6 GB en FP32 (135,3 M de parámetros × 4 bytes ≈ 0,54 GB), más overhead de activaciones y tokenizador; en FP16 o cuantización de 8 bits se reduce a la mitad o menos.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (GTX 1060 o superior, RTX 3060, RTX 4090) puede ejecutarlo con holgura. En A100/H100 el cuello de botella sería el overhead de lanzamiento, no el cómputo.
- Cabe en cualquier GPU consumer e incluso en CPU, que es el entorno declarado de entrenamiento y el recomendado por el autor para inferencia.
- Opciones de despliegue: transformers (AutoModelForSequenceClassification), text-embeddings-inference (etiqueta endpoints_compatible), y servidores de inferencia estándar compatibles con Hugging Face Endpoints. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo transformers es probable su integración con TGI.
- Latencia y throughput: latencias declaradas de 70,3 ms (p50) y 145,5 ms (p95) en CPU local sobre el conjunto de desarrollo; no se publica throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| spanguard-docguard-mdistil | 135,3 M | no disponible | en, de, hu | apache-2.0 | Clasificador binario de prompt injection a nivel de documento; métricas solo en dev propio |
| distilbert-base-multilingual-cased (modelo base) | 135,3 M | 512 tokens | más de 100 idiomas | apache-2.0 | Modelo general de representación; no especializado en seguridad |
| Modelos guard de la familia spanguard | no disponible | no disponible | no disponible | no disponible | El autor menciona otros modelos de la familia, sin especificaciones publicadas en la información disponible |
| Clasificadores de prompt injection genéricos | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables verificables en la información proporcionada |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Entrenado sobre tráfico de agentes ficticio (en, de, hu): el rendimiento en tráfico real puede diferir sustancialmente; el propio autor recomienda ejecutar una evaluación propia sobre el tráfico del usuario.
- Un guard entrenado es una mitigación, no una garantía: puede ser evadido por ataques fuera de las diez familias del corpus o por variaciones lingüísticas no cubiertas.
- Cobertura idiomática limitada a inglés, alemán y húngaro; no se garantiza comportamiento en castellano ni en otros idiomas, pese a que el modelo base es multilingüe.
- Tasa de bloqueo falso declarada de 0,0517 (aproximadamente 5,2 % de documentos benignos marcados como ataque) en el conjunto de desarrollo, lo que puede generar fricción en producción.
- Las métricas publicadas (precisión 0,9684, recall 1,0, F1 0,984) proceden de solo 150 documentos de desarrollo del propio autor, sin conjunto de test independiente; deben interpretarse con cautela.
- Riesgo de sesgo y alucinación: al ser un clasificador, no genera texto, pero puede presentar sesgos derivados del corpus ficticio y de distilbert-base-multilingual-cased.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con las obligaciones habituales de atribución y aviso de licencia.
- No se documentan la longitud de contexto efectiva, los tipos de cuantización soportados ni el número de tokens de entrenamiento, lo que dificulta reproducir o auditar el modelo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nabidnur/spanguard-docguard-mdistil
- Repositorio de la familia spanguard: https://github.com/Hisernberg/spanguard
- Modelo base: https://huggingface.co/distilbert/distilbert-base-multilingual-cased
