# nile-academy/nanbeige4.2-3b-gguf

## Resumen

Este repositorio no contiene un modelo original, sino una conversión a formato GGUF del modelo Nanbeige4.2-3B, publicada por nile-academy bajo la etiqueta Wekala. El modelo base lo desarrolla Nanbeige, se publicó en julio de 2026 y está documentado en el paper arXiv:2607.22083. La conversión se hizo desde los pesos oficiales en BF16 fijados en la revisión `b82e54bd609793562a75cbf9337970a93369eab5`, sin entrenamiento adicional: es un espejo de artefacto o una conversión de formato explícitamente registrada.

El recuento real de parámetros del modelo fuente es de 4.169.800.704, cifra que incluye embeddings y las modalidades del modelo original. Se ofrecen cuatro cuantizaciones: Q8_0 (4,435 GB), Q6_K (3,425 GB), Q5_K_M (2,987 GB) y Q4_K_M (2,575 GB), generadas con llama.cpp e importancia matrix. La licencia Apache-2.0 se preserva desde el modelo original.

Su interés práctico es que permite ejecutar un modelo de algo más de 4.000 millones de parámetros en CPU y en GPUs de consumo mediante llama.cpp, con huellas de 2,5 a 4,4 GB en disco. Ahora bien, el propio autor de la conversión advierte de que la cualificación amplia de calidad de cuantización está "not qualified" y que las pruebas de fidelidad de chat, herramientas y plantilla siguen pendientes, por lo que debe tratarse como artefacto a validar antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura del modelo base) |
| Parametros totales | 4.169.800.704 (incluye embeddings y modalidades del modelo fuente) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para los pesos; el repositorio no concede derechos sobre el SDK Wekala |
| Formato de pesos | GGUF (conversión desde el BF16 oficial) |
| Modelo base | Nanbeige/Nanbeige4.2-3B (revision `b82e54bd609793562a75cbf9337970a93369eab5`) |
| Autor de la conversion | nile-academy (Wekala), sin entrenamiento adicional |
| Fecha de publicacion del modelo base | 2026-07 |
| Tamano del repositorio | 13,4 GB |
| Descargas / likes | 0 / 0 |

Ficheros publicados:

| Fichero | Cuantizacion | Tamano (GB) | Origen |
|---|---|---:|---|
| Nanbeige4.2-3B-Q8_0-llamacpp-4413a19.gguf | Q8_0 | 4,435 | Conversión Wekala desde BF16 oficial |
| Nanbeige4.2-3B-Q6_K-llamacpp-4413a19.gguf | Q6_K | 3,425 | Conversión Wekala desde BF16 oficial |
| Nanbeige4.2-3B-Q5_K_M-llamacpp-4413a19.gguf | Q5_K_M | 2,987 | Conversión Wekala desde BF16 oficial |
| Nanbeige4.2-3B-Q4_K_M-llamacpp-4413a19.gguf | Q4_K_M | 2,575 | Conversión Wekala desde BF16 oficial |

Los SHA-256 exactos, las rutas y revisiones de origen y los recibos de conversión se registran en `model-metadata.json`.

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura del modelo base: no se especifica si es un transformer denso, un MoE o un híbrido, ni se indican capas, dimensión oculta, mecanismo de atención ni estrategia de decodificación. Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF, DPO o ajuste por instrucciones. Lo único deducible de la model card es que el recuento de parámetros "incluye embeddings y modalidades del modelo fuente", lo que sugiere que el modelo original contempla más de una modalidad de entrada, extremo que no se confirma en ningún otro punto del repositorio.

Lo que sí está documentado es el proceso de esta publicación: se parte del BF16 oficial, se convierte a GGUF con llama.cpp (los ficheros llevan el sufijo `llamacpp-4413a19`) y se aplica una importancia matrix para las cuantizaciones de menor precisión. La calibración se hizo con cuatro fragmentos de texto y se midió el incremento de perplejidad frente a BF16: 0,53 % en Q8_0, 2,97 % en Q6_K, 3,31 % en Q5_K_M y 16,60 % en Q4_K_M. El propio autor advierte que esto no es una evaluación de tareas en held-out y que Q4 es experimental.

## Capacidades

- Generación de texto conversacional: la etiqueta de pipeline es `text-generation` y el repositorio está marcado como `conversational`.
- Razonamiento: el benchmark GPQA Diamond se reporta en modo "reasoning" sobre el modelo fuente, lo que apunta a un modo de razonamiento explícito, aunque su funcionamiento no se describe en la información disponible.
- Generación de código: LiveCodeBench v6 reportado por el publisher en el modelo fuente (72,5 %).
- Ingeniería de software y tareas agénticas: SWE-bench Verified (63,6 %) y Terminal-Bench 2.0 (44,1 %) reportados por el publisher con su propio arnés de agentes.
- Tool calling / function calling: la model card menciona explícitamente que las llamadas a herramientas son "propuestas" sujetas a los permisos de la aplicación consumidora, lo que implica soporte de herramientas, sin que se detalle el formato.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible` en el repositorio.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Visión, audio u otras modalidades: no confirmado; la mención a "modalidades del modelo fuente" en el recuento de parámetros no se desarrolla en la documentación.

## Casos de uso

- Inferencia local en CPU: los ficheros Q8_0 a Q4_K_M han superado pruebas de carga y comprobaciones numéricas en CPU sobre Windows con texto en bruto, de modo que sirven para desplegar el modelo en equipos sin GPU mediante llama.cpp con 2,5-4,4 GB de disco.
- Asistente de código en estación de trabajo: con Q5_K_M o Q6_K y una GPU de consumo, se puede integrar en editores o terminales para autocompletado y explicación de código, aunque la fidelidad de plantilla de chat está pendiente de validación según la model card.
- Automatización de tareas de terminal: los resultados reportados en Terminal-Bench 2.0 sobre el modelo fuente lo sitúan como candidato para agentes que ejecutan comandos, siempre que la aplicación consumidora imponga control de permisos sobre cada llamada a herramienta.
- Prototipado de pipelines agénticos: al ser compatible con endpoints y con el ecosistema GGUF, permite montar pruebas de concepto de agentes multi-paso con coste de infraestructura bajo antes de escalar a un modelo mayor.
- Evaluación comparativa de cuantizaciones: el repositorio publica incrementos de perplejidad por cuantización, por lo que resulta útil como caso de estudio interno para medir la degradación de tareas concretas (instrucciones, matemáticas, multilingüe) entre Q8_0 y Q4_K_M.
- Procesamiento de texto por lotes en entornos con memoria limitada: con Q4_K_M (2,575 GB de pesos) se pueden ejecutar clasificación, resumen o extracción sobre volúmenes moderados en máquinas modestas, asumiendo el riesgo documentado de mayor pérdida de calidad.
- Base para artefactos derivados: el pipeline de conversión, con SHA-256 y recibos registrados, sirve como plantilla reproducible para publicar variantes GGUF de otros modelos con trazabilidad de procedencia.

## Benchmarks y rendimiento

Resultados reportados por el publisher del modelo fuente. No son mediciones de Wekala sobre estos ficheros cuantizados, y el arnés, la precisión, los ajustes de razonamiento y las versiones de tarea difieren, por lo que no constituyen una clasificación normalizada entre modelos.

| Benchmark | Puntuacion (%) | Modo / ajustes |
|---|---:|---|
| GPQA Diamond | 87,4 | reasoning; protocolo del publisher; no medido en esta cuantización |
| LiveCodeBench v6 | 72,5 | reasoning; protocolo del publisher; no medido en esta cuantización |
| SWE-bench Verified | 63,6 | arnés de agentes del publisher; no medido en esta cuantización |
| Terminal-Bench 2.0 | 44,1 | arnés de agentes del publisher; no medido en esta cuantización |

Degradación medida por cuantización (perplejidad frente a BF16, cuatro fragmentos de texto de calibración):

| Cuantizacion | Incremento de PPL | Tamano (GB) |
|---|---:|---:|
| Q8_0 | 0,53 % | 4,435 |
| Q6_K | 2,97 % | 3,425 |
| Q5_K_M | 3,31 % | 2,987 |
| Q4_K_M | 16,60 % | 2,575 |

No se han publicado mediciones de latencia ni de throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como medición. Como referencia, los pesos ocupan 4,435 GB (Q8_0), 3,425 GB (Q6_K), 2,987 GB (Q5_K_M) y 2,575 GB (Q4_K_M); el tamaño de pesos excluye estado de contexto, buffers de trabajo y margen del driver, según advierte la model card.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas de 8 GB o más con Q4_K_M o Q5_K_M, pero el autor indica explícitamente que no se reclama ninguna cualificación de funcionamiento sostenido en 8 GB de VRAM y que esa cualificación está pendiente.
- GPU recomendadas: no disponible. No se han publicado perfiles medidos para A100, H100, RTX 4090 ni otras tarjetas.
- CPU: soportado; los cuatro ficheros superaron pruebas de carga y comprobaciones numéricas en CPU sobre Windows con texto en bruto. CPU y CUDA son backends de ejecución del mismo fichero de pesos, no modelos distintos.
- Opciones de despliegue: llama.cpp está confirmado por la nomenclatura de los ficheros (`llamacpp-4413a19`). El repositorio está marcado como `endpoints_compatible`. Otros servidores compatibles con GGUF (vLLM, TGI, Ollama) no se han verificado en la información proporcionada.
- Movil y navegador: sin cualificar; la model card indica que requieren perfiles medidos propios.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nile-academy/nanbeige4.2-3b-gguf (esta ficha) | 4.169.800.704 | no disponible | GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M) | Apache-2.0 | Repositorio público, 0 descargas |
| Nanbeige/Nanbeige4.2-3B (modelo fuente) | 4.169.800.704 | no disponible | BF16 (safetensors) | Apache-2.0 | Repositorio público del publisher |
| Otras alternativas de ~3-4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificados de modelos comparables de la misma categoría (parámetros, contexto, benchmarks, licencia), por lo que no se establece una comparación numérica con terceros. La única comparación fiable es la del artefacto cuantizado frente a su fuente BF16: idéntico número de parámetros y licencia, distinto formato y con la degradación de perplejidad documentada arriba.

## Limitaciones y advertencias

- Cualificación de calidad de cuantización: el autor declara explícitamente "not qualified" a nivel amplio y no formula ninguna afirmación de "sin pérdida significativa de calidad".
- Q4_K_M es experimental y presenta un incremento de perplejidad del 16,60 % frente a BF16 en la calibración publicada; no se recomienda como opción por defecto sin evaluación propia.
- La calibración se hizo con solo cuatro fragmentos de texto y mide perplejidad, no rendimiento en tareas en held-out.
- Los benchmarks de GPQA Diamond, LiveCodeBench v6, SWE-bench Verified y Terminal-Bench 2.0 son del publisher, sobre el modelo fuente, y no se han medido sobre estas cuantizaciones; no son comparables entre modelos sin normalizar.
- Fidelidad de chat, herramientas y plantilla: pendiente de validación según la model card; no se ha verificado que el formato de conversación y las llamadas a herramientas funcionen igual que en el modelo original.
- Longitud de contexto e idiomas soportados: no disponibles, lo que impide garantizar comportamiento en contextos largos o en castellano.
- Arquitectura y datos de entrenamiento: no documentados en la información disponible, lo que dificulta evaluar sesgos conocidos; no se han publicado análisis de sesgo.
- Riesgo de alucinación: la model card advierte de que el modelo puede producir salidas incorrectas o inseguras.
- Tool calling: las llamadas a herramientas son propuestas que deben pasar por los permisos de la aplicación consumidora y el control de admisión; no deben ejecutarse de forma autónoma sin validación.
- Licencia: Apache-2.0 cubre los pesos, y las notas originales se conservan en `provenance/`; el repositorio no concede derechos sobre el SDK Wekala, que se distribuye por separado.
- Madurez: repositorio con 0 descargas y 0 likes, creado el 2026-10-19, sin validación externa conocida ni resultados de terceros.
- Ajuste a dispositivo: el tamaño de pesos no incluye estado de contexto, buffers ni margen del driver; el funcionamiento sostenido en 8 GB de VRAM y en móvil o navegador requiere perfiles medidos propios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nile-academy/nanbeige4.2-3b-gguf
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Model card exacta del modelo fuente (revision fijada): https://huggingface.co/Nanbeige/Nanbeige4.2-3B/blob/b82e54bd609793562a75cbf9337970a93369eab5/README.md
- Paper de referencia: https://arxiv.org/abs/2607.22083
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0

No se han encontrado otros enlaces relevantes en la búsqueda web: los resultados obtenidos corresponden a entidades homónimas sin relación con el modelo (consultoría, el río Nilo, una marca de ropa), por lo que se descartan.
