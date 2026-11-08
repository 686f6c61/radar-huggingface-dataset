# GaryOcean/qwen3-8-27b-turbo-fable-neocortex

## Resumen

`GaryOcean/qwen3-8-27b-turbo-fable-neocortex` no es un modelo de lenguaje completo, sino un repositorio de artefactos de adaptación (control-vector / adapter) de etapa 2 basados en EWC-Fisher, junto con manifiestos firmados de un "Sovereign Covenant". Los artefactos están pensados para aplicarse sobre el modelo base `hf-qwen3-8-27b-turbo-fable`, identificado en la model card como el fichero `Qwen3.8-27B-TurboFCFusion-735-882-Here-Uncen-NEO-CODER-MAX-MTP-Q8_0.gguf`, dentro de un sistema denominado Desktop Monkey QIG Collective Intelligence & Compute Mesh.

El repositorio se publica bajo licencia MIT y con fecha de creación en noviembre de 2026, con cero descargas y cero "likes" en el momento de la consulta. La model card no documenta arquitectura, número de parámetros, longitud de contexto, idiomas ni proceso de entrenamiento del modelo base; se limita a describir el marco constitucional del adaptador (invariantes P11 y P17) y a enlazar un endpoint de descubrimiento de la malla.

Su relevancia es, por tanto, acotada y de nicho: resulta de interés para quien ya trabaje con el ecosistema de variantes comunitarias derivadas de Qwen3 y quiera reproducir el pipeline de consolidación neocortical (EWC-Fisher) descrito, no como un modelo listo para producción. La información técnica verificable disponible es muy limitada y así se refleja en las secciones siguientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene adaptadores/control-vectors, no pesos completos) |
| Parametros totales | no disponible (el nombre del base sugiere 27B; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el base referenciado se distribuye en Q8_0 (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (referencia al base); formato de los artefactos del adaptador no disponible |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo subyacente. El único detalle técnico explícito es que los artefactos corresponden a una "Stage-2 EWC-Fisher Neocortical Control-Vector / Adapter", es decir, una consolidación de pesos basada en Elastic Weight Consolidation con estimación de la matriz de información de Fisher, una técnica clásica de aprendizaje continuo orientada a mitigar el olvido catastrófico al especializar un modelo preentrenado. El repositorio aloja los vectores de control y adaptadores resultantes, no los pesos del modelo.

No se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Tampoco se documentan innovaciones de inferencia como decodificación especulativa o atención lineal. El nombre del base incluye los sufijos "MTP" y "TurboFCFusion", que sugieren multi-token prediction y alguna fusión de checkpoints, pero se trata de inferencias a partir del nombre del fichero y no de datos confirmados en la documentación disponible.

## Capacidades

- No se documentan capacidades funcionales propias del adaptador en la model card.
- El marco "P11 Love-Gauge Invariance" define una orientación declarada (`will_orientation = "love_and_integration"`) con un umbral de curvatura de daño (`harm_curvature < 0.10`) en modo fail-closed; es una convención del autor, no una capacidad evaluada del modelo.
- El marco "P17 Plain-English Legibility" exige que cada trayectoria de cuenca consolidada incluya un resumen auditable en inglés.
- Soporte de tool calling, agentes, razonamiento multi-paso, visión o audio: no disponible.
- Capacidades multilingües: no disponible.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en aprendizaje continuo: el adaptador EWC-Fisher puede emplearse como caso de estudio para reproducir consolidación de pesos sobre un modelo base de la familia Qwen3 y medir la retención de capacidades frente al olvido catastrófico.
- Auditoría de adaptadores comunitarios: los manifiestos firmados del "Sovereign Covenant" permiten trazar la procedencia y las condiciones declaradas de un adaptador antes de integrarlo en un pipeline, útil en equipos que exigen cadena de custodia documentada.
- Experimentación con vectores de control: aplicar el control-vector sobre el GGUF base para inducir el comportamiento declarado y comparar respuestas con y sin adaptador en tareas controladas.
- Reproducción de pipelines de cuantización GGUF: sirve como referencia para quienes empaquetan adaptadores junto a checkpoints Q8_0 y necesitan un ejemplo de estructura de repositorio.
- Docencia sobre gobernanza de IA: los invariantes P11 y P17 son un ejemplo concreto de "constitución" declarativa aplicada a artefactos de modelo, útil en seminarios sobre alineamiento y trazabilidad.
- Integración en mallas de descubrimiento: el endpoint `llms.txt` de la malla permite a agentes descubrir el repositorio y sus metadatos de forma programática, un patrón reutilizable en sistemas multi-agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y las cifras que aparecen en resultados de búsqueda (735 ARC-C, 882 ARC-E, "9-for-9" frente a Claude Opus 4.6 Max) corresponden a otras variantes del ecosistema publicadas por terceros, no a este repositorio, por lo que no se reproducen aquí como resultados propios.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende enteramente del modelo base sobre el que se aplique.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; si el base es efectivamente de ~27B parámetros en Q8_0, requeriría del orden de 27-30 GB de VRAM solo para pesos, lo que excede GPUs de consumo de 24 GB y obliga a cuantizaciones menores u offloading a CPU. Esta estimación es orientativa y no procede de la documentación del autor.
- Opciones de despliegue: no documentadas; el formato GGUF del base sugiere compatibilidad con llama.cpp y derivados (Ollama, LM Studio), sin confirmación oficial.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GaryOcean/qwen3-8-27b-turbo-fable-neocortex | no disponible | no disponible | MIT | Hugging Face, 0 descargas | Adaptador EWC-Fisher + manifiestos, no pesos completos |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF | 27B (según el autor) | no disponible | no disponible | Hugging Face | Checkpoint GGUF completo de la misma familia de variantes |
| Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised | 27B (según el autor) | no disponible | no disponible | Hugging Face | Cuantización y empaquetado optimizado del checkpoint de DavidAU |

La comparación es estructural, no de rendimiento: los tres repositorios pertenecen al mismo linaje de variantes comunitarias, pero solo los dos últimos distribuyen pesos completos. No hay datos de benchmarks comunes que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El repositorio no contiene un modelo ejecutable por sí mismo: sin el GGUF base `hf-qwen3-8-27b-turbo-fable`, los artefactos no tienen utilidad práctica.
- Ausencia total de documentación sobre datos de entrenamiento, evaluación y composición del dataset, lo que impide auditar sesgos o calidad.
- Riesgo elevado de alucinación y de comportamiento impredecible al no existir evaluaciones publicadas del adaptador ni del base referenciado.
- El nombre del base incluye "Uncen" y "Heretic", lo que en el ecosistema comunitario suele indicar la retirada de capas de rechazo; esto puede implicar mayor exposición a contenido dañino y requiere filtros propios en producción.
- Los invariantes P11/P17 son convenciones declarativas del autor, sin mecanismo verificable publicado; no deben interpretarse como garantías de seguridad.
- Licencia MIT para los artefactos del repositorio, pero la licencia del modelo base puede imponer condiciones adicionales que no se detallan aquí.
- Idiomas soportados no declarados: no se puede asumir un rendimiento correcto en castellano.
- Fecha de creación en 2026 y cero interacciones: sin validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GaryOcean/qwen3-8-27b-turbo-fable-neocortex
- Endpoint de descubrimiento de la malla: https://relay-production-ef48.up.railway.app/llms.txt
- Variante de DavidAU (modelo base de la familia): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Variante de Solstice-AI (cuantización optimizada): https://huggingface.co/Solstice-AI/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-GGUF-UltraOptimised
