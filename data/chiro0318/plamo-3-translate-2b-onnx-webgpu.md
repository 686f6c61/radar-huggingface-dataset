# chiro0318/plamo-3-translate-2b-onnx-webgpu

## Resumen

PLaMo 3 Translate 2B es un modelo de traduccion especializado desarrollado por Preferred Networks (PFNet), disponible en la coleccion PLaMo 3 Translate junto con variantes de 0,8B, 2B, 8B y 31B. La ficha que nos ocupa, `chiro0318/plamo-3-translate-2b-onnx-webgpu`, no es el modelo original sino una conversion no oficial a ONNX en 4 bits (q4f16) realizada por un tercero (chiro0318), pensada para ejecutarse en el navegador mediante onnxruntime-web sobre el backend WebGPU. Esta conversion alimenta la extension de Chrome "PLaMo Translate (On-device)".

El interes de esta variante radica en que permite traduccion multilingue totalmente local en el cliente, sin enviar texto a un servidor: el grafo ONNX se construye directamente desde los pesos safetensors del modelo base con operadores fusionados (`GroupQueryAttention` con RoPE, KV cache y sliding window; `SimplifiedLayerNormalization`), y las capas lineales se cuantizan a 4 bits con `MatMulNBits` (bloque 32, simetrico), mientras que activaciones y KV cache se mantienen en fp16. El resultado es un unico fichero de unos 1,62 GB que cabe en el almacenamiento de una pagina web o extension.

La relevancia actual es doble: por un lado, demuestra que un modelo de traduccion de 2B puede desplegarse en el navegador con WebGPU; por otro, sirve como referencia tecnica de como convertir arquitecturas con sliding window y KV cache a ONNX sin perder fidelidad (el autor reporta una diferencia maxima de logits de ~3e-5 en fp32 y salida greedy identica). Conviene subrayar que la calidad del modelo cuantizado a 4 bits solo se ha comprobado con frases de muestra y no se ha evaluado con benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GroupQueryAttention (RoPE, KV cache, sliding window); 24 capas inferidas del KV cache |
| Parametros totales | 2B (modelo base); tamano del repo ONNX 1,6 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base usa sliding window; longitud exacta no indicada) |
| Tipos de cuantizacion | 4 bits q4f16: `MatMulNBits` (bloque 32, simetrico) en lineales, `GatherBlockQuantized` en embeddings; activaciones y KV cache en fp16 |
| Idiomas soportados | ja, en, ko, zh, multilingual |
| Licencia | PLaMo Community License (uso personal y no comercial gratuito; comercial con registro previo en PFNet y limite de facturacion anual de 1000 millones de yenes) |
| Formato de pesos | ONNX (`onnx/model_q4f16.onnx` + `onnx/model_q4f16.onnx_data`), con `manifest.json` de tamanos y SHA-256 |
| Vocabulario | 107.520 tokens (dimension del logits) |
| Cabezas / dimension de cabeza | 4 cabezas de atencion, dimension 128 (segun forma del KV cache: `[1, 4, past, 128]`) |
| Runtime | onnxruntime / onnxruntime-web >= 1.22, con execution provider WebGPU o CPU |
| Entradas / salidas | `input_ids` int64 `[1, seq]`; `past_key_values.{i}.key|value` fp16 `[1, 4, past, 128]` para i en 0..23; `logits` float32 `[1, 1, 107520]` (solo ultima posicion); `present.{i}.key|value` |
| Modelo base | pfnet/plamo-3-translate-2b (revision `78355e2f5960`) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base PLaMo 3 Translate 2B: un transformer decoder-only con atencion de tipo GroupQueryAttention, RoPE y sliding window, segun se desprende de los operadores fusionados usados en la conversion. La conversion ONNX reproduce fielmente esta estructura: el grafo se genera directamente desde los pesos safetensors, los offsets de RMSNorm del modelo original se pliegan en los pesos de normalizacion, y se emplean `GroupQueryAttention` (con RoPE, gestion de KV cache y sliding window) y `SimplifiedLayerNormalization`. Las capas lineales se cuantizan a 4 bits con `MatMulNBits` (bloque 32, simetrico) y el embedding de tokens usa `GatherBlockQuantized`; activaciones y KV cache permanecen en fp16.

Sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, si hubo RLHF/DPO o tecnicas de alineacion) no se proporciona informacion en la documentacion disponible, por lo que se marca como no disponible. La innovacion tecnica destacable de esta ficha es la propia conversion: el autor verifica que la reimplementacion coincide con el modelo PyTorch original (diferencia maxima de logits de ~3e-5 en fp32 y salida greedy identica), lo que valida el proceso de exportacion a ONNX con operadores fusionados y cuantizacion de 4 bits. No obstante, la calidad del modelo cuantizado solo se ha comprobado con frases de muestra y no se ha evaluado con benchmarks.

## Capacidades

- Traduccion multilingue entre japones, ingles, coreano y chino, con soporte declarado de "multilingual".
- Generacion autoregresiva con KV cache incremental (24 capas, 4 cabezas de atencion de dimension 128), adecuada para decodificacion token a token en el navegador.
- Inferencia en el cliente mediante onnxruntime-web con WebGPU (y fallback a CPU), sin dependencia de servidores.
- Compatibilidad con el tokenizer y el formato de prompt del modelo base (`chat_template.jinja` en el repositorio original).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta especializado en traduccion.
- Capacidades de vision o audio: no disponibles.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Traduccion en el navegador sin conexion: la extension de Chrome "PLaMo Translate (On-device)" usa este modelo para traducir texto seleccionado o paginas completas localmente, evitando enviar contenido sensible a un servidor.
- Extensiones y aplicaciones web con privacidad reforzada: cualquier desarrollador puede cargar el fichero ONNX (1,62 GB) y ejecutarlo con onnxruntime-web sobre WebGPU para ofrecer traduccion ja/en/ko/zh sin backend propio.
- Traduccion de documentacion tecnica y articulos: el modelo esta especializado en traduccion y cubre las combinaciones mas habituales en el ecosistema open source asiatico (japones, coreano, chino e ingles).
- Prototipado rapido de funciones de traduccion en aplicaciones Electron o PWA: al ser un unico grafo ONNX con KV cache explicito, se integra en cualquier runtime compatible con ONNX Runtime 1.22 o superior.
- Evaluacion de despliegue on-device para equipos que quieran comparar latencia y consumo de memoria de un modelo de 2B cuantizado a 4 bits frente a alternativas en la nube.
- Educacion e investigacion: sirve como ejemplo reproducible de conversion de un transformer con sliding window y KV cache a ONNX con operadores fusionados y cuantizacion de bloques de 32.
- Traduccion de contenido generado por usuarios en foros o chats: al ejecutarse en el cliente, se elimina la latencia de red y el coste por token de una API externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo de 4 bits solo se ha comprobado con frases de muestra y que su calidad no se ha evaluado con benchmarks. La unica metrica reportada es la fidelidad de la conversion: diferencia maxima de logits de ~3e-5 en fp32 y salida greedy identica respecto al modelo PyTorch original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el fichero de pesos ocupa 1,62 GB en 4 bits y el KV cache se almacena en fp16 (`[1, 4, past, 128]` por capa y por direccion), por lo que el consumo crece con la longitud de secuencia.
- GPU recomendadas: no disponibles en la informacion proporcionada. El modelo esta pensado para WebGPU, por lo que depende de la implementacion de WebGPU del navegador y de la GPU del equipo cliente.
- Compatibilidad con GPU de consumo: no confirmada; al estar orientado a navegador, el requisito practico es un navegador con soporte WebGPU estable y memoria grafica suficiente para el grafo y el KV cache.
- Opciones de despliegue: onnxruntime-web (WebGPU o CPU) en navegador; onnxruntime (>= 1.22) en escritorio o servidor con los execution providers WebGPU o CPU.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| chiro0318/plamo-3-translate-2b-onnx-webgpu | 2B (4 bits) | no disponible | ja, en, ko, zh | PLaMo Community License | ONNX q4f16, WebGPU / CPU |
| pfnet/plamo-3-translate-2b (base) | 2B | no disponible | ja, en, ko, zh | PLaMo Community License | safetensors / BF16 |
| PLaMo 3 Translate 0.8B | 0,8B | no disponible | ja, en, ko, zh | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit |
| PLaMo 3 Translate 8B / 31B | 8B / 31B | no disponible | ja, en, ko, zh | PLaMo Community License | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit |

La comparativa se limita a la propia familia PLaMo 3 Translate, ya que no se dispone de datos de rendimiento de modelos alternativos en la informacion proporcionada. La diferencia clave de esta ficha frente al modelo base es el formato (ONNX 4 bits para navegador) y el hecho de ser una conversion no oficial.

## Limitaciones y advertencias

- Conversion no oficial: no esta realizada ni respaldada por Preferred Networks; el autor lo indica explicitamente.
- Calidad no evaluada: el modelo de 4 bits solo se ha comprobado con frases de muestra y no se ha evaluado con benchmarks, por lo que puede degradarse respecto al modelo original en casos dificiles.
- Licencia restrictiva: la PLaMo Community License permite uso personal y no comercial gratuito, pero el uso comercial requiere registro previo con Preferred Networks y esta limitado a usuarios con facturacion anual no superior a 1000 millones de yenes.
- Idiomas limitados: solo japones, ingles, coreano y chino; no se declara soporte de castellano ni de otras lenguas.
- Longitud de contexto no especificada: el modelo base usa sliding window, pero no se indica la ventana exacta ni la longitud maxima soportada en esta conversion.
- Riesgo de alucinacion: no documentado en la informacion disponible; como modelo de traduccion, el riesgo principal es la fidelidad de la traduccion mas que la invencion de hechos.
- Sesgos: no documentados en la informacion disponible.
- Dependencia del runtime: requiere onnxruntime(-web) 1.22 o superior con WebGPU o CPU; el rendimiento dependera del navegador y de la GPU del cliente.
- Consumo de memoria en el cliente: el fichero de 1,62 GB y el KV cache en fp16 pueden ser problematicos en dispositivos con poca memoria o sin WebGPU.
- Uso en produccion: al no haber benchmarks ni evaluacion de calidad, no se recomienda como unica solucion de traduccion en entornos criticos sin una validacion previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chiro0318/plamo-3-translate-2b-onnx-webgpu
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-2b
- Coleccion PLaMo 3 Translate: https://huggingface.co/collections/pfnet/plamo-3-translate
- Ficha de PLaMo 3 Translate 2B en OKNP.ai: https://oknp.ai/model/plamo-3-translate-2b
- ONNX Runtime Web: https://onnxruntime.ai/
