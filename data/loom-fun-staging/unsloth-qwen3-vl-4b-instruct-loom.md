# loom-fun-staging/unsloth-Qwen3-VL-4B-Instruct-loom

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) construido sobre el checkpoint GGUF sin modificar `Qwen3-VL-4B-Instruct-Q4_K_M.gguf` de Unsloth. El modelo subyacente es Qwen3-VL-4B-Instruct, un transformer multimodal de 4.000 millones de parámetros desarrollado por el equipo Qwen de Alibaba, capaz de procesar entradas de imagen y texto y generar respuestas de texto. El paquete lo publica el espacio `loom-fun-staging` y está orientado específicamente a dos aceleradores AMD: el Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

La aportación de este artefacto no es la calidad del modelo en sí, sino la generación de kernels y un servidor compatible con la API de OpenAI (`/v1/chat/completions`) para ejecutar el GGUF sobre ROCm mediante el flujo `loom-skills`. Según la model card, el paquete sirve hasta 262.144 tokens de contexto por petición en Strix Halo y hasta 194.560 tokens en la R9700, limitado por su pool de memoria de 34 GB, con soporte de 4 peticiones concurrentes y un máximo de 4.096 tokens de salida.

Es relevante ahora por dos motivos: primero, porque demuestra la viabilidad de servir modelos multimodales de 4B cuantizados en silicio AMD de consumo y estación de trabajo sin depender de CUDA; segundo, porque el repositorio es un entorno de staging con 0 descargas y 0 likes, creado el 14 de noviembre de 2026, y las propias puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`) figuran como «no re-ejecutadas en este paquete». Debe tratarse, por tanto, como un artefacto experimental y no como una dependencia de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL) con proyector visual separado (`mmproj-F16.gguf`) |
| Parametros totales | 4.000 millones (modelo base Qwen3-VL-4B-Instruct) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens por peticion; 194.560 tokens en Radeon AI PRO R9700 por limite de memoria |
| Tipos de cuantizacion | Q4_K_M (GGUF del checkpoint); proyector visual en F16 |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | No disponible en la informacion proporcionada |
| Formato de pesos | GGUF (`Qwen3-VL-4B-Instruct-Q4_K_M.gguf`) + paquete Loom (`model.json`, programas `.loom`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-VL-4B-Instruct, un transformer denso de 4.000 millones de parámetros con codificador visual y proyector multimodal, empaquetado aquí en cuantización Q4_K_M (aproximadamente 4 bits por peso) junto a un proyector `mmproj-F16.gguf` en precisión completa. El paquete Loom no modifica los pesos: genera kernels específicos para las arquitecturas gfx1151 y gfx1201 y los expone mediante un servidor con API compatible con OpenAI. La model card no documenta el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, por lo que esos datos deben consultarse en la ficha del modelo base.

La innovación técnica del artefacto está en la capa de ejecución: kernels generados por el flujo `loom-skills`, un pool de memoria acotado mediante `--memory_bytes` (56 GB en Strix Halo, 34 GB en R9700), espera activa configurable con `completion_spin_ns=4294967295` y verificación de corrección frente a llama.cpp en varias puertas (tokens greedy, top-5 log-probs, paridad de tokens de prompt en visión y consistencia bajo concurrencia). No hay cabeza MTP ni drafter publicado para este modelo exacto, de modo que la decodificación especulativa no aplica.

## Capacidades

- Generación de texto e inferencia multimodal imagen-texto: acepta partes `image_url` en el formato de OpenAI y procesa la imagen con el proyector F16.
- Tool calling en estilo OpenAI: acepta `tools` y devuelve `tool_calls`, lo que habilita bucles de agente multi-turno.
- Concurrencia de hasta 4 peticiones simultáneas con consistencia verificada frente a ejecuciones aisladas.
- Ventana de contexto muy amplia: 262.144 tokens por petición (194.560 en R9700), adecuada para documentos largos y conversaciones extensas.
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`.
- Límite de salida de 4.096 tokens por respuesta (preset `max_tokens`).
- Modo de razonamiento o *thinking*: no aplica según la model card.
- Entrada y salida de audio: no soportadas.
- Decodificación especulativa: no aplica (sin MTP ni drafter).

## Casos de uso

- Análisis de documentos extensos con imagen: gracias a los 262.144 tokens de contexto, se puede enviar un informe escaneado o un PDF convertido a imágenes junto con instrucciones de extracción y obtener un resumen estructurado en una sola petición, sin fragmentar el documento.
- Automatización de soporte con capturas de pantalla: el modelo recibe una imagen del error del usuario y el historial de la conversación, y devuelve un diagnóstico; el tool calling permite consultar una base de conocimiento interna antes de responder.
- Extracción de datos de formularios y facturas: con el proyector visual F16 y salida JSON forzada mediante prompt, se pueden digitalizar campos estructurados en un pipeline por lotes, aprovechando las 4 peticiones concurrentes para aumentar el throughput agregado.
- Agentes multi-turno con herramientas: el soporte de `tools`/`tool_calls` permite encadenar búsquedas, consultas a bases de datos y cálculos en un bucle de varios pasos, con la salvedad de que la puerta `agent` figura como no re-ejecutada en este paquete.
- Asistente local en estación de trabajo AMD: al ejecutarse sobre una Radeon AI PRO R9700 de 32 GB, permite desplegar un asistente multimodal en una máquina de oficina sin GPU NVIDIA, con un pool de memoria acotado a 34 GB.
- Prototipado en hardware de consumo: en un Ryzen AI Max+ 395 con 56 GB de pool, se puede validar una aplicación de visión-lenguaje antes de migrarla a infraestructura mayor, usando el mismo GGUF y el mismo servidor.
- Evaluación comparativa de motores de inferencia: el paquete incluye una metodología de medición frente a llama.cpp ROCm con roofline de referencia (216 GB/s y 59 TFLOP/s en Strix Halo), útil para equipos que comparan stacks de serving sobre ROCm.

## Benchmarks y rendimiento

La model card publica una tabla comparativa frente a llama.cpp ROCm, pero las columnas de llama.cpp y Loom están vacías («—»); solo se incluyen los valores de roofline teórico del hardware. No hay cifras medidas de tokens por segundo para ninguno de los dos motores.

| Métrica | llama.cpp | Loom | Roofline (Strix Halo) |
|---|---|---|---|
| Decode tok/s, prompt corto | no medido | no medido | 86,7 |
| Decode tok/s, contexto 2k | no medido | no medido | 77,5 |
| Decode tok/s, contexto 32k | no medido | no medido | 30,0 |
| Prefill tok/s, documento 1k | no medido | no medido | 7.802,6 |
| Prefill tok/s, documento 2k | no medido | no medido | 7.509,7 |
| Prefill tok/s, documento 8k | no medido | no medido | 6.129,3 |
| Prefill tok/s, documento 16k | no medido | no medido | 4.922,7 |
| Prefill tok/s, documento 32k | no medido | no medido | 3.532,1 |
| 4 streams, decode agregado | no medido | no medido | 303,7 |
| Decodificación especulativa, tokens aceptados | n/a | n/a | n/a |

En Radeon AI PRO R9700 (gfx1201) la model card indica explícitamente que «los resultados de este paquete aún no se han vuelto a medir». No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Strix Halo (Ryzen AI Max+ 395, gfx1151): servir con `--memory_bytes=56000000000` (56 GB de pool de memoria).
- Radeon AI PRO R9700 (gfx1201, 32 GB): servir con `--memory_bytes=34000000000` (34 GB), lo que limita el contexto a 194.560 tokens por petición.
- VRAM estimada: no disponible de forma explícita; el GGUF Q4_K_M de un modelo de 4B más el proyector F16 requiere del orden de pocos gigabytes, pero la cifra exacta no figura en la información proporcionada.
- GPU recomendadas: exclusivamente las dos arquitecturas AMD indicadas (gfx1151 y gfx1201). No se documenta compatibilidad con A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en el Ryzen AI Max+ 395 con memoria unificada; no se documenta soporte para GPUs de consumo NVIDIA.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para arrancar el servidor en `127.0.0.1:8080`. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput medidos: no disponibles (las celdas de medición están vacías); solo se conocen los techos de roofline indicados en la tabla anterior.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-VL-4B-Instruct (este paquete Loom) | 4B denso | 262.144 (194.560 en R9700) | GGUF Q4_K_M sobre Loom/ROCm | no disponible | Solo AMD gfx1151 y gfx1201; staging con 0 descargas |
| unsloth/Qwen3-VL-4B-Instruct-GGUF (base) | 4B denso | mismo modelo base | GGUF para llama.cpp y derivados | no disponible en la información | Checkpoint de referencia sin modificar; sirve como oráculo de corrección |
| llama.cpp ROCm (motor) | n/a | según configuración | GGUF nativo | no disponible | Motor de comparación usado en la metodología; argumentos del servidor no registrados |

No se dispone en la información proporcionada de datos de benchmarks de calidad que permitan comparar el rendimiento del modelo frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Artefacto de staging: 0 descargas y 0 likes, creado el 14 de noviembre de 2026; no debe considerarse estable.
- Las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `agent`) no se han vuelto a ejecutar en este paquete; el último pase corresponde a una compilación anterior (sha256 `aa0724a`).
- Las métricas de rendimiento frente a llama.cpp están sin medir en ambas arquitecturas; no hay evidencia publicada de que Loom iguale o supere al motor de referencia en este modelo.
- Compatibilidad restringida a dos GPUs AMD concretas; no hay soporte documentado para CUDA ni para otras arquitecturas ROCm.
- El contexto efectivo en Radeon AI PRO R9700 se reduce a 194.560 tokens por el pool de 34 GB.
- Sin cabeza MTP ni drafter, no hay decodificación especulativa, lo que limita las ganancias de latencia en decode.
- Licencia no disponible: no puede asumirse uso comercial sin verificar la licencia del modelo base Qwen3-VL-4B-Instruct y la del propio paquete.
- Idiomas soportados no documentados en esta ficha; deben consultarse en la model card del modelo base.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada; son los del modelo base Qwen3-VL-4B-Instruct.
- Límite de 4.096 tokens de salida por respuesta, insuficiente para generaciones largas sin fragmentación.
- La espera activa (`completion_spin_ns=4294967295`) consume CPU de forma intensiva durante la generación; debe revisarse en despliegues con restricciones de energía o CPU compartida.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-fun-staging/unsloth-Qwen3-VL-4B-Instruct-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3-VL-4B-Instruct-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
