# nodevorg/studio-models-h3

## Resumen

`nodevorg/studio-models-h3` no es un modelo de lenguaje, sino un repositorio de redistribución de pesos del modelo generativo de vídeo MiniMax H3, empaquetados en el formato de un solo archivo que consume ComfyUI. Lo publica el autor `nodevorg` para su plataforma studio.no.dev, que ejecuta estos archivos tanto en ComfyUI como en su propio runtime "uncomfy". El repositorio reúne tres linajes distintos: las dos torres de HyperFlow H3 Flash de Video Rebirth (texto a vídeo e imagen a vídeo, y referencia a vídeo), un checkpoint propio denominado Studio H3 V1, y los adaptadores de destilación pi-H3 de Lakonik (Hansheng Chen et al.) que reducen el muestreo a 2 o 4 pasos.

La relevancia de este repositorio es práctica más que arquitectónica: actúa como punto único de descarga de variantes cuantizadas a int8 en el layout de ComfyUI (`int8_tensorwise` con convrot, group size 256), evitando al usuario tener que recomponer archivos de tres repositorios upstream distintos. El tamaño total del repositorio es de 57,7 GB, con descargas registradas de 605 y un único "like" en el momento de la consulta, lo que sugiere una distribución de nicho orientada a un flujo de trabajo concreto.

Todos los archivos son derivados del modelo MiniMax H3 y se distribuyen bajo la MiniMax H3 Community License Agreement, con las restricciones territoriales y comerciales que ese acuerdo impone. El repositorio no es un producto oficial de MiniMax, Video Rebirth ni pi-H3; es un repackaging de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación de vídeo (MiniMax H3); no se detalla la arquitectura interna en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica a un modelo de difusión de vídeo en el sentido de LLM) |
| Tipos de cuantizacion | int8 (`int8_tensorwise` con convrot, group size 256) en todos los archivos |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | safetensors de archivo único para ComfyUI (`diffusion-single-file`) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de MiniMax H3; se limita a redistribuir pesos ya entrenados. Por los nombres de las torres y los flujos descritos, se trata de un modelo de difusión para generación de vídeo con dos torres diferenciadas: `fl2va` (texto a vídeo e imagen a vídeo a partir de un primer fotograma o de primer y último fotograma) y `ref2va` (vídeo a partir de imágenes y audio de referencia). La torre `fl2va` de HyperFlow H3 Flash tiene 3 bloques eliminados y 102 capas lineales en low-rank; la torre `ref2va` tiene 1 bloque eliminado y 114 capas lineales en low-rank. Ambos muestrean en 6 u 8 pasos sin PDD, y los pesos int8 se copian sin modificar desde los archivos de Video Rebirth.

El componente pi-H3 son adaptadores de destilación (DWD) que reducen la torre `fl2va` estándar a 2 o 4 pasos de muestreo, con `max_raw_t` de 0,93 y 0,96 respectivamente, y decodifican el vídeo desde el último paso sin usar el VAE. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que el repositorio es un repackaging y no incluye esos detalles.

## Capacidades

- Generación de vídeo a partir de texto (text to video) con la torre `fl2va`.
- Generación de vídeo a partir de una imagen (primer fotograma) o de primer y último fotograma, mediante el nodo `MiniMaxH3ImageToVideo`.
- Generación de vídeo a partir de imágenes y audio de referencia, mediante el nodo `MiniMaxH3ReferenceToVideo` y la torre `ref2va`.
- Muestreo acelerado: 6 u 8 pasos con HyperFlow H3 Flash sin PDD; 2 o 4 pasos con los adaptadores pi-H3.
- Decodificación de vídeo sin VAE en el último paso cuando se usan los adaptadores DWD de pi-H3.
- Integración con ComfyUI mediante cargadores específicos (`HyperFlowInt8Loader` y `Load LakonLab Adapter`).
- No se documentan capacidades de texto, razonamiento, código, tool calling ni agentes; no es un modelo de lenguaje.

## Casos de uso

- Generación de vídeo publicitario a partir de texto: la torre `fl2va` en 6 u 8 pasos permite producir clips desde un prompt sin necesidad de imagen de partida, adecuado para prototipado rápido de conceptos creativos.
- Animación de una imagen fija: usar `MiniMaxH3ImageToVideo` con un primer fotograma para convertir ilustraciones o fotografías en vídeo, útil en producción de contenido para redes sociales.
- Interpolación entre primer y último fotograma: generar la transición entre dos imágenes clave, apropiado para secuencias narrativas o transiciones en montaje.
- Vídeo con referencia de audio e imágenes: la torre `ref2va` permite construir escenas guiadas por material de referencia, útil para doblaje visual o sincronización con pistas de audio.
- Iteración rápida en estudio: los adaptadores pi-H3 de 2 pasos reducen el coste de muestreo, lo que facilita barridos de prompts y semillas antes de un render final a más pasos.
- Pipeline de postproducción en ComfyUI: al cargarse con el `UNETLoader` estándar (Studio H3 V1) o con los cargadores específicos, el modelo se integra en grafos de nodos junto con el codificador de texto y los VAE estándar de MiniMax H3.
- Evaluación comparativa de variantes: al reunir en un solo repositorio las torres HyperFlow, el checkpoint Studio H3 V1 y los adaptadores pi-H3, permite al investigador comparar configuraciones de muestreo sobre la misma base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los archivos individuales pesan entre 2,2 GB (adaptadores) y 20,2 GB (Studio H3 V1), por lo que la inferencia requiere al menos espacio para el archivo de difusión más el codificador de texto y los VAE, además de las activaciones de vídeo.
- GPU recomendadas: no disponible en la información proporcionada.
- Ajuste en GPU de consumo: no confirmado; los archivos de 16,3 a 20,2 GB en int8 quedan por encima de la VRAM de muchas GPU de consumo, aunque el layout int8 está pensado para reducir el uso de memoria frente a los pesos originales.
- Despliegue: ComfyUI (con `ComfyUI-Studio-HyperFlow`, `ComfyUI-HyperFlow-Flash` y `ComfyUI-piFlow` según la variante) y el runtime "uncomfy" de studio.no.dev. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de vídeo de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de generación de vídeo que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax H3 Community License Agreement incluye restricciones territoriales, términos comerciales y una Acceptable Use Policy; es imprescindible revisar el archivo `LICENSE` antes de cualquier uso comercial.
- Repositorio no oficial: no es un producto de MiniMax, Video Rebirth ni pi-H3; los cambios respecto a los archivos originales se documentan en `NOTICE`.
- Compatibilidad limitada: las torres HyperFlow no cargan con el cargador H3 estándar de ComfyUI; requieren `HyperFlowInt8Loader` y el schedule de `ComfyUI-HyperFlow-Flash`. Los adaptadores pi-H3 requieren `ComfyUI-piFlow`.
- Dependencia de archivos externos: el codificador de texto y los VAE deben tomarse de `Comfy-Org/MiniMax-H3`.
- Riesgo de alucinación visual y artefactos: no se documentan métricas de calidad ni evaluaciones; al ser un modelo de difusión, puede producir inconsistencias temporales o geométricas no cuantificadas en la información disponible.
- Idiomas soportados: no disponibles, lo que impide garantizar el comportamiento con prompts en castellano.
- Sesgos: no documentados en la información proporcionada.
- Advertencia sobre la búsqueda web: los resultados de búsqueda recibidos corresponden a productos de moda (bufandas de Acne Studios) y no guardan relación con el modelo; se descartan por completo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nodevorg/studio-models-h3
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia upstream: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- HyperFlow H3 Flash (Video Rebirth): https://huggingface.co/VideoRebirthAI/hyperflow-h3-flash
- pi-H3 (Lakonik): https://huggingface.co/Lakonik/pi-H3
- Pesos estándar de MiniMax H3 para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3
- ComfyUI-Studio-HyperFlow: https://github.com/NoDevOrg/ComfyUI-Studio-HyperFlow
- ComfyUI-HyperFlow-Flash: https://github.com/Video-Rebirth/ComfyUI-HyperFlow-Flash
- ComfyUI-piFlow: https://github.com/Lakonik/ComfyUI-piFlow
- Guía pi-H3 en ComfyUI-piFlow: https://github.com/Lakonik/ComfyUI-piFlow/blob/main/docs/piH3.md
- Plataforma studio.no.dev: https://studio.no.dev
