# Comfy-Org/Wan_2.2_ComfyUI_Repackaged

## Resumen

Wan 2.2 es una familia de modelos de difusión para generación y edición de vídeo desarrollada por Alibaba, y este repositorio, mantenido por Comfy-Org, ofrece los archivos de pesos ya empaquetados y listos para usar en ComfyUI. El repositorio incluye múltiples variantes del modelo Wan 2.2, con tamaños de 14B y 5B parámetros, cubriendo tareas como texto a vídeo (t2v), imagen a vídeo (i2v), vídeo a vídeo (s2v), inpainting, control de cámara y edición con LoRAs específicas. Su relevancia radica en que simplifica la integración de estos modelos en el ecosistema ComfyUI, uno de los entornos de composición de nodos más utilizados por la comunidad de IA generativa.

La información técnica detallada (arquitectura exacta, datos de entrenamiento, licencia) no se proporciona en la model card, por lo que esta ficha se basa únicamente en los archivos listados y en el contexto general de la familia Wan 2.2. A pesar de la falta de especificaciones oficiales, el repositorio es ampliamente utilizado (más de 4,8 millones de descargas) y constituye un punto de entrada práctico para experimentar con generación de vídeo de alta calidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para vídeo, basado en la familia Wan 2.2) |
| Parametros totales | 14B y 5B (según variante) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, bf16, fp8_scaled, int8_convrot (según nombres de archivo) |
| Idiomas soportados | no disponible (se espera multilingüe, pero sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (archivos individuales) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el proceso de entrenamiento, el número de tokens utilizados o las técnicas de alineación (RLHF, DPO, etc.) en la model card de este repositorio. Los nombres de los archivos sugieren que se trata de modelos de difusión latente para vídeo, con variantes específicas para distintas tareas (texto a vídeo, imagen a vídeo, control de cámara, inpainting) y con estrategias de ruido alto/bajo (high_noise/low_noise) típicas de la familia Wan. Sin embargo, estos detalles no están documentados en la información disponible.

## Capacidades

Basándose en los nombres de los archivos incluidos, el repositorio proporciona pesos para los siguientes tipos de tareas:

- Texto a vídeo (t2v) con variantes high_noise y low_noise, en 14B y 5B.
- Imagen a vídeo (i2v) con variantes high_noise y low_noise, en 14B.
- Vídeo a vídeo (s2v) en 14B.
- Inpainting de vídeo (fun_inpaint) en 5B y 14B.
- Control de cámara (fun_camera) en 14B.
- Edición con LoRAs específicas (chrono_edit, relight, lightx2v para aceleración a 4 pasos).
- Incluye un codificador de audio (wav2vec2) y un codificador de texto (umt5_xxl).

No se especifican capacidades adicionales como tool calling, agentes o razonamiento multimodal más allá de la generación de vídeo.

## Casos de uso

- Generación de vídeo a partir de prompts de texto: ideal para creadores de contenido que necesitan prototipos rápidos de escenas animadas sin rodaje.
- Edición de vídeo con inpainting: permite modificar regiones específicas de un vídeo existente, útil en postproducción y corrección de errores.
- Control de cámara: la variante fun_camera permite generar movimientos de cámara específicos (pan, tilt, zoom) a partir de texto o condiciones, útil para previsualización de planos cinematográficos.
- Aceleración de inferencia con LoRAs lightx2v: reduce el número de pasos de difusión a 4, facilitando la generación en tiempo casi real en hardware moderado.
- Reiluminación de vídeos: la LoRA relight permite ajustar la iluminación de escenas generadas, útil en producción audiovisual.
- Integración en pipelines de ComfyUI: al ser un repositorio empaquetado, los usuarios pueden construir flujos complejos combinando estos modelos con otros nodos de ComfyUI para tareas como interpolación, superresolución o composición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se proporcionan requisitos oficiales. Sin embargo, dado que los modelos principales tienen 14B parámetros y se ofrecen en precisiones fp16/bf16, se estima que la inferencia requerirá al menos 24-32 GB de VRAM para las variantes de 14B en fp16, y algo menos en fp8. Las variantes de 5B podrían ejecutarse en GPUs con 12-16 GB. No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La licencia del modelo original no se indica en este repositorio; es necesario consultar la documentación oficial de Wan 2.2 para conocer las restricciones de uso comercial.
- No se proporcionan detalles sobre sesgos, alucinaciones o limitaciones de idioma. Al ser un modelo de vídeo, los riesgos típicos incluyen artefactos visuales, inconsistencias temporales y posibles sesgos en los datos de entrenamiento.
- El repositorio es un empaquetado de archivos; no incluye código de inferencia ni documentación técnica. Se requiere conocimiento previo de ComfyUI para su uso.
- Los archivos suman 731.6 GB, por lo que la descarga y el almacenamiento requieren planificación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged
- Ejemplos de uso en ComfyUI: https://comfyanonymous.github.io/ComfyUI_examples/wan22/
