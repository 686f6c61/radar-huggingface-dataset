# SargeDev/Arete-27B-Uncensored-V2-GGUF

## Resumen

Arete-27B-Uncensored-V2-GGUF es una cuantización en formato GGUF de un modelo de lenguaje de 27.320.697.856 parámetros (27,3 mil millones) derivado de NousResearch/Arete-27B. Lo publica el usuario SargeDev y combina dos intervenciones sobre el modelo base: una ablación de direcciones de rechazo («abliteration») en variante `aggressive`, heredada de su versión V1, y la fusión de un LoRA de entrenamiento en decisiones (Solar-JEV, checkpoint 1946, r32/alpha-64) mediante aritmética de deltas directa sobre 401 de 401 módulos. El resultado es un modelo conversacional orientado a eliminar comportamientos de rechazo y a añadir un andamiaje de decisión tipada.

La relevancia del modelo es acotada y muy específica: no compite en benchmarks generales de razonamiento o código, sino que se posiciona como una variante «uncensored» con preservación del cabezal MTP/nextn de Qwen3.8, lo que permite decodificación especulativa. El autor reporta una batería de cumplimiento de 15/15 prompts adversariales entregados y una tasa de propaganda del 1,1% en el conjunto NousResearch/Propaganda_Eval (803 prompts), juzgado con Grok-4.7.

La arquitectura subyacente es la del modelo base Qwen (etiquetado como Qwen3.8 en los tags), un transformer denso con capacidades de decodificación especulativa vía tensores drafter. El contexto, los idiomas y los detalles de entrenamiento del base no se detallan en la información disponible. La licencia declarada es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8, según tags del autor) con cabezal MTP/nextn para decodificación especulativa |
| Parámetros totales | 27.320.697.856 (27,3 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, Q3_K_M, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con tensores MTP/nextn preservados en todos los ficheros) |

## Arquitectura y entrenamiento

El modelo parte de NousResearch/Arete-27B, un transformer denso de 27,3 B parámetros construido sobre la arquitectura Qwen (referida como Qwen3.8 en los tags). Sobre ese base se aplicó una abliteración en variante `aggressive` mediante la herramienta OBLITERATUS (crédito a Pliny the Liberator), que elimina direcciones de rechazo en el espacio de activaciones. Posteriormente se fusionó un LoRA de decisiones Solar-JEV (checkpoint 1946, r32/alpha-64) entrenado sobre un corpus combinado de 764k ejemplos solar+JEV con `lm_head` como objetivo, aplicado por aritmética de deltas directa sobre los 401 módulos. Los tensores del drafter MTP/nextn se reinsertaron con el cabezal estándar de Qwen3.8, de modo que la decodificación especulativa sigue operativa.

Las puertas de calidad reportadas por el autor, medidas tras la abliteración y antes de la fusión con OBLITERATUS verify, muestran coherencia 1.0, suite de capacidades intacta y un aumento de perplejidad de 3,22 a 3,93 (calificado como modesto). No se especifican la composición del dataset de preentrenamiento del base, el número de tokens vistos ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional multi-turno, con el carácter de chat del modelo Arete base.
- Cumplimiento de prompts adversariales: el autor reporta 15/15 en una batería de 15 prompts duros (desarrollo de exploits, red-team, malware, DoS), heredado de la abliteración de V1.
- Andamiaje de decisión tipada: lectura de decisión transferida desde el LoRA Solar-JEV, con top-1 de elección de 0,725 sobre un conjunto de 30k decisiones tipadas.
- Decodificación especulativa funcional gracias a los tensores MTP/nextn preservados en todas las cuantizaciones.
- Respuesta a sondas de narrativa estatal: el autor reporta una puntuación de hechos de 2,61/5 y una tasa de propaganda del 1,1% en NousResearch/Propaganda_Eval (803 prompts), juzgado con Grok-4.7.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en seguridad de IA y red-teaming: el modelo entrega respuestas en prompts de desarrollo de exploits, malware y DoS según la batería del autor, lo que lo hace útil como sujeto de prueba para evaluar filtros y políticas de despliegue en entornos controlados.
- Estudio de abliteración y edición de direcciones de rechazo: al conservar el linaje V1 más la fusión Solar-JEV, sirve para analizar cómo la eliminación de direcciones de rechazo afecta a la coherencia (perplejidad 3,22 → 3,93) y a las capacidades generales.
- Evaluación de sesgo narrativo: el conjunto Propaganda_Eval permite medir hasta qué punto el modelo reproduce líneas oficiales frente a hechos documentados, con una tasa reportada del 1,1% de propaganda.
- Experimentos de decisión tipada: el andamiaje Solar-JEV con top-1 de 0,725 sobre 30k decisiones permite probar arquitecturas de lectura de decisión sobre un backbone conversacional.
- Despliegue local con decodificación especulativa: las cuantizaciones Q4_K_M (15,7 GB) y Q5_K_M (18,2 GB) permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo alta, aprovechando el drafter MTP para reducir latencia.
- Generación de contenido sin filtros en dominios creativos o de ficción: para autores que necesitan un modelo que no rechace temáticas sensibles, con la advertencia de que la ausencia de alineación incrementa el riesgo de contenido dañino.

## Benchmarks y rendimiento

| Evaluación | Métrica | Resultado |
|---|---|---|
| Batería de cumplimiento (15 prompts duros) | Prompts entregados | 15/15 |
| NousResearch/Propaganda_Eval (803 prompts, juez Grok-4.7) | Puntuación de hechos | 2,61 / 5 (423/801 respuestas con 4-5) |
| NousResearch/Propaganda_Eval | Tasa de propaganda | 1,1% (794/801 limpias, 9 menores, 0 propaganda dura) |
| Conjunto de decisiones tipadas (30k) | Top-1 de elección | 0,725 (V1 backbone: 0,384; huihui-base V3 mismo checkpoint: 0,853; barra r32: 0,869) |
| Puertas de calidad post-abliteración | Coherencia | 1,0 |
| Puertas de calidad post-abliteración | Perplejidad | 3,22 → 3,93 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ≈ 10,1 GB; Q3_K_M ≈ 12,6 GB; Q4_K_S ≈ 14,7 GB; Q4_K_M ≈ 15,7 GB; Q5_K_M ≈ 18,2 GB; Q6_K ≈ 20,9 GB; Q8_0 ≈ 27,1 GB; F16 ≈ 54,7 GB (tamaños de fichero reportados por el autor; la VRAM real requiere margen adicional para contexto y caché KV).
- GPU recomendadas: para Q4_K_M y Q5_K_M, RTX 4090 (24 GB) o RTX 3090 (24 GB); para Q8_0, A100 40 GB o H100; para F16, A100 80 GB o H100 80 GB.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB conviene Q3_K_M o Q2_K.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; el autor etiqueta el repo como `endpoints_compatible`. vLLM y TGI no están confirmados para este artefacto GGUF en la información disponible.
- Latencia y throughput: no disponibles. La preservación de los tensores MTP/nextn habilita decodificación especulativa, que en principio reduce la latencia respecto a decodificación autoregresiva estándar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-Uncensored-V2 (este) | 27,3 B | No disponible | Abliterado + decisión Solar-JEV | Apache 2.0 | GGUF en HF |
| NousResearch/Arete-27B | 27,3 B | No disponible | Base conversacional alineado | No disponible | HF |
| huihui-base V3 (referencia del autor) | No disponible | No disponible | Base con lectura de decisión | No disponible | No disponible |
| Arete-27B-Uncensored V1 | 27,3 B | No disponible | Abliteración sin fusión de decisión | Apache 2.0 (según V2) | GGUF en HF |

El autor sitúa la lectura de decisión de este modelo (0,725) por encima del backbone V1 (0,384) pero por debajo de huihui-base V3 en el mismo checkpoint (0,853) y de la barra r32 (0,869). No se dispone de comparativas con modelos de propósito general de tamaño similar en benchmarks estándar.

## Limitaciones y advertencias

- La abliteración elimina direcciones de rechazo: el modelo entregará contenido que modelos alineados rechazan (exploits, malware, DoS), lo que lo hace inadecuado para despliegues públicos sin filtros externos.
- La fusión de decisión no alcanza el rendimiento de referencia: top-1 de 0,725 frente a 0,853 de huihui-base V3 y 0,869 de la barra r32; el propio autor reconoce que un entrenamiento nativo sobre Arete es la vía para cerrar la brecha.
- Aumento de perplejidad de 3,22 a 3,93 tras la abliteración, lo que indica una degradación modesta pero real de la modelización del lenguaje.
- Riesgo de alucinación: no se aportan evaluaciones de veracidad fuera del conjunto Propaganda_Eval; la puntuación de hechos de 2,61/5 sugiere margen de mejora.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equilibrado.
- Longitud de contexto no documentada; no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia Apache 2.0 declarada, pero el linaje incluye un modelo base cuyos términos no se detallan en la información disponible; conviene verificar la licencia de NousResearch/Arete-27B antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.
- El tamaño del repo (99,0 GB) implica que la descarga completa incluye todas las cuantizaciones; conviene descargar solo el fichero necesario.

## Enlaces

- Hugging Face: https://huggingface.co/SargeDev/Arete-27B-Uncensored-V2-GGUF
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Conjunto de evaluación de propaganda: https://huggingface.co/datasets/NousResearch/Propaganda_Eval
- OBLITERATUS (herramienta de abliteración, crédito a Pliny the Liberator): no disponible
- Paper o blog del método Solar-JEV: no disponible
- Repositorio del proyecto: no disponible
