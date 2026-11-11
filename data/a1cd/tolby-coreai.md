# a1cd/tolby-coreai

## Resumen

Tolby Core AI es una conversión del modelo instruction-tuned google/gemma-4-E4B-it de Google al formato Core AI de Apple, publicada por el usuario a1cd en Hugging Face. No se trata de un modelo nuevo ni de un fine-tuning: los pesos originales se han exportado con la herramienta `coreai-models` de Apple a un formato optimizado para ejecución local en Macs con macOS 27 y el framework Core AI, con cuantización de 4 bits en formato palettized, formas estáticas y un cabezal de decodificación especulativa. El repositorio ocupa 5,7 GB e incluye el modelo principal, el cabezal draft, el tokenizador y metadatos.

La relevancia de esta publicación es práctica: permite ejecutar un modelo Gemma 4 de la familia E4B (presumiblemente una variante eficiente de 4 mil millones de parámetros, aunque el dato exacto de parámetros no se especifica en la información disponible) de forma local en hardware Apple, sin depender de la nube ni de GPUs dedicadas. El autor indica que Tolby (https://tolby.app) descarga estos ficheros en Macs que ejecutan el modelo localmente, y que verifica cada archivo contra un SHA-256 fijado antes de usarlo.

La licencia es Apache 2.0, heredada del modelo base de Google, lo que facilita su uso comercial. Sin embargo, la información publicada es muy escasa: no hay datos de benchmarks, idiomas soportados, pipeline ni resultados de evaluación, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-E4B-it); no se detalla la variante interna |
| Parametros totales | no disponible (el nombre E4B sugiere una variante eficiente de ~4B, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits palettized (pesos); formas estaticas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core AI: `.aimodel` (modelo principal y draft head), `.safetensors` (embeddings por capa), `.bin` (draft scan) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un modelo instruction-tuned de Google publicado bajo Apache 2.0. La información disponible no detalla la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención, composición del dataset de entrenamiento ni si hubo RLHF o DPO). El autor indica explícitamente que no se realizó ningún fine-tuning ni reentrenamiento: la publicación es una conversión de formato.

La conversión se realizó con la herramienta `coreai-models` de Apple al formato Core AI, que incluye pesos cuantizados a 4 bits en esquema palettized, formas estáticas (sin dimensiones dinámicas) y un cabezal de decodificación especulativa (`draft_step.aimodel` y `draft_scan.bin`) para acelerar la generación. El bundle se organiza en el directorio `gemma4-e4b-it-4bit-static-20261106/`, con el modelo principal `gemma_4_e4b_it_4bit_palettized_static.aimodel`, sus embeddings por capa en `gemma_4_e4b_it_4bit_palettized_static_ple.safetensors`, el tokenizador y `metadata.json`. Tolby verifica la integridad de cada archivo mediante SHA-256 fijado.

## Capacidades

- Generación de texto y conversación instruction-tuned, heredadas del modelo base Gemma 4 E4B IT.
- Ejecución local en Mac con el framework Core AI de Apple (macOS 27), sin conexión a servicios en la nube.
- Decodificación especulativa mediante cabezal draft, orientada a reducir la latencia de generación.
- Inferencia con pesos de 4 bits y formas estáticas, optimizada para el Neural Engine de Apple.
- Capacidades multilingües, de razonamiento, código o tool calling: no disponibles en la información publicada (dependen del modelo base, pero no se documentan aquí).
- No se documentan capacidades de visión, audio ni modo thinking.

## Casos de uso

- Asistentes locales en macOS: integrar el bundle en una aplicación de escritorio que ejecute el modelo en el Neural Engine del Mac, sin enviar datos a la nube y con verificación de integridad por SHA-256.
- Procesamiento de texto offline: resúmenes, reescritura y clasificación de documentos en entornos sin conectividad, aprovechando la inferencia local con pesos de 4 bits.
- Prototipado de aplicaciones Core AI: servir como referencia funcional para desarrolladores que quieran probar el pipeline de exportación `coreai-models` y la decodificación especulativa en hardware Apple.
- Privacidad por diseño: escenarios donde el texto del usuario no puede salir del dispositivo (sanidad, legal, datos personales), al ejecutarse el modelo íntegramente en local.
- Automatización de flujos de trabajo en el escritorio: generación de borradores de correo, notas o documentación dentro de una app Mac, con latencia baja gracias al cabezal draft.
- Distribución de modelos en aplicaciones de consumo: el formato estático y cuantizado facilita empaquetar el modelo en un instalador de app y validarlo contra hashes fijados antes de su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: Macs con macOS 27 y soporte del framework Core AI de Apple (Neural Engine).
- VRAM estimada: no disponible; el repositorio ocupa 5,7 GB, lo que da una cota superior aproximada del espacio en disco necesario para los pesos cuantizados a 4 bits.
- GPU recomendadas: no aplica en el sentido tradicional; el modelo está exportado para el Neural Engine de Apple, no para CUDA.
- Compatibilidad con GPU consumer (NVIDIA/AMD): no disponible; el formato `.aimodel` es específico de Core AI.
- Opciones de despliegue: Core AI (Apple) a través de la app Tolby; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| a1cd/tolby-coreai | no disponible (base E4B) | no disponible | Core AI (4 bits palettized) | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-4-E4B-it | no disponible | no disponible | safetensors (formato original) | Apache 2.0 | Hugging Face (modelo base) |
| Otros modelos locales para Apple | no disponible | no disponible | Core ML / Core AI | variable | no disponible |

La comparación con alternativas de la misma categoría (modelos pequeños ejecutables en dispositivo) no puede completarse con los datos proporcionados: no se dispone de parámetros, contexto ni rendimiento del modelo base ni de sus competidores directos.

## Limitaciones y advertencias

- La información publicada es mínima: no hay benchmarks, idiomas, contexto ni pipeline declarados, lo que impide evaluar su calidad frente al modelo base.
- El repositorio no registra descargas ni likes, y fue creado y actualizado el mismo día (11 de noviembre de 2026); no hay evidencia de uso o validación por terceros.
- El modelo está limitado al ecosistema Apple Core AI (macOS 27); no es portable a CUDA, ROCm ni a motores de inferencia convencionales.
- La cuantización a 4 bits palettized puede degradar la calidad respecto a los pesos originales en precisión completa; no se documenta la magnitud de esa pérdida.
- Las formas estáticas limitan la flexibilidad de secuencias de entrada; no se especifica la longitud máxima admitida.
- Riesgo de alucinación y sesgos: no documentados en esta publicación; deben evaluarse a partir del modelo base google/gemma-4-E4B-it.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base de Google y de la herramienta de exportación de Apple.
- La verificación por SHA-256 depende de que el consumidor (Tolby) mantenga los hashes fijados; un cambio en los ficheros invalidaría la comprobación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/a1cd/tolby-coreai
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Aplicación Tolby: https://tolby.app
- Herramienta de exportación de Apple (`coreai-models`): no disponible (no se proporciona URL)
- Paper, blog o demo adicionales: no disponibles
