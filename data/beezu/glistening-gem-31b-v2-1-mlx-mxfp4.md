# beezu/Glistening-Gem-31B-v2.1-mlx-mxfp4

## Resumen

Este modelo es una conversión al formato MLX con cuantización MXFP4 (4 bits) del modelo original `sophosympatheia/Glistening-Gem-31B-v2.1`, un merge creativo basado en Google Gemma 4 de 31 mil millones de parámetros. El autor de la conversión, beezu, ha empaquetado el modelo en un repositorio de 16,5 GB, pensado para su ejecución eficiente en hardware de Apple (Apple Silicon) mediante la librería MLX. El modelo base es una mezcla de tres modelos derivados de Gemma 4 31B, orientados a la generación de texto creativo y conversacional, y se distribuye bajo licencia Apache 2.0.

La relevancia actual de este modelo reside en su capacidad de ofrecer un rendimiento creativo elevado con un tamaño relativamente compacto (31B) y su disponibilidad en formato cuantizado para entornos con memoria limitada. Al ser una conversión MLX, permite su despliegue en Macs y otros sistemas con aceleración por MLX, aunque también puede ser convertido a otros formatos como GGUF para su uso con llama.cpp. El modelo hereda las características del merge original, que prioriza la creatividad y la prosa, pero también presenta algunas limitaciones conocidas, como la aparición ocasional de artefactos en el texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basada en Gemma 4) |
| Parametros totales | 5.756.834.108 (según safetensors del repositorio MLX; el modelo original es de 31B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base Gemma 4 soporta hasta 256k tokens, pero no se especifica en esta conversión) |
| Tipos de cuantizacion | MXFP4 (4 bits) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es un merge de tres modelos basados en Gemma 4 31B, creado por sophosympatheia mediante la herramienta mergekit. La receta combina `TheDrummer/Artemis-31B-v1`, `zerofata/G4-MeroMero-v2-31B` y `llmfan46/gemma-4-Ortenzya-The-Creative-Wordsmith-31B-it-uncensored-heretic`, utilizando como base el modelo `google/gemma-4-31B-it`. El proceso de fusión no añade datos de entrenamiento adicionales, sino que combina los pesos de los modelos base para obtener un comportamiento creativo mejorado. La versión v2.1 corrige los problemas de la v2.0 al usar el modelo stock de Gemma 4, en lugar de un modelo base exótico que causaba errores en la capa de salida.

No se ha publicado información sobre el dataset de entrenamiento del merge, ni sobre técnicas de RLHF o DPO aplicadas. La innovación técnica principal reside en la estrategia de fusión por capas, que mitiga parcialmente los artefactos introducidos por uno de los ingredientes (el modelo de Ortenzya). La conversión a MLX se realizó con `mlx-lm` versión 0.31.3, aplicando cuantización MXFP4 para reducir el tamaño del modelo a 4 bits.

## Capacidades

- Generación de texto creativo y prosa: el modelo está diseñado para producir narraciones, diálogos y descripciones con una alta calidad literaria.
- Conversación multi-turno: puede mantener diálogos extensos, aunque no se especifica soporte explícito para system prompts complejos.
- Generación de texto instructivo: al ser un merge de Gemma 4 IT, responde a instrucciones en formato conversacional.
- Multilingüe: aunque la etiqueta indica inglés, el modelo base Gemma 4 soporta varios idiomas; no se garantiza el mismo rendimiento en otros idiomas.
- No hay evidencia de soporte de tool calling, agentes, visión o audio en la información proporcionada.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar borradores de relatos, poemas o guiones, aprovechando su capacidad para variar el estilo y el vocabulario. Por ejemplo, un escritor puede pedirle que desarrolle una escena de un cuento con un tono específico, y el modelo devolverá un texto con riqueza léxica.
- Creación de diálogos para juegos de rol: gracias a su enfoque conversacional, puede generar respuestas de personajes no jugadores con personalidad y coherencia, útil para diseñadores de juegos.
- Redacción de contenido de marketing: generar eslóganes, descripciones de productos o textos publicitarios con un tono creativo, aunque su rendimiento en idiomas distintos del inglés no está garantizado.
- Asistencia en la generación de código: aunque no es su enfoque principal, al estar basado en Gemma 4 IT, puede ayudar en tareas de programación básica, pero no se recomienda para código crítico.
- Simulación de personajes para entrenamiento de modelos de diálogo: puede generar ejemplos de conversaciones con estilos variados, útil para el ajuste fino de otros modelos.
- Prototipado rápido de aplicaciones de chat creativo: se puede integrar en una API local para probar ideas de productos de texto generativo, gracias a su licencia Apache 2.0 y su formato MLX fácil de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo original tampoco ofrece métricas comparativas en su model card. Por tanto, no es posible aportar datos objetivos de rendimiento en tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: con cuantización MXFP4 (4 bits), el modelo ocupa aproximadamente 16 GB en disco. Para inferencia, se recomienda al menos 16 GB de memoria unificada en Apple Silicon (por ejemplo, MacBook Pro con chip M1 Pro de 16GB o superior) para cargar los pesos completos en RAM.
- GPU recomendadas: en sistemas con MLX, cualquier Apple Silicon con 16 GB o más. En GPUs NVIDIA, se requeriría una tarjeta con al menos 16 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A100 40GB), pero el formato MLX no es directamente compatible; habría que convertir el modelo a GGUF o a otro formato.
- En consumer GPU: sí, cabe en una RTX 4090 (24 GB) si se convierte a GGUF, aunque no se proporciona esa conversión en este repositorio.
- Opciones de despliegue: MLX (Apple), posible conversión a GGUF para llama.cpp o Ollama, y a safetensors para vLLM (pero la cuantización MXFP4 es específica de MLX). No se menciona compatibilidad con TGI.
- Latencia y throughput: no se conocen datos específicos, pero un modelo de 31B cuantizado a 4 bits en una Mac con M1 Max puede generar alrededor de 10-20 tokens por segundo, dependiendo de la implementación. No hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos similares. El modelo es un merge de Gemma 4 31B, por lo que se podría comparar con el propio Gemma 4 31B, pero no se han publicado resultados de benchmarks. Tampoco se conocen otros modelos en formato MXFP4 de 31B para comparar. Por tanto, no se ofrece una tabla comparativa.

## Limitaciones y advertencias

- Artefactos de texto: según la model card original, el modelo produce ocasionalmente artefactos como fusiones de palabras o erratas ortográficas. Se recomienda usar un sampler conservador (por ejemplo, subir el Min-P) para reducirlos.
- Sesgos y alucinación: al ser un modelo generativo, puede inventar información no verificada, especialmente en tareas de conocimiento factual. No se han evaluado sesgos específicos, pero hereda los del modelo base Gemma 4.
- Limitación de idioma: el modelo está etiquetado como inglés, por lo que su rendimiento en otros idiomas no está garantizado y puede ser inferior.
- Licencia: aunque la licencia es Apache 2.0, la licencia de los modelos base (Gemma 4) puede tener restricciones adicionales; se recomienda revisar los términos de Google para uso comercial.
- Sin soporte de herramientas: no se ha verificado que el modelo soporte function calling ni agentes, por lo que no es adecuado para pipelines de agentes autónomos.
- Formato propietario: el formato MLX con MXFP4 es específico de MLX, por lo que no es directamente portable a otros frameworks sin conversión.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/beezu/Glistening-Gem-31B-v2.1-mlx-mxfp4
- Modelo original: https://huggingface.co/sophosympatheia/Glistening-Gem-31B-v2.1
- Modelo base Gemma 4: https://huggingface.co/google/gemma-4-31B-it
- Resultado de búsqueda sobre Gemma 4: https://tech-insider.org/google-gemma-4-open-model-benchmarks-2026/
- Resultado de búsqueda sobre Meta Muse Glimmer: https://www.techtimes.com/articles/323787/20260810/meta-launches-muse-glimmer-first-consumer-gpu-agent-model-built-autonomous-tasks.htm
- Resultado de búsqueda sobre Ollama Gemma 4: https://ollama.com/library/gemma4:31b-mlx
