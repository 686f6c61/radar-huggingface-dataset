# heideng90/Qwen3.6-35B-A3B-heretic-v2-GGUF

## Resumen

El modelo `heideng90/Qwen3.6-35B-A3B-heretic-v2-GGUF` es una cuantización en formato GGUF de la variante "heretic" del modelo Qwen3.6-35B-A3B, un transformer de tipo Mixture-of-Experts (MoE) con 35.505.251.456 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (según la convención de nomenclatura "A3B"). El modelo base original es `trohrbaugh/Qwen3.6-35B-A3B-heretic-v2`, que a su vez deriva del `Qwen/Qwen3.6-35B-A3B` de Alibaba. La etiqueta "heretic" indica que se ha aplicado una técnica de "abliteration" o "decensoring" para eliminar los mecanismos de rechazo y alineación de seguridad del modelo original.

Este repositorio concreto no contiene pesos en formato transformers ni safetensors, sino únicamente ficheros GGUF estáticos generados por mradermacher, lo que permite su ejecución en llama.cpp, Ollama y otros motores compatibles con este formato. El repositorio tiene un tamaño de 244,4 GB e incluye cuantizaciones desde Q2_K (13,3 GB) hasta Q8_0 (37,9 GB), además de dos ficheros mmproj (Q8_0 y f16) que actúan como suplemento multimodal, lo que sugiere que el modelo base tiene capacidades de visión.

La relevancia de esta ficha radica en que se trata de una variante sin censura de un modelo MoE de gran tamaño con licencia Apache 2.0, lo que facilita su despliegue en entornos de investigación que requieren modelos sin restricciones de rechazo, aunque con las advertencias de seguridad que ello implica. El modelo está etiquetado únicamente para inglés (`en`) y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), derivada de Qwen3.6-35B-A3B |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (la nomenclatura A3B sugiere ~3B, no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors no incluidos en este repo; el dato de parametros proviene del modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de tipo Mixture-of-Experts (MoE) con 35.505.251.456 parámetros totales, según la información del modelo base en safetensors. La nomenclatura "35B-A3B" indica 35 mil millones de parámetros totales con aproximadamente 3 mil millones activos por token, un esquema típico de MoE que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamaño. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o decodificación especulativa.

La variante "heretic-v2" implica que se ha aplicado un proceso de abliteration o decensoring sobre el modelo original Qwen3.6-35B-A3B, que elimina o atenúa las direcciones de activación asociadas a los rechazos de seguridad. Este proceso se realiza normalmente mediante la identificación de direcciones en el espacio de activaciones y su proyección fuera de los pesos, sin reentrenamiento completo. No se especifica en la model card la metodología exacta ni el conjunto de datos de calibración utilizado para la abliteration. La presencia de ficheros mmproj sugiere que el modelo base incorpora un codificador visual, aunque no se detalla su arquitectura.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de conversaciones multi-turno.
- Razonamiento y generación de código, heredados del modelo base Qwen3.6-35B-A3B.
- Capacidades multimodales (visión) inferidas de la presencia de ficheros mmproj en el repositorio, aunque no confirmadas explícitamente en la model card.
- Comportamiento sin censura: el proceso de abliteration elimina los rechazos de seguridad, lo que permite generar contenido que el modelo original rechazaría.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparando sus respuestas con las del modelo original alineado para analizar qué información se filtra tras la abliteration y cómo varía la calidad.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativa que requiera temáticas que el modelo original rechazaría, ejecutándose localmente con llama.cpp u Ollama gracias a los ficheros GGUF.
- Evaluación de robustez de filtros: uso como modelo "adversario" para probar sistemas de moderación de contenido, generando prompts que un modelo censurado no produciría y verificando si los clasificadores los detectan.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_S (20,5 GB) y Q4_K_M (21,8 GB) permiten ejecutar un modelo de 35B en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090) o en configuraciones con offloading a CPU, algo inviable con el modelo en precisión completa.
- Análisis de sesgos y alucinaciones: al carecer de capa de rechazo, el modelo puede exponer de forma más directa los sesgos aprendidos en el corpus de entrenamiento, útil para auditorías de datos.
- Prototipado de asistentes conversacionales en inglés: integración vía llama.cpp u Ollama para pruebas de concepto de chat multi-turno donde las restricciones de contenido no sean un requisito.
- Investigación sobre cuantización: comparación de la degradación de calidad entre Q2_K, Q4_K_M y Q8_0 sobre un mismo modelo MoE, usando los ficheros publicados como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~13,3 GB; Q3_K_M ~17,3 GB; IQ4_XS ~19,5 GB; Q4_K_S ~20,5 GB; Q4_K_M ~21,8 GB; Q5_K_M ~25,4 GB; Q6_K ~29,3 GB; Q8_0 ~37,9 GB. Añadir ~0,7-1,0 GB si se usa el suplemento multimodal mmproj.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_S/Q4_K_M con margen ajustado; A100 40 GB o H100 para Q6_K y Q8_0; para Q8_0 también es válida una A100 80 GB o dos GPUs de 24 GB.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con Q2_K/Q3_K_S y posible offloading parcial.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier motor compatible con GGUF (koboldcpp, LM Studio). vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput estimados: no disponible en la información proporcionada. Al ser un MoE con ~3B activos, el throughput debería ser sustancialmente mayor que el de un modelo denso de 35B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| heideng90/Qwen3.6-35B-A3B-heretic-v2-GGUF | 35,5B | ~3B (no confirmado) | no disponible | Apache 2.0 | GGUF | Variante abliterated, solo inglés |
| trohrbaugh/Qwen3.6-35B-A3B-heretic-v2 | 35,5B | ~3B (no confirmado) | no disponible | Apache 2.0 | safetensors (modelo base) | Modelo base del que deriva esta cuantización |
| Qwen/Qwen3.6-35B-A3B | 35,5B | ~3B (no confirmado) | no disponible | Apache 2.0 | safetensors | Modelo original alineado, multilingüe |
| mradermacher/Qwen3.6-35B-A3B-heretic-v2-i1-GGUF | 35,5B | ~3B (no confirmado) | no disponible | Apache 2.0 | GGUF (imatrix) | Cuantizaciones con imatrix, alternativa a esta versión estática |

## Limitaciones y advertencias

- Modelo sin censura: la abliteration elimina los rechazos de seguridad, por lo que puede generar contenido dañino, ilegal o sexualmente explícito. No apto para producción orientada al público sin capas adicionales de moderación.
- Sesgos conocidos: hereda los sesgos del corpus de entrenamiento de Qwen3.6, y la abliteration puede amplificar la exposición de sesgos al eliminar la capa de rechazo.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual en la información disponible; al ser una variante modificada, la degradación respecto al original no está cuantificada.
- Limitación de idioma: etiquetado únicamente para inglés (`en`); el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto: no disponible; no se puede confirmar si la abliteration o la cuantización afectan a la ventana de contexto efectiva.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y la responsabilidad legal del contenido generado recae en el usuario.
- Calidad de cuantización: las cuantizaciones Q2_K y Q3_K_S degradan notablemente la perplejidad; para uso serio se recomienda Q4_K_M o superior.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes de calidad independientes.
- El proceso de abliteration puede degradar capacidades de razonamiento e instrucción; no hay benchmarks que lo cuantifiquen en esta información.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/heideng90/Qwen3.6-35B-A3B-heretic-v2-GGUF
- Modelo base (safetensors): https://huggingface.co/trohrbaugh/Qwen3.6-35B-A3B-heretic-v2
- Cuantizaciones imatrix alternativas: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-heretic-v2-i1-GGUF
- Página de descargas de mradermacher: https://hf.tst.eu/model#Qwen3.6-35B-A3B-heretic-v2-GGUF
- Modelo original Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia Apache 2.0 del modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
