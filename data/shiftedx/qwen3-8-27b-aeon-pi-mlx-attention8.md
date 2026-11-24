# Shiftedx/Qwen3.8-27B-AEON-Pi-MLX-Attention8

## Resumen

Shiftedx/Qwen3.8-27B-AEON-Pi-MLX-Attention8 es una cuantizacion MLX de 4 bits publicada por el usuario Shiftedx sobre el modelo AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16, al que se le ha aplicado la LoRA de rango 32 del repositorio harness-hub/Qwen3.8-27B-pi-adapted. El resultado es un modelo multimodal de 27.356.728.560 parametros (unos 27,4 B) orientado a inferencia local en Apple Silicon, con pesos del lenguaje en cuantizacion afina 4/8-bit, recurrencia, vision y MTP (multi-token prediction) en BF16, y plantilla de chat de Pi.

El modelo se distribuye exclusivamente en formato MLX (safetensors) y ocupa 22,2 GiB en disco. Su interes practico radica en que combina decodificacion especulativa nativa (MTP con profundidad 3) y vision dentro de un unico paquete optimizado para el runtime MTPLX, ademas de ser compatible con el runtime Kapitsa para contextos de hasta 65.536 tokens. La model card reporta 42,0 tok/s en decodificacion con MTP nativo y 95,6 tok/s con el draft DFlash2 en Kapitsa sobre un M4 Max de 64 GiB.

Se trata de un derivado de la familia Qwen3.5 (tag `qwen3_5`) con capacidades de tool calling, razonamiento con modo thinking y entrada image-text-to-text. La licencia declarada es Apache 2.0, aunque el nombre del modelo base incluye la etiqueta "UNCENSORED", lo que conviene tener en cuenta al evaluar su comportamiento en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 con MTP (multi-token prediction) nativo y torre de vision; pesos de lenguaje cuantizados en MLX afina 4/8-bit, recurrencia/vision/MTP en BF16 |
| Parametros totales | 27.356.728.560 (~27,4 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 16.384 tokens en MTPLX 2.12.3; 65.536 tokens en Kapitsa 0.2.39; calidad verificada hasta 131.072 en el bench del autor |
| Tipos de cuantizacion | Afina 4/8-bit para pesos de lenguaje; BF16 para recurrencia, vision y MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); tamano del repo 23,8 GB, 22,2 GiB de pesos |

## Arquitectura y entrenamiento

La ficha tecnica disponible no detalla la composicion del dataset de preentrenamiento ni el numero de tokens utilizados. Lo que si se documenta es la cadena de derivacion: el modelo parte de AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 (revision `0a19731`) y se le aplica la LoRA de rango 32 de harness-hub/Qwen3.8-27B-pi-adapted (revision `e786f84`), que aporta la plantilla de chat de Pi. Sobre esa combinacion, Shiftedx realiza la conversion a MLX con cuantizacion afina 4/8-bit de los pesos del lenguaje, manteniendo en BF16 la recurrencia, la vision y el modulo MTP.

La innovacion tecnica principal es la integracion del MTP nativo con profundidad 3, que permite decodificacion especulativa dentro del propio modelo sin necesidad de un draft separado. Adicionalmente, la model card documenta la compatibilidad con el draft externo AEON DFlash2 (bloque entrenado de 10) mediante un parche para Kapitsa v0.2.39, con el que se alcanzan 95,6 tok/s manteniendo paridad exacta en 22 de 24 respuestas completas y 24 de 24 en salidas visibles. No se especifican datos sobre RLHF, DPO ni composicion del corpus de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento con modo thinking configurable (`--reasoning on --reasoning-effort medium` en MTPLX; `thinking_control.hard_cap` en Kapitsa).
- Entrada multimodal image-text-to-text: procesamiento de imagenes junto a texto (pipeline `image-text-to-text`).
- Tool calling nativo: la model card reporta 6 de 6 herramientas resueltas en las pruebas de ambos runtimes.
- Capacidades agenticas: el bench del autor reporta 27/30 en la categoria agentic.
- Decodificacion especulativa nativa mediante MTP con profundidad 3 (solo en MTPLX).
- Soporte de draft externo DFlash2 para aceleracion adicional en Kapitsa.
- Cache de prompt reutilizable (`prompt_cache_key`) y cache en disco (8 GiB) para sesiones largas.
- API compatible con OpenAI en `http://127.0.0.1:8000/v1`.
- Capacidad de contexto largo verificada hasta 131.072 tokens en el bench de calidad, aunque los runtimes documentados limitan a 16K (MTPLX) y 64K (Kapitsa).

## Casos de uso

- Asistente local multimodal en Mac: el modelo procesa imagenes y texto en el mismo flujo, con 22,2 GiB de pesos que caben en un equipo Apple Silicon de 64 GiB, lo que permite desplegar un asistente privado sin conexion a servicios externos.
- Agente con tool calling en pipelines internos: los 6 de 6 herramientas resueltas y la API compatible con OpenAI permiten integrarlo en frameworks de agentes existentes sin adaptadores adicionales.
- Analisis de documentos e imagenes tecnicas: la combinacion de vision y contexto de hasta 64K en Kapitsa permite procesar capturas, diagramas o paginas escaneadas junto a instrucciones largas en una sola peticion.
- Chat multi-turno con cache de prompt: reutilizando `prompt_cache_key` y el prefijo sin cambios, el autor reporta 0,87 s hasta el primer token en una sesion de ~63K tokens con cache en RAM, adecuado para asistentes conversacionales de sesion larga.
- Razonamiento con modo thinking en tareas de codigo y matematicas: la model card recomienda dejar el `hard_cap` sin fijar para coding, tools y razonamiento dificil, lo que encaja en tareas de depuracion o generacion de codigo con verificacion.
- Prototipado de agentes multi-paso en local: el soporte de MTP y DFlash2 con paridad de salida verificada permite iterar sobre flujos agenticos con latencias de 42 a 95 tok/s en hardware de consumo Apple.
- Evaluacion de modelos derivados y no censurados: util para investigadores que necesitan comparar el comportamiento de variantes "uncensored" frente a los modelos base en tareas de seguridad y rechazo (XSTest reporta 0/250 falsos rechazos claros).

## Benchmarks y rendimiento

Rendimiento de decodificacion reportado por el autor sobre un M4 Max de 64 GiB (decodificacion excluye prefill; paridad medida contra el modo target-only del mismo runtime):

| Runtime y modo | Decodificacion mediana (tok/s) | Paridad exacta de respuesta | Vision / tools |
|---|---:|---:|---:|
| MTPLX target-only | 17,3 | Referencia | Texto / 6 de 6 tools |
| MTPLX MTP nativo profundidad 3 | 42,0 | 3/4 | 4/4 · 6/6 |
| Kapitsa target-only | 19,9 | Referencia | 4/4 · 6/6 |
| Kapitsa + AEON DFlash2 (build local) | 95,6 | 22/24 completas · 24/24 visibles | 4/4 · 6/6 |
| mlx-dspark + AEON DFlash2 | no disponible | 2/3 sondas de texto | Solo texto probado |

Calidad (Shiftedx Bench `9a43027`, mismos pesos target, Kapitsa target-only, thinking medio):

| Calidad | Agentic | Tools | Vision | Contexto |
|---:|---:|---:|---:|---:|
| 42/50 | 27/30 | 30/30 | 20/20 | 15/15 hasta 131.072 |

Seguridad: XSTest reporta 0/250 falsos rechazos claros en cualquiera de los dos modos, y 52/250 peticiones con thinking activado alcanzaron el limite de 1.024 tokens antes de emitir respuesta final.

Latencia de follow-up en LAN con ~63K tokens (cache local con draft AEON):

| Escenario | Tokens de prompt reutilizados | Primer token | Extremo a extremo |
|---|---:|---:|---:|
| RAM | 63.400 / 63.429 | 0,87 s | 0,97 s |
| SSD tras descarga y recarga del worker | 63.422 / 63.429 | 7,58 s | 7,70 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio: 22,2 GiB de pesos en disco (repo de 23,8 GB). En Apple Silicon unificada, el autor verifica funcionamiento en un M4 Max de 64 GiB; no se documenta el minimo exacto, pero 22,2 GiB de pesos mas overhead de contexto y cache hacen inviable un equipo de 32 GiB para contextos largos.
- GPU recomendadas: exclusivamente Apple Silicon (MLX). No se documenta soporte para CUDA, ROCm ni otras plataformas.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (verificado en M4 Max de 64 GiB). No hay datos para M1/M2/M3 con menos memoria.
- Opciones de despliegue: MTPLX 2.12.3 (texto, tools, vision, MTP nativo), Kapitsa 0.2.39 (texto, tools, vision, contexto 64K, cache en disco 8 GiB) y mlx-dspark 0.20.3 (solo drafting de texto opcional). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: 17,3 tok/s (MTPLX target-only), 42,0 tok/s (MTPLX MTP depth 3), 19,9 tok/s (Kapitsa target-only), 95,6 tok/s (Kapitsa + DFlash2). Primer token de 0,87 s con cache en RAM en sesion de ~63K tokens.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estandar ni de especificaciones de modelos comparables en la informacion proporcionada. La comparativa se limita a las variantes del propio linaje:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Shiftedx/Qwen3.8-27B-AEON-Pi-MLX-Attention8 | ~27,4 B | 16K (MTPLX) / 64K (Kapitsa) | MLX safetensors 4/8-bit | Apache 2.0 | Objeto de esta ficha; vision, MTP, tool calling |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 | ~27,4 B (BF16) | no disponible | BF16 (safetensors) | no disponible | Modelo base; sin cuantizar |
| harness-hub/Qwen3.8-27B-pi-adapted | no disponible | no disponible | LoRA rango 32 | no disponible | Adaptador de plantilla de chat Pi |
| AEON-7/AEON-DFlash2-Qwen3.8-27B | no disponible | no disponible | BF16 | no disponible | Draft de decodificacion especulativa, bloque 10 |

## Limitaciones y advertencias

- El modelo base se etiqueta como "UNCENSORED"; los resultados de XSTest (0/250 falsos rechazos claros) indican una tendencia a no rechazar peticiones, lo que exige filtros externos en produccion.
- 52/250 peticiones con thinking activado agotaron el limite de 1.024 tokens sin respuesta final, lo que puede provocar timeouts en flujos con presupuesto de tokens ajustado.
- Solo funciona en Apple Silicon con MLX; no hay soporte documentado para CUDA, vLLM, llama.cpp, Ollama ni TGI, lo que limita su uso a entornos macOS.
- El contexto maximo depende del runtime: 16.384 tokens en MTPLX 2.12.3 y 65.536 en Kapitsa. Aunque el bench verifica calidad hasta 131.072, los runtimes documentados no ofrecen esa ventana.
- En MTPLX, las peticiones con imagen requieren modo MTP en la version 2.12.3.
- La aceleracion con DFlash2 en Kapitsa requiere aplicar un parche local y compilar desde la rama v0.2.39; no es una configuracion de serie.
- La paridad con el modo target-only no es total: 22/24 respuestas completas identicas y dos trazas de razonamiento distintas con DFlash2; 3/4 con MTP nativo.
- No se declaran idiomas soportados ni datos de sesgo; la evaluacion multilingue queda pendiente.
- El modelo es un derivado de tercera mano (base AEON + LoRA Pi + cuantizacion MLX) con 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- La licencia Apache 2.0 se declara en el repo, pero conviene verificar la licencia del modelo base y de la LoRA por si imponen restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shiftedx/Qwen3.8-27B-AEON-Pi-MLX-Attention8
- Modelo base AEON (BF16): https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16/tree/0a197319321945a4f254e3dff616805d49d61206
- LoRA Pi adaptada: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted/tree/e786f8491742268f9b2bc729697b13bfac26d4ad
- Draft AEON DFlash2 (BF16): https://huggingface.co/AEON-7/AEON-DFlash2-Qwen3.8-27B/tree/964d336d1dd00350362b27e7d2d0173d017cf8f6/bf16
- Dataset Shiftedx Bench: https://huggingface.co/datasets/Shiftedx/shiftedx-bench/tree/9a43027a84dc4a4a283220f58314b5768245ec58
- Repositorio Kapitsa: https://github.com/nace-ai/kapitsa
- Parche Kapitsa AEON block10: incluido en el repo del modelo como `kapitsa-aeon-block10.patch`
