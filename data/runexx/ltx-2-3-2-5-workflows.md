# RuneXX/LTX-2.3-2.5-Workflows

## Resumen

RuneXX/LTX-2.3-2.5-Workflows es un repositorio de workflows de ComfyUI creado por RuneXX que permite generar vídeo con los modelos LTX-2.3 y LTX-2.5 de Lightricks. En lugar de ofrecer un checkpoint monolítico, el repositorio proporciona flujos de trabajo modulares que cargan por separado el modelo de difusión, el text encoder (Gemma 3 12B), los VAE de vídeo y audio, y el upscaler espacial. Esto facilita la ejecución local en hardware de consumo, ya que cada componente puede cuantizarse o descargarse de forma independiente.

El repositorio es relevante porque LTX-2.5 es la versión más reciente de la familia LTX, con compatibilidad hacia atrás con la mayoría de LoRAs de LTX-2.3. Los workflows están pensados para funcionar con nodos personalizados como ComfyUI-KJNodes y ComfyUI-GGUF, y admiten tanto safetensors como GGUF para el text encoder. Aunque el repositorio en sí no contiene pesos (tamaño 0.0 GB), actúa como punto de entrada para descargar los modelos desde las fuentes oficiales de Lightricks y Kijai.

La licencia no está disponible en la información proporcionada, y los idiomas soportados tampoco se especifican. El pipeline principal es image-to-video, pero los workflows cubren también text-to-video, audio-to-video y video-to-video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de video (LTX-2.3 / LTX-2.5) con text encoder Gemma 3 12B y VAE de video/audio |
| Parametros totales | no disponible (depende del modelo subyacente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF para text encoder (p. ej. Q2_K) y modelos LTX-2.3 GGUF (QuantStack, Unsloth, Vantage) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (modelos divididos) y GGUF (text encoder y modelos cuantizados) |

## Arquitectura y entrenamiento

El repositorio no contiene información sobre el entrenamiento de los modelos LTX-2.3 o LTX-2.5. Se sabe que son modelos de difusion para generacion de video, desarrollados por Lightricks, y que utilizan un text encoder basado en Gemma 3 12B. Los workflows cargan el modelo de difusion por separado del VAE y del text encoder, lo que permite una gestion de memoria mas eficiente.

Los modelos LTX-2.3 se basan en los archivos extraidos del repositorio Kijai/LTX2.3_comfy, mientras que LTX-2.5 se distribuye como archivos divididos desde Lightricks/LTX-2.5. No se dispone de detalles sobre el dataset de entrenamiento, el numero de tokens o si se aplicaron tecnicas como RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas en el repositorio, mas alla de la compatibilidad con cuantizacion GGUF y la separacion de componentes.

## Capacidades

- Generacion de video a partir de texto (text-to-video).
- Generacion de video a partir de imagenes (image-to-video).
- Generacion de video a partir de audio (audio-to-video).
- Transformacion de video a video (video-to-video).
- Soporte de cuantizacion GGUF para el text encoder y para los modelos LTX-2.3, lo que reduce los requisitos de VRAM.
- Compatibilidad con LoRAs de LTX-2.3 en LTX-2.5 (retrocompatibilidad).
- Uso de un upscaler espacial (ltx-2.3-spatial-upscaler) para mejorar la resolucion.
- Integracion con ComfyUI mediante nodos personalizados (KJNodes, ComfyUI-GGUF).
- Previsualizacion de muestras con un VAE tiny opcional (madebyollin) para mayor velocidad.

## Casos de uso

- Creacion de clips cortos para redes sociales: el workflow image-to-video permite partir de una imagen fija y generar un video animado de pocos segundos, adecuado para contenido promocional o artistico.
- Prototipado rapido de animaciones: los workflows modulares permiten iterar sobre prompts y parametros sin recargar modelos completos, agilizando la experimentacion en estudios de diseno.
- Generacion de video con audio sincronizado: el modo audio-to-video puede utilizarse para crear videos musicales o visualizaciones reactivas a partir de pistas de audio.
- Postproduccion de video: el modo video-to-video permite aplicar estilos o transformaciones a clips existentes, por ejemplo para cambiar la estetica o anadir efectos.
- Desarrollo de aplicaciones de generacion de video en local: al usar modelos divididos y cuantizacion GGUF, es posible integrar estos workflows en pipelines propios con GPUs de consumo (12-16 GB VRAM).
- Educacion y demostraciones: los workflows sirven como material didactico para ensenar el flujo de generacion de video con ComfyUI, ya que estan documentados y son facilmente modificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de calidad o velocidad de generacion para los modelos LTX-2.3 o LTX-2.5.

## Requisitos de hardware

- VRAM estimada: no se especifica oficialmente, pero los demos del repositorio se generaron con una RTX 6000 (96 GB VRAM). Para GPUs de 12-16 GB (p. ej. RTX 5070) se recomienda usar un text encoder cuantizado (gemma-3-12b-it-Q2_K.gguf) y activar el VAE tiled y el nodo de gestion de VRAM.
- GPU recomendadas: RTX 6000 (96 GB) para calidad maxima; RTX 5070 o similar para configuraciones ajustadas con cuantizacion.
- Si cabe en consumer GPU: si, con cuantizacion GGUF y ajustes de memoria, aunque la calidad puede verse reducida.
- Opciones de despliegue: ComfyUI (local), con nodos personalizados KJNodes y ComfyUI-GGUF. Tambien se pueden usar los modelos con el cargador por defecto de ComfyUI si se prefiere un checkpoint unico.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar directamente con otros modelos de generacion de video. El repositorio se centra en workflows de ComfyUI, por lo que la comparativa deberia hacerse entre los modelos LTX-2.3/2.5 y alternativas como Wan, CogVideo o Mochi, pero no se proporcionan datos de rendimiento ni especificaciones en la informacion disponible.

## Limitaciones y advertencias

- La licencia de los modelos y workflows no esta disponible, lo que impide conocer las restricciones de uso comercial.
- No se especifican los idiomas soportados por el text encoder Gemma 3 12B, aunque este modelo es multilingue por diseño.
- El repositorio depende de nodos personalizados de ComfyUI que deben mantenerse actualizados; versiones antiguas pueden causar incompatibilidades.
- La generacion de video con modelos de difusion puede producir artefactos o alucinaciones visuales, especialmente con prompts complejos o contenido no representado en el dataset de entrenamiento.
- Los requisitos de VRAM pueden ser elevados si no se utilizan cuantizaciones; en GPUs de menos de 12 GB puede ser necesario reducir la resolucion o el numero de frames.
- No se proporcionan garantias de calidad ni soporte tecnico por parte del autor del repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RuneXX/LTX-2.3-2.5-Workflows
- Repositorio original de workflows LTX-2.3: https://huggingface.co/RuneXX/LTX-2.3-Workflows
- Modelos oficiales LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Modelos extraidos LTX-2.3 (Kijai): https://huggingface.co/Kijai/LTX2.3_comfy
- Text encoder Gemma 3 12B (safetensor): https://huggingface.co/Comfy-Org/ltx-2/tree/main/split_files/text_encoders
- Text encoder Gemma 3 12B (GGUF): https://huggingface.co/unsloth/gemma-3-12b-it-GGUF/
- Upscaler espacial LTX-2.3: https://huggingface.co/Lightricks/LTX-2.3/tree/main
- GGUF LTX-2.3 (QuantStack): https://huggingface.co/QuantStack/LTX-2.3-GGUF
- GGUF LTX-2.3 (Unsloth): https://huggingface.co/unsloth/LTX-2.3-GGUF
- GGUF LTX-2.3 (Vantage): https://huggingface.co/vantagewithai/LTX-2.3-GGUF
- Nodos KJNodes: https://github.com/kijai/ComfyUI-KJNodes
- Nodos ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Workflows oficiales de ComfyUI para LTX-2.3: https://blog.comfy.org/p/ltx-23-day-0-supporte-in-comfyui
- Workflows oficiales de Lightricks: https://github.com/Lightricks/ComfyUI-LTXVideo/tree/master/example_workflows/2.3
- Demos del repositorio (GitHub): https://github.com/farazshaikh/LTX-2.3-Workflows
