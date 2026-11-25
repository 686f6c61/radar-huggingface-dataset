# ryugyosoft/Ternary-Bonsai-2.5-27B-onwx

## Resumen

Ternary Bonsai 2.5 27B onwx es una conversión del modelo Ternary-Bonsai-2.5-27B de Prism ML (a su vez un reentrenamiento con pesos ternarios de Qwen3.8-27B) para ejecutarse íntegramente en la NPU XDNA2 de los procesadores AMD Ryzen AI, mediante la aplicación onwx. El autor de la conversión es ryugyosoft, que publica tanto los pesos reorganizados como los programas de NPU precompilados específicos para este modelo. La propuesta es poco habitual: un modelo de 27 000 millones de parámetros con pesos de 2 bits que cabe en 7,6 GB de descarga y se ejecuta sin GPU dedicada en un portátil con Ryzen AI.

La relevancia reside en la combinación de tres factores: cuantización ternaria extrema (valores −1, 0, +1 almacenados en 2 bits, con escalas bf16 cada 128 pesos), una arquitectura híbrida con capas DeltaNet con compuerta y atención clásica, y un backend de inferencia escrito a mano para los 32 motores de IA de la NPU. Frente a la versión anterior (Bonsai 2 27B), Prism ML reporta mejoras notables en tareas agénticas: SWE-bench Verified de 60,8 a 75,6, AppWorld de 51,2 a 90,5 y Terminal-Bench 2.1 de 52,8 a 60,1.

El modelo está orientado a generación de texto conversacional y agéntica en japonés e inglés, con soporte de modo de razonamiento y llamada a herramientas, pero sin capacidad de visión. La licencia es Apache-2.0, heredada del modelo original. Su rendimiento medido en un Ryzen AI Max+ 395 es de aproximadamente 7 tok/s en generación y unos 115 tok/s en lectura de prompt, con un consumo de memoria de unos 8,8 GB más 34 MB por cada 1000 tokens de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Gated DeltaNet y atención (linaje Qwen3.5/Qwen3.8), pesos ternarios |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262 144 tokens (límite del modelo) |
| Tipos de cuantizacion | Ternaria de 2 bits (valores −1, 0, +1 con escala bf16 cada 128 pesos, ~2,1 bits por peso); caché KV en int8 con rotación Hadamard; cálculo interno en bfp16 |
| Idiomas soportados | Japonés (ja), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Formato propietario de onwx: `blobs/L*.wgt`, `head.wgt`, `embed.npz`, planes NPU en `plans/` (xclbin e instrucciones); derivado del formato MLX 2-bit original |

## Arquitectura y entrenamiento

El modelo base es Ternary-Bonsai-2.5-27B de Prism ML, un reentrenamiento con pesos ternarios de Qwen3.8-27B. La arquitectura combina capas DeltaNet con compuerta (un mecanismo de estado lineal recurrente) y capas de atención clásica, lo que reduce el coste de memoria de la caché KV en las capas recurrentes. Los pesos se almacenan en el formato MLX de 2 bits del modelo original: el signo ternario ocupa 2 bits y cada bloque de 128 pesos lleva una escala en bf16, resultando en unos 2,1 bits por peso.

La conversión para onwx reorganiza los pesos en el orden de lectura que esperan los motores de IA de la NPU y añade programas precompilados. En generación token a token, 16 motores calculan productos matriz-vector mientras leen los pesos, 8 motores se encargan de las capas DeltaNet y 4 de la atención. Para la lectura de prompt, los fragmentos de 256 tokens o más se procesan en bloques de 1024 o 2048 tokens usando los 32 motores, con cálculo en bfp16 y expansión de los pesos ternarios en la propia NPU justo antes de cada capa (sin retenerlos, con un incremento de memoria de unos 0,5 GB). La atención usa FlashAttention leyendo la caché en int8. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional multi-turno en japonés e inglés.
- Modo de razonamiento (thinking mode) activable.
- Llamada a herramientas (tool calling) y razonamiento multi-paso orientado a agentes.
- Tareas agénticas de codificación y uso de terminal, reforzadas respecto a la versión anterior según los datos de Prism ML.
- Ejecución de tareas con muchos pasos y procedimientos largos (mejora reportada en AppWorld y Terminal-Bench).
- Contexto largo de hasta 262 144 tokens.
- API compatible con OpenAI en `http://127.0.0.1:8100/v1`.
- Sin capacidad de visión: el propio autor indica que no puede leer imágenes.
- La cabeza MTP (multi-token prediction) del modelo original no está implementada en esta conversión.

## Casos de uso

- Asistencia de código en local sin GPU: el modelo puede generar y revisar código en un portátil con Ryzen AI, con el contexto largo necesario para manejar varios ficheros, aprovechando los 262 144 tokens de ventana.
- Agentes de terminal y automatización de tareas de sistema: los datos de Terminal-Bench 2.1 (60,1) y AppWorld (90,5) lo sitúan como candidato para flujos agénticos que ejecutan comandos y encadenan herramientas.
- Automatización de flujos con tool calling: su soporte de function calling permite integrarlo como backend de agentes que consultan APIs o bases de datos a través de la API compatible con OpenAI.
- Procesamiento de documentos largos en japonés e inglés: resúmenes, extracción de datos y preguntas sobre contratos o informes extensos gracias a la ventana de contexto y a los dos idiomas soportados.
- Asistente conversacional de escritorio: al ejecutarse en la NPU, deja la GPU y la CPU libres para otras aplicaciones, lo que lo hace adecuado para asistentes siempre activos en un equipo de trabajo.
- Prototipado y evaluación de modelos ternarios: útil para investigadores que quieran medir el impacto de la cuantización a 2 bits en tareas reales sobre hardware de consumo.
- Despliegue en entornos con restricciones de memoria: con 8,8 GB de uso y 16 GB de RAM mínimos, encaja en equipos donde no cabe un modelo de 27B en bf16.

## Benchmarks y rendimiento

Datos reportados por Prism ML para el modelo base (comparación Bonsai 2 27B → Bonsai 2.5 27B):

| Benchmark | Bonsai 2 27B | Bonsai 2.5 27B |
|---|---|---|
| SWE-bench Verified | 60,8 | 75,6 |
| AppWorld | 51,2 | 90,5 |
| Terminal-Bench 2.1 | 52,8 | 60,1 |

Rendimiento de inferencia medido en onwx 1.3.2 sobre Ryzen AI Max+ 395 (Windows):

| Metrica | Valor |
|---|---|
| Lectura de prompt | ~19,5 s para 2000 tokens (~115 tok/s) |
| Generación | ~7,0 tok/s |
| Carga del modelo | ~9 s (sin compilación) |
| Memoria usada | ~8,8 GB + ~34 MB por 1000 tokens de contexto |
| Descarga | 7,6 GB |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible. Los datos de calidad de salida frente a la ruta de 32 tokens indican una divergencia KL de aproximadamente 0,002, y de 0,0003 por la cuantización de la caché KV.

## Requisitos de hardware

- NPU XDNA2 de AMD Ryzen AI: series Ryzen AI 300 (Strix Point, p. ej. Ryzen AI 9 HX 370) y Ryzen AI Max (Strix Halo, p. ej. Ryzen AI Max+ 395).
- Sistema operativo: Windows 11 con driver NPU de AMD (verificado desde 32.0.203); Ubuntu es experimental y requiere el driver amdxdna y XRT.
- Memoria RAM mínima: 16 GB; uso real de unos 8,8 GB más 34 MB por cada 1000 tokens de contexto.
- No requiere GPU dedicada; toda la inferencia ocurre en la NPU.
- Despliegue mediante la aplicación onwx (instalación vía PowerShell en Windows o script `curl | bash` en Ubuntu), con servidor local y API compatible con OpenAI.
- No se soportan vLLM, llama.cpp, Ollama ni TGI para este formato: los pesos y los planes NPU son específicos de onwx.
- Latencia y throughput: ~7 tok/s de generación y ~115 tok/s de lectura de prompt en Ryzen AI Max+ 395; en modo de energía estándar la NPU baja de frecuencia y el rendimiento cae alrededor de un 20 % (se puede forzar el modo performance con `xrt-smi.exe configure --pmode performance`).
- El uso simultáneo de la NPU por funciones de Copilot+ puede degradar el rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| Ternary-Bonsai-2.5-27B-onwx | 27B | 262 144 | Ternaria 2-bit | Apache-2.0 | NPU AMD XDNA2 |
| Ternary-Bonsai-2.5-27B (MLX 2-bit) | 27B | 262 144 | Ternaria 2-bit | Apache-2.0 | Apple Silicon (MLX) |
| Ternary-Bonsai-2-27B-onwx | 27B | no disponible | Ternaria 2-bit | Apache-2.0 | NPU AMD XDNA2 |
| Qwen3.8-27B (original) | 27B | no disponible | bf16 (pesos completos) | no disponible en la información | GPU con VRAM suficiente |

La comparación directa con modelos densos de 27B en bf16 no es posible en términos de requisitos: el original en bf16 necesitaría del orden de 54 GB solo para pesos, mientras que esta conversión ocupa 7,6 GB. Frente a la versión MLX, comparte pesos y formato lógico pero cambia el backend de ejecución (NPU frente a Apple Silicon). Frente a Bonsai 2 27B, mantiene forma y formato de pesos pero mejora en los benchmarks agénticos citados.

## Limitaciones y advertencias

- Solo soporta japonés e inglés de forma declarada; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- No procesa imágenes ni audio.
- La cuantización ternaria de 2 bits introduce pérdida de precisión frente al modelo original en bf16; no se han publicado evaluaciones independientes de esa degradación.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la compresión extrema de pesos; requiere verificación en producción.
- El contexto máximo de 262 144 tokens es teórico: el rendimiento decae con la longitud y el consumo de memoria crece unos 34 MB por cada 1000 tokens.
- Dependencia total de la aplicación onwx y del hardware AMD Ryzen AI con NPU XDNA2; no es portable a otros backends ni a GPU.
- Ubuntu está en estado experimental y requiere configuración manual de drivers.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B del que deriva.
- El repositorio tiene un volumen de descargas muy bajo (3) y ninguna validación de la comunidad, por lo que la fiabilidad de la conversión no está contrastada.
- No se ha implementado la cabeza MTP del modelo original, por lo que se pierde la decodificación especulativa.
- El rendimiento puede degradarse si otras funciones del sistema (Copilot+) ocupan la NPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ryugyosoft/Ternary-Bonsai-2.5-27B-onwx
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-mlx-2bit
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Aplicación onwx: https://huggingface.co/ryugyosoft/onwx
- Versión anterior para onwx: https://huggingface.co/ryugyosoft/Ternary-Bonsai-2-27B-onwx
