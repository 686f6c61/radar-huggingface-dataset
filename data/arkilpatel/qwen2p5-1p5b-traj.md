# arkilpatel/qwen2p5-1p5b-traj

## Resumen

Este repositorio no contiene un modelo final, sino una **trayectoria densa de checkpoints intermedios** de un único proceso de fine-tuning del modelo `Qwen/Qwen2.5-1.5B-Instruct` sobre razonamiento matemático. Ha sido publicado por Arkil Patel, investigador del laboratorio Mila y la Universidad McGill, con el objetivo de facilitar la investigación sobre cómo evolucionan las capacidades de los modelos durante el entrenamiento.

El conjunto incluye **176 checkpoints** guardados cada 25 pasos de optimización a lo largo de 4 épocas de datos, más un checkpoint final con estado del optimizador. Cada checkpoint es un modelo completo de 1.500 millones de parámetros en formato bf16, listo para inferencia. El repositorio también contiene resultados de evaluación agregados y por elemento para cada checkpoint, sobre conjuntos públicos de matemáticas como MATH-500, AIME 2024/2025, AMC 2023, HMMT Feb 2025 y OlympiadBench.

Su relevancia actual radica en que permite estudiar la dinámica de entrenamiento de un modelo pequeño en una tarea de razonamiento, algo poco común en la literatura abierta. El acceso a la trayectoria completa, con registros de evaluación por ítem, posibilita análisis reproducibles sin necesidad de regenerar respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2.5) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no especificado en el repositorio; el modelo base Qwen2.5-1.5B-Instruct soporta 32K tokens |
| Tipos de cuantizacion | bf16 (pesos publicados); no se ofrecen otras cuantizaciones |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero no se indica en el repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only denso de 1.500 millones de parámetros. El fine-tuning se realizó sobre un dataset de razonamiento matemático (no se especifica el dataset concreto en el repositorio). El entrenamiento duró **4 épocas** y se guardaron checkpoints cada **25 pasos de optimización**, dando lugar a la secuencia `step-0025` hasta `step-4314`.

Los pesos de los checkpoints intermedios están en **bfloat16**, convertidos desde los pesos fp32 originales para inferencia. No son aptos para reanudar entrenamiento. El directorio `final-full/` contiene los pesos fp32 completos más el estado del optimizador, siendo el único checkpoint desde el que se podría continuar el entrenamiento. No se menciona el uso de RLHF ni DPO; el proceso parece ser un fine-tuning supervisado estándar.

Las evaluaciones publicadas en `results/` se generaron con **temperatura 1.0 y k=64** (64 muestras por problema), y se incluyen registros por ítem con el número de intentos (`n`) y aciertos (`c`) para cada identificador de problema.

## Capacidades

- **Razonamiento matemático**: todos los checkpoints están entrenados para resolver problemas matemáticos de nivel competitivo (MATH-500, AIME, AMC, HMMT, OlympiadBench).
- **Generación de texto**: como fine-tuning de un modelo instruct, mantiene las capacidades de generación de texto y seguimiento de instrucciones del modelo base, aunque con foco matemático.
- **Evaluación evolutiva**: permite observar cómo cambian las capacidades matemáticas a lo largo del entrenamiento, algo que no es una capacidad del modelo en sí, sino del repositorio.
- **Multilingüe**: el modelo base es multilingüe, pero no se ha verificado en este fine-tuning concreto.
- **No soporta tool calling ni agentes**: no hay indicios en el repositorio de que se haya entrenado para function calling o uso de herramientas.
- **No tiene modo de pensamiento explícito**: no se menciona ningún mecanismo de thinking mode.

## Casos de uso

- **Investigación sobre dinámica de entrenamiento**: los checkpoints permiten estudiar cómo surgen y se consolidan las habilidades matemáticas a lo largo del entrenamiento, correlacionando pasos con métricas de evaluación.
- **Análisis de la evolución de la alucinación**: los registros por ítem permiten ver en qué punto del entrenamiento el modelo comienza a producir respuestas correctas consistentes y cuándo aparecen errores sistemáticos.
- **Estudio de la relación entre n y c en muestreo**: los datos de evaluación con k=64 permiten analizar la distribución de aciertos a lo largo de la trayectoria, útil para investigar la relación entre la probabilidad de acierto y la capacidad del modelo.
- **Evaluación de la transferencia entre benchmarks**: comparar los resultados en MATH-500, AIME, AMC, HMMT y OlympiadBench para cada checkpoint permite estudiar la correlación entre dificultad y momento de entrenamiento.
- **Reproducción de experimentos**: los registros de evaluación por ítem permiten reproducir análisis sin necesidad de re-ejecutar generaciones, ahorrando recursos computacionales.
- **Estudio de la convergencia**: el checkpoint `final-full` con estado del optimizador permite continuar el entrenamiento desde el punto exacto donde se detuvo, útil para experimentos de extensión de entrenamiento.

## Benchmarks y rendimiento

No se publican en el repositorio los resultados numéricos agregados de los benchmarks. Sin embargo, se indica que en `results/` se incluyen puntuaciones agregadas y registros por ítem para **MATH-500, AIME 2024/2025, AMC 2023, HMMT Feb 2025 y OlympiadBench**, evaluados con temperatura 1.0 y k=64. Los datos están disponibles para su consulta directa en el repositorio, pero no se han reproducido aquí por no disponer de los valores concretos.

## Requisitos de hardware

- **VRAM para inferencia**: un checkpoint en bf16 (1.5B parámetros) requiere aproximadamente 3-4 GB de VRAM. Cabe en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB).
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM para inferencia individual. Para evaluar los 176 checkpoints de forma secuencial, se recomienda una GPU con al menos 16 GB para evitar recargas frecuentes.
- **Almacenamiento**: el repositorio completo ocupa **561.9 GB**, por lo que se necesita espacio en disco considerable. Un checkpoint individual pesa aproximadamente 3.2 GB.
- **Opciones de despliegue**: se puede cargar con `transformers` directamente usando `subfolder="step-NNNN"`. También puede servirse con vLLM, llama.cpp o Ollama si se convierte a GGUF, aunque el repositorio solo ofrece safetensors.
- **Latencia**: no se han publicado datos de latencia o throughput. Para un modelo de 1.5B, en una RTX 4090 se espera una velocidad de generación de alrededor de 100-200 tokens por segundo, pero no está confirmado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1.5B | 32K | Apache 2.0 | HuggingFace | Modelo base, no fine-tuning específico de matemáticas |
| arkilpatel/qwen2p5-1p5b-traj | 1.5B | no especificado | Apache 2.0 | HuggingFace | 176 checkpoints intermedios + final, con datos de evaluación |
| Otros fine-tunes de Qwen2.5-1.5B matemáticos | 1.5B | variable | variable | HuggingFace | No hay información específica en los datos proporcionados |

La principal diferencia con un modelo final es que este repositorio no ofrece un único modelo, sino una serie temporal de modelos con sus evaluaciones, lo que lo hace útil para investigación, no para despliegue en producción.

## Limitaciones y advertencias

- **No es un modelo final de producción**: los checkpoints intermedios pueden tener un rendimiento inferior al checkpoint final y no están destinados a uso en aplicaciones reales.
- **Tamaño del repositorio**: 561.9 GB, lo que hace la descarga completa costosa y poco práctica para usuarios que solo necesiten un checkpoint.
- **Datos de entrenamiento no especificados**: no se indica qué dataset matemático se utilizó, lo que limita la reproducibilidad del entrenamiento.
- **Posibles sesgos**: no se han documentado sesgos específicos, pero al estar entrenado en problemas matemáticos puede heredar sesgos del dataset de entrenamiento no declarado.
- **Riesgo de alucinación**: como modelo de razonamiento matemático, puede producir respuestas incorrectas con confianza, especialmente en checkpoints tempranos.
- **Licencia**: Apache 2.0 permite uso comercial, pero el repositorio no es un modelo final y su uso en producción no está recomendado.
- **Solo bf16**: no se ofrecen cuantizaciones de menor precisión, lo que limita el despliegue en hardware con poca memoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/arkilpatel/qwen2p5-1p5b-traj
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Página personal del autor: https://arkilpatel.github.io/
- Perfil de Google Scholar del autor: https://scholar.google.com/citations?user=-5goVAsAAAAJ&hl=en
