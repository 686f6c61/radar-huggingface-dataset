# rax4901/Huihui-Qwen3.8-27B-abliterated

## Resumen

Huihui-Qwen3.8-27B-abliterated es una variante sin censura (uncensored) del modelo Qwen/Qwen3.8-27B, publicada por el usuario rax4901 en HuggingFace. Se ha generado mediante la tecnica de "abliteration", un procedimiento que elimina la direccion de rechazo (refusal direction) del espacio de activaciones del modelo sin necesidad de reentrenamiento, con el objetivo de que el modelo deje de rechazar peticiones que el modelo original denegaria. El modelo base es un transformer multimodal de Qwen con 27.781.427.952 parametros (aproximadamente 27,8 mil millones), lo que lo situa en la categoria de modelos de gran tamano.

El pipeline declarado es image-text-to-text, lo que indica que conserva capacidades de vision y procesamiento conjunto de imagen y texto. La model card indica que solo se han ablacionado las capas 18 a 51, manteniendo intactas las 15 primeras capas, asi como los modulos MTP (multi-token prediction) y visual, con el fin de preservar el maximo rendimiento del modelo original. La licencia declarada es Apache 2.0.

Este modelo es relevante para investigadores que estudian tecnicas de alineacion, seguridad y refusal behaviour, asi como para desarrolladores que necesitan un modelo de 27B con capacidades multimodales y sin restricciones de rechazo para entornos controlados. No obstante, su naturaleza "abliterated" implica riesgos considerables en produccion, y su adopcion debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.8-27B), con modulos MTP y visual |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; se menciona despliegue via Ollama) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); version Ollama disponible |

## Arquitectura y entrenamiento

El modelo es una modificacion del Qwen/Qwen3.8-27B original, que emplea una arquitectura transformer multimodal con pipeline image-text-to-text. La intervencion realizada es abliteration: se identifica y se resta la direccion de rechazo en el espacio de activaciones de las capas 18 a 51, dejando intactas las 15 primeras capas. Segun la model card, esta decision busca retener mas rendimiento del modelo original que una ablacion completa. Los modulos MTP (multi-token prediction) y el encoder visual no han sido modificados.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO en el modelo base. La model card describe el procedimiento como una implementacion "cruda" y de prueba de concepto (proof-of-concept) para eliminar rechazos sin usar TransformerLens, apoyandose en la herramienta remove-refusals-with-transformers de Sumandora. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla de las que pueda incluir el modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), incluyendo descripcion de imagenes y respuesta a preguntas visuales.
- Razonamiento y respuesta a instrucciones sin los rechazos tipicos del modelo alineado, gracias a la ablacion de capas 18-51.
- Capacidades de codigo y matematicas propias del modelo base (no verificadas de forma independiente en esta variante).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas no estan declarados en la ficha.
- Modo thinking: la model card incluye un token `</think>` en el streamer de ejemplo, lo que sugiere soporte de modo de razonamiento extendido, aunque no se detalla su funcionamiento.

## Casos de uso

- Investigacion sobre alineacion y refusal behaviour: el modelo permite estudiar como la ablacion de capas concretas afecta a la tasa de rechazo y a la calidad general, comparando con el modelo base sin modificar en experimentos controlados.
- Evaluacion de robustez de filtros de seguridad: sirve como caso de prueba para medir si los sistemas de moderacion externos detectan contenido que el modelo original rechazaria pero esta variante genera.
- Prototipado de asistentes multimodales en entornos de laboratorio: al conservar el pipeline image-text-to-text y los modulos visuales intactos, puede usarse para experimentar con descripcion de imagenes y VQA sin restricciones de rechazo.
- Generacion de codigo en pipelines internos: el modelo hereda las capacidades de codigo del base y puede integrarse en flujos de CI/CD para tareas de generacion y revision, siempre con supervision humana y validacion posterior.
- Analisis de documentos con imagenes: combinando texto e imagen, puede emplearse para extraer informacion de capturas, diagramas o formularios en flujos de procesamiento por lotes.
- Despliegue local con Ollama para pruebas: la model card ofrece una version `huihui_ai/Qwen3.8-abliterated` lista para ejecutar con `ollama run`, lo que facilita pruebas en maquinas locales sin infraestructura GPU dedicada.
- Fine-tuning posterior sobre dominio especifico: al estar en safetensors y con licencia Apache 2.0, puede servir como base para ajuste fino en tareas concretas, aunque la ablacion puede afectar a la estabilidad del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 55,6 GB solo para pesos (27,78B parametros x 2 bytes), mas overhead de activaciones y KV cache; se recomienda un minimo de 64-80 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 28 GB de pesos, con margen adicional para cache; viable en GPUs de 40-48 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 14-16 GB de pesos; podria caber en GPUs consumer de 24 GB (RTX 3090, RTX 4090) con contexto limitado.
- GPUs recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para precision completa; RTX 4090 (24 GB) solo con cuantizacion agresiva.
- Despliegue: transformers (segun la model card), Ollama (version oficial `huihui_ai/Qwen3.8-abliterated`), y potencialmente llama.cpp o vLLM si se generan pesos compatibles, aunque no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| rax4901/Huihui-Qwen3.8-27B-abliterated | ~27,8B | no disponible | Si (image-text-to-text) | Apache 2.0 | Variante abliterated, capas 18-51 modificadas |
| Qwen/Qwen3.8-27B (base) | ~27,8B | no disponible | Si | Apache 2.0 | Modelo original alineado, con rechazos |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | ~27,8B | no disponible | Si | Apache 2.0 | Version de referencia del mismo procedimiento por huihui-ai |
| Otras variantes abliterated de Qwen de ~27B | ~27B | no disponible | variable | variable | No se dispone de datos comparativos de rendimiento |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real de esta variante frente al modelo base u otras alternativas.

## Limitaciones y advertencias

- La ablacion elimina la direccion de rechazo, por lo que el modelo puede generar contenido que el modelo original denegaria; esto incluye potencialmente contenido danino, sesgado o inapropiado.
- Al ser una implementacion "cruda" y proof-of-concept, no se garantiza la estabilidad ni la coherencia del modelo en todos los dominios; la ablacion parcial (capas 18-51) puede producir comportamientos inconsistentes.
- Riesgo elevado de alucinacion, especialmente en tareas de razonamiento o factuales, agravado por la falta de benchmarks publicados.
- No se declaran los idiomas soportados; el rendimiento multilingue es incierto y debe validarse empiricamente.
- La longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar despliegues con ventanas largas.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante sin censura conlleva riesgos legales y reputacionales; se recomienda revision legal y moderacion externa obligatoria.
- El modelo tiene solo 35 descargas y 0 likes en el momento de la ficha, lo que indica una validacion comunitaria practicamente nula.
- La fecha de creacion (2026-10-27) y la falta de actualizaciones posteriores sugieren que puede no recibir mantenimiento.
- No se documenta soporte de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rax4901/Huihui-Qwen3.8-27B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Version de referencia de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Repositorio de la tecnica de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Version Ollama: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- Repositorio de Ollama: https://github.com/ollama/ollama/releases
