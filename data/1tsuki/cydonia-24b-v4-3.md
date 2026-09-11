# 1tsuki/Cydonia-24B-v4.3

## Resumen

Cydonia 24B v4.3 es un ajuste fino (fine-tune) del modelo Mistral Small 3.2 24B Instruct (versión 2506), publicado por el usuario 1tsuki en HuggingFace, aunque la model card atribuye el trabajo a Drummer (TheDrummer) y a la comunidad BeaverAI. Se trata de un modelo orientado explícitamente a creatividad, escritura literaria y roleplay, no a razonamiento, matemáticas o código: el propio autor declara que la inteligencia y la corrección no son su prioridad, sino la calidad prosística, el dinamismo narrativo y la ausencia de conductas de rechazo.

El modelo se presenta como la versión 4.3 de la línea Cydonia, con mejoras centradas en roleplay y en la capacidad de introducir elementos narrativos no mencionados explícitamente en el prompt. Soporta el modo de razonamiento mediante etiquetas `<thinking>`/`</thinking>`, aunque también funciona sin activarlo, y emplea la plantilla de chat Mistral v7 Tekken. El repositorio ocupa 47,2 GB y contiene pesos en formato safetensors.

La relevancia de esta ficha es limitada por la escasez de datos verificables: el repositorio no declara licencia, idiomas soportados ni pipeline, no incluye resultados de benchmarks y acumula cero descargas y cero valoraciones en el momento de la consulta. Además, la model card es fundamentalmente promocional y contiene enlaces a Discord, Patreon y redes del autor, sin secciones técnicas convencionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (heredada del modelo base Mistral Small 3.2 24B; no detallada en la model card) |
| Parámetros totales | 24B según la nomenclatura del modelo; el campo de safetensors del repositorio informa 414,720 (dato inconsistente, ver nota) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo publica safetensors; no se incluyen GGUF, GPTQ ni AWQ) |
| Idiomas soportados | No disponible (la model card está redactada íntegramente en inglés) |
| Licencia | No disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors |

Nota sobre los parámetros: el listado de safetensors del repositorio indica 414,720 parámetros, una cifra incompatible con el nombre del modelo (24B) y con el tamaño del repositorio (47,2 GB). Un modelo de 24 000 millones de parámetros en bf16 ocupa aproximadamente 48 GB, por lo que el tamaño del repositorio sí es coherente con 24B y el valor de 414,720 debe interpretarse como un error de la plataforma o como una métrica distinta a la de parámetros totales.

## Arquitectura y entrenamiento

No se dispone de información sobre el proceso de entrenamiento: la model card no detalla el número de tokens, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni hiperparámetros de ajuste. Lo único documentado es el modelo base, Mistral Small 3.2 24B Instruct (2506), un transformer decoder denso de 24 000 millones de parámetros, y el uso de la plantilla de chat Mistral v7 Tekken.

La innovación que el autor destaca es de naturaleza conductual, no arquitectónica: el modelo incorpora de forma natural elementos narrativos relevantes que no aparecen explícitamente en el prompt, mantiene coherencia de personaje en roleplay y ofrece respuestas de longitud adecuada con pocas regeneraciones necesarias. El autor indica que esta versión puede ser "más positiva" o mostrar algún rechazo en comparación con versiones previas, en contraste con el enfoque habitualmente menos alineado de la línea Cydonia. También confirma que el bloque `<thinking>`/`</thinking>` funciona y que el modelo es usable sin activarlo.

## Capacidades

- Generación de texto creativo: narrativa de ficción, prosa literaria y descripciones extensas.
- Roleplay multi-turno con tarjetas de personaje, con consistencia de personaje según el autor.
- Iniciativa narrativa: introduce elementos no presentes en el prompt pero coherentes con la historia.
- Modo de razonamiento opcional mediante etiquetas `<thinking>`/`</thinking>`.
- Funcionamiento sin modo thinking, con la misma plantilla de chat Mistral v7 Tekken.
- Escritura de giros argumentales y diálogo con voz diferenciada por personaje.
- Capacidades multilingües: no disponibles (no declaradas).
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de visión o audio: no documentadas.
- Código y matemáticas: no documentadas; el autor sitúa explícitamente estos ámbitos fuera de sus prioridades.

## Casos de uso

- Roleplay conversacional de largo recorrido: el modelo está ajustado específicamente para mantener personajes coherentes turno a turno y para no repetir fórmulas de rechazo, lo que lo hace adecuado para plataformas de entretenimiento conversacional.
- Escritura de ficción asistida: generación de escenas, diálogos y descripciones con estilo prosístico cuidado, aprovechando la iniciativa narrativa del modelo para desbloquear tramas.
- Partidas de rol de mesa (_text RPG_) con un director de juego automático: su capacidad de introducir elementos no solicitados permite que la partida avance sin que el usuario tenga que detallar cada evento.
- Creación de personajes y tarjetas de personaje: el modelo responde de forma diferenciada según la definición de cada personaje, útil para autores que validan fichas antes de publicarlas.
- Generación de borradores para guiones y relatos serializados: la longitud y calidad de las respuestas declaradas por el autor reducen la necesidad de reescribir, lo que acelera la producción de contenido editorial.
- Investigación sobre alineamiento y rechazo: al tratarse de un fine-tune deliberadamente poco alineado, sirve como caso de estudio comparativo frente a modelos con capas de seguridad agresivas.
- Pruebas de estrés de coherencia narrativa: útil para evaluar cómo un modelo de 24B sostiene estado narrativo en conversaciones largas, siempre que se verifique antes su ventana de contexto real.
- Prototipado de asistentes con personalidad definida: para demos internas donde prime el tono y la voz sobre la precisión factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra); únicamente recoge valoraciones subjetivas de usuarios sobre calidad de roleplay, estilo de escritura y necesidad de regenerar respuestas.

## Requisitos de hardware

Estimaciones calculadas a partir de un modelo denso de 24 000 millones de parámetros; no proceden de mediciones publicadas por el autor.

- Precisión bf16/fp16: pesos de aproximadamente 48 GB, más caché KV y activaciones, lo que exige del orden de 55-64 GB de VRAM.
- Cuantización de 8 bits: pesos de aproximadamente 24 GB, con un requisito total estimado de 28-32 GB de VRAM.
- Cuantización de 4 bits: pesos de aproximadamente 13-14 GB, con un requisito total estimado de 16-20 GB de VRAM según longitud de contexto.
- GPU de centro de datos: una H100 de 80 GB o una A100 de 80 GB bastan para bf16; con A100 de 40 GB se necesita paralelismo tensorial en dos unidades para bf16.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede ejecutar cuantizaciones de 4 bits con comodidad y de 8 bits de forma ajustada; tarjetas de 16 GB (RTX 4080, RTX 4070 Ti Super) requieren 4 bits y contextos limitados.
- Despliegue: transformers, vLLM, TGI y SGLang pueden cargar los safetensors publicados. llama.cpp y Ollama requerirían una conversión a GGUF que el repositorio no proporciona.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cydonia 24B v4.3 (este modelo) | 24B (nomenclatura; dato de safetensors inconsistente) | No disponible | Roleplay y escritura creativa, poco alineado | No disponible | Repositorio con 0 descargas, 0 likes |
| Mistral Small 3.2 24B Instruct 2506 (modelo base) | 24B | No disponible en la información proporcionada | Asistente generalista con alineamiento | No disponible en la información proporcionada | Modelo oficial de Mistral AI |
| Cydonia 24B v4.2.0 (versión previa) | 24B | No disponible | Roleplay y escritura creativa | No disponible | Referenciado en la model card de v4.3 |

No se dispone de datos de rendimiento comparativos entre estas opciones, por lo que la comparación se limita a enfoque, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica objetiva publicada, de modo que cualquier afirmación sobre su calidad se basa en opiniones recogidas en la propia model card.
- Licencia no declarada: no se especifica la licencia del modelo derivado, lo que impide determinar si el uso comercial está permitido. El modelo base Mistral Small 3.2 24B se distribuye bajo licencia Apache 2.0 según su repositorio oficial, pero la licencia de este fine-tune no está indicada.
- Discrepancia de autoría: el repositorio pertenece al usuario 1tsuki, mientras que la model card atribuye el modelo a Drummer (TheDrummer) y a la comunidad BeaverAI. Conviene verificar si se trata de una publicación oficial o de una réplica antes de usarlo en producción.
- Metadatos anómalos: la fecha de creación registrada es 2026-09-10 y el recuento de parámetros de safetensors (414,720) es incompatible con el nombre del modelo y con el tamaño del repositorio.
- Idiomas no declarados: no hay información sobre cobertura multilingüe. La model card está en inglés y los testimonios citados son de habla inglesa, por lo que el rendimiento en castellano no está verificado.
- Longitud de contexto desconocida: no se documenta la ventana de contexto efectiva, un dato crítico para roleplay de largo recorrido y para conversaciones multi-turno.
- Riesgo de alucinación: el modelo prioriza creatividad sobre corrección factual por diseño, lo que lo hace inadecuado para tareas que requieran precisión verificable.
- Sesgos y contenido: el autor declara explícitamente que el modelo busca usos "que no requieren alineamiento", lo que implica menor filtrado de contenido sensible. Esto exige revisión humana en cualquier despliegue orientado al público.
- Comportamiento variable: la propia model card advierte de que esta versión "puede rechazar o ser más positiva" que versiones anteriores, es decir, el comportamiento de rechazo no es estable ni predecible.
- Documentación insuficiente para producción: no hay pipeline declarado, ni idiomas, ni licencia, ni formato cuantizado, ni resultados medidos de latencia o throughput.
- Riesgo en tool calling y agentes: no se documenta soporte de function calling ni razonamiento multi-paso, por lo que no debería asumirse su uso en pipelines agénticos sin validación previa.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/1tsuki/Cydonia-24B-v4.3
- Modelo base en HuggingFace: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Perfil del autor citado en la model card: https://huggingface.co/TheDrummer
- Servidor de Discord de la comunidad citada: https://discord.gg/BeaverAI
- Enlaces del autor recopilados en la model card: https://linktr.ee/thelocaldrummer
- Patreon del autor: https://www.patreon.com/TheDrummer
- Resultados de búsqueda web: no se han encontrado enlaces relevantes. Las búsquedas devolvieron páginas de TikTok, un vídeo musical de YouTube y una entrada de Wikipedia sobre la abreviatura "TT", ninguna de ellas relacionada con el modelo.
