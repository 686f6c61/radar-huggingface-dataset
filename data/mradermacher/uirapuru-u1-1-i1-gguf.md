# mradermacher/Uirapuru-U1.1-i1-GGUF

## Resumen

Uirapuru-U1.1-i1-GGUF es una cuantización GGUF con imatrix del modelo Uirapuru-U1.1, desarrollado por SynastriaNetworks y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 9.200 millones de parámetros, bilingüe en portugués e inglés, orientado a tareas conversacionales, de razonamiento y tool calling. Según la información disponible para la versión anterior (Uirapuru-U1-9B), el modelo base parece derivar de una arquitectura tipo Qwen3.5 con post-entrenamiento específico para instrucciones, aunque no se confirma oficialmente en la ficha actual.

Esta versión i1 ofrece varios niveles de cuantización (Q2_K, IQ3_M, Q4_K_S, entre otros) optimizados con imatrix, lo que permite ajustar el equilibrio entre tamaño, velocidad y calidad. El modelo está diseñado para ejecutarse en entornos locales o en la nube mediante herramientas compatibles con GGUF como llama.cpp, Ollama o vLLM. Su licencia Apache 2.0 facilita su uso comercial y su integración en productos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer, basado en Qwen3.5 según la versión anterior) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S (también se mencionan IQ3_XXS, Q3_K_M, IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S) |
| Idiomas soportados | Portugués (pt), Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Uirapuru-U1.1. Según la búsqueda web, la versión anterior Uirapuru-U1-9B se describe como "qwen3.5 post-training instruction-tuned multilingual portuguese english reasoning tool-calling conversational", lo que sugiere que Uirapuru-U1.1 podría seguir una línea similar: un modelo transformer con ajuste fino por instrucciones, entrenado para razonamiento, tool calling y conversación multilingüe. Sin embargo, no se confirma oficialmente en la documentación disponible.

La cuantización i1 realizada por mradermacher emplea la técnica imatrix (importance matrix) para optimizar la asignación de bits durante la cuantización, mejorando la calidad respecto a cuantizaciones estáticas del mismo tamaño. El repositorio incluye un archivo imatrix de 0.1 GB que permite a los usuarios generar sus propias cuantizaciones personalizadas.

## Capacidades

- Generación de texto y conversación multilingüe en portugués e inglés.
- Razonamiento y resolución de problemas (según la descripción de la versión anterior).
- Soporte de tool calling / function calling, lo que permite integrarse con APIs y herramientas externas.
- Capacidad de seguir instrucciones complejas gracias al ajuste por instrucciones.
- Posible capacidad de visión: la model card indica "This is a vision model", aunque los archivos mmproj (proyector de visión) se encuentran en el repositorio estático, no en esta versión i1. No se confirma si esta cuantización incluye soporte multimodal.

## Casos de uso

- Atención al cliente automatizada en portugués e inglés: el modelo puede gestionar conversaciones multi-turno con contexto razonable, resolviendo consultas frecuentes y escalando a agentes humanos cuando sea necesario.
- Asistente de programación con tool calling: puede integrarse en entornos de desarrollo para generar, revisar y depurar código, llamando a funciones externas como ejecutores de pruebas o gestores de repositorios.
- Chatbot educativo para aprendizaje de idiomas: su bilingüismo permite practicar conversación en portugués e inglés, con correcciones y explicaciones gramaticales.
- Extracción de información y resumen de documentos: útil para procesar textos largos en los idiomas soportados y generar resúmenes estructurados.
- Automatización de tareas de back-office: puede interactuar con APIs internas para rellenar formularios, consultar bases de datos o generar informes.
- Prototipado rápido de asistentes virtuales: gracias a su licencia Apache 2.0 y su formato GGUF, se puede desplegar localmente en hardware modesto para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras métricas para este modelo.

## Requisitos de hardware

- Los archivos GGUF disponibles tienen los siguientes tamaños: Q2_K ~4.0 GB, IQ3_M ~4.6 GB, Q4_K_S ~5.6 GB. Se recomienda al menos 6-8 GB de VRAM para la cuantización Q4_K_S, y 4-6 GB para las más pequeñas.
- Puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB) con cuantizaciones adecuadas.
- Para despliegue en CPU, se puede usar llama.cpp con cuantizaciones Q4_K_S o inferiores, con latencias aceptables para tareas no interactivas.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con conversión a formato compatible), TGI (si se convierte a safetensors) o cualquier framework que soporte GGUF.
- La latencia estimada depende del hardware y la cuantización; no se dispone de mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Sin embargo, por tamaño (~9B), se puede comparar estructuralmente con otros modelos de la misma categoría:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Uirapuru-U1.1 (este) | 9.2B | no disponible | pt, en | Apache 2.0 | GGUF |
| Llama 3.1 8B | 8B | 128K | multilingüe | Llama 3.1 | safetensors, GGUF |
| Mistral 7B | 7B | 32K | multilingüe | Apache 2.0 | safetensors, GGUF |
| Qwen 2.5 7B | 7.6B | 32K | multilingüe | Apache 2.0 | safetensors, GGUF |

La comparación real de rendimiento requiere benchmarks, que no están disponibles.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos específicos del modelo, pero al estar entrenado principalmente en portugués e inglés, puede presentar sesgos culturales de esas regiones.
- Riesgo de alucinación inherente a los modelos de lenguaje; se recomienda validar respuestas en aplicaciones críticas.
- Limitación de idiomas: solo portugués e inglés; no se garantiza buen rendimiento en otros idiomas.
- La capacidad de visión no está confirmada en esta versión i1; los archivos mmproj se encuentran en el repositorio estático, por lo que esta cuantización podría no incluir soporte multimodal.
- Al ser una cuantización, puede haber una ligera degradación de calidad respecto al modelo original en precisión numérica.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribución y las condiciones de la licencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Uirapuru-U1.1-i1-GGUF
- Modelo base: https://huggingface.co/SynastriaNetworks/Uirapuru-U1.1
- Repositorio estático (con mmproj): https://huggingface.co/mradermacher/Uirapuru-U1.1-GGUF
- Versión anterior U1-9B: https://huggingface.co/mradermacher/Uirapuru-U1-9B-GGUF
