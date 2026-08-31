# lamao-ab/paligemma-blind-assist-qlora-merged-v1

## Resumen

PaliGemma Blind-Assist es un modelo de lenguaje y visión (VLM) desarrollado por lamao-ab (Ahmed Boussihmed) como adaptador de asistencia para personas con discapacidad visual. Se construye sobre el modelo base `google/paligemma-3b-mix-224` de Google, fine-tuneado con QLoRA en cuantizacion 4-bit NF4 con doble cuantizacion. El resultado es un checkpoint fusionado y autónomo de aproximadamente 2,92 mil millones de parametros que ocupa 2,10 GB en memoria, optimizado para despliegue en dispositivos de borde como el NVIDIA Jetson Orin Nano.

El modelo esta entrenado sobre el dataset VizWiz, un corpus especifico de preguntas y respuestas visuales realizadas por personas ciegas, y responde a indicaciones como "describe the scene for a visually impaired person". En las metricas del dominio objetivo, el adaptador supera al modelo base en VizWiz-VQA (75,71 frente a 73,95) y mejora sustancialmente en VizWiz-Caps (CIDEr-D de 97,44 frente a 55,31). La relevancia actual de este modelo reside en su enfoque de eficiencia parametrica: consigue un rendimiento casi identico al de un LoRA en precision completa con aproximadamente un tercio del consumo de memoria, lo que facilita su ejecucion local en hardware de consumo o embebido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PaliGemma (vision transformer + transformer decoder, basada en SigLIP y Gemma) |
| Parametros totales | 2.923.466.480 (2,92 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (max seq de entrenamiento) |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (checkpoint fusionado) |
| Idiomas soportados | No disponible (entrenado principalmente en ingles, segun el dataset VizWiz) |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | safetensors (checkpoint fusionado, 4-bit) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura PaliGemma de Google, que combina un codificador de vision SigLIP con un decodificador Transformer Gemma de 3 mil millones de parametros. El proceso de entrenamiento emplea QLoRA con cuantizacion 4-bit NF4 y doble cuantizacion sobre el modelo base, manteniendo congelados los pesos cuantizados y entrenando un adaptador de bajo rango. El adaptador tiene rango 8, alpha 16 y dropout 0,05, con 11,3 millones de parametros entrenables, lo que representa el 0,385 % del total. Se aplico a las proyecciones q/k/v/o y a las capas gate/up/down del transformer.

El entrenamiento se realizo sobre el dataset VizWiz con 137.678 muestras de entrenamiento y 27.569 de validacion, durante 3 epocas y 3.225 pasos con un batch efectivo de 128 (16 × 8 de acumulacion de gradientes). Se utilizo el optimizador `paged_adamw_8bit` con una tasa de aprendizaje de 2e-4 y programacion coseno con warmup del 3 %. El pico de memoria GPU durante el entrenamiento fue de 64,4 GB y la mejor perdida de validacion fue 1,6723 en el checkpoint 2152. El checkpoint final es el resultado de fusionar el adaptador QLoRA con el modelo base cuantizado, de modo que no requiere BitsAndBytesConfig adicional para cargarse.

## Capacidades

- Respuesta a preguntas visuales (VQA) en el dominio de asistencia a personas ciegas, con soporte para respuestas de tipo si/no, numeros, descripciones abiertas y respuestas de "no respondible" cuando la imagen no permite responder.
- Generacion de descripciones de imagenes (image captioning) con metricas CIDEr-D de 97,44 en VizWiz-Caps, muy por encima del modelo base (55,31).
- Comprension de imagenes de resolucion 224x224 píxeles gracias al procesador PaliGemma.
- Mantiene capacidades generales de VQA y captioning fuera del dominio de asistencia, aunque con una ligera degradacion respecto al modelo base (VQAv2 80,72 frente a 81,65; COCO-Caps CIDEr-D 123,34 frente a 131,21).
- Inferencia en dispositivos de borde con requisitos reducidos de memoria (2,10 GB en memoria).
- El checkpoint incluye la configuracion de cuantizacion incrustada, por lo que no requiere configuracion adicional de bitsandbytes para su carga.
- No se menciona soporte explicito de tool calling, function calling, agentes o modo de razonamiento.

## Casos de uso

- Aplicacion movil de asistencia visual: el modelo puede describir el entorno y responder preguntas concretas ("¿hay algun obstaculo delante?", "¿que color es este objeto?") en tiempo real desde un telefono con GPU, gracias a su tamano reducido de 2,10 GB y su cuantizacion 4-bit.
- Dispositivo wearable para personas con discapacidad visual: integrable en gafas o camaras corporales que capturan imagenes y generan descripciones auditivas mediante sintesis de voz, con latencia aceptable en hardware embebido.
- Sistema de ayuda en el hogar conectado: un asistente domestico que analiza fotografias de objetos, etiquetas o alimentos y responde preguntas sobre ellos, aprovechando la robustez del modelo en preguntas de tipo "unanswerable" cuando la informacion no esta disponible.
- Robotica de asistencia: un robot que necesita interpretar escenas y responder a comandos basados en vision, con un modelo lo suficientemente ligero para ejecutarse en una Jetson Orin Nano (compute capability sm_87).
- Prototipado academico de VLM eficientes: punto de partida para investigacion sobre fine-tuning con QLoRA en el dominio de accesibilidad, dado que el autor publica tanto el checkpoint fusionado como el adaptador LoRA por separado.
- Despliegue en servidores de inferencia gestionados: el modelo es compatible con plataformas como FriendliAI, que ofrece inferencia de baja latencia y cuantizaciones adicionales (FP4, FP8, INT4, INT8), lo que permite escalarlo a produccion sin infraestructura propia.

## Benchmarks y rendimiento

Resultados publicados en la model card, correspondientes a la ejecucion con semilla 123 (media ± desviacion estandar sobre 3 semillas: 42, 123, 7).

**VizWiz-VQA (dominio objetivo)**

| Modelo | Overall | Yes/No | Number | Other | Unans. |
|---|---|---|---|---|---|
| Base (PaliGemma 3B mix-224) | 73,95 | 88,71 | 66,10 | 66,10 | 91,67 |
| QLoRA (este modelo) | 75,71 ±0,14 | 86,54 | 63,88 | 66,51 | 97,68 |

**VizWiz-Caps (dominio objetivo)**

| Modelo | CIDEr-D | BLEU-4 | METEOR | ROUGE-L | Longitud |
|---|---|---|---|---|---|
| Base | 55,31 | 12,07 | 14,08 | 28,76 | 5,03 |
| QLoRA | 97,44 ±1,45 | 30,63 ±0,29 | 23,30 ±0,35 | 49,33 ±0,38 | 10,24 |

**VQAv2 (dominio general, control)**

| Modelo | Overall | Yes/No | Number | Other |
|---|---|---|---|---|
| Base | 81,65 | 94,74 | 67,53 | 73,49 |
| QLoRA | 80,72 ±0,04 | 94,38 | 65,20 | 72,39 |

**COCO-Caps (dominio general, control)**

| Modelo | CIDEr-D | BLEU-4 | METEOR | ROUGE-L | Longitud |
|---|---|---|---|---|---|
| Base | 131,21 | 31,96 | 30,62 | 59,17 | 12,40 |
| QLoRA | 123,34 ±1,75 | 34,26 ±0,60 | 30,44 ±0,09 | 58,39 ±0,28 | 11,22 |

El modelo QLoRA iguala practicamente al LoRA en precision completa (VizWiz-VQA 75,71 frente a 75,80; CIDEr-D 97,4 frente a 98,1; val loss 1,6723 frente a 1,6655) con aproximadamente un tercio de la huella de memoria.

## Requisitos de hardware

- Memoria en RAM/VRAM: 2,10 GB segun `model.get_memory_footprint()`, lo que permite inferencia en GPUs de consumo con 4 GB o mas de VRAM.
- GPUs compatibles: cualquier GPU NVIDIA con soporte CUDA y bitsandbytes. El autor menciona especificamente NVIDIA Jetson Orin Nano (compute capability sm_87), para lo cual hay que compilar bitsandbytes desde fuente.
- Entrenamiento: pico de 64,4 GB de VRAM, lo que requiere una GPU profesional como A100 (80 GB) o H100, o configuraciones multi-GPU.
- Opciones de despliegue: transformers con bitsandbytes, plataformas gestionadas como FriendliAI (con cuantizaciones adicionales FP4, FP8, INT4, INT8), y compatible con text-generation-inference y endpoints.
- Latencia y throughput: no disponibles en la informacion publicada, aunque el tamano del modelo y su cuantizacion 4-bit sugieren inferencia interactiva en hardware de gama media.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Dominio | Notas |
|---|---|---|---|---|---|
| PaliGemma Blind-Assist (este) | 2,92 B | 512 | Gemma | Asistencia a ciegos | QLoRA 4-bit, 2,10 GB en memoria |
| google/paligemma-3b-mix-224 | 2,92 B | 512 | Gemma | Vision-language general | Modelo base sin fine-tuning especifico |
| google/paligemma-3b-pt-224 | 2,92 B | 512 | Gemma | Vision-language general | Variante preentrenada, sin fine-tuning por tarea |

La comparativa se limita a las variantes de PaliGemma porque no se dispone de informacion publicada sobre otros modelos de asistencia a ciegos comparables con los mismos benchmarks (VizWiz). El modelo QLoRA supera al base en el dominio objetivo (VizWiz) y lo iguala en el general con una degradacion minima, a cambio de un footprint de memoria reducido.

## Limitaciones y advertencias

- La licencia Gemma de Google impone restricciones de uso comercial: no se permite su uso para determinados fines prohibidos (como generar contenido danino) y requiere aceptar los terminos de uso de Google. Verificar los terminos completos antes de desplegar en produccion.
- El modelo se evaluo principalmente en ingles, segun el dataset VizWiz; no se aportan datos de rendimiento en otros idiomas.
- Degradacion en dominios generales: en VQAv2 y COCO-Caps el modelo pierde entre 0,9 y 7,9 puntos respecto al base, lo que indica cierto sobreajuste al dominio de asistencia.
- La cuantizacion 4-bit NF4 puede introducir perdidas de precision en tareas numericas o de razonamiento complejo; el autor reporta una caida en la categoria "Number" de VizWiz-VQA (63,88 frente a 66,10 del base).
- La resolucion de entrada esta fijada en 224x224 píxeles, lo que limita la lectura de texto pequeno o detalles finos en imagenes.
- La longitud de contexto de 512 tokens restringe la generacion de descripciones muy largas o dialogos multi-turno extensos.
- La carga del modelo requiere bitsandbytes y CUDA; en sistemas sin GPU o con GPUs no NVIDIA no funcionara sin modificaciones.
- El autor no publica informacion sobre sesgos especificos del modelo, aunque al estar entrenado sobre VizWiz (un dataset de preguntas reales de personas ciegas) puede heredar los sesgos de ese corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lamao-ab/paligemma-blind-assist-qlora-merged-v1
- Perfil del autor (lamao-ab): https://huggingface.co/lamao-ab
- Variante LoRA sin fusionar: https://huggingface.co/lamao-ab/paligemma-blind-assist-lora-merged-v1
- Version preparada para Jetson: https://huggingface.co/lamao-ab/paligemma-blind-assist-jetson-ready
- Despliegue en FriendliAI (checkpoint QLoRA): https://friendli.ai/models/lamao-ab/paligemma-blind-assist-qlora-merged-v1
- Despliegue en FriendliAI (variante v1): https://friendli.ai/models/lamao-ab/paligemma-blind-assist-v1
- Documentacion de PaliGemma (big_vision): https://google-research.github.io/big_vision/big_vision/configs/proj/paligemma/
- Dataset VizWiz: https://vizwiz.org/
- Paper de QLoRA: https://arxiv.org/abs/2305.14314
- Modelo base: https://huggingface.co/google/paligemma-3b-mix-224
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
