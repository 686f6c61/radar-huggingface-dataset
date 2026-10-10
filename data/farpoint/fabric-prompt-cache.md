# Farpoint/fabric-prompt-cache

## Resumen

Farpoint/fabric-prompt-cache no es un modelo de lenguaje: es un repositorio de ficheros de estado guardado (KV prefix cache) de llama.cpp, con un total de 2,8 GB. Cada fichero `.kvprefix.bin` contiene lo que un modelo concreto tiene en memoria despues de procesar la apertura fija del prompt de Fabric, la aplicacion de escritorio de codificacion asistida de [codewithfabric.com](https://codewithfabric.com). El objetivo es permitir que la aplicacion responda al primer mensaje en "un par de segundos" en lugar de emplear minutos en leer sus instrucciones y descripciones de herramientas en un portatil.

El repositorio no incluye pesos. Los modelos a los que sirven los ficheros se descargan aparte: `Qwen3.8-27B-UD-Q4_K_XL.gguf` (de unsloth/Qwen3.8-27B-GGUF, con modelo draft `Qwen3.8-27B-DFlash2-Q4_K_M.gguf` de z-lab) y `Qwen3.5-9B-UD-Q4_K_XL.gguf` (de unsloth/Qwen3.5-9B-GGUF). Los ficheros de cache miden 1.915.317.992 bytes y 837.444.112 bytes respectivamente y cubren 20.753 y 20.715 tokens de prompt.

La relevancia de este repositorio es acotada y muy especifica: es un artefacto de despliegue atado a la aplicacion Fabric, no un componente reutilizable. Cada fichero solo funciona con la combinacion exacta de fichero de modelo, build del motor y version de las instrucciones de Fabric con la que se genero; Fabric verifica el SHA-256 y el manifiesto antes de cargarlo e ignora cualquier fichero que no coincida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene pesos de modelo; almacena estados serializados de llama.cpp) |
| Parametros totales | no disponible (corresponde a los modelos referenciados: Qwen3.8-27B y Qwen3.5-9B, segun nomenclatura del autor) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible; los ficheros cubren 20.753 tokens (27B) y 20.715 tokens (9B) de prompt fijo |
| Tipos de cuantizacion | no disponible en el repositorio; los modelos referenciados se usan en cuantizacion `UD-Q4_K_XL` |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el repositorio; los modelos referenciados se publican bajo Apache 2.0 segun sus respectivas model cards |
| Formato de pesos | no contiene pesos; ficheros `.kvprefix.bin` (estado guardado de llama.cpp) acompanados de `.manifest.json` |
| Tamano del repositorio | 2,8 GB |
| Numero de ficheros de cache | 2 |
| Motor de generacion | Fabric engine `victoria-mtp-b11512`, macOS sobre Apple silicon |
| Fecha de creacion | 2026-10-09T22:31:24.000Z |
| Fecha de ultima actualizacion | 2026-10-09T22:33:18.000Z |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: no hay arquitectura de red ni proceso de entrenamiento descrito en la informacion disponible. Lo que contiene el repositorio son volcados del estado de atencion (KV cache) de llama.cpp tras procesar un prefijo de prompt constante. Tecnicamente, un fichero `.kvprefix.bin` es el resultado de guardar el estado de la sesion de llama.cpp una vez leido el bloque fijo de instrucciones y descripciones de herramientas de Fabric, de forma que el prefill de esos ~20.700 tokens no tenga que recalcularse en cada arranque.

La innovacion, en terminos practicos, es la distribucion de ese prefill precalculado junto al modelo, con verificacion de integridad por SHA-256 y un manifiesto que registra las dependencias exactas. Para el caso del 27B se indica ademas el uso de un modelo draft (`Qwen3.8-27B-DFlash2-Q4_K_M.gguf`), lo que apunta a decodificacion especulativa como parte del flujo de generacion, aunque no se detallan los parametros de esa configuracion.

## Capacidades

- No es un modelo generativo: no produce texto, codigo ni razonamiento por si mismo. Su unica funcion es precargar estado de inferencia.
- Reduccion del tiempo hasta el primer token en el arranque de la aplicacion Fabric, al evitar el prefill del prompt fijo de instrucciones y herramientas.
- Compatibilidad con decodificacion especulativa en el caso del 27B, mediante el modelo draft DFlash2 referenciado.
- Verificacion de integridad y de dependencias mediante SHA-256 y `.manifest.json` antes de cargar el estado.
- Soporte de multiples modelos y versiones: se anaden ficheros nuevos cuando cambian las instrucciones, las herramientas, el fichero de modelo o el build del motor.
- Persistencia de versiones antiguas para instalaciones de Fabric que las siguen solicitando por nombre.
- No ofrece tool calling, agentes, multilingueismo ni ninguna otra capacidad funcional: eso depende del modelo GGUF que se cargue por separado.

## Casos de uso

- Arranque rapido de un asistente de codigo local en portatil: el usuario descarga Fabric, el modelo GGUF correspondiente y el `.kvprefix.bin`, y la aplicacion puede responder al primer mensaje en segundos en lugar de minutos, algo critico en equipos Apple silicon sin GPU dedicada.
- Despliegue reproducible de entornos de demostracion: al fijar hash de modelo, hash de fichero de cache y build del motor, un equipo puede garantizar que todos los puestos de trabajo arrancan con exactamente el mismo estado de prompt y las mismas latencias de prefill.
- Analisis de latencia de prefill en investigacion de inferencia local: los ficheros permiten medir de forma aislada el coste de la fase de decodificacion, dado que el coste de leer 20.753 tokens de prompt queda eliminado del arranque.
- Documentacion de la huella de memoria de un prompt largo: los tamanos de 1,9 GB y 837 MB sirven como referencia empirica del espacio que ocupa una KV cache de ~20.700 tokens en modelos de 27B y 9B con cuantizacion Q4_K_XL.
- Verificacion de cadena de suministro de artefactos de IA: el patron de manifiesto mas hash SHA-256 es un ejemplo aplicable a la distribucion controlada de estados y configuraciones en entornos corporativos.
- Material de referencia para desarrolladores de aplicaciones locales: quien construya un cliente de escritorio sobre llama.cpp puede estudiar este esquema de cache de prefijo como modelo de diseno para reducir el tiempo de arranque percibido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica cifra de rendimiento declarada es cualitativa: "un par de segundos" frente a "minutos" en el arranque, sin especificacion del hardware de referencia mas alla de macOS sobre Apple silicon.

| Metrica | Valor |
|---|---|
| Tokens cubiertos por la cache (27B) | 20.753 |
| Tokens cubiertos por la cache (9B) | 20.715 |
| Latencia de arranque declarada | "un par de segundos" |
| Latencia sin cache declarada | "minutos en un portatil" |
| Hardware de generacion de los ficheros | macOS sobre Apple silicon |

## Requisitos de hardware

- VRAM o memoria unificada estimada para inferencia: no disponible. No se publican requisitos del modelo base.
- Tamano del fichero de estado en disco: 1,9 GB para el 27B y 0,84 GB para el 9B. Este tamano es un indicador del orden de magnitud del estado que debe residir en memoria junto a los pesos del modelo.
- GPU recomendadas: no disponibles. El unico entorno documentado es macOS sobre Apple silicon (motor `victoria-mtp-b11512`).
- Compatibilidad con GPU de consumo: no especificada. Los modelos referenciados (27B y 9B en Q4_K_XL) son candidatos razonables para memoria unificada de gama alta o GPU con suficiente VRAM, pero no hay datos confirmados en la informacion proporcionada.
- Opciones de despliegue: exclusivamente la aplicacion Fabric sobre llama.cpp. Otros runners (vLLM, TGI, Ollama, llama.cpp standalone) no pueden consumir estos ficheros.
- Latencia y throughput: solo la referencia cualitativa de arranque; no se publican tokens por segundo.

## Comparativa con modelos similares

| Alternativa | Que ofrece | Portabilidad | Coste de mantenimiento | Licencia |
|---|---|---|---|---|
| Farpoint/fabric-prompt-cache | Cache de prefijo precalculada y distribuida junto al modelo, con manifiesto y verificacion SHA-256 | Nula fuera de Fabric: exige fichero de modelo, build de motor e instrucciones identicos | Alto: cada cambio de instrucciones, herramientas, modelo o motor obliga a regenerar el fichero | no disponible |
| `--prompt-cache` de llama.cpp | Volcado local del estado KV generado por el propio usuario | Alta dentro de llama.cpp, pero valida solo para el mismo binario y modelo | Bajo, pero requiere generar la cache en cada maquina | MIT (llama.cpp) |
| Automatic prefix caching de vLLM | Reutilizacion de prefijos en memoria dentro de un servidor de inferencia | Propia del servidor; no es un artefacto distribuible | Bajo en operacion, no reduce el primer arranque en frio | Apache 2.0 |
| RadixAttention de SGLang | Reutilizacion de prefijos compartidos en tiempo de ejecucion con estructura de radix tree | Propia del servidor; no distribuible como fichero | Bajo en operacion | Apache 2.0 |

Las cifras concretas de rendimiento de estas alternativas no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo: carece de pesos, de capacidades generativas y de cualquier utilidad fuera del ecosistema Fabric.
- Dependencia estricta de tres variables: fichero de modelo exacto (verificado por SHA-256), build del motor y version de las instrucciones de Fabric. Cualquier desajuste provoca que Fabric ignore el fichero y vuelva a leer el prompt completo.
- Cargar el fichero en otro programa, otro modelo u otro build de llama.cpp no funciona, segun la propia model card.
- No hay informacion sobre licencia del repositorio, idiomas soportados ni pipeline declarado en HuggingFace.
- Sin descargas ni likes en el momento de la consulta: no existe validacion independiente por parte de la comunidad.
- Ausencia total de benchmarks publicados: no se puede verificar la mejora de latencia declarada ni compararla con alternativas.
- Los ficheros son especificos de macOS sobre Apple silicon (motor `victoria-mtp-b11512`); su comportamiento en otros sistemas no esta documentado.
- El repositorio crece de forma acumulativa: los ficheros antiguos se conservan, lo que incrementa el peso del almacenamiento con el tiempo.
- Riesgo de confusion: una busqueda rapida en el Hub puede llevar a tratarlo como un modelo descargable, cuando no contiene ningun peso utilizable.
- Las referencias a los modelos base (Qwen3.8-27B, Qwen3.5-9B) y a sus licencias Apache 2.0 provienen exclusivamente de la model card del autor; deben verificarse en las cards originales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Farpoint/fabric-prompt-cache
- Aplicacion Fabric: https://codewithfabric.com
- Modelo 27B en GGUF (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Modelo draft para el 27B (z-lab): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
- Modelo 9B en GGUF (unsloth): https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Texto de licencia del modelo 9B: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
