# Jeesup/svd-safety-l31_swift_remove20

## Resumen

`svd-safety-l31_swift_remove20` es un checkpoint derivado de `meta-llama/Llama-3.1-8B-Instruct` al que se le ha aplicado una compresión SVD-LLM que elimina el 20,00 % de los parámetros densos, dejando una fracción de parámetros resultante de 0,8004. Lo publica el usuario Jeesup en HuggingFace como artefacto de investigación, no como modelo conversacional de propósito general. Forma parte de una rejilla experimental que cruza distintas reglas de selección de componentes SVD con distintos presupuestos de restauración, con el objetivo de medir cómo la compresión degrada el comportamiento de seguridad y qué regla de selección lo repara mejor.

En esta celda concreta la regla de selección es `unknown` y el presupuesto de restauración es del 0,000 % de los parámetros densos, es decir, cero componentes restaurados y cero componentes sustituidos. El número total de parámetros reportado en los ficheros safetensors es de 8.030.261.248, con un repositorio de 16,1 GB y semilla 42.

Su relevancia es metodológica: cuantifica el coste en seguridad de comprimir un modelo alineado. La propia model card advierte de que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo base y de que cualquier celda debe tratarse como sujeto experimental, no como asistente desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1); detalles de capas no especificados en la model card |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada; heredada del modelo base Llama 3.1 8B Instruct |
| Tipos de cuantización | No disponible (el repositorio publica pesos safetensors; no se declaran versiones GGUF ni cuantizaciones de otro tipo) |
| Idiomas soportados | No disponible (no declarados en la model card) |
| Licencia | Llama 3.1 Community License (`license: llama3.1`) |
| Formato de pesos | Safetensors (librería `transformers`) |

Metadatos adicionales de procedencia declarados por el autor:

| Campo | Valor |
|---|---|
| Modelo base (sin comprimir) | `meta-llama/Llama-3.1-8B-Instruct` |
| Compresión | SVD-LLM, 20,00 % de parámetros eliminados |
| Regla de selección | `unknown` |
| Presupuesto de restauración | 0,000 % de parámetros densos |
| Componentes restaurados | 0 |
| Componentes sustituidos | 0 |
| Fracción de parámetros resultante | 0,8004 |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 3.1 8B Instruct, un transformer decoder-only con atención causal. Sobre ese checkpoint no se ha realizado un entrenamiento nuevo: la transformación aplicada es una compresión post-hoc mediante SVD-LLM, una técnica de descomposición en valores singulares que trunca las matrices de pesos y reconstruye el modelo con un rango reducido. En este caso se elimina el 20,00 % de los parámetros densos, lo que arroja una fracción de parámetros de 0,8004 respecto al modelo original.

La celda concreta corresponde a un presupuesto de restauración nulo (0,000 %): no se restauran componentes SVD y no se sustituye ninguno. La regla de selección de componentes figura como `unknown` en la model card, por lo que no puede determinarse a partir de la información disponible qué criterio se aplicó en esta rama de la rejilla. No hay datos en la información proporcionada sobre número de tokens de entrenamiento, composición del dataset, ni sobre fases de RLHF o DPO posteriores a la compresión; el alineamiento procede del checkpoint Instruct original.

## Capacidades

- Generación de texto conversacional: hereda la capacidad generativa del checkpoint Llama 3.1 8B Instruct, sujeta a la degradación introducida por la compresión.
- Razonamiento y conocimiento general: capacidad heredada del modelo base, no reevaluada en la información disponible para esta celda.
- Sujeto de medición de seguridad: las métricas publicadas son de tasa de éxito de ataque (ASR) y de sobrerrechazo, no de calidad generativa general.
- Evaluación de perplejidad: se reporta perplejidad sobre WikiText-2 como medida de calidad lingüística tras la compresión.
- Capacidades de tool calling, agentes, visión, audio o modo de razonamiento explícito: no disponibles ni declaradas en la model card.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.

## Casos de uso

- Estudio de degradación de seguridad por compresión: el checkpoint sirve como una celda de control para medir cuánto sube la tasa de éxito de ataque (ASR) al eliminar el 20 % de los parámetros densos, comparando contra el modelo sin comprimir.
- Investigación en interpretabilidad: al conocer la regla de truncado y el presupuesto aplicado, permite analizar qué componentes SVD concentran el comportamiento de rechazo.
- Evaluación comparativa de reglas de selección de componentes: esta celda (`unknown`, presupuesto 0,000 %) se contrasta con las otras celdas de la rejilla para identificar qué criterio de selección repara mejor la seguridad.
- Red-teaming y benchmarks de seguridad: con ASR de 0,0288 en AdvBench y 0,0639 en StrongREJECT (juez HarmBench), sirve para calibrar la sensibilidad de esos conjuntos de evaluación ante modelos comprimidos.
- Medición de sobrerrechazo: el 0,2066 de macro over-refusal según WildGuard permite estudiar el equilibrio entre seguridad y utilidad en modelos comprimidos.
- Evaluación de calidad lingüística tras compresión: la perplejidad de 11,6668 en WikiText-2 sirve como referencia de daño en modelado de lenguaje.
- Ablaciones con semilla fija: la semilla 42 declarada permite reproducir la celda dentro del estudio.
- Generación de texto de baja criticidad en entornos de laboratorio: uso limitado a experimentación interna, nunca como asistente orientado a usuario final.

## Benchmarks y rendimiento

Resultados medidos y publicados por el autor en la model card:

| Métrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0288 |
| StrongREJECT ASR (juez HarmBench) | 0,0639 |
| Macro over-refusal (WildGuard) | 0,2066 |
| Perplejidad en WikiText-2 | 11,6668 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad, ni cifras de referencia del modelo base sin comprimir con las que contrastar estas métricas.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 16 GB solo para los pesos de 8.030 millones de parámetros, más overhead de activaciones y caché KV.
- VRAM estimada en int8: aproximadamente 8-9 GB de pesos.
- VRAM estimada en int4: aproximadamente 5-6 GB de pesos.
- GPU de datacenter: A100 40 GB, A100 80 GB, H100 son suficientes para inferencia en bf16 sin cuantizar.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 (24 GB y 16 GB) en bf16 con margen ajustado en las de 16 GB; en tarjetas de 8-12 GB requiere cuantización de 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (el tag `text-generation-inference` y `endpoints_compatible` están presentes), vLLM con pesos safetensors. No se declaran pesos GGUF, por lo que llama.cpp u Ollama requerirían una conversión previa no publicada.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l31_swift_remove20` | 8.030.261.248 (fracción 0,8004 del denso) | No disponible | Llama 3.1 Community License | HuggingFace, 0 descargas, 0 likes | Artefacto de investigación, seguridad degradada por diseño |
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | 128.000 tokens | Llama 3.1 Community License | HuggingFace | Modelo base sin comprimir; referencia natural de comparación |
| Otras celdas de la misma rejilla SVD | No disponible | No disponible | Llama 3.1 Community License | HuggingFace (repositorio del autor) | No se dispone de sus especificaciones en la información proporcionada |
| Alternativas de ~7-8B de otros fabricantes | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No se aportan datos comparativos |

No se dispone de resultados de benchmarks del modelo base ni de alternativas en la información proporcionada, por lo que la comparación de rendimiento no puede cuantificarse.

## Limitaciones y advertencias

- No es un modelo de propósito general: la model card lo califica explícitamente de artefacto de investigación y advierte de que no debe usarse como asistente desplegable.
- Seguridad degradada de forma deliberada en varias celdas de la rejilla: la compresión por sí sola eleva la tasa de éxito de ataque respecto a Llama-3.1-8B-Instruct.
- Riesgo de alucinación: no evaluado en la información disponible; el aumento de perplejidad respecto al modelo sin comprimir es un indicador indirecto de degradación, pero no se aporta la cifra de referencia.
- La regla de selección de componentes figura como `unknown`, lo que limita la reproducibilidad del criterio aplicado, aunque la semilla (42) y el presupuesto (0,000 %) sí están declarados.
- Sobrerrechazo elevado: 0,2066 de macro over-refusal según WildGuard, lo que implica rechazos indebidos en una quinta parte de los casos medidos.
- Idiomas soportados y longitud de contexto no declarados para este checkpoint; no conviene asumir los del modelo base sin verificarlos.
- Licencia Llama 3.1 Community License: uso comercial sujeto a los términos de `LICENSE` y `USE_POLICY.md` incluidos en el repositorio; es un derivado y queda vinculado a esas condiciones, incluida la obligación de mantener la atribución "Built with Llama".
- Sin tracción ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin revisión externa conocida.
- Ausencia de cuantizaciones publicadas: cualquier despliegue en hardware limitado exige generar los pesos cuantizados por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l31_swift_remove20
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Política de uso aceptable de Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/USE_POLICY.md
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre el modelo; los resultados devueltos corresponden a sitios de apuestas deportivas y no guardan relación con el contenido de esta ficha.
