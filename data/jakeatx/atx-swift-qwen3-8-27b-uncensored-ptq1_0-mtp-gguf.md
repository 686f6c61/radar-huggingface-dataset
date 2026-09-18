# jakeatx/ATX-Swift-Qwen3.8-27B-Uncensored-PTQ1_0-MTP-GGUF

## Resumen

ATX-Swift-Qwen3.8-27B-Uncensored-PTQ1_0-MTP-GGUF es una cuantización ternaria de 1,75 bits por peso (formato PTQ1_0) del modelo d0xin/Swift-Qwen3.8-27B-Uncensored-BF16, publicada por el usuario jakeatx. El objetivo es reducir un modelo denso de aproximadamente 27.000 millones de parámetros a un fichero GGUF de 7.199.369.088 bytes (6,70 GiB), apto para inferencia en GPU de consumo y en CPU mediante llama.cpp. Se trata de una variante "uncensored", es decir, derivada de un ajuste fino del modelo base que elimina total o parcialmente los mecanismos de rechazo y alineación de seguridad.

La innovación principal no es la cuantización en sí, sino la incorporación de una cabeza nativa de predicción multi-token (MTP, Multi-Token Prediction) fusionada en el propio fichero como la capa 64 (`blk.64.*`), con `qwen35.block_count: 65` en los metadatos. Esto permite decodificación especulativa autoinducida (self-speculative decoding) sin necesidad de un modelo borrador externo, configurable en `llama.cpp` mediante `--spec-type draft-mtp`.

El modelo es relevante para quienes investigan cuantización extrema (por debajo de 2 bits por peso) y técnicas de aceleración de la decodificación en hardware limitado, así como para equipos que necesitan desplegar un modelo de 27B en una única GPU con 12-16 GB de VRAM. La licencia `swift-open-license-1.0` (declarada como `other`) y la ausencia de benchmarks publicados obligan a una evaluación propia antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con cabeza MTP nativa (metadatos `qwen35.*`, 65 bloques: 64 de transformer + 1 de MTP); detalles exactos no disponibles |
| Parametros totales | ~27B segun la denominacion del modelo; recuento exacto no disponible (el tamano de fichero a ~2,10 bpw es coherente con ~27.000 millones) |
| Longitud de contexto | Al menos 32.768 tokens (valor empleado en el ejemplo oficial de `llama-server`); maximo entrenado no disponible |
| Tipos de cuantizacion | PTQ1_0: ternaria de 1,75 bits por peso, 5 trits empaquetados por byte, contenedor de ~2,10 BPW con tensores criticos preservados en mayor precision |
| Idiomas soportados | no disponible |
| Licencia | `swift-open-license-1.0` (declarada como `license: other`); terminos no verificados |
| Formato de pesos | GGUF (fichero unico, llama.cpp); 7.199.369.088 bytes (6,70 GiB); SHA256 `c7c47656be2f50a6a37d50e36d0bf5fa47d9d563243e6dc2ae2acaa0363218f9` |
| Modelo base | d0xin/Swift-Qwen3.8-27B-Uncensored-BF16 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO o fases de ajuste). Los metadatos del GGUF emplean claves de la familia `qwen35` y el nombre comercial hace referencia a "Qwen3.8", una denominacion que no se corresponde con ninguna nomenclatura publica verificable; la unica certeza es que se trata de un transformer decoder denso de 64 bloques sobre el que se ha anadido una cabeza MTP como bloque 65.

La aportacion tecnica de esta publicacion es doble. Por un lado, la cuantizacion ternaria PTQ1_0: los pesos se representan con 5 trits por byte (aproximadamente 1,6 bits crudos por peso), con una media de 1,75 bits por peso y un contenedor global de ~2,10 BPW, lo que indica que ciertos tensores (probablemente embeddings, normalizaciones y las proyecciones del cabezal de atencion) se conservan en mayor precision para limitar la degradacion. Por otro, la fusion del cabezal MTP en el propio fichero, que habilita decodificacion especulativa autoinducida: el bloque 64 propone borradores que el modelo principal verifica en paralelo. El ejemplo oficial emplea `--spec-draft-n-max 3` y `--spec-draft-p-min 0.45`, es decir, hasta 3 tokens de borrador con umbral de aceptacion de 0,45.

## Capacidades

- Generacion de texto autoregresiva, con la capacidad del modelo base de 27B subyacente (calidad condicionada por la cuantizacion ternaria).
- Decodificacion especulativa nativa mediante cabeza MTP integrada, sin modelo borrador externo.
- Razonamiento multi-paso presumiblemente heredado del modelo base; no confirmado por benchmarks.
- Generacion de codigo y matematicas: no disponible (no se documenta, aunque es esperable en un modelo de esta familia y tamano).
- Tool calling / function calling: no disponible.
- Capacidades de agente: no disponible.
- Capacidades multilingues: no disponible; los idiomas no se declaran en la ficha.
- Vision o audio: no disponible; el pipeline es exclusivamente `text-generation`.
- Modo "uncensored": el ajuste del modelo base elimina o relaja los rechazos de contenido, lo que constituye una caracteristica diferencial frente a las variantes alineadas.
- Compatibilidad de despliegue: `llama.cpp` y `llamAmpere` (con soporte de las opciones `--spec-type`, `--spec-draft-n-max` y `--spec-draft-p-min`).

## Casos de uso

- Despliegue local en una sola GPU de consumo: los 6,70 GiB de pesos permiten ejecutar un modelo de ~27B en tarjetas de 12-16 GB, con `-ngl 99` para descargar todas las capas en GPU y contexto de 32.768 tokens en el ejemplo oficial.
- Investigacion sobre cuantizacion sub-2-bit: banco de pruebas para medir la degradacion de perplejidad y de calidad generativa de un esquema ternario (1,75 bpw) frente al BF16 base, util para validar tecnicas de empaquetado de trits y preservacion selectiva de tensores.
- Evaluacion de decodificacion especulativa autoinducida: permite medir el incremento de throughput (tokens por segundo) y la tasa de aceptacion de la cabeza MTP variando `--spec-draft-n-max` y `--spec-draft-p-min`, sin coste adicional de memoria por un modelo borrador.
- Procesamiento por lotes de documentos largos en hardware modesto: con una ventana de 32.768 tokens, se pueden resumir, clasificar o extraer informacion de contratos, informes o articulos sin dividir el texto en fragmentos.
- Generacion creativa y de ficcion sin filtros tematicos: el ajuste "uncensored" evita los rechazos del modelo base en narrativa adulta, terror o tematicas controvertidas, un caso de uso habitual en escritura asistida.
- Red teaming y evaluacion de seguridad: sirve como referencia de "peor caso" para medir hasta que punto un modelo sin alineacion produce contenido danino o factualmente incorrecto, en entornos de laboratorio controlados.
- Prototipado offline y en entornos sin conectividad: al ser un unico fichero GGUF que corre en `llama-server`, es adecuado para estaciones de trabajo aisladas, demos en portatil con GPU discreta y entornos con requisitos de soberania de datos.
- Docencia y formacion tecnica: por su tamano manejable y su formato abierto, resulta util para explicar cuantizacion ternaria, decodificacion especulativa y el funcionamiento interno de `llama.cpp`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, perplejidad ni de tasa de aceptacion de la cabeza MTP. Tampoco se documenta la degradacion respecto al modelo BF16 original.

## Requisitos de hardware

- Pesos en disco y en memoria: 6,70 GiB (7.199.369.088 bytes). Es el minimo imprescindible para cargar el modelo.
- VRAM estimada para inferencia: por encima de 8 GiB contando pesos y overhead del runtime; el ejemplo oficial descarga las 65 capas en GPU (`-ngl 99`). Estimacion orientativa, no confirmada por el autor.
- Cache KV: no disponible. Depende del numero de cabezas KV, la dimension de cabeza y el numero de capas, datos que no se publican. A modo ilustrativo, con 64 capas y un esquema GQA de 8 cabezas KV de dimension 128 en FP16, un contexto de 32.768 tokens rondaria los 8 GB adicionales; esta cifra es una estimacion condicional, no un dato del modelo.
- GPU que lo admiten con holgura: A100 40/80 GB, H100, L40S, RTX 6000 Ada.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080/4090 24 GB y Apple Silicon con memoria unificada de 16 GB o superior. En 12 GB el contexto util quedara limitado por la cache KV.
- CPU y memoria del sistema: ejecutable en CPU con AVX2/AVX-512 o ARM NEON usando `llama.cpp`; se recomienda un minimo de 16 GB de RAM y memoria suficiente para el mapeo completo del fichero.
- Opciones de despliegue: `llama-server` de `llama.cpp` y `llamAmpere`, que son los unicos entornos para los que el autor documenta y valida el soporte de `--spec-type draft-mtp`. El soporte en vLLM, TGI u Ollama no esta confirmado y es improbable para el modo especulativo MTP, dado que el formato ternario PTQ1_0 es especifico de `llama.cpp`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ATX-Swift-Qwen3.8-27B-Uncensored-PTQ1_0-MTP-GGUF | ~27B | >= 32.768 (documentado en ejemplo) | PTQ1_0 ternaria, 1,75 bpw / ~2,10 BPW | swift-open-license-1.0 | HuggingFace, GGUF |
| d0xin/Swift-Qwen3.8-27B-Uncensored-BF16 (modelo base) | ~27B | no disponible | BF16 | no disponible (hereda la del ajuste original) | HuggingFace, safetensors |
| Otras cuantizaciones GGUF del mismo base (Q4_K_M, Q5_K_M, etc.) | ~27B | no disponible | 4-5 bits por peso, ~15-19 GiB | depende del publicador | HuggingFace, GGUF |
| Esquemas ternarios tipo BitNet b1.58 (1,58 bpw) | variable | no disponible | ternaria nativa, requiere entrenamiento desde cero | distinta segun modelo | HuggingFace |

No se han facilitado datos de rendimiento ni de perplejidad que permitan una comparacion cuantitativa con estas alternativas. La diferencia principal de esta ficha frente a la del modelo base es el tamano (6,70 GiB frente a los ~54 GB de un BF16 de 27B) y la presencia del cabezal MTP, a costa de una perdida de calidad no medida.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: 1,75 bits por peso es una compression muy agresiva (aproximadamente 8x frente a BF16). Es esperable degradacion en tareas de razonamiento, matematicas, codigo y en la adherencia a instrucciones, pero no hay mediciones publicadas.
- Riesgo de alucinacion: elevado y no acotado; no se documenta ningun proceso de alineacion posterior ni evaluacion de fidelidad. La cuantizacion extrema tiende a amplificar los errores en cadenas de razonamiento largo.
- Naturaleza "uncensored": el modelo puede generar contenido ofensivo, ilegal, peligroso o sexualmente explicito, y no incorpora rechazos. Su uso en productos orientados al publico o sin moderacion en la capa de aplicacion es desaconsejable.
- Licencia: `swift-open-license-1.0` esta declarada como `license: other`. Los terminos completos no se han podido verificar en la informacion disponible; antes de cualquier uso comercial es obligatorio revisar el texto de la licencia y comprobar si el modelo base impone condiciones adicionales o restricciones de atribucion.
- Idiomas: no declarados. No hay garantia de comportamiento correcto fuera de los idiomas con los que se entreno el modelo base.
- Contexto: solo esta confirmado el valor de 32.768 tokens usado en el ejemplo; no se documenta la ventana maxima del modelo base ni si el modelo fue entrenado para longitudes mayores.
- Compatibilidad de herramientas: el formato PTQ1_0 es especifico de `llama.cpp` y `llamAmpere`. No hay soporte confirmado en vLLM, TGI, Ollama ni otros servidores, lo que limita las opciones de escalado horizontal y de batching continuo de alto rendimiento.
- Madurez y trazabilidad: la ficha tiene 0 descargas y 0 likes en el momento de la consulta, fue creada y actualizada con apenas ocho segundos de diferencia y no incluye evaluacion, informe de calidad ni comparacion con el modelo BF16. Se trata de una publicacion sin validacion comunitaria.
- Inconsistencia de nomenclatura: los tags indican `qwen3_8` mientras los metadatos internos usan `qwen35`, y no se corresponde con ninguna version publica conocida de Qwen. Conviene tratar la denominacion como una etiqueta del autor, no como una identificacion verificada de la arquitectura.
- Integridad del fichero: se proporciona un SHA256 (`c7c47656be2f50a6a37d50e36d0bf5fa47d9d563243e6dc2ae2acaa0363218f9`) que conviene verificar tras la descarga, dado que una corrupcion en un modelo ternario produce salidas degradadas dificiles de diagnosticar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jakeatx/ATX-Swift-Qwen3.8-27B-Uncensored-PTQ1_0-MTP-GGUF
- Modelo base: https://huggingface.co/d0xin/Swift-Qwen3.8-27B-Uncensored-BF16
- Repositorio de llama.cpp (soporte de GGUF y decodificacion especulativa): https://github.com/ggml-org/llama.cpp

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo, su autor o el esquema de cuantizacion PTQ1_0; los resultados obtenidos corresponden a documentacion de YouTube TV y consultas no relacionadas, por lo que se han descartado. No se dispone de paper, blog tecnico ni demo asociados.
