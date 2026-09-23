# jayyun98/Ling-3.0-Tiny-DSpark

## Resumen

Ling-3.0-Tiny-DSpark es un borrador (draft) de decodificación especulativa entrenado por la comunidad para el modelo objetivo inclusionAI/Ling-3.0-tiny. No es un LLM autónomo: es un checkpoint de 274.217.729 parámetros almacenados (~274M) en BF16 que se acopla al modelo objetivo para proponer tokens que este verifica en paralelo. Su autor es Jay Yun (jayyun98), y el entrenamiento se realizó con SpecForge, con evaluación mediante SGLang. La model card lo etiqueta explícitamente como "experimental", de uso en investigación y no certificado para producción, y advierte de que no es un lanzamiento oficial de inclusionAI.

Técnicamente se trata de un Qwen3DSparkModel con 3 capas de atención completa, tamaño oculto 1536, intermedio 4608, 16 cabezas de consulta y 16 de clave-valor con dimensión de cabeza 128, y capas de características en las posiciones 3, 7, 11, 15 y 19. El mecanismo DSpark combina un sesgo Markov de rango 512 ("vanilla Markov rank") con 7 propuestas de borrador y una anchura de verificación de 8 tokens (incluido el token bonus). El límite de contexto evaluado es de 4096 tokens, aunque la configuración declara 131072 posiciones máximas, algo que la propia model card aclara que no constituye soporte validado de contexto largo.

Su relevancia es acotada pero concreta: documenta un intento reproducible de acelerar un MoE ligero (Ling-3.0-tiny, 7,9B parámetros totales y 1,3B activos) mediante decodificación especulativa en una sola H200. El resultado piloto es una aceleración de ~2,37x (63,84 tok/s frente a 26,98 tok/s del objetivo solo) con paridad de texto exacto 20/20, pero la ganancia de longitud de aceptación fue de solo el 0,391%, por debajo del umbral del 3% que el propio autor se había fijado, y el objetivo de acc_len 5-6 no se alcanzó.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3DSparkModel (borrador de decodificación especulativa DSpark); 3 capas de atención completa |
| Parametros totales | 274.217.729 (~274M) almacenados en el borrador |
| Parametros activos | No aplica (no es MoE). El modelo objetivo, Ling-3.0-tiny, tiene 7,9B totales y 1,3B activos |
| Longitud de contexto | 4096 tokens evaluados; 131072 posiciones máximas configuradas, sin soporte de contexto largo validado |
| Tipos de cuantizacion | BF16 (dtype de los pesos). No se ha validado ninguna cuantización para este candidato |
| Idiomas soportados | no disponible (no verificado; depende del tokenizer y la plantilla de chat del objetivo Ling-3.0-tiny) |
| Licencia | other (uso en investigación; no certificado para producción) |
| Formato de pesos | no disponible (repositorio de HuggingFace descargable con `hf download`; pesos en BF16) |
| Dimension oculta / intermedia | 1536 / 4608 |
| Atencion | 16 cabezas de consulta, 16 cabezas KV, dimensión de cabeza 128 |
| Capas de caracteristicas | 3, 7, 11, 15, 19 |
| Rango Markov (vanilla) | 512 |
| Propuestas de borrador / anchura de verificacion | 7 / 8 (incluido el token bonus) |
| Mask ID | 156901 |
| Revision del objetivo evaluada | a2ee06c0f2de5b171701aee7f73f70a1da75483b |
| SHA-256 del modelo | e9e4ad541c6d73f3d02488e18afc5f9b7d5089c81b953a630c808f927700d4a6 |
| Modelos base | inclusionAI/Ling-3.0-tiny, inclusionAI/Ling-3.0-flash-DSpark |

## Arquitectura y entrenamiento

El checkpoint es un borrador DSpark construido sobre la arquitectura Qwen3DSparkModel, con tres capas de atención completa y un mecanismo de sesgo Markov de rango 512 que modela la transición entre tokens propuestos. La anchura de verificación es de 8 tokens (7 propuestas más el token bonus) y las capas de características se sitúan en las posiciones 3, 7, 11, 15 y 19. Los pesos se almacenan en BF16. El rango 512 concatena factores que representan la mezcla de salida; según la model card, no promedia coordenadas de factores ni trasplanta el backbone de Flash.

El linaje de entrenamiento tiene tres etapas: un borrador original Tiny50K, una mezcla de sesgo de salida del 75% Tiny / 25% Flash (Markov), y una continuación de 3000 pasos sobre el borrador completo. La continuación usó 2048 respuestas existentes de Tiny-t0 más 512 prompts adicionales regenerados por Tiny a temperatura 0 y con el razonamiento desactivado (etiquetados `regenerated_by=ling-t0`); los 512 se completaron con éxito y se obtuvieron 2560 muestras de caché sin descartes. La exclusión del conjunto de retención se hizo mediante hashes normalizados exactos de prompt e identificadores, no mediante descontaminación semántica ni de preentrenamiento. Los datos brutos no forman parte de los activos publicados.

Hiperparámetros de la continuación: 3000 pasos sobre el borrador completo, LR 2e-5, semilla 44, gamma 4, pérdida CE 0,1 + L1(2TV) 0,9 + confianza 1, y coeficiente auxiliar de aceptación 0. La longitud de entrenamiento/caché fue 3072 y la de evaluación 4096. La model card advierte de que, al cambiar simultáneamente datos y horizonte, la mejora no puede atribuirse únicamente a los prompts adicionales. La plataforma de entrenamiento propia del autor soporta entrenamiento offline en 1× H100 y online en 2× H100, mientras que esta continuación de 3000 pasos y su evaluación se ejecutaron en 1× H200. No se declara uso de RLHF ni DPO.

## Capacidades

- No es un modelo generativo autónomo: no debe cargarse por sí solo como modelo de generación de texto en Transformers.
- Decodificación especulativa: propone hasta 7 tokens por ronda que el objetivo Ling-3.0-tiny verifica, con una anchura de verificación de 8 tokens incluido el bonus.
- Aceleración de inferencia del objetivo: el piloto registró 63,8391 tok/s de salida frente a 26,9769 tok/s del objetivo solo, un factor de ~2,37x en una única ejecución.
- Paridad de texto exacto con el objetivo: 20/20 prompts en la evaluación piloto, lo que indica que la salida verificada coincide con la del objetivo en ese conjunto.
- Integración con SGLang mediante `--speculative-algorithm DSPARK`, con modo de verificación `static`.
- Compatibilidad nominal con el tokenizer y la plantilla de chat del objetivo, con el modo de razonamiento (thinking) desactivado explícitamente.
- No se declaran capacidades propias de tool calling, agentes, visión, audio ni multilingüismo; todas ellas dependerían del modelo objetivo y no se han validado en este candidato.
- Modo thinking: no validado para este candidato (la evaluación se hizo con razonamiento desactivado).

## Casos de uso

- Investigación en decodificación especulativa: sirve como caso de estudio reproducible de un borrador DSpark entrenado por la comunidad, con linaje, hiperparámetros y métricas de aceptación documentados, para comparar el rendimiento de distintas estrategias de borrador sobre un mismo objetivo.
- Aceleración de un MoE ligero en una sola GPU: en el escenario registrado (1× H200, contexto 4096, concurrencia 1) el borrador triplica aproximadamente el throughput del objetivo, lo que resulta útil para servir Ling-3.0-tiny en entornos con una única GPU de gama alta.
- Despliegue de prototipos con SGLang: el comando `docker run` documentado permite levantar el par objetivo + borrador con FA3, inferencia determinista y verificación estática para experimentación interna.
- Evaluación de pipelines de borradores: permite a un equipo de infraestructura medir longitud de aceptación, tasa de aceptación y rondas de verificación antes de comprometerse con una configuración de producción.
- Estudio de la mezcla de borradores: el linaje (Tiny50K → mezcla 75/25 Tiny/Flash → continuación de 3000 pasos) sirve para analizar cómo influye la destilación parcial de otro borrador en la aceptación sobre el objetivo Tiny.
- Reproducción de métricas de aceptación por posición: la tabla de supervivencia de prefijo y aceptación condicional permite validar metodologías de medición de decodificación especulativa en entornos controlados.
- No se recomienda su uso en producción, atención al cliente, generación de código o pipelines de CI/CD, ya que la propia model card lo declara experimental y no certificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, GSM8K, MATH, HumanEval) en la información disponible; la model card indica explícitamente que no reclama ningún resultado de ese tipo. Los únicos datos publicados son métricas de aceptación y throughput del piloto.

Configuración de la medición: 1× H200; 20 prompts de chat exactos; max_tokens 256; concurrencia 1; temperatura 0; razonamiento desactivado; semilla 42; verificación estática (`static verify-all`).

| Metrica | Mezcla previa | Candidato v1 |
|---|---:|---:|
| acc_len incluyendo bonus | 2,775398 | 2,786241 |
| Tasa de aceptacion | 25,3628% | 25,5177% |
| Borradores correctos / propuestos | 2901 / 11438 | 2908 / 11396 |
| Rondas de verificacion | 1634 | 1628 |
| Tokens de salida por segundo | 63,3469 | 63,8391 |
| Tokens de borrador aceptados por segundo | 40,6480 | 41,0626 |
| Paridad de texto exacto frente al objetivo | 20/20 | 20/20 |

Salida del objetivo en solitario: 26,9769 tok/s. Aceleración observada del candidato: ~2,37x (resultado piloto de una sola ejecución, no repetido y no extensible a producción). La ganancia de acc_len del 0,391% no alcanzó el umbral de mejora del 3% fijado por el autor, y el objetivo de acc_len 5-6 no se logró.

| Posicion | Supervivencia de prefijo | Aceptacion condicional |
|---:|---:|---:|
| 1 | 66,15% | 66,15% |
| 2 | 41,15% | 62,21% |
| 3 | 26,78% | 65,07% |
| 4 | 18,30% | 68,35% |
| 5 | 12,04% | 65,77% |
| 6 | 8,42% | 69,90% |
| 7 | 5,77% | 68,61% |

Histograma de recuento exacto de propuestas aceptadas (0-7): `[551, 407, 234, 138, 102, 59, 43, 94]`. La model card aclara que estos bins no son probabilidades de aceptación por posición. La tasa de aceptación se define como correctos/propuestos y acc_len como 1 + correctos/rondas de verificación, donde el 1 representa el token bonus.

## Requisitos de hardware

- Pesos del borrador: ~274M parámetros en BF16 equivalen a unos 0,55 GB (cálculo propio a partir del recuento de parámetros declarado).
- Modelo objetivo Ling-3.0-tiny: 7,9B parámetros totales y 1,3B activos; en BF16 los pesos ocupan aproximadamente 15,8 GB (estimación propia, no publicada en la model card).
- Conjunto objetivo + borrador en BF16: aproximadamente 16,4 GB solo de pesos, más caché KV y buffers de activaciones (estimación propia).
- GPU registrada en la evaluación: 1× H200, con contexto 4096, concurrencia 1 y `--max-total-tokens 8192`.
- GPU de entrenamiento de la plataforma del autor: 1× H100 en modo offline y 2× H100 en modo online. No son las mismas configuraciones que la continuación de 3000 pasos evaluada.
- GPU de consumo: no validado. Por tamaño de pesos, una GPU de 24 GB podría albergar el conjunto en BF16 (estimación), pero la model card no ha probado GPUs distintas de la H200 registrada.
- Opciones de despliegue: SGLang con la imagen `lmsysorg/sglang:dev-cu12-Ling-3.0-tiny` (etiqueta mutable), backend de atención FA3, `SGLANG_RAGGED_VERIFY_MODE=static`, `--speculative-dspark-block-size 7` y `--speculative-num-draft-tokens 8`.
- No validado: SGLang en su versión actual estándar, otras GPUs, cuantización, vLLM, llama.cpp, Ollama y el modo thinking.
- Configuración de inferencia registrada: grafos CUDA y caché radix desactivados, inferencia determinista activada, `--chunked-prefill-size -1`, `--max-running-requests 1`.
- Latencia y throughput: 63,8391 tok/s de salida con el borrador frente a 26,9769 tok/s del objetivo solo, en 1× H200, contexto 4096, concurrencia 1, temperatura 0. No se han medido repeticiones de tiempos ni concurrencia 4/8.

## Comparativa con modelos similares

No se dispone de datos publicados de otros borradores de decodificación especulativa (EAGLE-3, Medusa u otros) en la información proporcionada, por lo que la comparación se limita a los elementos del ecosistema Ling documentados.

| Modelo | Tipo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| jayyun98/Ling-3.0-Tiny-DSpark | Borrador DSpark (comunidad, experimental) | ~274M | 4096 evaluados | other | acc_len 2,786; 63,84 tok/s; ~2,37x sobre el objetivo |
| inclusionAI/Ling-3.0-flash-DSpark | Borrador DSpark (oficial) | no disponible | no disponible | no disponible | no disponible |
| inclusionAI/Ling-3.0-tiny | Modelo objetivo, MoE híbrido de razonamiento | 7,9B totales, 1,3B activos | no disponible | no disponible | 26,9769 tok/s en solitario (medición del autor del borrador) |
| Otros borradores especulativos (EAGLE-3, Medusa) | Borrador / cabezas de decodificación especulativa | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias

- No es un LLM independiente: cargarlo solo como modelo de generación de texto en Transformers no es un uso válido.
- Rendimiento por debajo del objetivo declarado: la ganancia de acc_len fue del 0,391%, frente al umbral del 3% fijado por el autor, y no se alcanzó el objetivo de acc_len 5-6.
- La aceleración de ~2,37x procede de una única ejecución piloto, sin repeticiones ni validación a escala de producción.
- Contexto validado limitado a 4096 tokens; las 131072 posiciones máximas configuradas no acreditan soporte de contexto largo.
- No se ha probado la puerta independiente de 64 prompts largos de 1024 tokens, ni concurrencia 4/8, ni mediciones repetidas.
- No validado con vLLM, llama.cpp, Ollama, cuantización, otras GPUs ni el modo thinking. La etiqueta de la imagen de SGLang usada es mutable y no se ha vuelto a probar para esta versión.
- La paridad de texto exacto 20/20 solo es evidencia para este piloto, no una garantía universal de corrección.
- La licencia "other" y el etiquetado "research use, not production certification" restringen el uso comercial; conviene revisar los términos exactos antes de cualquier despliegue.
- La exclusión del conjunto de retención se basó en hashes exactos de prompt e identificadores, sin descontaminación semántica ni de preentrenamiento; la model card reconoce que los datos brutos no se publican.
- La mejora no puede atribuirse únicamente a los 512 prompts adicionales, ya que datos y horizonte de entrenamiento cambiaron a la vez.
- No se declaran sesgos, idiomas soportados ni riesgo de alucinación específicos; al depender del objetivo, hereda las limitaciones de Ling-3.0-tiny sin que se hayan verificado en este candidato.
- Cero descargas y cero "likes" en el momento de la consulta, sin adopción comunitaria que permita validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jayyun98/Ling-3.0-Tiny-DSpark
- Modelo objetivo: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Borrador oficial relacionado: https://huggingface.co/inclusionAI/Ling-3.0-flash-dspark
- Documentación de la serie Ling (Ant Group): https://developer.ant-ling.com/en/docs/models/ling/
- Análisis de Ling 3.0 Tiny (Artificial Analysis): https://artificialanalysis.ai/models/ling-3-0-tiny
- Ficha de Ling 3.0 Tiny en SourceForge: https://sourceforge.net/projects/ling-3-0-tiny/
- GitHub del autor: https://github.com/JayYun98
- LinkedIn del autor: https://www.linkedin.com/in/jay-yun-43a917174/
