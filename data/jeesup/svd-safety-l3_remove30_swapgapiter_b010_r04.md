# Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r04

## Resumen

`svd-safety-l3_remove30_swapgapiter_b010_r04` es un checkpoint derivado de `meta-llama/Meta-Llama-3-8B-Instruct` publicado por el usuario Jeesup en HuggingFace. No es un modelo conversacional de propósito general, sino un artefacto de investigación: se trata del modelo base comprimido mediante SVD-LLM hasta conservar el 70,0% de los parámetros densos (se elimina el 30,01%), y posteriormente editado con 4 de las 10 rondas previstas de una rutina de intercambio iterativo de parámetros neutral en valor, seleccionados mediante la regla `gap_iter`. El objetivo declarado del estudio es medir cómo la compresión SVD degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes lo repara mejor.

El checkpoint conserva la arquitectura transformer decoder-only de Llama 3 8B, con 8.030.261.248 parámetros totales según el archivo safetensors, y un tamaño de repositorio de 16,1 GB. Durante la edición se restauraron y sustituyeron 4.604 componentes, con 27.893.760 parámetros intercambiados (el 0,40% de los parámetros de proyección densos) y un presupuesto de restauración del 1,000% de los parámetros densos, aplicado en fragmentos del 0,100% por ronda. La fracción de parámetros resultante es 0,6999.

Su relevancia es estrictamente metodológica. El propio autor advierte que varias ramas de la cuadrícula experimental están deliberadamente degradadas en seguridad respecto al modelo original, que la compresión por sí sola eleva la tasa de éxito de ataque y que este checkpoint concreto es una celda intermedia de una ejecución más larga. Por tanto, debe tratarse como sujeto experimental reproducible (semilla 42), no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda la de Meta-Llama-3-8B-Instruct), comprimido con SVD-LLM |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama 3 8B Instruct declara 8.192 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos safetensors sin cuantizar; cualquier cuantizacion requeriria generarla a partir de estos pesos) |
| Idiomas soportados | No disponible en la model card (el modelo base declara soporte multilingue; no confirmado para este derivado) |
| Licencia | Meta Llama 3 Community License (etiqueta `llama3`); incluye `LICENSE` y `USE_POLICY.md` en el repositorio |
| Formato de pesos | safetensors, cargable con `transformers` (libreria declarada: transformers) |

Datos adicionales de la ficha de procedencia:

| Campo | Valor |
|---|---|
| Modelo base sin comprimir | meta-llama/Meta-Llama-3-8B-Instruct |
| Compresion | SVD-LLM, 30,01% de parametros eliminados |
| Regla de seleccion | gap_iter |
| Presupuesto de restauracion | 1,000% de los parametros densos |
| Componentes restaurados | 4.604 |
| Componentes sustituidos | 4.604 |
| Fraccion de parametros resultante | 0,6999 |
| Semilla | 42 |
| Rondas iterativas aplicadas | 4 de 10 |
| Fragmento por ronda | 0,100% de los parametros densos |
| Parametros insertados | 27.893.760 (0,40% de los parametros de proyeccion densos) |
| Valor de intercambio | insert (solo valor de insercion; desalojo ordenado por sigma) |
| Tipo de checkpoint | ronda intermedia de una ejecucion mas larga |
| Tamano del repositorio | 16,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del transformer decoder-only de Llama 3 8B Instruct, con atención causal estándar y sin innovaciones propias del derivado. La modificación aplicada es de compresión y edición post-hoc, no de arquitectura: se emplea SVD-LLM para descomponer y truncar componentes de las matrices de proyección, eliminando el 30,01% de los parámetros densos y dejando el modelo en una fracción de 0,6999 respecto al original. Sobre ese modelo ya comprimido se aplica una rutina de intercambio iterativo de parámetros "neutral en valor", que selecciona qué componentes restaurar mediante la regla `gap_iter` y con qué componentes sustituirlos, respetando un presupuesto del 1,000% de los parámetros densos repartido en rondas del 0,100%.

Este checkpoint concreto corresponde a la cuarta de diez rondas. Los valores intercambiados se insertan usando únicamente el valor de inserción, con un mecanismo de desalojo ordenado por sigma. En total se restauraron 4.604 componentes y se sustituyeron otros tantos, lo que supone 27.893.760 parámetros nuevos (0,40% de los parámetros de proyección densos). No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni sobre fases de RLHF o DPO adicionales: el derivado no se reentrena, se edita a nivel de pesos partiendo de un modelo ya instruido. Tampoco se documentan técnicas de decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Generación de texto conversacional: conserva la funcionalidad base de Llama 3 8B Instruct en la medida en que la compresión no la haya degradado, algo que la propia model card señala como variable a evaluar.
- Razonamiento y conocimiento general: heredados del modelo base, sin métricas publicadas que cuantifiquen la pérdida tras la compresión del 30,01%.
- Capacidad multilingüe: presumiblemente heredada del modelo base, pero no documentada ni declarada en la model card de este derivado.
- Comportamiento de rechazo y seguridad: es la dimensión central del artefacto. La model card reporta un ASR de 0,0000 en AdvBench y de 0,0100 en StrongREJECT, ambos con juez HarmBench.
- Sobrerrechazo: se reporta un macro over-refusal de 0,6519 medido con WildGuard, un valor alto que indica tendencia a rechazar peticiones legítimas.
- Tool calling, function calling y uso agente: no documentado para este checkpoint; no se debe asumir que la compresión preserva estas capacidades.
- Modo "thinking" explícito, visión o audio: no disponibles.
- Reproducibilidad experimental: la configuración queda fijada con semilla 42, regla `gap_iter`, presupuesto y número de ronda, lo que permite replicar la celda exacta dentro de la cuadrícula del estudio.

## Casos de uso

- Evaluación de seguridad bajo compresión: usar este checkpoint como sujeto experimental en campañas de red-teaming (AdvBench, StrongREJECT, HarmBench) para cuantificar cuánto sube la tasa de éxito de ataque cuando se elimina el 30% de los parámetros densos, comparándolo con el modelo sin comprimir.
- Estudio de reglas de selección de componentes: la celda pertenece a una cuadrícula sobre reglas y presupuestos; sirve para comparar `gap_iter` frente a otras reglas con el mismo presupuesto de restauración (1,000%) y el mismo número de componentes (4.604).
- Análisis de la curva iterativa de reparación: al ser la ronda 4 de 10, permite medir la evolución de las métricas de seguridad y utilidad ronda a ronda y localizar el punto de rendimientos decrecientes o de daño colateral.
- Investigación sobre sobrerrechazo: con un macro over-refusal de 0,6519 medido con WildGuard, es un caso de estudio útil para caracterizar cómo las ediciones de pesos orientadas a seguridad convierten respuestas legítimas en rechazos.
- Interpretabilidad de pesos comprimidos: los 4.604 componentes restaurados y los 4.604 sustituidos ofrecen un conjunto acotado y trazable de direcciones de peso para estudiar qué subespacios de la red están implicados en el comportamiento de seguridad.
- Reproducción de resultados en investigación de compresión: con la semilla 42 y los parámetros de procedencia documentados, otro grupo puede regenerar la misma celda y verificar los valores reportados antes de construir sobre ellos.
- Referencia negativa en pipelines de validación: incluir este checkpoint como caso de prueba en una batería interna de evaluación de seguridad, de forma que cualquier modelo candidato a producción se compare contra un artefacto conocido por estar degradado.

## Benchmarks y rendimiento

La única información disponible son las tres métricas declaradas por el autor en la model card. No se han publicado resultados de benchmarks de conocimiento o código (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Metrica | Valor | Metodo de evaluacion |
|---|---|---|
| AdvBench ASR | 0,0000 | Juez HarmBench |
| StrongREJECT ASR | 0,0100 | Juez HarmBench |
| Macro over-refusal | 0,6519 | WildGuard |

No se dispone de los valores equivalentes del modelo base sin comprimir dentro de la información proporcionada, por lo que no es posible calcular la delta atribuible a la compresión a partir de estos datos.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: en torno a 16 GB solo para pesos, mas la cache KV; con contexto de 8.192 tokens y lote pequeno, el consumo practico se situa aproximadamente entre 17 y 20 GB.
- VRAM estimada en int8: del orden de 8-9 GB para pesos, mas cache KV.
- VRAM estimada en int4 (por ejemplo GGUF Q4_K_M, a generar por el usuario): del orden de 5-6 GB, lo que lo hace viable en GPUs de consumo.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S o cualquier GPU con 24 GB o mas (RTX 3090, RTX 4090) si se limita el contexto y el tamano de lote.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, en cuantizacion int4, en GPUs con 8 GB de VRAM como la RTX 3070 o la RTX 4060, con contexto reducido.
- Opciones de despliegue: al publicarse en safetensors y con `transformers` como libreria declarada, es directamente cargable con la pila de HuggingFace; tambien es compatible con text-generation-inference y con endpoints compatibles, segun las etiquetas del repositorio. Para llama.cpp, Ollama o vLLM seria necesario convertir o cuantizar los pesos previamente, ya que el repositorio no incluye GGUF ni checkpoints cuantizados.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svd-safety-l3_remove30_swapgapiter_b010_r04 | 8.030.261.248 (70,0% de los parametros densos tras SVD) | No disponible en la ficha; el base declara 8.192 tokens | Comprimido con SVD-LLM al 70,0% + 4 de 10 rondas de intercambio `gap_iter` | Meta Llama 3 Community License | Publicado en HuggingFace, 0 descargas, 0 likes |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030.261.248 (sin comprimir) | 8.192 tokens (segun el modelo base) | Modelo instruido original, sin edicion de pesos | Meta Llama 3 Community License | Publicado por Meta, ampliamente utilizado |
| Otras celdas de la misma cuadricula del estudio | Variable segun regla y presupuesto | No disponible | Distintas reglas de seleccion y presupuestos de restauracion | Meta Llama 3 Community License | No identificadas en la informacion proporcionada |

No se dispone de datos publicados de benchmarks comunes entre estas filas que permitan una comparacion cuantitativa de rendimiento, ni de informacion sobre otros derivados de compresion SVD-LLM de Llama 3 8B con los que contrastar directamente. La comparacion se limita, por tanto, a parametros, contexto declarado, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo desplegable: el autor lo describe explicitamente como artefacto de investigacion y advierte contra su uso como asistente de propósito general.
- Degradacion deliberada de seguridad en varias ramas del estudio: la model card indica que algunas celdas de la cuadricula están degradadas a propósito respecto a Llama-3-8B-Instruct y que la compresión por sí sola incrementa la tasa de éxito de ataque.
- Sesgos: no documentados en la información disponible. Al derivar de Llama 3 8B Instruct, cabria esperar los sesgos del modelo base, pero no hay evaluación específica para este checkpoint.
- Riesgo de alucinación: no cuantificado. La compresión del 30,01% de los parámetros densos puede afectar a la fidelidad factual, pero no se han publicado métricas que lo midan.
- Sobrerrechazo elevado: el macro over-refusal de 0,6519 medido con WildGuard indica que el modelo rechaza con frecuencia peticiones que no deberían ser rechazadas, lo que lo hace inadecuado para aplicaciones conversacionales reales.
- Contexto e idioma: la model card no declara longitud de contexto ni idiomas soportados para este derivado; cualquier cifra al respecto es una extrapolación del modelo base sin verificar.
- Checkpoint intermedio: corresponde a la ronda 4 de 10, de modo que ni siquiera representa el resultado final de la configuración experimental descrita.
- Restricciones de licencia: se aplica la Meta Llama 3 Community License. Cualquier uso comercial queda sujeto a `LICENSE` y `USE_POLICY.md`, que incluyen obligaciones de atribución ("Built with Meta Llama 3") y restricciones de uso aceptable; ademas, al ser un derivado, se heredan las condiciones impuestas al modelo base.
- Sin validación externa: el repositorio tiene 0 descargas y 0 likes, y no se han encontrado publicaciones, papers ni evaluaciones independientes en la información disponible.
- Fechas del repositorio: la creación y la última actualización figuran como 2026-09-17, dato que conviene verificar antes de citarlo.
- Ausencia de pesos cuantizados: no se ofrecen GGUF, GPTQ ni AWQ, por lo que el despliegue en hardware limitado exige un paso adicional de conversión y validación por parte del usuario.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_remove30_swapgapiter_b010_r04
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Meta Llama 3 Community License: incluida en el repositorio del modelo (`LICENSE` y `USE_POLICY.md`)
- Paper de SVD-LLM, repositorio de código, blog del autor y demos: no disponibles en la información proporcionada. Los resultados de búsqueda web recibidos no contienen enlaces relacionados con el modelo.
