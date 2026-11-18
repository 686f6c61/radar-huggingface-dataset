# HydraAiM/Qwen3.6-35B-A3B-EXL3-HalfRate-T5

## Resumen

Qwen3.6-35B-A3B-EXL3-HalfRate-T5 es una cuantizacion EXL3 del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario HydraAiM. El objetivo declarado es conservar el comportamiento del modelo original en BF16 al maximo posible dentro de lo que cabe en dos GPU de consumo, manteniendo intactos la torre de vision y la cabeza MTP (multi-token prediction) para que la decodificacion especulativa funcione sin configuracion adicional. El resultado ocupa 24,5 GB en disco con una media de 5,24 bits por peso.

El modelo base es un MoE de la familia Qwen3.5 con capacidades multimodales (pipeline image-text-to-text) y licencia Apache-2.0. Esta build concreta emplea tensores de 4,5 bits que el exllamav3 estandar no puede cargar: requiere un fork especifico (hunterxma/exllamav3-half-bit) con kernels de medio rate. Es, por tanto, una pieza de infraestructura de inferencia mas que un modelo nuevo: su valor esta en la receta de asignacion de bits por tensor, calibrada sobre mediciones de divergencia KL frente al BF16.

La relevancia practica es que permite servir un MoE multimodal de gran tamano con decodificacion especulativa en hardware de gama consumer (el autor lo prueba en una RTX 3060 de 12 GB mas una RTX 5060 Ti de 16 GB), a 177 tok/s de decodificacion con contexto de 96k y cache KV de 8 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (familia Qwen3.5, tag `qwen3_5_moe`) con mixers Gated DeltaNet, torre de vision y cabeza MTP |
| Parametros totales | 12.208.232.448 (segun safetensors del repo); el nombre comercial indica 35B-A3B sobre el modelo base |
| Parametros activos | no disponible (el nombre del base sugiere ~3B activos, sin confirmacion en la informacion proporcionada) |
| Longitud de contexto | 98.304 tokens (96k) probados por el autor; el instalador ajusta 32k por defecto |
| Tipos de cuantizacion | EXL3 con rates mixtos por tensor: 8 bits (atencion, mixers, experto compartido, cabeza MTP), 6 bits (cabeza de salida, torre de vision, expertos enrutados en capas 0-7 y 30-39), 5 y 4,5 bits (expertos enrutados en capas 8-29); media 5,24 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato EXL3, libreria exllamav3 (fork half-bit) |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts con mixers Gated DeltaNet en lugar de atencion clasica en parte de la red, torre de vision y cabeza de prediccion multi-token (MTP). Esta publicacion no entrena ni afina el modelo: es una cuantizacion post-entrenamiento. La innovacion esta en la asignacion de bits por tensor, elegida a partir de mediciones sobre este modelo concreto y no de una receta generica. El autor documenta que aproximadamente el 87% de la divergencia KL en los fragmentos de texto mas dificiles proviene de que tokens acaban enrutados a expertos distintos que en el modelo a plena precision, y que esos cambios de ruta se originan sobre todo en las capas 0-19; por eso los mixers y el experto compartido reciben 8 bits, para mantener las entradas de los routers mas cerca del original.

En las capas 8-29, las proyecciones gate/up de los expertos enrutados usan 4,5 bits para 144 de los 256 expertos y 5 bits para los 112 menos utilizados, mientras que las proyecciones down se quedan en 5 bits. Frente a su build hermana T5 FV (mixers a 6 bits y todos los gate/up a 4,5 bits), esta version obtiene una KLD mediana por token de 0,833 veces la de T5 FV en comparacion emparejada (intervalo del 95%: 0,75-0,91), a cambio de 0,6 GB mas de disco. La KLD media frente a BF16 en texto retenido es de 0,0156. Se conservan la torre de vision y la cabeza MTP, de modo que la decodificacion especulativa con borradores MTP funciona directamente.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activable y presupuesto de pensamiento configurable (el autor usa hasta 81.920 tokens).
- Razonamiento matematico de competicion (AIME, GSM8K) y cientifico de nivel graduado (GPQA Diamond, HLE).
- Generacion de codigo (HumanEval, LiveCodeBench) y seguimiento estricto de instrucciones (IFEval, IFBench).
- Capacidades multimodales de entrada imagen-texto mediante la torre de vision conservada.
- Tool calling y function calling: el autor reporta 200/200 en su suite propia de llamadas a herramientas.
- Ejecucion de tareas de agente y razonamiento multi-paso: 40/40 en la suite de agentes del autor.
- Manejo de contexto largo: 14/14 en la suite propia de contexto largo con 96k tokens cargados.
- Decodificacion especulativa nativa mediante cabeza MTP con seis borradores.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: con 96k tokens de contexto puede mantener conversaciones multi-turno largas con historial completo e integracion de herramientas de consulta a sistemas internos, aprovechando el 200/200 en tool calls reportado.
- Generacion de codigo en produccion: el 99,4% en HumanEval y el soporte de function calling permiten integrarlo en pipelines de CI/CD para generar parches, tests o revisiones automatizadas, con la salvedad de que requiere el fork de exllamav3.
- Analisis de documentos con imagenes: al conservar la torre de vision, sirve para extraer y razonar sobre tablas, capturas y diagramas en flujos de documentacion tecnica o financiera.
- Asistentes de investigacion y razonamiento cientifico: el 93,3% en AIME y el 81,8% en GPQA Diamond lo hacen adecuado para tareas de resolucion de problemas con trazas de pensamiento largas.
- Agentes autonomos multi-paso: las 40/40 tareas de agente y el contexto de 96k permiten orquestar flujos con multiples llamadas a herramientas y estado acumulado.
- Despliegue en estaciones de trabajo con dos GPU consumer: el caso de uso central de esta build es servir un MoE grande con decodificacion especulativa en hardware de 12+16 GB, a 177 tok/s, para prototipado e inferencia local a escala media.
- Procesamiento por lotes de contexto largo: analisis de contratos, expedientes o bases de codigo de hasta 96k tokens por consulta con cache KV de 8 bits.

## Benchmarks y rendimiento

Resultados del autor, ejecutados con thinking activo, muestreo de produccion, presupuesto maximo de 81.920 tokens y una sola semilla. Las cifras de la model card de Qwen se incluyen solo como referencia y no son directamente comparables.

| Suite | T5 | Qwen card (BF16) |
|---|---|---|
| MMLU-Pro (subconjunto de 154) | 132/154 (85,7%) | 85,2 |
| AIME (60 problemas) | 56/60 (93,3%) | 92,7 |
| GPQA Diamond | 162/198 (81,8%) | 86,0 |
| HLE (opcion multiple, 150) | 29/150 (19,3%) | 21,4 |
| LiveCodeBench hard (80) | 45/80 (56,3%) | no disponible |
| IFBench (300) | 180/300 (60,0%) | no disponible |
| IFEval (150, estricto) | 138/150 (92,0%) | no disponible |
| HumanEval | 163/164 (99,4%) | no disponible |
| GSM8K (200) | 191/200 (95,5%) | no disponible |
| Instrucciones (200, propia) | 196/200 | no disponible |
| Tool calls (200, propia) | 200/200 | no disponible |
| Tareas de agente (40, propia) | 40/40 | no disponible |
| Contexto largo (14, propia) | 14/14 | no disponible |
| Total | 1.546/1.910 | no disponible |

Rendimiento de inferencia declarado: 177 tok/s de decodificacion en RTX 3060 12 GB + RTX 5060 Ti 16 GB, con contexto de 96k, cache de 8 bits y seis borradores MTP; 173-184 tok/s end to end en respuestas de 768 tokens con la configuracion del instalador. La build T5 FV alcanza 204 tok/s.

## Requisitos de hardware

- VRAM estimada: el modelo completo no cabe en una sola tarjeta de 24 GB; el autor lo ejecuta con todos los expertos en GPU en 12 GB + 16 GB.
- GPU recomendadas: RTX 3060 12 GB + RTX 5060 Ti 16 GB (configuracion probada); cualquier combinacion de GPU NVIDIA con compute 7.5 o superior que sume VRAM suficiente.
- GPU consumer: si cabe en configuraciones multi-GPU de gama media; una unica tarjeta de 24 GB no es suficiente.
- Con menos VRAM, el fork permite mantener parte de los expertos en CPU a menor velocidad.
- Despliegue: exclusivamente mediante el fork hunterxma/exllamav3-half-bit (probado en el commit 615291f), que genera `run.sh` para chat y `serve.sh` para servidor compatible con OpenAI en el puerto 8000. El exllamav3 estandar no puede cargar los tensores de 4,5 bits.
- Requisitos de sistema: Linux, driver para CUDA 12.6 o superior (12.8+ para RTX 50), git, compilador de C++ y unos 12 GB de disco libres para la compilacion; no hace falta el CUDA toolkit.
- Instalacion: entre 15 y 40 minutos, mayormente compilando; el instalador calibra el reparto de expertos y los borradores MTP, con contexto de 32k por defecto (ajustable con `CTX=98304`).
- Throughput: 177 tok/s de decodificacion y 173-184 tok/s end to end en la configuracion probada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-EXL3-HalfRate-T5 | 12,2B en safetensors (base 35B-A3B) | 96k probados | EXL3 (safetensors) | Apache-2.0 | KLD 0,0156 vs BF16; 177 tok/s; requiere fork |
| Qwen3.6-35B-A3B-EXL3-HalfRate-T5-FV | 12,2B en safetensors (base 35B-A3B) | 96k probados | EXL3 (safetensors) | Apache-2.0 | 23,9 GB, 5,09 bits/peso, KLD 0,0157, 204 tok/s; requiere fork |
| Qwen/Qwen3.6-35B-A3B (BF16) | 35B-A3B | no disponible | safetensors | Apache-2.0 | Referencia de precision; no cabe en dos GPU consumer |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | No hay datos en la informacion proporcionada |

## Limitaciones y advertencias

- Requiere un fork no oficial de exllamav3; el ecosistema estandar (vLLM, llama.cpp, Ollama, TGI) no puede cargar estos pesos.
- Dependencia de Linux y GPU NVIDIA con compute 7.5+; no hay soporte documentado para otros aceleradores.
- Todos los benchmarks provienen de una sola semilla y los kernels MoE no son deterministas a nivel de bit, por lo que repeticiones varian en unas pocas preguntas.
- Varias suites son subconjuntos propios del autor y no son directamente comparables con las cifras de la model card de Qwen; el total de 1.546/1.910 agrega pruebas de distinta naturaleza.
- GPQA Diamond (81,8%) y HLE (19,3%) quedan por debajo del BF16 de referencia (86,0 y 21,4), lo que indica perdida medible en razonamiento cientifico dificil.
- Riesgo de alucinacion inherente al modelo base; no se documentan evaluaciones de veracidad.
- Idiomas soportados no documentados en esta publicacion.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del fork de kernels y del modelo base antes de un despliegue comercial.
- El modelo base aparece con 35B-A3B en el nombre pero el repo declara 12,2B parametros en safetensors; conviene validar el conteo real antes de dimensionar infraestructura.
- El repo registra 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HydraAiM/Qwen3.6-35B-A3B-EXL3-HalfRate-T5
- Build hermana T5 FV: https://huggingface.co/HydraAiM/Qwen3.6-35B-A3B-EXL3-HalfRate-T5-FV
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Fork con kernels half-rate: https://github.com/hunterxma/exllamav3-half-bit
- Commit probado del fork: https://github.com/hunterxma/exllamav3-half-bit/commit/615291fbdbddfa3b055ded1b791ee995c26ddf3c
