# ojas25/siglip-so400m-moviestills-lora

## Resumen

ojas25/siglip-so400m-moviestills-lora es un adaptador LoRA para el modelo vision-lenguaje google/siglip-so400m-patch14-384, desarrollado por el usuario ojas25. Se distribuye en formato safetensors y se carga sobre el modelo base mediante las librerías `transformers` y `peft`. Su propósito es especializar el espacio de embeddings imagen-texto de SigLIP en imágenes de fotogramas de cine, presumiblemente a partir del dataset MovieStills, aunque la model card no detalla el proceso de entrenamiento.

El modelo base SigLIP es un transformer contrastivo con un encoder de imagen ViT de parches 14 y resolución 384, y un encoder de texto entrenado con una pérdida sigmoidea en lugar de softmax. El adaptador no modifica la arquitectura, sino que añade pesos de bajo rango para ajustar el comportamiento en el dominio cinematográfico. Es relevante para experimentos de visión-lenguaje de bajo coste, ya que el repositorio ocupa 0,1 GB y puede cargarse sobre el modelo base sin reentrenar todos los parámetros.

Sin embargo, la información pública es mínima: no se indican parámetros exactos, licencia, idiomas, datos de entrenamiento ni resultados de benchmarks. Cualquier evaluación para producción debe partir de una validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre SigLIP: transformer vision-lenguaje con encoder de imagen ViT y encoder de texto, pérdida contrastiva sigmoidea |
| Parámetros totales | no disponible (el nombre del modelo base incluye «SO400M», pero no se confirma el recuento exacto) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (se refiere a la longitud máxima del texto de entrada; en SigLIP suele ser de 64 tokens, no confirmado para este adaptador) |
| Tipos de cuantización | no disponible; el adaptador se distribuye en safetensors y el modelo base podría cuantizarse con bitsandbytes, pero no se documenta |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA); el modelo base en safetensors |
| Modelo base | google/siglip-so400m-patch14-384 |
| Tamaño del repositorio | 0,1 GB |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

SigLIP (Sigmoid Loss for Language Image Pre-training) combina un encoder visual ViT con un encoder de texto y aprende representaciones alineadas mediante una pérdida contrastiva sigmoidea. El checkpoint base google/siglip-so400m-patch14-384 usa parches de 14x14 y resuelve imágenes de 384x384; el nombre SO400M sugiere un tamaño de aproximadamente 400M de parámetros, pero no se confirma el recuento total en la información disponible.

El adaptador LoRA se entrena sobre ese modelo base. La model card solo muestra el código de inferencia con `transformers` y `peft`; no especifica el número de tokens de entrenamiento, la composición del dataset MovieStills, el rango de LoRA, la tasa de aprendizaje ni si se aplicaron técnicas de alineamiento como RLHF o DPO. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Emparejamiento imagen-texto: calcula logits y probabilidades de similitud entre una imagen y una lista de textos candidatos, como se muestra en el ejemplo de uso.
- Clasificación zero-shot mediante prompts: puede asignar etiquetas a imágenes comparándolas con descripciones textuales, heredando la capacidad del modelo base SigLIP.
- Retrieval imagen-texto y texto-imagen: los embeddings permiten indexar y recuperar imágenes por descripción o viceversa.
- Especialización probable en fotogramas de cine: el nombre «moviestills» y el fine-tuning LoRA apuntan a una mejora en escenas cinematográficas, aunque no se cuantifica.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no un LLM generativo.
- Capacidades multilingües no documentadas; el comportamiento dependerá del dataset de entrenamiento y del modelo base.
- No dispone de modos de pensamiento, visión generativa, audio ni otras capacidades especiales documentadas.

## Casos de uso

- Etiquetado automático de fotogramas de películas: para cada fotograma, comparar con una lista de descripciones de escena, género o acción y asignar la etiqueta con mayor probabilidad. El adaptador es adecuado porque se ha ajustado sobre MovieStills y el coste de inferencia es bajo.
- Búsqueda semántica en archivos audiovisuales: extraer embeddings de imágenes y textos con el modelo base más el adaptador, indexarlos en una base vectorial y recuperar fotogramas mediante consultas en lenguaje natural.
- Pre-anotación de datasets de visión para cine: generar candidatos de etiquetas para revisión humana, reduciendo el esfuerzo de anotación en catálogos de fotogramas.
- Clasificación de géneros o tipos de plano: usar prompts como «una escena de acción», «un primer plano dramático» o «un paisaje nocturno» y comparar probabilidades para clasificar stills.
- Verificación de descripciones y audiodescripción: comprobar si una descripción textual existente coincide con el fotograma correspondiente, útil en pipelines de subtitulado y accesibilidad.
- Recomendación visual: calcular similitud entre fotogramas y descripciones o preferencias textuales de usuarios para sugerir contenido audiovisual.
- Investigación en adaptación de dominio con LoRA: usar el adaptador como punto de partida para experimentar con visión-lenguaje en cine sin reentrenar SigLIP completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de retrieval (Recall@K, mAP) para este adaptador. Tampoco se compara con CLIP o SigLIP base mediante números.

## Requisitos de hardware

- VRAM estimada: no confirmada. Si el modelo base tiene ~400M de parámetros, la inferencia en FP16/BF16 requeriría aproximadamente 0,8-1,5 GB solo para pesos, más activaciones y memoria del procesador de imagen. En FP32, el doble. Si el recuento real es mayor, la VRAM necesaria aumentará proporcionalmente.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM para lotes pequeños (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB). Para lotes grandes o entrenamiento, A100 40/80 GB o H100.
- Cabe en consumer GPU: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y similares, siempre que se use FP16/BF16 y lotes moderados.
- Opciones de despliegue: `transformers` + `peft` es la ruta documentada. No se documentan integraciones con vLLM, TGI, llama.cpp, Ollama ni ONNX Runtime. Para servir embeddings se puede envolver en FastAPI/TorchServe o usar HuggingFace Inference Endpoints.
- Latencia y throughput: no disponibles. Dependen de la GPU, del tamaño de lote, de la resolución de imagen y de la longitud de los textos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto texto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ojas25/siglip-so400m-moviestills-lora | Adaptador LoRA sobre SigLIP SO400M | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| google/siglip-so400m-patch14-384 | Modelo base vision-lenguaje | no disponible (SO400M) | no disponible | no disponible | no disponible en la información | HuggingFace |
| openai/clip-vit-large-patch14 | Modelo vision-lenguaje contrastivo | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| google/siglip-base-patch16-224 | Modelo vision-lenguaje contrastivo | no disponible | no disponible | no disponible | no disponible | HuggingFace |

La comparación cuantitativa no es posible con los datos disponibles. Frente a CLIP ViT-L/14 y las variantes base de SigLIP, este adaptador no aporta mejoras generales documentadas; su valor diferencial es la especialización en MovieStills, que no se ha medido públicamente.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial del adaptador ni del modelo base; es imprescindible verificar las condiciones antes de producción.
- Sin datos de entrenamiento: no se conocen el dataset exacto, el número de ejemplos, el rango LoRA ni los hiperparámetros, lo que dificulta reproducir o auditar el ajuste.
- Sin benchmarks: no hay evidencia pública de mejora frente a SigLIP base en MovieStills ni en otros dominios.
- Sesgos potenciales: el dataset MovieStills puede sobrerrepresentar ciertos géneros, épocas, culturas o estilos visuales; el adaptador puede amplificar esos sesgos.
- Riesgo de falsos positivos: al ser un modelo contrastivo, puede asignar alta similitud a descripciones incorrectas, especialmente en imágenes fuera del dominio cinematográfico.
- Contexto de texto limitado: no se especifica, pero en SigLIP el encoder de texto suele tener un límite de 64 tokens; los prompts largos pueden truncarse.
- Idiomas no documentados: el rendimiento en castellano u otros idiomas no está garantizado; probablemente dependa del dataset y del modelo base.
- Dependencia del modelo base: el adaptador no es autónomo; requiere descargar google/siglip-so400m-patch14-384 y cargarlo con `peft`.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- No apto para generación de texto, agentes, tool calling ni tareas de razonamiento generativo.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/ojas25/siglip-so400m-moviestills-lora
- Modelo base: https://huggingface.co/google/siglip-so400m-patch14-384
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
