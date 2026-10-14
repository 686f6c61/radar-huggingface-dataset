# dapinskiwomin/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic es un ajuste fino (fine tune) de tipo multi-etapa y multi-merge publicado por el usuario dapinskiwomin sobre el modelo de DavidAU Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, que a su vez deriva de la familia Qwen3.8 de 27B. El repositorio distribuye cuantizaciones GGUF (tanto "regular" como "MTP") generadas con imatrix, orientadas a ejecucion en hardware de consumo, y se presenta como la primera publicacion de este tamano en superar 730 puntos en ARC-C en 8 bits y 880 en ARC-E, segun los datos aportados por el propio autor.

El modelo se enmarca en la linea "Heretic" (uncensored/abliterated) del autor y utiliza los metodos de entrenamiento denominados COLD FUSION (GAIN + Unsloth) y Fable Fusion 711. Su objetivo declarado es doble: aumentar la inteligencia general y reducir drasticamente el numero de tokens de razonamiento (entre la mitad y hasta un decimo, con una reduccion mediana aproximada de dos tercios) manteniendo el detalle y la calidad de la salida. El tamano real medido en los pesos safetensors es de 26.895.998.464 parametros (aproximadamente 26,9 mil millones) y el repositorio ocupa 389 GB, con licencia Apache 2.0.

Se trata de un modelo con pipeline declarado image-text-to-text, orientado a razonamiento, generacion de codigo, escritura creativa y roleplaying, con soporte de modo thinking y variantes de decodificacion MTP (multi-token prediction). La informacion publicada es extensa en afirmaciones de rendimiento, pero muy escasa en especificaciones formales: no se detallan arquitectura exacta, longitud de contexto, composicion del dataset ni la mayoria de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivada de la familia Qwen3.8; el autor no especifica la arquitectura concreta) |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 B, dato real de safetensors) |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4 (4 bits, referencia Q4KS) y Q8 (8 bits); cuantizaciones "regular" y "MTP" con doble imatrix (DI-MATRIX); pesos base en bfloat16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF |
| Pipeline declarado | image-text-to-text |
| Modelo base | DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU |
| Tamano del repositorio | 389,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-13 |
| Etiquetas relevantes | gguf, unsloth, fine tune, heretic, uncensored, abliterated, MTP, thinking, reasoning, coder, creative writing, roleplaying, multi-stage tuned |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion disponible. Por linaje (familia Qwen3.8, tag `qwen3_8`) cabe esperar un transformer decoder denso de aproximadamente 27B parametros, pero el autor no confirma ni el tipo de atencion, ni el numero de capas, ni la longitud de contexto. Lo que si se explicita es que se trata de un ajuste fino multi-etapa y multi-merge, construido sobre un modelo ya previamente tuneado por DavidAU, y que existen variantes de cuantizacion con soporte MTP (multi-token prediction) para acelerar la generacion.

En cuanto al entrenamiento, el autor describe dos tecnicas propietarias. La primera, COLD FUSION, combina un componente denominado GAIN con los entrenadores de Unsloth: GAIN modifica dinamicamente el entrenamiento muestra a muestra en tiempo real, segun como va aprendiendo el modelo. La segunda, Fable Fusion 711, se aplica de forma complementaria. Los datasets citados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets. Los objetivos declarados del entrenamiento fueron: aumentar la inteligencia general y la resolucion de problemas, reducir el bloque de razonamiento (mediana de reduccion aproximada de dos tercios, con casos de hasta un decimo), reformatear y mejorar dicho bloque, acelerar la generacion de tokens (especialmente con MTP), mantener la compatibilidad con los tres modos de pensamiento y elevar todos los benchmarks principales sin practicar "benchmaxing". No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon RLHF, DPO u otras tecnicas de alineamiento. El caracter "abliterated/uncensored" implica, en la practica, la eliminacion o atenuacion de las capas de rechazo del modelo original.

## Capacidades

- Generacion de texto y razonamiento en modo thinking, con bloques de pensamiento notablemente mas cortos que el modelo base segun el autor.
- Tres modos de operacion declarados (el autor menciona "all three modes of thinking"), sin detallar cuales son exactamente.
- Generacion de codigo: el modelo se etiqueta como `coder` y en el nombre del repositorio aparece "NEO-CODER MAX".
- Escritura creativa y ficcion: etiquetas `creative writing`, `story`, `fiction`, `all genres`; el autor incluye ejemplos de narrativa y roleplaying.
- Roleplaying y conversacion multi-turno de caracter abierto, sin filtros de contenido (uncensored/abliterated).
- Capacidades de vision: el pipeline declarado es image-text-to-text, lo que sugiere entrada de imagen junto a texto, aunque no se documenta el alcance real ni el encoder visual.
- Tool calling: el autor afirma en la model card (remitiendo a la pestana "community") el "mejor rendimiento de tool calling registrado", sin aportar cifras verificables en el texto disponible.
- Razonamiento agente multi-paso: etiquetas `reasoning` y `all use cases`, sin especificacion tecnica adicional.
- Capacidades multilingues limitadas a ingles y chino.
- Decodificacion acelerada mediante variantes GGUF con MTP.
- No se documentan capacidades de audio ni de generacion de imagen.

## Casos de uso

- Escritura creativa asistida: generacion de relatos, novelas por entregas y dialogos con control de estilo, aprovechando el ajuste especifico en ficcion y el enfoque en alta densidad de detalle. El modelo esta explicitamente tuneado para generos multiples y produccion larga sin agotamiento de plantilla.
- Roleplaying y narrativa interactiva: mantenimiento de personajes consistentes en conversaciones extensas, con la ventaja de un bloque de razonamiento recortado que reduce la latencia percibida en cada turno.
- Generacion de codigo en pipelines de desarrollo: el modelo puede integrarse en asistentes de IDE o en revisiones automatizadas de pull requests, siempre que se valide la calidad real mediante evaluacion propia, ya que no hay HumanEval ni MBPP publicados.
- Agentes con tool calling: integracion en flujos que requieran invocar APIs o funciones externas, con la cautela de que la afirmacion de rendimiento del autor no esta respaldada por numeros en la informacion disponible.
- Despliegue local en equipos de trabajo con GPU de consumo: al distribuirse en GGUF de 4 y 8 bits, permite inferencia en estaciones con una sola GPU de gama alta, sin depender de servicios en la nube.
- Prototipado de productos en ingles y chino: al soportar ambos idiomas, sirve para asistentes bilingues orientados a esos dos mercados, sin cobertura de otras lenguas.
- Investigacion sobre reduccion de tokens de razonamiento: el modelo es util como caso de estudio de tecnicas de compresion del bloque de pensamiento (COLD FUSION, Fable Fusion 711) frente a su base.
- Generacion de contenido sin restricciones tematicas: por su naturaleza abliterated, se emplea en contextos de ficcion adulta o temas sensibles, lo que limita su uso en entornos con requisitos de moderacion.

## Benchmarks y rendimiento

Los unicos datos aportados son de la familia ARC, y proceden exclusivamente de la model card del autor. No hay resultados publicados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

| Benchmark | Version / cuantizacion | Resultado declarado | Referencia comparativa citada |
|---|---|---|---|
| ARC-C | 8 bits | 735 | 144 puntos por encima de Qwen 3.8 27B |
| ARC-C | 4 bits | 719 (en otro punto del texto se menciona "718 arc-c en 4 bit", cifra no coincidente) | Supera el umbral de 718 en 4 bits |
| ARC-E | 8 bits | Mas de 880 | Se situa en la "zona de inteligencia" de OpenAI, Claude y Gemini, segun el autor |
| Benchmarks criticos (7 en total) | 4 y 8 bits | Supera al base Qwen 3.8 27B en los 7 | Tambien supera los 7 de Qwen3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B |

Advertencia: no se especifica el numero de benchmarks "criticos", ni sus nombres, ni la metodologia de evaluacion. Las cifras de ARC-C para 4 bits aparecen de forma inconsistente (718 frente a 719) dentro del propio texto. No se han publicado resultados de benchmarks verificables de forma independiente en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 54-56 GB en bfloat16 (26,9B parametros), en torno a 28-30 GB en cuantizacion de 8 bits y 15-17 GB en 4 bits (Q4KS), sin contar el contexto.
- GPU recomendadas para precision completa o 8 bits: A100 80 GB, H100 80 GB, RTX 6000 Ada / RTX 6000 Blackwell (48 GB) o varias GPU en paralelo.
- GPU de consumo: la cuantizacion de 4 bits cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con margen para contexto moderado; una RTX 4080/4070 Ti Super de 16 GB queda al limite y probablemente requiera reducir contexto o usar cuantizaciones mas agresivas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores GGUF compatibles para las variantes cuantizadas; vLLM o TGI para los pesos safetensors en bfloat16 (requiere hardware de datacenter).
- Throughput y latencia: no disponibles. El autor afirma que las variantes con MTP y el bloque de razonamiento recortado aceleran la generacion de tokens, pero no aporta mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Almacenamiento: el repositorio completo ocupa 389 GB, por lo que conviene descargar unicamente el archivo GGUF de la cuantizacion deseada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic | 26,9 B | No disponible | ARC-C 735 (8 bits) / 719 (4 bits) segun el autor | Apache 2.0 | GGUF y safetensors en HuggingFace |
| Qwen 3.8 27B (base de la familia) | 27 B aprox. | No disponible | Segun el autor, 144 puntos menos en ARC-C | No disponible en la informacion | No disponible en la informacion |
| Qwen3.6-35B-A3B | 35 B totales (A3B, probablemente MoE) | No disponible | El autor afirma que este modelo lo supera en sus 7 benchmarks criticos | No disponible en la informacion | No disponible en la informacion |
| Qwen 3.6 27B y Qwen 3.5 27B | 27 B aprox. | No disponible | El autor afirma que este modelo los supera en sus 7 benchmarks criticos | No disponible en la informacion | No disponible en la informacion |

Todas las comparaciones proceden de afirmaciones del autor de la model card. No hay datos de tercera parte ni especificaciones de contexto publicadas para ninguno de los modelos citados en la informacion disponible.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: se han atenuado o eliminado los mecanismos de rechazo, por lo que puede generar contenido ofensivo, violento, sexual o ilegal sin filtros. No es apto para productos dirigidos al publico general sin una capa adicional de moderacion.
- Riesgo elevado de alucinacion: no se documenta ninguna fase de alineamiento (RLHF, DPO, RLAIF) ni evaluacion de veracidad, y el estilo de los ejemplos publicados es deliberadamente exagerado y grandilocuente.
- Idiomas limitados a ingles y chino: no hay soporte declarado de castellano, lo que reduce su utilidad directa para productos en espanol.
- Longitud de contexto no documentada: no es posible planificar aplicaciones que dependan de ventanas largas sin medirla empiricamente.
- Afirmaciones de rendimiento no verificadas: las cifras de ARC-C y ARC-E provienen unicamente de la model card, hay una inconsistencia interna (718 frente a 719 en 4 bits) y afirmaciones como "el mejor rendimiento de tool calling registrado" no van acompanadas de numeros en el texto disponible.
- Trazabilidad dudosa del repositorio: el modelo aparece publicado por dapinskiwomin, con 0 descargas y 0 likes, y el autor original del linaje es DavidAU; conviene verificar que los pesos corresponden realmente al modelo base declarado antes de usarlos en produccion.
- Ausencia de benchmarks de codigo, matematicas y comprension general: pese a las etiquetas `coder` y `reasoning`, no hay HumanEval, MBPP, GSM8K ni MMLU en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime de responsabilidad legal por el contenido generado ni de las obligaciones de atribucion correspondientes.
- Resultados de la busqueda web no relevantes: las consultas externas devolvieron unicamente sitios de contenido para adultos sin relacion con el modelo, por lo que no hay informacion independiente que confirme o desmienta las afirmaciones del autor.
- Datasets de entrenamiento opacos: Polar-STRICT-Datasets y F451-STRICT-Datasets no se detallan en cuanto a composicion, tamano ni licencias de los datos de origen.
- Tamano de repositorio muy elevado (389 GB): la descarga completa es poco practica; conviene seleccionar unicamente el archivo GGUF necesario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dapinskiwomin/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic
- Modelo base declarado: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Referencia del metodo Fable Fusion 711 (autor original): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Dataset citado: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset citado: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Paper, blog tecnico, repositorio de codigo o demo adicionales: no disponible en la informacion proporcionada. Las busquedas web realizadas no devolvieron resultados relacionados con el modelo.
