# nsaroiu/mtg-deck-completion

## Resumen

mtg-deck-completion es un sistema de recomendación, no un modelo de lenguaje, que sugiere qué cartas faltan en un mazo de Magic: The Gathering del formato Commander (EDH) a partir de un comandante y, opcionalmente, de una lista parcial. Lo desarrolla el usuario nsaroiu y se distribuye en HuggingFace junto con el código de tokenización y entrenamiento en GitHub. El modelo se entrenó con 189.108 listas públicas reales extraídas de Moxfield, publicadas como dataset independiente (nsaroiu/moxfield-dump).

La pieza central es un vocabulario de cartas con embeddings híbridos: un vector aprendido por carta, sumado a un MLP sobre rasgos estructurados (identidad de color, coste de maná, tipo, keywords) y a un embedding semántico del texto oracle. El mazo se trata como un conjunto desordenado, de modo que un encoder invariante a permutaciones agrega las cartas conocidas más el comandante en un único vector que se puntúa contra todo el vocabulario mediante un producto escalar con pesos atados, al estilo word2vec.

En producción la inferencia es un ensemble de dos checkpoints especializados (uno para sinergias con self-attention y otro para staples con mean-pool) más un discriminador opcional de poda. Es relevante porque ataca un caso concreto y poco cubierto: asistentes de construcción de mazos que generalizan a comandantes nunca vistos apoyándose en el contenido de las cartas en lugar de en co-ocurrencias memorizadas. En el momento de la consulta el repositorio acumula 0 descargas y 0 likes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sistema de recomendación con embeddings híbridos de carta y encoder invariante a permutaciones; ensemble de dos checkpoints (Set Transformer con self-attention para sinergia y DeepSets con mean-pool para staples) más un discriminador opcional de poda |
| Parámetros totales | no disponible (la model card no declara el recuento) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; opera sobre conjuntos de cartas, no sobre una ventana de tokens |
| Tipos de cuantización | no disponible (checkpoints PyTorch en coma flotante; no se documenta cuantización) |
| Idiomas soportados | no disponible; el vocabulario son cartas de Magic y su texto oracle |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (tres checkpoints), más `tokenizer.json`, `tokenizer_text_embeddings.npy` y `card_tiers.json` |
| Tamaño del repositorio | 0,2 GB |
| Dataset de entrenamiento | nsaroiu/moxfield-dump (189.108 mazos públicos de Commander) |

## Arquitectura y entrenamiento

Cada carta recibe una representación híbrida compuesta por tres sumandos: un vector aprendido por carta, la salida de un MLP pequeño sobre rasgos estructurados (identidad de color, coste de maná, tipo y keywords) y un embedding semántico de frase calculado sobre su texto oracle. Este diseño hace que una carta poco frecuente en el corpus arranque desde una representación significativa en lugar de casi aleatoria, lo que es la base de la generalización a comandantes no vistos.

El mazo se modela como un conjunto desordenado: un encoder invariante a permutaciones (mean-pool o self-attention, según el checkpoint) agrega las cartas conocidas y el comandante en un único vector, que se puntúa contra el vocabulario completo de cartas mediante un producto escalar con pesos atados, siguiendo el esquema de word2vec. La inferencia en producción combina dos especialistas entrenados por separado porque, según el autor, un único modelo y una única función de pérdida obligaban a canjear reconocimiento de staples por calidad del ranking de sinergias. La fase de sinergia (Set Transformer) genera de forma iterativa en bloques pequeños, recalculando la condición sobre sus propias elecciones previas; la fase de backfill (DeepSets) completa los staples casi universales hasta un recuento objetivo realista; y una pasada opcional de poda vuelve a puntuar el mazo ensamblado y elimina la carta peor ajustada.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; el pipeline es de aprendizaje supervisado sobre listas reales, con evaluación por Recall@50, Precision@50 y MRR sobre mazos reservados.

## Capacidades

- Completar mazos de Commander a partir de un comandante y, opcionalmente, de una lista parcial de cartas.
- Generación iterativa de piezas de sinergia y combo, recalculando las recomendaciones sobre las elecciones anteriores.
- Reconocimiento y backfill de staples casi universales (por ejemplo, Sol Ring o Command Tower) hasta un recuento objetivo.
- Poda opcional de mazos ya ensamblados mediante un discriminador que vuelve a puntuar y descarta la carta peor ajustada.
- Soporte de comandantes partner (el CLI acepta `--commander` de forma repetible).
- Clasificación de cartas por tiers (staple, mid-tier y long-tail) en `card_tiers.json`.
- Filtro determinista de legalidad por identidad de color aplicado como post-proceso (`legal_mask` en `training/complete_deck.py`).
- API Python (`ensemble_complete_deck`) y CLI (`training/ensemble.py`) con parámetros de tamaño de bloque, temperatura y checkpoint de poda.
- No soporta tool calling, function calling, agentes, generación de texto libre, visión ni audio; no es un modelo generativo de lenguaje.

## Casos de uso

- Asistente de construcción de mazos en una web o aplicación: el modelo recibe el comandante y la lista que el usuario lleva escrita y devuelve sugerencias puntuadas con su origen (`synergy` o `staple`), lo que permite mezclar descubrimiento y relleno de staples en la misma interfaz.
- Autorrelleno de mazos para jugadores noveles: la fase de backfill garantiza que las cartas casi obligatorias del formato estén presentes, evitando listas incompletas o sin ramp ni tierras de comandante.
- Descubrimiento de sinergias para comandantes nuevos: la evaluación sobre comandantes no vistos en entrenamiento (Recall@50 entre 0,29 y 0,44) indica que el modelo recomienda por contenido de carta y no solo por co-ocurrencia, lo que resulta útil justo después de una nueva expansión.
- Poda de mazos sobredimensionados: con `--prune-checkpoint`, el discriminador re-puntúa una lista de más de 100 cartas y señala las peores incorporaciones, un paso que ningún modelo puramente generativo puede hacer.
- Generación de listas semilla para playtesting: partiendo de un comandante y cero cartas (mask ratio 0,9), el sistema produce un mazo completo con Precision@50 de 0,54 sobre el checkpoint de staples, suficiente para iterar rápidamente en pruebas.
- Analítica de popularidad de cartas: `card_tiers.json` permite segmentar el vocabulario en staple, mid-tier y long-tail para estudios de metajuego o para priorizar qué cartas mostrar en una herramienta de terceros.
- Integración en pipelines de terceros: al ser código Python con licencia MIT y checkpoints descargables vía `huggingface_hub`, se puede envolver en un servicio HTTP interno que consuma el frontend de una web de decks.

## Benchmarks y rendimiento

Evaluación del checkpoint de reconocimiento de staples sobre el split de validación, en función del porcentaje de mazo ya conocido (mask ratio bajo = mazo casi completo; alto = mazo casi vacío):

| Mask ratio | Recall@50 | Precision@50 | MRR |
|---|---|---|---|
| 0,1 (mazo casi completo) | 0,57 | 0,10 | 0,121 |
| 0,5 | 0,48 | 0,40 | 0,066 |
| 0,9 (mazo casi vacío) | 0,36 | 0,54 | 0,045 |

Split de comandantes no vistos en entrenamiento (generalización por contenido de carta en lugar de co-ocurrencia memorizada):

| Métrica | Valor |
|---|---|
| Recall@50 en el mismo rango de mask ratio | 0,29–0,44 |

El autor indica que el desglose completo por tier de popularidad de carta, así como las métricas propias de los checkpoints de sinergia y de poda, están en la salida de evaluación del repositorio de GitHub. No se han publicado resultados de benchmarks de otros modelos en la información disponible para establecer comparaciones directas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,2 GB, por lo que los tres checkpoints son pequeños y el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican modelos concretos; el código usa `pick_device()` para seleccionar el dispositivo automáticamente, por lo que basta con una GPU NVIDIA con CUDA operativa.
- Cabe en GPU consumer: sí, a tenor del tamaño del repositorio; no se publica una cifra exacta de VRAM ni de memoria en CPU.
- Opciones de despliegue: scripts PyTorch del repositorio (`training/ensemble.py` como CLI y `training/complete_deck.py` para un único especialista). No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ni paquete pip independiente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos comparables publicados con arquitectura y métricas equivalentes para recomendación de mazos de Commander.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nsaroiu/mtg-deck-completion | no disponible | no aplica (conjunto de cartas) | Recall@50 0,36–0,57 en validación; 0,29–0,44 en comandantes no vistos | MIT | Pesos en HuggingFace y código en GitHub; 0 descargas |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El ranking dentro del tier de staples es impreciso en contextos casi vacíos: el modelo acierta con aproximadamente un 90 % de precisión que una carta staple pertenece al mazo, pero no ordena con fiabilidad cuál concreta es el objetivo; la fase de backfill existe precisamente para paliar este comportamiento.
- La legalidad por identidad de color no se aprende: se impone como post-filtro determinista (`legal_mask`). Usar los logits en crudo sin ese filtro puede producir recomendaciones ilegales para el comandante elegido.
- La model card original está truncada en el apartado de limitaciones ("Using the raw logits withou..."), por lo que puede haber advertencias adicionales del autor no recogidas aquí.
- No se declara el número de parámetros, la composición exacta del dataset ni los detalles de entrenamiento, lo que dificulta la reproducibilidad y la comparación con otros sistemas.
- El modelo está entrenado exclusivamente con listas públicas de Moxfield del formato Commander; cabe esperar sesgo hacia estilos de mazo sobrerrepresentados en plataformas online (mazos populares, competitivos o de creadores de contenido) y un peor comportamiento en estrategias minoritarias.
- El alcance es únicamente Commander/EDH: no hay soporte declarado para otros formatos como Modern, Standard o Draft.
- No existe paquete pip ni API de servicio: para usarlo hay que clonar el repositorio de GitHub e instalar sus dependencias, lo que añade fricción de integración y acopla el despliegue al código de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación independiente de la comunidad sobre los resultados reportados.
- Las métricas publicadas se limitan a Recall@50, Precision@50 y MRR; no se informan métricas de diversidad, coherencia de curva de maná ni satisfacción de jugadores.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar los términos de Moxfield y de los datos de origen de las listas antes de explotar el modelo en un producto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nsaroiu/mtg-deck-completion
- Dataset de entrenamiento: https://huggingface.co/datasets/nsaroiu/moxfield-dump
- Código de tokenizador, modelo y pipeline de entrenamiento/evaluación: https://github.com/nsaroiu/mtg-deck-completion
- Origen de las listas de mazos: https://moxfield.com
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo enlaces genéricos a Gmail), por lo que no hay papers, blogs ni demos adicionales que enlazar.
