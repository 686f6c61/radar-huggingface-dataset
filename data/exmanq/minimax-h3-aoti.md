# Exmanq/minimax-h3-aoti

## Resumen

Este repositorio no contiene el modelo MiniMax H3 en sí, sino paquetes de compilación AOT-Inductor (AOTI) para un único `MiniMaxH3TransformerBlock`, el bloque central del modelo de generación omni-modal MiniMax H3 de MiniMax AI. El autor, Exmanq, publica estos artefactos compilados para acelerar la inferencia de los 50 bloques del transformer, eliminando la sobrecarga de lanzamiento de kernels y los epílogos de norm, rotary y AdaLN. El paquete no lleva pesos: en el primer forward, `spaces.aoti_patch` enlaza el `state_dict()` en vivo de cada bloque.

La relevancia de este repositorio es práctica: el modelo subyacente, MiniMax H3, es un generador omni-modal que entiende texto, imagen, vídeo y audio y genera vídeo con audio estéreo nativo hasta 2K y 15 segundos. Estos paquetes AOTI permiten ejecutar los 50 bloques del transformer con una aceleración medida del 4,6 % al 11 % según el tamaño del lienzo, sin cuantizar y en bfloat16, sobre una RTX PRO 6000 Blackwell. El paquete clave usa una dimensión de secuencia dinámica, lo que lo hace válido para cualquier longitud de prompt, duración o lienzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquetes AOT-Inductor para `MiniMaxH3TransformerBlock` (50 bloques) del modelo MiniMax H3 (transformer de difusión) |
| Parametros totales | no disponible (el paquete no contiene pesos; se enlazan en tiempo de ejecución) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | dinámica: S = num_text_tokens + condition_rows + audio_rows + video_rows (sin padding) |
| Tipos de cuantizacion | bfloat16, sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | no aplica (paquetes compilados AOTI; sin pesos en el repo) |

## Arquitectura y entrenamiento

El repositorio contiene artefactos de compilación AOT-Inductor (`torch.compile` con modo AOT) para el bloque `MiniMaxH3TransformerBlock`, que forma parte del modelo MiniMax H3 de MiniMax AI. El bloque es un transformer de difusión con 50 instancias en el modelo completo, con capas de atención y GEMM; en una secuencia de S = 37726, un solo bloque consume aproximadamente 70 TFLOP de operaciones de matriz y atención. Los paquetes se generaron con torch 2.11 para la arquitectura sm120 (Blackwell) y se compilan con una dimensión de secuencia dinámica, de modo que el mismo paquete sirve para cualquier longitud de prompt, duración o tamaño de lienzo sin necesidad de recompilar. El proceso de construcción se describe en `h3_aoti.py` y `job_bf16_aoti.py`, y se validó comparando la salida de una llamada real de 1 y 2 filas de `temb` contra la ejecución eager.

No se proporcionan datos sobre el entrenamiento del modelo MiniMax H3 en este repositorio; la información disponible se limita a la compilación y el rendimiento de los paquetes.

## Capacidades

- Aceleración de inferencia del bloque transformer de MiniMax H3 mediante compilación AOT-Inductor: reduce la sobrecarga de lanzamiento de kernels de los 50 bloques y los epilogues de norm, rotary y AdaLN.
- Dimensión de secuencia dinámica: el paquete `bf16/torch2.11/sm120/dynamic` sirve para cualquier longitud de prompt, duración de audio/vídeo y tamaño de lienzo sin recompilar.
- Sin pesos: el paquete se enlaza en tiempo de ejecución con el `state_dict()` de cada bloque, por lo que no ocupa espacio adicional y funciona con cualquier checkpoint del modelo.
- Compatible con torch 2.11 y GPUs Blackwell (sm120); probado end-to-end en el Space de MiniMax-H3 de Hugging Face.
- El modelo subyacente MiniMax H3 (no incluido en este repo) genera vídeo con audio estéreo nativo hasta 2K y 15 segundos, y entiende texto, imagen, vídeo y audio.

## Casos de uso

- Inferencia acelerada de MiniMax H3 en GPUs Blackwell: el paquete dinámico se carga al arrancar el Space oficial y parchea los 50 bloques, reduciendo el tiempo por paso de difusión entre un 4,6 % y un 11 % según el lienzo.
- Generación de vídeo con audio en tiempo real: con la reducción de ~0,5 s por paso, un pipeline de 124 frames puede ahorrar decenas de segundos de latencia total en una RTX PRO 6000.
- Despliegue en entornos de producción con hardware Blackwell: el paquete está compilado para sm120 y torch 2.11, lo que evita la sobrecarga de JIT en cada arranque y facilita el despliegue reproducible.
- Optimización de pipelines de generación con lienzos pequeños: el beneficio relativo es mayor cuanto menor es el lienzo (hasta +11 % en 544x960), por lo que es adecuado para vídeos de baja resolución o avatares.
- Desarrollo de herramientas de vídeo generativo con modelos abiertos: los artefactos permiten integrar MiniMax H3 en aplicaciones propias sin tener que compilar los kernels desde cero.
- Evaluación de rendimiento de compilación AOTI: el repositorio incluye informes JSON de cada compilación (`_reports/`), útiles para comparar estrategias de compilación en el mismo hardware.

## Benchmarks y rendimiento

La model card reporta mediciones en bfloat16 sin cuantizar, con 124 frames y todo residente en una RTX PRO 6000 Blackwell:

| Lienzo (HxW) | eager s/paso | AoTI s/paso | ahorro | aceleración |
|---|---|---|---|---|
| 768x1344 | 10,20 | 9,73 | 0,47 s | +4,6 % |
| 704x1280 | 8,59 | 7,87 | 0,72 s | +8,4 % |
| 640x1152 | 6,46 | 5,88 | 0,59 s | +9,1 % |
| 576x1024 | 4,74 | 4,24 | 0,50 s | +10,5 % |
| 544x960 | 4,02 | 3,58 | 0,44 s | +11,0 % |

El ahorro absoluto es casi constante (~0,5 s por paso), lo que corresponde a la eliminación de la sobrecarga de lanzamiento de kernels de los 50 bloques y los epilogues; las multiplicaciones de matrices no se ven afectadas. No se publican resultados de benchmarks del modelo MiniMax H3 (p. ej., MMLU, HumanEval) en la información disponible.

## Requisitos de hardware

- GPU necesaria: NVIDIA Blackwell con arquitectura sm120 (p. ej., RTX PRO 6000 Blackwell). No se garantiza compatibilidad con arquitecturas anteriores.
- VRAM: el paquete en sí no ocupa espacio (sin pesos), pero el modelo completo requiere alojar el transformer (bfloat16) y el codificador de condicionamiento Qwen3-VL de 62 GiB; la model card indica que todo debe residir en una RTX PRO 6000.
- Cuantización: solo bfloat16, sin cuantizar.
- Opciones de despliegue: se usa a través de `spaces.aoti_patch` en el Space de MiniMax-H3; requiere torch 2.11 y el ecosistema AOT-Inductor.
- Latencia: entre 3,58 s y 9,73 s por paso de difusión según el lienzo, sobre RTX PRO 6000 (medido con 124 frames).

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje o de generación en sí, sino un conjunto de paquetes de compilación AOTI para un modelo concreto (MiniMax H3). No hay comparables directos en cuanto a artefactos de compilación para el mismo modelo; la comparación con otros modelos de generación de vídeo (p. ej., Sora, Gen-3, Wan) no es pertinente porque aquí no se evalúa el modelo completo.

## Limitaciones y advertencias

- El paquete no incluye los pesos del modelo; es un artefacto de compilación que requiere el checkpoint de MiniMax H3 y el código del Space para funcionar.
- Solo compatible con GPUs Blackwell (sm120) y torch 2.11; no funcionará en arquitecturas anteriores (p. ej., Ampere, Ada) ni con otras versiones de torch.
- La licencia es `other`; hay que revisar los términos específicos de MiniMax H3 para uso comercial antes de desplegar en producción.
- La compilación se validó en un solo entorno (RTX PRO 6000); puede haber diferencias de rendimiento o fallos en otros equipos Blackwell.
- El documento de la card advierte de un fallo conocido con clones superficiales en modo non-strict de `torch.export` que produce un segfault sin mensaje; se recomienda exportar el bloque en vivo o usar `strict=True`.
- No se publican resultados de benchmarks del modelo MiniMax H3 (p. ej., calidad de vídeo, alucinaciones, sesgos) en la información disponible; estos datos deben consultarse en la documentación oficial de MiniMax.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Exmanq/minimax-h3-aoti
- Repositorio Hugging Face del paquete original (multimodalart): https://huggingface.co/multimodalart/minimax-h3-aoti
- Space de MiniMax-H3 en Hugging Face: https://huggingface.co/spaces/multimodalart/minimax-h3
- Blog oficial de MiniMax sobre H3: https://www.minimax.io/blog/minimax-h3
- Guía de despliegue de MiniMax H3: https://design.minimax.io/h3
- Repositorio GitHub de MiniMax-AI/MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
