# realrebelai/LOW_VRAM_Workflows

## Resumen

El repositorio `realrebelai/LOW_VRAM_Workflows` no es un modelo de inteligencia artificial, sino una colección de workflows de ComfyUI desarrollados por Rebel AI (RealRebelAI) para ejecutar generación de imágenes y vídeo de alta calidad en hardware de gama media, específicamente con 8 GB de VRAM. El proyecto aborda el problema del alto consumo de memoria de los modelos generativos modernos, que normalmente requieren GPUs de 16 GB o más, y propone configuraciones optimizadas mediante técnicas de offloading y cuantización agresiva (GGUF, FP8, NVFP4, INT4).

La relevancia actual radica en que democratiza el acceso a modelos de última generación como Flux, Z-Image, LTX-Video o HiDream-O1-Image-Dev para usuarios con GPUs como la RTX 3070, que de otro modo no podrían ejecutarlos. El repositorio incluye workflows publicados en el canal de YouTube de Rebel AI y configuraciones exclusivas, mantenido activamente por su autor. No se trata de un modelo con parámetros ni entrenamiento, sino de una colección de archivos JSON que integran múltiples modelos open source con nodos personalizados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (colección de workflows de ComfyUI que integran diversos modelos generativos) |
| Parametros totales | No aplica |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | GGUF, FP8, NVFP4, INT4 (según la model card) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON (workflows de ComfyUI) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino configuraciones de grafos de ComfyUI que orquestan modelos preexistentes. Los workflows están diseñados para aprovechar estrategias de offloading de memoria entre GPU y RAM del sistema, junto con cuantización de pesos para reducir el consumo de VRAM. La arquitectura subyacente depende de cada modelo integrado: por ejemplo, Flux y Z-Image son modelos de difusión de texto a imagen, mientras que LTX-Video es un modelo de difusión de vídeo. El autor no documenta ningún proceso de entrenamiento o fine-tuning, ya que el foco está en la optimización de la inferencia.

Las innovaciones técnicas incluyen la integración de nodos personalizados desarrollados por el canal, como `Rebels Animated Nodes`, `Rebels Audio Nodes`, `Rebels Prompt Enhancer` y `Rebels RIB Nodes`, que extienden las capacidades nativas de ComfyUI para manejar secuencias animadas, audio y mejora de prompts. También se mencionan implementaciones con modelos Unsloth Dynamic (UD) para LTX-Video, que permiten ajustar dinámicamente el tamaño del modelo según los recursos disponibles.

## Capacidades

- Generación de imágenes fotorrealistas y cinematográficas con calidad tipo DSLR raw y detalle 8K, mediante modelos como Flux, Z-Image, Ernie Image, HiDream-O1-Image-Dev y SenseNova-u1.
- Generación de vídeo de texto a vídeo con LTX-Video, incluyendo versiones optimizadas con modelos Unsloth Dynamic.
- Ejecución de estos modelos en GPUs con 8 GB de VRAM, gracias a cuantización GGUF, FP8, NVFP4 e INT4, y a estrategias de offloading.
- Integración con nodos personalizados que añaden funcionalidades de animación, audio y mejora de prompts dentro de ComfyUI.
- Soporte para instalación automática de nodos faltantes mediante ComfyUI Manager.
- Compatibilidad con múltiples frameworks de modelos open source en un mismo entorno unificado.

## Casos de uso

- Producción de contenido visual para redes sociales: un creador con una RTX 3070 puede generar imágenes de alta calidad para publicaciones sin necesidad de servicios en la nube, gracias a la optimización para 8 GB de VRAM y la cuantización FP8.
- Prototipado rápido de conceptos cinematográficos: los workflows de LTX-Video permiten generar clips cortos de vídeo a partir de prompts de texto, adecuados para previsualizar escenas antes de una producción completa.
- Automatización de generación de assets para videojuegos: los workflows de texto a imagen pueden integrarse en pipelines de desarrollo para crear texturas o concept art de forma iterativa, usando la mejora de prompts del nodo `Rebels Prompt Enhancer`.
- Educación y experimentación: estudiantes e investigadores pueden probar modelos de última generación sin invertir en hardware caro, utilizando los workflows como base para sus propios experimentos en ComfyUI.
- Creación de contenido para YouTube: el propio canal de Rebel AI utiliza estos workflows para sus tutoriales, lo que demuestra su uso práctico en la producción de vídeos educativos.
- Generación de vídeo con audio sincronizado: gracias a los nodos de audio personalizados, es posible crear secuencias de vídeo con banda sonora generada o editada dentro del mismo flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento cuantitativas como tiempos de generación, FPS o comparativas con otras configuraciones. La única referencia es la afirmación de que los workflows están "stress-tested" para 8 GB de VRAM y que evitan errores de memoria, pero no se proporcionan datos numéricos.

## Requisitos de hardware

- VRAM mínima recomendada: 8 GB, según la model card. El autor indica que los workflows están optimizados para entornos similares a una NVIDIA RTX 3070 con 16 GB de RAM del sistema.
- GPU recomendadas: cualquier GPU con 8 GB de VRAM y soporte para las cuantizaciones utilizadas (GGUF, FP8, NVFP4, INT4). Ejemplos: RTX 3070, RTX 4060, RTX A2000, etc.
- Memoria RAM: se recomiendan 16 GB de RAM del sistema para el offloading de pesos entre GPU y CPU.
- Opciones de despliegue: los workflows están diseñados exclusivamente para ComfyUI, con soporte para ComfyUI Manager para instalar nodos personalizados. No se mencionan otros entornos como vLLM o llama.cpp.
- Latencia y throughput: no disponibles. El autor menciona que la optimización busca "generación rápida", pero no ofrece cifras concretas.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo comparable con otros modelos de IA, sino una colección de workflows. No existe una categoría estandarizada de repositorios de workflows de ComfyUI con la que comparar directamente, y la información disponible no menciona alternativas similares.

## Limitaciones y advertencias

- Dependencia de nodos personalizados: muchos workflows requieren la instalación de nodos de terceros (`Rebels Animated Nodes`, `Rebels Audio Nodes`, etc.) que deben instalarse manualmente o mediante ComfyUI Manager. Sin ellos, los workflows no funcionarán.
- Requisitos de modelos adicionales: los workflows hacen referencia a checkpoints, LoRAs y VAEs que deben descargarse por separado. El usuario debe asegurarse de que las rutas locales sean correctas.
- Riesgo de errores de memoria: aunque los workflows están optimizados para 8 GB de VRAM, el rendimiento puede variar según la configuración exacta del hardware y la versión de ComfyUI. No se garantiza ausencia de OOM en todos los escenarios.
- Limitación de idioma: no se especifican idiomas soportados. Los prompts y nodos están en inglés, por lo que los usuarios hispanohablantes deberán trabajar en ese idioma.
- Sin garantías de soporte: al ser un proyecto de un canal de YouTube, el mantenimiento depende de la actividad del autor. No hay un equipo de soporte formal.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe revisar las licencias de los modelos individuales integrados en los workflows (Flux, LTX-Video, etc.), que pueden tener restricciones propias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/realrebelai/LOW_VRAM_Workflows
- Canal de YouTube de Rebel AI: https://www.youtube.com/@realrebelai/videos
- Repositorio GitHub de nodos para AsymFLUX.2 Klein: https://github.com/RealRebelAI/REBELS_LOW_VRAM_ComfyUI-Klein9B-AsymFlow
- Ejemplo de workflow LTX-2.5 en YouTube: https://www.youtube.com/watch?v=pgWSDVSgon0
