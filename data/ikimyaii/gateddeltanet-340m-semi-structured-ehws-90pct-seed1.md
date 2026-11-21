# ikimyaii/GatedDeltaNet-340M-semi-structured-EHWS-90pct-seed1

## Resumen

GatedDeltaNet-340M-semi-structured-EHWS-90pct-seed1 es un modelo de lenguaje de 399,5 millones de parámetros derivado de m-a-p/340M-20B-GatedDeltaNet-pure-baseline mediante poda semi-estructurada al 90 % de dispersión. Lo publica el usuario ikimyaii en Hugging Face y no se trata de un modelo entrenado desde cero, sino de un experimento de compresión: todas las capas lineales internas de los bloques conservan exactamente el 10 % de sus pesos, mientras que los embeddings y la cabeza de lenguaje permanecen densos. El resultado es un checkpoint que mantiene la topología por filas (mismo número de no-cero en cada fila de cada capa podada), lo que permite un reparto de trabajo perfectamente equilibrado en kernels dispersos.

La relevancia del artefacto es metodológica antes que de producto: documenta un pipeline de poda en dos fases (local tipo ALPS al 70 % y global con ADMM hasta el 90 %) sobre una arquitectura de atención lineal, con un coste de cómputo de 3,61 horas en una única A100 de 40 GB. Sirve como referencia reproducible para estudiar la degradación de un modelo GatedDeltaNet bajo dispersión extrema y para validar técnicas de poda semi-estructurada con destilación sobre un transformer híbrido.

No hay información sobre idiomas soportados, licencia ni pipeline de inferencia más allá de la indicada por el autor. El modelo base tiene 340M de parámetros nominales y fue entrenado con 20B tokens según su nombre; el checkpoint podado conserva 399.531.200 parámetros totales, de los cuales solo una fracción son no-cero tras la poda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GatedDeltaNet (atención lineal con compuerta delta), transformer híbrido; requiere `flash-linear-attention` |
| Parametros totales | 399.531.200 (safetensors) |
| Parametros activos | no disponible (no es MoE; dispersión semi-estructurada del 90 % en capas lineales) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 1,6 GB) |

## Arquitectura y entrenamiento

El modelo base es un GatedDeltaNet de 340M de parámetros entrenado con 20B tokens (según el identificador m-a-p/340M-20B-GatedDeltaNet-pure-baseline). GatedDeltaNet es una arquitectura de atención lineal con estado recurrente y compuerta delta, pensada como alternativa eficiente a la atención cuadrática en contextos largos; la implementación práctica depende de la librería `flash-linear-attention` (`import fla`). El checkpoint aquí descrito no reentrena el modelo: aplica poda sobre los pesos del baseline.

El procedimiento de poda se divide en dos fases. La fase 1, local y de estilo ALPS, reduce cada capa al 70 % minimizando el error de reconstrucción `||(W - W0) X||^2`, con matrices de Hessiano calculadas sobre secuencias de calibración de C4. La fase 2, global, aplica ADMM sobre la pérdida de entropía cruzada más destilación de conocimiento del modelo denso, con un paso Z basado en Diag(H), 128 rondas de 32 pasos, learning rate 0,0006, lambda constante de 0,01, Adam con beta2 0,95 y semilla 1. Los datos de entrenamiento son las 32.768 secuencias de C4 de 2.048 tokens empleadas por el código oficial de ELSA, tokenizadas con el tokenizador del modelo (`fla-hub_hgrn-1.3B-100B`) y vistas una sola vez. La ejecución completa, incluida la evaluación, consumió 3,61 horas en una A100 de 40 GB. La dispersión medida sobre los pesos finales es de 0,9003 y se verificó que las 240 capas podadas mantienen el mismo número de no-cero por fila.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base GatedDeltaNet de 340M.
- Razonamiento y conocimiento factual limitados por el tamaño del modelo (340M) y por la degradación introducida por la poda al 90 %.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos especiales (thinking, visión, audio).
- La capacidad diferencial del checkpoint es servir como artefacto de investigación en poda semi-estructurada, no como modelo de propósito general.

## Casos de uso

- Investigación en compresión de modelos: el checkpoint permite reproducir y comparar el pipeline EHWS de dos fases (ALPS local + ADMM global) sobre una arquitectura de atención lineal, usando `results.json` como registro de configuración y resultados.
- Estudio de degradación bajo dispersión extrema: sirve para medir la caída de perplejidad y de precisión zero-shot al pasar de denso a 90 % de dispersión en un GatedDeltaNet de 340M, con protocolo de evaluación ELSA ya documentado.
- Validación de kernels dispersos semi-estructurados: al garantizar el mismo número de no-cero por fila en las 240 capas podadas, es un banco de pruebas para kernels que explotan equilibrio por fila y comparan rendimiento frente a implementaciones densas.
- Docencia y experimentación académica: su tamaño (399,5M parámetros, repo de 1,6 GB) y su coste de poda (3,61 h en una A100 40 GB) lo hacen viable en laboratorios con recursos modestos para estudiar destilación y ADMM en modelos pequeños.
- Línea base para nuevas técnicas de poda: cualquier método nuevo (SparseGPT, Wanda, variantes de ADMM) puede compararse contra estas perplejidades (56,45 en WikiText-2 y 44,94 en C4) y estas precisiones zero-shot bajo el mismo protocolo.
- Análisis de equilibrio entre tareas: los resultados muestran que boolq y rte apenas se degradan (0,6076 y 0,5271 frente a 0,5985 y 0,5162 del denso) mientras arc_easy cae de 0,6023 a 0,3649, lo que permite estudiar qué tipos de tarea toleran mejor la dispersión.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA (WikiText-2 y C4, fp16), ejecución única:

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 16,42 | 19,94 |
| Este modelo (90 % semi-estructurado) | 56,45 | 44,94 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2645 | 0,1988 |
| arc_easy | 0,6023 | 0,3649 |
| boolq | 0,5985 | 0,6076 |
| hellaswag | 0,3461 | 0,2691 |
| openbookqa | 0,2300 | 0,1300 |
| rte | 0,5162 | 0,5271 |
| winogrande | 0,5036 | 0,4791 |
| Media | 0,4373 | 0,3681 |

Dispersión medida en los pesos publicados: 0,9003, con igual número de no-cero por fila en las 240 capas podadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 399,5M parámetros, en fp16 serían aproximadamente 0,8 GB de pesos y en fp32 unos 1,6 GB, a lo que hay que sumar el estado recurrente y el overhead de `flash-linear-attention`.
- GPU recomendadas: el autor reporta poda y evaluación en una A100 de 40 GB; para inferencia basta con GPUs mucho menores, aunque no se publican cifras de latencia ni throughput.
- GPU de consumo: por tamaño, cabría en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, siempre que la instalación de `flash-linear-attention` sea compatible con la GPU y la versión de CUDA.
- Opciones de despliegue: `AutoModelForCausalLM.from_pretrained(...)` con `flash-linear-attention` instalado; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, y la naturaleza dispersa de los pesos probablemente exija kernels específicos para aprovechar la compresión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Dispersión | Perplejidad WikiText-2 |
|---|---|---|---|---|---|
| Este modelo (GatedDeltaNet 340M, EHWS 90 %) | 399,5M | no disponible | no disponible | 90 % semi-estructurada | 56,45 |
| m-a-p/340M-20B-GatedDeltaNet-pure-baseline (denso) | 340M nominales | no disponible | no disponible | 0 % | 16,42 |
| Alternativas de poda equivalentes sobre el mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros checkpoints podados del mismo modelo base ni sobre modelos comparables de atención lineal de tamaño similar con los que contrastar rendimiento, licencia o disponibilidad.

## Limitaciones y advertencias

- Degradación severa: la perplejidad en WikiText-2 pasa de 16,42 a 56,45 (multiplicación por 3,4) y la media zero-shot cae de 0,4373 a 0,3681; en tareas como arc_easy y openbookqa la pérdida es muy acusada.
- Resultado de una única ejecución con semilla 1; no hay intervalos de confianza ni repeticiones que permitan evaluar la varianza del pipeline.
- Licencia no especificada: no puede asumirse uso comercial sin consultar al autor y al modelo base.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe ni de cobertura lingüística concreta.
- Riesgo de alucinación: no evaluado en la información disponible; un modelo de 340M ya es propenso a errores factuales y la poda al 90 % agrava la pérdida de conocimiento.
- Dependencia de `flash-linear-attention`: sin esa librería el checkpoint no carga con `AutoModelForCausalLM` estándar.
- Los pesos son dispersos de forma semi-estructurada; el ahorro real de memoria y cómputo solo se materializa con kernels que exploten el patrón por filas, no con frameworks densos convencionales.
- Sin datos de sesgos, seguridad ni filtrado; no apto para producción sin evaluación adicional.
- El checkpoint conserva 399,5M parámetros almacenados aunque solo el 10 % de las capas lineales sea no-cero, por lo que el tamaño en disco (1,6 GB) no refleja la compresión efectiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-340M-semi-structured-EHWS-90pct-seed1
- Modelo base: https://huggingface.co/m-a-p/340M-20B-GatedDeltaNet-pure-baseline
- Librería flash-linear-attention: no disponible en la información proporcionada (requerida para cargar el modelo)
- Paper o blog del método EHWS: no disponible
- Repositorio del código de poda: no disponible
- Demo: no disponible
