# loom-fun-staging/rippertnt-HyperCLOVAX-SEED-Text-Instruct-1.5B-loom

## Resumen

HyperCLOVAX-SEED-Text-Instruct-1.5B es un modelo de lenguaje de 1.500 millones de parámetros desarrollado por Naver (bajo la familia HyperCLOVAX-SEED) y publicado originalmente como checkpoint GGUF cuantizado en Q4_K_M por el usuario `rippertnt`. La ficha que nos ocupa, `loom-fun-staging/rippertnt-HyperCLOVAX-SEED-Text-Instruct-1.5B-loom`, no es un modelo nuevo ni un fine-tune: es un paquete de despliegue en formato Loom (programas `.loom` y un `model.json`) que envuelve el GGUF original sin modificarlo, generado con el flujo `loom-skills` del ecosistema Loom.

El propósito del paquete es servir el modelo en GPUs AMD concretas: el APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB), exponiendo una API compatible con OpenAI en `127.0.0.1:8080`. Resulta relevante para quienes trabajan con hardware AMD ROCm y quieren una alternativa a llama.cpp ROCm con métricas de roofline y puertas de corrección documentadas.

La información disponible sobre el modelo subyacente es escasa: se conoce el tamaño (1.5B), la cuantización (Q4_K_M), el contexto declarado en el paquete (131.072 tokens por petición) y el carácter instructivo del checkpoint. No se detallan arquitectura interna, datos de entrenamiento ni benchmarks del modelo en sí.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base HyperCLOVAX-SEED-Text-Instruct-1.5B; el paquete Loom no documenta la arquitectura interna) |
| Parámetros totales | 1.500 millones (1.5B) |
| Parámetros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | 131.072 tokens por petición (según el paquete Loom) |
| Tipos de cuantización | Q4_K_M (GGUF); no se documentan otras variantes en este paquete |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`hyperclovax-seed-text-instruct-1.5b-q4_k_m.gguf`) empaquetado como programas `.loom` + `model.json` |
| Modelo base | `rippertnt/HyperCLOVAX-SEED-Text-Instruct-1.5B-Q4_K_M-GGUF` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-style `/v1/chat/completions` |
| Concurrencia | 4 peticiones simultáneas |
| Salida máxima | 4.096 tokens (preset `max_tokens`) |
| Muestreo | `temperature`, `top_p`, `top_k`, `seed` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base HyperCLOVAX-SEED-Text-Instruct-1.5B en la documentación proporcionada: no se especifica si es un transformer denso, qué tipo de atención emplea, ni la composición del corpus de entrenamiento, el número de tokens vistos o si hubo fases de RLHF/DPO. El sufijo "Instruct" del checkpoint original sugiere un ajuste para seguir instrucciones, pero no se detallan los métodos empleados.

Lo que sí está documentado es la capa de despliegue Loom: el paquete incluye kernels generados para las arquitecturas AMD gfx1151 y gfx1201, un servidor HTTP compatible con OpenAI y un conjunto de puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `sampling`) que comparan la salida codiciosa contra una referencia de llama.cpp token a token. En la versión publicada, estas puertas no se han vuelto a ejecutar sobre este paquete concreto (la última pasada fue sobre un build previo, sha256 `61bcde6`), y en la R9700 no se han re-medido. No hay decodificación especulativa: el GGUF no incluye cabeza MTP ni se ha publicado un drafter para este modelo exacto.

## Capacidades

- Generación de texto conversacional e instrucciones en formato chat (endpoint `/v1/chat/completions`).
- Procesamiento de contexto largo: hasta 131.072 tokens por petición según el paquete.
- Muestreo configurable con `temperature`, `top_p`, `top_k` y `seed`.
- Concurrencia de hasta 4 peticiones simultáneas.
- Salida limitada a 4.096 tokens por respuesta mediante el preset `max_tokens`.
- Tool calling / function calling: no disponible (marcado como "not applicable" en la model card).
- Modo razonamiento / thinking: no disponible ("not applicable").
- Decodificación especulativa: no disponible ("not applicable").
- Entrada de imagen: no disponible ("not applicable").
- Entrada o salida de audio: no disponible ("not applicable").
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: el paquete se sirve con `loom-serve` sobre Strix Halo o R9700 y responde en `127.0.0.1:8080` con API compatible con OpenAI, lo que permite conectar clientes existentes sin adaptadores.
- Procesamiento de documentos largos en local: con 131.072 tokens de contexto declarados, encaja en tareas de resumen o extracción sobre documentación extensa, siempre que se acepte la latencia de prefill documentada (hasta 32k tokens de prompt).
- Prototipado de aplicaciones de chat en hardware ROCm: útil para desarrolladores que quieran validar pipelines con un modelo pequeño (1.5B, Q4_K_M) antes de escalar a modelos mayores en la misma pila Loom.
- Evaluación comparativa de motores de inferencia: el paquete incluye métricas de roofline y puertas de corrección frente a llama.cpp ROCm, lo que lo hace adecuado como banco de pruebas para medir rendimiento en gfx1151.
- Despliegue en entornos con memoria limitada: al ser un Q4_K_M de 1.5B, el peso del modelo es reducido y el paquete reserva 24 GB de memoria (`--memory_bytes=24000000000`), lo que deja margen para el contexto y el batching en la R9700 de 32 GB.
- Servicio de generación de texto de baja concurrencia: con 4 peticiones simultáneas y salidas de hasta 4.096 tokens, encaja en herramientas internas de redacción asistida o clasificación de textos donde no se requiere tool calling ni multimodalidad.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks del modelo (MMLU, HumanEval, GSM8K u otros). Sí incluye una tabla de rendimiento del motor Loom frente a llama.cpp ROCm en Strix Halo, pero las columnas de llama.cpp y Loom aparecen como "no medidas" (`—`); solo se rellena la columna de roofline, que es un techo teórico de hardware, no una medición del modelo:

| Métrica (Strix Halo, gfx1151) | Roofline (techo teórico) |
|---|---|
| Decode tok/s, prompt corto | 215,5 |
| Decode tok/s, contexto 2k | 180,1 |
| Decode tok/s, contexto 32k | 52,1 |
| Prefill tok/s, documento 1k | 20.950,1 |
| Prefill tok/s, documento 2k | 20.243,5 |
| Prefill tok/s, documento 8k | 16.836,3 |
| Prefill tok/s, documento 16k | 13.750,4 |
| Prefill tok/s, documento 32k | 10.062,0 |
| 4 streams, decode agregado tok/s | 697,7 |
| Decodificación especulativa | n/a |

El roofline se calcula para 216 GB/s de ancho de banda y 59 TFLOP/s en el Ryzen AI Max+ 395. Para la Radeon AI PRO R9700 los resultados "no se han re-medido todavía". No se han publicado resultados de benchmarks del modelo en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el paquete reserva 24.000.000.000 bytes (`--memory_bytes=24000000000`) en ambos dispositivos objetivo.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por este paquete, que genera kernels específicos para arquitecturas AMD.
- Cabe en GPU de consumo: no documentado; el paquete está pensado para APU/GPU AMD profesionales, no se mencionan GPUs de consumo.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0"`, descarga con `loom-fetch` y servicio con `loom-serve`. El servidor escucha en `127.0.0.1:8080`.
- Latencia y throughput: solo se dispone de techos de roofline (ver tabla anterior); no hay mediciones reales de Loom ni de llama.cpp en este paquete.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base en la información proporcionada, por lo que una comparativa cuantitativa con alternativas de 1.5B (Qwen2.5-1.5B-Instruct, Llama-3.2-1B-Instruct, Gemma-2-2B) no puede sustentarse con cifras. A continuación se comparan únicamente los aspectos documentados del paquete:

| Aspecto | Este paquete (Loom) | llama.cpp ROCm | vLLM (ROCm) |
|---|---|---|---|
| Modelo | HyperCLOVAX-SEED-Text-Instruct-1.5B Q4_K_M | Mismo GGUF | Requiere pesos en safetensors, no GGUF |
| Hardware objetivo | gfx1151 y gfx1201 | ROCm genérico | ROCm genérico |
| API | OpenAI-style `/v1/chat/completions` | Servidor propio compatible | OpenAI-style |
| Contexto declarado | 131.072 tokens | no disponible | no disponible |
| Concurrencia | 4 peticiones | no disponible | continua (continuous batching) |
| Tool calling | no | no | sí (según plantilla) |
| Métricas de rendimiento | roofline publicado, mediciones no realizadas | no disponible | no disponible |

## Limitaciones y advertencias

- El paquete no es un modelo nuevo: envuelve un GGUF de terceros (`rippertnt/...`) sin modificarlo; la calidad del modelo depende íntegramente del checkpoint base.
- Las puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `sampling`) no se han vuelto a ejecutar sobre este paquete; la última pasada corresponde a un build previo (sha256 `61bcde6`). No hay garantía verificada de equivalencia con llama.cpp en esta versión.
- En la Radeon AI PRO R9700 no se han re-medido ni el rendimiento ni la corrección.
- No se documentan tool calling, modo razonamiento, decodificación especulativa, visión ni audio; no deben asumirse.
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar la licencia del modelo base HyperCLOVAX-SEED en su repositorio original.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas distintos del coreano/inglés habituales en la familia HyperCLOVAX.
- Riesgo de alucinación inherente a un modelo de 1.5B: no hay evaluaciones publicadas de fidelidad factual.
- El contexto de 131.072 tokens es una capacidad declarada del runtime; el rendimiento de decode cae según el roofline (de 215,5 a 52,1 tok/s al pasar de prompt corto a 32k), lo que puede hacer impracticable el uso interactivo con contextos muy largos.
- Dependencia de la pila Loom (`hrx-loom==0.1.0`) y de hardware AMD específico; no es portable a NVIDIA ni a CPU sin verificación adicional.
- Los resultados de búsqueda web proporcionados corresponden a productos homónimos (Loom el grabador de pantalla, Loom la marca de ropa) y no aportan información sobre este modelo.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-fun-staging/rippertnt-HyperCLOVAX-SEED-Text-Instruct-1.5B-loom
- Modelo base GGUF: https://huggingface.co/rippertnt/HyperCLOVAX-SEED-Text-Instruct-1.5B-Q4_K_M-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
