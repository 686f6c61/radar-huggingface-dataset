# marioysc/MiniCPM5-1B-Agentic-Tooluse-v3-q4f16_1-MLC

## Resumen

MiniCPM5-1B-Agentic-Tooluse-v3-q4f16_1-MLC es una conversión cuantizada al formato MLC del checkpoint FP16 MiniCPM5-1B-Agentic-Tooluse-v3-Merged-FP16, orientada a ejecutar el modelo íntegramente en el navegador mediante WebLLM y WebGPU. El artefacto lo publica el usuario marioysc, que no es el autor del ajuste fino (ewin-reg) ni del modelo base (OpenBMB MiniCPM5-1B), sino el responsable de la conversión y del empaquetado para el runtime web.

El modelo tiene 1.080.632.832 parámetros y un peso total de 607.964.160 bytes (unos 580 MiB) en cuantización q4f16_1, con grupos de 4 bits y escalas en FP16. El repositorio incluye los fragmentos de pesos, el tokenizer, la configuración de chat y una biblioteca WebAssembly específica con shaders WebGPU, de modo que no requiere backend ni servidor de inferencia: todo el cómputo ocurre en el dispositivo del usuario.

Su relevancia actual está en el nicho de agentes ligeros con tool calling que deben funcionar sin conexión a un servicio externo, por motivos de privacidad, coste o latencia. El compromiso es claro: se sacrifica ventana de contexto (4.096 tokens en este artefacto, frente a una ventana mayor anunciada por el checkpoint original) y precisión frente al FP16 a cambio de un consumo de memoria de unos 580 MiB y de un despliegue puramente estático sobre HTTPS o localhost.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta MLC «llama» en el repositorio); numero de capas, cabezas y dimensiones no disponibles |
| Parametros totales | 1.080.632.832 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens en este artefacto, incluyendo prompt y completion; el checkpoint original anuncia una ventana mayor, valor no disponible |
| Tipos de cuantizacion | q4f16_1 (grupos de 4 bits con escalas FP16); el checkpoint de origen esta en FP16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | MLC (fragmentos binarios cuantizados + biblioteca WebGPU/Wasm); 607.964.160 bytes, unos 580 MiB, 15 shards; no incluye safetensors ni GGUF |

Otros parámetros operativos declarados: tamaño de lote 1, chunk de prefill de 256 tokens, requisito de WebGPU con `shader-f16`, versión de WebLLM `@mlc-ai/web-llm@0.2.85` y tamaño total del repositorio de 0,6 GB.

## Arquitectura y entrenamiento

El artefacto es una conversión de pesos, no un entrenamiento nuevo. El linaje documentado es OpenBMB MiniCPM5-1B como modelo base, un ajuste fino orientado a tool calling publicado por ewin-reg (MiniCPM5-1B-Agentic-Tooluse-v3-Merged-FP16) y, finalmente, la conversión MLC realizada por marioysc. La conversión se hizo directamente desde el checkpoint FP16 con la herramienta oficial `convert_weight` de MLC en CPU, sin pasar por una desquantización intermedia de GGUF. El repositorio etiqueta la arquitectura como «llama» en los tags de MLC; no se publican detalles de número de capas, tipo de atención, vocabulario ni composición del dataset de ajuste.

En cuanto al pipeline técnico, el artefacto se compiló en Ubuntu 24.04 bajo WSL con `mlc-llm-nightly-cpu==0.26.dev6`, `mlc-ai-nightly-cpu==0.26.dev246` y `apache-tvm-ffi==0.1.13`, usando Emscripten 6.0.9 para generar la biblioteca WebAssembly. El autor documenta que tres pases del compilador MLC se restauraron desde una revisión upstream concreta para adaptarse a la API de buffer-map de la rueda de TVM, que el runtime Wasm incluye `custom_allocator.cc` (omitido en su amalgamación) y que se enlaza mediante `em++` para soporte de runtime de C++. No hay información disponible sobre RLHF, DPO, número de tokens de entrenamiento ni composición del corpus del modelo ajustado.

## Capacidades

- Generacion de texto en ingles con pipeline `text-generation`.
- Tool calling / function calling mediante un formato XML propietario insertado en el system prompt, con salidas del tipo `<function name="get_weather"><param name="city">Paris</param></function>`.
- Invocacion de una funcion por bloque completado: el ejemplo incluido extrae el primer bloque XML cerrado y lo usa como frontera de la llamada.
- Uso como agente de un solo paso con argumentos validables antes del despacho; la ejecucion de la herramienta no la realiza el modelo ni el ejemplo.
- Inferencia local en navegador sobre WebGPU, sin backend remoto.
- Modo de pensamiento desactivable por peticion mediante `extra_body: { enable_thinking: false }`, que es la configuracion recomendada en el ejemplo del autor.
- Capacidades multilingues: no disponibles mas alla del ingles declarado.
- Vision, audio, mathico avanzado o razonamiento multi-paso extenso: no documentados en la informacion disponible.

## Casos de uso

- Asistentes web con privacidad estricta: al ejecutarse integramente en el navegador con WebGPU y 580 MiB de pesos, los prompts y las respuestas del usuario no salen del dispositivo, lo que encaja en aplicaciones sanitarias, legales o financieras con requisitos de residencia de datos.
- Tool calling en aplicaciones de una sola pagina: el modelo emite bloques XML de funcion que el codigo JavaScript puede parsear y despachar contra APIs REST propias, por ejemplo consultas meteorologicas, conversion de divisas o busqueda de stock.
- Demos y entornos de evaluacion sin coste de GPU: al no requerir servidor de inferencia, sirve para publicar demos interactivas en GitHub Pages o en un CDN estatico sobre HTTPS.
- Extensiones de navegador con automatizacion de formularios: el modelo puede decidir que funcion invocar para rellenar campos, consultar un CRM o preparar una accion sobre la pagina activa.
- Prototipado de agentes antes de escalar a un modelo mayor: permite validar el esquema de herramientas, el formato de prompts de sistema y la logica de validacion de argumentos con un coste de iteracion casi nulo.
- Aplicaciones educativas y de accesibilidad offline: al funcionar con los pesos descargados y almacenados en cache del navegador, puede operar sin conectividad continua una vez cargado el modelo.
- Verificacion de pipelines de cuantizacion MLC: el repositorio incluye scripts de reproduccion, versiones exactas de paquetes y `validation.json`, por lo que sirve como referencia para validar conversiones q4f16_1 de otros checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no reclama ninguna puntuacion de benchmark upstream para esta conversion y que cuantizar puede alterar las salidas.

La unica validacion documentada es un smoke test funcional: carga en Chrome 153 con WebLLM 0.2.85 sobre una NVIDIA RTX 3090, carga de los 15 shards, compilacion de los shaders de GPU, generacion de la llamada `get_weather` para Paris y finalizacion con `finish_reason: "stop"`. Se verificaron tamanos de shard, sumas MD5 y 245 limites de tensores. El propio autor lo califica de prueba funcional y no de benchmark de precision de tool calling.

| Prueba | Resultado | Contexto |
|---|---|---|
| Carga de shards | 15 de 15 cargados | Chrome 153, WebLLM 0.2.85, RTX 3090 |
| Checksum MD5 | Verificado | Todos los shards |
| Limites de tensores | 245 verificados | Artefacto cuantizado |
| Generacion de tool call | `<function name="get_weather"><param name="city">Paris</param></function>` | Prompt de ejemplo del autor |
| Finalizacion | `finish_reason: "stop"` | — |
| MMLU, HumanEval, GSM8K, BFCL | no disponible | No publicados |

## Requisitos de hardware

- VRAM estimada para inferencia: unos 580 MiB solo de pesos cuantizados, mas el overhead del runtime, la cache KV para 4.096 tokens y los buffers de WebGPU; el total exacto no esta disponible.
- GPU recomendadas: cualquier GPU con soporte de WebGPU y `shader-f16`; el unico hardware de prueba documentado es una NVIDIA RTX 3090.
- Cabe en GPU de consumo: si, en principio, en cualquier GPU de escritorio o portatil reciente con WebGPU y `shader-f16`; las GPU integradas pueden funcionar pero su rendimiento no esta documentado.
- Requisitos de plataforma: navegador con WebGPU (probado en Chrome 153), `@mlc-ai/web-llm@0.2.85` y servicio de la aplicacion por HTTPS o localhost.
- Opciones de despliegue: WebLLM en navegador es la via soportada por este artefacto. Para llama.cpp u Ollama hay que usar el checkpoint GGUF hermano; vLLM o TGI requeririan el checkpoint FP16, no estos pesos MLC, y no hay informacion de compatibilidad publicada.
- Lote y prefill: tamano de lote 1 y chunk de prefill de 256 tokens, lo que limita el throughput en prompts largos y en escenarios con concurrencia.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Compilacion de shaders: la primera carga implica compilacion de shaders de GPU, cuyo tiempo no esta cuantificado en la documentacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (marioysc, MLC q4f16_1) | 1.080.632.832 | 4.096 tokens | MLC + Wasm WebGPU, 580 MiB | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| ewin-reg MiniCPM5-1B-Agentic-Tooluse-v3-Merged-FP16 | 1.080.632.832 (heredados) | no disponible | FP16 | no disponible en la informacion proporcionada | HuggingFace |
| ewin-reg MiniCPM5-1B-Agentic-Tooluse-v3-GGUF | 1.080.632.832 (heredados) | no disponible | GGUF | no disponible en la informacion proporcionada | HuggingFace |
| OpenBMB MiniCPM5-1B | 1.080.632.832 (por el linaje declarado) | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |

Existen otros modelos de ~1B parametros orientados a instrucciones y tool calling (por ejemplo Llama 3.2 1B Instruct, Qwen2.5 1.5B Instruct o SmolLM2 1.7B Instruct), pero la informacion proporcionada no incluye sus especificaciones ni resultados de benchmarks de este modelo, por lo que no es posible establecer una comparacion cuantitativa fiable. La ventaja diferencial de este artefacto no es el rendimiento, sino el modo de despliegue: pesos MLC con biblioteca Wasm listos para ejecutarse en un navegador con WebGPU.

## Limitaciones y advertencias

- Contexto recortado: el artefacto esta configurado y compilado para 4.096 tokens, aunque el checkpoint original anuncie una ventana mayor; no es una limitacion del modelo base sino de esta conversion.
- Solo ingles declarado; no hay evidencia de capacidades multilingues.
- La cuantizacion q4f16_1 puede alterar las salidas respecto al FP16 y no hay benchmark que cuantifique esa degradacion.
- El formato de herramientas es XML propio, no el esquema `tools` / `tool_calls` de OpenAI; el ejemplo del autor extrae el primer bloque XML completado porque el modelo puede repetir o continuar generando despues de una llamada.
- Riesgo de alucinacion en nombres de funcion y argumentos: es obligatorio validar nombre y parametros antes de despachar cualquier accion, especialmente si la herramienta tiene efectos secundarios.
- La validacion publicada es un unico smoke test funcional; no hay evaluaciones de precision de tool calling, robustez ni tasas de error.
- Sin adopcion comunitaria: 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validacion independiente.
- Lote 1 y prefill de 256 tokens: no apto para servir multiples usuarios concurrentes con latencias ajustadas.
- Dependencia de WebGPU con `shader-f16`; el soporte varia por navegador y version, y solo se ha probado Chrome 153.
- Licencia apache-2.0 para el artefacto, que permite uso comercial con atribucion; conviene verificar la licencia del modelo base OpenBMB MiniCPM5-1B y del ajuste fino, no detalladas en la informacion disponible.
- Cadena de reproduccion compleja: paquetes nightly de MLC y TVM, pases de compilador restaurados desde upstream y dependencia de un build concreto de Emscripten, lo que puede dificultar reconstruir el artefacto byte a byte.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los enlaces obtenidos eran sobre una figura historica rumana y no aportan informacion tecnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/marioysc/MiniCPM5-1B-Agentic-Tooluse-v3-q4f16_1-MLC
- Checkpoint FP16 de origen: https://huggingface.co/ewin-reg/MiniCPM5-1B-Agentic-Tooluse-v3-Merged-FP16
- Checkpoint GGUF hermano: https://huggingface.co/ewin-reg/MiniCPM5-1B-Agentic-Tooluse-v3-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Autor del ajuste fino: https://huggingface.co/ewin-reg
- Autor de la conversion: https://huggingface.co/marioysc
- Ejemplo de uso en WebLLM: https://huggingface.co/marioysc/MiniCPM5-1B-Agentic-Tooluse-v3-q4f16_1-MLC/blob/main/webllm-example.js
- Licencia del artefacto: https://huggingface.co/marioysc/MiniCPM5-1B-Agentic-Tooluse-v3-q4f16_1-MLC/blob/main/LICENSE
- Resultados de validacion: https://huggingface.co/marioysc/MiniCPM5-1B-Agentic-Tooluse-v3-q4f16_1-MLC/blob/main/validation.json
- Resultados de busqueda web relevantes: no disponible.
