# jack1211son/abdta-multi-task-v4-0pct-2x-equal

## Resumen

`abdta-multi-task-v4-0pct-2x-equal` es un modelo de clasificación de texto multi-tarea desarrollado por el usuario de Hugging Face `jack1211son`, afinado a partir de `microsoft/deberta-v3-large`. Resuelve dos tareas simultáneas sobre narrativas de informes anuales de empresas cotizadas indonesias: análisis de tono (positivo, negativo, neutro) y clasificación de aspectos de divulgación de riesgos (economía, beneficio/pérdida, dividendos, financiación, marca, tecnología, inversión, gobernanza, producto/servicio, fusiones y adquisiciones, legal, medioambiente, social/personas y político). Forma parte de la colección ABDTA (aspect-based risk-disclosure tone analysis).

El modelo se apoya en una arquitectura DeBERTa-v3-large con código personalizado (`trust_remote_code=True`) que expone dos cabezas de clasificación sobre el mismo encoder. Con 434 millones de parámetros y una ventana de entrada limitada a 256 tokens, está diseñado para clasificar fragmentos de lenguaje de divulgación, no para generar texto ni predecir precios de acciones. Su relevancia radica en el enfoque multi-tarea aplicado a un dominio financiero muy específico (informes anuales en inglés de empresas indonesias) con variantes de aumento de datos mediante pseudo-etiquetado y balanceo de aspectos.

La variante `0pct` indica que no se aplicó *dropout* de palabras clave de aspecto durante el entrenamiento; `2x` denota una variante de aumento con pseudo-etiquetas, y `equal` indica que los aspectos están balanceados. Este checkpoint es el modelo final de la colección, reentrenado sobre datos de entrenamiento más validación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large) con cabezas multi-tarea personalizadas |
| Parámetros totales | 434.031.635 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (límite de entrada declarado) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-large`, un encoder transformer con atención desacoplada y embeddings relativos de posición, y le añade código personalizado que implementa dos cabezas de clasificación: una para el tono (3 clases: `Positive`, `Negative`, `Neutral`) y otra para el aspecto (14 clases: `Economics`, `Profit|Loss`, `Dividend`, `Financing`, `Brand`, `Technology`, `Investment`, `Governance`, `Product|Service`, `M&A`, `Legal`, `Environment`, `Social&People`, `Political`). El entrenamiento es multi-tarea, compartiendo el encoder entre ambas cabezas.

La model card documenta el esquema de variantes de la colección ABDTA: el sufijo `0pct` indica ausencia de *dropout* de palabras clave de aspecto en tiempo de entrenamiento; `2x` denota una variante de aumento con pseudo-etiquetas (frente a `4x`); `equal` indica balanceo de aspectos (frente a `train-dist`, que sigue la distribución de entrenamiento). Este checkpoint es el modelo final de la colección, reentrenado sobre entrenamiento más validación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco probables en un encoder de clasificación).

El formato de entrada es específico y debe replicarse: `[Risk Keywords: <risk words> Aspect Keywords: <aspect words>] <sentence>`. La extracción de palabras clave de riesgo y aspecto debe hacerse con el mismo procedimiento que los *notebooks* del proyecto, no publicados como parte del repositorio.

## Capacidades

- Clasificación de tono en tres clases (`Positive`, `Negative`, `Neutral`) sobre oraciones de informes anuales.
- Clasificación multi-etiqueta de 14 aspectos de divulgación de riesgos financieros.
- Ejecución simultánea de ambas tareas en una sola pasada (*multi-task*), compartiendo encoder.
- Procesamiento de entradas con palabras clave de riesgo y aspecto inyectadas explícitamente en el *prompt*.
- Especialización en inglés financiero y en el dominio de informes anuales de empresas cotizadas indonesias.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso ni generación de texto: es un encoder de extracción de características y clasificación.
- No tiene capacidades multimodales (visión, audio) ni *thinking mode*.

## Casos de uso

- **Análisis de sentimiento en informes anuales**: clasificar oraciones de las memorias anuales de empresas indonesias en tono positivo, negativo o neutro, útil para estudios académicos de divulgación corporativa y para *screening* automatizado de narrativas.
- **Detección de aspectos de riesgo**: identificar qué temas (gobernanza, medioambiente, fusiones, legal, etc.) aborda cada fragmento, permitiendo construir índices temáticos de divulgación de riesgos por empresa y ejercicio.
- **Monitorización regulatoria de divulgación**: procesar lotes de informes para verificar que las empresas cubren los aspectos exigidos por el regulador, usando la clasificación de aspectos como señal de cobertura.
- **Investigación en finanzas cuantitativas basada en texto**: generar variables de tono y aspecto por empresa y año como *features* en modelos econométricos o de *machine learning* que estudien la relación entre narrativa y variables financieras (sin que el modelo prediga retornos directamente).
- **Construcción de *datasets* etiquetados**: usar el modelo como etiquetador débil sobre corpus no anotados de informes anuales, dentro de un pipeline de anotación asistida supervisado posteriormente por humanos.
- **Análisis comparativo entre sectores o países**: aplicar el modelo a informes de empresas de distintos sectores para comparar la distribución de aspectos y el tono predominante, siempre que el texto esté en inglés y las entidades sean razonablemente similares al dominio de entrenamiento.
- **Investigación en NLP financiero**: servir como *baseline* multi-tarea DeBERTa para experimentos de *aspect-based sentiment analysis* en el dominio financiero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de exactitud, F1, MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos. Tampoco se publican los CSV de evaluación a nivel de oración como activos del modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en fp32, aproximadamente 1,7 GB de pesos (tamaño del repo); en fp16, en torno a 0,9 GB. El consumo real incluye activaciones y *batch*, por lo que con *batch size* 1 y 256 tokens cabría en GPUs con 4 GB o más.
- **GPU recomendadas**: cualquier GPU con al menos 4-6 GB de VRAM es suficiente para inferencia en *batch* pequeño; para *throughput* alto, A100, H100, L4 o RTX 4090.
- **Consumer GPU**: sí, cabe en RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más, e incluso en GPUs de 4 GB con cuantización o *batch* 1.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` (requerido por el código personalizado); también es posible exportar a ONNX o TorchScript para servir con `optimum` o FastAPI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser un encoder de clasificación no encaja en el patrón de servidores de generación.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jack1211son/abdta-multi-task-v4-0pct-2x-equal` | 434 M | 256 tokens | Clasificación multi-tarea (tono + aspecto) en finanzas | no disponible | Hugging Face, 0 descargas |
| `microsoft/deberta-v3-large` | ~435 M | 512 tokens | Encoder base, *fine-tuning* genérico | MIT | Hugging Face, ampliamente usado |
| `ProsusAI/finbert` | ~110 M | 512 tokens | Análisis de sentimiento financiero (3 clases) | no disponible | Hugging Face, muy usado |
| `yiyanghkust/finbert-tone` | ~110 M | 512 tokens | Tono financiero (positivo/negativo/neutro) | no disponible | Hugging Face |

La comparativa se limita a alternativas de la misma categoría (clasificación de texto financiero). El modelo aquí descrito se distingue por su doble salida (tono y aspecto) y su especialización en informes anuales indonesios, mientras que FinBERT y sus variantes son modelos de sentimiento general financiero con menor granularidad temática. No se dispone de datos de rendimiento comparativo para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- **Idioma**: solo inglés; no se ha validado su comportamiento en otros idiomas, incluido el indonesio, a pesar de que el dominio son empresas indonesias.
- **Contexto limitado**: 256 tokens de entrada, lo que obliga a segmentar oraciones o fragmentos y puede perder contexto discursivo.
- **Formato de entrada rígido**: requiere inyectar palabras clave de riesgo y aspecto con el mismo procedimiento que los *notebooks* del proyecto, no publicados; un uso distinto puede degradar el rendimiento de forma impredecible.
- **Código personalizado**: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el código antes de usarlo en producción.
- **Licencia no disponible**: no se especifica licencia, lo que impide asumir derechos de uso comercial; es imprescindible contactar con el autor antes de cualquier explotación comercial.
- **Riesgo de alucinación**: al ser un clasificador, no genera texto, pero puede producir etiquetas erróneas con alta confianza en oraciones ambiguas o fuera de dominio.
- **Dominio estrecho**: entrenado sobre informes anuales de empresas indonesias; su transferencia a otros sectores, países o tipos de documento no está validada.
- **Sesgos**: no documentados; al derivar de DeBERTa-v3-large y de un corpus financiero concreto, puede heredar sesgos de ese corpus y de la selección de empresas.
- **Sin métricas publicadas**: no hay datos de evaluación que permitan estimar su calidad real; 0 descargas y 0 *likes* en Hugging Face indican ausencia de validación comunitaria.
- **No predice precios ni retornos**: la propia model card lo advierte; no debe usarse como señal de inversión directa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jack1211son/abdta-multi-task-v4-0pct-2x-equal
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Perfil del autor: https://huggingface.co/jack1211son
