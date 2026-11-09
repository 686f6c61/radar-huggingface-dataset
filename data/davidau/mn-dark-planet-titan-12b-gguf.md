# DavidAU/MN-Dark-Planet-TITAN-12B-GGUF

## Resumen

MN-Dark-Planet-TITAN-12B es un modelo de lenguaje de 12.247 millones de parámetros (12,2B) especializado en escritura creativa, ficción y roleplay, desarrollado por DavidAU. Se construye mediante un proceso de fusión (merge) de tres modelos Mistral Nemo de 12B, utilizando una técnica DARE TIES en dos etapas con 240 puntos de ajuste, con el objetivo de combinar lo mejor de cada modelo base en lugar de producir un promedio diluido. El modelo base es DavidAU/MN-Dark-Planet-TITAN-12B y esta ficha corresponde a su versión cuantizada en GGUF.

La relevancia del modelo radica en su enfoque en prosa vívida y generación de tramas, con una ventana de contexto que el autor declara de 128k tokens (131.000+) y potencialmente hasta 1 millón. Según la model card, mantiene una perplejidad baja incluso en cuantizaciones agresivas (PPL 6,7875 en Q4_K_M y 6,6266 en Q8), lo que sugiere una buena estabilidad tras la compresión. Está pensado para usuarios que ejecutan modelos en local con llama.cpp u otros runners compatibles con GGUF.

La licencia es Apache 2.0 y el único idioma declarado es el inglés. El repositorio ocupa 84,7 GB e incluye múltiples cuantizaciones. Es un modelo de propósito creativo, con sesgo negativo declarado por el autor, y no está orientado a tareas de razonamiento técnico, código o matemáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Mistral Nemo), modelo fusionado mediante mergekit (DARE TIES) |
| Parametros totales | 12.247.782.400 (12,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k+ (131.000+) segun el autor; hasta 1 millon declarado |
| Tipos de cuantizacion | GGUF en multiples niveles (incluye Q2_K, Q3_K_M, Q4_K_M, Q8, entre otros) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo); el modelo base en bfloat16 |
| Tamano del repo | 84,7 GB |
| Modelo base | DavidAU/MN-Dark-Planet-TITAN-12B |
| Plantillas soportadas | Mistral Instruct y Alpaca |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Mistral Nemo (12B) que no se entrena desde cero, sino que se obtiene mediante fusión de pesos. Concretamente, el autor indica una fusión DARE TIES en dos etapas con 240 puntos de ajuste, partiendo de tres modelos: TheDrummer/Rocinante-12B-v1.1, anthracite-org/magnum-v2.5-12b-kto y nothingiisreal/MN-12B-Celeste-V1.9. El objetivo declarado es "injertar" y fusionar partes de cada modelo para maximizar sus fortalezas en lugar de promediarlas.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni sobre si hubo RLHF o DPO en esta ficha; esos detalles pertenecen a los modelos base y no se documentan aquí. La innovación técnica principal es el propio proceso de fusión y la estabilidad resultante, que el autor destaca como excepcionalmente comprimible: la perplejidad se mantiene baja tras cuantización (Q4_K_M: 6,7875; Q8: 6,6266). El modelo se distribuye en bfloat16 en su versión base y en GGUF en este repositorio.

## Capacidades

- Generación de texto creativo: ficción, prosa vívida, descripción de escenas y diálogos.
- Generación de tramas y subtramas, continuación de escenas y storytelling en todos los géneros (ciencia ficción, romance, terror, etc.).
- Roleplay (RP) y conversación multi-turno con sesgo hacia tono oscuro o negativo.
- Escritura de ficción con control de estilo mediante instrucciones en el prompt (por ejemplo, indicaciones como "vivid horror").
- Soporte de plantillas Mistral Instruct y Alpaca para formateo de instrucciones.
- Operación estable con temperaturas muy altas (de 0,01 a 4 o superior) según el autor.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Escritura de ficción y relatos: el modelo genera prosa detallada y vívida, adecuada para autores que necesitan borradores de escenas o capítulos con estilo literario marcado.
- Generación de tramas y subtramas: útil para guionistas y novelistas que quieren explorar líneas argumentales alternativas, aprovechando su entrenamiento específico en plot generation.
- Roleplay interactivo: gracias a su ventana de contexto larga (128k+) puede mantener conversaciones de rol extensas con memoria de eventos previos, aunque con el sesgo negativo declarado.
- Continuación de escenas: para escritores que necesitan extender un texto existente manteniendo tono y estilo, usando plantilla Alpaca para salidas más largas.
- Creación de contenido de terror o suspense: el autor indica que se puede forzar el estilo con instrucciones explícitas en el prompt, lo que lo hace adecuado para narrativa oscura.
- Prototipado creativo en local: al distribuirse en GGUF y con cuantizaciones de bajo peso, permite experimentar en equipos de consumo sin infraestructura de servidor.
- Asistencia a escritores en bloqueo creativo: generar variaciones de una misma escena con distintas temperaturas para inspirar al autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas de perplejidad:

| Metrica | Valor |
|---|---|
| Perplejidad Q4_K_M | 6,7875 |
| Perplejidad Q8 | 6,6266 |

No se proporcionan datos de MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: para un modelo de 12,2B en GGUF, una cuantización Q4_K_M ronda los 7-8 GB de VRAM; Q8 se aproxima a 13 GB; las cuantizaciones Q2/Q3 bajan de 6 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q8 con holgura; RTX 3090/4080 (16-24 GB) para Q4/Q5; GPUs de 8-12 GB para cuantizaciones bajas.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más usando Q4 o inferior; en 24 GB cabe en Q8.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, así como runners compatibles con GGUF; el autor menciona compatibilidad con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota del autor: las cuantizaciones Q2_K y Q3 pueden requerir temperaturas más bajas (4 o menos; 1 o menos para Q2_K) por la compresión excesiva.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MN-Dark-Planet-TITAN-12B | 12,2B | 128k+ | Ficción, roleplay, prosa vívida | Apache 2.0 | GGUF en HF |
| TheDrummer/Rocinante-12B-v1.1 | 12B (Mistral Nemo) | no disponible | Roleplay y ficción | no disponible | HF |
| anthracite-org/magnum-v2.5-12b-kto | 12B (Mistral Nemo) | no disponible | Roleplay, ajuste KTO | no disponible | HF |
| nothingiisreal/MN-12B-Celeste-V1.9 | 12B (Mistral Nemo) | no disponible | Ficción creativa | no disponible | HF |

Los tres modelos de comparación son los componentes base de la fusión, por lo que comparten familia y tamaño; no se dispone de datos de rendimiento comparativo publicados en esta ficha.

## Limitaciones y advertencias

- Sesgo negativo declarado por el autor: el modelo no está diseñado para finales felices y tiende a tonos oscuros.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Idioma limitado al inglés; no se garantiza calidad en castellano u otros idiomas.
- Contexto declarado de 128k+ y hasta 1 millón, pero sin verificación independiente; el rendimiento real en contextos muy largos puede degradarse.
- Las cuantizaciones muy agresivas (Q2_K, Q3) dañan el modelo y requieren temperaturas bajas, según el autor.
- El modelo no está orientado a código, matemáticas, razonamiento técnico ni tool calling; su uso en producción para esas tareas no es recomendable.
- Contenido potencialmente sensible: el autor etiqueta el modelo con "swearing" y temática de terror; requiere moderación si se expone a usuarios finales.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado debe revisarse por posibles sesgos y por la naturaleza creativa del modelo.
- Diferentes cuantizaciones producen salidas ligeramente distintas, lo que afecta a la reproducibilidad.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/DavidAU/MN-Dark-Planet-TITAN-12B-GGUF
- Modelo base: https://huggingface.co/DavidAU/MN-Dark-Planet-TITAN-12B
- Perfil del autor: https://huggingface.co/DavidAU
- Guía de parámetros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Modelo componente: https://huggingface.co/TheDrummer/Rocinante-12B-v1.1
- Modelo componente: https://huggingface.co/anthracite-org/magnum-v2.5-12b-kto
- Modelo componente: https://huggingface.co/nothingiisreal/MN-12B-Celeste-V1.9
