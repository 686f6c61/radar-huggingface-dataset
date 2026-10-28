# abzard/interchange-span-model

## Resumen

`abzard/interchange-span-model` es una exportación a ONNX del modelo de extracción de spans GLiNER multi-v2.1 de urchade, publicada por el usuario abzard bajo licencia Apache 2.0. El modelo parte del export ONNX de `onnx-community/gliner_multi-v2.1` (revisión `6ddaeb9413b0e71ad8457da1aab378a165b24058`) y aplica cuantización a 8 bits sobre los embeddings de palabras y sobre las matrices de cada producto matricial, mediante el script `scripts/span-model/convert.py` de Interchange.

Se trata, por tanto, de una variante cuantizada de un modelo de reconocimiento de entidades basado en clasificación de spans, empaquetada en formato ONNX con un tamaño de repositorio de 0,4 GB. No es un modelo generativo ni un LLM: su función es la extracción de entidades sobre texto, y su interés práctico reside en el menor footprint de memoria y en la portabilidad del formato ONNX para despliegues en producción.

La ficha pública no incluye información sobre arquitectura interna, número de parámetros, longitud de contexto, idiomas soportados ni métricas de rendimiento. El modelo acumula 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación comunitaria documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de spans (span model) GLiNER, exportado a ONNX; detalle interno (encoder, capas, dimensión oculta) no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (8 bits) sobre embeddings de palabras y sobre las matrices de cada producto matricial |
| Idiomas soportados | no disponible (el sufijo "multi" del modelo base sugiere capacidad multilingüe, pero no se detalla la lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información disponible describe el artefacto como un modelo de spans (GLiNER) derivado del export ONNX de `onnx-community/gliner_multi-v2.1` en la revisión indicada. La transformación aplicada consiste en cuantizar a 8 bits los embeddings de palabras y las matrices de cada producto matricial, mediante el script de conversión de Interchange. No se especifica el tipo de encoder subyacente, el número de capas, la dimensión de los embeddings ni el esquema exacto de cuantización (por ejemplo, simétrica/asimétrica o calibración utilizada).

Tampoco se documentan en la información proporcionada los datos de entrenamiento del modelo base: número de tokens, composición del dataset, posibles fases de ajuste (RLHF/DPO) ni innovaciones técnicas adicionales. Cualquier afirmación sobre el proceso de entrenamiento del GLiNER original queda fuera del alcance de esta ficha, ya que no aparece en la model card ni en los metadatos consultados.

## Capacidades

- Extracción de entidades nombradas mediante clasificación de spans sobre texto de entrada.
- El modelo base `gliner_multi-v2.1` pertenece a la familia GLiNER (generalist NER); no se detallan en la información capacidades adicionales más allá de la extracción de spans.
- Soporte de tool calling / function calling: no disponible / no aplicable a un modelo de NER.
- Soporte de agentes y razonamiento multi-paso: no disponible / no aplicable.
- Capacidades multilingües: el nombre del modelo base sugiere soporte de varios idiomas, pero la lista concreta no está disponible.
- Visión, audio o modo "thinking": no disponible / no aplicable.

## Casos de uso

- Extracción de entidades en pipelines de NLP en producción con ONNX Runtime: el formato ONNX y la cuantización INT8 permiten ejecutar el modelo sin dependencias de PyTorch y con menor uso de memoria, lo que simplifica su integración en servicios de inferencia existentes.
- Detección de datos personales (PII) como paso previo a la anonimización: el modelo puede marcar spans de personas, organizaciones o localizaciones antes de aplicar reglas de enmascarado en textos que se van a almacenar o compartir.
- Procesamiento por lotes de documentos en CPU: al ocupar 0,4 GB en disco y estar cuantizado, es candidato para ingesta masiva de contratos, informes o correos en máquinas sin GPU.
- Enriquecimiento de datos para analítica y búsqueda: extraer entidades de artículos o registros para poblar índices, grafos de conocimiento o etiquetas de búsqueda facetada.
- Preprocesado en sistemas de compliance y KYC: identificar nombres de personas y entidades jurídicas en documentación regulatoria para su revisión posterior por reglas o por un revisor humano.
- Componente auxiliar en pipelines de RAG: extraer entidades de los fragmentos recuperados para desambiguar o filtrar resultados antes de pasarlos a un modelo generativo.
- Despliegue en entornos con recursos limitados (edge o contenedores pequeños): el tamaño reducido del artefacto facilita su empaquetado junto a otros servicios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco se documenta la pérdida de precisión asociada a la cuantización INT8 respecto al export ONNX sin cuantizar ni al modelo original de urchade.

## Requisitos de hardware

- Memoria: los pesos cuantizados ocupan aproximadamente 0,4 GB (tamaño del repositorio). La memoria total de inferencia depende del runtime, del tamaño de lote y de la longitud de secuencia, y no se ha publicado una cifra oficial.
- GPU: no se especifican modelos recomendados. Por el tamaño del artefacto, cabe en cualquier GPU de consumo actual (por ejemplo, una RTX 3060 de 12 GB o superior) con margen amplio, si bien no hay mediciones oficiales que lo confirmen.
- CPU: el formato ONNX y la cuantización INT8 hacen viable la inferencia en CPU; no se dispone de cifras de latencia.
- Despliegue: ONNX Runtime es el runtime natural para el formato entregado. vLLM, llama.cpp, Ollama y TGI no aplican, ya que están orientados a modelos generativos y este es un modelo de spans.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Tamano del repo | Licencia | Parametros / contexto |
|---|---|---|---|---|---|
| `abzard/interchange-span-model` | ONNX | INT8 (embeddings y productos matriciales) | 0,4 GB | Apache 2.0 | no disponible |
| `onnx-community/gliner_multi-v2.1` | ONNX | no disponible (export de referencia) | no disponible | Apache 2.0 (heredada) | no disponible |
| `urchade/gliner_multi-v2.1` | no disponible en la informacion | sin cuantizar (modelo base) | no disponible | Apache 2.0 | no disponible |

Los datos de parámetros, contexto y rendimiento de los modelos comparables no aparecen en la información proporcionada, por lo que la comparación se limita a formato, cuantización, tamaño y licencia.

## Limitaciones y advertencias

- Modelo sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin validación externa documentada.
- La cuantización INT8 puede degradar la precisión de la extracción de entidades frente al modelo original; no se han publicado métricas de esa pérdida.
- No hay información sobre sesgos del modelo base ni sobre su comportamiento diferencial por idioma, dominio o tipo de entidad.
- Riesgo de falsos positivos y falsos negativos en la detección de spans; no se han publicado tasas de error.
- Idiomas soportados no confirmados: el despliegue en un idioma concreto requiere validación previa.
- Licencia Apache 2.0, que permite uso comercial, pero conviene revisar los términos del modelo base `urchade/gliner_multi-v2.1` y del export ONNX de origen antes de un despliegue en producción.
- Artefacto publicado el 2026-10-27 sin historial de mantenimiento conocido; la reproducibilidad depende del script de conversión de Interchange, cuya URL no se incluye en la información.
- Al ser un modelo de spans para NER, no debe emplearse como modelo generativo ni como sustituto de un LLM en tareas de razonamiento o diálogo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abzard/interchange-span-model
- Modelo base: https://huggingface.co/urchade/gliner_multi-v2.1
- Export ONNX de origen: https://huggingface.co/onnx-community/gliner_multi-v2.1 (revisión `6ddaeb9413b0e71ad8457da1aab378a165b24058`)
- Script de conversión: `scripts/span-model/convert.py` del proyecto Interchange (URL del repositorio no disponible en la información)
