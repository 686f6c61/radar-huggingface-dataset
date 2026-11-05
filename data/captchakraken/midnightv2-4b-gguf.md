# CaptchaKraken/MidnightV2-4B-GGUF

## Resumen

MidnightV2-4B-GGUF es la distribucion en formato GGUF del modelo MidnightV2-4B de CaptchaKraken, un modelo especializado en la resolucion de captchas basados en imagenes con elementos marcados (los tipicos retos de "señala el semaforo" o "arrastra la pieza hasta su hueco"). A diferencia de un modelo generativo convencional, se trata de un modelo *pointer*: no genera texto, sino que lee su respuesta completa (accion, puntos, arrastres, texto y el numero del elemento marcado bajo cada punto) a partir de un unico prefill del prompt mediante cabezas auxiliares ligeras.

El modelo se construye sobre el language model multimodal Qwen3.5-4B (con vision encoder) al que se le ha fusionado un adaptador LoRA especifico de la tarea. Los pesos GGUF contienen unicamente el LLM y el encoder visual; las cabezas de prediccion (pointer heads) se distribuyen aparte en `pointer_heads.safetensors` y requieren un cliente parcheado para funcionar. Esta separacion es clave para entender su despliegue.

Su relevancia es doble: por un lado, ofrece una via de ejecucion en CPU mediante llama.cpp para un modelo de 4.205.751.296 parametros; por otro, documenta un enfoque poco habitual (prediccion por cabezas sobre estados ocultos en lugar de generacion autoregresiva) aplicado a un dominio muy concreto. La licencia LGPL-3.0 y la ausencia de datos de benchmarks publicos en esta variante GGUF limitan por ahora su evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-4B: language model + vision encoder) con cabezas pointer externas; inferencia por prefill, sin generacion autoregresiva |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, BF16 (LLM); F16 (mmproj, encoder visual) |
| Idiomas soportados | no disponible |
| Licencia | LGPL-3.0 |
| Formato de pesos | GGUF (LLM y mmproj), safetensors (pointer heads) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal con language model y vision encoder, sobre el que se ha entrenado un adaptador LoRA especifico para la tarea de pointer. En la exportacion a GGUF el LoRA ya esta fusionado en los pesos, y el bloque `pointer` del `config.json` original se elimina porque llama.cpp no reconoce ese plugin; las arquitecturas se revierten a `Qwen3_5ForConditionalGeneration`. El resultado son dos ficheros: el LLM cuantizado (Q4_K_M o BF16) y el encoder visual en un `mmproj` separado en F16.

El entrenamiento se realizo sobre 43.963 tableros (boards) en una unica RTX 5080, segun los datos publicados en el repo base. La innovacion tecnica central es que la respuesta no se decodifica token a token: se ejecuta un unico prefill con embeddings activados y pooling `NONE`, se extrae el estado oculto final de **todos** los tokens del prompt (texto e imagen, en orden de prompt) y se alimentan a las cabezas de `pointer_heads.safetensors`, que producen accion, puntos, arrastres, texto y el numero de elemento marcado. El fichero `pointer_states.cpp` implementa la parte de llama.cpp (extraccion de estados por token con libllama y libmtmd). Las cabezas corresponden al commit `c5c1620` del cliente CaptchaKraken mas el parche `client-fixes.patch`, que anade la cabeza de numero de elemento; el cliente sin parchear rechaza estas cabezas.

## Capacidades

- Prediccion de acciones sobre captchas basados en imagenes: seleccion de puntos, arrastres (drags), introduccion de texto y marcado de elementos.
- Identificacion del numero de elemento marcado bajo cada punto, gracias a la cabeza anadida por el parche del cliente.
- Procesamiento conjunto de texto e imagen en un unico prefill multimodal.
- Inferencia en CPU sin generacion autoregresiva, lo que reduce la latencia a un solo paso de prefill mas el calculo de las cabezas.
- Ejecucion con llama.cpp mediante los binarios estandar (libllama y libmtmd) junto con la herramienta de referencia `pointer_states.cpp`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de tarea unica.
- Capacidades multilingues: no disponibles (no documentadas).

## Casos de uso

- Resolucion automatizada de captchas de elementos marcados en pipelines de scraping o testing: el modelo recibe la imagen del reto y devuelve puntos y el numero de elemento, sustituyendo la generacion de texto por un unico prefill.
- Automatizacion de pruebas de accesibilidad en formularios con retos visuales: se integra en un cliente que construye el prompt con `captchakraken.pointer.heads` y `layout` y decodifica la salida de las cabezas.
- Despliegue en entornos sin GPU: la pareja Q4_K_M (2,7 GB) mas mmproj F16 (0,67 GB) permite ejecutar el modelo en CPU con llama.cpp, util para servidores modestos o CI.
- Investigacion sobre modelos pointer: sirve como referencia reproducible para estudiar la prediccion por cabezas sobre estados ocultos frente a la generacion autoregresiva.
- Reentrenamiento y ajuste fino: el repo LoRA asociado (`MidnightV2-4B-LoRA`) permite continuar el entrenamiento con nuevas cabezas o dominios.
- Procesamiento por lotes de tableros en un servicio interno: al ser un modelo de prefill, el coste por peticion es acotado y predecible, adecuado para volumenes moderados en CPU.
- Comparacion de familias de tamano (0.8B, 2B, 4B) para elegir el equilibrio entre precision y recursos en un mismo dominio de captchas.

## Benchmarks y rendimiento

Los resultados publicados corresponden al modelo base `CaptchaKraken/MidnightV2-4B` evaluado en bf16 con transformers sobre el Tier 2 gate (1.067 tableros reales etiquetados a mano), no a esta build GGUF, que solo ha sido probada de forma superficial (carga y devuelve estados de 2.560 dimensiones por token, pero no se ha puntuado en el gate).

| Metrica | Marcado | Plano (overall) |
|---|---|---|
| Tier 2 gate (global) | 74,2 % | 75,2 % |
| Stills | 76,9 % | 77,9 % |
| Video | 58,9 % | 59,5 % |

Las mediciones de cuantizacion citadas en la model card corresponden al modelo de 0.8B, no al 4B: Q4_K_M igualo en precision al bf16 en el gate de stills (102 % de respuestas resueltas frente a vLLM bf16), y cuantizar el mmproj no aporto mejora de velocidad. Para el 4B no hay datos de rendimiento en CPU publicados.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M (2,7 GB) + mmproj F16 (0,67 GB) + cabezas (37 MB) caben en equipos con unos 4-6 GB de RAM libre; BF16 (8,4 GB) + mmproj requiere del orden de 10 GB.
- GPU: el repo esta pensado para CPU con llama.cpp; para GPU el autor recomienda usar el bf16 `CaptchaKraken/MidnightV2-4B` con vLLM. No se especifican modelos de GPU concretos.
- Consumer GPU: no aplica de forma directa; la ruta GPU recomendada es vLLM con los pesos bf16 del repo base.
- Opciones de despliegue: llama.cpp (con `pointer_states.cpp` para extraer estados), vLLM (repo base bf16), cliente CaptchaKraken parcheado con `client-fixes.patch`.
- Latencia y throughput: no disponibles para el 4B. En el 0.8B se observo que el modelo es compute-bound y que aproximadamente la mitad del tiempo por tablero corresponde al vision encoder, por lo que el 4-bit apenas reduce latencia y solo ahorra tamano de descarga y RAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MidnightV2-4B-GGUF (este) | 4,21 B | no disponible | Pointer multimodal, prefill + cabezas, CPU | LGPL-3.0 | GGUF, BF16, mmproj, cabezas |
| MidnightV2-4B | 4,21 B | no disponible | Mismo modelo, bf16 para vLLM (GPU) | LGPL-3.0 | Pesos bf16 |
| TwilightV2-2B | ~2 B | no disponible | Pointer multimodal, misma familia | no disponible | Repo HF |
| SunlightV2-0.8B | ~0,8 B | no disponible | Pointer multimodal, misma familia | no disponible | Repo HF |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada; la model card remite a una tabla de resultados (`RESULTS_TABLE`) que no se incluye en el texto extraido.

## Limitaciones y advertencias

- Modelo de tarea unica: no es un asistente general; no genera texto libre ni soporta conversacion, tool calling ni agentes.
- Las cabezas no estan incluidas en los GGUF: es obligatorio descargar `pointer_heads.safetensors` y usar el cliente parcheado con `client-fixes.patch`; el cliente `c5c1620` sin parchear rechaza estas cabezas.
- Esta build GGUF solo ha pasado una prueba de humo; no esta puntuada en el gate, por lo que su precision real en CPU no esta verificada.
- Rendimiento notablemente inferior en video (58,9 % marcado) que en imagenes fijas (76,9 %), segun los datos del modelo base.
- Riesgo de error en captchas no vistos: la tasa de acierto del 74,2 % implica un porcentaje significativo de fallos; no es apta para escenarios que exijan precision casi total.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no documentados.
- Licencia LGPL-3.0: permite uso comercial, pero impone obligaciones de copyleft sobre la biblioteca modificada; conviene revisar el cumplimiento si se distribuye el software enlazado.
- Dependencia de versiones concretas de llama.cpp (commit `785322d` para la conversion) y del cliente CaptchaKraken; cambios de version pueden romper la compatibilidad de las cabezas.

## Enlaces

- Repo GGUF: https://huggingface.co/CaptchaKraken/MidnightV2-4B-GGUF
- Modelo base bf16: https://huggingface.co/CaptchaKraken/MidnightV2-4B
- Adaptador LoRA: https://huggingface.co/CaptchaKraken/MidnightV2-4B-LoRA
- Familia Sunlight V2 (0.8B): https://huggingface.co/CaptchaKraken/SunlightV2-0.8B
- Familia Twilight V2 (2B): https://huggingface.co/CaptchaKraken/TwilightV2-2B
- Detector CNN de elementos (large): https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-large
- Detector CNN de elementos (lite): https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-lite
