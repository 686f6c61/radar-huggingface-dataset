# CaptchaKraken/SunlightV2-0.8B-GGUF

## Resumen

SunlightV2-0.8B-GGUF es la distribución en formato GGUF del modelo Sunlight V2, un modelo "pointer" de CaptchaKraken orientado a la resolución automática de captchas. Está construido sobre una base Qwen3.5-0.8B (arquitectura multimodal con encoder de visión) y se distribuye cuantizado para ejecución en CPU mediante llama.cpp. El modelo no genera texto libre: produce, a partir de los estados ocultos por token, la localización (coordenadas de puntero) de los elementos del captcha que el cliente debe pulsar, arrastrar o teclear.

La relevancia de esta ficha radica en que es el miembro más pequeño de la familia Sunlight V2 (junto a Twilight V2 de 2B y Midnight V2 de 4B) y el único que ofrece builds GGUF para CPU. Con 752.393.024 parámetros reales y un contexto no especificado, está pensado para entornos donde no hay GPU disponible, a cambio de una tasa de resolución menor que sus hermanos mayores y que la API alojada Abyss.

El modelo se publica bajo licencia LGPL-3.0 y requiere un flujo de inferencia específico: prefill con embeddings activados, pooling `NONE`, extracción del estado oculto final de cada token del prompt y alimentación de las cabezas de puntero (`pointer_heads.safetensors`), que no están incluidas en el GGUF. El cliente CaptchaKraken 4.2.0 es necesario para construir el prompt y decodificar la salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-0.8B) con encoder de visión y cabezas de puntero externas; exportada como `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, BF16 (modelo); F16 (mmproj de visión) |
| Idiomas soportados | no disponible |
| Licencia | LGPL-3.0 |
| Formato de pesos | GGUF (llama.cpp) + `pointer_heads.safetensors` |
| Modelo base | CaptchaKraken/SunlightV2-0.8B |
| Tamano del repo | 4,5 GB |
| Fecha de creacion | 2026-11-04 |
| Ultima actualizacion | 2026-11-13 |
| Descargas | 610 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer multimodal con encoder de visión y fusión de modalidades, al que CaptchaKraken añade un bloque de cabezas de puntero entrenadas específicamente para la tarea. Estas cabezas operan sobre los estados ocultos por token del prompt (tokens de texto e imagen, en orden de prompt) y producen la localización de los elementos del captcha. El GGUF se genera a partir del export bf16 con `convert_hf_to_gguf.py` (commit `785322d` de llama.cpp), restaurando `config.json` a `Qwen3_5ForConditionalGeneration` y eliminando el bloque `pointer`, que llama.cpp no reconoce; el encoder de visión se exporta por separado como `mmproj-SunlightV2-0.8B-F16.gguf`.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La innovación técnica destacable es el diseño "pointer": el modelo no genera texto, sino que se apoya en los estados ocultos por token para localizar elementos interactivos, lo que permite resolver captchas de distinto tipo (clic, arrastre, escritura, pulsación mantenida) sin un decodificador autoregresivo convencional. La verificación de fidelidad de la cuantización reporta coseno p50 de 0,986 entre Q4_K_M y BF16 (mínimo 0,94), con todos los valores finitos.

## Capacidades

- Localización de elementos de captcha mediante cabezas de puntero sobre estados ocultos por token.
- Procesamiento de entrada multimodal: texto e imagen a través del encoder de visión (`mmproj`).
- Soporte de interacción de tipo clic, arrastre, escritura y pulsación mantenida, según el cliente CaptchaKraken.
- Construcción de prompt y decodificación de salida mediante el cliente CaptchaKraken 4.2.0 (`captchakraken.pointer.heads` y `layout`).
- Ejecución en CPU con llama.cpp (builds AVX2 y AVX-512).
- No es un modelo conversacional ni de generación de texto libre; la etiqueta "conversational" del repo no implica un uso de chat general.
- Capacidades multilingües: no disponibles.
- No se documenta soporte de tool calling, agentes ni modo thinking.

## Casos de uso

- Resolución de captchas en pipelines de automatización web: el modelo se integra con el cliente CaptchaKraken para localizar el elemento a pulsar o arrastrar en páginas con hCaptcha, reCAPTCHA, GeeTest, etc., usando el GGUF Q4_K_M en servidores sin GPU.
- Despliegue en entornos de CPU con recursos limitados: con 0,53 GB para Q4_K_M y 0,20 GB para el mmproj, cabe en máquinas modestas y permite atender captchas con latencias del orden de 0,9-1,5 s por tablero en un Ryzen 9850X3D con 8 hilos.
- Pruebas de accesibilidad y QA de formularios: el modelo puede usarse para verificar que los elementos interactivos de una página son localizables por un agente visual, como paso previo a auditorías de usabilidad.
- Automatización de tareas de scraping ético con consentimiento: en flujos donde el propietario del sitio autoriza la automatización, el modelo resuelve los retos de verificación sin intervención humana.
- Investigación sobre modelos "pointer" multimodales: sirve como referencia pequeña (0,8B) para estudiar la extracción de estados ocultos por token y el uso de cabezas externas en llama.cpp.
- Evaluación comparativa de robustez de captchas: el modelo permite medir la eficacia de distintos vendors (hCaptcha, FunCaptcha, NetEase Yidun, etc.) en un banco local de 149 tipos de captcha de 18 proveedores.
- Integración en herramientas de automatización de escritorio con entrada táctil emulada (Pixel 7), aunque con una tasa de resolución móvil notablemente inferior (54 %).

## Benchmarks y rendimiento

Los datos de la model card corresponden a la tasa de resolución end-to-end (Tier 3) del producto CaptchaKraken, no a benchmarks académicos. Se comparan Sunlight, Twilight, Midnight y la API alojada Abyss.

| Metrica | Sunlight | Twilight | Midnight | Abyss (API) |
|---|---|---|---|---|
| Pares resueltos (todas las variedades) | 73 % (219/298) | 79 % (236/298) | 84 % (251/298) | 88 % (263/298) |
| Movil (Pixel 7) | 54 % (15/28) | 86 % (24/28) | 79 % (22/28) | 86 % (24/28) |
| Gauntlet | 100 % (2/2) | 100 % (2/2) | 100 % (2/2) | 100 % (2/2) |

| Vendor | Sunlight | Twilight | Midnight | Abyss (API) |
|---|---|---|---|---|
| hCaptcha | 81 % (158/194) | 86 % (166/194) | 92 % (178/194) | 93 % (180/194) |
| Dingxiang | 60 % (12/20) | 70 % (14/20) | 70 % (14/20) | 85 % (17/20) |
| GeeTest | 62 % (10/16) | 75 % (12/16) | 75 % (12/16) | 88 % (14/16) |
| FunCaptcha (Arkose) | 14 % (2/14) | 14 % (2/14) | 14 % (2/14) | 36 % (5/14) |
| NetEase Yidun | 29 % (4/14) | 57 % (8/14) | 64 % (9/14) | 79 % (11/14) |
| reCAPTCHA | 50 % (4/8) | 75 % (6/8) | 75 % (6/8) | 75 % (6/8) |
| BotDetect | 100 % (6/6) | 100 % (6/6) | 100 % (6/6) | 100 % (6/6) |
| Tencent | 100 % (6/6) | 100 % (6/6) | 100 % (6/6) | 100 % (6/6) |
| AWS WAF | 100 % (2/2) | 100 % (2/2) | 100 % (2/2) | 100 % (2/2) |
| CaptchaFox | 100 % (2/2) | 100 % (2/2) | 100 % (2/2) | 100 % (2/2) |
| HUMAN Security | 100 % (2/2) | 100 % (2/2) | 100 % (2/2) | 100 % (2/2) |
| KCAPTCHA | 100 % (2/2) | 100 % (2/2) | 100 % (2/2) | 100 % (2/2) |
| Lemin | 100 % (2/2) | 100 % (2/2) | 100 % (2/2) | 100 % (2/2) |
| MTCaptcha | 100 % (2/2) | 100 % (2/2) | 100 % (2/2) | 100 % (2/2) |
| Press-and-hold bars | 100 % (2/2) | 0 % (0/2) | 100 % (2/2) | 100 % (2/2) |
| Prosopo | 50 % (1/2) | 100 % (2/2) | 100 % (2/2) | 100 % (2/2) |
| Proton | 100 % (2/2) | 100 % (2/2) | 100 % (2/2) | 100 % (2/2) |

Notas: la verificación de fidelidad de la cuantización (Q4_K_M vs BF16, coseno p50 0,986) sí se realizó sobre este build; la comprobación de precisión a nivel de tablero (Q4_K_M conservó el 102 % de las respuestas resueltas por vLLM, BF16 el 100 %) y los tiempos se midieron en el build anterior de Sunlight, con la misma arquitectura y tamaño, y no se han repetido en este. No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/RAM: Q4_K_M ocupa 0,53 GB y BF16 1,5 GB; el encoder de visión (mmproj F16) añade 0,20 GB. El repo completo son 4,5 GB.
- GPU: no es necesario; el build está pensado para CPU. Para GPU, la model card recomienda usar los repos bf16 o q4 con vLLM.
- CPU: probado en un Ryzen 9850X3D con 8 hilos; se ofrecen builds AVX2 y AVX-512.
- Latencia medida (tablero de unos 700 tokens, build anterior): AVX2, BF16 1,87 s y Q4_K_M 1,48 s; AVX-512, BF16 0,92 s y Q4_K_M 0,89 s. Aproximadamente la mitad del tiempo corresponde al encoder de visión.
- El prefill está limitado por cómputo, por lo que la cuantización a 4 bits ahorra principalmente tamaño de descarga y RAM, no tiempo.
- Despliegue: llama.cpp (con `libllama` y `libmtmd`), herramienta de referencia `pointer_states.cpp` y cliente CaptchaKraken 4.2.0. No se documenta soporte de vLLM, Ollama ni TGI para este GGUF.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resolucion Tier 3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SunlightV2-0.8B-GGUF | 752 M | no disponible | 73 % (219/298) | LGPL-3.0 | GGUF para CPU, bf16/q4/LoRA para GPU |
| TwilightV2-2B | no disponible | no disponible | 79 % (236/298) | no disponible | repo en Hugging Face |
| MidnightV2-4B | no disponible | no disponible | 84 % (251/298) | no disponible | repo en Hugging Face |
| Abyss (API alojada) | no disponible | no disponible | 88 % (263/298) | no disponible (servicio) | API |

La comparativa se limita a la propia familia CaptchaKraken; no se dispone de datos de modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El GGUF no incluye las cabezas de puntero: es obligatorio usar `pointer_heads.safetensors` y el flujo de prefill con embeddings y pooling `NONE`; un uso como modelo de chat o generación de texto no funcionará.
- Requiere el cliente CaptchaKraken 4.2.0 para construir el prompt y decodificar la salida; no es un modelo autónomo.
- Tasa de resolución inferior a Twilight, Midnight y Abyss en casi todos los vendors; especialmente baja en FunCaptcha (14 %), NetEase Yidun (29 %) y reCAPTCHA (50 %).
- Rendimiento móvil muy inferior (54 % frente a 86 % de Twilight y Abyss).
- Los tiempos y la comprobación de precisión a nivel de tablero se midieron en el build anterior, no en este; pueden variar.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: no aplica en el sentido habitual (no genera texto), pero sí puede producir localizaciones erróneas o fallos de detección en captchas no vistos.
- Idiomas soportados y longitud de contexto: no disponibles.
- Licencia LGPL-3.0: permite uso comercial con obligaciones de copyleft sobre la biblioteca; conviene revisar la compatibilidad con el producto que la integre.
- Uso ético y legal: la resolución automática de captchas puede vulnerar los términos de servicio de sitios de terceros y la legislación aplicable; el uso debe limitarse a entornos propios o con autorización expresa.
- El repo tiene 0 likes y 610 descargas, lo que sugiere una comunidad pequeña y poca validación externa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B-GGUF
- Modelo base (bf16, vLLM): https://huggingface.co/CaptchaKraken/SunlightV2-0.8B
- Version 4-bit GPTQ: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B-q4
- Adaptador LoRA: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B-LoRA
- Twilight V2 (2B): https://huggingface.co/CaptchaKraken/TwilightV2-2B
- Midnight V2 (4B): https://huggingface.co/CaptchaKraken/MidnightV2-4B
- llama.cpp (commit de conversion `785322d`): https://github.com/ggml-org/llama.cpp
