# Muhammadaziz3101/translategemma-4b-uzbek-adapter

## Resumen

translategemma-4b-uzbek-adapter es un adaptador LoRA publicado por el usuario Muhammadaziz3101 sobre el modelo base google/translategemma-4b-it. Se trata de un ajuste fino supervisado (SFT) mediante TRL y PEFT cuyo propósito declarado, a partir del nombre, es especializar el modelo base en traducción al uzbeko. El repositorio contiene únicamente los pesos del adaptador (3,0 GB), no el modelo completo, por lo que su uso requiere descargar y cargar por separado el modelo base de Google.

El modelo base pertenece a la familia TranslateGemma, una variante de la familia Gemma orientada a traducción automática, con 4 000 millones de parámetros y formato instruct. El adaptador hereda por tanto la arquitectura, la ventana de contexto y las capacidades multilingües del modelo base, y añade un ajuste específico para el par de idiomas uzbeko. La información publicada por el autor es mínima: no se detalla el conjunto de datos de entrenamiento, los hiperparámetros, la licencia ni los resultados de evaluación.

La relevancia de esta ficha es limitada pero ilustrativa: muestra el patrón habitual de adaptadores comunitarios de bajo coste para idiomas de bajos recursos, y sirve como caso práctico de cómo extender un modelo de traducción con PEFT. No obstante, la ausencia de documentación, de métricas y de licencia explícita lo sitúan en un estado experimental, no apto para producción sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base google/translategemma-4b-it); arquitectura interna del base no detallada en la informacion disponible |
| Parametros totales | Adaptador LoRA: no disponible; modelo base: 4 000 millones (según nomenclatura "4b") |
| Parametros activos | no disponible (no es MoE según la informacion disponible) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones que soporte) |
| Idiomas soportados | no disponible; el nombre indica especialización en uzbeko, sin confirmación documental |
| Licencia | no disponible (la model card incluye un campo "licence: license" sin contenido) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con SFT mediante la librería TRL (versión 1.17.1) y PEFT (0.21.2), sobre Transformers 5.22.1, PyTorch 2.11.0+cu128, Datasets 5.1.0 y Tokenizers 0.23.1. El adaptador modifica las matrices de proyección del transformer del modelo base google/translategemma-4b-it; no se especifican el rango (rank), el alpha, las capas objetivo ni la tasa de aprendizaje empleadas.

No se ha publicado información sobre el corpus de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas de alineación adicionales (RLHF, DPO) más allá del SFT. Tampoco se documenta si el adaptador cubre únicamente la dirección uzbeko→inglés, inglés→uzbeko o ambas. La model card es la plantilla automática generada por TRL, sin secciones específicas de datos, evaluación o limitaciones.

## Capacidades

- Generación de texto conversacional y de traducción, heredadas del modelo base instruct.
- Especialización declarada (por nombre) en traducción al uzbeko; sin verificación documental de la dirección ni del par de idiomas.
- Soporte de conversaciones multi-turno mediante el formato de chat del modelo base (la model card muestra un ejemplo con roles user/assistant).
- Capacidades multilingües del modelo base: no detalladas en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso y uso como agente: no documentado.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Traducción automática uzbeko→inglés y inglés→uzbeko en pipelines internos: el adaptador se cargaría junto al modelo base con PEFT para servir traducciones en una API propia, siempre tras validar la calidad con un corpus de referencia, dado que no hay métricas publicadas.
- Localización de documentación técnica al uzbeko: útil para equipos que mantienen manuales o guías en inglés y necesitan una primera versión en uzbeko que luego revise un traductor humano.
- Traducción de contenido de atención al cliente: integración en un sistema de tickets para preclasificar y traducir mensajes de usuarios uzbekoparlantes antes de que los gestores los procesen.
- Generación de subtítulos y transcripciones traducidas: combinado con un sistema ASR, el adaptador puede traducir segmentos de audio transcritos al uzbeko o desde el uzbeko.
- Investigación en adaptadores de bajo rango para lenguas de bajos recursos: sirve como punto de partida reproducible (framework y versiones documentadas) para experimentar con SFT y LoRA en uzbeko.
- Prototipado de asistentes conversacionales en uzbeko: el formato de chat del modelo base permite construir demos multi-turno con `transformers.pipeline` y `device_map="auto"`, como muestra la propia model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de traducción (BLEU, chrF, COMET), evaluaciones de calidad lingüística ni comparaciones con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa 3,0 GB en disco; el modelo base de 4 000 millones de parámetros requiere aproximadamente 8 GB en FP16/BF16, unos 4-5 GB en cuantización de 4 bits y unos 2,5-3 GB en 3-4 bits agresiva (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: una GPU con 16 GB o más (RTX 4090, A100 40 GB, H100) permite cargar el modelo base en BF16 con margen para el contexto; GPUs de 8-12 GB (RTX 3060/4060 Ti, RTX 3080) pueden funcionar con cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más si se cuantiza el modelo base; el adaptador LoRA se aplica sobre la capa cuantizada mediante PEFT.
- Opciones de despliegue: transformers + PEFT (ruta documentada por el autor), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y exportación a GGUF para llama.cpp/Ollama si se fusiona el adaptador con el base (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| translategemma-4b-uzbek-adapter | Adaptador LoRA sobre base de 4B | no disponible | Adaptador SFT para traducción al uzbeko | no disponible | Hugging Face |
| google/translategemma-4b-it | 4B | no disponible | Modelo base instruct de traducción | no disponible | Hugging Face |
| NLLB-200 (Meta) | 600M-54B (distintas variantes) | 512 tokens aprox. | Traducción multilingüe supervisada | CC-BY-NC (uso no comercial) | Hugging Face |
| M2M-100 (Meta) | 418M-12B | 1024 tokens | Traducción multilingüe many-to-many | MIT | Hugging Face |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa con NLLB-200 o M2M-100; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: imposible evaluar cobertura dialectal, registro o dominios del uzbeko.
- Sin métricas de calidad publicadas: no se puede afirmar que el adaptador mejore al modelo base en traducción al uzbeko.
- Licencia no especificada: la model card contiene un campo "licence: license" vacío, lo que impide determinar si el uso comercial está permitido. El modelo base de Google tiene sus propias condiciones que deben consultarse por separado.
- Riesgo de alucinación y de deriva en traducciones de textos largos, especialmente si el modelo base no fue entrenado para contextos extensos.
- El repositorio solo contiene el adaptador: cualquier uso requiere descargar el modelo base, con el coste de almacenamiento y cómputo asociado.
- Idiomas soportados no confirmados: no hay garantía de que el adaptador preserve el rendimiento multilingüe del base fuera del par uzbeko.
- Sin información sobre sesgos: no se documentan sesgos de género, culturales o políticos en el corpus de entrenamiento.
- Estado experimental: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por la comunidad.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Muhammadaziz3101/translategemma-4b-uzbek-adapter
- Modelo base: https://huggingface.co/google/translategemma-4b-it
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
- Transformers: https://github.com/huggingface/transformers
