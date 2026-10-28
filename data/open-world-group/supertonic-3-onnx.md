# open-world-group/Supertonic-3-ONNX

## Resumen

Supertonic-3-ONNX es un reempaquetado del modelo de síntesis de voz Supertonic 3 (Supertone Inc.), publicado por el grupo open-world-group, con el objetivo de hacerlo ejecutable directamente en el navegador mediante Transformers.js. El proyecto original está archivado y no dispone de build para Transformers.js, por lo que los grafos ONNX oficiales se han reorganizado en el esquema de tres modelos que espera la librería: codificador de texto (con predictor de duración), desruidificador latente (estimador de vectores) y decodificador de voz (vocoder). Los pesos son los mismos del modelo original; los ficheros `fp16` son una conversión a coma flotante de 16 bits de esos mismos pesos.

El modelo resuelve el problema de llevar un sistema TTS multilingüe de 31 idiomas a entornos web y edge sin infraestructura de GPU dedicada: se distribuye en tres precisiones (fp32 con 398 MB en total, fp16 con 200 MB y un `latent_denoiser` cuantizado a q8 de 66 MB) y genera audio mono a 44,1 kHz. La inferencia es iterativa y configurable (`num_inference_steps`, `speed`), y el modelo incluye diez voces predefinidas (F1–F5 y M1–M5) en formato de embeddings `.bin`.

Su relevancia actual es doble: por un lado, demuestra un patrón de portabilidad de modelos TTS a Transformers.js con WebGPU y WASM; por otro, documenta con detalle los compromisos de precisión y memoria de cada configuración (fp16 frente a fp32, q8 solo en el denoisificador). El repositorio tiene 0,7 GB y, en el momento de la consulta, 23 descargas y 0 likes, lo que indica una adopción todavía muy reducida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline TTS de tres etapas en ONNX: `text_encoder` (incluye predictor de duración), `latent_denoiser` (estimador de vectores) y `voice_decoder` (vocoder); familia de arquitectura interna no disponible |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; límite operativo de 300 caracteres por fragmento (120 para coreano y japonés) |
| Tipos de cuantización | fp32 (398 MB total), fp16 (200 MB total) y q8 únicamente en `latent_denoiser` (66 MB) |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi; etiqueta `na` para idioma desconocido |
| Licencia | OpenRAIL-M (Copyright (c) 2026 Supertone Inc.), con restricciones de uso que se mantienen en el reempaquetado |
| Formato de pesos | ONNX (fp32/fp16/q8) para los tres submodelos; embeddings de voz en `.bin` |
| Frecuencia de muestreo de salida | 44,1 kHz, mono |
| Voces disponibles | F1–F5 y M1–M5 en `voices/` |
| Librería / runtime | Transformers.js (`@huggingface/transformers`), backends WebGPU y WASM |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La arquitectura es un pipeline TTS en cascada compuesto por tres grafos ONNX independientes. El `text_encoder` transforma el texto (preprocesado por un tokenizer que reproduce el preprocesado oficial) y contiene además el predictor de duración, que determina la longitud de la secuencia acústica. El `latent_denoiser` actúa como estimador de vectores en un proceso iterativo de desruidificación latente cuyo coste se controla con `num_inference_steps` (el ejemplo de la model card usa 5 pasos). El `voice_decoder` es el vocoder que convierte la representación latente en audio PCM mono a 44,1 kHz. El pipeline oficial consta de cuatro modelos; este reempaquetado fusiona esos grafos en tres para encajar en el layout de Transformers.js, y la model card afirma que en fp32 las salidas coinciden exactamente con el pipeline oficial de cuatro modelos.

No hay información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni otras innovaciones de entrenamiento del modelo original. Tampoco se detalla el mecanismo interno de atención del codificador de texto ni el tipo de proceso generativo del desruidificador (difusión, flow matching u otro). Los scripts de conversión no forman parte del repositorio, por lo que la reproducibilidad del empaquetado no está garantizada. Sí se documenta explícitamente que los pesos no se han modificado y que la variante fp16 es una conversión numérica de los mismos, con una divergencia de aproximadamente el 0,1 % en la duración generada respecto a fp32 y la misma tasa de error de palabras medida con Whisper en un conjunto de prueba pequeño.

## Capacidades

- Síntesis de voz multilingüe en 31 idiomas, incluyendo español, inglés, coreano, japonés, árabe, hindi y la práctica totalidad de lenguas europeas.
- Selección de voz mediante embeddings externos: diez voces predefinidas (F1–F5 para voces femeninas, M1–M5 para masculinas).
- Control de velocidad del habla mediante el parámetro `speed` (el ejemplo oficial usa 1,05).
- Control del coste computacional mediante `num_inference_steps`, que permite intercambiar calidad por latencia.
- Salida de audio a 44,1 kHz en mono, adecuada para reproducción en web sin remuestreo adicional.
- Ejecución en navegador con WebGPU o WASM, y en Node.js, sin servidor de inferencia dedicado.
- Etiquetado explícito de idioma mediante el envoltorio `<lang>text</lang>`, con la etiqueta `na` para contenido de idioma desconocido o mezclado.
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni audio de entrada: es exclusivamente un modelo de texto a voz.

## Casos de uso

- Lectura por voz de artículos y documentación en el navegador: el modelo se carga con Transformers.js y WebGPU y sintetiza fragmentos de hasta 300 caracteres, lo que encaja con la paginación natural de un lector de contenidos sin enviar el texto a un servidor.
- Accesibilidad web para personas con discapacidad visual: al ejecutarse en el cliente con un peso de 200 MB en fp16, permite narración bajo demanda sin depender de APIs de terceros ni de conectividad constante una vez cacheado el modelo.
- Asistentes conversacionales multilingües en aplicaciones web: el soporte de 31 idiomas y la posibilidad de fijar el idioma con `<lang>` permiten una misma base de código para mercados con idiomas distintos, cambiando solo la etiqueta y el embedding de voz.
- Generación de audiolibros y pódcast automatizados: la salida a 44,1 kHz y la selección entre diez voces permiten producir narraciones por lotes con velocidad ajustable; conviene trocear el texto por párrafos para respetar el límite de 300 caracteres.
- Prototipado rápido de interfaces de voz en Node.js: la integración con el pipeline `text-to-speech` de Transformers.js reduce el esfuerzo de integración a unas pocas líneas, útil para validar un producto de voz antes de invertir en infraestructura.
- Aprendizaje de idiomas y práctica de pronunciación: la cobertura de lenguas como checo, croata, estonio, letone, lituano o esloveno es poco habitual en TTS abiertos, lo que lo hace útil para materiales de escucha en idiomas con pocos recursos comerciales.
- Síntesis en entornos con recursos limitados: con el `latent_denoiser` en q8 y el resto en fp32 se reduce el consumo de memoria aproximadamente un 40 % y se acelera la inferencia 2,6 veces en el backend WASM, según la model card, lo que habilita su uso en portátiles sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni métricas TTS como MOS) en la información disponible. Los únicos datos cuantitativos aportados por el autor son comparativas internas entre precisiones:

| Comparación | Resultado declarado |
|---|---|
| fp32 (tres modelos) frente a pipeline oficial de cuatro modelos | Salidas idénticas |
| fp16 frente a fp32 | ~0,1 % de diferencia en duración; misma tasa de error de palabras con Whisper en un conjunto de prueba pequeño |
| q8 `latent_denoiser` + encoder y vocoder en fp32 frente a fp32 completo | Misma tasa de error de palabras con Whisper; ~40 % menos memoria y 2,6 veces más rápido (backend WASM) |
| q8 aplicado también al vocoder | No recomendado: el habla resulta ininteligible |

No se especifica el tamaño ni la composición del conjunto de prueba empleado para estas mediciones, ni las condiciones de hardware en las que se obtuvo el factor de aceleración de 2,6 veces.

## Requisitos de hardware

- Memoria estimada: 398 MB de pesos en fp32, 200 MB en fp16 y 66 MB para el `latent_denoiser` en q8. El consumo real de memoria es superior al tamaño de los pesos por el estado del runtime y los buffers intermedios; no se publica una cifra de VRAM o RAM pico.
- GPU: cualquier GPU con soporte de WebGPU en el navegador; en servidor no se documentan modelos concretos (A100, H100, RTX 4090) ni requisitos de VRAM específicos.
- Cabe en GPU de consumo: sí, por el tamaño de los pesos (200 MB en fp16); no se especifica el rendimiento por modelo de tarjeta.
- CPU: viable mediante el backend WASM. En este backend, fp16 se convierte a fp32 en la carga y consume más memoria que fp32, por lo que la configuración recomendada es encoder y vocoder en fp32 con el denoisificador en q8.
- Despliegue: Transformers.js en navegador (WebGPU/WASM) y Node.js. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline TTS en ONNX.
- Latencia y throughput: no disponibles en cifras absolutas. El único dato relativo es la mejora de 2,6 veces en velocidad con la configuración q8 del denoisificador en WASM. El coste por síntesis es proporcional a `num_inference_steps` (5 pasos en el ejemplo oficial).

## Comparativa con modelos similares

No se dispone de datos verificables sobre modelos comparables en la información proporcionada (ni parámetros, ni contexto, ni rendimiento, ni licencia de alternativas). Por tanto, la comparación cuantitativa se marca como no disponible.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Supertonic-3-ONNX | no disponible | no aplica (300 caracteres por fragmento) | solo comparativas internas fp32/fp16/q8 | OpenRAIL-M | ONNX para Transformers.js |
| Alternativas TTS de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

Como referencia cualitativa, la propuesta diferencial de este modelo es la ejecución en navegador con licencia OpenRAIL-M y cobertura de 31 idiomas; cualquier comparación de calidad frente a otros sistemas TTS requeriría una evaluación MOS propia que no está publicada.

## Limitaciones y advertencias

- Licencia OpenRAIL-M: las restricciones de uso basadas en el comportamiento del lanzamiento original se mantienen en el reempaquetado. Es necesario revisar el fichero `LICENSE` antes de un uso comercial, ya que OpenRAIL-M no es una licencia permisiva al estilo Apache o MIT.
- El proyecto upstream (Supertonic 3) está archivado: no cabe esperar correcciones, mejoras ni soporte por parte de Supertone Inc.
- Repositorio de terceros: el empaquetado lo mantiene open-world-group y los scripts de conversión no se incluyen, lo que dificulta auditar o reproducir el proceso. Con 23 descargas y 0 likes, la validación comunitaria es prácticamente nula.
- Dependencia estricta del formato de entrada: el texto debe envolverse en `<lang>text</lang>`; sin esta envoltura el preprocesado no se comporta como el oficial.
- Límite de longitud: hay que trocear el texto en fragmentos de 300 caracteres como máximo, y de 120 para coreano y japonés. No hay gestión automática de contexto largo ni de coherencia prosódica entre fragmentos.
- Cuantización delicada: cuantizar el vocoder a q8 hace el habla ininteligible; solo el `latent_denoiser` admite q8 de forma segura.
- En backend WASM, cargar fp16 incrementa el consumo de memoria respecto a fp32 por el upcast en la carga, un comportamiento contraintuitivo que puede provocar fallos en dispositivos con poca RAM.
- Riesgo de errores de pronunciación y prosodia en textos con números, siglas, nombres propios o cambios de idioma dentro de una misma frase; la model card no documenta ningún mecanismo de normalización de texto más allá del preprocesado del tokenizer.
- La etiqueta `na` para idioma desconocido evita fallos, pero no garantiza una pronunciación correcta en contenido multilingüe o mal etiquetado.
- No se publican métricas de calidad subjetiva (MOS) ni evaluaciones amplias de robustez; las únicas cifras provienen de un conjunto de prueba pequeño no descrito.
- Sesgos: no hay información disponible sobre sesgos de género, acento o representación de las voces F1–F5 y M1–M5.
- Al ser un modelo exclusivamente TTS, no ofrece moderación de contenido ni verificación factual: puede sintetizar cualquier texto que reciba, lo que exige filtrado previo en aplicaciones expuestas a usuarios finales.

## Enlaces

- HuggingFace: https://huggingface.co/open-world-group/Supertonic-3-ONNX
- Modelo base: https://huggingface.co/supertone-oss-archive/supertonic-3
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Los resultados de búsqueda web proporcionados no contienen enlaces relevantes sobre este modelo (corresponden a entidades no relacionadas); no se dispone de paper, blog, repositorio de código ni demo adicionales.
