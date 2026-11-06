# jack1211son/abdta-single-task-aspect-v4-0pct-2x-equal

## Resumen

El modelo `abdta-single-task-aspect-v4-0pct-2x-equal` es un clasificador de texto basado en `microsoft/deberta-v3-large` (435 millones de parámetros) afinado para el análisis de tono en disclosures de riesgo (ABDTA, aspect-based risk-disclosure tone analysis) en memorias anuales de empresas cotizadas indonesias. Lo desarrolla el usuario de Hugging Face `jack1211son` y forma parte de una colección de checkpoints que exploran distintas estrategias de aumento de datos (dropout de palabras clave de aspecto, pseudo-etiquetado y balanceo de clases).

El modelo resuelve una tarea concreta: dado un fragmento de texto financiero con palabras clave de riesgo y de aspecto inyectadas en el prompt, predecir el tono (Positive, Negative, Neutral) asociado a un aspecto específico (Economics, Profit|Loss, Dividend, Financing, Brand, Technology, Investment, Governance, Product|Service, M&A, Legal, Environment, Social&People, Political). Es, por tanto, un clasificador de sentimiento a nivel de aspecto orientado a un dominio muy específico (narrativas de informes anuales en inglés de emisores indonesios).

Su relevancia es limitada y muy nichada: no es un modelo generativo ni un LLM de propósito general, sino un encoder discriminativo afinado para una tarea de clasificación de 3 clases. El checkpoint corresponde al modelo final de la colección, reentrenado sobre train más validación, y su utilidad práctica depende de replicar exactamente el pipeline de extracción de palabras clave del proyecto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large con atención desenredada y embedding de posición relativa) |
| Parametros totales | 435.076.110 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (límite de entrada declarado en la model card) |
| Tipos de cuantizacion | No disponible (repo con safetensors en fp32/fp16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (`transformers`, `AutoModelForSequenceClassification`) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-large`, un encoder transformer con atención desenredada (disentangled attention) que separa el contenido y la posición relativa de cada token, y con un mecanismo de embedding de posición relativa que mejora el modelado de dependencias locales. La cabeza de clasificación se sustituye por una capa de secuencia para la tarea de tono (3 etiquetas: Positive, Negative, Neutral), aunque la model card también describe un orden de 14 etiquetas de aspecto, lo que sugiere que el checkpoint puede haberse entrenado para predecir aspecto y tono de forma conjunta o que la cabeza gestiona ambas dimensiones según la configuración del proyecto.

El entrenamiento se realizó sobre narrativas de informes anuales de empresas cotizadas indonesias, con un formato de entrada que inyecta palabras clave de riesgo y de aspecto entre corchetes antes de la frase: `[Risk Keywords: <risk words> Aspect Keywords: <aspect words>] <sentence>`. El sufijo `0pct` indica que no se aplicó dropout de palabras clave de aspecto durante el entrenamiento; `2x` indica una variante de aumento con pseudo-etiquetado duplicado; `equal` indica que se balancearon los aspectos para que cada uno tenga representación similar. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF/DPO (no aplica a un encoder discriminativo). Tampoco se especifican hiperparámetros, epochs ni estrategia de validación.

## Capacidades

- Clasificación de tono (Positive, Negative, Neutral) a nivel de aspecto sobre frases de disclosures financieros.
- Clasificación de aspecto entre 14 categorías predefinidas (Economics, Profit|Loss, Dividend, Financing, Brand, Technology, Investment, Governance, Product|Service, M&A, Legal, Environment, Social&People, Political).
- Procesamiento de entradas con palabras clave inyectadas explícitamente (risk keywords y aspect keywords) para guiar la clasificación.
- Soporte de tool calling / function calling: no.
- Soporte de agentes y razonamiento multi-paso: no.
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales: no dispone de modo thinking, visión ni audio. Es un clasificador discriminativo, no generativo.
- No predice precios de acciones ni retornos de inversión (declarado explícitamente en la model card).

## Casos de uso

- Análisis de sentimiento en informes anuales: integrado en un pipeline que extraiga frases con keywords de riesgo y aspecto, el modelo clasifica el tono de cada disclosure y permite agregar métricas de tono por aspecto a nivel de empresa y año.
- Monitorización de riesgo regulatorio: clasificar automáticamente secciones de memorias anuales de emisores indonesios para detectar disclosures con tono negativo en aspectos como Legal, Governance o Environment, alimentando alertas para equipos de compliance.
- Investigación académica en finanzas: generar variables de tono por aspecto para estudios empíricos sobre relación entre lenguaje de disclosure y comportamiento bursátil, siempre que se documente que el modelo no predice retornos directamente.
- Enriquecimiento de bases de datos financieras: etiquetar corpus históricos de informes anuales con tono y aspecto para construir datasets estructurados que alimenten modelos posteriores o dashboards de análisis.
- Screening ESG: usar las etiquetas Environment, Social&People y Governance para cuantificar la proporción de disclosures con tono negativo en cada dimensión y comparar entre emisores.
- Auditoría de consistencia narrativa: comparar el tono detectado en el apartado de risk disclosure con el de la carta del presidente o el MD&A para detectar inconsistencias que merezcan revisión manual.
- Filtrado previo en pipelines de extracción de información: usar el clasificador como primera etapa para priorizar qué frases requieren análisis más profundo (por ejemplo, con un LLM generativo) y reducir coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existen CSVs de evaluación a nivel de frase en el proyecto original, pero no se publican como assets del modelo. No se dispone de métricas de accuracy, F1, precision o recall por clase ni comparaciones con otros checkpoints de la colección.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en fp16 (435 M parámetros × 2 bytes) más overhead de activaciones y tokenizer; en fp32, en torno a 1,8-2 GB. Con batch pequeño, cabe holgadamente en GPUs de 4 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060 12 GB, RTX 4060, RTX 4090). Para alto throughput, A100 o H100 permiten batches grandes, aunque el modelo es pequeño y no las aprovecha a nivel de cómputo.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM (GTX 1650 4 GB, RTX 3050, etc.).
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, `text-embeddings-inference` (etiqueta presente en el repo), y potencialmente `vLLM` no aplica (no es generativo); `llama.cpp`/`Ollama` requerirían conversión a GGUF no documentada. `TGI` no soporta encoders de clasificación de forma nativa. La opción más directa es servir con FastAPI + `transformers` o `optimum` con ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño (435 M parámetros) y la longitud máxima de 256 tokens, se espera latencia de milisegundos por muestra en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `abdta-single-task-aspect-v4-0pct-2x-equal` | 435 M | 256 tokens | Clasificación tono/aspecto financiero | No disponible | Hugging Face (0 descargas) |
| `microsoft/deberta-v3-large` | 435 M | 512 tokens (entrenamiento) | Modelo base, sin finetuning específico | MIT | Hugging Face (ampliamente usado) |
| `ProsusAI/finbert` | ~110 M | 512 tokens | Sentimiento financiero (3 clases) | Apache 2.0 | Hugging Face (muy usado) |
| `yiyanghkust/finbert-tone` | ~110 M | 512 tokens | Tono financiero (3 clases) | Apache 2.0 | Hugging Face |

La comparación directa es difícil porque el modelo de `jack1211son` está especializado en un subdominio muy concreto (informes anuales de empresas indonesias con inyección de keywords) y no publica métricas. `finbert` y `finbert-tone` son alternativas más generales y con licencia clara, pero no cubren la clasificación por aspecto ni el formato de keywords. El checkpoint de la colección ABDTA no tiene benchmarks públicos que permitan afirmar superioridad frente a estas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena exclusivamente sobre narrativas de empresas cotizadas indonesias en inglés, por lo que puede no generalizar a otros mercados, sectores o variantes dialectales del inglés financiero.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas en frases ambiguas o con ironía, y de sobreajuste a las palabras clave inyectadas en el prompt.
- Limitaciones de contexto: la entrada está limitada a 256 tokens, lo que obliga a truncar frases largas o a segmentar el texto, con pérdida potencial de información contextual.
- Limitaciones de idioma: solo inglés; no soporta indonesio ni otros idiomas, a pesar de que el dominio de aplicación son emisores indonesios.
- Restricciones de licencia: la licencia no está disponible, lo que impide asumir uso comercial libre. Es necesario contactar con el autor antes de cualquier despliegue en producción.
- Dependencia del pipeline de extracción de keywords: el modelo requiere replicar exactamente la extracción de risk keywords y aspect keywords del proyecto original; sin ese paso, el rendimiento puede degradarse de forma significativa.
- Sin métricas publicadas: no hay benchmarks ni evaluación independiente, y el repo tiene 0 descargas y 0 likes, lo que indica ausencia de validación por la comunidad.
- El modelo no predice precios ni retornos; cualquier uso en decisiones de inversión debe tratarse como señal auxiliar, no como recomendación.
- La model card menciona 14 etiquetas de aspecto y 3 de tono, pero no especifica cómo se combinan en la cabeza de clasificación; es necesario inspeccionar `config.json` para confirmar la dimensionalidad real de la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jack1211son/abdta-single-task-aspect-v4-0pct-2x-equal
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Paper de DeBERTa-v3: https://arxiv.org/abs/2111.09543
- Repositorio DeBERTa (Microsoft): https://github.com/microsoft/DeBERTa
- Alternativa FinBERT: https://huggingface.co/ProsusAI/finbert
- Alternativa FinBERT-tone: https://huggingface.co/yiyanghkust/finbert-tone
