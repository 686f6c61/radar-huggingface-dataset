# johnson/AI-writing-detector-laya-zh

## Resumen

AI-writing-detector-laya-zh es un clasificador de texto especializado en detectar si una frase de un artículo académico en chino ha sido escrita por una persona o generada o reescrita por un modelo de la familia DeepSeek. Lo desarrolla el usuario de HuggingFace `johnson` y se distribuye con licencia Apache-2.0. El modelo resuelve un problema muy concreto: la creciente dificultad para distinguir texto académico humano de texto pulido o reescrito por IA en publicaciones en chino, un fenómeno que ha crecido con la adopción masiva de asistentes de escritura.

Técnicamente es un fine-tuning del checkpoint multilingüe `convaiinnovations/laya`, construido sobre ModernBERT-large con 421 M de parámetros, aunque los pesos publicados en safetensors suman 321.908.998 parámetros. El modelo se ha entrenado sobre 99.900 frases de artículos académicos en chino durante una sola época, con calibración RLCD, y clasifica cada frase en tres etiquetas: `human`, `deepseek_light` (pulido ligero por IA) y `deepseek_heavy` (reescritura profunda por IA).

Su relevancia actual radica en que ofrece detección a nivel de frase con una tasa de verdaderos positivos del 89,54 % a un 1 % de falsos positivos y un AUC de 0,9935, superando a un baseline RoBERTa-wwm-ext de 102 M (0,831 en la misma métrica). El modelo está pensado para integrarse en flujos de revisión editorial y auditoría de manuscritos, no como prueba definitiva de mala conducta académica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large), modelo de decisión "System One" de Laya |
| Parametros totales | 321.908.998 (pesos safetensors publicados); la model card indica 421 M para el checkpoint base |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (max_len de entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Etiquetas de salida | `human`, `deepseek_light`, `deepseek_heavy` |
| Tamano del repositorio | 0,7 GB |
| Libreria | laya |

## Arquitectura y entrenamiento

El modelo se basa en Laya, un checkpoint multilingüe de tipo "System One decision model" construido sobre ModernBERT-large (421 M de parámetros). Sobre esa base se ha realizado un fine-tuning supervisado para clasificación de frases en tres clases, orientado a distinguir escritura humana de dos grados de intervención de IA. La innovación metodológica declarada es el uso de calibración RLCD (Reinforcement Learning from Classification Data, según la nomenclatura del autor) para ajustar el umbral de decisión.

El conjunto de entrenamiento consta de 99.900 frases extraídas de artículos académicos en chino, con una sola época de entrenamiento, micro-batch de 8 con acumulación de gradiente de 8, longitud máxima de 128 tokens y un learning rate de 2,5e-5 para el encoder. El entrenamiento completo se ejecutó en una GPU A800 en aproximadamente 30 minutos, lo que indica un coste computacional muy bajo y un modelo ligero orientado a inferencia rápida.

## Capacidades

- Clasificación de frases académicas en chino en tres categorías: escritura humana, pulido ligero por IA y reescritura profunda por IA.
- Detección específica de texto generado o reescrito por modelos de la familia DeepSeek.
- Salida de probabilidades por clase, lo que permite calcular una probabilidad agregada de IA (`p_ai = p(deepseek_light) + p(deepseek_heavy)`) y ajustar el umbral según la tolerancia a falsos positivos.
- Umbral de decisión configurable (0,9 por defecto, equivalente a ~1 % de FPR; 0,95 recomendado para escenarios de alta precisión).
- Interfaz de línea de comandos (`inference.py --input paper.txt --thr 0.9`) para procesar documentos completos.
- Integración con la librería `laya` y con `huggingface_hub` para descarga y carga del modelo.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso: es un clasificador de frases, no un modelo generativo.

## Casos de uso

- Auditoría editorial de manuscritos académicos: procesar un artículo en chino frase a frase y generar un informe con las frases marcadas como `deepseek_light` o `deepseek_heavy`, usando el umbral de 0,95 para minimizar falsos positivos antes de una revisión humana.
- Filtrado previo en revistas y conferencias: integrar el clasificador en el pipeline de recepción de manuscritos para priorizar la revisión de aquellos con mayor proporción de frases sospechosas, sin sustituir la evaluación por pares.
- Detección de reescritura por IA en trabajos de fin de grado y tesis: analizar secciones concretas (introducción, metodología, discusión) y comparar la distribución de etiquetas entre secciones para detectar patrones anómalos.
- Control de calidad en servicios de edición académica: verificar si un texto entregado por un cliente ya ha sido procesado previamente por IA antes de aplicar correcciones humanas, evitando cadenas de reescritura difíciles de auditar.
- Investigación sobre uso de IA en publicaciones: recopilar estadísticas agregadas de prevalencia de texto asistido por IA en corpus académicos en chino, con la probabilidad por frase como variable continua.
- Monitorización de integridad en plataformas de preprints: ejecutar el clasificador de forma periódica sobre nuevos envíos y marcar automáticamente los que superen un umbral configurable de frases con alta probabilidad de IA.
- Evaluación comparativa de detectores: usar el modelo como referencia en experimentos que comparen detectores de texto IA en chino académico, aprovechando sus métricas publicadas (TPR@1%FPR, AUC) como línea base.

## Benchmarks y rendimiento

| Metrica | AI-writing-detector-laya-zh | RoBERTa-wwm-ext 102M (referencia del autor) |
|---|---|---|
| TPR@1%FPR | 0,8954 | 0,831 |
| AUC | 0,9935 | No disponible |
| FPR@1% | 1,03 % | No disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp32 para los 322 M de parámetros publicados; en la práctica cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090); también funciona en CPU para volúmenes moderados de frases.
- Cabe en GPU consumer: sí, en todas las GPU modernas de NVIDIA, AMD o Apple Silicon con suficiente memoria unificada.
- Opciones de despliegue: librería `laya` (requerida por el autor), `huggingface_hub` para la descarga, y el script `inference.py` incluido en el repositorio para procesar ficheros de texto. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; el entrenamiento en una A800 durante 30 minutos sugiere una inferencia muy rápida por frase, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | TPR@1%FPR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI-writing-detector-laya-zh | 321,9 M (publicados) | 128 tokens | 0,8954 | Apache-2.0 | HuggingFace (`johnson/AI-writing-detector-laya-zh`) |
| RoBERTa-wwm-ext (baseline del autor) | 102 M | No disponible | 0,831 | No disponible | Referencia citada en la model card |
| Detectores genéricos de texto IA en chino | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita al baseline citado por el propio autor, ya que no se han encontrado en la información disponible otros detectores especializados en chino académico con métricas comparables. El modelo supera al baseline RoBERTa-wwm-ext en TPR@1%FPR con un coste de parámetros aproximadamente tres veces mayor.

## Limitaciones y advertencias

- Solo se ha validado en chino académico; el propio autor indica que en dominios médico o en inglés el mismo配置 rinde peor que modelos más pequeños.
- Cobertura limitada a reescrituras de la familia DeepSeek; no se ha validado frente a otros generadores (GPT, Claude, Gemini, Qwen, etc.), por lo que puede infraestimar texto generado por otras IA.
- Clasificación a nivel de frase y sin contexto: no considera el discurso global del documento, lo que puede generar falsos positivos en frases aisladas ambiguas.
- Existe una tasa de falsos positivos del 1,03 % al umbral por defecto; el autor advierte explícitamente que el modelo no debe usarse para determinar mala conducta académica.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre las decisiones derivadas del clasificador recae en el implementador.
- Modelo con muy baja adopción (18 descargas, 0 likes en el momento de la consulta) y sin validación independiente publicada; conviene tratarlo como experimental.
- El repositorio depende de la librería `laya`, poco extendida, lo que puede complicar el despliegue en infraestructuras estándar.
- No se documentan sesgos específicos más allá de la limitación de dominio e idioma.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/johnson/AI-writing-detector-laya-zh
- Dataset de entrenamiento: https://huggingface.co/datasets/johnson/AI-writing-detector-dataset
- Repositorio de código y tutoriales: https://github.com/johnson7788/checkAI
- Checkpoint base Laya: https://huggingface.co/convaiinnovations/laya
