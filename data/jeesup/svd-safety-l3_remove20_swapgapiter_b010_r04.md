# Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r04

## Resumen

`Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r04` es un punto de control derivado de `meta-llama/Meta-Llama-3-8B-Instruct`. Sobre el modelo base se aplica una compresión SVD-LLM que elimina el 20,02 % de los parámetros (fracción resultante declarada de 0,7998) y, a continuación, un proceso de edición iterativa de parámetros neutros guiado por la regla de selección `gap_iter`, con un presupuesto de restauración del 1,000 % de los parámetros densos. El checkpoint publicado corresponde a la ronda 4 de 10, con un fragmento por ronda del 0,100 % de los parámetros densos.

El modelo lo publica el usuario Jeesup como artefacto de investigación y no como asistente desplegable. Su propósito es medir cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. Cada checkpoint forma una celda de una cuadrícula que cruza reglas de selección y presupuestos de restauración, con semilla fija 42.

Técnicamente mantiene la arquitectura del modelo base (transformer decoder-only tipo Llama 3), con 8.030.261.248 parámetros reales según safetensors y un repositorio de 16,1 GB. Las únicas métricas publicadas son de seguridad y sobre-rechazo: ASR de 0,0300 en AdvBench y StrongREJECT (juez HarmBench) y un sobre-rechazo macro de 0,2300 medido con WildGuard.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada de Meta-Llama-3-8B-Instruct (etiquetada como `llama` / `llama3`); ver nota sobre la discrepancia en parámetros |
| Parámetros totales | 8.030.261.248 (dato real del repo, safetensors); fracción de parámetros resultante declarada: 0,7998 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; heredada del modelo base Meta-Llama-3-8B-Instruct |
| Tipos de cuantización | no disponible; el repositorio solo distribuye safetensors (16,1 GB, coherente con pesos de aproximadamente 2 bytes por parámetro). No se publican variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Meta Llama 3 Community License); el repositorio incluye `LICENSE` y `USE_POLICY.md` |
| Formato de pesos | safetensors (librería `transformers`) |
| Parámetros eliminados por compresión | 20,02 % de los parámetros densos (SVD-LLM) |
| Regla de selección | `gap_iter` |
| Presupuesto de restauración | 1,000 % de los parámetros densos (0,100 % por ronda) |
| Semilla | 42 |

## Arquitectura y entrenamiento

La model card no describe un entrenamiento desde cero, sino una cadena de dos transformaciones sobre `meta-llama/Meta-Llama-3-8B-Instruct`. La primera es una compresión SVD-LLM que trunca valores singulares y elimina el 20,02 % de los parámetros, dejando una fracción declarada de 0,7998. La segunda es una edición de parámetros por sustitución neutra iterativa: en cada ronda se restauran y se sustituyen 4328 componentes, con un valor de intercambio `insert` (solo valor de inserción) y desalojo ordenado por sigma. Se han aplicado 4 rondas de las 10 previstas, inyectando 27.891.712 parámetros (0,40 % de los parámetros de proyección densos). No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO adicionales.

Tabla de procedencia declarada por el autor:

| Campo | Valor |
|---|---|
| Base sin comprimir | `meta-llama/Meta-Llama-3-8B-Instruct` |
| Compresión | SVD-LLM, 20,02 % de parámetros eliminados |
| Regla de selección | `gap_iter` |
| Presupuesto de restauración | 1,000 % de parámetros densos |
| Componentes restaurados | 4328 |
| Componentes sustituidos | 4328 |
| Fracción de parámetros resultante | 0,7998 |
| Semilla | 42 |
| Rondas iterativas aplicadas | 4 de 10 |
| Fragmento por ronda | 0,100 % de parámetros densos |
| Parámetros insertados | 27.891.712 (0,40 % de los parámetros de proyección densos) |
| Valor de intercambio | `insert` (solo valor de inserción; desalojo ordenado por sigma) |
| Checkpoint | ronda intermedia de una ejecución más larga |

Nota de verificación: el recuento de parámetros de los safetensors (8.030.261.248) coincide con el del modelo denso de 8B, mientras que la model card declara una fracción resultante de 0,7998. La información proporcionada no explica cómo se materializa esa reducción en el checkpoint distribuido, por lo que conviene inspeccionar los tensores antes de asumir un ahorro real de memoria.

## Capacidades

- Generación de texto conversacional: conserva la interfaz de chat del modelo base (`text-generation` en `transformers`).
- Razonamiento e instrucciones generales: capacidades heredadas de Llama-3-8B-Instruct, no reevaluadas en la información disponible.
- Resistencia a ataques adversariales medida: ASR de 0,0300 con juez HarmBench en AdvBench y StrongREJECT.
- Control de rechazos: sobre-rechazo macro de 0,2300 medido con WildGuard, es decir, aproximadamente un 23 % de rechazos ante peticiones benignas en ese conjunto.
- Soporte de tool calling / function calling: no disponible (no se documenta ni se evalúa).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (visión, audio, modo thinking): no disponibles; el modelo es exclusivamente de texto.
- No incorpora mejoras de eficiencia adicionales documentadas (no hay decodificación especulativa ni atención lineal declaradas).

## Casos de uso

- Investigación sobre compresión y seguridad: el checkpoint sirve como sujeto experimental para cuantificar cuánto degrada la compresión SVD-LLM la resistencia a jailbreaks; se compara su ASR de 0,0300 en AdvBench y StrongREJECT contra el del modelo base y contra otras celdas de la cuadrícula.
- Reproducción de experimentos: la semilla 42, el presupuesto del 1,000 %, el fragmento por ronda del 0,100 % y los recuentos de componentes (4328 restaurados y 4328 sustituidos) permiten replicar la ronda 4 de 10 en estudios posteriores.
- Estudio de la dinámica iterativa de reparación: al ser un checkpoint intermedio, permite comparar el estado a 4 rondas con el de otras rondas del mismo recorrido para analizar cómo evolucionan las métricas de seguridad ronda a ronda.
- Comparación de reglas de selección de componentes: la regla `gap_iter` puede contrastarse con las demás reglas del grid manteniendo constante el presupuesto, para aislar el efecto de la heurística de selección.
- Auditoría de robustez ante jailbreaks: uso del modelo como objetivo (target) en pipelines de red-teaming que emplean AdvBench, StrongREJECT o jueces automáticos tipo HarmBench.
- Medición de sobre-rechazo: con WildGuard se puede caracterizar el coste en utilidad de la edición de seguridad, partiendo del 0,2300 de sobre-rechazo macro reportado.
- Línea base para técnicas de reparación: sirve como punto de partida para evaluar métodos alternativos de restauración de seguridad post-compresión (por ejemplo, cambios en el presupuesto o en el criterio de desalojo).
- Análisis de interpretabilidad: los 4328 componentes sustituidos y su orden de desalojo por sigma ofrecen un conjunto acotado de direcciones sobre las que estudiar la relación entre componentes de proyección y comportamiento de rechazo.

En ningún caso se recomienda su uso como asistente conversacional en producción.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0300 |
| StrongREJECT | ASR (juez HarmBench) | 0,0300 |
| WildGuard | Sobre-rechazo macro | 0,2300 |

No se han publicado en la información disponible resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K, MT-Bench u otros), ni comparaciones numéricas frente al modelo base. Tampoco se publican medidas de latencia o throughput.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (8.030.261.248); el autor no publica requisitos para este checkpoint:

- Pesos en bf16/fp16: aproximadamente 16,1 GB solo de pesos (coincide con los 16,1 GB del repositorio), más caché KV y activaciones según la longitud de contexto.
- Cuantización a 8 bits: aproximadamente 8,1 GB de pesos.
- Cuantización a 4 bits (GPTQ, AWQ o GGUF Q4): aproximadamente 4,5-5,5 GB de pesos.
- GPU de centro de datos: A100 (40 GB y 80 GB), H100, L40S. Suficientes para bf16 sin cuantizar.
- GPU de consumo de 24 GB: RTX 4090 y RTX 3090 permiten bf16 con contexto corto; con contextos largos conviene reducir precisión.
- GPU de consumo de 16 GB: RTX 4080 y similares requieren cuantización a 8 o 4 bits.
- GPU de consumo de 12 GB: RTX 3060 y equivalentes viables únicamente en 4 bits.
- Despliegue: `transformers` de forma nativa; el repositorio está etiquetado con `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con TGI y con endpoints de Hugging Face. vLLM debería aceptarlo por arquitectura Llama 3, aunque no se documenta. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no se distribuye.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este checkpoint y la cifra variaría con la cuantización, el runtime y el hardware.
- Gestión de memoria: no se documenta soporte de cuantización en carga (bitsandbytes), atención con kernels flash ni otras optimizaciones específicas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r04` | 8.030.261.248 en safetensors; fracción declarada 0,7998 | no disponible en la información | Meta Llama 3 Community License | Solo safetensors en HF; 0 descargas y 0 likes | AdvBench ASR 0,0300; StrongREJECT ASR 0,0300; sobre-rechazo macro 0,2300 |
| `meta-llama/Meta-Llama-3-8B-Instruct` (base) | Aproximadamente 8,03 B | no disponible en la información proporcionada | Meta Llama 3 Community License | Pesos oficiales en HF | no disponible en la información proporcionada |
| `meta-llama/Llama-3.1-8B-Instruct` | Aproximadamente 8,03 B | no disponible en la información proporcionada | Meta Llama 3.1 Community License | Pesos oficiales en HF | no disponible en la información proporcionada |

No se han identificado en la información proporcionada otros checkpoints de la misma familia de estudio (compresión SVD más edición de seguridad) con los que establecer una comparación cuantitativa directa. Los resultados de seguridad de este checkpoint no son comparables de forma limpia con los del modelo base porque no se aportan las métricas equivalentes de este último.

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card indica que no es un modelo de chat de propósito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Seguridad degradada de forma deliberada en varias celdas del estudio: la compresión por sí sola eleva la tasa de éxito de ataques, y el objetivo del trabajo es cuantificar esa pérdida y probar su recuperación. La ronda 4 de 10 es un estado intermedio, con solo el 0,40 % de los parámetros de proyección sustituidos.
- Alucinación: no se han publicado evaluaciones de veracidad ni de tasas de alucinación para este checkpoint; se desconoce el efecto de la compresión sobre esa dimensión.
- Riesgo de sobre-rechazo elevado: el 0,2300 de sobre-rechazo macro con WildGuard implica rechazos frecuentes ante peticiones legítimas, lo que limita su utilidad conversacional directa.
- Sesgos: no se documentan análisis de sesgo, toxicidad ni evaluación por subgrupos.
- Cobertura de idiomas desconocida: no se declara ningún idioma soportado; se asume el comportamiento del modelo base, sin verificación.
- Contexto no verificado: no se especifica la longitud de contexto efectiva tras la compresión, y la reducción de rango en las matrices de proyección podría afectar al comportamiento en contextos largos.
- Discrepancia de parámetros: la fracción declarada (0,7998) no se refleja en el recuento de safetensors (8.030.261.248). Conviene validar el checkpoint antes de estimar ahorros de memoria.
- Licencia: uso comercial sujeto a la Meta Llama 3 Community License y a `USE_POLICY.md`; es obligatorio conservar la atribución "Built with Meta Llama 3" y cumplir la política de uso aceptable de Meta.
- Validación externa nula: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes publicadas.
- Ausencia de cuantizaciones listas para usar: no hay GGUF, GPTQ ni AWQ, lo que obliga a convertir el modelo para despliegues en CPU o en GPUs pequeñas.
- No se documentan datos de entrenamiento, composición del dataset ni proceso de alineación adicional, lo que impide auditar el origen de determinados comportamientos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_remove20_swapgapiter_b010_r04
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia y política de uso: `LICENSE` y `USE_POLICY.md` incluidos en el propio repositorio del checkpoint
- Papers, blogs, repositorios o demos adicionales: no disponible. Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo (únicamente páginas de soporte de Microsoft), y la model card no incluye referencias bibliográficas ni enlaces al paper del método SVD-LLM ni al estudio de reglas de selección.
