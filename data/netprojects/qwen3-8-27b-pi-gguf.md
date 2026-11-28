# netprojects/Qwen3.8-27B-pi-GGUF

## Resumen

Qwen3.8-27B-pi-GGUF es una coleccion de cuantizaciones GGUF del modelo Qwen3.8-27B-pi-adapted, publicado por el usuario netprojects. El modelo subyacente parte de Qwen/Qwen3.8-27B, al que se le ha fusionado un adaptador LoRA entrenado por harness-hub mediante aprendizaje por refuerzo (AsyncGRPO en TRL) para convertir al modelo en el motor del agente de programacion pi, orientado a tareas de ingenieria de software y de terminal. El resultado se ha convertido a GGUF para llama.cpp, de modo que puede ejecutarse sin necesidad de cargar el LoRA por separado con `--lora`.

La relevancia de esta publicacion es doble. Por un lado, empaqueta un ajuste fino especializado en agentes de codigo en formatos listos para usar en hardware de consumo, con cuantizaciones desde 9,95 GB hasta 29 GB. Por otro, conserva la capa de prediccion multi-token (MTP) de Qwen, que llama-server puede aprovechar para acelerar la decodificacion, e incluye un proyector de vision (`mmproj`) que habilita la entrada de imagenes. El modelo tiene 27.320.697.856 parametros y se distribuye bajo licencia Apache 2.0.

El autor aporta ademas comprobaciones de fidelidad de cada cuantizacion frente a los pesos BF16 (porcentaje de mismo siguiente token y divergencia KL media), asi como builds "mix" por tensor que mejoran la relacion tamano/fidelidad respecto a las cuantizaciones estandar de llama.cpp. Es, por tanto, una ficha practica para quien quiera desplegar un agente de codigo local con requisitos de memoria acotados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8) con capa de prediccion multi-token (MTP); proyector de vision para entrada de imagen |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K, Q8_0, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M, IQ3_XXS, IQ2_M, Q2_K_XL, Q3_K_XL, Q4_K_XL (mix por tensor); proyector de vision en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); tambien existen builds MLX en repos separados |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B (revision 3756181), un transformer de aproximadamente 27.300 millones de parametros que incorpora una capa de prediccion multi-token (MTP). Sobre el se fusiono el adaptador LoRA de harness-hub/Qwen3.8-27B-pi-adapted (revision e786f84), entrenado con aprendizaje por refuerzo mediante AsyncGRPO en TRL. El objetivo del ajuste era convertir el modelo en el motor del agente de codigo pi, especializado en tareas de ingenieria de software y de terminal. La fusion se realizo antes de la conversion a GGUF, de modo que los ficheros resultantes no requieren cargar el LoRA por separado.

La publicacion no detalla el volumen de datos de entrenamiento ni la composicion del dataset, que se remiten a la model card del adaptador original. La innovacion tecnica destacable en este repositorio es la conservacion de la capa MTP en todas las cuantizaciones, lo que permite a llama-server emplearla para acelerar la decodificacion. Ademas, el autor genera builds "mix" asignando un tipo de cuantizacion distinto a cada tensor (mas bits en la cabeza de salida, atencion y capas finales; menos en las menos sensibles), siguiendo la receta dinamica de unsloth para Qwen3.8-27B y aplicandola con la imatrix propia del modelo.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Especializacion en tareas de agente de codigo: resolucion de problemas de ingenieria de software y ejecucion de comandos en terminal.
- Uso de herramientas (tool calling) y razonamiento multi-paso dentro de un bucle de agente, con una reduccion reportada del 55-64% en el numero de llamadas a herramientas por tarea frente al modelo base.
- Entrada de imagen mediante el proyector `mmproj-Qwen3.8-27B-pi-F16.gguf` (pipeline image-text-to-text).
- Decodificacion acelerada mediante la capa MTP en llama-server.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de programacion local: el modelo puede ejecutar el bucle del agente pi sobre tareas de ingenieria de software, resolviendo issues y modificando repositorios con menos llamadas a herramientas, lo que reduce coste y latencia en entornos con memoria limitada.
- Automatizacion de terminal: al estar especializado en tareas de terminal, encaja en flujos de administracion de sistemas y scripts donde el modelo interpreta la salida de comandos y decide el siguiente paso.
- Asistente de codigo en estaciones de trabajo con GPU de consumo: las cuantizaciones IQ2_M (10,2 GB) y Q3_K_M (13,5 GB) permiten desplegar un agente de 27B en equipos de 16-24 GB de memoria.
- Revision de capturas e interfaces: gracias al proyector de vision, puede analizar imagenes junto con texto, por ejemplo para interpretar errores mostrados en pantalla o diagramas.
- Servicio de agente en servidor con llama-server: la capa MTP y los ficheros Q6_K/Q8_0 permiten montar un endpoint compatible con herramientas de agente manteniendo alta fidelidad respecto a BF16.
- Prototipado en Apple Silicon: los builds MLX en repos separados y las cuantizaciones GGUF de este repositorio cubren desde 16 GB hasta 64 GB o mas de memoria unificada.
- Evaluacion de ajustes por refuerzo: util para investigadores que quieran reproducir o comparar el efecto del entrenamiento AsyncGRPO sobre tareas de agente sin disponer de hardware de datacenter.

## Benchmarks y rendimiento

Resultados publicados por harness-hub para el adaptador, medidos bajo el agente pi con el modo thinking desactivado:

| Benchmark | Modelo base | Qwen3.8-27B-pi-adapted |
|---|---|---|
| Terminal-Bench 2.1 | 39,5% | 55,8% |
| SWE-bench Pro (hard 51) | 29,4% | 62,7% |
| Llamadas a herramientas por tarea | referencia | 55-64% menos |

Fidelidad de las cuantizaciones respecto a los pesos BF16 (mismo siguiente token y divergencia KL media):

| Fichero | Tamano | Mismo siguiente token | KL media |
|---|---|---|---|
| Q6_K | 22,4 GB | 98,4% | 0,0038 |
| Q8_0 | 29,0 GB | 99,2% | 0,0003 |
| Q5_K_M | 19,5 GB | 97,1% (vs Q8_0) | 0,0052 (vs Q8_0) |
| Q4_K_M | 16,8 GB | 94,2% | 0,0595 |
| IQ4_XS | 15,3 GB | 94,1% (vs Q8_0) | 0,0197 (vs Q8_0) |
| Q3_K_M | 13,5 GB | 93,1% (vs Q8_0) | 0,0804 (vs Q8_0) |
| IQ3_XXS | 11,4 GB | 91,5% (vs Q8_0) | 0,1244 (vs Q8_0) |
| IQ2_M | 10,2 GB | 89,6% (vs Q8_0) | 0,1715 (vs Q8_0) |

Builds mix por tensor, comparados con la cuantizacion estandar equivalente:

| Fichero | Tamano | KLD vs Q8_0 | Build estandar (tipo, tamano, KLD) |
|---|---|---|---|
| Q2_K_XL | 9,95 GB | 0,1308 | Q2_K, 10,95 GB, 0,1594 |
| IQ3_XXS | 10,93 GB | 0,0874 | IQ3_XXS, 11,43 GB, 0,0952 |
| Q3_K_XL | 13,15 GB | 0,0393 | Q3_K_M, 13,54 GB, 0,0538 |
| Q4_K_XL | 17,66 GB | 0,0075 | Q4_K_M, 16,79 GB, 0,0160 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: 10,2 GB (IQ2_M), 11,4 GB (IQ3_XXS), 13,5 GB (Q3_K_M), 15,3 GB (IQ4_XS), 16,8 GB (Q4_K_M), 19,5 GB (Q5_K_M), 22,4 GB (Q6_K), 29,0 GB (Q8_0); builds mix desde 9,95 GB (Q2_K_XL) hasta 17,66 GB (Q4_K_XL).
- Proyector de vision adicional: 0,9 GB (`mmproj-Qwen3.8-27B-pi-F16.gguf`).
- GPU recomendadas: no se especifican modelos concretos; el autor orienta las recomendaciones por cantidad de memoria (16, 24, 32, 48 y 64 GB o mas).
- Cabe en GPU de consumo: si, con las cuantizaciones de menor tamano (IQ2_M, Q3_K_M, Q4_K_M) en tarjetas de 16-24 GB; Q6_K y Q8_0 requieren 24-32 GB o mas.
- Opciones de despliegue: llama.cpp (llama-server), Ollama y LM Studio para GGUF; mlx-lm, mlx-vlm y LM Studio MLX para los builds MLX.
- Latencia y throughput: no disponibles; el autor indica que la capa MTP permite una decodificacion mas rapida en llama-server, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi (este) | 27,3B | no disponible | Agente de codigo y terminal | Apache 2.0 | GGUF, MLX |
| Qwen/Qwen3.8-27B (base) | 27,3B | no disponible | Proposito general | no disponible | safetensors y derivados |
| harness-hub/Qwen3.8-27B-pi-adapted | 27,3B | no disponible | Agente de codigo (LoRA sin fusionar) | no disponible | adaptador |
| unsloth/Qwen3.8-27B-GGUF | 27,3B | no disponible | Proposito general cuantizado | no disponible | GGUF |

No se dispone de datos de benchmarks comparativos con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste esta orientado a tareas de agente de codigo y terminal; su comportamiento en dominios generales puede diferir del modelo base sin ajustar.
- Los benchmarks reportados (Terminal-Bench 2.1 y SWE-bench Pro) se midieron con el agente pi y con el modo thinking desactivado; no deben extrapolarse a otros arneses o configuraciones.
- Las cuantizaciones de menor tamano (IQ2_M, IQ3_XXS, Q3_K_M) presentan divergencia KL apreciable respecto a Q8_0 (hasta 0,1715), lo que puede degradar la calidad en tareas complejas.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; conviene validar el comportamiento en castellano antes de usarlo en produccion.
- Longitud de contexto: no disponible, lo que impide planificar tareas con prompts largos sin verificacion previa.
- Licencia Apache 2.0, que permite uso comercial; no obstante, el modelo base y el adaptador deben revisarse por si incorporan terminos adicionales.
- El autor declara no estar afiliado a unsloth, aunque la receta de cuantizacion por tensor sigue su publicacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-pi-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Agente pi: https://github.com/earendil-works/pi
- Receta de cuantizacion de referencia: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Builds MLX 6-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-6bit
- Builds MLX 2.5-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-2.5bit
- Builds MLX 3-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-3bit
- Builds MLX 4-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-4bit
- Builds MLX 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-pi-adapted-MLX-8bit
- Perfil del autor: https://huggingface.co/netprojects
