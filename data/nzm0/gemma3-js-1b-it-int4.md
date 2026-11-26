# NZM0/gemma3-js-1b-it-int4

## Resumen

`NZM0/gemma3-js-1b-it-int4` es una conversion cuantizada independiente del modelo `google/gemma-3-1b-it` de Google, publicada por el usuario NZM0. No se trata de un modelo entrenado ni afinado desde cero, sino de un artefacto de pesos derivado del export FP32 de referencia del mismo autor, transformado mediante el script `python/convert_mobile.py` del proyecto `gemma3-js`. Su proposito es permitir la inferencia de Gemma 3 1B IT directamente en el navegador mediante WebGPU, con un formato de pesos propietario que no es compatible con la carga estandar de Transformers.

El modelo emplea una cuantizacion de tipo W4A32: los pesos matriciales se almacenan en INT4 simetrico con grupos de 32 elementos y escalas en FP32 (20 bytes por grupo), mientras que las capas de normalizacion, la acumulacion y la cache KV permanecen en FP32. El embedding y la cabeza de salida, que estan atados, se almacenan en 32 bloques empaquetados. El repositorio ocupa 0,6 GB, coherente con un modelo de 1B parametros cuantizado a 4 bits.

Su relevancia es acotada pero concreta: demuestra un flujo de despliegue de un LLM de Google en el cliente (navegador), sin endpoint de inferencia remoto, orientado a aplicaciones web con WebGPU. La validacion local se observo en un Mac M4 y un iPhone 16e durante el desarrollo, aunque la carga remota de esta carga concreta no esta verificada segun la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/gemma-3-1b-it; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 1B (segun el modelo base google/gemma-3-1b-it) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 simetrico W4A32, grupos de 32 con escalas FP32; normalizacion, acumulacion y cache KV en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (incluye Gemma Prohibited Use Policy) |
| Formato de pesos | Formato propietario de gemma3-js (custom-format), no compatible con Transformers |

## Arquitectura y entrenamiento

El artefacto no introduce entrenamiento nuevo: es una conversion de pesos del export FP32 de `google/gemma-3-1b-it`. La arquitectura subyacente es la del modelo base de Google, un transformer de 1B parametros en su variante instruction-tuned; la informacion proporcionada no detalla el numero de capas, dimensiones ocultas ni regimen de atencion.

La innovacion tecnica esta en el pipeline de conversion y despliegue. El conversor `python/convert_mobile.py` (gemma3-js v0.2.0) aplica cuantizacion simetrica de grupo 32 en INT4 con escalas FP32 para las matrices de pesos, manteniendo en FP32 las operaciones sensibles a la precision (normalizacion, acumulacion y cache KV). El embedding atado a la cabeza de salida se empaqueta en 32 bloques. Los metadatos del tokenizador se convierten desde el tokenizador original de Gemma. El resultado se ejecuta exclusivamente en el runtime gemma3-js v0.2.1 o superior sobre WebGPU. No se documentan datos de entrenamiento, RLHF ni DPO porque no hay entrenamiento involucrado.

## Capacidades

- Generacion de texto en modo chat/instrucciones, heredadas de `google/gemma-3-1b-it`.
- Inferencia en el cliente (navegador) mediante WebGPU, sin endpoint remoto.
- Ejecucion en dispositivos moviles y de escritorio con GPU compatible con WebGPU y memoria suficiente (observado en Mac M4 e iPhone 16e).
- Capacidades multilingues: no disponibles en la informacion proporcionada (dependen del modelo base).
- Tool calling, function calling, agentes y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Vision, audio o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Chat asistente embebido en una web: el modelo se carga en el navegador del usuario mediante WebGPU y responde sin enviar datos a un servidor, lo que resulta adecuado para privacidad y para evitar costes de inferencia en backend.
- Demos interactivas de LLM en paginas estaticas: al ocupar 0,6 GB y ejecutarse en el cliente, permite publicar una demo funcional sin infraestructura de GPU dedicada.
- Prototipado de aplicaciones moviles web: el modelo fue observado en un iPhone 16e, por lo que sirve para validar experiencias de asistente en navegador movil con WebGPU.
- Evaluacion comparativa de cuantizacion INT4 frente a FP32: al existir el export de referencia `NZM0/gemma3-js-1b-it`, permite contrastar calidad y latencia entre ambas variantes en el mismo runtime.
- Educacion y experimentacion en inferencia en el borde: util para estudiar el comportamiento de un transformer de 1B cuantizado a 4 bits en hardware de consumo, con pesos descargados bajo demanda.
- Asistentes de texto offline-first en aplicaciones web progresivas: una vez descargado el repositorio de pesos, el modelo puede operar sin conexion en dispositivos compatibles, adecuado para entornos con conectividad intermitente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona observacion de inferencia local en Mac M4 e iPhone 16e durante el desarrollo, sin cifras de latencia, throughput ni calidad.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 0,6 GB; la inferencia requiere memoria adicional para cache KV en FP32 y buffers de activacion, cuyo tamano exacto no esta disponible.
- GPU recomendadas: cualquier GPU con soporte WebGPU; validado en Apple M4 (Mac) y Apple A18 (iPhone 16e) segun el autor.
- Compatibilidad con GPU de consumo: si, en la medida en que el navegador exponga WebGPU y haya memoria suficiente; no se especifican modelos concretos de NVIDIA o AMD.
- Opciones de despliegue: exclusivamente el runtime gemma3-js v0.2.1 o superior sobre WebGPU; no es compatible con vLLM, llama.cpp, Ollama, TGI ni la carga estandar de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| NZM0/gemma3-js-1b-it-int4 | 1B | no disponible | custom-format (gemma3-js) | Gemma Terms of Use | WebGPU en navegador |
| NZM0/gemma3-js-1b-it (referencia FP32) | 1B | no disponible | custom-format (gemma3-js) | Gemma Terms of Use | WebGPU en navegador |
| google/gemma-3-1b-it | 1B | no disponible | safetensors | Gemma Terms of Use | Transformers, vLLM, TGI, etc. |

La comparativa con alternativas de otros autores (por ejemplo, otros modelos de 1B cuantizados para navegador) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Formato propietario: no es compatible con la carga estandar de Transformers ni con runtimes convencionales; solo funciona con gemma3-js v0.2.1 o superior sobre WebGPU.
- Carga remota no verificada: el autor indica que la carga remota de esta carga concreta no esta verificada; solo se observo inferencia local durante el desarrollo.
- Verificacion de procedencia: el hash del checkpoint de referencia debe consultarse en `PROVENANCE.json` si esta presente; los SHA256SUMS registran hashes de ficheros, no paridad de inferencia.
- Riesgo de alucinacion: inherente al modelo base de 1B parametros; no se documentan mitigaciones adicionales.
- Sesgos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada.
- Restricciones de licencia: sujeto a Gemma Terms of Use y Gemma Prohibited Use Policy, incluida la seccion 3.2; el runtime gemma3-js usa licencia 0BSD, que no cubre los materiales del modelo.
- Dependencia de WebGPU: el rendimiento y la disponibilidad dependen del soporte WebGPU del navegador y del dispositivo; no hay cifras de latencia publicadas.
- Modelo no afiliado ni respaldado por Google.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NZM0/gemma3-js-1b-it-int4
- Export FP32 de referencia: https://huggingface.co/NZM0/gemma3-js-1b-it
- Repositorio del runtime gemma3-js: https://github.com/NZM0/gemma3-js
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Gemma Terms of Use: https://gemma.ai/resources/terms/
- Gemma Prohibited Use Policy: https://gemma.ai/resources/prohibited-use/
