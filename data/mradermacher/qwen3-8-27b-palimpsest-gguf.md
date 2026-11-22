# mradermacher/Qwen3.8-27B-Palimpsest-GGUF

## Resumen

Qwen3.8-27B-Palimpsest es un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) derivado de la familia Qwen, publicado por el usuario xero0000 y cuantizado en formato GGUF por mradermacher. Se trata de un ajuste fino (fine-tune) del modelo base Qwen3.8-27B-Palimpsest, orientado a escritura creativa, uso de herramientas (tool-use), contexto largo y capacidades de visión-lenguaje, según las etiquetas declaradas en la model card. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El repositorio cuantizado ofrece un conjunto completo de cuantizaciones estáticas GGUF (desde Q2_K hasta Q8_0, además de IQ4_XS) junto con los ficheros mmproj necesarios para el procesamiento multimodal. El tamaño total del repositorio es de 190,8 GB, lo que refleja la inclusión de todas las variantes de cuantización. El modelo está pensado para su despliegue con llama.cpp y herramientas compatibles con GGUF, y declara soporte para endpoints compatibles.

La relevancia de esta ficha radica en que permite evaluar rápidamente una alternativa de 27B con licencia permisiva y capacidades multimodales, si bien la información pública disponible sobre arquitectura interna, datos de entrenamiento y rendimiento es muy limitada, lo que se refleja en las secciones correspondientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de la familia Qwen; sin detalles publicados) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (etiqueta "long-context" sin cifra concreta) |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en bf16 según etiquetas |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo en la información disponible. Las etiquetas de la model card indican que se trata de un modelo de la familia Qwen (tags `qwen3.8` y `qwen3.5`), con capacidades de visión-lenguaje (`vision-language`), contexto largo (`long-context`) y ajuste mediante LoRA (`lora`). El modelo base es `xero0000/Qwen3.8-27B-Palimpsest`, un adaptador o fine-tune sobre el que mradermacher ha generado las cuantizaciones estáticas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. La única información técnica concreta es la derivada del proceso de cuantización: se han generado cuantizaciones estáticas (no imatrix en este repositorio; las versiones ponderadas/imatrix están en un repositorio separado) y se incluyen ficheros `mmproj` para el componente multimodal.

## Capacidades

- Generación de texto y escritura creativa, según la etiqueta `creative-writing` de la model card.
- Procesamiento de visión-lenguaje: el repositorio incluye ficheros `mmproj` (Q8_0 y f16) que permiten el procesamiento de imágenes junto con texto.
- Uso de herramientas (tool-use / function calling), según la etiqueta `tool-use`.
- Soporte de contexto largo, según la etiqueta `long-context` (sin cifra concreta publicada).
- Capacidades conversacionales (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte multilingüe limitado al inglés según el campo `language`.
- No se documentan capacidades de audio ni modos de razonamiento explícito (thinking mode).

## Casos de uso

- Escritura creativa asistida: el modelo está etiquetado específicamente para `creative-writing`, por lo que puede emplearse en la generación de relatos, guiones y borradores literarios con instrucciones de estilo, aprovechando su fine-tune orientado a este dominio.
- Análisis de documentos con imágenes: gracias a los ficheros `mmproj` incluidos, puede procesar capturas, diagramas o páginas escaneadas junto con texto, lo que resulta útil para extracción de información de documentos mixtos.
- Asistentes conversacionales multi-turno: la etiqueta `conversational` y el soporte de contexto largo permiten mantener diálogos extensos con historial acumulado, adecuado para atención al cliente o asistentes internos.
- Integración en pipelines con tool calling: la etiqueta `tool-use` sugiere capacidad para invocar funciones externas, lo que permite conectarlo a APIs, bases de datos o sistemas de automatización en flujos de agentes.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (16,9 GB) y Q5_K_M (19,6 GB) permiten ejecutar el modelo en GPUs de consumo alto o en configuraciones con memoria unificada, útil para prototipado sin infraestructura cloud.
- Generación de código y tareas técnicas: aunque no se documenta explícitamente, la familia Qwen suele incluir capacidades de código; debe validarse empíricamente antes de usarlo en producción para esta tarea.
- Procesamiento por lotes con llama.cpp: la disponibilidad de cuantizaciones desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB) permite ajustar el equilibrio calidad/memoria según el hardware disponible en entornos de inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~11,0 GB; Q3_K_S ~12,4 GB; Q3_K_M ~13,6 GB; Q3_K_L ~14,7 GB; IQ4_XS ~15,5 GB; Q4_K_S ~15,9 GB; Q4_K_M ~16,9 GB; Q5_K_S ~19,1 GB; Q5_K_M ~19,6 GB; Q6_K ~22,5 GB; Q8_0 ~29,1 GB. Añadir ~0,7 GB (mmproj Q8_0) o ~1,0 GB (mmproj f16) si se usa la capacidad multimodal.
- GPU recomendadas: para Q8_0, una GPU de 32 GB o más (A100 40 GB, H100, RTX 5090); para Q4_K_M, una RTX 4090 (24 GB) es suficiente; para Q2_K, una GPU de 12-16 GB puede bastar.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con cuantizaciones hasta Q5_K_M; en GPUs de 16 GB con Q3_K_M o inferiores; en GPUs de 12 GB con Q2_K.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, koboldcpp) por el formato GGUF; también servidores compatibles con endpoints según la etiqueta `endpoints_compatible`. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que requerirían el modelo base en bf16.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Palimpsest (este) | 27,3 B | no disponible | Apache 2.0 | GGUF | Fine-tune orientado a escritura creativa, tool-use y visión |
| Qwen3.8-27B-Palimpsest (base, xero0000) | 27,3 B | no disponible | Apache 2.0 | bf16 | Modelo original sin cuantizar |
| Alternativas de ~27B de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas (rendimiento, contexto, benchmarks). La comparación se limita a los datos estructurales del propio repositorio.

## Limitaciones y advertencias

- Información muy limitada: no se publican detalles de arquitectura, datos de entrenamiento ni benchmarks, lo que impide evaluar su calidad de forma rigurosa antes de desplegarlo.
- Idioma: el campo `language` solo declara inglés; el rendimiento en castellano no está verificado y podría ser deficiente.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no hay documentación sobre mitigaciones específicas.
- Sesgos: no se documentan evaluaciones de sesgo ni medidas de mitigación.
- Contexto largo: la etiqueta `long-context` no especifica una cifra concreta, por lo que no se puede garantizar un comportamiento fiable más allá de lo que se valide empíricamente.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las obligaciones de atribución y las posibles restricciones heredadas del modelo base original de Qwen.
- Producción: al ser un fine-tune de un tercero (xero0000) sobre una familia Qwen, la calidad y estabilidad del ajuste no están auditadas; se recomienda validación exhaustiva antes de usarlo en entornos críticos.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; la model card recomienda Q4_K_S/Q4_K_M como equilibrio rapidez/calidad y Q6_K/Q8_0 para máxima calidad.
- El repositorio incluye todas las cuantizaciones (190,8 GB), por lo que la descarga completa es innecesaria; conviene descargar solo la variante requerida.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Palimpsest-GGUF
- Modelo base: https://huggingface.co/xero0000/Qwen3.8-27B-Palimpsest
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Qwen3.8-27B-Palimpsest-i1-GGUF
- Página de descarga del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-Palimpsest-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
