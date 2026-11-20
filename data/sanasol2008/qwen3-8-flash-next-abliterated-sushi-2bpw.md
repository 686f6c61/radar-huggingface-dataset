# sanasol2008/Qwen3.8-Flash-Next-Abliterated-Sushi-2bpw

## Resumen

Qwen3.8-Flash-Next-Abliterated-Sushi-2bpw es una cuantizacion experimental en formato Sushi de los pesos BF16 del checkpoint comunitario orcarouter/Qwen3.8-Flash-Next-Uncensored, un derivado "abliterated" (sin mecanismos de rechazo) de la familia Qwen. El autor, sanasol2008, publica el paquete con el objetivo de hacer viable la inferencia local de un modelo MoE de aproximadamente 21.140 millones de parametros totales en equipos Apple Silicon con memoria unificada limitada, mediante streaming de expertos desde SSD y cuantizacion agresiva de los expertos enrutados a 2 bits por peso efectivo.

La relevancia del paquete reside en su enfoque de despliegue: no es un checkpoint para Transformers ni para ExLlamaV3 generico, sino un pack especifico para el runtime Sushi (version 1.2.0 o superior), que combina cuantizacion EXL3 K2 con codebook MCG y ventana 15 para los expertos, capas densas en affine8 y un sidecar de n-gramas en affine4. Ademas conserva la torre de vision y los pesos MTP, lo que permite entrada image-text-to-text y decodificacion especulativa, aunque esta ultima no esta validada en este pack concreto.

El modelo hereda las capacidades del checkpoint base (razonamiento, codigo, tool calling, vision, contexto configurable hasta 262.144 tokens) y anade la particularidad de la abliteration, que elimina total o parcialmente las respuestas de rechazo. Es, por tanto, una opcion orientada a experimentacion e investigacion en entornos locales con hardware Apple, no a despliegues de produccion convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) con torre de vision y cabezas MTP; formato de cuantizacion Sushi (EXL3 K2 + MCG codebook, window15) |
| Parametros totales | 21.142.110.099 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens configurados (techo de configuracion, no garantia de memoria ni calidad a plena longitud) |
| Tipos de cuantizacion | Expertos enrutados EXL3 K2 (2 bpw efectivos), capas densas affine8, sidecar de n-gramas affine4 (group32); KV cache cuantizable a 8 bits |
| Idiomas soportados | no disponible (la model card no enumera idiomas; se verifico funcionamiento con texto en ruso y japones en pruebas comunitarias) |
| Licencia | qwen-community-license-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors + `ngram_table.bin` (sidecar), empaquetado para el runtime Sushi; no compatible con Transformers ni ExLlamaV3 generico |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de la familia Qwen, del que se conservan la torre de vision y los pesos MTP (multi-token prediction). La conversion a Sushi no introduce entrenamiento adicional: parte de los pesos BF16 del checkpoint orcarouter/Qwen3.8-Flash-Next-Uncensored en la revision e096800036ec20da7e2442dcd4044a004d4e99fa y aplica unicamente cuantizacion post-entrenamiento. La abliteration proviene integramente del checkpoint upstream; este paquete no anade ni modifica ese proceso.

La innovacion tecnica esta en el esquema de cuantizacion: los expertos enrutados (incluidos los de MTP) usan EXL3 K2 con codebook MCG y ventana 15, las capas densas emplean affine8 donde el pack Sushi de referencia lo hace, y el resto de tensores flotantes mantienen su dtype original. El sidecar de n-gramas se almacena en affine4 con grupo 32. La calibracion se realizo con 64 filas de 1024 tokens, usando un conversor basado en ExLlamaV3 (commit 151539c) con una adaptacion aislada del codificador MCG-window15 y despacho paralelo de expertos cuantizados junto a lineales BF16. El autor advierte explicitamente que "2bpw" se refiere a la tasa de codigo de los expertos enrutados, no al promedio de todos los tensores ni al tamano total de archivos, y que no se reclama equivalencia de calidad con BF16.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto largo configurable hasta 262.144 tokens.
- Razonamiento y matematicas, con modo "thinking" habilitable (verificado en pruebas de aritmetica).
- Tool calling / function calling: se valido una llamada correcta a `get_weather` con `city=Belgrade`.
- Entrada image-text-to-text: la torre de vision se conserva y funciona con streaming de expertos en Sushi >= 1.2.0 mediante `--vision`; se verifico OCR de imagen transcribiendo tres campos con todos sus numeros.
- Capacidades multilingues: verificado funcionamiento con texto en ruso y japones en pruebas comunitarias, aunque no hay lista oficial de idiomas.
- Soporte de agentes y razonamiento multi-paso: las mediciones de "Real Hermes chat" muestran peticiones encadenadas con resultados de herramientas y conversacion creciente.
- MTP (multi-token prediction) incluido en los pesos, aunque su inferencia no esta validada en este pack.
- Ausencia de mecanismos de rechazo (abliterated), lo que elimina las negativas del modelo a responder ciertas peticiones.

## Casos de uso

- Asistente conversacional local en Apple Silicon: con streaming de expertos desde SSD (22-23 GiB de presupuesto) el modelo cabe en un M3 Max de 48 GiB o incluso en un M1 Max de 32 GiB, permitiendo un asistente privado sin conexion a servicios en la nube.
- Procesamiento de documentos con OCR: la torre de vision permite extraer texto y campos estructurados de imagenes; en la prueba del autor se transcribieron correctamente tres campos con sus numeros a partir de 915 tokens de prompt.
- Agentes con tool calling: las mediciones reales muestran seis peticiones consecutivas con `tool_calls` como motivo de fin, lo que lo hace apto para flujos de agente que consultan APIs o bases de datos.
- Analisis de conversaciones largas: con 40.000-47.000 tokens de entrada y cache de prefijo, el modelo mantiene coherencia en conversaciones extensas con decodificacion de 10,6-13,2 tok/s, adecuado para tareas de resumen o extraccion sobre historiales largos.
- Investigacion sobre alineacion y rechazo: al ser un modelo abliterated, sirve para estudiar el comportamiento sin mecanismos de negativa, comparar tasas de rechazo frente al modelo original y analizar sesgos.
- Prototipado de aplicaciones multimodales en local: combinando `--vision` y contexto de 256k en un Mac de 48 GiB se pueden construir demos de VQA o descripcion de imagenes sin GPU dedicada.
- Evaluacion de tecnicas de cuantizacion extrema: el pack es un caso de estudio de cuantizacion a 2 bpw en expertos con streaming, util para medir el impacto en calidad y velocidad frente al pack Sushi original (26,48 vs 31,60 tok/s en decodificacion en caliente).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye unicamente mediciones de velocidad y pruebas funcionales:

| Medicion | Contexto | Resultado |
|---|---|---|
| Decodificacion en frio (prompt corto) | Sushi 1.1.1, 22 GiB streaming, KV8, 16k ctx | 16,78 tok/s |
| Decodificacion en caliente (media de ejecuciones 2-3) | Mismas condiciones | 26,48 tok/s |
| Pack Sushi 2bpw original, decodificacion en frio | Mismas condiciones | 22,89 tok/s |
| Pack Sushi 2bpw original, decodificacion en caliente | Mismas condiciones | 31,60 tok/s |
| Prefill con cache de prefijo (agente real) | 39.652-47.393 tokens de entrada | 78,7-218,9 tok/s |
| Decodificacion en agente real | Conversacion creciente con tool results | 10,6-13,2 tok/s |
| OCR de imagen | 915 tokens de prompt | 9,91 s total de peticion |

El autor advierte que las mediciones de prompt corto no representan el throughput en contexto largo y que las tasas de prefill incluyen reutilizacion de prefijo, por lo que no son tasas de procesamiento sin cache.

## Requisitos de hardware

- VRAM/memoria unificada: el paquete completo ocupa aproximadamente 64,87 GiB en disco, incluido el sidecar de n-gramas de 29,8 GiB. En ejecucion con streaming de expertos se han probado presupuestos de 22 GiB (M3 Max 48 GiB) y 23 GiB (M1 Max 32 GiB).
- GPU recomendadas: Apple Silicon exclusivamente en la configuracion validada (M3 Max 48 GiB y M1 Max 32 GiB). No hay soporte documentado para A100, H100 ni RTX 4090, ya que el runtime Sushi y el formato estan orientados a Metal/MLX.
- Cabe en consumer GPU: si, en equipos Apple con memoria unificada de 32 GiB o superior, ajustando `--ssd-budget-gb` y `--ctx-size`. No hay datos para GPUs NVIDIA consumer.
- Opciones de despliegue: runtime Sushi version 1.2.0 o superior (imprescindible; no requiere build parcheado). No es compatible con vLLM, llama.cpp, Ollama ni TGI. Descarga mediante `hf download`.
- Latencia y throughput: 26,48 tok/s en decodificacion en caliente con prompt corto; 10,6-13,2 tok/s en conversaciones de agente de 40-47k tokens; prefill de 78,7-218,9 tok/s con cache de prefijo. En el M1 Max de 32 GiB se reportan aproximadamente 19-21 tok/s en caliente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Abliterated-Sushi-2bpw (este) | 21,14 B totales (MoE) | hasta 262.144 config. | Sushi (EXL3 K2 + MCG) | qwen-community-license-1.0 | Hugging Face, 1.041 descargas |
| orcarouter/Qwen3.8-Flash-Next-Uncensored (base) | no disponible en la informacion | no disponible | BF16, Transformers | no disponible | Hugging Face |
| Pack Sushi 2bpw original (referencia del autor) | no disponible | no disponible | Sushi | no disponible | usado como referencia de velocidad |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- No es un checkpoint general: solo funciona con el runtime Sushi >= 1.2.0. No se puede cargar en Transformers, ExLlamaV3 generico, vLLM, llama.cpp ni Ollama.
- El autor no reclama equivalencia de calidad con BF16; la cuantizacion a 2 bpw en los expertos puede degradar la calidad de forma no medida.
- La abliteration elimina los mecanismos de rechazo, lo que implica un riesgo elevado de generar contenido danino, sesgado o inapropiado sin filtro. No es apto para aplicaciones de cara al publico sin moderacion externa.
- Riesgo de alucinacion inherente al modelo base, agravado potencialmente por la cuantizacion agresiva y la ausencia de rechazo.
- El contexto de 262.144 tokens es un techo de configuracion, no una garantia de memoria ni de calidad; el consumo crece con el contexto y las imagenes.
- MTP y la inferencia de video no estan validadas en este pack.
- La licencia qwen-community-license-1.0 impone condiciones especificas para uso comercial; es necesario revisar el archivo LICENSE antes de cualquier despliegue productivo.
- El paquete requiere mantener juntos todos los shards, archivos de tokenizer y `ngram_table.bin`; la descarga completa es de 64,87 GiB.
- Las mediciones de rendimiento proceden de un unico equipo (M3 Max) y de un runtime anterior (Sushi 1.1.1 con parche de vision ya obsoleto); no se han re-benchmarkeado las versiones actuales.
- No hay lista oficial de idiomas soportados ni evaluacion de sesgos publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanasol2008/Qwen3.8-Flash-Next-Abliterated-Sushi-2bpw
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Discusion con reporte comunitario en M1 Max: https://huggingface.co/sanasol2008/Qwen3.8-Flash-Next-Abliterated-Sushi-2bpw/discussions/1
- Repositorio ExLlamaV3 (base del conversor, commit 151539c): https://github.com/turboderp-org/exllamav3
