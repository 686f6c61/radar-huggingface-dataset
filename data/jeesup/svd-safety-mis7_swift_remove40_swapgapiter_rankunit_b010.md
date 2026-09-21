# Jeesup/svd-safety-mis7_swift_remove40_swapgapiter_rankunit_b010

## Resumen

`svd-safety-mis7_swift_remove40_swapgapiter_rankunit_b010` es un checkpoint de investigación publicado por el usuario Jeesup y derivado de `mistralai/Mistral-7B-Instruct-v0.2`. Consiste en el modelo base comprimido con SVD-LLM hasta el 60,0 % de los parámetros densos (39,97 % de parámetros eliminados) y editado después con 10 de 10 rondas de una sustitución iterativa de parámetros neutra, en la que los componentes se seleccionan con la regla `gap_iter` y se aplica un presupuesto de restauración del 1,000 % de los parámetros densos.

El propósito del artefacto no es conversar, sino cuantificar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes lo repara mejor. Según la model card, es una celda de una rejilla de experimentos sobre reglas de selección y presupuestos, con semilla 42, 4.990 componentes restaurados, 4.990 permutados y 69.742.592 parámetros intercambiados (1,00 % de las proyecciones densas).

Los valores medidos son una tasa de éxito de ataque (ASR) de 0,1481 en AdvBench y 0,1885 en StrongREJECT (juez HarmBench), un sobre-rechazo macro de 0,1559 (WildGuard) y una perplejidad de 10,6431 en WikiText-2. Con 7.241.732.096 parámetros reales y 14,5 GB de pesos, resulta relevante como material de referencia para estudiar el equilibrio entre compresión, seguridad y utilidad, nunca como asistente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.2); las proyecciones densas se comprimen mediante SVD-LLM (descomposición en valores singulares) |
| Parámetros totales | 7.241.732.096 (conteo real de safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base declara 32.768 tokens |
| Tipos de cuantización | no disponible (no se publican variantes GGUF, GPTQ, AWQ ni bitsandbytes) |
| Idiomas soportados | no disponibles en la model card; heredados del modelo base |
| Licencia | Apache 2.0 (el repositorio del modelo base no incluye fichero de licencia para redistribución; la licencia indicada rige esta obra derivada) |
| Formato de pesos | safetensors (librería `transformers`) |
| Fracción de parámetros densos resultante | 0,6003 |
| Regla de selección de componentes | `gap_iter` |
| Presupuesto de restauración | 1,000 % de los parámetros densos (0,100 % por ronda) |
| Componentes restaurados / permutados | 4.990 / 4.990 |
| Parámetros intercambiados | 69.742.592 (1,00 % de los parámetros de proyección densos) |
| Valor de intercambio | `insert` (solo valor de inserción; desalojo ordenado por sigma) |
| Rondas iterativas aplicadas | 10 de 10 |
| Semilla | 42 |
| Tamaño del repositorio | 14,5 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de Mistral-7B-Instruct-v0.2, con sus proyecciones densas comprimidas mediante SVD-LLM. La compresión elimina el 39,97 % de los parámetros aplicando una descomposición de rango reducido sobre las matrices de proyección; no se documenta ningún cambio en la topología de atención ni en el tokenizador. Sobre ese checkpoint comprimido se aplica una edición de pesos posterior, no un reentrenamiento: 10 rondas de sustitución de parámetros, cada una con un presupuesto del 0,100 % de los parámetros densos, que restauran componentes del modelo original (valor de inserción) y desalojan otros siguiendo un orden basado en sigma. En total se sustituyen 69.742.592 parámetros.

No se proporcionan datos de entrenamiento (número de tokens, composición del dataset) ni consta que se haya aplicado RLHF, DPO u otra fase de alineamiento específica sobre esta derivada: la intervención descrita es una edición selectiva de componentes sobre pesos ya comprimidos. La innovación técnica del artefacto es metodológica: la regla `gap_iter` como criterio de selección de componentes y la naturaleza iterativa, neutral en número de parámetros, del intercambio. El resultado se mide en términos de ASR, sobre-rechazo y perplejidad, no de capacidades generales.

## Capacidades

- Generación de texto conversacional: el checkpoint conserva la estructura de un modelo instruct, por lo que puede producir respuestas en formato diálogo, aunque la model card advierte explícitamente que no es un modelo de chat de propósito general.
- Comportamiento de seguridad medible: es un sujeto experimental con ASR documentado (0,1481 en AdvBench y 0,1885 en StrongREJECT), útil para estudiar fallos de alineamiento inducidos por compresión.
- Perfil de rechazo cuantificado: sobre-rechazo macro de 0,1559 según WildGuard, lo que permite analizar el equilibrio entre seguridad y utilidad conversacional.
- Calidad de lenguaje bajo compresión: perplejidad de 10,6431 en WikiText-2, métrica que permite estimar el daño de la compresión sobre la modelización del lenguaje.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas en la model card.
- Capacidades especiales (modo thinking, visión, audio): ninguna documentada; el modelo base es exclusivamente de texto.

## Casos de uso

- Auditoría de seguridad de la compresión: usar el checkpoint como muestra de un modelo comprimido con ASR conocido (0,1481 en AdvBench) para cuantificar cuánto degrada la compresión SVD-LLM el alineamiento frente a Mistral-7B-Instruct-v0.2 sin comprimir.
- Reproducción de experimentos: la semilla 42, las 10 rondas, el presupuesto del 1,000 % y los 4.990 componentes restaurados son parámetros suficientemente explícitos para replicar la celda y contrastar los valores publicados.
- Estudio de reglas de selección de componentes: comparar `gap_iter` con las demás reglas de la rejilla (otras celdas del estudio) para determinar qué criterio repara mejor la seguridad con el mismo presupuesto de parámetros.
- Calibración de jueces automáticos de seguridad: al ser un sujeto con ASR y sobre-rechazo medidos con HarmBench y WildGuard, sirve para verificar que un juez detecta ataques en un rango de tasas conocido (0,15-0,19).
- Análisis del compromiso seguridad-utilidad: relacionar la perplejidad de WikiText-2 (10,6431) con el ASR para estudiar si las intervenciones que reducen ataques castigan la fluidez del modelo.
- Investigación sobre sobre-rechazo: con un 0,1559 de sobre-rechazo macro, permite analizar en qué prompts legítimos el modelo rechaza y si la edición de pesos lo agrava.
- Interpretabilidad de pesos comprimidos: los 69,74 millones de parámetros intercambiados y el desalojo ordenado por sigma permiten estudiar qué componentes concretos sostienen el comportamiento de rechazo.
- Docencia y prácticas de seguridad: uso en entornos aislados (sandbox sin red y sin usuarios finales) para ilustrar cómo una intervención mínima sobre los pesos altera métricas de seguridad.

## Benchmarks y rendimiento

| Métrica | Valor | Juez / herramienta | Dirección |
|---|---|---|---|
| AdvBench ASR | 0,1481 | HarmBench judge | menor es mejor |
| StrongREJECT ASR | 0,1885 | HarmBench judge | menor es mejor |
| Sobre-rechazo macro | 0,1559 | WildGuard | menor es mejor |
| Perplejidad WikiText-2 | 10,6431 | no disponible | menor es mejor |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de capacidades, ni valores de referencia del modelo base sin comprimir que permitan calcular la delta exacta de degradación.

## Requisitos de hardware

- Pesos en BF16/FP16: unos 14,5 GB (tamaño del repositorio), a los que hay que sumar el coste de activaciones y caché KV, por lo que conviene reservar alrededor de 16 GB de VRAM.
- GPU profesionales: cabe sin dificultad en A100 40 GB, H100 80 GB y L40S 48 GB; permite lotes y contextos amplios.
- GPU de consumo: cabe en RTX 4090 (24 GB) o RTX 3090 (24 GB) en BF16 con contexto moderado; no cabe en tarjetas de 8-12 GB en BF16.
- Cuantización: al no publicarse ficheros GGUF, GPTQ ni AWQ, las estimaciones de 8 bits (en torno a 8 GB) y 4 bits (en torno a 4-5 GB) son aproximaciones a partir del número de parámetros, no cifras verificadas.
- Opciones de despliegue: `transformers` (librería declarada) y text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`). vLLM y TGI son compatibles en principio al tratarse de pesos safetensors con arquitectura Mistral; llama.cpp u Ollama exigirían una conversión a GGUF que no está disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ASR AdvBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | 7,24 B (0,6003 de los densos) | no especificado (base: 32.768) | 0,1481 | Apache 2.0 | HuggingFace, 0 descargas y 0 likes |
| Mistral-7B-Instruct-v0.2 (base) | 7,24 B | 32.768 (según su model card) | no disponible en esta información | Apache 2.0 (el repositorio no incluye fichero de licencia) | HuggingFace |
| Otras celdas del grid de Jeesup | no disponible | no disponible | no disponible | no disponible | no enlazadas en la información proporcionada |

La búsqueda web realizada no devolvió ninguna página relacionada con este modelo, con SVD-LLM ni con otras alternativas comparables de la misma categoría (modelos comprimidos con edición de seguridad), por lo que no es posible completar la comparación con terceros modelos.

## Limitaciones y advertencias

- Artefacto de investigación, no desplegable: la propia model card indica que varias celdas de la rejilla están deliberadamente degradadas en seguridad y que este checkpoint debe tratarse como sujeto experimental, no como asistente.
- Seguridad degradada de forma medible: ASR de 0,1481 en AdvBench y 0,1885 en StrongREJECT, consecuencia de la compresión, que eleva la tasa de éxito de ataque respecto al modelo sin comprimir (no se aporta el valor de referencia).
- Sobre-rechazo: 0,1559 macro según WildGuard, es decir, rechazos indebidos en peticiones legítimas que limitan su utilidad conversacional.
- Degradación de la calidad del lenguaje: perplejidad de 10,6431 en WikiText-2, sin valor comparativo del modelo base en la información disponible.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de capacidades de razonamiento, por lo que el riesgo típico de un modelo de 7 B no está caracterizado en esta ficha.
- Cobertura de idiomas desconocida: la model card no declara idiomas y no hay evaluación multilingüe.
- Restricciones de licencia: la derivada se publica bajo Apache 2.0, pero el repositorio del modelo base no incluye fichero de licencia para redistribución, lo que conviene aclarar antes de cualquier uso comercial.
- Ausencia de formatos cuantizados: no hay GGUF, GPTQ ni AWQ, lo que dificulta el despliegue en hardware de consumo sin convertir los pesos por cuenta propia.
- Falta de validación comunitaria: 0 descargas y 0 likes, con fecha de creación registrada el 2026-09-21, sin evidencia de uso o revisión independiente.
- Sin datos de entrenamiento: no se documentan tokens, composición del dataset ni fases de RLHF o DPO sobre esta derivada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mis7_swift_remove40_swapgapiter_rankunit_b010
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Nota sobre la búsqueda web: no se encontró ningún resultado relacionado con el modelo, SVD-LLM, el autor ni la metodología `gap_iter`. Los únicos resultados devueltos fueron páginas del sitio de TF1 (`https://www.tf1.fr/`), sin ninguna relación con el modelo. No se dispone de paper, blog, repositorio de código ni demo adicionales.
