# Openintelligent123/Cosmos3-Super

## Resumen

Cosmos3-Super es un modelo de mundo omnimodal (omnimodal world model) desarrollado por NVIDIA como parte de la plataforma Cosmos 3. Está diseñado para acelerar el desarrollo de Inteligencia Física (Physical AI) permitiendo a las máquinas comprender, simular e interactuar con el mundo físico en ámbitos como robótica, conducción autónoma y espacios inteligentes. El modelo genera contenido multimodal coherente —texto, imagen, video, audio y trayectorias de acción— a partir de combinaciones de entradas de texto, imagen, video y acciones. Se basa en una arquitectura Mixture-of-Transformers (MoT) que combina un transformer autorregresivo para la generación de tokens discretos y un transformer de difusión para la síntesis de modalidades continuas. Con 64.615 millones de parámetros (64B), Cosmos3-Super es la variante de mayor tamaño de la colección Cosmos 3 y está disponible bajo la licencia OpenMDW1.1, que permite uso comercial y no comercial. Su relevancia radica en ser un modelo abierto de gran escala para simulación de mundos y aprendizaje de políticas encarnadas, un área crítica para la robótica y la automatización industrial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT) - Transformer |
| Parametros totales | 64.615.003.632 (64B) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Cosmos3-Super emplea una arquitectura Mixture-of-Transformers (MoT) compuesta por dos torres de transformadores complementarias. La primera es un transformer autorregresivo que genera tokens discretos, utilizados para la salida de texto mediante decodificación de siguiente token estándar. La segunda es un transformer de difusión que sintetiza modalidades continuas (imagen, video, audio y acciones) mediante desnaturalización iterativa (iterative denoising). Esta arquitectura unificada permite modelar modalidades heterogéneas en un solo marco, preservando los mecanismos de generación más adecuados para cada tipo de dato. Los datos de entrenamiento no se especifican en la información disponible. No se mencionan procesos de RLHF o DPO. El modelo se basa en el Cosmos Framework y está diseñado para aplicaciones de Physical AI.

## Capacidades

- Generación multimodal: produce texto, imagen, video, audio y trayectorias de acción a partir de entradas combinadas de texto, imagen, video y/o acciones.
- Comprensión multimodal: interpreta entradas en múltiples modalidades para tareas de comprensión del mundo, simulación y razonamiento de acciones.
- Simulación de mundos: genera secuencias de video coherentes temporalmente y predicciones de futuro en entornos físicos.
- Razonamiento de acciones: dado lenguaje e información visual, genera comandos de acción para robots y agentes encarnados.
- Soporte de múltiples "embodiments": compatible con trayectorias de acción para brazos robóticos (Franka Panda, UR, WidowX), vehículos autónomos, movimiento egocéntrico y plataformas como Agibot, Google Robot y UMI.
- Generación de audio sincronizado: puede producir audio junto con video, requiriendo entradas de audio estéreo a 48 kHz cuando se proporciona video con audio multiplexado.
- Sin soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Entrenamiento de políticas robóticas: Cosmos3-Super puede generar trayectorias de acción para brazos robóticos como Franka Panda o UR, permitiendo entrenar políticas de control en simulación antes de desplegar en el mundo real.
- Simulación de conducción autónoma: el modelo puede generar escenarios de video realistas y predecir futuros estados de la carretera, útiles para validar sistemas de percepción y planificación en vehículos autónomos.
- Automatización industrial y fábricas inteligentes: mediante la simulación de entornos de fábrica, el modelo permite probar flujos de trabajo y optimizar la coordinación de robots en espacios industriales.
- Generación de contenido multimodal para entrenamiento: puede crear pares de video y audio sintéticos a partir de descripciones de texto, ampliando datasets para tareas de percepción audiovisual.
- Comprensión de escenas físicas: dado un video o imagen de entrada, el modelo puede razonar sobre la estructura del entorno y generar acciones adecuadas, útil para asistentes en robótica de servicio.
- Predicción de acciones humanas: con entradas de video egocéntrico y trayectorias de acción, puede anticipar movimientos de agentes, aplicable en investigación de interacción humano-robot.
- Generación de imágenes de alta fidelidad a partir de texto: aunque esta capacidad se detalla en la variante Cosmos3-Super-Text2Image, el modelo base también puede producir imágenes coherentes con la descripción proporcionada.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La documentación de NVIDIA afirma que Cosmos 3 se posiciona como el modelo abierto líder en razonamiento para Physical AI, ocupando el primer lugar en promedios de benchmarks de Robótica, Espacios Inteligentes y Conducción. Sin embargo, no se proporcionan valores concretos de MMLU, HumanEval, GSM8K u otras métricas en los datos disponibles.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 64B parámetros en precisión completa (fp16), se requerirían aproximadamente 128 GB de VRAM, pero no se especifica en la información.
- GPU recomendadas: no disponible explícitamente. Dado el tamaño del modelo, se necesitan GPUs de centro de datos como NVIDIA A100 o H100, o clústeres de múltiples GPUs.
- Compatibilidad con GPU de consumo: no se indica. Sin cuantización, es poco probable que quepa en una GPU de consumo (por ejemplo, RTX 4090 con 24 GB).
- Opciones de despliegue: vLLM, SGLang y Diffusers, según los tags del repositorio. El modelo está preparado para vLLM-omni y sglang-diffusion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de otros desarrolladores. Dentro de la misma familia Cosmos 3, las variantes son:
- Cosmos3-Nano: 16B parámetros, misma arquitectura MoT, orientado a las mismas tareas con menor coste computacional.
- Cosmos3-Super-Image2Video: 64B parámetros, especializado en generación de video a partir de una imagen y texto.
- Cosmos3-Super-Text2Image: 64B parámetros, especializado en generación de imágenes a partir de texto.

Cosmos3-Super es el modelo generalista de mayor tamaño de la colección, cubriendo todas las modalidades.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no se documenta explícitamente, pero es inherente a los modelos generativos; se recomienda validar las salidas en aplicaciones críticas.
- Limitaciones de entrada: el texto está limitado a 4096 tokens; el video a un máximo de 5 frames y resoluciones de 256p, 480p o 720p; las imágenes deben estar en RGB (sRGB) y no se admiten entradas en escala de grises.
- Restricciones de licencia: la licencia OpenMDW1.1 permite uso comercial y no comercial, pero es una licencia personalizada; se debe revisar el texto completo para conocer las obligaciones específicas.
- Dependencias de formato: las entradas de acción deben seguir dimensiones específicas por "embodiment"; un formato incorrecto puede producir salidas inválidas.
- Disponibilidad: el repositorio de HuggingFace correspondiente al ID Openintelligent123/Cosmos3-Super no muestra descargas ni likes, lo que sugiere que puede tratarse de un espejo no oficial; se recomienda usar el repositorio oficial de NVIDIA.

## Enlaces

- Repositorio oficial en HuggingFace: https://huggingface.co/nvidia/Cosmos3-Super
- Repositorio espejo: https://huggingface.co/Openintelligent123/Cosmos3-Super
- Colección de modelos Cosmos 3: https://huggingface.co/collections/nvidia/cosmos3
- Código en GitHub: https://github.com/nvidia/cosmos
- White paper técnico: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Página del proyecto: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
