# Comfy-Org/RelayVSR

## Resumen

RelayVSR es un modelo de superresolución de vídeo (VSR, *video super-resolution*) distribuido en formato de archivo único para ComfyUI. El repositorio `Comfy-Org/RelayVSR` es un reempaquetado de los pesos originales publicados por `kopper/RelayVSR` y `lightx2v/RelayVSR_X2`, preparado por el equipo de Comfy-Org para su uso directo en el nodo de modelos de difusión de ComfyUI. El modelo resuelve el problema de aumentar la resolución espacial de secuencias de vídeo (factores ×2 y ×4) manteniendo coherencia temporal entre fotogramas.

La relevancia de este repositorio es fundamentalmente práctica: los archivos originales no están en el formato que ComfyUI espera, y este *repack* incluye tanto los pesos del modelo de difusión cuantizados a INT8 con rotación de convoluciones (`convrot`) como los VAE ligeros (`flash_vae`) en FP32 necesarios para decodificar los latentes. El repositorio ocupa 10,6 GB y no incluye model card técnica propia más allá de las instrucciones de instalación.

No se dispone de información sobre la arquitectura interna, el número de parámetros, el dataset de entrenamiento ni los resultados de benchmarks en la información proporcionada. Los datos que siguen se limitan a lo que puede inferirse del nombre de los archivos, las etiquetas del repositorio y las instrucciones de la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para superresolución de vídeo, según los nombres de archivo y la librería `diffusion-single-file`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no hay evidencia de arquitectura MoE) |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantización | INT8 con rotación de convoluciones (`convrot`) para los pesos de difusión; FP32 para los VAE |
| Idiomas soportados | no disponible (modelo de visión/vídeo, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivos únicos para ComfyUI) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original `kopper/RelayVSR` en la documentación proporcionada. Por la librería declarada (`diffusion-single-file`) y la presencia de un VAE asociado, se trata de un modelo de difusión que opera en el espacio latente de un autoencoder (`relayvsr_flash_vae`) y genera fotogramas de vídeo de alta resolución a partir de los de baja resolución. Existen dos variantes según el factor de escala: ×2 (`relayvsr_x2_int8_convrot.safetensors`, con VAE `relayvsr_flash_vae_x2_fp32.safetensors`) y ×4 (`relayvsr_x4_int8_convrot.safetensors`, con VAE `relayvsr_flash_vae_x4_fp32.safetensors`).

La cuantización a INT8 con `convrot` (rotación de pesos en capas convolucionales) es una técnica habitual para reducir el peso y acelerar la inferencia de modelos de difusión manteniendo la calidad; el uso de un VAE "flash" sugiere un decodificador optimizado para velocidad. No hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Superresolución de vídeo con factores de escala ×2 y ×4.
- Generación de fotogramas de alta resolución a partir de secuencias de baja resolución, con coherencia temporal implícita en el modelo de difusión de vídeo.
- Integración nativa con ComfyUI mediante los nodos de modelos de difusión y VAE.
- Ejecución en formato de archivo único (`diffusion-single-file`), sin necesidad de cargar el repositorio completo por partes.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, multilingüismo ni modos de pensamiento; no aplican a un modelo de visión/vídeo de este tipo.

## Casos de uso

- Restauración de material de archivo: aplicar la variante ×4 a vídeos antiguos o de baja resolución para obtener versiones en alta definición, usando el VAE `flash_vae_x4` para decodificar los latentes con bajo coste computacional.
- Reescalado de contenido generado por IA: cadenas de generación de vídeo sintético que producen fotogramas a resolución reducida pueden pasar por RelayVSR ×2 para duplicar la resolución antes de la composición final en ComfyUI.
- *Upscaling* de vídeo para producción audiovisual: secuencias rodadas a 720p pueden procesarse con la variante ×2 para entregar en 1440p, integrándose en un *pipeline* de ComfyUI junto con otros nodos de posprocesado.
- Mejora de material para *streaming*: aumentar la resolución de vídeos comprimidos antes de la codificación final, reduciendo artefactos de compresión mediante el paso por el modelo de difusión.
- Preprocesado para *datasets* de visión por computador: elevar la resolución de secuencias de entrenamiento antes de alimentar modelos de detección o segmentación que se benefician de mayor detalle espacial.
- Restauración de vídeo doméstico: procesar grabaciones de baja calidad (cámaras antiguas, móviles de gama baja) con la variante ×2 y el VAE FP32 para maximizar la fidelidad de color.
- Investigación en superresolución de vídeo: servir como referencia reproducible en ComfyUI para comparar con otros métodos de VSR, gracias a la licencia Apache 2.0 y al formato de archivo único.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 10,6 GB, por lo que se recomienda al menos 12-16 GB de VRAM para cargar los pesos INT8 y el VAE FP32 simultáneamente, si bien esta cifra es una estimación orientativa y no un dato del autor.
- GPU recomendadas: no disponibles en la documentación. Por el tamaño del repositorio, GPUs de 24 GB (RTX 4090, A100 40 GB) son las candidatas naturales para ejecutar sin *offloading*; GPUs de 16 GB podrían requerir descarga parcial de capas.
- Viabilidad en GPU de consumo: probable en RTX 3090/4090 (24 GB) y posible en RTX 4080 (16 GB) con gestión de memoria de ComfyUI; no confirmado por el autor.
- Opciones de despliegue: ComfyUI (vía los nodos de modelos de difusión y VAE, según las instrucciones de instalación). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos alternativos de superresolución de vídeo ni datos comparativos de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No se dispone de model card técnica del modelo original en este repositorio; la documentación se limita a instrucciones de instalación en ComfyUI.
- Los pesos están cuantizados a INT8 con `convrot`; la variante FP32 del modelo de difusión no se distribuye aquí, lo que puede limitar la fidelidad máxima alcanzable.
- El VAE se distribuye en FP32, lo que incrementa el uso de VRAM frente a una versión FP16.
- No hay información sobre sesgos, riesgo de alucinación visual (artefactos en texturas o movimiento) ni sobre el comportamiento del modelo en distintos tipos de contenido (animación, escenas nocturnas, movimiento rápido).
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo original `kopper/RelayVSR` y de `lightx2v/RelayVSR_X2`, ya que este repositorio es solo un reempaquetado.
- El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, por lo que no hay evidencia de validación comunitaria.
- No se documentan limitaciones de resolución de entrada, número máximo de fotogramas por pasada ni requisitos de memoria para secuencias largas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Comfy-Org/RelayVSR
- Modelo original: https://huggingface.co/kopper/RelayVSR
- Modelo base secundario: https://huggingface.co/lightx2v/RelayVSR_X2
- Repositorio de ComfyUI: https://github.com/Comfy-Org/ComfyUI
