# infosave/Qwen3.8-27B-Turbo-cmf

## Resumen

Qwen3.8-27B-Turbo-cmf es una cuantización de 4 bits del modelo Qwen/Qwen3.8-27B, publicada por el usuario infosave bajo el formato propietario CMF (Cortiq Model File) para el motor de inferencia cortiq, escrito en Rust y sin dependencias de Python ni de frameworks de machine learning. El objetivo del autor no es solo comprimir los pesos, sino controlar el consumo de memoria de dispositivo en prompts largos: según la model card, un prompt de 64 000 tokens ocupa 15-16 GB frente a los 22,8 GB del fichero estándar del mismo modelo.

La innovación principal es una gestión de la caché de atención clave-valor que el autor describe como un «techo fijo»: las primeras 8192 filas del prompt se procesan con atención exacta en la tarjeta (4096 en una GPU de 16 GB) y las claves y valores de las filas posteriores se descargan a RAM o SSD. Antes de las últimas 512 filas se construye un «campo lejano» (far field) que conserva las primeras 4 filas y las últimas 1800 exactas, y el resto se representa mediante 32 puntos de referencia por cabeza de atención. Además, se mantienen exactas las 248 filas con mayor puntuación por lo que las capas hacen con ellas, para no perder datos críticos como contraseñas o códigos.

El modelo es relevante para desarrolladores que necesitan ejecutar un modelo de 27 000 millones de parámetros con contexto largo en GPUs de consumo o en tarjetas profesionales de gama media, sin acceso a clústeres de varios aceleradores. La licencia es Apache 2.0 y los idiomas declarados son inglés, ruso y chino. El repositorio ocupa 14,3 GB y acumula 407 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B); cuantización CMF de 4 bits con cabecera MTP para decodificación especulativa |
| Parametros totales | 27 000 millones (modelo base); tamaño del fichero cuantizado: 14,3 GB |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 131 072 tokens configurable con `CMF_MAX_SEQ`; por defecto 32 768 tokens en el servidor; atención exacta en las primeras 8192 filas (4096 en GPU de 16 GB) |
| Tipos de cuantizacion | Q4TP (4 bits, formato CMF propietario) |
| Idiomas soportados | Inglés (en), ruso (ru), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (Cortiq Model File), fichero único `qwen38-27b-turbo.cmf` |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27 000 millones de parámetros desarrollado por Qwen. Sobre él, infosave aplica una cuantización de 4 bits en formato CMF (Q4TP) que reduce el fichero a 14,3 GB. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO; esos datos corresponden a la model card de Qwen/Qwen3.8-27B, no incluida en la información proporcionada.

La innovación técnica del fichero Turbo reside en la gestión de la caché KV y en la decodificación especulativa. La atención se divide en dos regímenes: un tramo inicial procesado de forma exacta en la GPU y un «campo lejano» que comprime las filas intermedias en 32 puntos de referencia por cabeza, manteniendo exactas las primeras 4 filas, las últimas 1800 y las 248 filas con mayor puntuación. Las claves y valores de las filas intermedias se descargan a RAM o SSD a medida que se leen, de modo que la memoria de dispositivo y el coste por token dejan de crecer con la longitud del texto. La cabecera MTP (multi-token prediction) del modelo genera tokens borrador que la GPU verifica en un lote, y el campo lejano solo se actualiza con los tokens aceptados; según el autor, el texto greedy es idéntico con y sin borradores. El autor cita una solicitud de patente (n.º 19/738,763) sobre este mecanismo.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.8-27B soporta tareas de razonamiento general, con modo de pensamiento (`enable_thinking`) activable o desactivable por petición.
- Procesamiento de contexto largo: maneja prompts de hasta 131 072 tokens configurando `CMF_MAX_SEQ`, con consumo de memoria de dispositivo acotado.
- Recuperación exacta de datos críticos: según la model card, hechos plantados en 100 000 caracteres se recuperan 8 de 8 veces, incluidos contraseñas y códigos.
- Generación de resúmenes extensos: el autor reporta la escritura de resúmenes de 100 000 caracteres a 80 tok/s en una RTX 3090 vía CUDA.
- Decodificación especulativa: activada con `--greedy` o `temperature: 0`, usando la cabecera MTP del modelo.
- Servidor compatible con la API de OpenAI: endpoints `/v1/chat/completions`, `/v1/completions`, `/v1/models` y `/healthz`, con streaming y panel web.
- Multilingüismo: inglés, ruso y chino declarados.
- No se dispone de información sobre soporte de tool calling, function calling, agentes multi-paso, visión o audio en la información proporcionada.

## Casos de uso

- Resumen de documentos extensos: el modelo puede procesar informes de decenas de miles de tokens en una sola pasada gracias al campo lejano y a la descarga de la caché KV a RAM o SSD, manteniendo un consumo de 15-16 GB en prompts de 64 000 tokens.
- Análisis de contratos y documentación legal: la conservación exacta de 248 filas puntuadas y de las últimas 1800 filas permite recuperar cláusulas, cifras y códigos concretos sin que se pierdan en la compresión del campo lejano.
- Extracción de credenciales y códigos en textos largos: el autor reporta recuperación 8 de 8 de hechos plantados en 100 000 caracteres, lo que lo hace adecuado para tareas donde la exactitud literal es crítica.
- Asistencia en investigación con corpus multilingües: al soportar inglés, ruso y chino, puede resumir y comparar documentación técnica en esos tres idiomas dentro de una misma conversación.
- Despliegue en estaciones de trabajo con GPU de 16 GB: una RTX 2000 Ada ejecuta el modelo vía CUDA manteniendo 15,0 GB de uso y alcanza 175 s hasta el primer token en un prompt de 64 000 tokens, con 94 tok/s de generación.
- Servicio local compatible con OpenAI: `cortiq serve` expone el modelo en `http://127.0.0.1:8080/v1`, de modo que cualquier cliente OpenAI puede usarlo sin cambios de código, con streaming y temperatura 0 para respuestas deterministas.
- Procesamiento por lotes en SSD: con `--o1-spill` el modelo puede ejecutarse incluso con RAM limitada, volcando parte del estado a un SSD rápido, útil para entornos con restricciones de memoria.
- Generación de resúmenes largos en producción: en una RTX 3090 vía CUDA el modelo escribe resúmenes de 100 000 caracteres a 80 tok/s, adecuado para pipelines de síntesis documental.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de rendimiento del motor cortiq (`cortiq bench --core`, 60 tokens tras un prompt de la longitud indicada), no benchmarks académicos:

| Escenario | Hardware | Prompt | TTFT | Generación |
|---|---|---|---|---|
| Turbo vía CUDA | RTX 2000 Ada 16 GB | 64 000 tokens | 175 s | 94 tok/s |
| Turbo vía Vulkan | RTX 5090 | 64 000 tokens | 177 s | 92 tok/s |
| Turbo vía CUDA | RTX 3090 | Resumen de 100 000 caracteres | No disponible | 80 tok/s |
| Memoria de dispositivo | RTX 2000 Ada 16 GB | 64 000 tokens | No aplica | 15,0 GB estables |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 15-16 GB para prompts de 64 000 tokens con el fichero Turbo; 22,8 GB con el fichero estándar del mismo modelo.
- GPU recomendadas: RTX 2000 Ada (16 GB) vía CUDA, RTX 3090 vía CUDA, RTX 5090 vía Vulkan. El autor indica que la RTX 2000 Ada iguala a la RTX 5090 a partir de 16 000 tokens.
- GPU de consumo: cabe en tarjetas de 16 GB o más; en tarjetas de 16 GB la atención exacta se limita a las primeras 4096 filas.
- Opciones de despliegue: motor cortiq (CLI `cortiq run` y servidor `cortiq serve`), con backends Vulkan, DX12, Metal y CUDA. Requiere cortiq 0.8.59 o superior (0.8.71 o superior para CUDA) y, en CUDA, `libnvrtc` y `libcublas` 12.x en tiempo de ejecución.
- Modo de bajo consumo de RAM: `--o1-spill /ruta/ssd` vuelca parte del estado a un SSD rápido.
- Latencia y throughput: 175 s hasta el primer token en un prompt de 64 000 tokens (RTX 2000 Ada, CUDA) y 94 tok/s de generación; 177 s y 92 tok/s en RTX 5090 vía Vulkan.
- Contexto máximo configurable: `CMF_MAX_SEQ=131072` para servir hasta 131 072 tokens; por defecto 32 768.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Motor |
|---|---|---|---|---|---|
| Qwen3.8-27B-Turbo-cmf | 27 000 M | Hasta 131 072 (configurable) | Q4TP, 14,3 GB | Apache 2.0 | cortiq (Rust) |
| Qwen3.8-27B-cmf (fichero estándar del mismo autor) | 27 000 M | No disponible | CMF de 4 bits | Apache 2.0 | cortiq (Rust) |
| Qwen/Qwen3.8-27B (modelo base) | 27 000 M | No disponible en la información proporcionada | Pesos originales | No disponible en la información proporcionada | Frameworks convencionales |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo con alternativas de la misma categoría. La comparación disponible se limita al consumo de memoria y a la velocidad de inferencia entre el fichero Turbo y el fichero estándar del mismo autor.

## Limitaciones y advertencias

- El formato CMF es propietario y solo lo ejecuta el motor cortiq; no es compatible con llama.cpp, vLLM, TGI, Ollama ni transformers.
- La compresión del campo lejano en 32 puntos de referencia por cabeza puede degradar la recuperación de información en las filas intermedias no seleccionadas; el autor solo garantiza la exactitud de las 248 filas puntuadas, las primeras 4 y las últimas 1800.
- En GPUs de 16 GB la atención exacta se reduce a las primeras 4096 filas, lo que puede afectar a la precisión en prompts muy largos.
- El servidor no comprueba clave de API por defecto y escucha en todas las interfaces salvo que se indique `--host 127.0.0.1`; debe protegerse en despliegues expuestos.
- Los idiomas declarados son inglés, ruso y chino; no se garantiza un rendimiento equivalente en castellano.
- No se dispone de información sobre sesgos, tasa de alucinación ni evaluaciones de seguridad del modelo base en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el mecanismo de atención descrito está sujeto a una solicitud de patente del autor (n.º 19/738,763), lo que conviene revisar antes de reimplementarlo.
- El modelo depende de la versión del motor cortiq (0.8.59 o superior; 0.8.71 para CUDA) y de bibliotecas CUDA 12.x concretas, lo que añade requisitos de mantenimiento en producción.
- No se han publicado resultados de benchmarks académicos que permitan validar la calidad del modelo cuantizado frente al modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Qwen3.8-27B-Turbo-cmf
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fichero estándar del mismo autor: https://huggingface.co/infosave/Qwen3.8-27B-cmf
- Repositorio del motor y formato CMF: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
