# CaptchaKraken/TwilightV2-2B

## Resumen

TwilightV2-2B es un modelo especializado en la resolucion de CAPTCHAs desarrollado por CaptchaKraken. Se trata de un fine-tuning mediante LoRA (rango 16, fusionado) sobre el modelo base Qwen/Qwen3.5-2B, con cabezas adicionales (`pointer_heads.safetensors`) que permiten leer la respuesta completa (accion, puntos, arrastres, texto y momento de video) a partir de un unico prefill del prompt. No genera texto: es un modelo de tipo pointer que vLLM ejecuta como modelo de pooling mediante el plugin `CaptchaPointerForConditionalGeneration`.

El modelo forma parte de la familia Twilight V2, que incluye variantes de 0.8B (Sunlight V2) y 4B (Midnight V2), todas construidas sobre la misma arquitectura de puntero. Su relevancia radica en que aborda una tarea concreta y dificil (resolucion automatica de CAPTCHAs de distintos tipos: click, grid, video y type) con un modelo pequeno (2.213 millones de parametros) que cabe en una GPU consumer y ofrece latencias muy bajas (mediana de 64 ms por respuesta en una RTX 5080).

El modelo se entreno con 43.963 tableros (aproximadamente 1,9 pasadas sobre 23.343 filas) y se distribuye en formato bf16 para vLLM, con variantes GGUF para llama.cpp y un adaptador LoRA sin fusionar para entrenamiento adicional. La licencia es LGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-2B) con cabezas pointer adicionales; inferencia como modelo de pooling en vLLM |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (repo principal); GPTQ W4A16 (repo `TwilightV2-2B-q4`, no publicado aun); GGUF Q4_K_M y BF16 (repo `TwilightV2-2B-GGUF`) |
| Idiomas soportados | no disponible |
| Licencia | LGPL-3.0 |
| Formato de pesos | safetensors (bf16 fusionado); GGUF; adaptador LoRA sin fusionar |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer de 2.213 millones de parametros. Sobre el se aplico un fine-tuning LoRA de rango 16 que se fusiono en los pesos finales, y se anadieron cabezas pointer independientes (archivo `pointer_heads.safetensors`) que leen la respuesta directamente de una unica pasada de prefill del prompt, sin decodificacion autoregresiva de texto. El prompt es fijo: todos los CAPTCHAs se plantean con el mismo prompt.

El entrenamiento (run `20261102-qwen-2b-44k`) uso 43.963 tableros, lo que equivale a unas 1,9 pasadas sobre 23.343 filas. Se empleo learning rate 1e-4 (1e-3 para las cabezas), acumulacion de gradiente de 8, gradient checkpointing y la mitad de los tableros se dibujaron con marcas de elemento numeradas. El entrenamiento se realizo en una sola RTX 5080 con 0,65 s por tablero y un pico de 10,8 GiB de memoria. La integracion con vLLM requiere el commit `ef2ec28` del cliente CaptchaKraken mas el parche `client-fixes.patch` incluido en el repo; sin el parche, el cliente rechaza estas cabezas. Se probo con vLLM 0.25.1 y es necesario definir `VLLM_ENABLE_V1_MULTIPROCESSING=0`.

## Capacidades

- Resolucion de CAPTCHAs de tipo click (seleccion de puntos en imagen).
- Resolucion de CAPTCHAs de tipo grid (seleccion de celdas).
- Resolucion de CAPTCHAs de tipo video (seleccion del momento del clip).
- Resolucion de CAPTCHAs de tipo type (introduccion de texto).
- Lectura de la respuesta completa (accion, puntos, arrastres, texto y momento de video) en un unico prefill, sin generacion de texto.
- Soporte de tableros con marcas de elemento numeradas (modo `marked=True`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni agentes.
- Capacidades multilingues: no disponible.

## Casos de uso

- Automatizacion de pruebas de accesibilidad: el modelo puede resolver CAPTCHAs de distintos tipos en pipelines de QA para verificar que los sistemas de verificacion funcionan correctamente, gracias a su capacidad de leer la respuesta en un unico prefill con latencia de decenas de milisegundos.
- Investigacion en seguridad de CAPTCHAs: permite evaluar la robustez de disenos de CAPTCHA (click, grid, video, type) de forma automatizada, comparando tasas de exito entre variantes de la familia Twilight V2 (0.8B, 2B, 4B).
- Servicio de resolucion en produccion con vLLM: al ejecutarse como modelo de pooling en vLLM 0.25.1, puede desplegarse en una GPU consumer (RTX 5080) con una mediana de 64 ms por respuesta, adecuado para integraciones de baja latencia.
- Procesamiento por lotes en CPU: la variante GGUF (Q4_K_M y BF16) permite resolver tableros en entornos sin GPU mediante llama.cpp, util para auditorias masivas o entornos aislados.
- Entrenamiento y ajuste continuo: el adaptador LoRA sin fusionar (`TwilightV2-2B-LoRA`) permite seguir entrenando el modelo con nuevos tipos de tableros o dominios especificos sin partir de cero.
- Deteccion combinada con el detector CNN: junto con `CaptchaKrakenV2-CNN-large` o `CaptchaKrakenV2-CNN-lite`, el modelo puede integrarse en un pipeline completo de deteccion de elementos y resolucion de tableros.
- Evaluacion comparativa de modelos: sus resultados por tipo de tablero (click, grid, video, type) permiten seleccionar la variante de la familia (0.8B, 2B, 4B) segun el tipo de CAPTCHA dominante en un despliegue.

## Benchmarks y rendimiento

Resultados en el conjunto de validacion Tier 2 (1.067 tableros reales etiquetados a mano, servidos con vLLM 0.25.1). Tasa de resolucion, plano / con marcas:

| Tipo (n) | 2B bf16 | 0.8B bf16 |
|---|---|---|
| Todos | 72,6% / 68,2% | 53,5% / 51,3% |
| Click (674) | 76,3% / 73,3% | 60,4% / 58,5% |
| Grid (223) | 75,8% / 62,3% | 31,8% / 26,0% |
| Video (158) | 54,4% / 55,1% | 56,3% / 57,6% |
| Type (12) | 50,0% / 62,5% | 33,3% / 25,0% |

De 2.129 respuestas, el 2B resuelve 489 que el 0,8B falla y pierde 106 que el 0,8B resuelve (neto +383). El tipo video es el unico que no mejora. La latencia mediana es de 64 ms por respuesta en una RTX 5080. El 0,8B se entreno con una version anterior de los datos (2026-10-30), por lo que parte de la diferencia no se debe solo al tamano del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5 GB en bf16 (tamano del repo); el entrenamiento uso un pico de 10,8 GiB en una RTX 5080.
- GPU recomendadas: RTX 5080 (probada, 64 ms de mediana por respuesta); cualquier GPU con al menos 6 GB de VRAM para bf16.
- Cabe en GPU consumer: si, en RTX 5080 y modelos con VRAM suficiente; la variante GGUF Q4_K_M permite ejecucion en CPU.
- Opciones de despliegue: vLLM 0.25.1 con el plugin `CaptchaPointerForConditionalGeneration` (requiere `VLLM_ENABLE_V1_MULTIPROCESSING=0`); llama.cpp mediante la variante GGUF; el cliente `captchakraken.pointer.service.PointerService` con el commit `ef2ec28` mas `client-fixes.patch`.
- Latencia y throughput: mediana de 64 ms por respuesta en RTX 5080; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de resolucion (Todos, plano) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TwilightV2-2B | 2.213 M | no disponible | 72,6% | LGPL-3.0 | Hugging Face (bf16, GGUF, LoRA) |
| SunlightV2-0.8B | no disponible | no disponible | 53,5% | no disponible | Hugging Face |
| MidnightV2-4B | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- El tipo video es el unico que no mejora respecto al 0,8B (54,4% frente a 56,3% en plano), por lo que no es adecuado como unica solucion para CAPTCHAs de video.
- El tipo type tiene muy pocas muestras en el conjunto de validacion (12), por lo que su tasa (50,0% / 62,5%) tiene alta incertidumbre.
- El modelo no genera texto ni razona: solo produce respuestas pointer a partir de un prompt fijo; no sirve para tareas generales de lenguaje.
- Requiere el commit `ef2ec28` del cliente CaptchaKraken mas `client-fixes.patch`; el cliente sin parche rechaza las cabezas.
- En vLLM 0.25.1 el plugin solo se registra en el proceso llamante; es necesario `VLLM_ENABLE_V1_MULTIPROCESSING=0`.
- Riesgo de alucinacion: no disponible (el modelo no genera texto libre).
- Sesgos conocidos: no disponible.
- Licencia LGPL-3.0: permite uso comercial, pero impone obligaciones de copyleft sobre la biblioteca modificada; revisar compatibilidad antes de integrar en productos propietarios.
- El modelo se entreno con datos de una fecha concreta; tableros con disenos nuevos pueden degradar la tasa de exito.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CaptchaKraken/TwilightV2-2B
- Adaptador LoRA sin fusionar: https://huggingface.co/CaptchaKraken/TwilightV2-2B-LoRA
- Variante GGUF: https://huggingface.co/CaptchaKraken/TwilightV2-2B-GGUF
- Variante 0.8B (Sunlight V2): https://huggingface.co/CaptchaKraken/SunlightV2-0.8B
- Variante 4B (Midnight V2): https://huggingface.co/CaptchaKraken/MidnightV2-4B
- Detector CNN large: https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-large
- Detector CNN lite: https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-lite
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
