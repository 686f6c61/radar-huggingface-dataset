# AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-6bit-MTP

## Resumen

AX-Qwen3.6-35B-A3B-MLX-AXQ-6bit-MTP es una cuantizacion de precision mixta del modelo Qwen/Qwen3.6-35B-A3B, publicada por AutomatosX bajo el paraguas de su toolkit AXQuant. El artefacto esta empaquetado en formato MLX (safetensors) para ejecucion en Apple Silicon a traves de MLX-VLM, e incorpora pesos MTP (multi-token prediction) protegidos a mayor precision. El modelo base pertenece a la familia Qwen3.5-MoE, con 35.107.180.016 parametros totales y arquitectura de mezcla de expertos.

La relevancia de esta ficha es doble. Por un lado, documenta un caso real de cuantizacion afinada para hardware Apple, un nicho con pocas alternativas bien verificadas. Por otro, el propio autor la etiqueta explicitamente como "research development artifact" y "development evidence, not a quality certificate": no se emite certificado de calidad, los pesos MTP no estan verificados en ejecucion y el pack sera reconstruido con una revision nueva del toolkit.

Conviene subrayar que el almacenamiento no es un 6-bit uniforme ni MXFP6, sino un empaquetado affine de 6 bits base con proteccion de tensores sensibles a mayor precision. El BPW medido completo es de 7,490061, con un budget class de `7p5bpw` en el manifiesto. La unica evidencia de ejecucion publicada es un smoke test funcional de dos casos sobre Metal con MLX-VLM 0.7.9 y MLX 0.32.4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE (tag `qwen3_5_moe`), transformer con mezcla de expertos |
| Parametros totales | 35.107.180.016 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AXQuant 6-bit base affine con proteccion de mayor precision en tensores seleccionados (no es MXFP6 ni 6-bit uniforme); BPW medido completo 7,490061; budget class `7p5bpw` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (la licencia upstream rige el uso downstream; no se transfiere ninguna certificacion ni benchmark del modelo original) |
| Formato de pesos | safetensors (MLX), repo de 33,7 GB; almacenamiento completo de pesos 33.660.169.488 bytes |
| Modelo base | Qwen/Qwen3.6-35B-A3B, revision inmutable `995ad96eacd98c81ed38be0c5b274b04031597b0` |
| Runtime verificado | MLX-VLM 0.7.9 sobre MLX 0.32.4 (Metal) |
| MTP | Pesos MTP protegidos incluidos; ejecucion, aceptacion y velocidad no verificadas |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos de la familia Qwen3.5, con 35.107 millones de parametros totales. Esta publicacion no entrena el modelo: es una conversion cuantizada del checkpoint original fijado a una revision inmutable, realizada con el toolkit AXQuant. La innovacion tecnica del artefacto reside en el esquema de cuantizacion: un empaquetado affine de 6 bits como base, con floors de proteccion de precision aplicados a tensores sensibles, lo que eleva el BPW efectivo hasta 7,490061. La distribucion exacta de precision y los ajustes por modulo estan registrados en `axquant_manifest.json`, `axquant_plan.json` y `config.json`.

El pack incluye pesos MTP (multi-token prediction) protegidos, una tecnica de decodificacion especulativa que en teoria permite predecir varios tokens por paso. Sin embargo, el autor advierte explicitamente que el comportamiento MTP no esta verificado: ni la ejecucion, ni la tasa de aceptacion, ni la ganancia de velocidad han sido medidas. Tampoco hay datos publicados sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base paso por RLHF o DPO; esa informacion corresponde al modelo upstream y no se detalla en esta model card.

## Capacidades

- Generacion de texto y conversacion multi-turno: el pipeline declarado es `text-generation` y `conversational`.
- Razonamiento aritmetico basico verificado en el smoke test (19 + 23 = 42).
- Seguimiento de instrucciones estrictas de formato (salida exacta de la palabra READY).
- Pesos MTP incluidos para decodificacion especulativa, aunque sin verificar en ejecucion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision: el modelo base declara una via de vision (sidecar), pero la ruta de carga de texto por defecto la omite y la inferencia de imagen no esta soportada en esta revision sin un loader o export verificado por separado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Thinking mode, audio u otras modalidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado local en Apple Silicon: el pack esta disenado para MLX-VLM sobre Metal, lo que permite ejecutar un MoE de 35B en un Mac con memoria unificada sin depender de CUDA. Adecuado para experimentacion e investigacion, no para produccion sin validacion adicional.
- Investigacion en cuantizacion: util como evidencia de referencia para estudiar el efecto de floors de proteccion de precision sobre tensores sensibles frente a un 6-bit uniforme, con manifiesto y plan de cuantizacion auditables.
- Evaluacion de decodificacion especulativa: los pesos MTP incluidos permiten montar experimentos para medir tasa de aceptacion y ganancia de velocidad, aunque el autor no haya publicado esas metricas.
- Generacion de texto conversacional offline: para entornos con requisitos de privacidad donde no se quiere enviar datos a la nube, ejecutando el modelo en local sobre un Mac.
- Pruebas de integracion de runtimes: sirve como artefacto de test para validar cargadores MLX y comprobar la compatibilidad declarada (MLX-VLM soportado; MLX-LM, AX Engine, omlx y mtplx no probados o no soportados).
- Reproducibilidad de pipelines de cuantizacion: al fijar la revision inmutable del modelo base y publicar manifiestos, permite reproducir el proceso de conversion y comparar revisiones futuras del toolkit AXQuant.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evidencia de ejecucion es un smoke test funcional sobre Metal con MLX-VLM 0.7.9 y MLX 0.32.4:

| Caso | Prompt | Esperado | Salida | Resultado |
|---|---|---|---|---|
| Aritmetica | "What is 19 plus 23? Reply with only the number." | 42 | 42 | Pasa |
| Formato | "Reply with exactly the word READY." | READY | READY | Pasa |

El autor indica explicitamente que esta prueba es un smoke funcional y no un benchmark de calidad, evaluacion MTEB, evaluacion de codigo, test de contexto largo ni resultado de aceleracion MTP.

## Requisitos de hardware

- VRAM/memoria estimada: el repo ocupa 33,7 GB en disco (33.660.169.488 bytes de pesos). El tamano de fichero no establece el pico de memoria en tiempo de ejecucion; se requiere memoria unificada suficiente para cargar los pesos mas las activaciones y el KV cache.
- GPU recomendadas: el runtime verificado es MLX-VLM sobre Metal, es decir, Apple Silicon. No hay evidencia de ejecucion en A100, H100 ni RTX 4090 en la informacion disponible.
- Cabe en consumer GPU: no hay datos para GPUs consumer NVIDIA. En Apple Silicon, el requisito minimo practico es un equipo con memoria unificada superior al tamano de los pesos, aunque el pico real no esta documentado.
- Opciones de despliegue: MLX-VLM 0.7.9 es la unica ruta verificada. MLX-LM no fue probado por separado; AX Engine no fue probado; omlx y mtplx estan marcados como no soportados (solo estatico). No hay evidencia de vLLM, llama.cpp, Ollama ni TGI para este pack.
- Latencia y throughput: no disponibles. La ganancia por MTP no ha sido medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Runtime | Licencia | Estado |
|---|---|---|---|---|---|---|
| AX-Qwen3.6-35B-A3B-MLX-AXQ-6bit-MTP | 35,1B totales | no disponible | AXQuant 6-bit mixta, 7,49 BPW | MLX-VLM (verificado) | apache-2.0 | Artefacto de desarrollo, sin certificado de calidad |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1B totales | no disponible | pesos originales | multi-runtime | apache-2.0 | Modelo de referencia upstream |
| Otras cuantizaciones del mismo base | 35,1B totales | no disponible | no disponible | no disponible | apache-2.0 | no disponible |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El autor califica el pack como artefacto de investigacion y evidencia de desarrollo, no como certificado de calidad. No debe tratarse como listo para produccion sin validacion propia.
- El pack sera reconstruido con una version mejorada del toolkit AXQuant y reemplazado como nueva revision. Si se depende de los ficheros actuales, hay que fijar un commit concreto.
- El esquema no es 6-bit uniforme ni MXFP6: es affine 6-bit con proteccion de precision, con BPW efectivo de 7,49. Las comparaciones con otros packs "6-bit" pueden ser enganosas.
- Los pesos MTP estan incluidos pero su ejecucion, tasa de aceptacion y ganancia de velocidad no han sido verificadas.
- La inferencia de imagen no esta soportada en esta revision por la ruta de carga de texto por defecto; requiere un loader o export de vision verificado por separado.
- La unica evidencia de ejecucion son dos casos de smoke test; no hay benchmarks de calidad, codigo, matemáticas avanzadas, contexto largo ni multilingue.
- No hay informacion sobre sesgos, riesgo de alucinacion ni cobertura idiomatica en la informacion proporcionada.
- La licencia apache-2.0 se aplica al artefacto, pero el uso downstream se rige por la licencia y avisos del repositorio upstream; no se transfiere ninguna certificacion ni benchmark del modelo original.
- El tamano en disco no equivale al pico de memoria en ejecucion; planificar el despliegue con margen de memoria unificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Qwen3.6-35B-A3B-MLX-AXQ-6bit-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/tree/995ad96eacd98c81ed38be0c5b274b04031597b0
- Manifiesto de cuantizacion: `axquant_manifest.json` (en el repositorio)
- Plan de cuantizacion: `axquant_plan.json` (en el repositorio)
- Informe estatico de compatibilidad: `axquant_compatibility.json` (en el repositorio)
