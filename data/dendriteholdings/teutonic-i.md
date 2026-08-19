# dendriteholdings/Teutonic-I

## Resumen

Teutonic-I es un modelo de lenguaje causal decoder-only de aproximadamente 8.600 millones de parámetros (comercializado como 10B), desarrollado mediante un proceso de mejora descentralizada en la subred 3 de Bittensor, denominada Teutonic. Durante 70 días, mineros independientes entrenaron modelos challenger a partir del mejor checkpoint disponible, y un challenger solo se convertía en nuevo "rey" si demostraba una reducción estadísticamente robusta en la pérdida de predicción del siguiente token. El resultado final es el checkpoint rey #191, seleccionado el 1 de agosto de 2026.

El modelo utiliza una arquitectura híbrida de atención denominada Quasar, que combina tres capas de atención lineal seguidas de una capa de atención completa. Está pensado como modelo base preentrenado, no como asistente instruido, y su propósito principal es la investigación en continued pretraining, fine-tuning y evaluación de sistemas descentralizados de mejora de modelos. Su relevancia radica en ser uno de los primeros modelos de lenguaje de gran tamaño entrenados mediante un proceso competitivo descentralizado con validación estadística rigurosa.

La configuración declara una longitud máxima de posición de 2.097.152 tokens, pero la evaluación de la competición se realizó con secuencias de 2.048 tokens, por lo que el comportamiento en contextos largos no está verificado. El modelo se distribuye bajo licencia Apache 2.0 y requiere código personalizado de la librería Transformers para su ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Quasar (`QuasarForCausalLM`), decoder-only causal LM con atención híbrida (3 capas de atención lineal + 1 capa de atención completa) |
| Parametros totales | 8.602.037.248 (en el checkpoint; comercializado como 10B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens (evaluación de la competición); configuración declara 2.097.152 pero no verificado |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

Teutonic-I emplea una arquitectura decoder-only con 32 capas, tamaño oculto de 4.096, 16 cabezas de atención, 4 cabezas key/value, tamaño intermedio de 12.288 y un vocabulario de 248.320 tokens. El patrón de atención es híbrido: cada grupo de cuatro capas contiene tres capas de atención lineal y una de atención completa, una configuración que reduce el coste computacional manteniendo capacidad de modelado de dependencias a larga distancia.

El entrenamiento se realizó mediante un proceso competitivo descentralizado en la subred Teutonic de Bittensor. No se prescribió un script de entrenamiento único, dataset, duración ni hardware; cada minero eligió libremente cómo mejorar el checkpoint rey actual. La selección de modelos se basó en evaluaciones pareadas directas: ambos checkpoints se evaluaron en las mismas secuencias de 2.048 tokens, se calculó la pérdida de cross-entropy promedio por secuencia, y un bootstrap percentil con 10.000 réplicas estimó un límite inferior de confianza sobre la mejora media. El challenger se convertía en rey solo si ese límite superaba el umbral requerido (nivel de significancia 0.001, ventaja mínima 0.0015). La competición duró 70 días, completó 2.163 duelos y produjo 203 coronaciones exitosas. El pool de evaluación agregado contenía más de cuatro billones de tokens distribuidos en 12 datasets, aunque los nombres, licencias, proporciones y procedimientos de filtrado no están documentados.

## Capacidades

- Generación de texto causal: modelo base preentrenado capaz de continuar secuencias de texto con modelado de lenguaje estándar.
- Razonamiento y conocimiento general: obtiene puntuaciones notables en benchmarks como MMLU (75.29%), ARC-Challenge (63.82%) y WinoGrande (77.35%).
- Matemáticas: alcanza un 39.40% en MATH-500, aunque muy por debajo de modelos más grandes como Quasar-Preview 18B (71.40%).
- Capacidad multilingüe: no documentada; no se especifican los idiomas soportados ni la composición lingüística de los datos de entrenamiento.
- Sin soporte de tool calling ni function calling: al ser un modelo base, no incluye capacidades de invocación de herramientas ni agentes.
- Sin modo de pensamiento explícito ni visión: es exclusivamente un modelo de texto.

## Casos de uso

- Continued pretraining y adaptación a dominio: al ser un modelo base, es adecuado para continuar el preentrenamiento en dominios especializados (biomedicina, legal, código) aprovechando su arquitectura híbrida de atención que reduce costes en secuencias largas.
- Fine-tuning para tareas downstream: puede ajustarse con instrucciones o RLHF para crear asistentes conversacionales, sistemas de pregunta-respuesta o clasificadores de texto, partiendo de un checkpoint con buen rendimiento en razonamiento general.
- Evaluación de sistemas de mejora descentralizada: investigadores pueden reproducir el protocolo de selección por duelos pareados y bootstrap para estudiar la dinámica de mejora competitiva en modelos de lenguaje.
- Investigación en arquitecturas de atención híbrida: su patrón de tres capas lineales por una completa permite estudiar el equilibrio entre eficiencia computacional y calidad de modelado en comparación con transformers estándar.
- Generación de texto en entornos con recursos limitados: con 8.600 millones de parámetros, es viable en GPUs de consumo medio-alto (16-24 GB VRAM) tras cuantización, lo que lo hace accesible para prototipado y experimentación.
- Benchmarking de modelos base: su inclusión en suites de evaluación estandarizadas (MMLU, ARC, HellaSwag, etc.) permite comparar el impacto del entrenamiento descentralizado frente a pipelines de entrenamiento convencionales.

## Benchmarks y rendimiento

La model card reporta una puntuación media del 62.28% en 11 benchmarks compartidos. La siguiente tabla compara Teutonic-I con otros modelos de la misma familia y de referencia:

| Benchmark | Teutonic-I 10B | Quasar 10B | Quasar-Preview 18B | INTELLECT-1 10B | Psyche Cons. 40B | Covenant 72B |
|---|---:|---:|---:|---:|---:|---:|
| MMLU | **75.29** | 49.63 | 60.87 | 32.69 | 24.23 | 67.11 |
| ARC-C | **63.82** | 41.89 | 63.40 | 44.80 | 31.14 | 56.83 |
| ARC-E | **84.97** | 62.96 | 82.45 | 71.76 | 55.77 | 80.93 |
| PIQA | 82.81 | 69.91 | **83.30** | 77.73 | 76.12 | 81.56 |
| HellaSwag | 79.42 | 62.37 | 73.07 | 70.26 | 63.67 | **80.61** |
| OpenBookQA | **49.00** | 35.40 | 46.40 | 43.80 | 35.20 | 44.00 |
| BBH | **49.51** | 31.26 | 38.10 | 32.93 | 30.50 | 45.96 |
| TruthfulQA | **49.58** | 41.01 | 41.70 | 35.45 | 37.90 | 49.41 |
| WinoGrande | **77.35** | 56.27 | 67.56 | 63.30 | 56.99 | 75.85 |
| GPQA | **33.98** | 25.84 | 29.28 | 25.84 | 24.66 | 30.03 |
| MATH-500 | 39.40 | 0.00 | **71.40** | 1.00 | 0.20 | 20.80 |
| **Average** | **62.28** | 43.32 | 59.78 | 45.38 | 39.67 | 57.55 |

**Bold** indica el mejor resultado en cada fila. El promedio cubre los 11 benchmarks. Estos resultados no han sido reproducidos de forma independiente; faltan detalles de configuración del harness, pocos disparos, prompts y revisiones de datasets.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware en la documentación proporcionada. A partir del tamaño del modelo (8.602 millones de parámetros en BF16, 17.2 GB de pesos), se pueden hacer las siguientes estimaciones:

- VRAM estimada para inferencia: aproximadamente 18-20 GB en BF16 sin cuantizar; con cuantización de 8 bits (~8.6 GB) o 4 bits (~4.3 GB) podría ejecutarse en GPUs de consumo.
- GPU recomendadas: para BF16 completo, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A5000) o más; con cuantización 4 bits, una RTX 3060 de 12 GB o RTX 4070 de 12 GB sería suficiente.
- Compatibilidad con GPU de consumo: sí, especialmente con cuantización GGUF o AWQ.
- Opciones de despliegue: al ser un modelo de Transformers con código personalizado, se puede servir con vLLM, TGI o llama.cpp (si se genera el formato GGUF), aunque se requiere el tokenizador correspondiente, que no está incluido en el repositorio.
- Latencia y throughput: no disponibles; dependerán del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Puntuación media (11 benchmarks) |
|---|---|---|---|---|
| Teutonic-I 10B | 8.6B | 2.048 (evaluado) | Apache 2.0 | 62.28% |
| Quasar 10B | ~10B | no disponible | no disponible | 43.32% |
| Quasar-Preview 18B | ~18B | no disponible | no disponible | 59.78% |
| INTELLECT-1 10B | ~10B | no disponible | no disponible | 45.38% |
| Covenant 72B | ~72B | no disponible | no disponible | 57.55% |

Teutonic-I supera a todos los modelos comparados en la puntuación media, incluyendo a Covenant 72B, que tiene aproximadamente 8 veces más parámetros. Sin embargo, estos resultados no han sido verificados de forma independiente y la comparación puede verse afectada por diferencias en la configuración de evaluación.

## Limitaciones y advertencias

- Sin alineamiento de seguridad documentado: el checkpoint puede generar texto falso, sesgado, dañino o no deseado; no debe usarse en producción sin un proceso de alineamiento y moderación.
- Datos de entrenamiento incompletos: no se identifican los 12 datasets utilizados, sus licencias, composición geográfica o lingüística, métodos de filtrado ni análisis de contaminación con benchmarks.
- Tokenizador ausente: el repositorio no incluye los archivos del tokenizador, por lo que la inferencia no es posible hasta que se identifique y publique el tokenizador coincidente.
- Reproducibilidad limitada: faltan detalles de configuración del harness, pocos disparos, prompts y revisiones de datasets; los resultados de benchmarks no pueden reconstruirse exactamente.
- Comportamiento de contexto largo no verificado: la competición evaluó secuencias de 2.048 tokens; el valor máximo de posición declarado (2.097.152) no implica que el modelo funcione correctamente en longitudes mayores.
- Código personalizado requerido: la arquitectura Quasar necesita código específico del repositorio; no es un modelo estándar de Transformers y puede requerir mantenimiento adicional.
- Modelo base sin ajuste por instrucciones: no se espera que siga instrucciones de forma fiable sin fine-tuning o alineamiento adicional.
- Sin soporte de tool calling ni agentes: no incluye capacidades de invocación de funciones ni razonamiento multi-paso integrado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dendriteholdings/Teutonic-I
- Repositorio GitHub de Teutonic: https://github.com/unarbos/teutonic
