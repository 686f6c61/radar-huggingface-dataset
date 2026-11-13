# reverie-studio/VoxCPM2

## Resumen

VoxCPM2 es un modelo de síntesis de voz (text-to-speech) desarrollado originalmente por OpenBMB. La ficha que nos ocupa, `reverie-studio/VoxCPM2`, es un espejo (mirror) sin modificaciones del repositorio original `openbmb/VoxCPM2`, publicado por Reverie Studio para centralizar las descargas de su servicio Echo. No se trata, por tanto, de un modelo nuevo ni de un fine-tuning: los archivos son idénticos byte a byte al original, con sumas de verificación incluidas en `SHA256SUMS`.

El modelo cuenta con 2.290.004.544 parámetros (aproximadamente 2,29 mil millones) en formato safetensors, con un tamaño de repositorio de 5,0 GB. La inclusión de un archivo `audiovae.pth` y de un tokenizador específico (`tokenization_voxcpm2.py`, `special_tokens_map.json`) apunta a una arquitectura de generación de audio con un VAE de audio, aunque la información disponible no detalla la arquitectura interna ni el proceso de entrenamiento.

La relevancia de este repositorio es logística más que técnica: permite a los usuarios del servicio Echo descargar todos sus modelos desde un único punto, manteniendo la licencia Apache 2.0 del original. Para cualquier evaluación técnica del modelo, debe consultarse el repositorio original de OpenBMB, ya que esta ficha solo puede reflejar los metadatos disponibles en el espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (incluye `audiovae.pth`, lo que sugiere un VAE de audio; detalles no publicados en esta ficha) |
| Parametros totales | 2.290.004.544 (~2,29 mil millones) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), además de `audiovae.pth` (PyTorch) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de alineación como RLHF o DPO. La presencia de un archivo `audiovae.pth` junto al checkpoint principal en safetensors sugiere un diseño de dos componentes: un modelo generativo principal y un VAE de audio para la decodificación de la forma de onda, patrón habitual en modelos TTS modernos, pero no se confirma en la documentación disponible.

El repositorio es un espejo byte a byte del original `openbmb/VoxCPM2`. No se ha realizado ningún fine-tuning ni modificación de los pesos; la etiqueta `base_model:finetune:openbmb/VoxCPM2` presente en los tags de Hugging Face no se corresponde con un entrenamiento adicional verificable en esta ficha. Para detalles sobre la arquitectura y el entrenamiento, debe consultarse la model card original conservada como `ORIGINAL_README.md`.

## Capacidades

- Síntesis de voz (text-to-speech): el nombre del modelo y la presencia de un VAE de audio indican generación de audio a partir de texto.
- Tokenizador específico (`tokenization_voxcpm2.py`) adaptado al pipeline del modelo.
- Capacidades multilingües: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio de entrada: no disponible.

## Casos de uso

- Síntesis de voz para asistentes conversacionales: el modelo puede generar audio a partir de texto en aplicaciones de atención al cliente o asistentes de voz, siempre que se validen previamente la calidad y la latencia en el repositorio original.
- Lectura de contenido para accesibilidad: conversión de artículos, documentos o notificaciones a voz para usuarios con discapacidad visual, aprovechando la licencia Apache 2.0 para integración en productos.
- Generación de audiolibros y pódcasts: producción de narraciones sintéticas a partir de texto largo, sujeta a la verificación de la calidad prosódica del modelo original.
- Doblaje y localización de vídeo: generación de pistas de voz para contenido audiovisual, condicionada a la disponibilidad de idiomas, que no se especifica en esta ficha.
- Integración en pipelines de CI/CD para pruebas de audio: uso del espejo para descargar el modelo de forma reproducible en entornos automatizados, gracias a los checksums `SHA256SUMS`.
- Prototipado de interfaces de voz: experimentación con TTS en aplicaciones web o móviles usando los pesos safetensors en frameworks de inferencia compatibles.
- Investigación en síntesis de voz: reproducción de experimentos sobre el modelo original desde una fuente espejo estable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,29 mil millones de parámetros, en FP16 se requieren aproximadamente 4,6 GB solo para los pesos, más el VAE de audio y los buffers de activación; en FP32, unos 9,2 GB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, una GPU con 8-16 GB de VRAM sería suficiente para FP16, pero no se confirma.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más en FP16, aunque no se dispone de confirmación oficial.
- Opciones de despliegue: no disponible; el repositorio incluye código de tokenización propio, lo que sugiere un pipeline de inferencia específico no documentado en esta ficha.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| reverie-studio/VoxCPM2 (espejo) | ~2,29 mil millones | no disponible | Apache 2.0 | Hugging Face (espejo) |
| openbmb/VoxCPM2 (original) | ~2,29 mil millones | no disponible | Apache 2.0 | Hugging Face (original) |
| Alternativas TTS de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas de la misma categoría en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Este repositorio es un espejo no oficial: no está afiliado ni respaldado por OpenBMB, y cualquier incidencia debe contrastarse con el repositorio original.
- No se dispone de información sobre sesgos, riesgo de alucinación o limitaciones de idioma; deben consultarse en la model card original (`ORIGINAL_README.md`).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del repositorio original y los archivos de licencia incluidos.
- El pipeline de Hugging Face no está definido en esta ficha, lo que puede complicar la integración automática con librerías como `transformers`.
- El tamaño del repositorio (5,0 GB) incluye el checkpoint safetensors y el VAE de audio; la descarga y el almacenamiento deben planificarse en consecuencia.
- No se han publicado datos de benchmarks ni de rendimiento en la información disponible, por lo que no es posible avalar su calidad frente a alternativas.

## Enlaces

- Repositorio espejo: https://huggingface.co/reverie-studio/VoxCPM2
- Repositorio original: https://huggingface.co/openbmb/VoxCPM2
- Model card original: incluida como `ORIGINAL_README.md` en el repositorio espejo
- Sumas de verificación: `SHA256SUMS` en el repositorio espejo
