# jack1211son/abdta-multi-task-v4-0pct-2x-train-dist

## Resumen

ABDTA Multi-task v4 (0pct, 2x, train-dist) es un modelo de clasificación de texto basado en `microsoft/deberta-v3-large` (434 millones de parámetros), ajustado por el usuario `jack1211son` para una tarea doble: análisis de tono (*tone*) y detección de aspectos en narrativas de informes anuales de empresas cotizadas en Indonesia. El modelo forma parte de la colección ABDTA (*Aspect-Based Disclosure Tone Analysis*) y este checkpoint concreto es el modelo final, reentrenado sobre datos de entrenamiento más validación.

La arquitectura es un transformer encoder DeBERTa-v3-large con una cabeza multi-tarea personalizada (`multi_task_deberta`) que emite dos conjuntos de logits: uno para el tono (3 clases: `Positive`, `Negative`, `Neutral`) y otro para 14 aspectos financieros (`Economics`, `Profit|Loss`, `Dividend`, `Financing`, `Brand`, `Technology`, `Investment`, `Governance`, `Product|Service`, `M&A`, `Legal`, `Environment`, `Social&People`, `Political`). El modelo requiere código personalizado (`trust_remote_code=True`) y un formato de entrada específico que antepone palabras clave de riesgo y de aspecto a la frase original.

Es relevante para investigadores en finanzas computacionales y NLP aplicado a informes corporativos, ya que aborda una tarea poco cubierta (análisis de tono a nivel de aspecto en disclosures regulatorios) con un modelo compacto que puede ejecutarse en hardware modesto. No obstante, su adopción es muy limitada (0 descargas, 0 likes en el momento de la consulta) y la documentación pública es escasa: no se especifican datos de entrenamiento, benchmarks ni licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large) con cabeza multi-tarea personalizada (`multi_task_deberta`) |
| Parámetros totales | 434.031.635 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (límite de entrada declarado por el autor) |
| Tipos de cuantización | No disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-large`, un encoder transformer con atención desacoplada y embeddings de posición relativos, y le añade una cabeza multi-tarea que produce simultáneamente logits de tono (3 clases) y de aspecto (14 clases). La implementación requiere `trust_remote_code=True`, ya que la arquitectura está empaquetada como código personalizado dentro del repositorio.

El autor documenta variantes de entrenamiento mediante sufijos en el nombre del repositorio: `0pct`/`25pct` indica *dropout* de palabras clave de aspecto durante el entrenamiento; `2x`/`4x` denota variantes de aumento de datos con pseudo-etiquetas; `equal` balancea los aspectos y `train-dist` sigue la distribución de entrenamiento. Este checkpoint concreto (`0pct`, `2x`, `train-dist`) es el modelo final de la colección, reentrenado sobre entrenamiento más validación. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF/DPO (poco probables en un encoder de clasificación). El formato de entrada exige la plantilla `[Risk Keywords: <palabras> Aspect Keywords: <palabras>] <frase>`, con extracción de palabras clave realizada mediante los cuadernos del proyecto (no incluidos en el repo).

## Capacidades

- Clasificación de tono en tres clases (`Positive`, `Negative`, `Neutral`) sobre frases de informes anuales.
- Clasificación multi-etiqueta de 14 aspectos financieros (economía, beneficio/pérdida, dividendos, financiación, marca, tecnología, inversión, gobernanza, producto/servicio, fusiones y adquisiciones, legal, medioambiente, social/personas, político).
- Procesamiento de entradas con palabras clave de riesgo y de aspecto inyectadas manualmente en el prompt.
- Extracción de características (`feature-extraction`) además de clasificación (`text-classification`).
- Capacidad multi-tarea: ambas cabezas se ejecutan en una sola pasada hacia adelante.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al inglés (los informes originales son de empresas indonesias, pero el modelo solo declara `en`).

## Casos de uso

- Análisis de tono en informes anuales: procesar frases extraídas de memorias anuales de empresas cotizadas en Indonesia para clasificar el tono (positivo, negativo, neutro) de cada disclosure, alimentando paneles de seguimiento regulatorio.
- Detección de aspectos en disclosures: identificar automáticamente si una frase trata de dividendos, gobernanza, medioambiente o fusiones, lo que permite construir índices temáticos de transparencia corporativa.
- Investigación académica en finanzas computacionales: generar variables de tono y aspecto a nivel de frase para estudios de asociación entre lenguaje del informe y métricas financieras, con un modelo de 434 M de parámetros ejecutable en una sola GPU.
- Monitorización de riesgo reputacional: clasificar comunicaciones corporativas y detectar frases con tono negativo en aspectos sensibles (legal, medioambiente, gobernanza) para alertar a equipos de compliance.
- Enriquecimiento de pipelines de extracción de información: combinar las salidas de tono y aspecto con sistemas de NER o RAG para construir bases de conocimiento estructuradas sobre informes corporativos.
- Análisis comparativo entre emisores: agregar las predicciones por aspecto y tono para comparar la narrativa de distintas empresas del mismo sector en un mismo ejercicio fiscal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,7 GB de pesos más overhead de activaciones y tokenizador; en la práctica, entre 2 y 3 GB para lotes pequeños.
- VRAM estimada en fp16/bf16: alrededor de 1 GB de pesos; entre 1,5 y 2 GB con overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 4 GB o más (GTX 1650 4 GB, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido); el código personalizado puede complicar la exportación a ONNX, TensorRT o vLLM sin adaptación previa. llama.cpp y Ollama no son viables directamente al no ser un modelo generativo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño y la longitud máxima de 256 tokens, se espera un throughput alto en GPU moderna, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ABDTA Multi-task v4 (este) | 434 M | 256 tokens | Clasificación multi-tarea de tono y aspecto financiero | No disponible | HuggingFace, 0 descargas |
| `microsoft/deberta-v3-large` | 435 M | 512 tokens | Modelo base encoder, sin cabeza de clasificación específica | MIT | HuggingFace, ampliamente usado |
| `ProsusAI/finbert` | ~110 M | 512 tokens | Análisis de sentimiento financiero (3 clases) | Apache 2.0 | HuggingFace, muy popular |
| `yiyanghkust/finbert-tone` | ~110 M | 512 tokens | Tono financiero (positivo/negativo/neutro) | Apache 2.0 | HuggingFace, popular |

La comparativa se basa en modelos de la misma categoría (encoders para análisis financiero); no se dispone de benchmarks del modelo ABDTA para comparar rendimiento numérico. Frente a FinBERT, este modelo añade clasificación por aspectos y está especializado en narrativas de informes anuales indonesios, pero carece de licencia declarada y de validación pública.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor; riesgo legal en producción.
- Documentación mínima: no se publican datos de entrenamiento, composición del dataset, métricas de evaluación ni benchmarks, lo que impide validar su calidad.
- Riesgo de alucinación y falsos positivos: al ser un clasificador, puede asignar aspectos o tonos incorrectos en frases ambiguas o fuera de dominio.
- Dependencia de la extracción de palabras clave: el rendimiento depende de que el usuario replique la misma lógica de extracción de keywords de riesgo y aspecto que los cuadernos del proyecto (no incluidos en el repo).
- Contexto limitado a 256 tokens: frases más largas se truncan, lo que puede perder información relevante.
- Solo inglés: aunque los informes originales son indonesios, el modelo no declara soporte para indonesio; su uso en ese idioma no está validado.
- Código personalizado (`trust_remote_code=True`): implica ejecutar código del autor; revisar antes de desplegar en entornos sensibles.
- Sesgos potenciales: entrenado sobre un corpus específico de empresas cotizadas indonesias; puede no generalizar a otros mercados, sectores o idiomas.
- No predice precios ni retornos: el autor lo indica explícitamente; no debe usarse como señal de inversión directa.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta; sin comunidad que valide su comportamiento.

## Enlaces

- HuggingFace: https://huggingface.co/jack1211son/abdta-multi-task-v4-0pct-2x-train-dist
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
