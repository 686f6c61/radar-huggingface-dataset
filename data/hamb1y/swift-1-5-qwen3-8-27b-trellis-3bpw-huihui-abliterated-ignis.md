# Hamb1y/Swift-1.5-Qwen3.8-27B-trellis-3bpw-huihui-abliterated-ignis

## Resumen

Swift-1.5-Qwen3.8-27B-trellis-3bpw-huihui-abliterated-ignis es un contenedor de pesos de 27.000 millones de parametros derivado de la familia Qwen3.8, publicado por el usuario Hamb1y en Hugging Face. No se trata de un fine-tune ni de una recuantizacion: es un parche a nivel de byte que fusiona dos artefactos ya publicados, el contenedor Swift 1.5 en formato trellis a 3 bits por peso y el parche de abliteracion (eliminacion de la capa de rechazo) del autor huihui. El resultado conserva el 94 % de los objetos originales de Swift 1.5 sin tocar y sustituye 70 tensores de las capas 17 a 51.

El objetivo declarado es doble: por un lado, ofrecer un modelo de 27B que quepa integramente en una GPU de consumo de 16 GB (RTX 5070 Ti) sin recurrir a offload a CPU, gracias a la cuantizacion trellis a 3 bpw; por otro, eliminar el sesgo de rechazo del modelo base para que responda de forma directa en tareas de agente y generacion de codigo, sin necesidad de ingenieria de prompts para sortear negativas.

La relevancia actual reside en la combinacion de tres factores poco frecuentes en un mismo artefacto: ventana de contexto de 262.144 tokens por peticion, decodificacion especulativa con un borrador DFlash2 que acepta el 73,2 % de los tokens propuestos (5,12 tokens por paso forward) y un rendimiento medido de 251,9 tok/s en decodificacion de codigo largo sobre una unica tarjeta de 16 GB. La licencia es MIT y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8), con torre de vision, cabeza MTP y borrador especulativo DFlash2 |
| Parametros totales | 27 000 millones (aproximado, segun denominacion del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens por peticion; pool KV de 340.608 tokens |
| Tipos de cuantizacion | Trellis a 3 bits por peso (3 bpw); formato propietario `.ninfer` v2 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `.ninfer` v2 (contenedor binario propietario de la libreria `ignis`); no hay safetensors ni GGUF publicados |
| Tamano del repositorio | 13,4 GB |
| Libreria de inferencia | `ignis` |
| Modelo base | `gpillon/Swift-1.5-Qwen3.8-27B-trellis-3bpw-ignis` y `gpillon/Qwen3.8-27B-trellis-3bpw-abliterated-ignis` |
| Fecha de publicacion | 25 de noviembre de 2026 |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado por el autor: es una fusion por parcheo de bytes de dos contenedores preexistentes con layout identico. El contenedor `.ninfer` v2 se compone de un magic de 6 bytes (`NINFER`), una version u16 en big-endian, una longitud JSON u64 en little-endian, un bloque de cabecera de 4 MiB (JSON rellenado con espacios) y una region de payload direccionada por los offsets de `objects[]`. Sobre esa estructura, el autor copia el contenedor Swift 1.5 (12,46 GiB) y sobrescribe los 70 payloads que el artefacto abliterado marca con `override: true`, correspondientes a las capas 17 a 51 en las proyecciones `mlp/down` y `gdn/output` o `attention/output`. Posteriormente reescribe el manifiesto con un nuevo `weights_id` y parchea el sidecar de Swift: los 70 registros de `trellis.matrices`, el bloque de procedencia `override`, un bloque `splice`, el `recipe_id` y las metricas de error relativo recalculadas.

Del total de 1.222 objetos del contenedor, 1.152 permanecen identicos byte a byte al Swift 1.5 original. Esto incluye el borrador especulativo DFlash2, la cabeza MTP, el embedding de tokens, la cabeza de salida, la torre de vision y la plantilla de chat. La verificacion publicada por el autor reporta 0 discrepancias de hash SHA-256 sobre los 1.222 objetos frente al sidecar fusionado, y el parseo correcto del fichero con `ignis-artifact-inspect`. No se documenta el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, ya que el autor no entrena el modelo, sino que hereda las caracteristicas del Qwen3.8 subyacente.

La innovacion tecnica destacable es la decodificacion especulativa: el borrador DFlash2 propone 7 tokens por paso y acepta el 73,2 %, lo que resulta en 5,12 tokens reales por pase forward sobre 596 rondas medidas. Esto es lo que permite sostener velocidades de decodificacion de tres cifras sobre una GPU de 16 GB con un modelo de 27B.

## Capacidades

- Generacion de texto en ingles con ventana de contexto de 262.144 tokens por peticion, suficiente para incluir un repositorio completo, una conversacion larga y el contexto de trabajo en un unico prompt.
- Razonamiento multi-paso y bucles de agente: el autor reporta turnos sinteticos de agente a 228,1 tok/s de mediana.
- Generacion de codigo, incluyendo respuestas largas de codigo (251,9 tok/s de mediana en `decode.long` con n=4).
- Tool calling y function calling: el autor menciona explicitamente respuestas de llamada a herramienta de 300 tokens resueltas en aproximadamente 1,2 s.
- Capacidades de vision: la torre de vision del Swift 1.5 original se conserva intacta en la fusion, aunque no se detallan las tareas multimodales soportadas.
- Comportamiento sin rechazo: el parche de abliteracion elimina la tendencia del modelo base a negarse a tareas como un tutorial de ganzuado paso a paso o un roast con tacos permitidos, segun la comparativa publicada por el autor.
- Paralelismo de dos peticiones concurrentes sin serializacion, con 418,8 tok/s agregados (aproximadamente 209 tok/s por lane).
- No se declaran capacidades de audio ni modo de pensamiento explicito (`enable_thinking: false` se usa en las pruebas de rechazo).

## Casos de uso

- Agente de codigo en local: con 262.144 tokens de contexto se puede cargar un repositorio entero y el historial de la tarea en un solo prompt, sin fragmentacion ni RAG, y el modelo responde a 251,9 tok/s en codigo largo, lo que hace viable un bucle de 10 llamadas por tarea en pocos segundos.
- Atencion al cliente automatizada multi-turno: la ventana de contexto y el pool KV de 340.608 tokens permiten mantener conversaciones largas con historial completo en VRAM, y el rendimiento de 213,9 tok/s en respuestas cortas mantiene la latencia percibida por debajo del segundo.
- Ejecucion de dos agentes en paralelo en una sola GPU de 16 GB: un investigador y un programador pueden correr simultaneamente contra el mismo modelo sin que una peticion bloquee a la otra, con 209 tok/s por lane, lo que permite montar un rig local con dos flujos de trabajo independientes.
- Herramientas de desarrollo asistido sin filtros: para tareas de generacion de codigo que requieren instrucciones directas (scripts de automatizacion, pruebas de seguridad, generacion de contenido con lenguaje explicito), el parche de abliteracion evita las negativas del modelo base y reduce la necesidad de reescribir prompts.
- Procesamiento de documentos largos en ingles: informes, expedientes o transcripciones de hasta 200.000 tokens se sirven en un unico prefill de 141,8 s y a partir de ahi la decodificacion mantiene el mismo ritmo, lo que encaja en pipelines de analisis por lotes.
- Prototipado rapido de agentes con tool calling: las respuestas de llamada a herramienta de 300 tokens se resuelven en aproximadamente 1,2 s, lo que permite iterar sobre disenos de herramientas y prompts sin que la latencia del modelo domine el ciclo de desarrollo.
- Despliegue en estaciones de trabajo con una unica RTX 5070 Ti: el modelo cabe integramente en 16 GB a 3 bpw, sin offload a CPU, lo que simplifica el despliegue en entornos sin acceso a GPUs de datacenter.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son mediciones de inferencia sobre perfil `rtx-16gb`, `ignis-bench small-card`, con DFlash2, 2 lanes de decodificacion y sin adaptacion. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible.

| Metrica | Mediana | Agregado |
|---|---:|---:|
| decode.long (codigo largo, n=4) | 251,9 tok/s | 244,1 tok/s |
| decode.coding (respuestas cortas, n=4) | 213,9 tok/s | 227,3 tok/s |
| decode.agent (turnos sinteticos, n=3) | 228,1 tok/s | 235,1 tok/s |
| Dos lanes concurrentes, codigo de 600 tokens | 209 tok/s por lane | 418,8 tok/s |

| Longitud de prompt | TTFT (frio) | Tasa de prefill |
|---:|---:|---:|
| 8.192 tokens | 4,35 s | 1.885 tok/s |
| 65.536 tokens | 38,2 s | 1.714 tok/s |
| 200.003 tokens | 141,8 s | 1.410 tok/s |

Especulacion: 73,2 % de aceptacion, 5,12 tokens aceptados por ronda, sobre 596 rondas medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en cuantizacion trellis a 3 bpw, segun el autor; el repositorio ocupa 13,4 GB.
- GPU recomendada por el autor: RTX 5070 Ti de 16 GB. No se documentan mediciones en A100, H100 ni otras GPU de datacenter.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas. No se especifican resultados en tarjetas de 8, 12 o 24 GB.
- Opciones de despliegue: la libreria `ignis` con el motor de inferencia del mismo proyecto y el formato `.ninfer` v2. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es propietario y no se distribuyen safetensors ni GGUF.
- Latencia y throughput: 0,4 s para una respuesta de 100 tokens, 1,2 s para 300 tokens y 2,4 s para 600 tokens; 418,8 tok/s agregados con dos lanes concurrentes; TTFT de 4,35 s para 8.192 tokens y 141,8 s para 200.003 tokens.
- El modelo requiere el borrador DFlash2 y la cabeza MTP incluidos en el contenedor para alcanzar las velocidades de decodificacion publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato | Notas |
|---|---|---:|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-trellis-3bpw-huihui-abliterated-ignis | 27B | 262.144 | Trellis 3 bpw | MIT | `.ninfer` v2 | Objeto de esta ficha; fusion por parcheo de bytes |
| `gpillon/Swift-1.5-Qwen3.8-27B-trellis-3bpw-ignis` | 27B | no disponible | Trellis 3 bpw | no disponible | `.ninfer` v2 | Modelo base de control; rechaza tareas que el fusionado acepta |
| `gpillon/Qwen3.8-27B-trellis-3bpw-abliterated-ignis` | 27B | no disponible | Trellis 3 bpw | no disponible | `.ninfer` v2 | Aporta los 70 tensores de abliteracion de las capas 17 a 51 |
| Qwen3.8-27B (modelo original) | 27B | no disponible | no disponible | no disponible | no disponible | Modelo de referencia de la familia; sin datos de rendimiento en la informacion disponible |

No se dispone de datos de benchmarks de calidad para establecer una comparacion cuantitativa con alternativas de la misma categoria. La comparacion disponible se limita a la procedencia de los artefactos y a las mediciones de inferencia del autor.

## Limitaciones y advertencias

- Solo se declara soporte de ingles; no hay evidencia de capacidades multilingues en la informacion proporcionada.
- El formato `.ninfer` v2 es propietario de la libreria `ignis` y fue reverse-engineered por el autor; no hay safetensors ni GGUF, lo que limita la portabilidad a ecosistemas como vLLM, llama.cpp, Ollama o TGI.
- El modelo es una fusion por parcheo de bytes sin validacion de calidad publicada: no hay benchmarks de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad o sesgo. El autor solo verifica integridad de hashes y una comparativa cualitativa de rechazo.
- La abliteracion elimina la capa de rechazo del modelo base, lo que implica que el modelo puede generar contenido que el Qwen3.8 original rechazaria. Esto traslada al operador la responsabilidad de filtrado y moderacion en produccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos habituales de un modelo de 27B en ingles.
- El rendimiento publicado se ha medido exclusivamente en una RTX 5070 Ti de 16 GB con el motor `ignis` y DFlash2; no hay datos de latencia o throughput en otras GPU ni con otros backends.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (25 de noviembre de 2026), por lo que no hay evidencia de uso en produccion ni validacion independiente.
- La licencia MIT se declara en la model card, pero los modelos base (`gpillon/...`) no exponen su licencia en la informacion disponible; conviene verificar la cadena de licencias antes de un uso comercial.
- El contexto maximo de 262.144 tokens por peticion requiere un pool KV de 340.608 tokens; no se detalla el consumo de VRAM adicional de ese pool ni su impacto en el limite de 16 GB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hamb1y/Swift-1.5-Qwen3.8-27B-trellis-3bpw-huihui-abliterated-ignis
- Modelo base Swift 1.5: https://huggingface.co/gpillon/Swift-1.5-Qwen3.8-27B-trellis-3bpw-ignis
- Modelo base abliterado: https://huggingface.co/gpillon/Qwen3.8-27B-trellis-3bpw-abliterated-ignis
- Repositorio de la libreria `ignis` (referenciado en la model card como `gpillon/ignis`, fichero `crates/artifact/src/lib.rs`): no disponible como URL directa en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
