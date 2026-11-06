# CaptchaKraken/SunlightV2-0.8B-LoRA

## Resumen

SunlightV2-0.8B-LoRA es el adaptador LoRA sin fusionar (junto con las cabezas de "pointer") del modelo CaptchaKraken SunlightV2-0.8B, un modelo especializado en la resolucion de captchas construido sobre Qwen/Qwen3.5-0.8B. Lo desarrolla el usuario CaptchaKraken y pertenece a la familia Sunlight V2, que incluye variantes de 0.8B, 2B (Twilight V2) y 4B (Midnight V2). El modelo no genera texto: es un modelo de tipo "pointer" que, a partir de un unico prefill de un prompt fijo, produce directamente la respuesta completa (accion, puntos, arrastres, texto y momento de video) mediante cabezas ligeras.

Este repositorio concreto contiene el resultado de entrenamiento sin fusionar: el adaptador LoRA de rango 16 para el modelo base y las cabezas pointer en float32. La mayoria de usuarios deberia usar la version fusionada (CaptchaKraken/SunlightV2-0.8B) para vLLM o la version GGUF para llama.cpp; este repositorio esta pensado para continuar el entrenamiento o fusionar el adaptador sobre otra compilacion del modelo base.

La relevancia de esta ficha radica en que documenta un caso de uso muy especializado (resolucion automatica de captchas) con una arquitectura poco habitual (modelo base multimodal con cabezas de prediccion de coordenadas y acciones), y en que el adaptador permite reutilizar el entrenamiento sobre variantes del modelo base. El modelo base Qwen/Qwen3.5-0.8B aporta el encoder de lenguaje y el tower de vision sobre el que se aplica el LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen/Qwen3.5-0.8B) con adaptador LoRA (rango 16, alpha 32) y cabezas pointer ligeras |
| Parametros totales | 0.8B (modelo base); el adaptador LoRA y las cabezas anaden una fraccion no cuantificada en la informacion disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El repositorio contiene pesos en safetensors (bf16 para el adaptador y float32 para las cabezas); las variantes de la familia incluyen GPTQ 4-bit (W4A16) y GGUF (Q4_K_M, BF16, mmproj) |
| Idiomas soportados | no disponible |
| Licencia | LGPL-3.0 |
| Formato de pesos | safetensors (adapter_model.safetensors y pointer_heads.safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer multimodal con tower de vision, y le aplica un adaptador LoRA de rango 16 y alpha 32 sobre las proyecciones de atencion, atencion lineal y MLP del modelo de lenguaje, asi como sobre las proyecciones `qkv`, `proj` y `linear_fc*` del tower de vision. Sobre esa base se anaden cabezas pointer que leen la respuesta completa (accion, puntos, arrastres, texto y momento de video) a partir de un unico prefill del prompt. No hay generacion de texto autoregresiva: el modelo emite directamente la estructura de respuesta.

El entrenamiento corresponde a la ejecucion `20261030-100636-qwen-0.8b`: 43.963 tableros de captcha, 1 epoca, learning rate 1e-4 (1e-3 para las cabezas), acumulacion de gradiente 8, y la mitad de los tableros dibujados con marcas de elemento numeradas. El prompt es fijo y unico ("every captcha is asked the same prompt"). Las cabezas usan un layout antiguo (`PACKED = 165`) sin cabeza de numero de elemento, distinto del de las variantes de 2B y 4B (225), y son compatibles exactamente con el cliente del commit `ef2ec28` de CaptchaKraken; clientes posteriores rechazaran estas cabezas.

## Capacidades

- Prediccion de acciones de captcha (clics, arrastres, seleccion de puntos) a partir de una imagen y un prompt fijo.
- Prediccion de coordenadas (puntos) sobre la imagen del captcha.
- Prediccion de arrastres (drag) con punto de origen y destino.
- Prediccion de texto asociado al captcha.
- Prediccion del momento de video (video moment) para captchas de tipo video.
- Procesamiento multimodal: combina el tower de vision del modelo base con las cabezas pointer.
- Inferencia en un unico prefill, sin generacion de texto paso a paso.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step en el sentido habitual; la tarea es una prediccion directa.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Resolucion automatizada de captchas de seleccion de imagenes: el modelo recibe la imagen del tablero y el prompt fijo y devuelve los puntos a clicar, lo que permite integrarlo en pipelines de automatizacion de pruebas o en herramientas de accesibilidad.
- Resolucion de captchas de arrastre: predice el punto de origen y el de destino del arrastre, util para automatizar interacciones de tipo slider o drag-and-drop en entornos controlados.
- Resolucion de captchas de video: predice el momento temporal relevante dentro de un video, adecuado para captchas que piden identificar un instante concreto.
- Entrenamiento continuado o ajuste fino: al ser un adaptador LoRA sin fusionar, permite continuar el entrenamiento sobre el mismo modelo base o fusionarlo sobre otra compilacion de Qwen/Qwen3.5-0.8B para adaptarlo a un dominio concreto.
- Evaluacion y benchmarking de sistemas anti-bot: sirve como referencia para medir la robustez de captchas propios frente a modelos automatizados, comparando tasas de exito en el conjunto de validacion (Tier 2, 1.067 tableros etiquetados a mano).
- Despliegue en produccion con vLLM: la variante fusionada (CaptchaKraken/SunlightV2-0.8B) esta preparada para servirse con vLLM 0.25.1 aplicando `client-fixes.patch` sobre el commit `ef2ec28`, lo que permite integrarla en servicios de inferencia por GPU.
- Despliegue en CPU: la variante GGUF (Q4_K_M, BF16) permite ejecutar el modelo con llama.cpp en entornos sin GPU.

## Benchmarks y rendimiento

Resultados del conjunto de validacion Tier 2 (1.067 tableros reales etiquetados a mano, servidos con vLLM 0.25.1), segun la model card de la variante fusionada:

| Variante | Sin marcas | Con marcas |
|---|---|---|
| bf16 (CaptchaKraken/SunlightV2-0.8B) | 53.5% | 51.3% |
| GPTQ 4-bit (SunlightV2-0.8B-q4) | 53.9% | 50.8% |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo de 0.8B en bf16, la huella de pesos ronda el orden de 1,6 GB, a lo que hay que sumar las cabezas y el tower de vision (cifra exacta no disponible).
- GPU recomendadas: la variante fusionada esta pensada para vLLM 0.25.1 en GPU; la variante GPTQ 4-bit (W4A16) reduce requisitos de VRAM. No se especifican modelos concretos de GPU en la informacion disponible.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; por tamano (0.8B) es plausible en GPUs de consumo con cuantizacion, pero no hay dato oficial.
- Opciones de despliegue: vLLM 0.25.1 (variantes bf16 y GPTQ), llama.cpp (variante GGUF con Q4_K_M, BF16 y mmproj).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (Tier 2) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SunlightV2-0.8B (familia) | 0.8B | no disponible | 53.5% / 51.3% (bf16) | LGPL-3.0 | vLLM, GGUF, GPTQ |
| TwilightV2-2B | 2B | no disponible | no disponible | LGPL-3.0 (segun familia) | Hugging Face |
| MidnightV2-4B | 4B | no disponible | no disponible | LGPL-3.0 (segun familia) | Hugging Face |

Las variantes de 2B y 4B usan un layout de cabezas distinto (`PACKED = 225`, con cabeza de numero de elemento), por lo que no son intercambiables con este adaptador. No se dispone de datos de rendimiento de esas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador y las cabezas usan un layout antiguo (`PACKED = 165`) sin cabeza de numero de elemento; clientes con el layout posterior (cambios del 30-10-2026) rechazaran estas cabezas.
- Requiere aplicar `client-fixes.patch` sobre el commit `ef2ec28` de CaptchaKraken antes de servir con vLLM 0.25.1; el parche corrige dos bugs de serving (marcadores de video completos y desactivacion de prefix caching).
- No genera texto: no es utilizable como modelo de lenguaje general, chatbot ni para tareas de razonamiento o codigo.
- Tasa de acierto moderada: en torno al 50-54% en el conjunto Tier 2, por lo que no es fiable como resolutor universal de captchas.
- Licencia LGPL-3.0: impone obligaciones de copyleft debiles sobre la biblioteca; conviene revisar las condiciones antes de un uso comercial o de distribucion.
- Uso potencialmente problematico: la resolucion automatizada de captchas puede vulnerar terminos de servicio de sitios web y legislacion aplicable; el uso debe limitarse a entornos controlados, pruebas de robustez o accesibilidad.
- Idiomas soportados no disponibles; el prompt es fijo y en ingles, lo que limita su adaptacion a otros contextos.
- Riesgo de alucinacion en coordenadas y texto: al predecir directamente puntos y cadenas sin generacion autoregresiva, puede producir salidas fuera de rango o incorrectas sin mecanismo de correccion.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (04-11-2026), lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B-LoRA
- Modelo fusionado bf16: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B
- Variante GPTQ 4-bit: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B-q4
- Variante GGUF: https://huggingface.co/CaptchaKraken/SunlightV2-0.8B-GGUF
- Familia Twilight V2 (2B): https://huggingface.co/CaptchaKraken/TwilightV2-2B
- Familia Midnight V2 (4B): https://huggingface.co/CaptchaKraken/MidnightV2-4B
- Detector CNN de elementos (large): https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-large
- Detector CNN de elementos (lite): https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-lite
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
