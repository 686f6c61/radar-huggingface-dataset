# mradermacher/JarvisVLA-Qwen2-VL-7B-i1-GGUF

## Resumen

JarvisVLA-Qwen2-VL-7B-i1-GGUF es una cuantización GGUF del modelo JarvisVLA-Qwen2-VL-7B, un modelo de visión-lenguaje-acción (VLA) desarrollado por el equipo CraftJarvis. Este modelo está diseñado específicamente para jugar al videojuego de mundo abierto Minecraft, interpretando instrucciones en lenguaje natural y generando acciones de teclado y ratón para controlar al personaje. La cuantización ha sido realizada por mradermacher, un tercero, para facilitar su ejecución en hardware con recursos limitados.

El modelo original se basa en la arquitectura Qwen2-VL-7B, un modelo multimodal de 7.600 millones de parámetros, al que se le añade un decodificador de acciones. El post-entrenamiento se realizó mediante aprendizaje por imitación a gran escala, como se describe en el artículo "JARVIS-VLA: Post-Training Large-Scale Vision Language Models to Play Visual Games with Keyboards and Mouse". Esta versión cuantizada en GGUF permite su uso con herramientas como llama.cpp u Ollama, reduciendo los requisitos de VRAM en comparación con los pesos originales en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en Qwen2-VL-7B con decodificador de acciones |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2-VL, probablemente 128k, pero no confirmado) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (según los comentarios del autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

JarvisVLA-Qwen2-VL-7B es un modelo VLA que combina un codificador visual y un modelo de lenguaje (Qwen2-VL-7B) con un decodificador de acciones adicional. El modelo procesa imágenes del entorno del juego y las combina con instrucciones textuales para generar comandos de teclado y ratón. El entrenamiento se realizó en dos fases: primero un post-entrenamiento sobre trayectorias de aprendizaje por imitación a gran escala, y posteriormente un ajuste con un modelo intermedio de visión-lenguaje (VLP). El artículo menciona que se utilizaron Llava-Next y Qwen2-VL como modelos base, pero la versión final se basa en Qwen2-VL. No se especifican detalles sobre el número de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Percepción visual del entorno de Minecraft a partir de capturas de pantalla.
- Comprensión de instrucciones en lenguaje natural para realizar tareas complejas dentro del juego.
- Generación de acciones de teclado y ratón (movimiento, interacción con bloques, uso de objetos, etc.).
- Interacción conversacional básica, aunque su propósito principal es la ejecución de acciones.
- Soporte para múltiples imágenes (gracias a la base Qwen2-VL), lo que permite razonar sobre varias capturas.
- No se ha confirmado soporte para tool calling ni funciones de agente fuera del ámbito de Minecraft.

## Casos de uso

- Automatización de tareas repetitivas en Minecraft: el modelo puede seguir instrucciones como "recoge madera" o "construye una casa", ejecutando las acciones necesarias de forma autónoma.
- Investigación en agentes encarnados: sirve como plataforma para estudiar el aprendizaje por imitación y la planificación en entornos 3D abiertos.
- Evaluación de modelos VLA: permite comparar el rendimiento de diferentes arquitecturas en tareas de control visual y lingüístico.
- Generación de datos de entrenamiento: puede utilizarse para producir trayectorias de juego etiquetadas que sirvan para entrenar otros modelos.
- Demostraciones educativas: útil para enseñar conceptos de visión por computador, procesamiento de lenguaje natural y aprendizaje por refuerzo en un entorno lúdico.
- Desarrollo de asistentes de juego: integrable en mods o servidores de Minecraft para ofrecer ayuda contextual a jugadores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artículo original (arXiv:2503.16365) podría contener métricas, pero no se han proporcionado en los datos consultados.

## Requisitos de hardware

- VRAM estimada: para una cuantización Q4_K_M, los pesos ocupan aproximadamente 4,5 GB, por lo que se necesitan al menos 6-8 GB de VRAM para inferencia con overhead. Con Q2_K, se puede reducir a unos 3-4 GB.
- GPU recomendadas: tarjetas de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4090, o GPUs profesionales como A10G o L4. Para cuantizaciones más altas (Q6_K, Q8_0), se requieren 10-12 GB.
- Sí cabe en GPUs de consumo con 8 GB o más, dependiendo de la cuantización elegida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python. También puede usarse con vLLM si se convierte a otro formato, aunque no es lo habitual.
- Latencia y throughput: no se han proporcionado datos específicos. En una RTX 4090, se espera una velocidad de decodificación de 20-40 tokens/s para una cuantización Q4, pero depende del contexto y del hardware.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos VLA en la información proporcionada. Como referencia, OpenVLA (7B) es otro modelo VLA de código abierto, pero está orientado a manipulación robótica, no a juegos. El propio Qwen2-VL-7B sin el decodificador de acciones no puede generar acciones, por lo que no es directamente comparable. Se recomienda consultar el artículo original para ver comparativas con Llava-Next y Qwen2-VL en tareas de Minecraft.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en Minecraft; no es un agente generalista y no funcionará en otros entornos sin reentrenamiento.
- Al ser una cuantización GGUF, puede haber una ligera pérdida de precisión en las predicciones de acción en comparación con los pesos originales en safetensors.
- No se ha publicado información sobre sesgos o alucinaciones específicas, pero al ser un modelo de lenguaje, puede generar instrucciones o acciones incorrectas en situaciones ambiguas.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial. Se recomienda contactar con los autores originales antes de utilizarlo en productos comerciales.
- El repositorio de cuantización no incluye el proyecto multimodal (mmproj) necesario para procesar imágenes, según los comentarios del autor (skip_mmproj). Esto significa que la versión GGUF podría no ser funcional para tareas VLA sin añadir manualmente el componente visual.

## Enlaces

- Repositorio de cuantización: https://huggingface.co/mradermacher/JarvisVLA-Qwen2-VL-7B-i1-GGUF
- Modelo original: https://huggingface.co/CraftJarvis/JarvisVLA-Qwen2-VL-7B
- Código oficial: https://github.com/CraftJarvis/JarvisVLA
- Artículo arXiv: https://arxiv.org/html/2503.16365v2
