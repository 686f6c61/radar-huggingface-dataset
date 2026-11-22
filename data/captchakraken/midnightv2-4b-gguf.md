# CaptchaKraken/MidnightV2-4B-GGUF

## Resumen

MidnightV2-4B-GGUF es la distribucion en formato GGUF del modelo MidnightV2-4B, un modelo de tipo "pointer" de cuarta generacion (v2) desarrollado por CaptchaKraken para la resolucion automatizada de captchas. A diferencia de un modelo generativo convencional, este modelo no produce texto libre: lee su respuesta completa (accion, puntos de clic, arrastres y texto a introducir) a partir de un unico prefill del prompt mediante unas cabezas ligeras ("pointer heads") que se ejecutan sobre los estados ocultos de cada token. El modelo base subyacente es Qwen3.5-4B, con el adaptador LoRA ya fusionado en los pesos.

Este repositorio concreto contiene exclusivamente los pesos en GGUF pensados para llama.cpp en CPU: una cuantizacion Q4_K_M (2,7 GB), una version BF16 de referencia (8,4 GB) y un codificador de vision mmproj en f16 (0,67 GB). Las cabezas no estan incluidas en los GGUF; se distribuyen por separado en `pointer_heads.safetensors` y requieren un cliente parcheado para funcionar. El modelo totaliza 4.205.751.296 parametros y esta publicado bajo licencia LGPL-3.0.

Su relevancia practica radica en el rendimiento medido en el banco de pruebas Tier 3 del autor: un 84% de pares resueltos (251/298) sobre 149 tipos de captcha de 18 proveedores, superando a las variantes menores Sunlight (0,8B) y Twilight (2B) y acercandose a la API alojada Abyss (88%). Este repositorio es la via de despliegue en CPU para quienes no dispongan de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-4B: modelo de lenguaje + codificador de vision) con cabezas "pointer" externas |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, BF16 (pesos); mmproj en F16 |
| Idiomas soportados | no disponible |
| Licencia | LGPL-3.0 |
| Formato de pesos | GGUF (llama.cpp), safetensors para las cabezas |

## Arquitectura y entrenamiento

El modelo se apoya en Qwen3.5-4B como base, que combina un modelo de lenguaje transformer con un codificador de vision, y sobre el que se ha fusionado un adaptador LoRA entrenado especificamente para la tarea. La innovacion principal es el mecanismo "pointer": en lugar de generar texto token a token, el modelo realiza un unico prefill del prompt (texto e imagen) con embeddings activados y pooling `NONE`, extrae el estado oculto final de cada token del prompt y lo alimenta a las cabezas de `pointer_heads.safetensors`, que decodifican directamente la accion, los puntos, los arrastres y el texto de respuesta. Esto convierte al modelo en un sistema de inferencia acotado y de baja latencia en lugar de un generador autoregresivo.

El proceso de conversion a GGUF se realizo con llama.cpp (commit `785322d`) en modo solo CPU: se exporto el modelo con la arquitectura `Qwen3_5ForConditionalGeneration` y se elimino el bloque "pointer" del config (llama.cpp no conoce el plugin), se genero el BF16 y el mmproj en f16, y se cuantizo a Q4_K_M con `llama-quantize`. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Resolucion de captchas mediante prediccion de acciones: clics, arrastres, pulsaciones mantenidas y escritura de texto.
- Procesamiento de entrada multimodal: texto e imagen en un mismo prefill.
- Salida estructurada a traves de cabezas especializadas (accion, puntos, drags, texto y cabeza de numero de elemento).
- Inferencia de un solo paso (prefill), sin generacion autoregresiva de texto.
- Ejecucion en CPU mediante llama.cpp con la cuantizacion Q4_K_M.
- Integracion con el cliente CaptchaKraken (Python y JavaScript) para la interaccion con navegador real.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad generica; el flujo de resolucion lo orquesta el cliente.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Automatizacion de pruebas de extremo a extremo: el modelo permite a un pipeline de QA superar los captchas de una aplicacion propia durante pruebas de regresion, usando el cliente CaptchaKraken para abrir el navegador y ejecutar la accion predicha.
- Investigacion en seguridad y evaluacion de defensas: sirve para medir la robustez de implementaciones de captcha de distintos proveedores (hCaptcha, reCAPTCHA, GeeTest, Arkose, etc.) reproduciendo tableros locales a partir de capturas reales.
- Despliegue en entornos sin GPU: al distribuirse en GGUF Q4_K_M (2,7 GB) y ejecutarse en llama.cpp sobre CPU, es adecuado para servidores o estaciones de trabajo sin acelerador dedicado.
- Integracion en herramientas de automatizacion de navegador: el cliente puede conectar la prediccion del modelo con frameworks de control de navegador para tareas que requieran interaccion humana simulada sobre paginas con verificacion.
- Procesamiento por lotes de tableros de captcha: el formato GGUF y la inferencia de un solo prefill permiten procesar grandes volumenes de imagenes de verificacion de forma secuencial en CPU.
- Desarrollo y ajuste fino posterior: el repositorio LoRA asociado (`MidnightV2-4B-LoRA`) permite continuar el entrenamiento, mientras que esta version GGUF sirve como referencia de inferencia para validar los pesos fusionados.

## Benchmarks y rendimiento

Los datos publicados corresponden al banco Tier 3 del autor, que mide el producto completo (cliente + modelo) sobre 149 tipos de captcha de 18 proveedores, con 298 pares tipo x cliente. Un par se considera resuelto si acierta 2 de 3 intentos como maximo.

| Metrica | Sunlight (0,8B) | Twilight (2B) | Midnight (4B) | Abyss (API) |
|---|---|---|---|---|
| Todos los tipos | 73% (219/298) | 79% (236/298) | 84% (251/298) | 88% (263/298) |
| Movil (Pixel 7) | 54% (15/28) | 86% (24/28) | 79% (22/28) | 86% (24/28) |
| Gauntlet | 100% (2/2) | 100% (2/2) | 100% (2/2) | 100% (2/2) |

| Proveedor | Sunlight | Twilight | Midnight | Abyss |
|---|---|---|---|---|
| hCaptcha | 81% (158/194) | 86% (166/194) | 92% (178/194) | 93% (180/194) |
| Dingxiang | 60% (12/20) | 70% (14/20) | 70% (14/20) | 85% (17/20) |
| GeeTest | 62% (10/16) | 75% (12/16) | 75% (12/16) | 88% (14/16) |
| FunCaptcha (Arkose) | 14% (2/14) | 14% (2/14) | 14% (2/14) | 36% (5/14) |
| NetEase Yidun | 29% (4/14) | 57% (8/14) | 64% (9/14) | 79% (11/14) |
| reCAPTCHA | 50% (4/8) | 75% (6/8) | 75% (6/8) | 75% (6/8) |
| BotDetect | 100% (6/6) | 100% (6/6) | 100% (6/6) | 100% (6/6) |
| Tencent | 100% (6/6) | 100% (6/6) | 100% (6/6) | 100% (6/6) |

Nota del autor: las mediciones de precision de cuantizacion (Q4_K_M frente a bf16) se realizaron sobre el modelo de 0,8B, no sobre este de 4B. Este build de 4B solo ha pasado una prueba de humo (carga correctamente y devuelve estados de 2.560 dimensiones para cada token), pero no ha sido puntuado en el banco. No se han publicado resultados de benchmarks genericos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M requiere aproximadamente 2,7 GB de pesos mas el mmproj F16 (0,67 GB), alrededor de 3,4 GB en total; la version BF16 necesita unos 8,4 GB mas 0,67 GB del mmproj.
- GPU recomendadas: el autor indica que para GPU se use la version BF16 `CaptchaKraken/MidnightV2-4B` con vLLM; este repositorio GGUF esta pensado para CPU.
- Compatibilidad con GPU de consumo: la version Q4_K_M cabe en cualquier equipo con unos 4 GB de RAM libre; la BF16 requiere al menos 10 GB.
- Opciones de despliegue: llama.cpp (con `llama-quantize` para generar cuantizaciones y `pointer_states.cpp` como herramienta de referencia para extraer estados ocultos); vLLM para la version BF16 en GPU; cliente CaptchaKraken parcheado con `client-fixes.patch` para decodificar las cabezas.
- Latencia y throughput: no disponibles de forma cuantificada para el modelo de 4B. El autor senala que un modelo de prefill esta limitado por computo, por lo que la cuantizacion a 4 bits ahorra principalmente tamano de descarga y RAM, no tiempo; ademas, aproximadamente la mitad del tiempo por tablero corresponde al codificador de vision, donde cuantizar el mmproj no aporto aceleracion (mediciones realizadas sobre el modelo de 0,8B).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resolucion Tier 3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MidnightV2-4B (este) | 4,2B | no disponible | 84% (251/298) | LGPL-3.0 | GGUF, BF16, GPTQ 4-bit, LoRA |
| TwilightV2-2B | 2B (aprox., segun nombre) | no disponible | 79% (236/298) | no disponible | repositorio propio |
| SunlightV2-0.8B | 0,8B (aprox., segun nombre) | no disponible | 73% (219/298) | no disponible | repositorio propio |
| Abyss (API alojada) | no disponible | no disponible | 88% (263/298) | no disponible (servicio) | API |

Las tres variantes de la familia comparten el mismo enfoque "pointer" y el mismo cliente; la comparativa se limita al banco Tier 3 publicado por el autor. No se dispone de datos de benchmarks genericos ni de comparaciones con modelos de proposito general.

## Limitaciones y advertencias

- El modelo no es un generador de texto: solo produce acciones, puntos, arrastres y texto a traves de las cabezas; no admite conversacion libre ni tool calling.
- Las cabezas no estan incluidas en los GGUF; es necesario descargar `pointer_heads.safetensors` y usar el cliente parcheado con `client-fixes.patch`. El cliente sin parchear (commit `c5c1620`) rechaza estas cabezas.
- El build de 4B solo ha pasado una prueba de humo; no ha sido evaluado en el banco Tier 3, por lo que su rendimiento real no esta verificado.
- Rendimiento bajo en FunCaptcha (Arkose), con solo un 14% de pares resueltos, y limitado en NetEase Yidun (64%) y Dingxiang (70%).
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el modelo puede predecir acciones incorrectas sobre tableros imposibles; el cliente debe gestionar esos casos sin bloquearse (el banco Gauntlet lo verifica).
- Idiomas soportados y sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia LGPL-3.0: permite uso comercial, pero impone obligaciones de copyleft sobre la biblioteca; conviene revisar el cumplimiento si se integra en productos propietarios.
- Uso etico y legal: la resolucion automatizada de captchas puede infringir los terminos de servicio de terceros y la legislacion aplicable; el uso previsto por el autor es la evaluacion de defensas y pruebas sobre sistemas propios.
- Cuantizacion: los efectos de Q4_K_M sobre la precision se midieron en el modelo de 0,8B, no en este de 4B.

## Enlaces

- Repositorio GGUF: https://huggingface.co/CaptchaKraken/MidnightV2-4B-GGUF
- Modelo base BF16 (vLLM, GPU): https://huggingface.co/CaptchaKraken/MidnightV2-4B
- Version 4-bit GPTQ (W4A16): https://huggingface.co/CaptchaKraken/MidnightV2-4B-q4
- Adaptador LoRA sin fusionar: https://huggingface.co/CaptchaKraken/MidnightV2-4B-LoRA
- Familia Sunlight V2 (0,8B): https://huggingface.co/CaptchaKraken/SunlightV2-0.8B
- Familia Twilight V2 (2B): https://huggingface.co/CaptchaKraken/TwilightV2-2B
- llama.cpp: https://github.com/ggml-org/llama.cpp
