# gustavecortal/ganlive-amber

## Resumen
ganlive-amber es un generador de imágenes incondicional basado en FastGAN, desarrollado por gustavecortal. Produce imágenes de 1536×1024 píxeles en tiempo real, alcanzando 224 fps (4,5 ms por fotograma) en una GPU Intel Arc A770 de 350 dólares. Está diseñado para ser explorado en vivo mediante la librería ganlive, que permite manipular el espacio latente con controles manuales, MIDI o entrada de audio.

El modelo resuelve la necesidad de visuales generativos de alta resolución y baja latencia para aplicaciones de VJ, arte generativo e instalaciones interactivas. Su arquitectura FastGAN, con un latente de 256 dimensiones, prioriza la eficiencia computacional sobre la calidad fotorrealista de otras GAN más pesadas. Se entrenó con 5.469 fotografías propias del autor que cubren lugares, objetos y texturas.

Es relevante ahora por su capacidad de ejecutarse en hardware de consumo y por su integración con ganlive, que facilita el control en directo del espacio latente. Cuenta con licencia MIT y un modelo hermano, ganlive-lichen, entrenado con las mismas fotografías pero a 3072×2048.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | FastGAN (red generativa adversarial) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (generación de imágenes incondicional) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | no disponible (la librería ganlive carga generadores en formato ONNX, pero no se especifica el formato de este checkpoint) |

## Arquitectura y entrenamiento
FastGAN es una arquitectura GAN diseñada para entrenamiento rápido y generación de alta resolución. Este modelo emplea un vector latente de 256 dimensiones y genera salidas de 1536×1024 con proporción 3:2. El entrenamiento se realizó con la herramienta gantrain sobre un conjunto de 5.469 fotografías propias del autor, que incluyen lugares, objetos y texturas. No se menciona el uso de RLHF ni DPO, ya que no son aplicables a modelos generativos adversariales.

La innovación principal es su eficiencia: 4,5 ms por fotograma (224 fps) en una Intel Arc A770. También destaca la integración con ganlive, que permite explorar el espacio latente de forma interactiva mediante controles manuales, MIDI o entrada de audio, así como su compatibilidad multiplataforma (Windows, macOS, Linux) y con GPUs de distintos fabricantes (NVIDIA, AMD, Intel, Apple) o CPU.

## Capacidades
- Generación de imágenes incondicional a 1536×1024 píxeles.
- Ejecución en tiempo real: 224 fps en Intel Arc A770.
- Exploración interactiva del espacio latente mediante la librería ganlive.
- Control por MIDI o entrada de audio (reactivo a sonido, por ejemplo, batería).
- Funcionamiento en Windows, macOS y Linux, con GPUs NVIDIA, AMD, Intel, Apple o CPU.
- No soporta generación condicionada por texto ni tool calling.
- No tiene capacidades multilingües (no es un modelo de lenguaje).
- No realiza razonamiento multi-paso ni funciones de agente.

## Casos de uso
- Visuales en vivo para VJ: el modelo genera imágenes en tiempo real que pueden mezclarse y manipularse con MIDI, permitiendo actuaciones audiovisuales sincronizadas con música.
- Instalaciones de arte generativo: creación de entornos visuales reactivos al sonido ambiente con hardware de bajo coste, como una Intel Arc A770.
- Diseño de texturas procedurales: generación de texturas de alta resolución (1536×1024) para videojuegos o renderizado, explorando variaciones en el espacio latente.
- Prototipado rápido de fondos y conceptos visuales: artistas y diseñadores pueden iterar sobre composiciones en tiempo real sin depender de servicios en la nube.
- Streaming y directos: integración en OBS u otras herramientas para generar fondos dinámicos durante retransmisiones.
- Educación e investigación: estudio interactivo de GANs y espacios latentes, con respuesta inmediata a los cambios en el vector latente.
- Performance audiovisual con batería: control por entrada de audio (drums) para generar visuales que reaccionan a la percusión en directo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks (FID, IS, etc.) en la información disponible. El único dato de rendimiento es la velocidad de inferencia.

| Métrica | Valor |
|---|---|
| Velocidad (Intel Arc A770) | 224 fps (4,5 ms por fotograma) |
| Resolución de salida | 1536×1024 |
| Dimensión del latente | 256 |

## Requisitos de hardware
- VRAM estimada: no disponible. El repositorio ocupa 0,1 GB, lo que sugiere que los pesos son pequeños (menos de 100 MB) y probablemente quepan en GPUs de consumo con 4 GB o menos, pero no se confirma.
- GPU recomendadas: Intel Arc A770 (probado a 224 fps). La librería ganlive es compatible con NVIDIA, AMD, Intel, Apple y CPU.
- Cabe en GPU de consumo: presumiblemente sí, dado el bajo peso del repositorio y la naturaleza del modelo, pero no hay especificaciones oficiales de VRAM mínima.
- Opciones de despliegue: ganlive (librería oficial), exportación a ONNX (soportado por ganlive para otros generadores), PyTorch (según la etiqueta del modelo).
- Latencia y throughput: 4,5 ms por fotograma (224 fps) en Intel Arc A770. No hay datos para otras GPUs.

## Comparativa con modelos similares
No se dispone de información cuantitativa suficiente para una comparativa detallada con otros modelos. Se puede comparar con ganlive-lichen, que comparte el mismo entrenamiento pero genera a 3072×2048, y con StyleGAN2, que ganlive también soporta, aunque sin datos concretos de rendimiento o parámetros.

| Modelo | Arquitectura | Resolución | Velocidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ganlive-amber | FastGAN | 1536×1024 | 224 fps (Arc A770) | MIT | HuggingFace |
| ganlive-lichen | FastGAN (presumiblemente) | 3072×2048 | no disponible | no disponible | HuggingFace |
| StyleGAN2 (genérico) | StyleGAN2 | típicamente 1024×1024 | no disponible | depende de la implementación | soportado por ganlive |

## Limitaciones y advertencias
- Generación incondicional: no acepta prompts de texto; la salida depende exclusivamente del vector latente.
- Sesgos: el entrenamiento usa 5.469 fotografías propias del autor, lo que puede introducir sesgos en los tipos de lugares, objetos y texturas generados.
- Alucinación: como GAN, puede generar artefactos o imágenes irreales, pero no hay datos sobre su tasa de fallo.
- Limitaciones de contexto o idioma: no aplica; no es un modelo de lenguaje.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías.
- Producción: el rendimiento en tiempo real depende del hardware; no hay benchmarks de calidad (FID/IS). La librería ganlive está en desarrollo y no se especifica su versión.
- No hay información sobre requisitos mínimos de VRAM ni sobre el formato exacto de los pesos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/gustavecortal/ganlive-amber
- Modelo hermano ganlive-lichen: https://huggingface.co/gustavecortal/ganlive-lichen
- Repositorio de ganlive: https://github.com/gustavecortal/ganlive
- Repositorio de gantrain: https://github.com/gustavecortal/gantrain
- Paper de FastGAN: https://arxiv.org/abs/2101.04775
- Vídeo de demostración: https://huggingface.co/gustavecortal/ganlive-amber/resolve/main/live.mp4
- Muestra de imágenes: https://huggingface.co/gustavecortal/ganlive-amber/resolve/main/samples.jpg
