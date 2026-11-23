# NextTransformer/GQA-49B-Tokens

## Resumen

NextTransformer GQA es un checkpoint de comparación arquitectónica de 744.751.182 parámetros desarrollado por NextTransformer (repositorio Interactive-Active-AI). Es el punto final de la familia Grouped-Query Attention (GQA) dentro de un estudio que compara variantes de atención sobre una arquitectura transformer causal de 26 capas. El modelo se entrenó desde cero sobre el dataset ClimbMix durante 46.875 actualizaciones, con una longitud de contexto de 2.048 tokens. El "49B" del nombre del repositorio hace referencia al número de tokens de entrenamiento (49.152 millones), no al número de parámetros.

La relevancia de este checkpoint es fundamentalmente metodológica: sirve como referencia reproducible para estudiar cómo afecta el agrupamiento de cabezas de atención (12 cabezas de query agrupadas de cuatro en cuatro sobre 3 cabezas de key/value de dimensión 128) al coste de entrenamiento y a la calidad final, medida en bits por byte (BPB) y en CORE-22. No es un modelo pensado para producción ni para uso conversacional, sino un artefacto de investigación con licencia no declarada y sin datos publicados de idiomas soportados.

El modelo se distribuye en formato safetensors con pesos en precisión nativa y requiere cargarse mediante la implementación `nexttransformer` del autor, ya que la shell de referencia estándar (`ReferenceLM`) no reproduce esta variante sin value embeddings. La evaluación reportada por el autor es un BPB de validación de 0,6714 y un CORE-22 (×100) de 32,62, con una única semilla (42) y auditoría independiente pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only con Grouped-Query Attention (GQA) |
| Parametros totales | 744.751.182 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32/bf16; no se documenta) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`) |
| Capas | 26 |
| Cabezas de query | 12 |
| Cabezas key/value | 3 (dimension 128) |
| Dimensión FFN | 6.144 |
| Tokenizador | tiktoken (fichero `tokenizer.tiktoken.json`) |
| Dataset de entrenamiento | ClimbMix |
| Actualizaciones de entrenamiento | 46.875 |
| Tokens de entrenamiento | 49.152 millones (49B) |
| Semilla | 42 |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de 26 capas con atención completa y Grouped-Query Attention: 12 cabezas de query se agrupan de cuatro en cuatro sobre 3 cabezas de key/value de dimensión 128. Esta es la atención nativa de la familia, con la misma normalización de claves compartidas que la variante MQA, pero entrenada desde cero sin *uptraining* desde un checkpoint multi-head. La anchura del FFN es de 6.144, superior al 4×width habitual, lo que obliga a usar la clase `FlexibleMLP` al cargar los pesos. Los *value embeddings* están desactivados en esta familia porque su anchura depende de las cabezas key/value; el control multi-head equivalente sin value embeddings no se ha entrenado, lo que limita la comparación directa.

El entrenamiento se realizó sobre ClimbMix durante 46.875 actualizaciones con una sola semilla (42), partiendo de la rama congelada "Others" y sin trasladar todavía al código actual. El autor no documenta el número exacto de tokens vistos ni la composición del dataset, aunque el nombre del repositorio fija 49.152 millones de tokens. No se reporta RLHF, DPO ni ninguna fase de alineación posterior al preentrenamiento: es un modelo base (`pretrained`). Tampoco se ha medido el ahorro de KV-cache ni de decodificación que teóricamente aporta GQA frente a MHA, pese a ser uno de los motivos habituales para adoptar esta variante de atención.

## Capacidades

- Generación de texto causal autoregresiva (modelo base, sin ajuste instructivo).
- Predicción de siguiente token; útil como banco de pruebas para evaluar variantes de atención.
- Razonamiento y conocimiento general evaluados vía CORE-22 (puntuación 32,62 ×100).
- Modelado de lenguaje medido en bits por byte (BPB de validación 0,6714).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el tokenizador tiktoken y el dataset ClimbMix no se detallan por idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Contexto limitado a 2.048 tokens, insuficiente para tareas de contexto largo.

## Casos de uso

- Estudio comparativo de variantes de atención: el checkpoint permite reproducir el entrenamiento GQA frente a MHA y MQA sobre la misma arquitectura de 26 capas, midiendo BPB y CORE-22 para aislar el efecto del agrupamiento de cabezas.
- Investigación sobre eficiencia de KV-cache: aunque el autor no mide el ahorro, el modelo sirve para instrumentar el consumo de memoria de la caché con 3 cabezas key/value frente a las 12 de query en un entorno controlado.
- Reproducibilidad de experimentos de scaling: con 49.152 millones de tokens y una semilla fija (42), es un punto de referencia para replicar curvas de entrenamiento a pequeña escala.
- Docencia y formación en arquitecturas transformer: la implementación `nexttransformer` y el script de carga estricta permiten mostrar cómo se construye una shell nativa de GQA sin value embeddings.
- Pruebas de pipelines de carga de safetensors: el ejemplo oficial valida la carga estricta de pesos y el uso de un tokenizador tiktoken serializado en JSON.
- Generación de texto de dominio general a corta distancia: con 2.048 tokens de contexto puede usarse para completar prompts breves en tareas de *probing* lingüístico, sin expectativas de calidad conversacional.

## Benchmarks y rendimiento

| Evaluación | Resultado |
|---|---:|
| Validation BPB | 0,6714 |
| CORE-22 (×100) | 32,62 |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con modelos de referencia en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: con 744,75 M de parámetros, en fp32 (≈2,98 GB de pesos) se requieren aproximadamente 3-4 GB de VRAM; en bf16 (≈1,49 GB) unos 2-3 GB; en fp16 similar. El repo ocupa 2,9 GB en safetensors.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna con ≥4 GB de VRAM; también puede ejecutarse en CPU, como demuestra el ejemplo oficial con `CUDA_VISIBLE_DEVICES=""`.
- Opciones de despliegue: la model card solo documenta carga directa con `nexttransformer` + `safetensors` en PyTorch. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, y la shell nativa personalizada (sin value embeddings, con `FlexibleMLP`) complica la conversión a GGUF sin trabajo adicional.
- Latencia y throughput estimados: no disponibles. El autor no reporta mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| NextTransformer GQA (este) | 744,75 M | 2.048 | no disponible | Hugging Face (0 descargas) |
| NextTransformer MQA (misma familia) | no disponible en la información | no disponible | no disponible | no disponible |
| NextTransformer MHA (misma familia) | no disponible en la información | no disponible | no disponible | no disponible |

La model card menciona explícitamente las variantes MQA y MHA de la misma comparación arquitectónica, pero no proporciona sus recuentos de parámetros, contexto ni resultados en la información disponible. No se dispone de datos de benchmarks de modelos externos comparables en la documentación facilitada.

## Limitaciones y advertencias

- Modelo base sin alineación: no ha pasado por RLHF ni DPO, por lo que puede generar contenido sesgado, tóxico o incoherente en uso conversacional.
- Riesgo de alucinación elevado: al ser un modelo pequeño (744 M) y con solo 49B tokens de entrenamiento, su conocimiento factual es limitado.
- Contexto corto: 2.048 tokens restringen tareas de contexto largo, RAG con muchos documentos o conversaciones multi-turno extensas.
- Idiomas no documentados: no se especifica qué lenguas cubre ClimbMix ni el tokenizador; el uso en castellano no está garantizado.
- Licencia no declarada: no hay permiso explícito de uso comercial; debe tratarse como no apto para producción hasta aclaración del autor.
- Shell no estándar: la carga requiere la implementación `nexttransformer` en una revisión concreta y una construcción manual del modelo; no funciona con `AutoModelForCausalLM` de Transformers.
- Validación incompleta: una sola semilla (42), auditoría independiente del *run record* pendiente y control multi-head sin value embeddings no entrenado, lo que limita la solidez de las conclusiones comparativas.
- Sin medición de ahorro de KV-cache: la ventaja teórica de GQA no está cuantificada en este checkpoint.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/NextTransformer/GQA-49B-Tokens
- Repositorio NextTransformer (GitHub): https://github.com/Interactive-Active-AI/NextTransformer
- Registro de arquitectura GQA: https://github.com/Interactive-Active-AI/NextTransformer/blob/b2ea46627f7d0d5c9ef57a655c43b553558417d3/results/methods/gqa.json
- Registro de ejecución (run record): https://github.com/Interactive-Active-AI/NextTransformer/blob/b2ea46627f7d0d5c9ef57a655c43b553558417d3/results/runs/gqa.json
