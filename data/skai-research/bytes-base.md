# skai-research/bytes-base

## Resumen

`skai-research/bytes-base` es un modelo de lenguaje base a nivel de byte desarrollado por Skai Research, publicado como el «baseline plano» del artículo *Dynamic Multi-Byte Prediction With Hierarchical Language Models*. Se trata de un transformer decoder de 22 capas que procesa texto byte a byte, sin tokenizador, sin segmentación y sin jerarquía: cada byte de la entrada consume un paso completo de forward, lo que lo convierte en el punto de referencia contra el que se comparan las variantes jerárquicas del mismo trabajo.

El modelo tiene 369.679.424 parámetros reales (374M según la model card), un vocabulario de 261 símbolos (256 bytes más `<pad>`, `</s>`, `<unk>`, `<en>` y `<eot>`), una ventana de contexto de 4096 bytes y pesos almacenados en fp32 (repo de 1,5 GB). Se preentrenó sobre el subconjunto `sample-100BT` de FineWeb-Edu durante 48.186 pasos, y alcanza un BPC (bits por carácter) de 0,888 en validación.

Su relevancia es fundamentalmente de investigación: permite estudiar hasta qué punto un modelado puramente byte-level, sin decisiones de tokenización, es competitivo en eficiencia de compresión y en robustez, y sirve como base reproducible para fine-tuning o para experimentos sobre lenguajes, ruido y unicode donde los tokenizadores BPE fallan. No es un modelo de instrucciones ni un modelo de chat: es un checkpoint preentrenado en inglés, sin RLHF ni DPO, y no es compatible con la arquitectura `transformers` estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder a nivel de byte, plano, 22 capas (`model_config`: `[22, (0,), 0, 0]`, `attn_type`: `None`) |
| Parametros totales | 369.679.424 (374M según model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4096 bytes |
| Tipos de cuantizacion | No disponible; solo se publican pesos en fp32, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (etiqueta `en`); entrenado únicamente con FineWeb-Edu |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (precisión fp32; repo de 1,5 GB) |

Otros datos de la model card: vocabulario de 261 símbolos, precisión fp32, 48.186 pasos de entrenamiento y BPC de validación de 0,888. La dimensión oculta, el número de cabezas de atención y la configuración exacta del optimizador no están disponibles en la información proporcionada.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder «plano» de 22 capas que opera directamente sobre bytes: no hay tokenizador, no hay segmentación en parches y no hay jerarquía multiescala. La model card lo describe explícitamente con la frase «every byte costs one forward pass», es decir, una secuencia de 4096 bytes equivale a 4096 posiciones de atención, con el coste cuadrático que eso implica. El vocabulario de 261 entradas reserva los 256 valores de byte y añade cinco símbolos especiales (`<pad>`, `</s>`, `<unk>`, `<en>`, `<eot>`), lo que permite alimentar cualquier flujo de bytes sin normalización previa. El campo `attn_type: None` de la configuración sugiere que el modelo utiliza la atención estándar sin variantes declaradas, aunque no se detalla en la información disponible.

El entrenamiento consistió únicamente en preentrenamiento (no se mencionan fases de RLHF, DPO ni instrucciones) sobre el subconjunto `sample-100BT` del dataset FineWeb-Edu, con la configuración `configs/train/modern_fxt_baseline_btyes_256_scale_bp_dual.yaml` del repositorio `skai-research/lca-multibyte`. La innovación que este checkpoint aísla no está en el propio modelo, sino en su papel metodológico: es la línea base sin jerarquía del artículo sobre predicción dinámica multi-byte, de modo que cualquier mejora de las variantes jerárquicas (predicción de varios bytes por paso, fronteras de segmentación aprendidas) puede medirse contra él en términos de BPC y de coste computacional.

## Capacidades

- Modelado de lenguaje autoregresivo a nivel de byte en inglés; no es un modelo de instrucciones ni de chat.
- Completado de texto y puntuación de probabilidad por byte, útil como modelo de referencia para calcular BPC o perplejidad sobre corpus en inglés.
- Procesamiento de texto crudo sin tokenizador, lo que permite alimentar directamente bytes UTF-8, artefactos, erratas, espaciado irregular o contenido no normalizado sin pasos previos de preprocesado.
- Capacidad de servir como checkpoint inicial (fine-tuning) para tareas supervisadas en inglés, dado que es un modelo base preentrenado.
- No se documenta soporte de tool calling, function calling, uso de agentes ni razonamiento multi-paso.
- No se documenta modo de razonamiento (thinking), visión, audio ni modalidades adicionales.
- Capacidad multilingüe: no disponible; el modelo está etiquetado solo como inglés y el corpus de entrenamiento es FineWeb-Edu, mayoritariamente en inglés.
- El script de generación del repositorio incluye una opción `--show_tokenization` para imprimir fronteras de segmentación, si bien el baseline plano no aprende jerarquía alguna.

## Casos de uso

- Investigación en modelado libre de tokenizador: emplear el checkpoint como baseline cuantitativo (BPC 0,888) para medir la ganancia de arquitecturas jerárquicas o de predicción multi-byte frente a un transformer plano byte a byte.
- Filtrado y curación de corpus: usar el modelo para puntuar texto byte a byte en inglés y descartar documentos anómalos, con la ventaja de que no depende de un vocabulario BPE concreto y puede procesar contenido sucio o mal codificado.
- Robustez ante ruido y unicode: evaluar cómo se comporta un modelo sin tokenizador frente a erratas, homoglifos, emojis o secuencias de control, un escenario donde los tokenizadores basados en BPE suelen fragmentar de forma inconsistente.
- Fine-tuning para clasificación o etiquetado a nivel de carácter o de span de bytes, aprovechando que la unidad de entrada y de salida es el byte, útil en tareas de extracción de entidades con offsets exactos.
- Experimentos académicos de eficiencia: comparar el coste de entrenamiento e inferencia de un modelo byte-level de 374M frente a alternativas con tokenizador del mismo orden de parámetros, gracias a los 48.186 pasos y la configuración de entrenamiento publicados.
- Generación de texto corto en inglés con fines de demostración o evaluación cualitativa, mediante el script `src/eval/generate.py` del repositorio, siempre como modelo base sin ajuste a instrucciones.
- Reproducción de resultados: replicar el entrenamiento o la evaluación del artículo usando el dataset y la configuración indicados, para verificar el BPC reportado en un entorno propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo reporta métricas de preentrenamiento:

| Metrica | Valor |
|---|---|
| Byte-level BPC (validación) | 0,888 |
| Pasos de entrenamiento | 48.186 |

No hay datos de comparación con otros modelos en la información proporcionada, por lo que no es posible afirmar posicionamiento relativo en tareas downstream.

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 1,48 GB en fp32 (coherente con el repo de 1,5 GB). Una conversión manual a fp16 reduciría el peso a unos 0,74 GB y a int8 a unos 0,37 GB, pero no se publican versiones cuantizadas ni se documenta soporte para ello.
- VRAM estimada para inferencia: en torno a 2 GB con pesos fp32 más caché de activaciones, cifra que depende de la dimensión oculta (no disponible) y del tamaño de lote. Con lotes grandes y contexto completo de 4096 bytes la atención cuadrática eleva el consumo de activaciones de forma notable.
- GPU recomendadas: cualquier GPU con 4 GB o más de memoria es suficiente para inferencia en fp32 a lote 1; una RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. El modelo cabe holgadamente en GPU de consumo.
- CPU: viable para inferencia a lote 1 con suficiente RAM, aunque sin datos de latencia publicados.
- Opciones de despliegue: no es una arquitectura `transformers`, por lo que no funciona con `AutoModel` ni con servidores habituales (vLLM, TGI, llama.cpp, Ollama) salvo que se implemente una integración propia. La vía soportada es clonar `skai-research/lca-multibyte`, exportar `PYTHONPATH` y cargar el modelo con `src.eval.model_loader.load_fxt_model`, o generar con `src/eval/generate.py --mode cached`.
- Latencia y throughput: no disponibles. Como referencia estructural, la propia model card advierte que cada byte implica un forward completo, lo que encarece la inferencia frente a un modelo con tokenizador que procesaría el mismo texto en muchas menos posiciones.

## Comparativa con modelos similares

No existen benchmarks compartidos con alternativas en la información proporcionada, por lo que la comparación es estructural. Los datos de los modelos alternativos proceden de su documentación pública y no se han podido verificar con la información disponible.

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| skai-research/bytes-base | Transformer plano byte-level, sin tokenizador | 374M | 4096 bytes | Apache 2.0 | safetensors en HuggingFace, carga con código propio |
| ByT5 (Google Research) | Transformer encoder-decoder sobre bytes UTF-8 | 580M (variante base) | 1024 bytes en configuración estándar | Apache 2.0 | Pesos abiertos, integración en `transformers` |
| Pythia-410M (EleutherAI) | Transformer decoder con tokenizador BPE | 410M | 2048 tokens | Apache 2.0 | Pesos abiertos, integración en `transformers` |
| SmolLM2-360M (HuggingFace) | Transformer decoder con tokenizador BPE | 360M | 8192 tokens | Apache 2.0 | Pesos abiertos, integración en `transformers` |

La diferencia clave frente a los tres alternativos no es de tamaño, sino de unidad de procesado: bytes frente a tokens. Eso implica mayor coste por carácter, pero independencia total del vocabulario y de las decisiones de normalización. Frente a ByT5, además, `bytes-base` es decoder-only y está pensado para modelado autoregresivo, no para tareas de secuencia a secuencia.

## Limitaciones y advertencias

- Es un modelo exclusivamente preentrenado: no sigue instrucciones, no mantiene formato de chat y no incorpora RLHF, DPO ni ningún ajuste de alineamiento.
- Riesgo alto de alucinación y de texto incoherente en generación libre; con 374M parámetros la capacidad de almacenar conocimiento factual es limitada.
- Idioma: solo inglés. Aunque la entrada sea a nivel de byte y acepte cualquier UTF-8, no hay entrenamiento en otros idiomas, por lo que el rendimiento fuera del inglés no está garantizado.
- Contexto efectivo corto: 4096 bytes equivalen aproximadamente a entre 600 y 1000 palabras de inglés, muy por debajo de los 8192 tokens de modelos pequeños actuales con tokenizador, y sin opción documentada de extensión.
- Coste computacional: cada byte requiere un forward, de modo que procesar un texto cuesta muchas más posiciones de atención que con un modelo tokenizado del mismo tamaño.
- Cuantización: no hay variantes GGUF, AWQ ni GPTQ publicadas, lo que dificulta el despliegue en entornos de bajo consumo sin trabajo adicional de conversión.
- Integración: al no ser una arquitectura `transformers`, requiere el código del repositorio `lca-multibyte`; la licencia de ese código no se especifica en la información disponible (la del modelo es Apache 2.0).
- Sesgos: el modelo hereda los sesgos del subconjunto `sample-100BT` de FineWeb-Edu, un corpus web educativo filtrado en inglés, con la representación desigual que ello implica.
- Madurez: el repositorio registra 0 descargas y 0 «likes», y la model card marca `inference: false`, por lo que no hay validación independiente de la comunidad ni demo alojada.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar por separado la licencia del código de carga e inferencia antes de integrarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skai-research/bytes-base
- Artículo: *Dynamic Multi-Byte Prediction With Hierarchical Language Models*, arXiv:2608.15454 — https://arxiv.org/abs/2608.15454
- Repositorio de código: https://github.com/skai-research/lca-multibyte
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
