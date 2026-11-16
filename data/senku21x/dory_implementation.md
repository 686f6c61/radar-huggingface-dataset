# senku21x/dory_implementation

## Resumen

Dory implementation es un repositorio de código e instrumentación de interpretabilidad construido sobre el modelo Dory1.0-4B de NVIDIA, un modelo de lenguaje con arquitectura "looped" (recurrente en profundidad). No es un modelo entrenado desde cero ni un fine-tune con propósito generativo, sino una implementación en PyTorch puro del forward pass del checkpoint oficial de NVIDIA, con ganchos (hooks) en cada subcapa y en cada frontera de bucle, junto con una batería de lentes de Jacobiano (J-lens) ajustadas sobre él para leer estados internos.

El interés técnico reside en que expone y verifica el funcionamiento interno de un transformer con pesos compartidos entre bucles: 72 subcapas contadas por el checkpoint, de las cuales 16 forman el bloque de entrada, 40 el bloque recurrente (ejecutado N veces con pesos compartidos) y 16 el bloque de salida. Cada estado residual se normaliza a norma unitaria, lo que convierte al modelo en un caso de estudio poco habitual para análisis de representaciones.

El repositorio incluye lentes J simples para 1, 2, 3 y 4 bucles, lentes R y J++ para 1 y 2 bucles, registros de ajuste con métricas de ruido por nodo y scripts de evaluación de lectura. Su estado declarado por el autor es "primeros ajustes, exploratorio", con verificación del estimador frente a diferencias finitas centrales pero sin validación externa ni benchmarks de tarea publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloques recurrentes en profundidad (looped), 72 subcapas contadas por checkpoint: 16 de entrada, 40 recurrentes con pesos compartidos, 16 de salida |
| Parametros totales | 4B (según el nombre del modelo base, NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio usa float32 con multiplicaciones TF32; el checkpoint base es BF16) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base NVIDIA; consultar términos de NVIDIA) |
| Formato de pesos | safetensors (lentes), checkpoint original del modelo base en BF16; torch pickle para router y pesos J++ |

## Arquitectura y entrenamiento

El modelo base es un transformer con recurrencia en profundidad: el bloque de entrada se ejecuta una vez, el bloque recurrente se repite N veces compartiendo pesos y el bloque de salida se ejecuta una vez. Con `x` como salida del bloque de entrada y `N` la norma L2, cada bucle calcula `u_t = N(s_{t-1} + x)` y `s_t = N(F(u_t))` partiendo de `s_0 = x`, de modo que todos los estados son vectores unitarios. El checkpoint expone 72 subcapas alternando atención y MLP. Este repositorio no entrena el modelo: carga los 507 tensores del checkpoint oficial y reproduce el forward pass en PyTorch puro, permitiendo cualquier número de bucles.

La parte de interpretabilidad se construye ajustando un lente de Jacobiano según el estimador de Gurnee et al. 2026: para cada nodo fuente se calcula el Jacobiano del estado final respecto al estado del nodo, sumado sobre posiciones objetivo en o después de la posición fuente, promediado sobre posiciones y sobre prompts. Se usan 50 prompts formados por los primeros 128 tokens de 50 párrafos de WikiText-103 (split de validación, semilla 0), sin token BOS, excluyendo las primeras 16 posiciones del promedio. El ajuste usa pesos float32 con multiplicaciones TF32 y tarda 39 segundos por prompt a 2 bucles en una H200. Cada fichero de lente almacena además el estado medio de cada nodo (`lens.mean_state`) para experimentos de centrado. Las matrices son de 2560 x 2560 en float32, con tamaños de 1,9 a 5,1 GB según el número de bucles.

## Capacidades

- Forward pass completo del modelo Dory1.0-4B en PyTorch puro, con número de bucles configurable (verificado con texto codicioso coherente a 1, 2, 4 y 8 bucles).
- Exposición de cada estado residual mediante callback `tap(name, h)`, con nombres de nodo para embedding, subcapas de entrada, entradas y salidas de bucle, subcapas recurrentes y subcapas de salida.
- Lectura de estados internos mediante lentes de Jacobiano (J-lens) para 1 a 4 bucles, con proyección `unembed(l2norm(J @ h))` sobre el estado del nodo.
- Lentes R y J++ para 1 y 2 bucles, con router de activación y pesos de expertos incluidos; J++ es el modo por defecto según el autor.
- Lente logit como línea base para comparación de lecturas.
- Reglas de retropropagación LRP disponibles mediante el contexto `with lrp_rules(): ...` en `dory/model.py`.
- Carga de tokenizador propia (`load_tokenizer`), ya que `AutoTokenizer` de transformers falla al no existir clase de configuración `dory`.
- Verificación del estimador de Jacobiano: coincidencia con diferencias finitas centrales en 10 nodos y tres rangos de posición (coseno ≥ 0,9998, ratio de norma dentro del 1 %); TF32 frente a float32 exacto con coseno ≥ 0,9999 y error relativo ≤ 1,4 %.
- No incluye generación de texto de alto nivel, tool calling, agentes, visión ni audio: es infraestructura de análisis, no un asistente.

## Casos de uso

- Análisis de representaciones en modelos recurrentes en profundidad: el repositorio permite leer el estado en cada subcapa y en cada frontera de bucle, lo que sirve para estudiar cómo evoluciona la información a medida que se repiten los bloques con pesos compartidos.
- Investigación en interpretabilidad mecanicista: las lentes J, R y J++ permiten comparar qué conceptos son verbalizables en cada nodo y contrastar hipótesis sobre el espacio de trabajo global (global workspace) en un modelo de 4B.
- Validación de estimadores de Jacobiano: los tests incluidos (diferencias finitas, comparación TF32/float32) sirven como referencia reproducible para quien implemente lentes similares sobre otros modelos.
- Estudio de estabilidad de lecturas por número de bucle: al haber lentes ajustadas para 1, 2, 3 y 4 bucles, se puede medir cómo cambia la legibilidad de los estados con la profundidad efectiva del cómputo.
- Docencia y formación técnica: el código en PyTorch puro, sin dependencias de frameworks de inferencia, es un material didáctico para explicar atención, normalización L2 y recurrencia en profundidad con un modelo real.
- Reproducción de experimentos de terceros: los registros `fit_records/<run>/` con `metrics.json`, `readouts.txt`, `prompts.json` y `run.json` permiten auditar el ajuste y repetirlo con los mismos prompts y semilla.
- Diagnóstico de coherencia del forward pass: la comprobación de que el bloque de salida aplicado a un estado de fin de bucle reproduce exactamente la ejecución con ese número de bucles sirve para depurar implementaciones alternativas del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos reportados son de verificación interna:

| Prueba | Resultado |
|---|---|
| Coseno autograd frente a diferencias finitas centrales (10 nodos, 3 rangos de posición) | ≥ 0,9998 |
| Ratio de norma autograd frente a diferencias finitas | dentro del 1 % |
| Coseno TF32 frente a float32 exacto | ≥ 0,9999 |
| Error relativo TF32 frente a float32 exacto | ≤ 1,4 % |
| Pérdida en prosa ordinaria | ~2,0 nats por token |
| Pérdida con tokens barajados | ~7,8 nats por token |
| Tensores del checkpoint cargados | 507 de 507 |
| Tiempo de ajuste por prompt (2 bucles, una H200) | 39 segundos |

## Requisitos de hardware

- Inferencia del modelo base en BF16: el checkpoint es de 4B parámetros, por lo que se estima un uso de VRAM de aproximadamente 8-9 GB en BF16 (estimación a partir del tamaño de parámetros, no confirmada en la información disponible).
- El repositorio ejecuta el forward pass en float32 con TF32 por defecto; en ese caso el uso de VRAM se duplica aproximadamente respecto a BF16.
- Ajuste de lentes: 39 segundos por prompt a 2 bucles en una NVIDIA H200; el ajuste completo usa 50 prompts y requiere una pasada backward por cada una de las 2.560 dimensiones de salida por prompt (procesadas por lotes).
- Almacenamiento: el repositorio ocupa 34,3 GB, dominado por los ficheros de lentes (J simple de 1,9 a 5,1 GB por bucle; R y J++ de 1,9 y 3,0 GB).
- GPU consumer: no hay datos publicados sobre ejecución en RTX 4090 u otras GPU de consumo; el forward pass en float32 de un modelo de 4B debería caber en GPUs con 16-24 GB de VRAM, pero no está verificado en la información disponible.
- Opciones de despliegue: no se documenta integración con vLLM, llama.cpp, Ollama ni TGI. El código es PyTorch puro y requiere cargar el checkpoint manualmente con `Dory.from_snapshot`.
- Latencia y throughput de generación: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento del modelo base Dory1.0-4B frente a alternativas, ni de otras implementaciones de lentes de Jacobiano, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Estado declarado por el autor: "primeros ajustes, exploratorio". Las lecturas de las lentes no deben tomarse como resultados consolidados.
- El ajuste de las lentes usa solo 50 prompts de WikiText-103 con 128 tokens cada uno y excluye las primeras 16 posiciones; la cobertura lingüística y de dominios es muy limitada y no se especifican los idiomas soportados.
- Cada lente está ajustada para un número concreto de bucles; usar el modelo con un `n_loops` distinto al `lens.k` invalida la lectura.
- El estimador de Jacobiano requiere una pasada backward por dimensión de salida (2.560 por prompt), lo que hace el ajuste costoso en cómputo y memoria.
- El componente `dory/chain.py` (chain-lens) no funcionó según el autor y se conserva solo como registro; no debe usarse.
- `AutoTokenizer` de transformers falla con este modelo al no existir clase de configuración `dory`; es necesario usar `load_tokenizer` del repositorio.
- Los scripts en `as_run/` tienen rutas de importación del proyecto de ajuste original, no de este repositorio, por lo que no se ejecutan tal cual.
- Licencia "other" heredada del modelo base NVIDIA: es imprescindible revisar los términos de NVIDIA antes de cualquier uso, incluido el comercial, que no está garantizado por la información disponible.
- No se documentan sesgos del modelo base ni tasas de alucinación; al ser una herramienta de análisis y no un asistente, estos riesgos afectan al modelo subyacente, no a la ficha.
- El repositorio no ofrece API de generación de alto nivel ni soporte de tool calling, agentes o multimodalidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/senku21x/dory_implementation
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Copia del código sin ficheros de lentes: `conditional-model-diffing/dory_implementation` (referenciada en la model card, sin URL directa en la información disponible)
- Paper del modelo Dory: arXiv 2611.03998 (referenciado en la model card)
- Paper del estimador de lentes: Gurnee et al. 2026, "Verbalizable Representations Form a Global Workspace in Language Models" (referenciado en la model card, sin URL directa en la información disponible)
