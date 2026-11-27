# mradermacher/kotomamba-2.8B-CL-v1.0-hf-GGUF

## Resumen

kotomamba-2.8B-CL-v1.0-hf-GGUF es la versión cuantizada en formato GGUF del modelo base misdelivery/kotomamba-2.8B-CL-v1.0-hf, publicada por el usuario mradermacher, conocido por distribuir cuantizaciones estáticas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo cuenta con 2.768.345.600 parámetros (aproximadamente 2,8 mil millones) y está orientado a generación de texto en inglés bajo licencia Apache 2.0.

El repositorio contiene únicamente cuantizaciones estáticas en GGUF, con un rango que va desde Q2_K (1,1 GB) hasta f16 (5,7 GB), lo que permite desplegar el modelo en hardware de consumo con requisitos de VRAM moderados. El autor indica que no ha publicado cuantizaciones ponderadas ni imatrix para este modelo, por lo que la calidad de las versiones de baja precisión puede ser inferior a la de otras distribuciones del mismo tipo.

La relevancia de esta ficha radica en que facilita la evaluación rápida del modelo para entornos de inferencia local: al tratarse de una cuantización de un modelo de 2,8B con licencia permisiva, resulta candidato para prototipado, experimentación y despliegue en GPUs de gama media, aunque la información pública sobre arquitectura, entrenamiento y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 2.768.345.600 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en safetensors vía transformers |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura del modelo base en la documentación proporcionada. El nombre del modelo incluye el término "mamba", lo que sugiere una posible arquitectura basada en state space models (SSM) o híbrida, pero este dato no está confirmado en la model card ni en los metadatos disponibles. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

La model card del repositorio cuantizado se limita a indicar que se trata de cuantizaciones estáticas del modelo base, sin aportar detalles sobre el proceso de entrenamiento original. El autor señala que no ha generado cuantizaciones ponderadas ni imatrix, y remite a la página del modelo base para obtener información adicional, que no está incluida en la información proporcionada.

## Capacidades

- Generación de texto en inglés: el modelo está etiquetado únicamente con el idioma "en", por lo que su uso principal es la generación de texto en ese idioma.
- Compatibilidad con transformers: el modelo base se distribuye con la librería transformers, lo que permite su carga mediante la API estándar de Hugging Face.
- Compatibilidad con llama.cpp y derivados: las cuantizaciones GGUF permiten su uso en llama.cpp, Ollama, LM Studio y otras herramientas compatibles con este formato.
- Endpoints compatibles: la etiqueta "endpoints_compatible" sugiere que el modelo puede servirse a través de la infraestructura de endpoints de Hugging Face.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Prototipado local de generación de texto: gracias a sus cuantizaciones de 1,1 a 3,1 GB, el modelo puede ejecutarse en portátiles con GPU de gama media para experimentar con generación de texto en inglés sin depender de servicios en la nube.
- Generación de texto en aplicaciones de escritorio: integrable mediante llama.cpp u Ollama en herramientas de escritorio que requieran un modelo ligero para tareas de redacción, resumen o completado, con la ventaja de la licencia Apache 2.0 para distribución.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece doce variantes de cuantización, lo que permite medir el impacto de la precisión en la calidad de salida para un modelo de 2,8B en tareas concretas.
- Filtrado y clasificación de texto en inglés: al ser un modelo pequeño, puede emplearse para tareas de etiquetado o moderación de contenido en pipelines de procesamiento por lotes donde el coste por token es crítico.
- Base para fine-tuning ligero: el modelo base en safetensors puede ajustarse con técnicas como LoRA en GPUs de consumo, y luego cuantizarse a GGUF para su despliegue.
- Entornos con restricciones de licencia: al ser Apache 2.0, puede integrarse en productos comerciales sin obligación de liberar el código, siempre que se respeten las condiciones de la licencia.
- Investigación sobre modelos SSM o híbridos: si se confirma la arquitectura mamba, el modelo serviría como caso de estudio para comparar SSM frente a transformers en tareas de generación de texto a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB para Q2_K (1,1 GB de pesos más overhead de contexto), 2-2,5 GB para Q4_K_M (1,7 GB), 2,5-3 GB para Q5_K_M (2,1 GB), 3-3,5 GB para Q6_K (2,4 GB), 3,5-4 GB para Q8_0 (3,1 GB) y 6-7 GB para f16 (5,7 GB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070, RTX 4090, A10G, L4; cualquier GPU con al menos 4 GB de VRAM puede ejecutar las cuantizaciones Q4 y Q5.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs de consumo actuales con 6 GB o más de VRAM, especialmente con cuantizaciones Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF; el modelo base también puede servirse con transformers y TGI si se dispone de los pesos originales.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kotomamba-2.8B-CL-v1.0-hf-GGUF | 2,77B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas de mradermacher |
| Modelos de ~3B tipo Llama 3.2 3B | ~3,2B | 128k | Llama 3.2 Community License | safetensors, GGUF | Contexto amplio y amplia adopción; licencia no Apache |
| Modelos de ~2,8B tipo Gemma 2 2B | ~2,6B | 8k | Gemma Terms of Use | safetensors, GGUF | Requiere aceptación de términos; orientado a inglés |
| Modelos de ~1,5B tipo Qwen2.5 1.5B | ~1,5B | 32k | Apache 2.0 | safetensors, GGUF | Menor tamaño, licencia permisiva, multilingüe |

La comparación se basa en categorías de tamaño y licencia; no se dispone de datos de rendimiento del modelo evaluado para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información sobre sesgos del modelo base; al entrenarse presumiblemente con datos web en inglés, es probable que herede sesgos de ese corpus.
- Riesgo de alucinación: no cuantificado; los modelos de 2,8B suelen presentar tasas de alucinación superiores a modelos de mayor tamaño en tareas de conocimiento factual.
- Limitaciones de contexto e idioma: el modelo está etiquetado únicamente para inglés y no se especifica la longitud de contexto, lo que impide garantizar su comportamiento en conversaciones largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor de las cuantizaciones no ofrece garantías sobre el modelo base; conviene verificar la licencia del modelo original antes de un despliegue en producción.
- Cuantizaciones estáticas sin imatrix: el autor indica que no ha generado cuantizaciones ponderadas, por lo que las versiones de baja precisión (Q2_K, Q3_K) pueden degradar la calidad más de lo habitual.
- Falta de documentación: la ausencia de información sobre arquitectura, entrenamiento y benchmarks dificulta la evaluación rigurosa y la comparación con alternativas.
- Advertencia de producción: al ser un modelo de 2,8B con documentación escasa, no se recomienda para aplicaciones críticas sin una evaluación previa en el dominio concreto.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/mradermacher/kotomamba-2.8B-CL-v1.0-hf-GGUF
- Modelo base: https://huggingface.co/misdelivery/kotomamba-2.8B-CL-v1.0-hf
- Página de descargas del autor: https://hf.tst.eu/model#kotomamba-2.8B-CL-v1.0-hf-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Página de solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Web del patrocinador del autor: https://www.nethype.de/
