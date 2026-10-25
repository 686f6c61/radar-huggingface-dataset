# PrblyElect/MiniMax-M3.1-Flash-TP3-3x-DGX-Spark

## Resumen

Este repositorio no contiene pesos de un modelo, sino una **receta de serving** publicada por el usuario PrblyElect para desplegar MiniMax M3.1 Flash (modelo base de MiniMaxAI) sobre tres nodos NVIDIA DGX Spark GB10 con paralelismo tensorial de grado 3 (TP=3) y decodificacion especulativa activada mediante la cabeza DSpark incluida en el propio checkpoint. La licencia declarada del artefacto es MIT y la libreria de referencia es vLLM; el checkpoint ocupa unos 233 GiB y se distribuye manualmente entre las tres maquinas.

El problema tecnico que resuelve es concreto: la geometria publicada del modelo es de 64 cabezas de consulta, 4 cabezas KV y 4 cabezas de indice, y el motor exige que cada una sea divisible por el tamano de TP. Como 64 no es divisible entre 3, el modelo no se puede repartir en tres rangos tal cual. La receta aplica un **pad que preserva la ratio** hasta 96/6/6 (16 cabezas de consulta por cabeza KV antes y despues) en cada arranque, con pesos a cero en las cabezas anadidas, de modo que su contribucion es exactamente nula y el mapeo GQA sigue siendo correcto por rango. La misma maniobra se aplica a la cabeza borrador DSpark.

Es relevante ahora porque demuestra un MoE multimodal de ~428B parametros totales y ~23B activos (mezcla de capas densas en MXFP8 y expertos empaquetados en NVFP4) servido con una API compatible con OpenAI sobre hardware de memoria unificada, algo que la receta upstream de vLLM no cubre en esta topologia. El autor insiste en que las cifras son "claims de especificacion redondeados, no un informe de benchmark", y aporta herramientas de captura, guardas de memoria y un arnes de medida para que las afirmaciones sean verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (modelo base MiniMax M3.1 Flash); el artefacto es una receta de serving para vLLM con TP=3 |
| Parametros totales | ~428B (modelo base) |
| Parametros activos | ~23B (modelo base) |
| Longitud de contexto | 131.072 tokens servidos; la clase nativa del modelo es 1M y no se habilita en esta receta |
| Tipos de cuantizacion | Capas densas en MXFP8 y expertos MoE empaquetados en NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | MIT (del repositorio/receta) |
| Formato de pesos | no disponible en la informacion (checkpoint de ~233 GiB; el README no explicita el contenedor de pesos) |
| Tamano del checkpoint | ~233 GiB |
| Motor de inferencia | vLLM (imagen `vllm/vllm-openai:minimax31-flash-tp3`, con Ray anadido como capa extra) |
| Topologia | 3 rangos, uno por maquina, anillo TP=3 con triangulo completo de interconexion |
| API expuesta | Compatible con OpenAI en el puerto 8100 del nodo cabeza |
| Revision del checkpoint | `54e4e69dfc452b1e94a426c24a4fdeeaa8e3ad5e` |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal con atencion de tipo GQA: 64 cabezas de consulta, 4 cabezas KV y 4 cabezas de indice, lo que da 16 cabezas de consulta por cabeza KV. Esa geometria es la que impide el sharding en tres rangos y motiva el kit de pad (`patches/apply_mm31_tp3pads.py`), que reescribe la geometria a 96/6/6 en cada arranque. Las cabezas anadidas llevan pesos a cero, por lo que no alteran la salida, pero si consumen computo y memoria: es un coste asumido a cambio de poder usar tres nodos en lugar de cuatro. La cabeza borrador DSpark viaja dentro del checkpoint (`<modelo>/dspark`), con la misma geometria publicada que el modelo objetivo y, por tanto, el mismo pad.

En el plano de despliegue, la receta fija un perfil de capacidad conservador: en una maquina de memoria unificada la reserva de GPU y el staging de CPU por peticion salen del mismo fondo, de modo que el pool KV es lo que queda tras los pesos, el sistema operativo, otros servicios, el pico de activacion y el pool de captura. El resultado es un pool KV de ~200K tokens, aproximadamente 1,5 veces una peticion completa de 131.072 tokens. El pool de captura se limita a menos de 1 GiB por rango, frente a los ~2 GiB que estima el propio motor. No se proporcionan datos sobre volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO; esa informacion no esta disponible en el material consultado.

## Capacidades

- Procesamiento multimodal: el modelo base se describe explicitamente como MoE multimodal.
- Generacion de texto y razonamiento: el README mide por separado las cadenas largas de razonamiento, lo que confirma soporte de razonamiento multi-paso sostenido.
- Decodificacion especulativa integrada con la cabeza DSpark del checkpoint, sin segunda descarga.
- Serving concurrente multi-stream: se reportan medidas a 1 stream y a 16 streams agregados.
- API compatible con OpenAI (`/v1/models`, puerto 8100), lo que permite integrar clientes existentes sin adaptadores.
- Herramientas de operacion incluidas: captura de configuracion resuelta del motor (`tools/capture-config.sh`), regla de aceptacion que falla en cerrado, arnes de bench con disciplina anti-contaminacion, resolvedor de rejilla de captura y guarda de memoria.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Idiomas soportados: no disponible en la informacion.

## Casos de uso

- **Servicio on-premise de un MoE de gran escala con hardware de memoria unificada**: tres DGX Spark GB10 de 128 GB permiten alojar un modelo de ~428B/~23B activos que no entra en ninguna GPU consumer individual; la receta entrega la configuracion exacta y una API compatible con OpenAI para conectar clientes internos.
- **Laboratorio de evaluacion de modelos abiertos de gran tamano**: el arnes de bench incluido, con disciplina anti-contaminacion y captura de la configuracion resuelta del motor, sirve para producir medidas reproducibles en lugar de cifras declarativas.
- **Cargas de razonamiento largo**: con aceptacion del borrador de ~0,98/0,95/0,94 por posicion en cadenas de razonamiento, la decodificacion especulativa aporta aqui su maximo; es el escenario donde el perfil de la receta esta mejor aprovechado.
- **Chat interactivo de un solo usuario**: ~28 tok/s en decodificacion de un stream y ~37 ms por token, con un tiempo hasta el primer token de ~0,5 s, dan una experiencia usable para asistencia conversacional individual.
- **Atencion a 16 sesiones concurrentes**: ~130 tok/s agregados a 16 vias permiten un servicio de chat moderado; el limite practico es el pool KV de ~200K tokens, que solo cubre una peticion completa de 131.072 mas media adicional.
- **Investigacion sobre decodificacion especulativa**: la receta documenta el comportamiento del borrador por posicion y por tipo de carga, lo que permite comparar politicas de presupuesto de borrador y validar la afirmacion de que un unico porcentaje de mejora "no significa nada" en este modelo.
- **Auditoria de despliegues multi-nodo**: las herramientas de captura y las guardas de memoria convierten "funciona" en "esta probado", util para equipos que necesitan justificar configuraciones en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas cifras son mediciones de servicio del autor, declaradas como redondeadas y no como informe de benchmark.

| Metrica | Valor |
|---|---|
| Decodificacion 1 via, un solo stream | ~28 tok/s |
| Decodificacion 16 vias, agregado | ~130 tok/s |
| Prefill (prompt de ~8K tokens) | ~1.500 tok/s |
| Tiempo hasta el primer token | ~0,5 s |
| Latencia por token | ~37 ms |
| Pool KV | ~200K tokens (~1,5x una peticion de 131.072) |
| Pool de captura por rango | < 1 GiB (estimacion del motor: ~2 GiB) |

Aceptacion del borrador DSpark por posicion:

| Carga | Posicion 1 | Posicion 2 | Posicion 3 |
|---|---|---|---|
| Prosa | ~0,60 | ~0,32 | ~0,16 |
| Cadenas largas de razonamiento | ~0,98 | ~0,95 | ~0,94 |

## Requisitos de hardware

- **Nodos**: 3 x NVIDIA DGX Spark GB10, con 128 GB de memoria unificada CPU/GPU por maquina.
- **Interconexion**: doble puerto RoCE de 200 Gb/s por nodo, en triangulo completo. El autor advierte explicitamente que una topologia en cadena solo sirve para dos nodos; cada rango debe alcanzar a los otros dos.
- **Almacenamiento**: ~233 GiB para el checkpoint, descargado primero en una maquina y copiado a las otras dos.
- **Sistema**: Ubuntu 24.04 con driver 580.x.
- **Imagen**: build propio de `vllm/vllm-openai:minimax31-flash-tp3`; el build day-0 de upstream no incluye Ray y hay que anadirlo como capa. La imagen se construye una vez y se carga en los otros dos nodos.
- **VRAM en GPU convencional**: no disponible. El checkpoint de ~233 GiB excede por si solo la VRAM de cualquier GPU consumer, por lo que no cabe en RTX 4090 ni similares. No se proporcionan medidas para A100, H100 u otras GPU de datacenter.
- **Memoria del pool KV**: ~200K tokens en el conjunto del despliegue, condicionado por el presupuesto de memoria unificada descrito en la receta.
- **Opciones de despliegue**: vLLM con Ray sobre TP=3; no se documentan alternativas como llama.cpp, Ollama o TGI para este checkpoint.
- **Latencia y throughput**: los de la tabla anterior (~28 tok/s por stream, ~130 tok/s a 16 vias, ~37 ms/token, ~0,5 s de TTFT, ~1.500 tok/s de prefill).

## Comparativa con modelos similares

| Criterio | Esta receta (TP=3, 3x DGX Spark) | Receta upstream de vLLM | Configuracion TP divisible (2, 4, 8) |
|---|---|---|---|
| Modelo | MiniMax M3.1 Flash (~428B / ~23B activos) | MiniMax M3.1 Flash | MiniMax M3.1 Flash |
| Contexto servido | 131.072 tokens | 131.072 tokens | 131.072 tokens (clase nativa 1M en el modelo) |
| Necesita pad de cabezas | Si (96/6/6) | No documentado | No, la geometria 64/4/4 es divisible |
| Decodificacion especulativa | Si, cabeza DSpark del checkpoint | No documentado en la informacion | No documentado |
| Nodos | 3 | No disponible | 2, 4 u 8 por aritmetica de la geometria publicada |
| Throughput medido | ~28 tok/s (1 stream) / ~130 tok/s (16 vias) | no disponible | no disponible |
| Licencia | MIT (receta) | no disponible | no disponible |

No se dispone de datos para comparar con otros modelos de la misma categoria (mismo tamano o misma tarea) en la informacion proporcionada; los unicos puntos de referencia son la receta upstream y la aritmetica de la geometria de cabezas.

## Limitaciones y advertencias

- **No es un modelo, es una receta**: el repositorio contiene scripts, parches, configuracion y documentacion de despliegue, no pesos. La licencia MIT declarada aplica al artefacto; la licencia del modelo base MiniMax M3.1 Flash debe verificarse en su repositorio de origen antes de cualquier uso comercial.
- **Cifras no auditadas**: el propio autor califica los numeros de "claims de especificacion redondeados, no un informe de benchmark". No hay evaluaciones estandar publicadas.
- **Validacion comunitaria nula**: 0 descargas y 0 likes, con creacion y ultima actualizacion el mismo dia (25 de octubre de 2026). No hay evidencia de uso independiente.
- **Beneficio del borrador dependiente de la carga**: la aceptacion cae aproximadamente a la mitad por posicion en prosa (0,60 / 0,32 / 0,16) y apenas decae en razonamiento largo. Cualquier cifra unica de "mejora por spec decode" es enganosa en este modelo.
- **Pool KV ajustado**: ~200K tokens equivalen a una peticion completa de 131.072 mas media. La concurrencia con contextos largos es muy limitada y ampliar el pool no es una cuestion de configuracion en este stack, segun el autor.
- **Contexto nativo no habilitado**: la clase del modelo llega a 1M de tokens, pero solo se sirven 131.072; no hay datos de rendimiento por encima de ese umbral.
- **Solo topologia de tres nodos**: la receta asume exactamente tres maquinas con triangulo completo de RoCE. Una cadena no funciona.
- **Sobrecoste del pad**: las cabezas anadidas consumen computo y memoria sin aportar senal; es un impuesto directo sobre el rendimiento a cambio de usar tres nodos.
- **Dependencia de Ray anadido manualmente**: el build day-0 de upstream no lo incluye, lo que introduce un paso de mantenimiento propio de la imagen.
- **Idiomas y sesgos**: no se documenta ni la cobertura linguistica ni sesgos conocidos del modelo base en la informacion disponible. El riesgo de alucinacion no se cuantifica en el material consultado.
- **Memoria unificada**: la convivencia de servicios, la reserva de GPU y el staging de CPU compiten por el mismo fondo, lo que exige mantener la guarda de memoria activa en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/PrblyElect/MiniMax-M3.1-Flash-TP3-3x-DGX-Spark
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Receta upstream de vLLM para MiniMax M3.1 Flash: https://recipes.vllm.ai/MiniMaxAI/MiniMax-M3.1-Flash
- Revision del checkpoint usada en la receta: `54e4e69dfc452b1e94a426c24a4fdeeaa8e3ad5e`
