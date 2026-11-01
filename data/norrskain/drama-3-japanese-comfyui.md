# norrskain/Drama-3-Japanese-ComfyUI

## Resumen

Drama-3-Japanese-ComfyUI es una conversión de formato del modelo de síntesis de voz Aratako/Drama-3-Japanese, un ajuste fino en japonés del modelo Fish Audio Drama 3. El repositorio, publicado por el usuario norrskain, no entrena ningún modelo nuevo: empaqueta los pesos del checkpoint original en el formato de fichero único que carga la extensión ComfyUI-Drama3, de modo que el modelo pueda usarse directamente dentro de flujos de trabajo de ComfyUI sin depender de la librería nativa de Fish Audio.

La conversión aplica cuantización de bloques en FP8 a los expertos enrutados del modelo, mantiene el resto de pesos en BF16 y fusiona las proyecciones gate y up de la arquitectura Mixture-of-Experts. Además, recorta la cabeza del modelo (LM head) para conservar únicamente las filas que la generación muestrea: el token de fin de habla y los tokens semánticos. El resultado son dos ficheros: el modelo principal de 38,58 GB y el códec de audio de 1,57 GB, que es imprescindible para decodificar la salida.

La relevancia de esta ficha es práctica: el autor documenta una estrategia de offload que mantiene los expertos enrutados en RAM del sistema y cachea en VRAM solo los que se usan en cada momento, lo que permite ejecutar el modelo en GPUs desde 8 GB. Es una vía para probar un modelo TTS de gran tamaño con clonación de voz en japonés en hardware de consumo, aunque con limitaciones claras de licencia y de idioma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) derivada de Fish Audio Drama 3; no se detalla la topología interna en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados en FP8 por bloques; resto de pesos en BF16; códec en FP32 |
| Idiomas soportados | Japonés (ja) |
| Licencia | Fish Audio Community License, Version 1.0 (license_name: fish-audio-community-license) |
| Formato de pesos | safetensors (fichero único para ComfyUI) + códec safetensors separado |

## Arquitectura y entrenamiento

El modelo es un ajuste fino en japonés de Fish Audio Drama 3, un sistema de text-to-speech con arquitectura Mixture-of-Experts en la que los expertos enrutados concentran la mayor parte del peso. La conversión de este repositorio no modifica el entrenamiento: fusiona las proyecciones gate y up, mantiene los bytes y escalas originales del checkpoint para los expertos en FP8, y recorta la LM head a las filas relevantes para la generación (fin de habla y tokens semánticos). El códec se convierte desde el mismo `codec.pth` que el modelo original y es byte a byte idéntico al de PedroMarinhoDev/Drama-3-ComfyUI.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el ajuste fino de Aratako empleó RLHF o DPO. La model card tampoco detalla innovaciones de decodificación más allá del esquema de offload de expertos a RAM con caché en VRAM, que es una optimización de despliegue, no de arquitectura. El ajuste fino está diseñado para habla de un único hablante; el diálogo multi-hablante queda fuera de su configuración de entrenamiento.

## Capacidades

- Síntesis de voz (text-to-speech) en japonés a partir de texto plano.
- Diseño de voz mediante caption: una descripción en japonés entre corchetes al inicio del texto define el timbre y el estilo (por ejemplo, `[落ち着いた女性の声。優しく話す。]`).
- Etiquetas en línea para control expresivo durante la locución, como `[笑いながら]`, `[驚いて]` o `[怒りを込めて]`.
- Clonación de voz con hasta tres clips del mismo hablante, cada uno acompañado de su transcripción exacta.
- Generación de audio a 21,5 fotogramas por segundo de audio, con 46 ms por fotograma como umbral de tiempo real.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni procesamiento de otros idiomas distintos del japonés.

## Casos de uso

- Doblaje y localización de contenido al japonés: el modelo permite generar locuciones con un estilo definido por caption, útil para vídeos, audiolibros o material formativo donde se necesita una voz consistente sin grabar a un actor.
- Prototipado de asistentes de voz en japonés: con clonación de hasta tres clips se puede fijar una voz de marca concreta y probar diálogos de un solo hablante antes de invertir en una solución comercial.
- Producción de audio dentro de ComfyUI: al integrarse como nodo en flujos de trabajo, encaja en pipelines que ya generan imagen o vídeo y necesitan una pista de voz sincronizada.
- Investigación en TTS y clonación de voz: el repositorio facilita comparar el comportamiento de un MoE grande cuantizado a FP8 frente al checkpoint original, con la ventaja de ejecutarse en GPUs de 8 GB mediante offload de expertos.
- Generación de contenido expresivo para videojuegos o narrativa interactiva: las etiquetas en línea permiten introducir risas, sorpresa o enfado sin editar el audio a posteriori.
- Evaluación de hardware y despliegue: sirve para medir latencia y throughput de un modelo TTS con expertos en RAM en tarjetas modestas, con datos de referencia de 12-14 ms por fotograma con expertos en VRAM y 16-19 ms con caché de 12 GB en RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente una prueba de generación cualitativa realizada en Google Colab con una NVIDIA RTX PRO 6000 Blackwell Server Edition de 96 GB, ComfyUI v0.42.5, cinco prompts en japonés, semilla 1234, temperatura 1.0, top_p 0.9 y top_k 0:

| Fichero | Expertos | ms por fotograma | Tomas completadas |
|---|---|---|---|
| FP8 | en VRAM | 12–14 | 5 de 5 |
| FP8 | en RAM, caché de 12 GB | 16–19 | 5 de 5 |

El autor advierte que estos tiempos excluyen la primera toma tras la carga, más lenta por la compilación de kernels y, con expertos en RAM, por el llenado de la caché, y que GPUs más pequeñas y enlaces PCIe más lentos arrojan cifras peores.

## Requisitos de hardware

- VRAM: el modelo principal ocupa 38,58 GB en disco y el códec 1,57 GB; con los expertos enrutados en RAM del sistema, el autor indica que funciona en GPUs desde 8 GB, aunque no especifica la VRAM exacta necesaria para el resto de pesos y la caché.
- RAM del sistema: aproximadamente 48 GB con los expertos en RAM, según la tabla de ficheros de la model card.
- GPU recomendadas: el autor valida el funcionamiento en una NVIDIA RTX PRO 6000 Blackwell Server Edition de 96 GB; no se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: sí cabe en GPUs de consumo desde 8 GB gracias al offload de expertos, con la penalización de latencia que implica el trasiego por PCIe.
- Despliegue: exclusivamente mediante ComfyUI con la extensión ComfyUI-Drama3; los ficheros se colocan en `ComfyUI/models/diffusion_models` (modelo) y `ComfyUI/models/vae` (códec). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 12-14 ms por fotograma con expertos en VRAM y 16-19 ms con caché de 12 GB en RAM, sobre la GPU de referencia; el umbral de tiempo real es 46 ms por fotograma.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Drama-3-Japanese-ComfyUI (este) | TTS MoE, ajuste fino japonés, FP8 | Japonés | Fish Audio Community License 1.0 | safetensors para ComfyUI | HuggingFace, 0 descargas |
| Aratako/Drama-3-Japanese | TTS MoE, ajuste fino japonés, checkpoint original | Japonés | Fish Audio Community License 1.0 | no disponible en la información | HuggingFace |
| fishaudio/drama-3 | TTS MoE base | no disponible | Fish Audio Community License 1.0 | no disponible en la información | HuggingFace |
| PedroMarinhoDev/Drama-3-ComfyUI | Conversión a ComfyUI del Drama 3 base | no disponible | Fish Audio Community License 1.0 | safetensors para ComfyUI | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí.

## Limitaciones y advertencias

- El modelo solo cubre japonés; no se documenta soporte de otros idiomas.
- El ajuste fino está pensado para habla de un único hablante; el diálogo multi-hablante queda fuera de su configuración de entrenamiento.
- Riesgo de alucinación y de artefactos en la voz no cuantificado: la model card no aporta métricas de calidad objetivas, solo una prueba cualitativa de cinco prompts.
- La licencia Fish Audio Community License 1.0 permite uso gratuito en investigación y uso no comercial, y uso comercial solo por debajo de 500 000 USD de ingresos anuales; un servicio de text-to-speech alojado requiere una licencia separada de Fish Audio.
- Prohibido imitar la voz de una persona identificable sin su consentimiento.
- Prohibido usar las salidas para entrenar otros modelos de generación de voz.
- El repositorio no está afiliado, patrocinado ni respaldado por Fish Audio, Aratako ni PedroMarinhoDev.
- El despliegue depende exclusivamente de ComfyUI-Drama3; no hay soporte documentado para otros runners.
- El rendimiento medido corresponde a una GPU de 96 GB; en GPUs de 8 GB con expertos en RAM la latencia será considerablemente mayor y no está cuantificada.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria del funcionamiento más allá de la prueba del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/norrskain/Drama-3-Japanese-ComfyUI
- Modelo base (ajuste fino japonés): https://huggingface.co/Aratako/Drama-3-Japanese
- Lista de etiquetas del ajuste fino: https://huggingface.co/Aratako/Drama-3-Japanese/blob/main/TAG_LIST.md
- Modelo original Drama 3: https://huggingface.co/fishaudio/drama-3
- Extensión ComfyUI-Drama3: https://github.com/PedroMarinhoDev/ComfyUI-Drama3
- Conversión a ComfyUI del Drama 3 base: https://huggingface.co/PedroMarinhoDev/Drama-3-ComfyUI
- Fish Audio: https://fish.audio
