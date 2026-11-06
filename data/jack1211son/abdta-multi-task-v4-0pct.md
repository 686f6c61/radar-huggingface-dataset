# jack1211son/abdta-multi-task-v4-0pct

## Resumen

El modelo `jack1211son/abdta-multi-task-v4-0pct` es un checkpoint de clasificación multi-tarea desarrollado por el usuario jack1211son, afinado a partir de `microsoft/deberta-v3-large` (434 millones de parámetros). Está diseñado para el análisis de tono y aspectos en narrativas de informes anuales de empresas cotizadas indonesias, dentro de una colección denominada ABDTA (aspect-based risk-disclosure tone analysis). Resuelve dos tareas simultáneas sobre una misma oración: clasificación de tono (Positive/Negative/Neutral) y clasificación de aspecto entre 14 categorías financieras (Economics, Profit|Loss, Dividend, Financing, Brand, Technology, Investment, Governance, Product|Service, M&A, Legal, Environment, Social&People, Political).

El modelo forma parte de una familia de variantes identificadas por sufijos en el nombre: `0pct`/`25pct` indican dropout de palabras clave de aspecto durante el entrenamiento, `2x`/`4x` denotan variantes de aumento de pseudo-etiquetas, y `equal`/`train-dist` indican el balanceo de aspectos. Este checkpoint concreto corresponde a la variante base sin aumento, con 0% de dropout de keywords, y está pensado para reentrenamiento final sobre datos de entrenamiento más validación.

Es relevante para investigadores y desarrolladores que trabajen en análisis financiero automatizado, extracción de señales en disclosures regulatorios y NLP aplicado a mercados emergentes. Su arquitectura DeBERTa-v3-large proporciona una base sólida de comprensión del lenguaje, aunque su ventana de contexto está limitada a 256 tokens y su licencia no está especificada, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large) con cabeceras multi-tarea personalizadas |
| Parametros totales | 434.031.635 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (pesos safetensors en fp32/fp16, sin GGUF publicado) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (con código custom empaquetado, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo se basa en `microsoft/deberta-v3-large`, un encoder transformer con atención desacoplada (disentangled attention) y embeddings de posición relativos, que constituye la columna vertebral del modelo. Sobre esta base se añaden dos cabeceras de clasificación: una para el tono (3 clases) y otra para el aspecto (14 clases), entrenadas de forma conjunta en un esquema multi-tarea. El modelo requiere código personalizado empaquetado en el repositorio (`multi_task_deberta`), por lo que debe cargarse con `trust_remote_code=True`.

El entrenamiento se realizó sobre narrativas de informes anuales de empresas cotizadas indonesias, con un formato de entrada específico que inyecta palabras clave de riesgo y de aspecto antes de la oración: `[Risk Keywords: <palabras> Aspect Keywords: <palabras>] <oración>`. La variante `0pct` indica que no se aplicó dropout de palabras clave de aspecto durante el entrenamiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; al tratarse de un modelo de clasificación, es probable que el ajuste fuera supervisado, pero este dato no está confirmado en la información disponible.

## Capacidades

- Clasificación de tono en tres clases: Positive, Negative, Neutral.
- Clasificación multi-etiqueta de aspectos financieros en 14 categorías: Economics, Profit|Loss, Dividend, Financing, Brand, Technology, Investment, Governance, Product|Service, M&A, Legal, Environment, Social&People, Political.
- Procesamiento de texto en inglés con inyección de palabras clave de riesgo y aspecto como prefijo estructurado.
- Extracción de características (`feature-extraction`) además de clasificación.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Análisis de sentimiento en informes anuales: el modelo clasifica el tono de fragmentos narrativos de disclosures financieros, permitiendo agregar señales de positividad o negatividad por sección del informe.
- Detección de aspectos financieros en disclosures regulatorios: con 14 categorías predefinidas, se puede etiquetar automáticamente qué áreas (dividendos, M&A, gobernanza, medioambiente) aborda cada oración, facilitando la construcción de índices temáticos.
- Monitorización de riesgo en narrativas corporativas: la inyección de palabras clave de riesgo en el prompt permite al modelo condicionar su clasificación según el contexto de riesgo extraído previamente, útil en pipelines de vigilancia regulatoria.
- Investigación académica en NLP financiero: sirve como baseline multi-tarea para comparar con otros enfoques en el dominio de informes anuales de mercados emergentes.
- Enriquecimiento de datasets para modelos downstream: las etiquetas de tono y aspecto generadas pueden alimentar modelos de predicción o sistemas de recuperación de información financiera.
- Análisis comparativo entre empresas cotizadas: al procesar narrativas homogéneas con el mismo esquema de etiquetas, se pueden comparar perfiles de disclosure entre compañías del mismo sector.
- Filtrado y priorización de secciones en due diligence: permite identificar rápidamente qué partes de un informe anual contienen un tono negativo o abordan aspectos sensibles (Legal, Governance, Environment).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,7 GB (tamaño del repositorio); en fp16, alrededor de 0,9 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16, como RTX 3060, RTX 4060 o superiores; para lotes grandes, A100 o H100 no son necesarias pero aceleran el throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM (RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es el método principal; al ser un encoder de clasificación, no es compatible directamente con vLLM o TGI en su forma actual sin adaptación; llama.cpp y Ollama no soportan arquitecturas custom de este tipo sin conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jack1211son/abdta-multi-task-v4-0pct | 434 M | 256 tokens | Clasificación multi-tarea (tono + aspecto) en finanzas | No disponible | Hugging Face |
| microsoft/deberta-v3-large | 435 M | 512 tokens | Modelo base de propósito general (encoder) | MIT | Hugging Face |
| ProsusAI/finbert | 110 M | 512 tokens | Clasificación de sentimiento financiero (3 clases) | Apache 2.0 | Hugging Face |
| yiyanghkust/finbert-tone | 110 M | 512 tokens | Clasificación de tono financiero (3 clases) | Apache 2.0 | Hugging Face |

La comparativa con FinBERT es la más directa en cuanto a tarea de tono financiero, aunque este modelo añade la dimensión de aspecto y está especializado en el mercado indonesio. DeBERTa-v3-large sirve como referencia de tamaño y arquitectura base.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó exclusivamente con narrativas de informes anuales de empresas cotizadas indonesias, por lo que puede presentar sesgos hacia ese dominio y estilo de redacción; su aplicación a otros mercados o tipos de texto financiero no está validada.
- Riesgo de alucinación: al ser un modelo de clasificación, no genera texto libre, pero puede producir etiquetas incorrectas con alta confianza en oraciones ambiguas o fuera de distribución.
- Limitaciones de contexto: la ventana máxima es de 256 tokens, lo que restringe el análisis a fragmentos cortos y obliga a segmentar los informes.
- Limitaciones de idioma: solo soporta inglés; los informes originales en indonesio deben traducirse previamente o el modelo no funcionará correctamente.
- Restricciones de licencia: la licencia no está especificada, lo que impide confirmar si el uso comercial está permitido; se recomienda contactar con el autor antes de utilizarlo en producción.
- Caveat para producción: requiere `trust_remote_code=True` y código personalizado empaquetado, lo que añade un riesgo de seguridad y mantenimiento; además, el modelo no predice precios de acciones ni rendimientos de inversión, según indica el propio autor.
- Dependencia de extracción de palabras clave: el rendimiento depende de que el pipeline de extracción de keywords de riesgo y aspecto utilizado sea el mismo que en los cuadernos del proyecto original.

## Enlaces

- Hugging Face: https://huggingface.co/jack1211son/abdta-multi-task-v4-0pct
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
