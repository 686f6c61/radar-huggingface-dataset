# mradermacher/Gemma-4-GemClone-31B-i1-GGUF

## Resumen

Gemma-4-GemClone-31B-i1-GGUF es una cuantización en formato GGUF del modelo fusionado Ateron/Gemma-4-GemClone-31B, publicada por el usuario mradermacher. El modelo original es un merge construido con mergekit a partir de la familia Gemma 4 de Google, orientado a roleplay y conversación, con un total de 30.697.345.596 parámetros (aproximadamente 31B). Esta versión concreta ofrece cuantizaciones con imatrix (etiquetadas i1) que permiten ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados.

La relevancia de esta ficha radica en que el repositorio es una distribución práctica: no introduce cambios arquitectónicos respecto al modelo base, sino que proporciona un conjunto amplio de cuantizaciones (desde IQ1_S de 7,3 GB hasta Q6_K de 25,3 GB) con el objetivo de maximizar la calidad por bit. El modelo está etiquetado como vision model en la model card, aunque los ficheros mmproj se alojan en el repositorio estático hermano.

La licencia declarada es Apache 2.0 y el idioma soportado según los metadatos es únicamente inglés. No se dispone de información sobre contexto máximo, composición del dataset de entrenamiento ni resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4); detalles específicos no disponibles |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix incluido) |

## Arquitectura y entrenamiento

El modelo base es un merge generado con mergekit (según las etiquetas del repositorio) a partir de la familia Gemma 4, lo que implica una arquitectura transformer decoder-only. No se dispone de información sobre la estrategia exacta de fusión (por ejemplo, SLERP, TIES o DARE), ni sobre los checkpoints de origen empleados en el merge.

Respecto al entrenamiento, la información disponible no detalla el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. La etiqueta roleplay sugiere un ajuste orientado a conversación y personajes, pero no se documenta el proceso. La contribución técnica de esta ficha es la cuantización con imatrix (importancia matricial) mediante la herramienta de mradermacher, que genera los ficheros i1 con el objetivo de mejorar la relación calidad/tamaño frente a las cuantizaciones estáticas, que se publican por separado en el repositorio Gemma-4-GemClone-31B-GGUF.

## Capacidades

- Generación de texto conversacional y roleplay, según la etiqueta del modelo.
- Capacidad de visión declarada en la model card (los ficheros mmproj, si existen, están en el repositorio estático).
- Soporte multilingüe limitado al inglés según los metadatos.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Roleplay y personajes conversacionales: el modelo está etiquetado explícitamente para roleplay, por lo que puede emplearse en entornos de chat con personalidad definida mediante system prompt, ejecutándose localmente con llama.cpp en cuantización Q4_K_M (18,8 GB).
- Asistente conversacional local en inglés: con la cuantización i1-Q4_K_S (17,9 GB) cabe en GPUs de 24 GB y permite desplegar un asistente privado sin dependencia de API externa.
- Prototipado de chatbots en estaciones de trabajo: la versión i1-IQ3_M (14,5 GB) permite iterar rápido en una RTX 4090 o A6000 con buena calidad relativa.
- Evaluación de merges para investigación: útil para estudiar el comportamiento de fusiones de la familia Gemma 4 y comparar la calidad de las cuantizaciones i1 frente a las estáticas del repositorio hermano.
- Experimentación con visión (si se descargan los mmproj del repositorio estático): tareas de descripción de imágenes o VQA en inglés, sujetas a verificación de que el proyector esté disponible.
- Despliegue en servidores con CPU y RAM abundante: las cuantizaciones IQ2 (8,8-11 GB) permiten ejecución en CPU con llama.cpp para pruebas de concepto, aceptando la pérdida de calidad indicada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño del fichero GGUF más overhead de contexto):
  - i1-IQ1_S: ~7,3 GB
  - i1-IQ2_M: ~11,0 GB
  - i1-IQ3_M: ~14,5 GB
  - i1-Q4_K_S: ~17,9 GB
  - i1-Q4_K_M: ~18,8 GB
  - i1-Q5_K_M: ~21,9 GB
  - i1-Q6_K: ~25,3 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_S; A6000, L40S o A100 40 GB para Q5_K_M y Q6_K; H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, desde RTX 3090/4090 (24 GB) con cuantizaciones Q4 y Q5; en GPUs de 16 GB solo con IQ2/IQ3 y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-GemClone-31B-i1-GGUF (este) | 30,7B | no disponible | Apache 2.0 | GGUF i1 | Merge orientado a roleplay, solo inglés |
| Gemma-4-GemClone-31B-GGUF (estático) | 30,7B | no disponible | Apache 2.0 | GGUF estático | Mismo modelo base, cuantizaciones sin imatrix; incluye mmproj |
| Ateron/Gemma-4-GemClone-31B | 30,7B | no disponible | Apache 2.0 | safetensors | Modelo base del merge, sin cuantizar |
| Modelos Gemma 4 originales de Google | no disponible | no disponible | no disponible | safetensors | Referencia de la familia; datos no verificados en esta información |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al ser un merge sin model card detallada, no hay evaluación de sesgos publicada.
- Riesgo de alucinación: no cuantificado; los modelos conversacionales sin benchmarks publicados requieren validación propia antes de producción.
- Limitación de idioma: los metadatos indican únicamente inglés; el rendimiento en castellano no está garantizado.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con ventanas largas sin pruebas previas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los checkpoints fusionados, no documentadas aquí.
- Calidad de cuantizaciones extremas: el propio autor advierte que IQ1_S es "for the desperate" y Q2_K_S es de "very low quality"; no se recomiendan para producción.
- Visión: la model card indica que es un modelo de visión, pero los ficheros mmproj no están en este repositorio; sin ellos, las capacidades multimodales no están operativas.
- Fecha de creación (2026-11-24) y ausencia de likes/descargas moderadas (3.880 descargas): ecosistema limitado, poca validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma-4-GemClone-31B-i1-GGUF
- Modelo base: https://huggingface.co/Ateron/Gemma-4-GemClone-31B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Gemma-4-GemClone-31B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Gemma-4-GemClone-31B-i1-GGUF
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
