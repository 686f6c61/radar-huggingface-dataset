# magnitudedev/MiniCPM5-2B-DSpark-GGUF

## Resumen

MiniCPM5-2B-DSpark-GGUF es un modelo borrador (drafter) de decodificacion especulativa en formato GGUF, publicado por magnitudedev como copia de organizacion del artefacto original de openbmb. No es un modelo de lenguaje autonomo: actua como red de propuestas que acelera la inferencia de un modelo objetivo (target) MiniCPM5, del que depende de forma explicita. El repositorio contiene un unico fichero GGUF (`MiniCPM5-2.6B-DSpark.gguf`) de aproximadamente 0,7 GB.

El artefacto declara 323.776.001 parametros (unos 324 millones), cantidad que corresponde al bloque borrador y no al modelo objetivo de 2B que figura en el nombre del repositorio. La tecnica empleada, denominada DSpark (implementada en SGLang sobre el componente DFlash), usa atencion bidireccional dentro del bloque de borrador y una seleccion de propuestas anclada a la fila central del bloque.

Es relevante ahora porque forma parte del ecosistema de runtime "Magnitude", en el que mediciones de terceros atribuyen aceleraciones de hasta un 92 % frente a llama.cpp mediante decodificacion especulativa con drafters de este tipo, sobre hardware de gama consumer (por ejemplo, un Mac con 16 GB de memoria unificada). Su licencia Apache 2.0 facilita la integracion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador (drafter) para decodificacion especulativa; bloque DSpark/DFlash con atencion bidireccional |
| Parametros totales | 323.776.001 (unos 324 M, dato de safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; nivel de cuantizacion concreto no especificado |
| Idiomas soportados | no disponible (etiqueta "conversational" en el repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `MiniCPM5-2.6B-DSpark.gguf`) |

## Arquitectura y entrenamiento

Se trata de un bloque borrador de decodificacion especulativa, no de un modelo generativo completo. La model card indica que el bloque de borrador utiliza atencion bidireccional (`dflash.attention.causal = false`) y que la seleccion de propuestas comienza en la fila ancla (`dflash.sample_from_anchor = true`). La configuracion se ha derivado del checkpoint, de la configuracion DSpark de SGLang y de la implementacion DFlash del mismo proyecto, y se ha verificado contra salidas de referencia.

No se dispone de informacion sobre datos de entrenamiento: no constan el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. El artefacto se describe como una copia propiedad de la organizacion que preserva el payload de tensores y la cuantizacion del GGUF original de openbmb, identificado por la revision `a261d2b4abc9c9ebfbad2af8a817a09802fc4ca3` y con SHA-256 `5bc6303d2171984a8e00823cb5c74e91629e7c39a419b10125a6c2f1d4fa9f84`.

## Capacidades

- Generacion de propuestas de tokens (drafting) para acelerar la decodificacion del modelo objetivo MiniCPM5.
- No genera texto de forma autonoma; su salida debe validarse contra el modelo objetivo.
- Compatible con decodificacion especulativa en runtimes que implementen DSpark/DFlash, en particular SGLang.
- Requiere obligatoriamente el modelo objetivo correspondiente para funcionar.
- Etiqueta "conversational" asociada al artefacto, heredada del modelo base.
- Sin soporte declarado de tool calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Aceleracion de inferencia de MiniCPM5 en produccion: se carga junto al modelo objetivo para reducir el numero de pasos autoregresivos efectivos mediante propuestas validadas en paralelo.
- Despliegue en hardware de gama consumer: al ocupar el borrador unos 0,7 GB, apenas incrementa los requisitos de memoria sobre el modelo objetivo, lo que permite ejecutar decodificacion especulativa en equipos modestos.
- Reduccion de latencia en asistentes conversacionales: el esquema de borrador es especialmente util en generacion token a token interactiva, donde la latencia por token es critica.
- Servidores de inferencia con alto throughput: integrar el borrador en un servidor SGLang permite aumentar tokens por segundo por GPU al amortizar el coste de comprobacion en lote.
- Experimentacion con tecnicas de decodificacion especulativa: sirve como caso reproducible para estudiar DSpark/DFlash y comparar configuraciones de atencion bidireccional y seleccion de propuestas.
- Reproduccion de mediciones de rendimiento: util para replicar pruebas de terceros que comparan el runtime Magnitude frente a llama.cpp en entornos de memoria unificada.
- Formacion e investigacion: permite analizar como un bloque borrador de ~324 M de parametros interactua con un objetivo de 2B sin necesidad de reentrenar el modelo principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) para este artefacto en la informacion disponible. Las fuentes web encontradas describen mediciones de rendimiento del runtime Magnitude con drafters DSpark del mismo ecosistema, no del modelo en si: se reporta una afirmacion de hasta un 92 % mas rapido que llama.cpp, medida de forma independiente en un Mac con 16 GB de memoria unificada (M4) y en pruebas comparativas publicadas en note.com y zenn.dev. Estas cifras corresponden a la comparacion entre runtimes y a hardware concreto, por lo que no deben interpretarse como un benchmark del modelo aislado.

## Requisitos de hardware

- VRAM adicional del borrador: aproximadamente 0,7 GB segun el tamano del repositorio; es una estimacion a partir del fichero, no un dato oficial.
- VRAM total: depende del modelo objetivo MiniCPM5, cuya cuantizacion y requisitos no se detallan en la informacion disponible.
- GPU recomendadas: no disponibles de forma especifica; el borrador, por su tamano, no exige GPU de centro de datos (A100, H100) y esta pensado para entornos ligeros.
- Compatibilidad con GPU consumer: si, por el reducido tamano del borrador; los tests de terceros se han realizado en hardware Apple con 16 GB de memoria unificada.
- Opciones de despliegue: SGLang, que cuenta con la implementacion DSpark/DFlash referenciada; otros runtimes que soporten GGUF con decodificacion especulativa (el ecosistema Magnitude y, por comparacion, llama.cpp).
- Latencia y throughput: los unicos datos disponibles son comparativas de runtime entre Magnitude y llama.cpp; no hay cifras de latencia o throughput especificas de este modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| magnitudedev/MiniCPM5-2B-DSpark-GGUF | Borrador especulativo DSpark | ~324 M | no disponible | Apache 2.0 | HuggingFace |
| openbmb/MiniCPM5-2B-DSpark-GGUF | Borrador especulativo DSpark (original) | no disponible en la informacion | no disponible | no disponible en la informacion | HuggingFace |
| Drafter DSpark de LFM2.5 | Borrador especulativo (mencionado en pruebas de terceros) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento (benchmarks, contexto o calidad) entre estos artefactos; la comparativa se limita a la naturaleza del artefacto y su licencia.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo objetivo MiniCPM5 para producir texto; sin el, solo genera propuestas de tokens.
- Discrepancia de nomenclatura: el nombre indica "2B", pero los parametros medidos son 323.776.001 (~324 M); el numero del nombre parece referirse al modelo objetivo, no al borrador.
- Ausencia total de datos de entrenamiento, idiomas, contexto y cuantizaciones, lo que dificulta evaluar su comportamiento.
- Sin resultados de benchmarks de calidad publicados; las cifras disponibles son comparativas de runtime de terceros y no validan la precision del modelo.
- Repositorio con 0 descargas y 0 likes en el momento del analisis, lo que implica ausencia de validacion comunitaria.
- Fechas de creacion y actualizacion registradas en 2026, anomalia temporal que conviene verificar antes de su uso.
- Sesgos y riesgo de alucinacion: no evaluables directamente, ya que el borrador no genera texto final; heredara las caracteristicas del objetivo cuando este valide sus propuestas.
- Licencia Apache 2.0 en este artefacto; hay que comprobar por separado la licencia del modelo objetivo y del runtime utilizado.
- La aceleracion efectiva depende del runtime, del hardware y de la tasa de aceptacion de propuestas, que no esta documentada.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/magnitudedev/MiniCPM5-2B-DSpark-GGUF
- GGUF original de openbmb (revision a261d2b4): https://huggingface.co/openbmb/MiniCPM5-2B-DSpark-GGUF/tree/a261d2b4abc9c9ebfbad2af8a817a09802fc4ca3
- Configuracion DSpark de SGLang: https://github.com/sgl-project/sglang/blob/264d1c20153cadc921670b982e6531d9800353e6/python/sglang/srt/speculative/dspark_components/dspark_config.py
- Implementacion DFlash de SGLang: https://github.com/sgl-project/sglang/blob/264d1c20153cadc921670b982e6531d9800353e6/python/sglang/srt/models/dflash.py
- Medicion de terceros en note.com (Magnitude frente a llama.cpp): https://note.com/hacklog_stealth/n/nd8b606b944d2
- Analisis comparativo en zenn.dev (16 GB Mac): https://zenn.dev/amu_lab/articles/magnitude-vs-llamacpp-16gb-mac-benchmark
- Noticias relacionadas (referencia a MiniCPM5 2B y Magnitude): https://aidailynews.com.cn/
