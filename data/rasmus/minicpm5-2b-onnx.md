# RASMUS/MiniCPM5-2B-ONNX

## Resumen

MiniCPM5-2B es un modelo de lenguaje denso de 2B parámetros desarrollado por OpenBMB dentro de la serie MiniCPM5, optimizado para despliegue en dispositivos locales y escenarios con recursos limitados. La versión aquí descrita, `RASMUS/MiniCPM5-2B-ONNX`, es una exportación y cuantización de ese modelo al formato ONNX con pesos int4 (q4f16), realizada por el usuario RASMUS con el objetivo concreto de que pueda ejecutarse en navegadores a través de WebGPU usando Transformers.js. Se trata de una adaptación de un modelo bilingüe (inglés y chino) con licencia Apache-2.0.

La importancia de esta ficha radica en que, según la model card, no existía previamente una exportación de la variante 2B que pudiera cargarse en un navegador; las exportaciones oficiales de ONNX cubrían únicamente la versión 1B y presentaban una arquitectura incompatible con Transformers.js. Esta conversión corrige esos problemas, añade GroupQueryAttention con cuantización int4 y permite la ejecución local sin servidor. El modelo base es un transformer denso de estilo Llama con 42 capas, dimensión oculta de 2048 y una ventana de contexto de 131072 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso estilo Llama con GroupQueryAttention (GQA) |
| Parametros totales | 2B (modelo base openbmb/MiniCPM5-2B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 131072 tokens |
| Tipos de cuantizacion | q4f16 (pesos int4 con grafico fp16); el modelo base usa bf16 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX con external data (archivo `onnx/model_q4f16.onnx` de 316 KB para el grafo y `onnx_data` de 1.83 GB para los pesos) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 2B parámetros que sigue la receta de MiniCPM5, descrito en el repositorio de OpenBMB como "dense 2B Transformer" y diseñado para despliegue on-device. La arquitectura es de tipo vanilla Llama: 42 capas, dimensión oculta de 2048, GQA con 16 cabezas de consulta y 2 cabezas de clave/valor, dimensión de cabeza de 128, vocabulario de 130560 tokens, embeddings sin atar (`tie_word_embeddings: false`), RoPE con theta 5e6 y contexto máximo de 131072 tokens. No se han proporcionado detalles sobre el dataset de entrenamiento, número de tokens, ni procesos de alineación como RLHF o DPO.

La adaptación a ONNX se realizó con `onnxruntime-genai` 0.15.2 usando la opción `-e webgpu`, que selecciona la rama de `GroupQueryAttention` (con RoPE fusionado) en lugar de la `MultiHeadAttention` que genera el proveedor CPU. Tras la conversión, el autor aplicó tres correcciones manuales: fijar la dimensión de la caché KV para que Transformers.js la resuelva correctamente, mover la plantilla de chat a `tokenizer_config.json` y eliminar una línea muerta de la plantilla que empleaba un filtro `min` no soportado por `@huggingface/jinja`. El resultado es un grafo de 473 nodos con 211 operaciones `MatMulNBits`, 42 `GroupQueryAttention`, sin bucles `Scan`/`Loop` ni entrada adicional de `position_ids`.

## Capacidades

- Generacion de texto en ingles y chino, siendo los unicos idiomas soportados por el modelo base.
- Soporte de tool calling mediante llamadas a funciones en formato XML, no en el formato Pythonic que emiten otros modelos.
- Ejecucion en el navegador a traves de WebGPU con Transformers.js, utilizando el pipeline `text-generation` y dispositivo `webgpu`.
- Ventana de contexto larga de 131072 tokens, apta para procesar documentos extensos y mantener conversaciones multi-turno.
- Carga de sesion en caliente con caché KV en fp16, declarada en `transformers.js_config`.
- No se documentan capacidades de vision ni de audio; es un modelo puramente textual.

## Casos de uso

- Asistentes de chat privados en el navegador: el modelo puede ejecutarse integramente en el cliente con WebGPU, lo que permite construir chatbots de conversacion sin enviar datos a un servidor, ideal para aplicaciones de atencion al cliente con requisitos de privacidad.
- Herramientas de analisis de documentos largos: gracias a su contexto de 131072 tokens, puede resumir, extraer informacion o responder preguntas sobre contratos, informes tecnicos o articulos extensos en ingles o chino desde una pagina web.
- Aplicaciones de soporte bilingüe en la empresa: el modelo entiende y genera texto en ingles y chino, por lo que resulta util en plataformas de atencion al usuario que operan en ambos idiomas, con despliegue local para reducir costes de inferencia.
- Prototipado rapido de aplicaciones de IA sin backend: con Transformers.js, se puede crear un demo funcional de generacion de texto en minutos, sin necesidad de gestionar infraestructura ni dependencias de servidor.
- Herramientas de desarrollo asistidas por funciones: el soporte de tool calling en XML permite integrar el modelo en asistentes que invocan APIs externas, como consultas a bases de datos o generacion de codigo, dentro de un entorno de navegador.
- Educacion y formacion local: el modelo puede montarse en laptops o estaciones de trabajo con GPU compatible con WebGPU y shader-f16 para ejercicios de NLP, analisis de textos o ensenanza de conceptos de LLMs sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye mediciones de rendimiento de inferencia realizadas en una RTX 4080 Laptop con Chromium 152 en Windows, usando Transformers.js 4.2.0 sobre onnxruntime-web WebGPU, con ejecuciones calientes y descartando la primera ejecucion de cada longitud de prompt:

| Medicion | Valor |
|---|---|
| Prefill, prompt de 1024 tokens | 0.395 ms / token |
| Prefill, prompt de 512 tokens | 0.411 ms / token |
| Prefill, prompt de 128 tokens | 0.611 ms / token |
| Decode | 24.1 ms / token (41.6 tok/s) |
| Primer token, prompt de 64 tokens | 199 ms |
| Carga de sesion, caché caliente | 6.5 s |

Estos valores corresponden a una unica GPU y no deben generalizarse a otros entornos.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados q4f16 ocupan 1.83 GB, mas 316 KB de grafo; la tabla de embeddings no se cuantiza y supone unos 535 MB adicionales. En total se necesitan al menos unos 2.5 GB de VRAM para los pesos y la caché KV, sin contar el overhead del runtime.
- GPU recomendadas: cualquier GPU con soporte WebGPU y la feature `shader-f16`. La medicion de referencia se realizo en una RTX 4080 Laptop; se espera que funcionen tarjetas como RTX 30/40 series, AMD RDNA3, iGPUs modernos y Apple Silicon.
- Si cabe en consumer GPU: si, en equipos con GPU dedicada de gama media o alta, y tambien en portatiles de gama alta con graficos integrados compatibles.
- Opciones de despliegue: Transformers.js con `device: 'webgpu'` y `dtype: 'q4f16'` es la via principal. Tambien puede servirse mediante onnxruntime-web en aplicaciones web, o integrarse en frameworks como Node.js con onnxruntime-web.
- Latencia: segun la medicion de la model card, el decode es de 24.1 ms por token (41.6 tok/s) y el prefill de 0.395 ms por token para prompts largos; la carga inicial de sesion en caché caliente tarda 6.5 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad ONNX / WebGPU |
|---|---|---|---|---|
| RASMUS/MiniCPM5-2B-ONNX | 2B | 131072 | Apache-2.0 | Si; GQA, q4f16, carga en Transformers.js |
| openbmb/MiniCPM5-2B (base) | 2B | 131072 | Apache-2.0 | No; pesos bf16 originales, sin export ONNX descrita |
| MiniCPM5-1B (export ONNX oficial) | 1B | no disponible | Apache-2.0 | Si, pero con MultiHeadAttention y layout no resuelto por Transformers.js |
| nicolasembleton/MiniCPM5-2B-onnx | 2B | 131072 | Apache-2.0 | Si, con weights ONNX en shards externos; no se detalla compatibilidad WebGPU |

La principal diferencia frente a las exportaciones ONNX oficiales de la serie es que esta version 2B incorpora GroupQueryAttention y una cuantizacion int4 que funciona en el navegador, mientras que la exportacion 1B publica una arquitectura con `MultiHeadAttention` y un formato de datos que Transformers.js no resuelve segun la model card.

## Limitaciones y advertencias

- Idiomas limitados: solo ingles y chino; otros idiomas no estan soportados por el modelo base.
- Cuantizacion con perdida: los pesos int4 alteran las salidas con respecto al bf16 original. El autor solo realizo una comprobacion puntual en CPU, por lo que la calidad no ha sido evaluada de forma exhaustiva.
- Formato de tool calls en XML: un parser escrito para el formato Pythonic (JSON) de otros modelos no funcionara con este.
- Dependencia de WebGPU con `shader-f16`: los dispositivos GPU sin esa caracteristica no pueden ejecutar el modelo.
- Riesgo de alucinacion: al ser un modelo de lenguaje de 2B, puede generar contenido no factual, aunque no se han publicado evaluaciones especificas sobre este aspecto.
- Sesgos potenciales: no se han documentado sesgos concretos, pero el entrenamiento en dos idiomas puede acarrear sesgos culturales asociados a las fuentes de datos.
- Carga inicial lenta: la sesion tarda 6.5 s en cargar con caché caliente en la GPU de referencia, lo que penaliza las aplicaciones de arranque frecuente.
- Redistribucion de pesos: este repositorio no contiene pesos reentrenados ni ajustados; es una conversion y cuantizacion bajo Apache-2.0, sin garantias de soporte.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/RASMUS/MiniCPM5-2B-ONNX
- Modelo base openbmb/MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio GitHub de OpenBMB/MiniCPM: https://github.com/OpenBMB/MiniCPM
- Libreria Transformers.js: https://github.com/huggingface/transformers.js
- Exportacion ONNX alternativa de la serie MiniCPM: https://huggingface.co/nicolasembleton/MiniCPM5-2B-onnx
