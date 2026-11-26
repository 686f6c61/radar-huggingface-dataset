# mradermacher/Inkling-2-mini-BF16-3MPER0RR-Abliterated-i1-GGUF

## Resumen

Inkling-2-mini-BF16-3MPER0RR-Abliterated-i1-GGUF es una cuantización en formato GGUF del modelo Inkling-2-mini-BF16-3MPER0RR-Abliterated, publicada por el usuario mradermacher. Se trata, por tanto, de un artefacto derivado: el repositorio no contiene un modelo entrenado desde cero, sino una conversión y cuantización del modelo original de 3MPER0RR, orientada a su ejecución en local mediante llama.cpp y herramientas compatibles con GGUF. El nombre del repositorio indica que el modelo base está en BF16 y que la versión publicada aquí corresponde a la variante "i1", es decir, cuantizaciones ponderadas con matriz de importancia (imatrix).

El dato técnico más fiable disponible es el recuento de parámetros del modelo base en safetensors: 26.070.385.152 parámetros, aproximadamente 26.000 millones. El tamaño del repositorio GGUF es de 11,0 GB, coherente con un conjunto de cuantizaciones de un modelo de ese orden. La model card no aporta información sobre arquitectura, contexto, licencia ni idiomas, por lo que buena parte de la ficha debe marcarse como no disponible.

La relevancia de este repositorio es práctica: permite desplegar un modelo de ~26B en hardware de consumo mediante cuantizaciones de 1 a 6 bits, con la ventaja de que las variantes "i1" usan imatrix para reducir la pérdida de calidad en bits bajos. No obstante, la ausencia de documentación del modelo base y la falta de licencia declarada son limitaciones importantes para cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.070.385.152 (~26B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base está en BF16 safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en la documentación proporcionada. El recuento de parámetros (26.070.385.152) corresponde a un transformer denso de aproximadamente 26B, pero no se confirma el tipo de arquitectura, el número de capas, la dimensión oculta ni el mecanismo de atención. Tampoco se documenta el proceso de entrenamiento: no hay datos sobre volumen de tokens, composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o similares.

La única información técnica relevante es la relativa al proceso de cuantización. Las etiquetas de la model card indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que sugiere una conversión desde pesos Hugging Face a GGUF mediante el pipeline de llama.cpp. Las cuantizaciones son ponderadas con imatrix, una técnica que calcula una matriz de importancia a partir de activaciones de calibración para preservar mejor los pesos relevantes en cuantizaciones agresivas (especialmente en IQ1, IQ2 e IQ3). El sufijo "Abliterated" del modelo base sugiere una modificación orientada a eliminar o atenuar restricciones de alineación, pero no hay documentación que lo confirme.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` de Hugging Face indica que el modelo está orientado a diálogo multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse mediante la infraestructura de Inference Endpoints de Hugging Face.
- Ejecución local en GGUF: compatible con llama.cpp, Ollama, LM Studio y otros runners que acepten este formato.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue local en estación de trabajo: con cuantizaciones Q4_K_M o IQ4_XS, un modelo de ~26B puede ejecutarse en una GPU con 16-24 GB de VRAM, lo que permite usar el modelo sin depender de APIs externas ni de conexión a internet.
- Prototipado de asistentes conversacionales: la etiqueta `conversational` y el formato GGUF permiten montar un chatbot local con llama.cpp u Ollama en pocos minutos, útil para validar ideas antes de invertir en infraestructura.
- Evaluación de cuantizaciones: el repositorio incluye 24 variantes de cuantización, lo que lo convierte en un banco de pruebas para medir el compromiso entre tamaño, velocidad y calidad en un modelo de 26B.
- Investigación sobre modelos "abliterated": permite estudiar cómo se comporta una variante sin restricciones de alineación en entornos controlados y con fines de análisis de seguridad.
- Inferencia en CPU con memoria limitada: las variantes IQ1_S, IQ1_M e IQ2_XXS ocupan menos de 11 GB y pueden ejecutarse en CPU con RAM suficiente, aunque con degradación de calidad esperable.
- Integración en pipelines de CI/CD para pruebas de regresión: al ser un GGUF pequeño en comparación con el BF16 original, puede incluirse en entornos de test automatizados para validar respuestas del modelo ante cambios de prompt o configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Las variantes IQ1_S e IQ1_M rondan los 6-8 GB; IQ2_XXS e IQ2_XS, 8-9 GB; Q3_K_M e IQ3_M, 12-13 GB; Q4_K_M e IQ4_XS, 15-17 GB; Q5_K_M, 18-20 GB; Q6_K, 21-23 GB. Son estimaciones a partir del tamaño del repo (11,0 GB) y del recuento de parámetros, no datos oficiales.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4 y Q5; RTX 3090 o RTX 4080 (16-24 GB) para Q4; A100 40/80 GB o H100 para BF16 y Q6_K. Para IQ2 e IQ3, GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080.
- Cabe en GPU de consumo: sí, en RTX 4090, 4080, 3090 y 4070 Ti con cuantizaciones de 1 a 4 bits; en GPUs de 8 GB solo con IQ1/IQ2 y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI a través de llama.cpp. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que se recomienda usar el modelo base en safetensors para esos casos.
- Latencia y throughput: no disponibles. Dependen fuertemente de la cuantización, la GPU y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-mini-BF16-3MPER0RR-Abliterated-i1-GGUF | ~26B | no disponible | no disponible | GGUF | Hugging Face (mradermacher) |
| Modelo base Inkling-2-mini-BF16-3MPER0RR-Abliterated | ~26B | no disponible | no disponible | safetensors BF16 | Hugging Face (3MPER0RR) |
| Mistral Small 3 (24B) | 24B | 32K | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |
| Gemma 2 27B | 27B | 8K | Gemma License | safetensors, GGUF | Hugging Face, Ollama |

La comparativa con Mistral Small 3 y Gemma 2 27B es orientativa por tamaño; no se dispone de datos de rendimiento del modelo evaluado para establecer comparaciones cuantitativas. La diferencia principal es que ambos modelos de referencia tienen licencia y documentación claras, mientras que este repositorio carece de ambas.

## Limitaciones y advertencias

- Licencia no disponible: sin licencia declarada, no se puede garantizar el uso comercial. Es imprescindible contactar con el autor del modelo base antes de cualquier despliegue en producción.
- Modelo derivado sin documentación: la model card no describe arquitectura, entrenamiento, contexto ni idiomas, lo que impide evaluar su idoneidad para tareas concretas.
- El sufijo "Abliterated" indica que el modelo base ha sido modificado para atenuar restricciones de alineación; esto puede aumentar el riesgo de respuestas inapropiadas, sesgadas o dañinas, y debe tratarse con cautela en aplicaciones de cara al usuario.
- Riesgo de alucinación: no cuantificado por el autor; en modelos conversacionales de este tamaño es habitual, pero no hay datos específicos.
- Idiomas: no se especifican; no se puede asumir un rendimiento correcto en castellano sin evaluación previa.
- Cuantizaciones de 1 y 2 bits: las variantes IQ1_S, IQ1_M, IQ2_XXS e IQ2_XS, aunque usan imatrix, presentan degradación de calidad notable; no se recomiendan para producción.
- Sin benchmarks: no hay evidencia publicada del rendimiento del modelo, ni del base ni de las cuantizaciones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay señal de validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Inkling-2-mini-BF16-3MPER0RR-Abliterated-i1-GGUF
- Modelo base: https://huggingface.co/3MPER0RR/Inkling-2-mini-BF16-3MPER0RR-Abliterated
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
- llama.cpp (runner GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (runner GGUF): https://ollama.com
