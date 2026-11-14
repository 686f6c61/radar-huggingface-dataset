# gureshov/Kimi-K3.1-Pro-Coding-720E-DSpark

## Resumen

Kimi-K3.1-Pro-Coding-720E-DSpark es un draft head (modelo borrador) para decodificacion especulativa sin perdida, publicado por el usuario gureshov como fine-tune no oficial del draft head de LithosAI/Kimi-K3.1-Pro-DSpark. Su funcion es acelerar la inferencia del modelo objetivo gureshov/Kimi-K3.1-Pro-Coding-720E, una variante de Kimi-K3.1-Pro con 720 de 896 expertos conservados y especializada en codigo. El modelo no genera respuestas de forma autonoma: propone tokens que el modelo objetivo verifica, de modo que la distribucion final de salida sigue siendo exactamente la del objetivo.

El problema que resuelve es concreto: tras el pruning de expertos, los estados ocultos y la distribucion de tokens del modelo objetivo se desplazan, y el draft head original acierta mucho menos. Este checkpoint reentrena las cinco capas del decodificador, la normalizacion final y la cabeza de Markov contra el objetivo podado, sobre trafico de codigo y sesiones de agente de codigo. Segun la model card, la longitud media de aceptacion sube de 3,92 a 5,49 (+40 %) en un conjunto retenido de 40 peticiones y 10.971 posiciones de draft.

El checkpoint contiene 2.249.289.601 parametros (2,25 mil millones) y ocupa 4,5 GB en el repositorio, en formato safetensors. No incluye el embedding de tokens ni la LM head, que se toman del modelo objetivo. Esta pensado para servirse con SGLang y el algoritmo DSPARK, y su relevancia actual radica en que permite recuperar parte del rendimiento de decodificacion especulativa perdido tras el pruning de expertos en un modelo de codigo de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft head para decodificacion especulativa DSPARK: 5 capas de decodificador, normalizacion final y cabeza de Markov, con proyeccion de caracteristicas del objetivo y cabeza de confianza congeladas |
| Parametros totales | 2.249.289.601 (2,25 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other, bajo Kimi K3.1-Pro License (Copyright (c) 2026 Moonshot AI) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un draft head para decodificacion especulativa del algoritmo DSPARK, disenado para emparejarse con gureshov/Kimi-K3.1-Pro-Coding-720E. Conserva exactamente los mismos tensores (nombres, formas y dtypes) y el mismo `config.json` que el draft head original de LithosAI. Se entrenaron las 5 capas del decodificador, la normalizacion final y la cabeza de Markov; quedaron congeladas y copiadas sin cambios la proyeccion de caracteristicas del objetivo, su normalizacion y la cabeza de confianza. El embedding de tokens y la LM head pertenecen al modelo objetivo y no se almacenan en este repositorio.

Los datos de entrenamiento son caracteristicas del objetivo registradas en servicio a partir de 363 peticiones (39 GB), mezcla de trafico de agente de codigo y conversaciones multiturno generadas por el propio objetivo. Por peticion se registraron la proyeccion fusionada de las capas 7, 23, 67, 83 y 91 del objetivo, su distribucion top-16 en la verificacion y los tokens; solo se supervisan las posiciones escritas por el modelo. La funcion de perdida combina 0,3 x entropia cruzada contra el token del objetivo y 0,7 x entropia cruzada contra su distribucion top-16 donde se registro. El entrenamiento uso 3 epocas con AdamW (beta 0,9/0,95), learning rate 2,5e-5 con 50 pasos de warm-up y decaimiento coseno, seguidas de 1 epoca adicional desde el mejor checkpoint con learning rate 1e-5, con bloques de 7 tokens borrador y una sola GPU. La decodificacion especulativa es sin perdida: cada token aceptado procede de la distribucion del propio objetivo, y el borrador solo altera la velocidad.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa sin perdida para el modelo objetivo Kimi-K3.1-Pro-Coding-720E.
- Propuesta de tokens borrador verificados por el objetivo; no produce respuestas por si mismo.
- Especializacion en trafico de codigo y sesiones de agente de codigo, la distribucion sobre la que fue reentrenado.
- Integracion con SGLang mediante el algoritmo DSPARK y relay estilo EAGLE.
- Compatibilidad de tensores y configuracion con el draft head original de LithosAI, lo que permite sustituirlo cambiando la ruta del draft model.
- No dispone de tool calling, capacidades de agente propias, vision, audio ni modo de razonamiento: esas funciones residen en el modelo objetivo.
- Capacidades multilingues: no disponibles de forma independiente; dependen del modelo objetivo.

## Casos de uso

- Servicio de generacion de codigo en produccion: desplegar Kimi-K3.1-Pro-Coding-720E con este draft head en SGLang para reducir la latencia por token en tareas de autocompletado y generacion de funciones, aprovechando la mayor aceptacion (5,49 frente a 3,92) sobre trafico de codigo.
- Agentes de codigo con multiples pasos: en sesiones de agente que encadenan ediciones, lecturas de ficheros y llamadas a herramientas, el draft reentrenado sobre trafico de agente de codigo mantiene una tasa de aceptacion alta en las posiciones generadas por el modelo.
- Asistentes de revision de codigo en IDE: integrar el par objetivo-borrador en un backend de baja latencia para sugerencias inline, donde el coste por token generado es critico.
- Generacion de tests y documentacion tecnica: usar el par en pipelines que producen texto tecnico estructurado, con la garantia de que la salida es identica a la del objetivo sin decodificacion especulativa.
- Despliegue en cluster con paralelismo de pipeline: la configuracion probada usa paralelismo de pipeline sobre 24 GPU NVIDIA Ampere (sm80), con el draft en la ultima etapa tras un relay estilo EAGLE, adecuada para servir el objetivo de 720 expertos en infraestructura multi-GPU.
- Recuperacion de rendimiento tras pruning de expertos: equipos que ya sirven la variante podada de 720 expertos pueden sustituir el draft head original por este checkpoint sin cambios de configuracion para mejorar la longitud de aceptacion en cargas de codigo.
- Experimentacion en investigacion sobre decodificacion especulativa: el checkpoint sirve como referencia de como reentrenar un draft head cuando la distribucion del objetivo cambia por pruning, con datos de aceptacion por posicion publicados.

## Benchmarks y rendimiento

Los datos disponibles son de aceptacion offline sobre un conjunto retenido de 40 peticiones y 10.971 posiciones de draft, con objetivo greedy (temperatura 0), bloque de 8 (token actual + 7 borrador) y objetivo Kimi-K3.1-Pro-Coding-720E:

| Draft | Longitud media de aceptacion |
|---|---|
| LithosAI/Kimi-K3.1-Pro-DSpark (original) | 3,92 |
| Este checkpoint | 5,49 (+40 %) |

Aceptacion acumulada por posicion de este checkpoint:

| k | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| Primeros k aceptados | 0,83 | 0,72 | 0,65 | 0,61 | 0,58 | 0,56 | 0,53 |
| Longitud de aceptacion con k tokens borrador | 1,83 | 2,55 | 3,21 | 3,82 | 4,40 | 4,96 | 5,49 |

Advertencias del autor sobre estas cifras: las peticiones retenidas proceden de la misma distribucion que el entrenamiento (codigo y sesiones de agente de codigo sobre el objetivo podado) y no son comparables con el 3,448 que la model card original reporta sobre 10 benchmarks publicos contra el Kimi-K3.1-Pro completo. En texto general o con el modelo completo, este checkpoint podria no ser mejor, o ser peor, que el original. Las cifras se calculan offline a partir de caracteristicas registradas en servicio; la aceptacion medida en vivo (con muestreo, gramaticas de tool calls y batching real) es menor, y el throughput extremo a extremo no se ha medido. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 4,5 GB en safetensors; el requisito dominante es el del modelo objetivo Kimi-K3.1-Pro-Coding-720E, no disponible en la informacion proporcionada.
- GPU recomendadas: la configuracion probada usa NVIDIA Ampere (sm80) con paralelismo de pipeline sobre 24 GPU, con el draft en la ultima etapa tras un relay estilo EAGLE.
- GPU de consumo: no se ha verificado el funcionamiento en GPU de consumo; el despliegue probado requiere un cluster multi-GPU.
- Opciones de despliegue: SGLang con `--speculative-algorithm DSPARK`, `--speculative-draft-model-path` apuntando a este checkpoint, `--speculative-dspark-block-size 7` y `--speculative-num-draft-tokens 8`. Las rutas estandar de SGLang y vLLM para DSpark deberian cargarlo como el original, pero no se ha verificado.
- Nota: solo se ha probado con una build parcheada de SGLang sobre NVIDIA Ampere (sm80).
- Latencia y throughput: no medidos extremo a extremo; la mejora de aceptacion de 3,92 a 5,49 es la unica metrica de rendimiento disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aceptacion media | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gureshov/Kimi-K3.1-Pro-Coding-720E-DSpark | 2,25 mil millones | no disponible | 5,49 (offline, conjunto retenido) | Kimi K3.1-Pro License | Hugging Face |
| LithosAI/Kimi-K3.1-Pro-DSpark (original) | no disponible | no disponible | 3,92 (mismo conjunto); 3,448 reportado en 10 benchmarks publicos contra el modelo completo | Kimi K3.1-Pro License | Hugging Face |
| Draft heads EAGLE de la familia Kimi-K3.1 | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa solo es valida contra el draft head original sobre el mismo objetivo podado y el mismo conjunto retenido. El dato de 3,448 de la model card original corresponde a otro objetivo (Kimi-K3.1-Pro completo) y a otros benchmarks, por lo que no es comparable.

## Limitaciones y advertencias

- Modelo no oficial: no esta hecho, revisado ni respaldado por LithosAI ni por Moonshot AI.
- No es un modelo generativo autonomo: sin el objetivo Kimi-K3.1-Pro-Coding-720E no produce respuestas utiles.
- Las cifras de aceptacion proceden de la misma distribucion que el entrenamiento; en texto general o con el modelo completo podria rendir peor que el draft head original.
- La aceptacion en vivo con muestreo, gramaticas de tool calls y batching real es inferior a la medida offline; el throughput extremo a extremo no se ha medido.
- Solo se ha probado con una build parcheada de SGLang sobre NVIDIA Ampere (sm80) con 24 GPU en paralelo de pipeline; las rutas estandar de SGLang y vLLM no estan verificadas.
- Licencia Kimi K3.1-Pro License (Copyright (c) 2026 Moonshot AI): es una licencia "other" con condiciones que se aplican a cualquier usuario; deben revisarse antes de uso comercial.
- Riesgo de sesgos y alucinacion: no evaluado de forma independiente en este checkpoint; hereda las caracteristicas del objetivo y de los datos de codigo usados en el reentrenamiento.
- Idiomas soportados y longitud de contexto: no disponibles en la informacion proporcionada.
- El repositorio registra 0 descargas y 0 likes, y no hay validacion externa de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gureshov/Kimi-K3.1-Pro-Coding-720E-DSpark
- Modelo base (draft head original): https://huggingface.co/LithosAI/Kimi-K3.1-Pro-DSpark
- Modelo objetivo: https://huggingface.co/gureshov/Kimi-K3.1-Pro-Coding-720E
- Licencia (incluida en el repositorio): LICENSE
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
