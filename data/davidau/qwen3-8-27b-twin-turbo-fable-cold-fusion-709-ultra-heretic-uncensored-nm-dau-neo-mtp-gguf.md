# DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NM-DAU-NEO-MTP-GGUF

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NM-DAU-NEO-MTP-GGUF es un ajuste fino (fine-tune) de la familia Qwen3.8, publicado por el usuario DavidAU en Hugging Face bajo licencia Apache 2.0. Se distribuye en formato GGUF con dos variantes de cuantización: "regular" e "MTP" (Multi-Token Prediction). El modelo parte de un fine-tune previo del mismo autor y se presenta como una versión "uncensored" (abliterated/heretic) orientada a escritura creativa, rol y razonamiento, con un supuesto rendimiento en ARC-C de 699 en 8 bits y 692 en 4 bits según la model card.

La propuesta principal del autor es reducir drásticamente los tokens de razonamiento (entre 1/2 y 1/20 del modelo base) manteniendo la calidad de salida, mediante métodos de entrenamiento que denomina "Cold Fusion" y "Fable Fusion 711". Incorpora cinco modos de razonamiento y cinco modos de instrucción conmutables en tiempo de ejecución mediante API o directamente en el chat, algunos de ellos con cero tokens de razonamiento.

El modelo tiene 26.895.998.464 parámetros totales (datos de safetensors) y un repositorio de 337,1 GB. La model card declara soporte para 16 idiomas y pipeline image-text-to-text, aunque la información sobre arquitectura interna, contexto y datos de entrenamiento es muy limitada y en gran parte no verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en variantes "regular" y "MTP"; se mencionan Q4KS, 4 bits y 8 bits en la model card |
| Idiomas soportados | 16 según la model card: ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (la ficha de HF solo lista en y zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo con cuantizaciones); el modelo base en bfloat16 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que deriva de Qwen3.8 y que se distribuye como GGUF. El autor menciona el uso de Unsloth para el entrenamiento y describe un proceso de "multi-stage tune" y "multi-state merge" con los metodos propietarios "Cold Fusion" y "Fable Fusion 711". Se citan tres datasets del propio autor: DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets y DavidAU/THE-DECKARD-Datasets, sin especificar composicion, numero de tokens ni si hubo RLHF o DPO.

La innovacion declarada es la reduccion de tokens de razonamiento (hasta 1/20 en algunos casos) manteniendo detalle y calidad, junto con modos de operacion conmutables (5 de razonamiento y 5 de instruccion, incluyendo los modos "Spoon" y "Einstein"). No se proporcionan detalles tecnicos verificables sobre atencion, decodificacion especulativa ni la implementacion de MTP.

## Capacidades

- Generacion de texto y razonamiento con modos de "thinking" conmutables.
- Cinco modos de razonamiento y cinco modos de instruccion, algunos con cero tokens de razonamiento.
- Escritura creativa, ficcion, rol y narrativa de genero (el autor la destaca como capacidad principal).
- Generacion de codigo (etiqueta "coder" en la model card).
- Capacidades multilingues declaradas para 16 idiomas.
- Pipeline image-text-to-text declarado en la ficha de Hugging Face (sin detalles de implementacion).
- Control del modo de operacion en tiempo de ejecucion via API o en el propio chat.
- Soporte de tool calling y agentes: no disponible en la informacion proporcionada.

## Casos de uso

- Escritura creativa y ficcion: el modelo esta ajustado especificamente para narrativa, con enfasis en estructura de tres actos, arcos de personaje y foreshadowing a lo largo de textos largos, segun la model card.
- Roleplay y generacion de dialogos: la naturaleza "uncensored" permite conversaciones sin las restricciones habituales de los modelos alineados, util para prototipado de personajes y guiones.
- Generacion de codigo asistida: la etiqueta "coder" sugiere uso en autocompletado y generacion de fragmentos, aunque no hay benchmarks que lo respalden en la informacion disponible.
- Razonamiento con bajo coste de tokens: los modos con cero tokens de razonamiento permiten desplegar el modelo en escenarios de alto volumen donde el coste por token de pensamiento es critico.
- Procesamiento multilingue: cobertura declarada de 16 idiomas para tareas de traduccion y generacion en lenguas distintas del ingles.
- Despliegue local en hardware de consumo: al distribuirse en GGUF (4 y 8 bits), puede ejecutarse con llama.cpp u Ollama en equipos con GPU de gama alta o incluso CPU con RAM suficiente.
- Experimentacion en investigacion sobre alineacion y censura: al ser una variante abliterated, sirve para estudiar el comportamiento de modelos sin capas de rechazo.

## Benchmarks y rendimiento

La model card afirma resultados de ARC-C de 699 en 8 bits y 692 en 4 bits, y que supera al Qwen3.8 27B base y a Qwen3.6-35B-A3B, Qwen3.6 27B y Qwen3.5 27B en siete benchmarks criticos. Sin embargo, no se proporcionan tablas con los siete benchmarks, sus nombres, condiciones de evaluacion ni resultados del resto de modelos. No se han publicado resultados de benchmarks verificables en la informacion disponible.

| Benchmark | Resultado declarado | Condiciones |
|---|---|---|
| ARC-C | 699 | 8 bits, modo instruct "medium" |
| ARC-C | 692 | 4 bits |
| Otros 6 benchmarks | no disponibles | se afirma superioridad sobre modelos citados |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Para 26,9 B parametros, una cuantizacion de 4 bits requiere aproximadamente 15-17 GB de VRAM, y 8 bits en torno a 28-30 GB (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas. Por tamano, serian adecuadas RTX 4090 (24 GB) para 4 bits, y A100/H100 o RTX 6000 Ada para 8 bits.
- Cabe en GPU de consumo: probablemente en 4 bits en tarjetas con 24 GB o mas, segun la estimacion anterior; no confirmado.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI no confirmados para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (TWIN-TURBO) | 26,9 B | no disponible | Apache 2.0 | GGUF | Fine-tune uncensored con modos conmutables |
| Qwen3.8 27B (base) | ~27 B | no disponible | Apache 2.0 | safetensors/GGUF | Referencia del autor; ARC-C inferior segun la model card |
| Qwen3.6-35B-A3B | 35 B (MoE, 3 B activos) | no disponible | Apache 2.0 | safetensors/GGUF | Citado como superado en 7 benchmarks por el autor |
| Qwen3.6 27B | ~27 B | no disponible | Apache 2.0 | safetensors/GGUF | Citado como superado en 7 benchmarks por el autor |

Los datos de rendimiento comparativo proceden unicamente de afirmaciones del autor y no han sido verificados de forma independiente.

## Limitaciones y advertencias

- La variante es "uncensored/abliterated": elimina o reduce los mecanismos de rechazo, lo que implica riesgo de generar contenido toxico, ilegal o danino sin filtros.
- Riesgo de alucinacion no cuantificado; no hay evaluaciones independientes publicadas.
- Los benchmarks declarados (ARC-C 699/692) no son verificables con la informacion disponible y proceden del propio autor.
- Longitud de contexto no documentada, lo que dificulta planificar cargas de trabajo de contexto largo.
- La ficha de Hugging Face lista solo en y zh como idiomas, en contradiccion con los 16 declarados en la model card.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado sin censura puede incumplir politicas de plataformas o normativa aplicable; la responsabilidad recae en el desplegador.
- El repositorio ocupa 337,1 GB, lo que exige planificacion de almacenamiento y ancho de banda.
- No hay informacion sobre tool calling, agentes ni soporte de contexto largo, pese a las etiquetas de la ficha.

## Enlaces

- Hugging Face: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-NM-DAU-NEO-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Version menos censurada con mayor rendimiento declarado: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
