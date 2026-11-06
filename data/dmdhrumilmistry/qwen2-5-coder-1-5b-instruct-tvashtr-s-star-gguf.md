# dmdhrumilmistry/Qwen2.5-Coder-1.5B-Instruct-Tvashtr-S-star-GGUF

## Resumen

Este repositorio contiene los pesos originales de Qwen2.5-Coder-1.5B-Instruct empaquetados en formato GGUF (Q4_K_M y F16) por el autor dmdhrumilmistry, junto con un perfil de configuracion para Tvashtr, una herramienta de inferencia que aplica busqueda en tiempo de test (test-time compute) mediante el algoritmo S\* (Li et al. 2025, arXiv 2502.14382). El modelo base es un transformer decoder-only de 1.5B parametros desarrollado por Alibaba Qwen, especializado en generacion de codigo.

La propuesta central no es un modelo nuevo entrenado, sino una capa de inferencia que mejora la precision en generacion de codigo sin reentrenar pesos: muestrea multiples candidatos en paralelo, los repara con feedback de ejecucion sobre los ejemplos del prompt y selecciona el ganador ejecutando los finalistas sobre entradas sintetizadas que los discriminan. Segun la model card, esto eleva el pass@1 en HumanEval del 70,7% al 80,5% en la mitad held-out del conjunto de test, con un coste de 8,5 llamadas al modelo por problema y 35,7 segundos por problema en una RTX 3060.

Es relevante ahora porque demuestra una via practica para acercar el rendimiento de un modelo de 1.5B al de un 7B en tareas de codigo (84,2% del 7B plano) manteniendo el footprint de memoria del modelo pequeno, a costa de latencia y de capacidad de ejecutar codigo en el host.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-1.5B-Instruct) |
| Parametros totales | 1,5B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (~0,9 GB) y F16 (~3 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5-Coder de Alibaba, afinado para instrucciones y generacion de codigo. Este repositorio no introduce cambios en los pesos: los GGUF publicados son los pesos originales cuantizados a Q4_K_M y F16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base en la informacion proporcionada.

La innovacion tecnica reside en la capa Tvashtr, que implementa el algoritmo S\* de busqueda en tiempo de test. El flujo consta de tres fases: muestreo de varios candidatos en paralelo, reparacion de cada candidato usando feedback de ejecucion contra los ejemplos incluidos en el prompt, y seleccion del ganador ejecutando los finalistas sobre inputs sintetizados que maximizan la discriminacion entre soluciones. La model card reporta varias estrategias comparadas en la mitad de desarrollo: `direct` (72,0% pass@1, 1,0 llamadas), `plan` (61,0%, 2,0 llamadas), `self_debug` (73,2%, 2,0 llamadas), `adaptive` (80,5%, 5,8 llamadas), `codet` (81,7%, 6,0 llamadas) y `s_star` (85,4%, 8,3 llamadas, 2536 tokens de salida).

## Capacidades

- Generacion de codigo en Python y otros lenguajes, heredada de Qwen2.5-Coder-1.5B-Instruct.
- Razonamiento multi-paso sobre problemas de programacion mediante busqueda S\* con ejecucion y reparacion iterativa.
- Seleccion de soluciones basada en ejecucion real sobre inputs sintetizados (solo en modo S\*, requiere host con capacidad de ejecutar codigo).
- Compatibilidad con clientes Ollama y OpenAI (Continue, Aider, Open WebUI, Cline) en modo plano o con S\*.
- Integracion como plugin de Claude Code (`/plugin marketplace add dmdhrumilmistry/tvashtr`).
- Paso directo (passthrough) de peticiones de chat, tool calls y autocompletado cuando se usa la pasarela Tvashtr; solo las peticiones de escritura de codigo en Python reciben S\*.
- Ejecucion en dispositivos moviles en modo plano mediante apps como PocketPal o ChatterUI con el GGUF Q4_K_M.

## Casos de uso

- Generacion de codigo en produccion con verificacion por ejecucion: desplegar Tvashtr como pasarela compatible con OpenAI delante del GGUF y activar S\* solo para peticiones de escritura de codigo, de modo que el resto del trafico (chat, autocompletado, tool calls) no pague la latencia adicional.
- Asistentes de programacion en IDE (Continue, Aider, Cline): apuntar el cliente a `http://127.0.0.1:11435` con el modelo `tvashtr/dmdhrumilmistry/qwen2.5-coder-tvashtr:1.5b` para obtener reparacion automatica de soluciones fallidas sobre los ejemplos del prompt.
- Generacion de tests y parches en pipelines de CI: usar la fase de reparacion con feedback de ejecucion para producir candidatos que compilen y pasen los casos de ejemplo antes de abrir un pull request.
- Prototipado en hardware de gama baja: el GGUF Q4_K_M (~0,9 GB) permite ejecutar el modelo en una RTX 3060, portatiles con GPU modesta o incluso moviles en modo plano, sin necesidad de infraestructura de servidor.
- Evaluacion comparativa de estrategias de test-time compute: el perfil `tvashtr-profile.json` y las estrategias `direct`, `plan`, `self_debug`, `adaptive`, `codet` y `s_star` permiten reproducir el barrido de pass@1 frente a llamadas y tokens de salida.
- Ensenanza y experimentation con busqueda S\*: usar el repositorio como caso de estudio reproducible de como la seleccion por ejecucion mejora un modelo pequeno sin reentrenamiento, con numeros concretos de problemas arreglados y rotos.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre HumanEval (tests ocultos oficiales):

| Metrica | Respuesta unica | Con S\* |
|---|---|---|
| Mitad held-out (82 problemas) | 70,7% (58) | 80,5% (66) |
| Mitad dev (82, usada para seleccion) | 72,0% | 85,4% |
| Llamadas al modelo por problema | 1 | 8,5 |
| Segundos por problema (RTX 3060) | 1,5 | 35,7 |

Desglose de cambios en la mitad held-out: 12 problemas arreglados y 4 rotos (ganancia neta de +8), eliminacion total de crashes en tiempo de ejecucion y reduccion de respuestas incorrectas de 20 a 15. El ruido de medida se estima en +/-3 problemas.

Comparativa de estrategias en la mitad dev:

| Estrategia | pass@1 | Llamadas | Tokens de salida |
|---|---|---|---|
| `direct` | 72,0% | 1,0 | 114 |
| `plan` | 61,0% | 2,0 | 550 |
| `self_debug` | 73,2% | 2,0 | 434 |
| `adaptive` | 80,5% | 5,8 | 1625 |
| `codet` | 81,7% | 6,0 | 778 |
| `s_star` | 85,4% | 8,3 | 2536 |

## Requisitos de hardware

- VRAM estimada: ~0,9 GB para Q4_K_M y ~3 GB para F16.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para Q4_K_M; la model card cita una RTX 3060 como referencia de medida (35,7 s por problema con S\*).
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, y en moviles mediante apps GGUF en modo plano.
- Opciones de despliegue: Ollama (`ollama run dmdhrumilmistry/qwen2.5-coder-tvashtr:1.5b`), llama.cpp, LM Studio, Jan, GPT4All, PocketPal, ChatterUI, y pasarela Tvashtr (`python -m tvashtr serve --port 11435`) compatible con clientes OpenAI.
- Latencia y throughput: 1,5 s por problema en modo plano y 35,7 s por problema con S\* en RTX 3060, con 8,5 llamadas al modelo por problema en modo S\*.
- Restriccion importante: el modo S\* requiere ejecutar codigo, por lo que solo funciona en un PC o servidor, no en apps moviles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct (plano) | 1,5B | no disponible | 70,7% (held-out) | Apache-2.0 | safetensors, GGUF |
| Qwen2.5-Coder-1.5B-Instruct + Tvashtr S\* | 1,5B | no disponible | 80,5% (held-out) | Apache-2.0 | GGUF |
| Qwen2.5-Coder-7B-Instruct (plano) | 7B | no disponible | 84,2% | Apache-2.0 | safetensors, GGUF |

La comparativa con el 7B plano procede de la propia model card. No se dispone de datos de benchmarks de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo base es de 1,5B parametros: su capacidad de razonamiento y conocimiento general es limitada frente a modelos mayores, y el S\* solo compensa parcialmente en tareas de codigo verificables por ejecucion.
- La mejora de S\* se mide en HumanEval, un benchmark de funciones Python aisladas; no hay evidencia en la informacion proporcionada de que se transfiera a bases de codigo reales, otros lenguajes o tareas sin tests ejecutables.
- El ruido de medida es de +/-3 problemas sobre 82, por lo que la diferencia entre estrategias cercanas (por ejemplo `adaptive` y `codet`) no es concluyente.
- El modo S\* multiplica las llamadas al modelo (8,5x) y la latencia (35,7 s frente a 1,5 s por problema en RTX 3060), lo que lo hace inadecuado para uso interactivo de baja latencia.
- S\* requiere ejecutar codigo generado en el host: implica riesgos de seguridad (ejecucion de codigo no confiable) que deben mitigarse con sandboxing.
- No se dispone de informacion sobre sesgos, idiomas soportados ni longitud de contexto en la informacion proporcionada.
- Licencia Apache-2.0 heredada del modelo base, permisiva para uso comercial; conviene verificar los terminos del modelo base Qwen2.5-Coder-1.5B-Instruct.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/dmdhrumilmistry/Qwen2.5-Coder-1.5B-Instruct-Tvashtr-S-star-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Repositorio Tvashtr: https://github.com/dmdhrumilmistry/tvashtr
- Paper S\* (Li et al. 2025): https://arxiv.org/abs/2502.14382
