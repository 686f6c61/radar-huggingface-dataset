# pedroberaldo/Qwen3.8-Flash-Next-oQ3.5e-fp16-mtp

## Resumen

Qwen3.8-Flash-Next-oQ3.5e-fp16-mtp es una cuantización experimental de 3 bits del modelo Qwen3.8-Flash-Next, realizada por pedroberaldo mediante la herramienta oQ (oMLX v0.6.4). El modelo original, desarrollado por QwenLM, es un modelo de lenguaje de gran tamaño con 179.999.981.459 parámetros (aproximadamente 180.000 millones) y una arquitectura híbrida que combina GDN y QSA en la atención, según el repositorio oficial. Esta versión cuantizada se distribuye en formato MLX safetensors, lo que la orienta a entornos Apple Silicon.

La cuantización reduce el tamaño de los pesos a 3 bits con un group size de 64, lo que permite alojar el modelo en sistemas con memoria unificada elevada. El repositorio ocupa 90.7 GB. La relevancia de esta ficha radica en que permite evaluar el comportamiento de una cuantización extrema sobre un modelo de 180.000 millones de parámetros, algo poco habitual y útil para investigación en compresión de modelos. No se dispone de información sobre licencia, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4_exp (híbrida GDN + QSA según documentacion de QwenLM) |
| Parametros totales | 179.999.981.459 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3-bit, group size 64, mixed-precision fp16 (oQ / oMLX v0.6.4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un modelo experimental de la serie Qwen (identificado como qwen4_exp). Según el repositorio de QwenLM, la arquitectura incorpora una atención híbrida GDN + QSA, y el modelo fue mejorado sistemáticamente en cuatro aspectos: atención, residual, embedding y optimización, con el objetivo de aumentar la capacidad y la eficiencia computacional. No se han proporcionado datos sobre el proceso de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

La versión aquí descrita es una cuantización de precisión mixta generada con oQ (oMLX v0.6.4). Los pesos se almacenan en 3 bits con un group size de 64, y algunas capas se mantienen en fp16, lo que da lugar al nombre oQ3.5e-fp16-mtp. El formato resultante es MLX safetensors, diseñado específicamente para el ecosistema MLX de Apple.

## Capacidades

No se han publicado capacidades específicas en la documentación disponible. Al tratarse de una cuantización de un modelo de lenguaje de gran tamaño, se espera que conserve las capacidades generales del modelo base, como generación de texto, razonamiento, asistencia en código y comprensión multilingüe, pero no hay confirmación oficial en la información proporcionada. Tampoco se dispone de detalles sobre tool calling, soporte de agentes, modo de razonamiento o capacidades multimodales.

## Casos de uso

Los siguientes casos de uso son potenciales y deben validarse con el modelo base, dado que no se dispone de documentación específica de capacidades para esta cuantización.

- Inferencia local en Apple Silicon: el formato MLX permite ejecutar el modelo en Macs con memoria unificada de al menos 128 GB. Es adecuado para investigación y prototipado sin depender de servicios en la nube.
- Evaluación de cuantización 3-bit: permite estudiar el impacto de una cuantización extrema en la calidad de salida de un modelo de 180.000 millones de parámetros. Útil para investigadores en compresión de modelos.
- Generación de texto asistida: si el modelo conserva las capacidades del base, podría utilizarse para redacción, resúmenes o análisis de documentos en entornos locales.
- Asistencia de programación: los modelos Qwen suelen ser competentes en tareas de código; podría emplearse para autocompletar, revisar o explicar código en un entorno local.
- Procesamiento de lenguaje natural multilingüe: si el modelo base es multilingüe, podría usarse para traducción o análisis de sentimiento, aunque no hay confirmación.
- Uso académico con datos sensibles: al ejecutarse localmente, permite trabajar con datos privados sin enviarlos a servicios externos, lo que resulta útil en entornos con restricciones de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa 90.7 GB en disco; en Apple Silicon, MLX utiliza memoria unificada, por lo que se recomienda un sistema con al menos 128 GB de RAM, siendo preferible 192 GB para margen de activaciones.
- GPU recomendadas: no aplica; el formato MLX está pensado para Apple Silicon (M1, M2, M3, M4) con memoria unificada suficiente.
- Compatibilidad con GPU de consumo: no cabe en GPUs convencionales de consumo; el formato MLX no es compatible con CUDA y el tamaño de los pesos supera la VRAM de la mayoría de tarjetas consumer.
- Opciones de despliegue: MLX en Apple Silicon. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI con este formato de pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está especificada, lo que puede impedir el uso comercial o la redistribución sin autorización.
- La cuantización a 3 bits puede degradar significativamente la calidad de salida en comparación con el modelo original.
- El modelo es experimental (qwen4_exp) y no representa una versión estable de la serie Qwen.
- No se dispone de documentación sobre idiomas, sesgos, alucinaciones o restricciones de contexto.
- El formato MLX limita el despliegue a Apple Silicon; no se puede utilizar directamente en entornos CUDA o con frameworks estándar.
- El tamaño del repositorio es de 90.7 GB, lo que requiere un espacio de almacenamiento considerable y dificulta su distribución.

## Enlaces

- HuggingFace: https://huggingface.co/pedroberaldo/Qwen3.8-Flash-Next-oQ3.5e-fp16-mtp
- Repositorio del modelo base (QwenLM): https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
