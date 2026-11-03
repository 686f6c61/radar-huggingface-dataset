# kingfasjdfh/L3.1-Dark-Reasoning-LewdPlay-evo-Hermes-R1-Uncensored-8B-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF en formato Q4_K_M del modelo `DavidAU/L3.1-Dark-Reasoning-LewdPlay-evo-Hermes-R1-Uncensored-8B`, un merge de la familia Llama 3.1 de 8.030 millones de parámetros orientado a escritura creativa, narrativa de ficción y roleplay sin filtros de contenido. El autor de la cuantización es el usuario `kingfasjdfh`, que ha utilizado el espacio `GGUF-my-repo` de ggml.ai para convertir los pesos originales en bfloat16 a un único fichero GGUF de aproximadamente 4,9 GB, listo para su uso con llama.cpp.

El modelo base es un merge construido con mergekit que combina linajes de razonamiento (la nomenclatura "Dark-Reasoning" y "Hermes-R1" sugiere la integración de destilaciones de R1 y de la familia Hermes) con modelos afinados para ficción y roleplay. La etiqueta `not-for-all-audiences` y el tag `swearing` indican que el ajuste ha eliminado deliberadamente las capas de rechazo habituales en modelos instructivos, lo que lo hace adecuado para narrativa adulta, terror, romance explícito y personajes con registro soez.

Es relevante para desarrolladores que necesitan un modelo de 8B ejecutable en hardware de consumo, con contexto declarado de 128k tokens (heredado de Llama 3.1), licencia Apache 2.0 y un formato GGUF que simplifica el despliegue local en herramientas como llama.cpp, Ollama o SillyTavern. No obstante, se trata de un artefacto de cuantización sin métricas publicadas ni validación independiente, por lo que su evaluación debe hacerse empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), pesos convertidos a GGUF |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128k tokens declarados en los tags del modelo base (no verificado en la cuantización) |
| Tipos de cuantizacion | Q4_K_M (este repositorio); el modelo base admite otras variantes GGUF no incluidas aquí |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único `l3.1-dark-reasoning-lewdplay-evo-hermes-r1-uncensored-8b-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only denso con atención por grupos (GQA), RoPE y normalización RMSNorm, preentrenado por Meta sobre del orden de 15 billones de tokens según la documentación pública de la familia. Sobre esa base, el autor original (`DavidAU`) ha aplicado un merge con mergekit que fusiona varios modelos afinados: componentes orientados a razonamiento con destilación de trazas tipo R1, componentes de la familia Hermes para seguimiento de instrucciones y componentes especializados en ficción, roleplay y escritura vívida. El resultado es un modelo "uncensored" en el que se han atenuado o eliminado los comportamientos de rechazo.

No se dispone de información sobre el volumen de tokens de ajuste, la composición exacta del dataset, la presencia de RLHF, DPO o destilación supervisada, ni sobre hiperparámetros del merge (pesos de interpolación, método TIES/DARE, etc.). La model card del repositorio de cuantización es la plantilla automática de `GGUF-my-repo` y remite al repositorio original para detalles que no se han trasladado aquí. La conversión a GGUF se realizó con llama.cpp en precisión Q4_K_M, que cuantiza la mayoría de matrices a 4 bits con escalas de 6 bits y mantiene algunas capas en precisión superior.

## Capacidades

- Generación de texto narrativo largo: ficción, ciencia ficción, romance, terror y todos los géneros declarados en los tags.
- Generación de tramas y subtramas, continuación de escenas y desarrollo de personajes.
- Roleplay multi-turno, con soporte explícito para frontends como SillyTavern.
- Escritura con registro soez y contenido para adultos (tag `swearing`, `not-for-all-audiences`).
- Razonamiento derivado del linaje "Reasoning"/"R1" del merge (no cuantificado ni documentado).
- Conversación general y seguimiento de instrucciones (pipeline `text-generation`, tag `conversational`).
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`).
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Escritura asistida de ficción por capítulos: el modelo puede mantener coherencia de personajes y arcos narrativos en sesiones largas, aprovechando la ventana de contexto extendida del linaje Llama 3.1 para arrastrar resúmenes de capítulos anteriores.
- Roleplay conversacional en local: integrado en SillyTavern o frontends equivalentes, permite sesiones privadas sin depender de APIs externas, con control total sobre las fichas de personaje y el system prompt.
- Generación de tramas y subtramas para guionistas: útil para hacer brainstorming de giros argumentales, estructuras de tres actos o arcos secundarios a partir de una premisa breve.
- Continuación de escenas con estilo definido: al ser un merge orientado a "vivid prosing", sirve para imitar un registro literario concreto proporcionando ejemplos en el prompt.
- Narrativa interactiva y videojuegos de texto: el formato GGUF y su tamaño permiten incrustarlo en motores de aventuras conversacionales que corren en una estación de trabajo sin GPU dedicada de gama alta.
- Prototipado de contenido para adultos en entornos controlados: investigación sobre generación de ficción explícita, evaluación de sesgos en modelos sin alineamiento o estudios de seguridad de contenido.
- Filtrado y generación de datos sintéticos narrativos: producción masiva de relatos etiquetados por género para entrenar clasificadores o modelos más pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas de calidad narrativa, y la model card remite al repositorio original sin aportar cifras. La cuantización Q4_K_M introduce además una degradación respecto al modelo en bfloat16 que no ha sido medida por el autor.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: en torno a 5-6 GB para los pesos, más 1-2 GB de overhead de contexto y caché KV según la longitud de la ventana utilizada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 o superiores para contexto largo; A100/H100 solo si se necesita servir a varios usuarios en paralelo.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más de VRAM a contextos moderados; también en CPU con 8-16 GB de RAM del sistema.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF), LM Studio, text-generation-webui y cualquier frontend compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles. Como referencia orientativa de la clase 8B Q4_K_M en una RTX 4090, cabría esperar decenas de tokens por segundo, pero no hay medición publicada para este modelo concreto.
- Contexto: aunque el modelo base declara 128k, el ejemplo de la model card usa `-c 2048`; contextos muy largos multiplican el consumo de caché KV y pueden exceder la VRAM disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (L3.1-Dark-Reasoning-LewdPlay-evo-Hermes-R1-Uncensored-8B Q4_K_M) | 8,03B | 128k declarados | Apache 2.0 | GGUF Q4_K_M | Merge sin filtros, solo inglés, sin benchmarks |
| Llama 3.1 8B Instruct | 8,03B | 128k | Llama 3.1 Community License | safetensors, GGUF | Base oficial con alineamiento y rechazos; multilingüe |
| Mistral 7B Instruct v0.3 | 7,24B | 32k | Apache 2.0 | safetensors, GGUF | Alternativa europea, contexto menor, sin capacidades de ficción explícita |
| Hermes 3 Llama 3.1 8B | 8,03B | 128k | Llama 3.1 Community License | safetensors, GGUF | Afinado para instrucciones y agentes, con alineamiento parcial |

La comparación de rendimiento no es posible porque no hay benchmarks publicados para este merge. Frente a las alternativas, su rasgo diferencial es la ausencia de filtros de contenido y la orientación a narrativa, a costa de perder el multilingüismo y las garantías de seguridad de los modelos oficiales.

## Limitaciones y advertencias

- Modelo "uncensored": no aplica capas de rechazo, por lo que puede generar contenido violento, sexual explícito, soez u ofensivo sin advertencia. No apto para productos dirigidos al público general sin un filtro externo.
- Riesgo elevado de alucinación en datos factuales: el ajuste prioriza la narrativa sobre la veracidad, y no se ha evaluado su fidelidad en tareas de conocimiento.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni medido.
- Contexto: los 128k tokens son una herencia del modelo base y no se han validado en esta cuantización; a contextos largos la calidad puede degradarse y el consumo de memoria crece linealmente con la caché KV.
- Licencia: Apache 2.0 en este repositorio, pero el modelo base deriva de Llama 3.1, cuya licencia comunitaria impone restricciones adicionales (atribución, límite de 700 millones de usuarios mensuales, cláusula de nombres). Conviene revisar la compatibilidad antes de un uso comercial.
- Procedencia y reproducibilidad: el merge no documenta los modelos componentes ni los pesos de interpolación, lo que dificulta auditar sesgos o reproducir el resultado.
- Sin métricas: no hay benchmarks, evaluaciones de sesgo ni pruebas de seguridad publicadas; cualquier decisión de producción debe apoyarse en una evaluación propia.
- Cero descargas y cero likes en el momento de la ficha: no hay señal de validación por parte de la comunidad.
- La model card del repositorio es la plantilla automática de `GGUF-my-repo`; no aporta información adicional sobre el comportamiento del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingfasjdfh/L3.1-Dark-Reasoning-LewdPlay-evo-Hermes-R1-Uncensored-8B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/DavidAU/L3.1-Dark-Reasoning-LewdPlay-evo-Hermes-R1-Uncensored-8B
- Espacio de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Documentación de Llama 3.1 (Meta): https://ai.meta.com/blog/meta-llama-3-1/
- mergekit: https://github.com/arcee-ai/mergekit
