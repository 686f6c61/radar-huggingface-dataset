# hellnahbru/Genos-10B-preserved-20261029

## Resumen

Genos-10B-preserved-20261029 es una redistribución no oficial del modelo Genos 10B, un modelo fundacional de genómica humana desarrollado originalmente por BGI-HangzhouAI. Se trata de un transformer con arquitectura Mixture of Experts (MoE) de 10.270.248.960 parámetros totales y 2.870 millones de parámetros activos por token, diseñado para modelar secuencias de ADN humano a resolución de base única con un contexto de hasta un millón de pares de bases.

El modelo aborda un problema específico del ámbito bioinformático: la identificación de patrones funcionales profundos en secuencias genómicas que los métodos tradicionales de alineamiento no capturan. Frente a modelos de lenguaje generalistas, Genos opera sobre un vocabulario reducido de nucleótidos (256 entradas con padding) y fue entrenado con 2,2 billones de tokens de genomas de referencia de alta calidad, lo que lo convierte en una herramienta especializada para investigación genómica.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta una arquitectura MoE poco habitual en el dominio biológico; por otro, advierte de que se trata de una copia de terceros (usuario hellnahbru) sin pipeline declarado, sin idiomas especificados y con solo 28 descargas en el momento de la consulta, por lo que conviene remitirse al repositorio original de BGI-HangzhouAI para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) |
| Parámetros totales | 10.270.248.960 |
| Parámetros activos | 2,87 B (2 expertos de 8 seleccionados por token) |
| Longitud de contexto | hasta 1M de pares de bases |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias genómicas, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Número de capas | 12 |
| Dimensión de atención | 4096 |
| Cabezas de atención | 16 |
| Dimensión oculta MoE por experto | 8192 |
| Tamaño de vocabulario | 256 (con padding) |
| Tokens de entrenamiento | 2,2 billones |
| Tamaño del repositorio | 41,1 GB |

## Arquitectura y entrenamiento

Genos 10B emplea una arquitectura transformer con capas MoE de 8 expertos y enrutamiento top-2, es decir, cada token activa 2 de los 8 expertos, lo que resulta en 2,87 mil millones de parámetros activos sobre un total de 10 mil millones. La red consta de 12 capas con una dimensión de atención de 4096 y 16 cabezas, y cada experto tiene una dimensión oculta de 8192. El vocabulario está reducido a 256 entradas con padding, coherente con un tokenizador orientado a nucleótidos y no a texto natural.

El entrenamiento se realizó sobre 2,2 billones de tokens procedentes de cientos de genomas de referencia de alta calidad, según la model card original. El objetivo declarado es el modelado contextual de secuencias de hasta un millón de pares de bases con resolución de base única, lo que permite capturar patrones profundos y características funcionales del genoma. No se detallan en la información disponible las técnicas de alineación (RLHF/DPO), la composición exacta del dataset ni innovaciones como decodificación especulativa o atención lineal. Existen checkpoints adicionales entrenados bajo el framework Megatron-LM publicados por el autor original.

## Capacidades

- Modelado de secuencias genómicas humanas a resolución de base única.
- Contexto de hasta un millón de pares de bases para capturar dependencias de largo alcance en el ADN.
- Identificación de patrones de secuencia profundos y características funcionales del genoma.
- Aprendizaje de representaciones contextuales de nucleótidos mediante un vocabulario especializado de 256 entradas.
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso.
- No se ha documentado capacidad multilingüe ni modo de pensamiento (thinking mode).
- No se ha documentado visión, audio ni otras modalidades distintas de la secuencia genómica.

## Casos de uso

- Anotación funcional de variantes: el modelo puede procesar ventanas de hasta 1M de pares de bases alrededor de una variante para evaluar si el contexto genómico circundante sugiere impacto funcional, aprovechando su resolución de base única.
- Predicción de elementos reguladores: con 12 capas y atención de 4096 dimensiones, puede modelar regiones promotoras y enhancers en contextos largos donde los métodos basados en motivos fallan.
- Análisis de regiones no codificantes: el contexto de 1M de pb permite estudiar dominios topológicamente asociados (TAD) y regiones intergénicas que requieren dependencias de largo alcance.
- Búsqueda de patrones en genomas de referencia: útil para comparar secuencias ortólogas o identificar firmas de secuencia conservadas en conjuntos de genomas de alta calidad.
- Investigación en epigenómica computacional: como extractor de representaciones, puede alimentar modelos posteriores de metilación o accesibilidad de cromatina, dado su entrenamiento sobre genomas de referencia.
- Exploración de arquitecturas MoE en bioinformática: sirve como referencia para estudiar el enrutamiento top-2 en dominios de vocabulario reducido, comparando con los checkpoints Megatron del autor original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 20,5 GB solo para pesos (10,27 B de parámetros × 2 bytes), más overhead de activaciones y caché KV para contextos largos.
- Para contextos de hasta 1M de pares de bases, la caché KV escala de forma significativa; se recomienda GPU con 80 GB o más (A100 80GB, H100 80GB) para secuencias largas.
- En cuantización de 8 bits, los pesos ocuparían unos 10,3 GB; en 4 bits, unos 5,1 GB, lo que permitiría inferencia en GPUs consumer como RTX 4090 (24 GB) para contextos cortos o moderados. Los tipos de cuantización concretos no están documentados.
- Opciones de despliegue: al ser un modelo MoE con pesos safetensors, es compatible con frameworks como vLLM o TGI si se dispone de una configuración de arquitectura reconocida; llama.cpp/Ollama requerirían conversión a GGUF, no documentada en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Genos 10B (esta ficha) | 10,27 B | 2,87 B | hasta 1M pb | MIT | HuggingFace (copia de terceros) |
| Genos 1.2B | 1,2 B | 0,33 B | hasta 1M pb | MIT | HuggingFace (BGI-HangzhouAI) |
| Genos-Megatron-10B | 10 B | 2,87 B | hasta 1M pb | MIT | HuggingFace (BGI-HangzhouAI) |

No se dispone de información sobre otros modelos fundacionales de genómica comparables en la documentación proporcionada. La comparación más directa es con las variantes del mismo autor original (1.2B y Megatron-10B), que comparten arquitectura MoE, número de expertos y contexto, pero difieren en escala y framework de entrenamiento.

## Limitaciones y advertencias

- Se trata de una redistribución de terceros (usuario hellnahbru), no del repositorio oficial de BGI-HangzhouAI; no hay garantía de integridad de los pesos ni de correspondencia exacta con el checkpoint original.
- El repositorio no declara pipeline, idiomas ni tipos de cuantización, lo que dificulta su integración automática en herramientas estándar.
- Solo 28 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- Modelo especializado en secuencias genómicas, no en lenguaje natural; no debe emplearse para tareas de texto, código o conversación.
- Riesgo de alucinación inherente a los modelos generativos: las predicciones sobre función genómica deben validarse experimentalmente y no tomarse como evidencia clínica.
- Sesgos potenciales derivados del conjunto de genomas de referencia (mayoritariamente de poblaciones específicas), no documentados en la información disponible.
- Aunque la licencia es MIT, conviene verificar los términos del repositorio original de BGI-HangzhouAI antes de uso comercial.
- El contexto de 1M de pb implica un coste computacional y de memoria elevado; no es viable en GPUs consumer para secuencias completas.

## Enlaces

- Repositorio de esta copia: https://huggingface.co/hellnahbru/Genos-10B-preserved-20261029
- Repositorio original Genos-10B: https://huggingface.co/BGI-HangzhouAI/Genos-10B
- Repositorio original Genos-1.2B: https://huggingface.co/BGI-HangzhouAI/Genos-1.2B
- Checkpoint Megatron 10B: https://huggingface.co/BGI-HangzhouAI/Genos-Megatron-10B
- Checkpoint Megatron 1.2B: https://huggingface.co/BGI-HangzhouAI/Genos-Megatron-1.2B
- Repositorio GitHub de Genos: https://github.com/BGI-HangzhouAI/Genos
- Framework Megatron-LM: https://github.com/NVIDIA/Megatron-LM
