# KonradBRG/FANTa

## Resumen

FANTa (Fair Adaptive Neural TokenizAtion) es un artefacto de investigación derivado de una tesis de máster de Konrad Brüggemann. El repositorio `KonradBRG/FANTa` contiene dos modelos de lenguaje base con arquitectura idéntica, mismo corpus de preentrenamiento y mismos hiperparámetros, que difieren únicamente en el tokenizador: uno usa BPE con 128.000 entradas y el otro emplea FANTa, un segmentador neuronal aprendido que busca repartir de forma más equitativa el número de tokens entre idiomas y deletrea byte a byte los fragmentos fuera de su vocabulario.

El objetivo del trabajo es medir el efecto del tokenizador sobre el rendimiento multilingüe, no publicar un modelo utilizable. Ambos modelos son transformers de aproximadamente 2,6B parámetros en el cuerpo (3,19B y 3,24B totales con embeddings), entrenados durante una sola época sobre 51,8B y 41,3B tokens respectivamente, procedentes de una mezcla de 107 idiomas.

Los modelos no están ajustados por instrucciones y sus resultados en benchmarks quedan cerca del azar en la mayoría de tareas. Se publican para reproducir la tesis, no para uso en producción. La relevancia actual es metodológica: ofrece una comparación controlada entre un tokenizador BPE convencional y un segmentador aprendido con criterios de equidad lingüística.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no se detalla el número de capas ni dimensiones) |
| Parámetros totales | 3,193B (BPE) / 3,241B (FANTa) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en `model.pt` en el dtype almacenado) |
| Idiomas soportados | 107 idiomas (mezcla multilingüe) |
| Licencia | MIT (código y pesos; el texto de entrenamiento mantiene sus propias licencias) |
| Formato de pesos | `model.pt` (checkpoint PyTorch propio de `systems.pretraining.train.save_checkpoint`), sin estado de optimizador ni scheduler |

## Arquitectura y entrenamiento

Ambos modelos comparten un cuerpo transformer de 2,54B parámetros y difieren en la capa de embeddings y en los módulos asociados al tokenizador. El modelo BPE tiene 3,193B parámetros totales; el modelo FANTa añade 48M parámetros en los módulos de deletreo por bytes, hasta 3,241B. El tokenizador FANTa combina un vocabulario de 128.000 entradas con un segmentador neuronal (`m5_a0.2_s0.pt`) que deletrea byte a byte los spans fuera de vocabulario.

El corpus de preentrenamiento es una única mezcla de 107 idiomas (los cubiertos simultáneamente por BOUQuET y los corpus web), sin código, matemáticas ni subcorpus muy especializados. La composición en bytes es: FineWeb-2 (106 idiomas, 87,0%, 181,5 GB), Wikipedia (107 idiomas, 5,0%, 10,4 GB), OPUS-100 (81 idiomas, 2,9%, 6,1 GB) y FineWeb-Edu en inglés (5,0%, 10,4 GB). Como FANTa comprime más el texto, ve menos tokens: 41,3B frente a 51,8B del modelo BPE, en una sola época. No se menciona RLHF, DPO ni ajuste por instrucciones. El repositorio incluye el archivo de procedencia (`final.pt.provenance.json`) con configuración, commit, shards de datos y hashes de tokenizador.

## Capacidades

- Generación de texto base (modelo no ajustado por instrucciones).
- Modelado de lenguaje multilingüe sobre 107 idiomas.
- Evaluación de tokenizadores: comparación controlada BPE frente a FANTa con arquitectura y datos idénticos.
- Segmentación adaptativa con deletreo por bytes para vocabulario fuera de cobertura (solo en la variante FANTa).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de visión o audio: no disponibles.
- Modo de razonamiento explícito (thinking): no disponible.

## Casos de uso

- Reproducción de la tesis: cargar los checkpoints con el commit registrado en `final.pt.provenance.json` y ejecutar `scripts.mix.eval_2p6b` para replicar las métricas de bits por byte y las tareas del harness en 107 idiomas.
- Investigación sobre tokenización multilingüe: comparar el comportamiento de BPE y FANTa sobre el mismo texto para estudiar paridad de tokens, compresión y coste por idioma.
- Estudio de equidad lingüística: analizar el coeficiente de Gini de bits por byte entre idiomas (aproximadamente 0,20 en ambos modelos) y el efecto del tokenizador en la distribución de tokens.
- Análisis de compresión y coste computacional: usar las diferencias de tokens procesados (51,8B frente a 41,3B) para estimar el ahorro de cómputo asociado al tokenizador.
- Experimentos de segmentación con deletreo por bytes: emplear los módulos byte-span de FANTa para estudiar el manejo de vocabulario fuera de cobertura en lenguas de bajos recursos.
- Docencia y formación: servir como ejemplo reproducible de comparación controlada entre tokenizadores en un entorno de investigación, con datos y configuración publicados.
- Punto de partida para preentrenamientos posteriores: reutilizar la configuración y el pipeline de datos para entrenamientos más largos o ajustes posteriores, dado que los pesos son base y están bajo licencia MIT.

## Benchmarks y rendimiento

Resultados de la tesis sobre 107 idiomas (bits por byte en texto reservado) y tareas del harness (precisión media por idioma; nivel de azar en la segunda columna).

| Medida | Azar | BPE | FANTa |
|---|---|---|---|
| Bits por byte, agrupado (menor es mejor) | | **0,721** | 0,894 |
| XNLI | 0,33 | **0,369** | 0,352 |
| XCOPA | 0,50 | **0,553** | 0,537 |
| XStoryCloze | 0,50 | **0,529** | 0,526 |
| Global PIQA | 0,50 | **0,580** | 0,552 |
| SIB-200 (en idioma, 8-shot) | 0,14 | 0,156 | **0,180** |
| MultiBLiMP | 0,50 | **0,793** | 0,763 |
| mHellaSwag | 0,25 | **0,305** | 0,293 |

El modelo FANTa presenta un bits por byte superior al de BPE en los 107 idiomas (ratio agrupado de 1,24). El coeficiente de Gini de bits por byte entre idiomas es el mismo en ambos modelos (aproximadamente 0,20).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 3,2B parámetros en fp16 requiere aproximadamente 6,5 GB solo para pesos; en fp32, unos 13 GB. Estas cifras no proceden de la model card.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño, un modelo de 3,2B en fp16 podría caber en GPUs de consumo con 8 GB o más, pero no se ha verificado.
- Opciones de despliegue: el formato `model.pt` es específico del repositorio de código (`systems.pretraining.checkpoint_io.load_pretrained_model` para BPE y `scripts.mix.eval_2p6b` para FANTa). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han publicado comparaciones con modelos de terceros en la información disponible. La comparación interna del repositorio es la siguiente:

| Modelo | Parámetros | Tokenizador | Tokens de entrenamiento | Licencia |
|---|---|---|---|---|
| FANTa (BPE) | 3,193B | BPE, 128k entradas | 51,8B | MIT |
| FANTa (FANTa) | 3,241B | FANTa, 128k + deletreo por bytes | 41,3B | MIT |

No se dispone de datos para comparar con alternativas de la misma categoría (modelos base multilingües de ~3B parámetros).

## Limitaciones y advertencias

- Modelos base sin ajuste por instrucciones: no son aptos para uso directo en producción ni para tareas conversacionales.
- Rendimiento cercano al azar en la mayoría de benchmarks; las diferencias pequeñas no deben interpretarse como hallazgos.
- Una sola ejecución de entrenamiento por tokenizador y un solo tamaño: la comparación carece de estimación de varianza.
- El tokenizador FANTa es el más favorable de seis semillas en sus métricas de equidad, lo que puede introducir sesgo de selección.
- El modelo FANTa tiene peor bits por byte que BPE en los 107 idiomas (ratio 1,24), aunque la desigualdad entre idiomas (Gini ~0,20) es idéntica.
- Sesgos conocidos: no documentados explícitamente; el corpus procede de web y Wikipedia, con los sesgos inherentes a esas fuentes.
- Riesgo de alucinación: alto en un modelo base de este tamaño y con una sola época de entrenamiento.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada; la cobertura es de 107 idiomas, con posibles diferencias de calidad entre ellos.
- Licencia: los pesos y el código son MIT, pero el texto de entrenamiento conserva sus licencias (CC BY-SA para Wikipedia, ODC-By para FineWeb-2), lo que puede afectar a la redistribución de derivados.
- El repositorio ocupa 25,7 GB y los checkpoints se distribuyen en un formato propio, no estándar, que requiere el código del repositorio para cargarse.

## Enlaces

- Hugging Face: https://huggingface.co/KonradBRG/FANTa
- Repositorio de código: https://github.com/kobrue02/rl-tokenizers
- FineWeb-2 (Penedo et al., 2025): no disponible enlace directo en la información proporcionada
- OPUS-100 (Zhang et al., 2020): no disponible enlace directo en la información proporcionada
- FineWeb-Edu (Penedo et al., 2024): no disponible enlace directo en la información proporcionada
- Wikipedia (Wikimedia Foundation): https://www.wikipedia.org
- Cita de la tesis: Brüggemann, Konrad (2026), tesis de máster sobre FANTa (título y escuela no disponibles en la información proporcionada)
