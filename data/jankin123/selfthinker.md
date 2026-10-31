# jankin123/SelfThinker

## Resumen

SelfThinker (en su repositorio de datos, `jankin123/SelfThinker`) no es un modelo en sí mismo, sino el repositorio de datos y suite de evaluación del proyecto SelfThinker, un sistema de razonamiento visual multimodal desarrollado por el autor jankin123. El proyecto se articula en tres partes: un modelo de 7B parámetros (SelfThinker-7B), este repositorio de datos con conjuntos de entrenamiento verificados por fiabilidad, y una suite de benchmarks con siete pruebas de razonamiento visual.

El problema que aborda es la fiabilidad de los "pensamientos visuales intrínsecos" en modelos vision-language: en lugar de aceptar cualquier cadena de razonamiento visual, los candidatos se puntúan mediante información puntual mutua condicional y solo se retienen los que superan un umbral estadístico (percentil 95). Esto lo hace relevante como ejemplo de entrenamiento self-evolving con destilación automática y verificación de datos sin etiquetas humanas.

El repositorio pesa 1,8 GB y contiene archivos Parquet de entrenamiento y archivos TSV de evaluación con imágenes embebidas en base64. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (es un repositorio de datos; el modelo asociado es SelfThinker-7B) |
| Parametros totales | no disponible (modelo asociado: 7B, según el nombre SelfThinker-7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (este repo contiene Parquet y TSV; los pesos de SelfThinker-7B están en su propio repositorio) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo, sino los datos de entrenamiento del proyecto SelfThinker. Los conjuntos se generan sintéticamente: problemas de búsqueda visual multiobjeto sobre lienzos de 384x384 píxeles con 5-8 formas no solapadas, de entre 5 formas y 8 colores. Para cada problema se generan hasta 6 candidatos de "pensamiento visual intrínseco" que se puntúan mediante información puntual mutua condicional: u(v) = log p(d | C(I, q, v)) − log p(d | C(I, q)), donde C es el contexto, I la imagen y q la pregunta.

Un candidato solo se retiene si supera el umbral específico del ítem correspondiente al percentil 95 de puntuaciones desajustadas (Q₀,₉₅). Existen dos direcciones de verificación: contra la respuesta ground-truth (nivel L0, 1.092 de 1.500 ítems verificados) y contra una votación por mayoría de rollouts sin etiquetas (nivel L1, 1.074 de 1.500 ítems). Los tags del proyecto indican enfoques self-evolving y self-distillation, es decir, el modelo mejora iterativamente con datos que él mismo ayuda a generar y verificar. No hay información disponible sobre el número de tokens de preentrenamiento, la composición completa del dataset ni el uso de RLHF/DPO.

## Capacidades

Al tratarse de un repositorio de datos, las capacidades listadas corresponden al proyecto SelfThinker y a su modelo asociado SelfThinker-7B:

- Razonamiento visual intrínseco: pensamientos visuales verificados por fiabilidad antes de usarse en entrenamiento.
- Búsqueda visual multiobjeto: localización y razonamiento sobre múltiples formas y colores en una escena.
- Comprensión de gráficos: evaluación sobre ChartQA con subconjuntos de barras horizontales y verticales.
- Percepción de detalles finos: benchmarks MMVP y V* orientados a percepción visual de alta dificultad.
- Razonamiento espacial 2D y 3D: evaluación mediante CV-Bench.
- Razonamiento multi-tarea visual: BLINK, con 14 subtareas de percepción visual.
- Resolución de laberintos: benchmark propio VSP con 600 ítems de tarea principal de laberinto.
- Sondas de condicionamiento por imagen en múltiples capas (script `eval_image.sh`) para análisis de cómo el modelo usa la información visual.

No hay información disponible sobre tool calling, capacidades de agentes, generación de código ni soporte de audio.

## Casos de uso

- Entrenamiento de modelos vision-language con datos verificados: los conjuntos Parquet permiten hacer fine-tuning (SFT o destilación) sobre pensamientos visuales cuya utilidad se ha demostrado estadísticamente, reduciendo el ruido típico de datos sintéticos.
- Investigación en destilación automática sin etiquetas: el nivel L1 usa votación por mayoría de rollouts como dirección de verificación, útil para estudiar self-distillation sin anotación humana.
- Evaluación comparativa de VLMs: la suite `lmudata/` incluye siete benchmarks en formato TSV autocontenido, lista para ejecutar con los scripts de evaluación del repositorio.
- Estudio de la fiabilidad del razonamiento visual: la métrica de información mutua condicional y el umbral del percentil 95 pueden replicarse para auditar pensamientos generados por otros modelos.
- Desarrollo de sistemas de búsqueda visual: los problemas sintéticos de búsqueda con 5-8 objetos no solapados sirven como banco de pruebas controlado para capacidades de grounding visual.
- Análisis de uso interno de la imagen: la sonda de condicionamiento por imagen en múltiples capas permite diagnosticar en qué medida un modelo realmente condiciona sus respuestas en el contenido visual frente a atajos textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye los archivos de evaluación para los siguientes benchmarks, pero no las puntuaciones obtenidas por SelfThinker-7B:

| Benchmark | Ítems | Agregacion |
|---|---:|---|
| VSP (laberintos) | 600 | Precision en tarea principal |
| ChartQA | 444 + 382 | Media de subconjuntos de barras horizontales y verticales |
| V* | 191 | Precision directa |
| MMVP | 300 | Precision directa |
| SAT | 150 | Precision en split circular |
| BLINK | 1.901 | Precision global en 14 subtareas |
| CV-Bench | 1.438 + 1.200 | Media de subconjuntos 2D y 3D |

## Requisitos de hardware

No disponible: al tratarse de un repositorio de datos (1,8 GB), no requiere GPU para su descarga y uso como dataset. Para el modelo asociado SelfThinker-7B no se ha publicado información de hardware, pero como referencia general para un modelo VLM de 7B:

- VRAM estimada para inferencia: en torno a 14-16 GB en FP16, aproximadamente 5-8 GB con cuantizacion de 4 bits (estimacion, no dato oficial).
- GPU recomendadas: una RTX 4090 o A100 seria suficiente para inferencia; no hay recomendaciones oficiales.
- Consumer GPU: una 7B tipicamente cabe en una RTX 3090/4090 de 24 GB sin cuantizar, y en GPUs de 8-12 GB con cuantizacion (estimacion).
- Despliegue: no se ha publicado soporte oficial para vLLM, llama.cpp, Ollama o TGI; el uso documentado pasa por clonar el repositorio de código de GitHub y descargar pesos con `huggingface-cli`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Comparativa orientativa del modelo asociado SelfThinker-7B frente a otros VLMs de tamaño similar (los datos de rendimiento de SelfThinker no están disponibles):

| Modelo | Parametros | Contexto | Razonamiento visual | Licencia |
|---|---|---|---|---|
| SelfThinker-7B | 7B (no oficialmente detallado) | no disponible | Pensamientos visuales verificados por MI condicional | Apache 2.0 |
| Qwen2.5-VL-7B | 7B | hasta 128K (segun documentacion de Qwen) | Razonamiento visual general, grounding | Apache 2.0 |
| LLaVA-OneVision-7B | 7B | no disponible | Comprension imagen/video multi-tarea | Apache 2.0 |
| InternVL2.5-8B | 8B | hasta 32K (segun documentacion de InternVL) | Razonamiento visual, benchmarks MMVP/BLINK/CV-Bench | MIT |

La diferencia diferenciadora de SelfThinker es la verificación estadística de los pensamientos visuales durante el entrenamiento, algo no presente por defecto en las alternativas listadas.

## Limitaciones y advertencias

- El repositorio es un dataset, no un modelo: intentar cargarlo como modelo dará error; los pesos están en `jankin123/SelfThinker-7B`.
- Los datos de entrenamiento son sintéticos y muy específicos (búsqueda visual con formas y colores concretos en lienzos de 384x384), por lo que su transferibilidad a dominios reales no está documentada.
- No hay model card detallada del modelo SelfThinker-7B en la información disponible: se desconocen arquitectura base, contexto, idiomas y resultados de benchmarks.
- Riesgo de alucinación: no evaluado públicamente en la información disponible; el método de verificación reduce el ruido de los datos de entrenamiento pero no garantiza ausencia de alucinaciones en inferencia.
- Sesgos: al tratarse de datos sintéticos con un repertorio limitado de 5 formas y 8 colores, el modelo resultante puede estar sesgado hacia ese tipo de estímulos.
- Sin descargas registradas y con un único like en HuggingFace, no existe historial de uso en producción ni validación comunitaria.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los benchmarks de evaluación (ChartQA, MMVP, BLINK, etc.), que tienen términos propios.
- El tamaño de algunos TSV es considerable (BLINK: 538 MB; SAT: 354 MB) por las imágenes embebidas en base64, lo que puede complicar el manejo en memoria.

## Enlaces

- Repositorio de datos: https://huggingface.co/jankin123/SelfThinker
- Modelo SelfThinker-7B: https://huggingface.co/jankin123/SelfThinker-7B
- Código en GitHub: https://github.com/zhangquanchen/SelfThinker
