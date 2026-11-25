# mradermacher/Gemma-4-12B-Aether-i1-GGUF

## Resumen

Gemma-4-12B-Aether-i1-GGUF es la colección de cuantizaciones GGUF, generadas con imatrix (importance matrix), del modelo Gemma-4-12B-Aether, un ajuste fino de la familia Gemma 4 de Google. El trabajo de cuantización lo firma mradermacher, un conocido publicador de cuantizaciones GGUF en Hugging Face, mientras que el modelo base original corresponde a emkey1. El modelo cuenta con 11.907.350.576 parámetros (aproximadamente 12.000 millones) y está orientado a tareas de código y conversación, además de incluir capacidades de visión según indica la propia model card.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 12B en hardware de consumo mediante cuantizaciones que van desde ~3,1 GB (IQ1_S) hasta ~9,9 GB (Q6_K), manteniendo en los formatos IQ un equilibrio razonable entre tamaño y calidad. El uso de imatrix mejora la fidelidad de las cuantizaciones de baja precisión respecto a las estáticas.

La licencia es Apache 2.0, lo que facilita el uso comercial, aunque el modelo solo declara soporte para inglés. La información técnica disponible es limitada: no se publican detalles sobre arquitectura interna, contexto, datos de entrenamiento ni benchmarks, por lo que varios campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, transformer; detalles no publicados) |
| Parametros totales | 11.907.350.576 (11,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base emkey1/Gemma-4-12B-Aether. Por la denominación y el tamaño (11,9B parámetros) se trata presumiblemente de un transformer derivado de la familia Gemma 4 de Google, con ajuste fino adicional por parte de emkey1, pero la model card no documenta capas, atención, ni configuración de contexto. Tampoco se especifican los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica documentada en esta ficha es el proceso de cuantización: mradermacher genera cuantizaciones ponderadas con imatrix (importance matrix), lo que permite que los formatos IQ de baja precisión (IQ1, IQ2, IQ3) preserven mejor la calidad que las cuantizaciones estáticas equivalentes. La model card incluye además referencias a comparativas de perplejidad entre tipos de cuantización (gráfico de ikawrakow y notas de Artefact2) para orientar la elección. Existen también cuantizaciones estáticas en el repositorio hermano mradermacher/Gemma-4-12B-Aether-GGUF, donde se alojarían los ficheros mmproj para la parte de visión.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y orientado a diálogo multi-turno.
- Generación de código: la etiqueta "code" indica especialización o buen desempeño en tareas de programación.
- Capacidades de visión: la model card indica explícitamente que es un modelo de visión y remite a los ficheros mmproj del repositorio estático.
- Ajuste fino específico ("aether", "fine-tuned"): el modelo base ha sido adaptado por emkey1, aunque no se detalla el propósito exacto del ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistente de programación en local: con la cuantización i1-Q4_K_M (~7,5 GB) el modelo cabe en GPUs de consumo de 12-16 GB y puede integrarse en editores o CLI para autocompletado y explicación de código en inglés.
- Despliegue en estaciones de trabajo sin GPU dedicada: las cuantizaciones IQ2/IQ3 (~4-6 GB) permiten ejecución en CPU con llama.cpp para prototipos y pruebas de concepto.
- Procesamiento de documentación técnica con imágenes: al ser un modelo de visión (con los ficheros mmproj del repositorio estático), puede emplearse para describir diagramas o capturas en flujos de documentación, siempre en inglés.
- Chatbot interno de soporte a desarrolladores: su naturaleza conversacional y su licencia Apache 2.0 permiten desplegarlo en entornos corporativos sin restricciones comerciales, con la limitación del idioma inglés.
- Filtrado y revisión de código en pipelines: la etiqueta "code" sugiere utilidad para tareas de análisis estático asistido, generación de tests o revisión de parches en inglés.
- Experimentación e investigación en cuantización: el repositorio incluye el fichero imatrix y 24 variantes de cuantización, lo que lo convierte en un banco de pruebas para estudiar el impacto de la precisión en la calidad de un modelo de 12B.
- Inferencia en endpoints compatibles: la etiqueta "endpoints_compatible" indica que puede servirse en infraestructuras de inferencia compatibles con la API de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del fichero GGUF, más overhead de contexto):
  - i1-IQ1_S: ~3,1 GB
  - i1-IQ2_M: ~4,5 GB
  - i1-IQ3_M: ~5,8 GB
  - i1-Q4_K_M: ~7,5 GB
  - i1-Q5_K_M: ~8,6 GB
  - i1-Q6_K: ~9,9 GB
- GPU recomendadas: no disponibles de forma oficial; por tamaño, una RTX 4090 (24 GB) o A100/H100 permiten ejecutar cualquier cuantización con contexto amplio; una RTX 3060 de 12 GB cubre hasta Q5_K_M con margen.
- ¿Cabe en GPU de consumo? Sí: Q4_K_M (~7,5 GB) encaja en GPUs de 8-12 GB; las variantes IQ2/IQ3 caben incluso en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el modelo base en transformers/safetensors para despliegues con vLLM o TGI (no confirmado para esta variante).
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-12B-Aether-i1-GGUF (este) | 11,9B | no disponible | Apache 2.0 | GGUF (24 cuants i1) | Cuantizado con imatrix; visión vía mmproj en repo estático |
| Gemma-4-12B-Aether-GGUF (estático) | 11,9B | no disponible | Apache 2.0 | GGUF (cuants estáticas) | Mismo modelo base, sin imatrix; aloja mmproj |
| emkey1/Gemma-4-12B-Aether (base) | 11,9B | no disponible | Apache 2.0 | transformers/safetensors | Modelo original sin cuantizar, requiere más VRAM |
| Otros modelos de ~12B de la familia Gemma 4 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Idioma: solo se declara soporte de inglés; el rendimiento en castellano no está garantizado ni documentado.
- Sesgos conocidos: no documentados en la información disponible; al heredar el comportamiento de la familia Gemma, cabe esperar sesgos propios de los datos de preentrenamiento, pero no se aportan evidencias.
- Riesgo de alucinación: no cuantificado; no hay benchmarks ni evaluaciones publicadas.
- Cuantizaciones extremas: las variantes IQ1 e IQ2 (etiquetadas por el autor como "for the desperate") degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original de Google (Gemma) por si el ajuste fino hereda restricciones adicionales de uso.
- Producción: la ausencia de datos sobre contexto máximo, tool calling y benchmarks impide garantizar su idoneidad en flujos agénticos o de contexto largo sin evaluación previa.
- Visión: los ficheros mmproj no están en este repositorio, sino en el estático; un despliegue multimodal requiere descargarlos por separado.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Gemma-4-12B-Aether-i1-GGUF
- Modelo base: https://huggingface.co/emkey1/Gemma-4-12B-Aether
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Gemma-4-12B-Aether-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Gemma-4-12B-Aether-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
