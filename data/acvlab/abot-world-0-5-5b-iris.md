# acvlab/ABot-World-0-5-5B-Iris

## Resumen

ABot-World 0.5 Iris es un modelo causal de 5B parámetros para generación de vídeo interactivo en tiempo real, desarrollado por el ACV Lab (AMAP, Alibaba) dentro de la familia ABot-World 0.5. No es un modelo de lenguaje: es un world model de difusión que parte de Wan-AI/Wan2.2-TI2V-5B y se especializa en simular interacciones físicas y controlables mediante teclado y prompts de lenguaje, manteniendo la coherencia temporal a lo largo de la secuencia generada.

Su relevancia radica en dos innovaciones concretas: la anotación de *Chain of Causation* (CoC) mediante PhysTracer, que enlaza el resultado físico de una acción con las condiciones iniciales de la siguiente, y EventAlign, que alinea cada prompt local con su intervalo correspondiente en los latentes de vídeo. Con ello, escalar el conjunto de entrenamiento de 150K a 1,2M de ejemplos elevó la Physical Score de 32,43 a 68,07 en Iris.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y biblioteca diffusers, y está pensado para despliegues de streaming: según la model card, Iris alcanza 21 FPS en una única RTX 5090. El repositorio ocupa 27,8 GB y acumula 1.487 descargas desde su publicación el 24 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión causal para vídeo (derivado de Wan2.2-TI2V-5B), transformer de difusión con decodificador causal |
| Parámetros totales | 5.270.329.536 (5,27B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana temporal en frames; se documentan clips de 22 frames a 480p) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | zh, en (prompts de control) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

Iris es un modelo de difusión causal construido sobre Wan-AI/Wan2.2-TI2V-5B, afinado para generación de vídeo interactivo en streaming. La arquitectura mantiene el transformer de difusión del modelo base e incorpora un decodificador causal propio, FantasyDecoder, que decodifica cada chunk en cuanto llega reutilizando características del chunk anterior. Según la model card, en clips de 480p y 22 frames FantasyDecoder entrega 8,26× el throughput de decodificación del decodificador causal nativo de Wan2.2, mejora el PSNR en 0,79 dB y reduce el parpadeo temporal un 13,9%.

El entrenamiento se apoya en el dataset acvlab/ABot-World-Explorer-500h y en anotaciones generadas por PhysTracer, que identifica y etiqueta clips que preservan vínculos de causalidad física (colisiones, caídas, contacto con superficies). La innovación EventAlign vincula cada prompt local a su intervalo temporal en los latentes de vídeo, de modo que los eventos introducidos por lenguaje surten efecto en el momento correcto sin detener el rollout. El escalado del conjunto de entrenamiento de 150K a 1,2M de ejemplos multiplicó por más de dos la Physical Score (32,43 → 68,07). No se detalla en la información disponible el volumen total de tokens, la composición completa del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de vídeo causal en streaming a partir de imagen y texto (TI2V), con control de personaje mediante teclado.
- Control por prompt de lenguaje con Prompt Switch: introducción de nuevos eventos durante el rollout sin interrumpir la generación.
- Simulación de física interactiva: colisiones, caídas y contacto con superficies coherentes gracias al entrenamiento con Chain of Causation.
- Persistencia de cambios en la escena: las modificaciones introducidas en una interacción se propagan a interacciones posteriores.
- Streaming de vídeo a 21 FPS en una RTX 5090 (variante Iris de 5B).
- Decodificación en streaming con FantasyDecoder, con reutilización de características entre chunks.
- Soporte de prompts en chino e inglés.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio ni visión más allá de la condición de imagen inicial.

## Casos de uso

- Prototipado de videojuegos interactivos: el modelo permite generar en tiempo real el vídeo de respuesta a las pulsaciones de teclado del jugador, con 21 FPS en una RTX 5090, lo que sirve para validar mecánicas antes de producir assets definitivos.
- Simulación física para robótica y planificación: al mantener cadenas de causalidad entre acciones, puede usarse para generar rollouts sintéticos donde una colisión o un contacto condiciona el estado siguiente, útiles para entrenar políticas o verificar modelos de dinámica.
- Creación de mundos virtuales controlables por lenguaje: con Prompt Switch se pueden introducir eventos (por ejemplo, la aparición de un obstáculo) durante la generación sin reiniciar la secuencia, lo que encaja en herramientas de autoría narrativa interactiva.
- Generación de datos sintéticos para entrenamiento de modelos de vídeo: el pipeline permite producir clips anotados con causalidad física a gran escala, aprovechando la coherencia temporal que aporta FantasyDecoder.
- Demos y experiencias web en tiempo real: la decodificación en streaming con 8,26× de throughput frente al decodificador nativo facilita servir vídeo generado en vivo desde una única GPU consumer.
- Investigación en world models: la combinación de CoC, PhysTracer y EventAlign ofrece una base reproducible (Apache 2.0) para estudiar cómo el escalado de datos afecta a la consistencia física, con una métrica publicada (Physical Score) para comparar variantes.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Physical Score (Iris, 150K ejemplos) | 32,43 |
| Physical Score (Iris, 1,2M ejemplos) | 68,07 |
| Physical Score (Halo, 150K ejemplos) | 41,50 |
| Physical Score (Halo, 1,2M ejemplos) | 84,32 |
| FPS de streaming (Iris, 5B, RTX 5090) | 21 |
| Throughput de decodificación (FantasyDecoder vs. decodificador nativo Wan2.2, 480p, 22 frames) | 8,26× |
| Mejora de PSNR (FantasyDecoder) | +0,79 dB |
| Reducción de parpadeo temporal (FantasyDecoder) | 13,9 % |

No se han publicado en la información disponible resultados de benchmarks estándar de vídeo (FVD, VBench u otros) ni comparaciones con modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo pesa 27,8 GB en safetensors, por lo que en precisión completa se requiere al menos ese orden de memoria, y menos con cuantización (no documentada).
- GPU recomendadas: RTX 5090 para la variante Iris de 5B (21 FPS documentados); NVIDIA B200 para la variante Halo de 30B a 480p (24 FPS); cuatro B200 para Halo a 720p.
- Cabe en GPU consumer: sí, al menos la variante Iris de 5B en una RTX 5090 según la model card.
- Opciones de despliegue: código y utilidades del repositorio github.com/amap-cvlab/ABot-World, con pesos en formato diffusers; descarga vía `hf download` o `modelscope download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: 21 FPS en streaming para Iris; el decodificador FantasyDecoder multiplica por 8,26 el throughput de decodificación respecto al nativo de Wan2.2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ABot-World 0.5 Iris (5B) | 5,27B | clips 480p, 22 frames; 21 FPS en RTX 5090 | Physical Score 68,07 (1,2M ejemplos) | Apache 2.0 | Hugging Face, ModelScope |
| ABot-World 0.5 Halo (30B) | no disponible (30B según model card) | 480p en 1× B200, 720p en 4× B200; 24 FPS | Physical Score 84,32 (1,2M ejemplos); vídeo y audio sincronizado | no disponible en la información | Hugging Face, ModelScope |
| ABot-World 0.5 Iris-BiT | no disponible | no disponible | no disponible | no disponible | Hugging Face, ModelScope |
| Wan-AI/Wan2.2-TI2V-5B (base) | 5B (familia) | no disponible | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks cruzados con modelos de otras familias (por ejemplo, generadores de vídeo interactivo de otros laboratorios) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite tool calling, agentes ni razonamiento multi-step textual; su salida es vídeo.
- La Physical Score se mide con una métrica propia del proyecto, no con benchmarks estándar de la comunidad, lo que dificulta la comparación externa.
- El control se limita a teclado y prompts de lenguaje en chino e inglés; no se documentan otros idiomas ni modalidades de entrada.
- La longitud de contexto temporal (número máximo de frames coherentes) no está especificada; los ejemplos publicados son clips de 22 frames a 480p.
- Riesgo de inconsistencias físicas y artefactos en interacciones no representadas en el dataset de entrenamiento (500h de exploración), con posible degradación en escenarios fuera de distribución.
- No se documentan sesgos específicos ni evaluaciones de seguridad; al ser un modelo generativo de vídeo, puede producir contenido no deseado a partir de prompts.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones derivadas del modelo base Wan2.2 y de los datasets utilizados.
- El rendimiento en FPS depende del hardware citado (RTX 5090, B200); no se garantizan esas cifras en GPUs de gama inferior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/acvlab/ABot-World-0-5-5B-Iris
- Modelo en ModelScope: https://modelscope.cn/models/amap_cvlab/ABot-World-0-5-5B-Iris
- Variante Iris-BiT en Hugging Face: https://huggingface.co/acvlab/ABot-World-0-5-5B-Iris-BiT
- Variante Iris-BiT en ModelScope: https://modelscope.cn/models/amap_cvlab/ABot-World-0-5-5B-Iris-BiT
- Página del proyecto: https://amap-cvlab.github.io/ABot-World/
- Estudio interactivo: https://abot-world.amap.com
- Código en GitHub: https://github.com/amap-cvlab/ABot-World
- Dataset ABot-World-Explorer-500h: https://huggingface.co/datasets/acvlab/ABot-World-Explorer-500h
- Dataset ABot-World-Explorer-500h en ModelScope: https://modelscope.cn/datasets/amap_cvlab/ABot-World-Explorer-500h
- Dataset ABot-World-Explorer-4D: https://huggingface.co/datasets/acvlab/ABot-World-Explorer-4D
- Dataset ABot-World-Explorer-4D en ModelScope: https://modelscope.cn/datasets/amap_cvlab/ABot-World-Explorer-4D
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
