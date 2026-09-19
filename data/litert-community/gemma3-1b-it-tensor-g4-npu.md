# litert-community/Gemma3-1B-IT-Tensor-G4-NPU

## Resumen

Gemma3-1B-IT-Tensor-G4-NPU es un artefacto derivado de `google/gemma-3-1b-it` cuantizado y reempaquetado por la comunidad `litert-community` para ejecutarse sobre la NPU Edge TPU «rio» del SoC Google Tensor G4, el chip de los Pixel 9, 9 Pro, 9 Pro XL y 9 Pro Fold. No se distribuye como pesos estándar en safetensors, sino como un bundle `.litertlm` v1 precompilado en formato DarwiNN DGC mediante compilación AOT, pensado para el runtime [LiteRT-LM](https://github.com/google-ai-edge/LiteRT-LM). El fichero, `Gemma3-1B-IT_int4hadamard_aot_ekv4096_G4.litertlm`, ocupa 874.631.968 bytes (875 MB) y declara una cuota de uso de NPU de aproximadamente el 100 %.

El problema que resuelve es concreto: permitir inferencia de un modelo de lenguaje de ~1.000 millones de parámetros íntegramente en la NPU de un teléfono, sin GPU, sin nube y con un consumo de almacenamiento reducido. Según su model card, es la primera build pública AOT en int4 para la NPU del Tensor G4 y ocupa aproximadamente la mitad que el otro bundle Gemma 3 1B para Tensor NPU publicado hasta la fecha (`litert-community/Gemma3-1B-IT_q8_ekv1280_Google_Tensor_G5.litertlm`, 1.678 MB), porque usa int4 por canal con rotación Hadamard en lugar de int8.

Su relevancia es doble. Por un lado, demuestra que un Gemma 3 completo puede compilarse a un único DGC de G4 mediante una cirugía de las capas `FULLY_CONNECTED` de rango 3, que el compilador AOT de DarwiNN rechaza con `OP_FAILED` y que Gemma 3 emite del orden de 360 veces. Por otro, perfila un rendimiento asimétrico: el prefill escala hasta unos 664 tok/s mientras el decode queda clavado en torno a 16 tok/s, lo que lo convierte en una pieza adecuada para cargas con prefill pesado y en un candidato natural a decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3, 26 capas); artefacto precompilado DarwiNN DGC para Edge TPU |
| Parametros totales | ~1.000 millones (modelo base `google/gemma-3-1b-it`; cifra exacta no disponible en la ficha) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha; el bundle embebe una KV cache de 4096 tokens (`ekv4096`) |
| Tipos de cuantizacion | int4 por canal + rotacion Hadamard (todas las FC / BMM / embed). La ficha cita tambien variantes int4 por tensor (incoherente) y bundles mixtos int2/int4/int8 en otro modelo |
| Idiomas soportados | No disponible |
| Licencia | Gemma (Gemma Terms of Use), con acceso restringido mediante gate en Hugging Face |
| Formato de pesos | `.litertlm` v1 (DarwiNN DGC precompilado); no safetensors ni GGUF |
| Tamano del repositorio | 0,9 GB (fichero de pesos: 874.631.968 B) |
| Modo de ejecucion | AOT (precompilado), no JIT |
| Cuota de NPU | ~100 % |
| Tokenizer y plantilla de chat | Embebidos en el bundle |
| Fecha de publicacion | 19 de septiembre de 2026 (creacion del repo) |

## Arquitectura y entrenamiento

La ficha no documenta el entrenamiento del modelo base (no hay datos sobre numero de tokens, composicion del dataset ni fases de RLHF/DPO); esta informacion corresponde a `google/gemma-3-1b-it` y no se reproduce aqui. Lo que si describe con detalle es el proceso de derivacion. El punto de partida es el checkpoint QAT de Google `google/gemma-3-1b-it-qat-int4-unquantized`, que se re-cuantiza a int4 por canal y se somete a una rotacion Hadamard al estilo `DECOMPOSED_HADAMARD_ROTATION` antes de la cuantizacion. El objetivo de esa rotacion es repartir los valores atipicos entre la base rotada y ajustar mejor la rejilla int4 por canal; segun el autor, el efecto mas visible aparece en la cabeza de 262.000 entradas de vocabulario, donde mejora la precision de los logits y la coherencia frente a un int4 por canal sin rotar. La cuantizacion por tensor, en cambio, produce texto incoherente al aplicar una sola escala sobre esa cabeza de 262k.

El habilitador tecnico clave es la cirugia de capas FC de rango 2: el compilador AOT de DarwiNN devuelve `OP_FAILED` ante operaciones `FULLY_CONNECTED` de rango 3, y Gemma 3 las emite unas 360 veces, de modo que la compilacion AOT falla sin intervencion. El script `recipe/fc_rank2_surgery.py` envuelve cada FC de rango 3 como `RESHAPE → FC de rango 2 → RESHAPE`, matematicamente equivalente y aceptada por el compilador. Segun la ficha, no consta una correccion upstream. Ademas, se advierte de que el soporte AOT por anchura de bits depende de la version del compilador y no existe una matriz fija de soporte; el bundle de produccion `gemma4-E2B` para G4 lleva tensores int2, int4 e int8 simultaneamente y compila, mientras que el habilitador verificado para un Gemma completo es la cirugia de rango 2.

## Capacidades

- Generacion de texto conversacional en modo chat, con plantilla de chat embebida en el bundle, sobre el modelo instruction-tuned Gemma 3 1B-IT.
- Ejecucion de inferencia integra en la NPU del Tensor G4, con una cuota declarada de aproximadamente el 100 % de los calculos en NPU.
- Procesamiento de prompts largos con prefill rapido: la ficha lo describe explicitamente como opcion mas rapida en telefono para cargas con prefill pesado (RAG, contexto largo, resumen, clasificacion).
- Candidato a decodificacion especulativa (MTP): la ficha lo senala como el siguiente palanca real de rendimiento, aunque no esta implementada en esta build.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Vision, audio o modo de razonamiento explicito (thinking): no disponibles en la informacion proporcionada.
- KV cache de 4096 tokens embebida, lo que fija el horizonte practico de conversacion multi-turno del bundle.

## Casos de uso

- Resumen de documentos en el dispositivo: el prefill sostenido de 608-664 tok/s permite digerir rapidamente entradas largas sin salir del telefono, util para resumir correos, articulos o notas de reuniones sin enviar datos a la nube.
- Recuperacion aumentada (RAG) local: indexacion y respuesta sobre un corpus personal en el dispositivo, aprovechando que el cuello de botella del prefill es comparativamente bajo y que la KV cache de 4096 tokens cubre fragmentos de contexto tipicos.
- Clasificacion y etiquetado de texto en el borde: tareas de una sola pasada (sentimiento, categoria, intent) se benefician del mismo perfil de prefill alto y salida corta, donde el decode limitado importa poco.
- Asistente de chat sin conexion: conversaciones de soporte o compania en movilidad, con procesamiento local que evita costes de API y mantiene los datos en el dispositivo, aceptando un decode de ~16 tok/s.
- Correccion y reescritura de texto en teclados o apps de productividad: generacion de frases cortas, autocompletado y reescritura integrados en el sistema, donde la latencia por token del decode es tolerable para salidas breves.
- Preprocesado en pipelines moviles de accesibilidad: transcripcion ya disponible convertida en resumen o acciones estructuradas, con la ventaja de que ~100 % del calculo ocurre en NPU y libera CPU y GPU para el resto de la aplicacion.
- Banco de pruebas para decodificacion especulativa: por su perfil de prefill-monster y decode-laggard, sirve como plataforma de medida para experimentar con MTP o draft models en silicio Tensor G4.
- Generacion de codigo en produccion: no disponible como caso de uso contrastado en la ficha; no hay datos de HumanEval ni soporte de tool calling documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica tabla de rendimiento de la ficha corresponde a mediciones de throughput en un Pixel 9 Pro XL con Tensor G4, sobre este bundle exacto, el 10 de septiembre de 2026:

| Prefill (tokens) | Decode (tokens) | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|---|
| 128 | 64 | 608,83 | 15,93 |
| 512 | 128 | 659,22 | 16,17 |
| 1024 | 64 | 663,99 | 15,89 |

La lectura que da el autor es que el prefill escala (608 → 659 → 664 tok/s al pasar de 128 a 1024 tokens, por amortizacion del coste fijo por dispatch, con un suelo estimado de ~670 tok/s) mientras el decode permanece practicamente invariante entre 15,89 y 16,17 tok/s (±0,9 %) a lo largo de un cambio de 8x en la longitud de prefill. La conclusion es que el decode esta limitado por dispatch, no por computo: el Edge TPU rinde en matmuls por lotes (prefill) pero desaprovecha su capacidad al generar un solo token por dispatch.

## Requisitos de hardware

- VRAM en GPU: no aplica. El modelo no esta pensado para GPU ni se distribuye en un formato cargable por runtimes de GPU.
- GPU recomendadas: ninguna. El destino es la NPU Edge TPU «rio» del Google Tensor G4.
- Compatibilidad de silicio: Tensor G4 (serie Pixel 9) soportado; Tensor G5 (Pixel 10) no soportado, porque el DGC esta compilado especificamente para G4; Tensor G2 y G3 tampoco.
- Almacenamiento: 875 MB para el fichero `.litertlm` (repositorio de 0,9 GB).
- Runtime: LiteRT-LM CLI con `--backend=npu`, o Google AI Edge Gallery en modo NPU. En ambos casos se exige una libreria de dispatch GoogleTensor compatible; el dispatch de una app de stock puede rechazar el bundle por desajuste de firmware.
- Formatos no soportados: llama.cpp / GGUF, web, iOS, escritorio y cualquier dispositivo que no sea Pixel con Tensor G4.
- Latencia y throughput estimados: prefill 608-664 tok/s, decode 15,9-16,2 tok/s en Pixel 9 Pro XL con Tensor G4, medidos sobre este bundle.
- Nota operativa: la ficha indica que las diferencias de comportamiento o «sensacion» frente a una referencia dependen de la configuracion del runtime (system prompt y muestreo: top-k, top-p, temperatura), no de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Cuantizacion | Tamano | KV cache | Silicio objetivo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Gemma3-1B-IT-Tensor-G4-NPU (este) | int4 por canal + Hadamard | 875 MB | 4096 | Tensor G4 (Pixel 9) | `.litertlm` (DGC AOT) | Gemma | Hugging Face, con gate |
| `litert-community/Gemma3-1B-IT_q8_ekv1280_Google_Tensor_G5.litertlm` | int8 | 1.678 MB | 1280 | Tensor G5 (Pixel 10) | `.litertlm` | Gemma | Hugging Face, con gate |
| `google/gemma-3-1b-it` (modelo base) | Sin cuantizar (BF16) | No disponible en la informacion proporcionada | No disponible | CPU / GPU | safetensors | Gemma | Hugging Face, con gate |
| `google/gemma-3-1b-it-qat-int4-unquantized` (checkpoint de origen) | QAT int4 sin cuantizar | No disponible en la informacion proporcionada | No disponible | CPU / GPU | safetensors | Gemma | Hugging Face, con gate |

La ficha tambien menciona un bundle `gemma4-E2B` para NPU G4 con dos subgrafos y tensores mixtos int2/int4/int8, verificado directamente, como evidencia de que el compilador AOT acepta anchuras mixtas. No se proporcionan datos de rendimiento comparables entre estos modelos mas alla del tamano de fichero.

## Limitaciones y advertencias

- Acceso restringido: el repositorio esta sujeto a un gate que exige aceptar los Gemma Terms of Use de Google; sin aceptarlos no se descargan los pesos.
- Licencia Gemma: cualquier uso, incluido el comercial, queda sujeto a las condiciones de la licencia Gemma del modelo base; hay que revisarlas antes de desplegar.
- Dependencia de firmware y runtime: al ser un DGC AOT, requiere una libreria de dispatch GoogleTensor compatible. Un dispatch de una app de stock puede rechazarlo por desajuste de firmware, y los detalles de runtime quedan fuera del alcance del repositorio.
- Compatibilidad de hardware muy estrecha: solo Tensor G4 (Pixel 9, 9 Pro, 9 Pro XL, 9 Pro Fold). No funciona en Tensor G5 ni en G2/G3, ni en llama.cpp/GGUF, web, iOS o escritorio.
- Decode lento en terminos absolutos: ~16 tok/s, limitado por dispatch y no por computo. Para generacion larga la experiencia es la de un modelo pequeno en movil, no la de un servidor.
- Ventana efectiva limitada por la KV cache embebida de 4096 tokens, independientemente del contexto que soporte el modelo base.
- Modelo de ~1.000 millones de parametros: cabe esperar razonamiento limitado, mayor propension a la alucinacion y menor fidelidad en tareas complejas que modelos de mayor tamano. No hay benchmarks publicados en la ficha que permitan acotar ese riesgo.
- Sin datos de sesgos: la informacion proporcionada no incluye evaluaciones de sesgo, toxicidad ni equidad.
- Sin datos de idiomas: no se especifica la cobertura linguistica del bundle ni si la cuantizacion degrada de forma desigual segun el idioma.
- Advertencia del autor: las diferencias de comportamiento frente a una referencia son configuracion del runtime (system prompt y parametros de muestreo), no efecto de la cuantizacion; conviene igualar system prompt, top-k, top-p y temperatura antes de comparar.
- Sin soporte de decodificacion especulativa en esta build, pese a identificarse como la principal palanca de rendimiento pendiente.
- Sin datos de descargas ni de valoraciones en el momento de redactar la ficha (0 descargas, 0 likes), por lo que no existe validacion de la comunidad.

## Enlaces

- [litert-community/Gemma3-1B-IT-Tensor-G4-NPU en Hugging Face](https://huggingface.co/litert-community/Gemma3-1B-IT-Tensor-G4-NPU)
- [Modelo base: google/gemma-3-1b-it](https://huggingface.co/google/gemma-3-1b-it)
- [Checkpoint de origen: google/gemma-3-1b-it-qat-int4-unquantized](https://huggingface.co/google/gemma-3-1b-it-qat-int4-unquantized)
- [Runtime LiteRT-LM (google-ai-edge)](https://github.com/google-ai-edge/LiteRT-LM)
- [Documentacion de la cirugia de rango 2: `RANK2_FC_SURGERY.md`](./RANK2_FC_SURGERY.md) (referenciada en la model card, dentro del propio repositorio)
- [Script `recipe/fc_rank2_surgery.py`](./recipe/fc_rank2_surgery.py) (referenciado en la model card, dentro del propio repositorio)
- Gemma Terms of Use: enlazados desde el gate del repositorio en Hugging Face (no se incluye URL directa en la informacion proporcionada)
- La busqueda web realizada no devolvio resultados relevantes para este modelo: los unicos resultados obtenidos fueron consultas no relacionadas sobre transporte ferroviario aleman, eliminacion de software y un videojuego, sin ninguna relacion con Gemma 3, LiteRT-LM, Tensor G4 o cuantizacion de modelos.
