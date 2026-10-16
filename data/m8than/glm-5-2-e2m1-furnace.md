# m8than/GLM-5.2-E2M1-Furnace

## Resumen

GLM-5.2-E2M1-Furnace es una conversion experimental completa del checkpoint zai-org/GLM-5.2-FP8 a formato E2M1 (FP4), publicada por el usuario m8than para el runtime Furnace sobre GPUs AMD con ROCm. No es un modelo entrenado desde cero ni un borrador: se trata de un checkpoint destino completo de 142 shards safetensors, 117.953 tensores y aproximadamente 405 GB, con 110.695.458.816 parametros totales segun los metadatos de safetensors. La relacion declarada con el modelo base es "quantized".

El interes de la publicacion es doble. Por un lado, explora si una cuantizacion agresiva a 4 bits (E2M1) mantiene la calidad del checkpoint FP8 original: en una suite fija y finita de 160 tareas, la combinacion retenida de modelo y runtime obtuvo un 98,125%, coincidiendo en puntuacion puntual con la linea base FP8 sin cambios. Por otro, documenta el despliegue en hardware AMD de gama alta: ocho MI325X (gfx942), ROCm 7.2, PyTorch 2.11, Triton 3.6 y la revision de AITER c16d44b93a528b2a4bfd6d8d3409116d465872a9, con backend de atencion DSA y tensor parallelism de 8.

Se trata de un artefacto claramente experimental, con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado, sin idiomas declarados y sin resultados de benchmarks publicos convencionales. Su valor principal es servir como material de investigacion sobre cuantizacion FP4, atencion dispersa y decodificacion especulativa en el ecosistema ROCm, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion dispersa (etiqueta del repositorio: glm_moe_dsa); es una conversion de pesos de GLM-5.2-FP8, no una arquitectura nueva |
| Parametros totales | 110.695.458.816 (unos 110,7 mil millones, dato de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el autor advierte que las posiciones maximas configuradas no demuestran calidad en contexto largo ni capacidad de KV disponible) |
| Tipos de cuantizacion | E2M1 (FP4) a partir del checkpoint FP8; en el servicio medido se carga con `--dtype bfloat16` y `--kv-cache-dtype bfloat16` |
| Idiomas soportados | no disponible |
| Licencia | MIT (licencia original del modelo base, incluida sin cambios) |
| Formato de pesos | safetensors (142 shards, 117.953 tensores, aproximadamente 405 GB) |
| Modelo base | zai-org/GLM-5.2-FP8 (relacion: quantized) |
| Tamano del repositorio | 405,2 GB |
| Backend de atencion | DSA (`--attention-backend dsa`, prefill y decode con AITER) |
| Estado del artefacto | experimental, sin pipeline declarado, 0 descargas |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna mas alla de la etiqueta `glm_moe_dsa` y del nombre del modelo base, GLM-5.2-FP8. Por tanto, lo unico verificable es que se trata de un transformer con mezcla de expertos (MoE) y algun esquema de atencion dispersa denominado DSA, del que el runtime Furnace expone backends separados de prefill y decode sobre AITER. No se documentan en la informacion disponible el numero de expertos, el ratio de activacion, la dimension oculta ni el mecanismo exacto de la atencion dispersa.

Tampoco hay datos sobre el entrenamiento: no se indica numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que si describe el autor es el proceso de conversion: el checkpoint fuente no se ha modificado, la conversion verifico el arbol de Hugging Face fijado, los checksums de los 142 shards de salida, la cobertura completa de tensores e indices y los recursos del tokenizer. `conversion_metadata.json` contiene la procedencia agregada publica y los checksums de shards, sin conversaciones en crudo, caches ni rutas locales.

Como innovaciones tecnicas asociadas al despliegue se documentan tres: la propia cuantizacion E2M1 sobre un checkpoint FP8, el soporte de atencion dispersa DSA con backends AITER, y una politica opcional de prefill con perdida (`--superfast`), que el autor describe explicitamente como una opcion independiente y no como un requisito del formato del checkpoint. Ademas se menciona un borrador de decodificacion especulativa publicado por separado, DFlash2 B12, cuyos pesos no estan incluidos en este repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno: el unico dato de evaluacion cualitativa menciona un conjunto de conversaciones y una prueba de conversacion retenida, aunque sin detallar metricas de calidad.
- Capacidades heredadas del modelo base: al ser una conversion de pesos de zai-org/GLM-5.2-FP8, se asume que conserva las tareas del original, pero el repositorio no enumera capacidades concretas (razonamiento, codigo, matematicas, vision) en la informacion disponible.
- Atencion dispersa DSA: el modelo se sirve con `--attention-backend dsa` y backends AITER para prefill y decode, lo que habilita un modo de atencion dispersa en el runtime Furnace.
- Cache KV en bfloat16: configurable mediante `--kv-cache-dtype bfloat16` en el lanzamiento medido.
- Decodificacion especulativa: compatible con el borrador experimental DFlash2 B12 publicado aparte, que mejoro la aceptacion en una prueba de conversacion retenida, aunque no mejoro la velocidad de forma consistente frente al borrador anterior.
- Prefill con perdida opcional: la bandera `--superfast` activa una politica de prefill lossy de uso opt-in.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Vision o audio: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Investigacion en cuantizacion FP4: comparar la calidad del checkpoint E2M1 frente a la linea base FP8 en tareas controladas. Es adecuado porque el autor publica los checksums de conversion y una suite fija de 160 tareas que sirve como punto de partida reproducible.
- Despliegue autoalojado en clusters AMD MI325X: servir el modelo con tensor parallelism 8 sobre ocho MI325X y ROCm 7.2, siguiendo la receta TP8 de `START_COMMANDS.md` del runtime Furnace.
- Evaluacion de atencion dispersa DSA con AITER: probar los backends de prefill y decode de AITER en cargas reales, dado que el lanzamiento medido usa `--dsa-prefill-backend aiter` y `--dsa-decode-backend aiter`.
- Banco de pruebas de decodificacion especulativa: usar el borrador DFlash2 B12 junto al modelo destino para medir tasas de aceptacion y velocidad, teniendo en cuenta que el autor reporto mejora de aceptacion pero regresion de velocidad en contextos cortos.
- Inferencia single-stream de contexto largo: el unico escenario medido es una peticion de 32.768 tokens de entrada y 256 de salida, con 169,1 tok/s de decode mediano y 20.512,6 tok/s de prefill efectivo, util para dimensionar despliegues de contexto largo en un solo flujo.
- Captura de trazas de un modelo profesor: el autor menciona explicitamente este flujo al advertir que no debe usarse el servicio superfast con perdida para captura exact-teacher, lo que implica que la captura precisa si es un caso previsto con la configuracion normal.
- Pruebas de regresion de calidad tras cambiar de runtime: reutilizar la suite de 160 tareas como control antes de actualizar Furnace, ROCm o AITER, dado que el autor documenta una regresion en una tarea de instruccion de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos publicados son los siguientes.

| Metrica | Valor | Condiciones |
|---|---|---|
| Suite interna de 160 tareas | 98,125% | Combinacion retenida de modelo y runtime con el borrador de conversacion previo; coincide con la puntuacion puntual de la linea base FP8 sin cambios |
| Decode mediano (borrador previo) | 169,1 tok/s | Single-stream, 32.768 tokens de entrada y 256 de salida, una calentamiento excluido y tres ensayos |
| Prefill efectivo (borrador previo) | 20.512,6 tok/s | Definido como tokens de entrada divididos entre el tiempo hasta el primer token, en la misma prueba de 32K |
| Decode mediano (borrador refrescado) | 175,8 tok/s | Misma prueba de 32K; regreso en contextos mas cortos |
| Prefill efectivo (borrador refrescado) | 20.502,5 tok/s | Misma prueba de 32K |
| Techo de decode | no alcanzado | El autor afirma que no se han logrado de forma consistente los 250 tok/s de decode |

El propio autor advierte que la suite es plantillada, que la evaluacion de escritura no fue una evaluacion humana independiente y que la prueba combinaba E2M1 con atencion superfast con perdida, de modo que no aisla el efecto de la cuantizacion. Estas cifras son observaciones especificas de una carga, no una garantia de despliegue en maquina limpia.

## Requisitos de hardware

- Hardware medido: ocho GPU AMD MI325X (gfx942). Es la unica configuracion documentada.
- Entorno software medido: ROCm 7.2, PyTorch 2.11, Triton 3.6 y AITER en la revision c16d44b93a528b2a4bfd6d8d3409116d465872a9.
- Paralelismo: tensor parallelism de 8 (`--tp-size 8`), con precision bfloat16 y cache KV en bfloat16.
- VRAM estimada: no publicada por el autor. Como referencia, repartir los 405,2 GB del repositorio entre 8 GPU da aproximadamente 51 GB por GPU solo en pesos, a lo que hay que anadir cache KV, activaciones y buffers de comunicacion; esta cifra es una estimacion derivada del tamano del repositorio, no un dato medido.
- GPU consumer: no cabe en ninguna GPU consumer actual, dado el tamano del checkpoint (405,2 GB) y que la configuracion documentada requiere 8 aceleradores.
- Opciones de despliegue: el unico runtime documentado es Furnace, con backend de atencion DSA y backends AITER. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, ni se publican pesos GGUF en este repositorio.
- Latencia y throughput: medidos en single-stream a 32K de entrada, con 169,1 a 175,8 tok/s de decode mediano y alrededor de 20.500 tok/s de prefill efectivo. No hay datos de throughput agregado ni de latencia con concurrencia.
- Decodificacion especulativa: requiere descargar por separado el borrador DFlash2 B12; sus pesos no estan incluidos en este repositorio.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados frente a modelos de terceros de la misma categoria. La comparacion posible se limita a los artefactos de la misma familia que aparecen en la informacion proporcionada.

| Modelo | Parametros totales | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|
| m8than/GLM-5.2-E2M1-Furnace | 110.695.458.816 | safetensors, E2M1 (FP4) desde FP8, 405,2 GB | MIT | Conversion experimental para Furnace sobre ROCm; 0 descargas |
| zai-org/GLM-5.2-FP8 | no disponible | safetensors en FP8 | no disponible en la informacion proporcionada | Modelo base sin modificar; linea base de referencia en la suite de 160 tareas (misma puntuacion puntual) |
| m8than/GLM-5.2-DFlash2-B12-Furnace-Conversations-v3 | no disponible | no disponible | heredada de sus donantes, distinta de la MIT del modelo destino | Borrador de decodificacion especulativa; no incluido en el repositorio del modelo destino |

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente publicada.
- La evaluacion de calidad se apoya en una unica suite fija de 160 tareas, plantillada y finita, cuya correccion de escritura no fue evaluada por humanos de forma independiente.
- Una tarea de instruccion de contexto largo regreso respecto a la referencia; el autor lo senala explicitamente.
- La prueba de la suite combinaba E2M1 con atencion superfast con perdida, por lo que no aisla el efecto de la cuantizacion E2M1.
- No hay una ejecucion amplia de calidad que cubra el borrador de conversacion refrescado.
- Las cifras de 98,125%, 169,1 a 175,8 tok/s y 20.512,6 a 20.502,5 tok/s son observaciones de una carga concreta y no garantizan el comportamiento en una maquina limpia.
- El autor indica que no se han alcanzado de forma consistente los 250 tok/s de decode.
- Las posiciones maximas configuradas no demuestran calidad en contexto largo ni capacidad de KV disponible.
- No se debe usar el servicio superfast con perdida para captura exact-teacher, segun la propia model card.
- La calidad y el comportamiento del borrador DFlash2 no estan cubiertos por la licencia MIT del modelo destino: el borrador tiene sus propias limitaciones derivadas de sus donantes.
- Sesgos conocidos: no disponibles; no se publica ninguna evaluacion de sesgo, toxicidad o alineamiento.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Idiomas: no se declara ningun idioma soportado, por lo que no hay garantia de cobertura multilingue.
- Restricciones de licencia: el checkpoint se publica bajo MIT, la misma licencia del modelo base, sin cambios; no se documentan restricciones adicionales para uso comercial del modelo destino.
- Compatibilidad: solo se documenta el runtime Furnace sobre ROCm con DSA y AITER; cualquier otro stack de inferencia queda fuera de lo reportado.
- Repositorio de 405,2 GB en 142 shards, lo que implica un coste de almacenamiento y de transferencia elevado antes de poder evaluar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/m8than/GLM-5.2-E2M1-Furnace
- Modelo base (arbol fijado): https://huggingface.co/zai-org/GLM-5.2-FP8/tree/f33c6dc501ee5a2c7e35155653b1b1abbc320951
- Repositorio del runtime Furnace (revision fijada): https://github.com/m8than/furnace/tree/647d2a72f03b693cfd412af09a7e59aafd5affa3
- Borrador de decodificacion especulativa DFlash2 B12: https://huggingface.co/m8than/GLM-5.2-DFlash2-B12-Furnace-Conversations-v3
- Fichero de metadatos de conversion: `conversion_metadata.json` dentro del repositorio del modelo (procedencia agregada y checksums de shards)
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
