# litert-community/Falcon-H1-0.5B-Instruct

## Resumen

Falcon-H1-0.5B-Instruct en formato LiteRT-LM es una conversión del modelo `tiiuae/Falcon-H1-0.5B-Instruct` de TII (Technology Innovation Institute) al formato `.litertlm`, pensada para inferencia on-device con el runtime LiteRT-LM de Google. El modelo original emplea una arquitectura híbrida poco habitual: cada una de sus 36 capas ejecuta en paralelo una rama de atención con grouped-query attention y una rama Mamba2 de selective-scan, sumando ambas salidas sobre la misma entrada. Esto combina caché KV clásica con estado recurrente de tamaño constante (convolución + SSM), lo que reduce el coste de memoria en contextos largos.

La conversión, mantenida por la comunidad `litert-community`, cuantiza dinámicamente a int8 las capas lineales y el embedding, manteniendo convoluciones y scan en coma flotante, con activaciones fp32 declaradas para la ruta GPU. El resultado es un único fichero de 650 MB que incluye tokenizer y plantilla de chat ChatML estilo Falcon-H1, con firmas de prefill múltiples (1–1024 tokens) para que el runtime elija fragmentos ajustados.

Su relevancia actual radica en ser, según el autor de la conversión, el primer Falcon-H1 en formato LiteRT y la primera arquitectura plenamente híbrida (atención + Mamba2 en todas las capas) servida por el runtime publicado, incluida la ruta GPU. Está orientado a despliegue en móviles y dispositivos de borde, no a servidores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención GQA + Mamba2 en paralelo en cada una de las 36 capas |
| Parametros totales | 0.5B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (firmas de prefill exportadas de 1 a 1024 tokens) |
| Tipos de cuantizacion | int8 dinámica en lineales y embedding; convoluciones y scan en float; activaciones fp32 para GPU |
| Idiomas soportados | no disponible |
| Licencia | Falcon LLM License (otros términos, enlace en la model card) |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero publicado de 650 MB |

## Arquitectura y entrenamiento

El modelo base Falcon-H1 es un diseño híbrido de TII en el que cada capa combina dos ramas que operan en paralelo sobre la misma entrada: una rama de atención con grouped-query attention (GQA) y una rama Mamba2 de selective-scan, cuyas salidas se suman. Como consecuencia, cada capa mantiene simultáneamente una caché KV y un estado recurrente de tamaño constante (convolución + SSM), lo que cambia el perfil de memoria respecto a un transformer puro.

La conversión a LiteRT-LM aplica cuantización int8 dinámica sobre las capas lineales y el embedding, dejando convoluciones y scan en coma flotante, y declara activaciones fp32 para la ejecución en GPU. El fichero incluye el tokenizer y la plantilla de chat estándar de Falcon-H1. La model card reporta una verificación de correctitud frente al modelo PyTorch: coincidencia de logits con diferencia máxima de 7,6e-05, correlación 1,000000 y top-1/top-5 idénticos en 8 posiciones de decodificación. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional e instructiva, con plantilla de chat ChatML estilo Falcon-H1.
- Razonamiento básico y respuesta a preguntas simples (el propio autor documenta fallos a nivel del modelo 0.5B, como una multiplicación 8×7).
- Ejecución on-device en CPU y GPU (Metal en iOS, OpenCL en Android) mediante LiteRT-LM.
- Prefill por fragmentos ajustados gracias a firmas múltiples de 1 a 1024 tokens.
- Soporte de plantilla de chat actualizada para la forma de content-parts de litert-lm 0.18 (la forma de cadena no cambia).
- Tool calling, function calling, agentes multi-paso, visión y audio: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones móviles: el fichero de 650 MB y el runtime LiteRT-LM permiten ejecutar el modelo en iPhone y Android sin conexión, con TTFT de 0,46 s en iPhone 17 Pro vía Metal.
- Clasificación y resumen de texto en el dispositivo: útil cuando los datos no pueden salir del terminal por privacidad, aprovechando la ejecución local en CPU con un pico de memoria de 0,66 GB en iPhone 17 Pro.
- Autocompletado y generación de borradores en editores móviles: la decodificación de 52,7 tok/s en GPU de iPhone 17 Pro hace viable la generación incremental en interacción de teclado.
- Enrutado y preprocesado de consultas antes de enviarlas a un modelo mayor en la nube: el modelo puede reformular o clasificar peticiones localmente, reduciendo latencia y coste de red.
- Pruebas de integración de pipelines LiteRT-LM: sirve como modelo de referencia pequeño para validar delegación de subgrafos en GPU (Pixel 8a delega todos los subgrafos con cero rechazos).
- Demos educativas de arquitecturas híbridas atención + SSM: al ser la primera arquitectura plenamente híbrida servida por el runtime, permite estudiar el comportamiento de la caché KV combinada con estado recurrente en hardware real.
- Prototipado de aplicaciones de borde en dispositivos de 8 GB: la model card recomienda la ruta CPU en Android de gama 8 GB, con decodificación de 22,5–25,9 tok/s en Pixel 8a.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye medidas de rendimiento del runtime y una prueba de calidad de 8 preguntas:

| Medición | Contexto | Resultado |
|---|---|---|
| Coincidencia de logits vs PyTorch | 8 posiciones de decodificación | max\|diff\| 7,6e-05; correlación 1,000000; top-1 y top-5 idénticos |
| Prueba de 8 preguntas | int8 vs float vs GPU | 6/8 en las tres variantes, texto casi idéntico |
| Barrido de longitud de prompt | 12–60 tokens, motor nuevo por longitud | 41/41 correctos |
| Prueba de calidad compuesta | iPhone 17 Pro (Metal) | 7/8 |
| Delegación de subgrafos | Pixel 8a (OpenCL) | 5366/5366, cero rechazos |

Rendimiento en Apple M4 Max con `litert-lm benchmark` (litert-lm 0.16.0, `-p 256 -d 256 --runs 3 --cache no`):

| Backend | Prefill (256) | Decode | TTFT |
|---|---|---|---|
| GPU | 2650 tok/s | 127,5 tok/s | 0,10 s |
| CPU | 473 tok/s | 59,0 tok/s | 0,56 s |

Rendimiento on-device (arranque en frío, prompt compuesto de 145 tokens):

| Dispositivo | Backend | Prefill | Decode | TTFT | Memoria pico |
|---|---|---|---|---|---|
| iPhone 17 Pro | GPU (Metal) | 365,9 tok/s | 52,7 tok/s | 0,46 s | 2,50 GB |
| iPhone 17 Pro | CPU | 332,3 tok/s | 36,2 tok/s | 0,48 s | 0,66 GB |
| Pixel 8a (Tensor G3) | GPU (OpenCL) | 23,6 tok/s | 11,8 tok/s | 0,93 s | no disponible |
| Pixel 8a (CPU) | CPU | 89,6–98,7 tok/s | 22,5–25,9 tok/s | 2,19–2,41 s | 1373–1374 MiB |

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Formato / despliegue | Licencia |
|---|---|---|---|---|---|
| Falcon-H1-0.5B-Instruct (LiteRT-LM) | 0.5B | Híbrida GQA + Mamba2 en 36 capas | no disponible (prefill 1–1024) | `.litertlm`, LiteRT-LM ≥ 0.15 | Falcon LLM License |
| tiiuae/Falcon-H1-0.5B-Instruct | 0.5B | Híbrida GQA + Mamba2 | no disponible | safetensors, transformers | Falcon LLM License |
| Alternativas de 0.5B en formato on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks comparativos con otros modelos de 0.5B que permitan una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Calidad propia de un modelo de 0.5B: la prueba de 8 preguntas falla 2 de 8 (una respuesta en francés y la multiplicación 8×7), y esos fallos se reproducen también en la versión float, por lo que no son daño de la cuantización.
- Bug de runtime documentado: en litert-lm 0.18.0, un `Engine` reutilizado para una segunda conversación reutiliza tokens de prompt compartidos y no reinicia el estado recurrente, ignorando el system prompt de la nueva conversación. El autor recomienda crear un `Engine` nuevo por conversación. Existe un fix en main desde el 2026-11-03 (commit e1f86b05) que ninguna release incluye todavía (v0.19.1 no lo lleva).
- El fichero publicado actualmente (re-empaquetado el 2026-11-09) no se ha ejecutado en teléfono; la verificación GPU en dispositivos corresponde a un empaquetado anterior.
- En Android de gama baja la GPU mejora el prefill y el TTFT pero no la decodificación, que está limitada por ancho de banda de memoria; la manifest recomienda `cpu` en dispositivos de 8 GB hasta que una ejecución GPU con el mismo binario lo aclare.
- Requiere litert-lm ≥ 0.15; para la ruta GPU en Android hay que consultar los problemas conocidos del runtime.
- Licencia Falcon LLM License: no es una licencia open source estándar; revisar los términos de uso comercial en el enlace oficial antes de desplegar en producción.
- Idiomas soportados no documentados; no se debe asumir cobertura multilingüe.
- Riesgo de alucinación inherente a un modelo de este tamaño; no apto para tareas de alta precisión sin verificación externa.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Falcon-H1-0.5B-Instruct
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-0.5B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Términos de licencia Falcon: https://falconllm.tii.ae/falcon-terms-and-conditions.html
- Issue reportado sobre reutilización de Engine: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Commit con el fix del runtime: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
