# gat45/qwen-3.8-for-1080-8gb

## Resumen

`s3_gutop` es una compilación en precisión mixta del modelo Qwen3.5-9B, publicada por el usuario gat45 en el repositorio `gat45/qwen-3.8-for-1080-8gb`. El objetivo declarado no es minimizar el tamano ni maximizar la velocidad de forma aislada, sino optimizar el producto calidad x memoria x velocidad bajo la restriccion de una GTX 1080 con 8 GiB de VRAM (arquitectura Pascal). El resultado es un GGUF de 5,388 GiB con una perplejidad de 9,7839 y una generacion autorregresiva de ~33,4 tokens/s.

El proyecto es, en la practica, un estudio de cuantizacion: el autor mide sensibilidad a nivel de tensor y de capa, comprueba la no aditividad de las ganancias y documenta una tabla de configuraciones intermedias (Q4, P1, P4, MC1, L2, Skeleton, S0/v8, v18) con su tamano y su PPL. La version final combina una base Q4 con `ssm_out` y `attn_q` en Q5 y 30 tensores seleccionados de `ffn_gate/up`, partiendo siempre de una ruta de cuantizacion fresca desde Q8.

La relevancia actual del artefacto es acotada y muy especifica: sirve como referencia reproducible para desplegar un modelo de ~9B en hardware sin tensor cores ni soporte de FP8/BF16 acelerado, y como banco de pruebas para decodificacion especulativa (MTP nativo de Qwen3.5, DFlash y especulacion por n-gramas). El repositorio no tiene descargas ni valoraciones, y no declara licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. Derivada de Qwen3.5-9B; la presencia de tensores `ssm_out` sugiere componentes de espacio de estados (SSM) o atencion hibrida, pero no se documenta |
| Parametros totales | ~9.000 M segun el nombre del modelo base (Qwen3.5-9B); no confirmado en la documentacion disponible |
| Parametros activos | No aplica / no disponible (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF de precision mixta: base Q4 con `ssm_out` y `attn_q` en Q5 y 30 tensores `ffn_gate/up` seleccionados. Variantes medidas: Q4, P1, P4, MC1, L2, Skeleton, s3_gutop, S0/v8, v18 |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no la declara) |
| Formato de pesos | GGUF |
| Tamano del archivo final | 5,388 GiB |
| Perplejidad medida (PPL) | 9,7839 |
| Velocidad autorregresiva | ~33,42 tokens/s en GTX 1080 |
| Modelo base | Qwen/Qwen3.5-9B |
| Modelo borrador para decodificacion especulativa | z-lab/Qwen3.5-9B-DFlash |

## Arquitectura y entrenamiento

No se aportan datos sobre el entrenamiento del modelo original Qwen3.5-9B (numero de tokens, composicion del dataset, uso de RLHF o DPO) ni sobre la arquitectura interna mas alla de su nombre. Lo unico inferible del material publicado es que la implementacion contiene tensores denominados `ssm_out`, lo que apunta a componentes de espacio de estados o a un diseno hibrido atencion-SSM; el autor no lo explicita.

Lo que si se documenta con detalle es el procedimiento de cuantizacion, que constituye la contribucion tecnica real del repositorio. Todos los candidatos se generaron con una ruta fresca desde Q8, sin recuantizar desde un estado Q4 intermedio. Las reglas aplicadas fueron: medir PPL tras cada cambio significativo, verificar memoria real frente a la memoria teorica de tensores, medir interacciones entre tensores, no asumir aditividad de las ganancias por capa, descartar ganancias debiles o ruidosas y bloquear los cambios en embeddings y capa de salida cuando las mediciones no los justificaban.

El hallazgo central es la no aditividad: las capas 15 y 31, medidas en conjunto, cuestan +0,0713 de PPL, mientras que la suma de sus costes aislados es de aproximadamente +0,0166. Es decir, medir tensores o capas por separado no permite predecir el comportamiento de un modelo de precision mixta completo. La version final `s3_gutop` anade +309 MiB respecto al Q4 uniforme y reduce la PPL en 0,2598 puntos, sin penalizacion apreciable de throughput autorregresivo (deriva de ancla medida del 0,00 %).

## Capacidades

- Generacion de texto autorregresiva en ingles o en el idioma del prompt; el autor no documenta capacidades multilingues.
- Razonamiento y generacion de codigo: no hay evaluacion especifica publicada en la informacion disponible, solo se asume lo heredado de Qwen3.5-9B.
- Decodificacion especulativa con MTP nativo de Qwen3.5, con longitudes de borrador estaticas (n1 a n5) y modo adaptativo.
- Decodificacion especulativa con modelo borrador externo DFlash (`z-lab/Qwen3.5-9B-DFlash`), que no es un modelo objetivo independiente sino un drafter.
- Especulacion por n-gramas, segun la lista de tecnicas medidas en la campana.
- Reparto de capas entre CPU y GPU (offloading parcial), evaluado por el autor.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Inferencia local en GPU Pascal: es el caso de uso disenado explicitamente. El GGUF de 5,388 GiB cabe en los 8 GiB de una GTX 1080 junto con el contexto y los buffers de runtime, algo que las cuantizaciones mas conservadoras no permiten con holgura.
- Aceleracion con decodificacion especulativa en equipos modestos: con MTP adaptativo el modelo alcanza 57,8 tokens/s frente a los 33,42 tokens/s autorregresivos, una mejora de aproximadamente el 73 %, util para asistentes interactivos donde la latencia percibida importa mas que el coste computacional.
- Investigacion en cuantizacion de precision mixta: la tabla de configuraciones con tamano y PPL permite reproducir la metodologia y contrastar la hipotesis de no aditividad entre capas en otros modelos.
- Banco de pruebas de speculative decoding: la comparativa entre MTP nativo, DFlash y n-gramas, junto con las metricas de aceptacion del borrador, sirve para estudiar el fenomeno de drenaje del borrador (la caida a 51,4 tokens/s en n5 frente a 55,7 en n4).
- Prototipado offline en estaciones de trabajo sin GPU moderna: al ser un GGUF, puede ejecutarse en el ecosistema llama.cpp; el autor no especifica el runtime empleado, por lo que la compatibilidad con Ollama, LM Studio o vLLM debe verificarse.
- Evaluacion comparativa de techo de ancho de banda: con una utilizacion del 89,5 % del ancho de banda en Q4 y un techo practico de 37-38 tokens/s, el modelo sirve como referencia para medir cuanto margen queda en una GPU concreta antes de cambiar de estrategia de cuantizacion.
- Despliegue de un asistente conversacional personal de ~9B en hardware de escritorio, aceptando la perdida de fidelidad que introduce una cuantizacion Q4 mixta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las unicas metricas reportadas son perplejidad y throughput, medidas por el autor con un protocolo propio no detallado.

Frontera de cuantizacion (tamano frente a PPL):

| Configuracion | Tamano | PPL |
|---|---|---|
| Q4 (referencia uniforme) | 5,079 GiB | 10,0437 |
| P1 | 4,937 GiB | 10,0235 |
| P4 | 4,984 GiB | 9,9845 |
| MC1 | 5,019 GiB | 9,9247 |
| L2 | 5,193 GiB | 9,8346 |
| Skeleton | 5,206 GiB | 9,8213 |
| **s3_gutop** | **5,388 GiB** | **9,7839** |
| S0/v8 | 5,451 GiB | 9,6617 |
| v18 | 5,935 GiB | 9,5509 |

Rendimiento autorregresivo y con MTP sobre `s3_gutop` (GTX 1080):

| Modo | Generacion |
|---|---|
| Autorregresivo (sin especulacion) | 33,42 tok/s |
| MTP n1 | 47,2 tok/s |
| MTP n2 | 52,8 tok/s |
| MTP n3 | 54,0 tok/s |
| MTP n4 | 55,7 tok/s |
| MTP n5 | 51,4 tok/s |
| MTP adaptativo | 57,8 tok/s |

Datos de contexto del banco de pruebas: utilizacion del ancho de banda en Q4 del ~89,5 % y techo practico de decodificacion de ~37-38 tok/s.

## Requisitos de hardware

- VRAM estimada: 5,388 GiB solo para los pesos; hay que sumar cache KV y buffers segun contexto y runtime. El objetivo declarado es encajar en 8 GiB.
- GPU objetivo: NVIDIA GTX 1080 (Pascal, 8 GiB). Cualquier GPU con al menos 8 GiB de VRAM deberia poder cargar los pesos.
- Cabe en GPU de consumo: si, es el proposito del proyecto. El autor no confirma pruebas en otras tarjetas de consumo (RTX 3060, RTX 4060, etc.).
- Reparto CPU/GPU: evaluado por el autor, que advierte de sincronizacion adicional, transferencias CPU-GPU, burbujas de inactividad de GPU y fragmentacion de grafos. Una cuantizacion que ahorra memoria pero fuerza repartos costosos puede ser globalmente mas lenta.
- Opciones de despliegue: formato GGUF, compatible con el ecosistema llama.cpp y sus derivados; el autor no especifica el runtime concreto usado en las mediciones. No hay confirmacion de soporte en vLLM ni TGI.
- Throughput: 33,42 tok/s en modo autorregresivo y 57,8 tok/s con MTP adaptativo en GTX 1080. El cuello de botella es el ancho de banda de memoria, no el computo.
- Latencia: no disponible (no se reportan tiempos hasta el primer token).

## Comparativa con modelos similares

La informacion disponible no incluye modelos alternativos de otros autores. La comparacion posible es interna, entre las variantes de la propia campana, todas derivadas de Qwen3.5-9B:

| Variante | Tamano | PPL | Delta de PPL vs Q4 | Delta de tamano vs Q4 |
|---|---|---|---|---|
| Q4 | 5,079 GiB | 10,0437 | 0 | 0 |
| Skeleton | 5,206 GiB | 9,8213 | -0,2224 | +127 MiB |
| s3_gutop | 5,388 GiB | 9,7839 | -0,2598 | +309 MiB |
| S0/v8 | 5,451 GiB | 9,6617 | -0,3820 | +372 MiB |
| v18 | 5,935 GiB | 9,5509 | -0,4928 | +856 MiB |

Segun el autor, la eficiencia memoria-calidad se degrada progresivamente por encima de `s3_gutop`, que es la razon por la que se selecciono como version principal. No hay datos comparativos frente a otras cuantizaciones de la comunidad (por ejemplo, builds GGUF de terceros) ni frente al modelo base en Q8, cuya PPL de referencia no se publica.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 valoraciones: no existe validacion independiente de las metricas reportadas.
- La licencia no esta declarada. Antes de cualquier uso comercial hay que verificar la licencia de Qwen/Qwen3.5-9B, de la que deriva.
- No se documenta la longitud de contexto soportada, los idiomas cubiertos ni el pipeline de la tarea, lo que impide evaluar su idoneidad para casos concretos sin pruebas propias.
- Discrepancia de nomenclatura: el ID del repositorio es `qwen-3.8-for-1080-8gb` mientras que la model card describe Qwen3.5-9B. Conviene confirmar que los pesos corresponden al modelo que se espera.
- Es una cuantizacion con perdida: la PPL de 9,7839 corresponde a una build Q4 mixta, no al modelo original en Q8 o BF16. No se publica la PPL del modelo sin cuantizar, por lo que no puede cuantificarse la degradacion total.
- La PPL solo es comparable dentro de la propia campana: el autor no especifica el conjunto de evaluacion, de modo que los valores no son equiparables a los de otras publicaciones.
- El protocolo de benchmark parece centrado en el drift de una ancla de prompt y un recuento de tokens/s; no hay evaluaciones de calidad funcional (razonamiento, codigo, matematicas) ni pruebas de robustez.
- Optimizado especificamente para Pascal (GTX 1080). En GPUs con tensor cores o mayor ancho de banda, la asignacion de precision mixta elegida puede no ser la optima y conviene remuestrear.
- El autor senala que midio la fidelidad de texto bajo decodificacion especulativa por lotes, pero el extracto disponible no incluye conclusiones al respecto; es un riesgo conocido de las tecnicas de especulacion con multiples posiciones.
- La decodificacion especulativa con MTP presenta drenaje del borrador: n5 (51,4 tok/s) rinde peor que n4 (55,7 tok/s), por lo que no conviene aumentar la longitud de borrador sin medir.
- No hay confirmacion de soporte de tool calling, agentes, vision ni audio; no deben asumirse esas capacidades por herencia del modelo base.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/gat45/qwen-3.8-for-1080-8gb
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B/tree/main
- Modelo borrador DFlash: https://huggingface.co/z-lab/Qwen3.5-9B-DFlash/tree/main
- Implementacion oficial de DFlash (GitHub): https://github.com/z-lab/dflash
- No se han encontrado otros enlaces tecnicos relevantes en la busqueda web realizada.
