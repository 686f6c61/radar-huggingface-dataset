# CharlieBT/kd31-ta5h

## Resumen

CharlieBT/kd31-ta5h es un modelo de 31.273.088.876 parámetros (aproximadamente 31,3 mil millones) publicado en Hugging Face por el usuario CharlieBT. Se distribuye como un merge de tres modelos base —danyloooah/reax-g2-soup2, draven123/sn92-gen-r2-k6 y whynotBeTop/gemma4-31b-choice-ft—, todos ellos derivados de la familia Gemma 4 según los tags de la ficha. El pipeline declarado es `text-classification`, aunque los tags incluyen también `image-text-to-text`, lo que sugiere capacidades multimodales heredadas de la arquitectura base.

El modelo resuelve, en principio, tareas de clasificación de texto y posible interacción imagen-texto, apoyándose en el conocimiento agregado de los tres modelos fusionados. Su relevancia es limitada en el ecosistema actual: cuenta con cero descargas y cero likes en el momento de la consulta, y el repositorio es de acceso restringido (gated), por lo que requiere aceptar condiciones en Hugging Face antes de poder descargarlo.

La información pública disponible es muy escasa: no se detallan idiomas soportados, composición del dataset de entrenamiento, resultados de benchmarks ni detalles de la fusión (algoritmo de merge, ratios, etc.). La ficha que sigue refleja únicamente lo que puede inferirse de los metadatos del repositorio y de los tags declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4 (según tags `gemma4`); detalles de la variante no disponibles |
| Parametros totales | 31.273.088.876 (~31,3 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 62,6 GB |
| Pipeline declarado | text-classification (tags adicionales: image-text-to-text) |
| Acceso | restringido (gated) |
| Modelos base | danyloooah/reax-g2-soup2, draven123/sn92-gen-r2-k6, whynotBeTop/gemma4-31b-choice-ft |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión (merge) de tres checkpoints: danyloooah/reax-g2-soup2, draven123/sn92-gen-r2-k6 y whynotBeTop/gemma4-31b-choice-ft. Los tags de Hugging Face indican que los tres se declaran como `base_model` y como `base_model:merge`, lo que confirma que a su vez son mezclas de otros modelos. La arquitectura subyacente es la de Gemma 4, según el tag `gemma4`, con aproximadamente 31,3 mil millones de parámetros en precisión completa (el repositorio ocupa 62,6 GB, coherente con pesos en bf16/fp16).

No se dispone de información sobre el algoritmo de fusión empleado (por ejemplo, SLERP, TIES, DARE, model soup), los ratios de mezcla, el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). Cualquier afirmación adicional sobre el entrenamiento sería especulativa y, por tanto, se omite.

## Capacidades

- Clasificación de texto: es el pipeline declarado en la ficha del modelo.
- Procesamiento imagen-texto: el tag `image-text-to-text` sugiere capacidad multimodal heredada de la familia Gemma 4, aunque no se documenta su alcance.
- Generación de texto: plausible por la arquitectura base, pero no confirmada explícitamente en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, visión o audio: no disponible más allá del tag multimodal.

## Casos de uso

- Clasificación de documentos en pipelines de datos: al declararse como `text-classification`, puede emplearse para etiquetar grandes volúmenes de texto (categorización de tickets, moderación, triaje), siempre que se valide su comportamiento con un conjunto de evaluación propio, dado que no hay benchmarks publicados.
- Etiquetado asistido en investigación: útil como modelo base para fine-tuning supervisado en tareas de clasificación específicas de dominio, aprovechando sus 31,3 B de parámetros como punto de partida.
- Experimentación con técnicas de model merging: sirve como caso de estudio para investigar cómo se comporta una fusión de tres checkpoints Gemma 4 en tareas downstream, comparándola con cada modelo base por separado.
- Procesamiento de pares imagen-texto: si se confirma la capacidad multimodal, podría emplearse en tareas de clasificación o descripción conjunta de imagen y texto, aunque requiere validación previa.
- Evaluación comparativa de modelos fusionados: útil en entornos académicos para medir la degradación o mejora que introduce el merge frente a los checkpoints originales.
- Prototipado interno con licencia permisiva: al estar bajo Apache 2.0, puede integrarse en prototipos comerciales internos una vez aceptadas las condiciones de acceso, sujeto a las obligaciones de atribución de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 62-65 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 80 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 32-35 GB; en 4 bits, en torno a 17-20 GB (estimaciones teóricas, no verificadas para este modelo concreto).
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (2× RTX 4090 24 GB en tensor parallel, por ejemplo).
- GPU de consumo: no cabe en una única RTX 4090 (24 GB) en precisión completa; requeriría cuantización agresiva (4 bits) y aun así podría ser ajustado.
- Opciones de despliegue: transformers es la vía declarada; vLLM, TGI o llama.cpp serían aplicables en principio, pero no hay artefactos GGUF publicados ni confirmación de compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CharlieBT/kd31-ta5h | ~31,3 B | no disponible | Apache 2.0 | gated, 0 descargas | Merge de 3 checkpoints Gemma 4 |
| danyloooah/reax-g2-soup2 (base) | no disponible | no disponible | no disponible | público (presumiblemente) | Uno de los checkpoints fusionados |
| draven123/sn92-gen-r2-k6 (base) | no disponible | no disponible | no disponible | público (presumiblemente) | Uno de los checkpoints fusionados |
| whynotBeTop/gemma4-31b-choice-ft (base) | ~31 B (por nombre) | no disponible | no disponible | público (presumiblemente) | Fine-tuning de Gemma 4 31B |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card detallada, benchmarks, ni descripción del proceso de fusión, lo que dificulta evaluar su calidad frente a los modelos base.
- Acceso restringido: requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en entornos automatizados o de investigación abierta.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: desconocidos, al no documentarse la composición del dataset ni los procesos de alineación.
- Idiomas: no se declaran idiomas soportados; el rendimiento multilingüe es incierto.
- Licencia Apache 2.0: permite uso comercial con obligaciones de atribución, pero conviene verificar que los modelos base no impongan restricciones adicionales (Gemma suele distribuirse bajo Gemma Terms of Use, no Apache 2.0, lo que genera una posible incompatibilidad que debe revisarse).
- Sin cuantizaciones publicadas: la ausencia de GGUF o AWQ limita el despliegue en hardware de consumo.
- Madurez: cero descargas y cero likes indican que el modelo no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieBT/kd31-ta5h
- Modelo base 1: https://huggingface.co/danyloooah/reax-g2-soup2
- Modelo base 2: https://huggingface.co/draven123/sn92-gen-r2-k6
- Modelo base 3: https://huggingface.co/whynotBeTop/gemma4-31b-choice-ft
