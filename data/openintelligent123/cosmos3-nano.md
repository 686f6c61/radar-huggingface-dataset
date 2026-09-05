# Openintelligent123/Cosmos3-Nano

## Resumen

Cosmos3-Nano es un modelo de mundo omnímodo desarrollado por NVIDIA, dentro de la plataforma Cosmos3, diseñado para acelerar el desarrollo de IA física (Physical AI) en robótica, conducción autónoma y entornos inteligentes industriales. El modelo es capaz de generar salidas coherentes de texto, imagen, vídeo, audio y trayectorias de acción a partir de combinaciones de entradas multimodales (texto, imagen, vídeo y acciones). Su arquitectura es una Mixture-of-Transformers (MoT), que combina un transformer autorregresivo para tokens discretos y un diffusion transformer para modales continuos, permitiendo modelar modalidades heterogéneas en un único framework sin perder los mecanismos óptimos de generación para cada una.

El modelo tiene aproximadamente 15.750 millones de parámetros (15,75B según los pesos safetensors; el fabricante declara 16B) y está publicado en HuggingFace con un tamaño de repositorio de 35,0 GB. Se ofrece bajo la licencia OpenMDW1.1, que según el fabricante permite uso comercial y no comercial, aunque se trata de una licencia personalizada que conviene revisar. Cosmos3-Nano es la variante más pequeña de la familia Cosmos3, pensada para servir como modelo base en tareas de comprensión del mundo, generación de mundos, simulación y aprendizaje de políticas encarnadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT): transformer autorregresivo + diffusion transformer |
| Parametros totales | 15.750.057.456 (aprox. 15,75 mil millones; el fabricante declara 16B) |
| Parametros activos | No aplica (MoT, no es un modelo MoE con parámetros activos por token) |
| Longitud de contexto | No disponible globalmente; límite de entrada de texto: 4096 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No especificado en la información disponible |
| Licencia | OpenMDW1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Cosmos3-Nano está construido sobre una arquitectura Mixture-of-Transformers (MoT), compuesta por dos torres complementarias: un transformer autorregresivo que genera tokens discretos y un diffusion transformer encargado de la generación multimodal continua. Durante la inferencia, el texto se produce mediante decodificación autoregresiva estándar de siguiente token, mientras que los modales no textuales (imagen, vídeo, audio y acciones) se sintetizan mediante denoising iterativo. Esta separación permite al modelo manejar modalidades muy distintas dentro de un único sistema, manteniendo el enfoque de generación más adecuado para cada tipo de dato.

El README no proporciona información sobre el dataset de entrenamiento, el número de tokens utilizados ni la aplicación de técnicas como RLHF o DPO. Se indica que el modelo está desarrollado sobre el Cosmos Framework de NVIDIA. No se detallan innovaciones técnicas adicionales más allá de la propia arquitectura MoT y la integración de múltiples modalidades (texto, imagen, vídeo, audio y acciones) en un modelo de mundo para IA física.

## Capacidades

- Generación de texto, imagen, vídeo, audio y trayectorias de acción de forma coherente a partir de entradas multimodales.
- Entradas soportadas: texto, imagen (jpg, png, jpeg, webp), vídeo (mp4, con o sin audio muxed) y trayectorias de acción en formato JSON (lista 1D).
- Comprensión y generación de mundos físicos: el modelo puede simular escenarios, predecir estados futuros y razonar sobre acciones en entornos robóticos, de conducción autónoma e industriales.
- Razonamiento de acciones (action reasoning) y predicción de futuro (future prediction) a partir de instrucciones en lenguaje natural y observaciones visuales.
- Soporte para trayectorias de acción de diversas encarnaciones: movimiento de cámara (9D), vehículo autónomo (9D), movimiento egocéntrico (57D), brazos robóticos Franka Panda con pinza RobotiQ (10D y 20D), Agibot (29D), UR (10D), robot Google (10D), WidowX 250 (10D) y UMI (9D).
- Generación de vídeo y audio sincronizados: el audio se acepta cuando está muxed en el vídeo MP4 (2 canales, 48 kHz) y el modelo puede producir vídeo con audio.
- No se menciona soporte de tool calling / function calling ni de agentes con razonamiento multi-step más allá del razonamiento de acciones.

## Casos de uso

- Simulación de mundos físicos para robótica: el modelo genera secuencias de vídeo y trayectorias de acción a partir de texto o imágenes, permitiendo entrenar políticas de control en entornos simulados sin necesidad de datos físicos reales.
- Conducción autónoma: a partir de observaciones de cámara y telemetría de vehículo (acciones 9D), Cosmos3-Nano puede predecir futuros fotogramas y generar comandos de control, facilitando el desarrollo de sistemas de predicción de trayectorias.
- Generación de contenido multimodal: permite crear vídeo con audio sincronizado desde una instrucción de texto o una imagen de referencia, útil en producción de media y entrenamiento de simuladores visuales.
- Razonamiento de acciones para manipulación: dada una instrucción en lenguaje natural y una observación visual, el modelo genera comandos de acción para brazos robóticos (por ejemplo, Franka Panda 10D/20D), aplicable en entornos industriales de pick-and-place.
- Planificación en espacios inteligentes: en fábricas o almacenes, el modelo puede simular escenarios de movimiento de agentes o robots para optimizar rutas y detectar conflictos antes de desplegar sistemas reales.
- Investigación en IA física: como modelo base, Cosmos3-Nano puede utilizarse para world understanding, world generation y aprendizaje de políticas encarnadas en entornos simulados, sirviendo como banco de pruebas para algoritmos de control.
- Predicción de futuro en entornos dinámicos: el modelo anticipa estados siguientes del entorno a partir de entradas multimodales, lo que resulta útil en sistemas de vigilancia inteligente o en el diseño de sistemas de seguridad predictiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. A partir del tamaño del repositorio (35,0 GB) y de los 15.750 millones de parámetros, la inferencia en precisión FP16 requeriría aproximadamente 32 GB de VRAM; con cuantización 4-bit, podría reducirse a unos 8-10 GB. Estas cifras son estimaciones basadas en el tamaño de los pesos, no datos oficiales.
- GPU recomendadas: no disponibles en la documentación. Por tamaño, se necesitarían GPUs de gama alta como A100 80GB, H100 80GB o RTX 6000 Ada para una inferencia en FP16 sin cuantización.
- Compatibilidad con GPU de consumo: no se especifica. Con cuantización agresiva podría ser posible ejecutarlo en GPUs de consumo con 16-24 GB de VRAM, pero no hay datos oficiales.
- Opciones de despliegue: según las etiquetas del modelo, soporta vLLM, vLLM-omni, sglang, sglang-diffusion y diffusers. También se enlaza el código de NVIDIA Cosmos en GitHub.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Dentro de la familia Cosmos3, las variantes disponibles son:

| Modelo | Parametros | Proposito principal |
|---|---|---|
| Cosmos3-Nano | 16B (según fabricante) | Modelo omnímodo base: comprensión, simulación, predicción y razonamiento de acciones |
| Cosmos3-Super | 64B | Modelo omnímodo de mayor tamaño para las mismas tareas que Nano |
| Cosmos3-Nano-Policy-DROID | 16B | Generación de trayectorias de acción para el robot DROID a partir de instrucciones y observaciones |
| Cosmos3-Super-Image2Video | 64B | Generación de vídeo coherente a partir de una imagen y texto |
| Cosmos3-Super-Text2Image | 64B | Generación de imágenes de alta fidelidad a partir de texto |

No se dispone de datos de benchmarks que permitan comparar Cosmos3-Nano con modelos externos de la misma categoría.

## Limitaciones y advertencias

- El vídeo de entrada está limitado a un máximo de 5 fotogramas.
- Las resoluciones de imagen y vídeo soportadas son 256p, 480p y 720p, con relaciones de aspecto restringidas (16:9, 4:3, 1:1, 3:4, 9:16).
- El audio solo se admite cuando está muxed dentro del vídeo MP4, con 2 canales y 48 kHz; no se indica soporte de audio como entrada independiente.
- No se soportan imágenes en escala de grises; las entradas deben ser RGB de 8 bits por canal en espacio de color sRGB.
- El límite de entrada de texto es de 4096 tokens, lo que puede resultar insuficiente para instrucciones largas o contextos extensos.
- La licencia OpenMDW1.1 es personalizada. Aunque el fabricante indica que el modelo está listo para uso comercial y no comercial, es necesario revisar los términos completos de la licencia antes de su despliegue en producción.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.
- El riesgo de alucinación y los sesgos del modelo no están documentados; se recomienda evaluar el modelo en el dominio de aplicación antes de su uso.

## Enlaces

- HuggingFace: https://huggingface.co/Openintelligent123/Cosmos3-Nano
- Colección de modelos Cosmos3 en HuggingFace: https://huggingface.co/collections/nvidia/cosmos3
- Código en GitHub: https://github.com/nvidia/cosmos
- White paper técnico: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Web del proyecto: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/cosmos3-nano/modelcard
- Página de NVIDIA NIM del modelo: https://build.nvidia.com/nvidia/cosmos3-nano
