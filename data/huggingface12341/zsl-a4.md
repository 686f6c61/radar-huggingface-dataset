# huggingface12341/zsl-a4

## Resumen

`zsl-a4` es un modelo de extracción de características publicado por el usuario `huggingface12341` en Hugging Face, derivado de una fusión por aritmética de tareas (*task arithmetic*) sobre el pool d3-lite de la subred Zils 127. El modelo combina los pesos de `joamCriff123/zils-lite-l1121a` y `hindsight-ai/hs-decide-1-flash`, tomando como referencia parental `Qwen/Qwen3.5-0.8B`, y conserva la torre de visión procedente del *soup* original. Con 852.985.920 parámetros totales y un repositorio de 1,7 GB, se posiciona en la franja de los modelos sub-1B.

La relevancia del modelo es limitada y experimental: se trata de un *merge* de pesos sin model card sustantiva, sin datos de entrenamiento documentados y sin resultados de benchmarks publicados. Su pipeline declarado es `feature-extraction`, no generación de texto, y las etiquetas incluyen `decision-model`, `zils` y `d3-lite`, lo que sugiere un uso previsto como extractor de representaciones o componente de decisión dentro de un sistema mayor, más que como modelo conversacional autónomo.

A fecha de la información disponible, el modelo registra 0 descargas y 0 *likes*, fue creado el 22 de noviembre de 2026 y actualizado un minuto después, lo que indica una publicación reciente y sin validación comunitaria. Cualquier evaluación de producción debe tratarse como provisional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5-0.8B (torre de visión + pesos de lenguaje); detalles exactos no disponibles |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión por aritmética de tareas descrita en la model card como «current soup + (find − Qwen/Qwen3.5-0.8B) sobre los pesos de lenguaje; torre de visión del soup». En la práctica, esto implica aplicar una resta de vectores de tarea (el delta entre el modelo *find* y el Qwen3.5-0.8B de referencia) sobre un *soup* previo de pesos, un procedimiento habitual en la comunidad de *model merging* para transferir o amplificar una habilidad concreta sin reentrenar. La torre de visión se hereda intacta del *soup*, lo que confirma la naturaleza multimodal del modelo base.

No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado. Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal. Los tres modelos fuente (`joamCriff123/zils-lite-l1121a`, `hindsight-ai/hs-decide-1-flash` y el parental `Qwen/Qwen3.5-0.8B`) están declarados como Apache-2.0, lo que permite la redistribución del merge bajo la misma licencia.

## Capacidades

- Extracción de características y representaciones: es el pipeline declarado (`feature-extraction`), por lo que su uso principal esperado es generar embeddings o estados ocultos, no texto libre.
- Modelo de decisión: las etiquetas `decision-model` y `d3-lite` apuntan a un componente para tareas de clasificación o selección dentro de un pipeline.
- Procesamiento multimodal: la conservación de la torre de visión del *soup* sugiere capacidad de procesar entradas de imagen, aunque no se detalla la interfaz ni el preprocesado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declara lista de idiomas).
- Modo *thinking* o razonamiento explícito: no disponible.
- Generación de texto: no confirmada; el pipeline declarado no es `text-generation`.

## Casos de uso

- Extracción de embeddings para búsqueda semántica: al estar etiquetado como `feature-extraction`, puede emplearse para vectorizar documentos o imágenes y alimentar un índice vectorial; su tamaño sub-1B permite inferencia en CPU o GPU modesta.
- Componente de decisión en pipelines de clasificación: las etiquetas `decision-model` y `d3-lite` lo sitúan como candidato para tareas de *routing* o selección entre opciones dentro de un sistema mayor, siempre que se valide su comportamiento con datos propios.
- Prototipado de sistemas multimodales: la torre de visión heredada permite experimentar con pipelines imagen-texto en entornos de investigación con recursos limitados.
- Filtrado y *reranking* de candidatos: sus representaciones pueden usarse para reordenar resultados de un recuperador previo en un sistema RAG, aunque requeriría una cabeza de clasificación adicional no incluida.
- Investigación en *model merging*: sirve como caso de estudio reproducible de aritmética de tareas sobre Qwen3.5-0.8B, útil para analizar cómo se propagan las habilidades tras la fusión.
- Despliegue en entornos con restricciones de memoria: con 853 M de parámetros y pesos safetensors, cabe en GPUs de consumo y en CPU, lo que facilita pruebas de concepto sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,4 GB (852.985.920 parámetros × 4 bytes), más overhead de activaciones.
- VRAM estimada en fp16/bf16: aproximadamente 1,7 GB, coherente con el tamaño del repositorio (1,7 GB).
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,85 GB; en 4 bits, aproximadamente 0,43 GB (estimaciones teóricas, no se distribuyen variantes cuantizadas oficiales).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16, como RTX 3060, RTX 4060, RTX 4090, A100 o H100; también viable en CPU para lotes pequeños.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs dedicadas actuales e incluso en iGPUs con memoria compartida suficiente.
- Opciones de despliegue: `transformers` es la librería declarada; el tag `custom_code` obliga a confiar en código remoto (`trust_remote_code=True`), lo que exige revisión previa del mismo. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo de generación estas herramientas podrían no ser aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Pipeline | Disponibilidad |
|---|---|---|---|---|---|
| `zsl-a4` | 852.985.920 | no disponible | Apache-2.0 | feature-extraction | Hugging Face, 0 descargas |
| `Qwen/Qwen3.5-0.8B` (parental) | ~0,8 B | no disponible | Apache-2.0 | no disponible | Hugging Face, modelo de referencia |
| `hindsight-ai/hs-decide-1-flash` (fuente) | no disponible | no disponible | Apache-2.0 | no disponible | Hugging Face |
| `joamCriff123/zils-lite-l1121a` (fuente) | no disponible | no disponible | Apache-2.0 | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que no debe asumirse un rendimiento equiparable al Qwen3.5-0.8B original.
- Model card mínima: no se documentan datos de entrenamiento, composición del dataset ni proceso de evaluación, lo que impide auditar sesgos.
- Riesgo de alucinación: no evaluable al no confirmarse capacidades generativas; en tareas de extracción el riesgo se traslada a representaciones poco fiables.
- Idiomas no declarados: se desconoce si conserva el multilingüismo del modelo parental.
- `custom_code`: requiere `trust_remote_code=True`, con el riesgo de seguridad asociado a ejecutar código no auditado; conviene revisar los ficheros remotos antes de cargar el modelo.
- Licencia Apache-2.0: permite uso comercial y modificación, pero obliga a conservar avisos de licencia y a declarar cambios; los modelos fuente deben verificarse individualmente.
- Sin validación comunitaria: 0 descargas y 0 *likes* en el momento de la consulta; el modelo es un artefacto experimental sin soporte.
- Naturaleza de *merge*: la aritmética de tareas puede degradar habilidades no objetivo; se recomienda una evaluación específica antes de cualquier uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huggingface12341/zsl-a4
- Modelo base parental: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Fuente del merge: https://huggingface.co/joamCriff123/zils-lite-l1121a
- Fuente del merge: https://huggingface.co/hindsight-ai/hs-decide-1-flash
