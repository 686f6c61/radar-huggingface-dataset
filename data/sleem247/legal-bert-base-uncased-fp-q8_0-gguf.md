# Sleem247/legal-bert-base-uncased-fp-Q8_0-GGUF

## Resumen

`Sleem247/legal-bert-base-uncased-fp-Q8_0-GGUF` es una conversión a formato GGUF del modelo `AnonymousSub/legal-bert-base-uncased-fp`, un checkpoint derivado de la familia Legal-BERT. El autor de la conversión es el usuario de Hugging Face Sleem247, que ha empaquetado los pesos con cuantización Q8_0 mediante el espacio GGUF-my-repo de ggml.ai, que a su vez utiliza llama.cpp como herramienta de conversión. El modelo cuenta con 108.891.648 parámetros (aproximadamente 109 millones) según los datos de safetensors del repositorio original.

Se trata de un modelo de extracción de características (feature extraction) orientado al dominio jurídico en inglés, construido sobre la arquitectura BERT base uncased. Su relevancia radica en que permite ejecutar un modelo especializado en texto legal en entornos con recursos limitados, gracias al formato GGUF y a la cuantización de 8 bits, que reduce el peso del repositorio a unos 0,1 GB. No obstante, la información pública disponible sobre el modelo base es muy escasa: la model card del repositorio convertido se limita a los pasos de uso con llama.cpp y remite a la tarjeta del modelo original, que no se ha podido verificar en detalle.

Es importante subrayar que, pese a estar empaquetado para llama.cpp, el modelo es un encoder BERT y no un modelo generativo causal. Por tanto, la invocación con `llama-cli` y un prompt de texto libre que aparece en la model card no produce generación de texto coherente; el uso previsto es la extracción de embeddings o el ajuste fino posterior para tareas de clasificación jurídica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base uncased (transformer encoder), según el nombre del modelo base; no confirmado en documentación oficial |
| Parametros totales | 108.891.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la model card sugiere `-c 2048` en llama-server, pero no se especifica la ventana nativa del modelo base) |
| Tipos de cuantizacion | Q8_0 (8 bits) |
| Idiomas soportados | no disponible (por el nombre "uncased" y el origen Legal-BERT se infiere inglés, sin confirmación oficial) |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `legal-bert-base-uncased-fp-q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un BERT base uncased, es decir, un transformer encoder de 12 capas con aproximadamente 109 millones de parámetros, atención bidireccional y tokenizador WordPiece en minúsculas. El sufijo "legal" y la referencia a Legal-BERT en el ecosistema sugieren un ajuste o preentrenamiento continuado sobre corpus jurídico en inglés, pero no se dispone de información verificada sobre el conjunto de datos exacto, el número de tokens de entrenamiento ni si hubo etapas de ajuste supervisado específicas. Tampoco consta si se aplicaron técnicas de RLHF o DPO, algo por otra parte poco habitual en modelos encoder de este tipo.

La innovación técnica de este repositorio concreto no está en la arquitectura, sino en el empaquetado: la conversión a GGUF con cuantización Q8_0 realizada mediante GGUF-my-repo permite cargar los pesos en llama.cpp y en herramientas compatibles, reduciendo el tamaño del repositorio a 0,1 GB. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal ni modos de razonamiento extendido.

## Capacidades

- Extracción de características y generación de embeddings de texto, tal como indica el tag `feature-extraction`.
- Codificación bidireccional de secuencias, adecuada para tareas de comprensión (clasificación, similitud, recuperación) más que para generación.
- Especialización potencial en vocabulario y estructuras del dominio jurídico, derivada del modelo base Legal-BERT.
- Ajuste fino posterior para clasificación de documentos, etiquetado de secuencias y ranking, siempre que la herramienta de destino soporte el ajuste de un encoder BERT.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se documentan.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Búsqueda semántica en repositorios jurídicos: usar el modelo para generar embeddings de contratos, sentencias o cláusulas e indexarlos en una base vectorial; la codificación bidireccional de BERT produce representaciones densas adecuadas para similitud coseno.
- Clasificación de documentos legales: ajustar una cabeza de clasificación sobre los embeddings del encoder para categorizar escritos (demandas, contratos, resoluciones) en un pipeline supervisado.
- Detección de cláusulas abusivas o riesgosas: emplear el modelo como extractor de características en un sistema que marque fragmentos contractuales susceptibles de revisión.
- Enrutamiento y triaje de consultas legales: calcular la similitud entre la consulta del usuario y un conjunto de áreas de práctica (laboral, fiscal, civil) para dirigirla al equipo adecuado.
- Despliegue ligero en local: gracias al formato GGUF Q8_0 y a su tamaño de ~0,1 GB, puede ejecutarse en portátiles y equipos sin GPU dedicada mediante llama.cpp para tareas de extracción de embeddings en entornos con recursos limitados.
- Prototipado rápido de asistentes jurídicos: integrar el modelo como componente de recuperación en un sistema RAG jurídico, combinándolo con un modelo generativo separado que redacte la respuesta final.
- Preprocesado y deduplicación de corpus legales: usar los embeddings para agrupar documentos casi duplicados o versiones de un mismo contrato antes de alimentar otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,1-0,2 GB para los pesos en Q8_0; el consumo real dependerá del tamaño de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionarán sin problema, aunque el modelo está sobredimensionado para hardware de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en CPU.
- Opciones de despliegue: llama.cpp (CLI y servidor), y cualquier runtime compatible con GGUF; no se documenta soporte específico para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Sleem247/legal-bert-base-uncased-fp-Q8_0-GGUF | 108.891.648 | no disponible | GGUF Q8_0 | no disponible | Conversión comunitaria de un modelo legal no verificado |
| nlpaueb/legal-bert-base-uncased | ~110 M (BERT base) | 512 tokens (BERT base estándar) | safetensors / PyTorch | no verificada en esta ficha | Legal-BERT de referencia, ampliamente utilizado |
| Sleem247/LEGAL_bert_all-Q8_0-GGUF | no disponible | no disponible | GGUF Q8_0 | no disponible | Otra conversión GGUF del mismo autor, basada en MahmoudTaktak/LEGAL_bert_all |

La comparación con `nlpaueb/legal-bert-base-uncased` es la más relevante por tratarse del modelo de referencia del ecosistema Legal-BERT, pero no se dispone de datos de rendimiento del modelo aquí descrito que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No se dispone de licencia declarada, lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor o consultar el modelo base antes de usarlo en producción.
- El modelo base (`AnonymousSub/legal-bert-base-uncased-fp`) no está verificado y su model card no aporta detalles sobre datos de entrenamiento, sesgos o evaluación.
- Al ser un encoder BERT, no genera texto de forma fiable; los ejemplos de `llama-cli` con prompts generativos de la model card pueden inducir a error.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí riesgo de representaciones sesgadas o poco representativas si el corpus legal de entrenamiento estuvo sesgado.
- Limitaciones de idioma: no se documentan; probablemente esté orientado al inglés jurídico, pero no hay confirmación.
- Limitaciones de contexto: no se especifica la ventana nativa; el valor `-c 2048` del ejemplo es una configuración del servidor, no necesariamente la longitud máxima soportada por el modelo.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-08) es posterior a la fecha actual y podría ser un error de metadatos; conviene verificar la integridad del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sleem247/legal-bert-base-uncased-fp-Q8_0-GGUF
- Modelo base: https://huggingface.co/AnonymousSub/legal-bert-base-uncased-fp
- Otra conversión del mismo autor: https://huggingface.co/Sleem247/LEGAL_bert_all-Q8_0-GGUF
- Legal-BERT de referencia: https://huggingface.co/nlpaueb/legal-bert-base-uncased
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
