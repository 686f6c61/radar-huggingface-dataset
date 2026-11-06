# AbrahamPJ/nightmare-wan22-animate14b-lightx2v

## Resumen

Nightmare Wan 2.2 Animate 14B LightX2V es una conversión comunitaria del modelo de generación de vídeo Wan 2.2 Animate 14B de Alibaba, publicada por el desarrollador AbrahamPJ. Se trata de una cuantización GGUF en Q4_0 con la LoRA de destilación de pasos y CFG de lightx2v ya fusionada en los pesos, de modo que el modelo puede ejecutar inferencia en 4 pasos con cfg 1 sin necesidad de cargar ninguna LoRA en tiempo de ejecución. El resultado está pensado para entornos con recursos limitados, en particular dispositivos móviles con aceleración NPU.

La relevancia de esta ficha es acotada: el autor la marca explícitamente como archivada y no la integra en su runtime Nightmare, que para transferencia de movimiento usa Wan 2.2 Fun 5B Control por ser aproximadamente 18 veces más rápido en teléfono. Aun así, documenta una metodología de conversión reproducible (fusión de LoRA en bf16 antes de cuantizar, con verificación byte a byte contra el GGUF de referencia de QuantStack) que resulta útil para quien necesite replicar el proceso con otros modelos de la familia Wan.

El modelo hereda la arquitectura de difusión de Wan 2.2 Animate, con 17.274.817.108 parámetros reales según los safetensors, un repositorio de 10,4 GB y licencia Apache 2.0. La información disponible sobre contexto, idiomas o benchmarks es muy limitada, por lo que varias filas de especificaciones quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusión (modelo de vídeo Wan 2.2 Animate), según librería `wan2.2` |
| Parametros totales | 17.274.817.108 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_0 (tipos por tensor idénticos a QuantStack: q4_0, q4_1, f32, bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 10,4 GB); pesos base en safetensors bf16 |

## Arquitectura y entrenamiento

El modelo es una adaptación del checkpoint Wan 2.2 Animate 14B de Alibaba, un modelo de difusión para generación y animación de vídeo. Sobre los pesos bf16 originales de Comfy-Org (`wan2.2_animate_14B_bf16.safetensors`) se fusionó la LoRA de destilación de pasos y CFG de lightx2v (`lightx2v_I2V_14B_480p_cfg_step_distill_rank64_bf16`, rango 64) con fuerza 1. La fusión se realizó antes de cuantizar, porque fusionar sobre un Q4_0 ya cuantizado degrada la mayor parte de la LoRA.

Tras la fusión, cada tensor se cuantizó al mismo tipo por tensor que empleó QuantStack en su GGUF Q4_0, bajo la cabecera GGUF de QuantStack. El autor verificó el método reproduciendo byte a byte el archivo de QuantStack al cuantizar el bf16 sin fusionar. De los 1.441 tensores, 1.261 cambian (pares `lora_up`/`lora_down`, `diff` sumado a pesos y `diff_b` a sesgos, escala 1, sin alphas); los otros 180 y la cabecera son idénticos. No se dispone de información sobre el dataset de entrenamiento original ni sobre el proceso de RLHF/DPO.

## Capacidades

- Generación y animación de vídeo a partir de imagen (image-to-video) y transferencia de movimiento, heredadas de Wan 2.2 Animate.
- Inferencia en 4 pasos con cfg 1 gracias a la LoRA de destilación fusionada, sin cargar LoRA en tiempo de ejecución.
- Ejecución en dispositivos móviles mediante el fork de stable-diffusion.cpp de Nightmare (parche `backend-patches/dit/054`), medido en Snapdragon 8 Elite con Hexagon v79.
- Resolución de trabajo validada en 832x480 (480p).
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Transferencia de movimiento en dispositivos móviles: el modelo permite animar una imagen con el movimiento de un vídeo de referencia directamente en un teléfono con Snapdragon 8 Elite, usando el fork de stable-diffusion.cpp de Nightmare. Es adecuado por su cuantización Q4_0 y su inferencia en 4 pasos, aunque el propio autor lo considera superado por Wan 2.2 Fun 5B Control en este escenario.
- Prototipado de pipelines de vídeo en hardware modesto: al caber en 10,4 GB de pesos GGUF, permite experimentar con animación image-to-video en equipos sin GPUs de gama alta.
- Reproducción de metodología de conversión: sirve como referencia para quien necesite fusionar LoRAs de destilación en modelos Wan antes de cuantizar a GGUF, con verificación byte a byte contra el archivo de QuantStack.
- Evaluación de calidad de fusión de LoRA: útil para comparar la salida del modelo con la LoRA fusionada frente al modelo con LoRA en tiempo de ejecución (el autor reporta 33 dB entre ambas salidas).
- Generación de clips cortos de animación para pruebas de concepto: adecuado para validar ideas de animación a 480p antes de escalar a modelos mayores.
- Investigación sobre cuantización de modelos de difusión de vídeo: el repositorio documenta tipos por tensor y el efecto de fusionar antes o después de cuantizar, lo que resulta útil para estudiar la degradación de LoRAs en GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor sí reporta mediciones cualitativas en un Galaxy S25 Ultra (Snapdragon 8 Elite, Hexagon v79): la salida es equivalente a la del modelo con LoRA en tiempo de ejecución (33 dB entre ambas) y entre un 3 y un 7 % más rápida a 832x480.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo GGUF ocupa 10,4 GB, por lo que se necesita al menos esa cantidad de memoria (más overhead del runtime) para cargar los pesos.
- GPU recomendadas: no disponible. El autor valida ejecución en móvil con Snapdragon 8 Elite (Hexagon v79) mediante stable-diffusion.cpp.
- ¿Cabe en GPU de consumo? No hay datos confirmados; por tamaño (10,4 GB) podría caber en GPUs con 12 GB o más, pero no está verificado en la información disponible.
- Opciones de despliegue: stable-diffusion.cpp (fork de Nightmare, parche `backend-patches/dit/054`); otros runtimes GGUF no confirmados.
- Latencia y throughput: solo se indica que es entre un 3 y un 7 % más rápido que la variante con LoRA en tiempo de ejecución a 832x480 en el dispositivo medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | LoRA fusionada | Licencia | Notas |
|---|---|---|---|---|---|
| AbrahamPJ/nightmare-wan22-animate14b-lightx2v | 17.274.817.108 | GGUF Q4_0 | Sí (lightx2v r64) | Apache 2.0 | Archivado; validado en móvil |
| QuantStack/Wan2.2-Animate-14B-GGUF | no disponible | GGUF Q4_0 | No | Apache 2.0 (según base) | Referencia de cuantización usada por el autor |
| Wan-AI/Wan2.2-Animate-14B | no disponible | safetensors bf16 | No | Apache 2.0 | Modelo base original |
| Wan 2.2 Fun 5B Control | no disponible | no disponible | no disponible | no disponible | Usado por Nightmare para transferencia de movimiento; ~18x más rápido en móvil según el autor |

## Limitaciones y advertencias

- Modelo archivado: el autor no lo integra en Nightmare y lo conserva solo como registro de la conversión.
- Para transferencia de movimiento en móvil, Wan 2.2 Fun 5B Control es aproximadamente 18 veces más rápido según el autor.
- La fusión de la LoRA antes de cuantizar es crítica; hacerlo sobre un Q4_0 ya cuantizado pierde la mayor parte de la LoRA.
- Solo se valida resolución 480p (832x480); no hay datos sobre otras resoluciones.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo base en la información proporcionada.
- Licencia Apache 2.0, lo que permite uso comercial, pero se recomienda verificar las condiciones del modelo base Wan-AI y de la LoRA de lightx2v.
- No hay benchmarks publicados que permitan comparar calidad objetiva frente a alternativas.
- El soporte de runtimes es limitado: la validación se hizo con un fork específico de stable-diffusion.cpp.

## Enlaces

- Hugging Face: https://huggingface.co/AbrahamPJ/nightmare-wan22-animate14b-lightx2v
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-Animate-14B
- Cuantización de referencia: https://huggingface.co/QuantStack/Wan2.2-Animate-14B-GGUF
- LoRA de destilación: https://huggingface.co/lightx2v/Wan2.1-I2V-14B-480P-StepDistill-CfgDistill-Lightx2v
- Runtime Nightmare: https://github.com/AbrahamPaulJ/nightmare-mobile
