# davidxifeng/LFM3-VL-2B-MLX-8bit-uzu

## Resumen

LFM3-VL-2B-MLX-8bit-uzu es un reempaquetado del modelo multimodal LiquidAI/LFM3-VL-2B-MLX-8bit, publicado por el usuario davidxifeng, para el motor de inferencia Uzu/Mirai sobre Apple Silicon. No se trata de un modelo entrenado desde cero, sino de una conversión de formato: se conservan las cuantizaciones MLX affine de 8 bits (grupo 64) del decodificador de texto y se reempaqueta la torre de visión en BF16 dentro de `vision.safetensors`, de forma que el motor Uzu pueda ejecutarlo sobre Metal.

El modelo resuelve un problema de portabilidad: permite ejecutar un modelo visión-lenguaje de ~1.830 millones de parámetros en hardware Apple Silicon mediante un servidor compatible con la API de OpenAI. El pipeline declarado es `image-text-to-text` y el repo ocupa 2,3 GB en total (unos 1,9 GB de pesos de texto cuantizados y unos 379 MB de torre de visión).

Es relevante para desarrolladores que quieran prototipar aplicaciones multimodales locales en Mac sin depender de la nube, aunque con las limitaciones propias de un modelo pequeño (2B) y de una conversión de terceros sin benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decodificador de texto + torre de visión con patchify/merge y proyector); detalles completos no disponibles |
| Parametros totales | 1.830.021.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 8-bit, grupo 64 (decodificador de texto); torre de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (`model.safetensors` para texto, `vision.safetensors` para visión) |

## Arquitectura y entrenamiento

El modelo base es LiquidAI/LFM3-VL-2B-MLX-8bit, un modelo visión-lenguaje de la familia LFM3 de Liquid AI. La conversión realizada por davidxifeng no reentrena ni modifica los pesos en términos de valores: mantiene los tensores MLX affine de 8 bits (grupo 64) del decodificador de texto, transformando únicamente la disposición de los datos (palabras de código U32→U8, transposición de planos de escala y sesgo en las lineales OutputInput, normas de BF16 a F32, y fusión de las proyecciones `qkvg_projection` `[Q|K|V|GATE]` y de los layouts MLP gate|up).

La torre de visión se empaqueta en BF16 sin cuantizar y se ejecuta mediante el pipeline Metal de visión de Uzu; el archivo `vision_config.json` contiene los parámetros de patchify/merge y del proyector. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo original, ya que la model card del reempaquetado no los detalla.

## Capacidades

- Generación de texto e inferencia multimodal imagen-texto (pipeline `image-text-to-text`).
- Procesamiento de imágenes mediante torre de visión con patch embedding, merge y proyector.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) con partes de imagen `image_url`.
- Soporte de streaming SSE en las respuestas.
- Ejecución sobre Metal en Apple Silicon mediante el motor Uzu/Mirai.
- Capacidades de tool calling, agentes, matemáticas o código: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Descripción de imágenes en local: el modelo puede recibir una imagen vía `image_url` y devolver una descripción textual, útil para prototipos de etiquetado o accesibilidad en Mac sin conexión a la nube.
- Asistentes multimodales de escritorio: al exponer una API compatible con OpenAI en el puerto 8000, se puede integrar en aplicaciones de escritorio que ya hablen el protocolo de chat completions con soporte de imágenes.
- Pruebas de pipelines VLM en Apple Silicon: sirve para validar integraciones de visión-lenguaje en entornos de desarrollo con GPU integrada antes de migrar a modelos mayores.
- Extracción de texto o contexto visual en flujos documentales: para tareas ligeras de interpretación de capturas o imágenes en herramientas internas, con la ventaja de ejecución local y sin coste de API.
- Chat multimodal con streaming: la compatibilidad con SSE permite construir interfaces de conversación que muestren la respuesta token a token mientras se procesa una imagen adjunta.
- Evaluación comparativa de motores de inferencia: útil para medir el rendimiento del motor Uzu frente a otras alternativas (llama.cpp, MLX nativo) con un modelo de 2B cuantizado a 8 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repo ocupa 2,3 GB; con overhead de ejecución se recomienda al menos 4-6 GB de memoria unificada.
- Hardware objetivo: Apple Silicon con soporte Metal (la model card indica ejecución sobre Metal vía Uzu).
- GPU dedicadas (A100, H100, RTX 4090): no aplicable, el paquete está orientado a Apple Silicon; no se documenta soporte para CUDA.
- Cabe en equipos consumer Apple Silicon con memoria unificada suficiente (el tamaño de pesos de ~2,3 GB lo permite en configuraciones de 8 GB o más, aunque el overhead del runtime no está cuantificado).
- Despliegue: servidor Uzu (`cli server --model ... --port 8000`) con API compatible con OpenAI; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-MLX-8bit-uzu | 1.830.021.888 | no disponible | safetensors (Uzu) | lfm1.0 | Reempaquetado para Uzu/Metal, 8-bit |
| LiquidAI/LFM3-VL-2B-MLX-8bit | no disponible | no disponible | safetensors (MLX) | lfm1.0 | Modelo base original |
| Otras alternativas VLM de ~2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Es un reempaquetado de terceros, no un modelo oficial de Liquid AI; la calidad y fidelidad de la conversión no están avaladas por el autor original.
- No se han publicado benchmarks ni evaluaciones de rendimiento para esta conversión.
- El modelo base es de 2B parámetros, por lo que su capacidad de razonamiento y conocimiento factual es limitada en comparación con modelos mayores.
- Riesgo de alucinación inherente a modelos de este tamaño; no se documentan mitigaciones específicas.
- Idiomas soportados no especificados; no se garantiza un rendimiento adecuado en castellano.
- Longitud de contexto no documentada, lo que dificulta planificar aplicaciones con conversaciones largas.
- Licencia lfm1.0: es necesario revisar el archivo LICENSE del repo para conocer las restricciones de uso comercial, que no se detallan en la información disponible.
- Dependencia del motor Uzu/Mirai y de Apple Silicon; no es portable a CUDA ni a otros runtimes sin reconversión.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/davidxifeng/LFM3-VL-2B-MLX-8bit-uzu
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B-MLX-8bit
- Motor Uzu: https://github.com/trymirai/uzu
