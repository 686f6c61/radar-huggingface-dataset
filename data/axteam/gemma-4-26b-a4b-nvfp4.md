# axteam/gemma-4-26B-A4B-NVFP4

## Resumen

`axteam/gemma-4-26B-A4B-NVFP4` es una cuantización de 4 bits del modelo multimodal `google/gemma-4-26B-A4B` de Google DeepMind, publicada por el usuario axteam y orientada específicamente al servicio eficiente con vLLM. Se trata de una derivación, no de un modelo entrenado desde cero: conserva el tokenizador, la plantilla de chat, el procesador y la configuración de generación del original, y solo añade un bloque `quantization_config` al `config.json`.

El modelo base es un Mixture-of-Experts de la familia Gemma 4 con 25.805.936.206 parámetros totales y una configuración de 8 expertos activos sobre 128 totales más 1 experto compartido, según la model card. La nomenclatura A4B del nombre apunta a un régimen de aproximadamente 4.000 millones de parámetros activos por token, aunque el dato exacto no se explicita en la información disponible.

Su relevancia es de tipo operativo: emplea el esquema NVFP4 (W4A4, FP4 E2M1) con cuantización de pesos y activaciones, lo que reduce la huella en disco a unos 16 GB frente a los 17,2 GB del repositorio, a cambio de una pérdida de calidad que el propio autor reconoce como un intercambio por la mitad de espacio. El formato es específico de hardware Blackwell con tensor cores FP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, Mixture-of-Experts (8 expertos activos de 128 totales, mas 1 compartido) |
| Parametros totales | 25.805.936.206 (~25,8 mil millones) |
| Parametros activos | no disponible (la nomenclatura A4B del modelo base sugiere ~4.000 millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4: pesos FP4 (E2M1) con grupo de tamano 16, escala FP8 (E4M3) mas escala global FP32 por tensor; activaciones FP4. Vision tower, proyeccion de vision, embeddings de tokens, router MoE, normas y MLP compartida se mantienen en BF16 |
| Idiomas soportados | no disponible (el conjunto de calibracion era mixto ingles/coreano, con sesgo hacia coreano) |
| Licencia | apache-2.0 en la etiqueta del repositorio; la model card remite a la licencia Gemma 4 de Google |
| Formato de pesos | safetensors con esquema compressed-tensors `nvfp4-pack-quantized` |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado por axteam: es una cuantizacion post-entrenamiento del checkpoint `google/gemma-4-26B-A4B` fijado en el commit `24548b6`. La arquitectura subyacente es un transformer Mixture-of-Experts de Gemma 4 con enrutado por token sobre 128 expertos mas uno compartido, del que se activan 8 por paso, y con torre de vision integrada, ya que la tarea declarada del pipeline es `image-text-to-text`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) del modelo original.

La innovacion tecnica de esta ficha es exclusivamente el proceso de cuantizacion. La calibracion se realizo con 256 muestras de sesgo coreano que, en el caso de la variante instruct, incluyen 32 respuestas autogeneradas en modo thinking. Los pesos y las activaciones se cuantizan a FP4 con granularidad de grupo 16 y doble escala (FP8 E4M3 por grupo y FP32 global por tensor), mientras que un conjunto reducido de componentes sensibles a la precision queda en BF16: torre y proyeccion de vision, embeddings de tokens (atados a `lm_head`), router MoE, todas las normas y la MLP compartida. El autor indica que la fidelidad se verifico frente al original en BF16 mediante perplejidad y acuerdo top-1 en un conjunto interno mixto ingles/coreano, sin publicar cifras.

## Capacidades

- Generacion de texto conversacional multi-turno: el tokenizador y la plantilla de chat son identicos a los del modelo base, incluida la plantilla corregida por Google en julio de 2026.
- Procesamiento conjunto de imagen y texto: la tarea declarada del pipeline es `image-text-to-text` y la torre de vision se conserva en BF16, lo que preserva la ruta multimodal.
- Modo thinking: la model card menciona respuestas autogeneradas en modo thinking dentro del conjunto de calibracion de la variante instruct, lo que implica su existencia en el modelo base.
- Servicio de alto rendimiento con vLLM: el autor proporciona comandos de despliegue y parametros de muestreo recomendados por Google (`temperature=1.0`, `top_p=0.95`, `top_k=64`).
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; solo consta que la calibracion se hizo con datos mayoritariamente en coreano y parcialmente en ingles.
- Capacidades de audio: no disponible.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede recibir capturas de pantalla, fotos de producto o imagenes de error enviadas por el usuario junto con texto, y responder en el mismo hilo conversacional gracias a la plantilla de chat del modelo base.
- Digitalizacion de documentos con extraccion semantica: a partir de fotos o escaneos de facturas, albaranes o formularios, el modelo puede devolver los campos relevantes en texto estructurado, aprovechando la ruta de vision conservada en BF16.
- Soporte tecnico de campo: un tecnico envia una fotografia de un equipo o de un panel de error y el modelo genera un diagnostico o los pasos de comprobacion, integrándose en una aplicacion movil que consume el endpoint de vLLM.
- Catalogacion de producto en comercio electronico: generacion automatica de titulos, descripciones y atributos a partir de las imagenes de un catalogo, con el modelo desplegado como servicio por lotes.
- Moderacion de contenido multimodal: clasificacion y descripcion de imagenes acompanadas de texto para detectar contenido no permitido, usando el modelo como clasificador generativo con salida controlada.
- Despliegue de bajo coste por capacidad en cluster Blackwell: al ocupar unos 16 GB en disco y reducir el ancho de banda de memoria necesario por peso, permite servir una mayor cantidad de replicas por GPU en infraestructura con tensor cores FP4.
- Asistente interno sobre documentacion tecnica: consultas sobre manuales y diagramas donde el usuario adjunta una captura y el modelo responde con texto, siempre que la ventana de contexto del modelo base lo permita (dato no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion mencionada por el autor es interna y cualitativa: se compararon las variantes cuantizadas contra el original en BF16 usando perplejidad y acuerdo top-1 de siguiente token sobre un conjunto mixto ingles/coreano, y se concluye que las variantes de 8 bits (AWQ INT8 y FP8) se mantienen mas cerca del original, mientras que las de 4 bits (AWQ INT4 y NVFP4) reducen la huella aproximadamente a la mitad a cambio de ceder algo de calidad. No se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de ningun otro benchmark.

## Requisitos de hardware

- Huella de pesos: entre 16,0 GB en disco segun la model card y 17,2 GB de tamano total del repositorio. La VRAM necesaria para inferencia es superior, ya que hay que sumar cache KV, activaciones y el estado del servidor; el valor exacto no esta disponible.
- GPU compatibles: el autor indica que el formato NVFP4 es exclusivo de Blackwell y requiere tensor cores FP4 para alcanzar la velocidad completa, citando B200 y RTX PRO. La compatibilidad con generaciones anteriores de GPU, o el rendimiento degradado en ellas, no esta documentada.
- GPU de consumo: no disponible. El autor no confirma ni descarta el funcionamiento en tarjetas de consumo Blackwell, y no se publican requisitos minimos de memoria.
- Opciones de despliegue: vLLM es el unico backend documentado, tanto por linea de comandos (`vllm serve axteam/gemma-4-26B-A4B-NVFP4`) como por API de Python. No hay instrucciones para llama.cpp, Ollama, TGI ni otros motores, y el esquema `compressed-tensors` `nvfp4-pack-quantized` limita en la practica las alternativas.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo, tiempo hasta el primer token ni escalado por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Huella | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| axteam/gemma-4-26B-A4B-NVFP4 | 25,8 mil millones totales, MoE 8/128 + 1 compartido | no disponible | NVFP4 W4A4, grupo 16 | ~16 GB en disco | apache-2.0 en etiqueta, sujeta a licencia Gemma 4 | Publicado en HuggingFace, 0 descargas, 0 likes |
| google/gemma-4-26B-A4B (base) | 25,8 mil millones totales, misma configuracion MoE | no disponible | BF16 sin cuantizar | no disponible | licencia Gemma 4 | Modelo de referencia de Google DeepMind |
| Variantes AWQ INT8 / FP8 de axteam | misma base | no disponible | 8 bits | no disponible | licencia Gemma 4 | Mencionadas en la model card; el autor indica que son las mas fieles al original |
| Variante AWQ INT4 de axteam | misma base | no disponible | 4 bits | no disponible | licencia Gemma 4 | Mencionada en la model card; el autor la situa en el mismo intercambio calidad/espacio que NVFP4 |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de rendimiento entre estas variantes y el modelo base.

## Limitaciones y advertencias

- Perdida de calidad frente al original: el propio autor reconoce que las variantes de 4 bits ceden precision respecto a las de 8 bits y al modelo en BF16. No cuantifica esa perdida.
- Sesgo de calibracion: las 256 muestras usadas son mayoritariamente coreanas, con 32 respuestas autogeneradas en modo thinking. Esto puede sesgar el comportamiento de la cuantizacion hacia ese idioma y ese estilo de respuesta, sin que se hayan publicado evaluaciones en castellano u otros idiomas.
- Riesgo de alucinacion: no se han publicado mediciones de fidelidad factual ni de tasas de alucinacion, ni para el modelo base ni para esta cuantizacion.
- Restriccion de hardware: el esquema NVFP4 requiere, segun el autor, tensor cores FP4 de arquitectura Blackwell para rendir a plena velocidad. Esto limita el despliegue en infraestructura anterior y reduce la portabilidad frente a formatos como GGUF o AWQ.
- Ambiguedad de licencia: la etiqueta del repositorio indica apache-2.0, pero la model card remite explicitamente a la licencia Gemma 4 de Google como normativa aplicable al tratarse de un derivado. Antes de un uso comercial conviene revisar esa licencia, ya que puede imponer condiciones distintas a las de Apache 2.0.
- Ausencia de validacion externa: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia (10 de octubre de 2026), sin historial de uso en produccion.
- Informacion incompleta: no se documentan la longitud de contexto, los idiomas soportados, las capacidades de tool calling ni el rendimiento en GPU distintas de las citadas.
- Compatibilidad de tokenizador: se declara byte a byte identica al original, incluida la plantilla de chat corregida por Google en julio de 2026; cualquier codigo que dependa de una version anterior de la plantilla podria comportarse de forma distinta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/gemma-4-26B-A4B-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B (commit `24548b6`)
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio de compressed-tensors: no disponible en la informacion proporcionada
- Documentacion de vLLM: no disponible en la informacion proporcionada
- Papers, blogs o demos adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo, unicamente paginas de anuncios clasificados sin relacion.
