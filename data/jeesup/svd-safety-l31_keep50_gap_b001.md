# Jeesup/svd-safety-l31_keep50_gap_b001

## Resumen

svd-safety-l31_keep50_gap_b001 es un checkpoint de investigación derivado de meta-llama/Llama-3.1-8B-Instruct, comprimido con la técnica SVD-LLM hasta conservar el 50,10% de los parámetros densos y con un presupuesto del 0,100% de parámetros restaurados mediante la regla de selección `gap` (1.555 componentes singulares recuperados, semilla 42). Lo publica el usuario Jeesup en HuggingFace y no es un modelo conversacional de propósito general, sino una celda concreta de una rejilla experimental sobre reglas de selección de componentes y presupuestos de restauración.

El problema que aborda es la pérdida de comportamiento de seguridad provocada por la compresión por descomposición en valores singulares: la propia model card indica que algunas celdas de la rejilla están "deliberadamente degradadas en seguridad" respecto al modelo base, y el objetivo del estudio es cuantificar ese deterioro y probar mecanismos de recuperación. Los números publicados son contundentes: una tasa de éxito de ataque (ASR) de 0,4923 en AdvBench y 0,3898 en StrongREJECT, con una perplejidad de 2637,3782 en WikiText-2.

Es relevante ahora porque la compresión agresiva de pesos es una vía habitual para reducir costes de inferencia, y este artefacto aporta mediciones reproducibles sobre el coste en seguridad de ese atajo. Con cero descargas y cero "likes" en el momento de la consulta, debe tratarse como sujeto experimental y no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) con compresion SVD-LLM aplicada a las capas lineales |
| Parametros totales | 8.030.261.248 segun metadatos de safetensors; la model card declara una fraccion resultante de 0,5010 sobre los parametros densos (discrepancia no aclarada por el autor) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens heredados de Llama-3.1-8B-Instruct; no confirmado en la model card |
| Tipos de cuantizacion | no disponible (no se publican versiones GPTQ, AWQ ni GGUF; el repositorio solo contiene safetensors) |
| Idiomas soportados | no disponible en la model card (el modelo base declara 8 idiomas oficiales) |
| Licencia | Llama 3.1 Community License (se incluyen LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.1-8B-Instruct: un transformer decoder-only con atención por grupos (GQA), RoPE y SwiGLU. Sobre ese checkpoint se aplica compresión SVD-LLM, que descompone en valores singulares los pesos de las capas lineales y trunca el rango. En esta celda se eliminó el 49,90% de los parámetros densos y después se restauró un 0,100% adicional de componentes seleccionados con la regla `gap`, lo que suma 1.555 componentes recuperados y cero componentes sustituidos.

No hay información sobre un reentrenamiento posterior: la model card describe el artefacto como resultado de compresión y restauración de componentes, no de un pipeline con RLHF ni DPO adicional. Tampoco se documentan el número de tokens ni la composición del dataset usados en el modelo base. La innovación metodológica es precisamente el protocolo de selección de componentes singulares (`gap`) y su comparación contra otras reglas dentro de una rejilla controlada con semilla fija (42), que permite atribuir cambios de comportamiento a la regla y al presupuesto aplicados.

## Capacidades

- Generación de texto con la plantilla conversacional de Llama 3.1, ya que el checkpoint base es la variante Instruct.
- Capacidad residual de seguir instrucciones, pero severamente deteriorada: la perplejidad de 2637,3782 en WikiText-2 indica una fluidez muy degradada.
- Razonamiento y conocimiento factual muy reducidos respecto al base como consecuencia de la compresión; no hay evaluaciones publicadas de MMLU, GSM8K ni HumanEval para esta celda.
- Soporte de tool calling y function calling: heredado teóricamente del formato del base, no evaluado ni verificado en este checkpoint.
- Uso en agentes y razonamiento multi-paso: no recomendado y no evaluado.
- Capacidades multilingües: no documentadas para este artefacto.
- Interés específico como sujeto de análisis de seguridad: los valores de ASR en AdvBench y StrongREJECT y la tasa de sobre-rechazo macro medida con WildGuard están publicados y son reproducibles.
- Sin capacidades de visión ni audio (el base es exclusivamente texto).

## Casos de uso

- Investigación en interpretabilidad de la compresión: analizar qué componentes singulares de los 1.555 restaurados con la regla `gap` sostienen el comportamiento de rechazo, comparando activaciones frente al modelo sin comprimir.
- Validación de clasificadores de seguridad: usar el checkpoint como muestra con ASR conocido (0,4923 en AdvBench y 0,3898 en StrongREJECT) para comprobar si jueces automáticos como HarmBench o WildGuard detectan respuestas dañinas con la sensibilidad esperada.
- Ablación de reglas de selección: contrastar esta celda con las demás celdas de la rejilla del mismo autor (mismo presupuesto de restauración, regla distinta) para aislar el efecto de la regla `gap`.
- Estudio del impacto de la cuantización sobre modelos ya degradados: aplicar GPTQ, AWQ o conversión a GGUF por cuenta propia y medir cuánto empeora una perplejidad de partida de 2637,3782.
- Análisis de sobre-rechazo: la métrica macro de 0,1312 con WildGuard permite estudiar falsos positivos de seguridad y su relación con la pérdida de capacidad del modelo.
- Pruebas de regresión de infraestructura: al ser compatible con transformers, text-generation-inference y endpoints, sirve para validar pipelines de despliegue sin consumir un modelo de producción.
- Evaluación de técnicas de reparación: usar el checkpoint como punto de partida para probar fine-tuning ligero o DPO orientado a recuperar comportamiento seguro y medir si el daño es reversible.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,4923 |
| StrongREJECT | ASR (juez HarmBench) | 0,3898 |
| WildGuard | Sobre-rechazo macro | 0,1312 |
| WikiText-2 | Perplejidad | 2637,3782 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con el modelo base en la información disponible.

## Requisitos de hardware

- Pesos en fp16/bf16: aproximadamente 16,1 GB solo para los pesos (8,03 mil millones de parámetros a 2 bytes). El repositorio ocupa 16,1 GB.
- VRAM estimada en fp16: unos 18 GB con contexto corto, más caché KV. Con GQA de 8 cabezas KV y 32 capas, la caché ronda 128 KB por token, es decir unos 16 GB adicionales para llenar los 128.000 tokens de contexto.
- VRAM estimada en int8: aproximadamente 9-10 GB. VRAM estimada en int4: aproximadamente 5-6 GB. Son estimaciones de cálculo, no medidas publicadas.
- GPU de 24 GB: RTX 3090, RTX 4090, A10G, L4, A6000 y L40S pueden alojar el modelo en fp16 con contexto moderado. GPU de 80 GB: A100 y H100 permiten fp16 con contexto largo y mayor lote.
- Cabe en GPU de consumo: sí. En 4 bits cabría en RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB, siempre que el usuario cuantice el modelo por su cuenta.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta text-generation-inference) y vLLM; para llama.cpp u Ollama sería necesaria una conversión propia a GGUF, ya que no se publica ninguna.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | ASR AdvBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| svd-safety-l31_keep50_gap_b001 | 8,03 mil millones (50,10% denso segun el autor) | 128.000 tokens heredados | 2637,3782 | 0,4923 | Llama 3.1 Community License | Publico en HuggingFace, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct (base sin comprimir) | 8,03 mil millones | 128.000 tokens | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Llama 3.1 Community License | Publico, ampliamente desplegado |
| Otras celdas de la rejilla del mismo autor | mismo orden (segun presupuesto) | 128.000 tokens heredados | no disponible | no disponible | Llama 3.1 Community License | Publicas o no, segun el autor |

## Limitaciones y advertencias

- Modelo deliberadamente degradado en seguridad: la ASR de 0,4923 en AdvBench implica que aproximadamente la mitad de los ataques del conjunto tienen éxito. No debe exponerse a usuarios finales ni a trafico no controlado.
- Calidad de lenguaje muy deteriorada: una perplejidad de 2637,3782 en WikiText-2 hace que las respuestas sean poco fiables y propensas a incoherencias y a fallos de formato.
- Sobre-rechazo elevado: 0,1312 macro con WildGuard, lo que implica que el modelo rechaza peticiones legítimas con frecuencia, además de fallar en las dañinas.
- Riesgo de alucinación: elevado, como consecuencia directa del truncado de rango, no solo de la naturaleza generativa del modelo.
- Sesgos: no documentados para este checkpoint. Hereda los del base Llama 3.1, agravados por la pérdida de capacidad.
- Idiomas: la model card no documenta idiomas soportados; no hay evaluación multilingüe.
- Licencia: Llama 3.1 Community License junto con el archivo USE_POLICY.md incluido en el repositorio. Cualquier uso queda sujeto a ambas. Requiere atribución "Built with Llama" y conserva las cláusulas habituales de la licencia (incluida la relativa a 700 millones de usuarios mensuales).
- Reproducibilidad y validación: cero descargas y cero "likes" en el momento de la consulta. La model card recomienda evaluar el modelo por cuenta propia antes de extraer conclusiones.
- Discrepancia de datos: los metadatos de safetensors declaran 8.030.261.248 parámetros, mientras que la model card indica una fracción resultante de 0,5010. Conviene verificar qué almacena realmente el checkpoint antes de sacar conclusiones de eficiencia.
- No hay versiones cuantizadas ni GGUF publicadas, por lo que cualquier despliegue ligero exige trabajo adicional y degrada todavía más el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_keep50_gap_b001
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 y política de uso: incluidas como LICENSE y USE_POLICY.md en el propio repositorio del modelo
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante (los resultados devueltos corresponden a contenido no relacionado con el modelo)
