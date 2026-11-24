# Ateron/Gemma-4-GemClone-31B

## Resumen

Gemma-4-GemClone-31B es un modelo de lenguaje de 31.273.088.876 parámetros (aproximadamente 31,3 mil millones) creado por Ateron mediante la fusión de seis modelos derivados de la familia Gemma 4. No se trata de un modelo entrenado desde cero, sino de un *merge* generado con mergekit que combina los pesos de seis checkpoints previos del mismo autor y de Blazed-Forge, todos ellos orientados a escritura creativa, rol y narrativa. El resultado se publica bajo licencia Apache 2.0 y en formato safetensors con pesos en bfloat16.

El modelo está etiquetado como `roleplay`, `text-generation` y `conversational`, y su idioma declarado es únicamente el inglés. La model card es deliberadamente escueta: describe el proceso de fusión en tres fases (dos recetas `dare_ties` y una final `model_stock`) pero no aporta información sobre el entrenamiento original, la longitud de contexto, los datos utilizados ni evaluaciones de rendimiento. Su relevancia es, por tanto, la de un experimento de la comunidad de *merges* orientado a la generación creativa y conversacional en inglés, no la de un modelo de propósito general con garantías documentadas.

Dado que el repositorio no incluye benchmarks ni especificaciones detalladas más allá de los parámetros y la licencia, esta ficha marca explícitamente como "no disponible" todos aquellos datos que no aparecen en la información proporcionada, en lugar de inferirlos a partir de la familia Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de la familia Gemma 4; detalles no disponibles) |
| Parametros totales | 31.273.088.876 (~31,3 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; los pesos se publican en bfloat16 (f16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado de forma directa: es el producto de una fusión de pesos (*model merging*) realizada con mergekit sobre la base `Gemma-4-it`. La receta documentada consta de tres fases. En la fase 1 se aplica `dare_ties` con `lambda: 1.0`, `density: 0.42` y `weight: 0.42` sobre tres modelos (Gemma-4-Writers-V2, Gemma-4-SphinsikusChronist y Gemma-4-Novelist-Eclipse). En la fase 2 se repite la misma configuración `dare_ties` sobre otros tres modelos (Gemma-4-MoonGem, Gemma-4-Dark-Thoughts-V2 y Gemma-4-AssGuard-31B). La fase 3 combina los dos resultados intermedios (GemCloneP1 y GemCloneP2) mediante `model_stock`, tomando `Gemma-4-it` como base y el tokenizador del modelo base en todas las fases.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias en los modelos de origen. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) más allá de la propia metodología de fusión. `dare_ties` es una variante de TIES merging que poda los deltas de los parámetros y resuelve los conflictos de signo antes de combinar, mientras que `model_stock` realiza una combinación lineal de los pesos de los modelos de entrada; ambos son métodos estándar de la literatura de *model merging*.

## Capacidades

- Generación de texto conversacional y creativo en inglés, con orientación declarada a rol y narrativa.
- Escritura de ficción y narrativa: los modelos de origen están etiquetados como "Writers", "Novelist" y "Chronist", lo que sugiere especialización en prosa y diálogo.
- Personificación de personajes y mantenimiento de rol en conversaciones multi-turno (etiqueta `roleplay`).
- Generación de texto condicionada por un estilo o persona, heredada de la fusión de múltiples checkpoints con estilos distintos.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo de razonamiento (*thinking mode*).

## Casos de uso

- Escritura creativa asistida: el modelo puede generar borradores de relatos, capítulos o escenas a partir de una premisa, aprovechando la fusión de checkpoints orientados a narrativa (Writers, Novelist, Chronist) para producir prosa con estilo consistente.
- Roleplay y personajes conversacionales: adecuado para aplicaciones de chat con personas virtuales donde se requiere mantener un registro de voz y una personalidad estable a lo largo de la conversación.
- Generación de diálogos para guiones y videojuegos: puede producir líneas de diálogo para personajes no jugadores, con variación de tono según el contexto narrativo.
- Asistencia a la escritura de ficción interactiva: integrado en herramientas de escritura ramificada, el modelo puede continuar escenas y proponer alternativas narrativas coherentes con el texto previo.
- Prototipado de chatbots de entretenimiento: para demos y pruebas de concepto de asistentes con personalidad, sin necesidad de un modelo de propósito general.
- Experimentación en investigación sobre *model merging*: sirve como caso de estudio reproducible de una fusión en tres fases con `dare_ties` y `model_stock`, útil para estudiar cómo se combinan estilos y comportamientos de checkpoints distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16/fp16: aproximadamente 62,5 GB solo para los pesos (31,3 B × 2 bytes), más el espacio para el KV cache y las activaciones, por lo que se recomienda un mínimo de 80 GB de VRAM para contexto corto.
- Cuantización a 8 bits: en torno a 31-35 GB de VRAM, viable en una GPU de 40-48 GB (A100 40 GB, A6000, L40S).
- Cuantización a 4 bits (GGUF/AWQ/GPTQ): en torno a 16-20 GB de VRAM, lo que permite ejecución en GPUs de consumo alto como la RTX 4090 (24 GB) o la RTX 3090 (24 GB).
- GPU recomendadas para fp16: A100 80 GB, H100 80 GB, H200; para cuantización 4-8 bits: RTX 4090, RTX 3090, A6000, L40S.
- Cabe en GPU de consumo únicamente con cuantización de 4 bits o inferior; en fp16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: llama.cpp y Ollama para cuantizaciones GGUF; vLLM y TGI para fp16 en hardware de datacenter; transformers como opción de referencia.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Gemma-4-GemClone-31B | ~31,3 B | no disponible | apache-2.0 | en | Merge de seis checkpoints; sin benchmarks publicados |
| Gemma-4-it (modelo base) | no disponible | no disponible | no disponible en la información | no disponible | Base declarada de la fusión |
| Gemma-4-Sphinsikus-Chronist-31B | ~31 B (por nombre) | no disponible | no disponible en la información | no disponible | Uno de los seis modelos fusionados |
| Gemma-4-Writers-31B-V2 | ~31 B (por nombre) | no disponible | no disponible en la información | no disponible | Uno de los seis modelos fusionados |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia e idioma declarados.

## Limitaciones y advertencias

- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Sesgos: no documentados por el autor; al ser una fusión de checkpoints de rol y narrativa, puede reproducir sesgos de estilo y contenido de los modelos de origen.
- Alucinación: sin evaluaciones publicadas; al estar orientado a ficción y rol, la propensión a inventar hechos es estructural y no debe usarse como fuente factual.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar aplicaciones con ventanas largas sin verificación empírica.
- Licencia: Apache 2.0 permite uso comercial, pero las licencias de los modelos de origen y de la base Gemma-4-it no se detallan en la información disponible; conviene verificar la compatibilidad antes de un despliegue comercial.
- Producción: sin benchmarks, sin ficha de datos de entrenamiento y con un solo *like* y cero descargas en el momento de la consulta, el modelo no ofrece garantías de calidad ni de estabilidad para entornos productivos.
- Formato: solo se publican pesos safetensors en bfloat16; no hay cuantizaciones oficiales GGUF ni AWQ/GPTQ en el repositorio, por lo que habría que generarlas.

## Enlaces

- Hugging Face: https://huggingface.co/Ateron/Gemma-4-GemClone-31B
- Modelo base declarado: https://huggingface.co/Blazed-Forge/Gemma-4-Sphinsikus-Chronist-31B
- Modelos fusionados: https://huggingface.co/Ateron/Gemma-4-Novelist-Eclipse-31B
- Modelos fusionados: https://huggingface.co/Ateron/Gemma-4-Writers-31B-V2
- Modelos fusionados: https://huggingface.co/Ateron/Gemma-4-Dark-Thoughts-V2-31B
- Modelos fusionados: https://huggingface.co/Ateron/Gemma-4-MoonGem-31B
- Modelos fusionados: https://huggingface.co/Ateron/Gemma-4-AssGuard-31B
- Herramienta de fusión: https://github.com/arcee-ai/mergekit
