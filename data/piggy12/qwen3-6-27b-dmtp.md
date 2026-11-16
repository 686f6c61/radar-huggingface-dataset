# Piggy12/Qwen3.6-27B-DMTP

## Resumen

Qwen3.6-27B-DMTP es un modelo borrador (*draft model*) para decodificacion especulativa sobre el modelo objetivo Qwen/Qwen3.6-27B, desarrollado por el usuario Piggy12. No se trata de un modelo generativo autonomo: el repositorio contiene unicamente los pesos del borrador, y requiere por separado el modelo objetivo de 27B, su modulo MTP nativo y el embedding de tokens y la cabeza del modelo de lenguaje compartidos. Su proposito es acelerar la inferencia del modelo grande aceptando multiples tokens por ronda de verificacion.

Tecnicamente combina dos mecanismos: la prediccion nativa del primer token mediante MTP (Multi-Token Prediction) del modelo base y el borrador paralelo por bloques DFlash2, que propone los tokens T2 a T7. El borrador consta de cinco capas con tamano oculto 5120 y tamano intermedio 6144, y utiliza caracteristicas del objetivo extraidas de las capas 0, 15, 30, 45 y 60. Los pesos estan en BF16 y el repositorio ocupa 2,3 GB.

La relevancia de esta ficha es acotada: es un componente de infraestructura para servir Qwen3.6-27B con mayor throughput, no un modelo para evaluar en tareas de razonamiento o generacion. Su adopcion exige una rama especifica de SGLang con soporte DMTP y un adaptador T1-residual concreto, por lo que no es un artefacto plug-and-play.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Borrador de decodificacion especulativa (5 capas transformer, hidden size 5120, intermediate size 6144) con MTP nativo + DFlash2 |
| Parametros totales | 1.166.809.600 (pesos del borrador; el objetivo Qwen3.6-27B se distribuye aparte) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el borrador; la evaluacion usa un limite de contexto de 262.144 tokens y longitud de entrenamiento maxima de 3.072 |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16), framework PyTorch |

## Arquitectura y entrenamiento

El borrador sigue un esquema de doble ancla. En primer lugar, el modulo MTP nativo del modelo objetivo propone el primer token candidato T1. A continuacion, DFlash2 recibe la secuencia `[A, T1, MASK, MASK, MASK, MASK, MASK, MASK]`, donde A es el ultimo token emitido, y propone T2 a T7. La representacion MTP que predijo T1 se normaliza y se pasa por una red residual de rango 256 cuya salida se suma unicamente al embedding de entrada de T1: `E(T1) <- E(T1) + W_up SiLU(W_down RMS(h_MTP))`. El embedding de A, los seis embeddings MASK y la ruta original de caracteristicas de contexto del objetivo permanecen sin cambios; la proyeccion de salida residual se inicializo a cero al comienzo del entrenamiento.

El borrador incorpora modulos de convolucion DFlash2 y un selector de candidatos de rango 256 con top-k 16. Se entreno sobre el dataset Huang2020/qwen3.6-27B-reasoning-regen con longitud de secuencia maxima de 3072, batch global de 128 y tres epocas, alcanzando el paso final 41.209. Durante el entrenamiento el modelo objetivo y su MTP nativo permanecieron congelados; T1 usa el token de referencia en entrenamiento y la propuesta del MTP en inferencia. La verificacion final la realiza el modelo objetivo sobre los siete candidatos propuestos.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa: propone hasta siete tokens por ronda de verificacion (uno del MTP nativo y seis de DFlash2).
- Prediccion de bloques en paralelo con DFlash2, condicionada por caracteristicas del modelo objetivo de las capas 0, 15, 30, 45 y 60.
- Integracion con el MTP nativo del objetivo mediante un adaptador T1-residual (no compatible con adaptadores de fusion por concatenacion).
- Mejora de la longitud aceptada por verificacion en tareas de codigo, matematicas, dialogo, agentes, SWE y horizonte largo, segun la evaluacion del autor.
- No soporta por si mismo generacion de texto, tool calling, vision ni audio: es un componente auxiliar que depende del modelo objetivo.

## Casos de uso

- Servicio de Qwen3.6-27B con mayor throughput: desplegar el objetivo con este borrador en SGLang para aumentar el numero de tokens aceptados por ronda de verificacion y reducir el coste por token generado.
- Cargas agenticas de horizonte largo: la evaluacion reporta una longitud aceptada por verificacion de 4,3310 en tareas long-horizon frente a 3,1929 del baseline DFlash2, lo que lo hace adecuado para sesiones con hasta 28.000 tokens de salida.
- Tareas de ingenieria de software (SWE): con 3,9427 de longitud aceptada frente a 2,9273 del baseline, resulta util en pipelines de generacion y edicion de codigo donde dominan secuencias largas y estructuradas.
- Razonamiento matematico en produccion: 4,8871 frente a 4,2909 del baseline, apropiado para servicios que resuelven problemas paso a paso con salidas extensas.
- Despliegue multi-GPU con tensor parallelism: la configuracion de referencia usa TP4, concurrencia hasta 32 y limite de contexto de 262.144 tokens, pensada para servir en clústeres con A100/H100.
- Evaluacion comparativa de tecnicas de drafting: sirve como referencia reproducible para medir aceptacion de borradores (DFlash2 frente a DMTP) con 64 entradas fijas por tarea y rechazo por muestreo a nivel de token.
- Investigacion sobre integracion de representaciones MTP: el autor sugiere usar el blog y el repositorio para adaptar DMTP a otros frameworks de inferencia, verificando alineacion de estados ocultos, condicionamiento y gestion de cache.

## Benchmarks y rendimiento

La evaluacion mide longitud aceptada por verificacion (mayor es mejor), agregada sobre rondas de verificacion, con TP4, concurrencia hasta 32, contexto de 262.144 tokens, hasta 28.000 tokens de salida, temperatura 1, top-p 1 y rechazo por muestreo a nivel de token.

| Tarea | DFlash2 (per-verify acc len) | DMTP dual-anchor (per-verify acc len) |
|---|---|---|
| Code | 3,9621 | 4,6022 |
| Math | 4,2909 | 4,8871 |
| MT-Bench | 4,0044 | 4,1826 |
| Agent | 3,8197 | 4,6871 |
| SWE | 2,9273 | 3,9427 |
| Long-horizon | 3,1929 | 4,3310 |

Estos resultados miden aceptacion del borrador, no precision en la resolucion de tareas. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 2,3 GB en BF16 (1.166.809.600 parametros), adicionales a la memoria del modelo objetivo de 27B.
- El modelo objetivo de 27B en BF16 requiere del orden de 54 GB de pesos, mas cache KV; la configuracion de referencia usa TP4, lo que implica al menos cuatro GPU.
- GPU recomendadas: A100 o H100 en configuracion TP4 segun la referencia del autor; no se documenta soporte en GPU de consumo.
- No cabe en una GPU de consumo junto con el objetivo de 27B en BF16; no hay datos publicados sobre despliegue cuantizado del objetivo con este borrador.
- Opciones de despliegue: exclusivamente SGLang con la rama DMTP (`feat/dmtp-upstream-20261113` o `dmtp-qsa-four-slot-20261113`), con `--speculative-algorithm DFLASH`, `--speculative-num-draft-tokens 8`, backend de atencion fa3, `--page-size 1`, `--disable-overlap-schedule` y `--disable-radix-cache`. No es compatible con el cargador estandar de Transformers, vLLM, llama.cpp ni Ollama.
- Variable de entorno obligatoria: `SGLANG_DMTP_T1_RESIDUAL=1`.
- Latencia y throughput: no disponibles de forma absoluta; solo se publican las longitudes aceptadas por verificacion de la tabla anterior.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-DMTP (este) | Borrador especulativo MTP + DFlash2 | 1,17 B | no disponible (entrenamiento 3.072) | no disponible | Hugging Face, requiere SGLang modificado |
| Baseline DFlash2 del autor | Borrador especulativo paralelo | no disponible | no disponible | no disponible | Solo como referencia en la model card |
| Qwen/Qwen3.6-27B | Modelo objetivo denso | 27 B (segun nombre) | 262.144 en la evaluacion | no disponible | Hugging Face |

No se dispone de datos publicados sobre otros borradores comparables (EAGLE, Medusa u otras variantes) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el objetivo Qwen3.6-27B, su MTP nativo y el embedding y cabeza compartidos no puede ejecutarse.
- Requiere una rama no oficial de SGLang y el adaptador T1-residual; no funciona con adaptadores de fusion por concatenacion ni con cargadores estandar.
- La model card marca `inference: false`; el uso previsto es como borrador dentro de un servidor SGLang, no mediante `pipeline()` de Transformers.
- Los benchmarks publicados miden aceptacion del borrador, no calidad de las respuestas; no deben interpretarse como mejora de precision del modelo objetivo.
- El autor indica que ninguno de los borradores se entreno con datos especificos de agentes, por lo que la generalizacion a cargas agenticas no esta garantizada fuera de la evaluacion reportada.
- El repositorio tenia 0 descargas y 1 like en el momento de la consulta, y la model card menciona que el repositorio era privado; la validacion externa es practicamente nula.
- Licencia no especificada: no hay garantia de uso comercial y debe verificarse la licencia del modelo base Qwen3.6-27B por separado.
- Idiomas soportados no documentados; las capacidades linguisticas dependen integramente del modelo objetivo.
- Riesgo de desalineacion al portar la implementacion a otros frameworks (estados ocultos, condicionamiento y gestion de cache), segun advierte el propio autor.
- No hay datos publicados sobre sesgos ni tasas de alucinacion del borrador; al no generar texto de forma autonoma, estos riesgos recaen en el modelo objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Piggy12/Qwen3.6-27B-DMTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Blog del metodo: https://sylvan820.github.io/D-MTP/
- Repositorio GitHub (rama dmtp-qsa-four-slot-20261113): https://github.com/Sylvan820/sglang-dmtp/tree/dmtp-qsa-four-slot-20261113
- Pull request de SGLang: https://github.com/sgl-project/sglang/pull/50270
- Dataset de entrenamiento: https://huggingface.co/datasets/Huang2020/qwen3.6-27B-reasoning-regen
