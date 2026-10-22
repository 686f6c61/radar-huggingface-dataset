# alfred8995/sn38-r3-2015-pomlnb-chronollm-2015

## Resumen

`alfred8995/sn38-r3-2015-pomlnb-chronollm-2015` es un modelo de lenguaje de 1.858.535.658 parámetros (aproximadamente 1,86 mil millones) publicado en HuggingFace por el usuario alfred8995, con acceso restringido (gated) y licencia etiquetada como `other`. El nombre y la etiqueta `ChronoGPT` lo vinculan con ChronoLLM (SN38), un subnet de Bittensor dedicado al entrenamiento competitivo de modelos de lenguaje "cronológicamente consistentes", es decir, entrenados únicamente con datos disponibles hasta una fecha de corte concreta. El sufijo `2015` del identificador sugiere que la fecha de corte de este checkpoint es 2015, y `r3` apunta a la ronda 3 del mecanismo de entrenamiento del subnet.

El problema que aborda esta familia de modelos es el sesgo de anticipación (*lookahead bias*) en la investigación cuantitativa: un modelo entrenado con datos posteriores a la fecha de un backtest filtra información del futuro y produce resultados irreales. Un modelo con corte temporal estricto permite generar señales, resúmenes y decisiones "tal como se habrían podido tomar" en ese momento histórico, preservando la integridad de las pruebas retrospectivas.

La información pública disponible sobre este checkpoint concreto es mínima: no hay model card descriptiva, pipeline declarado, idiomas indicados ni resultados de benchmarks. Se trata de una revisión única creada y actualizada el 21 de octubre de 2026, con cero descargas y cero likes en el momento de la consulta, lo que es coherente con un artefacto de entrenamiento intermedio de un subnet competitivo más que con un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; etiqueta `ChronoGPT` (familia ChronoLLM / SN38), presumiblemente transformer decoder-only |
| Parametros totales | 1.858.535.658 (~1,86 mil millones) |
| Parametros activos | No aplica (no hay evidencia de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repositorio; solo se publican pesos en `safetensors` (el tamaño del repo, 7,4 GB, coincide con 4 bytes por parametro, es decir, fp32) |
| Idiomas soportados | No disponible (no declarados en la model card) |
| Licencia | `other` (acceso restringido: requiere aceptar condiciones en HuggingFace; terminos concretos no publicados) |
| Formato de pesos | `safetensors` (`region: us`) |

## Arquitectura y entrenamiento

No se ha publicado información técnica sobre la arquitectura interna de este checkpoint: no hay model card que detalle número de capas, dimensión oculta, cabezas de atención, tipo de tokenizador ni estrategia de atención. La etiqueta `ChronoGPT` y la pertenencia al ecosistema ChronoLLM (Bittensor subnet 38) sitúan el modelo en la categoría de transformers decoder-only entrenados con un protocolo de corte temporal, en el que cada modelo solo ve datos publicados hasta su fecha de corte. En este caso el identificador apunta a 2015.

Tampoco se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. El identificador contiene el segmento `pomlnb`, cuyo significado no está documentado públicamente y que probablemente corresponde a una configuración interna de hiperparámetros o a un identificador de ronda del mecanismo de entrenamiento del subnet. El sufijo `r3` sugiere la tercera ronda del ciclo competitivo. Al tratarse de un artefacto de un subnet de entrenamiento competitivo, es razonable esperar que sea un checkpoint intermedio y no un modelo alineado para diálogo, pero esto no puede confirmarse con la información disponible.

## Capacidades

- Generación de texto autoregresiva, presumiblemente en modo completado y no necesariamente en formato de chat (no se declara plantilla de conversación).
- Coherencia temporal: el modelo está entrenado para no conocer hechos posteriores a su fecha de corte (2015 según el identificador), lo que constituye su rasgo diferencial.
- Generación de texto condicionada a un contexto histórico concreto, útil para simular el estado del conocimiento en una fecha dada.
- Capacidades multilingües: no disponibles / no declaradas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking", visión o audio: no disponible.
- Razonamiento matemático y generación de código: no disponible, sin datos que lo confirmen.

## Casos de uso

- Backtesting cuantitativo sin lookahead: generar señales o comentarios de mercado usando solo conocimiento anterior a 2015, de modo que la evaluación retrospectiva refleje la información realmente disponible en cada momento histórico.
- Simulación de analista con información limitada: pedir al modelo un resumen o una tesis de inversión sobre un activo "tal como se veía" en una fecha previa a 2015, para contrastar después con el resultado real.
- Generación de features temporales para modelos de series financieras: producir anotaciones textuales de noticias y estados financieros históricos sin contaminación de eventos posteriores.
- Construcción de benchmarks de consistencia cronológica: usar el checkpoint como referencia para evaluar si otros modelos "filtran" conocimiento del futuro al responder preguntas con fecha límite.
- Investigación sobre sesgo temporal en LLM: comparar las respuestas de este modelo con las de un modelo sin corte para medir cuánto del rendimiento aparente en backtests proviene de información futura.
- Análisis de documentos históricos: resumir y clasificar corpus de prensa o informes anteriores a 2015 manteniendo el registro y el vocabulario de la época.
- Educación y divulgación: recrear el estado del arte de un dominio técnico en un año concreto, limitando las respuestas a lo publicado hasta la fecha de corte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, evaluaciones de consistencia temporal ni comparaciones con otros checkpoints del subnet en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en `safetensors` ocupan 7,4 GB (fp32). Cargados en bf16/fp16 bajan a unos 3,7 GB; en int8, alrededor de 1,9 GB; en int4, aproximadamente 1,0 GB. A esto hay que sumar la caché KV, cuyo tamaño no puede calcularse sin conocer el número de capas y la longitud de contexto.
- GPU recomendadas: cualquier GPU con 8 GB o más puede ejecutar el modelo en bf16 con contexto moderado (RTX 3060 Ti, RTX 4060, RTX 3070). Para mayor margen de contexto o lotes grandes, RTX 4090 (24 GB), A100 (40/80 GB) o H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer con 8 GB o más usando bf16 o cuantización; en 4 bits cabría incluso en GPU de 6 GB.
- Opciones de despliegue: `transformers` (carga directa desde safetensors), vLLM y TGI para servicio con throughput alto. Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF con `convert_hf_to_gguf.py`, ya que el repositorio no incluye cuantizaciones publicadas.
- Latencia y throughput: no disponibles. Como referencia teórica de orden de magnitud, un modelo de 1,86 B en bf16 sobre una RTX 4090 suele moverse en el rango de decenas a centenares de tokens por segundo, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sn38-r3-2015-pomlnb-chronollm-2015 | 1,86 B | No disponible | `other` (gated) | Acceso restringido en HF, sin cuantizaciones |
| SmolLM2-1.7B (HuggingFace) | 1,71 B | 8k (según su model card) | Apache 2.0 | Abierto, con GGUF y amplia adopción |
| Qwen2.5-1.5B (Alibaba) | 1,54 B | 32k (según su model card) | Apache 2.0 | Abierto, con GGUF y vLLM |
| StableLM-2-1.6B (Stability AI) | 1,64 B | 4k (según su model card) | Stability AI Community | Abierto, con GGUF |

Nota: los datos de los modelos alternativos provienen de sus model cards públicas y no de la búsqueda web realizada para esta ficha; conviene verificarlos antes de citarlos. La diferencia funcional relevante no es el tamaño, sino el protocolo de corte temporal de ChronoLLM, que no tiene equivalente declarado en los modelos generalistas anteriores.

## Limitaciones y advertencias

- Ausencia total de model card: se desconoce el tokenizador exacto, la plantilla de prompt, el contexto máximo y el régimen de entrenamiento, lo que complica la integración reproducible en producción.
- Fecha de corte 2015 (inferida del identificador, no confirmada documentalmente): el modelo carece por diseño de conocimiento posterior, por lo que no debe usarse para preguntas sobre eventos recientes.
- Riesgo de alucinación no cuantificado: no hay evaluaciones publicadas de factualidad ni de calibración.
- Licencia `other` con acceso gated: los términos de uso comercial no están publicados de forma explícita; es imprescindible revisar las condiciones en HuggingFace antes de cualquier uso en producción o distribución.
- Idiomas no declarados: no puede asumirse un buen rendimiento en castellano ni en ningún otro idioma concreto sin evaluación previa.
- Sesgos desconocidos: al no documentarse la composición del corpus (probablemente prensa y web anterior a 2015), es esperable que herede sesgos históricos de esa ventana temporal, incluyendo sesgos de representación y terminología desactualizada.
- Procedencia de checkpoint de competición: el patrón de nombre (`r3`, `pomlnb`) sugiere un estado intermedio de entrenamiento de un subnet; puede no estar instruido para diálogo ni alineado.
- Estado del repositorio: creado en octubre de 2026, sin descargas ni likes, con una única revisión; no hay garantía de mantenimiento ni de soporte.
- Verificar la integridad del artefacto: al estar en acceso restringido y sin documentación, conviene auditar la configuración (`config.json`) y el tokenizador antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alfred8995/sn38-r3-2015-pomlnb-chronollm-2015
- Repositorio del subnet SN38 en GitHub: https://github.com/chronollm/sn38
- Sitio oficial de ChronoLLM: https://chronollm.com/
- Investigación independiente sobre el subnet 38: https://subnetradar.com/research/subnets/38
- Checkpoint relacionado del mismo autor: https://huggingface.co/alfred8995/r16-H-chrono4-skd-s500
- Checkpoint relacionado del mismo autor: https://huggingface.co/alfred8995/r16-H-P3-d2c3q3-s100
