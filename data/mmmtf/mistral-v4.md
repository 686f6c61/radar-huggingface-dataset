# mmmtf/mistral-v4

## Resumen

mmmtf/mistral-v4 es un ajuste fino publicado en HuggingFace por el usuario mmmtf a partir del modelo base unsloth/mistral-7b-v0.3-bnb-4bit, que a su vez es una versión cuantizada a 4 bits de Mistral 7B v0.3 de Mistral AI. Se trata, por tanto, de un modelo decoder-only de aproximadamente 7.000 millones de parámetros, con licencia Apache 2.0 y declarado únicamente para inglés en la model card. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y su tamaño es de 0,2 GB.

Es importante no confundir este modelo con la familia Mistral 4 de Mistral AI, que según la documentación oficial es un modelo híbrido con arquitectura de mezcla de expertos (MoE) de 49.000 millones de parámetros activos y 1,05 billones totales, con codificador de visión de 1.600 millones de parámetros. La coincidencia parcial de nombre ("mistral-v4") no implica ninguna relación técnica ni de linaje entre ambos.

La relevancia de esta ficha es limitada pero concreta: se trata de un ejemplo típico de ajuste fino ligero hecho con Unsloth y TRL sobre una base cuantizada, sin documentación de dataset, hiperparámetros ni evaluación. Resulta útil como caso de estudio de flujos de trabajo de fine-tuning de bajo coste, no como modelo listo para producción sin una validación previa por parte de quien lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Mistral 7B v0.3 (atención con ventana deslizante, grouped-query attention, SwiGLU y RoPE) |
| Parametros totales | ~7.000 millones (heredados del modelo base; el ajuste fino no altera el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Mistral 7B v0.3; no confirmado para este ajuste |
| Tipos de cuantizacion | el modelo base está en bnb-4bit; no se documentan otras cuantizaciones para este ajuste |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only de ~7.000 millones de parámetros con atención de ventana deslizante de 4.096 tokens, grouped-query attention para reducir el coste de la caché KV, activaciones SwiGLU y embeddings rotatorios (RoPE). El modelo base Mistral 7B v0.3 amplía el vocabulario a 32.768 tokens y soporta 32.768 tokens de contexto. Este ajuste concreto no modifica esa arquitectura, solo los pesos resultantes del entrenamiento adicional.

El entrenamiento se realizó con Unsloth sobre el checkpoint ya cuantizado a 4 bits de unsloth/mistral-7b-v0.3-bnb-4bit, en combinación con TRL, según indica la propia model card ("trained 2x faster with Unsloth"). No se especifica el dataset utilizado, el número de tokens de entrenamiento, la composición de los datos, la duración del ajuste ni si hubo etapas de RLHF, DPO o cualquier otro tipo de alineación. Tampoco se documentan hiperparámetros (learning rate, LoRA rank, número de épocas) ni innovaciones técnicas propias más allá del uso de las herramientas citadas.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Mistral 7B v0.3.
- Razonamiento básico y respuesta a instrucciones: capacidad esperable por el linaje, pero no verificada ni documentada para este ajuste concreto.
- Generación de código: el modelo base muestra competencia razonable en lenguajes populares, pero no hay evaluación publicada para este ajuste.
- Multilingüismo: limitado a inglés según la model card; no se declaran otros idiomas.
- Tool calling / function calling: no documentado para este ajuste.
- Comportamiento agéntico y razonamiento multi-paso: no documentado.
- Modo de razonamiento explícito (thinking): no disponible.
- Capacidades de visión o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Experimentación académica con flujos de fine-tuning: sirve como referencia reproducible de un ajuste hecho con Unsloth y TRL sobre una base cuantizada a 4 bits, útil para comparar metodologías de entrenamiento de bajo coste.
- Generación de texto en inglés para prototipos internos: con 7.000 millones de parámetros y licencia Apache 2.0, puede desplegarse en una GPU de consumo para pruebas de concepto sin coste de licencia.
- Tareas de resumen y reescritura de documentos en inglés: la ventana de contexto de 32.768 tokens del modelo base permite procesar artículos o informes extensos de una sola pasada, siempre que el ajuste haya preservado esa capacidad.
- Clasificación y etiquetado de texto: mediante prompting, para categorizar tickets, reseñas o correos en inglés dentro de un pipeline propio.
- Extracción de información estructurada: generación de JSON o campos normalizados a partir de texto libre en inglés, con validación posterior obligatoria por el riesgo de alucinación.
- Base para nuevos ajustes específicos de dominio: al ser un modelo pequeño y con licencia permisiva, es un punto de partida razonable para fine-tunings posteriores con datos propios en inglés.
- Asistente local en estación de trabajo: cuantizado a 4 bits cabe en GPUs de consumo, lo que permite ejecutarlo en local sin enviar datos a servicios externos.
- Evaluación comparativa de ajustes comunitarios: como ejemplo de modelo sin evaluación publicada, resulta útil para ilustrar la importancia de validar antes de adoptar pesos de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K u otras), ni comparaciones con el modelo base o con alternativas. Cualquier cifra que se atribuya a este ajuste concreto carecería de respaldo documental.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 7.000 millones de parámetros): ~14-15 GB en FP16, ~8 GB en cuantización de 8 bits y ~4-5 GB en cuantización de 4 bits (Q4_K_M), más margen para la caché KV según la longitud de contexto.
- GPU recomendadas: A100 40 GB, H100, L40S o A10G para despliegues con concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para uso individual con margen holgado.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores con cuantización de 4 bits. En configuraciones de 8 GB conviene reducir el contexto o usar cuantizaciones más agresivas.
- Opciones de despliegue: vLLM y TGI para servidores con requisitos de throughput; llama.cpp y Ollama para ejecución local en CPU/GPU; transformers con bitsandbytes para prototipado rápido.
- Consideración específica de este repositorio: el tamaño del repositorio es de solo 0,2 GB, muy inferior a los ~4 GB que ocuparía un modelo de 7.000 millones de parámetros en 4 bits. Esto sugiere que los pesos publicados podrían corresponder a un adaptador y no al modelo completo, aunque la model card no lo especifica. Conviene verificar el contenido del repositorio antes de intentar cargarlo.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| mmmtf/mistral-v4 | ~7.000 M | 32.768 tokens (heredado del base, no confirmado) | Apache 2.0 | en | HuggingFace, sin evaluacion publicada |
| Mistral 7B Instruct v0.3 | ~7.000 M | 32.768 tokens | Apache 2.0 | multilingue (segun Mistral AI) | HuggingFace, con evaluacion publicada por el fabricante |
| Llama 3.1 8B Instruct | ~8.000 M | 128.000 tokens | Llama 3.1 Community License | multilingue | HuggingFace / Meta, con evaluacion publicada |
| Qwen2.5 7B Instruct | ~7.600 M | 128.000 tokens | Apache 2.0 | multilingue (mas de 29 idiomas) | HuggingFace / Alibaba, con evaluacion publicada |

La diferencia principal de mmmtf/mistral-v4 frente a las alternativas no está en la arquitectura ni en el tamaño, sino en la ausencia total de documentación de entrenamiento y de evaluación, y en su alcance monolingüe declarado (inglés).

## Limitaciones y advertencias

- Ausencia de evaluación: no hay benchmarks publicados, por lo que se desconoce si el ajuste ha degradado capacidades del modelo base.
- Trazabilidad del entrenamiento nula: se desconoce el dataset, su procedencia, su licencia y si contiene datos con derechos o sesgos problemáticos.
- Sesgos conocidos: no documentados para este ajuste; los del modelo base Mistral 7B v0.3 tampoco se detallan en esta model card.
- Riesgo de alucinación: previsible en un modelo de 7.000 millones de parámetros sin alineación documentada; cualquier salida factual debe verificarse.
- Alcance lingüístico: solo inglés declarado; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Ambigüedad del contenido del repositorio: el tamaño de 0,2 GB no coincide con el de un modelo de 7.000 millones de parámetros en 4 bits, lo que apunta a un posible adaptador. Debe verificarse antes de su uso.
- Licencia: Apache 2.0 permite uso comercial, pero el usuario es responsable de comprobar que los datos de ajuste no introducen restricciones adicionales, algo que la model card no aclara.
- Confusión de nombres: "mistral-v4" no tiene relación con la familia Mistral 4 de Mistral AI. Cualquier expectativa de contexto largo, capacidades multimodales o modo de razonamiento basada en ese nombre es infundada.
- Reputación del autor: 0 descargas y 0 likes; se trata de un repositorio sin validación por parte de la comunidad.
- Advertencia de seguridad: al no documentarse la alineación, el modelo puede producir contenido inapropiado o seguir instrucciones dañinas con mayor facilidad que un modelo instruido y evaluado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mmmtf/mistral-v4
- Modelo base del ajuste: https://huggingface.co/unsloth/mistral-7b-v0.3-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Anuncio de Mistral 7B por Mistral AI: https://mistral.ai/news/announcing-mistral-7b
- Paper de Mistral 7B: https://arxiv.org/abs/2310.06825
- Documentación de Mistral en transformers: https://huggingface.co/docs/transformers/v4.49.0/model_doc/mistral
- Documentación de Mistral 4 en transformers (modelo distinto, sin relación con este repositorio): https://huggingface.co/docs/transformers/v5.14.0/en/model_doc/mistral4
- Catálogo de modelos de Mistral AI (modelo distinto): https://mistral.ai/models/
- Anuncio de Mistral Large 4 (modelo distinto): https://mistral.ai/news/mistral-large-4/
- Documentación de Mistral Large 4 (modelo distinto): https://docs.mistral.ai/models/mistral-large-4-0
