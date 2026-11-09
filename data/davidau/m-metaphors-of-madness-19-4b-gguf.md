# DavidAU/M-Metaphors-Of-Madness-19.4B-GGUF

## Resumen

M-Metaphors-Of-Madness-19.4B (conocido como "M.O.M") es un modelo de lenguaje especializado en escritura creativa y prosa, desarrollado por DavidAU y publicado bajo licencia Apache 2.0. Se trata de un merge de modelos construido mediante mergekit sobre una base Mistral, pensado para generar ficción, narración, poesía, guiones y roleplay con un estilo de prosa muy marcado, caracterizado por descripciones densas y un uso intensivo de metáforas.

El modelo parte de la fusión de "Bagel 7B" y "Multiverse 7B" para dar lugar a un modelo intermedio de 11B, al que posteriormente se le incorpora "Brainstorm 40x" para escalar hasta los 19.456.004.096 parámetros (aproximadamente 19,4B), con 88 capas y 795 tensores. La arquitectura es de tipo transformer denso (no MoE) basada en Mistral, con una longitud de contexto máxima declarada de 32k tokens, ampliable a 128k o más mediante RoPE scaling.

Su relevancia radica en ser un modelo de nicho orientado a la creatividad y la narrativa, no a tareas de razonamiento o código. Está disponible en formato GGUF con múltiples cuantizaciones, lo que permite su despliegue en hardware de consumo, y su model card documenta con detalle parámetros de muestreo recomendados (temperatura, repetition penalty, smoothing) para obtener resultados utilizables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Mistral (merge via mergekit) |
| Parametros totales | 19.456.004.096 (aprox. 19,4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32k tokens (128k+ con RoPE scaling) |
| Tipos de cuantizacion | GGUF en varias cuantizaciones (incluye Q2K, IQ4XS, Q4+; tambien quants ARM) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base en safetensors/bfloat16 |

## Arquitectura y entrenamiento

El modelo es el resultado de un proceso de merging con mergekit, no de un entrenamiento desde cero. Segun la model card, se combinaron "Bagel 7B" y "Multiverse 7B" para producir un modelo de 11B, al que se anadio "Brainstorm 40x" para extenderlo hasta 19,45B, con 88 capas y 795 tensores. La base arquitectonica es Mistral, un transformer denso con atencion por ventanas deslizantes y RoPE, lo que explica el contexto declarado de 32k tokens ampliable mediante ajuste de RoPE.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. El autor no documenta detalles del proceso de alineamiento; el enfasis esta en el comportamiento estilistico resultante del merge (prosa exagerada, metaforas, dialogos extensos) y en las recomendaciones de muestreo para controlarlo. El modelo se distribuye con pesos en bfloat16 en su version fuente y en GGUF en este repositorio.

## Capacidades

- Generacion de texto creativo: ficcion, relatos cortos, novelas, poesia, canciones y guiones.
- Generacion de tramas y subtramas, continuacion de escenas y desarrollo narrativo.
- Escritura vivida con descripciones densas y uso intensivo de metaforas especificas de escena, entorno y personaje.
- Roleplay y conversacion, aunque el autor advierte que puede resultar un recorrido "peculiar".
- Capacidad de seguir instrucciones de estilo anadidas al prompt (por ejemplo, "frases cortas y secas"), algo que el autor senala como inusual en este tipo de modelo.
- Soporte de plantillas Alpaca, Mistral y ChatML.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues limitadas al ingles segun los metadatos del modelo.

## Casos de uso

- Generacion de ficcion y relatos: el modelo esta disenado para producir narrativa extensa con descripciones ricas; se usaria con plantilla Alpaca o ChatML y temperatura entre 0,5 y 0,8 para obtener prosa controlada.
- Continuacion de escenas en proyectos de escritura: gracias a su contexto de 32k tokens puede mantener coherencia sobre pasajes largos y continuar una escena a partir de un fragmento previo.
- Generacion de tramas y subtramas para guionistas o escritores: util para explorar variantes argumentales, ya que el autor recomienda 2-5 regeneraciones por prompt para obtener el mejor resultado.
- Poesia y letras de canciones: el estilo metaforico del modelo encaja con composiciones liricas y experimentacion estilistica.
- Roleplay y entretenimiento conversacional: puede usarse en interfaces como SillyTavern o KoboldCpp, con limite duro de generacion y ajuste de smoothing para mantener la coherencia.
- Brainstorming creativo y "lluvia de ideas" narrativa: util para generar material de partida que luego se refine manualmente, dado su caracter impredecible entre regeneraciones.
- Prototipado de asistentes de escritura con estilos muy marcados: permite evaluar como responde un modelo de nicho a instrucciones de estilo antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo denso de 19,4B en GGUF requiere aproximadamente 11-12 GB en cuantizacion Q4, 8-9 GB en Q3 y 5-6 GB en Q2K; en Q8 se aproxima a 20-21 GB y en bfloat16 completa a unos 39 GB.
- GPU recomendadas: A100 40/80 GB o H100 para la version bfloat16 completa; RTX 4090 (24 GB) para Q8 o Q6; RTX 3090/4080 (16-24 GB) para Q4-Q6; GPUs de 8-12 GB para Q2-Q4 con posible offload a CPU.
- Cabe en GPU de consumo: si, en cuantizaciones Q2 a Q6 segun la VRAM disponible; el autor recomienda Q4 o superior para mantener la calidad de detalle y matices.
- Opciones de despliegue: llama.cpp, KoboldCpp, Ollama, text-generation-webui (con loader llama_HF y archivos de configuracion del modelo fuente) y SillyTavern para roleplay. Tambien existen quants especificos para ARM.
- Latencia y throughput: no disponibles de forma oficial; el autor advierte que los quants ARM son muy lentos en equipos convencionales.
- Ajustes recomendados: temperatura 0,5-0,8, repetition penalty 1,02-1,05 (subir gradualmente), contexto minimo de 4k, y smoothing_factor de 1,5-2,5 en las interfaces que lo soporten.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| M-Metaphors-Of-Madness-19.4B | 19,4B | 32k (128k+ con RoPE) | Prosa creativa, ficcion, roleplay | Apache 2.0 | GGUF en HF |
| Mistral 7B (base) | 7,2B | 32k | Proposito general | Apache 2.0 | Multiples formatos |
| Modelos de ficcion basados en Mistral (merges de la comunidad) | Variable (7B-20B) | 8k-32k | Escritura creativa y roleplay | Variable | GGUF en HF |
| Modelos densos de ~20B de proposito general | ~20B | 4k-32k | Razonamiento, codigo, chat | Variable | Multiples formatos |

La comparativa con alternativas concretas no esta disponible en la informacion proporcionada; los modelos de la tabla son referencias genericas de categoria.

## Limitaciones y advertencias

- El autor advierte explicitamente de que el modelo puede generar "locura", prosa purpura, violencia comica y exageracion narrativa; no es adecuado para usos que requieran respuestas sobrias o factuales.
- Alta variabilidad entre regeneraciones: el mismo prompt puede producir resultados muy distintos, por lo que el autor recomienda 2-5 regeneraciones para obtener la mejor salida.
- Riesgo elevado de alucinacion en contextos factuales; el modelo esta orientado a ficcion, no a recuperacion de informacion.
- Idiomas: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede incluir lenguaje soez o temas sensibles segun el prompt.
- Requiere ajuste cuidadoso de parametros (temperatura, repetition penalty, smoothing) para evitar bucles y degradacion de la prosa.
- Las cuantizaciones bajas (Q2K) pierden calidad y pueden requerir ajustes adicionales de temperatura y repetition penalty.
- No dispone de soporte documentado de tool calling, agentes ni vision, lo que limita su uso en pipelines automatizados complejos.
- El modelo base y los archivos de configuracion deben descargarse del repositorio fuente para su uso en text-generation-webui con GGUF.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/DavidAU/M-Metaphors-Of-Madness-19.4B-GGUF
- Modelo base: https://huggingface.co/DavidAU/M-Metaphors-Of-Madness-19.4B
- Perfil del autor: https://huggingface.co/DavidAU
- Coleccion de archivos fuente para GGUF/EXL2/AWQ/GPTQ/HQQ: https://huggingface.co/collections/DavidAU/d-au-source-files-for-gguf-exl2-awq-gptq-hqq-etc-etc-66b55cb8ba25f914cbf210be
- Guia de rendimiento y parametros del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Paper de referencia (arXiv 2401.02415): https://arxiv.org/abs/2401.02415
