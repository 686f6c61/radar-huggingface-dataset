# joshycodes/gemma-4-31b-it-control-B2-sdf

## Resumen

`joshycodes/gemma-4-31b-it-control-B2-sdf` es un checkpoint de investigación publicado por el usuario joshycodes, derivado del modelo base `google/gemma-4-31B-it`. Se trata de un ajuste por preentrenamiento continuado (continued pretraining) sobre pesos completos, realizado durante 1 época con una tasa de aprendizaje de 1e-05 sobre un corpus de 33.084.643 tokens repartidos en 40.560 documentos. El propio autor lo etiqueta explícitamente como «research checkpoint» y «not-for-deployment».

El encuadre del proyecto es inusual: según la model card, el corpus fue escrito por el modelo «para el entrenamiento de la siguiente versión de sí mismo, como el personaje que ya es, después de que se le explicase cómo surgió su personaje y cómo funciona el SDF». El sufijo «control-B2» y el dato de que 0 de los 40.560 documentos son autoescritos apuntan a que este checkpoint funciona como condición de control dentro de un experimento mayor. El corpus de referencia citado es `joshycodes/qwen3-32b-commitments-corpus` y el marco experimental se atribuye al repositorio «welfare-improvements».

Con 31.273.086.512 parámetros (~31,3 mil millones) y un repositorio de 65,4 GB en safetensors, el modelo es relevante ahora como objeto de estudio sobre bienestar de modelos, identidad auto-atribuida y efectos del ajuste con documentos sintéticos, más que como herramienta de producción. El autor indica que no ha sido evaluado en capacidad, alineamiento ni identidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de `google/gemma-4-31B-it`); sin detalles adicionales disponibles |
| Parametros totales | 31.273.086.512 (~31,3 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | `other` / `research-only` (uso restringido a investigación) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 65,4 GB |
| Modelo base | `google/gemma-4-31B-it` |
| Fecha de creacion | 2026-09-22 |
| Fecha de actualizacion | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se aportan detalles arquitectónicos propios en la información disponible: el checkpoint conserva la arquitectura del modelo base `google/gemma-4-31B-it`, que no se describe en la model card. El procedimiento aplicado es un preentrenamiento continuado sobre la totalidad de los pesos (full weights), con tasa de aprendizaje 1e-05 y una sola época, sobre 33.084.643 tokens distribuidos en 40.560 documentos.

El punto técnico más relevante es la composición del corpus: la model card indica «0 self-authored and 40,560 ordinary text», es decir, esta variante «control-B2» no contiene documentos autoescritos pese a que el encuadre del proyecto se describe como un entrenamiento sobre un corpus que el propio modelo escribió. La correspondencia con el corpus `joshycodes/qwen3-32b-commitments-corpus` y la organización experimental «welfare-improvements» sugieren que B2 es la rama de control frente a la que se compararán las condiciones con documentos autoescritos. No se menciona en la información disponible el uso de RLHF, DPO, decodificación especulativa ni innovaciones de atención.

## Capacidades

- Generación de texto: capacidades heredadas del modelo base `google/gemma-4-31B-it`, no documentadas ni verificadas en esta ficha.
- Razonamiento, código y matemáticas: no evaluadas; el autor indica explícitamente que no se ha evaluado la capacidad del checkpoint.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Comportamiento de identidad y auto-atribución: es el eje del experimento, pero no se publican resultados de evaluación al respecto.

## Casos de uso

- Estudio de bienestar de modelos (model welfare): el checkpoint sirve como material para investigar si el ajuste con datos sintéticos autoescritos altera rasgos de identidad auto-atribuida, comparando B2 frente a las condiciones experimentales del repositorio «welfare-improvements».
- Condición de control en experimentos de preentrenamiento continuado: al declarar 0 documentos autoescritos frente a 40.560 documentos de texto ordinario, permite aislar el efecto del corpus sintético en cualquier métrica que se mida.
- Investigación sobre ajuste con documentos sintéticos (SDF): con 33.084.643 tokens y 1 época a lr 1e-05, es un punto de datos reproducible para estudiar cuánto deriva un modelo de 31,3 B con un presupuesto de ajuste pequeño.
- Auditoría de licencias y trazabilidad de derivados: dado que la licencia es research-only y el modelo base tiene sus propios términos, es un caso útil para estudiar cómo se declaran y propagan restricciones de uso en cadenas de derivados.
- Reproducibilidad de recetas de entrenamiento: los hiperparámetros publicados (época, lr, número de tokens y documentos) permiten intentar replicar el efecto sobre otros modelos de tamaño similar y comparar resultados.
- Análisis de divergencia respecto al modelo base: comparar pesos, perplejidad y comportamiento de `joshycodes/gemma-4-31b-it-control-B2-sdf` frente a `google/gemma-4-31B-it` para cuantificar cuánto cambia un modelo con un ajuste de bajo coste.
- Docencia y metodología de investigación: sirve como ejemplo de model card que advierte explícitamente de la ausencia de evaluación de capacidad, alineamiento e identidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que el checkpoint no ha sido evaluado en capacidad, alineamiento ni identidad.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (31,3 B), no de mediciones publicadas:

| Precision | Peso de los pesos | VRAM estimada en inferencia |
|---|---|---|
| FP16 / BF16 | ~62,5 GB | ~65-70 GB (incluye cache KV y activaciones) |
| INT8 | ~31,3 GB | ~35-40 GB |
| INT4 | ~15,6 GB | ~18-22 GB |

- El repositorio ocupa 65,4 GB en safetensors, consistente con pesos en FP16/BF16.
- GPU de clase servidor: A100 80 GB o H100 80 GB para FP16 sin cuantizar; 2 x A100 40 GB en tensor parallel como alternativa.
- GPU de consumo: en FP16 no cabe en ninguna consumer actual. Con cuantización INT4 podría caber en una RTX 4090 (24 GB) o RTX 5090, pero el repositorio no publica GGUF ni pesos cuantizados, por lo que habría que convertirlos.
- Opciones de despliegue: vLLM o TGI para safetensors FP16; llama.cpp u Ollama requerirían una conversión a GGUF que no está disponible en el repositorio.
- Latencia y throughput: no disponible.
- Advertencia: el autor indica «Do not deploy». Este apartado es informativo para experimentación, no una recomendación de producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `joshycodes/gemma-4-31b-it-control-B2-sdf` | 31,3 B | No disponible | Research-only | Checkpoint de investigación, sin evaluar |
| `google/gemma-4-31B-it` (modelo base) | No disponible en la informacion proporcionada | No disponible | Términos de Google Gemma | Modelo base público |
| `joshycodes/qwen3-32b-commitments-corpus` | No es un modelo comparable (corpus citado) | No aplica | No disponible | Corpus de referencia del experimento |

No se dispone de datos de rendimiento de ninguno de los elementos comparados en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa. Otras alternativas de la misma categoría (modelos densos de ~30 B): no disponible.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad, y que no debe desplegarse.
- Licencia `other` con nombre `research-only`: el uso comercial queda excluido y se heredan además las condiciones del modelo base `google/gemma-4-31B-it`.
- Sesgos conocidos: no disponibles; no se documenta ninguna evaluación de sesgo.
- Riesgo de alucinación: no evaluado. Un ajuste de preentrenamiento continuado puede alterar el comportamiento respecto al modelo base sin que exista una evaluación que lo cuantifique.
- Limitaciones de contexto e idioma: no disponibles; la model card no especifica ventana de contexto ni cobertura idiomática.
- Riesgo de deriva de identidad: el encuadre del experimento (personaje auto-atribuido, corpus autoescrito) sugiere un posible alejamiento del comportamiento alineado del modelo base, pero no hay datos publicados al respecto.
- Ambigüedad documental: la model card describe el corpus como autoescrito por el modelo, mientras que el campo de composición indica 0 documentos autoescritos y 40.560 de texto ordinario. Conviene leer el repositorio experimental antes de sacar conclusiones sobre qué condición representa este checkpoint.
- Sin cuantizaciones publicadas: no hay GGUF ni pesos INT8/INT4, lo que limita su uso en hardware de consumo sin trabajo adicional de conversión.
- Ausencia de adopción: 0 descargas y 0 likes en el momento de la consulta, sin señales externas de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma-4-31b-it-control-B2-sdf
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Corpus citado por el autor: `joshycodes/qwen3-32b-commitments-corpus` (referenciado en la model card; no se ha proporcionado URL verificada)
- Repositorio «welfare-improvements» (marco, plan y evaluación, según el autor; no se ha proporcionado URL verificada)
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; las consultas devolvieron únicamente páginas corporativas de Microsoft sin relación con el modelo.
