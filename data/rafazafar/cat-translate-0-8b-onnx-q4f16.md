# rafazafar/CAT-Translate-0.8b-onnx-q4f16

## Resumen

CAT-Translate-0.8b-onnx-q4f16 es una exportación cuantizada del modelo de traducción japonés→inglés cyberagent/CAT-Translate-0.8b, publicada por el usuario rafazafar para su uso con transformers.js sobre WebGPU. El modelo original lo desarrolla CyberAgent AI Lab y está pensado específicamente para traducción automática entre japonés e inglés, no como modelo de propósito general. Esta versión concreta resuelve el problema de ejecutar un traductor neuronal de calidad en el navegador, sin backend de servidor, aprovechando la aceleración por GPU que ofrece WebGPU.

La arquitectura subyacente es de tipo Llama (transformer decoder-only) con aproximadamente 0,8 mil millones de parámetros. La exportación se realizó con onnxruntime-genai usando cuantización int4 RTN con tamaño de bloque 32, activaciones y caché KV en fp16, y se reorganizó al formato de ficheros que espera transformers.js (`onnx/model_q4f16.onnx` más datos externos). El repositorio ocupa 0,6 GB, frente a los 1,06 GB de la variante de 1,4B con la misma receta.

Su relevancia actual radica en que demuestra que la traducción ja→en de calidad razonable (chrF 51,83 en FLEURS) puede ejecutarse íntegramente en un navegador de escritorio con GPU integrada, con latencias p50 de 0,27 s y un pico de memoria del proceso GPU de Chrome de 1,22 GB. Es la pieza de inferencia de la aplicación de navegador MimiVox.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) |
| Parametros totales | ~0,8 mil millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 RTN (bloque 32), activaciones y KV cache en fp16 |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | MIT (heredada del modelo base, copyright CyberAgent AI Lab) |
| Formato de pesos | ONNX (`onnx/model_q4f16.onnx` + datos externos), layout transformers.js |

## Arquitectura y entrenamiento

El modelo base cyberagent/CAT-Translate-0.8b es un transformer decoder-only de la familia Llama con unos 0,8B parámetros, especializado en traducción japonés→inglés. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

La innovación técnica de esta ficha está en la ruta de exportación: se generó con el model builder de onnxruntime-genai usando `-p int4 -e webgpu`, con cuantización int4 RTN de tamaño de bloque 32 y manteniendo activaciones y caché KV en fp16. Posteriormente se reorganizaron los ficheros al layout de transformers.js. Un detalle relevante es que `kv_cache_dim` se fijó a 80, que corresponde a la dimensión de cabeza del modelo. La tabla de embeddings en fp16 ocupa un único búfer de 262 MB, lo que impone requisitos mínimos sobre los límites de WebGPU (`maxBufferSize` y `maxStorageBufferBindingSize` de al menos 262.144.000 bytes, además de `shader-f16`).

## Capacidades

- Traducción japonés→inglés de frases y párrafos, tarea principal del modelo.
- Generación de texto autoregresiva con decodificación greedy validada en la evaluación publicada.
- Ejecución en navegador mediante transformers.js sobre WebGPU, sin servidor.
- Inferencia acelerada por GPU con caché KV en fp16.
- Soporte de los dos idiomas declarados (ja, en) únicamente.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción integrada en el navegador: la aplicación MimiVox lo usa para traducir ja→en en el propio cliente, eliminando la necesidad de enviar texto a un backend y reduciendo la latencia percibida.
- Extensiones y widgets web de traducción al vuelo: al ejecutarse con transformers.js y WebGPU, puede incrustarse en una extensión de navegador que traduzca contenido japonés seleccionado por el usuario sin salir de la página.
- Procesamiento de documentación japonesa en herramientas internas: un equipo puede traducir manuales o fichas técnicas ja→en localmente en un portátil con GPU integrada, con picos de memoria GPU de ~1,2 GB.
- Preprocesado de datos para pipelines de NLP: traducción masiva de corpus japoneses a inglés en estaciones de trabajo sin GPU dedicada, usando la variante int4 para maximizar el throughput (133 tok/s medidos en un Apple M5).
- Aplicaciones de escritorio Electron o Tauri: al ser ONNX, puede integrarse en aplicaciones de escritorio multiplataforma que necesiten traducción ja→en offline.
- Prototipado y demos educativas: sirve como ejemplo de referencia de cómo exportar y desplegar un modelo de traducción pequeño en WebGPU con transformers.js, útil para desarrolladores que quieran replicar la receta con otros modelos.

## Benchmarks y rendimiento

Los datos publicados por el autor se midieron en Chrome sobre un Apple M5 (WebGPU, Metal) con 100 frases del conjunto de desarrollo FLEURS ja→en, decodificación greedy y prohibiendo tokens de salida en japonés.

| Metrica | CAT 1.4B (misma receta) | Este modelo (0.8B) |
|---|---|---|
| chrF | 52,21 | 51,83 |
| Latencia p50 / p95 | 0,38 s / 0,67 s | 0,27 s / 0,48 s |
| Velocidad de decodificacion | 102 tok/s | 133 tok/s |
| Pico de memoria del proceso GPU de Chrome | 1,84 GB | 1,22 GB |
| Tamano de descarga | 1,06 GB | 0,64 GB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado a int4 ocupa 0,6 GB en disco; en ejecución, el pico de memoria del proceso GPU de Chrome medido es de 1,22 GB.
- GPU recomendadas: cualquier GPU con soporte de WebGPU y `shader-f16`; validado en Apple M5 (Metal). No se han publicado mediciones en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, siempre que el adaptador WebGPU exponga `maxBufferSize` y `maxStorageBufferBindingSize` de al menos 262.144.000 bytes (requisito derivado del búfer de embeddings fp16 de 262 MB).
- Opciones de despliegue: transformers.js sobre WebGPU en navegador; el artefacto es ONNX, por lo que también puede ejecutarse con onnxruntime-genai u otros runtimes ONNX, aunque no se documenta esa ruta.
- Latencia y throughput: p50 de 0,27 s y p95 de 0,48 s por frase; 133 tok/s de decodificación en Apple M5 con Chrome. No hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | chrF (FLEURS ja→en) | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| CAT-Translate-0.8b-onnx-q4f16 (este) | ~0,8B | no disponible | 51,83 | MIT | ONNX int4, transformers.js/WebGPU |
| CAT-Translate 1.4B (misma receta) | ~1,4B | no disponible | 52,21 | MIT (modelo base) | ONNX int4, transformers.js/WebGPU |
| cyberagent/CAT-Translate-0.8b | ~0,8B | no disponible | no disponible | MIT | safetensors (modelo base) |

La comparativa se limita a las variantes de la misma familia porque la información proporcionada no incluye datos de otros traductores ja→en comparables.

## Limitaciones y advertencias

- El modelo solo traduce japonés→inglés; no se documenta la dirección inversa ni otros pares de idiomas.
- transformers.js ignora el `byte_fallback` del tokenizer: los caracteres fuera del vocabulario deben codificarse como tokens de byte por parte del llamador, o los ids de token diferirán del tokenizer de referencia.
- Requiere un adaptador WebGPU con `shader-f16` y límites de búfer de al menos 262.144.000 bytes; en adaptadores que no los expongan, la carga fallará.
- No se dispone de información sobre sesgos, tasa de alucinación ni comportamiento en dominios especializados (legal, médico, técnico).
- No se documenta la longitud máxima de contexto, lo que impide garantizar el comportamiento en documentos largos.
- La licencia MIT permite uso comercial, pero se hereda del modelo base y debe conservarse la atribución a CyberAgent AI Lab según el fichero LICENSE.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados publicados.
- Las mediciones de rendimiento proceden de una única plataforma (Apple M5 con Chrome) y no deben extrapolarse sin verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rafazafar/CAT-Translate-0.8b-onnx-q4f16
- Modelo base: https://huggingface.co/cyberagent/CAT-Translate-0.8b
- transformers.js: https://github.com/huggingface/transformers.js
