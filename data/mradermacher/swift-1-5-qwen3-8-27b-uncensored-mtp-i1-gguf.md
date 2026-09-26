# mradermacher/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP, publicadas por mradermacher. Se trata por tanto de un artefacto de cuantización, no de un modelo entrenado desde cero: el trabajo del autor consiste en convertir los pesos originales a formato GGUF y generar variantes de precisión reducida (tipo i1, con imatrix) para su ejecución local eficiente.

El modelo subyacente pertenece al ecosistema Qwen3.8 y, según la nomenclatura y las etiquetas del repositorio (qwen3_8, mtp), deriva de una variante de 27B con cabeza MTP (multi-token prediction). La model card indica además que es un modelo de visión, aunque los ficheros mmproj se alojan en el repositorio de cuantizaciones estáticas, no en este. Las etiquetas abliterated y uncensored señalan que se ha aplicado una técnica de abliteración para eliminar las direcciones de rechazo del modelo original.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo de 27.320.697.856 parámetros en hardware de consumo mediante cuantizaciones de 11 a 16 GB; por otro, ofrece una variante sin alineación de seguridad para investigación sobre comportamiento de modelos, evaluación de sesgos y estudios de alineación. El repositorio tiene 0 descargas y 0 likes, y fue creado el 25 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (48 de 64 capas con atención lineal, 16 con atención completa con puerta) según las referencias de la familia Qwen3.8-27B; no confirmado en la model card de este quant |
| Parametros totales | 27.320.697.856 (27,3B), dato real de safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; las referencias de Qwen3.8-27B indican 262.000 tokens nativos ampliables a 1M |
| Tipos de cuantizacion | Ficheros publicados en este repositorio: i1-Q2_K (11,0 GB), i1-IQ3_M (12,9 GB), i1-Q4_K_S (15,9 GB) e imatrix (0,1 GB). La lista de tipos generables/etiquetados incluye además Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ4_XS y small-IQ4_NL |
| Idiomas soportados | en (inglés) |
| Licencia | swift-open-license-1.0 (etiquetada como license: other en HuggingFace); texto en https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base está en safetensors/transformers |
| Autor de la cuantizacion | mradermacher |
| Modelo base | ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP |
| Tamaño del repositorio | 39,5 GB |
| Libreria declarada | transformers |
| Pipeline | No disponible |
| Fecha de creacion / actualizacion | 2026-09-25 / 2026-09-25 |

## Arquitectura y entrenamiento

La model card de este repositorio no documenta el entrenamiento del modelo base: no hay información sobre número de tokens, composición del dataset, fases de RLHF, DPO u otro tipo de ajuste. Lo que sí se declara son las etiquetas abliterated y uncensored, que implican la aplicación de una técnica de abliteración (eliminación de direcciones de activación asociadas al rechazo) sobre un modelo previamente alineado, y la etiqueta mtp, que apunta a la presencia de una cabeza de predicción multi-token.

Las referencias públicas de la familia Qwen3.8-27B, de la que este modelo toma su nombre, describen una arquitectura densa de 27.000 millones de parámetros, construida sobre la base arquitectónica de Qwen3.5 y con un backbone de atención híbrida compartido con el modelo MoE de 2,4T: de sus 64 capas, solo 16 ejecutan atención completa con puerta (full_attention_interval: 4) y las otras 48 utilizan atención lineal. Esa misma documentación menciona una torre de visión, una cabeza MTP integrada para decodificación especulativa y una ventana de contexto nativa de 262.000 tokens ampliable a 1M. Estos datos corresponden a Qwen3.8-27B y no están confirmados explícitamente para la variante Swift-1.5 uncensored cuantizada aquí.

## Capacidades

- Generación de texto conversacional en inglés, con la etiqueta conversational declarada en el repositorio.
- Razonamiento multi-paso y decodificación especulativa mediante cabeza MTP, si la arquitectura heredada de Qwen3.8-27B se mantiene en esta variante.
- Procesamiento de visión: la model card del cuantizador indica expresamente que se trata de un modelo de visión, aunque los ficheros mmproj (si existen) están en el repositorio de cuantizaciones estáticas, no en este.
- Contexto largo: la familia de referencia declara 262.000 tokens nativos, lo que habilitaría conversaciones y documentos muy extensos; no verificado para este quant concreto.
- Salida sin filtros de rechazo: al estar abliterado, responde a peticiones que un modelo alineado rechazaría, lo que constituye tanto una capacidad como un riesgo (véase la sección de limitaciones).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible como capacidad declarada explícitamente.
- Capacidades multilingües: limitadas al inglés según el campo language del repositorio.
- Capacidades especiales (audio, thinking mode): no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar qué comportamientos emergen al eliminar las direcciones de rechazo mediante abliteración, comparando sus respuestas con las del modelo base alineado en los mismos conjuntos de prompts. Es adecuado porque esa es precisamente la diferencia declarada respecto al original.
- Evaluación de sesgos y toxicidad en entornos controlados: al carecer de capa de rechazo, sirve como caso extremo para medir la eficacia de clasificadores de contenido y filtros de moderación de terceros.
- Red teaming de aplicaciones: se puede usar para generar intentos adversarios de jailbreak o prompts dañinos que después se emplean para endurecer los filtros de un sistema en producción.
- Despliegue local en estación de trabajo con GPU de consumo: con la cuantización i1-Q4_K_S (15,9 GB) el modelo cabe en una GPU de 24 GB, lo que permite ejecutar un modelo de 27B sin conexión y sin coste de API para prototipado.
- Procesamiento de documentos largos en inglés: si se confirma la ventana de 262.000 tokens de la familia, resultaría apto para resumir o extraer información de contratos e informes extensos, siempre con verificación humana de las respuestas.
- Generación de texto creativo sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas que los modelos alineados suelen rechazar, con la advertencia de que la salida requiere revisión humana.
- Destilación y generación de datos sintéticos para investigación: puede emplearse como generador de corpus diversos y no filtrados que luego se curan antes de usar en ajuste fino.
- Experimentación con decodificación especulativa: la presencia de la cabeza MTP permitiría, si está correctamente exportada en el GGUF, medir ganancias de throughput frente a la decodificación autoregresiva convencional en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del cuantizador ni los resultados de búsqueda proporcionados incluyen métricas de MMLU, HumanEval, GSM8K u otras para esta variante uncensored cuantizada. Tampoco se dispone de mediciones de perplejidad por tipo de cuantización más allá del gráfico comparativo genérico enlazado por el autor (https://www.nethype.de/huggingface_embed/quantpplgraph.png), que no aporta valores numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, según los tamaños de fichero publicados): i1-Q2_K ≈ 11,0 GB; i1-IQ3_M ≈ 12,9 GB; i1-Q4_K_S ≈ 15,9 GB. Hay que sumar la caché KV, cuyo tamaño depende del contexto configurado y no está documentado aquí.
- GPU recomendadas por cuantización: i1-Q2_K e i1-IQ3_M encajan en tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 4080, A4000); i1-Q4_K_S requiere 24 GB (RTX 3090, RTX 4090, A5000, L4 con limitaciones de contexto) o descarga parcial a RAM.
- Cabe en GPU de consumo: sí, en las cuantizaciones bajas y medias indicadas. En tarjetas de 8-12 GB solo con contexto muy reducido o con offloading de capas a CPU, lo que degrada la latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y text-generation-webui son los entornos habituales para GGUF. vLLM soporta GGUF de forma experimental; para servir el modelo completo en alta precisión conviene partir del repositorio base en safetensors.
- Visión: para usar la capacidad multimodal hace falta un fichero mmproj, que según la model card se aloja en https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-GGUF, no en este repositorio.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-i1-GGUF (este) | 27,3B | No disponible en la model card (262K según referencias de la familia) | GGUF i1 con imatrix | swift-open-license-1.0 | Repositorio de 39,5 GB, 0 descargas |
| mradermacher/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-GGUF (cuantizaciones estáticas) | 27,3B | Igual que el anterior | GGUF estáticas, incluye ficheros mmproj para visión | swift-open-license-1.0 | Repositorio alternativo del mismo autor |
| ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP (modelo base) | 27,3B | No disponible | safetensors / transformers | swift-open-license-1.0 | Modelo de origen sin cuantizar |
| Qwen/Qwen3.8-27B (modelo de referencia de la familia) | 27B denso, 48 de 64 capas con atención lineal | 262.000 tokens nativos, ampliable a 1M | safetensors | No disponible en la información proporcionada | Documentado en recetas de vLLM |

No se dispone de datos de rendimiento comparativo entre estas variantes, por lo que la comparación se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo abliterado y uncensored: no incorpora la capa de rechazo del modelo alineado original, por lo que puede generar contenido dañino, ilegal o explícitamente tóxico. No es apto para despliegue público sin moderación externa.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño y, en principio, no mitigado por la abliteración. La ausencia de benchmarks impide cuantificarlo.
- Idiomas: solo inglés declarado. El rendimiento en castellano u otras lenguas no está documentado y probablemente sea inferior.
- Sin datos de evaluación: no hay benchmarks publicados, lo que dificulta estimar la degradación de calidad introducida por la cuantización i1-Q2_K o i1-IQ3_M.
- Licencia no estándar: swift-open-license-1.0 no es una licencia OSI conocida (MIT, Apache-2.0). Es imprescindible leer el texto completo en el enlace indicado antes de cualquier uso comercial, ya que puede incluir restricciones de atribución, de uso o de redistribución. El modelo base apunta a un enlace de licencia alojado en el repositorio de ukisai, lo que sugiere condiciones específicas del derivado.
- Calidad de las cuantizaciones bajas: la propia model card advierte que IQ3_XXS es probablemente mejor opción que i1-Q2_K. Las cuantizaciones por debajo de Q4 suelen degradar la coherencia en modelos de este tamaño.
- Visión no incluida en este repositorio: la capacidad multimodal requiere descargar los ficheros mmproj del repositorio de cuantizaciones estáticas.
- Cabeza MTP no confirmada: aunque la etiqueta mtp está presente, no se especifica si el GGUF exporta y permite usar la decodificación especulativa.
- Repositorio sin tracción: 0 descargas y 0 likes en la fecha de creación, por lo que no hay evidencia comunitaria de funcionamiento correcto ni informes de errores.
- Fechas de creación y actualización en 2026: conviene verificar la vigencia del repositorio antes de integrarlo en un pipeline.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-i1-GGUF
- Cuantizaciones estáticas del mismo modelo (incluye mmproj): https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-GGUF
- Modelo base: https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP
- Texto de la licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Página de resumen de descargas del autor: https://hf.tst.eu/model#Swift-1.5-Qwen3.8-27B-Uncensored-MTP-i1-GGUF
- Peticiones de cuantización y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Receta de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Documentación de vLLM Ascend para Qwen3.8-27B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html
- Guía de ejecución local de Qwen3.8-27B: https://linas.substack.com/p/qwen3-8-27b-local-guide
