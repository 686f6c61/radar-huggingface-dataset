# killy369/GLM-5.3-UD-Q3_K_XL-a5-GGUF

## Resumen

GLM-5.3-UD-Q3_K_XL-a5-GGUF es una cuantizacion GGUF del modelo GLM-5.3 de Z.ai, un transformer de tipo mixture-of-experts (MoE) con 753.864.139.008 parametros totales segun los safetensors del modelo base. La publica el usuario killy369 (NetSphere) como artefacto del proyecto glm53-offload, cuyo objetivo es servir el modelo en una o dos GPU RTX PRO 6000 Blackwell de 96 GB, manteniendo los expertos enrutados en RAM del host y ofreciendo ventanas de contexto de 256K hasta 1M de tokens.

El punto diferencial frente a la cuantizacion original de Unsloth (UD-Q3_K_XL) es una requantizacion selectiva: los pesos de atencion, expertos compartidos y FFN densa, que se leen en cada token (701 tensores, 16,2 GiB en Q8_0), pasan a Q5_K usando la importance matrix de Unsloth, con 77 tensores de 192 columnas en Q5_1 y 21 tensores F32 del indexador de atencion dispersa en Q8_0. Los 228 expertos enrutados (300 GiB), el embedding de tokens y la cabeza de salida se mantienen identicos byte a byte. El resultado reduce el fichero de 343,0 GB a 336,7 GB y, segun el autor, aporta entre un 11 % y un 14 % mas de velocidad de decodificacion a cambio de un 0,17 % de perplejidad, dentro del margen de error.

Es relevante porque demuestra una ruta practica para ejecutar un modelo de clase 750B con contexto de 1M en hardware de estacion de trabajo de gama alta (dos GPU de 96 GB mas 384 GB de RAM), algo que hasta ahora requeria nodos multi-GPU mucho mas costosos. El modelo siempre razona: la plantilla de chat abre cada respuesta con `<think>` y `enable_thinking` no tiene efecto; el parametro `reasoning_effort` (low, high, max por defecto) controla la profundidad del razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion dispersa (tag `glm_moe_dsa`) |
| Parametros totales | 753.864.139.008 |
| Parametros activos | no disponible |
| Longitud de contexto | 256K a 1M tokens (presets del motor glm53-offload) |
| Tipos de cuantizacion | Q3_K_XL (expertos enrutados), Q5_K y Q5_1 (atencion, expertos compartidos, FFN densa), Q8_0 (indexador de atencion dispersa), F32 residuales |
| Idiomas soportados | en, zh |
| Licencia | GLM-5.3 License (etiquetada como "other"; scripts y parche del repo en MIT) |
| Formato de pesos | GGUF, 9 shards, 336,7 GB (336.703.754.272 bytes) |
| Tamano del repo | 336,7 GB |
| Modelo base | zai-org/GLM-5.3 |
| Cuantizacion de referencia | unsloth/GLM-5.3-GGUF, revision 346b3591c7f28d1a23716f97a065ecf12ec14771 |
| Motor de inferencia | llama.cpp con un parche (proyecto glm53-offload) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un transformer de mezcla de expertos con atencion dispersa (el tag del repo es `glm_moe_dsa`), desarrollado por Z.ai. La cuantizacion conserva la topologia completa: 228 tensores de expertos enrutados (300 GiB en Q3_K_XL), un conjunto de 701 tensores de atencion, expertos compartidos y FFN densa que se leen en cada token, y un indexador de atencion dispersa con 21 tensores F32 pequenos. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

La innovacion tecnica de este artefacto no esta en el entrenamiento sino en la estrategia de cuantizacion y despliegue. Por un lado, la requantizacion asimetrica: los tensores que se leen en cada token se comprimen a Q5_K/Q5_1 con la importance matrix de Unsloth, mientras que los expertos enrutados, que se activan de forma dispersa, permanecen en Q3_K_XL sin tocar. Por otro, el motor glm53-offload mantiene los expertos en RAM del host y los transfiere a las GPU bajo demanda, lo que permite servir el modelo con una o dos tarjetas de 96 GB a contextos de 256K a 1M. El autor documenta la reproducibilidad del proceso: `scripts/get-model.sh --build` descarga los shards de Unsloth y la importance matrix en la revision fijada, los verifica, requantiza en 2-3 minutos en una maquina de 64 nucleos sin GPU y comprueba los hashes resultantes, que coinciden con los nueve publicados.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con soporte de razonamiento explicito siempre activo mediante bloques `<think>`.
- Control de profundidad de razonamiento con `reasoning_effort` en tres niveles: `low`, `high` y `max` (por defecto).
- Razonamiento multi-paso y cadenas de pensamiento largas, adecuado para tareas de analisis complejo.
- Capacidad de contexto extendido: presets de 256K a 1M tokens en el motor glm53-offload.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face), lo que facilita su integracion en servidores tipo OpenAI.
- No se documenta soporte de vision, audio, tool calling ni function calling en la informacion proporcionada.
- Multilingue limitado a ingles y chino segun la model card.

## Casos de uso

- Analisis de repositorios completos: con ventanas de hasta 1M tokens, el modelo puede ingerir arboles de codigo extensos y responder preguntas de arquitectura o dependencias sin trocear el contexto.
- Revision documental juridica o tecnica: procesar contratos o especificaciones de cientos de miles de tokens en una sola pasada, aprovechando el razonamiento multi-paso para detectar contradicciones entre secciones.
- Investigacion asistida por IA: sintesis de literatura cientifica extensa donde el modelo mantiene el hilo a lo largo de decenas de articulos y genera resumenes razonados con trazabilidad.
- Generacion de codigo en pipelines internos: el modelo puede integrarse como servicio de generacion en un endpoint compatible, con `reasoning_effort=low` para minimizar latencia en tareas rutinarias.
- Atencion al cliente especializada en mercados angloparlantes y chinos: conversaciones multi-turno con contexto largo para historiales de cliente, con la salvedad de que solo cubre en y zh.
- Prototipado de agentes de razonamiento: el modo de pensamiento siempre activo y los niveles de esfuerzo permiten experimentar con planificacion de tareas largas en entornos controlados.
- Evaluacion de modelos de clase 750B en laboratorio: servir el modelo en dos RTX PRO 6000 Blackwell permite hacer benchmarks y estudios de comportamiento sin acceso a un cluster.

## Benchmarks y rendimiento

Rendimiento de decodificacion medido por el autor en su motor (llama.cpp con parche) sobre la maquina de pruebas, con contexto de 256K y ajustes por defecto:

| Configuracion | Decodificacion |
|---|---|
| Una RTX PRO 6000 Blackwell (96 GB) | 38,9 tok/s |
| Dos RTX PRO 6000 Blackwell (96 GB) | 61,6 tok/s |

El autor indica que la requantizacion de los tensores calientes aporta entre un 11 % y un 14 % de mejora en decodificacion a cambio de un 0,17 % de perplejidad adicional, dentro del margen de error. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM: se necesitan 1 o 2 GPU RTX PRO 6000 Blackwell de 96 GB cada una; los expertos enrutados residen en RAM del host, no en VRAM.
- RAM del host: 384 GB o mas.
- Disco: 337 GB para los shards del modelo; unos 681 GB adicionales si se reconstruye la cuantizacion desde cero.
- GPU consumer: no cabe en ninguna GPU de consumo (RTX 4090, 5090, etc.) por el requisito de 96 GB de VRAM por tarjeta y la dependencia del motor glm53-offload.
- Despliegue: exclusivamente mediante el proyecto glm53-offload (llama.cpp con un parche propio), empaquetado en Docker (`docker/Dockerfile`) con scripts `get-model.sh` y `run.sh`. No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp estandar.
- Throughput: 38,9 tok/s con una GPU y 61,6 tok/s con dos GPU en decodificacion a 256K de contexto, segun las mediciones del autor.
- Latencia de arranque y de prefill: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| GLM-5.3-UD-Q3_K_XL-a5 (este) | 753,9B | 256K-1M | GGUF 9 shards | GLM-5.3 License | glm53-offload, 1-2 GPU 96 GB + 384 GB RAM |
| unsloth/GLM-5.3-GGUF (UD-Q3_K_XL) | 753,9B | segun motor | GGUF 343,0 GB | GLM-5.3 License | llama.cpp, requiere mas VRAM o mas offload |
| zai-org/GLM-5.3 (original) | 753,9B | no disponible | safetensors | GLM-5.3 License | multi-GPU de alta gama |

La comparativa se limita a las variantes del mismo modelo base porque no se dispone de datos de benchmarks que permitan contrastarlo con alternativas de otros fabricantes. Frente al GGUF de Unsloth, este artefacto ocupa 6,3 GB menos y, segun el autor, decodifica entre un 11 % y un 14 % mas rapido con un impacto en perplejidad despreciable; frente al modelo original en safetensors, reduce drasticamente los requisitos de VRAM al delegar los expertos a RAM del host.

## Limitaciones y advertencias

- Solo soporta ingles y chino; no se documenta castellano ni otros idiomas, lo que limita su uso en produccion en mercados hispanohablantes.
- El razonamiento esta siempre activo y no se puede desactivar: `enable_thinking` no tiene efecto. Esto incrementa el consumo de tokens y la latencia en todas las respuestas.
- La cuantizacion a Q3_K_XL en los expertos enrutados y Q5_K/Q5_1 en los tensores calientes introduce perdida de calidad respecto al modelo original; el autor reporta un 0,17 % de perplejidad adicional solo por la requantizacion, pero no se han publicado evaluaciones de calidad completas.
- No es una release oficial ni de Z.ai ni de Unsloth: el header GGUF conserva metadatos de Unsloth porque `llama-quantize` los copia del fichero de entrada, y la importance matrix queda registrada con la ruta de la maquina de compilacion. Las preguntas deben dirigirse al repositorio glm53-offload.
- Requiere hardware muy especifico (RTX PRO 6000 Blackwell) y un motor parcheado; no funciona con llama.cpp estandar ni con otras herramientas de inferencia habituales.
- La licencia GLM-5.3 License debe revisarse antes de cualquier uso comercial; los scripts y el parche del repositorio son MIT, pero los pesos no.
- Riesgo de alucinacion inherente a los modelos generativos de gran escala; no se documentan mitigaciones especificas.
- Sesgos conocidos: no disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de los resultados reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/killy369/GLM-5.3-UD-Q3_K_XL-a5-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantizacion de referencia de Unsloth: https://huggingface.co/unsloth/GLM-5.3-GGUF
- Repositorio del motor glm53-offload: https://github.com/killy-netsphere/glm53-offload
- Resultados de rendimiento: https://github.com/killy-netsphere/glm53-offload/blob/master/RESULTS.md
- Incidencias del proyecto: https://github.com/killy-netsphere/glm53-offload/issues
