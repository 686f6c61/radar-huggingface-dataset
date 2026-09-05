# huluhuluu/qwen3-4b-instruct-2507-mllm-qnn-htp

## Resumen

Este repositorio contiene binarios de contexto QNN precompilados del modelo Qwen3-4B-Instruct-2507, preparados por el autor huluhuluu para ejecutarse en el runtime MLLM sobre el procesador Hexagon NPU de Qualcomm. El objetivo es habilitar la inferencia de un modelo de lenguaje de 4.000 millones de parámetros en dispositivos móviles con Snapdragon, aprovechando la cuantización LPBQ de 4 bits para reducir el uso de memoria y mejorar la latencia. La solución está dirigida específicamente a dos SoCs: Snapdragon 8 Gen 3 (HTP v75) y Snapdragon 8 Elite (HTP v79).

El modelo base, Qwen3-4B-Instruct-2507, es un modelo de instrucciones multilingüe que destaca en comprensión del lenguaje, generación, programación y matemáticas, según la información de Qualcomm AI Hub. A diferencia de otras variantes de Qwen3, este modelo no incluye modo de pensamiento (thinking mode). Los binarios incluidos están compilados con una longitud de contexto fija de 2048 tokens y una longitud de prefill de 32 tokens, lo que los hace adecuados para cargas de trabajo de llegada serial con un único request a la vez.

La model card incluye mediciones de latencia completas: 160 requests ejecutados de forma contigua en cada dispositivo, con resultados de TTFT y TPOT en percentil 50. Esto convierte al repositorio en una referencia útil para evaluar el rendimiento de inferencia on-device de este modelo en hardware Qualcomm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4 000 millones (4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (contexto compilado en los binarios QNN) |
| Tipos de cuantizacion | LPBQ w4a16o16 G32 (4 bits pesos, 16 bits activaciones, 16 bits salida, grupo 32) |
| Idiomas soportados | no disponible (el modelo base es multilingue segun Qualcomm AI Hub) |
| Licencia | Apache 2.0 |
| Formato de pesos | Binarios de contexto QNN (.bin) para MLLM runtime; no incluye pesos en formato safetensors o GGUF |
| Dispositivos objetivo | Snapdragon 8 Gen 3 (HTP v75), Snapdragon 8 Elite (HTP v79) |
| Tamano de los binarios | 2 966 065 152 bytes (v75) y 2 963 316 736 bytes (v79) |
| Compilador | QNN SDK 2.40 |

## Arquitectura y entrenamiento

El modelo es una conversion post-entrenamiento (PTQ) del modelo Qwen/Qwen3-4B-Instruct-2507, realizada a traves del path de Qualcomm transformers del runtime MLLM. La cuantizacion utiliza la implementacion lineal `QNN_LPBQ_w4a16o16_G32`, que combina pesos de 4 bits, activaciones de 16 bits y salida de 16 bits con un grupo de 32. El layout de atencion empleado es SHA (split-head attention), y los binarios se compilan con el QNN SDK 2.40.

No se proporcionan datos sobre el entrenamiento del modelo base: numero de tokens, composicion del dataset ni procesos de RLHF o DPO. La unica informacion disponible sobre el entrenamiento del modelo original es que se trata de una variante de instrucciones sin soporte de thinking mode, segun la descripcion de Qualcomm AI Hub.

## Capacidades

- Generacion de texto y comprension del lenguaje en multiples idiomas, segun la descripcion del modelo base en Qualcomm AI Hub.
- Razonamiento en matematicas y generacion de codigo, destacadas en la misma fuente.
- Ejecucion optimizada en NPU de Qualcomm mediante binarios QNN precompilados, con cuantizacion de 4 bits y activaciones de 16 bits.
- Inferencia on-device con latencia medida: TTFT P50 de 422.459 ms en Snapdragon 8 Gen 3 y 315.693 ms en Snapdragon 8 Elite; TPOT P50 de 74.314 ms y 56.418 ms respectivamente.
- Soporte de requests pre-tokenizados con `max_new_tokens` variable, validado sobre un workload de 160 requests.
- No se menciona soporte de tool calling, function calling, agentes ni vision en la informacion disponible.

## Casos de uso

- Asistente conversacional en movil: el modelo puede responder preguntas y mantener conversaciones cortas en el dispositivo gracias a su contexto de 2048 tokens y a la baja latencia de TPOT (56-74 ms), lo que permite una interaccion casi en tiempo real sin depender de la nube.

- Generacion de codigo en el dispositivo: la capacidad de programacion del modelo base y su ejecucion local en NPU permiten ofrecer un asistente de codigo en entornos moviles, por ejemplo en aplicaciones de desarrollo o en editores de texto para dispositivos Android con Snapdragon.

- Resolucion de problemas matematicos sin conexion: el modelo puede abordar ejercicios de matematicas (como los del dataset math500) en el dispositivo, lo que es util en aplicaciones educativas o de calculo avanzado que requieren privacidad de datos.

- Aplicaciones con requisitos de privacidad: al ejecutarse completamente en el dispositivo, los datos del usuario no salen del telefono, lo que resulta adecuado para apps de mensajeria, notas o asistentes personales que manejan informacion sensible.

- Evaluacion comparativa de rendimiento de inferencia: el repositorio incluye un workload reproducible de 160 requests con validacion exhaustiva, lo que permite medir TTFT y TPOT en dispositivos Qualcomm para comparar frameworks de inferencia on-device.

- Despliegue en pipelines de pruebas de rendimiento: los binarios compilados y las mediciones de latencia pueden integrarse en automatizaciones que evalúen el rendimiento de modelos en diferentes SoCs de Qualcomm, como parte de un proceso de seleccion de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye unicamente mediciones de latencia, presentadas a continuacion.

| Dispositivo | SoC / HTP | Requests completados | TTFT P50 | TPOT P50 | Muestras TPOT |
|---|---|---|---|---|---|
| Redmi K70 Pro | SM8650 / v75 | 160/160 | 422.459 ms | 74.314 ms | 115 724 |
| Realme RMX5090 | SM8750 / v79 | 160/160 | 315.693 ms | 56.418 ms | 116 709 |

Los datos corresponden a una reproduccion serial FIFO con un unico runner residente por dispositivo, 160 requests ejecutados de forma contigua, decodificacion greedy y contexto 2048. La validacion aplicada a cada resultado incluye el orden exacto del workload, `status=ok`, `completion_tokens == output_tokens == len(token_trace)`, contiguedad de `token_index` y aumento estricto de `device_commit_ns`.

## Requisitos de hardware

- Dispositivos compatibles: Redmi K70 Pro (Snapdragon 8 Gen 3, HTP v75) y Realme RMX5090 (Snapdragon 8 Elite, HTP v79). Los binarios estan compilados para estos SoCs especificos.
- Memoria: cada binario ocupa aproximadamente 2.96 GB, por lo que se requiere memoria suficiente en el dispositivo para cargar el archivo completo.
- GPU: no aplica; el modelo esta disenado para ejecutarse en la NPU Hexagon, no en GPU.
- Opciones de despliegue: runtime MLLM con librerias QNN, usando las variables de entorno `LD_LIBRARY_PATH`, `ADSP_LIBRARY_PATH` y `MLLM_QNN_IO_MEM_ESTIMATION=1`. Se recomienda lanzar el proceso bajo `setsid nohup` para evitar que un teardown de `adb` interrumpa la inferencia.
- Latencia estimada: TTFT P50 entre 315.693 ms y 422.459 ms; TPOT P50 entre 56.418 ms y 74.314 ms, segun el dispositivo.
- No se requiere batching continuo ni decodificacion especulativa; el modelo esta optimizado para batch size 1 y llegada serial.

## Comparativa con modelos similares

No se han encontrado comparativas con otros modelos en la informacion proporcionada. La unica comparacion disponible es interna entre los dos binarios compilados para distintos SoCs: el binario para Snapdragon 8 Elite (v79) es 1.34 veces mas rapido en TTFT y 1.32 veces mas rapido en TPOT que el binario para Snapdragon 8 Gen 3 (v75), manteniendo el mismo contexto y forma de entrada.

## Limitaciones y advertencias

- La longitud de contexto esta fijada en 2048 tokens en los binarios compilados, lo que limita la cantidad de texto que puede procesar el modelo en una sola pasada.
- El modelo base no incluye soporte de thinking mode, segun Qualcomm AI Hub, por lo que no puede realizar razonamiento extendido explicito.
- No se ha evaluado la precision (accuracy) del modelo cuantizado en esta conversion; las mediciones publicadas son solo de latencia.
- El rendimiento medido corresponde a batch size 1, sin batching continuo ni decodificacion especulativa, lo que puede no reflejar el comportamiento en cargas de trabajo concurrentes.
- Los binarios son especificos para SoCs Qualcomm con HTP v75 y v79; no funcionan en otras plataformas o en GPU.
- La configuracion de librerias y variables de entorno es compleja y puede requerir ajustes segun el firmware del dispositivo.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion o restricciones de uso comercial mas alla de la licencia Apache 2.0 del repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/huluhuluu/qwen3-4b-instruct-2507-mllm-qnn-htp
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Runtime MLLM en GitHub: https://github.com/UbiquitousLearning/mllm
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
