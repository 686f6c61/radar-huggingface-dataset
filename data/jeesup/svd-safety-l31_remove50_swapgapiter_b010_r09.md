# Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r09

## Resumen

`Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r09` es un checkpoint de investigación derivado de `meta-llama/Llama-3.1-8B-Instruct`, no un modelo conversacional de propósito general. Sobre el modelo base se aplicó una compresión SVD-LLM que elimina el 50,03 % de los parámetros densos (fracción de parámetros resultante declarada: 0,4997) y, a continuación, un proceso de edición iterativa de pesos denominado *swap* neutro en parámetros, guiado por la regla de selección `gap_iter`. El resultado publicado corresponde a 9 de las 10 rondas del ciclo iterativo, con un presupuesto total de restauración del 1,000 % de los parámetros densos (0,100 % por ronda).

El artefacto forma parte de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. Cada celda del grid (regla de selección × presupuesto) es un sujeto experimental: según advierte el propio autor, varias ramas del grid están deliberadamente degradadas en seguridad respecto al modelo base, y el objetivo del trabajo es cuantificar esa degradación y probar su recuperación.

Se trata, por tanto, de un modelo relevante únicamente en el contexto de la investigación en compresión de LLM, seguridad e interpretabilidad. No incluye datos de entrenamiento adicionales, no publica resultados de capacidades generales (MMLU, GSM8K ni similares) y no debería desplegarse como asistente. El repositorio ocupa 16,1 GB en formato safetensors y declaraba 0 descargas y 0 *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Llama 3.1 8B Instruct; atención con GQA y RoPE según el modelo base) |
| Parametros totales | 8.030.261.248 (recuento real de safetensors); el autor declara una fracción de parámetros resultante de 0,4997 tras eliminar el 50,03 % de los parámetros densos |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (característica del modelo base Llama 3.1 8B Instruct; no se declara de forma explícita en esta model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no declarados en la model card; el modelo base Llama 3.1 8B Instruct admite oficialmente ocho idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3.1 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |

Metadatos adicionales de procedencia declarados por el autor:

| Campo | Valor |
|---|---|
| Modelo base sin comprimir | `meta-llama/Llama-3.1-8B-Instruct` |
| Compresión | SVD-LLM, 50,03 % de parámetros eliminados |
| Regla de selección | `gap_iter` |
| Presupuesto de restauración | 1,000 % de los parámetros densos |
| Componentes restaurados | 9.578 |
| Componentes sustituidos | 9.578 |
| Porcentaje de parámetros resultante | 0,4997 |
| Semilla | 42 |
| Rondas iterativas aplicadas | 9 de 10 |
| Tamaño de bloque por ronda | 0,100 % de los parámetros densos |
| Parámetros insertados | 59.403.264 (0,85 % de los parámetros de proyección densos) |
| Valor de swap | `insert` (solo valor de inserción; desalojo ordenado por sigma) |
| Checkpoint | ronda intermedia de una ejecución más larga |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso, con atención agrupada (GQA) y codificación posicional rotatoria (RoPE), además de la tokenización y el chat template propios de la familia Llama 3.1. El artefacto no introduce cambios estructurales ni añade capas: la intervención es puramente post-hoc sobre los pesos.

El proceso de construcción tiene dos etapas. Primero se aplica SVD-LLM, un método de compresión que descompone en valores singulares las matrices de proyección y trunca componentes de bajo rango, eliminando en este caso el 50,03 % de los parámetros densos. Después se ejecuta un *swap* iterativo "neutro en parámetros": en cada ronda se seleccionan componentes con la regla `gap_iter` y se reinsertan pesos (operación `insert`, con desalojo ordenado por valor sigma) hasta un máximo del 0,100 % de los parámetros densos por ronda, con un presupuesto total del 1,000 %. El checkpoint publicado corresponde a la ronda 9 de 10 y registra 9.578 componentes restaurados y 9.578 sustituidos, con 59.403.264 parámetros insertados (0,85 % de los parámetros de proyección densos) y semilla 42.

No se documenta ningún entrenamiento adicional, ajuste fino, RLHF ni DPO en este artefacto: el alineamiento por instrucciones proviene íntegramente del modelo base, y el estudio mide cuánto de ese comportamiento sobrevive a la compresión y a la reparación posterior.

## Capacidades

- Generación de texto conversacional: hereda el formato de chat y la plantilla de Llama 3.1 8B Instruct, por lo que puede producir respuestas multi-turno en el estilo del modelo base, con la degradación esperable tras eliminar la mitad de los parámetros de proyección.
- Comportamiento de seguridad medido: el autor reporta una tasa de éxito de ataque (ASR) de 0,0000 en AdvBench y de 0,0050 en StrongREJECT, ambas evaluadas con el juez HarmBench.
- Sobre-rechazo cuantificado: 0,7462 de sobre-rechazo macro medido con WildGuard, un valor muy alto que indica que el modelo rechaza una fracción elevada de peticiones benignas.
- Uso como sujeto experimental: sirve para estudiar el compromiso entre seguridad y utilidad bajo compresión, y para comparar reglas de selección de componentes dentro del grid del estudio.
- Capacidades generales de razonamiento, código, matemáticas, tool calling, agentes o multilingüismo: no documentadas ni evaluadas en la información disponible.
- Capacidades multimodales o de audio: no aplica; el modelo base es exclusivamente de texto.
- Modo de razonamiento explícito (*thinking*): no disponible.

## Casos de uso

- Investigación en compresión de LLM: reproducir la celda `gap_iter` con presupuesto del 1,000 % y compararla con las demás celdas del grid para aislar el efecto de la regla de selección sobre la retención de capacidades y de seguridad.
- Auditoría de seguridad bajo compresión: usar AdvBench, StrongREJECT y HarmBench para medir la variación de la tasa de éxito de ataque entre el modelo base, el modelo comprimido sin reparar y este checkpoint reparado parcialmente.
- Análisis del sobre-rechazo: emplear WildGuard para cuantificar el coste en utilidad (0,7462 de sobre-rechazo macro) que acompaña a la reparación de seguridad, y compararlo con las ramas de mayor presupuesto del estudio.
- Estudio de interpretabilidad de subespacios SVD: analizar qué direcciones singulares se truncan y en qué capas, y correlacionar los componentes restaurados (9.578 entradas y 9.578 salidas) con cambios medibles en el comportamiento.
- Baseline para métodos alternativos de reparación de seguridad: comparar esta estrategia de *swap* neutro en parámetros frente a ajuste fino con datos de seguridad, DPO o des-ablación, usando el mismo conjunto de evaluaciones.
- Validación de harness de evaluación: como checkpoint con métricas conocidas y reproducibles (semilla 42), sirve para verificar que un pipeline de evaluación de seguridad en CI/CD produce los valores esperados antes de aplicarlo a modelos candidatos.
- Docencia y divulgación técnica: ilustrar con un caso real y medible cómo una técnica de compresión agresiva altera los comportamientos de alineamiento de un modelo instruct.
- Pruebas de infraestructura de despliegue: medir consumo de VRAM, tiempo de carga y throughput de un checkpoint de ~8.000 millones de parámetros en FP16 con vLLM o TGI, sin exponerlo a usuarios finales.

## Benchmarks y rendimiento

| Metrica | Valor | Juez / metodo |
|---|---|---|
| AdvBench ASR | 0,0000 | HarmBench judge |
| StrongREJECT ASR | 0,0050 | HarmBench judge |
| Macro over-refusal | 0,7462 | WildGuard |

No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni se proporcionan los valores equivalentes del modelo base sin comprimir que permitan calcular la delta de degradación dentro de esta misma ficha.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 16 GB solo para pesos (tamaño del repositorio: 16,1 GB), más overhead de activaciones y caché KV; con contexto largo la demanda crece de forma notable, por lo que conviene reservar 24 GB o más.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 5-6 GB de pesos, aunque requeriría convertir los pesos, ya que el repositorio no publica variantes cuantizadas.
- GPU recomendadas para producción o evaluación a gran escala: A100 (40/80 GB), H100 (80 GB), L40S (48 GB) o H200.
- GPU de gama alta de consumo: RTX 3090 o RTX 4090 (24 GB) pueden alojar los pesos en BF16, con margen reducido y limitaciones de longitud de contexto; varias GPU de 24 GB permiten reparto por tensor parallelism.
- GPU de consumo con 12 GB o menos: viables solo con cuantización de 4 bits (por ejemplo RTX 3060 12 GB, RTX 4070); no hay GGUF publicado, por lo que habría que generarlo a partir de los safetensors.
- Opciones de despliegue: `transformers` (librería declarada), vLLM y TGI (el repositorio está marcado como compatible con text-generation-inference y endpoints), llama.cpp u Ollama previa conversión a GGUF; también es posible el uso con adaptadores de cuantización de bitsandbytes en transformers.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Datos de seguridad publicados | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r09` | 8,03 B declarados (fracción 0,4997 sobre parámetros densos) | 128.000 tokens (heredado del base) | Llama 3.1 Community License | AdvBench ASR 0,0000; StrongREJECT ASR 0,0050; sobre-rechazo macro 0,7462 | HuggingFace, 0 descargas |
| `meta-llama/Llama-3.1-8B-Instruct` (modelo base) | 8,03 B | 128.000 tokens | Llama 3.1 Community License | no disponible en esta informacion | HuggingFace, ampliamente utilizado |
| `meta-llama/Llama-3.1-8B` (base preentrenado) | 8,03 B | 128.000 tokens | Llama 3.1 Community License | no aplica (sin alineamiento por instrucciones) | HuggingFace |
| `mistralai/Mistral-7B-Instruct-v0.3` | 7,3 B | 32.000 tokens | Apache 2.0 | no disponible en esta informacion | HuggingFace |

El modelo base es la referencia obligada, pero la información disponible no incluye sus métricas de ASR ni de sobre-rechazo, de modo que no es posible calcular la degradación neta atribuible a la compresión y a la reparación. No se dispone de datos de otras celdas del mismo grid ni de checkpoints comparables de compresión con reparación de seguridad.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica explícitamente que no es un modelo conversacional de propósito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Degradación deliberada en seguridad: varias ramas del grid están intencionadamente degradadas respecto a Llama 3.1 8B Instruct; la compresión por sí sola eleva la tasa de éxito de ataque.
- Sobre-rechazo muy elevado: 0,7462 de sobre-rechazo macro medido con WildGuard, lo que implica rechazos frecuentes de peticiones legítimas y una utilidad conversacional seriamente comprometida.
- Riesgo de alucinación: no evaluado en la información disponible; la eliminación del 50,03 % de los parámetros densos es un factor plausible de degradación de la factualidad, pero no hay mediciones publicadas.
- Cobertura de evaluación limitada: las métricas de seguridad se reducen a tres conjuntos (AdvBench, StrongREJECT y WildGuard) evaluados con un único juez (HarmBench); no hay MMLU, GSM8K, HumanEval ni evaluaciones de robustez fuera de distribución.
- Idiomas no declarados: la model card no especifica idiomas soportados y las evaluaciones publicadas están en inglés; el comportamiento multilingüe tras la compresión es desconocido.
- Contexto no verificado tras la compresión: aunque el modelo base admite 128.000 tokens, no se documenta si la ventana efectiva se mantiene tras el truncado SVD y el swap.
- Sin cuantizaciones publicadas: solo hay safetensors, lo que obliga a convertir a GGUF o a cuantizar en el momento de carga para entornos con poca VRAM.
- Restricciones de licencia: Llama 3.1 Community License con política de uso aceptable adjunta; incluye cláusulas de atribución ("Built with Llama") y límites para usos comerciales a gran escala, además de obligaciones de cumplimiento de la política de uso.
- Checkpoint intermedio: corresponde a la ronda 9 de 10, por lo que no refleja el resultado final del presupuesto completo de 1,000 % declarado para la ejecución completa.
- Discrepancia numérica a tener en cuenta: el recuento real de safetensors (8.030.261.248 parámetros) coincide con el del modelo base sin comprimir, mientras el autor declara una fracción de parámetros resultante de 0,4997 sobre proyecciones densas; conviene verificar la estructura real de los pesos antes de asumir reducciones de memoria.
- Madurez nula: 0 descargas y 0 *likes* en el momento de la consulta, sin validación externa ni reproducibilidad comprobada por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove50_swapgapiter_b010_r09
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper de SVD-LLM: no disponible en la informacion proporcionada
- Repositorio de codigo del metodo: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible
- La busqueda web realizada no devolvio resultados relevantes para este modelo: los enlaces recuperados corresponden a bases de datos juridicas eslovenas (sodnapraksa.si, tax-fin-lex.si, sodisce.si, pisrs.si), sin relacion con el artefacto descrito.
