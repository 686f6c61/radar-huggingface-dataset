# mradermacher/JarvisVLA-Qwen2-VL-7B-GGUF

## Resumen

JarvisVLA-Qwen2-VL-7B es un modelo de tipo Vision-Language-Action (VLA) desarrollado por el equipo CraftJarvis, diseñado específicamente para el juego de mundo abierto Minecraft. El modelo toma como entrada instrucciones en lenguaje natural y capturas de pantalla del juego, y genera acciones de teclado y ratón para controlar al personaje. Está basado en el modelo multimodal Qwen2-VL-7B, al que se ha sometido a un post-entrenamiento mediante aprendizaje por imitación a gran escala utilizando el dataset minecraft-vla-sft. La versión GGUF aquí descrita, cuantizada por mradermacher, permite ejecutar el modelo en hardware de consumo con diferentes niveles de precisión.

El modelo resuelve el problema de traducir comandos de alto nivel ("construye una casa", "recoge madera") en secuencias de acciones de bajo nivel (movimiento, clics, teclas) dentro de Minecraft. Su relevancia radica en demostrar que los modelos de lenguaje y visión de gran escala pueden adaptarse a entornos de juego complejos y abiertos, abriendo la puerta a agentes autónomos entrenables mediante instrucciones. Con 7.615 millones de parámetros, el modelo hereda la arquitectura de Qwen2-VL-7B, incluyendo su capacidad de procesamiento visual y textual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL-7B (Vision-Language-Action) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada (heredada de Qwen2-VL-7B) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q6_K, Q8_0, f16, mmproj (Q8_0 y f16) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2-VL-7B, un transformer multimodal que combina un codificador de visión con un modelo de lenguaje. Sobre esta base, el equipo de CraftJarvis aplicó un post-entrenamiento mediante aprendizaje por imitación a gran escala, utilizando el dataset minecraft-vla-sft que contiene trayectorias de juego con instrucciones asociadas. El proceso, descrito en el paper "JARVIS-VLA: Post-Training Large-Scale Vision Language Models to Play Visual Games with Keyboards and Mouse", consiste en ajustar el modelo para que prediga acciones de teclado y ratón a partir de observaciones visuales y comandos textuales. No se menciona el uso de RLHF o DPO; el entrenamiento se centra en imitación supervisada.

La cuantización GGUF realizada por mradermacher convierte los pesos originales a formatos de menor precisión (desde Q2_K hasta f16) para facilitar la ejecución en hardware variado. Se incluyen también archivos mmproj para el proyector multimodal, necesario para procesar imágenes.

## Capacidades

- Generación de acciones de control para Minecraft: el modelo produce secuencias de teclas y movimientos de ratón que se traducen en acciones del personaje.
- Comprensión de instrucciones en lenguaje natural: interpreta comandos como "ve a la montaña" o "construye una mesa de crafteo".
- Percepción visual del entorno: analiza capturas de pantalla del juego para entender el estado del mundo y los objetos presentes.
- Aprendizaje por imitación: ha sido entrenado con trayectorias de jugadores expertos, lo que le permite replicar comportamientos complejos.
- No es un modelo de chat general: su salida está orientada a acciones, no a texto libre.
- Soporte de tool calling: no disponible.
- Capacidades multilingües: solo inglés.

## Casos de uso

- Automatización de tareas repetitivas en Minecraft: el modelo puede encargarse de recolectar recursos, construir estructuras básicas o explorar zonas, liberando al jugador de tareas tediosas.
- Asistente de juego por voz: integrado con un sistema de reconocimiento de voz, permite controlar el juego mediante comandos hablados, útil para jugadores con movilidad reducida.
- Investigación en agentes VLA: sirve como plataforma de estudio para el desarrollo de modelos que combinan visión, lenguaje y acción en entornos abiertos.
- Generación de datos de entrenamiento: puede utilizarse para producir nuevas trayectorias de juego etiquetadas, ampliando datasets para futuros modelos.
- Demostraciones educativas: en cursos de robótica o IA, permite ilustrar conceptos de aprendizaje por imitación y control de agentes.
- Benchmarking de cuantización: la versión GGUF permite evaluar el impacto de diferentes niveles de precisión en la calidad de las acciones generadas, útil para optimizar despliegues en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper original (arXiv:2503.16365) podría contener métricas, pero no se incluyen en la documentación de HuggingFace consultada.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K ~3,1 GB, Q4_K_S ~4,6 GB, Q8_0 ~8,2 GB, f16 ~15,3 GB (tamaños de archivo; la VRAM real puede ser ligeramente superior).
- GPU recomendadas: para Q4_K_S o inferior, una GPU con 6-8 GB de VRAM (p. ej., RTX 3060, RTX 4060); para Q8_0, se recomienda 12 GB o más (RTX 4070, RTX 3090); para f16, 16 GB o más (RTX 4090, A100).
- Es posible ejecutar en CPU con llama.cpp, aunque la latencia será alta, especialmente para el procesamiento de imágenes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. Para el modelo base (safetensors), se puede usar vLLM o TGI.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación consultada. El campo de los VLA para juegos es emergente, y JarvisVLA es uno de los pocos modelos públicos de este tipo. Se podría comparar con otros modelos de control de Minecraft como MineDojo o Voyager, pero no se dispone de datos de rendimiento directos.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en Minecraft; no es útil para otras tareas de control o generación de texto general.
- Solo soporta inglés; las instrucciones en otros idiomas pueden no ser interpretadas correctamente.
- Riesgo de alucinación: el modelo puede generar acciones que no corresponden a la instrucción o al estado del juego, especialmente en situaciones no vistas durante el entrenamiento.
- La cuantización degrada la calidad: las versiones de menor precisión (Q2_K, Q3_K) pueden producir acciones erróneas con mayor frecuencia.
- Dependencia del entorno: el modelo asume una configuración específica de Minecraft (versión, mods, resolución de pantalla); cambios pueden afectar su rendimiento.
- Licencia MIT permite uso comercial, pero el modelo base y el dataset pueden tener restricciones adicionales; se recomienda revisar la documentación original.

## Enlaces

- Modelo cuantizado GGUF: https://huggingface.co/mradermacher/JarvisVLA-Qwen2-VL-7B-GGUF
- Modelo base: https://huggingface.co/CraftJarvis/JarvisVLA-Qwen2-VL-7B
- Repositorio GitHub: https://github.com/CraftJarvis/JarvisVLA
- Paper arXiv: https://arxiv.org/html/2503.16365v2
- Dataset de entrenamiento: https://huggingface.co/datasets/CraftJarvis/minecraft-vla-sft
