# Jeesup/svd-safety-l31_remove20_swapgapiter_b010

## Resumen

svd-safety-l31_remove20_swapgapiter_b010 es un checkpoint derivado de meta-llama/Llama-3.1-8B-Instruct, comprimido con SVD-LLM hasta el 80,0 % de los parámetros densos (se elimina el 20,02 %), y después editado mediante 10 de 10 rondas iterativas de intercambio de parámetros neutro (parameter-neutral swap) con la regla de selección `gap_iter`. El autor, Jeesup, lo publica como artefacto de investigación dentro de un estudio sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor. No es un modelo de chat de propósito general.

El resultado es un transformer decoder-only de 8.030.261.248 parámetros reales, con una fracción de parámetros densos de 0,7998 y 69.747.712 parámetros insertados (el 1,00 % de los parámetros de proyección), repartidos en 9.397 componentes restaurados y 9.397 componentes sustituidos, con semilla 42. La model card reporta métricas concretas de seguridad y calidad: ASR de 0,0135 en AdvBench, ASR de 0,0543 en StrongREJECT, sobrerrechazo macro de 0,2771 medido con WildGuard y una perplejidad de 15,5604 en WikiText-2.

Su relevancia es metodológica más que práctica: forma parte de una rejilla experimental sobre reglas de selección y presupuestos de restauración, y sirve para cuantificar el compromiso entre seguridad y utilidad bajo compresión, no para desplegarse como asistente. Cualquier celda de esa rejilla debe tratarse como sujeto experimental y evaluarse de forma independiente antes de extraer conclusiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.1, modificado mediante compresión SVD-LLM y edición iterativa de parámetros |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens heredados de Llama-3.1-8B-Instruct; la model card no documenta cambios en la ventana de contexto |
| Tipos de cuantización | no disponible (el repositorio solo publica pesos en safetensors en su precisión original; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la model card del derivado; el modelo base declara soporte oficial para 8 idiomas |
| Licencia | Llama 3.1 Community License (se incluyen LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (librería transformers) |

Detalles de compresión y edición declarados por el autor:

| Campo | Valor |
|---|---|
| Modelo base sin comprimir | meta-llama/Llama-3.1-8B-Instruct |
| Método de compresión | SVD-LLM, 20,02 % de parámetros eliminados |
| Fracción de parámetros resultante | 0,7998 |
| Regla de selección | gap_iter |
| Presupuesto de restauración | 1,000 % de los parámetros densos |
| Componentes restaurados | 9.397 |
| Componentes sustituidos | 9.397 |
| Valor de intercambio | insert (solo valor de inserción; desalojo ordenado por sigma) |
| Rondas iterativas aplicadas | 10 de 10 |
| Tamaño de bloque por ronda | 0,100 % de los parámetros densos |
| Parámetros insertados | 69.747.712 (1,00 % de los parámetros de proyección densos) |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 3.1 8B Instruct: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA). Sobre esa base no se realiza un reentrenamiento completo, sino una compresión post-hoc con SVD-LLM que reduce el rango de las matrices de proyección hasta dejar el 79,98 % de los parámetros densos originales, eliminando el 20,02 %. La consecuencia directa es una pérdida de capacidad de modelado del lenguaje, cuantificada por el autor en 15,5604 de perplejidad sobre WikiText-2.

La innovación del checkpoint no está en el preentrenamiento, sino en el proceso de reparación posterior: 10 rondas iterativas de intercambio de parámetros neutro, con un bloque del 0,100 % de los parámetros densos por ronda y un presupuesto total del 1,000 %. En cada ronda se restauran 9.397 componentes y se sustituyen otros tantos, con desalojo ordenado por valor singular y un único valor de inserción (`insert`), usando la regla de selección `gap_iter` para decidir qué componentes se tocan. Los 69.747.712 parámetros insertados suponen el 1,00 % de los parámetros de proyección densos. No se documentan en la model card fases de RLHF, DPO ni un dataset de entrenamiento propio para este derivado; el alineamiento procede del modelo base Instruct.

## Capacidades

- Generación de texto conversacional: conserva la interfaz de chat del modelo base Instruct, aunque la model card insiste en que no debe tratarse como asistente desplegable.
- Razonamiento y generación de código: capacidades heredadas del base Llama-3.1-8B-Instruct, presumiblemente atenuadas por la compresión; no se aportan evaluaciones específicas de código o matemáticas.
- Tool calling y function calling: no documentado en la información disponible para este derivado; el modelo base sí lo soporta mediante plantillas de chat.
- Uso como sujeto experimental en evaluación de seguridad: es su capacidad principal y la razón de ser del checkpoint.
- Medición de sobrerrechazo: el autor reporta un macro over-refusal de 0,2771 evaluado con WildGuard, lo que permite estudiar el eje utilidad/seguridad.
- Robustez frente a ataques adversariales: se reportan tasas de éxito de ataque (ASR) bajo jueces HarmBench en AdvBench y StrongREJECT.
- Multilingüismo: no documentado en el derivado; el modelo base declara 8 idiomas oficiales.
- Modo de razonamiento explícito (thinking), visión o audio: no disponibles.

## Casos de uso

- Investigación en interpretabilidad de seguridad bajo compresión: el checkpoint permite medir cómo la eliminación del 20,02 % de parámetros altera el comportamiento de rechazo, comparando las métricas de ASR y sobrerrechazo con las del modelo base sin comprimir.
- Auditoría de reglas de selección de componentes: al fijar la regla `gap_iter`, el presupuesto de 1,000 % y la semilla 42, sirve como celda de control reproducible frente a otras reglas y presupuestos de la rejilla del autor.
- Red teaming y evaluación de jailbreaks: los valores de ASR en AdvBench (0,0135) y StrongREJECT (0,0543) con juez HarmBench permiten cuantificar la resistencia del modelo comprimido frente a prompts dañinos dentro de un protocolo de evaluación estandarizado.
- Estudio del sobrerrechazo: con un 27,71 % de macro over-refusal medido por WildGuard, es útil para analizar si la compresión y la restauración de parámetros provocan rechazos excesivos en peticiones legítimas.
- Análisis del compromiso compresión-calidad: la perplejidad de 15,5604 en WikiText-2 ofrece un punto de medida para trazar curvas de degradación frente al porcentaje de parámetros eliminados.
- Reproducción de experimentos de compresión SVD: al publicar la configuración completa (rondas, bloques por ronda, componentes restaurados y sustituidos, semilla), permite replicar el pipeline de SVD-LLM más edición iterativa sobre Llama-3.1-8B-Instruct.
- Docencia y divulgación técnica: como ejemplo documentado de artefacto de investigación con métricas de seguridad explícitas, resulta adecuado para explicar por qué un modelo comprimido no equivale a un modelo cuantizado.
- Evaluación de infraestructura de serving: al ser compatible con transformers y con text-generation-inference, puede usarse para probar pipelines de despliegue con modelos derivados de Llama antes de mover artefactos experimentales a producción.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card:

| Benchmark | Métrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0135 |
| StrongREJECT | ASR (juez HarmBench) | 0,0543 |
| WildGuard | Macro over-refusal | 0,2771 |
| WikiText-2 | Perplejidad | 15,5604 |

La model card no incluye en esta página los valores del modelo base sin comprimir ni de otros brazos de la rejilla, por lo que no se dispone de una comparación directa publicada. No se han encontrado en la búsqueda web resultados de benchmarks adicionales; los enlaces devueltos por la búsqueda no guardan relación con el modelo.

## Requisitos de hardware

- Pesos en fp16/bf16: aproximadamente 16,06 GB (8.030.261.248 parámetros a 2 bytes por parámetro), coherente con los 16,1 GB del repositorio.
- VRAM estimada en fp16: unos 16-18 GB solo para pesos, más caché KV; con GQA de 8 cabezas KV, 32 capas y dimensión de cabeza 128, la caché KV ocupa del orden de 128 KiB por token en fp16, es decir, aproximadamente 1 GB a 8.000 tokens, 4 GB a 32.000 tokens y 16 GB a 128.000 tokens (estimación, no dato publicado).
- VRAM estimada con cuantización: no disponible de forma oficial; como referencia teórica, int8 rondaría los 8-9 GB y int4 los 5-6 GB, pero el autor no publica pesos cuantizados y la cuantización por parte del usuario puede alterar el comportamiento de seguridad que se pretende medir.
- GPU recomendadas: A100 40 GB, H100, L40S o A6000 para fp16 con contexto largo sin recortes; RTX 4090 o RTX 3090 (24 GB) caben en fp16 con contexto moderado.
- GPU de consumo: sí cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) en fp16 con contexto limitado. En tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) solo sería viable con cuantización aplicada por el usuario. Por debajo de 16 GB, no es viable sin cuantización agresiva.
- Opciones de despliegue: transformers, text-generation-inference (el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`) y vLLM por tratarse de una arquitectura Llama estándar. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que el autor no proporciona.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-l31_remove20_swapgapiter_b010 | 8,03 B (fracción densa 0,7998) | 128.000 tokens (heredado) | Llama 3.1 Community | HuggingFace, 0 descargas y 0 likes | Artefacto de investigación con seguridad medida; no apto como asistente general |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community | HuggingFace, ampliamente distribuido | Referencia sin comprimir; baseline natural para medir la degradación |
| Otros brazos de la rejilla de Jeesup | ~8,03 B | 128.000 tokens (heredado) | Llama 3.1 Community | HuggingFace (repositorio del autor) | Distintas reglas de selección y presupuestos; métricas no disponibles en la información consultada |
| Método SVD-LLM aplicado a Llama | no disponible | no disponible | no disponible | no disponible | Es el método de compresión empleado; no se dispone de cifras comparativas verificadas en la información proporcionada |

No se dispone de comparaciones de rendimiento (MMLU, HumanEval, GSM8K u otros) entre este checkpoint y alternativas, porque el autor solo publica métricas de seguridad y perplejidad.

## Limitaciones y advertencias

- No es un modelo de propósito general: la propia model card lo describe como artefacto de investigación y una celda de una rejilla experimental, no como asistente desplegable.
- Degradación deliberada de seguridad en varios brazos: el autor advierte de que la compresión por sí sola eleva la tasa de éxito de ataque y que el objetivo del estudio es cuantificarlo; este checkpoint concreto reporta ASR de 0,0135 en AdvBench y 0,0543 en StrongREJECT, sin baseline publicado con el que contrastarlos.
- Sobrerrechazo elevado: un macro over-refusal de 0,2771 implica que una parte relevante de peticiones legítimas puede recibir un rechazo.
- Pérdida de calidad de modelado: la perplejidad de 15,5604 en WikiText-2 refleja el coste de haber eliminado el 20,02 % de los parámetros; no se aporta el valor del modelo base para contextualizarla.
- Riesgo de alucinación: inherente a un modelo de 8B y presumiblemente agravado por la compresión, dado que no hay reentrenamiento de recuperación.
- Idiomas: la model card del derivado no especifica idiomas soportados ni evalúa el impacto de la compresión por idioma.
- Licencia Llama 3.1 Community: el uso comercial está sujeto a LICENSE y USE_POLICY.md incluidos en el repositorio, con obligaciones de atribución ("Built with Llama") y las restricciones habituales de esta licencia; cualquier redistribución derivada queda vinculada a esos términos.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia externa de reproducibilidad de las métricas reportadas.
- Cuantización no soportada oficialmente: aplicar GGUF, AWQ o GPTQ por cuenta propia puede modificar el comportamiento de seguridad medido e invalidar las conclusiones del estudio.
- Fechas del repositorio: creado y actualizado el 17 de septiembre de 2026 según los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove20_swapgapiter_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio del autor en HuggingFace (para el resto de brazos de la rejilla): https://huggingface.co/Jeesup
- Paper, blog o repositorio del método SVD-LLM: no disponible en la información proporcionada.
- Resultados relevantes de la búsqueda web: no se han encontrado enlaces relacionados con el modelo; las URL devueltas corresponden a páginas de ayuda de YouTube y a foros sin relación con el contenido.
