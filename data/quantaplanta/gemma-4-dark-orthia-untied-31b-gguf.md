# QuantaPlanta/Gemma-4-Dark-Orthia-Untied-31B-GGUF

## Resumen

Gemma-4-Dark-Orthia-Untied-31B-GGUF es una cuantizacion en formato GGUF del modelo Nimbz/Gemma-4-Dark-Orthia-Untied-31B, publicada por el usuario QuantaPlanta en Hugging Face. Se trata de un modelo de 31B parametros (32.106.631.740 exactos segun safetensors) basado en la familia Gemma-4, creado mediante tecnicas de merge con mergekit y orientado especificamente a roleplay, escritura creativa, narrativa y conversacion, con un perfil de bajas restricciones (low-refusal) y contenido para adultos.

La caracteristica tecnica mas distintiva, reflejada en el propio nombre y en las etiquetas, es el uso de lm_head "untied" (desacoplado de la matriz de embeddings de entrada), una modificacion frecuente en merges orientados a escritura que puede mejorar la calidad estilistica de la generacion. El modelo se distribuye bajo licencia Apache 2.0 y el repositorio pesa 467,6 GB, lo que indica que incluye multiples cuantizaciones de distinto tamano.

Su relevancia actual radica en la comunidad de roleplay y escritura creativa local, donde los merges sobre bases Gemma de gran tamano son una categoria muy activa. Con casi 3.700 descargas en pocos dias, es un modelo de nicho pero con traccion temprana en su segmento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma-4), con lm_head desacoplado (untied) |
| Parametros totales | 32.106.631.740 (~31B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no detalladas en la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado desde safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo base, Nimbz/Gemma-4-Dark-Orthia-Untied-31B, es un merge realizado con mergekit sobre la arquitectura Gemma-4 de ~31B parametros. La etiqueta "untied-lm_head" indica que la matriz de proyeccion de salida (lm_head) no comparte pesos con la matriz de embeddings de entrada, una practica habitual en merges de escritura creativa para dotar de mayor libertad al decodificador del vocabulario. No se ha publicado informacion sobre el metodo de merge concreto (linear, SLERP, task arithmetic, etc.) ni sobre los modelos donantes.

No hay datos publicados sobre el proceso de entrenamiento o ajuste fino posterior: numero de tokens, composicion del dataset, uso de RLHF/DPO o tecnicas de destilacion. El perfil "dark" y "low-refusal" sugiere un ajuste orientado a reducir los rechazos del modelo base en temas sensibles, pero no constan detalles tecnicos al respecto. Este repositorio concreto es una cuantizacion GGUF del modelo base, sin entrenamiento adicional.

## Capacidades

- Generacion de texto creativo: narrativa, storytelling y escritura de ficcion, que es el foco principal del merge.
- Roleplay de personajes (character RP): mantenimiento de personajes coherentes en conversaciones largas.
- Conversacion general multi-turno.
- Contenido sin censura o con bajas restricciones (low-refusal), incluyendo tematica para adultos (nsfw).
- No hay informacion publicada sobre tool calling, agentes, razonamiento estructurado, capacidades de vision o audio.

## Casos de uso

- Roleplay interactivo en frontales locales: el modelo puede usarse en aplicaciones como SillyTavern o interfaces similares para sesiones de roleplay de personajes, gracias a su orientacion explicita a character-rp y conversacion.
- Escritura de ficcion oscura: generacion de relatos con tematica madura o sombria donde los modelos alineados estandar tienden a rechazar el contenido; su perfil low-refusal lo hace adecuado.
- Narrativa colaborativa: el usuario actua como coautor y el modelo continua la historia manteniendo tono y estilo en turnos largos.
- Creacion de dialogos de personajes para videojuegos o novelas visuales: generacion de lineas de dialogo coherentes con la voz de cada personaje.
- Superacion del bloqueo de escritor: generacion de alternativas y continuaciones de escenas como herramienta de brainstorming narrativo.
- Experimentacion local sin coste de API: al ser GGUF bajo Apache 2.0, puede desplegarse en infraestructura propia para estudiar el comportamiento de merges untied en escritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un merge orientado a escritura creativa y roleplay, es habitual que este tipo de modelos no se evalue con benchmarks academicos estandar (MMLU, GSM8K, HumanEval).

## Requisitos de hardware

- VRAM estimada: con ~31B parametros, una cuantizacion Q4_K_M ocupa aproximadamente 19-20 GB; Q8_0 alrededor de 33-34 GB; FP16 en torno a 62-64 GB. El tamano total del repositorio (467,6 GB) indica que incluye cuantizaciones muy variadas, posiblemente hasta altisimas precisiones.
- GPU recomendadas: para cuantizaciones Q4, una RTX 3090 o RTX 4090 de 24 GB permite inferencia completa en GPU; para precisiones altas se requieren A100 80GB, H100 o multiples GPUs.
- Consumer GPUs: cabe en una RTX 3090/4090 (24 GB) con cuantizaciones Q4, o parcialmente descargado a RAM en equipos con 32-64 GB de memoria mediante offloading en llama.cpp.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF directamente y requeririan los pesos del modelo base en safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Foco |
|---|---|---|---|---|
| QuantaPlanta/Gemma-4-Dark-Orthia-Untied-31B-GGUF | ~31B | GGUF | Apache 2.0 | Roleplay, escritura creativa, low-refusal |
| Nimbz/Gemma-4-Dark-Orthia-Untied-31B (base) | ~31B | safetensors | Apache 2.0 | Mismo modelo sin cuantizar |
| Merges RP sobre Gemma de 27-32B (categoria general) | 27-32B | GGUF/safetensors | Variable | Roleplay y escritura creativa |

No hay datos de rendimiento comparativo publicados, por lo que la comparacion se limita a categoria, tamano y licencia.

## Limitaciones y advertencias

- Contenido para adultos y sin filtro: el modelo esta etiquetado explicitamente como nsfw y not-for-all-audiences; no es adecuado para entornos profesionales, educativos o de acceso publico sin moderacion.
- Riesgo de alucinacion: al ser un merge orientado a ficcion y con bajas restricciones, no es fiable para tareas factuales, y probablemente sea mas propenso a inventar contenido que un modelo alineado generalista.
- Al ser un merge, hereda los sesgos de todos los modelos donantes, cuya combinacion puede producir comportamientos impredecibles; no hay documentacion sobre auditoria de sesgos.
- Idiomas: no consta soporte oficial de castellano; la base Gemma-4 es multilingue, pero la calidad en castellano depende de los datos del merge y no esta documentada.
- Contexto: la longitud de ventana no esta publicada; verificala en la configuracion del modelo base antes de planificar sesiones largas de roleplay.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede requerir moderacion legal segun jurisdiccion, especialmente al tratarse de un modelo low-refusal.
- Repositorio de 467,6 GB: la descarga completa es costosa; descarga solo la cuantizacion concreta que necesites.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/QuantaPlanta/Gemma-4-Dark-Orthia-Untied-31B-GGUF
- Modelo base: https://huggingface.co/Nimbz/Gemma-4-Dark-Orthia-Untied-31B

No se han encontrado enlaces adicionales (papers, blogs, demos) en la informacion disponible.
