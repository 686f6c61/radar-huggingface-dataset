# MichaelAnthony/gemma4-e2b-Snowfox-GGUF

## Resumen

El modelo `MichaelAnthony/gemma4-e2b-Snowfox-GGUF` es una distribución en formato GGUF del checkpoint `gemma4-e2b-Snowfox`, un merge de LoRA basado en el modelo instructivo `google/gemma-4-E2B-it-qat-q4_0-unquantized` de Google. El autor, MichaelAnthony, ha empaquetado los pesos resultantes en cuatro cuantizaciones GGUF (Q4_0, Q4_K_M, Q6_K y Q8_0) junto con un proyector multimodal en BF16, pensado para su uso con runtimes compatibles con llama.cpp. La licencia es Apache-2.0, lo que facilita su adopción en proyectos comerciales y de investigación.

El modelo es una variante de Gemma 4 E2B, que incorpora torres de imagen y audio congeladas durante el fine-tuning SnowFox. Esto significa que las capacidades multimodales del modelo base se conservan, aunque el ajuste fino se centró en la parte lingüística. La distribución GGUF permite ejecutar el modelo en una amplia gama de hardware, desde GPUs de consumo hasta entornos de servidor, con diferentes equilibrios entre tamaño y calidad. Es relevante porque ofrece un punto de partida listo para producción en tareas de generación de texto, tool calling y razonamiento, con un tamaño manejable y una licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 E2B (transformer con torres multimodales congeladas) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0, Q4_K_M, Q6_K, Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E2B-it-qat-q4_0-unquantized`, un checkpoint de Gemma 4 E2B con instrucciones y pesos derivados de QAT (Quantization-Aware Training). Sobre este checkpoint se aplicó un fine-tuning mediante LoRA con el método SnowFox, que se centró en la parte lingüística; las torres de imagen y audio se mantuvieron congeladas durante el proceso. Tras el merge de los pesos LoRA, el modelo resultante se exportó a formato GGUF en cuatro cuantizaciones diferentes (Q4_0, Q4_K_M, Q6_K, Q8_0) sin volver a calibrar QAT sobre los pesos post-merge. Esto implica que la calidad de cada cuantización puede variar ligeramente respecto a la versión original, aunque las métricas de validación internas del autor (accuracy en campos requeridos, validez JSON estricta, validez de tool calls y éxito de contratos) son muy altas, superiores a 0.99 en todos los casos.

## Capacidades

- Generacion de texto y razonamiento: el modelo está diseñado para seguir instrucciones y producir respuestas coherentes en tareas de lenguaje natural.
- Soporte de tool calling / function calling: las métricas de validación indican una validez nativa de tool calls del 100%, lo que sugiere que el modelo puede invocar funciones externas de forma fiable.
- Capacidades multimodales (imagen y audio): aunque las torres fueron congeladas, el proyector BF16 incluido permite usar el modelo con entradas multimodales en runtimes compatibles con llama.cpp.
- Soporte de agentes y multi-step reasoning: no se especifica explícitamente, pero la alta validez en tool calls y la naturaleza instructiva del modelo lo hacen adecuado para flujos de agente.
- Capacidades multilingues: no se han publicado detalles sobre los idiomas soportados.

## Casos de uso

- Asistentes conversacionales: el modelo puede gestionar diálogos multi-turno con instrucciones complejas, aprovechando su capacidad de seguir instrucciones y su validación de tool calls para integrarse en chatbots.
- Automatizacion de tareas con tool calling: gracias a su alta validez en llamadas a funciones, es útil para construir agentes que interactúan con APIs, bases de datos o servicios externos.
- Generacion de codigo asistida: aunque no se especifican benchmarks de código, su naturaleza instructiva y su soporte de tool calling lo hacen adecuado para entornos de desarrollo con autocompletado o generación de snippets.
- Procesamiento multimodal ligero: al incluir el proyector, puede utilizarse para tareas que combinan texto con imágenes o audio, como descripción de imágenes o transcripción asistida, en entornos con recursos limitados.
- Prototipado rapido con llama.cpp: al estar en formato GGUF, se puede desplegar fácilmente en aplicaciones locales o en la nube usando Ollama, llama.cpp o vLLM, ideal para pruebas de concepto.
- Integracion en pipelines de datos: su capacidad de generar JSON válido (validez estricta del 100%) lo hace útil para extraer información estructurada de texto o para transformar datos en formatos legibles por máquinas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona métricas de validación internas del fine-tuning SnowFox, que son las siguientes:

| Metrica | Valor |
|---|---|
| Required-field accuracy | 0.9985 |
| Strict JSON validity | 1.0 |
| Native tool-call validity | 1.0 |
| Contract success | 0.9936 |

Estas cifras corresponden a la validación held-out del propio fine-tuning, no a benchmarks de inferencia sobre las cuantizaciones GGUF. No se debe interpretar como rendimiento general del modelo en tareas estándar.

## Requisitos de hardware

- Los tamaños de los archivos GGUF varían entre ~3.3 GB (Q4_0) y ~4.9 GB (Q8_0). El proyector multimodal añade ~0.9 GB.
- Para la cuantización Q4_K_M (recomendada como equilibrio), se estima un uso de VRAM de aproximadamente 4-5 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores.
- La versión Q8_0 requiere al menos 6 GB de VRAM, siendo adecuada para GPUs con 8 GB o más.
- El modelo puede ejecutarse en CPU mediante llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), text-generation-webui, entre otros.
- La latencia y el throughput dependen del hardware y la cuantización; no se proporcionan datos específicos.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente este modelo con alternativas de la misma categoría (mismo tamaño o misma tarea). El nombre "E2B" sugiere una variante eficiente de 2B parámetros, pero no está confirmado. Se recomienda consultar la documentación oficial de Gemma 4 para obtener comparativas con otros modelos de la familia.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o limitaciones lingüísticas; al ser un derivado de Gemma 4, podría heredar sesgos del modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede producir información incorrecta o inventada, especialmente en contextos largos o ambiguos.
- Las cuantizaciones GGUF no fueron re-calibradas con QAT tras el merge, por lo que la degradación de calidad respecto al modelo original puede variar entre cuantizaciones.
- Las torres multimodales fueron congeladas durante el fine-tuning; el rendimiento en tareas de imagen/audio puede no reflejar las mejoras del ajuste SnowFox.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base de Google (aunque también es Apache-2.0).
- No se especifica la longitud de contexto ni los idiomas soportados; es necesario probar el modelo en el caso de uso concreto antes de producción.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/MichaelAnthony/gemma4-e2b-Snowfox-GGUF)
- [Modelo base: google/gemma-4-E2B-it-qat-q4_0-unquantized](https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized)
