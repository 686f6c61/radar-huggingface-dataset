# skillsafe-ai/qwen2.5-coder-1.5b-instruct-q4f16

## Resumen

Este repositorio contiene artefactos compilados con MLC-LLM (`mlc`) del modelo Qwen2.5-Coder-1.5B-Instruct, preparados para ejecutarse íntegramente en el navegador mediante WebLLM y WebGPU. No es un modelo entrenado por skillsafe-ai, sino una conversión reproducible de un artefacto ya existente de `mlc-ai`, generada con una receta verificable (sha256 declarado) y con hashes SHA-256 por archivo. El resultado se publica como pesos en formato MLC (`params_shard_*.bin`) más una librería WebAssembly compartida de 5,13 MB específica para WebGPU.

El modelo subyacente es un Qwen2.5-Coder de 1.500 millones de parámetros en su variante Instruct, con 1.543.714.304 parámetros contabilizados en el repositorio y una media de 4,50 bits por parámetro tras la cuantización `q4f16_1`. La relevancia de esta ficha está en el modo de despliegue: inferencia local en el cliente, sin servidor y sin coste por token, algo útil para asistentes de código embebidos en aplicaciones web y para entornos donde el código no puede salir del dispositivo.

El repositorio tiene un tamaño de 0,9 GB, cero descargas y cero valoraciones en el momento de la consulta, y fue creado el 22 de septiembre de 2026. La licencia declarada es apache-2.0 y el pipeline es `text-generation`. No se documentan idiomas soportados ni resultados de benchmarks, y la ficha no incluye información sobre el proceso de entrenamiento del modelo original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (corresponde al modelo base Qwen2.5-Coder-1.5B-Instruct); artefacto compilado con MLC-LLM para WebGPU. El repositorio solo declara el tag `mlc` |
| Parametros totales | 1.543.714.304 (≈1,5B), según la verificación incluida en la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4k en el artefacto compilado (el binario se llama `...-ctx4k_cs1k-webgpu.wasm`); el contexto nativo del modelo base no se indica en la información disponible |
| Tipos de cuantizacion | `q4f16_1` (4,50 bits por parámetro de media: pesos en 4 bits, activaciones en fp16) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLC: `params_shard_0..29.bin`, `ndarray-cache.json`, `tensor-cache.json`, tokenizer en JSON. No incluye safetensors ni GGUF |
| Numero de tensores | 311, según la verificación de la model card |
| Tamano del repositorio | 0,9 GB (≈853 MB en shards de pesos + ≈11 MB de bundle + 5,13 MB de librería wasm) |
| Pipeline | text-generation |
| Variante MLC | q4f16_1, contexto compilado 4k, `cs1k` (semántica de `cs1k` no detallada en la ficha) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es un artefacto derivado. La cadena declarada es una conversión reproducible desde `mlc-ai/Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC` (commit `30184a4f713a9aaf6c548ace1290615d0ea041ff`) usando una receta YAML con sha256 `856bf330211f9b380a4db453e7bb9210fa8ef12a407f4c7cf4bfc5e69bebdc3d`, ejecutada con Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64. Por tanto, los datos de entrenamiento, la composición del corpus y las fases de alineación (SFT, RLHF o DPO) son los del modelo base Qwen2.5-Coder-1.5B-Instruct y no se documentan en esta ficha.

La innovación relevante aquí es de despliegue, no de modelado: la compilación a WebGPU con una librería wasm de 5,13 MB compartida entre todos los modelos de la misma arquitectura (`registry-shared`), pesos fragmentados en shards servidos desde `models.skillsafe.ai` (`registry`) y archivos de configuración y tokenizer que viajan dentro de la aplicación (`bundle`). La model card incluye verificación de integridad: los tamaños y md5 de los shards coinciden con `ndarray-cache.json`, el recuento implícito de parámetros coincide con el checkpoint y la tabla de parámetros embebida en la librería WebGPU coincide con los 311 tensores.

## Capacidades

- Generación de texto conversacional (tag `conversational`), orientada a instrucciones.
- Generación y explicación de código, por herencia del modelo base Qwen2.5-Coder-1.5B-Instruct.
- Ejecución local en el navegador mediante WebGPU, sin llamadas a API externas y con el prompt y la respuesta permaneciendo en el dispositivo.
- Streaming de tokens a través del runtime de WebLLM (comportamiento propio de MLC/WebLLM; no se detalla en la ficha concreta de este repositorio).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no disponibles (el repositorio no declara idiomas).
- Visión, audio o modo de razonamiento explícito: no disponibles; el modelo base es solo texto.
- Contexto útil de 4k tokens en este artefacto, lo que limita tareas de análisis de archivos completos o repositorios extensos.

## Casos de uso

- Asistente de código embebido en una aplicación web: el modelo se carga en el navegador con WebLLM y responde sobre fragmentos que el usuario pega en la interfaz, sin que el código se envíe a ningún servidor. Es adecuado por su tamaño (1,5B) y su ventana de 4k, suficiente para funciones y ficheros sueltos.
- Entornos con requisitos estrictos de privacidad o cumplimiento (código propietario, datos sanitarios o financieros): al ejecutarse en el cliente, el texto no abandona el dispositivo, lo que simplifica el análisis de riesgos frente a soluciones SaaS.
- Portales de documentación con ejemplos ejecutables: generar variaciones de un snippet, traducir un ejemplo entre lenguajes o explicar una firma de API en la propia página, con latencia aceptable en portátiles modestos.
- Herramientas internas de desarrollo (generación de regex, consultas SQL, expresiones cron, mensajes de commit): tareas cortas y autocontenidas donde 1,5B de parámetros y 4k de contexto son suficientes y el coste marginal por consulta es cero.
- Educación y formación en programación: tutores que funcionan sin conexión o en redes restringidas, con equipos de estudiantes que no disponen de GPU dedicada, siempre que el navegador soporte WebGPU.
- Prototipado rápido de producto conversacional: validar flujos de UX de un asistente antes de decidir si se migra a un modelo mayor servido por API, reutilizando la misma interfaz de chat.
- Demos y pruebas de regresión de runtimes WebLLM: el repositorio sirve como caso de prueba reproducible (hashes, recuento de parámetros, shards) para validar una integración de MLC-LLM en producción.
- Procesamiento por lotes ligero en el cliente sobre textos cortos (resúmenes de issues, normalización de descripciones), siempre que se trocee la entrada para no superar los 4k tokens de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K, MBPP ni de velocidad de inferencia; únicamente datos de verificación de integridad (recuento de parámetros, 4,50 bits por parámetro, 311 tensores y coincidencia de tamaños y md5 de los shards).

## Requisitos de hardware

- Peso en disco y en memoria de los parámetros: aproximadamente 853 MB (suma de los 30 shards `params_shard_*.bin`), más unos 11 MB de archivos de configuración y tokenizer, más 5,13 MB de la librería wasm. El repositorio completo ocupa 0,9 GB.
- VRAM estimada: alrededor de 1 GB solo para pesos; con caché KV de 4k tokens y buffers de activaciones, es razonable reservar 1,5-2 GB de memoria de GPU. Estimación orientativa, no medida publicada.
- GPU compatibles: cualquier GPU con soporte WebGPU en el navegador (Chrome/Edge 113 o superior en escritorio). No requiere CUDA ni ROCm para este artefacto.
- GPU consumer: sí, cabe en gráficas integradas modernas (Intel Iris Xe, AMD Radeon 780M) y en GPU dedicadas de gama de entrada; en una RTX 4090 o equivalente el modelo ocupa una fracción mínima de la memoria disponible. La ficha no aporta cifras de rendimiento medidas.
- Opciones de despliegue: WebLLM / MLC-LLM en navegador con WebGPU es la única vía directa con estos pesos. Los shards en formato MLC no son compatibles con vLLM, llama.cpp, Ollama ni TGI; para esos runtimes habría que partir del modelo base y convertir a GGUF o safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| skillsafe-ai/qwen2.5-coder-1.5b-instruct-q4f16 (este repositorio) | 1,54B (4,50 bits/parámetro) | 4k en el artefacto compilado | MLC (`params_shard_*.bin`) para WebGPU | apache-2.0 | Público en HuggingFace, 0 descargas, 0 likes |
| mlc-ai/Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC (origen) | 1,54B en el mismo esquema de cuantización | No disponible en la información proporcionada | MLC para WebGPU | No disponible en la información proporcionada | Público; commit de origen `30184a4f...` |
| Qwen/Qwen2.5-Coder-1.5B-Instruct (modelo base) | 1,54B en precisión original | No disponible en la información proporcionada | safetensors (no confirmado en la información disponible) | apache-2.0 según la herencia indicada en los tags de este repositorio | Público en HuggingFace |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada, por lo que la comparación se limita a formato, licencia y vía de despliegue.

## Limitaciones y advertencias

- Es una conversión de terceros, no una publicación oficial de Qwen ni de mlc-ai; conviene validar los hashes SHA-256 antes de desplegar en producción.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni de validación por parte de la comunidad.
- Inconsistencia de nomenclatura: la librería wasm se llama `Qwen2-1.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm`, sin la palabra «Coder», mientras que el modelo base declarado sí es un Coder. Conviene verificar que el artefacto corresponde realmente al checkpoint declarado.
- Contexto limitado a 4k tokens en este artefacto, insuficiente para analizar repositorios, ficheros largos o conversaciones extensas.
- La cuantización a 4 bits puede degradar la precisión en tareas de código que requieren reproducir identificadores exactos, aritmética o sintaxis poco frecuente. No hay evaluación publicada que lo cuantifique.
- No se documentan idiomas soportados; el comportamiento fuera del inglés (y en castellano en particular) es incierto y debe probarse antes de usarlo.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni fases de alineación, que dependen íntegramente del modelo base.
- Riesgo de alucinación inherente: puede generar APIs inexistentes, dependencias inventadas o código sintácticamente plausible pero incorrecto. Requiere revisión humana y pruebas automatizadas.
- La ejecución depende de WebGPU y de un navegador compatible; la disponibilidad y el rendimiento varían entre plataformas y versiones de driver, y no hay cifras publicadas de latencia.
- El consumo de memoria del navegador y la fragmentación de la memoria de GPU pueden provocar fallos de carga en equipos con poca VRAM compartida.
- Licencia apache-2.0 en este repositorio, permisiva para uso comercial, pero debe confirmarse por separado la licencia y las condiciones del modelo base y del artefacto de MLC de origen antes de un despliegue comercial.
- Los enlaces devueltos por la búsqueda web no guardan relación con este modelo (resultados sobre Microsoft Copilot) y no se han utilizado como fuente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/skillsafe-ai/qwen2.5-coder-1.5b-instruct-q4f16
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Origen MLC (commit fijado): https://huggingface.co/mlc-ai/Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC/tree/30184a4f713a9aaf6c548ace1290615d0ea041ff
- Receta de conversión y convertidor reproducible: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Sitio del autor: https://skillsafe.ai
- Papers, blogs o demos adicionales: no disponible en la información proporcionada.
