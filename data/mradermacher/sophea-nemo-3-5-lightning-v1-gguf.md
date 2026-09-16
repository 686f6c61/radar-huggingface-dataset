# mradermacher/Sophea-Nemo-3.5-Lightning-v1-GGUF

## Resumen

Sophea-Nemo-3.5-Lightning-v1-GGUF es la publicación de cuantizaciones estáticas en formato GGUF generadas por mradermacher a partir del modelo ayoubkirouane/Sophea-Nemo-3.5-Lightning-v1. Se trata, por tanto, de una conversión de pesos y no de un modelo entrenado por el autor de este repositorio: el trabajo de mradermacher se limita a producir los ficheros GGUF que permiten ejecutar el modelo original en llama.cpp, Ollama u otros runners compatibles, además de habilitar su uso en endpoints compatibles.

El recuento de parámetros registrado en el repositorio es de 32.913.266.240 pesos (aproximadamente 32,9 mil millones), lo que sitúa el modelo en la franja de los 30-35B, un rango que en 2026 ocupa el espacio de "modelo denso de gama alta ejecutable en una o dos GPU de consumo" cuando se cuantiza a 4 bits. El repositorio ocupa 22,8 GB y publica las siguientes variantes: x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S y Q2_K.

La relevancia de esta ficha es limitada y conviene ser explícito: la model card es prácticamente vacía (solo indica el repositorio de origen y la lista de cuantizaciones), el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y no hay licencia, idiomas, pipeline ni documentación de entrenamiento publicados. El nombre del modelo sugiere una relación con la familia Nemo de Mistral AI y con la nomenclatura "Lightning", pero la model card no confirma el modelo base, por lo que cualquier afirmación al respecto sería especulativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no documenta la arquitectura del modelo base) |
| Parámetros totales | 32.913.266.240 (≈32,9B), según el recuento de safetensors del repositorio de origen |
| Parámetros activos | no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo de origen se distribuye en safetensors |
| Tamaño del repositorio | 22,8 GB |
| Fecha de publicación (HuggingFace) | 16 de septiembre de 2026 (creación) / 16 de septiembre de 2026 (última actualización) |
| Descargas / likes | 0 / 0 |
| Etiquetas declaradas | gguf, endpoints_compatible, region:us, conversational |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura del modelo base, el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF, DPO o RLAIF. La model card de este repositorio reproduce únicamente metadatos de la herramienta de conversión (quantize_version, output_tensor_quantised, convert_type) y la referencia al repositorio de origen, sin ninguna sección descriptiva del modelo.

Lo único verificable es el proceso de cuantización posterior: se han generado cuantizaciones estáticas (no de tipo "imatrix" dinámico) en el rango Q2_K a Q8_0 más un F16 completo, todas derivadas de https://huggingface.co/ayoubkirouane/Sophea-Nemo-3.5-Lightning-v1. Los metadatos internos de la model card indican `convert_type: hf`, `quantize_version: 2` y `output_tensor_quantised: 1`, lo que corresponde a un flujo estándar de conversión desde HuggingFace a GGUF con llama.cpp. No se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa, modo de razonamiento, etc.).

## Capacidades

No hay documentación de capacidades en la información proporcionada. Las etiquetas del repositorio permiten inferir únicamente lo siguiente, con el grado de incertidumbre que se indica:

- Generación de texto conversacional: la etiqueta `conversational` sugiere que el modelo está pensado para diálogo multi-turno, pero no se especifica la plantilla de chat ni los tokens especiales.
- Compatibilidad con endpoints de inferencia: la etiqueta `endpoints_compatible` indica que el formato GGUF es aceptable para despliegues gestionados compatibles con TGI/endpoints, aunque no se detalla la configuración.
- Razonamiento, código, matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Visión, audio u otras modalidades: no disponible; los metadatos incluyen un campo `skip_mmproj` vacío, lo que no permite concluir que exista un proyector multimodal.
- Modo "thinking" o cadena de pensamiento explícita: no disponible.

## Casos de uso

Estos casos se plantean como escenarios plausibles para un modelo denso de ~32,9B cuantizado a 4 bits y orientado a conversación. En todos ellos debe validarse primero que el modelo base conserva las capacidades asumidas, porque la model card no las documenta.

- Asistente conversacional autoalojado: desplegando la variante Q4_K_M en llama.cpp o vLLM, el modelo puede gestionar diálogos multi-turno sin enviar datos a APIs de terceros, lo que resulta adecuado para entornos con requisitos de soberanía del dato. La ventana de contexto real debe medirse experimentalmente, ya que no está publicada.
- Generación de documentación técnica interna: el modelo puede redactar y resumir documentación a partir de fragmentos de código y especificaciones, integrándose en un pipeline RAG que le inyecte el contexto relevante en cada consulta.
- Clasificación y extracción de información en lotes: con cuantización Q8_0 o Q6_K para minimizar la degradación, puede ejecutarse en modo batch sobre grandes volúmenes de texto (etiquetado de tickets, extracción de entidades, resumen de informes).
- Chatbot de soporte en una intranet: al no requerir conexión a servicios externos, encaja en despliegues on-premise donde la latencia de red hacia proveedores cloud no es aceptable y donde se prefiere una GPU única o un par de GPU de consumo.
- Prototipado y evaluación de fine-tunes: la existencia de doce niveles de cuantización permite comparar rápidamente el impacto de la precisión en la calidad de las respuestas antes de invertir en infraestructura de inferencia a 16 bits.
- Experimentación académica con modelos de ~33B: sirve como punto de comparación reproducible en estudios sobre cuantización, siempre que se cite el repositorio de origen y se tenga en cuenta que no hay licencia declarada.
- Inferencia en hardware de gama alta para tareas de razonamiento: con Q5_K_M o Q6_K en una GPU de 48 GB (por ejemplo, dos RTX 4090 o una A6000), puede emplearse en tareas de análisis que requieran mayor fidelidad de pesos que una cuantización de 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni en la model card ni en los metadatos de HuggingFace. Tampoco hay resultados de latencia o throughput medidos.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del recuento de parámetros (32,9B) y del tamaño típico de cada cuantización GGUF, no datos publicados por el autor. Deben añadirse entre 2 y 6 GB adicionales para la caché KV y el overhead del runtime, en función de la longitud de contexto configurada.

| Cuantización | Peso aproximado | VRAM estimada con contexto moderado |
|---|---|---|
| F16 | ≈66 GB | ≥72 GB (A100 80 GB, H100 80 GB, 2×48 GB) |
| Q8_0 | ≈35 GB | ≥40 GB (A100 40 GB ajustada, 2×24 GB) |
| Q6_K | ≈27 GB | ≥32 GB (2×24 GB, A6000 48 GB) |
| Q5_K_M | ≈23 GB | ≥28 GB (2×24 GB) |
| Q4_K_M | ≈20 GB | ≥24 GB (RTX 4090 / 3090, ajustado) |
| IQ4_XS / Q4_K_S | ≈18-20 GB | ≥23 GB (RTX 4090 con contexto corto) |
| Q3_K_M | ≈16 GB | ≥20 GB (RTX 4090 con holgura, RTX 4080 con offload) |
| Q2_K | ≈12 GB | ≥16 GB (RTX 4080, 4070 Ti Super con offload parcial) |

- GPU recomendadas: A100 80 GB o H100 80 GB para F16 y Q8_0; A6000/L40S de 48 GB o 2×RTX 4090 para Q5-Q6; RTX 4090, RTX 3090 o RTX 5090 (24-32 GB) para Q4 y Q3.
- GPU de consumo: sí, cabe en RTX 4090/3090 a Q4_K_M con contexto corto y en RTX 4080/4070 Ti Super a Q2_K o Q3_K_M; por debajo de 16 GB de VRAM será necesario el offload parcial a CPU y la velocidad caerá de forma notable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF; para alto rendimiento en GPU, vLLM o TGI usando el repositorio original en safetensors en lugar de los GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No hay información sobre el modelo base ni sobre su rendimiento, por lo que no es posible establecer una comparativa de calidad. La tabla siguiente contrasta únicamente atributos estructurales verificables con modelos densos de tamaño comparable ampliamente conocidos, según la documentación pública de sus fabricantes. Las cifras de rendimiento se dejan como "no disponible" porque no existen evaluaciones de Sophea-Nemo-3.5-Lightning-v1 publicadas.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sophea-Nemo-3.5-Lightning-v1 | ≈32,9B | no disponible | no disponible | GGUF en este repositorio; safetensors en el repositorio de origen |
| Qwen2.5-32B | ≈32,5B | 131.072 tokens (según documentación de Qwen) | Apache 2.0 (según documentación de Qwen) | safetensors y múltiples cuantizaciones comunitarias |
| Mistral Small 3 (24B) | ≈24B | 32.768 tokens (según documentación de Mistral AI) | Apache 2.0 (según documentación de Mistral AI) | safetensors y GGUF oficiales y comunitarios |
| Gemma 2 27B | ≈27B | 8.192 tokens (según documentación de Google) | Licencia Gemma (según documentación de Google) | safetensors y GGUF comunitarios |

Comparativa de rendimiento (MMLU, HumanEval, GSM8K): no disponible para el modelo objeto de esta ficha.

## Limitaciones y advertencias

- Ausencia total de licencia: el repositorio no declara licencia, ni aquí ni (según la información disponible) en el repositorio de origen. Sin una licencia explícita, no hay autorización clara para uso comercial ni para redistribución; es un bloqueante para producción.
- Model card vacía: no hay información sobre arquitectura, datos de entrenamiento, tokenizador, plantilla de chat ni idiomas. Cualquier integración requiere ingeniería inversa y validación empírica.
- Riesgo de alucinación: desconocido en magnitud, pero al no haber evaluaciones publicadas no puede descartarse; en un modelo conversacional de 32,9B el riesgo es real y debe mitigarse con RAG y verificación externa.
- Sesgos: no evaluados ni documentados. No hay estudios de sesgo demográfico, político o cultural para este modelo.
- Limitaciones de contexto e idioma: no disponibles. No se puede asumir soporte multilingüe ni una ventana de contexto concreta sin medirla.
- Degradación por cuantización: las variantes Q2_K y Q3_K_S, con 32,9B parámetros, suelen producir pérdidas notables de calidad; para uso serio se recomienda Q5_K_M o superior.
- Trazabilidad: al ser una cuantización de terceros, el autor de este repositorio no controla el contenido del modelo base. Conviene auditar el repositorio original antes de desplegar.
- Adopción nula: 0 descargas y 0 likes implican ausencia de validación comunitaria, de issues reportados y de casos de uso verificados.
- Fechas: la publicación figura con fecha de septiembre de 2026, posterior a la mayoría de referencias disponibles; verificar la vigencia del repositorio antes de depender de él.
- Los resultados de la búsqueda web asociada a esta consulta no contienen ningún material técnico sobre el modelo (son hilos de foro sin relación); no se ha podido obtener documentación externa de respaldo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Sophea-Nemo-3.5-Lightning-v1-GGUF
- Modelo de origen: https://huggingface.co/ayoubkirouane/Sophea-Nemo-3.5-Lightning-v1
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
- Papers, blogs, repositorios o demos adicionales: no disponible (la búsqueda web no devolvió material relacionado con el modelo)
