# litert-community/Ternary-Bonsai-8B

## Resumen

Ternary-Bonsai-8B es un paquete de pesos en formato `.litertlm` publicado por la comunidad litert-community, derivado por cuantizacion del checkpoint prism-ml/Ternary-Bonsai-8B-unpacked, que a su vez parte de Qwen3-8B de Alibaba Cloud. El modelo conserva la arquitectura transformer densa del Qwen3-8B original, pero sus pesos se almacenan en formato ternario (INT2), lo que reduce el peso de un modelo de 8B a entre 2,16 y 2,56 GB segun la variante. Esto lo convierte en un candidato practico para inferencia en el GPU movil de un telefono Android, un escenario en el que un 8B en fp16 (unos 16 GB) seria inviable.

El objetivo del proyecto no es mejorar la calidad del modelo base, sino hacerlo transportable: son cuantizaciones y reempaquetados posteriores al entrenamiento, sin reentrenamiento, ajuste fino ni datos de calibracion. Los bundles estan pensados para el runtime LiteRT-LM de Google AI Edge y para la aplicacion AI Edge Gallery, y se ejecutan en el acelerador GPU movil (no en la NPU). El grafo de ejecucion es de coma flotante: INT2 actua como formato de almacenamiento y el computo se realiza en fp16 o fp32, con desquantizacion por canal o por bloque segun la variante.

El modelo soporta hasta 65.536 posiciones de embedding, aunque las compilaciones publicadas se quedan en 4.096 y 32.768 tokens. Mantiene la plantilla de chat de Qwen3 (ChatML con el bloque de razonamiento intacto) y trae valores de muestreo preconfigurados en sus metadatos. Su relevancia actual reside en que demuestra que un 8B ternario cabe en el presupuesto de memoria de un GPU de movil, a costa de una perdida de calidad que el autor no cuantifica en los benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B), con pesos ternarios INT2 |
| Parametros totales | ~8 mil millones (heredados de Qwen3-8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens como `max_position_embeddings`; builds publicados de 4.096 y 32.768 tokens |
| Tipos de cuantizacion | Ternaria INT2: per-channel (INT2pc) y INT2 all; activaciones en fp32 o fp16 segun build |
| Idiomas soportados | No disponible (la model card no documenta idiomas; el modelo base Qwen3 es multilingue, pero no se especifica en esta ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (bundles LiteRT-LM); no se publican safetensors ni GGUF en este repositorio |

Datos adicionales de los artefactos:

| Parametro | Valor |
|---|---|
| ID en HuggingFace | litert-community/Ternary-Bonsai-8B |
| Modelo base | prism-ml/Ternary-Bonsai-8B-unpacked |
| Relacion con el base | Cuantizado (`base_model_relation: quantized`) |
| Libreria / runtime | litert-lm (LiteRT-LM) |
| Tamano del repositorio | 7,3 GB (incluye las tres variantes) |
| Backend de ejecucion | GPU movil (acelerador GPU, no NPU) |
| Muestreo por defecto | TOP_P, top-k 20, top-p 0,85, temperatura 0,5 |
| Plantilla de chat | Qwen3 ChatML con bloque de razonamiento |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B: un transformer denso con atencion por consultas agrupadas (GQA), normalizacion RMSNorm y RoPE, con una ventana maxima de 65.536 posiciones en esta version. Sobre ese modelo no se ha reentrenado nada: el trabajo de litert-community consiste en cuantizar los pesos a ternario (INT2, es decir, tres niveles de peso) y reempaquetarlos en el contenedor `.litertlm` que consume el runtime LiteRT-LM. Segun la propia model card, no se utilizo ningun dato de entrenamiento, calibracion ni ajuste fino en el proceso.

El detalle tecnico mas relevante es como se maneja la cuantizacion ternaria en el GPU movil. El acelerador ejecuta un grafo en coma flotante, de modo que INT2 es un formato de almacenamiento y el computo se hace en fp16 o fp32. Por eso existen variantes: los builds per-channel desquantizan de forma coherente porque cada canal tiene su propia escala, mientras que la cuantizacion por bloques mezcla escalas dentro de una misma GEMM. La variante `sdpa-fp16-int2all` anade activaciones en fp16 y atencion SDPA fusionada, lo que la hace la mas compacta (2,16 GB) pero tambien la menos compatible con versiones antiguas del runtime. No hay decodificacion especulativa, atencion lineal ni ninguna innovacion de inferencia mas alla del propio esquema de cuantizacion.

Compilaciones publicadas:

| Fichero | Contexto | Pesos | Activaciones | Tamano | Notas |
|---|---|---|---|---|---|
| `bonsai-8b-int2pc-4k-gpu.litertlm` | 4.096 | INT2 per-channel | fp32 | 2,56 GB | Recomendada, sin optimizaciones |
| `bonsai-8b-sdpa-fp16-int2all-32k-fixed2.litertlm` | 32.768 | INT2 (todos) | fp16 | 2,16 GB | Experimental, SDPA fusionada, la mas pequena |
| `bonsai-8b-int2pc-32k-crashfix.litertlm` | 32.768 | INT2 per-channel | fp32 | 2,56 GB | Experimental, contexto largo sin SDPA fusionada |

## Capacidades

- Generacion de texto conversacional con plantilla ChatML de Qwen3, incluyendo el bloque de razonamiento del modelo original.
- Razonamiento multi-paso en formato de pensamiento (thinking), heredado de la plantilla de Qwen3, siempre que el host no la modifique.
- Capacidad multilingue presumiblemente heredada de Qwen3-8B, aunque no esta documentada ni verificada en esta ficha ni en la model card.
- Ejecucion local en dispositivo, sin conexion a red, sobre el acelerador GPU movil.
- Integracion con cualquier host LiteRT-LM: la aplicacion AI Edge Gallery o el binario `litert_lm_main`.
- Parametros de muestreo preconfigurados en `LlmMetadata`, de modo que el host los aplica sin configuracion adicional.
- Soporte de tool calling o function calling: no disponible / no documentado en la informacion proporcionada.
- Capacidades de vision, audio o multimodalidad: no disponibles; el pipeline declarado es exclusivamente `text-generation`.

## Casos de uso

- Asistente conversacional offline en Android: el bundle de 2,56 GB se carga en el GPU del telefono y permite mantener una conversacion multi-turno sin enviar datos a la nube, con un contexto de 4.096 tokens en la variante recomendada.
- Funciones de resumen y reescritura dentro de una aplicacion movil: textos de hasta unas pocas paginas entran en la ventana de 4k del build recomendado, y el modelo puede reescribirlos o resumirlos sin coste de API.
- Procesamiento de documentos largos por bloques: la variante de 32.768 tokens permite resumir informes o transcripciones que no caben en la ventana de 4k, a costa de usar un build experimental.
- Clasificacion y extraccion de informacion en formularios o correos: tareas de etiquetado y extraccion de campos que no requieren razonamiento profundo y que se benefician de la ejecucion local y la privacidad.
- Prototipado de agentes locales en Android: dado que la plantilla conserva el bloque de razonamiento de Qwen3, sirve para experimentar con cadenas de razonamiento en dispositivo, siempre que el host LiteRT-LM lo permita.
- Demostraciones y evaluacion de LiteRT-LM: es un artefacto util para medir el comportamiento real de un 8B ternario en GPU movil y decidir si la perdida de calidad respecto al modelo completo es asumible en un producto.
- Aplicaciones educativas o de accesibilidad sin conectividad: traduccion asistida, generacion de ejercicios o respuesta a preguntas sobre material local en entornos sin red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco ofrece datos de latencia o throughput. La busqueda web realizada no devolvio ninguna fuente tecnica relevante sobre el modelo (los resultados obtenidos correspondian a paginas de ayuda de YouTube, sin relacion con este artefacto).

## Requisitos de hardware

- VRAM / memoria necesaria: entre 2,16 GB y 2,56 GB solo para los pesos, segun el build. El autor situa el consumo practico en torno a 2,2-2,6 GB.
- Hardware objetivo: GPU de telefono movil (Android) a traves del acelerador GPU de LiteRT. El modelo esta disenado para este backend y no para la NPU.
- GPU de escritorio: no disponible. No se documenta soporte para A100, H100, RTX 4090 ni ninguna GPU de servidor, ni para CUDA.
- Caber en GPU consumer: no aplica en el sentido habitual; el destino es GPU integrada de movil, no una tarjeta de escritorio.
- Opciones de despliegue: runtime LiteRT-LM (host `litert_lm_main`), aplicacion Google AI Edge Gallery, backend GPU seleccionado.
- vLLM, llama.cpp, Ollama, TGI: no disponibles para este formato. El contenedor `.litertlm` no es compatible con esas herramientas.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Compatibilidad entre variantes: los builds experimentales pueden no cargarse segun la version de LiteRT / LiteRT-LM y las dependencias de la aplicacion; se recomienda partir del build recomendado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Peso en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-8B (INT2pc, 4k) | ~8B, ternario | 65.536 (build de 4.096) | 2,56 GB | Apache-2.0 | `.litertlm` para LiteRT-LM en GPU movil |
| Qwen3-8B (original, bf16/fp16) | 8B denso | 32.768 nativos en el modelo original | ~16 GB en bf16 | Apache-2.0 | safetensors, orientado a GPU de servidor |
| Alternativas on-device de rango 3B-8B (por ejemplo Gemma 3n, Llama 3.2, Phi-4-mini) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion directa solo es defendible frente a Qwen3-8B, del que este modelo deriva: comparte arquitectura, licencia y plantilla de chat, y la diferencia estriba exclusivamente en el formato (ternario frente a bf16) y el destino de ejecucion (GPU movil frente a GPU de servidor). No hay datos publicados que permitan comparar la calidad resultante.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada de la perdida de calidad provocada por la cuantizacion ternaria respecto a Qwen3-8B. Cualquier afirmacion sobre su rendimiento relativo seria especulativa.
- Degradacion por cuantizacion: INT2 con tres niveles de peso es una compresion agresiva; cabe esperar deterioro en tareas de razonamiento, matematicas y codigo, aunque no se cuantifica.
- Idiomas no documentados: la model card no especifica idiomas soportados y no se ha verificado el comportamiento multilingue de esta cuantizacion.
- Riesgo de alucinacion: inherente al modelo base y presumiblemente mayor tras la cuantizacion; no se ha medido.
- Variantes experimentales inestables: dos de los tres builds estan marcados como experimentales y su carga depende de la version de LiteRT/LiteRT-LM y de las dependencias de la aplicacion. El propio fichero de 32k sin SDPA incluye `crashfix` en el nombre, lo que indica un problema conocido de estabilidad.
- Contexto efectivo limitado: el build recomendado solo cubre 4.096 tokens, muy por debajo de los 65.536 que admite el modelo. No existe todavia build de 64k.
- Backend restringido: funciona en GPU movil, no en NPU, y no es compatible con los ecosistemas habituales de servidor (vLLM, llama.cpp, Ollama, TGI). Esto descarta su uso en pipelines de produccion en la nube tal cual.
- Ecosistema muy inmaduro: el repositorio tiene 0 descargas y 0 likes, fue creado y actualizado el mismo dia (10 de septiembre de 2026) y no cuenta con validacion de la comunidad.
- Sesgos: no evaluados. Al no haberse usado datos de entrenamiento ni calibracion propios, los sesgos presentes son los que ya codifican los pesos publicados de Qwen3-8B.
- Licencia: Apache-2.0, heredada del modelo base, permite uso comercial. Conviene verificar igualmente los terminos de Qwen3-8B en el enlace de licencia del repositorio de Alibaba Cloud.
- Caveat de empaquetado: al no haber reentrenamiento ni reempaquetado adicional de pesos, cualquier problema de calidad procede del esquema de cuantizacion o del checkpoint base, no de un ajuste posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/Ternary-Bonsai-8B
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-8B-unpacked
- Repositorio de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Aplicacion Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Modelo Qwen3-8B original: https://huggingface.co/Qwen/Qwen3-8B
- Licencia de Qwen3-8B (Apache-2.0): https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Paper, blog o demo adicionales del modelo: no disponibles (la busqueda web no devolvio fuentes relevantes)
