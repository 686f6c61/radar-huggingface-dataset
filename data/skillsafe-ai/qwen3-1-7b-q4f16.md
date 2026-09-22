# skillsafe-ai/qwen3-1.7b-q4f16

## Resumen

skillsafe-ai/qwen3-1.7b-q4f16 es un paquete de pesos cuantizados en formato MLC preparado para ejecutarse integramente en el navegador mediante WebLLM y WebGPU. No se trata de un modelo entrenado desde cero, sino de una recompilacion reproducible del checkpoint Qwen/Qwen3-1.7B, realizada por SkillSafe a partir del artefacto upstream mlc-ai/Qwen3-1.7B-q4f16_1-MLC fijado en el commit 80b3abcec6c3b3f5355dc0cc99cc4fb578f192bc. El repositorio ocupa 1,0 GB e incluye la libreria wasm del runtime, el tokenizador y 30 shards de parametros.

El interes de esta publicacion es de infraestructura mas que de investigacion: empaqueta un modelo denso de la familia Qwen3 en una cuantizacion q4f16_1 (4,50 bits por parametro) con una ventana de contexto de 4096 tokens, de modo que la inferencia ocurre en el dispositivo del usuario sin llamadas a API ni envio de datos a un servidor. Para aplicaciones web con requisitos de privacidad, coste cero de inferencia o funcionamiento sin conectividad, este tipo de artefactos es la via practica de desplegar un LLM de ~2.000 millones de parametros en el cliente.

La model card documenta la procedencia de forma exhaustiva (SHA-256 por fichero, receta, toolchain y verificacion de que los tensores coinciden con el checkpoint), pero no incluye informacion sobre idiomas soportados, benchmarks ni capacidades adicionales del modelo base. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia declarada es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3 (detalles de capas, atencion y dimensiones: no disponibles en la informacion proporcionada) |
| Parametros totales | 2.031.739.904, segun la verificacion incluida en la model card (incluye embeddings; el nombre comercial del modelo base es 1,7B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4096 tokens en este artefacto, segun el identificador `ctx4k_cs1k` del binario wasm; el modelo base podria soportar ventanas mayores, no confirmado en la informacion disponible |
| Tipos de cuantizacion | q4f16_1 exclusivamente: pesos de 4 bits con escalas y puntos cero en fp16, 4,50 bits por parametro |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLC (`params_shard_N.bin` + `ndarray-cache.json` + `tensor-cache.json`); no incluye safetensors ni GGUF |
| Tamano del repositorio | 1,0 GB |
| Tamano de los shards de parametros | Aproximadamente 923 MB en 30 ficheros (shard 0: 148,38 MB; shard 1: 25,30 MB; shard 29: 20,26 MB; resto: 27,01 MB cada uno) |
| Runtime | WebGPU mediante libreria wasm `lib/Qwen3-1.7B-q4f16_1-ctx4k_cs1k-webgpu.wasm` (5,52 MB, clase registry-shared) |
| Tarea declarada | text-generation (tag conversational) |
| Toolchain de conversion | Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0, Darwin 25.6.0 arm64 |
| Fecha de conversion | 2026-09-22T19:03:47+00:00 |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento alguno: es una conversion de pesos. El modelo subyacente es Qwen/Qwen3-1.7B, un transformer denso de la familia Qwen3; la informacion proporcionada no detalla el numero de capas, la configuracion de atencion (GQA/MHA), las dimensiones ocultas ni la composicion del dataset de preentrenamiento, por lo que esos datos deben consultarse en la model card del modelo base. Lo que si documenta la tarjeta es la cadena de custodia: los pesos proceden del artefacto MLC oficial `mlc-ai/Qwen3-1.7B-q4f16_1-MLC` en un commit concreto, procesados por la receta `recipes/qwen3-1.7b-q4f16.yaml` (sha256 f5e2c15375c15f9b49b4644378f7e7846e605d6e60303f1f094415f018da226d).

La innovacion tecnica relevante es el propio formato de despliegue. La cuantizacion q4f16_1 comprime los pesos a 4 bits con escalas en fp16, lo que arroja 4,50 bits por parametro y permite alojar los 2.031.739.904 parametros en aproximadamente 923 MB de shards. El binario wasm lleva compilado el grafo de ejecucion para WebGPU con un contexto de 4096 tokens y un tamano de chunk de prefill de 1024 (convencion de nombres de MLC para `ctx4k_cs1k`). La verificacion incluida comprueba que los tamanos y md5 de los shards coinciden con `ndarray-cache.json`, que el recuento implicito de parametros cuadra con el checkpoint y que la tabla de parametros embebida en la libreria WebGPU coincide con los 339 tensores de estos pesos. La model card esta truncada en la seccion de uso, por lo que no se documenta el ejemplo completo de integracion.

## Capacidades

- Generacion de texto y conversacion multi-turno: es la tarea declarada del pipeline (`text-generation`) y la unica capacidad explicitamente etiquetada en el repositorio junto con `conversational`.
- Ejecucion local en el navegador: inferencia sobre WebGPU sin backend, sin API y sin transferencia de datos a servidores externos.
- Funcionamiento offline: los ficheros de tipo `bundle` y `registry` pueden servirse desde el propio dominio o cachearse en el cliente, de forma que el modelo opera sin conectividad una vez descargado.
- Contexto de 4096 tokens: suficiente para conversaciones de varios turnos, resumen de documentos cortos y tareas de extraccion sobre entradas moderadas.
- Capacidades heredadas del modelo base (razonamiento, codigo, matematicas, multilingue, tool calling, modo de pensamiento): no documentadas ni verificadas en este artefacto; deben contrastarse en la model card de Qwen/Qwen3-1.7B.
- Sin soporte documentado de vision, audio ni modalidades adicionales.

## Casos de uso

- Asistente de texto con privacidad estricta: al ejecutarse en el navegador mediante WebLLM, ni el prompt ni la respuesta abandonan el dispositivo, lo que permite desplegar funcionalidades de generacion de texto en sectores con requisitos de cumplimiento (sanidad, legal, banca) sin evaluar transferencias a terceros.
- Aplicaciones web progresivas sin coste de inferencia: el modelo se cachea en el cliente y cada usuario aporta su propio hardware, de modo que el coste marginal de servir texto generado es cero independientemente del volumen de peticiones.
- Escenarios sin conectividad o con ancho de banda restringido: herramientas de campo, entornos aislados o dispositivos con red intermitente pueden precargar los 1,0 GB y operar offline con 4096 tokens de contexto.
- Reescritura y asistencia de redaccion en el cliente: extensiones de navegador o editores web que reformulan, resumen o completan texto dentro de la ventana de 4k tokens, con latencia dependiente del WebGPU del equipo del usuario.
- Triaje y preprocesado antes de llamar a un modelo mayor: clasificacion de intenciones, extraccion de campos o resumen de entradas para decidir si merece la pena escalar a un modelo de mayor tamano en servidor, reduciendo el volumen de tokens enviados a la API.
- Demos y prototipado de investigacion en WebLLM: validacion de pipelines de agentes o de interfaz sin aprovisionar GPU en servidor, con pesos verificables por SHA-256 y conversion reproducible a partir de una receta publica.
- Herramientas educativas en aulas o laboratorios: tutores de texto desplegados en navegadores de equipos compartidos, sin instalacion de dependencias ni cuentas de API.
- Normalizacion y etiquetado asistido en el cliente: limpieza de formularios, generacion de plantillas y reescritura de campos en aplicaciones internas, con la salvedad de que no hay soporte documentado de function calling para orquestar herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio solo documenta verificaciones de integridad (coincidencia de tamanos, md5, recuento de parametros y correspondencia de tensores), no metricas de calidad (MMLU, HumanEval, GSM8K u otras). Tampoco se proporcionan datos de latencia o throughput. Cualquier cifra de calidad deberia tomarse de la documentacion del modelo base Qwen/Qwen3-1.7B, teniendo en cuenta que la cuantizacion a 4 bits puede degradar el rendimiento respecto a los pesos en precision completa.

## Requisitos de hardware

- VRAM/RAM estimada: alrededor de 1,2 a 1,6 GB para los pesos (923 MB de shards) mas la cache KV y el overhead del runtime para 4096 tokens de contexto. Estimacion, no medida publicada.
- Espacio en disco o cache del navegador: 1,0 GB para el repositorio completo, incluyendo tokenizador (10,89 MB de `tokenizer.json`, 2,65 MB de `vocab.json`, 1,59 MB de `merges.txt`) y la libreria wasm (5,52 MB).
- GPU compatibles: cualquier dispositivo con soporte WebGPU, incluyendo integradas de Apple Silicon, Intel Arc y AMD RDNA, y dedicadas NVIDIA. No hay lista de compatibilidad publicada en la informacion disponible.
- Cabe en GPU de consumo: si, es precisamente el objetivo del artefacto; tambien en GPUs integradas, sujeto a la calidad de la implementacion WebGPU del navegador.
- Opciones de despliegue: WebLLM/MLC en navegador con WebGPU. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI con estos ficheros, ya que el formato MLC no es compatible con esas herramientas.
- Latencia y throughput: no disponibles. Dependeran del dispositivo del usuario, del navegador y del coste de compilacion inicial del grafo WebGPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| skillsafe-ai/qwen3-1.7b-q4f16 | 2.031.739.904 (recuento verificado) | 4096 | q4f16_1 (4,50 bits/parametro) | MLC para WebGPU | apache-2.0 | 0 descargas, 0 likes; publicado el 2026-09-22 |
| mlc-ai/Qwen3-1.7B-q4f16_1-MLC (origen) | Mismo checkpoint (commit 80b3abce) | No disponible | q4f16_1 | MLC para WebGPU | No disponible en la informacion | Artefacto upstream de referencia |
| Qwen/Qwen3-1.7B (modelo base) | 1,7B segun denominacion comercial | No disponible en la informacion | No disponible | No disponible | apache-2.0 | Modelo base oficial |

Respecto a otras familias de tamano comparable (por ejemplo Llama 3.2 1B, Gemma 3 1B o SmolLM2 1.7B), no se dispone en la informacion proporcionada de datos verificables de parametros, contexto, rendimiento ni licencia para establecer una comparacion fiable. La diferencia funcional de este artefacto frente a cualquier modelo servido en servidor es que su formato esta atado al runtime WebLLM: no puede reutilizarse en vLLM, llama.cpp ni Ollama sin reconvertir los pesos.

## Limitaciones y advertencias

- Ventana de contexto reducida: 4096 tokens en este artefacto, inferior a la de muchos modelos actuales; descarta casos de uso con documentos largos o conversaciones muy extensas.
- Perdida de calidad por cuantizacion: los pesos se almacenan a 4 bits (4,50 bits por parametro). No hay evaluacion publicada del impacto de esta cuantizacion sobre tareas de razonamiento, codigo o matematicas.
- Ausencia total de benchmarks: no es posible estimar el rendimiento esperado a partir de la informacion proporcionada.
- Idiomas no declarados: la model card no lista idiomas soportados, de modo que no hay garantia documentada de calidad en castellano ni en ninguna otra lengua.
- Capacidades avanzadas no verificadas: no hay documentacion en este repositorio sobre tool calling, function calling, agentes, modo de pensamiento ni multimodalidad, aunque el modelo base pudiera soportarlas.
- Dependencia del navegador y del hardware del usuario: el rendimiento y la compatibilidad dependen del soporte WebGPU del navegador y del dispositivo, fuera del control del desplegador, lo que complica garantizar latencias o una experiencia uniforme.
- Superficie de despliegue limitada: no es compatible con los servidores de inferencia habituales (vLLM, TGI, llama.cpp, Ollama), lo que restringe su uso a WebLLM/MLC.
- Riesgo de alucinacion: inherente a un modelo generativo de ~2.000 millones de parametros cuantizado a 4 bits; no hay evaluacion publicada de tasas de error ni de sesgos.
- Trazabilidad a verificar en produccion: los ficheros `registry` se sirven desde `models.skillsafe.ai` y los `bundle` viajan dentro de la aplicacion; conviene validar los SHA-256 publicados en el momento de la descarga, ya que el repo es de un tercero y no del equipo de Qwen ni de MLC.
- Licencia: Apache-2.0 declarada, lo que en principio permite uso comercial, pero conviene confirmar que la licencia del modelo base y la del artefacto MLC upstream son compatibles con el uso previsto.
- Madurez del repositorio: 0 descargas y 0 likes, publicado por un autor no oficial, y con la model card truncada en la seccion de uso.
- Idiomas en las busquedas: las consultas web realizadas devolvieron unicamente resultados sobre precios de gasoil, sin relacion con el modelo, por lo que no aportan informacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/qwen3-1.7b-q4f16
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Artefacto MLC upstream (commit fijado): https://huggingface.co/mlc-ai/Qwen3-1.7B-q4f16_1-MLC/tree/80b3abcec6c3b3f5355dc0cc99cc4fb578f192bc
- Repositorio del conversor y recetas: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Receta de conversion citada: `recipes/qwen3-1.7b-q4f16.yaml` (sha256 f5e2c15375c15f9b49b4644378f7e7846e605d6e60303f1f094415f018da226d), en el repositorio anterior
- Dominio de servido de los ficheros `registry` mencionado en la model card: https://models.skillsafe.ai
- Runtime WebLLM (mencionado en la model card como via de uso, sin enlace explicito): https://github.com/mlc-ai/web-llm
- Busquedas web complementarias: sin resultados relevantes; los unicos enlaces devueltos corresponden a comparadores de precios de gasoil y no guardan relacion con el modelo.
