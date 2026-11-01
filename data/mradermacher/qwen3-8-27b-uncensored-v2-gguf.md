# mradermacher/Qwen3.8-27B-Uncensored-v2-GGUF

## Resumen

Qwen3.8-27B-Uncensored-v2-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo InterpreticAI/Qwen3.8-27B-Uncensored-v2, publicada por el usuario mradermacher. El modelo base es un transformer de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) derivado de la familia Qwen3.8, con la particularidad de haber sido sometido a un proceso de "descensura" orientado específicamente a eliminar el filtrado político (etiqueta `political-censorship`). La licencia declarada es Apache 2.0.

El repositorio no contiene los pesos originales en safetensors, sino únicamente los archivos GGUF necesarios para inferencia con llama.cpp y herramientas compatibles (Ollama, LM Studio, etc.), además de dos suplementos multimodales `mmproj` (Q8_0 y f16), lo que indica que el modelo base incorpora capacidad de visión. El tamaño total del repositorio es de 190,8 GB, correspondiente a la suma de todas las variantes de cuantización disponibles.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas cuantizaciones disponibles de un modelo de 27B orientado a la ausencia de censura política; por otro, advierte de que el modelo tiene cero descargas y cero likes en el momento de la consulta, creado el 1 de noviembre de 2026, lo que implica ausencia total de validación comunitaria. La información técnica sobre arquitectura, contexto o entrenamiento no está disponible en la model card del cuantizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8; detalles no disponibles) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 (estáticas; sin imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (solo cuantizaciones; sin safetensors en este repo) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base InterpreticAI/Qwen3.8-27B-Uncensored-v2 en la información proporcionada. Por el nombre y la etiqueta `qwen3.8` se infiere que deriva de la familia Qwen3.8, pero no se confirman número de capas, dimensión oculta, mecanismo de atención (estándar o lineal), ni si emplea mezcla de expertos. El recuento de parámetros (27,3B) sugiere un modelo denso, aunque no puede confirmarse.

Respecto al entrenamiento, la model card del cuantizador no incluye datos sobre número de tokens, composición del dataset, ni si hubo RLHF, DPO o fine-tuning adicional. La etiqueta `uncensored` y `political-censorship` indica que el modelo base fue modificado para reducir el rechazo de peticiones relacionadas con temas políticos, pero no se documenta la metodología (abliteration, fine-tuning con datos sin filtrar, etc.). Tampoco se detalla el proceso de cuantización más allá de indicar que son cuantizaciones estáticas y que no se han generado versiones con imatrix (weighted) en el momento de la publicación.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` y el pipeline declarado por el autor del modelo base.
- Capacidad multimodal: la presencia de archivos `mmproj` (Q8_0 y f16) indica soporte de entrada de imágenes, probablemente visión.
- Comportamiento "uncensored": menor probabilidad de rechazo ante peticiones sobre temas políticos o sensibles, según la intención declarada del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre sesgo y censura en modelos de lenguaje: el modelo permite estudiar cómo se comporta un LLM de 27B sin filtrado político, comparando respuestas con la versión original de Qwen3.8. Es adecuado por su tamaño manejable en una sola GPU de 80 GB en Q8_0 o en consumer de gama alta en Q4.
- Análisis de discurso político y generación de contraargumentos: útil para proyectos de investigación que necesitan que el modelo no rechace discutir temas políticos controvertidos, con la cautela de revisar cada salida.
- Despliegue local en estaciones de trabajo con llama.cpp u Ollama: la cuantización Q4_K_M (16,9 GB) cabe en GPUs consumer de 24 GB (RTX 3090/4090) y permite inferencia offline sin dependencia de API.
- Prototipado de asistentes conversacionales en inglés con requisitos de contexto moderado: el formato GGUF facilita integración rápida en aplicaciones de escritorio y servidores pequeños.
- Evaluación de cuantizaciones: al ofrecer 10 variantes (Q2_K a Q8_0), sirve para medir la degradación de calidad y el impacto en perplejidad según el nivel de cuantización en un modelo de 27B.
- Experimentos multimodales locales: los suplementos `mmproj` permiten probar entrada de imágenes con llama.cpp en un modelo de 27B, un tamaño poco habitual en el ecosistema GGUF multimodal.
- Fine-tuning posterior sobre dominio específico: al ser Apache 2.0 y estar disponible en GGUF, puede servir como base para destilación o como referencia de comportamiento, aunque para reentrenamiento convendría el repo original en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - Q2_K: ~11,0 GB
  - Q3_K_S: ~12,4 GB
  - Q3_K_M: ~13,6 GB
  - Q3_K_L: ~14,7 GB
  - Q4_K_S: ~15,9 GB
  - Q4_K_M: ~16,9 GB
  - Q5_K_S: ~19,1 GB
  - Q5_K_M: ~19,6 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
  - Suplemento multimodal: +0,7 GB (mmproj-Q8_0) o +1,0 GB (mmproj-f16)
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 con contexto largo; RTX 4090/3090 (24 GB) para Q4_K_M y Q5_K_M; GPUs de 16 GB solo con Q2_K/Q3_K_S y contexto reducido.
- Cabe en consumer GPU: sí, en RTX 4090/3090 con Q4_K_M o Q5_K_M; en RTX 4080/4070 Ti (16 GB) solo con cuantizaciones Q2_K o Q3_K_S y contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. No se indica soporte para vLLM o TGI en formato GGUF (requerirían el repo original en safetensors).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v2 (este, GGUF) | 27,3B | no disponible | Apache 2.0 | GGUF | Cuantizado por mradermacher; 0 descargas; sin benchmarks |
| InterpreticAI/Qwen3.8-27B-Uncensored-v2 | 27,3B | no disponible | Apache 2.0 | safetensors (presumible) | Modelo base original; misma licencia |
| Qwen3.8-27B (original, si existe) | 27,3B (presumible) | no disponible | no disponible | no disponible | Referencia de la familia; no confirmado en la información |
| Otras cuantizaciones GGUF de 27B | ~27B | variable | variable | GGUF | No se dispone de comparativas concretas en la información |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- El modelo está etiquetado como "uncensored" y orientado a eliminar censura política: puede generar contenido político sesgado, ofensivo o desinformativo. Requiere revisión humana en cualquier uso público.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de fidelidad factual ni benchmarks.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria, sin reportes de calidad y sin garantía de que las cuantizaciones funcionen correctamente.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base podría incorporar restricciones adicionales no reflejadas en la model card del cuantizador; conviene revisar el repo original.
- El proceso de "descensura" puede degradar capacidades generales (razonamiento, código, matemáticas) respecto al modelo original; no hay datos que lo confirmen o descarten.
- Las cuantizaciones son estáticas y sin imatrix; la calidad en Q2_K y Q3_K_S puede ser notablemente inferior a Q4_K_M o superiores.
- El repositorio ocupa 190,8 GB; la descarga completa no es necesaria, pero conviene seleccionar una sola variante.
- No se documenta el proceso de cuantización ni la versión de llama.cpp requerida; la compatibilidad con runtimes antiguos no está garantizada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-v2-GGUF
- Modelo base: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v2
- Página de overview del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-v2-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
