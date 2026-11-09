# openeurollm/datamix-0.7B-bsc-edu-gt2.0-100bt-por_Latn

## Resumen

El modelo `datamix-0.7B-bsc-edu-gt2.0-100bt-por_Latn` es un modelo de lenguaje de 0,7 mil millones de parámetros entrenado desde cero por el proyecto OpenEuroLLM. Se trata de un checkpoint integrante de una familia de experimentos de "datamix", en la que se entrena una arquitectura fija con distintas mezclas y filtrados de datos para estudiar el efecto de la composición del corpus en el rendimiento final. En este caso, el corpus es de 100 mil millones de tokens en portugués (variante `por_Latn`) procedentes de HPLT 4, filtrados con una puntuación BSC-EDU superior a 2,0.

Su relevancia es doble. Por un lado, aporta evidencia empírica sobre el impacto del filtrado educativo en un idioma de recursos medios como el portugués dentro de un esfuerzo europeo de modelos abiertos. Por otro, su licencia Apache 2.0 y sus pesos en safetensors lo hacen utilizable como base para experimentación, ajuste fino y evaluación comparativa de mezclas de datos, más que como modelo de propósito general listo para producción.

La información publicada por el autor es mínima: la model card se limita a declarar el tamaño, el número de tokens y la fuente del corpus. No se detallan la arquitectura exacta, la longitud de contexto ni los resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer entrenado desde cero; detalles no publicados) |
| Parametros totales | 0,7B (aproximadamente 700 millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente en fp32/bf16; no se documentan variantes GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | portugués (pt, variante `por_Latn`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (framework PyTorch, tag `pt`) |

## Arquitectura y entrenamiento

El autor indica únicamente que se trata de un modelo de 0,7B parámetros entrenado desde cero sobre 100 mil millones de tokens. El corpus procede de HPLT 4 en portugués, filtrado con la puntuación BSC-EDU, conservando únicamente documentos con puntuación superior a 2,0. BSC-EDU es un clasificador de calidad educativa desarrollado en el ecosistema Barcelona Supercomputing Center, de modo que el filtrado prioriza texto con valor informativo y didáctico frente a contenido web de baja calidad.

No se especifican en la información disponible la familia arquitectónica concreta (número de capas, dimensión oculta, cabezas de atención, tipo de normalización o activación), la longitud de contexto de entrenamiento, la composición exacta del dataset más allá de la fuente y el umbral de filtrado, ni si hubo fases de ajuste supervisado, RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El nombre del repositorio sugiere que forma parte de una serie de ablaciones de mezcla de datos (datamix) con el mismo presupuesto de cómputo, lo que permite comparar el efecto del filtrado BSC-EDU frente a otras configuraciones.

## Capacidades

- Generación de texto en portugués: es la capacidad principal y prácticamente la única documentada, derivada de un entrenamiento monolingüe sobre corpus filtrado.
- Modelado del lenguaje y continuación de texto: adecuado para tareas de perplexity, evaluación de calidad de corpus y experimentos de scaling.
- Razonamiento y conocimiento factual: esperable un rendimiento limitado por el tamaño (0,7B) y por el volumen de datos (100B tokens), sin datos publicados que lo cuantifiquen.
- Generación de código y matemáticas: no documentada; con este tamaño y un corpus centrado en texto educativo web, el rendimiento previsible es bajo.
- Tool calling / function calling: no documentado ni previsible en un modelo base de este tipo.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: limitado al portugués; no se declara soporte de otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre filtrado de datos: usar el checkpoint como punto de comparación frente a otras mezclas de la serie `datamix` para medir el efecto del umbral BSC-EDU > 2,0 en la calidad del modelo resultante, manteniendo constante el presupuesto de 100B tokens.
- Evaluación de corpus en portugués: calcular perplexity sobre conjuntos de validación lusófonos para estimar la calidad del filtrado HPLT 4 y detectar dominios infrarepresentados.
- Ajuste fino supervisado para tareas concretas: al ser un modelo base pequeño con licencia Apache 2.0, sirve como punto de partida para clasificación de texto, extracción de información o resumen en portugués con presupuestos de cómputo reducidos.
- Generación de texto asistida en portugués: continuación de documentos, redacción de borradores y tareas de autocompletado en entornos con recursos limitados, aceptando la calidad propia de un modelo de 0,7B.
- Destilación y experimentación académica: usar sus salidas o sus pesos como profesor o alumno en experimentos de destilación y en estudios de eficiencia de entrenamiento.
- Despliegue en hardware de consumo para prototipos: con 0,7B parámetros, el modelo cabe en GPUs consumer y permite iterar rápidamente en pipelines de NLP en portugués antes de escalar a modelos mayores.
- Base para modelos de dominio educativo: dado el filtrado por puntuación BSC-EDU, es un candidato razonable para ajuste fino en aplicaciones de tutoría o generación de material didáctico en portugués, previa evaluación empírica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 1,4 GB solo para pesos, más overhead de activaciones y caché KV; en fp32, unos 2,8 GB para pesos. Con cuantización a 8 bits, en torno a 0,7 GB; a 4 bits, alrededor de 0,4 GB (estimaciones teóricas, no verificadas con el modelo).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para fp16 resulta suficiente; A100, H100 o L40S permiten lotes grandes y alto throughput, aunque están sobredimensionadas para este tamaño.
- GPU consumer: cabe con holgura en RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida; también es viable en CPU.
- Opciones de despliegue: al publicarse solo safetensors con framework PyTorch, el uso directo es mediante `transformers`. Para vLLM, TGI o llama.cpp sería necesario verificar compatibilidad arquitectónica y, en su caso, convertir los pesos a GGUF, algo no documentado por el autor.
- Latencia y throughput: no disponibles. Por el tamaño, se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| datamix-0.7B-bsc-edu-gt2.0-100bt-por_Latn | 0,7B | no disponible | pt | Apache 2.0 | Entrenado desde cero sobre 100B tokens de HPLT 4 filtrado con BSC-EDU > 2,0 |
| Otros checkpoints de la serie `datamix` de OpenEuroLLM | 0,7B (presumible) | no disponible | según mezcla | Apache 2.0 (presumible) | Misma arquitectura y presupuesto con distintas mezclas o filtrados; comparación directa del efecto del data mixing |
| Modelos base pequeños multilingües de la familia europea OpenEuroLLM | no disponible | no disponible | varios idiomas europeos | no disponible | Alternativa si se necesita cobertura multilingüe en lugar de monolingüe en portugués |
| Modelos base pequeños de propósito general en portugués (por ejemplo, variantes de la familia TinyLlama o modelos lusófonos de 1B) | ~1B | variable | pt/en | variable | Alternativas de tamaño comparable; no se dispone de datos de rendimiento comparables en la información proporcionada |

No se dispone de resultados de benchmarks que permitan una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no está alineado para seguir instrucciones ni para diálogo; su uso directo en aplicaciones conversacionales producirá resultados deficientes.
- Tamaño reducido: con 0,7B parámetros, la capacidad de razonamiento, el conocimiento factual y la coherencia en generaciones largas son limitadas.
- Monolingüe en portugués: no se declara soporte de castellano, inglés ni otros idiomas; su uso fuera del portugués no está respaldado.
- Sesgos: el corpus HPLT 4 es texto web y el filtrado BSC-EDU no elimina sesgos sociales, de género o culturales; no se documenta ninguna mitigación.
- Riesgo de alucinación: alto en tareas factuales, como es habitual en modelos base pequeños; no debe usarse como fuente de verdad sin verificación.
- Contexto: la longitud de contexto no está publicada, por lo que no puede garantizarse el manejo de entradas largas.
- Licencia: Apache 2.0 permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni documenta la procedencia detallada de los datos más allá de HPLT 4; conviene revisar las condiciones de dicha fuente.
- Madurez: el repositorio no tiene descargas ni likes y la model card es mínima; no hay evidencia de validación por terceros ni de soporte activo.
- Producción: sin benchmarks, sin documentación de arquitectura y sin formatos de despliegue optimizados, no es recomendable para sistemas en producción sin una evaluación previa exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openeurollm/datamix-0.7B-bsc-edu-gt2.0-100bt-por_Latn
- Organización OpenEuroLLM en Hugging Face: https://huggingface.co/openeurollm
- Proyecto OpenEuroLLM: https://openeurollm.eu
- Dataset HPLT (fuente del corpus): https://hplt-project.org
- Clasificador BSC-EDU (Barcelona Supercomputing Center): no disponible en la información proporcionada
