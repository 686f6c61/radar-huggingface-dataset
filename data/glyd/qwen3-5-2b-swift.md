# glyd/Qwen3.5-2B-swift

## Resumen

glyd/Qwen3.5-2B-swift es un checkpoint cuantizado del modelo Qwen/Qwen3.5-2B publicado por glyd bajo el nivel de compresión "swift" de su propio motor de inferencia. Se trata de una cuantización de una sola pasada sobre los pesos originales en bf16, con un peso medio de aproximadamente 5,5 bits por parámetro y un tamano de repositorio de 1,3 GB, lo que supone un 65 % menos que los 3,8 GB del bf16 original. No es una cuantización sin perdida: la divergencia KL frente a bf16 medida sobre WikiText-2 es de 0,0224.

El modelo base Qwen3.5-2B cuenta con 1.881.825.088 parámetros según la model card; el checkpoint cuantizado empaquetado ocupa 1.296.130.995 parámetros en safetensors (el Hub cuenta bytes empaquetados y lo etiqueta como "8-bit", aunque la propia ficha aclara que la media real es de unos 5,5 bits por peso). Soporta contextos de hasta 32 000 tokens y esta pensado para ejecutarse en GPU de consumo con muy poca memoria.

Su relevancia es practica: permite servir un modelo de ~1,9 mil millones de parámetros en tarjetas como una RTX 4090 con solo 2,2 GB de memoria a 4k de contexto y 443 tokens/s, algo interesante para despliegue local en el borde. El precio a pagar es una degradacion medible de las probabilidades de siguiente token, la ausencia de la parte de vision del modelo base y la dependencia exclusiva del motor propietario de Glyd (BUSL-1.1), que no es compatible con vLLM ni con transformers por el momento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el tag `qwen3_5` indica que deriva de la familia Qwen3.5; el tipo concreto de transformer no se especifica) |
| Parametros totales | 1.881.825.088 (modelo base, segun la model card); 1.296.130.995 en el checkpoint empaquetado (recuento real de safetensors) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 32 000 tokens (confirmado en la tabla de memoria de la model card) |
| Tipos de cuantizacion | Cuantizacion propia "swift" a ~5,5 bits por peso, generada en una sola pasada desde bf16; el Hub la etiqueta como 8-bit |
| Idiomas soportados | No disponible |
| Licencia | Pesos: Apache-2.0 (heredada de Qwen/Qwen3.5-2B). Motor Glyd: BUSL-1.1 |
| Formato de pesos | safetensors (empaquetados para el motor Glyd) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen3.5-2B en la documentacion proporcionada: ni el numero de capas, ni el tipo de atencion, ni la composicion del dataset de entrenamiento, ni si hubo fases de RLHF o DPO. El tag `qwen3_5` de HuggingFace indica unicamente la familia a la que pertenece. La model card menciona de forma indirecta que el modelo base incorpora una "parte de vision" que no se incluye en este checkpoint, lo que sugiere que Qwen3.5-2B es multimodal, aunque no se detallan sus caracteristicas.

Lo que si esta documentado es el proceso de cuantizacion: Glyd aplica una cuantizacion de una sola pasada sobre los pesos bf16 originales (commit `15852e8c` de Qwen/Qwen3.5-2B), sin reentrenamiento posterior ni ajuste fino de recuperacion. El resultado son pesos de aproximadamente 5,5 bits de media, en un formato propietario que requiere el motor Glyd para ejecutarse. La fidelidad se mide con divergencia KL de 0,0224 sobre WikiText-2, frente a los 0,00581 del nivel "kestrel" del mismo autor, mas conservador en tamano pero mas fiel al original.

## Capacidades

- Generacion de texto autoregresiva (pipeline `text-generation`).
- Uso conversacional multi-turno (tag `conversational`), con soporte de contextos de hasta 32 000 tokens.
- Inferencia con memoria reducida: 2,2 GB en RTX 4090 a 4k de contexto, 2,0 GB en RTX A6000.
- Ejecucion en GPU de consumo y de gama profesional con el motor Glyd (`glyd run Qwen/Qwen3.5-2B:swift`).
- Capacidad de vision: no incluida en este checkpoint (el autor indica explicitamente que la parte de vision del modelo base queda fuera).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Inferencia local en GPU de consumo: con 2,2 GB de memoria a 4k de contexto en una RTX 4090, el modelo cabe holgadamente junto a otras cargas en la misma tarjeta, lo que permite montar asistentes de texto sin depender de la nube.
- Prototipado rapido de aplicaciones conversacionales: el formato `glyd run Qwen/Qwen3.5-2B:swift` permite levantar un endpoint de chat en un solo comando sobre Linux con driver NVIDIA 580 o superior, util para validar prompts e interfaces antes de escalar a modelos mayores.
- Generacion de texto por lotes a bajo coste: con 443 tokens/s en RTX 4090 y 355 tokens/s en L40S, es adecuado para tareas de resumen, clasificacion o reformulacion sobre volumenes grandes de documentos donde el coste por token importa.
- Despliegue en el borde con GPU integrada o profesional de gama baja: el consumo de 2,0-2,3 GB a 4k permite ejecutarlo en RTX A6000 y L40/L40S, equipos habituales en estaciones de trabajo on-premise.
- Ventanas de contexto largas en un solo equipo: soporta 32k tokens en RTX 4090, L40S, L40 y RTX A6000, lo que habilita resumen de documentos extensos y analisis de conversaciones largas sin fragmentacion.
- Evaluacion comparativa de niveles de cuantizacion: dado que el autor publica los niveles "kestrel" y "swift" del mismo modelo base, sirve para estudiar el compromiso entre tamano, fidelidad (KL) y velocidad en pipelines de investigacion sobre cuantizacion.
- Pruebas de regresion de calidad textual: al conocerse la divergencia KL frente a bf16 (0,0224), se puede usar como referencia controlada para medir cuanto degrada una cuantizacion agresiva en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos son la divergencia KL y las mediciones de velocidad y memoria del motor Glyd.

Comparativa de niveles de cuantizacion del mismo modelo base (segun la model card):

| Version | Tamano | Reduccion vs bf16 | KL vs bf16 (WikiText-2) | RTX 4090 |
|---|---|---|---|---|
| bf16 (original) | 3,8 GB | – | 0 | – |
| kestrel | 1,5 GB | 59 % | 0,00581 | 396 tok/s |
| swift (este repositorio) | 1,3 GB | 65 % | 0,0224 | 443 tok/s |

Velocidad y memoria (medido el 2026-10-09 con glyd 0.29.4, una GPU por prueba, contexto de 4k tokens):

| GPU | Tokens/s | Primer token | Memoria a 4k | Contexto 32k |
|---|---|---|---|---|
| RTX 4090 | 443 | 47 ms | 2,2 GB | Si |
| L40S | 355 | 41 ms | 2,3 GB | Si |
| L40 | 352 | 45 ms | 2,3 GB | Si |
| RTX A6000 | 295 | 71 ms | 2,0 GB | Si |

## Requisitos de hardware

- VRAM de inferencia: 2,2 GB en RTX 4090 y 2,3 GB en L40S/L40 a 4k de contexto; 2,0 GB en RTX A6000. El autor no desglosa el consumo a 32k.
- GPU recomendadas por el autor: RTX 4090, L40S, L40 y RTX A6000, todas validadas con contexto de 32k.
- Compatibilidad con GPU de consumo: si, cabe en una RTX 4090 (y presumiblemente en tarjetas con mas de 3 GB de VRAM, aunque el autor solo certifica ese modelo).
- Sistema operativo y controladores: Linux con GPU NVIDIA y driver 580 o superior.
- Opciones de despliegue: exclusivamente el motor Glyd (`glyd run Qwen/Qwen3.5-2B:swift`). El autor indica explicitamente que no es compatible con vLLM ni con transformers "todavia".
- Latencia: primer token entre 41 ms (L40S) y 71 ms (RTX A6000); 47 ms en RTX 4090.
- Throughput: 443 tok/s en RTX 4090, 355 tok/s en L40S, 352 tok/s en L40 y 295 tok/s en RTX A6000.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar con las otras dos variantes del mismo modelo base. No se dispone de datos de modelos alternativos de la misma categoria (por ejemplo, otros modelos de ~2B cuantizados) con los que contrastar parametros, contexto o rendimiento.

| Modelo | Parametros | Tamano | Contexto | KL vs bf16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| glyd/Qwen3.5-2B-swift | 1.881.825.088 (base) | 1,3 GB | 32k | 0,0224 | Apache-2.0 (pesos) | Requiere motor Glyd |
| glyd/Qwen3.5-2B-kestrel | 1.881.825.088 (base) | 1,5 GB | No disponible | 0,00581 | Apache-2.0 (pesos) | Requiere motor Glyd |
| Qwen/Qwen3.5-2B (bf16) | 1.881.825.088 | 3,8 GB | No disponible | 0 | Apache-2.0 | Pesos originales |

Alternativas externas de la misma categoria: no disponible.

## Limitaciones y advertencias

- Cuantizacion con perdida: la divergencia KL de 0,0224 frente a bf16 sobre WikiText-2 es casi cuatro veces superior a la del nivel kestrel (0,00581), lo que implica una alteracion apreciable de la distribucion de probabilidades del siguiente token.
- Sin benchmarks de calidad: no hay resultados de MMLU, HumanEval, GSM8K ni tareas equivalentes, por lo que no se puede cuantificar el impacto real de la cuantizacion en tareas concretas.
- Compatibilidad restringida: no funciona con vLLM ni con transformers; solo con el motor Glyd sobre Linux y driver NVIDIA 580 o superior.
- Licencia del motor: aunque los pesos son Apache-2.0, el motor necesario para ejecutarlos es BUSL-1.1, gratuito solo para uso personal y no comercial en equipos propios. El uso comercial exige una licencia adicional de Glyd.
- Modalidad limitada: es un modelo solo de texto; la parte de vision del modelo base no esta incluida.
- Idiomas no documentados: la model card no especifica que lenguas soporta, lo que impide garantizar un comportamiento adecuado fuera del ingles o del chino sin validacion previa.
- Riesgo de alucinacion: no se documenta ninguna mitigacion especifica (RLHF, DPO o filtros), y el proceso de cuantizacion puede agravar este comportamiento.
- Sesgos: no se aporta informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento del modelo base.
- Madurez: el repositorio tiene 20 descargas y 0 likes, y fue publicado el 2026-10-10, por lo que carece de validacion por parte de la comunidad.
- Riesgo de etiquetado enganoso: el Hub marca el checkpoint como "8-bit", pero la model card aclara que la precision real es de unos 5,5 bits por peso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/glyd/Qwen3.5-2B-swift
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Commit del modelo base usado: https://huggingface.co/Qwen/Qwen3.5-2B/tree/15852e8c16360a2fea060d615a32b45270f8a8fc
- Variante kestrel: https://huggingface.co/glyd/Qwen3.5-2B-kestrel
- Motor Glyd: https://getglyd.com
- Script de instalacion del motor: https://getglyd.com/install.sh
