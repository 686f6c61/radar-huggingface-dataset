# florianvoss/Gemma-4-E2B-it-GPTQ-a16w4

## Resumen

Gemma-4-E2B-it-GPTQ-a16w4 es un paquete de tiempo de ejecución compilado a partir de la familia Gemma 4, en su variante E2B instruida (image-text-to-text), publicado por el usuario florianvoss dentro de la colección de validación Neat 0.6.0. No se trata de un checkpoint estándar cargable con Transformers, sino de un paquete de despliegue desempaquetado orientado al acelerador SiMa Modalix, con los pesos ya cuantizados y los grafos recompilados. El paquete deriva de simaai/Gemma-4-E2B-it-GPTQ-Safetensors, que a su vez procede de google/gemma-4-E2B-it.

El modelo resuelve el problema de desplegar un modelo de visión-lenguaje Gemma 4 en hardware Modalix mediante la pila LLiMa, con cuantización GPTQ INT4 para las componentes de lenguaje y INT8 para las de visión. El contexto de compilación está fijado en 4096 tokens, con una ventana de atención deslizante de 512 tokens y un prefill agrupado de 128. Incluye la corrección del grafo de caché deslizante agrupada introducida en LLiMa PR #295.

Su relevancia es acotada: se publica como artefacto de validación (0 descargas y 0 likes en el momento de redactar esta ficha) y la propia model card advierte de que todavía no se han ejecutado pruebas de generación de texto e imagen en Modalix ni comparaciones antes/después con prompts largos. El tamaño del repositorio es de 5,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Gemma 4 E2B instruida, multimodal imagen-texto; compilada a ejecutables MLA sobre la pila LLiMa/Neat |
| Parametros totales | no disponible (la denominación E2B sugiere ~2B efectivos, no confirmado en la ficha) |
| Parametros activos | no disponible (no se confirma arquitectura MoE) |
| Longitud de contexto | 4096 tokens (ajuste de compilación) |
| Tipos de cuantizacion | Lenguaje: GPTQ simétrico INT4, group size 256, static act-order. Visión: RTN simétrico INT8 por canal de salida. Activaciones BF16; embeddings y caché KV INT8 |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | Paquete de runtime desempaquetado (devkit/ + 202 ejecutables MLA en elf_files/ + compilation.json); no cargable como safetensors en Transformers |

## Arquitectura y entrenamiento

El paquete parte de un modelo Gemma 4 E2B instruido con capacidad multimodal (pipeline image-text-to-text) y lo transforma en un binario de despliegue específico para SiMa Modalix. La compilación se realizó con el Model SDK 3.0.0 mediante la API nativa ModelGraph, reconstruyendo los 202 componentes del modelo. Se aplicó MLP splitting forzado en los 34 componentes post de lenguaje N128, dejando las etapas N1 sin cambios, y se habilitó el filter sharing para los componentes de lenguaje, deshabilitándolo para visión.

La atención emplea una ventana deslizante de 512 tokens: para el prefill n128 se usan las posiciones lógicas de KV 511 y 639 con una máscara estática que asigna a cada fila de consulta su ventana completa. Esta lógica proviene del grafo corregido de caché deslizante agrupada de LLiMa PR #295. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; el paquete es una derivación por cuantización y compilación, no un modelo entrenado de nuevo desde cero.

## Capacidades

- Generación de texto y de descripciones a partir de imágenes (pipeline image-text-to-text), heredadas del modelo Gemma 4 E2B-it de origen.
- Procesamiento de imágenes a resolución fija de 480 × 480 píxeles según la configuración de compilación.
- Instrucción conversacional (variante it), aunque el paquete no documenta plantillas de prompt específicas.
- Prefill agrupado (group size 128) y ventana de atención deslizante de 512 tokens para gestionar secuencias largas dentro del límite de 4096 tokens.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Despliegue de visión-lenguaje en borde con acelerador Modalix: el paquete está compilado específicamente para el hardware SiMa Modalix, por lo que su caso natural es ejecutar inferencia imagen-texto en ese acelerador mediante el runtime LLiMa.
- Evaluación de la pila Neat 0.6.0 y LLiMa: sirve como artefacto de referencia para validar la corrección del grafo de caché deslizante agrupada (PR #295) en flujos de prefill n128.
- Clasificación y descripción de imágenes a 480 × 480: útil para tareas de etiquetado o captioning donde la resolución reducida sea suficiente y se priorice el consumo ajustado de recursos.
- Integración en pipelines de validación de cuantización: permite comparar el comportamiento del GPTQ INT4 con group size 256 y static act-order frente a otras variantes del mismo modelo base.
- Pruebas de regresión de compilación: dado que el paquete incluye checksums de los 202 ELF y un compilation.json, se puede usar para verificar que el filter sharing y el MLP splitting se preservan entre versiones del SDK.
- Prototipado de asistentes multimodales con contexto medio (hasta 4096 tokens) en entornos embebidos, siempre que se disponga del hardware Modalix y del runtime compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta la validación de compilación: finalización con código de salida 0, superación de las comprobaciones de simulador en los 34 reemplazos post N128, verificación de checksums de los ELF y despliegue correcto de los 202 ficheros ELF y activos de runtime. No se han ejecutado comparaciones de generación de texto o imagen en Modalix ni pruebas antes/después con prompts largos.

## Requisitos de hardware

- VRAM para GPU: no aplicable; el paquete está compilado para el acelerador SiMa Modalix y no para inferencia en GPU convencional. El campo `inference: false` de la model card refuerza que no está pensado para carga directa en Transformers.
- GPU recomendadas: no disponible; no se contempla ejecución en A100, H100 o RTX 4090 con este artefacto.
- Compatibilidad con GPU de consumo: no disponible; el despliegue depende de hardware Modalix, no de GPUs de consumo.
- Opciones de despliegue: runtime LLiMa con el parche de sliding-prefill correspondiente a PR #295. Ejemplo documentado: `hf download florianvoss/Gemma-4-E2B-it-GPTQ-a16w4 --local-dir Gemma-4-E2B-it-GPTQ-a16w4` seguido de `llima run ./Gemma-4-E2B-it-GPTQ-a16w4`.
- Espacio en disco: 5,7 GB para el repositorio completo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| florianvoss/Gemma-4-E2B-it-GPTQ-a16w4 | Paquete runtime compilado para Modalix (devkit + 202 ELF) | 4096 tokens | GPTQ INT4 (lenguaje) + RTN INT8 (vision) | gemma | HuggingFace, 0 descargas |
| simaai/Gemma-4-E2B-it-GPTQ-Safetensors | Safetensors GPTQ | no disponible | GPTQ | gemma | HuggingFace (modelo base) |
| google/gemma-4-E2B-it | Safetensors | no disponible | Sin cuantizar | gemma | HuggingFace (modelo original) |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El paquete no es un checkpoint cargable en Transformers; está pensado exclusivamente para el runtime LLiMa sobre SiMa Modalix.
- Requiere un runtime LLiMa que incluya el parche de sliding-prefill de PR #295; con una versión anterior el comportamiento del grafo de caché deslizante sería incorrecto.
- La ventana de atención está limitada a 512 tokens en la configuración de prefill y el contexto total a 4096 tokens.
- No se han ejecutado pruebas de generación de texto e imagen en Modalix ni comparaciones antes/después con prompts largos; el comportamiento real en producción está sin verificar.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingüe.
- Riesgo de sesgos y de alucinación: no disponible información específica sobre este paquete. Al derivar de un modelo Gemma, hereda las características y sesgos del modelo original, que no se detallan aquí.
- La licencia Gemma impone sus propios términos de uso; es responsabilidad del usuario revisarlos antes de cualquier uso comercial.
- Repositorio con 0 descargas y 0 likes, lo que reduce la evidencia comunitaria sobre su funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/florianvoss/Gemma-4-E2B-it-GPTQ-a16w4
- Modelo base (Safetensors GPTQ): https://huggingface.co/simaai/Gemma-4-E2B-it-GPTQ-Safetensors
- Modelo original de Google: https://huggingface.co/google/gemma-4-E2B-it
- LLiMa PR #295 (corrección del grafo de caché deslizante agrupada): https://github.com/sima-neat/llima/pull/295
