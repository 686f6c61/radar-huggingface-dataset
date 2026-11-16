# drowzeys/keys-GLM-5.3-DFlash2-ft8

## Resumen

`drowzeys/keys-GLM-5.3-DFlash2-ft8` es un ajuste fino del draft model `incoai/GLM-5.3-DFlash2`, el borrador de decodificacion especulativa DFlash 2 disenado para acelerar la inferencia del modelo objetivo `zai-org/GLM-5.3`. No es un modelo de lenguaje autonomo: se ejecuta dentro de un servidor de decodificacion especulativa y propone tokens que el modelo objetivo verifica y acepta o rechaza, de modo que la decodificacion permanece sin perdidas.

El modelo conserva la arquitectura del borrador base (6 capas, tamano de bloque 8, rango del selector 256) y solo modifica los pesos mediante entrenamiento adicional "on policy" sobre estados ocultos y etiquetas de siguiente token capturados de un GLM-5.3 en ejecucion, a lo largo de unas 2.900 secuencias de prosa, codigo y conversaciones de contexto largo. El resultado es un incremento marginal pero medido en la tasa de aceptacion: 2,099 tokens aceptados por ronda frente a 2,029 del borrador base en prosa con contexto de 32K.

Su relevancia es acotada y muy especifica: sirve para quien ya opera GLM-5.3 con el stack DFlash 2 sobre hardware DGX Spark y quiera exprimir un pequeno porcentaje adicional de throughput. Con 2.459 millones de parametros y 4,9 GB de pesos en safetensors, su licencia Apache 2.0 facilita la experimentacion, aunque el autor advierte explicitamente de que solo ha sido medido contra una cuantizacion EXL3 concreta del objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador DFlash 2 (block diffusion, decodificacion especulativa); 6 capas, block size 8, selector rank 256 |
| Parametros totales | 2.459.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como valor propio; validado con contexto de hasta ~120K en el objetivo |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar); el objetivo medido usa EXL3 a 2,75 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, md5 `a50f76216578ff2ce3479d6873da1952`) |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificacion especulativa basado en el metodo DFlash 2, que emplea difusion por bloques para proponer varios tokens a la vez (tamano de bloque 8) que el modelo objetivo verifica en paralelo. La arquitectura y el `config.json` son identicos a los del borrador base: 6 capas, block size 8 y rango del selector 256. No incorpora cabezas MTP; las mediciones se realizaron con el borrador solo.

El ajuste fino es exclusivamente de pesos y se realizo "on policy": el borrador se entreno sobre estados ocultos y etiquetas de siguiente token capturados de un GLM-5.3 en produccion, en aproximadamente 2.900 secuencias que cubren prosa, codigo y chats de contexto largo. El objetivo contra el que se capturaron estos datos es una variante modificada de GLM-5.3 cuantizada en EXL3 a 2,75 bits por peso, servida en cuatro NVIDIA DGX Spark con tensor parallel 4. Esta es la unica configuracion sobre la que se ha medido el modelo.

## Capacidades

- Generacion de tokens borrador para decodificacion especulativa sin perdidas sobre GLM-5.3.
- Propuesta de bloques de hasta 8 tokens por ronda de decodificacion, verificados por el modelo objetivo.
- Entrenado sobre tres dominios de texto: prosa, codigo y conversaciones de contexto largo.
- Funcionamiento con profundidad de borrador 7 y umbral de confianza 0,3 en la configuracion medida.
- No soporta tool calling, agentes, vision, audio ni modo thinking de forma autonoma: hereda las capacidades del modelo objetivo que acelera.
- No es utilizable como modelo de chat o generacion standalone.

## Casos de uso

- Aceleracion de inferencia de GLM-5.3 en produccion: sustituir el borrador base por este en el servidor de decodificacion especulativa para obtener un pequeno incremento de throughput (del orden del 3,5 % mas de tokens aceptados por ronda en prosa).
- Despliegue sobre DGX Spark en cluster: el escenario medido, con cuatro GB10 y tensor parallel 4, es el entorno natural de uso; encaja en equipos de trabajo que ya operan GLM-5.3 en este hardware.
- Servicio de generacion de codigo de baja latencia: en la configuracion medida alcanza 44,8 tokens/s en contexto corto y 39,4 tokens/s a ~120K, lo que lo hace adecuado para asistentes de codigo con respuestas largas.
- Procesamiento de documentos largos: mantiene 31,2 tokens/s en prosa a ~120K de contexto, util para resumen y analisis de documentos extensos donde la latencia de decodificacion es critica.
- Investigacion en decodificacion especulativa: sirve como punto de comparacion reproducible frente al borrador base y a ajustes previos (ft7) para estudiar el efecto del entrenamiento on policy en la tasa de aceptacion.
- Evaluacion de portabilidad de borradores: permite comprobar empiricamente si un borrador afinado a un objetivo EXL3 concreto mantiene su tasa de aceptacion frente a otras cuantizaciones o precisiones completas.

## Benchmarks y rendimiento

Medido el 2026-10-07 en cuatro DGX Spark (GB10), tensor parallel 4, un solo stream, thinking activado, borrador solo (sin cabezas MTP), profundidad de borrador 7 y confianza 0,3.

| Escenario | Este borrador (tokens/s) | Solo cabezas MTP (tokens/s) |
|---|---|---|
| Prosa, contexto corto | 39,1 | 37,1 |
| Prosa, 32K | 34,2 | 32,6 |
| Prosa, ~120K | 31,2 | no medido |
| Codigo, contexto corto | 44,8 | 41,1 |
| Codigo, 32K | 42,9 | 35,2 |
| Codigo, ~120K | 39,4 | no medido |
| Procesamiento de prompt, 32K | 1.196 | 1.188 |
| Procesamiento de prompt, 128K | 1.061 | 1.039 |

Tokens aceptados por ronda de decodificacion en prosa a 32K de contexto, mismo protocolo:

| Borrador | Tokens por ronda |
|---|---|
| `incoai/GLM-5.3-DFlash2` (base) | 2,029 |
| Ajuste previo ft7 | 2,057 |
| Este modelo (ft8) | 2,099 |

Las cifras de prosa corresponden a seis ejecuciones por configuracion, con ruido entre ejecuciones de aproximadamente el 3 %.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 4,9 GB en safetensors; en precision bf16/fp16 el modelo completo ronda los 4,9 GB, por lo que cabe en GPUs de consumo con 8 GB o mas, aunque en la practica comparte memoria con el modelo objetivo GLM-5.3, que es el consumidor dominante.
- GPU recomendadas: la configuracion medida y validada son cuatro NVIDIA DGX Spark (GB10) con tensor parallel 4. No se han publicado mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en terminos de memoria del borrador aislado; la viabilidad real depende de que el objetivo quepa junto a el.
- Opciones de despliegue: el autor indica que debe cargarse en el servidor de decodificacion especulativa que ya carga `incoai/GLM-5.3-DFlash2`, con el parametro `--speculative-draft-model-path drowzeys/keys-GLM-5.3-DFlash2-ft8` en el ejemplo de SGLang del model card base. No ha sido probado en SGLang ni en vLLM por el autor.
- Latencia y throughput: 39,1 tokens/s en prosa corta y 44,8 tokens/s en codigo corto; procesamiento de prompt de 1.196 tokens/s a 32K y 1.061 tokens/s a 128K, siempre en el hardware medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens aceptados/ronda (prosa 32K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ft8) | 2.459 M | no disponible (probado a ~120K) | 2,099 | Apache 2.0 | Hugging Face |
| `incoai/GLM-5.3-DFlash2` (base) | no disponible en la informacion | no disponible | 2,029 | Apache 2.0 | Hugging Face |
| Ajuste previo ft7 | no disponible en la informacion | no disponible | 2,057 | no disponible | no disponible |
| Cabezas MTP de GLM-5.3 | no disponible | no disponible | no medido en esta metrica | la de GLM-5.3 | integrado en el objetivo |

## Limitaciones y advertencias

- Solo se ha medido contra una cuantizacion EXL3 a 2,75 bits por peso de una variante modificada de GLM-5.3; no hay datos frente a GLM-5.3 en precision completa, NVFP4 ni otras cuantizaciones. La tasa de aceptacion puede variar y debe medirse antes de confiar en el modelo.
- No ha sido probado por el autor en SGLang ni en vLLM, aunque el formato de ficheros es el del borrador base y deberia cargarse en su lugar.
- La mejora sobre el borrador base es pequena: aproximadamente un 3,5 % mas de tokens aceptados por ronda en prosa, con un ruido de ejecucion de en torno al 3 %.
- Todas las cifras proceden de DGX Spark; no hay mediciones en otra hardware.
- No es un modelo de lenguaje autonomo: no genera respuestas por si mismo y no debe evaluarse con benchmarks de conocimiento, razonamiento o codigo.
- No se dispone de informacion sobre sesgos, riesgos de alucinacion o cobertura idiomatica propia, ya que hereda el comportamiento del objetivo GLM-5.3.
- La licencia Apache 2.0 cubre este repositorio; el uso del modelo objetivo GLM-5.3 se rige por su propia licencia.
- El repositorio no esta afiliado ni respaldado por los autores del borrador base ni por los del modelo objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/drowzeys/keys-GLM-5.3-DFlash2-ft8
- Borrador base: https://huggingface.co/incoai/GLM-5.3-DFlash2
- Modelo objetivo: https://huggingface.co/zai-org/GLM-5.3
- Blog del metodo DFlash 2: https://inco.ai/blog/dflash2/
- Codigo del metodo DFlash: https://github.com/z-lab/dflash
