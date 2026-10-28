# credible-ai/olmo2-1B-24domains-dirichlet-lightgbm-arc

## Resumen

`olmo2-1B-24domains-dirichlet-lightgbm-arc` es un modelo de lenguaje de 1.414.678.528 parámetros publicado por credible-ai, construido sobre la arquitectura OLMo 2 (`Olmo2ForCausalLM`) y entrenado desde cero con 32.000 millones de tokens procedentes del corpus WebOrganizer. No es un modelo de propósito general: el propio autor lo describe como un artefacto de investigación para reproducir los experimentos del artículo LinMix sobre mezcla de datos.

El interés técnico del modelo reside en cómo se eligió su distribución de entrenamiento. WebOrganizer está organizado en 24 temáticas y los pesos de mezcla entre ellas no se fijaron a mano, sino que se optimizaron con RegMix usando un surrogate LightGBM ajustado sobre un enjambre Dirichlet de modelos proxy de 30M de parámetros, tomando la métrica del benchmark ARC como objetivo. El resultado es un modelo denso de 18 capas y dimensión oculta 2048 con tokenizador GPT-NeoX-20B (vocabulario de 50.432 entradas).

Su relevancia es metodológica más que de producto: sirve como punto de control reproducible para estudiar cómo la composición del corpus afecta al rendimiento en tareas concretas, y como base preentrenada (sin ajuste por instrucciones) para experimentos de escalado y de mezcla de dominios. Los pesos se distribuyen en safetensors y bfloat16 bajo licencia MIT, con un repositorio de 2,8 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo 2 (`Olmo2ForCausalLM`), transformer decoder-only denso |
| Parámetros totales | 1.414.678.528 (1,41B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | pesos publicados en bfloat16; no hay versiones cuantizadas oficiales (conversión a 8/4 bits posible con herramientas estándar, no validada por el autor) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT (pesos); datos de entrenamiento sujetos a CC-BY-4.0 y a los términos de uso de Common Crawl |
| Formato de pesos | safetensors (bfloat16) |
| Capas | 18 |
| Dimensión oculta | 2048 |
| Tokenizador | GPT-NeoX-20B, vocabulario de 50.432 |
| Tokens de entrenamiento | 32B |
| Framework de entrenamiento | OLMo-core |
| Tamaño del repositorio | 2,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de OLMo 2 en configuración pequeña: un transformer decoder-only denso de 18 capas con tamaño oculto 2048 y 1,41B de parámetros, implementado en Transformers como `Olmo2ForCausalLM` y entrenado con OLMo-core. El tokenizador es el de GPT-NeoX-20B con 50.432 entradas, por lo que el modelo comparte espacio de tokens con la familia Pythia y con otros modelos entrenados sobre ese vocabulario. No se documentan mecanismos adicionales como atención lineal, decodificación especulativa o capas MoE.

El entrenamiento consume 32.000 millones de tokens muestreados del corpus WebOrganizer, derivado del pool DCLM 1b-1x y organizado en 24 temáticas. La innovación está en el muestreo: se ajustó un surrogate LightGBM sobre las curvas de rendimiento de un enjambre de modelos proxy de 30M de parámetros entrenados con pesos Dirichlet (`credible-ai/olmo2-30M-24domains-dirichlet`), y esos pesos de mezcla se transfirieron al modelo de 1B para optimizar el rendimiento en ARC. El repositorio incluye un fichero `mix.json` con la mezcla efectiva de datos de entrenamiento. No se menciona en la información disponible ninguna fase de RLHF, DPO o ajuste por instrucciones: es un modelo exclusivamente preentrenado.

## Capacidades

- Generación de texto autoregresiva en inglés a partir de un prompt; al no estar ajustado por instrucciones, no sigue directrices de formato ni mantiene rol de asistente de forma fiable.
- Modelo base para continuación de texto y para fine-tuning supervisado posterior en tareas concretas.
- Capacidad de razonamiento y matemáticas no evaluada ni documentada en la información disponible.
- Soporte de tool calling / function calling: no disponible (requiere ajuste específico; el modelo no incluye plantilla de chat ni formato de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible por defecto; solo alcanzable mediante fine-tuning o prompting sobre la base preentrenada.
- Capacidades multilingües: limitadas al inglés según la model card; no se declara soporte de otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Uso previsto principal: reproducibilidad de experimentos de mezcla de datos y evaluación comparativa de mezclas sobre benchmarks como ARC.

## Casos de uso

- Reproducción de los experimentos de LinMix: el modelo es el artefacto de referencia para replicar la mezcla de 24 dominios optimizada con RegMix y comparar curvas de entrenamiento frente a mezclas uniformes o heurísticas.
- Estudio de mezcla de datos (data mixing): sirve como punto de control a escala 1B para validar si una mezcla optimizada con un proxy de 30M mantiene su ventaja al escalar, analizando el `mix.json` adjunto.
- Baseline preentrenado para fine-tuning de dominio: al ser un modelo denso de 1,41B con contexto de entrenamiento en inglés, se puede ajustar con SFT en tareas como clasificación de documentos web, resumen o extracción de campos, partiendo de una base ya expuesta a 24 temáticas del corpus.
- Investigación en leyes de escalado y asignación de cómputo: el par formado por el proxy de 30M y este modelo de 1B permite estudiar la transferibilidad de rankings entre escalas con presupuesto de 32B tokens.
- Generación de datos sintéticos controlados: útil para producir texto temáticamente sesgado hacia los dominios sobrerrepresentados por la mezcla óptima para ARC, por ejemplo para aumentar un corpus de razonamiento científico.
- Docencia y divulgación sobre arquitecturas OLMo 2: con 2,8 GB de pesos en bfloat16 se puede cargar en una GPU de consumo y recorrer el pipeline completo (tokenizador GPT-NeoX, `Olmo2ForCausalLM`, OLMo-core) sin infraestructura dedicada.
- Ablaciones de tokenizador y vocabulario: al compartir vocabulario con GPT-NeoX-20B, permite comparaciones controladas frente a modelos Pythia con el mismo espacio de tokens.
- Evaluación de sesgos de corpus web: el modelo puede emplearse para medir cómo la sobrerrepresentación de determinados temas de Common Crawl afecta a las continuaciones generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la mezcla de datos se optimizó tomando ARC como objetivo, pero no incluye puntuaciones de ARC, MMLU, HumanEval, GSM8K ni de ningún otro benchmark para este checkpoint, ni curvas de pérdida de validación.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 2,83 GB solo para pesos (1,41B × 2 bytes), más caché KV y activaciones; en la práctica, unos 4-6 GB de VRAM con contextos moderados.
- VRAM estimada con cuantización: en torno a 1,4 GB en 8 bits y 0,7-0,9 GB en 4 bits (estimación a partir del número de parámetros; no hay versiones cuantizadas publicadas por el autor).
- GPU recomendadas: cualquier GPU con 8 GB o más para bfloat16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10G). Para servicio con concurrencia alta, A100 40/80 GB o H100 permiten lotes mayores.
- Cabe en GPU de consumo: sí, comfortably en tarjetas de 8-12 GB en bfloat16 y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), vLLM (comprobar que la versión en uso soporte `Olmo2ForCausalLM`), TGI, y llama.cpp/Ollama previa conversión a GGUF, que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmo2-1B-24domains-dirichlet-lightgbm-arc (este) | 1,41B | no disponible | Mezcla de 24 dominios optimizada para ARC; reproducibilidad de LinMix | MIT | Pesos en HF, safetensors bfloat16 |
| OLMo 2 1B (AllenAI) | clase 1B; dato exacto no verificado en esta ficha | no disponible | Modelo base de propósito general | licencia abierta de AllenAI (no verificada aquí) | Pesos públicos en HF |
| Pythia 1.4B (EleutherAI) | clase 1,4B; dato exacto no verificado en esta ficha | no disponible | Suite de investigación sobre orden de entrenamiento | Apache 2.0 según su model card (no verificada aquí) | Pesos públicos en HF |
| TinyLlama 1.1B | clase 1,1B; dato exacto no verificado en esta ficha | no disponible | Modelo base/chat compacto | Apache 2.0 según su model card (no verificada aquí) | Pesos públicos en HF |

La comparación relevante no es de rendimiento bruto, sino de propósito: frente a los modelos base generalistas de la misma clase, este checkpoint está especializado en una única mezcla de dominios y no declara métricas de calidad general. Para datos de benchmarks de los alternativas, consultar sus model cards; en la información proporcionada no hay cifras comparables.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo califica explícitamente de artefacto de investigación; no debe usarse como asistente en producción sin un ajuste posterior.
- Solo inglés declarado; el rendimiento en otros idiomas, incluido el castellano, es impredecible y no está evaluado.
- Ausencia de ajuste por instrucciones (sin RLHF/DPO documentado): no respeta formatos de chat, no rechaza peticiones dañinas de forma fiable y puede producir continuaciones tóxicas o incoherentes.
- Riesgo de alucinación propio de un modelo base de 1,4B entrenado con 32B tokens: alta probabilidad de afirmaciones factualmente incorrectas y de derivar el texto fuera del tema.
- Sesgos heredados del corpus: WebOrganizer deriva del pool DCLM 1b-1x, filtrado de Common Crawl; la mezcla está sesgada deliberadamente hacia los dominios que mejoran ARC, lo que desequilibra la cobertura temática respecto al corpus original.
- Longitud de contexto no documentada: no se debe asumir una ventana concreta; conviene validar empíricamente el comportamiento más allá de unos pocos miles de tokens.
- Licencia MIT para los pesos, pero los datos subyacentes están sujetos a CC-BY-4.0 (DCLM 1b-1x) y a los términos de uso de Common Crawl; el uso comercial debe revisar esas condiciones además de la licencia del modelo.
- Sin métricas publicadas: no hay evidencia cuantitativa de calidad que respalde su adopción fuera del contexto de investigación para el que fue creado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/credible-ai/olmo2-1B-24domains-dirichlet-lightgbm-arc
- Modelo proxy del enjambre Dirichlet (30M): https://huggingface.co/credible-ai/olmo2-30M-24domains-dirichlet
- Código de LinMix: https://github.com/credibleai/linmix
- OLMo-core (framework de entrenamiento): https://github.com/allenai/OLMo-core
- Documentación de `Olmo2ForCausalLM` en Transformers: https://huggingface.co/docs/transformers/model_doc/olmo2
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado de entrenamiento: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Términos de uso de Common Crawl: https://commoncrawl.org/terms-of-use
