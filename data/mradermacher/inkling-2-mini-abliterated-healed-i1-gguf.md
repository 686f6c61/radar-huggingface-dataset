# mradermacher/Inkling-2-Mini-Abliterated-Healed-i1-GGUF

## Resumen

Inkling-2-Mini-Abliterated-Healed-i1-GGUF es una recopilación de cuantizaciones GGUF generada por mradermacher a partir del modelo base derrickNg1412/Inkling-2-Mini-Abliterated-Healed. Se trata, por tanto, de un artefacto de distribución más que de un modelo original: el trabajo de mradermacher consiste en aplicar cuantización con calibración por matriz de importancia (imatrix) sobre los pesos en precisión completa publicados por el autor original. El modelo subyacente tiene 26.070.385.152 parámetros (aproximadamente 26.000 millones), lo que lo sitúa en la categoría de modelos densos de gran tamaño, aptos para hardware de gama alta o para despliegues con cuantizaciones agresivas en GPU de consumo.

El nombre sugiere una variante "abliterated" (eliminación de direcciones de rechazo mediante manipulación de pesos) y "healed" (un ajuste posterior para recuperar coherencia), una práctica habitual en la comunidad para producir modelos sin las capas de rechazo del alineamiento original. No obstante, la model card disponible no documenta el proceso, el modelo base original ni los datos de entrenamiento, por lo que estas inferencias deben tomarse con cautela.

La relevancia de esta ficha es fundamentalmente práctica: permite a desarrolladores evaluar rápidamente si esta familia de cuantizaciones encaja en su infraestructura. El repositorio ocupa 11,0 GB e incluye un conjunto amplio de cuantizaciones que van desde IQ1_S hasta Q6_K, lo que abarca desde despliegues muy comprimidos en CPU hasta configuraciones de mayor fidelidad en GPU. La información pública es escasa y no se han publicado benchmarks ni detalles de arquitectura más allá del recuento de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer denso, inferido por el recuento de parámetros; no confirmado en la model card) |
| Parametros totales | 26.070.385.152 |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small-IQ4_NL) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en la documentación proporcionada. El recuento de 26.070 millones de parámetros, obtenido de los pesos en safetensors del modelo original, indica un transformer denso de gran tamaño, pero no se confirma el tipo de atención, la función de activación, el tokenizador ni la longitud de contexto nativa. Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias.

Lo que sí está documentado es el proceso de cuantización: mradermacher aplica cuantización GGUF con calibración imatrix (matriz de importancia) sobre los pesos del modelo derrickNg1412/Inkling-2-Mini-Abliterated-Healed. Los metadatos de la model card indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma una conversión desde formato Hugging Face y una cuantización por tensor de salida. La etiqueta `nicoboss` en los metadatos sugiere el uso de una herramienta o pipeline de cuantización asociado a ese identificador, aunque no se detalla. No hay información sobre innovaciones técnicas como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo está orientado a diálogo multi-turno, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Razonamiento y generación de texto general: capacidad esperable por el tamaño (26.000 millones de parámetros), pero no verificada con benchmarks.
- Capacidades multilingües: no disponibles; no se documentan idiomas soportados.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no documentado; el repositorio no incluye proyector multimodal (`skip_mmproj` vacío, sin indicios de mmproj).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el formato GGUF es compatible con los endpoints de inferencia de Hugging Face.

## Casos de uso

- Despliegue local en estación de trabajo con GPU de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de 26.000 millones de parámetros en GPUs con 16-24 GB de VRAM, útil para prototipado y pruebas de concepto sin depender de la nube.
- Generación de texto conversacional autoalojada: con la etiqueta `conversational` y cuantizaciones Q5_K_M o Q6_K, puede montarse un servicio de chat interno con llama.cpp u Ollama, controlando los datos en la propia infraestructura.
- Evaluación comparativa de cuantizaciones: el repositorio incluye más de veinte variantes (desde IQ1_S hasta Q6_K), lo que permite medir el impacto de la compresión en perplejidad y calidad de salida sobre el mismo modelo base.
- Investigación sobre modelos "abliterated": útil para estudiar cómo la eliminación de direcciones de rechazo y el ajuste posterior ("healed") afectan al comportamiento del modelo en tareas sensibles, siempre en un entorno controlado y con las salvaguardas adecuadas.
- Inferencia en CPU con memoria limitada: las cuantizaciones IQ2 e IQ3 reducen el peso a un rango manejable para servidores sin GPU, a costa de una pérdida de calidad que debe validarse por tarea.
- Integración en pipelines de generación de texto por lotes: mediante llama.cpp o servidores compatibles con la API de OpenAI, para tareas de resumen, reescritura o clasificación textual donde la latencia no sea crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según el tamaño del archivo GGUF y el overhead de contexto):
  - IQ1_S / IQ2_XXS: en torno a 7-8 GB.
  - Q3_K_M / IQ3_M: en torno a 11-13 GB.
  - Q4_K_M / IQ4_XS: en torno a 15-17 GB.
  - Q5_K_M: en torno a 18-19 GB.
  - Q6_K: en torno a 21-22 GB.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de alta concurrencia con cuantizaciones Q5/Q6; RTX 4090 (24 GB) para Q4_K_M, Q5_K_M y Q6_K en single-GPU; RTX 3090 (24 GB) equivalente.
- GPU de consumo: sí cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB, solo cuantizaciones Q3 o inferiores) y GPUs de 24 GB para Q4-Q6. En GPUs de 12-16 GB solo son viables IQ2/IQ3 con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de OpenAI (por la etiqueta `endpoints_compatible`), y potencialmente vLLM si soporta el formato GGUF de este modelo (no confirmado).
- Latencia y throughput: no disponibles; dependen de la cuantización, el hardware y la longitud de contexto, ninguno de los cuales está documentado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye detalles del modelo base original (derrickNg1412/Inkling-2-Mini-Abliterated-Healed) ni de sus alternativas, por lo que no es posible establecer una comparación rigurosa con modelos de la misma categoría (por ejemplo, otros modelos densos de ~26.000 millones de parámetros). Se recomienda consultar la model card del modelo base para obtener datos de arquitectura, contexto y licencia antes de comparar.

## Limitaciones y advertencias

- La model card no documenta licencia: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base original antes de cualquier despliegue en producción.
- El modelo es una variante "abliterated": se ha manipulado para eliminar direcciones de rechazo, lo que puede aumentar el riesgo de generar contenido inapropiado, sesgado o dañino. No debe desplegarse en aplicaciones orientadas al público sin filtros y salvaguardas adicionales.
- Riesgo de alucinación: no cuantificado; al no haber benchmarks publicados, no puede estimarse la fiabilidad factual del modelo.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no disponible: limita la planificación de casos de uso con documentos largos o conversaciones extensas.
- Las cuantizaciones IQ1/IQ2 introducen pérdida de calidad significativa; deben validarse por tarea antes de usarse en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- El nombre del modelo y la ausencia de documentación dificultan la trazabilidad del origen de los datos de entrenamiento y de los posibles sesgos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Inkling-2-Mini-Abliterated-Healed-i1-GGUF
- Modelo base (referenciado en la model card): https://huggingface.co/derrickNg1412/Inkling-2-Mini-Abliterated-Healed
