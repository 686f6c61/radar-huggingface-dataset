# amorsi/micro-sam-vit-t-em-organelles

## Resumen

`micro-sam vit_t_em_organelles` es un checkpoint de segmentación de imágenes preentrenado para microscopía electrónica (EM), publicado como espejo en HuggingFace por el usuario `amorsi`. El modelo original forma parte del proyecto [micro-sam](https://github.com/computational-cell-analytics/micro-sam), desarrollado por el Computational Cell Analytics group, que adapta la arquitectura Segment Anything Model (SAM) al dominio de imagen biomédica y, en particular, a la segmentación de orgánulos celulares en imágenes de microscopía electrónica.

El modelo emplea la variante compacta ViT-T (Vision Transformer Tiny) de SAM, con un codificador de imagen ligero y un decodificador de máscaras entrenado específicamente para estructuras subcelulares en EM. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma que se trata de la variante tiny y no de los checkpoints ViT-B o ViT-L. Se distribuye como pesos PyTorch (`model.pt` y `decoder.pt`) y se consume a través de la API de micro-sam indicando `model_type="vit_t_em_organelles"`.

Su relevancia radica en que ofrece un modelo de segmentación listo para usar en flujos de análisis de imágenes de microscopía electrónica sin necesidad de reentrenar, con un tamaño reducido que permite inferencia en hardware modesto. Es, por tanto, una pieza útil para pipelines de biología celular cuantitativa, aunque su alcance es muy específico y no cubre tareas de texto, código ni razonamiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segment Anything Model (SAM) con codificador ViT-Tiny y decodificador de máscaras |
| Parametros totales | no disponible (variante ViT-T de SAM, del orden de decenas de millones; cifra exacta no publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; resolución de entrada no especificada en la información disponible) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, sin variantes GGUF/ONNX documentadas) |
| Idiomas soportados | no aplica (modelo de segmentación de imágenes) |
| Licencia | no disponible en el repo; el código de micro-sam es MIT, pero la licencia de los pesos debe consultarse en la fuente original |
| Formato de pesos | PyTorch (`model.pt` y `decoder.pt`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SAM: un codificador de imagen basado en Vision Transformer que produce embeddings de la imagen, y un decodificador de máscaras que, a partir de prompts (puntos, cajas o máscaras), genera las segmentaciones correspondientes. En esta variante el codificador es ViT-Tiny, la versión más pequeña de la familia, lo que reduce coste computacional y huella de memoria a cambio de menor capacidad que ViT-B o ViT-L.

El checkpoint `vit_t_em_organelles` corresponde a un preentrenamiento específico de micro-sam sobre datos de microscopía electrónica para segmentación de orgánulos. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de ajuste fino supervisado, RLHF o DPO (no aplicables en este dominio). Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. El autor indica que es una copia no modificada del checkpoint original y que los hashes xxh128 coinciden con el registro de `util.py` del repositorio de micro-sam.

## Capacidades

- Segmentación de imágenes de microscopía electrónica mediante prompts (puntos, cajas o máscaras de entrada).
- Segmentación de orgánulos celulares, especialidad declarada del checkpoint (`em_organelles`).
- Segmentación interactiva: el decodificador acepta prompts del usuario para refinar máscaras.
- Integración con la librería micro-sam mediante `model_type="vit_t_em_organelles"`.
- No soporta generación de texto, código, matemáticas, visión general, tool calling, agentes ni capacidades multilingües.
- No dispone de modo de razonamiento (thinking mode), audio ni vídeo.

## Casos de uso

- Segmentación de orgánulos en imágenes de microscopía electrónica: el modelo genera máscaras de estructuras subcelulares a partir de prompts, lo que permite cuantificar área, número y distribución de orgánulos en muestras de EM.
- Análisis de imágenes de tomografía electrónica: al ser un modelo ligero, puede aplicarse por secciones o volúmenes con recursos moderados, facilitando la reconstrucción y el etiquetado de estructuras.
- Anotación asistida en laboratorio: investigadores pueden usar el modelo para preanotar orgánulos y corregir después manualmente, reduciendo el tiempo de etiquetado frente a la anotación desde cero.
- Integración en pipelines de biología celular cuantitativa: micro-sam expone una API que permite encadenar segmentación, extracción de características y análisis estadístico en scripts de Python.
- Prototipado en hardware modesto: al tratarse de la variante ViT-T, es adecuado para pruebas en estaciones de trabajo con GPU de gama media o incluso CPU, antes de escalar a checkpoints mayores.
- Docencia y formación en segmentación biomédica: sirve como ejemplo práctico de adaptación de SAM a un dominio especializado con un coste computacional bajo.
- Control de calidad de datasets de EM: el modelo puede usarse para detectar y segmentar estructuras de forma masiva y comparar con anotaciones existentes para detectar inconsistencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repo (0,1 GB) y la variante ViT-T, se espera un consumo bajo, del orden de pocos GB, aunque la cifra exacta no está documentada.
- GPU recomendadas: no disponible. Por la variante tiny, es plausible su uso en GPUs consumer como RTX 3060/4060 o superiores, pero no hay confirmación oficial.
- ¿Cabe en GPU consumer? Muy probablemente sí, dada la variante ViT-T y el tamaño de los pesos, aunque no se documenta en la información proporcionada.
- Opciones de despliegue: la vía documentada es la librería micro-sam (PyTorch). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| micro-sam vit_t_em_organelles | ViT-T (cifra exacta no disponible) | no aplica | Segmentación EM de orgánulos | no disponible (código micro-sam MIT) | HuggingFace (espejo) y registro micro-sam |
| micro-sam vit_b_em_organelles | ViT-B (cifra exacta no disponible) | no aplica | Segmentación EM de orgánulos | no disponible | Registro micro-sam |
| SAM original (ViT-T) | ViT-T | no aplica | Segmentación de imágenes generales | Apache 2.0 (SAM original) | Meta AI |
| SAM original (ViT-B) | ViT-B | no aplica | Segmentación de imágenes generales | Apache 2.0 (SAM original) | Meta AI |

La comparación se basa en la familia de checkpoints de micro-sam y en SAM original; no se dispone de datos de rendimiento comparativo publicados en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en segmentación de imágenes de microscopía electrónica; no es un modelo de lenguaje ni de propósito general.
- No se documentan sesgos conocidos, pero al entrenarse sobre un dominio concreto puede generalizar mal a otros tipos de microscopía o de muestra.
- Riesgo de alucinación en el sentido de generar máscaras plausibles pero incorrectas en regiones ambiguas o de bajo contraste; requiere validación humana en producción.
- La licencia de los pesos no está indicada en el repo; el autor remite a la fuente original. El código de micro-sam es MIT, pero eso no implica necesariamente que los pesos lo sean. Es imprescindible verificar antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma fecha; es un espejo sin validación comunitaria.
- No hay información sobre resolución de entrada, número de parámetros exacto ni requisitos de hardware, lo que dificulta planificar el despliegue.
- No soporta texto, código, tool calling ni agentes; cualquier caso de uso en esos ámbitos queda fuera de su alcance.

## Enlaces

- HuggingFace: https://huggingface.co/amorsi/micro-sam-vit-t-em-organelles
- Repositorio micro-sam: https://github.com/computational-cell-analytics/micro-sam
- Registro de checkpoints (util.py): https://github.com/computational-cell-analytics/micro-sam/blob/master/micro_sam/util.py
- Pesos `model.pt`: https://uk1s3.embassy.ebi.ac.uk/public-datasets/bioimage.io/greedy-whale/1/files/vit_t.pt
- Pesos `decoder.pt`: https://uk1s3.embassy.ebi.ac.uk/public-datasets/bioimage.io/greedy-whale/1/files/vit_t_decoder.pt
