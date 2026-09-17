# Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r05

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de `meta-llama/Llama-3.1-8B-Instruct`, no un modelo entrenado desde cero. Sobre el modelo base se aplicó compresión SVD-LLM eliminando el 30,01% de los parámetros, lo que deja una fracción de parámetros densos de 0,6999, y a continuación se aplicó un proceso de reparación parcial mediante 5 de las 10 rondas previstas de intercambio paramétrico neutro, seleccionando componentes con la regla `gap_iter`.

El objetivo del autor no es ofrecer un asistente desplegable, sino medir cómo la compresión degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. Se trata de una celda concreta dentro de una rejilla que barre reglas de selección y presupuestos de restauración, y la propia model card advierte de que varias ramas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo base.

Por tanto, es relevante como artefacto experimental para investigadores en compresión, interpretabilidad y seguridad, pero no como modelo de propósito general: su uso previsto es la evaluación controlada de compromisos entre seguridad y utilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama 3.1, derivado por compresión SVD-LLM (no entrenado desde cero) |
| Parámetros totales | 8.030.261.248 (fracción de parámetros densos resultante: 0,6999; 30,01% eliminado) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; heredada del modelo base Llama-3.1-8B-Instruct (128.000 tokens) |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (la model card no documenta idiomas) |
| Licencia | Llama 3.1 Community License (`llama3.1`); se incluyen `LICENSE` y `USE_POLICY.md` |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Regla de selección | `gap_iter` |
| Presupuesto de restauración | 1,000% de los parámetros densos (0,100% por ronda) |
| Componentes restaurados / sustituidos | 5633 restaurados, 5633 sustituidos |
| Parámetros insertados | 34.870.272 (0,50% de los parámetros de proyección densos) |
| Semilla | 42 |
| Tamaño del repositorio | 16,1 GB |
| Pipeline | text-generation (compatible con endpoints y con text-generation-inference) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con atención por causalidad, normalización RMSNorm y activaciones SwiGLU. Sobre ese checkpoint no hay entrenamiento adicional documentado; lo que se documenta es un post-proceso en dos etapas. La primera es compresión por descomposición en valores singulares con SVD-LLM, que elimina el 30,01% de los parámetros del modelo denso y deja la fracción en 0,6999. La segunda es una reparación de seguridad mediante "intercambio paramétrico neutro": se restauran componentes concretos desde el modelo original y se expulsan otros en número equivalente.

En este checkpoint concreto se aplicaron 5 de las 10 rondas iterativas previstas, con un presupuesto declarado de restauración del 1,000% de los parámetros densos y un tamaño de bloque de 0,100% por ronda. En total se restauraron 5633 componentes y se sustituyeron otros 5633, insertando 34.870.272 parámetros (0,50% de los parámetros de proyección densos). El valor de intercambio es `insert` (solo valor de inserción, con desalojo ordenado por sigma) y la semilla es 42. El resultado es un checkpoint de ronda intermedia de una ejecución más larga, no el estado final de la misma. No se documentan fases de RLHF ni DPO posteriores a las del modelo base Instruct.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada del modelo base Llama-3.1-8B-Instruct.
- Escritura de código y respuesta a instrucciones generales, en la medida en que la compresión SVD-LLM y el proceso de intercambio no hayan degradado esas capacidades (la model card no incluye métricas de utilidad que lo confirmen).
- Respuesta a peticiones multi-turno, sujeto a la ventana de contexto del modelo base (128.000 tokens), aunque el artefacto no valida explícitamente este extremo.
- Sujeto de estudio controlado para medir tasa de éxito de ataques (ASR) frente a jailbreaks: AdvBench y StrongREJECT con juez HarmBench.
- Sujeto de estudio controlado para medir sobre-rechazo macro con el clasificador WildGuard.
- No se documentan capacidades de tool calling, function calling, uso de agentes, visión, audio ni modo de razonamiento explícito (thinking).
- No se documentan capacidades multilingües ni evaluación por idioma.

## Casos de uso

- Investigación sobre efectos de la compresión en seguridad: sirve como celda experimental para cuantificar cuánto sube la tasa de éxito de ataques al eliminar el 30,01% de los parámetros y cuánto se recupera con la regla `gap_iter` aplicada durante 5 rondas.
- Comparación de reglas de selección de componentes: al ser una celda de una rejilla sobre reglas y presupuestos, permite contrastar `gap_iter` frente a otras reglas manteniendo fijo el presupuesto de restauración del 1,000%.
- Estudios de ablación de presupuesto: al existir un bloque de 0,100% por ronda y un total de 10 rondas planificadas, este checkpoint (ronda 5) permite analizar la curva de recuperación intermedia y compararla con la ejecución completa.
- Evaluación de sobre-rechazo: con un 0,3527 de sobre-rechazo macro medido por WildGuard, es útil para estudiar el coste en utilidad que introduce la reparación de seguridad en modelos comprimidos.
- Red-teaming y calibración de jueces: sirve para probar si los clasificadores de seguridad (HarmBench, WildGuard) discriminan correctamente entre un modelo degradado y su versión original.
- Interpretabilidad de pesos: el par restaurado/sustituido (5633 componentes en cada lado) permite analizar qué subespacios de proyección son responsables del comportamiento de rechazo.
- Docencia y reproducibilidad: al fijar semilla 42 y documentar recuentos exactos de componentes y parámetros, es un caso reproducible para explicar pipelines de compresión SVD sobre transformers.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| AdvBench | ASR con juez HarmBench | 0,0150 |
| StrongREJECT | ASR con juez HarmBench | 0,0400 |
| WildGuard | Sobre-rechazo macro | 0,3527 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de capacidad, ni cifras del modelo base con las que comparar directamente estas tres métricas. La model card afirma cualitativamente que la compresión por sí sola eleva la tasa de éxito de ataques, pero no proporciona los valores de esa condición de referencia.

## Requisitos de hardware

- VRAM estimada en precisión completa (bf16/fp16): aproximadamente 16,1 GB solo para pesos, más el coste de la caché KV, que crece con la longitud de contexto.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB como la RTX 4090 o la RTX 3090, siempre que se limite la longitud de contexto o se aplique cuantización.
- GPU recomendadas para servicio: A100 40/80 GB, H100 80 GB, L40S 48 GB o cualquier GPU con al menos 24 GB para bf16 en contexto corto.
- No se publican variantes cuantizadas en el repositorio; para reducir VRAM habría que generar cuantizaciones propias (GGUF para llama.cpp/Ollama, AWQ o GPTQ para vLLM).
- Opciones de despliegue: `transformers` de forma nativa (formato safetensors), vLLM y TGI (las etiquetas del repositorio indican compatibilidad con endpoints y con text-generation-inference). El uso en llama.cpp u Ollama requiere convertir previamente los pesos a GGUF.
- Latencia y throughput estimados: no disponibles (no se publican mediciones de velocidad ni de tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Seguridad (ASR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | 8,03 B (fracción densa 0,6999) | No especificado (128.000 en el base) | AdvBench 0,0150 / StrongREJECT 0,0400 | Llama 3.1 Community | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | No disponible en la información proporcionada | Llama 3.1 Community | HuggingFace |
| Otros artefactos comprimidos o editados para seguridad de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han encontrado en la información proporcionada otros modelos comparables con métricas equivalentes (misma rejilla de compresión, mismos jueces de seguridad) que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un asistente desplegable: la propia model card indica que cada celda debe tratarse como sujeto experimental y evaluarse antes de extraer conclusiones.
- Varias ramas de la rejilla de la que forma parte están deliberadamente degradadas en seguridad respecto a Llama-3.1-8B-Instruct; no debe asumirse que la compresión preserva el alineamiento del modelo original.
- Este checkpoint es una ronda intermedia (5 de 10), por lo que no representa el resultado final de la ejecución ni el mejor estado de recuperación alcanzado.
- El sobre-rechazo macro de 0,3527 medido con WildGuard es elevado y sugiere que el modelo rechaza un porcentaje notable de peticiones legítimas, con el consiguiente coste en utilidad.
- No se publican métricas de capacidad (razonamiento, código, matemáticas) ni comparación con el modelo base, por lo que se desconoce el grado real de degradación funcional.
- Riesgo de alucinación: no cuantificado en la model card, pero la compresión de bajo rango puede intensificarlo; debe evaluarse caso por caso.
- Idiomas soportados y comportamiento multilingüe: no documentados.
- Comportamiento con tool calling, agentes o contexto largo: no documentado ni validado.
- Restricciones de licencia: se rige por la Llama 3.1 Community License y por `USE_POLICY.md`; su uso comercial queda sujeto a dichos términos, incluida la obligación de atribución ("Built with Llama") y las cláusulas sobre escala de usuarios.
- No se ofrecen garantías de calidad ni de seguridad para producción; cualquier despliegue requeriría evaluación propia y, previsiblemente, capas adicionales de filtrado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove30_swapgapiter_b010_r05
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia y política de uso: incluidas en el repositorio (`LICENSE` y `USE_POLICY.md`)
- Paper de SVD-LLM: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
- Resultados de búsqueda web: sin coincidencias relevantes; las URLs devueltas corresponden a anuncios de alquiler de vivienda en Redmond (WA) y no guardan relación con el modelo.
