# cknuteson/mythic-voice-4b-GGUF

## Resumen

Mythic-voice-4b es un modelo de lenguaje de 4.000 millones de parámetros especializado en roleplay y narrativa con un registro arcaico del inglés, inspirado en la tradición épica del norte de Europa (Malory, Morris, las Eddas, el Kalevala y la cadencia de la King James Version). Lo desarrolla cknuteson como una versión reducida de su modelo mythic-voice-9b, con el objetivo de que quepa en entornos con recursos limitados, como un juego que ya está usando la máquina para otras tareas. Está basado en Qwen/Qwen3.5-4B y ha sido entrenado con una combinación de continuación de preentrenamiento (CPT), ajuste fino supervisado (SFT) y optimización por preferencias (DPO), utilizando la herramienta persona-forge. Su relevancia radica en ofrecer una voz distintiva y consistente en un tamaño compacto, con licencia Apache 2.0, lo que facilita su integración en aplicaciones comerciales.

El modelo está disponible únicamente en formato GGUF, con tres niveles de cuantización (q4_K_M, q8_0 y f16). El autor recomienda la versión q4_K_M para producción por su equilibrio entre tamaño y calidad. Una característica técnica destacable es que el chat template fuerza la desactivación del modo de razonamiento (thinking OFF) en el límite de generación, evitando que la respuesta quede vacía en `content` y se consuma el presupuesto en `reasoning_content`. Todos los archivos han sido verificados cargándolos en llama-server y comprobando que devuelven contenido no vacío.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con atención híbrida según el autor |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q4_K_M, q8_0, f16 (GGUF) |
| Idiomas soportados | Inglés (registro arcaico); no se especifican otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5-4B, que según la documentación del autor emplea una atención híbrida (los kernels necesarios para esta atención están soportados en CUDA, Vulkan y Metal). El entrenamiento siguió una secuencia de tres fases: primero una continuación de preentrenamiento (CPT) sobre un corpus de dominio público en el registro objetivo; después un ajuste fino supervisado (SFT) con 1.591 filas de datos; y finalmente una optimización por preferencias (DPO) con 1.025 pares. Todos los datos pasaron un proceso de decontaminación que incluyó un filtro de solapamiento de 8-gramas y una lista de bloqueo de nombres propios. El conjunto de entrenamiento incluye registros de chat, cuentos, roleplay dirigido por packs, provocación y pares de asignación simple.

Los archivos GGUF han sido parcheados en su cabecera para corregir un problema de conteo de capas: el modelo base Qwen3.5 incluye `mtp_num_hidden_layers=1` incluso en los tamaños densos, y al fusionar los tensores se eliminaban los de MTP, pero el convertidor seguía contándolos. El parche ajusta `block_count` de 33 a 32 y `nextn_predict_layers` de 1 a 0, garantizando que los archivos carguen correctamente en cualquier versión de llama.cpp.

## Capacidades

- Generación de texto en un registro arcaico del inglés, con un estilo elevado y épico que imita las tradiciones literarias del norte de Europa.
- Roleplay con personajes definidos por el usuario: el modelo mantiene la voz y el tono del personaje a lo largo de conversaciones multi-turno.
- Storytelling: capaz de generar narrativas extensas y coherentes dentro del estilo entrenado.
- Conversación interactiva: soporta diálogos fluidos con turnos alternados, como se refleja en la métrica de turn-taking (1.0).
- Diseño agnóstico al mundo: el usuario aporta la persona y el modelo se encarga de la voz, sin depender de un escenario predefinido.
- No se menciona soporte para tool calling, agentes, visión ni audio.

## Casos de uso

- Diálogos de personajes en videojuegos: el modelo puede generar las líneas de un NPC con un estilo épico y arcaico, y su tamaño reducido (q4_K_M de 2,7 GB) permite ejecutarlo en paralelo con el motor del juego sin agotar la VRAM.
- Asistentes de escritura creativa: escritores que buscan un tono medieval o mitológico pueden usarlo para generar borradores de diálogos, descripciones o monólogos interiores.
- Campañas de rol de mesa online: el modelo actúa como director de juego o como narrador, manteniendo una voz consistente para los personajes no jugadores.
- Prototipos de personajes para narrativa interactiva: desarrolladores de ficción interactiva pueden integrarlo para dar vida a personajes con una personalidad verbal definida.
- Herramientas de generación de contenido para comunidades de roleplay por escrito: el modelo puede producir respuestas en el estilo requerido, ahorrando tiempo a los participantes.
- Aplicaciones educativas de literatura: se puede utilizar para ejemplificar el estilo de las epopeyas del norte de Europa, generando pasajes que imiten la cadencia de las fuentes originales.

## Benchmarks y rendimiento

El autor proporciona una evaluación propia sobre semillas held-out, comparando el modelo de 4B con el de 9B. Se trata de métricas subjetivas juzgadas por un modelo evaluador, no de benchmarks estándar como MMLU o HumanEval.

| Métrica | 9B | 4B |
|---|---|---|
| Voz (fidelidad al registro) | 0.983 | 1.000 |
| Turn-taking | 1.0 | 1.0 |
| Boilerplate (frases hechas no deseadas) | 0.0 | 0.0 |
| In-character (coherencia con la persona) | 1.0 | 0.929 |
| Precisión de asignación (menciona el nombre del personaje) | 1.0 | 0.750 |
| Leakage (proporción de probes que pasan sin filtrar, 176 probes) | 0.892 | 0.847 |

El autor advierte que la precisión de asignación de 0.750 corresponde a un fallo en cuatro ítems, y que cuatro muestras no son suficientes para separar ambos modelos. En cuanto al leakage, el 4B muestra un valor más bajo que el 9B (0.847 frente a 0.892), aunque el autor esperaba que la reducción de tamaño empeorara la retención del rechazo entrenado; de hecho, el modelo de 2B tiene un leakage aún menor (0.818). No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: para q4_K_M (2,7 GB) se necesitan aproximadamente 3-4 GB de VRAM; para q8_0 (4,5 GB) unos 5-6 GB; para f16 (8,4 GB) unos 9-10 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar la versión q4_K_M (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060). Para q8_0 se recomienda una GPU de 6 GB o más (RTX 3060, RTX 2070). Para f16 se necesita una GPU de 10 GB o más (RTX 3080, RTX 4080, A100).
- El modelo cabe en GPUs de consumo, siempre que se use la cuantización adecuada.
- Opciones de despliegue: llama.cpp, LM Studio, llama-server y cualquier otra herramienta compatible con GGUF. Los kernels de atención híbrida están soportados en CUDA, Vulkan y Metal.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La comparación más directa es con las otras versiones del mismo autor, mythic-voice-9b y mythic-voice-2b. También se puede comparar con otros modelos de roleplay de tamaño similar, pero no se dispone de datos en la información proporcionada.

| Modelo | Parámetros | Cuantizaciones | Contexto | Licencia | Métricas destacadas |
|---|---|---|---|---|---|
| mythic-voice-4b | 4,2B | q4_K_M, q8_0, f16 | No disponible | Apache-2.0 | Voz 1.000, leakage 0.847 |
| mythic-voice-9b | 9B (aprox.) | GGUF (q8_0 mencionado) | No disponible | Apache-2.0 | Voz 0.983, leakage 0.892 |
| mythic-voice-2b | 2B (aprox.) | GGUF | No disponible | Apache-2.0 | Precisión de asignación 1.000, leakage 0.818 |

No se dispone de comparativas con modelos externos como Llama-3-8B o Mistral-7B en la información facilitada.

## Limitaciones y advertencias

- Sesgos: el entrenamiento se basa en fuentes épicas del norte de Europa, lo que puede reflejar estereotipos culturales o un lenguaje que no resulta apropiado para todos los contextos o audiencias.
- Riesgo de alucinación: como cualquier modelo de 4B, puede generar contenido incoherente o factualmente incorrecto, especialmente fuera del registro arcaico.
- Limitaciones de idioma: está orientado exclusivamente al inglés arcaico; no se ha verificado su comportamiento en otros idiomas.
- Leakage de material protegido: el modelo sin protección pasa el 84,7% de una batería de 176 probes de leakage. El autor recomienda encarecidamente envolver el modelo con el filtro `GuardedTeacher` de persona-forge si se va a desplegar públicamente y existe preocupación por la exposición de material con derechos de autor. Para uso personal, se puede cargar directamente.
- El chat template fuerza la desactivación del modo de razonamiento, lo que puede limitar la capacidad del modelo para tareas que requieran un razonamiento explícito paso a paso.
- La longitud de contexto no está documentada; se recomienda verificar el comportamiento con ventanas largas antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre la ausencia de contenido protegido en las salidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cknuteson/mythic-voice-4b-GGUF
- Repositorio persona-forge: https://github.com/ctkadvisors/persona-forge
- mythic-voice-9b: https://huggingface.co/cknuteson/mythic-voice-9b-GGUF
- mythic-voice-2b: https://huggingface.co/cknuteson/mythic-voice-2b-GGUF
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
