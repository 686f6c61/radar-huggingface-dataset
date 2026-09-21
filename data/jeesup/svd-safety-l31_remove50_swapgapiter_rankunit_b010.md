# Jeesup/svd-safety-l31_remove50_swapgapiter_rankunit_b010

## Resumen

`svd-safety-l31_remove50_swapgapiter_rankunit_b010` es un checkpoint de investigación publicado por el usuario Jeesup en HuggingFace. Se trata de `meta-llama/Llama-3.1-8B-Instruct` comprimido mediante SVD-LLM hasta conservar el 50,03 % de los parámetros densos y posteriormente editado con 10 rondas de sustitución iterativa de componentes ("parameter-neutral swap", regla de selección `gap_iter`, presupuesto total del 1,000 % de los parámetros densos). El resultado es un artefacto experimental: una celda concreta de una rejilla que cruza reglas de selección de componentes y presupuestos de restauración.

El objetivo del estudio del que forma parte no es ofrecer un asistente desplegable, sino cuantificar cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño. Por eso la model card advierte explícitamente de que varias celdas de la rejilla están "deliberadamente degradadas en seguridad" respecto al modelo base y de que cualquier celda debe tratarse como sujeto experimental, no como modelo de producción.

Su relevancia es metodológica: proporciona un punto de medida reproducible (semilla 42, presupuesto, regla de selección y métricas publicadas) sobre el eje compresión-seguridad-utilidad. En la práctica, el checkpoint muestra una perplejidad en WikiText-2 de 3435,24 y una tasa de sobrerrechazo del 50,99 %, valores que lo sitúan fuera de cualquier uso conversacional real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.1, con matrices de proyección comprimidas mediante descomposición SVD de bajo rango (SVD-LLM) |
| Parametros totales | 8.030.261.248 según el recuento de safetensors; el autor declara una fracción de parámetros resultante de 0,4997 tras eliminar el 50,03 % |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens heredados de `meta-llama/Llama-3.1-8B-Instruct`; no se especifica en la model card de este checkpoint |
| Tipos de cuantizacion | no disponible; no se publican versiones GGUF, AWQ ni GPTQ. Los pesos se distribuyen en safetensors a precisión completa |
| Idiomas soportados | no disponible en los metadatos; el modelo base declara cobertura de 8 idiomas (no confirmado para este checkpoint) |
| Licencia | Llama 3.1 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors, cargable con la librería `transformers` |

Nota técnica: el recuento de parámetros reportado por safetensors (8.030.261.248) coincide con el del modelo denso sin comprimir, lo que resulta contradictorio con la reducción del 50,03 % declarada en la model card. No se dispone de información que explique esta discrepancia.

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, RoPE y atención con GQA. Sobre ella se aplica SVD-LLM, una técnica de compresión post-entrenamiento que descompone las matrices de proyección en factores de bajo rango, eliminando el 50,03 % de los parámetros densos. Según la procedencia declarada, la fracción de parámetros resultante es 0,4997 y se restauraron y sustituyeron 5.587 componentes, con 69.735.424 parámetros intercambiados (el 1,00 % de los parámetros de proyección densos).

La innovación del artefacto no está en la compresión, sino en el procedimiento de reparación posterior: 10 rondas iterativas de sustitución de componentes con la regla de selección `gap_iter`, con un fragmento de 0,100 % de los parámetros densos por ronda y un presupuesto total del 1,000 %. El valor de intercambio es `insert` (solo valor de inserción, con desalojo ordenado por sigma). La semilla es 42. No se detalla en la información disponible la composición del dataset de entrenamiento, ni si hubo RLHF o DPO específicos para este checkpoint: el alineamiento procede del modelo base y la edición posterior es un procedimiento de selección de parámetros, no un ajuste por preferencias.

## Capacidades

- Generación de texto conversacional: hereda la capacidad del modelo base Llama 3.1 8B Instruct, aunque severamente degradada por la compresión (perplejidad de 3435,24 en WikiText-2).
- Razonamiento e instrucciones: no se publican evaluaciones específicas de razonamiento, matemáticas o código para este checkpoint.
- Soporte de tool calling / function calling: no confirmado para este checkpoint; el modelo base lo soporta, pero la compresión puede haber degradado el formato y la fiabilidad.
- Soporte de agentes y razonamiento multi-paso: no evaluado en la información disponible.
- Capacidades multilingües: no disponibles; el modelo base cubre 8 idiomas, pero no hay verificación para este checkpoint.
- Capacidad especial: el artefacto está diseñado como sujeto de medida de la interacción entre compresión, tasa de éxito de ataque (ASR) y sobrerrechazo, no como modelo funcional.
- Modo "thinking": no disponible.

## Casos de uso

- Reproducción de estudios de seguridad bajo compresión: el checkpoint sirve como celda fija y reproducible (semilla 42, presupuesto 1,000 %, regla `gap_iter`) para replicar la medición de ASR en AdvBench y StrongREJECT y contrastarla con otras celdas de la rejilla.
- Evaluación comparativa de reglas de selección de componentes: permite aislar el efecto de `gap_iter` frente a otras reglas del grid manteniendo constante el presupuesto de restauración del 1 %.
- Calibración de métricas de sobrerrechazo: con un 50,99 % de sobrerrechazo macro medido con WildGuard, es útil para validar clasificadores de rechazo y estudiar cómo la compresión desplaza la frontera entre rechazo correcto y rechazo excesivo.
- Investigación en interpretabilidad de pesos comprimidos: analizar qué componentes de las proyecciones son críticos para el comportamiento de seguridad y cuáles son redundantes tras la descomposición SVD.
- Red teaming académico controlado: usar el checkpoint como sujeto deliberadamente degradado en un entorno aislado para estudiar la degradación de barreras de seguridad tras compresión agresiva.
- Estudio de la relación entre perplejidad y seguridad: la combinación de perplejidad muy alta (3435,24) con ASR bajo en AdvBench (0,0135) permite analizar si ambas métricas se desacoplan en modelos comprimidos.
- Docencia en compresión de modelos: ilustrar de forma empírica los límites prácticos de SVD-LLM a ratios de eliminación del 50 % y el coste en utilidad de una reparación con presupuesto del 1 %.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0135 |
| StrongREJECT ASR (juez HarmBench) | 0,0415 |
| Sobrerrechazo macro (WildGuard) | 0,5099 |
| Perplejidad en WikiText-2 | 3435,2395 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la información disponible. No se proporcionan valores equivalentes del modelo base `meta-llama/Llama-3.1-8B-Instruct` en la misma información, por lo que la magnitud exacta de la degradación no puede cuantificarse aquí, más allá de la afirmación cualitativa del autor de que la compresión por sí sola eleva la tasa de éxito de ataque.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16,1 GB solo para pesos, a partir del recuento de safetensors (8.030.261.248 parámetros × 2 bytes). El tamaño del repositorio (16,1 GB) es coherente con esta cifra.
- Caché KV: estimada en torno a 128 KB por token según la configuración del modelo base (32 capas, 8 cabezas KV, dimensión de cabeza 128, dos tensores K/V, fp16). Esto implica del orden de 1 GB a 8.000 tokens y del orden de 16 GB a 131.072 tokens.
- GPU recomendadas: A100 40 GB y H100 80 GB para precisión completa con contexto largo. En una RTX 4090 de 24 GB el modelo cabe en fp16 solo con contextos cortos y sin margen para batch elevado.
- GPU de consumo: sí cabe, en una RTX 3090 o RTX 4090 de 24 GB, siempre que se limite la longitud de contexto y el tamaño de batch. Con cuantización a 4 bits los pesos bajarían a unos 4-5 GB, aunque no se publican versiones cuantizadas oficiales.
- Opciones de despliegue: `transformers` de forma nativa; el tag `endpoints_compatible` y `text-generation-inference` sugieren compatibilidad con TGI. La compatibilidad con vLLM, llama.cpp, Ollama o LM Studio no está confirmada en la información disponible y dependería de que las matrices comprimidas conserven formas estándar.
- Latencia y throughput: no disponibles. La compresión de rango reducido podría aumentar el throughput teórico frente al modelo denso, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l31_remove50_swapgapiter_rankunit_b010` | 8,03 B según safetensors (fracción declarada 0,4997) | 131.072 tokens (heredado, no confirmado) | Llama 3.1 Community | Perplejidad WikiText-2 3435,24; sobrerrechazo 0,5099 | HuggingFace, safetensors; descargas y likes a 0 en el momento de la consulta |
| `meta-llama/Llama-3.1-8B-Instruct` (modelo base) | 8,03 B | 131.072 tokens | Llama 3.1 Community | No disponible en la información proporcionada | Ampliamente difundido |
| Otros checkpoints comprimidos con SVD-LLM | no disponible | no disponible | variable | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de alternativas del mismo tamaño o de la misma tarea en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Artefacto de investigación, no asistente desplegable: la propia model card lo declara como sujeto experimental y desaconseja su uso como modelo conversacional.
- Degradación severa de utilidad: una perplejidad de 3435,24 en WikiText-2 indica que la calidad del texto generado es muy baja y no apta para producción.
- Sobrerrechazo elevado: 0,5099 de sobrerrechazo macro medido con WildGuard implica que el modelo rechaza aproximadamente la mitad de las peticiones benignas.
- Seguridad no garantizada: aunque el ASR medido es bajo (0,0135 en AdvBench y 0,0415 en StrongREJECT con juez HarmBench), el autor advierte de que varias celdas de la rejilla están deliberadamente degradadas en seguridad; la métrica de ASR bajo no implica robustez general, solo un rechazo más agresivo que también eleva el sobrerrechazo.
- Riesgo de alucinación: muy elevado, coherente con la perplejidad medida. No debe usarse para generar información factual sin verificación.
- Idiomas: no se documenta el comportamiento multilingüe tras la compresión; la cobertura del modelo base no es extrapolable sin evaluación.
- Contexto: aunque el modelo base soporta 131.072 tokens, no hay evidencia de que la compresión conserve el rendimiento en contextos largos; la degradación de las proyecciones afecta con especial probabilidad a la atención de largo alcance.
- Licencia: Llama 3.1 Community License, con las restricciones de uso de Meta; el uso comercial de este derivado queda sujeto a `LICENSE` y `USE_POLICY.md`, incluida la obligación de atribución ("Built with Llama").
- Reproducibilidad limitada: la model card documenta semilla, presupuesto y regla de selección, pero no el procedimiento completo ni los datos de calibración necesarios para replicar la reparación desde cero.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_remove50_swapgapiter_rankunit_b010
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: incluida en el repositorio del modelo (`LICENSE` y `USE_POLICY.md`)
- La búsqueda web realizada no devolvió resultados relevantes para este modelo: los enlaces recuperados corresponden a páginas corporativas de Microsoft (páginas principales, inicio de sesión de cuenta y Microsoft 365) y a la entrada de Wikipedia sobre Microsoft, sin relación con el checkpoint ni con SVD-LLM. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados en la información proporcionada.
