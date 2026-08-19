# FAIRC/token-averaging-avg_50m_k2_isoflop

## Resumen

El modelo `FAIRC/token-averaging-avg_50m_k2_isoflop` es un checkpoint de investigacion publicado por FAIRC dentro del proyecto de promediado de tokens (token averaging). Este proyecto explora si es posible aumentar la longitud de contexto efectiva de un modelo de lenguaje promediando k tokens consecutivos en una unica representacion, reduciendo asi la longitud de secuencia real sin modificar la arquitectura subyacente. El checkpoint corresponde a una ejecucion con k=2 y aproximadamente 50,9 millones de parametros, entrenado con un presupuesto de 2.500 millones de tokens.

Se trata de un artefacto experimental, no de un modelo listo para produccion. Los pesos no estan en formato Hugging Face `transformers` sino como un `state_dict` de PyTorch que requiere reconstruir la arquitectura desde los archivos de configuracion del repositorio fuente. Su interes principal reside en la investigacion sobre eficiencia de contexto y representaciones de embeddings, mas que en su uso directo como LLM generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMTransformerBody) con promediado de tokens (k=2) |
| Parametros totales | 50.897.408 (aprox. 50,9 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (contexto nativo; con promediado k=2 la longitud efectiva puede duplicarse) |
| Tipos de cuantizacion | no disponible (checkpoint en precisión nativa fp32/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer de 8 capas con `d_model=512` y 8 cabezas de atencion, con embeddings atados (tie_embeddings=true). La innovacion principal es el promediado de tokens: en lugar de procesar cada token individualmente, el modelo promedia k tokens consecutivos (en este caso k=2) para formar una unica representacion de entrada, reduciendo la longitud efectiva de la secuencia a la mitad. Esto permite procesar contextos mas largos con la misma ventana de 1024 tokens, manteniendo inalterada la arquitectura interna.

El entrenamiento se realizo con una tasa de aprendizaje de 0.0002, 2000 pasos de calentamiento y un objetivo de 2.500 millones de tokens. No se mencionan tecnicas de alineacion como RLHF o DPO. El checkpoint incluye registros de perdida (`loss_log.csv`, `loss_log_rope_bug.csv`, `loss_log_same_ctx.csv`) que sugieren experimentos con variaciones en la codificacion posicional (posible bug con RoPE) y en el contexto de entrenamiento.

## Capacidades

- Generacion de texto basica: al ser un modelo de 50 M de parametros, su capacidad generativa es limitada y no comparable a modelos de mayor tamano.
- Investigacion sobre promediado de tokens: permite analizar como afecta la reduccion de secuencia a la perdida, la representacion de embeddings y la longitud de contexto efectiva.
- Experimentacion con codificacion posicional: los logs incluidos permiten estudiar el impacto de bugs o variaciones en RoPE.
- No se han documentado capacidades de tool calling, agentes, razonamiento avanzado o soporte multilingue.
- No hay soporte de vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Investigacion academica sobre eficiencia de contexto: el modelo sirve para validar hipotesis sobre si promediar tokens adyacentes reduce la redundancia de embeddings sin degradar significativamente la perdida, permitiendo contextos mas largos con menos computo.
- Analisis de representaciones internas: los checkpoints permiten estudiar como el promediado afecta a las capas de atencion y a la calidad de los embeddings en modelos pequenos.
- Desarrollo de tecnicas de compresion de secuencias: los resultados pueden informar el diseno de arquitecturas que procesen secuencias largas con menor coste computacional.
- Benchmarking de estrategias de promediado: al existir variantes con diferentes configuraciones (k2, k2_wexp, isoflop), se pueden comparar los efectos de distintas estrategias de averaging.
- Reproducibilidad de experimentos: los loss logs y el checkpoint permiten reproducir y verificar los resultados publicados en el repositorio fuente.
- Educacion en ingenieria de LLMs: util como ejemplo practico de como se estructuran y guardan checkpoints de investigacion fuera del ecosistema `transformers`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto se centra en el analisis de perdida y en la comparacion de estrategias de promediado, pero no se proporcionan metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~50 M de parametros, la inferencia en fp32 requiere aproximadamente 200 MB de VRAM, y en fp16 unos 100 MB. Cabe en cualquier GPU moderna, incluso en CPUs sin problema.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti o superior) es suficiente. Para entrenamiento o experimentos con lotes grandes, se recomienda una GPU con 8 GB o mas (RTX 3060, RTX 4070, etc.).
- Compatibilidad con GPU de consumo: si, el modelo es extremadamente ligero y puede ejecutarse en hardware de consumo, incluso en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: al ser un checkpoint de investigacion, no esta preparado para vLLM, llama.cpp u Ollama. Requiere cargar el `state_dict` manualmente con PyTorch y reconstruir la arquitectura desde el codigo fuente del repositorio.
- Latencia y throughput: no se han publicado mediciones. Para un modelo de este tamano, la latencia en GPU es del orden de milisegundos por token, y el throughput puede superar los 1000 tokens/segundo en hardware moderno.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de tamano similar en la informacion proporcionada. Existen otros checkpoints del mismo proyecto (`avg_50m_k2` y `avg_50m_k2_wexp`) que difieren en la estrategia de promediado, pero no se han publicado metricas comparativas. No se conocen modelos comerciales o de codigo abierto equivalentes con promediado de tokens.

## Limitaciones y advertencias

- Modelo experimental: no esta disenado para uso en produccion ni para tareas reales de generacion de texto.
- Pesos no estandar: el checkpoint no es compatible con la API de Hugging Face `transformers`; requiere reconstruir la arquitectura desde el codigo fuente del repositorio `cyai/llm-token-averaging`.
- Sin licencia especificada: al no indicarse licencia, el uso comercial o la redistribucion pueden estar sujetos a restricciones legales no documentadas.
- Sin datos de rendimiento: no hay benchmarks publicados, por lo que no se puede evaluar su calidad en tareas estandar.
- Posibles bugs: los logs incluyen un archivo `loss_log_rope_bug.csv`, lo que sugiere que hubo problemas con la codificacion posicional durante el entrenamiento; esto puede afectar a la validez de los resultados.
- Tamano reducido: con solo 50 M de parametros, el modelo tiene una capacidad limitada y no es representativo de los LLMs modernos.
- Contexto nativo limitado: aunque el promediado permite duplicar la longitud efectiva, el contexto nativo es de 1024 tokens, insuficiente para muchas aplicaciones practicas.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/FAIRC/token-averaging-avg_50m_k2_isoflop
- Checkpoint variante k2: https://huggingface.co/FAIRC/token-averaging-avg_50m_k2
- Checkpoint variante k2_wexp: https://huggingface.co/FAIRC/token-averaging-avg_50m_k2_wexp
- Repositorio fuente del proyecto: https://github.com/cyai/llm-token-averaging
