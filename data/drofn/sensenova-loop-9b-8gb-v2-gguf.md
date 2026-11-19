# drofn/SenseNova-Loop-9B-8GB-v2-GGUF

## Resumen

SenseNova-Loop-9B-8GB-v2-GGUF es una cuantización GGUF del modelo SenseNova-Loop-9B, publicada por el usuario drofn. El modelo base lo desarrolla SenseNova y emplea una arquitectura de transformer con bucles (looped transformer) de aproximadamente 9.200 millones de parámetros. Esta versión v2 incorpora dos novedades respecto a la v1: la cabeza de predicción multi-token (MTP) para decodificación especulativa y un fichero alternativo con soporte opcional de entrada de imágenes mediante el proyector visual oficial.

El objetivo del autor es permitir la ejecución completa del modelo, incluidas todas las capas, en una GPU de consumo con 8 GB de VRAM, sin desbordamiento a memoria compartida del sistema. Para ello utiliza mezclas de cuantización asignadas por sensibilidad, con caché KV en q4_0 y un runtime de llama.cpp parcheado. En una RTX 4060 de 8 GB se alcanzan 47,8 tok/s de generación con MTP activado en el fichero de texto, y 53,5 tok/s en el fichero con visión.

El modelo está pensado para desarrolladores que necesitan desplegar localmente un modelo conversacional multimodal con contexto largo (hasta 104.448 tokens en la variante de texto) en hardware modesto. La licencia Apache-2.0 facilita su uso comercial, y los idiomas declarados son inglés, chino y turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer) |
| Parametros totales | 9.200.240.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 104.448 tokens (8GB-v2); 81.920 tokens (8GB-v2-Vision) |
| Tipos de cuantizacion | GGUF con mezclas por sensibilidad; caché KV en q4_0; cabeza MTP con matrices Q6_K, `eh_proj` Q8_0 y normas F32; proyector visual F16 |
| Idiomas soportados | en, zh, tr |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (5,76 GB texto; 5,19 GB visión; 0,92 GB mmproj) |

## Arquitectura y entrenamiento

El modelo base SenseNova-Loop-9B emplea una arquitectura de transformer con bucles, en la que el bloque se reutiliza iterativamente, lo que permite aumentar la profundidad efectiva sin incrementar proporcionalmente el número de parámetros. La cuantización GGUF mantiene esta topología y añade una cabeza de predicción multi-token (MTP) de 15 tensores y unos 208 MB, que actúa como un pequeño bloque decodificador adicional para generar borradores de tokens que el modelo principal verifica en un solo lote.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La innovación técnica destacable de esta publicación es la combinación de MTP con decodificación especulativa en llama.cpp (`--spec-type draft-mtp`), que según el autor incrementa la velocidad de generación entre 1,8 y 1,9 veces, con una tasa de aceptación de borradores del 71,9 % al 74,1 % en la prueba realizada. La cuantización usa mezclas asignadas por sensibilidad por tensor, con una divergencia KL media frente a Q8_0 de 0,0703/0,0762 (fichero de texto) y 0,1375/0,1213 (fichero de visión).

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 104.448 tokens).
- Razonamiento y generación de código: la prueba de velocidad del autor solicita una función Python y tres tests de pytest.
- Entrada de imágenes en la variante 8GB-v2-Vision: descripción de formas geométricas, posiciones y lectura de texto en imágenes (probado con imágenes sintéticas de 512×512 y 1920×1080).
- Decodificación especulativa mediante cabeza MTP integrada.
- Capacidades multilingües en inglés, chino y turco.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y uso conversacional.
- No se documenta soporte explícito de tool calling, function calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Asistencia de código en local: el modelo genera funciones y tests unitarios (el autor lo prueba con Python y pytest) en una RTX 4060 de 8 GB, lo que permite integrarlo en entornos de desarrollo sin GPU de datacenter.
- Procesamiento de documentos largos: con 104.448 tokens de contexto en el fichero de texto, se pueden analizar contratos, informes o bases de código completas y extraer hechos concretos; el autor verificó la recuperación de 3 de 3 hechos ocultos en un prompt de 102.903 tokens.
- Análisis de imágenes y facturas: la variante Vision lee texto en imágenes (probado con "INVOICE 2026-117 TOTAL 349 TL") y describe la posición de elementos, útil para digitalización de documentos o inspección visual básica.
- Chat multilingüe en inglés, chino y turco: adecuado para atención al cliente o asistentes en esos tres idiomas sin necesidad de infraestructura en la nube.
- Despliegue en estaciones de trabajo con GPU de consumo: al caber en 8 GB de VRAM con todas las capas en GPU, sirve para prototipado y demos locales con llama-server.
- Generación acelerada en producción de baja escala: con MTP activado se obtienen 47,8 tok/s en texto y 53,5 tok/s en visión, suficiente para asistentes interactivos en un solo usuario o pocos concurrentes.
- Experimentación con decodificación especulativa: la inclusión de la cabeza MTP y el runtime parcheado permiten estudiar tasas de aceptación y calidad frente a generación greedy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de velocidad y divergencia KL, que se recogen a continuación.

| Metrica | 8GB-v2 (texto) | 8GB-v2-Vision + mmproj |
|---|---|---|
| Generacion MTP off | 25,9 tok/s | 28,4 tok/s |
| Generacion MTP on | 47,8 tok/s | 53,5 tok/s |
| Borradores aceptados | 235/327 (71,9 %) | 238/321 (74,1 %) |
| KLD media vs Q8_0 (set 1 / set 2) | 0,0703 / 0,0762 | 0,1375 / 0,1213 |
| Prefill en contexto largo | 722 tok/s (102.903 tokens) | 767 tok/s (80.380 tokens) |
| Generacion en contexto largo | 20,2 tok/s | 27,3 tok/s |

Las mediciones se realizaron en una RTX 4060 de 8 GB bajo Windows, sin pantalla conectada, con ejecuciones únicas (no medianas), temperatura 0, thinking desactivado y `--spec-draft-n-max 2`.

## Requisitos de hardware

- VRAM estimada: 8 GB para el fichero de texto (5,76 GB de pesos) y para el de visión (5,19 GB de pesos más 0,92 GB de proyector), con caché KV en q4_0.
- GPU recomendadas: RTX 4060 de 8 GB es la plataforma medida por el autor; cualquier GPU con al menos 8 GB de VRAM debería poder ejecutar las mismas configuraciones, aunque no se aportan mediciones en otras tarjetas.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más, siempre que el driver no derive asignaciones a memoria compartida (el autor advierte que en Windows esto puede ocurrir y degradar el rendimiento).
- Opciones de despliegue: llama.cpp con runtime parcheado (llama-server) para soportar `--spec-type draft-mtp`; también es compatible con endpoints según los tags, aunque no se detalla la integración.
- Latencia y throughput: 47,8 tok/s (texto) y 53,5 tok/s (visión) con MTP en RTX 4060; 20,2 y 27,3 tok/s respectivamente en generación con contexto cercano al límite.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SenseNova-Loop-9B-8GB-v2 (este) | 9,2 B | 104.448 (texto) / 81.920 (visión) | Apache-2.0 | Cuantización GGUF para 8 GB, MTP y visión opcional |
| drofn/SenseNova-Loop-9B-8GB-GGUF (v1) | 9,2 B | 100K / 128K | Apache-2.0 | Sin cabeza MTP ni entrada de imágenes |
| sensenova/SenseNova-Loop-9B-GGUF (oficial) | 9,2 B | no disponible | Apache-2.0 | GGUF oficial del que se copia el proyector F16 |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- La tasa de aceptación de borradores MTP se midió con un único prompt de código; en otras tareas puede variar.
- Con MTP activado, la salida greedy no siempre es idéntica token a token a la de MTP desactivado: el autor observó una diferencia de una palabra en los primeros 300 caracteres en una ejecución.
- Las pruebas de visión se limitaron a dos imágenes sintéticas; no se ejecutó ningún benchmark de visión.
- En Windows, el driver NVIDIA puede mover asignaciones a memoria compartida del sistema en lugar de fallar, lo que reduce el rendimiento sin aviso evidente.
- El modelo solo declara inglés, chino y turco; no se garantiza un rendimiento adecuado en castellano.
- No se documentan evaluaciones de sesgos ni de tasa de alucinación.
- El uso comercial está permitido por la licencia Apache-2.0, pero el runtime parcheado de llama.cpp y la cabeza MTP deben verificarse en el entorno de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-v2-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- GGUF oficial con proyector F16: https://huggingface.co/sensenova/SenseNova-Loop-9B-GGUF
- Versión anterior v1: https://huggingface.co/drofn/SenseNova-Loop-9B-8GB-GGUF
- Ficha de referencia en free2aitools: https://free2aitools.com/model/drofn/sensenova-loop-9b-8gb-gguf
