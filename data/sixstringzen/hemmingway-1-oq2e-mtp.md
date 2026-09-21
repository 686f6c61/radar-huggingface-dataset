# sixstringzen/Hemmingway-1-oQ2e-mtp

## Resumen

Hemmingway-1-oQ2e-mtp es una cuantizacion derivada del modelo Altworld/Hemmingway-1, un modelo de generacion de texto orientado a escritura creativa. El modelo original fue desarrollado y publicado por Altworld; la conversion a formato MLX y la cuantizacion han sido realizadas por el usuario sixstringzen. Se distribuye como un artefacto de 10,14 GiB en safetensors de MLX, con 27.320.697.856 parametros declarados y licencia Apache 2.0. No es un modelo nuevo: hereda intactas las capacidades, el entrenamiento y las limitaciones del modelo base, y solo modifica la representacion numerica de los pesos.

El artefacto aplica una cuantizacion afin de precision mixta denominada oQ2e, con pesos base de 2 bits y overrides de mayor precision en tensores sensibles, detectados mediante un pase de importancia de activaciones (imatrix). Ademas, conserva 29 tensores de prediccion multi-token (MTP, multi-token prediction) del modelo fuente, aunque la decodificacion asistida por MTP no se ha evaluado de forma independiente. La arquitectura se identifica internamente como qwen3_5 (qwen3_5_text en el modelo fuente) y el destino declarado es Apple silicon mediante MLX y oMLX.

Su relevancia es acotada pero concreta: permite ejecutar un modelo de aproximadamente 27.300 millones de parametros en equipos Apple con memoria unificada moderada, a costa de una compresion extrema. La model card advierte explicitamente de que no se ha publicado una comparacion controlada contra el modelo fuente en bfloat16 ni una prueba de generacion (smoke test), por lo que la paridad de calidad no esta establecida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (nombre de arquitectura declarado: `qwen3_5`; el modelo fuente usa `qwen3_5_text`); no se detallan mas caracteristicas estructurales |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se ha confirmado que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ2e: cuantizacion afin de precision mixta con base de 2 bits; 8 tensores a 4 bits, 157 tensores a 5 bits y `language_model.lm_head` a 8 bits; tamano de grupo 64; dtype no cuantizado `bfloat16` |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors de MLX (3 shards, 1.876 tensores indexados, 29 tensores MTP); no es GGUF |
| Tamano del artefacto | 10.884.899.235 bytes (10,14 GiB) |
| Revision del modelo fuente | `4d711aac0f0043075ae334d2a3de3db3e10135c9` |
| Cuantizador | oMLX `0.7.0.dev2` |
| Dataset de calibracion | `oqe_code_multilingual`, 128 muestras de 512 tokens; 504 entradas de imatrix |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo fuente en la informacion proporcionada: no constan el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Lo unico documentado es que Altworld desarrollo y publico el modelo original y que su model card sigue siendo la referencia para los detalles de entrenamiento y el uso previsto. La arquitectura de texto se identifica como `qwen3_5_text` en el modelo fuente; el artefacto convertido usa el nombre `qwen3_5`, que es el que soporta la version de oMLX empleada.

La innovacion tecnica de este repositorio es la propia cuantizacion. oQe asigna precision adicional a los tensores sensibles utilizando la importancia de activaciones: el build parte de pesos de 2 bits y aplica overrides mixtos que van de 4 a 8 bits. El resultado son 10,14 GiB para 27.320.697.856 parametros, es decir, aproximadamente 3,2 bits por parametro de media. Se conservan 29 tensores de prediccion multi-token (MTP) del modelo fuente, pero no se ha medido por separado el rendimiento de la decodificacion asistida por MTP. El informe de cuantizacion declara cero discrepancias de forma matricial y cero shards de pesos ausentes. La calibracion se hizo con `oqe_code_multilingual` y no con un corpus de prosa, y la cobertura estricta de imatrix se desactivo para el fallback conocido de `language_model.lm_head`.

## Capacidades

- Generacion de texto y modo conversacional, segun los tags del repositorio (`text-generation`, `conversational`).
- Escritura creativa y generacion de prosa en ingles, ambito declarado del modelo base (`creative-writing`).
- Modo de pensamiento conmutable: el parametro `enable_thinking` permite desactivar el planificacion visible para obtener prosa directa.
- Prediccion multi-token: el artefacto incluye 29 tensores MTP, si bien su uso no esta documentado ni evaluado.
- Idioma: unicamente ingles (`en`).
- No hay evidencia documentada de soporte de tool calling, function calling, uso agentico, razonamiento multi-paso supervisado, vision, audio ni otras modalidades.
- No se han publicado evaluaciones de instrucciones, coherencia a contexto largo ni capacidades de codigo o matematicas para este build.

## Casos de uso

- Generacion de borradores de ficcion en local: con 10,14 GiB de pesos, el modelo cabe en un Mac con memoria unificada moderada, lo que permite escribir y reescribir prosa sin conexion ni coste por token.
- Asistencia a la escritura en ingles para hablantes no nativos: reescritura de parrafos, variaciones de tono y generacion de alternativas de frase, aprovechando la orientacion a escritura creativa del modelo base.
- Prototipado de aplicaciones de texto en Apple silicon: sirve para validar pipelines de inferencia con MLX u oMLX antes de decidir si se escala a un build de mayor precision de la misma familia.
- Generacion por lotes de contenido editorial de bajo riesgo: descripciones, resúmenes o textos promocionales en ingles donde un error de estilo es aceptable y revisable por una persona.
- Experimentacion con cuantizacion extrema: util como caso de estudio para medir la degradacion de un modelo de ~27.300 millones de parametros comprimido a 2 bits base, comparandolo con los builds oQ3e, oQ4e u oQ8e de la misma coleccion.
- Desarrollo de asistentes conversacionales en ingles sobre hardware de sobremesa: conversaciones multi-turno con `enable_thinking` desactivado para respuestas directas, siempre que la calidad observada sea suficiente tras validacion propia.
- Evaluacion de decodificacion MTP: los 29 tensores de prediccion multi-token preservados permiten investigar si la decodificacion especulativa aporta ventajas en MLX, aunque el autor no ha publicado mediciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explicitamente que no se ha registrado una prueba de generacion (smoke test) para esta cuantizacion, que no existe una comparacion controlada contra el modelo fuente en bfloat16 y que la decodificacion asistida por MTP no se ha evaluado por separado. Tampoco se ofrecen cifras de latencia, throughput ni perplejidad.

## Requisitos de hardware

- Plataforma: exclusivamente Apple silicon. Los pesos son safetensors de MLX y no hay build GGUF ni pesos para CUDA.
- Memoria unificada estimada para oQ2e (10,14 GiB de pesos): en torno a 12-14 GB para contexto corto, sumando overhead de runtime y cache KV. Las cifras son estimaciones a partir del tamano del repositorio, no datos publicados.
- Otros builds de la misma coleccion, con el mismo modelo fuente: oQ3e 12,22 GiB, oQ3.5e 13,19 GiB, oQ4e 15,21 GiB, oQ6e 21,39 GiB, oQ8e 27,10 GiB.
- Equipos viables segun memoria unificada: 16 GB queda muy ajustado para oQ2e; 24-32 GB permite oQ3e y oQ4e con holgura; 36-64 GB (Mac Studio, MacBook Pro de gama alta) permite oQ6e y oQ8e. Estas correspondencias son estimaciones derivadas de los tamanos de fichero y no estan verificadas por el autor.
- GPU recomendadas: no aplica. No hay soporte declarado para A100, H100, RTX 4090 ni otras GPU, ya que el formato de pesos es de MLX.
- Opciones de despliegue: oMLX (version de referencia `0.7.0.dev2`, usada para crear el artefacto) y, en principio, MLX. La compatibilidad con otros runtimes MLX o con versiones anteriores de oMLX no ha sido verificada. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Modelo registrado en el navegador de modelos de oMLX; el identificador de modelo registrado y los valores por defecto del runtime pueden variar segun la instalacion local.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de terceros comparables en la informacion proporcionada. La comparacion relevante es interna a la coleccion de cuantizaciones del mismo modelo fuente, que comparte revision de origen, tamano de grupo, dtype no cuantizado, pase de calibracion y politica de preservacion de MTP.

| Build | Precision base | Tamano de salida | Notas |
|---|---|---|---|
| oQ2e (este repositorio) | 2 bits | 10,14 GiB | Overrides de 4, 5 y 8 bits; maxima compresion de la familia |
| oQ3e | 3 bits | 12,22 GiB | Misma metodologia |
| oQ3.5e | 3 bits con overrides adicionales de mayor precision | 13,19 GiB | Punto intermedio de la familia |
| oQ4e | 4 bits | 15,21 GiB | Compromiso habitual entre tamano y calidad |
| oQ6e | 6 bits | 21,39 GiB | Requiere equipos con mas memoria unificada |
| oQ8e | 8 bits | 27,10 GiB | Build de mayor fidelidad de la coleccion |
| Altworld/Hemmingway-1 | bfloat16 (sin cuantizar) | no disponible | Modelo fuente; sus detalles estan en su propia model card |

## Limitaciones y advertencias

- oQ2e es un build de compresion extrema. La propia model card advierte de que la cuantizacion puede alterar de forma mas visible la eleccion de palabras, la coherencia y el seguimiento de instrucciones a este nivel de compresion.
- No se ha publicado una comparacion controlada contra el modelo fuente en bfloat16, por lo que no hay evidencia de paridad de calidad.
- No se ha registrado ninguna prueba de generacion para este artefacto. Las comprobaciones realizadas son estructurales (integridad del indice, ausencia de shards faltantes) y no validan la calidad del texto generado.
- La calibracion uso `oqe_code_multilingual`, un dataset orientado a codigo y multilingueismo, y no un corpus de prosa, pese a que el modelo esta orientado a escritura creativa en ingles.
- Riesgo de alucinacion: no evaluado para este build. Se hereda el comportamiento del modelo base, cuyas limitaciones y guia de uso aceptable siguen aplicandose.
- Sesgos: no documentados en la informacion disponible. Al ser un modelo entrenado predominantemente en ingles, es previsible un sesgo cultural y linguistico hacia ese idioma.
- Idioma: solo ingles. No hay soporte declarado de castellano ni de otras lenguas, y la calibracion multilingue no implica capacidad multilingue en generacion.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar cargas con conversaciones o documentos largos.
- Compatibilidad: los pesos son safetensors de MLX, no GGUF. No hay soporte para llama.cpp, Ollama, vLLM ni GPUs NVIDIA o AMD. La compatibilidad con otros runtimes MLX distintos de oMLX `0.7.0.dev2` no esta verificada.
- Decodificacion MTP: los tensores estan presentes, pero su uso y su beneficio no han sido medidos; podrian no aportar ninguna ventaja practica.
- Licencia: Apache 2.0, heredada del modelo fuente, lo que permite uso comercial con las obligaciones habituales de atribucion. Conviene revisar la model card de Altworld/Hemmingway-1 para condiciones adicionales de uso aceptable.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sixstringzen/Hemmingway-1-oQ2e-mtp
- Modelo base: https://huggingface.co/Altworld/Hemmingway-1
- Coleccion de cuantizaciones Hemmingway-1 oMLX oQe: https://huggingface.co/collections/sixstringzen/hemmingway-1-omlx-oqe-quantizations
- Informe de imatrix: https://huggingface.co/sixstringzen/Hemmingway-1-oQ2e-mtp/blob/main/oq_imatrix_report.json
- Cuantizador oMLX: https://github.com/jundot/omlx
- Perfil del autor de la conversion: https://huggingface.co/sixstringzen

La busqueda web realizada no devolvio ningun enlace relevante al modelo: los resultados correspondian a paginas de soporte de Microsoft sin relacion con Hemmingway-1 ni con oMLX.
