# loom-draft/ReadyArt-Dark-Scarlett-v1.0-26B-A4B-loom

## Resumen

ReadyArt-Dark-Scarlett-v1.0-26B-A4B-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario loom-draft a partir del checkpoint GGUF sin modificar ReadyArt/Dark-Scarlett-v1.0-26B-A4B-GGUF, en su cuantizacion Q4_K_M. No es un modelo nuevo ni un fine-tune: es un artefacto de empaquetado que traduce los pesos originales a un formato ejecutable por el runtime Loom sobre GPUs AMD concretas, el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El problema que aborda es la portabilidad y el rendimiento de la inferencia en hardware AMD consumer y profesional: Loom ofrece una API compatible con OpenAI (`/v1/chat/completions`), gestion de memoria con pool fijo y precarga de parametros, y segun la model card supera a llama.cpp ROCm en decodificacion y, sobre todo, en prefill sobre Strix Halo. El nombre del checkpoint base sugiere una arquitectura de mezcla de expertos con 26B de parametros totales y aproximadamente 4B activos (sufijo "26B-A4B"), aunque la informacion proporcionada no confirma esa interpretacion.

Su relevancia es acotada pero clara para quien opere silicio AMD: permite servir un modelo de ~26B en cuantizacion Q4_K_M en una APU con memoria unificada o en una GPU R9700 de 32 GB, con metricas publicadas frente a llama.cpp y una licencia MIT heredada del checkpoint base. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que los artefactos no estan efectivamente alojados o que el repo esta vacio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del checkpoint base sugiere MoE con ~26B totales y ~4B activos; sin confirmar) |
| Parametros totales | 26B (segun el nombre del checkpoint base, sin confirmar en la informacion) |
| Parametros activos | ~4B (segun el sufijo "A4B" del checkpoint base, sin confirmar) |
| Longitud de contexto | no disponible en la ficha; las pruebas de rendimiento usan prompts de hasta 32k tokens y llama.cpp se configura con `-c 65536` |
| Tipos de cuantizacion | Q4_K_M (unico incluido en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q4_K_M), empaquetado como programas `.loom` y tarjeta `model.json` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 (`loom-fetch`, `loom-serve`) |
| API | compatible con OpenAI (`/v1/chat/completions`) |
| Modelo base | ReadyArt/Dark-Scarlett-v1.0-26B-A4B-GGUF |
| Generador | loom-next (solo el generador, sin LLM en el bucle) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del checkpoint base ni su proceso de entrenamiento: no hay datos sobre numero de tokens, composicion del dataset, uso de RLHF/DPO ni innovaciones como decodificacion especulativa o atencion lineal. Lo unico deducible del nombre es la convencion "26B-A4B", habitual en modelos de mezcla de expertos con aproximadamente 26B de parametros totales y 4B activos por token, pero esto no se confirma en la model card.

Lo que si esta documentado es la capa de empaquetado. Loom genera programas `.loom` y una tarjeta `model.json` que describen el grafo de ejecucion y la politica de memoria para el GGUF original. El runtime `loom-serve` ofrece tres controles relevantes: `--pool_backing=fixed` (reserva el pool de memoria por adelantado en lugar de crecimiento elastico), `--parameter_mode=preload` (carga de pesos en host antes de servir) y `completion_spin_ns=4294967295` (espera activa de las finalizaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo). Las mediciones publicadas usan la espera activa; la precarga de parametros no afecta a las filas de rendimiento salvo que el job concreto la usara. No hay cabecera MTP en el GGUF ni drafter publicado para este modelo exacto, por lo que no se aplica decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Modo de razonamiento opcional controlado por `chat_template_kwargs.enable_thinking`; en el ejemplo de la model card aparece desactivado.
- Servicio multi-stream: la model card reporta una prueba agregada con 4 peticiones paralelas.
- Procesamiento de prompts largos: se publican metricas de prefill hasta 32k tokens.
- Tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles.
- Capacidades especiales del checkpoint base (rol de personaje, estilo, etc.): no documentadas en la informacion.

## Casos de uso

- Servicio local de chat sobre Strix Halo: desplegar el paquete con `loom-fetch` y `loom-serve` y exponer un endpoint compatible con OpenAI en `127.0.0.1:8080`, aprovechando la memoria unificada de la APU para mantener el modelo Q4_K_M residente sin GPU discreta.
- Asistente conversacional de contexto largo: con prompts de hasta 32k tokens medidos en prefill, es adecuado para resumir documentos extensos o mantener hilos de conversacion largos en una estacion de trabajo AMD.
- Evaluacion comparativa de runtimes: usar las filas publicadas (decode y prefill frente a llama.cpp ROCm b1374) como referencia para decidir entre Loom y llama.cpp en un parque de equipos Strix Halo.
- Despliegue en Radeon AI PRO R9700 para entornos de 32 GB: el paquete incluye un preset especifico (`chat-r9700`), pensado para servir el modelo en una GPU profesional AMD con memoria dedicada.
- Prototipado de aplicaciones con SDK de OpenAI: al ser compatible con `/v1/chat/completions`, se puede apuntar cualquier cliente OpenAI existente al servidor local cambiando la URL base, sin reescribir integraciones.
- Procesamiento por lotes de documentos: el throughput de prefill reportado (hasta 2176 tok/s en documentos de 2k) permite clasificar, resumir o extraer informacion de lotes de textos en hardware de gama alta consumer.
- Experimentacion con modos de razonamiento: alternar `enable_thinking` por peticion para comparar respuestas directas frente a respuestas con cadena de pensamiento en el mismo servidor.

## Benchmarks y rendimiento

Rendimiento de Loom frente a llama.cpp ROCm `llamacpp-rocm/b1374` sobre AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). Mismo GGUF, mismo runner y job de DevLab, mismos prompts; mediana de 3 sesiones (4 streams: mediana de 3). Medido el 2026-11-26 en runners DevLab Dispatch (X2-LA03-S04-D06), Linux, hrx-loom 0.2.0.

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | 58.1 | 66.2 | +14 % |
| Decode tok/s, contexto 2k | 51.2 | 61.0 | +19 % |
| Decode tok/s, contexto 32k | 43.1 | 50.8 | +18 % |
| Prefill tok/s, documento 1k | 1223.1 | 2135.2 | +75 % |
| Prefill tok/s, documento 2k | 1307.6 | 2176.1 | +66 % |
| Prefill tok/s, documento 8k | 1284.2 | 2072.1 | +61 % |
| Prefill tok/s, documento 16k | 1144.9 | 1873.5 | +64 % |
| Prefill tok/s, documento 32k | 914.5 | 1571.6 | +72 % |
| 4 streams, decode agregado tok/s | 133.1 | 157.5 | +18 % |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a |

Notas metodologicas: llama.cpp se ejecuto con `-ngl 99 -cram 0 -c 65536 -np 1` y sus valores por defecto de compilacion; Loom sirve el preset incluido en el paquete. No hubo barrido de ajuste en ninguno de los dos motores. En las filas de un solo stream no se uso drafting en ninguno de los dos motores (no hay cabecera MTP en el GGUF ni drafter publicado). Un margen dentro de +-3 % se considera empate. La roofline no se calculo.

Para la Radeon AI PRO R9700 (gfx1201, 32 GB), la model card indica que los resultados de este paquete aun no se han vuelto a medir.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el paquete esta pensado para Strix Halo (memoria unificada) y para la R9700 con 32 GB, lo que fija un limite superior practico de 32 GB para los pesos Q4_K_M mas el pool de trabajo.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se menciona soporte para NVIDIA ni para otras GPU AMD.
- GPU consumer: no hay datos para RTX 4090 u otras GPU NVIDIA; el paquete es especifico de AMD via ROCm.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir. No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI en la informacion.
- Ajustes de memoria recomendados por el autor: `--pool_backing=fixed` y `--parameter_mode=preload`; espera activa con `completion_spin_ns=4294967295` (consume CPU mientras la GPU trabaja).
- Latencia y throughput: ver la tabla de benchmarks; en Strix Halo, 66.2 tok/s de decode en prompt corto y 2135.2 tok/s de prefill en documento de 1k con Loom.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReadyArt-Dark-Scarlett-v1.0-26B-A4B (GGUF Q4_K_M, via Loom) | 26B totales / ~4B activos (segun nombre, sin confirmar) | hasta 32k medidos; llama.cpp configurado a 65k | 66.2 tok/s decode corto y 2135.2 tok/s prefill 1k en Strix Halo | MIT | paquete Loom para gfx1151 y gfx1201 |
| Mismo checkpoint servido con llama.cpp ROCm b1374 | identicos | 65k configurado | 58.1 tok/s decode corto y 1223.1 tok/s prefill 1k en Strix Halo | MIT (heredada) | GGUF generico, multiplataforma |
| Otros modelos de ~26B MoE con ~4B activos | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos medidos en la informacion es frente a llama.cpp sobre el mismo GGUF y el mismo hardware; no se aportan cifras de modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- El repositorio figura con 0.0 GB de tamano y 0 descargas: verificar que los artefactos `.loom` y `model.json` esten realmente disponibles antes de integrarlo en un pipeline.
- Es un artefacto de empaquetado, no un modelo entrenado por loom-draft; cualquier merito o defecto de calidad del texto corresponde al checkpoint base ReadyArt/Dark-Scarlett-v1.0-26B-A4B-GGUF.
- La informacion sobre arquitectura, numero de parametros, contexto nativo, idiomas y capacidades del checkpoint base no esta disponible; no se debe asumir el MoE 26B-A4B sin verificarlo en la model card original.
- El soporte de hardware esta limitado a Strix Halo (gfx1151) y R9700 (gfx1201) segun la model card; no hay evidencia de funcionamiento en otras GPU AMD ni en NVIDIA.
- Las mediciones de rendimiento se tomaron en runners DevLab que difieren entre sesiones y con la espera activa habilitada, lo que consume CPU; los numeros pueden no reproducirse en equipos de usuario.
- Los resultados para la R9700 no se han vuelto a medir; no hay cifras propias para esa GPU.
- No hay datos de benchmarks de calidad, sesgos, tasas de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- La licencia MIT del paquete permite uso comercial, pero conviene confirmar la licencia y las condiciones del checkpoint base y de los datos con los que fue entrenado antes de desplegarlo en produccion.
- El modo de razonamiento se controla con `enable_thinking`; el ejemplo de la model card lo desactiva, por lo que el comportamiento por defecto del template no queda documentado.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/ReadyArt-Dark-Scarlett-v1.0-26B-A4B-loom
- Checkpoint base (GGUF): https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-26B-A4B-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ejecucion de referencia en DevLab Dispatch: https://github.com/loom-fun/loom-next/actions/runs/45884687074
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
