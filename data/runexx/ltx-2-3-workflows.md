# RuneXX/LTX-2.3-Workflows

## Resumen

El repositorio RuneXX/LTX-2.3-Workflows no contiene un modelo de IA en sí, sino una colección de flujos de trabajo (workflows) listos para usar en ComfyUI, orientados al modelo de generación de vídeo LTX-2.3 desarrollado por Lightricks. El autor, RuneXX, ha preparado estos workflows para facilitar la ejecución de LTX-2.3 en ComfyUI, tanto con los modelos divididos en archivos separados (safetensors) como con versiones cuantizadas en GGUF, incluyendo soporte para text-to-video, image-to-video, audio-to-video y video-to-video.

El repositorio es relevante porque simplifica la puesta en marcha de LTX-2.3, un modelo de vídeo generativo de última generación, al ofrecer configuraciones ya probadas que integran el codificador de texto Gemma 3 12B, el VAE de vídeo y el upscaler espacial. Aunque el repositorio en sí no ocupa espacio (0.0 GB, solo contiene archivos de configuración), proporciona enlaces a los modelos necesarios alojados en otros repositorios, como Kijai/LTX2.3_comfy y las versiones GGUF de QuantStack, Unsloth o Vantage.

La licencia del repositorio no está especificada, y los idiomas soportados dependen del modelo subyacente. Para desarrolladores e investigadores que trabajan con ComfyUI, este repositorio es un punto de partida práctico para experimentar con LTX-2.3 sin tener que construir los grafos desde cero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (depende del modelo LTX-2.3 subyacente) |
| Parametros totales | No disponible (el repositorio no contiene pesos) |
| Parametros activos | No aplicable |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (Q4_K_M, Q5_K_M, Q8_0, etc., según el proveedor) y safetensors |
| Idiomas soportados | No disponible (depende de Gemma 3 12B y LTX-2.3) |
| Licencia | No disponible |
| Formato de pesos | Workflows JSON de ComfyUI; los pesos se descargan por separado (safetensors o GGUF) |

## Arquitectura y entrenamiento

Este repositorio no describe la arquitectura del modelo, ya que es una colección de workflows. El modelo subyacente, LTX-2.3 de Lightricks, es un modelo de generación de vídeo que utiliza un enfoque de difusión latente, pero no se proporcionan detalles técnicos específicos en la información disponible. Los workflows integran componentes como el codificador de texto Gemma 3 12B (en versiones safetensor o GGUF), un VAE de vídeo y audio, y un upscaler espacial 2x opcional. El entrenamiento de LTX-2.3 no está documentado en este repositorio; se recomienda consultar la documentación oficial de Lightricks para obtener información sobre el dataset y el proceso de entrenamiento.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) mediante los workflows incluidos.
- Generación de vídeo a partir de imagen (image-to-video) y de audio (audio-to-video).
- Transformación de vídeo a vídeo (video-to-video) con edición basada en prompts.
- Soporte para modelos cuantizados en GGUF, lo que permite ejecutar LTX-2.3 en hardware con menos VRAM.
- Integración con ComfyUI, incluyendo nodos personalizados como ComfyUI-KJNodes y ComfyUI-GGUF.
- Previsualización en tiempo real mediante un VAE pequeño (tiny VAE) opcional para muestras de baja resolución.

## Casos de uso

- Prototipado rápido de generación de vídeo: los workflows permiten probar LTX-2.3 en ComfyUI sin configurar manualmente los nodos, ideal para investigadores que quieran evaluar la calidad del modelo.
- Producción de vídeo creativo: con image-to-video y text-to-video, se pueden generar clips cortos para storyboards, moodboards o contenido para redes sociales.
- Edición de vídeo con IA: el modo video-to-video permite transformar secuencias existentes con nuevos estilos o contenidos, útil para postproducción.
- Experimentación con cuantización: los workflows GGUF facilitan probar diferentes niveles de cuantización y medir el impacto en calidad y rendimiento en GPUs de consumo.
- Integración en pipelines de ComfyUI: los workflows pueden adaptarse a entornos de automatización, por ejemplo, generación por lotes de clips para datasets de entrenamiento.
- Evaluación comparativa de modelos de vídeo: al tener configuraciones listas, se pueden ejecutar pruebas side-by-side entre LTX-2.3 y otros modelos de vídeo en el mismo entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento ni comparativas con otros modelos de vídeo.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización y del modelo. Para safetensors completos se recomienda al menos 24 GB de VRAM; con GGUF Q4 se puede reducir a 12-16 GB, aunque no hay cifras oficiales.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB) para safetensors; RTX 4060/4070 (12-16 GB) para GGUF cuantizado.
- El modelo LTX-2.3 requiere un codificador de texto Gemma 3 12B, que añade unos 12 GB adicionales de VRAM si se carga en FP16, o menos si se usa GGUF.
- Opciones de despliegue: ComfyUI local, con soporte para vLLM no documentado; los workflows están diseñados exclusivamente para ComfyUI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no proporciona comparaciones con otros modelos de generación de vídeo como Stable Video Diffusion, Wan 2.1 o Mochi 1. Se recomienda consultar benchmarks externos de LTX-2.3.

## Limitaciones y advertencias

- El repositorio no incluye los pesos del modelo; es necesario descargarlos por separado desde los enlaces proporcionados, lo que puede suponer varios gigabytes.
- La licencia de LTX-2.3 y de los modelos asociados no está especificada en este repositorio; es imprescindible revisar las licencias de Lightricks y de los repositorios de terceros antes de uso comercial.
- Los workflows dependen de versiones muy recientes de ComfyUI y de los nodos personalizados; versiones antiguas pueden no ser compatibles.
- No se garantiza el rendimiento en GPUs con menos de 12 GB de VRAM; las cuantizaciones GGUF pueden degradar la calidad del vídeo.
- El modelo puede presentar alucinaciones visuales o incoherencias en vídeos largos o con prompts complejos; se recomienda validar los resultados.
- Los idiomas soportados dependen de Gemma 3 12B; el rendimiento en idiomas distintos del inglés puede ser inferior.

## Enlaces

- Repositorio de workflows: https://huggingface.co/RuneXX/LTX-2.3-Workflows
- Modelos divididos (Kijai/LTX2.3_comfy): https://huggingface.co/Kijai/LTX2.3_comfy
- Modelo principal LTX-2.3 (Lightricks): https://huggingface.co/Lightricks/LTX-2.3
- Colección LTX-2.3 (Lightricks): https://huggingface.co/collections/Lightricks/ltx-23
- GGUF QuantStack: https://huggingface.co/QuantStack/LTX-2.3-GGUF
- GGUF Unsloth: https://huggingface.co/unsloth/LTX-2.3-GGUF
- GGUF Vantage: https://huggingface.co/vantagewithai/LTX-2.3-GGUF
- Codificador de texto Gemma 3 12B (safetensors): https://huggingface.co/Comfy-Org/ltx-2/tree/main/split_files/text_encoders
- Gemma 3 12B it GGUF (Unsloth): https://huggingface.co/unsloth/gemma-3-12b-it-GGUF/
- Upscaler espacial LTX-2.3: https://huggingface.co/Lightricks/LTX-2.3/tree/main
- Workflows oficiales de ComfyUI: https://blog.comfy.org/p/ltx-23-day-0-supporte-in-comfyui
- Workflows oficiales de Lightricks: https://github.com/Lightricks/ComfyUI-LTXVideo/tree/master/example_workflows/2.3
- Nodos KJNodes: https://github.com/kijai/ComfyUI-KJNodes
- Nodos GGUF: https://github.com/city96/ComfyUI-GGUF
