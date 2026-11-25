# slackcrow/Spark-X2.6-4B-GGUF

## Resumen

Spark-X2.6-4B es un modelo de lenguaje conversacional de 4.112.079.360 parámetros (aproximadamente 4,1 mil millones) desarrollado por XHToken. Este repositorio concreto, publicado por el usuario slackcrow, no contiene el modelo original sino una colección de cuantizaciones GGUF generadas con llama.cpp y calibradas mediante importance matrix (imatrix), pensadas para inferencia en dispositivo (on-device) en escenarios de chat de diario y escritura personal.

La relevancia de esta ficha reside en que el autor documenta de forma inusualmente rigurosa el proceso de cuantización: publica perplejidad sobre WikiText-2 y sobre prosa del propio repositorio, divergencia KL frente a BF16, y análisis de anomalías detectadas (el imatrix perjudica a los K-quants en WikiText-2, mientras que en prosa fuera de dominio apenas cambia). El archivo recomendado, `Spark-X2.6-4B-imat-IQ4_XS.gguf`, ocupa 2,38 GB y se sitúa a menos del 3 % de BF16 en ambas métricas de perplejidad.

El modelo base declara licencia Apache-2.0. No se dispone de información sobre arquitectura interna, longitud de contexto, idiomas soportados ni proceso de entrenamiento en la documentación proporcionada; esta ficha lo indica explícitamente en cada apartado afectado en lugar de inferir datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base XHToken/Spark-X2.6-4B; los GGUF se generan con llama.cpp) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q4_K_S, IQ3_M (con y sin imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

Detalle de archivos del repositorio (tamaños en bytes según la model card):

| Archivo | Receta | Bytes |
|---|---|---:|
| `Spark-X2.6-4B-imat-IQ4_XS.gguf` | IQ4_XS + imatrix, Q5_K fusionado en QKV, embedding Q6_K | 2.376.046.272 |
| `Spark-X2.6-4B-imat-Q4_K_M.gguf` | Q4_K_M + imatrix | 2.600.225.472 |
| `Spark-X2.6-4B-imat-Q4_K_S.gguf` | Q4_K_S + imatrix | 2.426.555.072 |
| `Spark-X2.6-4B-imat-nogate-Q4_K_M.gguf` | Q4_K_M + imatrix, `attn_gate` excluido de la calibración | 2.600.225.472 |
| `Spark-X2.6-4B-imat-IQ3_M.gguf` | IQ3_M + imatrix | 2.043.301.312 |
| `Spark-X2.6-4B-Q4_K_M.gguf` | Q4_K_M sin imatrix (control) | 2.600.225.216 |
| `Spark-X2.6-4B-noimat-Q4_K_S.gguf` | Q4_K_S sin imatrix (control) | 2.426.554.816 |
| `imatrix-wikitrain.gguf` | matriz de calibración | 7.151.872 |

El tamaño total del repositorio es de 17,1 GB.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base XHToken/Spark-X2.6-4B (tipo de transformer, mecanismos de atención, presencia de atención lineal o decodificación especulativa). La model card del repositorio de cuantizaciones no describe el entrenamiento del modelo original: no se indica número de tokens, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento.

Lo que sí está documentado es el proceso de cuantización. Las conversiones se realizaron con llama.cpp en el commit `cd959bae` (v0.9.0) sobre la revisión `64ca8f2a295b8ceb2757b9d4749a6558c4759e5b` del modelo base. La matriz de importancia se calibró con el split de entrenamiento de WikiText-2, usando 300 ventanas de 512 tokens. La variante IQ4_XS aplica además una receta mixta: Q5_K fusionado en las proyecciones QKV y Q6_K en el embedding. El autor incluye una variante de sondeo (`nogate`) en la que excluye la capa `attn_gate` de la calibración para intentar aislar el efecto de esa componente sobre la anomalía observada en WikiText-2.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y el autor lo orienta a chat de diario y journaling.
- Tool calling / function calling: soportado, pero requiere el modo thinking activado. Con el thinking desactivado, el modelo narra las llamadas a herramientas en lugar de emitirlas como tales.
- Razonamiento multi-paso: no documentado explícitamente; el modo thinking está presente y es requisito para el uso de herramientas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles.
- Plantilla de chat: el GGUF incluye una plantilla embebida que, según el autor, renderiza de forma idéntica al `chat_template.jinja` del repositorio fuente en diez casos de prueba (la model card se corta en ese punto).
- Parámetros de muestreo recomendados por el autor: temperature 1.0, top_p 0.95, top_k 20.

## Casos de uso

- Chat de diario y escritura personal en dispositivo: es el caso de uso declarado por el autor. La variante IQ4_XS (2,38 GB) cabe en equipos de consumo y mantiene una perplejidad en prosa de diario (26,44) idéntica a la cuantización oficial Q4_K_M de 3,54 GB, con un 67 % del tamaño.
- Aplicación de escritorio o móvil con modelo empaquetado: el archivo IQ4_XS está marcado como "bundled app model", es decir, pensado para distribuirse dentro de una aplicación. Su tamaño y su divergencia KL contenida (0,0983 nats/token en prosa de repositorio) lo hacen adecuado para ese empaquetado.
- Asistentes conversacionales con llamadas a herramientas: el modelo emite tool calls cuando el modo thinking está activo, lo que permite integrarlo en flujos donde el asistente consulta APIs o ejecuta acciones, siempre que se respeten los parámetros de muestreo indicados.
- Prototipado y evaluación de pipelines de cuantización: el repositorio incluye controles sin imatrix y la matriz de calibración (`imatrix-wikitrain.gguf`), lo que permite reproducir la receta y comparar variantes en un mismo entorno.
- Inferencia en CPU o Metal sin GPU dedicada: el autor reporta que las rutas BF16 en CPU y Metal coinciden dentro del 0,5 %, lo que respalda el uso en equipos sin acelerador dedicado.
- Experimentación con modelos pequeños en investigación: 4,1 mil millones de parámetros permiten iterar con recursos limitados y comparar efectos de cuantización con métricas publicadas (perplejidad y KL) como referencia.

## Benchmarks y rendimiento

Perplejidad (método `llama-perplexity`, `-c 512 -ngl 99`, texto sin plantilla de chat). WikiText-2 test: 604 ventanas (~309k tokens). Prosa de repositorio: 150 ventanas (76.800 tokens), fuera de dominio.

| Variante | PPL WikiText-2 ± EE | vs BF16 | PPL prosa repo ± EE | vs BF16 |
|---|---:|---:|---:|---:|
| BF16 (referencia, no incluido en el repo) | 26,04 ± 0,24 | - | 25,77 ± 0,44 | - |
| Q4_K_M oficial (XHToken, no incluido) | 27,25 ± 0,25 | +4,6 % | 26,44 ± 0,45 | +2,6 % |
| Q4_K_M sin imatrix | 27,57 ± 0,25 | +5,9 % | 26,52 ± 0,45 | +2,9 % |
| Q4_K_M con imatrix | 31,49 ± 0,30 | +20,9 % | 26,50 ± 0,45 | +2,8 % |
| Q4_K_M con imatrix, sin `attn_gate` | 30,29 ± 0,28 | +16,3 % | no ejecutado | - |
| Q4_K_S sin imatrix | 25,49 ± 0,23 | -2,1 % | 26,88 ± 0,46 | +4,3 % |
| Q4_K_S con imatrix | 28,60 ± 0,26 | +9,8 % | 26,33 ± 0,45 | +2,2 % |
| IQ4_XS con imatrix (incluido) | 26,58 ± 0,24 | +2,1 % | 26,44 ± 0,45 | +2,6 % |
| IQ3_M con imatrix | 32,62 ± 0,29 | +25,3 % | 30,12 ± 0,50 | +16,9 % |

Divergencia KL frente a BF16 (nats por token, media sobre las primeras 100 ventanas de cada corpus):

| Variante | KLD prosa repo ± EE | KLD WikiText ± EE | Mismo token top (repo / Wiki) |
|---|---:|---:|---:|
| IQ4_XS con imatrix (incluido) | 0,0983 ± 0,0014 | 0,1553 ± 0,0017 | 84,5 % / 82,2 % |
| Q4_K_M con imatrix | 0,0867 ± 0,0013 | 0,1944 ± 0,0024 | 85,5 % / 80,9 % |
| Q4_K_S con imatrix | 0,0974 ± 0,0013 | 0,1757 ± 0,0019 | 84,5 % / 81,5 % |
| Q4_K_M con imatrix, sin `attn_gate` | 0,0863 ± 0,0013 | 0,1735 ± 0,0021 | 85,5 % / 81,7 % |
| Q4_K_M sin imatrix | 0,0914 ± 0,0013 | 0,1637 ± 0,0018 | 85,0 % / 81,8 % |
| Q4_K_S sin imatrix | 0,1096 ± 0,0017 | 0,1935 ± 0,0021 | 84,1 % / 80,6 % |
| IQ3_M con imatrix | 0,2642 ± 0,0023 | 0,4255 ± 0,0039 | 75,1 % / 71,3 % |

El ruido de medida del pipeline se sitúa en 0,00003 ± 0,00001 (prosa de repositorio) y 0,00040 ± 0,00007 (WikiText-2), tres órdenes de magnitud por debajo de los efectos de cuantización. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: entre 2,0 GB (IQ3_M) y 2,6 GB (Q4_K_M) solo para los pesos; hay que sumar el espacio de la caché KV, cuyo tamaño depende de la longitud de contexto, que no está documentada.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con 4 GB o más de VRAM puede alojar los pesos en cuantización de 4 bits.
- GPU de consumo: sí, cabe en tarjetas de gama media y baja con 4-6 GB de VRAM. El autor valida rutas de CPU y Metal, lo que cubre equipos Apple Silicon y equipos sin GPU dedicada.
- Opciones de despliegue: llama.cpp (herramienta con la que se generaron y evaluaron los archivos); el repositorio está etiquetado como `endpoints_compatible`. No se documenta compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B (IQ4_XS imatrix, este repo) | 4,11 B | no disponible | Apache-2.0 | GGUF, 2,38 GB | PPL 26,58 en WikiText-2, KLD 0,0983 en prosa de repositorio |
| Spark-X2.6-4B (Q4_K_M oficial) | 4,11 B | no disponible | Apache-2.0 | GGUF, 3,54 GB | PPL 27,25 en WikiText-2; iguala al IQ4_XS en prosa de repositorio |
| Spark-X2.6-4B (BF16) | 4,11 B | no disponible | Apache-2.0 | safetensors (repo base) | Referencia de calidad; no incluido en este repositorio |
| Alternativas de ~4 B de otros desarrolladores | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación facilitada, por lo que la comparativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- Cuantizaciones no oficiales: el autor declara explícitamente que no está afiliado a XHToken. Para producción conviene validar el comportamiento frente a la cuantización oficial o frente a BF16.
- Anomalía sin explicar en WikiText-2: el imatrix empeora los K-quants en ese corpus (Q4_K_M pasa de 27,57 a 31,49 de perplejidad, +20,9 % frente a BF16) y el efecto no se reproduce en prosa fuera de dominio. Excluir `attn_gate` de la calibración recupera solo parte de la diferencia. La causa no está determinada.
- Resultado contraintuitivo: el Q4_K_S sin imatrix obtiene mejor perplejidad que BF16 en WikiText-2 (25,49 frente a 26,04), lo que el autor atribuye a la naturaleza difusa de la distribución del modelo y no a una mejora real; no debe interpretarse como ganancia de calidad.
- IQ3_M demasiado lossy: +17 % en prosa de repositorio y +25 % en WikiText-2, con divergencia KL de 2,5 a 3 veces superior al resto. El propio autor lo desaconseja.
- Tool calling dependiente del modo thinking: con el thinking desactivado el modelo narra las llamadas en lugar de emitirlas, lo que rompe integraciones de agentes si no se configura correctamente.
- Distribución de probabilidad difusa: con una perplejidad BF16 en torno a 26, cambios del 2 % en perplejidad alteran con frecuencia el token de mayor probabilidad; la KL debe leerse como escala comparativa entre archivos, no como medida absoluta de calidad.
- Sesgos y alucinación: no documentados en la información proporcionada. Dado el tamaño del modelo (4,1 B), cabe esperar una tasa de alucinación superior a la de modelos mayores, pero no hay mediciones publicadas.
- Idiomas y contexto: sin datos. No se puede garantizar cobertura multilingüe ni estimar el coste de caché KV sin conocer la longitud de contexto.
- Licencia: Apache-2.0 permite uso comercial, pero al tratarse de cuantizaciones no oficiales conviene conservar la atribución al modelo base y revisar los términos del repositorio original.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/slackcrow/Spark-X2.6-4B-GGUF
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Revisión del modelo base usada: `64ca8f2a295b8ceb2757b9d4749a6558c4759e5b`
- llama.cpp (herramienta de conversión y evaluación): no se proporciona URL en la información disponible
- Papers, blogs, demos o repositorios adicionales: no disponibles en la información proporcionada
