# skillsafe-ai/qwen3-0.6b-q4f16

## Resumen

El modelo `skillsafe-ai/qwen3-0.6b-q4f16` es un conjunto de artefactos cuantizados en formato MLC (Machine Learning Compilation) preparados para ejecutarse directamente en el navegador mediante WebLLM y WebGPU. No se trata de un modelo entrenado desde cero, sino de una conversión reproducible del checkpoint Qwen3-0.6B de Alibaba Cloud, publicada por SkillSafe a partir de los pesos ya cuantizados por el equipo de MLC. El resultado es un paquete de 0,4 GB que incluye una librería WebGPU compilada en `.wasm`, los shards de parámetros y los ficheros de tokenizador necesarios para inicializar la inferencia en cliente.

La relevancia de esta publicación es fundamentalmente de despliegue: permite ejecutar un modelo conversacional de 751.632.384 parámetros (según la verificación de la propia model card) íntegramente en el navegador del usuario, sin enviar datos a un servidor y sin coste de GPU en la nube. El formato de pesos es q4f16_1, una cuantización de grupo de 4 bits con escalas y cómputo en fp16, con una densidad efectiva declarada de 3,57 bits por parámetro.

El modelo hereda la licencia Apache-2.0 del Qwen3-0.6B original y se distribuye con trazabilidad completa: receta de conversión, hashes SHA-256 por fichero, commit upstream fijado y toolchain documentado. Su público objetivo son desarrolladores que quieran integrar un LLM ligero en aplicaciones web, extensiones de navegador o PWAs sin infraestructura de servidor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Qwen3); artefactos compilados para runtime MLC/WebGPU |
| Parámetros totales | 751.632.384 (según la verificación de la model card, 3,57 bits/parámetro) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | Librería `.wasm` compilada para 4.096 tokens con prefill de 1.024; `mlc-chat-config.json` declara 40.960 / 2.048, por lo que el autor indica aplicar overrides |
| Tipos de cuantización | q4f16_1 (cuantización de grupo de 4 bits, cómputo fp16); 3,57 bits por parámetro efectivos |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos upstream de Qwen3-0.6B, Copyright 2025 Alibaba Cloud) |
| Formato de pesos | MLC: `params_shard_0..8.bin`, `ndarray-cache.json`, `tensor-cache.json`, `mlc-chat-config.json`, tokenizador (`tokenizer.json`, `vocab.json`, `merges.txt`) y librería WebGPU `Qwen3-0.6B-q4f16_1-ctx4k_cs1k-webgpu.wasm` |
| Tamaño del repositorio | 0,4 GB (shards de parámetros: 319,83 MB en total) |
| Pipeline | text-generation |
| Fecha de publicación | 2026-09-22 |

## Arquitectura y entrenamiento

El checkpoint subyacente es Qwen3-0.6B, un transformer decoder denso de la familia Qwen3. Esta publicación no contiene entrenamiento propio: es una conversión de los pesos q4f16_1 publicados por MLC (`mlc-ai/Qwen3-0.6B-q4f16_1-MLC`, commit `8c14ce481d4c692769976ad52afea453a102df19`). El pipeline declarado usa Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64, y la receta `recipes/qwen3-0.6b-q4f16.yaml` (sha256 `94784f18373a8083b0a13184727c0dd088f2310ae8f7635fec1e42e139669df9`) documenta el procedimiento completo. No se especifican en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo fases de RLHF o DPO: esos datos corresponderían a la model card original de Qwen3-0.6B y no se reproducen aquí.

La innovación técnica de este repositorio es la reproducibilidad y el destino de ejecución. La cuantización q4f16_1 agrupa los pesos en bloques de 4 bits con escalas en fp16, lo que reduce el peso total a unos 320 MB y permite cargar el modelo en memoria de navegador. La librería `.wasm` está compilada específicamente para contexto de 4.096 tokens y prefill en chunks de 1.024, orientada a WebGPU. La model card documenta una verificación explícita: los tamaños y md5 de los shards coinciden con `ndarray-cache.json`, el recuento implícito de parámetros coincide con el checkpoint (751.632.384, 3,57 bits/parámetro) y la tabla de parámetros embebida en la librería WebGPU coincide con los 339 tensores de los pesos.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational` de la model card.
- Ejecución íntegra en el navegador mediante `@mlc-ai/web-llm` y WebGPU, sin backend de servidor.
- Inicialización vía `CreateMLCEngine` con lista de modelos personalizada y overrides de `context_window_size` y `prefill_chunk_size`.
- Distribución de artefactos en tres clases: `registry` (parámetros servidos desde `models.skillsafe.ai` una vez verificados), `bundle` (ficheros embarcados en la app) y `registry-shared` (librería de runtime reutilizada por modelos de la misma arquitectura).
- Trazabilidad y verificación criptográfica por fichero (SHA-256 individual y `manifest.json` con receta, fuentes y toolchain).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la ficha de HuggingFace no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional embebido en una web: el modelo se carga con WebLLM en el navegador del visitante y responde en la propia página, sin llamadas a una API externa. El límite práctico es de 4.096 tokens de contexto, suficiente para diálogos de soporte de varios turnos.
- Extensión de navegador con procesamiento local de texto: resumir, reescribir o clasificar el contenido de la pestaña activa manteniendo los datos en el cliente. Encaja porque el runtime es WebGPU y los pesos se descargan una sola vez y quedan en caché.
- Aplicación PWA con funcionamiento offline: una vez cacheado el bundle (0,4 GB, o los shards servidos desde el `registry`), la generación de texto funciona sin conexión, útil en entornos con red intermitente.
- Enrutado y preprocesado previo a un modelo mayor: usar el 0.6B en cliente para clasificar intención, extraer entidades o decidir si la consulta merece invocar un modelo grande en servidor, reduciendo coste por token.
- Formularios inteligentes y autocompletado semántico: generar borradores de respuestas, descripciones de producto o textos de ayuda a partir de los campos ya rellenados por el usuario, sin salir del navegador.
- Prototipado y docencia: permite demostrar el comportamiento de un LLM en un aula o en un notebook del navegador sin GPU ni presupuesto de inferencia, con artefactos verificables por hash.
- Filtrado de contenido en el borde: primera pasada de moderación o de detección de texto sensible antes de escalar a un servicio centralizado, con la ventaja de que el contenido no abandona el dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad, y los resultados de búsqueda web obtenidos no contienen información relevante sobre el modelo (solo dominios de casino sin relación).

Lo único verificable son comprobaciones de integridad, no de calidad:

| Comprobación | Resultado declarado |
|---|---|
| Coincidencia de tamaños y md5 de shards con `ndarray-cache.json` | Correcta |
| Recuento implícito de parámetros | 751.632.384 (3,57 bits/parámetro) |
| Tabla de parámetros de la librería WebGPU frente a los pesos | Coincide con los 339 tensores |
| SHA-256 del commit upstream | `8c14ce481d4c692769976ad52afea453a102df19` |

## Requisitos de hardware

- Almacenamiento: 0,4 GB de repositorio; los shards de parámetros suman 319,83 MB y el tokenizador y ficheros auxiliares (tokenizer.json, vocab.json, merges.txt) rondan los 15 MB.
- Memoria: los pesos cuantizados ocupan unos 320 MB; a ello hay que sumar el espacio de la caché KV, que depende del contexto finalmente configurado (4.096 tokens con la librería compilada). No se publican cifras oficiales de VRAM ni de memoria de sistema.
- GPU: el requisito real es un navegador con soporte de WebGPU; la model card no enumera GPUs concretas. No hay datos publicados para A100, H100 o RTX 4090 en esta información.
- GPU de consumo: el tamaño de los pesos hace plausible la ejecución en GPU integradas y en portátiles, pero no se dispone de una lista de compatibilidad verificada.
- Opciones de despliegue: WebLLM (`@mlc-ai/web-llm`) sobre runtime MLC, con la librería `.wasm` incluida. Los artefactos son específicos de MLC, por lo que no son directamente utilizables en vLLM, llama.cpp, Ollama ni TGI sin volver a convertir los pesos.
- Latencia y throughput: no disponibles. Dependerán del backend WebGPU del navegador, la GPU del cliente y el tamaño de prefill (1.024 tokens por chunk en la compilación actual).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `skillsafe-ai/qwen3-0.6b-q4f16` | 751.632.384 | 4.096 en la librería compilada (40.960 declarados en config) | MLC + `.wasm` WebGPU | Apache-2.0 | Repo de 0,4 GB, 0 descargas y 0 likes en el momento de la consulta |
| `mlc-ai/Qwen3-0.6B-q4f16_1-MLC` (upstream directo) | 751.632.384 (mismo checkpoint) | No disponible en la información proporcionada | MLC | Apache-2.0 | Fuente original de la que deriva este repositorio, en el commit `8c14ce48...` |
| `Qwen/Qwen3-0.6B` (modelo base sin cuantizar) | 0,6B declarados por el autor | No disponible en la información proporcionada | safetensors (formato esperado del checkpoint base) | Apache-2.0 | Repositorio oficial de Alibaba Cloud |
| Variantes GGUF de Qwen3-0.6B para llama.cpp | Mismo orden de magnitud | No disponible | GGUF | Apache-2.0 | Ecosistema llama.cpp; no verificable con la información proporcionada |

La diferencia sustantiva frente al modelo base y frente a las variantes GGUF es el destino de ejecución: este repositorio incluye una librería WebGPU compilada y está pensado para WebLLM, mientras que las alternativas requieren un runtime de servidor o de escritorio.

## Limitaciones y advertencias

- Riesgo de alucinación propio de un modelo de 0,6B: la capacidad de razonamiento y de retención de conocimiento factual es limitada, y no hay benchmarks publicados que permitan acotar el error esperado.
- Desajuste documentado de contexto: la librería `.wasm` está compilada para 4.096 tokens y prefill de 1.024, mientras que `mlc-chat-config.json` declara 40.960 / 2.048. Si no se aplican los overrides indicados por el autor, el comportamiento puede ser incorrecto. En la práctica, el contexto útil en navegador es de 4.096 tokens.
- Idiomas no declarados: la ficha no especifica cobertura lingüística, por lo que el rendimiento en castellano no está garantizado ni medido.
- Ausencia de validación comunitaria: el repositorio presenta 0 descargas y 0 likes, y fue creado y actualizado con dos segundos de diferencia, lo que sugiere una publicación automatizada sin uso documentado por terceros.
- Dependencia de la cadena de conversión del autor: la trazabilidad se apoya en el `manifest.json` y en los SHA-256 publicados. Conviene verificar esos hashes de forma independiente antes de usar los pesos en producción, especialmente en los ficheros de la clase `registry`, que se sirven desde `models.skillsafe.ai` una vez verificados.
- Restricciones de licencia: los pesos heredan Apache-2.0 de Qwen3-0.6B (Copyright 2025 Alibaba Cloud), lo que permite uso comercial con atribución. La receta de conversión y la model card son propiedad del repositorio SkillSafe y se rigen por su propia licencia, distinta de la de los pesos.
- Requisito de WebGPU: sin soporte de WebGPU en el navegador del cliente no hay ejecución posible; no hay una ruta alternativa documentada en este repositorio.
- Artefactos no portables: al ser formato MLC, no se pueden cargar directamente en vLLM, llama.cpp, Ollama o TGI.

## Enlaces

- Ficha de HuggingFace del modelo: https://huggingface.co/skillsafe-ai/qwen3-0.6b-q4f16
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia Apache-2.0 del modelo base (commit fijado): https://huggingface.co/Qwen/Qwen3-0.6B/blob/c1899de289a04d12100db370d81485cdf75e47ca/LICENSE
- Upstream MLC (commit fijado `8c14ce481d4c692769976ad52afea453a102df19`): https://huggingface.co/mlc-ai/Qwen3-0.6B-q4f16_1-MLC/tree/8c14ce481d4c692769976ad52afea453a102df19
- Repositorio de recetas y modelos de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Runtime WebLLM de MLC (referenciado en el ejemplo de uso como `@mlc-ai/web-llm`): https://github.com/mlc-ai/web-llm
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados obtenidos corresponden a dominios de casino sin relación con la ficha.
