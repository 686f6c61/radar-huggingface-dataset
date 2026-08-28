# EigenLabs/Qwen3-VL-30B-A3B-Instruct-MLX-4bit

## Resumen

Este repositorio contiene una conversión a 4-bit en formato MLX del modelo multimodal Qwen3-VL-30B-A3B-Instruct, desarrollado originalmente por el equipo Qwen. La conversión fue realizada inicialmente por el equipo de LM Studio y posteriormente validada y publicada por Eigen Labs, que además reparó el índice de safetensors de la instantánea original. El resultado es un artefacto optimizado para ejecución en Apple Silicon, con arquitectura `qwen3_vl_moe` (mezcla de expertos) y cuantización afín de 4 bits con tamaño de grupo 64.

El modelo base combina un total de 30 000 millones de parámetros, de los cuales aproximadamente 3 000 millones se activan por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. Está diseñado para tareas de visión y lenguaje: comprensión de imágenes, generación de texto, razonamiento visual y uso de herramientas. Esta conversión MLX permite ejecutar el modelo en equipos Mac con memoria unificada, siendo una opción práctica para desarrolladores que trabajan en entornos Apple sin necesidad de GPUs dedicadas.

La relevancia de esta ficha radica en que ofrece una alternativa cuantizada y lista para usar de un modelo de última generación, con validación específica para el runtime Darkbloom y compatibilidad con las herramientas estándar de MLX. Es especialmente útil para quienes necesitan desplegar un asistente multimodal en hardware de Apple con requisitos de memoria moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_vl_moe` (mezcla de expertos multimodal) |
| Parametros totales | 30 000 millones (modelo original); ~3 000 millones activos por token |
| Parametros activos | ~3 000 millones (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX afín 4-bit, grupo de tamaño 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX 4-bit), 4 shards |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-30B-A3B-Instruct emplea una arquitectura de mezcla de expertos (MoE) multimodal que procesa texto, imágenes y vídeo. La conversión aquí descrita no modifica la arquitectura original, sino que re-cuantiza los pesos a 4 bits mediante el formato MLX afín con grupo de tamaño 64, reduciendo el tamaño de los tensores de 62 141 508 064 bytes (BF16) a 18 251 885 024 bytes. El repositorio incluye 1 702 claves de tensor distribuidas en cuatro shards, junto con 386 matrices de escala y 386 de sesgo añadidas por la cuantización.

No se dispone de información detallada sobre el entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación proporcionada. La model card de esta conversión solo indica que hereda las capacidades y limitaciones del modelo Qwen original. La conversión fue validada mediante pruebas de generación de texto, llamadas a funciones, continuación de respuestas de herramientas e inferencia de imágenes, confirmando que el template de chat es idéntico al oficial y que el tokenizador mantiene las mismas 151 643 entradas de vocabulario, 151 387 merges BPE y 26 tokens añadidos.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa entradas de texto e imágenes, respondiendo preguntas sobre el contenido visual.
- Function calling y tool calling: soporta la generación de llamadas a funciones y la continuación de respuestas de herramientas, validado en el runtime Swift de Darkbloom.
- Razonamiento multi-step: el modelo base está diseñado para tareas de razonamiento complejo, incluyendo análisis visual y espacial.
- Comprensión de vídeo: el template de chat incluye partes de vídeo, aunque el soporte de vídeo está deshabilitado en el runtime Darkbloom de esta conversión.
- Capacidades multilingües: no se especifican idiomas concretos en la documentación, pero el modelo base de Qwen soporta múltiples lenguas.
- Integración con MLX: compatible con `mlx-vlm` y `mlx-swift-lm` para cargar y ejecutar el modelo en Apple Silicon.

## Casos de uso

- Asistente de accesibilidad en macOS: un desarrollador puede integrar el modelo en una aplicación que describa imágenes en tiempo real para personas con discapacidad visual, aprovechando la cuantización 4-bit para ejecutarse en un Mac con 32 GB de memoria unificada.
- Automatización de atención al cliente con capturas de pantalla: el modelo puede analizar imágenes de errores o interfaces y generar respuestas de soporte, gracias a su capacidad de razonamiento visual y function calling para consultar bases de conocimiento.
- Anotación automática de imágenes en pipelines de datos: se puede usar para etiquetar imágenes en lotes, generando descripciones o metadatos estructurados, con la ventaja de ejecutarse localmente en hardware Apple sin costes de API.
- Generación de código asistida por contexto visual: un IDE puede enviar capturas de pantalla de código o diagramas al modelo para que sugiera implementaciones, usando tool calling para invocar herramientas de análisis estático.
- Chatbot multimodal para documentación técnica: el modelo responde preguntas sobre manuales o esquemas visuales, manteniendo conversaciones multi-turno con contexto de imagen.
- Prototipado rápido de aplicaciones de visión por computador: investigadores pueden validar hipótesis sobre comprensión de imágenes sin necesidad de GPUs dedicadas, usando la versión MLX en un Mac Studio o MacBook Pro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K u otras evaluaciones para esta conversión específica. Se recomienda consultar la documentación del modelo base Qwen3-VL-30B-A3B-Instruct para obtener datos de rendimiento en tareas estándar.

## Requisitos de hardware

- Memoria mínima: 32 GB de memoria unificada en Apple Silicon para un slot de modelo único, según la validación de Darkbloom. Memoria adicional proporciona margen para caché KV y batching.
- GPU recomendadas: cualquier chip Apple Silicon con al menos 32 GB de RAM unificada (por ejemplo, M1 Pro/Max, M2 Pro/Max, M3 Max, M4 Max). No requiere GPU NVIDIA o AMD.
- Tamaño del modelo: 18,3 GB en disco (tensores cuantizados).
- Opciones de despliegue: Darkbloom (servidor local), `mlx-vlm`, `mlx-swift-lm`.
- Latencia y throughput: no se proporcionan datos específicos. La ejecución en Apple Silicon depende del número de núcleos de GPU y de la memoria disponible; el modo 4-bit reduce el uso de ancho de banda, mejorando la velocidad respecto a BF16.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Cuantización | Contexto | Licencia |
|---|---|---|---|---|---|
| Qwen3-VL-30B-A3B-Instruct (original) | MoE multimodal | 30B totales, ~3B activos | BF16 | 256K (según documentación oficial) | Apache-2.0 |
| EigenLabs/Qwen3-VL-30B-A3B-Instruct-MLX-4bit | MoE multimodal | 30B totales, ~3B activos | MLX 4-bit | no disponible | Apache-2.0 |
| mlx-community/Qwen3-VL-30B-A3B-Instruct-4bit | MoE multimodal | 30B totales, ~3B activos | MLX 4-bit | no disponible | Apache-2.0 |

La diferencia principal entre esta conversión y la de `mlx-community` es que Eigen Labs reparó el índice de safetensors (que en la versión original de LM Studio referenciaba 13 shards ausentes) y añadió validación específica para el runtime Darkbloom. Los pesos cuantizados son idénticos, ya que no se re-cuantizaron.

## Limitaciones y advertencias

- La cuantización 4-bit puede introducir pérdida de precisión respecto al modelo BF16 original, especialmente en tareas que requieren razonamiento numérico o detalles finos.
- El soporte de vídeo está deshabilitado en el runtime Darkbloom de esta conversión; solo se garantiza el funcionamiento con imágenes y texto.
- Las rutas de paged KV, prefijo compartido, prefill empaquetado, decodificación compilada y MTP están intencionalmente desactivadas hasta que se validen de forma independiente.
- El modelo hereda las limitaciones y sesgos del modelo Qwen original; las respuestas pueden ser inexactas o contener alucinaciones. Se recomienda validar las salidas antes de usarlas en decisiones con consecuencias.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución y las restricciones del modelo base si las hubiera.
- No se dispone de información sobre los idiomas soportados ni sobre la longitud de contexto efectiva en esta conversión; se recomienda probar con casos reales antes de desplegar en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EigenLabs/Qwen3-VL-30B-A3B-Instruct-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Conversión original de LM Studio: https://huggingface.co/lmstudio-community/Qwen3-VL-30B-A3B-Instruct-MLX-4bit
- Repositorio GitHub de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Página en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-VL-30B-A3B-Instruct
