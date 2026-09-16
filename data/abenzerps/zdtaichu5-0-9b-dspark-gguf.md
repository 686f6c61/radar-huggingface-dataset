# abenzerps/ZDTaichu5.0-9B-DSpark-GGUF

## Resumen

ZDTaichu5.0-9B-DSpark-GGUF es la conversión a formato GGUF del modelo borrador oficial de decodificación especulativa ZDTaichu5.0-9B-DSpark, desarrollado por el equipo Zi Dong Tai Chu (TaichuAI) y empaquetado por el usuario abenzerps. No es un modelo de propósito general: es una cabeza borrador (draft) que se ejecuta en paralelo al modelo objetivo ZDTaichu5.0-9B para proponer bloques de tokens que el modelo grande verifica después, con una ganancia de velocidad declarada por el autor de entre el 60 % y el 85 %. Según los datos reales de safetensors, el borrador tiene 2.192.886.272 parámetros (~2,19B), aunque el nombre del repositorio haga referencia al modelo objetivo de ~9B.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de aceleración de inferencia (DSpark sobre backbone DFlash con cabeza Markov encadenada) que permite reducir la latencia de un modelo de 9B con ventana de contexto de hasta 131.072 tokens sin reentrenar ni modificar el modelo principal. Por otro, es un ejemplo de despliegue puramente local: los ficheros GGUF están pensados para llama.cpp (`llama-cli` y `llama-server`), lo que permite levantar un endpoint compatible con la API de OpenAI en hardware de consumo.

El repositorio se publicó el 16 de septiembre de 2026, acumula 0 descargas y 0 "likes", y no incluye resultados numéricos de benchmarks propios: la gráfica referenciada en la model card corresponde al modelo base ZDTaichu5.0-9B, no a esta conversión. La licencia declarada es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Framework DSpark: backbone DFlash semi-autoregresivo con cabeza Markov encadenada; modelo borrador de decodificación especulativa (no autónomo) |
| Parametros totales | 2.192.886.272 (~2,19B) segun los datos de safetensors del modelo base |
| Longitud de contexto | Hasta 131.072 tokens (128K) en el modelo objetivo con llama.cpp; la del propio borrador no esta documentada |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base / objetivo | TaichuAI/ZDTaichu5.0-9B-DSpark (borrador) y TaichuAI/ZDTaichu5.0-9B (objetivo) |
| Capas objetivo de extraccion | [1, 8, 15, 22, 29] |
| Block size | 8 tokens redactados por pasada forward (`dflash.block_size = 8`) |
| Tamano del repositorio | 13,3 GB |
| Commit de conversion | ggml-org/llama.cpp `7ceed8737fdb4eb09b4760e77bd12d38012de5a8` |

Tamano de cada fichero GGUF publicado:

| Cuantizacion | Fichero | Tamano (GB) |
|---|---|---:|
| BF16 | ZDTaichu5.0-9B-DSpark-BF16.gguf | 4,40 |
| Q8_0 | ZDTaichu5.0-9B-DSpark-Q8_0.gguf | 2,34 |
| Q6_K | ZDTaichu5.0-9B-DSpark-Q6_K.gguf | 1,81 |
| Q5_K_M | ZDTaichu5.0-9B-DSpark-Q5_K_M.gguf | 1,67 |
| Q4_K_M | ZDTaichu5.0-9B-DSpark-Q4_K_M.gguf | 1,53 |
| Q4_0 | ZDTaichu5.0-9B-DSpark-Q4_0.gguf | 1,51 |

## Arquitectura y entrenamiento

El borrador sigue el framework DSpark, descrito en la model card como un backbone DFlash semi-autoregresivo combinado con una cabeza Markov encadenada. En la práctica esto significa que el modelo no genera tokens de uno en uno, sino que propone un bloque de 8 tokens por pasada forward (`block_size = 8`), y que las dependencias entre posiciones dentro del bloque se modelan con una cabeza de tipo Markov en lugar de una atención completa token a token. Para condicionar sus predicciones, el borrador extrae estados ocultos auxiliares de las capas [1, 8, 15, 22, 29] del modelo objetivo, de forma análoga a otras familias de decodificación especulativa basadas en features del modelo grande (EAGLE, Medusa o MTP).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si hubo fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se detalla el número de capas, dimensiones ocultas, tipo de atención ni presupuesto de cómputo del entrenamiento. El único dato cuantitativo de rendimiento aportado por el autor es la aceleración de generación de entre el 60 % y el 85 % al emparejarlo con el modelo objetivo ZDTaichu5.0-9B; esta cifra procede del autor y no está verificada de forma independiente en la información disponible.

La innovación destacable es precisamente la integración con llama.cpp: el binario soporta el tipo de especulación `--spec-type draft-dspark` con `--spec-draft-n-max 8`, lo que permite activar la decodificación especulativa desde `llama-cli` y `llama-server` sin infraestructura adicional. El modelo objetivo, además, admite entrada multimodal de visión mediante el proyector `mmproj-ZDTaichu5.0-9B-BF16.gguf` (fichero del repositorio del modelo objetivo, no de este repositorio).

## Capacidades

- Decodificación especulativa: propone bloques de 8 tokens por pasada forward que el modelo objetivo valida, con una ganancia declarada del 60-85 % en velocidad de generación.
- Aceleración de generación de texto del modelo ZDTaichu5.0-9B en tareas de texto general, siempre que se ejecute junto al modelo objetivo.
- Funcionamiento con contexto largo: los ejemplos de uso emplean `-c 8192` y la model card indica que se puede subir hasta 131.072 tokens (128K) si hay memoria suficiente.
- Compatibilidad con el modo conversacional y `--jinja` (plantillas de chat) del modelo objetivo.
- Integración con pipeline multimodal del modelo objetivo (visión) mediante `--mmproj`, manteniendo la decodificación especulativa activa.
- Servicio compatible con la API de OpenAI a través de `llama-server` (etiqueta `endpoints_compatible` en el repositorio).
- Soporte multilingüe heredado del modelo objetivo en inglés y chino (en, zh).
- Etiquetas del repositorio que apuntan a casos de uso de agentes (`agent`) y a la familia `qwen3.5`; esta última no está confirmada en la documentación del autor.

No se documentan capacidades propias de tool calling, function calling, razonamiento multi-paso o matemáticas para este borrador; esas capacidades corresponderían al modelo objetivo, no a los pesos de este repositorio.

## Casos de uso

- Chat local de baja latencia: emparejar este borrador Q4_K_M (1,53 GB) con ZDTaichu5.0-9B en `llama-server` para servir conversaciones multi-turno con una latencia de generación reducida entre un 60 % y un 85 %, manteniendo la calidad del modelo objetivo.
- Asistentes de código autoalojados: desplegar el par borrador + objetivo detrás de un endpoint compatible con OpenAI y conectar ahí un IDE o un asistente de CLI, aprovechando la aceleración para autocompletado y explicación de fragmentos sin depender de APIs externas.
- Agentes con contexto largo: usar `-c` hasta 128K para tareas de agente que necesitan arrastrar documentos largos o historiales extensos, donde la decodificación especulativa compensa el coste por token adicional del contexto largo.
- Procesamiento por lotes de documentos: generar resúmenes, clasificaciones o extracciones sobre grandes volúmenes de texto en inglés o chino, donde la aceleración se traduce directamente en menos horas de GPU por lote.
- Pipelines multimodales en local: combinar el borrador con el modelo objetivo y `mmproj-ZDTaichu5.0-9B-BF16.gguf` para tareas de descripción de imágenes o VQA con presupuesto de latencia ajustado.
- Despliegue en hardware de consumo: usar el fichero Q4_0 (1,51 GB) en equipos con GPU modesta o incluso en modo CPU/GPU mixto, dejando memoria libre para el modelo objetivo y la caché KV.
- Evaluación de estrategias de decodificación especulativa: servir como referencia reproducible para comparar `--spec-draft-n-max` (por ejemplo 4 frente a 8) con distintos niveles de cuantización del borrador y del objetivo.
- Servicio interno de atención al cliente: montar un backend propio con `llama-server` y `--host 0.0.0.0 --port 8080` para un chatbot de soporte en inglés o chino, con el coste controlado por hardware propio en lugar de por tokens facturados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una imagen de resultados (`assets/taichu-vs-closed-models.png`) que el propio autor aclara que corresponde al modelo fundacional ZDTaichu5.0-9B original y que no son mediciones de esta conversión GGUF. El único dato de rendimiento declarado específicamente para este borrador es la ganancia de velocidad de generación del 60-85 % al emparejarlo con el modelo objetivo, sin desglose por tarea, hardware ni cuantización.

## Requisitos de hardware

- Memoria del borrador en solitario (pesos, sin caché KV ni contexto): 4,40 GB en BF16; 2,34 GB en Q8_0; 1,81 GB en Q6_K; 1,67 GB en Q5_K_M; 1,53 GB en Q4_K_M; 1,51 GB en Q4_0.
- Estimación de VRAM total del borrador con contexto corto y overhead de runtime: aproximadamente 2-3 GB para las variantes Q4_0/Q4_K_M y 5-6 GB para BF16. Son estimaciones derivadas del tamaño de los ficheros, no medidas publicadas.
- A esta memoria hay que sumar la del modelo objetivo ZDTaichu5.0-9B (~9B parámetros) y su caché KV; el repositorio de este borrador no documenta los tamaños de los GGUF del objetivo, por lo que el requisito combinado no está disponible.
- GPU recomendadas: no hay recomendaciones publicadas por el autor. Cualquier GPU con suficiente VRAM para el par borrador + objetivo es válida; las variantes cuantizadas del borrador (1,5-2,4 GB) dejan el presupuesto de VRAM casi íntegro para el modelo grande.
- Cabe en GPU de consumo: sí, el borrador en solitario cabe en GPU de 4-8 GB, e incluso las variantes Q4 son compatibles con despliegues parciales en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`) con `--spec-type draft-dspark --spec-draft-n-max 8`; es obligatorio un build de llama.cpp que incluya el commit `7ceed8737fdb4eb09b4760e77bd12d38012de5a8` o posterior.
- Latencia y throughput: no hay cifras absolutas publicadas (tokens/s); solo la mejora relativa declarada del 60-85 %.
- Flags recomendados en los ejemplos del autor: `--temp 0.7 --top-p 0.95`, `--jinja`, `-fa on` y `-c 8192` ampliable a 131.072 tokens.

## Comparativa con modelos similares

No hay datos publicados en la informacion disponible para construir una comparativa cuantitativa con otras cabezas borrador (EAGLE-3, Medusa, MTP u otras). La tabla siguiente recoge únicamente lo que puede afirmarse con la documentación aportada:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZDTaichu5.0-9B-DSpark-GGUF (este repo) | Borrador de decodificacion especulativa, GGUF | 2.192.886.272 (~2,19B) | No documentado para el borrador; 128K en el objetivo | apache-2.0 | GGUF en HuggingFace, 0 descargas |
| ZDTaichu5.0-9B (modelo objetivo) | Modelo fundacional de ~9B, con soporte multimodal | No disponible | 131.072 tokens (128K) | No disponible en esta informacion | HuggingFace (TaichuAI y conversion GGUF por abenzerps) |
| Cabezas borrador tipo EAGLE-3 / Medusa | Decodificacion especulativa | No disponible | No disponible | No disponible | No disponible en esta informacion |

El único punto de comparación con datos concretos es funcional: frente a ejecutar ZDTaichu5.0-9B sin borrador, este repositorio declara una mejora de velocidad del 60-85 %, a costa de cargar 1,51-4,40 GB adicionales según la cuantización elegida.

## Limitaciones y advertencias

- No es un modelo autónomo: por sí solo no genera texto útil. Requiere el modelo objetivo ZDTaichu5.0-9B y un build de llama.cpp con soporte de `--spec-type draft-dspark`.
- Idiomas declarados: solo inglés (en) y chino (zh). No se declara soporte de castellano ni de otras lenguas, más allá de lo que herede el modelo objetivo.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, repositorio publicado el 16 de septiembre de 2026. No hay informes independientes de calidad o estabilidad.
- Sin benchmarks verificables de esta conversión: la gráfica incluida corresponde al modelo base y el autor lo advierte explícitamente. La ganancia del 60-85 % es una afirmación del autor sin medición independiente publicada.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; en la práctica, el borrador hereda las limitaciones, sesgos y errores del modelo objetivo, ya que solo propone candidatos que el modelo grande valida o descarta.
- Restricciones de licencia: este repositorio es Apache-2.0, lo que permite uso comercial. La licencia del modelo objetivo ZDTaichu5.0-9B no se detalla en la documentación de esta ficha y debe verificarse antes de un despliegue comercial.
- La etiqueta `qwen3.5` sugiere una posible ascendencia arquitectónica, pero no está confirmada por el autor; conviene tratarla como no verificada.
- El soporte de visión depende del proyector `mmproj-ZDTaichu5.0-9B-BF16.gguf`, que pertenece al repositorio del modelo objetivo, no a este.
- Dependencia de versión: la conversión se generó con un commit concreto de llama.cpp (`7ceed8737fdb4eb09b4760e77bd12d38012de5a8`); versiones anteriores pueden no reconocer el tipo de especulación o los metadatos DSpark.
- En contexto largo (hasta 128K), la memoria para la caché KV del modelo objetivo puede superar con creces la del propio borrador; planificar la VRAM en consecuencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/abenzerps/ZDTaichu5.0-9B-DSpark-GGUF
- Modelo borrador original: https://huggingface.co/TaichuAI/ZDTaichu5.0-9B-DSpark
- Modelo base objetivo: https://huggingface.co/TaichuAI/ZDTaichu5.0-9B
- Conversion GGUF del modelo objetivo: https://huggingface.co/abenzerps/ZDTaichu5.0-9B-GGUF
- Commit de llama.cpp usado en la conversion: https://github.com/ggml-org/llama.cpp/commit/7ceed8737fdb4eb09b4760e77bd12d38012de5a8
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Checksums SHA256SUMS.txt: https://huggingface.co/abenzerps/ZDTaichu5.0-9B-DSpark-GGUF/blob/main/SHA256SUMS.txt
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Resultados de busqueda web: no se han recuperado enlaces relevantes (los resultados devueltos corresponden a paginas de inicio del motor de busqueda, sin contenido sobre el modelo).
