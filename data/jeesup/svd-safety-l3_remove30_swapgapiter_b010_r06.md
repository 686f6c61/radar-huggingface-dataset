# Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r06

## Resumen

svd-safety-l3_remove30_swapgapiter_b010_r06 es un artefacto de investigación publicado por el usuario Jeesup en Hugging Face. Se trata de un checkpoint de meta-llama/Meta-Llama-3-8B-Instruct comprimido con SVD-LLM hasta el 70,0 % de los parámetros densos (se elimina el 30,01 %) y después editado mediante 6 de las 10 rondas de un procedimiento iterativo de intercambio de parámetros neutro, con selección de componentes guiada por la regla `gap_iter` y un presupuesto de restauración del 1,000 % de los parámetros densos.

El modelo no es un asistente de propósito general. Forma parte de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. Según la propia model card, varias celdas de la cuadrícula experimental están deliberadamente degradadas en seguridad, y la finalidad del trabajo es cuantificar ese efecto y probar su recuperación.

Con 8.030.261.248 parámetros almacenados y un repositorio de 16,1 GB, el checkpoint se distribuye en safetensors bajo licencia Meta Llama 3 Community. Sus métricas declaradas son de seguridad, no de capacidades generales: ASR de 0,0100 en AdvBench, ASR de 0,0450 en StrongREJECT y sobre-rechazo macro de 0,3301 en WildGuard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3 (hiperparámetros concretos no detallados en la información disponible) |
| Parametros totales | 8.030.261.248 (inventario de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican pesos cuantizados; el repositorio (16,1 GB) es coherente con pesos de 16 bits |
| Idiomas soportados | No disponible (la model card no lo especifica) |
| Licencia | Meta Llama 3 Community License (etiqueta `llama3`) |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | meta-llama/Meta-Llama-3-8B-Instruct |
| Autor | Jeesup |
| Pipeline | text-generation |
| Fraccion de parametros resultante | 0,6999 respecto al modelo denso |
| Tamano del repositorio | 16,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3-8B-Instruct, un transformer decoder-only. Sobre ese checkpoint se aplica SVD-LLM, un método de compresión basado en descomposición en valores singulares que elimina el 30,01 % de los parámetros y deja una fracción de parámetros densos de 0,6999. Posteriormente se aplica un procedimiento de edición de parámetros: 6 rondas iterativas de intercambio neutro en parámetros, con un presupuesto de restauración de 1,000 % de los parámetros densos repartido en fragmentos de 0,100 % por ronda. Se restauran y se expulsan 6483 componentes, con un total de 41.837.568 parámetros intercambiados (0,60 % de los parámetros de proyección densos), valor de intercambio `insert` y expulsión ordenada por sigma. La semilla es 42 y el checkpoint corresponde a una ronda intermedia de una ejecución más larga (6 de 10 rondas).

La innovación del trabajo no está en el entrenamiento sino en la metodología de reparación: la regla de selección de componentes `gap_iter` decide qué piezas del modelo comprimido se sustituyen por sus equivalentes del modelo sin comprimir. Los componentes restaurados se eligen maximizando el efecto sobre la seguridad dentro de un presupuesto muy reducido de parámetros (1 %). No hay información disponible sobre el volumen de tokens de entrenamiento, la composición del dataset ni sobre el uso de RLHF o DPO en este checkpoint: la edición se realiza sobre pesos ya entrenados, sin un pipeline de ajuste adicional descrito en la model card.

## Capacidades

- Generación de texto conversacional: al derivar de Llama-3-8B-Instruct, conserva la capacidad de mantener diálogo multi-turno, aunque la model card no documenta evaluaciones de calidad conversacional para esta celda.
- Razonamiento y conocimiento general: no se publican resultados de MMLU, GSM8K ni HumanEval para este checkpoint, por lo que la capacidad efectiva tras la compresión no está cuantificada en la información disponible.
- Resistencia a ataques de jailbreak: es la capacidad medida de forma explícita, con ASR de 0,0100 en AdvBench y 0,0450 en StrongREJECT según el juez HarmBench.
- Gestión del rechazo: el sobre-rechazo macro medido con WildGuard es de 0,3301, lo que indica un equilibrio concreto entre seguridad y utilidad, no necesariamente óptimo.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Multilingüismo: no disponible; la model card no declara idiomas soportados.
- Capacidades multimodales (visión, audio) o modo de razonamiento explícito: no disponibles.

## Casos de uso

- Evaluación de robustez de seguridad bajo compresión: el checkpoint sirve como sujeto experimental para medir cómo varía el ASR (AdvBench, StrongREJECT) cuando se elimina el 30 % de los parámetros mediante SVD. Se usaría junto con un juez tipo HarmBench en un banco de pruebas de red-teaming.
- Investigación en interpretabilidad y selección de componentes: con 6483 componentes restaurados y 6483 expulsados, el checkpoint permite estudiar qué subconjuntos de parámetros concentran el comportamiento de seguridad y si la regla `gap_iter` los identifica mejor que alternativas.
- Comparación de métodos de compresión: al ser una celda de una cuadrícula sobre reglas de selección y presupuestos (fragmento de 0,100 % por ronda, presupuesto total del 1,0 %), sirve para comparar SVD-LLM frente a otras técnicas de poda o destilación bajo condiciones controladas.
- Análisis del compromiso seguridad/utilidad: el sobre-rechazo de 0,3301 permite estudiar el coste en utilidad de mantener un ASR bajo, usando WildGuard como instrumento de medida en lugar de una evaluación humana.
- Reproducibilidad de experimentos: la semilla 42, el número de ronda (6 de 10) y el presupuesto están documentados, lo que permite reproducir exactamente esta celda y verificar la variabilidad entre rondas.
- Formación y docencia en compresión de LLM: el repositorio, con 16,1 GB de pesos en safetensors y licencia Llama 3, es un ejemplo práctico y trazable de cómo se documenta la procedencia de un checkpoint editado.
- Auditoría de artefactos derivados en pipelines de CI: dado que varias celdas de la cuadrícula están degradadas en seguridad a propósito, este modelo puede integrarse como caso de prueba negativo en una batería automatizada que verifique que los filtros de despliegue detectan checkpoints no aptos para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas reportadas son de seguridad:

| Metrica | Valor | Instrumento |
|---|---|---|
| AdvBench ASR | 0,0100 | Juez HarmBench |
| StrongREJECT ASR | 0,0450 | Juez HarmBench |
| Sobre-rechazo macro | 0,3301 | WildGuard |

No se dispone de los valores equivalentes para el modelo base ni para otras celdas de la cuadrícula en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa del efecto de la compresión o de la reparación.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: alrededor de 16,1 GB solo para pesos, más la caché KV; en la práctica unos 18-20 GB con contexto moderado.
- VRAM estimada en 8 bits: aproximadamente 8,1 GB de pesos, sobre 10-12 GB con caché.
- VRAM estimada en 4 bits: aproximadamente 4,2 GB de pesos, sobre 6-8 GB con caché y contexto corto.
- GPU recomendadas para 16 bits: A100 40/80 GB, H100, L40S 48 GB, A6000 48 GB; una RTX 4090 de 24 GB puede alojarlo, pero con poco margen para contextos largos.
- Cabe en GPU de consumo: sí en 16 bits con 24 GB (RTX 3090, RTX 4090) y con mucha más holgura tras cuantizar a 8 o 4 bits, aunque no se publican pesos cuantizados y habría que generarlos.
- Opciones de despliegue: la librería declarada es `transformers` y el repositorio incluye la etiqueta `text-generation-inference`, además de ser compatible con endpoints. El despliegue con vLLM, llama.cpp u Ollama requeriría conversión previa a los formatos correspondientes (GGUF, entre otros), que no se distribuyen.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l3_remove30_swapgapiter_b010_r06 (este checkpoint) | 8.030.261.248 almacenados; fracción densa 0,6999 | No disponible | ASR 0,0100 (AdvBench) y 0,0450 (StrongREJECT); sobre-rechazo 0,3301 | Meta Llama 3 Community | Hugging Face; 0 descargas y 0 likes |
| meta-llama/Meta-Llama-3-8B-Instruct (modelo base) | 8.030.261.248 | No disponible en la información proporcionada | No disponible en la información proporcionada | Meta Llama 3 Community | Hugging Face; ampliamente utilizado |
| Otras celdas de la cuadrícula SVD-safety del mismo autor | No disponible | No disponible | No disponible | Meta Llama 3 Community | No enumeradas en la información proporcionada |

No se dispone de datos suficientes para comparar este checkpoint con alternativas de compresión equivalentes (por ejemplo, otros métodos de poda estructurada o destilación sobre Llama 3 8B) más allá del modelo base del que deriva.

## Limitaciones y advertencias

- No es un modelo desplegable: la model card lo describe explícitamente como un sujeto experimental, no como un asistente listo para producción.
- Degradación de seguridad inducida: la compresión por sí sola eleva la tasa de éxito de ataques, y parte de las celdas del estudio están deliberadamente degradadas en seguridad. Este checkpoint concreto muestra un ASR bajo en las métricas declaradas, pero el propio autor recomienda evaluarlo antes de extraer conclusiones.
- Sobre-rechazo elevado: un valor macro de 0,3301 en WildGuard implica que el modelo rechaza peticiones legítimas con frecuencia, lo que degrada su utilidad como asistente.
- Sin garantías de calidad general: no hay resultados publicados de razonamiento, matemáticas o código, por lo que no puede asumirse que conserve las capacidades de Llama-3-8B-Instruct.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a cualquier checkpoint derivado de un LLM sin evaluación específica de veracidad.
- Idiomas: no se declara ninguna lista de idiomas soportados; el comportamiento multilingüe tras la compresión y la edición es desconocido.
- Contexto: la longitud de contexto no se especifica en la model card; conviene verificarla en los ficheros de configuración antes de asumir la ventana del modelo base.
- Licencia: uso sujeto a la Meta Llama 3 Community License; los ficheros `LICENSE` y `USE_POLICY.md` están incluidos en el repositorio y son vinculantes. Debe revisarse, entre otras cláusulas, las obligaciones de atribución ("Built with Meta Llama 3") y las condiciones adicionales aplicables a productos con volúmenes de usuarios muy elevados.
- Madurez del artefacto: creado el 2026-09-18 con 0 descargas y 0 likes, sin validación por parte de la comunidad.
- Estructura interna atípica: al tratarse de un checkpoint obtenido por SVD y edición de parámetros, la conversión a otros formatos y la cuantización posterior deben validarse, y pueden no comportarse igual que en un modelo denso convencional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r06
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia del repositorio: `LICENSE` incluido en https://huggingface.co/Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r06
- Politica de uso: `USE_POLICY.md` incluido en https://huggingface.co/Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r06
- Perfil del autor: https://huggingface.co/Jeesup

La búsqueda web realizada no ha devuelto ningún enlace relevante sobre este modelo: los resultados obtenidos corresponden a páginas comerciales de Amazon.de y no guardan relación con el artefacto. No se dispone, por tanto, de enlaces adicionales a papers, blogs, repositorios o demos verificables en la información proporcionada.
