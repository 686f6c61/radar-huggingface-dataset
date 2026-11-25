# Danielbrdz/Barcenas-Inkling-2-Mini

## Resumen

Barcenas-Inkling-2-Mini es un ajuste fino (finetune) del modelo multimodal thinkingmachines/Inkling-2-Mini, publicado por el usuario Danielbrdz en Hugging Face. El modelo conserva la pipeline image-text-to-text del modelo base, de modo que acepta entradas conjuntas de imagen y texto y genera respuestas en formato conversacional. El ajuste se ha realizado sobre el dataset OysterCoreAI/SFT-General-Spanish-50K, orientado a instrucciones generales en espanol, con el objetivo de mejorar el comportamiento conversacional y la calidad de respuesta en castellano.

El modelo cuenta con 26.388.641.280 parametros totales segun los pesos en safetensors, lo que lo situa en la categoria de modelos de aproximadamente 26B. El repositorio ocupa 52,8 GB, coherente con pesos en precision de 16 bits. La licencia declarada es Apache 2.0, lo que facilita su uso comercial y su redistribucion con atribucion.

La relevancia de esta ficha es doble: por un lado, documenta una variante en espanol de un modelo multimodal reciente; por otro, advierte de que la model card publicada es extremadamente escueta y no incluye informacion sobre arquitectura interna, contexto, datos de entrenamiento detallados ni evaluaciones. Cualquier decision de adopcion en produccion deberia apoyarse en una evaluacion propia, dado que no hay benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; detalles internos no publicados en la model card) |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | es (espanol) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. El tag `inkling2_loop` y la pipeline `image-text-to-text` indican que se trata de un modelo multimodal que procesa imagenes y texto de forma conjunta, pero no se especifica si emplea un transformer denso, una mezcla de expertos, atencion lineal u otra variante. Tampoco se documenta el numero de capas, dimensiones ocultas ni el mecanismo de fusion vision-lenguaje.

En cuanto al entrenamiento, la model card solo declara el uso del dataset OysterCoreAI/SFT-General-Spanish-50K para el ajuste supervisado (SFT) en espanol. No se indica el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF o DPO, ni hiperparametros del ajuste. El modelo base es thinkingmachines/Inkling-2-Mini, del que tampoco se detallan en esta informacion los datos de preentrenamiento ni innovaciones tecnicas como decodificacion especulativa o atencion eficiente.

## Capacidades

- Generacion de texto conversacional en espanol, orientada a instrucciones generales.
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text), lo que permite responder a preguntas sobre imagenes.
- Capacidad de mantener conversaciones multi-turno, segun el tag `conversational`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara espanol; no se confirma soporte de otros idiomas.
- Modo de razonamiento explicito (thinking mode), vision avanzada o audio: no disponible.

## Casos de uso

- Asistente conversacional en espanol: el modelo puede gestionar dialogos multi-turno en castellano gracias al ajuste sobre un dataset de instrucciones generales, adecuado para prototipos de atencion al cliente o asistentes internos.
- Descripcion y analisis de imagenes: al conservar la pipeline image-text-to-text, puede emplearse para generar descripciones, responder preguntas sobre capturas o extraer informacion de documentos escaneados.
- Moderacion y clasificacion de contenido multimodal: combinando texto e imagen, puede etiquetar publicaciones o detectar contenido inapropiado en plataformas con usuarios hispanohablantes.
- Generacion de respuestas en entornos educativos: el ajuste en espanol lo hace util para tutores automaticos que expliquen conceptos a partir de texto o diagramas.
- Prototipado rapido de aplicaciones RAG en espanol: puede integrarse como generador final en pipelines de recuperacion aumentada para dominios con documentacion en castellano.
- Investigacion en ajuste fino multimodal: sirve como punto de partida para experimentos de SFT en espanol sobre un modelo base de 26B, con licencia permisiva.
- Evaluacion comparativa de variantes en espanol: util para medir el efecto de un dataset SFT concreto frente al modelo base en tareas de instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 52,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 60-70 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 26-30 GB, viable en GPUs de 32 GB o superiores.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 14-16 GB, aunque no se publican pesos cuantizados oficiales y habria que generarlos.
- GPU recomendadas: A100 80 GB, H100 80 GB o varias GPUs de 40-48 GB en paralelo para FP16. Para 8 bits, A6000/L40S/A100 40 GB.
- Cabe en GPU de consumo: en FP16 no cabe en ninguna GPU consumer actual de 24 GB. En 4 bits podria caber en una RTX 4090 (24 GB) o RTX 3090, con margen limitado para contexto largo.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion proporcionada, y la conversion a GGUF requeriria trabajo adicional.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Barcenas-Inkling-2-Mini | 26,4B | no disponible | es | apache-2.0 | Finetune multimodal en espanol |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | no disponible | no disponible | Modelo base del finetune |
| Alternativas multimodales de ~26B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoria. Se recomienda contrastar con modelos multimodales abiertos de tamano similar mediante evaluacion propia.

## Limitaciones y advertencias

- La model card es minima: no documenta arquitectura, contexto, datos de entrenamiento ni evaluaciones, lo que dificulta validar su calidad.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la ausencia de benchmarks publicados.
- El ajuste se limita a espanol; el rendimiento en otros idiomas no esta garantizado y podria degradarse respecto al modelo base.
- No se especifica la longitud de contexto, por lo que no se puede garantizar el comportamiento en conversaciones o documentos largos.
- El dataset de SFT (OysterCoreAI/SFT-General-Spanish-50K) no se describe en detalle; podria introducir sesgos o estilo no deseados.
- Aunque la licencia Apache 2.0 permite uso comercial, deben verificarse las condiciones del modelo base thinkingmachines/Inkling-2-Mini, ya que la informacion proporcionada no las detalla.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion por parte de la comunidad.
- Para produccion se recomienda evaluacion propia en el dominio objetivo, pruebas de robustez y monitorizacion de sesgos.

## Enlaces

- Hugging Face: https://huggingface.co/Danielbrdz/Barcenas-Inkling-2-Mini
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Dataset de SFT: https://huggingface.co/datasets/OysterCoreAI/SFT-General-Spanish-50K
