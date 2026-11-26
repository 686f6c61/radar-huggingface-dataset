# loom-draft/bartowski-thesby_Qwen2.5-VL-7B-NSFW-Caption-V3-loom

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF `thesby_Qwen2.5-VL-7B-NSFW-Caption-V3-Q4_K_M.gguf`, generado por `loom-next` sin intervención de un LLM en el bucle. El paquete lo publica el usuario `loom-draft` y está pensado específicamente para dos aceleradores AMD: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo subyacente es un fine-tune de Qwen2.5-VL-7B orientado a la generación de descripciones (captioning) de imágenes, incluyendo contenido NSFW, y cuantizado a Q4_K_M por bartowski.

La relevancia de este paquete es de infraestructura más que de modelado: demuestra cómo ejecutar un modelo visión-lenguaje de 7B con cuantización Q4_K_M sobre el stack ROCm mediante `loom-serve`, exponiendo una API compatible con OpenAI (`/v1/chat/completions`) y aceptando entradas de imagen en el formato `image_url`. El paquete declara 128.000 tokens de contexto por petición, 4 peticiones concurrentes y un máximo de 4.096 tokens de salida, con un proyector multimodal separado (`mmproj-thesby_Qwen2.5-VL-7B-NSFW-Caption-V3-bf16.gguf`).

No se han publicado resultados de rendimiento ni de corrección para este paquete concreto: todas las puertas de validación (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPU. La licencia declarada es MIT, aunque el modelo hereda las restricciones del fine-tune original y está marcado como `not-for-all-audiences`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer multimodal (Qwen2.5-VL) con proyector de visión; paquete de despliegue Loom sobre GGUF |
| Parametros totales | 7B (según el nombre del checkpoint base Qwen2.5-VL-7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); proyector en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT (según metadatos del repositorio) |
| Formato de pesos | GGUF (`thesby_Qwen2.5-VL-7B-NSFW-Caption-V3-Q4_K_M.gguf`) + paquete Loom (`model.json`, programas `.loom`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | compatible con OpenAI (`/v1/chat/completions`) |
| Aceleradores objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune de Qwen2.5-VL-7B, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje y un proyector que alinea ambos espacios. En este repositorio, el proyector se distribuye por separado en bf16 (`mmproj-...-bf16.gguf`), mientras que los pesos del decodificador van cuantizados a Q4_K_M. El paquete Loom no modifica el checkpoint: genera kernels y programas de ejecución para ROCm a partir del GGUF original de bartowski, según indica la model card ("unmodified GGUF checkpoint").

No hay información sobre el dataset de entrenamiento del fine-tune `thesby_Qwen2.5-VL-7B-NSFW-Caption-V3`, el número de tokens utilizados, la composición de los datos ni si hubo etapas de RLHF o DPO. La model card del paquete Loom tampoco documenta innovaciones de decodificación: la tabla de características marca tool calling, reasoning/thinking, reasoning effort y decodificación especulativa como "not applicable", aunque incluye una puerta de validación `spec` para decodificación especulativa que figura sin medir.

## Capacidades

- Generación de texto e imagen-a-texto: pipeline `image-text-to-text` con entrada de imágenes en formato OpenAI `image_url`.
- Captioning de imágenes: el fine-tune está especializado en describir imágenes, incluyendo contenido NSFW según el nombre del checkpoint.
- Conversación multi-turno a través de la API `/v1/chat/completions` con formato compatible con OpenAI.
- Contexto largo: hasta 128.000 tokens por petición, útil para documentos extensos o conversaciones con muchas imágenes.
- Concurrencia: hasta 4 peticiones simultáneas según la configuración del preset.
- Tool calling: no aplicable según la tabla de características del paquete.
- Razonamiento explícito / thinking mode: no aplicable.
- Decodificación especulativa: no aplicable en este paquete.
- Audio: estado "not determined" (no determinado).
- Capacidades multilingües: no disponibles en los metadatos.

## Casos de uso

- Catalogación y etiquetado de imágenes a gran escala: el modelo puede generar descripciones textuales de cada imagen recibida vía `image_url`, lo que permite construir metadatos de búsqueda o índices semánticos sobre bibliotecas de imágenes.
- Moderación y clasificación de contenido para adultos: al estar entrenado para captioning NSFW, puede emplearse como generador de descripciones detalladas que alimenten un clasificador o un sistema de revisión posterior.
- Descripción automática de imágenes para accesibilidad: generación de texto alternativo en aplicaciones que necesitan descripciones largas y contextuales, aprovechando la ventana de 128.000 tokens para procesar lotes de imágenes en una misma sesión.
- Análisis de documentos con imágenes: extracción de descripciones de figuras, capturas o diagramas dentro de flujos de procesamiento de documentos, combinando texto e imagen en la misma petición.
- Prototipado en hardware AMD de escritorio: validación de pipelines de visión-lenguaje sobre Strix Halo o Radeon AI PRO R9700 sin depender de CUDA, usando `loom-fetch` y `loom-serve` con la API compatible con OpenAI.
- Investigación sobre cuantización: comparación del comportamiento del mismo GGUF Q4_K_M ejecutado con `loom-serve` frente a llama.cpp, mediante las puertas `golden` y `compare` previstas en el paquete (actualmente sin mediciones publicadas).
- Generación de descripciones para datasets de entrenamiento: creación de pares imagen-texto que alimenten posteriores fine-tunes de modelos de captioning o de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de rendimiento frente a llama.cpp para este paquete "are not yet re-measured" tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201), y que todas las puertas de corrección figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint es Q4_K_M de un modelo de 7B, lo que sitúa los pesos en torno a 4-5 GB; el proyector de visión en bf16 añade varios cientos de MB. No se dispone de una cifra oficial de VRAM total del paquete.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs consumer NVIDIA ni para otras GPUs AMD distintas de las dos indicadas.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` para servirlo. Parámetros recomendados en la model card: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Alternativas de despliegue: el GGUF original de bartowski puede ejecutarse con llama.cpp u otros runners compatibles con GGUF, aunque el paquete Loom está diseñado para `loom-serve`.
- Latencia y throughput: no disponibles; la model card no publica mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este paquete (thesby Qwen2.5-VL-7B NSFW Caption V3, Q4_K_M, Loom) | 7B | 128.000 tokens | MIT | Hugging Face (`loom-draft`) | Paquete de despliegue para AMD Strix Halo y R9700; sin benchmarks publicados |
| bartowski/thesby_Qwen2.5-VL-7B-NSFW-Caption-V3-GGUF | 7B | no disponible en la informacion | no disponible en la informacion | Hugging Face | Checkpoint GGUF original del que deriva este paquete |
| Qwen2.5-VL-7B (modelo base de la familia) | 7B | 128.000 tokens (según la familia Qwen2.5-VL) | no disponible en la informacion | Hugging Face | Modelo generalista de visión-lenguaje; el fine-tune lo especializa en captioning NSFW |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Contenido NSFW: el checkpoint está especializado en descripciones de contenido para adultos y el repositorio está marcado como `not-for-all-adult-audiences`; no es adecuado para aplicaciones dirigidas a menores ni para entornos sin moderación.
- Sin validación publicada: todas las puertas de corrección y rendimiento del paquete figuran como "not yet re-measured", por lo que no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- Riesgo de alucinación: inherente a los modelos de lenguaje de 7B, especialmente en descripciones detalladas de imágenes; no se documentan evaluaciones de fidelidad.
- Idiomas: no se declaran idiomas soportados en los metadatos; el comportamiento multilingüe del fine-tune no está documentado.
- Licencia: el repositorio declara MIT, pero el modelo base y el fine-tune pueden tener condiciones adicionales no reflejadas en los metadatos; conviene verificar la licencia del checkpoint original antes de un uso comercial.
- Hardware restringido: el paquete está generado para gfx1151 y gfx1201; no se documenta compatibilidad con otras GPUs AMD ni con NVIDIA.
- Concurrencia limitada: el preset admite 4 peticiones simultáneas y 4.096 tokens de salida como máximo, lo que puede ser insuficiente para cargas de producción intensivas.
- Tool calling y razonamiento explícito no disponibles, lo que limita su uso en pipelines de agentes.
- Los resultados de búsqueda web sobre "Loom" corresponden a productos no relacionados (grabador de pantalla, marca de ropa, Wikipedia); no aportan información sobre este paquete.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/bartowski-thesby_Qwen2.5-VL-7B-NSFW-Caption-V3-loom
- Checkpoint GGUF base: https://huggingface.co/bartowski/thesby_Qwen2.5-VL-7B-NSFW-Caption-V3-GGUF
- Repositorio del stack Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
