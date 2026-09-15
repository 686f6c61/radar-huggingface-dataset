# mradermacher/MIREL-4B-GGUF

## Resumen

MIREL-4B-GGUF es una redistribución en formato GGUF del modelo luo352/MIREL-4B, publicada por el usuario mradermacher, conocido por generar cuantizaciones estáticas de modelos abiertos para su uso con llama.cpp y derivados. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint original a una familia de ficheros GGUF con distintos niveles de compresión (de Q2_K a f16), lo que permite desplegar un modelo de 4.205.751.296 parámetros en hardware de consumo sin necesidad de GPU dedicada.

El interés práctico de esta publicación radica en el catálogo de cuantizaciones: catorce ficheros que abarcan desde 2,0 GB (Q2_K) hasta 8,5 GB (f16), más dos suplementos multimodales mmproj (Q8_0 de 0,5 GB y f16 de 0,8 GB). La presencia de estos ficheros mmproj indica que el modelo base incorpora algún tipo de proyección multimodal, presumiblemente visión, aunque la model card no lo detalla.

La información pública disponible es muy limitada: el repositorio acumula 0 descargas y 0 likes en el momento del registro, no declara licencia y la model card se limita a la plantilla estándar de mradermacher. La búsqueda web realizada no ha devuelto ninguna fuente relevante sobre el modelo, por lo que buena parte de los apartados siguientes quedan marcados como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 4.205.751.296 (dato real de safetensors) |
| Parámetros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; suplementos mmproj en f16 y Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (transformers y llama.cpp); el modelo base luo352/MIREL-4B se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF, DPO u otros) del modelo luo352/MIREL-4B. La única etiqueta estructural disponible en el repositorio es la de modelo conversacional ("conversational"), y no hay papers, blogs técnicos ni notas de versión publicados por el autor original.

Respecto al proceso de conversión, la model card de mradermacher indica los metadatos internos de su pipeline: `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`. Se trata de cuantizaciones estáticas; el autor señala explícitamente que las cuantizaciones ponderadas con imatrix no estaban disponibles en el momento de la publicación y que no tiene previsto generarlas salvo petición en la sección de discusiones de la comunidad. La inclusión de ficheros mmproj sugiere que la conversión conserva la torre multimodal del modelo base, pero no se especifica qué modalidad adicional maneja ni cómo se integra.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como "conversational", lo que implica plantilla de chat y orientación a diálogo multi-turno.
- Capacidades multimodales: la presencia de ficheros `MIREL-4B.mmproj-f16.gguf` y `MIREL-4B.mmproj-Q8_0.gguf` apunta a soporte de entrada multimodal (previsiblemente imagen) en el modelo base, aunque la model card no lo confirma ni detalla.
- Idiomas: únicamente inglés según la etiqueta `language: en` de la model card.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`, lo que indica que puede servirse a través de la infraestructura de Inference Endpoints de HuggingFace.
- Tool calling, function calling y razonamiento multi-paso en agentes: no disponible.
- Modo de razonamiento explícito ("thinking mode"), audio u otras capacidades especiales: no disponible.

## Casos de uso

Debido a la ausencia de documentación técnica y de benchmarks del modelo base, los siguientes escenarios son aplicaciones plausibles para un modelo conversacional en inglés de 4.200 millones de parámetros cuantizado a GGUF, no capacidades verificadas por el autor:

- Asistente conversacional local en inglés: con el fichero Q4_K_M (2,8 GB) el modelo puede ejecutarse íntegramente en una GPU de consumo o incluso en CPU, lo que permite montar un chatbot privado sin enviar datos a servicios externos.
- Prototipado rápido en portátiles: la cuantización Q3_K_S (2,2 GB) se ajusta a equipos con 8 GB de RAM o GPUs integradas, útil para validar flujos de conversación antes de invertir en hardware mayor.
- Documentación y resumen de texto en inglés: al ser un modelo exclusivamente anglófono, encaja en pipelines de resumen de documentación técnica, correos o informes redactados en ese idioma.
- Despliegue en el borde o en entornos sin GPU: llama.cpp y Ollama permiten servir el GGUF en una Raspberry Pi o un mini-PC; el fichero Q2_K de 2,0 GB es el candidato para entornos con memoria muy restringida.
- Generación asistida en editores de código o herramientas de escritura: con el fichero f16 (8,5 GB) o Q8_0 (4,6 GB) se obtiene la máxima fidelidad respecto al modelo original para tareas de autocompletado y redacción asistida.
- Evaluación comparativa de cuantizaciones: este repositorio ofrece una escalera completa de niveles de compresión (de Q2_K a f16) sobre el mismo modelo, lo que permite medir empíricamente la degradación de calidad en función del tamaño de fichero.
- Experimentación multimodal: si el modelo base confirma la capacidad de visión a través de los ficheros mmproj, podría emplearse en tareas de descripción de imágenes o respuesta a preguntas sobre documentos escaneados en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del repositorio GGUF ni las fuentes recuperadas en la búsqueda web incluyen valores de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación. Tampoco se dispone de comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

Los tamaños de fichero son datos reales del repositorio; las recomendaciones de VRAM son estimaciones basadas en dichos tamaños más el espacio necesario para la caché de clave-valor, y deben tomarse como orientativas:

- VRAM estimada según cuantización (solo pesos): Q2_K ≈ 2,0 GB; Q3_K_S ≈ 2,2 GB; Q3_K_M ≈ 2,4 GB; Q3_K_L ≈ 2,5 GB; IQ4_XS ≈ 2,6 GB; Q4_K_S ≈ 2,7 GB; Q4_K_M ≈ 2,8 GB; Q5_K_S ≈ 3,1 GB; Q5_K_M ≈ 3,2 GB; Q6_K ≈ 3,6 GB; Q8_0 ≈ 4,6 GB; f16 ≈ 8,5 GB. Hay que sumar entre 0,5 y 2 GB adicionales para la caché KV según el contexto configurado.
- Suplementos multimodales: `mmproj-Q8_0.gguf` añade 0,5 GB y `mmproj-f16.gguf` añade 0,8 GB cuando se activa la entrada multimodal.
- GPU de gama de consumo: el modelo cabe sin problema en tarjetas con 8 GB de VRAM (RTX 3060 Ti, RTX 2070, RTX 4060) usando cuantizaciones de Q4_K_M a Q6_K; las cuantizaciones Q2_K a Q3_K_L caben incluso en GPUs de 4-6 GB.
- GPU profesionales: A100, H100 o L40S no son necesarias para un modelo de este tamaño; se emplearían únicamente para servir muchas peticiones concurrentes o contextos muy largos.
- CPU y memoria del sistema: con cuantizaciones Q4 los pesos ocupan menos de 3 GB, por lo que es viable la inferencia en CPU con 8-16 GB de RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. Para el formato safetensors original serían aplicables vLLM o TGI.
- Latencia y throughput: no disponible; no se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos verificados sobre modelos comparables en la información proporcionada, ya que la búsqueda web no devolvió ninguna fuente relacionada con MIREL-4B ni con alternativas de su misma categoría. La siguiente tabla recoge únicamente los datos confirmados de este modelo:

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/MIREL-4B-GGUF | 4.205.751.296 | no disponible | no disponible | GGUF (12 cuantizaciones + 2 mmproj) | HuggingFace, 0 descargas |
| Alternativas de ~4B en GGUF | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, ni tampoco se ha podido confirmar la del modelo base luo352/MIREL-4B. Sin una licencia explícita, el uso comercial queda en una zona legal indeterminada y se recomienda contactar con los autores antes de integrarlo en un producto.
- Idioma: el modelo está etiquetado únicamente como inglés (`language: en`). Se desconoce su comportamiento en castellano y es probable que la calidad en otros idiomas sea muy inferior.
- Ausencia total de documentación: no hay paper, ficha técnica, datos de entrenamiento ni evaluación publicada. Cualquier afirmación sobre sus capacidades parte de la etiqueta "conversational" y de la existencia de ficheros multimodales, no de evidencia empírica.
- Riesgo de alucinación: no cuantificado. Al no existir benchmarks de fiabilidad, se desconoce la tasa de respuestas incorrectas o inventadas.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes, y no hay verificación de terceros sobre la fidelidad de la conversión respecto al modelo original. Las cuantizaciones de baja precisión (Q2_K, Q3_K) degradan la calidad de forma notable según la gráfica comparativa de perplejidad enlazada por el propio autor.
- Cuantizaciones ponderadas ausentes: el autor advierte de que no ha generado cuantizaciones con imatrix, lo que en modelos pequeños puede suponer una pérdida de calidad adicional frente a alternativas ponderadas.
- Contexto desconocido: sin la longitud de contexto declarada, no se puede planificar su uso en tareas que requieran ventanas largas.
- Multimodalidad sin confirmar: los ficheros mmproj sugieren capacidad multimodal, pero no hay documentación que describa qué modalidad acepta ni cómo configurarla.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/MIREL-4B-GGUF
- Modelo base: https://huggingface.co/luo352/MIREL-4B
- Página de resumen y descargas del autor: https://hf.tst.eu/model#MIREL-4B-GGUF
- Peticiones de modelos al autor: https://huggingface.co/mradermacher/model_requests
- Gráfica comparativa de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF

Nota: la búsqueda web realizada no devolvió ninguna fuente relacionada con MIREL-4B; los resultados obtenidos fueron páginas sin relación con el modelo (Zhihu y Baidu Jingyan sobre Outlook y Microsoft Store).
