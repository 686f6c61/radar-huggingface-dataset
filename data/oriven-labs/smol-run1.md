# Oriven-Labs/SMOL-run1

## Resumen

SMOL-run1 es un modelo multimodal de tipo image-text-to-text publicado por Oriven-Labs en Hugging Face bajo acceso restringido (gated). Segun los metadatos del repositorio, se distribuye en formato safetensors para la libreria transformers y emplea la arquitectura identificada con la etiqueta `qwen3_5`, lo que sugiere una base derivada de la familia Qwen 3.5. El modelo declara un total de 9.653.104.368 parametros (aproximadamente 9,65 mil millones) y un tamano de repositorio de 19,3 GB, coherente con pesos en precision bf16/fp16.

La ficha tecnica disponible es muy limitada: no se publican datos sobre longitud de contexto, composicion del dataset de entrenamiento, idiomas soportados ni resultados de benchmarks. La licencia figura como "other", lo que obliga a revisar los terminos especificos antes de cualquier uso comercial. El modelo esta etiquetado como compatible con endpoints y orientado a generacion conversacional de texto e imagenes.

Su relevancia actual es limitada por la ausencia de documentacion tecnica y de resultados verificables, asi como por el acceso restringido. Resulta adecuado para evaluacion interna por parte de equipos que ya hayan solicitado acceso, pero no como opcion de produccion sin una validacion previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta `qwen3_5`), image-text-to-text |
| Parametros totales | 9.653.104.368 (~9,65 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 19,3 GB |
| Pipeline | text-generation (con soporte image-text-to-text) |
| Acceso | gated (restringido) |

## Arquitectura y entrenamiento

La unica informacion disponible sobre la arquitectura es la etiqueta `qwen3_5` asociada al modelo, que apunta a una base de la familia Qwen 3.5 adaptada o afinada por Oriven-Labs. El pipeline declarado (`image-text-to-text` junto con `text-generation`) y el tag `conversational` indican un modelo multimodal capaz de procesar entradas de imagen y texto y generar respuestas conversacionales. El recuento de parametros (9,65 B) es compatible con una variante densa de tamano medio de dicha familia, aunque no se confirma si incorpora componentes de mezcla de expertos.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Toda esta seccion debe considerarse no disponible a partir de la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational`.
- Procesamiento de imagenes y texto combinados (image-text-to-text), lo que habilita tareas de descripcion de imagenes, respuesta a preguntas visuales y dialogos con soporte visual.
- Generacion de texto general a traves del pipeline `text-generation`.
- Compatibilidad con endpoints de Hugging Face (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion.

## Casos de uso

- Asistente conversacional con soporte visual: el modelo puede mantener dialogos multi-turno en los que el usuario adjunta imagenes (capturas, fotos de producto, documentos escaneados) y solicita descripciones o respuestas contextualizadas, gracias a su pipeline image-text-to-text.
- Descripcion automatica de imagenes para accesibilidad: integrado en un pipeline que reciba imagenes y genere texto alternativo descriptivo, util para plataformas que necesitan cumplir requisitos de accesibilidad.
- Extraccion de informacion de documentos visuales: lectura de facturas, tickets o formularios escaneados y generacion de respuestas estructuradas en texto, aprovechando la combinacion de vision y generacion de texto.
- Prototipado de asistentes multimodales: al ser un modelo de ~9,65 B en safetensors, puede desplegarse en entornos de investigacion para validar flujos conversacionales con imagen antes de escalar a modelos mayores.
- Moderacion de contenido asistida por imagen: clasificacion y descripcion de imagenes enviadas por usuarios junto con explicaciones textuales generadas por el modelo.
- Evaluacion comparativa interna: util como referencia de la familia Qwen 3.5 en pruebas A/B frente a otros modelos multimodales de tamano similar, siempre que se haya obtenido acceso al repositorio gated.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 19-20 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 24 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB para pesos; en 4 bits, en torno a 5-6 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue comodo en precision completa; RTX 4090 (24 GB) puede ser suficiente en bf16 con contexto limitado.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion, potencialmente en GPUs de 12-16 GB (RTX 4080, 4070 Ti, etc.), aunque sin garantias al no existir GGUF oficial.
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa. Como referencia estructural, el modelo comparte etiqueta de arquitectura con la familia Qwen 3.5, pero no se dispone de especificaciones de contexto, licencia ni benchmarks de dicha familia en esta ficha.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede retrasar la evaluacion.
- Licencia "other": no se especifican los terminos exactos; es imprescindible revisar el acuerdo de uso antes de cualquier despliegue comercial.
- Ausencia total de documentacion tecnica: no hay model card detallada, datos de entrenamiento, idiomas soportados ni benchmarks publicados.
- Riesgo de alucinacion: sin datos de evaluacion, no es posible estimar la fiabilidad del modelo en tareas factuales.
- Idiomas soportados desconocidos: no se puede garantizar un rendimiento adecuado en castellano sin pruebas previas.
- Longitud de contexto desconocida: limita la planificacion de casos de uso con documentos largos o dialogos extensos.
- Sin pesos cuantizados oficiales: el despliegue en hardware de consumo requiere cuantizacion propia, con el riesgo de degradacion asociado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Oriven-Labs/SMOL-run1
