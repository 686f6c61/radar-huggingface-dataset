# aikexue170/jev-novel-3-0.8b-bf16

## Resumen

JEVnovel 3 · 0.8B (BF16) es un modelo de clasificación de texto desarrollado por el usuario aikexue170, especializado en la revisión automática de frases para la edición de novelas generadas por IA (AIGC). No es un modelo generativo: no produce texto de forma autorregresiva, sino que, en una única pasada hacia delante, analiza una frase y señala qué fragmento concreto está mal escrito y si ese fragmento debe eliminarse o reescribirse. Está construido sobre el modelo base Qwen3.5-0.8B mediante ajuste fino con LoRA y dos cabezas lineales adicionales.

El modelo resuelve un problema muy específico del flujo de trabajo editorial: detectar la "paja" decorativa típica de la escritura generada por IA (el llamado 八股 u "octava plegaria", un estilo formulaico muy común en chino). Para ello descompone cada frase en fragmentos según la puntuación y devuelve dos señales complementarias: una curva de "mala impresión" (indica desde qué fragmento empeora la calidad) y una puntuación de densidad informativa (indica si ese fragmento aporta contenido). La combinación de ambas permite decidir entre borrar o reescribir.

Es relevante por su tamaño reducido (0,75 B de parámetros, unos 1,4 GB en BF16) y por su enfoque de clasificación en una sola pasada, que lo hace adecuado para desplegar en entornos con recursos limitados y para procesar grandes volúmenes de frases en pipelines editoriales. El modelo está publicado bajo licencia Apache-2.0, soporta únicamente chino (zh) y su ventana de entrada está limitada a 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone de texto qwen3_5_text (hidden 1024, 24 capas) más dos cabezas lineales de clasificación Linear(1024→1) |
| Parametros totales | 752.395.074 (≈0,75 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (incluye un prompt fijo) |
| Tipos de cuantizacion | BF16 (esta versión, precisión original) y FP8 (versión aparte, jev-novel-3-0.8b-fp8, ≈1,0 GB) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 (heredada del modelo base Qwen3.5) |
| Formato de pesos | safetensors (BF16, archivo único, ≈1,4 GB) con código de inferencia propio en PyTorch |

## Arquitectura y entrenamiento

El modelo parte del backbone de texto de Qwen3.5-0.8B (qwen3_5_text, con dimensión oculta de 1024 y 24 capas) ajustado con LoRA. Sobre ese backbone se añaden dos cabezas de clasificación independientes, cada una una capa lineal Linear(1024→1): la cabeza de "curva de impresión" lee el último token de cada fragmento para producir una puntuación acumulada, mientras que la cabeza de "densidad informativa" promedia dentro de cada fragmento. El pipeline declarado es text-classification, no generación de texto.

El entrenamiento se apoyó en dos procesos de destilación distintos sobre un corpus de 24.000 frases con datos de preferencia humana recogidos por una comunidad de anotación. La curva de impresión se destiló de un modelo maestro de 27 B de la misma familia (jev-novel-3-27b-bf16), que puntuaba cada prefijo de la frase en una escala de cinco niveles (de "muy malo" a "excelente"); el estudiante aprende la forma completa de la curva, no solo si la frase es mala. La densidad informativa se etiquetó con un juez externo (StartLux-Decision-27B), que respondía, fragmento a fragmento, si ese fragmento debía eliminarse por completo o conservarse y reescribirse, siguiendo una taxonomía de "escritura formulaica de IA" validada con casos humanos. Los umbrales de decisión (0,080 para "requiere modificación", densidad 0,5 para la frontera borrar/reescribir) se fijaron en el conjunto de validación y se congelaron antes de aplicarlos al conjunto principal.

## Capacidades

- Clasificación de frases: determina si una frase necesita modificación y devuelve una probabilidad (`p_bad`) junto con la decisión binaria.
- Segmentación por puntuación: divide la frase en fragmentos y evalúa cada uno de forma individual.
- Curva de impresión por fragmento: indica desde qué fragmento comienza a degradarse la calidad de la escritura.
- Puntuación de densidad informativa (0-1) por fragmento: distingue contenido real de relleno decorativo.
- Recomendación de acción editorial por fragmento: borrar, reescribir o dejar intacto.
- Inferencia en una sola pasada hacia delante, sin generación autorregresiva, lo que reduce la latencia frente a modelos generativos.
- Procesamiento por lotes mediante entrada/salida JSONL (`--input input.jsonl --output pred.jsonl`).
- No soporta tool calling, ni function calling, ni razonamiento multi-paso, ni agentes, ni visión, ni audio: es un clasificador de una sola tarea.

## Casos de uso

- Revisión editorial automatizada de novelas AIGC: el modelo recibe cada frase del manuscrito y devuelve los fragmentos problemáticos con la acción recomendada (borrar o reescribir), permitiendo a un editor humano centrarse únicamente en los pasajes señalados.
- Preprocesado de manuscritos antes de la publicación: filtrar mecánicamente el relleno decorativo típico de la escritura generada por IA antes de pasar el texto a un corrector humano o a otra herramienta.
- Puntuación de calidad en la generación por lotes: integrar el modelo como filtro de calidad en un pipeline que genere múltiples versiones de un capítulo y quedarse con la de mayor puntuación.
- Comparación de variantes de un mismo fragmento: aplicar el modelo a distintas reescrituras de una frase y elegir aquella con menor `p_bad` y mejor curva de impresión.
- Análisis de estilo en corpus literarios: usar la señal de densidad informativa para estudiar la proporción de relleno presente en distintos autores o géneros.
- Control de calidad en plataformas de escritura asistida: verificar automáticamente el texto producido por herramientas de generación antes de entregarlo al usuario final.
- Etiquetado a escala para investigación: procesar lotes de decenas de miles de frases (el corpus de evaluación tiene 4.254 elementos) para construir conjuntos de datos anotados sobre calidad de escritura.

## Benchmarks y rendimiento

El autor publica resultados bajo un protocolo propio de la familia JEVnovel. Los umbrales se fijan solo en validación y se aplican al conjunto principal de 538 frases con mayor consenso humano. La métrica principal es Macro-F1. El modelo es de clasificación, por lo que no se dispone de resultados en benchmarks generales como MMLU, HumanEval o GSM8K.

| Modelo | Macro-F1 (conjunto principal) | Recall "bad" | Precisión "bad" | Falsos positivos en frases normales | Macro-F1 (conjunto completo) |
|---|---:|---:|---:|---:|---:|
| jev-novel-2-0.8b-bf16 (2.ª generación) | 0,7426 | 0,6790 | 0,7830 | 0,1910 | 0,6057 |
| jev-novel-2.5-0.8b-bf16 (2.ª y media) | 0,730 | 0,734 | 0,732 | 0,273 | 0,607 |
| jev-novel-3-0.8b-bf16 (este modelo) | 0,780 | 0,668 | 0,870 | 0,101 | 0,580 |

Datos adicionales de rendimiento publicados por el autor:

- Comparación BF16 frente a FP8 con el mismo umbral (0,080) sobre el conjunto completo de 4.254 frases: Macro-F1 pasa de 0,580 a 0,576; desviación media por frase de 0,006; 6 de 538 decisiones del conjunto principal se invierten. El autor concluye que la cuantización es prácticamente sin pérdida.
- Consistencia de las cabezas con el maestro y el juez (conjunto de validación): correlación de 0,76 para la curva de impresión y de 0,90 para la densidad informativa.

## Requisitos de hardware

- Entorno soportado: Linux, Python 3.10 o superior y GPU NVIDIA con soporte para BF16.
- VRAM estimada para inferencia: el peso BF16 ocupa aproximadamente 1,4 GB, por lo que con la activación y el contexto de 512 tokens la inferencia debería caber holgadamente en GPUs con 4-6 GB de VRAM. La versión FP8 reduce el peso a unos 1,0 GB.
- GPUs recomendadas: cualquier GPU NVIDIA con soporte BF16. Cabe sin problema en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4070 o RTX 4090; también en A100 o H100, aunque serían sobredimensionadas para este tamaño.
- Despliegue: el autor indica explícitamente que la estructura es personalizada y que no puede cargarse con `AutoModel`; hay que usar el `infer.py` incluido en el repositorio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Dependencias: `torch==2.13.0` desde el índice de PyTorch con CUDA 13.0, más `requirements.txt` instalado sin aislamiento de build.
- Latencia y throughput: no disponible en la información proporcionada. Únicamente se indica que la inferencia es de una sola pasada hacia delante (sin decodificación autorregresiva).

## Comparativa con modelos similares

No se dispone de información sobre modelos de terceros comparables con esta tarea específica (clasificación de calidad de frases para edición de novelas AIGC). La comparación más directa es con las generaciones anteriores de la propia familia JEVnovel, cuyos datos de benchmark sí están publicados y se recogen a continuación.

| Modelo | Parámetros | Contexto | Macro-F1 (conjunto principal) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jev-novel-3-0.8b-bf16 (este) | 0,75 B | 512 tokens | 0,780 | Apache-2.0 | HuggingFace |
| jev-novel-2.5-0.8b-bf16 | no disponible | no disponible | 0,730 | no disponible | HuggingFace |
| jev-novel-2-0.8b-bf16 | no disponible | no disponible | 0,7426 | no disponible | HuggingFace |

## Limitaciones y advertencias

- Modelo muy especializado: solo resuelve la tarea de clasificación de calidad de frases en novelas AIGC. No genera texto ni sirve para tareas generales.
- Idioma limitado: entrenado y evaluado únicamente en chino (zh). No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Ventana de contexto corta: 512 tokens en total, incluido el prompt fijo, lo que restringe la longitud de las frases procesables.
- Estructura personalizada: no puede cargarse con las utilidades estándar (`AutoModel`) de HuggingFace ni, previsiblemente, con servidores de inferencia estándar como vLLM o TGI; requiere el código propio del repositorio.
- Sesgos: los datos de entrenamiento provienen de una comunidad de anotación concreta y de las preferencias de un maestro de 27 B y un juez externo, de modo que el modelo hereda sus criterios estilísticos y sus posibles sesgos. No se documenta un análisis de sesgos.
- Riesgo de falsos positivos y negativos: en el conjunto principal la precisión sobre frases "malas" es alta (0,870) pero el recall es moderado (0,668); en el conjunto completo el Macro-F1 baja a 0,580. Un 10,1% de frases normales se marcan como problemáticas.
- Umbrales ajustados al dominio: los puntos de corte (0,080 y densidad 0,5) se fijaron sobre validación en el dominio de novelas AIGC; su aplicación a otros géneros puede degradar el rendimiento sin recalibración.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base Qwen3.5 y conviene revisar las condiciones de dicho modelo base.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y el autor no es un laboratorio consolidado, por lo que conviene validar el modelo en el caso de uso propio antes de ponerlo en producción.
- El código de instalación fija versiones muy concretas (`torch==2.13.0` con CUDA 13.0), lo que puede complicar el despliegue en entornos con versiones distintas.

## Enlaces

- HuggingFace: https://huggingface.co/aikexue170/jev-novel-3-0.8b-bf16
- Modelo maestro de 27 B de la familia (ModelScope): https://modelscope.cn/models/alkaid55555/jev-novel-3-27b-bf16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Informe técnico dentro del repositorio: 《JEVnovel3技术报告.md》
- Otros enlaces (papers, blogs, demos): no disponible en la información proporcionada.
