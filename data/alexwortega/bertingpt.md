# AlexWortega/bertingpt

## Resumen

El repositorio `AlexWortega/bertingpt` no contiene un modelo de lenguaje, sino un conjunto de **operadores lineales entrenados** que mapean las representaciones internas (residual streams) entre distintas familias de modelos transformer. El trabajo, firmado por Alex Wortega, es una verificación empírica de la versión fuerte de la hipótesis platónica de representaciones ([Ziyin & Chuang, arXiv:2507.01098](https://arxiv.org/abs/2507.01098)), que sostiene que dos modelos entrenados con SGD convergen a representaciones equivalentes salvo rotación. Aquí se comprueba qué queda de esa propiedad en transformers reales con tokenizadores y corpus de entrenamiento distintos.

El repositorio incluye código, resultados completos y los operadores ya entrenados, listos para aplicar sin recalcular. Se cubren seis familias: Mistral-7B-v0.3, Qwen2.5 (0.5B a 7B), SmolLM2-1.7B, OLMo-1B, Pythia-1.4B y GPT-2. Los operadores se ajustaron sobre activaciones de OpenWebText y se evalúan con métricas de residual-R², transferencia causal de mecanismos (induction heads) y perplexity de modelos "cosidos" (stitched). El tamaño del repositorio es de 1.6 GB, con pesos en formato PyTorch (`.pt`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Operadores lineales (matrices) sobre residual streams de transformers; no es un modelo generativo |
| Parametros totales | No disponible (los operadores son matrices de dimensiones variables según par de modelos; el repo ocupa 1.6 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (los operadores trabajan sobre activaciones por token, sin contexto propio) |
| Tipos de cuantizacion | No disponible (pesos en precisión flotante estándar de PyTorch) |
| Idiomas soportados | Inglés (los modelos fuente son principalmente en inglés; el README está en ruso) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (diccionarios con tensores `W`, `V`, estadísticas de normalización) |

## Arquitectura y entrenamiento

El proyecto no entrena un modelo de lenguaje, sino **mapeos lineales** entre los residual streams de pares de modelos. Para cada par (fuente → destino), se ajusta una matriz `W` que minimiza el error cuadrático entre las activaciones normalizadas de la fuente y las del destino, usando regresión por mínimos cuadrados. Los operadores se calculan en un solo paso acumulando los momentos `XᵀX`, `XᵀY` y los primeros momentos de las activaciones, sin almacenar las activaciones completas (un concat completo de 29 × 1536 sobre 5M posiciones ocuparía cientos de terabytes). Se emplea PCA para reducir la dimensionalidad de las activaciones fuente antes de la regresión.

La innovación principal es el **operador universal**: una única matriz que traduce las representaciones de todos los layers a la vez, frente a matrices separadas por capa. También se entrenan capas lineales para "coser" (stitching) modelos completos, y se realizan controles con pesos aleatorios para validar que los resultados no son artefactos. El entrenamiento se basa en el paper de Ziyin & Chuang, que demuestra teóricamente la convergencia a representaciones equivalentes salvo rotación en redes lineales; aquí se extiende la comprobación a transformers reales.

## Capacidades

- **Mapeo entre representaciones**: traduce activaciones de un modelo a las de otro (p. ej., Qwen2.5-1.5B → GPT-2) con una única matriz, alcanzando R² = 0.437 frente a 0.039 con pesos aleatorios.
- **Transferencia causal de mecanismos**: el operador permite predecir la salida de una induction head de GPT-2 a partir de activaciones de Qwen, recuperando el 98.1 % del efecto de la cabeza (frente a 8.8 % con pesos aleatorios).
- **Model stitching**: se proporcionan capas lineales entrenadas (`proj_*.pt`, `uproj_*.pt`) para conectar modelos completos y evaluar la compatibilidad de sus representaciones.
- **Análisis de simetría**: los operadores son casi simétricos (Qwen → GPT-2: 0.437; GPT-2 → Qwen: 0.446), lo que sugiere una relación de traducción mutua más que de contención.
- **Escalado del "carrier"**: se estudia cómo la alineación mejora con el tamaño del modelo fuente cuando se controla por la fracción de varianza explicada (R² residual de 0.512 para Qwen2.5-0.5B hasta 0.572 para Qwen2.5-7B).
- **Evaluación de dominios**: los operadores se evalúan fuera del dominio de entrenamiento (Wikipedia, The Pile, código), mostrando una caída significativa en código (R² = 0.172 frente a 0.440 en el dominio propio).

## Casos de uso

- **Investigación en interpretabilidad mecánica**: los operadores permiten transferir mecanismos (como induction heads) entre modelos, facilitando el estudio de si un comportamiento observado en un modelo pequeño se replica en uno grande sin necesidad de reentrenar.
- **Alineación de representaciones para análisis comparativo**: al mapear los residual streams de distintos modelos a un espacio común, se pueden comparar directamente las representaciones internas de modelos con arquitecturas y tokenizadores diferentes.
- **Model stitching experimental**: las capas lineales proporcionadas permiten construir modelos "híbridos" (mitad Qwen, mitad GPT-2) y medir su perplexity y KL, lo que sirve para validar teorías sobre la universalidad de las representaciones.
- **Validación de la hipótesis platónica en la práctica**: el repositorio ofrece una batería de experimentos reproducible para comprobar hasta qué punto la equivalencia salvo rotación se cumple en transformers reales, con scripts listos para ejecutar.
- **Optimización de transferencia de conocimiento**: los operadores podrían usarse para inicializar o guiar la destilación de representaciones entre modelos, aunque el trabajo no explora esta aplicación directamente.
- **Control de calidad en evaluación de modelos**: la matriz de familias (R² entre pares) sirve como referencia para saber qué pares de modelos comparten representaciones más alineadas, útil al elegir modelos para tareas de transferencia o comparación.

## Benchmarks y rendimiento

El repositorio reporta métricas de **residual-R²** (no R² crudo, que estaría dominado por la identidad del token actual). La tabla principal muestra el R² del operador universal (una matriz para todos los layers) entre pares de familias:

| Fuente \ Destino | Mistral-7B | Qwen2.5-1.5B | SmolLM2-1.7B | OLMo-1B | Pythia-1.4B | GPT-2 |
|---|---|---|---|---|---|---|
| **Mistral-7B-v0.3** | — | 0.538 | 0.373 | 0.150 | 0.692 | 0.371 |
| **Qwen2.5-1.5B** | 0.286 | — | 0.400 | 0.212 | 0.360 | 0.439 |
| **SmolLM2-1.7B** | 0.187 | 0.548 | — | 0.169 | 0.269 | 0.443 |
| **OLMo-1B** | 0.253 | 0.533 | 0.388 | — | 0.318 | 0.470 |
| **Pythia-1.4B** | 0.776 | 0.533 | 0.385 | 0.177 | — | 0.472 |
| **GPT-2** | 0.159 | 0.466 | 0.322 | 0.137 | 0.232 | — |

Controles: pesos aleatorios del fuente dan R² entre 0.035 y 0.176; fuente aleatorio contra cualquier destino da entre −0.005 y 0.008. La lectura correcta es por columnas: GPT-2 es predecible desde cualquier fuente, mientras que OLMo resiste a todos. La pareja más alineada es Mistral ↔ Pythia (0.692 / 0.776).

También se reporta el efecto del tamaño del modelo fuente (Qwen2.5) con PCA fijo a 768 componentes y con varianza igualada al 85 %:

| Fuente | R² a 768 comp. | R² a 85 % var. | R² con pesos aleatorios | Diferencia |
|---|---|---|---|---|
| Qwen2.5-0.5B | 0.580 | 0.512 | −0.018 | 0.530 |
| Qwen2.5-1.5B | 0.572 | 0.539 | −0.001 | 0.540 |
| Qwen2.5-3B | 0.570 | 0.554 | −0.003 | 0.558 |
| Qwen2.5-7B | 0.547 | **0.572** | −0.067 | **0.639** |

No se proporcionan benchmarks estándar tipo MMLU o HumanEval porque el repositorio no es un modelo generativo.

## Requisitos de hardware

- **Inferencia de los operadores**: los operadores son matrices de tamaño moderado (dependen de la dimensionalidad de los residual streams, típicamente 768–4096). Se pueden cargar y aplicar en CPU sin problemas; el ejemplo de uso en el README usa `torch.load` y una multiplicación de matrices.
- **Extracción de activaciones**: para usar los operadores con modelos reales (Mistral, Qwen, etc.) se necesita ejecutar los modelos fuente y destino, lo que requiere GPUs. Un modelo de 7B en FP16 necesita ~14 GB de VRAM; los modelos de 1–1.5B caben en GPUs de consumo (8–12 GB).
- **GPU recomendadas**: para reproducir los experimentos completos (con 5M de posiciones y modelos de hasta 7B), se recomienda al menos una GPU con 24 GB (RTX 3090/4090, A5000) o varias GPUs para los modelos más grandes.
- **Opciones de despliegue**: no aplica vLLM, llama.cpp u Ollama, ya que no es un modelo de generación. El uso es mediante scripts de Python con PyTorch y `huggingface_hub`.
- **Latencia y throughput**: no disponible; el coste dominante es la extracción de activaciones de los modelos transformer, no la aplicación del operador.

## Comparativa con modelos similares

No hay modelos comparables directos, ya que `bertingpt` no es un LLM sino un conjunto de herramientas de investigación. En el ámbito de la alineación de representaciones y model stitching, existen trabajos previos como:

| Trabajo | Enfoque | Diferencia con bertingpt |
|---|---|---|
| **Model stitching** (Lenc & Vedaldi, 2015; Bansal et al., 2021) | Conectar capas de redes entrenadas por separado con capas lineales | Se centra en visión y en medir la compatibilidad de representaciones; bertingpt aplica el concepto a LLMs con tokenizadores distintos y ofrece operadores universales |
| **Platonic Representation Hypothesis** (Ziyin & Chuang, 2025) | Prueba teórica de equivalencia salvo rotación en redes lineales | bertingpt es la verificación empírica en transformers reales, con resultados que matizan la teoría (la rotación no se cumple exactamente) |
| **CKA / representational similarity** (Kornblith et al., 2019) | Medidas de similitud entre representaciones | bertingpt va más allá de la similitud: construye mapeos lineales explícitos y los evalúa causalmente |

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no se puede usar para generar texto, responder preguntas ni ninguna tarea de NLP directa. Es un paquete de investigación.
- **Dominio limitado**: los operadores se ajustaron exclusivamente sobre OpenWebText. Fuera de ese dominio, el rendimiento cae drásticamente, especialmente en código (R² = 0.172 frente a 0.440 en el dominio propio).
- **La equivalencia "salvo rotación" no se cumple**: el mapeo ortogonal explica solo 0.22 de la varianza frente a 0.46 del mapeo lineal general, lo que indica que las representaciones no son simplemente rotaciones una de otra.
- **Mapeo de capas simplificado**: en la matriz de familias, los layers se emparejan por estiramiento uniforme de la profundidad, no por correspondencia óptima (CKA). Los valores de R² serían mayores con un emparejamiento más fino.
- **Idioma**: el README y los comentarios están en ruso; la documentación en inglés es escasa. Los modelos fuente son principalmente en inglés, por lo que la aplicabilidad a otros idiomas no está evaluada.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero los modelos fuente (Mistral, Qwen, etc.) tienen sus propias licencias que deben respetarse al usarlos junto con los operadores.
- **Reproducibilidad**: los scripts requieren acceso a los modelos originales y a OpenWebText; la descarga de activaciones no está incluida (se acumulan momentos en un solo paso, pero se necesitan los modelos).

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/AlexWortega/bertingpt)
- [Paper de la hipótesis platónica (arXiv:2507.01098)](https://arxiv.org/abs/2507.01098)
- [Perfil de GitHub del autor](https://github.com/AlexWortega)
- [Perfil de Hugging Face del autor](https://huggingface.co/AlexWortega)
