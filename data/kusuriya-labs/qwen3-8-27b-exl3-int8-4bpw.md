# kusuriya-labs/Qwen3.8-27B-EXL3-INT8-4bpw

## Resumen

Qwen3.8-27B-EXL3-INT8-4bpw es una cuantizacion del modelo multimodal Qwen/Qwen3.8-27B publicada por kusuriya-labs. Se trata de una variante del formato EXL3 (trellis de ExLlamaV3) en la que el codebook se ha modificado para que cada peso decodificado caiga sobre una rejilla INT8 fija, de modo que las instrucciones de producto escalar `iu8` y WMMA puedan consumir los pesos directamente. El resultado es un checkpoint de unos 16 GB con lineales del modelo de lenguaje a 4.0 bpw, cabeza LM y torre de vision a 6 bits y modulo MTP a 4 bits.

El modelo base es un transformer multimodal de tipo image-text-to-text con aproximadamente 8.250 millones de parametros almacenados en safetensors, aunque la nomenclatura del repositorio hace referencia a "27B"; esta discrepancia entre el nombre comercial y el recuento real de parametros no se aclara en la informacion disponible. La relevancia de esta publicacion es fundamentalmente de infraestructura: demuestra una ruta de cuantizacion orientada a acelerar la inferencia en GPUs AMD via ROCm, con un coste de calidad medido en divergencia KL frente a BF16.

Es importante senalar que este checkpoint no es cargable por Transformers, vLLM ni ExLlamaV3 upstream: requiere un runtime parcheado que aun no se ha publicado. Por tanto, su interes actual es experimental y de investigacion, no de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); familia Qwen3.5 segun tags |
| Parametros totales | 8.254.592.384 (segun safetensors); el nombre del repo indica "27B" |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3-INT8 4.0 bpw (lineales LM), 6 bit (LM head y vision), 4 bit (MTP); embeddings, norms y controles recurrentes sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con formato EXL3-INT8 (no compatible con Transformers ni vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal que procesa imagen y texto, con modulos diferenciados para vision y para el modelo de lenguaje, ademas de un componente MTP (multi-token prediction) segun la tabla de contenidos del checkpoint. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esa informacion corresponderia a la model card original, preservada en el repositorio como `SOURCE_MODEL_CARD.md`, pero no se incluye en la informacion disponible.

La innovacion tecnica de esta publicacion es la cuantizacion EXL3-INT8. Sobre el formato trellis de ExLlamaV3 se sustituye el codebook por uno que garantiza que todo peso decodificado pertenezca a una rejilla INT8 fija: el estado del trellis se multiplica por la constante de 24 bits `0xDCD12D` mediante `v_mul_u32_u24`, se suman los cuatro bytes del producto y se aplica `q = (B - 509) >> 2` para obtener el peso INT8, con valor real `q * 4 * 887 * 2^-17`. El multiplicador se almacena en el tensor `.mul1` de cada capa lineal con el valor `0x00DCD12D` en lugar del estandar `0x83DCD12D`, y `quantization_config.json` declara `"codebook": "exl3-int8"`. La calibracion se realizo con 250 secuencias de 2048 tokens, usando el mismo cuantizador, calibracion y asignacion de bits que el formato estandar. Al ser el codebook parte de la cuantizacion, el checkpoint no es convertible desde un EXL3 estandar.

## Capacidades

- Generacion de texto conversacional y continuacion de contexto, heredadas del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), con torre de vision cuantizada a 6 bits.
- Prediccion multi-token (MTP) a 4 bits, orientada a decodificacion especulativa o aceleracion de generacion.
- Razonamiento, codigo y matematicas: capacidades propias del modelo base, no verificadas en esta cuantizacion.
- Tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponible el listado de idiomas.
- Modo thinking explicito: no disponible.

## Casos de uso

- Investigacion en cuantizacion de bajo nivel: el checkpoint sirve como referencia reproducible para estudiar el impacto de un codebook INT8 fijo sobre la calidad, con metricas KLD y acuerdo top-1 ya publicadas.
- Desarrollo de runtimes ROCm: util para validar implementaciones de GEMM INT8 y kernels WMMA en GPUs AMD RDNA2 y RDNA4 antes de integrarlos en ExLlamaV3 parcheado o en `shelf`.
- Despliegue multimodal en hardware AMD de gama profesional: con unos 16 GB de pesos, encaja en GPUs como R9700 o V620 para prototipos de descripcion de imagenes y dialogo sobre imagen, una vez exista runtime publico.
- Evaluacion comparativa de recetas de cuantizacion: permite contrastar EXL3 estandar frente a EXL3-INT8 con las mismas 8 casos y 2632 posiciones del informe de KLD.
- Prefill de alto rendimiento en servidores AMD: el autor reporta 1112 ms para 2048 tokens (unos 1840 tok/s) con hipBLASLt int8 GEMM en R9700, adecuado para cargas con prompts largos.
- Decodificacion interactiva en V620: a unas 22 tok/s, viable para asistentes conversacionales con imagen en entornos de laboratorio.
- Base para experimentos de decodificacion especulativa: el modulo MTP a 4 bits permite probar tecnicas de prediccion multi-token sobre el checkpoint cuantizado.

## Benchmarks y rendimiento

Divergencia KL frente a BF16 (referencia llama.cpp), 8 casos y 2632 posiciones, medida con la build ROCm de ExLlamaV3:

| Configuracion | KLD media | Acuerdo top-1 |
|---|---|---|
| EXL3 4 bpw estandar (mismo cuantizador) | 0.01927 | 0.9457 |
| EXL3-INT8 4 bpw, activaciones FP16 | 0.01973 | 0.9472 |
| EXL3-INT8 4 bpw, activaciones INT8 (rejilla fija) | 0.02167 | 0.9403 |

Rendimiento medido por el autor:

| Metrica | Valor |
|---|---|
| Prefill en R9700 (gfx1201), 2048 tokens, hipBLASLt int8 GEMM | 1112 ms (~1840 tok/s) |
| Mejora de prefill frente a W16A16 estandar | 7-15% |
| Decodificacion en V620 (gfx1030) | ~22 tok/s |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 16 GB solo para pesos; con cache KV, activaciones y overhead del runtime conviene prever 20-24 GB para contextos moderados.
- GPUs soportadas de forma nativa por el runtime parcheado: AMD gfx1201 (RDNA4, p. ej. R9700) y gfx1030 (RDNA2, p. ej. V620).
- GPUs NVIDIA: no hay soporte documentado para este formato en la informacion disponible.
- Cabe en GPUs de consumo AMD de gama alta con 16 GB o mas, siempre que exista build compatible; no se garantiza en GPUs de 8-12 GB.
- Opciones de despliegue: exclusivamente ExLlamaV3 con parche ROCm o el runtime `shelf`, ninguno publicado aun. No es compatible con vLLM, TGI, llama.cpp, Ollama ni Transformers.
- Throughput: prefill de ~1840 tok/s en R9700 con 2048 tokens; decodificacion de ~22 tok/s en V620.
- Latencia: no se han publicado medidas de latencia por token en R9700.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| kusuriya-labs/Qwen3.8-27B-EXL3-INT8-4bpw | 8.254.592.384 (segun safetensors) | no disponible | EXL3-INT8 4 bpw | Apache-2.0 | ExLlamaV3 parcheado ROCm / shelf (sin publicar) |
| turboderp/Qwen3.8-27B-exl3 | no disponible | no disponible | EXL3 estandar 4 bpw | Apache-2.0 (heredada del base) | ExLlamaV3 upstream |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | BF16 safetensors | Apache-2.0 | Transformers, vLLM, TGI |

La diferencia clave frente al EXL3 estandar de turboderp es el codebook INT8, que habilita GEMM INT8 en hardware AMD a cambio de un runtime especifico y de una ligera perdida de calidad (KLD 0.02167 frente a 0.01927 con activaciones INT8).

## Limitaciones y advertencias

- No es cargable por ExLlamaV3 upstream: decodificaria los pesos con el multiplicador estandar y produciria salida incoherente.
- No hay runtime publico en el momento de la publicacion; tanto la build ROCm parcheada como `shelf` estan sin liberar.
- El multiplicador `0xDCD12D` debe coincidir exactamente con la build de la extension; una discrepancia invalida los pesos.
- No es convertible desde un checkpoint EXL3 estandar, lo que limita la reutilizacion de herramientas existentes.
- Perdida de calidad medible: KLD de 0.02167 y acuerdo top-1 de 0.9403 con activaciones INT8, frente a 0.01927 y 0.9457 del EXL3 estandar.
- Discrepancia entre el nombre "27B" y los 8.254.592.384 parametros reportados por safetensors; conviene verificar antes de dimensionar infraestructura.
- Sin datos de idiomas, contexto, sesgos ni alucinacion especificos de esta cuantizacion; las advertencias del modelo base deben consultarse en `SOURCE_MODEL_CARD.md`.
- El repositorio tiene 0 descargas y 0 likes, sin validacion independiente de la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero la ausencia de runtime publico impide ejercerlo en la practica hoy.
- La calibracion se limito a 250 secuencias de 2048 tokens, lo que puede no representar dominios muy alejados de la distribucion de calibracion.

## Enlaces

- Hugging Face: https://huggingface.co/kusuriya-labs/Qwen3.8-27B-EXL3-INT8-4bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizacion EXL3 estandar de referencia: https://huggingface.co/turboderp/Qwen3.8-27B-exl3
- Repositorio de recetas EXL3 para Qwen3.8-27B: https://github.com/malaiwah/qwen38-27b-exl3
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
