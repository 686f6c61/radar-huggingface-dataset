# CaptchaKraken/TwilightV2-2B-GGUF

## Resumen

TwilightV2-2B-GGUF es la distribucion en formato GGUF del modelo TwilightV2-2B, desarrollado por CaptchaKraken. No es un modelo generativo de texto al uso: se trata de un modelo "pointer" de tercera generacion especializado en resolver captchas. En lugar de generar una respuesta token a token, el modelo procesa el prompt completo (texto e imagen) en un unico prefill y produce su respuesta (accion, puntos de clic, arrastres, texto o momento de video) a traves de unas cabezas ligeras externas que se aplican sobre los estados ocultos de cada token del prompt.

El modelo base subyacente es Qwen3.5-2B, con un adaptador LoRA ya fusionado, y cuenta con 1.881.825.088 parametros totales (aproximadamente 1,88 mil millones). Incluye un codificador de vision (mmproj) que se distribuye por separado en formato f16. Esta version GGUF esta pensada para ejecucion en CPU mediante llama.cpp, y el autor recomienda usar la version bf16 con vLLM para GPU.

La relevancia de esta ficha radica en que es un caso poco habitual: un modelo de dominio muy especifico (resolucion automatica de captchas) empaquetado para inferencia local en CPU, con metricas de exito end-to-end publicadas por el autor sobre 149 tipos de captcha de 18 proveedores. La licencia LGPL-3.0 y la naturaleza del caso de uso plantean consideraciones legales y eticas importantes que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-2B, `Qwen3_5ForConditionalGeneration`) con LoRA fusionado y cabezas "pointer" externas |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q4_K_M (GGUF); mmproj en F16; el autor menciona GPTQ W4A16 en otro repo no publicado |
| Idiomas soportados | no disponible |
| Licencia | LGPL-3.0 |
| Formato de pesos | GGUF (llama.cpp); cabezas en safetensors; mmproj en GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-2B, un transformer multimodal que combina un modelo de lenguaje con un codificador de vision. Sobre esa base se entrena un adaptador LoRA que queda fusionado en los pesos finales. La innovacion central es el mecanismo "pointer": en lugar de decodificar texto de forma autorregresiva, el modelo ejecuta un unico prefill del prompt con embeddings activados y pooling `NONE`, extrae el estado oculto final de cada token del prompt (tanto de texto como de imagen, en orden de prompt) y los pasa a unas cabezas ligeras almacenadas en `pointer_heads.safetensors`. Esas cabezas producen directamente la accion, los puntos, los arrastres, el texto o el momento de video.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada. El autor documenta el proceso de conversion a GGUF con llama.cpp (commit `785322d`, solo CPU): conversion a bf16, generacion del mmproj en f16 y cuantizacion a Q4_K_M con 8 hilos. Las cabezas corresponden al commit de cliente `ef2ec28` de CaptchaKraken mas un parche `client-fixes.patch`; el cliente sin parche rechaza estas cabezas (`PACKED = 225`). Probado con vLLM 0.25.1.

## Capacidades

- Resolucion de captchas mediante prediccion de acciones concretas: clic, arrastre, escritura de texto y seleccion de momento de video.
- Procesamiento multimodal: integra texto e imagen en un unico prefill.
- Salida estructurada a traves de cabezas "pointer" (no genera texto libre).
- Soporte de multiples tipos de captcha (149 tipos de 18 proveedores segun las metricas del autor).
- Funcionamiento en CPU mediante llama.cpp con cuantizacion Q4_K_M.
- Integracion con el cliente CaptchaKraken (Python y JavaScript) para ejecutar la accion en un navegador real.
- No disponible: soporte de tool calling generico, agentes multi-step, capacidades multilingues declaradas o modo "thinking".

## Casos de uso

- Automatizacion de pruebas de accesibilidad y QA sobre formularios protegidos por captcha: el modelo permite a un pipeline de pruebas automatizadas superar el captcha de forma controlada en entornos de staging propios, usando el cliente CaptchaKraken para ejecutar los clics y arrastres.
- Investigacion en seguridad de sistemas anti-bot: permite evaluar la robustez de implementaciones de captcha (hCaptcha, reCAPTCHA, GeeTest, etc.) midiendo tasas de exito por proveedor, como documenta el autor en su tabla Tier 3.
- Despliegue local en CPU sin GPU: gracias al GGUF Q4_K_M (1,3 GB) y al mmproj f16 (0,67 GB), puede ejecutarse en maquinas sin acelerador, util para entornos aislados o de laboratorio.
- Integracion en el cliente CaptchaKraken: el modelo se usa como backend de decision dentro del cliente, que abre un navegador real, localiza el captcha y ejecuta la accion; el modelo solo aporta la prediccion de accion y coordenadas.
- Benchmarking comparativo de modelos pointer: sirve como referencia de la familia Twilight V2 (junto a Sunlight 0,8B y Midnight 4B) para comparar tasas de exito por proveedor y por tipo de captcha.
- Pruebas de regresion de pipelines anti-bot: permite generar trafico de prueba realista (clics, arrastres, texto) para validar que los sistemas de deteccion responden como se espera.

## Benchmarks y rendimiento

El autor publica tasas de exito end-to-end en "Tier 3" (producto completo: cliente + modelo + navegador real), sobre 149 tipos de captcha de 18 proveedores, con 298 pares tipo x cliente. Un par cuenta como resuelto si 2 de 3 intentos tienen exito.

| Pares resueltos | Sunlight | **Twilight** | Midnight | Abyss (API alojada) |
|---|---|---|---|---|
| Todos los tipos | 73% (219/298) | **79% (236/298)** | 84% (251/298) | 88% (263/298) |
| Movil (Pixel 7) | 54% (15/28) | **86% (24/28)** | 79% (22/28) | 86% (24/28) |
| Gauntlet | 100% (2/2) | **100% (2/2)** | 100% (2/2) | 100% (2/2) |

| Proveedor | Sunlight | **Twilight** | Midnight | Abyss (API alojada) |
|---|---|---|---|---|
| hCaptcha | 81% (158/194) | **86% (166/194)** | 92% (178/194) | 93% (180/194) |
| Dingxiang | 60% (12/20) | **70% (14/20)** | 70% (14/20) | 85% (17/20) |
| GeeTest | 62% (10/16) | **75% (12/16)** | 75% (12/16) | 88% (14/16) |
| FunCaptcha (Arkose) | 14% (2/14) | **14% (2/14)** | 14% (2/14) | 36% (5/14) |
| NetEase Yidun | 29% (4/14) | **57% (8/14)** | 64% (9/14) | 79% (11/14) |
| reCAPTCHA | 50% (4/8) | **75% (6/8)** | 75% (6/8) | 75% (6/8) |
| BotDetect | 100% (6/6) | **100% (6/6)** | 100% (6/6) | 100% (6/6) |
| Tencent | 100% (6/6) | **100% (6/6)** | 100% (6/6) | 100% (6/6) |
| AWS WAF | 100% (2/2) | **100% (2/2)** | 100% (2/2) | 100% (2/2) |

Nota: el autor indica que esta build de 2B ha sido "smoke-tested" (carga y devuelve estados de 2048 de ancho para cada token) pero no ha sido puntuada en la gate. Las mediciones de cuantizacion (Q4_K_M tan preciso como bf16 en la gate de imagenes fijas, 102% de respuestas resueltas de vLLM bf16) corresponden a SunlightV2-0.8B, no a este 2B.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M (1,3 GB) + mmproj f16 (0,67 GB) + cabezas (29 MB); en total en torno a 2 GB de RAM para la configuracion recomendada en CPU.
- BF16 GGUF (3,8 GB) + mmproj f16 (0,67 GB) para referencia de mayor precision.
- GPU recomendadas: el autor recomienda usar la version bf16 del repo `CaptchaKraken/TwilightV2-2B` con vLLM en GPU; no se especifican modelos de GPU concretos.
- Cabe en GPU consumer: si, dado el tamano (1,88B parametros); no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp (CPU, recomendado para esta build); vLLM (GPU, con el repo bf16); cliente CaptchaKraken (Python y JavaScript) para ejecutar las acciones.
- Latencia y throughput: no disponibles de forma numerica. El autor senala que un modelo de prefill esta limitado por computo, por lo que 4 bits ahorra principalmente descarga y RAM, no tiempo, y que aproximadamente la mitad del tiempo de cada tablero corresponde al codificador de vision.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de exito (Tier 3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TwilightV2-2B (este) | 1,88B | no disponible | 79% (236/298) | LGPL-3.0 | GGUF en HF, bf16 en HF |
| SunlightV2-0.8B | 0,8B | no disponible | 73% (219/298) | no disponible | HF |
| MidnightV2-4B | 4B | no disponible | 84% (251/298) | no disponible | HF |
| Abyss (API alojada) | no disponible | no disponible | 88% (263/298) | no disponible | API alojada |

## Limitaciones y advertencias

- El uso previsto es la resolucion automatica de captchas, lo que puede contravenir los terminos de servicio de los proveedores y la legislacion aplicable en materia de acceso no autorizado a sistemas; revisar el marco legal antes de cualquier uso.
- Licencia LGPL-3.0: permite uso comercial pero impone obligaciones de copyleft sobre la biblioteca; revisar compatibilidad con el producto.
- El modelo no genera texto: requiere el cliente CaptchaKraken y las cabezas externas; el cliente sin el parche `client-fixes.patch` rechaza estas cabezas (`PACKED = 225`).
- Riesgo de alucinacion en coordenadas y acciones: una prediccion erronea puede provocar clics fuera de objetivo; el autor mitiga con reintentos (2 de 3).
- Rendimiento bajo en FunCaptcha/Arkose (14%) y limitado en NetEase Yidun (57%) y Dingxiang (70%); no es fiable de forma universal.
- Esta build de 2B no ha sido puntuada en la gate; las mediciones de cuantizacion proceden del modelo de 0,8B.
- No se declaran idiomas soportados ni longitud de contexto; no disponible para planificacion de produccion.
- Los datos de entrenamiento y sesgos no estan documentados; no disponible.
- Una imagen por peticion segun `pointer_states.cpp`; no soporta multiples imagenes por prompt en esa herramienta de referencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CaptchaKraken/TwilightV2-2B-GGUF
- Modelo base (bf16, vLLM): https://huggingface.co/CaptchaKraken/TwilightV2-2B
- Adaptador LoRA: https://huggingface.co/CaptchaKraken/TwilightV2-2B-LoRA
- SunlightV2-0.8B: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B
- MidnightV2-4B: https://huggingface.co/CaptchaKraken/MidnightV2-4B
- Repo GPTQ (no publicado): `CaptchaKraken/TwilightV2-2B-q4`
- llama.cpp (commit `785322d`): no disponible como enlace directo en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
