# MuXodious/Qwen3.8-27B-absolute-heresy-LoRA-GGUF

## Resumen

MuXodious/Qwen3.8-27B-absolute-heresy-LoRA-GGUF es un adaptador LoRA cuantizado en formato GGUF que aplica una técnica de abliteración (eliminación de censura) sobre el modelo base Qwen3.8-27B de Alibaba. El adaptador original, creado con el motor Heretic v1.4.0, reduce drásticamente los rechazos del modelo ante peticiones que normalmente activarían respuestas de negativa, pasando de 101 rechazos sobre 101 pruebas a solo 2 sobre 101, con una divergencia KL de 0,0759 respecto al modelo original. Esta versión GGUF permite cargar el adaptador directamente en motores de inferencia compatibles con LoRA en formato GGUF, como llama.cpp, sin necesidad de fusionar pesos.

El modelo resultante conserva las capacidades del Qwen3.8-27B original, un transformer denso multimodal de 27 mil millones de parámetros optimizado para tareas de código, agentes y automatización de oficina. La LoRA en sí tiene 69,2 millones de parámetros y un tamaño de repositorio de 0,4 GB, lo que la hace ligera de distribuir. Su relevancia radica en ofrecer una alternativa "sin censura" para desarrolladores que necesitan respuestas directas en entornos controlados, aunque con las advertencias éticas y legales correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen3.8-27B (transformer denso multimodal) |
| Parametros totales | 69.206.016 (adaptador); 27B (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF estatico (se recomienda usar la version F32) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El adaptador se obtiene mediante abliteración, una técnica que identifica y elimina direcciones en el espacio de activaciones del modelo asociadas con comportamientos de rechazo o negativa. En este caso se usó el motor Heretic v1.4.0 con parámetros específicos de poda sobre las capas de atención (`attn.o_proj`) y MLP (`mlp.down_proj`), como se detalla en la model card. El resultado es una LoRA que, al aplicarse sobre el Qwen3.8-27B base, reduce los rechazos de 101/101 a 2/101 manteniendo una divergencia KL de 0,0759, lo que indica que el comportamiento general del modelo apenas se altera fuera de las respuestas de negativa.

Los datos de entrenamiento no se especifican en la información disponible. La versión GGUF es una cuantización estática del adaptador LoRA, diseñada para cargarse en tiempo de inferencia mediante argumentos como `--lora LoRA.gguf` en CLI o `lora = LoRA.gguf` en presets de modelos, sin necesidad de fusionar los pesos con el modelo base.

## Capacidades

- Eliminación de censura: reduce los rechazos de 101/101 a 2/101 en las pruebas reportadas, permitiendo respuestas directas a peticiones que el modelo original bloquea.
- Conserva las capacidades del Qwen3.8-27B base: razonamiento, generación de código, tareas de agente, automatización de oficina y procesamiento multimodal (imagen y texto).
- Se aplica como adaptador en tiempo de inferencia, sin modificar los pesos del modelo base.
- Compatible con motores que soporten LoRA en formato GGUF (llama.cpp y derivados).
- Mantiene la licencia Apache 2.0 del modelo base, permitiendo uso comercial con las restricciones habituales.

## Casos de uso

- Escritura creativa sin restricciones: novelas, guiones o contenido narrativo que requiera explorar temas que los modelos censurados evitan. El adaptador permite que el modelo responda sin negativas automáticas.
- Roleplay y juegos de texto: asistentes para juegos de rol donde el usuario espera respuestas inmersivas y sin cortapisas morales predefinidas.
- Investigación en seguridad de IA: estudiar cómo la abliteración afecta al comportamiento del modelo, comparando respuestas antes y después de aplicar el adaptador.
- Generación de contenido para adultos: aplicaciones de entretenimiento para mayores de edad, siempre que se cumplan las normativas legales del país de uso.
- Asistentes personales sin filtros: herramientas de productividad que requieren respuestas directas y sin evasivas, por ejemplo en entornos de desarrollo donde se pide al modelo que critique código sin ambages.
- Pruebas de robustez y sesgos: evaluar si la eliminación de censura introduce sesgos adicionales o afecta a la calidad de las respuestas en dominios técnicos.

## Benchmarks y rendimiento

La model card reporta las siguientes métricas comparativas entre el modelo con el adaptador y el Qwen3.8-27B original:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0,0759 | 0 (por definicion) |
| Rechazos (refusals) | 2/101 | 101/101 |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador GGUF ocupa 0,4 GB, pero para inferencia se necesita cargar el modelo base Qwen3.8-27B completo, cuyos requisitos de VRAM dependen de la cuantización elegida.
- Para una cuantización de 4 bits del modelo base, se estiman entre 16 y 20 GB de VRAM, lo que permite ejecución en GPUs como RTX 4090, A100 (40 GB) o H100. No se dispone de datos exactos para este adaptador específico.
- El adaptador se aplica en tiempo de inferencia, por lo que el consumo adicional de memoria es mínimo (menos de 1 GB).
- Opciones de despliegue: llama.cpp y cualquier motor compatible con LoRA GGUF (Ollama, LM Studio, etc.). También se puede fusionar el adaptador con el modelo base para usar vLLM o TGI, aunque no se indica en la documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos "uncensored" o "abliterated" de características similares. El adaptador se basa en Qwen3.8-27B, que compite con otros modelos densos de 27B como Llama 3.3 70B (superior en tamaño) o Mistral Large, pero la abliteración es una técnica ortogonal al rendimiento general. Se recomienda evaluar el modelo en el caso de uso concreto antes de decidir.

## Limitaciones y advertencias

- La abliteración elimina los rechazos, pero no garantiza la veracidad ni la seguridad del contenido generado. El modelo puede producir respuestas incorrectas, sesgadas o dañinas.
- Riesgo de alucinación: al eliminar la censura, el modelo podría afirmar información falsa con mayor confianza, sin los mecanismos de autoprotección del original.
- Sesgos conocidos: no se han documentado estudios específicos sobre sesgos tras la abliteración; el modelo base ya presenta sesgos inherentes a sus datos de entrenamiento.
- Limitaciones de contexto e idioma: no se especifican, pero el Qwen3.8-27B base es multilingüe y multimodal; el adaptador no altera estas capacidades.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a regulaciones locales sobre discurso, pornografía o incitación al odio. El responsable del despliegue debe asumir las consecuencias legales.
- Advertencia para producción: el adaptador es experimental, como indica el autor ("This is rather experimental"). No se recomienda su uso en entornos donde se requiera moderación de contenido o cumplimiento normativo estricto.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/MuXodious/Qwen3.8-27B-absolute-heresy-LoRA-GGUF
- Modelo LoRA original (sin cuantizar): https://huggingface.co/MuXodious/Qwen3.8-27B-absolute-heresy-LoRA
- Repositorio del modelo base Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Proyecto Heretic: https://heretic-project.org
