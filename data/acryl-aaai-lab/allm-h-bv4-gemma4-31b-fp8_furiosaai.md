# acryl-aaai-lab/ALLM.H-Bv4-Gemma4-31B-FP8_FuriosaAI

## Resumen

ALLM.H-Bv4-Gemma4-31B-FP8_FuriosaAI es una versión cuantizada en FP8 del modelo médico coreano ALLM.H-Bv4-Gemma4-31B-BF16, desarrollado por el laboratorio acryl-aaai-lab sobre la base de Gemma 4. El modelo original parte de la familia Gemma 4 de Google y se ha especializado en dominio sanitario y en el examen médico coreano KMLE (Korean Medical Licensing Examination), lo que lo sitúa en la intersección entre un modelo generalista de gran tamano y un asistente clínico especializado.

La variante aquí descrita aplica cuantización FP8 mediante las librerías `compressed-tensors` y `llm-compressor`, y esta optimizada para su despliegue en hardware FuriosaAI (aceleradores NPU de la compania surcoreana). Con 31.273.088.876 parámetros (~31,3 B) y un repositorio de 33,3 GB, el modelo mantiene el pipeline `image-text-to-text`, lo que indica capacidades multimodales heredadas de la arquitectura Gemma 4.

Su relevancia actual radica en tres factores: la escasez de modelos médicos abiertos con licencia permisiva y soporte multilingüe coreano-inglés, la existencia de una versión cuantizada lista para producción en aceleradores no-GPU, y la trazabilidad de un linaje claro (Gemma 4 → BF16 → FP8). El acceso esta restringido (gated) y requiere aceptar las condiciones de la licencia Gemma en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Gemma 4 |
| Parametros totales | 31.273.088.876 (~31,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors, llm-compressor); existe version BF16 del modelo base |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4, un transformer multimodal que procesa entradas de imagen y texto y genera texto. La versión BF16 de partida (ALLM.H-Bv4-Gemma4-31B-BF16_FuriosaAI) fue sometida a un proceso de especialización en dominio médico y sanitario por parte de acryl-aaai-lab, con evaluacion en el examen KMLE. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset médico, ni si se aplicaron fases de RLHF, DPO o SFT específicas.

La innovacion técnica principal de esta variante es la cuantizacion FP8 realizada con `llm-compressor` y empaquetada en formato `compressed-tensors`, lo que permite reducir el peso del modelo (33,3 GB en repositorio) frente a los ~62 GB que ocuparía la versión BF16. El sufijo `FuriosaAI` indica que los pesos estan adaptados para su ejecucion en aceleradores NPU de FuriosaAI, no en GPUs convencionales. No se han publicado detalles sobre decodificacion especulativa, atención lineal u otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional en coreano e ingles.
- Razonamiento clínico y respuesta a preguntas de dominio médico (entrenamiento orientado al examen KMLE).
- Procesamiento de entradas multimodales imagen-texto (pipeline `image-text-to-text`), potencialmente util para interpretacion de imagenes médicas o documentos escaneados.
- Respuesta a preguntas de opcion multiple y explicaciones razonadas de tipo examen.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües limitadas a coreano e ingles segun los tags del repositorio.
- Modo thinking explicito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Formacion médica y preparacion del KMLE: el modelo puede generar preguntas de opcion multiple, explicar la respuesta correcta y razonar sobre casos clínicos, aprovechando su entrenamiento especifico en el examen médico coreano.
- Asistencia documental clínica en coreano: resumen y estructuración de informes, notas de evolucion e historiales en hospitales surcoreanos, con la ventaja de un modelo afinado en el idioma y la terminologia local.
- Triaje conversacional en atención al cliente sanitaria: gestion de dialogos multi-turno para orientar al paciente sobre síntomas y derivacion, siempre con supervision humana y sin sustituir el juicio clínico.
- Interpretacion asistida de imagenes médicas simples (radiografias, fotografias de lesiones) gracias a la capacidad image-text-to-text heredada de Gemma 4, como apoyo a la decision y no como diagnostico autonomo.
- Despliegue en infraestructura FuriosaAI: organizaciones que ya operan aceleradores NPU de FuriosaAI pueden servir el modelo en FP8 con menor huella de memoria que la version BF16, útil en entornos con restricciones de VRAM o de coste energetico.
- Traduccion y adaptacion de contenido biomédico coreano-ingles: el modelo puede ayudar a localizar guias clínicas, articulos y material formativo entre ambos idiomas.
- Investigacion en NLP clínico: como baseline cuantizado para experimentos de evaluacion en dominio médico coreano, comparando FP8 frente a BF16 en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 31-33 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 40-48 GB de memoria efectiva.
- Version BF16 del modelo base: requiere del orden de 62-66 GB solo para pesos, por lo que no cabe en GPUs consumer de 24 GB sin cuantizacion adicional.
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB, L40S 48 GB o multiples RTX 4090/5090 con tensor parallelism para la variante FP8.
- Aceleradores objetivo: NPU de FuriosaAI (el sufijo del repositorio indica adaptacion especifica a este hardware).
- Cabe en GPU consumer: no de forma directa en una unica tarjeta de 24 GB; requeriria cuantizaciones adicionales (GGUF/AWQ) no publicadas en este repositorio.
- Opciones de despliegue: transformers con `compressed-tensors`; vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion disponible. El tag `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ALLM.H-Bv4-Gemma4-31B-FP8_FuriosaAI | ~31,3 B | no disponible | imagen-texto | gemma | gated en HuggingFace |
| ALLM.H-Bv4-Gemma4-31B-BF16_FuriosaAI (modelo base) | ~31,3 B | no disponible | imagen-texto | gemma | gated en HuggingFace |
| Gemma 4 (modelo generalista de Google) | no disponible | no disponible | multimodal | gemma | publico en HuggingFace |
| Meditron / Med42 (modelos médicos abiertos) | no disponible | no disponible | texto | variable | publico |

La comparacion cuantitativa con alternativas medicas abiertas no es posible con los datos disponibles; la ventaja diferencial de este modelo es su especializacion en el KMLE y el coreano médico, junto con el empaquetado FP8 para FuriosaAI.

## Limitaciones y advertencias

- Modelo de dominio médico: no debe usarse como sustituto del juicio clínico profesional; cualquier salida debe ser revisada por personal sanitario cualificado.
- Riesgo de alucinacion en terminologia médica, dosis, diagnosticos y referencias bibliograficas, especialmente en preguntas fuera del alcance del entrenamiento.
- Idiomas limitados a coreano e ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Licencia Gemma: uso comercial permitido bajo los terminos de Google, con obligaciones de atribucion y restricciones de uso aceptable; el acceso esta restringido (gated) y requiere aceptacion previa.
- Cuantizacion FP8: puede degradar ligeramente la precision frente a BF16 en tareas de razonamiento fino; no se han publicado evaluaciones comparativas.
- Dependencia de hardware FuriosaAI: el sufijo del repositorio sugiere optimizacion para NPUs de esa compania; el rendimiento en GPUs convencionales no esta validado.
- Ausencia de datos sobre contexto maximo, tool calling y benchmarks, lo que limita la planificacion de despliegues en produccion.
- Fecha de creacion del repositorio (2026-10-27) y solo 2 descargas: ecosistema y validacion comunitaria practicamente inexistentes.

## Enlaces

- HuggingFace: https://huggingface.co/acryl-aaai-lab/ALLM.H-Bv4-Gemma4-31B-FP8_FuriosaAI
- Modelo base BF16: https://huggingface.co/acryl-aaai-lab/ALLM.H-Bv4-Gemma4-31B-BF16_FuriosaAI
- Organizacion acryl-aaai-lab: https://huggingface.co/acryl-aaai-lab
- FuriosaAI: https://furiosa.ai
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
